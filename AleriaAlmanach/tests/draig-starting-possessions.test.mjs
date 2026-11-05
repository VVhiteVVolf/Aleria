import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { DRAIG_STARTING_POSSESSIONS, DRAIG_STARTING_TARGETS } from '../modules/draig-starting-possessions/starting-possessions.mjs';
import { getDraigStartingSourceKey, planDraigStartingPossessions } from '../modules/draig-starting-possessions/starting-possessions-plan.mjs';
import { buildRefriSignetItem } from '../modules/draig-starting-possessions/refri-signet.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { normalizeItemDefinition, itemDefinitionContent } from '../modules/item-definitions/item-definition-model.js';
import { moneyState } from '../modules/item-register/item-register-money.js';

const now = '2026-11-05T00:00:00.000Z';
const templateIds = new Set(DRAIG_STARTING_POSSESSIONS.flatMap(spec => spec.items.map(item => item.templateId)));
const ringTemplate = buildRefriSignetItem();
const ringDefinition = normalizeItemDefinition({ ...ringTemplate, kind: 'unique', weight: null }, { id: ringTemplate.id, revision: 'draft' });
ringTemplate.definitionRef = { id: ringDefinition.id,
  revision: createHash('sha256').update(itemDefinitionContent(ringDefinition)).digest('hex').slice(0, 24) };
const templates = [...STANDARD_ITEMS.filter(item => templateIds.has(item.id)), ringTemplate];
const specification = DRAIG_STARTING_POSSESSIONS[0];
const refri = DRAIG_STARTING_POSSESSIONS.find(spec => spec.key === 'refri-thornwick');

function recipient(spec = specification, moneyCopper = 2.07) {
  return { id: spec.id, name: spec.name, bio: 'Geschützte Biografie', ownerUid: 'owner-unchanged',
    identity: { worldPersonId: spec.worldPersonId }, genealogy: { worldPersonId: spec.worldPersonId, houseId: spec.houseId },
    liveResources: { health: 8, magic: 13 }, combatProfile: { weapons: [{ id: 'old-sword', equipped: true }], revision: 9 },
    inventory: { revision: 3, moneyState: moneyState(moneyCopper), money: 'historischer Text', custom: { preserved: true },
      companions: [{ id: 'animal', name: 'Geschützter Begleiter' }], items: [
        { id: 'prior', name: 'Alter Besitz', itemState: { charges: 2 }, quantity: '1' },
        ...(spec.ringTemplateId === 'house-signet:haus-draig' ? [{ id: 'existing-house-signet', instanceId: 'existing-house-signet',
          name: 'Vorhandener persönlicher Siegelring', templateId: 'house-signet:haus-draig',
          definitionRef: { id: 'house-signet:haus-draig', revision: 'older-confirmed-version' },
          image: 'https://example.invalid/existing-draig.png', equipped: true, itemState: { scratched: true } }] : [])
      ] } };
}
const plan = (changes = {}) => planDraigStartingPossessions({ character: recipient(), specification, templates, now, ...changes });

test('Die vier Empfänger und die standesabhängige Barschaft bleiben eng begrenzt', () => {
  assert.equal(DRAIG_STARTING_TARGETS.length, 4);
  assert.equal(new Set(DRAIG_STARTING_TARGETS.map(entry => entry.id)).size, 4);
  assert.equal(DRAIG_STARTING_POSSESSIONS.find(entry => entry.key === 'isobel-draig').moneyCopper, 34700);
  assert.equal(refri.moneyCopper, 0.12);
  assert.deepEqual(DRAIG_STARTING_POSSESSIONS.map(entry => entry.items.length), [3, 3, 2, 3]);
  assert.equal(DRAIG_STARTING_POSSESSIONS.find(entry => entry.key === 'isobel-draig').worldPersonId,
    'person--haus-draig--isobel-1719-draig');
});

for (const spec of DRAIG_STARTING_POSSESSIONS) {
  test(`${spec.name}: Geld wird addiert und Bestandsbesitz, Identität und Livewerte bleiben erhalten`, () => {
    const character = recipient(spec), before = structuredClone({ character, spec, templates });
    const result = plan({ character, specification: spec });
    assert.equal(result.changed, true);
    assert.deepEqual(result.fieldPaths, ['inventory']);
    assert.equal(result.character.inventory.revision, 4);
    assert.equal(result.character.inventory.moneyState.totalCopper, (Math.round(spec.moneyCopper * 100) + 207) / 100);
    assert.equal(result.character.updatedAt, character.updatedAt);
    const protectedBefore = structuredClone(character), protectedAfter = structuredClone(result.character);
    for (const value of [protectedBefore, protectedAfter]) {
      delete value.updatedAt;
      for (const field of ['items', 'revision', 'moneyState', 'money']) delete value.inventory[field];
    }
    assert.deepEqual(protectedAfter, protectedBefore);
    assert.deepEqual(result.character.inventory.items.slice(0, character.inventory.items.length), character.inventory.items);
    const added = result.character.inventory.items.slice(character.inventory.items.length);
    assert.equal(added.length, spec.items.length + Number(spec === refri));
    assert.deepEqual(added.map(item => item.id), result.addedItemIds);
    for (const item of added) {
      assert.equal(item.category, 'other'); assert.equal(item.quantity, '1');
      assert.equal(item.ownerCharacterId, spec.id); assert.equal(item.ownerCharacterName, spec.name);
      assert.equal(item.instanceId, item.id); assert.equal(item.acquiredAt, now);
      assert.ok(item.definitionRef?.id && item.definitionRef.revision);
    }
    assert.equal(result.grant.result.copper, spec.moneyCopper);
    assert.deepEqual(result.grant.result.addedItemIds, result.addedItemIds);
    assert.equal(result.grant.result.recordId, character.id);
    assert.equal(result.grant.sourceKey, getDraigStartingSourceKey(spec.id));
    assert.deepEqual({ character, spec, templates }, before, 'Der Planner mutiert keine Eingabe.');
  });
}

test('Vorhandene Draig-Ringe behalten ihre Bilder, Versionen und Instanzen vollständig', () => {
  for (const spec of DRAIG_STARTING_POSSESSIONS.filter(entry => entry.ringTemplateId === 'house-signet:haus-draig')) {
    const character = recipient(spec), result = plan({ character, specification: spec });
    assert.deepEqual(result.character.inventory.items.find(item => item.id === 'existing-house-signet'), character.inventory.items[1]);
    assert.equal(result.character.inventory.items.filter(item => item.definitionRef?.id === 'house-signet:haus-draig').length, 1);
    assert.ok(!result.addedItemIds.includes('existing-house-signet'));
  }
});

test('Refris alter Ring wird als einzelnes persönliches Unikat und als angelegt vergeben', () => {
  const result = plan({ character: recipient(refri, 0), specification: refri });
  assert.deepEqual(result.character.inventory.moneyState, { gold: 0, silver: 0, copper: 0, pfennig: 12, totalCopper: 0.12 });
  const ring = result.character.inventory.items.find(item => item.definitionRef?.id === 'personal-signet:refri-thornwick');
  assert.equal(ring.name, 'Refris alter Thornwick-Siegelring'); assert.equal(ring.equipped, true);
  assert.equal(ring.quantity, '1'); assert.equal(ring.category, 'other');
  assert.equal(ring.registerCategory, 'sonstiges');
  assert.match(ring.description, /zerkratzt/); assert.match(ring.description, /rostig/);
  assert.equal(result.addedItemIds.at(-1), `${refri.id}-draig-start-possessions-20261105-signet`);
});

test('Kanonische Warenkategorien bleiben trotz Sonstiges-Zuordnung der neuen persönlichen Instanzen erhalten', () => {
  const before = structuredClone(templates), result = plan();
  for (const item of result.character.inventory.items.filter(item => result.addedItemIds.includes(item.id))) {
    assert.equal(item.category, 'other'); assert.equal(item.registerCategory, 'werkzeuge');
  }
  assert.deepEqual(templates, before);
  assert.ok(templates.filter(item => item.id.startsWith('standard:')).every(item => item.category === 'werkzeuge'));
});

test('Der externe Beleg verhindert nach Geldausgabe und Verkauf jede erneute Vergabe', () => {
  const first = plan(), spent = structuredClone(first.character);
  spent.inventory.items = []; spent.inventory.moneyState = moneyState(0.01); spent.inventory.money = '1 Eisenpfennig';
  const second = plan({ character: spent, claim: first.grant, specification: null, templates: null, now: '' });
  assert.equal(second.changed, false); assert.deepEqual(second.character, spent);
  assert.deepEqual(second.addedItemIds, []); assert.deepEqual(second.added, []); assert.deepEqual(second.fieldPaths, []); assert.equal(second.grant, null);
});

test('Fremde Empfänger, Weltidentitäten, Häuser und Belege werden abgewiesen', () => {
  const claim = plan().grant;
  assert.throws(() => plan({ character: { ...recipient(), id: 'fremde-figur' } }), /freigegebenen Figuren/);
  assert.throws(() => plan({ character: { ...recipient(), name: 'Namensgleiche' } }), /freigegebenen Figuren/);
  assert.throws(() => plan({ character: { ...recipient(), identity: { worldPersonId: 'fremde-weltperson' } } }), /Weltidentität/);
  assert.throws(() => plan({ character: { ...recipient(), genealogy: { houseId: 'house-fremd' } } }), /Hauszuordnung/);
  assert.throws(() => plan({ claim: { ...claim, sourceKey: 'andere-quelle' } }), /andere.*Quelle/);
  assert.throws(() => plan({ claim: { ...claim, result: { recordId: 'andere-figur' } } }), /andere.*Quelle/);
  assert.throws(() => getDraigStartingSourceKey('characters/fremd'));
});

test('Historischen Online-Akten dürfen Weltverweise fehlen; feste Laufzeit-ID und Name bleiben zwingend', () => {
  const character = recipient(); delete character.identity; delete character.genealogy;
  const result = plan({ character });
  assert.equal(result.changed, true);
  assert.equal(result.character.identity, undefined); assert.equal(result.character.genealogy, undefined);
  assert.throws(() => plan({ character: { ...character, id: 'unbekannter-altbestand' } }), /freigegebenen Figuren/);
  assert.throws(() => plan({ character: { ...character, identity: { worldPersonId: 'falsche-person' } } }), /Weltidentität/);
});

test('Ohne Beleg verhindern deterministische Besitz- und Instanz-IDs Doppelvergaben', () => {
  const first = plan();
  assert.throws(() => plan({ character: first.character }), /bereits belegt/);
  const character = recipient();
  character.inventory.items.push({ id: 'andere-id', instanceId: first.addedItemIds[0] });
  assert.throws(() => plan({ character }), /bereits belegt/);
});

test('Doppelte oder fehlende Draig-Ringe und bereits vorhandene Thornwick-Ringe werden nicht still ergänzt', () => {
  const missing = recipient(); missing.inventory.items.pop();
  assert.throws(() => plan({ character: missing }), /genau einmal/);
  const duplicate = recipient(); duplicate.inventory.items.push({ ...duplicate.inventory.items[1], id: 'another-ring' });
  assert.throws(() => plan({ character: duplicate }), /genau einmal/);
  for (const templateId of ['house-signet:haus-thornwick', 'personal-signet:refri-thornwick']) {
    const character = recipient(refri); character.inventory.items.push({ id: 'old-refri-ring', templateId });
    assert.throws(() => plan({ character, specification: refri }), /bereits.*Thornwick-Ring/);
  }
});

test('Fehlende Definitionen, doppelte Vorlagen und neue Kampfmechanik werden abgefangen', () => {
  assert.throws(() => plan({ templates: [] }), /nicht gefunden/);
  assert.throws(() => plan({ templates: [...templates, templates[0]] }), /doppelt/);
  const wrong = (change, id = specification.items[0].templateId) => templates.map(item => item.id === id ? { ...item, ...change } : item);
  assert.throws(() => plan({ templates: wrong({ definitionRef: null }) }), /kanonische Itemdefinition/);
  assert.throws(() => plan({ templates: wrong({ definitionRef: { id: 'fremd', revision: 'v1' } }) }), /kanonische Itemdefinition/);
  assert.throws(() => plan({ templates: wrong({ combatDefinition: { kind: 'weapon' } }) }), /Kampfausrüstung/);
  assert.throws(() => plan({ templates: wrong({ useDefinition: { effects: [{ kind: 'heal' }] } }) }), /Kampfausrüstung/);
  assert.throws(() => plan({ character: recipient(refri), specification: refri,
    templates: wrong({ definitionKind: 'shared' }, ringTemplate.id) }), /Unikat/);
});

test('Geld wird pfenniggenau addiert; ungültige Geldbörsen und Revisionen bleiben unangetastet', () => {
  const legacy = recipient(); delete legacy.inventory.moneyState; legacy.inventory.money = '0 Gold, 0 Silber, 1 Kupfer, 99 Eisenpfennig';
  assert.equal(plan({ character: legacy }).character.inventory.moneyState.totalCopper, 12401.99);
  for (const totalCopper of [-1, 0.001, Infinity, NaN, '12']) {
    const character = recipient(); character.inventory.moneyState = { totalCopper };
    assert.throws(() => plan({ character }));
  }
  const overflow = recipient(); overflow.inventory.moneyState = { totalCopper: Number.MAX_SAFE_INTEGER / 100 };
  assert.throws(() => plan({ character: overflow }), /Berechnungsgrenze/);
  for (const revision of [-1, 0.1, Number.MAX_SAFE_INTEGER, '3']) {
    const character = recipient(); character.inventory.revision = revision;
    assert.throws(() => plan({ character }), /Inventarrevision/);
  }
  assert.throws(() => plan({ now: 'unbekannt' }), /Vergabezeitpunkt/);
});

test('Die begrenzte Spezifikation erlaubt keine zusätzlich eingeschmuggelten Belohnungen', () => {
  assert.throws(() => plan({ specification: { ...specification, moneyCopper: 12400.001 } }), /freigegebenen Auftrag/);
  assert.throws(() => plan({ specification: { ...specification, items: [...specification.items, specification.items[0]] } }), /freigegebenen Auftrag/);
  assert.throws(() => plan({ specification: { ...specification, items: specification.items.map(item => ({ ...item, quantity: 2 })) } }), /freigegebenen Auftrag/);
  const full = recipient(); full.inventory.items.push(...Array.from({ length: 76 }, (_, index) => ({ id: `old-${index}` })));
  assert.throws(() => plan({ character: full }), /80 Inventareinträge/);
  const boundary = recipient(); boundary.inventory.items.push(...Array.from({ length: 75 }, (_, index) => ({ id: `old-${index}` })));
  assert.equal(plan({ character: boundary }).character.inventory.items.length, 80);
});
