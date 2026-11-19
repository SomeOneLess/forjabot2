// commands/ayuda.js
import { PREFIX, BOT_NAME } from '../config.js';

export default {
  name: ['ayuda', 'help'],
  description: 'Muestra la lista de comandos disponibles',
  handler: async (sock, msg, args, { from }) => {
    const help = `
*${BOT_NAME}* - Comandos disponibles

*Multimedia:*
${PREFIX}s / ${PREFIX}sticker - Convierte media citada a sticker (necesita ffmpeg)
${PREFIX}png - Convierte sticker a PNG

*Utilidades:*
${PREFIX}id / ${PREFIX}gid - Muestra JID del chat
${PREFIX}ping - Latencia
${PREFIX}hora
${PREFIX}quien tiene hambre? - Elige a alguien del grupo
${PREFIX}tr texto - Traduce a inglés
${PREFIX}tmr 30s/10m/1h - Temporizador
${PREFIX}clima lugar - Clima

*Grupos:*
${PREFIX}bot on/off
${PREFIX}me on/off
${PREFIX}mute @persona / ${PREFIX}unmute / ${PREFIX}mute list
${PREFIX}spam N texto
${PREFIX}op / ${PREFIX}deop @usuario - Dar/quitar admin

*Juegos:*
${PREFIX}verdad - Pregunta picante
${PREFIX}reto - Desafío picante
${PREFIX}dilema - Elige entre dos
${PREFIX}vr - Verdad o reto al azar
${PREFIX}dado - Tira un dado
${PREFIX}b8 pregunta - Bola 8
${PREFIX}yonunca - Yo nunca nunca
${PREFIX}ship @usuario - Shipea
${PREFIX}top - Top de mensajes del día

Usa ${PREFIX}ayuda para ver esto.
`.trim();

    await sock.sendMessage(from, { text: help }, { quoted: msg });
  }
};
