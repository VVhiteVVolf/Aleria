import { createHash } from 'node:crypto';

export const CHARACTER_DATABASE_SCHEMA_VERSION = 1;
const CHARACTER_OVERLAY_MARKER = '__aleriaCharacterOverlay';
const CHARACTER_SNAPSHOT_MARKER = '__aleriaCharacterSnapshot';

const GROUP_TABS = new Map([
  ['zum roten drachen', 'Zum Roten Drachen'],
  ['schwarzfische', 'Schwarzfische'],
  ['schwarze zitteraale', 'Schwarze Zitteraale'],
  ['condottieri aus leidenschaft', 'Condottieri aus Leidenschaft'],
  ['der schatten von talyndor', 'Der Schatten von Talyndor'],
  ['der ritter der fernen kuster', 'Der Ritter der fernen Küster'],
  ['die kleinen dubglais', 'Die kleinen Dubglais'],
  ['felsenritter der treue', 'Felsenritter der Treue']
]);

const IGNORED_TABS = new Set([
  'alle',
  'npc s',
  'noch nicht in gebrauch'
]);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeCharacterDatabaseKey(value) {
  return text(value)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function characterDatabaseSlug(value, fallback = 'figur') {
  return normalizeCharacterDatabaseKey(value).replace(/\s+/g, '-') || fallback;
}

function familyIdForHouse(houseId) {
  const normalized = characterDatabaseSlug(houseId, '');
  if (!normalized) return '';
  return normalized.replace(/^house-/, 'haus-');
}

function uniqueBy(items, keyFor) {
  const seen = new Set();
  return items.filter(item => {
    const key = keyFor(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function archiveAssignments(archive = {}) {
  const byCharacter = new Map();
  const remember = (id, field, value) => {
    if (!id || !value) return;
    const current = byCharacter.get(id) || { tabs: [], subtabs: [] };
    if (!current[field].includes(value)) current[field].push(value);
    byCharacter.set(id, current);
  };

  Object.entries(archive.charTabs?.map || {}).forEach(([tab, ids]) => {
    (Array.isArray(ids) ? ids : []).forEach(id => remember(id, 'tabs', tab));
  });
  Object.entries(archive.charTabs?.subtabMap || {}).forEach(([tab, subtabMap]) => {
    Object.entries(subtabMap || {}).forEach(([subtab, ids]) => {
      (Array.isArray(ids) ? ids : []).forEach(id => remember(id, 'subtabs', `${tab} > ${subtab}`));
    });
  });
  return byCharacter;
}

function characterNameKeys(character = {}) {
  return uniqueBy([
    character.name,
    ...(Array.isArray(character.aliases) ? character.aliases : [])
  ].flatMap(characterNameVariants).filter(Boolean), value => value);
}

function characterNameVariants(value) {
  const source = text(value);
  if (!source) return [];
  const variants = [normalizeCharacterDatabaseKey(source)];
  const birthNameMatch = source.match(/\(\s*geb(?:oren)?\.?\s+([^)]+)\)/i);
  if (birthNameMatch) {
    const currentName = source.replace(birthNameMatch[0], ' ').replace(/\s+/g, ' ').trim();
    const currentTokens = normalizeCharacterDatabaseKey(currentName).split(' ').filter(Boolean);
    const birthName = normalizeCharacterDatabaseKey(birthNameMatch[1]);
    variants.push(normalizeCharacterDatabaseKey(currentName));
    if (currentTokens[0] && birthName) variants.push(`${currentTokens[0]} ${birthName}`);
  }
  return uniqueBy(variants.filter(Boolean), item => item);
}

function characterIdentityNameKey(character = {}) {
  const variants = characterNameVariants(character.name);
  return variants[1] || variants[0] || characterDatabaseSlug(character.id);
}

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function birthYear(character = {}) {
  const source = character.genealogy?.birth ?? character.birth ?? character.birthYear;
  const match = String(source ?? '').match(/-?\d{1,5}/);
  return match ? numericValue(match[0]) : null;
}

function ageValue(character = {}) {
  return numericValue(character.age ?? character.inventory?.age);
}

function agesConflict(first, second) {
  const firstBirth = birthYear(first);
  const secondBirth = birthYear(second);
  if (firstBirth !== null && secondBirth !== null && firstBirth !== secondBirth) return true;
  const firstAge = ageValue(first);
  const secondAge = ageValue(second);
  return firstAge !== null && secondAge !== null && firstAge !== secondAge;
}

function candidateMatchScore(character, candidate) {
  const names = characterNameKeys(character);
  const displayName = normalizeCharacterDatabaseKey(candidate.displayName);
  const recordedName = normalizeCharacterDatabaseKey(candidate.recordedName);
  const displayNameIsSpecific = displayName.split(' ').filter(Boolean).length >= 2;
  const recordedNameIsSpecific = recordedName.split(' ').filter(Boolean).length >= 2;
  const exactDisplay = displayNameIsSpecific && names.includes(displayName);
  const exactRecorded = recordedNameIsSpecific && names.includes(recordedName);
  if (!exactDisplay && !exactRecorded) return 0;

  const characterYear = birthYear(character);
  const candidateYear = birthYear(candidate);
  if (characterYear !== null && candidateYear !== null && characterYear !== candidateYear) return 0;

  let score = exactDisplay ? 120 : 105;
  if (characterYear !== null && candidateYear === characterYear) score += 80;
  if (candidate.status === 'alive') score += 20;
  const homeFamilyId = familyIdForHouse(candidate.houseId);
  if (homeFamilyId && homeFamilyId === candidate.familyId) score += 30;
  if (candidate.familyRole === 'core') score += 15;
  const faction = normalizeCharacterDatabaseKey(character.fraktion || character.faction);
  if (faction && [candidate.familyTitle, candidate.houseName].some(value => {
    const key = normalizeCharacterDatabaseKey(value);
    return key && faction.includes(key);
  })) score += 10;
  return score;
}

function compactFamilyLink(candidate, score) {
  return {
    familyId: text(candidate.familyId),
    familyTitle: text(candidate.familyTitle),
    personId: text(candidate.personId),
    worldPersonId: text(candidate.worldPersonId),
    houseId: text(candidate.houseId),
    houseName: text(candidate.houseName),
    familyRole: text(candidate.familyRole),
    source: text(candidate.source) || 'project',
    folderPath: Array.isArray(candidate.folderPath) ? candidate.folderPath.filter(Boolean) : [],
    url: text(candidate.url),
    fingerprint: text(candidate.fingerprint),
    score
  };
}

export function matchCharacterToFamily(character, candidates = []) {
  const ranked = candidates
    .map(candidate => ({ candidate, score: candidateMatchScore(character, candidate) }))
    .filter(item => item.score > 0)
    .sort((first, second) => second.score - first.score);

  if (!ranked.length) return { status: 'pending', primary: null, primaryCandidate: null, links: [], alternatives: [] };

  const grouped = new Map();
  ranked.forEach(item => {
    const identityKey = text(item.candidate.worldPersonId)
      || `${item.candidate.familyId}:${item.candidate.personId}`;
    const existing = grouped.get(identityKey);
    if (!existing || item.score > existing.best.score) {
      grouped.set(identityKey, { best: item, projections: [item] });
    } else {
      existing.projections.push(item);
    }
  });

  const identities = [...grouped.values()].sort((first, second) => second.best.score - first.best.score);
  const bestIdentity = identities[0];
  const nextIdentity = identities[1];
  const ambiguous = !!nextIdentity && nextIdentity.best.score === bestIdentity.best.score;
  if (ambiguous) {
    return {
      status: 'ambiguous',
      primary: null,
      primaryCandidate: null,
      links: [],
      alternatives: identities.slice(0, 5).map(item => compactFamilyLink(item.best.candidate, item.best.score))
    };
  }

  const projectionLinks = ranked
    .filter(item => (text(item.candidate.worldPersonId) || `${item.candidate.familyId}:${item.candidate.personId}`)
      === (text(bestIdentity.best.candidate.worldPersonId)
        || `${bestIdentity.best.candidate.familyId}:${bestIdentity.best.candidate.personId}`))
    .map(item => compactFamilyLink(item.candidate, item.score));
  const links = uniqueBy(projectionLinks, item => `${item.familyId}:${item.personId}`)
    .sort((first, second) => second.score - first.score);
  return {
    status: 'linked',
    primary: links[0],
    primaryCandidate: bestIdentity.best.candidate,
    links,
    alternatives: identities.slice(1, 5).map(item => compactFamilyLink(item.best.candidate, item.best.score))
  };
}

function classifyLegacyTabs(assignments = { tabs: [], subtabs: [] }) {
  const groups = [];
  const places = [];
  (assignments.tabs || []).forEach(label => {
    const key = normalizeCharacterDatabaseKey(label);
    if (!key || IGNORED_TABS.has(key)) return;
    const groupLabel = GROUP_TABS.get(key);
    if (groupLabel) {
      groups.push({ id: characterDatabaseSlug(groupLabel), label: groupLabel, source: 'archive-tab' });
      return;
    }
    places.push({ id: characterDatabaseSlug(label), label, source: 'archive-tab' });
  });
  return {
    groups: uniqueBy(groups, item => item.id),
    places: uniqueBy(places, item => item.id)
  };
}

function choosePrimaryClassification(familyMatch, affiliations) {
  if (familyMatch.status === 'linked' && familyMatch.primary) {
    return {
      kind: 'family',
      id: familyMatch.primary.familyId,
      label: familyMatch.primary.familyTitle || familyMatch.primary.houseName || familyMatch.primary.familyId
    };
  }
  if (affiliations.groups[0]) return { kind: 'group', ...affiliations.groups[0] };
  if (affiliations.places[0]) return { kind: 'place', ...affiliations.places[0] };
  return { kind: 'unassigned', id: 'unassigned', label: 'Unzugeordnet' };
}

function mergeGenealogySources(existing, familyLinks, sourceExportedAt) {
  const stored = Array.isArray(existing) ? existing.filter(item => item?.familyId && item?.personId) : [];
  const additions = familyLinks.map(link => ({
    familyId: link.familyId,
    personId: link.personId,
    releaseId: '',
    publishedAt: '',
    importedAt: sourceExportedAt,
    lastSyncedAt: sourceExportedAt,
    url: link.url,
    fingerprint: link.fingerprint
  }));
  return uniqueBy([...stored, ...additions], item => `${item.familyId}:${item.personId}`);
}

function enrichCharacterWithFamily(character, familyMatch, sourceExportedAt) {
  const copy = structuredClone(character);
  const initialGenealogy = copy.genealogy && typeof copy.genealogy === 'object' ? copy.genealogy : {};
  copy.identity = {
    ...(copy.identity && typeof copy.identity === 'object' ? copy.identity : {}),
    worldPersonId: text(copy.identity?.worldPersonId) || text(initialGenealogy.worldPersonId)
  };
  copy.genealogy = {
    ...initialGenealogy,
    worldPersonId: text(initialGenealogy.worldPersonId) || copy.identity.worldPersonId,
    sex: text(initialGenealogy.sex),
    status: text(initialGenealogy.status),
    birth: text(String(initialGenealogy.birth ?? '')),
    death: text(String(initialGenealogy.death ?? '')),
    houseId: text(initialGenealogy.houseId),
    houseName: text(initialGenealogy.houseName),
    familyRole: text(initialGenealogy.familyRole),
    portraitPlaceholder: text(initialGenealogy.portraitPlaceholder),
    tags: Array.isArray(initialGenealogy.tags) ? initialGenealogy.tags : [],
    sources: Array.isArray(initialGenealogy.sources) ? initialGenealogy.sources : [],
    relationships: initialGenealogy.relationships && typeof initialGenealogy.relationships === 'object'
      ? initialGenealogy.relationships
      : { parents: [], partners: [], children: [] }
  };
  if (familyMatch.status !== 'linked' || !familyMatch.primary) return copy;
  const primary = familyMatch.primary;
  const candidate = familyMatch.primaryCandidate || primary;
  const existingGenealogy = copy.genealogy;
  const worldPersonId = text(copy.identity?.worldPersonId)
    || text(existingGenealogy.worldPersonId)
    || primary.worldPersonId;
  copy.identity = { ...(copy.identity || {}), worldPersonId };
  copy.genealogy = {
    ...existingGenealogy,
    worldPersonId,
    sex: text(existingGenealogy.sex) || text(candidate.sex),
    status: text(existingGenealogy.status) || text(candidate.status),
    birth: text(String(existingGenealogy.birth ?? '')) || text(String(candidate.birth ?? '')),
    death: text(String(existingGenealogy.death ?? '')) || text(String(candidate.death ?? '')),
    houseId: text(existingGenealogy.houseId) || primary.houseId,
    houseName: text(existingGenealogy.houseName) || primary.houseName,
    familyRole: text(existingGenealogy.familyRole) || primary.familyRole,
    portraitPlaceholder: text(existingGenealogy.portraitPlaceholder) || text(candidate.portraitPlaceholder),
    tags: Array.isArray(existingGenealogy.tags) && existingGenealogy.tags.length
      ? existingGenealogy.tags
      : Array.isArray(candidate.tags) ? candidate.tags : [],
    sources: mergeGenealogySources(existingGenealogy.sources, familyMatch.links, sourceExportedAt),
    relationships: existingGenealogy.relationships && Object.values(existingGenealogy.relationships).some(value => Array.isArray(value) && value.length)
      ? existingGenealogy.relationships
      : candidate.relationships || { parents: [], partners: [], children: [] }
  };
  if (!text(copy.taxonomyPath) && Array.isArray(primary.folderPath)) {
    copy.taxonomyPath = primary.folderPath.join(' > ');
  }
  return copy;
}

function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function meaningfulSize(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + meaningfulSize(item), value.length);
  if (typeof value === 'object') {
    return Object.values(value).reduce((sum, item) => sum + meaningfulSize(item), Object.keys(value).length);
  }
  return 1;
}

function sourcePriority(character) {
  const updatedAt = Date.parse(text(character.updatedAt)) || 0;
  return meaningfulSize(character) * 1_000_000 + Math.floor(updatedAt / 1000);
}

export function markCharacterDatabaseOverlay(character = {}, { replaceExportedFields = false } = {}) {
  Object.defineProperty(character, CHARACTER_OVERLAY_MARKER, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false
  });
  Object.defineProperty(character, CHARACTER_SNAPSHOT_MARKER, {
    value: replaceExportedFields === true,
    enumerable: false,
    configurable: false,
    writable: false
  });
  return character;
}

function mergeArrayValues(primary, fallback) {
  return uniqueBy(
    [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(fallback) ? fallback : [])],
    item => JSON.stringify(item)
  ).map(item => structuredClone(item));
}

function fillMissingValues(primary, fallback, path = '') {
  if (primary === undefined || primary === null || primary === '') return structuredClone(fallback);
  if (path === 'combatProfile') return structuredClone(primary);
  if (Array.isArray(primary) || Array.isArray(fallback)) return mergeArrayValues(primary, fallback);
  if (typeof primary === 'object' && typeof fallback === 'object' && primary && fallback) {
    const merged = structuredClone(primary);
    Object.entries(fallback).forEach(([key, value]) => {
      const childPath = path ? `${path}.${key}` : key;
      merged[key] = Object.hasOwn(merged, key) ? fillMissingValues(merged[key], value, childPath) : structuredClone(value);
    });
    return merged;
  }
  return structuredClone(primary);
}

function groupArchiveCharacters(characters = []) {
  const byName = new Map();
  characters.forEach(character => {
    const key = characterIdentityNameKey(character);
    const clusters = byName.get(key) || [];
    const compatible = clusters.find(cluster => !cluster.some(existing => agesConflict(existing, character)));
    if (compatible) compatible.push(character);
    else clusters.push([character]);
    byName.set(key, clusters);
  });

  return [...byName.values()].flatMap(clusters => clusters).map(sourceCharacters => {
    const sortedByPriority = [...sourceCharacters].sort((first, second) => sourcePriority(second) - sourcePriority(first));
    const canonicalDocumentId = sourceCharacters
      .map(character => text(character.id))
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second))[0];
    const merged = sortedByPriority.slice(1).reduce(
      (current, fallback) => fillMissingValues(current, fallback),
      structuredClone(sortedByPriority[0])
    );
    const combatOverlay = sourceCharacters
      .filter(character => character?.[CHARACTER_OVERLAY_MARKER] === true && character.combatProfile)
      .sort((first, second) => sourcePriority(second) - sourcePriority(first))[0];
    if (combatOverlay) merged.combatProfile = structuredClone(combatOverlay.combatProfile);
    // Verified exports own their supplied fields, including empty lists and nulls.
    // Merging their nested arrays would resurrect removed items or duplicate companions.
    const snapshotOverlays = sourceCharacters
      .filter(character => character?.[CHARACTER_SNAPSHOT_MARKER] === true)
      .sort((first, second) => (Date.parse(text(first.updatedAt)) || 0) - (Date.parse(text(second.updatedAt)) || 0));
    snapshotOverlays.forEach(character => Object.assign(merged, structuredClone(character)));
    merged.id = canonicalDocumentId;
    merged.aliases = uniqueBy([
      ...(Array.isArray(merged.aliases) ? merged.aliases : []),
      ...sourceCharacters.map(character => text(character.name)).filter(name => name && name !== merged.name)
    ], normalizeCharacterDatabaseKey);
    const timestamps = sourceCharacters.map(character => text(character.updatedAt)).filter(Boolean).sort();
    if (timestamps.length) merged.updatedAt = timestamps.at(-1);
    const created = sourceCharacters.map(character => text(character.createdAt)).filter(Boolean).sort();
    if (created.length) merged.createdAt = created[0];
    return {
      character: merged,
      sourceCharacters: [...sourceCharacters].sort((first, second) => text(first.id).localeCompare(text(second.id)))
    };
  });
}

function combinedAssignments(sourceCharacters, assignments) {
  const tabs = [];
  const subtabs = [];
  sourceCharacters.forEach(character => {
    const assigned = assignments.get(character.id) || { tabs: [], subtabs: [] };
    assigned.tabs.forEach(tab => { if (!tabs.includes(tab)) tabs.push(tab); });
    assigned.subtabs.forEach(subtab => { if (!subtabs.includes(subtab)) subtabs.push(subtab); });
  });
  return { tabs, subtabs };
}

function recordDirectory(primary, character, recordId) {
  const kindDirectory = {
    family: 'familien',
    group: 'gruppen',
    place: 'orte',
    unassigned: 'unzugeordnet'
  }[primary.kind] || 'unzugeordnet';
  const ownerDirectory = characterDatabaseSlug(primary.id || primary.label, 'unassigned');
  const characterDirectory = `${characterDatabaseSlug(character.name, 'figur')}--${text(character.id) || characterDatabaseSlug(recordId)}`;
  return `records/${kindDirectory}/${ownerDirectory}/${characterDirectory}`;
}

export function buildCharacterDatabase(archive, familyCandidates, options = {}) {
  const sourcePath = text(options.sourcePath);
  const exportedAt = text(archive?.exportedAt);
  const assignments = archiveAssignments(archive);
  const sourceGroups = groupArchiveCharacters(Array.isArray(archive?.characters) ? archive.characters : []);
  const records = sourceGroups.map(({ character: sourceCharacter, sourceCharacters }) => {
    const assigned = combinedAssignments(sourceCharacters, assignments);
    const familyMatch = matchCharacterToFamily(sourceCharacter, familyCandidates);
    const affiliations = classifyLegacyTabs(assigned);
    const primary = choosePrimaryClassification(familyMatch, affiliations);
    const recordId = `character--${text(sourceCharacter.id) || characterDatabaseSlug(sourceCharacter.name)}`;
    const character = enrichCharacterWithFamily(sourceCharacter, familyMatch, exportedAt);
    const directory = recordDirectory(primary, character, recordId);
    const path = `${directory}/character.json`;
    const classification = {
      primary,
      familyStatus: familyMatch.status,
      families: familyMatch.links,
      familyAlternatives: familyMatch.alternatives,
      groups: affiliations.groups,
      places: affiliations.places,
      legacy: {
        tabs: assigned.tabs,
        subtabs: assigned.subtabs
      }
    };
    const sourceDocumentIds = sourceCharacters.map(source => text(source.id)).filter(Boolean);
    const contentHash = sha256({ character, classification, sourceDocumentIds });
    const localRecord = {
      recordId,
      path,
      schemaVersion: CHARACTER_DATABASE_SCHEMA_VERSION,
      contentHash,
      firestoreDocumentIds: sourceDocumentIds,
      classification: {
        primary,
        familyStatus: familyMatch.status,
        families: familyMatch.links,
        groups: affiliations.groups,
        places: affiliations.places
      }
    };
    return {
      path,
      record: {
        schema: 'aleria.character-record',
        schemaVersion: CHARACTER_DATABASE_SCHEMA_VERSION,
        recordId,
        slug: characterDatabaseSlug(character.name),
        identity: {
          name: text(character.name),
          aliases: Array.isArray(character.aliases) ? character.aliases : [],
          worldPersonId: text(character.identity?.worldPersonId)
        },
        classification,
        links: {
          firestore: {
            projectId: 'aleriaprojekt',
            databaseId: '(default)',
            collection: 'characters',
            documentId: text(character.id),
            documentIds: sourceDocumentIds,
            documents: sourceCharacters.map(source => ({
              documentId: text(source.id),
              createdAt: text(source.createdAt),
              updatedAt: text(source.updatedAt)
            }))
          },
          familyTree: familyMatch.links.map(link => ({
            familyId: link.familyId,
            personId: link.personId,
            worldPersonId: link.worldPersonId,
            url: link.url
          })),
          profile: text(character.profileLink)
        },
        sync: {
          strategy: 'online-wins-runtime-local-wins-identity',
          sourceArchive: sourcePath,
          sourceExportedAt: exportedAt,
          sourceUpdatedAt: text(character.updatedAt),
          sourceDocumentIds,
          contentHash
        },
        local: {
          notes: '',
          tags: [],
          references: [],
          classificationOverride: null
        },
        sources: {
          firestoreExports: sourceCharacters.map(source => structuredClone(source))
        },
        character
      },
      snapshotCharacter: { ...character, localRecord }
    };
  });

  records.sort((first, second) => {
    const a = first.record.classification.primary;
    const b = second.record.classification.primary;
    const kindOrder = { family: 0, group: 1, place: 2, unassigned: 3 };
    return (kindOrder[a.kind] - kindOrder[b.kind])
      || a.label.localeCompare(b.label, 'de', { sensitivity: 'base' })
      || first.record.identity.name.localeCompare(second.record.identity.name, 'de', { sensitivity: 'base' })
      || first.record.recordId.localeCompare(second.record.recordId);
  });

  const duplicateWorldPersonIds = [...records.reduce((map, item) => {
    const id = item.record.identity.worldPersonId;
    if (!id) return map;
    const ids = map.get(id) || [];
    ids.push(item.record.recordId);
    map.set(id, ids);
    return map;
  }, new Map()).entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([worldPersonId, recordIds]) => ({ worldPersonId, recordIds }));

  const count = predicate => records.filter(item => predicate(item.record)).length;
  const report = {
    schema: 'aleria.character-sync-report',
    schemaVersion: CHARACTER_DATABASE_SCHEMA_VERSION,
    sourceArchive: sourcePath,
    sourceExportedAt: exportedAt,
    summary: {
      sourceDocuments: Array.isArray(archive?.characters) ? archive.characters.length : 0,
      total: records.length,
      mergedSameNameGroups: sourceGroups.filter(group => group.sourceCharacters.length > 1).length,
      familyLinked: count(record => record.classification.familyStatus === 'linked'),
      familyAmbiguous: count(record => record.classification.familyStatus === 'ambiguous'),
      familyPending: count(record => record.classification.familyStatus === 'pending'),
      primaryFamily: count(record => record.classification.primary.kind === 'family'),
      primaryGroup: count(record => record.classification.primary.kind === 'group'),
      primaryPlace: count(record => record.classification.primary.kind === 'place'),
      primaryUnassigned: count(record => record.classification.primary.kind === 'unassigned'),
      duplicateWorldPeople: duplicateWorldPersonIds.length
    },
    pending: records
      .filter(item => item.record.classification.familyStatus !== 'linked')
      .map(item => ({
        recordId: item.record.recordId,
        name: item.record.identity.name,
        status: item.record.classification.familyStatus,
        primary: item.record.classification.primary,
        familyAlternatives: item.record.classification.familyAlternatives
      })),
    mergedSameNameGroups: sourceGroups
      .filter(group => group.sourceCharacters.length > 1)
      .map(group => ({
        name: group.character.name,
        canonicalDocumentId: group.character.id,
        documentIds: group.sourceCharacters.map(character => character.id),
        ages: uniqueBy(group.sourceCharacters.flatMap(character => [
          birthYear(character) === null ? '' : `Geburtsjahr ${birthYear(character)}`,
          ageValue(character) === null ? '' : `Alter ${ageValue(character)}`
        ]).filter(Boolean), value => value)
      })),
    duplicateWorldPersonIds
  };

  return { records, report };
}
