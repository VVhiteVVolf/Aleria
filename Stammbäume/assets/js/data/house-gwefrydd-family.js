import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from './house-gwefrydd-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  arwydd: 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const GWEFRYDD_HOUSE_ID = 'house-gwefrydd';
const HOUSE_HEAD_IDS = new Set([
  'tallwch-gwefrydd',
  'wynfor-gwefrydd',
  'kenehyr-gwefrydd',
  'borros-gwefrydd',
  'lyonel-gwefrydd',
  'ormund-gwefrydd',
  'steffon-gwefrydd',
  'robyrt-gwefrydd',
  'stennis-gwefrydd'
]);
const MAIN_LINE_IDS = new Set(['thomos-gwefrydd', 'iorwerth-gwefrydd', 'bethan-gwefrydd']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GWEFRYDD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GWEFRYDD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GWEFRYDD_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['tallwch-gwefrydd', 'clodagh-ard-conbhron'];
const WYNFOR_IDS = ['wynfor-gwefrydd', 'beibhinn-choinnich'];
const KENEHYR_IDS = ['kenehyr-gwefrydd', 'tanwen-draig'];
const BORROS_IDS = ['borros-gwefrydd', 'aisling-laoch'];
const LYONEL_IDS = ['lyonel-gwefrydd', 'gwendolyn-gwarchod'];
const GREIDYAWL_IDS = ['greidyawl-gwefrydd', 'isotta-gafyr'];
const ORMUND_IDS = ['ormund-gwefrydd', 'ysbail-illyswen'];
const EDRIC_IDS = ['edric-gwefrydd', 'luned-marwolaeth'];
const STEFFON_IDS = ['steffon-gwefrydd', 'sulwen-wyrm'];
const URSYN_IDS = ['ursyn-gwefrydd', 'ythalia-pyrth'];
const ROBYRT_IDS = ['robyrt-gwefrydd', 'dajena-tir-addawol'];
const STENNIS_IDS = ['stennis-gwefrydd', 'morwen-dyngwn'];
const RENLY_IDS = ['renly-gwefrydd', 'maelona-ceirwyn'];
const THOMOS_IDS = ['thomos-gwefrydd', 'alys-gwyvern'];
const TOMMEN_IDS = ['tommen-gwefrydd', 'eithne-frisealach'];

export const HOUSE_GWEFRYDD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gwefrydd',
    title: 'Haus Gwefrydd',
    motto: '',
    description: 'Die überlieferte Linie des Baronenhauses Gwefrydd von Rhosmere: von Tallwch und Clodagh Ard Conbhrón über drei Überlieferungslücken bis zur Generation von 1723.',
    emblem: HOUSE_EMBLEMS.gwefrydd,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.gwefrydd
  },
  houses: [
    house(GWEFRYDD_HOUSE_ID, 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-ard-conbhron', 'Haus Ard Conbhrón'),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-laoch', 'Haus Laoch'),
    house('house-wylan', 'Haus Wylan'),
    house('house-draenog', 'Haus Draenog'),
    house('house-gwarchod', 'Haus Gwarchod'),
    house('house-gortach', 'Haus Gortach'),
    house('house-illyswen', 'Haus Illyswen', 'assets/images/houses/Rhonwens Tränen/haus-illysywen.png'),
    house('house-grawn', 'Haus Grawn'),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-dyngwn', 'Haus Dyngwn'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-pyrth', 'Haus Pyrth'),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-ceirwyn', 'Haus Ceirwyn'),
    house('house-creyr', 'Haus Créyr'),
    house('house-coedwig', 'Haus Coedwig'),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-frisealach', 'Haus Frisealach'),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd)
  ],
  persons: [
    // Gründerpaar
    person('tallwch-gwefrydd', 'Tallwch', 'male', '????', '????', GWEFRYDD_HOUSE_ID, {
      title: 'Begründer des Baronenhauses Gwefrydd'
    }),
    person('clodagh-ard-conbhron', 'Clodagh Ard Conbhrón', 'female', '????', '????', 'house-ard-conbhron'),

    // Nach der ersten Überlieferungslücke
    person('wynfor-gwefrydd', 'Wynfor', 'male', '????', '????'),
    person('heulwen-gwefrydd', 'Heulwen', 'female', '????', '????'),
    person('beibhinn-choinnich', 'Beibhinn Choinnich', 'female', '????', '????', 'house-choinnich'),
    person('rheidwyn-gafyr', 'Rheidwyn Gafyr', 'male', '????', '????', 'house-gafyr'),

    // Ab 1096 wieder datierte Linie
    person('kenehyr-gwefrydd', 'Kenehyr', 'male', '1096', '1141'),
    person('morwenna-gwefrydd', 'Morwenna', 'female', '1100', '1184'),
    person('tanwen-draig', 'Tanwen Draig', 'female', '1096', '1177', 'house-draig'),
    person('odyar-saethwyr', 'Odyar Saethwyr', 'male', '1096', '1143', 'house-saethwyr'),

    // Nach der dritten Überlieferungslücke
    person('borros-gwefrydd', 'Borros', 'male', '1578', '1650'),
    person('dylis-gwefrydd', 'Dylis', 'female', '1580', '1655'),
    person('gladdie-gwefrydd', 'Gladdie', 'female', '1590', '1644'),
    person('aisling-laoch', 'Aisling Laoch', 'female', '1579', '1644', 'house-laoch'),
    person('wrnach-wylan', 'Wrnach Wylan', 'male', '1577', '1653', 'house-wylan'),
    person('llywellyn-draenog', 'Llywellyn Draenog', 'male', '1582', '1652', 'house-draenog'),

    // Kinder von Borros und Aisling
    person('lyonel-gwefrydd', 'Lyonel', 'male', '1597', '1667'),
    person('ellyn-gwefrydd', 'Ellyn', 'female', '1600', '1671'),
    person('greidyawl-gwefrydd', 'Greidyawl', 'male', '1598', '1661'),
    person('gwendolyn-gwarchod', 'Gwendolyn Gwarchod', 'female', '1600', '1677', 'house-gwarchod'),
    person('garvan-gortach', 'Garvan Gortach', 'male', '1599', '1668', 'house-gortach'),
    person('isotta-gafyr', 'Isotta Gafyr', 'female', '1597', '1664', 'house-gafyr'),

    // Kinder von Lyonel und Gwendolyn
    person('ormund-gwefrydd', 'Ormund', 'male', '1621', '1687'),
    person('efa-gwefrydd', 'Efa', 'female', '1636', '1691'),
    person('ysbail-illyswen', 'Ysbail Illyswen', 'female', '1617', '1689', 'house-illyswen'),
    person('eifion-grawn', 'Eifion Grawn', 'male', '1636', '1699', 'house-grawn'),

    // Kinder von Greidyawl und Isotta
    person('edric-gwefrydd', 'Edric', 'male', '1624', '1695'),
    person('gwenhwyfar-gwefrydd', 'Gwenhwyfar', 'female', '1627', '1703'),
    person('luned-marwolaeth', 'Luned Marwolaeth', 'female', '1629', '1723', 'house-marwolaeth'),
    person('dewyll-dyngwn', 'Dewyll Dyngwn', 'male', '1620', '1711', 'house-dyngwn'),

    // Kinder von Ormund und Ysbail
    person('steffon-gwefrydd', 'Steffon', 'male', '1648', '1703'),
    person('selyse-gwefrydd', 'Selyse', 'female', '1651', '1705'),
    person('sulwen-wyrm', 'Sulwen Wyrm', 'female', '1652', '1711', 'house-wyrm'),
    person('gallgoid-saethwyr', 'Gallgoid Saethwyr', 'male', '1648', '1720', 'house-saethwyr'),

    // Sohn von Edric und Luned
    person('ursyn-gwefrydd', 'Ursyn', 'male', '1649', '1711'),
    person('ythalia-pyrth', 'Ythalia Pyrth', 'female', '1654', '1702', 'house-pyrth'),

    // Kinder von Steffon und Sulwen
    person('robyrt-gwefrydd', 'Robyrt', 'male', '1666', '1720'),
    person('stennis-gwefrydd', 'Stennis', 'male', '1667', ''),
    person('renly-gwefrydd', 'Renly', 'male', '1670', '1720'),
    person('dajena-tir-addawol', 'Dajena Tir Addawol', 'female', '1672', '1700', 'house-tir-addawol'),
    person('morwen-dyngwn', 'Morwen Dyngwn', 'female', '1670', '', 'house-dyngwn'),
    person('maelona-ceirwyn', 'Maelona Ceirwyn', 'female', '1674', '', 'house-ceirwyn'),

    // Tochter von Ursyn und Ythalia
    person('morwenna-gwefrydd-1669', 'Morwenna', 'female', '1669', '1720'),
    person('glendower-creyr', 'Glendower Créyr', 'male', '1670', '', 'house-creyr'),

    // Kinder von Robyrt und Dajena
    person('gwendolen-gwefrydd', 'Gwendolen', 'female', '1697', ''),
    person('ffion-gwefrydd', 'Ffion', 'female', '1700', ''),
    person('tyreke-coedwig', 'Tyreke Coedwig', 'male', '1694', '', 'house-coedwig'),
    person('rheinallt-gafyr', 'Rheinallt Gafyr', 'male', '1694', '', 'house-gafyr'),

    // Kinder von Stennis und Morwen
    person('thomos-gwefrydd', 'Thomos', 'male', '1698', ''),
    person('branwen-gwefrydd', 'Branwen', 'female', '1700', ''),
    person('alys-gwyvern', 'Alys Gwyvern', 'female', '1699', '', 'house-gwyvern'),
    person('steffan-draig', 'Steffan Draig', 'male', '1696', '', 'house-draig'),

    // Kinder von Renly und Maelona
    person('tommen-gwefrydd', 'Tommen', 'male', '1698', ''),
    person('myrcella-gwefrydd', 'Myrcella', 'female', '1702', '', GWEFRYDD_HOUSE_ID, {
      worldPersonId: 'person--haus-arwydd--myrcella-gwefrydd'
    }),
    person('eithne-frisealach', 'Eithne Frisealach', 'female', '1702', '', 'house-frisealach'),
    person('ieuan-arwydd', 'Ieuan Arwydd', 'male', '1702', '', 'house-arwydd'),

    // Jüngste Generation
    person('iorwerth-gwefrydd', 'Iorwerth', 'male', '1718', ''),
    person('eira-gwefrydd', 'Eira', 'female', '1721', ''),
    person('bethan-gwefrydd', 'Bethan', 'female', '1722', ''),
    person('petyr-gwefrydd', 'Petyr', 'male', '1722', ''),
    person('floris-gwefrydd', 'Floris', 'male', '1723', '')
  ],
  partnerships: [
    createMarriage('marriage-tallwch-clodagh', ...FOUNDER_IDS),
    createMarriage('marriage-wynfor-beibhinn', ...WYNFOR_IDS),
    createMarriage('marriage-heulwen-rheidwyn', 'heulwen-gwefrydd', 'rheidwyn-gafyr'),
    createMarriage('marriage-kenehyr-tanwen', ...KENEHYR_IDS),
    createMarriage('marriage-morwenna-odyar', 'morwenna-gwefrydd', 'odyar-saethwyr'),
    createMarriage('marriage-borros-aisling', ...BORROS_IDS),
    createMarriage('marriage-dylis-wrnach', 'dylis-gwefrydd', 'wrnach-wylan'),
    createMarriage('marriage-gladdie-llywellyn', 'gladdie-gwefrydd', 'llywellyn-draenog'),
    createMarriage('marriage-lyonel-gwendolyn', ...LYONEL_IDS),
    createMarriage('marriage-ellyn-garvan', 'ellyn-gwefrydd', 'garvan-gortach'),
    createMarriage('marriage-greidyawl-isotta', ...GREIDYAWL_IDS),
    createMarriage('marriage-ormund-ysbail', ...ORMUND_IDS),
    createMarriage('marriage-efa-eifion', 'efa-gwefrydd', 'eifion-grawn'),
    createMarriage('marriage-edric-luned', 'edric-gwefrydd', 'luned-marwolaeth'),
    createMarriage('marriage-gwenhwyfar-dewyll', 'gwenhwyfar-gwefrydd', 'dewyll-dyngwn'),
    createMarriage('marriage-steffon-sulwen', ...STEFFON_IDS),
    createMarriage('marriage-selyse-gallgoid', 'selyse-gwefrydd', 'gallgoid-saethwyr'),
    createMarriage('marriage-ursyn-ythalia', ...URSYN_IDS),
    createMarriage('marriage-robyrt-dajena', ...ROBYRT_IDS),
    createMarriage('marriage-stennis-morwen', ...STENNIS_IDS),
    createMarriage('marriage-renly-maelona', ...RENLY_IDS),
    createMarriage('marriage-morwenna-glendower', 'morwenna-gwefrydd-1669', 'glendower-creyr'),
    createMarriage('marriage-gwendolen-tyreke', 'gwendolen-gwefrydd', 'tyreke-coedwig'),
    createMarriage('marriage-ffion-rheinallt', 'ffion-gwefrydd', 'rheinallt-gafyr'),
    createMarriage('marriage-thomos-alys', ...THOMOS_IDS),
    createMarriage('marriage-branwen-steffan', 'branwen-gwefrydd', 'steffan-draig'),
    createMarriage('marriage-tommen-eithne', ...TOMMEN_IDS),
    createMarriage('marriage-myrcella-ieuan', 'myrcella-gwefrydd', 'ieuan-arwydd')
  ],
  parentages: [
    ...childrenOf(['wynfor-gwefrydd', 'heulwen-gwefrydd'], FOUNDER_IDS, 'marriage-tallwch-clodagh', {
      type: 'claimed', certainty: 'probable'
    }),
    ...childrenOf(['kenehyr-gwefrydd', 'morwenna-gwefrydd'], WYNFOR_IDS, 'marriage-wynfor-beibhinn', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-wynfor-kenehyr' }
    }),
    ...childrenOf(['borros-gwefrydd', 'dylis-gwefrydd', 'gladdie-gwefrydd'], KENEHYR_IDS, 'marriage-kenehyr-tanwen', {
      type: 'claimed', certainty: 'probable', extensions: { timeJumpId: 'gap-kenehyr-borros' }
    }),
    ...childrenOf(['lyonel-gwefrydd', 'ellyn-gwefrydd', 'greidyawl-gwefrydd'], BORROS_IDS, 'marriage-borros-aisling'),
    ...childrenOf(['ormund-gwefrydd', 'efa-gwefrydd'], LYONEL_IDS, 'marriage-lyonel-gwendolyn'),
    ...childrenOf(['edric-gwefrydd', 'gwenhwyfar-gwefrydd'], GREIDYAWL_IDS, 'marriage-greidyawl-isotta'),
    ...childrenOf(['steffon-gwefrydd', 'selyse-gwefrydd'], ORMUND_IDS, 'marriage-ormund-ysbail'),
    ...childrenOf(['ursyn-gwefrydd'], EDRIC_IDS, 'marriage-edric-luned'),
    ...childrenOf(['robyrt-gwefrydd', 'stennis-gwefrydd', 'renly-gwefrydd'], STEFFON_IDS, 'marriage-steffon-sulwen'),
    ...childrenOf(['morwenna-gwefrydd-1669'], URSYN_IDS, 'marriage-ursyn-ythalia'),
    ...childrenOf(['gwendolen-gwefrydd', 'ffion-gwefrydd'], ROBYRT_IDS, 'marriage-robyrt-dajena'),
    ...childrenOf(['thomos-gwefrydd', 'branwen-gwefrydd'], STENNIS_IDS, 'marriage-stennis-morwen'),
    ...childrenOf(['tommen-gwefrydd', 'myrcella-gwefrydd'], RENLY_IDS, 'marriage-renly-maelona'),
    ...childrenOf(['iorwerth-gwefrydd', 'eira-gwefrydd', 'bethan-gwefrydd'], THOMOS_IDS, 'marriage-thomos-alys'),
    ...childrenOf(['petyr-gwefrydd', 'floris-gwefrydd'], TOMMEN_IDS, 'marriage-tommen-eithne')
  ],
  lineage: {
    founderPartnershipId: 'marriage-tallwch-clodagh',
    houseId: GWEFRYDD_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    marriedAway('married-away-gafyr-heulwen', 'Haus Gafyr', 'marriage-heulwen-rheidwyn', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-saethwyr-morwenna', 'Haus Saethwyr', 'marriage-morwenna-odyar', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-wylan-dylis', 'Haus Wylan', 'marriage-dylis-wrnach', 'house-wylan'),
    marriedAway('married-away-draenog-gladdie', 'Haus Draenog', 'marriage-gladdie-llywellyn', 'house-draenog'),
    marriedAway('married-away-gortach-ellyn', 'Haus Gortach', 'marriage-ellyn-garvan', 'house-gortach'),
    marriedAway('married-away-grawn-efa', 'Haus Grawn', 'marriage-efa-eifion', 'house-grawn'),
    marriedAway('married-away-dyngwn-gwenhwyfar', 'Haus Dyngwn', 'marriage-gwenhwyfar-dewyll', 'house-dyngwn'),
    marriedAway('married-away-saethwyr-selyse', 'Haus Saethwyr', 'marriage-selyse-gallgoid', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-creyr-morwenna', 'Haus Créyr', 'marriage-morwenna-glendower', 'house-creyr'),
    marriedAway('married-away-coedwig-gwendolen', 'Haus Coedwig', 'marriage-gwendolen-tyreke', 'house-coedwig'),
    marriedAway('married-away-gafyr-ffion', 'Haus Gafyr', 'marriage-ffion-rheinallt', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-draig-branwen', 'Haus Draig', 'marriage-branwen-steffan', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-arwydd-myrcella', 'Haus Arwydd', 'marriage-myrcella-ieuan', 'house-arwydd', HOUSE_EMBLEMS.arwydd)
  ],
  timeJumps: [
    {
      id: 'gap-wynfor-kenehyr', parentPartnershipId: 'marriage-wynfor-beibhinn', childIds: ['kenehyr-gwefrydd', 'morwenna-gwefrydd'],
      years: 0, fromYear: '????', toYear: '1096', label: 'Die datierte Überlieferung setzt 1096 wieder ein', notes: '', extensions: {}
    },
    {
      id: 'gap-kenehyr-borros', parentPartnershipId: 'marriage-kenehyr-tanwen', childIds: ['borros-gwefrydd', 'dylis-gwefrydd', 'gladdie-gwefrydd'],
      years: 0, fromYear: '1177', toYear: '1578', label: 'Die datierte Überlieferung setzt 1578 wieder ein', notes: '', extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tallwch-gwefrydd',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Gwefrydd-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Namens- und jahresgleiche Personen aus Draig, Saethwyr, Gafyr, Wyrm, Gwyvern und Arwydd verwenden dieselben Weltpersonen-IDs und Portraitdateien; externe Portraitquellen wurden als lokale Projektdateien gesichert. Ursyn ist gemäß Tabellenüberschrift der Sohn Edrics und Luneds; Gwenhwyfar wurde nach Haus Dyngwn wegverheiratet.',
    blankFamily: false,
    sourceRevision: 1
  }
});
