export const NUDD_EQUIPMENT_IDS = Object.freeze({
  trident: 'starter-cantref-spear', sword: 'nudd-saethwyr-knightly-sword', armor: 'starter-cantref-chainmail',
  swordItem: 'equipment-weapon-nudd-saethwyr-knightly-sword'
});
const artRoot = '/AleriaAlmanach/public/assets/character-equipment/';
const rule = (id, name, phase, effects, options = {}) => ({ id, name, phase, effects,
  recipient: 'actor', sourceRelation: 'self', activation: 'passive', frequency: 'scene',
  condition: phase === 'pre-hit-damage' ? 'would-hit' : 'always',
  actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, ...options });

// Whole-point baseline quality matches Drachenzahn/Pflichtschwur/Silberschuppe.
// Small once-per-scene additions approximate the requested 15% increase without
// converting every +1 to +2 or every protection 2 to 3. No personal training on items.
export function applyNuddEquipment(profile) {
  const weapons = profile.weapons.map(weapon => {
    if (weapon.id !== NUDD_EQUIPMENT_IDS.trident) return weapon;
    return { ...weapon, name: 'Dreifache Pflicht · Saethwyr-Dreizack', weaponType: 'spear', weaponProfileId: 'trident',
      damageFormula: '1d10', versatileDamageFormula: '', damageType: 'Stich', damageBonus: 1,
      image: `${artRoot}nudd-dreizack-v1.png`, properties: 'Dreizack · Speerwaffe · Saethwyr-Segnung',
      notes: '1W10 Stich; +1 Waffenschaden. Bei kritischem Treffer +2 weiterer Schaden, nicht verdoppelt. Der erste erfolgreiche Treffer mit dieser Waffe je Szene verursacht zusätzlich +1 Schaden. Gilt auch für passende Speertechniken.',
      triggerRules: [
        rule('nudd-trident-critical', 'Drei scharfe Zinken', 'pre-damage', { damageModifier: 2 },
          { frequency: 'always', condition: 'critical-hit', description: '+2 Schaden bei kritischem Treffer; nicht verdoppelt.' }),
        rule('nudd-trident-first-hit', 'Pflichtspitze', 'pre-hit-damage', { damageModifier: 1 },
          { description: 'Erster erfolgreicher Dreizacktreffer je Szene: +1 Schaden, auch bei Speertechniken.' })
      ] };
  });
  const previousSword = weapons.find(weapon => weapon.id === NUDD_EQUIPMENT_IDS.sword);
  const sword = { ...previousSword, id: NUDD_EQUIPMENT_IDS.sword, name: 'Eidwacht · Saethwyr-Ritterschwert',
    inventoryItemId: NUDD_EQUIPMENT_IDS.swordItem, weaponType: 'sword', weaponProfileId: 'longsword',
    training: 'martial', proficient: true, attackAttribute: 'strength', activationType: 'action',
    damageType: 'Hieb', damageFormula: '1d8', versatileDamageFormula: '1d10', attackBonus: 1, damageBonus: 1,
    equipped: previousSword?.equipped === true, range: 'Nahkampf', image: `${artRoot}nudd-ritterschwert-v1.png`,
    properties: 'Vielseitig · 1W10 ausschließlich bei zweihändiger Führung · Saethwyr-Segnung',
    notes: '+1 Waffenangriff und +1 Waffenschaden. Der erste Angriff mit diesem Schwert je Szene erhält zusätzlich +1 Angriff, auch bei Fehlschlag verbraucht. Der erste erfolgreiche Treffer je Szene verursacht zusätzlich +1 Schaden. Keine zusätzliche Kritwirkung. Speertechniken bleiben an Speerwaffen gebunden.',
    costs: [{ id: 'nudd-knightly-sword-action', resourceId: 'action', name: 'Aktion', amount: 1, scope: 'comment' }],
    auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 }, effects: [],
    triggerRules: [
      rule('nudd-sword-opening', 'Ruhige Eröffnung', 'pre-roll', { attackModifier: 1 },
        { description: 'Erster Schwertangriff je Szene: +1 Angriff; auch ein Fehlschlag verbraucht den Zusatz.' }),
      rule('nudd-sword-first-hit', 'Eidstreue Schneide', 'pre-hit-damage', { damageModifier: 1 },
        { description: 'Erster erfolgreicher Schwerttreffer je Szene: +1 Schaden.' })
    ] };
  const armorItems = profile.armorItems.map(armor => armor.id !== NUDD_EQUIPMENT_IDS.armor ? armor : {
    ...armor, name: 'Goldene Wacht · Saethwyr-Plattenrüstung',
    damageProtection: { amount: 2, damageTypes: ['hieb', 'stich'], name: 'Saethwyr-Plattenschutz', excludedDamageTypes: [] },
    notes: 'Angelegt: −2 Schaden gegen Hieb und Stich je Treffer. Der erste treffende Hieb-/Stich-Waffen- oder Technikangriff je Szene verursacht zusätzlich 2 Schaden weniger. Ersetzt den bisherigen Plattengrundschutz; kein zusätzlicher RK-Bonus.',
    triggerRules: [rule('nudd-armor-first-hit', 'Goldene Wacht', 'pre-hit-damage', { damageReduction: 2 },
      { recipient: 'target', damageTypes: ['hieb', 'stich'], description: 'Erster treffender Hieb-/Stich-Waffen- oder Technikangriff je Szene: zusätzlich −2 Schaden.' })]
  });
  return { ...profile, weapons: [...weapons.filter(weapon => weapon.id !== sword.id), sword], armorItems };
}
