// index.js
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { handleMessages } from './handlers/message.js';
import { DESTINO } from './config.js';
import fs from 'fs/promises';

const logger = pino({ level: 'silent' }); // o 'info' para más logs

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['ForjaBot2', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('Escanea el QR:');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexión cerrada. Reconectando...', shouldReconnect);
      if (shouldReconnect) {
        setTimeout(startBot, 3000);
      }
    } else if (connection === 'open') {
      console.log('✅ ForjaBot2 conectado!');
    }
  });

  sock.ev.on('messages.upsert', (m) => handleMessages(sock, m));

  // Escucha updates por si el media de un VO llega después
  sock.ev.on('messages.update', async (updates) => {
    for (const { key, update } of updates) {
      if (update.message && (key.isViewOnce || JSON.stringify(update.message).includes('viewOnce'))) {
        console.log('[VO/UPDATE] Media llegó en update para', key.id);
        try {
          await handleMessages(sock, { messages: [{ key, message: update.message }], type: 'notify' });
        } catch (e) {
          console.error('[VO/UPDATE] Error:', e.message);
        }
      }
    }
  });

  // Separador horario cada 2 horas
  let lastSentHour = -1;
  setInterval(async () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour % 2 === 0 && hour !== lastSentHour) {
      try {
        await sock.sendMessage(DESTINO, { text: '-----' });
        lastSentHour = hour;
        console.log(`[SEPARATOR] Enviado a las ${hour}:00`);
      } catch (e) {
        console.error('[SEPARATOR] Error:', e.message);
      }
    }
  }, 60 * 1000); // Chequea cada minuto

  // Asegurar directorios
  await fs.mkdir('./auth', { recursive: true }).catch(() => {});
  await fs.mkdir('./cache', { recursive: true }).catch(() => {});
}

startBot().catch(console.error);
