import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { createLlythforPerson, createLlythforPenruddMarriage } from './llythfor-penrudd-marriage.js';
import { TROETZLI_PEOPLE, LLYTHFOR_EMBLEM, LLYTHFOR_MARRIAGE_ID } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-household.mjs';
import { PENRUDD_EMBLEM } from '../../../../AleriaAlmanach/modules/rotes-tor/penrudd-household.mjs';

const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-llythfor', title: 'Haus Llythfor', emblem: LLYTHFOR_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner' }),
  description: 'Kleiner Gwynthorer Bürgerhaushalt des Berichterstatters Cynddelw Llythfor, seiner Frau Esyllt Penrudd und ihrer Tochter Eirlys. Ein eigenes Wappen ist noch nicht festgelegt; der schlichte braune Platzhalter bleibt bestehen.',
  toYear: '1698', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Cynddelw',
});
const parents = [TROETZLI_PEOPLE.cynddelw.id, TROETZLI_PEOPLE.esyllt.id];

export const HOUSE_LLYTHFOR_FAMILY = Object.freeze({
  ...base,
  houses: [...base.houses, { id: 'house-penrudd', name: 'Haus Penrudd', emblem: PENRUDD_EMBLEM, status: 'active' }],
  persons: [...base.persons,
    createLlythforPerson('cynddelw', { lineageRole: 'head' }),
    createLlythforPerson('esyllt', { familyRole: 'married' }), createLlythforPerson('eirlys')],
  partnerships: [...base.partnerships, createLlythforPenruddMarriage('haus-penrudd')],
  parentages: [
    ...createParentages([parents[0]], base.partnerships[0].participantIds, base.lineage.founderPartnershipId,
      { type: 'claimed', certainty: 'unknown', notes: 'Unbekannte Generationen; keine unmittelbare biologische Elternschaft behauptet.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages([TROETZLI_PEOPLE.eirlys.id], parents, LLYTHFOR_MARRIAGE_ID),
  ],
  cadetBranches: [createMarriedAwayBranch({
    id: 'linked-esyllt-penrudd-llythfor', name: 'Esyllts Herkunft · Haus Penrudd',
    parentPartnershipId: LLYTHFOR_MARRIAGE_ID, houseId: 'house-penrudd',
    targetFamilyId: 'haus-penrudd', emblem: PENRUDD_EMBLEM, crestFrame: 'iron',
    extensions: { chartAlignBelowPartnership: true, registryManagedExtensionFields: ['chartAlignBelowPartnership'] },
  })],
  timeJumps: [{ ...base.timeJumps[0], childIds: [parents[0]], extensions: { preparedPlaceholder: false } }],
  view: { ...base.view, ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false,
    sourceRevision: 4, chartLayoutPolicy: 'strict-v1',
    sourceNoteAddendum: 'Nutzerkorrektur vom 31.10.2026: Eirlys ist zehn Jahre alt, geboren 1730 statt der zuvor angenommenen 1732. Neues Einzelporträt mit zwei Zöpfen, Malstift, Papierfetzen und Zahnlücke. Personen-ID und Verwandtschaft bleiben unverändert.',
    sourceNote: 'Nutzerauftrag vom 31.10.2026: neuer bislang unbelegter Nachname Llythfor, jüngste Penrudd-Tochter als Ehefrau, Stadt-Haushalt mit der Tochter, die Trötzli benannte. Keine zusätzliche Verwandtschaft oder eigenes Hauswappen erfunden. Unbekanntes Gründerpaar → brauner Hausknoten → genau ein serieller Zeitsprung → Cynddelw und Esyllt → Eirlys. Die Penrudd-Gegenakte endet an der Hausverknüpfung; die Tochter erscheint nur hier.',
  },
});
