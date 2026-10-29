import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHouseholdLayer } from '../modules/households/household-layer.mjs';

const source = file => readFileSync(new URL('../assets/js/' + file, import.meta.url), 'utf8');
function frames() {
  const pending = new Map(); let id = 0;
  return { pending, request: callback => { pending.set(++id, callback); return id; }, cancel: id => pending.delete(id),
    flush() { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback()); } };
}

test('map overlays request no raster until enabled; overview, detail and custom URLs retain their own coordinate contract', () => {
  const requests = [], listeners = new Map(), timers = frames();
  const buttons = new Map();
  const window = { devicePixelRatio: 1, addEventListener: (name, callback) => listeners.set(name, callback) };
  const document = { baseURI: 'https://dieweltvonaleria.netlify.app/karten/karte', getElementById: id => buttons.get(id) };
  const context = { window, document, URL, setTimeout: timers.request, clearTimeout: timers.cancel };
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/template.config.js', import.meta.url), 'utf8'), context);
  vm.runInContext(source('map/map-image-sources.js'), context);
  let scale = .15, width = 0;
  window.KartoRuntime = { mapImageSize: () => ({ width }), mapViewportSize: () => ({ width: 1500, height: 1000 }), mapTransform: () => ({ z: scale }) };
  vm.runInContext(source('map/map-raster-images.js'), context);
  const images = window.KartoMapRasterImages;
  const image = overlay => ({ dataset: overlay ? { overlay } : {}, style: {}, attrs: {}, isConnected: true,
    set src(value) { this.attrs.src = value; requests.push(value); },
    getAttribute(name) { return this.attrs[name]; }, removeAttribute(name) { delete this.attrs[name]; }, addEventListener() {} });
  const normal = image(), regions = image('regions'), pins = image('pins');
  for (const [layer, element] of Object.entries({ normal, regions, pins })) images.setSource(element, window.KartoMapImageSources.configured(layer));
  assert.equal(requests.length, 1);
  assert.match(requests[0], /normal-2048-q90/);
  assert.equal(normal.dataset.mapWidth, '8192'); assert.equal(normal.dataset.mapHeight, '6300');
  assert.equal(regions.attrs.src, undefined); assert.equal(pins.attrs.src, undefined);
  images.activate(regions, true);
  assert.match(regions.attrs.src, /regions-2048-q90/);
  images.setSource(normal, window.KartoMapImageSources.configured('normal'));
  assert.equal(requests.length, 2, 'same source does not trigger a new load');
  width = 8192; scale = .4;
  for (let i = 0; i < 120; i++) listeners.get('aleria:karto:view-changed')();
  assert.equal(timers.pending.size, 1); timers.flush();
  assert.match(normal.attrs.src, /normal-4096-q90/);
  scale = 1; listeners.get('aleria:karto:view-changed')(); timers.flush();
  assert.match(normal.attrs.src, /GwynthorBannkreis\.jpg$/, 'native zoom retains the original raster');
  assert.match(regions.attrs.src, /GwynthorBannkreisZonen\.webp$/);
  assert.equal(pins.attrs.src, undefined, 'zooming never fetches a hidden overlay');
  images.setSource(normal, 'https://images.example/custom.png');
  assert.equal(normal.attrs.src, 'https://images.example/custom.png');
  assert.equal(normal.dataset.mapWidth, undefined, 'custom images keep their natural coordinate space');
});

test('resolution upgrades preserve logical size, viewport and pin DOM instead of refitting the map', () => {
  let size = { width: 0, height: 0 }, fits = 0, renders = 0;
  const runtime = { mapImageSize: () => size, setMapImageSize: (width, height) => { size = { width, height }; },
    fitMapView: () => fits++, renderMapContent: () => renders++ };
  const window = { KartoRuntime: runtime };
  vm.runInNewContext(source('map/map-view.js'), { window });
  const image = { naturalWidth: 2048, naturalHeight: 1575, dataset: { mapWidth: '8192', mapHeight: '6300', mapSource: 'original.jpg' } };
  window.onImgLoad(image);
  assert.deepEqual(size, { width: 8192, height: 6300 });
  image.naturalWidth = 4096; image.naturalHeight = 3150;
  window.onImgLoad(image);
  assert.equal(fits, 1); assert.equal(renders, 1);
});

test('travel canvas sleeps in idle and coalesces updates while still clearing removed routes', () => {
  const raf = frames(), listeners = new Map(); let clears = 0;
  const context2d = { clearRect() { clears++; } };
  const canvas = { width: 1000, height: 700, getContext: () => context2d };
  const runtime = { mapImageSize: () => ({ width: 8192 }), mapViewportSize: () => ({ width: 1000, height: 700 }),
    travelGroups: () => [], travelMode: () => 'pan', travelDragState: () => ({ ready: false }) };
  const window = { KartoRuntime: runtime, KartoLsbCalculations: {},
    KartoLsbTools: { calibrationPoints: () => [], measurePoints: () => [] }, addEventListener: (name, callback) => listeners.set(name, callback) };
  const document = { getElementById: id => id === 'measure-canvas' ? canvas : {} };
  vm.runInNewContext(source('lsb/lsb-canvas.js'), { window, document, requestAnimationFrame: raf.request,
    ResizeObserver: class { observe() {} } });
  window.KartoLsbCanvas.init(); raf.flush();
  assert.equal(clears, 1);
  for (let i = 0; i < 120; i++) raf.flush();
  assert.equal(clears, 1, 'no repeated idle frame'); assert.equal(raf.pending.size, 0);
  for (let i = 0; i < 240; i++) { window.KartoLsbCanvas.draw(); listeners.get('aleria:karto:view-changed')(); }
  assert.equal(raf.pending.size, 1); raf.flush();
  assert.equal(clears, 2, 'one render for the whole pending input batch');
});

test('panning a household overlay retains buttons and crest images, while real content changes replace stale artwork', () => {
  const previous = globalThis.document;
  let createdImages = 0;
  class Element {
    children = []; style = {}; dataset = {}; attributes = new Map();
    classList = { add() {} };
    constructor(tag, namespaceURI) { this.tag = tag; this.namespaceURI = namespaceURI; this.ownerDocument = document; }
    append(...children) { for (const node of children) this.insertBefore(node, null); }
    insertBefore(node, before) { node.remove(); const index = before ? this.children.indexOf(before) : this.children.length; this.children.splice(index, 0, node); node.parent = this; }
    remove() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
    setAttribute(key, value) { this.attributes.set(key, value); }
    addEventListener() {}
    querySelectorAll() { return []; }
    getBoundingClientRect() { return { top: 0, bottom: 800 }; }
  }
  const document = { getElementById: () => null,
    createElement(tag) { if (tag === 'img') createdImages++; return new Element(tag); },
    createElementNS(namespace, tag) { return new Element(tag, namespace); } };
  globalThis.document = document;
  try {
    const map = new Element('main'); let x = 0;
    const runtime = { mapViewportSize: () => ({ width: 1200, height: 800 }), mapImageSize: () => ({ width: 8192, height: 6300 }), mapTransform: () => ({ x, y: 0, z: .1 }) };
    const layer = createHouseholdLayer(map, runtime);
    const content = [{ pin: { id: 'seat', title: 'Seat', x: .2, y: .3 }, families: [{ id: 'house', name: 'House', crest: 'crest.png' }] }];
    layer.render(content);
    const groups = layer.element.children[1], anchor = groups.children[0], pill = groups.children[1], crest = pill.children[0];
    for (let i = 0; i < 120; i++) { x++; layer.rescale(); }
    assert.equal(groups.children[0], anchor); assert.equal(groups.children[1], pill); assert.equal(pill.children[0], crest);
    assert.equal(createdImages, 1, 'no crest recreation while panning');
    content[0].families[0].crest = 'updated.png'; layer.render(content);
    assert.equal(createdImages, 2); assert.notEqual(groups.children[1].children[0], crest);
    layer.render([]); assert.equal(groups.children.length, 0);
  } finally { globalThis.document = previous; }
});
