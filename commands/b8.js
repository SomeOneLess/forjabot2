// b8.js
const RESPUESTAS = [
  'Sí', 'No', 'Tal vez', 'Definitivamente', 'No lo creo',
  'Preguntá de nuevo', 'Mejor no te digo', 'Sí, pero con condiciones',
  'Ni en pedo', 'Obvio que sí'
];

export default {
  name: 'b8',
  description: 'Bola 8 mágica',
  async handler(sock, msg, args, { from }) {
    if (!args.trim()) {
      await sock.sendMessage(from, { text: 'Hacé una pregunta.' }, { quoted: msg });
      return;
    }
    const r = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)];
    await sock.sendMessage(from, { text: `🎱 ${r}` }, { quoted: msg });
  }
};
