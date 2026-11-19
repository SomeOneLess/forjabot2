// ship.js
export default {
  name: 'ship',
  description: 'Shipea dos personas',
  async handler(sock, msg, args, { from, isGroup }) {
    if (!isGroup) return;
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await sock.sendMessage(from, { text: 'Mencioná a alguien: .ship @usuario' }, { quoted: msg });
      return;
    }
    try {
      const meta = await sock.groupMetadata(from);
      const others = (meta.participants || []).filter(p => p.id !== mentioned[0]);
      if (others.length === 0) return;
      const pareja = others[Math.floor(Math.random() * others.length)];
      const pct = Math.floor(Math.random() * 101);
      const a = mentioned[0].split('@')[0];
      const b = pareja.id.split('@')[0];
      await sock.sendMessage(from, {
        text: `@${a} y @${b} tienen ${pct}% de compatibilidad 💕`,
        mentions: [mentioned[0], pareja.id]
      }, { quoted: msg });
    } catch (e) {
      console.error('[SHIP]', e.message);
    }
  }
};
