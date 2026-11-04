import test from 'node:test';
import assert from 'node:assert/strict';
import { planPatrickBiographies } from '../modules/patrick-biographies/biography-plan.mjs';
import { CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID } from '../modules/patrick-biographies/biography-identities.mjs';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { PATRICK_BIOGRAPHY_ASSETS } from '../modules/patrick-biographies/biography-assets.mjs';

const NOW = '2026-11-03T16:00:00.000Z';
function character(id, name) {
  return { id, name, portrait: '/portrait.png', ownerUid: 'retain-owner',
    imageSets: [{ id: 'custom', portrait: '/custom.png' }], combatProfile: { hitPoints: { current: 3 }, resources: [{ current: 0 }] },
    inventory: { items: [{ id: 'kept-item', quantity: '7', custom: { retained: true } }], revision: 12, notes: 'retain inventory metadata' },
    biography: { schema: 'aleria.biography-module', revision: 42, stats: [{ label: 'Original', value: 'unverändert' }],
      biography: { biographyText: '<p>Unveränderte Prosa — äöü.</p>', historyText: '<p>Geschichte.</p>',
        extraSections: [{ title: 'Eigenes', text: '<p>Behalten.</p>' }], works: ['Freier unveränderter Text'], trivia: ['Original'],
        abilities: [{ title: 'Gewissenhaft', detail: 'Originale Bedeutung', icon: '*' },
          { title: 'Perfektionistisch', detail: 'Keine Diagnose und keine neue Mechanik.', icon: '*' },
          { title: 'Eigenes', detail: 'Eigener Eintrag', icon: '/existing-author-art.png' }],
        connections: [{ type: 'connection', name: 'Vorhanden', detail: 'Originalverbindung', custom: true }] } } };
}
const cadogan = () => character(CADOGAN_CHARACTER_ID, 'Cadogan Sgrechiwr');
const rhiannon = () => character(RHIANNON_CHARACTER_ID, 'Rhiannon (geb. Draenmelyn) Swyll');
const options = characters => ({ characters, assetMap: { 'trait:Perfektionistisch': '/new/perfektionistisch.png' }, now: NOW });

test('changes only missing icons and owned companion bindings while retaining every prose field and other possession', () => {
  const before = [cadogan(), rhiannon()], snapshot = structuredClone(before);
  const plan = planPatrickBiographies(options(before));
  assert.deepEqual(before, snapshot);
  assert.equal(plan.creatures.length, 2);
  for (const [index, row] of plan.characters.entries()) {
    assert.deepEqual(Object.keys(row.patch).sort(), ['biography', 'inventory', 'updatedAt']);
    const prior = before[index].biography.biography, after = row.patch.biography.biography;
    for (const field of ['biographyText', 'historyText', 'extraSections', 'works', 'trivia']) assert.deepEqual(after[field], prior[field]);
    assert.deepEqual(row.patch.biography.stats, before[index].biography.stats);
    assert.equal(after.abilities[0].icon, '/IconOrdner/Traits%20Icon/Diligent.png');
    assert.equal(after.abilities[1].icon, '/new/perfektionistisch.png');
    assert.deepEqual(after.abilities[2], prior.abilities[2]);
    assert.deepEqual(row.patch.inventory.items.find(item => item.id === 'kept-item'), before[index].inventory.items[0]);
    assert.equal(row.patch.inventory.notes, before[index].inventory.notes);
    assert.deepEqual(after.connections[0], prior.connections[0]);
    assert(row.patch.inventory.revision > before[index].inventory.revision);
  }
  assert.deepEqual(plan.creatures.map(c => c.itemOrigin.ownerCharacterId), [CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID]);
  assert.deepEqual(plan.creatures.map(c => c.bestiaryReference.id), ['tiere/pferde/erlenglanz', 'tiere/pferde/rhyfel']);
  assert.deepEqual(plan.pending.map(row => row.name), ['Sir Balthasar', 'Sonnenaufgang']);
  assert(plan.pending.every(row => row.kind === 'missing-pet-owner-document' && row.ownerCharacterId === GWEN_CHARACTER_ID));
});

test('unknown icon assignments remain pending without replacing authored custom art', () => {
  const person = cadogan();
  const plan = planPatrickBiographies({ characters: [person], assetMap: { [`${person.id}:Eigenes`]: '/wrong-replacement.png' }, now: NOW });
  assert.equal(plan.characters[0].patch.biography.biography.abilities[1].icon, '*');
  assert.equal(plan.characters[0].patch.biography.biography.abilities[2].icon, '/existing-author-art.png');
  assert(plan.pending.some(row => row.kind === 'missing-trait-icon' && row.title === 'Perfektionistisch'));
});

test('a repeated plan preserves existing creature IDs, depleted resources, custom inventory metadata and timestamps', () => {
  const first = planPatrickBiographies(options([cadogan(), rhiannon()]));
  const people = first.characters.map((row, i) => ({ ...[cadogan(), rhiannon()][i], ...row.patch }));
  const existing = structuredClone(first.creatures);
  existing[0].combatProfile.hitPoints.current = 0;
  existing[0].combatProfile.resources = [{ id: 'test-resource', current: 0, maximum: 3 }];
  existing[0].customLiveField = { keep: true };
  people[0].inventory.items.find(item => item.creatureId === existing[0].id).customPetMetadata = 'keep';
  const saved = structuredClone(existing);
  const second = planPatrickBiographies({ ...options(people), existingCreatures: existing, now: '2026-11-04T16:00:00.000Z' });
  assert.deepEqual(second.creatures, []);
  assert(second.characters.every(row => Object.keys(row.patch).length === 0));
  assert(second.characters.every(row => row.companionLinks[0].action === 'reuse-existing'));
  assert.deepEqual(existing, saved);
});

test('an authoritative existing companion with a historical ID is reused without issuing a creature write', () => {
  const first = planPatrickBiographies(options([cadogan()]));
  const old = structuredClone(first.creatures[0]); old.id = 'existing-online-creature-id';
  old.combatProfile.hitPoints.current = 1;
  const plan = planPatrickBiographies({ ...options([cadogan()]), existingCreatures: [old] });
  assert.deepEqual(plan.creatures, []);
  assert.equal(plan.characters[0].companionLinks[0].creatureId, old.id);
  assert.equal(plan.characters[0].patch.inventory.companions[0].creatureId, old.id);
  assert.equal(old.combatProfile.hitPoints.current, 1);
});

test('Sir Balthasar is owned only by an explicitly resolved Gwen and stays a mere narrative connection for Cadogan', () => {
  const person = cadogan();
  person.biography.biography.connections.push({ type: 'connection', name: 'Sir Balthasar', detail: "Gwen's Samtlicht." });
  const noGwen = planPatrickBiographies(options([person]));
  assert.equal(noGwen.creatures.some(c => c.name === 'Sir Balthasar'), false);
  assert.equal(noGwen.characters[0].patch.inventory.companions.length, 1);
  const gwen = character(GWEN_CHARACTER_ID, 'Gwen Hamnett');
  const withGwen = planPatrickBiographies({ ...options([person, gwen]), gwenCharacterId: gwen.id });
  const cat = withGwen.creatures.find(c => c.name === 'Sir Balthasar');
  assert.equal(cat.itemOrigin.ownerCharacterId, gwen.id);
  assert.equal(cat.bestiaryReference.id, 'tiere/vieh/haustiere/katzen/samtlicht');
  assert.equal(cat.species, 'Samtlicht-Kater');
  assert(cat.biography.facts.some(row => row.label === 'Geschlecht' && row.value === 'männlich'));
  assert.equal(withGwen.pending.length, 0);
});

test('contradictory ownership, duplicate companions and missing authoritative creature reads fail closed', () => {
  const first = planPatrickBiographies(options([cadogan()])), old = first.creatures[0];
  assert.throws(() => planPatrickBiographies({ ...options([cadogan()]), existingCreatures: [old, structuredClone(old)] }), /Mehrdeutig/);
  assert.throws(() => planPatrickBiographies({ ...options([cadogan()]), existingCreatures: [{ ...old, itemOrigin: { ...old.itemOrigin, ownerCharacterId: 'another-owner' } }] }), /Besitzer/);
  const person = { ...cadogan(), ...first.characters[0].patch };
  assert.throws(() => planPatrickBiographies(options([person])), /nicht vollständig eingelesen/);
  person.inventory.companions.push({ ...person.inventory.companions[0], id: 'duplicate-card' });
  assert.throws(() => planPatrickBiographies({ ...options([person]), existingCreatures: [old] }), /Mehrdeutig/);
  assert.throws(() => planPatrickBiographies(options([character('other-id', 'Other')])) , /außerhalb/);
  assert.throws(() => planPatrickBiographies({ ...options([cadogan()]), gwenCharacterId: CADOGAN_CHARACTER_ID }), /Personen-ID/);
});

test('the shared creature picker exposes all four verified pets with their owners and real bestiary profiles', () => {
  const creatures = getBuiltinCreatureTemplates().filter(creature =>
    [CADOGAN_CHARACTER_ID, RHIANNON_CHARACTER_ID, GWEN_CHARACTER_ID].includes(creature.itemOrigin?.ownerCharacterId));
  assert.deepEqual(creatures.map(c => c.name).sort(), ['Perle', 'Silberstolz', 'Sir Balthasar', 'Sonnenaufgang']);
  assert(creatures.every(c => c.needsStatReview && c.bestiaryReference));
  assert(creatures.filter(c => ['Sir Balthasar', 'Sonnenaufgang'].includes(c.name)).every(c => c.itemOrigin.ownerCharacterId === GWEN_CHARACTER_ID));
  const erlenglanz = creatures.find(c => c.name === 'Silberstolz');
  assert.deepEqual(erlenglanz.combatProfile.attributes.map(row => row.score), [10, 18, 10, 2, 12, 16]);
  assert.equal(erlenglanz.combatProfile.combat.movement, 21);
  assert(creatures.every(c => c.level === 1));
  const artworkByName = { Silberstolz: 'pet:silberstolz', Perle: 'pet:perle', 'Sir Balthasar': 'pet:sir-balthasar', Sonnenaufgang: 'pet:sonnenaufgang' };
  for (const creature of creatures) {
    assert.equal(creature.portrait, PATRICK_BIOGRAPHY_ASSETS[artworkByName[creature.name]]);
    if (creature.itemOrigin.ownerCharacterId === GWEN_CHARACTER_ID) {
      assert.equal(creature.biography.connections.find(row => row.name === 'Gwen Hamnett')?.image, PATRICK_BIOGRAPHY_ASSETS['portrait:gwen-hamnett']);
    }
  }
});

test('an item-only historic pet binding cannot be duplicated by an incomplete creature read', () => {
  const person = cadogan();
  person.inventory.items.push({ id: 'historical-pet-item', instanceId: 'historical-pet-instance',
    creatureId: 'historical-pet-id', name: 'Silberstolz', category: 'companion', ownerCharacterId: person.id });
  const before = structuredClone(person);
  assert.throws(() => planPatrickBiographies(options([person])), /nicht vollständig eingelesen/);
  assert.deepEqual(person, before);
  delete person.inventory.items[1].creatureId;
  assert.throws(() => planPatrickBiographies(options([person])), /nicht vollständig eingelesen/);
});

test('a differently written narrative pet card is neither renamed nor silently duplicated', () => {
  const person = cadogan();
  person.inventory.companions = [{ id: 'narrative-card', name: ' silberstolz ', description: 'Authored original text' }];
  const before = structuredClone(person);
  assert.throws(() => planPatrickBiographies(options([person])), /Abweichende Schreibweise/);
  assert.deepEqual(person, before);
});

test('Gwens documented star placeholders are replaced and her existing world identity is mandatory', () => {
  const gwen = character(GWEN_CHARACTER_ID, 'Gwen Hamnett');
  gwen.biography.biography.abilities = [{ title: 'Künstlerisch', detail: 'Original', icon: '✦' }];
  const plan = planPatrickBiographies({ characters: [gwen], assetMap: { 'trait:Künstlerisch': '/new/kuenstlerisch.png' }, now: NOW });
  assert.equal(plan.characters[0].patch.biography.biography.abilities[0].icon, '/new/kuenstlerisch.png');
  assert.deepEqual(plan.creatures.map(c => c.name), ['Sir Balthasar', 'Sonnenaufgang']);
  assert.equal(plan.pending.length, 0);
  assert.throws(() => planPatrickBiographies({ ...options([gwen]), gwenCharacterId: 'unconfirmed-new-person' }), /Personen-ID/);
});

test('an unrelated ordinary item sharing a pet name remains untouched', () => {
  const person = rhiannon(), pearl = { id: 'jewelry', name: 'Perle', category: 'gem', quantity: '1' };
  person.inventory.items.push(pearl);
  const plan = planPatrickBiographies(options([person]));
  assert.equal(plan.creatures[0].name, 'Perle');
  assert.deepEqual(plan.characters[0].patch.inventory.items.find(item => item.id === pearl.id), pearl);
});

test('reviewed immutable HTTPS artwork is accepted without permitting embedded credentials', () => {
  const url = 'https://firebasestorage.googleapis.com/v0/b/public/o/icon.png?alt=media';
  const plan = planPatrickBiographies({ ...options([cadogan()]), assetMap: { 'trait:Perfektionistisch': url } });
  assert.equal(plan.characters[0].patch.biography.biography.abilities[1].icon, url);
  assert.throws(() => planPatrickBiographies({ ...options([cadogan()]), assetMap: { 'trait:Perfektionistisch': 'https://user:password@example.test/icon.png' } }), /Zugangsdaten/);
});
