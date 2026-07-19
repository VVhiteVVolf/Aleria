import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';
import { HOUSE_ENEINIOG_PORTRAITS } from './house-eneiniog-portraits.js';

const ENEINIOG_EMBLEM = 'assets/images/houses/Llamreis Ankunft/haus-eneiniog.png';
const ENEINIOG_HOUSE_ID = 'house-eneiniog';

const HOUSE_HEAD_IDS = new Set([
  'tyrnog-eneiniog',
  'urien-eneiniog',
  'maredog-eneiniog'
]);
const MAIN_LINE_IDS = new Set([
  'owain-eneiniog',
  'meriadog-eneiniog'
]);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '', houseId = ENEINIOG_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: HOUSE_ENEINIOG_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === ENEINIOG_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function unknownSpouse(id, sex) {
  return person(id, '???', sex, '????', '????', '', {
    familyRole: 'married',
    notes: 'Name und Lebensdaten sind nicht überliefert.'
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

const FOUNDER_IDS = ['tyrnog-eneiniog', 'unknown-spouse-tyrnog-eneiniog'];
const URIEN_IDS = ['urien-eneiniog', 'unknown-spouse-urien-eneiniog'];
const CERIDWENOG_IDS = ['ceridwenog-eneiniog', 'unknown-spouse-ceridwenog-eneiniog'];
const PEREDUR_IDS = ['peredur-eneiniog', 'unknown-spouse-peredur-eneiniog'];
const TUDURYN_IDS = ['tuduryn-eneiniog', 'unknown-spouse-tuduryn-eneiniog'];
const MILLENA_IDS = ['uther-balchder', 'millena-eneiniog'];
const MAREDOG_IDS = ['maredog-eneiniog', 'unknown-spouse-maredog-eneiniog'];
const CLEDWEN_IDS = ['cledwen-eneiniog', 'unknown-spouse-cledwen-eneiniog'];
const RHIWALLON_IDS = ['rhiwallon-eneiniog', 'unknown-spouse-rhiwallon-eneiniog'];
const NEFYDD_IDS = ['nefydd-eneiniog', 'unknown-spouse-nefydd-eneiniog'];
const OWAIN_IDS = ['owain-eneiniog', 'unknown-spouse-owain-eneiniog'];
const MERIADOG_IDS = ['meriadog-eneiniog', 'unknown-spouse-meriadog-eneiniog'];
const RHUNOG_IDS = ['rhunog-eneiniog', 'unknown-spouse-rhunog-eneiniog'];
const IYVAN_IDS = ['iyvan-eneiniog', 'unknown-spouse-iyvan-eneiniog'];

export const HOUSE_ENEINIOG_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-eneiniog',
    title: 'Haus Eneiniog',
    motto: '',
    description: 'Die überlieferte Linie des Ritterherrenhauses Eneiniog unter Haus Saethwyr: von Gründer Tyrnog bis zur jüngsten Generation im Jahr 1740.',
    emblem: ENEINIOG_EMBLEM,
    houseProfile: CELTIGERNS_WACHT_LOWER_KNIGHT_PROFILES.eneiniog
  },
  houses: [
    { id: ENEINIOG_HOUSE_ID, name: 'Haus Eneiniog', motto: '', emblem: ENEINIOG_EMBLEM, status: 'active' },
    house('house-balchder', 'Haus Balchder', 'assets/images/houses/Llamreis Ankunft/haus-balchder.png')
  ],
  persons: [
    // Gründerpaar; die folgenden Generationen sind nicht einzeln überliefert.
    person('tyrnog-eneiniog', 'Tyrnog Eneiniog', 'male', '????', '????', ENEINIOG_HOUSE_ID, {
      title: 'Begründer des Ritterherrenhauses Eneiniog',
      notes: 'Ehemaliger Kämmerer des Hauses Saethwyr; für verantwortungsbewusste Barmherzigkeit gegenüber Schuldnern zum Ritterherren erhoben.'
    }),
    unknownSpouse('unknown-spouse-tyrnog-eneiniog', 'female'),

    // Erste einzeln überlieferte Generation nach der Überlieferungslücke.
    person('urien-eneiniog', 'Urien Eneiniog', 'male', '1628', '1708', ENEINIOG_HOUSE_ID, {
      title: 'Ehemaliger Ritterherr des Hauses Eneiniog'
    }),
    unknownSpouse('unknown-spouse-urien-eneiniog', 'female'),
    person('ceridwenog-eneiniog', 'Ceridwenog Eneiniog', 'female', '1637', '1712'),
    unknownSpouse('unknown-spouse-ceridwenog-eneiniog', 'male'),
    person('peredur-eneiniog', 'Peredur Eneiniog', 'male', '1645', '', ENEINIOG_HOUSE_ID, {
      title: 'Priester des Vaters',
      notes: 'Hochrangiger Geistlicher und Priester des Vaters aus Gwynthor im direkten Dienst des Patriarchen; bekannt für ruhige Güte und maßvolle Autorität.'
    }),
    unknownSpouse('unknown-spouse-peredur-eneiniog', 'female'),
    person('tuduryn-eneiniog', 'Tuduryn Eneiniog', 'male', '1648', '1725'),
    unknownSpouse('unknown-spouse-tuduryn-eneiniog', 'female'),

    // Kinder der ersten einzeln überlieferten Generation.
    person('millena-eneiniog', 'Millena Eneiniog', 'female', '1652', '1737'),
    person('uther-balchder', 'Uther Balchder', 'male', '1648', '1730', 'house-balchder', {
      familyRole: 'married',
      title: 'Ehemaliger Ritterherr des Hauses Balchder'
    }),
    person('maredog-eneiniog', 'Maredog Eneiniog', 'male', '1670', '', ENEINIOG_HOUSE_ID, {
      title: 'Ritterherr des Hauses Eneiniog'
    }),
    unknownSpouse('unknown-spouse-maredog-eneiniog', 'female'),
    person('lywell-eneiniog', 'Lywell Eneiniog', 'male', '1673', '', ENEINIOG_HOUSE_ID, {
      title: 'Fahrender Paladin',
      notes: 'Legte den Eid der Enthaltsamkeit ab, heiratete nie und kehrt einmal im Jahr zur Familie zurück.'
    }),
    person('cledwen-eneiniog', 'Cledwen Eneiniog', 'female', '1675', ''),
    unknownSpouse('unknown-spouse-cledwen-eneiniog', 'male'),
    person('rhiwallon-eneiniog', 'Rhiwallon Eneiniog', 'male', '1678', ''),
    unknownSpouse('unknown-spouse-rhiwallon-eneiniog', 'female'),
    person('nefydd-eneiniog', 'Nefydd Eneiniog', 'male', '1680', ''),
    unknownSpouse('unknown-spouse-nefydd-eneiniog', 'female'),

    // Elterngeneration des Jahres 1740.
    person('angharad-eneiniog', 'Angharad Eneiniog', 'female', '1692', '', ENEINIOG_HOUSE_ID, {
      title: 'Paladin der Kirche von Gwynthor',
      notes: 'Möchte eines Tages wie Sir Lywell durch Cenyr ziehen, ist gegenwärtig jedoch unverheiratet.'
    }),
    person('owain-eneiniog', 'Owain Eneiniog', 'male', '1695', '', ENEINIOG_HOUSE_ID, {
      title: 'Erster Erbe des Hauses Eneiniog'
    }),
    unknownSpouse('unknown-spouse-owain-eneiniog', 'female'),
    person('meriadog-eneiniog', 'Meriadog Eneiniog', 'male', '1697', '', ENEINIOG_HOUSE_ID, {
      title: 'Zweiter Erbe des Hauses Eneiniog'
    }),
    unknownSpouse('unknown-spouse-meriadog-eneiniog', 'female'),
    person('rhunog-eneiniog', 'Rhunog Eneiniog', 'male', '1699', ''),
    unknownSpouse('unknown-spouse-rhunog-eneiniog', 'female'),
    person('iyvan-eneiniog', 'Iyvan Eneiniog', 'male', '1701', ''),
    unknownSpouse('unknown-spouse-iyvan-eneiniog', 'female'),

    // Jüngste Generation: entsprechend der Vorgabe zwischen 25 und 14 Jahren alt.
    person('ygraine-eneiniog', 'Ygraine Eneiniog', 'female', '1715', ''),
    person('nolwen-eneiniog', 'Nolwen Eneiniog', 'female', '1717', ''),
    person('ieuanor-eneiniog', 'Ieuanor Eneiniog', 'male', '1718', ''),
    person('trysten-eneiniog', 'Trysten Eneiniog', 'male', '1720', ''),
    person('deiniol-eneiniog', 'Deiniol Eneiniog', 'male', '1721', ''),
    person('cynwrig-eneiniog', 'Cynwrig Eneiniog', 'male', '1722', ''),
    person('heddwyn-eneiniog', 'Heddwyn Eneiniog', 'male', '1723', ''),
    person('uthrynn-eneiniog', 'Uthrynn Eneiniog', 'male', '1724', ''),
    person('wynella-eneiniog', 'Wynella Eneiniog', 'female', '1726', '')
  ],
  partnerships: [
    createMarriage('marriage-tyrnog-unknown', ...FOUNDER_IDS, { status: 'ended' }),
    createMarriage('marriage-urien-unknown', ...URIEN_IDS, { status: 'ended' }),
    createMarriage('marriage-ceridwenog-unknown', ...CERIDWENOG_IDS, { status: 'ended' }),
    createMarriage('marriage-peredur-unknown', ...PEREDUR_IDS, { status: 'ended' }),
    createMarriage('marriage-tuduryn-unknown', ...TUDURYN_IDS, { status: 'ended' }),
    createMarriage('marriage-uther-millena', ...MILLENA_IDS, { status: 'ended' }),
    createMarriage('marriage-maredog-unknown', ...MAREDOG_IDS, { status: 'ended' }),
    createMarriage('marriage-cledwen-unknown', ...CLEDWEN_IDS, { status: 'ended' }),
    createMarriage('marriage-rhiwallon-unknown', ...RHIWALLON_IDS, { status: 'ended' }),
    createMarriage('marriage-nefydd-unknown', ...NEFYDD_IDS, { status: 'ended' }),
    createMarriage('marriage-owain-unknown', ...OWAIN_IDS, { status: 'ended' }),
    createMarriage('marriage-meriadog-unknown', ...MERIADOG_IDS, { status: 'ended' }),
    createMarriage('marriage-rhunog-unknown', ...RHUNOG_IDS, { status: 'ended' }),
    createMarriage('marriage-iyvan-unknown', ...IYVAN_IDS, { status: 'ended' })
  ],
  parentages: [
    ...childrenOf(
      ['urien-eneiniog', 'ceridwenog-eneiniog', 'peredur-eneiniog', 'tuduryn-eneiniog'],
      FOUNDER_IDS,
      'marriage-tyrnog-unknown',
      {
        type: 'claimed',
        certainty: 'probable',
        notes: 'Diese Personen gehören zur ersten einzeln überlieferten Generation nach der Lücke; die genaue Zahl der Zwischengenerationen ist unbekannt.'
      }
    ),
    ...childrenOf(['maredog-eneiniog', 'lywell-eneiniog', 'cledwen-eneiniog'], URIEN_IDS, 'marriage-urien-unknown'),
    ...childrenOf(['millena-eneiniog'], URIEN_IDS, 'marriage-urien-unknown', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Millenas Zuordnung als weitere Tochter Uriens wird aus der bestehenden Balchder-Überlieferung und der Chronologie erschlossen.'
    }),
    ...childrenOf(['rhiwallon-eneiniog'], PEREDUR_IDS, 'marriage-peredur-unknown'),
    ...childrenOf(['nefydd-eneiniog'], TUDURYN_IDS, 'marriage-tuduryn-unknown'),
    ...childrenOf(['angharad-eneiniog', 'owain-eneiniog'], MAREDOG_IDS, 'marriage-maredog-unknown'),
    ...childrenOf(['meriadog-eneiniog'], CLEDWEN_IDS, 'marriage-cledwen-unknown'),
    ...childrenOf(['rhunog-eneiniog'], RHIWALLON_IDS, 'marriage-rhiwallon-unknown'),
    ...childrenOf(['iyvan-eneiniog'], NEFYDD_IDS, 'marriage-nefydd-unknown'),
    ...childrenOf(['ygraine-eneiniog', 'nolwen-eneiniog'], OWAIN_IDS, 'marriage-owain-unknown'),
    ...childrenOf(['ieuanor-eneiniog', 'trysten-eneiniog', 'deiniol-eneiniog'], MERIADOG_IDS, 'marriage-meriadog-unknown'),
    ...childrenOf(['cynwrig-eneiniog', 'heddwyn-eneiniog'], RHUNOG_IDS, 'marriage-rhunog-unknown'),
    ...childrenOf(['uthrynn-eneiniog', 'wynella-eneiniog'], IYVAN_IDS, 'marriage-iyvan-unknown')
  ],
  lineage: {
    founderPartnershipId: 'marriage-tyrnog-unknown',
    houseId: ENEINIOG_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.8,
    crestFrame: 'silver',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '1628',
      label: 'Nicht einzeln überlieferte Generationen'
    }
  },
  cadetBranches: [
    createMarriedAwayBranch({
      id: 'married-away-balchder-millena',
      name: 'Haus Balchder',
      parentPartnershipId: 'marriage-uther-millena',
      houseId: 'house-balchder',
      targetFamilyId: 'haus-balchder',
      emblem: 'assets/images/houses/Llamreis Ankunft/haus-balchder.png',
      crestFrame: 'silver',
      notes: 'Millena Eneiniog wurde an Uther Balchder wegverheiratet; ihre Nachkommen werden im Stammbaum des Hauses Balchder fortgeführt.'
    })
  ],
  timeJumps: [],
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'tyrnog-eneiniog',
    orientation: 'vertical',
    ancestorDepth: 20,
    descendantDepth: 20,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {
    sourceNote: 'Genealogie, Hausdaten und Portraitquellen nach der bereitgestellten Eneiniog-Hierarchietabelle; die leere Stammbaumgrafik wurde gemäß Vorgabe nicht als Quelle verwendet. Unbekannte Ehepartner sind als reale, verstorbene Personenknoten mit nicht überlieferten Namen und Daten erfasst und gelten ausdrücklich nicht als ledig. Die Altersstaffel der jüngsten Generation reicht 1740 von Ygraine mit 25 bis Wynella mit 14 Jahren; die Elterngeneration wurde plausibel ergänzt. Millena Eneiniog und Uther Balchder werden über ihre bereits kanonisch belegten Weltpersonen-IDs mit Haus Balchder verknüpft; Millenas Stellung als weitere Tochter Uriens ist als wahrscheinliche Ergänzung gekennzeichnet. Als Ritterherrenhaus führt Eneiniog den silbernen Wappenrahmen.',
    blankFamily: false,
    sourceRevision: 1
  }
});
