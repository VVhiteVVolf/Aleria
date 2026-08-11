import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SKALD_PORTRAITS } from './house-skald-portraits.js';
import {
  RORIKSHEIM_HOUSE_EMBLEMS,
  RORIKSHEIM_HOUSE_PROFILES
} from './roriksheim-house-profiles.js';

const EISENJUNGFER_HOUSE_ID = 'house-eisenjungfer';
const EISENJUNGFER_EMBLEM = RORIKSHEIM_HOUSE_EMBLEMS.eisenjungfer;
const SKALD_HOUSE_ID = 'house-skald';

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
  'lagertha-eisenjungfrau-founder',
  'sigrun-eisenjungfer',
  'hervor-eisenjungfer'
]);

const MAIN_LINE_IDS = new Set([
  'runa-eisenjungfer',
  'solveig-eisenjungfer'
]);

function lineageRoleFor(personId) {
  if (HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', options = {}) {
  const houseId = options.houseId === undefined ? EISENJUNGFER_HOUSE_ID : options.houseId;
  return createFamilyPerson({
    id,
    worldPersonId: options.worldPersonId || '',
    name,
    sex,
    birth,
    death,
    status: options.status || '',
    houseId,
    portrait: options.portrait === undefined ? (HOUSE_SKALD_PORTRAITS[id] || '') : options.portrait,
    familyRole: options.familyRole || (houseId === EISENJUNGFER_HOUSE_ID ? 'core' : 'married'),
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

function spouse(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, {
    ...options,
    houseId: options.houseId || '',
    familyRole: options.familyRole || 'married',
    lineageRole: 'branch'
  });
}

function youngPerson(id, name, sex, birth, options = {}) {
  return person(id, name, sex, birth, '', {
    ...options,
    title: options.title || 'Unverheiratet',
    tags: [...(options.tags || []), 'Unverheiratet'],
    notes: options.notes || 'Gehört zur jüngsten Generation des Clans und ist im Jahr 1740 unverheiratet.'
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

const COUPLES = Object.freeze({
  founders: ['lagertha-eisenjungfrau-founder', 'hjalmar-founder-spouse'],
  grandparents: ['sigrun-eisenjungfer', 'arnulf-grandfather-spouse'],
  parents: ['hervor-eisenjungfer', 'styrbjorn-parent-spouse'],
  hakonAffair: ['hakon-eisenjungfer', 'liv-hakon-affair'],
  thrud: ['thrud-eisenjungfer', 'brandr-thrud-spouse'],
  runa: ['runa-eisenjungfer', 'kjartan-runa-spouse'],
  lagertha: ['ragnar-skald', 'lagertha-eisenjungfer'],
  brynhild: ['brynhild-eisenjungfer', 'hemming-brynhild-spouse'],
  skadi: ['skadi-eisenjungfer', 'arvid-skadi-spouse']
});

const PARENTS_BY_PARTNERSHIP = Object.freeze({
  'marriage-lagertha-hjalmar-eisenjungfer-founders': COUPLES.founders,
  'marriage-sigrun-arnulf-eisenjungfer': COUPLES.grandparents,
  'marriage-hervor-styrbjorn-eisenjungfer': COUPLES.parents,
  'affair-hakon-liv-eisenjungfer': COUPLES.hakonAffair,
  'marriage-runa-kjartan-eisenjungfer': COUPLES.runa,
  'marriage-brynhild-hemming-eisenjungfer': COUPLES.brynhild,
  'marriage-skadi-arvid-eisenjungfer': COUPLES.skadi
});

function childrenOf(childIds, partnershipId, options = {}) {
  return createParentages(
    childIds,
    PARENTS_BY_PARTNERSHIP[partnershipId],
    partnershipId,
    { idPrefix: 'eisenjungfer-parentage', ...options }
  );
}

export const EISENJUNGFER_HOUSE_BIOGRAPHY = Object.freeze({
  schema: 'aleria.house-module',
  schemaVersion: 1,
  pageTitle: 'I — Clan Eisenjungfer',
  image: EISENJUNGFER_EMBLEM,
  imageWidth: 30,
  imageSquare: true,
  housePage: true,
  description: 'Matriarchal geführter Huskarlclan aus Klangheim, dessen Schildmaiden dem Clan Skald dienen und zusätzlich die südliche Lehensstätte Forsthain verwalten.',
  stats: Object.freeze([
    Object.freeze(['Voller Name', 'Clan Eisenjungfer']),
    Object.freeze(['Stammsitz', 'Klangheim']),
    Object.freeze(['Gegründet', 'Frühzeit Klangheims']),
    Object.freeze(['Oberhaupt', 'Hervor Eisenjungfer']),
    Object.freeze(['Erbin', 'Runa Eisenjungfer']),
    Object.freeze(['Lehensherr', 'Clan Skald']),
    Object.freeze(['Vasallen', 'Keine eigenen Vasallen']),
    Object.freeze(['Ländereien', 'Klangheim · Forsthain · Skaldenheim · Roriksheim · Aldrimar']),
    Object.freeze(['Wappen', 'Schildmaid mit Hammer und Rundschild im Runenkranz']),
    Object.freeze(['Hausfarben', 'Stahlgrau · Weiß · Dunkelblau']),
    Object.freeze(['Rang', 'Huskarlclan']),
    Object.freeze(['Status', 'Aktiv'])
  ]),
  house: Object.freeze({
    biographyTitle: 'Über diesen Clan',
    biographyText: 'Die Eisenjungfern sind ein matriarchal geführter Huskarlclan Klangheims. Die Frauen tragen Namen, Erbe und Waffenrecht der Linie weiter; Männer heiraten gewöhnlich auswärts oder suchen ihr Auskommen als Söldner. Als Gefolge des Clans Skald sichern die Schildmaiden Klangheim und verwalten im Süden des Thanentums die kleine Lehensstätte Forsthain.',
    abilitiesTitle: 'Einflussbereiche & Zuständigkeiten',
    abilities: Object.freeze([
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Militär.png',
        title: 'Schildmaiden',
        detail: 'Ausbildung schwer bewaffneter Kriegerinnen und bewaffnetes Gefolge des Clans Skald.'
      }),
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Administration.png',
        title: 'Forsthain',
        detail: 'Verwaltung der südlichen Lehensstätte, ihrer Vorräte, Wege und Abgaben.'
      }),
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Justiz.png',
        title: 'Brautkampf',
        detail: 'Wahrung der Schildmaidtradition, nach der ein Freier seine Ebenbürtigkeit im Zweikampf beweisen muss.'
      })
    ]),
    extraSections: Object.freeze([
      Object.freeze({
        title: 'Die Stätte Forsthain',
        text: 'Forsthain liegt im Süden Skaldenheims. Die Eisenjungfern halten die kleine Stätte nicht als unabhängige Herrschaft, sondern verwalten sie im Namen ihrer Lehensherren aus dem Clan Skald.'
      })
    ]),
    historyTitle: 'Geschichte des Clans',
    historyText: 'Die Überlieferung führt den Clan auf Lagertha Eisenjungfrau zurück. Nach ihr wurde der Name Eisenjungfer zum Namen der matriarchalen Linie. Zwischen der Gründerzeit und Sigrun Eisenjungfer sind die einzelnen Generationen nicht mehr belegt. In der Gegenwart des Jahres 1740 führt Hervor Eisenjungfer den Clan; ihre älteste Tochter Runa gilt als Erbin. Hervors Tochter Lagertha bildet eine seltene Ausnahme der Erbtradition: Sie heiratete Ragnar Skald und führt ihre Nachkommen im Stammbaum des Lehensherrenclans fort.',
    worksTitle: 'Bekannte Taten & Ereignisse',
    works: Object.freeze([
      'Lagertha Eisenjungfrau begründete die nach Frauen benannte und durch Frauen fortgeführte Clanlinie.',
      'Die Eisenjungfern übernahmen für Clan Skald die Bewachung und Verwaltung der südlichen Stätte Forsthain.',
      'Die Ehe Lagertha Eisenjungfers mit Ragnar Skald verband den Huskarlclan unmittelbar mit der heutigen Skald-Linie.'
    ]),
    triviaTitle: 'Besonderheiten',
    trivia: Object.freeze([
      'Die ältesten Töchter führen gewöhnlich die Linie fort; ungefähr eine von drei Frauen wird in einen anderen Clan verheiratet.',
      'Männer des Clans heiraten meist auswärts, ziehen als Söldner fort oder bleiben ohne festen Ehebund.',
      'Nur ein als stark und ebenbürtig anerkannter Freier darf eine Eisenjungfer heiraten.',
      'Traditionell muss der Freier seine erwählte Braut in einem Schildmaidenkampf bezwingen, bevor die Ehe anerkannt wird.'
    ]),
    quotesTitle: 'Clanworte & Aussprüche',
    quotes: Object.freeze([
      '„Kein Name wird getragen, der nicht mit Schild und Stand bewiesen wurde.“',
      '„Wer um eine Eisenjungfer wirbt, wirbt zuerst um ihren Schild.“'
    ]),
    connectionsTitle: 'Lehensbindungen & Verwandtschaft',
    connections: Object.freeze([
      Object.freeze({ type: 'heading', title: 'Lehensbindungen', detail: '' }),
      Object.freeze({
        type: 'connection',
        name: 'Clan Skald',
        detail: 'Unmittelbare Lehensherren; die Eisenjungfern dienen ihnen als Huskarlhaus.',
        image: RORIKSHEIM_HOUSE_EMBLEMS.skald,
        imageFormat: 'square'
      }),
      Object.freeze({
        type: 'connection',
        name: 'Clan Brathfengr',
        detail: 'Thanen von Skaldenheim und Oberherren Klangheims.',
        image: RORIKSHEIM_HOUSE_EMBLEMS.brathfengr,
        imageFormat: 'square'
      }),
      Object.freeze({ type: 'heading', title: 'Familienbande', detail: '' }),
      Object.freeze({
        type: 'connection',
        name: 'Lagertha Eisenjungfer & Ragnar Skald',
        detail: 'Seltene Einheirat einer Eisenjungfer in die fortgeführte Linie des Lehensherrenclans.',
        image: HOUSE_SKALD_PORTRAITS['lagertha-eisenjungfer'],
        imageFormat: 'portrait'
      })
    ]),
    documentsTitle: 'Rechte & Besitz',
    documents: Object.freeze([
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Administration.png',
        title: 'Stätte Forsthain',
        text: 'Südlicher Verwaltungssitz und kleines Lehen im Auftrag des Clans Skald.',
        link: ''
      }),
      Object.freeze({
        icon: '../IconOrdner/Organisationsicons/Militär.png',
        title: 'Schildmaidenrecht',
        text: 'Überliefertes Waffen-, Erb- und Brautrecht der Frauen des Clans.',
        link: ''
      })
    ]),
    footer: 'Stahl im Arm. Wahrheit im Stand.',
    sideWidth: 100,
    connectionPortraitHeight: 68,
    connectionTextOffset: 0,
    crestImage: EISENJUNGFER_EMBLEM
  }),
  commentSequence: Object.freeze([]),
  quote: '„Wer um eine Eisenjungfer wirbt, wirbt zuerst um ihren Schild.“',
  quoteBy: 'Schildmaidentradition'
});

export const HOUSE_EISENJUNGFER_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: Object.freeze({
    id: 'haus-eisenjungfer',
    title: 'Clan Eisenjungfer',
    motto: 'Wer um eine Eisenjungfer wirbt, wirbt zuerst um ihren Schild.',
    description: 'Matriarchal geführter Huskarlclan aus Klangheim. Die Eisenjungfern dienen Clan Skald, wahren die Schildmaidtradition und verwalten zusätzlich die südliche Lehensstätte Forsthain.',
    emblem: EISENJUNGFER_EMBLEM,
    houseProfile: RORIKSHEIM_HOUSE_PROFILES.eisenjungfer
  }),
  houses: Object.freeze([
    Object.freeze(house(EISENJUNGFER_HOUSE_ID, 'Clan Eisenjungfer', EISENJUNGFER_EMBLEM)),
    Object.freeze(house(SKALD_HOUSE_ID, 'Clan Skald', RORIKSHEIM_HOUSE_EMBLEMS.skald)),
    Object.freeze(house('house-unknown-thrud', 'Unbekannter Clan'))
  ]),
  persons: Object.freeze([
    person('lagertha-eisenjungfrau-founder', 'Lagertha Eisenjungfrau', 'female', '????', '????', {
      title: 'Gründerin des Clans Eisenjungfer',
      tags: ['Gründerin', 'Schildmaid'],
      notes: 'Namensgebende Stammfrau der matriarchalen Eisenjungfer-Linie.'
    }),
    spouse('hjalmar-founder-spouse', 'Hjalmar', 'male', '????', '????', {
      title: 'Gemahl der Gründerin',
      notes: 'Überlieferter Gemahl Lagertha Eisenjungfraus; seine Herkunft ist nicht mehr bekannt.'
    }),

    person('sigrun-eisenjungfer', 'Sigrun Eisenjungfer', 'female', '1640', '1722', {
      title: 'Früheste lückenlos belegte Clanführerin'
    }),
    spouse('arnulf-grandfather-spouse', 'Arnulf', 'male', '1637', '1708', {
      title: 'Lagerthas Großvater · Gemahl Sigruns',
      notes: 'Heiratete nach bestandenem Schildmaidenkampf in den Clan ein.'
    }),

    person('hervor-eisenjungfer', 'Hervor Eisenjungfer', 'female', '1664', '', {
      title: 'Amtierendes Oberhaupt des Clans Eisenjungfer',
      tags: ['Oberhaupt', 'Schildmaid']
    }),
    spouse('styrbjorn-parent-spouse', 'Styrbjorn', 'male', '1661', '1720', {
      title: 'Gemahl Hervors · Vater Lagerthas',
      notes: 'Gewann Hervors Brautkampf und diente anschließend im Gefolge der Eisenjungfern.'
    }),
    person('hakon-eisenjungfer', 'Hakon Eisenjungfer', 'male', '1667', '', {
      title: 'Fahrender Söldner',
      tags: ['Söldner', 'Ledig'],
      notes: 'Bruder Hervors. Er ging nie einen anerkannten Ehebund ein und verdingte sich außerhalb Klangheims.'
    }),
    spouse('liv-hakon-affair', 'Liv', 'female', '1678', '', {
      familyRole: 'affair',
      title: 'Affäre Hakons · Mutter Rolfs',
      tags: ['Affäre'],
      notes: 'Aus dieser Verbindung stammt ausschließlich Rolf.'
    }),
    person('rolf-hakon-bastard', 'Rolf Eisenjungfer', 'male', '1704', '', {
      familyRole: 'bastard',
      title: 'Bastardsohn Hakons · freier Söldner',
      tags: ['Bastard', 'Söldner', 'Ledig'],
      notes: 'Unehelicher Sohn Hakons und Livs; besitzt keinen Anspruch auf die matriarchale Erbfolge.'
    }),
    person('thrud-eisenjungfer', 'Thrud Eisenjungfer', 'female', '1669', '', {
      title: 'Wegverheiratet an einen unbekannten Clan',
      tags: ['Wegverheiratet']
    }),
    spouse('brandr-thrud-spouse', 'Brandr', 'male', '1665', '', {
      houseId: 'house-unknown-thrud',
      title: 'Gemahl Thruds · Clan nicht überliefert'
    }),

    person('runa-eisenjungfer', 'Runa Eisenjungfer', 'female', '1688', '', {
      title: 'Älteste Tochter Hervors · Erbin des Clans',
      tags: ['Erbin', 'Schildmaid']
    }),
    spouse('kjartan-runa-spouse', 'Kjartan', 'male', '1686', '', {
      title: 'Gemahl Runas',
      notes: 'Wurde nach bestandenem Schildmaidenkampf in die fortgeführte Linie aufgenommen.'
    }),
    person('lagertha-eisenjungfer', 'Lagertha Eisenjungfer', 'female', '1691', '', {
      title: 'Wegverheiratet an Clan Skald',
      tags: ['Wegverheiratet', 'Schildmaid'],
      notes: 'Tochter Hervors und Ehefrau Ragnar Skalds. Ihre sieben Kinder werden ausschließlich im Stammbaum des Clans Skald fortgeführt.'
    }),
    spouse('ragnar-skald', 'Ragnar Skald', 'male', '1688', '', {
      houseId: SKALD_HOUSE_ID,
      portrait: HOUSE_SKALD_PORTRAITS['ragnar-skald'],
      title: 'Hesir des Clans Skald seit 1720'
    }),
    person('brynhild-eisenjungfer', 'Brynhild Eisenjungfer', 'female', '1694', '', {
      title: 'Schildmaid und Verwalterin von Forsthain',
      tags: ['Schildmaid', 'Forsthain']
    }),
    spouse('hemming-brynhild-spouse', 'Hemming', 'male', '1692', '', {
      title: 'Gemahl Brynhilds · Verwalter in Forsthain',
      notes: 'Bewies sich im Brautkampf als ebenbürtig und trat in Brynhilds Linie ein.'
    }),
    person('skadi-eisenjungfer', 'Skadi Eisenjungfer', 'female', '1697', '', {
      title: 'Schildmaid des Clans Eisenjungfer',
      tags: ['Schildmaid']
    }),
    spouse('arvid-skadi-spouse', 'Arvid', 'male', '1695', '', {
      title: 'Gemahl Skadis',
      notes: 'Heiratete nach bestandenem Schildmaidenkampf in den Clan ein.'
    }),

    youngPerson('solveig-eisenjungfer', 'Solveig Eisenjungfer', 'female', '1716', {
      title: 'Älteste Tochter Runas · nachfolgende Erbin',
      lineageRole: 'mainline',
      tags: ['Erbin', 'Schildmaid in Ausbildung']
    }),
    youngPerson('hildigunn-eisenjungfer', 'Hildigunn Eisenjungfer', 'female', '1719', {
      tags: ['Schildmaid in Ausbildung']
    }),
    youngPerson('aslaug-eisenjungfer', 'Aslaug Eisenjungfer', 'female', '1722', {
      tags: ['Schildmaid in Ausbildung']
    }),
    youngPerson('leif-eisenjungfer', 'Leif Eisenjungfer', 'male', '1724', {
      title: 'Junger Clanspross · unverheiratet'
    }),

    youngPerson('eira-eisenjungfer', 'Eira Eisenjungfer', 'female', '1718', {
      tags: ['Schildmaid in Ausbildung', 'Forsthain']
    }),
    youngPerson('yrsa-eisenjungfer', 'Yrsa Eisenjungfer', 'female', '1721', {
      tags: ['Schildmaid in Ausbildung', 'Forsthain']
    }),
    youngPerson('gorm-eisenjungfer', 'Gorm Eisenjungfer', 'male', '1724', {
      title: 'Junger Clanspross · unverheiratet'
    }),

    youngPerson('thyra-eisenjungfer', 'Thyra Eisenjungfer', 'female', '1720', {
      tags: ['Schildmaid in Ausbildung']
    }),
    youngPerson('svala-eisenjungfer', 'Svala Eisenjungfer', 'female', '1723', {
      tags: ['Schildmaid in Ausbildung']
    }),
    youngPerson('freydis-eisenjungfer', 'Freydis Eisenjungfer', 'female', '1726', {
      tags: ['Schildmaid in Ausbildung']
    })
  ]),
  partnerships: Object.freeze([
    createMarriage('marriage-lagertha-hjalmar-eisenjungfer-founders', ...COUPLES.founders, {
      status: 'ended'
    }),
    createMarriage('marriage-sigrun-arnulf-eisenjungfer', ...COUPLES.grandparents, {
      status: 'ended',
      end: '1708'
    }),
    createMarriage('marriage-hervor-styrbjorn-eisenjungfer', ...COUPLES.parents, {
      status: 'widowed',
      end: '1720'
    }),
    createMarriage('affair-hakon-liv-eisenjungfer', ...COUPLES.hakonAffair, {
      type: 'affair',
      status: 'ended',
      end: '1705',
      visibility: 'private',
      notes: 'Rolf ist das einzige Kind aus Hakons Affäre mit Liv.',
      extensions: {
        chartAlignPartnerOverChildrenPersonId: 'liv-hakon-affair',
        registryManagedExtensionFields: ['chartAlignPartnerOverChildrenPersonId']
      }
    }),
    createMarriage('marriage-thrud-brandr-eisenjungfer', ...COUPLES.thrud),
    createMarriage('marriage-runa-kjartan-eisenjungfer', ...COUPLES.runa),
    createMarriage('marriage-ragnar-lagertha-skald', ...COUPLES.lagertha, {
      notes: 'Registerübergreifende Ehe. Die sieben gemeinsamen Kinder werden ausschließlich im Stammbaum des Clans Skald dargestellt.'
    }),
    createMarriage('marriage-brynhild-hemming-eisenjungfer', ...COUPLES.brynhild),
    createMarriage('marriage-skadi-arvid-eisenjungfer', ...COUPLES.skadi)
  ]),
  parentages: Object.freeze([
    ...childrenOf(
      ['sigrun-eisenjungfer'],
      'marriage-lagertha-hjalmar-eisenjungfer-founders',
      {
        type: 'claimed',
        legitimacy: 'unknown',
        certainty: 'probable',
        notes: 'Sigrun setzt die belegte Linie nach der Überlieferungslücke fort.'
      }
    ),
    ...childrenOf(
      ['hervor-eisenjungfer', 'hakon-eisenjungfer', 'thrud-eisenjungfer'],
      'marriage-sigrun-arnulf-eisenjungfer'
    ),
    ...childrenOf(
      ['runa-eisenjungfer', 'lagertha-eisenjungfer', 'brynhild-eisenjungfer', 'skadi-eisenjungfer'],
      'marriage-hervor-styrbjorn-eisenjungfer'
    ),
    ...childrenOf(['rolf-hakon-bastard'], 'affair-hakon-liv-eisenjungfer', {
      legitimacy: 'illegitimate',
      notes: 'Rolf stammt eindeutig aus Hakons Affäre mit Liv.'
    }),
    ...childrenOf(
      ['solveig-eisenjungfer', 'hildigunn-eisenjungfer', 'aslaug-eisenjungfer', 'leif-eisenjungfer'],
      'marriage-runa-kjartan-eisenjungfer'
    ),
    ...childrenOf(
      ['eira-eisenjungfer', 'yrsa-eisenjungfer', 'gorm-eisenjungfer'],
      'marriage-brynhild-hemming-eisenjungfer'
    ),
    ...childrenOf(
      ['thyra-eisenjungfer', 'svala-eisenjungfer', 'freydis-eisenjungfer'],
      'marriage-skadi-arvid-eisenjungfer'
    )
  ]),
  cadetBranches: Object.freeze([
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-thrud-eisenjungfer-unknown',
      name: 'Unbekannter Clan',
      parentPartnershipId: 'marriage-thrud-brandr-eisenjungfer',
      houseId: 'house-unknown-thrud',
      targetFamilyId: 'haus-unbekannt',
      emblem: '',
      crestFrame: 'silver',
      subtitle: 'Wegverheiratet an einen unbekannten Clan',
      notes: 'Thrud führt ihre Nachkommen nicht im Clan Eisenjungfer fort.'
    })),
    Object.freeze(createMarriedAwayBranch({
      id: 'married-away-lagertha-eisenjungfer-skald',
      name: 'Clan Skald',
      parentPartnershipId: 'marriage-ragnar-lagertha-skald',
      houseId: SKALD_HOUSE_ID,
      targetFamilyId: 'haus-skald',
      emblem: RORIKSHEIM_HOUSE_EMBLEMS.skald,
      crestFrame: 'gold',
      subtitle: 'Wegverheiratet an Clan Skald',
      notes: 'Lagerthas sieben Kinder mit Ragnar werden ausschließlich im Stammbaum des Clans Skald fortgeführt.'
    }))
  ]),
  timeJumps: Object.freeze([]),
  lineage: Object.freeze({
    founderPartnershipId: 'marriage-lagertha-hjalmar-eisenjungfer-founders',
    houseId: EISENJUNGFER_HOUSE_ID,
    crestSubtitle: 'Matriarchaler Huskarlclan von Klangheim · Vasallen des Clans Skald',
    crestEmblemScale: 0.86,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: Object.freeze({
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1640',
      label: 'Nicht einzeln überlieferte Generationen'
    })
  }),
  presentation: Object.freeze({ relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } }),
  view: Object.freeze({
    focusPersonId: 'lagertha-eisenjungfrau-founder',
    orientation: 'vertical',
    ancestorDepth: 12,
    descendantDepth: 12,
    limitGenerations: false,
    showSiblings: true
  }),
  extensions: Object.freeze({
    blankFamily: false,
    preparedMainLine: true,
    jarltum: 'Roriksheim',
    aldrimarRank: 'Huskarl',
    sourceRevision: 2,
    sourceModule: 'Clan Eisenjungfer (Ausarbeitung 1740)',
    sourceNote: 'Die Akte wurde um Lagertha Eisenjungfer und ihre bestehende Ehe mit Ragnar Skald aufgebaut. Als matriarchaler Clan führt die weibliche Linie über Sigrun, Hervor, Runa und Solveig; Lagertha und Thrud enden an direkten Wegverheiratet-Knoten. Lagerthas sieben Skald-Kinder werden nicht gedoppelt. Hakon ist als fahrender Söldner mit seiner Affäre Liv und dem eindeutig zugeordneten Bastard Rolf abgebildet. Sämtliche Sprösslinge unter 26 Jahren bleiben unverheiratet. Die genealogische Gegenwart reicht nur bis zu Lagerthas Großeltern zurück; die namensgebende Gründerin und der danach folgende absolute Zeitsprung stehen als historische Herkunft davor. Das eingebettete Häuser-Modul dokumentiert Klangheim, Forsthain, die Skald-Lehensbindung, Matriarchat und Schildmaidtradition.',
    houseBiographyModule: EISENJUNGFER_HOUSE_BIOGRAPHY,
    registryManagedExtensionFields: Object.freeze(['blankFamily', 'sourceNote']),
    registryManagedHouseProfileFields: Object.freeze([
      'rankId',
      'seat',
      'barony',
      'county',
      'kingdom',
      'liegeHouseId',
      'liegeHouseName',
      'secondarySeats',
      'regionEmblems'
    ]),
    registryManagedRecordFields: Object.freeze(['folderPath']),
    registryManagedViewFields: Object.freeze(['focusPersonId', 'limitGenerations'])
  })
});
