// Only consumes the captured, rendered SVG and image bounds. No World Anvil
// internals, credentials or original-account access are required.
export function worldAnvilMarkerId(shape) {
  return shape.class.match(/\bmarker-([a-f0-9-]{36})\b/)?.[1] || '';
}

export function convertRenderedRegion(shape, image, { independentAxes = false } = {}) {
  const scale = image.rect.width / image.width;
  const normalized = (x, y) => [
    Number(((x - image.rect.left) / scale / image.width).toFixed(8)),
    Number(((y - image.rect.top) / (independentAxes ? image.rect.height : scale * image.height)).toFixed(8)),
  ];
  if (shape.class.includes('marker-circle')) {
    const r = shape.rect;
    return { kind:'area', paths:[Array.from({length:48},(_,i)=> {
      const angle=i/48*Math.PI*2;
      return normalized(r.left+r.width/2+Math.cos(angle)*r.width/2,r.top+r.height/2+Math.sin(angle)*r.height/2);
    })] };
  }
  const kind = shape.class.includes('marker-line') ? 'boundary' : 'area';
  const box = shape.svg.viewBox.split(/\s+/).map(Number);
  const rect = shape.svg.rect;
  const paths = [...shape.d.matchAll(/M([^M]+)/g)].map(part => [...('M'+part[1]).matchAll(/[ML](-?[\d.]+)[ ,]+(-?[\d.]+)/g)].map(match => normalized(
    rect.left+(Number(match[1])-box[0])*rect.width/box[2],
    rect.top+(Number(match[2])-box[1])*rect.height/box[3],
  ))).filter(path => path.length >= (kind === 'boundary' ? 2 : 3));
  if (!paths.length) throw new Error(`Sichtbare Grenze ohne verwertbare Punkte: ${worldAnvilMarkerId(shape)}`);
  return { kind, paths };
}
