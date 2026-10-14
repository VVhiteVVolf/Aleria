import assert from 'node:assert/strict';
import test from 'node:test';
import { createHerausforderungAiTemplate, createHerausforderungExport, parseHerausforderungImport, MAX_HERAUSFORDERUNG_IMPORT_BYTES } from '../modules/herausforderung/herausforderung-exchange.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';

const register = { standards: STANDARD_ITEMS };
const item = STANDARD_ITEMS.find(entry => entry.category === 'waffen');
const draft = () => ({ title: 'Torwache', publicDescription: 'Eine Wache versperrt den Weg.', approaches: [{ approachId: 'gate', label: 'Verhandeln', preferredSkills: ['persuasion'], difficulty: 15, insight: 'Die richtige Losung.', rewards: { copper: 2, items: [{ template: item.id, title: item.title, quantity: 1 }], effects: [] } }] });

test('AI export contains a blank editable challenge, instructions, current catalog IDs and effect syntax', () => {
  const document = createHerausforderungAiTemplate(register);
  assert.equal(document.format, 'aleria.herausforderung');
  assert.equal(document.challenge.publicDescription, '');
  assert.equal(document.challenge.approaches[0].insight, '');
  assert.deepEqual(document.challenge.approaches[0].rewards.items, []);
  assert.ok(document.instructions.rules.some(rule => rule.includes('einmalig')));
  assert.ok(document.catalog.itemTemplates.some(template => template.template === item.id));
  assert.ok(document.catalog.skills.some(skill => skill.id === 'persuasion'));
  assert.ok(document.instructions.syntax.rewards.copper.includes('Kupfertalern'));
  assert.equal(document.challenge.approaches[0].rewards.copper, 0);
  assert.equal(document.challenge.approaches[0].rewards.gold, undefined);
  const blank = parseHerausforderungImport(JSON.stringify(document), register);
  assert.equal(blank.issues.length, 3);
});

test('filled draft export round-trips rewards while discarding untrusted server product snapshots', () => {
  const source = draft();
  source.approaches[0].rewards.items[0].product = { id: item.id, title: 'Gefälscht' };
  const document = createHerausforderungExport(source);
  assert.equal(document.challenge.approaches[0].rewards.items[0].product, undefined);
  const imported = parseHerausforderungImport(JSON.stringify(document), register);
  assert.deepEqual(imported.issues, []);
  assert.equal(imported.event.approaches[0].rewards.copper, 2);
  assert.equal(imported.event.approaches[0].rewards.items[0].title, item.title);
  assert.equal(imported.event.approaches[0].rewards.items[0].product, undefined);
});

test('imports reject malformed syntax, incompatible formats, unknown IDs and invalid effects', () => {
  for (const input of ['bad json', '[]', 'null', JSON.stringify({ format: 'unknown', version: 1 }), JSON.stringify({ format: 'aleria.herausforderung', version: 2 })]) assert.throws(() => parseHerausforderungImport(input, register));
  let source = draft(); source.approaches[0].preferredSkills = ['invented'];
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /unbekannte Fertigkeits-ID/);
  source = draft(); source.approaches[0].preferredSkills = 'persuasion';
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /Liste/);
  source = draft(); source.approaches[0].difficulty = [15];
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /JSON-Zahl/);
  source = draft(); source.approaches[0].rewards.items[0].template = 'invented';
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /Registervorlage/);
  source = draft(); source.approaches[0].rewards.gold = 2;
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /copper in Kupfertalern/);
  source = draft(); source.approaches[0].rewards.copper = '2,5';
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /JSON-Zahl in Kupfertalern/);
  source = draft(); source.approaches[0].rewards.effects = [{ effectId: 'a', name: 'Segen', durationKind: 'actor-comments', durationAmount: 2, mechanics: { invented: 1 } }];
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source), register), /nicht unterstützte Mechanik/);
  assert.throws(() => parseHerausforderungImport(' '.repeat(MAX_HERAUSFORDERUNG_IMPORT_BYTES + 1), register), /2 MB/);
});

test('a single fenced JSON response imports as a draft with no executable behavior', () => {
  const imported = parseHerausforderungImport('```json\n' + JSON.stringify(draft()) + '\n```', register);
  assert.equal(imported.event.title, 'Torwache');
  assert.deepEqual(imported.issues, []);
});
