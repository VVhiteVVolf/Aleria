import { createFounderPlaceholderHouseFamily, createFounderTimeJumpPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { createFamilyPerson, createParentages } from '../family-record-builders.js';
import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { FLEISCHSAMMLER_MAP_ID, fleischsammlerFamilyLocality } from './localities.mjs';

// Original households keep their identities. An explicit continuation adds
// anonymous historical founders and a serial gap without inventing generations.
export function createGwynthorRuralFamily({ slug, description, people, partnerships, parentages,
  householdMarriageId, focusPersonId, biographyText, historyText, works, connections = [], documents = [],
  extraHouses = [], cadetBranches = [], sourceNote = '', continuation = null }) {
  const locality = fleischsammlerFamilyLocality(slug);
  const title = `Familie ${locality.surname}`;
  const profile = normalizeHouseProfile({ rankId: 'commoner', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
    barony: 'Llamreis Ankunft', seat: locality.placeName,
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] });
  const base = (continuation ? createFounderTimeJumpPlaceholderHouseFamily : createFounderPlaceholderHouseFamily)({ id: locality.familyId, title,
    emblem: locality.emblem, houseProfile: profile, description,
    toYear: continuation ? String(Math.min(...people.concat(continuation.people).filter(person => continuation.lineageChildIds.includes(person.id)).map(person => Number(person.birth)))) : undefined,
    timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis zur heutigen Familie' });
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
    ...base, houses: [...base.houses, ...extraHouses],
    persons: continuation ? [...base.persons.map(person => createFamilyPerson({ ...person,
      name: person.sex === 'male' ? 'Unbekannter Gründer' : 'Unbekannte Gründerin',
      worldPersonId: `person--${locality.familyId}--${person.id}` })), ...people, ...continuation.people] : people,
    partnerships: continuation ? [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' },
      ...partnerships.map(partnership => partnership.id === householdMarriageId ? { ...partnership,
        extensions: { ...partnership.extensions, chartAlignChildGroupBelowParentPair: true } } : partnership), ...continuation.partnerships] : partnerships,
    parentages: continuation ? [...createParentages(continuation.lineageChildIds, base.partnerships[0].participantIds, base.lineage.founderPartnershipId,
      { type: 'claimed', certainty: 'unknown', notes: 'Unbekannte Generationen; keine unmittelbare biologische Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id } }), ...parentages, ...continuation.parentages] : parentages,
    lineage: { ...base.lineage, founderPartnershipId: continuation ? base.lineage.founderPartnershipId : householdMarriageId,
      crestSubtitle: 'Haushalt im Jahr 1740', crestFrame: 'iron' },
    cadetBranches, timeJumps: continuation ? [{ ...base.timeJumps[0], childIds: continuation.lineageChildIds, extensions: { preparedPlaceholder: false } }] : [],
    view: { ...base.view, focusPersonId, ...(continuation ? { limitGenerations: false } : {}) },
    extensions: { blankFamily: false, sourceRevision: continuation ? 2 : 1,
      ...(continuation ? { preparedTimeJump: false, chartLayoutPolicy: 'strict-v1',
        registryManagedLineageFields: ['founderPartnershipId'], registryManagedLineageFieldRevisions: { founderPartnershipId: 2 },
        registryManagedExtensionFields: ['blankFamily', 'preparedTimeJump', 'chartLayoutPolicy'],
        registryManagedExtensionFieldRevisions: { blankFamily: 2, preparedTimeJump: 2, chartLayoutPolicy: 2 } } : {}),
      sourceNote: `Nutzerauftrag vom 2. November 2026. Neue Rheunwaith-Familie und heutiger Landhaushalt; frühere Generationen sind nicht ausgearbeitet. ${sourceNote}`.trim(),
      houseBiographyModule: biography,
      ...(continuation ? { sourceNote: `Nutzerauftrag vom 14. November 2026: bestehender Haushalt mit weiteren Arbeits- und Familienzweigen ergänzt. Unbekannte Gründer, Wappen und serieller Zeitsprung; bestehende Identitäten erhalten. Keine neuen Porträts. ${sourceNote}` } : {}) }
  });
}
