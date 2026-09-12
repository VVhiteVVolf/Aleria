export function imageLayout(width, height) {
  if (!(width > 0) || !(height > 0)) return { ratio: 1, format: 'square' };
  const ratio = width / height;
  return { ratio: Math.max(0.55, Math.min(2.2, ratio)), format: ratio < 0.85 ? 'portrait' : ratio > 1.2 ? 'landscape' : 'square' };
}

export function adaptItemImage(image) {
  const frame = image.closest('.ir-image');
  if (!frame || !image.naturalWidth) return;
  const layout = imageLayout(image.naturalWidth, image.naturalHeight);
  frame.dataset.imageFormat = layout.format;
  frame.style.setProperty('--ir-image-ratio', String(layout.ratio));
}
