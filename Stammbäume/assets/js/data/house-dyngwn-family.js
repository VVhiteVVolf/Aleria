import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_DYNGWN_PORTRAITS } from './house-dyngwn-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const DYNGWN_HOUSE_ID = 'house-dyngwn';
const DYNGWN_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn;

const HOUSE_EMBLEMS = Object.freeze({
  arwydd: 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  creyr: 'assets/images/houses/Weidebucht/haus-creyr.png',
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  dyngwn: DYNGWN_EMBLEM,
  fiachraoin: VORTIGERNS_RUH_HOUSE_EMBLEMS.fiachraoin,
  gallchobhair: 'assets/images/houses/clan-gallchobhair.svg',
  grael: VORTIGERNS_RUH_HOUSE_EMBLEMS.grael,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const SOURCE_MANAGED_PERSON_FIELDS = Object.freeze([
  'worldPersonId',
  'name',
  'title',
  'sex',
  'status',
  'birth',
  'death',
  'portrait',
  'portraitPlaceholder',
  'houseId',
  'familyRole',
  'lineageRole',
  'tags',
  'notes'
]);

function person(id, name, sex, birth, death = '', options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId: options.houseId === undefined ? DYNGWN_HOUSE_ID : options.houseId,
    portrait: HOUSE_DYNGWN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: ['Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  kynwas: ['kynwas-schwertarm-dyngwn', 'niam-fiachraoin'],
  goronwy: ['goronwy-dyngwn', 'saoirse-luga'],
  rhonwen: ['melwas-pendrag', 'rhonwen-dyngwn'],
  cadogan: ['arianell-dienyddiwr', 'cadogan-dyngwn'],
  myfanwy: ['myfanwy-dyngwn', 'gorn-gallchobhair'],
  arthur: ['arthur-dyngwn', 'irgraine-crefyddol'],
  sioned: ['cadfael-draig', 'sioned-dyngwn'],
  morganAoirghe: ['aoirghe-neidr', 'morgan-dyngwn'],
  morganRhonwen: ['rhonwen-grael', 'morgan-dyngwn'],
  aeronwy: ['aeronwy-dyngwn', 'murvin-morfil'],
  rhondia: ['rhondia-dyngwn', 'merlion-morthwyll'],
  dewey: ['gwennoeth-ceirwyn', 'dewey-dyngwn'],
  derwen: ['derwen-dyngwn', 'gwrtheyrn-dinefwr'],
  dylis: ['gallgoid-wyrm', 'dylis-dyngwn'],
  dewyll: ['gwenhwyfar-gwefrydd', 'dewyll-dyngwn'],
  deliah: ['deliah-dyngwn', 'collen-hwyaden'],
  dilwyn: ['dilwyn-dyngwn', 'aoibheann-mata'],
  delwen: ['delwen-dyngwn', 'ninian-marwolaeth'],
  dadweir: ['dadweir-dyngwn', 'aingeal-midgna'],
  gwlgawd: ['gwlgawd-dyngwn', 'arddunwen-chiffydllon'],
  caradwyn: ['caradwyn-dyngwn', 'gwynham-mwyalchen'],
  glewlwyd: ['glewlwyd-dyngwn', 'fidelma-lockart'],
  eira: ['eira-dyngwn', 'rhynnon-llwynog'],
  enola: ['seithved-gwyvern', 'enola-dyngwn'],
  glendower: ['glendower-dyngwn', 'cenawen-crefyddol'],
  morwenna: ['morwenna-dyngwn', 'emer-choinnich'],
  gwynnan: ['gwynnan-dyngwn', 'muireann-airt'],
  garith: ['revelyn-dienyddiwr', 'garith-dyngwn'],
  morwen: ['morwen-dyngwn', 'stennis-gwefrydd'],
  brangwen: ['brangwen-dyngwn', 'gwernwy-gwarchod'],
  dafydd: ['dafydd-dyngwn', 'gwenllian-marwolaeth'],
  endelyn: ['endelyn-dyngwn', 'idwal-baedd'],
  gethin: ['gethin-dyngwn', 'gwenllian-creyr'],
  jeanae: ['jeanae-dyngwn', 'hael-tir-addawol'],
  grugyn: ['dilys-ceirwyn', 'grugyn-dyngwn'],
  bethania: ['talfryn-penderyn', 'bethania-dyngwn'],
  derwyn: ['lynfa-1696-arth', 'derwyn-dyngwn'],
  eirlys: ['liam-wylan', 'eirlys-dyngwn'],
  kynwas1694: ['kynwas-1694-dyngwn', 'gulda-nachtjaeger'],
  dolena: ['dolena-dyngwn', 'meurig-blach'],
  delvin: ['ysabeth-dienyddiwr', 'delvin-dyngwn'],
  dillan: ['hafren-saethwyr', 'dillan-dyngwn'],
  ystafel: ['ystafel-dyngwn', 'aeddan-tiwna'],
  dean: ['meriel-wyrm', 'dean-dyngwn'],
  hafwen: ['meilyr-pysgod', 'hafwen-dwyngwn'],
  dyddi: ['iorwerth-arwydd', 'dyddi-dyngwn']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-kynwas-niam-dyngwn': COUPLES.kynwas,
  'marriage-goronwy-saoirse-dyngwn': COUPLES.goronwy,
  'marriage-arianell-cadogan-dienyddiwr': COUPLES.cadogan,
  'marriage-arthur-irgraine-dyngwn': COUPLES.arthur,
  'marriage-aoirghe-morgan': COUPLES.morganAoirghe,
  'marriage-rhonwen-morgan-grael': COUPLES.morganRhonwen,
  'marriage-gwennoeth-dewey-ceirwyn': COUPLES.dewey,
  'marriage-gwenhwyfar-dewyll': COUPLES.dewyll,
  'marriage-dilwyn-aoibheann-dyngwn': COUPLES.dilwyn,
  'marriage-dadweir-aingeal-dyngwn': COUPLES.dadweir,
  'marriage-gwlgawd-arddunwen-dyngwn': COUPLES.gwlgawd,
  'marriage-glewlwyd-fidelma-dyngwn': COUPLES.glewlwyd,
  'marriage-glendower-cenawen-dyngwn': COUPLES.glendower,
  'marriage-gwynnan-muireann-dyngwn': COUPLES.gwynnan,
  'marriage-revelyn-garith-dienyddiwr': COUPLES.garith,
  'marriage-dafydd-gwenllian-dyngwn': COUPLES.dafydd,
  'marriage-gethin-gwenllian-dyngwn': COUPLES.gethin,
  'marriage-dilys-grugyn-ceirwyn': COUPLES.grugyn,
  'marriage-lynfa-derwyn': COUPLES.derwyn,
  'marriage-kynwas-gulda-dyngwn': COUPLES.kynwas1694,
  'marriage-ysabeth-delvin-dienyddiwr': COUPLES.delvin,
  'marriage-hafren-dillan': COUPLES.dillan,
  'marriage-meriel-dean': COUPLES.dean
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'dyngwn-parentage', ...options }
  );
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: `Wegverheiratet an ${name}`
  });
}

export const HOUSE_DYNGWN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dyngwn',
    title: "Haus Dyngwn O'Mathragon",
    motto: '',
    description: 'Renommiertes Ritterfürstenhaus von Mathragon, bekannt für strenge Disziplin, meisterlichen Schwertkampf und seine angesehene Ritterschule.',
    emblem: DYNGWN_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.dyngwn
  },
  houses: [
    house(DYNGWN_HOUSE_ID, "Haus Dyngwn O'Mathragon", DYNGWN_EMBLEM),
    house('house-fiachraoin', 'Clan Fiachraoin', HOUSE_EMBLEMS.fiachraoin),
    house('house-luga', 'Haus Luga'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-dienyddiwr', 'Haus Dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    house('house-gallchobhair', 'Clan Gallchobhair', HOUSE_EMBLEMS.gallchobhair),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-grael', 'Haus Grael', HOUSE_EMBLEMS.grael),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-morthwyll', 'Haus Morthwyll'),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-dinefwr', 'Haus Dinefwr'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-mata', 'Haus Mata'),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-midgna', 'Haus Midgna'),
    house('house-chiffyddlon', 'Haus Chiffyddlon'),
    house('house-mwyalchen', 'Haus Mwyalchen'),
    house('house-lockart', 'Haus Lockart'),
    house('house-llwynog', 'Haus Llwynog'),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-choinnich', 'Haus Choinnich'),
    house('house-airt', 'Haus Airt'),
    house('house-gwarchod', 'Haus Gwarchod'),
    house('house-baedd', 'Haus Baedd'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-tir-addawol', 'Haus Tir Addawol'),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-nachtjaeger', 'Haus Nachtjäger'),
    house('house-blach', 'Haus Blach'),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-pysgod', 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd)
  ],
  persons: [
    person('kynwas-schwertarm-dyngwn', 'Kynwas Schwertarm Dyngwn', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Dyngwn',
      lineageRole: 'head'
    }),
    spouse('niam-fiachraoin', 'Niam Fiachraoin', 'female', '????', '????', {
      houseId: 'house-fiachraoin'
    }),

    person('goronwy-dyngwn', 'Goronwy Dyngwn', 'male', '????', '????', {
      title: 'Ritterfürst des Hauses Dyngwn',
      lineageRole: 'head'
    }),
    awayWoman('rhonwen-dyngwn', 'Rhonwen Dyngwn', '????', '????', 'Haus Pendrag'),
    spouse('saoirse-luga', 'Saoirse Luga', 'female', '????', '????', { houseId: 'house-luga' }),
    spouse('melwas-pendrag', 'Melwas Pendrag', 'male', '????', '????', { houseId: 'house-pendrag' }),

    person('cadogan-dyngwn', 'Cadogan Dyngwn', 'male', '1564', '1653', {
      title: 'Ritterfürst des Hauses Dyngwn bis 1653',
      lineageRole: 'head'
    }),
    awayWoman('myfanwy-dyngwn', 'Myfanwy Dyngwn', '1571', '1639', 'Clan Gallchobhair'),
    person('arthur-dyngwn', 'Arthur Dyngwn', 'male', '1579', '1676'),
    spouse('arianell-dienyddiwr', 'Arianell Dienyddiwr', 'female', '1570', '1646', { houseId: 'house-dienyddiwr' }),
    spouse('gorn-gallchobhair', 'Gorn Gallchobhair', 'male', '1568', '1643', { houseId: 'house-gallchobhair' }),
    spouse('irgraine-crefyddol', 'Irgraine Crefyddol', 'female', '1585', '1655', { houseId: 'house-crefyddol' }),

    awayWoman('sioned-dyngwn', 'Sioned Dyngwn', '1602', '1689', 'Haus Draig'),
    person('morgan-dyngwn', 'Morgan Dyngwn', 'male', '1588', '????', {
      title: 'Ritterfürst · Oberhaupt des Hauses Dyngwn seit 1653',
      lineageRole: 'head',
      status: 'dead',
      notes: 'Die Gegenakte Haus Grael kennzeichnet Morgan trotz unbekannten Todesjahrs ausdrücklich als verstorben.'
    }),
    awayWoman('aeronwy-dyngwn', 'Aeronwy Dyngwn', '1614', '1698', 'Haus Morfil'),
    awayWoman('rhondia-dyngwn', 'Rhondia Dyngwn', '1622', '1699', 'Haus Morthwyll'),
    spouse('cadfael-draig', 'Cadfael Draig', 'male', '1602', '1669', { houseId: 'house-draig' }),
    spouse('aoirghe-neidr', 'Aoirghe Neidr', 'female', '1594', '1630', { houseId: 'house-neidr' }),
    spouse('rhonwen-grael', 'Rhonwen Grael', 'female', '1612', '', { houseId: 'house-grael' }),
    spouse('murvin-morfil', 'Murvin Morfil', 'male', '1611', '1682', { houseId: 'house-morfil' }),
    spouse('merlion-morthwyll', 'Merlion Morthwyll', 'male', '1621', '1688', { houseId: 'house-morthwyll' }),

    person('dewey-dyngwn', 'Dewey Dyngwn', 'male', '1613', '1700'),
    awayWoman('derwen-dyngwn', 'Derwen Dyngwn', '1610', '1666', 'Haus Dinefwr'),
    awayWoman('dylis-dyngwn', 'Dylis Dyngwn', '1630', '1704', 'Haus Wyrm'),
    person('dewyll-dyngwn', 'Dewyll Dyngwn', 'male', '1620', '1711'),
    awayWoman('deliah-dyngwn', 'Deliah Dyngwn', '1633', '1687', 'Haus Hwyaden'),
    person('dilwyn-dyngwn', 'Dilwyn Dyngwn', 'male', '1634', '1712'),
    awayWoman('delwen-dyngwn', 'Delwen Dyngwn', '1636', '1687', 'Haus Marwolaeth'),
    person('dadweir-dyngwn', 'Dadweir Dyngwn', 'male', '1635', '1720'),
    spouse('gwennoeth-ceirwyn', 'Gwennoeth Ceirwyn', 'female', '1613', '1706', { houseId: 'house-ceirwyn' }),
    spouse('gwrtheyrn-dinefwr', 'Gwrtheyrn Dinefwr', 'male', '1605', '1642', { houseId: 'house-dinefwr' }),
    spouse('gallgoid-wyrm', 'Gallgoid Wyrm', 'male', '1624', '1685', { houseId: 'house-wyrm' }),
    spouse('gwenhwyfar-gwefrydd', 'Gwenhwyfar Gwefrydd', 'female', '1627', '1703', { houseId: 'house-gwefrydd' }),
    spouse('collen-hwyaden', 'Collen Hwyaden', 'male', '1630', '1703', { houseId: 'house-hwyaden' }),
    spouse('aoibheann-mata', 'Aoibheann Mata', 'female', '1634', '1689', { houseId: 'house-mata' }),
    spouse('ninian-marwolaeth', 'Ninian Marwolaeth', 'male', '1630', '1709', { houseId: 'house-marwolaeth' }),
    spouse('aingeal-midgna', 'Aingeal Midgna', 'female', '1634', '1692', { houseId: 'house-midgna' }),

    person('gwlgawd-dyngwn', 'Gwlgawd Dyngwn', 'male', '1654', '', {
      title: 'Erbfolge des Hauses Dyngwn',
      lineageRole: 'mainline'
    }),
    awayWoman('caradwyn-dyngwn', 'Caradwyn Dyngwn', '1653', '1711', 'Haus Mwyalchen'),
    person('glewlwyd-dyngwn', 'Glewlwyd Dyngwn', 'male', '1648', ''),
    awayWoman('eira-dyngwn', 'Eira Dyngwn', '1653', '1735', 'Haus Llwynog'),
    awayWoman('enola-dyngwn', 'Enola Dyngwn', '1650', '1711', 'Haus Gwyvern'),
    person('glendower-dyngwn', 'Glendower Dyngwn', 'male', '1655', '1720'),
    awayWoman('morwenna-dyngwn', 'Morwenna Dyngwn', '1653', '1704', 'Haus Choinnich'),
    person('gwynnan-dyngwn', 'Gwynnan Dyngwn', 'male', '1653', '1720'),
    spouse('arddunwen-chiffydllon', 'Arddunwen Chiffyddlon', 'female', '1655', '1701', { houseId: 'house-chiffyddlon' }),
    spouse('gwynham-mwyalchen', 'Gwynham Mwyalchen', 'male', '1650', '1718', { houseId: 'house-mwyalchen' }),
    spouse('fidelma-lockart', 'Fidelma Lockart', 'female', '1651', '1720', { houseId: 'house-lockart' }),
    spouse('rhynnon-llwynog', 'Rhynnon Llwynog', 'male', '1652', '1717', { houseId: 'house-llwynog' }),
    spouse('seithved-gwyvern', 'Seithved Gwyvern', 'male', '1649', '1714', { houseId: 'house-gwyvern' }),
    spouse('cenawen-crefyddol', 'Cenawen Crefyddol', 'female', '1657', '1705', { houseId: 'house-crefyddol' }),
    spouse('emer-choinnich', 'Emer Choinnich', 'male', '1650', '1711', { houseId: 'house-choinnich' }),
    spouse('muireann-airt', 'Muireann Airt', 'female', '1654', '1711', { houseId: 'house-airt' }),

    person('garith-dyngwn', 'Garith Dyngwn', 'male', '1672', '', {
      title: 'Erbfolge des Hauses Dyngwn',
      lineageRole: 'mainline'
    }),
    awayWoman('morwen-dyngwn', 'Morwen Dyngwn', '1670', '', 'Haus Gwefrydd'),
    awayWoman('brangwen-dyngwn', 'Brangwen Dyngwn', '1679', '1720', 'Haus Gwarchod'),
    person('dafydd-dyngwn', 'Dafydd Dyngwn', 'male', '1670', ''),
    awayWoman('endelyn-dyngwn', 'Endelyn Dyngwn', '1675', '', 'Haus Baedd'),
    person('gethin-dyngwn', 'Gethin Dyngwn', 'male', '1673', ''),
    awayWoman('jeanae-dyngwn', 'Jeanae Dyngwn', '1673', '', 'Haus Tir Addawol'),
    person('grugyn-dyngwn', 'Grugyn Dyngwn', 'male', '1673', ''),
    awayWoman('bethania-dyngwn', 'Bethania Dyngwn', '1674', '', 'Haus Penderyn'),
    spouse('stennis-gwefrydd', 'Stennis Gwefrydd', 'male', '1667', '', { houseId: 'house-gwefrydd' }),
    spouse('revelyn-dienyddiwr', 'Revelyn Dienyddiwr', 'female', '1673', '', { houseId: 'house-dienyddiwr' }),
    spouse('gwernwy-gwarchod', 'Gwernwy Gwarchod', 'male', '1674', '1720', { houseId: 'house-gwarchod' }),
    spouse('gwenllian-marwolaeth', 'Gwenllian Marwolaeth', 'female', '1673', '', { houseId: 'house-marwolaeth' }),
    spouse('idwal-baedd', 'Idwal Baedd', 'male', '1673', '', { houseId: 'house-baedd' }),
    spouse('gwenllian-creyr', 'Gwenllian Créyr', 'female', '1674', '', { houseId: 'house-creyr' }),
    spouse('hael-tir-addawol', 'Hael Tir Addawol', 'male', '1672', '', { houseId: 'house-tir-addawol' }),
    spouse('dilys-ceirwyn', 'Dilys Ceirwyn', 'female', '1673', '', { houseId: 'house-ceirwyn' }),
    spouse('talfryn-penderyn', 'Talfryn Penderyn', 'male', '1670', '', { houseId: 'house-penderyn' }),

    person('derwyn-dyngwn', 'Derwyn Dyngwn', 'male', '1694', '', {
      title: 'Erbfolge des Hauses Dyngwn',
      lineageRole: 'mainline'
    }),
    awayWoman('eirlys-dyngwn', 'Eirlys Dyngwn', '1694', '', 'Haus Wylan'),
    person('kynwas-1694-dyngwn', 'Kynwas Dyngwn', 'male', '1694', ''),
    awayWoman('dolena-dyngwn', 'Dolena Dyngwn', '1697', '', 'Haus Blach'),
    person('delvin-dyngwn', 'Delvin Dyngwn', 'male', '1699', ''),
    person('dillan-dyngwn', 'Dillan Dyngwn', 'male', '1696', ''),
    awayWoman('ystafel-dyngwn', 'Ystafel Dyngwn', '1700', '', 'Haus Tiwna'),
    person('dean-dyngwn', 'Dean Dyngwn', 'male', '1700', ''),
    awayWoman('hafwen-dwyngwn', 'Hafwen Dyngwn', '1703', '', 'Haus Pysgod'),
    awayWoman('dyddi-dyngwn', 'Dyddi Dyngwn', '1704', '', 'Haus Arwydd'),
    spouse('lynfa-1696-arth', 'Lynfa Arth', 'female', '1696', '', { houseId: 'house-arth' }),
    spouse('liam-wylan', 'Liam Wylan', 'male', '1696', '', { houseId: 'house-wylan' }),
    spouse('gulda-nachtjaeger', 'Gulda Nachtjäger', 'female', '1697', '', { houseId: 'house-nachtjaeger' }),
    spouse('meurig-blach', 'Meurig Blach', 'male', '1695', '', { houseId: 'house-blach' }),
    spouse('ysabeth-dienyddiwr', 'Ysabeth Dienyddiwr', 'female', '1703', '', { houseId: 'house-dienyddiwr' }),
    spouse('hafren-saethwyr', 'Hafren Saethwyr', 'female', '1700', '', { houseId: 'house-saethwyr' }),
    spouse('aeddan-tiwna', 'Aeddan Tiwna', 'male', '1695', '', { houseId: 'house-tiwna' }),
    spouse('meriel-wyrm', 'Meriel Wyrm', 'female', '1701', '', { houseId: 'house-wyrm' }),
    spouse('meilyr-pysgod', 'Meilyr Pysgod', 'male', '1700', '', { houseId: 'house-pysgod' }),
    spouse('iorwerth-arwydd', 'Iorwerth Arwydd', 'male', '1704', '', { houseId: 'house-arwydd' }),

    person('hael-1722-dyngwn', 'Hael Dyngwn', 'male', '1722', '', {
      title: 'Jüngster belegter Erbe des Hauses Dyngwn',
      lineageRole: 'mainline'
    }),
    person('meleri-dyngwn', 'Meleri Dyngwn', 'female', '1724', ''),
    person('iud-dyngwn', 'Iud Dyngwn', 'male', '1722', ''),
    person('tydfil-dyngwn', 'Tydfil Dyngwn', 'female', '1724', ''),
    person('gwern-dyngwn', 'Gwern Dyngwn', 'male', '1726', ''),
    person('robyn-dyngwn', 'Robyn Dyngwn', 'male', '1722', ''),
    person('lyanna-dyngwn', 'Lyanna Dyngwn', 'female', '1725', ''),
    person('rhon-dyngwn', 'Rhon Dyngwn', 'male', '1729', ''),
    person('loyde-dyngwn', 'Loyde Dyngwn', 'male', '1723', ''),
    person('dyddgu-dyngwn', 'Dyddgu Dyngwn', 'female', '1726', ''),
    person('oth-dyngwn', 'Oth Dyngwn', 'male', '1725', ''),
    person('gwerful-dyngwn', 'Gwerful Dyngwn', 'female', '1727', '')
  ],
  partnerships: [
    createMarriage('marriage-kynwas-niam-dyngwn', ...COUPLES.kynwas),
    createMarriage('marriage-goronwy-saoirse-dyngwn', ...COUPLES.goronwy),
    createMarriage('marriage-melwas-rhonwen', ...COUPLES.rhonwen),
    createMarriage('marriage-arianell-cadogan-dienyddiwr', ...COUPLES.cadogan),
    createMarriage('marriage-myfanwy-gorn-dyngwn', ...COUPLES.myfanwy),
    createMarriage('marriage-arthur-irgraine-dyngwn', ...COUPLES.arthur),
    createMarriage('marriage-cadfael-sioned', ...COUPLES.sioned),
    createMarriage('marriage-aoirghe-morgan', ...COUPLES.morganAoirghe),
    createMarriage('marriage-rhonwen-morgan-grael', ...COUPLES.morganRhonwen, { status: 'widowed' }),
    createMarriage('marriage-aeronwy-murvin-dyngwn', ...COUPLES.aeronwy, { status: 'ended', end: '1682' }),
    createMarriage('marriage-rhondia-merlion-dyngwn', ...COUPLES.rhondia),
    createMarriage('marriage-gwennoeth-dewey-ceirwyn', ...COUPLES.dewey, { status: 'widowed', end: '1700' }),
    createMarriage('marriage-derwen-gwrtheyrn-dyngwn', ...COUPLES.derwen),
    createMarriage('marriage-gallgoid-dylis', ...COUPLES.dylis),
    createMarriage('marriage-gwenhwyfar-dewyll', ...COUPLES.dewyll),
    createMarriage('marriage-deliah-collen-dyngwn', ...COUPLES.deliah),
    createMarriage('marriage-dilwyn-aoibheann-dyngwn', ...COUPLES.dilwyn),
    createMarriage('marriage-delwen-ninian-dyngwn', ...COUPLES.delwen),
    createMarriage('marriage-dadweir-aingeal-dyngwn', ...COUPLES.dadweir),
    createMarriage('marriage-gwlgawd-arddunwen-dyngwn', ...COUPLES.gwlgawd),
    createMarriage('marriage-caradwyn-gwynham-dyngwn', ...COUPLES.caradwyn),
    createMarriage('marriage-glewlwyd-fidelma-dyngwn', ...COUPLES.glewlwyd),
    createMarriage('marriage-eira-rhynnon-dyngwn', ...COUPLES.eira),
    createMarriage('marriage-seithved-enola', ...COUPLES.enola),
    createMarriage('marriage-glendower-cenawen-dyngwn', ...COUPLES.glendower),
    createMarriage('marriage-morwenna-emer-dyngwn', ...COUPLES.morwenna),
    createMarriage('marriage-gwynnan-muireann-dyngwn', ...COUPLES.gwynnan),
    createMarriage('marriage-revelyn-garith-dienyddiwr', ...COUPLES.garith),
    createMarriage('marriage-morwen-stennis-dyngwn', ...COUPLES.morwen),
    createMarriage('marriage-brangwen-gwernwy-dyngwn', ...COUPLES.brangwen),
    createMarriage('marriage-dafydd-gwenllian-dyngwn', ...COUPLES.dafydd),
    createMarriage('marriage-endelyn-idwal-dyngwn', ...COUPLES.endelyn),
    createMarriage('marriage-gethin-gwenllian-dyngwn', ...COUPLES.gethin),
    createMarriage('marriage-jeanae-hael-dyngwn', ...COUPLES.jeanae),
    createMarriage('marriage-dilys-grugyn-ceirwyn', ...COUPLES.grugyn),
    createMarriage('marriage-talfryn-bethania-penderyn', ...COUPLES.bethania),
    createMarriage('marriage-lynfa-derwyn', ...COUPLES.derwyn),
    createMarriage('marriage-liam-eirlys', ...COUPLES.eirlys),
    createMarriage('marriage-kynwas-gulda-dyngwn', ...COUPLES.kynwas1694),
    createMarriage('marriage-dolena-meurig-dyngwn', ...COUPLES.dolena),
    createMarriage('marriage-ysabeth-delvin-dienyddiwr', ...COUPLES.delvin),
    createMarriage('marriage-hafren-dillan', ...COUPLES.dillan),
    createMarriage('marriage-ystafel-aeddan-dyngwn', ...COUPLES.ystafel),
    createMarriage('marriage-meriel-dean', ...COUPLES.dean),
    createMarriage('marriage-meilyr-hafwen', ...COUPLES.hafwen),
    createMarriage('marriage-iorwerth-dyddi', ...COUPLES.dyddi)
  ],
  parentages: [
    ...childrenOf(['goronwy-dyngwn', 'rhonwen-dyngwn'], 'marriage-kynwas-niam-dyngwn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und Goronwys Generation sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-kynwas-to-goronwy-generation-dyngwn' }
    }),
    ...childrenOf(['cadogan-dyngwn', 'myfanwy-dyngwn', 'arthur-dyngwn'], 'marriage-goronwy-saoirse-dyngwn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen Goronwy/Saoirse und Cadogans Generation sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-goronwy-to-cadogan-generation-dyngwn' }
    }),
    ...childrenOf(['sioned-dyngwn', 'morgan-dyngwn', 'aeronwy-dyngwn'], 'marriage-arianell-cadogan-dienyddiwr'),
    ...childrenOf(['rhondia-dyngwn'], 'marriage-arthur-irgraine-dyngwn'),
    ...childrenOf(['dewey-dyngwn', 'derwen-dyngwn', 'dylis-dyngwn', 'dewyll-dyngwn'], 'marriage-aoirghe-morgan'),
    ...childrenOf(['deliah-dyngwn', 'dilwyn-dyngwn', 'delwen-dyngwn', 'dadweir-dyngwn'], 'marriage-rhonwen-morgan-grael'),
    ...childrenOf(['gwlgawd-dyngwn', 'caradwyn-dyngwn'], 'marriage-gwennoeth-dewey-ceirwyn'),
    ...childrenOf(['glewlwyd-dyngwn', 'eira-dyngwn'], 'marriage-gwenhwyfar-dewyll'),
    ...childrenOf(['enola-dyngwn', 'glendower-dyngwn'], 'marriage-dilwyn-aoibheann-dyngwn'),
    ...childrenOf(['morwenna-dyngwn', 'gwynnan-dyngwn'], 'marriage-dadweir-aingeal-dyngwn'),
    ...childrenOf(['garith-dyngwn', 'morwen-dyngwn'], 'marriage-gwlgawd-arddunwen-dyngwn'),
    ...childrenOf(['brangwen-dyngwn', 'dafydd-dyngwn', 'endelyn-dyngwn'], 'marriage-glewlwyd-fidelma-dyngwn'),
    ...childrenOf(['gethin-dyngwn', 'jeanae-dyngwn'], 'marriage-glendower-cenawen-dyngwn'),
    ...childrenOf(['grugyn-dyngwn', 'bethania-dyngwn'], 'marriage-gwynnan-muireann-dyngwn'),
    ...childrenOf(['derwyn-dyngwn', 'eirlys-dyngwn'], 'marriage-revelyn-garith-dienyddiwr'),
    ...childrenOf(['kynwas-1694-dyngwn', 'dolena-dyngwn', 'delvin-dyngwn'], 'marriage-dafydd-gwenllian-dyngwn'),
    ...childrenOf(['dillan-dyngwn', 'ystafel-dyngwn', 'dean-dyngwn'], 'marriage-gethin-gwenllian-dyngwn'),
    ...childrenOf(['hafwen-dwyngwn', 'dyddi-dyngwn'], 'marriage-dilys-grugyn-ceirwyn'),
    ...childrenOf(['hael-1722-dyngwn', 'meleri-dyngwn'], 'marriage-lynfa-derwyn'),
    ...childrenOf(['iud-dyngwn', 'tydfil-dyngwn', 'gwern-dyngwn'], 'marriage-kynwas-gulda-dyngwn'),
    ...childrenOf(['robyn-dyngwn', 'lyanna-dyngwn', 'rhon-dyngwn'], 'marriage-ysabeth-delvin-dienyddiwr'),
    ...childrenOf(['loyde-dyngwn', 'dyddgu-dyngwn'], 'marriage-hafren-dillan'),
    ...childrenOf(['oth-dyngwn', 'gwerful-dyngwn'], 'marriage-meriel-dean')
  ],
  cadetBranches: [
    marriedAway('married-away-rhonwen-dyngwn-pendrag', 'Haus Pendrag', 'marriage-melwas-rhonwen', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-myfanwy-dyngwn-gallchobhair', 'Clan Gallchobhair', 'marriage-myfanwy-gorn-dyngwn', 'house-gallchobhair', HOUSE_EMBLEMS.gallchobhair),
    marriedAway('married-away-sioned-dyngwn-draig', 'Haus Draig', 'marriage-cadfael-sioned', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-aeronwy-dyngwn-morfil', 'Haus Morfil', 'marriage-aeronwy-murvin-dyngwn', 'house-morfil'),
    marriedAway('married-away-rhondia-dyngwn-morthwyll', 'Haus Morthwyll', 'marriage-rhondia-merlion-dyngwn', 'house-morthwyll'),
    marriedAway('married-away-derwen-dyngwn-dinefwr', 'Haus Dinefwr', 'marriage-derwen-gwrtheyrn-dyngwn', 'house-dinefwr'),
    marriedAway('married-away-dylis-dyngwn-wyrm', 'Haus Wyrm', 'marriage-gallgoid-dylis', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-deliah-dyngwn-hwyaden', 'Haus Hwyaden', 'marriage-deliah-collen-dyngwn', 'house-hwyaden'),
    marriedAway('married-away-delwen-dyngwn-marwolaeth', 'Haus Marwolaeth', 'marriage-delwen-ninian-dyngwn', 'house-marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    marriedAway('married-away-caradwyn-dyngwn-mwyalchen', 'Haus Mwyalchen', 'marriage-caradwyn-gwynham-dyngwn', 'house-mwyalchen'),
    marriedAway('married-away-eira-dyngwn-llwynog', 'Haus Llwynog', 'marriage-eira-rhynnon-dyngwn', 'house-llwynog'),
    marriedAway('married-away-enola-dyngwn-gwyvern', 'Haus Gwyvern', 'marriage-seithved-enola', 'house-gwyvern', HOUSE_EMBLEMS.gwyvern),
    marriedAway('married-away-morwenna-dyngwn-choinnich', 'Haus Choinnich', 'marriage-morwenna-emer-dyngwn', 'house-choinnich'),
    marriedAway('married-away-morwen-dyngwn-gwefrydd', 'Haus Gwefrydd', 'marriage-morwen-stennis-dyngwn', 'house-gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    marriedAway('married-away-brangwen-dyngwn-gwarchod', 'Haus Gwarchod', 'marriage-brangwen-gwernwy-dyngwn', 'house-gwarchod'),
    marriedAway('married-away-endelyn-dyngwn-baedd', 'Haus Baedd', 'marriage-endelyn-idwal-dyngwn', 'house-baedd'),
    marriedAway('married-away-jeanae-dyngwn-tir-addawol', 'Haus Tir Addawol', 'marriage-jeanae-hael-dyngwn', 'house-tir-addawol'),
    marriedAway('married-away-bethania-dyngwn-penderyn', 'Haus Penderyn', 'marriage-talfryn-bethania-penderyn', 'house-penderyn', HOUSE_EMBLEMS.penderyn),
    marriedAway('married-away-eirlys-dyngwn-wylan', 'Haus Wylan', 'marriage-liam-eirlys', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-dolena-dyngwn-blach', 'Haus Blach', 'marriage-dolena-meurig-dyngwn', 'house-blach'),
    marriedAway('married-away-ystafel-dyngwn-tiwna', 'Haus Tiwna', 'marriage-ystafel-aeddan-dyngwn', 'house-tiwna'),
    marriedAway('married-away-hafwen-dyngwn-pysgod', 'Haus Pysgod', 'marriage-meilyr-hafwen', 'house-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-dyddi-dyngwn-arwydd', 'Haus Arwydd', 'marriage-iorwerth-dyddi', 'house-arwydd', HOUSE_EMBLEMS.arwydd)
  ],
  timeJumps: [
    {
      id: 'gap-kynwas-to-goronwy-generation-dyngwn',
      parentPartnershipId: 'marriage-kynwas-niam-dyngwn',
      parentPersonId: '',
      childIds: ['goronwy-dyngwn', 'rhonwen-dyngwn'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Erster absoluter Generationentrenner nach dem Gründerpaar und dem Stammwappen.',
      extensions: {}
    },
    {
      id: 'gap-goronwy-to-cadogan-generation-dyngwn',
      parentPartnershipId: 'marriage-goronwy-saoirse-dyngwn',
      parentPersonId: '',
      childIds: ['cadogan-dyngwn', 'myfanwy-dyngwn', 'arthur-dyngwn'],
      years: 0,
      fromYear: '????',
      toYear: '1564',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absoluter Generationentrenner ausschließlich nach Goronwy und Saoirse; er steht nicht parallel zum ersten Zeitsprung.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-kynwas-niam-dyngwn',
    houseId: DYNGWN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Mathragon · Meister des Schwertes',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'kynwas-schwertarm-dyngwn',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 4,
    sourceModule: "Haus Dyngwn O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Hausgeschichte, Ritterfürsten- und Erbfolge sowie Portraitzuordnungen folgen der bereitgestellten Dyngwn-Hausseite und ihrer eingebetteten Stammbaumgrafik. Kynwas Schwertarm und Niam Fiachraoin bilden das Gründerpaar. Die beiden Punkttrenner der Grafik werden als strikt serielle Zeitsprünge geführt: der erste nach dem Stammwappen zu Goronwy/Rhonwen, der zweite ausschließlich unter Goronwy/Saoirse zu Cadogan, Myfanwy und Arthur. Morgan heiratet nacheinander Aoirghe Neidr und Rhonwen Grael; nur die jeweils belegten Kinder werden dem richtigen Paar zugeordnet. Die Erbfolge verläuft über Gwlgawd, Garith, Derwyn und Hael. Dreiundzwanzig verheiratete Dyngwn-Frauen ohne fortgeführten Dyngwn-Zweig besitzen direkte Zielhausknoten. Kinder aus den Zielhäusern werden nicht parallel in dieser Akte kopiert. Gemeinsame Personen und Ehen mit Pendrag, Dienyddiwr, Draig, Neidr, Grael, Ceirwyn, Wyrm, Gwefrydd, Gwyvern, Penderyn, Arth, Wylan, Saethwyr, Pysgod und Arwydd behalten ihre vorhandenen Weltpersonen- und Partnerschafts-IDs; die ältere technische ID hafwen-dwyngwn bleibt aus Stabilitätsgründen erhalten, während der sichtbare Hausname kanonisch Dyngwn lautet. Ninians in seiner Marwolaeth-Heimatakte belegtes Todesjahr 1709 ersetzt die ältere Gegenaktenangabe 1702. Wiederholte generische Silhouetten wurden nicht als individuelle Portraits importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
