import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { resolveSavingThrowRollMode } from '../modules/combat/combat-profile-model.js';

function ragingFenrirActive(fenrir) {
  const berserkergangCondition = fenrir.combatProfile.abilities
    .find(ability => ability.id === 'fenrir-berserkergang').effects
    .find(effect => effect.type === 'apply-condition').condition;
  return {
    ...fenrir,
    combatProfile: {
      ...fenrir.combatProfile,
      conditions: [...fenrir.combatProfile.conditions, { ...berserkergangCondition, active: true }]
    }
  };
}

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/fenrir-varulv.json', import.meta.url);

async function loadFenrir() {
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

  async rollSavingThrow(request) {
    const natural = this.saves.shift() ?? 5;
    return { id: 'save', natural, dice: [natural], keptDice: [natural], total: natural + Number(request.modifier || 0) };
  }
}

function trainingTarget(id = 'training-target') {
  return resolveCombatProfile({
    id,
    name: 'Uebungsgegner',
    combatProfile: {
      progression: { level: 6 },
      hitPoints: { current: 80, maximumOverride: 80 },
      armorClass: { override: 10 },
      weapons: [{ id: 'club', name: 'Keule', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }]
    }
  });
}

test('Fenrir ist Stufe 6 Skjaldr mit Huskarl-Hintergrund und vollständiger Axtausrüstung', async () => {
  const fenrir = await loadFenrir();
  assert.equal(fenrir.combatProfile.progression.level, 6);
  assert.equal(fenrir.combatProfile.templateSelections.classId, 'skjaldr');
  assert.equal(fenrir.combatProfile.templateSelections.backgroundId, 'huskarl');
  assert.ok(fenrir.combatProfile.proficiencies.armor.includes('heavy'));
  const weaponNames = fenrir.combatProfile.weapons.map(weapon => weapon.name);
  assert.ok(weaponNames.includes('Großaxt'));
  assert.ok(weaponNames.includes('Einhandäxte (Paar)'));
  assert.ok(weaponNames.includes('Wurfaxt'));
  assert.ok(weaponNames.includes('Huskarl-Rundschild (Schildstoß)'));
  const shield = fenrir.combatProfile.armorItems.find(item => item.kind === 'shield');
  assert.equal(shield.armorClassBonus, 2);
  assert.equal(shield.equipped, true);
});

test('Fenrirs Rüstungsklasse und Aura-Fokus ergeben sich korrekt aus Schuppenpanzer, Schild und Stufe 6', async () => {
  const fenrir = await loadFenrir();
  const resolved = resolveCombatProfile(fenrir);
  // Basis 14 (Schuppenpanzer) + 1 (GES-Mod, capped 2) + 2 (Schildbonus) = 17
  assert.equal(resolved.totalDefense, 17);
  const auraFocus = resolved.resources.find(resource => resource.id === 'aura-focus');
  assert.equal(auraFocus.maximum, 1, 'Aura-Fokus wächst ab Stufe 6 automatisch');
});

test('Doppelhieb der Zwillingsäxte würfelt drei getrennte Angriffe in einer Handlung', async () => {
  const fenrir = await loadFenrir();
  const actor = resolveCombatProfile(fenrir, { actionId: 'technique:fenrir-twin-axe-flurry', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15, 16, 17], damages: [4, 5, 6] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks.length, 2, 'zwei Folgeangriffe zusätzlich zum Hauptangriff ergeben drei Angriffe insgesamt');
  assert.equal(result.followUpAttacks[0].attack.hit, true);
  assert.equal(result.followUpAttacks[1].attack.hit, true);
  assert.equal(result.damage.primaryTotal, 4);
  assert.equal(result.damage.total, 4 + 5 + 6);
});

test('Zerschmetternder Hieb und Kreiselwurf rechnen ihre Zusatzwürfel und Boni korrekt ein', async () => {
  const fenrir = await loadFenrir();
  const crush = resolveCombatProfile(fenrir, { actionId: 'technique:fenrir-crushing-blow', segmentKind: 'combataction' });
  assert.equal(crush.weapon.damageFormula, '1d12+1d4');
  const throwTechnique = resolveCombatProfile(fenrir, { actionId: 'technique:fenrir-spinning-throw', segmentKind: 'combataction' });
  assert.equal(throwTechnique.weapon.damageFormula, '1d6+1d4');
  assert.equal(throwTechnique.attackModifier, crush.attackModifier + 1);
});

test('Schildstoß legt bei misslungenem Rettungswurf einen echten temporären Angriffsabzug an', async () => {
  const fenrir = await loadFenrir();
  // Wie beim Wechsel zwischen Großaxt und Zwillingsäxten muss die Spielerin vor dem Schildstoß
  // erst den Rundschild als aktiv geführte Waffe markieren.
  fenrir.combatProfile.weapons = fenrir.combatProfile.weapons.map(weapon => ({
    ...weapon,
    equipped: weapon.id === 'fenrir-roundshield-bash'
  }));
  const actor = resolveCombatProfile(fenrir, { actionId: 'technique:fenrir-shield-bash', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [3], saves: [2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.secondarySaves.length, 1);
  assert.equal(result.secondarySaves[0].succeeded, false);
  assert.equal(result.targetConditionSnapshot.applied.mechanics.attack, -2);
});

test('Berserkergang gewährt 10 temporäre Trefferpunkte und den Rage-Zustand mit +5 Angriff/-5 Rüstungsklasse', async () => {
  const fenrir = await loadFenrir();
  const actor = resolveCombatProfile(fenrir, { actionId: 'ability:fenrir-berserkergang', segmentKind: 'combataction' });
  const dummy = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({})).resolveAttack({ actor, target: dummy });
  assert.equal(result.actorHitPointSnapshot.after.temporary, 10);
  const appliedCondition = result.actorConditionSnapshot.after.find(condition => condition.id.startsWith('fenrir-berserkergang-state'));
  assert.ok(appliedCondition, 'Berserkergang-Zustand wurde angewendet');
  assert.equal(appliedCondition.mechanics.attack, 5);
  assert.equal(appliedCondition.mechanics.armorClass, -5);
  assert.equal(appliedCondition.durationModel.kind, 'combat');
});

test('Während des Berserkergangs wird der Rage-Bonuswürfel automatisch an jeden Treffer angehängt', async () => {
  const fenrir = ragingFenrirActive(await loadFenrir());
  const actor = resolveCombatProfile(fenrir, { actionId: 'technique:fenrir-crushing-blow', segmentKind: 'combataction' });
  const calm = resolveCombatProfile(await loadFenrir(), { actionId: 'technique:fenrir-crushing-blow', segmentKind: 'combataction' });
  assert.equal(actor.attackModifier, calm.attackModifier + 5, 'Rage gibt +5 auf den Angriffswurf');
  assert.equal(actor.totalDefense, calm.totalDefense - 5, 'Rage senkt die eigene Rüstungsklasse um 5');

  const target = trainingTarget();
  const dice = new TechniqueDiceAdapter({ attacks: [15], damages: [21] });
  let capturedFormula = '';
  const originalRollDamage = dice.rollDamage.bind(dice);
  dice.rollDamage = request => {
    capturedFormula = request.damageFormula;
    return originalRollDamage(request);
  };
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  // Zerschmetternder Hieb (1w12+1w4) plus Rage-Bonuswürfel (1w6) werden in einem Wurf zusammengeführt.
  assert.equal(capturedFormula, '1d12+1d4+1d6');
  assert.equal(result.damage.total, 21);
});

test('Berserkergang gibt Vorteil bei Stärke- und Nachteil bei Weisheit-/Intelligenz-/Charisma-/Konstitution-Rettungswürfen', async () => {
  const fenrir = ragingFenrirActive(await loadFenrir());
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'strength'), 'advantage');
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'wisdom'), 'disadvantage');
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'intelligence'), 'disadvantage');
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'charisma'), 'disadvantage');
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'constitution'), 'disadvantage');
  assert.equal(resolveSavingThrowRollMode(fenrir.combatProfile, 'dexterity'), 'normal', 'Geschick ist von der Rage nicht betroffen');

  const calm = await loadFenrir();
  assert.equal(resolveSavingThrowRollMode(calm.combatProfile, 'strength'), 'normal', 'ohne aktive Rage gilt kein Vor-/Nachteil');
});
