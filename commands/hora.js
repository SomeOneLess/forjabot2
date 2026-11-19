// commands/hora.js
export default {
  name: 'hora',
  description: 'Muestra la hora actual',
  handler: async (sock, msg, args, { from }) => {
    const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
    await sock.sendMessage(from, { text: `Hora actual: ${now}` }, { quoted: msg });
  }
};
