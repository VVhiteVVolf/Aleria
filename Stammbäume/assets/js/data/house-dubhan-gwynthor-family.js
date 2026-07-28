import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_DUBHAN_FAMILY } from './house-dubhan-family.js';
import { createMigrationHouseSource } from './migration-house-source.js';

const GWYNTHOR_DUBHAN_HOUSE_ID = 'house-dubhan-gwynthor';
const SEPT_DUBHAN_HOUSE_ID = 'house-dubhan';
const GWYNTHOR_DUBHAN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-dubhan-gwynthor.png';
const FOUNDER_PARTNERSHIP_ID = 'marriage-breccan-eithne';

export const DUBHAN_GWYNTHOR_PERSON_IDS = Object.freeze([
  'breccan-dubhan',
  'eithne-dubhan',
  'rogaire-dubhan',
  'alpin-dubhan'
]);

const DUBHAN_CHILD_IDS = Object.freeze(['rogaire-dubhan', 'alpin-dubhan']);
const dubhanSource = createMigrationHouseSource(HOUSE_DUBHAN_FAMILY);
const septDubhanHouse = dubhanSource.house(SEPT_DUBHAN_HOUSE_ID);

export const HOUSE_DUBHAN_GWYNTHOR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dubhan-gwynthor',
    title: 'Haus Dubhan',
    motto: '',
    description: 'Das niedere Ritterhaus Dubhan entstand in Gwynthor aus Breccans Auswanderung von Faelaorn nach Celtigerns Wacht. Die neue Linie bewahrt ihre Herkunft aus der Sept Dubhan und dient fortan Haus Draig.',
    emblem: GWYNTHOR_DUBHAN_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.dubhanGwynthor
  },
  houses: [
    { id: GWYNTHOR_DUBHAN_HOUSE_ID, name: 'Haus Dubhan', motto: '', emblem: GWYNTHOR_DUBHAN_EMBLEM, status: 'active' },
    septDubhanHouse
  ],
  persons: [
    dubhanSource.person('breccan-dubhan', {
      houseId: GWYNTHOR_DUBHAN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Oberherr und Gründer',
      notes: 'Breccan begründete nach seiner Auswanderung aus Faelaorn in Gwynthor das neue Ritterhaus Dubhan. In der Herkunftsakte bleibt er weiterhin als Mitglied der Sept Dubhan verzeichnet.'
    }),
    dubhanSource.person('eithne-dubhan', {
      familyRole: 'married',
      lineageRole: 'branch'
    }),
    dubhanSource.person('rogaire-dubhan', {
      houseId: GWYNTHOR_DUBHAN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Älteste Tochter Breccans'
    }),
    dubhanSource.person('alpin-dubhan', {
      houseId: GWYNTHOR_DUBHAN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Sohn Breccans'
    })
  ],
  partnerships: [dubhanSource.partnership(FOUNDER_PARTNERSHIP_ID)],
  parentages: DUBHAN_CHILD_IDS.map(childId => (
    dubhanSource.parentage(childId, FOUNDER_PARTNERSHIP_ID)
  )),
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: FOUNDER_PARTNERSHIP_ID,
    houseId: GWYNTHOR_DUBHAN_HOUSE_ID,
    crestSubtitle: 'Niederes Ritterhaus in Gwynthor',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'sept-dubhan-origin',
      houseId: SEPT_DUBHAN_HOUSE_ID,
      name: 'Sept Dubhan',
      subtitle: 'Herkunftslinie aus Faelaorn',
      emblem: septDubhanHouse.emblem,
      emblemScale: 0.86,
      crestFrame: 'silver',
      frameScale: 1,
      childIds: ['breccan-dubhan'],
      targetFamilyId: 'haus-dubhan',
      notes: 'Diese Gwynthor-Akte zeigt ausschließlich Breccan und Eithne sowie ihre Kinder Rogaire und Alpin. Die vollständige Herkunftslinie bleibt in der Sept-Dubhan-Akte erhalten.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'breccan-dubhan',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Bewusste Auswanderungs-Teilakte der Sept Dubhan: Breccan, Eithne, Rogaire und Alpin sowie ihre bestehende Ehe und beide Abstammungen verwenden dieselben stabilen IDs und Weltidentitäten wie die fortbestehende Herkunftsakte. Weitere Dubhan werden nicht übernommen.'
  }
});
