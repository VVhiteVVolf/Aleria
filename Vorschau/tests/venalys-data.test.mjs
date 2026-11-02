import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { houses } from '../Venalys/house-data.mjs';
import { warriors } from '../Venalys/warrior-data.mjs';
import { districts, pointsOfInterest, mapGeometry } from '../Venalys/territory-data.mjs';
import { context } from '../Venalys/realm-context.mjs';
import { createAssignmentState } from '../Venalys/assignment-state.mjs';
import { FAMILY_REGISTRY, getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = new URL('../../', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, root), 'utf8'));
const banned = read('Vorschau/Venalys/sources/name-ban.json').names;
const normalizeName = value => String(value).replace(/^(?:Haus|Clan)\s+/i, '').normalize('NFD').replace(/\p{M}/gu, '').trim().toLocaleLowerCase('de');
const inside = ([x, y], polygon) => {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

test('five supplied patrician houses have exactly the confirmed 17 Magnarier vassals and no lower estates', () => {
  assert.equal(houses.length, 22);
  const patrons = houses.filter(h => h.rank === 'patrician'), vassals = houses.filter(h => h.rank === 'magnarian');
  assert.deepEqual(new Set(patrons.map(h => h.id)), new Set(['vinicius', 'avenicci', 'abor', 'tullius', 'arentino']));
  assert.equal(vassals.length, 17);
  assert.equal(new Set(houses.map(h => h.id)).size, 22);
  assert.equal(patrons.length + vassals.length, houses.length);
  for (const [id, count] of Object.entries({ vinicius: 5, avenicci: 5, abor: 3, tullius: 2, arentino: 2 }))
    assert.equal(vassals.filter(h => h.liegeId === id).length, count, id);
  for (const [id, liege] of [['falto', 'vinicius'], ['nerva', 'vinicius'], ['falveri', 'avenicci'], ['ergalla', 'avenicci']])
    assert.equal(houses.find(h => h.id === id).liegeId, liege);
  for (const house of houses) assert.ok(house.crest && house.fullsize && house.role);
  assert.deepEqual(context.founders.map(f => [f.houseId, f.plural]), [
    ['vinicius', 'Vinicier'], ['avenicci', 'Avenicci'], ['abor', 'Abori'], ['tullius', 'Tullier'], ['arentino', 'Arentino'],
  ]);
});

test('new house names avoid screenshot bans and every already registered house, including incidental house references', () => {
  const registered = new Set(FAMILY_REGISTRY.flatMap(record => [record.title, ...record.family.houses.map(h => h.name)]).map(normalizeName));
  const forbidden = new Set(banned.map(normalizeName));
  const fresh = houses.filter(h => h.isNew);
  assert.equal(fresh.length, 13);
  for (const house of fresh) {
    assert.ok(!registered.has(normalizeName(house.name)), `${house.name} already occurs as a house`);
    assert.ok(!forbidden.has(normalizeName(house.name)), `${house.name} is prohibited`);
    assert.equal(getRegisteredFamily(`haus-${house.id}`), null, `${house.name} remains a preview`);
  }
  for (const id of ['bellaratus', 'legarinus', 'discipian']) assert.ok(fresh.some(h => h.id === id));
});

test('13 neutral district polygons and 78 outside points use the same unchanged source map geometry', () => {
  assert.equal(districts.length, 13); assert.equal(pointsOfInterest.length, 78);
  assert.equal(new Set([...districts, ...pointsOfInterest].map(t => t.id)).size, 91);
  const sources = read('Vorschau/Venalys/assets.source.json');
  for (const filename of ['Venalys Normal.png', 'Venalys (Bezirke).png']) {
    const map = sources.find(s => s.sourceFile === filename);
    assert.ok(map);
    assert.deepEqual(map.dimensions, [mapGeometry.width, mapGeometry.height]);
    assert.equal(map.publishedOriginal, false);
  }
  const validPoint = point => Array.isArray(point) && point.length === 2 && point.every(v => Number.isFinite(v) && v >= 0 && v <= 100);
  for (const [index, district] of districts.entries()) {
    assert.equal(district.name, `Bezirk ${String(index + 1).padStart(2, '0')}`);
    assert.ok(validPoint(district.point)); assert.ok(district.polygon.length >= 3);
    assert.ok(district.polygon.every(validPoint)); assert.ok(inside(district.point, district.polygon), district.id);
  }
  for (const point of pointsOfInterest) {
    assert.ok(validPoint(point.point), point.id);
    assert.ok(districts.every(d => !inside(point.point, d.polygon)), `${point.id} is outside the city districts`);
    assert.ok(point.sourceKind && point.description, point.id);
    assert.ok(!banned.some(name => normalizeName(point.name) === normalizeName(name)));
  }
  const taverns = pointsOfInterest.filter(p => /Taverne/.test(p.kind));
  const estates = pointsOfInterest.filter(p => p.kind === 'Anwesen');
  assert.equal(taverns.length, 6); assert.ok(taverns.every(p => p.name === 'Taverne, Herberge oder Bordell'));
  assert.equal(estates.length, 14); assert.ok(estates.every(p => /^Anwesen \d\d$/.test(p.name)));
  const named = pointsOfInterest.filter(p => !taverns.includes(p) && !estates.includes(p));
  assert.equal(new Set(named.map(p => normalizeName(p.name))).size, 58);
});

test('every Magnarier has a noble military representation and the two requested patrician figures are additional', () => {
  const required = houses.filter(h => h.rank === 'magnarian').map(h => h.id);
  assert.equal(warriors.length, 19);
  assert.deepEqual(new Set(warriors.map(w => w.id)), new Set([...required, 'avenicci', 'abor']));
  for (const warrior of warriors) {
    assert.ok(['condottieri', 'gondoleri', 'lancieri', 'stralieri'].includes(warrior.classId));
    assert.equal(warrior.withHorse, false);
    assert.ok(warrior.equipment && warrior.reason && warrior.palette.length);
    assert.ok(fs.existsSync(new URL(warrior.classHref, new URL('Vorschau/Venalys/', root))));
  }
  assert.equal(context.continent, 'Tirnara');
  assert.equal(context.governance.watch.size, 1000);
  assert.equal(context.governance.watch.leader, 'Legat');
  assert.match(context.governance.watch.text, /getrennt/);
  assert.match(context.governance.senate, /ab 30/);
});

test('Venalys runtime dependency closure is publishable without its excluded authoring source archive', () => {
  const seen = new Set();
  function visit(url) {
    const file = path.relative(fileURLToPath(root), fileURLToPath(url)).replaceAll('\\', '/');
    if (seen.has(file)) return; seen.add(file);
    assert.ok(shouldPublish(file), `${file} must reach the static runtime`);
    assert.ok(!file.startsWith('Vorschau/Venalys/sources/'));
    const text = fs.readFileSync(url, 'utf8');
    for (const match of text.matchAll(/^import\s+(?:[^;]*?\s+from\s+)?['"]([^'"]+)['"]/gm)) {
      assert.ok(match[1].startsWith('.'), `${file} has no unresolved server/package imports`);
      const dependency = new URL(match[1], url); dependency.search = ''; dependency.hash = '';
      visit(dependency);
    }
  }
  visit(new URL('Vorschau/Venalys/proposal-page.mjs', root));
  assert.ok(seen.has('Vorschau/Venalys/house-catalog.json'));
  for (const file of ['Vorschau/Venalys/index.html', 'Vorschau/Venalys/venalys.css', 'Vorschau/Venalys/assets/map.webp',
    'Vorschau/Venalys/assets/map-districts.webp', 'Vorschau/Venalys/assets/originals/venalys.png',
    'Vorschau/Aeldrunmar/assets/originals/kendryck.png']) assert.ok(shouldPublish(file));
  for (const file of ['Vorschau/Venalys/sources/house-plans.json', 'Vorschau/Venalys/sources/name-ban.json',
    'Vorschau/Venalys/sources/originals/map-normal.png', 'diagnostics/venalys-20261102/map-normal.jpg'])
    assert.equal(shouldPublish(file), false);
});

test('district editing and multi-assignment leave confirmed family residence metadata unchanged', () => {
  const falto = getRegisteredFamily('haus-falto'), falveri = getRegisteredFamily('haus-falveri');
  const before = [falto, falveri].map(r => JSON.stringify(r.family.document.houseProfile));
  const state = createAssignmentState({ houseIds: houses.map(h => h.id), districts, pointIds: pointsOfInterest.map(p => p.id) });
  state.renameDistrict(districts[0].id, 'Neuer Name im Entwurf');
  for (const house of [falto, falveri]) {
    const id = house.id.replace(/^haus-/, '');
    state.assign(id, districts[0].id); state.assign(id, districts[1].id); state.assign(id, pointsOfInterest[0].id);
  }
  assert.deepEqual([falto, falveri].map(r => JSON.stringify(r.family.document.houseProfile)), before);
  assert.deepEqual(falto.folderPath, ['Venalys']); assert.deepEqual(falveri.folderPath, ['Venalys']);
});
