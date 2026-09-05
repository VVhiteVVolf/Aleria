const LOCAL_CHARACTER_SNAPSHOT_URL = new URL('../../generated/characters.snapshot.json', import.meta.url);

let localDatabasePromise = null;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function clone(value, fallback) {
  if (value === undefined || value === null) return fallback;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function hasObjectData(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
}

function classTrainingSchemaVersion(profile = {}) {
  return Math.max(0, Number(profile?.classTraining?.schemaVersion) || 0);
}

function mergeRuntimeCollectionState(localEntries, onlineEntries, runtimeFields) {
  if (!Array.isArray(localEntries)) return localEntries;
  const onlineById = new Map(
    (Array.isArray(onlineEntries) ? onlineEntries : [])
      .filter(entry => text(entry?.id))
      .map(entry => [text(entry.id), entry])
  );
  return localEntries.map(entry => {
    const onlineEntry = onlineById.get(text(entry?.id));
    if (!onlineEntry) return entry;
    const merged = { ...entry };
    runtimeFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(onlineEntry, field)) merged[field] = clone(onlineEntry[field], onlineEntry[field]);
    });
    return merged;
  });
}

function preserveOnlineCombatState(localProfile, onlineProfile) {
  const merged = clone(localProfile, {});
  if (!hasObjectData(onlineProfile)) return merged;

  const onlineHitPoints = hasObjectData(onlineProfile.hitPoints) ? onlineProfile.hitPoints : {};
  if (hasObjectData(merged.hitPoints)) {
    merged.hitPoints = { ...merged.hitPoints };
    ['current', 'temporary'].forEach(field => {
      if (Object.prototype.hasOwnProperty.call(onlineHitPoints, field)) merged.hitPoints[field] = onlineHitPoints[field];
    });
  }

  merged.resources = mergeRuntimeCollectionState(
    merged.resources,
    onlineProfile.resources,
    ['current', 'recoveryDayKey']
  );
  merged.abilities = mergeRuntimeCollectionState(
    merged.abilities,
    onlineProfile.abilities,
    ['usesCurrent', 'recoveryDayKey']
  );
  merged.revision = Math.max(0, Number(merged.revision) || 0, Number(onlineProfile.revision) || 0);
  return merged;
}

function mergeRuntimeCombatProfile(onlineProfile, localProfile) {
  const onlineVersion = classTrainingSchemaVersion(onlineProfile);
  const localVersion = classTrainingSchemaVersion(localProfile);
  if (localVersion > onlineVersion) return preserveOnlineCombatState(localProfile, onlineProfile);
  return hasObjectData(onlineProfile) ? onlineProfile : clone(localProfile, onlineProfile);
}

function normalizedName(value) {
  return text(value)
    .replace(/\(\s*geb(?:oren)?\.?\s+[^)]+\)/ig, ' ')
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function birthYear(character = {}) {
  const match = String(character.genealogy?.birth ?? character.birth ?? character.birthYear ?? '').match(/-?\d{1,5}/);
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

function timestampValue(value) {
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (value && typeof value === 'object') return Number(value.seconds || value._seconds || 0) * 1000;
  return 0;
}

function onlinePriority(character = {}) {
  const combatWeight = hasObjectData(character.combatProfile) ? 1_000_000_000_000_000 : 0;
  const inventoryWeight = hasObjectData(character.inventory) ? 100_000_000_000_000 : 0;
  return combatWeight + inventoryWeight + timestampValue(character.updatedAt) + JSON.stringify(character).length;
}

function combineOnlineVariants(characters, canonicalId = '') {
  const ordered = [...characters].sort((first, second) => onlinePriority(second) - onlinePriority(first));
  const merged = clone(ordered[0], {});
  ordered.slice(1).forEach(fallback => {
    Object.entries(fallback || {}).forEach(([key, value]) => {
      const current = merged[key];
      if (current === undefined || current === null || current === '') merged[key] = clone(value, value);
      else if (!hasObjectData(current) && hasObjectData(value)) merged[key] = clone(value, value);
    });
  });
  merged.id = canonicalId || ordered.map(item => text(item.id)).filter(Boolean).sort()[0] || text(merged.id);
  return merged;
}

function worldPersonId(character = {}) {
  return text(character.identity?.worldPersonId) || text(character.genealogy?.worldPersonId);
}

function mergeUnique(primary, fallback, keyFor) {
  const seen = new Set();
  return [...(Array.isArray(primary) ? primary : []), ...(Array.isArray(fallback) ? fallback : [])]
    .filter(item => {
      const key = keyFor(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(item => clone(item, item));
}

function mergeGenealogy(online = {}, local = {}) {
  const merged = { ...clone(local, {}), ...clone(online, {}) };
  [
    'worldPersonId', 'sex', 'status', 'birth', 'death', 'houseId', 'houseName',
    'familyRole', 'portraitPlaceholder'
  ].forEach(key => { merged[key] = text(online?.[key]) || text(local?.[key]); });
  merged.tags = mergeUnique(online?.tags, local?.tags, item => text(String(item)));
  merged.sources = mergeUnique(
    online?.sources,
    local?.sources,
    item => `${text(item?.familyId)}:${text(item?.personId)}`
  );
  const onlineRelationships = online?.relationships && typeof online.relationships === 'object'
    ? online.relationships
    : {};
  const localRelationships = local?.relationships && typeof local.relationships === 'object'
    ? local.relationships
    : {};
  merged.relationships = {};
  ['parents', 'partners', 'children'].forEach(kind => {
    merged.relationships[kind] = mergeUnique(
      onlineRelationships[kind],
      localRelationships[kind],
      item => text(item?.worldPersonId) || `${text(item?.personId)}:${text(item?.type)}`
    );
  });
  return merged;
}

export function mergeOnlineAndLocalCharacter(onlineCharacter, localCharacter) {
  const online = clone(onlineCharacter, {});
  const local = clone(localCharacter, {});
  const merged = { ...local, ...online };
  const onlineWorldPersonId = worldPersonId(online);
  const localWorldPersonId = worldPersonId(local);
  merged.id = text(online.id) || text(local.id);
  merged.identity = {
    ...clone(local.identity, {}),
    ...clone(online.identity, {}),
    worldPersonId: onlineWorldPersonId || localWorldPersonId
  };
  merged.genealogy = mergeGenealogy(online.genealogy, local.genealogy);
  if (!merged.genealogy.worldPersonId) merged.genealogy.worldPersonId = merged.identity.worldPersonId;
  merged.localRecord = clone(local.localRecord, clone(online.localRecord, null));
  merged.inventory = hasObjectData(online.inventory) ? online.inventory : clone(local.inventory, online.inventory);
  merged.combatProfile = mergeRuntimeCombatProfile(online.combatProfile, local.combatProfile);
  return merged;
}

export function mergeCharacterDatabases(onlineCharacters = [], localCharacters = []) {
  const locals = Array.isArray(localCharacters) ? localCharacters : [];
  const localBySourceId = new Map();
  const localByWorldPersonId = new Map();
  locals.forEach(local => {
    const sourceIds = [local?.id, ...(local?.localRecord?.firestoreDocumentIds || [])]
      .map(text)
      .filter(Boolean);
    sourceIds.forEach(id => localBySourceId.set(id, local));
    const personId = worldPersonId(local);
    if (personId && !localByWorldPersonId.has(personId)) localByWorldPersonId.set(personId, local);
  });

  const groups = [];
  const groupsByLocalRecord = new Map();
  (Array.isArray(onlineCharacters) ? onlineCharacters : []).forEach(online => {
    const local = localBySourceId.get(text(online?.id))
      || localByWorldPersonId.get(worldPersonId(online))
      || null;
    let group = null;
    if (local) {
      const key = text(local.localRecord?.recordId) || text(local.id);
      group = groupsByLocalRecord.get(key);
      if (!group) {
        group = { local, online: [] };
        groupsByLocalRecord.set(key, group);
        groups.push(group);
      }
    } else {
      const nameKey = normalizedName(online?.name || online?.fullName);
      group = groups.find(candidate => !candidate.local
        && normalizedName(candidate.online[0]?.name || candidate.online[0]?.fullName) === nameKey
        && !candidate.online.some(existing => agesConflict(existing, online)));
      if (!group) {
        group = { local: null, online: [] };
        groups.push(group);
      }
    }
    group.online.push(online);
  });

  const consumedLocalRecords = new Set();
  const merged = groups.map(group => {
    const canonicalId = text(group.local?.id);
    const online = combineOnlineVariants(group.online, canonicalId);
    if (!group.local) return online;
    consumedLocalRecords.add(text(group.local.localRecord?.recordId) || text(group.local.id));
    return mergeOnlineAndLocalCharacter(online, group.local);
  });
  locals.forEach(local => {
    const key = text(local.localRecord?.recordId) || text(local.id);
    if (!consumedLocalRecords.has(key)) merged.push(clone(local, local));
  });
  return merged.sort((first, second) => text(first?.name).localeCompare(text(second?.name), 'de', { sensitivity: 'base' }));
}

function normalizeSnapshot(payload) {
  if (payload?.schema !== 'aleria.character-snapshot' || !Array.isArray(payload.characters)) {
    throw new Error('Die lokale Charakterdatenbank besitzt kein gültiges Snapshot-Format.');
  }
  return {
    schemaVersion: Number(payload.schemaVersion) || 0,
    sourceArchive: text(payload.sourceArchive),
    sourceExportedAt: text(payload.sourceExportedAt),
    characters: payload.characters.map(character => clone(character, character)),
    charTabs: payload.charTabs && typeof payload.charTabs === 'object' ? clone(payload.charTabs, null) : null
  };
}

export function loadLocalCharacterDatabase({ fetchImpl = globalThis.fetch, force = false } = {}) {
  if (force) localDatabasePromise = null;
  if (!localDatabasePromise) {
    localDatabasePromise = Promise.resolve()
      .then(() => {
        if (typeof fetchImpl !== 'function') throw new Error('Fetch ist nicht verfügbar.');
        return fetchImpl(LOCAL_CHARACTER_SNAPSHOT_URL, { cache: 'no-cache' });
      })
      .then(response => {
        if (!response.ok) throw new Error(`Lokale Charakterdatenbank konnte nicht geladen werden (${response.status}).`);
        return response.json();
      })
      .then(normalizeSnapshot)
      .catch(error => {
        console.info('Lokale Charakterdatenbank ist derzeit nicht verfügbar.', error);
        return { schemaVersion: 0, sourceArchive: '', sourceExportedAt: '', characters: [], charTabs: null };
      });
  }
  return localDatabasePromise;
}
