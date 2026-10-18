import { royalCouncil } from '../cenyr-court/royal-council.mjs?v=vortigern-20261018';
import { placesById } from './places.mjs';
import { territoriesById } from '../../../Karten/Cenyr/vortigerns-ruh/places.mjs';

const countyPath = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Vortigerns Ruh/';
const map = Object.freeze({
  title: 'Karte von Vortigerns Ruh',
  imageSrc: '/Kontinente/assets/images/vortigerns-ruh-map-preview.webp',
  imageAlt: 'Karte der Königlichen Grafschaft Vortigerns Ruh',
  href: '/Karten/karte.html?map=cenyr-vortigerns-ruh',
});

// Only assembly belongs here. Each territory owns its copy, houses and officers.
export function createTerritory(source, data = globalThis.ALERIA_HERRSCHAFT_DATA) {
  const heraldry = territoriesById.get(source.id);
  if (!heraldry) throw new Error(`Unbekannte Herrschaft: ${source.id}`);
  const familySections = source.families.map(section => data.familySection(
    section.title,
    section.houses.map(house => data.family(house.name, house)),
    section,
  ));
  const groups = source.councilGroups.map(group => group.shared === 'cenyr-royal'
    ? royalCouncil
    : data.personGroup(group.title, group.members));
  return {
    meta: { id: source.id, title: `${source.title} - Aleria`, type: source.type, status: 'Entwurf', template: 'herrschaft' },
    name: source.title,
    hierarchy: source.hierarchy,
    canonicalPath: source.hierarchy.map(entry => entry.name).join(' > '),
    view: {
      familyTreePage: data.familyTreePage,
      familySections,
      councilGroups: groups,
      vassalGroups: source.vassalGroups,
      administration: data.administration(),
      geography: {
        map,
        domains: source.domains.map(domain => ({
          ...domain,
          crestSrc: territoriesById.get(domain.territoryId).banner,
          crestAlt: `Banner ${domain.title}`,
          href: domain.page ? countyPath + domain.page : '',
          sections: domain.sections.map(section => ({
            title: section.title,
            places: section.placeIds.map(id => {
              if (!placesById.has(id)) throw new Error(`Unbekannter Ort: ${id}`);
              return placesById.get(id);
            }),
          })),
        })),
      },
      article: {
        id: source.id,
        title: source.title,
        shortTitle: source.shortTitle,
        crestSrc: heraldry.banner,
        crestAlt: `Banner ${heraldry.name}`,
        kicker: source.kicker,
        parentHref: source.parentHref,
        parentLabel: source.parentLabel,
        councilNote: source.councilNote,
        map,
        infobox: source.infobox,
        copy: source.copy,
        floraSections: source.floraSections,
      },
    },
  };
}
