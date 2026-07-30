import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from './cenyr-county-house-profiles.js';
import {
  createCadetHouseBranch,
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_PYSGOD_PORTRAITS } from './house-pysgod-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: 'assets/images/houses/Tal der Milane/haus-aderyn.png',
  arth: 'assets/images/houses/Klaueninsel/haus-arth.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  illewod: 'assets/images/houses/Sonnenküste/haus-illewod.png',
  neidr: 'assets/images/houses/Silberinsel/haus-neidr.png',
  pendrag: 'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
  pysgod: 'assets/images/houses/Graue Weite/haus-pysgod.png',
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png'
});

const PYSGOD_HOUSE_ID = 'house-pysgod';

const HOUSE_HEAD_IDS = new Set([
  'gingalain-pysgod',
  'kynwrig-pysgod',
  'caradoc-ancient-pysgod',
  'cynwrig-ancient-pysgod',
  'murvin-pysgod',
  'tyreke-pysgod',
  'gingalain-1572-pysgod',
  'merfin-pysgod',
  'cadwaladr-pysgod',
  'garym-pysgod',
  'bledri-pysgod',
  'griflet-1672-pysgod'
]);

const HEIR_IDS = new Set(['cynfor-pysgod', 'maewyn-pysgod']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = PYSGOD_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_PYSGOD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === PYSGOD_HOUSE_ID ? 'core' : 'married'),
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

function gapChildren(childIds, parentIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, parentIds, partnershipId, {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Quelle markiert zwischen dem Paar und diesen Nachkommen nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
  });
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

const FOUNDER_IDS = ['gingalain-pysgod', 'morgaine-dreigiau'];
const TARANIS_IDS = ['taranis-pysgod', 'jibheann-tonnmharra'];
const KYNWRIG_IDS = ['kynwrig-pysgod', 'uthbhla-brathaireann'];
const PENKAWR_IDS = ['penkawr-pysgod', 'neassa-dornach'];
const TRAYVION_IDS = ['trayvion-pysgod', 'brighde-unknown'];
const CARADOC_ANCIENT_IDS = ['caradoc-ancient-pysgod', 'linessa-wylan'];
const ARANHROD_IDS = ['aranhrod-pysgod', 'hascan-gwialen'];
const CYNWRIG_ANCIENT_IDS = ['cynwrig-ancient-pysgod', 'afanen-arth'];
const CATEGIRN_IDS = ['categirn-pysgod', 'marwine-unknown'];
const MURVIN_IDS = ['murvin-pysgod', 'dearbhla-culloch'];
const TYREKE_IDS = ['tyreke-pysgod', 'gobaith-roich'];
const MORHOLT_IDS = ['morholt-pysgod', 'caitrin-neidr'];
const GINGALAIN_1571_IDS = ['gingalain-1572-pysgod', 'tarwen-pendrag'];
const MERFIN_IDS = ['merfin-pysgod', 'elus-arfordir'];
const ARANRHOD_IDS = ['aranrhod-pysgod', 'traharyan-arth'];
const DIRMYG_IDS = ['dirmyg-pysgod', 'rhianu-draenog'];
const CADWALADR_IDS = ['cadwaladr-pysgod', 'braith-wylan'];
const LLINOS_IDS = ['llinos-pysgod', 'merfyn-draig'];
const LYNFA_IDS = ['lynfa-pysgod', 'iorwerth-illewod'];
const RHODRI_IDS = ['rhodri-pysgod', 'cadwyn-gwialen'];
const GARYM_IDS = ['garym-pysgod', 'arial-morfil'];
const BETTRY_IDS = ['bettry-pysgod', 'arawn-coedwig'];
const HEFIN_IDS = ['hefin-pysgod', 'ellanah-aderyn'];
const FREWI_IDS = ['frewi-pysgod', 'eiddon-tiwna'];
const EIRWYN_1634_IDS = ['eirwyn-1634-pysgod', 'gwastad-crefyddol'];
const BLEDRI_IDS = ['bledri-pysgod', 'esill-gwialen'];
const EIRLYS_IDS = ['eirlys-pysgod', 'yarpen-eisenherz'];
const ENFYS_IDS = ['enfys-pysgod', 'rhiwallaun-brithyll'];
const GEREINT_IDS = ['gereint-pysgod', 'blodeuyn-brithyll'];
const GUENEVERE_IDS = ['guenevere-pysgod', 'kyndrwyn-blaidd'];
const EIRWYN_1654_IDS = ['eirwyn-1654-pysgod', 'islwyn-wivern'];
const GINGALAIN_1671_IDS = ['gingalain-1671-pysgod', 'llewella-arth'];
const GRIFLET_IDS = ['griflet-1672-pysgod', 'donna-ronain'];
const GENYTH_IDS = ['genyth-pysgod', 'pelleas-pendrag'];
const CARADOC_1675_IDS = ['caradoc-1675-pysgod', 'brynn-blaidd'];
const ESKILL_IDS = ['eskill-pysgod', 'aethelbeth-estmere'];
const IDRIS_IDS = ['idris-pysgod', 'mairwen-dianc'];
const MAELGWN_IDS = ['maelgwn-pysgod', 'kerensa-cwningod'];
const CYNFOR_IDS = ['cynfor-pysgod', 'mairwen-illewod'];
const CAITRIN_IDS = ['caitrin-pysgod', 'bedivere-wylan'];
const CYNDELLW_IDS = ['cynddelw-pysgod', 'aideen-nuadat'];
const GAHERIS_IDS = ['gaheris-pysgod', 'adelayne-marwolaeth'];
const MYFANWY_IDS = ['myfanwy-pysgod', 'glendower-morfil'];
const OSIAN_1698_IDS = ['osian-1698-pysgod', 'kylah-roich'];
const MEILYR_IDS = ['meilyr-pysgod', 'hafwen-dwyngwn'];

export const HOUSE_PYSGOD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-pysgod',
    title: "Haus Pysgod O'Tredegar",
    motto: 'Mawr yn y bywyd, mawreddog yn y farwolaeth.',
    description: 'Das Grafengeschlecht von Tredegar in der Grauen Weite, Hüter des Nordens und traditionsreiche Seemacht Cenyrs.',
    emblem: HOUSE_EMBLEMS.pysgod,
    houseProfile: CENYR_COUNTY_HOUSE_PROFILES.pysgod
  },
  houses: [
    house(PYSGOD_HOUSE_ID, 'Haus Pysgod', HOUSE_EMBLEMS.pysgod),
    house('house-dreigiau', 'Haus Dreigiau'),
    house('house-tonnmharra', 'Haus Tonnmharra'),
    house('house-brathaireann', 'Haus Brathaireann'),
    house('house-dornach', 'Haus Dornach'),
    house('house-unbekannt-brighde', 'Unbekanntes Haus'),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-gwialen', 'Haus Gwialen'),
    house('house-arth', 'Haus Arth', HOUSE_EMBLEMS.arth),
    house('house-unbekannt-marwine', 'Unbekanntes Haus'),
    house('house-culloch', 'Haus Culloch'),
    house('house-roich', 'Haus Roich'),
    house('house-neidr', 'Haus Neidr', HOUSE_EMBLEMS.neidr),
    house('house-tiwna', 'Haus Tiwna'),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-arfordir', 'Haus Arfordir'),
    house('house-draenog', 'Haus Draenog'),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-morfil', 'Haus Morfil'),
    house('house-coedwig', 'Haus Coedwig'),
    house('house-aderyn', 'Haus Aderyn', HOUSE_EMBLEMS.aderyn),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-eisenherz', 'Haus Eisenherz'),
    house('house-brithyll', 'Haus Brithyll'),
    house('house-blaidd', 'Haus Blaidd'),
    house('house-wivern', 'Haus Wivern'),
    house('house-ronain', 'Haus Rónáin'),
    house('house-estmere', 'Haus Estmere'),
    house('house-dianc', 'Haus Dianc'),
    house('house-cwningod', 'Haus Cwningod'),
    house('house-nuadat', 'Haus Nuadat'),
    house('house-marwolaeth', 'Haus Marwolaeth'),
    house('house-dyngwn', 'Haus Dyngwn')
  ],
  persons: [
    // Gründer und erste drei unmittelbar überlieferte Generationen
    person('gingalain-pysgod', 'Gingalain Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Gründer und erster Graf von Tredegar'
    }),
    person('morgaine-dreigiau', 'Morgaine Dreigiau', 'female', '????', '????', 'house-dreigiau'),
    person('taranis-pysgod', 'Taranis Pysgod', 'male', '????', '????'),
    person('kynwrig-pysgod', 'Kynwrig Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Ehemaliger Graf von Tredegar'
    }),
    person('penkawr-pysgod', 'Penkawr Pysgod', 'male', '????', '????'),
    person('jibheann-tonnmharra', 'Jibheann Tonnmharra', 'female', '????', '????', 'house-tonnmharra'),
    person('uthbhla-brathaireann', 'Uthbhla Brathaireann', 'female', '????', '????', 'house-brathaireann'),
    person('neassa-dornach', 'Neassa Dornach', 'female', '????', '????', 'house-dornach'),
    person('trayvion-pysgod', 'Trayvion Pysgod', 'male', '????', '????'),
    person('caradoc-ancient-pysgod', 'Caradoc Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Ehemaliger Graf von Tredegar'
    }),
    person('aranhrod-pysgod', 'Arianhrod Pysgod', 'female', '????', '????', PYSGOD_HOUSE_ID, {
      extensions: { registryManagedFields: ['name'] }
    }),
    person('brighde-unknown', 'Brighde', 'female', '????', '????', 'house-unbekannt-brighde'),
    person('linessa-wylan', 'Linessa Wylan', 'female', '????', '????', 'house-wylan'),
    person('hascan-gwialen', 'Háscan Gwialen', 'male', '????', '????', 'house-gwialen'),

    // Zwei undatierte Überlieferungslücken vor Murvin
    person('cynwrig-ancient-pysgod', 'Cynwrig Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Ehemaliger Graf von Tredegar',
      notes: 'Oberhauptfolge und Partnerüberschrift nennen Cynwrig; die Personenkarte derselben Quellspalte ist widersprüchlich mit „Griflet“ beschriftet.'
    }),
    person('categirn-pysgod', 'Categirn Pysgod', 'male', '????', '????'),
    person('afanen-arth', 'Afanen Arth', 'female', '????', '????', 'house-arth'),
    person('marwine-unknown', 'Marwine', 'female', '????', '????', 'house-unbekannt-marwine'),
    person('murvin-pysgod', 'Murvin Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Ehemaliger Graf von Tredegar'
    }),
    person('dearbhla-culloch', 'Dearbhla Culloch', 'female', '????', '????', 'house-culloch'),
    person('tyreke-pysgod', 'Tyreke Pysgod', 'male', '????', '????', PYSGOD_HOUSE_ID, {
      title: 'Ehemaliger Graf von Tredegar'
    }),
    person('morholt-pysgod', 'Morholt Pysgod', 'male', '????', '????'),
    person('gobaith-roich', 'Gobaith Roich', 'female', '????', '????', 'house-roich'),
    person('caitrin-neidr', 'Caitrin Neidr', 'female', '????', '????', 'house-neidr'),

    // Ab 1571 datierte Hauptlinie
    person('gingalain-1572-pysgod', 'Gingalain Pysgod', 'male', '1571', '1639', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar bis 1639',
      notes: 'Die genealogische Tabelle nennt 1571 als Geburtsjahr; die Amtsgalerie beginnt seine Regierungszeit 1600. Die stabile Gegenakten-ID bleibt erhalten.'
    }),
    person('tarwen-pendrag', 'Tarwen Pendrag', 'female', '1572', '1643', 'house-pendrag'),
    person('merfin-pysgod', 'Merfin Pysgod', 'male', '1590', '1661', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar 1639–1661'
    }),
    person('aranrhod-pysgod', 'Aranrhod Pysgod', 'female', '1593', '1669'),
    person('dirmyg-pysgod', 'Dirmyg Pysgod', 'male', '1594', '1690'),
    person('elus-arfordir', 'Elus Arfordir', 'female', '1593', '1672', 'house-arfordir'),
    person('traharyan-arth', 'Traharyan Arth', 'male', '1592', '1645', 'house-arth'),
    person('rhianu-draenog', 'Rhianu Draenog', 'female', '1593', '????', 'house-draenog'),
    person('cadwaladr-pysgod', 'Cadwaladr Pysgod', 'male', '1614', '1684', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar 1661–1684'
    }),
    person('llinos-pysgod', 'Llinos Pysgod', 'female', '1619', '1653'),
    person('lynfa-pysgod', 'Lynfa Pysgod', 'female', '1623', '1679'),
    person('rhodri-pysgod', 'Rhodri Pysgod', 'male', '1612', '1693'),
    person('braith-wylan', 'Braith Wylan', 'female', '????', '????', 'house-wylan'),
    person('merfyn-draig', 'Merfyn Draig', 'male', '1617', '1685', 'house-draig'),
    person('iorwerth-illewod', 'Iorwerth Illewod', 'male', '1614', '1679', 'house-illewod'),
    person('cadwyn-gwialen', 'Cadwyn Gwialen', 'female', '1613', '1685', 'house-gwialen'),

    // Kinder Cadwaladrs und Rhodris
    person('garym-pysgod', 'Garym Pysgod', 'male', '1632', '1692', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar 1684–1692',
      notes: 'Die Amtsgalerie druckt „1884–1692“; die genealogische Tabelle belegt Geburt 1632 und Amtsbeginn 1684.'
    }),
    person('bettry-pysgod', 'Bettry Pysgod', 'female', '1634', '1702'),
    person('hefin-pysgod', 'Hefin Pysgod', 'male', '1630', '1702'),
    person('frewi-pysgod', 'Frewi Pysgod', 'female', '1632', '1701'),
    person('eirwyn-1634-pysgod', 'Eirwyn Pysgod', 'female', '1634', '1710'),
    person('arial-morfil', 'Arial Morfil', 'female', '1633', '1711', 'house-morfil'),
    person('arawn-coedwig', 'Arawn Coedwig', 'male', '1632', '1699', 'house-coedwig'),
    person('ellanah-aderyn', 'Ellanah Aderyn', 'female', '1631', '1700', 'house-aderyn'),
    person('eiddon-tiwna', 'Eiddon Tiwna', 'male', '1632', '1700', 'house-tiwna'),
    person('gwastad-crefyddol', 'Gwastad Crefyddol', 'male', '1630', '1700', 'house-crefyddol'),

    // Enkel Garyms und Hefins
    person('bledri-pysgod', 'Bledri Pysgod', 'male', '1650', '1720', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar 1692–1720'
    }),
    person('eirlys-pysgod', 'Eirlys Pysgod', 'female', '1652', ''),
    person('enfys-pysgod', 'Enfys Pysgod', 'female', '1652', ''),
    person('gereint-pysgod', 'Gereint Pysgod', 'male', '1651', '1718'),
    person('guenevere-pysgod', 'Guenevere Pysgod', 'female', '1652', '1720'),
    person('eirwyn-1654-pysgod', 'Eirwyn Pysgod', 'female', '1654', '1730'),
    person('esill-gwialen', 'Esill Gwialen', 'female', '1651', '1736', 'house-gwialen'),
    person('yarpen-eisenherz', 'Yarpen Eisenherz', 'male', '1653', '', 'house-eisenherz'),
    person('rhiwallaun-brithyll', 'Rhiwallaun Brithyll', 'male', '1652', '', 'house-brithyll'),
    person('blodeuyn-brithyll', 'Blodeuyn Brithyll', 'female', '1651', '1710', 'house-brithyll'),
    person('kyndrwyn-blaidd', 'Kyndrwyn Blaidd', 'male', '1650', '1720', 'house-blaidd'),
    person('islwyn-wivern', 'Islwyn Wivern', 'male', '1651', '', 'house-wivern'),

    // Generation des amtierenden Grafen Griflet
    person('gingalain-1671-pysgod', 'Gingalain Pysgod', 'male', '1671', '1720'),
    person('griflet-1672-pysgod', 'Griflet Pysgod', 'male', '1672', '', PYSGOD_HOUSE_ID, {
      title: 'Graf von Tredegar seit 1720'
    }),
    person('genyth-pysgod', 'Genyth Pysgod', 'female', '1673', ''),
    person('caradoc-1675-pysgod', 'Caradoc Pysgod', 'male', '1675', ''),
    person('eskill-pysgod', 'Eskill Pysgod', 'male', '????', '1720', PYSGOD_HOUSE_ID, {
      notes: 'Das gedruckte Geburtsjahr 1787 liegt nach seinem Todesjahr und wurde deshalb nicht als Lebensdatum übernommen.'
    }),
    person('idris-pysgod', 'Idris Pysgod', 'male', '????', '', PYSGOD_HOUSE_ID, {
      notes: 'Das gedruckte Geburtsjahr 1772 liegt nach der Geburt seines Sohnes und wurde deshalb als unbekannt behandelt.'
    }),
    person('maelgwn-pysgod', 'Maelgwn Pysgod', 'male', '1673', '1740'),
    person('llewella-arth', 'Llewella Arth', 'female', '1675', '1720', 'house-arth'),
    person('donna-ronain', 'Donna Rónáin', 'female', '1673', '', 'house-ronain'),
    person('pelleas-pendrag', 'Pelleas Pendrag', 'male', '1671', '', 'house-pendrag', {
      notes: 'Das in der Pysgod-Tabelle gedruckte Jahr 1971 ist ein Fehler; die Pendrag-Gegenakte belegt 1671.'
    }),
    person('brynn-blaidd', 'Brynn Blaidd', 'female', '1674', '', 'house-blaidd'),
    person('aethelbeth-estmere', 'Æthelbeth Estmere', 'female', '????', '', 'house-estmere', {
      notes: 'Das gedruckte Geburtsjahr 1788 ist mit Ehe und Todesjahr Eskills unvereinbar und bleibt deshalb unbekannt.'
    }),
    person('mairwen-dianc', 'Mairwen Dianc', 'female', '1673', '', 'house-dianc'),
    person('kerensa-cwningod', 'Kerensa Cwningod', 'female', '1677', '1701', 'house-cwningod'),

    // Kinder Griflets, seiner Geschwister und seiner Vettern
    person('crisiant-pysgod', 'Crisiant Pysgod', 'unknown', '1694', '1720'),
    person('cynfor-pysgod', 'Cynfor Pysgod', 'male', '1698', '', PYSGOD_HOUSE_ID, {
      title: 'Erster in der Erbfolge des Hauses Pysgod'
    }),
    person('cynwrig-1703-pysgod', 'Cynwrig Pysgod', 'male', '1703', ''),
    person('caitrin-pysgod', 'Caitrin Pysgod', 'female', '1704', ''),
    person('cynddelw-pysgod', 'Cynddelw Pysgod', 'male', '1706', ''),
    person('osian-1699-pysgod', 'Osian Pysgod', 'male', '1699', '1720'),
    person('gaheris-pysgod', 'Gaheris Pysgod', 'male', '1696', ''),
    person('myfanwy-pysgod', 'Myfanwy Pysgod', 'female', '1702', ''),
    person('maredudd-pysgod', 'Maredudd Pysgod', 'male', '1706', ''),
    person('osian-1698-pysgod', 'Osian Pysgod', 'male', '1698', ''),
    person('meilyr-pysgod', 'Meilyr Pysgod', 'male', '1700', ''),
    person('mairwen-illewod', 'Mairwen Illewod', 'female', '1700', '', 'house-illewod'),
    person('bedivere-wylan', 'Bedivere Wylan', 'male', '1698', '', 'house-wylan'),
    person('aideen-nuadat', 'Aideen Nuadat', 'female', '1705', '', 'house-nuadat'),
    person('adelayne-marwolaeth', 'Adelayne Marwolaeth', 'female', '1700', '', 'house-marwolaeth'),
    person('glendower-morfil', 'Glendower Morfil', 'male', '1707', '', 'house-morfil'),
    person('kylah-roich', 'Kylah Roich', 'female', '1700', '', 'house-roich'),
    person('hafwen-dwyngwn', 'Hafwen Dyngwn', 'female', '1703', '', 'house-dyngwn', {
      extensions: { registryManagedFields: ['name', 'houseId'] }
    }),

    // Jüngste, im Jahr 1740 unverheiratete Generation
    person('maewyn-pysgod', 'Maewyn Pysgod', 'male', '1718', '', PYSGOD_HOUSE_ID, {
      title: 'Zweiter in der Erbfolge des Hauses Pysgod'
    }),
    person('ygerna-pysgod', 'Ygerna Pysgod', 'female', '1722', ''),
    person('sion-pysgod', 'Siôn Pysgod', 'male', '1724', ''),
    person('efa-pysgod', 'Efa Pysgod', 'female', '1730', ''),
    person('alathaia-pysgod', 'Alathaia Pysgod', 'female', '1722', ''),
    person('barystan-pysgod', 'Barystan Pysgod', 'male', '1727', ''),
    person('melvyn-pysgod', 'Melvyn Pysgod', 'male', '1734', ''),
    person('garith-pysgod', 'Garith Pysgod', 'male', '1722', ''),
    person('rhosyn-pysgod', 'Rhosyn Pysgod', 'female', '1724', ''),
    person('gwil-pysgod', 'Gwil Pysgod', 'male', '1726', ''),
    person('tudorwen-pysgod', 'Tudorwen Pysgod', 'female', '1728', '')
  ],
  partnerships: [
    createMarriage('marriage-morgaine-gingalain', ...FOUNDER_IDS),
    createMarriage('marriage-taranis-jibheann', ...TARANIS_IDS),
    createMarriage('marriage-kynwrig-uthbhla', ...KYNWRIG_IDS),
    createMarriage('marriage-penkawr-neassa', ...PENKAWR_IDS),
    createMarriage('marriage-trayvion-brighde', ...TRAYVION_IDS),
    createMarriage('marriage-caradoc-linessa', ...CARADOC_ANCIENT_IDS),
    createMarriage('marriage-aranhrod-hascan', ...ARANHROD_IDS),
    createMarriage('marriage-cynwrig-afanen', ...CYNWRIG_ANCIENT_IDS),
    createMarriage('marriage-categirn-marwine', ...CATEGIRN_IDS),
    createMarriage('marriage-murvin-dearbhla', ...MURVIN_IDS),
    createMarriage('marriage-tyreke-gobaith', ...TYREKE_IDS),
    createMarriage('marriage-caitrin-morholt', ...MORHOLT_IDS),
    createMarriage('marriage-tarwen-gingalain', ...GINGALAIN_1571_IDS),
    createMarriage('marriage-merfin-elus', ...MERFIN_IDS),
    createMarriage('marriage-aranrhod-traharyan', ...ARANRHOD_IDS),
    createMarriage('marriage-dirmyg-rhianu', ...DIRMYG_IDS),
    createMarriage('marriage-cadwaladr-braith', ...CADWALADR_IDS),
    createMarriage('marriage-merfyn-llinos', ...LLINOS_IDS),
    createMarriage('marriage-iorwerth-lynfa', ...LYNFA_IDS),
    createMarriage('marriage-rhodri-cadwyn', ...RHODRI_IDS),
    createMarriage('marriage-garym-arial', ...GARYM_IDS),
    createMarriage('marriage-bettry-arawn', ...BETTRY_IDS),
    createMarriage('marriage-hefin-ellanah', ...HEFIN_IDS),
    createMarriage('marriage-frewi-eiddon', ...FREWI_IDS),
    createMarriage('marriage-eirwyn1634-gwastad', ...EIRWYN_1634_IDS),
    createMarriage('marriage-bledri-esill', ...BLEDRI_IDS),
    createMarriage('marriage-eirlys-yarpen', ...EIRLYS_IDS),
    createMarriage('marriage-enfys-rhiwallaun', ...ENFYS_IDS),
    createMarriage('marriage-gereint-blodeuyn', ...GEREINT_IDS),
    createMarriage('marriage-guenevere-kyndrwyn', ...GUENEVERE_IDS),
    createMarriage('marriage-eirwyn1654-islwyn', ...EIRWYN_1654_IDS),
    createMarriage('marriage-gingalain1671-llewella', ...GINGALAIN_1671_IDS),
    createMarriage('marriage-griflet-donna', ...GRIFLET_IDS),
    createMarriage('marriage-pelleas-genyth', ...GENYTH_IDS),
    createMarriage('marriage-caradoc1675-brynn', ...CARADOC_1675_IDS),
    createMarriage('marriage-eskill-aethelbeth', ...ESKILL_IDS),
    createMarriage('marriage-idris-mairwen', ...IDRIS_IDS),
    createMarriage('marriage-maelgwn-kerensa', ...MAELGWN_IDS),
    createMarriage('marriage-mairwen-cynfor', ...CYNFOR_IDS),
    createMarriage('marriage-caitrin-bedivere', ...CAITRIN_IDS),
    createMarriage('marriage-cynddelw-aideen', ...CYNDELLW_IDS),
    createMarriage('marriage-gaheris-adelayne', ...GAHERIS_IDS),
    createMarriage('marriage-myfanwy-glendower', ...MYFANWY_IDS),
    createMarriage('marriage-osian1698-kylah', ...OSIAN_1698_IDS),
    createMarriage('marriage-meilyr-hafwen', ...MEILYR_IDS)
  ],
  parentages: [
    ...childrenOf(['taranis-pysgod', 'kynwrig-pysgod', 'penkawr-pysgod'], FOUNDER_IDS, 'marriage-morgaine-gingalain'),
    ...childrenOf(['trayvion-pysgod'], TARANIS_IDS, 'marriage-taranis-jibheann'),
    ...childrenOf(['caradoc-ancient-pysgod'], KYNWRIG_IDS, 'marriage-kynwrig-uthbhla'),
    ...childrenOf(['aranhrod-pysgod'], PENKAWR_IDS, 'marriage-penkawr-neassa'),
    ...gapChildren(
      ['cynwrig-ancient-pysgod', 'categirn-pysgod'],
      CARADOC_ANCIENT_IDS,
      'marriage-caradoc-linessa',
      'gap-caradoc-cynwrig'
    ),
    ...gapChildren(
      ['murvin-pysgod'],
      CYNWRIG_ANCIENT_IDS,
      'marriage-cynwrig-afanen',
      'gap-cynwrig-murvin'
    ),
    ...childrenOf(['tyreke-pysgod', 'morholt-pysgod'], MURVIN_IDS, 'marriage-murvin-dearbhla'),
    ...gapChildren(
      ['gingalain-1572-pysgod'],
      TYREKE_IDS,
      'marriage-tyreke-gobaith',
      'gap-tyreke-gingalain'
    ),
    ...childrenOf(['merfin-pysgod', 'aranrhod-pysgod', 'dirmyg-pysgod'], GINGALAIN_1571_IDS, 'marriage-tarwen-gingalain'),
    ...childrenOf(['cadwaladr-pysgod', 'llinos-pysgod', 'lynfa-pysgod'], MERFIN_IDS, 'marriage-merfin-elus'),
    ...childrenOf(['rhodri-pysgod'], DIRMYG_IDS, 'marriage-dirmyg-rhianu'),
    ...childrenOf(['garym-pysgod', 'bettry-pysgod'], CADWALADR_IDS, 'marriage-cadwaladr-braith'),
    ...childrenOf(['hefin-pysgod', 'frewi-pysgod', 'eirwyn-1634-pysgod'], RHODRI_IDS, 'marriage-rhodri-cadwyn'),
    ...childrenOf(['bledri-pysgod', 'eirlys-pysgod', 'enfys-pysgod'], GARYM_IDS, 'marriage-garym-arial'),
    ...childrenOf(['gereint-pysgod', 'guenevere-pysgod', 'eirwyn-1654-pysgod'], HEFIN_IDS, 'marriage-hefin-ellanah'),
    ...childrenOf(
      ['gingalain-1671-pysgod', 'griflet-1672-pysgod', 'genyth-pysgod', 'caradoc-1675-pysgod', 'eskill-pysgod'],
      BLEDRI_IDS,
      'marriage-bledri-esill'
    ),
    ...childrenOf(['idris-pysgod', 'maelgwn-pysgod'], GEREINT_IDS, 'marriage-gereint-blodeuyn'),
    ...childrenOf(['osian-1699-pysgod'], GINGALAIN_1671_IDS, 'marriage-gingalain1671-llewella'),
    ...childrenOf(
      ['crisiant-pysgod', 'cynfor-pysgod', 'cynwrig-1703-pysgod', 'caitrin-pysgod', 'cynddelw-pysgod'],
      GRIFLET_IDS,
      'marriage-griflet-donna'
    ),
    ...childrenOf(['gaheris-pysgod', 'myfanwy-pysgod'], CARADOC_1675_IDS, 'marriage-caradoc1675-brynn'),
    ...childrenOf(['maredudd-pysgod'], ESKILL_IDS, 'marriage-eskill-aethelbeth'),
    ...childrenOf(['osian-1698-pysgod'], IDRIS_IDS, 'marriage-idris-mairwen'),
    ...childrenOf(['meilyr-pysgod'], MAELGWN_IDS, 'marriage-maelgwn-kerensa'),
    ...childrenOf(['maewyn-pysgod', 'ygerna-pysgod'], CYNFOR_IDS, 'marriage-mairwen-cynfor'),
    ...childrenOf(['sion-pysgod', 'efa-pysgod'], CYNDELLW_IDS, 'marriage-cynddelw-aideen'),
    ...childrenOf(['alathaia-pysgod', 'barystan-pysgod', 'melvyn-pysgod'], GAHERIS_IDS, 'marriage-gaheris-adelayne'),
    ...childrenOf(['garith-pysgod', 'rhosyn-pysgod'], OSIAN_1698_IDS, 'marriage-osian1698-kylah'),
    ...childrenOf(['gwil-pysgod', 'tudorwen-pysgod'], MEILYR_IDS, 'marriage-meilyr-hafwen')
  ],
  cadetBranches: [
    createCadetHouseBranch({
      id: 'cadet-morfil-trayvion',
      name: 'Haus Morfil',
      parentPartnershipId: 'marriage-trayvion-brighde',
      houseId: 'house-morfil',
      targetFamilyId: 'haus-morfil',
      notes: 'Trayvion Pysgod und Brighde begründen Haus Morfil; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-gwialen-arianhrod',
      name: 'Haus Gwialen',
      parentPartnershipId: 'marriage-aranhrod-hascan',
      houseId: 'house-gwialen',
      targetFamilyId: 'haus-gwialen',
      notes: 'Háscan Gwialen und Arianhrod Pysgod begründen Haus Gwialen; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-brithyll-categirn',
      name: 'Haus Brithyll',
      parentPartnershipId: 'marriage-categirn-marwine',
      houseId: 'house-brithyll',
      targetFamilyId: 'haus-brithyll',
      notes: 'Categirn Pysgod und Marwine begründen Haus Brithyll; der Hausknoten hängt direkt unter ihrem Paar.'
    }),
    createCadetHouseBranch({
      id: 'cadet-tiwna-morholt',
      name: 'Haus Tiwna',
      parentPartnershipId: 'marriage-caitrin-morholt',
      houseId: 'house-tiwna',
      targetFamilyId: 'haus-tiwna',
      notes: 'Morholt Pysgod und Caitrin Neidr begründen Haus Tiwna; der Spross hängt ausschließlich direkt unter ihrem Paar.'
    }),
    marriedAway('married-away-arth-aranrhod', 'Haus Arth', 'marriage-aranrhod-traharyan', 'house-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-draig-llinos', 'Haus Draig', 'marriage-merfyn-llinos', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-illewod-lynfa', 'Haus Illewod', 'marriage-iorwerth-lynfa', 'house-illewod', HOUSE_EMBLEMS.illewod),
    marriedAway('married-away-coedwig-bettry', 'Haus Coedwig', 'marriage-bettry-arawn', 'house-coedwig'),
    marriedAway('married-away-tiwna-frewi', 'Haus Tiwna', 'marriage-frewi-eiddon', 'house-tiwna'),
    marriedAway('married-away-crefyddol-eirwyn1634', 'Haus Crefyddol', 'marriage-eirwyn1634-gwastad', 'house-crefyddol'),
    marriedAway('married-away-eisenherz-eirlys', 'Haus Eisenherz', 'marriage-eirlys-yarpen', 'house-eisenherz'),
    marriedAway('married-away-brithyll-enfys', 'Haus Brithyll', 'marriage-enfys-rhiwallaun', 'house-brithyll'),
    marriedAway('married-away-blaidd-guenevere', 'Haus Blaidd', 'marriage-guenevere-kyndrwyn', 'house-blaidd'),
    marriedAway('married-away-wivern-eirwyn1654', 'Haus Wivern', 'marriage-eirwyn1654-islwyn', 'house-wivern'),
    marriedAway('married-away-pendrag-genyth', 'Haus Pendrag', 'marriage-pelleas-genyth', 'house-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-wylan-caitrin', 'Haus Wylan', 'marriage-caitrin-bedivere', 'house-wylan', HOUSE_EMBLEMS.wylan),
    marriedAway('married-away-morfil-myfanwy', 'Haus Morfil', 'marriage-myfanwy-glendower', 'house-morfil')
  ],
  timeJumps: [
    {
      id: 'gap-caradoc-cynwrig',
      parentPartnershipId: 'marriage-caradoc-linessa',
      childIds: ['cynwrig-ancient-pysgod', 'categirn-pysgod'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner unter Caradoc Pysgod und Linessa Wylan.',
      extensions: {}
    },
    {
      id: 'gap-cynwrig-murvin',
      parentPartnershipId: 'marriage-cynwrig-afanen',
      childIds: ['murvin-pysgod'],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner unter Cynwrig Pysgod und Afanen Arth.',
      extensions: {}
    },
    {
      id: 'gap-tyreke-gingalain',
      parentPartnershipId: 'marriage-tyreke-gobaith',
      childIds: ['gingalain-1572-pysgod'],
      years: 0,
      fromYear: '????',
      toYear: '1571',
      label: 'Die datierte Überlieferung setzt 1571 wieder ein',
      notes: 'Absoluter serieller Generationentrenner unter Tyreke Pysgod und Gobaith Roich.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-morgaine-gingalain',
    houseId: PYSGOD_HOUSE_ID,
    crestSubtitle: 'Grafengeschlecht',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gingalain-pysgod',
    orientation: 'vertical',
    ancestorDepth: 28,
    descendantDepth: 28,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Ehen, Abstammungen und Portraitzuordnungen folgen der bereitgestellten Pysgod-Tabelle und ihrer eingebetteten Stammbaumgrafik. Die drei Auslassungszeichen wurden ausschließlich als serielle Zeitsprünge unter Caradoc/Linessa, Cynwrig/Afanen und Tyreke/Gobaith modelliert. Die Quelle widerspricht sich bei Cynwrig/„Griflet“ sowie bei mehreren unmöglichen Jahreszahlen; diese Fälle sind direkt an den betroffenen Personen dokumentiert und wurden nicht still erfunden. Amtsjahre der Grafen sind Titelangaben, keine Geburtsjahre. Die vier ausdrücklich bestätigten Gründerpaare sind Trayvion Pysgod/Brighde für Haus Morfil, Háscan Gwialen/Arianhrod Pysgod für Haus Gwialen, Categirn Pysgod/Marwine für Haus Brithyll sowie Morholt Pysgod/Caitrin Neidr für Haus Tiwna; jeder Hausknoten hängt ausschließlich direkt unter seinem Paar. Alle dreizehn verheirateten Pysgod-Frauen, deren Linie im Zielhaus weiterläuft, besitzen eine direkte Wegverheiratet-Verknüpfung; bloße Herkunftswappen eingeheirateter Partner erzeugen keinen Hausknoten. Generische Quell-Silhouetten und unbenannte Hofämter wurden nicht als individuelle Portraits oder Personen importiert.',
    blankFamily: false,
    sourceRevision: 3
  }
});
