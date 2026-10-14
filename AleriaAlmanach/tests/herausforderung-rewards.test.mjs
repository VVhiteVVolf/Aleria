import assert from 'node:assert/strict';
import test from 'node:test';
import { actors } from './support/herausforderung-scenarios.mjs';
import { applyHerausforderungBenefits, normalizeHerausforderungBenefits, validateHerausforderungBenefits, formatHerausforderungRewardReceipt } from '../modules/herausforderung/herausforderung-rewards.js';
import { normalizeHerausforderungEvent, collectHerausforderungApproaches } from '../modules/herausforderung/herausforderung-model.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { moneyState, moneyTotal } from '../modules/item-register/item-register-money.js';
import { inventoryCardModel } from '../modules/character-inventory/character-inventory-card-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { assertHerausforderungRewardAuthority, prepareHerausforderungRewards } from '../../firebase/functions/src/mechanics/herausforderung-rewards.js';

const weapon = STANDARD_ITEMS.find(item => item.category === 'waffen' && item.combatDefinition);
const condition = (kind = 'buff') => ({ effectId: 'effect-1', presetId: kind === 'buff' ? 'blessed' : 'bane', name: kind === 'buff' ? 'Torermut' : 'Verunsichert', kind, durationKind: 'actor-comments', durationAmount: 2, mechanics: { skill: kind === 'buff' ? 2 : -2 } });

for (const actor of actors) test(`${actor.name}: register reward preserves existing inventory, wallet, HP and equipment`, () => {
  const character = structuredClone(actor);
  character.inventory.moneyState = moneyState(1234.56);
  const original = structuredClone(character);
  const reward = applyHerausforderungBenefits({ character, profile: resolveCombatProfile(character), benefits: {
    copper: 2.5, items: [{ template: weapon.id, product: weapon, quantity: 1 }], effects: [condition()] },
    identity: 'unique-claim', challengeId: 'herausforderung:x:a', tier: 'erfolg', now: '2026-10-14T00:00:00Z' });
  assert.equal(moneyTotal(reward.inventory.moneyState), 1237.06);
  assert.deepEqual(reward.inventory.items.slice(0, -1), original.inventory.items);
  const item = reward.inventory.items.at(-1);
  assert.equal(item.ownerCharacterId, actor.id);
  assert.equal(item.image, weapon.image);
  assert.deepEqual(item.valuation, weapon.priceRange);
  assert.equal(item.equipped, false);
  assert.equal(inventoryCardModel(item).kind, 'weapon');
  assert.ok(reward.combatProfile.weapons.some(entry => entry.inventoryItemId === item.id));
  assert.deepEqual(reward.combatProfile.resources, original.combatProfile.resources);
  assert.deepEqual(reward.combatProfile.hitPoints, original.combatProfile.hitPoints);
  assert.deepEqual(character, original);
  assert.throws(() => applyHerausforderungBenefits({ character: { ...character, inventory: reward.inventory }, profile: resolveCombatProfile(character), benefits: { items: [{ template: weapon.id, product: weapon, quantity: 1 }] }, identity: 'unique-claim', now: 'now' }), /bereits im Inventar/);
});

test('reward preparation replaces untrusted product snapshots and enforces narrator authority', async () => {
  const event = normalizeHerausforderungEvent({ publicDescription: 'Situation', approaches: [{ preferredSkills: ['insight'], insight: 'Lösung', rewards: { items: [{ template: weapon.id, quantity: 1, product: { id: weapon.id, title: 'Gefälscht' } }] } }] });
  assert.throws(() => assertHerausforderungRewardAuthority(event, { token: { aleriaRole: 'player' } }), /Spielleitung/);
  assert.doesNotThrow(() => assertHerausforderungRewardAuthority(event, { token: { aleriaRole: 'editor' } }));
  await prepareHerausforderungRewards({}, {}, event);
  assert.equal(event.approaches[0].rewards.items[0].product.title, weapon.title);
  assert.equal(collectHerausforderungApproaches([{ id: 'origin', herausforderung: event }])[0].rewards.items[0].product.id, weapon.id);
});

test('rewards and penalties reject invalid money, references, quantities and effects', () => {
  for (const copper of ['abc', -1, 1000000001, 0.001]) assert.ok(validateHerausforderungBenefits({ copper }));
  assert.ok(validateHerausforderungBenefits({ copper: 2 }, { effectsOnly: true }));
  assert.ok(validateHerausforderungBenefits({ items: [{ template: weapon.id, quantity: 0 }] }));
  assert.ok(validateHerausforderungBenefits({ effects: [condition(), condition()] }));
  assert.ok(validateHerausforderungBenefits({ effects: [{ ...condition(), mechanics: { skill: 31 } }] }));
  assert.ok(validateHerausforderungBenefits({ effects: [{ ...condition(), durationAmount: 0 }] }));
  assert.deepEqual(normalizeHerausforderungBenefits(), { copper: 0, items: [], effects: [], combatEffects: [] });
});

test('copper amounts preserve Pfennig precision and legacy gold amounts retain their value', () => {
  assert.equal(normalizeHerausforderungBenefits({ copper: '2,50' }).copper, 2.5);
  assert.equal(validateHerausforderungBenefits({ copper: 0.29 }), null);
  assert.ok(validateHerausforderungBenefits({ copper: 2, gold: 2 }));
  assert.equal(normalizeHerausforderungBenefits({ gold: 2 }).copper, 2000);
  assert.equal(formatHerausforderungRewardReceipt({ copper: 2.5 }), '2,5 KT ins Inventar');
  assert.equal(formatHerausforderungRewardReceipt({ gold: 2 }), '2.000 KT ins Inventar');
  const actor = actors[0];
  const reward = applyHerausforderungBenefits({ character: { ...actor, inventory: { items: [], moneyState: moneyState(0.01) } }, profile: resolveCombatProfile(actor), benefits: { copper: 0.29 }, identity: 'pfennig', now: 'now' });
  assert.equal(moneyTotal(reward.inventory.moneyState), 0.3);
  assert.equal(reward.receipt.copper, 0.29);
});

test('a full inventory rejects the entire item-plus-copper reward before publishing any state', () => {
  const character = structuredClone(actors[0]);
  character.inventory.items = Array.from({ length: 80 }, (_, index) => ({ id: `old-${index}`, name: 'Vorhanden', quantity: '1' }));
  const original = JSON.stringify(character);
  assert.throws(() => applyHerausforderungBenefits({ character, profile: resolveCombatProfile(character), benefits: { copper: 10, items: [{ template: weapon.id, product: weapon, quantity: 1 }] }, identity: 'full', now: 'now' }), /80 Einträge/);
  assert.equal(JSON.stringify(character), original);
});

test('a reward buff uses the existing replay clock and changes the next skill modifier', () => {
  const actor = actors[0], profile = resolveCombatProfile(actor);
  const reward = applyHerausforderungBenefits({ character: actor, profile, benefits: { effects: [condition()] }, identity: 'clock', tier: 'erfolg', now: 'now' });
  const applied = { id: 'result', characterId: actor.id, serverValidatedMechanics: true, commentSegments: [{ kind: 'thought', characterId: actor.id,
    skillResolution: { actorId: actor.id, actorConditionSnapshot: reward.actorConditionSnapshot } }] };
  const first = deriveCombatStateFromComments([applied]).get(actor.id);
  assert.equal(first.temporaryConditions[0].durationModel.remainingActorComments, 2);
  assert.equal(overlayCombatHitPointState(profile, first).temporaryConditions[0].mechanics.skill, 2);
  const next = number => ({ id: `next-${number}`, characterId: actor.id, serverValidatedMechanics: true, commentSegments: [{ kind: 'speech', characterId: actor.id, text: 'Weiter' }] });
  assert.equal(deriveCombatStateFromComments([applied, next(1)]).get(actor.id).temporaryConditions[0].durationModel.remainingActorComments, 1);
  assert.equal(deriveCombatStateFromComments([applied, next(1), next(2)]).get(actor.id).temporaryConditions.length, 0);
});
