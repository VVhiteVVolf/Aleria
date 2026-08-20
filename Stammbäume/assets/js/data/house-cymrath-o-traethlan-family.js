import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { createFamilyPerson, createMarriage } from './family-record-builders.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { HOUSE_FALVERI_FAMILY } from './house-falveri-family.js';
import { createMigrationHouseSource } from './migration-house-source.js';

const CYMRATH_HOUSE_ID = 'house-cymrath-o-traethlan';
const FALVERI_HOUSE_ID = 'house-falveri';
const CYMRATH_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-cymrath-o-traethlan.png';
const FOUNDER_PARTNERSHIP_ID = 'marriage-aldo-unknown-cymrath';

const falveriSource = createMigrationHouseSource(HOUSE_FALVERI_FAMILY);
const falveriHouse = falveriSource.house(FALVERI_HOUSE_ID);

export const HOUSE_CYMRATH_O_TRAETHLAN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cymrath-o-traethlan',
    title: "Haus Cymrath O'Traethlan",
    motto: '',
    description: "Das junge Haus Cymrath O'Traethlan wurde in Tŵr Traethlan von Aldo Falveri begründet. Seine Herkunft aus dem venalischen Magnarierhaus Falveri bleibt als eigene Herkunftsverknüpfung sichtbar; Nachkommen sind bislang nicht verzeichnet.",
    emblem: CYMRATH_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.cymrathOTraethlan
  },
  houses: [
    {
      id: CYMRATH_HOUSE_ID,
      name: "Haus Cymrath O'Traethlan",
      motto: '',
      emblem: CYMRATH_EMBLEM,
      status: 'active'
    },
    falveriHouse
  ],
  persons: [
    falveriSource.person('aldo-falveri', {
      houseId: FALVERI_HOUSE_ID,
      familyRole: 'core',
      lineageRole: 'head',
      title: "Don · Cavaliere und Gründer des Hauses Cymrath O'Traethlan",
      notes: "Aldo entstammt dem politisch unbedeutenden Nebenzweig des Hauses Falveri und begründet in Tŵr Traethlan das Haus Cymrath O'Traethlan. In der Herkunftsakte bleibt er weiterhin als Falveri verzeichnet."
    }),
    createFamilyPerson({
      id: 'unknown-bride-cymrath-o-traethlan',
      worldPersonId: 'world:haus-cymrath-o-traethlan:unknown-bride',
      name: '???',
      title: "Unbekannte Braut Aldos und Mitgründerin des Hauses Cymrath O'Traethlan",
      sex: 'female',
      status: 'alive',
      birth: '????',
      death: '',
      portrait: '',
      houseId: '',
      familyRole: 'married',
      lineageRole: 'branch',
      tags: ['Braut', 'Mitgründerin'],
      notes: 'Name und Herkunft der Braut sind bislang nicht festgelegt.'
    })
  ],
  partnerships: [
    createMarriage(
      FOUNDER_PARTNERSHIP_ID,
      'aldo-falveri',
      'unknown-bride-cymrath-o-traethlan',
      {
        notes: "Gründerpaar des Hauses Cymrath O'Traethlan."
      }
    )
  ],
  parentages: [],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: FOUNDER_PARTNERSHIP_ID,
    houseId: CYMRATH_HOUSE_ID,
    crestSubtitle: 'Neu begründetes Ritterherrenhaus in Tŵr Traethlan',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'house-falveri-origin-cymrath',
      houseId: FALVERI_HOUSE_ID,
      name: 'Haus Falveri',
      subtitle: 'Aldos Herkunftshaus in Venalys',
      emblem: falveriHouse.emblem,
      emblemScale: 0.86,
      crestFrame: 'silver',
      frameScale: 1,
      childIds: ['aldo-falveri'],
      targetFamilyId: 'haus-falveri',
      notes: "Die Herkunftsverknüpfung steht oberhalb Aldos; der neue Cymrath-Hausknoten folgt erst unter Aldo und seiner Braut."
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aldo-falveri',
    orientation: 'vertical',
    ancestorDepth: 3,
    descendantDepth: 3,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: "Junge, kinderlose Gründungsakte: dieselbe Weltperson Aldo Falveri wie in der Falveri-Akte, darüber die Herkunftsverknüpfung zu Haus Falveri und direkt unter dem Gründerpaar der neue Hausknoten von Cymrath O'Traethlan. Es wurden weder Kinder noch ein Zeitsprung angelegt."
  }
});
