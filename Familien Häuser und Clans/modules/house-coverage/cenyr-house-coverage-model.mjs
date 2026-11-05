import { resolveCanonicalFamilyId } from '../../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';

// Residence and the actual registry path own the scope. Service to a Cenyr
// house alone cannot move a foreign family into the kingdom's coverage.
export function getCenyrPlacement(record) {
  if (record.folderPath?.[0] === 'Cenyr') {
    return { folderPath: record.folderPath, houseProfile: record.houseProfile, role: 'primary' };
  }
  return (record.additionalPlacements || []).find(placement => placement.folderPath?.[0] === 'Cenyr') || null;
}

export function normalizePublicAllowlist(values) {
  if (!Array.isArray(values) || !values.length || values.some(value => typeof value !== 'string' || !value.trim())) {
    throw new Error('Eine geprüfte öffentliche Familien-ID-Allowlist ist erforderlich.');
  }
  return [...new Set(values.map(resolveCanonicalFamilyId))];
}

export function summarizeCenyrCoverage(records, unreviewedPublicScopedFamilies = 0) {
  const counties = {};
  for (const record of records) {
    const county = counties[record.county] ||= { families: 0, missingPage: 0, missingBio: 0, missingArt: 0, noLocalArt: 0 };
    county.families++;
    for (const [key, field] of [['missingPage', 'page'], ['missingBio', 'bio'], ['missingArt', 'art'], ['noLocalArt', 'localArt']]) {
      county[key] += Number(record.missing[field]);
    }
  }
  return {
    families: records.length, territorialGroups: Object.keys(counties).length,
    missingPage: records.filter(record => record.missing.page).length,
    missingBio: records.filter(record => record.missing.bio).length,
    missingArt: records.filter(record => record.missing.art).length,
    noLocalArt: records.filter(record => record.missing.localArt).length,
    iframeIssues: records.filter(record => record.links?.iframeSupported && !record.links.iframeCanonical).length,
    profileLinkIssues: records.filter(record => record.links?.profileSupported && !record.links.profileCanonical).length,
    familyProfiles: records.filter(record => record.existingPage.kind === 'family-record').length,
    biographyBackLinkIssues: records.filter(record => record.links?.biographyBackLinkSupported && !record.links.biographyBackLinkCanonical).length,
    preparedPages: records.filter(record => record.existingPage.prepared).length,
    publishedOwnNull: records.filter(record => record.existingBiography.publishedOwnState === 'explicit-null').length,
    unreviewedPublicScopedFamilies, counties,
  };
}

export function hasCenyrCoverageGaps(summary) {
  return ['missingPage', 'missingBio', 'missingArt', 'noLocalArt', 'iframeIssues', 'profileLinkIssues',
    'biographyBackLinkIssues', 'unreviewedPublicScopedFamilies'].some(field => Number(summary[field] || 0) > 0);
}
