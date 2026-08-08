import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCreatureDraft,
  createCreatureDuplicate,
  getCreatureBaseName,
  makeCreatureSceneActor,
  normalizeCreatureImportPayload,
  sanitizeCreature,
  toRomanNumeral
} from '../modules/creatures/creature-model.js';
import {
  CREATURE_LEVEL_GUIDELINES,
  getBuiltinCreatureTemplates,
  isBuiltinCreatureId
} from '../modules/creatures/creature-catalog.js';
import {
  getArmorClass,
  getMaximumHitPoints,
  getPassivePerception,
  getWeaponAttackModifier
} from '../modules/combat/combat-profile-model.js';

test('creature defaults use the compact combat schema without character skill bloat', () => {
  const creature = createCreatureDraft();
  assert.equal(creature.entityType, 'creature');
  assert.equal(creature.level, 1);
  assert.equal(creature.combatProfile.skills.length, 0);
  assert.deepEqual(creature.combatProfile.resources.filter(resource => resource.scope === 'comment').map(resource => resource.id), ['action', 'bonus-action', 'reaction']);
  assert.deepEqual(creature.combatProfile.resources.find(resource => resource.id === 'special-action'), {
    id: 'special-action', name: 'Besondere Aktion', current: 2, maximum: 2, recovery: 'day', scope: 'persistent', category: 'action',
    icon: './public/assets/combat-profile-icons/special-action.png', notes: ''
  });
  assert.equal(creature.combatProfile.weapons[0].name, 'Nahkampf');
  assert.equal(creature.combatProfile.hitPoints.maximumOverride, 10);
  assert.deepEqual(creature.avatars, []);
});

test('creature avatars are capped at ten and exposed as comment emotes', () => {
  const avatars = Array.from({ length: 12 }, (_, index) => ({
    img: `https://example.com/avatar-${index + 1}.png`,
    label: `Ausdruck ${index + 1}`
  }));
  const creature = sanitizeCreature({ id: 'wolf', name: 'Wolf', avatars });
  const actor = makeCreatureSceneActor(creature);

  assert.equal(creature.avatars.length, 10);
  assert.equal(actor.entityType, 'creature');
  assert.equal(actor.emotes.length, 10);
  assert.deepEqual(actor.emotes[0], {
    img: 'https://example.com/avatar-1.png',
    label: 'Ausdruck 1'
  });
});

test('creature loot carries the same revision safeguard as combatProfile', () => {
  assert.equal(sanitizeCreature({}).loot.revision, 0);
  assert.equal(sanitizeCreature({ loot: { revision: 1723000000000 } }).loot.revision, 1723000000000);
  assert.equal(sanitizeCreature({ loot: { revision: -5 } }).loot.revision, 0, 'negative Werte werden auf 0 gekappt');
});

test('creature level 21-30 is represented by special combat levels', () => {
  const creature = sanitizeCreature({ level: 27, combatProfile: {} });
  assert.equal(creature.combatProfile.progression.level, 20);
  assert.equal(creature.combatProfile.progression.specialLevels, 7);
});

test('creature duplicates receive stable roman instance names', () => {
  const template = sanitizeCreature({ id: 'skeleton', name: 'Skelettkrieger' });
  const first = createCreatureDuplicate(template, [template]);
  const second = createCreatureDuplicate(template, [template, { ...first, id: 'first' }]);
  assert.equal(first.name, 'Skelettkrieger I.');
  assert.equal(second.name, 'Skelettkrieger II.');
  assert.equal(first.templateId, 'skeleton');
  assert.equal(getCreatureBaseName(second.name), 'Skelettkrieger');
  assert.equal(toRomanNumeral(10), 'X');
});

test('single and archive creature exports normalize into import records', () => {
  const single = normalizeCreatureImportPayload({ type: 'aleria-creature', creature: { name: 'Wolf' } });
  const archive = normalizeCreatureImportPayload({ type: 'aleria-creature-archive', creatures: [{ name: 'Wolf' }, { name: 'Bär' }] });
  assert.equal(single[0].name, 'Wolf');
  assert.deepEqual(archive.map(item => item.name), ['Wolf', 'Bär']);
});

test('liefert die drei Schwarzen Zitteraale als vollständige Grundvorlagen', () => {
  const creatures = getBuiltinCreatureTemplates();
  assert.deepEqual(creatures.slice(0, 3).map(creature => [creature.name, creature.level, creature.portrait]), [
    ['Schwarzer Zitteraal Raubritter', 7, 'https://i.imgur.com/uLAE7V0.png'],
    ['Schwarzer Zitteraal Schütze', 3, 'https://i.imgur.com/001lUuF.png'],
    ['Schwarzer Zitteraal Plünderer', 3, 'https://i.imgur.com/Q3KTHVq.png']
  ]);
  creatures.slice(0, 3).forEach(creature => {
    assert.equal(isBuiltinCreatureId(creature.id), true);
    assert.ok(creature.combatProfile.weapons.length >= 2);
    assert.ok(creature.combatProfile.abilities.length >= 2);
    assert.ok(creature.loot.items.length >= 3);
    assert.match(creature.notes, /./);
  });
});

test('balanciert die Schwarzen Zitteraale passend zu ihrer Stufenrolle', () => {
  const [raubritter, schuetze, pluenderer] = getBuiltinCreatureTemplates();
  assert.deepEqual([
    getMaximumHitPoints(raubritter.combatProfile), getArmorClass(raubritter.combatProfile),
    getWeaponAttackModifier(raubritter.combatProfile, raubritter.combatProfile.weapons[0]),
    getPassivePerception(raubritter.combatProfile)
  ], [67, 18, 7, 14]);
  assert.deepEqual([
    getMaximumHitPoints(schuetze.combatProfile), getArmorClass(schuetze.combatProfile),
    getWeaponAttackModifier(schuetze.combatProfile, schuetze.combatProfile.weapons[0]),
    getPassivePerception(schuetze.combatProfile)
  ], [21, 14, 5, 14]);
  assert.deepEqual([
    getMaximumHitPoints(pluenderer.combatProfile), getArmorClass(pluenderer.combatProfile),
    getWeaponAttackModifier(pluenderer.combatProfile, pluenderer.combatProfile.weapons[0]),
    getPassivePerception(pluenderer.combatProfile)
  ], [24, 15, 4, 10]);
});

test('liefert die drei Draig-Gefolgsleute mit den geforderten Stufen und Waffen', () => {
  const creatures = getBuiltinCreatureTemplates();
  const draigs = creatures.filter(creature => creature.id.startsWith('catalog-draig-'));
  assert.deepEqual(draigs.map(creature => [creature.name, creature.level, creature.portrait]), [
    ['Draig Lehensritter', 7, 'https://i.imgur.com/sY3vKh7.png'],
    ['Draig Waffenknecht', 3, 'https://i.imgur.com/QaY77kP.png'],
    ['Draig Schütze', 3, 'https://i.imgur.com/tntwr06.png']
  ]);
  assert.deepEqual(draigs.map(creature => creature.combatProfile.weapons.map(weapon => weapon.name)), [
    ['Draig-Langschwert', 'Knaufstoß', 'Nahkampf'],
    ['Draig-Speer', 'Schildstoß', 'Nahkampf'],
    ['Draig-Langbogen', 'Draig-Dolch', 'Nahkampf']
  ]);
  draigs.forEach(creature => {
    assert.equal(isBuiltinCreatureId(creature.id), true);
    assert.ok(creature.combatProfile.abilities.length >= 2);
    assert.ok(creature.loot.items.length >= 3);
  });
});

test('hält die gewünschte Rangfolge als Orientierung statt als starre Level-Automatik fest', () => {
  assert.deepEqual(CREATURE_LEVEL_GUIDELINES.map(entry => [entry.label, entry.minimum, entry.maximum]), [
    ['Bauer', 1, 1],
    ['Waffenknecht / Knappe', 3, 4],
    ['Jungritter', 5, 6],
    ['Ritter', 7, 10],
    ['Hauptmann', 13, 13],
    ['Heldenhafter Krieger / Haudegen / erfahrener Anführer', 14, 30]
  ]);
});
