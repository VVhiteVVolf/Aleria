import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { buildHofMap, hofMapConfig, HOF_MAP_IMAGE, HOF_MAP_LINK } from '../modules/tirfelyn-hof/hof-map.mjs';
import { HOF_MAP_ID, HOF_MAP_FOLDER, HOF_POIS, HOF_MAPPED_POIS } from '../../shared/tirfelyn-hof/hof-pois.mjs';
import { hofMapMarker, HOF_MARKER_DEFINITIONS } from '../modules/tirfelyn-hof/hof-markers.mjs';
import { peopleGroups } from '../modules/people/people-model.mjs';
import { layoutRosterPopup } from '../modules/place-roster/place-roster-layout.mjs';
import { projectTirfelynOriginalPinImages, projectTirfelynOriginalPins } from './support/tirfelyn-hof-pin-history.mjs';
import { hofSceneDestination } from '../../shared/tirfelyn-hof/hof-areas.mjs';

const root = new URL('../../', import.meta.url);
test('older map-image guards project only the reviewed Tirfelyn change and reject unrelated edits', async () => {
  const data = JSON.parse(await readFile(new URL('Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json', root), 'utf8'));
  const projected = projectTirfelynOriginalPinImages(data.state.pins);
  const untouched = data.state.pins.filter(pin => pin.id !== 'gwynthor-marking-107');
  assert.deepEqual(projected.filter(pin => pin.id !== 'gwynthor-marking-107'), untouched);
  assert.equal(projected.find(pin => pin.id === 'gwynthor-marking-107').text, data.state.pins.find(pin => pin.id === 'gwynthor-marking-107').text);
  const full = projectTirfelynOriginalPins(data.state.pins);
  assert.deepEqual(full.filter(pin => pin.id !== 'gwynthor-marking-107'), untouched);
  assert(!full.find(pin => pin.id === 'gwynthor-marking-107').text.includes('Ortskarte des Tirfelyn-Hofs öffnen'));
  for (const patch of [{ x: 0 }, { title: 'Anderer Hof' }, { img: '/unreviewed.png' }, { imgLink: '/unreviewed' }, { text: 'Anderer Inhalt' }]) {
    assert.throws(() => projectTirfelynOriginalPinImages(data.state.pins.map(pin => pin.id === 'gwynthor-marking-107' ? { ...pin, ...patch } : pin)));
  }
});

test('the farm filters unused world categories while other maps and editing retain their lists', async () => {
  const map = buildHofMap(), bar = { innerHTML: '' };
  let config = hofMapConfig(), editing = false;
  const context = vm.createContext({ window: { KartoRuntime: {
    state: () => map.state, activeFilter: () => 'all', esc: text => text,
    config: () => config, isEditMode: () => editing
  } }, document: { getElementById: id => id === 'cat-bar' ? bar : null } });
  vm.runInContext(await readFile(new URL('../assets/js/pins/categories.js', import.meta.url), 'utf8'), context);
  context.window.renderCatBar();
  assert.ok(bar.innerHTML.includes('Wohnhäuser') && bar.innerHTML.includes('Arbeitsstätten'));
  assert.ok(!bar.innerHTML.includes('Felder und Weiden'));
  editing = true; context.window.renderCatBar(); assert.ok(bar.innerHTML.includes('Felder und Weiden'));
  editing = false; config = {}; context.window.renderCatBar(); assert.ok(bar.innerHTML.includes('Felder und Weiden'));
});
test('a long household list scrolls beside its trigger instead of covering the button', () => {
  for (const y of [60, 200]) {
    const group = { x: 180, y, width: 140, height: 43 }, viewport = { width: 320, height: 300 };
    const popup = layoutRosterPopup(group, viewport, 900);
    assert.ok(popup.x >= 8 && popup.x + popup.width <= 312);
    assert.ok(popup.y + popup.maxHeight <= 292);
    assert.ok(popup.y >= group.y + group.height + 8 || popup.y + popup.maxHeight <= group.y - 8);
  }
});
test('nine newly drawn farm pin types are registered and assigned only to sixteen houses and workplaces', async () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await readFile(new URL('../assets/js/data/default-marker-catalog.js', import.meta.url), 'utf8'), context);
  assert.equal(HOF_MARKER_DEFINITIONS.length, 9);
  assert.equal(buildHofMap().state.markerCatalog.length, 9);
  const used = new Set();
  for (const poi of HOF_POIS) {
    const marker = hofMapMarker(poi);
    if (!marker) { assert.ok(!HOF_MAPPED_POIS.includes(poi)); continue; }
    const entry = context.window.KARTO_DEFAULT_MARKER_CATALOG.find(entry => entry.id === marker.catalogId);
    assert.equal(marker.url, `/Karten/${entry.url}`);
    await readFile(new URL(marker.url.slice(1), root));
    assert.equal(buildHofMap().state.pins.find(pin => pin.id === `tirfelyn-${poi.key}`).pinMarker, marker.url);
    used.add(marker.catalogId);
  }
  assert.equal(used.size, 9);
  assert.equal(HOF_MAPPED_POIS.length, 16);
  assert.ok(!HOF_MAPPED_POIS.some(poi => /brunnen|acker|weide|garten|gehege|lager-|speicher|schuppen/.test(poi.key)));
  for (const marker of HOF_MARKER_DEFINITIONS) {
    const image = await readFile(new URL(`Karten/${marker.url}`, root));
    assert.equal(image.readUInt32BE(16), 256);
    assert.equal(image.readUInt32BE(20), 256);
    assert.equal(image[25], 6, 'RGBA-PNG');
  }
});
test('the registered local farm map uses one supplied image for normal and marker layers', async () => {
  const context = vm.createContext({ window: {}, encodeURIComponent });
  vm.runInContext(await readFile(new URL('../karten.registry.js', import.meta.url), 'utf8'), context);
  const entry = context.window.KartoMapRegistry.byId(HOF_MAP_ID);
  assert.equal(entry.status, 'active');
  assert.equal(entry.type, 'local');
  assert.deepEqual(Object.keys(entry.images), ['normal', 'pins']);
  assert.equal(entry.images.normal, entry.images.pins);
  const original = await readFile(new URL(`Karten/${HOF_MAP_IMAGE}`, root));
  const receipt = JSON.parse(await readFile(new URL('AleriaAlmanach/docs/art/tirfelyn-hof-20261116/map-source-receipt.json', root), 'utf8'));
  const previousOriginal = await readFile(new URL(receipt.previousOriginal, root));
  assert.equal(createHash('sha256').update(previousOriginal).digest('hex'), '6a36e7b71cbd4d0152b1aeca834a6e836f14ca0a9150bf90492c99a52530fc80');
  assert.equal(createHash('sha256').update(original).digest('hex'), receipt.sha256);
  assert.equal(createHash('sha256').update(await readFile(new URL(receipt.original, root))).digest('hex'), receipt.sha256);
  assert.equal(receipt.sourceBytesPreserved, true);
  assert.match(HOF_MAP_IMAGE, /\?v=20261116-map-v2$/);
  assert.equal(original.readUInt32BE(16), 4096);
  assert.equal(original.readUInt32BE(20), 4096);
  const config = hofMapConfig();
  assert.equal(config.markerPresentation, 'symbols');
  for (const descriptor of Object.values(config.rasterImages)) {
    assert.equal(descriptor.source, HOF_MAP_IMAGE);
    for (const level of descriptor.levels) await readFile(new URL(`Karten/${level.src}`, root));
  }
  assert.ok(!JSON.stringify(config).includes('Beschriftet'));
});

test('all sixteen mapped places have seven meaningful facts and link to the correct area scene', async () => {
  const source = await readFile(new URL('../assets/js/karto-app.js', import.meta.url), 'utf8');
  const context = vm.createContext({ esc: text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') });
  vm.runInContext(source.match(/function fmtText\(t\)\{[\s\S]*?\n\}/)[0], context);
  const map = buildHofMap();
  assert.equal(map.state.pins.length, 16);
  assert.equal(map.state.showMarkers, true);
  assert.equal(new Set(map.state.pins.map(pin => pin.id)).size, 16);
  for (const poi of HOF_MAPPED_POIS) {
    const pin = map.state.pins.find(pin => pin.id === `tirfelyn-${poi.key}`);
    assert.deepEqual([pin.x, pin.y], poi.position);
    assert.equal(pin.img, poi.image);
    assert.equal(pin.table.length, 7);
    assert.ok(pin.table.every(row => row.k && row.v.trim()));
    assert.equal(new Set(pin.table.map(row => row.k)).size, 7);
    assert.equal(pin.table.find(row => row.k === 'Eigentümer').v, 'Familie Tirfelyn');
    const target = hofSceneDestination(poi);
    assert.ok(pin.text.includes(encodeURIComponent(target.threadId)));
    assert.ok(context.fmtText(pin.text).includes(`?entry=${target.entryId}&amp;thread=`));
  }
});

test('only farm icons double in scale and the attached woodcutters homes keep their stable identities', () => {
  const map = buildHofMap();
  assert(map.state.pins.every(pin => pin.pinMarkerScale === 0.75 * 2));
  assert.equal(map.state.dotSize, 22);
  const hallvard = map.state.pins.find(pin => pin.id === 'tirfelyn-holzfaellerhaus-ost');
  const torleif = map.state.pins.find(pin => pin.id === 'tirfelyn-holzfaellerhaus-sued');
  assert(torleif.x > hallvard.x);
  assert(Math.hypot(hallvard.x - torleif.x, hallvard.y - torleif.y) < 0.025);
  assert(torleif.y < 0.14, 'Torleif must not be placed on the separate southern shed');
  assert.match(torleif.table.find(row => row.k === 'Lage').v, /angebaut/);
  assert.equal(torleif.table.find(row => row.k === 'Bewohner').v, 'Torleif');
});

test('the independent people layer assigns all twenty-eight living humans to their actual nine homes', async () => {
  const config = hofMapConfig(), map = buildHofMap();
  const snapshot = JSON.parse(await readFile(new URL('CharakterDatenbank/generated/characters.snapshot.json', root), 'utf8'));
  assert.equal(config.peopleLayer.label, 'Personen');
  const groups = peopleGroups(map.state.pins, config.peopleLayer.groups);
  assert.equal(groups.length, 9);
  assert.equal(groups.flatMap(group => group.members).length, 28);
  assert.equal(new Set(groups.flatMap(group => group.members.map(person => person.id))).size, 28);
  assert.equal(groups.find(group => group.pin.id === 'tirfelyn-bauernherrenhaus').members.length, 16);
  assert.deepEqual(groups.find(group => group.pin.id === 'tirfelyn-bedienstetenhuette-04').members.map(person => person.name), ['Meirig', 'Gwenneth', 'Iorfin', 'Eifor']);
  for (const group of groups) for (const person of group.members) {
    assert.ok(snapshot.characters.some(character => character.id === person.id), `Erreichbare Figurenakte: ${person.name}`);
    assert.ok(person.portrait);
    assert.ok(person.href.includes(encodeURIComponent(person.id)));
    assert.ok(!/Ceridwen|Bryn$|Rhos$|Cwm$/.test(person.name));
  }
  assert.equal(peopleGroups(map.state.pins, config.peopleLayer.groups, { filter: 'hof-arbeit' }).length, 0);
  assert.equal(peopleGroups(map.state.pins.map(pin => ({ ...pin, secret: true })), config.peopleLayer.groups).length, 0);
  assert.equal(peopleGroups([], config.peopleLayer.groups).length, 0);
});

test('the existing Bannkreis farm pin links through its main image and preserves its original coordinates', async () => {
  const parent = JSON.parse(await readFile(new URL('Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json', root), 'utf8'));
  const pin = parent.state.pins.find(pin => pin.id === 'gwynthor-marking-107');
  assert.deepEqual([pin.x, pin.y], [0.67431640625, 0.5049015873015873]);
  assert.equal(pin.imgLink, HOF_MAP_LINK);
  assert.match(pin.img, /bauernherrenhaus-v1\.png$/);
  assert.ok(pin.text.includes(HOF_MAP_LINK));
  const local = JSON.parse(await readFile(new URL(`Karten/${HOF_MAP_FOLDER}/data.json`, root), 'utf8'));
  assert.deepEqual(local, buildHofMap());
});
