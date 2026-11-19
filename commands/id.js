// commands/id.js
export default {
  name: ['id', 'gid'],
  description: 'Muestra el JID del chat actual',
  handler: async (sock, msg, args, { from }) => {
    await sock.sendMessage(from, { text: `JID de este chat:\n\`${from}\`` }, { quoted: msg });
  }
};
