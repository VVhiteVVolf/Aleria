import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import source from '../modules/schwarzfische/sources/hierarchy-online-20261116.json' with { type: 'json' };
import { buildSchwarzfische, SCHWARZFISCHE_MODULE_ID } from '../modules/schwarzfische/schwarzfische-module.mjs';
import { buildGrennCharacterExport } from '../modules/schwarzfische/schwarzfische-characters.mjs';

const entry = buildSchwarzfische();
const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
const read = file => fs.readFileSync(new URL(file, import.meta.url), 'utf8');
const context = vm.createContext({
  document: { addEventListener() {} }, escapeHtml: value => String(value || ''),
  sanitizeImageSrc: value => value, sanitizeContentHtml: value => value
});
for (const file of ['module-editor/module-editor-data', 'hierarchy/hierarchy-renderer']) {
  vm.runInContext(read(`../modules/${file}.js`), context);
}
const clean = value => JSON.parse(JSON.stringify(context.sanitizeHierarchyData(value)));

test('the existing module and every original page thread keep their identities', () => {
  assert.equal(entry.id, SCHWARZFISCHE_MODULE_ID);
  assert.equal(entry.pages.length, 5);
  assert.equal(entry.type, 'Söldnerbanner');
  assert(entry.symbol);
  assert.doesNotMatch(entry.stamp, /BEREICH|ORT|WELT/);
  for (const page of source.pages.filter(page => page.commentThreadKey !== undefined)) {
    assert(entry.pages.some(candidate => candidate.commentThreadKey === page.commentThreadKey));
  }
  const previousScene = source.pages.find(page => page.sessionPage);
  const scene = entry.pages.find(page => page.sessionPage);
  assert.deepEqual(scene.sessionDateAleria, previousScene.sessionDateAleria);
  assert.equal(scene.commentThreadKey, previousScene.commentThreadKey);
  assert.equal(entry.sessionCast.length, source.sessionCast.length);
});

test('the core retains its members, replaces Zibhi with Grenn and adds four reserve posts', () => {
  const nodes = hierarchy.trees[0].levels.flatMap(level => level.nodes);
  const names = nodes.map(node => node.title);
  for (const name of ['Cynwrig Pysgod', 'Selene', 'Arvel', 'Aeron Eryr', 'Bjoern Skald', "Trystan O'Cenyr", 'Rolard', "Ysolde O'Cenyr", 'Vaughn', 'Gwyneira', 'Avira', 'Grenn Coelret']) assert(names.includes(name), name);
  assert(!names.includes('Zibhi'));
  assert.equal(hierarchy.trees[0].levels.at(-1).nodes.length, 4);
  assert(nodes.every(node => node.portrait));
});

test('administration has the requested command, adjutant, two-by-four council, vogt and three-by-four offices', () => {
  const tree = hierarchy.trees[1];
  assert.equal(tree.label, 'Administration');
  assert.deepEqual(tree.levels.map(level => level.nodes.length), [1, 1, 8, 1, 12]);
  assert.equal(tree.levels[0].nodes[0].title, 'Cynwrig Pysgod');
  assert.match(tree.levels[1].nodes[0].title, /Adjutant/);
  assert.equal(tree.levels[2].columns, 4);
  assert.equal(tree.levels[3].nodes[0].title, 'Sinead');
  assert.match(tree.levels[3].nodes[0].subtitle, /Gildenvogt/);
  assert.equal(tree.levels[4].columns, 4);
  assert(tree.levels[2].nodes.some(node => node.title === 'Gildenherold'));
  assert(tree.levels[2].nodes.some(node => node.title === 'Alara'));
  assert(tree.levels[2].nodes.some(node => node.title === 'Colm'));
});

test('captains and site leaders occupy two equal rows of three, including two unnamed sites', () => {
  const tree = hierarchy.trees[2];
  assert.equal(tree.label, 'Führungspersonen');
  assert.equal(tree.levels[0].columns, 3);
  assert.equal(tree.levels[0].nodes.length, 6);
  const content = JSON.stringify(tree);
  for (const text of ['Windfeste', 'Windfeld', 'Schwarzen Flut', 'Schattenschuppe', 'Standort unbenannt I', 'Standort unbenannt II']) assert(content.includes(text), text);
});

test('ten named troops each have a crest, sergeant, two lieutenants and eight purpose-led roles', () => {
  const tree = hierarchy.trees[3];
  assert.equal(tree.levels.length, 30);
  for (let index = 0; index < 30; index += 3) {
    assert.match(tree.levels[index].label, /^Schwarzfisch Trupp [IVX]+\. · Schwarze /);
    assert.match(tree.levels[index].emblem, /crests\/trupp-/);
    assert.equal(tree.levels[index].startsGroup, true);
    assert.equal(tree.levels[index].nodes.length, 1);
    assert.match(tree.levels[index].nodes[0].title, /Unteroffizier/);
    assert.equal(tree.levels[index + 1].columns, 2);
    assert.equal(tree.levels[index + 1].nodes.length, 2);
    assert(tree.levels[index + 1].nodes.every(node => node.title.includes('Leutnant')));
    assert.equal(tree.levels[index + 2].columns, 4);
    assert.equal(tree.levels[index + 2].nodes.length, 8);
  }
  assert.equal(new Set(tree.levels.filter(level => level.emblem).map(level => level.emblem)).size, 10);
  for (const name of ['Froa', 'Breff', 'Ailis Dorn', 'Hotemra']) assert(tree.levels[2].nodes.some(node => node.title === name));
  assert.deepEqual(tree.levels[5].nodes.map(node => node.title), ['Kundschafter', 'Kleriker', 'Heiler', 'Aufspürer', 'Kämpfer', 'Schütze', 'Jäger', 'Versorger']);
});

test('every role has one or two neutral sentences, an icon and a portrait', () => {
  for (const tree of hierarchy.trees) for (const level of tree.levels) for (const node of level.nodes) {
    assert(node.portrait, node.title);
    assert(node.subtitle, node.title);
    assert.doesNotMatch(node.text, /\b(Cynwrig|Sinead|Selene|Arvel|Colm|Alara|Grenn|Aeron|Zibhi)\b/);
    const sentences = node.text.split(/[.!?]+/).filter(sentence => sentence.trim());
    assert(sentences.length >= 1 && sentences.length <= 2, node.title);
  }
  assert.doesNotMatch(JSON.stringify(entry), /\?\?\?|Amtsbeschreibung|Erzählerischer Einstieg|Ein kurzer Kommentar|Ein markantes Zitat|Beschreibe Herkunft|Noch festlegen/);
});

test('sanitation and JSON round trips preserve thirty levels, crests and explicit row layouts', () => {
  const first = clean(hierarchy);
  assert.deepEqual(clean(JSON.parse(JSON.stringify(first))), first);
  assert.deepEqual(first.trees.map(tree => tree.levels.map(level => [level.nodes.length, level.columns, level.startsGroup, level.emblem])),
    hierarchy.trees.map(tree => tree.levels.map(level => [level.nodes.length, level.columns, level.startsGroup, level.emblem])));
  assert.match(context.buildHierarchyLevel(first.trees[1].levels[2], 2), /cols-4.*data-hierarchy-columns="4"/);
  assert.match(context.buildHierarchyLevel(first.trees[3].levels[0], 0), /hierarchy-group-start/);
});

test('invalid column values fall back safely and hierarchy depth remains bounded', () => {
  for (const columns of [-1, 0, 2.5, 7, 'bad', null]) assert.equal(clean({ levels: [{ label: 'Test', columns, nodes: [{ title: 'Test' }] }] }).levels[0].columns, undefined);
  const levels = Array.from({ length: 33 }, () => ({ nodes: [{ title: 'Test' }] }));
  assert.equal(clean({ levels }).levels.length, 32);
  assert.equal(clean({ levels: [{ columns: '4', startsGroup: 'true', nodes: [{ title: 'Test' }] }] }).levels[0].startsGroup, undefined);
});

test('Grenn uses the corrected Coelret source, explicit age, traits and the revised portrait', () => {
  const character = buildGrennCharacterExport().character;
  assert.equal(character.age, 33);
  const { id, ...visible } = character;
  assert.doesNotMatch(JSON.stringify(visible), /Seolfor|Kaldhorn|Thainhaus/);
  assert.match(character.origin, /Aeldrunmar.*Coelret.*Aeldros/);
  assert.match(character.portrait, /grenn-coelret-v2\.png$/);
  assert.deepEqual(character.biography.biography.abilities.map(trait => trait.title), ['Frech', 'Charismatisch', 'Selbstbewusst']);
  assert(!('inventory' in character));
  assert(!('combatProfile' in character));
  const realm = JSON.parse(read('../../shared/accepted-realms/data/aeldrunmar.source.json'));
  const house = realm.houses.find(house => house.id === 'coelret');
  assert.equal(house.extinct, false);
  assert.match(house.motif, /steigendes Pferd/);
  assert.equal(house.warrior.classId, 'hyld');
});

test('all local illustrations exist and generated originals match their selected assets', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  JSON.stringify(entry, (_key, value) => {
    if (typeof value === 'string' && /^(\.?\.?\/|\/)(AleriaAlmanach\/)?(assets|public|Stammbäume|IconOrdner)\//.test(value) && /\.(png|jpe?g|webp)$/.test(value)) {
      assert(fs.existsSync(new URL(value.startsWith('/') ? `..${value}` : value, base)), value);
    }
    return value;
  });
  const receipt = JSON.parse(read('../docs/art/schwarzfische-20261116/image-jobs.json'));
  assert.equal(receipt.mode, 'built-in image_gen');
  assert.equal(receipt.jobs.filter(job => job.active).length, 11);
  for (const job of receipt.jobs) {
    const bytes = fs.readFileSync(new URL(`../../${job.original}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), job.sha256);
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
    if (job.active) assert(bytes.equals(fs.readFileSync(new URL(`../../${job.target}`, import.meta.url))));
  }
  const additions = JSON.parse(read('../docs/art/schwarzfische-20261116/additional-image-jobs.json'));
  assert.equal(additions.jobs.filter(job => job.id.startsWith('trupp-')).length, 10);
  for (const job of additions.jobs) {
    const original = fs.readFileSync(new URL(`../../${job.original}`, import.meta.url));
    const active = fs.readFileSync(new URL(`../../${job.target}`, import.meta.url));
    assert.equal(createHash('sha256').update(original).digest('hex'), job.sha256);
    assert.equal(createHash('sha256').update(active).digest('hex'), job.activeSha256);
    if (job.id.startsWith('trupp-')) {
      assert.equal(active.readUInt32BE(16), active.readUInt32BE(20));
      assert.equal(active[25], 6);
      assert.equal(job.processing.rgbUnchanged, true);
      assert.deepEqual(job.processing.alphaValues, [0, 255]);
    }
  }
});
