// dado.js
export default {
  name: 'dado',
  description: 'Tira un dado',
  async handler(sock, msg, args, { from }) {
    const n = Math.floor(Math.random() * 6) + 1;
    await sock.sendMessage(from, { text: `🎲 ${n}` }, { quoted: msg });
  }
};
