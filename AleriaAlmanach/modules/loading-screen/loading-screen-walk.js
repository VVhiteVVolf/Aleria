import { LOADING_SCREEN_RIGS } from './loading-screen-puppet-data.js?v=20261013-v4';
export { LOADING_SCREEN_RIGS };

const SVG = 'http://www.w3.org/2000/svg';
const assetRoot = new URL('../../public/assets/loading-screen/', import.meta.url);

function element(name, attributes = {}) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

function preload(src) {
  return new Promise(resolve => {
    const image = new Image();
    image.onload = image.onerror = resolve;
    image.src = src;
  });
}

// Closed body and limb drawings; no clipping masks through clothing or joints.
export function mountLoadingScreenWalk(root) {
  const images = new Set();
  for (const actor of root.querySelectorAll('[data-loading-traveller]')) {
    const name = actor.dataset.loadingTraveller;
    const rig = LOADING_SCREEN_RIGS[name];
    if (!rig) continue;
    const svg = element('svg', { viewBox: '0 0 256 256', 'aria-hidden': 'true', focusable: 'false' });
    for (const [index, part] of rig.parts.entries()) {
      const src = new URL(part.file, assetRoot).href;
      images.add(src);
      const limb = element('g', { class: `almanach-loading__leg almanach-loading__leg--${index}` });
      limb.style.transformOrigin = `${part.joint[0]}px ${part.joint[1]}px`;
      limb.append(element('image', { href: src, x: part.joint[0] - part.anchor[0], y: part.joint[1] - part.anchor[1], width: part.width, height: part.height }));
      svg.append(limb);
    }
    const body = new URL(rig.body, assetRoot).href;
    images.add(body);
    svg.append(element('image', { href: body, width: 256, height: 256 }));
    actor.replaceChildren(svg);
    actor.dataset.rig = 'true';
  }
  return Promise.allSettled([...images].map(preload));
}
