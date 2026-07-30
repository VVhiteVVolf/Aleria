import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import {
  AEHRENTAL_HOUSE_EMBLEMS,
  AEHRENTAL_HOUSE_PROFILES
} from './aehrental-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { HOUSE_SGWARNOG_PORTRAITS } from './house-sgwarnog-portraits.js';

const SGWARNOG_HOUSE_ID = 'house-sgwarnog';
const SGWARNOG_EMBLEM = AEHRENTAL_HOUSE_EMBLEMS.sgwarnog;
const TIME_JUMP_ID = 'gap-mael-to-mathonwy-generation-sgwarnog';

const HOUSE_EMBLEMS = Object.freeze({
  baedd: AEHRENTAL_HOUSE_EMBLEMS.baedd,
  chiffyddlon: AEHRENTAL_HOUSE_EMBLEMS.chiffyddlon,
  dienyddiwr: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr,
  grawn: AEHRENTAL_HOUSE_EMBLEMS.grawn,
  gwarchod: AEHRENTAL_HOUSE_EMBLEMS.gwarchod,
  penderyn: VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn,
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
  'mael-founder-sgwarnog': 'Gründer und erster Baron des Hauses Sgwarnog',
  'mathonwy-sgwarnog': 'Baron von Aldwynd bis 1695',
  'maldwyn-sgwarnog': 'Baron von Aldwynd 1695–1727',
  'morcant-sgwarnog': 'Baron von Aldwynd seit 1727',
  'mabon-sgwarnog': 'Erster Erbe des Hauses Sgwarnog',
  'math-1719-sgwarnog': 'Zweiter Erbe des Hauses Sgwarnog',
  'mael-1725-sgwarnog': 'Dritter Erbe des Hauses Sgwarnog'
});

const HOUSE_HEAD_IDS = new Set([
  'mael-founder-sgwarnog',
  'mathonwy-sgwarnog',
  'maldwyn-sgwarnog',
  'morcant-sgwarnog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return SUCCESSION_TITLES[personId] ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SGWARNOG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_SGWARNOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SGWARNOG_HOUSE_ID ? 'core' : 'married'),
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
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), 'Wegverheiratet']
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

const COUPLES = Object.freeze({
  founders: ['mael-founder-sgwarnog', 'meiriona-founder-sgwarnog'],
  mathonwy: ['lynesse-gwarchod-sgwarnog', 'mathonwy-sgwarnog'],
  morfudd: ['morfudd-sgwarnog', 'iorwerth-chiffyddlon'],
  maldwyn: ['marve-baedd', 'maldwyn-sgwarnog'],
  magwena: ['uther-dienyddiwr', 'magwena-sgwarnog'],
  myfanwy: ['myfanwy-sgwarnog', 'gwydion-crefyddol'],
  morcant: ['gwendolyn-grawn', 'morcant-sgwarnog'],
  meiriona: ['meiriona-1679-sgwarnog', 'edern-selwyn'],
  marsaili: ['marsaili-sgwarnog', 'alastar-mac-eala'],
  morganwg: ['morganwg-sgwarnog', 'ewynn-unigol'],
  mabon: ['rhondda-chiffyddlon', 'mabon-sgwarnog'],
  mabil: ['rhydian-wyrm', 'mabli-swgarnog'],
  meghan: ['meghan-sgwarnog', 'orson-canwyll'],
  march: ['march-sgwarnog', 'gwenya-gwarchod'],
  meical: ['siana-crefyddol-sgwarnog', 'meical-sgwarnog'],
  meinir: ['aneurin-penderyn', 'meinir-sgwarnog']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-mael-meiriona-sgwarnog': COUPLES.founders,
  'marriage-lynesse-mathonwy-sgwarnog': COUPLES.mathonwy,
  'marriage-morfudd-iorwerth-sgwarnog': COUPLES.morfudd,
  'marriage-marve-maldwyn-baedd': COUPLES.maldwyn,
  'marriage-uther-magwena-dienyddiwr': COUPLES.magwena,
  'marriage-myfanwy-gwydion-sgwarnog': COUPLES.myfanwy,
  'marriage-gwendolyn-morcant': COUPLES.morcant,
  'marriage-meiriona-edern-sgwarnog': COUPLES.meiriona,
  'marriage-marsaili-alastar-sgwarnog': COUPLES.marsaili,
  'marriage-morganwg-ewynn-sgwarnog': COUPLES.morganwg,
  'marriage-mabon-rhondda-sgwarnog': COUPLES.mabon,
  'marriage-rhydian-mabli': COUPLES.mabil,
  'marriage-meghan-orson-sgwarnog': COUPLES.meghan,
  'marriage-march-gwenya-sgwarnog': COUPLES.march,
  'marriage-meical-siana-sgwarnog': COUPLES.meical,
  'marriage-aneurin-meinir-penderyn': COUPLES.meinir
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'sgwarnog-parentage', ...options }
  );
}

function gapChildren(childIds) {
  return childrenOf(childIds, 'marriage-mael-meiriona-sgwarnog', {
    type: 'claimed',
    certainty: 'probable',
    notes: 'Die Zwischen-Generationen sind in der Quelle nicht einzeln überliefert.',
    extensions: { timeJumpId: TIME_JUMP_ID }
  });
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

export const HOUSE_SGWARNOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-sgwarnog',
    title: "Haus Sgwarnog O'Aldwynd",
    motto: 'Großes erwächst aus der Achtung vor dem Kleinen.',
    description: 'Bodenständiges Baronenhaus von Aldwynd und Hüter des fruchtbaren Flusstals im Ährental.',
    emblem: SGWARNOG_EMBLEM,
    houseProfile: AEHRENTAL_HOUSE_PROFILES.sgwarnog
  },
  houses: [
    house(SGWARNOG_HOUSE_ID, "Haus Sgwarnog O'Aldwynd", SGWARNOG_EMBLEM),
    house('house-gwarchod', 'Haus Gwarchod', HOUSE_EMBLEMS.gwarchod),
    house('house-chiffyddlon', 'Haus Chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    house('house-baedd', "Haus Baedd O'Eirwyn", HOUSE_EMBLEMS.baedd),
    house('house-dienyddiwr', "Haus Dienyddiwr O'Mathragon", HOUSE_EMBLEMS.dienyddiwr),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-grawn', "Haus Grawn O'Glyndraith", HOUSE_EMBLEMS.grawn),
    house('house-selwyn', 'Haus Selwyn'),
    house('house-mac-eala', 'Haus Mac Eala'),
    house('house-unigol', 'Haus Unigol'),
    house('house-wyrm', 'Haus Wyrm', HOUSE_EMBLEMS.wyrm),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-penderyn', "Haus Penderyn O'Mathragon", HOUSE_EMBLEMS.penderyn)
  ],
  persons: [
    person('mael-founder-sgwarnog', 'Mael Sgwarnog', 'male', '????', '????'),
    spouse('meiriona-founder-sgwarnog', 'Meiriona', 'female', '????', '????', SGWARNOG_HOUSE_ID, {
      title: 'Mitgründerin des Hauses Sgwarnog'
    }),

    person('mathonwy-sgwarnog', 'Mathonwy Sgwarnog', 'male', '1628', '1695'),
    awayWoman('morfudd-sgwarnog', 'Morfudd Sgwarnog', '1630', '1694', 'Haus Chiffyddlon'),
    spouse('lynesse-gwarchod-sgwarnog', "Lynesse Gwarchod O'Glyndraith", 'female', '1629', '1701', 'house-gwarchod'),
    spouse('iorwerth-chiffyddlon', "Iorwerth Chiffyddlon O'Glyndraith", 'male', '1623', '1688', 'house-chiffyddlon'),

    person('maldwyn-sgwarnog', "Maldwyn Sgwarnog O'Aldwynd", 'male', '1648', '1727'),
    awayWoman('magwena-sgwarnog', 'Magwena Sgwarnog', '1650', '1694', 'Haus Dienyddiwr'),
    awayWoman('myfanwy-sgwarnog', 'Myfanwy Sgwarnog', '1652', '1703', 'Haus Crefyddol'),
    spouse('marve-baedd', "Marve Baedd O'Eirwyn", 'female', '1650', '1702', 'house-baedd'),
    spouse('uther-dienyddiwr', "Uther Dienyddiwr O'Mathragon", 'male', '1650', '1712', 'house-dienyddiwr'),
    spouse('gwydion-crefyddol', "Gwydion Crefyddol O'Llanvane", 'male', '1651', '1735', 'house-crefyddol'),

    person('morcant-sgwarnog', 'Morcant Sgwarnog', 'male', '1669'),
    awayWoman('meiriona-1679-sgwarnog', 'Meiriona Sgwarnog', '1679', '', 'Haus Selwyn'),
    awayWoman('marsaili-sgwarnog', 'Marsaili Sgwarnog', '1673', '1720', 'Haus Mac Eala'),
    person('morganwg-sgwarnog', 'Morganwg Sgwarnog', 'male', '1677'),
    spouse('gwendolyn-grawn', "Gwendolyn Grawn O'Glyndraith", 'female', '1672', '', 'house-grawn'),
    spouse('edern-selwyn', "Edern Selwyn O'Caer Eldrith", 'male', '1680', '', 'house-selwyn'),
    spouse('alastar-mac-eala', 'Alastar Mac Eala', 'male', '1670', '1720', 'house-mac-eala'),
    spouse('ewynn-unigol', "Ewynn Unigol O'Caer Marwon", 'male', '1682', '', 'house-unigol'),

    person('mabon-sgwarnog', 'Mabon Sgwarnog', 'male', '1692'),
    awayWoman('mabli-swgarnog', 'Mabil Sgwarnog', '1694', '', 'Haus Wyrm'),
    awayWoman('meghan-sgwarnog', 'Meghan Sgwarnog', '1696', '', 'Haus Canwyll'),
    person('march-sgwarnog', 'March Sgwarnog', 'male', '1698'),
    person('meical-sgwarnog', 'Meical Sgwarnog', 'male', '1697'),
    awayWoman('meinir-sgwarnog', 'Meinir Sgwarnog', '1702', '', 'Haus Penderyn'),
    spouse('rhondda-chiffyddlon', "Rhondda Chiffyddlon O'Glyndraith", 'female', '1694', '', 'house-chiffyddlon'),
    spouse('rhydian-wyrm', "Rhydian Wyrm O'Gwynthor", 'male', '1694', '', 'house-wyrm'),
    spouse('orson-canwyll', "Orson Canwyll O'Llanvane", 'male', '1695', '', 'house-canwyll'),
    spouse('gwenya-gwarchod', "Gwenya Gwarchod O'Glyndraith", 'female', '1700', '', 'house-gwarchod'),
    spouse('siana-crefyddol-sgwarnog', "Siana Crefyddol O'Llanvane", 'female', '1700', '', 'house-crefyddol'),
    spouse('aneurin-penderyn', "Aneurin Penderyn O'Mathragon", 'male', '1698', '', 'house-penderyn'),

    person('math-1719-sgwarnog', 'Math Sgwarnog', 'male', '1719'),
    person('menna-sgwarnog', 'Menna Sgwarnog', 'female', '1722'),
    person('mael-1725-sgwarnog', 'Mael Sgwarnog', 'male', '1725'),
    person('madog-sgwarnog', 'Madog Sgwarnog', 'male', '1721'),
    person('main-sgwarnog', 'Main Sgwarnog', 'female', '1723'),
    person('mawr-sgwarnog', 'Mawr Sgwarnog', 'male', '1723'),
    person('medi-sgwarnog', 'Medi Sgwarnog', 'female', '1725')
  ],
  partnerships: [
    createMarriage('marriage-mael-meiriona-sgwarnog', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-lynesse-mathonwy-sgwarnog', ...COUPLES.mathonwy, { status: 'ended', end: '1695' }),
    createMarriage('marriage-morfudd-iorwerth-sgwarnog', ...COUPLES.morfudd, { status: 'ended', end: '1688' }),
    createMarriage('marriage-marve-maldwyn-baedd', ...COUPLES.maldwyn, { status: 'ended', end: '1702' }),
    createMarriage('marriage-uther-magwena-dienyddiwr', ...COUPLES.magwena, { status: 'ended', end: '1694' }),
    createMarriage('marriage-myfanwy-gwydion-sgwarnog', ...COUPLES.myfanwy, { status: 'ended', end: '1703' }),
    createMarriage('marriage-gwendolyn-morcant', ...COUPLES.morcant),
    createMarriage('marriage-meiriona-edern-sgwarnog', ...COUPLES.meiriona),
    createMarriage('marriage-marsaili-alastar-sgwarnog', ...COUPLES.marsaili, { status: 'ended', end: '1720' }),
    createMarriage('marriage-morganwg-ewynn-sgwarnog', ...COUPLES.morganwg),
    createMarriage('marriage-mabon-rhondda-sgwarnog', ...COUPLES.mabon),
    createMarriage('marriage-rhydian-mabli', ...COUPLES.mabil),
    createMarriage('marriage-meghan-orson-sgwarnog', ...COUPLES.meghan),
    createMarriage('marriage-march-gwenya-sgwarnog', ...COUPLES.march),
    createMarriage('marriage-meical-siana-sgwarnog', ...COUPLES.meical),
    createMarriage('marriage-aneurin-meinir-penderyn', ...COUPLES.meinir)
  ],
  parentages: [
    ...gapChildren(['mathonwy-sgwarnog', 'morfudd-sgwarnog']),
    ...childrenOf(['maldwyn-sgwarnog', 'magwena-sgwarnog', 'myfanwy-sgwarnog'], 'marriage-lynesse-mathonwy-sgwarnog'),
    ...childrenOf(
      ['morcant-sgwarnog', 'meiriona-1679-sgwarnog', 'marsaili-sgwarnog', 'morganwg-sgwarnog'],
      'marriage-marve-maldwyn-baedd'
    ),
    ...childrenOf(
      ['mabon-sgwarnog', 'mabli-swgarnog', 'meghan-sgwarnog', 'march-sgwarnog'],
      'marriage-gwendolyn-morcant'
    ),
    ...childrenOf(['meical-sgwarnog', 'meinir-sgwarnog'], 'marriage-morganwg-ewynn-sgwarnog'),
    ...childrenOf(['math-1719-sgwarnog', 'menna-sgwarnog', 'mael-1725-sgwarnog'], 'marriage-mabon-rhondda-sgwarnog'),
    ...childrenOf(['madog-sgwarnog', 'main-sgwarnog'], 'marriage-march-gwenya-sgwarnog'),
    ...childrenOf(['mawr-sgwarnog', 'medi-sgwarnog'], 'marriage-meical-siana-sgwarnog')
  ],
  cadetBranches: [
    marriedAway('married-away-morfudd-sgwarnog-chiffyddlon', 'Haus Chiffyddlon', 'marriage-morfudd-iorwerth-sgwarnog', 'house-chiffyddlon', HOUSE_EMBLEMS.chiffyddlon),
    marriedAway('married-away-magwena-sgwarnog-dienyddiwr', 'Haus Dienyddiwr', 'marriage-uther-magwena-dienyddiwr', 'house-dienyddiwr', HOUSE_EMBLEMS.dienyddiwr),
    marriedAway('married-away-myfanwy-sgwarnog-crefyddol', 'Haus Crefyddol', 'marriage-myfanwy-gwydion-sgwarnog', 'house-crefyddol'),
    marriedAway('married-away-meiriona-sgwarnog-selwyn', 'Haus Selwyn', 'marriage-meiriona-edern-sgwarnog', 'house-selwyn'),
    marriedAway('married-away-marsaili-sgwarnog-mac-eala', 'Haus Mac Eala', 'marriage-marsaili-alastar-sgwarnog', 'house-mac-eala'),
    marriedAway('married-away-mabil-sgwarnog-wyrm', 'Haus Wyrm', 'marriage-rhydian-mabli', 'house-wyrm', HOUSE_EMBLEMS.wyrm),
    marriedAway('married-away-meghan-sgwarnog-canwyll', 'Haus Canwyll', 'marriage-meghan-orson-sgwarnog', 'house-canwyll'),
    marriedAway('married-away-meinir-sgwarnog-penderyn', 'Haus Penderyn', 'marriage-aneurin-meinir-penderyn', 'house-penderyn', HOUSE_EMBLEMS.penderyn)
  ],
  timeJumps: [
    {
      id: TIME_JUMP_ID,
      parentPartnershipId: 'marriage-mael-meiriona-sgwarnog',
      parentPersonId: '',
      childIds: ['mathonwy-sgwarnog', 'morfudd-sgwarnog'],
      years: 0,
      fromYear: '????',
      toYear: '1628',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen; erst darunter beginnen Mathonwy und Morfudd.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-mael-meiriona-sgwarnog',
    houseId: SGWARNOG_HOUSE_ID,
    crestSubtitle: 'Baronenhaus von Aldwynd · Hüter des Flusstals',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'mael-founder-sgwarnog',
    orientation: 'vertical',
    ancestorDepth: 16,
    descendantDepth: 16,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 1,
    sourceModule: "Haus Sgwarnog O'Aldwynd (bereitgestellte Altdaten)",
    sourceNote: 'Genealogie, Lebensdaten, Barons- und Erbfolge sowie Porträtzuordnungen folgen der bereitgestellten Sgwarnog-Hausseite und ihrer vollständigen Stammbaumgrafik. Mael und Meiriona bilden das Gründerpaar; das Hauswappen steht direkt unter ihnen und der einzige Punkttrenner wird anschließend als absoluter serieller Zeitsprung vor Mathonwy und Morfudd geführt. Mathonwy und Lynesse führen die Sgwarnog-Linie über Maldwyn, Morcant und Mabon fort. Morfudd, Magwena, Myfanwy, Meiriona, Marsaili, Mabil, Meghan und Meinir besitzen an ihren Ehen direkte Wegverheiratet-Knoten. Gemeinsame Weltpersonen, Partnerschafts-IDs, Teilnehmerreihenfolgen und Porträts mit Grawn, Baedd, Dienyddiwr und Penderyn werden unverändert wiederverwendet. Die Kinder von Maldwyn/Marve und Morcant/Gwendolyn stehen ausschließlich in der fortführenden Sgwarnog-Akte; Nolwen Dienyddiwr sowie Rhon, Revelyn, Dwnn und Jinell Penderyn bleiben ausschließlich in ihren jeweiligen Gegenakten. Wiederholte neutrale Standardsilhouetten werden nicht als individuelle Porträts importiert.',
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
