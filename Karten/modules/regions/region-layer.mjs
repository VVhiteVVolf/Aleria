import { regionPath, labelPoint } from './region-model.mjs';

const ns = 'http://www.w3.org/2000/svg';
function svgElement(tag, attributes = {}) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
}

export function createRegionLayer(stage, runtime) {
  const svg = svgElement('svg', { class: 'region-vector-layer', 'aria-label': 'Bearbeitbare Gebietsgrenzen' });
  stage.append(svg);
  let labels = [], handles = [], outlines = [];
  function rescale() {
    const scale = runtime.mapTransform().z || 1;
    labels.forEach(label => label.setAttribute('font-size', 13 / scale));
    outlines.forEach(({node,width}) => node.setAttribute('stroke-width', width / scale));
    handles.forEach(handle => { handle.setAttribute('r', 5 / scale); handle.style.strokeWidth = String(2 / scale); });
  }
  return {
    element: svg,
    rescale,
    show(visible, opacity = 1) { svg.toggleAttribute('hidden', !visible); svg.style.opacity = String(opacity); },
    render(regions, session) {
      const { width, height } = runtime.mapImageSize();
      svg.setAttribute('viewBox', `0 0 ${width || 1} ${height || 1}`);
      svg.setAttribute('width', width || 1); svg.setAttribute('height', height || 1);
      svg.replaceChildren(); labels = []; handles = []; outlines = [];
      const draft = session?.draft();
      for (const region of [...regions.filter(item => item.id !== draft?.id), ...(draft ? [draft] : [])]) {
        const selected = region === draft;
        const path = svgElement('path', { d: regionPath(region, width, height), class: selected ? 'region-shape is-selected' : 'region-shape', fill: region.kind === 'boundary' ? 'none' : region.color, 'fill-opacity': region.opacity, stroke: region.borderColor || region.color, 'stroke-width': selected ? 8 : 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'fill-rule': 'evenodd', 'data-region-id': region.id });
        // The stage is scaled by CSS outside the SVG; vector-effect alone does
        // not keep that outer transform from shrinking borders on an overview.
        outlines.push({node:path,width:selected?8:6});
        const title = svgElement('title'); title.textContent = region.name; path.append(title); svg.append(path);
        if (region.kind !== 'boundary' && region.showLabel !== false && region.paths?.[0]?.length >= 3) {
          const point = region.labelPosition || labelPoint(region);
          const label = svgElement('text', { x: point[0] * width, y: point[1] * height, class: 'region-name', 'text-anchor': 'middle' });
          label.textContent = region.shortName || region.name;
          if (region.targetMapId && !session) {
            const link = svgElement('a', { href: `karte.html?map=${encodeURIComponent(region.targetMapId)}`, class: 'region-map-link' });
            link.append(label); svg.append(link);
          } else svg.append(label);
          labels.push(label);
        }
      }
      if (draft) draft.paths.forEach((path, pathIndex) => path.forEach((point, index) => {
        const selected = session.selected()?.[0] === pathIndex && session.selected()?.[1] === index;
        const handle = svgElement('circle', { cx: point[0] * width, cy: point[1] * height, class: `region-vertex${selected ? ' is-selected' : ''}`, 'data-region-path': pathIndex, 'data-region-vertex': index, 'vector-effect': 'non-scaling-stroke' });
        svg.append(handle); handles.push(handle);
      }));
      rescale();
    },
  };
}
