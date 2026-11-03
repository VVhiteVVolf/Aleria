import { isDeepStrictEqual } from 'node:util';
import { attachCreatureToInventory } from '../creatures/creature-companion-link.js';
import { resolveCreatureBestiaryReference } from '../creatures/creature-bestiary-reference.js';
import { patrickBiographyCharacterIds, GWEN_CHARACTER_ID } from './biography-identities.mjs';
import { planPatrickBiographyIcons } from './biography-icon-plan.mjs';
import { PATRICK_BIOGRAPHY_PETS, getPatrickBiographyPetSpecs, createPatrickBiographyCompanion } from './biography-companions.mjs';

const normalized = value => String(value || '').normalize('NFC').trim().toLocaleLowerCase('de');
const nextRevision = (previous, now) => Math.max(Date.parse(now), (Number(previous) || 0) + 1);
const companionItem = item => Boolean(item.creatureId) || item.category === 'companion'
  || ['pferde', 'vieh'].includes(item.registerCategory);

function selectExistingCompanion(spec, owner, existingCreatures) {
  const expectedId = `companion-${spec.ownerSlug}-${spec.slug}`;
  const matches = existingCreatures.filter(creature => creature.id === expectedId
    || (creature.itemOrigin?.ownerCharacterId === owner.id && normalized(creature.name) === normalized(spec.name)));
  if (matches.length > 1) throw new Error(`Mehrdeutige bestehende Kreatur: ${spec.name}`);
  const creature = matches[0];
  if (!creature) return null;
  const origin = creature.itemOrigin;
  if (origin?.ownerCharacterId !== owner.id || !origin.inventoryItemId || !origin.instanceId) {
    throw new Error(`Widersprüchliche oder unvollständige Besitzerzuordnung: ${spec.name}`);
  }
  if (resolveCreatureBestiaryReference(creature)?.id !== spec.bestiaryId) {
    throw new Error(`Abweichende bestehende Rasse: ${spec.name}`);
  }
  return creature; // Existing ID, combat profile, current resources and all metadata stay untouched.
}

function alreadyLinked(inventory = {}, creature, ownerId) {
  const origin = creature.itemOrigin;
  const relatedCards = (inventory?.companions || []).filter(card => card.creatureId === creature.id
    || normalized(card.name) === normalized(creature.name));
  const relatedItems = (inventory?.items || []).filter(item => item.creatureId === creature.id
    || item.id === origin.inventoryItemId || item.instanceId === origin.instanceId
    || (companionItem(item) && normalized(item.name) === normalized(creature.name)));
  if (relatedCards.length > 1 || relatedItems.length > 1) throw new Error(`Mehrdeutige bestehende Inventarbindung: ${creature.name}`);
  if (relatedItems.some(item => item.ownerCharacterId && item.ownerCharacterId !== ownerId)) {
    throw new Error(`Abweichender Inventarbesitzer: ${creature.name}`);
  }
  const cards = (inventory?.companions || []).filter(card => card.creatureId === creature.id
    && card.inventoryItemId === origin.inventoryItemId);
  const items = (inventory?.items || []).filter(item => item.creatureId === creature.id
    && item.id === origin.inventoryItemId && (item.instanceId || item.id) === origin.instanceId);
  return origin.ownerCharacterId === ownerId && cards.length === 1 && items.length === 1;
}

function ensurePetConnection(biography, creature) {
  const connections = biography.connections || [];
  if (connections.some(row => row.type !== 'heading' && normalized(row.name) === normalized(creature.name))) return;
  if (!connections.some(row => row.type === 'heading' && /tier|begleit|gefähr/i.test(row.title || ''))) {
    connections.push({ type: 'heading', title: 'Tierische Begleiter', detail: '' });
  }
  connections.push({ type: 'connection', name: creature.name, detail: creature.species,
    image: creature.portrait, imageFormat: 'portrait' });
  biography.connections = connections;
}

function planCharacter(character, options) {
  const { assetMap, existingCreatures, now } = options;
  if (!character.biography?.biography) throw new Error(`Aktuelle Biografie fehlt: ${character.id}`);
  const biography = structuredClone(character.biography);
  const icons = planPatrickBiographyIcons(character.id, biography.biography.abilities || [], assetMap);
  if (icons.assignments.length) biography.biography.abilities = icons.abilities;
  let inventory = character.inventory;
  const creatures = [], companionLinks = [];
  for (const spec of getPatrickBiographyPetSpecs(character.id)) {
    const existing = selectExistingCompanion(spec, character, existingCreatures);
    const namedCards = (inventory?.companions || []).filter(card => normalized(card.name) === normalized(spec.name));
    const namedItems = (inventory?.items || []).filter(item => companionItem(item) && normalized(item.name) === normalized(spec.name));
    if (!existing && (namedCards.some(card => card.creatureId || card.inventoryItemId) || namedItems.length)) {
      throw new Error(`Verknüpfte Kreatur wurde nicht vollständig eingelesen: ${spec.name}`);
    }
    const creature = existing || createPatrickBiographyCompanion(spec, character, now, assetMap);
    if (!alreadyLinked(inventory, creature, character.id)) {
      // The shared inventory factory deliberately uses exact display names. Do not
      // silently rename an authored card or create a duplicate for a spelling variant.
      if (namedCards.some(card => card.name !== creature.name)) {
        throw new Error(`Abweichende Schreibweise einer bestehenden Gefährtenkarte: ${spec.name}`);
      }
      inventory = attachCreatureToInventory({ ...character, inventory }, creature, now);
    }
    ensurePetConnection(biography.biography, creature);
    if (!existing) creatures.push(creature);
    companionLinks.push({ creatureId: creature.id, ownerCharacterId: character.id, name: creature.name,
      inventoryItemId: creature.itemOrigin.inventoryItemId, instanceId: creature.itemOrigin.instanceId,
      action: existing ? 'reuse-existing' : 'create-missing', bestiaryReference: creature.bestiaryReference });
  }
  const patch = {};
  if (!isDeepStrictEqual(biography, character.biography)) {
    patch.biography = { ...biography, revision: nextRevision(character.biography.revision, now) };
  }
  if (!isDeepStrictEqual(inventory, character.inventory)) {
    patch.inventory = { ...inventory, revision: nextRevision(character.inventory?.revision, now) };
  }
  if (Object.keys(patch).length) patch.updatedAt = now;
  return { id: character.id, patch, creatures, companionLinks, pending: icons.pending, iconAssignments: icons.assignments };
}

// Pure field-limited plan. A separate guarded publisher must reread the live documents.
// No normalization of stored biography prose and no combat/image-library/genealogy writes.
export function planPatrickBiographies({ characters, existingCreatures = [], assetMap = {}, now, gwenCharacterId = '' }) {
  if (!Array.isArray(characters) || !Array.isArray(existingCreatures) || !Number.isFinite(Date.parse(now))) {
    throw new Error('Aktuelle Personen, Kreaturen und ein gültiger Planzeitpunkt sind erforderlich.');
  }
  const allowed = new Set(patrickBiographyCharacterIds(gwenCharacterId));
  const seen = new Set();
  for (const character of characters) {
    if (!allowed.has(character.id) || seen.has(character.id)) throw new Error('Unbekannte oder doppelte Person außerhalb des geprüften Biografieumfangs.');
    seen.add(character.id);
  }
  const plans = characters.map(character => planCharacter(character, { assetMap, existingCreatures, now, gwenCharacterId }));
  const deferred = !seen.has(GWEN_CHARACTER_ID)
    ? PATRICK_BIOGRAPHY_PETS.filter(spec => spec.ownerId === GWEN_CHARACTER_ID).map(spec =>
      ({ kind: 'missing-pet-owner-document', name: spec.name, ownerCharacterId: GWEN_CHARACTER_ID, ownerName: 'Gwen Hamnett' })) : [];
  return { characters: plans.map(({ creatures, ...plan }) => plan), creatures: plans.flatMap(plan => plan.creatures),
    pending: [...plans.flatMap(plan => plan.pending), ...deferred] };
}
