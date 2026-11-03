import { createGrantedItem } from '../item-register/item-register-model.js';
import { characterEquipmentSyncInternals } from '../character-equipment/character-equipment-sync.js';
import { personalSignetName } from './house-ring-membership.mjs';

const copy = value => structuredClone(value);
export const HOUSE_EQUIPMENT_ADDITIONS = Object.freeze({
  'person--haus-draig--oweta-draig': ['gwynthor-seven:draig-speer', 'gwynthor-seven:rianna-silberhirsch']
});

export function houseSignetClaimKey(characterId) {
  if (!/^[\w:.-]{1,180}$/.test(characterId || '')) throw Error('Der Siegelring benötigt eine feste Charakter-ID.');
  return `editorial:house-signets:20261102:${characterId}`;
}

// One-time editorial amendment. The inventory and its unrelated instances stay
// intact. A caller must commit the claim and these bounded fields atomically.
export function planHouseEquipmentAmendment({ character, membership, templates, claim = null, now } = {}) {
  const sourceKey = houseSignetClaimKey(character?.id);
  if (!membership?.familyId || !membership.worldPersonId || !character.name) throw Error('Eine belegte Hausmitgliedschaft wird benötigt.');
  if (!Number.isFinite(Date.parse(now))) throw Error('Ein fester Vergabezeitpunkt wird benötigt.');
  if (claim) {
    if (claim.sourceKey !== sourceKey || claim.result?.recordId !== character.id) throw Error('Der Vergabebeleg gehört zu einer anderen Figur.');
    return { character: copy(character), changed: false, fieldPaths: [], added: [], corrected: [], grant: null };
  }
  if (character.inventory?.items != null && !Array.isArray(character.inventory.items)) throw Error('Die Inventarliste ist ungültig.');
  const index = new Map(templates.map(template => [template.id, template]));
  const next = copy(character);
  next.inventory = { ...(next.inventory || {}), items: [...(next.inventory?.items || [])] };
  const items = next.inventory.items;
  const added = [], corrected = [];
  const ringId = `house-signet:${membership.familyId}`;
  const ringTemplate = index.get(ringId);
  if (!ringTemplate?.definitionRef) throw Error(`Die veröffentlichungsfähige Ringvorlage fehlt: ${ringId}`);
  const makeItem = (template, id) => createGrantedItem(template, { id, characterId: character.id,
    characterName: character.name, quantity: 1, now });
  const matches = templateId => items.filter(item => item.templateId === templateId || item.definitionRef?.id === templateId);
  const wrongGildasRings = membership.worldPersonId === 'person--haus-gafyr--gildas-gafyr'
    ? items.filter(item => item.id === 'gildas-gafyr-draig-knight-signet-item'
      || /draig/i.test(item.name || '') && /siegelring|ritterring/i.test(item.name || '')) : [];
  if (wrongGildasRings.length > 1 || matches(ringId).length > 1) throw Error('Mehrdeutiger Siegelringbestand.');
  if (wrongGildasRings.length && !matches(ringId).length) {
    const prior = wrongGildasRings[0];
    const replacement = { ...prior, ...makeItem(ringTemplate, prior.id),
      name: personalSignetName(character.name), instanceId: prior.instanceId || prior.id,
      acquiredAt: prior.acquiredAt || now, equipped: prior.equipped === true,
      ...(prior.icon ? { icon: ringTemplate.image } : {}),
      description: String(prior.description || ringTemplate.description).replace(/Draig/g, 'Gafyr'),
      tags: String(prior.tags || '').replace(/Draig/g, 'Gafyr'),
      infoRows: copy(prior.infoRows || []), attributes: copy(prior.attributes || []) };
    items[items.indexOf(prior)] = replacement;
    corrected.push({ id: prior.id, name: replacement.name, templateId: ringId });
  } else if (!matches(ringId).length) {
    const id = `${character.id}-house-signet-20261102`;
    if (items.some(item => item.id === id || item.instanceId === id)) throw Error('Die neue Ring-ID ist bereits anderweitig belegt.');
    const ring = { ...makeItem(ringTemplate, id), name: personalSignetName(character.name), equipped: true };
    items.push(ring); added.push({ id, name: ring.name, templateId: ringId });
  }
  let weaponChanged = false;
  for (const templateId of HOUSE_EQUIPMENT_ADDITIONS[membership.worldPersonId] || []) {
    const template = index.get(templateId);
    if (!template?.definitionRef) throw Error(`Die persönliche Itemvorlage fehlt: ${templateId}`);
    const existing = matches(templateId);
    if (existing.length > 1) throw Error('Der persönliche Gegenstand ist mehrfach vorhanden.');
    if (existing.length) {
      const item = existing[0];
      if (JSON.stringify(item.definitionRef) !== JSON.stringify(template.definitionRef)) {
        Object.assign(item, { definitionRef: copy(template.definitionRef), description: template.description, image: template.image });
        corrected.push({ id: item.id, name: item.name, templateId });
      }
      continue;
    }
    const id = `${character.id}-${templateId.split(':').at(-1)}-20261102`;
    if (items.some(item => item.id === id || item.instanceId === id)) throw Error('Die persönliche Item-ID ist bereits anderweitig belegt.');
    const item = makeItem(template, id);
    items.push(item); added.push({ id, name: item.name, templateId });
    if (template.combatDefinition?.kind === 'weapon') {
      next.combatProfile = { ...(next.combatProfile || {}), weapons: [...(next.combatProfile?.weapons || [])] };
      next.combatProfile.weapons.push(characterEquipmentSyncInternals.combatEntryFromInventory(
        { ...item, combatDefinition: template.combatDefinition }, { id, inventoryItemId: id }, 'weapon'));
      const revision = Number(next.combatProfile.revision || 0);
      next.combatProfile.revision = Math.max(revision + 1, Date.parse(now));
      weaponChanged = true;
    }
  }
  const changed = added.length + corrected.length > 0;
  if (!changed) return { character: next, changed: false, fieldPaths: [], added, corrected, grant: null };
  const revision = next.inventory.revision ?? 0;
  if (!Number.isSafeInteger(revision) || revision < 0 || !Number.isSafeInteger(revision + 1)) throw Error('Die Inventarrevision ist ungültig.');
  next.inventory.revision = revision + 1;
  next.updatedAt = now;
  return { character: next, changed, added, corrected,
    fieldPaths: ['inventory', 'updatedAt', ...(weaponChanged ? ['combatProfile.weapons', 'combatProfile.revision'] : [])],
    grant: { sourceKey, operationId: sourceKey, title: `Haus-Siegelring · ${character.name}`, at: now,
      familyId: membership.familyId, result: { recordId: character.id, added, corrected } } };
}
