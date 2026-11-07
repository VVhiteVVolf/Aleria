import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { LAND_FAMILIEN_ROSTER } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';
import { buildLandfamilienEntries } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';
import { SITE_BUILD_TASKS } from '../../netlify/build/site-build-tasks.mjs';

const root = new URL('../../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const mapRoot = 'Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/';

test('all 36 individual portraits and six active anime scenes exist in 2:3 and are distinct', () => {
  const entries = buildLandfamilienEntries();
  const paths = [
    ...LAND_FAMILIEN_ROSTER.families.flatMap(family => family.persons.map(person => person.portrait)),
    ...entries.flatMap(entry => entry.pages.filter(page => page.sessionPage).map(page => page.image))
  ];
  assert.equal(paths.length, 42);
  assert.equal(new Set(paths).size, 42);
  const hashes = new Set();
  for (const path of paths) {
    const bytes = readFileSync(new URL(path.replace(/^\//, ''), root));
    assert.equal(bytes.subarray(1, 4).toString('ascii'), 'PNG', path);
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.equal(width / height, 2 / 3, path);
    assert.ok(width >= 1024 && height >= 1536, path);
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, 42, 'Each person and scene needs its own image');
});

test('the Almanach loads the three modules and the normal build checks their actual sources', () => {
  const html = read('AleriaAlmanach/AleriaAlmanach.html');
  assert.equal((html.match(/src="\.\/modules\/gwynthor-landfamilien\/landfamilien-data\.js\?/g) || []).length, 1);
  const task = SITE_BUILD_TASKS.find(task => task.id === 'gwynthor-landfamilien');
  assert.ok(task);
  for (const source of ['AleriaAlmanach/modules/gwynthor-landfamilien/', 'AleriaAlmanach/assets/gwynthor-landfamilien/']) {
    assert.ok(task.inputs.includes(source));
  }
  assert.ok(task.commands.some(command => command.includes('AleriaAlmanach/scripts/build-gwynthor-landfamilien.mjs') && command.includes('--check')));
});

test('map profiles retain their seven coordinates and share the requested family and death facts', () => {
  const source = JSON.parse(read(`${mapRoot}fleischsammler-localities.source.json`));
  const map = JSON.parse(read(`${mapRoot}data.json`));
  assert.equal(map.state.pins.length, 170);
  for (const location of source.locations) {
    const pin = map.state.pins.find(pin => pin.id === location.pinId);
    assert.deepEqual([pin.x, pin.y], location.position);
    for (const [field, expected] of Object.entries(location.patch)) assert.deepEqual(pin[field], expected);
  }
  const tir = map.state.pins.find(pin => pin.id === 'gwynthor-marking-107');
  const hel = map.state.pins.find(pin => pin.id === 'gwynthor-marking-115');
  assert.match(tir.text, /Ceridwen Tirfelyn/);
  assert.match(tir.text, /Gorwyn Helfaen/);
  assert.match(tir.text, /1740/);
  assert.match(tir.text, /folgenden Morgen/);
  assert.match(hel.text, /Ceridwen Tirfelyn/);
  assert.match(hel.text, /Gorwyn Helfaen/);
  const helNames = LAND_FAMILIEN_ROSTER.families.find(family => family.slug === 'helfaen').persons.map(person => person.name.split(' ')[0]);
  for (const name of helNames) assert.ok(hel.text.includes(name), name);
});
