// Regions own their selection, texts, heraldry and councils; this module owns
// their common data shape for the shared territory UI.
export function createTerritoryData(source, context, data = globalThis.ALERIA_HERRSCHAFT_DATA) {
  const { map, placesById, territoriesById, countyPath, sharedCouncilGroups = new Map() } = context;
  const heraldry = territoriesById.get(source.id);
  if (!heraldry) throw new Error(`Unbekannte Herrschaft: ${source.id}`);
  const familySections = source.families.map(section => data.familySection(
    section.title, section.houses.map(house => data.family(house.name, house)), section,
  ));
  const councilGroups = source.councilGroups.map(group => {
    if (!group.shared) return data.personGroup(group.title, group.members);
    if (!sharedCouncilGroups.has(group.shared)) throw new Error(`Unbekannter gemeinsamer Rat: ${group.shared}`);
    return sharedCouncilGroups.get(group.shared);
  });
  const domains = source.domains.map(domain => {
    const territory = territoriesById.get(domain.territoryId);
    if (!territory) throw new Error(`Unbekanntes Gebiet: ${domain.territoryId}`);
    return {
      ...domain, crestSrc: territory.banner, crestAlt: `Banner ${domain.title}`,
      href: domain.href || (domain.page ? countyPath + domain.page : ''),
      sections: domain.sections.map(section => ({
        title: section.title,
        places: section.placeIds.map(id => {
          if (!placesById.has(id)) throw new Error(`Unbekannter Ort: ${id}`);
          return placesById.get(id);
        }),
      })),
    };
  });
  return {
    meta: { id: source.id, title: `${source.title} - Aleria`, type: source.type, status: 'Entwurf', template: 'herrschaft' },
    name: source.title, hierarchy: source.hierarchy,
    canonicalPath: source.hierarchy.map(entry => entry.name).join(' > '),
    view: {
      familyTreePage: data.familyTreePage, familySections, councilGroups,
      vassalGroups: source.vassalGroups, administration: data.administration(),
      geography: { map, domains },
      article: {
        id: source.id, title: source.title, shortTitle: source.shortTitle,
        crestSrc: heraldry.banner, crestAlt: `Banner ${heraldry.name}`,
        kicker: source.kicker, parentHref: source.parentHref, parentLabel: source.parentLabel,
        councilNote: source.councilNote, map, infobox: source.infobox,
        copy: source.copy, cultureSections: source.cultureSections, floraSections: source.floraSections,
      },
    },
  };
}
