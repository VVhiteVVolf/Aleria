import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages,
  createWardAwayBranch
} from './family-record-builders.js';
import { HOUSE_TRYDAR_PORTRAITS } from './house-trydar-portraits.js';

const TRYDAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Trydar.png';
const TRYDAR_HOUSE_ID = 'house-trydar';
const RHUDDGAR_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Rhuddgar.png';
const DARAN_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Daran.png';
const DRAIG_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-draig.png';

const HOUSE_HEAD_IDS = new Set([
  'maelor-trydar',
  'morgan-trydar'
]);

const MAIN_LINE_IDS = new Set([
  'pryce-trydar',
  'maldwyn-trydar'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = TRYDAR_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_TRYDAR_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === TRYDAR_HOUSE_ID ? 'core' : 'married'),
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

function unknownSpouse(id, sex, relationNote) {
  return spouse(id, '???', sex, '????', '????', '', {
    notes: relationNote + ' Name, Herkunftshaus und Lebensdaten sind nicht überliefert.'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const MAELOR_IDS = ['maelor-trydar', 'unknown-spouse-maelor-trydar'];
const MORGAN_IDS = ['morgan-trydar', 'dolena-rhuddgar'];
const CADFAN_IDS = ['cadfan-trydar', 'unknown-spouse-cadfan-trydar'];
const PRYCE_IDS = ['pryce-trydar', 'unknown-spouse-pryce-trydar'];
const RHEON_IDS = ['rheon-trydar', 'unknown-spouse-rheon-trydar'];
const MEIRON_IDS = ['meiron-trydar', 'unknown-spouse-meiron-trydar'];
const EYNION_IDS = ['eynion-trydar', 'unknown-spouse-eynion-trydar'];
const MAERYN_IDS = ['maeryn-trydar', 'unknown-spouse-maeryn-trydar'];

export const HOUSE_TRYDAR_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-trydar',
    title: 'Haus Trydar',
    motto: '',
    description: 'Das maritime und kriegerische Ritterhaus Trydar aus Abergwint, zuständig für Küstensicherung, Hafenaufsicht, Konvoischutz und militärische Ordnung.',
    emblem: TRYDAR_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.trydar
  },
  houses: [
    house(TRYDAR_HOUSE_ID, 'Haus Trydar', TRYDAR_EMBLEM),
    house('house-rhuddgar', 'Haus Rhuddgar', RHUDDGAR_EMBLEM),
    house('house-daran', 'Haus Daran', DARAN_EMBLEM),
    house('house-draig', 'Haus Draig', DRAIG_EMBLEM),
    house('house-unbekannt-maeryn-trydar', 'Unbekanntes Haus')
  ],
  persons: [
    person('maelor-trydar', 'Maelor Trydar', 'male', '????', '????', TRYDAR_HOUSE_ID, {
      title: 'Gründer und erster Ritter des Hauses Trydar',
      notes: 'Diente unmittelbar unter Haus Draig, sicherte die Küste von Abergwint und begründete das Haus aus militärischem Dienst heraus.'
    }),
    unknownSpouse('unknown-spouse-maelor-trydar', 'female', 'Ehefrau des Gründers Maelor.'),

    // Erste einzeln überlieferte Generation hinter der frühen Quellenlücke.
    person('morgan-trydar', 'Morgan Trydar', 'male', '1668', '', TRYDAR_HOUSE_ID, {
      title: 'Ritterherr des Hauses Trydar · Großkonstabler von Abergwint',
      notes: 'Oberhaupt des Hauses und Stellvertreter des Marschalls von Abergwint.'
    }),
    spouse('dolena-rhuddgar', 'Dolena Rhuddgar', 'female', '1674', '', 'house-rhuddgar'),
    person('cadfan-trydar', 'Cadfan Trydar', 'male', '1668', '', TRYDAR_HOUSE_ID, {
      title: 'Sir · Festungskommandant von Twr Morlan'
    }),
    unknownSpouse('unknown-spouse-cadfan-trydar', 'female', 'Ehefrau Cadfans.'),

    // Kinder Morgans und Cadfans.
    person('pryce-trydar', 'Pryce Trydar', 'male', '1695', '', TRYDAR_HOUSE_ID, {
      title: 'Erster Erbe · Sir und Lehenswart von Carregmawr'
    }),
    unknownSpouse('unknown-spouse-pryce-trydar', 'female', 'Ehefrau Pryces.'),
    person('rheon-trydar', 'Rheon Trydar', 'male', '1697', '', TRYDAR_HOUSE_ID, {
      title: 'Sir · Hochkonstabler der Wacht von Abergwint'
    }),
    unknownSpouse('unknown-spouse-rheon-trydar', 'female', 'Ehefrau Rheons.'),
    person('meiron-trydar', 'Meiron Trydar', 'male', '1701', '', TRYDAR_HOUSE_ID, {
      title: 'Sir · Hochkonstabler der Logistik von Abergwint'
    }),
    unknownSpouse('unknown-spouse-meiron-trydar', 'female', 'Ehefrau Meirons.'),
    person('eynion-trydar', 'Eynion Trydar', 'male', '1702', '', TRYDAR_HOUSE_ID, {
      title: 'Sir · Garnisonsführung von Twr Morlan',
      notes: 'Dient gemeinsam mit seinem Vater Cadfan in der Leuchtturmbefestigung und ist Vater von Selwyn und Meira.'
    }),
    unknownSpouse('unknown-spouse-eynion-trydar', 'female', 'Ehefrau Eynions.'),
    person('maeryn-trydar', 'Maeryn Trydar', 'female', '1705', '', TRYDAR_HOUSE_ID, {
      title: 'Lady · Signalwesen von Twr Morlan',
      notes: 'Diente an der Seite ihres Vaters Cadfan und ihres Bruders Eynion; ihre Ehe führt nicht die Trydar-Linie fort.'
    }),
    unknownSpouse('unknown-spouse-maeryn-trydar', 'male', 'Ehemann Maeryns.'),

    // Jüngste belegte Generation; die Quelle zeigt hierfür keine Partnerzeile.
    person('maldwyn-trydar', 'Maldwyn Trydar', 'male', '1722', '', TRYDAR_HOUSE_ID, {
      title: 'Zweiter Erbe · Jungritter in Carregmawr'
    }),
    person('peithwen-trydar', 'Peithwen Trydar', 'female', '1725', ''),
    person('morcant-trydar', 'Morcant Trydar', 'male', '1730', '', TRYDAR_HOUSE_ID, {
      title: 'Knappe von Sir Seithved Daran · Mündel bei Haus Daran',
      familyRole: 'ward-away',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Wurde zur ritterlichen Ausbildung bewusst an Haus Daran gegeben und dient Sir Seithved Daran als Knappe.',
      extensions: {
        registryManagedFields: ['title', 'familyRole', 'tags', 'notes']
      }
    }),
    person('talon-trydar', 'Talon Trydar', 'male', '1725', '', TRYDAR_HOUSE_ID, {
      title: 'Knappe von Prinz Idwal Draig · Mündel bei Haus Draig',
      familyRole: 'ward-away',
      tags: ['Fortgegebenes Mündel'],
      notes: 'Wurde Prinz Idwal Draig vom Haus Trydar bewusst als Knappe angeboten und an Haus Draig vermittelt, um außerhalb Abergwints praktische Härte und Erfahrung zu gewinnen.',
      extensions: {
        registryManagedFields: ['title', 'familyRole', 'tags', 'notes']
      }
    }),
    person('steffon-trydar', 'Steffon Trydar', 'male', '1728', '', TRYDAR_HOUSE_ID, {
      title: 'Page seines Großvaters Morgan'
    }),
    person('morwen-trydar', 'Morwen Trydar', 'female', '1731', ''),
    person('selwyn-trydar', 'Selwyn Trydar', 'male', '1732', '', TRYDAR_HOUSE_ID, {
      title: 'Page seines Vaters Eynion'
    }),
    person('meira-trydar', 'Meira Trydar', 'female', '1734', '')
  ],
  partnerships: [
    createMarriage('marriage-maelor-unknown-trydar', ...MAELOR_IDS, { status: 'ended' }),
    createMarriage('marriage-dolena-morgan', ...MORGAN_IDS),
    createMarriage('marriage-cadfan-unknown-trydar', ...CADFAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-pryce-unknown-trydar', ...PRYCE_IDS, { status: 'widowed' }),
    createMarriage('marriage-rheon-unknown-trydar', ...RHEON_IDS, { status: 'widowed' }),
    createMarriage('marriage-meiron-unknown-trydar', ...MEIRON_IDS, { status: 'widowed' }),
    createMarriage('marriage-eynion-unknown-trydar', ...EYNION_IDS, { status: 'widowed' }),
    createMarriage('marriage-maeryn-unknown-trydar', ...MAERYN_IDS, { status: 'widowed' })
  ],
  parentages: [
    ...childrenOf(
      ['morgan-trydar', 'cadfan-trydar'],
      MAELOR_IDS,
      'marriage-maelor-unknown-trydar',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Morgan und Cadfan.',
        extensions: { timeJumpId: 'gap-maelor-morgan-trydar' }
      }
    ),
    ...childrenOf(
      ['pryce-trydar', 'rheon-trydar', 'meiron-trydar'],
      MORGAN_IDS,
      'marriage-dolena-morgan'
    ),
    ...childrenOf(['eynion-trydar', 'maeryn-trydar'], CADFAN_IDS, 'marriage-cadfan-unknown-trydar'),
    ...childrenOf(
      ['maldwyn-trydar', 'peithwen-trydar', 'morcant-trydar'],
      PRYCE_IDS,
      'marriage-pryce-unknown-trydar'
    ),
    ...childrenOf(['talon-trydar'], RHEON_IDS, 'marriage-rheon-unknown-trydar'),
    ...childrenOf(['steffon-trydar', 'morwen-trydar'], MEIRON_IDS, 'marriage-meiron-unknown-trydar'),
    ...childrenOf(['selwyn-trydar', 'meira-trydar'], EYNION_IDS, 'marriage-eynion-unknown-trydar')
  ],
  lineage: {
    founderPartnershipId: 'marriage-maelor-unknown-trydar',
    houseId: TRYDAR_HOUSE_ID,
    crestSubtitle: 'Maritimes Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-maeryn-trydar',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-maeryn-unknown-trydar',
      houseId: 'house-unbekannt-maeryn-trydar',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Maeryn Trydar wurde an einen namentlich und herkunftsmäßig nicht überlieferten Mann wegverheiratet und führt die Trydar-Linie nicht fort.'
    }),
    createWardAwayBranch({
      id: 'ward-away-morcant-daran',
      name: 'Haus Daran',
      parentPersonId: 'morcant-trydar',
      houseId: 'house-daran',
      targetFamilyId: 'haus-daran',
      emblem: DARAN_EMBLEM,
      crestFrame: 'silver',
      notes: 'Morcant Trydar wurde als Mündel an Haus Daran vermittelt und dient dort Sir Seithved Daran als Knappe.'
    }),
    createWardAwayBranch({
      id: 'ward-away-talon-draig',
      name: 'Haus Draig',
      parentPersonId: 'talon-trydar',
      houseId: 'house-draig',
      targetFamilyId: 'haus-draig',
      emblem: DRAIG_EMBLEM,
      crestFrame: 'gold',
      notes: 'Talon Trydar wurde als Knappe und Mündel an Prinz Idwal Draig und dessen Haus vermittelt.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-maelor-morgan-trydar',
      parentPartnershipId: 'marriage-maelor-unknown-trydar',
      parentPersonId: '',
      childIds: ['morgan-trydar', 'cadfan-trydar'],
      years: 0,
      fromYear: '????',
      toYear: '1668',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als absoluter Trenner auf das von Maelor und seiner unbekannten Ehefrau begründete Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'maelor-trydar',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten, Ämter und Portraitquellen nach der bereitgestellten Trydar-Hausseite. Maelor ist Gründer; Morgan und Cadfan folgen nach genau einem seriellen Überlieferungssprung. Morgan ist das gegenwärtige Oberhaupt, die ausdrücklich benannte Erbfolge lautet Pryce – Maldwyn. Morgan und Dolena Rhuddgar verwenden dieselben Weltpersonen, dieselbe Partnerschaft und dieselben Portraitdateien wie im Stammbaum Rhuddgar. Maeryn ist wegverheiratet und führt die Trydar-Linie nicht fort. Die jüngste Generation besitzt keine in der Quelle belegten Ehe- oder Verlobungspartner. Die Partnerzeile nennt bei Eynion abweichend „Cadfan“, während Kinderblock und Figurenbeschreibung Eynion eindeutig als Vater von Selwyn und Meira führen. Pryces Portrait wird nach Stammbaum und Figurenbeschreibung zugeordnet; die Oberhauptübersicht zeigt an seiner Stelle irrtümlich Rheons Bild. Morcant ist nach der ergänzenden Vorgabe Knappe von Sir Seithved Daran und besitzt deshalb den Mündelrahmen samt Zielknoten zu Haus Daran. Talon wurde Prinz Idwal Draig ausdrücklich als Knappe angeboten und besitzt entsprechend den Mündelrahmen samt Zielknoten zu Haus Draig. Beide bleiben biologisch und dynastisch Trydar. Generische Silhouetten gelten nicht als individuelle Portraits.',
    houseLore: {
      seat: 'Abergwint',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri',
      wealth: 'Respektabel',
      religion: 'Die Alerische Kirche',
      patrons: ['Der Knecht', 'Der Streiter'],
      feud: '',
      trade: ['Küstensicherung', 'Hafenaufsicht', 'Konvoischutz', 'Garnisonsdienst', 'Militärlogistik'],
      tradition: 'Ritterlicher Dienst, Disziplin und praktische Bewährung stehen über höfischer Selbstdarstellung.'
    },
    blankFamily: false,
    sourceRevision: 3
  }
});
