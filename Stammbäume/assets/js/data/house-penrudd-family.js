import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages, createMarriedAwayBranch } from './family-record-builders.js';
import { createLlythforPerson, createLlythforPenruddMarriage } from './llythfor-penrudd-marriage.js';
import { TROETZLI_PEOPLE, LLYTHFOR_EMBLEM, LLYTHFOR_MARRIAGE_ID } from '../../../../AleriaAlmanach/modules/gwynthor-troetzli/troetzli-household.mjs';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import {
  PENRUDD_MOTTO, PENRUDD_EMBLEM, PENRUDD_PEOPLE, PENRUDD_MARRIAGES,
  PENRUDD_DESCENDANTS, PENRUDD_HOLDINGS
} from '../../../../AleriaAlmanach/modules/rotes-tor/penrudd-household.mjs';

const houseId = 'house-penrudd';
const personId = key => `${key}-penrudd`;
const marriageId = key => `marriage-${key}-penrudd`;
const base = createFounderTimeJumpPlaceholderHouseFamily({
  id: 'haus-penrudd', title: 'Haus Penrudd', emblem: PENRUDD_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(
    ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor'],
    { rankId: 'commoner', secondarySeats: ['Zum Roten Tor', 'Penrudd-Hof'], liegeHouseId: 'house-draig', liegeHouseName: 'Haus Draig' }
  ),
  toYear: '1642', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Madoc',
  description: 'Eigenständige cenyrische Wirts- und Bauernfamilie im Bannkreis Gwynthors. Gwilyms Familie führt die Herberge Zum Roten Tor; sein jüngerer Bruder Tudur bewirtschaftet mit Kindern und Enkeln den nahen Penrudd-Hof. Beide Haushalte rechnen ihre Lieferungen miteinander ab. Keine genealogische Verbindung zu Haus Penry aus Talgarth.'
});
const founders = base.persons.map((person, index) => createFamilyPerson({
  ...person, name: index ? 'Unbekannte Gründerin' : 'Unbekannter Gründer',
  status: 'dead', familyRole: index ? 'married' : 'core', lineageRole: 'founder'
}));
const marriages = PENRUDD_MARRIAGES.map(([key, first, second, start, end = '']) => {
  const children = PENRUDD_DESCENDANTS.find(item => item.marriage === key)?.children || [];
  return createMarriage(marriageId(key), personId(first), personId(second), {
    start, end, status: end ? 'ended' : 'active',
    extensions: children.length === 1
      ? { chartAlignParentPairOverChildPersonId: personId(children[0]) }
      : { chartAlignChildGroupBelowParentPair: true }
  });
});

export const HOUSE_PENRUDD_FAMILY = Object.freeze({
  ...base,
  document: { ...base.document, motto: PENRUDD_MOTTO },
  houses: [{ ...base.houses[0], motto: PENRUDD_MOTTO },
    { id: 'house-llythfor', name: 'Haus Llythfor', emblem: LLYTHFOR_EMBLEM, status: 'active' }],
  persons: [
    ...founders,
    ...PENRUDD_PEOPLE.map(person => person.id === TROETZLI_PEOPLE.esyllt.id ? createLlythforPerson('esyllt') : createFamilyPerson({
      id: person.id, worldPersonId: person.worldPersonId, name: person.name,
      sex: person.sex, birth: person.birth, death: person.death,
      houseId: person.spouse ? '' : houseId, familyRole: person.spouse ? 'married' : 'core',
      lineageRole: person.id === 'carwyn-penrudd' ? 'head' : 'branch',
      title: person.role, notes: `${person.bio} Erscheinung: ${person.appearance}`,
      portrait: person.portrait.startsWith('/') ? `..${person.portrait}` : person.portrait.replace('./assets/', '../AleriaAlmanach/assets/'),
      tags: [person.household === 'farm' ? 'Penrudd-Hof' : person.household === 'inn' ? 'Zum Roten Tor' : person.household === 'city' ? 'Gwynthor' : 'Frühere Generation'],
      extensions: { household: person.household, appearance: person.appearance,
        culture: person.culture, portraitAge: person.portraitAge,
        registryManagedFields: ['name', 'title', 'notes', 'portrait'],
        registryManagedExtensionFields: ['appearance', 'culture', 'portraitAge'] }
    })),
    createLlythforPerson('cynddelw', { familyRole: 'married' }),
  ],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, ...marriages,
    { ...createLlythforPenruddMarriage('haus-llythfor'), extensions: {
      crossFamilyRelationship: { linkId: LLYTHFOR_MARRIAGE_ID, counterpartFamilyId: 'haus-llythfor' },
    } }],
  cadetBranches: [createMarriedAwayBranch({
    id: 'married-away-esyllt-llythfor', name: 'Haus Llythfor',
    parentPartnershipId: LLYTHFOR_MARRIAGE_ID, houseId: 'house-llythfor',
    targetFamilyId: 'haus-llythfor', emblem: LLYTHFOR_EMBLEM, crestFrame: 'iron',
    extensions: { chartAlignBelowPartnership: true, registryManagedExtensionFields: ['chartAlignBelowPartnership'] },
    notes: 'Esyllt lebt mit Cynddelw und ihrer Tochter in Gwynthor. Der Haushalt wird ausschließlich in der Llythfor-Akte fortgeführt.',
  })],
  parentages: [
    ...createParentages(['madoc-penrudd'], founders.map(person => person.id), base.lineage.founderPartnershipId, {
      type: 'claimed', certainty: 'unknown',
      notes: 'Hauszugehörigkeit über unbekannte Generationen, keine unmittelbare biologische Elternschaft.',
      extensions: { timeJumpId: base.timeJumps[0].id }
    }),
    ...PENRUDD_DESCENDANTS.flatMap(({ marriage, children }) => {
      const partnership = marriages.find(item => item.id === marriageId(marriage));
      return createParentages(children.map(personId), partnership.participantIds, partnership.id);
    })
  ],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['madoc-penrudd'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Zum Roten Tor · Penrudd-Hof' },
  view: { ...base.view, focusPersonId: 'carwyn-penrudd', ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: {
    ...base.extensions, blankFamily: false, pendingDescendantReview: false,
    sourceRevision: 5, chartLayoutPolicy: 'strict-v1', holdings: PENRUDD_HOLDINGS,
    sourceNoteAddendum: '31.10.2026: Esyllt, geboren 1706, als jüngste Tochter Tudurs und Bethans ergänzt. Mit Cynddelw Llythfor verheiratet und in Gwynthor wohnhaft. Die gespiegelte Ehe endet hier am schlichten braunen Hausknoten; Tochter Eirlys wird ausschließlich in der Llythfor-Akte fortgeführt. Revision 4 verankert diesen Knoten direkt unter der Ehe.',
    sourceNote: 'Nutzerauftrag vom 19.10.2026: Penrudd ersetzt allein die Wirtsfamilie am Roten Tor; das bestehende Haus Penry aus Talgarth bleibt unverändert. Unbekannte Gründer → Hausknoten → genau ein serieller Zeitsprung → Vater Madoc mit Nest → Brüder Gwilym und Tudur → deren Nachkommen. Angeheiratete tragen ausschließlich Vornamen, ohne erfundene Geburtshäuser. Der freie Kartenhof gwynthor-marking-041 wird Tudurs Zweig zugeordnet; seine bestehende Position und Karten-ID bleiben erhalten. Personen, Lebensdaten, Rollen und Lieferbeziehungen sind neue autorisierte Ausarbeitung; die Torgeschichte bleibt eine nicht sicher datierte Familienüberlieferung. Revision 2 folgt dem anschließenden Auftrag: braunes Haar und braune Augen der geborenen Penrudds, altersbedingtes Grau, kulturell unterschiedliche Angeheiratete sowie 24 Einzelporträts. Sämtliche Alben sind Menschen mit gewöhnlichen runden Ohren. Unbekannte Gründer bleiben bildlich unbekannt. Personen-IDs, Weltidentitäten und Genealogie bleiben erhalten; das vollständige Gasthofmodul folgt gesondert.'
  }
});
