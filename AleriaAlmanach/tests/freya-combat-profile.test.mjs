import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/freya-skald.json', import.meta.url);

async function loadFreya() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

class TechniqueDiceAdapter {
  constructor({ attacks = [], damages = [], saves = [] } = {}) {
    this.attacks = [...attacks];
    this.damages = [...damages];
    this.saves = [...saves];
  }

  async rollAttack(request) {
    const natural = this.attacks.shift() ?? 15;
    return { id: 'attack', natural, dice: [natural], keptDice: [natural], total: natural + Number(request.modifier || 0) };
  }

  async rollDamage(request) {
    const total = this.damages.shift() ?? 5;
    return { id: 'damage', notation: request.damageFormula, keptDice: [total], modifier: Number(request.bonus || 0), total };
  }
}

class FixedSkillDice {
  constructor(natural = 15) { this.natural = natural; }
  async rollSkill(request) {
    return { id: 'skill', natural: this.natural, dice: [this.natural], keptDice: [this.natural], total: this.natural + Number(request.modifier || 0) };
  }
}

function trainingTarget(id = 'training-target') {
  return resolveCombatProfile({
    id,
    name: 'Uebungsgegner',
    combatProfile: {
      progression: { level: 5 },
      hitPoints: { current: 60, maximumOverride: 60 },
      armorClass: { override: 10 },
      weapons: [{ id: 'club', name: 'Keule', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }]
    }
  });
}

test('Freya ist Stufe 5 Skaldin mit Musikerin-Hintergrund, Laute, Schwert und Schild', async () => {
  const freya = await loadFreya();
  assert.equal(freya.combatProfile.progression.level, 5);
  assert.equal(freya.combatProfile.templateSelections.classId, 'skalde');
  assert.equal(freya.combatProfile.templateSelections.backgroundId, 'musikerin');
  const resolved = resolveCombatProfile(freya);
  assert.equal(resolved.maximumHitPoints, 42);
  assert.equal(resolved.resources.find(resource => resource.id === 'mana-focus').maximum, 39);
  const weaponNames = freya.combatProfile.weapons.map(weapon => weapon.name);
  assert.ok(weaponNames.includes('Laute'));
  assert.ok(weaponNames.includes('Schwert'));
  assert.ok(weaponNames.includes('Schild (Schildstoß)'));
  assert.equal(resolved.weapon.name, 'Laute', 'Laute ist standardmäßig aktiv');
  const shield = freya.combatProfile.armorItems.find(item => item.kind === 'shield');
  assert.equal(shield.armorClassBonus, 2);
});

test('Frohnatur, Gutmensch, Exzentrische Kuenstlerin und Busenwunder addieren sich ueber die Fertigkeitspruefung korrekt', async () => {
  const freya = await loadFreya();
  const profile = resolveCombatProfile(freya);
  const actor = { id: profile.characterId, name: profile.name };

  const persuasion = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'persuasion', difficulty: 5 } },
    { actorProfile: profile }
  );
  const withoutTrigger = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'athletics', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(persuasion.ruleModifier, 1, 'Frohnatur gibt +1 auf Ueberreden');
  assert.equal(withoutTrigger.ruleModifier, 0, 'Athletik ist von keiner Marotte betroffen');

  const deception = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'deception', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(deception.ruleModifier, -3, 'Gutmensch gibt -3 auf Taeuschen');

  const performance = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'performance', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(performance.ruleModifier, 3, 'Frohnatur (+1) und Exzentrische Kuenstlerin (+2) addieren sich auf Auftreten');
  assert.equal(performance.rollMode, 'advantage', 'Kuenstlerische Ausbildung gibt Vorteil auf Auftreten');

  const survival = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'survival', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(survival.ruleModifier, -4, 'Exzentrische Kuenstlerin gibt -4 auf Ueberleben');

  const seduction = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'seduction', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(seduction.ruleModifier, 4, 'Busenwunder gibt +4 auf Flirten');
});

test('Spottvers wuerfelt bei misslungenem Willenskraft-Rettungswurf einen echten 1w4-Malus', async () => {
  const freya = await loadFreya();
  const actor = resolveCombatProfile(freya, { actionId: 'spell:freya-spottvers', segmentKind: 'song' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [2], damages: [3] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.resolutionMode, 'saving-throw');
  assert.equal(result.attack.saveSucceeded, false, 'niedriger Wurf gegen ihre Zauber-SG misslingt');
  const applied = result.targetConditionSnapshot.after.find(condition => condition.name === 'Verspottet');
  assert.ok(applied, 'Verspottet-Zustand wurde angewendet');
  assert.equal(applied.mechanics.attack, -3, 'der gewuerfelte 1w4-Malus (hier 3) wurde als fester Angriffsabzug eingebacken');
});

test('Arkaner Schrei verursacht Flaechenschaden bei misslungenem Konstitution-Rettungswurf, trifft Freya aber immer selbst', async () => {
  const freya = await loadFreya();
  const actor = resolveCombatProfile(freya, { actionId: 'ability:freya-arkaner-schrei', segmentKind: 'song' });
  const manaBefore = actor.resources.find(resource => resource.id === 'mana-focus').current;
  assert.equal(manaBefore, 39, 'Freya beginnt mit vollem Mana');
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [2], damages: [12, 4] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.resolutionMode, 'saving-throw');
  assert.equal(result.attack.saveSucceeded, false);
  assert.equal(result.damage.total, 12, 'volle 3w6 bei misslungenem Rettungswurf');
  const manaAfter = result.actorResourceSnapshot.after.find(resource => resource.id === 'mana-focus').current;
  assert.equal(manaAfter, 0, 'Arkaner Schrei verbraucht praktisch ihr gesamtes Mana');
});

test('Charm/Calm/Enrage Person und Stille sind sinnvollen Graden zugeordnet', async () => {
  const freya = await loadFreya();
  const spells = new Map(freya.combatProfile.magic.spells.map(spell => [spell.id, spell]));
  assert.equal(spells.get('freya-charm-person').level, 1);
  assert.equal(spells.get('freya-calm-person').level, 1);
  assert.equal(spells.get('freya-enrage-person').level, 2);
  assert.equal(spells.get('freya-silence').level, 3);
  assert.equal(spells.get('freya-charm-person').resolutionType, 'saving-throw');
  assert.equal(spells.get('freya-silence').resolutionType, 'automatic');
});
