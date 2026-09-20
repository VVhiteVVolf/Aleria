import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const state = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/data.json')).state;
const app = read('../assets/js/karto-app.js');
const renderLayers = app.slice(app.indexOf('function renderLayerButtons(){'), app.indexOf('\nfunction saveD(){'));

function node() {
  const classes = new Set();
  return {
    style: { setProperty(key, value) { this[key] = value; } }, dataset: {}, children: [], listeners: {}, hidden: false,
    classList: {
      add: value => classes.add(value), remove: value => classes.delete(value),
      contains: value => classes.has(value),
      toggle(value, active) { active ? classes.add(value) : classes.delete(value); }
    },
    append(child) { this.children.push(child); },
    appendChild(child) { this.children.push(child); },
    querySelectorAll: () => [],
    addEventListener(type, listener) { this.listeners[type] = listener; }
  };
}

test('Llysfaens 24 interaktive Marker sind ohne Markerbild einschaltbar und öffnen ihre Details', () => {
  const elements = Object.fromEntries(['lb-normal', 'lb-regions', 'lb-pins', 'pl', 'layer-btns', 'layer-opacity-wrap'].map(id => [id, node()]));
  for (const layer of ['normal', 'regions', 'pins']) elements[`lb-${layer}`].dataset.layer = layer;
  const document = {
    baseURI: 'https://example.test/Karten/karte.html',
    createElement: node,
    getElementById: id => elements[id] || null,
    querySelector: () => null,
    addEventListener() {},
    querySelectorAll: selector => ['regions', 'pins'].map(layer => elements[`lb-${layer}`])
      .filter(button => !selector.includes('.on') || button.classList.contains('on'))
  };
  const opened = [];
  const runtime = {
    state: () => state, pinLayer: () => elements.pl,
    mapImageSize: () => ({ width: 4096, height: 2925 }),
    activeFilter: () => 'all', isEditMode: () => false,
    pinDisplayOptions: () => ({ dotSize: 18, labelSize: 13 }),
    categoryForPin: pin => state.cats.find(category => category.id === pin.cat),
    esc: value => value,
    openPin: (id, mode) => opened.push({ id, mode })
  };
  const window = { KartoRuntime: runtime, addEventListener() {} };
  const context = vm.createContext({ window, document, URL, S: state, editMode: false, KARTO_CONFIG: { images: { normal: 'map.webp' } } });
  vm.runInContext(read('../assets/js/map/map-image-sources.js'), context);
  vm.runInContext(renderLayers, context);
  vm.runInContext('renderLayerButtons()', context);
  assert.equal(elements['lb-pins'].hidden, false);
  assert.equal(elements['lb-regions'].hidden, true);
  assert.equal(elements['layer-btns'].children.length, 0);

  vm.runInContext(read('../assets/js/map/map-view.js'), context);
  window.resetLayers();
  assert.equal(elements.pl.style.display, 'none');
  window.toggleLayer('pins');
  assert.equal(elements.pl.style.display, 'block');

  vm.runInContext(read('../assets/js/pins/pin-renderer.js'), context);
  window.KartoPinRenderer.renderPins();
  assert.equal(elements.pl.children.length, 24);
  for (const marker of elements.pl.children) {
    const event = { button: 0, clientX: 100, clientY: 100, stopPropagation() {} };
    marker.listeners.mousedown(event);
    marker.listeners.mouseup(event);
  }
  assert.deepEqual(opened, state.pins.map(pin => ({ id: pin.id, mode: 'view' })));
});
