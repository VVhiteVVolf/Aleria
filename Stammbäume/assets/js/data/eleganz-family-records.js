import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch, createMigrationHouseBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ELEGANZ_PEOPLE, ELEGANZ_MARRIAGES, ELEGANZ_EMBLEMS, eleganzPerson } from '../../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-family-people.mjs';

export function eleganzFamilyPerson(key, options = {}) {
  const p = eleganzPerson(key);
  return createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex,
    birth: p.birth, death: p.death || '', houseId: p.maidenHouseUnknown ? '' : `house-${p.house}`,
    title: p.role, notes: p.bio, portrait: `../AleriaAlmanach/${p.portrait.slice(2)}`,
    familyRole: ['gwenora','rhiain','luciano','maelwen'].includes(key) ? 'married' : 'core',
    extensions: { registryManagedFields: ['title','notes','portrait'] }, ...options });
}
export const eleganzPid = key => eleganzPerson(key).id;
const house = (slug, name = slug[0].toUpperCase()+slug.slice(1)) => ({ id: `house-${slug}`, name: `Haus ${name}`, status: 'active', emblem: ELEGANZ_EMBLEMS[slug] || '' });
export function eleganzMarriage(key, counterpartFamilyId = '') {
  const m = ELEGANZ_MARRIAGES[key];
  return createMarriage(m.id, ...m.people.map(eleganzPid), { start: m.start, end: m.end || '', status: m.status,
    notes: key === 'founders' ? 'Matteo blieb bei Gwenora in Gwynthor; ihr Geschäft begründete die Raves-Linie.' : key === 'tiberian' ? 'Tiberian und Maelwen leben mit ihrer Tochter in Gwynthor.' : '',
    extensions: counterpartFamilyId ? { crossFamilyRelationship: { linkId: m.id, counterpartFamilyId } } : {} });
}

const ravesProfile = createHouseProfileFromFolderPath(['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor'], { rankId: 'commoner', liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' });
const veltraneProfile = createHouseProfileFromFolderPath(['Kaiserreich Argentum','Unsortiert'], { rankId: 'commoner' });
const unknownSpouse = (key, destination) => createFamilyPerson({ id: `unbekannter-gemahl-${key}-raves`, name: 'Unbekannter Gemahl', sex: 'male',
  houseId: `house-unbekannt-${key}-raves`, familyRole: 'married', notes: `In ${destination} verheiratet; sein Name ist nicht überliefert.` });

export const HOUSE_RAVES_FAMILY = Object.freeze({
  schema: 'aleria.family-tree', schemaVersion: 1,
  document: { id: 'haus-raves', title: 'Haus Raves', motto: '', emblem: ELEGANZ_EMBLEMS.raves, houseProfile: ravesProfile,
    description: 'Gwynthorer Zweig der Veltrane aus Tirnara. Aus Matteo Veltranes und Gwenora Maerllys’ Krämerladen entstand die Göttliche Eleganz, heute unter Eleonora Cassia Raves die angesehenste Schneiderei der Innenstadt.' },
  houses: [house('raves'),house('veltrane'),house('maerllys'),house('coeddu'),
    { id: 'house-unbekannt-livia-raves', name: 'Unbekanntes Haus · Venalys', emblem: '', status: 'active' },
    { id: 'house-unbekannt-flavia-raves', name: 'Unbekanntes Haus · Tirnara', emblem: '', status: 'active' }],
  persons: [...ELEGANZ_PEOPLE.map(p => eleganzFamilyPerson(p.key)), unknownSpouse('livia','Venalys'), unknownSpouse('flavia','Tirnara')],
  partnerships: [eleganzMarriage('founders','haus-maerllys'), eleganzMarriage('parents'), eleganzMarriage('eleonora'), eleganzMarriage('tiberian','haus-coeddu'),
    createMarriage('marriage-livia-unknown-raves', eleganzPid('livia'), 'unbekannter-gemahl-livia-raves', { start: '1690', notes: 'Livia wurde nach Venalys verheiratet; der Gemahl bleibt unbenannt.' }),
    createMarriage('marriage-flavia-unknown-raves', eleganzPid('flavia'), 'unbekannter-gemahl-flavia-raves', { start: '1698', notes: 'Flavia wurde nach Tirnara verheiratet; der Gemahl bleibt unbenannt.' })],
  parentages: [
    ...createParentages(['lorenzo','livia','flavia'].map(eleganzPid), ELEGANZ_MARRIAGES.founders.people.map(eleganzPid), ELEGANZ_MARRIAGES.founders.id),
    ...createParentages(['eleonora','tiberian','orestian'].map(eleganzPid), ELEGANZ_MARRIAGES.parents.people.map(eleganzPid), ELEGANZ_MARRIAGES.parents.id),
    ...createParentages(['aurelio','lavinia'].map(eleganzPid), ELEGANZ_MARRIAGES.eleonora.people.map(eleganzPid), ELEGANZ_MARRIAGES.eleonora.id),
    ...createParentages(['serafina'].map(eleganzPid), ELEGANZ_MARRIAGES.tiberian.people.map(eleganzPid), ELEGANZ_MARRIAGES.tiberian.id)
  ],
  cadetBranches: ['livia','flavia'].map(key => createMarriedAwayBranch({ id: `married-away-${key}-raves`, name: `Unbekanntes Haus · ${eleganzPerson(key).destination}`,
    parentPartnershipId: `marriage-${key}-unknown-raves`, houseId: `house-unbekannt-${key}-raves`, targetFamilyId: 'haus-unbekannt', crestFrame: 'iron',
    notes: `${eleganzPerson(key).name} lebt in ${eleganzPerson(key).destination}; der Name ihres Gemahls bleibt offen.` })),
  timeJumps: [],
  lineage: { founderPartnershipId: ELEGANZ_MARRIAGES.founders.id, houseId: 'house-raves', crestSubtitle: 'Gwynthorer Schneider- und Handelshaus',
    crestEmblemScale: 0.86, crestFrame: 'iron', crestFrameScale: 1, timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: true, id: 'veltrane-origin-raves', houseId: 'house-veltrane', name: 'Haus Veltrane', subtitle: 'Stammhaus aus Tirnara · Kaiserreich Argentum',
      emblem: ELEGANZ_EMBLEMS.veltrane, emblemScale: 0.86, crestFrame: 'iron', frameScale: 1, childIds: [eleganzPid('matteo')], targetFamilyId: 'haus-veltrane',
      notes: 'Matteo begründete mit Gwenora Maerllys die in Gwynthor als Raves bekannte Linie.' } },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: { focusPersonId: eleganzPid('eleonora'), orientation: 'vertical', ancestorDepth: 8, descendantDepth: 8, limitGenerations: false, showSiblings: true },
  extensions: { blankFamily: false, sourceRevision: 1,
    sourceNote: 'Nutzervorgaben zur Göttlichen Eleganz vom 16.10.2026. Drei vollständig ausgearbeitete Generationen vom Gründerpaar bis Eleonora, anschließend drei Kinder. Eleonora 39, Tiberian 37, Orestian 36. Tiberians freie Braut ist Maelwen Coeddu; keine Gwyllach-Verbindung. Luciano stammt aus einem anderen, nicht einzeln überlieferten Veltrane-Zweig; eine nahe Verwandtschaft wird nicht behauptet.' }
});

const veltraneBase = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-veltrane', title: 'Haus Veltrane', emblem: ELEGANZ_EMBLEMS.veltrane,
  houseProfile: veltraneProfile, toYear: '1633', pendingDescendantReview: false,
  description: 'Mächtige bürgerliche Kaufmanns- und Seefahrerfamilie aus dem Tirnara-Teil des Kaiserreichs Argentum. Seit Jahrhunderten bringen ihre Schiffe Seide, Stoffe, Gewürze und Olivenöl nach Lothir und Estryll. Partner des Marktes der Fortuna und Stammhaus der Raves in Gwynthor.' });
export const HOUSE_VELTRANE_FAMILY = Object.freeze({
  ...veltraneBase,
  houses: [...veltraneBase.houses,house('maerllys'),house('raves')],
  persons: [...veltraneBase.persons.map((p,i) => ({ ...p, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', birth: '', death: '????' })), eleganzFamilyPerson('matteo'),eleganzFamilyPerson('gwenora')],
  partnerships: [...veltraneBase.partnerships.map(m => ({ ...m, status: 'ended', certainty: 'unknown' })), eleganzMarriage('founders')],
  parentages: createParentages([eleganzPid('matteo')],veltraneBase.partnerships[0].participantIds,veltraneBase.lineage.founderPartnershipId,
    { type: 'claimed', certainty: 'unknown', notes: 'Überlieferte Zugehörigkeit zum alten Stammhaus über nicht einzeln bekannte Generationen.', extensions: { timeJumpId: veltraneBase.timeJumps[0].id } }),
  timeJumps: [{ ...veltraneBase.timeJumps[0], childIds: [eleganzPid('matteo')], fromYear: '', label: 'Über Jahrhunderte gewachsene Handelsfamilie', extensions: { preparedPlaceholder: false } }],
  cadetBranches: [createMigrationHouseBranch({ id: 'raves-offshoot-veltrane', parentPersonId: eleganzPid('matteo'), name: 'Haus Raves · Gwynthor',
    houseId: 'house-raves', targetFamilyId: 'haus-raves', emblem: ELEGANZ_EMBLEMS.raves, crestFrame: 'iron', founded: '1662',
    notes: 'Matteo blieb bei Gwenora in Gwynthor. Die Nachkommen werden ausschließlich in der Raves-Akte fortgeführt.' })],
  view: { ...veltraneBase.view, limitGenerations: false },
  extensions: { blankFamily: false, sourceRevision: 1, sourceNote: 'Bürgerliches Stammhaus der Raves, vorläufig unter Kaiserreich Argentum / Unsortiert. Keine ungenannten Häfen, Adelstitel oder vollständige Hauptlinie erfunden. Die Zugehörigkeit Lucianos ist bekannt, seine konkrete Verwandtschaft zu Matteo bleibt offen.' }
});
