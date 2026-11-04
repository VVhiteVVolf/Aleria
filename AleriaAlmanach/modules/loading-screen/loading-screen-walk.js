import { LOADING_SCREEN_RIGS } from './loading-screen-puppet-data.js?v=20261013-v4';
export { LOADING_SCREEN_RIGS };

const SVG = 'http://www.w3.org/2000/svg';
const assetRoot = new URL('../../public/assets/loading-screen/', import.meta.url);

function element(name, attributes = {}) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  return node;
}

function preload(src, signal) {
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = loaded => {
      if (settled) return;
      settled = true; image.onload = image.onerror = null;
      signal?.removeEventListener('abort', abort); resolve(loaded);
    };
    const abort = () => { finish(false); image.removeAttribute?.('src'); };
    if (signal?.aborted) { finish(false); return; }
    signal?.addEventListener('abort', abort, { once: true });
    image.decoding = 'async';
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = src;
  });
}

// Closed body and limb drawings; no clipping masks through clothing or joints.
// Each traveller keeps its complete static pose until all its parts are ready.
export function mountLoadingScreenWalk(root, { signal } = {}) {
  const requests = new Map();
  const ready = file => {
    const src = new URL(file, assetRoot).href;
    if (!requests.has(src)) requests.set(src, preload(src, signal));
    return requests.get(src);
  };
  return Promise.allSettled([...root.querySelectorAll('[data-loading-traveller]')].map(async actor => {
    const name = actor.dataset.loadingTraveller;
    const rig = LOADING_SCREEN_RIGS[name];
    if (!rig || actor.dataset.rig === 'true') return;
    const loaded = await Promise.all([ready(rig.body), ...rig.parts.map(part => ready(part.file))]);
    if (signal?.aborted || loaded.some(value => !value)) return;
    const svg = element('svg', { viewBox: '0 0 256 256', 'aria-hidden': 'true', focusable: 'false' });
    for (const [index, part] of rig.parts.entries()) {
      const src = new URL(part.file, assetRoot).href;
      const limb = element('g', { class: `almanach-loading__leg almanach-loading__leg--${index}` });
      limb.style.transformOrigin = `${part.joint[0]}px ${part.joint[1]}px`;
      limb.append(element('image', { href: src, x: part.joint[0] - part.anchor[0], y: part.joint[1] - part.anchor[1], width: part.width, height: part.height }));
      svg.append(limb);
    }
    const body = new URL(rig.body, assetRoot).href;
    svg.append(element('image', { href: body, width: 256, height: 256 }));
    actor.replaceChildren(svg);
    actor.dataset.rig = 'true';
  }));
}
