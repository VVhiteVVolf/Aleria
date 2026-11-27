import { createFounderTimeJumpPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { createFamilyPerson, createParentages } from '../family-record-builders.js';
import { normalizeHouseProfile } from '../../domain/house-profile.js';
import { CELTIGERNS_WACHT_FAMILY_SOURCE, CELTIGERNS_WACHT_FAMILY_SOURCES } from './family-sources.js';

function buildFamily(source) {
  const territory = `Herrschaft der ${source.patron}`;
  const base = createFounderTimeJumpPlaceholderHouseFamily({
    id: source.id,
    title: source.title,
    emblem: source.emblem,
    houseProfile: normalizeHouseProfile({
      rankId: source.rank,
      kingdom: 'Cenyr',
      county: 'Celtigerns Wacht',
      barony: 'Llamreis Ankunft',
      seat: source.seat || '',
      folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', territory],
    }),
    description: source.summary,
    toYear: '',
    timeJumpLabel: 'Ältere Generationen und Verbindungen offen',
  });
  const persons = source.people.map(person => createFamilyPerson({
    id: person.id,
    name: person.name,
    sex: person.sex,
    status: person.status,
    title: person.title,
    notes: person.bio,
    houseId: base.lineage.houseId,
    portrait: source.portraits[person.id],
    lineageRole: source.head === person.id ? 'head' : 'branch',
    extensions: {
      authoredSource: CELTIGERNS_WACHT_FAMILY_SOURCE,
      ...(person.age !== undefined ? { portraitAge: person.age } : {}),
      ...(person.ageEstimate ? { ageEstimate: person.ageEstimate } : {}),
    },
  }));
  const parentages = Object.entries(source.childrenByParent || {}).flatMap(([parentId, children]) =>
    createParentages(children, [parentId], '', { legitimacy: 'unknown' }));
  const childIds = new Set(parentages.map(parentage => parentage.childId));
  const roots = persons.filter(person => !childIds.has(person.id)).map(person => person.id);
  const jump = {
    ...base.timeJumps[0],
    id: `gap-${source.slug}-unrecorded-generations`,
    childIds: roots,
    fromYear: '',
    notes: 'Die einzelnen Karten hinter der Lücke sind die Ansatzpunkte der belegten Linien und der noch nicht zugeordneten Angehörigen.',
  };

  return Object.freeze({
    ...base,
    persons: [
      ...base.persons.map((person, index) => ({
        ...person, status: 'unknown', death: '',
        title: index === 0 && source.founderTitle ? source.founderTitle : 'Gründergeneration · offen',
        notes: 'Platzhalter für eine frühere Generation. Name, Lebensdaten und genaue Verbindungen sind offen.',
        extensions: { preparedPlaceholder: true },
      })),
      ...persons,
    ],
    partnerships: base.partnerships.map(pair => ({
      ...pair, certainty: 'unknown', status: 'unknown',
      notes: 'Platzhalter für die offene Gründergeneration.',
      extensions: { preparedPlaceholder: true },
    })),
    parentages,
    timeJumps: [jump],
    lineage: {
      ...base.lineage,
      crestSubtitle: source.rank === 'commoner' ? 'Bürgerfamilie' : 'Ritterhaus',
    },
    view: { ...base.view, limitGenerations: false },
    extensions: {
      ...base.extensions,
      blankFamily: false,
      chartLayoutPolicy: 'strict-v1',
      sourceRevision: 1,
      authoredOn: '2026-11-27',
      sourceNote: source.sourceNote,
      ...(roots.length === 1 ? { chartAlignLineageOriginOverPersonId: roots[0] } : {}),
    },
  });
}

export const CELTIGERNS_WACHT_SERVICE_FAMILIES = Object.freeze(CELTIGERNS_WACHT_FAMILY_SOURCES.map(buildFamily));
