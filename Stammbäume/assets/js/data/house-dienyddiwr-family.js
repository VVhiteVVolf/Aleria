import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_DIENYDDIWR_PORTRAITS } from './house-dienyddiwr-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const DIENYDDIWR_HOUSE_ID = 'house-dienyddiwr';
const DIENYDDIWR_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr;

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  ceirwyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.ceirwyn,
  dienyddiwr: DIENYDDIWR_EMBLEM,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  grawn: 'assets/images/houses/Ährental/haus-grawn.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  marwolaeth: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
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
    houseId: options.houseId === undefined ? DIENYDDIWR_HOUSE_ID : options.houseId,
    portrait: HOUSE_DIENYDDIWR_PORTRAITS[id] || '',
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

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  taredd: ['taredd-dienyddiwr', 'irmgard-dienyddiwr-founder-spouse'],
  trayvon: ['trayvon-dienyddiwr', 'gwenola-marwolaeth'],
  arianell: ['arianell-dienyddiwr', 'cadogan-dyngwn'],
  gruffydd: ['gruffydd-dienyddiwr', 'saoirse-birn'],
  evaine: ['evaine-dienyddiwr', 'michan-ness'],
  rhianedd: ['dyngannon-arth', 'rhianedd-dienyddiwr'],
  gwennan: ['gwennan-dienyddiwr', 'sioned-dienyddiwr-spouse'],
  anarawd: ['anarawd-dienyddiwr', 'blodeuwedd-baedd'],
  hefin: ['tor-pendrag', 'hefin-dieniddiwr'],
  gwendolen: ['gwendolen-dienyddiwr', 'ulysses-pyrth'],
  brannock: ['brannock-dienyddiwr', 'linette-selwyn'],
  mervyn: ['evaine-wylan', 'mervyn-dienyddiwr'],
  rhondda: ['brannoc-illewod', 'rhondda-dieniddiwr'],
  delwen: ['delwen-dienyddiwr', 'wynndie-gaeth'],
  gwyneira: ['gwyneira-dienyddiwr', 'hwywell-crefyddol'],
  uther: ['uther-dienyddiwr', 'magwena-sgwarnog'],
  robyert: ['arianwyn-grawn', 'robyert-dienyddiwr'],
  revelyn: ['revelyn-dienyddiwr', 'garith-dyngwn'],
  quendolin: ['quendolin-dienyddiwr', 'dylan-blach'],
  gwynfor: ['gwynfor-dienyddiwr', 'cici-tiwna'],
  nolwen: ['osian-penderyn', 'nolwen-dienyddiwr'],
  robyn: ['rhyannon-ceirwyn', 'robyn-dienyddiwr'],
  gwen: ['gwen-dienyddiwr', 'neirin-hwyaden'],
  idris: ['sabria-penderyn', 'idris-dienyddiwr'],
  rhys: ['rhys-dienyddiwr', 'siobhan-muileach'],
  dirmyg: ['dirmyg-dienyddiwr', 'gwen-gwarchod'],
  enfys: ['colwynn-aderyn', 'enfys-dienyddiwr'],
  ysabeth: ['ysabeth-dienyddiwr', 'delvin-dyngwn']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-taredd-irmgard-dienyddiwr': COUPLES.taredd,
  'marriage-trayvon-gwenola-dienyddiwr': COUPLES.trayvon,
  'marriage-gruffydd-saoirse-dienyddiwr': COUPLES.gruffydd,
  'marriage-gwennan-sioned-dienyddiwr': COUPLES.gwennan,
  'marriage-anarawd-blodeuwedd-dienyddiwr': COUPLES.anarawd,
  'marriage-brannock-linette-dienyddiwr': COUPLES.brannock,
  'marriage-evaine-mervyn': COUPLES.mervyn,
  'marriage-delwen-wynndie-dienyddiwr': COUPLES.delwen,
  'marriage-uther-magwena-dienyddiwr': COUPLES.uther,
  'marriage-arianwyn-robyert': COUPLES.robyert,
  'marriage-gwynfor-cici-dienyddiwr': COUPLES.gwynfor,
  'marriage-rhyannon-robyn-ceirwyn': COUPLES.robyn,
  'marriage-sabria-idris-dienyddiwr': COUPLES.idris,
  'marriage-rhys-siobhan-dienyddiwr': COUPLES.rhys,
  'marriage-dirmyg-gwen-dienyddiwr': COUPLES.dirmyg
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'dienyddiwr-parentage', ...options }
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

export const HOUSE_DIENYDDIWR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dienyddiwr',
    title: "Haus Dienyddiwr O'Mathragon",
    motto: '',
    description: 'Ritterfürstenhaus aus Mathragon, dessen gekreuzte Äxte an den Gründer Taredd, seine unkonventionelle Waffe und sein Opfer für den cenyrischen Kronprinzen erinnern.',
    emblem: DIENYDDIWR_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.dienyddiwr
  },
  houses: [
    house(DIENYDDIWR_HOUSE_ID, "Haus Dienyddiwr O'Mathragon", DIENYDDIWR_EMBLEM),
    house('house-marwolaeth', 'Haus Marwolaeth', HOUSE_EMBLEMS.marwolaeth),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-birn', 'Haus Birn'),
    house('house-ness', 'Haus Ness'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-baedd', 'Haus Baedd'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-pyrth', 'Haus Pyrth'),
    house('house-selwyn', 'Haus Selwyn'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-gaeth', 'Haus Gaeth'),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-sgwarnog', 'Haus Sgwarnog'),
    house('house-grawn', 'Haus Grawn', HOUSE_EMBLEMS.grawn),
    house('house-blach', 'Haus Blach'),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-penderyn', 'Haus Penderyn', HOUSE_EMBLEMS.penderyn),
    house('house-ceirwyn', 'Haus Ceirwyn', HOUSE_EMBLEMS.ceirwyn),
    house('house-hwyaden', 'Haus Hwyaden'),
    house('house-muileach', 'Haus Muileach'),
    house('house-gwarchod', 'Haus Gwarchod'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn)
  ],
  persons: [
    person('taredd-dienyddiwr', 'Taredd Dienyddiwr', 'male', '????', '????', {
      title: 'Gründer und erster Ritterfürst des Hauses Dienyddiwr',
      lineageRole: 'head',
      notes: 'Als in Aldrimar erzogener Mündel führte Taredd die Axt als Familienwaffe ein und opferte beim Schutz des cenyrischen Kronprinzen seinen rechten Arm.'
    }),
    spouse('irmgard-dienyddiwr-founder-spouse', 'Irmgard', 'female', '????', '????', {
      title: 'Aldrimerische Mitgründerin des Hauses',
      notes: 'Die blauen Augen späterer Dienyddiwr werden in der Hausüberlieferung auf Irmgard zurückgeführt.'
    }),

    person('trayvon-dienyddiwr', 'Trayvon Dienyddiwr', 'male', '1576', '1640', {
      title: 'Ritterfürst des Hauses Dienyddiwr bis 1640',
      lineageRole: 'head'
    }),
    person('arianell-dienyddiwr', 'Arianell Dienyddiwr', 'female', '1570', '1646', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    spouse('gwenola-marwolaeth', 'Gwenola Marwolaeth', 'female', '1582', '1681', {
      houseId: 'house-marwolaeth'
    }),
    spouse('cadogan-dyngwn', 'Cadogan Dyngwn', 'male', '1564', '1653', {
      houseId: 'house-dyngwn'
    }),

    person('gruffydd-dienyddiwr', 'Gruffydd Dienyddiwr', 'male', '1602', '1675', {
      title: 'Ritterfürst des Hauses Dienyddiwr von 1640 bis 1675',
      lineageRole: 'head'
    }),
    person('evaine-dienyddiwr', 'Evaine Dienyddiwr', 'female', '1611', '1673', {
      title: 'Wegverheiratet an Haus Ness',
      tags: ['Wegverheiratet']
    }),
    person('rhianedd-dienyddiwr', 'Rhianedd Dienyddiwr', 'female', '1621', '1669', {
      title: 'Wegverheiratet an Haus Arth',
      tags: ['Wegverheiratet']
    }),
    person('gwennan-dienyddiwr', 'Gwennan Dienyddiwr', 'male', '1617', '1674'),
    spouse('saoirse-birn', 'Saoirse Birn', 'female', '1603', '1671', {
      houseId: 'house-birn'
    }),
    spouse('michan-ness', 'Michan Ness', 'male', '1610', '1681', {
      houseId: 'house-ness'
    }),
    spouse('dyngannon-arth', 'Dyngannon Arth', 'male', '1620', '1670', {
      houseId: 'house-arth'
    }),
    spouse('sioned-dienyddiwr-spouse', 'Sioned', 'female', '1617', '1691'),

    person('anarawd-dienyddiwr', 'Anarawd Dienyddiwr', 'male', '1626', '1693', {
      title: 'Ritterfürst des Hauses Dienyddiwr von 1675 bis 1693',
      lineageRole: 'head'
    }),
    person('hefin-dieniddiwr', 'Hefin Dienyddiwr', 'female', '1632', '1700', {
      title: 'Wegverheiratet an Haus Pendrag',
      tags: ['Wegverheiratet']
    }),
    person('gwendolen-dienyddiwr', 'Gwendolen Dienyddiwr', 'female', '1627', '1662', {
      title: 'Wegverheiratet an Haus Pyrth',
      tags: ['Wegverheiratet']
    }),
    person('brannock-dienyddiwr', 'Brannock Dienyddiwr', 'male', '1633', '1704'),
    spouse('blodeuwedd-baedd', 'Blodeuwedd Baedd', 'female', '1628', '1692', {
      houseId: 'house-baedd'
    }),
    spouse('tor-pendrag', 'Tor Pendrag', 'male', '1632', '1701', {
      houseId: 'house-pendrag'
    }),
    spouse('ulysses-pyrth', 'Ulysses Pyrth', 'male', '1626', '1697', {
      houseId: 'house-pyrth'
    }),
    spouse('linette-selwyn', 'Linette Selwyn', 'female', '1632', '1700', {
      houseId: 'house-selwyn'
    }),

    person('mervyn-dienyddiwr', 'Mervyn Dienyddiwr', 'male', '1659', '1713', {
      title: 'Ritterfürst des Hauses Dienyddiwr von 1693 bis 1713',
      lineageRole: 'head'
    }),
    person('rhondda-dieniddiwr', 'Rhondda Dienyddiwr', 'female', '1655', '1715', {
      title: 'Wegverheiratet an Haus Illewod',
      tags: ['Wegverheiratet']
    }),
    person('delwen-dienyddiwr', 'Delwen Dienyddiwr', 'male', '1651', '1717'),
    person('gwyneira-dienyddiwr', 'Gwyneira Dienyddiwr', 'female', '1657', '1680', {
      title: 'Wegverheiratet an Haus Crefyddol',
      tags: ['Wegverheiratet']
    }),
    person('uther-dienyddiwr', 'Uther Dienyddiwr', 'male', '1650', '1712'),
    spouse('evaine-wylan', 'Evaine Wylan', 'female', '1662', '1707', {
      houseId: 'house-wylan'
    }),
    spouse('brannoc-illewod', 'Brannoc Illewod', 'male', '1652', '1720', {
      houseId: 'house-illewod'
    }),
    spouse('wynndie-gaeth', 'Wynndie Gaeth', 'female', '1653', '1682', {
      houseId: 'house-gaeth'
    }),
    spouse('hwywell-crefyddol', 'Hwywell Crefyddol', 'male', '1656', '1720', {
      houseId: 'house-crefyddol'
    }),
    spouse('magwena-sgwarnog', 'Magwena Sgwarnog', 'female', '1650', '1694', {
      houseId: 'house-sgwarnog'
    }),

    person('robyert-dienyddiwr', 'Robyert Dienyddiwr', 'male', '1670', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Dienyddiwr seit 1713',
      lineageRole: 'head'
    }),
    person('revelyn-dienyddiwr', 'Revelyn Dienyddiwr', 'female', '1673', '', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    person('quendolin-dienyddiwr', 'Quendolin Dienyddiwr', 'female', '1676', '', {
      title: 'Wegverheiratet an Haus Blach',
      tags: ['Wegverheiratet']
    }),
    person('gwynfor-dienyddiwr', 'Gwynfor Dienyddiwr', 'male', '1674', ''),
    person('nolwen-dienyddiwr', 'Nolwen Dienyddiwr', 'female', '1677', '', {
      title: 'Wegverheiratet an Haus Penderyn',
      tags: ['Wegverheiratet']
    }),
    spouse('arianwyn-grawn', 'Arianwyn Grawn', 'female', '1670', '', {
      houseId: 'house-grawn'
    }),
    spouse('garith-dyngwn', 'Garith Dyngwn', 'male', '1672', '', {
      houseId: 'house-dyngwn'
    }),
    spouse('dylan-blach', 'Dylan Blach', 'male', '1673', '', {
      houseId: 'house-blach'
    }),
    spouse('cici-tiwna', 'Cici Tiwna', 'female', '1672', '1720', {
      houseId: 'house-tiwna'
    }),
    spouse('osian-penderyn', 'Osian Penderyn', 'male', '1675', '', {
      houseId: 'house-penderyn'
    }),

    person('robyn-dienyddiwr', 'Robyn Dienyddiwr', 'male', '1694', '', {
      title: 'Erster Erbe des Hauses Dienyddiwr',
      lineageRole: 'mainline'
    }),
    person('gwen-dienyddiwr', 'Gwen Dienyddiwr', 'female', '1699', '', {
      title: 'Wegverheiratet an Haus Hwyaden',
      tags: ['Wegverheiratet']
    }),
    person('idris-dienyddiwr', 'Idris Dienyddiwr', 'male', '1696', ''),
    person('rhys-dienyddiwr', 'Rhys Dienyddiwr', 'male', '1701', ''),
    person('dirmyg-dienyddiwr', 'Dirmyg Dienyddiwr', 'male', '1700', ''),
    person('enfys-dienyddiwr', 'Enfys Dienyddiwr', 'female', '1703', '', {
      title: 'Wegverheiratet an Haus Aderyn',
      tags: ['Wegverheiratet']
    }),
    person('ysabeth-dienyddiwr', 'Ysabeth Dienyddiwr', 'female', '1703', '', {
      title: 'Wegverheiratet an Haus Dyngwn',
      tags: ['Wegverheiratet']
    }),
    spouse('rhyannon-ceirwyn', 'Rhyannon Ceirwyn', 'female', '1699', '', {
      houseId: 'house-ceirwyn'
    }),
    spouse('neirin-hwyaden', 'Neirin Hwyaden', 'male', '1695', '', {
      houseId: 'house-hwyaden'
    }),
    spouse('sabria-penderyn', 'Sabria Penderyn', 'female', '1696', '', {
      houseId: 'house-penderyn'
    }),
    spouse('siobhan-muileach', 'Siobhan Muileach', 'female', '1703', '', {
      houseId: 'house-muileach'
    }),
    spouse('gwen-gwarchod', 'Gwen Gwarchod', 'female', '1699', '', {
      houseId: 'house-gwarchod'
    }),
    spouse('colwynn-aderyn', 'Colwynn Aderyn', 'male', '1700', '', {
      houseId: 'house-aderyn'
    }),
    spouse('delvin-dyngwn', 'Delvin Dyngwn', 'male', '1699', '', {
      houseId: 'house-dyngwn'
    }),

    person('arawn-dienyddiwr', 'Arawn Dienyddiwr', 'male', '1720', '', {
      title: 'Zweiter Erbe des Hauses Dienyddiwr',
      lineageRole: 'mainline'
    }),
    person('siwan-dienyddiwr', 'Siwan Dienyddiwr', 'female', '1723', ''),
    person('steffan-dienyddiwr', 'Steffan Dienyddiwr', 'male', '1722', ''),
    person('blawd-dienyddiwr', 'Blawd Dienyddiwr', 'female', '1724', ''),
    person('tomi-dienyddiwr', 'Tomi Dienyddiwr', 'male', '1721', ''),
    person('soffi-dienyddiwr', 'Soffi Dienyddiwr', 'female', '1723', ''),
    person('tirian-dienyddiwr', 'Tirian Dienyddiwr', 'male', '1723', ''),
    person('frewi-dienyddiwr', 'Frewi Dienyddiwr', 'female', '1725', '')
  ],
  partnerships: [
    createMarriage('marriage-taredd-irmgard-dienyddiwr', ...COUPLES.taredd),
    createMarriage('marriage-trayvon-gwenola-dienyddiwr', ...COUPLES.trayvon),
    createMarriage('marriage-arianell-cadogan-dienyddiwr', ...COUPLES.arianell),
    createMarriage('marriage-gruffydd-saoirse-dienyddiwr', ...COUPLES.gruffydd),
    createMarriage('marriage-evaine-michan-dienyddiwr', ...COUPLES.evaine),
    createMarriage('marriage-dyngannon-rhianedd', ...COUPLES.rhianedd),
    createMarriage('marriage-gwennan-sioned-dienyddiwr', ...COUPLES.gwennan),
    createMarriage('marriage-anarawd-blodeuwedd-dienyddiwr', ...COUPLES.anarawd),
    createMarriage('marriage-tor-hefin', ...COUPLES.hefin),
    createMarriage('marriage-gwendolen-ulysses-dienyddiwr', ...COUPLES.gwendolen),
    createMarriage('marriage-brannock-linette-dienyddiwr', ...COUPLES.brannock),
    createMarriage('marriage-evaine-mervyn', ...COUPLES.mervyn),
    createMarriage('marriage-brannoc-rhondda', ...COUPLES.rhondda),
    createMarriage('marriage-delwen-wynndie-dienyddiwr', ...COUPLES.delwen),
    createMarriage('marriage-gwyneira-hwywell-dienyddiwr', ...COUPLES.gwyneira),
    createMarriage('marriage-uther-magwena-dienyddiwr', ...COUPLES.uther),
    createMarriage('marriage-arianwyn-robyert', ...COUPLES.robyert),
    createMarriage('marriage-revelyn-garith-dienyddiwr', ...COUPLES.revelyn),
    createMarriage('marriage-quendolin-dylan-dienyddiwr', ...COUPLES.quendolin),
    createMarriage('marriage-gwynfor-cici-dienyddiwr', ...COUPLES.gwynfor),
    createMarriage('marriage-osian-nolwen-penderyn', ...COUPLES.nolwen),
    createMarriage('marriage-rhyannon-robyn-ceirwyn', ...COUPLES.robyn),
    createMarriage('marriage-gwen-neirin-dienyddiwr', ...COUPLES.gwen),
    createMarriage('marriage-sabria-idris-dienyddiwr', ...COUPLES.idris),
    createMarriage('marriage-rhys-siobhan-dienyddiwr', ...COUPLES.rhys),
    createMarriage('marriage-dirmyg-gwen-dienyddiwr', ...COUPLES.dirmyg),
    createMarriage('marriage-colwynn-enfys', ...COUPLES.enfys),
    createMarriage('marriage-ysabeth-delvin-dienyddiwr', ...COUPLES.ysabeth)
  ],
  parentages: [
    ...childrenOf(['trayvon-dienyddiwr', 'arianell-dienyddiwr'], 'marriage-taredd-irmgard-dienyddiwr', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und Trayvons Generation sind nicht einzeln überlieferte Vorfahren ausgelassen.',
      extensions: { timeJumpId: 'gap-taredd-to-trayvon-generation-dienyddiwr' }
    }),
    ...childrenOf(
      ['gruffydd-dienyddiwr', 'evaine-dienyddiwr', 'rhianedd-dienyddiwr', 'gwennan-dienyddiwr'],
      'marriage-trayvon-gwenola-dienyddiwr'
    ),
    ...childrenOf(
      ['anarawd-dienyddiwr', 'hefin-dieniddiwr', 'gwendolen-dienyddiwr'],
      'marriage-gruffydd-saoirse-dienyddiwr'
    ),
    ...childrenOf(['brannock-dienyddiwr'], 'marriage-gwennan-sioned-dienyddiwr'),
    ...childrenOf(
      ['mervyn-dienyddiwr', 'rhondda-dieniddiwr', 'delwen-dienyddiwr'],
      'marriage-anarawd-blodeuwedd-dienyddiwr'
    ),
    ...childrenOf(['gwyneira-dienyddiwr', 'uther-dienyddiwr'], 'marriage-brannock-linette-dienyddiwr'),
    ...childrenOf(['robyert-dienyddiwr', 'revelyn-dienyddiwr'], 'marriage-evaine-mervyn'),
    ...childrenOf(['quendolin-dienyddiwr', 'gwynfor-dienyddiwr'], 'marriage-delwen-wynndie-dienyddiwr'),
    ...childrenOf(['nolwen-dienyddiwr'], 'marriage-uther-magwena-dienyddiwr'),
    ...childrenOf(
      ['robyn-dienyddiwr', 'gwen-dienyddiwr', 'idris-dienyddiwr', 'rhys-dienyddiwr'],
      'marriage-arianwyn-robyert'
    ),
    ...childrenOf(
      ['dirmyg-dienyddiwr', 'enfys-dienyddiwr', 'ysabeth-dienyddiwr'],
      'marriage-gwynfor-cici-dienyddiwr'
    ),
    ...childrenOf(['arawn-dienyddiwr', 'siwan-dienyddiwr'], 'marriage-rhyannon-robyn-ceirwyn'),
    ...childrenOf(['steffan-dienyddiwr', 'blawd-dienyddiwr'], 'marriage-sabria-idris-dienyddiwr'),
    ...childrenOf(['tomi-dienyddiwr', 'soffi-dienyddiwr'], 'marriage-rhys-siobhan-dienyddiwr'),
    ...childrenOf(['tirian-dienyddiwr', 'frewi-dienyddiwr'], 'marriage-dirmyg-gwen-dienyddiwr')
  ],
  cadetBranches: [
    marriedAway('married-away-arianell-dienyddiwr-dyngwn', 'Haus Dyngwn', 'marriage-arianell-cadogan-dienyddiwr', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-evaine-dienyddiwr-ness', 'Haus Ness', 'marriage-evaine-michan-dienyddiwr', 'house-ness'),
    marriedAway('married-away-rhianedd-dienyddiwr-arth', 'Haus Arth', 'marriage-dyngannon-rhianedd', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-hefin-dienyddiwr-pendrag', 'Haus Pendrag', 'marriage-tor-hefin', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-gwendolen-dienyddiwr-pyrth', 'Haus Pyrth', 'marriage-gwendolen-ulysses-dienyddiwr', 'house-pyrth'),
    marriedAway('married-away-rhondda-dienyddiwr-illewod', 'Haus Illewod', 'marriage-brannoc-rhondda', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-gwyneira-dienyddiwr-crefyddol', 'Haus Crefyddol', 'marriage-gwyneira-hwywell-dienyddiwr', 'house-crefyddol'),
    marriedAway('married-away-revelyn-dienyddiwr-dyngwn', 'Haus Dyngwn', 'marriage-revelyn-garith-dienyddiwr', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn),
    marriedAway('married-away-quendolin-dienyddiwr-blach', 'Haus Blach', 'marriage-quendolin-dylan-dienyddiwr', 'house-blach'),
    marriedAway('married-away-nolwen-dienyddiwr-penderyn', 'Haus Penderyn', 'marriage-osian-nolwen-penderyn', 'house-penderyn', HOUSE_EMBLEMS.penderyn),
    marriedAway('married-away-gwen-dienyddiwr-hwyaden', 'Haus Hwyaden', 'marriage-gwen-neirin-dienyddiwr', 'house-hwyaden'),
    marriedAway('married-away-enfys-dienyddiwr-aderyn', 'Haus Aderyn', 'marriage-colwynn-enfys', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-ysabeth-dienyddiwr-dyngwn', 'Haus Dyngwn', 'marriage-ysabeth-delvin-dienyddiwr', 'house-dyngwn', HOUSE_EMBLEMS.dyngwn)
  ],
  timeJumps: [
    {
      id: 'gap-taredd-to-trayvon-generation-dienyddiwr',
      parentPartnershipId: 'marriage-taredd-irmgard-dienyddiwr',
      parentPersonId: '',
      childIds: ['trayvon-dienyddiwr', 'arianell-dienyddiwr'],
      years: 0,
      fromYear: '????',
      toYear: '1570',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen; sämtliche späteren Linien beginnen ausschließlich unter diesem Knoten.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-taredd-irmgard-dienyddiwr',
    houseId: DIENYDDIWR_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Mathragon · Diener der Krone',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'taredd-dienyddiwr',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Dienyddiwr O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Ehen, Hausgeschichte, Amtsfolge und Porträtzuordnungen folgen der bereitgestellten Dienyddiwr-Hausseite. Taredd und Irmgard bilden das Gründerpaar; der Punkttrenner der Quelle wird als einziger absoluter serieller Zeitsprung nach dem Hauswappen und vor Trayvon/Arianell geführt. Die Ritterfürstenfolge lautet Taredd, Trayvon, Gruffydd, Anarawd, Mervyn und Robyert; Robyn und Arawn bilden die ausdrückliche Erbfolge. Gwennan und Delwen sind anhand ihrer Quellporträts männlich und führen ihre jeweiligen Dienyddiwr-Linien fort. Die dreizehn verheirateten Dienyddiwr-Frauen ohne fortgeführten Dienyddiwr-Zweig besitzen direkte Zielhausknoten. Kinder aus den Zielhäusern Arth, Pendrag, Illewod, Penderyn und Aderyn werden nicht parallel in dieser Akte kopiert. Gemeinsame Personen und Ehen mit Arth, Pendrag, Wylan, Illewod, Grawn, Penderyn, Ceirwyn und Aderyn behalten ihre vorhandenen Weltpersonen- und Partnerschafts-IDs; die älteren Schreib-IDs hefin-dieniddiwr und rhondda-dieniddiwr bleiben aus Stabilitätsgründen erhalten, während der sichtbare Hausname kanonisch Dienyddiwr lautet. Gwenolas in ihrer Marwolaeth-Heimatakte belegtes Todesjahr 1681 ersetzt die bislang offene Gegenaktenangabe. Wiederholte generische Silhouetten werden nicht als individuelle Porträts importiert.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
