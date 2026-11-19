// commands/bot.js
import { readJson, writeJson } from '../utils.js';
import { SETTINGS_FILE } from '../config.js';

export default {
  name: 'bot',
  description: 'Activa/desactiva modo solo dueño para comandos',
  handler: async (sock, msg, args, { from, isFromMe }) => {
    if (!isFromMe) return; // Solo dueño

    const mode = args.trim().toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      await sock.sendMessage(from, { text: 'Uso: .bot on / .bot off' }, { quoted: msg });
      return;
    }

    const settings = await readJson(SETTINGS_FILE, {});
    if (!settings[from]) settings[from] = {};
    settings[from].botOnly = mode === 'on';
    await writeJson(SETTINGS_FILE, settings);

    await sock.sendMessage(from, { text: `Modo bot ${mode === 'on' ? 'activado' : 'desactivado'}` }, { quoted: msg });
  }
};
