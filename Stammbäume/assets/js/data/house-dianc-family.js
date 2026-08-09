import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_DIANC_PORTRAITS } from './house-dianc-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const GWYNLANN_HOUSE_ID = 'house-dianc';
const ABERDAIL_HOUSE_ID = 'house-dianc-aberdail';
const DIANC_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.dianc;
const FOUNDER_TIME_JUMP_ID = 'gap-founders-to-kynwrig-jenifrydd-dianc';

const HOUSE_EMBLEMS = Object.freeze({
  arfordir: KLAUENINSEL_HOUSE_EMBLEMS.arfordir,
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  blodyn: KLAUENINSEL_HOUSE_EMBLEMS.blodyn,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  dianc: DIANC_EMBLEM,
  illygoden: GRAUE_WEITE_HOUSE_EMBLEMS.illygoden,
  lyfant: GRAUE_WEITE_HOUSE_EMBLEMS.lyfant,
  mochdaer: WEIDEBUCHT_HOUSE_EMBLEMS.mochdaer,
  pysgod: GRAUE_WEITE_HOUSE_EMBLEMS.pysgod,
  walwrs: KLAUENINSEL_HOUSE_EMBLEMS.walwrs
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

const SHARED_WORLD_PERSON_IDS = Object.freeze({
  'gingalain-dianc': 'person--haus-dianc--gingalain-dianc',
  'glaw-crafanc': 'person--haus-crafanc--glaw-crafanc',
  'marn-dianc': 'person--haus-dianc--marn-dianc',
  'murvin-dianc': 'person--haus-dianc--murvin-dianc',
  'vanna-mochdaer': 'person--haus-mochdaer-cerrigarth--vanna-mochdaer',
  'delwyn-dianc': 'person--haus-dianc--delwyn-dianc'
});

const ORIGIN_HEAD_IDS = new Set([
  'arthfael-dianc',
  'kynwrig-dianc',
  'gareth-dianc',
  'itan-dianc',
  'carantec-dianc',
  'gingalain-dianc'
]);

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

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || SHARED_WORLD_PERSON_IDS[id] || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_DIANC_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === lineHouseId ? 'core' : 'married'),
    lineageRole: options.lineageRole || (ORIGIN_HEAD_IDS.has(id) ? 'mainline' : 'branch'),
    title: options.title || '',
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function gwynlannPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(GWYNLANN_HOUSE_ID, id, name, sex, birth, death, options);
}

function aberdailPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(ABERDAIL_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'dianc-parentage',
    ...options
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    crestFrame: 'gold',
    subtitle: `Wegverheiratet an ${name}`
  });
}

const GWYNLANN_HOUSES = Object.freeze([
  house(GWYNLANN_HOUSE_ID, "Haus Dianc O'Gwynlann", HOUSE_EMBLEMS.dianc),
  house(ABERDAIL_HOUSE_ID, "Haus Dianc O'Aberdail", HOUSE_EMBLEMS.dianc),
  house('house-blodyn', "Haus Blodyn O'Llyndor", HOUSE_EMBLEMS.blodyn),
  house('house-blodyn-talgarth', "Haus Blodyn O'Talgarth", HOUSE_EMBLEMS.blodyn),
  house('house-arfordir', "Haus Arfordir O'Serenlyn", HOUSE_EMBLEMS.arfordir),
  house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-drewi', 'Haus Drewi'),
  house('house-forsyth', 'Haus Forsyth'),
  house('house-lyfant', "Haus Lyfant O'Derwyddion", HOUSE_EMBLEMS.lyfant),
  house('house-illygoden', "Haus Illygoden O'Tirwedd", HOUSE_EMBLEMS.illygoden),
  house('house-crwynog', 'Haus Crwynog'),
  house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
  house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
  house('house-walwrs', "Haus Walwrs O'Traeth", HOUSE_EMBLEMS.walwrs),
  house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
  house('house-mochdaer-cerrigarth', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer)
]);

const ABERDAIL_HOUSES = Object.freeze([
  house(ABERDAIL_HOUSE_ID, "Haus Dianc O'Aberdail", HOUSE_EMBLEMS.dianc),
  house(GWYNLANN_HOUSE_ID, "Haus Dianc O'Gwynlann", HOUSE_EMBLEMS.dianc),
  house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
  house('house-mochdaer-cerrigarth', "Haus Mochdaer O'Cerrigarth", HOUSE_EMBLEMS.mochdaer)
]);

const ORIGIN_PARTNERS = Object.freeze({
  founders: ['gwendolen-blodyn', 'arthfael-dianc'],
  kynwrig: ['myfanwy-1618-blodyn', 'kynwrig-dianc'],
  jenifrydd: ['jenifrydd-dianc', 'newyddllyn-arfordir'],
  gareth: ['ffraid-arth', 'gareth-dianc'],
  kerenza: ['kerenza-dianc', 'mawr-bochdew'],
  kyvwlch: ['kyvwlch-dianc', 'eleri-drewi'],
  itan: ['itan-dianc', 'fionnghuala-forsyth'],
  gwenhwyfach: ['macsen-lyfant', 'gwenhwyfach-dianc'],
  sywlch: ['wynne-illygoden', 'sywlch-dianc'],
  dolena: ['dolena-dianc', 'ehangwen-crwynog'],
  carantec: ['carantec-dianc', 'lowri-arfordir'],
  mairwen: ['idris-pysgod', 'mairwen-dianc'],
  caron: ['pelleas-blaidd', 'caron-dianc'],
  ysgonan: ['ysgonan-dianc', 'zenna-walwrs'],
  gingalain: ['glaw-crafanc', 'gingalain-dianc'],
  cerny: ['yhon-blodyn', 'cerny-dianc'],
  werbenec: ['werbenec-dianc', 'prys-bochdew'],
  murvin: ['vanna-mochdaer', 'murvin-dianc']
});

export const HOUSE_DIANC_GWYNLANN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dianc',
    title: "Haus Dianc O'Gwynlann",
    motto: '',
    description: 'Vollständige vennyrianische Herkunftsakte der Dianc aus Gwynlann. Gingalain begründet 1720 die getrennte Ritterfürstenlinie von Aberdail; der über Murvin zu Delwyn führende Überlebendenzweig wird dort parallel mitgeführt.',
    emblem: DIANC_EMBLEM,
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES['dianc-gwynlann']
  },
  houses: [...GWYNLANN_HOUSES],
  persons: [
    gwynlannPerson('arthfael-dianc', 'Arthfael Dianc', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Gründer des Hauses Dianc O'Gwynlann"
    }),
    gwynlannPerson('gwendolen-blodyn', 'Gwendolen Blodyn', 'female', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'founder',
      title: 'Prinzessin von Vennyr · Mitgründerin des Hauses Dianc'
    }),

    gwynlannPerson('kynwrig-dianc', 'Kynwrig Dianc', 'male', '1618', '1687'),
    gwynlannPerson('myfanwy-1618-blodyn', 'Myfanwy Blodyn', 'female', '1618', '1699', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    gwynlannPerson('jenifrydd-dianc', 'Jenifrydd Dianc', 'female', '1612', '1659', {
      title: 'Wegverheiratet an Haus Arfordir',
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('newyddllyn-arfordir', 'Newyddllyn Arfordir', 'male', '1610', '1679', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),

    gwynlannPerson('gareth-dianc', 'Gareth Dianc', 'male', '1635', '1700'),
    gwynlannPerson('ffraid-arth', 'Ffraid Arth', 'female', '1633', '1688', {
      houseId: 'house-arth',
      familyRole: 'married'
    }),
    gwynlannPerson('kerenza-dianc', 'Kerenza Dianc', 'female', '1632', '1679', {
      title: 'Wegverheiratet an Haus Bochdew',
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('mawr-bochdew', 'Mawr Bochdew', 'male', '1628', '1704', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    gwynlannPerson('kyvwlch-dianc', 'Kyvwlch Dianc', 'male', '1633', '????', {
      notes: 'Das gedruckte Geburtsjahr 1933 wurde wegen der Generationenfolge als 1633 normalisiert; sein Todesjahr ist nicht überliefert.'
    }),
    gwynlannPerson('eleri-drewi', 'Eleri Drewi', 'female', '1635', '????', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),

    gwynlannPerson('itan-dianc', 'Itan Dianc', 'male', '1653', '1712'),
    gwynlannPerson('fionnghuala-forsyth', 'Fionnghuala Forsyth', 'female', '1653', '????', {
      houseId: 'house-forsyth',
      familyRole: 'married'
    }),
    gwynlannPerson('gwenhwyfach-dianc', 'Gwenhwyfach Dianc', 'female', '1655', '1699', {
      title: 'Wegverheiratet an Haus Lyfant',
      tags: ['Wegverheiratet'],
      notes: 'Das Todesjahr 1699 folgt der ausgearbeiteten Lyfant-Gegenakte.'
    }),
    gwynlannPerson('macsen-lyfant', 'Macsen Lyfant', 'male', '1654', '1698', {
      houseId: 'house-lyfant',
      familyRole: 'married'
    }),
    gwynlannPerson('sywlch-dianc', 'Sywlch Dianc', 'male', '1655', '1720', {
      notes: 'Die direkte Dianc-Quelle nennt 1720 als Todesjahr; die Ehe endet bereits 1690 mit Wynnes Tod.'
    }),
    gwynlannPerson('wynne-illygoden', 'Wynne Illygoden', 'female', '1655', '1690', {
      houseId: 'house-illygoden',
      familyRole: 'married',
      notes: 'Das Todesjahr 1690 folgt der ausgearbeiteten Illygoden-Gegenakte.'
    }),
    gwynlannPerson('dolena-dianc', 'Dolena Dianc', 'female', '1657', '1720', {
      title: 'Wegverheiratet an Haus Crwynog',
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('ehangwen-crwynog', 'Ehangwen Crwynog', 'male', '1651', '1720', {
      houseId: 'house-crwynog',
      familyRole: 'married'
    }),

    gwynlannPerson('carantec-dianc', 'Carantec Dianc', 'male', '1672', '1720'),
    gwynlannPerson('lowri-arfordir', 'Lowri Arfordir', 'female', '1677', '1730', {
      houseId: 'house-arfordir',
      familyRole: 'married'
    }),
    gwynlannPerson('mairwen-dianc', 'Mairwen Dianc', 'female', '1673', '', {
      title: 'Wegverheiratet an Haus Pysgod',
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('idris-pysgod', 'Idris Pysgod', 'male', '????', '', {
      houseId: 'house-pysgod',
      familyRole: 'married',
      notes: 'Das gedruckte Geburtsjahr 1772 ist mit Ehe und Sohn unvereinbar und bleibt deshalb unbekannt.'
    }),
    gwynlannPerson('caron-dianc', 'Caron Dianc', 'female', '1673', '', {
      title: 'Wegverheiratet an Haus Blaidd',
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('pelleas-blaidd', 'Pelleas Blaidd', 'male', '1669', '', {
      houseId: 'house-blaidd',
      familyRole: 'married',
      notes: 'Das gedruckte Geburtsjahr 1769 wurde nach der kanonischen Blaidd-Gegenakte zu 1669 korrigiert.'
    }),
    gwynlannPerson('ysgonan-dianc', 'Ysgonan Dianc', 'male', '1673', '1720'),
    gwynlannPerson('zenna-walwrs', 'Zenna Walwrs', 'female', '1675', '1733', {
      houseId: 'house-walwrs',
      familyRole: 'married'
    }),

    gwynlannPerson('gingalain-dianc', 'Gingalain Dianc', 'male', '1694', '', {
      lineageRole: 'head',
      title: 'Begründer der Aberdail-Linie',
      notes: 'Gingalain bleibt als Sohn Carantecs und Lowris in Gwynlann sichtbar. Seine neue Linie wird ausschließlich in der verknüpften Aberdail-Akte fortgeführt.'
    }),
    gwynlannPerson('glaw-crafanc', 'Glaw Crafanc', 'female', '1693', '', {
      houseId: 'house-crafanc',
      familyRole: 'married'
    }),
    gwynlannPerson('cerny-dianc', 'Cerny Dianc', 'female', '1692', '1720', {
      title: "Wegverheiratet an Haus Blodyn O'Talgarth",
      tags: ['Wegverheiratet']
    }),
    gwynlannPerson('yhon-blodyn', 'Yhon Blodyn', 'male', '1693', '', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    gwynlannPerson('werbenec-dianc', 'Werbenec Dianc', 'male', '1694', '1720'),
    gwynlannPerson('prys-bochdew', 'Prys Bochdew', 'female', '1693', '1720', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    gwynlannPerson('murvin-dianc', 'Murvin Dianc', 'male', '1698', '1720', {
      notes: 'Murvin fällt 1720. Er wird in Aberdail als notwendiger Vateranker Delwyns erneut dargestellt.'
    }),
    gwynlannPerson('vanna-mochdaer', 'Vanna Mochdaer', 'female', '1698', '1720', {
      houseId: 'house-mochdaer-cerrigarth',
      familyRole: 'married'
    }),
    gwynlannPerson('trevar-dianc', 'Trevar Dianc', 'male', '1702', '1720'),

    gwynlannPerson('marn-dianc', 'Marn Dianc', 'male', '1719', '', {
      lineageRole: 'mainline'
    }),
    gwynlannPerson('dewi-dianc', 'Dewi Dianc', 'male', '1710', '????', {
      notes: 'Die Quelle kennzeichnet Dewi als verstorben, nennt aber kein Todesjahr.'
    }),
    gwynlannPerson('ened-dianc', 'Ened Dianc', 'female', '1717', '????', {
      notes: 'Die Quelle kennzeichnet Ened als verstorben, nennt aber kein Todesjahr.'
    }),
    gwynlannPerson('delwyn-dianc', 'Delwyn Dianc', 'male', '1718', '', {
      lineageRole: 'mainline',
      notes: 'Überlebender Sohn Murvins und Vannas; seine Fortsetzung wird parallel zu Gingalain in Aberdail gezeigt.'
    })
  ],
  partnerships: [
    endedMarriage('marriage-gwendolen-arthfael', ...ORIGIN_PARTNERS.founders),
    endedMarriage('marriage-myfanwy-kynwrig', ...ORIGIN_PARTNERS.kynwrig, '1687'),
    endedMarriage('marriage-jenifrydd-newyddllyn-dianc', ...ORIGIN_PARTNERS.jenifrydd, '1659'),
    endedMarriage('marriage-ffraid-gareth', ...ORIGIN_PARTNERS.gareth, '1688'),
    endedMarriage('marriage-kerenza-mawr-dianc', ...ORIGIN_PARTNERS.kerenza, '1679'),
    endedMarriage('marriage-kyvwlch-eleri-dianc', ...ORIGIN_PARTNERS.kyvwlch),
    endedMarriage('marriage-itan-fionnghuala-dianc', ...ORIGIN_PARTNERS.itan, '1712'),
    endedMarriage('marriage-macsen-gwenhwyfach-lyfant', ...ORIGIN_PARTNERS.gwenhwyfach, '1698'),
    endedMarriage('marriage-wynne-sywlch-illygoden', ...ORIGIN_PARTNERS.sywlch, '1690'),
    endedMarriage('marriage-dolena-ehangwen-dianc', ...ORIGIN_PARTNERS.dolena, '1720'),
    endedMarriage('marriage-carantec-lowri-dianc', ...ORIGIN_PARTNERS.carantec, '1720'),
    createMarriage('marriage-idris-mairwen', ...ORIGIN_PARTNERS.mairwen),
    createMarriage('marriage-pelleas-caron-blaidd', ...ORIGIN_PARTNERS.caron),
    endedMarriage('marriage-ysgonan-zenna-dianc', ...ORIGIN_PARTNERS.ysgonan, '1720'),
    createMarriage('marriage-glaw-gingalain-crafanc', ...ORIGIN_PARTNERS.gingalain),
    endedMarriage('marriage-yhon-cerny', ...ORIGIN_PARTNERS.cerny, '1720'),
    endedMarriage('marriage-werbenec-prys-dianc', ...ORIGIN_PARTNERS.werbenec, '1720'),
    endedMarriage('marriage-vanna-murvin-mochdaer', ...ORIGIN_PARTNERS.murvin, '1720')
  ],
  parentages: [
    ...childrenOf(['kynwrig-dianc', 'jenifrydd-dianc'], ORIGIN_PARTNERS.founders, 'marriage-gwendolen-arthfael', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und den ab 1612 belegten Linien liegen nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['gareth-dianc', 'kerenza-dianc', 'kyvwlch-dianc'], ORIGIN_PARTNERS.kynwrig, 'marriage-myfanwy-kynwrig'),
    ...childrenOf(['itan-dianc', 'gwenhwyfach-dianc'], ORIGIN_PARTNERS.gareth, 'marriage-ffraid-gareth'),
    ...childrenOf(['sywlch-dianc', 'dolena-dianc'], ORIGIN_PARTNERS.kyvwlch, 'marriage-kyvwlch-eleri-dianc'),
    ...childrenOf(['carantec-dianc', 'mairwen-dianc', 'caron-dianc'], ORIGIN_PARTNERS.itan, 'marriage-itan-fionnghuala-dianc'),
    ...childrenOf(['ysgonan-dianc'], ORIGIN_PARTNERS.sywlch, 'marriage-wynne-sywlch-illygoden'),
    ...childrenOf(['gingalain-dianc', 'cerny-dianc'], ORIGIN_PARTNERS.carantec, 'marriage-carantec-lowri-dianc'),
    ...childrenOf(['werbenec-dianc', 'murvin-dianc', 'trevar-dianc'], ORIGIN_PARTNERS.ysgonan, 'marriage-ysgonan-zenna-dianc'),
    ...childrenOf(['marn-dianc'], ORIGIN_PARTNERS.gingalain, 'marriage-glaw-gingalain-crafanc'),
    ...childrenOf(['dewi-dianc', 'ened-dianc'], ORIGIN_PARTNERS.werbenec, 'marriage-werbenec-prys-dianc'),
    ...childrenOf(['delwyn-dianc'], ORIGIN_PARTNERS.murvin, 'marriage-vanna-murvin-mochdaer')
  ],
  cadetBranches: [
    marriedAway('married-away-jenifrydd-dianc-arfordir', 'Haus Arfordir', 'marriage-jenifrydd-newyddllyn-dianc', 'house-arfordir', 'haus-arfordir', HOUSE_EMBLEMS.arfordir),
    marriedAway('married-away-kerenza-dianc-bochdew', 'Haus Bochdew', 'marriage-kerenza-mawr-dianc', 'house-bochdew', 'haus-bochdew'),
    marriedAway('married-away-gwenhwyfach-dianc-lyfant', 'Haus Lyfant', 'marriage-macsen-gwenhwyfach-lyfant', 'house-lyfant', 'haus-lyfant', HOUSE_EMBLEMS.lyfant),
    marriedAway('married-away-dolena-dianc-crwynog', 'Haus Crwynog', 'marriage-dolena-ehangwen-dianc', 'house-crwynog', 'haus-crwynog'),
    marriedAway('married-away-mairwen-dianc-pysgod', 'Haus Pysgod', 'marriage-idris-mairwen', 'house-pysgod', 'haus-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-caron-dianc-blaidd', 'Haus Blaidd', 'marriage-pelleas-caron-blaidd', 'house-blaidd', 'haus-blaidd', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-cerny-dianc-blodyn', "Haus Blodyn O'Talgarth", 'marriage-yhon-cerny', 'house-blodyn-talgarth', 'haus-blodyn-talgarth', HOUSE_EMBLEMS.blodyn),
    createMigrationHouseBranch({
      id: 'migration-gingalain-dianc-aberdail',
      name: "Haus Dianc O'Aberdail",
      parentPersonId: 'gingalain-dianc',
      houseId: ABERDAIL_HOUSE_ID,
      targetFamilyId: 'haus-dianc-aberdail',
      emblem: DIANC_EMBLEM,
      founded: '1720',
      subtitle: 'Von Gingalain begründete neue Ritterfürstenlinie in Aberdail',
      crestFrame: 'gold',
      extensions: {
        offshootPlacement: 'below'
      },
      notes: 'Der Übergang hängt allein und geradlinig unter Gingalain. In der Zielakte überspannt ein gemeinsamer Herkunftsknoten Gingalains Linie und Murvins zu Delwyn führenden Zweig.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-gwendolen-arthfael',
      sharedParentPartnershipIds: [],
      childIds: ['kynwrig-dianc', 'jenifrydd-dianc'],
      years: 0,
      fromYear: '????',
      toYear: '1612',
      label: 'Die belegte Linie setzt 1612 wieder ein',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, genau ein serieller Zeitsprung und erst danach Kynwrig und Jenifrydd.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwendolen-arthfael',
    houseId: GWYNLANN_HOUSE_ID,
    crestSubtitle: 'Alte vennyrianische Linie aus Gwynlann',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'arthfael-dianc',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-dianc-aberdail',
    sourceRevision: 2,
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Gwynlann-Herkunftsakte nach der Dianc-Tabelle. Arthfael und Gwendolen tragen Hausknoten und seriellen Zeitsprung; sämtliche historischen Äste, Ehen und Wegverheiratungen bleiben erhalten. Gingalain erhält den alleinigen Übergang nach Aberdail. Marn und Delwyn bleiben als vor der Flucht geborene Überlebende genealogisch in Gwynlann sichtbar; die nach 1720 geborenen Gwenifer und Barry erscheinen nur in Aberdail.'
  }
});

const ABERDAIL_PARTNERS = Object.freeze({
  gingalain: ['glaw-crafanc', 'gingalain-dianc'],
  murvin: ['vanna-mochdaer', 'murvin-dianc']
});

export const HOUSE_DIANC_ABERDAIL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-dianc-aberdail',
    title: "Haus Dianc O'Aberdail",
    motto: '',
    description: 'Die seit 1720 getrennt geführte Ritterfürstenlinie von Aberdail. Gingalain steht als Begründer im Hauptzweig; Murvin und Vanna werden parallel als notwendige Elternanker des überlebenden Delwyn mitgeführt.',
    emblem: DIANC_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.dianc
  },
  houses: [...ABERDAIL_HOUSES],
  persons: [
    aberdailPerson('gingalain-dianc', 'Gingalain Dianc', 'male', '1694', '', {
      lineageRole: 'head',
      title: 'Gründer und Ritterfürst von Aberdail seit 1720'
    }),
    aberdailPerson('glaw-crafanc', 'Glaw Crafanc', 'female', '1693', '', {
      houseId: 'house-crafanc',
      familyRole: 'married'
    }),
    aberdailPerson('murvin-dianc', 'Murvin Dianc', 'male', '1698', '1720', {
      notes: 'Gefallener Vater Delwyns; als genealogischer Anker der zweiten Aberdail-Linie erneut dargestellt.'
    }),
    aberdailPerson('vanna-mochdaer', 'Vanna Mochdaer', 'female', '1698', '1720', {
      houseId: 'house-mochdaer-cerrigarth',
      familyRole: 'married'
    }),
    aberdailPerson('marn-dianc', 'Marn Dianc', 'male', '1719', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Dianc'
    }),
    aberdailPerson('gwenifer-dianc', 'Gwenifer Dianc', 'female', '1721', ''),
    aberdailPerson('barry-dianc', 'Barry Dianc', 'male', '1722', ''),
    aberdailPerson('delwyn-dianc', 'Delwyn Dianc', 'male', '1718', '', {
      lineageRole: 'mainline',
      title: 'Überlebender Sohn Murvins und Vannas'
    })
  ],
  partnerships: [
    createMarriage('marriage-glaw-gingalain-crafanc', ...ABERDAIL_PARTNERS.gingalain),
    endedMarriage('marriage-vanna-murvin-mochdaer', ...ABERDAIL_PARTNERS.murvin, '1720')
  ],
  parentages: [
    ...childrenOf(['marn-dianc', 'gwenifer-dianc', 'barry-dianc'], ABERDAIL_PARTNERS.gingalain, 'marriage-glaw-gingalain-crafanc'),
    ...childrenOf(['delwyn-dianc'], ABERDAIL_PARTNERS.murvin, 'marriage-vanna-murvin-mochdaer')
  ],
  cadetBranches: [],
  timeJumps: [],
  lineage: {
    founderPartnershipId: '',
    houseId: ABERDAIL_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Aberdail · seit 1720',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: {
      enabled: true,
      id: 'dianc-gwynlann-origin',
      houseId: GWYNLANN_HOUSE_ID,
      name: "Haus Dianc O'Gwynlann",
      subtitle: 'Vennyrianische Herkunftslinie · Umsiedlung nach Aberdail 1720',
      emblem: DIANC_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['gingalain-dianc', 'murvin-dianc'],
      targetFamilyId: 'haus-dianc',
      notes: 'Ein gemeinsamer Herkunftsknoten steht geradlinig über Gingalain und Murvin. Gingalain führt die neue Hauptlinie; Murvin erscheint nur als notwendiger Vateranker Delwyns, damit der zweite Überlebendenzweig nicht fälschlich an Gingalains Ehe gehängt wird.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gingalain-dianc',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-dianc',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Aberdail-Akte mit Gingalain als Begründer und einem gemeinsamen Herkunftsknoten über Gingalain und Murvin. Glaw steht über Marn, Gwenifer und Barry; Vanna und Murvin stehen parallel über Delwyn. Dadurch werden beide Elternschaften eindeutig und ohne doppelte Kinder fortgeführt.'
  }
});

export const DIANC_HOUSE_FAMILIES = Object.freeze([
  HOUSE_DIANC_GWYNLANN_FAMILY,
  HOUSE_DIANC_ABERDAIL_FAMILY
]);
