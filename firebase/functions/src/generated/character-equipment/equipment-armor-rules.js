// Item classification and defense progression, shared by sheets, inventory and server.
const mediumUpgrades = new Set(['ylva-leder', 'freya-padded-armor']);
export function getArmorCategory(item = {}) {
  if (item.kind && item.kind !== 'armor') return '';
  if (mediumUpgrades.has(item.id)) return 'medium';
  if (['light', 'medium', 'heavy'].includes(item.armorCategory)) return item.armorCategory;
  const label = `${item.name || ''} ${item.properties || ''}`.toLocaleLowerCase('de');
  if (/platten|platte|schwere rüstung|kettenhemd/.test(label)) return 'heavy';
  if (/schuppen|kettenpanzer|mittlere rüstung/.test(label)) return 'medium';
  if (/leder|wattiert|leichte rüstung/.test(label)) return 'light';
  return '';
}

export function applyArmorBalance(item = {}) {
  const armorCategory = getArmorCategory(item);
  if (!armorCategory) return item;
  const juniorPlate = armorCategory === 'heavy' && (Number(item.baseArmorClass) === 16
    || /jungritter/i.test(item.name || ''));
  const baseArmorClass = armorCategory === 'medium' ? 14 : juniorPlate ? 15 : item.baseArmorClass;
  const notes = String(item.notes || '').replace(/Rüstungsroutine: Geschicklichkeit zählt erst ab Stufe 12\.?/g, '').trim();
  return { ...item, armorCategory, baseArmorClass, dexterityUnlockLevel: 0,
    dexterityMode: armorCategory === 'heavy' ? 'none' : armorCategory === 'medium' ? 'capped' : 'full',
    dexterityCap: 2, notes,
    ...(mediumUpgrades.has(item.id) ? { properties: 'Mittlere Rüstung' } : {}),
    ...(armorCategory === 'heavy' && baseArmorClass === 15 && !item.damageProtection?.amount
      ? { damageProtection: { name: 'Plattengrundschutz', amount: 1, damageTypes: ['hieb', 'stich', 'wucht'], excludedDamageTypes: [] } } : {}) };
}

export function getArmorDexterityRules(profile = {}, armor = null) {
  const category = getArmorCategory(armor || {});
  if (!category) return null;
  const level = Number(profile.progression?.level) || 1;
  if (category === 'heavy') return { mode: 'none', cap: 0 };
  if (category === 'light' || level >= 16) return { mode: 'full', cap: 0 };
  return { mode: 'capped', cap: level >= 10 ? 4 : 2 };
}

export function balanceArmorInventoryItem(item = {}) {
  const definition = item.combatDefinition;
  if (definition?.kind !== 'armor') return item;
  const armor = applyArmorBalance({ ...definition, id: item.equipmentLink?.combatEntryId || item.id,
    name: item.name || item.title, kind: definition.armorKind || 'armor' });
  if (!armor.armorCategory) return item;
  const { id, name, kind, ...balanced } = armor;
  const description = String(item.description || '')
    .replace(/Basis-RK\s*16\s*;\s*ab Stufe 12 zählt der Geschicklichkeitsmodifikator durch Rüstungsroutine\.?/g, `Basis-RK ${armor.baseArmorClass}; kein Geschicklichkeitsbonus.`)
    .replace(/Rüstungsroutine: Geschicklichkeit zählt erst ab Stufe 12\.?/g, '').trim();
  return { ...item, description, combatDefinition: { ...balanced, kind: 'armor', armorKind: kind } };
}
