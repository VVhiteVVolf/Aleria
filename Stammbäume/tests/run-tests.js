import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  isPortraitCardEvent,
  toFamilyChartData
} from '../assets/js/adapters/family-chart-adapter.js';
import { resolveFamilyChartViewDepths } from '../assets/js/adapters/family-chart-depth.js';
import {
  createFamilyChartCardHtml,
  FAMILY_CHART_CARD_LAYOUT
} from '../assets/js/adapters/family-chart-card-renderer.js';
import { createRoundedOrthogonalPath } from '../assets/js/adapters/family-chart-link-renderer.js';
import { getCrestFrame, getPersonCardFrame } from '../assets/js/config/chart-frames.js';
import { SAMPLE_FAMILY } from '../assets/js/data/sample-family.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { HOUSE_ARWYDD_FAMILY } from '../assets/js/data/house-arwydd-family.js';
import { HOUSE_ARWYDD_PORTRAITS } from '../assets/js/data/house-arwydd-portraits.js';
import {
  HOUSE_GWEFRYDD_FAMILY,
  HOUSE_GWYVERN_FAMILY
} from '../assets/js/data/blank-house-families.js';
import { HOUSE_DRAIG_FAMILY } from '../assets/js/data/house-draig-family.js';
import { HOUSE_DRAIG_PORTRAITS } from '../assets/js/data/house-draig-portraits.js';
import { HOUSE_GAFYR_FAMILY } from '../assets/js/data/house-gafyr-family.js';
import { HOUSE_GAFYR_PORTRAITS } from '../assets/js/data/house-gafyr-portraits.js';
import { HOUSE_WYRM_FAMILY } from '../assets/js/data/house-wyrm-family.js';
import { HOUSE_WYRM_PORTRAITS } from '../assets/js/data/house-wyrm-portraits.js';
import { HOUSE_SAETHWYR_FAMILY } from '../assets/js/data/house-saethwyr-family.js';
import { HOUSE_SAETHWYR_PORTRAITS } from '../assets/js/data/house-saethwyr-portraits.js';
import {
  LOWER_KNIGHT_HOUSE_DEFINITIONS,
  LOWER_KNIGHT_HOUSE_FAMILIES
} from '../assets/js/data/lower-knight-house-families.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import { createEmptyFamily, createFoundingFamily } from '../assets/js/domain/family-factory.js';
import {
  createFolderPathFromHouseProfile,
  formatHouseProfile,
  getHouseRank
} from '../assets/js/domain/house-profile.js';
import { calculateAge, formatLifeLine } from '../assets/js/domain/person-presentation.js';
import { buildRegistryFolderTree } from '../assets/js/modules/family-registry/registry-folder-tree.js';
import {
  FamilyValidationError,
  assertValidFamily,
  normalizeFamily,
  validateFamily
} from '../assets/js/domain/family-schema.js';
import {
  loadFamilyById,
  listFamilyRecords,
  parseFolderPath,
  saveFamilyToLibrary
} from '../assets/js/services/family-library.js';
import { createFamilyViewLink, normalizeFamilyViewLink } from '../assets/js/services/family-links.js';
import { migrateLegacyFamily, parseFamilyJson, serializeFamily } from '../assets/js/services/family-transfer.js';
import {
  createAlmanachHouseCandidates,
  createTreePersonFromAlmanach
} from '../assets/js/modules/almanach-bridge/almanach-character-bridge.js';
import {
  createPersonBiographyModule,
  createPersonBiographyStats,
  getPersonBiographyModule,
  normalizePersonBiographyModule,
  PERSON_BIOGRAPHY_EXTENSION_ID
} from '../assets/js/modules/person-biography/person-biography-model.js';
import { renderPersonBiography } from '../assets/js/modules/person-biography/person-biography-renderer.js';
import { buildRelationshipMatrix } from '../assets/js/modules/relationship-matrix/relationship-matrix-model.js';
import { renderRelationshipMatrix } from '../assets/js/modules/relationship-matrix/relationship-matrix-renderer.js';
import {
  createWorkspaceModeUrl,
  grantWorkspaceEditAccess,
  resolveWorkspaceAccess,
  WORKSPACE_MODE
} from '../assets/js/services/workspace-access.js';
import { createFamilyStore } from '../assets/js/state/family-store.js';
import {
  createFamilyChangeSet,
  familyFromRepositoryRecords,
  familyRootRecord,
  isValidFirestoreRecordId
} from '../assets/js/modules/family-sync/family-change-set.js';
import { buildFamilyPersonDisplayName } from '../../js/world-identity/family-person-names.js';
import { normalizePersonName } from '../../js/world-identity/person-identity.js';

const tests = [];

function test(name, callback) {
  tests.push({ name, callback });
}

function createMemoryStorage() {
  const entries = new Map();
  return {
    getItem(key) {
      return entries.has(key) ? entries.get(key) : null;
    },
    setItem(key, value) {
      entries.set(key, String(value));
    },
    removeItem(key) {
      entries.delete(key);
    }
  };
}

test('normalisiert Rollen, Gründerlinie und Kadettenhäuser', () => {
  const family = normalizeFamily(SAMPLE_FAMILY);
  assert.equal(family.schema, 'aleria.family-tree');
  assert.equal(family.schemaVersion, 1);
  assert.equal(family.persons.length, 11);
  assert.equal(family.view.orientation, 'vertical');
  assert.equal(family.lineage.timeGap.years, 500);
  assert.equal(family.lineage.timeGap.fromYear, '1252');
  assert.equal(family.lineage.timeGap.toYear, '1704');
  assert.equal(family.lineage.crestSubtitle, 'Stammwappen des Nordturms');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.crestEmblemScale, 0.86);
  assert.equal(family.lineage.crestFrameScale, 1);
  assert.equal(family.cadetBranches[0].crestFrame, 'silver');
  assert.equal(family.cadetBranches[0].emblemScale, 0.86);
  assert.equal(family.cadetBranches[0].frameScale, 1);
  assert.equal(family.cadetBranches[0].targetFamilyId, 'haus-sgrechwyr');
  assert.ok(family.persons.some(person => person.familyRole === 'ward-away'));
});

test('entfernt nicht unterstützte Geschlechtswerte aus dem Modell', () => {
  const family = normalizeFamily({
    ...SAMPLE_FAMILY,
    persons: SAMPLE_FAMILY.persons.map((person, index) => (
      index === 0 ? { ...person, sex: 'nonbinary' } : person
    ))
  });
  assert.equal(family.persons[0].sex, 'unknown');
});

test('berechnet Beziehungen ausschließlich aus dem Graphen', () => {
  const graph = createFamilyGraph(SAMPLE_FAMILY);
  assert.deepEqual(graph.getParents('cassian-vael').map(person => person.id), ['aeron-vael', 'lyria-vael']);
  assert.deepEqual(graph.getChildren('aeron-vael').map(person => person.id), ['cassian-vael', 'maelis-vael']);
  assert.deepEqual(graph.getParents('oryn-ash').map(person => person.id), ['elyra-mire', 'maelis-vael']);
  assert.equal(graph.getSiblings('cassian-vael').find(entry => entry.person.id === 'maelis-vael')?.kind, 'full');
  assert.equal(graph.getGenerationCount(), 3);
});

test('findet Personen über Name, Titel und Haus', () => {
  const graph = createFamilyGraph(SAMPLE_FAMILY);
  assert.equal(graph.search('Aschegarde')[0]?.id, 'oryn-ash');
  assert.ok(graph.search('Thorne').some(person => person.id === 'seraphine-thorne'));
});

test('erkennt vorhandene Almanach-Charaktere rückwärts für ein Haus', () => {
  const family = {
    document: { id: 'haus-draig', title: 'Haus Draig' },
    lineage: { houseId: 'house-draig' },
    houses: [{ id: 'house-draig', name: 'Haus Draig' }],
    persons: [{
      id: 'gawain-draig',
      worldPersonId: 'person--haus-draig--gawain-draig',
      name: 'Gawain',
      birth: '1722',
      houseId: 'house-draig'
    }]
  };
  const candidates = createAlmanachHouseCandidates(family, [{
    id: 'almanach-gawain',
    name: 'Gawain Draig',
    genealogy: { birth: '1722' }
  }, {
    id: 'almanach-maelin',
    name: 'Maelin Draig',
    title: 'Hüterin der Flamme',
    status: 'active',
    genealogy: { birth: '1701', sex: 'female' }
  }, {
    id: 'almanach-idris',
    name: 'Idris Arwydd',
    genealogy: { birth: '1687', houseName: 'Haus Arwydd' }
  }]);
  const gawain = candidates.find(candidate => candidate.character.id === 'almanach-gawain');
  const maelin = candidates.find(candidate => candidate.character.id === 'almanach-maelin');
  const idris = candidates.find(candidate => candidate.character.id === 'almanach-idris');

  assert.equal(gawain.isHouseRelevant, true);
  assert.equal(gawain.match.kind, 'probable');
  assert.equal(gawain.match.character.treePerson.id, 'gawain-draig');
  assert.equal(maelin.isHouseRelevant, true);
  assert.equal(maelin.match, null);
  assert.equal(idris.isHouseRelevant, false);

  const mappedMaelin = createTreePersonFromAlmanach(family, maelin);
  assert.equal(mappedMaelin.name, 'Maelin Draig');
  assert.equal(mappedMaelin.birth, '1701');
  assert.equal(mappedMaelin.sex, 'female');
  assert.equal(mappedMaelin.status, 'alive');
  assert.equal(mappedMaelin.houseId, 'house-draig');
  assert.equal(mappedMaelin.familyRole, 'core');
  assert.equal(mappedMaelin.worldPersonId, 'person--almanach--almanach-maelin');

  const linked = createAlmanachHouseCandidates(family, [{
    id: 'linked-gawain',
    name: 'Gawain Draig',
    identity: { worldPersonId: 'person--haus-draig--gawain-draig' },
    genealogy: { birth: '1722' }
  }])[0];
  assert.equal(linked.match.kind, 'linked');

  const identityConflict = createAlmanachHouseCandidates(family, [{
    id: 'other-gawain',
    name: 'Gawain Draig',
    identity: { worldPersonId: 'person--anderer-gawain' },
    genealogy: { birth: '1722' }
  }])[0];
  assert.equal(identityConflict.match.kind, 'conflict');
});

test('übersetzt Gründerwappen, Zeitsprung und Kadettenhaus im Adapter', () => {
  const converted = toFamilyChartData(SAMPLE_FAMILY);
  const byId = new Map(converted.data.map(person => [person.id, person]));
  const aeron = byId.get('aeron-vael');
  const cassian = byId.get('cassian-vael');
  const crest = [...byId.values()].find(person => person.data.nodeKind === 'house-crest');
  const gap = [...byId.values()].find(person => person.data.nodeKind === 'time-gap');
  const cadet = [...byId.values()].find(person => person.data.nodeKind === 'cadet-house');

  assert.ok(aeron.rels.spouses.includes('lyria-vael'));
  assert.deepEqual(aeron.rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [gap.id]);
  assert.deepEqual(cassian.rels.parents, [gap.id]);
  assert.ok(gap.rels.children.includes('maelis-vael'));
  assert.deepEqual(cadet.rels.parents, ['cassian-vael', 'seraphine-thorne']);
  assert.equal(cadet.data.aleria.targetFamilyId, 'haus-sgrechwyr');
  assert.equal(cassian.data.portrait, 'assets/images/placeholders/male.png');
  assert.equal(cassian.data.frameAsset, getPersonCardFrame('core').asset);
  assert.equal(cassian.data.crest, 'assets/images/emblem-house-vael.svg');
  assert.equal(crest.data.crestFrameAsset, getCrestFrame('gold').asset);
  assert.equal(cadet.data.crestFrameAsset, getCrestFrame('silver').asset);
  assert.deepEqual(converted.getPartnershipLine('maelis-vael', 'elyra-mire'), {
    type: 'affair', color: '#704485', dashed: true
  });
  assert.equal(converted.getParentageLine('oryn-ash').color, '#62615e');
});

test('baut Personenkarten in der vorgegebenen Ebenenfolge auf', () => {
  const converted = toFamilyChartData(SAMPLE_FAMILY);
  const person = converted.data.find(entry => entry.id === 'aeron-vael');
  const html = createFamilyChartCardHtml({ data: person });
  const layers = [
    'aleria-person-card__fill',
    'aleria-person-card__portrait-backdrop',
    'aleria-person-card__portrait',
    'aleria-person-card__text',
    'aleria-person-card__frame',
    'aleria-person-card__crest'
  ].map(className => html.indexOf(className));
  assert.ok(layers.every(index => index >= 0));
  assert.deepEqual(layers, [...layers].sort((first, second) => first - second));
  assert.match(html, /person-core\.png/);
});

test('persistiert Hauptlinie und Oberhaupt als eigene Personenstellung', async () => {
  const family = normalizeFamily({
    ...SAMPLE_FAMILY,
    persons: SAMPLE_FAMILY.persons.map(person => {
      if (person.id === 'aeron-vael') return { ...person, lineageRole: 'head' };
      if (person.id === 'cassian-vael') return { ...person, lineageRole: 'mainline' };
      if (person.id === 'maelis-vael') return { ...person, lineageRole: 'unbekannt' };
      return person;
    })
  });
  const converted = toFamilyChartData(family);
  const byId = new Map(converted.data.map(person => [person.id, person]));
  const head = byId.get('aeron-vael');
  const successor = byId.get('cassian-vael');

  assert.equal(family.persons.find(person => person.id === 'maelis-vael').lineageRole, 'branch');
  assert.equal(head.data.frameAsset, getPersonCardFrame('core', 'head').asset);
  assert.equal(head.data.frameVariant, 'head');
  assert.equal(head.data.crest, '');
  assert.equal(successor.data.lineageRole, 'mainline');
  assert.equal(successor.data.frameVariant, 'standard');

  const headHtml = createFamilyChartCardHtml({ data: head });
  const successorHtml = createFamilyChartCardHtml({ data: successor });
  assert.match(headHtml, /lineage-head frame-head/);
  assert.match(headHtml, /OberhauptFrame\.PNG/);
  assert.doesNotMatch(headHtml, /aleria-person-card__crest/);
  assert.match(successorHtml, /lineage-mainline frame-standard/);

  const store = createFamilyStore(family);
  store.updatePerson('cassian-vael', { lineageRole: 'head' });
  assert.equal(store.getState().family.persons.find(person => person.id === 'cassian-vael').lineageRole, 'head');

  const frameAsset = await readFile(new URL('../assets/images/frames/OberhauptFrame.PNG', import.meta.url));
  const portraitBackground = await readFile(new URL('../assets/images/portraits/backgrounds/portrait-archway.webp', import.meta.url));
  const theme = await readFile(new URL('../assets/css/family-chart-theme.css', import.meta.url), 'utf8');
  assert.ok(frameAsset.length > 1000);
  assert.ok(portraitBackground.length > 100);
  assert.match(theme, /\.aleria-person-card\.lineage-mainline/);
  assert.match(theme, /portrait-archway\.webp/);
  assert.match(theme, /left:\s*6\.6%/);
});

test('berücksichtigt die eigene Wappenposition jeder Personenfassung', async () => {
  const core = getPersonCardFrame('core');
  const married = getPersonCardFrame('married');
  const forced = getPersonCardFrame('forced');
  const adopted = getPersonCardFrame('adopted');
  const legitimized = getPersonCardFrame('core', 'branch', 'legitimized');
  assert.notEqual(core.crestPosition.top, married.crestPosition.top);
  assert.notEqual(core.crestPosition.left, forced.crestPosition.left);
  assert.equal(legitimized.variant, 'legitimized');
  assert.notDeepEqual(legitimized.crestPosition, adopted.crestPosition, 'Das Legitimiert-Wappen sitzt kleiner mittig im Medaillonring.');
  assert.deepEqual(legitimized.crestPosition, {
    left: '41.05%',
    top: '2.45%',
    width: '13.5%',
    height: '20.3%'
  });
  assert.ok((await readFile(new URL('../assets/images/frames/person-legitimiert.png', import.meta.url))).length > 1000);

  const converted = toFamilyChartData({
    ...SAMPLE_FAMILY,
    persons: SAMPLE_FAMILY.persons.map(person => (
      person.id === 'aeron-vael' ? { ...person, familyRole: 'forced' } : person
    ))
  });
  const person = converted.data.find(entry => entry.id === 'aeron-vael');
  const html = createFamilyChartCardHtml({ data: person });
  assert.match(html, /--card-crest-left:40\.7%/);
  assert.match(html, /--card-crest-top:1\.3%/);
  assert.match(html, /--card-crest-width:14\.2%/);
});

test('setzt beide Jahreszahlen ohne Von/Bis über die Linien des Zeitrahmens', () => {
  const converted = toFamilyChartData(SAMPLE_FAMILY);
  const gap = converted.data.find(entry => entry.data.nodeKind === 'time-gap');
  const html = createFamilyChartCardHtml({ data: gap });
  assert.equal(gap.data.fromYear, '1252');
  assert.equal(gap.data.toYear, '1704');
  assert.match(html, />1252<\/span>/);
  assert.match(html, />1704<\/span>/);
  assert.doesNotMatch(html, />Von<|>Bis</);
});

test('unterdrückt den rechteckigen Family-Chart-Hintergrund für alle Ebenenkarten', async () => {
  const css = await readFile(new URL('../assets/css/family-chart-theme.css', import.meta.url), 'utf8');
  const goldFrame = await readFile(new URL('../assets/images/frames/crest-gold.png', import.meta.url));
  assert.match(css, /\.family-chart-host\.f3 div\.card \.aleria-chart-card\s*\{\s*background: transparent;/);
  assert.match(css, /\.aleria-crest-node__emblem-clip\s*\{[\s\S]*?z-index: 1;/);
  assert.match(css, /\.aleria-crest-node__emblem\s*\{[\s\S]*?scale\(var\(--crest-emblem-scale, 0\.86\)\);/);
  assert.match(css, /\.aleria-crest-node__frame\s*\{[\s\S]*?z-index: 4;/);
  assert.doesNotMatch(css, /\.aleria-crest-node__frame\s*\{[\s\S]*?mix-blend-mode:/);
  const portraitRule = css.match(/\.aleria-person-card__portrait\s*\{([\s\S]*?)\}/)?.[1] || '';
  const portraitLayoutRule = css.match(/\.aleria-person-card__portrait-backdrop,\s*\.aleria-person-card__portrait\s*\{([\s\S]*?)\}/)?.[1] || '';
  assert.match(portraitLayoutRule, /left: 6\.6%;/);
  assert.match(portraitLayoutRule, /width: 30\.5%;/);
  assert.doesNotMatch(portraitRule, /border-radius|clip-path/);
  assert.match(css, /\.aleria-person-card__portrait-backdrop\s*\{[\s\S]*?portrait-archway\.webp/);
  assert.equal(goldFrame[25], 6, 'Der Goldrahmen muss als RGBA-PNG echte Transparenz besitzen.');
});

test('rendert Wappenknoten ohne eingeblendeten Aktions- oder Standardtext', () => {
  const converted = toFamilyChartData(createFoundingFamily({
    documentTitle: 'Haus Klarblick',
    founderManName: 'Aren Klarblick',
    founderWomanName: 'Mira Klarblick'
  }));
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  const html = createFamilyChartCardHtml({ data: crest });
  assert.equal(crest.data.title, '');
  assert.doesNotMatch(html, /Nachkommen hinzufügen|Wappen der Kadettenlinie/);
  assert.match(html, /crest-gold\.png/);
  assert.ok(
    html.indexOf('aleria-crest-node__emblem') < html.indexOf('aleria-crest-node__frame'),
    'Das Wappen muss unter seiner Fassung gerendert werden.'
  );
});

test('setzt bei ungültigen Wappenfassungen zuverlässig den Goldrahmen ein', () => {
  const family = normalizeFamily({
    ...SAMPLE_FAMILY,
    lineage: { ...SAMPLE_FAMILY.lineage, crestFrame: 'diamant' },
    cadetBranches: SAMPLE_FAMILY.cadetBranches.map(branch => ({ ...branch, crestFrame: 'holz' }))
  });
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.cadetBranches[0].crestFrame, 'gold');
});

test('formatiert Lebensdaten im verbindlichen Almanach-Stil', () => {
  assert.equal(formatLifeLine({ birth: '1178', death: '1244', status: 'dead' }), '† 1178 - 1244 †');
  assert.equal(formatLifeLine({ birth: '1704', death: '', status: 'alive' }), '1704 - lebend');
  assert.equal(formatLifeLine({ birth: '', death: '', status: 'unknown' }), '???? - ????');
});

test('berechnet Alter verbindlich für das Gegenwartsjahr 1740', () => {
  assert.equal(calculateAge({ birth: '1740', death: '', status: 'alive' }), 0);
  assert.equal(calculateAge({ birth: '1700', death: '', status: 'alive' }), 40);
  assert.equal(calculateAge({ birth: '1700', death: '1732', status: 'dead' }), 32);
  assert.equal(calculateAge({ birth: 'unbekannt', death: '', status: 'alive' }), null);
});

test('bildet Haus Arwydd mit den Beziehungen aus der Vorlage ab', () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const graph = createFamilyGraph(family);
  assert.equal(family.persons.length, 27);
  assert.equal(family.partnerships.length, 9);
  assert.equal(family.parentages.length, 17);
  assert.equal(family.document.emblem, 'assets/images/houses/haus-arwydd.png');
  assert.equal(family.view.focusPersonId, 'idwalladr-arwydd');
  assert.equal(graph.getPerson('idwalladr-arwydd').birth, '1653');
  assert.equal(graph.getPerson('idwalladr-arwydd').death, '1720');
  assert.equal(graph.getPerson('breandan-saethwyr').death, '1730');
  assert.equal(graph.getPerson('ilaria-arwydd').birth, '1728');
  assert.deepEqual(
    Object.fromEntries(family.houses.filter(house => house.emblem).map(house => [house.id, house.emblem])),
    {
      'house-arwydd': 'assets/images/houses/haus-arwydd.png',
      'house-saethwyr': 'assets/images/houses/haus-saethwyr.png',
      'house-wyrm': 'assets/images/houses/haus-wyrm.png',
      'house-draig': 'assets/images/houses/haus-draig.png',
      'house-gafyr': 'assets/images/houses/haus-gafyr.png',
      'house-gwefrydd': 'assets/images/houses/haus-gwefrydd.png',
      'house-gwywern': 'assets/images/houses/haus-gwyvern.png'
    }
  );
  assert.deepEqual(
    new Set(graph.getChildren('idwalladr-arwydd').map(person => person.name)),
    new Set(['Imogen', 'Idris', 'Iseult'])
  );
  assert.deepEqual(
    new Set(graph.getChildren('idris-arwydd').map(person => person.name)),
    new Set(['Ianto', 'Izolda', 'Ieuan', 'Izobel', 'Iorwerth'])
  );
  assert.deepEqual(
    new Set(graph.getChildren('ianto-arwydd').map(person => person.name)),
    new Set(['Ifor', 'Idelle', 'Ivor', 'Isolde'])
  );

  const chartById = new Map(toFamilyChartData(family).data.map(person => [person.id, person]));
  family.partnerships.forEach(partnership => {
    const [firstId, secondId] = partnership.participantIds;
    assert.ok(chartById.get(firstId).rels.spouses.includes(secondId));
    assert.ok(chartById.get(secondId).rels.spouses.includes(firstId));
  });
  assert.equal(family.cadetBranches.length, 4);
  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away'));
  family.cadetBranches.forEach(branch => {
    const node = [...chartById.values()].find(entry => entry.data.aleria.cadetBranchId === branch.id);
    assert.ok(node, `${branch.name} muss als verlinkter Endknoten erscheinen.`);
    assert.equal(node.data.title, 'Wegverheiratete Linie');
  });
  assert.equal(chartById.get('breandan-saethwyr').data.crest, 'assets/images/houses/haus-saethwyr.png');
  assert.equal(chartById.get('eiddon-wym').data.crest, 'assets/images/houses/haus-wyrm.png');
  assert.equal(chartById.get('tecwyn-draig').data.crest, 'assets/images/houses/haus-draig.png');
  assert.equal(chartById.get('kelyddon-gafyr').data.crest, 'assets/images/houses/haus-gafyr.png');
  assert.equal(chartById.get('myrcella-gwefrydd').data.crest, 'assets/images/houses/haus-gwefrydd.png');
  assert.equal(chartById.get('gwynnan-gwywern').data.crest, 'assets/images/houses/haus-gwyvern.png');
  assert.equal(family.cadetBranches.find(branch => branch.id === 'married-away-wym').targetFamilyId, 'haus-wyrm');
});

test('liefert für Haus Arwydd sämtliche Portraits als lokale Projektdateien aus', async () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-arwydd/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_ARWYDD_PORTRAITS).length, 27);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_ARWYDD_PORTRAITS).sort());
  assert.ok(family.persons.every(person => person.portrait === HOUSE_ARWYDD_PORTRAITS[person.id]));

  await Promise.all(family.persons.map(async person => {
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('führt überlagerungsarme Verbindungslinien über gemeinsame rechtwinklige Stämme', () => {
  assert.equal(
    createRoundedOrthogonalPath([
      [0, 0],
      [0, 50],
      [0, 50],
      [100, 50],
      [100, 50],
      [100, 100]
    ]),
    'M 0 0 L 0 32 Q 0 50 18 50 L 82 50 Q 100 50 100 68 L 100 100'
  );
  assert.equal(createRoundedOrthogonalPath([[10, 5], [10, 40], [10, 80]]), 'M 10 5 L 10 80');
});

test('hält für Wappen- und Zeitknoten zusätzlichen Generationsabstand frei', () => {
  assert.equal(FAMILY_CHART_CARD_LAYOUT.horizontalSpacing, 430);
  assert.equal(FAMILY_CHART_CARD_LAYOUT.verticalSpacing, 326);
});

test('schützt den Bearbeitungsmodus mit einer sitzungsgebundenen Freigabe', () => {
  const storage = createMemoryStorage();
  assert.deepEqual(resolveWorkspaceAccess('https://aleria.local/Stammbaum.html?family=haus-arwydd', storage), {
    mode: WORKSPACE_MODE.view,
    requestedMode: WORKSPACE_MODE.view,
    shouldRequestPassword: false
  });
  assert.deepEqual(resolveWorkspaceAccess('https://aleria.local/Stammbaum.html?family=haus-arwydd&mode=edit', storage), {
    mode: WORKSPACE_MODE.view,
    requestedMode: WORKSPACE_MODE.edit,
    shouldRequestPassword: true
  });
  assert.equal(grantWorkspaceEditAccess('falsch', storage), false);
  assert.equal(grantWorkspaceEditAccess('7777', storage), true);
  assert.deepEqual(resolveWorkspaceAccess('https://aleria.local/Stammbaum.html?family=haus-arwydd&mode=edit', storage), {
    mode: WORKSPACE_MODE.edit,
    requestedMode: WORKSPACE_MODE.edit,
    shouldRequestPassword: false
  });
});

test('erzeugt explizite und familienbezogene Ansichts-URLs', () => {
  assert.equal(
    createWorkspaceModeUrl('https://aleria.local/Stammbaum.html?family=haus-arwydd&mode=edit', WORKSPACE_MODE.view),
    'https://aleria.local/Stammbaum.html?family=haus-arwydd&mode=view'
  );
  const arwydd = listFamilyRecords(createMemoryStorage()).find(record => record.id === 'haus-arwydd');
  assert.equal(arwydd.link, 'Stammbaum.html?family=haus-arwydd&mode=view');
  assert.equal(createFamilyViewLink('haus-draig'), 'Stammbaum.html?family=haus-draig&mode=view');
  assert.equal(
    normalizeFamilyViewLink('index.html?family=haus-arwydd&mode=edit', 'haus-arwydd'),
    'Stammbaum.html?family=haus-arwydd&mode=view'
  );
  assert.equal(
    normalizeFamilyViewLink('javascript:alert(1)', 'haus-wyrm'),
    'Stammbaum.html?family=haus-wyrm&mode=view',
    'Veröffentlichte Registry-Links dürfen keine fremden Ziele einschleusen.'
  );
});

test('liefert die Oberfläche standardmäßig schreibgeschützt und ohne Inline-Handler aus', async () => {
  const html = await readFile(new URL('../Stammbaum.html', import.meta.url), 'utf8');
  const inspectorScript = await readFile(new URL('../assets/js/ui/person-inspector.js', import.meta.url), 'utf8');
  const appController = await readFile(new URL('../assets/js/ui/app-controller.js', import.meta.url), 'utf8');
  assert.match(html, /id="family-app" data-workspace-mode="view"/);
  assert.match(html, /class="toolbar"[^>]*data-edit-only/);
  assert.match(html, /id="edit-access-dialog"/);
  assert.equal((html.match(/class="toolbar-icon/g) || []).length, 7);
  assert.match(html, /assets\/images\/toolbar\/fit-chart\.png/);
  assert.match(html, /assets\/images\/toolbar\/lineage\.png/);
  assert.match(html, /data-action="open-almanach-characters"/);
  assert.match(html, /id="almanach-character-dialog"/);
  assert.match(html, /assets\/css\/almanach-bridge\.css/);
  assert.match(html, /\.\.\/AleriaAlmanach\/styles\/module-page-biography\.css/);
  assert.match(html, /\.\.\/AleriaAlmanach\/styles\/icon-directory\.css/);
  assert.match(html, /\.\.\/AleriaAlmanach\/modules\/icon-directory\/icon-directory-data\.js/);
  assert.match(html, /id="person-biography-dialog"/);
  assert.match(html, /id="relationship-matrix-dialog"/);
  assert.match(html, /id="lineage-origin-dialog"/);
  assert.match(html, /name="childIds" multiple/);
  assert.match(html, /data-asset-target="emblem"/);
  assert.match(html, /id="person-lineage-role"/);
  assert.equal((html.match(/name="lineageRole"/g) || []).length, 2);
  assert.match(html, /assets\/css\/relationship-matrix\.css/);
  assert.match(html, /id="living-count"/);
  assert.match(html, /id="partnership-count"/);
  assert.match(inspectorScript, /data-action="open-time-jump-after-person"/);
  assert.match(appController, /relationshipMatrixDialog\.open\(store\.getState\(\)\.family, personId\)/);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)=/i);
});

test('übernimmt den Biographie-Vertrag des Almanachs als Personen-Erweiterung', () => {
  const module = normalizePersonBiographyModule({
    stats: [{ label: 'Haus', value: 'Haus Arwydd' }],
    quote: 'Ein <strong>Zitat</strong>',
    biography: {
      sideWidth: 120,
      connectionPortraitHeight: 20,
      connectionTextOffset: 99,
      abilities: [{ title: 'Geduld', detail: 'Ausdauernd', icon: '✦' }],
      extraSections: [{ position: 'afterWorks', mode: 'list', title: 'Spuren', text: 'Eine\nZwei' }],
      connections: [{ name: 'Iseult', detail: 'Schwester', imageFormat: 'square' }],
      documents: [{ title: 'Siegelring', text: 'Familienbesitz', link: './ring.html' }]
    }
  });

  assert.equal(module.schema, 'aleria.biography-module');
  assert.equal(module.schemaVersion, 1);
  assert.deepEqual(module.stats, [['Haus', 'Haus Arwydd']]);
  assert.equal(module.biography.sideWidth, 100);
  assert.equal(module.biography.connectionPortraitHeight, 44);
  assert.equal(module.biography.connectionTextOffset, 80);
  assert.equal(module.biography.abilities[0].title, 'Geduld');
  assert.equal(module.biography.extraSections[0].position, 'afterWorks');
  assert.equal(module.biography.connections[0].imageFormat, 'square');
  assert.equal(module.biography.documents[0].link, './ring.html');
});

test('legt neue Biographien mit zwölf sinnvollen Infotabellenzeilen an', () => {
  const person = HOUSE_ARWYDD_FAMILY.persons.find(item => item.id === 'idris-arwydd');
  const house = HOUSE_ARWYDD_FAMILY.houses.find(item => item.id === person.houseId);
  const stats = createPersonBiographyStats(person, house);

  assert.equal(stats.length, 12);
  assert.deepEqual(stats.map(([label]) => label), [
    'Vollständiger Name',
    'Haus',
    'Titel / Anrede',
    'Geboren',
    'Geburtsort',
    'Gestorben',
    'Alter im Jahr 1740',
    'Geschlecht',
    'Familienstand',
    'Rang / Stand',
    'Tätigkeit',
    'Wohnsitz'
  ]);
  assert.equal(stats[0][1], person.name);
  assert.equal(stats[1][1], house.name);
  assert.match(stats[6][1], /Jahre$/);
  assert.equal(createPersonBiographyModule(person, house).stats.length, 12);
});

test('bindet Almanach-Icons und auswahlstabile Rich-Text-Werkzeuge an', async () => {
  const [dialogSource, iconDataSource, css] = await Promise.all([
    readFile(new URL('../assets/js/modules/person-biography/person-biography-dialog.js', import.meta.url), 'utf8'),
    readFile(new URL('../../AleriaAlmanach/modules/icon-directory/icon-directory-data.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/css/person-biography.css', import.meta.url), 'utf8')
  ]);

  assert.match(dialogSource, /person-biography-dialog__divider/);
  assert.match(dialogSource, /data-biography-action="pick-ability-icon"/);
  assert.match(dialogSource, /rememberRichTextRange/);
  assert.match(dialogSource, /addEventListener\('mousedown', onMouseDown\)/);
  assert.match(iconDataSource, /globalThis\.ALERIA_ICON_DIRECTORY = ALERIA_ICON_DIRECTORY/);
  assert.match(css, /width:\s*100vw/);
  assert.match(css, /height:\s*100dvh/);
});

test('speichert Biographien mit Undo und Redo direkt an der Stammbaum-Person', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const person = store.getState().family.persons[0];
  const module = createPersonBiographyModule(person, SAMPLE_FAMILY.houses[0]);
  module.biography.biographyText = 'Chronik der Person';

  store.setPersonExtension(person.id, PERSON_BIOGRAPHY_EXTENSION_ID, module);
  assert.equal(getPersonBiographyModule(store.getState().family.persons[0]).biography.biographyText, 'Chronik der Person');
  assert.equal(store.undo(), true);
  assert.equal(getPersonBiographyModule(store.getState().family.persons[0]), null);
  assert.equal(store.redo(), true);
  assert.equal(getPersonBiographyModule(store.getState().family.persons[0]).biography.biographyText, 'Chronik der Person');

  store.setPersonExtension(person.id, PERSON_BIOGRAPHY_EXTENSION_ID, null);
  assert.equal(getPersonBiographyModule(store.getState().family.persons[0]), null);
});

test('rendert die Almanach-Biographie vollständig und erkennt Portraitklicks getrennt', () => {
  const person = HOUSE_ARWYDD_FAMILY.persons.find(item => item.id === 'idris-arwydd');
  const biographyModule = normalizePersonBiographyModule({
    stats: [['Haus', 'Haus Arwydd']],
    quote: 'Die Linie besteht.',
    quoteBy: 'Idris',
    biography: {
      portraitStages: ['https://i.imgur.com/idris-jung.png', '', 'https://i.imgur.com/idris-alt.png'],
      biographyText: 'Haupttext',
      abilities: [{ title: 'Führung', detail: 'Besonnen', icon: '✦' }],
      works: ['Castellbryn'],
      trivia: ['Schildkröte'],
      connections: [{ name: 'Deliah', detail: 'Gemahlin', imageFormat: 'portrait' }],
      documents: [{ title: 'Wappen', text: 'Hauszeichen', link: './wappen.html' }]
    }
  });
  const html = renderPersonBiography({ person, biographyModule });

  assert.match(html, /class="biography-page"/);
  assert.match(html, /class="biography-portrait(?:\s|")/);
  assert.deepEqual(biographyModule.biography.portraitStages, [
    'https://i.imgur.com/idris-jung.png',
    '',
    'https://i.imgur.com/idris-alt.png',
    ''
  ]);
  assert.match(html, />\[1\]<\/button>/);
  assert.match(html, />\[2\]<\/button>/);
  assert.match(html, />\[4\]<\/button>/);
  assert.doesNotMatch(html, />\[3\]<\/button>/);
  assert.match(html, /Haus Arwydd/);
  assert.match(html, /Führung/);
  assert.match(html, /biography-connections/);
  assert.match(html, /href="\.\/wappen\.html"/);
  assert.equal(isPortraitCardEvent({ target: { closest: selector => selector === '.aleria-person-card__portrait' } }), true);
  assert.equal(isPortraitCardEvent({ target: { closest: () => null } }), false);
});

test('liefert alle lokalen Toolbar-Motive und vereinheitlichte Linienkonturen aus', async () => {
  const toolbarAssets = [
    'history-arrow.png',
    'fit-chart.png',
    'overview.png',
    'orientation.png',
    'lineage.png',
    'line-colors.png'
  ];
  const files = await Promise.all(toolbarAssets.map(name => (
    readFile(new URL(`../assets/images/toolbar/${name}`, import.meta.url))
  )));
  assert.ok(files.every(file => file.length > 0));

  const css = await readFile(new URL('../assets/css/family-chart-theme.css', import.meta.url), 'utf8');
  assert.match(css, /stroke-linecap: round;/);
  assert.match(css, /stroke-linejoin: round;/);
  assert.match(css, /\.link\.f3-path-to-main\s*\{\s*stroke-width: 3\.25px !important;/);
});

test('migriert das alte persons/couples-Format ohne Render-Abhängigkeit', () => {
  const legacy = {
    house: 'Haus Test',
    motto: 'Treue.',
    persons: [
      { id: 'P001', name: 'A', gender: 'm', birth: 1000, lineType: 'core' },
      { id: 'P002', name: 'B', gender: 'f', birth: 1001, lineType: 'married' },
      { id: 'P003', name: 'C', gender: 'n', birth: 1020, lineType: 'bastard' }
    ],
    couples: [
      { id: 'C001', parentA: 'P001', parentB: 'P002', relationshipType: 'affair', children: ['P003'] }
    ]
  };
  const family = migrateLegacyFamily(legacy);
  assert.equal(family.document.title, 'Haus Test');
  assert.equal(family.partnerships[0].type, 'affair');
  assert.equal(family.parentages[0].legitimacy, 'illegitimate');
  assert.equal(family.persons[2].familyRole, 'bastard');
  assert.equal(family.persons[2].sex, 'unknown');
});

test('exportiert und importiert das aktuelle Schema verlustfrei', () => {
  const serialized = serializeFamily(SAMPLE_FAMILY);
  const parsed = parseFamilyJson(serialized);
  assert.deepEqual(parsed, assertValidFamily(SAMPLE_FAMILY).family);
});

test('weist zyklische Abstammung zurück', () => {
  const invalid = normalizeFamily(SAMPLE_FAMILY);
  invalid.parentages.push({
    id: 'cycle', childId: 'aeron-vael', parentIds: ['nyra-vael'], partnershipId: '',
    type: 'biological', legitimacy: 'unknown', certainty: 'confirmed', visibility: 'public', notes: '', extensions: {}
  });
  assert.throws(() => assertValidFamily(invalid), FamilyValidationError);
});

test('weist doppelte feste Personen-IDs zurück', () => {
  const invalid = normalizeFamily(SAMPLE_FAMILY);
  invalid.persons[1].worldPersonId = invalid.persons[0].worldPersonId;
  const result = validateFamily(invalid);
  assert.ok(result.diagnostics.some(item => item.code === 'DUPLICATE_WORLD_PERSON_ID'));
  assert.throws(() => assertValidFamily(invalid), FamilyValidationError);
});

test('weist reale Eltern an direkt unter einem Ursprungshaus geführten Personen zurück', () => {
  const invalid = normalizeFamily(SAMPLE_FAMILY);
  invalid.lineage.originHouse = {
    ...invalid.lineage.originHouse,
    enabled: true,
    houseId: 'house-vael',
    childIds: ['nyra-vael']
  };
  const result = validateFamily(invalid);
  assert.ok(result.diagnostics.some(item => item.code === 'ORIGIN_HOUSE_CHILD_HAS_PARENTS'));
  assert.throws(() => assertValidFamily(invalid), FamilyValidationError);
});

test('kapselt Mutationen und unterstützt Undo/Redo', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const personId = store.addPerson({
    name: 'Testperson', title: '', sex: 'unknown', status: 'alive', birth: '', death: '', portrait: '',
    portraitPlaceholder: 'auto', houseId: '', familyRole: 'core', notes: ''
  });
  assert.ok(store.getState().family.persons.some(person => person.id === personId));
  assert.equal(
    store.getState().family.persons.find(person => person.id === personId)?.worldPersonId,
    `person--${store.getState().family.document.id}--${personId}`
  );
  assert.equal(store.undo(), true);
  assert.ok(!store.getState().family.persons.some(person => person.id === personId));
  assert.equal(store.redo(), true);
  assert.ok(store.getState().family.persons.some(person => person.id === personId));
});

test('verwaltet Darstellungsoptionen und Kadettenhäuser im Store', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  store.setRelationshipColors({ affair: '#123456' });
  store.setLineage({ timeGap: { enabled: true, years: 800, label: 'Acht Jahrhunderte später' } });
  store.setLineageOrigin({
    enabled: true,
    id: 'vael-origin',
    houseId: 'house-vael',
    name: 'Älteres Haus Vael',
    childIds: ['aeron-vael'],
    emblemScale: 0.91,
    frameScale: 1.04
  });
  const branchId = store.addCadetBranch({
    name: 'Haus Testzweig',
    parentPartnershipId: 'marriage-cassian-seraphine',
    targetFamilyId: 'haus-testzweig',
    crestFrame: 'bronze',
    emblemScale: 0.72,
    frameScale: 1.08
  });
  assert.equal(store.getState().family.presentation.relationshipColors.affair, '#123456');
  assert.equal(store.getState().family.lineage.timeGap.years, 800);
  assert.equal(store.getState().family.lineage.originHouse.name, 'Älteres Haus Vael');
  assert.deepEqual(store.getState().family.lineage.originHouse.childIds, ['aeron-vael']);
  assert.equal(store.getState().family.cadetBranches.find(branch => branch.id === branchId).crestFrame, 'bronze');
  assert.equal(store.getState().family.cadetBranches.find(branch => branch.id === branchId).emblemScale, 0.72);
  assert.equal(store.getState().family.cadetBranches.find(branch => branch.id === branchId).frameScale, 1.08);
  store.updateCadetBranch(branchId, {
    name: 'Haus Neuer Zweig',
    subtitle: 'Wegverheiratete Linie',
    linkType: 'married-away',
    parentPartnershipId: 'marriage-cassian-seraphine',
    houseId: '',
    emblem: 'https://i.imgur.com/wappen.png',
    crestFrame: 'silver',
    emblemScale: 0.79,
    frameScale: 1.04,
    founded: '',
    targetFamilyId: 'haus-neuer-zweig',
    notes: 'Direkt bearbeitet.'
  });
  const updatedBranch = store.getState().family.cadetBranches.find(branch => branch.id === branchId);
  assert.equal(updatedBranch.subtitle, 'Wegverheiratete Linie');
  assert.equal(updatedBranch.targetFamilyId, 'haus-neuer-zweig');
  assert.equal(updatedBranch.emblem, 'https://i.imgur.com/wappen.png');
  assert.equal(updatedBranch.emblemScale, 0.79);
  assert.equal(updatedBranch.frameScale, 1.04);
  store.deleteCadetBranch(branchId);
  assert.ok(!store.getState().family.cadetBranches.some(branch => branch.id === branchId));
});

test('legt eine neue Person und ihre Beziehung atomar an', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const personId = store.addRelatedPerson('cassian-vael', {
    name: 'Mira Fen', title: 'Gesandte', sex: 'female', status: 'alive', birth: '1712', death: '',
    portrait: '', portraitPlaceholder: 'auto', houseId: '', familyRole: 'affair', notes: ''
  }, {
    relationKind: 'partnership', partnershipType: 'affair', partnershipStatus: 'secret',
    certainty: 'confirmed', visibility: 'restricted'
  });
  const state = store.getState();
  assert.ok(state.family.persons.some(person => person.id === personId));
  assert.ok(state.family.partnerships.some(partnership => (
    partnership.type === 'affair'
    && partnership.participantIds.includes('cassian-vael')
    && partnership.participantIds.includes(personId)
  )));
  assert.equal(state.selectedPersonId, personId);
});

test('ordnet neue Nachkommen hinter einem frei gesetzten Zeitsprungknoten ein', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const timeJumpId = store.addTimeJump({
    parentPartnershipId: 'marriage-cassian-seraphine',
    childIds: [],
    years: 300,
    label: 'Drei Jahrhunderte später'
  });
  const childId = store.addRelatedPerson('cassian-vael', {
    name: 'Später Erbe', title: '', sex: 'male', status: 'alive', birth: '1740', death: '',
    portrait: '', portraitPlaceholder: 'auto', houseId: 'house-vael', familyRole: 'core', notes: ''
  }, {
    relationKind: 'time-jump-child', timeJumpId, parentageType: 'claimed', legitimacy: 'unknown',
    certainty: 'probable', visibility: 'public'
  });
  const family = store.getState().family;
  assert.ok(family.timeJumps.find(timeJump => timeJump.id === timeJumpId).childIds.includes(childId));
  assert.equal(family.parentages.find(parentage => parentage.childId === childId).extensions.timeJumpId, timeJumpId);

  store.updateTimeJump(timeJumpId, {
    parentPartnershipId: 'marriage-cassian-seraphine',
    childIds: [childId],
    years: 320,
    fromYear: '1420',
    toYear: '1740',
    label: 'Bearbeiteter Zeitsprung',
    notes: 'Direkt am Knoten geändert.'
  });
  const updatedTimeJump = store.getState().family.timeJumps.find(timeJump => timeJump.id === timeJumpId);
  assert.equal(updatedTimeJump.label, 'Bearbeiteter Zeitsprung');
  assert.equal(updatedTimeJump.years, 320);

  const converted = toFamilyChartData(store.getState().family);
  const timeJumpNode = converted.data.find(person => person.data.aleria.timeJumpId === timeJumpId);
  assert.deepEqual(converted.data.find(person => person.id === childId).rels.parents, [timeJumpNode.id]);
});

test('setzt einen Zeitsprung direkt nach einer einzelnen Person ohne Partnerschaft', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const timeJumpId = store.addTimeJump({
    parentPersonId: 'cassian-vael',
    childIds: [],
    fromYear: '1739',
    toYear: '1740',
    years: 1,
    label: 'Ein Jahr später'
  });
  const childId = store.addRelatedPerson('cassian-vael', {
    name: 'Einzeln überlieferter Erbe', title: '', sex: 'male', status: 'alive', birth: '1740', death: '',
    portrait: '', portraitPlaceholder: 'auto', houseId: 'house-vael', familyRole: 'core', notes: ''
  }, {
    relationKind: 'time-jump-child', timeJumpId, parentageType: 'claimed', legitimacy: 'unknown',
    certainty: 'probable', visibility: 'public'
  });
  const family = store.getState().family;
  const timeJump = family.timeJumps.find(item => item.id === timeJumpId);
  const parentage = family.parentages.find(item => item.childId === childId);
  assert.equal(timeJump.parentPartnershipId, '');
  assert.equal(timeJump.parentPersonId, 'cassian-vael');
  assert.deepEqual(parentage.parentIds, ['cassian-vael']);
  assert.equal(parentage.partnershipId, '');

  const converted = toFamilyChartData(family);
  const timeJumpNode = converted.data.find(entry => entry.data.aleria.timeJumpId === timeJumpId);
  assert.deepEqual(timeJumpNode.rels.parents, ['cassian-vael']);
  assert.deepEqual(converted.data.find(entry => entry.id === childId).rels.parents, [timeJumpNode.id]);
});

test('bearbeitet Bild und Untertitel des Stammwappenknotens gemeinsam', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  store.setLineage({
    ...store.getState().family.lineage,
    crestSubtitle: 'Neu beschriftetes Stammwappen',
    emblem: 'https://i.imgur.com/neues-wappen.png',
    crestEmblemScale: 0.74,
    crestFrameScale: 1.12
  });
  const family = store.getState().family;
  assert.equal(family.lineage.crestSubtitle, 'Neu beschriftetes Stammwappen');
  assert.equal(family.lineage.crestEmblemScale, 0.74);
  assert.equal(family.lineage.crestFrameScale, 1.12);
  assert.equal(
    family.houses.find(house => house.id === family.lineage.houseId).emblem,
    'https://i.imgur.com/neues-wappen.png'
  );
});

test('erstellt einen vollständig leeren neuen Arbeitsstand', () => {
  const family = createEmptyFamily();
  assert.equal(family.document.title, 'Neue Familie');
  assert.equal(family.persons.length, 0);
  assert.equal(family.timeJumps.length, 0);
});

test('erstellt eine unabhängige Familie mit Gründerpaar und Wappen', () => {
  const family = createFoundingFamily({
    documentTitle: 'Haus Morgenrot',
    documentId: 'haus-morgenrot',
    motto: 'Der erste Strahl.',
    crestSubtitle: 'Siegel der Morgenröte',
    founderManName: 'Ardan Morgenrot',
    founderManBirth: '1690',
    founderWomanName: 'Liora Grünhain',
    founderWomanBirth: '1693',
    marriageYear: '1714'
  });
  assert.equal(family.document.id, 'haus-morgenrot');
  assert.equal(family.houses.length, 1);
  assert.equal(family.persons.length, 2);
  assert.equal(family.partnerships[0].type, 'marriage');
  assert.equal(family.lineage.founderPartnershipId, family.partnerships[0].id);
  assert.equal(family.lineage.crestFrame, 'gold');

  const converted = toFamilyChartData(family);
  const crest = converted.data.find(person => person.data.nodeKind === 'house-crest');
  assert.ok(crest);
  assert.deepEqual(crest.rels.parents, family.partnerships[0].participantIds);
  assert.deepEqual(crest.rels.children, []);
  assert.equal(crest.data.title, 'Siegel der Morgenröte');
  assert.equal(crest.data.aleria.sourcePartnershipId, family.partnerships[0].id);
});

test('ordnet ein optionales erstes Kind direkt unter dem Gründerwappen ein', () => {
  const family = createFoundingFamily({
    documentTitle: 'Haus Morgenrot',
    founderManName: 'Ardan Morgenrot',
    founderWomanName: 'Liora Grünhain',
    firstChildName: 'Cael Morgenrot',
    firstChildSex: 'male',
    firstChildBirth: '1715'
  });
  const converted = toFamilyChartData(family);
  const crest = converted.data.find(person => person.data.nodeKind === 'house-crest');
  const child = family.persons.find(person => person.name === 'Cael Morgenrot');
  assert.deepEqual(converted.data.find(person => person.id === child.id).rels.parents, [crest.id]);
  assert.deepEqual(crest.rels.children, [child.id]);
});

test('gliedert einen später am Wappen angelegten Sprössling unter dem Wappenknoten ein', () => {
  const family = createFoundingFamily({
    documentTitle: 'Haus Morgenrot',
    founderManName: 'Ardan Morgenrot',
    founderWomanName: 'Liora Grünhain'
  });
  const [firstParentId, secondParentId] = family.partnerships[0].participantIds;
  const store = createFamilyStore(family);
  const childId = store.addRelatedPerson(firstParentId, {
    name: 'Neria Morgenrot', title: '', sex: 'female', status: 'alive', birth: '1720', death: '',
    portrait: '', portraitPlaceholder: 'auto', houseId: family.houses[0].id, familyRole: 'core', notes: ''
  }, {
    relationKind: 'child', secondParentId, parentageType: 'biological', legitimacy: 'legitimate',
    certainty: 'confirmed', visibility: 'public'
  });
  const converted = toFamilyChartData(store.getState().family);
  const crest = converted.data.find(person => person.data.nodeKind === 'house-crest');
  assert.deepEqual(converted.data.find(person => person.id === childId).rels.parents, [crest.id]);
});

test('bereinigt Gründer- und Kadettenverweise beim Löschen von Personen', () => {
  const founderStore = createFamilyStore(SAMPLE_FAMILY);
  founderStore.deletePerson('aeron-vael');
  assert.equal(founderStore.getState().family.lineage.founderPartnershipId, '');

  const cadetStore = createFamilyStore(SAMPLE_FAMILY);
  cadetStore.deletePerson('cassian-vael');
  assert.equal(cadetStore.getState().family.cadetBranches.length, 0);
  assert.equal(
    cadetStore.getState().family.parentages.find(parentage => parentage.id === 'parentage-nyra').partnershipId,
    ''
  );
});

test('speichert Familien unter verschachtelten Registerpfaden', () => {
  const storage = createMemoryStorage();
  const folderPath = parseFolderPath('Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor');
  const saved = saveFamilyToLibrary({
    family: SAMPLE_FAMILY,
    id: 'Haus Test',
    title: 'Haus Test',
    folderPath,
    rankId: 'knight-prince'
  }, storage);
  const loaded = loadFamilyById('haus-test', storage);
  assert.equal(saved.id, 'haus-test');
  assert.deepEqual(loaded.folderPath, folderPath);
  assert.deepEqual(loaded.family.extensions.registry.folderPath, folderPath);
  assert.deepEqual(loaded.family.document.houseProfile, {
    rankId: 'knight-prince',
    seat: 'Gwynthor',
    barony: 'Llamreis Ankunft',
    county: 'Celtigerns Wacht',
    kingdom: 'Cenyr',
    secondarySeats: [],
    liegeHouseId: '',
    liegeHouseName: '',
    regionEmblems: { seat: '', barony: '', county: '', kingdom: '' }
  });
  assert.equal(loaded.family.document.title, 'Haus Test');
});

test('zerlegt Cloud-Änderungen nach Entität und setzt sie verlustfrei zusammen', () => {
  const before = normalizeFamily(SAMPLE_FAMILY);
  const after = normalizeFamily({
    ...before,
    document: { ...before.document, motto: 'Neue Devise' },
    persons: before.persons.map(person => person.id === before.persons[0].id
      ? { ...person, title: 'Neuer Titel' }
      : person),
    timeJumps: []
  });
  const changes = createFamilyChangeSet(before, after);
  assert.equal(changes.rootChanged, true);
  assert.deepEqual(changes.collections.persons.upsert.map(person => person.id), [before.persons[0].id]);
  assert.deepEqual(changes.collections.timeJumps.remove, before.timeJumps.map(item => item.id));
  const restored = familyFromRepositoryRecords(familyRootRecord(after), Object.fromEntries([
    'persons', 'partnerships', 'parentages', 'houses', 'cadetBranches', 'timeJumps'
  ].map(name => [name, after[name]])));
  assert.deepEqual(restored, after);
});

test('weist unsichere Firebase-Record-IDs vor dem Speichern zurück', () => {
  assert.equal(isValidFirestoreRecordId('person-1.a'), true);
  assert.equal(isValidFirestoreRecordId('person/1'), false);
  assert.throws(() => createFamilyChangeSet(null, {
    ...SAMPLE_FAMILY,
    persons: SAMPLE_FAMILY.persons.map((person, index) => index === 0 ? { ...person, id: 'person/unsafe' } : person)
  }));
});

test('öffnet Haus Arwydd als eigenständige Registerfamilie', () => {
  const loaded = loadFamilyById('haus-arwydd', createMemoryStorage());
  assert.equal(loaded.title, 'Haus Arwydd');
  assert.deepEqual(loaded.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn']);
  assert.equal(loaded.family.lineage.houseId, 'house-arwydd');
});

test('bildet Haus Draig vom Ursprungshaus Dreigiau bis zur jüngsten Generation vollständig ab', () => {
  const family = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const arwydd = normalizeFamily(HOUSE_ARWYDD_FAMILY);
  const gafyr = normalizeFamily(HOUSE_GAFYR_FAMILY);
  const saethwyr = normalizeFamily(HOUSE_SAETHWYR_FAMILY);
  const wyrm = normalizeFamily(HOUSE_WYRM_FAMILY);

  assert.equal(family.persons.length, 177);
  assert.equal(family.partnerships.length, 82);
  assert.equal(family.parentages.length, 93);
  assert.equal(family.cadetBranches.length, 33);
  assert.equal(family.timeJumps.length, 6);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-celtigern-findabhair');
  assert.equal(family.lineage.originHouse.enabled, true);
  assert.equal(family.lineage.originHouse.houseId, 'house-dreigiau');
  assert.deepEqual(family.lineage.originHouse.childIds, [
    'gwyrthern-dreigiau',
    'rhonwen-dreigiau',
    'kerrylin-dreigiau'
  ]);
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 17);
  assert.equal(family.persons.filter(person => person.lineageRole === 'mainline').length, 5);

  assert.deepEqual(graph.getParents('celtigern-draig').map(person => person.id).sort(), [
    'gwendolyn-mwnci',
    'gwyrthern-dreigiau'
  ]);
  assert.deepEqual(graph.getChildren('gwyrthern-dreigiau').map(person => person.id), [
    'celtigern-draig',
    'gwenhwyfar-dreigiau',
    'morgaine-dreigiau',
    'vortigern-pendrag',
    'vortimer-dreigiau'
  ]);
  assert.deepEqual(graph.getChildren('celtigern-draig').map(person => person.id), [
    'artus-draig',
    'elinowyn-draig',
    'grugyn-draig',
    'gwendolyn-ancient-draig',
    'llamrei-draig',
    'rhianu-draig'
  ]);
  assert.deepEqual(graph.getChildren('merfyn-draig').map(person => person.id), [
    'arianwen-draig',
    'cahir-draig',
    'elenydd-draig',
    'gethin-draig',
    'maygan-draig'
  ]);
  assert.deepEqual(graph.getChildren('rhiwallon-draig').map(person => person.id), [
    'mairwen-draig',
    'trahern-draig'
  ]);
  assert.deepEqual(graph.getChildren('cahir-draig').map(person => person.id), [
    'ceridwen-draig',
    'generis-draig',
    'meurig-draig',
    'rhodri-draig',
    'trayvon-draig'
  ]);
  assert.deepEqual(graph.getChildren('gethin-draig').map(person => person.id), [
    'fflur-draig',
    'odyar-draig',
    'seithved-draig'
  ]);
  assert.deepEqual(graph.getChildren('rhodri-draig').map(person => person.id), [
    'galahad-draig',
    'owain-draig',
    'rhonwen-draig'
  ]);
  assert.deepEqual(graph.getChildren('meurig-draig').map(person => person.id), [
    'alicyn-draig',
    'rhys-draig'
  ]);
  assert.deepEqual(graph.getChildren('odyar-draig').map(person => person.id), [
    'steffan-draig',
    'tecwyn-draig'
  ]);
  assert.deepEqual(graph.getChildren('maredudd-draig').map(person => person.id), [
    'cadfan-draig',
    'dwynwen-draig'
  ]);
  assert.deepEqual(graph.getChildren('galahad-draig').map(person => person.id), [
    'anaraut-draig',
    'gawain-draig',
    'guinevere-neidr',
    'idwal-draig',
    'isobel-1719-draig',
    'neithon-1718-draig',
    'rhiannon-draig',
    'tudwal-draig'
  ]);
  assert.equal(family.parentages.find(parentage => parentage.childId === 'guinevere-neidr').type, 'foster');
  assert.equal(family.partnerships.find(partnership => partnership.id === 'engagement-gawain-guinevere').type, 'engagement');
  assert.equal(converted.extraCoupleLines.length, 1);
  assert.deepEqual(
    [converted.extraCoupleLines[0].firstId, converted.extraCoupleLines[0].secondId].sort(),
    ['gawain-draig', 'guinevere-neidr'],
    'Mündel und Verlobter im selben Geschwisterblock brauchen eine Zusatzlinie statt einer Layout-Ehe.'
  );
  assert.equal(converted.extraCoupleLines[0].type, 'engagement');
  assert.ok(
    converted.data.every(entry => !entry.rels.spouses.includes('guinevere-neidr')),
    'Guinevere darf im Layout nicht als Ehepartnerin dupliziert werden.'
  );
  assert.ok(converted.getPartnershipLine('gawain-draig', 'guinevere-neidr'));
  assert.equal(family.partnerships.find(partnership => partnership.id === 'forced-rhonwen-nodawl').type, 'forced');
  assert.deepEqual(graph.getChildren('owain-draig').map(person => person.id), [
    'amadia-draig',
    'iolo-draig',
    'rhygifarch-draig',
    'rollo-draig',
    'siana-draig'
  ]);
  assert.ok(graph.getChildren('owain-draig').every(person => person.familyRole === 'bastard'));
  assert.equal(
    family.parentages.find(parentage => parentage.childId === 'mairwen-draig').legitimacy,
    'legitimate'
  );
  const gwyvernBranch = family.cadetBranches.find(branch => branch.id === 'cadet-gwyvern-bleddyn');
  assert.equal(gwyvernBranch.parentPartnershipId, 'marriage-bleddyn-owena');
  assert.equal(gwyvernBranch.targetFamilyId, 'haus-gwyvern');
  assert.equal(gwyvernBranch.linkType, 'cadet-house');

  [
    [family, 'tecwyn-draig', arwydd, 'tecwyn-draig'],
    [family, 'alicyn-draig', gafyr, 'alicyn-draig'],
    [family, 'bleddyn-draig', saethwyr, 'bleddyn-draig'],
    [family, 'mailgwin-wyrm', wyrm, 'mailgwin-wyrm']
  ].forEach(([firstFamily, firstId, secondFamily, secondId]) => {
    const first = firstFamily.persons.find(person => person.id === firstId);
    const second = secondFamily.persons.find(person => person.id === secondId);
    assert.equal(first.worldPersonId, second.worldPersonId, `${firstId} muss dieselbe Weltperson bleiben.`);
    assert.equal(first.portrait, second.portrait, `${firstId} muss dasselbe lokale Portrait verwenden.`);
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-jump').length, 6);
  const originNode = converted.data.find(entry => entry.data.nodeKind === 'house-origin');
  assert.equal(originNode.data.name, 'Haus Dreigiau');
  assert.deepEqual(originNode.rels.children, family.lineage.originHouse.childIds);
  assert.match(originNode.data.portrait, /neutral-crest\.png$/);
  assert.equal(converted.getParentageLine('gwyrthern-dreigiau').dashed, false);
  const gwyvernNode = converted.data.find(entry => entry.data.aleria.cadetBranchId === 'cadet-gwyvern-bleddyn');
  assert.deepEqual(gwyvernNode.rels.parents, ['bleddyn-draig', 'owena-saethwyr']);
  assert.equal(gwyvernNode.data.aleria.targetFamilyId, 'haus-gwyvern');
  const mairwenCard = converted.data.find(entry => entry.id === 'mairwen-draig');
  assert.equal(mairwenCard.data.frameVariant, 'standard', 'Mairwen ist Kernmitglied und trägt den normalen Rahmen.');
  assert.match(mairwenCard.data.frameAsset, /person-core\.png$/);
  assert.equal(
    family.parentages.find(parentage => parentage.childId === 'mair-draig').legitimacy,
    'legitimized'
  );
  const mairCard = converted.data.find(entry => entry.id === 'mair-draig');
  assert.equal(mairCard.data.frameVariant, 'legitimized');
  assert.match(mairCard.data.frameAsset, /person-legitimiert\.png$/);
  const bastardCards = converted.data.filter(entry => entry.data.role === 'bastard');
  assert.ok(bastardCards.length >= 6);
  assert.ok(
    bastardCards.every(entry => /neutral-crest\.png$/.test(entry.data.crest)),
    'Bastarde dürfen kein Hauswappen tragen, sondern nur das neutrale Siegel.'
  );
  const chartDepths = resolveFamilyChartViewDepths(converted.data, 'celtigern-draig', family.view);
  assert.equal(chartDepths.ancestorDepth, undefined);
  assert.equal(chartDepths.descendantDepth, undefined, 'Standardmäßig darf keine Generation abgeschnitten werden.');
  const limitedView = { ...family.view, limitGenerations: true };
  const limitedDepths = resolveFamilyChartViewDepths(converted.data, 'celtigern-draig', limitedView);
  assert.equal(limitedDepths.descendantDepth, 24, 'Explizite Limits müssen virtuelle Wappen und Zeitsprünge einrechnen.');
  const youngestDepths = resolveFamilyChartViewDepths(converted.data, 'gawain-draig', family.view);
  assert.equal(youngestDepths.ancestorDepth, undefined);
  const limitedYoungestDepths = resolveFamilyChartViewDepths(converted.data, 'gawain-draig', limitedView);
  assert.equal(limitedYoungestDepths.ancestorDepth, 26, 'Beim begrenzten Fokus müssen Ursprungshaus und alle frühen Draigs erreichbar bleiben.');
  assert.equal(converted.data.some(entry => entry.id === 'gwyrthern-dreigiau'), true);
  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['celtigern-draig']);
  const pendingIds = ['celtigern-draig'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Draig-Partner oder Knoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert alle in Draig-Tabelle und Bildabschnitten belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-draig/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_DRAIG_PORTRAITS).length, 128);
  assert.equal(Object.keys(sourceManifest).length, 110);
  assert.equal(picturedPeople.length, 128);
  assert.equal(placeholderPeople.length, 49);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_DRAIG_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet Haus Wyrm mit beiden Überlieferungslücken und allen belegten Zweigen ab', () => {
  const family = assertValidFamily(HOUSE_WYRM_FAMILY).family;
  const graph = createFamilyGraph(family);
  const arwydd = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 62);
  assert.equal(family.partnerships.length, 26);
  assert.equal(family.parentages.length, 35);
  assert.equal(family.cadetBranches.length, 12);
  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away'));
  assert.equal(
    family.cadetBranches.find(branch => branch.id === 'married-away-saethwyr').targetFamilyId,
    'haus-saethwyr'
  );
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '1177');
  assert.equal(family.lineage.timeGap.toYear, '1249');
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].fromYear, '1311');
  assert.equal(family.timeJumps[0].toYear, '1598');

  assert.deepEqual(
    graph.getParents('gavin-wyrm').map(person => person.id).sort(),
    ['neala-wylan', 'shan-wyrm']
  );
  assert.deepEqual(
    graph.getParents('gais-wyrm').map(person => person.id).sort(),
    ['padrig-wyrm', 'sorcha-cein']
  );
  assert.deepEqual(graph.getChildren('eiddon-wyrm').map(person => person.id).sort(), [
    'bronwyn-wyrm',
    'meriel-wyrm',
    'padrig-wyrm'
  ]);
  assert.equal(graph.getPerson('jeannae-wyrm').death, '1704');
  assert.equal(graph.getPerson('fotor-wyrm').birth, '1729?');
  assert.equal(graph.getPerson('tryffin-draig').familyRole, 'core');
  assert.equal(graph.getPerson('rhianwyn-saethwyr').familyRole, 'married');

  assert.equal(
    graph.getPerson('eiddon-wyrm').worldPersonId,
    arwydd.persons.find(person => person.id === 'eiddon-wym').worldPersonId
  );
  assert.equal(
    graph.getPerson('eiddon-wyrm').portrait,
    arwydd.persons.find(person => person.id === 'eiddon-wym').portrait
  );
  assert.equal(
    graph.getPerson('iseult-arwydd').worldPersonId,
    arwydd.persons.find(person => person.id === 'iseult-arwydd').worldPersonId
  );
  assert.equal(
    graph.getPerson('iseult-arwydd').portrait,
    arwydd.persons.find(person => person.id === 'iseult-arwydd').portrait
  );
  assert.ok(converted.data.some(entry => entry.data.nodeKind === 'time-gap'));
  assert.ok(converted.data.some(entry => entry.data.nodeKind === 'time-jump'));
});

test('liefert für Haus Wyrm alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_WYRM_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-wyrm/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_WYRM_PORTRAITS).length, 50);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_WYRM_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 50);
  assert.equal(placeholderPeople.length, 12);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_WYRM_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet Haus Gafyr mit Überlieferungslücke, Mündel und allen belegten Zweigen ab', () => {
  const family = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const wyrm = assertValidFamily(HOUSE_WYRM_FAMILY).family;
  const arwydd = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 57);
  assert.equal(family.partnerships.length, 23);
  assert.equal(family.parentages.length, 33);
  assert.equal(family.cadetBranches.length, 8);
  assert.equal(family.timeJumps.length, 2);
  const earlyGap = family.timeJumps.find(timeJump => timeJump.id === 'gap-rheidwyn-maldwyn');
  const longGap = family.timeJumps.find(timeJump => timeJump.id === 'gap-maldwyn-mathonwy');
  assert.deepEqual(earlyGap.childIds, ['maldwyn-gafyr', 'mairwyn-gafyr']);
  assert.equal(earlyGap.parentPartnershipId, 'marriage-rheidwyn-heulwen');
  assert.equal(longGap.fromYear, '1312');
  assert.equal(longGap.toYear, '1593');
  assert.equal(longGap.parentPartnershipId, 'marriage-maldwyn-eurolwyn');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-kynwrig-elinowyn');

  assert.deepEqual(
    graph.getParents('mathonwy-gafyr').map(person => person.id).sort(),
    ['eurolwyn-draig', 'maldwyn-gafyr']
  );
  assert.equal(
    family.cadetBranches.find(branch => branch.parentPartnershipId === 'marriage-mairwyn-limwris')?.targetFamilyId,
    'haus-saethwyr'
  );
  assert.equal(
    family.cadetBranches.some(branch => branch.parentPartnershipId === 'marriage-maldwyn-eurolwyn'),
    false
  );
  assert.deepEqual(
    graph.getChildren('egon-gafyr').map(person => person.id).sort(),
    ['alwyn-gafyr', 'gwenna-crafanc', 'rhys-gafyr', 'skywyn-gafyr']
  );
  assert.deepEqual(
    graph.getParents('gildas-gafyr').map(person => person.id).sort(),
    ['izolda-arwydd', 'kelyddon-gafyr']
  );
  assert.equal(graph.getPerson('gwenna-crafanc').familyRole, 'ward');
  assert.equal(
    family.parentages.find(parentage => parentage.childId === 'gwenna-crafanc').type,
    'foster'
  );

  assert.equal(
    graph.getPerson('mathonwy-gafyr').worldPersonId,
    wyrm.persons.find(person => person.id === 'mathonwy-gafyr').worldPersonId
  );
  assert.equal(
    graph.getPerson('lynesse-wyrm-1598').death,
    wyrm.persons.find(person => person.id === 'lynesse-wyrm-1598').death
  );
  assert.equal(
    graph.getPerson('kelyddon-gafyr').worldPersonId,
    arwydd.persons.find(person => person.id === 'kelyddon-gafyr').worldPersonId
  );
  assert.equal(
    graph.getPerson('izolda-arwydd').worldPersonId,
    arwydd.persons.find(person => person.id === 'izolda-arwydd').worldPersonId
  );
  assert.equal(
    graph.getPerson('mathonwy-gafyr').portrait,
    wyrm.persons.find(person => person.id === 'mathonwy-gafyr').portrait
  );
  assert.equal(
    graph.getPerson('kelyddon-gafyr').portrait,
    arwydd.persons.find(person => person.id === 'kelyddon-gafyr').portrait
  );

  assert.ok(converted.data.some(entry => entry.data.nodeKind === 'house-crest'));
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-jump').length, 2);
  assert.equal(converted.getParentageLine('gwenna-crafanc').color, '#2f75a8');
  assert.equal(converted.getParentageLine('gwenna-crafanc').dashed, true);

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['garym-gafyr']);
  const pendingIds = ['garym-gafyr'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Partner oder Knoten darf als getrennte Insel verborgen bleiben.');
});

test('verwendet für namens- und jahresgleiche Personen hausübergreifend dieselbe Weltpersonen-ID', () => {
  const identitiesByNameAndBirth = new Map();
  [HOUSE_ARWYDD_FAMILY, HOUSE_DRAIG_FAMILY, HOUSE_WYRM_FAMILY, HOUSE_GAFYR_FAMILY, HOUSE_SAETHWYR_FAMILY].map(normalizeFamily).forEach(family => {
    family.persons.forEach(person => {
      if (!/^\d{4}$/.test(person.birth || '')) return;
      const displayName = buildFamilyPersonDisplayName(family, person);
      const identityKey = `${normalizePersonName(displayName)}|${person.birth}`;
      const existing = identitiesByNameAndBirth.get(identityKey);
      if (existing) {
        assert.equal(
          person.worldPersonId,
          existing.worldPersonId,
          `${displayName} (${person.birth}) besitzt widersprüchliche Weltpersonen-IDs.`
        );
      } else {
        identitiesByNameAndBirth.set(identityKey, person);
      }
    });
  });
});

test('liefert für Haus Gafyr echte Portraits lokal und Platzhalter nur für unbelegte Bilder aus', async () => {
  const family = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gafyr/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_GAFYR_PORTRAITS).length, 44);
  assert.equal(Object.keys(sourceManifest).length, 41);
  assert.equal(picturedPeople.length, 44);
  assert.equal(placeholderPeople.length, 13);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.keys(sourceManifest).map(async personId => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitquelle ohne Gafyr-Person: ${personId}`);
    assert.equal(person.portrait, HOUSE_GAFYR_PORTRAITS[personId]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet Haus Saethwyr mit beiden Überlieferungssprüngen und allen belegten Zweigen ab', () => {
  const family = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const wyrm = normalizeFamily(HOUSE_WYRM_FAMILY);
  const gafyr = normalizeFamily(HOUSE_GAFYR_FAMILY);
  const arwydd = normalizeFamily(HOUSE_ARWYDD_FAMILY);

  assert.equal(family.persons.length, 59);
  assert.equal(family.partnerships.length, 26);
  assert.equal(family.parentages.length, 32);
  assert.equal(family.cadetBranches.length, 12);
  assert.equal(family.timeJumps.length, 2);
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-kynwrig-sianwyn');
  assert.deepEqual(graph.getChildren('kynwrig-draig').map(person => person.id), ['odyar-saethwyr', 'rhianwyn-saethwyr']);
  assert.deepEqual(graph.getChildren('odyar-saethwyr').map(person => person.id), ['limwris-saethwyr', 'myfanwy-saethwyr']);
  assert.deepEqual(graph.getChildren('limwris-saethwyr').map(person => person.id), ['llawvrodedd-saethwyr', 'owena-saethwyr']);
  assert.deepEqual(
    graph.getChildren('gruffyd-saethwyr').map(person => person.id),
    ['dolena-saethwyr', 'gallgoid-saethwyr', 'gwenllian-saethwyr', 'padrig-saethwyr']
  );
  assert.deepEqual(graph.getParents('cadoc-saethwyr').map(person => person.id), ['caradog-saethwyr', 'jenniffer-marwolaeth']);
  assert.equal(
    family.cadetBranches.find(branch => branch.parentPartnershipId === 'marriage-rhianwyn-tryffin')?.targetFamilyId,
    'haus-wyrm'
  );
  assert.equal(
    family.cadetBranches.find(branch => branch.parentPartnershipId === 'marriage-elaine-derwen')?.targetFamilyId,
    'haus-wyrm'
  );

  [
    [family, 'kynwrig-draig', gafyr, 'kynwrig-draig'],
    [family, 'sianwyn-gafyr', gafyr, 'sianwyn-gafyr'],
    [family, 'limwris-saethwyr', gafyr, 'limwris-saethwyr'],
    [family, 'mairwyn-gafyr', gafyr, 'mairwyn-gafyr'],
    [family, 'tryffin-draig', wyrm, 'tryffin-draig'],
    [family, 'rhianwyn-saethwyr', wyrm, 'rhianwyn-saethwyr'],
    [family, 'gwastad-wyrm', wyrm, 'gwastad-wyrm'],
    [family, 'elaine-saethwyr', wyrm, 'elaine-saethwyr'],
    [family, 'derwen-wyrm', wyrm, 'derwen-wyrm'],
    [family, 'marmaduke-saethwyr', wyrm, 'marmaduke-saethwyr'],
    [family, 'bronwyn-wyrm', wyrm, 'bronwyn-wyrm'],
    [family, 'breandan-saethwyr', arwydd, 'breandan-saethwyr'],
    [family, 'imogen-arwydd', arwydd, 'imogen-arwydd']
  ].forEach(([firstFamily, firstId, secondFamily, secondId]) => {
    assert.equal(
      firstFamily.persons.find(person => person.id === firstId).worldPersonId,
      secondFamily.persons.find(person => person.id === secondId).worldPersonId,
      `${firstId} muss hausübergreifend dieselbe Weltperson bleiben.`
    );
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-jump').length, 2);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['kynwrig-draig']);
  const pendingIds = ['kynwrig-draig'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Saethwyr-Partner oder Knoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Saethwyr belegte Portraits lokal und wiederverwendet gemeinsame Personenbilder', async () => {
  const family = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-saethwyr/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_SAETHWYR_PORTRAITS).length, 49);
  assert.equal(Object.keys(sourceManifest).length, 38);
  assert.equal(picturedPeople.length, 49);
  assert.equal(placeholderPeople.length, 10);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_SAETHWYR_PORTRAITS['breandan-saethwyr'], HOUSE_ARWYDD_PORTRAITS['breandan-saethwyr']);
  assert.equal(HOUSE_SAETHWYR_PORTRAITS['marmaduke-saethwyr'], HOUSE_WYRM_PORTRAITS['marmaduke-saethwyr']);

  await Promise.all(Object.entries(HOUSE_SAETHWYR_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Saethwyr-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    const isPng = portrait.toLocaleLowerCase('de').endsWith('.png');
    assert.deepEqual(
      [...image.subarray(0, isPng ? 4 : 3)],
      isPng ? [0x89, 0x50, 0x4e, 0x47] : [0xff, 0xd8, 0xff]
    );
  }));
});

test('ersetzt nur unberührte lokale Leerakten durch ausgearbeitete Registerfassungen', () => {
  const storage = createMemoryStorage();
  const blankWyrm = {
    ...HOUSE_WYRM_FAMILY,
    persons: [],
    partnerships: [],
    parentages: [],
    cadetBranches: [],
    timeJumps: [],
    lineage: {
      ...HOUSE_WYRM_FAMILY.lineage,
      founderPartnershipId: '',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    extensions: { blankFamily: true }
  };
  saveFamilyToLibrary({
    family: blankWyrm,
    id: 'haus-wyrm',
    title: 'Haus Wyrm',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, storage);
  assert.equal(loadFamilyById('haus-wyrm', storage).family.persons.length, 62);

  const editedStorage = createMemoryStorage();
  saveFamilyToLibrary({
    family: { ...blankWyrm, persons: [HOUSE_WYRM_FAMILY.persons[0]] },
    id: 'haus-wyrm',
    title: 'Haus Wyrm',
    folderPath: ['Eigene Fassung']
  }, editedStorage);
  assert.equal(loadFamilyById('haus-wyrm', editedStorage).family.persons.length, 1);

  const blankSaethwyr = {
    ...HOUSE_SAETHWYR_FAMILY,
    persons: [],
    partnerships: [],
    parentages: [],
    cadetBranches: [],
    timeJumps: [],
    lineage: {
      ...HOUSE_SAETHWYR_FAMILY.lineage,
      founderPartnershipId: '',
      timeGap: { enabled: false, years: 0, fromYear: '', toYear: '', label: '' }
    },
    extensions: { blankFamily: true }
  };
  saveFamilyToLibrary({
    family: blankSaethwyr,
    id: 'haus-saethwyr',
    title: 'Haus Saethwyr',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, storage);
  assert.equal(loadFamilyById('haus-saethwyr', storage).family.persons.length, 59);
});

test('ergänzt eine ältere lokale Draig-Fassung bis zur jüngsten Generation', () => {
  const storage = createMemoryStorage();
  const staleFamily = {
    ...HOUSE_DRAIG_FAMILY,
    persons: HOUSE_DRAIG_FAMILY.persons
      .filter(person => person.id !== 'gawain-draig')
      .map(person => person.id === 'merfyn-draig' ? { ...person, title: 'Lokal ergänzter Titel' } : person),
    partnerships: HOUSE_DRAIG_FAMILY.partnerships
      .filter(partnership => !partnership.participantIds.includes('gawain-draig')),
    parentages: HOUSE_DRAIG_FAMILY.parentages
      .filter(parentage => parentage.childId !== 'gawain-draig')
      .map(parentage => {
        if (parentage.childId === 'mairwen-draig') return { ...parentage, legitimacy: 'legitimized', extensions: {} };
        if (parentage.childId === 'mair-draig') return { ...parentage, legitimacy: 'unknown', extensions: {} };
        return parentage;
      }),
    lineage: {
      ...HOUSE_DRAIG_FAMILY.lineage,
      originHouse: { ...HOUSE_DRAIG_FAMILY.lineage.originHouse, enabled: false }
    },
    view: {
      ...HOUSE_DRAIG_FAMILY.view,
      ancestorDepth: 8,
      descendantDepth: 8
    },
    extensions: {
      blankFamily: true,
      sourceRevision: 2
    }
  };
  saveFamilyToLibrary({
    family: staleFamily,
    id: 'haus-draig',
    title: 'Haus Draig',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, storage);

  const loaded = loadFamilyById('haus-draig', storage);
  const graph = createFamilyGraph(loaded.family);
  assert.equal(loaded.source, 'registry-upgrade');
  assert.equal(loaded.family.persons.length, 177);
  assert.equal(loaded.family.view.descendantDepth, 20);
  assert.equal(loaded.family.extensions.sourceRevision, 4);
  assert.deepEqual(loaded.family.extensions.registryUpgrade, { fromRevision: 2, toRevision: 4 });
  assert.equal(loaded.family.lineage.originHouse.enabled, true);
  assert.equal(
    loaded.family.parentages.find(parentage => parentage.childId === 'mairwen-draig').legitimacy,
    'legitimate',
    'Die versehentliche Legitimierung Mairwens muss beim Upgrade zurückgenommen werden.'
  );
  assert.equal(
    loaded.family.parentages.find(parentage => parentage.childId === 'mair-draig').legitimacy,
    'legitimized'
  );
  assert.equal(loaded.family.persons.find(person => person.id === 'merfyn-draig').title, 'Lokal ergänzter Titel');
  assert.ok(graph.getChildren('galahad-draig').some(person => person.id === 'gawain-draig'));
});

test('verzeichnet alle Häuser mit unabhängigem Rang und vollständiger Orts-Hierarchie', async () => {
  const storage = createMemoryStorage();
  const expected = new Map([
    ['haus-arwydd', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn'] }],
    ['haus-draig', { rankId: 'county', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }],
    ['haus-gafyr', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }],
    ['haus-gwefrydd', { rankId: 'barony', path: ['Cenyr', 'Celtigerns Wacht', 'Artus Streben', 'Rhosmere'] }],
    ['haus-gwyvern', { rankId: 'barony', path: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint'] }],
    ['haus-saethwyr', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }],
    ['haus-wyrm', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }]
  ]);
  const blankFamilies = [HOUSE_GWEFRYDD_FAMILY, HOUSE_GWYVERN_FAMILY];

  assert.equal(listFamilyRecords(storage).length, expected.size + LOWER_KNIGHT_HOUSE_FAMILIES.length);
  expected.forEach(({ rankId, path }, familyId) => {
    const loaded = loadFamilyById(familyId, storage);
    const profile = loaded.family.document.houseProfile;
    assert.deepEqual(loaded.folderPath, path);
    assert.deepEqual(createFolderPathFromHouseProfile(profile), path);
    assert.equal(profile.rankId, rankId);
    assert.notEqual(getHouseRank(rankId).label, 'Nicht vermerkt');
    assert.match(profile.regionEmblems.seat, /^assets\/images\/regions\//);
    assert.match(profile.regionEmblems.kingdom, /^assets\/images\/regions\//);
    assert.match(profile.regionEmblems.county, /^assets\/images\/regions\//);
    assert.match(profile.regionEmblems.barony, /^assets\/images\/regions\//);
  });
  blankFamilies.forEach(family => {
    assert.equal(loadFamilyById(family.document.id, storage).family.persons.length, 0);
    assert.match(family.document.emblem, /^assets\/images\/houses\/haus-/);
  });
  assert.equal(LOWER_KNIGHT_HOUSE_FAMILIES.length, 11);
  LOWER_KNIGHT_HOUSE_FAMILIES.forEach((family, index) => {
    const definition = LOWER_KNIGHT_HOUSE_DEFINITIONS[index];
    const loaded = loadFamilyById(family.document.id, storage);
    assert.equal(loaded.family.persons.length, 0);
    assert.equal(loaded.family.document.houseProfile.rankId, 'knight');
    assert.equal(loaded.family.document.houseProfile.liegeHouseId, `haus-${definition.liege.toLocaleLowerCase('de')}`);
    assert.equal(loaded.family.document.houseProfile.liegeHouseName, `Haus ${definition.liege}`);
    assert.deepEqual(loaded.family.document.houseProfile.secondarySeats, definition.secondarySeats || []);
    assert.deepEqual(loaded.folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
  });
  assert.equal(getHouseRank('knight').label, 'Niederes Rittergeschlecht');
  const registryTree = buildRegistryFolderTree(FAMILY_REGISTRY);
  const cenyrFolder = registryTree.folders.get('Cenyr');
  const countyFolder = cenyrFolder.folders.get('Celtigerns Wacht');
  const llamreisFolder = countyFolder.folders.get('Llamreis Ankunft');
  const gwynthorFolder = llamreisFolder.folders.get('Gwynthor');
  assert.equal(cenyrFolder.icon, 'assets/images/regions/koenigreich-cenyr.png');
  assert.equal(countyFolder.icon, 'assets/images/regions/celtigerns-wacht.png');
  assert.equal(llamreisFolder.icon, 'assets/images/regions/llamreis-ankunft.png');
  assert.equal(gwynthorFolder.icon, 'assets/images/regions/gwynthor.png');
  await Promise.all([
    'assets/images/houses/haus-arwydd.png',
    'assets/images/houses/haus-gwefrydd.png',
    'assets/images/houses/haus-gwyvern.png',
    ...LOWER_KNIGHT_HOUSE_FAMILIES.map(family => family.document.emblem),
    'assets/images/regions/artus-streben.png',
    'assets/images/regions/castellbryn.png',
    'assets/images/regions/gwendolyns-ufer.png',
    'assets/images/regions/gwynthor.png',
    'assets/images/regions/llamreis-ankunft.png',
    'assets/images/regions/rhonwens-traenen.png',
    'assets/images/regions/rhosmere.png',
    'assets/images/regions/abergwint.png'
  ].map(async path => {
    const image = await readFile(new URL(`../${path}`, import.meta.url));
    assert.ok(image.length > 100, `${path} ist leer.`);
  }));
  const gafyr = loadFamilyById('haus-gafyr', storage);
  assert.equal(gafyr.family.persons.length, 57);
  assert.equal(gafyr.family.extensions.blankFamily, false);
  assert.equal(
    formatHouseProfile(gafyr.family.document.houseProfile),
    'Ritterfürstengeschlecht · Stammsitz: Gwynthor · Baronie: Llamreis Ankunft · Grafschaft: Celtigerns Wacht · Königreich: Cenyr'
  );
  assert.equal(loadFamilyById('haus-vael', storage), null);
  assert.equal(loadFamilyById('haus-sgrechwyr', storage), null);
});

test('baut eine Beziehungsmatrix aus direkten Familien- und Schwiegerbeziehungen', () => {
  const people = [
    ['focus', 'Elis', 'female'], ['father', 'Aron', 'male'], ['mother', 'Mara', 'female'],
    ['grandfather', 'Bryn', 'male'], ['grandmother', 'Carys', 'female'], ['aunt', 'Delyth', 'female'],
    ['cousin', 'Evan', 'male'], ['brother', 'Fionn', 'male'], ['sister-in-law', 'Gwen', 'female'],
    ['niece', 'Heda', 'female'], ['spouse', 'Idris', 'male'], ['spouse-father', 'Joran', 'male'],
    ['spouse-mother', 'Kelda', 'female'], ['spouse-sister', 'Linn', 'female'], ['child', 'Mair', 'female'],
    ['child-in-law', 'Nerin', 'male'], ['grandchild', 'Owen', 'male'], ['stepmother', 'Pyria', 'female'],
    ['stepchild', 'Rhyd', 'male']
  ].map(([id, name, sex]) => ({ id, name, sex, houseId: 'house-test' }));
  const partnership = (id, participantIds, type = 'marriage') => ({ id, participantIds, type });
  const parentage = (id, childId, parentIds) => ({ id, childId, parentIds, type: 'biological' });
  const family = normalizeFamily({
    document: { id: 'matrix-test', title: 'Matrix-Test' },
    houses: [{ id: 'house-test', name: 'Haus Test' }],
    persons: people,
    partnerships: [
      partnership('parents', ['father', 'mother']),
      partnership('grandparents', ['grandfather', 'grandmother']),
      partnership('focus-spouse', ['focus', 'spouse']),
      partnership('brother-partner', ['brother', 'sister-in-law']),
      partnership('child-partner', ['child', 'child-in-law']),
      partnership('father-stepmother', ['father', 'stepmother']),
      partnership('spouse-parents', ['spouse-father', 'spouse-mother'])
    ],
    parentages: [
      parentage('mother-line', 'mother', ['grandfather', 'grandmother']),
      parentage('aunt-line', 'aunt', ['grandfather', 'grandmother']),
      parentage('focus-line', 'focus', ['father', 'mother']),
      parentage('brother-line', 'brother', ['father', 'mother']),
      parentage('cousin-line', 'cousin', ['aunt']),
      parentage('niece-line', 'niece', ['brother', 'sister-in-law']),
      parentage('spouse-line', 'spouse', ['spouse-father', 'spouse-mother']),
      parentage('spouse-sister-line', 'spouse-sister', ['spouse-father', 'spouse-mother']),
      parentage('child-line', 'child', ['focus', 'spouse']),
      parentage('grandchild-line', 'grandchild', ['child', 'child-in-law']),
      parentage('stepchild-line', 'stepchild', ['spouse'])
    ]
  });
  const matrix = buildRelationshipMatrix(family, 'focus');
  const entries = matrix.sections.flatMap(section => section.entries);
  const labels = new Map(entries.map(entry => [entry.person.id, entry.labels]));

  assert.equal(matrix.relationshipCount, entries.length);
  assert.equal(new Set(entries.map(entry => entry.person.id)).size, entries.length);
  assert.ok(labels.get('grandfather').includes('Großvater'));
  assert.ok(labels.get('aunt').includes('Tante'));
  assert.ok(labels.get('cousin').includes('Cousin'));
  assert.ok(labels.get('spouse').includes('Ehemann'));
  assert.ok(labels.get('spouse-father').includes('Schwiegervater'));
  assert.ok(labels.get('spouse-sister').includes('Schwägerin'));
  assert.ok(labels.get('sister-in-law').includes('Schwägerin'));
  assert.ok(labels.get('niece').includes('Nichte'));
  assert.ok(labels.get('grandchild').includes('Enkel'));
  assert.ok(labels.get('stepmother').includes('Stiefmutter'));
  assert.ok(labels.get('stepchild').includes('Stiefsohn'));

  const html = renderRelationshipMatrix(matrix);
  assert.match(html, /relationship-matrix-focus/);
  assert.match(html, /data-matrix-person-id="spouse"/);
  assert.doesNotMatch(html, /onclick=/i);
});

test('trennt aufgenommene Mündel von weggegebenen Familienkindern', () => {
  const gwennaMatrix = buildRelationshipMatrix(HOUSE_GAFYR_FAMILY, 'gwenna-crafanc');
  const gwennaEntries = new Map(gwennaMatrix.sections
    .flatMap(section => section.entries)
    .map(entry => [entry.person.id, entry]));
  assert.ok(gwennaEntries.get('egon-gafyr').labels.includes('Vormund'));
  assert.ok(gwennaEntries.get('egon-gafyr').kinds.includes('guardian'));
  assert.equal(gwennaEntries.has('alicyn-draig'), false);
  assert.equal(gwennaEntries.has('alwyn-gafyr'), false);
  assert.equal(gwennaEntries.has('rhys-gafyr'), false);
  assert.equal(gwennaEntries.has('skywyn-gafyr'), false);

  const egonMatrix = buildRelationshipMatrix(HOUSE_GAFYR_FAMILY, 'egon-gafyr');
  const egonEntries = new Map(egonMatrix.sections
    .flatMap(section => section.entries)
    .map(entry => [entry.person.id, entry]));
  assert.ok(egonEntries.get('gwenna-crafanc').labels.includes('Mündel'));
  assert.ok(egonEntries.get('gwenna-crafanc').kinds.includes('ward'));

  const wardAwayMatrix = buildRelationshipMatrix(SAMPLE_FAMILY, 'elowen-vael');
  const wardAwayEntries = new Map(wardAwayMatrix.sections
    .flatMap(section => section.entries)
    .map(entry => [entry.person.id, entry]));
  assert.ok(wardAwayEntries.get('cassian-vael').labels.includes('Vater'));
  assert.ok(wardAwayEntries.get('seraphine-thorne').labels.includes('Mutter'));
  assert.ok(wardAwayEntries.get('nyra-vael').labels.includes('Schwester'));
  assert.equal(wardAwayEntries.has('gareth-rime'), false);
});

test('übernimmt Oberhäupter und Erbfolgen aus den Haus-Hierarchien', () => {
  const expectations = [
    [HOUSE_ARWYDD_FAMILY, ['idris-arwydd'], ['ianto-arwydd', 'ifor-arwydd', 'ivor-arwydd']],
    [HOUSE_WYRM_FAMILY, ['tryffin-draig', 'gwastad-wyrm', 'rhydderch-wyrm', 'gallgoid-wyrm', 'gwlyddyn-wyrm', 'mailgwin-wyrm'], ['shan-wyrm', 'gavin-wyrm']],
    [HOUSE_GAFYR_FAMILY, ['kynwrig-gafyr', 'rheidwyn-gafyr', 'maldwyn-gafyr', 'mathonwy-gafyr', 'hwyvel-gafyr', 'gerwyn-gafyr', 'duncan-gafyr'], ['egon-gafyr', 'alwyn-gafyr', 'rhys-gafyr']],
    [HOUSE_SAETHWYR_FAMILY, ['kynwrig-draig', 'odyar-saethwyr', 'limwris-saethwyr', 'llawvrodedd-saethwyr', 'drudwas-saethwyr', 'gruffyd-saethwyr', 'gallgoid-saethwyr', 'huw-saethwyr'], ['marmaduke-saethwyr', 'arian-saethwyr']]
  ];

  expectations.forEach(([familyInput, expectedHeads, expectedMainLine]) => {
    const family = normalizeFamily(familyInput);
    const heads = family.persons.filter(person => person.lineageRole === 'head').map(person => person.id);
    const mainLine = family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id);
    assert.deepEqual(heads, expectedHeads);
    assert.deepEqual(mainLine, expectedMainLine);
  });
});

let failures = 0;
for (const { name, callback } of tests) {
  try {
    await callback();
    console.log(`✓ ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`✗ ${name}`);
    console.error(error);
  }
}

if (failures) {
  console.error(`\n${failures} von ${tests.length} Tests fehlgeschlagen.`);
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} Tests erfolgreich.`);
}
