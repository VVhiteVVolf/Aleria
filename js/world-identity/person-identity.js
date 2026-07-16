function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizePersonName(value) {
  return cleanText(value)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function extractBirthYear(value) {
  if (Number.isInteger(value)) return value;
  const text = cleanText(String(value ?? ''));
  if (!text || /^\?+$/.test(text)) return null;
  const match = text.match(/(?:^|[^\d])(-?\d{1,5})(?!\d)/);
  if (!match) return null;
  const year = Number(match[1]);
  return Number.isInteger(year) ? year : null;
}

function cleanSource(source = {}) {
  return {
    familyId: cleanText(source.familyId),
    personId: cleanText(source.personId),
    releaseId: cleanText(source.releaseId),
    publishedAt: cleanText(source.publishedAt),
    importedAt: cleanText(source.importedAt),
    lastSyncedAt: cleanText(source.lastSyncedAt),
    url: cleanText(source.url),
    fingerprint: cleanText(source.fingerprint)
  };
}

export function normalizeCharacterIdentity(identity = {}) {
  return {
    worldPersonId: cleanText(identity?.worldPersonId)
  };
}

export function normalizeCharacterGenealogy(genealogy = {}) {
  const sources = Array.isArray(genealogy?.sources)
    ? genealogy.sources.map(cleanSource).filter(source => source.familyId && source.personId)
    : [];
  const relationships = genealogy?.relationships && typeof genealogy.relationships === 'object'
    ? genealogy.relationships
    : {};
  return {
    worldPersonId: cleanText(genealogy?.worldPersonId),
    sex: cleanText(genealogy?.sex),
    status: cleanText(genealogy?.status),
    birth: cleanText(String(genealogy?.birth ?? '')),
    death: cleanText(String(genealogy?.death ?? '')),
    houseId: cleanText(genealogy?.houseId),
    houseName: cleanText(genealogy?.houseName),
    familyRole: cleanText(genealogy?.familyRole),
    portraitPlaceholder: cleanText(genealogy?.portraitPlaceholder),
    tags: Array.isArray(genealogy?.tags) ? genealogy.tags.map(cleanText).filter(Boolean) : [],
    sources,
    relationships: {
      parents: Array.isArray(relationships.parents) ? relationships.parents.filter(Boolean) : [],
      partners: Array.isArray(relationships.partners) ? relationships.partners.filter(Boolean) : [],
      children: Array.isArray(relationships.children) ? relationships.children.filter(Boolean) : []
    }
  };
}

export function getCharacterWorldPersonId(character = {}) {
  return cleanText(character?.identity?.worldPersonId)
    || cleanText(character?.genealogy?.worldPersonId);
}

function characterBirthYear(character = {}) {
  return extractBirthYear(character?.genealogy?.birth ?? character?.birth ?? character?.birthYear);
}

function characterNameKeys(character = {}) {
  return [character?.name, ...(Array.isArray(character?.aliases) ? character.aliases : [])]
    .map(normalizePersonName)
    .filter(Boolean);
}

function hasSourceLink(character, candidate) {
  return (character?.genealogy?.sources || []).some(source => (
    cleanText(source?.familyId) === candidate.familyId
    && cleanText(source?.personId) === candidate.personId
  ));
}

function rankCharacterMatch(candidate, character) {
  const characterId = cleanText(character?.id);
  const worldPersonId = getCharacterWorldPersonId(character);
  const candidateWorldPersonId = cleanText(candidate?.worldPersonId);
  if (worldPersonId && worldPersonId === candidateWorldPersonId) {
    return { kind: 'linked', score: 100, character, characterId, reason: 'Gleiche feste Personen-ID' };
  }
  if (hasSourceLink(character, candidate)) {
    return { kind: 'linked', score: 99, character, characterId, reason: 'Bereits mit diesem Stammbaumeintrag verknüpft' };
  }

  const candidateName = normalizePersonName(candidate.displayName);
  if (candidateName.split(' ').filter(Boolean).length < 2) return null;
  const namesMatch = candidateName && characterNameKeys(character).includes(candidateName);
  if (!namesMatch) return null;

  const sourceYear = extractBirthYear(candidate.birthYear ?? candidate.birth);
  const existingYear = characterBirthYear(character);
  if (sourceYear !== null && existingYear !== null) {
    if (sourceYear === existingYear) {
      if (worldPersonId && candidateWorldPersonId && worldPersonId !== candidateWorldPersonId) {
        return {
          kind: 'conflict',
          score: 45,
          character,
          characterId,
          reason: 'Name und Geburtsjahr stimmen, aber die festen Personen-IDs widersprechen sich'
        };
      }
      return {
        kind: 'probable',
        score: 90,
        character,
        characterId,
        reason: `Gleicher Vor- und Nachname sowie Geburtsjahr ${sourceYear}`
      };
    }
    return {
      kind: 'conflict',
      score: 35,
      character,
      characterId,
      reason: `Gleicher Name, aber abweichende Geburtsjahre (${sourceYear} / ${existingYear})`
    };
  }

  return {
    kind: 'name-only',
    score: 55,
    character,
    characterId,
    reason: 'Gleicher Vor- und Nachname; mindestens ein Geburtsjahr fehlt'
  };
}

export function findBestCharacterMatch(candidate, characters = []) {
  return (Array.isArray(characters) ? characters : [])
    .map(character => rankCharacterMatch(candidate, character))
    .filter(Boolean)
    .sort((first, second) => second.score - first.score)[0] || null;
}

export const CHARACTER_IDENTITY_MATCH = Object.freeze({
  linked: 'linked',
  probable: 'probable',
  nameOnly: 'name-only',
  conflict: 'conflict'
});
