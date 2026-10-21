// Explicitly retire every pre-overhaul page, including the legacy pages that
// v1 appended by mistake. Keep edits to the nine new, stably keyed pages.
// After this one-time cleanup the editor owns later changes again.
export function upgradeZitteraaleEntry(entry, canonical) {
  if (entry?.id !== canonical.id || entry.zitteraaleRevision === canonical.zitteraaleRevision) return entry;
  const pages = canonical.pages.map(page => structuredClone(
    (entry.pages || []).find(existing => existing.commentThreadKey === page.commentThreadKey) || page
  ));
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
