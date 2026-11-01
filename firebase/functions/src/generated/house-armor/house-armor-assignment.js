import { findArmorHouse, houseArmorRank, characterArmorLevel, armorTemplateId, HOUSE_ARMOR_CATEGORY } from './house-armor-model.js?v=20261006-regional-equipment-v2';

const isTorso = item => item.category === 'armor' && !/schild|shield|helm|stiefel|handschuh/i.test(`${item.name || ''} ${item.type || ''}`);
const rankMetadata = (house, rank) => ({ houseId: house.id, regionId: house.regionId, rankId: rank?.id || '', minimumLevel: rank?.minimumLevel || 0, armorClassRange: rank?.armorClassRange || '' });

/** Pure, idempotent grant. A receipt prevents replacing sold, transferred or deleted armor.
 * Existing items retain all rules, identities and equipment state. No combat stats are added.
 */
export function assignHouseArmor(character = {}) {
  const house = findArmorHouse(character);
  if (!house?.image) return character;
  const rank = houseArmorRank(characterArmorLevel(character));
  const receipt = character.houseArmorAssignment;
  const items = character.inventory?.items || [];
  if (receipt) {
    const item = items.find(entry => entry.id === receipt.itemId);
    if (!item || receipt.houseId !== house.id) return character;
    const next = rankMetadata(house, rank);
    if (Object.entries(next).every(([key, value]) => item.houseArmor?.[key] === value)) return character;
    const updated = { ...item, houseArmor: next };
    // Only update the generated name/template. User customization remains their own.
    const previousName = receipt.itemName;
    const nextName = armorName(house, rank);
    if (receipt.generated) {
      if (item.name === previousName) updated.name = nextName;
      updated.templateId = rank ? armorTemplateId(house.id, rank.id) : '';
      updated.templateName = nextName;
      updated.infoRows = armorFacts(house, rank);
    }
    return { ...character, inventory: { ...character.inventory, items: items.map(entry => entry === item ? updated : entry) },
      houseArmorAssignment: { ...receipt, rankId: rank?.id || '', itemName: nextName } };
  }
  const armor = items.find(isTorso);
  if (armor) {
    const placeholder = /^(Rüstung\s*\/\s*Schutz|Rüstung)$/i.test(armor.name || '') && !armor.combatDefinition && !armor.equipmentLink;
    const updated = { ...armor, image: armor.image || house.image, houseArmor: rankMetadata(house, rank) };
    if (placeholder) Object.assign(updated, {
      name: armorName(house, rank), templateName: armorName(house, rank),
      templateId: rank ? armorTemplateId(house.id, rank.id) : '', registerCategory: HOUSE_ARMOR_CATEGORY,
      description: `Harnisch des ${house.name.replace(/^Haus /, 'Hauses ')}. Konkrete Kampfwerte sind noch nicht festgelegt.`,
      infoRows: armorFacts(house, rank)
    });
    return { ...character, inventory: { ...character.inventory, items: items.map(item => item === armor ? updated : item) },
      houseArmorAssignment: { version: 1, houseId: house.id, itemId: armor.id, generated: placeholder, rankId: rank?.id || '', itemName: updated.name } };
  }
  // A combat-only armor already represents possession; attach its illustration separately
  // during the audit instead of inventing a second item or changing its mechanics here.
  if ((character.combatProfile?.armorItems || []).some(entry => entry.kind !== 'shield' && !/schild|shield/i.test(entry.name || ''))) return character;
  if (items.length >= 80) return character;
  const id = `house-armor-${character.id || house.id}`;
  const name = armorName(house, rank);
  const item = { id, instanceId: id, name, templateName: name, templateId: rank ? armorTemplateId(house.id, rank.id) : '',
    category: 'armor', registerCategory: HOUSE_ARMOR_CATEGORY, type: 'Hausrüstung · Harnisch',
    image: house.image, quantity: '1', equipped: false, itemStorageMode: 'character',
    ownerCharacterId: character.id || '', ownerCharacterName: character.name || '',
    description: `Harnisch des ${house.name.replace(/^Haus /, 'Hauses ')}. Konkrete Kampfwerte sind noch nicht festgelegt.`,
    combatDefinition: null, houseArmor: rankMetadata(house, rank),
    attributes: [],
    infoRows: armorFacts(house, rank), tags: `Cenyr, ${house.region}, ${house.name}, Harnisch` };
  return { ...character, inventory: { ...character.inventory, items: [...items, item] },
    houseArmorAssignment: { version: 1, houseId: house.id, itemId: id, generated: true, rankId: rank?.id || '', itemName: name } };
}
function armorName(house, rank) {
  return `${house.name} · ${rank ? `${rank.label}-Plattenrüstung` : 'Harnisch'}`;
}
function armorFacts(house, rank) {
  return [{ label: 'Haus', value: house.name }, { label: 'Region', value: house.region },
    { label: 'Rang', value: rank?.label || 'Noch kein Ritterrang' }, { label: 'RK-Rahmen', value: rank?.armorClassRange || 'Noch nicht festgelegt' }];
}

/** Merge only the fields this feature owns into an otherwise partial save. */
export function prepareHouseArmorWrite(current, outgoing, { characterId = '' } = {}) {
  const combined = { ...current, ...outgoing,
    id: characterId || outgoing.id || current?.id || '',
    houseArmorAssignment: current?.houseArmorAssignment || outgoing.houseArmorAssignment };
  const assigned = assignHouseArmor(combined);
  if (assigned === combined) return current?.houseArmorAssignment ? { ...outgoing, houseArmorAssignment: current.houseArmorAssignment } : outgoing;
  return { ...outgoing, inventory: assigned.inventory, houseArmorAssignment: assigned.houseArmorAssignment };
}
