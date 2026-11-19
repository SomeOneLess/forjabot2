// handlers/message.js
import { PREFIX, DESTINO, BOT_NAME, SETTINGS_FILE } from '../config.js';
import { jidBase, isGroupJid, readJson, writeJson } from '../utils.js';
import { trackMessage } from '../commands/top.js';
import { loadCommands } from '../commands/index.js';

let commands = null;

async function getCommands() {
  if (!commands) commands = await loadCommands();
  return commands;
}

export async function handleMessages(sock, { messages, type }) {
  if (type !== 'notify') return;

  for (const msg of messages) {
    try {
      await processMessage(sock, msg);
    } catch (e) {
      console.error('[HANDLER] Error procesando mensaje:', e);
    }
  }
}

async function processMessage(sock, msg) {
  if (!msg.message && !msg.key?.isViewOnce) return;

  const from = msg.key.remoteJid;
  const isFromMe = msg.key.fromMe;
  const sender = msg.key.participant || from;
  const text = getText(msg).trim();
  const isCmd = text.startsWith(PREFIX);

  // Log raw de posibles VO para diagnóstico
  if (msg.key?.isViewOnce || JSON.stringify(msg.message || {}).includes('viewOnce')) {
    console.log('[VO/RAW]', JSON.stringify({
      id: msg.key.id,
      fromMe: isFromMe,
      isViewOnce: msg.key.isViewOnce,
      messageStubType: msg.messageStubType,
      hasMessage: !!msg.message,
      keys: msg.message ? Object.keys(msg.message) : []
    }, null, 2));
  }

  // Track para .top (solo del día)
  if (isGroupJid(from) && sender) {
    trackMessage(from, sender);
  }

  // === REENVÍO DISCRETO DE MEDIA (especialmente View-Once) ===
  // Prioridad 1: Auto al llegar
  const mediaInfo = deepFindMedia(msg);
  if (mediaInfo && (mediaInfo.type === 'image' || mediaInfo.type === 'video' || mediaInfo.isViewOnce)) {
    console.log(`[VO/MEDIA] Detectado type=${mediaInfo.type} VO=${mediaInfo.isViewOnce} stub=${!!mediaInfo.isStub} id=${msg.key.id} fromMe=${isFromMe}`);
    if (mediaInfo.isStub) {
      console.log('[VO/MEDIA] Stub puro (sin media). WhatsApp no entregó el contenido en el upsert inicial.');
    } else {
      const buffer = await downloadMedia(sock, msg);
      if (buffer) {
        try {
        const isStatus = from === 'status@broadcast';
        let caption = `Respaldo automático (${mediaInfo.isViewOnce ? 'VO' : 'media'})`;
        if (isStatus) {
          const name = msg.pushName || msg.key.participant?.split('@')[0] || 'desconocido';
          caption = `Historia de ${name}`;
        }
        await sock.sendMessage(DESTINO, {
          [mediaInfo.type]: buffer,
          caption
        });
          console.log(`[VO/MEDIA] Reenviado exitosamente a DESTINO id=${msg.key.id}`);
        } catch (e) {
          console.error('[VO/MEDIA] Error reenviando:', e.message);
        }
      } else {
        console.log(`[VO/MEDIA] No se pudo descargar id=${msg.key.id}`);
      }
    }
  }

  // Prioridad 2: Al citar (backup manual)
  const quoted = getQuotedMessage(msg);
  const quotedId = getQuotedId(msg);
  if (quoted && quotedId) {
    const quotedMedia = deepFindMedia({ message: quoted, key: { id: quotedId } });
    if (quotedMedia && (quotedMedia.type === 'image' || quotedMedia.type === 'video')) {
      console.log(`[VO/QUOTE] Quote de media detectado quotedId=${quotedId} fromMe=${isFromMe} VO=${quotedMedia.isViewOnce}`);
      const buffer = await downloadMedia(sock, { message: quoted, key: { id: quotedId } }, quotedId);
      if (buffer) {
        try {
          await sock.sendMessage(DESTINO, {
            [quotedMedia.type]: buffer,
            caption: `Respaldo por cita (${quotedMedia.isViewOnce ? 'VO' : 'media'})`
          });
          console.log(`[VO/QUOTE] Reenviado por cita a DESTINO`);
        } catch (e) {
          console.error('[VO/QUOTE] Error reenviando quote:', e.message);
        }
      } else {
        console.log(`[VO/QUOTE] No se pudo descargar el quote ${quotedId}`);
      }
    }
  }

  // === SETTINGS Y PERMISOS ===
  const settings = await readJson(SETTINGS_FILE, {});
  const groupSettings = settings[from] || {};
  const isOwner = isFromMe; // Simplificado; se puede mejorar con OWNER_JID

  // Mute individual (normalizar por jidBase)
  if (groupSettings.muted && Array.isArray(groupSettings.muted)) {
    const senderBase = jidBase(sender);
    const isMuted = groupSettings.muted.some(m => jidBase(m) === senderBase);
    if (isMuted && !isOwner) {
      await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
      return;
    }
  }

  // .me on: solo dueño habla
  if (groupSettings.meOnly && !isOwner) {
    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
    return;
  }

  // .bot on: solo dueño usa comandos (excepto algunos)
  if (isCmd && groupSettings.botOnly && !isOwner) {
    const cmdName = text.slice(PREFIX.length).split(' ')[0].toLowerCase();
    const alwaysAllowed = ['mute', 'unmute', 'me', 'bot', 'id', 'gid', 'spam', 'ayuda', 'help'];
    if (!alwaysAllowed.includes(cmdName)) return;
  }

  // === EJECUCIÓN DE COMANDOS ===
  if (isCmd) {
    const cmdName = text.slice(PREFIX.length).split(' ')[0].toLowerCase();
    const args = text.slice(PREFIX.length + cmdName.length).trim();
    const cmds = await getCommands();
    const cmd = cmds.get(cmdName);
    if (cmd && cmd.handler) {
      try {
        await cmd.handler(sock, msg, args, { from, isFromMe, sender, isGroup: isGroupJid(from), settings: groupSettings });
      } catch (e) {
        console.error(`[CMD] Error en ${cmdName}:`, e);
        await sock.sendMessage(from, { text: `Error ejecutando comando.` }, { quoted: msg }).catch(() => {});
      }
    }
  }

  // Separador horario (cada 2h)
  // Implementar en index.js con setInterval para no bloquear
}
