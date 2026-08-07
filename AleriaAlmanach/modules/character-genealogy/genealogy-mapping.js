import {
  extractBirthYear,
  normalizeCharacterGenealogy,
  normalizeCharacterIdentity,
  normalizePersonName
} from './person-identity.js';
import {
  buildFamilyPersonDisplayName,
  findPersonHouse
} from '../../../js/world-identity/family-person-names.js';

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Portraitpfade der Stammbaumdaten sind relativ zum Stammbäume-Ordner hinterlegt
// und müssen für den Almanach auf dessen Nachbarpfad umgebogen werden.
function resolveTreeAssetPath(value) {
  const source = cleanText(value);
  if (!source) return '';
  if (/^assets\//i.test(source)) return `../Stammbäume/${source}`;
  return source;
}

function identitySlug(value, fallback) {
  return normalizePersonName(value).replace(/\s+/g, '-') || fallback;
}

export { buildFamilyPersonDisplayName };

function createWorldPersonId(familyId, person) {
  return cleanText(person?.worldPersonId)
    || cleanText(person?.extensions?.identity?.worldPersonId)
    || `person--${identitySlug(familyId, 'family-tree')}--${identitySlug(person?.id, 'person')}`;
}

function relationNames(family, personId) {
  const people = new Map((family?.persons || []).map(person => [person.id, person]));
  const references = entries => [...new Map(entries.map(entry => [entry.personId, entry])).values()]
    .map(entry => {
      const person = people.get(entry.personId);
      return person ? {
        ...entry,
        worldPersonId: createWorldPersonId(family.document?.id, person),
        name: buildFamilyPersonDisplayName(family, person)
      } : null;
    })
    .filter(Boolean);
  const parents = (family?.parentages || [])
    .filter(parentage => parentage.childId === personId)
    .flatMap(parentage => (parentage.parentIds || []).map(parentId => ({
      personId: parentId,
      type: parentage.type,
      legitimacy: parentage.legitimacy,
      certainty: parentage.certainty
    })));
  const children = (family?.parentages || [])
    .filter(parentage => (parentage.parentIds || []).includes(personId))
    .map(parentage => ({
      personId: parentage.childId,
      type: parentage.type,
      legitimacy: parentage.legitimacy,
      certainty: parentage.certainty
    }));
  const partners = (family?.partnerships || [])
    .filter(partnership => (partnership.participantIds || []).includes(personId))
    .flatMap(partnership => (partnership.participantIds || [])
      .filter(id => id !== personId)
      .map(partnerId => ({
        personId: partnerId,
        type: partnership.type,
        status: partnership.status,
        certainty: partnership.certainty
      })));
  return {
    parents: references(parents),
    partners: references(partners),
    children: references(children)
  };
}

function sourceFingerprint(candidate) {
  return JSON.stringify({
    name: candidate.displayName,
    title: candidate.title,
    birth: candidate.birth,
    death: candidate.death,
    sex: candidate.sex,
    status: candidate.status,
    houseId: candidate.houseId,
    portrait: candidate.portrait,
    portraitPlaceholder: candidate.portraitPlaceholder,
    tags: candidate.tags,
    relationships: candidate.relationships
  });
}

export function createFamilyPersonCandidate(record, person) {
  const family = record?.family || {};
  const familyId = cleanText(record?.id || family.document?.id);
  const house = findPersonHouse(family, person);
  const candidate = {
    familyId,
    familyTitle: cleanText(record?.title || family.document?.title),
    folderPath: Array.isArray(record?.folderPath) ? record.folderPath.filter(Boolean) : [],
    releaseId: cleanText(record?.releaseId),
    publishedAt: cleanText(record?.publishedAt),
    source: cleanText(record?.source),
    personId: cleanText(person?.id),
    worldPersonId: createWorldPersonId(familyId, person),
    displayName: buildFamilyPersonDisplayName(family, person),
    recordedName: cleanText(person?.name),
    title: cleanText(person?.title),
    sex: cleanText(person?.sex) || 'unknown',
    status: cleanText(person?.status) || 'unknown',
    birth: cleanText(String(person?.birth ?? '')),
    death: cleanText(String(person?.death ?? '')),
    portrait: resolveTreeAssetPath(person?.portrait),
    portraitPlaceholder: cleanText(person?.portraitPlaceholder),
    houseId: cleanText(person?.houseId),
    houseName: cleanText(house?.name),
    familyRole: cleanText(person?.familyRole),
    tags: Array.isArray(person?.tags) ? person.tags.filter(Boolean) : [],
    relationships: relationNames(family, person?.id)
  };
  candidate.birthYear = extractBirthYear(candidate.birth);
  candidate.fingerprint = sourceFingerprint(candidate);
  return Object.freeze(candidate);
}

export function createFamilyCandidates(record) {
  return (record?.family?.persons || []).map(person => createFamilyPersonCandidate(record, person));
}

function mapFamilyStatus(status) {
  if (status === 'alive') return 'active';
  if (status === 'dead') return 'dead';
  if (status === 'missing') return 'missing';
  return 'unknown';
}

export function buildFamilyPersonViewUrl(candidate) {
  const query = new URLSearchParams({
    family: candidate.familyId,
    mode: 'view',
    person: candidate.personId
  });
  return `../Stammbäume/Stammbaum.html?${query.toString()}`;
}

function buildSource(candidate, now) {
  return {
    familyId: candidate.familyId,
    personId: candidate.personId,
    releaseId: candidate.releaseId,
    publishedAt: candidate.publishedAt,
    importedAt: now,
    lastSyncedAt: now,
    url: buildFamilyPersonViewUrl(candidate),
    fingerprint: candidate.fingerprint
  };
}

function mergeSources(existingSources, source) {
  const sources = (Array.isArray(existingSources) ? existingSources : [])
    .filter(item => item?.familyId && item?.personId);
  const index = sources.findIndex(item => item.familyId === source.familyId && item.personId === source.personId);
  if (index >= 0) sources[index] = { ...sources[index], ...source, importedAt: sources[index].importedAt || source.importedAt };
  else sources.push(source);
  return sources;
}

export function buildImportedCharacter(candidate, existing = null, now = new Date().toISOString()) {
  const prior = existing && typeof existing === 'object' ? existing : {};
  const priorGenealogy = normalizeCharacterGenealogy(prior.genealogy);
  const source = buildSource(candidate, now);
  const genealogy = normalizeCharacterGenealogy({
    ...priorGenealogy,
    worldPersonId: candidate.worldPersonId,
    sex: priorGenealogy.sex || candidate.sex,
    status: priorGenealogy.status || candidate.status,
    birth: priorGenealogy.birth || candidate.birth,
    death: priorGenealogy.death || candidate.death,
    houseId: priorGenealogy.houseId || candidate.houseId,
    houseName: priorGenealogy.houseName || candidate.houseName,
    familyRole: priorGenealogy.familyRole || candidate.familyRole,
    portraitPlaceholder: priorGenealogy.portraitPlaceholder || candidate.portraitPlaceholder,
    tags: priorGenealogy.tags.length ? priorGenealogy.tags : candidate.tags,
    sources: mergeSources(priorGenealogy.sources, source),
    relationships: candidate.relationships
  });
  return {
    name: cleanText(prior.name) || candidate.displayName,
    title: cleanText(prior.title) || candidate.title,
    fraktion: cleanText(prior.fraktion || prior.faction) || candidate.houseName,
    role: cleanText(prior.role),
    status: cleanText(prior.status) || mapFamilyStatus(candidate.status),
    relevance: cleanText(prior.relevance),
    taxonomyPath: cleanText(prior.taxonomyPath) || candidate.folderPath.join(' > '),
    currentLocation: cleanText(prior.currentLocation),
    origin: cleanText(prior.origin),
    plotNode: cleanText(prior.plotNode),
    profileLink: cleanText(prior.profileLink),
    playerOwner: cleanText(prior.playerOwner),
    bio: cleanText(prior.bio),
    aliases: Array.isArray(prior.aliases) ? prior.aliases : [],
    archived: !!prior.archived,
    createdAt: cleanText(prior.createdAt) || now,
    updatedAt: now,
    portrait: cleanText(prior.portrait) || candidate.portrait || null,
    emotes: Array.isArray(prior.emotes) ? prior.emotes : [],
    emotesOverride: !!prior.emotesOverride,
    imageSetSchemaVersion: Number(prior.imageSetSchemaVersion) || 0,
    imageSets: Array.isArray(prior.imageSets) ? prior.imageSets : [],
    activeImageSetId: cleanText(prior.activeImageSetId),
    imageSetsOverride: !!prior.imageSetsOverride,
    // Bei einer bereits bestehenden Figur wird inventory bewusst NICHT mitgeschickt (siehe
    // Speichersystem-Checkup): Diese Aktion verknüpft nur Stammbaum-Genealogiedaten, sie hat
    // keine eigene Absicht, das Inventar zu ändern. Ein fehlendes Feld im Merge-Write lässt den
    // jeweils aktuellen Serverstand unangetastet. Nur eine neu angelegte Figur (kein "existing")
    // braucht von Anfang an ein Inventar-Feld.
    ...(existing ? {} : { inventory: prior.inventory && typeof prior.inventory === 'object' ? prior.inventory : null }),
    identity: normalizeCharacterIdentity({ worldPersonId: candidate.worldPersonId }),
    genealogy
  };
}
