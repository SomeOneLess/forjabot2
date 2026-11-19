// tmr.js
export default {
  name: 'tmr',
  description: 'Temporizador',
  async handler(sock, msg, args, { from }) {
    const arg = args.trim().toLowerCase();
    const match = arg.match(/^(\d+)(s|m|h)$/);
    if (!match) {
      await sock.sendMessage(from, { text: 'Usá: .tmr 30s / 10m / 1h' }, { quoted: msg });
      return;
    }
    const n = parseInt(match[1], 10);
    const unit = match[2];
    let ms = n * 1000;
    if (unit === 'm') ms *= 60;
    if (unit === 'h') ms *= 3600;
    if (ms > 24 * 3600 * 1000) {
      await sock.sendMessage(from, { text: 'Máximo 24 horas.' }, { quoted: msg });
      return;
    }
    await sock.sendMessage(from, { text: `⏰ Temporizador de ${arg} iniciado.` }, { quoted: msg });
    setTimeout(async () => {
      await sock.sendMessage(from, { text: `⏰ ¡Tiempo! (${arg})` }).catch(() => {});
    }, ms);
  }
};
