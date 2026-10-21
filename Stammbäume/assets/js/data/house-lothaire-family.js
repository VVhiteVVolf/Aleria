import { createFounderTimeJumpPlaceholderHouseFamily } from './blank-house-family-factory.js';
import { createFamilyPerson, createMarriage, createParentages, createCadetHouseBranch } from './family-record-builders.js';
import { createHouseProfileFromFolderPath } from '../domain/house-profile.js';
import { LOTHAIRE_EMBLEM, LOTHAIRE_MOTTO, LOTHAIRE_FAMILY } from '../../../../AleriaAlmanach/modules/arkaneum/arkaneum-people.mjs';
const houseId = 'house-lothaire';
const branchId = 'house-lothaire-bastardlinie';
const neutral = 'assets/images/placeholders/neutral-crest.png';
const base = createFounderTimeJumpPlaceholderHouseFamily({ id: 'haus-lothaire', title: 'Haus Lothaire', emblem: LOTHAIRE_EMBLEM,
  houseProfile: createHouseProfileFromFolderPath(['Brevanor'], { rankId: 'commoner', secondarySeats: ['Lothaires Arkaneum · Gwynthor-Stadt'] }),
  toYear: '1577', timeJumpLabel: 'Nicht einzeln überlieferte Generationen bis Herluin',
  description: 'Brevanorische Alchemistenfamilie. Herluin führt das Arkaneum am Park von Gwynthor. Sein Sohn Rhydian und Enkel Maelwyn tragen als Angehörige der nicht legitimierten Nebenlinie den Beinamen O’Cenyr.' });
const affair = createMarriage('affair-herluin-helygyn', 'herluin-lothaire', 'helygyn', { type: 'affair', status: 'ended', end: '1701', notes: 'Frühere außereheliche Verbindung; ihr einziger Sohn ist Rhydian.' });
const marriage = createMarriage('marriage-rhydian-perdella', 'rhydian-o-cenyr', 'perdella', { start: '1695', end: '1729', status: 'ended', extensions: { chartAlignParentPairOverChildPersonId: 'maelwyn-o-cenyr' } });
export const HOUSE_LOTHAIRE_FAMILY = Object.freeze({ ...base,
  document: { ...base.document, motto: LOTHAIRE_MOTTO },
  houses: [{ ...base.houses[0], motto: LOTHAIRE_MOTTO }, { id: branchId, name: 'O’Cenyr · Lothaires Bastardlinie', emblem: neutral, status: 'active', motto: '' }],
  persons: [
    ...base.persons.map((person, index) => createFamilyPerson({ ...person, name: index ? 'Unbekannte Gründerin' : 'Unbekannter Gründer', status: 'dead', lineageRole: 'founder' })),
    ...LOTHAIRE_FAMILY.map(person => createFamilyPerson({ id: person.id, worldPersonId: person.worldPersonId, name: person.name,
      sex: person.sex, birth: person.birth, death: person.death, houseId: person.id === 'herluin-lothaire' ? houseId : person.sex === 'male' ? branchId : '',
      familyRole: person.id === 'herluin-lothaire' ? 'core' : person.sex === 'male' ? 'bastard' : 'married',
      lineageRole: person.id === 'herluin-lothaire' ? 'head' : 'branch', title: person.role,
      notes: `${person.personality} ${person.id === 'maelwyn-o-cenyr' ? 'Ehelich geboren; gehört zur nicht legitimierten O’Cenyr-Linie seines Vaters.' : ''}`,
      portrait: person.portrait.replace('./assets/', '../AleriaAlmanach/assets/'), tags: [person.culture, person.id.includes('o-cenyr') ? 'Bastardlinie' : 'Familie Lothaire'],
      extensions: { appearance: person.appearance, apparentAge: person.apparentAge, magicGifted: !!person.magicGifted,
        registryManagedFields: ['name', 'title', 'notes', 'portrait'], registryManagedExtensionFields: ['appearance', 'apparentAge', 'magicGifted'] }
    }))
  ],
  partnerships: [{ ...base.partnerships[0], status: 'ended', certainty: 'unknown' }, affair, marriage],
  parentages: [
    ...createParentages(['herluin-lothaire'], base.persons.map(person => person.id), base.lineage.founderPartnershipId, { type: 'claimed', certainty: 'unknown',
      notes: 'Hauszugehörigkeit über nicht einzeln überlieferte Generationen, keine unmittelbare Elternschaft.', extensions: { timeJumpId: base.timeJumps[0].id } }),
    ...createParentages(['rhydian-o-cenyr'], affair.participantIds, affair.id, { legitimacy: 'illegitimate' }),
    ...createParentages(['maelwyn-o-cenyr'], marriage.participantIds, marriage.id, { legitimacy: 'legitimate', notes: 'Ehelich geboren innerhalb der nicht legitimierten Bastardlinie.' })
  ],
  cadetBranches: [createCadetHouseBranch({ id: 'branch-lothaire-o-cenyr', name: 'O’Cenyr', parentPartnershipId: affair.id,
    childIds: ['rhydian-o-cenyr'], houseId: branchId, targetFamilyId: 'haus-lothaire', emblem: neutral, crestFrame: 'iron', subtitle: 'Nicht legitimierte Bastardlinie',
    notes: 'Motivloser Wappenknoten. Rhydian und Maelwyn führen keinen Anspruch auf Namen oder Wappen der Lothaire.', extensions: { chartAlignBelowPartnership: true } })],
  timeJumps: [{ ...base.timeJumps[0], childIds: ['herluin-lothaire'], extensions: { preparedPlaceholder: false } }],
  lineage: { ...base.lineage, crestSubtitle: 'Alchemisten aus Brevanor', crestFrame: 'silver' },
  view: { ...base.view, focusPersonId: 'herluin-lothaire', ancestorDepth: 12, descendantDepth: 12, limitGenerations: false },
  extensions: { ...base.extensions, blankFamily: false, pendingDescendantReview: false, sourceRevision: 1, chartLayoutPolicy: 'strict-v1',
    sourceNote: 'Autorisierte Ausarbeitung vom 20.10.2026. Unbekannte Gründer → Hausknoten → ein Zeitsprung → Herluin. Frühere Cenyri-Gefährtin Helygyn und verstorbene Cenyri-Schwiegertochter Perdella wurden ergänzend benannt und datiert. Keine weiteren Kinder oder Geschwister Rhydians. Maelwyn ist sein einziges Kind. Lebensalter und sichtbares Alter folgen der Nutzervorgabe; die genaue Ursache der Langlebigkeit bleibt offen. Der Bastardknoten ist eine hausinterne Linie und keine zweite Familienakte.' }
});
