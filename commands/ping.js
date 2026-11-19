// commands/ping.js
export default {
  name: 'ping',
  description: 'Responde pong con latencia',
  handler: async (sock, msg, args, { from }) => {
    const start = Date.now();
    const sent = await sock.sendMessage(from, { text: 'Pong!' }, { quoted: msg });
    const latency = Date.now() - start;
    await sock.sendMessage(from, { text: `Latencia: ${latency}ms`, edit: sent.key }).catch(() => {});
  }
};
