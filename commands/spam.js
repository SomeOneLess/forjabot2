// commands/spam.js
import { jidBase } from '../utils.js';

export default {
  name: 'spam',
  description: 'Envía el texto N veces (máx 100)',
  handler: async (sock, msg, args, { from, isFromMe }) => {
    if (!isFromMe) return;

    const parts = args.trim().split(/\s+/);
    const n = parseInt(parts[0], 10);
    if (isNaN(n) || n < 1 || n > 100) {
      await sock.sendMessage(from, { text: 'Uso: .spam N texto (1-100)' }, { quoted: msg });
      return;
    }

    const text = parts.slice(1).join(' ') || 'spam';
    // Primer mensaje con menciones a todos para bypassear
    const groupMetadata = await sock.groupMetadata(from).catch(() => null);
    const mentions = groupMetadata?.participants?.map(p => p.id) || [];

    for (let i = 0; i < n; i++) {
      const payload = i === 0 && mentions.length
        ? { text, mentions }
        : { text };
      await sock.sendMessage(from, payload).catch(() => {});
      await new Promise(r => setTimeout(r, 200)); // Pequeño delay
    }
  }
};
