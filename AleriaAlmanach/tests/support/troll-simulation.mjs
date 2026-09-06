import { readFile } from 'node:fs/promises';
import { resolveCombatProfile, validateCombatActorProfile } from '../../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../../modules/combat/combat-resolution-service.js';
import { overlayCombatHitPointState, getResolutionHitPointState } from '../../modules/combat/combat-state-model.js';
import { resetCommentScopedResources } from '../../modules/combat/combat-action-economy.js';
import { advanceConditionForComment } from '../../modules/combat/combat-condition-duration.js';
import { applyCombatAbilityUse } from '../../modules/combat/combat-ability-uses.js';
import { parseDamageFormula } from '../../modules/combat/rules/combat-mvp-rules.js';
import { sanitizeCreature } from '../../modules/creatures/creature-model.js';
import { TROLL_CREATURE_SOURCE } from '../../modules/creatures/catalog/troll.js';
import { SeededCombatDice } from './combat-seeded-dice.mjs';
import { applyManualCharacterLevel } from '../../modules/combat/combat-level-up-model.js';

const slugs = ['fenrir-varulv', 'freya-skald', 'guinevere-neidr', 'gawain-draig'];
const records = await Promise.all(slugs.map(async slug => JSON.parse(await readFile(new URL(`../../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character));
const gildas = JSON.parse(await readFile(new URL('../../../Charakter%20Archiv%20Exporte/gildas-gafyr.json', import.meta.url), 'utf8')).character;
function average(formula) {
  if (!formula) return 0;
  const parsed = parseDamageFormula(formula);
  return (parsed.terms || [parsed]).reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, parsed.fixedModifier);
}

export function createTrollCombatants({ partySize = 4, fire = false, trollHp, trollDefense, trainedKnights = false } = {}) {
  const heroes = structuredClone(trainedKnights ? [records[3], gildas]
    : records.filter((record, index) => partySize === 4 || (partySize === 2 ? [0, 3].includes(index) : index === 3)));
  if (trainedKnights) for (const hero of heroes) hero.combatProfile = applyManualCharacterLevel(hero.combatProfile, 7).profile;
  if (fire) {
    // Deliberately test-only equipment. Nothing is written to a character export.
    const archer = heroes.find(record => /Guinevere/.test(record.name));
    const bow = archer?.combatProfile.weapons.find(weapon => weapon.equipped);
    if (bow) { bow.damageType = 'Feuer'; bow.name += ' (Test: Brandpfeile)'; }
  }
  const source = structuredClone(TROLL_CREATURE_SOURCE);
  if (trollHp) source.combatProfile.hitPoints.current = source.combatProfile.hitPoints.maximumOverride = trollHp;
  if (trollDefense) source.combatProfile.armorClass.override = trollDefense;
  return [...heroes, sanitizeCreature(source)];
}

export function prepareTrollSimulation(options = {}, sourceRecords = null) {
  const actors = (sourceRecords || createTrollCombatants(options)).map(record => {
    const base = resolveCombatProfile(record);
    const actions = new Map(base.actions.filter(action => action.compatible !== false && action.kind !== 'equipment-switch')
      .map(action => [action.id, resolveCombatProfile(record, { actionId: action.id })]));
    let fireBow = null;
    if (options.limitedFire && /Guinevere/.test(record.name)) {
      const fireRecord = structuredClone(record);
      const bow = fireRecord.combatProfile.weapons.find(weapon => weapon.id === 'guinevere-longbow');
      bow.ammunition = { ...bow.ammunition, inventoryItemId: 'guinevere-arrows-fire' };
      bow.effects = [{ type: 'damage', target: 'target', on: 'hit', formula: bow.damageFormula, damageType: bow.damageType },
        { type: 'damage', target: 'target', on: 'hit', formula: '1d4', damageType: 'Feuer' }];
      fireBow = resolveCombatProfile(fireRecord, { actionId: `weapon:${bow.id}` });
    }
    return { record, base, actions, fireBow, troll: record.id === 'catalog-troll' || record.sourceCreatureId === 'catalog-troll' };
  });
  return { actors, options };
}

function actionProfile(actor, actionId, state) {
  const fireArrows = state.inventory?.items?.find(item => item.id === 'guinevere-arrows-fire');
  const base = actor.fireBow?.profileActionId === actionId && Number(fireArrows?.quantity) > 0
    ? actor.fireBow : actor.actions.get(actionId);
  return overlayCombatHitPointState(base, state);
}

export async function simulateTrollFight(prepared, seed = 1, { onPost } = {}) {
  const dice = new SeededCombatDice(seed);
  const engine = new CombatResolutionService(dice);
  const state = new Map(prepared.actors.map(actor => [actor.record.id, {
    current: actor.base.maximumHitPoints, maximum: actor.base.maximumHitPoints, temporary: 0,
    resources: structuredClone(actor.base.resources), abilities: structuredClone(actor.base.abilities),
    inventory: structuredClone(actor.base.inventory || { items: [] }), temporaryConditions: []
  }]));
  const initiative = prepared.actors.map(actor => ({ ...actor, initiative: dice.die(20) + actor.base.combat.initiativeBonus + Math.floor((actor.base.attributes.find(a => a.key === 'dexterity').score - 10) / 2) }))
    .sort((a, b) => b.initiative - a.initiative);
  const counters = { regenerated: 0, suppressed: 0, stuns: 0, misses: 0, criticals: 0, sweeps: 0 };
  const alive = actor => state.get(actor.record.id).current > 0;
  let round = 0;
  for (round = 1; round <= 30; round++) {
    for (const actor of initiative.filter(alive)) {
      if (!alive(actor)) continue;
      const actorId = actor.record.id;
      const current = state.get(actorId);
      current.resources = resetCommentScopedResources(current.resources);
      const eligible = new Set(current.temporaryConditions.map(condition => condition.id));
      const segments = [];
      let actionCount = 0;
      for (;;) {
        const enemies = prepared.actors.filter(candidate => candidate.troll !== actor.troll && alive(candidate));
        if (!enemies.length) break;
        const profiles = [...actor.actions.keys()].map(actionId => actionProfile(actor, actionId, state.get(actorId)));
        const available = profiles.filter(profile => profile.profileActionId !== 'combat:wait'
          && validateCombatActorProfile(profile).ready
          && profile.resourceCosts.every(cost => (profile.resources.find(resource => resource.id === cost.resourceId)?.current || 0) >= cost.amount)
          && applyCombatAbilityUse(profile.abilities, profile.profileActionId).sufficient);
        let selected;
        if (/Fenrir/.test(actor.record.name) && round === 1 && actionCount === 0) selected = available.find(p => p.profileActionId === 'ability:fenrir-berserkergang');
        if (actor.troll && enemies.length > 1 && round % 2 === 1) selected = available.find(p => p.profileActionId === 'technique:troll-sweeping-club');
        if (actor.troll && !selected && (round % 2 === 1 || !available.some(p => p.profileActionId === 'technique:troll-crushing-grip'))
          && !current.temporaryConditions.some(condition => condition.sourceConditionId === 'troll-hide-guard')) {
          selected = available.find(p => p.profileActionId === 'ability:troll-hide-guard');
        }
        if (/Freya/.test(actor.record.name) && round % 2 === 1) selected = available.find(p => p.profileActionId.includes('spottvers'));
        selected ||= available.filter(p => p.weapon?.damageFormula && p.actionResolutionMode !== 'automatic'
          && !p.profileActionId.includes('sweeping-club') && !p.profileActionId.includes('arkaner-schrei'))
          .sort((a, b) => average(b.weapon.damageFormula) + b.damageModifier - average(a.weapon.damageFormula) - a.damageModifier)[0];
        if (!selected && actionCount === 0) selected = profiles.find(p => p.profileActionId === 'combat:wait');
        if (!selected) break;
        if (++actionCount > 12) throw new Error('Simulation: unexpected free-action loop');
        let targets = enemies;
        if (actor.troll) {
          // Front line blocks the troll; archers/support are not silently added to an AoE.
          const front = enemies.filter(enemy => /Fenrir|Gawain|Gildas/.test(enemy.record.name));
          targets = front.length ? front : enemies;
          if (!selected.profileActionId.includes('sweeping-club')) targets = [targets[dice.die(targets.length) - 1]];
          else counters.sweeps++;
        }
        if (['combat:wait', 'ability:fenrir-berserkergang', 'ability:troll-hide-guard'].includes(selected.profileActionId)) targets = [actor];
        targets = targets.slice(0, selected.selectedAction.maximumTargets || 1);
        let startedAction;
        const resolutions = [];
        for (const [index, recipient] of targets.entries()) {
          const actorProfile = actionProfile(actor, selected.profileActionId, state.get(actorId));
          const targetProfile = overlayCombatHitPointState(recipient.base, state.get(recipient.record.id));
          const result = await engine.resolveAttack({ actor: actorProfile, target: targetProfile }, {
            relationship: recipient === actor ? 'self' : 'enemy', skipResourceCosts: index > 0,
            skipSelfEffects: index > 0, skipAmmunition: index > 0, startedAction,
            rulePeriods: { comment: `${round}:${actorId}`, scene: 'troll-test', day: 'test-day' }
          });
          startedAction ||= result;
          resolutions.push(result);
          const targetState = state.get(recipient.record.id);
          if (result.targetSnapshot) Object.assign(targetState, getResolutionHitPointState(result));
          if (result.targetConditionSnapshot) targetState.temporaryConditions = result.targetConditionSnapshot.after;
          if (result.targetResourceSnapshot) targetState.resources = result.targetResourceSnapshot.after;
          const actorState = state.get(actorId);
          if (result.actorHitPointSnapshot) Object.assign(actorState, result.actorHitPointSnapshot.after);
          if (result.actorConditionSnapshot) actorState.temporaryConditions = result.actorConditionSnapshot.after;
          if (result.actorResourceSnapshot) actorState.resources = result.actorResourceSnapshot.after;
          if (result.actorInventorySnapshot) actorState.inventory = result.actorInventorySnapshot.after;
          if (index === 0) actorState.abilities = applyCombatAbilityUse(actorState.abilities, selected.profileActionId).abilities;
          counters.regenerated += result.turnStart?.restored || 0;
          counters.suppressed += result.turnStart?.suppressed ? 1 : 0;
          counters.stuns += result.targetConditionSnapshot?.applied?.mechanics?.blocksActions ? 1 : 0;
          counters.misses += result.attack?.hit === false ? 1 : 0;
          counters.criticals += result.attack?.criticalSuccess ? 1 : 0;
        }
        const magic = ['spell', 'prayer', 'song'].includes(selected.profileActionKind);
        const kind = selected.profileActionKind === 'song' ? 'song' : 'speech';
        segments.push({ kind, commentKind: kind, mechanicMode: magic ? 'magic' : 'combat',
          actorId, characterId: actorId, charName: actor.record.name, sceneActorSourceId: actor.record.sourceCreatureId || '',
          text: `${actor.record.name}: ${selected.selectedAction.name}.`,
          combatAction: { profileActionId: selected.profileActionId, rollMode: 'normal', paymentMode: 'standard' },
          combatResolution: resolutions[0], combatResolutions: resolutions });
        if (selected.profileActionId === 'combat:wait' || !alive(actor)) break;
      }
      const final = state.get(actorId);
      final.temporaryConditions = final.temporaryConditions.map(condition => eligible.has(condition.id)
        ? advanceConditionForComment(condition, actorId, new Set([actorId])) : { condition, expired: false })
        .filter(result => !result.expired).map(result => result.condition);
      if (onPost && segments.length) await onPost({ actor: actor.record, round, segments, state });
      if (!prepared.actors.some(candidate => candidate.troll && alive(candidate)) || !prepared.actors.some(candidate => !candidate.troll && alive(candidate))) break;
    }
    if (!prepared.actors.some(candidate => candidate.troll && alive(candidate)) || !prepared.actors.some(candidate => !candidate.troll && alive(candidate))) break;
  }
  return { seed, rounds: Math.min(round, 30), winner: !prepared.actors.some(actor => actor.troll && alive(actor)) ? 'party'
    : !prepared.actors.some(actor => !actor.troll && alive(actor)) ? 'troll' : 'draw',
    remaining: Object.fromEntries(prepared.actors.map(actor => [actor.record.name, state.get(actor.record.id).current])),
    ammunition: Object.fromEntries(prepared.actors.filter(actor => /Guinevere/.test(actor.record.name)).flatMap(actor =>
      ['guinevere-arrows-standard', 'guinevere-arrows-fire'].map(id => [id, Number(state.get(actor.record.id).inventory.items?.find(item => item.id === id)?.quantity || 0)]))), ...counters };
}

export async function runTrollSeries(options, count = 20, seedStart = 81000) {
  const prepared = prepareTrollSimulation(options);
  const results = [];
  for (let index = 0; index < count; index++) results.push(await simulateTrollFight(prepared, seedStart + index * 7919));
  return { options, count, wins: results.filter(result => result.winner === 'party').length,
    losses: results.filter(result => result.winner === 'troll').length,
    draws: results.filter(result => result.winner === 'draw').length,
    shortest: Math.min(...results.map(result => result.rounds)), longest: Math.max(...results.map(result => result.rounds)),
    meanRounds: results.reduce((sum, result) => sum + result.rounds, 0) / count, results };
}
