import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { ALDRIMAR_HOUSE_EMBLEMS } from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_RIESENTOD_PORTRAITS } from './house-riesentod-portraits.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import {
  KRONENTAL_HOUSE_EMBLEMS,
  KRONENTAL_HOUSE_PROFILES
} from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { SCHWARZFENN_HOUSE_EMBLEMS } from './schwarzfenn-house-profiles.js';

const RIESENTOD_HOUSE_ID = 'house-riesentod';
const FOUNDER_GAP_ID = 'gap-leif-to-toste-asdis-riesentod';
const TOSTE_GAP_ID = 'gap-toste-to-tonvar-generation-riesentod';

const HOUSE_EMBLEMS = Object.freeze({
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  holmr: KRONENTAL_HOUSE_EMBLEMS.holmr,
  graumahne: SCHWARZFENN_HOUSE_EMBLEMS.graumahne,
  soekeren: RORIKSHEIM_HOUSE_EMBLEMS.soekeren,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  freiwinter: RORIKSHEIM_HOUSE_EMBLEMS.freiwinter,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  skaife: KRONENTAL_HOUSE_EMBLEMS.skaife,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  nachtjaeger: RORIKSHEIM_HOUSE_EMBLEMS.nachtjaeger,
  hyrmgardr: IVARSHEIM_HOUSE_EMBLEMS.hyrmgardr,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  helgr: SCHWARZFENN_HOUSE_EMBLEMS.helgr,
  gullvig: KRONENTAL_HOUSE_EMBLEMS.gullvig,
  spindelschlag: KRONENTAL_HOUSE_EMBLEMS.spindelschlag
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
  'leif-riesentod',
  'toste-riesentod',
  'tonvar-riesentot',
  'eorlund-riesentod',
  'hakon-riesentot',
  'einarr-riesentod',
  'tormund-riesentod',
  'thrainn-riesentod'
]);

const MAINLINE_IDS = new Set([
  'modolf-riesentod',
  'thrand-riesentod',
  'zoltar-riesentod',
  'lodin-riesentod',
  'poltar-riesentod'
]);

const LEGACY_RIESENTOT_PERSON_IDS = new Set([
  'asdis-riesentot',
  'tonvar-riesentot',
  'isbjorg-riesentot',
  'ragnar-riesentot',
  'orka-riesentot',
  'hakon-riesentot',
  'yrnhild-riesentot',
  'petka-riesentot'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function worldPersonIdFor(personId, houseId) {
  if (houseId === RIESENTOD_HOUSE_ID && LEGACY_RIESENTOT_PERSON_IDS.has(personId)) {
    return `person--haus-riesentot--${personId}`;
  }
  return '';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? RIESENTOD_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || worldPersonIdFor(id, houseId),
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: HOUSE_RIESENTOD_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === RIESENTOD_HOUSE_ID ? 'core' : 'married'),
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
  'marriage-leif-sigrid-riesentod': ['leif-riesentod', 'sigrid-vaeren-riesentod-founder'],
  'marriage-toste-helga-riesentod': ['toste-riesentod', 'helga-holmr'],
  'marriage-fjornir-asdis-graumahne': ['fjornir-graumahne', 'asdis-riesentot'],
  'marriage-tonvar-laufdis-soekeren': ['tonvar-riesentot', 'laufdis-soekeren'],
  'marriage-ulfar-isbjorg-graumahne': ['ulfar-graumahne', 'isbjorg-riesentot'],
  'marriage-kolbjorn-geirny-wargh': ['kolbjorn-wargh', 'geirny-riesentod'],
  'marriage-modolf-ylva-riesentod': ['modolf-riesentod', 'ylva-windhueter'],
  'marriage-brynhild-ragnar-freiwinter': ['ragnar-riesentot', 'brynhild-freiwinter'],
  'engagement-ulfrik-elsa-vaeren': ['ulfrik-vaeren', 'elsa-riesentod'],
  'marriage-elsa-zurik-eisenbieger': ['elsa-riesentod', 'zurik-eisenbieger'],
  'marriage-thialda-sigurd-sturmgeborene': ['thialda-riesentod', 'sigurd-sturmgeborener'],
  'marriage-eorlund-sigrun-riesentod': ['eorlund-riesentod', 'sigrun-skaife'],
  'marriage-portha-hakon-wellenschild': ['portha-wellenschild', 'hakon-riesentot'],
  'marriage-sturlaugr-orka-nachtjaeger': ['sturlaugr-nachtjaeger', 'orka-riesentot'],
  'marriage-einarr-sygne-riesentod': ['einarr-riesentod', 'sygne'],
  'marriage-hranvald-yrnhild-hyrmgardr': ['hranvald-hyrmgardr', 'yrnhild-riesentot'],
  'marriage-svana-erlend-sturmgeborene': ['svana-riesentod', 'erlend-sturmgeborener'],
  'marriage-tormund-yrgitte-riesentod': ['tormund-riesentod', 'yrgitte-frostauge'],
  'marriage-ulkfred-hulda-riesentod': ['ulkfred-riesentod', 'hulda-wellensaenger'],
  'marriage-torgeir-petka-helgr': ['torgeir-helgr', 'petka-riesentot'],
  'marriage-thrainn-siobhan-riesentod': ['thrainn-riesentod', 'siobhan-forsyth'],
  'marriage-skjor-fjola-vaeren': ['skjor-vaeren', 'fjola-riesentod'],
  'marriage-thrand-kolfinna-riesentod': ['thrand-riesentod', 'kolfinna'],
  'marriage-sigbjorn-zendra-riesentod': ['sigbjorn-riesentod', 'zendra'],
  'marriage-askold-elsa-gullvig': ['askold-gullvig', 'elsa-1696-riesentod'],
  'marriage-uthar-isfir-wellensaenger': ['uthar-wellensaenger', 'isfir-riesentod'],
  'marriage-zoltar-tindra-riesentod': ['zoltar-riesentod', 'tindra'],
  'marriage-lodin-narvea-riesentod': ['lodin-riesentod', 'narvea'],
  'marriage-poltar-isgerd-riesentod': ['poltar-riesentod', 'isgerd-spindelschlag']
});

function withLayoutExtension(record, extensionName, extensionValue) {
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

function partnership(partnershipId, options = {}) {
  return createMarriage(partnershipId, ...PARTNERS_BY_ID[partnershipId], options);
}

function alignChildrenBelowPair(partnershipId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignChildGroupBelowParentPair',
    true
  );
}

function directlyAboveOnlyChild(partnershipId, childPersonId, options = {}) {
  return withLayoutExtension(
    partnership(partnershipId, options),
    'chartAlignParentPairOverChildPersonId',
    childPersonId
  );
}

function directlyAbovePrimaryChildWithPackedLeafSiblings(
  partnershipId,
  childPersonId,
  options = {}
) {
  return withLayoutExtension(
    directlyAboveOnlyChild(partnershipId, childPersonId, options),
    'chartPackLeafSiblingBranchesBesideAlignedChild',
    true
  );
}

function directlyAbovePrimaryChildWithPackedSiblingBranches(
  partnershipId,
  childPersonId,
  options = {}
) {
  return withLayoutExtension(
    directlyAboveOnlyChild(partnershipId, childPersonId, options),
    'chartPackSiblingBranchesBesideAlignedChild',
    true
  );
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'riesentod-parentage',
    ...options
  });
}

function gapChildren(childIds, partnershipId, timeJumpId, notes) {
  return childrenOf(childIds, partnershipId, {
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    notes,
    extensions: { timeJumpId }
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

export const HOUSE_RIESENTOD_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-riesentod',
    title: 'Clan Riesentod',
    motto: '',
    description: 'Hesirenclan von Heldenwacht im Königlichen Jarltum Kronental. Die Riesentod gelten als kraftvolle Krieger- und Seefahrerlinie im Dienst des Königsclans Vaeren.',
    emblem: HOUSE_EMBLEMS.riesentod,
    houseProfile: KRONENTAL_HOUSE_PROFILES.riesentod
  },
  houses: [
    house(RIESENTOD_HOUSE_ID, 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-vaeren', 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-holmr', 'Clan Holmr', HOUSE_EMBLEMS.holmr),
    house('house-graumahne', 'Clan Graumähne', HOUSE_EMBLEMS.graumahne),
    house('house-soekeren', 'Clan Sökeren', HOUSE_EMBLEMS.soekeren),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-freiwinter', 'Clan Freiwinter', HOUSE_EMBLEMS.freiwinter),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-skaife', 'Clan Skaife', HOUSE_EMBLEMS.skaife),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-nachtjaeger', 'Clan Nachtjäger', HOUSE_EMBLEMS.nachtjaeger),
    house('house-hyrmgardr', 'Clan Hyrmgarthr', HOUSE_EMBLEMS.hyrmgardr),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-helgr', 'Clan Helgr', HOUSE_EMBLEMS.helgr),
    house('house-gullvig', 'Clan Gullvig', HOUSE_EMBLEMS.gullvig),
    house('house-spindelschlag', 'Clan Spindelschlag', HOUSE_EMBLEMS.spindelschlag),
    house('house-windhueter', 'Clan Windhüter'),
    house('house-forsyth', 'Clan Forsyth')
  ],
  persons: [
    person('leif-riesentod', 'Leif Riesentod', 'male', '????', '????', {
      title: 'Gründer und erster Hesir des Clans Riesentod',
      tags: ['Gründer']
    }),
    spouse('sigrid-vaeren-riesentod-founder', 'Sigrid Vaeren', 'female', '????', '????', 'house-vaeren', {
      title: 'Mitgründerin des Clans Riesentod',
      tags: ['Gründerin']
    }),

    person('toste-riesentod', 'Toste Riesentod', 'male', '????', '????', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('helga-holmr', 'Helga Holmr', 'female', '????', '????', 'house-holmr'),
    awayWoman('asdis-riesentot', 'Asdis Riesentod', '????', '????', 'Clan Graumähne'),
    spouse('fjornir-graumahne', 'Fjornir Graumähne', 'male', '????', '????', 'house-graumahne'),

    person('tonvar-riesentot', 'Tonvar Riesentod', 'male', '1572', '1627', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('laufdis-soekeren', 'Laufdís Sökeren', 'female', '1574', '????', 'house-soekeren'),
    awayWoman('isbjorg-riesentot', 'Isbjörg Riesentod', '1566', '1650', 'Clan Graumähne'),
    spouse('ulfar-graumahne', 'Ulfar Graumähne', 'male', '1564', '1650', 'house-graumahne'),
    awayWoman('geirny-riesentod', 'Geirný Riesentod', '1568', '1700', 'Clan Wargh'),
    spouse('kolbjorn-wargh', 'Kolbjorn Wargh', 'male', '1567', '1615', 'house-wargh'),
    person('modolf-riesentod', 'Modolf Riesentod', 'male', '1580', '1627'),
    spouse('ylva-windhueter', 'Ylva Windhüter', 'female', '1584', '1634', 'house-windhueter'),

    person('ragnar-riesentot', 'Ragnar Riesentod', 'male', '1592', '1650'),
    spouse('brynhild-freiwinter', 'Brynhild Freiwinter', 'female', '1600', '1679', 'house-freiwinter'),
    awayWoman('elsa-riesentod', 'Elsa Riesentod', '1605', '1675', 'Clan Eisenbieger', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['ulfrik-vaeren', 'zurik-eisenbieger'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('ulfrik-vaeren', 'Ulfrik Vaeren', 'male', '1605', '1627', 'house-vaeren', {
      title: 'Ehemaliger Verlobter Elsas'
    }),
    spouse('zurik-eisenbieger', 'Zurik Eisenbieger', 'male', '1597', '1665', 'house-eisenbieger'),
    awayWoman('thialda-riesentod', 'Thialda Riesentod', '1602', '1671', 'Clan Sturmgeborene'),
    spouse('sigurd-sturmgeborener', 'Sigurd Sturmgeborener', 'male', '1604', '1632', 'house-sturmgeborene'),
    person('eorlund-riesentod', 'Eorlund Riesentod', 'male', '1608', '1663', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('sigrun-skaife', 'Sigrun Skaife', 'female', '1609', '1661', 'house-skaife'),

    person('ketill-riesentod', 'Ketill Riesentod', 'male', '1610', '1627'),
    person('hakon-riesentot', 'Hakon Riesentod', 'male', '1627', '1681', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('portha-wellenschild', 'Portha Wellenschild', 'female', '1627', '1704', 'house-wellenschild'),
    awayWoman('orka-riesentot', 'Orka Riesentod', '1630', '1704', 'Clan Nachtjäger'),
    spouse('sturlaugr-nachtjaeger', 'Sturlaugr Nachtjäger', 'male', '1611', '1650', 'house-nachtjaeger'),

    person('einarr-riesentod', 'Einarr Riesentod', 'male', '1649', '1720', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('sygne', 'Sygne', 'female', '1651', '1714'),
    awayWoman('yrnhild-riesentot', 'Edla Riesentod', '1652', '1705', 'Clan Hyrmgarthr', {
      notes: 'Die Riesentod-Akte nennt sie Edla; die Hyrmgarthr-Akte nennt dieselbe Person abweichend Yrnhild.'
    }),
    spouse('hranvald-hyrmgardr', 'Hranvald Hyrmgarthr', 'male', '1652', '', 'house-hyrmgardr'),
    awayWoman('svana-riesentod', 'Svana Riesentod', '1654', '1725', 'Clan Sturmgeborene'),
    spouse('erlend-sturmgeborener', 'Erlend Sturmgeborener', 'male', '1654', '1731', 'house-sturmgeborene'),
    person('tormund-riesentod', 'Tormund Riesentod', 'male', '1656', '1738', {
      title: 'Hesir des Clans Riesentod · legendärer Seefahrer und Kriegsherr'
    }),
    spouse('yrgitte-frostauge', 'Yrgitte Frostauge', 'female', '1659', '1731', 'house-frostauge'),

    person('ulkfred-riesentod', 'Ulkfred Riesentod', 'male', '1670', '1720'),
    spouse('hulda-wellensaenger', 'Hulda Wellensänger', 'female', '1674', '1739', 'house-wellensaenger'),
    awayWoman('petka-riesentot', 'Petka Riesentod', '1674', '', 'Clan Helgr'),
    spouse('torgeir-helgr', 'Torgeir Helgr', 'male', '1672', '', 'house-helgr'),
    person('thrainn-riesentod', 'Thrainn Riesentod', 'male', '1690', '', {
      title: 'Hesir des Clans Riesentod'
    }),
    spouse('siobhan-forsyth', 'Siobhan Forsyth', 'female', '1693', '', 'house-forsyth'),
    awayWoman('fjola-riesentod', 'Fjola Riesentod', '1695', '', 'Clan Vaeren'),
    spouse('skjor-vaeren', 'Skjor Vaeren', 'male', '1695', '', 'house-vaeren'),
    person('thrand-riesentod', 'Thrand Riesentod', 'male', '1698', ''),
    spouse('kolfinna', 'Kolfinna', 'female', '1700', ''),

    person('sigbjorn-riesentod', 'Sigbjorn Riesentod', 'male', '1694', '1720'),
    spouse('zendra', 'Zendra', 'female', '1702', '1721'),
    awayWoman('elsa-1696-riesentod', 'Elsa Riesentod', '1696', '', 'Clan Gullvig', {
      notes: 'Nicht identisch mit der 1605 geborenen Elsa Riesentod.'
    }),
    spouse('askold-gullvig', 'Askold Gullvig', 'male', '1694', '', 'house-gullvig'),
    awayWoman('isfir-riesentod', 'Isfir Riesentod', '1698', '', 'Clan Wellensänger'),
    spouse('uthar-wellensaenger', 'Uthar Wellensänger', 'male', '1695', '', 'house-wellensaenger'),
    person('zoltar-riesentod', 'Zoltar Riesentod', 'male', '1712', ''),
    spouse('tindra', 'Tindra', 'female', '1711', ''),
    person('lodin-riesentod', 'Lodin Riesentod', 'male', '1717', ''),
    spouse('narvea', 'Narvea', 'female', '1715', ''),
    person('poltar-riesentod', 'Poltar Riesentod', 'male', '1716', ''),
    spouse('isgerd-spindelschlag', 'Isgerd Spindelschlag', 'female', '1717', '', 'house-spindelschlag'),
    person('eola-riesentod', 'Eola Riesentod', 'female', '1722', ''),

    person('petar-riesentod', 'Petar Riesentod', 'male', '1721', ''),
    person('carn-riesentod', 'Carn Riesentod', 'male', '1721', ''),
    person('rag-riesentod', 'Rag Riesentod', 'male', '1730', ''),
    person('lydia-riesentod', 'Lydia Riesentod', 'female', '1732', ''),
    person('mjorn-riesentod', 'Mjorn Riesentod', 'male', '1734', ''),
    person('ylkir-riesentod', 'Ylkir Riesentod', 'male', '1736', ''),
    person('galmar-riesentod', 'Galmar Riesentod', 'male', '1736', ''),
    person('gerdur-riesentod', 'Gerdur Riesentod', 'female', '1737', '')
  ],
  partnerships: [
    partnership('marriage-leif-sigrid-riesentod', { status: 'ended' }),
    directlyAbovePrimaryChildWithPackedSiblingBranches(
      'marriage-toste-helga-riesentod',
      'modolf-riesentod',
      { status: 'ended' }
    ),
    partnership('marriage-fjornir-asdis-graumahne', { status: 'ended' }),
    alignChildrenBelowPair('marriage-tonvar-laufdis-soekeren', { status: 'ended', end: '1627' }),
    partnership('marriage-ulfar-isbjorg-graumahne', { status: 'ended', end: '1650' }),
    partnership('marriage-kolbjorn-geirny-wargh', { status: 'ended', end: '1615' }),
    directlyAbovePrimaryChildWithPackedLeafSiblings(
      'marriage-modolf-ylva-riesentod',
      'eorlund-riesentod',
      { status: 'ended', end: '1627' }
    ),
    directlyAboveOnlyChild('marriage-brynhild-ragnar-freiwinter', 'ketill-riesentod', { status: 'ended', end: '1650' }),
    partnership('engagement-ulfrik-elsa-vaeren', { type: 'engagement', status: 'ended', end: '1627' }),
    partnership('marriage-elsa-zurik-eisenbieger', { status: 'ended', end: '1665' }),
    partnership('marriage-thialda-sigurd-sturmgeborene', { status: 'ended', end: '1632' }),
    directlyAbovePrimaryChildWithPackedLeafSiblings(
      'marriage-eorlund-sigrun-riesentod',
      'hakon-riesentot',
      { status: 'ended', end: '1661' }
    ),
    alignChildrenBelowPair('marriage-portha-hakon-wellenschild', { status: 'ended', end: '1681' }),
    partnership('marriage-sturlaugr-orka-nachtjaeger', { status: 'ended', end: '1650' }),
    alignChildrenBelowPair('marriage-einarr-sygne-riesentod', { status: 'ended', end: '1714' }),
    partnership('marriage-hranvald-yrnhild-hyrmgardr', { status: 'ended', end: '1705' }),
    partnership('marriage-svana-erlend-sturmgeborene', { status: 'ended', end: '1725' }),
    alignChildrenBelowPair('marriage-tormund-yrgitte-riesentod', { status: 'ended', end: '1731' }),
    alignChildrenBelowPair('marriage-ulkfred-hulda-riesentod', { status: 'ended', end: '1720' }),
    partnership('marriage-torgeir-petka-helgr'),
    alignChildrenBelowPair('marriage-thrainn-siobhan-riesentod'),
    partnership('marriage-skjor-fjola-vaeren'),
    alignChildrenBelowPair('marriage-thrand-kolfinna-riesentod'),
    alignChildrenBelowPair('marriage-sigbjorn-zendra-riesentod', { status: 'ended', end: '1720' }),
    partnership('marriage-askold-elsa-gullvig'),
    partnership('marriage-uthar-isfir-wellensaenger'),
    alignChildrenBelowPair('marriage-zoltar-tindra-riesentod'),
    alignChildrenBelowPair('marriage-lodin-narvea-riesentod'),
    alignChildrenBelowPair('marriage-poltar-isgerd-riesentod')
  ],
  parentages: [
    ...gapChildren(
      ['toste-riesentod', 'asdis-riesentot'],
      'marriage-leif-sigrid-riesentod',
      FOUNDER_GAP_ID,
      'Nicht einzeln überlieferte Generationen verbinden Leif und Sigrid mit Toste und Asdis.'
    ),
    ...gapChildren(
      ['tonvar-riesentot', 'isbjorg-riesentot', 'geirny-riesentod', 'modolf-riesentod'],
      'marriage-toste-helga-riesentod',
      TOSTE_GAP_ID,
      'Nicht einzeln überlieferte Generationen verbinden Toste und Helga mit der Generation ab 1566.'
    ),
    ...childrenOf(['ragnar-riesentot', 'elsa-riesentod'], 'marriage-tonvar-laufdis-soekeren'),
    ...childrenOf(['thialda-riesentod', 'eorlund-riesentod'], 'marriage-modolf-ylva-riesentod'),
    ...childrenOf(['ketill-riesentod'], 'marriage-brynhild-ragnar-freiwinter'),
    ...childrenOf(['hakon-riesentot', 'orka-riesentot'], 'marriage-eorlund-sigrun-riesentod'),
    ...childrenOf(
      ['einarr-riesentod', 'yrnhild-riesentot', 'svana-riesentod', 'tormund-riesentod'],
      'marriage-portha-hakon-wellenschild'
    ),
    ...childrenOf(['ulkfred-riesentod', 'petka-riesentot'], 'marriage-einarr-sygne-riesentod'),
    ...childrenOf(['thrainn-riesentod', 'fjola-riesentod', 'thrand-riesentod'], 'marriage-tormund-yrgitte-riesentod'),
    ...childrenOf(['sigbjorn-riesentod', 'elsa-1696-riesentod', 'isfir-riesentod'], 'marriage-ulkfred-hulda-riesentod'),
    ...childrenOf(['zoltar-riesentod', 'lodin-riesentod'], 'marriage-thrainn-siobhan-riesentod'),
    ...childrenOf(['poltar-riesentod', 'eola-riesentod'], 'marriage-thrand-kolfinna-riesentod'),
    ...childrenOf(['petar-riesentod', 'carn-riesentod'], 'marriage-sigbjorn-zendra-riesentod'),
    ...childrenOf(['rag-riesentod', 'lydia-riesentod'], 'marriage-zoltar-tindra-riesentod'),
    ...childrenOf(['mjorn-riesentod', 'ylkir-riesentod'], 'marriage-lodin-narvea-riesentod'),
    ...childrenOf(['galmar-riesentod', 'gerdur-riesentod'], 'marriage-poltar-isgerd-riesentod')
  ],
  cadetBranches: [
    marriedAway('married-away-asdis-riesentod-graumahne', 'Clan Graumähne', 'marriage-fjornir-asdis-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-isbjorg-riesentod-graumahne', 'Clan Graumähne', 'marriage-ulfar-isbjorg-graumahne', 'house-graumahne', 'haus-graumahne', HOUSE_EMBLEMS.graumahne),
    marriedAway('married-away-geirny-riesentod-wargh', 'Clan Wargh', 'marriage-kolbjorn-geirny-wargh', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh),
    marriedAway('married-away-elsa-riesentod-eisenbieger', 'Clan Eisenbieger', 'marriage-elsa-zurik-eisenbieger', 'house-eisenbieger', 'haus-eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    marriedAway('married-away-thialda-riesentod-sturmgeborene', 'Clan Sturmgeborene', 'marriage-thialda-sigurd-sturmgeborene', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    marriedAway('married-away-orka-riesentod-nachtjaeger', 'Clan Nachtjäger', 'marriage-sturlaugr-orka-nachtjaeger', 'house-nachtjaeger', 'haus-nachtjaeger', HOUSE_EMBLEMS.nachtjaeger),
    marriedAway('married-away-edla-riesentod-hyrmgarthr', 'Clan Hyrmgarthr', 'marriage-hranvald-yrnhild-hyrmgardr', 'house-hyrmgardr', 'haus-hyrmgardr', HOUSE_EMBLEMS.hyrmgardr),
    marriedAway('married-away-svana-riesentod-sturmgeborene', 'Clan Sturmgeborene', 'marriage-svana-erlend-sturmgeborene', 'house-sturmgeborene', 'haus-sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    marriedAway('married-away-petka-riesentod-helgr', 'Clan Helgr', 'marriage-torgeir-petka-helgr', 'house-helgr', 'haus-helgr', HOUSE_EMBLEMS.helgr),
    marriedAway('married-away-fjola-riesentod-vaeren', 'Clan Vaeren', 'marriage-skjor-fjola-vaeren', 'house-vaeren', 'haus-vaeren', HOUSE_EMBLEMS.vaeren),
    marriedAway('married-away-elsa-1696-riesentod-gullvig', 'Clan Gullvig', 'marriage-askold-elsa-gullvig', 'house-gullvig', 'haus-gullvig', HOUSE_EMBLEMS.gullvig),
    marriedAway('married-away-isfir-riesentod-wellensaenger', 'Clan Wellensänger', 'marriage-uthar-isfir-wellensaenger', 'house-wellensaenger', 'haus-wellensaenger', HOUSE_EMBLEMS.wellensaenger)
  ],
  timeJumps: [
    {
      id: FOUNDER_GAP_ID,
      parentPartnershipId: 'marriage-leif-sigrid-riesentod',
      parentPersonId: '',
      childIds: ['toste-riesentod', 'asdis-riesentot'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Absoluter serieller Generationentrenner direkt nach dem Riesentod-Hausknoten.',
      extensions: {}
    },
    {
      id: TOSTE_GAP_ID,
      parentPartnershipId: 'marriage-toste-helga-riesentod',
      parentPersonId: '',
      childIds: ['tonvar-riesentot', 'isbjorg-riesentot', 'geirny-riesentod', 'modolf-riesentod'],
      sharedParentPartnershipIds: [],
      years: 0,
      fromYear: '????',
      toYear: '1566',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Zweiter absolut serieller Generationentrenner unter Toste und Helga; die abgeschlossene Asdis-Seitenlinie wird nicht in ihn eingespeist.',
      extensions: {}
    }
  ],
  lineage: {
    founderPartnershipId: 'marriage-leif-sigrid-riesentod',
    houseId: RIESENTOD_HOUSE_ID,
    crestSubtitle: 'Hesirenclan von Heldenwacht · Königliches Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'leif-riesentod',
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
    chartAlignLineageOriginOverPersonId: 'toste-riesentod',
    sourceRevision: 5,
    sourceModule: 'Clan Riesentod (überlieferte HTML-Familienakte)',
    sourceNote: 'Vollständiger Stammbaum ohne Personenfokus von Leif und Sigrid bis zur jüngsten Generation des Jahres 1740. Die Altquelle schreibt den Namen Riesentot; für Namen und Registerpfad gilt die bestehende Projektform Riesentod, während bereits veröffentlichte technische IDs mit Riesentot aus Gründen stabiler Gegenverknüpfungen erhalten bleiben. Die Übersichtsprosa nennt für Eorlund 1627 als Geburtsjahr, die eigentliche Personen- und Stammbaumtabelle nennt eindeutig 1608; die genealogische Tabelle ist maßgeblich. Die Riesentod-Akte nennt Hranvalds Frau Edla, die Hyrmgarthr-Akte dieselbe Person Yrnhild; Weltpersonen-ID und Ehe bleiben identisch, der Widerspruch ist an beiden Datensätzen dokumentiert. Kinder aus den Ehen Geirný–Kolbjorn, Petka–Torgeir, Fjola–Skjor, Elsa–Askold und Isfir–Uthar bleiben ausschließlich in den jeweiligen Zielakten, damit sie nicht doppelt dargestellt werden. Historische Mündelschaftsnotizen und alle unbenannten Verlobtenfelder der jüngsten Generation werden auf Nutzerwunsch nicht importiert.',
    registryManagedExtensionFields: [
      'blankFamily', 'sourceNote', 'chartLayoutPolicy', 'chartAlignLineageOriginOverPersonId'
    ],
    registryManagedHouseProfileFields: [
      'rankId', 'seat', 'barony', 'county', 'kingdom', 'secondarySeats',
      'liegeHouseId', 'liegeHouseName', 'folderIcons', 'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath'],
    registryTombstones: {
      persons: ['haus-riesentod-gruender', 'haus-riesentod-gruenderin'],
      partnerships: ['haus-riesentod-gruenderbund'],
      parentages: [],
      cadetBranches: [],
      timeJumps: []
    }
  },
  folderPath: KRONENTAL_HOUSE_PROFILES.riesentod.folderPath
});
