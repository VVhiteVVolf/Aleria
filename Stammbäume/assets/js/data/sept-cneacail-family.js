import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { CNEACAIL_FAMILY_PEOPLE } from '../../../../AleriaAlmanach/modules/cneacail-family/cneacail-people.mjs';
const emblem = 'assets/images/houses/Ceitheach/sept-cneacail.png', houseId = 'sept-cneacail';
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: houseId, title: 'Sept Cneacail', emblem,
  houseProfile: createHouseProfileFromFolderPath(['Ceitheach', 'Tir na Dorcha', 'Glaennmor', 'Bun na h-Aibhne'], { rankId: 'sept-head', liegeHouseId: 'house-seaghda', liegeHouseName: 'Mallacht Seaghda' }), toYear: '1670', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis zu Arrans Geschwistern',
  description: 'Einst wohlhabende Brauer- und Brennersept aus Bun na h-Aibhne, südlich von Glaennmor in Tir na Dorcha. Diente den Mallacht Seaghda. Die Plünderung durch Dämmergrunder Truppen 1720 überlebten aus der damaligen Sept nur Arran und seine Söhne Alasdair und Finlay. Im Exil zerstritten sich die Brüder. Finlay führt heute die Klingende Krone unter der Klingenden Münze; Alasdair den Letzten Heller. Die später angeheirateten Frauen und in Gwynthor geborenen Kinder gehörten nicht zur 1720 ausgelöschten Heimatlinie.' });
const founders = base.persons.map((p, i) => createFamilyPerson({ ...p, houseId, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer' }));
const historical = [
  { id: 'donnchadh-cneacail', name: 'Donnchadh Cneacail', sex: 'male', birth: '1670', title: 'Arrans älterer Bruder · Brauer', notes: 'Älterer Bruder Arrans. Bewirtschaftete mit Morna und Sohn Eoghan den Brauteil der Sept. Alle drei kamen bei der Plünderung 1720 ums Leben.' },
  { id: 'beathag-cneacail', name: 'Beathag Cneacail', sex: 'female', birth: '1677', title: 'Arrans jüngere Schwester · Haus und Vorräte', notes: 'Arrans unverheiratete jüngere Schwester. Führte Vorräte und Haushalt der Flusssiedlung. 1720 getötet; keine überlebende Nebenlinie.' },
  { id: 'maire-cneacail', name: 'Maire', sex: 'female', birth: '1676', title: 'Arrans Gemahlin · Mutter der Brüder', married: true, notes: 'Arrans Frau und Mutter von Alasdair und Finlay. Ihr Geburtshaus bleibt unbekannt. Starb bei der Plünderung 1720.' },
  { id: 'morna-cneacail', name: 'Morna', sex: 'female', birth: '1674', title: 'Donnchadhs Gemahlin', married: true, notes: 'Donnchadhs Frau; Herkunftshaus unbekannt. Mit ihrem Mann und Sohn 1720 getötet.' },
  { id: 'eoghan-cneacail', name: 'Eoghan Cneacail', sex: 'male', birth: '1698', title: 'Donnchadhs und Mornas Sohn · Brauergehilfe', notes: 'Vetter der Brüder. Arbeitete im Sudhaus und starb 1720 ohne eigene Kinder.' }
].map(p => createFamilyPerson({ ...p, death: '1720', houseId: p.married ? '' : houseId, familyRole: p.married ? 'married' : 'core' }));
const unions = [
  createMarriage('marriage-arran-maire', 'arran-cneacail', 'maire-cneacail', { start: '1695', end: '1720', status: 'ended' }),
  createMarriage('marriage-donnchadh-morna', 'donnchadh-cneacail', 'morna-cneacail', { start: '1696', end: '1720', status: 'ended' }),
  createMarriage('marriage-alasdair-nessa', 'alasdair-cneacail', 'nessa-cneacail', { start: '1720', end: '1735', status: 'ended', notes: 'Nach der Umwandlung der Taverne zum Bordell getrennt lebend; kein Tod und keine förmliche Scheidung behauptet.' }),
  createMarriage('marriage-finlay-lysiane', 'finlay-cneacail', 'lysiane-cneacail', { start: '1732' })
];
const siblingIds = ['donnchadh-cneacail', 'arran-cneacail', 'beathag-cneacail'];
export const SEPT_CNEACAIL_FAMILY = Object.freeze({ ...base,
  document: { ...base.document, motto: 'Was bleibt, gehört uns.' }, houses: [{ id: houseId, name: 'Sept Cneacail', status: 'active', emblem }],
  persons: [...founders, ...historical, ...CNEACAIL_FAMILY_PEOPLE.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex, birth: p.birth, death: p.death || '', houseId: ['lysiane', 'nessa'].includes(p.key) ? '' : houseId, familyRole: ['lysiane', 'nessa'].includes(p.key) ? 'married' : 'core', title: p.role, notes: p.bio, portrait: `../AleriaAlmanach/${p.portrait.slice(2)}`, extensions: { registryManagedFields: ['title', 'notes', 'portrait'] } }))],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, ...unions],
  parentages: [
    ...createParentages(siblingIds, founders.map(p => p.id), base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown', notes: 'Zugehörigkeit über den Überlieferungssprung; keine direkte Elternschaft der historischen Gründer.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages(['alasdair-cneacail', 'finlay-cneacail'], unions[0].participantIds, unions[0].id),
    ...createParentages(['eoghan-cneacail'], unions[1].participantIds, unions[1].id),
    ...createParentages(['eithne-cneacail', 'catriona-cneacail'], unions[2].participantIds, unions[2].id),
    ...createParentages(['aodhan-cneacail'], unions[3].participantIds, unions[3].id)
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: siblingIds, extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, houseId, crestSubtitle: 'Bun na h-Aibhne · Die beiden Brüder', crestEmblemScale: 0.87, crestFrame: 'wood' },
  view: { ...base.view, focusPersonId: 'arran-cneacail', limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, preparedTimeJump: true, pendingDescendantReview: false, sourceRevision: 2,
    registryAdditionalPlacements: [{ role: 'exile', label: 'Heutiger Aufenthalt · Gwynthor', folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner' }) }],
    sourceNote: 'Ausbau nach Nutzerauftrag vom 18.10.2026. Bestehende IDs der drei Männer erhalten. Gründerpaar → Hausknoten → serieller Zeitsprung → Arran und zwei Geschwister. Alle übrigen damaligen Angehörigen sterben spätestens 1720. Nessa heiratet erst in Gwynthor ein, Lysiane 1732; alle drei Kinder sind nach der Flucht geboren. Arran stirbt 1734 mit 62. Nessa geht 1735, beide volljährigen Töchter 1740. Keine aktuelle Tätigkeit der getrennten Frau oder Töchter im Bordell. Lysiane und Aodhan erhalten keine Betriebsämter.' }
});
