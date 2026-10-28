export const PORTRAIT_PLACEHOLDER = '/Stammbäume/assets/images/placeholders/male.png';

export function office(id, title, name, portrait, description, extra = {}) {
  return { id, title, name, portrait, description, ...extra };
}

export function group(id, title, kind, roles, description = '') {
  return { id, title, kind, roles, description };
}

export function portrait(house, name, extension = 'jpg') {
  return `/Stammbäume/assets/images/portraits/haus-${house}/${name}.${extension}`;
}

export function tierFor(group, role) {
  return role.tier || (group.kind === 'leadership' ? 'gold' : ['adjutant', 'vassals', 'core'].includes(group.kind) ? 'silver' : 'bronze');
}

export function withVassals(area, vassals) {
  const roles = vassals.map(vassal => {
    const official = vassal.offices[area.id];
    return office(`vassal-${vassal.id}`, official.title, official.name, official.portrait,
      `Führt den Bereich in ${vassal.name}. Eigene örtliche Zuständigkeiten bleiben bestehen; in grafschaftsweiten Angelegenheiten bestehen Berichtspflicht und fachliche Verantwortung gegenüber der obersten Grafschaftsinstanz.`, {
        jurisdiction: vassal.name,
        reportsTo: area.groups.find(entry => entry.kind === 'leadership')?.roles[0]?.title,
        authority: 'Örtliche Amtsgewalt; keine eigenständige Weisungsgewalt über die Fachämter der Grafschaft.',
        links: [{ label: `${vassal.name} · eigene Verwaltung`, href: vassal.href }],
      });
  });
  const groups = area.groups.filter(entry => entry.kind !== 'vassals');
  // The clergy's nine prelates precede the territorial vicars by church law.
  const after = area.id === 'klerus' ? groups.findIndex(entry => entry.kind === 'core') : groups.findIndex(entry => entry.kind === 'adjutant');
  groups.splice(Math.max(1, after + 1), 0, group('vassals', 'Ämter der Vasallen', 'vassals', roles,
    'Eigene Herrschaft · gemeinsame Verantwortung. Örtliche Amtsträger berichten fachlich an die Grafschaftsspitze; ihr Lehnsherr bleibt für die eigene Herrschaft zuständig.'));
  return { ...area, groups };
}
