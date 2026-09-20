import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
function element(tag = 'div') {
  const classes = new Set();
  return {
    tag, attributes: {}, dataset: {}, children: [], listeners: {},
    style: { setProperty(key, value) { this[key] = value; } },
    classList: { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key), toggle(key, on) { on ? classes.add(key) : classes.delete(key); } },
    set innerHTML(value) { this.html = value; this.children = []; },
    get innerHTML() { return this.html || ''; },
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(key, value) { this.attributes[key] = value; },
    querySelector() { return null; },
    addEventListener(type, handler) { this.listeners[type] = handler; }
  };
}

function fixture(pins = [{ id: 'one', title: 'Klerus', x: .25, y: .3 }]) {
  const state = { pins, cats: [], dotSize: 80, lblSize: 40, showMarkers: false };
  const layer = element();
  const checkbox = element('input');
  const events = {}, windowEvents = {}, frames = new Map(), undo = [], opened = [];
  let frameId = 0, saves = 0, editing = true;
  const document = {
    createElement: element, createElementNS: (_, tag) => element(tag),
    querySelector: selector => selector.includes('show-view-markers') ? checkbox : null,
    getElementById: () => null,
    addEventListener: (type, handler) => { events[type] = handler; }
  };
  const runtime = {
    state: () => state, pinLayer: () => layer, activeFilter: () => 'all',
    isEditMode: () => editing, mapImageSize: () => ({ width: 1000, height: 1000 }),
    mapPointFromClient: (x, y) => ({ x: x / 2, y: y / 2 }),
    pinDisplayOptions: () => ({ dotSize: 80, labelSize: 40 }),
    categoryForPin: () => ({ color: '#776633' }), esc: value => value,
    pushUndo: (_, handler) => undo.push(handler), save: () => { saves++; },
    openPin: (...args) => opened.push(args)
  };
  const window = { KartoRuntime: runtime, addEventListener: (type, handler) => { windowEvents[type] = handler; } };
  const context = vm.createContext({ window, document,
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  const load = name => vm.runInContext(read(`../assets/js/pins/${name}.js`), context);
  load('pin-lettering');
  return { context, window, state, layer, checkbox, events, windowEvents, frames, undo, opened, load,
    editing: value => { editing = value; }, saves: () => saves,
    tick() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn()); }
  };
}
const mouse = (clientX, clientY) => ({ button: 0, clientX, clientY, preventDefault() {}, stopPropagation() {} });

test('Ziehen behält DOM-Knoten, bündelt Frames und speichert die letzte Position mit einem Undo', () => {
  const f = fixture();
  f.load('pin-renderer');
  const renderer = f.window.KartoPinRenderer;
  renderer.renderPins();
  const marker = f.layer.children[0];
  marker.listeners.mousedown(mouse(520, 620));
  f.events.mousemove(mouse(700, 800));
  f.events.mousemove(mouse(920, 1020));
  assert.equal(f.layer.children[0], marker);
  assert.equal(f.frames.size, 1);
  assert.equal(f.state.pins[0].x, .45);
  assert.equal(f.state.pins[0].y, .5);
  f.tick();
  assert.equal(marker.style.left, '450px');
  assert.equal(marker.style.top, '500px');
  f.events.mousemove(mouse(1120, 1220));
  f.events.mouseup(mouse(1120, 1220));
  assert.equal(f.frames.size, 0);
  assert.equal(renderer.isDragging(), false);
  assert.equal(f.state.pins[0].x, .55);
  assert.equal(f.state.pins[0].y, .6);
  assert.equal(f.saves(), 1);
  assert.equal(f.undo.length, 1);
  assert.equal(f.opened.length, 0);
  f.undo[0]();
  assert.equal(f.state.pins[0].x, .25);
  assert.equal(f.state.pins[0].y, .3);
});

test('Kleine Mausbewegungen bleiben Klicks und erzeugen weder Speicherung noch Undo', () => {
  const f = fixture();
  f.load('pin-renderer');
  f.window.KartoPinRenderer.renderPins();
  const marker = f.layer.children[0];
  marker.listeners.mousedown(mouse(500, 600));
  f.events.mousemove(mouse(501, 601));
  marker.listeners.mouseup(mouse(501, 601));
  assert.equal(f.saves(), 0);
  assert.equal(f.undo.length, 0);
  assert.deepEqual(f.opened, [['one', 'edit']]);
});

test('Verlassen des Fensters beendet Ziehen und begrenzt Pins auf die Karte', () => {
  const f = fixture();
  f.load('pin-renderer');
  f.window.KartoPinRenderer.renderPins();
  f.layer.children[0].listeners.mousedown(mouse(500, 600));
  f.events.mousemove(mouse(-100, 3000));
  f.windowEvents.blur();
  assert.equal(f.window.KartoPinRenderer.isDragging(), false);
  assert.equal(f.frames.size, 0);
  assert.equal(f.state.pins[0].x, 0);
  assert.equal(f.state.pins[0].y, 1);
  assert.equal(f.saves(), 1);
  assert.equal(f.undo.length, 1);
});

test('Schriftzüge normalisieren Formdaten, erzeugen sichere eindeutige SVG-Pfade und überstehen Entwürfe', () => {
  const f = fixture();
  const lettering = f.window.KartoPinLettering;
  const style = lettering.normalize({ rotation: 900, width: -1, y1: -120, y2: 140, color: 'url(javascript:bad)', fontSize: 'NaN' });
  assert.equal(style.rotation, 180);
  assert.equal(style.width, 120);
  assert.equal(style.fontSize, 40);
  assert.equal(style.color, '#382714');
  const pin = { id: 'label', kind: 'text', title: '<script>Kein HTML</script>', lettering: style };
  const first = lettering.create(pin), second = lettering.create(pin);
  assert.notEqual(first.children[0].children[0].attributes.id, second.children[0].children[0].attributes.id);
  assert.equal(first.children[1].children[0].textContent, pin.title);
  assert.match(first.children[0].children[0].attributes.d, /-120.*140/);
  assert.equal(first.style.transform, 'rotate(180deg)');
  f.load('pin-editor-draft');
  const draft = f.window.KartoPinDraft.create(pin);
  draft.draft().lettering.rotation = 35;
  assert.equal(pin.lettering.rotation, 180);
  draft.reset();
  assert.equal(draft.draft().lettering.rotation, 180);
  draft.draft().lettering.y1 = -240;
  draft.commitInto(pin);
  const restored = JSON.parse(JSON.stringify(pin));
  assert.equal(restored.kind, 'text');
  assert.equal(restored.lettering.y1, -240);
  vm.runInContext(read('../assets/js/data/data-manager.js'), f.context);
  const imported = f.window.normalizePin(restored);
  assert.equal(imported.kind, 'text');
  assert.equal(imported.lettering.y1, -240);
});

test('Schriftzug-Pins werden ohne Punktsymbol dargestellt und geheime Schriftzüge bleiben ausgefiltert', () => {
  const f = fixture([
    { id: 'river', title: 'Fluss', kind: 'text', x: .5, y: .5, lettering: { rotation: 20, y1: -100, y2: -100 } },
    { id: 'secret', title: 'Geheimes Tal', kind: 'text', x: .2, y: .2, secret: true }
  ]);
  f.editing(false);
  f.load('pin-renderer');
  f.window.KartoPinRenderer.renderPins();
  assert.equal(f.layer.children.length, 1);
  const pin = f.layer.children[0];
  assert.equal(pin.classList.contains('pin-text'), true);
  assert.equal(pin.children[0].tag, 'svg');
  assert.equal(pin.innerHTML, '');
});

test('Schriftzug anlegen und stempeln erhält eine unabhängige Kopie der Formdaten', () => {
  const f = fixture([]);
  let nextId = 0;
  const opened = [];
  Object.assign(f.window.KartoRuntime, {
    uid: () => `new-${++nextId}`, firstCategoryId: () => 'other',
    setAddingPin() {}, addPin: pin => f.state.pins.push(pin), renderPins() {}, closeModal() {}, toast() {}
  });
  f.window.hint = () => {};
  f.window.KartoMapInteraction = { showPlacementCursor() {}, hidePlacementCursor() {}, resetCursor() {}, showStampCursor() {} };
  f.window.KartoPinEditor = { open: (...args) => opened.push(args) };
  f.context.document.getElementById = () => element();
  f.load('pin-templates');
  f.window.startAdd('text');
  f.window.placePin(300, 400);
  const original = f.state.pins[0];
  assert.equal(original.kind, 'text');
  assert.equal(original.x, .3);
  assert.equal(original.y, .4);
  assert.equal(original.lettering.fontSize, 40);
  assert.equal(opened[0][0], original.id);
  assert.equal(opened[0][1].isNew, true);
  original.lettering.rotation = 45;
  original.lettering.y1 = -120;
  f.load('stamp-overwrite');
  f.window.startStamp(original.id);
  f.window.placeStamp(600, 700);
  const copy = f.state.pins[1];
  assert.notEqual(copy.id, original.id);
  assert.equal(copy.kind, 'text');
  assert.equal(copy.lettering.rotation, 45);
  assert.equal(copy.x, .6);
  copy.lettering.y1 = 100;
  assert.equal(original.lettering.y1, -120);
});

test('Dauerhafte Dots sind standardmäßig aus und nur im Editor als Karteneinstellung änderbar', () => {
  const f = fixture();
  f.load('pin-visibility');
  assert.equal(f.checkbox.checked, false);
  assert.equal(f.layer.classList.contains('show-view-markers'), false);
  f.checkbox.checked = true;
  f.checkbox.listeners.change();
  assert.equal(f.state.showMarkers, true);
  assert.equal(f.saves(), 1);
  f.state.showMarkers = false;
  f.windowEvents['aleria:karto:state-changed']();
  assert.equal(f.checkbox.checked, false);
  f.editing(false);
  f.checkbox.checked = true;
  f.checkbox.listeners.change();
  assert.equal(f.state.showMarkers, false);
  assert.equal(f.saves(), 1);
});

test('Llysfaens Tabellen verwenden gemeinsame Fachvorlagen und die neuen Anzeigevorgaben', () => {
  const f = fixture();
  f.load('pin-templates');
  const templates = f.window.PIN_TEMPLATES;
  const data = JSON.parse(read('../Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen-bannkreis/llysfaen/data.json')).state;
  assert.equal(data.dotSize, 80);
  assert.equal(data.lblSize, 40);
  assert.equal(data.showMarkers, false);
  assert.equal(new Set(templates.map(t => t.id)).size, templates.length);
  for (const pin of data.pins) {
    const template = templates.find(t => t.id === pin.templateId);
    assert.ok(template, pin.title);
    assert.deepEqual(pin.table.map(row => row.k), Array.from(template.table, row => row.k));
    assert.equal(pin.table.find(row => row.k === 'Name').v, pin.title);
  }
  const garrison = data.pins.find(pin => pin.id === 'llysfaen-garnison');
  assert.match(garrison.table.find(row => row.k === 'Befehlshaber').v, /Gwydion Rhyddid/);
  assert.match(garrison.table.find(row => row.k === 'Besatzung').v, /15 Ortswachen, 10 Waffenknechte/);
});
