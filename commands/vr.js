// vr.js
import { VERDADES, RETOS } from './games-texts.js';

export default {
  name: 'vr',
  description: 'Verdad o reto aleatorio',
  async handler(sock, msg, args, { from }) {
    const esReto = Math.random() < 0.5;
    const texto = esReto
      ? `*Reto:* ${RETOS[Math.floor(Math.random() * RETOS.length)]}`
      : `*Verdad:* ${VERDADES[Math.floor(Math.random() * VERDADES.length)]}`;
    await sock.sendMessage(from, { text: texto }, { quoted: msg });
  }
};
