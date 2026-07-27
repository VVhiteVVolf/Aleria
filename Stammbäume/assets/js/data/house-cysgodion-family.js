import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { GWENDOLYNS_UFER_VASSAL_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_CYSGODION_PORTRAITS } from './house-cysgodion-portraits.js';

const CYSGODION_EMBLEM = 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Cysgodion.png';
const CYSGODION_HOUSE_ID = 'house-cysgodion';

const HOUSE_HEAD_IDS = new Set([
  'cadwalader-cysgodion',
  'yorath-cysgodion'
]);

const MAIN_LINE_IDS = new Set([
  'cefin-cysgodion',
  'carys-cysgodion'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = CYSGODION_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_CYSGODION_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === CYSGODION_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, '', {
    familyRole: 'married',
    ...options
  });
}

function unknownSpouse(id, sex, { dead = false, notes = '' } = {}) {
  return spouse(id, '???', sex, '????', dead ? '????' : '', {
    status: dead ? 'dead' : 'unknown',
    notes
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['cadwalader-cysgodion', 'unknown-spouse-cadwalader-cysgodion'];
const CYNFELYN_IDS = ['cynfelyn-cysgodion', 'unknown-spouse-cynfelyn-cysgodion'];
const CERYS_IDS = ['cerys-cysgodion', 'unknown-spouse-cerys-cysgodion'];
const COLWYN_IDS = ['colwyn-cysgodion', 'unknown-spouse-colwyn-cysgodion'];
const CADGWAN_IDS = ['cadgwan-cysgodion', 'unknown-spouse-cadgwan-cysgodion'];
const EIRWEN_IDS = ['eirwen-cysgodion', 'unknown-spouse-eirwen-cysgodion'];
const CARADOC_IDS = ['caradoc-cysgodion', 'unknown-spouse-caradoc-cysgodion'];
const CADOGAN_IDS = ['cadogan-cysgodion', 'unknown-spouse-cadogan-cysgodion'];
const YORATH_IDS = ['yorath-cysgodion', 'blodwen-cysgodion'];
const BETRYS_IDS = ['betrys-cysgodion', 'unknown-spouse-betrys-cysgodion'];
const PRYCE_IDS = ['pryce-cysgodion', 'astrid-cysgodion'];
const GRONW_IDS = ['gronw-cysgodion', 'aneira-cysgodion'];
const MORGAN_IDS = ['morgan-cysgodion', 'morwenna-cysgodion'];

export const HOUSE_CYSGODION_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-cysgodion',
    title: 'Haus Cysgodion',
    motto: 'Im Schatten des Wyvern',
    description: 'Das zurückhaltende Ritterhaus Cysgodion aus Abergwint dient Haus Gwyvern durch Verwaltung, Recht, Aufklärung und ein verborgenes Informationsnetz.',
    emblem: CYSGODION_EMBLEM,
    houseProfile: GWENDOLYNS_UFER_VASSAL_PROFILES.cysgodion
  },
  houses: [
    house(CYSGODION_HOUSE_ID, 'Haus Cysgodion', CYSGODION_EMBLEM),
    house('house-unbekannt-cerys-cysgodion', 'Unbekanntes Haus'),
    house('house-unbekannt-eirwen-cysgodion', 'Unbekanntes Haus'),
    house('house-unbekannt-betrys-cysgodion', 'Unbekanntes Haus')
  ],
  persons: [
    person('cadwalader-cysgodion', 'Cadwalader Cysgodion', 'male', '????', '????', CYSGODION_HOUSE_ID, {
      status: 'dead',
      title: 'Gründer und erster Ritterherr des Hauses Cysgodion',
      notes: 'Ritter, Staatsmann, politischer Verwalter und Vertrauensmann Haus Draigs; wurde für seine Dienste zum Ritterherrn erhoben.'
    }),
    unknownSpouse('unknown-spouse-cadwalader-cysgodion', 'female', {
      dead: true,
      notes: 'Cadwaladers Ehefrau ist nur als verstorbene, namenlose Gründerin überliefert.'
    }),

    person('cynfelyn-cysgodion', 'Cynfelyn Cysgodion', 'male', '1642', '????', CYSGODION_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-cynfelyn-cysgodion', 'female', { dead: true }),
    person('cerys-cysgodion', 'Cerys Cysgodion', 'female', '1644', '????', CYSGODION_HOUSE_ID, {
      status: 'dead',
      notes: 'Cerys wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    }),
    unknownSpouse('unknown-spouse-cerys-cysgodion', 'male', {
      dead: true,
      notes: 'Cerys’ Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('colwyn-cysgodion', 'Colwyn Cysgodion', 'male', '1647', '????', CYSGODION_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-colwyn-cysgodion', 'female', { dead: true }),

    person('cadgwan-cysgodion', 'Cadgwan Cysgodion', 'male', '1667', '1720', CYSGODION_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-cadgwan-cysgodion', 'female', { dead: true }),
    person('eirwen-cysgodion', 'Eirwen Cysgodion', 'female', '1669', '', CYSGODION_HOUSE_ID, {
      notes: 'Eirwen wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    }),
    unknownSpouse('unknown-spouse-eirwen-cysgodion', 'male', {
      dead: true,
      notes: 'Eirwens Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('caradoc-cysgodion', 'Caradoc Cysgodion', 'male', '1671', '1720', CYSGODION_HOUSE_ID, {
      status: 'dead'
    }),
    unknownSpouse('unknown-spouse-caradoc-cysgodion', 'female', { dead: true }),
    person('cadogan-cysgodion', 'Cadogan Cysgodion', 'male', '1673', '', CYSGODION_HOUSE_ID, {
      title: 'Verwalter von Sicherheit, Ausbildung und Anwesen des Hauses'
    }),
    unknownSpouse('unknown-spouse-cadogan-cysgodion', 'female', { dead: true }),

    person('yorath-cysgodion', 'Yorath Cysgodion', 'male', '1690', '', CYSGODION_HOUSE_ID, {
      title: 'Ritterherr des Hauses Cysgodion',
      notes: 'Führt und organisiert das Haus ohne offizielles Hofamt; seine Autorität innerhalb der Cysgodion ist unumstritten.'
    }),
    spouse('blodwen-cysgodion', 'Blodwen', 'female', '????', '', {
      status: 'unknown'
    }),
    person('betrys-cysgodion', 'Betrys Cysgodion', 'female', '1692', '', CYSGODION_HOUSE_ID, {
      notes: 'Betrys wurde an einen unbekannten Mann aus einem nicht überlieferten Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    }),
    unknownSpouse('unknown-spouse-betrys-cysgodion', 'male', {
      notes: 'Betrys’ Ehemann und dessen Haus sind nicht überliefert.'
    }),
    person('pryce-cysgodion', 'Pryce Cysgodion', 'male', '1695', '', CYSGODION_HOUSE_ID, {
      title: 'Registrator des Schattens',
      notes: 'Direkter Stellvertreter Gronws; dokumentiert, ordnet und bewertet Informationen für die baroniale Führung.'
    }),
    spouse('astrid-cysgodion', 'Astrid', 'female', '????', '', {
      status: 'unknown'
    }),
    person('gronw-cysgodion', 'Gronw Cysgodion', 'male', '1693', '', CYSGODION_HOUSE_ID, {
      title: 'Schatten der Baronie',
      notes: 'Leitet das Spionage- und Aufklärungsnetzwerk der Baronie und berät den Baron in verdeckten Angelegenheiten.'
    }),
    spouse('aneira-cysgodion', 'Aneira', 'female', '1696'),
    person('morgan-cysgodion', 'Morgan Cysgodion', 'male', '1696', '', CYSGODION_HOUSE_ID, {
      title: 'Ritter und Ausbilder des Hauses',
      notes: 'Bildet die Sprösslinge des Hauses im ritterlichen Handwerk aus und meidet Staatskunst sowie verdeckte Aufgaben.'
    }),
    spouse('morwenna-cysgodion', 'Morwenna', 'female', '1699'),

    person('cefin-cysgodion', 'Cefin Cysgodion', 'male', '1715', '', CYSGODION_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Cysgodion',
      notes: 'Sohn Yoraths und vorgesehener Nachfolger in der Führung des Hauses.'
    }),
    person('carys-cysgodion', 'Carys Cysgodion', 'female', '1718', '', CYSGODION_HOUSE_ID, {
      title: 'Zweite Erbin des Hauses Cysgodion'
    }),
    person('folant-cysgodion', 'Folant Cysgodion', 'male', '1719', '', CYSGODION_HOUSE_ID, {
      title: 'Ritter des Hauses Cysgodion',
      notes: 'Sohn Pryces und Astrids; sucht entgegen der Haustradition offen Aufmerksamkeit, Ruhm und Abenteuer.'
    }),
    person('glendower-cysgodion', 'Glendower Cysgodion', 'male', '1722'),
    person('cystennin-cysgodion', 'Cystennin Cysgodion', 'male', '1717', '', CYSGODION_HOUSE_ID, {
      title: 'Spitzel und Anwärter auf die Rolle des nächsten Schattens'
    }),
    person('crystin-cysgodion', 'Crystin Cysgodion', 'female', '1719'),
    person('morwen-cysgodion', 'Morwen Cysgodion', 'female', '1720'),
    person('myfanwy-cysgodion', 'Myfanwy Cysgodion', 'female', '1723')
  ],
  partnerships: [
    createMarriage('marriage-cadwalader-unknown-cysgodion', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-cynfelyn-unknown-cysgodion', ...CYNFELYN_IDS, { status: 'ended' }),
    createMarriage('marriage-cerys-unknown-cysgodion', ...CERYS_IDS, { status: 'ended' }),
    createMarriage('marriage-colwyn-unknown-cysgodion', ...COLWYN_IDS, { status: 'ended' }),
    createMarriage('marriage-cadgwan-unknown-cysgodion', ...CADGWAN_IDS, { status: 'ended' }),
    createMarriage('marriage-eirwen-unknown-cysgodion', ...EIRWEN_IDS, { status: 'widowed' }),
    createMarriage('marriage-caradoc-unknown-cysgodion', ...CARADOC_IDS, { status: 'ended' }),
    createMarriage('marriage-cadogan-unknown-cysgodion', ...CADOGAN_IDS, { status: 'widowed' }),
    createMarriage('marriage-yorath-blodwen-cysgodion', ...YORATH_IDS),
    createMarriage('marriage-betrys-unknown-cysgodion', ...BETRYS_IDS),
    createMarriage('marriage-pryce-astrid-cysgodion', ...PRYCE_IDS),
    createMarriage('marriage-gronw-aneira-cysgodion', ...GRONW_IDS),
    createMarriage('marriage-morgan-morwenna-cysgodion', ...MORGAN_IDS)
  ],
  parentages: [
    ...childrenOf(
      ['cynfelyn-cysgodion', 'cerys-cysgodion', 'colwyn-cysgodion'],
      FOUNDER_IDS,
      'marriage-cadwalader-unknown-cysgodion',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Mehrere nicht einzeln überlieferte Generationen verbinden das Gründerpaar mit Cynfelyn, Cerys und Colwyn.',
        extensions: { timeJumpId: 'gap-cadwalader-cynfelyn-cysgodion' }
      }
    ),
    ...childrenOf(['cadgwan-cysgodion', 'eirwen-cysgodion'], CYNFELYN_IDS, 'marriage-cynfelyn-unknown-cysgodion'),
    ...childrenOf(['caradoc-cysgodion', 'cadogan-cysgodion'], COLWYN_IDS, 'marriage-colwyn-unknown-cysgodion'),
    ...childrenOf(['yorath-cysgodion', 'betrys-cysgodion'], CADGWAN_IDS, 'marriage-cadgwan-unknown-cysgodion'),
    ...childrenOf(['pryce-cysgodion'], CARADOC_IDS, 'marriage-caradoc-unknown-cysgodion'),
    ...childrenOf(['gronw-cysgodion', 'morgan-cysgodion'], CADOGAN_IDS, 'marriage-cadogan-unknown-cysgodion'),
    ...childrenOf(['cefin-cysgodion', 'carys-cysgodion'], YORATH_IDS, 'marriage-yorath-blodwen-cysgodion'),
    ...childrenOf(['folant-cysgodion', 'glendower-cysgodion'], PRYCE_IDS, 'marriage-pryce-astrid-cysgodion'),
    ...childrenOf(['cystennin-cysgodion', 'crystin-cysgodion'], GRONW_IDS, 'marriage-gronw-aneira-cysgodion'),
    ...childrenOf(['morwen-cysgodion', 'myfanwy-cysgodion'], MORGAN_IDS, 'marriage-morgan-morwenna-cysgodion')
  ],
  lineage: {
    founderPartnershipId: 'marriage-cadwalader-unknown-cysgodion',
    houseId: CYSGODION_HOUSE_ID,
    crestSubtitle: 'Ritterhaus aus Abergwint',
    crestEmblemScale: 0.82,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-unknown-cerys-cysgodion',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-cerys-unknown-cysgodion',
      houseId: 'house-unbekannt-cerys-cysgodion',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Cerys Cysgodion wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-eirwen-cysgodion',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-eirwen-unknown-cysgodion',
      houseId: 'house-unbekannt-eirwen-cysgodion',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Eirwen Cysgodion wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    }),
    createMarriedAwayBranch({
      id: 'married-away-unknown-betrys-cysgodion',
      name: 'Unbekanntes Haus',
      parentPartnershipId: 'marriage-betrys-unknown-cysgodion',
      houseId: 'house-unbekannt-betrys-cysgodion',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold',
      notes: 'Betrys Cysgodion wurde an ein nicht näher überliefertes Haus verheiratet und führt die Cysgodion-Linie nicht fort.'
    })
  ],
  timeJumps: [
    {
      id: 'gap-cadwalader-cynfelyn-cysgodion',
      parentPartnershipId: 'marriage-cadwalader-unknown-cysgodion',
      parentPersonId: '',
      childIds: ['cynfelyn-cysgodion', 'cerys-cysgodion', 'colwyn-cysgodion'],
      years: 0,
      fromYear: '????',
      toYear: '1642',
      label: 'Nicht einzeln überlieferte Generationen',
      notes: 'Der Zeitsprung folgt als alleiniger absoluter Generationentrenner unter dem vom Gründerpaar begründeten Hauswappen.',
      extensions: {}
    }
  ],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'cadwalader-cysgodion',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten, Rollen und Portraitquellen nach der bereitgestellten Cysgodion-Hausseite samt Stammbaumgrafik. Auf Cadwaladers Gründerwappen folgt genau ein absoluter serieller Überlieferungssprung zu Cynfelyn, Cerys und Colwyn; die beiden namenlosen historischen Oberhäupter der Hoftabelle liegen innerhalb dieser nicht einzeln modellierbaren Lücke und werden nicht als erfundene Personen angelegt. Die Hoftabelle nennt Yorath abweichend mit dem Geburtsjahr 1720, während Hierarchie und seine bereits 1715 sowie 1718 geborenen Kinder eindeutig 1690 belegen. Die Kinderüberschrift „Pryce und Catrin“ widerspricht Ehezeile, Portrait und Figurenbeschreibung; Astrid ist deshalb die belegte Mutter Folants und Glendowers. Cerys, Eirwen und Betrys besitzen an ihren Ehen direkte Wegverheiratet-Knoten zu unbekannten Häusern. Die jüngste Generation bleibt ohne erfundene Partnerschaften. Generische Silhouetten, unbeschriftete Dienerschaft und die nicht individuell bebilderte Cerys werden nicht als Portraitquellen importiert.',
    houseLore: {
      seat: 'Abergwint',
      estate: 'Schlichtes Anwesen in einem unscheinbaren Viertel innerhalb der Stadtmauern Abergwints',
      liegeHouse: 'Haus Gwyvern',
      benefactor: 'Haus Gwyvern',
      knightFather: 'Haus Draig',
      ethnicity: 'Cenyri; abweichende Gerüchte über aldrimarische oder überseeische Wurzeln sind unbelegt',
      wealth: 'Beschaulich',
      religion: 'Formell die Alerische Kirche; praktisch zurückhaltend bis gleichgültig',
      patrons: [],
      feud: 'Keine offene Fehde; das Haus verfolgt die als Schwarze Zitteraale bekannten Raubritter.',
      trade: ['Verwaltung', 'Recht', 'Staatskunde', 'Informationsbeschaffung', 'Tavernen- und Herbergspachten'],
      tradition: 'Nützlichkeit, Verschwiegenheit, Disziplin und bedingungslose Loyalität zu Haus Gwyvern stehen über öffentlichem Ruhm.'
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
