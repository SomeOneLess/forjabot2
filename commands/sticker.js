// commands/sticker.js
import { downloadMedia, getQuotedMessage, getQuotedId, deepFindMedia } from '../helpers/messages.js';
import { bufferToSticker } from '../helpers/media.js';

export default {
  name: ['s', 'sticker', 'stiker'],
  description: 'Convierte media citada a sticker',
  handler: async (sock, msg, args, { from }) => {
    const quoted = getQuotedMessage(msg);
    const quotedId = getQuotedId(msg);
    if (!quoted) {
      await sock.sendMessage(from, { text: 'Cita una imagen o video.' }, { quoted: msg });
      return;
    }

    const mediaInfo = deepFindMedia({ message: quoted });
    if (!mediaInfo || (mediaInfo.type !== 'image' && mediaInfo.type !== 'video')) {
      await sock.sendMessage(from, { text: 'Cita una imagen o video válido.' }, { quoted: msg });
      return;
    }

    const buffer = await downloadMedia(sock, { message: quoted, key: { id: quotedId } }, quotedId);
    if (!buffer) {
      await sock.sendMessage(from, { text: 'No se pudo descargar la media.' }, { quoted: msg });
      return;
    }

    try {
      const sticker = await bufferToSticker(buffer, mediaInfo.type === 'video');
      await sock.sendMessage(from, { sticker }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: msg });
    }
  }
};
