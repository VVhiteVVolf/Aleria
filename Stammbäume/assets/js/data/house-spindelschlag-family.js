import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SPINDELSCHLAG_PORTRAITS } from './house-spindelschlag-portraits.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const SPINDELSCHLAG_HOUSE_ID = 'house-spindelschlag';
const SOURCE_GAP_ID = 'gap-spindelschlag-founders-to-hagen-helga';

const HOUSE_EMBLEMS = Object.freeze({
  spindelschlag: KRONENTAL_HOUSE_EMBLEMS.spindelschlag,
  vaeren: KRONENTAL_HOUSE_EMBLEMS.vaeren,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  kummerherz: SCHWARZFENN_HOUSE_EMBLEMS.kummerherz
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

const HEAD_IDS = new Set([
  'aldis-spindelschlag',
  'hagen-spindelschlag',
  'hadd-spindelschlag',
  'hvnir-spindelschlag',
  'isgeirr-spindelschlag'
]);

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? SPINDELSCHLAG_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_SPINDELSCHLAG_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === SPINDELSCHLAG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || (HEAD_IDS.has(id) ? 'head' : 'branch'),
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
    familyRole: options.familyRole || 'married',
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
    extensions: { registryManagedFields: ['name', 'emblem', 'status'] }
  };
}

const PARTNERS_BY_ID = Object.freeze({
  'marriage-aldis-gertrud-spindelschlag': ['aldis-spindelschlag', 'gertrud-spindelschlag'],
  'marriage-hagen-eldhildr-spindelschlag': ['hagen-spindelschlag', 'eldhildr-spindelschlag'],
  'marriage-helga-galrik-spindelschlag': ['helga-spindelschlag', 'galrik-spindelschlag'],
  'marriage-hadd-vetrdis-spindelschlag': ['hadd-spindelschlag', 'vetrdis-spindelschlag'],
  'marriage-galmar-gerdur-vaeren': ['galmar-vaeren', 'gerdur'],
  'marriage-thrain-alva-spindelschlag': ['thrain-spindelschlag', 'alva-spindelschlag'],
  'marriage-hvnir-saeunn-spindelschlag': ['hvnir-spindelschlag', 'saeunn-spindelschlag'],
  'engagement-hvanndis-skjaldar-spindelschlag': ['hvanndis-spindelschlag', 'skjaldar-spindelschlag'],
  'marriage-ljotr-vetrun-spindelschlag': ['ljotr-spindelschlag', 'vetrun-spindelschlag'],
  'marriage-isgeirr-thorunn-spindelschlag': ['isgeirr-spindelschlag', 'thorunn-spindelschlag'],
  'marriage-tyrfingr-midna-kummerherz': ['tyrfingr-kummerherz', 'midna-spindelschlag'],
  'marriage-halldor-asta-eisenbieger': ['halldor-eisenbieger', 'asta-spindelschlag'],
  'marriage-ljosvi-yngvildr-spindelschlag': ['ljosvi-spindelschlag', 'yngvildr-spindelschlag'],
  'marriage-poltar-isgerd-riesentod': ['poltar-riesentod', 'isgerd-spindelschlag'],
  'marriage-uvard-norelle-sturmgeborene': ['uvard-sturmgeborener', 'norelle-spindelschlag']
});

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function withLayout(record, extensionName, extensionValue) {
  return {
    ...record,
    extensions: {
      ...record.extensions,
      [extensionName]: extensionValue,
      registryManagedExtensionFields: [
        ...(record.extensions?.registryManagedExtensionFields || []),
        extensionName
      ]
    }
  };
}

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayout(partnership(partnershipId, options), 'chartAlignChildGroupBelowParentPair', true);
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayout(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'spindelschlag-parentage',
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
    subtitle: `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

export const HOUSE_SPINDELSCHLAG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-spindelschlag',
    title: 'Clan Spindelschlag',
    motto: '',
    description: 'Wohlhabender Bürgerclan und Thengr von Spindelheim. Durch Gerdur Spindelschlags Ehe mit König Galmar Vaeren stieg die Schneider- und Pelzverarbeiterfamilie zur führenden Handwerksdynastie Aldrimars auf, blieb jedoch ohne Adelsbrief.',
    emblem: HOUSE_EMBLEMS.spindelschlag,
    houseProfile: KRONENTAL_HOUSE_PROFILES.spindelschlag
  },
  houses: [
    house(SPINDELSCHLAG_HOUSE_ID, 'Clan Spindelschlag', HOUSE_EMBLEMS.spindelschlag),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-kummerherz', 'Clan Kummerherz', HOUSE_EMBLEMS.kummerherz),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene)
  ],
  persons: [
    person('aldis-spindelschlag', 'Aldis Spindelschlag', 'male', '????', '????', {
      title: 'Gründer des Clans Spindelschlag'
    }),
    spouse('gertrud-spindelschlag', 'Gertrud', 'female', '????', '????'),

    person('hagen-spindelschlag', 'Hagen Spindelschlag', 'male', '1594', '1676'),
    spouse('eldhildr-spindelschlag', 'Eldhildr', 'female', '1592', '1676'),
    awayWoman('helga-spindelschlag', 'Helga Spindelschlag', '1598', '1678', 'ein unbekanntes Haus'),
    spouse('galrik-spindelschlag', 'Galrik', 'male', '1593', '1641'),

    person('hod-spindelschlag', 'Hod Spindelschlag', 'male', '1625', '1641'),
    person('hadd-spindelschlag', 'Hadd Spindelschlag', 'male', '1627', '1704'),
    awayWoman('gerdur', 'Gerdur Spindelschlag', '1630', '1676', 'Clan Vaeren', {
      title: 'Königin von Aldrimar · Wegverheiratet an Clan Vaeren',
      notes: 'Gerdur und König Galmar verschwanden 1676 gemeinsam auf hoher See.'
    }),
    person('thrain-spindelschlag', 'Þráinn Spindelschlag', 'male', '1632', '1703'),
    spouse('vetrdis-spindelschlag', 'Vetrdis', 'female', '1631', '1711'),
    spouse('galmar-vaeren', 'Galmar Vaeren', 'male', '1613', '1676', 'house-vaeren', {
      title: 'König von Aldrimar'
    }),
    spouse('alva-spindelschlag', 'Alva', 'female', '1635', '1701'),

    person('hvnir-spindelschlag', 'Hvnir Spindelschlag', 'male', '1653', '1739'),
    person('hati-spindelschlag', 'Hati Spindelschlag', 'male', '1654', '1654'),
    spouse('saeunn-spindelschlag', 'Saeunn', 'female', '????', '????'),
    person('ljotr-spindelschlag', 'Ljotr Spindelschlag', 'male', '1656', '????'),
    person('fjallbjoern-spindelschlag', 'Fjallbjörn Spindelschlag', 'male', '1657', '1719'),
    person('hvanndis-spindelschlag', 'Hvanndis Spindelschlag', 'female', '1659', '1735'),
    spouse('vetrun-spindelschlag', 'Vetrun', 'female', '????', '????'),
    spouse('skjaldar-spindelschlag', 'Skjaldar', 'male', '????', '????', '', {
      title: 'Verlobter Hvanndis’',
      tags: ['Verlobt']
    }),

    person('isgeirr-spindelschlag', 'Isgeirr Spindelschlag', 'male', '1687', '????'),
    person('njall-spindelschlag', 'Njall Spindelschlag', 'male', '1691', '1720'),
    awayWoman('midna-spindelschlag', 'Midna Spindelschlag', '1695', '', 'Clan Kummerherz'),
    awayWoman('norelle-spindelschlag', 'Norelle Spindelschlag', '1701', '', 'Clan Sturmgeborene', {
      notes: 'In der Sturmgeborenen-Gegenakte belegt; ihre Einordnung als jüngste Tochter Hvnir Spindelschlags und Saeunns ist eine genealogisch plausible Rekonstruktion.'
    }),
    spouse('thorunn-spindelschlag', 'Thorunn', 'female', '1691', '????'),
    spouse('tyrfingr-kummerherz', 'Tyrfingr Kummerherz', 'male', '1694', '', 'house-kummerherz'),
    spouse('uvard-sturmgeborener', 'Uvard Sturmgeborener', 'male', '1698', '', 'house-sturmgeborene'),

    awayWoman('asta-spindelschlag', 'Asta Spindelschlag', '1692', '', 'Clan Eisenbieger'),
    person('ljosvi-spindelschlag', 'Ljosvi Spindelschlag', 'male', '1684', '????'),
    spouse('halldor-eisenbieger', 'Halldor Eisenbieger', 'male', '1693', '', 'house-eisenbieger'),
    spouse('yngvildr-spindelschlag', 'Yngvildr', 'female', '1689', '????'),

    person('ivarr-spindelschlag', 'Ivarr Spindelschlag', 'male', '1712', ''),
    person('hlif-spindelschlag', 'Hlif Spindelschlag', 'female', '1715', '', {
      extensions: {
        chartRepeatForPartnershipIds: [],
        registryManagedExtensionFields: ['chartRepeatForPartnershipIds']
      }
    }),
    person('ingol-spindelschlag', 'Ingol Spindelschlag', 'male', '1716', ''),
    awayWoman('isgerd-spindelschlag', 'Isgerd Spindelschlag', '1717', '', 'Clan Riesentod'),
    person('eisa-spindelschlag', 'Eisa Spindelschlag', 'female', '1721', ''),
    spouse('poltar-riesentod', 'Poltar Riesentod', 'male', '1716', '', 'house-riesentod'),

    person('bersi-spindelschlag', 'Bersi Spindelschlag', 'male', '1710', '', {
      extensions: {
        chartPartnerMirrorForPartnershipIds: [],
        registryManagedExtensionFields: ['chartPartnerMirrorForPartnershipIds']
      }
    }),
    person('mjoell-spindelschlag', 'Mjöll Spindelschlag', 'female', '1713', ''),
    person('skafa-spindelschlag', 'Skafa Spindelschlag', 'female', '1718', '')
  ],
  partnerships: [
    partnership('marriage-aldis-gertrud-spindelschlag'),
    alignChildrenBelowPair('marriage-hagen-eldhildr-spindelschlag', { status: 'ended', end: '1676' }),
    partnership('marriage-helga-galrik-spindelschlag', { status: 'ended', end: '1641' }),
    alignChildrenBelowPair('marriage-hadd-vetrdis-spindelschlag', { status: 'ended', end: '1704' }),
    partnership('marriage-galmar-gerdur-vaeren', { status: 'ended', end: '1676' }),
    alignChildrenBelowPair('marriage-thrain-alva-spindelschlag', { status: 'ended', end: '1701' }),
    alignChildrenBelowPair('marriage-hvnir-saeunn-spindelschlag', { status: 'ended', end: '1739' }),
    partnership('engagement-hvanndis-skjaldar-spindelschlag', { type: 'engagement' }),
    alignChildrenBelowPair('marriage-ljotr-vetrun-spindelschlag'),
    alignChildrenBelowPair('marriage-isgeirr-thorunn-spindelschlag'),
    partnership('marriage-tyrfingr-midna-kummerherz'),
    partnership('marriage-halldor-asta-eisenbieger'),
    alignChildrenBelowPair('marriage-ljosvi-yngvildr-spindelschlag'),
    partnership('marriage-poltar-isgerd-riesentod'),
    partnership('marriage-uvard-norelle-sturmgeborene')
  ],
  parentages: [
    ...childrenOf(['hagen-spindelschlag', 'helga-spindelschlag'], 'marriage-aldis-gertrud-spindelschlag', {
      type: 'claimed',
      legitimacy: 'unknown',
      certainty: 'probable',
      notes: 'Zwischen den Gründern und Hagen beziehungsweise Helga sind nicht einzeln überlieferte Generationen ausgelassen.',
      extensions: { timeJumpId: SOURCE_GAP_ID }
    }),
    ...childrenOf(['hod-spindelschlag', 'hadd-spindelschlag', 'gerdur', 'thrain-spindelschlag'], 'marriage-hagen-eldhildr-spindelschlag'),
    ...childrenOf(['hvnir-spindelschlag', 'hati-spindelschlag'], 'marriage-hadd-vetrdis-spindelschlag'),
    ...childrenOf(['ljotr-spindelschlag', 'fjallbjoern-spindelschlag', 'hvanndis-spindelschlag'], 'marriage-thrain-alva-spindelschlag'),
    ...childrenOf(['isgeirr-spindelschlag', 'njall-spindelschlag', 'midna-spindelschlag'], 'marriage-hvnir-saeunn-spindelschlag'),
    ...childrenOf(['norelle-spindelschlag'], 'marriage-hvnir-saeunn-spindelschlag', {
      certainty: 'probable',
      notes: 'Norelle ist in der Sturmgeborenen-Gegenakte als Spindelschlag belegt; die Altersfolge spricht für Hvnir und Saeunn als Eltern.'
    }),
    ...childrenOf(['asta-spindelschlag', 'ljosvi-spindelschlag'], 'marriage-ljotr-vetrun-spindelschlag'),
    ...childrenOf(['ivarr-spindelschlag', 'hlif-spindelschlag', 'ingol-spindelschlag', 'isgerd-spindelschlag', 'eisa-spindelschlag'], 'marriage-isgeirr-thorunn-spindelschlag'),
    ...childrenOf(['bersi-spindelschlag', 'mjoell-spindelschlag', 'skafa-spindelschlag'], 'marriage-ljosvi-yngvildr-spindelschlag')
  ],
  cadetBranches: [
    marriedAway(
      'married-away-helga-spindelschlag-unknown',
      'Unbekanntes Haus',
      'marriage-helga-galrik-spindelschlag',
      '',
      'haus-unbekannt',
      ''
    ),
    marriedAway('married-away-gerdur-spindelschlag-vaeren', 'Clan Vaeren', 'marriage-galmar-gerdur-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-midna-spindelschlag-kummerherz', 'Clan Kummerherz', 'marriage-tyrfingr-midna-kummerherz', 'house-kummerherz', 'haus-kummerherz', HOUSE_EMBLEMS.kummerherz),
    marriedAway('married-away-asta-spindelschlag-eisenbieger', 'Clan Eisenbieger', 'marriage-halldor-asta-eisenbieger', 'house-eisenbieger', 'haus-eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    marriedAway('married-away-isgerd-spindelschlag-riesentod', 'Clan Riesentod', 'marriage-poltar-isgerd-riesentod', 'house-riesentod', 'haus-riesentod', HOUSE_EMBLEMS.riesentod),
    marriedAway('married-away-norelle-spindelschlag-sturmgeborene', 'Clan Sturmgeborene', 'marriage-uvard-norelle-sturmgeborene', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene)
  ],
  timeJumps: [{
    id: SOURCE_GAP_ID,
    parentPartnershipId: 'marriage-aldis-gertrud-spindelschlag',
    parentPersonId: '',
    childIds: ['hagen-spindelschlag', 'helga-spindelschlag'],
    sharedParentPartnershipIds: [],
    years: 0,
    fromYear: '????',
    toYear: '1594',
    label: 'Nicht einzeln überlieferte Generationen',
    notes: 'Ein einziger absoluter serieller Generationentrenner folgt dem Gründerpaar und dem Spindelschlag-Wappen. Kein anderer Knoten steht dazu parallel.',
    extensions: {}
  }],
  lineage: {
    founderPartnershipId: 'marriage-aldis-gertrud-spindelschlag',
    houseId: SPINDELSCHLAG_HOUSE_ID,
    crestSubtitle: 'Bürgerclan und Thengr von Spindelheim · direkt unter der Krone',
    crestEmblemScale: 0.86,
    crestFrame: 'iron',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'aldis-spindelschlag',
    orientation: 'vertical',
    ancestorDepth: 24,
    descendantDepth: 24,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    chartLayoutPolicy: 'strict-v1',
    // Revision 4 liegt über der zuvor registrierten Quellenakte und entfernt
    // dadurch auch in lokalen Registern die alte Hlif-Bersi-Verlobung.
    sourceRevision: 4,
    sourceModule: 'Clan Spindelschlag (überlieferte HTML-Familienakte und Gegenstammbäume)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus. Die ausführliche Generationstabelle ist gegenüber der fehlerhaften Oberhauptübersicht maßgeblich: Hagen wird 1594 statt 1633, Hadd 1627 statt 1676 geboren. Asta ist gemäß Tabelle und Eisenbieger-Gegenakte mit Halldor Eisenbieger verheiratet; die ältere Stammbaumgrafik nennt abweichend Vestin. Asta wird mit 1692 und Midna mit 1695 nach der Spindelschlag-Herkunftsakte geführt; ihre Gegenakten werden entsprechend berichtigt. Tyrfingrs Geburtsjahr 1694 folgt der ausgearbeiteten Kummerherz-Gegenakte statt der Spindelschlag-Angabe 1693. Norelle fehlt in der Altquelle vollständig, ist aber als Ehefrau Uvard Sturmgeboreners belegt und wird alterslogisch mit wahrscheinlicher Elternschaft Hvnir–Saeunn ergänzt. Die in der Quelltabelle als Verlobte bezeichneten Partner mit nachgewiesenen legitimen Kindern werden als Ehen behandelt; nur Hvanndis und Skjaldar bleiben als echte kinderlose Verlobung erhalten. Die frühere Beziehung zwischen Hlif und Bersi wurde ausdrücklich entfernt. Unbenannte Partner der jüngsten Generation werden nicht importiert.',
    registryManagedExtensionFields: ['blankFamily', 'sourceNote', 'chartLayoutPolicy'],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-spindelschlag-gruender', 'haus-spindelschlag-gruenderin'],
      partnerships: [
        'haus-spindelschlag-gruenderbund',
        'marriage-haus-spindelschlag-founders',
        'engagement-hlif-bersi-spindelschlag'
      ],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.spindelschlag.folderPath
});
