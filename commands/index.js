// commands/index.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadCommands() {
  const commands = new Map();
  const files = await fs.readdir(__dirname);
  for (const file of files) {
    if (file.endsWith('.js') && file !== 'index.js') {
      try {
        const mod = await import(`./${file}`);
        const cmd = mod.default || mod;
        if (cmd.name && cmd.handler) {
          // Soporta aliases
          const names = Array.isArray(cmd.name) ? cmd.name : [cmd.name];
          for (const n of names) {
            commands.set(n.toLowerCase(), cmd);
          }
          console.log(`[CMD] Cargado: ${names.join(', ')}`);
        }
      } catch (e) {
        console.error(`[CMD] Error cargando ${file}:`, e.message);
      }
    }
  }
  return commands;
}
