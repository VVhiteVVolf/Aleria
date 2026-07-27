import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_RHUDDGAR_PORTRAITS } from './house-rhuddgar-portraits.js';

const RHUDDGAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png';
const RHUDDGAR_HOUSE_ID = 'house-rhuddgar';
const HOUSE_EMBLEMS = Object.freeze({
  gwyntog: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Gwyntog.png',
  trydar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Trydar.png',
  tawelgar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Tawelgar.png',
  selog: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Selog.png',
  caerlaen: 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerlaen.png',
  caerthwyn: 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerthwyn.png'
});

const HOUSE_HEAD_IDS = new Set([
  'arfon-rhuddgar',
  'wyndham-rhuddgar',
  'cadwallon-rhuddgar'
]);

// Neben der belegten Erbfolge Cadwallon → Lewys → Griff bleibt auch die von
// Frewi fortgeführte Rhuddgar-Linie ausdrücklich Teil des eigenen Hauses.
const MAIN_LINE_IDS = new Set([
  'drudwas-rhuddgar',
  'oth-rhuddgar',
  'frewi-rhuddgar',
  'ceron-rhuddgar',
  'cari-rhuddgar',
  'lewys-rhuddgar',
  'griff-rhuddgar',
  'collen-rhuddgar',
  'ened-rhuddgar'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = RHUDDGAR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_RHUDDGAR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === RHUDDGAR_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '', houseId = '', options = {}) {
  return person(id, name, sex, birth, death, houseId, {
    familyRole: 'married',
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const ARFON_IDS = ['arfon-rhuddgar', 'eabha'];
const WYNDHAM_IDS = ['wyndham-rhuddgar', 'merriam-tawelgar'];
const GWLADUS_IDS = ['gwladus-rhuddgar', 'ithel-der-rote-gwyntog'];
const DRUDWAS_IDS = ['drudwas-rhuddgar', 'bethan'];
const CADWALLON_IDS = ['cadwallon-rhuddgar', 'ylva'];
const DOLENA_IDS = ['dolena-rhuddgar', 'morgan-trydar'];
const OTH_IDS = ['oth-rhuddgar', 'telyn'];
const LEWYS_IDS = ['lewys-rhuddgar', 'meggan-selog'];
const GOWER_IDS = ['gower-rhuddgar', 'tilda'];
const CADERYN_IDS = ['caderyn-rhuddgar', 'miraeth-caerlaen'];
const SERENNA_IDS = ['serenna-rhuddgar', 'emyrs-caerthwyn'];
const FREWI_IDS = ['frewi-rhuddgar', 'ulysses'];
const GRIFF_IDS = ['griff-rhuddgar', 'roisin'];

export const HOUSE_RHUDDGAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-rhuddgar',
    title: 'Haus Rhuddgar',
    motto: 'Teile die Beute – nicht das Blut.',
    description: 'Das alte Jäger- und Ritterhaus Rhuddgar aus Abergwint, im Banner Haus Gwyverns und bekannt für Waffenkunst, Fährtenlesen und besonnenes Handelsgeschick.',
    emblem: RHUDDGAR_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.rhuddgar
  },
  houses: [
    house(RHUDDGAR_HOUSE_ID, 'Haus Rhuddgar', RHUDDGAR_EMBLEM),
    house('house-gwyntog', 'Haus Gwyntog', HOUSE_EMBLEMS.gwyntog),
    house('house-trydar', 'Haus Trydar', HOUSE_EMBLEMS.trydar),
    house('house-tawelgar', 'Haus Tawelgar', HOUSE_EMBLEMS.tawelgar),
    house('house-selog', 'Haus Selog', HOUSE_EMBLEMS.selog),
    house('house-caerlaen', 'Haus Caerlaen', HOUSE_EMBLEMS.caerlaen),
    house('house-caerthwyn', 'Haus Caerthwyn', HOUSE_EMBLEMS.caerthwyn)
  ],
  persons: [
    person('der-wolf-rhuddgar', 'Der Wolf', 'male', '????', '????', RHUDDGAR_HOUSE_ID, {
      title: 'Jäger, Fährtenleser und Vater des Hausgründers',
      notes: 'Sein wahrer Name ist verloren. Nach seinem tödlichen Kampf mit Arawn wurde er vom Baron von Abergwint postum zum Ritter geschlagen; das spätere Haus trägt den Namen des Vaters.'
    }),
    person('arfon-rhuddgar', 'Arfon Rhuddgar', 'male', '????', '????', RHUDDGAR_HOUSE_ID, {
      title: 'Gründer und erster Ritterherr des Hauses Rhuddgar',
      notes: 'Überlebte den Verrat seines Bruders Arawn, wurde vom Baron von Abergwint zum Ritterherrn erhoben und wählte die zwei um eine Beute streitenden Wölfe als Mahnmal.'
    }),
    person('arawn-rhuddgar', 'Arawn Rhuddgar', 'male', '????', '????', RHUDDGAR_HOUSE_ID, {
      notes: 'Vergiftete Arfon vor ihrem Duell, schändete Eabha und fiel im anschließenden Kampf mit seinem Vater.'
    }),
    spouse('eabha', 'Eabha', 'female', '????', '????', '', {
      notes: 'Arfons Ehefrau; überlebte Arawns Angriff zunächst, ist in der genealogischen Quelle jedoch als verstorben verzeichnet.'
    }),

    // Erste einzeln überlieferte Generation hinter der frühen Überlieferungslücke.
    person('wyndham-rhuddgar', 'Wyndham Rhuddgar', 'male', '1652', '1720', RHUDDGAR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Rhuddgar'
    }),
    spouse('merriam-tawelgar', 'Merriam Tawelgar', 'female', '1655', '1709', 'house-tawelgar'),
    person('gwladus-rhuddgar', 'Gwladus Rhuddgar', 'female', '1652', '1730'),
    spouse('ithel-der-rote-gwyntog', 'Ithel der Rote Gwyntog', 'male', '1645', '????', 'house-gwyntog'),
    person('drudwas-rhuddgar', 'Drudwas Rhuddgar', 'male', '1652', '1738'),
    spouse('bethan', 'Bethan', 'female', '1656', '1739'),

    // Kinder Wyndhams und Drudwas'.
    person('cadwallon-rhuddgar', 'Cadwallon Rhuddgar', 'male', '1673', '', RHUDDGAR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Rhuddgar seit 1720'
    }),
    person('meuric-rhuddgar', 'Meuric Rhuddgar', 'male', '1686', ''),
    spouse('ylva', 'Ylva', 'female', '1673', ''),
    person('dolena-rhuddgar', 'Dolena Rhuddgar', 'female', '1674', ''),
    spouse('morgan-trydar', 'Morgan Trydar', 'male', '1668', '', 'house-trydar'),
    person('oth-rhuddgar', 'Oth Rhuddgar', 'male', '1679', ''),
    spouse('telyn', 'Telyn', 'female', '1683', ''),

    // Kinder Cadwallons und Oths.
    person('lewys-rhuddgar', 'Lewys Rhuddgar', 'male', '1691', '', RHUDDGAR_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Rhuddgar'
    }),
    person('gower-rhuddgar', 'Gower Rhuddgar', 'male', '1693', ''),
    person('haul-rhuddgar', 'Haul Rhuddgar', 'male', '1695', ''),
    person('caderyn-rhuddgar', 'Caderyn Rhuddgar', 'male', '1697', '', RHUDDGAR_HOUSE_ID, {
      title: 'Lehenswart von Garwfaen'
    }),
    person('serenna-rhuddgar', 'Serenna Rhuddgar', 'female', '1710', '', RHUDDGAR_HOUSE_ID, {
      notes: 'An Emyrs aus dem bürgerlichen Haus Caerthwyn wegverheiratet; keine fortgeführte Rhuddgar-Linie ist aus dieser Ehe überliefert.'
    }),
    person('tathal-rhuddgar', 'Tathal Rhuddgar', 'male', '1705', ''),
    person('frewi-rhuddgar', 'Frewi Rhuddgar', 'female', '1709', '', RHUDDGAR_HOUSE_ID, {
      notes: 'Frewi bleibt ausdrücklich im Haus Rhuddgar und führt dessen Linie mit Ulysses durch Ceron und Cari fort; sie ist nicht wegverheiratet.'
    }),
    spouse('meggan-selog', 'Meggan Selog', 'female', '1693', '', 'house-selog'),
    spouse('tilda', 'Tilda', 'female', '1699', ''),
    spouse('miraeth-caerlaen', 'Miraeth Caerlaen', 'female', '1700', '', 'house-caerlaen'),
    spouse('emyrs-caerthwyn', 'Emyrs Caerthwyn', 'male', '1708', '', 'house-caerthwyn'),
    spouse('ulysses', 'Ulysses', 'male', '1705', ''),

    // Die jungen Rhuddgar bleiben nach der ergänzenden Vorgabe unverheiratet.
    // Anonyme Ehepartner-Platzhalter aus der Tabelle werden daher nicht als
    // reale Personen oder Beziehungen in den Stammbaum übernommen.
    person('griff-rhuddgar', 'Griff Rhuddgar', 'male', '1712', '', RHUDDGAR_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Rhuddgar'
    }),
    person('sulwen-rhuddgar', 'Sulwen Rhuddgar', 'male', '1720', ''),
    person('melyn-rhuddgar', 'Melyn Rhuddgar', 'female', '1722', ''),
    person('iob-rhuddgar', 'Iob Rhuddgar', 'male', '1725', ''),
    person('brenn-rhuddgar', 'Brenn Rhuddgar', 'female', '1724', ''),
    person('teyna-rhuddgar', 'Teyna Rhuddgar', 'male', '1726', ''),
    person('talwyn-rhuddgar', 'Talwyn Rhuddgar', 'female', '1732', ''),
    person('ceron-rhuddgar', 'Ceron Rhuddgar', 'male', '1728', ''),
    person('cari-rhuddgar', 'Cari Rhuddgar', 'female', '1732', ''),
    spouse('roisin', 'Roisin', 'female', '1713', ''),

    person('collen-rhuddgar', 'Collen Rhuddgar', 'male', '1731', '', RHUDDGAR_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Rhuddgar'
    }),
    person('ened-rhuddgar', 'Ened Rhuddgar', 'female', '1735', '', RHUDDGAR_HOUSE_ID, {
      title: 'Vierte Erbin des Hauses Rhuddgar'
    })
  ],
  partnerships: [
    createMarriage('marriage-arfon-eabha', ...ARFON_IDS, { status: 'ended' }),
    createMarriage('marriage-wyndham-merriam', ...WYNDHAM_IDS, { status: 'ended' }),
    createMarriage('marriage-gwladus-ithel', ...GWLADUS_IDS, { status: 'ended' }),
    createMarriage('marriage-drudwas-bethan', ...DRUDWAS_IDS, { status: 'ended' }),
    createMarriage('marriage-cadwallon-ylva', ...CADWALLON_IDS),
    createMarriage('marriage-dolena-morgan', ...DOLENA_IDS),
    createMarriage('marriage-oth-telyn', ...OTH_IDS),
    createMarriage('marriage-lewys-meggan', ...LEWYS_IDS),
    createMarriage('marriage-gower-tilda', ...GOWER_IDS),
    createMarriage('marriage-caderyn-miraeth', ...CADERYN_IDS),
    createMarriage('marriage-serenna-emyrs', ...SERENNA_IDS),
    createMarriage('marriage-frewi-ulysses', ...FREWI_IDS),
    createMarriage('marriage-griff-roisin', ...GRIFF_IDS)
  ],
  parentages: [
    ...childrenOf(['arfon-rhuddgar', 'arawn-rhuddgar'], ['der-wolf-rhuddgar'], '', {
      notes: 'Die Mutter der Brüder ist nicht überliefert und wird nicht erfunden.'
    }),
    ...childrenOf(
      ['wyndham-rhuddgar', 'gwladus-rhuddgar', 'drudwas-rhuddgar'],
      ARFON_IDS,
      'marriage-arfon-eabha',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere Generationen zwischen dem Gründerpaar und den 1652 geborenen Geschwistern sind nicht einzeln überliefert.',
        extensions: { timeJumpId: 'gap-arfon-wyndham-rhuddgar' }
      }
    ),
    ...childrenOf(['cadwallon-rhuddgar', 'meuric-rhuddgar'], WYNDHAM_IDS, 'marriage-wyndham-merriam'),
    ...childrenOf(['dolena-rhuddgar', 'oth-rhuddgar'], DRUDWAS_IDS, 'marriage-drudwas-bethan'),
    ...childrenOf(
      ['lewys-rhuddgar', 'gower-rhuddgar', 'haul-rhuddgar', 'caderyn-rhuddgar', 'serenna-rhuddgar'],
      CADWALLON_IDS,
      'marriage-cadwallon-ylva'
    ),
    ...childrenOf(['tathal-rhuddgar', 'frewi-rhuddgar'], OTH_IDS, 'marriage-oth-telyn'),
    ...childrenOf(['griff-rhuddgar', 'sulwen-rhuddgar'], LEWYS_IDS, 'marriage-lewys-meggan'),
    ...childrenOf(['melyn-rhuddgar', 'iob-rhuddgar'], GOWER_IDS, 'marriage-gower-tilda'),
    ...childrenOf(['brenn-rhuddgar', 'teyna-rhuddgar', 'talwyn-rhuddgar'], CADERYN_IDS, 'marriage-caderyn-miraeth'),
    ...childrenOf(['ceron-rhuddgar', 'cari-rhuddgar'], FREWI_IDS, 'marriage-frewi-ulysses'),
    ...childrenOf(['collen-rhuddgar', 'ened-rhuddgar'], GRIFF_IDS, 'marriage-griff-roisin')
  ],
  lineage: {
    founderPartnershipId: 'marriage-arfon-eabha',
    houseId: RHUDDGAR_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-gwyntog-gwladus',
      name: 'Haus Gwyntog',
      parentPartnershipId: 'marriage-gwladus-ithel',
      houseId: 'house-gwyntog',
      targetFamilyId: 'haus-gwyntog',
      emblem: HOUSE_EMBLEMS.gwyntog,
      crestFrame: 'silver',
      notes: 'Gwladus Rhuddgar wurde an Ithel den Roten aus Haus Gwyntog verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-trydar-dolena',
      name: 'Haus Trydar',
      parentPartnershipId: 'marriage-dolena-morgan',
      houseId: 'house-trydar',
      targetFamilyId: 'haus-trydar',
      emblem: HOUSE_EMBLEMS.trydar,
      crestFrame: 'silver',
      notes: 'Dolena Rhuddgar wurde an Morgan aus Haus Trydar verheiratet.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-caerthwyn-serenna',
      name: 'Haus Caerthwyn',
      parentPartnershipId: 'marriage-serenna-emyrs',
      houseId: 'house-caerthwyn',
      targetFamilyId: 'haus-caerthwyn',
      emblem: HOUSE_EMBLEMS.caerthwyn,
      crestFrame: 'bronze',
      notes: 'Serenna Rhuddgar wurde an Emyrs aus Haus Caerthwyn verheiratet und führt die Rhuddgar-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-arfon-wyndham-rhuddgar',
      parentPartnershipId: 'marriage-arfon-eabha',
      parentPersonId: '',
      childIds: ['wyndham-rhuddgar', 'gwladus-rhuddgar', 'drudwas-rhuddgar'],
      years: 0,
      fromYear: '????',
      toYear: '1652',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner auf das von Arfon und Eabha begründete Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'der-wolf-rhuddgar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Rhuddgar-Hausseite. Arfon und Eabha sind das Gründerpaar des Ritterhauses; der vorgeschaltete „Wolf“ und Arawn bleiben als Ursprungsgeneration sichtbar. Die Lücke zwischen dem Gründerwappen und Wyndham, Gwladus sowie Drudwas ist als einzelner serieller Zeitsprung modelliert. Die belegte Kopfschaft lautet Arfon – Wyndham – Cadwallon; die Erbfolge Cadwallon – Lewys – Griff – Collen – Ened. Frewi wird trotz ihrer Ehe nicht wegverheiratet, weil ihre Kinder Ceron und Cari die Rhuddgar-Linie fortführen. Serenna, Gwladus und Dolena besitzen ihre jeweils belegte Wegverheiratet-Verknüpfung. Die jungen Rhuddgar Sulwen, Melyn, Iob, Brenn, Teyna, Talwyn, Ceron und Cari bleiben nach ergänzender Vorgabe unverheiratet; die anonymen Tabellenfelder werden nicht als reale Partnerschaften interpretiert. Wiederverwendete generische Silhouetten gelten nicht als individuelle Portraits.',
    houseLore: {
      seat: 'Abergwint',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Streiter'],
      feud: '',
      trade: ['Jagd', 'Fährtenlesen', 'Lederverarbeitung', 'Bogenbau', 'Weg- und Handelswachen'],
      tradition: 'Konflikte werden früh erkannt und möglichst ohne Blutvergießen beendet; das Wolfswappen erinnert an die tödliche Rivalität Arfons und Arawns.'
    },
    blankFamily: false,
    sourceRevision: 2
  }
});
