import { normalizeFamilyViewLink } from '../../services/family-links.js';

const HOUSE_KIND_PREFIX = /^(?:haus|house|clan|sept)-+/;

function normalizeIdentity(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(HOUSE_KIND_PREFIX, '');
}

function identityKeys(record) {
  return new Set([
    normalizeIdentity(record?.id),
    normalizeIdentity(record?.familyId),
    normalizeIdentity(record?.title)
  ].filter(Boolean));
}

function findUniqueProjectRecord(projectRecords, publishedRecord) {
  const publishedKeys = identityKeys(publishedRecord);
  if (!publishedKeys.size) return null;
  const matches = projectRecords.filter(record => (
    [...identityKeys(record)].some(key => publishedKeys.has(key))
  ));
  return matches.length === 1 ? matches[0] : null;
}

function nonEmptyList(value, fallback = []) {
  const normalized = Array.isArray(value) ? value.map(String).filter(Boolean) : [];
  return normalized.length ? normalized : [...(fallback || [])];
}

function preferredText(value, fallback = '') {
  const normalized = String(value || '').trim();
  return normalized || String(fallback || '').trim();
}

function mergeHouseProfiles(projectProfile = {}, publishedProfile = {}) {
  const publishedRank = String(publishedProfile.rankId || '').trim();
  const projectRegionEmblems = projectProfile.regionEmblems || {};
  const publishedRegionEmblems = publishedProfile.regionEmblems || {};
  return {
    ...projectProfile,
    ...publishedProfile,
    rankId: publishedRank && publishedRank !== 'unknown'
      ? publishedRank
      : projectProfile.rankId || 'unknown',
    seat: preferredText(publishedProfile.seat, projectProfile.seat),
    barony: preferredText(publishedProfile.barony, projectProfile.barony),
    county: preferredText(publishedProfile.county, projectProfile.county),
    kingdom: preferredText(publishedProfile.kingdom, projectProfile.kingdom),
    secondarySeats: nonEmptyList(publishedProfile.secondarySeats, projectProfile.secondarySeats),
    liegeHouseId: preferredText(publishedProfile.liegeHouseId, projectProfile.liegeHouseId),
    liegeHouseName: preferredText(publishedProfile.liegeHouseName, projectProfile.liegeHouseName),
    regionEmblems: {
      seat: preferredText(publishedRegionEmblems.seat, projectRegionEmblems.seat),
      barony: preferredText(publishedRegionEmblems.barony, projectRegionEmblems.barony),
      county: preferredText(publishedRegionEmblems.county, projectRegionEmblems.county),
      kingdom: preferredText(publishedRegionEmblems.kingdom, projectRegionEmblems.kingdom)
    }
  };
}

export function mergePublishedRegistryRecords(projectRecords = [], publishedRecords = []) {
  const canonicalProjectRecords = [...projectRecords];
  const records = new Map(canonicalProjectRecords.map(record => [record.id, record]));

  publishedRecords.forEach(publishedRecord => {
    const publishedId = String(publishedRecord.familyId || publishedRecord.id || '').trim();
    if (!publishedId) return;
    const projectRecord = records.get(publishedId)
      || findUniqueProjectRecord(canonicalProjectRecords, publishedRecord);
    const canonicalId = projectRecord?.id || publishedId;
    if (projectRecord?.id) records.delete(projectRecord.id);
    if (canonicalId !== publishedId) records.delete(publishedId);

    const publishedFolderPath = nonEmptyList(publishedRecord.folderPath);
    const folderPath = publishedFolderPath.length
      ? publishedFolderPath
      : nonEmptyList(projectRecord?.folderPath);
    const projectProfile = projectRecord?.houseProfile
      || projectRecord?.family?.document?.houseProfile
      || {};
    const houseProfile = mergeHouseProfiles(projectProfile, publishedRecord.houseProfile || {});

    records.set(canonicalId, {
      ...projectRecord,
      ...publishedRecord,
      id: canonicalId,
      familyId: canonicalId,
      title: String(publishedRecord.title || projectRecord?.title || canonicalId),
      folderPath,
      houseProfile,
      family: projectRecord?.family,
      link: normalizeFamilyViewLink('', canonicalId),
      source: 'github',
      canonicalRegistryId: canonicalId,
      publishedFamilyId: publishedId
    });
  });

  return [...records.values()]
    .sort((first, second) => first.title.localeCompare(second.title, 'de'));
}
