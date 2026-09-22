// Shared read projection for inventory, register and archive. Ownership, quantities
// and individual rules stay on the inventory instance; lookups never write it back.
import { getMaximumHitPoints, getArmorClass } from '../combat/combat-profile-model.js';
import { inventoryValuation } from './character-inventory-valuation.js';
export function inventoryImage(...candidates) {
  return candidates.map(value => String(value || '').trim()).find(value =>
    /^(?:https?:\/\/|data:image\/(?:png|jpeg|webp|gif);|\.{0,2}\/|[\w-]+\/)/i.test(value)
    && !/[<>"']/.test(value)) || '';
}

export function indexInventoryTemplates(templates = []) {
  return new Map(templates.filter(item => item.section !== 'owned').flatMap(item =>
    [item.id, item.canonicalKey, ...(item.aliases || [])].filter(Boolean).map(key => [key, item])));
}

export function resolveInventoryItem(item, { character = {}, templates = new Map(), creatures = [] } = {}) {
  const reference = [item.offerId, item.templateId, item.originItemDbKey, item.itemDbKey].find(key => templates.has(key));
  const template = templates.get(reference);
  const equipment = [...(character.combatProfile?.weapons || []), ...(character.combatProfile?.armorItems || [])]
    .find(entry => entry.inventoryItemId === item.id || (item.equipmentLink?.combatEntryId && entry.id === item.equipmentLink.combatEntryId));
  const creature = creatures.find(entry => entry.id === item.creatureId
    && entry.itemOrigin?.ownerCharacterId === character.id
    && entry.itemOrigin?.inventoryItemId === item.id
    && entry.itemOrigin?.instanceId === (item.instanceId || item.id));
  return {
    ...item,
    name: creature?.name || item.name || template?.title || 'Gegenstand',
    image: inventoryImage(creature?.portrait, item.image, equipment?.image, item.icon, template?.image),
    description: creature?.notes || item.description || template?.description || template?.details || '',
    type: creature?.species || item.type || template?.type || '',
    registerCategory: item.registerCategory || template?.category || '',
    templateId: item.templateId || template?.templateId || template?.id || '',
    templateName: item.templateName || template?.title || '',
    combatDefinition: item.combatDefinition || template?.combatDefinition || null,
    valuation: inventoryValuation(item, template),
    attributes: item.attributes?.length ? item.attributes : template?.attributes || [],
    equipped: equipment ? equipment.equipped === true : item.equipped === true
  };
}

export function isInventoryCompanion(item = {}) {
  return !!item.creatureId || ['pferde', 'vieh'].includes(item.registerCategory)
    || ['horse', 'pet', 'companion', 'mount'].includes(item.category);
}

export function inventoryCompanionViews(data = {}, creatures = []) {
  const views = (data.companions || []).map(entry => ({ ...entry }));
  for (const item of (data.items || []).filter(isInventoryCompanion)) {
    if (views.some(entry => entry.inventoryItemId === item.id || (item.creatureId && entry.creatureId === item.creatureId))) continue;
    views.push({ ...item, id: `inventory:${item.id}`, inventoryItemId: item.id,
      species: item.type || item.templateName, role: 'Gefährte', summary: item.description,
      status: '', attributes: [] });
  }
  return views.map(entry => {
    const creature = creatures.find(value => value.id === entry.creatureId);
    const profile = creature?.combatProfile || {};
    const health = profile.hitPoints || {};
    const maximum = creature ? getMaximumHitPoints(profile) : null;
    return { ...entry,
      name: creature?.name || entry.name,
      image: inventoryImage(creature?.portrait, entry.image),
      species: creature?.species || entry.species,
      summary: creature?.notes || entry.summary || entry.description,
      personality: entry.personality || creature?.personality || (profile.quirks || []).map(quirk => [quirk.name, quirk.description].filter(Boolean).join(' — ')).join('\n') || '',
      infoRows: [
        { label: 'Art', value: creature?.species || entry.species || 'Gefährte' },
        { label: 'Rolle', value: entry.role || 'Begleiter' },
        ...(maximum != null ? [{ label: 'Lebenspunkte', value: `${health.current ?? maximum} / ${maximum}` }, { label: 'Rüstungsklasse', value: String(getArmorClass(profile)) }] : []),
        ...(profile.combat?.movement ? [{ label: 'Bewegung', value: `${profile.combat.movement} m` }] : []),
        ...(entry.infoRows || []).filter(row => !['Art', 'Rolle'].includes(row.label))
      ],
      abilities: (profile.abilities || []).slice(0, 3).map(ability => ({ name: ability.name, description: ability.description })),
      creatureId: creature?.id || entry.creatureId || ''
    };
  });
}
