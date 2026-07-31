export async function cropImageToSquareDataUrl(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_unsupported');

  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', 0.85);
}
