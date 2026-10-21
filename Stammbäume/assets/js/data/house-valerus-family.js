import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { KLAUE_FAMILY, VALERUS_EMBLEM, VALERUS_MOTTO } from '../../../../AleriaAlmanach/modules/rote-klaue/klaue-people.mjs';
const houseId = 'house-valerus';
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-valerus', title: 'Haus Valerus', emblem: VALERUS_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bürgerliche', 'Gwynthor'], { rankId: 'commoner', secondarySeats: ['Die rote Klaue · Marktviertel Gwynthors'] }),
  toYear: '1667', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Decian',
  description: 'Venalysisch geprägte Bürgerfamilie in Gwynthor. Decians Pension und Ersparnisse gründeten die Rote Klaue; seine Zwillinge Lucan und Camilla führen sie gemeinsam als Kooperationsbetrieb der Klingenden Münze.' });
const parents = createMarriage('marriage-valerus-decian-severina', 'klaue-decian', 'klaue-severina', { start: '1704', end: '1729', status: 'ended',
  extensions: { chartAlignChildGroupBelowParentPair: true, registryManagedExtensionFields: ['chartAlignChildGroupBelowParentPair'] } });
const couple = createMarriage('marriage-valerus-lucan-aerwen', 'klaue-lucan', 'klaue-aerwen', { start: '1735', status: 'active' });
export const HOUSE_VALERUS_FAMILY = Object.freeze({ ...base,
  document: { ...base.document, motto: VALERUS_MOTTO }, houses: [{ ...base.houses[0], motto: VALERUS_MOTTO }],
  persons: [...base.persons.map((p, i) => createFamilyPerson({ ...p, name: i ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', lineageRole: 'founder' })),
    ...KLAUE_FAMILY.map(p => createFamilyPerson({ id: p.id, worldPersonId: p.worldPersonId, name: p.name, sex: p.sex, birth: p.birth, death: p.death || '',
      status: p.death ? 'dead' : 'alive', houseId: p.familyRole === 'married' ? '' : houseId, familyRole: p.familyRole,
      lineageRole: p.key === 'decian' ? 'head' : 'branch', title: p.role, notes: p.bio, portrait: p.portrait ? p.portrait.replace('./assets/', '../AleriaAlmanach/assets/') : '',
      tags: [p.culture, 'Haus Valerus'], extensions: { appearance: p.appearance, twinGroupId: ['lucan', 'camilla'].includes(p.key) ? 'valerus-twins-1707' : '',
        registryManagedFields: ['name', 'title', 'notes', 'portrait'], registryManagedExtensionFields: ['appearance', 'twinGroupId'] } }))],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, parents, couple],
  parentages: [...createParentages(['klaue-decian'], base.persons.map(p => p.id), base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown',
    notes: 'Hauszugehörigkeit über nicht einzeln überlieferte Generationen; keine unmittelbare Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages(['klaue-lucan', 'klaue-camilla'], parents.participantIds, parents.id, { legitimacy: 'legitimate' })],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['klaue-decian'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Pfandhaus in Gwynthor', crestFrame: 'iron' },
  view: { ...base.view, focusPersonId: 'klaue-decian', ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1',
    sourceNote: 'Ausarbeitung vom 21.10.2026. Unbekannte Gründer → Hausknoten → ein serieller Zeitsprung → Decian und Severina → die Zwillinge. Camilla ist unverheiratet; nur Lucan hat eine Gemahlin. Keine Kinder oder weiteren Geschwister angelegt. Decian starb an Lebensmittelvergiftung; daraus folgt keine bestätigte Mordgeschichte. Die Erbteilung bleibt ungeklärt, die gemeinsame Betriebsführung der Zwillinge besteht dennoch. Aerwen trägt vorerst nur ihren Vornamen; ihr Herkunftshaus in Aberon bleibt offen.' }
});
