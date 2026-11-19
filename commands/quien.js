// quien.js
import { PREFIX } from '../config.js';

export default {
  name: ['quien', 'quién'],
  description: 'Elige a alguien del grupo y completa la frase',
  async handler(sock, msg, args, ctx) {
    const { from, isGroup } = ctx;
    if (!isGroup) {
      await sock.sendMessage(from, { text: 'Solo en grupos.' }, { quoted: msg });
      return;
    }

    let frase = args.trim();
    if (!frase) {
      await sock.sendMessage(from, { text: `Usá: ${PREFIX}quien tiene hambre?` }, { quoted: msg });
      return;
    }

    // Quitar signo de pregunta final
    if (frase.endsWith('?')) frase = frase.slice(0, -1).trim();

    try {
      const groupMeta = await sock.groupMetadata(from);
      const participants = groupMeta.participants || [];
      if (participants.length === 0) return;

      const random = participants[Math.floor(Math.random() * participants.length)];
      const mention = random.id;

      await sock.sendMessage(from, {
        text: `@${mention.split('@')[0]} ${frase}`,
        mentions: [mention]
      }, { quoted: msg });
    } catch (e) {
      console.error('[QUIEN]', e.message);
    }
  }
};
