import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_MWYALCHEN_PORTRAITS } from './house-mwyalchen-portraits.js';
import { SILBERINSEL_HOUSE_EMBLEMS } from './silberinsel-house-profiles.js';
import {
  TAL_DER_MILANE_HOUSE_EMBLEMS,
  TAL_DER_MILANE_HOUSE_PROFILES
} from './tal-der-milane-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { WEIDEBUCHT_HOUSE_EMBLEMS } from './weidebucht-house-profiles.js';

const MWYALCHEN_HOUSE_ID = 'house-mwyalchen';
const MWYALCHEN_EMBLEM = TAL_DER_MILANE_HOUSE_EMBLEMS.mwyalchen;
const FOUNDER_TIME_JUMP_ID = 'gap-mwyalchen-agravaine-to-iorwerth';

const HOUSE_EMBLEMS = Object.freeze({
  aderyn: TAL_DER_MILANE_HOUSE_EMBLEMS.aderyn,
  arwydd: 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
  ciarog: AEHRENTAL_HOUSE_EMBLEMS.ciarog,
  dyngwn: VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn,
  eryr: TAL_DER_MILANE_HOUSE_EMBLEMS.eryr,
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gaeth: TAL_DER_MILANE_HOUSE_EMBLEMS.gaeth,
  hebog: TAL_DER_MILANE_HOUSE_EMBLEMS.hebog,
  hwyaden: WEIDEBUCHT_HOUSE_EMBLEMS.hwyaden,
  ilyuncu: TAL_DER_MILANE_HOUSE_EMBLEMS.ilyuncu,
  mwyalchen: MWYALCHEN_EMBLEM,
  pyrth: SILBERINSEL_HOUSE_EMBLEMS.pyrth,
  tylluan: TAL_DER_MILANE_HOUSE_EMBLEMS.tylluan,
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

const SUCCESSION_TITLES = Object.freeze({
  'agravaine-aderyn': 'Gründer und erster Ritterfürst des Hauses Mwyalchen',
  'iorwerth-mwyalchen': 'Ritterfürst des Hauses Mwyalchen bis 1647',
  'kelyddon-mwyalchen': 'Ritterfürst des Hauses Mwyalchen 1647–1653',
  'cadwallen-mwyalchen': 'Ritterfürst des Hauses Mwyalchen 1653–1690',
  'gwynham-mwyalchen': 'Ritterfürst des Hauses Mwyalchen 1690–1718',
  'agravaine-1673-mwyalchen': 'Ritterfürst des Hauses Mwyalchen seit 1718',
  'sheev-mwyalchen': 'Erster Erbe des Hauses Mwyalchen',
  'orbo-mwyalchen': 'Zweiter Erbe des Hauses Mwyalchen'
});

const HOUSE_HEAD_IDS = new Set([
  'agravaine-aderyn',
  'iorwerth-mwyalchen',
  'kelyddon-mwyalchen',
  'cadwallen-mwyalchen',
  'gwynham-mwyalchen',
  'agravaine-1673-mwyalchen'
]);

const HEIR_IDS = new Set(['sheev-mwyalchen', 'orbo-mwyalchen']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return HEIR_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? MWYALCHEN_HOUSE_ID : options.houseId;
  const portrait = HOUSE_MWYALCHEN_PORTRAITS[id] || '';
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait,
    familyRole: options.familyRole || (houseId === MWYALCHEN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    title: options.title === undefined ? SUCCESSION_TITLES[id] || '' : options.title,
    tags: options.tags || [],
    notes: options.notes || '',
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: SOURCE_MANAGED_PERSON_FIELDS
    }
  });
}

function spouse(id, name, sex, birth, death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId,
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), options.engaged ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function unknownBetrothed(id, sex, houseId) {
  return spouse(id, sex === 'male' ? 'Unbekannter Verlobter' : 'Unbekannte Verlobte', sex, '????', '', houseId, {
    status: 'unknown',
    title: 'Nicht namentlich überlieferte Verlobung',
    tags: ['Platzhalter', 'Verlobt']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function endedMarriage(id, firstId, secondId, end = '') {
  return createMarriage(id, firstId, secondId, {
    status: 'ended',
    end,
    extensions: { registryManagedFields: ['status', 'end'] }
  });
}

const COUPLES = Object.freeze({
  founders: ['agravaine-aderyn', 'thalena-1126-spouse'],
  iorwerth: ['iorwerth-mwyalchen', 'gwenfrewi-gaeth'],
  eirwyn: ['nodawl-aderyn', 'eirwyn-mwyalchen'],
  kelyddon: ['kelyddon-mwyalchen', 'malvina-hebog-mwyalchen'],
  eirian: ['wyndham-eryr', 'eirian-mwyalchen-eryr'],
  cadwallen: ['cadwallen-mwyalchen', 'moira-gairner'],
  adda: ['adda-mwyalchen', 'fachtna-suiste'],
  arglwydd: ['ceridwen-wyrm', 'arglwydd-mwyalchen'],
  gwynham: ['caradwyn-dyngwn', 'gwynham-mwyalchen'],
  arwyn: ['ysgonan-pyrth', 'arwyn-mwyalchen'],
  cieran: ['cieran-mwyalchen', 'ingrid-eldhari'],
  agravaine: ['agravaine-1673-mwyalchen', 'gwenog-gaeth'],
  carwyn: ['gruffyd-eryr', 'carwyn-mwyalchen-eryr'],
  gwalchgwyn: ['gwalchgwyn-mwyalchen', 'laragh-nessa'],
  niniel: ['ferydnand-gafyr', 'niniel-mwyalchen'],
  dadweir: ['orla-ciarog', 'daddweir-mwyalchen'],
  deliah: ['idris-arwydd', 'deliah-mwyalchen'],
  sheev: ['sheev-mwyalchen', 'rheanne-aderyn'],
  wynthonya: ['wynthonya-mwyalchen', 'erwm-draenog'],
  gwenhwyfar: ['gwilym-aderyn', 'gwenhwyfar-mwyalchen'],
  gwindor: ['gwindor-mwyalchen', 'gwenith-hwyaden'],
  tatumn: ['gwendal-tylluan', 'tatumn-mwyalchen'],
  gower: ['gower-mwyalchen', 'koritha-camoran'],
  naili: ['naili-mwyalchen', 'lwyd-pawen'],
  conway: ['conway-mwyalchen', 'chryl-hebog'],
  tirion: ['tirion-mwyalchen', 'bevan-ilyuncu'],
  orbo: ['orbo-mwyalchen', 'unknown-orbo-betrothed-mwyalchen'],
  aedd: ['aedd-mwyalchen', 'unknown-aedd-betrothed-mwyalchen'],
  mag: ['unknown-mag-betrothed-mwyalchen', 'mag-mwyalchen']
});

const PARTNERS_BY_ID = Object.freeze({
  'marriage-agravaine-thalena': COUPLES.founders,
  'marriage-iorwerth-gwenfrewi-mwyalchen': COUPLES.iorwerth,
  'marriage-nodawl-eirwyn': COUPLES.eirwyn,
  'marriage-kelyddon-malvina-mwyalchen': COUPLES.kelyddon,
  'marriage-wyndham-eirian-eryr': COUPLES.eirian,
  'marriage-cadwallen-moira-mwyalchen': COUPLES.cadwallen,
  'marriage-adda-fachtna-mwyalchen': COUPLES.adda,
  'marriage-ceridwen-arglwydd': COUPLES.arglwydd,
  'marriage-caradwyn-gwynham-dyngwn': COUPLES.gwynham,
  'marriage-ysgonan-arwyn-pyrth': COUPLES.arwyn,
  'marriage-cieran-ingrid-mwyalchen': COUPLES.cieran,
  'marriage-agravaine-gwenog-mwyalchen': COUPLES.agravaine,
  'marriage-gruffyd-carwyn-eryr': COUPLES.carwyn,
  'marriage-gwalchgwyn-laragh-mwyalchen': COUPLES.gwalchgwyn,
  'marriage-ferydnand-niniel': COUPLES.niniel,
  'marriage-orla-daddweir-ciarog': COUPLES.dadweir,
  'marriage-idris-deliah': COUPLES.deliah,
  'marriage-sheev-rheanne': COUPLES.sheev,
  'marriage-wynthonya-erwm-mwyalchen': COUPLES.wynthonya,
  'marriage-gwilym-gwenhwyfar': COUPLES.gwenhwyfar,
  'marriage-gwindor-gwenith-mwyalchen': COUPLES.gwindor,
  'marriage-gwendal-tatumn-tylluan': COUPLES.tatumn,
  'marriage-gower-koritha-mwyalchen': COUPLES.gower,
  'marriage-naili-lwyd-mwyalchen': COUPLES.naili,
  'marriage-conway-chryl-mwyalchen': COUPLES.conway,
  'engagement-tirion-bevan-mwyalchen': COUPLES.tirion,
  'engagement-orbo-unknown-mwyalchen': COUPLES.orbo,
  'engagement-aedd-unknown-mwyalchen': COUPLES.aedd,
  'engagement-mag-unknown-mwyalchen': COUPLES.mag
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'mwyalchen-parentage',
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
    notes: options.notes || ''
  });
}

export const HOUSE_MWYALCHEN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-mwyalchen',
    title: "Haus Mwyalchen O'Penbryn",
    motto: '',
    description: 'Ritterfürstlicher Kadettenzweig der Aderyn und Wächter der fruchtbaren Täler von Penbryn.',
    emblem: MWYALCHEN_EMBLEM,
    houseProfile: TAL_DER_MILANE_HOUSE_PROFILES.mwyalchen
  },
  houses: [
    house(MWYALCHEN_HOUSE_ID, "Haus Mwyalchen O'Penbryn", MWYALCHEN_EMBLEM),
    house('house-aderyn', "Haus Aderyn O'Penbryn", HOUSE_EMBLEMS.aderyn),
    house('house-gaeth', 'Haus Gaeth', HOUSE_EMBLEMS.gaeth),
    house('house-hebog', 'Haus Hebog', HOUSE_EMBLEMS.hebog),
    house('house-eryr', "Haus Eryr O'Penbryn", HOUSE_EMBLEMS.eryr),
    house('house-gairner', 'Haus Gáirner'),
    house('house-suiste', 'Haus Suiste'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-dyngwn', 'Haus Dyngwn', HOUSE_EMBLEMS.dyngwn),
    house('house-pyrth', 'Haus Pyrth', HOUSE_EMBLEMS.pyrth),
    house('house-eldhari', 'Haus Eldhári'),
    house('house-nessa', 'Haus Nessa'),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-ciarog', 'Haus Ciaróg', HOUSE_EMBLEMS.ciarog),
    house('house-arwydd', 'Haus Arwydd', HOUSE_EMBLEMS.arwydd),
    house('house-draenog', 'Haus Draenog', GRAUE_WEITE_HOUSE_EMBLEMS.draenog),
    house('house-hwyaden', 'Haus Hwyaden', HOUSE_EMBLEMS.hwyaden),
    house('house-tylluan', "Haus Tylluan O'Penbryn", HOUSE_EMBLEMS.tylluan),
    house('house-camoran', 'Haus Camoran'),
    house('house-pawen', 'Haus Pawen'),
    house('house-ilyuncu', 'Haus Ilyuncu', HOUSE_EMBLEMS.ilyuncu),
    house('house-unbekannt-orbo-mwyalchen', 'Unbekanntes Haus'),
    house('house-unbekannt-aedd-mwyalchen', 'Unbekanntes Haus'),
    house('house-unbekannt-mag-mwyalchen', 'Unbekanntes Haus')
  ],
  persons: [
    person('agravaine-aderyn', 'Agravaine Aderyn', 'male', '1123', '1209', {
      houseId: 'house-aderyn',
      familyRole: 'core'
    }),
    spouse('thalena-1126-spouse', 'Thalena', 'female', '1126', '1185', '', {
      title: 'Mitgründerin des Hauses Mwyalchen'
    }),

    person('iorwerth-mwyalchen', 'Iorwerth Mwyalchen', 'male', '1584', '1647'),
    awayWoman('eirwyn-mwyalchen', 'Eirwyn Mwyalchen', '1585', '1644', 'Haus Aderyn'),
    spouse('gwenfrewi-gaeth', 'Gwenfrewi Gaeth', 'female', '1587', '1679', 'house-gaeth'),
    spouse('nodawl-aderyn', 'Nodawl Aderyn', 'male', '1584', '1629', 'house-aderyn', {
      title: 'Graf des Tals der Milane bis 1629'
    }),

    person('kelyddon-mwyalchen', 'Kelyddon Mwyalchen', 'male', '1607', '1653'),
    awayWoman('eirian-mwyalchen-eryr', 'Eirian Mwyalchen', '1615', '1656', 'Haus Eryr'),
    spouse('malvina-hebog-mwyalchen', 'Malvina Hebog O’Talwyn', 'female', '1610', '1663', 'house-hebog'),
    spouse('wyndham-eryr', 'Wyndham Eryr', 'male', '1615', '1663', 'house-eryr'),

    person('cadwallen-mwyalchen', 'Cadwallen Mwyalchen', 'male', '1628', '1690'),
    awayWoman('adda-mwyalchen', 'Adda Mwyalchen', '1630', '????', 'Haus Suiste'),
    person('arglwydd-mwyalchen', 'Arglwydd Mwyalchen', 'male', '1634', '1698'),
    spouse('moira-gairner', 'Moira Gáirner', 'female', '????', '????', 'house-gairner'),
    spouse('fachtna-suiste', 'Fachtna Suiste', 'male', '1629', '????', 'house-suiste'),
    spouse('ceridwen-wyrm', 'Ceridwen Wyrm', 'female', '1636', '1689', 'house-wyrm'),

    person('gwynham-mwyalchen', 'Gwynham Mwyalchen', 'male', '1650', '1718'),
    awayWoman('arwyn-mwyalchen', 'Arwyn Mwyalchen', '1654', '1724', 'Haus Pyrth'),
    person('cieran-mwyalchen', 'Cieran Mwyalchen', 'male', '1655', '????'),
    spouse('caradwyn-dyngwn', 'Caradwyn Dyngwn', 'female', '1653', '1711', 'house-dyngwn'),
    spouse('ysgonan-pyrth', 'Ysgonan Pyrth', 'male', '1652', '1723', 'house-pyrth'),
    spouse('ingrid-eldhari', 'Ingrid Eldhári', 'female', '1655', '????', 'house-eldhari'),

    person('agravaine-1673-mwyalchen', 'Agravaine Mwyalchen', 'male', '1673', ''),
    awayWoman('carwyn-mwyalchen-eryr', 'Carwyn Mwyalchen', '1675', '', 'Haus Eryr'),
    person('gwalchgwyn-mwyalchen', 'Gwalchgwyn Mwyalchen', 'male', '1676', ''),
    awayWoman('niniel-mwyalchen', 'Niniel Mwyalchen', '1678', '', 'Haus Gafyr'),
    person('daddweir-mwyalchen', 'Daddweir Mwyalchen', 'male', '1673', '1720', {
      notes: 'Die Mwyalchen-Quelle schreibt den Vornamen Dadweir; die bestehende Ciaróg-Gegenakte führt dieselbe Weltperson kanonisch als Daddweir.'
    }),
    awayWoman('deliah-mwyalchen', 'Deliah Mwyalchen', '1675', '', 'Haus Arwydd', {
      worldPersonId: 'person--haus-arwydd--deliah-mwyalchen'
    }),
    spouse('gwenog-gaeth', 'Gwenog Gaeth', 'female', '1676', '', 'house-gaeth'),
    spouse('gruffyd-eryr', 'Gruffyd Eryr', 'male', '1673', '1734', 'house-eryr'),
    spouse('laragh-nessa', 'Laragh Nessa', 'female', '1677', '1720', 'house-nessa'),
    spouse('ferydnand-gafyr', 'Ferydnand Gafyr', 'male', '1674', '', 'house-gafyr'),
    spouse('orla-ciarog', 'Orla Ciaróg', 'female', '1674', '1713', 'house-ciarog'),
    spouse('idris-arwydd', 'Idris Arwydd', 'male', '1672', '', 'house-arwydd'),

    person('sheev-mwyalchen', 'Sheev Mwyalchen', 'male', '1696', ''),
    awayWoman('wynthonya-mwyalchen', 'Wynthonya Mwyalchen', '1699', '', 'Haus Draenog'),
    awayWoman('gwenhwyfar-mwyalchen', 'Gwenhwyfar Mwyalchen', '1700', '', 'Haus Aderyn'),
    person('gwindor-mwyalchen', 'Gwindor Mwyalchen', 'male', '1702', ''),
    awayWoman('tatumn-mwyalchen', 'Tatumn Mwyalchen', '1696', '', 'Haus Tylluan'),
    person('gower-mwyalchen', 'Gower Mwyalchen', 'male', '1695', ''),
    awayWoman('naili-mwyalchen', 'Naili Mwyalchen', '1697', '', 'Haus Pawen'),
    person('conway-mwyalchen', 'Conway Mwyalchen', 'male', '1699', ''),
    spouse('rheanne-aderyn', 'Rheanne Aderyn', 'female', '1701', '', 'house-aderyn'),
    spouse('erwm-draenog', 'Erwm Draenog', 'male', '1697', '', 'house-draenog'),
    spouse('gwilym-aderyn', 'Gwilym Aderyn', 'male', '1699', '', 'house-aderyn'),
    spouse('gwenith-hwyaden', 'Gwenith Hwyaden', 'female', '1703', '', 'house-hwyaden'),
    spouse('gwendal-tylluan', 'Gwendal Tylluan', 'male', '1696', '', 'house-tylluan'),
    spouse('koritha-camoran', 'Koritha Camoran', 'female', '1698', '', 'house-camoran'),
    spouse('lwyd-pawen', 'Lwyd Pawen', 'male', '1697', '', 'house-pawen'),
    spouse('chryl-hebog', 'Chryl Hebog', 'female', '1701', '', 'house-hebog'),

    person('tirion-mwyalchen', 'Tirion Mwyalchen', 'female', '1720', '', {
      title: 'Wegverlobt an Haus Ilyuncu',
      tags: ['Wegverlobt']
    }),
    person('orbo-mwyalchen', 'Orbo Mwyalchen', 'male', '1722', ''),
    person('aedd-mwyalchen', 'Aedd Mwyalchen', 'male', '1718', ''),
    awayWoman('mag-mwyalchen', 'Mag Mwyalchen', '1721', '', 'ein unbekanntes Haus', {
      engaged: true,
      title: 'Wegverlobt an ein unbekanntes Haus'
    }),
    person('mithlas-camoran', 'Mithlas Camoran', 'male', '1723', '', {
      houseId: 'house-camoran',
      familyRole: 'ward',
      title: 'Aufgenommenes Mündel Gwindors',
      tags: ['Mündel', 'Aufgenommen'],
      notes: 'Mithlas wird laut Quelle als Gwindors aufgenommenes Mündel geführt.'
    }),
    person('gloyw-mwyalchen', 'Gloyw Mwyalchen', 'male', '1721', ''),
    person('cloi-mwyalchen', 'Cloi Mwyalchen', 'female', '1723', ''),
    person('enid-mwyalchen', 'Enid Mwyalchen', 'female', '1724', ''),
    person('ieuan-mwyalchen', 'Ieuan Mwyalchen', 'male', '1722', ''),
    spouse('bevan-ilyuncu', 'Bevan Ilyuncu', 'male', '1721', '', 'house-ilyuncu'),
    unknownBetrothed('unknown-orbo-betrothed-mwyalchen', 'female', 'house-unbekannt-orbo-mwyalchen'),
    unknownBetrothed('unknown-aedd-betrothed-mwyalchen', 'female', 'house-unbekannt-aedd-mwyalchen'),
    unknownBetrothed('unknown-mag-betrothed-mwyalchen', 'male', 'house-unbekannt-mag-mwyalchen')
  ],
  partnerships: [
    createMarriage('marriage-agravaine-thalena', ...COUPLES.founders),
    endedMarriage('marriage-iorwerth-gwenfrewi-mwyalchen', ...COUPLES.iorwerth, '1647'),
    createMarriage('marriage-nodawl-eirwyn', ...COUPLES.eirwyn),
    endedMarriage('marriage-kelyddon-malvina-mwyalchen', ...COUPLES.kelyddon, '1653'),
    endedMarriage('marriage-wyndham-eirian-eryr', ...COUPLES.eirian, '1656'),
    endedMarriage('marriage-cadwallen-moira-mwyalchen', ...COUPLES.cadwallen, '1690'),
    endedMarriage('marriage-adda-fachtna-mwyalchen', ...COUPLES.adda),
    createMarriage('marriage-ceridwen-arglwydd', ...COUPLES.arglwydd),
    createMarriage('marriage-caradwyn-gwynham-dyngwn', ...COUPLES.gwynham),
    endedMarriage('marriage-ysgonan-arwyn-pyrth', ...COUPLES.arwyn, '1723'),
    endedMarriage('marriage-cieran-ingrid-mwyalchen', ...COUPLES.cieran),
    createMarriage('marriage-agravaine-gwenog-mwyalchen', ...COUPLES.agravaine),
    endedMarriage('marriage-gruffyd-carwyn-eryr', ...COUPLES.carwyn, '1734'),
    endedMarriage('marriage-gwalchgwyn-laragh-mwyalchen', ...COUPLES.gwalchgwyn, '1720'),
    createMarriage('marriage-ferydnand-niniel', ...COUPLES.niniel),
    createMarriage('marriage-orla-daddweir-ciarog', ...COUPLES.dadweir),
    createMarriage('marriage-idris-deliah', ...COUPLES.deliah),
    createMarriage('marriage-sheev-rheanne', ...COUPLES.sheev),
    createMarriage('marriage-wynthonya-erwm-mwyalchen', ...COUPLES.wynthonya),
    createMarriage('marriage-gwilym-gwenhwyfar', ...COUPLES.gwenhwyfar),
    createMarriage('marriage-gwindor-gwenith-mwyalchen', ...COUPLES.gwindor),
    createMarriage('marriage-gwendal-tatumn-tylluan', ...COUPLES.tatumn),
    createMarriage('marriage-gower-koritha-mwyalchen', ...COUPLES.gower),
    createMarriage('marriage-naili-lwyd-mwyalchen', ...COUPLES.naili),
    createMarriage('marriage-conway-chryl-mwyalchen', ...COUPLES.conway),
    createMarriage('engagement-tirion-bevan-mwyalchen', ...COUPLES.tirion, { type: 'engagement' }),
    createMarriage('engagement-orbo-unknown-mwyalchen', ...COUPLES.orbo, { type: 'engagement' }),
    createMarriage('engagement-aedd-unknown-mwyalchen', ...COUPLES.aedd, { type: 'engagement' }),
    createMarriage('engagement-mag-unknown-mwyalchen', ...COUPLES.mag, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['iorwerth-mwyalchen', 'eirwyn-mwyalchen'], 'marriage-agravaine-thalena', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Iorwerth und Eirwyn.',
      extensions: { timeJumpId: FOUNDER_TIME_JUMP_ID }
    }),
    ...childrenOf(['kelyddon-mwyalchen', 'eirian-mwyalchen-eryr'], 'marriage-iorwerth-gwenfrewi-mwyalchen'),
    ...childrenOf(['cadwallen-mwyalchen', 'adda-mwyalchen', 'arglwydd-mwyalchen'], 'marriage-kelyddon-malvina-mwyalchen'),
    ...childrenOf(['gwynham-mwyalchen', 'arwyn-mwyalchen'], 'marriage-cadwallen-moira-mwyalchen'),
    ...childrenOf(['cieran-mwyalchen'], 'marriage-ceridwen-arglwydd'),
    ...childrenOf(
      ['agravaine-1673-mwyalchen', 'carwyn-mwyalchen-eryr', 'gwalchgwyn-mwyalchen', 'niniel-mwyalchen'],
      'marriage-caradwyn-gwynham-dyngwn'
    ),
    ...childrenOf(['daddweir-mwyalchen', 'deliah-mwyalchen'], 'marriage-cieran-ingrid-mwyalchen'),
    ...childrenOf(
      ['sheev-mwyalchen', 'wynthonya-mwyalchen', 'gwenhwyfar-mwyalchen', 'gwindor-mwyalchen'],
      'marriage-agravaine-gwenog-mwyalchen'
    ),
    ...childrenOf(['tatumn-mwyalchen'], 'marriage-gwalchgwyn-laragh-mwyalchen'),
    ...childrenOf(['gower-mwyalchen', 'naili-mwyalchen', 'conway-mwyalchen'], 'marriage-orla-daddweir-ciarog'),
    ...childrenOf(['tirion-mwyalchen', 'orbo-mwyalchen'], 'marriage-sheev-rheanne'),
    ...childrenOf(['aedd-mwyalchen', 'mag-mwyalchen'], 'marriage-gwindor-gwenith-mwyalchen'),
    ...createParentages(['mithlas-camoran'], ['gwindor-mwyalchen'], '', {
      idPrefix: 'mwyalchen-foster-parentage',
      type: 'foster',
      certainty: 'confirmed',
      notes: 'Mithlas Camoran wurde Gwindor Mwyalchen als Mündel anvertraut.'
    }),
    ...childrenOf(['gloyw-mwyalchen', 'cloi-mwyalchen', 'enid-mwyalchen'], 'marriage-gower-koritha-mwyalchen'),
    ...childrenOf(['ieuan-mwyalchen'], 'marriage-conway-chryl-mwyalchen')
  ],
  cadetBranches: [
    marriedAway('married-away-eirwyn-mwyalchen-aderyn', 'Haus Aderyn', 'marriage-nodawl-eirwyn', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-eirian-mwyalchen-eryr', 'Haus Eryr', 'marriage-wyndham-eirian-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-adda-mwyalchen-suiste', 'Haus Suiste', 'marriage-adda-fachtna-mwyalchen', 'house-suiste'),
    marriedAway('married-away-arwyn-mwyalchen-pyrth', 'Haus Pyrth', 'marriage-ysgonan-arwyn-pyrth', 'house-pyrth', HOUSE_EMBLEMS.pyrth),
    marriedAway('married-away-carwyn-mwyalchen-eryr', 'Haus Eryr', 'marriage-gruffyd-carwyn-eryr', 'house-eryr', HOUSE_EMBLEMS.eryr),
    marriedAway('married-away-niniel-mwyalchen-gafyr', 'Haus Gafyr', 'marriage-ferydnand-niniel', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-deliah-mwyalchen-arwydd', 'Haus Arwydd', 'marriage-idris-deliah', 'house-arwydd', HOUSE_EMBLEMS.arwydd),
    marriedAway('married-away-wynthonya-mwyalchen-draenog', 'Haus Draenog', 'marriage-wynthonya-erwm-mwyalchen', 'house-draenog'),
    marriedAway('married-away-gwenhwyfar-mwyalchen-aderyn', 'Haus Aderyn', 'marriage-gwilym-gwenhwyfar', 'house-aderyn', HOUSE_EMBLEMS.aderyn),
    marriedAway('married-away-tatumn-mwyalchen-tylluan', 'Haus Tylluan', 'marriage-gwendal-tatumn-tylluan', 'house-tylluan', HOUSE_EMBLEMS.tylluan),
    marriedAway('married-away-naili-mwyalchen-pawen', 'Haus Pawen', 'marriage-naili-lwyd-mwyalchen', 'house-pawen'),
    marriedAway('engaged-away-tirion-mwyalchen-ilyuncu', 'Haus Ilyuncu', 'engagement-tirion-bevan-mwyalchen', 'house-ilyuncu', HOUSE_EMBLEMS.ilyuncu, {
      subtitle: 'Wegverlobt an Haus Ilyuncu'
    }),
    marriedAway('engaged-away-mag-mwyalchen-unknown', 'Unbekanntes Haus', 'engagement-mag-unknown-mwyalchen', 'house-unbekannt-mag-mwyalchen', '', {
      targetFamilyId: 'haus-unbekannt',
      subtitle: 'Wegverlobt an ein unbekanntes Haus'
    })
  ],
  timeJumps: [
    {
      id: FOUNDER_TIME_JUMP_ID,
      parentPartnershipId: 'marriage-agravaine-thalena',
      parentPersonId: '',
      childIds: ['iorwerth-mwyalchen', 'eirwyn-mwyalchen'],
      years: 0,
      fromYear: '1209',
      toYear: '1584',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner: Der Zeitsprung folgt ausschließlich auf den Hausknoten des Gründerpaares und führt erst danach zu Iorwerth und Eirwyn.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-agravaine-thalena',
    houseId: MWYALCHEN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstenhaus von Penbryn · Kadettenzweig der Aderyn',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'agravaine-aderyn',
    orientation: 'vertical',
    ancestorDepth: 18,
    descendantDepth: 18,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Mwyalchen O'Penbryn (bereitgestellte Altdaten)",
    sourceNote: 'Agravaine Aderyn und Thalena begründen Haus Mwyalchen. Hausknoten und einziger Zeitsprung stehen strikt seriell vor Iorwerth und Eirwyn. Frauen, deren Nachkommen in einem anderen Haus fortgeführt werden, erhalten direkte Wegverheiratet- oder Wegverlobt-Knoten; die fremden Kinder werden in dieser Akte nicht gedoppelt. Umgekehrt werden nur die Mwyalchen-Linien von Iorwerth, Kelyddon, Cadwallen, Arglwydd, Gwynham, Cieran, Agravaine, Gwalchgwyn, Daddweir, Sheev, Gwindor, Gower und Conway hier fortgeführt. Mithlas Camoran ist ausdrücklich Gwindors aufgenommenes Mündel und daher als Mündel statt als leibliches Kind gerahmt. Die fehlerhafte Quellüberschrift „Sheev & Chryl“ wurde anhand der unmittelbar zugeordneten Partnerzeilen berichtigt: Tirion und Orbo stammen von Sheev und Rheanne; Chryl ist Conways Ehefrau und Mutter Ieuans. Die Hofliste nennt einen dritten Erben namens Iorwerth, liefert ihm jedoch weder Abstammung noch eigene Karte; er wurde deshalb nicht als unverbundene Person erfunden. Die Schreibvariante Dadweir wurde mit der kanonischen Ciaróg-Gegenakte Daddweir zusammengeführt. Wiederholte Standardsilhouetten wurden nicht als Individualporträts importiert.',
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
    registryManagedRecordFields: ['folderPath']
  }
});
