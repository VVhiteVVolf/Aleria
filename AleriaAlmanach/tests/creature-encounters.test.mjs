import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';
import { BESTIARY_ENCOUNTER_CARDS } from '../modules/creatures/catalog/bestiary-encounter-cards.js';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { createCreatureDuplicate, sanitizeCreature } from '../modules/creatures/creature-model.js';
import { CREATURE_TURN_END_ID, getEscapeActionId } from '../modules/combat/combat-creature-actions.js';
import { withCreatureContribution } from '../modules/combat/combat-creature-contribution.js';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { resetCommentScopedResources } from '../modules/combat/combat-action-economy.js';
import { applyTypedCombatDamage } from '../modules/combat/combat-effect-model.js';
import { canUseCombatReaction } from '../modules/combat/combat-action-permission.js';
import { buildDamageRollPlan } from '../modules/combat/rules/combat-mvp-rules.js';

let rollId = 0;
class FixedDice {
  constructor({ attack = 17, save = 5, damage = 4 } = {}) {
    this.attack = attack;
    this.save = save;
    this.damage = damage;
  }
  d20(natural, { modifier = 0, rollMode = 'normal' }) {
    const dice = rollMode === 'normal' ? [natural] : [natural, rollMode === 'disadvantage' ? 20 : 2];
    return { id: `d20-${++rollId}`, natural, total: natural + modifier, dice, keptDice: [natural] };
  }
  async rollAttack(options) { return this.d20(this.attack, options); }
  async rollSavingThrow(options) { return this.d20(this.save, options); }
  async rollDamage({ damageFormula, bonus = 0, critical = false }) {
    const plan = buildDamageRollPlan(damageFormula, bonus, critical);
    const dice = plan.terms.flatMap(term => Array.from({ length: term.diceCount }, () => Math.min(this.damage, term.sides)));
    return { id: `damage-${++rollId}`, keptDice: dice, notation: plan.notation, modifier: plan.modifier,
      total: Math.max(0, dice.reduce((total, value) => total + value, plan.modifier)) };
  }
}

const templates = new Map(getBuiltinCreatureTemplates().map(creature => [creature.id, creature]));
const creature = id => structuredClone(templates.get(`catalog-${id}`));
const actor = (record, actionId = '', state = undefined) => overlayCombatHitPointState(resolveCombatProfile(record, { actionId, includeAiSnapshot: false }), state);
const fixture = { id: 'held-target', name: 'Prüffigur', combatProfile: {
  progression: { level: 5 }, hitPoints: { current: 60, maximumOverride: 60 }, armorClass: { override: 12 },
  attributes: [{ key: 'strength', score: 14 }, { key: 'dexterity', score: 12 }],
  weapons: [{ id: 'practice-sword', name: 'Übungsschwert', weaponType: 'sword', damageFormula: '1d6', damageType: 'Hieb', equipped: true }]
} };
const run = (source, target, dice = {}, comment = 'probe') => new CombatResolutionService(new FixedDice(dice)).resolveAttack({ actor: source, target },
  { relationship: source.characterId === target.characterId ? 'self' : 'enemy', rulePeriods: { comment, scene: 'scene', day: 'day' }, distanceMeters: 1 });
const holdId = 'ability:versunkener-tiefengriff';
const biteId = 'ability:versunkener-biss';
const commit = (id, resolution) => ({ id, characterId: resolution.actorId, commentSegments: [{ combatResolution: resolution }] });
const fresh = state => ({ ...state, resources: resetCommentScopedResources(state?.resources) });

test('15 Karten und Almanach-Vorlagen benutzen dieselben Werte und vererben beide Bilder', async () => {
  assert.equal(BESTIARY_ENCOUNTER_CARDS.length, 15);
  assert.equal(new Set(BESTIARY_ENCOUNTER_CARDS.map(card => card.id)).size, 15);
  for (const card of BESTIARY_ENCOUNTER_CARDS) {
    const template = templates.get(card.id);
    assert.deepEqual(template, sanitizeCreature(card));
    const copy = createCreatureDuplicate(template, []);
    assert.equal(copy.level, card.level);
    assert.equal(copy.templateId, template.id);
    assert.equal(copy.avatars[0].img, card.scene);
    assert.equal(copy.portrait, card.portrait);
    assert.equal(copy.bestiaryReference?.name, card.species);
    for (const path of [card.scene, card.portrait, copy.bestiaryReference.url]) await access(new URL(`../..${path}`, import.meta.url));
  }
});

test('Versunkene besitzen die drei SG und Feuer-/Blitzantworten einschließlich der deutschen und englischen Schreibweise', () => {
  const ids = ['versunkener-verkuemmert', 'versunkener-fahlhaeutig', 'versunkener-bullig'];
  assert.deepEqual(ids.map(id => actor(creature(id), holdId).actionSpellSaveDc), [10, 13, 16]);
  const profile = actor(creature(ids[0]));
  for (const type of ['Feuer', 'fire', 'Blitz', 'lightning']) {
    const damage = applyTypedCombatDamage({ current: 30, maximum: 30 }, 9, profile, { damageType: type });
    assert.equal(damage.incoming, ['Feuer', 'fire'].includes(type) ? 4 : 18);
  }
});

test('Eine erfolgreiche GES-Rettung verhindert den Tiefengriff und verbraucht dessen drei Kosten', async () => {
  const drowned = creature('versunkener-fahlhaeutig');
  const result = await run(actor(drowned, holdId), actor(fixture), { attack: 19 });
  assert.equal(result.attack.saveSucceeded, true);
  assert.equal(result.actorConcentrationSnapshot, null);
  assert.deepEqual(result.resourceCosts.map(cost => cost.resourceId), ['special-action', 'action', 'reaction']);
});

async function capturedActors(comment = 'griff') {
  const drowned = creature('versunkener-fahlhaeutig');
  const result = await run(actor(drowned, holdId), actor(fixture), { attack: 3 }, comment);
  const history = [commit(comment, result)];
  const states = deriveCombatStateFromComments(history);
  return { drowned, result, states, history };
}

test('Der erfolgreiche Griff sperrt Handlungen, erlaubt Biss mit Vorteil und endet bei Heilung oder verlorener Haltung', async () => {
  const { drowned, states, history } = await capturedActors();
  const held = actor(fixture, '', states.get(fixture.id));
  assert.equal(validateCombatActorProfile(held).ready, false);
  assert.equal(canUseCombatReaction(held), false);
  assert.equal(held.temporaryConditions[0].mechanics.attackRollMode, 'disadvantage');
  const attacker = actor(drowned, biteId, fresh(states.get(drowned.id)));
  await assert.rejects(run(attacker, actor({ ...fixture, id: 'falsches-ziel' })), /selbst festgehaltene/);
  const bite = await run(attacker, held);
  assert.equal(bite.attack.rollMode, 'advantage');
  assert.deepEqual(bite.resourceCosts.map(cost => cost.resourceId), ['action', 'reaction', 'bonus-action']);
  const afterBite = deriveCombatStateFromComments([...history, commit('biss', bite)]);
  assert(afterBite.get(fixture.id).temporaryConditions.some(entry => entry.name === 'Blutend'));
  const healer = structuredClone({ ...fixture, id: 'healer' });
  healer.combatProfile.abilities = [{ id: 'heal', name: 'Wunden versorgen', active: true, combatUsable: true, resolutionType: 'automatic',
    effects: [{ id: 'heal', type: 'healing', amount: 9, on: 'always', target: 'target' }] }];
  const heal = await run(actor(healer, 'ability:heal'), actor(fixture, '', afterBite.get(fixture.id)));
  assert.equal(heal.targetConditionSnapshot.after.some(entry => entry.name === 'Blutend'), false);
  const ally = { ...fixture, id: 'angehoeriger' };
  const blow = await run(actor(ally), actor(drowned, '', afterBite.get(drowned.id)), { save: 2 });
  assert.equal(blow.secondarySaves.find(save => save.type === 'concentration')?.succeeded, false);
  const released = deriveCombatStateFromComments([...history, commit('biss', bite), commit('rettung', blow)]);
  assert(!released.get(fixture.id).temporaryConditions.some(entry => entry.restraint));
});

test('Eigene Beiträge buchen einmal GES mit Nachteil und spätere Befreiung auf Athletik normal', async () => {
  const { states, history } = await capturedActors();
  const profileFor = id => id === fixture.id ? actor(fixture, '', states.get(fixture.id)) : null;
  const withEscape = withCreatureContribution([{ characterId: fixture.id, text: 'Ich versuche es.' }], fixture.id, profileFor);
  assert.equal(withEscape[1].combatActionId, getEscapeActionId('dexterity'));
  const subject = actor(fixture, withEscape[1].combatActionId, fresh(states.get(fixture.id)));
  const first = await run(subject, subject, { save: 3 }, 'first');
  assert.equal(first.secondarySaves[0].diceResults.length, 2);
  assert.equal(first.secondarySaves[0].succeeded, false);
  assert(first.actorConditionSnapshot.after[0].restraint.attempted);
  const stillHeld = deriveCombatStateFromComments([...history, commit('first', first)]).get(fixture.id);
  const duplicate = actor(fixture, getEscapeActionId('dexterity'), fresh(stillHeld));
  await assert.rejects(run(duplicate, duplicate, { save: 18 }, 'first'), /bereits/);
  const retry = actor(fixture, getEscapeActionId('athletics'), fresh(stillHeld));
  const freed = await run(retry, retry, { save: 14 }, 'second');
  assert.equal(freed.secondarySaves[0].diceResults.length, 1);
  assert.equal(freed.secondarySaves[0].modifier, 2);
  assert.equal(freed.secondarySaves[0].succeeded, true);
  assert.equal(freed.actorConditionSnapshot.after.length, 0);
});

test('Bei einem gemeinsamen Beitrag kann das neue Opfer sich ebenfalls zu befreien versuchen', () => {
  const drowned = creature('versunkener-fahlhaeutig');
  const profiles = new Map([[drowned.id, actor(drowned)], [fixture.id, actor(fixture)]]);
  const capture = { actorId: drowned.id, combatActionId: holdId, combatTargetId: fixture.id };
  const replies = [{ actorId: fixture.id, text: 'Ich ziehe mich zurück.' }, capture];
  const planned = withCreatureContribution(replies, drowned.id, id => profiles.get(id));
  assert.equal(planned.at(-1).actorId, fixture.id);
  assert.equal(planned.at(-1).combatActionId, getEscapeActionId('dexterity'));
  assert.equal(planned.at(-1).creatureAutomatic, true);
  assert.deepEqual(withCreatureContribution([capture], drowned.id, id => profiles.get(id)), [capture]);
});

test('Trollblut kommt zuletzt, Feuer sperrt es und offenes Brennen würfelt je 1W4', async () => {
  const troll = creature('landtroll-jung');
  const base = actor(troll);
  const start = { current: 65, maximum: base.maximumHitPoints, temporary: 0, resources: base.resources };
  const blow = await run(actor(troll, '', start), actor(fixture));
  assert.equal(blow.turnStart, undefined);
  const end = actor(troll, CREATURE_TURN_END_ID, start);
  const healed = await run(end, end);
  assert.equal(healed.turnEnd.suppressed, false);
  assert.equal(healed.targetSnapshot.hitPointsAfter, 77);
  const exposed = applyTypedCombatDamage(start, 6, base, { damageType: 'Feuer' });
  assert.equal(exposed.incoming, 12);
  const burnt = actor(troll, CREATURE_TURN_END_ID, { ...start, ...exposed.after, temporaryConditions: exposed.conditions });
  const suppressed = await run(burnt, burnt);
  assert.equal(suppressed.turnEnd.suppressed, true);
  assert.equal(suppressed.turnEnd.burning, false);
  const burning = { ...start, temporaryConditions: [{ id: 'burning', name: 'Brennend', presetId: 'burning' }] };
  const scorched = actor(troll, CREATURE_TURN_END_ID, burning);
  const result = await run(scorched, scorched);
  assert.equal(result.targetSnapshot.hitPointsAfter, 61);
  const incoming = await run(actor(fixture), actor(troll, '', burning));
  assert.equal(incoming.effectResults.find(entry => entry.effect.id === 'creature-burning-hit-1')?.applied.incoming, 4);
  assert.equal(withCreatureContribution([{ characterId: troll.id, text: 'Der Troll schwankt.' }], troll.id, () => base).at(-1).combatActionId, CREATURE_TURN_END_ID);
});

test('Mulinar reagiert auf Tenebrium und Urgr sperrt nur Reaktionen', async () => {
  const mulinar = creature('mulinar-entfesselt');
  const raw = actor(mulinar);
  const exposed = applyTypedCombatDamage({ current: raw.currentHitPoints, maximum: raw.maximumHitPoints }, 7, raw, { damageType: 'Tenebrium' });
  assert.equal(exposed.incoming, 14);
  const state = { ...exposed.after, temporaryConditions: exposed.conditions };
  const magic = actor(mulinar, 'ability:mulinar-schallstoss', state);
  assert.equal(magic.movement, raw.movement - 3);
  assert.equal(validateCombatActorProfile(magic).ready, false);
  assert.equal(validateCombatActorProfile(actor(mulinar, '', state)).ready, true);
  const urgr = creature('madruach-urgr');
  const howl = await run(actor(urgr, 'ability:urgr-bruell'), actor(fixture), { attack: 3 });
  const benumbed = deriveCombatStateFromComments([commit('bruell', howl)]).get(fixture.id);
  const person = actor(fixture, '', benumbed);
  assert.equal(canUseCombatReaction(person), false);
  assert.equal(validateCombatActorProfile(person).ready, true);
});

test('Hornlinge erhalten Jagdinstinkt gegen Tiere und Clanjagd durch eine andere Instanz', async () => {
  const hunter = creature('hornling-jaeger');
  const target = actor(creature('ulfr-warg'));
  const marking = await run(actor(hunter, 'ability:hornling-faehrte'), target);
  const marked = overlayCombatHitPointState(target, deriveCombatStateFromComments([commit('faehrte', marking)]).get(target.characterId));
  const alone = await run(actor(hunter), marked);
  assert(alone.ruleApplications.some(rule => rule.ruleId === 'hornling-tierjaeger'));
  assert(!alone.ruleApplications.some(rule => rule.ruleId === 'hornling-clanjagd'));
  const pair = await run(actor({ ...hunter, id: 'hornling-zweite-instanz' }), marked);
  assert(pair.ruleApplications.some(rule => rule.ruleId === 'hornling-clanjagd' && rule.effects.damageModifier === 2));
});
