import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  createTirNaSinsearCadetRecordFactory,
  createTirNaSinsearHouse,
  createTirNaSinsearMarriedAwayBranch
} from './tir-na-sinsear-cadet-family-builders.js';
import {
  SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS,
  SEPT_GRUENHAND_PORTRAITS,
  SEPT_GRUENHAND_REUSED_PORTRAIT_IDS
} from './sept-gruenhand-portraits.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import {
  TIR_NA_SINSEAR_HOUSE_EMBLEMS,
  TIR_NA_SINSEAR_HOUSE_PROFILES,
  TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS
} from './tir-na-sinsear-house-profiles.js';

const GRUENHAND_HOUSE_ID = 'house-gruenhand';
const GRUENHAND_EMBLEM = TIR_NA_SINSEAR_HOUSE_EMBLEMS.gruenhand;

const SOURCE_MANAGED_PARTNERSHIP_FIELDS = Object.freeze([
  'participantIds', 'type', 'status', 'start', 'end', 'certainty', 'visibility', 'notes'
]);
const SOURCE_MANAGED_PARENTAGE_FIELDS = Object.freeze([
  'childId', 'parentIds', 'partnershipId', 'type', 'legitimacy', 'certainty', 'visibility', 'notes'
]);

const HEAD_TITLES = Object.freeze({
  'peregrain-gruenhand': 'Gründervater und erstes überliefertes Septoberhaupt der Grünhand aus Leith'
});

const TARGETS = Object.freeze({
  albholz: Object.freeze({
    name: 'Clan Albholz',
    houseId: 'house-albholz',
    targetFamilyId: 'haus-albholz',
    emblem: KRONENTAL_HOUSE_EMBLEMS.albholz
  }),
  mhuir: Object.freeze({
    name: 'Clan Na’Mhuir',
    houseId: 'house-na-mhuir',
    targetFamilyId: 'haus-na-mhuir',
    emblem: TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']
  })
});

const { person, spouse, awayWoman } = createTirNaSinsearCadetRecordFactory({
  houseId: GRUENHAND_HOUSE_ID,
  portraits: SEPT_GRUENHAND_PORTRAITS,
  headTitles: HEAD_TITLES
});

const UNKNOWN_PARENT_IDS = ['unknown-father-gruenhand', 'unknown-mother-gruenhand'];
const PEREGRAIN_IDS = ['lannraig-mhuir', 'peregrain-gruenhand'];
const LIORAIN_IDS = ['albhric-albholz', 'liorain-gruenhand'];
const RUBYBHNA_IDS = ['aodhagan-mhuir', 'rubybhna-gruenhand'];
const MERIADAN_IDS = ['meriadan-gruenhand', 'unknown-wife-meriadan-gruenhand'];
const BUNGAN_IDS = ['bungan-gruenhand', 'unknown-wife-bungan-gruenhand'];
const FRODHRAN_IDS = ['frodhran-gruenhand', 'unknown-wife-frodhran-gruenhand'];
const ROSAMAIR_IDS = ['fionnbarr-mhuir', 'rosamair-gruenhand'];
const LOBELLIN_IDS = ['artair-mhuir', 'lobellin-gruenhand'];

function relationshipExtensions(extensions = {}) {
  return {
    ...extensions,
    registryManagedFields: SOURCE_MANAGED_PARTNERSHIP_FIELDS
  };
}

function marriage(id, participantIds, options = {}) {
  return createMarriage(id, ...participantIds, {
    ...options,
    extensions: relationshipExtensions(options.extensions)
  });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: 'gruenhand-parentage',
    ...options,
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PARENTAGE_FIELDS
    }
  });
}

function unknownWife(id, husbandName) {
  return spouse(id, '???', 'female', '????', '', '', {
    status: 'unknown',
    title: `Unbekannte Gemahlin ${husbandName}`,
    tags: ['Ehefrau', 'Identität unbekannt'],
    notes: 'Name, Herkunft und Lebensdaten sind noch nicht festgelegt.'
  });
}

export const SEPT_GRUENHAND_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gruenhand',
    title: 'Sept Grünhand aus Leith',
    motto: '',
    description: 'Familie aus dem Druidenhain, die in Broch an Coill als Sept dem Clan Na’Mhuir dient und seinem Laird verschworen ist.',
    emblem: GRUENHAND_EMBLEM,
    houseProfile: TIR_NA_SINSEAR_HOUSE_PROFILES.gruenhand
  },
  houses: [
    createTirNaSinsearHouse(GRUENHAND_HOUSE_ID, 'Sept Grünhand aus Leith', GRUENHAND_EMBLEM),
    createTirNaSinsearHouse('house-na-mhuir', 'Clan Na’Mhuir', TIR_NA_SINSEAR_HOUSE_EMBLEMS['na-mhuir']),
    createTirNaSinsearHouse('house-albholz', 'Clan Albholz', KRONENTAL_HOUSE_EMBLEMS.albholz)
  ],
  persons: [
    person('unknown-father-gruenhand', '???', 'male', '????', '????', {
      status: 'unknown',
      title: 'Unbekannter Vater Peregráins, Liorains und Rubybhnas',
      tags: ['Elterngeneration', 'Identität unbekannt']
    }),
    spouse('unknown-mother-gruenhand', '???', 'female', '????', '????', '', {
      status: 'unknown',
      title: 'Unbekannte Mutter Peregráins, Liorains und Rubybhnas',
      tags: ['Elterngeneration', 'Identität unbekannt']
    }),

    awayWoman('liorain-gruenhand', 'Liorain Grünhand', '1670', '', TARGETS.albholz, {
      title: 'Schwester Peregráins · Wegverheiratet an Clan Albholz · Mitgründerin des Clans Albholz'
    }),
    person('peregrain-gruenhand', 'Peregráin Grünhand', 'male', '1671', ''),
    awayWoman('rubybhna-gruenhand', 'Rubybhna Grünhand', '1675', '', TARGETS.mhuir, {
      title: 'Schwester Peregráins · Wegverheiratet an Clan Na’Mhuir'
    }),

    spouse('albhric-albholz', 'Albhric „Alberick“ Albholz', 'male', '1660', '1738', 'house-albholz', {
      title: 'Gemahl der wegverheirateten Liorain · Gründer des Clans Albholz'
    }),
    spouse('lannraig-mhuir', 'Lannraig Mhuir', 'female', '1676', '', 'house-na-mhuir', {
      title: 'Gemahlin des Gründervaters Peregráin'
    }),
    spouse('aodhagan-mhuir', 'Aodhagán Mhuir', 'male', '1672', '', 'house-na-mhuir', {
      title: 'Gemahl der wegverheirateten Rubybhna · Laird des Clans Na’Mhuir'
    }),

    person('meriadan-gruenhand', 'Meriadán Grünhand', 'male', '1695', '', {
      title: 'Ältester Sohn Peregráins · setzt die Grünhand-Linie fort',
      tags: ['Fortführende Linie']
    }),
    unknownWife('unknown-wife-meriadan-gruenhand', 'Meriadáns'),
    person('bungan-gruenhand', 'Bungán Grünhand', 'male', '1698', '', {
      title: 'Zweiter Sohn Peregráins · setzt die Grünhand-Linie fort',
      tags: ['Fortführende Linie']
    }),
    unknownWife('unknown-wife-bungan-gruenhand', 'Bungáns'),
    person('frodhran-gruenhand', 'Frodhrán Grünhand', 'male', '1701', '', {
      title: 'Dritter Sohn Peregráins · setzt die Grünhand-Linie fort',
      tags: ['Fortführende Linie']
    }),
    unknownWife('unknown-wife-frodhran-gruenhand', 'Frodhráns'),
    awayWoman('rosamair-gruenhand', 'Rósamair Grünhand', '1704', '', TARGETS.mhuir, {
      title: 'Tochter Peregráins · Wegverheiratet an Clan Na’Mhuir'
    }),
    spouse('fionnbarr-mhuir', 'Fionnbarr Mhuir', 'male', '1699', '', 'house-na-mhuir'),

    person('bilbean-gruenhand', 'Bilbeán Grünhand', 'male', '1718', ''),
    person('lobellin-gruenhand', 'Lobellín Grünhand', 'female', '1722', '', {
      title: 'Enkeltochter Peregráins · Wegverlobt an Clan Na’Mhuir',
      tags: ['Wegverlobt'],
      notes: 'Tochter des ältesten Sohnes Meriadán und dessen noch unbekannter Gemahlin.'
    }),
    person('pipran-gruenhand', 'Piprán Grünhand', 'male', '1721', ''),
    person('belladan-gruenhand', 'Belladán Grünhand', 'female', '1724', ''),
    person('samhran-gruenhand', 'Samhrán Grünhand', 'male', '1724', ''),
    person('primros-gruenhand', 'Primrós Grünhand', 'female', '1727', ''),
    spouse('artair-mhuir', 'Artair Mhuir', 'male', '1724', '', 'house-na-mhuir')
  ],
  partnerships: [
    marriage('marriage-unknown-gruenhand-parents', UNKNOWN_PARENT_IDS, {
      status: 'ended',
      certainty: 'confirmed',
      notes: 'Das unbekannte Elternpaar ist als gemeinsame Elterngeneration der drei Geschwister gesetzt.',
      extensions: {
        chartAlignChildGroupBelowParentPair: true,
        registryManagedExtensionFields: ['chartAlignChildGroupBelowParentPair']
      }
    }),
    marriage('marriage-albhric-liorain-albholz', LIORAIN_IDS, {
      start: '1692',
      status: 'ended',
      end: '1738',
      extensions: {
        chartPlacePairAtGenerationEdge: {
          side: 'before',
          orderedPersonIds: ['albhric-albholz', 'liorain-gruenhand'],
          gapSlots: 0
        },
        registryManagedExtensionFields: ['chartPlacePairAtGenerationEdge']
      }
    }),
    marriage('marriage-lannraig-peregrain', PEREGRAIN_IDS),
    marriage('marriage-aodhagan-rubybhna', RUBYBHNA_IDS, {
      extensions: {
        chartPlacePairAtGenerationEdge: {
          side: 'after',
          orderedPersonIds: ['rubybhna-gruenhand', 'aodhagan-mhuir'],
          gapSlots: 0
        },
        registryManagedExtensionFields: ['chartPlacePairAtGenerationEdge']
      }
    }),
    marriage('marriage-meriadan-unknown-wife', MERIADAN_IDS),
    marriage('marriage-bungan-unknown-wife', BUNGAN_IDS),
    marriage('marriage-frodhran-unknown-wife', FRODHRAN_IDS),
    marriage('marriage-fionnbarr-rosamair-mhuir', ROSAMAIR_IDS),
    marriage('engagement-artair-lobellin', LOBELLIN_IDS, {
      type: 'engagement',
      status: 'active'
    })
  ],
  parentages: [
    ...childrenOf(
      ['liorain-gruenhand', 'peregrain-gruenhand', 'rubybhna-gruenhand'],
      UNKNOWN_PARENT_IDS,
      'marriage-unknown-gruenhand-parents'
    ),
    ...childrenOf(
      ['meriadan-gruenhand', 'bungan-gruenhand', 'frodhran-gruenhand', 'rosamair-gruenhand'],
      PEREGRAIN_IDS,
      'marriage-lannraig-peregrain'
    ),
    ...childrenOf(
      ['bilbean-gruenhand', 'lobellin-gruenhand'],
      MERIADAN_IDS,
      'marriage-meriadan-unknown-wife'
    ),
    ...childrenOf(
      ['pipran-gruenhand', 'belladan-gruenhand'],
      BUNGAN_IDS,
      'marriage-bungan-unknown-wife'
    ),
    ...childrenOf(
      ['samhran-gruenhand', 'primros-gruenhand'],
      FRODHRAN_IDS,
      'marriage-frodhran-unknown-wife'
    )
  ],
  cadetBranches: [
    createTirNaSinsearMarriedAwayBranch('married-away-albholz-liorain', 'marriage-albhric-liorain-albholz', TARGETS.albholz),
    createTirNaSinsearMarriedAwayBranch('married-away-mhuir-rubybhna', 'marriage-aodhagan-rubybhna', TARGETS.mhuir),
    createTirNaSinsearMarriedAwayBranch('married-away-mhuir-rosamair', 'marriage-fionnbarr-rosamair-mhuir', TARGETS.mhuir),
    createMarriedAwayBranch({
      id: 'engaged-away-mhuir-lobellin',
      name: TARGETS.mhuir.name,
      parentPartnershipId: 'engagement-artair-lobellin',
      houseId: TARGETS.mhuir.houseId,
      targetFamilyId: TARGETS.mhuir.targetFamilyId,
      emblem: TARGETS.mhuir.emblem,
      subtitle: 'Wegverlobt an Clan Na’Mhuir',
      notes: 'Lobellín und Artair sind verlobt; die Verbindung wird nicht als geschlossene Ehe dargestellt.',
      extensions: {
        chartAlignBelowPartnership: true,
        registryManagedFields: [
          'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle', 'notes'
        ],
        registryManagedExtensionFields: ['chartAlignBelowPartnership']
      }
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-lannraig-peregrain',
    houseId: GRUENHAND_HOUSE_ID,
    crestSubtitle: 'Von Peregráin begründete Sept im Dienst des Clans Na’Mhuir · Broch an Coill',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'unknown-father-gruenhand',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceModule: 'Sept Grünhand aus Leith (Na’Mhuir-, Albholz- und Nutzerüberlieferung)',
    sourceNote: 'Peregráin steht mit Lannraig als Gründervaterpaar vor dem Hauswappen; erst darunter folgen ihre drei fortführenden Söhne Meriadán, Bungán und Frodhrán sowie die an Fionnbarr Mhuir wegverheiratete Tochter Rósamair. Wappen und Fortsetzung werden auf Peregráins Personenachse gehalten, damit die Hauptlinie nicht im Zickzack verläuft. Jeder Sohn besitzt eine vorerst unbekannte Gemahlin und zwei Sprösslinge. Lobellín ist die Enkeltochter Peregráins aus der Linie seines ältesten Sohnes Meriadán. Über Peregráin steht ein unbekanntes Elternpaar; dieses dient zugleich als technische Baumwurzel, damit die Ehen seiner parallel geführten, wegverheirateten Schwestern vollständig sichtbar bleiben. Albhric steht direkt neben Liorain am linken Generationsrand, Aodhagán direkt neben Rubybhna am rechten; ihre Wegverheiratet-Knoten folgen unmittelbar unter den Paaren. Vorhandene Personen und Porträts aus den Na’Mhuir- und Albholz-Gegenakten bleiben kanonisch. Für alle neu ergänzten Personen ohne Bild wird der automatische Portraitplatzhalter verwendet.',
    sourceRevision: 4,
    blankFamily: false,
    preparedMainLine: false,
    constructionPolicy: Object.freeze({
      userDirectedExpansion: true,
      founderCoupleBeforeCrest: Object.freeze(PEREGRAIN_IDS),
      sonsContinueLine: Object.freeze(['meriadan-gruenhand', 'bungan-gruenhand', 'frodhran-gruenhand']),
      minimumChildrenPerSon: 2
    }),
    namingPolicy: Object.freeze({
      culture: 'Hobbitische Rufnamen mit gälischer Laut- und Namensform',
      generatedNames: Object.freeze([
        'Meriadán', 'Bungán', 'Frodhrán', 'Rósamair', 'Bilbeán', 'Piprán',
        'Belladán', 'Samhrán', 'Primrós'
      ])
    }),
    portraitPolicy: Object.freeze({
      localPersonIds: SEPT_GRUENHAND_LOCAL_PORTRAIT_IDS,
      reusedPersonIds: SEPT_GRUENHAND_REUSED_PORTRAIT_IDS,
      missingPortraitsUsePlaceholders: true
    }),
    chartAlignLineageOriginOverPersonId: Object.freeze([
      'meriadan-gruenhand',
      'bungan-gruenhand',
      'frodhran-gruenhand',
      'rosamair-gruenhand'
    ]),
    chartLineageCrestParentPersonId: 'peregrain-gruenhand',
    principality: 'Leitheach',
    territory: 'Tir na Sinsear',
    realm: 'Tir na Fancha',
    albicRank: 'sept-head',
    immediateLiegeHouseId: 'haus-na-mhuir',
    immediateLiegeHouseName: 'Clan Na’Mhuir',
    registryManagedDocumentFields: ['emblem', 'description'],
    registryManagedExtensionFields: [
      'sourceNote', 'constructionPolicy', 'namingPolicy', 'portraitPolicy', 'realm',
      'chartAlignLineageOriginOverPersonId', 'chartLineageCrestParentPersonId'
    ],
    registryManagedHouseProfileFields: TIR_NA_SINSEAR_MANAGED_PROFILE_FIELDS,
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId'],
    registryManagedRecordFields: ['folderPath']
  }
});
