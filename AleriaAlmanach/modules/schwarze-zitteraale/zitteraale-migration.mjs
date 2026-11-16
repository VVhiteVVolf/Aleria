// Feature-owned upgrades keep scene identities and later editor changes.
// The November regrouping refreshes its authored pages once and retires the
// removed dossier. The original v1 cleanup still drops its legacy pages.
export function upgradeZitteraaleEntry(entry, canonical) {
  if (entry?.id !== canonical.id || entry.zitteraaleRevision === canonical.zitteraaleRevision) return entry;
  const regrouped = canonical.zitteraaleRevision === '20261116-unterbanden-v4';
  const pages = canonical.pages.map(page => {
    const existing = (entry.pages || []).find(existing => existing.commentThreadKey === page.commentThreadKey);
    if (!regrouped) return structuredClone(existing || page);
    // This commissioned reorganisation refreshes authored pages once. The
    // existing headquarters scene keeps its edited content and thread identity.
    if (page.sessionPage && existing) return { ...structuredClone(page), ...structuredClone(existing) };
    if (page.commentThreadKey === 'zitteraale-uebersicht' && typeof existing?.description === 'string') {
      return { ...structuredClone(existing), ...structuredClone(page), description: existing.description };
    }
    return { ...structuredClone(existing || {}), ...structuredClone(page) };
  });
  if (regrouped && entry.zitteraaleRevision === '20261021-arvel-v3') {
    const keys = new Set(canonical.pages.map(page => page.commentThreadKey));
    pages.push(...structuredClone((entry.pages || []).filter(page =>
      !keys.has(page.commentThreadKey) && page.commentThreadKey !== 'zitteraale-akte-netznadel')));
  }
  // Correct only known authored wording. Preserve later editor additions and
  // scene identities; no comments, character resources or past posts are touched.
  const overview = pages.find(page => page.commentThreadKey === 'zitteraale-uebersicht');
  if (typeof overview?.description === 'string') overview.description = overview.description.replace(
    'Um 1730 fanden sich Überlebende, Deserteure und Gesetzlose zu einer dauerhaften Bande zusammen.',
    'Seit 1720 sammelte ihr Anführer Überlebende, Deserteure und ehemalige Bannerkrieger um sich. Seit beinahe zwanzig Jahren terrorisiert die Bande die Grafschaft.');
  if (Array.isArray(overview?.stats)) overview.stats = overview.stats.map(row => Array.isArray(row)
    ? row.map(value => value === 'Untergang der Illysywen 1720 · Bandenbildung um 1730' ? 'Untergang der Illysywen 1720 · Bandenbildung seit 1720'
      : value === 'Ausschließlich Bandenbeinamen' ? 'Öffentlich vorwiegend Bandenbeinamen' : value) : row);
  const headquarters = pages.find(page => page.commentThreadKey === 'zitteraale-hauptquartier');
  if (typeof headquarters?.sessionIntro === 'string') headquarters.sessionIntro = headquarters.sessionIntro.replace(
    '<p>Zwischen den Resten einer antiken <strong>albischen Ruinenstadt</strong> brennt Licht',
    '<p>Hoch in den Bergen Celtigerns Wacht, zwischen den Resten einer antiken <strong>albischen Ruinenstadt</strong>, brennt Licht');
  return { ...entry, ...structuredClone(canonical), pages };
}
