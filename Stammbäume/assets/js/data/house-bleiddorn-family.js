import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_WOLFSHORN_FAMILY } from './house-wolfshorn-family.js';
import { createMigrationHouseSource } from './migration-house-source.js';

const BLEIDDORN_HOUSE_ID = 'house-bleiddorn';
const WOLFSHORN_HOUSE_ID = 'house-wolfshorn';
const BLEIDDORN_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-bleiddorn.png';
const FOUNDER_PARTNERSHIP_ID = 'marriage-hrolf-liv';
const BLEIDDORN_SOURCE_REVISION = 2;

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

// Die Teilakte besitzt ihre eigene Revision; die Herkunftsrevision darf hier
// keine spaeteren lokalen Notizen wiederholt ueberschreiben.
function exilePerson(id, options) {
  const migrant = wolfshornSource.person(id, options);
  return { ...migrant, extensions: { ...migrant.extensions,
    registryManagedFieldRevisions: { ...migrant.extensions?.registryManagedFieldRevisions, notes: BLEIDDORN_SOURCE_REVISION }
  } };
}

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
    exilePerson('hrolf-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'head',
      title: 'Oberherr und Gründer',
      notes: 'Hrolf wurde mit seinen beiden ältesten Kindern Ylva und Asgeir sowie seinem Bruder Halvar aus Aldrimar ins Exil geschickt. Hornhall ging an seinen Bruder Bjoern. In Gwynthor gründete Hrolf das Ritterherrenhaus Bleiddorn; in der Herkunftsakte bleibt er als Wolfshorn verzeichnet.'
    }),
    wolfshornSource.person('liv', {
      familyRole: 'married',
      lineageRole: 'branch'
    }),
    exilePerson('halvar-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'branch',
      title: 'Jüngster Bruder Hrolfs',
      notes: 'Halvar wurde gemeinsam mit seinem Bruder Hrolf und dessen beiden ältesten Kindern Ylva und Asgeir ins Exil geschickt und zog mit ihnen nach Cenyr.'
    }),
    exilePerson('ylva-wolfshorn', {
      houseId: BLEIDDORN_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'mainline',
      title: 'Erstgeborene Tochter Hrolfs'
    }),
    exilePerson('asgeir-wolfshorn', {
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
      notes: 'Die Exilgruppe besteht aus Hrolf, seinem Bruder Halvar sowie Hrolfs beiden ältesten Kindern Ylva und Asgeir. Liv wird als Mutter der Kinder und frühere Ehefrau in der Abstammung gezeigt; sie gehört nicht zur Exilgruppe. Die vollständige Herkunftslinie und Bjoerns Nachfolge in Hornhall bleiben in Clan Wolfshorn erhalten.'
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
    sourceRevision: BLEIDDORN_SOURCE_REVISION,
    sourceNote: 'Bewusste Auswanderungs-Teilakte des Clan Wolfshorn: Die fünf ausgewählten Personen, Hrolfs Ehe und die Abstammungen von Ylva und Asgeir verwenden dieselben stabilen IDs und Weltidentitäten wie die unverändert fortbestehende Herkunftsakte. Andere Wolfshorn werden nicht nach Bleiddorn übernommen.'
  }
});
