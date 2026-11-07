import { createFounderTimeJumpPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { LAND_FAMILIEN_ROSTER } from './landfamilien-roster.mjs';
import { LAND_FAMILIEN_PREVIOUS_DEFAULTS } from './landfamilien-previous-defaults.mjs';
import { fleischsammlerFamilyLocality } from './localities.mjs';

const FIRST_MARRIAGES = {
  tirfelyn: 'marriage-caradog-enid-tirfelyn',
  helfaen: 'marriage-cadwgan-dilys-helfaen',
  marchwern: 'marriage-gwrgi-mared-marchwern'
};

function rosterPerson(record, familyId, { external = false } = {}) {
  const previous = LAND_FAMILIEN_PREVIOUS_DEFAULTS[familyId]?.persons[record.id];
  const managed = previous ? Object.keys(previous) : [];
  const appearance = `${record.hairColor.includes('lockig') ? 'braunes lockiges' : record.hairColor === 'rot' ? 'rotes' : 'braunes'} Haar, ${record.eyeColor}e Augen`;
  const externalHome = external ? fleischsammlerFamilyLocality(record.family).placeName : '';
  const externalTitle = external ? `${record.status === 'dead' ? 'Verstorbene auswärtige Verlobte' : 'Auswärtiger Verlobter'} · ${externalHome}` : '';
  return createFamilyPerson({
    id: record.id, name: record.name, birth: record.birth, death: record.death,
    status: record.status, sex: record.sex, houseId: record.houseId,
    familyRole: external ? 'married' : record.familyRole,
    lineageRole: record.workGroup === 'leitung' ? 'head' : 'branch',
    portrait: record.portrait, title: externalTitle || record.role,
    notes: `${record.age} Jahre${record.status === 'dead' ? ' bei ihrem Tod' : ''}. ${record.bio}${external ? ` ${record.status === 'dead' ? 'Stammte vom' : 'Wohnort:'} ${externalHome}; gehört zum dortigen Haushalt.` : ''} Erscheinung: ${appearance}; ${record.hairstyle}.`,
    tags: [`${record.age} Jahre`, ...(external ? ['Auswärtige Verlobtenperson', `Wohnort: ${externalHome}`] : [])],
    extensions: { authoredSource: 'gwynthor-landfamilien-20261107',
      landfamilienResident: !external, landfamilienWorkGroup: record.workGroup,
      ...(previous ? { registryManagedFields: managed,
        registryManagedFieldRevisions: Object.fromEntries(managed.map(field => [field, 2])),
        registryManagedFieldPreviousValues: Object.fromEntries(managed.map(field => [field, [previous[field]]])) } : {}) }
  });
}

function marriagesFor(family) {
  const byId = new Map(family.persons.map(person => [person.id, person]));
  return family.persons.filter(person => person.partnerId && person.sex === 'male' && byId.has(person.partnerId)).map((person, index) => {
    const partner = byId.get(person.partnerId);
    const id = index === 0 ? FIRST_MARRIAGES[family.slug]
      : `marriage-${person.id}-${partner.id}`;
    const children = family.persons.filter(child => child.parentIds.includes(person.id) && child.parentIds.includes(partner.id));
    return createMarriage(id, person.id, partner.id, { notes: 'Gemeinsamer Familienhaushalt; kein genaues Hochzeitsjahr festgelegt.',
      extensions: children.length === 1 ? { chartAlignParentPairOverChildPersonId: children[0].id }
        : { chartAlignChildGroupBelowParentPair: true } });
  });
}

export function createLandfamilienFamily(slug, biography) {
  const roster = LAND_FAMILIEN_ROSTER.families.find(family => family.slug === slug);
  const locality = fleischsammlerFamilyLocality(slug);
  const title = `Familie ${locality.surname}`;
  const base = createFounderTimeJumpPlaceholderHouseFamily({
    id: roster.familyId, title, emblem: locality.emblem,
    houseProfile: normalizeHouseProfile({ rankId: 'commoner', kingdom: 'Cenyr', county: 'Celtigerns Wacht',
      barony: 'Llamreis Ankunft', seat: locality.placeName,
      folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }),
    description: biography.description,
    toYear: String(Math.min(...roster.persons.filter(person => roster.lineageChildIds.includes(person.id)).map(person => Number(person.birth)))),
    timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis zur heutigen Familie'
  });
  const marriages = marriagesFor(roster);
  const ownPeople = roster.persons.map(person => rosterPerson(person, roster.familyId));
  const sharedEngagement = LAND_FAMILIEN_ROSTER.engagement;
  const externalId = slug === 'tirfelyn' ? 'gorwyn-helfaen' : slug === 'helfaen' ? 'ceridwen-tirfelyn' : '';
  const externalRoster = externalId ? LAND_FAMILIEN_ROSTER.families.flatMap(family => family.persons).find(person => person.id === externalId) : null;
  const externalPerson = externalRoster ? rosterPerson(externalRoster, roster.familyId, { external: true }) : null;
  const parentages = roster.persons.filter(person => person.parentIds.length).flatMap(person => {
    const marriage = marriages.find(entry => person.parentIds.every(id => entry.participantIds.includes(id)));
    return createParentages([person.id], person.parentIds, marriage.id);
  });
  return Object.freeze({
    ...base,
    persons: [...base.persons.map(person => createFamilyPerson({ ...person,
      name: person.sex === 'male' ? 'Unbekannter Gründer' : 'Unbekannte Gründerin',
      worldPersonId: `person--${roster.familyId}--${person.id}` })), ...ownPeople, ...(externalPerson ? [externalPerson] : [])],
    partnerships: [
      { ...base.partnerships[0], status: 'ended', certainty: 'unknown', notes: 'Historisches unbekanntes Gründerpaar vor der Überlieferungslücke.' },
      ...marriages,
      ...(externalPerson ? [createMarriage(sharedEngagement.id, ...sharedEngagement.participantIds, {
        type: sharedEngagement.type, status: sharedEngagement.status, end: sharedEngagement.end,
        notes: sharedEngagement.notes,
        extensions: { linkedFamilyIds: ['haus-tirfelyn', 'haus-helfaen'] }
      })] : [])
    ],
    parentages: [
      ...createParentages(roster.lineageChildIds, base.partnerships[0].participantIds, base.lineage.founderPartnershipId, {
        type: 'claimed', certainty: 'unknown',
        notes: 'Familienzugehörigkeit über unbekannte Generationen; keine unmittelbare biologische Elternschaft. Die konkreten heutigen Zweige beginnen erst hinter diesem Sprung.',
        extensions: { timeJumpId: base.timeJumps[0].id }
      }), ...parentages
    ],
    houses: [...base.houses, ...(externalPerson ? [{ id: externalRoster.houseId,
      name: `Familie ${externalId === 'gorwyn-helfaen' ? 'Helfaen' : 'Tirfelyn'}`,
      emblem: fleischsammlerFamilyLocality(externalId === 'gorwyn-helfaen' ? 'helfaen' : 'tirfelyn').emblem,
      status: 'active' }] : [])],
    timeJumps: [{ ...base.timeJumps[0], childIds: [...roster.lineageChildIds],
      extensions: { ...base.timeJumps[0].extensions, preparedPlaceholder: false } }],
    lineage: { ...base.lineage, crestSubtitle: `${roster.livingCount} lebende Familienangehörige · ${locality.placeName}` },
    view: { ...base.view, focusPersonId: roster.lineageChildIds[0], limitGenerations: false },
    extensions: { ...base.extensions, sourceRevision: 2, blankFamily: false, preparedTimeJump: false,
      chartLayoutPolicy: 'strict-v1',
      ...(roster.lineageChildIds.length === 1 ? { chartAlignLineageOriginOverPersonId: roster.lineageChildIds[0] } : {}),
      registryManagedLineageFields: ['founderPartnershipId', 'crestSubtitle'],
      registryManagedLineageFieldRevisions: { founderPartnershipId: 2, crestSubtitle: 2 },
      registryManagedExtensionFields: ['blankFamily', 'preparedTimeJump', 'chartLayoutPolicy',
        ...(roster.lineageChildIds.length === 1 ? ['chartAlignLineageOriginOverPersonId'] : [])],
      registryManagedExtensionFieldRevisions: { blankFamily: 2, preparedTimeJump: 2, chartLayoutPolicy: 2, chartAlignLineageOriginOverPersonId: 2 },
      houseBiographyModule: biography,
      sourceNote: `Nutzerauftrag vom 7. November 2026: ${roster.livingCount} lebende eigene Angehörige; unbekannte historische Gründer und serieller Überlieferungssprung. Bestehende IDs erhalten. Lebensalter beziehen sich auf 1740. Neue Namen, Verwandtschaften und Aufgaben sind ausdrücklich beauftragte Ausarbeitung. Externe Verlobtenkarten zählen nicht zum örtlichen Haushalt. Angeheiratete Herkunftsfamilien bleiben offen.` }
  });
}
