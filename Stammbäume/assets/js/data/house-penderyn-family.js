import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_PENDERYN_PORTRAITS } from './house-penderyn-portraits.js';
import {
  VORTIGERNS_RUH_HOUSE_EMBLEMS,
  VORTIGERNS_RUH_HOUSE_PROFILES
} from './vortigerns-ruh-house-profiles.js';

const PENDERYN_HOUSE_ID = 'house-penderyn';
const PENDERYN_EMBLEM = VORTIGERNS_RUH_HOUSE_EMBLEMS.penderyn;

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
    houseId: options.houseId === undefined ? PENDERYN_HOUSE_ID : options.houseId,
    portrait: HOUSE_PENDERYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || 'branch',
    title: options.title || '',
    status: options.status || '',
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
  founders: ['islwyn-penderyn', 'caoimhe-haeghra'],
  dadweir: ['dadweir-penderyn', 'gwenfrewi-morthwyll'],
  cerith: ['cerith-penderyn', 'sieffre-marwolaeth'],
  enevold: ['enevold-penderyn', 'gwladus-dinefwr'],
  isobel: ['gwales-illewod', 'isobel-penderyn'],
  gareth: ['gareth-penderyn', 'mairwen-teyrngarch'],
  aelwen: ['rhydian-grawn', 'aelwen-penderyn'],
  eilonwy: ['eilonwy-penderyn', 'gwastad-teyrngarch'],
  lynfa: ['lamorak-pendrag', 'lynfa-penderyn'],
  ffionwen: ['ffodor-arth', 'ffionwen-penderyn'],
  talfryn: ['talfryn-penderyn', 'bethania-dyngwn'],
  anwen: ['anwen-penderyn', 'aneurin-crefyddol'],
  osian: ['osian-penderyn', 'nolwen-dienyddiwr'],
  aneurin: ['aneurin-penderyn', 'meinir-sgwarnog'],
  sabria: ['sabria-penderyn', 'idris-dienyddiwr'],
  steffan: ['steffan-penderyn', 'teghan-chiffyddlon'],
  gethin: ['gethin-penderyn', 'lynee-canwyll'],
  revelyn: ['tudwal-draig', 'revelyn-penderyn'],
  dwnn: ['dwnn-penderyn', 'elinor-teyrngarch']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-islwyn-caoimhe-penderyn': COUPLES.founders,
  'marriage-dadweir-gwenfrewi-penderyn': COUPLES.dadweir,
  'marriage-enevold-gwladus-penderyn': COUPLES.enevold,
  'marriage-gareth-mairwen-penderyn': COUPLES.gareth,
  'marriage-talfryn-bethania-penderyn': COUPLES.talfryn,
  'marriage-osian-nolwen-penderyn': COUPLES.osian,
  'marriage-aneurin-meinir-penderyn': COUPLES.aneurin,
  'marriage-steffan-teghan-penderyn': COUPLES.steffan,
  'marriage-gethin-lynee-penderyn': COUPLES.gethin
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'penderyn-parentage', ...options }
  );
}

function marriedAway(id, name, partnershipId, houseId, options = {}) {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem: options.emblem || '',
    subtitle: options.subtitle || `Wegverheiratet an ${name}`,
    notes: options.notes || ''
  });
}

export const HOUSE_PENDERYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-penderyn',
    title: "Haus Penderyn O'Mathragon",
    motto: '',
    description: 'Jüngstes Adelsgeschlecht in Vortigerns Ruh. Aus Islwyns kleiner Destillerie erwuchs durch den international berühmten Penderyn-Whiskey eine der wirtschaftlich einflussreichsten Herrschaften Cenyrs und der größte Landbesitz der Grafschaft.',
    emblem: PENDERYN_EMBLEM,
    houseProfile: VORTIGERNS_RUH_HOUSE_PROFILES.penderyn
  },
  houses: [
    house(PENDERYN_HOUSE_ID, "Haus Penderyn O'Mathragon", PENDERYN_EMBLEM),
    house('house-haeghra', 'Haus Haeghra'),
    house('house-morthwyll', 'Haus Morthwyll'),
    house('house-marwolaeth', 'Haus Marwolaeth', VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth),
    house('house-dinefwr', 'Haus Dinefwr'),
    house('house-illewod', 'Haus Illewod', 'assets/images/houses/Sonnenküste/haus-illewod.png'),
    house('house-teyrngarch', 'Haus Teyrngarch'),
    house('house-grawn', 'Haus Grawn', 'assets/images/houses/Ährental/haus-grawn.png'),
    house('house-pendrag', 'Haus Pendrag', VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag),
    house('house-arth', 'Haus Arth', 'assets/images/houses/Klaueninsel/haus-arth.png'),
    house('house-dyngwn', 'Haus Dyngwn', VORTIGERNS_RUH_HOUSE_EMBLEMS.dyngwn),
    house('house-crefyddol', 'Haus Crefyddol'),
    house('house-dienyddiwr', 'Haus Dienyddiwr', VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr),
    house('house-sgwarnog', 'Haus Sgwarnog'),
    house('house-chiffyddlon', 'Haus Chiffyddlon'),
    house('house-canwyll', 'Haus Canwyll'),
    house('house-draig', 'Haus Draig', 'assets/images/houses/Llamreis Ankunft/haus-draig.png')
  ],
  persons: [
    person('islwyn-penderyn', 'Islwyn Penderyn', 'male', '????', '????', {
      title: 'Destillateur · Gründer des Hauses Penderyn',
      lineageRole: 'head',
      notes: 'Gründete die erste kleine Penderyn-Destillerie und legte damit den Grundstein für den späteren Aufstieg des Hauses.'
    }),
    spouse('caoimhe-haeghra', 'Caoimhe Haeghra', 'female', '????', '????', {
      houseId: 'house-haeghra',
      title: 'Mitgründerin des Hauses Penderyn'
    }),

    person('dadweir-penderyn', 'Dadweir Penderyn', 'male', '1611', '1678', {
      title: 'Ritterfürst des Hauses Penderyn',
      lineageRole: 'head'
    }),
    spouse('gwenfrewi-morthwyll', 'Gwenfrewi Morthwyll', 'female', '1612', '1664', {
      houseId: 'house-morthwyll'
    }),
    person('cerith-penderyn', 'Cerith Penderyn', 'female', '1600', '????', {
      title: 'Wegverheiratet an Haus Marwolaeth',
      tags: ['Wegverheiratet']
    }),
    spouse('sieffre-marwolaeth', 'Sieffre Marwolaeth', 'male', '1597', '1678', {
      houseId: 'house-marwolaeth'
    }),

    person('enevold-penderyn', 'Enevold Penderyn', 'male', '1629', '1698', {
      title: 'Ritterfürst des Hauses Penderyn bis 1698',
      lineageRole: 'head'
    }),
    spouse('gwladus-dinefwr', 'Gwladus Dinefwr', 'female', '1633', '1699', {
      houseId: 'house-dinefwr'
    }),
    person('isobel-penderyn', 'Isobel Penderyn', 'female', '1625', '1703', {
      title: 'Wegverheiratet an Haus Illewod',
      tags: ['Wegverheiratet']
    }),
    spouse('gwales-illewod', 'Gwales Illewod', 'male', '1619', '1684', {
      houseId: 'house-illewod'
    }),

    person('gareth-penderyn', 'Gareth Penderyn', 'male', '1650', '1724', {
      title: 'Ritterfürst des Hauses Penderyn von 1698 bis 1724',
      lineageRole: 'head'
    }),
    spouse('mairwen-teyrngarch', 'Mairwen Teyrngarch', 'female', '1655', '1710', {
      houseId: 'house-teyrngarch'
    }),
    person('aelwen-penderyn', 'Aelwen Penderyn', 'female', '1655', '1729', {
      title: 'Wegverheiratet an Haus Grawn',
      tags: ['Wegverheiratet']
    }),
    spouse('rhydian-grawn', 'Rhydian Grawn', 'male', '1656', '1720', {
      houseId: 'house-grawn'
    }),
    person('eilonwy-penderyn', 'Eilonwy Penderyn', 'female', '1652', '1700', {
      title: 'Wegverheiratet an Haus Teyrngarch',
      tags: ['Wegverheiratet']
    }),
    spouse('gwastad-teyrngarch', 'Gwastad Teyrngarch', 'male', '1651', '1725', {
      houseId: 'house-teyrngarch'
    }),
    person('lynfa-penderyn', 'Lynfa Penderyn', 'female', '1660', '1702', {
      title: 'Wegverheiratet an Haus Pendrag',
      tags: ['Wegverheiratet']
    }),
    spouse('lamorak-pendrag', 'Lamorak Pendrag', 'male', '1658', '1698', {
      houseId: 'house-pendrag'
    }),
    person('ffionwen-penderyn', 'Ffionwen Penderyn', 'female', '1662', '1733', {
      title: 'Wegverheiratet an Haus Arth',
      tags: ['Wegverheiratet']
    }),
    spouse('ffodor-arth', 'Ffodor Arth', 'male', '1662', '1723', {
      houseId: 'house-arth'
    }),

    person('talfryn-penderyn', 'Talfryn Penderyn', 'male', '1670', '', {
      title: 'Ritterfürst · Oberhaupt des Hauses Penderyn seit 1724',
      lineageRole: 'head'
    }),
    spouse('bethania-dyngwn', 'Bethania Dyngwn', 'female', '1674', '', {
      houseId: 'house-dyngwn'
    }),
    person('anwen-penderyn', 'Anwen Penderyn', 'female', '1678', '1733', {
      title: 'Wegverheiratet an Haus Crefyddol',
      tags: ['Wegverheiratet']
    }),
    spouse('aneurin-crefyddol', 'Aneurin Crefyddol', 'male', '1675', '', {
      houseId: 'house-crefyddol'
    }),
    person('osian-penderyn', 'Osian Penderyn', 'male', '1675', '', {
      lineageRole: 'mainline'
    }),
    spouse('nolwen-dienyddiwr', 'Nolwen Dienyddiwr', 'female', '1677', '', {
      houseId: 'house-dienyddiwr'
    }),

    person('aneurin-penderyn', 'Aneurin Penderyn', 'male', '1698', '', {
      title: 'Erster Erbe des Hauses Penderyn',
      lineageRole: 'mainline'
    }),
    spouse('meinir-sgwarnog', 'Meinir Sgwarnog', 'female', '1702', '', {
      houseId: 'house-sgwarnog'
    }),
    person('sabria-penderyn', 'Sabria Penderyn', 'female', '1696', '', {
      title: 'Wegverheiratet an Haus Dienyddiwr',
      tags: ['Wegverheiratet']
    }),
    spouse('idris-dienyddiwr', 'Idris Dienyddiwr', 'male', '1696', '', {
      houseId: 'house-dienyddiwr'
    }),
    person('steffan-penderyn', 'Steffan Penderyn', 'male', '1695', ''),
    spouse('teghan-chiffyddlon', 'Tegan Chiffyddlon', 'female', '1698', '', {
      houseId: 'house-chiffyddlon'
    }),
    person('gethin-penderyn', 'Gethin Penderyn', 'male', '1696', ''),
    spouse('lynee-canwyll', 'Lynee Canwyll', 'female', '1697', '', {
      houseId: 'house-canwyll'
    }),

    person('rhon-penderyn', 'Rhon Penderyn', 'male', '1717', '', {
      title: 'Zweiter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    person('revelyn-penderyn', 'Revelyn Penderyn', 'female', '1718', '', {
      title: 'Wegverlobt an Haus Draig',
      tags: ['Wegverlobt']
    }),
    spouse('tudwal-draig', 'Tudwal Draig', 'male', '1717', '', {
      houseId: 'house-draig'
    }),
    person('dwnn-penderyn', 'Dwnn Penderyn', 'male', '1720', '', {
      title: 'Dritter in der Erbfolge',
      lineageRole: 'mainline'
    }),
    spouse('elinor-teyrngarch', 'Elinor Teyrngarch', 'female', '1718', '', {
      houseId: 'house-teyrngarch'
    }),
    person('jinell-penderyn', 'Jinell Penderyn', 'female', '1724', ''),
    person('meuric-penderyn', 'Meuric Penderyn', 'male', '????', ''),
    person('fflurwen-penderyn', 'Fflurwen Penderyn', 'female', '????', ''),
    person('gower-penderyn', 'Gower Penderyn', 'male', '????', ''),
    person('frewi-penderyn', 'Frewi Penderyn', 'female', '????', '')
  ],
  partnerships: [
    createMarriage('marriage-islwyn-caoimhe-penderyn', ...COUPLES.founders, { status: 'ended' }),
    createMarriage('marriage-dadweir-gwenfrewi-penderyn', ...COUPLES.dadweir, { status: 'ended', end: '1664' }),
    createMarriage('marriage-cerith-sieffre-marwolaeth', ...COUPLES.cerith, { status: 'ended', end: '1678' }),
    createMarriage('marriage-enevold-gwladus-penderyn', ...COUPLES.enevold, { status: 'ended', end: '1698' }),
    createMarriage('marriage-gwales-isobel', ...COUPLES.isobel, { status: 'ended', end: '1684' }),
    createMarriage('marriage-gareth-mairwen-penderyn', ...COUPLES.gareth, { status: 'ended', end: '1710' }),
    createMarriage('marriage-rhydian-aelwen', ...COUPLES.aelwen, { status: 'ended', end: '1720' }),
    createMarriage('marriage-eilonwy-gwastad-teyrngarch', ...COUPLES.eilonwy, { status: 'ended', end: '1700' }),
    createMarriage('marriage-lamorak-lynfa', ...COUPLES.lynfa, { status: 'ended', end: '1698' }),
    createMarriage('marriage-ffodor-ffionwen', ...COUPLES.ffionwen, { status: 'ended', end: '1723' }),
    createMarriage('marriage-talfryn-bethania-penderyn', ...COUPLES.talfryn),
    createMarriage('marriage-anwen-aneurin-crefyddol', ...COUPLES.anwen, { status: 'widowed', end: '1733' }),
    createMarriage('marriage-osian-nolwen-penderyn', ...COUPLES.osian),
    createMarriage('marriage-aneurin-meinir-penderyn', ...COUPLES.aneurin),
    createMarriage('marriage-sabria-idris-dienyddiwr', ...COUPLES.sabria),
    createMarriage('marriage-steffan-teghan-penderyn', ...COUPLES.steffan),
    createMarriage('marriage-gethin-lynee-penderyn', ...COUPLES.gethin),
    createMarriage('engagement-tudwal-revelyn', ...COUPLES.revelyn, { type: 'engagement' }),
    createMarriage('engagement-dwnn-elinor-teyrngarch', ...COUPLES.dwnn, { type: 'engagement' })
  ],
  parentages: [
    ...childrenOf(['dadweir-penderyn', 'cerith-penderyn'], 'marriage-islwyn-caoimhe-penderyn', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Die Quelle überspringt zwischen dem Gründerpaar und dieser Generation nicht einzeln überlieferte Vorfahren.',
      extensions: { timeJumpId: 'gap-founders-to-dadweir-cerith-penderyn' }
    }),
    ...childrenOf(['enevold-penderyn', 'isobel-penderyn'], 'marriage-dadweir-gwenfrewi-penderyn'),
    ...childrenOf(
      ['gareth-penderyn', 'aelwen-penderyn', 'eilonwy-penderyn', 'lynfa-penderyn', 'ffionwen-penderyn'],
      'marriage-enevold-gwladus-penderyn'
    ),
    ...childrenOf(['talfryn-penderyn', 'anwen-penderyn', 'osian-penderyn'], 'marriage-gareth-mairwen-penderyn'),
    ...childrenOf(['aneurin-penderyn', 'sabria-penderyn'], 'marriage-talfryn-bethania-penderyn'),
    ...childrenOf(['steffan-penderyn', 'gethin-penderyn'], 'marriage-osian-nolwen-penderyn'),
    ...childrenOf(
      ['rhon-penderyn', 'revelyn-penderyn', 'dwnn-penderyn', 'jinell-penderyn'],
      'marriage-aneurin-meinir-penderyn'
    ),
    ...childrenOf(['meuric-penderyn', 'fflurwen-penderyn'], 'marriage-steffan-teghan-penderyn'),
    ...childrenOf(['gower-penderyn', 'frewi-penderyn'], 'marriage-gethin-lynee-penderyn')
  ],
  cadetBranches: [
    marriedAway('married-away-cerith-penderyn-marwolaeth', 'Haus Marwolaeth', 'marriage-cerith-sieffre-marwolaeth', 'house-marwolaeth', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.marwolaeth
    }),
    marriedAway('married-away-isobel-penderyn-illewod', 'Haus Illewod', 'marriage-gwales-isobel', 'house-illewod', {
      emblem: 'assets/images/houses/Sonnenküste/haus-illewod.png'
    }),
    marriedAway('married-away-aelwen-penderyn-grawn', 'Haus Grawn', 'marriage-rhydian-aelwen', 'house-grawn', {
      emblem: 'assets/images/houses/Ährental/haus-grawn.png'
    }),
    marriedAway('married-away-eilonwy-penderyn-teyrngarch', 'Haus Teyrngarch', 'marriage-eilonwy-gwastad-teyrngarch', 'house-teyrngarch'),
    marriedAway('married-away-lynfa-penderyn-pendrag', 'Haus Pendrag', 'marriage-lamorak-lynfa', 'house-pendrag', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag
    }),
    marriedAway('married-away-ffionwen-penderyn-arth', 'Haus Arth', 'marriage-ffodor-ffionwen', 'house-arth', {
      emblem: 'assets/images/houses/Klaueninsel/haus-arth.png'
    }),
    marriedAway('married-away-anwen-penderyn-crefyddol', 'Haus Crefyddol', 'marriage-anwen-aneurin-crefyddol', 'house-crefyddol'),
    marriedAway('married-away-sabria-penderyn-dienyddiwr', 'Haus Dienyddiwr', 'marriage-sabria-idris-dienyddiwr', 'house-dienyddiwr', {
      emblem: VORTIGERNS_RUH_HOUSE_EMBLEMS.dienyddiwr
    }),
    marriedAway('married-away-revelyn-penderyn-draig', 'Haus Draig', 'engagement-tudwal-revelyn', 'house-draig', {
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
      subtitle: 'Wegverlobt an Haus Draig',
      notes: 'Revelyn bleibt bis zur Eheschließung ein legitimes Kernmitglied des Hauses Penderyn; der Zielknoten dokumentiert ihre Verlobung mit Tudwal Draig.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-founders-to-dadweir-cerith-penderyn',
      parentPartnershipId: 'marriage-islwyn-caoimhe-penderyn',
      parentPersonId: '',
      childIds: ['dadweir-penderyn', 'cerith-penderyn'],
      years: 0,
      fromYear: '????',
      toYear: '1600',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter Generationentrenner nach Gründerpaar und Hauswappen. Dadweir und Cerith beginnen ausschließlich unter diesem Zeitsprung; der Sprung steht zu keinem Personen- oder Hausknoten parallel.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-islwyn-caoimhe-penderyn',
    houseId: PENDERYN_HOUSE_ID,
    crestSubtitle: 'Ritterfürstliches Haus aus Mathragon',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' },
    originHouse: { enabled: false }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'islwyn-penderyn',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    sourceRevision: 2,
    sourceModule: "Haus Penderyn O'Mathragon (bereitgestellte Altdaten)",
    sourceNote: 'Personen, Lebensdaten, Ehen, Elternschaften, Amtsfolge und Porträts folgen der beigefügten Penderyn-Tabelle und ihrer eingebetteten Stammbaumgrafik. Der dort mit Punkten markierte Überlieferungssprung wird als einziger serieller Zeitsprung unmittelbar nach Gründerpaar und Hauswappen geführt. Cerith, Isobel, Aelwen, Eilonwy, Lynfa, Ffionwen, Anwen und Sabria besitzen direkte Wegverheiratet-Knoten; Revelyn entsprechend einen Wegverlobt-Knoten zu Haus Draig. Die gemeinsame Personen- und Beziehungsidentität mit Illewod, Grawn, Pendrag, Arth und Draig wird durch dieselben Weltpersonen- und Partnerschafts-IDs erhalten. Die offenkundig falsche Tabellenüberschrift „Aneurin’s“ über Anwen und Aneurin Crefyddol wurde anhand der Namen und Stammbaumgrafik als Anwen-Zweig aufgelöst. Generische schwarze Standardsilhouetten wurden nicht als individuelle Porträts dupliziert. Der widersprüchliche Amtsendpunkt 1681 Dadweirs wurde wegen seines belegten Todesjahrs 1678 nicht als Lebensdatum übernommen.',
    registryManagedExtensionFields: ['sourceNote'],
    registryManagedHouseProfileFields: ['rankId', 'seat', 'barony', 'county', 'kingdom', 'regionEmblems'],
    registryManagedRecordFields: ['folderPath']
  }
});
