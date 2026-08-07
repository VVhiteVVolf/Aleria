import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/rhiannon-draig.json', import.meta.url);

async function loadRhiannon() {
  const exported = JSON.parse(await readFile(exportUrl, 'utf8'));
  return exported.character;
}

class TechniqueDiceAdapter {
  constructor({ attacks = [], damages = [], saves = [], wardRolls = [] } = {}) {
    this.attacks = [...attacks];
    this.damages = [...damages];
    this.saves = [...saves];
    this.wardRolls = [...wardRolls];
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

  async rollWardDeflection() {
    const natural = this.wardRolls.shift() ?? 10;
    return { id: 'ward', natural, dice: [natural], keptDice: [natural], total: natural };
  }
}

function trainingTarget(id = 'training-target') {
  return resolveCombatProfile({
    id,
    name: 'Uebungsgegner',
    combatProfile: {
      progression: { level: 6 },
      hitPoints: { current: 60, maximumOverride: 60 },
      armorClass: { override: 10 },
      weapons: [{ id: 'club', name: 'Keule', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }]
    }
  });
}

// Der Ablenkungs-Zustand liegt im laufenden Kampf in `temporaryConditions` (aus der
// Kommentar-Historie hergeleitet), nicht im dauerhaften `combatProfile.conditions`.
// Fuer den Test wird das aufgeloeste Profil direkt damit versehen.
function warded(resolvedProfile, condition) {
  return { ...resolvedProfile, temporaryConditions: [{ ...condition, active: true }] };
}

test('Rhiannon ist Stufe 6 Magierin mit 23 Zaubern und der Ausbildung ihres Meisters Myrddin', async () => {
  const rhiannon = await loadRhiannon();
  assert.equal(rhiannon.combatProfile.progression.level, 6);
  assert.equal(rhiannon.combatProfile.templateSelections.classId, 'magier');
  assert.equal(rhiannon.combatProfile.magic.spells.length, 23);
  const resolved = resolveCombatProfile(rhiannon);
  assert.equal(resolved.resources.find(resource => resource.id === 'mana-focus').maximum, 45);
  assert.equal(resolved.spellSaveDc, 17, '8 + INT-Mod 5 + Übungsbonus 3 + Ausbildungsbonus 1');
});

test('Hervorragende Arkane Ausbildung gibt Vorteil bei Arkaner Kunde, andere Fertigkeiten bleiben unberührt', async () => {
  const rhiannon = await loadRhiannon();
  const profile = resolveCombatProfile(rhiannon);
  const actor = { id: profile.characterId, name: profile.name };

  class FixedSkillDice {
    constructor(natural = 10) { this.natural = natural; }
    async rollSkill(request) {
      return { id: 'skill', natural: this.natural, dice: [this.natural], keptDice: [this.natural], total: this.natural + Number(request.modifier || 0) };
    }
  }

  const arcaneKunde = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'arcane-kunde', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(arcaneKunde.rollMode, 'advantage');

  const athletics = await new SkillResolutionService(new FixedSkillDice(10)).resolve(
    { actor, settings: { skillId: 'athletics', difficulty: 5 } },
    { actorProfile: profile }
  );
  assert.equal(athletics.rollMode, 'normal');
});

test('Alle 5 Zaubertricks kosten 1 Mana und sind rein freitextbasiert ohne Struktureffekt', async () => {
  const rhiannon = await loadRhiannon();
  const resolved = resolveCombatProfile(rhiannon);
  const cantrips = resolved.magic.spells.filter(spell => spell.level === 0);
  assert.equal(cantrips.length, 5);
  cantrips.forEach(spell => {
    assert.equal(spell.manaCost, 1, `${spell.name} soll 1 Mana kosten`);
    assert.equal(spell.effects.length, 0, `${spell.name} soll keinen Struktureffekt haben`);
    assert.equal(spell.resolutionType, 'automatic');
  });
});

test('Magierruestung gewaehrt sofort echte gewuerfelte temporaere Trefferpunkte (1W10)', async () => {
  const rhiannon = await loadRhiannon();
  const actor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-magierruestung', segmentKind: 'spell' });
  const dummy = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ damages: [7] }))
    .resolveAttack({ actor, target: dummy });
  assert.equal(result.actorHitPointSnapshot.after.temporary, 7);
});

test('Magisches Geschoss trifft automatisch und verursacht reinen gewuerfelten Schaden', async () => {
  const rhiannon = await loadRhiannon();
  const actor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-magisches-geschoss', segmentKind: 'spell' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ damages: [12] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.resolutionMode, 'automatic');
  assert.equal(result.attack.hit, true);
  assert.equal(result.damage.total, 12);
});

test('Windklinge ist ein Zauberangriffswurf, Druckstoss ein Rettungswurf mit halbem Schaden bei Erfolg', async () => {
  const rhiannon = await loadRhiannon();
  const target = trainingTarget();

  const bladeActor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-windklinge', segmentKind: 'spell' });
  const bladeResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [9] }))
    .resolveAttack({ actor: bladeActor, target });
  assert.equal(bladeResult.attack.resolutionMode, 'spell-attack');
  assert.equal(bladeResult.attack.hit, true);
  assert.equal(bladeResult.damage.total, 9);

  const shoveActor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-druckstoss', segmentKind: 'spell' });
  const shoveResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [19], damages: [10] }))
    .resolveAttack({ actor: shoveActor, target: trainingTarget('shove-target') });
  assert.equal(shoveResult.attack.resolutionMode, 'saving-throw');
  assert.equal(shoveResult.attack.saveSucceeded, true, 'hoher Wurf besteht den Staerke-Rettungswurf');
  assert.equal(shoveResult.damage.total, 5, 'halber Schaden bei bestandenem Rettungswurf');
});

test('Schild wehrt den naechsten Treffer vollstaendig ab und muss danach neu gewirkt werden', async () => {
  const rhiannon = await loadRhiannon();
  const castActor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-schild', segmentKind: 'spell' });
  const dummy = trainingTarget();
  const castResult = await new CombatResolutionService(new TechniqueDiceAdapter({}))
    .resolveAttack({ actor: castActor, target: dummy });
  const shieldCondition = castResult.actorConditionSnapshot.after.find(condition => condition.name === 'Schild');
  assert.ok(shieldCondition, 'Schild-Zustand wurde angewendet');
  assert.equal(shieldCondition.ward.charges, 1);

  const enemy = resolveCombatProfile({
    id: 'enemy-1', name: 'Angreifer',
    combatProfile: {
      progression: { level: 6 }, hitPoints: { current: 30, maximumOverride: 30 }, armorClass: { override: 10 },
      weapons: [{ id: 'sword', name: 'Schwert', damageFormula: '1d8', attackAttribute: 'strength', equipped: true }]
    }
  });
  const shieldedTarget = warded(resolveCombatProfile(rhiannon), shieldCondition);

  const firstHit = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [18], damages: [6] }))
    .resolveAttack({ actor: enemy, target: shieldedTarget });
  assert.equal(firstHit.attack.hit, false, 'der Schild lenkt den ersten Treffer vollstaendig ab');
  assert.equal(firstHit.damage, null);
  const afterFirstHit = firstHit.targetConditionSnapshot.after.find(condition => condition.name === 'Schild');
  assert.equal(afterFirstHit, undefined, 'die einzige Ladung ist jetzt verbraucht, der Zustand ist weg');
});

test('Ein kritischer Treffer zerbricht den Schild, statt selbst abgelenkt zu werden', async () => {
  const rhiannon = await loadRhiannon();
  const castActor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-schild', segmentKind: 'spell' });
  const dummy = trainingTarget();
  const castResult = await new CombatResolutionService(new TechniqueDiceAdapter({}))
    .resolveAttack({ actor: castActor, target: dummy });
  const shieldCondition = castResult.actorConditionSnapshot.after.find(condition => condition.name === 'Schild');

  const enemy = resolveCombatProfile({
    id: 'enemy-2', name: 'Angreifer',
    combatProfile: {
      progression: { level: 6 }, hitPoints: { current: 30, maximumOverride: 30 }, armorClass: { override: 10 },
      weapons: [{ id: 'sword', name: 'Schwert', damageFormula: '1d8', attackAttribute: 'strength', equipped: true }]
    }
  });
  const shieldedTarget = warded(resolveCombatProfile(rhiannon), shieldCondition);
  const critHit = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [20], damages: [8] }))
    .resolveAttack({ actor: enemy, target: shieldedTarget });
  assert.equal(critHit.attack.hit, true, 'der kritische Treffer verbindet trotz Schild');
  assert.equal(critHit.attack.criticalSuccess, true);
  assert.equal(critHit.damage.total, 8);
  const afterCrit = critHit.targetConditionSnapshot.after.find(condition => condition.name === 'Schild');
  assert.equal(afterCrit, undefined, 'der Schild ist zerbrochen');
});

test('Spiegelbilder lenkt Treffer mit 67-%-Chance ab (gewuerfelt) und laesst 33 % durch', async () => {
  const rhiannon = await loadRhiannon();
  const castActor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-spiegelbilder', segmentKind: 'spell' });
  const dummy = trainingTarget();
  const castResult = await new CombatResolutionService(new TechniqueDiceAdapter({}))
    .resolveAttack({ actor: castActor, target: dummy });
  const mirrorCondition = castResult.actorConditionSnapshot.after.find(condition => condition.name === 'Spiegelbilder');
  assert.equal(mirrorCondition.ward.charges, 2);

  const enemy = resolveCombatProfile({
    id: 'enemy-3', name: 'Angreifer',
    combatProfile: {
      progression: { level: 6 }, hitPoints: { current: 30, maximumOverride: 30 }, armorClass: { override: 10 },
      weapons: [{ id: 'sword', name: 'Schwert', damageFormula: '1d8', attackAttribute: 'strength', equipped: true }]
    }
  });

  // 67 % Ablenkchance wird auf einen W20-Schwellenwert von 13 abgebildet (kein Missbrauch der
  // reinen W4-W12-Schadensformel, siehe rollWardDeflection statt rollDamage im Resolver).
  const deflectedTarget = warded(resolveCombatProfile(rhiannon), mirrorCondition);
  const deflected = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [18], wardRolls: [13] }))
    .resolveAttack({ actor: enemy, target: deflectedTarget });
  assert.equal(deflected.attack.hit, false, 'Ablenkungswurf 13 <= Schwelle 13 trifft ein Trugbild');
  assert.equal(deflected.damage, null, 'kein Schadenswurf noetig, da abgelenkt');
  const afterDeflect = deflected.targetConditionSnapshot.after.find(condition => condition.name === 'Spiegelbilder');
  assert.equal(afterDeflect.ward.charges, 1, 'eine Ladung wurde verbraucht');

  const connectedTarget = warded(resolveCombatProfile(rhiannon), mirrorCondition);
  const connected = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [18], wardRolls: [14], damages: [6] }))
    .resolveAttack({ actor: enemy, target: connectedTarget });
  assert.equal(connected.attack.hit, true, 'Ablenkungswurf 14 > Schwelle 13 trifft Rhiannon wirklich');
  assert.equal(connected.damage.total, 6);
});

test('Person festhalten legt bei misslungenem Willenskraft-Rettungswurf echte Bewegungslosigkeit an', async () => {
  const rhiannon = await loadRhiannon();
  const actor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-person-festhalten', segmentKind: 'spell' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.resolutionMode, 'saving-throw');
  assert.equal(result.attack.saveSucceeded, false, 'niedriger Wurf gegen Rhiannons Zauber-SG misslingt');
  const applied = result.targetConditionSnapshot.after.find(condition => condition.name === 'Festgehalten');
  assert.ok(applied, 'Festgehalten-Zustand wurde angewendet');
  assert.equal(applied.mechanics.movement, -99);
  assert.equal(applied.durationModel.remainingActorComments, 2);
});

test('Berstende Boe trifft mehrere ausgewaehlte Ziele mit Flaechenschaden und halbem Schaden bei Rettung', async () => {
  const rhiannon = await loadRhiannon();
  const actor = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-berstende-boe', segmentKind: 'spell' });
  const failedSaveTarget = trainingTarget('gust-fail');
  const failResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [3], damages: [14] }))
    .resolveAttack({ actor, target: failedSaveTarget });
  assert.equal(failResult.attack.saveSucceeded, false);
  assert.equal(failResult.damage.total, 14);

  const savedTarget = trainingTarget('gust-save');
  const saveResult = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [19], damages: [14] }))
    .resolveAttack({ actor, target: savedTarget });
  assert.equal(saveResult.attack.saveSucceeded, true);
  assert.equal(saveResult.damage.total, 7, 'halber Schaden bei bestandenem Rettungswurf');
});
