import '../image-library/image-library-model.js?v=20260919-creature-pages-v1';

export const CREATURE_IMAGE_LIBRARY = globalThis.AleriaCharacterImageSets;
export const MAX_CREATURE_AVATARS = CREATURE_IMAGE_LIBRARY.avatarLimit;

export function normalizeCreatureImages(source = {}) {
  const avatars = Array.isArray(source.avatars) ? source.avatars : (source.emotes || []);
  const imageSets = CREATURE_IMAGE_LIBRARY.normalize({ ...source, entityType: 'creature', emotes: avatars });
  const standard = imageSets[0];
  return {
    imageSetSchemaVersion: CREATURE_IMAGE_LIBRARY.schemaVersion,
    imageSets,
    activeImageSetId: imageSets.some(set => set.id === source.activeImageSetId) ? source.activeImageSetId : standard.id,
    portrait: standard.portrait || '',
    avatars: standard.emotes.map((avatar, index) => ({ ...avatar, id: avatar.id || `avatar-${index + 1}` }))
  };
}

export function getCreatureImageSet(creature) {
  return creature.imageSets.find(set => set.id === creature.activeImageSetId) || creature.imageSets[0];
}

export function updateCreatureImageSet(creature, updates) {
  const active = getCreatureImageSet(creature);
  if (JSON.stringify(updates) === JSON.stringify(Object.fromEntries(Object.keys(updates).map(key => [key, active[key]])))) return creature;
  Object.assign(active, updates, { updatedAt: new Date().toISOString() });
  active.createdAt ||= active.updatedAt;
  Object.assign(creature, normalizeCreatureImages(creature));
  return creature;
}
