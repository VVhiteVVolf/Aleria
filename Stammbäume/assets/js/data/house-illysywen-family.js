import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createExtinctBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from './house-illysywen-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  illysywen: 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png'
});

const ILLYSYWEN_HOUSE_ID = 'house-illysywen';
const HOUSE_HEAD_IDS = new Set([
  'arwel-illysywen',
  'llwyd-illysywen',
  'gogyvwlch-illysywen',
  'ercwlff-illysywen'
]);
const MAIN_LINE_IDS = new Set(['nodawl-illysywen', 'hugwan-illysywen']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ILLYSYWEN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_ILLYSYWEN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ILLYSYWEN_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['arwel-illysywen', 'aeronwen'];
const LLWYD_IDS = ['llwyd-illysywen', 'ellanah-eryr'];
const GOGYVWLCH_IDS = ['gogyvwlch-illysywen', 'gwyneth-blach'];
const ERCWLFF_IDS = ['ercwlff-illysywen', 'wenna-saethwyr'];
const NODAWL_IDS = ['nodawl-illysywen', 'dagny-brathfengr'];
const EINION_IDS = ['einion-illysywen', 'xantippe-pyrth'];

export const HOUSE_ILLYSYWEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-illysywen',
    title: 'Haus Illysywen',
    motto: '',
    description: 'Die erloschene Linie des Ritterfürstenhauses Illysywen von Castellbryn: von Arwel dem Schwarzen Aal bis zum Aussterben der männlichen Linie im Jahr 1720.',
    emblem: HOUSE_EMBLEMS.illysywen,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.illysywen
  },
  houses: [
    house(ILLYSYWEN_HOUSE_ID, 'Haus Illysywen', HOUSE_EMBLEMS.illysywen),
    house('house-eryr', 'Haus Eryr'),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-blach', 'Haus Blach'),
    house('house-seaghda', 'Haus Séaghda'),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-brathfengr', 'Haus Brathfengr'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-pyrth', 'Haus Pyrth'),
    house('house-eldrath', 'Haus Eldrath'),
    house('house-rochraide', 'Haus Rochraide'),
    house('house-eldath', 'Haus Eldath')
  ],
  persons: [
    // Gründerpaar
    person('arwel-illysywen', 'Arwel', 'male', '????', '????', ILLYSYWEN_HOUSE_ID, {
      title: 'Der Schwarze Aal, Begründer des Ritterfürstenhauses Illysywen'
    }),
    person('aeronwen', 'Aeronwen', 'female', '????', '????', '', { familyRole: 'married' }),

    // Nach der Überlieferungslücke
    person('llwyd-illysywen', 'Llwyd', 'male', '1609', '1681'),
    person('ysbail-illyswen', 'Ysbail', 'female', '1617', '1689', ILLYSYWEN_HOUSE_ID, {
      worldPersonId: 'person--haus-illyswen--ysbail-illyswen'
    }),
    person('ellanah-eryr', 'Ellanah Eryr', 'female', '1610', '1671', 'house-eryr'),
    person('ormund-gwefrydd', 'Ormund Gwefrydd', 'male', '1621', '1687', 'house-gwefrydd'),

    // Kinder von Llwyd und Ellanah
    person('gogyvwlch-illysywen', 'Gogyvwlch', 'male', '1627', '1689'),
    person('jenifrydd-illysywen', 'Jenifrydd', 'female', '1630', '1693'),
    person('gwyneth-blach', 'Gwyneth Blach', 'female', '1628', '1677', 'house-blach'),
    person('malachy-seaghda', 'Malachy Séaghda', 'male', '1628', '1675', 'house-seaghda'),

    // Kinder von Gogyvwlch und Gwyneth
    person('ercwlff-illysywen', 'Ercwlff', 'male', '1661', '1720', ILLYSYWEN_HOUSE_ID, {
      title: 'Letzter Ritterfürst des Hauses Illysywen'
    }),
    person('dajenne-illyswen', 'Dajenne', 'female', '1654', '1699', ILLYSYWEN_HOUSE_ID, {
      worldPersonId: 'person--haus-illyswen--dajenne-illyswen'
    }),
    person('wenna-saethwyr', 'Wenna Saethwyr', 'female', '1666', '1720', 'house-saethwyr'),
    person('kimball-gwyvern', 'Kimball Gwyvern', 'male', '1652', '1715', 'house-gwyvern'),

    // Kinder von Ercwlff und Wenna
    person('nodawl-illysywen', "Nodawl Illysywen O'Castellbryn", 'male', '1682', '1720'),
    person('morwen-illysywen', 'Morwen', 'female', '1683', '1720'),
    person('einion-illysywen', 'Einion', 'male', '1684', '1720'),
    person('dagny-brathfengr', 'Dagny Brathfengr', 'female', '1684', '', 'house-brathfengr'),
    person('rhonwen-draig', 'Rhonwen Draig', 'female', '1702', '1720', 'house-draig', {
      familyRole: 'forced',
      notes: 'Die Quelle bezeichnet Rhonwen ausdrücklich als Nodawls Opfer.'
    }),
    person('owen-grawn', 'Owen Grawn', 'male', '1675', '', 'house-grawn'),
    person('xantippe-pyrth', 'Xantippe Pyrth', 'female', '1684', '1720', 'house-pyrth'),
    person('onora-eldrath', 'Onora Eldrath', 'female', '1691', '1720', 'house-eldrath', {
      familyRole: 'affair'
    }),

    // Kinder von Nodawl
    person('hugwan-illysywen', 'Hugwan', 'male', '1700', '1720'),
    person('fauna-illysywen', 'Fauna', 'female', '1705', ''),
    person('mair-draig', 'Mair Draig', 'female', '1720', '', 'house-draig', { familyRole: 'core' }),
    person('nasuada-rochraide', 'Nasuada Rochraide', 'female', '1701', '1720', 'house-rochraide'),

    // Kinder von Einion
    person('sior-illysywen', 'Sior', 'male', '1701', '1720'),
    person('megyn-illysywen', 'Megyn', 'female', '1708', ''),
    person('iwan-illysywen', 'Iwan', 'male', '1709', '', ILLYSYWEN_HOUSE_ID, { familyRole: 'bastard' }),
    person('innogen-eldath', 'Innogen Eldath', 'female', '1700', '1720', 'house-eldath')
  ],
  partnerships: [
    createMarriage('marriage-arwel-aeronwen', ...FOUNDER_IDS),
    createMarriage('marriage-llwyd-ellanah', ...LLWYD_IDS),
    createMarriage('marriage-ysbail-ormund', 'ysbail-illyswen', 'ormund-gwefrydd'),
    createMarriage('marriage-gogyvwlch-gwyneth', ...GOGYVWLCH_IDS),
    createMarriage('marriage-jenifrydd-malachy', 'jenifrydd-illysywen', 'malachy-seaghda'),
    createMarriage('marriage-ercwlff-wenna', ...ERCWLFF_IDS),
    createMarriage('marriage-dajenne-kimball', 'dajenne-illyswen', 'kimball-gwyvern'),
    createMarriage('marriage-nodawl-dagny', ...NODAWL_IDS),
    createMarriage('forced-nodawl-rhonwen', 'nodawl-illysywen', 'rhonwen-draig', {
      type: 'forced',
      status: 'ended',
      notes: 'Die Quelle bezeichnet Rhonwen ausdrücklich als Nodawls Opfer.'
    }),
    createMarriage('marriage-morwen-owen', 'morwen-illysywen', 'owen-grawn'),
    createMarriage('marriage-einion-xantippe', ...EINION_IDS),
    createMarriage('affair-einion-onora', 'einion-illysywen', 'onora-eldrath', {
      type: 'affair', status: 'ended'
    }),
    createMarriage('engagement-hugwan-nasuada', 'hugwan-illysywen', 'nasuada-rochraide', { type: 'engagement', status: 'ended' }),
    createMarriage('engagement-sior-innogen', 'sior-illysywen', 'innogen-eldath', { type: 'engagement', status: 'ended' })
  ],
  parentages: [
    ...childrenOf(['llwyd-illysywen', 'ysbail-illyswen'], FOUNDER_IDS, 'marriage-arwel-aeronwen', {
      type: 'claimed', certainty: 'probable'
    }),
    ...childrenOf(['gogyvwlch-illysywen', 'jenifrydd-illysywen'], LLWYD_IDS, 'marriage-llwyd-ellanah'),
    ...childrenOf(['ercwlff-illysywen', 'dajenne-illyswen'], GOGYVWLCH_IDS, 'marriage-gogyvwlch-gwyneth'),
    ...childrenOf(['nodawl-illysywen', 'morwen-illysywen', 'einion-illysywen'], ERCWLFF_IDS, 'marriage-ercwlff-wenna'),
    ...childrenOf(['hugwan-illysywen', 'fauna-illysywen'], NODAWL_IDS, 'marriage-nodawl-dagny'),
    ...childrenOf(['mair-draig'], ['nodawl-illysywen', 'rhonwen-draig'], 'forced-nodawl-rhonwen', {
      legitimacy: 'legitimized',
      notes: 'Mair wurde in Haus Draig legitimiert.'
    }),
    ...childrenOf(['sior-illysywen', 'megyn-illysywen'], EINION_IDS, 'marriage-einion-xantippe'),
    ...childrenOf(['iwan-illysywen'], ['einion-illysywen', 'onora-eldrath'], 'affair-einion-onora', {
      legitimacy: 'illegitimate'
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-arwel-aeronwen',
    houseId: ILLYSYWEN_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1609',
      label: 'Die datierte Überlieferung setzt 1609 wieder ein'
    }
  },
  cadetBranches: [
    marriedAway('married-away-gwefrydd-ysbail', 'Haus Gwefrydd', 'marriage-ysbail-ormund', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-seaghda-jenifrydd', 'Haus Séaghda', 'marriage-jenifrydd-malachy', 'house-seaghda'),
    marriedAway('married-away-gwyvern-dajenne', 'Haus Gwyvern', 'marriage-dajenne-kimball', 'house-gwyvern', HOUSE_EMBLEMS.gwyvern),
    marriedAway('married-away-grawn-morwen', 'Haus Grawn', 'marriage-morwen-owen', 'house-grawn', HOUSE_EMBLEMS.grawn),
    createExtinctBranch({
      id: 'extinct-hugwan',
      parentPersonId: 'hugwan-illysywen',
      houseId: ILLYSYWEN_HOUSE_ID,
      notes: 'Hugwan starb 1720 ohne Nachkommen; die Linie endet hier.'
    }),
    createExtinctBranch({
      id: 'extinct-sior',
      parentPersonId: 'sior-illysywen',
      houseId: ILLYSYWEN_HOUSE_ID,
      notes: 'Sior starb 1720 ohne Nachkommen; die Linie endet hier.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'arwel-illysywen',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Illysywen-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Namens- und jahresgleiche Personen aus Draig, Gwefrydd, Gwyvern und Saethwyr verwenden dieselben Weltpersonen-IDs und Portraitdateien; externe Portraitquellen wurden als lokale Projektdateien gesichert. Die männliche Linie erlosch 1720 mit Hugwan und Sior; die Linie wird nicht über Bastarde oder Töchter fortgeführt.',
    blankFamily: false,
    sourceRevision: 2
  }
});
