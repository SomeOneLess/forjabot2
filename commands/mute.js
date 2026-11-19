// commands/mute.js
import { readJson, writeJson, jidBase } from '../utils.js';
import { SETTINGS_FILE } from '../config.js';

export default {
  name: ['mute', 'unmute'],
  description: 'Mute/unmute individual o lista',
  handler: async (sock, msg, args, { from, isFromMe, sender }) => {
    if (!isFromMe) return; // Solo dueño por ahora

    const settings = await readJson(SETTINGS_FILE, {});
    if (!settings[from]) settings[from] = { muted: [] };
    if (!Array.isArray(settings[from].muted)) settings[from].muted = [];

    const cmd = msg.message?.conversation?.split(' ')[0]?.slice(1).toLowerCase() || 'mute';
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (args.toLowerCase() === 'list') {
      const list = settings[from].muted.length
        ? settings[from].muted.map(j => `• ${jidBase(j)}`).join('\n')
        : 'Nadie muteado';
      await sock.sendMessage(from, { text: `Muteados:\n${list}` }, { quoted: msg });
      return;
    }

    if (mentioned.length === 0) {
      await sock.sendMessage(from, { text: 'Menciona a alguien: .mute @persona' }, { quoted: msg });
      return;
    }

    const target = mentioned[0];
    const base = jidBase(target);

    if (cmd === 'unmute') {
      settings[from].muted = settings[from].muted.filter(m => jidBase(m) !== base);
      await sock.sendMessage(from, { text: 'Desmuteado.' }, { quoted: msg });
    } else {
      if (!settings[from].muted.some(m => jidBase(m) === base)) {
        settings[from].muted.push(target);
      }
      await sock.sendMessage(from, { text: 'Muteado.' }, { quoted: msg });
    }

    await writeJson(SETTINGS_FILE, settings);
  }
};
