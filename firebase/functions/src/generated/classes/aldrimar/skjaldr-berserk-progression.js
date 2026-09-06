// Replacement tiers shared by pages, sheets and authoritative combat.
const tiers = [
  { minimumLevel: 6, name: 'Entfesselter Zorn', strength: 2, weaponDamage: '1d4', hitDice: 1, uses: 1 },
  { minimumLevel: 8, name: 'Blut und Donner', strength: 2, weaponDamage: '1d6', hitDice: 1, uses: 2 },
  { minimumLevel: 10, name: 'Wille des Schildbeißers', strength: 4, weaponDamage: '1d6', hitDice: 2, uses: 2 },
  { minimumLevel: 15, name: 'Ungebrochene Raserei', strength: 4, weaponDamage: '1d8', hitDice: 2, uses: 3 },
  { minimumLevel: 20, name: 'Zorn des Nordens', strength: 6, weaponDamage: '1d10', hitDice: 3, uses: 3 }
].map((tier, index) => ({ ...tier, armorClass: index - 4, status: 'implemented', active: true,
  description: `Berserkergang: +${tier.strength} Kraft (einschließlich Attributsmodifikator), +${tier.weaponDamage.replace('d', 'W')} Waffenschaden, ${index - 4} RK. Beim Aktivieren ${tier.hitDice}W12 + KON temporäre LP. Einmal je Aktivierung bei 0 LP auf 1 LP bleiben. Bis Kampfende oder einem eigenen Gesamtbeitrag ohne Angriff und ohne erlittenen Schaden; ${tier.uses} Anwendungen täglich.` }));

export const SKJALDR_BERSERK_RULES = Object.freeze({
  id: 'aldrimar-skjaldr-berserkergang', minimumLevel: 6, status: 'implemented', active: true,
  activationCosts: [{ resourceId: 'bonus-action', name: 'Bonusaktion', amount: 1, scope: 'comment' },
    { resourceId: 'reaction', name: 'Reaktion', amount: 1, scope: 'comment' }],
  recovery: 'day',
  auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1, replaces: 'activation-costs-only' },
  // Uses are an ability limit, not an action cost that Aura can replace.
  affectedAttacks: { kind: 'weapon', includeFollowUp: false },
  stacking: 'replace', refreshWhileActive: false,
  endOn: ['inactive-actor-comment', 'encounter-ended'],
  survivalCharges: 1,
  temporaryHitPointRules: { stacking: 'highest', repeatPerPost: false, expireWithMode: false }
});

export function getSkjaldrBerserkTiers() { return structuredClone(tiers); }
export function getSkjaldrBerserkProgression(level) {
  const value = Number(level);
  if (!Number.isFinite(value) || value < 6) return null;
  const tier = tiers.findLast(entry => entry.minimumLevel <= Math.min(20, Math.trunc(value)));
  return { ...structuredClone(SKJALDR_BERSERK_RULES), ...structuredClone(tier),
    durationModel: { kind: 'combat' } };
}
