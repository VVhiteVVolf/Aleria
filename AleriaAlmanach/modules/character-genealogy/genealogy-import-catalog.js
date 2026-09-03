function cleanText(value) {
  return String(value || '').trim();
}

function normalizeSearchText(value) {
  return cleanText(value)
    .toLocaleLowerCase('de')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getGenealogyCandidateKey(candidate) {
  return `${candidate?.familyId || 'family'}::${candidate?.personId || candidate?.worldPersonId || 'person'}`;
}

export function getGenealogyCandidateSearchText(candidate) {
  const text = [
    candidate?.displayName,
    candidate?.title,
    candidate?.houseName,
    candidate?.birth,
    candidate?.death,
    candidate?.familyTitle,
    ...(candidate?.folderPath || []),
    ...(candidate?.membershipTitles || [])
  ].join(' ');
  return normalizeSearchText(text);
}

function preferCanonicalCandidate(current, candidate) {
  if (!current) return candidate;
  if (current.familyRole !== 'core' && candidate.familyRole === 'core') return candidate;
  return current;
}

export function deduplicateGenealogyCandidates(candidates) {
  const byIdentity = new Map();
  (Array.isArray(candidates) ? candidates : []).forEach(candidate => {
    const identityKey = cleanText(candidate?.worldPersonId) || getGenealogyCandidateKey(candidate);
    const current = byIdentity.get(identityKey);
    const preferred = preferCanonicalCandidate(current?.candidate, candidate);
    const titles = new Set(current?.membershipTitles || []);
    if (candidate?.familyTitle) titles.add(candidate.familyTitle);
    byIdentity.set(identityKey, { candidate: preferred, membershipTitles: titles });
  });
  return Array.from(byIdentity.values()).map(record => ({
    ...record.candidate,
    membershipTitles: Array.from(record.membershipTitles).sort((a, b) =>
      a.localeCompare(b, 'de', { sensitivity: 'base', numeric: true })
    )
  }));
}

function hasVisibleLifeStatus(candidate, filters) {
  if (candidate?.status === 'alive') return true;
  if (candidate?.status === 'dead') return !!filters.showDead;
  return !!filters.showUnknown;
}

function getMatchCategory(match) {
  if (!match) return 'available';
  if (match.kind === 'linked') return 'linked';
  return 'review';
}

export function filterGenealogyCandidates(candidates, filters = {}, resolveMatch = () => null) {
  const needle = normalizeSearchText(filters.search);
  const matchFilter = cleanText(filters.matchFilter) || 'available';
  return (Array.isArray(candidates) ? candidates : []).filter(candidate => {
    if (!hasVisibleLifeStatus(candidate, filters)) return false;
    if (matchFilter !== 'all' && getMatchCategory(resolveMatch(candidate)) !== matchFilter) return false;
    return !needle || getGenealogyCandidateSearchText(candidate).includes(needle);
  });
}
