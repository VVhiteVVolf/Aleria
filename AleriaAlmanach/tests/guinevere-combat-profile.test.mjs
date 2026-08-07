import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/guinevere-neidr.json', import.meta.url);

async function loadGuinevere() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

function equipOnly(character, weaponId) {
  return {
    ...character,
    combatProfile: {
      ...character.combatProfile,
      weapons: character.combatProfile.weapons.map(weapon => ({ ...weapon, equipped: weapon.id === weaponId }))
    }
  };
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
      progression: { level: 5 },
      hitPoints: { current: 60, maximumOverride: 60 },
      armorClass: { override: 10 },
      weapons: [{ id: 'club', name: 'Keule', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }]
    }
  });
}

function animalTarget(id = 'wolf-target') {
  return resolveCombatProfile({
    id,
    name: 'Wildwolf',
    combatProfile: {
      progression: { level: 3 },
      hitPoints: { current: 20, maximumOverride: 20 },
      armorClass: { override: 10 },
      weapons: [{ id: 'bite', name: 'Biss', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }],
      quirks: [{
        id: 'wolf-tier-tag',
        name: 'Tierhafte Kreatur',
        type: 'trait',
        tags: 'Tier',
        active: true
      }]
    }
  });
}

test('Guinevere ist Stufe 5 Helwyr-Bogenschuetzin mit voller Waffen- und Munitionsausruestung', async () => {
  const guinevere = await loadGuinevere();
  assert.equal(guinevere.combatProfile.progression.level, 5);
  assert.equal(guinevere.combatProfile.templateSelections.classId, 'helwyr');
  const weaponNames = guinevere.combatProfile.weapons.map(weapon => weapon.name);
  assert.ok(weaponNames.includes('Helwyr Langbogen'));
  assert.ok(weaponNames.includes('Helwyr Kurzbogen'));
  assert.ok(weaponNames.includes('Helwyr Schwert'));
  assert.ok(weaponNames.includes('Helwyr Jagddolche (Paar)'));
  const ammoQuantities = Object.fromEntries(
    guinevere.inventory.items.map(item => [item.id, Number(item.quantity)])
  );
  assert.equal(ammoQuantities['guinevere-arrows-standard'], 40);
  assert.equal(ammoQuantities['guinevere-arrows-fire'], 5);
  assert.equal(ammoQuantities['guinevere-arrows-signal'], 3);
  assert.equal(ammoQuantities['guinevere-arrows-crippling'], 4);
  const armor = guinevere.combatProfile.armorItems.find(item => item.kind === 'armor');
  assert.equal(armor.equipped, true);
});

test('Guineveres Ruestungsklasse ergibt sich aus Lederruestung und vollem Geschicklichkeitsbonus', async () => {
  const guinevere = await loadGuinevere();
  const resolved = resolveCombatProfile(guinevere);
  // Basis 11 (Lederruestung) + 4 (GES-Mod bei DEX 18, ungedeckelt) = 15
  assert.equal(resolved.totalDefense, 15);
});

test('Scharfschuss addiert +4 auf den Trefferwurf und wuerfelt 1W8 plus 1W6 Schaden', async () => {
  const guinevere = await loadGuinevere();
  const base = resolveCombatProfile(guinevere, { actionId: 'weapon:guinevere-longbow', segmentKind: 'combataction' });
  const scharfschuss = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-scharfschuss', segmentKind: 'combataction' });
  assert.equal(scharfschuss.attackModifier, base.attackModifier + 4);
  assert.equal(scharfschuss.weapon.damageFormula, '1d8+1d6');
});

test('Nachgesetzter Pfeil loest einen echten zweiten, unabhaengigen Treffer- und Schadenswurf aus', async () => {
  const guinevere = await loadGuinevere();
  const actor = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-nachgesetzter-pfeil', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15, 16], damages: [4, 2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks.length, 1, 'ein Folgeschuss zusaetzlich zum Hauptschuss ergibt zwei Treffer insgesamt');
  assert.equal(result.followUpAttacks[0].attack.hit, true);
  assert.equal(result.damage.primaryTotal, 4);
  assert.equal(result.damage.total, 4 + 2);
});

test('Rasche Salve funktioniert ebenso mit dem Kurzbogen ausgeruestet', async () => {
  const guinevere = equipOnly(await loadGuinevere(), 'guinevere-shortbow');
  const actor = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-rasche-salve', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15, 16], damages: [3, 2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks.length, 1);
  assert.equal(result.followUpAttacks[0].attack.hit, true);
});

test('Signalpfeil und Kruepplungspfeil verursachen beim Treffer einen echten gewuerfelten Angriffsmalus', async () => {
  const guinevere = await loadGuinevere();
  const signalActor = resolveCombatProfile(guinevere, { actionId: 'weapon:guinevere-shortbow-signal', segmentKind: 'combataction' });
  const signalTarget = trainingTarget('signal-target');
  const signalResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [3, 2] }))
    .resolveAttack({ actor: signalActor, target: signalTarget });
  const signalCondition = signalResult.targetConditionSnapshot.after.find(condition => condition.name === 'Vom Signalpfeil verstört');
  assert.ok(signalCondition, 'Signalpfeil-Zustand wurde angewendet');
  assert.equal(signalCondition.mechanics.attack, -2, 'der gewuerfelte 1W4-Malus (hier 2) wurde als fester Angriffsabzug eingebacken');

  const cripplingActor = resolveCombatProfile(guinevere, { actionId: 'weapon:guinevere-longbow-crippling', segmentKind: 'combataction' });
  const cripplingTarget = trainingTarget('crippling-target');
  const cripplingResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [4, 3] }))
    .resolveAttack({ actor: cripplingActor, target: cripplingTarget });
  const cripplingCondition = cripplingResult.targetConditionSnapshot.after.find(condition => condition.name === 'Krüpplungswunde');
  assert.ok(cripplingCondition, 'Kruepplungswunde wurde angewendet');
  assert.equal(cripplingCondition.mechanics.attack, -3, 'der gewuerfelte 1W4-Malus (hier 3) wurde als fester Angriffsabzug eingebacken');
});

test('Verkruepplender Schuss hat SG 15, verursacht keinen Schaden und loest bei misslungenem Rettungswurf nur eine freitextbasierte Bewegungsbedingung aus', async () => {
  const guinevere = await loadGuinevere();
  const actor = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-verkrueppelnder-schuss', segmentKind: 'combataction' });
  assert.equal(actor.selectedAction.secondarySave.dc, 15, 'SG 15 ergibt sich aus dcBase 11 + DEX-Mod 4');
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [], saves: [2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.secondarySaves[0].succeeded, false);
  assert.equal(result.damage, null, 'kein Schaden, reiner Kontrolleffekt');
  assert.equal(result.targetConditionSnapshot.applied.name, 'Verkrüppelt');
});

test('Verkruepplender Schuss loest bei bestandenem Rettungswurf keine Bedingung aus', async () => {
  const guinevere = await loadGuinevere();
  const actor = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-verkrueppelnder-schuss', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [0], saves: [19] }))
    .resolveAttack({ actor, target });
  assert.equal(result.secondarySaves[0].succeeded, true);
  assert.equal(result.targetConditionSnapshot, null, 'bei bestandenem Rettungswurf passiert nichts');
});

test('Rascher Hieb und Gezielter Stich sind Teulu-Schwerttechniken, schwaecher als vergleichbare Ritter-Techniken', async () => {
  const guinevere = equipOnly(await loadGuinevere(), 'guinevere-sword');
  const base = resolveCombatProfile(guinevere, { actionId: 'weapon:guinevere-sword', segmentKind: 'combataction' });
  const rascherHieb = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-rascher-hieb', segmentKind: 'combataction' });
  const gezielterStich = resolveCombatProfile(guinevere, { actionId: 'technique:guinevere-gezielter-stich', segmentKind: 'combataction' });
  assert.equal(rascherHieb.weapon.damageFormula, '1d6+1d4');
  assert.equal(rascherHieb.attackModifier, base.attackModifier);
  assert.equal(gezielterStich.attackModifier, base.attackModifier + 1);
});

test('Scharfsinnig gibt +1 auf intelligenzbasierte Fertigkeiten und Vorteil bei Nachforschungen', async () => {
  const guinevere = await loadGuinevere();
  const profile = resolveCombatProfile(guinevere);
  const actor = { id: profile.characterId, name: profile.name };

  class FixedSkillDice {
    constructor(natural = 15) { this.natural = natural; }
    async rollSkill(request) {
      return { id: 'skill', natural: this.natural, dice: [this.natural], keptDice: [this.natural], total: this.natural + Number(request.modifier || 0) };
    }
  }

  const arcaneKunde = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'arcane-kunde', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(arcaneKunde.ruleModifier, 1, 'Scharfsinnig gibt +1 auf Arkane Kunde');

  const investigation = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'investigation', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(investigation.ruleModifier, 1, 'Scharfsinnig gibt +1 auch auf Nachforschungen');
  assert.equal(investigation.rollMode, 'advantage', 'zusaetzlich Vorteil speziell bei Nachforschungen');

  const athletics = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'athletics', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(athletics.ruleModifier, 0, 'Athletik ist nicht intelligenzbasiert');
});

test('Jaegerauge gibt einen echten +2-Bonus auf Angriffswuerfe gegen als Tier markierte Ziele', async () => {
  const guinevere = await loadGuinevere();
  const actor = resolveCombatProfile(guinevere, { actionId: 'weapon:guinevere-longbow', segmentKind: 'combataction' });
  const wolf = animalTarget();
  const human = trainingTarget();
  const dice = new TechniqueDiceAdapter({ attacks: [10, 10], damages: [4, 4] });
  const capturedModifiers = [];
  const originalRollAttack = dice.rollAttack.bind(dice);
  dice.rollAttack = request => {
    capturedModifiers.push(request.modifier);
    return originalRollAttack(request);
  };
  const service = new CombatResolutionService(dice);
  await service.resolveAttack({ actor, target: wolf });
  await service.resolveAttack({ actor, target: human });
  assert.equal(capturedModifiers[0], capturedModifiers[1] + 2, 'Jaegerauge gibt +2 gegen als Tier markierte Ziele, aber nicht gegen Menschen');
});
