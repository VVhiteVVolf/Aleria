import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { planNuddDuelRelease } from '../../firebase/functions/scripts/nudd-duel-release-model.mjs';
import { applyCharacterFieldPatch } from '../../firebase/functions/scripts/wolfshorn-recovery-release-model.mjs';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';

const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}-defense-balance-2026-10-03.json`, import.meta.url))).character;
const nudd = applyCharacterFieldPatch(await load('nudd-saethwyr'), planNuddDuelRelease(await load('nudd-saethwyr')));
const asgeir = await load('asgeir-wolfshorn');
const resolve = (character, actionId) => resolveCombatProfile(character,{actionId,includeAiSnapshot:false});
const attack = (actor,target,keys = new Set(),scene = 'equipment-scene',fixed = 15) => new CombatResolutionService(new SeededCombatDice(1,fixed))
  .resolveAttack({actor,target},{rulePeriods:{comment:'equipment-post',scene,day:'equipment-day'},usedRuleFrequencyKeys:keys,relationship:'enemy'});

test('trident first successful hit applies once per scene, misses do not spend it and critical +2 is not doubled', async () => {
  const actor = resolve(nudd,'weapon:starter-cantref-spear'), target = resolve(asgeir);
  const miss = await attack(actor,target,new Set(),'equipment-scene',2);
  assert.equal(miss.attack.hit,false);
  assert.equal(miss.ruleApplications.some(rule => rule.ruleId === 'nudd-trident-first-hit'),false);
  const first = await attack(actor,target,new Set(miss.usedRuleFrequencyKeys));
  const second = await attack(actor,target,new Set(first.usedRuleFrequencyKeys));
  assert.equal(first.damage.total-second.damage.total,1);
  const nextScene = await attack(actor,target,new Set(first.usedRuleFrequencyKeys),'another-scene');
  assert.equal(nextScene.damage.total,first.damage.total);
  const critical = await attack(actor,target,new Set(),'equipment-scene',20);
  assert.equal(critical.damage.total,26); // 2W10 + KRF 2 + quality 1 + critical 2 + once 1.
});

test('sword opening and first hit are separate, trident effects do not transfer to the sword', async () => {
  const c = structuredClone(nudd);
  c.combatProfile.weapons.forEach(weapon => { weapon.equipped = weapon.id === 'nudd-saethwyr-knightly-sword'; });
  const actor = resolve(c,'weapon:nudd-saethwyr-knightly-sword'), target = resolve(asgeir);
  const miss = await attack(actor,target,new Set(),'equipment-scene',2);
  assert.equal(miss.attack.hit,false);
  assert.ok(miss.ruleApplications.some(rule => rule.ruleId === 'nudd-sword-opening'));
  assert.equal(miss.ruleApplications.some(rule => rule.ruleId === 'nudd-sword-first-hit'),false);
  const hit = await attack(actor,target,new Set(miss.usedRuleFrequencyKeys));
  assert.equal(hit.ruleApplications.some(rule => rule.ruleId === 'nudd-sword-opening'),false);
  assert.ok(hit.ruleApplications.some(rule => rule.ruleId === 'nudd-sword-first-hit'));
  assert.equal(hit.ruleApplications.some(rule => rule.ruleId.startsWith('nudd-trident')),false);
  assert.equal(resolve(c,'technique:nudd-gleitende-bindung').selectedAction.compatible,false);
});

test('armor adds exactly one protection receipt to a four-hit sequence, retaining RK 15', async () => {
  const actor = resolve(asgeir,'technique:asgeir-vier-faenge'), target = resolve(nudd);
  assert.equal(target.totalDefense,15);
  const result = await attack(actor,target);
  assert.equal(result.followUpAttacks.length,3);
  const allApplications = [...result.ruleApplications,...result.followUpAttacks.flatMap(hit=>hit.ruleApplications || [])];
  assert.equal(allApplications.filter(rule=>rule.ruleId === 'nudd-armor-first-hit').length,1);
  assert.equal(target.currentHitPoints-result.targetSnapshot.hitPointsAfter,38);
});

test('armor protection is typed and unequipping the item removes both its base protection and trigger', async () => {
  const c = structuredClone(nudd); c.combatProfile.armorItems[0].equipped = false;
  const actor = resolve(asgeir,'weapon:asgeir-axt-rechts');
  const protectedHit = await attack(actor,resolve(nudd)), unprotectedHit = await attack(actor,resolve(c));
  assert.equal(unprotectedHit.damage.total-protectedHit.damage.total,4);
  assert.equal(unprotectedHit.ruleApplications.some(rule=>rule.ruleId === 'nudd-armor-first-hit'),false);
});
