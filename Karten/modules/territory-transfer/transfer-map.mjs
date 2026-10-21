const ns = 'http://www.w3.org/2000/svg';
const colors = ['#8b402f','#8e5f2c','#506c82','#59734b','#81587b','#9c7736','#477e70'];
export function mapPositionLabel(pin) {
  return pin.userPlacement ? 'Meer bei Hohenwacht' : 'Kartenplatz '+pin.id.replace('new-pin-','').replace(/^0+/,'');
}
function element(tag, attributes = {}) {
  const node = document.createElementNS(ns, tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

export function mountTransferMap(root, { pins, imageSize, territories, onSelect }) {
  const svg = root.querySelector('svg');
  const [width, height] = imageSize;
  const background = element('image', { width, height, href: 'Kartenbilder/regions.webp' });
  const layer = element('g');
  svg.replaceChildren(background, layer);
  let view = [0, 0, width, height];
  let drag = null;
  const nodes = new Map();
  function redraw() { svg.setAttribute('viewBox', view.join(' ')); }
  for (const pin of pins) {
    const node = element('g', { class: 'transfer-map-pin'+(pin.confirmed?' is-confirmed':''), tabindex: '0', role: 'button',
      'data-target-id': pin.id, 'aria-label': `${pin.id}: ${pin.proposedName || 'Unbenannte neue Kartenposition'}`,
      transform: `translate(${pin.position.x} ${pin.position.y})` });
    const title = element('title');
    title.textContent = `${mapPositionLabel(pin)} · ${pin.proposedName || 'Name offen'} · ${pin.territory.name}`;
    node.append(title, element('circle', { r: 36, class: 'transfer-map-hit' }),
      element('circle', { r: 15, fill: colors[Math.max(0, territories.findIndex(t => t.id === pin.territoryId)) % colors.length] }));
    if(pin.userPlacement)node.append(element('image',{href:pin.icon,x:-39,y:-78,width:78,height:78,'pointer-events':'none'}));
    if(pin.decision?.icon)node.append(element('image',{href:pin.icon,x:-50,y:-118,width:100,height:120,'pointer-events':'none'}));
    layer.append(node); nodes.set(pin.id, node);
  }
  function choose(event) {
    const pin = event.target.closest('[data-target-id]');
    if (pin) onSelect(pin.dataset.targetId);
  }
  svg.addEventListener('click', choose);
  svg.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(event); }
  });
  svg.addEventListener('pointerdown', event => {
    if (event.target.closest('[data-target-id]')) return;
    const transform=svg.getScreenCTM()?.inverse();
    if(!transform)return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(transform);
    drag = { point, transform, view: [...view] };
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove', event => {
    if (!drag) return;
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(drag.transform);
    view[0] = drag.view[0] - (point.x-drag.point.x);
    view[1] = drag.view[1] - (point.y-drag.point.y);
    redraw();
  });
  const release = () => { drag = null; };
  svg.addEventListener('pointerup', release); svg.addEventListener('pointercancel', release);
  redraw();
  return {
    setLayer(name) { background.setAttribute('href', `Kartenbilder/${name}.webp`); },
    zoom(factor) {
      const newWidth = Math.max(width/7, Math.min(width*1.2, view[2]/factor));
      const ratio = newWidth/view[2];
      view = [view[0]+view[2]*(1-ratio)/2, view[1]+view[3]*(1-ratio)/2, newWidth, newWidth*height/width];
      redraw();
    },
    reset() { view=[0,0,width,height]; redraw(); },
    setVisible(ids) {
      for(const [id,node] of nodes)node.classList.toggle('is-filtered',!ids.has(id));
    },
    select(id) {
      for (const [key,node] of nodes) node.classList.toggle('is-selected', key === id);
      const pin = pins.find(p => p.id === id);
      if (!pin) return;
      const w=width/2.8, h=height/2.8;
      view=[Math.max(0,Math.min(width-w,pin.position.x-w/2)),Math.max(0,Math.min(height-h,pin.position.y-h/2)),w,h];
      redraw();
    },
  };
}
