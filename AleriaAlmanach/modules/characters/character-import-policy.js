// Verlustschutz fuer Medienbibliotheken bei einem vollstaendigen Charakterimport.
// Profildaten und Mechanik werden durch den Import ersetzt; Bilder und Emotes werden dagegen
// vereinigt, weil eine aeltere Exportdatei keine spaeter angelegten Sets stillschweigend loeschen
// darf. Bewusste Loeschungen bleiben Aufgabe des Bildset-Editors und normaler Speichervorgaenge.

// Muss dem Editor-Limit in character-image-sets.js entsprechen. Ein niedrigeres Importlimit
// würde beim Vollimport trotz Verlustschutz die hinteren, bereits gespeicherten Sets abschneiden.
const CHARACTER_IMPORT_IMAGE_SET_LIMIT = 20;
const CHARACTER_IMPORT_EMOTE_LIMIT = 80;

function cloneImportValue(value) {
  if (value == null || typeof value !== 'object') return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function importText(value) {
  return String(value ?? '').trim();
}

function imageSetKey(set, index = 0) {
  return importText(set?.id) || importText(set?.name).toLocaleLowerCase('de') || `set-${index + 1}`;
}

function emoteKey(emote) {
  return importText(emote?.img || emote?.url);
}

function mergeEmoteLibraries(currentEmotes, incomingEmotes) {
  const merged = [];
  const indexes = new Map();
  const append = (emote, preferIncoming = false) => {
    const key = emoteKey(emote);
    if (!key) return;
    const copy = { ...cloneImportValue(emote), img: key };
    delete copy.url;
    if (!indexes.has(key)) {
      indexes.set(key, merged.length);
      merged.push(copy);
      return;
    }
    if (preferIncoming) {
      const index = indexes.get(key);
      merged[index] = { ...merged[index], ...copy };
    }
  };
  (Array.isArray(currentEmotes) ? currentEmotes : []).forEach(emote => append(emote));
  (Array.isArray(incomingEmotes) ? incomingEmotes : []).forEach(emote => append(emote, true));
  return merged.slice(0, CHARACTER_IMPORT_EMOTE_LIMIT);
}

function getImageSets(character = {}) {
  const sets = Array.isArray(character?.imageSets)
    ? character.imageSets.filter(set => set && typeof set === 'object').map(cloneImportValue)
    : [];
  if (sets.length) return sets;
  const emotes = Array.isArray(character?.emotes) ? character.emotes : [];
  if (!importText(character?.portrait) && !emotes.length) return [];
  return [{
    id: 'standard',
    name: 'Standard',
    portrait: importText(character?.portrait) || null,
    emotes: cloneImportValue(emotes)
  }];
}

function mergeImageSet(currentSet = {}, incomingSet = {}) {
  return {
    ...cloneImportValue(currentSet),
    ...cloneImportValue(incomingSet),
    portrait: importText(incomingSet?.portrait) || importText(currentSet?.portrait) || null,
    emotes: mergeEmoteLibraries(currentSet?.emotes, incomingSet?.emotes)
  };
}

export function mergeCharacterImageLibrary(currentCharacter, incomingCharacter, options = {}) {
  const incoming = cloneImportValue(incomingCharacter && typeof incomingCharacter === 'object' ? incomingCharacter : {});
  if (options.replaceImageLibrary === true) return incoming;

  const currentSets = getImageSets(currentCharacter);
  if (!currentSets.length) return incoming;
  const incomingSets = getImageSets(incoming);
  const currentByKey = new Map(currentSets.map((set, index) => [imageSetKey(set, index), set]));
  const consumed = new Set();
  const mergedSets = incomingSets.map((set, index) => {
    const key = imageSetKey(set, index);
    consumed.add(key);
    return mergeImageSet(currentByKey.get(key), set);
  });
  currentSets.forEach((set, index) => {
    const key = imageSetKey(set, index);
    if (!consumed.has(key)) mergedSets.push(cloneImportValue(set));
  });

  const limitedSets = mergedSets.slice(0, CHARACTER_IMPORT_IMAGE_SET_LIMIT);
  const standard = limitedSets.find(set => importText(set?.id) === 'standard') || limitedSets[0];
  const validSetIds = new Set(limitedSets.map((set, index) => imageSetKey(set, index)));
  const incomingActive = importText(incoming.activeImageSetId);
  const currentActive = importText(currentCharacter?.activeImageSetId);

  return {
    ...incoming,
    imageSetSchemaVersion: Number(incoming.imageSetSchemaVersion || currentCharacter?.imageSetSchemaVersion) || 1,
    imageSets: limitedSets,
    activeImageSetId: validSetIds.has(incomingActive)
      ? incomingActive
      : (validSetIds.has(currentActive) ? currentActive : importText(standard?.id) || 'standard'),
    portrait: importText(standard?.portrait) || null,
    emotes: cloneImportValue(Array.isArray(standard?.emotes) ? standard.emotes : []),
    emotesOverride: true,
    imageSetsOverride: true
  };
}
