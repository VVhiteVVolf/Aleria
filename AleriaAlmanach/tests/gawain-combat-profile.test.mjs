import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildCombatProfileAiSnapshot } from '../modules/combat/combat-profile-context.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { buildSceneRestParticipant } from '../modules/scene-rest/scene-rest-model.js';

const exportUrl = new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url);

async function loadGawain() {
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
      progression: { level: 4 },
      hitPoints: { current: 60, maximumOverride: 60 },
      armorClass: { override: 10 },
      weapons: [{ id: 'club', name: 'Keule', damageFormula: '1d6', attackAttribute: 'strength', equipped: true }]
    }
  });
}

test('Gawains Waffen und Ruestung sind als dieselben Gegenstaende mit dem Inventar verknuepft', async () => {
  const gawain = await loadGawain();
  const inventoryById = new Map(gawain.inventory.items.map(item => [item.id, item]));
  const sword = gawain.combatProfile.weapons.find(item => item.id === 'gawain-draig-knightly-sword');
  const dagger = gawain.combatProfile.weapons.find(item => item.id === 'gawain-draig-dagger');
  const armor = gawain.combatProfile.armorItems.find(item => item.id === 'gawain-draig-armor');

  assert.equal(inventoryById.get(sword.inventoryItemId).equipmentLink.combatEntryId, sword.id);
  assert.equal(inventoryById.get(dagger.inventoryItemId).equipmentLink.combatEntryId, dagger.id);
  assert.equal(inventoryById.get(armor.inventoryItemId).equipmentLink.combatEntryId, armor.id);
  assert.equal(sword.damageFormula, '1d8');
  assert.equal(sword.versatileDamageFormula, '1d10');
  assert.equal(dagger.damageFormula, '1d4');
  assert.equal(armor.baseArmorClass, 16);
  assert.equal(armor.dexterityUnlockLevel, 6);
  assert.equal(sword.name, 'Drachenzahn · Draig-Ritterschwert');
  assert.equal(armor.name, 'Silberschuppe · Draig-Rüstung');
  assert.equal(gawain.combatProfile.progression.level, 5);
  assert.equal(gawain.combatProfile.attributes.find(attribute => attribute.key === 'strength').score, 15);
  assert.equal(gawain.combatProfile.attributes.find(attribute => attribute.key === 'dexterity').score, 16);
  assert.deepEqual(
    gawain.combatProfile.techniques.map(technique => [technique.name, technique.minimumLevel]),
    [
      ['Biss des Drachen', 2],
      ['Klaue des Drachen', 3],
      ['Tanz der Silbernen Schuppe', 4],
      ['Schweif des Drachen', 4],
      ['Wirbelschritt des Drachen', 5]
    ]
  );
});

test('Wirbelschritt des Drachen kostet Bonusaktion und Besondere Aktion statt der normalen Aktion', async () => {
  const gawain = await loadGawain();
  const bite = resolveCombatProfile(gawain, { actionId: 'technique:gawain-dragon-bite', segmentKind: 'combataction' });
  const whirl = resolveCombatProfile(gawain, { actionId: 'technique:gawain-dragon-whirl', segmentKind: 'combataction' });
  assert.equal(whirl.weapon.damageFormula, '1d10+1d4');
  assert.equal(whirl.attackModifier, bite.attackModifier + 1);
  assert.deepEqual(
    whirl.resourceCosts.map(cost => [cost.resourceId, cost.amount]),
    [['bonus-action', 1], ['special-action', 1]]
  );
});

test('Gawains neue Eigenheiten stehen der Regelauswertung und AleriaGPT strukturiert zur Verfuegung', async () => {
  const gawain = await loadGawain();
  const condition = gawain.combatProfile.conditions.find(item => item.id === 'gawain-strenge-gerueche');
  const scentAbility = gawain.combatProfile.abilities.find(item => item.id === 'gawain-liebt-duefte');
  const socialAbility = gawain.combatProfile.abilities.find(item => item.id === 'gawain-muttersoehnchen');
  assert.deepEqual(condition.triggerRules[0].requiredTargetTags, ['stinkend']);
  assert.equal(condition.triggerRules[0].effects.attackModifier, -2);
  assert.equal(scentAbility.inventoryUseTrigger.restoreResources[0].resourceId, 'special-action');
  assert.ok(socialAbility.triggerRules[0].skillIds.includes('religion'));

  const snapshot = buildCombatProfileAiSnapshot(gawain);
  assert.match(JSON.stringify(snapshot), /gawain-strenge-gerueche|stinkend/i);
  assert.match(JSON.stringify(snapshot), /gawain-liebt-duefte|Liebt D/);
});

test('Gawains Ritterschwert wird im echten Kampfprofil mit waehlbarer Fuehrung aufgeloest', async () => {
  const gawain = await loadGawain();
  const oneHanded = resolveCombatProfile(gawain, {
    actionId: 'weapon:gawain-draig-knightly-sword',
    segmentKind: 'combataction',
    weaponGrip: 'one-handed'
  });
  const twoHanded = resolveCombatProfile(gawain, {
    actionId: 'weapon:gawain-draig-knightly-sword',
    segmentKind: 'combataction',
    weaponGrip: 'two-handed'
  });
  assert.equal(oneHanded.weapon.damageFormula, '1d8');
  assert.equal(twoHanded.weapon.damageFormula, '1d10');
  assert.equal(twoHanded.totalDefense, 16);
});

test('Biss und Silberne Schuppe rechnen Zusatzwuerfel und den Trefferbonus mechanisch ein', async () => {
  const gawain = await loadGawain();
  const bite = resolveCombatProfile(gawain, { actionId: 'technique:gawain-dragon-bite', segmentKind: 'combataction' });
  const scale = resolveCombatProfile(gawain, { actionId: 'technique:gawain-silver-scale-dance', segmentKind: 'combataction' });
  assert.equal(bite.weapon.damageFormula, '1d10+1d4');
  assert.equal(scale.weapon.damageFormula, '1d10+1d6');
  assert.equal(scale.attackModifier, bite.attackModifier + 2);
  assert.equal(scale.resourceCosts.some(cost => cost.resourceId === 'gawain-technique-silver-scale-uses'), true);
  assert.deepEqual(
    scale.resourceCosts.map(cost => [cost.resourceId, cost.amount]),
    [['action', 1], ['gawain-technique-silver-scale-uses', 1]]
  );
});

test('Klaue des Drachen legt bei misslungenem Rettungswurf einen echten temporaeren Angriffsabzug an', async () => {
  const gawain = await loadGawain();
  const actor = resolveCombatProfile(gawain, { actionId: 'technique:gawain-dragon-claw', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15], damages: [8], saves: [2] }))
    .resolveAttack({ actor, target });
  assert.equal(result.secondarySaves.length, 1);
  assert.equal(result.secondarySaves[0].dc, 13);
  assert.equal(result.secondarySaves[0].succeeded, false);
  assert.equal(result.targetConditionSnapshot.applied.mechanics.attack, -2);

  const firstState = deriveCombatStateFromComments([{ id: 'claw', commentSegments: [{ combatResolution: result }] }]);
  const affectedTarget = overlayCombatHitPointState(target, firstState.get(target.characterId));
  assert.equal(affectedTarget.attackModifier, target.attackModifier - 2);

  const afterTargetActs = deriveCombatStateFromComments([
    { id: 'claw', commentSegments: [{ combatResolution: result }] },
    { id: 'target-turn', commentSegments: [{ combatResolution: {
      actorId: target.characterId,
      targetId: actor.characterId,
      targetSnapshot: { hitPointsAfter: actor.currentHitPoints, maximumHitPoints: actor.maximumHitPoints, temporaryHitPointsAfter: 0 }
    } }] }
  ]);
  assert.equal(afterTargetActs.get(target.characterId).temporaryConditions.length, 0);
});

test('Schweif des Drachen wuerfelt den Folgeangriff getrennt und fuehrt den Schaden zusammen', async () => {
  const gawain = await loadGawain();
  const actor = resolveCombatProfile(gawain, { actionId: 'technique:gawain-dragon-tail', segmentKind: 'combataction' });
  const target = trainingTarget();
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15, 13], damages: [9, 6] }))
    .resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks.length, 1);
  assert.equal(result.followUpAttacks[0].attack.hit, true);
  assert.equal(result.followUpAttacks[0].triggerFurtherEffects, false);
  assert.equal(result.damage.primaryTotal, 9);
  assert.equal(result.damage.total, 15);
  assert.equal(result.targetSnapshot.hitPointsAfter, 45);
});

test('Klauen-Abzug bleibt beim Anzeigen jedes Abschnitts des betroffenen Beitrags aktiv', async () => {
  const actor = resolveCombatProfile(await loadGawain(), { actionId: 'technique:gawain-dragon-claw', segmentKind: 'combataction' });
  const target = trainingTarget();
  const resolution = await new CombatResolutionService(new TechniqueDiceAdapter({ saves: [2] }))
    .resolveAttack({ actor, target });
  const comments = [
    { id: 'claw', commentSegments: [{ combatResolution: resolution }] },
    { id: 'reply', commentSegments: [
      { characterId: target.characterId, kind: 'speech', text: 'Meine Deckung hält.' },
      { characterId: target.characterId, kind: 'combataction', text: 'Ich setze nach.' }
    ] }
  ];
  for (const segmentIndex of [0, 1]) {
    const states = deriveCombatStateFromComments(comments, { commentId: 'reply', segmentIndex });
    const profile = overlayCombatHitPointState(target, states.get(target.characterId));
    assert.equal(profile.attackModifier, target.attackModifier - 2);
  }
  assert.equal(deriveCombatStateFromComments(comments).get(target.characterId).temporaryConditions.length, 0);
});

test('Schweif des Drachen weist nachträgliche Trefferboni auch im Würfelbeleg aus', async () => {
  const actor = resolveCombatProfile(await loadGawain(), { actionId: 'technique:gawain-dragon-tail', segmentKind: 'combataction' });
  const target = trainingTarget();
  actor.abilities.push({ id: 'audit-aim', name: 'Korrigierte Linie', active: true, triggerRules: [{
    id: 'audit-post-roll', enabled: true, phase: 'post-roll', recipient: 'actor', sourceRelation: 'self',
    activation: 'passive', frequency: 'always', effects: { attackModifier: 2 }
  }] });
  const result = await new CombatResolutionService(new TechniqueDiceAdapter({ attacks: [15, 13] })).resolveAttack({ actor, target });
  const followUp = result.followUpAttacks[0];
  assert.equal(followUp.attack.modifier, actor.attackModifier + 2);
  assert.equal(followUp.attack.total, 13 + actor.attackModifier + 2);
});

test('Schweif-Folgeangriff prüft verbleibende Abwehrladungen nach dem ersten Treffer', async () => {
  const actor = resolveCombatProfile(await loadGawain(), { actionId: 'technique:gawain-dragon-tail', segmentKind: 'combataction' });
  const target = { ...trainingTarget(), temporaryConditions: [{
    id: 'mirror', name: 'Spiegelbild', active: true,
    ward: { enabled: true, charges: 1, deflectChance: 50, breaksOnCriticalHit: false }
  }] };
  const dice = new TechniqueDiceAdapter({ attacks: [15, 15], damages: [8, 6] });
  const wards = [20, 1];
  dice.rollWardDeflection = async () => ({ natural: wards.shift(), id: `ward-${wards.length}` });
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target });
  assert.equal(result.attack.hit, true);
  assert.equal(result.followUpAttacks[0].attack.hit, false);
  assert.equal(result.followUpAttacks[0].wardResolution.chargesAfter, 0);
  assert.equal(result.targetSnapshot.hitPointsAfter, 52);
  assert.equal(result.targetConditionSnapshot.after.length, 0);
  assert.equal(wards.length, 0);
});

test('Schweif-Folgeangriff übernimmt den Schadensabzug einer gegnerischen Aura', async () => {
  const actor = resolveCombatProfile(await loadGawain(), { actionId: 'technique:gawain-dragon-tail', segmentKind: 'combataction' });
  const target = trainingTarget();
  target.aura = { enabled: true, latentPresence: {
    enabled: true, active: true, target: 'Gegner', radius: '3 Meter', enemyMechanics: { damage: -2 }
  } };
  const dice = new TechniqueDiceAdapter();
  const bonuses = [];
  const rollDamage = dice.rollDamage.bind(dice);
  dice.rollDamage = request => { bonuses.push(request.bonus); return rollDamage(request); };
  await new CombatResolutionService(dice).resolveAttack({ actor, target }, { relationship: 'enemy', distanceMeters: 1 });
  assert.equal(bonuses.length, 2);
  assert.equal(bonuses[0], actor.damageModifier - 2);
  assert.equal(bonuses[1], actor.damageModifier + actor.selectedAction.followUpAttack.damageBonus - 2);
});

test('Drachentanz-Nutzungen folgen kurzer Rast und echtem Tageswechsel', async () => {
  const gawain = await loadGawain();
  const resolved = resolveCombatProfile(gawain);
  const depleted = {
    ...resolved,
    resources: resolved.resources.map(resource => ({
      ...resource,
      current: resource.id.startsWith('gawain-technique-') ? 0 : resource.current
    }))
  };
  const shortRest = buildSceneRestParticipant(depleted, 'short', { actorId: gawain.id });
  const shortResources = new Map(shortRest.after.resources.map(resource => [resource.id, resource]));
  assert.equal(shortResources.get('gawain-technique-silver-scale-uses').current, 1);
  assert.equal(shortResources.get('gawain-technique-tail-uses').current, 1);
  assert.equal(shortResources.get('gawain-technique-claw-uses').current, 0);

  const nextDay = buildSceneRestParticipant(depleted, 'long', {
    actorId: gawain.id,
    dayChanged: true,
    recoveryDayKey: 'scene:test:day-2'
  });
  const dayResources = new Map(nextDay.after.resources.map(resource => [resource.id, resource]));
  assert.equal(dayResources.get('gawain-technique-claw-uses').current, 2);
});
