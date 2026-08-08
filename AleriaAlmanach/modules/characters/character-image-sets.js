// Character image-set model.
// Keeps legacy portrait/emotes fields compatible while allowing named visual sets.

const CHARACTER_IMAGE_SET_SCHEMA_VERSION = 1;
const CHARACTER_IMAGE_SET_DEFAULT_ID = 'standard';
const CHARACTER_IMAGE_SET_LIMIT = 20;
const CHARACTER_IMAGE_SET_NAME_LIMIT = 60;
const CHARACTER_IMAGE_SET_EMOTE_LIMIT = 80;

function normalizeCharacterImageSetText(value, maximum = CHARACTER_IMAGE_SET_NAME_LIMIT) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function normalizeCharacterImageSetImageUrl(value) {
  const raw = String(value || '').trim();
  if (!raw || /^data:/i.test(raw)) return null;
  return sanitizeImageSrc(raw) ? raw : null;
}

function normalizeCharacterImageSetId(value, fallback = 'set') {
  const normalized = String(value || fallback)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return normalized || fallback;
}

function normalizeCharacterImageSetEmotes(emotes, limit = CHARACTER_IMAGE_SET_EMOTE_LIMIT) {
  const seen = new Set();
  return (Array.isArray(emotes) ? emotes : [])
    .map(emote => ({
      img: normalizeCharacterImageSetImageUrl(emote?.img || emote?.url || ''),
      label: normalizeCharacterImageSetText(emote?.label || emote?.name || '', 20)
    }))
    .filter(emote => {
      if (!emote.img || seen.has(emote.img)) return false;
      seen.add(emote.img);
      return true;
    })
    .slice(0, limit);
}

function createCharacterImageSetId(name, occupiedIds = []) {
  const occupied = new Set(Array.from(occupiedIds || [], value => String(value || '')));
  const base = normalizeCharacterImageSetId(name, 'set');
  let candidate = base;
  let suffix = 2;
  while (occupied.has(candidate) || candidate === CHARACTER_IMAGE_SET_DEFAULT_ID) {
    candidate = `${base}-${suffix}`.slice(0, 48);
    suffix += 1;
  }
  return candidate;
}

function normalizeCharacterImageSetRecord(source = {}, index = 0, occupiedIds = new Set()) {
  const requestedId = index === 0 && String(source?.id || '') === CHARACTER_IMAGE_SET_DEFAULT_ID
    ? CHARACTER_IMAGE_SET_DEFAULT_ID
    : normalizeCharacterImageSetId(source?.id || source?.name, `set-${index + 1}`);
  let id = requestedId;
  let suffix = 2;
  while (occupiedIds.has(id)) {
    id = `${requestedId}-${suffix}`.slice(0, 48);
    suffix += 1;
  }
  occupiedIds.add(id);
  return {
    id,
    name: id === CHARACTER_IMAGE_SET_DEFAULT_ID
      ? 'Standard'
      : (normalizeCharacterImageSetText(source?.name) || `Set ${index + 1}`),
    portrait: normalizeCharacterImageSetImageUrl(source?.portrait || '') || null,
    emotes: normalizeCharacterImageSetEmotes(source?.emotes),
    createdAt: normalizeCharacterImageSetText(source?.createdAt, 40),
    updatedAt: normalizeCharacterImageSetText(source?.updatedAt, 40)
  };
}

function normalizeCharacterImageSets(character = {}) {
  const legacyPortrait = normalizeCharacterImageSetImageUrl(character?.portrait || '') || null;
  const legacyEmotes = normalizeCharacterImageSetEmotes(character?.emotes);
  const rawSets = Array.isArray(character?.imageSets) ? character.imageSets.filter(Boolean) : [];
  const standardSource = rawSets.find(set => String(set?.id || '') === CHARACTER_IMAGE_SET_DEFAULT_ID);
  const otherSources = rawSets.filter(set => set !== standardSource);
  const occupiedIds = new Set();
  const standard = normalizeCharacterImageSetRecord({
    ...(standardSource || {}),
    id: CHARACTER_IMAGE_SET_DEFAULT_ID,
    name: 'Standard',
    portrait: standardSource?.portrait || legacyPortrait,
    emotes: Array.isArray(standardSource?.emotes) && standardSource.emotes.length
      ? standardSource.emotes
      : legacyEmotes
  }, 0, occupiedIds);
  const sets = [standard];
  otherSources.slice(0, CHARACTER_IMAGE_SET_LIMIT - 1).forEach((source, index) => {
    sets.push(normalizeCharacterImageSetRecord(source, index + 1, occupiedIds));
  });
  return sets;
}

function getCharacterImageSet(character = {}, setId = CHARACTER_IMAGE_SET_DEFAULT_ID) {
  const sets = normalizeCharacterImageSets(character);
  const requestedId = String(setId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  return sets.find(set => set.id === requestedId) || sets[0];
}

function getCharacterImageSetPresentation(character = {}, setId = CHARACTER_IMAGE_SET_DEFAULT_ID) {
  const set = getCharacterImageSet(character, setId);
  return {
    imageSetId: set.id,
    imageSetName: set.name,
    portrait: set.portrait || null,
    emotes: set.emotes.map(emote => ({ ...emote }))
  };
}

function applyCharacterImageSetPresentation(character = {}, setId = CHARACTER_IMAGE_SET_DEFAULT_ID) {
  const presentation = getCharacterImageSetPresentation(character, setId);
  return {
    ...character,
    portrait: presentation.portrait,
    emotes: presentation.emotes,
    selectedImageSetId: presentation.imageSetId,
    selectedImageSetName: presentation.imageSetName
  };
}

function buildCharacterImageSetStorage(imageSets = []) {
  const normalized = normalizeCharacterImageSets({ imageSets });
  const now = new Date().toISOString();
  return normalized.map(set => ({
    ...set,
    createdAt: set.createdAt || now,
    // Serialisieren ist keine Bearbeitung. Der Zeitstempel wird vom Editor nur dann
    // erneuert, wenn sich Name, Portrait oder Emotes des Sets wirklich aendern.
    updatedAt: set.updatedAt || set.createdAt || now
  }));
}

function buildCharacterImageLibraryStorage(character = {}) {
  const imageSets = buildCharacterImageSetStorage(normalizeCharacterImageSets(character));
  const standard = imageSets.find(set => set.id === CHARACTER_IMAGE_SET_DEFAULT_ID) || imageSets[0];
  const requestedActiveId = String(character?.activeImageSetId || CHARACTER_IMAGE_SET_DEFAULT_ID);
  return {
    imageSetSchemaVersion: CHARACTER_IMAGE_SET_SCHEMA_VERSION,
    imageSets,
    activeImageSetId: imageSets.some(set => set.id === requestedActiveId)
      ? requestedActiveId
      : CHARACTER_IMAGE_SET_DEFAULT_ID,
    portrait: standard?.portrait || null,
    emotes: (standard?.emotes || []).map(emote => ({ ...emote })),
    emotesOverride: true,
    imageSetsOverride: true
  };
}

window.AleriaCharacterImageSets = Object.freeze({
  schemaVersion: CHARACTER_IMAGE_SET_SCHEMA_VERSION,
  defaultId: CHARACTER_IMAGE_SET_DEFAULT_ID,
  limit: CHARACTER_IMAGE_SET_LIMIT,
  normalizeImageUrl: normalizeCharacterImageSetImageUrl,
  normalize: normalizeCharacterImageSets,
  get: getCharacterImageSet,
  getPresentation: getCharacterImageSetPresentation,
  applyPresentation: applyCharacterImageSetPresentation,
  createId: createCharacterImageSetId,
  buildStorage: buildCharacterImageSetStorage,
  prepareStorage: buildCharacterImageLibraryStorage
});
