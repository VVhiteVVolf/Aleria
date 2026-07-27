import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_SELOG_PORTRAITS } from './house-selog-portraits.js';

const SELOG_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Selog.png';
const SELOG_HOUSE_ID = 'house-selog';
const HOUSE_EMBLEMS = Object.freeze({
  rhuddgar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png',
  taranvyr: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Taranvyr.png'
});

const HOUSE_HEAD_IDS = new Set([
  'gwerthrynion-selog',
  'padarn-selog',
  'godwyn-selog'
]);

const MAIN_LINE_IDS = new Set([
  'adda-selog',
  'afan-selog',
  'drystan-selog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = SELOG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_SELOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === SELOG_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['gwerthrynion-selog', 'unknown-spouse-gwerthrynion-selog'];
const PADARN_IDS = ['padarn-selog', 'unknown-spouse-padarn-selog'];
const MARCHELL_IDS = ['marchell-1649-selog', 'unknown-spouse-marchell-1649-selog'];
const RHUN_IDS = ['rhun-selog', 'unknown-spouse-rhun-selog'];
// Die Reihenfolge entspricht den kanonischen Gegenakten, damit die
// hausübergreifend geteilten Ehen auch als Datensatz deckungsgleich bleiben.
const GODWYN_IDS = ['linessa-taranvyr', 'godwyn-selog'];
const SIONED_IDS = ['sioned-selog', 'unknown-spouse-sioned-selog'];
const HYWEL_IDS = ['hywel-selog', 'unknown-spouse-hywel-selog'];
const ADDA_IDS = ['adda-selog', 'unknown-spouse-adda-selog'];
const MEGGAN_IDS = ['lewys-rhuddgar', 'meggan-selog'];
const GWALCHMAI_IDS = ['gwalchmai-selog', 'unknown-spouse-gwalchmai-selog'];
const CYNAN_IDS = ['cynan-selog', 'unknown-spouse-cynan-selog'];
const GETHIN_IDS = ['gethin-selog', 'unknown-spouse-gethin-selog'];

export const HOUSE_SELOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-selog',
    title: 'Haus Selog',
    motto: '',
    description: 'Das Ritterhaus Selog aus Abergwint bewacht vom Sitz am Feuerstollen aus die alten Wälder und stellt sich besonders unnatürlichen Gefahren entgegen.',
    emblem: SELOG_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.selog
  },
  houses: [
    house(SELOG_HOUSE_ID, 'Haus Selog', SELOG_EMBLEM),
    house('house-taranvyr', 'Haus Taranvyr', HOUSE_EMBLEMS.taranvyr),
    house('house-rhuddgar', 'Haus Rhuddgar', HOUSE_EMBLEMS.rhuddgar),
    house('house-unbekannt-marchell-selog', 'Unbekanntes Haus'),
    house('house-unbekannt-sioned-selog', 'Unbekanntes Haus')
  ],
  persons: [
    person('gwerthrynion-selog', 'Gwerthrynion Selog', 'male', '????', '????', SELOG_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Selog',
      notes: 'Ein geläuterter Wanderritter, der im Dienst Haus Gwyverns Verantwortung übernahm und als Grüner Ritter in die Hauslegende einging.'
    }),
    spouse('unknown-spouse-gwerthrynion-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Die Ehefrau des Gründers ist in der Quelle ohne Namen und Lebensdaten überliefert.'
    }),

    // Erste einzeln überlieferte Generation hinter der Gründerlücke.
    person('padarn-selog', 'Padarn Selog', 'male', '1647', '1720', SELOG_HOUSE_ID, {
      status: 'dead',
      title: 'Ritterherr des Hauses Selog'
    }),
    spouse('unknown-spouse-padarn-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Padarns Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),
    person('marchell-1649-selog', 'Marchell Selog', 'female', '1649', '', SELOG_HOUSE_ID, {
      title: 'Hohe Priesterin des Hauses Selog und der Kirche von Cenyr'
    }),
    spouse('unknown-spouse-marchell-1649-selog', '???', 'male', '????', '????', '', {
      status: 'dead',
      notes: 'Marchells Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('rhun-selog', 'Rhun Selog', 'male', '1651', '', SELOG_HOUSE_ID, {
      title: 'Sir · Hochpaladin der Kirche von Cenyr · Kriegsheld'
    }),
    spouse('unknown-spouse-rhun-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Rhuns Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),

    person('godwyn-selog', 'Godwyn Selog', 'male', '1673', '', SELOG_HOUSE_ID, {
      title: 'Ritterherr des Hauses Selog'
    }),
    spouse('linessa-taranvyr', 'Linessa Taranvyr', 'female', '1678', '', 'house-taranvyr'),
    person('sioned-selog', 'Sioned Selog', 'female', '1676', '????', SELOG_HOUSE_ID, {
      status: 'dead'
    }),
    spouse('unknown-spouse-sioned-selog', '???', 'male', '????', '????', '', {
      status: 'dead',
      notes: 'Sioneds Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('hywel-selog', 'Hywel Selog', 'male', '1670', '', SELOG_HOUSE_ID, {
      title: 'Hoher Geistlicher der Kirche von Cenyr',
      notes: 'Nach seiner ritterlichen Ausbildung trat Hywel in den geistlichen Dienst ein.'
    }),
    spouse('unknown-spouse-hywel-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Hywels Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),

    person('adda-selog', 'Adda Selog', 'male', '1693', '', SELOG_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Selog'
    }),
    spouse('unknown-spouse-adda-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Addas Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),
    person('meggan-selog', 'Meggan Selog', 'female', '1693'),
    spouse('lewys-rhuddgar', 'Lewys Rhuddgar', 'male', '1691', '', 'house-rhuddgar', {
      title: 'Erster Erbe des Hauses Rhuddgar'
    }),
    person('gwalchmai-selog', 'Gwalchmai Selog', 'male', '1696'),
    spouse('unknown-spouse-gwalchmai-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Gwalchmais Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),
    person('cynan-selog', 'Cynan Selog', 'male', '1697'),
    spouse('unknown-spouse-cynan-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Cynans Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),
    person('gethin-selog', 'Gethin Selog', 'male', '1694'),
    spouse('unknown-spouse-gethin-selog', '???', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Gethins Ehefrau ist in der Quelle nur als verstorbene, namenlose Partnerin überliefert.'
    }),

    // Jüngste belegte Generation; die Quelle weist keine Partner aus.
    person('afan-selog', 'Afan Selog', 'male', '1715', '', SELOG_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Selog'
    }),
    person('drystan-selog', 'Drystan Selog', 'male', '1718', '', SELOG_HOUSE_ID, {
      title: 'Dritter Erbe des Hauses Selog'
    }),
    person('heilyn-selog', 'Heilyn Selog', 'male', '1720'),
    person('marchell-1722-selog', 'Marchell Selog', 'female', '1722'),
    person('llywarch-selog', 'Llywarch Selog', 'male', '1719'),
    person('marsli-selog', 'Marsli Selog', 'female', '1720'),
    person('siwan-selog', 'Siwan Selog', 'female', '1721'),
    person('arthfael-selog', 'Arthfael Selog', 'male', '1722'),
    person('ystedd-selog', 'Ystedd Selog', 'female', '1725')
  ],
  partnerships: [
    createMarriage('marriage-gwerthrynion-unknown-selog', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-padarn-unknown-selog', ...PADARN_IDS, { status: 'widowed' }),
    createMarriage('marriage-marchell-unknown-selog', ...MARCHELL_IDS, { status: 'widowed' }),
    createMarriage('marriage-rhun-unknown-selog', ...RHUN_IDS, { status: 'widowed' }),
    createMarriage('marriage-linessa-godwyn', ...GODWYN_IDS),
    createMarriage('marriage-sioned-unknown-selog', ...SIONED_IDS, { status: 'ended' }),
    createMarriage('marriage-hywel-unknown-selog', ...HYWEL_IDS, { status: 'widowed' }),
    createMarriage('marriage-adda-unknown-selog', ...ADDA_IDS, { status: 'widowed' }),
    createMarriage('marriage-lewys-meggan', ...MEGGAN_IDS),
    createMarriage('marriage-gwalchmai-unknown-selog', ...GWALCHMAI_IDS, { status: 'widowed' }),
    createMarriage('marriage-cynan-unknown-selog', ...CYNAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-gethin-unknown-selog', ...GETHIN_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['padarn-selog', 'marchell-1649-selog', 'rhun-selog'],
      FOUNDER_IDS,
      'marriage-gwerthrynion-unknown-selog',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Padarn, Marchell und Rhun.',
        extensions: { timeJumpId: 'gap-gwerthrynion-padarn-selog' }
      }
    ),
    ...childrenOf(['godwyn-selog', 'sioned-selog'], PADARN_IDS, 'marriage-padarn-unknown-selog'),
    ...childrenOf(['hywel-selog'], RHUN_IDS, 'marriage-rhun-unknown-selog'),
    ...childrenOf(['adda-selog', 'meggan-selog', 'gwalchmai-selog', 'cynan-selog'], GODWYN_IDS, 'marriage-linessa-godwyn'),
    ...childrenOf(['gethin-selog'], HYWEL_IDS, 'marriage-hywel-unknown-selog'),
    ...childrenOf(['afan-selog', 'drystan-selog'], ADDA_IDS, 'marriage-adda-unknown-selog'),
    ...childrenOf(['llywarch-selog', 'marsli-selog', 'siwan-selog'], GWALCHMAI_IDS, 'marriage-gwalchmai-unknown-selog'),
    ...childrenOf(['heilyn-selog', 'marchell-1722-selog'], CYNAN_IDS, 'marriage-cynan-unknown-selog'),
    ...childrenOf(['arthfael-selog', 'ystedd-selog'], GETHIN_IDS, 'marriage-gethin-unknown-selog')
  ],
  lineage: {
    founderPartnershipId: 'marriage-gwerthrynion-unknown-selog',
    houseId: SELOG_HOUSE_ID,
    crestSubtitle: 'Ritterhaus am Feuerstollen',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-marchell-selog',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-marchell-unknown-selog',
      houseId: 'house-unbekannt-marchell-selog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Marchell Selog wurde an ein nicht näher überliefertes Haus verheiratet und führt die Selog-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-sioned-selog',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-sioned-unknown-selog',
      houseId: 'house-unbekannt-sioned-selog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Sioned Selog wurde an ein nicht näher überliefertes Haus verheiratet und führt die Selog-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-rhuddgar-meggan',
      name: 'Haus Rhuddgar',
      parentPartnershipId: 'marriage-lewys-meggan',
      houseId: 'house-rhuddgar',
      targetFamilyId: 'haus-rhuddgar',
      emblem: HOUSE_EMBLEMS.rhuddgar,
      crestFrame: 'silver',
      notes: 'Meggan Selog wurde an Lewys Rhuddgar verheiratet; ihre Kinder führen die Linie im Stammbaum Rhuddgar fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-gwerthrynion-padarn-selog',
      parentPartnershipId: 'marriage-gwerthrynion-unknown-selog',
      parentPersonId: '',
      childIds: ['padarn-selog', 'marchell-1649-selog', 'rhun-selog'],
      years: 0,
      fromYear: '????',
      toYear: '1647',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner unter dem von Gwerthrynion und seiner Frau begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'gwerthrynion-selog',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Ämter, Hausdaten und Portraitquellen nach der bereitgestellten Selog-Hausseite samt Stammbaumgrafik. Auf Gwerthrynions Gründerpaar und das Selog-Wappen folgt genau ein serieller Überlieferungssprung zu Padarn, Marchell und Rhun. Die belegte Kopfschaft lautet Gwerthrynion – Padarn – Godwyn; die ausdrückliche Erbfolge nach Godwyn lautet Adda – Afan – Drystan. Nach ergänzender Vorgabe ist Cynan ein Sohn von Godwyn und Linessa, nicht von Hywel; Hywel ist nur Gethins Vater. Godwyns Geburtsjahr steht in einer Hoftabelle widersprüchlich als 1720; die genealogische Hierarchie und seine bereits kanonische Gegenakte bei Haus Taranvyr nennen 1673, das deshalb übernommen wurde. Die Tabellenform „Taravyr“ wurde zur kanonischen Schreibweise Taranvyr normalisiert. Godwyn und Linessa sowie Meggan und Lewys verwenden dieselben Weltpersonen, Beziehungs-IDs und Portraitdateien wie ihre Taranvyr- beziehungsweise Rhuddgar-Gegenakten. Meggans abweichendes Bild in der Selog-Quelle wurde dabei nicht als zweites Portrait derselben Weltperson importiert. Marchell und Sioned besitzen an ihren Ehen je einen direkten Wegverheiratet-Knoten zu einem unbekannten Haus; Meggan besitzt den direkten Knoten zu Haus Rhuddgar. Das kleine Taranvyr-Wappen bei Linessa kennzeichnet in der Quellgrafik nur die Herkunft einer eingeheirateten Partnerin und erzeugt keinen parallelen Herkunftshausknoten. Die jüngste Generation besitzt keine belegten Ehe- oder Verlobungspartner. Generische Silhouetten und unbeschriftete Dienerschaft wurden nicht als individuelle Portraits oder Personen importiert. Die Ausbildung der Kinder in Côr Ffynnonfaen ist eine allgemeine Haustradition und keine konkrete Vermittlung benannter Personen an ein fremdes Haus; sie erzeugt daher keine Mündel-Verknüpfung.',
    houseLore: {
      seat: 'Abergwint',
      secondarySeat: 'Burg am Feuerstollen',
      origin: 'Gwynthor',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: [],
      feud: '',
      trade: ['Waldschutz', 'Monsterjagd', 'Ritterdienst', 'Bewachung des Feuerstollens'],
      tradition: 'Verantwortung, Treue und Standhaftigkeit gelten als höchste Pflichten. Kinder verbringen einen Teil ihrer Jugend im Kloster Côr Ffynnonfaen und werden anschließend innerhalb der Familie ritterlich ausgebildet.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
