import test from 'node:test';
import assert from 'node:assert/strict';
import { getDevelopmentAttackCatalog, applyDevelopmentChoices, getDevelopmentAttackCost } from '../modules/character-development/development-purchases.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getVennyrTechniqueUnavailableReason } from '../modules/classes/vennyr/vennyr-technique-weapon-rules.js';
import { getHuskarlTechniqueUnavailableReason } from '../modules/classes/aldrimar/aldrimar-combat-rules.js';

const catalog = getDevelopmentAttackCatalog();
const profileAt = (level, classId = 'custom') => sanitizeCharacterCombatProfile({
  templateSelections: { classId }, progression: { level, development: { mode: 'purchase' } }
});
function unavailableReason(profile, technique, weapon) {
  const cenyr = resolveCenyrTechniqueWeaponRules(profile, technique, weapon);
  return (!cenyr.compatible && cenyr.disabledReason)
    || getVennyrTechniqueUnavailableReason(profile, technique, weapon)
    || getHuskarlTechniqueUnavailableReason(profile, technique) || '';
}

test('every confirmed purchase offer is individually learnable; foreign prices, minimum levels and receipts remain consistent', () => {
  assert.ok(catalog.length >= 1000);
  for (const entry of catalog) {
    const profile = profileAt(entry.minimumLevel);
    const own = profileAt(entry.minimumLevel, entry.classId);
    const foreignCost = getDevelopmentAttackCost(profile, entry);
    assert.equal(foreignCost, 2 * getDevelopmentAttackCost(own, entry), entry.id);
    const purchased = applyDevelopmentChoices(profile, { purchaseIds: [entry.id] });
    assert.deepEqual(purchased.errors, [], entry.id);
    assert.equal(purchased.profile.techniques.length, 1, entry.id);
    assert.equal(purchased.profile.techniques[0].id, entry.technique.id, entry.id);
    assert.deepEqual(purchased.profile.progression.development.purchases, [{
      techniqueId: entry.technique.id, classId: entry.classId, cost: foreignCost, level: entry.minimumLevel
    }], entry.id);
    const repeated = applyDevelopmentChoices(purchased.profile, { purchaseIds: [entry.id] });
    assert.equal(repeated.profile.techniques.length, 1, entry.id);
    assert.deepEqual(repeated.profile.progression.development.purchases, purchased.profile.progression.development.purchases, entry.id);
    if (entry.minimumLevel > 1) {
      const early = applyDevelopmentChoices(profileAt(entry.minimumLevel - 1), { purchaseIds: [entry.id] });
      assert.equal(early.profile.techniques.length, 0, entry.id);
      assert.equal(early.profile.progression.development.purchases.length, 0, entry.id);
      assert.ok(early.errors.some(error => error.includes(`Stufe ${entry.minimumLevel}`)), entry.id);
    }
  }
});

// The engine catalogue tests deliberately override eligibility to exercise every
// effect. This complementary contract uses the real requirement functions with
// an unrelated primary class and the paid source-class receipt. It must find a
// legal loadout without weakening the requirements to make the test pass.
test('every purchasable technique has a legal paid foreign-class loadout in the real requirement policies', () => {
  for (const entry of catalog) {
    const technique = entry.technique;
    const requirements = { ...technique.cenyrTraining, ...technique.cultureTraining };
    const profileIds = [...new Set([
      ...(technique.cenyrTraining?.classWeaponProfiles?.[entry.classId] || []),
      ...(technique.cultureTraining?.weaponProfileIds || [])
    ])];
    const types = technique.weaponTypes.length ? technique.weaponTypes : ['sword'];
    const candidates = (profileIds.length ? profileIds : types).flatMap(weaponProfileId => types.map(weaponType => ({
      id: 'audit-weapon', name: weaponProfileId, weaponProfileId, weaponType,
      equipped: true, damageFormula: '1d6', versatileDamageFormula: '1d8'
    })));
    const reasons = new Set();
    let legalProfile;
    let legalWeapon;
    const available = candidates.some(weapon => {
      const profile = { ...profileAt(entry.minimumLevel), weapons: [weapon],
        combat: { mounted: true }, armorClass: { shieldBonus: requirements.requiresShield ? 2 : 0 } };
      profile.progression.development.purchases = [{ techniqueId: technique.id, classId: entry.classId, cost: 4, level: entry.minimumLevel }];
      const reason = unavailableReason(profile, technique, weapon);
      if (reason) reasons.add(reason);
      else { legalProfile = profile; legalWeapon = weapon; }
      return !reason;
    });
    assert.ok(available, `${entry.id}: ${[...reasons].join(' / ')}`);
    if (requirements.requiresMounted) {
      assert.ok(unavailableReason({ ...legalProfile, combat: { mounted: false } }, technique, legalWeapon), `${entry.id}: unmounted`);
    }
    if (requirements.requiresShield) {
      assert.ok(unavailableReason({ ...legalProfile, armorClass: { shieldBonus: 0 } }, technique, legalWeapon), `${entry.id}: no shield`);
    }
    if (requirements.requiresTwoHands) {
      assert.ok(unavailableReason({ ...legalProfile, armorClass: { shieldBonus: 2 } }, technique, legalWeapon), `${entry.id}: occupied shield hand`);
    }
  }
});
