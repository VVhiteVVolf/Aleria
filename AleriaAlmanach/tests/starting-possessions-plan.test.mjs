import test from 'node:test';
import assert from 'node:assert/strict';
import { getStartingPossessionsSourceKey, planKnightStartingPossessions } from '../modules/gwynthor-seven/starting-possessions-plan.mjs';
import { moneyTotal } from '../modules/item-register/item-register-money.js';
import { KNIGHT_STARTING_POSSESSIONS } from '../modules/gwynthor-seven/starting-possessions.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { AUTHORED_ITEMS } from '../modules/item-definitions/authored-item-catalog.js';

const now = '2026-11-02T19:00:00.000Z';
const templates = ['notebook', 'tin-soldier', 'brush'].map(id => ({ id: `personal:${id}`, title: id, category: 'sonstiges',
  type: 'Persönlicher Gegenstand', image: `/assets/${id}.png`, description: 'Ein gewöhnlicher persönlicher Gegenstand.',
  tags: [], infoRows: [], attributes: [], combatDefinition: null, section: 'definition',
  definitionRef: { id: `personal:${id}`, revision: 'current-v1' } }));
const character = { id: 'oweta-draig', name: 'Oweta Draig', bio: 'Unverändert', biography: { title: 'Lebenslauf' },
  genealogy: { worldPersonId: 'person--haus-draig--oweta-draig' }, combatProfile: { hitPoints: { current: 7, maximumOverride: 25 }, weapons: [{ id: 'sword' }] },
  inventory: { revision: 8, moneyState: { gold: 3, silver: 2, copper: 7, pfennig: 38, totalCopper: 3207.38 },
    money: '3 Gold, 2 Silber, 7 Kupfer, 38 Eisenpfennig', companions: [{ id: 'heulwen' }], custom: 'erhalten',
    items: [{ id: 'prior', name: 'Alter Besitz', quantity: '1', itemState: { damaged: true } }] } };
const specification = { key: 'oweta', moneyCopper: 125.67, rationale: 'Praktische kleine Habseligkeiten für Oweta.',
  items: templates.map(template => ({ templateId: template.id, quantity: 1 })) };
const plan = changes => planKnightStartingPossessions({ character, specification, templates, now, ...changes });

test('Der Startbesitz addiert Geld pfenniggenau und ergänzt aktuelle persönliche Items ohne fremde Felder zu ändern', () => {
  const before = structuredClone({ character, specification, templates });
  const result = plan();
  assert.equal(result.changed, true);
  assert.equal(result.character.inventory.revision, 9);
  assert.equal(moneyTotal(result.character.inventory.moneyState), 3333.05);
  assert.equal(result.character.inventory.money, '3 Gold, 3 Silber, 33 Kupfer, 5 Eisenpfennig');
  assert.deepEqual(result.character.inventory.moneyState, { gold: 3, silver: 3, copper: 33, pfennig: 5, totalCopper: 3333.05 });
  const expected = structuredClone(character);
  expected.inventory = result.character.inventory;
  assert.deepEqual(result.character, expected, 'Biografie, Stammbaum und Kampfbogen bleiben exakt erhalten.');
  for (const field of ['companions', 'custom']) assert.deepEqual(result.character.inventory[field], character.inventory[field]);
  assert.deepEqual(result.character.inventory.items[0], character.inventory.items[0]);
  for (const [index, item] of result.character.inventory.items.slice(1).entries()) {
    assert.equal(item.id, result.addedItemIds[index]); assert.equal(item.instanceId, item.id);
    assert.equal(item.ownerCharacterId, character.id); assert.equal(item.ownerCharacterName, character.name);
    assert.equal(item.quantity, '1'); assert.equal(item.equipped, false);
    assert.deepEqual(item.definitionRef, templates[index].definitionRef);
  }
  assert.equal(result.grant.sourceKey, getStartingPossessionsSourceKey(character.id));
  assert.equal(result.grant.result.recordId, character.id); assert.equal(result.grant.result.copper, 125.67);
  assert.equal(result.grant.rewards.length, 4); assert.equal(result.grant.result.items.length, 3);
  assert.equal(result.grant.rationale, specification.rationale); assert.equal(result.grant.at, now);
  assert.deepEqual({ character, specification, templates }, before, 'Keine Eingabe wird mutiert.');
});

test('Textgeld ohne moneyState wird über die gemeinsame Währungslogik mit Eisenpfennigen übernommen', () => {
  const recipient = structuredClone(character);
  delete recipient.inventory.moneyState;
  recipient.inventory.money = '0 Gold, 0 Silber, 1 Kupfer, 99 Eisenpfennig';
  const result = plan({ character: recipient, specification: { ...specification, moneyCopper: 0.02, items: specification.items.slice(0, 2) } });
  assert.equal(moneyTotal(result.character.inventory.moneyState), 2.01);
  assert.equal(result.character.inventory.moneyState.pfennig, 1);
});

test('Ein gültiger externer Beleg verhindert nach Verkauf und Geldausgabe jede Auffüllung', () => {
  const first = plan();
  const spent = structuredClone(first.character);
  spent.inventory.items = [];
  spent.inventory.moneyState = { totalCopper: 0.01 };
  spent.inventory.money = '0 Gold, 0 Silber, 0 Kupfer, 1 Eisenpfennig';
  const second = plan({ character: spent, claim: first.grant, specification: null, templates: [], now: '' });
  assert.deepEqual(second.character, spent); assert.equal(second.changed, false);
  assert.deepEqual(second.addedItemIds, []); assert.equal(second.grant, null);
});

test('Ein Beleg mit anderer Quellen- oder Empfängeridentität stoppt den Plan', () => {
  const grant = plan().grant;
  assert.throws(() => plan({ claim: { ...grant, sourceKey: 'andere:quelle' } }), /anderen Quelle oder Figur/);
  assert.throws(() => plan({ claim: { ...grant, result: { ...grant.result, recordId: 'rianna' } } }), /anderen Quelle oder Figur/);
});

test('Belegte Besitz- und Instanz-IDs verhindern ohne Claim einen zweiten Zuschlag', () => {
  const first = plan();
  assert.throws(() => plan({ character: first.character }), /bereits belegt/);
  const recipient = structuredClone(character);
  recipient.inventory.items.push({ id: 'anderes-item', instanceId: first.addedItemIds[0], name: 'Schon belegt' });
  assert.throws(() => plan({ character: recipient }), /bereits belegt/);
  assert.equal(moneyTotal(recipient.inventory.moneyState), 3207.38);
});

test('Die Vergabekennung bleibt pro Figur konstant und unabhängig von Zeitpunkt und Spezifikationsreihenfolge', () => {
  const first = plan(), later = plan({ now: '2026-11-03T00:00:00.000Z', specification: { ...specification, items: [...specification.items].reverse() } });
  assert.equal(first.grant.sourceKey, later.grant.sourceKey);
  assert.equal(first.grant.operationId, later.grant.operationId);
  assert.deepEqual(first.addedItemIds, later.addedItemIds);
  assert.notEqual(first.grant.sourceKey, getStartingPossessionsSourceKey('rianna-wyrm'));
});

test('Fehlende, doppelte, kampfbezogene oder ungültig dosierte Startvorlagen werden abgewiesen', () => {
  assert.throws(() => plan({ templates: [] }), /nicht gefunden/);
  assert.throws(() => plan({ templates: [...templates, templates[0]] }), /doppelte Itemvorlage/);
  assert.throws(() => plan({ templates: templates.map((template, index) => index ? template : { ...template, combatDefinition: { kind: 'weapon' } }) }), /Kampfausrüstung/);
  assert.throws(() => plan({ specification: { ...specification, items: [...specification.items, specification.items[0]] } }), /zwei bis drei/);
  assert.throws(() => plan({ specification: { ...specification, items: specification.items.map((item, index) => index ? item : { ...item, quantity: 0 }) } }), /Menge/);
  assert.throws(() => plan({ specification: { ...specification, items: [specification.items[0], specification.items[0]] } }), /doppelt/);
});

test('Ungültige Geldbeträge, Pfennigbruchteile, Zeitpunkte und Revisionen werden nicht still korrigiert', () => {
  for (const moneyCopper of [-1, 0.001, Infinity, NaN, '12']) assert.throws(() => plan({ specification: { ...specification, moneyCopper } }));
  assert.throws(() => plan({ now: 'kein-datum' }), /Vergabezeitpunkt/);
  const recipient = structuredClone(character); recipient.inventory.revision = -1;
  assert.throws(() => plan({ character: recipient }), /Inventarrevision/);
  assert.throws(() => getStartingPossessionsSourceKey('figuren/fremd'));
});

test('Ein reiner Sachbesitzplan erhält den vorhandenen Wallet unverändert und erhöht die Revision nur einmal', () => {
  const result = plan({ specification: { ...specification, moneyCopper: 0 } });
  assert.deepEqual(result.character.inventory.moneyState, character.inventory.moneyState);
  assert.equal(result.character.inventory.money, character.inventory.money);
  assert.equal(result.character.inventory.revision, 9);
  assert.equal(result.grant.result.copper, 0);
  assert.ok(result.grant.rewards.every(reward => reward.kind === 'item'));
});

test('Die vier echten Bio-Listen vergeben je drei gewöhnliche Gegenstände und die festgelegte kleine Barschaft', () => {
  const amounts = { 'caralyn-chwedlonol': 680, 'rianna-wyrm': 1840, 'lefraye-gafyr': 760, 'oweta-draig': 1250 };
  for (const [key, moneyCopper] of Object.entries(amounts)) {
    const result = planKnightStartingPossessions({ character: { id: key, name: key, inventory: { items: [], money: '4 Eisenpfennig' } },
      specification: KNIGHT_STARTING_POSSESSIONS[key], templates: [...STANDARD_ITEMS, ...AUTHORED_ITEMS], now });
    assert.equal(result.character.inventory.items.length, 3);
    assert.equal(result.grant.result.copper, moneyCopper);
    assert.equal(result.character.inventory.moneyState.totalCopper, moneyCopper + 0.04);
    assert.equal(result.character.inventory.moneyState.pfennig, 4);
    assert.equal(result.character.combatProfile, undefined);
    assert.ok(result.character.inventory.items.every(item => item.definitionRef && !item.equipped));
  }
  assert.equal(STANDARD_ITEMS.find(item => item.id === 'standard:arkanist:unverzauberter-ring').description,
    'Ein schlichter Silberring ohne Stein und ohne Verzauberung.');
});
