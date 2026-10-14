import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getActionGroups } from '../modules/combat/ui/combat-action-card.js';
import { getActionWeaponPresentation, getActionWeaponSections } from '../modules/combat/ui/combat-action-taxonomy.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { matchesArsenalChoice, getArsenalSectionCounts } from '../modules/combat/ui/combat-arsenal-model.js';
import { renderEvaluationStats } from '../modules/combat/ui/combat-evaluation-stats.js';

const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const characters = snapshot.characters.filter(c => c.combatProfile?.progression?.level > 2 && !/duncan/i.test(c.name));

test('alle Archivfiguren über Stufe 2 erhalten vollständige, eindeutige Waffenbereiche; Duncan ausgenommen', () => {
  assert.ok(characters.length >= 13);
  for (const character of characters) {
    const before = structuredClone(character), actor = resolveCombatProfile(character, { includeAiSnapshot: false });
    const groups = getActionGroups(actor), choices = [...groups.values()].flat();
    assert.equal(choices.length, actor.actions.filter(a => a.kind !== 'equipment-switch').length, character.name);
    assert.equal(new Set(choices.map(c => c.action.id)).size, choices.length, character.name);
    assert.ok([...groups.keys()].filter(key => key === 'personal-techniques').length <= 1);
    assert.ok(choices.every(c => c.weaponCategory.id && c.weaponCategory.title && c.group));
    assert.deepEqual(character, before, 'Die Sortierung ist ausschließlich eine Projektion');
  }
});

test('Ylva hat eine persönliche Rubrik und Skytte-Formen mit Bogen, Einhand und Speer in dieser Reihenfolge', () => {
  const actor = resolveCombatProfile(characters.find(c => /Ylva/.test(c.name)), { includeAiSnapshot: false });
  const groups = getActionGroups(actor);
  assert.equal(groups.get('personal-techniques').length, 13);
  const form = [...groups.values()].find(rows => rows[0].group.includes('Stand des Schildes'));
  assert.match(form[0].group, /^Skytte · Huskarl/);
  assert.deepEqual(getActionWeaponSections(form).slice(0, 3).map(s => s.weapon.id), ['ranged', 'one-handed', 'spear']);
  const state = { section: `${form[0].groupKey}|weapon:spear` };
  assert.ok(form.filter(c => matchesArsenalChoice(c, state, actor)).every(c => c.weaponCategory.id === 'spear'));
  assert.equal(getArsenalSectionCounts(form, {}, actor).get(state.section), form.filter(c => c.weaponCategory.id === 'spear').length);
});

test('Mehrklassen zeigen eigene und gemeinsame Formen, ohne dieselbe Handlung zu verdoppeln', () => {
  const entries = [
    { id: 'bow', name: 'Bogenlektion', combatStyleFormId: 'huskarl-schildgrund', weaponTypes: ['bow'], cultureTraining: { allowedClassIds: ['skytte'] } },
    { id: 'voice', name: 'Stimmlektion', combatStyleFormId: 'huskarl-schildgrund', weaponTypes: [], cultureTraining: { allowedClassIds: ['skalde'] } },
    { id: 'shared', name: 'Gemeinsame Lektion', combatStyleFormId: 'huskarl-schildgrund', weaponTypes: ['sword'], cultureTraining: { allowedClassIds: ['skytte', 'skalde'] } }
  ];
  const actor = { templateSelections: { classId: 'skytte', classIds: ['skytte', 'skalde'] }, techniques: entries, actions: entries.map(e => ({ id: `technique:${e.id}`, sourceId: e.id, name: e.name, kind: 'technique' })) };
  const groups = [...getActionGroups(actor).values()];
  assert.equal(groups.flat().length, 3);
  assert.ok(groups.some(rows => rows[0].group.startsWith('Skytte / Skalde ·')));
  assert.ok(groups.some(rows => rows[0].group.startsWith('Skalde ·')));
  assert.ok(groups.some(rows => rows[0].group.startsWith('Skytte ·')));
});

test('Wappen zeigen erlaubte Waffen statt der aktuell gehaltenen Waffe; Ausrüstungsvoraussetzungen bleiben sichtbar', () => {
  const actor = { weapons: [{ id: 'specific', name: 'Dreizack', weaponType: 'polearm' }] };
  const action = { kind: 'technique', weapon: { weaponType: 'bow' } };
  assert.equal(getActionWeaponPresentation(actor, action, { weaponTypes: ['spear'] }).id, 'spear');
  assert.equal(getActionWeaponPresentation(actor, action, {}).id, 'universal');
  assert.match(getActionWeaponPresentation(actor, action, { compatibleWeaponIds: ['specific'] }).title, /Dreizack/);
  assert.equal(getActionWeaponPresentation(actor, action, { weaponTypes: ['axe'] }).icon, 'axe');
  assert.equal(getActionWeaponPresentation(actor, action, { weaponTypes: ['sword'], cultureTraining: { requiresShield: true } }).id, 'shield');
  assert.equal(getActionWeaponPresentation(actor, { kind: 'weapon' }, { weaponType: 'bow', properties: 'Zweihändig' }).id, 'ranged');
  assert.equal(getActionWeaponPresentation(actor, { kind: 'weapon' }, { weaponType: 'sword', versatileDamageFormula: '1d10', properties: 'Vielseitig · zweihändig 1W10' }).id, 'one-handed');
});

test('Auswertung zeigt gespeicherte Würfe, TP und Kosten und maskiert Text; die Belege bleiben unverändert', () => {
  const resolution = { attack: { total: 11, targetDefense: 16, diceResults: [7], modifier: 4 }, damage: { total: 9, notation: '1d8+5' }, targetSnapshot: { hitPointsBefore: 87, hitPointsAfter: 78 }, actorResourceSnapshot: { changes: [{ resourceId: 'action', name: '<Aktion>', before: 1, after: 0 }] } };
  const before = structuredClone(resolution), html = renderEvaluationStats(resolution);
  assert.match(html, /combat-evaluation-stat--attack/); assert.match(html, /combat-evaluation-stat--damage/);
  assert.match(html, /87 → 78/); assert.match(html, /&lt;Aktion&gt;/); assert.match(html, /data-combat-tooltip/);
  assert.deepEqual(resolution, before);
  assert.doesNotMatch(renderEvaluationStats({ attack: { resolutionMode: 'automatic' } }), />—<.*Verteidigung/s);
  const sequence = renderEvaluationStats({ attack: { total: 4, hit: false }, secondarySaves: [{ attributeKey: 'dexterity', total: 12, dc: 18, succeeded: false, timing: 'after-sequence' }], targetConditionSnapshot: { applied: { name: 'Gefegt', duration: 'Nächster eigener Beitrag' } } });
  assert.match(sequence, /GES-Rettung · SG 18/); assert.match(sequence, /Misslungen · nach der Folge/); assert.match(sequence, /Gefegt/);
});
