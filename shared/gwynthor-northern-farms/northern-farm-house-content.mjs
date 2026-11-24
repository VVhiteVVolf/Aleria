import { NORTHERN_FARMS } from './northern-farms.mjs';

export function buildNorthernFarmHouseContent(slug) {
  const farm = NORTHERN_FARMS.find(candidate => candidate.slug === slug);
  const crest = `../Stammbäume/${farm.emblem}`;
  return {
    id: farm.familyId, name: farm.familyName, type: 'Bürgerliches Haus', page: 'kleinehaeuser.html',
    county: 'Celtigerns Wacht', liege: farm.liegeName, parentHouseId: `haus-${farm.liege.toLowerCase()}`,
    territoryId: 'celtigerns-wacht', territoryName: 'Celtigerns Wacht',
    territoryHref: '../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html',
    registerPage: true, biographySourceRevision: 1, contentVersion: '20261124-nordhoefe-v1',
    showMotto: false, omitMilitaryProfile: true, familyTreeCompact: true,
    biographyIntroTitle: 'Über die Familie',
    biographySummary: { overview: farm.overview, holdings: farm.holdings, customs: farm.heraldry, character: farm.relations },
    hierarchy: [
      { type: 'Kontinent', name: 'Estryll', slug: 'estryll' },
      { type: 'Königreich', name: 'Cenyr', slug: 'cenyr' },
      { type: 'Grafschaft', name: 'Celtigerns Wacht', slug: 'celtigerns-wacht' },
      { type: 'Baronie', name: 'Llamreis Ankunft', slug: 'llamreis-ankunft' },
      { type: 'Ort', name: farm.seat, slug: farm.slug + '-hof' },
      { type: 'Familie', name: farm.familyName, slug: farm.familyId }
    ],
    profile: {
      rank: 'Bürgerlich', houseType: 'Bauernfamilie', seat: farm.seat, origin: 'Bannkreis Gwynthor',
      people: 'Cenyri', liege: farm.liegeName
    },
    sections: {
      overview: farm.overview, holdings: farm.holdings, traditions: farm.heraldry,
      conflictsAlliances: farm.relations,
      familyTree: 'Die Namen des Gründerpaars und die späteren Generationen sind noch offen.'
    },
    sectionTitles: { holdings: farm.seat, traditions: 'Wappen' },
    images: { crest, banner: '../Stammbäume/assets/images/regions/gwynthor.png' },
    relatedRecords: [{ title: farm.seat, text: 'Im nördlichen Bannkreis von Gwynthor', icon: crest, link: farm.mapHref }],
    founder: null, heads: [], heirs: [], figures: [], offices: [], cadets: [], allies: []
  };
}
