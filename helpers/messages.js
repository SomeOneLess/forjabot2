// helpers/messages.js
import { downloadMediaMessage, downloadContentFromMessage, normalizeMessageContent, extractMessageContent } from '@whiskeysockets/baileys';
import { MAX_DOWNLOAD_BYTES } from '../config.js';

const mediaCache = new Map(); // msgId -> Buffer

export function getText(msg) {
  const content = extractMessageContent(msg.message) || msg.message;
  return content?.conversation || content?.extendedTextMessage?.text || content?.imageMessage?.caption || content?.videoMessage?.caption || '';
}

export function getQuotedMessage(msg) {
  const content = extractMessageContent(msg.message) || msg.message;
  return content?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

export function getQuotedId(msg) {
  const content = extractMessageContent(msg.message) || msg.message;
  return content?.extendedTextMessage?.contextInfo?.stanzaId || null;
}

/**
 * Unwrap profundo de wrappers de view-once y similares.
 */
function unwrapDeep(content) {
  if (!content || typeof content !== 'object') return null;

  // Wrappers conocidos
  const wrappers = [
    content.viewOnceMessage?.message,
    content.viewOnceMessageV2?.message,
    content.viewOnceMessageV2Extension?.message,
    content.ephemeralMessage?.message,
    content.editedMessage?.message,
    content.documentWithCaptionMessage?.message,
    content.associatedChildMessage?.message,
  ];

  for (const w of wrappers) {
    if (w) {
      const deeper = unwrapDeep(w);
      if (deeper) return deeper;
      return w;
    }
  }

  return content;
}

/**
 * Detección profunda de media (imagen/video), incluyendo VO.
 */
export function deepFindMedia(msgOrContent) {
  const raw = msgOrContent.message ? msgOrContent.message : msgOrContent;
  const content = extractMessageContent(raw) || raw;

  if (!content) return null;

  const unwrapped = unwrapDeep(content) || content;

  // Prioridad: wrappers VO
  const isFromWrapper = !!(content.viewOnceMessage || content.viewOnceMessageV2 || content.viewOnceMessageV2Extension);

  if (unwrapped.imageMessage) {
    return {
      type: 'image',
      media: unwrapped.imageMessage,
      isViewOnce: isFromWrapper || !!unwrapped.imageMessage.viewOnce || !!msgOrContent.key?.isViewOnce
    };
  }
  if (unwrapped.videoMessage) {
    return {
      type: 'video',
      media: unwrapped.videoMessage,
      isViewOnce: isFromWrapper || !!unwrapped.videoMessage.viewOnce || !!msgOrContent.key?.isViewOnce
    };
  }

  // Flag directo en el media
  if (content.imageMessage) {
    return { type: 'image', media: content.imageMessage, isViewOnce: !!content.imageMessage.viewOnce || !!msgOrContent.key?.isViewOnce };
  }
  if (content.videoMessage) {
    return { type: 'video', media: content.videoMessage, isViewOnce: !!content.videoMessage.viewOnce || !!msgOrContent.key?.isViewOnce };
  }

  // Stub / key.isViewOnce sin contenido
  if (msgOrContent.key?.isViewOnce && !content.imageMessage && !content.videoMessage) {
    console.log('[VO] Stub detectado (sin media en el upsert)', msgOrContent.key.id);
    return { type: 'unknown', media: null, isViewOnce: true, isStub: true };
  }

  return null;
}

/**
 * Descarga media robusta. Prueba varias estrategias.
 */
export async function downloadMedia(sock, msg, quotedId = null) {
  const id = msg.key?.id || quotedId;
  if (id && mediaCache.has(id)) {
    console.log(`[CACHE HIT] ${id}`);
    return mediaCache.get(id);
  }

  const mediaInfo = deepFindMedia(msg);
  if (!mediaInfo || mediaInfo.isStub) {
    console.log('[DOWNLOAD] Sin media descargable (stub o no es imagen/video)', id);
    return null;
  }

  // Log de diagnóstico del media
  if (mediaInfo.media) {
    const m = mediaInfo.media;
    console.log(`[DOWNLOAD] Media info id=${id} type=${mediaInfo.type} VO=${mediaInfo.isViewOnce} | mediaKey=${!!m.mediaKey}(${m.mediaKey?.length || 0}) url=${!!m.url} directPath=${!!m.directPath} fileLength=${m.fileLength}`);
  }

  // Estrategia 1: downloadMediaMessage sobre el mensaje original
  try {
    const buffer = await tryDownload(sock, msg);
    if (buffer && buffer.length > 0) {
      if (id) mediaCache.set(id, buffer);
      console.log(`[DOWNLOAD] Éxito estrategia 1, size=${buffer.length}`);
      return buffer;
    }
  } catch (e) {
    console.log('[DOWNLOAD] Estrategia 1 falló:', e.message);
  }

  // Estrategia 2: reconstruir mensaje con el media interno (útil para VO)
  if (mediaInfo.media) {
    try {
      const fakeMsg = {
        key: msg.key || { id },
        message: {
          [mediaInfo.type + 'Message']: mediaInfo.media
        }
      };
      const buffer = await tryDownload(sock, fakeMsg);
      if (buffer) {
        if (id) mediaCache.set(id, buffer);
        return buffer;
      }
    } catch (e) {
      console.log('[DOWNLOAD] Estrategia 2 (fakeMsg) falló:', e.message);
    }
  }

  // Estrategia 3: downloadContentFromMessage directo
  if (mediaInfo.media && (mediaInfo.media.mediaKey || mediaInfo.media.directPath || mediaInfo.media.url)) {
    try {
      const stream = await downloadContentFromMessage(
        mediaInfo.media,
        mediaInfo.type === 'video' ? 'video' : 'image'
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);
      if (buffer.length > 0 && buffer.length <= MAX_DOWNLOAD_BYTES) {
        if (id) mediaCache.set(id, buffer);
        return buffer;
      }
    } catch (e) {
      console.error('[DOWNLOAD] Estrategia 3 (downloadContent) falló:', e.message);
    }
  }

  console.log('[DOWNLOAD] Todas las estrategias fallaron para', id);
  return null;
}

async function tryDownload(sock, msg) {
  try {
    return await downloadMediaMessage(msg, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
  } catch (e1) {
    try {
      const stream = await downloadMediaMessage(msg, 'stream', {}, { reuploadRequest: sock.updateMediaMessage });
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      return Buffer.concat(chunks);
    } catch (e2) {
      throw e2;
    }
  }
}
