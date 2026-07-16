import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { toFamilyChartData } from '../assets/js/adapters/family-chart-adapter.js';
import {
  createFamilyChartCardHtml,
  FAMILY_CHART_CARD_LAYOUT
} from '../assets/js/adapters/family-chart-card-renderer.js';
import { createRoundedOrthogonalPath } from '../assets/js/adapters/family-chart-link-renderer.js';
import { getCrestFrame, getPersonCardFrame } from '../assets/js/config/chart-frames.js';
import { SAMPLE_FAMILY } from '../assets/js/data/sample-family.js';
import { HOUSE_ARWYDD_FAMILY } from '../assets/js/data/house-arwydd-family.js';
import {
  HOUSE_DRAIG_FAMILY,
  HOUSE_GAFYR_FAMILY,
  HOUSE_SAETHWYR_FAMILY,
  HOUSE_WYRM_FAMILY
} from '../assets/js/data/blank-house-families.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import { createEmptyFamily, createFoundingFamily } from '../assets/js/domain/family-factory.js';
import { calculateAge, formatLifeLine } from '../assets/js/domain/person-presentation.js';
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

test('berücksichtigt die eigene Wappenposition jeder Personenfassung', () => {
  const core = getPersonCardFrame('core');
  const married = getPersonCardFrame('married');
  const forced = getPersonCardFrame('forced');
  assert.notEqual(core.crestPosition.top, married.crestPosition.top);
  assert.notEqual(core.crestPosition.left, forced.crestPosition.left);

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
  assert.match(css, /\.aleria-person-card__portrait-backdrop\s*\{[\s\S]*?width: 30\.6%;[\s\S]*?height: 80%;/);
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
  assert.equal(family.document.emblem, 'https://i.imgur.com/I6OEMqq.png');
  assert.equal(family.view.focusPersonId, 'idwalladr-arwydd');
  assert.deepEqual(
    Object.fromEntries(family.houses.filter(house => house.emblem).map(house => [house.id, house.emblem])),
    {
      'house-arwydd': 'https://i.imgur.com/I6OEMqq.png',
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
  assert.match(html, /id="family-app" data-workspace-mode="view"/);
  assert.match(html, /class="toolbar"[^>]*data-edit-only/);
  assert.match(html, /id="edit-access-dialog"/);
  assert.equal((html.match(/class="toolbar-icon/g) || []).length, 7);
  assert.match(html, /assets\/images\/toolbar\/fit-chart\.png/);
  assert.match(html, /assets\/images\/toolbar\/lineage\.png/);
  assert.match(html, /data-action="open-almanach-characters"/);
  assert.match(html, /id="almanach-character-dialog"/);
  assert.match(html, /assets\/css\/almanach-bridge\.css/);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)=/i);
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
  const folderPath = parseFolderPath('Cenyr > Celtigerns Wacht > Haus Test');
  const saved = saveFamilyToLibrary({
    family: SAMPLE_FAMILY,
    id: 'Haus Test',
    title: 'Haus Test',
    folderPath
  }, storage);
  const loaded = loadFamilyById('haus-test', storage);
  assert.equal(saved.id, 'haus-test');
  assert.deepEqual(loaded.folderPath, folderPath);
  assert.deepEqual(loaded.family.extensions.registry.folderPath, folderPath);
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

test('liefert die vier vorbereiteten Gwynthor-Häuser mit lokalen Wappen aus', () => {
  const storage = createMemoryStorage();
  const expectedPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'];
  const blankFamilies = [
    HOUSE_DRAIG_FAMILY,
    HOUSE_WYRM_FAMILY,
    HOUSE_SAETHWYR_FAMILY,
    HOUSE_GAFYR_FAMILY
  ];

  assert.equal(listFamilyRecords(storage).length, 5);
  blankFamilies.forEach(family => {
    const loaded = loadFamilyById(family.document.id, storage);
    assert.deepEqual(loaded.folderPath, expectedPath);
    assert.equal(loaded.family.persons.length, 0);
    assert.match(loaded.family.document.emblem, /^assets\/images\/houses\/haus-/);
  });
  assert.equal(loadFamilyById('haus-vael', storage), null);
  assert.equal(loadFamilyById('haus-sgrechwyr', storage), null);
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
