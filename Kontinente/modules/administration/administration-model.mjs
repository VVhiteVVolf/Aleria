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
  const military = area.id === 'militaer';
  const lead = area.groups.find(entry => entry.kind === 'leadership')?.roles[0]?.title;
  const roles = vassals.map(vassal => {
    const official = vassal.offices[area.id];
    return office(`vassal-${vassal.id}`, official.title, official.name, official.portrait,
      military ? `Befehligt die Ortswachen in ${vassal.name} und führt das Heer mit dem Kommandanten des eigenen Hauses. Beim Banneraufgebot stellt das Haus dem Grafen seine Hausmacht.`
        : `Führt den Bereich in ${vassal.name}. Eigene örtliche Zuständigkeiten bleiben bestehen; in grafschaftsweiten Angelegenheiten bestehen Berichtspflicht und fachliche Verantwortung gegenüber der obersten Grafschaftsinstanz.`, {
        jurisdiction: vassal.name,
        tier: military ? 'gold' : 'silver',
        reportsTo: military ? 'Eigenes Oberhaupt · beim Banneraufgebot zuständige Grafschaftsführung' : lead,
        authority: military ? 'Militärische Befehlsgewalt in der eigenen Herrschaft. Befehle an andere Häuser folgen Lehnsrang und Aufgebot.'
          : 'Örtliche Amtsgewalt; keine eigenständige Weisungsgewalt über die Fachämter der Grafschaft.',
        links: [{ label: `${vassal.name} · eigene Verwaltung`, href: vassal.href }],
      });
  });
  const groups = area.groups.filter(entry => entry.kind !== 'vassals');
  // The clergy's nine prelates precede the territorial vicars by church law.
  const after = area.id === 'klerus' ? groups.findIndex(entry => entry.kind === 'core') : groups.findIndex(entry => entry.kind === 'adjutant');
  groups.splice(Math.max(1, after + 1), 0, group('vassals', 'Ämter der Vasallen', 'vassals', roles,
    military ? 'Die Marschälle führen ihre jeweiligen Herrschaften. Wenn der Graf die Banner ruft, stellen die Vasallen ihre Hausmächte.'
      : 'Eigene Herrschaft · gemeinsame Verantwortung. Örtliche Amtsträger berichten fachlich an die Grafschaftsspitze; ihr Lehnsherr bleibt für die eigene Herrschaft zuständig.'));
  return { ...area, groups };
}
