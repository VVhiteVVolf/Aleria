import { challengeBenefitBundles } from '../generated/herausforderung/herausforderung-outcomes.js';
import { createHash } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import { resolveRegisterItemTemplate } from './item-register-template.js';
import { productWithItemDefinition, prepareTemplateDefinition } from '../items/item-definition-repository.js';
import { applyHerausforderungBenefits, benefitsForTier, hasHerausforderungBenefits } from '../generated/herausforderung/herausforderung-rewards.js';

export function assertHerausforderungRewardAuthority(event, auth) {
  if (event.approaches.some(hasHerausforderungBenefits) && !['admin', 'moderator', 'editor'].includes(auth?.token?.aleriaRole)) {
    throw new HttpsError('permission-denied', 'Belohnungen und mechanische Folgen werden von Spielleitung oder Redaktion festgelegt.');
  }
}

export async function prepareHerausforderungRewards(database, transaction, event) {
  const versions = new Map();
  for (const approach of event.approaches) {
    for (const bundle of challengeBenefitBundles(approach)) for (const item of bundle.items || []) {
      const product = productWithItemDefinition(await resolveRegisterItemTemplate(database, transaction, item));
      if (!product) throw new HttpsError('invalid-argument', 'Eine Registervorlage für die Belohnung fehlt.');
      if (['waffen', 'ruestungen'].includes(product.category) && item.quantity !== 1) throw new HttpsError('invalid-argument', 'Waffen und Rüstungen werden einzeln vergeben.');
      item.product = JSON.parse(JSON.stringify(product));
      const key = `${product.definitionRef.id}@${product.definitionRef.revision}`;
      if (!versions.has(key)) versions.set(key, await prepareTemplateDefinition(database, transaction, product));
      item.title = product.title;
    }
  }
  for (const version of versions.values()) version.write();
  return event;
}

export function herausforderungEffectClaimId(challengeId, actorId, tier) {
  return createHash('sha256').update([challengeId, actorId, tier].join('\u0000')).digest('hex');
}

export function applyHerausforderungRewardToAttempt({ challenge, resolution, actor, profile, state, inventory, equipment, identity, encounterId }) {
  const benefits = benefitsForTier(challenge, resolution.herausforderungTier);
  if (!benefits?.copper && !benefits?.items?.length && !benefits?.effects?.length && !benefits?.combatEffects?.length) return null;
  try {
    return applyHerausforderungBenefits({ character: { ...actor, inventory, combatProfile: { ...actor.combatProfile, ...equipment } }, profile, state, benefits: { ...benefits, effects: [], combatEffects: [] },
      identity, challengeId: challenge.id, tier: resolution.herausforderungTier, encounterId, now: resolution.validatedAt });
  } catch (error) { throw new HttpsError('failed-precondition', error.message); }
}
