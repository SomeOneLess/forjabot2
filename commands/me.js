// commands/me.js
import { readJson, writeJson } from '../utils.js';
import { SETTINGS_FILE } from '../config.js';

export default {
  name: 'me',
  description: 'Activa/desactiva modo solo dueño habla',
  handler: async (sock, msg, args, { from, isFromMe }) => {
    if (!isFromMe) return;

    const mode = args.trim().toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      await sock.sendMessage(from, { text: 'Uso: .me on / .me off' }, { quoted: msg });
      return;
    }

    const settings = await readJson(SETTINGS_FILE, {});
    if (!settings[from]) settings[from] = {};
    settings[from].meOnly = mode === 'on';
    await writeJson(SETTINGS_FILE, settings);

    await sock.sendMessage(from, { text: `Modo me ${mode === 'on' ? 'activado' : 'desactivado'}` }, { quoted: msg });
  }
};
