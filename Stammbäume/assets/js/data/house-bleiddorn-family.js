import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_WOLFSHORN_FAMILY } from './house-wolfshorn-family.js';
import { createMigrationHouseSource } from './migration-house-source.js';

const BLEIDDORN_HOUSE_ID = 'house-bleiddorn';
const WOLFSHORN_HOUSE_ID = 'house-wolfshorn';
const BLEIDDORN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-bleiddorn.png';
const FOUNDER_PARTNERSHIP_ID = 'marriage-hrolf-liv';

export const BLEIDDORN_MIGRANT_PERSON_IDS = Object.freeze([
  'hrolf-wolfshorn',
  'liv',
  'halvar-wolfshorn',
  'ylva-wolfshorn',
  'asgeir-wolfshorn'
]);

const BLEIDDORN_CHILD_IDS = Object.freeze(['ylva-wolfshorn', 'asgeir-wolfshorn']);
const wolfshornSource = createMigrationHouseSource(HOUSE_WOLFSHORN_FAMILY);
const wolfshornHouse = wolfshornSource.house(WOLFSHORN_HOUSE_ID);

export const HOUSE_BLEIDDORN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-bleiddorn',
    title: 'Haus Bleiddorn',
    motto: '',
    description: 'Das ritterliche Herrenhaus Bleiddorn entstand durch Hrolfs Auswanderung aus Aldrimar nach Cenyr. In Gwynthor unter Celtigerns Wacht blüht der aus Clan Wolfshorn hervorgegangene Familienzweig neu auf.',
    emblem: BLEIDDORN_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.bleiddorn
  },
  houses: [
    { id: BLEIDDORN_HOUSE_ID, name: 'Haus Bleiddorn', motto: '', emblem: BLEIDDORN_EMBLEM, status: 'active' },
    {
      id: WOLFSHORN_HOUSE_ID,
      name: wolfshornHouse?.name || 'Clan Wolfshorn',
      motto: wolfshornHouse?.motto || '',
      emblem: wolfshornHouse?.emblem || '',
      status: wolfshornHouse?.status || 'active'
    }
  ],
  persons: [
    wolfshornSource.person('hrolf-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Oberherr und Gründer',
      notes: 'Hrolf verließ Aldrimar und gründete in Gwynthor das Ritterherrenhaus Bleiddorn. In der Herkunftsakte bleibt er zugleich als Wolfshorn verzeichnet.'
    }),
    wolfshornSource.person('liv', {
      familyRole: 'married',
      lineageRole: 'branch'
    }),
    wolfshornSource.person('halvar-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Jüngster Bruder Hrolfs',
      notes: 'Halvar folgte seinem Bruder Hrolf aus Aldrimar nach Cenyr.'
    }),
    wolfshornSource.person('ylva-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Erstgeborene Tochter Hrolfs'
    }),
    wolfshornSource.person('asgeir-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Ältester Sohn Hrolfs'
    })
  ],
  partnerships: [wolfshornSource.partnership(FOUNDER_PARTNERSHIP_ID)],
  parentages: BLEIDDORN_CHILD_IDS.map(childId => (
    wolfshornSource.parentage(childId, FOUNDER_PARTNERSHIP_ID)
  )),
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: FOUNDER_PARTNERSHIP_ID,
    houseId: BLEIDDORN_HOUSE_ID,
    crestSubtitle: 'Ritterherrenhaus in Gwynthor',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'clan-wolfshorn-origin',
      houseId: WOLFSHORN_HOUSE_ID,
      name: 'Clan Wolfshorn',
      subtitle: 'Herkunftsclan aus Aldrimar',
      emblem: wolfshornHouse?.emblem || '',
      emblemScale: 0.86,
      crestFrame: 'silver',
      frameScale: 1,
      childIds: ['hrolf-wolfshorn', 'halvar-wolfshorn'],
      targetFamilyId: 'haus-wolfshorn',
      notes: 'Nur Hrolf mit seiner Frau Liv, sein Bruder Halvar sowie Hrolfs Kinder Ylva und Asgeir werden in dieser Auswanderungsakte gezeigt. Die vollständige Herkunftslinie bleibt in Clan Wolfshorn erhalten.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'hrolf-wolfshorn',
    orientation: 'vertical',
    ancestorDepth: 4,
    descendantDepth: 4,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Bewusste Auswanderungs-Teilakte des Clan Wolfshorn: Die fünf ausgewählten Personen, Hrolfs Ehe und die Abstammungen von Ylva und Asgeir verwenden dieselben stabilen IDs und Weltidentitäten wie die unverändert fortbestehende Herkunftsakte. Andere Wolfshorn werden nicht nach Bleiddorn übernommen.'
  }
});
