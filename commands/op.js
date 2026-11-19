// op.js
export default {
  name: ['op', 'deop'],
  description: 'Dar o quitar admin',
  async handler(sock, msg, args, { from, isGroup, isFromMe }) {
    if (!isGroup || !isFromMe) return;
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await sock.sendMessage(from, { text: 'Mencioná a alguien.' }, { quoted: msg });
      return;
    }
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase();
    const action = text.startsWith('.deop') ? 'demote' : 'promote';
    try {
      await sock.groupParticipantsUpdate(from, mentioned, action);
      await sock.sendMessage(from, { text: action === 'promote' ? 'Admin dado.' : 'Admin quitado.' }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: 'No pude (¿soy admin?).' }, { quoted: msg });
    }
  }
};
