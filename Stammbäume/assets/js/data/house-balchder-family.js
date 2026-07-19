import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_BALCHDER_PORTRAITS } from './house-balchder-portraits.js';

const BALCHDER_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-balchder.png';
const BALCHDER_HOUSE_ID = 'house-balchder';
const HOUSE_HEAD_IDS = new Set([
  'caedmon-balchder',
  'uther-balchder',
  'dalvin-balchder'
]);
const MAIN_LINE_IDS = new Set([
  'avan-balchder',
  'armel-balchder',
  'owen-balchder'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = BALCHDER_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_BALCHDER_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === BALCHDER_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '') {
  return person(id, name, sex, birth, death, '', { familyRole: 'married' });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['caedmon-balchder', 'eilonwy'];
const UTHER_IDS = ['uther-balchder', 'millena-eneiniog'];
const BRONWEN_IDS = ['bronwen-balchder', 'lugh-seldryn'];
const TREVON_IDS = ['trevon-balchder', 'niya'];
const DALVIN_IDS = ['dalvin-balchder', 'iseult-caerlaen'];
const GENOFEVA_IDS = ['genofeva-balchder', 'alastair-gwyntog'];
const KLERVI_IDS = ['klervi-balchder', 'rhain-cludwyr'];
const KIMBALL_IDS = ['kimball-balchder', 'revelyn'];
const AERONA_IDS = ['aerona-balchder', 'godwyn-sgrechiwr'];
const AVAN_IDS = ['avan-balchder', 'ronda-rhyddid'];
const CERRIN_IDS = ['cerrin-balchder', 'wyett-barus'];
const KAMBER_IDS = ['kamber-balchder', 'senara-gelyn'];
const JENELLE_IDS = ['jenelle-balchder', 'harald'];
const MARVEN_IDS = ['marven-balchder', 'morgaine-chwedlonol'];

export const HOUSE_BALCHDER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-balchder',
    title: 'Haus Balchder',
    motto: 'Feder und Pflicht.',
    description: 'Die belegte Linie des Ritterherrenhauses Balchder unter Haus Draig: von Gründer Caedmon bis zur jüngsten Generation des Jahres 1730.',
    emblem: BALCHDER_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.balchder
  },
  houses: [
    { id: BALCHDER_HOUSE_ID, name: 'Haus Balchder', motto: 'Feder und Pflicht.', emblem: BALCHDER_EMBLEM, status: 'active' },
    house('house-eneiniog', 'Haus Eneiniog', 'assets/images/houses/Llamreis Ankunft/haus-eneiniog.png'),
    house('house-seldryn', 'Haus Seldryn'),
    house('house-caerlaen', 'Haus Caerlaen'),
    house('house-gwyntog', 'Haus Gwyntog'),
    house('house-cludwyr', 'Haus Cludwyr', 'assets/images/houses/Llamreis Ankunft/haus-cludwyr.png'),
    house('house-sgrechiwr', 'Haus Sgrechiwr', 'assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png'),
    house('house-rhyddid', 'Haus Rhyddid', 'assets/images/houses/Llamreis Ankunft/haus-rhyddid.png'),
    house('house-barus', 'Haus Barus'),
    house('house-gelyn', 'Haus Gelyn', 'assets/images/houses/Llamreis Ankunft/haus-gelyn.png'),
    house('house-chwedlonol', 'Haus Chwedonol', 'assets/images/houses/Llamreis Ankunft/haus-chwedlonol.png'),
    house('house-gwared', 'Haus Gwared', 'assets/images/houses/Rhonwens Tränen/Ritterliche/Gwared.png')
  ],
  persons: [
    // Gründerpaar
    person('caedmon-balchder', 'Caedmon Balchder', 'male', '????', '????', BALCHDER_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Balchder'
    }),
    spouse('eilonwy', 'Eilonwy', 'female', '????', '????'),

    // Erste einzeln belegte Generation nach der Überlieferungslücke
    person('uther-balchder', 'Uther Balchder', 'male', '1648', '1730', BALCHDER_HOUSE_ID, {
      title: 'Ehemaliger Ritterherr des Hauses Balchder'
    }),
    person('millena-eneiniog', 'Millena Eneiniog', 'female', '1652', '1737', 'house-eneiniog'),
    person('bronwen-balchder', 'Bronwen Balchder', 'female', '1653', '1719'),
    person('lugh-seldryn', 'Lugh Seldryn', 'male', '1650', '1720', 'house-seldryn'),
    person('trevon-balchder', 'Trevon Balchder', 'male', '1657', '1720'),
    spouse('niya', 'Niya', 'female', '1660', '1739'),

    // Kinder von Uther und Millena sowie Trevon und Niya
    person('dalvin-balchder', 'Dalvin Balchder', 'male', '1670', '', BALCHDER_HOUSE_ID, {
      title: 'Ritterherr des Hauses Balchder',
      notes: 'Seit 1730 Oberhaupt des Hauses Balchder.'
    }),
    person('iseult-caerlaen', 'Iseult Caerlaen', 'female', '1675', '', 'house-caerlaen'),
    person('genofeva-balchder', 'Genofeva Balchder', 'female', '1676', ''),
    person('alastair-gwyntog', 'Alastair Gwyntog', 'male', '1671', '', 'house-gwyntog'),
    person('klervi-balchder', 'Klervi Balchder', 'female', '1678', ''),
    person('rhain-cludwyr', 'Rhain Cludwyr', 'male', '1674', '', 'house-cludwyr'),
    person('kimball-balchder', 'Kimball Balchder', 'male', '1680', ''),
    spouse('revelyn', 'Revelyn', 'female', '1680', ''),

    // Kinder von Dalvin und Iseult; Aerona ist ausdrücklich die älteste Tochter
    person('aerona-balchder', 'Aerona Balchder', 'female', '????', '', BALCHDER_HOUSE_ID, {
      notes: 'Älteste Tochter Dalvins und Iseults; an Godwyn Sgrechiwr wegverheiratet.'
    }),
    person('godwyn-sgrechiwr', 'Godwyn Sgrechiwr', 'male', '????', '', 'house-sgrechiwr'),
    person('avan-balchder', 'Avan Balchder', 'male', '1690', ''),
    person('ronda-rhyddid', 'Ronda Rhyddid', 'female', '1696', '', 'house-rhyddid'),
    person('cerrin-balchder', 'Cerrin Balchder', 'female', '1697', ''),
    person('wyett-barus', 'Wyett Barus', 'male', '1691', '', 'house-barus'),
    person('kamber-balchder', 'Kamber Balchder', 'male', '1700', ''),
    person('senara-gelyn', 'Senara Gelyn', 'female', '1704', '', 'house-gelyn'),

    // Kinder von Kimball und Revelyn
    person('jenelle-balchder', 'Jenelle Balchder', 'female', '1698', ''),
    spouse('harald', 'Harald', 'male', '1699', ''),
    person('marven-balchder', 'Marven Balchder', 'male', '1698', ''),
    person('morgaine-chwedlonol', 'Morgaine Chwedonol', 'female', '1695', '', 'house-chwedlonol'),

    // Kinder von Avan und Ronda; Sheev ist Avans Mündel, kein leibliches Kind
    person('armel-balchder', 'Armel Balchder', 'male', '1717', ''),
    person('anwen-balchder', 'Anwen Balchder', 'female', '1721', ''),
    person('brina-balchder', 'Brina Balchder', 'female', '1726', ''),
    person('owen-balchder', 'Owen Balchder', 'male', '1727', ''),
    person('sheev-gwared', 'Sheev Gwared', 'male', '1720', '', 'house-gwared', {
      familyRole: 'ward',
      notes: 'Aufgenommenes Mündel Avans und Gast des Hauses Balchder; Avan ist sein Vormund, nicht sein Vater.'
    }),

    // Kinder von Kamber und Senara
    person('blodwen-balchder', 'Blodwen Balchder', 'female', '1722', ''),
    person('rice-balchder', 'Rice Balchder', 'male', '1728', ''),

    // Kinder von Jenelle und Harald
    person('eniana-balchder', 'Eniana Balchder', 'female', '1720', ''),
    person('jareth-balchder', 'Jareth Balchder', 'male', '1723', ''),
    person('lynnia-balchder', 'Lynnia Balchder', 'female', '1730', '')
  ],
  partnerships: [
    createMarriage('marriage-caedmon-eilonwy', ...FOUNDER_IDS),
    createMarriage('marriage-uther-millena', ...UTHER_IDS),
    createMarriage('marriage-bronwen-lugh', ...BRONWEN_IDS),
    createMarriage('marriage-trevon-niya', ...TREVON_IDS),
    createMarriage('marriage-dalvin-iseult', ...DALVIN_IDS),
    createMarriage('marriage-genofeva-alastair', ...GENOFEVA_IDS),
    createMarriage('marriage-klervi-rhain', ...KLERVI_IDS),
    createMarriage('marriage-kimball-revelyn', ...KIMBALL_IDS),
    createMarriage('marriage-aerona-godwyn', ...AERONA_IDS),
    createMarriage('marriage-avan-ronda', ...AVAN_IDS),
    createMarriage('marriage-cerrin-wyett', ...CERRIN_IDS),
    createMarriage('marriage-kamber-senara', ...KAMBER_IDS),
    createMarriage('marriage-jenelle-harald', ...JENELLE_IDS),
    createMarriage('marriage-marven-morgaine', ...MARVEN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['uther-balchder', 'bronwen-balchder', 'trevon-balchder'],
      FOUNDER_IDS,
      'marriage-caedmon-eilonwy',
      { type: 'claimed', certainty: 'probable' }
    ),
    ...childrenOf(['dalvin-balchder', 'genofeva-balchder'], UTHER_IDS, 'marriage-uther-millena'),
    ...childrenOf(['klervi-balchder', 'kimball-balchder'], TREVON_IDS, 'marriage-trevon-niya'),
    ...childrenOf(
      ['aerona-balchder', 'avan-balchder', 'cerrin-balchder', 'kamber-balchder'],
      DALVIN_IDS,
      'marriage-dalvin-iseult'
    ),
    ...childrenOf(['jenelle-balchder', 'marven-balchder'], KIMBALL_IDS, 'marriage-kimball-revelyn'),
    ...childrenOf(
      ['armel-balchder', 'anwen-balchder', 'brina-balchder', 'owen-balchder'],
      AVAN_IDS,
      'marriage-avan-ronda'
    ),
    ...childrenOf(['sheev-gwared'], ['avan-balchder'], '', {
      type: 'foster',
      legitimacy: 'unknown',
      notes: 'Sheev Gwared ist Avans aufgenommenes Mündel. Die Verbindung bezeichnet ausschließlich die Vormundschaft.'
    }),
    ...childrenOf(['blodwen-balchder', 'rice-balchder'], KAMBER_IDS, 'marriage-kamber-senara'),
    ...childrenOf(['eniana-balchder', 'jareth-balchder', 'lynnia-balchder'], JENELLE_IDS, 'marriage-jenelle-harald')
  ],
  lineage: {
    founderPartnershipId: 'marriage-caedmon-eilonwy',
    houseId: BALCHDER_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    // Ritterherrenhäuser führen den silbernen Wappenrahmen statt des goldenen.
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1648',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-seldryn-bronwen',
      name: 'Haus Seldryn',
      parentPartnershipId: 'marriage-bronwen-lugh',
      houseId: 'house-seldryn',
      targetFamilyId: 'haus-seldryn',
      crestFrame: 'gold',
      notes: 'Bronwen wurde an Haus Seldryn wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-sgrechiwr-aerona',
      name: 'Haus Sgrechiwr',
      parentPartnershipId: 'marriage-aerona-godwyn',
      houseId: 'house-sgrechiwr',
      targetFamilyId: 'haus-sgrechiwr',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png',
      crestFrame: 'gold',
      notes: 'Aerona wurde als älteste Tochter Dalvins an Godwyn Sgrechiwr wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-gwyntog-genofeva',
      name: 'Haus Gwyntog',
      parentPartnershipId: 'marriage-genofeva-alastair',
      houseId: 'house-gwyntog',
      targetFamilyId: 'haus-gwyntog',
      crestFrame: 'gold',
      notes: 'Genofeva wurde an Haus Gwyntog wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-cludwyr-klervi',
      name: 'Haus Cludwyr',
      parentPartnershipId: 'marriage-klervi-rhain',
      houseId: 'house-cludwyr',
      targetFamilyId: 'haus-cludwyr',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-cludwyr.png',
      crestFrame: 'silver',
      notes: 'Klervi wurde an das Ritterherrenhaus Cludwyr wegverheiratet; dort führt sie mit Rhain die Linie fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-barus-cerrin',
      name: 'Haus Barus',
      parentPartnershipId: 'marriage-cerrin-wyett',
      houseId: 'house-barus',
      targetFamilyId: 'haus-barus',
      crestFrame: 'gold',
      notes: 'Cerrin wurde an Haus Barus wegverheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-chwedlonol-marven',
      name: 'Haus Chwedonol',
      parentPartnershipId: 'marriage-marven-morgaine',
      houseId: 'house-chwedlonol',
      targetFamilyId: 'haus-chwedlonol',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-chwedlonol.png',
      crestFrame: 'silver',
      notes: 'Marven heiratete in das matriarchal geführte Ritterherrenhaus Chwedonol ein; Morgaine führt dort die Linie fort.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'caedmon-balchder',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Personen, Lebensdaten und Beziehungsstruktur nach der bereitgestellten Balchder-Hierarchietabelle und der ergänzenden Stammbaumgrafik. Bronwen, Genofeva, Aerona, Klervi und Cerrin besitzen Wegverheiratungs-Knoten zu ihren Zielhäusern; Aerona ist als älteste Tochter Dalvins ergänzt. Avan und Ronda Rhyddid, Klervi und Rhain Cludwyr, Kamber und Senara Gelyn sowie Marven und Morgaine Chwedonol sind mit ihren bestehenden Stammbäumen als dieselben Weltpersonen verknüpft. Sheev Gwared ist Avans aufgenommenes Mündel und wird ausschließlich als Schutzbefohlener mit Vormundschaft, nicht als leibliches Kind, geführt. Als Ritterherrenhaus führt Balchder den silbernen Wappenrahmen.',
    blankFamily: false,
    sourceRevision: 1
  }
});
