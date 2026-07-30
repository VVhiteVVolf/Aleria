import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_MOCHDAER_PORTRAITS } from './house-mochdaer-portraits.js';
import { MOCHDAER_HOUSE_PROFILES } from './mochdaer-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const GWYLIAU_HOUSE_ID = 'house-mochdaer-gwyliau';
const CERRIGARTH_HOUSE_ID = 'house-mochdaer-cerrigarth';
const MOCHDAER_EMBLEM = WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer;
const AETHLEM_WORLD_PERSON_ID = 'person--haus-mochdaer-gwyliau--aethlem-mochdaer';

const HOUSE_EMBLEMS = Object.freeze({
  blodyn: 'assets/images/houses/Blütenland/haus-blodyn.png',
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  dinefwr: 'assets/images/houses/Weidebucht/Melwas Au/haus-dinefwr.png',
  hwyaden: 'assets/images/houses/Weidebucht/Borkenstein/haus-hwyaden.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'aethlem-mochdaer': AETHLEM_WORLD_PERSON_ID,
  'luned-mochdear': 'person--haus-mochdear--luned-mochdear',
  'tarrant-blodyn': 'person--haus-blodyn--tarrant-blodyn',
  'tomi-wylan': 'person--haus-wylan--tomi-wylan'
});

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', houseId = lineHouseId, options = {}) {
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_MOCHDAER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || 'branch',
    ...options
  });
}

function gwyliauPerson(id, name, sex, birth = '????', death = '', houseId = GWYLIAU_HOUSE_ID, options = {}) {
  return personForLine(GWYLIAU_HOUSE_ID, id, name, sex, birth, death, houseId, options);
}

function cerrigarthPerson(id, name, sex, birth = '????', death = '', houseId = CERRIGARTH_HOUSE_ID, options = {}) {
  return personForLine(CERRIGARTH_HOUSE_ID, id, name, sex, birth, death, houseId, options);
}

function endedMarriage(id, firstId, secondId, options = {}) {
  return createMarriage(id, firstId, secondId, { status: 'ended', ...options });
}

function childrenOf(childIds, parentIds, partnershipId) {
  return createParentages(childIds, parentIds, partnershipId);
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold'
  });
}

const GWYLIAU_HOUSES = Object.freeze([
  house(GWYLIAU_HOUSE_ID, "Haus Mochdaer O' Gwyliau", MOCHDAER_EMBLEM),
  house(CERRIGARTH_HOUSE_ID, "Haus Mochdaer O'Cerrigarth", MOCHDAER_EMBLEM),
  house('house-unknown', 'Unbekanntes Haus'),
  house('house-lockart', 'Haus Lockart'),
  house('house-trachwyll', 'Haus Trachwyll'),
  house('house-arfordir', 'Haus Arfordir'),
  house('house-drewi', 'Haus Drewi'),
  house('house-balauric', 'Haus Balauric'),
  house('house-coedwig', 'Haus Coedwig'),
  house('house-dobhar', 'Haus Dobhar'),
  house('house-ness', 'Haus Ness'),
  house('house-blaidd', 'Haus Blaidd'),
  house('house-blodyn', 'Haus Blodyn', HOUSE_EMBLEMS.blodyn),
  house('house-lyfant', 'Haus Lyfant'),
  house('house-crafanc', 'Haus Crafanc'),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-haig', 'Haus Haig'),
  house('house-udgorn', 'Haus Udgorn')
]);

const CERRIGARTH_HOUSES = Object.freeze([
  house(CERRIGARTH_HOUSE_ID, "Haus Mochdaer O'Cerrigarth", MOCHDAER_EMBLEM),
  house(GWYLIAU_HOUSE_ID, "Haus Mochdaer O' Gwyliau", MOCHDAER_EMBLEM),
  house('house-blaidd', 'Haus Blaidd'),
  house('house-dianc', 'Haus Dianc'),
  house('house-dinefwr', 'Haus Dinefwr', HOUSE_EMBLEMS.dinefwr),
  house('house-walwrs', 'Haus Walwrs'),
  house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
  house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
  house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr)
]);

export const HOUSE_MOCHDAER_GWYLIAU_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-mochdaer-gwyliau',
    title: "Haus Mochdaer O' Gwyliau",
    motto: '',
    description: 'Die vennyrianische Herkunftslinie der Mochdaer aus Gwyliau. Der bei Slavi und Lindsey verbliebene Zweig stirbt 1720 mit ihren Kindern und Enkeln aus; Aethlem setzt diese Akte nicht genealogisch fort, sondern verweist ausschließlich auf die neue Linie von Cerrigarth.',
    emblem: MOCHDAER_EMBLEM,
    houseProfile: MOCHDAER_HOUSE_PROFILES.gwyliau
  },
  houses: [...GWYLIAU_HOUSES],
  persons: [
    gwyliauPerson('micah-founder-mochdaer', 'Micah Mochdaer', 'male', '????', '????', GWYLIAU_HOUSE_ID, {
      title: 'Gründer und erster Ritterfürst von Gwyliau',
      lineageRole: 'head'
    }),
    gwyliauPerson('jowna-founder-mochdaer', 'Jowna', 'female', '????', '????', 'house-unknown', { familyRole: 'married' }),

    gwyliauPerson('owain-mochdaer', 'Owain Mochdaer', 'male', '1629', '1699', GWYLIAU_HOUSE_ID, {
      title: 'Ritterfürst von Gwyliau bis 1699',
      lineageRole: 'head'
    }),
    gwyliauPerson('armella-mochdaer', 'Armella Mochdaer', 'female', '1630', '1669'),
    gwyliauPerson('marmaduke-mochdaer', 'Marmaduke Mochdaer', 'male', '1631', '1692'),
    gwyliauPerson('bonnie-lockart', 'Bonnie Lockart', 'female', '1630', '1715', 'house-lockart'),
    gwyliauPerson('mordred-trachwyll', 'Mordred Trachwyll', 'male', '1631', '1698', 'house-trachwyll'),
    gwyliauPerson('arglwyddes-arfordir', 'Arglwyddes Arfordir', 'female', '1632', '1711', 'house-arfordir'),

    gwyliauPerson('merwin-mochdaer', 'Merwin Mochdaer', 'male', '1650', '1714', GWYLIAU_HOUSE_ID, {
      title: 'Ritterfürst von Gwyliau 1699–1714',
      lineageRole: 'head'
    }),
    gwyliauPerson('jinell-mochdaer', 'Jinell Mochdaer', 'female', '1653', '1709'),
    gwyliauPerson('drudwas-mochdaer', 'Drudwas Mochdaer', 'male', '1650', '1720'),
    gwyliauPerson('marvine-mochdaer', 'Marvine Mochdaer', 'female', '1654', '1703'),
    gwyliauPerson('nesta-drewi', 'Nesta Drewi', 'female', '1656', '1720', 'house-drewi'),
    gwyliauPerson('heveydd-balauric', 'Heveydd Balauric', 'male', '1648', '1700', 'house-balauric'),
    gwyliauPerson('mallt-coedwig', 'Mallt Coedwig', 'female', '1652', '1715', 'house-coedwig'),
    gwyliauPerson('donnacha-dobhar', 'Donnacha Dobhar', 'male', '1649', '1711', 'house-dobhar'),

    gwyliauPerson('slavi-mochdaer', 'Slavi Mochdaer', 'male', '1674', '1720', GWYLIAU_HOUSE_ID, {
      title: 'Letzter Ritterfürst von Gwyliau 1714–1720',
      lineageRole: 'head'
    }),
    gwyliauPerson('luned-mochdear', 'Luned Mochdaer', 'female', '1675', '1710'),
    gwyliauPerson('rhosyn-mochdaer', 'Rhosyn Mochdaer', 'female', '1673', '1720'),
    gwyliauPerson('aethlem-mochdaer', 'Aethlem Mochdaer', 'male', '1675', '', GWYLIAU_HOUSE_ID, {
      title: 'Begründer der ausgewanderten Cerrigarth-Linie',
      lineageRole: 'mainline',
      notes: 'Aethlem bleibt als Sohn von Drudwas und Mallt in der Herkunftsakte sichtbar. Seine Ehe mit Lunet ist hier verzeichnet; sämtliche Nachkommen werden ausschließlich in der verknüpften Cerrigarth-Akte geführt.'
    }),
    gwyliauPerson('lunet-blaidd', 'Lunet Blaidd', 'female', '1678', '', 'house-blaidd'),
    gwyliauPerson('jowna-1681-mochdaer', 'Jowna Mochdaer', 'female', '1681', '1738'),
    gwyliauPerson('lindsey-ness', 'Lindsey Ness', 'female', '1675', '1720', 'house-ness'),
    gwyliauPerson('tarrant-blodyn', 'Tarrant Blodyn', 'male', '1672', '1720', 'house-blodyn'),
    gwyliauPerson('cledwyn-lyfant', 'Cledwyn Lyfant', 'male', '1672', '', 'house-lyfant'),
    gwyliauPerson('artgal-crafanc', 'Artgal Crafanc', 'male', '1680', '', 'house-crafanc'),

    gwyliauPerson('idris-mochdaer', 'Idris Mochdaer', 'male', '1693', '1720'),
    gwyliauPerson('ceridwen-mochdaer', 'Ceridwen Mochdaer', 'female', '1699', '1720'),
    gwyliauPerson('meggan-mochdaer', 'Meggan Mochdaer', 'female', '1697', '1720'),
    gwyliauPerson('kimball-gwenyen', 'Kimball Gwenyen', 'male', '1700', '1720', 'house-gwenyen'),
    gwyliauPerson('senga-haig', 'Senga Haig', 'female', '1696', '1720', 'house-haig'),
    gwyliauPerson('tyreke-udgorn', 'Tyreke Udgorn', 'male', '1695', '1720', 'house-udgorn'),
    gwyliauPerson('arian-mochdaer', 'Arian Mochdaer', 'male', '1714', '1720'),
    gwyliauPerson('afon-mochdaer', 'Afon Mochdaer', 'male', '1716', '1720')
  ],
  partnerships: [
    endedMarriage('marriage-micah-jowna-mochdaer', 'micah-founder-mochdaer', 'jowna-founder-mochdaer'),
    endedMarriage('marriage-owain-bonnie-mochdaer', 'owain-mochdaer', 'bonnie-lockart'),
    endedMarriage('marriage-armella-mordred-mochdaer', 'armella-mochdaer', 'mordred-trachwyll'),
    endedMarriage('marriage-marmaduke-arglwyddes-mochdaer', 'marmaduke-mochdaer', 'arglwyddes-arfordir'),
    endedMarriage('marriage-merwin-nesta-mochdaer', 'merwin-mochdaer', 'nesta-drewi'),
    endedMarriage('marriage-jinell-heveydd-mochdaer', 'jinell-mochdaer', 'heveydd-balauric'),
    endedMarriage('marriage-drudwas-mallt-mochdaer', 'drudwas-mochdaer', 'mallt-coedwig'),
    endedMarriage('marriage-marvine-donnacha-mochdaer', 'marvine-mochdaer', 'donnacha-dobhar'),
    endedMarriage('marriage-slavi-lindsey-mochdaer', 'slavi-mochdaer', 'lindsey-ness'),
    endedMarriage('marriage-luned-tarrant-mochdaer', 'luned-mochdear', 'tarrant-blodyn'),
    endedMarriage('marriage-rhosyn-cledwyn-mochdaer', 'rhosyn-mochdaer', 'cledwyn-lyfant'),
    createMarriage('marriage-aethlem-lunet-mochdaer', 'aethlem-mochdaer', 'lunet-blaidd'),
    endedMarriage('marriage-jowna-artgal-mochdaer', 'jowna-1681-mochdaer', 'artgal-crafanc'),
    endedMarriage('marriage-idris-senga-mochdaer', 'idris-mochdaer', 'senga-haig'),
    endedMarriage('marriage-ceridwen-kimball-mochdaer', 'ceridwen-mochdaer', 'kimball-gwenyen'),
    endedMarriage('marriage-meggan-tyreke-mochdaer', 'meggan-mochdaer', 'tyreke-udgorn')
  ],
  parentages: [
    ...childrenOf(['owain-mochdaer', 'armella-mochdaer', 'marmaduke-mochdaer'], ['micah-founder-mochdaer', 'jowna-founder-mochdaer'], 'marriage-micah-jowna-mochdaer'),
    ...childrenOf(['merwin-mochdaer', 'jinell-mochdaer'], ['owain-mochdaer', 'bonnie-lockart'], 'marriage-owain-bonnie-mochdaer'),
    ...childrenOf(['drudwas-mochdaer', 'marvine-mochdaer'], ['marmaduke-mochdaer', 'arglwyddes-arfordir'], 'marriage-marmaduke-arglwyddes-mochdaer'),
    ...childrenOf(['slavi-mochdaer', 'luned-mochdear'], ['merwin-mochdaer', 'nesta-drewi'], 'marriage-merwin-nesta-mochdaer'),
    ...childrenOf(['rhosyn-mochdaer', 'aethlem-mochdaer', 'jowna-1681-mochdaer'], ['drudwas-mochdaer', 'mallt-coedwig'], 'marriage-drudwas-mallt-mochdaer'),
    ...childrenOf(['idris-mochdaer', 'ceridwen-mochdaer', 'meggan-mochdaer'], ['slavi-mochdaer', 'lindsey-ness'], 'marriage-slavi-lindsey-mochdaer'),
    ...childrenOf(['arian-mochdaer', 'afon-mochdaer'], ['idris-mochdaer', 'senga-haig'], 'marriage-idris-senga-mochdaer')
  ],
  cadetBranches: [
    marriedAway('married-away-trachwyll-armella', 'Haus Trachwyll', 'marriage-armella-mordred-mochdaer', 'house-trachwyll', 'haus-trachwyll'),
    marriedAway('married-away-balauric-jinell', 'Haus Balauric', 'marriage-jinell-heveydd-mochdaer', 'house-balauric', 'haus-balauric'),
    marriedAway('married-away-dobhar-marvine', 'Haus Dobhar', 'marriage-marvine-donnacha-mochdaer', 'house-dobhar', 'haus-dobhar'),
    marriedAway('married-away-blodyn-luned', 'Haus Blodyn', 'marriage-luned-tarrant-mochdaer', 'house-blodyn', 'haus-blodyn', HOUSE_EMBLEMS.blodyn),
    marriedAway('married-away-lyfant-rhosyn', 'Haus Lyfant', 'marriage-rhosyn-cledwyn-mochdaer', 'house-lyfant', 'haus-lyfant'),
    marriedAway('married-away-crafanc-jowna', 'Haus Crafanc', 'marriage-jowna-artgal-mochdaer', 'house-crafanc', 'haus-crafanc'),
    marriedAway('married-away-gwenyen-ceridwen', 'Haus Gwenyen', 'marriage-ceridwen-kimball-mochdaer', 'house-gwenyen', 'haus-gwenyen'),
    marriedAway('married-away-udgorn-meggan', 'Haus Udgorn', 'marriage-meggan-tyreke-mochdaer', 'house-udgorn', 'haus-udgorn'),
    createCadetHouseBranch({
      id: 'migration-aethlem-cerrigarth',
      name: "Haus Mochdaer O'Cerrigarth",
      parentPartnershipId: 'marriage-aethlem-lunet-mochdaer',
      houseId: CERRIGARTH_HOUSE_ID,
      targetFamilyId: 'haus-mochdaer',
      emblem: MOCHDAER_EMBLEM,
      founded: '1720',
      subtitle: 'Neue Linie von Cerrigarth',
      crestFrame: 'gold',
      notes: 'Der Knoten geht gemeinsam von Aethlem und Lunet aus. Ihre Nachkommen werden nur in der Zielakte von Cerrigarth fortgeführt.'
    })
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-micah-jowna-mochdaer',
    houseId: GWYLIAU_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Gwyliau',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1629',
      label: 'Die belegte Linie setzt 1629 wieder ein'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'micah-founder-mochdaer',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Vennyrianische Herkunftsakte nach der bereitgestellten Mochdaer-Tabelle. Der Auslassungspunkt der Quelle wird als absoluter serieller Zeitsprung direkt nach dem Gwyliau-Hauswappen und vor Owain, Armella und Marmaduke geführt. Aethlem ist hier Sohn von Drudwas und Mallt; seine Ehe mit Lunet ist dieselbe wie in Cerrigarth und führt geradlinig in den gemeinsamen Kadettenhausknoten. Seine Nachkommen sind bewusst nicht Teil dieser Akte. Slavis und Lindseys vollständiger verbliebener Zweig endet 1720 mit Idris, Ceridwen und Meggan sowie den Enkeln Arian und Afon.'
  }
});

export const HOUSE_MOCHDAER_CERRIGARTH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-mochdaer',
    title: "Haus Mochdaer O'Cerrigarth",
    motto: '',
    description: 'Die 1720 von Aethlem Mochdaer begründete Cerrigarth-Linie in der Weidebucht. Diese Akte allein führt Aethlems Ehe mit Lunet Blaidd und ihre Nachkommen fort.',
    emblem: MOCHDAER_EMBLEM,
    houseProfile: MOCHDAER_HOUSE_PROFILES.cerrigarth
  },
  houses: [...CERRIGARTH_HOUSES],
  persons: [
    cerrigarthPerson('aethlem-mochdaer', 'Aethlem Mochdaer', 'male', '1675', '', CERRIGARTH_HOUSE_ID, {
      title: 'Gründer und Ritterfürst von Cerrigarth seit 1720',
      lineageRole: 'head',
      notes: 'Aethlem stammt aus der verknüpften Gwyliau-Akte. Nur in dieser Cerrigarth-Akte werden seine Ehe und seine Nachkommen fortgeführt.'
    }),
    cerrigarthPerson('lunet-blaidd', 'Lunet Blaidd', 'female', '1678', '', 'house-blaidd'),
    cerrigarthPerson('vanna-mochdaer', 'Vanna Mochdaer', 'female', '1698', '1720'),
    cerrigarthPerson('micah-1693-mochdaer', 'Micah Mochdaer', 'male', '1693', '', CERRIGARTH_HOUSE_ID, {
      title: 'Erster in der Erbfolge von Cerrigarth',
      lineageRole: 'mainline'
    }),
    cerrigarthPerson('catrin-mochdaer', 'Catrin Mochdaer', 'female', '1699', ''),
    cerrigarthPerson('murvin-dianc', 'Murvin Dianc', 'male', '1698', '1720', 'house-dianc'),
    cerrigarthPerson('jenica-dinefwr', 'Jenica Dinefwr', 'female', '1698', '', 'house-dinefwr'),
    cerrigarthPerson('tathal-walwrs', 'Tathal Walwrs', 'male', '1694', '', 'house-walwrs'),
    cerrigarthPerson('jareth-mochdaer', 'Jareth Mochdaer', 'male', '1721', '', CERRIGARTH_HOUSE_ID, {
      title: 'Zweiter in der Erbfolge von Cerrigarth',
      lineageRole: 'mainline'
    }),
    cerrigarthPerson('cariad-mochdaer', 'Cariad Mochdaer', 'female', '1723', ''),
    cerrigarthPerson('cadel-mochdaer', 'Cadel Mochdaer', 'male', '1724', '', CERRIGARTH_HOUSE_ID, {
      title: 'Dritter in der Erbfolge von Cerrigarth',
      lineageRole: 'mainline'
    }),
    cerrigarthPerson('marve-hwyaden', 'Marve Hwyaden', 'female', '1723', '', 'house-hwyaden'),
    cerrigarthPerson('tomi-wylan', 'Tomi Wylan', 'male', '1719', '', 'house-wylan'),
    cerrigarthPerson('gwynfa-creyr', 'Gwynfa Créyr', 'female', '1724', '', 'house-creyr')
  ],
  partnerships: [
    createMarriage('marriage-aethlem-lunet-mochdaer', 'aethlem-mochdaer', 'lunet-blaidd'),
    endedMarriage('marriage-vanna-murvin-mochdaer', 'vanna-mochdaer', 'murvin-dianc'),
    createMarriage('marriage-micah-jenica-mochdaer', 'micah-1693-mochdaer', 'jenica-dinefwr'),
    createMarriage('marriage-catrin-tathal-mochdaer', 'catrin-mochdaer', 'tathal-walwrs'),
    createMarriage('engagement-jareth-marve-mochdaer', 'jareth-mochdaer', 'marve-hwyaden', { type: 'engagement' }),
    createMarriage('engagement-cariad-tomi-mochdaer', 'cariad-mochdaer', 'tomi-wylan', { type: 'engagement' }),
    createMarriage('engagement-cadel-gwynfa-mochdaer', 'cadel-mochdaer', 'gwynfa-creyr', { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['vanna-mochdaer', 'micah-1693-mochdaer', 'catrin-mochdaer'], ['aethlem-mochdaer', 'lunet-blaidd'], 'marriage-aethlem-lunet-mochdaer'),
    ...childrenOf(['jareth-mochdaer', 'cariad-mochdaer', 'cadel-mochdaer'], ['micah-1693-mochdaer', 'jenica-dinefwr'], 'marriage-micah-jenica-mochdaer')
  ],
  cadetBranches: [
    marriedAway('married-away-dianc-vanna', 'Haus Dianc', 'marriage-vanna-murvin-mochdaer', 'house-dianc', 'haus-dianc'),
    marriedAway('married-away-walwrs-catrin', 'Haus Walwrs', 'marriage-catrin-tathal-mochdaer', 'house-walwrs', 'haus-walwrs')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-aethlem-lunet-mochdaer',
    houseId: CERRIGARTH_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Cerrigarth · gegründet 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aethlem-mochdaer',
    orientation: 'vertical',
    ancestorDepth: 5,
    descendantDepth: 7,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceNote: 'Eigenständige Cerrigarth-Akte ab Aethlem Mochdaer. Aethlem verwendet dieselbe Weltidentität wie in Gwyliau; seine Ehe mit Lunet Blaidd, ihre drei Kinder und ausschließlich Micahs Nachkommen werden nur hier geführt. Dadurch entstehen beim Wechsel zwischen den Akten keine gedoppelten Kinder.'
  }
});
