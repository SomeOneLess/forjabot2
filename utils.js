// utils.js
import fs from 'fs/promises';
import path from 'path';

export async function readJson(filePath, defaultValue = {}) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function jidBase(jid) {
  if (!jid) return null;
  return jid.split('@')[0].split(':')[0]; // Normaliza @s.whatsapp.net, @lid, etc.
}

export function isGroupJid(jid) {
  return jid && jid.endsWith('@g.us');
}

export function normalizeJid(jid) {
  return jidBase(jid);
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
