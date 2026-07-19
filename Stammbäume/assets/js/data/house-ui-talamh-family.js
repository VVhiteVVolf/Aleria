import { DEFAULT_RELATIONSHIP_COLORS } from '../config/family-colors.js';
import { CELTIGERNS_WACHT_HOUSE_PROFILES } from './celtigerns-wacht-house-profiles.js';
import {
  createFamilyPerson,
  createMarriage,
  createMarriedAwayBranch,
  createParentages
} from './family-record-builders.js';

const HOUSE_EMBLEMS = Object.freeze({
  uiTalamh: 'assets/images/houses/Antike Crannath Clans/haus-ui-talamh.png',
  ardConbhron: 'assets/images/houses/Antike Crannath Clans/haus-ard-conbhron.png',
  draig: 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
  gafyr: 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png'
});

// Reale, bereits andernorts verwendete Portraits geteilter Weltpersonen. Alle übrigen
// Ui-Talamh-Personen bleiben absichtlich ohne Portrait: die alten Bilder aus der
// Forumsvorlage sind veraltet und werden hier nicht übernommen.
const SHARED_PORTRAITS = Object.freeze({
  'garym-gafyr': 'assets/images/portraits/haus-gafyr/garym-gafyr.jpg',
  'fiodhna-talamh': 'assets/images/portraits/haus-gafyr/fiodhna-talamh.jpg',
  'blathnaid-talamh': 'assets/images/portraits/haus-draig/blathnaid-talamh.jpg',
  'grugyn-draig': 'assets/images/portraits/haus-draig/grugyn-draig.jpg'
});

const UI_TALAMH_HOUSE_ID = 'house-talamh';

// Die Kopflinie läuft vom unbekannten Gründerpaar über Faolan, Roibeard und Cormac bis
// zu Murchadh, dessen Töchter Fíona und Máirín die letzte Generation stellen. Das Haus
// besteht heute nicht mehr eigenständig: alle Nachfahren sind in andere Häuser eingeheiratet.
const HOUSE_HEAD_IDS = new Set(['ahnherr-talamh', 'faolan-talamh', 'roibeard-talamh', 'cormac-talamh', 'murchadh-talamh']);
const MAIN_LINE_IDS = new Set(['fiona-talamh', 'mairin-talamh']);

function lineageRoleFor(personId) {
  if (HOUSE_HEAD_IDS.has(personId)) return 'head';
  return MAIN_LINE_IDS.has(personId) ? 'mainline' : 'branch';
}

function person(id, name, sex, birth = '????', death = '????', houseId = UI_TALAMH_HOUSE_ID, options = {}) {
  return createFamilyPerson({
    id,
    name,
    sex,
    birth,
    death,
    houseId,
    portrait: SHARED_PORTRAITS[id] || '',
    familyRole: options.familyRole || (houseId === UI_TALAMH_HOUSE_ID ? 'core' : 'married'),
    lineageRole: options.lineageRole || lineageRoleFor(id),
    ...options
  });
}

function house(id, name, emblem = '') {
  return { id, name, motto: '', emblem, status: 'active' };
}

function childrenOf(childIds, parentIds, partnershipId, options = {}) {
  return createParentages(childIds, parentIds, partnershipId, options);
}

function marriedAway(id, name, partnershipId, houseId, emblem = '') {
  return createMarriedAwayBranch({
    id,
    name,
    parentPartnershipId: partnershipId,
    houseId,
    targetFamilyId: houseId.replace(/^house-/, 'haus-'),
    emblem
  });
}

const FOUNDER_IDS = ['ahnherr-talamh', 'ahnfrau-talamh'];
const FAOLAN_IDS = ['faolan-talamh', 'bronach-gormard'];
const FIONNUALA_IDS = ['fionnuala-talamh', 'donall-ard-conbhron'];
const FIODHNA_IDS = ['fiodhna-talamh', 'garym-gafyr'];
const ROIBEARD_IDS = ['roibeard-talamh', 'liadan-ard-conbhron'];
const MAOLADH_IDS = ['maoladh-talamh', 'faolan-liaigh'];
const CORMAC_IDS = ['cormac-talamh', 'meabh-searlait'];
const BLATHNAID_IDS = ['blathnaid-talamh', 'grugyn-draig'];
const MURCHADH_IDS = ['murchadh-talamh', 'ragnailt-ard-conbhron'];
const EIBHLIN_IDS = ['eibhlin-talamh', 'searlas-diulb'];
const FIONA_IDS = ['fiona-talamh', 'ultan-searlait'];
const MAIRIN_IDS = ['mairin-talamh', 'daithin-cumhail'];

export const HOUSE_UI_TALAMH_FAMILY = Object.freeze({
  schema: 'aleria.family-tree',
  schemaVersion: 1,
  document: {
    id: 'haus-ui-talamh',
    title: 'Haus Ui Talamh',
    motto: '',
    description: 'Das antike Fürstengeschlecht der Crannath-Alben, das einst über das Fürstentum von Oseneach herrschte, bevor die Avallornier unter Celtigern ankamen, sich mit den Ui Talamh gegen gemeinsame Feinde verbündeten und daraus das Königreich Cenyr hervorging. Celtigerns eigenes Geschlecht Draig ließ sich nieder, wo es landete, und Celtigerns Wacht wurde zur Grafschaft der Draigs. Die Ui Talamh selbst bestehen heute nicht mehr eigenständig; ihre letzten Töchter und Söhne sind in andere Häuser eingeheiratet.',
    emblem: HOUSE_EMBLEMS.uiTalamh,
    houseProfile: CELTIGERNS_WACHT_HOUSE_PROFILES.uiTalamh
  },
  houses: [
    house(UI_TALAMH_HOUSE_ID, 'Haus Ui Talamh', HOUSE_EMBLEMS.uiTalamh),
    house('house-ard-conbhron', 'Haus Ard Conbhrón', HOUSE_EMBLEMS.ardConbhron),
    house('house-gafyr', 'Haus Gafyr', HOUSE_EMBLEMS.gafyr),
    house('house-draig', 'Haus Draig', HOUSE_EMBLEMS.draig),
    house('house-cumhail', 'Haus Cumhail'),
    house('house-diulb', 'Haus Diulb'),
    house('house-searlait', 'Haus Searlait')
  ],
  persons: [
    // Gründerpaar nicht überliefert.
    person('ahnherr-talamh', 'Unbekannter Ahnherr', 'male', '????', '????'),
    person('ahnfrau-talamh', 'Unbekannte Ahnfrau', 'female', '????', '????', ''),

    // Erste namentlich überlieferte Generation nach der Überlieferungslücke
    person('faolan-talamh', 'Faolan', 'male', '????', '????'),
    person('bronach-gormard', 'Brónach Gormárd', 'female', '????', '????', ''),

    // Faolans und Brónachs Kinder
    person('fionnuala-talamh', 'Fionnuala', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Haus Ard Conbhrón.'
    }),
    person('donall-ard-conbhron', 'Dónall Conbhrón', 'male', '????', '????', 'house-ard-conbhron'),
    person('fiodhna-talamh', 'Fíodhna', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Garym den Gehörnten, den Vater Kynwrig Gafyrs.'
    }),
    person('garym-gafyr', 'Garym der Gehörnte', 'male', '????', '????', 'house-gafyr'),
    person('roibeard-talamh', 'Roibeard', 'male', '????', '????'),
    person('liadan-ard-conbhron', 'Líadan Conbhrón', 'female', '????', '????', 'house-ard-conbhron'),
    person('maoladh-talamh', 'Maoladh', 'male', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Nebenzweig ohne überlieferte Nachkommen.'
    }),
    person('faolan-liaigh', 'Faolán Liaigh', 'female', '????', '????', ''),
    person('cathan-talamh', 'Cathán', 'male', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Nebenzweig ohne überlieferte Ehe oder Nachkommen.'
    }),

    // Roibeards und Líadans Kinder
    person('cormac-talamh', 'Cormac', 'male', '????', '????'),
    person('meabh-searlait', 'Méabh Searlait', 'female', '????', '????', 'house-searlait'),
    person('blathnaid-talamh', 'Blathnaid', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Haus Draig, an Celtigerns Sohn Grugyn.'
    }),
    person('grugyn-draig', 'Grugyn', 'male', '????', '????', 'house-draig'),

    // Cormacs und Méabhs Kinder
    person('murchadh-talamh', 'Murchadh', 'male', '????', '????'),
    person('ragnailt-ard-conbhron', 'Ragnailt Conbhrón', 'female', '????', '????', 'house-ard-conbhron'),
    person('eibhlin-talamh', 'Eibhlín', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Haus Diulb.'
    }),
    person('searlas-diulb', 'Séarlas Diulb', 'male', '????', '????', 'house-diulb'),

    // Murchadhs und Ragnailts Kinder: die letzte überlieferte Generation. Beide Töchter
    // heiraten in andere Häuser; danach besteht Ui Talamh nicht mehr eigenständig fort.
    person('fiona-talamh', 'Fíona', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Haus Searlait.'
    }),
    person('ultan-searlait', 'Ultán Searlait', 'male', '????', '????', 'house-searlait'),
    person('mairin-talamh', 'Máirín', 'female', '????', '????', UI_TALAMH_HOUSE_ID, {
      notes: 'Verheiratet an Haus Cumhail.'
    }),
    person('daithin-cumhail', 'Dáithín Mac Cumhail', 'male', '????', '????', 'house-cumhail')
  ],
  partnerships: [
    createMarriage('marriage-ahnherr-ahnfrau-talamh', ...FOUNDER_IDS),
    createMarriage('marriage-faolan-bronach', ...FAOLAN_IDS),
    createMarriage('marriage-fionnuala-donall', ...FIONNUALA_IDS),
    createMarriage('marriage-fiodhna-garym', ...FIODHNA_IDS),
    createMarriage('marriage-roibeard-liadan', ...ROIBEARD_IDS),
    createMarriage('marriage-maoladh-faolanliaigh', ...MAOLADH_IDS),
    createMarriage('marriage-cormac-meabh', ...CORMAC_IDS),
    createMarriage('marriage-blathnaid-grugyn', ...BLATHNAID_IDS),
    createMarriage('marriage-murchadh-ragnailt', ...MURCHADH_IDS),
    createMarriage('marriage-eibhlin-searlas', ...EIBHLIN_IDS),
    createMarriage('marriage-fiona-ultan', ...FIONA_IDS),
    createMarriage('marriage-mairin-daithin', ...MAIRIN_IDS)
  ],
  parentages: [
    ...childrenOf(['faolan-talamh'], FOUNDER_IDS, 'marriage-ahnherr-ahnfrau-talamh', {
      type: 'claimed',
      certainty: 'probable',
      notes: 'Mehrere Generationen vor Faolan sind nicht überliefert.'
    }),
    ...childrenOf(
      ['fionnuala-talamh', 'fiodhna-talamh', 'roibeard-talamh', 'maoladh-talamh', 'cathan-talamh'],
      FAOLAN_IDS,
      'marriage-faolan-bronach'
    ),
    ...childrenOf(['cormac-talamh', 'blathnaid-talamh'], ROIBEARD_IDS, 'marriage-roibeard-liadan'),
    ...childrenOf(['murchadh-talamh', 'eibhlin-talamh'], CORMAC_IDS, 'marriage-cormac-meabh'),
    ...childrenOf(['fiona-talamh', 'mairin-talamh'], MURCHADH_IDS, 'marriage-murchadh-ragnailt')
  ],
  cadetBranches: [
    marriedAway('married-away-ard-conbhron-fionnuala', 'Haus Ard Conbhrón', 'marriage-fionnuala-donall', 'house-ard-conbhron', HOUSE_EMBLEMS.ardConbhron),
    marriedAway('married-away-gafyr-fiodhna', 'Haus Gafyr', 'marriage-fiodhna-garym', 'house-gafyr', HOUSE_EMBLEMS.gafyr),
    marriedAway('married-away-draig-blathnaid', 'Haus Draig', 'marriage-blathnaid-grugyn', 'house-draig', HOUSE_EMBLEMS.draig),
    marriedAway('married-away-diulb-eibhlin', 'Haus Diulb', 'marriage-eibhlin-searlas', 'house-diulb'),
    marriedAway('married-away-searlait-fiona', 'Haus Searlait', 'marriage-fiona-ultan', 'house-searlait'),
    marriedAway('married-away-cumhail-mairin', 'Haus Cumhail', 'marriage-mairin-daithin', 'house-cumhail')
  ],
  timeJumps: [],
  lineage: {
    founderPartnershipId: 'marriage-ahnherr-ahnfrau-talamh',
    houseId: UI_TALAMH_HOUSE_ID,
    crestSubtitle: '',
    crestEmblemScale: 0.86,
    crestFrame: 'gold',
    crestFrameScale: 1,
    timeGap: {
      enabled: true,
      years: 0,
      fromYear: '????',
      toYear: '????',
      label: 'Die Generationen vor Faolan sind nicht einzeln überliefert'
    }
  },
  presentation: { relationshipColors: { ...DEFAULT_RELATIONSHIP_COLORS } },
  view: {
    focusPersonId: 'ahnherr-talamh',
    orientation: 'vertical',
    ancestorDepth: 5,
    descendantDepth: 5,
    limitGenerations: false,
    showSiblings: true
  },
  extensions: {}
});
