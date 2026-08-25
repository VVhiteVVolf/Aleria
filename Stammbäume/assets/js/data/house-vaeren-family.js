import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  ALDRIMAR_HOUSE_EMBLEMS,
  ALDRIMAR_HOUSE_PROFILES
} from './aldrimar-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { IVARSHEIM_HOUSE_EMBLEMS } from './ivarsheim-house-profiles.js';
import { KRONENTAL_HOUSE_EMBLEMS } from './kronental-house-profiles.js';
import { RORIKSHEIM_HOUSE_EMBLEMS } from './roriksheim-house-profiles.js';
import { VORTIGERNS_RUH_HOUSE_EMBLEMS } from './vortigerns-ruh-house-profiles.js';
import { HOUSE_VAEREN_PORTRAITS } from './house-vaeren-portraits.js';

const VAEREN_HOUSE_ID = 'house-vaeren';

const HOUSE_EMBLEMS = Object.freeze({
  vaeren: ALDRIMAR_HOUSE_EMBLEMS.vaeren,
  varangr: ALDRIMAR_HOUSE_EMBLEMS.varangr,
  wargh: ALDRIMAR_HOUSE_EMBLEMS.wargh,
  ragnulf: ALDRIMAR_HOUSE_EMBLEMS.ragnulf,
  varulv: ALDRIMAR_HOUSE_EMBLEMS.varulv,
  pendrag: VORTIGERNS_RUH_HOUSE_EMBLEMS.pendrag,
  trachwyll: IVARSHEIM_HOUSE_EMBLEMS.trachwyll,
  skaal: RORIKSHEIM_HOUSE_EMBLEMS.skaal,
  riesentod: KRONENTAL_HOUSE_EMBLEMS.riesentod,
  eisenbieger: KRONENTAL_HOUSE_EMBLEMS.eisenbieger,
  sturmgeborene: KRONENTAL_HOUSE_EMBLEMS.sturmgeborene,
  frostauge: KRONENTAL_HOUSE_EMBLEMS.frostauge,
  wellenschild: KRONENTAL_HOUSE_EMBLEMS.wellenschild,
  wellensaenger: KRONENTAL_HOUSE_EMBLEMS.wellensaenger,
  holmr: KRONENTAL_HOUSE_EMBLEMS.holmr
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
  'odin-vaeren',
  'oystein-vaeren',
  'balgruuf-vaeren',
  'thorgest-vaeren',
  'siegthrygre-vaeren',
  'sigmir-vaeren',
  'balgruuf-younger-vaeren',
  'rag-vaeren',
  'sigurd-vaeren'
]);

const MAINLINE_IDS = new Set([
  'birger-vaeren',
  'galmar-vaeren'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAINLINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? VAEREN_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    portrait: HOUSE_VAEREN_PORTRAITS[id] || '',
    portraitPlaceholder: options.portraitPlaceholder || 'auto',
    houseId,
    familyRole: options.familyRole || (houseId === VAEREN_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    worldPersonId: options.worldPersonId || (houseId ? '' : `person--haus-vaeren--${id}`),
    houseId,
    familyRole: 'married',
    lineageRole: 'branch'
  });
}

function affair(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    worldPersonId: options.worldPersonId || `person--haus-vaeren--${id}`,
    familyRole: 'affair',
    lineageRole: 'branch',
    title: options.title || 'Affäre',
    tags: [...(options.tags || []), 'Affäre']
  });
}

function awayWoman(id, name, birth, death, targetHouseName, options = {}) {
  return person(id, name, 'female', birth, death, {
    ...options,
    title: options.title || `Wegverheiratet an ${targetHouseName}`,
    tags: [...(options.tags || []), options.engaged ? 'Wegverlobt' : 'Wegverheiratet']
  });
}

function sentWard(id, name, sex, birth, targetHouseName, options = {}) {
  return person(id, name, sex, birth, options.death || '', {
    ...options,
    familyRole: 'ward-away',
    lineageRole: 'branch',
    title: options.title || `Als Mündel an ${targetHouseName} vermittelt`,
    tags: [...(options.tags || []), 'Mündel', 'Fortgegeben']
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

const PARTNERS_BY_ID = Object.freeze({
  'marriage-odin-tuilelaith-vaeren': ['odin-vaeren', 'tuilelaith'],
  'marriage-fridleif-oystein-varangr': ['oystein-vaeren', 'fridleif-varangr'],
  'marriage-hoskuld-bergljot-wargh': ['bergljot-vaeren', 'hoskuld-wargh'],
  'marriage-gudrid-balgruuf-ragnulf': ['balgruuf-vaeren', 'gudrid-ancient-ragnulf'],
  'marriage-thorkell-bjarnhild-varulv': ['bjarnhild-vaeren', 'thorkell-varulv'],
  'marriage-thorgest-eamhair-vaeren': ['thorgest-vaeren', 'eamhair-urquhart'],
  'marriage-rhodri-annegrit': ['rhodri-pendrag', 'annegrit-vaeren'],
  'marriage-siegthrygre-gunnora-vaeren': ['siegthrygre-vaeren', 'gunnora-wellensaenger'],
  'marriage-alfrun-yrsvard-vaeren': ['alfrun-vaeren', 'yrsvard-wellenschild'],
  'marriage-dagrun-griogair-vaeren': ['dagrun-vaeren', 'griogair-ui-diulb'],
  'marriage-birger-arnora-vaeren': ['birger-vaeren', 'arnora-holmr'],
  'affair-sigmir-vorna-vaeren': ['sigmir-vaeren', 'vorna'],
  'affair-sigmir-alfdis-vaeren': ['sigmir-vaeren', 'alfdis'],
  'affair-sigmir-yrgitte-vaeren': ['sigmir-vaeren', 'yrgitte'],
  'marriage-balgruuf-eola-vaeren': ['balgruuf-younger-vaeren', 'eola-sturmgeborene'],
  'marriage-elisef-balgruuf-varangr': ['balgruuf-younger-vaeren', 'elisef-1592-varangr'],
  'engagement-ulfrik-elsa-vaeren': ['ulfrik-vaeren', 'elsa-riesentod'],
  'engagement-helga-zurik-vaeren': ['helga-vaeren', 'zurik-eisenbieger'],
  'marriage-elsa-zurik-eisenbieger': ['elsa-riesentod', 'zurik-eisenbieger'],
  'marriage-astrid-roger-varulv': ['roger-vaeren', 'astrid-varulv'],
  'marriage-alinor-arn-trachwyll': ['arn-vaeren', 'alinor-trachwyll'],
  'engagement-bjoern-svanhild-vaeren': ['bjoern-vaeren', 'svanhild-skaal'],
  'marriage-sinding-sorcha-vaeren': ['sinding-vaeren', 'sorcha-rochraide'],
  'marriage-galmar-gerdur-vaeren': ['galmar-vaeren', 'gerdur'],
  'marriage-rag-lydia-vaeren': ['rag-vaeren', 'lydia-sturmgeborene'],
  'marriage-sigurd-freydis-vaeren': ['sigurd-vaeren', 'freydis-frostauge'],
  'affair-sigurd-katla-vaeren': ['sigurd-vaeren', 'katla'],
  'marriage-gulvar-eydis-ragnulf': ['eydis-vaeren', 'gulvar-ragnulf'],
  'marriage-skjor-fjola-vaeren': ['skjor-vaeren', 'fjola-riesentod'],
  'marriage-sjoring-irmgar-vaeren': ['sjoring-vaeren', 'irmgar-eisenbieger'],
  'affair-sjoring-aava-vaeren': ['sjoring-vaeren', 'aava'],
  'affair-sjoring-drifa-vaeren': ['sjoring-vaeren', 'drifa'],
  'engagement-hildessa-durathor-wargh': ['durathor-vaeren', 'hildessa-wargh']
});

function partnership(id, options = {}) {
  const [firstId, secondId] = PARTNERS_BY_ID[id];
  return createMarriage(id, firstId, secondId, {
    ...options,
    extensions: {
      ...(options.extensions || {}),
      registryManagedFields: [
        'participantIds', 'type', 'status', 'start', 'end', 'certainty', 'visibility', 'notes'
      ],
      ...(options.extensions?.registryManagedExtensionFields
        ? { registryManagedExtensionFields: options.extensions.registryManagedExtensionFields }
        : {})
    }
  });
}

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(childIds, PARTNERS_BY_ID[partnershipId], partnershipId, {
    idPrefix: 'vaeren-parentage',
    ...options
  });
}

function claimedChildren(childIds, partnershipId, timeJumpId) {
  return childrenOf(childIds, partnershipId, {
    certainty: 'claimed',
    notes: 'Zwischen Elternpaar und Kindergeneration liegen nicht einzeln überlieferte Generationen.',
    extensions: { timeJumpId }
  });
}

function marriedAway(id, name, partnershipId, houseId, targetFamilyId, emblem = '', subtitle = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: subtitle || `Wegverheiratet an ${name}`,
    extensions: {
      chartAlignBelowPartnership: true,
      registryManagedFields: [
        'name', 'parentPartnershipId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ],
      registryManagedExtensionFields: ['chartAlignBelowPartnership']
    }
  });
}

function wardAway(id, name, parentPersonId, houseId, targetFamilyId, emblem = '') {
  return createWardAwayBranch({
    id,
    name,
    parentPersonId,
    houseId,
    targetFamilyId,
    emblem,
    subtitle: `Als Mündel an ${name} vermittelt`,
    extensions: {
      registryManagedFields: [
        'name', 'parentPersonId', 'houseId', 'targetFamilyId', 'emblem', 'subtitle'
      ]
    }
  });
}

function timeJump(id, parentPartnershipId, childIds, options = {}) {
  return {
    id,
    parentPartnershipId,
    sharedParentPartnershipIds: [...(options.sharedParentPartnershipIds || [])],
    parentPersonId: '',
    childIds,
    years: 0,
    fromYear: options.fromYear || '????',
    toYear: options.toYear || '????',
    label: options.label || 'Nicht einzeln überlieferte Generationen',
    notes: options.notes || 'Absoluter, serieller Generationentrenner.',
    extensions: {}
  };
}

export const HOUSE_VAEREN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-vaeren',
    title: 'Clan Vaeren',
    motto: '',
    description: 'Königshaus Aldrimars aus Heldenwacht im Jarltum Kronental. Die vollständige überlieferte Linie reicht von Odin bis zu König Sigurd und den Sprösslingen des Jahres 1740.',
    emblem: HOUSE_EMBLEMS.vaeren,
    houseProfile: ALDRIMAR_HOUSE_PROFILES.vaeren
  },
  houses: [
    house(VAEREN_HOUSE_ID, 'Clan Vaeren', HOUSE_EMBLEMS.vaeren),
    house('house-varangr', 'Clan Varangr', HOUSE_EMBLEMS.varangr),
    house('house-wargh', 'Clan Wargh', HOUSE_EMBLEMS.wargh),
    house('house-ragnulf', 'Clan Ragnulf', HOUSE_EMBLEMS.ragnulf),
    house('house-varulv', 'Clan Varulv', HOUSE_EMBLEMS.varulv),
    house('house-pendrag', 'Haus Pendrag', HOUSE_EMBLEMS.pendrag),
    house('house-trachwyll-talfronwyn', "Haus Trachwyll O'Talfronwyn", HOUSE_EMBLEMS.trachwyll),
    house('house-skaal', 'Clan Skaal', HOUSE_EMBLEMS.skaal),
    house('house-riesentod', 'Clan Riesentod', HOUSE_EMBLEMS.riesentod),
    house('house-eisenbieger', 'Clan Eisenbieger', HOUSE_EMBLEMS.eisenbieger),
    house('house-sturmgeborene', 'Clan Sturmgeborene', HOUSE_EMBLEMS.sturmgeborene),
    house('house-frostauge', 'Clan Frostauge', HOUSE_EMBLEMS.frostauge),
    house('house-wellenschild', 'Clan Wellenschild', HOUSE_EMBLEMS.wellenschild),
    house('house-wellensaenger', 'Clan Wellensänger', HOUSE_EMBLEMS.wellensaenger),
    house('house-holmr', 'Clan Holmr', HOUSE_EMBLEMS.holmr),
    house('house-ui-diulb', 'Ui Diulb'),
    house('house-rochraide', 'Ui Rochraide')
  ],
  persons: [
    person('odin-vaeren', 'Odin Vaeren', 'male', '????', '????', { title: 'Sagenhafter Stammvater des Königshauses' }),
    spouse('tuilelaith', 'Tuilelaith', 'female', '????', '????'),

    person('oystein-vaeren', 'Øystein Vaeren', 'male', '????', '????'),
    spouse('fridleif-varangr', 'Fridleif Varangr', 'male', '????', '????', 'house-varangr', {
      notes: 'Die ausgearbeitete Varangr-Gegenakte führt Fridleif als männlich; die Vaeren-Tafel stellt Fridleif dennoch als Partner Øysteins dar.'
    }),
    person('bergljot-vaeren', 'Bergljót Vaeren', 'female', '????', '????'),
    spouse('hoskuld-wargh', 'Hoskuld Wargh', 'male', '????', '????', 'house-wargh'),

    person('balgruuf-vaeren', 'Balgruuf der Ältere Vaeren', 'male', '????', '????'),
    spouse('gudrid-ancient-ragnulf', 'Gudrid Ragnulf', 'female', '????', '????', 'house-ragnulf'),
    person('bjarnhild-vaeren', 'Bjarnhild Vaeren', 'female', '????', '????'),
    spouse('thorkell-varulv', 'Thorkell Varulv', 'male', '????', '????', 'house-varulv'),

    person('thorgest-vaeren', 'Thorgest Vaeren', 'male', '1543', '1585', { title: 'König von Aldrimar' }),
    spouse('eamhair-urquhart', 'Eamhair Urquhart', 'female', '1545', '1627'),
    awayWoman('annegrit-vaeren', 'Annegrit Vaeren', '1548', '1572', 'Haus Pendrag'),
    spouse('rhodri-pendrag', 'Rhodri Pendrag', 'male', '1547', '1613', 'house-pendrag'),

    person('siegthrygre-vaeren', 'Siegthrygre Vaeren', 'male', '1561', '1616', { title: 'König von Aldrimar' }),
    spouse('gunnora-wellensaenger', 'Gunnora Wellensänger', 'female', '1562', '1605', 'house-wellensaenger'),
    awayWoman('alfrun-vaeren', 'Alfrún Vaeren', '1563', '1620', 'Clan Wellenschild'),
    spouse('yrsvard-wellenschild', 'Yrsvard Wellenschild', 'male', '????', '????', 'house-wellenschild'),
    person('hardegon-vaeren', 'Hardegon Vaeren', 'male', '????', '????'),
    awayWoman('dagrun-vaeren', 'Dagrún Vaeren', '1565', '1625', 'Ui Diulb'),
    spouse('griogair-ui-diulb', 'Griogair Ui Diulb', 'male', '????', '????', 'house-ui-diulb'),
    person('birger-vaeren', 'Birger Vaeren', 'male', '1567', '1605'),
    spouse('arnora-holmr', 'Arnóra Holmr', 'female', '????', '????', 'house-holmr'),

    person('sigmir-vaeren', 'Sigmir Vaeren', 'male', '1586', '1616', {
      title: 'König von Aldrimar',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['vorna', 'alfdis', 'yrgitte'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    person('sigrid-vaeren', 'Sigrid Vaeren', 'female', '1590', '1595'),
    affair('vorna', 'Vorna', 'female'),
    affair('alfdis', 'Alfdis', 'female'),
    affair('yrgitte', 'Yrgitte', 'female'),

    person('balgruuf-younger-vaeren', 'Balgruuf der Jüngere Vaeren', 'male', '1585', '1627', {
      title: 'König von Aldrimar',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['eola-sturmgeborene', 'elisef-1592-varangr'],
        registryManagedExtensionFields: [
          'chartCenterBetweenSpousePersonIds',
          'chartCenterBetweenPartnerPersonIds'
        ]
      }
    }),
    spouse('eola-sturmgeborene', 'Eola Sturmgeborene', 'female', '1583', '1608', 'house-sturmgeborene'),
    spouse('elisef-1592-varangr', 'Elisef Varangr', 'female', '1592', '', 'house-varangr'),

    person('ulfrik-vaeren', 'Ulfrik Vaeren', 'male', '1605', '1627'),
    spouse('elsa-riesentod', 'Elsa Riesentod', 'female', '1605', '1675', 'house-riesentod', {
      title: 'Ehemalige Verlobte Ulfriks · später mit Zurik Eisenbieger verheiratet'
    }),
    awayWoman('helga-vaeren', 'Helga Vaeren', '1605', '1627', 'Clan Eisenbieger', { engaged: true, title: 'Wegverlobt an Clan Eisenbieger' }),
    spouse('zurik-eisenbieger', 'Zurik Eisenbieger', 'male', '1597', '1665', 'house-eisenbieger', {
      title: 'Ehemaliger Verlobter Helgas · späterer Ehemann Elsas Riesentod'
    }),
    person('roger-vaeren', 'Roger Vaeren', 'male', '1606', '1627', { title: 'König von Aldrimar' }),
    spouse('astrid-varulv', 'Astrid Varulv', 'female', '1603', '1627', 'house-varulv'),
    person('arn-vaeren', 'Arn Vaeren', 'male', '1608', '1647'),
    spouse('alinor-trachwyll', 'Alinor Trachwyll', 'female', '1619', '1661', 'house-trachwyll-talfronwyn'),
    person('bjoern-vaeren', 'Bjoern Vaeren', 'male', '1610', '1633', {
      title: 'Verlobter Svanhilds',
      tags: ['Verlobt'],
      notes: 'Das in der Biografie erwähnte Patenverhältnis zu Hjalmar Skaal ist keine Mündelschaft.'
    }),
    spouse('svanhild-skaal', 'Svanhild Skaal', 'female', '1613', '1633', 'house-skaal', { title: 'Verlobte Bjoerns', tags: ['Verlobt'] }),
    person('sinding-vaeren', 'Sinding Vaeren', 'male', '1611', '1647', {
      notes: 'Die historische Biografie nennt eine frühere Mündelschaft bei Torvald Varangr. Nach der Vaeren-Regel wird sie nicht als Mündelrahmen der alten Generation dargestellt.'
    }),
    spouse('sorcha-rochraide', 'Sorcha Rochraide', 'female', '????', '????', 'house-rochraide'),
    person('galmar-vaeren', 'Galmar Vaeren', 'male', '1613', '1676'),
    spouse('gerdur', 'Gerdur', 'female', '1630', '1676'),

    person('rollo-vaeren', 'Rollo Vaeren', 'male', '1655', '', { status: 'missing', title: 'Verschollen' }),
    person('ragnar-vaeren', 'Ragnar Vaeren', 'male', '1656', '', { status: 'missing', title: 'Verschollen' }),
    person('rag-vaeren', 'Rag Vaeren', 'male', '1657', '1727', { title: 'König von Aldrimar' }),
    spouse('lydia-sturmgeborene', 'Lydia Sturmgeborene', 'female', '1658', '1733', 'house-sturmgeborene'),

    person('sigurd-vaeren', 'Sigurd Vaeren', 'male', '1690', '', {
      title: 'König von Aldrimar seit 1727',
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['freydis-frostauge', 'katla'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('freydis-frostauge', 'Freydis Frostauge', 'female', '????', '', 'house-frostauge'),
    affair('katla', 'Katla', 'female', '1690', '1720'),
    awayWoman('eydis-vaeren', 'Eydis Vaeren', '1702', '', 'Clan Ragnulf'),
    spouse('gulvar-ragnulf', 'Gulvar Ragnulf', 'male', '1698', '', 'house-ragnulf'),
    person('skjor-vaeren', 'Skjor Vaeren', 'male', '1695', ''),
    spouse('fjola-riesentod', 'Fjola Riesentod', 'female', '1695', '', 'house-riesentod'),
    person('sjoring-vaeren', 'Sjoring Vaeren', 'male', '1700', '1730', {
      extensions: {
        chartCenterBetweenPartnerPersonIds: ['irmgar-eisenbieger', 'aava', 'drifa'],
        registryManagedExtensionFields: ['chartCenterBetweenPartnerPersonIds']
      }
    }),
    spouse('irmgar-eisenbieger', 'Irmgar Eisenbieger', 'female', '????', '', 'house-eisenbieger'),
    affair('aava', 'Aava', 'female', '1694', '1730'),
    affair('drifa', 'Drifa', 'female', '1699', ''),

    person('dain-vaeren', 'Dain Vaeren', 'male', '1712', ''),
    person('dwalin-vaeren', 'Dwalin Vaeren', 'male', '1715', ''),
    person('dunneir-vaeren', 'Dunneir Vaeren', 'male', '1718', '', {
      notes: 'Die Hofliste schreibt den Namen abweichend als Duneirr; die Stammbaumtafel verwendet Dunneir.'
    }),
    sentWard('durathor-vaeren', 'Durathor Vaeren', 'male', '1722', 'Clan Wargh', {
      title: 'Mündel Ketill Warghs · Verlobter Hildessas'
    }),
    spouse('hildessa-wargh', 'Hildessa Wargh', 'female', '1719', '', 'house-wargh', { title: 'Verlobte Durathors', tags: ['Verlobt'] }),
    person('gorm-vaeren', 'Gorm Vaeren', 'female', '1709', '', { familyRole: 'bastard', title: 'Bastardtochter Sigurds und Katlas', tags: ['Bastard'] }),
    person('runa-vaeren', 'Runa Vaeren', 'female', '1721', ''),
    person('guna-vaeren', 'Guna Vaeren', 'female', '1722', ''),
    person('geira-vaeren', 'Geira Vaeren', 'female', '1719', ''),
    person('narve-vaeren', 'Narve Vaeren', 'male', '1720', '', { familyRole: 'bastard', title: 'Bastardsohn Sjorings und Aavas', tags: ['Bastard'] }),
    person('egill-vaeren', 'Egill Vaeren', 'male', '1722', '', { familyRole: 'bastard', title: 'Bastardsohn Sjorings und Drifas', tags: ['Bastard'] })
  ],
  partnerships: [
    partnership('marriage-odin-tuilelaith-vaeren', { status: 'ended' }),
    partnership('marriage-fridleif-oystein-varangr', { status: 'ended' }),
    partnership('marriage-hoskuld-bergljot-wargh', { status: 'ended' }),
    partnership('marriage-gudrid-balgruuf-ragnulf', { status: 'ended' }),
    partnership('marriage-thorkell-bjarnhild-varulv', { status: 'ended' }),
    partnership('marriage-thorgest-eamhair-vaeren', { status: 'widowed', end: '1585' }),
    partnership('marriage-rhodri-annegrit', { status: 'ended', end: '1572' }),
    partnership('marriage-siegthrygre-gunnora-vaeren', { status: 'ended', end: '1605' }),
    partnership('marriage-alfrun-yrsvard-vaeren', { status: 'ended', end: '1620' }),
    partnership('marriage-dagrun-griogair-vaeren', { status: 'ended', end: '1625' }),
    partnership('marriage-birger-arnora-vaeren', { status: 'ended', end: '1605' }),
    partnership('affair-sigmir-vorna-vaeren', { type: 'affair', status: 'ended', visibility: 'private' }),
    partnership('affair-sigmir-alfdis-vaeren', { type: 'affair', status: 'ended', visibility: 'private' }),
    partnership('affair-sigmir-yrgitte-vaeren', { type: 'affair', status: 'ended', visibility: 'private' }),
    partnership('marriage-balgruuf-eola-vaeren', {
      status: 'ended', end: '1608',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'eola-sturmgeborene', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('marriage-elisef-balgruuf-varangr', {
      status: 'ended', end: '1627',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'elisef-1592-varangr', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('engagement-ulfrik-elsa-vaeren', { type: 'engagement', status: 'ended', end: '1627' }),
    partnership('engagement-helga-zurik-vaeren', { type: 'engagement', status: 'ended', end: '1627' }),
    partnership('marriage-elsa-zurik-eisenbieger', { status: 'ended', end: '1665' }),
    partnership('marriage-astrid-roger-varulv', { status: 'ended', end: '1627' }),
    partnership('marriage-alinor-arn-trachwyll', { status: 'ended', end: '1647' }),
    partnership('engagement-bjoern-svanhild-vaeren', { type: 'engagement', status: 'ended', end: '1633' }),
    partnership('marriage-sinding-sorcha-vaeren', { status: 'ended', end: '1647' }),
    partnership('marriage-galmar-gerdur-vaeren', { status: 'ended', end: '1676' }),
    partnership('marriage-rag-lydia-vaeren', { status: 'ended', end: '1727' }),
    partnership('marriage-sigurd-freydis-vaeren', {
      extensions: { chartAlignPartnerOverChildrenPersonId: 'freydis-frostauge', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('affair-sigurd-katla-vaeren', {
      type: 'affair', status: 'ended', end: '1720', visibility: 'private',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'katla', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('marriage-gulvar-eydis-ragnulf'),
    partnership('marriage-skjor-fjola-vaeren'),
    partnership('marriage-sjoring-irmgar-vaeren', {
      status: 'widowed', end: '1730',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'irmgar-eisenbieger', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('affair-sjoring-aava-vaeren', {
      type: 'affair', status: 'ended', end: '1730', visibility: 'private',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'aava', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('affair-sjoring-drifa-vaeren', {
      type: 'affair', status: 'ended', end: '1730', visibility: 'private',
      extensions: { chartAlignPartnerOverChildrenPersonId: 'drifa', registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId'] }
    }),
    partnership('engagement-hildessa-durathor-wargh', { type: 'engagement' })
  ],
  parentages: [
    ...claimedChildren(['oystein-vaeren', 'bergljot-vaeren'], 'marriage-odin-tuilelaith-vaeren', 'gap-odin-oystein-vaeren'),
    ...claimedChildren(['balgruuf-vaeren'], 'marriage-fridleif-oystein-varangr', 'gap-oystein-balgruuf-vaeren'),
    ...claimedChildren(['bjarnhild-vaeren'], 'marriage-hoskuld-bergljot-wargh', 'gap-oystein-balgruuf-vaeren'),
    ...claimedChildren(['thorgest-vaeren'], 'marriage-gudrid-balgruuf-ragnulf', 'gap-balgruuf-thorgest-vaeren'),
    ...claimedChildren(['annegrit-vaeren'], 'marriage-thorkell-bjarnhild-varulv', 'gap-balgruuf-thorgest-vaeren'),
    ...childrenOf(['siegthrygre-vaeren', 'alfrun-vaeren', 'hardegon-vaeren', 'dagrun-vaeren', 'birger-vaeren'], 'marriage-thorgest-eamhair-vaeren'),
    ...childrenOf(['sigmir-vaeren', 'sigrid-vaeren'], 'marriage-siegthrygre-gunnora-vaeren'),
    ...childrenOf(['balgruuf-younger-vaeren'], 'marriage-birger-arnora-vaeren'),
    ...childrenOf(['ulfrik-vaeren', 'helga-vaeren', 'roger-vaeren', 'arn-vaeren'], 'marriage-balgruuf-eola-vaeren'),
    ...childrenOf(['bjoern-vaeren', 'sinding-vaeren', 'galmar-vaeren'], 'marriage-elisef-balgruuf-varangr'),
    ...childrenOf(['rollo-vaeren', 'ragnar-vaeren', 'rag-vaeren'], 'marriage-galmar-gerdur-vaeren'),
    ...childrenOf(['sigurd-vaeren', 'eydis-vaeren', 'skjor-vaeren', 'sjoring-vaeren'], 'marriage-rag-lydia-vaeren'),
    ...childrenOf(['dain-vaeren', 'dwalin-vaeren', 'dunneir-vaeren', 'durathor-vaeren'], 'marriage-sigurd-freydis-vaeren'),
    ...childrenOf(['gorm-vaeren'], 'affair-sigurd-katla-vaeren', { legitimacy: 'illegitimate', visibility: 'private' }),
    ...childrenOf(['runa-vaeren', 'guna-vaeren'], 'marriage-skjor-fjola-vaeren'),
    ...childrenOf(['geira-vaeren'], 'marriage-sjoring-irmgar-vaeren'),
    ...childrenOf(['narve-vaeren'], 'affair-sjoring-aava-vaeren', { legitimacy: 'illegitimate', visibility: 'private' }),
    ...childrenOf(['egill-vaeren'], 'affair-sjoring-drifa-vaeren', { legitimacy: 'illegitimate', visibility: 'private' })
  ],
  cadetBranches: [
    marriedAway('married-away-annegrit-vaeren-pendrag', 'Haus Pendrag', 'marriage-rhodri-annegrit', 'house-pendrag', 'haus-pendrag', HOUSE_EMBLEMS.pendrag),
    marriedAway('married-away-alfrun-vaeren-wellenschild', 'Clan Wellenschild', 'marriage-alfrun-yrsvard-vaeren', 'house-wellenschild', 'haus-wellenschild', HOUSE_EMBLEMS.wellenschild),
    marriedAway('married-away-dagrun-vaeren-ui-diulb', 'Ui Diulb', 'marriage-dagrun-griogair-vaeren', 'house-ui-diulb', 'haus-ui-diulb'),
    marriedAway('engaged-away-helga-vaeren-eisenbieger', 'Clan Eisenbieger', 'engagement-helga-zurik-vaeren', 'house-eisenbieger', 'haus-eisenbieger', HOUSE_EMBLEMS.eisenbieger, 'Wegverlobt an Clan Eisenbieger'),
    marriedAway('married-away-eydis-vaeren-ragnulf', 'Clan Ragnulf', 'marriage-gulvar-eydis-ragnulf', 'house-ragnulf', 'haus-ragnulf', HOUSE_EMBLEMS.ragnulf),
    wardAway('ward-away-durathor-vaeren-wargh', 'Clan Wargh', 'durathor-vaeren', 'house-wargh', 'haus-wargh', HOUSE_EMBLEMS.wargh)
  ],
  timeJumps: [
    timeJump('gap-odin-oystein-vaeren', 'marriage-odin-tuilelaith-vaeren', ['oystein-vaeren', 'bergljot-vaeren'], {
      notes: 'Ein einziger absoluter Generationentrenner folgt dem Gründerpaar und dem Vaeren-Wappen.'
    }),
    timeJump('gap-oystein-balgruuf-vaeren', 'marriage-fridleif-oystein-varangr', ['balgruuf-vaeren', 'bjarnhild-vaeren'], {
      sharedParentPartnershipIds: ['marriage-hoskuld-bergljot-wargh'],
      notes: 'Ein gemeinsamer absoluter Trenner wird von beiden gleichzeitigen Vaeren-Zweigen gespeist; die fachlichen Elternschaften bleiben getrennt.'
    }),
    timeJump('gap-balgruuf-thorgest-vaeren', 'marriage-gudrid-balgruuf-ragnulf', ['thorgest-vaeren', 'annegrit-vaeren'], {
      sharedParentPartnershipIds: ['marriage-thorkell-bjarnhild-varulv'],
      toYear: '1543',
      notes: 'Ein gemeinsamer absoluter Trenner führt die beiden Vorfahrenzweige zur ab 1543 datierten Generation.'
    })
  ],
  lineage: {
    founderPartnershipId: 'marriage-odin-tuilelaith-vaeren',
    houseId: VAEREN_HOUSE_ID,
    crestSubtitle: 'Königshaus Aldrimars · Heldenwacht im Jarltum Kronental',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'odin-vaeren',
    orientation: 'vertical',
    ancestorDepth: 30,
    descendantDepth: 30,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    blankFamily: false,
    preparedMainLine: true,
    jarltum: 'Kronental',
    sourceRevision: 7,
    sourceModule: 'Clan Vaeren (bereitgestellte Altdaten)',
    sourceNote: 'Der vollständige Vaeren-Stammbaum folgt der bereitgestellten Hausseite von Odin bis zur Generation von 1740. Drei Quellenlücken werden ausschließlich als serielle, absolute Generationentrenner dargestellt; die beiden mittleren Trenner vereinen jeweils zwei parallele Vorfahrenpaare, ohne neben einem anderen Knoten zu stehen. Balgruuf der Jüngere steht zwischen seinen beiden Ehefrauen, deren Kinder strikt nach Mutter getrennt bleiben. Dasselbe gilt für Sigurds Ehe und Affäre sowie für Sjorings Ehe und zwei Affären. Die namenlosen Verlobten-Platzhalter der jungen Generation werden nicht angelegt; Durathor behält stattdessen die beidseitig belegte Verlobung mit Hildessa Wargh. Mündelrahmen und Mündelknoten werden ausschließlich bei diesem jungen Sprössling geführt. Bjoerns Patenschaft bei den Skaal und Sinding historische Obhut bei den Varangr werden nicht als alte Mündelrahmen wiederholt. Sigmirs drei überlieferte Affären bleiben sichtbar, aber mangels namentlich belegter Kinder werden keine Bastarde erfunden. Die Schreibweise Riesentot wird zum registrierten Clan Riesentod normalisiert. Die Quelle variiert Dunneir/Duneirr; die Stammbaum-Schreibweise Dunneir bleibt erhalten. Øystein und Fridleif werden in der Varangr-Gegenakte beide männlich geführt, während die Vaeren-Tafel sie als Paar darstellt; die bestehende Weltidentität wird nicht stillschweigend geändert. Gunnoras Wellensänger-Herkunftsakte präzisiert ihre Lebensdaten auf 1562–1605; das Ende ihrer Ehe mit Siegthrygre wird deshalb ebenfalls 1605 geführt.',
    registryTombstones: {
      persons: ['haus-vaeren-gruender', 'haus-vaeren-gruenderin'],
      partnerships: ['marriage-haus-vaeren-founders']
    },
    registryManagedExtensionFields: ['blankFamily', 'preparedMainLine', 'jarltum', 'sourceNote'],
    registryManagedHouseProfileFields: [
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'secondarySeats',
      'liegeHouseId',
      'liegeHouseName',
      'folderIcons',
      'regionEmblems'
    ],
    registryManagedRecordFields: ['folderPath']
  }
});
