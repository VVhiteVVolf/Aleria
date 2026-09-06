// Explicit replacement tiers, not additive bonuses. Page/plan data only;
// scoped modifiers and lifecycle must be enforced during character integration.
const tiers = [
  { minimumLevel: 6, name: 'Gezähmter Zorn', damage: 1, attack: 0, temporaryHitPoints: 0, fearSave: 1, comments: 2, uses: 1 },
  { minimumLevel: 8, name: 'Gebändigtes Feuer', damage: 2, attack: 0, temporaryHitPoints: 3, fearSave: 1, comments: 3, uses: 2 },
  { minimumLevel: 10, name: 'Wille des Schildbeißers', damage: 2, attack: 1, temporaryHitPoints: 4, fearSave: 2, comments: 3, uses: 2 },
  { minimumLevel: 15, name: 'Ungebrochener Ansturm', damage: 3, attack: 1, temporaryHitPoints: 6, fearSave: 2, comments: 4, uses: 3 },
  { minimumLevel: 20, name: 'Herr der eigenen Raserei', damage: 3, attack: 2, temporaryHitPoints: 8, fearSave: 3, comments: 4, uses: 3 }
].map(tier => ({ ...tier, armorClass: -1, status: 'draft', active: false,
  description: `Berserkergang: +${tier.damage} Nahkampfschaden${tier.attack ? `, +${tier.attack} Nahkampfangriff` : ''}, +${tier.fearSave} gegen Furcht, −1 RK. ${tier.temporaryHitPoints} temporäre LP beim Aktivieren; ${tier.comments} eigene Beiträge, ${tier.uses} Anwendungen täglich.` }));

export const SKJALDR_BERSERK_RULES = Object.freeze({
  id: 'aldrimar-skjaldr-berserkergang', minimumLevel: 6, status: 'draft', active: false,
  activationCosts: [{ resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1, scope: 'comment' },
    { resourceId: 'reaction', name: 'Reaktion', amount: 1, scope: 'comment' }],
  useResourceId: 'skjaldr-berserk-uses', recovery: 'day',
  auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1, replaces: 'activation-costs-only' },
  // Uses are an ability limit, not an action cost that Aura can replace.
  affectedAttacks: { range: 'melee', attribute: 'strength', includeFollowUp: false },
  stacking: 'replace', refreshWhileActive: false,
  endOn: ['duration-expired', 'unconscious', 'voluntary-end', 'encounter-ended'],
  aftereffect: { name: 'Atemholen', durationModel: { kind: 'actor-comments', remainingActorComments: 1 },
    mechanics: { attack: -1 }, blocksReactivation: true },
  temporaryHitPointRules: { stacking: 'highest', repeatPerPost: false, expireWithMode: true }
});

export function getSkjaldrBerserkTiers() { return structuredClone(tiers); }
export function getSkjaldrBerserkProgression(level) {
  const value = Number(level);
  if (!Number.isFinite(value) || value < 6) return null;
  const tier = tiers.findLast(entry => entry.minimumLevel <= Math.min(20, Math.trunc(value)));
  return { ...structuredClone(SKJALDR_BERSERK_RULES), ...structuredClone(tier),
    durationModel: { kind: 'actor-comments', remainingActorComments: tier.comments } };
}
