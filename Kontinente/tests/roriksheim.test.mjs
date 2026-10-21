import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { describePlace, territoriesById, descriptionsById } from '../../Karten/Aldrimar/roriksheim/places.mjs';
import { placesById } from '../modules/roriksheim/places.mjs';
import { createTerritory } from '../modules/roriksheim/territory-page.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const folder = 'Karten/Aldrimar/roriksheim/';
const source = json(folder + 'markers.source.json');
const snapshot = json(folder + 'data.json');
const pins = snapshot.state.pins;
const original = json(folder + 'source-markers.json');
const review = json(folder + 'transfer.generated.json');
const decisions = json(folder + 'import-decisions.source.json');
const articles = json('Kontinente/modules/roriksheim/pages.source.json').pages;
const ui = { window: {} };
for (const name of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(read('Kontinente/' + name), ui);
const pages = articles.map(a => createTerritory(a.id, ui.window.ALERIA_HERRSCHAFT_DATA));
const page = id => pages.find(p => p.meta.id === id);
const article = id => articles.find(p => p.id === id);
const pin = title => pins.find(p => p.title === title);
const places = id => page(id).view.geography.domains.flatMap(d => d.sections.flatMap(s => s.places));
const houses = id => page(id).view.familySections.flatMap(s => s.cards).map(h => h.id);
const fields = pin => Object.fromEntries(pin.table.map(row => [row.k, row.v]));
const catalog = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) vm.runInContext(read('Karten/assets/js/pins/' + file), catalog);

test('all supplied articles and the three new map images remain byte-verifiable', () => {
  const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  for (const entry of json(folder + 'sources/attachments.json')) {
    assert.equal(sha(fs.readFileSync(new URL(folder + 'sources/' + entry.file, root))), entry.sha256);
  }
  for (const image of json(folder + 'images.source.json')) {
    assert.deepEqual(image.sourceSize, [4096, 2734]);
    assert.equal(sha(fs.readFileSync(new URL(folder + image.file, root))), image.sha256);
  }
});

test('168 stable pins use exact new positions while retaining the old coordinate evidence', () => {
  assert.equal(pins.length, 168);
  assert.equal(new Set(pins.map(p => p.id)).size, 168);
  assert.deepEqual(source.imageSize, [4096, 2734]);
  assert.equal(pins.filter(p => p.sourceRef.provider === 'worldanvil').length, 153);
  for (const marker of source.markers) {
    const runtime = pins.find(p => p.id === marker.id);
    const target = marker.sourceRef.targetPosition;
    assert.ok(target, marker.id);
    assert.equal(runtime.x, target.x / 4096);
    assert.ok(Math.abs(runtime.y - target.y / 2734) < 1e-14);
    assert.equal(runtime.secret, false);
    const assignment = decisions.assignments.find(a => a.targetId === target.mapPositionId);
    assert.ok(assignment);
    if (runtime.sourceRef.provider === 'worldanvil') {
      const old = original.markers.find(m => m.id === runtime.sourceRef.markerId);
      assert.equal(runtime.id, 'roriksheim-' + old.id);
      assert.deepEqual(runtime.sourceRef.coordinates, old.coordinates);
      assert.deepEqual(runtime.sourceRef.imageSize, [4096, 2656]);
      assert.equal(assignment.sourceId, old.id);
    }
  }
  assert.equal(new Set(pins.map(p => p.sourceRef.targetPosition.mapPositionId)).size, 168);
});

test('the regular map is discoverable and exposes live icons and all three supplied images', () => {
  const maps = { window: {} };
  vm.runInNewContext(read('Karten/karten.registry.js'), maps);
  const registered = maps.window.KartoMapRegistry.byId('aldrimar-roriksheim');
  assert.equal(registered.status, 'active');
  assert.equal(registered.dataPath, folder.replace('Karten/', '') + 'data.json');
  assert.equal(snapshot.state.showMarkers, true);
  assert.deepEqual([snapshot.state.dotSize, snapshot.state.lblSize], [80, 50]);
  assert.equal(snapshot.state.mapImages.pins, '');
  assert.ok(snapshot.state.extraLayers.some(l => l.id === 'roriksheim-original-markers'));
  assert.ok(pins.every(p => p.pinMarkerScale === 0.6));
  assert.ok(!snapshot.state.zones?.length);
});

test('15 registered pages reuse the common territory UI and give each positioned place a map link', () => {
  const entries = ui.window.KONTINENTE_REGISTRY.filter(e => e.page.includes('Jarltum Roriksheim/'));
  assert.equal(entries.length, 15);
  assert.equal(territoriesById.size, 15);
  for (const entry of entries) {
    const html = read('Kontinente/' + entry.page);
    assert.match(html, /data-herrschaft-shell/);
    assert.ok(fs.existsSync(new URL('Kontinente/' + entry.data.split('?')[0], root)));
    assert.match(html, /herrschaft-page\.js/);
    assert.doesNotMatch(html, /on(?:click|change|input)=/i);
  }
  assert.equal(places('jarltum-roriksheim').length, 108);
  const registeredPlaces = pages.flatMap(p => p.view.geography.domains.flatMap(d => d.sections.flatMap(s => s.places)));
  assert.equal(new Set(registeredPlaces.map(p => p.id)).size, 173);
  assert.equal(descriptionsById.size, 173);
  for (const p of pins) {
    const place = placesById.get(p.id);
    assert.equal(place.description, p.text);
    assert.equal(place.house, p.house);
    assert.equal(place.href, `/Karten/karte.html?map=aldrimar-roriksheim&pin=${p.id}`);
  }
  assert.match(read('Kontinente/Estryll/Königreich Aldrimar/Königreich von Aldrimar.html'), /href="\/Kontinente\/Estryll\/Königreich Aldrimar\/Jarltum Roriksheim\/Jarltum Roriksheim.html"/);
});

test('Hornhall is physically in Dämmergrund, uses Wolfshorn heraldry and keeps Bjoerns succession', () => {
  const h = pin('Hornhall');
  assert.equal(h.sourceRef.targetPosition.mapPositionId, 'new-pin-137');
  assert.deepEqual([h.sourceRef.targetPosition.x, h.sourceRef.targetPosition.y], [2468.5, 2120]);
  assert.equal(h.house, 'Clan Wolfshorn');
  assert.equal(fields(h).Lehensherr, 'Clan Vangandr');
  assert.equal(fields(h)['Geografische Lage'], 'Thanentum Dämmergrund');
  assert.equal(fields(h)['Herr des Sitzes'], 'Bjoern Wolfshorn');
  assert.match(h.text, /Ylva und Asgeir sowie sein Bruder Halvar/);
  assert.doesNotMatch(h.text, /Dämmertal/);
  assert.equal(territoriesById.get(h.dominionId).parentId, 'thanentum-daemmergrund');
  assert.ok(places('thanentum-daemmergrund').some(p => p.id === h.id));
  assert.ok(!places('hesirentum-daemmertal').some(p => p.id === h.id));
  assert.ok(!places('jarltum-roriksheim').some(p => p.id === h.id));
  assert.ok(places('grenzsitz-hornhall').some(p => p.id === h.id));
  assert.match(article('grenzsitz-hornhall').copy.overview.join(' '), /in Dämmergrund/);
  assert.equal(pin('Hjamstad').sourceRef.targetPosition.mapPositionId, 'new-pin-123');
  assert.equal(pin('Hjamstad').dominionId, 'hesirentum-daemmertal');
  assert.ok(pin('Burg Horunn'));
});

test('three Schwarzdorn exclaves appear with the owner and in the host territory register', () => {
  for (const [title, host] of [['Maltvik - Schwarzdorn Brauerei', 'thanentum-schwerthohn'], ['Schwarzhof - Schwarzdorn Brauerei', 'hesirentum-winterfaenge'], ['Dornquell', 'thanentum-klangheim']]) {
    const p = pin(title);
    assert.equal(p.house, 'Clan Schwarzdorn');
    assert.equal(p.dominionId, 'hesirentum-schwarzdorn');
    assert.ok(places('hesirentum-schwarzdorn').some(item => item.id === p.id));
    assert.ok(places(host).some(item => item.id === p.id));
    assert.equal(fields(p).Sonderstellung, 'Schwarzdorn-Exklave');
  }
  assert.equal(pins.filter(p => p.title === 'Dornquell').length, 1);
  assert.equal(pin('Dornquell').sourceRef.provider, 'aleria');
});

test('displaced settlements, personal castle ownership and revised descriptions agree with the current territories', () => {
  assert.equal(pin('Solvårhof').dominionId, 'hesirentum-daemmertal');
  assert.equal(pin('Bjoernsfurt').dominionId, 'hesirentum-sterkr');
  for (const title of ['Vikheimskirch', 'Fjellheim', 'Grønnstad', 'Helleheim', 'Dalsjö', 'Hovstad', 'Hjorthof']) assert.equal(pin(title).dominionId, 'thanentum-schwerthohn');
  const estate = pin('Alfarsborg');
  assert.equal(estate.dominionId, 'thanentum-schwerthohn');
  assert.equal(estate.house, 'Clan Skjegg');
  assert.equal(estate.crest, territoriesById.get('hesirentum-schwarzacker').crest);
  assert.ok(places('hesirentum-schwarzacker').some(p => p.id === estate.id));
  assert.match(article('hesirentum-winterfaenge').copy.overview[0], /im Osten von Roriksheim/);
  assert.doesNotMatch(article('hesirentum-winterfaenge').copy.economy[2], /Solvårhof/);
  assert.match(pin('Jorundsfried').text, /Universität/);
  assert.match(pin('Vågsund').text, /wieder eine bewohnte Siedlung/);
  assert.match(pin('Hirdmannsruh').text, /Heute wird.*wieder gehandelt/);
  assert.match(pin('Maltvik - Schwarzdorn Brauerei').text, /geografisch in Schwerthohn/);
  assert.doesNotMatch(pin('Maltvik - Schwarzdorn Brauerei').text, /Schwarzacker/);
  assert.match(pin('Lindalsfried').text, /verfallene Tempelsiedlung/);
  assert.match(pin('Bjoernsfurt').text, /Bauernsiedlung im Gebiet der Sterkr/);
  assert.equal(pin('Fjellborg').faction, 'Frostwölfe');
});

test('local clan hierarchies include all 33 existing clans without flattening subordinate courts', () => {
  const allHouses = new Set(pages.flatMap(p => p.view.familySections.flatMap(s => s.cards.map(h => h.id))));
  assert.equal(allHouses.size, 33);
  assert.ok(!houses('jarltum-roriksheim').includes('haus-skjegg'));
  assert.ok(!houses('jarltum-roriksheim').includes('haus-nachtjaeger'));
  assert.ok(!houses('jarltum-roriksheim').includes('haus-skald'));
  assert.ok(houses('thanentum-schwerthohn').includes('haus-skjegg'));
  assert.ok(houses('thanentum-daemmergrund').includes('haus-wolfshorn'));
  assert.ok(houses('hesirentum-skald').includes('haus-eisenjungfer'));
  assert.ok(!houses('thanentum-klangheim').includes('haus-eisenjungfer'));
  assert.equal(page('jarltum-roriksheim').view.familySections.at(-1).variant, 'extinct');
  assert.equal(page('grenzsitz-hornhall').view.councilGroups[0].members[0].name, 'Bjoern Wolfshorn');
  assert.equal(page('thanentum-rorikstal').view.councilGroups[0].members[0].name, 'Sleipnir Varulv');
  assert.equal(page('hesirentum-schwarzdorn').view.councilGroups[0].members[0].href.includes('tormund-1713'), true);
  assert.equal(page('region-roriksheim-dunkelhain').view.councilGroups.length, 0);
});

test('the Jarltum expands seven primary domains with their own places while keeping subordinate domains nested', () => {
  const geography = page('jarltum-roriksheim').view.geography;
  const primaryIds = ['thanentum-rorikstal', 'hesirentum-schwarzdorn', 'hesirentum-kampfgeborene', 'hesirentum-winterfaenge', 'thanentum-klangheim', 'thanentum-daemmergrund', 'thanentum-schwerthohn'];
  assert.deepEqual(geography.domains.map(d => d.territoryId), primaryIds);
  assert.ok(!geography.links?.length);
  assert.deepEqual(geography.domains.map(d => d.sections.flatMap(s => s.places).length), [7, 19, 10, 15, 3, 24, 30]);
  for (const domain of geography.domains) {
    const own = page(domain.territoryId).view.geography.domains.find(d => d.territoryId === domain.territoryId);
    assert.deepEqual(domain, own);
  }
  const visiblePlaces = places('jarltum-roriksheim');
  assert.equal(new Set(visiblePlaces.map(p => p.id)).size, visiblePlaces.length);
  assert.deepEqual(visiblePlaces.map(p => p.id).sort(), source.markers.filter(m => primaryIds.includes(m.territoryId)).map(m => m.id).sort());
  assert.ok(visiblePlaces.some(p => p.name === 'Rorikshall'));
  for (const name of ['Hornhall', 'Grabesruh', 'Burg Horunn', 'Bjoernsfurt', 'Bjarnstatt', 'Dornheil']) {
    assert.ok(!visiblePlaces.some(p => p.name === name), name);
  }
  assert.ok(page('thanentum-schwerthohn').view.geography.links.some(l => l.id === 'hesirentum-schwarzacker'));
  assert.ok(page('thanentum-daemmergrund').view.geography.links.some(l => l.id === 'hesirentum-daemmertal'));
  assert.equal(page('thanentum-klangheim').view.geography.links.length, 3);
  assert.ok(!places('thanentum-schwerthohn').some(p => p.name === 'Grabesruh'));
  assert.ok(!places('thanentum-daemmergrund').some(p => p.name === 'Burg Horunn'));
  assert.ok(!places('thanentum-klangheim').some(p => p.name === 'Bjoernsfurt'));
});

test('current symbols, templates, local crests, banners and council portraits all exist', () => {
  const asset = url => { if (url?.startsWith('/')) assert.ok(fs.existsSync(new URL('.' + url, root)), url); };
  for (const p of pins) {
    assert.ok(catalog.KartoPinTemplateCatalog.get(p.templateId), p.templateId);
    assert.ok(catalog.KartoCategoryCatalog.definition({ label: source.markers.find(m => m.id === p.id).category }));
    [p.pinMarker, p.crest, p.banner].forEach(asset);
  }
  for (const p of pages) {
    p.view.familySections.flatMap(s => s.cards).forEach(h => asset(h.imageSrc));
    p.view.councilGroups.flatMap(g => g.members).forEach(m => asset(m.imageSrc));
  }
  for (const id of ['thanentum-rorikstal', 'hesirentum-schwarzdorn', 'hesirentum-kampfgeborene']) {
    assert.equal(territoriesById.get(id).banner, territoriesById.get('jarltum-roriksheim').banner);
    assert.ok(!page(id).view.article.crestSrc.includes('aldrimar-rorikstal.png'));
  }
});

test('unresolved data remain explicit without invented names, texts or coordinates', () => {
  assert.equal(pins.filter(p => p.title.startsWith('Unbenannte ')).length, 13);
  assert.equal(pins.filter(p => p.text).length, 148);
  for (const p of pins.filter(p => !p.text)) assert.ok(fields(p).Quellenstand, p.title);
  assert.equal(source.unpositionedPlaces.length, 5);
  for (const m of source.unpositionedPlaces) {
    assert.equal(m.x, undefined); assert.equal(m.y, undefined);
    assert.equal(placesById.get(m.id).href, '');
    assert.ok(!pins.some(p => p.id === m.id));
  }
  for (const id of [...decisions.excludedSourceIds, ...decisions.embeddedSourceIds, decisions.routeSourceId]) assert.ok(!pins.some(p => p.sourceRef.markerId === id));
  assert.ok(!pins.some(p => /Hornlingsstamm|Schlacht|Betrunkener Eber|Frostkrug/.test(p.title)));
});

test('repeat imports verify the snapshot and refuse to overwrite subsequently edited maps', () => {
  const options = {folder: new URL(folder, root), region: 'Roriksheim', countyId: 'jarltum-roriksheim', describePlace, territoriesById};
  const before = read(folder + 'data.json');
  importReviewedTerritory(options);
  assert.throws(() => importReviewedTerritory({...options, write: true}), /bereits bearbeitet/);
  assert.equal(read(folder + 'data.json'), before);
});

test('direct pin links wait for map readiness and never expose secret pins', () => {
  const run = ({query = '', pin, width = 4096}) => {
    const opened = [], listeners = new Map();
    const context = {URL, document: {getElementById: () => null}, window: {
      location: {href: 'http://localhost/Karten/karte.html?map=aldrimar-roriksheim' + query},
      KartoRuntime: {mapImageSize: () => ({width}), state: () => ({pins: pin ? [pin] : []})},
      KartoPinNavigation: {focus: id => (opened.push(['focus', id]), true)},
      KartoPinDetailView: {open: id => opened.push(['open', id])},
      addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name),
    }};
    vm.runInNewContext(read('Karten/assets/js/pins/pin-deep-link.js'), context);
    return {opened, listeners};
  };
  assert.equal(run({query: '&pin=hornhall', pin: {id: 'hornhall'}}).opened.length, 2);
  assert.equal(run({query: '&pin=hornhall', pin: {id: 'hornhall', secret: true}}).opened.length, 0);
  assert.equal(run({query: '&pin=hornhall', pin: {id: 'hornhall'}, width: 0}).opened.length, 0);
  assert.equal(run({pin: {id: 'hornhall'}}).listeners.size, 0);
});
