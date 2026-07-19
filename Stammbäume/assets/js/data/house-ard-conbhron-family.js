import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';

const HOUSE_EMBLEMS = Object.freeze({
  ardConbhron: 'assets/images/houses/Antike Crannath Clans/haus-ard-conbhron.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  talamh: 'assets/images/houses/Antike Crannath Clans/haus-ui-talamh.png'
});

// Reale, bereits andernorts verwendete Portraits geteilter Weltpersonen. Alle übrigen
// Ard-Conbhrón-Personen bleiben absichtlich ohne Portrait: die alten Bilder aus der
// Forumsvorlage sind veraltet und werden hier nicht übernommen.
const SHARED_PORTRAITS = Object.freeze({
  'clodagh-ard-conbhron': 'assets/images/portraits/haus-gwefrydd/clodagh-ard-conbhron.jpg',
  'tallwch-gwefrydd': 'assets/images/portraits/haus-gwefrydd/tallwch-gwefrydd.jpg',
  'caireen-conbhron': 'assets/images/portraits/haus-draig/caireen-conbhron.jpg',
  'llamrei-draig': 'assets/images/portraits/haus-draig/llamrei-draig.jpg'
});

const ARD_CONBHRON_HOUSE_ID = 'house-ard-conbhron';

// Die Kopflinie läuft vom unbekannten Gründerpaar über Dónall und den älteren Iarlaith
// bis zu Labhoise, die (nach der zweiten Überlieferungslücke) den jüngeren Iarlaith als
// Nachfahren stellt. Das Haus ist heute so gut wie erloschen; nur Scáthach, Tlachtga und
// Uathach leben noch.
const HOUSE_HEAD_IDS = new Set([
  'ahnherr-ard-conbhron',
  'donall-ard-conbhron',
  'iarlaith-donall-ard-conbhron',
  'labhoise-ard-conbhron',
  'iarlaith-descendant-ard-conbhron'
]);
const MAIN_LINE_IDS = new Set(['scathach-ard-conbhron', 'uathach-ard-conbhron']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '????', houseId = ARD_CONBHRON_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: SHARED_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ARD_CONBHRON_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

const FOUNDER_IDS = ['ahnherr-ard-conbhron', 'ahnfrau-ard-conbhron'];
const DONALL_IDS = ['donall-ard-conbhron', 'fionnuala-talamh'];
const GARBHAN_IDS = ['garbhan-ard-conbhron', 'muireen-riordain'];
const CLODAGH_IDS = ['clodagh-ard-conbhron', 'tallwch-gwefrydd'];
const LIADAN_IDS = ['liadan-ard-conbhron', 'roibeard-talamh'];
const CAIREEN_IDS = ['caireen-conbhron', 'llamrei-draig'];
const IARLAITH1_IDS = ['iarlaith-donall-ard-conbhron', 'ronnat-muirghin'];
const GRAINNE_IDS = ['grainne-ard-conbhron', 'finbarr-searlait'];
const RAGNAILT_IDS = ['ragnailt-ard-conbhron', 'murchadh-talamh'];
const LABHOISE_IDS = ['labhoise-ard-conbhron', 'odhran-ua-temair'];
const IARLAITH2_IDS = ['iarlaith-descendant-ard-conbhron', 'tlachtga'];

export const HOUSE_ARD_CONBHRON_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ard-conbhron',
    title: 'Haus Ard Conbhrón',
    motto: '',
    description: 'Ein antiker albischer Dún-Tiarna-Clan aus Celtigerns Wacht, Sitz Lycath, dessen Gründerpaar nicht überliefert ist. Heute ist der Clan so gut wie erloschen; nur Scáthach, Tlachtga und Uathach leben noch.',
    emblem: HOUSE_EMBLEMS.ardConbhron,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.ardConbhron
  },
  houses: [
    house(ARD_CONBHRON_HOUSE_ID, 'Haus Ard Conbhrón', HOUSE_EMBLEMS.ardConbhron),
    house('house-talamh', 'Haus Ui Talamh', HOUSE_EMBLEMS.talamh),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-searlait', 'Haus Searlait')
  ],
  persons: [
    // Gründerpaar nicht überliefert.
    person('ahnherr-ard-conbhron', 'Unbekannter Ahnherr', 'male', '????', '????'),
    person('ahnfrau-ard-conbhron', 'Unbekannte Ahnfrau', 'female', '????', '????', ''),

    // Erste namentlich überlieferte Generation nach der Überlieferungslücke
    person('donall-ard-conbhron', 'Dónall', 'male', '????', '????'),
    person('fionnuala-talamh', 'Fionnuala Talamh', 'female', '????', '????', 'house-talamh'),
    person('garbhan-ard-conbhron', 'Garbhán', 'male', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Nebenzweig ohne überlieferte Nachkommen.'
    }),
    person('muireen-riordain', 'Muireen Ríordáin', 'female', '????', '????', ''),
    person('clodagh-ard-conbhron', 'Clodagh Ard Conbhrón', 'female', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Verheiratet an Haus Gwefrydd; Begründerin des dortigen Baronenhauses gemeinsam mit Tallwch.'
    }),
    person('tallwch-gwefrydd', 'Tallwch', 'male', '????', '????', 'house-gwefrydd'),
    person('liadan-ard-conbhron', 'Líadan', 'female', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Verheiratet an Roibeard, den Kopf des Hauses Ui Talamh; ihre Kinder sind dort verzeichnet.'
    }),
    person('roibeard-talamh', 'Roibeard Talamh', 'male', '????', '????', 'house-talamh'),

    // Dónalls und Fionnualas Kinder
    person('caireen-conbhron', 'Caireen Conbhrón', 'female', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Verheiratet an Haus Draig, an Celtigerns Sohn Llamrei; keine weitere Linie in Ard Conbhrón überliefert.'
    }),
    person('llamrei-draig', 'Llamrei', 'male', '????', '????', 'house-draig'),
    person('iarlaith-donall-ard-conbhron', 'Iarlaith', 'male', '????', '????'),
    person('ronnat-muirghin', 'Rónnat Muirghin', 'female', '????', '????', ''),
    person('grainne-ard-conbhron', 'Gráinne', 'female', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Verheiratet an Haus Searlait.'
    }),
    person('finbarr-searlait', 'Finbarr Searlait', 'male', '????', '????', 'house-searlait'),

    // Iarlaiths und Rónnats Kinder
    person('ragnailt-ard-conbhron', 'Ragnailt', 'female', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Verheiratet an Murchadh, den Kopf des Hauses Ui Talamh; ihre Kinder sind dort verzeichnet.'
    }),
    person('murchadh-talamh', 'Murchadh Talamh', 'male', '????', '????', 'house-talamh'),
    person('labhoise-ard-conbhron', 'Labhoise', 'female', '????', '????'),
    person('odhran-ua-temair', 'Odhrán Ua Temair', 'male', '????', '????', ''),

    // Nachfahre nach der zweiten Überlieferungslücke: nur seine Witwe Tlachtga und
    // ihre gemeinsamen Kinder Scáthach und Uathach leben heute noch.
    person('iarlaith-descendant-ard-conbhron', 'Iarlaith', 'male', '????', '????', ARD_CONBHRON_HOUSE_ID, {
      notes: 'Letzter verstorbener Träger der Kopfschaft; seine Witwe Tlachtga und ihre Kinder sind die letzten lebenden Ard Conbhróns.'
    }),
    person('tlachtga', 'Tlachtga', 'female', '????', '', '', {
      familyRole: 'married',
      extensions: { cardFrameId: 'druid' },
      notes: 'Witwe Iarlaiths; eine der letzten drei lebenden Ard Conbhróns.'
    }),

    // Iarlaiths und Tlachtgas Kinder: die letzten lebenden Ard Conbhróns
    person('scathach-ard-conbhron', 'Scáthach', 'female', '????', '', ARD_CONBHRON_HOUSE_ID, {
      extensions: { cardFrameId: 'druid' },
      notes: 'Eine der letzten drei lebenden Ard Conbhróns.'
    }),
    person('uathach-ard-conbhron', 'Uathach', 'female', '????', '', ARD_CONBHRON_HOUSE_ID, {
      extensions: { cardFrameId: 'druid' },
      notes: 'Eine der letzten drei lebenden Ard Conbhróns.'
    })
  ],
  partnerships: [
    createMarriage('marriage-ahnherr-ahnfrau', ...FOUNDER_IDS),
    createMarriage('marriage-donall-fionnuala', ...DONALL_IDS),
    createMarriage('marriage-garbhan-muireen', ...GARBHAN_IDS),
    createMarriage('marriage-clodagh-tallwch', ...CLODAGH_IDS),
    createMarriage('marriage-liadan-roibeard', ...LIADAN_IDS),
    createMarriage('marriage-caireen-llamrei', ...CAIREEN_IDS),
    createMarriage('marriage-iarlaith-ronnat', ...IARLAITH1_IDS),
    createMarriage('marriage-grainne-finbarr', ...GRAINNE_IDS),
    createMarriage('marriage-ragnailt-murchadh', ...RAGNAILT_IDS),
    createMarriage('marriage-labhoise-odhran', ...LABHOISE_IDS),
    createMarriage('marriage-iarlaith2-tlachtga', ...IARLAITH2_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['donall-ard-conbhron', 'garbhan-ard-conbhron', 'clodagh-ard-conbhron', 'liadan-ard-conbhron'],
      FOUNDER_IDS,
      'marriage-ahnherr-ahnfrau',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere Generationen zwischen dem Gründerpaar und dieser Geschwistergruppe sind nicht überliefert.'
      }
    ),
    ...childrenOf(['caireen-conbhron', 'iarlaith-donall-ard-conbhron', 'grainne-ard-conbhron'], DONALL_IDS, 'marriage-donall-fionnuala'),
    ...childrenOf(['ragnailt-ard-conbhron', 'labhoise-ard-conbhron'], IARLAITH1_IDS, 'marriage-iarlaith-ronnat'),
    ...childrenOf(['iarlaith-descendant-ard-conbhron'], LABHOISE_IDS, 'marriage-labhoise-odhran', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Mehrere Generationen bis zur jüngsten Zeit sind nicht überliefert.'
    }),
    ...childrenOf(['scathach-ard-conbhron', 'uathach-ard-conbhron'], IARLAITH2_IDS, 'marriage-iarlaith2-tlachtga')
  ],
  cadetBranches: [
    marriedAway('married-away-gwefrydd-clodagh', 'Haus Gwefrydd', 'marriage-clodagh-tallwch', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-talamh-liadan', 'Haus Ui Talamh', 'marriage-liadan-roibeard', 'house-talamh', HOUSE_EMBLEMS.talamh),
    marriedAway('married-away-draig-caireen', 'Haus Draig', 'marriage-caireen-llamrei', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-searlait-grainne', 'Haus Searlait', 'marriage-grainne-finbarr', 'house-searlait'),
    marriedAway('married-away-talamh-ragnailt', 'Haus Ui Talamh', 'marriage-ragnailt-murchadh', 'house-talamh', HOUSE_EMBLEMS.talamh)
  ],
  timeJumps: [
    {
      id: 'gap-labhoise-iarlaith',
      parentPartnershipId: 'marriage-labhoise-odhran',
      childIds: ['iarlaith-descendant-ard-conbhron'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Mehrere nicht überlieferte Generationen bis zur jüngsten Zeit',
      notes: 'Die dazwischenliegenden Generationen werden in der Vorlage nicht einzeln genannt.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-ahnherr-ahnfrau',
    houseId: ARD_CONBHRON_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Die ersten namentlich überlieferten Generationen nach dem Gründerpaar sind nicht einzeln bekannt'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ahnherr-ard-conbhron',
    orientation: 'vertical',
    ancestorDepth: 5,
    descendantDepth: 5,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {}
});
