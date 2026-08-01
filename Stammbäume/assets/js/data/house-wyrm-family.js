import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { AEHRENTAL_HOUSE_EMBLEMS } from './aehrental-house-profiles.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import { GRAUE_WEITE_HOUSE_EMBLEMS } from './graue-weite-house-profiles.js';
import { HOUSE_WYRM_PORTRAITS } from './house-wyrm-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  coedwig: GRAUE_WEITE_HOUSE_EMBLEMS.coedwig,
  arwydd: 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
  gwefrydd: 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  saethwyr: 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
  sgwarnog: AEHRENTAL_HOUSE_EMBLEMS.sgwarnog,
  wylan: 'assets/images/houses/Weidebucht/haus-wylan.png',
  wyrm: 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png'
});

const HOUSE_HEAD_IDS = new Set([
  'tryffin-draig',
  'gwastad-wyrm',
  'rhydderch-wyrm',
  'gallgoid-wyrm',
  'gwlyddyn-wyrm',
  'mailgwin-wyrm'
]);
const MAIN_LINE_IDS = new Set(['shan-wyrm', 'gavin-wyrm']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function worldPersonId(houseId, personId) {
  const familyId = String(houseId || 'house-wyrm').replace(/^house-/, 'haus-');
  return `person--${familyId}--${personId}`;
}

function member(id, name, sex, birth, death = '', options = {}) {
  const houseId = options.houseId || 'house-wyrm';
  return {
    id,
    worldPersonId: options.worldPersonId || worldPersonId(houseId, id),
    name,
    title: '',
    sex,
    status: death ? 'dead' : 'alive',
    birth,
    death,
    portrait: HOUSE_WYRM_PORTRAITS[id] || '',
    portraitPlaceholder: 'auto',
    houseId,
    familyRole: options.familyRole || 'core',
    lineageRole: options.lineageRole || lineageRoleFor(id),
    tags: [],
    notes: options.notes || ''
  };
}

function spouse(id, name, sex, birth, death, houseId) {
  return member(id, name, sex, birth, death, { houseId, familyRole: 'married' });
}

function marriage(id, firstId, secondId) {
  return {
    id,
    participantIds: [firstId, secondId],
    type: 'marriage',
    status: 'active',
    start: '',
    end: '',
    certainty: 'confirmed',
    visibility: 'public',
    notes: '',
    extensions: {}
  };
}

function marriedAway(id, name, parentPartnershipId, houseId, emblem = '') {
  return {
    id,
    name,
    subtitle: 'Wegverheiratete Linie',
    linkType: 'married-away',
    parentPartnershipId,
    houseId,
    emblem,
    crestFrame: 'gold',
    founded: '',
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    notes: '',
    extensions: {}
  };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  const type = options.type || 'biological';
  return childIds.map(childId => ({
    id: `parentage-${childId}`,
    childId,
    parentIds,
    partnershipId,
    type,
    legitimacy: type === 'claimed' ? 'unknown' : 'legitimate',
    certainty: type === 'claimed' ? 'probable' : 'confirmed',
    visibility: 'public',
    notes: options.notes || '',
    extensions: options.timeJumpId ? { timeJumpId: options.timeJumpId } : {}
  }));
}

const FOUNDER_IDS = ['tryffin-draig', 'rhianwyn-saethwyr'];
const GWASTAD_FAMILY_IDS = ['gwastad-wyrm', 'myfanwy-saethwyr'];
const RHYDDERCH_FAMILY_IDS = ['rhydderch-wyrm', 'heulwen-draig'];
const GALLGOID_FAMILY_IDS = ['gallgoid-wyrm', 'dylis-dyngwn'];
const CYNWRIG_FAMILY_IDS = ['cynwrig-wyrm', 'angharad-gwyvern'];
const GWLYDDYN_FAMILY_IDS = ['gwlyddyn-wyrm', 'mairead-eirce'];
const EFNISIEN_FAMILY_IDS = ['efnisien-wyrm', 'cairenn-fiachrach'];
const MAILGWIN_FAMILY_IDS = ['mailgwin-wyrm', 'ceridwen-draig'];
const DERWEN_FAMILY_IDS = ['derwen-wyrm', 'elaine-saethwyr'];
const EIDDON_FAMILY_IDS = ['eiddon-wyrm', 'iseult-arwydd'];
const SHAN_FAMILY_IDS = ['shan-wyrm', 'neala-wylan'];
const RHYDIAN_FAMILY_IDS = ['rhydian-wyrm', 'mabli-swgarnog'];
const SION_FAMILY_IDS = ['sion-wyrm', 'anouk-rosenblueht'];
const PADRIG_FAMILY_IDS = ['padrig-wyrm', 'sorcha-cein'];

export const HOUSE_WYRM_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-wyrm',
    title: 'Haus Wyrm',
    motto: '',
    description: 'Die überlieferte Hauptlinie des Hauses Wyrm von Tryffin Draig und Rhianwyn Saethwyr bis zur Generation von 1729.',
    emblem: HOUSE_EMBLEMS.wyrm,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.wyrm
  },
  houses: [
    { id: 'house-wyrm', name: 'Haus Wyrm', motto: '', emblem: HOUSE_EMBLEMS.wyrm, status: 'active' },
    { id: 'house-draig', name: 'Haus Draig', motto: '', emblem: HOUSE_EMBLEMS.draig, status: 'active' },
    { id: 'house-saethwyr', name: 'Haus Saethwyr', motto: '', emblem: HOUSE_EMBLEMS.saethwyr, status: 'active' },
    { id: 'house-blach', name: 'Haus Blach', motto: '', emblem: '', status: 'active' },
    { id: 'house-gafyr', name: 'Haus Gafyr', motto: '', emblem: HOUSE_EMBLEMS.gafyr, status: 'active' },
    { id: 'house-dyngwn', name: 'Haus Dyngwn', motto: '', emblem: '', status: 'active' },
    { id: 'house-mwyalchen', name: 'Haus Mwyalchen', motto: '', emblem: '', status: 'active' },
    { id: 'house-gwyvern', name: 'Haus Gwyvern', motto: '', emblem: HOUSE_EMBLEMS.gwyvern, status: 'active' },
    { id: 'house-grael', name: 'Haus Grael', motto: '', emblem: '', status: 'active' },
    { id: 'house-eirce', name: 'Haus Eirce', motto: '', emblem: '', status: 'active' },
    { id: 'house-gwefrydd', name: 'Haus Gwefrydd', motto: '', emblem: HOUSE_EMBLEMS.gwefrydd, status: 'active' },
    { id: 'house-fiachrach', name: 'Haus Fiachrach', motto: '', emblem: '', status: 'active' },
    { id: 'house-dinefwr', name: 'Haus Dinefwr', motto: '', emblem: '', status: 'active' },
    { id: 'house-coedwig', name: 'Haus Coedwig', motto: '', emblem: HOUSE_EMBLEMS.coedwig, status: 'active' },
    { id: 'house-arwydd', name: 'Haus Arwydd', motto: '', emblem: HOUSE_EMBLEMS.arwydd, status: 'active' },
    { id: 'house-wylan', name: 'Haus Wylan', motto: '', emblem: HOUSE_EMBLEMS.wylan, status: 'active' },
    { id: 'house-tiwna', name: 'Haus Tiwna', motto: '', emblem: '', status: 'active' },
    { id: 'house-sgwarnog', name: 'Haus Sgwarnog', motto: '', emblem: HOUSE_EMBLEMS.sgwarnog, status: 'active' },
    { id: 'house-rosenblueht', name: 'Haus Rosenblüht', motto: '', emblem: '', status: 'active' },
    { id: 'house-cein', name: 'Haus Céin', motto: '', emblem: '', status: 'active' }
  ],
  persons: [
    // Begründerpaar und erste wieder belegte Generation
    member('tryffin-draig', 'Tryffin Draig', 'male', '1098', '1171', { houseId: 'house-draig' }),
    spouse('rhianwyn-saethwyr', 'Rhianwyn Saethwyr', 'female', '1100', '1177', 'house-saethwyr'),
    member('gwastad-wyrm', 'Gwastad', 'male', '1249', '1311'),
    member('jeannae-wyrm', 'Jeannae', 'female', '1249', '1704', {
      notes: 'Die ungewöhnlich lange Lebensspanne wurde unverändert aus der Zahlentabelle übernommen.'
    }),
    spouse('myfanwy-saethwyr', 'Myfanwy Saethwyr', 'female', '1252', '1297', 'house-saethwyr'),
    spouse('aeron-blach', 'Aeron Blach', 'male', '1246', '1288', 'house-blach'),

    // Nach der zweiten Überlieferungslücke
    member('rhydderch-wyrm', 'Rhydderch', 'male', '1599', '1665'),
    member('lynesse-wyrm-1598', 'Lynesse', 'female', '1598', '1666'),
    spouse('heulwen-draig', 'Heulwen Draig', 'female', '1600', '1666', 'house-draig'),
    spouse('mathonwy-gafyr', 'Mathonwy Gafyr', 'male', '1593', '1659', 'house-gafyr'),

    // Kinder von Rhydderch und Heulwen
    member('gallgoid-wyrm', 'Gallgoid', 'male', '1624', '1685'),
    member('ceridwen-wyrm', 'Ceridwen', 'female', '1636', '1689'),
    member('cynwrig-wyrm', 'Cynwrig', 'male', '1630', '1701'),
    member('lynesse-wyrm-1632', 'Lynesse', 'female', '1632', '1698'),
    spouse('dylis-dyngwn', 'Dylis Dyngwn', 'female', '1630', '1704', 'house-dyngwn'),
    spouse('arglwydd-mwyalchen', 'Arglwydd Mwyalchen', 'male', '1634', '1698', 'house-mwyalchen'),
    spouse('angharad-gwyvern', 'Angharad Gwyvern', 'female', '1635', '1709', 'house-gwyvern'),
    spouse('galahad-grael', 'Galahad Grael', 'male', '1627', '1701', 'house-grael'),

    // Nächste Hauptäste
    member('gwlyddyn-wyrm', 'Gwlyddyn', 'male', '1650', '1717'),
    member('sulwen-wyrm', 'Sulwen', 'female', '1652', '1711'),
    member('efnisien-wyrm', 'Efnisien', 'male', '1652', '1715'),
    member('lynesse-wyrm-1649', 'Lynesse', 'female', '1649', '1723'),
    spouse('mairead-eirce', 'Mairead Eirce', 'female', '1650', '1698', 'house-eirce'),
    spouse('steffon-gwefrydd', 'Steffon Gwefrydd', 'male', '1648', '1703', 'house-gwefrydd'),
    spouse('cairenn-fiachrach', 'Cairenn Fiachrach', 'female', '1653', '1702', 'house-fiachrach'),
    spouse('carnedyr-dinefwr', 'Carnedyr Dinefwr', 'male', '1647', '1715', 'house-dinefwr'),

    // Generation 1669 bis 1675
    member('mailgwin-wyrm', 'Mailgwin', 'male', '1669'),
    member('celyn-wyrm', 'Célyn', 'female', '1672'),
    member('derwen-wyrm', 'Derwen', 'male', '1674'),
    member('eiddon-wyrm', 'Eiddon', 'male', '1671'),
    member('olwen-wyrm', 'Olwen', 'female', '1675'),
    spouse('ceridwen-draig', 'Ceridwen Draig', 'female', '1670', '', 'house-draig'),
    spouse('trahaern-coedwig', 'Trahaearn Coedwig', 'male', '1673', '', 'house-coedwig'),
    spouse('elaine-saethwyr', 'Elaine Saethwyr', 'female', '1675', '', 'house-saethwyr'),
    spouse('iseult-arwydd', 'Iseult Arwydd', 'female', '1675', '', 'house-arwydd'),
    spouse('maredudd-gwyvern', 'Maredudd Gwyvern', 'male', '1671', '1720', 'house-gwyvern'),

    // Generation 1692 bis 1702
    member('shan-wyrm', 'Shan', 'unknown', '1692'),
    member('aelwyd-wyrm', 'Aelwyd', 'female', '1701'),
    member('rhydian-wyrm', 'Rhydian', 'male', '1694'),
    member('sion-wyrm', 'Sion', 'male', '1696'),
    member('marve-wyrm', 'Marve', 'female', '1702'),
    member('bronwyn-wyrm', 'Bronwyn', 'female', '1697'),
    member('padrig-wyrm', 'Padrig', 'male', '1699'),
    member('meriel-wyrm', 'Meriel', 'female', '1701'),
    spouse('neala-wylan', 'Neala Wylan', 'unknown', '1693', '', 'house-wylan'),
    spouse('cadfan-tiwna', 'Cadfan Tiwna', 'male', '1696', '', 'house-tiwna'),
    spouse('mabli-swgarnog', 'Mabil Sgwarnog', 'female', '1694', '', 'house-sgwarnog'),
    spouse('anouk-rosenblueht', 'Anouk Rosenblüht', 'female', '1699', '', 'house-rosenblueht'),
    spouse('idwallon-blach', 'Idwallon Blach', 'male', '1704', '', 'house-blach'),
    spouse('marmaduke-saethwyr', 'Marmaduke Saethwyr', 'male', '1695', '', 'house-saethwyr'),
    spouse('sorcha-cein', 'Sorcha Céin', 'female', '1701', '', 'house-cein'),
    spouse('dean-dyngwn', 'Dean Dyngwn', 'male', '1700', '', 'house-dyngwn'),

    // Jüngste in der Tabelle benannte Generation
    member('gavin-wyrm', 'Gavin', 'male', '1720'),
    member('eleri-wyrm', 'Eleri', 'female', '1724'),
    member('enan-wyrm', 'Enan', 'male', '1718'),
    member('rianna-wyrm', 'Rianna', 'female', '1721'),
    member('fotor-wyrm', 'Fotor', 'male', '1729?', '', { notes: 'Das Geburtsjahr ist in der Quelle als unsicher markiert.' }),
    member('marvo-wyrm', 'Marvo', 'male', '1722'),
    member('marvine-wyrm', 'Marvine', 'female', '1723'),
    member('gais-wyrm', 'Gais', 'male', '1721'),
    member('eilir-wyrm', 'Eilir', 'unknown', '1723'),
    member('tudor-wyrm', 'Tudor', 'male', '1725')
  ],
  partnerships: [
    marriage('marriage-tryffin-rhianwyn', ...FOUNDER_IDS),
    marriage('marriage-gwastad-myfanwy', ...GWASTAD_FAMILY_IDS),
    marriage('marriage-jeannae-aeron', 'jeannae-wyrm', 'aeron-blach'),
    marriage('marriage-rhydderch-heulwen', ...RHYDDERCH_FAMILY_IDS),
    marriage('marriage-lynesse-mathonwy', 'lynesse-wyrm-1598', 'mathonwy-gafyr'),
    marriage('marriage-gallgoid-dylis', ...GALLGOID_FAMILY_IDS),
    marriage('marriage-ceridwen-arglwydd', 'ceridwen-wyrm', 'arglwydd-mwyalchen'),
    marriage('marriage-cynwrig-angharad', ...CYNWRIG_FAMILY_IDS),
    marriage('marriage-lynesse-galahad', 'lynesse-wyrm-1632', 'galahad-grael'),
    marriage('marriage-gwlyddyn-mairead', ...GWLYDDYN_FAMILY_IDS),
    marriage('marriage-sulwen-steffon', 'sulwen-wyrm', 'steffon-gwefrydd'),
    marriage('marriage-efnisien-cairenn', ...EFNISIEN_FAMILY_IDS),
    marriage('marriage-lynesse-carnedyr', 'lynesse-wyrm-1649', 'carnedyr-dinefwr'),
    marriage('marriage-mailgwin-ceridwen', ...MAILGWIN_FAMILY_IDS),
    marriage('marriage-celyn-trahaern', 'celyn-wyrm', 'trahaern-coedwig'),
    marriage('marriage-derwen-elaine', ...DERWEN_FAMILY_IDS),
    marriage('marriage-eiddon-iseult', ...EIDDON_FAMILY_IDS),
    marriage('marriage-olwen-maredudd', 'olwen-wyrm', 'maredudd-gwyvern'),
    marriage('marriage-shan-neala', ...SHAN_FAMILY_IDS),
    marriage('marriage-aelwyd-cadfan', 'aelwyd-wyrm', 'cadfan-tiwna'),
    marriage('marriage-rhydian-mabli', ...RHYDIAN_FAMILY_IDS),
    marriage('marriage-sion-anouk', ...SION_FAMILY_IDS),
    marriage('marriage-marve-idwallon', 'marve-wyrm', 'idwallon-blach'),
    marriage('marriage-bronwyn-marmaduke', 'bronwyn-wyrm', 'marmaduke-saethwyr'),
    marriage('marriage-padrig-sorcha', ...PADRIG_FAMILY_IDS),
    marriage('marriage-meriel-dean', 'meriel-wyrm', 'dean-dyngwn')
  ],
  parentages: [
    ...childrenOf(
      ['gwastad-wyrm', 'jeannae-wyrm'],
      FOUNDER_IDS,
      'marriage-tryffin-rhianwyn',
      { type: 'claimed', notes: 'Die Vorlage zeigt zwischen Gründerwappen und dieser Generation eine Überlieferungslücke.' }
    ),
    ...childrenOf(
      ['rhydderch-wyrm', 'lynesse-wyrm-1598'],
      GWASTAD_FAMILY_IDS,
      'marriage-gwastad-myfanwy',
      {
        type: 'claimed',
        timeJumpId: 'gap-gwastad-rhydderch',
        notes: 'Zwischen beiden belegten Generationen liegen mehrere nicht einzeln überlieferte Abstammungsglieder.'
      }
    ),
    ...childrenOf(
      ['gallgoid-wyrm', 'ceridwen-wyrm', 'cynwrig-wyrm', 'lynesse-wyrm-1632'],
      RHYDDERCH_FAMILY_IDS,
      'marriage-rhydderch-heulwen'
    ),
    ...childrenOf(['gwlyddyn-wyrm', 'sulwen-wyrm'], GALLGOID_FAMILY_IDS, 'marriage-gallgoid-dylis'),
    ...childrenOf(['efnisien-wyrm', 'lynesse-wyrm-1649'], CYNWRIG_FAMILY_IDS, 'marriage-cynwrig-angharad'),
    ...childrenOf(['mailgwin-wyrm', 'celyn-wyrm', 'derwen-wyrm'], GWLYDDYN_FAMILY_IDS, 'marriage-gwlyddyn-mairead'),
    ...childrenOf(['eiddon-wyrm', 'olwen-wyrm'], EFNISIEN_FAMILY_IDS, 'marriage-efnisien-cairenn'),
    ...childrenOf(['shan-wyrm', 'aelwyd-wyrm'], MAILGWIN_FAMILY_IDS, 'marriage-mailgwin-ceridwen'),
    ...childrenOf(['rhydian-wyrm', 'sion-wyrm', 'marve-wyrm'], DERWEN_FAMILY_IDS, 'marriage-derwen-elaine'),
    ...childrenOf(['bronwyn-wyrm', 'padrig-wyrm', 'meriel-wyrm'], EIDDON_FAMILY_IDS, 'marriage-eiddon-iseult'),
    ...childrenOf(['gavin-wyrm', 'eleri-wyrm'], SHAN_FAMILY_IDS, 'marriage-shan-neala'),
    ...childrenOf(['enan-wyrm', 'rianna-wyrm', 'fotor-wyrm'], RHYDIAN_FAMILY_IDS, 'marriage-rhydian-mabli'),
    ...childrenOf(['marvo-wyrm', 'marvine-wyrm'], SION_FAMILY_IDS, 'marriage-sion-anouk'),
    ...childrenOf(['gais-wyrm', 'eilir-wyrm', 'tudor-wyrm'], PADRIG_FAMILY_IDS, 'marriage-padrig-sorcha')
  ],
  lineage: {
    founderPartnershipId: 'marriage-tryffin-rhianwyn',
    houseId: 'house-wyrm',
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 72,
      fromYear: '1177',
      toYear: '1249',
      label: 'Die belegte Linie setzt 1249 wieder ein'
    }
  },
  cadetBranches: [
    marriedAway('married-away-blach-jeannae', 'Haus Blach', 'marriage-jeannae-aeron', 'house-blach'),
    marriedAway('married-away-gafyr-lynesse', 'Haus Gafyr', 'marriage-lynesse-mathonwy', 'house-gafyr'),
    marriedAway('married-away-mwyalchen', 'Haus Mwyalchen', 'marriage-ceridwen-arglwydd', 'house-mwyalchen'),
    marriedAway('married-away-grael', 'Haus Grael', 'marriage-lynesse-galahad', 'house-grael'),
    marriedAway('married-away-gwefrydd', 'Haus Gwefrydd', 'marriage-sulwen-steffon', 'house-gwefrydd'),
    marriedAway('married-away-dinefwr', 'Haus Dinefwr', 'marriage-lynesse-carnedyr', 'house-dinefwr'),
    marriedAway('married-away-coedwig', 'Haus Coedwig', 'marriage-celyn-trahaern', 'house-coedwig', HOUSE_EMBLEMS.coedwig),
    marriedAway('married-away-gwyvern', 'Haus Gwyvern', 'marriage-olwen-maredudd', 'house-gwyvern'),
    marriedAway('married-away-tiwna', 'Haus Tiwna', 'marriage-aelwyd-cadfan', 'house-tiwna'),
    marriedAway('married-away-blach-marve', 'Haus Blach', 'marriage-marve-idwallon', 'house-blach'),
    marriedAway('married-away-saethwyr', 'Haus Saethwyr', 'marriage-bronwyn-marmaduke', 'house-saethwyr'),
    marriedAway('married-away-dyngwn', 'Haus Dyngwn', 'marriage-meriel-dean', 'house-dyngwn')
  ],
  timeJumps: [
    {
      id: 'gap-gwastad-rhydderch',
      parentPartnershipId: 'marriage-gwastad-myfanwy',
      childIds: ['rhydderch-wyrm', 'lynesse-wyrm-1598'],
      years: 287,
      fromYear: '1311',
      toYear: '1598',
      label: 'Die belegte Linie setzt im 16. Jahrhundert wieder ein',
      notes: 'Die dazwischenliegenden Generationen sind in der Vorlage nicht einzeln benannt.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tryffin-draig',
    orientation: 'vertical',
    ancestorDepth: 10,
    descendantDepth: 10,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Beziehungen, Lebensdaten und Portraitzuordnungen nach der bereitgestellten Tabelle und Stammbaumgrafik. Externe Portraitquellen wurden als lokale Projektdateien gesichert; unbenannte Verlobte wurden nicht als Personen angelegt.',
    blankFamily: false,
    sourceRevision: 3
  }
});
