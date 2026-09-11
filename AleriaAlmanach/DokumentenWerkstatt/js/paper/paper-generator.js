export const PAPER_COLORS = Object.freeze({
  ivory: { name: 'Elfenbein', color: '#f2e8d2', tint: 'rgba(255,252,237,.32)' },
  honey: { name: 'Honiggold', color: '#d6b46d', tint: 'rgba(169,103,15,.24)' },
  rose: { name: 'Altrosa', color: '#dab0a6', tint: 'rgba(162,58,85,.24)' },
  sage: { name: 'Salbei', color: '#b5c2a5', tint: 'rgba(64,114,90,.29)' },
  frost: { name: 'Frostblau', color: '#b4c9d4', tint: 'rgba(53,114,167,.27)' },
  ash: { name: 'Asche', color: '#665d55', tint: 'rgba(20,22,31,.70)' }
});
const assets = {
  straight: new URL('../../assets/parchments/archive-ivory.png', import.meta.url).href,
  torn: new URL('../../assets/parchments/torn-vellum.png', import.meta.url).href
};
const images = new Map();
const cache = new Map();

export async function preparePaperAssets() {
  await Promise.all(Object.entries(assets).map(async ([key, src]) => {
    const image = new Image(); image.src = src;
    await image.decode(); images.set(key, image);
  }));
}

function randomSequence(seed) {
  let value = seed >>> 0;
  return () => { value = (Math.imul(1664525, value) + 1013904223) >>> 0; return value / 4294967296; };
}

function tracePaper(context, width, height, edge, random) {
  const inset = edge === 'straight' ? 0 : 18;
  const depth = edge === 'burnt' ? 27 : edge === 'torn' ? 22 : 9;
  context.beginPath();
  if (edge === 'straight') { context.rect(0, 0, width, height); return; }
  const sides = [[inset, inset, width - inset, inset], [width - inset, inset, width - inset, height - inset],
    [width - inset, height - inset, inset, height - inset], [inset, height - inset, inset, inset]];
  sides.forEach(([x1, y1, x2, y2], side) => {
    const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 9);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const offset = (random() - .5) * depth + ((edge === 'torn' || edge === 'burnt') && random() > .975 ? 34 : 0);
      const x = x1 + (x2 - x1) * t + (side === 1 ? -offset : side === 3 ? offset : 0);
      const y = y1 + (y2 - y1) * t + (side === 0 ? offset : side === 2 ? -offset : 0);
      if (side === 0 && i === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
  });
  context.closePath();
}

// Only the small recipe is stored. The same seed recreates the same downloadable paper.
export function createPaperCanvas(meta, width = 1024, height = 1536) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d');
  const random = randomSequence(meta.paperSeed || 17);
  const edge = meta.paperEdge || 'straight';
  const palette = PAPER_COLORS[meta.paperColor] || PAPER_COLORS.ivory;
  const source = meta.background === 'plain' ? null : images.get(edge === 'torn' ? 'torn' : 'straight');
  if (source) context.drawImage(source, 0, 0, width, height);
  else { context.fillStyle = palette.color; context.fillRect(0, 0, width, height); }
  context.globalCompositeOperation = 'source-atop';
  context.fillStyle = palette.tint; context.fillRect(0, 0, width, height);
  const age = (meta.paperAge ?? 25) / 100;
  for (let i = 0; i < 24; i++) {
    const x = random() * width, y = random() * height, radius = 20 + random() * 210;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(88,49,17,${age * random() * .16})`); gradient.addColorStop(1, 'rgba(88,49,17,0)');
    context.fillStyle = gradient; context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  for (let i = 0; i < 650; i++) {
    const x = random() * width, y = random() * height;
    context.strokeStyle = `rgba(65,38,17,${random() * age * .12})`;
    context.beginPath(); context.moveTo(x, y); context.lineTo(x + random() * 16, y + random() * 4); context.stroke();
  }
  if (edge === 'burnt') {
    const gradient = context.createRadialGradient(width / 2, height / 2, width * .30, width / 2, height / 2, height * .58);
    gradient.addColorStop(0, 'rgba(33,16,8,0)'); gradient.addColorStop(.72, 'rgba(55,27,11,.38)'); gradient.addColorStop(1, 'rgba(25,15,9,.95)');
    context.fillStyle = gradient; context.fillRect(0, 0, width, height);
  }
  if (edge !== 'torn' && edge !== 'straight') {
    context.globalCompositeOperation = 'destination-in';
    tracePaper(context, width, height, edge, randomSequence(meta.paperSeed || 17));
    context.fillStyle = '#fff'; context.fill();
  }
  return canvas;
}

export function paperBackground(meta) {
  if (meta.background === 'custom' && meta.texture) return `url("${meta.texture}")`;
  const key = JSON.stringify([meta.background === 'plain', meta.paperColor, meta.paperEdge, meta.paperAge, meta.paperSeed]);
  if (!cache.has(key)) {
    if (cache.size >= 8) cache.delete(cache.keys().next().value);
    cache.set(key, createPaperCanvas(meta).toDataURL('image/webp', .92));
  }
  return `url("${cache.get(key)}")`;
}
