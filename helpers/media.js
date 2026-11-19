// helpers/media.js
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function bufferToSticker(buffer, isVideo = false) {
  // Para stickers, usamos sharp para webp 512x512
  // Nota: sharp no soporta video directamente; para video se necesita ffmpeg o similar.
  // Por ahora, solo imágenes. Video requeriría procesamiento adicional.
  if (isVideo) {
    throw new Error('Conversión de video a sticker requiere ffmpeg (no implementado aún)');
  }

  const sticker = await sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 80 })
    .toBuffer();

  return sticker;
}

export async function stickerToPng(buffer) {
  return await sharp(buffer).png().toBuffer();
}

export async function rotateImage(buffer, degrees = 90) {
  return await sharp(buffer).rotate(degrees).toBuffer();
}

export async function flipImage(buffer) {
  return await sharp(buffer).flop().toBuffer();
}

export async function pixelateImage(buffer, size = 10) {
  const meta = await sharp(buffer).metadata();
  const width = meta.width || 512;
  const height = meta.height || 512;
  return await sharp(buffer)
    .resize(Math.max(1, Math.floor(width / size)), Math.max(1, Math.floor(height / size)), { kernel: 'nearest' })
    .resize(width, height, { kernel: 'nearest' })
    .toBuffer();
}
