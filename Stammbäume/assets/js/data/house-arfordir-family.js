import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createMigrationHouseBranch,
  createParentages
} from './family-record-builders.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_ARFORDIR_PORTRAITS } from './house-arfordir-portraits.js';
import {
  KLAUENINSEL_HOUSE_EMBLEMS,
  KLAUENINSEL_HOUSE_PROFILES,
  KLAUENINSEL_ORIGIN_HOUSE_PROFILES
} from './klaueninseln-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const SERENLYN_HOUSE_ID = 'house-arfordir';
const ABERDAIL_HOUSE_ID = 'house-arfordir-aberdail';
const ARFORDIR_EMBLEM = KLAUENINSEL_HOUSE_EMBLEMS.arfordir;
const FOUNDER_TIME_JUMP_ID = 'gap-ysbryd-to-seissylwch-arfordir';

const HOUSE_EMBLEMS = Object.freeze({
  arfordir: ARFORDIR_EMBLEM,
  arth: KLAUENINSEL_HOUSE_EMBLEMS.arth,
  blaidd: GRAUE_WEITE_HOUSE_EMBLEMS.blaidd,
  blodyn: KLAUENINSEL_HOUSE_EMBLEMS.blodyn,
  crafanc: KLAUENINSEL_HOUSE_EMBLEMS.crafanc,
  dianc: KLAUENINSEL_HOUSE_EMBLEMS.dianc,
  gwaedlyd: GRAUE_WEITE_HOUSE_EMBLEMS.gwaedlyd,
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

const ORIGIN_HEAD_IDS = new Set([
  'ysbryd-arfordir',
  'seissylwch-arfordir',
  'newyddllyn-arfordir',
  'arglwydd-arfordir',
  'thalen-arfordir',
  'leodegrance-arfordir'
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

function worldPersonIdFor(houseId, id) {
  if (houseId === SERENLYN_HOUSE_ID || houseId === ABERDAIL_HOUSE_ID) {
    return `person--haus-arfordir--${id}`;
  }
  return '';
}

function personForLine(lineHouseId, id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? lineHouseId : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(houseId, id),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_ARFORDIR_PORTRAITS[id] || '',
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

function serenlynPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(SERENLYN_HOUSE_ID, id, name, sex, birth, death, options);
}

function aberdailPerson(id, name, sex, birth = '????', death = '', options = {}) {
  return personForLine(ABERDAIL_HOUSE_ID, id, name, sex, birth, death, options);
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, { status: 'ended', end });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, {
    idPrefix: options.idPrefix || 'arfordir-parentage',
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

const SERENLYN_HOUSES = Object.freeze([
  house(SERENLYN_HOUSE_ID, "Haus Arfordir O'Serenlyn", HOUSE_EMBLEMS.arfordir),
  house(ABERDAIL_HOUSE_ID, "Haus Arfordir O'Aberdail", HOUSE_EMBLEMS.arfordir),
  house('house-arth', "Haus Arth O'Talgarth", HOUSE_EMBLEMS.arth),
  house('house-blaidd', "Haus Blaidd O'Branon", HOUSE_EMBLEMS.blaidd),
  house('house-blodyn', "Haus Blodyn O'Llyndor", HOUSE_EMBLEMS.blodyn),
  house('house-bochdew', 'Haus Bochdew'),
  house('house-dianc', "Haus Dianc O'Gwynlann", HOUSE_EMBLEMS.dianc),
  house('house-drewi', 'Haus Drewi'),
  house('house-dublais', 'Haus Dublais'),
  house('house-gwenyen', 'Haus Gwenyen'),
  house('house-mochdaer-gwyliau', "Haus Mochdaer O'Gwyliau", HOUSE_EMBLEMS.mochdaer),
  house('house-morgryn', 'Haus Morgryn'),
  house('house-morlais', 'Haus Morlais'),
  house('house-pysgod', "Haus Pysgod O'Tredegar", HOUSE_EMBLEMS.pysgod),
  house('house-trachwyll', 'Haus Trachwyll'),
  house('house-walwrs', "Haus Walwrs O'Traeth", HOUSE_EMBLEMS.walwrs),
  house('house-blodeuwedd', 'Haus Blodeuwedd')
]);

const ABERDAIL_HOUSES = Object.freeze([
  house(ABERDAIL_HOUSE_ID, "Haus Arfordir O'Aberdail", HOUSE_EMBLEMS.arfordir),
  house(SERENLYN_HOUSE_ID, "Haus Arfordir O'Serenlyn", HOUSE_EMBLEMS.arfordir),
  house('house-blodyn', "Haus Blodyn O'Aberdail", HOUSE_EMBLEMS.blodyn),
  house('house-crafanc', "Haus Crafanc O'Talgarth", HOUSE_EMBLEMS.crafanc),
  house('house-gwaedlyd', "Haus Gwaedlyd O'Caer Gorwel", HOUSE_EMBLEMS.gwaedlyd),
  house('house-blaidd-tredegar', "Haus Blaidd O'Tredegar", HOUSE_EMBLEMS.blaidd),
  house('house-lyfant-caer-asgwrn', "Haus Lyfant O'Caer Asgwrn", HOUSE_EMBLEMS.lyfant),
  house('house-trachwyll', 'Haus Trachwyll')
]);

const ORIGIN_PARTNERS = Object.freeze({
  founders: ['tudurwen-blodyn', 'ysbryd-arfordir'],
  seissylwch: ['gwyneth-blaidd', 'seissylwch-arfordir'],
  elus: ['merfin-pysgod', 'elus-arfordir'],
  newyddllyn: ['jenifrydd-dianc', 'newyddllyn-arfordir'],
  meiriona: ['meiriona-arfordir', 'llaesgwynyn-walwrs'],
  trevor: ['trevor-arfordir', 'larna-drewi'],
  arglwydd: ['arglwydd-arfordir', 'hedd-gwenyen'],
  arglwyddes: ['marmaduke-mochdaer', 'arglwyddes-arfordir'],
  grugyn: ['grugyn-arfordir', 'lunet-morgryn'],
  thalen: ['thalen-arfordir', 'aigneis-dublais'],
  llewella: ['llewella-arfordir', 'maxen-drewi'],
  endellion: ['endellion-arfordir', 'dalvin-bochdew'],
  cadfan: ['cadfan-arfordir', 'tegin-morlais'],
  leodegrance: ['leodegrance-arfordir', 'cryl-trachwyll'],
  luc: ['arianrhod-gwaedlyd', 'luc-arfordir'],
  lowri: ['carantec-dianc', 'lowri-arfordir'],
  jowna: ['griff-arth', 'jowna-arfordir'],
  eiddon: ['eiddon-arfordir', 'jenita-blodeuwedd'],
  malltwyn: ['malltwyn-arfordir', 'maldwyn-morgryn']
});

export const HOUSE_ARFORDIR_SERENLYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-arfordir',
    title: "Haus Arfordir O'Serenlyn",
    motto: '',
    description: 'Vollständige Herkunftsakte des alten vennyrianischen Grafenhauses aus Serenlyn. Leodegrance und sein Bruder Luc beginnen 1720 gemeinsam die getrennte Ritterfürstenlinie von Aberdail.',
    emblem: ARFORDIR_EMBLEM,
    houseProfile: KLAUENINSEL_ORIGIN_HOUSE_PROFILES['arfordir-serenlyn']
  },
  houses: [...SERENLYN_HOUSES],
  persons: [
    serenlynPerson('ysbryd-arfordir', 'Ysbryd Arfordir', 'male', '????', '????', {
      familyRole: 'founder',
      lineageRole: 'head',
      title: "Gründer des Hauses Arfordir O'Serenlyn"
    }),
    serenlynPerson('tudurwen-blodyn', 'Tudurwen Blodyn', 'female', '????', '????', {
      houseId: 'house-blodyn',
      familyRole: 'founder',
      title: 'Prinzessin von Vennyr · Mitgründerin des Hauses Arfordir'
    }),

    serenlynPerson('seissylwch-arfordir', 'Seissylwch Arfordir', 'male', '1589', '1664'),
    serenlynPerson('gwyneth-blaidd', 'Gwyneth Blaidd', 'female', '1592', '1635', {
      houseId: 'house-blaidd',
      familyRole: 'married'
    }),
    serenlynPerson('eurolwyn-arfordir', 'Eurolwyn Arfordir', 'male', '1591', '1594'),
    serenlynPerson('elus-arfordir', 'Elus Arfordir', 'female', '1593', '1672', {
      title: 'Wegverheiratet an Haus Pysgod',
      tags: ['Wegverheiratet'],
      notes: 'Das Todesjahr 1672 folgt der ausgearbeiteten Pysgod-Gegenakte.'
    }),
    serenlynPerson('merfin-pysgod', 'Merfin Pysgod', 'male', '1590', '1661', {
      houseId: 'house-pysgod',
      familyRole: 'married'
    }),

    serenlynPerson('newyddllyn-arfordir', 'Newyddllyn Arfordir', 'male', '1610', '1679'),
    serenlynPerson('jenifrydd-dianc', 'Jenifrydd Dianc', 'female', '1612', '1659', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    serenlynPerson('meiriona-arfordir', 'Meiriona Arfordir', 'female', '1617', '1680', {
      title: 'Wegverheiratet an Haus Walwrs',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('llaesgwynyn-walwrs', 'Llaesgwynyn Walwrs', 'male', '1615', '1681', {
      houseId: 'house-walwrs',
      familyRole: 'married'
    }),
    serenlynPerson('trevor-arfordir', 'Trevor Arfordir', 'male', '1612', '1675'),
    serenlynPerson('larna-drewi', 'Larna Drewi', 'female', '1615', '1680', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),

    serenlynPerson('arglwydd-arfordir', 'Arglwydd Arfordir', 'male', '1632', '1698'),
    serenlynPerson('hedd-gwenyen', 'Hedd Gwenyen', 'female', '1634', '1677', {
      houseId: 'house-gwenyen',
      familyRole: 'married'
    }),
    serenlynPerson('arglwyddes-arfordir', 'Arglwyddes Arfordir', 'female', '1632', '1711', {
      title: 'Wegverheiratet an Haus Mochdaer',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('marmaduke-mochdaer', 'Marmaduke Mochdaer', 'male', '1631', '1692', {
      houseId: 'house-mochdaer-gwyliau',
      familyRole: 'married'
    }),
    serenlynPerson('grugyn-arfordir', 'Grugyn Arfordir', 'male', '1635', '1701'),
    serenlynPerson('lunet-morgryn', 'Lunet Morgryn', 'female', '1636', '1710', {
      houseId: 'house-morgryn',
      familyRole: 'married'
    }),

    serenlynPerson('thalen-arfordir', 'Thalen Arfordir', 'male', '1654', '1720', {
      title: 'Letzter Graf von Serenlyn'
    }),
    serenlynPerson('aigneis-dublais', 'Aignéis Dublais', 'female', '1655', '1706', {
      houseId: 'house-dublais',
      familyRole: 'married'
    }),
    serenlynPerson('llewella-arfordir', 'Llewella Arfordir', 'female', '1652', '1700', {
      title: 'Wegverheiratet an Haus Drewi',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('maxen-drewi', 'Maxen Drewi', 'male', '1651', '1709', {
      houseId: 'house-drewi',
      familyRole: 'married'
    }),
    serenlynPerson('endellion-arfordir', 'Endellion Arfordir', 'male', '1656', '1720'),
    serenlynPerson('dalvin-bochdew', 'Dalvin Bochdew', 'female', '1652', '1717', {
      houseId: 'house-bochdew',
      familyRole: 'married'
    }),
    serenlynPerson('cadfan-arfordir', 'Cadfan Arfordir', 'male', '1658', '1720'),
    serenlynPerson('tegin-morlais', 'Tegin Morlais', 'female', '1660', '1720', {
      houseId: 'house-morlais',
      familyRole: 'married'
    }),

    serenlynPerson('leodegrance-arfordir', 'Leodegrance Arfordir', 'male', '1675', '', {
      lineageRole: 'head',
      title: 'Begründer und Ritterfürst der Aberdail-Linie seit 1720',
      notes: 'Leodegrance bleibt als Sohn Thalens und Aignéis in Serenlyn sichtbar. Seine Nachkommen werden ausschließlich in der verknüpften Aberdail-Akte fortgeführt.'
    }),
    serenlynPerson('cryl-trachwyll', 'Cryl Trachwyll', 'female', '1676', '1700', {
      houseId: 'house-trachwyll',
      familyRole: 'married'
    }),
    serenlynPerson('luc-arfordir', 'Luc Arfordir', 'male', '1677', '', {
      title: 'Bruder Leodegrances · Mitbegründer der Aberdail-Linie',
      notes: 'Luc beginnt gemeinsam mit Leodegrance die neue Linie. Seine Nachkommen werden ausschließlich in der Aberdail-Akte fortgeführt.'
    }),
    serenlynPerson('arianrhod-gwaedlyd', 'Arianrhod Gwaedlyd', 'female', '1677', '', {
      houseId: 'house-gwaedlyd',
      familyRole: 'married'
    }),
    serenlynPerson('lowri-arfordir', 'Lowri Arfordir', 'female', '1677', '1730', {
      title: 'Wegverheiratet an Haus Dianc',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('carantec-dianc', 'Carantec Dianc', 'male', '1672', '1720', {
      houseId: 'house-dianc',
      familyRole: 'married'
    }),
    serenlynPerson('jowna-arfordir', 'Jowna Arfordir', 'female', '1680', '1696', {
      title: 'Wegverheiratet an Haus Arth',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('griff-arth', 'Griff Arth', 'male', '1680', '1696', {
      houseId: 'house-arth',
      familyRole: 'married'
    }),
    serenlynPerson('eiddon-arfordir', 'Eiddon Arfordir', 'male', '1679', '1720'),
    serenlynPerson('jenita-blodeuwedd', 'Jenita Blodeuwedd', 'female', '1680', '1720', {
      houseId: 'house-blodeuwedd',
      familyRole: 'married'
    }),
    serenlynPerson('malltwyn-arfordir', 'Malltwyn Arfordir', 'female', '1698', '1720', {
      title: 'Wegverheiratet an Haus Morgryn',
      tags: ['Wegverheiratet']
    }),
    serenlynPerson('maldwyn-morgryn', 'Maldwyn Morgryn', 'male', '1694', '1720', {
      houseId: 'house-morgryn',
      familyRole: 'married'
    }),
    serenlynPerson('trevor-1702-arfordir', 'Trevor Arfordir', 'male', '1702', '1720')
  ],
  partnerships: [
    endedMarriage('marriage-tudurwen-ysbryd', ...ORIGIN_PARTNERS.founders),
    endedMarriage('marriage-gwyneth-seissylwch-blaidd', ...ORIGIN_PARTNERS.seissylwch, '1635'),
    endedMarriage('marriage-merfin-elus', ...ORIGIN_PARTNERS.elus, '1661'),
    endedMarriage('marriage-jenifrydd-newyddllyn-dianc', ...ORIGIN_PARTNERS.newyddllyn, '1659'),
    endedMarriage('marriage-meiriona-llaesgwynyn-walwrs', ...ORIGIN_PARTNERS.meiriona, '1680'),
    endedMarriage('marriage-trevor-larna-arfordir', ...ORIGIN_PARTNERS.trevor, '1675'),
    endedMarriage('marriage-arglwydd-hedd-arfordir', ...ORIGIN_PARTNERS.arglwydd, '1677'),
    endedMarriage('marriage-marmaduke-arglwyddes-mochdaer', ...ORIGIN_PARTNERS.arglwyddes, '1692'),
    endedMarriage('marriage-grugyn-lunet-arfordir', ...ORIGIN_PARTNERS.grugyn, '1701'),
    endedMarriage('marriage-thalen-aigneis-arfordir', ...ORIGIN_PARTNERS.thalen, '1706'),
    endedMarriage('marriage-llewella-maxen-drewi', ...ORIGIN_PARTNERS.llewella, '1700'),
    endedMarriage('marriage-endellion-dalvin-bochdew', ...ORIGIN_PARTNERS.endellion, '1717'),
    endedMarriage('marriage-cadfan-tegin-arfordir', ...ORIGIN_PARTNERS.cadfan, '1720'),
    endedMarriage('marriage-leodegrance-cryl-arfordir', ...ORIGIN_PARTNERS.leodegrance, '1700'),
    createMarriage('marriage-arianrhod-luc-arfordir', ...ORIGIN_PARTNERS.luc),
    endedMarriage('marriage-carantec-lowri-dianc', ...ORIGIN_PARTNERS.lowri, '1720'),
    createMarriage('engagement-griff-jowna', ...ORIGIN_PARTNERS.jowna, {
      type: 'engagement',
      status: 'ended',
      end: '1696'
    }),
    endedMarriage('marriage-eiddon-jenita-arfordir', ...ORIGIN_PARTNERS.eiddon, '1720'),
    endedMarriage('marriage-malltwyn-maldwyn-morgryn', ...ORIGIN_PARTNERS.malltwyn, '1720')
  ],
  parentages: [
    ...childrenOf(['seissylwch-arfordir', 'eurolwyn-arfordir', 'elus-arfordir'], ORIGIN_PARTNERS.founders, 'marriage-tudurwen-ysbryd', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Zwischen dem Gründerpaar und den ab 1589 belegten Kindern liegen nicht einzeln überlieferte Generationen.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['newyddllyn-arfordir', 'meiriona-arfordir', 'trevor-arfordir'], ORIGIN_PARTNERS.seissylwch, 'marriage-gwyneth-seissylwch-blaidd'),
    ...childrenOf(['arglwydd-arfordir', 'arglwyddes-arfordir'], ORIGIN_PARTNERS.newyddllyn, 'marriage-jenifrydd-newyddllyn-dianc'),
    ...childrenOf(['grugyn-arfordir'], ORIGIN_PARTNERS.trevor, 'marriage-trevor-larna-arfordir'),
    ...childrenOf(['thalen-arfordir', 'llewella-arfordir'], ORIGIN_PARTNERS.arglwydd, 'marriage-arglwydd-hedd-arfordir'),
    ...childrenOf(['endellion-arfordir', 'cadfan-arfordir'], ORIGIN_PARTNERS.grugyn, 'marriage-grugyn-lunet-arfordir'),
    ...childrenOf(['leodegrance-arfordir', 'luc-arfordir', 'lowri-arfordir', 'jowna-arfordir'], ORIGIN_PARTNERS.thalen, 'marriage-thalen-aigneis-arfordir'),
    ...childrenOf(['eiddon-arfordir'], ORIGIN_PARTNERS.cadfan, 'marriage-cadfan-tegin-arfordir'),
    ...childrenOf(['malltwyn-arfordir', 'trevor-1702-arfordir'], ORIGIN_PARTNERS.eiddon, 'marriage-eiddon-jenita-arfordir')
  ],
  cadetBranches: [
    marriedAway('married-away-elus-arfordir-pysgod', 'Haus Pysgod', 'marriage-merfin-elus', 'house-pysgod', 'haus-pysgod', HOUSE_EMBLEMS.pysgod),
    marriedAway('married-away-meiriona-arfordir-walwrs', 'Haus Walwrs', 'marriage-meiriona-llaesgwynyn-walwrs', 'house-walwrs', 'haus-walwrs', HOUSE_EMBLEMS.walwrs),
    marriedAway('married-away-arglwyddes-arfordir-mochdaer', "Haus Mochdaer O'Gwyliau", 'marriage-marmaduke-arglwyddes-mochdaer', 'house-mochdaer-gwyliau', 'haus-mochdaer', HOUSE_EMBLEMS.mochdaer),
    marriedAway('married-away-llewella-arfordir-drewi', 'Haus Drewi', 'marriage-llewella-maxen-drewi', 'house-drewi', 'haus-drewi'),
    marriedAway('married-away-lowri-arfordir-dianc', "Haus Dianc O'Gwynlann", 'marriage-carantec-lowri-dianc', 'house-dianc', 'haus-dianc', HOUSE_EMBLEMS.dianc),
    marriedAway('married-away-jowna-arfordir-arth', 'Haus Arth', 'engagement-griff-jowna', 'house-arth', 'haus-arth', HOUSE_EMBLEMS.arth),
    marriedAway('married-away-malltwyn-arfordir-morgryn', 'Haus Morgryn', 'marriage-malltwyn-maldwyn-morgryn', 'house-morgryn', 'haus-morgryn'),
    createMigrationHouseBranch({
      id: 'migration-leodegrance-arfordir-aberdail',
      name: "Haus Arfordir O'Aberdail",
      parentPersonId: 'leodegrance-arfordir',
      houseId: ABERDAIL_HOUSE_ID,
      targetFamilyId: 'haus-arfordir-aberdail',
      emblem: ARFORDIR_EMBLEM,
      founded: '1720',
      subtitle: 'Von Leodegrance und seinem Bruder Luc begonnene Ritterfürstenlinie',
      crestFrame: 'gold',
      extensions: { offshootPlacement: 'below' },
      notes: 'Der sichtbare Übergang hängt geradlinig unter Leodegrance. Die Zielakte setzt einen gemeinsamen Herkunftsknoten über Leodegrance und Luc, sodass beide Brüder die neue Linie beginnen und ihre Kinder nicht doppelt erscheinen.'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-tudurwen-ysbryd',
      sharedParentPartnershipIds: [],
      childIds: ['seissylwch-arfordir', 'eurolwyn-arfordir', 'elus-arfordir'],
      years: 0,
      fromYear: '????',
      toYear: '1589',
      label: 'Die belegte Linie setzt 1589 wieder ein',
      notes: 'Absoluter Generationentrenner: Gründerpaar, Hausknoten, genau ein serieller Zeitsprung und erst danach die drei belegten Geschwister.'
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-tudurwen-ysbryd',
    houseId: SERENLYN_HOUSE_ID,
    crestSubtitle: 'Altes vennyrianisches Grafenhaus von Serenlyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ysbryd-arfordir',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    originLine: true,
    successorFamilyId: 'haus-arfordir-aberdail',
    sourceRevision: 2,
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Getrennte Serenlyn-Herkunftsakte nach der Arfordir-Tabelle. Das alte Haus wird seinem vennyrianischen Grafenrang entsprechend geführt. Ysbryd und Tudurwen tragen Hausknoten und seriellen Zeitsprung; alle historischen Nebenäste und Wegverheiratungen bleiben sichtbar. Leodegrance und Luc erscheinen hier als Brüder unter Thalen und Aignéis, ihre Kinder dagegen ausschließlich in der Aberdail-Akte.'
  }
});

const ABERDAIL_PARTNERS = Object.freeze({
  leodegrance: ['leodegrance-arfordir', 'cryl-trachwyll'],
  luc: ['arianrhod-gwaedlyd', 'luc-arfordir'],
  micah: ['meggan-blodyn', 'micah-arfordir'],
  madoc: ['glesni-crafanc', 'madoc-arfordir'],
  meredithe: ['taran-blaidd', 'meredithe-arfordir'],
  morgana: ['yale-lyfant', 'morgana-arfordir']
});

export const HOUSE_ARFORDIR_ABERDAIL_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-arfordir-aberdail',
    title: "Haus Arfordir O'Aberdail",
    motto: '',
    description: 'Die seit 1720 getrennt geführte Ritterfürstenlinie von Aberdail. Leodegrance und sein Bruder Luc stehen gemeinsam am Beginn; ihre Kinder folgen eindeutig unter der jeweils richtigen Ehe.',
    emblem: ARFORDIR_EMBLEM,
    houseProfile: KLAUENINSEL_HOUSE_PROFILES.arfordir
  },
  houses: [...ABERDAIL_HOUSES],
  persons: [
    aberdailPerson('leodegrance-arfordir', 'Leodegrance Arfordir', 'male', '1675', '', {
      lineageRole: 'head',
      title: 'Gründer und Ritterfürst von Aberdail seit 1720'
    }),
    aberdailPerson('cryl-trachwyll', 'Cryl Trachwyll', 'female', '1676', '1700', {
      houseId: 'house-trachwyll',
      familyRole: 'married'
    }),
    aberdailPerson('luc-arfordir', 'Luc Arfordir', 'male', '1677', '', {
      title: 'Bruder Leodegrances · Mitbegründer der Aberdail-Linie'
    }),
    aberdailPerson('arianrhod-gwaedlyd', 'Arianrhod Gwaedlyd', 'female', '1677', '', {
      houseId: 'house-gwaedlyd',
      familyRole: 'married'
    }),

    aberdailPerson('micah-arfordir', 'Micah Arfordir', 'male', '1695', '', {
      lineageRole: 'mainline',
      title: 'Erster Erbe des Hauses Arfordir'
    }),
    aberdailPerson('meggan-blodyn', 'Meggan Blodyn', 'female', '1700', '', {
      houseId: 'house-blodyn',
      familyRole: 'married'
    }),
    aberdailPerson('madoc-arfordir', 'Madoc Arfordir', 'male', '1700', ''),
    aberdailPerson('glesni-crafanc', 'Glesni Crafanc', 'female', '1697', '', {
      houseId: 'house-crafanc',
      familyRole: 'married'
    }),
    aberdailPerson('meredithe-arfordir', 'Meredithe Arfordir', 'female', '1698', '', {
      title: "Wegverheiratet an Haus Blaidd O'Tredegar",
      tags: ['Wegverheiratet']
    }),
    aberdailPerson('taran-blaidd', 'Taran Blaidd', 'male', '1694', '', {
      houseId: 'house-blaidd-tredegar',
      familyRole: 'married'
    }),
    aberdailPerson('morgana-arfordir', 'Morgana Arfordir', 'female', '1698', '', {
      title: "Wegverheiratet an Haus Lyfant O'Caer Asgwrn",
      tags: ['Wegverheiratet']
    }),
    aberdailPerson('yale-lyfant', 'Yale Lyfant', 'male', '1696', '', {
      houseId: 'house-lyfant-caer-asgwrn',
      familyRole: 'married'
    }),

    aberdailPerson('heston-arfordir', 'Heston Arfordir', 'male', '1719', '', {
      lineageRole: 'mainline',
      title: 'Zweiter Erbe des Hauses Arfordir'
    }),
    aberdailPerson('reece-arfordir', 'Reece Arfordir', 'male', '1722', ''),
    aberdailPerson('huw-arfordir', 'Huw Arfordir', 'male', '1721', ''),
    aberdailPerson('roderick-arfordir', 'Roderick Arfordir', 'male', '1723', '')
  ],
  partnerships: [
    endedMarriage('marriage-leodegrance-cryl-arfordir', ...ABERDAIL_PARTNERS.leodegrance, '1700'),
    createMarriage('marriage-arianrhod-luc-arfordir', ...ABERDAIL_PARTNERS.luc),
    createMarriage('marriage-meggan-micah', ...ABERDAIL_PARTNERS.micah),
    createMarriage('marriage-glesni-madoc-crafanc', ...ABERDAIL_PARTNERS.madoc),
    createMarriage('marriage-taran-meredithe-blaidd', ...ABERDAIL_PARTNERS.meredithe),
    createMarriage('marriage-yale-morgana-lyfant', ...ABERDAIL_PARTNERS.morgana)
  ],
  parentages: [
    ...childrenOf(['micah-arfordir', 'madoc-arfordir'], ABERDAIL_PARTNERS.leodegrance, 'marriage-leodegrance-cryl-arfordir'),
    ...childrenOf(['meredithe-arfordir', 'morgana-arfordir'], ABERDAIL_PARTNERS.luc, 'marriage-arianrhod-luc-arfordir'),
    ...childrenOf(['heston-arfordir', 'reece-arfordir'], ABERDAIL_PARTNERS.micah, 'marriage-meggan-micah'),
    ...childrenOf(['huw-arfordir', 'roderick-arfordir'], ABERDAIL_PARTNERS.madoc, 'marriage-glesni-madoc-crafanc')
  ],
  cadetBranches: [
    marriedAway('married-away-meredithe-arfordir-blaidd', "Haus Blaidd O'Tredegar", 'marriage-taran-meredithe-blaidd', 'house-blaidd-tredegar', 'haus-blaidd-tredegar', HOUSE_EMBLEMS.blaidd),
    marriedAway('married-away-morgana-arfordir-lyfant', "Haus Lyfant O'Caer Asgwrn", 'marriage-yale-morgana-lyfant', 'house-lyfant-caer-asgwrn', 'haus-lyfant-caer-asgwrn', HOUSE_EMBLEMS.lyfant)
  ],
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
      id: 'arfordir-serenlyn-origin',
      houseId: SERENLYN_HOUSE_ID,
      name: "Haus Arfordir O'Serenlyn",
      subtitle: 'Vennyrianisches Grafenhaus · Umsiedlung nach Aberdail 1720',
      emblem: ARFORDIR_EMBLEM,
      emblemScale: 0.86,
      crestFrame: 'gold',
      frameScale: 1,
      childIds: ['leodegrance-arfordir', 'luc-arfordir'],
      targetFamilyId: 'haus-arfordir',
      notes: 'Ein gemeinsamer Herkunftsknoten steht geradlinig über den Brüdern Leodegrance und Luc. Die Kinder beider Brüder folgen ausschließlich unter ihrer jeweiligen Ehe.'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'leodegrance-arfordir',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    originFamilyId: 'haus-arfordir',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote'],
    registryManagedLineageFields: ['founderPartnershipId', 'houseId', 'originHouse'],
    registryManagedViewFields: ['focusPersonId', 'ancestorDepth', 'descendantDepth', 'limitGenerations', 'showSiblings'],
    sourceNote: 'Aberdail-Akte mit gemeinsamem Serenlyn-Herkunftsknoten über Leodegrance und Luc. Micah und Madoc sind Kinder Leodegrances und Cryls; Meredithe und Morgana sind Kinder Lucs und Arianrhods. Heston und Reece folgen unter Micah und Meggan, Huw und Roderick unter Madoc und Glesni. Die in fremden Häusern fortgeführten Kinder Meredithes und Morganas werden hier bewusst nicht gedoppelt.'
  }
});

export const ARFORDIR_HOUSE_FAMILIES = Object.freeze([
  HOUSE_ARFORDIR_SERENLYN_FAMILY,
  HOUSE_ARFORDIR_ABERDAIL_FAMILY
]);
