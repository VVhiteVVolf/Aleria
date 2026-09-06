import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/guinevere-neidr.json', import.meta.url);

async function loadGuinevere() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

test('Guinevere ist eine Stufe-5-Helwyr mit ihrem regulären Klassenarsenal', async () => {
  const guinevere = await loadGuinevere();
  const profile = guinevere.combatProfile;
  assert.equal(profile.progression.level, 5);
  assert.equal(profile.templateSelections.classId, 'helwyr');
  assert.deepEqual(profile.weapons.map(weapon => weapon.id), [
    'default-unarmed-melee',
    'guinevere-longbow',
    'guinevere-shortbow',
    'guinevere-sword',
    'guinevere-hunting-daggers'
  ]);
  assert.equal(profile.weapons.find(weapon => weapon.id === 'guinevere-longbow').equipped, true);
  assert.equal(profile.weapons.some(weapon => /fire|signal|crippling/.test(weapon.id)), false);
});

test('Guineveres drei Attackenslots decken Bogen, Schwert und Doppelklinge des Jungdrachens ab', async () => {
  const { combatProfile } = await loadGuinevere();
  assert.deepEqual(combatProfile.techniques.map(technique => technique.name), [
    'Federblick',
    'Waldwacht',
    'Schattenpaar'
  ]);
  assert.deepEqual(combatProfile.classTraining.techniqueSelections.map(selection => selection.slotId), [
    'foundation-01', 'foundation-02', 'foundation-03'
  ]);
  assert.equal(combatProfile.techniques.every(technique => technique.combatStyleId === 'drachentanz'), true);
  assert.deepEqual(combatProfile.techniques.map(technique => technique.cenyrTraining.branchId), ['helwyr-longbow', 'helwyr-classic-sword', 'helwyr-dual-blades']);
});

test('Federblick verbindet den Helwyr-Fernkampfbonus mit dem Angriff der Form', async () => {
  const guinevere = await loadGuinevere();
  const base = resolveCombatProfile(guinevere, {
    actionId: 'weapon:guinevere-longbow', segmentKind: 'combataction'
  });
  const federblick = resolveCombatProfile(guinevere, {
    actionId: 'technique:combat-style-drachentanz-helwyr-jungdrache-federblick', segmentKind: 'combataction'
  });
  assert.equal(federblick.weapon.weaponType, 'bow');
  assert.equal(federblick.weapon.ammunition.inventoryItemId, 'guinevere-arrows-standard');
  assert.equal(federblick.selectedAction.formula, '1d4');
  assert.equal(federblick.attackModifier, base.attackModifier + 1);
});

test('Guineveres Lederrüstung erhält den Geschicklichkeitsbonus erst durch Rüstungsroutine', async () => {
  const character = await loadGuinevere();
  assert.equal(resolveCombatProfile(character).totalDefense, 11);
  character.combatProfile.progression.level = 12;
  assert.equal(resolveCombatProfile(character).totalDefense, 15);
});

test('Scharfsinnig gibt +1 auf intelligenzbasierte Fertigkeiten und Vorteil bei Nachforschungen', async () => {
  const profile = resolveCombatProfile(await loadGuinevere());
  const actor = { id: profile.characterId, name: profile.name };
  class FixedSkillDice {
    async rollSkill(request) {
      return { id: 'skill', natural: 10, dice: [10], keptDice: [10], total: 10 + Number(request.modifier || 0) };
    }
  }
  const service = new SkillResolutionService(new FixedSkillDice());
  const arcane = await service.resolve({ actor, settings: { skillId: 'arcane-kunde', difficulty: 5 } }, { actorProfile: profile });
  const investigation = await service.resolve({ actor, settings: { skillId: 'investigation', difficulty: 5 } }, { actorProfile: profile });
  const athletics = await service.resolve({ actor, settings: { skillId: 'athletics', difficulty: 5 } }, { actorProfile: profile });
  assert.equal(arcane.ruleModifier, 1);
  assert.equal(investigation.ruleModifier, 1);
  assert.equal(investigation.rollMode, 'advantage');
  assert.equal(athletics.ruleModifier, 0);
});
