// juegos.js
import { VERDADES, RETOS, DILEMAS } from './games-texts.js';

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default {
  name: ['verdad', 'reto', 'dilema'],
  description: 'Juegos picantes',
  async handler(sock, msg, args, ctx) {
    const { from } = ctx;
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim().toLowerCase();
    const cmd = text.split(' ')[0].replace('.', '');

    let texto = '';
    if (cmd === 'reto') {
      texto = `*Reto:* ${random(RETOS)}`;
    } else if (cmd === 'dilema') {
      texto = `*Dilema:* ${random(DILEMAS)}`;
    } else {
      texto = `*Verdad:* ${random(VERDADES)}`;
    }

    await sock.sendMessage(from, { text: texto }, { quoted: msg });
  }
};