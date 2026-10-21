import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { RHONWENS_TRAENEN_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { SKELLOR_PEOPLE, SKELLOR_EMBLEM } from '../../../../AleriaAlmanach/modules/schwarze-zitteraale/skellor-people.mjs?v=20261021-arvel-v1';
import { buildArvelBiography } from '../../../../AleriaAlmanach/modules/schwarze-zitteraale/arvel-biography.mjs?v=20261021-arvel-v1';

const houseId = 'house-skellor';
// Keep every relationship in Arvel's local group, including the childless victim.
const arvelLayout = {
  chartCenterBetweenPartnerPersonIds: ['unbekannt-opfer-1', 'eirlys-talinvyr', 'unbekannt-opfer-2', 'unbekannt-opfer-3'],
  chartKeepPartnerGroupTogether: true
};
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-skellor', title: 'Haus Skellor', emblem: SKELLOR_EMBLEM,
  houseProfile: RHONWENS_TRAENEN_VASSAL_PROFILES.skellor, toYear: '1647', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Caradog',
  description: '1720 entmachtetes Ritterhaus von Caer Creigfryn. Arvel Skellor überlebte als Schwarzer Zitteraal; das Haus ist nicht ausgestorben.' });
const marriages = [
  createMarriage('marriage-skellor-caradog-meirwen', 'caradog-skellor', 'meirwen', { start: '1672', end: '1716', status: 'ended' }),
  createMarriage('marriage-skellor-rhydan-enid', 'rhydan-skellor', 'enid', { start: '1697', end: '1720', status: 'ended' }),
  createMarriage('marriage-skellor-cadfan-olwen', 'cadfan-skellor', 'olwen', { start: '1701', end: '1720', status: 'ended' }),
  createMarriage('marriage-skellor-arvel-eirlys', 'arvel-skellor', 'eirlys-talinvyr', { start: '1720', end: '1720', status: 'widowed',
    notes: 'Eirlys ertrank schwanger auf der Flucht. Das ungeborene Kind wird ohne erfundenen Namen und ohne erfundenes Geschlecht in ihren Notizen bewahrt.' })
];
const victims = [1, 2, 3].map(number => createFamilyPerson({ id: `unbekannt-opfer-${number}`, name: 'Unbekannt', sex: 'female', status: 'unknown',
  houseId: '', familyRole: 'forced', portraitPlaceholder: 'female', title: `Opfer Arvels · ${number}`,
  notes: number < 3 ? `Opfer sexualisierter Gewalt; Mutter des ${number === 1 ? 'älteren' : 'jüngeren'} unehelichen Sohnes. Name, Alter und heutiger Aufenthaltsort bleiben unbekannt.` : 'Drittes unbekanntes Opfer. Keine Kinder festgelegt.',
  extensions: { relationshipContext: 'Opfer sexualisierter Gewalt; keine einvernehmliche Partnerschaft.', registryManagedFields: ['name', 'title', 'notes', 'portraitPlaceholder', 'familyRole'] } }));
const forced = victims.map((person, index) => createMarriage(`forced-arvel-opfer-${index + 1}`, 'arvel-skellor', person.id, { type: 'forced', status: 'active',
  visibility: 'secret', notes: 'Genealogische Verbindung zu einem Opfer sexualisierter Gewalt. Keine Ehe, keine Affäre und keine Aussage über eine gegenwärtige Gefangenschaft.',
  ...(index < 2 ? { extensions: {
    chartAlignPartnerOverChildrenPersonId: person.id,
    chartReserveLeafChildLane: true,
    registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId', 'chartReserveLeafChildLane']
  } } : {}) }));
const sons = [
  createFamilyPerson({ id: 'unbenannter-sohn-1722', name: 'Unbenannter Sohn', birth: '1722', sex: 'male', houseId, familyRole: 'bastard', portraitPlaceholder: 'child', title: 'Unehelicher Sohn · 18 Jahre',
    notes: 'Arvels älterer unehelicher Sohn; lebt nicht bei seinem Vater. Name, Lebensweg und Aufenthaltsort bleiben für die spätere Ausarbeitung offen.' }),
  createFamilyPerson({ id: 'unbenannter-sohn-1732', name: 'Unbenannter Sohn', birth: '1732', sex: 'male', houseId, familyRole: 'bastard', portraitPlaceholder: 'child', title: 'Unehelicher Sohn · 8 Jahre',
    notes: 'Arvels jüngerer unehelicher Sohn; lebt nicht bei seinem Vater. Name, Lebensweg und Aufenthaltsort bleiben für die spätere Ausarbeitung offen.' })
];

export const HOUSE_SKELLOR_FAMILY = Object.freeze({ ...base,
  persons: [...base.persons.map((p, index) => createFamilyPerson({ ...p, name: index ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', lineageRole: 'founder',
      extensions: { registryManagedFields: ['name', 'status', 'death', 'lineageRole', 'notes'] } })),
    ...SKELLOR_PEOPLE.map(person => createFamilyPerson({ ...person, title: person.role, notes: person.bio, lineageRole: person.lineageRole || 'branch',
      extensions: { ...(person.characterId ? { characterId: person.characterId, biographyModule: buildArvelBiography(), ...arvelLayout,
        registryManagedExtensionFields: Object.keys(arvelLayout) } : {}), registryManagedFields: ['name', 'title', 'notes', 'portrait'] } })), ...victims, ...sons],
  houses: [...base.houses, { id: 'house-talinvyr', name: 'Haus Talinvyr', motto: '', emblem: 'assets/images/houses/Rhonwens Tränen/Ritterliche/Talinvyr.png', status: 'active' }],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, ...marriages, ...forced],
  parentages: [
    ...createParentages(['caradog-skellor'], base.persons.map(person => person.id), base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown',
      notes: 'Hauskontinuität über nicht überlieferte Generationen; keine unmittelbare Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages(['rhydan-skellor', 'cadfan-skellor'], marriages[0].participantIds, marriages[0].id),
    ...createParentages(['arvel-skellor', 'alys-skellor', 'nerys-skellor'], marriages[1].participantIds, marriages[1].id),
    ...createParentages(['iorren-skellor', 'catrin-skellor'], marriages[2].participantIds, marriages[2].id),
    ...sons.flatMap((person, index) => createParentages([person.id], forced[index].participantIds, forced[index].id, { legitimacy: 'illegitimate', visibility: 'secret' }))
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['caradog-skellor'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Caer Creigfryn · entmachtet 1720', crestFrame: 'silver' },
  view: { ...base.view, focusPersonId: 'caradog-skellor', ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false, sourceRevision: 4, chartLayoutPolicy: 'strict-v1',
    registryManagedDocumentFields: ['description', 'emblem'],
    registryManagedExtensionFields: ['blankFamily', 'preparedTimeJump', 'pendingDescendantReview', 'chartLayoutPolicy'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth'],
    registryManagedLineageFields: ['crestSubtitle', 'crestFrame'],
    sourceNote: 'Ausarbeitung nach Nutzerauftrag vom 21.10.2026. Unbekannte Gründer, Wappenknoten und eine serielle Überlieferungslücke führen zu Caradog. Zwei Söhne begründen Haupt- und Nebenlinie. Alle benannten Angehörigen sind spätestens 1720 verstorben, außer Arvel. Drei unbekannte Opfer; zwei uneheliche Söhne (1722/1732) leben nicht bei ihm und behalten ausdrücklich Kindersilhouetten. Eirlys stammt aus dem bisher unausgearbeiteten Haus Talinvyr; ihre Eltern und dessen weitere Genealogie sind offen. Der alte Ausgestorben-Knoten wurde auf ausdrücklichen Nutzerwunsch aufgehoben.',
    registryTombstones: { cadetBranches: ['extinct-haus-skellor'] } }
});
