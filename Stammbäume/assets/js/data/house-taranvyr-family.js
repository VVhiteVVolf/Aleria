import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_TARANVYR_PORTRAITS } from './house-taranvyr-portraits.js';

const HOUSE_EMBLEMS = Object.freeze({
  caerthwyn: 'assets/images/houses/Gwendolyns Ufer/Bürgerliche/Caerthwyn.png',
  gwyvern: 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
  selog: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Selog.png',
  taranvyr: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Taranvyr.png',
  tawelgar: 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Tawelgar.png'
});

const TARANVYR_HOUSE_ID = 'house-taranvyr';

const HOUSE_HEAD_IDS = new Set([
  'rhydian-taranvyr',
  'kenyon-taranvyr'
]);

const MAIN_LINE_IDS = new Set([
  'hywel-taranvyr',
  'powell-taranvyr',
  'kane-taranvyr',
  'marvo-taranvyr'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TARANVYR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_TARANVYR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TARANVYR_HOUSE_ID ? 'core' : 'married'),
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

const FOUNDER_IDS = ['rhydian-taranvyr', 'vanora-founder-taranvyr'];
const KENYON_IDS = ['kenyon-taranvyr', 'talaith-gwyvern'];
const KERRILYN_IDS = ['kerrilyn-taranvyr', 'maredudd-tawelgar'];
const HYWEL_IDS = ['hywel-taranvyr', 'reane-spouse-taranvyr'];
const ALESTAN_IDS = ['alestan-taranvyr', 'seren-spouse-taranvyr'];
const LINESSA_IDS = ['linessa-taranvyr', 'godwyn-selog'];
const BRENDAN_IDS = ['brendan-taranvyr', 'mervynne-spouse-taranvyr'];
const RHON_IDS = ['rhon-taranvyr', 'elowen-caerthwyn'];
const POWELL_IDS = ['powell-taranvyr', 'wynndie-spouse-taranvyr'];
const LEOLIN_IDS = ['leolin-taranvyr', 'nerys-spouse-taranvyr'];
const TARON_IDS = ['taron-taranvyr', 'fiannait-spouse-taranvyr'];
const TREVOR_IDS = ['trevor-taranvyr', 'saselia-spouse-taranvyr'];

export const HOUSE_TARANVYR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-taranvyr',
    title: 'Haus Taranvyr',
    motto: 'In Treue wachen wir',
    description: 'Das alte Ritterhaus Taranvyr aus Abergwint dient den Baronen von Haus Gwyvern als verlässliche Stütze, Garnisonsführer und Ausbilder der Teulu-Schwertkämpfer.',
    emblem: HOUSE_EMBLEMS.taranvyr,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.taranvyr
  },
  houses: [
    house(TARANVYR_HOUSE_ID, 'Haus Taranvyr', HOUSE_EMBLEMS.taranvyr),
    house('house-gwyvern', 'Haus Gwyvern', HOUSE_EMBLEMS.gwyvern),
    house('house-tawelgar', 'Haus Tawelgar', HOUSE_EMBLEMS.tawelgar),
    house('house-selog', 'Haus Selog', HOUSE_EMBLEMS.selog),
    house('house-caerthwyn', 'Haus Caerthwyn', HOUSE_EMBLEMS.caerthwyn)
  ],
  persons: [
    person('rhydian-taranvyr', 'Rhydian Taranvyr', 'male', '????', '????', TARANVYR_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritter des Hauses Taranvyr',
      notes: 'Ein einfacher, außergewöhnlich tapferer Ritter aus dem Dienst des Hauses Draig; Hauptmann, Berater und Vertrauter des frühen Statthalters von Abergwint.'
    }),
    spouse('vanora-founder-taranvyr', 'Vanora', 'female', '????', '????', '', {
      status: 'dead',
      notes: 'Ehefrau des Gründers Rhydian; Herkunft und Lebensdaten sind nicht überliefert.'
    }),

    // Erste einzeln überlieferte Generation hinter der Quellenlücke.
    person('kenyon-taranvyr', 'Kenyon Taranvyr', 'male', '1650', '', TARANVYR_HOUSE_ID, {
      status: 'alive',
      title: 'Ritterherr des Hauses Taranvyr · ehemaliger Marschall und Waffenmeister des Barons',
      notes: 'Kriegsheld zweier großer Kriege; diente mehreren Baronen als Marschall und ist in der Gegenwart Waffenmeister des Barons.'
    }),
    spouse('talaith-gwyvern', 'Talaith Gwyvern', 'female', '1652', '1735', 'house-gwyvern'),
    person('kerrilyn-taranvyr', 'Kerrilyn Taranvyr', 'female', '1655', '1715'),
    spouse('maredudd-tawelgar', 'Maredudd Tawelgar', 'male', '1650', '1720', 'house-tawelgar'),

    // Kinder Kenyons und Talaiths.
    person('hywel-taranvyr', 'Hywel Taranvyr', 'male', '1670', '', TARANVYR_HOUSE_ID, {
      title: 'Erster Erbe · ehemaliger Marschall · Kommandant der Garnison von Abergwint',
      notes: 'Folgte seinem Vater als Marschall des Barons und übergab das Amt 1739 an Gwynnan Gwyvern.'
    }),
    spouse('reane-spouse-taranvyr', 'Reane', 'female', '1672'),
    person('alestan-taranvyr', 'Alestan Taranvyr', 'male', '1675', '', TARANVYR_HOUSE_ID, {
      title: 'Hauptmann der Wache in Craithfael'
    }),
    spouse('seren-spouse-taranvyr', 'Seren', 'female', '1677'),
    person('linessa-taranvyr', 'Linessa Taranvyr', 'female', '1678'),
    spouse('godwyn-selog', 'Godwyn Selog', 'male', '1673', '', 'house-selog'),
    person('brendan-taranvyr', 'Brendan Taranvyr', 'male', '1684', '', TARANVYR_HOUSE_ID, {
      title: 'Lehenswart in Castell Rhewglyn'
    }),
    spouse('mervynne-spouse-taranvyr', 'Mervynne', 'female', '1685', '', '', {
      title: 'Rechtsprecherin des Hauses Taranvyr'
    }),
    person('rhon-taranvyr', 'Rhon Taranvyr', 'male', '1688', '', TARANVYR_HOUSE_ID, {
      title: 'Lehenswart in Glasdraeth'
    }),
    spouse('elowen-caerthwyn', 'Elowen Caerthwyn', 'female', '1698', '', 'house-caerthwyn'),

    // Enkelgeneration Kenyons.
    person('powell-taranvyr', 'Powell Taranvyr', 'male', '1693', '', TARANVYR_HOUSE_ID, {
      title: 'Zweiter Erbe'
    }),
    spouse('wynndie-spouse-taranvyr', 'Wynndie', 'female', '1696'),
    person('leolin-taranvyr', 'Leolin Taranvyr', 'male', '1697'),
    spouse('nerys-spouse-taranvyr', 'Nerys', 'female', '1701'),
    person('taron-taranvyr', 'Taron Taranvyr', 'male', '1696'),
    spouse('fiannait-spouse-taranvyr', 'Fiannait', 'female', '1702', '', '', {
      title: 'Kämmerin und Schatzmeisterin des Hauses Taranvyr'
    }),
    person('trevor-taranvyr', 'Trevor Taranvyr', 'male', '1702'),
    spouse('saselia-spouse-taranvyr', 'Saselia', 'female', '1705'),
    person('caelan-taranvyr', 'Caelan Taranvyr', 'male', '1719'),

    // Jüngste belegte Generation; die Quelle weist keine Partner aus.
    person('kane-taranvyr', 'Kane Taranvyr', 'male', '1718', '', TARANVYR_HOUSE_ID, {
      title: 'Dritter Erbe'
    }),
    person('jennifa-taranvyr', 'Jennifa Taranvyr', 'female', '1721'),
    person('marvo-taranvyr', 'Marvo Taranvyr', 'male', '1725', '', TARANVYR_HOUSE_ID, {
      title: 'Vierter Erbe'
    }),
    person('vaughn-taranvyr', 'Vaughn Taranvyr', 'male', '1722'),
    person('gwenda-taranvyr', 'Gwenda Taranvyr', 'female', '1725'),
    person('vanora-taranvyr', 'Vanora Taranvyr', 'female', '1722'),
    person('cael-taranvyr', 'Cael Taranvyr', 'male', '1727'),
    person('hefin-taranvyr', 'Hefin Taranvyr', 'male', '1734'),
    person('ieuan-taranvyr', 'Ieuan Taranvyr', 'male', '1723'),
    person('lilifer-taranvyr', 'Lilifer Taranvyr', 'female', '1726')
  ],
  partnerships: [
    createMarriage('marriage-rhydian-vanora-taranvyr', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-talaith-kenyon', ...KENYON_IDS, { status: 'widowed' }),
    createMarriage('marriage-kerrilyn-maredudd', ...KERRILYN_IDS, { status: 'ended' }),
    createMarriage('marriage-hywel-reane', ...HYWEL_IDS),
    createMarriage('marriage-alestan-seren', ...ALESTAN_IDS),
    createMarriage('marriage-linessa-godwyn', ...LINESSA_IDS),
    createMarriage('marriage-brendan-mervynne', ...BRENDAN_IDS),
    createMarriage('marriage-rhon-elowen', ...RHON_IDS),
    createMarriage('marriage-powell-wynndie', ...POWELL_IDS),
    createMarriage('marriage-leolin-nerys', ...LEOLIN_IDS),
    createMarriage('marriage-taron-fiannait', ...TARON_IDS),
    createMarriage('marriage-trevor-saselia', ...TREVOR_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['kenyon-taranvyr', 'kerrilyn-taranvyr'],
      FOUNDER_IDS,
      'marriage-rhydian-vanora-taranvyr',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Kenyon und Kerrilyn.',
        extensions: { timeJumpId: 'gap-rhydian-kenyon-taranvyr' }
      }
    ),
    ...childrenOf(
      ['hywel-taranvyr', 'alestan-taranvyr', 'linessa-taranvyr', 'brendan-taranvyr', 'rhon-taranvyr'],
      KENYON_IDS,
      'marriage-talaith-kenyon'
    ),
    ...childrenOf(['powell-taranvyr', 'leolin-taranvyr'], HYWEL_IDS, 'marriage-hywel-reane'),
    ...childrenOf(['taron-taranvyr'], ALESTAN_IDS, 'marriage-alestan-seren'),
    ...childrenOf(['trevor-taranvyr'], BRENDAN_IDS, 'marriage-brendan-mervynne'),
    ...childrenOf(['caelan-taranvyr'], RHON_IDS, 'marriage-rhon-elowen'),
    ...childrenOf(
      ['kane-taranvyr', 'jennifa-taranvyr', 'marvo-taranvyr'],
      POWELL_IDS,
      'marriage-powell-wynndie'
    ),
    ...childrenOf(['vaughn-taranvyr', 'gwenda-taranvyr'], LEOLIN_IDS, 'marriage-leolin-nerys'),
    ...childrenOf(['vanora-taranvyr', 'cael-taranvyr', 'hefin-taranvyr'], TARON_IDS, 'marriage-taron-fiannait'),
    ...childrenOf(['ieuan-taranvyr', 'lilifer-taranvyr'], TREVOR_IDS, 'marriage-trevor-saselia')
  ],
  lineage: {
    founderPartnershipId: 'marriage-rhydian-vanora-taranvyr',
    houseId: TARANVYR_HOUSE_ID,
    crestSubtitle: 'Erstes Ritterhaus Abergwints',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-tawelgar-kerrilyn',
      name: 'Haus Tawelgar',
      parentPartnershipId: 'marriage-kerrilyn-maredudd',
      houseId: 'house-tawelgar',
      targetFamilyId: 'haus-tawelgar',
      emblem: HOUSE_EMBLEMS.tawelgar,
      crestFrame: 'silver',
      notes: 'Kerrilyn Taranvyr wurde an Maredudd Tawelgar verheiratet und führt die Taranvyr-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-selog-linessa',
      name: 'Haus Selog',
      parentPartnershipId: 'marriage-linessa-godwyn',
      houseId: 'house-selog',
      targetFamilyId: 'haus-selog',
      emblem: HOUSE_EMBLEMS.selog,
      crestFrame: 'silver',
      notes: 'Linessa Taranvyr wurde an Godwyn Selog verheiratet und führt die Taranvyr-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-rhydian-kenyon-taranvyr',
      parentPartnershipId: 'marriage-rhydian-vanora-taranvyr',
      parentPersonId: '',
      childIds: ['kenyon-taranvyr', 'kerrilyn-taranvyr'],
      years: 0,
      fromYear: '????',
      toYear: '1650',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner unter dem von Rhydian und Vanora begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'rhydian-taranvyr',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Lebensdaten, Ämter, Hausdaten und Portraitquellen nach der bereitgestellten Taranvyr-Hausseite samt Stammbaumgrafik. Rhydian und Vanora bilden das Gründerpaar; Kenyon und Kerrilyn folgen nach genau einem seriellen Überlieferungssprung und werden wegen der unbekannten Zwischengenerationen nur als wahrscheinliche Linienfortsetzung geführt. Die ausdrückliche Erbfolge lautet Kenyon – Hywel – Powell – Kane – Marvo. Kenyon ist laut Gegenwartsbeschreibung lebender Ritterherr und Waffenmeister; Talaith starb 1735. Kenyon und Talaith verwenden dieselben Weltpersonen, dieselbe Ehe und dieselben Portraitdateien wie im Stammbaum Gwyvern. Kerrilyn besitzt an ihrer Ehe mit Maredudd den Wegverheiratet-Knoten zu Haus Tawelgar; Linessa besitzt an ihrer Ehe mit Godwyn den Wegverheiratet-Knoten zu Haus Selog. Die kleinen Wappen bei Talaith Gwyvern und Elowen Caerthwyn kennzeichnen in der Quellgrafik nur die Herkunft eingeheirateter Partner und erzeugen in der Taranvyr-Akte keinen parallelen Herkunftshausknoten. Die jüngste Generation besitzt keine belegten Ehe- oder Verlobungspartner. Die Tabellenvarianten „Hywell“ und „Taranvyrn“ wurden zugunsten der sonst durchgängigen Formen Hywel und Taranvyr normalisiert. Generische Dienerschafts-Platzhalter wurden nicht als Personen importiert.',
    houseLore: {
      seat: 'Abergwint',
      origin: 'Gwynthor',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Beschaulich',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht', 'Der Streiter', 'Nimue'],
      friends: ['Haus Gwyvern', 'Haus Draig', 'Haus Tawelgar'],
      feud: '',
      trade: ['Grundbesitz und Pacht', 'Garnisonsführung', 'Teulu-Ausbildung', 'Schutz und Ordnung'],
      tradition: 'Mut, Loyalität, Pflichtbewusstsein und die persönliche Ausbildung von Teulu-Schwertkämpfern.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
