import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { GOFRANN_PEOPLE, GOFRANN_MARRIAGES, GOFRANN_EMBLEM, TLAWD_EMBLEM, gofrannPerson } from '../../../../AleriaAlmanach/modules/gofrann-schmiede/gofrann-people.mjs';
import { HOUSE_BIOGRAPHY } from '../../../../Familien Häuser und Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gofrann/haus.biography.mjs';

export function gofrannFamilyPerson(key, options = {}) {
  const p = gofrannPerson(key);
  const portrait = p.portrait.startsWith('../Stammbäume/') ? p.portrait.slice('../Stammbäume/'.length) : `../AleriaAlmanach/${p.portrait.slice(2)}`;
  return createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex,
    birth: p.birth, death: p.death, houseId: p.maidenHouseUnknown ? '' : `house-${p.house}`,
    portrait, title: p.role, notes: p.bio, familyRole: p.maidenHouseUnknown || p.house === 'tlawd' ? 'married' : 'core',
    lineageRole: p.head ? 'head' : 'branch',
    extensions: { registryManagedFields: ['name','houseId','portrait','title','notes'], portraitAge: p.portraitAge }, ...options });
}
export function gofrannFamilyMarriage(definition, counterpart = '') {
  return createMarriage(definition.id, ...definition.keys.map(key => gofrannPerson(key).id), {
    start: definition.start, end: definition.end || '', status: definition.end ? 'ended' : 'active',
    extensions: { registryManagedFields: ['start'], ...(counterpart ? { crossFamilyRelationship: { linkId: definition.id, counterpartFamilyId: counterpart } } : {}) }
  });
}
const profile = createHouseProfileFromFolderPath(['Cenyr','Celtigerns Wacht','Llamreis Ankunft','Gwynthor'], {
  rankId: 'commoner', liegeHouseId: 'haus-tlawd', liegeHouseName: 'Haus Tlawd'
});
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-gofrann', title: 'Haus Gofrann', emblem: GOFRANN_EMBLEM,
  houseProfile: profile, toYear: '1638', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Edern und Caradfan',
  pendingDescendantReview: false,
  description: 'Bürgerliche Waffen- und Harnischmeister aus Gwynthors Innenstadt. Die Vettern Gethin und Bleddyn führen die Familienschmiede Zum Dritten Funken. Haus Tlawd hält einen bedeutenden Anteil, liefert Erz und erhält den Lehnsanteil; über Tlawd stehen die Gofrann im Gefolge der Gafyr.' });
const firstChildren = ['edern','caradfan'].map(key => gofrannPerson(key).id);
export const HOUSE_GOFRANN_FAMILY = Object.freeze({
  ...base,
  document: { ...base.document, motto: 'Stahl und Wort.' },
  persons: [...base.persons.map((p, i) => ({ ...p, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', birth: '', death: '????' })),
    ...GOFRANN_PEOPLE.map(p => gofrannFamilyPerson(p.key))],
  houses: [{ ...base.houses[0], motto: 'Stahl und Wort.' }, { id: 'house-tlawd', name: 'Haus Tlawd', emblem: TLAWD_EMBLEM, status: 'active' }],
  partnerships: [...base.partnerships.map(m => ({ ...m, status: 'ended', certainty: 'unknown' })),
    ...GOFRANN_MARRIAGES.map(m => gofrannFamilyMarriage(m, m.counterpart || ''))],
  parentages: [
    ...createParentages(firstChildren, base.partnerships[0].participantIds, base.lineage.founderPartnershipId,
      { type: 'claimed', certainty: 'unknown', notes: 'Die Brüder gehören zur späteren Gofrann-Linie; die dazwischenliegenden Generationen sind nicht einzeln überliefert.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...GOFRANN_MARRIAGES.flatMap(m => createParentages(m.children.map(key => gofrannPerson(key).id), m.keys.map(key => gofrannPerson(key).id), m.id))
  ],
  cadetBranches: [createMarriedAwayBranch({ id: 'married-away-ulaena-tlawd', name: 'Haus Tlawd',
    parentPartnershipId: 'marriage-lludd-ulaena', houseId: 'house-tlawd', targetFamilyId: 'haus-tlawd',
    emblem: TLAWD_EMBLEM, crestFrame: 'silver', notes: 'Ulaena heiratete Lludd Tlawd. Owain und Leisa sowie die Fortsetzung dieser Linie stehen ausschließlich in der Tlawd-Akte.' })],
  timeJumps: [{ ...base.timeJumps[0], childIds: firstChildren, fromYear: '', extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestFrame: 'iron', crestSubtitle: 'Bürgerliche Waffen- und Harnischmeister · Gwynthor' },
  view: { ...base.view, focusPersonId: gofrannPerson('gethin').id, limitGenerations: false, ancestorDepth: 8, descendantDepth: 8 },
  extensions: { ...base.extensions, blankFamily: false, preparedTimeJump: false, sourceRevision: 1,
    publication: { allowed: true, authorizedAt: '2026-10-17', reason: 'Nutzer gibt alle vorbereiteten Module für master frei.' },
    houseBiographyModule: HOUSE_BIOGRAPHY,
    sourceNote: 'Lokaler Nutzerentwurf vom 16.10.2026. Gründerpaar → Hauswappen → ein serieller Zeitsprung → Brüder Edern und Caradfan → deren Söhne Gethin und Bleddyn als Vettern. Einion und Ulaena behalten bestehende Identitäten und Ehen. Frauenlinien werden beim jeweiligen Gemahl fortgeführt. Keine Online-Veröffentlichung freigegeben.' }
});
