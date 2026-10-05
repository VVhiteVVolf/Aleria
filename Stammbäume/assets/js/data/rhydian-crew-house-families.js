import { createBlankHouseFamily } from './blank-house-family-factory.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { KLAUENINSEL_REGION_EMBLEMS } from './klaueninseln-house-profiles.js';

// Neue Talgarther Häuser nach Nutzervorgabe. Die vorgeschlagenen Besatzungsmitglieder
// bleiben in der separaten Kandidatenliste; hier entstehen keine Personen oder Ehen.
export const RHYDIAN_CREW_HOUSE_DEFINITIONS = Object.freeze([
  Object.freeze({
    surname: 'Gwernhelyd',
    slug: 'gwernhelyd',
    rankId: 'commoner',
    description: 'Bürgerfamilie aus Talgarth mit einer Tradition als Lotsen und Fahrwasserkenner. Ihr Handwerk ist die sichere Führung von Schiffen durch Untiefen und Hafeneinfahrten. Hausoberhaupt, weitere Angehörige und Abstammung sind noch offen.',
    heraldry: 'Auf Dunkelgrün eine silberne Weide über einem goldenen offenen Boot und drei silbernen Wellenbändern; schlichter antikgoldener Rundrand mit schwarzer Kontur.'
  }),
  Object.freeze({
    surname: 'Cledrann',
    slug: 'cledrann',
    rankId: 'knight',
    description: 'Niederes Ritterhaus aus Talgarth mit einer Tradition im Küstenwachtdienst und in der Waffenpflege an Bord. Hausoberhaupt, Besitz, Lehensverhältnis und Abstammung sind noch offen.',
    heraldry: 'Auf Weinrot eine goldene dreilappige Seilschlinge mit zwei silbernen Sternen; schlichter antikgoldener Rundrand mit schwarzer Kontur.'
  }),
  Object.freeze({
    surname: 'Halenwych',
    slug: 'halenwych',
    rankId: 'commoner',
    description: 'Bürgerfamilie aus Talgarth, spezialisiert auf Salzhandel, Vorratslagerung und haltbaren Schiffsproviant. Hausoberhaupt, weitere Angehörige und Abstammung sind noch offen.',
    heraldry: 'Auf Nachtblau ein silberner Salzberg in einem goldenen offenen Bottich mit zwei dunklen Reifen, darunter drei goldene Wellenbänder; schlichter antikgoldener Rundrand mit schwarzer Kontur.'
  })
]);

function createRhydianCrewHouse(definition) {
  const houseProfile = createHouseProfileFromFolderPath(
    ['Cenyr', 'Klaueninsel', 'Sturmklaue', 'Talgarth'],
    {
      rankId: definition.rankId,
      regionEmblems: {
        kingdom: KLAUENINSEL_REGION_EMBLEMS.cenyr,
        county: KLAUENINSEL_REGION_EMBLEMS.county,
        barony: KLAUENINSEL_REGION_EMBLEMS.lordships.Sturmklaue
      }
    }
  );
  const base = createBlankHouseFamily({
    id: `haus-${definition.slug}`,
    title: `Haus ${definition.surname}`,
    emblem: `assets/images/houses/Klaueninsel/rhydian-new-families-2026-10-05/haus-${definition.slug}.png`,
    houseProfile,
    description: definition.description
  });
  return Object.freeze({
    ...base,
    lineage: Object.freeze({
      ...base.lineage,
      crestFrame: definition.rankId === 'knight' ? 'silver' : 'iron',
      crestSubtitle: definition.rankId === 'knight'
        ? 'Niederes Ritterhaus aus Talgarth'
        : 'Bürgerfamilie aus Talgarth'
    }),
    extensions: Object.freeze({
      ...base.extensions,
      sourceRevision: 1,
      sourceNote: 'Neue Familien nach Nutzervorgabe vom 05.10.2026 für Rhydians lokale Mannschaftsplanung. Familiennamen im verfügbaren Cenyr- und Projektbestand geprüft. Die Kandidatenliste bleibt ein Entwurf; keine neuen Angehörigen oder Abstammungskanten übernommen.',
      heraldryDescription: definition.heraldry,
      pendingFamilySituation: Object.freeze({
        openQuestions: Object.freeze(['Hausoberhaupt', 'Angehörige und Abstammung', 'Aufnahme der vorgeschlagenen Mannschaftsmitglieder'])
      })
    })
  });
}

export const RHYDIAN_CREW_HOUSE_FAMILIES = Object.freeze(
  RHYDIAN_CREW_HOUSE_DEFINITIONS.map(createRhydianCrewHouse)
);
