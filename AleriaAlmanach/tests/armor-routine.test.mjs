import assert from 'node:assert/strict';
import test from 'node:test';
import { ARMOR_ROUTINE_CLASS_IDS, getArmorRoutine, hasArmorRoutineClass } from '../modules/classes/armor-routine.js';
import { getArmorClass, getWeaponAttackModifier, resolveCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { applyManualCharacterLevel, createCharacterLevelUpPlan, previewCharacterLevelUp } from '../modules/combat/combat-level-up-model.js';
import { CHARACTER_CLASS_TEMPLATES } from '../modules/combat/character-creation-templates.js';
import { ARCHIVE_PAGE_CLASSES } from '../modules/character-archive/character-archive-page-data.js';

const fighter = (classId = 'teulu', level = 11) => ({
  templateSelections: { classId }, identity: { archetype: 'Teulu' }, progression: { level },
  attributes: [{ key: 'dexterity', score: 16 }],
  armorItems: [{ id: 'plate', name: 'Platte', kind: 'armor', baseArmorClass: 16, equipped: true,
    dexterityMode: 'full', dexterityUnlockLevel: 6 }]
});

test('alle Kämpferklassen erhalten Rüstungsroutine erst mit Stufe 12, auch bei alten Rüstungseinträgen', () => {
  for (const id of ARMOR_ROUTINE_CLASS_IDS) {
    for (const level of [1, 6, 11, 12, 20]) {
      const profile = fighter(id, level);
      assert.equal(getArmorClass(profile), level >= 12 ? 19 : 16, `${id} / ${level}`);
      assert.equal(getArmorRoutine(profile)?.unlocked, level >= 12);
    }
  }
  for (const template of CHARACTER_CLASS_TEMPLATES.filter(t => !['magier', 'kleriker', 'hexer'].includes(t.id))) {
    assert.ok(hasArmorRoutineClass({ templateSelections: { classId: template.id } }), template.id);
  }
  const nonFighters = new Set(['alchemist', 'magier', 'druide', 'pakttrager', 'kleriker', 'schamane', 'cernach']);
  for (const entry of ARCHIVE_PAGE_CLASSES) {
    assert.equal(hasArmorRoutineClass({ identity: { archetype: entry.name } }), !nonFighters.has(entry.id), entry.name);
  }
});

test('Klassenwahl, ältere Namen und Basis-Rüstung folgen derselben Freischaltung', () => {
  for (const archetype of ['Kämpfer', 'Krieger', 'Mönch', 'Paladin', 'Cenyr-Teulu', 'Hird/Maid', 'Ceólaire & Piobaire']) {
    const profile = { ...fighter(), templateSelections: {}, identity: { archetype } };
    assert.equal(getArmorClass(profile), 16, archetype);
  }
  assert.equal(getArmorClass(fighter('magier')), 19, 'expliziter Magier wird nicht aus dem Text als Teulu umgedeutet');
  assert.equal(getArmorClass({ ...fighter(), armorItems: [], armorClass: { base: 16 } }), 16);
  assert.equal(getArmorClass({ ...fighter('teulu', 12), armorItems: [], armorClass: { base: 16 } }), 19);
  const prematureSpecialLevels = fighter('teulu', 6);
  prematureSpecialLevels.progression.specialLevels = 6;
  assert.equal(getArmorClass(prematureSpecialLevels), 16, 'Sonderstufen umgehen keine noch nicht erreichte Klassenstufe');
});

test('ohne Rüstung, bei Schild, GES-Limit und festen RK-Werten bleiben die Ausrüstungsregeln erhalten', () => {
  const bare = { ...fighter(), armorItems: [{ id: 'shield', kind: 'shield', equipped: true, armorClassBonus: 2 }] };
  assert.equal(getArmorClass(bare), 15);
  const profile = fighter('teulu', 12);
  profile.armorItems[0].dexterityMode = 'capped';
  profile.armorItems[0].dexterityCap = 2;
  assert.equal(getArmorClass(profile), 18);
  profile.armorItems[0].dexterityUnlockLevel = 15;
  assert.equal(getArmorClass(profile), 16);
  profile.armorItems[0].dexterityMode = 'none';
  profile.progression.level = 20;
  assert.equal(getArmorClass(profile), 16);
  assert.equal(getArmorClass({ ...fighter(), armorClass: { override: 23, overrideMode: 'total' } }), 23);
  const resolved = resolveCharacterCombatProfile({ combatProfile: fighter() });
  assert.equal(resolved.initiative, 3);
  assert.equal(getWeaponAttackModifier(fighter(), { attackAttribute: 'dexterity', proficient: false }), 3);
});

test('manuelle Stufenwahl und Rückstufung schalten Rüstungsroutine ohne dauerhaften Doppelbonus', () => {
  let profile = fighter('kampfer', 11);
  profile = applyManualCharacterLevel(profile, 12).profile;
  assert.equal(getArmorClass(profile), 19);
  profile = applyManualCharacterLevel(profile, 12).profile;
  assert.equal(getArmorClass(profile), 19);
  profile = applyManualCharacterLevel(profile, 11).profile;
  assert.equal(getArmorClass(profile), 16);
  const preview = previewCharacterLevelUp(profile, createCharacterLevelUpPlan(profile));
  assert.equal(getArmorClass(preview.profile), 19);
  assert.ok(preview.changes.some(change => change.after === 'Rüstungsroutine'));
  assert.ok(preview.changes.some(change => change.key === 'armor-class' && change.before === 16 && change.after === 19));
});
