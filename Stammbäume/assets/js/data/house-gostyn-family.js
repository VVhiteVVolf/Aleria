import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createParentages
} from './family-record-builders.js';
import { HOUSE_GOSTYN_PORTRAITS } from './house-gostyn-portraits.js';

const GOSTYN_EMBLEM = 'assets/images/houses/haus-gostyn.png';
const GOSTYN_HOUSE_ID = 'house-gostyn';

const HOUSE_HEAD_IDS = new Set([
  'roderic-gostyn',
  'coel-gostyn',
  'eifion-gostyn'
]);
const MAIN_LINE_IDS = new Set([
  'gruffydd-gostyn',
  'heddwyn-gostyn'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = GOSTYN_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_GOSTYN_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === GOSTYN_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function spouse(id, name, sex, birth = '????', death = '', options = {}) {
  return person(id, name, sex, birth, death, '', { ...options, familyRole: 'married' });
}

function unknownSpouse(id, sex) {
  return spouse(id, '???', sex, '????', '????', {
    notes: 'Name und Lebensdaten sind nicht überliefert.'
  });
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['roderic-gostyn', 'ffion-muellerstochter'];
const COEL_IDS = ['coel-gostyn', 'unknown-spouse-coel-gostyn'];
const NON_IDS = ['non-gostyn', 'unknown-spouse-non-gostyn'];
const CADOC_IDS = ['cadoc-gostyn', 'unknown-spouse-cadoc-gostyn'];
const EIFION_IDS = ['eifion-gostyn', 'unknown-spouse-eifion-gostyn'];
const HAF_IDS = ['haf-gostyn', 'unknown-spouse-haf-gostyn'];
const DERFEL_IDS = ['derfel-gostyn', 'unknown-spouse-derfel-gostyn'];
const GRUFFYDD_IDS = ['gruffydd-gostyn', 'unknown-spouse-gruffydd-gostyn'];
const NEST_IDS = ['nest-gostyn', 'unknown-spouse-nest-gostyn'];
const AMLYN_IDS = ['amlyn-gostyn', 'unknown-spouse-amlyn-gostyn'];
const BARRI_IDS = ['barri-gostyn', 'unknown-spouse-barri-gostyn'];
const DEINIOL_IDS = ['deiniol-gostyn', 'unknown-spouse-deiniol-gostyn'];

export const HOUSE_GOSTYN_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-gostyn',
    title: 'Haus Gostyn',
    motto: 'Wer dient, steht höher als er glaubt.',
    description: 'Die überlieferte Linie des bescheidenen Ritterherrenhauses Gostyn unter Haus Gafyr: vom Gründer Roderic dem Hochgewachsenen bis zur jüngsten Generation des Jahres 1740.',
    emblem: GOSTYN_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.gostyn
  },
  houses: [
    {
      id: GOSTYN_HOUSE_ID,
      name: 'Haus Gostyn',
      motto: 'Wer dient, steht höher als er glaubt.',
      emblem: GOSTYN_EMBLEM,
      status: 'active'
    }
  ],
  persons: [
    // Gründerpaar; die dazwischenliegenden Generationen sind nicht einzeln überliefert.
    person('roderic-gostyn', 'Roderic Gostyn', 'male', '????', '????', GOSTYN_HOUSE_ID, {
      title: 'Roderic der Hochgewachsene · Begründer des Ritterherrenhauses Gostyn',
      notes: 'Ehemaliger Kammerdiener Egon Gafyrs. Erst im Alter von siebzig Jahren nahm Roderic die Ritterwürde an und begründete das Haus Gostyn.'
    }),
    spouse('ffion-muellerstochter', 'Ffion die Müllerstochter', 'female', '????', '????'),

    // Erste einzeln überlieferte Generation nach der Überlieferungslücke.
    person('coel-gostyn', 'Coel Gostyn', 'male', '1642', '1720', GOSTYN_HOUSE_ID, {
      title: 'Ehemaliger Ritterherr des Hauses Gostyn',
      notes: 'Kriegsheld und Paladin im Dienst der Gafyr; fiel im Großen Krieg für Cenyr.'
    }),
    unknownSpouse('unknown-spouse-coel-gostyn', 'female'),
    person('non-gostyn', 'Non Gostyn', 'female', '1644', '????'),
    unknownSpouse('unknown-spouse-non-gostyn', 'male'),
    person('cadoc-gostyn', 'Cadoc Gostyn', 'male', '1646', '1720', GOSTYN_HOUSE_ID, {
      title: 'Sir Cadoc Gostyn',
      notes: 'Coels Bruder; fiel ebenfalls im Großen Krieg im Dienst des Hauses und Cenyrs.'
    }),
    unknownSpouse('unknown-spouse-cadoc-gostyn', 'female'),

    // Kinder Coels und Cadocs.
    person('eifion-gostyn', 'Eifion Gostyn', 'male', '1667', '', GOSTYN_HOUSE_ID, {
      title: 'Ritterherr des Hauses Gostyn · Lehnswart von Bronfelen',
      notes: 'Seit 1720 Oberhaupt des Hauses Gostyn.'
    }),
    unknownSpouse('unknown-spouse-eifion-gostyn', 'female'),
    person('haf-gostyn', 'Haf Gostyn', 'female', '1668', ''),
    unknownSpouse('unknown-spouse-haf-gostyn', 'male'),
    person('derfel-gostyn', 'Derfel Gostyn', 'male', '1669', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Derfel Gostyn · Hauptmann von Bronfelen'
    }),
    unknownSpouse('unknown-spouse-derfel-gostyn', 'female'),

    // Nächste Generation.
    person('gruffydd-gostyn', 'Gruffydd Gostyn', 'male', '1690', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Gruffydd Gostyn · Erster Erbe des Hauses Gostyn',
      notes: 'Steht im Dienst des Hauses Gafyr; die genaue Funktion ist nicht überliefert.'
    }),
    unknownSpouse('unknown-spouse-gruffydd-gostyn', 'female'),
    person('nest-gostyn', 'Nest Gostyn', 'female', '1692', ''),
    unknownSpouse('unknown-spouse-nest-gostyn', 'male'),
    person('amlyn-gostyn', 'Amlyn Gostyn', 'male', '1695', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Amlyn Gostyn · Waffenmeister in Bronfelen'
    }),
    unknownSpouse('unknown-spouse-amlyn-gostyn', 'female'),
    person('barri-gostyn', 'Barri Gostyn', 'male', '1694', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Barri Gostyn · Paladin',
      notes: 'Verwaltet das Anwesen der Gostyn in Gwynthor, während der Großteil des Hauses in Bronfelen und auf der ländlichen Burg lebt.'
    }),
    unknownSpouse('unknown-spouse-barri-gostyn', 'female'),
    person('deiniol-gostyn', 'Deiniol Gostyn', 'male', '1702', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Deiniol Gostyn · Paladin',
      notes: 'Steht im Dienst des Hauses Gafyr; die genaue Funktion ist nicht überliefert.'
    }),
    unknownSpouse('unknown-spouse-deiniol-gostyn', 'female'),

    // Jüngste, im Jahr 1740 lebende Generation.
    person('heddwyn-gostyn', 'Heddwyn Gostyn', 'male', '1717', '', GOSTYN_HOUSE_ID, {
      title: 'Erbe des Hauses Gostyn nach Gruffydd',
      notes: 'Muss die traditionelle Pilgerreise samt Fasten nach einem unvollständigen ersten Versuch wiederholen und nimmt dies gelassen.'
    }),
    person('saeth-gostyn', 'Saeth Gostyn', 'female', '1720', '', GOSTYN_HOUSE_ID, {
      title: 'Lady Saeth Gostyn',
      notes: 'Lebt bei ihrem Vater in Gwynthor, fühlt sich von der gostynischen Bescheidenheit eingeengt und wird von ihrem Großvater nach Bronfelen gedrängt.'
    }),
    person('clydno-gostyn', 'Clydno Gostyn', 'male', '1718', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Clydno Gostyn · Ritter in Bronfelen',
      notes: 'Vollendete die einunddreißigtägige Fastenzeit und Pilgerreise nach Llanforwyn vor drei Jahren und gilt als vorbildlich.'
    }),
    person('eurig-gostyn', 'Eurig Gostyn', 'male', '1721', '', GOSTYN_HOUSE_ID, {
      title: 'Jungritter Eurig Gostyn',
      notes: 'Die Erfüllung der Haustradition steht ihm noch bevor; das Haus begegnet seinem zögerlichen Beginn mit Geduld.'
    }),
    person('garmon-gostyn', 'Garmon Gostyn', 'male', '1719', '', GOSTYN_HOUSE_ID, {
      title: 'Sir Garmon Gostyn',
      notes: 'Tut sich mit dem traditionellen Fasten schwer, versucht es jedoch immer wieder.'
    }),
    person('illtud-gostyn', 'Illtud Gostyn', 'female', '1724', '', GOSTYN_HOUSE_ID, {
      title: 'Lady Illtud Gostyn',
      notes: 'Kennt die Haustraditionen gut und versteht es, sie mit einem Lächeln zu umgehen.'
    }),
    person('math-gostyn', 'Math Gostyn', 'male', '1730', '', GOSTYN_HOUSE_ID, {
      notes: 'Dient mit zehn Jahren als Messdiener in einem Inselkloster und soll mit zwölf zurückkehren, um Knappe zu werden.'
    }),
    person('lola-gostyn', 'Lola Gostyn', 'female', '1732', '', GOSTYN_HOUSE_ID, {
      notes: 'Wurde mit acht Jahren in ein Kloster in der Grauen Weite gebracht und hält den Aufenthalt noch für eine Reise mit ihrer Mutter.'
    })
  ],
  partnerships: [
    createMarriage('marriage-roderic-ffion', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-coel-unknown', ...COEL_IDS, { status: 'ended' }),
    createMarriage('marriage-non-unknown', ...NON_IDS, { status: 'ended' }),
    createMarriage('marriage-cadoc-unknown', ...CADOC_IDS, { status: 'ended' }),
    createMarriage('marriage-eifion-unknown', ...EIFION_IDS, { status: 'ended' }),
    createMarriage('marriage-haf-unknown', ...HAF_IDS, { status: 'ended' }),
    createMarriage('marriage-derfel-unknown', ...DERFEL_IDS, { status: 'ended' }),
    createMarriage('marriage-gruffydd-unknown', ...GRUFFYDD_IDS, { status: 'ended' }),
    createMarriage('marriage-nest-unknown', ...NEST_IDS, { status: 'ended' }),
    createMarriage('marriage-amlyn-unknown', ...AMLYN_IDS, { status: 'ended' }),
    createMarriage('marriage-barri-unknown', ...BARRI_IDS, { status: 'ended' }),
    createMarriage('marriage-deiniol-unknown', ...DEINIOL_IDS, { status: 'ended' })
  ],
  parentages: [
    ...childrenOf(
      ['coel-gostyn', 'non-gostyn', 'cadoc-gostyn'],
      FOUNDER_IDS,
      'marriage-roderic-ffion',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Diese Geschwister gehören zur ersten einzeln überlieferten Generation nach der Lücke; die genaue Zahl der Zwischengenerationen ist unbekannt.'
      }
    ),
    ...childrenOf(['eifion-gostyn', 'haf-gostyn'], COEL_IDS, 'marriage-coel-unknown'),
    ...childrenOf(['derfel-gostyn'], CADOC_IDS, 'marriage-cadoc-unknown'),
    ...childrenOf(['gruffydd-gostyn', 'nest-gostyn', 'amlyn-gostyn'], EIFION_IDS, 'marriage-eifion-unknown'),
    ...childrenOf(['barri-gostyn', 'deiniol-gostyn'], DERFEL_IDS, 'marriage-derfel-unknown'),
    ...childrenOf(['heddwyn-gostyn', 'saeth-gostyn'], GRUFFYDD_IDS, 'marriage-gruffydd-unknown'),
    ...childrenOf(['clydno-gostyn', 'eurig-gostyn'], AMLYN_IDS, 'marriage-amlyn-unknown'),
    ...childrenOf(['garmon-gostyn', 'illtud-gostyn'], BARRI_IDS, 'marriage-barri-unknown'),
    ...childrenOf(['math-gostyn', 'lola-gostyn'], DEINIOL_IDS, 'marriage-deiniol-unknown')
  ],
  lineage: {
    founderPartnershipId: 'marriage-roderic-ffion',
    houseId: GOSTYN_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1642',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'roderic-gostyn',
    orientation: 'vertical',
    ancestorDepth: 50,
    descendantDepth: 50,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten und Portraitquellen nach der bereitgestellten Gostyn-Tabelle und Stammbaumgrafik. Die ausdrücklich eingetragenen, namenlosen Ehepartner sind als reale, verstorbene Personenknoten mit nicht überlieferten Namen und Daten erfasst und gelten nicht als ledig. Zwischen dem Gründerpaar und Coels Generation liegt eine nicht einzeln überlieferte Zeitspanne. Eifions Angabe 1720–???? bezeichnet seine Amtszeit als Oberhaupt; sein belegtes Geburtsjahr ist 1667. Unvollständige Amtsbezeichnungen wurden nicht ergänzt und fremde Ehehäuser nicht erfunden. Als Ritterherrenhaus führt Gostyn den silbernen Wappenrahmen.',
    houseLore: {
      seat: 'Gwynthor',
      liegeHouse: 'Haus Gafyr',
      benefactor: 'Ritterfürst Duncan',
      knightFather: 'Egon Gafyr (historisch, irgendwann zwischen 1300 und 1500)',
      ethnicity: 'Cenyri mit albischem Anteil',
      wealth: 'Beschaulich',
      religion: 'Alerische Kirche',
      patrons: ['Mutter', 'Hüter'],
      feud: ''
    },
    blankFamily: false,
    sourceRevision: 1
  }
});
