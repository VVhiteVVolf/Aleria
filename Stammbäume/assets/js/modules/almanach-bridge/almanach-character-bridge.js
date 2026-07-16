import {
  buildFamilyPersonDisplayName,
  findPersonHouse,
  getHouseSurname
} from '../../../../../js/world-identity/family-person-names.js';
import {
  extractBirthYear,
  findBestCharacterMatch,
  getCharacterWorldPersonId,
  normalizeCharacterGenealogy,
  normalizePersonName
} from '../../../../../js/world-identity/person-identity.js';

const FAMILY_ROLE_IDS = new Set(['core', 'married', 'bastard', 'affair', 'forced', 'ward', 'fostered-away', 'adopted']);

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function identitySlug(value, fallback) {
  return normalizePersonName(value).replace(/\s+/g, '-') || fallback;
}

function primaryHouse(family) {
  return (family?.houses || []).find(house => house.id === family?.lineage?.houseId)
    || family?.houses?.[0]
    || null;
}

function characterWorldPersonId(character) {
  return getCharacterWorldPersonId(character)
    || 'person--almanach--' + identitySlug(character?.id, 'character');
}

function characterAsIdentityCandidate(character, family) {
  const genealogy = normalizeCharacterGenealogy(character?.genealogy);
  return {
    familyId: family?.document?.id || '',
    personId: '',
    displayName: cleanText(character?.name),
    birth: genealogy.birth,
    birthYear: extractBirthYear(genealogy.birth),
    worldPersonId: getCharacterWorldPersonId(character)
  };
}

function treePersonAsCharacter(family, person) {
  return {
    id: person.id,
    name: buildFamilyPersonDisplayName(family, person),
    identity: { worldPersonId: person.worldPersonId || '' },
    genealogy: {
      birth: person.birth || '',
      houseId: person.houseId || '',
      houseName: findPersonHouse(family, person)?.name || '',
      sources: []
    },
    treePerson: person
  };
}

function houseRelevance(family, character) {
  const house = primaryHouse(family);
  const houseName = cleanText(house?.name || family?.document?.title);
  const surname = normalizePersonName(getHouseSurname(houseName));
  const genealogy = normalizeCharacterGenealogy(character?.genealogy);
  const characterHouse = normalizePersonName(genealogy.houseName);
  const characterName = normalizePersonName(character?.name);
  const faction = normalizePersonName(character?.fraktion || character?.faction);
  const taxonomy = normalizePersonName(character?.taxonomyPath);
  if (genealogy.houseId && house?.id === genealogy.houseId) {
    return { score: 105, reason: 'Feste Haus-ID ' + houseName };
  }
  if (characterHouse && normalizePersonName(houseName) === characterHouse) {
    return { score: 100, reason: 'Hauszugehörigkeit ' + houseName };
  }
  if (surname && (characterName === surname || characterName.endsWith(' ' + surname))) {
    return { score: 90, reason: 'Familienname ' + getHouseSurname(houseName) };
  }
  if (surname && faction.includes(surname)) return { score: 65, reason: 'Passende Fraktion oder Zugehörigkeit' };
  if (surname && taxonomy.includes(surname)) return { score: 55, reason: 'Passender Almanach-Hierarchiepfad' };
  return { score: 0, reason: '' };
}

export function createAlmanachHouseCandidates(family, characters = []) {
  const treePeople = (family?.persons || []).map(person => treePersonAsCharacter(family, person));
  return (Array.isArray(characters) ? characters : [])
    .filter(character => character?.id && character?.name && !character.archived)
    .map(character => {
      const genealogy = normalizeCharacterGenealogy(character.genealogy);
      const identityCandidate = characterAsIdentityCandidate(character, family);
      const match = findBestCharacterMatch(identityCandidate, treePeople);
      const relevance = houseRelevance(family, character);
      return Object.freeze({
        character,
        genealogy,
        worldPersonId: characterWorldPersonId(character),
        hasStoredWorldPersonId: !!getCharacterWorldPersonId(character),
        birthYear: identityCandidate.birthYear,
        match,
        relevanceScore: match?.kind === 'linked' ? Math.max(110, relevance.score) : relevance.score,
        relevanceReason: relevance.reason,
        isHouseRelevant: relevance.score > 0 || !!match
      });
    })
    .sort((first, second) => (
      Number(second.match?.kind === 'linked') - Number(first.match?.kind === 'linked')
      || Number(second.match?.kind === 'probable') - Number(first.match?.kind === 'probable')
      || second.relevanceScore - first.relevanceScore
      || first.character.name.localeCompare(second.character.name, 'de', { sensitivity: 'base' })
    ));
}

function mapCharacterStatus(status, death) {
  if (status === 'dead' || death) return 'dead';
  if (status === 'missing') return 'missing';
  if (status === 'active') return 'alive';
  return 'unknown';
}

function matchingHouseId(family, candidate) {
  const direct = (family.houses || []).find(house => house.id === candidate.genealogy.houseId);
  if (direct) return direct.id;
  const genealogyHouse = normalizePersonName(candidate.genealogy.houseName);
  const exact = (family.houses || []).find(house => normalizePersonName(house.name) === genealogyHouse);
  if (exact) return exact.id;
  return candidate.isHouseRelevant ? primaryHouse(family)?.id || '' : '';
}

export function createTreePersonFromAlmanach(family, candidate) {
  const genealogy = candidate.genealogy;
  const familyRole = FAMILY_ROLE_IDS.has(genealogy.familyRole)
    ? genealogy.familyRole
    : candidate.isHouseRelevant ? 'core' : 'married';
  return {
    worldPersonId: candidate.worldPersonId,
    name: cleanText(candidate.character.name),
    title: cleanText(candidate.character.title),
    sex: ['female', 'male'].includes(genealogy.sex) ? genealogy.sex : 'unknown',
    status: mapCharacterStatus(candidate.character.status, genealogy.death),
    birth: genealogy.birth,
    death: genealogy.death,
    portrait: cleanText(candidate.character.portrait),
    portraitPlaceholder: ['female', 'male', 'child', 'unknown'].includes(genealogy.portraitPlaceholder)
      ? genealogy.portraitPlaceholder
      : 'auto',
    houseId: matchingHouseId(family, candidate),
    familyRole,
    tags: [...new Set(['Almanach-Charakter', ...(genealogy.tags || [])])],
    notes: ''
  };
}

export function getCandidateLifeLabel(candidate) {
  const birth = candidate.genealogy.birth || '????';
  const death = candidate.genealogy.death || (candidate.character.status === 'active' ? 'lebend' : '????');
  return birth + ' – ' + death;
}
