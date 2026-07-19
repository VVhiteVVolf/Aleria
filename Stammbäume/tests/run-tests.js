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
import { HOUSE_GWEFRYDD_FAMILY } from '../assets/js/data/house-gwefrydd-family.js';
import { HOUSE_GWEFRYDD_PORTRAITS } from '../assets/js/data/house-gwefrydd-portraits.js';
import { HOUSE_ILLYSYWEN_FAMILY } from '../assets/js/data/house-illysywen-family.js';
import { HOUSE_GWARED_FAMILY } from '../assets/js/data/house-gwared-family.js';
import { HOUSE_ARD_CONBHRON_FAMILY } from '../assets/js/data/house-ard-conbhron-family.js';
import { HOUSE_UI_TALAMH_FAMILY } from '../assets/js/data/house-ui-talamh-family.js';
import { HOUSE_PENDRAG_FAMILY } from '../assets/js/data/house-pendrag-family.js';
import { HOUSE_ILLEWOD_FAMILY } from '../assets/js/data/house-illewod-family.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from '../assets/js/data/house-illysywen-portraits.js';
import { HOUSE_TLAWD_FAMILY } from '../assets/js/data/house-tlawd-family.js';
import { HOUSE_TLAWD_PORTRAITS } from '../assets/js/data/house-tlawd-portraits.js';
import { HOUSE_RHYDDID_FAMILY } from '../assets/js/data/house-rhyddid-family.js';
import { HOUSE_RHYDDID_PORTRAITS } from '../assets/js/data/house-rhyddid-portraits.js';
import { HOUSE_GELYN_FAMILY } from '../assets/js/data/house-gelyn-family.js';
import { HOUSE_GELYN_PORTRAITS } from '../assets/js/data/house-gelyn-portraits.js';
import { HOUSE_CLUDWYR_FAMILY } from '../assets/js/data/house-cludwyr-family.js';
import { HOUSE_CLUDWYR_PORTRAITS } from '../assets/js/data/house-cludwyr-portraits.js';
import { HOUSE_CHWEDLONOL_FAMILY } from '../assets/js/data/house-chwedlonol-family.js';
import { HOUSE_CHWEDLONOL_PORTRAITS } from '../assets/js/data/house-chwedlonol-portraits.js';
import { HOUSE_AWENOR_FAMILY } from '../assets/js/data/house-awenor-family.js';
import { HOUSE_AWENOR_PORTRAITS } from '../assets/js/data/house-awenor-portraits.js';
import { HOUSE_GARRAEL_FAMILY } from '../assets/js/data/house-garrael-family.js';
import { HOUSE_GARRAEL_PORTRAITS } from '../assets/js/data/house-garrael-portraits.js';
import { HOUSE_GWYLLACH_FAMILY } from '../assets/js/data/house-gwyllach-family.js';
import { HOUSE_GWYLLACH_PORTRAITS } from '../assets/js/data/house-gwyllach-portraits.js';
import { HOUSE_SGRECHIWR_FAMILY } from '../assets/js/data/house-sgrechiwr-family.js';
import { HOUSE_SGRECHIWR_PORTRAITS } from '../assets/js/data/house-sgrechiwr-portraits.js';
import { HOUSE_LOER_FAMILY } from '../assets/js/data/house-loer-family.js';
import { HOUSE_LOER_PORTRAITS } from '../assets/js/data/house-loer-portraits.js';
import { HOUSE_AWENYDD_FAMILY } from '../assets/js/data/house-awenydd-family.js';
import { HOUSE_AWENYDD_PORTRAITS } from '../assets/js/data/house-awenydd-portraits.js';
import { HOUSE_BALCHDER_FAMILY } from '../assets/js/data/house-balchder-family.js';
import { HOUSE_BALCHDER_PORTRAITS } from '../assets/js/data/house-balchder-portraits.js';
import { HOUSE_ENEINIOG_FAMILY } from '../assets/js/data/house-eneiniog-family.js';
import { HOUSE_ENEINIOG_PORTRAITS } from '../assets/js/data/house-eneiniog-portraits.js';
import { HOUSE_GOSTYN_FAMILY } from '../assets/js/data/house-gostyn-family.js';
import { HOUSE_GOSTYN_PORTRAITS } from '../assets/js/data/house-gostyn-portraits.js';
import {
  buildImportedPersonValues,
  findExistingImport,
  relationForAction
} from '../assets/js/services/relation-actions.js';
import { HOUSE_GWYVERN_FAMILY } from '../assets/js/data/house-gwyvern-family.js';
import { HOUSE_GWYVERN_PORTRAITS } from '../assets/js/data/house-gwyvern-portraits.js';
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
import {
  ARTUS_STREBEN_HOUSE_DEFINITIONS,
  ARTUS_STREBEN_HOUSE_FAMILIES
} from '../assets/js/data/artus-streben-house-families.js';
import {
  GWENDOLYNS_UFER_HOUSE_DEFINITIONS,
  GWENDOLYNS_UFER_HOUSE_FAMILIES
} from '../assets/js/data/gwendolyns-ufer-house-families.js';
import {
  RHONWENS_TRAENEN_HOUSE_DEFINITIONS,
  RHONWENS_TRAENEN_HOUSE_FAMILIES
} from '../assets/js/data/rhonwens-traenen-house-families.js';
import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily
} from '../assets/js/data/blank-house-family-factory.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import {
  commitFounderCouple,
  createEmptyFamily,
  createFamilyProfileDraft,
  createFoundingFamily
} from '../assets/js/domain/family-factory.js';
import { deriveTreeGeneratorPhase } from '../assets/js/domain/tree-generator-phase.js';
import {
  PLACEHOLDER_UNKNOWN,
  suggestBirthYear,
  suggestDeathYear,
  suggestName
} from '../assets/js/domain/tree-generator-suggestions.js';
import { PLAUSIBLE_PARENT_AGE_AT_BIRTH } from '../assets/js/config/chronology.js';
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
  clearPendingTreeGeneratorLaunch,
  consumePendingTreeGeneratorLaunch,
  createWorkspaceModeUrl,
  grantWorkspaceEditAccess,
  hasPendingTreeGeneratorLaunch,
  markPendingTreeGeneratorLaunch,
  resolveWorkspaceAccess,
  WORKSPACE_MODE
} from '../assets/js/services/workspace-access.js';
import { isAleriaGptAvailable, requestAleriaGptSuggestion } from '../assets/js/services/aleria-gpt-bridge.js';
import * as treeGeneratorAiBridge from '../assets/js/modules/tree-generator/tree-generator-ai-bridge.js';
import {
  buildLandingTriviaPrompt,
  buildLocalTriviaBlurb,
  buildShortHouseProfile,
  pickTriviaSample
} from '../assets/js/services/landing-trivia.js';
import {
  buildFamilyBundleZip,
  collectFamilyImageRefs,
  extensionForContentType,
  zipFilenameFor
} from '../assets/js/services/family-bundle-export.js';
import {
  buildImageRefKey,
  parseFamilyBundleZip,
  rewriteFamilyImageRefs
} from '../assets/js/services/family-bundle-import.js';
import {
  collectGlobalFacts,
  collectHouseFacts,
  pickFactSample
} from '../assets/js/services/dashboard-facts.js';
import {
  collectBiographyPreviews,
  pickBiographySample
} from '../assets/js/services/dashboard-bio-preview.js';
import { createFamilyStore } from '../assets/js/state/family-store.js';
import {
  createFamilyChangeSet,
  familyFromRepositoryRecords,
  familyRootRecord,
  isValidFirestoreRecordId
} from '../assets/js/modules/family-sync/family-change-set.js';
import { CENYR_COUNTY_HOUSE_PROFILES } from '../assets/js/data/cenyr-county-house-profiles.js';
import { CENYR_COUNTY_HOUSE_FAMILIES } from '../assets/js/data/cenyr-county-house-families.js';
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
  assert.equal(family.document.emblem, 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png');
  assert.equal(family.view.focusPersonId, 'idwalladr-arwydd');
  assert.equal(graph.getPerson('idwalladr-arwydd').birth, '1653');
  assert.equal(graph.getPerson('idwalladr-arwydd').death, '1720');
  assert.equal(graph.getPerson('breandan-saethwyr').death, '1730');
  assert.equal(graph.getPerson('ilaria-arwydd').birth, '1728');
  assert.deepEqual(
    Object.fromEntries(family.houses.filter(house => house.emblem).map(house => [house.id, house.emblem])),
    {
      'house-arwydd': 'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
      'house-saethwyr': 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png',
      'house-wyrm': 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png',
      'house-draig': 'assets/images/houses/Llamreis Ankunft/haus-draig.png',
      'house-gafyr': 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png',
      'house-gwefrydd': 'assets/images/houses/Artus Streben/haus-gwefrydd.png',
      'house-gwywern': 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png'
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
  assert.equal(chartById.get('breandan-saethwyr').data.crest, 'assets/images/houses/Llamreis Ankunft/haus-saethwyr.png');
  assert.equal(chartById.get('eiddon-wym').data.crest, 'assets/images/houses/Llamreis Ankunft/haus-wyrm.png');
  assert.equal(chartById.get('tecwyn-draig').data.crest, 'assets/images/houses/Llamreis Ankunft/haus-draig.png');
  assert.equal(chartById.get('kelyddon-gafyr').data.crest, 'assets/images/houses/Llamreis Ankunft/haus-gafyr.png');
  assert.equal(chartById.get('myrcella-gwefrydd').data.crest, 'assets/images/houses/Artus Streben/haus-gwefrydd.png');
  assert.equal(chartById.get('gwynnan-gwywern').data.crest, 'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png');
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
  assert.match(html, /\.\.\/Familien Häuser und Clans\/haeuser\.registry\.js/);
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
  assert.match(inspectorScript, /data-action="open-relation-actions"/);
  assert.doesNotMatch(
    inspectorScript,
    /open-time-jump-after-person|open-related-person|open-relationship/,
    'Redundante Inspector-Aktionen sind in das Beziehungsmenü umgezogen.'
  );
  assert.match(html, /id="relation-actions-dialog"/);
  assert.match(html, /assets\/css\/relation-actions\.css/);
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

test('Stammbaum-Generator Phase 1: createFamilyProfileDraft liefert eine gültige, personenlose Akte', () => {
  const draft = createFamilyProfileDraft({
    documentTitle: 'Haus Nebelklinge',
    motto: 'Im Schatten wächst die Stärke.',
    rankId: 'barony',
    seat: 'Nebelfeste',
    description: 'Ein junges Baronshaus.',
    culture: 'Cenyri',
    religion: 'Alerische Kirche',
    governance: 'Erbbaronie',
    foundingYear: '1680',
    founderHouseName: 'Haus Sturmwacht',
    houseColors: 'Grau und Silber',
    specialTraits: 'Bekannt für Nebelweberei.'
  });
  assert.doesNotThrow(() => assertValidFamily(draft));
  assert.equal(draft.persons.length, 0);
  assert.equal(draft.document.title, 'Haus Nebelklinge');
  assert.equal(draft.document.houseProfile.rankId, 'barony');
  assert.equal(draft.document.houseProfile.seat, 'Nebelfeste');
  assert.equal(draft.extensions.generatorProfile.culture, 'Cenyri');
  assert.equal(draft.extensions.generatorProfile.governance, 'Erbbaronie');
  assert.equal(draft.extensions.generatorProfile.foundingYear, '1680');

  const blankDraft = createFamilyProfileDraft({ documentTitle: 'Haus Leer' });
  assert.equal(blankDraft.extensions.generatorProfile.culture, '');
  assert.equal(blankDraft.extensions.generatorProfile.houseColors, '');
});

test('Stammbaum-Generator Phase 2: commitFounderCouple baut auf einer Phase-1-Akte auf', () => {
  const draft = createFamilyProfileDraft({
    documentTitle: 'Haus Nebelklinge',
    motto: 'Im Schatten wächst die Stärke.'
  });
  const family = commitFounderCouple(draft, {
    founderManName: 'Torvin Nebelklinge',
    founderManBirth: '1650',
    founderWomanName: 'Yselda Grauhain',
    founderWomanBirth: '1653',
    marriageYear: '1672'
  });
  assert.doesNotThrow(() => assertValidFamily(family));
  assert.equal(family.persons.length, 2);
  assert.equal(family.partnerships.length, 1);
  assert.ok(family.lineage.founderPartnershipId);
  assert.equal(
    family.partnerships.find(item => item.id === family.lineage.founderPartnershipId)?.id,
    family.lineage.founderPartnershipId
  );
  assert.equal(family.houses.length, 1);
  assert.equal(family.houses[0].name, 'Haus Nebelklinge');
  assert.equal(family.houses[0].motto, 'Im Schatten wächst die Stärke.');
});

test('Stammbaum-Generator: deriveTreeGeneratorPhase folgt 1→2→3→4 dem tatsächlichen Baum', () => {
  const emptyPhase = deriveTreeGeneratorPhase(createEmptyFamily());
  assert.equal(emptyPhase.phase, 1);

  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Nebelklinge' });
  const draftPhase = deriveTreeGeneratorPhase(draft);
  assert.equal(draftPhase.phase, 2);

  const founded = commitFounderCouple(draft, {
    founderManName: 'Torvin Nebelklinge',
    founderWomanName: 'Yselda Grauhain'
  });
  const foundedPhase = deriveTreeGeneratorPhase(founded);
  assert.equal(foundedPhase.phase, 3);
  assert.equal(foundedPhase.founderPartnershipId, founded.lineage.founderPartnershipId);

  const store = createFamilyStore(founded);
  store.addTimeJump({
    parentPartnershipId: founded.lineage.founderPartnershipId,
    fromYear: '1672',
    toYear: '1700',
    years: 28,
    label: 'Zeitsprung'
  });
  const afterTimeJumpPhase = deriveTreeGeneratorPhase(store.getState().family);
  assert.equal(afterTimeJumpPhase.phase, 4);
  assert.equal(afterTimeJumpPhase.generationIndex, 1);
  const timeJumpId = store.getState().family.timeJumps[0].id;
  const [founderManId] = founded.partnerships[0].participantIds;
  assert.ok(afterTimeJumpPhase.openLeaves.some(leaf => leaf.personId === founderManId && leaf.unresolvedTimeJumpId === timeJumpId));

  store.addRelatedPerson(founderManId, {
    name: 'Cael Nebelklinge', title: '', sex: 'male', status: 'alive', birth: '1700', death: '',
    portrait: '', portraitPlaceholder: 'auto', houseId: founded.houses[0].id, familyRole: 'core', notes: ''
  }, { relationKind: 'time-jump-child', timeJumpId, legitimacy: 'unknown', certainty: 'probable', visibility: 'public', parentageType: 'claimed' });
  const afterChildPhase = deriveTreeGeneratorPhase(store.getState().family);
  assert.equal(afterChildPhase.phase, 4);
  assert.equal(afterChildPhase.generationIndex, 2);
});

test('Stammbaum-Generator: "Direkt beginnen" überspringt Phase 3 für die aktuelle Sitzung', () => {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Nebelklinge' });
  const founded = commitFounderCouple(draft, {
    founderManName: 'Torvin Nebelklinge',
    founderWomanName: 'Yselda Grauhain'
  });
  // Ohne die Option bleibt Phase 3 bestehen (keine Datenänderung durch das Überspringen).
  assert.equal(deriveTreeGeneratorPhase(founded).phase, 3);
  const skipped = deriveTreeGeneratorPhase(founded, { skipTimeJumpOffer: true });
  assert.equal(skipped.phase, 4);
  assert.equal(skipped.generationIndex, 1);
  // Ein erneuter Aufruf ohne die Option (z. B. beim nächsten Öffnen des Assistenten)
  // bietet Phase 3 wieder an, solange kein Kind angelegt wurde.
  assert.equal(deriveTreeGeneratorPhase(founded).phase, 3);
});

test('Stammbaum-Generator: Vorschlags-Engine respektiert Alters-Plausibilität und wiederholt keine Namen', () => {
  const usedNames = [];
  for (let index = 0; index < 100; index += 1) {
    const name = suggestName('female', usedNames);
    if (name !== PLACEHOLDER_UNKNOWN) {
      assert.ok(!usedNames.includes(name), `Name „${name}“ wurde bereits vergeben.`);
      usedNames.push(name);
    }
  }

  for (let index = 0; index < 25; index += 1) {
    const birthYear = suggestBirthYear({ anchorYear: 1700, role: 'child', params: {} });
    assert.notEqual(birthYear, PLACEHOLDER_UNKNOWN);
    const age = Number(birthYear) - 1700;
    assert.ok(
      age >= PLAUSIBLE_PARENT_AGE_AT_BIRTH.min && age <= PLAUSIBLE_PARENT_AGE_AT_BIRTH.max,
      `Elternalter ${age} liegt außerhalb der plausiblen Spanne.`
    );
  }

  assert.equal(suggestBirthYear({ anchorYear: '????', role: 'child' }), PLACEHOLDER_UNKNOWN);
  assert.equal(suggestDeathYear({ birthYear: 1700, agingKind: 'druide' }), PLACEHOLDER_UNKNOWN);
  const priesterDeath = Number(suggestDeathYear({ birthYear: 1700, agingKind: 'priester', params: { lifespan: 60 } }));
  assert.ok(priesterDeath - 1700 > 60, 'Priester sollten deutlich länger als die Basis-Lebensdauer leben.');
});

test('Stammbaum-Generator: store.setFamilyExtension setzt und entfernt Erweiterungsdaten', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  store.setFamilyExtension('generatorProfile', { culture: 'Cenyri' });
  assert.deepEqual(store.getState().family.extensions.generatorProfile, { culture: 'Cenyri' });
  assert.equal(store.getState().family.document.title, SAMPLE_FAMILY.document.title);
  assert.equal(store.getState().family.persons.length, SAMPLE_FAMILY.persons.length);

  store.setFamilyExtension('generatorProfile', null);
  assert.equal('generatorProfile' in store.getState().family.extensions, false);
});

test('Stammbaum-Generator: eine vollständig simulierte Generation bleibt schemakonform', () => {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Windfeder' });
  const founded = commitFounderCouple(draft, {
    founderManName: 'Bran Windfeder',
    founderManBirth: '1650',
    founderWomanName: 'Sela Grauhain',
    founderWomanBirth: '1653',
    marriageYear: '1672'
  });
  const store = createFamilyStore(founded);
  const [founderManId, founderWomanId] = founded.partnerships[0].participantIds;
  const houseId = founded.houses[0].id;

  function person(overrides) {
    return {
      name: 'Kind', title: '', sex: 'unknown', status: 'alive', birth: '1700', death: '',
      portrait: '', portraitPlaceholder: 'auto', houseId, familyRole: 'core', notes: '', tags: [],
      ...overrides
    };
  }

  // Zwillingspaar
  const twinAId = store.addRelatedPerson(founderManId, person({ name: 'Aeron Windfeder', sex: 'male', birth: '1700' }), {
    relationKind: 'child', secondParentId: founderWomanId, legitimacy: 'legitimate', parentageType: 'biological', certainty: 'confirmed', visibility: 'public'
  });
  store.addRelatedPerson(founderManId, person({ name: 'Ronan Windfeder', sex: 'male', birth: '1700', tags: ['Zwilling von Aeron Windfeder'] }), {
    relationKind: 'child', secondParentId: founderWomanId, legitimacy: 'legitimate', parentageType: 'biological', certainty: 'confirmed', visibility: 'public'
  });
  // Bastard
  store.addRelatedPerson(founderManId, person({ name: 'Wyn Windfeder', sex: 'female', birth: '1702' }), {
    relationKind: 'child', legitimacy: 'illegitimate', parentageType: 'biological', certainty: 'probable', visibility: 'public'
  });
  // Adoptiertes Kind
  store.addRelatedPerson(founderManId, person({ name: 'Idris Windfeder', sex: 'male', birth: '1703' }), {
    relationKind: 'child', secondParentId: founderWomanId, legitimacy: 'legitimate', parentageType: 'adoptive', certainty: 'confirmed', visibility: 'public'
  });

  // Zweite Ehe für den Zwilling Aeron
  const secondSpouseId = store.addRelatedPerson(twinAId, person({ name: 'Nia Sturmwacht', sex: 'female', birth: '1702', familyRole: 'married' }), {
    relationKind: 'partnership', partnershipType: 'marriage', partnershipStatus: 'active', certainty: 'confirmed', visibility: 'public'
  });
  assert.ok(secondSpouseId);

  // Kinderlose Ehe (zweite Zwillingslinie)
  store.addRelatedPerson(founderManId, person({ name: 'Elin Windfeder', sex: 'female', birth: '1704' }), {
    relationKind: 'child', secondParentId: founderWomanId, legitimacy: 'legitimate', parentageType: 'biological', certainty: 'confirmed', visibility: 'public'
  });
  const childlessPartnerId = store.addRelatedPerson(
    store.getState().family.persons.find(item => item.name === 'Elin Windfeder').id,
    person({ name: 'Unbekannter Ehemann', sex: 'male', birth: '1701', familyRole: 'married' }),
    { relationKind: 'partnership', partnershipType: 'marriage', partnershipStatus: 'active', certainty: 'confirmed', visibility: 'public' }
  );
  assert.ok(childlessPartnerId);

  // Ausgestorbene Linie über Wyn
  const wynId = store.getState().family.persons.find(item => item.name === 'Wyn Windfeder').id;
  const wynSpouseId = store.addRelatedPerson(wynId, person({ name: 'Unbekannte Ehefrau', sex: 'female', birth: '1701', familyRole: 'married' }), {
    relationKind: 'partnership', partnershipType: 'marriage', partnershipStatus: 'active', certainty: 'confirmed', visibility: 'public'
  });
  const wynPartnershipId = store.getState().family.partnerships.find(item => (
    item.participantIds.includes(wynId) && item.participantIds.includes(wynSpouseId)
  )).id;
  store.addCadetBranch({
    id: 'married-away-test-wyn',
    name: 'Unbekanntes Haus',
    linkType: 'line-extinct',
    parentPartnershipId: wynPartnershipId,
    houseId: '',
    emblem: '',
    emblemScale: 0.86,
    crestFrame: 'gold',
    frameScale: 1,
    founded: '',
    targetFamilyId: '',
    notes: 'Testfall: ausgestorbene Linie.'
  });

  const finalFamily = store.getState().family;
  const result = validateFamily(finalFamily);
  const errors = result.diagnostics.filter(diagnostic => diagnostic.severity === 'error');
  assert.deepEqual(errors, []);
  assert.doesNotThrow(() => assertValidFamily(finalFamily));
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
  assert.equal(family.cadetBranches.length, 34);
  assert.equal(
    family.cadetBranches.find(branch => branch.id === 'married-away-pendrag-caitrin').parentPartnershipId,
    'marriage-caitrin-gawain'
  );
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

  assert.equal(Object.keys(HOUSE_DRAIG_PORTRAITS).length, 132);
  assert.equal(Object.keys(sourceManifest).length, 114);
  assert.equal(picturedPeople.length, 132);
  assert.equal(placeholderPeople.length, 45);
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

test('bildet Haus Gwyvern von Bleddyn und Owena bis zur jüngsten Generation ab', () => {
  const family = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const wyrm = assertValidFamily(HOUSE_WYRM_FAMILY).family;
  const saethwyr = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;
  const gafyr = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const arwydd = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 44);
  assert.equal(family.partnerships.length, 19);
  assert.equal(family.parentages.length, 24);
  assert.equal(family.cadetBranches.length, 10);
  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away'));
  assert.equal(
    family.cadetBranches.find(branch => branch.id === 'married-away-draig-heledd').targetFamilyId,
    'haus-draig'
  );
  assert.equal(family.lineage.founderPartnershipId, 'marriage-bleddyn-owena');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 6);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['trevor-gwyvern', 'huw-gwyvern'],
    'Trevor und Huw bilden die Erbfolge.'
  );

  assert.deepEqual(graph.getChildren('bleddyn-draig').map(person => person.id).sort(), [
    'endellion-gwyvern',
    'gwrddnei-gwyvern'
  ]);
  assert.deepEqual(graph.getChildren('dyvynwal-gwyvern').map(person => person.id).sort(), [
    'gwyneira-gwyvern',
    'kimball-gwyvern',
    'seithved-gwyvern',
    'talaith-gwyvern'
  ]);
  assert.deepEqual(graph.getChildren('seithved-gwyvern').map(person => person.id).sort(), [
    'delyth-gwyvern',
    'heledd-gwyvern',
    'maredudd-gwyvern'
  ]);
  assert.deepEqual(graph.getChildren('mervyn-gwyvern').map(person => person.id).sort(), [
    'gwenfrewi-gwyvern',
    'huw-gwyvern',
    'tegwen-gwyvern',
    'trevor-gwyvern'
  ]);
  assert.deepEqual(graph.getChildren('gwynnan-gwyvern').map(person => person.id).sort(), [
    'brizio-gwyvern',
    'bryn-gwyvern'
  ]);
  assert.equal(graph.getPerson('kenyon-taranvyr').status, 'dead');
  assert.equal(graph.getPerson('afal-arth').status, 'dead');
  assert.equal(graph.getPerson('heledd-gwyvern').status, 'alive');
  assert.equal(graph.getPerson('bleddyn-draig').familyRole, 'core');
  assert.equal(graph.getPerson('owena-saethwyr').familyRole, 'married');
  assert.equal(
    family.partnerships.some(partnership => partnership.participantIds.includes('tegwen-gwyvern')),
    false,
    'Tegwens Verlobung wurde auf Anweisung nicht übernommen.'
  );

  [
    [family, 'bleddyn-draig', draig, 'bleddyn-draig'],
    [family, 'meurig-draig', draig, 'meurig-draig'],
    [family, 'heledd-gwyvern', draig, 'heledd-gwyvern'],
    [family, 'cynwrig-wyrm', wyrm, 'cynwrig-wyrm'],
    [family, 'angharad-gwyvern', wyrm, 'angharad-gwyvern'],
    [family, 'olwen-wyrm', wyrm, 'olwen-wyrm'],
    [family, 'maredudd-gwyvern', wyrm, 'maredudd-gwyvern'],
    [family, 'owena-saethwyr', saethwyr, 'owena-saethwyr'],
    [family, 'venora-saethwyr', saethwyr, 'venora-saethwyr'],
    [family, 'huw-saethwyr', saethwyr, 'huw-saethwyr'],
    [family, 'dyvynwal-gwyvern', saethwyr, 'dyvynwal-gwyvern'],
    [family, 'morwenna-gwyvern', saethwyr, 'morwenna-gwyvern'],
    [family, 'igraine-gafyr', gafyr, 'igraine-gafyr'],
    [family, 'gwrddnei-gwyvern', gafyr, 'gwrddnei-gwyvern'],
    [family, 'izobel-arwydd', arwydd, 'izobel-arwydd'],
    [family, 'gwynnan-gwyvern', arwydd, 'gwynnan-gwywern']
  ].forEach(([firstFamily, firstId, secondFamily, secondId]) => {
    const first = firstFamily.persons.find(person => person.id === firstId);
    const second = secondFamily.persons.find(person => person.id === secondId);
    assert.equal(first.worldPersonId, second.worldPersonId, `${firstId} muss dieselbe Weltperson bleiben.`);
    assert.equal(first.portrait, second.portrait, `${firstId} muss dasselbe lokale Portrait verwenden.`);
  });

  assert.ok(converted.data.every(entry => !['time-gap', 'time-jump'].includes(entry.data.nodeKind)));
  assert.ok(converted.data.some(entry => entry.data.aleria.cadetBranchId === 'married-away-draig-heledd'));
});

test('liefert für Haus Gwyvern alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gwyvern/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(HOUSE_GWYVERN_PORTRAITS)
    .filter(personId => HOUSE_GWYVERN_PORTRAITS[personId].startsWith('assets/images/portraits/haus-gwyvern/'));

  assert.equal(Object.keys(HOUSE_GWYVERN_PORTRAITS).length, 37);
  assert.equal(localPortraitIds.length, 24);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 37);
  assert.equal(placeholderPeople.length, 7);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_GWYVERN_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet Haus Gwefrydd mit drei Überlieferungslücken und allen belegten Zweigen ab', () => {
  const family = assertValidFamily(HOUSE_GWEFRYDD_FAMILY).family;
  const graph = createFamilyGraph(family);
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const wyrm = assertValidFamily(HOUSE_WYRM_FAMILY).family;
  const saethwyr = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;
  const gafyr = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const gwyvern = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const arwydd = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 61);
  assert.equal(family.partnerships.length, 28);
  assert.equal(family.parentages.length, 32);
  assert.equal(family.cadetBranches.length, 13);
  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away'));
  assert.equal(
    family.cadetBranches.find(branch => branch.id === 'married-away-gafyr-heulwen').targetFamilyId,
    'haus-gafyr'
  );
  assert.equal(family.lineage.founderPartnershipId, 'marriage-tallwch-clodagh');
  assert.equal(family.lineage.timeGap.enabled, true, 'Die Gründerlücke hängt als Zeitsprung unter dem Hauswappen.');
  assert.equal(family.timeJumps.length, 2);
  assert.equal(family.timeJumps[0].toYear, '1096');
  assert.equal(family.timeJumps[1].toYear, '1578');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 9);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['thomos-gwefrydd', 'iorwerth-gwefrydd', 'bethan-gwefrydd'],
    'Thomos, Iorwerth und Bethan bilden die Erbfolge.'
  );

  assert.deepEqual(graph.getChildren('borros-gwefrydd').map(person => person.id).sort(), [
    'ellyn-gwefrydd',
    'greidyawl-gwefrydd',
    'lyonel-gwefrydd'
  ]);
  assert.deepEqual(graph.getChildren('edric-gwefrydd').map(person => person.id), [
    'ursyn-gwefrydd'
  ], 'Ursyn ist der Sohn Edrics und Luneds.');
  assert.deepEqual(graph.getChildren('gwenhwyfar-gwefrydd'), [], 'Gwenhwyfar wurde nach Haus Dyngwn wegverheiratet.');
  assert.equal(
    family.cadetBranches.find(branch => branch.id === 'married-away-dyngwn-gwenhwyfar').parentPartnershipId,
    'marriage-gwenhwyfar-dewyll'
  );
  assert.deepEqual(graph.getChildren('stennis-gwefrydd').map(person => person.id).sort(), [
    'branwen-gwefrydd',
    'thomos-gwefrydd'
  ]);
  assert.deepEqual(graph.getChildren('thomos-gwefrydd').map(person => person.id).sort(), [
    'bethan-gwefrydd',
    'eira-gwefrydd',
    'iorwerth-gwefrydd'
  ]);
  assert.deepEqual(graph.getChildren('tommen-gwefrydd').map(person => person.id).sort(), [
    'floris-gwefrydd',
    'petyr-gwefrydd'
  ]);
  assert.equal(graph.getPerson('kenehyr-gwefrydd').death, '1141');
  assert.equal(graph.getPerson('stennis-gwefrydd').status, 'alive');
  assert.equal(graph.getPerson('tallwch-gwefrydd').familyRole, 'core');
  assert.equal(graph.getPerson('clodagh-ard-conbhron').familyRole, 'married');

  [
    [family, 'kenehyr-gwefrydd', draig, 'kenehyr-gwefrydd'],
    [family, 'tanwen-draig', draig, 'tanwen-draig'],
    [family, 'branwen-gwefrydd', draig, 'branwen-gwefrydd'],
    [family, 'steffan-draig', draig, 'steffan-draig'],
    [family, 'steffon-gwefrydd', wyrm, 'steffon-gwefrydd'],
    [family, 'sulwen-wyrm', wyrm, 'sulwen-wyrm'],
    [family, 'odyar-saethwyr', saethwyr, 'odyar-saethwyr'],
    [family, 'morwenna-gwefrydd', saethwyr, 'morwenna-gwefrydd'],
    [family, 'gallgoid-saethwyr', saethwyr, 'gallgoid-saethwyr'],
    [family, 'selyse-gwefrydd', saethwyr, 'selyse-gwefrydd'],
    [family, 'rheidwyn-gafyr', gafyr, 'rheidwyn-gafyr'],
    [family, 'heulwen-gwefrydd', gafyr, 'heulwen-gwefrydd'],
    [family, 'greidyawl-gwefrydd', gafyr, 'greidyawl-gwefrydd'],
    [family, 'isotta-gafyr', gafyr, 'isotta-gafyr'],
    [family, 'ffion-gwefrydd', gafyr, 'ffion-gwefrydd'],
    [family, 'rheinallt-gafyr', gafyr, 'rheinallt-gafyr'],
    [family, 'thomos-gwefrydd', gwyvern, 'thomos-gwefrydd'],
    [family, 'alys-gwyvern', gwyvern, 'alys-gwyvern'],
    [family, 'myrcella-gwefrydd', arwydd, 'myrcella-gwefrydd'],
    [family, 'ieuan-arwydd', arwydd, 'ieuan-arwydd']
  ].forEach(([firstFamily, firstId, secondFamily, secondId]) => {
    const first = firstFamily.persons.find(person => person.id === firstId);
    const second = secondFamily.persons.find(person => person.id === secondId);
    assert.equal(first.worldPersonId, second.worldPersonId, `${firstId} muss dieselbe Weltperson bleiben.`);
    assert.equal(first.portrait, second.portrait, `${firstId} muss dasselbe lokale Portrait verwenden.`);
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-jump').length, 2);
  assert.ok(converted.data.some(entry => entry.data.nodeKind === 'time-gap'));
  const gwefryddCrest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  const gwefryddGap = converted.data.find(entry => entry.data.nodeKind === 'time-gap');
  assert.deepEqual(gwefryddGap.rels.parents, [gwefryddCrest.id], 'Der Gründer-Zeitsprung hängt direkt unter dem Hauswappen.');
  assert.deepEqual(gwefryddCrest.rels.children, [gwefryddGap.id]);
  assert.ok(gwefryddGap.rels.children.includes('wynfor-gwefrydd'));
  assert.ok(converted.data.some(entry => entry.data.aleria.cadetBranchId === 'married-away-draig-branwen'));
});

test('liefert für Haus Gwefrydd alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GWEFRYDD_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gwefrydd/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(HOUSE_GWEFRYDD_PORTRAITS)
    .filter(personId => HOUSE_GWEFRYDD_PORTRAITS[personId].startsWith('assets/images/portraits/haus-gwefrydd/'));

  assert.equal(Object.keys(HOUSE_GWEFRYDD_PORTRAITS).length, 45);
  assert.equal(localPortraitIds.length, 30);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 45);
  assert.equal(placeholderPeople.length, 16);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_GWEFRYDD_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    const signature = [...image.subarray(0, 3)].join(',');
    assert.ok(
      signature === '255,216,255' || signature === '137,80,78',
      `Portraitdatei für ${person.name} ist weder JPEG noch PNG.`
    );
  }));
});

test('bildet das erloschene Ritterfürstenhaus Illysywen mit Ausgestorben-Knoten ab', () => {
  const family = assertValidFamily(HOUSE_ILLYSYWEN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const gwefrydd = assertValidFamily(HOUSE_GWEFRYDD_FAMILY).family;
  const gwyvern = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const saethwyr = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 30);
  assert.equal(family.partnerships.length, 14);
  assert.equal(family.parentages.length, 15);
  assert.equal(family.cadetBranches.length, 6);
  assert.ok(
    !family.cadetBranches.some(branch => branch.parentPartnershipId === 'forced-nodawl-rhonwen'),
    'Ein außereheliches Kind begründet keine wegverheiratete Linie.'
  );
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.crestFrame, 'gold', 'Ritterfürstenhäuser führen den goldenen Wappenrahmen.');
  assert.equal(family.document.houseProfile.rankId, 'knight-prince');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 4);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['nodawl-illysywen', 'hugwan-illysywen']
  );
  assert.equal(graph.getPerson('ercwlff-illysywen').title, 'Letzter Ritterfürst des Hauses Illysywen');

  const extinctBranches = family.cadetBranches.filter(branch => branch.linkType === 'line-extinct');
  assert.equal(extinctBranches.length, 2, 'Unter Hugwan und Sior endet die Linie.');
  assert.deepEqual(
    extinctBranches.map(branch => branch.parentPartnershipId).sort(),
    ['engagement-hugwan-nasuada', 'engagement-sior-innogen']
  );
  const lineEndNodes = converted.data.filter(entry => entry.data.nodeKind === 'line-end');
  assert.equal(lineEndNodes.length, 2);
  assert.ok(lineEndNodes.every(entry => /AusgestorbenKnotenendpunkt\.png$/.test(entry.data.frameAsset)));
  assert.ok(lineEndNodes.some(entry => entry.rels.parents.includes('hugwan-illysywen')));
  assert.ok(lineEndNodes.some(entry => entry.rels.parents.includes('sior-illysywen')));
  assert.ok(
    graph.getChildren('hugwan-illysywen').length === 0 && graph.getChildren('sior-illysywen').length === 0,
    'Die Linie wird nicht über Bastarde oder Töchter fortgeführt.'
  );

  assert.equal(family.partnerships.find(partnership => partnership.id === 'forced-nodawl-rhonwen').type, 'forced');
  assert.equal(family.partnerships.find(partnership => partnership.id === 'engagement-hugwan-nasuada').type, 'engagement');
  assert.equal(family.partnerships.find(partnership => partnership.id === 'engagement-sior-innogen').type, 'engagement');
  assert.equal(family.parentages.find(parentage => parentage.childId === 'mair-draig').legitimacy, 'legitimized');
  assert.equal(family.parentages.find(parentage => parentage.childId === 'iwan-illysywen').legitimacy, 'illegitimate');
  assert.equal(graph.getPerson('iwan-illysywen').familyRole, 'bastard');
  assert.deepEqual(graph.getChildren('ercwlff-illysywen').map(person => person.id).sort(), [
    'einion-illysywen',
    'morwen-illysywen',
    'nodawl-illysywen'
  ]);

  [
    [family, 'nodawl-illysywen', draig, 'nodawl-illysywen'],
    [family, 'rhonwen-draig', draig, 'rhonwen-draig'],
    [family, 'mair-draig', draig, 'mair-draig'],
    [family, 'ysbail-illyswen', gwefrydd, 'ysbail-illyswen'],
    [family, 'ormund-gwefrydd', gwefrydd, 'ormund-gwefrydd'],
    [family, 'dajenne-illyswen', gwyvern, 'dajenne-illyswen'],
    [family, 'kimball-gwyvern', gwyvern, 'kimball-gwyvern'],
    [family, 'wenna-saethwyr', saethwyr, 'wenna-saethwyr']
  ].forEach(([firstFamily, firstId, secondFamily, secondId]) => {
    const first = firstFamily.persons.find(person => person.id === firstId);
    const second = secondFamily.persons.find(person => person.id === secondId);
    assert.equal(first.worldPersonId, second.worldPersonId, `${firstId} muss dieselbe Weltperson bleiben.`);
    assert.equal(first.portrait, second.portrait, `${firstId} muss dasselbe lokale Portrait verwenden.`);
  });

  assert.ok(converted.data.some(entry => entry.data.nodeKind === 'time-gap'));
});

test('liefert für Haus Illysywen alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_ILLYSYWEN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-illysywen/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(HOUSE_ILLYSYWEN_PORTRAITS)
    .filter(personId => HOUSE_ILLYSYWEN_PORTRAITS[personId].startsWith('assets/images/portraits/haus-illysywen/'));

  assert.equal(Object.keys(HOUSE_ILLYSYWEN_PORTRAITS).length, 24);
  assert.equal(localPortraitIds.length, 18);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 24);
  assert.equal(placeholderPeople.length, 6);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_ILLYSYWEN_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet das Ritterherrenhaus Tlawd mit Überlieferungslücke und silbernem Wappenrahmen ab', () => {
  const family = assertValidFamily(HOUSE_TLAWD_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 31);
  assert.equal(family.partnerships.length, 11);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 0);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].toYear, '1618');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-edric-anwen');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gafyr');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 4);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['siarl-tlawd', 'rhyderch-tlawd', 'edric-tlawd-1716'],
    'Siarl, Rhyderch und Edric bilden die Erbfolge.'
  );
  assert.equal(
    graph.getPerson('cadfael-tlawd').title,
    'Ritterherr des Hauses Tlawd',
    'Das Oberhaupt eines Ritterherrenhauses trägt den Titel Ritterherr.'
  );
  assert.equal(graph.getPerson('cadfael-tlawd').status, 'alive');
  assert.equal(graph.getPerson('edric-tlawd').title, 'Begründer des Ritterherrenhauses Tlawd');

  assert.deepEqual(graph.getChildren('edric-tlawd').map(person => person.id).sort(), [
    'mair-tlawd',
    'owain-tlawd'
  ]);
  assert.deepEqual(graph.getChildren('owain-tlawd').map(person => person.id), ['gareth-tlawd']);
  assert.deepEqual(graph.getChildren('cadfael-tlawd').map(person => person.id).sort(), [
    'lloyd-tlawd',
    'modlen-tlawd',
    'nedri-tlawd',
    'siarl-tlawd'
  ]);
  assert.deepEqual(graph.getChildren('lloyd-tlawd').map(person => person.id).sort(), [
    'arwel-tlawd',
    'caron-tlawd',
    'lludd-tlawd'
  ]);
  assert.deepEqual(graph.getChildren('rhyderch-tlawd').map(person => person.id).sort(), [
    'edric-tlawd-1716',
    'haf-tlawd',
    'taran-tlawd'
  ]);
  assert.ok(
    family.persons.filter(person => person.familyRole === 'married').every(person => !person.houseId),
    'Die eingeheirateten Ehepartner sind ohne Hausnamen überliefert.'
  );

  const tlawdCrest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(tlawdCrest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-jump').length, 1);
});

test('liefert für Haus Tlawd alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_TLAWD_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-tlawd/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_TLAWD_PORTRAITS).length, 19);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_TLAWD_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 19);
  assert.equal(placeholderPeople.length, 12);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_TLAWD_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet das Ritterherrenhaus Rhyddid mit Gründerfamilie, Überlieferungslücke und Fremdhaus-Wappen ab', () => {
  const family = assertValidFamily(HOUSE_RHYDDID_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 31);
  assert.equal(family.partnerships.length, 11);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 2, 'Nur Wegverheiratet-Medaillons; Herkunfts-Medaillons sind unerwünscht.');
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-gwilym-evie');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.toYear, '1651');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-wyrm');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 3);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['arian-rhyddid', 'artie-rhyddid'],
    'Arian und Artie bilden die Erbfolge.'
  );
  assert.equal(
    graph.getPerson('taran-rhyddid').title,
    'Ritterherr des Hauses Rhyddid',
    'Das Oberhaupt eines Ritterherrenhauses trägt den Titel Ritterherr.'
  );
  assert.equal(graph.getPerson('taran-rhyddid').status, 'alive');
  assert.equal(graph.getPerson('kerwin-rhyddid').status, 'dead');
  assert.equal(graph.getPerson('gwilym-rhyddid').title, 'Begründer des Ritterherrenhauses Rhyddid');
  assert.equal(graph.getPerson('yale-rhyddid').title, 'Hauptmann von Mwyncreig');

  // Gwilym und Gwenifer stammen vom 1262 überfallenen Hof des namenlosen Schweinehirten.
  assert.deepEqual(graph.getChildren('unknown-gwilym-father').map(person => person.id).sort(), [
    'gwenifer-rhyddid',
    'gwilym-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('gwilym-rhyddid').map(person => person.id).sort(), [
    'evangelin-rhyddid',
    'kerwin-rhyddid',
    'yale-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('kerwin-rhyddid').map(person => person.id), ['taran-rhyddid']);
  assert.deepEqual(graph.getChildren('yale-rhyddid').map(person => person.id), ['rhain-rhyddid']);
  assert.deepEqual(graph.getChildren('taran-rhyddid').map(person => person.id).sort(), [
    'arian-rhyddid',
    'gwydion-rhyddid',
    'ronda-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('rhain-rhyddid').map(person => person.id).sort(), [
    'bevan-rhyddid',
    'eelin-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('arian-rhyddid').map(person => person.id).sort(), [
    'artie-rhyddid',
    'evie-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('bevan-rhyddid').map(person => person.id).sort(), [
    'mal-rhyddid',
    'meggie-rhyddid',
    'nel-rhyddid'
  ]);
  assert.deepEqual(graph.getChildren('eelin-rhyddid').map(person => person.id).sort(), [
    'barry-rhyddid',
    'glinda-rhyddid'
  ]);
  assert.deepEqual(graph.getParents('taran-rhyddid').map(person => person.id).sort(), [
    'arianwen-chwedlonol',
    'kerwin-rhyddid'
  ]);

  // Ehepartner aus benannten Ritterhäusern behalten Haus und geteilte Identität.
  assert.equal(graph.getPerson('arianwen-chwedlonol').worldPersonId, 'person--haus-chwedlonol--arianwen-chwedlonol');
  assert.equal(graph.getPerson('godwyn-cludwyr').worldPersonId, 'person--haus-cludwyr--godwyn-cludwyr');
  assert.equal(graph.getPerson('avan-balchder').worldPersonId, 'person--haus-balchder--avan-balchder');
  assert.ok(
    family.persons
      .filter(person => person.familyRole === 'married' && !person.houseId)
      .every(person => !person.portrait || person.portrait.startsWith('assets/images/portraits/haus-rhyddid/'))
  );

  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away'));
  assert.ok(
    family.cadetBranches.every(branch => branch.crestFrame === 'silver'),
    'Fremdhaus-Wappenknoten der Ritterherrenhäuser führen den Silberrahmen.'
  );
  assert.ok(
    family.cadetBranches.every(branch => branch.subtitle !== 'Herkunftshaus der Braut'),
    'Herkunftshaus-Medaillons für eingeheiratete Ehepartner sind unerwünscht.'
  );
  assert.deepEqual(
    family.cadetBranches.map(branch => branch.targetFamilyId).sort(),
    ['haus-balchder', 'haus-cludwyr']
  );

  const rhyddidCrest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(rhyddidCrest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 2);
});

test('liefert für Haus Rhyddid alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_RHYDDID_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-rhyddid/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  // Godwyns Portrait wird vom Cludwyr-Stammbaum gehostet und hier nur wiederverwendet.
  assert.equal(Object.keys(HOUSE_RHYDDID_PORTRAITS).length, 25);
  assert.equal(Object.keys(sourceManifest).length, 24);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_RHYDDID_PORTRAITS[personId]));
  assert.equal(HOUSE_RHYDDID_PORTRAITS['godwyn-cludwyr'], 'assets/images/portraits/haus-cludwyr/godwyn-cludwyr.jpg');
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 25);
  assert.equal(placeholderPeople.length, 6);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_RHYDDID_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet das junge Ritterherrenhaus Gelyn ohne Überlieferungslücke ab', () => {
  const family = assertValidFamily(HOUSE_GELYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 24);
  assert.equal(family.partnerships.length, 7);
  assert.equal(family.parentages.length, 16);
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-cadoc-aliza');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, false, 'Das junge Haus kennt keine Überlieferungslücke.');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 1);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['brannoc-gelyn', 'rhon-gelyn', 'fflam-gelyn'],
    'Brannoc, Rhon und Fflam bilden die Erbfolge.'
  );
  assert.equal(
    graph.getPerson('cadoc-gelyn').title,
    'Begründer und Ritterherr des Hauses Gelyn',
    'Der Gründer ist zugleich amtierender Ritterherr.'
  );
  assert.equal(graph.getPerson('cadoc-gelyn').status, 'alive');
  assert.equal(graph.getPerson('unknown-cadoc-father').status, 'unknown');

  // Cadoc und Dehlia entstammen einer nicht überlieferten Familie.
  assert.deepEqual(graph.getChildren('unknown-cadoc-father').map(person => person.id).sort(), [
    'cadoc-gelyn',
    'dehlia-gelyn'
  ]);
  assert.deepEqual(graph.getChildren('cadoc-gelyn').map(person => person.id).sort(), [
    'brannoc-gelyn',
    'gwawr-gelyn',
    'gwyron-gelyn',
    'madoc-gelyn',
    'senara-gelyn'
  ]);
  assert.deepEqual(graph.getChildren('brannoc-gelyn').map(person => person.id).sort(), [
    'fflam-gelyn',
    'gwion-gelyn',
    'rhon-gelyn',
    'torri-gelyn'
  ]);
  assert.deepEqual(graph.getChildren('madoc-gelyn').map(person => person.id).sort(), [
    'garym-gelyn',
    'reece-gelyn'
  ]);
  assert.deepEqual(graph.getChildren('gwyron-gelyn').map(person => person.id), ['llew-gelyn']);
  assert.deepEqual(graph.getChildren('gwawr-gelyn').map(person => person.id).sort(), [
    'meic-gelyn',
    'teleri-gelyn'
  ]);
  assert.deepEqual(graph.getChildren('senara-gelyn').map(person => person.id), []);

  // Kamber stammt aus dem Ritterherrenhaus Balchder und teilt dessen Weltpersonen-ID.
  assert.equal(graph.getPerson('kamber-balchder').worldPersonId, 'person--haus-balchder--kamber-balchder');
  const balchderBranch = family.cadetBranches[0];
  assert.equal(balchderBranch.linkType, 'married-away');
  assert.equal(balchderBranch.crestFrame, 'silver');
  assert.equal(balchderBranch.parentPartnershipId, 'marriage-senara-kamber');
  assert.equal(balchderBranch.targetFamilyId, 'haus-balchder');

  const gelynCrest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(gelynCrest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');
  assert.ok(converted.data.every(entry => !['time-gap', 'time-jump'].includes(entry.data.nodeKind)));
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 1);
});

test('liefert für Haus Gelyn alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GELYN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gelyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_GELYN_PORTRAITS).length, 22);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_GELYN_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 22);
  assert.equal(placeholderPeople.length, 2);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_GELYN_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet das Ritterherrenhaus Cludwyr mit geteiltem Rhyddid-Paar und Herkunfts-Wappen ab', () => {
  const family = assertValidFamily(HOUSE_CLUDWYR_FAMILY).family;
  const rhyddid = assertValidFamily(HOUSE_RHYDDID_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 32);
  assert.equal(family.partnerships.length, 11);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 0, 'Herkunftshaus-Medaillons für eingeheiratete Ehepartner sind unerwünscht.');
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-saith-tirion');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.toYear, '1651');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-wyrm');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 3);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['slevin-cludwyr', 'aled-cludwyr'],
    'Slevin und Aled bilden die Erbfolge.'
  );
  assert.equal(
    graph.getPerson('rhain-cludwyr').title,
    'Ritterherr des Hauses Cludwyr',
    'Das Oberhaupt eines Ritterherrenhauses trägt den Titel Ritterherr.'
  );
  assert.equal(graph.getPerson('rhain-cludwyr').status, 'alive');
  assert.equal(graph.getPerson('saith-cludwyr').title, 'Begründer des Ritterherrenhauses Cludwyr');
  assert.equal(graph.getPerson('saith-cludwyr').status, 'dead');

  assert.deepEqual(graph.getChildren('saith-cludwyr').map(person => person.id).sort(), [
    'enfys-cludwyr',
    'godwyn-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('godwyn-cludwyr').map(person => person.id).sort(), [
    'rhain-cludwyr',
    'tigris-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('enfys-cludwyr').map(person => person.id), ['parzifal-cludwyr']);
  assert.deepEqual(graph.getChildren('rhain-cludwyr').map(person => person.id).sort(), [
    'glaw-cludwyr',
    'iestyn-cludwyr',
    'slevin-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('tigris-cludwyr').map(person => person.id), ['winnifred-cludwyr']);
  assert.deepEqual(graph.getChildren('parzifal-cludwyr').map(person => person.id), ['selwyn-cludwyr']);
  assert.deepEqual(graph.getChildren('slevin-cludwyr').map(person => person.id).sort(), [
    'aled-cludwyr',
    'sian-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('glaw-cludwyr').map(person => person.id).sort(), [
    'bogus-cludwyr',
    'brac-cludwyr',
    'cady-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('iestyn-cludwyr').map(person => person.id).sort(), [
    'ellis-cludwyr',
    'gildas-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('winnifred-cludwyr').map(person => person.id).sort(), [
    'dee-cludwyr',
    'eira-cludwyr'
  ]);
  assert.deepEqual(graph.getChildren('selwyn-cludwyr').map(person => person.id), ['dewi-cludwyr']);

  // Godwyn und Evangelin sind mit dem Rhyddid-Stammbaum geteilte Personen.
  const godwynHere = graph.getPerson('godwyn-cludwyr');
  const evangelinHere = graph.getPerson('evangelin-rhyddid');
  const godwynThere = rhyddid.persons.find(person => person.id === 'godwyn-cludwyr');
  const evangelinThere = rhyddid.persons.find(person => person.id === 'evangelin-rhyddid');
  assert.equal(godwynHere.worldPersonId, godwynThere.worldPersonId);
  assert.equal(evangelinHere.worldPersonId, evangelinThere.worldPersonId);
  assert.equal(godwynHere.portrait, godwynThere.portrait, 'Godwyns Portrait ist in beiden Stammbäumen dieselbe Datei.');
  assert.equal(godwynHere.birth, godwynThere.birth);
  assert.equal(godwynHere.death, godwynThere.death);
  assert.equal(evangelinHere.birth, evangelinThere.birth);
  assert.equal(evangelinHere.death, evangelinThere.death);
  assert.equal(graph.getPerson('klervi-balchder').worldPersonId, 'person--haus-balchder--klervi-balchder');
  assert.equal(
    graph.getPerson('gavin-1702').worldPersonId,
    'person--family-tree--gavin-1702',
    'Der Cludwyr-Gavin kollidiert nicht mit dem hauslosen Tlawd-Gavin.'
  );

  const cludwyrCrest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(cludwyrCrest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 0);
});

test('liefert für Haus Cludwyr alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CLUDWYR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-cludwyr/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_CLUDWYR_PORTRAITS).length, 27);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_CLUDWYR_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 27);
  assert.equal(placeholderPeople.length, 5);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_CLUDWYR_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('modifiziert Beziehungen über den Store: Scheidung, Eheschluss aus Verlobung, Legitimierung, Hauszugang', () => {
  const store = createFamilyStore(HOUSE_TLAWD_FAMILY);

  store.updatePartnership('marriage-mair-gavin', { status: 'divorced', end: '1740' });
  let family = store.getState().family;
  const divorced = family.partnerships.find(item => item.id === 'marriage-mair-gavin');
  assert.equal(divorced.status, 'divorced');
  assert.equal(divorced.end, '1740');

  store.updatePartnership('marriage-mair-gavin', { type: 'engagement', status: 'active' });
  store.updatePartnership('marriage-mair-gavin', { type: 'marriage', status: 'active', start: '1740' });
  family = store.getState().family;
  assert.equal(family.partnerships.find(item => item.id === 'marriage-mair-gavin').type, 'marriage');

  const parentageId = family.parentages.find(item => item.childId === 'owain-tlawd').id;
  store.updateParentage(parentageId, { legitimacy: 'legitimized' });
  family = store.getState().family;
  assert.equal(family.parentages.find(item => item.id === parentageId).legitimacy, 'legitimized');

  assert.equal(store.ensureHouse({ id: 'house-tlawd', name: 'Haus Tlawd' }), false, 'Bestehende Häuser werden nicht doppelt angelegt.');
  assert.equal(store.ensureHouse({ id: 'house-draig', name: 'Haus Draig', emblem: 'assets/images/houses/Llamreis Ankunft/haus-draig.png' }), true);
  family = store.getState().family;
  assert.equal(family.houses.filter(house => house.id === 'house-tlawd').length, 1);
  assert.equal(family.houses.find(house => house.id === 'house-draig')?.name, 'Haus Draig');

  assert.throws(() => store.updatePartnership('fehlt', { status: 'ended' }), /nicht gefunden/);
  assert.throws(() => store.updateParentage('fehlt', { legitimacy: 'legitimized' }), /nicht gefunden/);
});

test('verlobt eine Person registerübergreifend samt importierter Registerakte (Idwal-Beispiel)', () => {
  const store = createFamilyStore(HOUSE_DRAIG_FAMILY);
  const sourceFamily = assertValidFamily(HOUSE_TLAWD_FAMILY).family;
  const sourcePerson = sourceFamily.persons.find(person => person.id === 'taran-tlawd');

  assert.equal(findExistingImport(store.getState().family, sourcePerson), null);
  const imported = buildImportedPersonValues(sourceFamily, sourcePerson, {
    targetFamily: store.getState().family,
    familyRole: 'married'
  });
  assert.equal(imported.id, 'taran-tlawd');
  assert.equal(imported.name, 'Taran Tlawd', 'Fremde Personen tragen im Zielbaum den vollen Hausnamen.');
  assert.equal(imported.worldPersonId, 'person--haus-tlawd--taran-tlawd');
  assert.equal(imported.portrait, HOUSE_TLAWD_PORTRAITS['taran-tlawd']);
  assert.deepEqual(imported.house, { id: 'house-tlawd', name: 'Haus Tlawd', emblem: 'assets/images/houses/Llamreis Ankunft/haus-tlawd.png' });

  const { house, ...personValues } = imported;
  store.ensureHouse(house);
  store.addRelatedPerson('idwal-draig', personValues, relationForAction('betroth'));

  const family = store.getState().family;
  const importedPerson = family.persons.find(person => person.id === 'taran-tlawd');
  assert.equal(importedPerson.worldPersonId, 'person--haus-tlawd--taran-tlawd');
  assert.equal(importedPerson.houseId, 'house-tlawd');
  assert.ok(family.houses.some(item => item.id === 'house-tlawd'));
  const engagement = family.partnerships.find(partnership => (
    partnership.type === 'engagement'
    && partnership.participantIds.includes('idwal-draig')
    && partnership.participantIds.includes('taran-tlawd')
  ));
  assert.ok(engagement, 'Idwal Draig und Taran Tlawd sind nun verlobt.');
  assert.equal(engagement.status, 'active');

  // Ein erneuter Import findet die bereits übernommene Person wieder.
  assert.equal(findExistingImport(family, sourcePerson)?.id, 'taran-tlawd');
  assert.throws(() => relationForAction('unbekannt'), /keine Verbindungsart/);
});

test('bildet das matriarchale Ritterherrenhaus Chwedonol mit weiblicher Erbfolge und geteiltem Rhyddid-Paar ab', () => {
  const family = assertValidFamily(HOUSE_CHWEDLONOL_FAMILY).family;
  const rhyddid = assertValidFamily(HOUSE_RHYDDID_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 35);
  assert.equal(family.partnerships.length, 13);
  assert.equal(family.parentages.length, 21);
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-meredithe-ekmeleddin');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.toYear, '1652');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-saethwyr');
  assert.equal(family.persons.filter(person => person.lineageRole === 'head').length, 2);
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['niniane-chwedlonol', 'morgaine-chwedlonol', 'eleyne-chwedlonol'],
    'Die weibliche Erbfolge läuft über Niniane, Morgaine und Eleyne.'
  );
  assert.equal(
    graph.getPerson('gwenhwyfar-chwedlonol').title,
    'Ritterherrin des Hauses Chwedonol',
    'Das matriarchale Oberhaupt trägt die weibliche Form des Titels.'
  );
  assert.equal(graph.getPerson('gwenhwyfar-chwedlonol').status, 'alive');
  assert.equal(graph.getPerson('meredithe-chwedlonol').title, 'Begründerin des Ritterherrenhauses Chwedonol');

  // Namensgleiche Personen in unterschiedlichen Generationen mit unterschiedlichem Geburtsjahr
  // sind verschiedene Individuen (Meredithe/Meredithe 1677, Rhonwen 1681/Romney 1704).
  assert.deepEqual(graph.getChildren('meredithe-chwedlonol').map(person => person.id).sort(), [
    'arianwen-chwedlonol',
    'gwenhwyfar-chwedlonol',
    'rhiannon-chwedlonol'
  ]);
  assert.deepEqual(graph.getChildren('gwenhwyfar-chwedlonol').map(person => person.id).sort(), [
    'meredithe-1677-chwedlonol',
    'niniane-chwedlonol',
    'rhonwen-chwedlonol'
  ]);
  assert.deepEqual(graph.getChildren('rhiannon-chwedlonol').map(person => person.id), ['angharad-chwedlonol']);
  assert.deepEqual(graph.getChildren('niniane-chwedlonol').map(person => person.id).sort(), [
    'glyndwr-chwedlonol',
    'morgaine-chwedlonol'
  ]);
  assert.deepEqual(graph.getChildren('rhonwen-chwedlonol').map(person => person.id), ['romney-1704-chwedlonol']);
  assert.deepEqual(graph.getChildren('angharad-chwedlonol').map(person => person.id).sort(), [
    'eurin-chwedlonol',
    'gwyneth-chwedlonol'
  ]);
  assert.deepEqual(
    graph.getChildren('morgaine-chwedlonol').map(person => person.id).sort(),
    ['cederic-chwedlonol', 'eleyne-chwedlonol', 'soffi-gwared'],
    'Cederic und Eleyne sind leibliche Kinder, Soffi Gwared ist ein aufgenommenes Mündel.'
  );
  const soffiParentage = family.parentages.find(parentage => parentage.childId === 'soffi-gwared');
  assert.equal(soffiParentage.type, 'foster');
  assert.deepEqual(graph.getChildren('glyndwr-chwedlonol').map(person => person.id), ['caralyn-chwedlonol']);
  assert.deepEqual(graph.getChildren('romney-1704-chwedlonol').map(person => person.id).sort(), [
    'kyndra-chwedlonol',
    'rhondia-chwedlonol'
  ]);
  assert.deepEqual(graph.getChildren('gwyneth-chwedlonol').map(person => person.id).sort(), [
    'maxen-chwedlonol',
    'meriel-chwedlonol'
  ]);
  assert.deepEqual(graph.getChildren('eurin-chwedlonol').map(person => person.id), ['hyrs-chwedlonol']);

  // Söhne bleiben als Kernmitglieder im matriarchalen Haus (rot), ihre Ehefrauen heiraten ein.
  assert.equal(graph.getPerson('glyndwr-chwedlonol').familyRole, 'core');
  assert.equal(graph.getPerson('eurin-chwedlonol').familyRole, 'core');
  assert.equal(graph.getPerson('kathleen').familyRole, 'married');

  // Arianwen und Kerwin Rhyddid sind mit dem Rhyddid-Stammbaum geteilte Personen.
  const arianwenHere = graph.getPerson('arianwen-chwedlonol');
  const kerwinHere = graph.getPerson('kerwin-rhyddid');
  const arianwenThere = rhyddid.persons.find(person => person.id === 'arianwen-chwedlonol');
  const kerwinThere = rhyddid.persons.find(person => person.id === 'kerwin-rhyddid');
  assert.equal(arianwenHere.worldPersonId, arianwenThere.worldPersonId);
  assert.equal(kerwinHere.worldPersonId, kerwinThere.worldPersonId);
  assert.equal(kerwinHere.portrait, kerwinThere.portrait, 'Kerwins Portrait ist in beiden Stammbäumen dieselbe Datei.');
  assert.equal(arianwenHere.birth, arianwenThere.birth);
  assert.equal(arianwenHere.death, arianwenThere.death);

  const branch = family.cadetBranches[0];
  assert.equal(branch.linkType, 'married-away');
  assert.equal(branch.crestFrame, 'silver');
  assert.equal(branch.parentPartnershipId, 'marriage-arianwen-kerwin');
  assert.equal(branch.targetFamilyId, 'haus-rhyddid');

  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 1);
});

test('liefert für Haus Chwedonol alle belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CHWEDLONOL_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-chwedlonol/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  // Kerwin Rhyddids Portrait wird vom Rhyddid-Stammbaum gehostet und hier nur wiederverwendet.
  assert.equal(Object.keys(HOUSE_CHWEDLONOL_PORTRAITS).length, 26);
  assert.equal(Object.keys(sourceManifest).length, 25);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_CHWEDLONOL_PORTRAITS[personId]));
  assert.equal(HOUSE_CHWEDLONOL_PORTRAITS['kerwin-rhyddid'], 'assets/images/portraits/haus-rhyddid/kerwin-rhyddid.jpg');
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 26);
  assert.equal(placeholderPeople.length, 9);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_CHWEDLONOL_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('bildet Haus Balchder mit Silberrahmen, Hauptlinie und bestehenden Hausverbindungen ab', () => {
  const family = assertValidFamily(HOUSE_BALCHDER_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 38);
  assert.equal(family.partnerships.length, 14);
  assert.equal(family.parentages.length, 23);
  assert.equal(family.cadetBranches.length, 6);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-caedmon-eilonwy');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1648');
  assert.equal(family.view.limitGenerations, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['caedmon-balchder', 'uther-balchder', 'dalvin-balchder']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['avan-balchder', 'armel-balchder', 'owen-balchder']
  );

  assert.deepEqual(graph.getChildren('caedmon-balchder').map(person => person.id).sort(), [
    'bronwen-balchder',
    'trevon-balchder',
    'uther-balchder'
  ]);
  assert.deepEqual(graph.getChildren('uther-balchder').map(person => person.id).sort(), [
    'dalvin-balchder',
    'genofeva-balchder'
  ]);
  assert.deepEqual(graph.getChildren('trevon-balchder').map(person => person.id).sort(), [
    'kimball-balchder',
    'klervi-balchder'
  ]);
  assert.deepEqual(
    graph.getChildren('dalvin-balchder').map(person => person.id).sort(),
    ['aerona-balchder', 'avan-balchder', 'cerrin-balchder', 'kamber-balchder'],
    'Alle vier Kinder Dalvins und Iseults sind erfasst.'
  );
  assert.deepEqual(
    family.parentages
      .filter(parentage => parentage.parentIds.includes('dalvin-balchder'))
      .map(parentage => parentage.childId),
    ['aerona-balchder', 'avan-balchder', 'cerrin-balchder', 'kamber-balchder'],
    'Aerona steht in der Quellenreihenfolge als ausdrücklich ergänzte älteste Tochter an erster Stelle.'
  );
  assert.deepEqual(graph.getChildren('kimball-balchder').map(person => person.id).sort(), [
    'jenelle-balchder',
    'marven-balchder'
  ]);
  assert.deepEqual(graph.getChildren('kamber-balchder').map(person => person.id).sort(), [
    'blodwen-balchder',
    'rice-balchder'
  ]);
  assert.deepEqual(graph.getChildren('jenelle-balchder').map(person => person.id).sort(), [
    'eniana-balchder',
    'jareth-balchder',
    'lynnia-balchder'
  ]);

  const sheevParentage = family.parentages.find(parentage => parentage.childId === 'sheev-gwared');
  assert.equal(sheevParentage.type, 'foster');
  assert.deepEqual(sheevParentage.parentIds, ['avan-balchder']);
  assert.equal(graph.getPerson('sheev-gwared').familyRole, 'ward');
  const sheevMatrixEntries = new Map(buildRelationshipMatrix(family, 'sheev-gwared').sections
    .flatMap(section => section.entries)
    .map(entry => [entry.person.id, entry]));
  assert.ok(sheevMatrixEntries.get('avan-balchder').labels.includes('Vormund'));
  assert.equal(sheevMatrixEntries.has('ronda-rhyddid'), false, 'Ronda wird nicht stillschweigend zu Sheevs Mutter oder Vormund.');

  const branchById = new Map(family.cadetBranches.map(branch => [branch.id, branch]));
  assert.equal(branchById.get('married-away-seldryn-bronwen').targetFamilyId, 'haus-seldryn');
  assert.equal(branchById.get('married-away-seldryn-bronwen').parentPartnershipId, 'marriage-bronwen-lugh');
  assert.equal(branchById.get('married-away-sgrechiwr-aerona').targetFamilyId, 'haus-sgrechiwr');
  assert.equal(branchById.get('married-away-sgrechiwr-aerona').emblem, 'assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png');
  assert.equal(branchById.get('married-away-gwyntog-genofeva').targetFamilyId, 'haus-gwyntog');
  assert.equal(branchById.get('married-away-gwyntog-genofeva').parentPartnershipId, 'marriage-genofeva-alastair');
  assert.equal(branchById.get('married-away-cludwyr-klervi').targetFamilyId, 'haus-cludwyr');
  assert.equal(branchById.get('married-away-cludwyr-klervi').crestFrame, 'silver');
  assert.equal(branchById.get('married-away-barus-cerrin').targetFamilyId, 'haus-barus');
  assert.equal(branchById.get('married-away-barus-cerrin').parentPartnershipId, 'marriage-cerrin-wyett');
  assert.equal(branchById.get('married-away-chwedlonol-marven').targetFamilyId, 'haus-chwedlonol');
  assert.equal(branchById.get('married-away-chwedlonol-marven').crestFrame, 'silver');

  const sharedPeople = [
    [HOUSE_RHYDDID_FAMILY, 'avan-balchder'],
    [HOUSE_RHYDDID_FAMILY, 'ronda-rhyddid'],
    [HOUSE_GELYN_FAMILY, 'kamber-balchder'],
    [HOUSE_GELYN_FAMILY, 'senara-gelyn'],
    [HOUSE_CLUDWYR_FAMILY, 'klervi-balchder'],
    [HOUSE_CLUDWYR_FAMILY, 'rhain-cludwyr'],
    [HOUSE_CHWEDLONOL_FAMILY, 'marven-balchder'],
    [HOUSE_CHWEDLONOL_FAMILY, 'morgaine-chwedlonol']
  ];
  sharedPeople.forEach(([otherFamily, personId]) => {
    const here = family.persons.find(person => person.id === personId);
    const there = otherFamily.persons.find(person => person.id === personId);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} bleibt hausübergreifend dieselbe Weltperson.`);
    assert.equal(here.portrait, there.portrait, `${personId} verwendet hausübergreifend dasselbe Portrait.`);
    assert.equal(here.birth, there.birth, `${personId} verwendet hausübergreifend dasselbe Geburtsjahr.`);
  });
  assert.equal(graph.getPerson('marven-balchder').birth, '1698');
  assert.equal(
    HOUSE_CHWEDLONOL_FAMILY.persons.find(person => person.id === 'marven-balchder').birth,
    '1698',
    'Marvens bisher unbekanntes Geburtsjahr wird in Chwedonol mit der neuen Quelle synchronisiert.'
  );

  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 6);

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['caedmon-balchder']);
  const pendingIds = ['caedmon-balchder'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Balchder-Partner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Balchder alle belegten Portraits lokal oder über kanonische Hausdateien aus', async () => {
  const family = assertValidFamily(HOUSE_BALCHDER_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-balchder/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_BALCHDER_PORTRAITS).length, 31);
  assert.equal(Object.keys(sourceManifest).length, 23);
  assert.equal(picturedPeople.length, 31);
  assert.equal(placeholderPeople.length, 7);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_BALCHDER_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_BALCHDER_PORTRAITS['avan-balchder'], HOUSE_RHYDDID_PORTRAITS['avan-balchder']);
  assert.equal(HOUSE_BALCHDER_PORTRAITS['kamber-balchder'], HOUSE_GELYN_PORTRAITS['kamber-balchder']);
  assert.equal(HOUSE_BALCHDER_PORTRAITS['klervi-balchder'], HOUSE_CLUDWYR_PORTRAITS['klervi-balchder']);
  assert.equal(HOUSE_BALCHDER_PORTRAITS['marven-balchder'], HOUSE_CHWEDLONOL_PORTRAITS['marven-balchder']);

  await Promise.all(Object.entries(HOUSE_BALCHDER_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Balchder-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    const isPng = portrait.toLocaleLowerCase('de').endsWith('.png');
    assert.deepEqual(
      [...image.subarray(0, isPng ? 4 : 3)],
      isPng ? [0x89, 0x50, 0x4e, 0x47] : [0xff, 0xd8, 0xff]
    );
  }));

  await Promise.all([
    'assets/images/houses/Llamreis Ankunft/haus-balchder.png',
    'assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png'
  ].map(async path => {
    const image = await readFile(new URL(`../${path}`, import.meta.url));
    assert.ok(image.length > 100, `${path} ist leer.`);
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('bildet Haus Eneiniog mit unbekannten Ehepartnern, plausiblen Altersstufen und Balchder-Verbindung ab', () => {
  const family = assertValidFamily(HOUSE_ENEINIOG_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 39);
  assert.equal(family.partnerships.length, 14);
  assert.equal(family.parentages.length, 24);
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(graph.getGenerationCount(), 5);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-tyrnog-unknown');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1628');
  assert.equal(family.view.limitGenerations, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-saethwyr');
  assert.equal(family.document.motto, '', 'Die Quelle enthält kein Hausmotto; es wird keines erfunden.');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['tyrnog-eneiniog', 'urien-eneiniog', 'maredog-eneiniog']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['owain-eneiniog', 'meriadog-eneiniog']
  );

  const expectedChildren = new Map([
    ['tyrnog-eneiniog', ['ceridwenog-eneiniog', 'peredur-eneiniog', 'tuduryn-eneiniog', 'urien-eneiniog']],
    ['urien-eneiniog', ['cledwen-eneiniog', 'lywell-eneiniog', 'maredog-eneiniog', 'millena-eneiniog']],
    ['peredur-eneiniog', ['rhiwallon-eneiniog']],
    ['tuduryn-eneiniog', ['nefydd-eneiniog']],
    ['maredog-eneiniog', ['angharad-eneiniog', 'owain-eneiniog']],
    ['cledwen-eneiniog', ['meriadog-eneiniog']],
    ['rhiwallon-eneiniog', ['rhunog-eneiniog']],
    ['nefydd-eneiniog', ['iyvan-eneiniog']],
    ['owain-eneiniog', ['nolwen-eneiniog', 'ygraine-eneiniog']],
    ['meriadog-eneiniog', ['deiniol-eneiniog', 'ieuanor-eneiniog', 'trysten-eneiniog']],
    ['rhunog-eneiniog', ['cynwrig-eneiniog', 'heddwyn-eneiniog']],
    ['iyvan-eneiniog', ['uthrynn-eneiniog', 'wynella-eneiniog']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  const founderParentages = family.parentages.filter(parentage => (
    parentage.partnershipId === 'marriage-tyrnog-unknown'
  ));
  assert.equal(founderParentages.length, 4);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));
  const millenaParentage = family.parentages.find(parentage => parentage.childId === 'millena-eneiniog');
  assert.equal(millenaParentage.type, 'claimed');
  assert.equal(millenaParentage.certainty, 'probable');

  const peopleWithUnknownPartners = [
    'tyrnog-eneiniog',
    'urien-eneiniog',
    'ceridwenog-eneiniog',
    'peredur-eneiniog',
    'tuduryn-eneiniog',
    'maredog-eneiniog',
    'cledwen-eneiniog',
    'rhiwallon-eneiniog',
    'nefydd-eneiniog',
    'owain-eneiniog',
    'meriadog-eneiniog',
    'rhunog-eneiniog',
    'iyvan-eneiniog'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den in der Tabelle vermerkten unbekannten Partner.`);
    assert.equal(partners[0].name, '???');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 13, 'Unbekannte Ehepartner bleiben eigenständige Personen.');
  assert.ok(unknownPartners.every(person => (
    person.birth === '????'
      && person.death === '????'
      && person.status === 'dead'
      && person.familyRole === 'married'
  )));
  assert.equal(graph.getPartners('ceridwenog-eneiniog')[0].sex, 'male');
  assert.equal(graph.getPartners('cledwen-eneiniog')[0].sex, 'male');
  assert.ok(peopleWithUnknownPartners
    .filter(personId => !['ceridwenog-eneiniog', 'cledwen-eneiniog'].includes(personId))
    .every(personId => graph.getPartners(personId)[0].sex === 'female'));

  const unpartneredPeople = [
    'lywell-eneiniog',
    'angharad-eneiniog',
    'ygraine-eneiniog',
    'nolwen-eneiniog',
    'ieuanor-eneiniog',
    'trysten-eneiniog',
    'deiniol-eneiniog',
    'cynwrig-eneiniog',
    'heddwyn-eneiniog',
    'uthrynn-eneiniog',
    'wynella-eneiniog'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));
  assert.equal(graph.getPartners('millena-eneiniog')[0].id, 'uther-balchder');

  const youngestIds = [
    'ygraine-eneiniog',
    'nolwen-eneiniog',
    'ieuanor-eneiniog',
    'trysten-eneiniog',
    'deiniol-eneiniog',
    'cynwrig-eneiniog',
    'heddwyn-eneiniog',
    'uthrynn-eneiniog',
    'wynella-eneiniog'
  ];
  const youngestAges = youngestIds.map(personId => calculateAge(graph.getPerson(personId)));
  assert.deepEqual(youngestAges, [25, 23, 22, 20, 19, 18, 17, 16, 14]);
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  const millenaHere = graph.getPerson('millena-eneiniog');
  const utherHere = graph.getPerson('uther-balchder');
  const millenaThere = HOUSE_BALCHDER_FAMILY.persons.find(person => person.id === 'millena-eneiniog');
  const utherThere = HOUSE_BALCHDER_FAMILY.persons.find(person => person.id === 'uther-balchder');
  [
    [millenaHere, millenaThere],
    [utherHere, utherThere]
  ].forEach(([here, there]) => {
    assert.equal(here.worldPersonId, there.worldPersonId);
    assert.equal(here.birth, there.birth);
    assert.equal(here.death, there.death);
  });
  const millenaMarriage = family.partnerships.find(partnership => partnership.id === 'marriage-uther-millena');
  assert.deepEqual(millenaMarriage.participantIds, ['uther-balchder', 'millena-eneiniog']);
  const balchderBranch = family.cadetBranches[0];
  assert.equal(balchderBranch.linkType, 'married-away');
  assert.equal(balchderBranch.targetFamilyId, 'haus-balchder');
  assert.equal(balchderBranch.parentPartnershipId, 'marriage-uther-millena');
  assert.equal(balchderBranch.crestFrame, 'silver');
  assert.equal(balchderBranch.emblem, 'assets/images/houses/Llamreis Ankunft/haus-balchder.png');

  assert.match(graph.getPerson('peredur-eneiniog').notes, /Priester des Vaters/);
  assert.match(graph.getPerson('lywell-eneiniog').notes, /Eid der Enthaltsamkeit/);
  assert.match(graph.getPerson('angharad-eneiniog').title, /Paladin/);

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 1);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['tyrnog-eneiniog']);
  const pendingIds = ['tyrnog-eneiniog'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Eneiniog-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Eneiniog alle 23 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_ENEINIOG_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-eneiniog/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_ENEINIOG_PORTRAITS).length, 23);
  assert.equal(Object.keys(sourceManifest).length, 23);
  assert.equal(picturedPeople.length, 23);
  assert.equal(placeholderPeople.length, 16);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_ENEINIOG_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  ['ceridwenog-eneiniog', 'millena-eneiniog', 'uther-balchder'].forEach(personId => {
    assert.equal(family.persons.find(person => person.id === personId).portrait, '');
  });

  await Promise.all(Object.entries(HOUSE_ENEINIOG_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Eneiniog-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-eneiniog.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet Haus Gostyn mit Gründerlücke, allen belegten Ehen und der Erbfolge ab', () => {
  const family = assertValidFamily(HOUSE_GOSTYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 32);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 0);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(graph.getGenerationCount(), 5);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-roderic-ffion');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1642');
  assert.equal(family.view.limitGenerations, false);
  assert.equal(family.view.ancestorDepth, 50);
  assert.equal(family.view.descendantDepth, 50);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gafyr');
  assert.deepEqual(family.document.houseProfile.secondarySeats, ['Bronfelen']);
  assert.equal(family.document.motto, 'Wer dient, steht höher als er glaubt.');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 1);
  assert.equal(family.extensions.houseLore.knightFather, 'Egon Gafyr (historisch, irgendwann zwischen 1300 und 1500)');

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['roderic-gostyn', 'coel-gostyn', 'eifion-gostyn']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['gruffydd-gostyn', 'heddwyn-gostyn']
  );

  const expectedChildren = new Map([
    ['roderic-gostyn', ['cadoc-gostyn', 'coel-gostyn', 'non-gostyn']],
    ['coel-gostyn', ['eifion-gostyn', 'haf-gostyn']],
    ['cadoc-gostyn', ['derfel-gostyn']],
    ['eifion-gostyn', ['amlyn-gostyn', 'gruffydd-gostyn', 'nest-gostyn']],
    ['derfel-gostyn', ['barri-gostyn', 'deiniol-gostyn']],
    ['gruffydd-gostyn', ['heddwyn-gostyn', 'saeth-gostyn']],
    ['amlyn-gostyn', ['clydno-gostyn', 'eurig-gostyn']],
    ['barri-gostyn', ['garmon-gostyn', 'illtud-gostyn']],
    ['deiniol-gostyn', ['lola-gostyn', 'math-gostyn']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  const founderParentages = family.parentages.filter(parentage => (
    parentage.partnershipId === 'marriage-roderic-ffion'
  ));
  assert.equal(founderParentages.length, 3);
  assert.ok(founderParentages.every(parentage => (
    parentage.type === 'claimed' && parentage.certainty === 'probable'
  )));

  const peopleWithUnknownPartners = [
    'coel-gostyn',
    'non-gostyn',
    'cadoc-gostyn',
    'eifion-gostyn',
    'haf-gostyn',
    'derfel-gostyn',
    'gruffydd-gostyn',
    'nest-gostyn',
    'amlyn-gostyn',
    'barri-gostyn',
    'deiniol-gostyn'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den in der Tabelle vermerkten unbekannten Partner.`);
    assert.equal(partners[0].name, '???');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 11);
  assert.ok(unknownPartners.every(person => (
    person.birth === '????'
      && person.death === '????'
      && person.status === 'dead'
      && person.familyRole === 'married'
      && person.notes === 'Name und Lebensdaten sind nicht überliefert.'
  )));
  ['non-gostyn', 'haf-gostyn', 'nest-gostyn'].forEach(personId => {
    assert.equal(graph.getPartners(personId)[0].sex, 'male');
  });
  peopleWithUnknownPartners
    .filter(personId => !['non-gostyn', 'haf-gostyn', 'nest-gostyn'].includes(personId))
    .forEach(personId => assert.equal(graph.getPartners(personId)[0].sex, 'female'));

  assert.equal(graph.getPartners('roderic-gostyn')[0].id, 'ffion-muellerstochter');
  const unpartneredPeople = [
    'heddwyn-gostyn',
    'saeth-gostyn',
    'clydno-gostyn',
    'eurig-gostyn',
    'garmon-gostyn',
    'illtud-gostyn',
    'math-gostyn',
    'lola-gostyn'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  assert.equal(graph.getPerson('eifion-gostyn').birth, '1667');
  assert.equal(graph.getPerson('eifion-gostyn').status, 'alive');
  assert.equal(calculateAge(graph.getPerson('eifion-gostyn')), 73);
  assert.equal(calculateAge(graph.getPerson('math-gostyn')), 10);
  assert.equal(calculateAge(graph.getPerson('lola-gostyn')), 8);
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  assert.match(graph.getPerson('coel-gostyn').notes, /Großen Krieg/);
  assert.match(graph.getPerson('eifion-gostyn').title, /Lehnswart von Bronfelen/);
  assert.match(graph.getPerson('derfel-gostyn').title, /Hauptmann von Bronfelen/);
  assert.match(graph.getPerson('clydno-gostyn').notes, /Llanforwyn/);
  assert.match(graph.getPerson('lola-gostyn').notes, /Grauen Weite/);
  assert.equal(family.persons.some(person => person.id === 'egon-gafyr'), false, 'Der historische Rittervater wird nicht mit dem Almanach-Egon gleichgesetzt.');

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 0);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['roderic-gostyn']);
  const pendingIds = ['roderic-gostyn'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Gostyn-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Gostyn alle 18 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GOSTYN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gostyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_GOSTYN_PORTRAITS).length, 18);
  assert.equal(Object.keys(sourceManifest).length, 18);
  assert.equal(picturedPeople.length, 18);
  assert.equal(placeholderPeople.length, 14);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_GOSTYN_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  ['ffion-muellerstochter', 'non-gostyn', 'haf-gostyn'].forEach(personId => {
    assert.equal(family.persons.find(person => person.id === personId).portrait, '');
  });

  await Promise.all(Object.entries(HOUSE_GOSTYN_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Gostyn-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-gostyn.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das Ritterherrenhaus Awenydd mit Überlieferungslücke und rückwirkend berechneten Altersabständen ab', () => {
  const family = assertValidFamily(HOUSE_AWENYDD_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 34);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 21);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-aeddan-alis');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1640');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.persons.some(person => person.id === 'iestyn-awenydd'), false, 'Iestyn war ein Bildhash-Fehler der Quelle (Rhiwallons Portrait unter fremdem Namen) und wurde entfernt.');

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['aeddan-awenydd', 'colwyn-awenydd', 'derfel-awenydd']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['gildas-awenydd']
  );

  assert.equal(graph.getPerson('aeddan-awenydd').title, 'Begründer des Ritterherrenhauses Awenydd');
  assert.equal(graph.getPerson('derfel-awenydd').title, 'Ritterherr des Hauses Awenydd');
  assert.equal(graph.getPerson('hafgan-awenydd').status, 'missing');

  const expectedChildren = new Map([
    ['aeddan-awenydd', ['brynna-awenydd', 'colwyn-awenydd', 'selwyn-awenydd']],
    ['colwyn-awenydd', ['derfel-awenydd', 'eleri-awenydd']],
    ['selwyn-awenydd', ['hafgan-awenydd']],
    ['derfel-awenydd', ['delyth-awenydd', 'gildas-awenydd', 'gwern-awenydd', 'idnerth-awenydd']],
    ['hafgan-awenydd', ['brychan-awenydd']],
    ['gildas-awenydd', ['hafren-awenydd', 'orlaith-awenydd', 'rhiwallon-awenydd']],
    ['idnerth-awenydd', ['amren-awenydd', 'arthen-awenydd']],
    ['gwern-awenydd', ['beliad-awenydd', 'rhosyn-awenydd', 'ysolt-awenydd']],
    ['brychan-awenydd', ['bors-awenydd', 'ludd-awenydd']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-aeddan-alis');
  assert.equal(founderParentages.length, 3);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  // Rückwirkend berechnete Altersabstände zwischen Eltern und Kindern bleiben plausibel.
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  // Arthens ausdrücklich genannte vierzehn Lebensjahre verankern die geschätzten Geburtsjahre der jüngsten Generation.
  assert.equal(calculateAge(graph.getPerson('arthen-awenydd')), 14);

  const peopleWithUnknownPartners = [
    'aeddan-awenydd', 'colwyn-awenydd', 'brynna-awenydd', 'selwyn-awenydd',
    'derfel-awenydd', 'eleri-awenydd', 'hafgan-awenydd', 'gildas-awenydd',
    'idnerth-awenydd', 'gwern-awenydd'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 10);

  assert.equal(graph.getPartners('delyth-awenydd')[0].id, 'ruarc-balguen');
  assert.equal(graph.getPartners('brychan-awenydd')[0].id, 'rhoswyn-penwyn');
  const unpartneredPeople = [
    'rhiwallon-awenydd', 'hafren-awenydd', 'orlaith-awenydd',
    'amren-awenydd', 'arthen-awenydd', 'beliad-awenydd', 'rhosyn-awenydd',
    'ysolt-awenydd', 'bors-awenydd', 'ludd-awenydd'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  // Die drei verheirateten Awenydd-Töchter (Delyth, Brynna, Eleri) sind wegverheiratet;
  // ihre Brüder und Väter bleiben im Haus, ihre Ehefrauen heiraten ohne Herkunftshaus-Medaillon ein.
  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  assert.equal(branchByPartnership.get('marriage-delyth-ruarc').name, 'Haus Balguen');
  assert.equal(branchByPartnership.get('marriage-delyth-ruarc').targetFamilyId, 'haus-balguen');
  assert.equal(branchByPartnership.get('marriage-brynna-spouse').name, 'Unbekanntes Haus');
  assert.equal(branchByPartnership.get('marriage-eleri-spouse').name, 'Unbekanntes Haus');
  assert.ok(family.cadetBranches.every(branch => branch.linkType === 'married-away' && branch.crestFrame === 'gold'));

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 3);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['aeddan-awenydd']);
  const pendingIds = ['aeddan-awenydd'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Awenydd-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Awenydd alle 23 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_AWENYDD_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-awenydd/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_AWENYDD_PORTRAITS).length, 23);
  assert.equal(Object.keys(sourceManifest).length, 23);
  assert.equal(picturedPeople.length, 23);
  assert.equal(placeholderPeople.length, 11);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_AWENYDD_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  // Brynna bleibt trotz Namensnennung ohne Portrait (nur ein Platzhalterbild in der Quelle).
  assert.equal(family.persons.find(person => person.id === 'brynna-awenydd').portrait, '');

  await Promise.all(Object.entries(HOUSE_AWENYDD_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Awenydd-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-awenydd.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das ältere Ritterherrenhaus Awenor mit rückwirkend berechneten Altersabständen ab', () => {
  const family = assertValidFamily(HOUSE_AWENOR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 34);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 21);
  assert.equal(family.cadetBranches.length, 4);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-aergol-spouse');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1640');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['aergol-awenor', 'glynfael-awenor', 'ffraid-awenor']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['derwain-awenor', 'urfael-awenor', 'isgar-awenor']
  );

  assert.equal(graph.getPerson('aergol-awenor').title, 'Begründer des Ritterherrenhauses Awenor');
  assert.equal(graph.getPerson('ffraid-awenor').title, 'Ritterherr des Hauses Awenor');
  assert.equal(graph.getPerson('aergol-awenor').status, 'dead');
  assert.equal(graph.getPerson('ffraid-awenor').status, 'alive');

  const expectedChildren = new Map([
    ['aergol-awenor', ['creirwen-awenor', 'enidwen-awenor', 'glynfael-awenor', 'gwylan-awenor', 'heulwen-awenor']],
    ['glynfael-awenor', ['ffraid-awenor', 'gethor-awenor']],
    ['gwylan-awenor', ['gwaeron-awenor']],
    ['ffraid-awenor', ['derwain-awenor', 'nerwen-awenor']],
    ['gethor-awenor', ['garan-1695-awenor']],
    ['gwaeron-awenor', ['rhyd-awenor', 'rhys-awenor']],
    ['garan-1695-awenor', ['cochan-awenor', 'elfael-awenor', 'telyn-awenor']],
    ['derwain-awenor', ['briallen-awenor', 'carys-awenor', 'erydd-awenor', 'isgar-awenor', 'urfael-awenor']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  // Gwaeron ist in der Quelltabelle uneinheitlich beschriftet (einmal fälschlich „Garan“ neben
  // Glynfaels Söhnen), gehört aber laut den Ehe-/Kinder-Kopfzeilen zu Gwylan, nicht zu Glynfael.
  // Der echte Garan (Gethors Sohn) ist eine eigenständige, unabhängige Person.
  assert.equal(graph.getPerson('gwaeron-awenor').name, 'Gwaeron Awenor');
  assert.equal(graph.getPerson('gwaeron-awenor').birth, '1680');
  assert.equal(graph.getPerson('garan-1695-awenor').name, 'Garan Awenor');
  assert.equal(graph.getPerson('garan-1695-awenor').birth, '1695');
  assert.notEqual(graph.getPerson('gwaeron-awenor').worldPersonId, graph.getPerson('garan-1695-awenor').worldPersonId);

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-aergol-spouse');
  assert.equal(founderParentages.length, 5);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  // Rückwirkend berechnete Altersabstände zwischen Eltern und Kindern bleiben plausibel.
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  // Rhyd und Rhys sind die einzige in der Quelle fest datierte Generation (1705).
  assert.equal(graph.getPerson('rhyd-awenor').birth, '1705');
  assert.equal(graph.getPerson('rhys-awenor').birth, '1705');
  assert.equal(calculateAge(graph.getPerson('rhyd-awenor')), 35);
  assert.match(graph.getPerson('rhyd-awenor').notes, /Myrddin/);
  assert.match(graph.getPerson('rhys-awenor').notes, /Myrddin/);

  const peopleWithUnknownPartners = [
    'aergol-awenor', 'glynfael-awenor', 'heulwen-awenor', 'enidwen-awenor', 'creirwen-awenor',
    'gwylan-awenor', 'ffraid-awenor', 'gethor-awenor', 'gwaeron-awenor',
    'derwain-awenor', 'nerwen-awenor', 'garan-1695-awenor'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 12);

  const unpartneredPeople = [
    'rhyd-awenor', 'rhys-awenor', 'elfael-awenor', 'telyn-awenor', 'cochan-awenor',
    'urfael-awenor', 'briallen-awenor', 'isgar-awenor', 'erydd-awenor', 'carys-awenor'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  // Heulwen, Enidwen, Creirwen und Nerwen sind an ein unbekanntes Zielhaus wegverheiratet.
  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  ['marriage-heulwen-spouse', 'marriage-enidwen-spouse', 'marriage-creirwen-spouse', 'marriage-nerwen-spouse'].forEach(partnershipId => {
    const branch = branchByPartnership.get(partnershipId);
    assert.equal(branch.name, 'Unbekanntes Haus');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 4);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['aergol-awenor']);
  const pendingIds = ['aergol-awenor'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Awenor-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Awenor alle 19 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_AWENOR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-awenor/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_AWENOR_PORTRAITS).length, 19);
  assert.equal(Object.keys(sourceManifest).length, 19);
  assert.equal(picturedPeople.length, 19);
  assert.equal(placeholderPeople.length, 15);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_AWENOR_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  // Heulwen, Enidwen und Creirwen bleiben trotz Namensnennung ohne Portrait (geteiltes Platzhalterbild in der Quelle).
  ['heulwen-awenor', 'enidwen-awenor', 'creirwen-awenor'].forEach(personId => {
    assert.equal(family.persons.find(person => person.id === personId).portrait, '');
  });

  await Promise.all(Object.entries(HOUSE_AWENOR_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Awenor-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-awenor.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das wohlhabende Ritterherrenhaus Loer mit namensgleichen Glenys-Schwestern ab', () => {
  const family = assertValidFamily(HOUSE_LOER_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 28);
  assert.equal(family.partnerships.length, 10);
  assert.equal(family.parentages.length, 17);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-cadfarch-spouse');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1639');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  // Die Quelle nennt Haus Wyrm als Lehnsherrn (nicht Draig, wie zuvor im Register verzeichnet).
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-wyrm');

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['cadfarch-loer', 'maddocc-loer', 'eurgain-loer']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['ynyrion-loer', 'aeron-loer']
  );

  assert.equal(graph.getPerson('cadfarch-loer').title, 'Begründer des Ritterherrenhauses Loer');
  assert.equal(graph.getPerson('eurgain-loer').title, 'Ritterherr des Hauses Loer');
  assert.equal(graph.getPerson('cadfarch-loer').status, 'dead');
  assert.equal(graph.getPerson('eurgain-loer').status, 'alive');
  assert.equal(graph.getPerson('eurgain-loer').sex, 'male');
  // Olwen und Eurgain sind traditionell weibliche/männliche walisische Namen, hier aber laut
  // Portrait und Fließtext umgekehrt besetzt — Portrait/Grammatik entscheiden, nicht der Name.
  assert.equal(graph.getPerson('olwen-loer').sex, 'female');

  const expectedChildren = new Map([
    ['cadfarch-loer', ['maddocc-loer', 'rhiannedd-loer']],
    ['maddocc-loer', ['dwynarth-loer', 'eurgain-loer', 'glenys-1667-loer']],
    ['eurgain-loer', ['gwynan-loer', 'ynyrion-loer']],
    ['dwynarth-loer', ['garmon-loer', 'glenys-1695-loer']],
    ['ynyrion-loer', ['aeron-loer', 'gwallter-loer', 'gwion-loer', 'olwen-loer']],
    ['gwynan-loer', ['gwenfaen-loer', 'islwyna-loer']],
    ['garmon-loer', ['tesni-loer', 'tyne-loer']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  // Glenys, die Schwester Eurgains und Dwynarths, und Glenys, Dwynarths eigene Tochter, sind
  // namensgleich über eine Generation hinweg — kein Fehler, sondern über die ID disambiguiert.
  assert.equal(graph.getPerson('glenys-1667-loer').name, 'Glenys Loer');
  assert.equal(graph.getPerson('glenys-1695-loer').name, 'Glenys Loer');
  assert.equal(graph.getPerson('glenys-1667-loer').birth, '1667');
  assert.equal(graph.getPerson('glenys-1695-loer').birth, '1695');
  assert.notEqual(graph.getPerson('glenys-1667-loer').worldPersonId, graph.getPerson('glenys-1695-loer').worldPersonId);

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-cadfarch-spouse');
  assert.equal(founderParentages.length, 2);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  // Rückwirkend berechnete Altersabstände zwischen Eltern und Kindern bleiben plausibel.
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  const peopleWithUnknownPartners = [
    'cadfarch-loer', 'maddocc-loer', 'rhiannedd-loer', 'eurgain-loer', 'glenys-1667-loer',
    'dwynarth-loer', 'ynyrion-loer', 'gwynan-loer', 'garmon-loer', 'glenys-1695-loer'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 10);

  const unpartneredPeople = [
    'aeron-loer', 'gwallter-loer', 'gwion-loer', 'olwen-loer',
    'gwenfaen-loer', 'tyne-loer', 'islwyna-loer', 'tesni-loer'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  // Rhiannedd (Gründerskind) sowie beide Glenys (Eurgains/Dwynarths Schwester und Dwynarths Tochter)
  // sind an ein unbekanntes Zielhaus wegverheiratet.
  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  ['marriage-rhiannedd-spouse', 'marriage-glenys-1667-spouse', 'marriage-glenys-1695-spouse'].forEach(partnershipId => {
    const branch = branchByPartnership.get(partnershipId);
    assert.equal(branch.name, 'Unbekanntes Haus');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 3);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['cadfarch-loer']);
  const pendingIds = ['cadfarch-loer'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Loer-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Loer alle 14 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_LOER_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-loer/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_LOER_PORTRAITS).length, 14);
  assert.equal(Object.keys(sourceManifest).length, 14);
  assert.equal(picturedPeople.length, 14);
  assert.equal(placeholderPeople.length, 14);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_LOER_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  // Begründer, seine Kinder und die ältere Glenys bleiben trotz Namensnennung ohne Portrait
  // (nur Platzhalterbilder in der Quelle).
  ['cadfarch-loer', 'maddocc-loer', 'rhiannedd-loer', 'glenys-1667-loer'].forEach(personId => {
    assert.equal(family.persons.find(person => person.id === personId).portrait, '');
  });

  await Promise.all(Object.entries(HOUSE_LOER_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Loer-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-loer.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das Ritterherrenhaus Garrael mit ausdrücklich benannten Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_GARRAEL_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 23);
  assert.equal(family.partnerships.length, 8);
  assert.equal(family.parentages.length, 14);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-aledd-spouse');
  assert.equal(family.lineage.crestFrame, 'silver', 'Ritterherrenhäuser führen den silbernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1663');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.document.houseProfile.liegeHouseName, 'Haus Draig');
  // Garrael sitzt abseits der übrigen niederen Ritterhäuser in einer eigenen Orts-Hierarchie.
  assert.deepEqual(
    createFolderPathFromHouseProfile(family.document.houseProfile),
    ['Cenyr', 'Celtigerns Wacht', 'Camruisge', 'Aberllan']
  );
  assert.match(family.document.houseProfile.regionEmblems.barony, /^assets\/images\/regions\//);
  assert.match(family.document.houseProfile.regionEmblems.seat, /^assets\/images\/regions\//);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['aledd-garrael', 'lyonnel-garrael']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['uther-garrael']
  );

  assert.equal(graph.getPerson('aledd-garrael').title, 'Begründer des Ritterherrenhauses Garrael');
  assert.equal(graph.getPerson('lyonnel-garrael').title, 'Ritterherr des Hauses Garrael');
  assert.equal(graph.getPerson('aledd-garrael').status, 'dead');
  assert.equal(graph.getPerson('lyonnel-garrael').status, 'alive');

  const expectedChildren = new Map([
    ['aledd-garrael', ['bedwyr-garrael', 'carys-garrael', 'lyonnel-garrael']],
    ['lyonnel-garrael', ['eithne-garrael', 'uther-garrael']],
    ['bedwyr-garrael', ['elain-garrael', 'gavin-garrael']],
    ['uther-garrael', ['emyr-garrael', 'gareth-garrael', 'heledd-garrael', 'lowri-garrael', 'megan-garrael']],
    ['gavin-garrael', ['jac-garrael', 'marc-garrael']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-aledd-spouse');
  assert.equal(founderParentages.length, 3);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  // Rückwirkend berechnete Altersabstände zwischen Eltern und Kindern bleiben plausibel.
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  const peopleWithUnknownPartners = [
    'aledd-garrael', 'lyonnel-garrael', 'carys-garrael', 'bedwyr-garrael',
    'uther-garrael', 'eithne-garrael', 'elain-garrael', 'gavin-garrael'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 8);

  // Uthers Kinder sind noch unverlobt und unverheiratet, keine Platzhalter-Ehepartner.
  const unpartneredPeople = ['emyr-garrael', 'lowri-garrael', 'megan-garrael', 'gareth-garrael', 'heledd-garrael', 'jac-garrael', 'marc-garrael'];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  // Carys, Eithne und Elain sind laut Quelle ausdrücklich „wegverheiratet an" ein unbekanntes Haus.
  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  ['marriage-carys-spouse', 'marriage-eithne-spouse', 'marriage-elain-spouse'].forEach(partnershipId => {
    const branch = branchByPartnership.get(partnershipId);
    assert.equal(branch.name, 'Unbekanntes Haus');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 3);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/, 'Der Wappenknoten nutzt den Silberrahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['aledd-garrael']);
  const pendingIds = ['aledd-garrael'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Garrael-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Garrael alle 15 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GARRAEL_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-garrael/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_GARRAEL_PORTRAITS).length, 15);
  assert.equal(Object.keys(sourceManifest).length, 15);
  assert.equal(picturedPeople.length, 15);
  assert.equal(placeholderPeople.length, 8);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_GARRAEL_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_GARRAEL_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Garrael-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Camruisge/haus-garrael.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);

  const camruisgeBanner = await readFile(new URL('../assets/images/regions/camruisge.png', import.meta.url));
  assert.ok(camruisgeBanner.length > 100);
  assert.deepEqual([...camruisgeBanner.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das bürgerliche Haus Gwyllach mit wechselnder Kopfschaft und vier Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_GWYLLACH_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 33);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 4);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-maelgoran-spouse');
  assert.equal(family.lineage.crestFrame, 'iron', 'Bürgerliche Häuser führen den eisernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1627');
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.document.houseProfile.liegeHouseName, 'Haus Draig');
  // Gwyllach ist bürgerlich (kein Rittergeschlecht) und sitzt außerhalb der
  // LOWER_KNIGHT_HOUSE_DEFINITIONS, nutzt aber deren generischen Gwynthor-Sitz.
  assert.deepEqual(
    createFolderPathFromHouseProfile(family.document.houseProfile),
    ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  );

  // Bürgerliche Erbfolge nach Eignung statt Erstgeburt: die Kette reicht laut User-Vorgabe
  // über den amtierenden Rhovan hinaus bis zu den vorgesehenen Erben Drystan und Meirion.
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    [
      'maelgoran-gwyllach', 'tewrig-gwyllach', 'odrith-gwyllach', 'rhydderch-gwyllach',
      'rhovan-gwyllach', 'drystan-gwyllach', 'meirion-gwyllach'
    ]
  );

  assert.equal(graph.getPerson('maelgoran-gwyllach').title, 'Begründer des bürgerlichen Hauses Gwyllach');
  assert.equal(graph.getPerson('rhovan-gwyllach').title, 'Oberhaupt des Hauses Gwyllach');
  assert.equal(graph.getPerson('drystan-gwyllach').title, 'Vorgesehener Erbe des Hauses Gwyllach');
  assert.equal(graph.getPerson('meirion-gwyllach').title, 'Zweiter Erbe des Hauses Gwyllach');
  assert.equal(graph.getPerson('maelgoran-gwyllach').status, 'dead');
  assert.equal(graph.getPerson('rhovan-gwyllach').status, 'alive');
  assert.equal(graph.getPerson('drystan-gwyllach').status, 'alive');
  assert.equal(graph.getPerson('meirion-gwyllach').status, 'alive');

  // Die Kopfschaft wechselt zwischen Tewrigs und Odriths Linien (Rhydderch/Rhovan sind Cousins).
  const expectedChildren = new Map([
    ['maelgoran-gwyllach', ['odrith-gwyllach', 'tewrig-gwyllach', 'unbekannte-tochter-gwyllach']],
    ['tewrig-gwyllach', ['mablen-gwyllach', 'rhydderch-gwyllach']],
    ['odrith-gwyllach', ['rhovan-gwyllach']],
    ['rhydderch-gwyllach', ['efael-gwyllach', 'meredydd-gwyllach', 'talaneth-gwyllach']],
    ['rhovan-gwyllach', ['anelen-gwyllach', 'drystan-gwyllach']],
    ['efael-gwyllach', ['meirawen-gwyllach', 'morwella-gwyllach']],
    ['meredydd-gwyllach', ['saerwyn-gwyllach', 'talyfer-gwyllach']],
    ['drystan-gwyllach', ['eryndor-gwyllach', 'liora-gwyllach', 'meirion-gwyllach', 'olyndor-gwyllach', 'rhufaed-gwyllach']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-maelgoran-spouse');
  assert.equal(founderParentages.length, 3);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  // Rückwirkend/vorwärts berechnete Altersabstände zu den drei überlieferten Ankerjahren bleiben plausibel.
  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  const peopleWithUnknownPartners = [
    'tewrig-gwyllach', 'unbekannte-tochter-gwyllach', 'odrith-gwyllach', 'rhydderch-gwyllach',
    'mablen-gwyllach', 'rhovan-gwyllach', 'efael-gwyllach', 'talaneth-gwyllach',
    'meredydd-gwyllach', 'drystan-gwyllach', 'anelen-gwyllach'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 11);

  // Cyrelle (Maelgorans Frau) ist namentlich überliefert, bleibt aber ohne Portrait.
  const cyrelle = graph.getPerson('cyrelle-gwyllach');
  assert.equal(cyrelle.status, 'dead');
  assert.equal(cyrelle.portrait, '');

  // Jüngste Generation ist noch gänzlich unverpartnert.
  const unpartneredPeople = [
    'meirawen-gwyllach', 'morwella-gwyllach', 'talyfer-gwyllach', 'saerwyn-gwyllach',
    'meirion-gwyllach', 'olyndor-gwyllach', 'rhufaed-gwyllach', 'eryndor-gwyllach', 'liora-gwyllach'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  // Vier kinderlose Kernfrauen mit unbenanntem Partner gelten als wegverheiratet.
  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  ['marriage-tochter-spouse', 'marriage-mablen-spouse', 'marriage-talaneth-spouse', 'marriage-anelen-spouse'].forEach(partnershipId => {
    const branch = branchByPartnership.get(partnershipId);
    assert.equal(branch.name, 'Unbekanntes Haus');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 4);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-iron\.png$/, 'Der Wappenknoten nutzt den eisernen Rahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['maelgoran-gwyllach']);
  const pendingIds = ['maelgoran-gwyllach'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Gwyllach-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Gwyllach alle 19 belegten Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GWYLLACH_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gwyllach/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_GWYLLACH_PORTRAITS).length, 19);
  assert.equal(Object.keys(sourceManifest).length, 19);
  assert.equal(picturedPeople.length, 19);
  assert.equal(placeholderPeople.length, 14);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_GWYLLACH_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_GWYLLACH_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Gwyllach-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-gwyllach.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
});

test('bildet das bürgerliche Haus Sgrechiwr aus Lynthor mit fünfstufiger Erbfolge nach Eignung ab', () => {
  const family = assertValidFamily(HOUSE_SGRECHIWR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 32);
  assert.equal(family.partnerships.length, 11);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-emrys-spouse');
  assert.equal(family.lineage.crestFrame, 'iron', 'Bürgerliche Häuser führen den eisernen Wappenrahmen.');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.fromYear, '????');
  assert.equal(family.lineage.timeGap.toYear, '1638');
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.document.houseProfile.liegeHouseName, 'Haus Draig');
  // Sgrechiwr sitzt mit dem eigenen Sitz Lynthor abseits des generischen Gwynthor-Pfades.
  assert.deepEqual(
    createFolderPathFromHouseProfile(family.document.houseProfile),
    ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Lynthor']
  );

  // Bürgerliche Erbfolge nach Eignung statt Erstgeburt: die Kette reicht vom Begründer über
  // den amtierenden Gareth hinaus bis zu den vorgesehenen Erben Brân und Cadell (User-Vorgabe).
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    [
      'emrys-sgrechiwr', 'dafydd-sgrechiwr', 'gareth-sgrechiwr', 'cadogan-sgrechiwr',
      'colwyn-sgrechiwr', 'godwyn-sgrechiwr', 'bran-sgrechiwr', 'cadell-sgrechiwr'
    ]
  );

  assert.equal(graph.getPerson('emrys-sgrechiwr').title, 'Begründer des bürgerlichen Hauses Sgrechiwr');
  assert.equal(graph.getPerson('gareth-sgrechiwr').title, 'Oberhaupt des Hauses Sgrechiwr');
  assert.equal(graph.getPerson('cadell-sgrechiwr').title, 'Fünfter Erbe des Hauses Sgrechiwr');
  assert.equal(graph.getPerson('emrys-sgrechiwr').status, 'dead');
  assert.equal(graph.getPerson('gareth-sgrechiwr').status, 'alive');
  assert.equal(graph.getPerson('colwyn-sgrechiwr').status, 'alive');

  const expectedChildren = new Map([
    ['emrys-sgrechiwr', ['dafydd-sgrechiwr', 'rhisiart-sgrechiwr', 'wenna-sgrechiwr']],
    ['dafydd-sgrechiwr', ['gareth-sgrechiwr', 'seren-sgrechiwr']],
    ['rhisiart-sgrechiwr', ['gerallt-sgrechiwr']],
    ['gareth-sgrechiwr', ['cadogan-sgrechiwr', 'colwyn-sgrechiwr', 'fflur-sgrechiwr']],
    ['gerallt-sgrechiwr', ['amlodd-sgrechiwr', 'godwyn-sgrechiwr']],
    ['cadogan-sgrechiwr', ['eluned-sgrechiwr', 'meinwen-sgrechiwr']],
    ['amlodd-sgrechiwr', ['angwen-sgrechiwr', 'euros-sgrechiwr']],
    ['godwyn-sgrechiwr', ['arial-sgrechiwr', 'bran-sgrechiwr', 'cadell-sgrechiwr', 'dylis-sgrechiwr', 'eirwen-sgrechiwr']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(graph.getChildren(personId).map(person => person.id).sort(), childIds);
  });

  // Colwyn bleibt laut ausdrücklicher Überlieferung unverheiratet und kinderlos, obwohl er
  // in der Erbfolge steht.
  assert.equal(graph.getPartners('colwyn-sgrechiwr').length, 0);
  assert.equal(graph.getChildren('colwyn-sgrechiwr').length, 0);

  const founderParentages = family.parentages.filter(parentage => parentage.partnershipId === 'marriage-emrys-spouse');
  assert.equal(founderParentages.length, 3);
  assert.ok(founderParentages.every(parentage => parentage.type === 'claimed' && parentage.certainty === 'probable'));

  family.parentages.forEach(parentage => {
    const childBirth = Number(graph.getPerson(parentage.childId)?.birth);
    if (!Number.isInteger(childBirth)) return;
    parentage.parentIds.forEach(parentId => {
      const parentBirth = Number(graph.getPerson(parentId)?.birth);
      if (!Number.isInteger(parentBirth)) return;
      const ageAtBirth = childBirth - parentBirth;
      assert.ok(ageAtBirth >= 18 && ageAtBirth <= 55, `${parentId} besitzt ein plausibles Alter bei der Geburt von ${parentage.childId}.`);
    });
  });

  const peopleWithUnknownPartners = [
    'dafydd-sgrechiwr', 'wenna-sgrechiwr', 'rhisiart-sgrechiwr', 'gareth-sgrechiwr',
    'seren-sgrechiwr', 'gerallt-sgrechiwr', 'cadogan-sgrechiwr', 'fflur-sgrechiwr', 'amlodd-sgrechiwr'
  ];
  const unknownPartners = peopleWithUnknownPartners.map(personId => {
    const partners = graph.getPartners(personId);
    assert.equal(partners.length, 1, `${personId} besitzt genau den unbeschrifteten Partner aus der Quelltabelle.`);
    assert.equal(partners[0].status, 'unknown');
    assert.equal(partners[0].familyRole, 'married');
    return partners[0];
  });
  assert.equal(new Set(unknownPartners.map(person => person.id)).size, 9);

  // Godwyn ist mit Aerona Balchder verheiratet, die bereits in Haus Balchders eigener Akte
  // als Tochter Dalvins geführt wird (geteilte Person, Cludwyr/Rhyddid-Godwyn-Muster); ihr
  // dort bereits hinterlegtes Portrait wird hier per Import wiederverwendet.
  const aerona = graph.getPerson('aerona-balchder');
  assert.equal(aerona.houseId, 'house-balchder');
  assert.equal(aerona.portrait, HOUSE_BALCHDER_PORTRAITS['aerona-balchder']);
  assert.ok(aerona.portrait);

  const unpartneredPeople = [
    'eluned-sgrechiwr', 'meinwen-sgrechiwr', 'euros-sgrechiwr', 'angwen-sgrechiwr',
    'eirwen-sgrechiwr', 'dylis-sgrechiwr', 'bran-sgrechiwr', 'arial-sgrechiwr', 'cadell-sgrechiwr'
  ];
  assert.ok(unpartneredPeople.every(personId => graph.getPartners(personId).length === 0));

  const branchByPartnership = new Map(family.cadetBranches.map(branch => [branch.parentPartnershipId, branch]));
  ['marriage-wenna-spouse', 'marriage-seren-spouse', 'marriage-fflur-spouse'].forEach(partnershipId => {
    const branch = branchByPartnership.get(partnershipId);
    assert.equal(branch.name, 'Unbekanntes Haus');
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'time-gap').length, 1);
  assert.equal(converted.data.filter(entry => entry.data.nodeKind === 'cadet-house').length, 3);
  const crest = converted.data.find(entry => entry.data.nodeKind === 'house-crest');
  assert.match(crest.data.crestFrameAsset, /crest-iron\.png$/, 'Der Wappenknoten nutzt den eisernen Rahmen.');

  const chartById = new Map(converted.data.map(entry => [entry.id, entry]));
  const connectedIds = new Set(['emrys-sgrechiwr']);
  const pendingIds = ['emrys-sgrechiwr'];
  while (pendingIds.length) {
    const entry = chartById.get(pendingIds.shift());
    assert.ok(entry, 'Jeder verknüpfte Sgrechiwr-Knoten ist im Diagramm vorhanden.');
    [...entry.rels.parents, ...entry.rels.spouses, ...entry.rels.children].forEach(personId => {
      if (connectedIds.has(personId)) return;
      connectedIds.add(personId);
      pendingIds.push(personId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Kein Ehepartner oder Hausknoten darf als getrennte Insel verborgen bleiben.');
});

test('liefert für Haus Sgrechiwr alle 16 lokalen und 1 wiederverwendetes Portrait aus', async () => {
  const family = assertValidFamily(HOUSE_SGRECHIWR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-sgrechiwr/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_SGRECHIWR_PORTRAITS).length, 16);
  assert.equal(Object.keys(sourceManifest).length, 16);
  // Aerona Balchder zählt zusätzlich als wiederverwendetes Portrait aus Haus Balchder.
  assert.equal(picturedPeople.length, 17);
  assert.equal(placeholderPeople.length, 15);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_SGRECHIWR_PORTRAITS[personId]));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_SGRECHIWR_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Sgrechiwr-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));

  const emblem = await readFile(new URL('../assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png', import.meta.url));
  assert.ok(emblem.length > 100);
  assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
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
  [
    HOUSE_ARWYDD_FAMILY, HOUSE_DRAIG_FAMILY, HOUSE_WYRM_FAMILY, HOUSE_GAFYR_FAMILY, HOUSE_SAETHWYR_FAMILY,
    HOUSE_TLAWD_FAMILY, HOUSE_RHYDDID_FAMILY, HOUSE_GELYN_FAMILY, HOUSE_CLUDWYR_FAMILY,
    HOUSE_CHWEDLONOL_FAMILY, HOUSE_BALCHDER_FAMILY, HOUSE_ENEINIOG_FAMILY, HOUSE_GOSTYN_FAMILY,
    HOUSE_AWENYDD_FAMILY, HOUSE_GWARED_FAMILY
  ].map(normalizeFamily).forEach(family => {
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
    ['haus-illysywen', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Rhonwens Tränen', 'Castellbryn'] }],
    ['haus-saethwyr', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }],
    ['haus-wyrm', { rankId: 'knight-prince', path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'] }]
  ]);
  // Garrael sitzt abseits der übrigen niederen Ritterhäuser in einer eigenen Orts-Hierarchie
  // (Camruisge/Aberllan statt Llamreis Ankunft/Gwynthor) und wird deshalb gesondert geprüft.
  // Gwyllach und Sgrechiwr sind bürgerliche Häuser außerhalb der LOWER_KNIGHT_HOUSE_DEFINITIONS
  // und werden ebenfalls gesondert geprüft. Ard Conbhrón und Ui Talamh sitzen als antike
  // Albenclans in einer eigenen Orts-Hierarchie (Antike Crannath Clans) und werden ebenfalls
  // gesondert geprüft. Die 8 übrigen Grafenhäuser Cenyrs (CENYR_COUNTY_HOUSE_FAMILIES)
  // haben je ihre eigene, noch baronielose Orts-Hierarchie und werden in einem eigenen
  // Test geprüft.
  const newVassalHouseCount = ARTUS_STREBEN_HOUSE_FAMILIES.length
    + GWENDOLYNS_UFER_HOUSE_FAMILIES.length
    + RHONWENS_TRAENEN_HOUSE_FAMILIES.length;
  assert.equal(
    listFamilyRecords(storage).length,
    expected.size + LOWER_KNIGHT_HOUSE_FAMILIES.length + 5 + newVassalHouseCount + CENYR_COUNTY_HOUSE_FAMILIES.length
  );
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

  const garraelLoaded = loadFamilyById('haus-garrael', storage);
  const garraelProfile = garraelLoaded.family.document.houseProfile;
  const garraelPath = ['Cenyr', 'Celtigerns Wacht', 'Camruisge', 'Aberllan'];
  assert.deepEqual(garraelLoaded.folderPath, garraelPath);
  assert.deepEqual(createFolderPathFromHouseProfile(garraelProfile), garraelPath);
  assert.equal(garraelProfile.rankId, 'knight');
  assert.equal(getHouseRank('knight').label, 'Niederes Rittergeschlecht');
  assert.match(garraelProfile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  assert.match(garraelProfile.regionEmblems.county, /^assets\/images\/regions\//);
  assert.match(garraelProfile.regionEmblems.barony, /^assets\/images\/regions\//);
  assert.match(garraelProfile.regionEmblems.seat, /^assets\/images\/regions\//);
  assert.equal(garraelProfile.liegeHouseId, 'haus-draig');
  assert.equal(garraelProfile.liegeHouseName, 'Haus Draig');

  const gwyllachLoaded = loadFamilyById('haus-gwyllach', storage);
  const gwyllachProfile = gwyllachLoaded.family.document.houseProfile;
  const gwyllachPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor'];
  assert.deepEqual(gwyllachLoaded.folderPath, gwyllachPath);
  assert.deepEqual(createFolderPathFromHouseProfile(gwyllachProfile), gwyllachPath);
  assert.equal(gwyllachProfile.rankId, 'commoner');
  assert.equal(getHouseRank('commoner').label, 'Bürgerfamilie');
  assert.match(gwyllachProfile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  assert.match(gwyllachProfile.regionEmblems.county, /^assets\/images\/regions\//);
  assert.match(gwyllachProfile.regionEmblems.barony, /^assets\/images\/regions\//);
  assert.match(gwyllachProfile.regionEmblems.seat, /^assets\/images\/regions\//);
  assert.equal(gwyllachProfile.liegeHouseId, 'haus-draig');
  assert.equal(gwyllachProfile.liegeHouseName, 'Haus Draig');

  const sgrechiwrLoaded = loadFamilyById('haus-sgrechiwr', storage);
  const sgrechiwrProfile = sgrechiwrLoaded.family.document.houseProfile;
  const sgrechiwrPath = ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Lynthor'];
  assert.deepEqual(sgrechiwrLoaded.folderPath, sgrechiwrPath);
  assert.deepEqual(createFolderPathFromHouseProfile(sgrechiwrProfile), sgrechiwrPath);
  assert.equal(sgrechiwrProfile.rankId, 'commoner');
  assert.match(sgrechiwrProfile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  assert.match(sgrechiwrProfile.regionEmblems.county, /^assets\/images\/regions\//);
  assert.match(sgrechiwrProfile.regionEmblems.barony, /^assets\/images\/regions\//);
  assert.match(sgrechiwrProfile.regionEmblems.seat, /^assets\/images\/regions\//);
  assert.equal(sgrechiwrProfile.liegeHouseId, 'haus-draig');
  assert.equal(sgrechiwrProfile.liegeHouseName, 'Haus Draig');

  const ardConbhronLoaded = loadFamilyById('haus-ard-conbhron', storage);
  const ardConbhronProfile = ardConbhronLoaded.family.document.houseProfile;
  const ardConbhronPath = ['Cenyr', 'Celtigerns Wacht', 'Antike Crannath Clans', 'Lycath'];
  assert.deepEqual(ardConbhronLoaded.folderPath, ardConbhronPath);
  assert.deepEqual(createFolderPathFromHouseProfile(ardConbhronProfile), ardConbhronPath);
  assert.equal(ardConbhronProfile.rankId, 'dun-tiarna');
  assert.equal(getHouseRank('dun-tiarna').label, 'Dún Tiarna (Baron)');
  assert.match(ardConbhronProfile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  assert.match(ardConbhronProfile.regionEmblems.county, /^assets\/images\/regions\//);
  // "Antike Crannath Clans" und die Ruinen-Sitze (Lycath, Antikes Gwynthor) tragen
  // alle dasselbe Ruinen-Icon.
  assert.equal(ardConbhronProfile.regionEmblems.barony, 'assets/images/regions/AntikeIcon.png');
  assert.equal(ardConbhronProfile.regionEmblems.seat, 'assets/images/regions/AntikeIcon.png');
  assert.equal(ardConbhronProfile.liegeHouseId, '');

  const uiTalamhLoaded = loadFamilyById('haus-ui-talamh', storage);
  const uiTalamhProfile = uiTalamhLoaded.family.document.houseProfile;
  const uiTalamhPath = ['Cenyr', 'Celtigerns Wacht', 'Antike Crannath Clans', 'Antikes Gwynthor'];
  assert.deepEqual(uiTalamhLoaded.folderPath, uiTalamhPath);
  assert.deepEqual(createFolderPathFromHouseProfile(uiTalamhProfile), uiTalamhPath);
  assert.equal(uiTalamhProfile.rankId, 'ard-tiarna');
  assert.equal(getHouseRank('ard-tiarna').label, 'Ard Tiarna (Herzog/Fürst)');
  assert.match(uiTalamhProfile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  assert.match(uiTalamhProfile.regionEmblems.county, /^assets\/images\/regions\//);
  assert.equal(uiTalamhProfile.regionEmblems.barony, 'assets/images/regions/AntikeIcon.png');
  // "Antikes Gwynthor" ist eine eigene Ruinen-Version, getrennt vom heutigen, gleich-
  // namigen Sitz unter Llamreis Ankunft (der das reale gwynthor.png-Wappen behält).
  assert.equal(uiTalamhProfile.regionEmblems.seat, 'assets/images/regions/AntikeIcon.png');
  assert.equal(uiTalamhProfile.liegeHouseId, '');

  assert.equal(LOWER_KNIGHT_HOUSE_FAMILIES.length, 11);
  LOWER_KNIGHT_HOUSE_FAMILIES.forEach((family, index) => {
    const definition = LOWER_KNIGHT_HOUSE_DEFINITIONS[index];
    const loaded = loadFamilyById(family.document.id, storage);
    if (family.document.id === 'haus-tlawd') {
      assert.equal(loaded.family.persons.length, 31, 'Haus Tlawd ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-rhyddid') {
      assert.equal(loaded.family.persons.length, 31, 'Haus Rhyddid ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-gelyn') {
      assert.equal(loaded.family.persons.length, 24, 'Haus Gelyn ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-cludwyr') {
      assert.equal(loaded.family.persons.length, 32, 'Haus Cludwyr ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-chwedlonol') {
      assert.equal(loaded.family.persons.length, 35, 'Haus Chwedonol ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-balchder') {
      assert.equal(loaded.family.persons.length, 38, 'Haus Balchder ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-eneiniog') {
      assert.equal(loaded.family.persons.length, 39, 'Haus Eneiniog ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-gostyn') {
      assert.equal(loaded.family.persons.length, 32, 'Haus Gostyn ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-awenydd') {
      assert.equal(loaded.family.persons.length, 34, 'Haus Awenydd ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-awenor') {
      assert.equal(loaded.family.persons.length, 34, 'Haus Awenor ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else if (family.document.id === 'haus-loer') {
      assert.equal(loaded.family.persons.length, 28, 'Haus Loer ist als ausgearbeitetes Ritterherrenhaus registriert.');
    } else {
      assert.equal(loaded.family.persons.length, 0);
    }
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
    'assets/images/houses/Rhonwens Tränen/haus-arwydd.png',
    'assets/images/houses/Artus Streben/haus-gwefrydd.png',
    'assets/images/houses/Gwendolyns Ufer/haus-gwyvern.png',
    'assets/images/houses/Camruisge/haus-garrael.png',
    'assets/images/houses/Llamreis Ankunft/haus-gwyllach.png',
    'assets/images/houses/Llamreis Ankunft/haus-sgrechiwr.png',
    ...LOWER_KNIGHT_HOUSE_FAMILIES.map(family => family.document.emblem),
    'assets/images/regions/artus-streben.png',
    'assets/images/regions/castellbryn.png',
    'assets/images/regions/gwendolyns-ufer.png',
    'assets/images/regions/gwynthor.png',
    'assets/images/regions/llamreis-ankunft.png',
    'assets/images/regions/rhonwens-traenen.png',
    'assets/images/regions/rhosmere.png',
    'assets/images/regions/abergwint.png',
    'assets/images/regions/camruisge.png',
    'assets/images/regions/Cenyr/Celtigerns Wacht/Camruisge/Aberllan.png',
    'assets/images/regions/Cenyr/Celtigerns Wacht/Llamreis Ankunft/Lynthor.png'
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

test('pickTriviaSample wählt eine wiederholungsfreie, injizierbare Zufallsauswahl ohne Leerakten', () => {
  const records = [
    { id: 'a', title: 'A', personCount: 5 },
    { id: 'b', title: 'B', personCount: 0 },
    { id: 'c', title: 'C', personCount: 3 },
    { id: 'd', title: 'D', personCount: 12 },
    { id: 'e', title: 'E', personCount: 1 }
  ];
  const sequence = [0.1, 0.2, 0.3, 0.4];
  let cursor = 0;
  const sample = pickTriviaSample(records, { count: 3, randomFn: () => sequence[cursor++] ?? 0 });
  assert.equal(sample.length, 3);
  assert.equal(new Set(sample.map(record => record.id)).size, 3);
  assert.ok(sample.every(record => record.personCount > 0));

  const smallPool = pickTriviaSample([{ id: 'a', title: 'A', personCount: 1 }], { count: 4, randomFn: Math.random });
  assert.equal(smallPool.length, 1);

  assert.deepEqual(pickTriviaSample([], { count: 4 }), []);
});

test('buildShortHouseProfile degradiert graziös bei unvollständigem Hausprofil', () => {
  assert.equal(buildShortHouseProfile(null), '');
  assert.equal(buildShortHouseProfile({}), '');
  const full = buildShortHouseProfile({ rankId: 'county', seat: 'Aldrimoor', kingdom: 'Cenyr' });
  assert.match(full, /Grafengeschlecht/);
  assert.match(full, /Aldrimoor/);
  const seatOnly = buildShortHouseProfile({ seat: 'Nur-Sitz' });
  assert.match(seatOnly, /Nur-Sitz/);
});

test('buildLocalTriviaBlurb degradiert graziös bei fehlenden Segmenten', () => {
  const minimal = buildLocalTriviaBlurb({ title: 'Haus Ohne Alles' });
  assert.equal(minimal, 'Haus Ohne Alles.');

  const withProfile = buildLocalTriviaBlurb({
    title: 'Haus Beispiel',
    houseProfile: { rankId: 'barony', seat: 'Beispielburg' },
    personCount: 8
  }, { generationCount: 3 });
  assert.match(withProfile, /Haus Beispiel —/);
  assert.match(withProfile, /8 verzeichnete Personen über 3 Generationen/);

  const singlePerson = buildLocalTriviaBlurb({ title: 'Haus Einzel', personCount: 1 });
  assert.match(singlePerson, /1 verzeichnete Person\./);
});

test('buildLandingTriviaPrompt enthält Titel und bekannte Kennzahlen, erfindet aber keine neuen', () => {
  const prompt = buildLandingTriviaPrompt({
    title: 'Haus Beispiel',
    profileSummary: 'Grafengeschlecht · Aldrimoor',
    personCount: 12,
    generationCount: 4
  });
  assert.match(prompt, /Haus Beispiel/);
  assert.match(prompt, /12/);
  assert.match(prompt, /4/);
  assert.match(prompt, /Grafengeschlecht/);

  const bare = buildLandingTriviaPrompt({ title: 'Haus Leer' });
  assert.match(bare, /keine weiteren Angaben/);
});

test('tree-generator-ai-bridge.js reicht den gemeinsamen AleriaGPT-Wrapper unverändert weiter', () => {
  assert.equal(treeGeneratorAiBridge.isAleriaGptAvailable, isAleriaGptAvailable);
  assert.equal(treeGeneratorAiBridge.requestAleriaGptSuggestion, requestAleriaGptSuggestion);
  assert.equal(isAleriaGptAvailable({}), false);
});

function createFakeSessionStorage() {
  const store = new Map();
  return {
    getItem: key => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key)
  };
}

test('Pending-Tree-Generator-Merker: markieren, prüfen, ein-für-alle-Mal konsumieren', () => {
  const storage = createFakeSessionStorage();
  assert.equal(hasPendingTreeGeneratorLaunch(storage), false);
  markPendingTreeGeneratorLaunch(storage);
  assert.equal(hasPendingTreeGeneratorLaunch(storage), true);
  assert.equal(consumePendingTreeGeneratorLaunch(storage), true);
  assert.equal(hasPendingTreeGeneratorLaunch(storage), false);
  assert.equal(consumePendingTreeGeneratorLaunch(storage), false);

  markPendingTreeGeneratorLaunch(storage);
  clearPendingTreeGeneratorLaunch(storage);
  assert.equal(hasPendingTreeGeneratorLaunch(storage), false);
});

test('collectFamilyImageRefs findet alle bild-tragenden Schema-Stellen und überspringt leere Felder', () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const refs = collectFamilyImageRefs(family);
  const kinds = new Set(refs.map(ref => ref.kind));
  assert.ok(kinds.has('document.emblem'));
  assert.ok(kinds.has('person.portrait'));
  assert.ok(kinds.has('house.emblem'));
  assert.ok(kinds.has('cadetBranch.emblem'));

  const emptyEmblemHouseIds = new Set(family.houses.filter(house => !house.emblem).map(house => house.id));
  refs.filter(ref => ref.kind === 'house.emblem').forEach(ref => {
    assert.equal(emptyEmblemHouseIds.has(ref.ownerId), false);
  });
  if (!family.lineage.originHouse.enabled) {
    assert.equal(kinds.has('lineage.originHouse.emblem'), false);
  }
});

test('extensionForContentType und zipFilenameFor liefern stabile, eindeutige Dateinamen', () => {
  assert.equal(extensionForContentType('image/png'), '.png');
  assert.equal(extensionForContentType('image/jpeg'), '.jpg');
  assert.equal(extensionForContentType('image/webp'), '.webp');
  assert.equal(extensionForContentType('', 'assets/images/foo.gif'), '.gif');
  assert.equal(extensionForContentType('', 'https://example.com/no-extension'), '.png');

  assert.equal(zipFilenameFor({ kind: 'document.emblem', ownerId: 'haus-arwydd' }, '.png'), 'images/document-emblem.png');
  assert.equal(zipFilenameFor({ kind: 'person.portrait', ownerId: 'idris-arwydd' }, '.jpg'), 'images/person-idris-arwydd.jpg');
  assert.equal(zipFilenameFor({ kind: 'house.emblem', ownerId: 'house-wyrm' }, '.png'), 'images/house-house-wyrm.png');
  assert.equal(zipFilenameFor({ kind: 'cadetBranch.emblem', ownerId: 'cadet-1' }, '.png'), 'images/cadet-cadet-1.png');
  assert.equal(zipFilenameFor({ kind: 'lineage.originHouse.emblem', ownerId: 'lineage-origin-house' }, '.png'), 'images/origin-house-emblem.png');
});

function createWritableFakeJSZipCtor() {
  return class FakeJSZip {
    constructor() {
      this.files = new Map();
    }

    file(path, content) {
      if (content === undefined) {
        return this.files.has(path) ? { async: async () => this.files.get(path) } : null;
      }
      this.files.set(path, content);
      return this;
    }

    async generateAsync() {
      return { __fakeZip: true, files: this.files };
    }
  };
}

test('buildFamilyBundleZip packt erreichbare Bilder, überspringt fehlgeschlagene und schreibt ein vollständiges Manifest', async () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const refs = collectFamilyImageRefs(family);
  assert.ok(refs.length > 1, 'Testfixtur benötigt mehrere Bildreferenzen');

  let callIndex = 0;
  const fetchImpl = async () => {
    callIndex += 1;
    if (callIndex === 2) throw new Error('Netzwerkfehler (simuliert)');
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'image/png' },
      blob: async () => ({ type: 'image/png' })
    };
  };

  const { blob, failedCount, imageCount } = await buildFamilyBundleZip(family, {
    runtime: {},
    fetchImpl,
    JSZipCtor: createWritableFakeJSZipCtor()
  });

  assert.equal(imageCount, refs.length);
  assert.equal(failedCount, 1);
  assert.ok(blob.files.has('family.json'));
  assert.ok(blob.files.has('manifest.json'));

  const manifest = JSON.parse(blob.files.get('manifest.json'));
  assert.equal(manifest.images.length, refs.length);
  assert.equal(manifest.images.filter(entry => entry.error).length, 1);
  const failedEntry = manifest.images.find(entry => entry.error);
  assert.equal(failedEntry.zipPath, '');
  manifest.images.filter(entry => !entry.error).forEach(entry => {
    assert.ok(blob.files.has(entry.zipPath), `Zip sollte ${entry.zipPath} enthalten`);
  });
});

test('rewriteFamilyImageRefs lässt nicht aufgelöste Bildfelder unangetastet', () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const personWithPortrait = family.persons.find(person => person.portrait);
  assert.ok(personWithPortrait, 'Testfixtur benötigt mindestens ein Portrait');

  const resolvedByKey = new Map([
    [buildImageRefKey('person.portrait', personWithPortrait.id), 'https://cdn.example/new-portrait.png']
  ]);
  const rewritten = rewriteFamilyImageRefs(family, resolvedByKey);

  const rewrittenPerson = rewritten.persons.find(person => person.id === personWithPortrait.id);
  assert.equal(rewrittenPerson.portrait, 'https://cdn.example/new-portrait.png');

  assert.equal(rewritten.document.emblem, family.document.emblem);
  assert.deepEqual(rewritten.document.houseProfile.regionEmblems, family.document.houseProfile.regionEmblems);
  family.persons.filter(person => person.id !== personWithPortrait.id).forEach(person => {
    const match = rewritten.persons.find(item => item.id === person.id);
    assert.equal(match.portrait, person.portrait);
  });
  family.houses.forEach(house => {
    const match = rewritten.houses.find(item => item.id === house.id);
    assert.equal(match.emblem, house.emblem);
  });
  family.cadetBranches.forEach(branch => {
    const match = rewritten.cadetBranches.find(item => item.id === branch.id);
    assert.equal(match.emblem, branch.emblem);
  });
  assert.equal(rewritten.lineage.originHouse.emblem, family.lineage.originHouse.emblem);

  assert.equal(family.persons.find(person => person.id === personWithPortrait.id).portrait !== 'https://cdn.example/new-portrait.png', true);
  assert.equal(rewritten.persons.length, family.persons.length);
});

function createReadableFakeJSZipCtor(fileMap) {
  return class FakeJSZip {
    async loadAsync() {
      return {
        file(path) {
          if (!fileMap.has(path)) return null;
          const stored = fileMap.get(path);
          return { async: async () => stored };
        }
      };
    }
  };
}

test('parseFamilyBundleZip: fehlende family.json wirft einen klaren Fehler', async () => {
  const FakeJSZip = createReadableFakeJSZipCtor(new Map());
  await assert.rejects(
    () => parseFamilyBundleZip(new ArrayBuffer(0), { JSZipCtor: FakeJSZip }),
    /family\.json/
  );
});

test('parseFamilyBundleZip: fehlende manifest.json degradiert auf keine Bilder statt zu scheitern', async () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const fileMap = new Map([['family.json', serializeFamily(family)]]);
  const FakeJSZip = createReadableFakeJSZipCtor(fileMap);
  const result = await parseFamilyBundleZip(new ArrayBuffer(0), { JSZipCtor: FakeJSZip });
  assert.equal(result.family.document.id, family.document.id);
  assert.deepEqual(result.images, []);
});

test('parseFamilyBundleZip: liest referenzierte Bilder, überspringt fehlerhafte Manifest-Einträge', async () => {
  const family = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  const fakeBlob = { type: 'image/png', __label: 'restored' };
  const manifest = {
    images: [
      { kind: 'document.emblem', ownerId: family.document.id, source: 'x', zipPath: 'images/document-emblem.png', contentType: 'image/png' },
      { kind: 'person.portrait', ownerId: 'ghost', source: 'y', zipPath: '', contentType: '', error: 'fehlgeschlagen' }
    ]
  };
  const fileMap = new Map([
    ['family.json', serializeFamily(family)],
    ['manifest.json', JSON.stringify(manifest)],
    ['images/document-emblem.png', fakeBlob]
  ]);
  const FakeJSZip = createReadableFakeJSZipCtor(fileMap);
  const result = await parseFamilyBundleZip(new ArrayBuffer(0), { JSZipCtor: FakeJSZip });
  assert.equal(result.images.length, 1);
  assert.equal(result.images[0].blob, fakeBlob);
});

test('Landingpage verlinkt zur Generator-CTA und zum Familienregister, ohne Inline-Handler', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="Stammbaum\.html\?mode=edit&amp;action=start-tree-generator"/);
  assert.match(html, /href="register\.html"/);
  assert.match(html, /id="landing-trivia-grid"/);
  assert.match(html, /id="landing-trivia-empty"/);
  assert.match(html, /assets\/js\/landing-app\.js/);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)=/i);
});

test('Familienregister verlinkt zurück zur Startseite', async () => {
  const html = await readFile(new URL('../register.html', import.meta.url), 'utf8');
  assert.match(html, /href="index\.html"/);
});

test('Stammbaum.html bindet JSZip ein und bietet Paket-Export/Import sowie Startseiten-Links', async () => {
  const html = await readFile(new URL('../Stammbaum.html', import.meta.url), 'utf8');
  assert.match(html, /vendor\/jszip\/3\.10\.1\/jszip\.min\.js/);
  assert.match(html, /data-action="export-family-bundle"/);
  assert.match(html, /data-action="trigger-bundle-import"/);
  assert.match(html, /id="family-bundle-import"/);
  assert.match(html, /href="index\.html"/);
});

test('netlify.toml leitet die Stammbäume-Startseite nicht mehr künstlich um', async () => {
  const toml = await readFile(new URL('../../netlify.toml', import.meta.url), 'utf8');
  assert.doesNotMatch(toml, /Stammb%C3%A4ume%2Findex\.html|Stammb%C3%A4ume\/index\.html/);
  assert.doesNotMatch(toml, /from = "\/Stammb%C3%A4ume\/"/);
});

test('collectHouseFacts findet erloschene Linien und ihre Archivnotiz bei Haus Illysywen', () => {
  const family = assertValidFamily(HOUSE_ILLYSYWEN_FAMILY).family;
  const facts = collectHouseFacts({ id: 'haus-illysywen', title: 'Haus Illysywen', family });
  const extinctQuestion = facts.find(fact => fact.id.startsWith('extinct-count::'));
  assert.ok(extinctQuestion, 'sollte einen erloschene-Linien-Fakt liefern');
  assert.match(extinctQuestion.text, /erloschen/);
  const archiveFacts = facts.filter(fact => fact.flavor === 'archive');
  assert.ok(archiveFacts.some(fact => fact.text.includes('ohne Nachkommen')), 'sollte die Notiz "… ohne Nachkommen; die Linie endet hier." als Archiv-Fakt übernehmen');
});

test('collectHouseFacts erkennt Vormundschaften (Mündel) aus foster-Abstammungen', () => {
  const family = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const facts = collectHouseFacts({ id: 'haus-gafyr', title: 'Haus Gafyr', family });
  const wardFact = facts.find(fact => fact.id.startsWith('ward::'));
  assert.ok(wardFact, 'sollte einen Mündel-Fakt liefern');
  assert.match(wardFact.text, /als Mündel bei/);
});

test('collectHouseFacts erkennt matriarchale Erbfolge bei Haus Chwedlonol', () => {
  const family = assertValidFamily(HOUSE_CHWEDLONOL_FAMILY).family;
  const facts = collectHouseFacts({ id: 'haus-chwedlonol', title: 'Haus Chwedlonol', family });
  const matriarchalFact = facts.find(fact => fact.id.startsWith('matriarchal::'));
  assert.ok(matriarchalFact, 'sollte einen matriarchalen Fakt liefern');
  assert.match(matriarchalFact.text, /ausschließlich von Frauen geführt/);
});

test('collectHouseFacts erkennt bürgerliche Erbfolge-nach-Eignung bei Haus Gwyllach', () => {
  const family = assertValidFamily(HOUSE_GWYLLACH_FAMILY).family;
  const facts = collectHouseFacts({ id: 'haus-gwyllach', title: 'Haus Gwyllach', family });
  const meritFact = facts.find(fact => fact.id.startsWith('meritocratic::'));
  assert.ok(meritFact, 'sollte einen Eignungs-Erbfolge-Fakt liefern');
});

test('collectHouseFacts findet Ursprungshaus und Legitimierung bei Haus Draig', () => {
  const family = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const facts = collectHouseFacts({ id: 'haus-draig', title: 'Haus Draig', family });
  assert.ok(facts.some(fact => fact.id.startsWith('origin-house::')), 'sollte einen Ursprungshaus-Fakt liefern');
  assert.ok(facts.some(fact => fact.id.startsWith('legitimized::')), 'sollte einen Legitimierungs-Fakt liefern');
});

test('collectHouseFacts filtert Notizen heraus, die die Erzählebene durchbrechen (Bezug auf Vorlage/User)', () => {
  const wordChar = '(?:[\\p{L}\\p{N}_])';
  const standaloneUser = new RegExp(`(?<!${wordChar})Users?(?!${wordChar})`, 'iu');
  const standaloneVorlage = new RegExp(`(?<!${wordChar})Vorlage(?!${wordChar})`, 'iu');

  const sgrechiwr = assertValidFamily(HOUSE_SGRECHIWR_FAMILY).family;
  const sgrechiwrFacts = collectHouseFacts({ id: 'haus-sgrechiwr', title: 'Haus Sgrechiwr', family: sgrechiwr });
  assert.ok(
    sgrechiwrFacts.every(fact => !standaloneUser.test(fact.text)),
    'kein Archiv-Fakt darf "User" als eigenständiges Wort erwähnen'
  );
  // Regressionsschutz für die \b-Umlaut-Falle: ein legitimer Fakt, der zufällig
  // "Häuser"/"Häusern" enthält, darf NICHT fälschlich herausgefiltert werden.
  assert.ok(sgrechiwrFacts.some(fact => fact.id === 'married-away-count::haus-sgrechiwr'));

  const gafyr = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const gafyrFacts = collectHouseFacts({ id: 'haus-gafyr', title: 'Haus Gafyr', family: gafyr });
  assert.ok(
    gafyrFacts.every(fact => !standaloneVorlage.test(fact.text)),
    'kein Archiv-Fakt darf "Vorlage" als eigenständiges Wort erwähnen'
  );
});

test('collectHouseFacts liefert nichts für eine Familie ohne Datensatz und kürzt lange Archivtexte', () => {
  assert.deepEqual(collectHouseFacts({ id: 'x', title: 'X', family: null }), []);

  const longText = 'A'.repeat(300);
  const family = normalizeFamily({
    document: { id: 'lang-haus', title: 'Haus Lang', description: longText }
  });
  const facts = collectHouseFacts({ id: 'lang-haus', title: 'Haus Lang', family });
  const descriptionFact = facts.find(fact => fact.id === 'description::lang-haus');
  assert.ok(descriptionFact);
  assert.ok(descriptionFact.text.length <= 220);
  assert.ok(descriptionFact.text.endsWith('…'));
});

test('collectGlobalFacts und pickFactSample liefern eine wiederholungsfreie, injizierbare Auswahl', () => {
  const records = listFamilyRecords();
  const globalFacts = collectGlobalFacts(records);
  assert.ok(globalFacts.some(fact => fact.id === 'global-total-persons'));
  assert.ok(globalFacts.some(fact => fact.id === 'global-largest-house'));

  assert.deepEqual(collectGlobalFacts([]), []);

  const sequence = [0.05, 0.15, 0.25, 0.35, 0.45];
  let cursor = 0;
  const sample = pickFactSample(records, { count: 5, randomFn: () => sequence[cursor++] ?? 0 });
  assert.equal(sample.length, 5);
  assert.equal(new Set(sample.map(fact => fact.id)).size, 5);
});

test('collectBiographyPreviews ignoriert Personen ohne ausgearbeitete Biografie und findet welche mit Freitext', () => {
  const withoutBio = assertValidFamily(HOUSE_ARWYDD_FAMILY).family;
  assert.deepEqual(collectBiographyPreviews([{ id: 'haus-arwydd', title: 'Haus Arwydd', family: withoutBio }]), []);

  const longBiography = 'Eine ausführliche Lebensgeschichte voller Wendungen, die deutlich über die Kürzungsgrenze von hundertsechzig Zeichen hinausgeht, um den Abschneide-Mechanismus der Vorschau zuverlässig zu testen.';
  const bioFamily = normalizeFamily({
    document: { id: 'bio-test-haus', title: 'Haus Testbio' },
    persons: [{
      id: 'p1',
      name: 'Testperson',
      sex: 'female',
      extensions: {
        [PERSON_BIOGRAPHY_EXTENSION_ID]: normalizePersonBiographyModule({
          biography: { biographyText: longBiography }
        })
      }
    }]
  });
  const previews = collectBiographyPreviews([{ id: 'bio-test-haus', title: 'Haus Testbio', family: bioFamily }]);
  assert.equal(previews.length, 1);
  assert.equal(previews[0].personName, 'Testperson');
  assert.ok(previews[0].excerpt.length <= 160);
  assert.ok(previews[0].excerpt.endsWith('…'));

  const sampled = pickBiographySample([{ id: 'bio-test-haus', title: 'Haus Testbio', family: bioFamily }], { count: 3, randomFn: () => 0 });
  assert.equal(sampled.length, 1);
});

test('Landingpage rendert "Wusstest du schon?"-Spotlight und Biografie-Vorschau ohne Inline-Handler', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="landing-spotlight"/);
  assert.match(html, /id="landing-spotlight-next"/);
  assert.match(html, /id="landing-bio-grid"/);
  assert.doesNotMatch(html, /\son(?:click|input|change|submit)=/i);
});

test('createFounderPlaceholderHouseFamily legt ein schemakonformes Platzhalter-Gründerpaar an', () => {
  const family = createFounderPlaceholderHouseFamily({
    id: 'haus-testling',
    title: 'Haus Testling',
    emblem: 'assets/images/houses/Testregion/Testling.png',
    houseProfile: ARTUS_STREBEN_HOUSE_FAMILIES[0].document.houseProfile
  });
  assert.equal(family.persons.length, 2);
  assert.ok(family.persons.every(person => person.name === '???'));
  assert.equal(family.persons.find(person => person.sex === 'male').title, 'Gründer des Hauses');
  assert.equal(family.persons.find(person => person.sex === 'female').title, 'Gründerin des Hauses');
  assert.doesNotMatch(family.persons.find(person => person.sex === 'male').title, /Haus Haus/, 'Titel darf den Hausnamen nicht doppeln');
  assert.equal(family.partnerships.length, 1);
  assert.equal(family.lineage.founderPartnershipId, family.partnerships[0].id);
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.cadetBranches.length, 0);
  assert.equal(assertValidFamily(family).diagnostics.filter(item => item.severity === 'error').length, 0);

  const commonerFamily = createFounderPlaceholderHouseFamily({
    id: 'haus-buergertest',
    title: 'Haus Bürgertest',
    emblem: 'assets/images/houses/Testregion/Buergertest.png',
    houseProfile: { ...ARTUS_STREBEN_HOUSE_FAMILIES[0].document.houseProfile, rankId: 'commoner' }
  });
  assert.equal(commonerFamily.lineage.crestFrame, 'iron');
});

test('createExtinctPlaceholderHouseFamily hängt sofort einen Ausgestorben-Knoten an die Gründerehe', () => {
  const family = createExtinctPlaceholderHouseFamily({
    id: 'haus-erloschentest',
    title: 'Haus Erloschentest',
    emblem: 'assets/images/houses/Testregion/Erloschentest.png',
    houseProfile: RHONWENS_TRAENEN_HOUSE_FAMILIES[0].document.houseProfile
  });
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.cadetBranches[0].linkType, 'line-extinct');
  assert.equal(family.cadetBranches[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.equal(assertValidFamily(family).diagnostics.filter(item => item.severity === 'error').length, 0);
});

test('Neue Vasallenhäuser (Artus Streben/Gwendolyns Ufer/Rhonwens Tränen): schemakonform, eindeutige IDs, Gwefrydd/Illysywen bewusst ausgelassen', () => {
  const allFamilies = [
    ...ARTUS_STREBEN_HOUSE_FAMILIES,
    ...GWENDOLYNS_UFER_HOUSE_FAMILIES,
    ...RHONWENS_TRAENEN_HOUSE_FAMILIES
  ];
  assert.equal(allFamilies.length, 14 + 17 + 7);

  allFamilies.forEach(family => {
    assert.equal(assertValidFamily(family).diagnostics.filter(item => item.severity === 'error').length, 0, `${family.document.id} sollte fehlerfrei sein`);
    // Regressionsschutz: Hausname darf nirgends doppelt vorkommen (family.document.title
    // enthält bereits "Haus X" — Personentitel dürfen das nicht noch einmal anhängen).
    family.persons.forEach(person => {
      assert.doesNotMatch(person.title, /Haus\s+Haus\s/, `${family.document.id}: Personentitel "${person.title}" verdoppelt den Hausnamen`);
    });
  });

  const ids = allFamilies.map(family => family.document.id);
  assert.equal(new Set(ids).size, ids.length, 'alle neuen Häuser brauchen eindeutige IDs');
  assert.equal(ids.includes('haus-gwefrydd'), false, 'Gwefrydd.png in Artus Streben ist ein Dublett des bestehenden Baronenhauses und wurde bewusst übersprungen');
  assert.equal(ids.includes('haus-illysywen'), false, 'die lose Illysywen.png in Rhonwens Tränen ist ein Dublett des bereits ausgearbeiteten Hauses');

  assert.equal(ARTUS_STREBEN_HOUSE_DEFINITIONS.some(def => def.slug === 'gwefrydd'), false);
  assert.equal(GWENDOLYNS_UFER_HOUSE_DEFINITIONS.length, 17);
  assert.deepEqual(
    RHONWENS_TRAENEN_HOUSE_DEFINITIONS.filter(def => def.extinct).map(def => def.slug).sort(),
    ['morveth', 'skellor']
  );
});

test('Ausgestorben-Häuser aus Rhonwens Tränen (Morveth, Skellor) tragen einen Ausgestorben-Knoten, lebende Häuser nicht', () => {
  const extinctIds = new Set(['haus-morveth', 'haus-skellor']);
  RHONWENS_TRAENEN_HOUSE_FAMILIES.forEach(family => {
    const extinctBranches = family.cadetBranches.filter(branch => branch.linkType === 'line-extinct');
    if (extinctIds.has(family.document.id)) {
      assert.equal(extinctBranches.length, 1, `${family.document.id} sollte einen Ausgestorben-Knoten tragen`);
    } else {
      // Nicht-erloschene Häuser dürfen andere Kadettenzweige haben (z. B. Gwareds
      // Wegverheiratungen), nur keinen Ausgestorben-Knoten.
      assert.equal(extinctBranches.length, 0, `${family.document.id} sollte keinen Ausgestorben-Knoten tragen`);
    }
  });
});

test('Neue Vasallenhäuser sind über die Hausregistrierung mit korrektem Rang/Orts-Hierarchie auffindbar', () => {
  const storage = createMemoryStorage();
  const almarch = loadFamilyById('haus-almarch', storage);
  assert.ok(almarch, 'Haus Almarch sollte über das Register ladbar sein');
  // Artus Streben sitzt seit der User-Vorgabe am selben Ort wie sein Baron
  // (Haus Gwefrydd, Rhosmere) — ebenso Gwendolyns Ufer bei Haus Gwyvern (Abergwint).
  assert.equal(almarch.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Artus Streben > Rhosmere');
  assert.equal(almarch.family.document.houseProfile.rankId, 'knight');
  assert.match(almarch.family.document.houseProfile.regionEmblems.seat, /^assets\/images\/regions\//);

  const bekab = loadFamilyById('haus-bekab', storage);
  assert.equal(bekab.family.document.houseProfile.rankId, 'commoner');
  assert.equal(bekab.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Artus Streben > Rhosmere');

  const annwyl = loadFamilyById('haus-annwyl', storage);
  assert.equal(annwyl.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.match(annwyl.family.document.houseProfile.regionEmblems.seat, /^assets\/images\/regions\//);

  const caerlaen = loadFamilyById('haus-caerlaen', storage);
  assert.equal(caerlaen.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');

  // Gwared ist inzwischen ausgearbeitet und sitzt am Sitz seines neuen Lehnsherrn
  // Arwydd (Castellbryn); die übrigen, noch nicht ausgearbeiteten Rhonwens-Tränen-
  // Häuser bleiben weiterhin ohne festen Sitz.
  const gwared = loadFamilyById('haus-gwared', storage);
  assert.equal(gwared.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Rhonwens Tränen > Castellbryn');
  assert.equal(gwared.family.document.houseProfile.liegeHouseId, 'haus-arwydd');

  const madryn = loadFamilyById('haus-madryn', storage);
  assert.equal(madryn.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Rhonwens Tränen', 'Rhonwens Tränen bleibt für die übrigen Platzhalterhäuser ohne festen Sitz');

  const records = listFamilyRecords(storage);
  const almarchRecord = records.find(record => record.id === 'haus-almarch');
  assert.equal(almarchRecord.type, 'lower-nobility');
  const bekabRecord = records.find(record => record.id === 'haus-bekab');
  assert.equal(bekabRecord.type, 'commoner');
});

test('bildet das Ritterhaus Gwared mit gespaltener Erbfolge nach dem Fall Illysywens 1720 ab', () => {
  const family = assertValidFamily(HOUSE_GWARED_FAMILY).family;
  assert.equal(family.persons.length, 53);
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-arwydd');
  assert.equal(family.lineage.crestFrame, 'silver');

  const graph = createFamilyGraph(family);

  // Die Illysywen-treue Linie erlischt im Krieg von 1718-1720; ihre Kinder Sheev
  // und Soffi sind unbeteiligte Waisen, keine Erben der Kopfschaft.
  const gwaedan = graph.getPerson('gwaedan-gwared');
  const perdena = graph.getPerson('perdena');
  assert.equal(gwaedan.death, '1720');
  assert.equal(perdena.death, '1720');
  const gwaedansChildren = graph.getChildren('gwaedan-gwared').map(person => person.id).sort();
  assert.deepEqual(gwaedansChildren, ['sheev-gwared', 'soffi-gwared']);
  assert.equal(family.persons.find(person => person.id === 'sheev-gwared').lineageRole, 'branch');
  assert.equal(family.persons.find(person => person.id === 'soffi-gwared').lineageRole, 'branch');

  // Sheev und Soffi tragen den "als Mündel fortgegeben"-Rahmen und ihre echten
  // Portraits (übernommen aus Balchder/Chwedonol, wo die volle Akte liegt).
  const sheev = family.persons.find(person => person.id === 'sheev-gwared');
  const soffi = family.persons.find(person => person.id === 'soffi-gwared');
  assert.equal(sheev.familyRole, 'ward-away');
  assert.equal(soffi.familyRole, 'ward-away');
  assert.equal(sheev.portrait, 'assets/images/portraits/haus-balchder/sheev-gwared.jpg');
  assert.equal(soffi.portrait, 'assets/images/portraits/haus-chwedlonol/soffi-gwared.jpg');
  // Sichtbarer Indikator, bei welchem Haus die Mündel untergebracht wurden
  // (kein Kadettenzweig-Medaillon möglich, da unverheiratete Mündel keine
  // eigene Partnerschaft haben, an die createHouseBranch anknüpfen könnte).
  assert.equal(sheev.title, 'Mündel bei Haus Balchder');
  assert.equal(soffi.title, 'Mündel bei Haus Chwedonol');

  // Auf der linken (Illysywen-treuen) Seite ab Cyrwyn Gwared sind nur noch Sheev
  // und Soffi am Leben; die meisten Todeszeiten fallen in den Krieg (1718-1720).
  const leftBranchIds = [
    'cyrwyn-gwared', 'nerella', 'dyrian-gwared', 'cyrena', 'ellor-gwared', 'firwen',
    'firban-gwared', 'kyria', 'janor-gwared', 'dynwen',
    'gwaedan-gwared', 'perdena', 'kyrban-gwared', 'sairyn'
  ];
  leftBranchIds.forEach(id => {
    const leftPerson = family.persons.find(person => person.id === id);
    assert.equal(leftPerson.status, 'dead', `${id} sollte auf der linken Seite nicht mehr leben`);
  });
  const warDeathIds = leftBranchIds.filter(id => id !== 'cyrwyn-gwared' && id !== 'nerella');
  warDeathIds.forEach(id => {
    const leftPerson = family.persons.find(person => person.id === id);
    assert.ok(['1718', '1719', '1720'].includes(leftPerson.death), `${id} sollte 1718-1720 gestorben sein, war aber ${leftPerson.death}`);
  });
  assert.equal(family.persons.find(person => person.id === 'sheev-gwared').status, 'alive');
  assert.equal(family.persons.find(person => person.id === 'soffi-gwared').status, 'alive');

  // Kopfschaft: erst die ältere (nun erloschene) Linie, dann die überlebende
  // Nebenlinie um Rhydor, die die heutige Kopfschaft (Ellric) stellt.
  const extinctHeadIds = ['cyrwyn-gwared', 'dyrian-gwared', 'firban-gwared', 'gwaedan-gwared'];
  extinctHeadIds.forEach(id => {
    assert.equal(family.persons.find(person => person.id === id).lineageRole, 'head');
  });
  assert.equal(family.persons.find(person => person.id === 'ellric-gwared').lineageRole, 'head');
  // Fokus liegt auf dem Gründer, nicht dem heutigen Oberhaupt, damit der
  // Family-Chart standardmäßig BEIDE Linien zeigt statt nur Ellrics eigene
  // Vorfahrenkette (der Chart zeigt bei einem Fokus mitten im Baum nur dessen
  // eigene Vorfahren/Nachkommen, nicht die ganze verbundene Sippe).
  assert.equal(family.view.focusPersonId, 'uwchor-gwared');

  // Zeitsprung als lineage.timeGap (nicht als timeJumps-Knoten), damit die
  // Reihenfolge im Chart stimmt: Gründerpaar -> Hauswappen -> Zeitsprung -> nächste
  // Generation, statt Hauswappen und Zeitsprung parallel nebeneinander.
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.toYear, '1618');

  // Oenban (Nebenzweig) hat inzwischen einen Sohn.
  assert.deepEqual(graph.getChildren('oenban-gwared').map(person => person.id), ['helric-gwared']);

  // Helric unterhielt eine Affäre mit Oenwen; zwei nicht legitimierte Kinder.
  const helricAffair = family.partnerships.find(partnership => partnership.id === 'affair-helric-oenwen');
  assert.ok(helricAffair);
  assert.equal(helricAffair.type, 'affair');
  const oenwen = family.persons.find(person => person.id === 'oenwen');
  assert.equal(oenwen.familyRole, 'affair');
  assert.deepEqual(graph.getChildren('helric-gwared').map(person => person.id).sort(), ['dyryr-gwared', 'ellyn-gwared']);
  ['dyryr-gwared', 'ellyn-gwared'].forEach(id => {
    assert.equal(family.persons.find(person => person.id === id).familyRole, 'bastard');
  });
  const bastardParentage = family.parentages.find(parentage => parentage.partnershipId === 'affair-helric-oenwen');
  assert.equal(bastardParentage.legitimacy, 'illegitimate');

  // Peran und Rhewa hatten zwei Söhne, die im Krieg fielen.
  assert.deepEqual(graph.getChildren('peran-gwared').map(person => person.id).sort(), ['iwrian-gwared', 'janric-gwared']);
  assert.equal(family.persons.find(person => person.id === 'iwrian-gwared').death, '1719');
  assert.equal(family.persons.find(person => person.id === 'janric-gwared').death, '1720');

  // Eine weitere Generation: Ellric und Dyrwyn setzen die Linie fort, Maelwen und
  // Nera werden wegverheiratet (Frauen des Hauses werden wegverheiratet). Ellric
  // und Lleira haben inzwischen fünf Kinder (24 bis 9 Jahre alt).
  assert.deepEqual(graph.getChildren('ellric-gwared').map(person => person.id).sort(), ['brenar-gwared', 'cyrella-gwared', 'dyran-gwared', 'ellena-gwared', 'firella-gwared']);
  assert.deepEqual(graph.getChildren('dyrwyn-gwared').map(person => person.id).sort(), ['firena-gwared', 'neddan-gwared']);
  assert.equal(family.persons.find(person => person.id === 'brenar-gwared').lineageRole, 'mainline');

  const madrynBranch = family.cadetBranches.find(branch => branch.id === 'married-away-madryn-maelwen');
  assert.ok(madrynBranch);
  assert.equal(madrynBranch.linkType, 'married-away');
  assert.equal(madrynBranch.targetFamilyId, 'haus-madryn');
  const merekBranch = family.cadetBranches.find(branch => branch.id === 'married-away-merek-nera');
  assert.ok(merekBranch);
  assert.equal(merekBranch.linkType, 'married-away');
  assert.equal(merekBranch.targetFamilyId, 'haus-merek');
});

test('Sheev und Soffi Gwared sind über Balchder/Chwedonol hinweg dieselben Weltpersonen wie in Haus Gwared', () => {
  const gwared = assertValidFamily(HOUSE_GWARED_FAMILY).family;
  const balchder = assertValidFamily(HOUSE_BALCHDER_FAMILY).family;
  const chwedlonol = assertValidFamily(HOUSE_CHWEDLONOL_FAMILY).family;

  const sheevInGwared = gwared.persons.find(person => person.id === 'sheev-gwared');
  const sheevInBalchder = balchder.persons.find(person => person.id === 'sheev-gwared');
  assert.equal(sheevInGwared.worldPersonId, sheevInBalchder.worldPersonId);

  const soffiInGwared = gwared.persons.find(person => person.id === 'soffi-gwared');
  const soffiInChwedlonol = chwedlonol.persons.find(person => person.id === 'soffi-gwared');
  assert.equal(soffiInGwared.worldPersonId, soffiInChwedlonol.worldPersonId);

  assert.equal(balchder.houses.find(house => house.id === 'house-gwared').emblem, 'assets/images/houses/Rhonwens Tränen/Ritterliche/Gwared.png');
  assert.equal(chwedlonol.houses.find(house => house.id === 'house-gwared').emblem, 'assets/images/houses/Rhonwens Tränen/Ritterliche/Gwared.png');
});

test('bildet den antiken Albenclan Ard Conbhrón mit zweiter Überlieferungslücke und drei lebenden Nachfahren ab', () => {
  const family = assertValidFamily(HOUSE_ARD_CONBHRON_FAMILY).family;
  assert.equal(family.persons.length, 24);
  assert.equal(family.document.houseProfile.rankId, 'dun-tiarna');
  assert.equal(family.lineage.crestFrame, 'gold');

  const graph = createFamilyGraph(family);

  // Gründerpaar ist nicht überliefert (Unbekannter Ahnherr/Unbekannte Ahnfrau).
  const ahnherr = family.persons.find(person => person.id === 'ahnherr-ard-conbhron');
  assert.equal(ahnherr.name, 'Unbekannter Ahnherr');
  assert.equal(ahnherr.houseId, 'house-ard-conbhron');
  assert.equal(ahnherr.familyRole, 'core');
  assert.deepEqual(graph.getChildren('ahnherr-ard-conbhron').map(person => person.id).sort(), [
    'clodagh-ard-conbhron', 'donall-ard-conbhron', 'garbhan-ard-conbhron', 'liadan-ard-conbhron'
  ]);

  // Erste Überlieferungslücke direkt nach dem Gründerpaar (lineage.timeGap), zweite
  // Lücke tiefer im Baum zwischen Labhoise und dem jüngeren Iarlaith (timeJumps-Knoten).
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, 'marriage-labhoise-odhran');
  assert.deepEqual(family.timeJumps[0].childIds, ['iarlaith-descendant-ard-conbhron']);

  // Nur Scáthach, Tlachtga und Uathach leben noch; alle anderen sind verstorben.
  const survivorIds = ['scathach-ard-conbhron', 'tlachtga', 'uathach-ard-conbhron'];
  survivorIds.forEach(id => {
    const survivor = family.persons.find(person => person.id === id);
    assert.equal(survivor.status, 'alive', `${id} sollte noch leben`);
    assert.equal(survivor.extensions.cardFrameId, 'druid');
  });
  family.persons
    .filter(person => !survivorIds.includes(person.id))
    .forEach(person => {
      assert.equal(person.status, 'dead', `${person.name} (${person.id}) sollte verstorben sein`);
    });

  assert.deepEqual(
    graph.getChildren('iarlaith-descendant-ard-conbhron').map(person => person.id).sort(),
    ['scathach-ard-conbhron', 'uathach-ard-conbhron']
  );

  // Frauen werden auch in diesem Clan wegverheiratet: Clodagh nach Gwefrydd, Caireen nach Draig.
  assert.equal(family.persons.find(person => person.id === 'clodagh-ard-conbhron').houseId, 'house-ard-conbhron');
  assert.equal(family.persons.find(person => person.id === 'tallwch-gwefrydd').houseId, 'house-gwefrydd');
  assert.equal(family.persons.find(person => person.id === 'caireen-conbhron').houseId, 'house-ard-conbhron');
  assert.equal(family.persons.find(person => person.id === 'llamrei-draig').houseId, 'house-draig');

  // Jede core Ard-Conbhrón-Frau, deren eigene Kinder nicht hier verzeichnet sind
  // (Labhoise ausgenommen, deren Sohn über den Zeitsprung hier fortlebt), heiratet
  // sichtbar in ein anderes Haus weg.
  const marriedAwayTargets = {
    'married-away-gwefrydd-clodagh': 'haus-gwefrydd',
    'married-away-talamh-liadan': 'haus-talamh',
    'married-away-draig-caireen': 'haus-draig',
    'married-away-searlait-grainne': 'haus-searlait',
    'married-away-talamh-ragnailt': 'haus-talamh'
  };
  assert.equal(family.cadetBranches.length, Object.keys(marriedAwayTargets).length);
  Object.entries(marriedAwayTargets).forEach(([branchId, targetFamilyId]) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.ok(branch, `${branchId} fehlt`);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.targetFamilyId, targetFamilyId);
  });

  assert.equal(family.view.focusPersonId, 'ahnherr-ard-conbhron');
});

test('Clodagh, Tallwch, Caireen und Llamrei sind über Gwefrydd/Draig hinweg dieselben Weltpersonen wie in Haus Ard Conbhrón', () => {
  const ardConbhron = assertValidFamily(HOUSE_ARD_CONBHRON_FAMILY).family;
  const gwefrydd = assertValidFamily(HOUSE_GWEFRYDD_FAMILY).family;
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;

  [
    ['clodagh-ard-conbhron', gwefrydd],
    ['tallwch-gwefrydd', gwefrydd],
    ['caireen-conbhron', draig],
    ['llamrei-draig', draig]
  ].forEach(([personId, otherFamily]) => {
    const here = ardConbhron.persons.find(person => person.id === personId);
    const there = otherFamily.persons.find(person => person.id === personId);
    assert.ok(here, `${personId} fehlt in Haus Ard Conbhrón`);
    assert.ok(there, `${personId} fehlt in der Vergleichsfamilie`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} besitzt widersprüchliche Weltpersonen-IDs.`);
  });

  assert.equal(
    gwefrydd.houses.find(house => house.id === 'house-ard-conbhron').emblem,
    'assets/images/houses/Antike Crannath Clans/haus-ard-conbhron.png'
  );
  assert.equal(
    draig.houses.find(house => house.id === 'house-ard-conbhron').emblem,
    'assets/images/houses/Antike Crannath Clans/haus-ard-conbhron.png'
  );
});

test('bildet das antike Fürstengeschlecht Ui Talamh ab, das vollständig in andere Häuser eingeheiratet ist', () => {
  const family = assertValidFamily(HOUSE_UI_TALAMH_FAMILY).family;
  assert.equal(family.persons.length, 25);
  assert.equal(family.document.houseProfile.rankId, 'ard-tiarna');

  const graph = createFamilyGraph(family);

  // Gründerpaar ist nicht überliefert (Unbekannter Ahnherr/Unbekannte Ahnfrau); erst
  // nach dem Zeitsprung setzt Faolan als erste namentlich bekannte Generation fort.
  const ahnherr = family.persons.find(person => person.id === 'ahnherr-talamh');
  assert.equal(ahnherr.name, 'Unbekannter Ahnherr');
  assert.equal(ahnherr.houseId, 'house-talamh');
  assert.equal(ahnherr.familyRole, 'core');
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.timeJumps.length, 0);
  assert.deepEqual(graph.getChildren('ahnherr-talamh').map(person => person.id), ['faolan-talamh']);

  const faolan = family.persons.find(person => person.id === 'faolan-talamh');
  assert.equal(faolan.houseId, 'house-talamh');
  assert.equal(faolan.familyRole, 'core');

  assert.deepEqual(graph.getChildren('faolan-talamh').map(person => person.id).sort(), [
    'cathan-talamh', 'fiodhna-talamh', 'fionnuala-talamh', 'maoladh-talamh', 'roibeard-talamh'
  ]);

  // Alle fünf Kinder Faolans heiraten Partner mit bereits andernorts belegter Identität
  // oder bleiben ohne Nachkommen; Ui Talamh besteht heute nicht mehr eigenständig fort.
  assert.deepEqual(graph.getChildren('roibeard-talamh').map(person => person.id).sort(), ['blathnaid-talamh', 'cormac-talamh']);
  assert.deepEqual(graph.getChildren('cormac-talamh').map(person => person.id).sort(), ['eibhlin-talamh', 'murchadh-talamh']);
  assert.deepEqual(graph.getChildren('murchadh-talamh').map(person => person.id).sort(), ['fiona-talamh', 'mairin-talamh']);

  // Ausnahmslos alle Ui Talamh sind verstorben; anders als Ard Conbhrón gibt es keine
  // lebenden Nachfahren mehr, nur noch die Ehen in andere Häuser.
  family.persons.forEach(person => {
    assert.equal(person.status, 'dead', `${person.name} (${person.id}) sollte verstorben sein`);
  });

  // Jede core Ui-Talamh-Frau, deren eigene Kinder nicht hier verzeichnet sind, heiratet
  // sichtbar in ein anderes (bereits bekanntes) Haus weg.
  const marriedAwayTargets = {
    'married-away-ard-conbhron-fionnuala': 'haus-ard-conbhron',
    'married-away-gafyr-fiodhna': 'haus-gafyr',
    'married-away-draig-blathnaid': 'haus-draig',
    'married-away-diulb-eibhlin': 'haus-diulb',
    'married-away-searlait-fiona': 'haus-searlait',
    'married-away-cumhail-mairin': 'haus-cumhail'
  };
  assert.equal(family.cadetBranches.length, Object.keys(marriedAwayTargets).length);
  Object.entries(marriedAwayTargets).forEach(([branchId, targetFamilyId]) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.ok(branch, `${branchId} fehlt`);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.targetFamilyId, targetFamilyId);
  });

  assert.equal(family.view.focusPersonId, 'ahnherr-talamh');
});

test('Dónall, Fíodhna/Garym, Líadan, Blathnaid/Grugyn und Ragnailt sind über Ard Conbhrón/Gafyr/Draig hinweg dieselben Weltpersonen wie in Haus Ui Talamh', () => {
  const uiTalamh = assertValidFamily(HOUSE_UI_TALAMH_FAMILY).family;
  const ardConbhron = assertValidFamily(HOUSE_ARD_CONBHRON_FAMILY).family;
  const gafyr = assertValidFamily(HOUSE_GAFYR_FAMILY).family;
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;

  [
    ['donall-ard-conbhron', ardConbhron],
    ['liadan-ard-conbhron', ardConbhron],
    ['ragnailt-ard-conbhron', ardConbhron],
    ['garym-gafyr', gafyr],
    ['blathnaid-talamh', draig],
    ['grugyn-draig', draig]
  ].forEach(([personId, otherFamily]) => {
    const here = uiTalamh.persons.find(person => person.id === personId);
    const there = otherFamily.persons.find(person => person.id === personId);
    assert.ok(here, `${personId} fehlt in Haus Ui Talamh`);
    assert.ok(there, `${personId} fehlt in der Vergleichsfamilie`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} besitzt widersprüchliche Weltpersonen-IDs.`);
  });

  // Blathnaid ist in Ui Talamh core (ihr Heimathaus), in Draig eine eingeheiratete Fremde.
  assert.equal(uiTalamh.persons.find(person => person.id === 'blathnaid-talamh').houseId, 'house-talamh');
  assert.equal(uiTalamh.persons.find(person => person.id === 'blathnaid-talamh').familyRole, 'core');
  assert.equal(draig.persons.find(person => person.id === 'blathnaid-talamh').familyRole, 'married');

  assert.equal(
    ardConbhron.houses.find(house => house.id === 'house-talamh').emblem,
    'assets/images/houses/Antike Crannath Clans/haus-ui-talamh.png'
  );
  assert.equal(
    gafyr.houses.find(house => house.id === 'house-talamh').emblem,
    'assets/images/houses/Antike Crannath Clans/haus-ui-talamh.png'
  );
  assert.equal(
    draig.houses.find(house => house.id === 'house-talamh').emblem,
    'assets/images/houses/Antike Crannath Clans/haus-ui-talamh.png'
  );
});

test('bildet die Königsdynastie Haus Pendrag von Vortigern bis zur Regentschaft König Tristans ab', () => {
  const family = assertValidFamily(HOUSE_PENDRAG_FAMILY).family;
  assert.equal(family.document.houseProfile.rankId, 'royal');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-vortigern-rhiannon');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.view.focusPersonId, 'vortigern-pendrag');

  const graph = createFamilyGraph(family);

  // Ursprungshaus Dreigiau: Vortigern und Celtigern (Haus Draig) sind Brüder, Kinder
  // Gwyrtherns und Gwendolyns, vorgelagert über einen originHouse-Ursprungsknoten.
  assert.equal(family.lineage.originHouse.enabled, true);
  assert.equal(family.lineage.originHouse.houseId, 'house-dreigiau');
  assert.deepEqual(family.lineage.originHouse.childIds, ['gwyrthern-dreigiau', 'rhonwen-dreigiau', 'kerrylin-dreigiau']);
  assert.deepEqual(
    graph.getChildren('gwyrthern-dreigiau').map(person => person.id).sort(),
    ['celtigern-draig', 'gwenhwyfar-dreigiau', 'morgaine-dreigiau', 'vortigern-pendrag', 'vortimer-dreigiau']
  );

  const vortigern = family.persons.find(person => person.id === 'vortigern-pendrag');
  assert.equal(vortigern.houseId, 'house-pendrag');
  assert.equal(vortigern.familyRole, 'core');
  assert.deepEqual(
    graph.getChildren('vortigern-pendrag').map(person => person.id).sort(),
    ['geraint-pendrag', 'malagant-pendrag', 'tanwen-pendrag', 'uther-pendrag']
  );

  // Die 15 Könige der Erbfolge (per Oberhaupt-Galerie der Vorlage bestätigt), von
  // Vortigern I. bis zum regierenden König Tristan.
  const kingSuccession = [
    'vortigern-pendrag', 'uther-pendrag', 'parzifal-pendrag', 'malon-pendrag', 'melwas-pendrag',
    'griflet-pendrag', 'galahad-pendrag', 'agravaine-pendrag', 'gawain-pendragon', 'gareth-pendrag',
    'bors-pendrag', 'artus-1622-pendrag', 'uther-1643-pendrag', 'rywalyn-pendrag', 'tristan-pendrag'
  ];
  kingSuccession.forEach(personId => {
    const king = family.persons.find(person => person.id === personId);
    assert.ok(king, `${personId} fehlt`);
    assert.equal(king.lineageRole, 'head', `${personId} sollte als Oberhaupt markiert sein`);
  });

  // König Agravaine blieb kinderlos; die Krone ging seitlich auf den Sohn seines
  // (bereits vorverstorbenen) Bruders Rhodri über, nicht auf einen eigenen Erben.
  const agravaine = family.persons.find(person => person.id === 'agravaine-pendrag');
  assert.equal(agravaine.death, '1600');
  assert.deepEqual(graph.getChildren('agravaine-pendrag'), []);
  assert.deepEqual(graph.getChildren('rhodri-pendrag').map(person => person.id).sort(), [
    'arianwen-pendragon', 'gawain-pendragon', 'tarwen-pendrag'
  ]);

  // Trystan Pendrag und Malltwyn Draig begründen das Kadettenhaus Grael.
  const graelBranch = family.cadetBranches.find(entry => entry.id === 'cadet-grael-trystan');
  assert.ok(graelBranch, 'cadet-grael-trystan fehlt');
  assert.equal(graelBranch.linkType, 'cadet-house');
  assert.equal(graelBranch.parentPartnershipId, 'marriage-malltwyn-trystan');
  assert.equal(graelBranch.houseId, 'house-grael');

  // Sulwen Pendrag heiratet Howell Neidr; Cei ist Lucans Sohn, Lucan wiederum
  // Lamoraks Sohn (nicht Uthers 1643 Sohn); Pelleas und Rhiannon (1673) sind Bedivere
  // und Fearcharas Kinder (nicht Uther 1643s).
  assert.deepEqual(graph.getChildren('uther-1643-pendrag').map(person => person.id).sort(), [
    'angharad-pendrag', 'rywalyn-pendrag'
  ]);
  assert.deepEqual(graph.getChildren('lamorak-pendrag').map(person => person.id), ['lucan-pendrag']);
  assert.deepEqual(graph.getChildren('lucan-pendrag').map(person => person.id).sort(), ['cei-pendrag', 'ygraine-pendrag']);
  assert.deepEqual(graph.getChildren('bedivere-pendrag').map(person => person.id).sort(), [
    'pelleas-pendrag', 'rhiannon-1673-pendrag'
  ]);
  const sulwenBranch = family.cadetBranches.find(entry => entry.id === 'married-away-neidr-sulwen');
  assert.ok(sulwenBranch, 'married-away-neidr-sulwen fehlt');
  assert.equal(sulwenBranch.targetFamilyId, 'haus-neidr');

  // Owain Draig (bereits mit fünf Affären in Haus Draig belegt) hat mit Ygraine Pendrag
  // eine sechste Affäre, aus der zwei nachträglich legitimierte Bastard-Söhne hervorgehen.
  const affair = family.partnerships.find(partnership => partnership.id === 'affair-ygraine-owain');
  assert.equal(affair.type, 'affair');
  assert.deepEqual(affair.participantIds, ['ygraine-pendrag', 'owain-draig']);
  ['ector-1716-pendrag', 'melwas-1716-pendrag'].forEach(childId => {
    const parentage = family.parentages.find(entry => entry.childId === childId);
    assert.equal(parentage.legitimacy, 'legitimized');
    assert.equal(parentage.partnershipId, 'affair-ygraine-owain');
    const person = family.persons.find(entry => entry.id === childId);
    assert.equal(person.familyRole, 'bastard');
  });

  // Khepri/Gekas sind nur von Ygraine adoptiert (adoptive, ein Elternteil, kein
  // leibliches Kind); Lancelot Neidr ist ein von Haus Neidr gegebenes Mündel (foster).
  ['khepri-pendrag', 'gekas-pendrag'].forEach(childId => {
    const parentage = family.parentages.find(entry => entry.childId === childId);
    assert.equal(parentage.type, 'adoptive');
    assert.deepEqual(parentage.parentIds, ['ygraine-pendrag']);
    assert.equal(parentage.partnershipId, '');
    const person = family.persons.find(entry => entry.id === childId);
    assert.equal(person.familyRole, 'adopted');
  });
  const lancelotParentage = family.parentages.find(entry => entry.childId === 'lancelot-neidr');
  assert.equal(lancelotParentage.type, 'foster');
  assert.equal(lancelotParentage.partnershipId, '');
  assert.equal(family.persons.find(entry => entry.id === 'lancelot-neidr').familyRole, 'ward');

  // Jede core-Pendrag-Frau, deren eigene Kinder nicht in dieser Datei verzeichnet sind
  // (weil sie ins Haus ihres Mannes weggeheiratet ist), erhält eine sichtbare
  // Wegverheiratet-Linie.
  const marriedAwayTargets = {
    'married-away-draig-tanwen': 'haus-draig',
    'married-away-draig-arianwyn': 'haus-draig',
    'married-away-draig-gwyneira': 'haus-draig',
    'married-away-draig-cerridwyn': 'haus-draig',
    'married-away-draig-arianwen': 'haus-draig',
    'married-away-draig-angharad': 'haus-draig',
    'married-away-ceirwyn-rhoslyn': 'haus-ceirwyn',
    'married-away-neidr-sulwen': 'haus-neidr',
    'married-away-pysgod-tarwen': 'haus-pysgod',
    'married-away-wylan-iesin': 'haus-wylan',
    'married-away-illewod-blodeuyn': 'haus-illewod',
    'married-away-aderyn-caradwyn': 'haus-aderyn',
    'married-away-urquhart-meeghan': 'haus-urquhart',
    'married-away-grael-rhiannon': 'haus-grael'
  };
  assert.equal(family.cadetBranches.length, Object.keys(marriedAwayTargets).length + 1, 'Wegverheiratet-Zweige plus der eine Kadettenhaus-Zweig (Grael)');
  Object.entries(marriedAwayTargets).forEach(([branchId, targetFamilyId]) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.ok(branch, `${branchId} fehlt`);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.targetFamilyId, targetFamilyId);
  });
});

test('Vortigerns Draig-eingeheiratete Verwandte (Rhianu, Artus, Isobel, Godwyn, Isolde, Morholt, Marared, Caitrin, Cunedda, Rhodri, Owain) sind über Haus Draig hinweg dieselben Weltpersonen wie in Haus Pendrag', () => {
  const pendrag = assertValidFamily(HOUSE_PENDRAG_FAMILY).family;
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;

  [
    'rhianu-draig', 'artus-draig', 'isobel-ancient-draig', 'godwyn-draig', 'malltwyn-draig',
    'isolde-ancient-draig', 'morholt-draig', 'marared-draig', 'caitrin-draig', 'cunedda-draig',
    'rhodri-draig', 'owain-draig'
  ].forEach(personId => {
    const here = pendrag.persons.find(person => person.id === personId);
    const there = draig.persons.find(person => person.id === personId);
    assert.ok(here, `${personId} fehlt in Haus Pendrag`);
    assert.ok(there, `${personId} fehlt in Haus Draig`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} besitzt widersprüchliche Weltpersonen-IDs.`);
    assert.equal(here.houseId, 'house-draig');
    assert.equal(here.familyRole, 'married', `${personId} sollte in Pendrag als eingeheiratet gelten`);
  });

  // Umgekehrt: Pendrag-Frauen, die nach Draig weggeheiratet sind, sind dort core.
  [
    'tanwen-pendrag', 'arianwyn-pendrag', 'gwyneira-pendrag', 'cerridwyn-pendrag',
    'arianwen-pendragon', 'angharad-pendrag'
  ].forEach(personId => {
    const here = pendrag.persons.find(person => person.id === personId);
    const there = draig.persons.find(person => person.id === personId);
    assert.ok(there, `${personId} fehlt in Haus Draig`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} besitzt widersprüchliche Weltpersonen-IDs.`);
    assert.equal(here.houseId, 'house-pendrag');
    assert.equal(here.familyRole, 'core');
  });

  assert.equal(
    draig.houses.find(house => house.id === 'house-pendrag').name,
    'Haus Pendrag'
  );
});

test('bildet die Grafenlinie Haus Illewod von Bedwyr bis zur Gegenwart 1740 ab', () => {
  const family = assertValidFamily(HOUSE_ILLEWOD_FAMILY).family;
  assert.equal(family.document.houseProfile.rankId, 'county');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-bedwyr-athracht');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.view.focusPersonId, 'bedwyr-illewod');
  assert.equal(family.timeJumps.length, 5);

  const graph = createFamilyGraph(family);

  const bedwyr = family.persons.find(person => person.id === 'bedwyr-illewod');
  assert.equal(bedwyr.houseId, 'house-illewod');
  assert.equal(bedwyr.familyRole, 'core');
  assert.deepEqual(
    graph.getChildren('bedwyr-illewod').map(person => person.id).sort(),
    ['kyvwlch-illewod', 'sabria-illewod']
  );

  // Die 11 Grafen der Erbfolge (per Oberhaupt-Galerie der Vorlage bestätigt).
  const grafSuccession = [
    'bedwyr-illewod', 'kyvwlch-illewod', 'mathonwy-illewod', 'maldwyn-illewod', 'berwyn-illewod',
    'penryn-illewod', 'keudawg-illewod', 'iorwerth-illewod', 'selwyn-illewod', 'arthgal-illewod',
    'merwin-illewod'
  ];
  grafSuccession.forEach(personId => {
    const graf = family.persons.find(person => person.id === personId);
    assert.ok(graf, `${personId} fehlt`);
    assert.equal(graf.lineageRole, 'head', `${personId} sollte als Oberhaupt markiert sein`);
  });

  // Dymphna/Deaglan Gallchobhair sind leibliche Kinder Analis & Tynans, aber als
  // Mündel an Merwin gegeben (nur Merwin als Elternteil, keine Partnerschaft).
  ['dymphna-gallchobhair', 'deaglan-gallchobhair'].forEach(childId => {
    const parentage = family.parentages.find(entry => entry.childId === childId);
    assert.equal(parentage.type, 'foster');
    assert.deepEqual(parentage.parentIds, ['merwin-illewod']);
    assert.equal(parentage.partnershipId, '');
    assert.equal(family.persons.find(entry => entry.id === childId).familyRole, 'adopted');
  });

  // Sayres Illewod (Haus Saethwyr) und Keudawg Illewod (Haus Pendrag) sind bereits
  // andernorts belegte Ehen; ihre Kinder Collen/Célyn bzw. die Kinder Keudawgs &
  // Blodeuyns laufen über dieselben, dort schon vergebenen Partnerschafts-IDs.
  assert.deepEqual(graph.getChildren('sayres-illewod').map(person => person.id).sort(), ['celyn-illewod', 'collen-illewod']);
  assert.deepEqual(
    graph.getChildren('keudawg-illewod').map(person => person.id).sort(),
    ['gareth-illewod', 'gwales-illewod', 'iorwerth-illewod', 'karys-illewod', 'lowri-illewod']
  );

  // Jede core-Illewod-Frau, deren eigene Kinder nicht in dieser Datei verzeichnet
  // sind, erhält eine sichtbare Wegverheiratet-Linie. Pebin "der Fuchs" hat kein
  // eigenes Haus, daher bekommt Marwynne bewusst KEINEN Zweig.
  const marriedAwayTargets = {
    'married-away-neidr-sabria': 'haus-neidr',
    'married-away-wylan-ysolde': 'haus-wylan',
    'married-away-aderyn-ffion': 'haus-aderyn',
    'married-away-eoghhainn-rhianu': 'haus-eoghhainn',
    'married-away-teyrngarch-morgaine': 'haus-teyrngarch',
    'married-away-neidr-karys': 'haus-neidr',
    'married-away-blach-lowri': 'haus-blach',
    'married-away-tylluan-evaine': 'haus-tylluan',
    'married-away-llwynog-ehangwen': 'haus-llwynog',
    'married-away-blach-carwyn': 'haus-blach',
    'married-away-aderyn-mifawi': 'haus-aderyn',
    'married-away-pysgod-mairwen': 'haus-pysgod',
    'married-away-llwynog-kerris': 'haus-llwynog',
    'married-away-gallchobhair-anali': 'haus-gallchobhair'
  };
  assert.equal(family.cadetBranches.length, Object.keys(marriedAwayTargets).length);
  Object.entries(marriedAwayTargets).forEach(([branchId, targetFamilyId]) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.ok(branch, `${branchId} fehlt`);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.targetFamilyId, targetFamilyId);
  });
  assert.equal(family.cadetBranches.some(entry => entry.id.includes('marwynne')), false);
});

test('Kyvwlch/Selwyn (Haus Draig) und Sayres (Haus Saethwyr) sind über beide Häuser hinweg dieselben Weltpersonen wie in Haus Illewod', () => {
  const illewod = assertValidFamily(HOUSE_ILLEWOD_FAMILY).family;
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const saethwyr = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;

  [
    ['kyvwlch-illewod', draig],
    ['selwyn-illewod', draig],
    ['gwendolyn-ancient-draig', draig],
    ['maygan-draig', draig],
    ['sayres-illewod', saethwyr],
    ['gwawr-saethwyr', saethwyr]
  ].forEach(([personId, otherFamily]) => {
    const here = illewod.persons.find(person => person.id === personId);
    const there = otherFamily.persons.find(person => person.id === personId);
    assert.ok(here, `${personId} fehlt in Haus Illewod`);
    assert.ok(there, `${personId} fehlt in der Vergleichsfamilie`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} besitzt widersprüchliche Weltpersonen-IDs.`);
  });

  // Kyvwlch/Selwyn/Sayres sind in Illewod core, ihre eingeheirateten Partnerinnen
  // (Gwendolyn/Maygan/Gwawr) sind dort eingeheiratet (married).
  ['kyvwlch-illewod', 'selwyn-illewod', 'sayres-illewod'].forEach(personId => {
    assert.equal(illewod.persons.find(person => person.id === personId).familyRole, 'core');
  });
  ['gwendolyn-ancient-draig', 'maygan-draig', 'gwawr-saethwyr'].forEach(personId => {
    assert.equal(illewod.persons.find(person => person.id === personId).familyRole, 'married');
  });
});

test('bereitet die Orts-Hierarchie der acht übrigen Grafschaften Cenyrs vor (Pendrag königlich, Blodyn bewusst ausgenommen)', async () => {
  const expected = {
    wylan: { rankId: 'county', path: ['Cenyr', 'Weidebucht', 'Cerrigarth'], countyEmblem: 'assets/images/regions/weidebucht.png' },
    illewod: { rankId: 'county', path: ['Cenyr', 'Sonnenküste', 'Aberon'], countyEmblem: 'assets/images/regions/sonnenkueste.png' },
    pendrag: { rankId: 'royal', path: ['Cenyr', 'Vortigerns Ruh', 'Mathragon'], countyEmblem: 'assets/images/regions/vortigerns-ruh.png' },
    grawn: { rankId: 'county', path: ['Cenyr', 'Ährental', 'Glyndraith'], countyEmblem: 'assets/images/regions/aehrental.png' },
    neidr: { rankId: 'county', path: ['Cenyr', 'Silberinsel', 'Llanvane'], countyEmblem: 'assets/images/regions/silberinsel.png' },
    pysgod: { rankId: 'county', path: ['Cenyr', 'Graue Weite', 'Tredegar'], countyEmblem: 'assets/images/regions/graue-weite.png' },
    arth: { rankId: 'county', path: ['Cenyr', 'Klaueninsel', 'Talgarth'], countyEmblem: 'assets/images/regions/klaueninsel.png' },
    aderyn: { rankId: 'county', path: ['Cenyr', 'Tal der Milane', 'Penbryn'], countyEmblem: 'assets/images/regions/tal-der-milane.png' }
  };
  assert.deepEqual(Object.keys(CENYR_COUNTY_HOUSE_PROFILES).sort(), Object.keys(expected).sort());
  // Celtigerns Wacht/Draig und Blodyn (keine eigene Grafschaft) sind bewusst nicht enthalten.
  assert.ok(!('draig' in CENYR_COUNTY_HOUSE_PROFILES));
  assert.ok(!('blodyn' in CENYR_COUNTY_HOUSE_PROFILES));

  Object.entries(expected).forEach(([key, { rankId, path, countyEmblem }]) => {
    const profile = CENYR_COUNTY_HOUSE_PROFILES[key];
    assert.deepEqual(createFolderPathFromHouseProfile(profile), path, `${key}: Orts-Pfad`);
    assert.equal(profile.rankId, rankId, `${key}: Rang`);
    assert.equal(profile.regionEmblems.county, countyEmblem, `${key}: Grafschafts-Wappen`);
    // Keine erfundene Baronie-Ebene: die acht Grafschaften sind (noch) nicht unterteilt.
    assert.equal(profile.barony, '');
    assert.match(profile.regionEmblems.kingdom, /^assets\/images\/regions\//);
  });
  assert.equal(getHouseRank('royal').label, 'Königsgeschlecht');

  // Alle heruntergeladenen Wappenbilder liegen tatsächlich im Projekt.
  const countyEmblemFiles = Object.values(expected).map(entry => entry.countyEmblem);
  await Promise.all(countyEmblemFiles.map(async path => {
    const image = await readFile(new URL(`../${path}`, import.meta.url));
    assert.ok(image.length > 100, `Wappenbild leer: ${path}`);
  }));
  const houseCrestFiles = [
    'assets/images/houses/Weidebucht/haus-wylan.png',
    'assets/images/houses/Sonnenküste/haus-illewod.png',
    'assets/images/houses/Vortigerns Ruh/haus-pendrag.png',
    'assets/images/houses/Ährental/haus-grawn.png',
    'assets/images/houses/Silberinsel/haus-neidr.png',
    'assets/images/houses/Graue Weite/haus-pysgod.png',
    'assets/images/houses/Klaueninsel/haus-arth.png',
    'assets/images/houses/Tal der Milane/haus-aderyn.png'
  ];
  await Promise.all(houseCrestFiles.map(async path => {
    const image = await readFile(new URL(`../${path}`, import.meta.url));
    assert.ok(image.length > 100, `Wappenbild leer: ${path}`);
  }));
});

test('legt Platzhalter-Gründerpaare für die 8 übrigen Grafenhäuser Cenyrs an, mit goldenem statt silbernem Wappenrahmen', () => {
  assert.equal(CENYR_COUNTY_HOUSE_FAMILIES.length, 8);

  CENYR_COUNTY_HOUSE_FAMILIES.forEach(family => {
    assert.equal(assertValidFamily(family).diagnostics.filter(item => item.severity === 'error').length, 0, `${family.document.id} sollte fehlerfrei sein`);
    // Pendrag und Illewod sind inzwischen ausgearbeitet (siehe eigene Tests weiter
    // unten) und haben daher kein bloßes Platzhalter-Gründerpaar mehr.
    if (family.document.id !== 'haus-pendrag' && family.document.id !== 'haus-illewod') {
      assert.equal(family.persons.length, 2, `${family.document.id}: Platzhalter-Gründerpaar`);
    }
    // Grafen-/Königsrang statt Ritterherr: goldener, nicht silberner Wappenrahmen.
    assert.equal(family.lineage.crestFrame, 'gold', `${family.document.id} sollte einen goldenen Wappenrahmen tragen`);
    assert.match(family.document.emblem, /^assets\/images\/houses\//);
  });

  const ids = CENYR_COUNTY_HOUSE_FAMILIES.map(family => family.document.id);
  assert.equal(new Set(ids).size, ids.length, 'alle 8 Häuser brauchen eindeutige IDs');
  assert.equal(ids.includes('haus-draig'), false, 'Haus Draig/Celtigerns Wacht ist bereits ausgearbeitet');
  assert.equal(ids.includes('haus-blodyn'), false, 'Blodyn O\'Llyndor hat laut Vorlage keine eigene Grafschaft und bleibt ausgenommen');

  const pendrag = CENYR_COUNTY_HOUSE_FAMILIES.find(family => family.document.id === 'haus-pendrag');
  assert.equal(pendrag.document.houseProfile.rankId, 'royal');
  assert.equal(pendrag.document.title, 'Haus Pendrag');

  const storage = createMemoryStorage();
  const wylan = loadFamilyById('haus-wylan', storage);
  assert.ok(wylan, 'Haus Wylan sollte über das Register ladbar sein');
  assert.equal(wylan.folderPath.join(' > '), 'Cenyr > Weidebucht > Cerrigarth');
  const pendragRecord = loadFamilyById('haus-pendrag', storage);
  assert.equal(pendragRecord.folderPath.join(' > '), 'Cenyr > Vortigerns Ruh > Mathragon');
  assert.equal(pendragRecord.family.document.houseProfile.rankId, 'royal');
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
