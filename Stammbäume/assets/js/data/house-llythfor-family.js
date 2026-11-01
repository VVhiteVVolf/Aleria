import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { createLlythforPerson, createLlythforPenruddMarriage } from './llythfor-penrudd-marriage.js';
import { TROETZLI_PEOPLE, LLYTHFOR_EMBLEM, LLYTHFOR_MARRIAGE_ID } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-household.mjs';
import { LLYTHFOR_RELATIVES, LLYTHFOR_PARENTS_MARRIAGE_ID, LLYTHFOR_BROTHER_MARRIAGE_ID } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/llythfor-relatives.mjs';
import { PENRUDD_EMBLEM } from '../../../../AleriaAlmanach/modules/rotes-tor/penrudd-household.mjs';
import { buildTroetzliBiography } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-biographies.mjs';

const relatives = LLYTHFOR_RELATIVES;
const parentIds = [relatives.gwyddno.id, relatives.gwenddydd.id];
const siblingIds = [relatives.edern.id, TROETZLI_PEOPLE.cynddelw.id, relatives.lliwen.id];
const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-llythfor', title: 'Haus Llythfor', emblem: LLYTHFOR_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'], { rankId: 'commoner' }),
  description: 'Kleine, bescheidene Gwynthorer Bürgerfamilie. Gwyddno und Gwenddydd haben drei Kinder: den Schuhflicker Edern, den Berichterstatter Cynddelw und die Näherin Lliwen. Edern und seine Frau Efrddyl haben einen Sohn, Gwrhyr; Cynddelw und Esyllt Penrudd die zehnjährige Eirlys. Die kleine Schuhflickerwerkstatt, Wasch- und Näharbeiten und Cynddelws Tätigkeit bei Celtigerns Echo tragen die Haushalte. Die ältere Herkunft bleibt hinter dem unbekannten Gründerpaar und einem einzigen Überlieferungssprung offen.',
  toYear: '1670', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Gwyddno',
});

// Retain the published anchor ID while moving the first known generation back.
const timeJump = {
  ...base.timeJumps[0], id: 'gap-llythfor-to-1698', childIds: [relatives.gwyddno.id],
  extensions: { preparedPlaceholder: false, registryManagedSourceRevision: 6,
    registryManagedFields: ['childIds', 'toYear', 'label', 'notes'],
    registryManagedFieldRevisions: { childIds: 6, toYear: 6, label: 6, notes: 6 },
    registryManagedExtensionFields: ['preparedPlaceholder'] },
};
const siblingParentages = createParentages(siblingIds, parentIds, LLYTHFOR_PARENTS_MARRIAGE_ID, {
  extensions: { registryManagedSourceRevision: 6,
    registryManagedFields: ['parentIds', 'partnershipId', 'type', 'legitimacy', 'certainty', 'notes'],
    registryManagedFieldRevisions: { parentIds: 6, partnershipId: 6, type: 6, legitimacy: 6, certainty: 6, notes: 6 },
    registryManagedExtensionFields: ['timeJumpId'] },
});

function relativePerson(key, person) {
  return createFamilyPerson({
    id: person.id, worldPersonId: person.worldPersonId, name: person.name, sex: person.sex, birth: person.birth,
    houseId: person.spouse ? '' : 'house-llythfor', familyRole: person.spouse ? 'married' : 'core',
    title: person.role, notes: person.bio, tags: ['Gwynthor'],
    extensions: { household: 'city', culture: 'Cenyri', biographyModule: buildTroetzliBiography(key) },
  });
}

export const HOUSE_LLYTHFOR_FAMILY = Object.freeze({
  ...base,
  houses: [...base.houses.map(house => ({ ...house, extensions: {
    registryManagedFields: ['emblem'], registryManagedFieldRevisions: { emblem: 6 },
  } })), { id: 'house-penrudd', name: 'Haus Penrudd', emblem: PENRUDD_EMBLEM, status: 'active' }],
  persons: [...base.persons, ...Object.entries(relatives).map(([key, person]) => relativePerson(key, person)),
    createLlythforPerson('cynddelw', { lineageRole: 'head' }),
    createLlythforPerson('esyllt', { familyRole: 'married' }), createLlythforPerson('eirlys')],
  partnerships: [...base.partnerships,
    createMarriage(LLYTHFOR_PARENTS_MARRIAGE_ID, ...parentIds, { start: '1693', extensions: { chartAlignChildGroupBelowParentPair: true } }),
    createMarriage(LLYTHFOR_BROTHER_MARRIAGE_ID, relatives.edern.id, relatives.efrddyl.id, { start: '1720',
      extensions: { chartAlignParentPairOverChildPersonId: relatives.gwrhyr.id } }),
    createLlythforPenruddMarriage('haus-penrudd')],
  parentages: [
    ...createParentages([relatives.gwyddno.id], base.partnerships[0].participantIds, base.lineage.founderPartnershipId,
      { type: 'claimed', certainty: 'unknown', notes: 'Unbekannte Generationen; keine unmittelbare biologische Elternschaft behauptet.', extensions: { timeJumpId: timeJump.id } }),
    ...siblingParentages,
    ...createParentages([relatives.gwrhyr.id], [relatives.edern.id, relatives.efrddyl.id], LLYTHFOR_BROTHER_MARRIAGE_ID),
    ...createParentages([TROETZLI_PEOPLE.eirlys.id], [TROETZLI_PEOPLE.cynddelw.id, TROETZLI_PEOPLE.esyllt.id], LLYTHFOR_MARRIAGE_ID),
  ],
  timeJumps: [timeJump],
  view: { ...base.view, ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false,
    sourceRevision: 6, registryManagedEntitySourceRevision: 4, chartLayoutPolicy: 'strict-v1',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedDocumentFieldRevisions: { emblem: 6, description: 6 },
    registryTombstones: { cadetBranches: ['linked-esyllt-penrudd-llythfor'] },
    sourceNote: 'Nutzerauftrag vom 31.10.2026: kleine bescheidene Familie um Cynddelw. Neun bekannte Personen: Eltern Gwyddno und Gwenddydd, Bruder Edern mit Frau Efrddyl und Sohn Gwrhyr, Schwester Lliwen sowie Cynddelw, Esyllt und Eirlys. Unbekannte Gründer → Hauswappen → genau ein serieller Zeitsprung → Eltern → drei Geschwister → zwei Enkel in ihren jeweiligen Elternzweigen. Die Penrudd-Gegenakte endet an der Llythfor-Verknüpfung. Kein Penrudd-Herkunftsknoten unter der Ehe in dieser Akte. Personen- und Ehe-IDs des bestehenden Haushalts bleiben unverändert; Eirlys bleibt zehn Jahre alt, geboren 1730. Unbekannte Herkunftsfamilien der Angeheirateten bleiben offen.',
  },
});
