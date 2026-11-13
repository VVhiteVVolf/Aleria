import { createFounderTimeJumpPlaceholderHouseFamily } from '../blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from '../family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../../domain/house-profile.js';
import { HALENRHYD_PEOPLE, HALENRHYD_COUPLES, HALENRHYD_EMBLEM } from './stud-roster.mjs';
import { AURDDEN_FAMILY_PEOPLE } from '../aurdden-people.js';
import { createAurddenPerson, AURDDEN_EMBLEM } from '../aurdden-loer-engagement.js';
import { CAEFFYN_EMBLEM, createMaelrigCaeffyn, createKyriaCaeffynMarriage } from '../caeffyn-aurdden-marriage.js';

const profile = liege => createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner', ...liege });
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-halenrhyd', title: 'Familie Halenrhyd', emblem: HALENRHYD_EMBLEM,
  houseProfile: profile({ liegeHouseId: 'house-wyrm', liegeHouseName: 'Haus Wyrm' }), toYear: '1664',
  timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Idren Halenrhyd', pendingDescendantReview: false,
  description: 'Große bürgerliche Familie im Dienst der Wyrm. Drei Brüder führen Stadtgestüt, Landgestüt und eigenen Futterhof; ein Sitz im Achterrat der Klingenden Münze.' });
const couples = HALENRHYD_COUPLES.map(([key, first, second, children]) => ({ children, relation: createMarriage(`marriage-halenrhyd-${key}`, first, second,
  { ...(key === 'eltern' ? { status: 'ended', end: '1733' } : {}), extensions: children.length === 1 ? { chartAlignParentPairOverChildPersonId: children[0] } : { chartAlignChildGroupBelowParentPair: true } }) }));
export const HOUSE_HALENRHYD_FAMILY = Object.freeze({ ...base,
  persons: [...base.persons, ...HALENRHYD_PEOPLE.map(person => createFamilyPerson({ ...person, familyRole: person.spouse ? 'married' : 'core',
    lineageRole: person.id === 'gorweth-halenrhyd' ? 'head' : 'branch', extensions: { authoredSource: 'gwynthor-horse-studs-20261113', portraitIntentionallyAbsent: !person.portrait } }))],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, ...couples.map(c => c.relation)],
  parentages: [...createParentages(['idren-halenrhyd'], base.partnerships[0].participantIds, base.partnerships[0].id, { type: 'claimed', certainty: 'unknown', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...couples.flatMap(({ children, relation }) => createParentages(children, relation.participantIds, relation.id))],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['idren-halenrhyd'] }],
  extensions: { ...base.extensions, blankFamily: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1', sourceNote: 'Ausarbeitung nach Nutzerauftrag vom 13. November 2026. Drei Betriebszweige; nur Gorweth und Eirfena mit Porträts, übrige Angehörige mit Silhouetten.' }
});

// The small Caeffyn tree intentionally starts with the living couple.
const maelrig = createMaelrigCaeffyn(), kyria = createAurddenPerson(AURDDEN_FAMILY_PEOPLE.find(p => p.id === 'kyria-aurdden'));
export const HOUSE_CAEFFYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: 'haus-caeffyn', title: 'Familie Caeffyn', motto: '', description: 'Maelrig Caeffyn aus dem Ährental und seine Frau Kyria Aurdden. Standortleitung und Finanzverwaltung von Rhosmeres Rösser in Gwynthor; keine Kinder.', emblem: CAEFFYN_EMBLEM, houseProfile: profile({}) },
  houses: [{ id: 'house-caeffyn', name: 'Familie Caeffyn', emblem: CAEFFYN_EMBLEM, status: 'active', motto: '' }, { id: 'house-aurdden', name: 'Familie Aurdden', emblem: AURDDEN_EMBLEM, status: 'active', motto: '' }],
  persons: [maelrig, { ...kyria, familyRole: 'married' }], partnerships: [createKyriaCaeffynMarriage('haus-aurdden')], parentages: [], cadetBranches: [], timeJumps: [],
  lineage: { founderPersonIds: [maelrig.id], founderPartnershipId: 'marriage-maelrig-caeffyn-kyria-aurdden', crestSubtitle: 'Ährental · Gwynthor', showHouseCrest: true },
  view: { focusPersonId: maelrig.id, ancestorDepth: 1, descendantDepth: 1, limitGenerations: false },
  extensions: { sourceRevision: 1, chartLayoutPolicy: 'strict-v1', sourceNote: 'Weitere Caeffyn-Verwandte werden auf Nutzerwunsch zunächst übersprungen. Keine unbekannten Eltern als wirkliche Figuren ergänzt.' }
});
