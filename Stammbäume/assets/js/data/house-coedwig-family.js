import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  GRAUE_WEITE_HOUSE_EMBLEMS,
  GRAUE_WEITE_HOUSE_PROFILES
} from './graue-weite-house-profiles.js';
import { HOUSE_COEDWIG_PORTRAITS } from './house-coedwig-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import { SONNENKUESTE_HOUSE_EMBLEMS } from './sonnenkueste-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const COEDWIG_HOUSE_ID = 'house-coedwig';
const COEDWIG_EMBLEM = GRAUE_WEITE_HOUSE_EMBLEMS.coedwig;
const FOUNDER_TIME_JUMP_ID = 'gap-coedwig-founders-to-afal-afanen';

const HOUSE_EMBLEMS = Object.freeze({
  brithyll: GRAUE_WEITE_HOUSE_EMBLEMS.brithyll,
  coedwig: COEDWIG_EMBLEM,
  crefyddol: SILBERINSEL_HOUSE_EMBLEMS.crefyddol,
  creyr: WEIDEBUCHT_HOUSE_EMBLEMS.creyr,
  draenog: GRAUE_WEITE_HOUSE_EMBLEMS.draenog,
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwialen: GRAUE_WEITE_HOUSE_EMBLEMS.gwialen,
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  illewod: SONNENKUESTE_HOUSE_EMBLEMS.illewod,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  morfil: GRAUE_WEITE_HOUSE_EMBLEMS.morfil,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  tiwna: SILBERINSEL_HOUSE_EMBLEMS.tiwna,
  wivern: GRAUE_WEITE_HOUSE_EMBLEMS.wivern,
  wylan: WEIDEBUCHT_HOUSE_EMBLEMS.wylan,
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

const HOUSE_HEAD_IDS = new Set([
  'hoyer-founder-coedwig',
  'afal-coedwig',
  'meredydd-coedwig',
  'arawn-coedwig',
  'cynddelw-coedwig',
  'trahaern-coedwig'
]);
const HEIR_IDS = new Set([
  'lucan-coedwig',
  'tristyn-coedwig',
  'llew-coedwig',
  'mabon-coedwig',
  'pebin-coedwig'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? COEDWIG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_COEDWIG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === COEDWIG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death, houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return {
    id,
    name,
    motto: '',
    emblem,
    status: 'active',
    extensions: { registryManagedFields: ['name', 'emblem'] }
  };
}

const COUPLES = Object.freeze({
  founders: ['hoyer-founder-coedwig', 'tanwyn-founder-coedwig'],
  afal: ['teleri-wylan', 'afal-coedwig'],
  afanen: ['dyngannon-pyrth', 'afanen-coedwig'],
  meredydd: ['eirian-tiwna', 'meredydd-coedwig'],
  olwyna: ['run-hwyaden', 'olwyna-coedwig'],
  arawn: ['bettry-pysgod', 'arawn-coedwig'],
  menna: ['gruffyd-saethwyr', 'menna-coedwig'],
  gareth: ['gareth-brithyll', 'gwyneth-coedwig'],
  rhydian: ['rhydian-brithyll', 'gwyneth-coedwig'],
  rhodri: ['rhodri-coedwig', 'ottilie-brakskjold'],
  cynddelw: ['cynddelw-coedwig', 'grainne-duff'],
  tanwyn: ['deiniol-draenog', 'tanwyn-coedwig'],
  mallt: ['drudwas-mochdaer', 'mallt-coedwig'],
  morgan: ['morgan-coedwig', 'eluned-tylwyth'],
  trahaearn: ['celyn-wyrm', 'trahaern-coedwig'],
  telyn: ['lamorak-crefyddol', 'telyn-coedwig'],
  traherne: ['traherne-coedwig', 'maeve-suiste'],
  hoyer: ['meredid-creyr', 'hoyer-coedwig'],
  lucan: ['lucan-coedwig', 'ysbail-brithyll'],
  brysia: ['caiomhe-wivern', 'brysia-coedwig'],
  tegan: ['tutagual-crafanc', 'tegan-coedwig'],
  alaw: ['bran-morfil', 'alaw-coedwig'],
  rhianedd: ['cloten-gwialen', 'rhianedd-coedwig'],
  torri: ['hedd-illewod', 'torri-coedwig'],
  tyreke: ['gwendolen-gwefrydd', 'tyreke-coedwig'],
  zachariah: ['zachariah-coedwig', 'dolena-illygoden'],
  zara: ['talan-gwaedlyd', 'zara-coedwig']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-hoyer-tanwyn-coedwig': COUPLES.founders,
  'marriage-teleri-afal': COUPLES.afal,
  'marriage-dyngannon-afanen-pyrth': COUPLES.afanen,
  'marriage-eirian-meredydd-tiwna': COUPLES.meredydd,
  'marriage-run-olwyna-hwyaden': COUPLES.olwyna,
  'marriage-bettry-arawn': COUPLES.arawn,
  'marriage-gruffyd-menna': COUPLES.menna,
  'engagement-gareth-gwyneth-brithyll': COUPLES.gareth,
  'marriage-rhydian-gwyneth-brithyll': COUPLES.rhydian,
  'marriage-rhodri-ottilie-coedwig': COUPLES.rhodri,
  'marriage-cynddelw-grainne-coedwig': COUPLES.cynddelw,
  'marriage-deiniol-tanwyn-coedwig': COUPLES.tanwyn,
  'marriage-drudwas-mallt-mochdaer': COUPLES.mallt,
  'marriage-morgan-eluned-coedwig': COUPLES.morgan,
  'marriage-celyn-trahaern': COUPLES.trahaearn,
  'marriage-lamorak-telyn-crefyddol': COUPLES.telyn,
  'marriage-traherne-maeve-coedwig': COUPLES.traherne,
  'marriage-meredid-hoyer-creyr': COUPLES.hoyer,
  'marriage-lucan-ysbail-brithyll': COUPLES.lucan,
  'marriage-caiomhe-brysia-coedwig': COUPLES.brysia,
  'marriage-tutagual-tegan-coedwig': COUPLES.tegan,
  'marriage-bran-alaw-coedwig': COUPLES.alaw,
  'marriage-cloten-rhianedd-gwialen': COUPLES.rhianedd,
  'marriage-hedd-torri': COUPLES.torri,
  'marriage-gwendolen-tyreke': COUPLES.tyreke,
  'marriage-zachariah-dolena-coedwig': COUPLES.zachariah,
  'engagement-talan-zara-gwaedlyd': COUPLES.zara
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'coedwig-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, emblem = '', options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: options.targetFamilyId || houseId.replace(/^house-/, 'haus-'),
    emblem,
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || '',
    extensions: {
      registryManagedFields: ['name', 'houseId', 'targetFamilyId', 'emblem']
    }
  });
}

export const HOUSE_COEDWIG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-coedwig',
    title: "Haus Coedwig O'Llanfyn",
    motto: 'Blätter symbolisieren unsere Zukunft. Wir sind der Baum, der sie trägt.',
    description: 'Traditionsreiches Baronshaus des Achatsees mit Sitz in Llanfyn, bekannt für Landwirtschaft, Pferdezucht und Holzverarbeitung.',
    emblem: COEDWIG_EMBLEM,
    houseProfile: GRAUE_WEITE_HOUSE_PROFILES.coedwig
  },
  houses: [
    house(COEDWIG_HOUSE_ID, "Haus Coedwig O'Llanfyn", HOUSE_EMBLEMS.coedwig),
    house('house-wylan', 'Haus Wylan', HOUSE_EMBLEMS.wylan),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-tiwna', 'Haus Tiwna', HOUSE_EMBLEMS.tiwna),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
    house('house-saethwyr', 'Haus Saethwyr', HOUSE_EMBLEMS.saethwyr),
    house('house-brithyll', 'Haus Brithyll', HOUSE_EMBLEMS.brithyll),
    house('house-brakskjold', 'Haus Brakskjold'),
    house('house-duff', 'Haus Duff'),
    house('house-draenog', 'Haus Draenog', HOUSE_EMBLEMS.draenog),
    house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
    house('house-tylwyth', 'Haus Tylwyth'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-crefyddol', 'Haus Crefyddol', HOUSE_EMBLEMS.crefyddol),
    house('house-suiste', 'Haus Suiste'),
    house('house-creyr', 'Haus Créyr', HOUSE_EMBLEMS.creyr),
    house('house-wivern', 'Haus Wivern', HOUSE_EMBLEMS.wivern),
    house('house-crafanc', 'Haus Crafanc'),
    house('house-morfil', 'Haus Morfil', HOUSE_EMBLEMS.morfil),
    house('house-gwialen', 'Haus Gwialen', HOUSE_EMBLEMS.gwialen),
    house('house-illewod', 'Haus Illewod', HOUSE_EMBLEMS.illewod),
    house('house-gwefrydd', 'Haus Gwefrydd', HOUSE_EMBLEMS.gwefrydd),
    house('house-illygoden-tredegar', "Haus Illygoden O'Tredegar", HOUSE_EMBLEMS.illygoden)
  ],
  persons: [
    person('hoyer-founder-coedwig', 'Hoyer Coedwig', 'male', '????', '????', {
      status: 'unknown',
      familyRole: 'founder',
      lineageRole: 'head',
      title: 'Gründer und erster Baron des Hauses Coedwig'
    }),
    spouse('tanwyn-founder-coedwig', 'Tanwyn', 'female', '????', '????', '', {
      status: 'unknown',
      title: 'Mitgründerin des Hauses Coedwig'
    }),

    person('afal-coedwig', 'Afal Coedwig', 'male', '1588', '1672', {
      title: 'Baron des Hauses Coedwig bis 1672'
    }),
    awayWoman('afanen-coedwig', 'Afanen Coedwig', '1590', '1671', 'Haus Pyrth'),
    spouse('teleri-wylan', 'Teleri Wylan', 'female', '1590', '1650', 'house-wylan'),
    spouse('dyngannon-pyrth', 'Dyngannon Pyrth', 'male', '1590', '1662', 'house-pyrth'),

    person('meredydd-coedwig', 'Meredydd Coedwig', 'male', '1610', '1683', {
      title: 'Baron des Hauses Coedwig 1672–1683'
    }),
    awayWoman('olwyna-coedwig', 'Olwyna Coedwig', '1612', '1687', 'Haus Hwyaden'),
    spouse('eirian-tiwna', 'Eirian Tiwna', 'female', '1614', '1636', 'house-tiwna'),
    spouse('run-hwyaden', 'Run Hwyaden', 'male', '1611', '1673', 'house-hwyaden'),

    person('arawn-coedwig', 'Arawn Coedwig', 'male', '1632', '1699', {
      title: 'Baron des Hauses Coedwig 1683–1699'
    }),
    awayWoman('menna-coedwig', 'Menna Coedwig', '1634', '1701', 'Haus Saethwyr'),
    awayWoman('gwyneth-coedwig', 'Gwyneth Coedwig', '1637', '1709', 'Haus Brithyll', {
      notes: 'Zunächst mit Gareth Brithyll verlobt; nach dessen Tod mit Rhydian Brithyll verheiratet. Nur die Ehe mit Rhydian hat Nachkommen.'
    }),
    person('rhodri-coedwig', 'Rhodri Coedwig', 'male', '1636', '1710'),
    spouse('bettry-pysgod', 'Bettry Pysgod', 'female', '1634', '1702', 'house-pysgod'),
    spouse('gruffyd-saethwyr', 'Gruffyd', 'male', '1630', '1700', 'house-saethwyr'),
    spouse('gareth-brithyll', 'Gareth Brithyll', 'male', '1637', '1657', 'house-brithyll', {
      title: 'Verlobter Gwyneth Coedwigs'
    }),
    spouse('rhydian-brithyll', 'Rhydian Brithyll', 'male', '1639', '1675', 'house-brithyll'),
    spouse('ottilie-brakskjold', 'Ottilie Brakskjold', 'female', '1636', '1703', 'house-brakskjold'),

    person('cynddelw-coedwig', 'Cynddelw Coedwig', 'male', '1650', '1720', {
      title: 'Baron des Hauses Coedwig 1699–1720',
      notes: 'Die Kinderliste der Altquelle schreibt einmal Cyndellw; Ämterliste und Partnerschaftsüberschrift belegen Cynddelw.'
    }),
    awayWoman('tanwyn-coedwig', 'Tanwyn Coedwig', '1652', '1720', 'Haus Draenog'),
    awayWoman('mallt-coedwig', 'Mallt Coedwig', '1652', '1715', "Haus Mochdaer O'Gwyliau"),
    person('morgan-coedwig', 'Morgan Coedwig', 'male', '1654', '1733'),
    spouse('grainne-duff', 'Grainne Duff', 'female', '????', '????', 'house-duff'),
    spouse('deiniol-draenog', 'Deiniol Draenog', 'male', '1646', '', 'house-draenog'),
    spouse('drudwas-mochdaer', 'Drudwas Mochdaer', 'male', '1650', '1720', 'house-mochdaer-gwyliau'),
    spouse('eluned-tylwyth', 'Eluned Tylwyth', 'female', '1652', '1703', 'house-tylwyth'),

    person('trahaern-coedwig', 'Trahaearn Coedwig', 'male', '1673', '', {
      title: 'Baron des Hauses Coedwig seit 1720',
      notes: 'Die stabile Weltpersonen-ID bleibt aus der älteren Wyrm-Akte erhalten; die Coedwig-Quelle und die Ämterliste belegen die Namensform Trahaearn.'
    }),
    awayWoman('telyn-coedwig', 'Telyn Coedwig', '1674', '', 'Haus Crefyddol'),
    person('traherne-coedwig', 'Traherne Coedwig', 'male', '1675', ''),
    person('hoyer-coedwig', 'Hoyer Coedwig', 'male', '1677', ''),
    spouse('celyn-wyrm', 'Célyn', 'female', '1672', '', 'house-wyrm'),
    spouse('lamorak-crefyddol', 'Lamorak Crefyddol', 'male', '1675', '1725', 'house-crefyddol'),
    spouse('maeve-suiste', 'Maeve Suiste', 'female', '1675', '', 'house-suiste'),
    spouse('meredid-creyr', 'Meredid Créyr', 'female', '1673', '', 'house-creyr', {
      notes: 'Die Coedwig-Altquelle schreibt Mererid; die bestehende Créyr-Akte führt dieselbe Weltperson als Meredid.'
    }),

    person('lucan-coedwig', 'Lucan Coedwig', 'male', '1695', '', { title: 'Erster Erbe des Hauses Coedwig' }),
    awayWoman('brysia-coedwig', 'Brysia Coedwig', '1696', '', 'Haus Wivern'),
    awayWoman('tegan-coedwig', 'Tegan Coedwig', '1698', '', 'Haus Crafanc'),
    awayWoman('alaw-coedwig', 'Alaw Coedwig', '1698', '', 'Haus Morfil'),
    awayWoman('rhianedd-coedwig', 'Rhianedd Coedwig', '1699', '', 'Haus Gwialen'),
    awayWoman('torri-coedwig', 'Torri Coedwig', '1698', '', 'Haus Illewod'),
    person('tyreke-coedwig', 'Tyreke Coedwig', 'male', '1694', ''),
    person('zachariah-coedwig', 'Zachariah Coedwig', 'male', '1696', ''),
    spouse('ysbail-brithyll', 'Ysbail Brithyll', 'female', '1696', '', 'house-brithyll'),
    spouse('caiomhe-wivern', 'Caiomhe Wivern', 'male', '1697', '', 'house-wivern'),
    spouse('tutagual-crafanc', 'Tutagual Crafanc', 'male', '1697', '', 'house-crafanc'),
    spouse('bran-morfil', 'Bran Morfil', 'male', '1694', '', 'house-morfil'),
    spouse('cloten-gwialen', 'Cloten Gwialen', 'male', '1699', '', 'house-gwialen'),
    spouse('hedd-illewod', 'Hedd Illewod', 'male', '1691', '', 'house-illewod'),
    spouse('gwendolen-gwefrydd', 'Gwendolen', 'female', '1697', '', 'house-gwefrydd'),
    spouse('dolena-illygoden', 'Dolena Illygoden', 'female', '1696', '', 'house-illygoden-tredegar'),

    person('tristyn-coedwig', 'Tristyn Coedwig', 'male', '1718', '', { title: 'Zweiter Erbe des Hauses Coedwig' }),
    person('llew-coedwig', 'Llew Coedwig', 'male', '1721', '', { title: 'Dritter Erbe des Hauses Coedwig' }),
    person('mabon-coedwig', 'Mabon Coedwig', 'male', '1723', '', { title: 'Vierter Erbe des Hauses Coedwig' }),
    person('pebin-coedwig', 'Pebin Coedwig', 'male', '1725', '', { title: 'Fünfter Erbe des Hauses Coedwig' }),
    person('tiwlip-coedwig', 'Tiwlip Coedwig', 'female', '1726', ''),
    person('zara-coedwig', 'Zara Coedwig', 'female', '1719', ''),
    person('aeron-coedwig', 'Aeron Coedwig', 'male', '1727', ''),
    person('medi-coedwig', 'Medi Coedwig', 'female', '1728', ''),
    person('mwyn-coedwig', 'Mwyn Coedwig', 'male', '1730', ''),
    spouse('talan-gwaedlyd', 'Talan Gwaedlyd', 'male', '1721', '', 'house-gwaedlyd-tredegar')
  ],
  partnerships: [
    createMarriage('marriage-hoyer-tanwyn-coedwig', ...COUPLES.founders),
    createMarriage('marriage-teleri-afal', ...COUPLES.afal, { status: 'ended', end: '1650' }),
    createMarriage('marriage-dyngannon-afanen-pyrth', ...COUPLES.afanen, { status: 'ended', end: '1662' }),
    createMarriage('marriage-eirian-meredydd-tiwna', ...COUPLES.meredydd, { status: 'ended', end: '1636' }),
    createMarriage('marriage-run-olwyna-hwyaden', ...COUPLES.olwyna, { status: 'ended', end: '1673' }),
    createMarriage('marriage-bettry-arawn', ...COUPLES.arawn, { status: 'ended', end: '1699' }),
    createMarriage('marriage-gruffyd-menna', ...COUPLES.menna, { status: 'ended', end: '1700' }),
    createMarriage('engagement-gareth-gwyneth-brithyll', ...COUPLES.gareth, { type: 'engagement', status: 'ended', end: '1657' }),
    createMarriage('marriage-rhydian-gwyneth-brithyll', ...COUPLES.rhydian, { status: 'ended', end: '1675' }),
    createMarriage('marriage-rhodri-ottilie-coedwig', ...COUPLES.rhodri, { status: 'ended', end: '1703' }),
    createMarriage('marriage-cynddelw-grainne-coedwig', ...COUPLES.cynddelw, { status: 'ended', end: '1720' }),
    createMarriage('marriage-deiniol-tanwyn-coedwig', ...COUPLES.tanwyn, { status: 'ended', end: '1720' }),
    createMarriage('marriage-drudwas-mallt-mochdaer', ...COUPLES.mallt, { status: 'ended', end: '1715' }),
    createMarriage('marriage-morgan-eluned-coedwig', ...COUPLES.morgan, { status: 'ended', end: '1703' }),
    createMarriage('marriage-celyn-trahaern', ...COUPLES.trahaearn),
    createMarriage('marriage-lamorak-telyn-crefyddol', ...COUPLES.telyn, { status: 'ended', end: '1725' }),
    createMarriage('marriage-traherne-maeve-coedwig', ...COUPLES.traherne),
    createMarriage('marriage-meredid-hoyer-creyr', ...COUPLES.hoyer),
    createMarriage('marriage-lucan-ysbail-brithyll', ...COUPLES.lucan),
    createMarriage('marriage-caiomhe-brysia-coedwig', ...COUPLES.brysia),
    createMarriage('marriage-tutagual-tegan-coedwig', ...COUPLES.tegan),
    createMarriage('marriage-bran-alaw-coedwig', ...COUPLES.alaw),
    createMarriage('marriage-cloten-rhianedd-gwialen', ...COUPLES.rhianedd),
    createMarriage('marriage-hedd-torri', ...COUPLES.torri),
    createMarriage('marriage-gwendolen-tyreke', ...COUPLES.tyreke),
    createMarriage('marriage-zachariah-dolena-coedwig', ...COUPLES.zachariah),
    createMarriage('engagement-talan-zara-gwaedlyd', ...COUPLES.zara, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['afal-coedwig', 'afanen-coedwig'], 'marriage-hoyer-tanwyn-coedwig', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Afal und Afanen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['meredydd-coedwig', 'olwyna-coedwig'], 'marriage-teleri-afal'),
    ...childrenOf(['arawn-coedwig', 'menna-coedwig', 'gwyneth-coedwig', 'rhodri-coedwig'], 'marriage-eirian-meredydd-tiwna'),
    ...childrenOf(['cynddelw-coedwig', 'tanwyn-coedwig', 'mallt-coedwig'], 'marriage-bettry-arawn'),
    ...childrenOf(['morgan-coedwig'], 'marriage-rhodri-ottilie-coedwig'),
    ...childrenOf(['trahaern-coedwig', 'telyn-coedwig'], 'marriage-cynddelw-grainne-coedwig'),
    ...childrenOf(['traherne-coedwig', 'hoyer-coedwig'], 'marriage-morgan-eluned-coedwig'),
    ...childrenOf(['lucan-coedwig', 'brysia-coedwig', 'tegan-coedwig', 'alaw-coedwig', 'rhianedd-coedwig'], 'marriage-celyn-trahaern'),
    ...childrenOf(['torri-coedwig'], 'marriage-traherne-maeve-coedwig'),
    ...childrenOf(['tyreke-coedwig', 'zachariah-coedwig'], 'marriage-meredid-hoyer-creyr'),
    ...childrenOf(['tristyn-coedwig', 'llew-coedwig', 'mabon-coedwig', 'pebin-coedwig', 'tiwlip-coedwig'], 'marriage-lucan-ysbail-brithyll'),
    ...childrenOf(['zara-coedwig'], 'marriage-gwendolen-tyreke'),
    ...childrenOf(['aeron-coedwig', 'medi-coedwig', 'mwyn-coedwig'], 'marriage-zachariah-dolena-coedwig')
  ],
  cadetBranches: [
    marriedAway('married-away-afanen-coedwig-pyrth', 'Haus Pyrth', 'marriage-dyngannon-afanen-pyrth', 'house-pyrth', HOUSE_EMBLEMS.pyrth),
    marriedAway('married-away-olwyna-coedwig-hwyaden', 'Haus Hwyaden', 'marriage-run-olwyna-hwyaden', 'house-hwyaden', HOUSE_EMBLEMS.hwyaden),
    marriedAway('married-away-menna-coedwig-saethwyr', 'Haus Saethwyr', 'marriage-gruffyd-menna', 'house-saethwyr', HOUSE_EMBLEMS.saethwyr),
    marriedAway('married-away-gwyneth-coedwig-brithyll', 'Haus Brithyll', 'marriage-rhydian-gwyneth-brithyll', 'house-brithyll', HOUSE_EMBLEMS.brithyll),
    marriedAway('married-away-tanwyn-coedwig-draenog', 'Haus Draenog', 'marriage-deiniol-tanwyn-coedwig', 'house-draenog', HOUSE_EMBLEMS.draenog),
    marriedAway('married-away-mallt-coedwig-mochdaer', "Haus Mochdaer O'Gwyliau", 'marriage-drudwas-mallt-mochdaer', 'house-mochdaer-gwyliau', HOUSE_EMBLEMS.mochdaer, {
      targetFamilyId: 'haus-mochdaer-gwyliau'
    }),
    marriedAway('married-away-telyn-coedwig-crefyddol', 'Haus Crefyddol', 'marriage-lamorak-telyn-crefyddol', 'house-crefyddol', HOUSE_EMBLEMS.crefyddol),
    marriedAway('married-away-brysia-coedwig-wivern', 'Haus Wivern', 'marriage-caiomhe-brysia-coedwig', 'house-wivern', HOUSE_EMBLEMS.wivern),
    marriedAway('married-away-tegan-coedwig-crafanc', 'Haus Crafanc', 'marriage-tutagual-tegan-coedwig', 'house-crafanc'),
    marriedAway('married-away-alaw-coedwig-morfil', 'Haus Morfil', 'marriage-bran-alaw-coedwig', 'house-morfil', HOUSE_EMBLEMS.morfil),
    marriedAway('married-away-rhianedd-coedwig-gwialen', 'Haus Gwialen', 'marriage-cloten-rhianedd-gwialen', 'house-gwialen', HOUSE_EMBLEMS.gwialen),
    marriedAway('married-away-torri-coedwig-illewod', 'Haus Illewod', 'marriage-hedd-torri', 'house-illewod', HOUSE_EMBLEMS.illewod)
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-hoyer-tanwyn-coedwig',
      parentPersonId: '',
      childIds: ['afal-coedwig', 'afanen-coedwig'],
      years: 0,
      fromYear: '????',
      toYear: '1588',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, Zeitsprung und erst danach Afal und Afanen.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-hoyer-tanwyn-coedwig',
    houseId: COEDWIG_HOUSE_ID,
    crestSubtitle: 'Baronshaus des Achatsees · Sitz Llanfyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    // Der Gründer ist bewusst der Layout-Anker. Ein Fokus auf das heutige
    // Oberhaupt blendet in Family Chart entfernte Seitenzweige aus (unter
    // anderem Morgans Söhne Traherne und Hoyer sowie Telyns Ehe).
    focusPersonId: 'hoyer-founder-coedwig',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 3,
    sourceModule: "Haus Coedwig O'Llanfyn (bereitgestellte Altdaten)",
    sourceNote: 'Hoyer Coedwig und Tanwyn stehen als Gründerpaar vor Hausknoten und genau einem seriellen Zeitsprung. Die Stammbaumgrafik ergänzt Gwyneth als viertes Kind Meredydds: Nach Gareths Tod heiratet sie Rhydian Brithyll; Nachkommen werden nur in der Brithyll-Akte geführt. Cyndellw/Cynddelw, Mererid/Meredid und Trahaern/Trahaearn wurden anhand bestehender Gegenakten und der Ämterliste vereinheitlicht. Die fehlerhafte Kinderüberschrift „Jac’s & Ysbail’s“ meint nach Partnerschaft, Stammbaumgrafik und Erbfolge Lucan und Ysbail. Kinder wegverheirateter Coedwig-Frauen werden ausschließlich in den jeweiligen Zielhäusern fortgeführt. Die neuere Gwaedlyd-Quelle weist Zara eindeutig Talan Gwaedlyd statt Talan Créyr zu; die Verlobung wird unter ihrer neuen gemeinsamen ID in beiden richtigen Akten gespiegelt. Wiederholte Standardsilhouetten wurden nicht als individuelle Porträts importiert.',
    registryTombstones: {
      persons: ['talan-creyr'],
      partnerships: ['engagement-talan-zara-coedwig']
    },
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryManagedViewFields: ['focusPersonId', 'limitGenerations']
  }
});
