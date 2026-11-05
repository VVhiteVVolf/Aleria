import { createFounderPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { FLEISCHSAMMLER_MAP_ID, fleischsammlerFamilyLocality } from './localities.mjs';

// The earliest recorded household anchors the chart. No earlier ancestry or
// supposed founders of the surname are invented for these new rural families.
export function createGwynthorRuralFamily({ slug, description, people, partnerships, parentages,
  householdMarriageId, focusPersonId, biographyText, historyText, works, connections = [], documents = [],
  extraHouses = [], cadetBranches = [], sourceNote = '' }) {
  const locality = fleischsammlerFamilyLocality(slug);
  const title = `Familie ${locality.surname}`;
  const profile = normalizeHouseProfile({ rankId: 'commoner', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
    barony: 'Llamreis Ankunft', seat: locality.placeName,
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
  const base = createFounderPlaceholderHouseFamily({ id: locality.familyId, title,
    emblem: locality.emblem, houseProfile: profile, description });
  const biography = Object.freeze({
    schema: 'aleria.house-module', schemaVersion: 1, housePage: true, pageTitle: title, description,
    quote: '', quoteBy: '', image: `../Stammbäume/${locality.emblem}`,
    stats: [['Familie', locality.surname], ['Stand', 'Bürgerliche Rheunwaith-Familie'],
      ['Stammsitz', `${locality.placeName} · Gwynthor`]],
    house: {
      crestImage: `../Stammbäume/${locality.emblem}`, sideWidth: 100,
      biographyTitle: locality.placeName, biographyText,
      historyTitle: 'Die heutige Familie', historyText,
      worksTitle: 'Arbeit und Versorgung', works,
      connectionsTitle: 'Verbindungen', connections,
      documentsTitle: 'Orte und Verweise', documents: [{ title: locality.placeName,
        icon: `../Stammbäume/${locality.emblem}`, text: locality.description,
        link: `../Karten/karte.html?map=${FLEISCHSAMMLER_MAP_ID}&pin=${locality.pinId}` },
        ...documents.map(document => ({ ...document, icon: document.icon || `../Stammbäume/${locality.emblem}` }))]
    }
  });
  return Object.freeze({
    ...base, houses: [...base.houses, ...extraHouses], persons: people, partnerships, parentages,
    lineage: { ...base.lineage, founderPartnershipId: householdMarriageId,
      crestSubtitle: 'Haushalt im Jahr 1740', crestFrame: 'iron' },
    cadetBranches, timeJumps: [], view: { ...base.view, focusPersonId },
    extensions: { blankFamily: false, sourceRevision: 1,
      sourceNote: `Nutzerauftrag vom 2. November 2026. Neue Rheunwaith-Familie und heutiger Landhaushalt; frühere Generationen sind nicht ausgearbeitet. ${sourceNote}`.trim(),
      houseBiographyModule: biography }
  });
}
