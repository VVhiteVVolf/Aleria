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
import { HOUSE_PENDRAG_PORTRAITS } from '../assets/js/data/house-pendrag-portraits.js';
import { HOUSE_ILLEWOD_FAMILY } from '../assets/js/data/house-illewod-family.js';
import { HOUSE_ILLEWOD_PORTRAITS } from '../assets/js/data/house-illewod-portraits.js';
import { HOUSE_NEIDR_FAMILY } from '../assets/js/data/house-neidr-family.js';
import { HOUSE_NEIDR_PORTRAITS } from '../assets/js/data/house-neidr-portraits.js';
import { HOUSE_GRAWN_FAMILY } from '../assets/js/data/house-grawn-family.js';
import { HOUSE_GRAWN_PORTRAITS } from '../assets/js/data/house-grawn-portraits.js';
import { HOUSE_ADERYN_FAMILY } from '../assets/js/data/house-aderyn-family.js';
import { HOUSE_ADERYN_PORTRAITS } from '../assets/js/data/house-aderyn-portraits.js';
import { HOUSE_ILLYSYWEN_PORTRAITS } from '../assets/js/data/house-illysywen-portraits.js';
import { HOUSE_TLAWD_FAMILY } from '../assets/js/data/house-tlawd-family.js';
import { HOUSE_TLAWD_PORTRAITS } from '../assets/js/data/house-tlawd-portraits.js';
import { HOUSE_ANNWYL_FAMILY } from '../assets/js/data/house-annwyl-family.js';
import { HOUSE_ANNWYL_PORTRAITS } from '../assets/js/data/house-annwyl-portraits.js';
import { HOUSE_BARUS_FAMILY } from '../assets/js/data/house-barus-family.js';
import { HOUSE_BARUS_PORTRAITS } from '../assets/js/data/house-barus-portraits.js';
import { HOUSE_CAERLAEN_FAMILY } from '../assets/js/data/house-caerlaen-family.js';
import { HOUSE_CAERLAEN_PORTRAITS } from '../assets/js/data/house-caerlaen-portraits.js';
import { HOUSE_CAERTHWYN_FAMILY } from '../assets/js/data/house-caerthwyn-family.js';
import { HOUSE_CAERTHWYN_PORTRAITS } from '../assets/js/data/house-caerthwyn-portraits.js';
import { HOUSE_CENFIG_FAMILY } from '../assets/js/data/house-cenfig-family.js';
import { HOUSE_CENFIG_PORTRAITS } from '../assets/js/data/house-cenfig-portraits.js';
import { HOUSE_CYSGODION_FAMILY } from '../assets/js/data/house-cysgodion-family.js';
import { HOUSE_CYSGODION_PORTRAITS } from '../assets/js/data/house-cysgodion-portraits.js';
import { HOUSE_DARAN_FAMILY } from '../assets/js/data/house-daran-family.js';
import { HOUSE_DARAN_PORTRAITS } from '../assets/js/data/house-daran-portraits.js';
import { HOUSE_EDMY_FAMILY } from '../assets/js/data/house-edmy-family.js';
import { HOUSE_EDMY_PORTRAITS } from '../assets/js/data/house-edmy-portraits.js';
import { HOUSE_GWYNTOG_FAMILY } from '../assets/js/data/house-gwyntog-family.js';
import { HOUSE_GWYNTOG_PORTRAITS } from '../assets/js/data/house-gwyntog-portraits.js';
import { HOUSE_TRYDAR_FAMILY } from '../assets/js/data/house-trydar-family.js';
import { HOUSE_TRYDAR_PORTRAITS } from '../assets/js/data/house-trydar-portraits.js';
import { HOUSE_TARANVYR_FAMILY } from '../assets/js/data/house-taranvyr-family.js';
import { HOUSE_TARANVYR_PORTRAITS } from '../assets/js/data/house-taranvyr-portraits.js';
import { HOUSE_TAWELGAR_FAMILY } from '../assets/js/data/house-tawelgar-family.js';
import { HOUSE_TAWELGAR_PORTRAITS } from '../assets/js/data/house-tawelgar-portraits.js';
import { HOUSE_YMLADD_FAMILY } from '../assets/js/data/house-ymladd-family.js';
import { HOUSE_YMLADD_PORTRAITS } from '../assets/js/data/house-ymladd-portraits.js';
import { HOUSE_RHUDDGAR_FAMILY } from '../assets/js/data/house-rhuddgar-family.js';
import { HOUSE_RHUDDGAR_PORTRAITS } from '../assets/js/data/house-rhuddgar-portraits.js';
import { HOUSE_PENWYN_FAMILY } from '../assets/js/data/house-penwyn-family.js';
import { HOUSE_PENWYN_PORTRAITS } from '../assets/js/data/house-penwyn-portraits.js';
import { HOUSE_SELDRYN_FAMILY } from '../assets/js/data/house-seldryn-family.js';
import { HOUSE_SELDRYN_PORTRAITS } from '../assets/js/data/house-seldryn-portraits.js';
import { HOUSE_SELOG_FAMILY } from '../assets/js/data/house-selog-family.js';
import { HOUSE_SELOG_PORTRAITS } from '../assets/js/data/house-selog-portraits.js';
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
  buildImportedPersonName,
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
  GWYNTHOR_COMMONER_HOUSE_DEFINITIONS,
  GWYNTHOR_COMMONER_HOUSE_FAMILIES
} from '../assets/js/data/gwynthor-commoner-house-families.js';
import { HOUSE_DRAENMELYN_FAMILY } from '../assets/js/data/house-draenmelyn-family.js';
import { HOUSE_DRAENMELYN_PORTRAITS } from '../assets/js/data/house-draenmelyn-portraits.js';
import { HOUSE_PENDRWN_FAMILY } from '../assets/js/data/house-pendrwn-family.js';
import { HOUSE_PENDRWN_PORTRAITS } from '../assets/js/data/house-pendrwn-portraits.js';
import { HOUSE_SWYLL_FAMILY } from '../assets/js/data/house-swyll-family.js';
import { HOUSE_SWYLL_PORTRAITS } from '../assets/js/data/house-swyll-portraits.js';
import { DRAENMELYN_SWYLL_MARRIAGE } from '../assets/js/data/draenmelyn-swyll-marriage.js';
import {
  PENDRWN_DRAENMELYN_MARRIAGE,
  PENDRWN_SWYLL_MARRIAGE
} from '../assets/js/data/pendrwn-cross-family-marriages.js';
import { HOUSE_YSGRIF_FAMILY } from '../assets/js/data/house-ysgrif-family.js';
import { HOUSE_YSGRIF_PORTRAITS } from '../assets/js/data/house-ysgrif-portraits.js';
import {
  RHONWENS_TRAENEN_HOUSE_DEFINITIONS,
  RHONWENS_TRAENEN_HOUSE_FAMILIES
} from '../assets/js/data/rhonwens-traenen-house-families.js';
import {
  createExtinctPlaceholderHouseFamily,
  createFounderPlaceholderHouseFamily,
  createFounderTimeJumpPlaceholderHouseFamily
} from '../assets/js/data/blank-house-family-factory.js';
import { createFamilyGraph } from '../assets/js/domain/family-graph.js';
import {
  commitFounderCouple,
  createEmptyFamily,
  createFamilyProfileDraft,
  createFoundingFamily
} from '../assets/js/domain/family-factory.js';
import {
  deriveFocusedContinuationPhase,
  deriveTreeGeneratorPhase
} from '../assets/js/domain/tree-generator-phase.js';
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
import { resolveRegisteredFamilyUpgrade } from '../assets/js/services/family-registry-upgrade.js';
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
  findLineageBarrier,
  houseContinuationActions,
  primaryNodeActions
} from '../assets/js/modules/tree-node-actions/tree-node-actions-model.js';
import {
  applyExclusivePartnershipChange,
  planExclusivePartnershipChange
} from '../assets/js/modules/relationships/exclusive-partnership-policy.js';
import {
  createMirroredPartnershipChange,
  updateMirroredPartnershipChange
} from '../assets/js/modules/relationships/cross-family-relationship.js';
import { listLineagePartnerships } from '../assets/js/modules/relationships/lineage-partnership-policy.js';
import {
  childCountForLine,
  GENERATION_PARAMETER_DEFINITIONS,
  normalizeGenerationParams,
  prepareGeneratedChild
} from '../assets/js/modules/tree-generator/generation-policy.js';
import {
  AUTOMATIC_TEMPLATE_GENERATION_LIMITS,
  automaticTemplateOptionsSignature,
  generateAutomaticFamilyTemplate,
  normalizeAutomaticTemplateOptions
} from '../assets/js/modules/tree-generator/automatic-family-template.js';
import { FAMILY_TEMPLATE_DEFINITIONS } from '../assets/js/modules/tree-generator/family-template-catalog.js';
import { createTemplateRandom } from '../assets/js/modules/tree-generator/template-random.js';
import { createTreeGeneratorDialog } from '../assets/js/ui/tree-generator-dialog.js';
import { saveFamilyRecordsAtomically } from '../assets/js/services/family-persistence.js';
import {
  createFamilyChangeSet,
  familyFromRepositoryRecords,
  familyRootRecord,
  isValidFirestoreRecordId
} from '../assets/js/modules/family-sync/family-change-set.js';
import { createFamilySyncController } from '../assets/js/modules/family-sync/family-sync-controller.js';
import { assertMirroredCrossFamilyBatch } from '../assets/js/modules/family-sync/cross-family-sync-invariant.js';
import { createLocalFamilyRepository } from '../assets/js/modules/family-sync/local-family-repository.js';
import { createLatestLocalFamilySource } from '../assets/js/modules/family-sync/latest-local-family-source.js';
import {
  applyPublishedFamilyPriority,
  isStalePublishedPlaceholder
} from '../assets/js/modules/family-sync/published-family-priority.js';
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

test('setzt einen freien Zeitsprung zwingend unter das vorhandene Stammwappen', () => {
  const family = {
    ...SAMPLE_FAMILY,
    lineage: {
      ...SAMPLE_FAMILY.lineage,
      timeGap: { ...SAMPLE_FAMILY.lineage.timeGap, enabled: false }
    },
    timeJumps: [{
      id: 'gap-after-founder-crest',
      parentPartnershipId: 'marriage-aeron-lyria',
      parentPersonId: '',
      childIds: ['cassian-vael', 'maelis-vael'],
      years: 400,
      fromYear: '1252',
      toYear: '1704',
      label: 'Vier Jahrhunderte später',
      notes: '',
      extensions: {}
    }]
  };
  const converted = toFamilyChartData(family);
  const byId = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.aleria.timeJumpId === 'gap-after-founder-crest');

  assert.deepEqual(byId.get('aeron-vael').rels.children, [crest.id]);
  assert.deepEqual(byId.get('lyria-vael').rels.children, [crest.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), ['cassian-vael', 'maelis-vael']);
  assert.deepEqual(byId.get('cassian-vael').rels.parents, [timeJump.id]);
  assert.deepEqual(byId.get('maelis-vael').rels.parents, [timeJump.id]);
});

test('behandelt einen Zeitsprung als alleinige Barriere vor allen Fortsetzungen der Generation', () => {
  const family = {
    ...SAMPLE_FAMILY,
    timeJumps: [{
      id: 'gap-after-cassian',
      parentPartnershipId: 'marriage-cassian-seraphine',
      parentPersonId: '',
      childIds: ['nyra-vael'],
      years: 100,
      fromYear: '1737',
      toYear: '1837',
      label: 'Ein Jahrhundert später',
      notes: '',
      extensions: {}
    }]
  };
  const converted = toFamilyChartData(family);
  const byId = new Map(converted.data.map(node => [node.id, node]));
  const timeJump = converted.data.find(node => node.data.aleria.timeJumpId === 'gap-after-cassian');
  const stage = converted.data.find(node => node.data.nodeKind === 'time-jump-stage');
  const cadet = converted.data.find(node => node.data.aleria.cadetBranchId === 'cadet-sgrechwyr');

  assert.ok(stage);
  assert.deepEqual([...stage.rels.parents].sort(), ['cassian-vael', 'seraphine-thorne'].sort());
  assert.deepEqual(stage.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [stage.id]);
  assert.deepEqual(cadet.rels.parents, ['cassian-vael', 'seraphine-thorne']);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['elowen-vael', 'gareth-rime', 'nyra-vael', 'oryn-ash'].sort()
  );
  ['cassian-vael', 'seraphine-thorne'].forEach(parentId => {
    assert.deepEqual(byId.get(parentId).rels.children, [cadet.id, stage.id]);
  });
  ['maelis-vael', 'elyra-mire'].forEach(parentId => {
    assert.deepEqual(byId.get(parentId).rels.children, []);
  });
  assert.ok(timeJump.rels.children.every(childId => byId.get(childId).data.nodeKind === 'person'));
  assert.match(createFamilyChartCardHtml({ data: stage }), /aleria-time-jump-stage/);
});

test('belässt einen Hausknoten des Gründerpaares direkt an diesem Paar', () => {
  const family = {
    ...SAMPLE_FAMILY,
    cadetBranches: SAMPLE_FAMILY.cadetBranches.map(branch => ({
      ...branch,
      parentPartnershipId: 'marriage-aeron-lyria'
    }))
  };
  const converted = toFamilyChartData(family);
  const cadet = converted.data.find(node => node.data.aleria.cadetBranchId === 'cadet-sgrechwyr');
  assert.deepEqual(cadet.rels.parents, ['aeron-vael', 'lyria-vael']);
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

test('weist parallele Zeitsprünge am selben Anker als ungültig zurück', () => {
  const invalid = normalizeFamily(SAMPLE_FAMILY);
  const baseTimeJump = {
    parentPartnershipId: 'marriage-cassian-seraphine',
    parentPersonId: '',
    childIds: [],
    years: 100,
    fromYear: '1740',
    toYear: '1840',
    label: 'Spätere Generation',
    notes: '',
    extensions: {}
  };
  invalid.timeJumps.push(
    { ...baseTimeJump, id: 'parallel-gap-1' },
    { ...baseTimeJump, id: 'parallel-gap-2' }
  );

  const result = validateFamily(invalid);
  assert.ok(result.diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_ANCHOR'));
  assert.throws(() => assertValidFamily(invalid), FamilyValidationError);
});

test('weist auch überlappende Paar-/Einzelanker und einen Einzelanker neben dem Haus-Zeitsprung zurück', () => {
  const overlapping = normalizeFamily({
    ...SAMPLE_FAMILY,
    lineage: {
      ...SAMPLE_FAMILY.lineage,
      timeGap: { ...SAMPLE_FAMILY.lineage.timeGap, enabled: false }
    },
    timeJumps: [
      {
        id: 'pair-gap', parentPartnershipId: 'marriage-cassian-seraphine', parentPersonId: '', childIds: [],
        years: 10, fromYear: '1730', toYear: '1740', label: 'Paar-Sprung', notes: '', extensions: {}
      },
      {
        id: 'person-gap', parentPartnershipId: '', parentPersonId: 'cassian-vael', childIds: [],
        years: 10, fromYear: '1730', toYear: '1740', label: 'Person-Sprung', notes: '', extensions: {}
      }
    ]
  });
  assert.ok(validateFamily(overlapping).diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_ANCHOR'));

  const besideLineageGap = normalizeFamily({
    ...SAMPLE_FAMILY,
    timeJumps: [{
      id: 'founder-person-gap', parentPartnershipId: '', parentPersonId: 'aeron-vael', childIds: [],
      years: 10, fromYear: '1250', toYear: '1260', label: 'Doppelter Sprung', notes: '', extensions: {}
    }]
  });
  assert.ok(validateFamily(besideLineageGap).diagnostics.some(item => item.code === 'DUPLICATE_LINEAGE_TIME_BARRIER'));
});

test('weist disjunkte Zeitsprünge derselben Generation unabhängig von der Datenreihenfolge zurück', () => {
  const gaps = [
    {
      id: 'gap-cassian-line', parentPartnershipId: 'marriage-cassian-seraphine', parentPersonId: '', childIds: ['nyra-vael'],
      years: 10, fromYear: '1740', toYear: '1750', label: 'Cassians Linie', notes: '', extensions: {}
    },
    {
      id: 'gap-maelis-line', parentPartnershipId: 'affair-maelis-elyra', parentPersonId: '', childIds: ['oryn-ash'],
      years: 10, fromYear: '1740', toYear: '1750', label: 'Maelis Linie', notes: '', extensions: {}
    }
  ];

  [gaps, [...gaps].reverse()].forEach(timeJumps => {
    const invalid = normalizeFamily({ ...SAMPLE_FAMILY, timeJumps });
    const result = validateFamily(invalid);
    assert.ok(result.diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_GENERATION'));
    assert.throws(() => assertValidFamily(invalid), FamilyValidationError);
  });

  const converted = toFamilyChartData({ ...SAMPLE_FAMILY, timeJumps: gaps });
  const renderedFreeGaps = converted.data.filter(node => node.data.aleria.timeJumpId);
  assert.equal(renderedFreeGaps.length, 1, 'Auch ungültige Importdaten dürfen nie zwei parallele Trenner rendern.');
  assert.ok(converted.diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_GENERATION_SKIPPED'));

  const withDisjointRoot = normalizeFamily({
    ...SAMPLE_FAMILY,
    persons: [
      ...SAMPLE_FAMILY.persons,
      { id: 'unverbundene-wurzel', name: 'Unverbundene Wurzel', sex: 'unknown', status: 'unknown' }
    ],
    timeJumps: [{
      id: 'gap-root-beside-lineage', parentPartnershipId: '', parentPersonId: 'unverbundene-wurzel', childIds: [],
      years: 5, fromYear: '1200', toYear: '1205', label: 'Parallele Wurzel', notes: '', extensions: {}
    }]
  });
  assert.ok(validateFamily(withDisjointRoot).diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_GENERATION'));
});

test('erlaubt mehrere Zeitsprünge nur seriell an verschiedenen Generationen', () => {
  const serial = normalizeFamily({
    ...SAMPLE_FAMILY,
    lineage: {
      ...SAMPLE_FAMILY.lineage,
      timeGap: { ...SAMPLE_FAMILY.lineage.timeGap, enabled: false }
    },
    timeJumps: [
      {
        id: 'gap-generation-zero', parentPartnershipId: 'marriage-aeron-lyria', parentPersonId: '',
        childIds: ['cassian-vael', 'maelis-vael'], years: 400, fromYear: '1250', toYear: '1650',
        label: 'Erster serieller Trenner', notes: '', extensions: {}
      },
      {
        id: 'gap-generation-one', parentPartnershipId: 'marriage-cassian-seraphine', parentPersonId: '',
        childIds: ['nyra-vael'], years: 50, fromYear: '1740', toYear: '1790',
        label: 'Zweiter serieller Trenner', notes: '', extensions: {}
      }
    ]
  });
  assert.equal(validateFamily(serial).diagnostics.some(item => item.code === 'PARALLEL_TIME_JUMP_GENERATION'), false);
  assert.doesNotThrow(() => assertValidFamily(serial));

  const converted = toFamilyChartData(serial);
  const byId = new Map(converted.data.map(node => [node.id, node]));
  const firstGap = converted.data.find(node => node.data.aleria.timeJumpId === 'gap-generation-zero');
  const secondGap = converted.data.find(node => node.data.aleria.timeJumpId === 'gap-generation-one');
  const secondStage = byId.get(`${secondGap.id}--layout-stage`);
  assert.ok(firstGap && secondGap);
  assert.ok(byId.get('cassian-vael').rels.parents.includes(firstGap.id));
  assert.ok(secondStage.rels.parents.includes('cassian-vael'));
  assert.deepEqual(secondGap.rels.parents, [secondStage.id]);
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

test('vermittelt ein Mündel atomar und hängt den Zielhausknoten direkt unter die Person', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const branchId = store.sendWardToHouse({
    personId: 'nyra-vael',
    targetFamilyId: 'haus-thorne',
    targetFamilyTitle: 'Haus Thorne',
    targetHouse: SAMPLE_FAMILY.houses.find(house => house.id === 'house-thorne'),
    crestFrame: 'silver'
  });
  let family = store.getState().family;
  const branch = family.cadetBranches.find(item => item.id === branchId);
  const converted = toFamilyChartData(family);
  const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);

  assert.equal(family.persons.find(person => person.id === 'nyra-vael').familyRole, 'ward-away');
  assert.ok(family.persons.find(person => person.id === 'nyra-vael').tags.includes('Fortgegebenes Mündel'));
  assert.equal(branch.linkType, 'ward-away');
  assert.equal(branch.parentPartnershipId, '');
  assert.equal(branch.parentPersonId, 'nyra-vael');
  assert.equal(branch.targetFamilyId, 'haus-thorne');
  assert.deepEqual(branchNode.rels.parents, ['nyra-vael']);
  assert.deepEqual(converted.data.find(node => node.id === 'nyra-vael').rels.children, [branchNode.id]);
  assert.equal(converted.getParentageLine(branchNode.id).type, 'ward-away');

  assert.equal(store.undo(), true, 'Rolle und Zielhausknoten bilden gemeinsam genau eine Undo-Grenze.');
  family = store.getState().family;
  assert.equal(family.persons.find(person => person.id === 'nyra-vael').familyRole, 'core');
  assert.equal(family.cadetBranches.some(item => item.id === branchId), false);

  assert.equal(store.redo(), true);
  store.deletePerson('oryn-ash');
  assert.ok(store.getState().family.cadetBranches.some(item => item.id === branchId), 'Das Löschen einer anderen Person darf den Mündelknoten nicht entfernen.');
  store.deletePerson('nyra-vael');
  assert.equal(store.getState().family.cadetBranches.some(item => item.id === branchId), false, 'Mit dem fortgegebenen Mündel wird auch dessen Zielhausknoten entfernt.');
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

test('markiert eine bestehende Abstammung beim Zeitsprung und stellt sie beim Löschen wieder her', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const original = store.getState().family.parentages.find(parentage => parentage.childId === 'nyra-vael');
  assert.equal(original.type, 'biological');

  const timeJumpId = store.addTimeJump({
    parentPartnershipId: 'marriage-cassian-seraphine',
    childIds: ['nyra-vael'],
    years: 10,
    fromYear: '1740',
    toYear: '1750',
    label: 'Später belegte Nyra-Linie'
  });
  let parentage = store.getState().family.parentages.find(item => item.childId === 'nyra-vael');
  assert.equal(parentage.type, 'claimed');
  assert.equal(parentage.extensions.timeJumpId, timeJumpId);
  assert.equal(parentage.extensions.timeJumpPrevious.type, 'biological');

  store.updateTimeJump(timeJumpId, {
    parentPartnershipId: 'affair-maelis-elyra',
    childIds: ['nyra-vael'],
    years: 20,
    fromYear: '1740',
    toYear: '1760',
    label: 'Neu verankerte Lücke',
    notes: ''
  });
  parentage = store.getState().family.parentages.find(item => item.childId === 'nyra-vael');
  assert.deepEqual(parentage.parentIds, ['maelis-vael', 'elyra-mire']);
  assert.equal(parentage.extensions.timeJumpId, timeJumpId);

  store.deleteTimeJump(timeJumpId);
  parentage = store.getState().family.parentages.find(item => item.childId === 'nyra-vael');
  assert.equal(parentage.type, 'biological');
  assert.deepEqual(parentage.parentIds, original.parentIds);
  assert.equal(parentage.partnershipId, original.partnershipId);
  assert.equal(parentage.extensions.timeJumpId, undefined);
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
  const layoutStage = converted.data.find(entry => entry.id === `${timeJumpNode.id}--layout-stage`);
  assert.deepEqual(layoutStage.rels.parents, ['cassian-vael']);
  assert.deepEqual(timeJumpNode.rels.parents, [layoutStage.id]);
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
  const continuingFirstGeneration = deriveTreeGeneratorPhase(store.getState().family, { currentGenerationDepth: 1 });
  const continuingFounder = continuingFirstGeneration.openLeaves.find(leaf => leaf.personId === founderManId);
  assert.equal(continuingFounder.unresolvedTimeJumpId, timeJumpId);
  assert.equal(continuingFounder.continuationYear, '1700');
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
  assert.equal(skipped.openLeaves.length, 1, 'Das Gründerpaar bildet genau eine Fortsetzungslinie statt zwei doppelter Personenkarten.');
  assert.equal(skipped.openLeaves[0].partnershipId, founded.lineage.founderPartnershipId);
  // Ein erneuter Aufruf ohne die Option (z. B. beim nächsten Öffnen des Assistenten)
  // bietet Phase 3 wieder an, solange kein Kind angelegt wurde.
  assert.equal(deriveTreeGeneratorPhase(founded).phase, 3);
});

test('Stammbaum-Generator hält Wiederverheiratungen als getrennte Fortsetzungslinien', () => {
  const secondUnion = {
    id: 'union-cassian-isolde',
    participantIds: ['cassian-vael', 'isolde-marr'],
    type: 'union',
    status: 'active',
    start: '1739',
    end: '',
    certainty: 'confirmed',
    visibility: 'public',
    notes: '',
    extensions: {}
  };
  const family = normalizeFamily({
    ...SAMPLE_FAMILY,
    partnerships: [...SAMPLE_FAMILY.partnerships, secondUnion],
    cadetBranches: [],
    timeJumps: [{
      id: 'gap-old-marriage',
      parentPartnershipId: 'marriage-cassian-seraphine',
      parentPersonId: '',
      childIds: ['nyra-vael'],
      years: 5,
      fromYear: '1740',
      toYear: '1745',
      label: 'Nur diese Ehe fortsetzen',
      notes: '',
      extensions: {}
    }]
  });
  const phase = deriveTreeGeneratorPhase(family, { currentGenerationDepth: 2 });
  const marriageLeaf = phase.openLeaves.find(leaf => leaf.partnershipId === 'marriage-cassian-seraphine');
  const unionLeaf = phase.openLeaves.find(leaf => leaf.partnershipId === secondUnion.id);

  assert.ok(marriageLeaf && unionLeaf);
  assert.notEqual(marriageLeaf.lineId, unionLeaf.lineId);
  assert.equal(marriageLeaf.unresolvedTimeJumpId, 'gap-old-marriage');
  assert.equal(unionLeaf.unresolvedTimeJumpId, '', 'Ein Zeitsprung der alten Ehe darf nicht auf die neue Linie überspringen.');
  assert.equal(childCountForLine(family, marriageLeaf), 3);
  assert.equal(childCountForLine(family, unionLeaf), 0, 'Kinder der alten Ehe dürfen die Höchstzahl der neuen Linie nicht verbrauchen.');
});

test('Stammbaum-Generator kann enden, wenn alle Linien ohne nächste Generation abgeschlossen sind', () => {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Endhain' });
  const founded = commitFounderCouple(draft, {
    founderManName: 'Aeron Endhain',
    founderWomanName: 'Lyria Endhain'
  });
  const closed = normalizeFamily({
    ...founded,
    cadetBranches: [{
      id: 'founder-line-ended',
      name: 'Linie beendet',
      linkType: 'line-extinct',
      parentPartnershipId: founded.lineage.founderPartnershipId,
      houseId: '',
      targetFamilyId: '',
      notes: '',
      extensions: {}
    }]
  });
  const phase = deriveTreeGeneratorPhase(closed, { skipTimeJumpOffer: true });
  assert.equal(phase.openLeaves.length, 0);
  assert.equal(phase.canAdvance, false);
  assert.equal(phase.canFinish, true);
});

test('Stammbaum-Generator bietet hinter einem vorhandenen Haus-Zeitsprung keinen parallelen zweiten Trenner an', () => {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Nebelklinge' });
  const founded = commitFounderCouple(draft, {
    founderManName: 'Torvin Nebelklinge',
    founderWomanName: 'Yselda Grauhain'
  });
  const withLineageGap = normalizeFamily({
    ...founded,
    lineage: {
      ...founded.lineage,
      timeGap: {
        enabled: true,
        years: 30,
        fromYear: '1670',
        toYear: '1700',
        label: 'Nicht einzeln überlieferte Generationen'
      }
    }
  });

  assert.equal(deriveTreeGeneratorPhase(withLineageGap).phase, 4);
  const focused = deriveFocusedContinuationPhase(withLineageGap, {
    partnershipId: withLineageGap.lineage.founderPartnershipId
  });
  assert.equal(focused.continuationKind, 'lineage-gap');
  assert.equal(focused.continuationTitle, 'Erste Generation nach dem Zeitsprung');
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
  assert.deepEqual(
    cadetStore.getState().family.cadetBranches.map(branch => branch.id),
    ['ward-away-elowen-thorne'],
    'Das Löschen einer anderen Person darf Elowens direkte Mündelvermittlung nicht entfernen.'
  );
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
  assert.equal(limitedDepths.descendantDepth, 28, 'Explizite Limits müssen virtuelle Wappen, Layoutstufen und Zeitsprünge einrechnen.');
  const youngestDepths = resolveFamilyChartViewDepths(converted.data, 'gawain-draig', family.view);
  assert.equal(youngestDepths.ancestorDepth, undefined);
  const limitedYoungestDepths = resolveFamilyChartViewDepths(converted.data, 'gawain-draig', limitedView);
  assert.equal(limitedYoungestDepths.ancestorDepth, 30, 'Beim begrenzten Fokus müssen Ursprungshaus und alle frühen Draigs erreichbar bleiben.');
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

  assert.equal(family.persons.length, 45);
  assert.equal(family.partnerships.length, 19);
  assert.equal(family.parentages.length, 25);
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
    'maelgwyn-daran',
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
  assert.equal(graph.getPerson('kenyon-taranvyr').status, 'alive');
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

  assert.equal(Object.keys(HOUSE_GWYVERN_PORTRAITS).length, 38);
  assert.equal(localPortraitIds.length, 24);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 38);
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

test('verdoppelt beim Registerimport weder Haus- noch Clanname', () => {
  assert.equal(
    buildImportedPersonName({ name: 'Tynan Gallchobhair' }, { name: 'Clan Gallchobhair' }),
    'Tynan Gallchobhair'
  );
  assert.equal(
    buildImportedPersonName({ name: 'Tegwen' }, { name: 'Haus Gwyvern' }),
    'Tegwen Gwyvern'
  );
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
  assert.equal(Object.keys(HOUSE_CHWEDLONOL_PORTRAITS).length, 27);
  assert.equal(Object.keys(sourceManifest).length, 26);
  assert.ok(Object.keys(sourceManifest).every(personId => HOUSE_CHWEDLONOL_PORTRAITS[personId]));
  assert.equal(HOUSE_CHWEDLONOL_PORTRAITS['kerwin-rhyddid'], 'assets/images/portraits/haus-rhyddid/kerwin-rhyddid.jpg');
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 27);
  assert.equal(placeholderPeople.length, 8);
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
  const listedWyrm = listFamilyRecords(storage).find(record => record.id === 'haus-wyrm');
  assert.equal(listedWyrm.family.persons.length, 62);
  assert.equal(listedWyrm.source, 'registry');

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

  const countyPlaceholder = createFounderPlaceholderHouseFamily({
    id: 'haus-neidr',
    title: 'Haus Neidr',
    emblem: HOUSE_NEIDR_FAMILY.document.emblem,
    houseProfile: HOUSE_NEIDR_FAMILY.document.houseProfile
  });
  const countyPlaceholderStorage = createMemoryStorage();
  saveFamilyToLibrary({
    family: countyPlaceholder,
    id: 'haus-neidr',
    title: 'Haus Neidr',
    folderPath: ['Cenyr', 'Silberinsel', 'Llanvane']
  }, countyPlaceholderStorage);
  assert.equal(loadFamilyById('haus-neidr', countyPlaceholderStorage).family.persons.length, 104);
  assert.equal(loadFamilyById('haus-neidr', countyPlaceholderStorage).source, 'registry');

  const editedCountyPlaceholderStorage = createMemoryStorage();
  saveFamilyToLibrary({
    family: {
      ...countyPlaceholder,
      persons: countyPlaceholder.persons.map((person, index) => (
        index ? person : { ...person, name: 'Eigener lokaler Gründer' }
      ))
    },
    id: 'haus-neidr',
    title: 'Haus Neidr',
    folderPath: ['Eigene Fassung']
  }, editedCountyPlaceholderStorage);
  const editedCountyRecord = loadFamilyById('haus-neidr', editedCountyPlaceholderStorage);
  assert.equal(editedCountyRecord.family.persons.length, 2);
  assert.equal(editedCountyRecord.family.persons[0].name, 'Eigener lokaler Gründer');
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
  // Gwyllach, Sgrechiwr und die vorbereiteten Gwynthor-Bürgerhäuser sind bürgerliche
  // Häuser außerhalb der LOWER_KNIGHT_HOUSE_DEFINITIONS und werden ebenfalls gesondert
  // geprüft. Ard Conbhrón und Ui Talamh sitzen als antike
  // Albenclans in einer eigenen Orts-Hierarchie (Antike Crannath Clans) und werden ebenfalls
  // gesondert geprüft. Die 8 übrigen Grafenhäuser Cenyrs (CENYR_COUNTY_HOUSE_FAMILIES)
  // haben je ihre eigene, noch baronielose Orts-Hierarchie und werden in einem eigenen
  // Test geprüft. Clan Dubhan (Sept Dubhan) und Clan Wolfshorn sitzen als Flüchtlingsclans aus
  // Faelaorn bzw. Aldrimar in jeweils eigenen, außerhalb Cenyrs liegenden Orts-Hierarchien und
  // werden ebenfalls gesondert geprüft.
  const newVassalHouseCount = ARTUS_STREBEN_HOUSE_FAMILIES.length
    + GWENDOLYNS_UFER_HOUSE_FAMILIES.length
    + RHONWENS_TRAENEN_HOUSE_FAMILIES.length
    + GWYNTHOR_COMMONER_HOUSE_FAMILIES.length;
  assert.equal(
    listFamilyRecords(storage).length,
    expected.size + LOWER_KNIGHT_HOUSE_FAMILIES.length + 7 + newVassalHouseCount + CENYR_COUNTY_HOUSE_FAMILIES.length
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

test('createFounderTimeJumpPlaceholderHouseFamily setzt einen leeren Zeitsprung seriell unter das Stammwappen', () => {
  const family = createFounderTimeJumpPlaceholderHouseFamily({
    id: 'haus-sprungtest',
    title: 'Haus Sprungtest',
    emblem: 'assets/images/houses/Testregion/Sprungtest.png',
    houseProfile: { ...ARTUS_STREBEN_HOUSE_FAMILIES[0].document.houseProfile, rankId: 'commoner' },
    toYear: '1600',
    pendingDescendantReview: true
  });
  const converted = toFamilyChartData(assertValidFamily(family).family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.nodeKind === 'time-jump');

  assert.equal(family.lineage.crestFrame, 'iron');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
  assert.equal(family.timeJumps[0].toYear, '1600');
  assert.deepEqual(family.timeJumps[0].childIds, []);
  assert.equal(family.extensions.preparedTimeJump, true);
  assert.equal(family.extensions.pendingDescendantReview, true);
  assert.ok(family.persons.every(person => person.status === 'dead' && person.death === '????'));
  assert.ok(crest);
  assert.ok(timeJump);
  family.partnerships[0].participantIds.forEach(personId => {
    assert.deepEqual(chartById.get(personId).rels.children, [crest.id]);
  });
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(timeJump.rels.children, []);
});

test('registriert acht Bürgerhäuser aus Gwynthor mit lokalen Wappen und Grafschaftslinks', async () => {
  const expectedSlugs = ['draenmelyn', 'pendrwn', 'swyll', 'aelmor', 'maerllys', 'braglas', 'tonnarth', 'ysgrif'];
  const expectedTitles = ['Draenmelyn', 'Pendrwn', 'Swyll', 'Aelmor', 'Maerllys', 'Braglas', 'Tonnarth', 'Ysgrif'];
  const placeholderSlugs = new Set(['aelmor', 'maerllys', 'braglas', 'tonnarth']);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/wappen-sources.json', import.meta.url),
    'utf8'
  ));
  const countyHtml = await readFile(
    new URL('../../Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html', import.meta.url),
    'utf8'
  );

  assert.equal(GWYNTHOR_COMMONER_HOUSE_DEFINITIONS.length, 8);
  assert.equal(GWYNTHOR_COMMONER_HOUSE_FAMILIES.length, 8);
  assert.deepEqual(GWYNTHOR_COMMONER_HOUSE_DEFINITIONS.map(definition => definition.slug), expectedSlugs);
  assert.deepEqual(GWYNTHOR_COMMONER_HOUSE_DEFINITIONS.map(definition => definition.title), expectedTitles);
  assert.deepEqual(Object.keys(sourceManifest), expectedSlugs);

  await Promise.all(GWYNTHOR_COMMONER_HOUSE_FAMILIES.map(async (family, index) => {
    const slug = expectedSlugs[index];
    const validated = assertValidFamily(family).family;
    const converted = toFamilyChartData(validated);
    const registryEntries = FAMILY_REGISTRY.filter(entry => entry.id === `haus-${slug}`);
    const loaded = loadFamilyById(`haus-${slug}`, createMemoryStorage());
    const emblem = await readFile(new URL(`../${family.document.emblem}`, import.meta.url));

    assert.equal(family.document.id, `haus-${slug}`);
    assert.equal(family.document.title, `Haus ${expectedTitles[index]}`);
    assert.equal(family.timeJumps.length, 1);
    assert.equal(family.timeJumps[0].parentPartnershipId, family.lineage.founderPartnershipId);
    assert.equal(family.lineage.crestFrame, 'iron');
    assert.equal(family.lineage.timeGap.enabled, false);
    assert.equal(family.document.houseProfile.rankId, 'commoner');
    assert.equal(family.document.houseProfile.seat, 'Gwynthor');
    assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
    assert.ok(converted.data.some(node => node.data.nodeKind === 'house-crest'));
    assert.ok(converted.data.some(node => node.data.nodeKind === 'time-jump'));
    assert.deepEqual([...emblem.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
    assert.ok(emblem.length > 100);
    assert.equal(registryEntries.length, 1);
    assert.equal(registryEntries[0].type, 'commoner');
    assert.equal(loaded.family, family);
    assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Llamreis Ankunft > Gwynthor');
    assert.match(countyHtml, new RegExp(`family=haus-${slug}&amp;mode=view`));
    assert.match(countyHtml, new RegExp(`>${expectedTitles[index]}<`));

    if (placeholderSlugs.has(slug)) {
      const chartById = new Map(converted.data.map(node => [node.id, node]));
      const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
      const timeJump = converted.data.find(node => node.data.nodeKind === 'time-jump');
      assert.equal(family.persons.length, 2);
      assert.ok(family.persons.every(person => person.name === '???'));
      assert.ok(family.persons.every(person => person.status === 'dead' && person.death === '????'));
      assert.equal(family.partnerships.length, 1);
      assert.equal(family.parentages.length, 0);
      assert.equal(family.cadetBranches.length, 0);
      assert.deepEqual(family.timeJumps[0].childIds, []);
      assert.equal(family.timeJumps[0].toYear, '1600');
      assert.match(family.timeJumps[0].label, /etwa 1600/);
      assert.equal(family.extensions.blankFamily, true);
      assert.equal(family.extensions.pendingDescendantReview, true);
      assert.equal(converted.data.length, 4);
      family.partnerships[0].participantIds.forEach(personId => {
        assert.deepEqual(chartById.get(personId).rels.children, [crest.id]);
      });
      assert.deepEqual(crest.rels.children, [timeJump.id]);
      assert.deepEqual(timeJump.rels.parents, [crest.id]);
      assert.deepEqual(timeJump.rels.children, []);
    }
  }));
});

test('Haus Draenmelyn bleibt kompakt: Taliesin und Myfanwy sind Cousins mit je zwei Geschwistern', async () => {
  const family = assertValidFamily(HOUSE_DRAENMELYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.nodeKind === 'time-jump');
  const taliesin = graph.getPerson('taliesin-draenmelyn');
  const myfanwy = graph.getPerson('myfanwy-draenmelyn');
  const taliesinParentIds = graph.getParents(taliesin.id).map(person => person.id);
  const myfanwyParentIds = graph.getParents(myfanwy.id).map(person => person.id);
  const afanSiblingIds = graph.getSiblings('afan-draenmelyn').map(entry => entry.person.id);
  const concreteTaliesinAncestors = graph.getAncestors(taliesin.id)
    .filter(entry => !HOUSE_DRAENMELYN_FAMILY.partnerships[0].participantIds.includes(entry.person.id));
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-draenmelyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const reachableNodeIds = new Set();
  const pendingNodeIds = [family.view.focusPersonId];
  while (pendingNodeIds.length) {
    const nodeId = pendingNodeIds.shift();
    if (reachableNodeIds.has(nodeId)) continue;
    reachableNodeIds.add(nodeId);
    const node = chartById.get(nodeId);
    if (!node) continue;
    [...node.rels.children, ...node.rels.spouses].forEach(relativeId => {
      if (!reachableNodeIds.has(relativeId)) pendingNodeIds.push(relativeId);
    });
  }

  assert.equal(family.persons.length, 18);
  assert.equal(family.partnerships.length, 6);
  assert.equal(family.parentages.length, 11);
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.pendingDescendantReview, false);
  assert.equal(family.view.focusPersonId, 'haus-draenmelyn-gruender');
  assert.equal(family.view.limitGenerations, false);
  assert.equal(family.timeJumps[0].toYear, '1665');
  assert.deepEqual(family.timeJumps[0].childIds, ['ifor-draenmelyn']);
  assert.deepEqual(taliesinParentIds, ['afan-draenmelyn', 'elen-spouse-draenmelyn']);
  assert.deepEqual(myfanwyParentIds, ['catrin-spouse-draenmelyn', 'meurig-draenmelyn']);
  assert.ok(afanSiblingIds.includes('meurig-draenmelyn'));
  assert.ok(afanSiblingIds.includes('caradog-draenmelyn'));
  assert.ok(afanSiblingIds.includes('rhiannon-draenmelyn'));
  assert.equal(graph.getSiblings(taliesin.id).length, 2);
  assert.equal(graph.getSiblings(myfanwy.id).length, 2);
  assert.equal(Math.max(...concreteTaliesinAncestors.map(entry => entry.depth)), 2);
  assert.equal(taliesin.birth, '1722');
  assert.equal(myfanwy.birth, '1723');
  assert.equal(calculateAge(taliesin), 18);
  assert.equal(calculateAge(myfanwy), 17);
  assert.equal(taliesin.portrait, HOUSE_DRAENMELYN_PORTRAITS[taliesin.id]);
  assert.equal(myfanwy.portrait, HOUSE_DRAENMELYN_PORTRAITS[myfanwy.id]);
  assert.deepEqual(Object.keys(sourceManifest), [
    'sioned-draenmelyn',
    'taliesin-draenmelyn',
    'myfanwy-draenmelyn'
  ]);
  assert.equal(
    graph.getPerson('sioned-draenmelyn').portrait,
    HOUSE_DRAENMELYN_PORTRAITS['sioned-draenmelyn']
  );
  family.persons.forEach(person => {
    assert.ok(reachableNodeIds.has(person.id), `${person.name} muss von der Stammbaumwurzel aus sichtbar erreichbar sein`);
  });
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(timeJump.rels.children, ['ifor-draenmelyn']);
  assert.deepEqual(chartById.get('ifor-draenmelyn').rels.parents, [timeJump.id]);
});

test('Caradogs Söldnerlinie und Rhiannons Wegheirat nach Swyll sind beidseitig registriert', () => {
  const draenmelyn = assertValidFamily(HOUSE_DRAENMELYN_FAMILY).family;
  const swyll = assertValidFamily(HOUSE_SWYLL_FAMILY).family;
  const caradog = draenmelyn.persons.find(person => person.id === 'caradog-draenmelyn');
  const branch = draenmelyn.cadetBranches.find(item => item.id === 'married-away-swyll-rhiannon-draenmelyn');
  const draenmelynMarriage = draenmelyn.partnerships.find(item => item.id === DRAENMELYN_SWYLL_MARRIAGE.id);
  const swyllMarriage = swyll.partnerships.find(item => item.id === DRAENMELYN_SWYLL_MARRIAGE.id);

  assert.equal(caradog.title, 'Söldner');
  assert.match(caradog.notes, /schlägt sich als Söldner durch/);
  assert.equal(branch.linkType, 'married-away');
  assert.equal(branch.parentPartnershipId, DRAENMELYN_SWYLL_MARRIAGE.id);
  assert.equal(branch.targetFamilyId, 'haus-swyll');
  assert.equal(branch.crestFrame, 'iron');
  assert.deepEqual(draenmelynMarriage, swyllMarriage);
  DRAENMELYN_SWYLL_MARRIAGE.participantIds.forEach(personId => {
    const homeRecord = draenmelyn.persons.find(person => person.id === personId);
    const targetRecord = swyll.persons.find(person => person.id === personId);
    assert.equal(homeRecord.worldPersonId, targetRecord.worldPersonId);
    assert.equal(homeRecord.name, targetRecord.name);
    assert.equal(homeRecord.birth, targetRecord.birth);
  });
  assert.equal(swyll.timeJumps[0].toYear, '1663');
  assert.deepEqual(swyll.timeJumps[0].childIds, ['emyr-swyll', 'gwenifer-swyll', 'madryn-swyll']);
  assert.equal(swyll.extensions.pendingDescendantReview, false);
});

test('Haus Swyll baut Meredith als mittleres Kind auf, ohne sie zur Diagrammwurzel zu machen', async () => {
  const family = assertValidFamily(HOUSE_SWYLL_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.nodeKind === 'time-jump');
  const meredith = graph.getPerson('meredith-swyll');
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-swyll/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const portraitBytes = await readFile(new URL(`../${meredith.portrait}`, import.meta.url));
  const reachableNodeIds = new Set();
  const pendingNodeIds = [family.view.focusPersonId];
  while (pendingNodeIds.length) {
    const nodeId = pendingNodeIds.shift();
    if (reachableNodeIds.has(nodeId)) continue;
    reachableNodeIds.add(nodeId);
    const node = chartById.get(nodeId);
    if (!node) continue;
    [...node.rels.children, ...node.rels.spouses].forEach(relativeId => {
      if (!reachableNodeIds.has(relativeId)) pendingNodeIds.push(relativeId);
    });
  }

  assert.equal(family.persons.length, 31);
  assert.equal(family.partnerships.length, 11);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 6);
  assert.equal(family.view.focusPersonId, 'haus-swyll-gruender');
  assert.notEqual(family.view.focusPersonId, meredith.id);
  assert.equal(family.view.limitGenerations, false);
  assert.equal(meredith.birth, '1722');
  assert.equal(calculateAge(meredith), 18);
  assert.equal(meredith.portrait, HOUSE_SWYLL_PORTRAITS[meredith.id]);
  assert.deepEqual(graph.getParents(meredith.id).map(person => person.id), [
    'iestyn-swyll',
    'rhiannon-draenmelyn'
  ]);
  assert.deepEqual(graph.getSiblings(meredith.id).map(entry => entry.person.id), [
    'gareth-swyll',
    'rhydwen-swyll'
  ]);
  assert.deepEqual(Object.keys(sourceManifest), ['meredith-swyll']);
  assert.deepEqual([...portraitBytes.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  family.persons.forEach(person => {
    assert.ok(reachableNodeIds.has(person.id), `${person.name} muss von der Swyll-Wurzel aus sichtbar erreichbar sein`);
  });
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(timeJump.rels.children, ['emyr-swyll', 'gwenifer-swyll', 'madryn-swyll']);
});

test('Swyll führt fünf Tanten, drei Onkel sowie Großtante und Großonkel exakt nach Vorgabe', () => {
  const family = assertValidFamily(HOUSE_SWYLL_FAMILY).family;
  const graph = createFamilyGraph(family);
  const auntIds = ['eirwen-swyll', 'bronwen-swyll', 'carys-swyll', 'llio-swyll', 'nerys-swyll'];
  const uncleIds = ['owain-swyll', 'cadfan-swyll', 'rhodri-swyll'];
  const iestynSiblingIds = graph.getSiblings('iestyn-swyll').map(entry => entry.person.id);
  const marriedAwayPersonIds = new Set(family.cadetBranches.map(branch => {
    const partnership = family.partnerships.find(item => item.id === branch.parentPartnershipId);
    return partnership.participantIds.find(personId => personId.endsWith('-swyll') && !personId.startsWith('unknown-'));
  }));
  const rhodriAffair = family.partnerships.find(partnership => partnership.id === 'affair-rhodri-morwen-swyll');
  const bastardParentages = family.parentages.filter(parentage => (
    parentage.partnershipId === rhodriAffair.id
  ));

  assert.equal(iestynSiblingIds.length, 8);
  [...auntIds, ...uncleIds].forEach(personId => assert.ok(iestynSiblingIds.includes(personId)));
  auntIds.forEach(personId => assert.ok(marriedAwayPersonIds.has(personId)));
  assert.ok(marriedAwayPersonIds.has('gwenifer-swyll'));
  assert.equal(graph.getChildren('owain-swyll').length, 2);
  assert.equal(graph.getPerson('cadfan-swyll').death, '1719');
  assert.equal(graph.getChildren('cadfan-swyll').length, 0);
  assert.equal(graph.getPerson('madryn-swyll').death, '1720');
  assert.equal(graph.getChildren('madryn-swyll').length, 0);
  assert.equal(rhodriAffair.type, 'affair');
  assert.deepEqual(bastardParentages.map(parentage => parentage.childId), ['carwyn-swyll', 'lowri-swyll']);
  assert.ok(bastardParentages.every(parentage => parentage.legitimacy === 'illegitimate'));
  assert.ok(bastardParentages.every(parentage => (
    graph.getPerson(parentage.childId).familyRole === 'bastard'
  )));
  assert.deepEqual(bastardParentages.map(parentage => calculateAge(graph.getPerson(parentage.childId))), [19, 17]);
});

test('Swyll-Registryupgrade entfernt den veralteten direkten Gründerpfad zu Iestyn', () => {
  const obsoleteParentage = {
    id: 'parentage-iestyn-swyll',
    childId: 'iestyn-swyll',
    parentIds: [...HOUSE_SWYLL_FAMILY.partnerships[0].participantIds],
    partnershipId: HOUSE_SWYLL_FAMILY.lineage.founderPartnershipId,
    type: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    visibility: 'public',
    notes: 'Veralteter direkter Pfad.',
    extensions: { timeJumpId: HOUSE_SWYLL_FAMILY.timeJumps[0].id }
  };
  const oldSnapshot = normalizeFamily({
    ...HOUSE_SWYLL_FAMILY,
    parentages: [...HOUSE_SWYLL_FAMILY.parentages, obsoleteParentage],
    timeJumps: HOUSE_SWYLL_FAMILY.timeJumps.map(timeJump => ({
      ...timeJump,
      childIds: ['iestyn-swyll'],
      toYear: '1699'
    })),
    extensions: {
      ...HOUSE_SWYLL_FAMILY.extensions,
      sourceRevision: 3,
      registryTombstones: {}
    }
  });
  const upgraded = resolveRegisteredFamilyUpgrade(HOUSE_SWYLL_FAMILY, oldSnapshot);

  assert.equal(upgraded.extensions.sourceRevision, 7);
  assert.equal(upgraded.parentages.some(parentage => parentage.id === obsoleteParentage.id), false);
  assert.equal(upgraded.parentages.some(parentage => parentage.id === 'parentage-emyr-iestyn-swyll'), true);
  assert.deepEqual(upgraded.timeJumps[0].childIds, ['emyr-swyll', 'gwenifer-swyll', 'madryn-swyll']);
  assert.equal(upgraded.timeJumps[0].toYear, '1663');
  assert.ok(upgraded.extensions.registryTombstones.parentages.includes(obsoleteParentage.id));
});

test('Draenmelyn-Registryupgrade ersetzt den alten Einlinien-Fokus und den leeren Zeitsprung', () => {
  const oldSnapshot = normalizeFamily({
    ...HOUSE_DRAENMELYN_FAMILY,
    timeJumps: HOUSE_DRAENMELYN_FAMILY.timeJumps.map(timeJump => ({
      ...timeJump,
      childIds: [],
      toYear: '1600'
    })),
    view: {
      ...HOUSE_DRAENMELYN_FAMILY.view,
      focusPersonId: 'taliesin-draenmelyn',
      ancestorDepth: 2,
      descendantDepth: 2,
      limitGenerations: true
    },
    extensions: {
      ...HOUSE_DRAENMELYN_FAMILY.extensions,
      sourceRevision: 2
    }
  });
  const upgraded = resolveRegisteredFamilyUpgrade(HOUSE_DRAENMELYN_FAMILY, oldSnapshot);

  assert.equal(upgraded.extensions.sourceRevision, 6);
  assert.equal(upgraded.view.focusPersonId, 'haus-draenmelyn-gruender');
  assert.equal(upgraded.view.limitGenerations, false);
  assert.equal(upgraded.view.ancestorDepth, 20);
  assert.equal(upgraded.view.descendantDepth, 20);
  assert.deepEqual(upgraded.timeJumps[0].childIds, ['ifor-draenmelyn']);
  assert.equal(upgraded.timeJumps[0].toYear, '1665');
});

test('Haus Pendrwn bleibt bis zu Tudwals Großvater begrenzt und lässt die gesamte junge Generation unverheiratet', async () => {
  const family = assertValidFamily(HOUSE_PENDRWN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const tudwal = graph.getPerson('tudwal-pendrwn');
  const founderIds = new Set(family.partnerships.find(partnership => (
    partnership.id === family.lineage.founderPartnershipId
  )).participantIds);
  const concreteAncestors = graph.getAncestors(tudwal.id).filter(entry => !founderIds.has(entry.person.id));
  const portraitBytes = await readFile(new URL(`../${tudwal.portrait}`, import.meta.url));
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-pendrwn/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const reachableNodeIds = new Set();
  const pendingNodeIds = [family.view.focusPersonId];

  while (pendingNodeIds.length) {
    const nodeId = pendingNodeIds.shift();
    if (reachableNodeIds.has(nodeId)) continue;
    reachableNodeIds.add(nodeId);
    const node = chartById.get(nodeId);
    if (!node) continue;
    [...node.rels.children, ...node.rels.spouses].forEach(relativeId => {
      if (!reachableNodeIds.has(relativeId)) pendingNodeIds.push(relativeId);
    });
  }

  assert.equal(family.persons.length, 11);
  assert.equal(family.partnerships.length, 4);
  assert.equal(family.parentages.length, 6);
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.view.focusPersonId, 'haus-pendrwn-gruender');
  assert.notEqual(family.view.focusPersonId, tudwal.id);
  assert.equal(family.view.limitGenerations, false);
  assert.equal(tudwal.name, 'Tudwal Pendrwn');
  assert.equal(tudwal.birth, '1717');
  assert.equal(calculateAge(tudwal), 23);
  assert.equal(tudwal.portrait, HOUSE_PENDRWN_PORTRAITS[tudwal.id]);
  assert.deepEqual([...portraitBytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  assert.deepEqual(Object.keys(sourceManifest), ['tudwal-pendrwn']);
  assert.equal(Math.max(...concreteAncestors.map(entry => entry.depth)), 2);
  assert.deepEqual(graph.getParents(tudwal.id).map(person => person.id), [
    'eirwen-swyll',
    'meilyr-pendrwn'
  ]);
  assert.deepEqual(graph.getSiblings(tudwal.id).map(entry => entry.person.id).sort(), [
    'cadell-pendrwn',
    'enid-pendrwn'
  ]);
  assert.deepEqual(family.timeJumps[0].childIds, ['idwal-pendrwn']);
  assert.equal(family.timeJumps[0].toYear, '1661');
  family.persons.filter(person => {
    const age = calculateAge(person);
    return Number.isInteger(age) && age < 28;
  }).forEach(person => {
    assert.equal(
      family.partnerships.some(partnership => partnership.participantIds.includes(person.id)),
      false,
      `${person.name} darf unter 28 weder verheiratet noch verlobt sein`
    );
  });
  family.persons.forEach(person => {
    assert.ok(reachableNodeIds.has(person.id), `${person.name} muss von der Pendrwn-Wurzel aus sichtbar erreichbar sein`);
  });
});

test('Pendrwns Verbindungen zu Swyll und Draenmelyn sind in den Gegenstammbäumen sichtbar gespiegelt', () => {
  const pendrwn = assertValidFamily(HOUSE_PENDRWN_FAMILY).family;
  const swyll = assertValidFamily(HOUSE_SWYLL_FAMILY).family;
  const draenmelyn = assertValidFamily(HOUSE_DRAENMELYN_FAMILY).family;
  const cases = [
    {
      marriage: PENDRWN_SWYLL_MARRIAGE,
      counterpart: swyll,
      branchFamily: swyll,
      branchId: 'married-away-pendrwn-eirwen-swyll',
      targetFamilyId: 'haus-pendrwn'
    },
    {
      marriage: PENDRWN_DRAENMELYN_MARRIAGE,
      counterpart: draenmelyn,
      branchFamily: pendrwn,
      branchId: 'married-away-draenmelyn-gwenith-pendrwn',
      targetFamilyId: 'haus-draenmelyn'
    }
  ];

  cases.forEach(({ marriage, counterpart, branchFamily, branchId, targetFamilyId }) => {
    const pendrwnMarriage = pendrwn.partnerships.find(partnership => partnership.id === marriage.id);
    const counterpartMarriage = counterpart.partnerships.find(partnership => partnership.id === marriage.id);
    const branch = branchFamily.cadetBranches.find(item => item.id === branchId);

    assert.deepEqual(pendrwnMarriage, counterpartMarriage);
    assert.equal(branch.parentPartnershipId, marriage.id);
    assert.equal(branch.targetFamilyId, targetFamilyId);
    assert.equal(branch.linkType, 'married-away');
    marriage.participantIds.forEach(personId => {
      const pendrwnPerson = pendrwn.persons.find(person => person.id === personId);
      const counterpartPerson = counterpart.persons.find(person => person.id === personId);
      assert.equal(pendrwnPerson.worldPersonId, counterpartPerson.worldPersonId);
      assert.equal(pendrwnPerson.name, counterpartPerson.name);
      assert.equal(pendrwnPerson.birth, counterpartPerson.birth);
    });
  });

  assert.ok(swyll.extensions.registryTombstones.persons.includes('unknown-spouse-eirwen-swyll'));
  assert.ok(swyll.extensions.registryTombstones.partnerships.includes('marriage-eirwen-unknown-swyll'));
  assert.ok(swyll.extensions.registryTombstones.cadetBranches.includes('married-away-eirwen-swyll'));
  assert.equal(draenmelyn.parentages.some(parentage => (
    parentage.partnershipId === PENDRWN_DRAENMELYN_MARRIAGE.id
  )), false);
});

test('Haus Ysgrif bleibt klein und baut Floyd mit zwei Schwestern, drei Vettern und einem kinderlosen Söldneronkel auf', async () => {
  const family = assertValidFamily(HOUSE_YSGRIF_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.nodeKind === 'time-jump');
  const floyd = graph.getPerson('floyd-ysgrif');
  const floydPortrait = await readFile(new URL(`../${floyd.portrait}`, import.meta.url));
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-ysgrif/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const reachableNodeIds = new Set();
  const pendingNodeIds = [family.view.focusPersonId];

  while (pendingNodeIds.length) {
    const nodeId = pendingNodeIds.shift();
    if (reachableNodeIds.has(nodeId)) continue;
    reachableNodeIds.add(nodeId);
    const node = chartById.get(nodeId);
    if (!node) continue;
    [...node.rels.children, ...node.rels.spouses].forEach(relativeId => {
      if (!reachableNodeIds.has(relativeId)) pendingNodeIds.push(relativeId);
    });
  }

  assert.equal(family.persons.length, 17);
  assert.equal(family.partnerships.length, 5);
  assert.equal(family.parentages.length, 11);
  assert.equal(family.cadetBranches.length, 1);
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.seat, 'Gwynthor');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.equal(family.view.focusPersonId, 'haus-ysgrif-gruender');
  assert.notEqual(family.view.focusPersonId, floyd.id);
  assert.equal(family.view.limitGenerations, false);
  assert.equal(floyd.birth, '1719');
  assert.equal(calculateAge(floyd), 21);
  assert.equal(floyd.portrait, HOUSE_YSGRIF_PORTRAITS[floyd.id]);
  assert.deepEqual([...floydPortrait.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  assert.deepEqual(Object.keys(sourceManifest), ['floyd-ysgrif']);
  assert.deepEqual(graph.getParents(floyd.id).map(person => person.id), [
    'aneirin-ysgrif',
    'catrin-spouse-ysgrif'
  ]);
  assert.deepEqual(graph.getSiblings(floyd.id).map(entry => entry.person.id).sort(), [
    'eleri-ysgrif',
    'mair-ysgrif'
  ]);
  assert.deepEqual(graph.getChildren('bryn-ysgrif').map(person => person.id).sort(), [
    'cadell-ysgrif',
    'emrys-ysgrif',
    'huw-ysgrif'
  ]);
  assert.equal(graph.getChildren('madoc-ysgrif').length, 0);
  assert.equal(family.partnerships.some(partnership => partnership.participantIds.includes('madoc-ysgrif')), false);
  assert.equal(graph.getPerson('madoc-ysgrif').title, 'Söldner');
  assert.equal(family.cadetBranches.find(branch => (
    branch.id === 'married-away-unknown-gwenllian-ysgrif'
  )).targetFamilyId, 'haus-unbekannt');
  ['floyd-ysgrif', 'mair-ysgrif', 'eleri-ysgrif'].forEach(personId => {
    assert.equal(family.partnerships.some(partnership => partnership.participantIds.includes(personId)), false);
  });
  family.persons.forEach(person => {
    assert.ok(reachableNodeIds.has(person.id), `${person.name} muss von der Ysgrif-Wurzel aus sichtbar erreichbar sein`);
  });
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(timeJump.rels.children, ['idris-ysgrif', 'gwenllian-ysgrif']);
});

test('Floyd, Sioned, Mair und Gareth bleiben ohne Ehe oder Verlobung und alte Fehlverknüpfungen werden migriert', () => {
  const ysgrif = assertValidFamily(HOUSE_YSGRIF_FAMILY).family;
  const draenmelyn = assertValidFamily(HOUSE_DRAENMELYN_FAMILY).family;
  const swyll = assertValidFamily(HOUSE_SWYLL_FAMILY).family;
  const obsoleteFloydMarriageId = 'marriage-floyd-ysgrif-sioned-draenmelyn';
  const obsoleteMairMarriageId = 'marriage-mair-ysgrif-gareth-swyll';

  assert.ok(ysgrif.persons.some(person => person.id === 'floyd-ysgrif'));
  assert.ok(ysgrif.persons.some(person => person.id === 'mair-ysgrif'));
  assert.ok(draenmelyn.persons.some(person => person.id === 'sioned-draenmelyn'));
  assert.ok(swyll.persons.some(person => person.id === 'gareth-swyll'));
  assert.equal(ysgrif.persons.some(person => person.id === 'sioned-draenmelyn'), false);
  assert.equal(ysgrif.persons.some(person => person.id === 'gareth-swyll'), false);
  assert.equal(draenmelyn.persons.some(person => person.id === 'floyd-ysgrif'), false);
  assert.equal(swyll.persons.some(person => person.id === 'mair-ysgrif'), false);
  assert.equal(ysgrif.partnerships.some(partnership => partnership.id === obsoleteFloydMarriageId), false);
  assert.equal(ysgrif.partnerships.some(partnership => partnership.id === obsoleteMairMarriageId), false);
  assert.equal(draenmelyn.partnerships.some(partnership => partnership.id === obsoleteFloydMarriageId), false);
  assert.equal(swyll.partnerships.some(partnership => partnership.id === obsoleteMairMarriageId), false);
  assert.ok(ysgrif.extensions.registryTombstones.partnerships.includes(obsoleteFloydMarriageId));
  assert.ok(ysgrif.extensions.registryTombstones.partnerships.includes(obsoleteMairMarriageId));
  assert.ok(draenmelyn.extensions.registryTombstones.partnerships.includes(obsoleteFloydMarriageId));
  assert.ok(swyll.extensions.registryTombstones.partnerships.includes(obsoleteMairMarriageId));
  assert.equal(draenmelyn.cadetBranches.some(branch => branch.id === 'married-away-ysgrif-sioned-draenmelyn'), false);
  assert.equal(ysgrif.cadetBranches.some(branch => branch.id === 'married-away-swyll-mair-ysgrif'), false);
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
  assert.equal(annwyl.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Côr Mynyddfaen');
  assert.match(annwyl.family.document.houseProfile.regionEmblems.seat, /^assets\/images\/regions\//);
  assert.equal(annwyl.family.persons.length, 20, 'Annwyl ersetzt seine frühere Leerakte durch den ausgearbeiteten Stammbaum.');
  assert.equal(annwyl.family.extensions.blankFamily, false);

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

test('bildet Haus Annwyl vollständig und mit einem strikt seriellen Gründer-Zeitsprung ab', () => {
  const family = assertValidFamily(HOUSE_ANNWYL_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 20);
  assert.equal(family.partnerships.length, 8);
  assert.equal(family.parentages.length, 11);
  assert.equal(family.cadetBranches.length, 4);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-willard-unknown-annwyl');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.motto, '', 'Der Motto-Platzhalter der Quelle wird nicht als Hausmotto übernommen.');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.document.houseProfile.seat, 'Côr Mynyddfaen');
  assert.deepEqual(family.document.houseProfile.secondarySeats, []);
  assert.match(family.document.houseProfile.regionEmblems.seat, /Côr Mynyddfaen\.png$/);
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 3);
  assert.equal(FAMILY_REGISTRY.some(entry => entry.id === 'haus-anwyll'), false);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['willard-annwyl', 'cennyn-annwyl']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['elgan-annwyl', 'emyr-annwyl', 'wilff-annwyl']
  );
  assert.deepEqual(graph.getChildren('willard-annwyl').map(person => person.id).sort(), [
    'cennyn-annwyl',
    'glyndwr-annwyl',
    'unknown-sibling-cennyn-annwyl'
  ]);
  assert.deepEqual(graph.getChildren('cennyn-annwyl').map(person => person.id).sort(), [
    'elgan-annwyl',
    'elowen-annwyl'
  ]);
  assert.deepEqual(graph.getChildren('glyndwr-annwyl').map(person => person.id).sort(), [
    'esyllt-annwyl',
    'eurig-annwyl'
  ]);
  assert.deepEqual(graph.getChildren('elgan-annwyl').map(person => person.id).sort(), [
    'emyr-annwyl',
    'wilff-annwyl'
  ]);
  assert.deepEqual(graph.getChildren('eurig-annwyl').map(person => person.id).sort(), [
    'harri-annwyl',
    'luned-annwyl'
  ]);

  const unknownSpouses = family.persons.filter(person => person.familyRole === 'married');
  assert.equal(unknownSpouses.length, 8);
  assert.ok(unknownSpouses.every(person => (
    person.name === '???'
      && person.houseId === ''
      && person.birth === '????'
      && person.death === '????'
      && person.status === 'dead'
  )));
  assert.equal(graph.getPartners('unknown-sibling-cennyn-annwyl')[0].sex, 'male');
  assert.equal(graph.getPerson('unknown-sibling-cennyn-annwyl').sex, 'female');
  assert.equal(graph.getPerson('unknown-sibling-cennyn-annwyl').name, 'Eithne Annwyl');
  assert.equal(graph.getPerson('unknown-sibling-cennyn-annwyl').status, 'dead');
  assert.match(graph.getPerson('elgan-annwyl').notes, /Eglan/);
  assert.match(graph.getPerson('wilff-annwyl').notes, /Wiff/);
  assert.equal(graph.getPerson('wilff-annwyl').familyRole, 'ward-away');
  assert.match(graph.getPerson('wilff-annwyl').title, /Mündel bei Haus Penwyn/);

  const marriedAwayBranches = family.cadetBranches.filter(branch => branch.linkType === 'married-away');
  assert.equal(marriedAwayBranches.length, 3);
  assert.deepEqual(marriedAwayBranches.map(branch => branch.parentPartnershipId).sort(), [
    'marriage-elowen-unknown-annwyl',
    'marriage-esyllt-unknown-annwyl',
    'marriage-unknown-sibling-annwyl'
  ]);
  assert.ok(marriedAwayBranches.every(branch => (
    branch.name === 'Unbekanntes Haus'
      && branch.targetFamilyId === 'haus-unbekannt'
      && branch.crestFrame === 'gold'
  )));
  const wardBranch = family.cadetBranches.find(branch => branch.id === 'ward-away-wilff-penwyn');
  assert.equal(wardBranch.linkType, 'ward-away');
  assert.equal(wardBranch.parentPartnershipId, '');
  assert.equal(wardBranch.parentPersonId, 'wilff-annwyl');
  assert.equal(wardBranch.targetFamilyId, 'haus-penwyn');
  assert.equal(wardBranch.emblem, 'assets/images/houses/Gwendolyns Ufer/Ritterliche/Penwyn.png');

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => node.data.aleria.timeJumpId === 'gap-willard-cennyn-annwyl');
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('willard-annwyl').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-willard-annwyl').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), [
    'cennyn-annwyl',
    'glyndwr-annwyl',
    'unknown-sibling-cennyn-annwyl'
  ]);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);
  assert.match(chartById.get('wilff-annwyl').data.frameAsset, /person-ward-away\.png$/);
  const wardNode = converted.data.find(node => node.data.aleria.cadetBranchId === 'ward-away-wilff-penwyn');
  assert.deepEqual(wardNode.rels.parents, ['wilff-annwyl']);
  assert.ok(chartById.get('wilff-annwyl').rels.children.includes(wardNode.id));
  assert.equal(wardNode.data.aleria.targetFamilyId, 'haus-penwyn');
  assert.match(family.extensions.sourceNote, /Anwyll.*Schreibvariante/);
  assert.match(family.extensions.sourceNote, /Petyr Anhof/);
  assert.match(family.extensions.sourceNote, /Petyr Anghof/);
  marriedAwayBranches.forEach(branch => {
    const node = converted.data.find(entry => entry.data.aleria.cadetBranchId === branch.id);
    const partnership = family.partnerships.find(item => item.id === branch.parentPartnershipId);
    assert.deepEqual([...node.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['willard-annwyl']);
  const pendingIds = ['willard-annwyl'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Annwyl-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(connectedIds.size, converted.data.length, 'Der Annwyl-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.');
});

test('liefert alle elf individuellen Annwyl-Porträts als lokale JPEG-Dateien aus', async () => {
  const family = assertValidFamily(HOUSE_ANNWYL_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-annwyl/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_ANNWYL_PORTRAITS).length, 11);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_ANNWYL_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 11);
  assert.equal(placeholderPeople.length, 9);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_ANNWYL_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Annwyl-Leerakte und migriert Eithne sowie Côr Mynyddfaen ohne Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-annwyl',
    title: 'Haus Annwyl',
    emblem: HOUSE_ANNWYL_FAMILY.document.emblem,
    houseProfile: HOUSE_ANNWYL_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-annwyl',
    title: 'Haus Annwyl',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Côr Mynyddfaen']
  }, storage);

  const loaded = loadFamilyById('haus-annwyl', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_ANNWYL_FAMILY);
  assert.equal(loaded.family.persons.length, 20);
  assert.equal(loaded.family.extensions.blankFamily, false);

  const revisionStorage = createMemoryStorage();
  const olderLocalFamily = normalizeFamily({
    ...HOUSE_ANNWYL_FAMILY,
    persons: HOUSE_ANNWYL_FAMILY.persons.map(person => (
      person.id === 'unknown-sibling-cennyn-annwyl'
        ? {
            ...person,
            name: '???',
            notes: 'Als namenlose Schwester Cennyns und Glyndwrs überliefert.',
            extensions: {}
          }
        : person
    )),
    cadetBranches: HOUSE_ANNWYL_FAMILY.cadetBranches.filter(branch => (
      branch.id === 'ward-away-wilff-penwyn'
    )),
    extensions: {
      ...HOUSE_ANNWYL_FAMILY.extensions,
      registryManagedHouseProfileFields: [],
      registryManagedRecordFields: [],
      sourceRevision: 2
    }
  });
  saveFamilyToLibrary({
    family: olderLocalFamily,
    id: 'haus-annwyl',
    title: 'Haus Annwyl',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, revisionStorage);
  const upgraded = loadFamilyById('haus-annwyl', revisionStorage);
  assert.equal(upgraded.source, 'registry-upgrade');
  assert.equal(upgraded.family.extensions.sourceRevision, 3);
  assert.equal(upgraded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Côr Mynyddfaen');
  assert.equal(upgraded.family.document.houseProfile.seat, 'Côr Mynyddfaen');
  assert.deepEqual(upgraded.family.document.houseProfile.secondarySeats, []);
  assert.deepEqual(upgraded.family.extensions.registryManagedHouseProfileFields, [
    'seat',
    'secondarySeats',
    'regionEmblems'
  ]);
  assert.deepEqual(upgraded.family.extensions.registryManagedRecordFields, ['folderPath']);
  assert.equal(
    upgraded.family.persons.find(person => person.id === 'unknown-sibling-cennyn-annwyl').name,
    'Eithne Annwyl'
  );
  assert.equal(upgraded.family.cadetBranches.length, 4);
  assert.equal(new Set(upgraded.family.cadetBranches.map(branch => branch.id)).size, 4);
  assert.ok(upgraded.family.cadetBranches.some(branch => (
    branch.id === 'ward-away-wilff-penwyn' && branch.parentPersonId === 'wilff-annwyl'
  )));
});

test('bildet Haus Rhuddgar mit Frewis fortgeführter Hauslinie und Serennas Wegverheiratung ab', () => {
  const family = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 41);
  assert.equal(family.partnerships.length, 13);
  assert.equal(family.parentages.length, 27);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-arfon-eabha');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.motto, 'Teile die Beute – nicht das Blut.');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 2);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['arfon-rhuddgar', 'wyndham-rhuddgar', 'cadwallon-rhuddgar']
  );
  assert.deepEqual(graph.getChildren('der-wolf-rhuddgar').map(person => person.id).sort(), [
    'arawn-rhuddgar',
    'arfon-rhuddgar'
  ]);
  assert.deepEqual(graph.getChildren('frewi-rhuddgar').map(person => person.id).sort(), [
    'cari-rhuddgar',
    'ceron-rhuddgar'
  ]);
  assert.deepEqual(graph.getPartners('frewi-rhuddgar').map(person => person.id), ['ulysses']);
  [
    'sulwen-rhuddgar',
    'melyn-rhuddgar',
    'iob-rhuddgar',
    'brenn-rhuddgar',
    'teyna-rhuddgar',
    'talwyn-rhuddgar',
    'ceron-rhuddgar',
    'cari-rhuddgar'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' soll unverheiratet und ohne erfundene Platzhalterbeziehung bleiben.'
    );
  });
  assert.equal(
    family.persons.some(person => person.name === '???'),
    false,
    'Anonyme Ehepartnerfelder der jungen Generation sind keine belegten Personen.'
  );

  const frewi = graph.getPerson('frewi-rhuddgar');
  const serenna = graph.getPerson('serenna-rhuddgar');
  assert.equal(frewi.houseId, 'house-rhuddgar');
  assert.equal(frewi.familyRole, 'core');
  assert.equal(frewi.lineageRole, 'mainline');
  assert.equal(serenna.houseId, 'house-rhuddgar');
  assert.equal(serenna.familyRole, 'core');
  assert.equal(serenna.lineageRole, 'branch');
  assert.deepEqual(graph.getPartners('serenna-rhuddgar').map(person => person.id), ['emyrs-caerthwyn']);

  const marriedAwayBranches = family.cadetBranches.filter(branch => branch.linkType === 'married-away');
  assert.deepEqual(marriedAwayBranches.map(branch => branch.parentPartnershipId).sort(), [
    'marriage-dolena-morgan',
    'marriage-gwladus-ithel',
    'marriage-serenna-emyrs'
  ]);
  assert.equal(
    marriedAwayBranches.some(branch => branch.parentPartnershipId === 'marriage-frewi-ulysses'),
    false,
    'Frewi darf keine Wegverheiratet-Verknüpfung erhalten, weil ihre Kinder die Rhuddgar-Linie fortführen.'
  );
  const serennaBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-caerthwyn-serenna'
  ));
  assert.equal(serennaBranch.parentPartnershipId, 'marriage-serenna-emyrs');
  assert.equal(serennaBranch.targetFamilyId, 'haus-caerthwyn');
  assert.equal(serennaBranch.crestFrame, 'bronze');

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-arfon-wyndham-rhuddgar'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('arfon-rhuddgar').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('eabha').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), [
    'drudwas-rhuddgar',
    'gwladus-rhuddgar',
    'wyndham-rhuddgar'
  ]);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  marriedAwayBranches.forEach(branch => {
    const node = converted.data.find(entry => entry.data.aleria.cadetBranchId === branch.id);
    const partnership = family.partnerships.find(item => item.id === branch.parentPartnershipId);
    assert.deepEqual([...node.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['der-wolf-rhuddgar']);
  const pendingIds = ['der-wolf-rhuddgar'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Rhuddgar-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Rhuddgar-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert alle 36 individuellen Rhuddgar-Porträts lokal im tatsächlichen Dateiformat aus', async () => {
  const family = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-rhuddgar/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_RHUDDGAR_PORTRAITS).length, 36);
  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_RHUDDGAR_PORTRAITS).sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 36);
  assert.equal(placeholderPeople.length, 5);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(picturedPeople.map(async person => {
    assert.equal(person.portrait, HOUSE_RHUDDGAR_PORTRAITS[person.id]);
    const image = await readFile(new URL(`../${person.portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    if (person.portrait.endsWith('.png')) {
      assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
      return;
    }
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die frühere Rhuddgar-Leerakte durch den ausgearbeiteten Register-Stammbaum', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-rhuddgar',
    title: 'Haus Rhuddgar',
    emblem: HOUSE_RHUDDGAR_FAMILY.document.emblem,
    houseProfile: HOUSE_RHUDDGAR_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-rhuddgar',
    title: 'Haus Rhuddgar',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-rhuddgar', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_RHUDDGAR_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.persons.length, 41);
  assert.equal(loaded.family.extensions.blankFamily, false);
});

test('bildet Haus Gwyntog mit Elians Kindern, Owenas und Manons Wegverheiratung sowie Gereints Affäre ab', () => {
  const family = assertValidFamily(HOUSE_GWYNTOG_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 33);
  assert.equal(family.partnerships.length, 13);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-llywarch-unknown-gwyntog');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 2);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['llywarch-gwyntog', 'ithel-der-rote-gwyntog', 'alastair-gwyntog']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['nudd-gwyntog', 'doged-gwyntog']
  );

  assert.deepEqual(graph.getChildren('llywarch-gwyntog').map(person => person.id).sort(), [
    'ioan-gwyntog',
    'ithel-der-rote-gwyntog'
  ]);
  assert.deepEqual(graph.getChildren('ithel-der-rote-gwyntog').map(person => person.id).sort(), [
    'alastair-gwyntog',
    'tristan-gwyntog'
  ]);
  assert.deepEqual(graph.getChildren('ioan-gwyntog').map(person => person.id).sort(), [
    'elian-gwyntog',
    'owena-gwyntog'
  ]);
  assert.deepEqual(graph.getChildren('alastair-gwyntog').map(person => person.id).sort(), [
    'manon-gwyntog',
    'nudd-gwyntog'
  ]);
  assert.deepEqual(graph.getChildren('owena-gwyntog'), []);
  assert.deepEqual(graph.getChildren('elian-gwyntog').map(person => person.id).sort(), [
    'adda-gwyntog',
    'endaf-gwyntog'
  ]);
  assert.deepEqual(graph.getChildren('gereint-gwyntog').map(person => person.id).sort(), [
    'gutyn-gwyntog',
    'nanna-gwyntog',
    'sten'
  ]);

  const addaParentage = family.parentages.find(parentage => parentage.childId === 'adda-gwyntog');
  assert.deepEqual([...addaParentage.parentIds].sort(), [
    'elian-gwyntog',
    'unknown-spouse-elian-gwyntog'
  ]);
  assert.equal(addaParentage.partnershipId, 'marriage-elian-unknown-gwyntog');
  assert.equal(addaParentage.certainty, 'confirmed');
  assert.match(addaParentage.notes, /Kinder Elians/);
  const stenParentage = family.parentages.find(parentage => parentage.childId === 'sten');
  assert.equal(stenParentage.partnershipId, 'affair-gereint-alva');
  assert.equal(stenParentage.legitimacy, 'illegitimate');
  assert.equal(graph.getPerson('sten').familyRole, 'bastard');
  assert.equal(graph.getPerson('sten').houseId, '');

  const gereintPartnerships = family.partnerships.filter(partnership => (
    partnership.participantIds.includes('gereint-gwyntog')
  ));
  assert.deepEqual(gereintPartnerships.map(partnership => partnership.type).sort(), [
    'affair',
    'marriage'
  ]);
  assert.equal(
    gereintPartnerships.find(partnership => partnership.type === 'affair').participantIds.includes('alva'),
    true
  );
  assert.equal(graph.getPerson('alva').familyRole, 'affair');

  [
    'doged-gwyntog',
    'tybie-gwyntog',
    'gutyn-gwyntog',
    'nanna-gwyntog',
    'sten',
    'afan-gwyntog',
    'asgell-gwyntog',
    'pyderi-gwyntog'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const manonBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-unknown-manon-gwyntog'
  ));
  assert.equal(manonBranch.linkType, 'married-away');
  assert.equal(manonBranch.parentPartnershipId, 'marriage-manon-unknown-gwyntog');
  assert.equal(manonBranch.targetFamilyId, 'haus-unbekannt');
  assert.equal(manonBranch.crestFrame, 'gold');
  const owenaBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-unknown-owena-gwyntog'
  ));
  assert.equal(owenaBranch.linkType, 'married-away');
  assert.equal(owenaBranch.parentPartnershipId, 'marriage-owena-unknown-gwyntog');
  assert.equal(owenaBranch.targetFamilyId, 'haus-unbekannt');
  assert.equal(owenaBranch.crestFrame, 'gold');

  const rhuddgarGraph = createFamilyGraph(assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family);
  assert.equal(
    graph.getPerson('ithel-der-rote-gwyntog').worldPersonId,
    rhuddgarGraph.getPerson('ithel-der-rote-gwyntog').worldPersonId
  );
  assert.equal(
    graph.getPerson('gwladus-rhuddgar').worldPersonId,
    rhuddgarGraph.getPerson('gwladus-rhuddgar').worldPersonId
  );
  assert.ok(HOUSE_RHUDDGAR_FAMILY.partnerships.some(partnership => (
    partnership.id === 'marriage-gwladus-ithel'
  )));

  const balchderGraph = createFamilyGraph(assertValidFamily(HOUSE_BALCHDER_FAMILY).family);
  assert.equal(
    graph.getPerson('alastair-gwyntog').worldPersonId,
    balchderGraph.getPerson('alastair-gwyntog').worldPersonId
  );
  assert.equal(
    graph.getPerson('genofeva-balchder').worldPersonId,
    balchderGraph.getPerson('genofeva-balchder').worldPersonId
  );
  assert.ok(HOUSE_BALCHDER_FAMILY.partnerships.some(partnership => (
    partnership.id === 'marriage-genofeva-alastair'
  )));

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-llywarch-ithel-gwyntog'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('llywarch-gwyntog').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-llywarch-gwyntog').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), [
    'ioan-gwyntog',
    'ithel-der-rote-gwyntog'
  ]);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  const manonNode = converted.data.find(node => (
    node.data.aleria.cadetBranchId === 'married-away-unknown-manon-gwyntog'
  ));
  assert.deepEqual([...manonNode.rels.parents].sort(), [
    'manon-gwyntog',
    'unknown-spouse-manon-gwyntog'
  ]);
  const owenaNode = converted.data.find(node => (
    node.data.aleria.cadetBranchId === 'married-away-unknown-owena-gwyntog'
  ));
  assert.deepEqual([...owenaNode.rels.parents].sort(), [
    'owena-gwyntog',
    'unknown-spouse-owena-gwyntog'
  ]);

  const connectedIds = new Set(['llywarch-gwyntog']);
  const pendingIds = ['llywarch-gwyntog'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Gwyntog-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Gwyntog-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 19 neue und drei kanonisch wiederverwendete Gwyntog-Porträts lokal aus', async () => {
  const family = assertValidFamily(HOUSE_GWYNTOG_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-gwyntog/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(sourceManifest);

  assert.equal(Object.keys(HOUSE_GWYNTOG_PORTRAITS).length, 22);
  assert.equal(localPortraitIds.length, 19);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 22);
  assert.equal(placeholderPeople.length, 11);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  assert.equal(
    HOUSE_GWYNTOG_PORTRAITS['ithel-der-rote-gwyntog'],
    HOUSE_RHUDDGAR_PORTRAITS['ithel-der-rote-gwyntog']
  );
  assert.equal(
    HOUSE_GWYNTOG_PORTRAITS['alastair-gwyntog'],
    HOUSE_BALCHDER_PORTRAITS['alastair-gwyntog']
  );
  assert.equal(
    HOUSE_GWYNTOG_PORTRAITS['genofeva-balchder'],
    HOUSE_BALCHDER_PORTRAITS['genofeva-balchder']
  );

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_GWYNTOG_PORTRAITS[personId];
    assert.equal(portrait, 'assets/images/portraits/haus-gwyntog/' + personId + '.png');
    const image = await readFile(new URL('../' + portrait, import.meta.url));
    assert.ok(image.length > 100, 'Portraitdatei für ' + personId + ' ist leer.');
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die frühere Gwyntog-Leerakte durch den ausgearbeiteten Register-Stammbaum', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-gwyntog',
    title: 'Haus Gwyntog',
    emblem: HOUSE_GWYNTOG_FAMILY.document.emblem,
    houseProfile: HOUSE_GWYNTOG_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-gwyntog',
    title: 'Haus Gwyntog',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-gwyntog', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_GWYNTOG_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.persons.length, 33);
  assert.equal(loaded.family.extensions.blankFamily, false);

  const revisionStorage = createMemoryStorage();
  const previousRevision = normalizeFamily({
    ...HOUSE_GWYNTOG_FAMILY,
    houses: HOUSE_GWYNTOG_FAMILY.houses.filter(house => (
      house.id !== 'house-unbekannt-owena-gwyntog'
    )),
    persons: HOUSE_GWYNTOG_FAMILY.persons.map(person => (
      person.id === 'owena-gwyntog'
        ? {
            ...person,
            notes: 'Owena wurde in der älteren Fassung irrtümlich als Mutter von Adda und Endaf geführt.',
            extensions: {}
          }
        : person
    )),
    parentages: HOUSE_GWYNTOG_FAMILY.parentages.map(parentage => (
      ['adda-gwyntog', 'endaf-gwyntog'].includes(parentage.childId)
        ? {
            ...parentage,
            parentIds: ['owena-gwyntog', 'unknown-spouse-owena-gwyntog'],
            partnershipId: 'marriage-owena-unknown-gwyntog',
            type: 'claimed',
            certainty: 'probable',
            notes: 'Ältere, inzwischen korrigierte Zuordnung.',
            extensions: {}
          }
        : parentage
    )),
    cadetBranches: HOUSE_GWYNTOG_FAMILY.cadetBranches.filter(branch => (
      branch.id !== 'married-away-unknown-owena-gwyntog'
    )),
    extensions: {
      ...HOUSE_GWYNTOG_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousRevision,
    id: 'haus-gwyntog',
    title: 'Haus Gwyntog',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, revisionStorage);

  const upgraded = loadFamilyById('haus-gwyntog', revisionStorage);
  const upgradedAddaParentage = upgraded.family.parentages.find(parentage => (
    parentage.childId === 'adda-gwyntog'
  ));
  assert.equal(upgraded.source, 'registry-upgrade');
  assert.equal(upgraded.family.extensions.sourceRevision, 2);
  assert.deepEqual([...upgradedAddaParentage.parentIds].sort(), [
    'elian-gwyntog',
    'unknown-spouse-elian-gwyntog'
  ]);
  assert.equal(upgradedAddaParentage.partnershipId, 'marriage-elian-unknown-gwyntog');
  assert.ok(upgraded.family.cadetBranches.some(branch => (
    branch.id === 'married-away-unknown-owena-gwyntog'
  )));
  assert.match(
    upgraded.family.persons.find(person => person.id === 'owena-gwyntog').notes,
    /führt die Gwyntog-Linie nicht fort/
  );
});

test('bildet Haus Trydar mit serieller Quellenlücke, Erbfolge und Maeryns Wegverheiratung ab', () => {
  const family = assertValidFamily(HOUSE_TRYDAR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 24);
  assert.equal(family.partnerships.length, 8);
  assert.equal(family.parentages.length, 15);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-maelor-unknown-trydar');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.document.motto, '');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 3);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['maelor-trydar', 'morgan-trydar']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['pryce-trydar', 'maldwyn-trydar']
  );

  const expectedChildren = new Map([
    ['maelor-trydar', ['cadfan-trydar', 'morgan-trydar']],
    ['morgan-trydar', ['meiron-trydar', 'pryce-trydar', 'rheon-trydar']],
    ['cadfan-trydar', ['eynion-trydar', 'maeryn-trydar']],
    ['pryce-trydar', ['maldwyn-trydar', 'morcant-trydar', 'peithwen-trydar']],
    ['rheon-trydar', ['talon-trydar']],
    ['meiron-trydar', ['morwen-trydar', 'steffon-trydar']],
    ['eynion-trydar', ['meira-trydar', 'selwyn-trydar']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'maldwyn-trydar',
    'peithwen-trydar',
    'morcant-trydar',
    'talon-trydar',
    'steffon-trydar',
    'morwen-trydar',
    'selwyn-trydar',
    'meira-trydar'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const maerynBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-unknown-maeryn-trydar'
  ));
  assert.equal(maerynBranch.linkType, 'married-away');
  assert.equal(maerynBranch.parentPartnershipId, 'marriage-maeryn-unknown-trydar');
  assert.equal(maerynBranch.targetFamilyId, 'haus-unbekannt');
  assert.equal(maerynBranch.crestFrame, 'gold');
  assert.match(maerynBranch.notes, /führt die Trydar-Linie nicht fort/);

  [
    ['morcant-trydar', 'ward-away-morcant-daran', 'haus-daran', 'Haus Daran'],
    ['talon-trydar', 'ward-away-talon-draig', 'haus-draig', 'Haus Draig']
  ].forEach(([personId, branchId, targetFamilyId, targetHouseName]) => {
    const person = graph.getPerson(personId);
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(person.familyRole, 'ward-away');
    assert.ok(person.tags.includes('Fortgegebenes Mündel'));
    assert.match(person.title, new RegExp('Mündel bei ' + targetHouseName));
    assert.equal(branch.linkType, 'ward-away');
    assert.equal(branch.parentPartnershipId, '');
    assert.equal(branch.parentPersonId, personId);
    assert.equal(branch.targetFamilyId, targetFamilyId);
  });

  const rhuddgar = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const rhuddgarGraph = createFamilyGraph(rhuddgar);
  ['morgan-trydar', 'dolena-rhuddgar'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      rhuddgarGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt hausübergreifend dieselbe Weltperson.'
    );
  });
  assert.ok(rhuddgar.partnerships.some(partnership => (
    partnership.id === 'marriage-dolena-morgan'
  )));
  assert.equal(
    HOUSE_TRYDAR_PORTRAITS['morgan-trydar'],
    HOUSE_RHUDDGAR_PORTRAITS['morgan-trydar']
  );
  assert.equal(
    HOUSE_TRYDAR_PORTRAITS['dolena-rhuddgar'],
    HOUSE_RHUDDGAR_PORTRAITS['dolena-rhuddgar']
  );
  assert.notEqual(
    HOUSE_TRYDAR_PORTRAITS['pryce-trydar'],
    HOUSE_TRYDAR_PORTRAITS['rheon-trydar']
  );
  assert.match(HOUSE_TRYDAR_PORTRAITS['pryce-trydar'], /pryce-trydar\.png$/);
  assert.match(family.extensions.sourceNote, /Eynion eindeutig als Vater von Selwyn und Meira/);
  assert.match(family.extensions.sourceNote, /Pryces Portrait/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-maelor-morgan-trydar'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('maelor-trydar').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-maelor-trydar').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), ['cadfan-trydar', 'morgan-trydar']);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  const maerynBranchNode = converted.data.find(node => (
    node.data.aleria.cadetBranchId === 'married-away-unknown-maeryn-trydar'
  ));
  assert.deepEqual([...maerynBranchNode.rels.parents].sort(), [
    'maeryn-trydar',
    'unknown-spouse-maeryn-trydar'
  ]);
  [
    ['morcant-trydar', 'ward-away-morcant-daran'],
    ['talon-trydar', 'ward-away-talon-draig']
  ].forEach(([personId, branchId]) => {
    const personNode = chartById.get(personId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.match(personNode.data.frameAsset, /person-ward-away\.png$/);
    assert.deepEqual(branchNode.rels.parents, [personId]);
    assert.ok(personNode.rels.children.includes(branchNode.id));
  });

  const connectedIds = new Set(['maelor-trydar']);
  const pendingIds = ['maelor-trydar'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Trydar-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Trydar-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 15 neue und zwei kanonisch wiederverwendete Trydar-Porträts lokal aus', async () => {
  const family = assertValidFamily(HOUSE_TRYDAR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-trydar/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(sourceManifest);

  assert.equal(Object.keys(HOUSE_TRYDAR_PORTRAITS).length, 17);
  assert.equal(localPortraitIds.length, 15);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.equal(picturedPeople.length, 17);
  assert.equal(placeholderPeople.length, 7);
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  picturedPeople.forEach(person => {
    assert.equal(person.portrait, HOUSE_TRYDAR_PORTRAITS[person.id]);
  });

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_TRYDAR_PORTRAITS[personId];
    assert.equal(portrait, 'assets/images/portraits/haus-trydar/' + personId + '.png');
    const image = await readFile(new URL('../' + portrait, import.meta.url));
    assert.ok(image.length > 100, 'Portraitdatei für ' + personId + ' ist leer.');
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die frühere Trydar-Leerakte durch den ausgearbeiteten Register-Stammbaum', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-trydar',
    title: 'Haus Trydar',
    emblem: HOUSE_TRYDAR_FAMILY.document.emblem,
    houseProfile: HOUSE_TRYDAR_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-trydar',
    title: 'Haus Trydar',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-trydar', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_TRYDAR_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.persons.length, 24);
  assert.equal(loaded.family.extensions.blankFamily, false);

  const revisionStorage = createMemoryStorage();
  const previousRevision = normalizeFamily({
    ...HOUSE_TRYDAR_FAMILY,
    houses: HOUSE_TRYDAR_FAMILY.houses.filter(house => (
      !['house-daran', 'house-draig'].includes(house.id)
    )),
    persons: HOUSE_TRYDAR_FAMILY.persons.map(person => {
      if (person.id === 'morcant-trydar') {
        return {
          ...person,
          title: 'Page bei Ritterherr Maelgwyn Daran',
          familyRole: 'core',
          tags: [],
          notes: 'Wurde zur ritterlichen Ausbildung bewusst in Maelgwyn Darans Dienst gegeben.',
          extensions: {}
        };
      }
      if (person.id === 'talon-trydar') {
        return {
          ...person,
          title: 'Knappe von Prinz Idwal Draig',
          familyRole: 'core',
          tags: [],
          notes: 'Dient Prinz Idwal Draig auf Wunsch des Hauses Trydar.',
          extensions: {}
        };
      }
      return person;
    }),
    cadetBranches: HOUSE_TRYDAR_FAMILY.cadetBranches.filter(branch => (
      !['ward-away-morcant-daran', 'ward-away-talon-draig'].includes(branch.id)
    )),
    extensions: {
      ...HOUSE_TRYDAR_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousRevision,
    id: 'haus-trydar',
    title: 'Haus Trydar',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, revisionStorage);

  const upgraded = loadFamilyById('haus-trydar', revisionStorage);
  assert.equal(upgraded.source, 'registry-upgrade');
  assert.equal(upgraded.family.extensions.sourceRevision, 3);
  assert.equal(upgraded.family.persons.length, 24);
  assert.equal(upgraded.family.cadetBranches.length, 3);
  assert.equal(
    upgraded.family.persons.find(person => person.id === 'morcant-trydar').familyRole,
    'ward-away'
  );
  assert.equal(
    upgraded.family.persons.find(person => person.id === 'morcant-trydar').title,
    'Knappe von Sir Seithved Daran · Mündel bei Haus Daran'
  );
  assert.equal(
    upgraded.family.persons.find(person => person.id === 'talon-trydar').familyRole,
    'ward-away'
  );
  assert.equal(
    upgraded.family.cadetBranches.filter(branch => branch.id === 'ward-away-talon-draig').length,
    1
  );
});

test('bildet Haus Taranvyr mit serieller Gründerlücke, Erbfolge und beiden Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_TARANVYR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 35);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 22);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-rhydian-vanora-taranvyr');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.document.motto, 'In Treue wachen wir');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['rhydian-taranvyr', 'kenyon-taranvyr']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['hywel-taranvyr', 'powell-taranvyr', 'kane-taranvyr', 'marvo-taranvyr']
  );

  const expectedChildren = new Map([
    ['rhydian-taranvyr', ['kenyon-taranvyr', 'kerrilyn-taranvyr']],
    ['kenyon-taranvyr', ['alestan-taranvyr', 'brendan-taranvyr', 'hywel-taranvyr', 'linessa-taranvyr', 'rhon-taranvyr']],
    ['hywel-taranvyr', ['leolin-taranvyr', 'powell-taranvyr']],
    ['alestan-taranvyr', ['taron-taranvyr']],
    ['brendan-taranvyr', ['trevor-taranvyr']],
    ['rhon-taranvyr', ['caelan-taranvyr']],
    ['powell-taranvyr', ['jennifa-taranvyr', 'kane-taranvyr', 'marvo-taranvyr']],
    ['leolin-taranvyr', ['gwenda-taranvyr', 'vaughn-taranvyr']],
    ['taron-taranvyr', ['cael-taranvyr', 'hefin-taranvyr', 'vanora-taranvyr']],
    ['trevor-taranvyr', ['ieuan-taranvyr', 'lilifer-taranvyr']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'caelan-taranvyr',
    'kane-taranvyr',
    'jennifa-taranvyr',
    'marvo-taranvyr',
    'vaughn-taranvyr',
    'gwenda-taranvyr',
    'vanora-taranvyr',
    'cael-taranvyr',
    'hefin-taranvyr',
    'ieuan-taranvyr',
    'lilifer-taranvyr'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-tawelgar-kerrilyn', {
      partnershipId: 'marriage-kerrilyn-maredudd',
      targetFamilyId: 'haus-tawelgar'
    }],
    ['married-away-selog-linessa', {
      partnershipId: 'marriage-linessa-godwyn',
      targetFamilyId: 'haus-selog'
    }]
  ]);
  expectedBranches.forEach((expected, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, expected.partnershipId);
    assert.equal(branch.targetFamilyId, expected.targetFamilyId);
    assert.equal(branch.crestFrame, 'silver');
  });
  assert.deepEqual(
    family.cadetBranches.map(branch => branch.targetFamilyId).sort(),
    ['haus-selog', 'haus-tawelgar'],
    'Eingeheiratete Gwyvern- und Caerthwyn-Partner erzeugen keine Herkunftshausknoten.'
  );

  const gwyvern = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const gwyvernGraph = createFamilyGraph(gwyvern);
  ['kenyon-taranvyr', 'talaith-gwyvern'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      gwyvernGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt hausübergreifend dieselbe Weltperson.'
    );
  });
  assert.equal(graph.getPerson('kenyon-taranvyr').status, 'alive');
  assert.equal(gwyvernGraph.getPerson('kenyon-taranvyr').status, 'alive');
  assert.equal(graph.getPerson('talaith-gwyvern').death, '1735');
  assert.ok(gwyvern.partnerships.some(partnership => partnership.id === 'marriage-talaith-kenyon'));
  assert.equal(
    HOUSE_TARANVYR_PORTRAITS['kenyon-taranvyr'],
    HOUSE_GWYVERN_PORTRAITS['kenyon-taranvyr']
  );
  assert.equal(
    HOUSE_TARANVYR_PORTRAITS['talaith-gwyvern'],
    HOUSE_GWYVERN_PORTRAITS['talaith-gwyvern']
  );

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-rhydian-kenyon-taranvyr'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('rhydian-taranvyr').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('vanora-founder-taranvyr').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), ['kenyon-taranvyr', 'kerrilyn-taranvyr']);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  [
    ['married-away-tawelgar-kerrilyn', ['kerrilyn-taranvyr', 'maredudd-tawelgar']],
    ['married-away-selog-linessa', ['godwyn-selog', 'linessa-taranvyr']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['rhydian-taranvyr']);
  const pendingIds = ['rhydian-taranvyr'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Taranvyr-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Taranvyr-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 33 neue und zwei kanonisch wiederverwendete Taranvyr-Porträts lokal aus', async () => {
  const family = assertValidFamily(HOUSE_TARANVYR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-taranvyr/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(sourceManifest);

  assert.equal(Object.keys(HOUSE_TARANVYR_PORTRAITS).length, 35);
  assert.equal(localPortraitIds.length, 33);
  assert.equal(picturedPeople.length, 35);
  assert.equal(placeholderPeople.length, 0);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  picturedPeople.forEach(person => {
    assert.equal(person.portrait, HOUSE_TARANVYR_PORTRAITS[person.id]);
  });

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_TARANVYR_PORTRAITS[personId];
    assert.equal(portrait, 'assets/images/portraits/haus-taranvyr/' + personId + '.jpg');
    const image = await readFile(new URL('../' + portrait, import.meta.url));
    assert.ok(image.length > 100, 'Portraitdatei für ' + personId + ' ist leer.');
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Taranvyr-Leerakte und migriert Kenyons Gwyvern-Gegenakte ohne Duplikate', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-taranvyr',
    title: 'Haus Taranvyr',
    emblem: HOUSE_TARANVYR_FAMILY.document.emblem,
    houseProfile: HOUSE_TARANVYR_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-taranvyr',
    title: 'Haus Taranvyr',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-taranvyr', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_TARANVYR_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.persons.length, 35);
  assert.equal(loaded.family.extensions.blankFamily, false);

  const gwyvernStorage = createMemoryStorage();
  const previousGwyvernRevision = normalizeFamily({
    ...HOUSE_GWYVERN_FAMILY,
    persons: HOUSE_GWYVERN_FAMILY.persons.map(person => (
      person.id === 'kenyon-taranvyr'
        ? {
            ...person,
            status: 'dead',
            death: '????',
            extensions: {}
          }
        : person
    )),
    extensions: {
      ...HOUSE_GWYVERN_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousGwyvernRevision,
    id: 'haus-gwyvern',
    title: 'Haus Gwyvern',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, gwyvernStorage);

  const upgradedGwyvern = loadFamilyById('haus-gwyvern', gwyvernStorage);
  const upgradedKenyons = upgradedGwyvern.family.persons.filter(person => person.id === 'kenyon-taranvyr');
  assert.equal(upgradedGwyvern.source, 'registry-upgrade');
  assert.equal(upgradedGwyvern.family.extensions.sourceRevision, 3);
  assert.equal(upgradedKenyons.length, 1);
  assert.equal(upgradedKenyons[0].status, 'alive');
  assert.equal(upgradedKenyons[0].death, '');
});

test('bildet Haus Selog mit serieller Gründerlücke, Erbfolge und direkten Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_SELOG_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 33);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-gwerthrynion-unknown-selog');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.deepEqual(family.document.houseProfile.secondarySeats, ['Burg am Feuerstollen']);
  assert.equal(family.document.motto, '');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['gwerthrynion-selog', 'padarn-selog', 'godwyn-selog']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['adda-selog', 'afan-selog', 'drystan-selog']
  );

  const expectedChildren = new Map([
    ['gwerthrynion-selog', ['marchell-1649-selog', 'padarn-selog', 'rhun-selog']],
    ['padarn-selog', ['godwyn-selog', 'sioned-selog']],
    ['rhun-selog', ['hywel-selog']],
    ['godwyn-selog', ['adda-selog', 'cynan-selog', 'gwalchmai-selog', 'meggan-selog']],
    ['hywel-selog', ['gethin-selog']],
    ['adda-selog', ['afan-selog', 'drystan-selog']],
    ['gwalchmai-selog', ['llywarch-selog', 'marsli-selog', 'siwan-selog']],
    ['cynan-selog', ['heilyn-selog', 'marchell-1722-selog']],
    ['gethin-selog', ['arthfael-selog', 'ystedd-selog']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'afan-selog',
    'drystan-selog',
    'heilyn-selog',
    'marchell-1722-selog',
    'llywarch-selog',
    'marsli-selog',
    'siwan-selog',
    'arthfael-selog',
    'ystedd-selog'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-unknown-marchell-selog', {
      partnershipId: 'marriage-marchell-unknown-selog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold'
    }],
    ['married-away-unknown-sioned-selog', {
      partnershipId: 'marriage-sioned-unknown-selog',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold'
    }],
    ['married-away-rhuddgar-meggan', {
      partnershipId: 'marriage-lewys-meggan',
      targetFamilyId: 'haus-rhuddgar',
      crestFrame: 'silver'
    }]
  ]);
  expectedBranches.forEach((expected, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, expected.partnershipId);
    assert.equal(branch.targetFamilyId, expected.targetFamilyId);
    assert.equal(branch.crestFrame, expected.crestFrame);
  });
  assert.deepEqual(
    family.cadetBranches.map(branch => branch.targetFamilyId).sort(),
    ['haus-rhuddgar', 'haus-unbekannt', 'haus-unbekannt'],
    'Linessas Taranvyr-Wappen bleibt ein Herkunftshinweis und wird nicht als paralleler Hausknoten dupliziert.'
  );

  const taranvyr = assertValidFamily(HOUSE_TARANVYR_FAMILY).family;
  const taranvyrGraph = createFamilyGraph(taranvyr);
  ['godwyn-selog', 'linessa-taranvyr'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      taranvyrGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt in Selog und Taranvyr dieselbe Weltperson.'
    );
    assert.equal(HOUSE_SELOG_PORTRAITS[personId], HOUSE_TARANVYR_PORTRAITS[personId]);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-linessa-godwyn'),
    taranvyr.partnerships.find(partnership => partnership.id === 'marriage-linessa-godwyn')
  );

  const rhuddgar = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const rhuddgarGraph = createFamilyGraph(rhuddgar);
  ['meggan-selog', 'lewys-rhuddgar'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      rhuddgarGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt in Selog und Rhuddgar dieselbe Weltperson.'
    );
    assert.equal(HOUSE_SELOG_PORTRAITS[personId], HOUSE_RHUDDGAR_PORTRAITS[personId]);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-lewys-meggan'),
    rhuddgar.partnerships.find(partnership => partnership.id === 'marriage-lewys-meggan')
  );

  assert.equal(graph.getPerson('godwyn-selog').birth, '1673');
  assert.deepEqual(
    graph.getParents('cynan-selog').map(person => person.id).sort(),
    ['godwyn-selog', 'linessa-taranvyr']
  );
  assert.match(family.extensions.sourceNote, /widersprüchlich als 1720/);
  assert.match(family.extensions.sourceNote, /allgemeine Haustradition/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-gwerthrynion-padarn-selog'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('gwerthrynion-selog').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-gwerthrynion-selog').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['marchell-1649-selog', 'padarn-selog', 'rhun-selog']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  [
    ['married-away-unknown-marchell-selog', ['marchell-1649-selog', 'unknown-spouse-marchell-1649-selog']],
    ['married-away-unknown-sioned-selog', ['sioned-selog', 'unknown-spouse-sioned-selog']],
    ['married-away-rhuddgar-meggan', ['lewys-rhuddgar', 'meggan-selog']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['gwerthrynion-selog']);
  const pendingIds = ['gwerthrynion-selog'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Selog-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Selog-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 18 neue und vier kanonisch wiederverwendete Selog-Porträts lokal aus', async () => {
  const family = assertValidFamily(HOUSE_SELOG_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-selog/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(sourceManifest);

  assert.equal(Object.keys(HOUSE_SELOG_PORTRAITS).length, 22);
  assert.equal(localPortraitIds.length, 18);
  assert.equal(picturedPeople.length, 22);
  assert.equal(placeholderPeople.length, 11);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  picturedPeople.forEach(person => {
    assert.equal(person.portrait, HOUSE_SELOG_PORTRAITS[person.id]);
  });
  placeholderPeople.forEach(person => {
    assert.equal(person.portraitPlaceholder, 'auto');
  });

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_SELOG_PORTRAITS[personId];
    assert.equal(portrait, 'assets/images/portraits/haus-selog/' + personId + '.png');
    const image = await readFile(new URL('../' + portrait, import.meta.url));
    assert.ok(image.length > 100, 'Portraitdatei für ' + personId + ' ist leer.');
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die Selog-Leerakte im Familienregister ohne einen zweiten Stammbaum anzulegen', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-selog',
    title: 'Haus Selog',
    emblem: HOUSE_SELOG_FAMILY.document.emblem,
    houseProfile: HOUSE_SELOG_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-selog',
    title: 'Haus Selog',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-selog', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_SELOG_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.persons.length, 33);
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-selog').length, 1);
});

test('bildet Haus Penwyn mit serieller Gründerlücke, beiden Hauptzweigen und allen Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_PENWYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 34);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 21);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-founder-unknown-penwyn');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Morddyn');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-draig');
  assert.match(family.document.houseProfile.regionEmblems.seat, /Morddyn\.png$/);
  assert.equal(family.document.motto, '');
  assert.equal(family.extensions.blankFamily, false);
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['unknown-founder-penwyn', 'rhys-penwyn']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['cadfael-penwyn', 'myriad-penwyn', 'gruffyd-penwyn']
  );

  const expectedChildren = new Map([
    ['unknown-founder-penwyn', ['mervin-penwyn', 'morfydd-penwyn', 'myrddon-penwyn']],
    ['myrddon-penwyn', ['dlyan-penwyn', 'rhys-penwyn']],
    ['mervin-penwyn', ['marared-penwyn', 'mared-penwyn']],
    ['rhys-penwyn', ['cadfael-penwyn', 'maelor-penwyn', 'rhoswyn-penwyn']],
    ['marared-penwyn', ['braith-penwyn', 'dafydd-penwyn']],
    ['cadfael-penwyn', ['cerridwyn-penwyn', 'gruffyd-penwyn', 'myriad-penwyn', 'rhianu-penwyn']],
    ['maelor-penwyn', ['merlyn-penwyn', 'merrin-penwyn']],
    ['dafydd-penwyn', ['aleth-penwyn', 'ewenny-penwyn', 'tesni-penwyn']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'dlyan-penwyn',
    'rhianu-penwyn',
    'myriad-penwyn',
    'gruffyd-penwyn',
    'cerridwyn-penwyn',
    'merlyn-penwyn',
    'merrin-penwyn',
    'ewenny-penwyn',
    'aleth-penwyn',
    'tesni-penwyn'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-unknown-morfydd-penwyn', {
      partnershipId: 'marriage-morfydd-unknown-penwyn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold'
    }],
    ['married-away-awenydd-rhoswyn', {
      partnershipId: 'marriage-brychan-rhoswyn',
      targetFamilyId: 'haus-awenydd',
      crestFrame: 'silver'
    }],
    ['married-away-unknown-braith-penwyn', {
      partnershipId: 'marriage-braith-unknown-penwyn',
      targetFamilyId: 'haus-unbekannt',
      crestFrame: 'gold'
    }]
  ]);
  expectedBranches.forEach((expected, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, expected.partnershipId);
    assert.equal(branch.targetFamilyId, expected.targetFamilyId);
    assert.equal(branch.crestFrame, expected.crestFrame);
  });
  assert.deepEqual(
    family.cadetBranches.map(branch => branch.targetFamilyId).sort(),
    ['haus-awenydd', 'haus-unbekannt', 'haus-unbekannt'],
    'Catelyns Edmy-Wappen bleibt ein Herkunftshinweis und wird nicht als paralleler Hausknoten dupliziert.'
  );

  const awenydd = assertValidFamily(HOUSE_AWENYDD_FAMILY).family;
  const awenyddGraph = createFamilyGraph(awenydd);
  ['rhoswyn-penwyn', 'brychan-awenydd'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      awenyddGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt in Penwyn und Awenydd dieselbe Weltperson.'
    );
    assert.equal(HOUSE_PENWYN_PORTRAITS[personId], HOUSE_AWENYDD_PORTRAITS[personId]);
  });
  assert.equal(graph.getPerson('rhoswyn-penwyn').birth, '1700');
  assert.equal(awenyddGraph.getPerson('rhoswyn-penwyn').birth, '1700');
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-brychan-rhoswyn'),
    awenydd.partnerships.find(partnership => partnership.id === 'marriage-brychan-rhoswyn')
  );
  assert.deepEqual(
    awenyddGraph.getChildren('rhoswyn-penwyn').map(person => person.id).sort(),
    ['bors-awenydd', 'ludd-awenydd'],
    'Rhoswyns Awenydd-Nachkommen bleiben ausschließlich in der Zielhausakte vollständig ausgeführt.'
  );
  assert.equal(graph.getChildren('rhoswyn-penwyn').length, 0);

  assert.equal(family.persons.some(person => person.id === 'wilff-annwyl'), false);
  const wilffBranch = HOUSE_ANNWYL_FAMILY.cadetBranches.find(branch => branch.id === 'ward-away-wilff-penwyn');
  assert.equal(wilffBranch.parentPersonId, 'wilff-annwyl');
  assert.equal(wilffBranch.targetFamilyId, 'haus-penwyn');
  assert.equal(wilffBranch.linkType, 'ward-away');

  assert.match(family.extensions.sourceNote, /Cadfael und Cerridwyn/);
  assert.match(family.extensions.sourceNote, /Cadfael und Alawen/);
  assert.match(family.extensions.sourceNote, /Marared führt die Penwyn-Linie/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-founder-myrddon-penwyn'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('unknown-founder-penwyn').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-founder-spouse-penwyn').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['mervin-penwyn', 'morfydd-penwyn', 'myrddon-penwyn']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);
  assert.match(crest.data.crestFrameAsset, /crest-silver\.png$/);

  [
    ['married-away-unknown-morfydd-penwyn', ['morfydd-penwyn', 'unknown-spouse-morfydd-penwyn']],
    ['married-away-awenydd-rhoswyn', ['brychan-awenydd', 'rhoswyn-penwyn']],
    ['married-away-unknown-braith-penwyn', ['braith-penwyn', 'unknown-spouse-braith-penwyn']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['unknown-founder-penwyn']);
  const pendingIds = ['unknown-founder-penwyn'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Penwyn-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Penwyn-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 21 neue und zwei kanonisch wiederverwendete Penwyn-Porträts lokal aus', async () => {
  const family = assertValidFamily(HOUSE_PENWYN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-penwyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(sourceManifest);

  assert.equal(Object.keys(HOUSE_PENWYN_PORTRAITS).length, 23);
  assert.equal(localPortraitIds.length, 21);
  assert.equal(picturedPeople.length, 23);
  assert.equal(placeholderPeople.length, 11);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  picturedPeople.forEach(person => {
    assert.equal(person.portrait, HOUSE_PENWYN_PORTRAITS[person.id]);
  });
  placeholderPeople.forEach(person => {
    assert.equal(person.portraitPlaceholder, 'auto');
  });

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_PENWYN_PORTRAITS[personId];
    assert.equal(portrait, 'assets/images/portraits/haus-penwyn/' + personId + '.png');
    const image = await readFile(new URL('../' + portrait, import.meta.url));
    assert.ok(image.length > 100, 'Portraitdatei für ' + personId + ' ist leer.');
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die Penwyn-Leerakte und aktualisiert Rhoswyns Awenydd-Gegenakte ohne Duplikate', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-penwyn',
    title: 'Haus Penwyn',
    emblem: HOUSE_PENWYN_FAMILY.document.emblem,
    houseProfile: HOUSE_PENWYN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-penwyn',
    title: 'Haus Penwyn',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Morddyn']
  }, storage);

  const loaded = loadFamilyById('haus-penwyn', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_PENWYN_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Morddyn');
  assert.equal(loaded.family.persons.length, 34);
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-penwyn').length, 1);

  const awenyddStorage = createMemoryStorage();
  const previousAwenyddRevision = normalizeFamily({
    ...HOUSE_AWENYDD_FAMILY,
    persons: HOUSE_AWENYDD_FAMILY.persons.map(person => (
      person.id === 'rhoswyn-penwyn'
        ? {
            ...person,
            worldPersonId: 'family-tree:rhoswyn-penwyn',
            birth: '????',
            houseId: ''
          }
        : person
    )),
    extensions: {
      ...HOUSE_AWENYDD_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousAwenyddRevision,
    id: 'haus-awenydd',
    title: 'Haus Awenydd',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, awenyddStorage);

  const upgradedAwenydd = loadFamilyById('haus-awenydd', awenyddStorage);
  const upgradedRhoswyns = upgradedAwenydd.family.persons.filter(person => person.id === 'rhoswyn-penwyn');
  assert.equal(upgradedAwenydd.source, 'registry-upgrade');
  assert.equal(upgradedAwenydd.family.extensions.sourceRevision, 2);
  assert.equal(upgradedRhoswyns.length, 1);
  assert.equal(upgradedRhoswyns[0].birth, '1700');
  assert.equal(upgradedRhoswyns[0].status, 'alive');
  assert.equal(upgradedRhoswyns[0].houseId, 'house-penwyn');
  assert.equal(upgradedRhoswyns[0].familyRole, 'married');
  assert.equal(
    upgradedRhoswyns[0].worldPersonId,
    HOUSE_PENWYN_FAMILY.persons.find(person => person.id === 'rhoswyn-penwyn').worldPersonId
  );
});

test('bildet Haus Seldryn lückenlos mit Erbfolge und beiden Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_SELDRYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 25);
  assert.equal(family.partnerships.length, 9);
  assert.equal(family.parentages.length, 15);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-bronwen-lugh');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['lugh-seldryn', 'braint-seldryn']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['cynon-seldryn', 'hirlas-seldryn', 'maelron-seldryn']
  );

  const expectedChildren = new Map([
    ['lugh-seldryn', ['aelwen-seldryn', 'braint-seldryn', 'ywain-seldryn']],
    ['braint-seldryn', ['celynnen-seldryn', 'cynon-seldryn', 'tavian-seldryn']],
    ['ywain-seldryn', ['ysgar-seldryn']],
    ['cynon-seldryn', ['elaine-seldryn', 'hirlas-seldryn', 'maelron-seldryn']],
    ['tavian-seldryn', ['anest-seldryn', 'seith-seldryn']],
    ['ysgar-seldryn', ['gwenfair-seldryn', 'urien-seldryn']],
    ['hirlas-seldryn', ['hefin-seldryn']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'elaine-seldryn',
    'maelron-seldryn',
    'seith-seldryn',
    'anest-seldryn',
    'urien-seldryn',
    'gwenfair-seldryn',
    'hefin-seldryn'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-unknown-aelwen-seldryn', 'marriage-aelwen-unknown-seldryn'],
    ['married-away-unknown-celynnen-seldryn', 'marriage-celynnen-unknown-seldryn']
  ]);
  expectedBranches.forEach((partnershipId, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.targetFamilyId, 'haus-unbekannt');
    assert.equal(branch.crestFrame, 'gold');
  });

  const balchderGraph = createFamilyGraph(assertValidFamily(HOUSE_BALCHDER_FAMILY).family);
  ['lugh-seldryn', 'bronwen-balchder'].forEach(personId => {
    assert.equal(
      graph.getPerson(personId).worldPersonId,
      balchderGraph.getPerson(personId).worldPersonId,
      personId + ' bleibt in Seldryn und Balchder dieselbe Weltperson.'
    );
    assert.equal(graph.getPerson(personId).portrait, balchderGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-bronwen-lugh'),
    HOUSE_BALCHDER_FAMILY.partnerships.find(partnership => partnership.id === 'marriage-bronwen-lugh')
  );
  assert.equal(HOUSE_BALCHDER_PORTRAITS['lugh-seldryn'], HOUSE_SELDRYN_PORTRAITS['lugh-seldryn']);
  assert.match(family.extensions.sourceNote, /Geburtsjahr 1680/);
  assert.match(family.extensions.sourceNote, /Hierarchie.*1650/);
  assert.match(family.extensions.sourceNote, /Yvain.*Ywain/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  assert.ok(crest);
  assert.deepEqual(chartById.get('lugh-seldryn').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('bronwen-balchder').rels.children, [crest.id]);
  assert.deepEqual(
    [...crest.rels.children].sort(),
    ['aelwen-seldryn', 'braint-seldryn', 'ywain-seldryn']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 0);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-gap').length, 0);

  [
    ['married-away-unknown-aelwen-seldryn', ['aelwen-seldryn', 'unknown-spouse-aelwen-seldryn']],
    ['married-away-unknown-celynnen-seldryn', ['celynnen-seldryn', 'unknown-spouse-celynnen-seldryn']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['lugh-seldryn']);
  const pendingIds = ['lugh-seldryn'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Seldryn-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Seldryn-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 16 neue und Lughs synchronisiertes Seldryn-Portrait lokal aus', async () => {
  const family = assertValidFamily(HOUSE_SELDRYN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-seldryn/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_SELDRYN_PORTRAITS).length, 17);
  assert.equal(Object.keys(sourceManifest).length, 17);
  assert.equal(picturedPeople.length, 17);
  assert.equal(placeholderPeople.length, 8);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_SELDRYN_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Seldryn-Person: ${personId}`);
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

test('ersetzt die Seldryn-Leerakte und migriert die korrigierte Balchder-Gegenverknüpfung', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-seldryn',
    title: 'Haus Seldryn',
    emblem: HOUSE_SELDRYN_FAMILY.document.emblem,
    houseProfile: HOUSE_SELDRYN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-seldryn',
    title: 'Haus Seldryn',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-seldryn', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_SELDRYN_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-seldryn').length, 1);

  const balchderStorage = createMemoryStorage();
  const previousBalchderRevision = normalizeFamily({
    ...HOUSE_BALCHDER_FAMILY,
    persons: HOUSE_BALCHDER_FAMILY.persons.map(person => (
      person.id === 'lugh-seldryn'
        ? {
            ...person,
            portrait: 'assets/images/portraits/haus-balchder/lugh-seldryn.jpg',
            title: '',
            notes: '',
            extensions: {}
          }
        : person
    )),
    partnerships: HOUSE_BALCHDER_FAMILY.partnerships.map(partnership => (
      partnership.id === 'marriage-bronwen-lugh'
        ? { ...partnership, status: 'active', extensions: {} }
        : partnership
    )),
    cadetBranches: HOUSE_BALCHDER_FAMILY.cadetBranches.map(branch => (
      branch.id === 'married-away-seldryn-bronwen'
        ? { ...branch, emblem: '', crestFrame: 'gold', notes: 'Alte Fassung', extensions: {} }
        : branch
    )),
    extensions: {
      ...HOUSE_BALCHDER_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousBalchderRevision,
    id: 'haus-balchder',
    title: 'Haus Balchder',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, balchderStorage);

  const upgradedBalchder = loadFamilyById('haus-balchder', balchderStorage);
  const upgradedLugh = upgradedBalchder.family.persons.find(person => person.id === 'lugh-seldryn');
  const upgradedMarriage = upgradedBalchder.family.partnerships.find(partnership => (
    partnership.id === 'marriage-bronwen-lugh'
  ));
  const upgradedBranch = upgradedBalchder.family.cadetBranches.find(branch => (
    branch.id === 'married-away-seldryn-bronwen'
  ));
  assert.equal(upgradedBalchder.source, 'registry-upgrade');
  assert.equal(upgradedBalchder.family.extensions.sourceRevision, 2);
  assert.equal(upgradedLugh.portrait, HOUSE_SELDRYN_PORTRAITS['lugh-seldryn']);
  assert.match(upgradedLugh.title, /Gründer.*Seldryn/);
  assert.equal(upgradedMarriage.status, 'ended');
  assert.equal(upgradedBranch.emblem, HOUSE_SELDRYN_FAMILY.document.emblem);
  assert.equal(upgradedBranch.crestFrame, 'silver');
});

test('bildet Haus Cysgodion mit einem seriellen Gründer-Zeitsprung und allen Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_CYSGODION_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 34);
  assert.equal(family.partnerships.length, 13);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-cadwalader-unknown-cysgodion');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['cadwalader-cysgodion', 'yorath-cysgodion']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['cefin-cysgodion', 'carys-cysgodion']
  );

  const expectedChildren = new Map([
    ['cadwalader-cysgodion', ['cerys-cysgodion', 'colwyn-cysgodion', 'cynfelyn-cysgodion']],
    ['cynfelyn-cysgodion', ['cadgwan-cysgodion', 'eirwen-cysgodion']],
    ['colwyn-cysgodion', ['cadogan-cysgodion', 'caradoc-cysgodion']],
    ['cadgwan-cysgodion', ['betrys-cysgodion', 'yorath-cysgodion']],
    ['caradoc-cysgodion', ['pryce-cysgodion']],
    ['cadogan-cysgodion', ['gronw-cysgodion', 'morgan-cysgodion']],
    ['yorath-cysgodion', ['carys-cysgodion', 'cefin-cysgodion']],
    ['pryce-cysgodion', ['folant-cysgodion', 'glendower-cysgodion']],
    ['gronw-cysgodion', ['crystin-cysgodion', 'cystennin-cysgodion']],
    ['morgan-cysgodion', ['morwen-cysgodion', 'myfanwy-cysgodion']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'cefin-cysgodion',
    'carys-cysgodion',
    'folant-cysgodion',
    'glendower-cysgodion',
    'cystennin-cysgodion',
    'crystin-cysgodion',
    'morwen-cysgodion',
    'myfanwy-cysgodion'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-unknown-cerys-cysgodion', 'marriage-cerys-unknown-cysgodion'],
    ['married-away-unknown-eirwen-cysgodion', 'marriage-eirwen-unknown-cysgodion'],
    ['married-away-unknown-betrys-cysgodion', 'marriage-betrys-unknown-cysgodion']
  ]);
  expectedBranches.forEach((partnershipId, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.targetFamilyId, 'haus-unbekannt');
    assert.equal(branch.crestFrame, 'gold');
  });

  assert.deepEqual(graph.getPartners('pryce-cysgodion').map(person => person.id), ['astrid-cysgodion']);
  assert.deepEqual(
    graph.getChildren('astrid-cysgodion').map(person => person.id).sort(),
    ['folant-cysgodion', 'glendower-cysgodion']
  );
  assert.equal(family.persons.some(person => person.name === 'Catrin'), false);
  assert.equal(graph.getPerson('yorath-cysgodion').birth, '1690');
  assert.match(family.extensions.sourceNote, /Geburtsjahr 1720.*1690/);
  assert.match(family.extensions.sourceNote, /Catrin.*Astrid/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-cadwalader-cynfelyn-cysgodion'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('cadwalader-cysgodion').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-cadwalader-cysgodion').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['cerys-cysgodion', 'colwyn-cysgodion', 'cynfelyn-cysgodion']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  [
    ['married-away-unknown-cerys-cysgodion', ['cerys-cysgodion', 'unknown-spouse-cerys-cysgodion']],
    ['married-away-unknown-eirwen-cysgodion', ['eirwen-cysgodion', 'unknown-spouse-eirwen-cysgodion']],
    ['married-away-unknown-betrys-cysgodion', ['betrys-cysgodion', 'unknown-spouse-betrys-cysgodion']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['cadwalader-cysgodion']);
  const pendingIds = ['cadwalader-cysgodion'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Cysgodion-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Cysgodion-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert alle 24 individuellen Cysgodion-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CYSGODION_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-cysgodion/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_CYSGODION_PORTRAITS).length, 24);
  assert.equal(Object.keys(sourceManifest).length, 24);
  assert.equal(picturedPeople.length, 24);
  assert.equal(placeholderPeople.length, 10);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_CYSGODION_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Cysgodion-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die Cysgodion-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-cysgodion',
    title: 'Haus Cysgodion',
    emblem: HOUSE_CYSGODION_FAMILY.document.emblem,
    houseProfile: HOUSE_CYSGODION_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-cysgodion',
    title: 'Haus Cysgodion',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-cysgodion', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_CYSGODION_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-cysgodion').length, 1);
});

test('bildet Haus Edmy mit einem seriellen Gründer-Zeitsprung und direkten Zielhausknoten ab', () => {
  const family = assertValidFamily(HOUSE_EDMY_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 35);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 22);
  assert.equal(family.cadetBranches.length, 6);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-edmwnd-unknown-edmy');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['edmwnd-edmy', 'conwy-edmy', 'caledfwlch-edmy']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['digain-edmy', 'gerallt-edmy', 'peredur-edmy']
  );

  const expectedChildren = new Map([
    ['edmwnd-edmy', ['bowen-edmy', 'conwy-edmy', 'mererid-edmy']],
    ['conwy-edmy', ['caledfwlch-edmy', 'catelyn-edmy']],
    ['bowen-edmy', ['arial-edmy', 'melangell-edmy']],
    ['caledfwlch-edmy', ['digain-edmy', 'edern-edmy', 'elfed-edmy']],
    ['arial-edmy', ['bran-edmy', 'brochwel-edmy', 'celyddon-edmy', 'derwen-edmy']],
    ['digain-edmy', ['gerallt-edmy', 'peredur-edmy']],
    ['edern-edmy', ['elenid-edmy', 'llinos-edmy']],
    ['bran-edmy', ['aedd-edmy', 'cedig-edmy', 'efanna-edmy', 'olwen-edmy']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'elfed-edmy',
    'brochwel-edmy',
    'celyddon-edmy',
    'derwen-edmy',
    'gerallt-edmy',
    'peredur-edmy',
    'elenid-edmy',
    'llinos-edmy',
    'cedig-edmy',
    'olwen-edmy',
    'aedd-edmy'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });
  assert.deepEqual(graph.getPartners('bran-edmy').map(person => person.id), ['unknown-spouse-bran-edmy']);
  assert.deepEqual(graph.getPartners('efanna-edmy').map(person => person.id), ['unknown-spouse-efanna-edmy']);

  const expectedBranches = new Map([
    ['married-away-unknown-mererid-edmy', ['marriage-mererid-unknown-edmy', 'haus-unbekannt', 'gold']],
    ['married-away-penwyn-catelyn-edmy', ['marriage-rhys-catelyn', 'haus-penwyn', 'silver']],
    ['married-away-cenfig-melangell-edmy', ['marriage-melangell-lleward', 'haus-cenfig', 'silver']],
    ['married-away-unknown-efanna-edmy', ['marriage-efanna-unknown-edmy', 'haus-unbekannt', 'gold']]
  ]);
  expectedBranches.forEach(([partnershipId, targetFamilyId, crestFrame], branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.targetFamilyId, targetFamilyId);
    assert.equal(branch.crestFrame, crestFrame);
  });

  const expectedWards = new Map([
    ['ward-away-peredur-penwyn', 'peredur-edmy'],
    ['ward-away-llinos-penwyn', 'llinos-edmy']
  ]);
  expectedWards.forEach((personId, branchId) => {
    const person = graph.getPerson(personId);
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.equal(person.familyRole, 'ward-away');
    assert.ok(person.tags.includes('Fortgegebenes Mündel'));
    assert.equal(branch.linkType, 'ward-away');
    assert.equal(branch.parentPartnershipId, '');
    assert.equal(branch.parentPersonId, personId);
    assert.equal(branch.targetFamilyId, 'haus-penwyn');
    assert.equal(branch.crestFrame, 'silver');
    assert.deepEqual(branchNode.rels.parents, [personId]);
    assert.ok(converted.data.find(node => node.id === personId).rels.children.includes(branchNode.id));
    assert.equal(converted.getParentageLine(branchNode.id).type, 'ward-away');
  });
  assert.match(graph.getPerson('peredur-edmy').title, /Mündel und Knappe bei Haus Penwyn/);
  assert.match(graph.getPerson('llinos-edmy').title, /Mündel bei Haus Penwyn/);

  const penwynGraph = createFamilyGraph(assertValidFamily(HOUSE_PENWYN_FAMILY).family);
  ['catelyn-edmy', 'rhys-penwyn'].forEach(personId => {
    const here = graph.getPerson(personId);
    const there = penwynGraph.getPerson(personId);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} bleibt hausübergreifend dieselbe Weltperson.`);
    assert.equal(here.portrait, there.portrait, `${personId} verwendet hausübergreifend dasselbe Portrait.`);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-rhys-catelyn'),
    HOUSE_PENWYN_FAMILY.partnerships.find(partnership => partnership.id === 'marriage-rhys-catelyn')
  );
  assert.deepEqual(graph.getChildren('catelyn-edmy'), []);
  assert.deepEqual(
    penwynGraph.getChildren('catelyn-edmy').map(person => person.id).sort(),
    ['cadfael-penwyn', 'maelor-penwyn', 'rhoswyn-penwyn']
  );

  assert.equal(graph.getPerson('caledfwlch-edmy').birth, '1662');
  assert.equal(graph.getPerson('brochwel-edmy').status, 'missing');
  assert.equal(graph.getPerson('celyddon-edmy').status, 'missing');
  assert.equal(graph.getPerson('derwen-edmy').status, 'missing');
  assert.match(family.extensions.sourceNote, /Brochwel, Celyddon, Derwen und Aedd.*ohne erfundene Ehe/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-edmwnd-conwy-edmy'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('edmwnd-edmy').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-edmwnd-edmy').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['bowen-edmy', 'conwy-edmy', 'mererid-edmy']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  [
    ['married-away-unknown-mererid-edmy', ['mererid-edmy', 'unknown-spouse-mererid-edmy']],
    ['married-away-penwyn-catelyn-edmy', ['catelyn-edmy', 'rhys-penwyn']],
    ['married-away-cenfig-melangell-edmy', ['lleward-cenfig', 'melangell-edmy']],
    ['married-away-unknown-efanna-edmy', ['efanna-edmy', 'unknown-spouse-efanna-edmy']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['edmwnd-edmy']);
  const pendingIds = ['edmwnd-edmy'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Edmy-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Edmy-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert alle 24 individuellen Edmy-Portraits lokal oder aus der Penwyn-Gegenakte aus', async () => {
  const family = assertValidFamily(HOUSE_EDMY_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-edmy/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_EDMY_PORTRAITS).length, 24);
  assert.equal(Object.keys(sourceManifest).length, 24);
  assert.equal(picturedPeople.length, 24);
  assert.equal(placeholderPeople.length, 11);
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_EDMY_PORTRAITS['catelyn-edmy'], HOUSE_PENWYN_PORTRAITS['catelyn-edmy']);
  assert.equal(HOUSE_EDMY_PORTRAITS['rhys-penwyn'], HOUSE_PENWYN_PORTRAITS['rhys-penwyn']);

  await Promise.all(Object.entries(HOUSE_EDMY_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Edmy-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  }));
});

test('ersetzt die Edmy-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-edmy',
    title: 'Haus Edmy',
    emblem: HOUSE_EDMY_FAMILY.document.emblem,
    houseProfile: HOUSE_EDMY_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-edmy',
    title: 'Haus Edmy',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-edmy', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_EDMY_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-edmy').length, 1);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-cenfig').length, 1);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-penwyn').length, 1);
});

test('bildet Haus Barus mit einem seriellen Gründer-Zeitsprung und drei direkten Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_BARUS_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 20);
  assert.equal(family.partnerships.length, 8);
  assert.equal(family.parentages.length, 11);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-martyn-unknown-barus');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, '');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['martyn-barus', 'macsen-barus']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['wyett-barus']
  );
  assert.equal(graph.getPerson('macsen-barus').status, 'alive');
  assert.match(family.extensions.sourceNote, /Kreuz bei Macsen.*Gegenwartsbeschreibung/);

  const expectedChildren = new Map([
    ['martyn-barus', ['arianwen-barus', 'macsen-barus', 'madoc-barus']],
    ['macsen-barus', ['isolde-barus', 'wyett-barus']],
    ['madoc-barus', ['llawen-barus', 'mabon-barus']],
    ['wyett-barus', ['haulwen-barus', 'ystwyth-barus']],
    ['mabon-barus', ['lloyd-barus', 'math-barus']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });
  assert.deepEqual(graph.getChildren('arianwen-barus'), []);
  assert.deepEqual(graph.getChildren('isolde-barus'), []);
  assert.deepEqual(graph.getChildren('llawen-barus'), []);

  ['haulwen-barus', 'ystwyth-barus', 'math-barus', 'lloyd-barus'].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-unknown-arianwen-barus', 'marriage-arianwen-unknown-barus'],
    ['married-away-unknown-isolde-barus', 'marriage-isolde-unknown-barus'],
    ['married-away-unknown-llawen-barus', 'marriage-llawen-unknown-barus']
  ]);
  expectedBranches.forEach((partnershipId, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.parentPersonId, '');
    assert.equal(branch.targetFamilyId, 'haus-unbekannt');
    assert.equal(branch.crestFrame, 'gold');
  });

  const balchder = assertValidFamily(HOUSE_BALCHDER_FAMILY).family;
  const balchderGraph = createFamilyGraph(balchder);
  ['cerrin-balchder', 'wyett-barus'].forEach(personId => {
    const here = graph.getPerson(personId);
    const there = balchderGraph.getPerson(personId);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} bleibt hausübergreifend dieselbe Weltperson.`);
    assert.equal(here.portrait, there.portrait, `${personId} verwendet hausübergreifend dasselbe Portrait.`);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-cerrin-wyett'),
    balchder.partnerships.find(partnership => partnership.id === 'marriage-cerrin-wyett')
  );
  assert.deepEqual(balchderGraph.getChildren('wyett-barus'), []);
  assert.deepEqual(
    graph.getChildren('wyett-barus').map(person => person.id).sort(),
    ['haulwen-barus', 'ystwyth-barus']
  );
  assert.ok(!family.cadetBranches.some(branch => branch.targetFamilyId === 'haus-balchder'));

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-martyn-macsen-barus'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('martyn-barus').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-martyn-barus').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['arianwen-barus', 'macsen-barus', 'madoc-barus']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  expectedBranches.forEach((partnershipId, branchId) => {
    const partnership = family.partnerships.find(entry => entry.id === partnershipId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['martyn-barus']);
  const pendingIds = ['martyn-barus'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Barus-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Barus-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert zehn neue und zwei kanonisch wiederverwendete Barus-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_BARUS_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-barus/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_BARUS_PORTRAITS).length, 12);
  assert.equal(Object.keys(sourceManifest).length, 12);
  assert.equal(picturedPeople.length, 12);
  assert.equal(placeholderPeople.length, 8);
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => (
    person.id === 'arianwen-barus' || person.id.startsWith('unknown-spouse-')
  )));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_BARUS_PORTRAITS['cerrin-balchder'], HOUSE_BALCHDER_PORTRAITS['cerrin-balchder']);
  assert.equal(HOUSE_BARUS_PORTRAITS['wyett-barus'], HOUSE_BALCHDER_PORTRAITS['wyett-barus']);

  await Promise.all(Object.entries(HOUSE_BARUS_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Barus-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Barus-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-barus',
    title: 'Haus Barus',
    emblem: HOUSE_BARUS_FAMILY.document.emblem,
    houseProfile: HOUSE_BARUS_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-barus',
    title: 'Haus Barus',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-barus', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_BARUS_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-barus').length, 1);
});

test('bildet Haus Cenfig mit einem seriellen Gründer-Zeitsprung und fünf direkten Wegverheiratungen ab', () => {
  const family = assertValidFamily(HOUSE_CENFIG_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 31);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 18);
  assert.equal(family.cadetBranches.length, 5);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-steffan-unknown-cenfig');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, '');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['steffan-cenfig', 'rhodri-cenfig', 'mathon-cenfig']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['folant-cenfig']
  );

  const expectedChildren = new Map([
    ['steffan-cenfig', ['osian-cenfig', 'rhodri-cenfig', 'siwan-cenfig']],
    ['rhodri-cenfig', ['hiraeth-cenfig', 'mathon-cenfig']],
    ['osian-cenfig', ['llawen-cenfig', 'lleward-cenfig']],
    ['mathon-cenfig', ['folant-cenfig', 'nela-cenfig']],
    ['lleward-cenfig', ['awela-cenfig', 'llowarch-cenfig']],
    ['folant-cenfig', ['rhosyn-cenfig', 'seren-cenfig']],
    ['llowarch-cenfig', ['caer-cenfig', 'eynion-cenfig', 'moronwy-cenfig', 'nyfrain-cenfig', 'padrig-cenfig']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'rhosyn-cenfig',
    'seren-cenfig',
    'padrig-cenfig',
    'caer-cenfig',
    'nyfrain-cenfig',
    'moronwy-cenfig',
    'eynion-cenfig'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });
  assert.equal(graph.getPerson('caer-cenfig').sex, 'male');
  assert.equal(graph.getPerson('nyfrain-cenfig').sex, 'female');
  assert.equal(graph.getPerson('moronwy-cenfig').sex, 'female');

  const expectedBranches = new Map([
    ['married-away-unknown-siwan-cenfig', 'marriage-siwan-unknown-cenfig'],
    ['married-away-unknown-hiraeth-cenfig', 'marriage-hiraeth-unknown-cenfig'],
    ['married-away-unknown-llawen-cenfig', 'marriage-llawen-unknown-cenfig'],
    ['married-away-unknown-nela-cenfig', 'marriage-nela-unknown-cenfig'],
    ['married-away-unknown-awela-cenfig', 'marriage-awela-unknown-cenfig']
  ]);
  expectedBranches.forEach((partnershipId, branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.parentPersonId, '');
    assert.equal(branch.targetFamilyId, 'haus-unbekannt');
    assert.equal(branch.crestFrame, 'gold');
  });

  const edmy = assertValidFamily(HOUSE_EDMY_FAMILY).family;
  const edmyGraph = createFamilyGraph(edmy);
  ['melangell-edmy', 'lleward-cenfig'].forEach(personId => {
    const here = graph.getPerson(personId);
    const there = edmyGraph.getPerson(personId);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} bleibt hausübergreifend dieselbe Weltperson.`);
    assert.equal(here.portrait, there.portrait, `${personId} verwendet hausübergreifend dasselbe Portrait.`);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-melangell-lleward'),
    edmy.partnerships.find(partnership => partnership.id === 'marriage-melangell-lleward')
  );
  assert.deepEqual(edmyGraph.getChildren('lleward-cenfig'), []);
  assert.deepEqual(
    graph.getChildren('lleward-cenfig').map(person => person.id).sort(),
    ['awela-cenfig', 'llowarch-cenfig']
  );

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-steffan-rhodri-cenfig'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('steffan-cenfig').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-steffan-cenfig').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['osian-cenfig', 'rhodri-cenfig', 'siwan-cenfig']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  expectedBranches.forEach((partnershipId, branchId) => {
    const partnership = family.partnerships.find(entry => entry.id === partnershipId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['steffan-cenfig']);
  const pendingIds = ['steffan-cenfig'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Cenfig-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Cenfig-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 17 neue und zwei kanonisch wiederverwendete Cenfig-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CENFIG_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-cenfig/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_CENFIG_PORTRAITS).length, 19);
  assert.equal(Object.keys(sourceManifest).length, 19);
  assert.equal(picturedPeople.length, 19);
  assert.equal(placeholderPeople.length, 12);
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => (
    person.id === 'siwan-cenfig' || person.id.startsWith('unknown-spouse-')
  )));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_CENFIG_PORTRAITS['melangell-edmy'], HOUSE_EDMY_PORTRAITS['melangell-edmy']);
  assert.equal(HOUSE_CENFIG_PORTRAITS['lleward-cenfig'], HOUSE_EDMY_PORTRAITS['lleward-cenfig']);

  await Promise.all(Object.entries(HOUSE_CENFIG_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Cenfig-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    if (portrait.endsWith('.png')) {
      assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
    } else {
      assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    }
  }));
});

test('ersetzt die Cenfig-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-cenfig',
    title: 'Haus Cenfig',
    emblem: HOUSE_CENFIG_FAMILY.document.emblem,
    houseProfile: HOUSE_CENFIG_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-cenfig',
    title: 'Haus Cenfig',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-cenfig', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_CENFIG_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-cenfig').length, 1);
});

test('bildet das Bürgerhaus Caerlaen mit einem seriellen Gründer-Zeitsprung und direkten Zielhausknoten ab', () => {
  const family = assertValidFamily(HOUSE_CAERLAEN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 28);
  assert.equal(family.partnerships.length, 12);
  assert.equal(family.parentages.length, 15);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-morien-izolda-caerlaen');
  assert.equal(family.lineage.crestFrame, 'iron');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, 'Schrift bewahrt, wissen lenkt.');
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['morien-caerlaen', 'carwyn-caerlaen', 'gwendal-caerlaen', 'tudor-caerlaen']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['merlyn-caerlaen', 'urian-caerlaen']
  );

  const expectedChildren = new Map([
    ['morien-caerlaen', ['carwyn-caerlaen', 'trayvon-caerlaen']],
    ['carwyn-caerlaen', ['gwendal-caerlaen']],
    ['trayvon-caerlaen', ['arawn-caerlaen']],
    ['gwendal-caerlaen', ['iseult-caerlaen', 'tudor-caerlaen']],
    ['arawn-caerlaen', ['enian-caerlaen']],
    ['tudor-caerlaen', ['meilyr-caerlaen', 'merlyn-caerlaen', 'miraeth-caerlaen']],
    ['enian-caerlaen', ['dillion-caerlaen']],
    ['merlyn-caerlaen', ['urian-caerlaen', 'ysee-caerlaen']],
    ['dillion-caerlaen', ['jenyi-caerlaen', 'yale-caerlaen']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      `${personId} muss die in der Quelle zugeordneten Kinder besitzen.`
    );
  });

  ['ysee-caerlaen', 'urian-caerlaen', 'yale-caerlaen', 'jenyi-caerlaen'].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      `${personId} bleibt ohne erfundene Ehe oder Verlobung.`
    );
  });

  const morien = graph.getPerson('morien-caerlaen');
  assert.equal(morien.familyRole, 'core');
  assert.ok(!morien.tags.includes('Fortgegebenes Mündel'));
  assert.ok(!family.cadetBranches.some(branch => branch.parentPersonId === 'morien-caerlaen'));

  const iseultBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-balchder-iseult-caerlaen'
  ));
  assert.equal(iseultBranch.linkType, 'married-away');
  assert.equal(iseultBranch.parentPartnershipId, 'marriage-dalvin-iseult');
  assert.equal(iseultBranch.targetFamilyId, 'haus-balchder');
  assert.equal(iseultBranch.crestFrame, 'silver');

  const miraethBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-rhuddgar-miraeth-caerlaen'
  ));
  assert.equal(miraethBranch.linkType, 'married-away');
  assert.equal(miraethBranch.parentPartnershipId, 'marriage-caderyn-miraeth');
  assert.equal(miraethBranch.targetFamilyId, 'haus-rhuddgar');
  assert.equal(miraethBranch.crestFrame, 'silver');
  assert.ok(!family.cadetBranches.some(branch => branch.targetFamilyId === 'haus-caerthwyn'));

  const balchder = assertValidFamily(HOUSE_BALCHDER_FAMILY).family;
  const balchderGraph = createFamilyGraph(balchder);
  ['dalvin-balchder', 'iseult-caerlaen'].forEach(personId => {
    assert.equal(graph.getPerson(personId).worldPersonId, balchderGraph.getPerson(personId).worldPersonId);
    assert.equal(graph.getPerson(personId).portrait, balchderGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-dalvin-iseult'),
    balchder.partnerships.find(partnership => partnership.id === 'marriage-dalvin-iseult')
  );
  assert.deepEqual(graph.getChildren('iseult-caerlaen'), []);
  assert.deepEqual(
    balchderGraph.getChildren('iseult-caerlaen').map(person => person.id).sort(),
    ['aerona-balchder', 'avan-balchder', 'cerrin-balchder', 'kamber-balchder']
  );

  const rhuddgar = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const rhuddgarGraph = createFamilyGraph(rhuddgar);
  ['caderyn-rhuddgar', 'miraeth-caerlaen'].forEach(personId => {
    assert.equal(graph.getPerson(personId).worldPersonId, rhuddgarGraph.getPerson(personId).worldPersonId);
    assert.equal(graph.getPerson(personId).portrait, rhuddgarGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-caderyn-miraeth'),
    rhuddgar.partnerships.find(partnership => partnership.id === 'marriage-caderyn-miraeth')
  );
  assert.deepEqual(graph.getChildren('miraeth-caerlaen'), []);
  assert.deepEqual(
    rhuddgarGraph.getChildren('miraeth-caerlaen').map(person => person.id).sort(),
    ['brenn-rhuddgar', 'talwyn-rhuddgar', 'teyna-rhuddgar']
  );

  const caerthwyn = assertValidFamily(HOUSE_CAERTHWYN_FAMILY).family;
  const caerthwynGraph = createFamilyGraph(caerthwyn);
  ['ywen-caerthwyn', 'meilyr-caerlaen'].forEach(personId => {
    assert.equal(graph.getPerson(personId).worldPersonId, caerthwynGraph.getPerson(personId).worldPersonId);
    assert.equal(graph.getPerson(personId).portrait, caerthwynGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'engagement-ywen-meilyr'),
    caerthwyn.partnerships.find(partnership => partnership.id === 'engagement-ywen-meilyr')
  );
  assert.equal(
    family.partnerships.find(partnership => partnership.id === 'engagement-ywen-meilyr').type,
    'engagement'
  );

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-morien-carwyn-caerlaen'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('morien-caerlaen').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('izolda-caerlaen').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), ['carwyn-caerlaen', 'trayvon-caerlaen']);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  [iseultBranch, miraethBranch].forEach(branch => {
    const partnership = family.partnerships.find(entry => entry.id === branch.parentPartnershipId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branch.id);
    assert.deepEqual([...branchNode.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['morien-caerlaen']);
  const pendingIds = ['morien-caerlaen'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Caerlaen-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Caerlaen-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 13 neue und sechs kanonisch wiederverwendete Caerlaen-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CAERLAEN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-caerlaen/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_CAERLAEN_PORTRAITS).length, 19);
  assert.equal(Object.keys(sourceManifest).length, 19);
  assert.equal(picturedPeople.length, 19);
  assert.equal(placeholderPeople.length, 9);
  assert.deepEqual(
    placeholderPeople.map(person => person.id).sort(),
    [
      'arawn-caerlaen',
      'carwyn-caerlaen',
      'gwendal-caerlaen',
      'izolda-caerlaen',
      'lunet',
      'morien-caerlaen',
      'raewyn',
      'saoirse',
      'tegin'
    ]
  );
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['dalvin-balchder'], HOUSE_BALCHDER_PORTRAITS['dalvin-balchder']);
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['iseult-caerlaen'], HOUSE_BALCHDER_PORTRAITS['iseult-caerlaen']);
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['caderyn-rhuddgar'], HOUSE_RHUDDGAR_PORTRAITS['caderyn-rhuddgar']);
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['miraeth-caerlaen'], HOUSE_RHUDDGAR_PORTRAITS['miraeth-caerlaen']);
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['ywen-caerthwyn'], HOUSE_CAERTHWYN_PORTRAITS['ywen-caerthwyn']);
  assert.equal(HOUSE_CAERLAEN_PORTRAITS['meilyr-caerlaen'], HOUSE_CAERTHWYN_PORTRAITS['meilyr-caerlaen']);

  await Promise.all(Object.entries(HOUSE_CAERLAEN_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Caerlaen-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Caerlaen-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-caerlaen',
    title: 'Haus Caerlaen',
    emblem: HOUSE_CAERLAEN_FAMILY.document.emblem,
    houseProfile: HOUSE_CAERLAEN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-caerlaen',
    title: 'Haus Caerlaen',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-caerlaen', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_CAERLAEN_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-caerlaen').length, 1);
});

test('bildet das Bürgerhaus Caerthwyn mit einem seriellen Gründer-Zeitsprung und direkten Zielhausknoten ab', () => {
  const family = assertValidFamily(HOUSE_CAERTHWYN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 30);
  assert.equal(family.partnerships.length, 10);
  assert.equal(family.parentages.length, 19);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-sadwyn-mervynne-caerthwyn');
  assert.equal(family.lineage.crestFrame, 'iron');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, 'Beständig im Wandel.');
  assert.equal(family.document.houseProfile.rankId, 'commoner');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['sadwyn-caerthwyn', 'bowen-caerthwyn']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['adeon-caerthwyn', 'sion-caerthwyn', 'gwil-caerthwyn']
  );

  const expectedChildren = new Map([
    ['sadwyn-caerthwyn', ['bowen-caerthwyn', 'sath-caerthwyn']],
    ['bowen-caerthwyn', ['adeon-caerthwyn', 'elowen-caerthwyn', 'emyrs-caerthwyn', 'micah-caerthwyn', 'ywen-caerthwyn']],
    ['sath-caerthwyn', ['ffion-caerthwyn', 'reece-caerthwyn']],
    ['adeon-caerthwyn', ['gwil-caerthwyn', 'sion-caerthwyn', 'talaith-caerthwyn']],
    ['micah-caerthwyn', ['glaw-caerthwyn', 'huw-caerthwyn']],
    ['emyrs-caerthwyn', ['llinos-caerthwyn', 'rhun-caerthwyn']],
    ['reece-caerthwyn', ['ioan-caerthwyn', 'jowna-caerthwyn']],
    ['ffion-caerthwyn', ['larna-caerthwyn']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      `${personId} muss die in der Quelle zugeordneten Kinder besitzen.`
    );
  });

  [
    'sion-caerthwyn',
    'talaith-caerthwyn',
    'gwil-caerthwyn',
    'glaw-caerthwyn',
    'huw-caerthwyn',
    'rhun-caerthwyn',
    'llinos-caerthwyn',
    'ioan-caerthwyn',
    'jowna-caerthwyn',
    'larna-caerthwyn'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      `${personId} bleibt ohne erfundene Ehe oder Verlobung.`
    );
  });

  const sadwyn = graph.getPerson('sadwyn-caerthwyn');
  assert.equal(sadwyn.familyRole, 'core');
  assert.ok(!sadwyn.tags.includes('Fortgegebenes Mündel'));
  assert.ok(!family.cadetBranches.some(branch => branch.parentPersonId === 'sadwyn-caerthwyn'));
  assert.ok(!family.cadetBranches.some(branch => branch.targetFamilyId === 'haus-gwyvern'));

  const elowenBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-taranvyr-elowen-caerthwyn'
  ));
  assert.equal(elowenBranch.linkType, 'married-away');
  assert.equal(elowenBranch.parentPartnershipId, 'marriage-rhon-elowen');
  assert.equal(elowenBranch.targetFamilyId, 'haus-taranvyr');
  assert.equal(elowenBranch.crestFrame, 'silver');

  const ywenBranch = family.cadetBranches.find(branch => (
    branch.id === 'engaged-away-caerlaen-ywen-caerthwyn'
  ));
  assert.equal(ywenBranch.linkType, 'married-away');
  assert.equal(ywenBranch.parentPartnershipId, 'engagement-ywen-meilyr');
  assert.equal(ywenBranch.targetFamilyId, 'haus-caerlaen');
  assert.equal(ywenBranch.subtitle, 'Wegverlobte Linie');
  assert.equal(
    family.partnerships.find(partnership => partnership.id === 'engagement-ywen-meilyr').type,
    'engagement'
  );
  assert.ok(!family.cadetBranches.some(branch => branch.targetFamilyId === 'haus-rhuddgar'));

  const taranvyr = assertValidFamily(HOUSE_TARANVYR_FAMILY).family;
  const taranvyrGraph = createFamilyGraph(taranvyr);
  ['rhon-taranvyr', 'elowen-caerthwyn'].forEach(personId => {
    assert.equal(graph.getPerson(personId).worldPersonId, taranvyrGraph.getPerson(personId).worldPersonId);
    assert.equal(graph.getPerson(personId).portrait, taranvyrGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-rhon-elowen'),
    taranvyr.partnerships.find(partnership => partnership.id === 'marriage-rhon-elowen')
  );
  assert.deepEqual(graph.getChildren('elowen-caerthwyn'), []);
  assert.deepEqual(taranvyrGraph.getChildren('elowen-caerthwyn').map(person => person.id), ['caelan-taranvyr']);

  const rhuddgar = assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family;
  const rhuddgarGraph = createFamilyGraph(rhuddgar);
  ['serenna-rhuddgar', 'emyrs-caerthwyn'].forEach(personId => {
    assert.equal(graph.getPerson(personId).worldPersonId, rhuddgarGraph.getPerson(personId).worldPersonId);
    assert.equal(graph.getPerson(personId).portrait, rhuddgarGraph.getPerson(personId).portrait);
  });
  assert.deepEqual(
    family.partnerships.find(partnership => partnership.id === 'marriage-serenna-emyrs'),
    rhuddgar.partnerships.find(partnership => partnership.id === 'marriage-serenna-emyrs')
  );
  assert.deepEqual(rhuddgarGraph.getChildren('emyrs-caerthwyn'), []);
  assert.deepEqual(
    graph.getChildren('emyrs-caerthwyn').map(person => person.id).sort(),
    ['llinos-caerthwyn', 'rhun-caerthwyn']
  );

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-sadwyn-bowen-caerthwyn'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('sadwyn-caerthwyn').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('mervynne-spouse-caerthwyn').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual([...timeJump.rels.children].sort(), ['bowen-caerthwyn', 'sath-caerthwyn']);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  [elowenBranch, ywenBranch].forEach(branch => {
    const partnership = family.partnerships.find(entry => entry.id === branch.parentPartnershipId);
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branch.id);
    assert.deepEqual([...branchNode.rels.parents].sort(), [...partnership.participantIds].sort());
  });

  const connectedIds = new Set(['sadwyn-caerthwyn']);
  const pendingIds = ['sadwyn-caerthwyn'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Caerthwyn-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Caerthwyn-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 24 neue und vier kanonisch wiederverwendete Caerthwyn-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_CAERTHWYN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-caerthwyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_CAERTHWYN_PORTRAITS).length, 28);
  assert.equal(Object.keys(sourceManifest).length, 28);
  assert.equal(picturedPeople.length, 28);
  assert.equal(placeholderPeople.length, 2);
  assert.deepEqual(
    placeholderPeople.map(person => person.id).sort(),
    ['mervynne-spouse-caerthwyn', 'sadwyn-caerthwyn']
  );
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_CAERTHWYN_PORTRAITS['rhon-taranvyr'], HOUSE_TARANVYR_PORTRAITS['rhon-taranvyr']);
  assert.equal(HOUSE_CAERTHWYN_PORTRAITS['elowen-caerthwyn'], HOUSE_TARANVYR_PORTRAITS['elowen-caerthwyn']);
  assert.equal(HOUSE_CAERTHWYN_PORTRAITS['serenna-rhuddgar'], HOUSE_RHUDDGAR_PORTRAITS['serenna-rhuddgar']);
  assert.equal(HOUSE_CAERTHWYN_PORTRAITS['emyrs-caerthwyn'], HOUSE_RHUDDGAR_PORTRAITS['emyrs-caerthwyn']);

  await Promise.all(Object.entries(HOUSE_CAERTHWYN_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Caerthwyn-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Caerthwyn-Leerakte im Familienregister ohne eine Doppelakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-caerthwyn',
    title: 'Haus Caerthwyn',
    emblem: HOUSE_CAERTHWYN_FAMILY.document.emblem,
    houseProfile: HOUSE_CAERTHWYN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-caerthwyn',
    title: 'Haus Caerthwyn',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-caerthwyn', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_CAERTHWYN_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-caerthwyn').length, 1);
});

test('bildet Haus Tawelgar mit serieller Gründerlücke und drei direkten Fremdhausknoten ab', () => {
  const family = assertValidFamily(HOUSE_TAWELGAR_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 34);
  assert.equal(family.partnerships.length, 13);
  assert.equal(family.parentages.length, 20);
  assert.equal(family.cadetBranches.length, 3);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-brinthan-gwenllian-tawelgar');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, 'Von Pflicht getragen.');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['brinthan-tawelgar', 'maredudd-tawelgar', 'harri-tawelgar']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['marwin-tawelgar', 'brizio-tawelgar']
  );

  const expectedChildren = new Map([
    ['brinthan-tawelgar', ['karris-tawelgar', 'maredudd-tawelgar', 'merriam-tawelgar']],
    ['maredudd-tawelgar', ['aneirin-tawelgar', 'harri-tawelgar']],
    ['karris-tawelgar', ['gais-tawelgar', 'gwendolen-tawelgar']],
    ['harri-tawelgar', ['bhreac-tawelgar', 'marwin-tawelgar']],
    ['aneirin-tawelgar', ['cariad-tawelgar', 'emlyn-tawelgar']],
    ['gais-tawelgar', ['lincoln-tawelgar']],
    ['marwin-tawelgar', ['brizio-tawelgar', 'owena-tawelgar']],
    ['bhreac-tawelgar', ['rhys-tawelgar', 'slavi-tawelgar']],
    ['cariad-tawelgar', ['jenya-tawelgar', 'wyn-tawelgar']],
    ['lincoln-tawelgar', ['bobi-tawelgar', 'zabrina-tawelgar']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in der Quelle zugeordneten Kinder besitzen.'
    );
  });

  [
    'brizio-tawelgar',
    'owena-tawelgar',
    'rhys-tawelgar',
    'slavi-tawelgar',
    'jenya-tawelgar',
    'wyn-tawelgar',
    'bobi-tawelgar',
    'zabrina-tawelgar'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const expectedBranches = new Map([
    ['married-away-rhuddgar-merriam', ['marriage-wyndham-merriam', 'haus-rhuddgar']],
    ['married-away-seldryn-gwendolen', ['marriage-gwendolen-gwynham', 'haus-seldryn']],
    ['married-away-chwedlonol-emlyn', ['marriage-romneyjr-emlyn', 'haus-chwedlonol']]
  ]);
  expectedBranches.forEach(([partnershipId, targetFamilyId], branchId) => {
    const branch = family.cadetBranches.find(entry => entry.id === branchId);
    assert.equal(branch.linkType, 'married-away');
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.targetFamilyId, targetFamilyId);
    assert.equal(branch.crestFrame, 'silver');
  });

  const taranvyrGraph = createFamilyGraph(assertValidFamily(HOUSE_TARANVYR_FAMILY).family);
  const rhuddgarGraph = createFamilyGraph(assertValidFamily(HOUSE_RHUDDGAR_FAMILY).family);
  const chwedlonolGraph = createFamilyGraph(assertValidFamily(HOUSE_CHWEDLONOL_FAMILY).family);
  [
    ['maredudd-tawelgar', taranvyrGraph],
    ['kerrilyn-taranvyr', taranvyrGraph],
    ['merriam-tawelgar', rhuddgarGraph],
    ['wyndham-rhuddgar', rhuddgarGraph],
    ['emlyn-tawelgar', chwedlonolGraph],
    ['romney-1704-chwedlonol', chwedlonolGraph]
  ].forEach(([personId, counterpartGraph]) => {
    const here = graph.getPerson(personId);
    const there = counterpartGraph.getPerson(personId);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} bleibt hausübergreifend dieselbe Weltperson.`);
    assert.equal(here.portrait, there.portrait, `${personId} verwendet hausübergreifend dasselbe Portrait.`);
  });
  [
    ['marriage-kerrilyn-maredudd', HOUSE_TARANVYR_FAMILY],
    ['marriage-wyndham-merriam', HOUSE_RHUDDGAR_FAMILY],
    ['marriage-romneyjr-emlyn', HOUSE_CHWEDLONOL_FAMILY]
  ].forEach(([partnershipId, counterpartFamily]) => {
    assert.deepEqual(
      family.partnerships.find(partnership => partnership.id === partnershipId),
      counterpartFamily.partnerships.find(partnership => partnership.id === partnershipId)
    );
  });
  assert.deepEqual(graph.getChildren('merriam-tawelgar'), []);
  assert.deepEqual(
    rhuddgarGraph.getChildren('merriam-tawelgar').map(person => person.id).sort(),
    ['cadwallon-rhuddgar', 'meuric-rhuddgar']
  );
  assert.deepEqual(graph.getChildren('emlyn-tawelgar'), []);
  assert.deepEqual(
    chwedlonolGraph.getChildren('emlyn-tawelgar').map(person => person.id).sort(),
    ['kyndra-chwedlonol', 'rhondia-chwedlonol']
  );
  assert.equal(chwedlonolGraph.getPerson('emlyn-tawelgar').birth, '1707');
  assert.equal(graph.getPerson('harri-tawelgar').birth, '1674');
  assert.equal(family.persons.some(person => person.name === 'Artur Tawelgar'), false);
  assert.match(family.extensions.sourceNote, /Artur.*Brinthan/);
  assert.match(family.extensions.sourceNote, /Harri.*1720.*1674/);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-brinthan-maredudd-tawelgar'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('brinthan-tawelgar').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('gwenllian-tawelgar').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['karris-tawelgar', 'maredudd-tawelgar', 'merriam-tawelgar']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  [
    ['married-away-rhuddgar-merriam', ['merriam-tawelgar', 'wyndham-rhuddgar']],
    ['married-away-seldryn-gwendolen', ['gwendolen-tawelgar', 'gwynham-seldryn']],
    ['married-away-chwedlonol-emlyn', ['emlyn-tawelgar', 'romney-1704-chwedlonol']]
  ].forEach(([branchId, parentIds]) => {
    const branchNode = converted.data.find(node => node.data.aleria.cadetBranchId === branchId);
    assert.deepEqual([...branchNode.rels.parents].sort(), parentIds);
  });

  const connectedIds = new Set(['brinthan-tawelgar']);
  const pendingIds = ['brinthan-tawelgar'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Tawelgar-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Tawelgar-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert 24 neue und fünf kanonisch wiederverwendete Tawelgar-Portraits lokal aus', async () => {
  const family = assertValidFamily(HOUSE_TAWELGAR_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-tawelgar/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_TAWELGAR_PORTRAITS).length, 29);
  assert.equal(Object.keys(sourceManifest).length, 29);
  assert.equal(picturedPeople.length, 29);
  assert.equal(placeholderPeople.length, 5);
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_TAWELGAR_PORTRAITS['maredudd-tawelgar'], HOUSE_TARANVYR_PORTRAITS['maredudd-tawelgar']);
  assert.equal(HOUSE_TAWELGAR_PORTRAITS['kerrilyn-taranvyr'], HOUSE_TARANVYR_PORTRAITS['kerrilyn-taranvyr']);
  assert.equal(HOUSE_TAWELGAR_PORTRAITS['wyndham-rhuddgar'], HOUSE_RHUDDGAR_PORTRAITS['wyndham-rhuddgar']);
  assert.equal(HOUSE_TAWELGAR_PORTRAITS['emlyn-tawelgar'], HOUSE_CHWEDLONOL_PORTRAITS['emlyn-tawelgar']);
  assert.equal(HOUSE_TAWELGAR_PORTRAITS['romney-1704-chwedlonol'], HOUSE_CHWEDLONOL_PORTRAITS['romney-1704-chwedlonol']);

  await Promise.all(Object.entries(HOUSE_TAWELGAR_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Tawelgar-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Tawelgar-Leerakte und migriert Emlyns Chwedonol-Gegenakte ohne Duplikate', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-tawelgar',
    title: 'Haus Tawelgar',
    emblem: HOUSE_TAWELGAR_FAMILY.document.emblem,
    houseProfile: HOUSE_TAWELGAR_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-tawelgar',
    title: 'Haus Tawelgar',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-tawelgar', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_TAWELGAR_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-tawelgar').length, 1);

  const chwedlonolStorage = createMemoryStorage();
  const previousChwedlonolRevision = normalizeFamily({
    ...HOUSE_CHWEDLONOL_FAMILY,
    houses: HOUSE_CHWEDLONOL_FAMILY.houses.filter(house => house.id !== 'house-tawelgar'),
    persons: HOUSE_CHWEDLONOL_FAMILY.persons.map(person => (
      person.id === 'emlyn-tawelgar'
        ? {
            ...person,
            worldPersonId: 'person--family-tree--emlyn-tawelgar',
            birth: '????',
            portrait: '',
            houseId: '',
            notes: '',
            extensions: {}
          }
        : person
    )),
    extensions: {
      ...HOUSE_CHWEDLONOL_FAMILY.extensions,
      sourceRevision: 2
    }
  });
  saveFamilyToLibrary({
    family: previousChwedlonolRevision,
    id: 'haus-chwedlonol',
    title: 'Haus Chwedonol',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']
  }, chwedlonolStorage);

  const upgradedChwedlonol = loadFamilyById('haus-chwedlonol', chwedlonolStorage);
  const upgradedEmlyn = upgradedChwedlonol.family.persons.find(person => person.id === 'emlyn-tawelgar');
  assert.equal(upgradedChwedlonol.source, 'registry-upgrade');
  assert.equal(upgradedChwedlonol.family.extensions.sourceRevision, 3);
  assert.equal(upgradedEmlyn.worldPersonId, 'person--haus-tawelgar--emlyn-tawelgar');
  assert.equal(upgradedEmlyn.birth, '1707');
  assert.equal(upgradedEmlyn.portrait, HOUSE_CHWEDLONOL_PORTRAITS['emlyn-tawelgar']);
  assert.equal(upgradedEmlyn.houseId, 'house-tawelgar');
  assert.ok(upgradedChwedlonol.family.houses.some(house => house.id === 'house-tawelgar'));
  assert.equal(
    upgradedChwedlonol.family.partnerships.filter(partnership => partnership.id === 'marriage-romneyjr-emlyn').length,
    1
  );
});

test('bildet Haus Ymladd mit absolutem Gründersprung und vier korrekt zugeordneten Enkelzweigen ab', () => {
  const family = assertValidFamily(HOUSE_YMLADD_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 23);
  assert.equal(family.partnerships.length, 7);
  assert.equal(family.parentages.length, 15);
  assert.equal(family.cadetBranches.length, 0);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-dafydd-ymladd');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Abergwint');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.equal(family.extensions.sourceRevision, 1);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['dafydd-ymladd', 'hedd-ymladd']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['idris-ymladd', 'emeric-ymladd']
  );

  const expectedChildren = new Map([
    ['dafydd-ymladd', ['garan-ymladd', 'gruffydd-ymladd', 'hedd-ymladd']],
    ['hedd-ymladd', ['idris-ymladd', 'idwal-ymladd']],
    ['garan-ymladd', ['alistair-ymladd', 'keneth-ymladd']],
    ['idris-ymladd', ['emeric-ymladd', 'nerys-ymladd']],
    ['idwal-ymladd', ['guto-ymladd', 'menna-ymladd']],
    ['alistair-ymladd', ['gwilym-ymladd', 'iorwerth-ymladd']],
    ['keneth-ymladd', ['morfudd-ymladd', 'tywll-ymladd']]
  ]);
  expectedChildren.forEach((childIds, personId) => {
    assert.deepEqual(
      graph.getChildren(personId).map(person => person.id).sort(),
      childIds,
      personId + ' muss die in Tabelle und Grafik zugeordneten Kinder besitzen.'
    );
  });

  assert.deepEqual(graph.getPartners('gruffydd-ymladd'), []);
  assert.deepEqual(graph.getChildren('gruffydd-ymladd'), []);
  [
    'emeric-ymladd',
    'nerys-ymladd',
    'guto-ymladd',
    'menna-ymladd',
    'gwilym-ymladd',
    'iorwerth-ymladd',
    'morfudd-ymladd',
    'tywll-ymladd'
  ].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Ehe oder Verlobung.'
    );
  });

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  const timeJump = converted.data.find(node => (
    node.data.aleria.timeJumpId === 'gap-dafydd-hedd-ymladd'
  ));
  assert.ok(crest);
  assert.ok(timeJump);
  assert.deepEqual(chartById.get('dafydd-ymladd').rels.children, [crest.id]);
  assert.deepEqual(chartById.get('unknown-spouse-dafydd-ymladd').rels.children, [crest.id]);
  assert.deepEqual(crest.rels.children, [timeJump.id]);
  assert.deepEqual(timeJump.rels.parents, [crest.id]);
  assert.deepEqual(
    [...timeJump.rels.children].sort(),
    ['garan-ymladd', 'gruffydd-ymladd', 'hedd-ymladd']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 1);

  const connectedIds = new Set(['dafydd-ymladd']);
  const pendingIds = ['dafydd-ymladd'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Ymladd-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Ymladd-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert alle 16 belegten Ymladd-Portraits lokal aus und lässt nur unbekannte Ehefrauen neutral', async () => {
  const family = assertValidFamily(HOUSE_YMLADD_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-ymladd/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_YMLADD_PORTRAITS).length, 16);
  assert.equal(Object.keys(sourceManifest).length, 16);
  assert.equal(picturedPeople.length, 16);
  assert.equal(placeholderPeople.length, 7);
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.id.startsWith('unknown-spouse-')));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));

  await Promise.all(Object.entries(HOUSE_YMLADD_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Ymladd-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
});

test('ersetzt die Ymladd-Leerakte im Register ohne eine zweite Familieninsel anzulegen', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-ymladd',
    title: 'Haus Ymladd',
    emblem: HOUSE_YMLADD_FAMILY.document.emblem,
    houseProfile: HOUSE_YMLADD_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-ymladd',
    title: 'Haus Ymladd',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, storage);

  const loaded = loadFamilyById('haus-ymladd', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_YMLADD_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Abergwint');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-ymladd').length, 1);
});

test('bildet Haus Daran lückenlos mit Maelgwyns Gwyvern-Vermittlung und Angharads Wegverheiratung ab', () => {
  const family = assertValidFamily(HOUSE_DARAN_FAMILY).family;
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);

  assert.equal(family.persons.length, 16);
  assert.equal(family.partnerships.length, 5);
  assert.equal(family.parentages.length, 10);
  assert.equal(family.cadetBranches.length, 2);
  assert.equal(family.timeJumps.length, 0);
  assert.equal(family.lineage.founderPartnershipId, 'marriage-maelgwyn-nest-daran');
  assert.equal(family.lineage.crestFrame, 'silver');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.document.motto, '');
  assert.equal(family.document.houseProfile.rankId, 'knight');
  assert.equal(family.document.houseProfile.seat, 'Garwfaen');
  assert.equal(family.document.houseProfile.liegeHouseId, 'haus-gwyvern');
  assert.match(family.document.houseProfile.regionEmblems.seat, /Garwfaen\.png$/);
  assert.equal(family.extensions.sourceRevision, 2);

  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'head').map(person => person.id),
    ['maelgwyn-daran']
  );
  assert.deepEqual(
    family.persons.filter(person => person.lineageRole === 'mainline').map(person => person.id),
    ['seithved-daran', 'lleu-daran']
  );

  assert.deepEqual(graph.getChildren('maelgwyn-daran').map(person => person.id).sort(), [
    'angharad-daran',
    'einion-daran',
    'rhodri-daran',
    'seithved-daran'
  ]);
  assert.deepEqual(graph.getChildren('seithved-daran').map(person => person.id).sort(), [
    'ida-daran',
    'lleu-daran',
    'morcant-trydar'
  ]);
  assert.deepEqual(graph.getChildren('rhodri-daran').map(person => person.id).sort(), [
    'gwerfyl-daran',
    'llywelyn-daran'
  ]);
  assert.deepEqual(graph.getChildren('einion-daran').map(person => person.id), ['dyddy-daran']);
  assert.deepEqual(graph.getChildren('angharad-daran'), []);

  const fosterParentage = family.parentages.find(parentage => parentage.childId === 'morcant-trydar');
  assert.equal(fosterParentage.type, 'foster');
  assert.deepEqual(fosterParentage.parentIds, ['seithved-daran']);
  assert.equal(graph.getPerson('morcant-trydar').familyRole, 'ward');
  assert.equal(graph.getPerson('maelgwyn-daran').familyRole, 'ward-away');

  ['lleu-daran', 'ida-daran', 'llywelyn-daran', 'gwerfyl-daran', 'dyddy-daran'].forEach(personId => {
    assert.deepEqual(
      graph.getPartners(personId),
      [],
      personId + ' bleibt ohne erfundene Platzhalter-Verlobung.'
    );
  });

  const wardBranch = family.cadetBranches.find(branch => branch.id === 'ward-away-maelgwyn-gwyvern');
  assert.equal(wardBranch.linkType, 'ward-away');
  assert.equal(wardBranch.parentPersonId, 'maelgwyn-daran');
  assert.equal(wardBranch.parentPartnershipId, '');
  assert.equal(wardBranch.targetFamilyId, 'haus-gwyvern');
  assert.equal(wardBranch.crestFrame, 'gold');

  const marriedAwayBranch = family.cadetBranches.find(branch => (
    branch.id === 'married-away-unknown-angharad-daran'
  ));
  assert.equal(marriedAwayBranch.linkType, 'married-away');
  assert.equal(marriedAwayBranch.parentPartnershipId, 'marriage-angharad-unknown-daran');
  assert.equal(marriedAwayBranch.targetFamilyId, 'haus-unbekannt');
  assert.equal(marriedAwayBranch.crestFrame, 'gold');

  const trydar = assertValidFamily(HOUSE_TRYDAR_FAMILY).family;
  const morcantHere = graph.getPerson('morcant-trydar');
  const morcantThere = trydar.persons.find(person => person.id === 'morcant-trydar');
  assert.equal(morcantHere.worldPersonId, morcantThere.worldPersonId);
  assert.equal(morcantHere.portrait, morcantThere.portrait);
  assert.equal(
    trydar.cadetBranches.find(branch => branch.id === 'ward-away-morcant-daran').targetFamilyId,
    'haus-daran'
  );

  const gwyvern = assertValidFamily(HOUSE_GWYVERN_FAMILY).family;
  const maelgwynHere = graph.getPerson('maelgwyn-daran');
  const maelgwynThere = gwyvern.persons.find(person => person.id === 'maelgwyn-daran');
  assert.equal(maelgwynHere.worldPersonId, maelgwynThere.worldPersonId);
  assert.equal(maelgwynHere.portrait, maelgwynThere.portrait);
  const gwyvernFosterParentage = gwyvern.parentages.find(parentage => parentage.childId === 'maelgwyn-daran');
  assert.equal(gwyvernFosterParentage.type, 'foster');
  assert.deepEqual(gwyvernFosterParentage.parentIds, ['seithved-gwyvern']);

  const chartById = new Map(converted.data.map(node => [node.id, node]));
  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  assert.ok(crest);
  assert.ok(chartById.get('maelgwyn-daran').rels.children.includes(crest.id));
  assert.ok(chartById.get('nest-daran').rels.children.includes(crest.id));
  assert.deepEqual(
    [...crest.rels.children].sort(),
    ['angharad-daran', 'einion-daran', 'rhodri-daran', 'seithved-daran']
  );
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-jump').length, 0);
  assert.equal(converted.data.filter(node => node.data.nodeKind === 'time-gap').length, 0);

  const wardBranchNode = converted.data.find(node => (
    node.data.aleria.cadetBranchId === 'ward-away-maelgwyn-gwyvern'
  ));
  assert.deepEqual(wardBranchNode.rels.parents, ['maelgwyn-daran']);
  const marriedAwayNode = converted.data.find(node => (
    node.data.aleria.cadetBranchId === 'married-away-unknown-angharad-daran'
  ));
  assert.deepEqual(
    [...marriedAwayNode.rels.parents].sort(),
    ['angharad-daran', 'unknown-spouse-angharad-daran']
  );

  const connectedIds = new Set(['maelgwyn-daran']);
  const pendingIds = ['maelgwyn-daran'];
  while (pendingIds.length) {
    const node = chartById.get(pendingIds.shift());
    assert.ok(node, 'Jeder Daran-Knoten muss im Diagramm vorhanden sein.');
    [...node.rels.parents, ...node.rels.spouses, ...node.rels.children].forEach(nodeId => {
      if (connectedIds.has(nodeId)) return;
      connectedIds.add(nodeId);
      pendingIds.push(nodeId);
    });
  }
  assert.equal(
    connectedIds.size,
    converted.data.length,
    'Der Daran-Stammbaum darf keine getrennten oder gedoppelten Inseln enthalten.'
  );
});

test('liefert zwölf neue und Morcants kanonisch wiederverwendetes Daran-Portrait lokal aus', async () => {
  const family = assertValidFamily(HOUSE_DARAN_FAMILY).family;
  const picturedPeople = family.persons.filter(person => person.portrait);
  const placeholderPeople = family.persons.filter(person => !person.portrait);
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-daran/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(HOUSE_DARAN_PORTRAITS).length, 13);
  assert.equal(Object.keys(sourceManifest).length, 13);
  assert.equal(picturedPeople.length, 13);
  assert.equal(placeholderPeople.length, 3);
  assert.ok(Object.values(sourceManifest).every(source => source && !/7yB9PR6|51CghpL/.test(source)));
  assert.ok(placeholderPeople.every(person => person.id.startsWith('unknown-spouse-')));
  assert.ok(placeholderPeople.every(person => person.portraitPlaceholder === 'auto'));
  assert.equal(HOUSE_DARAN_PORTRAITS['morcant-trydar'], HOUSE_TRYDAR_PORTRAITS['morcant-trydar']);

  await Promise.all(Object.entries(HOUSE_DARAN_PORTRAITS).map(async ([personId, portrait]) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `Portraitzuordnung ohne Daran-Person: ${personId}`);
    assert.equal(person.portrait, portrait);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `Portraitdatei für ${person.name} ist leer.`);
    if (portrait.endsWith('.png')) {
      assert.deepEqual([...image.subarray(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
    } else {
      assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
    }
  }));
});

test('ersetzt die Daran-Leerakte und migriert Morcants Vormundschaft sowie Maelgwyns Gwyvern-Gegenakte', () => {
  const storage = createMemoryStorage();
  const placeholder = createFounderPlaceholderHouseFamily({
    id: 'haus-daran',
    title: 'Haus Daran',
    emblem: HOUSE_DARAN_FAMILY.document.emblem,
    houseProfile: HOUSE_DARAN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: placeholder,
    id: 'haus-daran',
    title: 'Haus Daran',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Garwfaen']
  }, storage);

  const loaded = loadFamilyById('haus-daran', storage);
  assert.equal(loaded.source, 'registry');
  assert.equal(loaded.family, HOUSE_DARAN_FAMILY);
  assert.equal(loaded.folderPath.join(' > '), 'Cenyr > Celtigerns Wacht > Gwendolyns Ufer > Garwfaen');
  assert.equal(loaded.family.extensions.blankFamily, false);
  assert.equal(FAMILY_REGISTRY.filter(entry => entry.id === 'haus-daran').length, 1);

  const daranRevisionStorage = createMemoryStorage();
  const previousDaranRevision = normalizeFamily({
    ...HOUSE_DARAN_FAMILY,
    persons: HOUSE_DARAN_FAMILY.persons.map(person => (
      person.id === 'morcant-trydar'
        ? {
            ...person,
            title: 'Page bei Ritterherr Maelgwyn Daran · Mündel bei Haus Daran',
            notes: 'Wurde zur ritterlichen Ausbildung an Maelgwyn Daran gegeben.'
          }
        : person
    )),
    parentages: HOUSE_DARAN_FAMILY.parentages.map(parentage => (
      parentage.childId === 'morcant-trydar'
        ? {
            ...parentage,
            parentIds: ['maelgwyn-daran'],
            notes: 'Morcant Trydar war Maelgwyns aufgenommenes Mündel.'
          }
        : parentage
    )),
    extensions: {
      ...HOUSE_DARAN_FAMILY.extensions,
      sourceRevision: 1
    }
  });
  saveFamilyToLibrary({
    family: previousDaranRevision,
    id: 'haus-daran',
    title: 'Haus Daran',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Garwfaen']
  }, daranRevisionStorage);

  const upgradedDaran = loadFamilyById('haus-daran', daranRevisionStorage);
  const upgradedMorcant = upgradedDaran.family.persons.find(person => person.id === 'morcant-trydar');
  const upgradedMorcantParentage = upgradedDaran.family.parentages.find(parentage => (
    parentage.childId === 'morcant-trydar'
  ));
  assert.equal(upgradedDaran.source, 'registry-upgrade');
  assert.equal(upgradedDaran.family.extensions.sourceRevision, 2);
  assert.equal(upgradedMorcant.title, 'Knappe von Sir Seithved Daran · Mündel bei Haus Daran');
  assert.deepEqual(upgradedMorcantParentage.parentIds, ['seithved-daran']);

  const gwyvernStorage = createMemoryStorage();
  const previousGwyvernRevision = normalizeFamily({
    ...HOUSE_GWYVERN_FAMILY,
    houses: HOUSE_GWYVERN_FAMILY.houses.filter(house => house.id !== 'house-daran'),
    persons: HOUSE_GWYVERN_FAMILY.persons.filter(person => person.id !== 'maelgwyn-daran'),
    parentages: HOUSE_GWYVERN_FAMILY.parentages.filter(parentage => parentage.childId !== 'maelgwyn-daran'),
    extensions: {
      ...HOUSE_GWYVERN_FAMILY.extensions,
      sourceRevision: 2
    }
  });
  saveFamilyToLibrary({
    family: previousGwyvernRevision,
    id: 'haus-gwyvern',
    title: 'Haus Gwyvern',
    folderPath: ['Cenyr', 'Celtigerns Wacht', 'Gwendolyns Ufer', 'Abergwint']
  }, gwyvernStorage);

  const upgradedGwyvern = loadFamilyById('haus-gwyvern', gwyvernStorage);
  assert.equal(upgradedGwyvern.source, 'registry-upgrade');
  assert.equal(upgradedGwyvern.family.extensions.sourceRevision, 3);
  assert.equal(upgradedGwyvern.family.persons.filter(person => person.id === 'maelgwyn-daran').length, 1);
  assert.equal(upgradedGwyvern.family.parentages.filter(parentage => parentage.childId === 'maelgwyn-daran').length, 1);
  assert.ok(upgradedGwyvern.family.houses.some(house => house.id === 'house-daran'));
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
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));

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

  // Dymphna/Deaglan bleiben leibliche Gallchobhair-Nachkommen. Merwin wird als
  // Vormund separat geführt; für die Baumdarstellung bleibt diese Mündellinie primär.
  ['dymphna-gallchobhair', 'deaglan-gallchobhair'].forEach(childId => {
    const person = family.persons.find(entry => entry.id === childId);
    const parentages = graph.getParentages(childId);
    const fosterParentage = parentages.find(entry => entry.type === 'foster');
    const biologicalParentage = parentages.find(entry => entry.type === 'biological');
    const chartPerson = chartById.get(childId);

    assert.equal(person.familyRole, 'ward');
    assert.equal(person.houseId, 'house-gallchobhair');
    assert.deepEqual(fosterParentage.parentIds, ['merwin-illewod']);
    assert.equal(fosterParentage.partnershipId, '');
    assert.deepEqual([...biologicalParentage.parentIds].sort(), ['anali-illewod', 'tynan-gallchobhair']);
    assert.equal(biologicalParentage.partnershipId, 'marriage-anali-tynan');
    assert.deepEqual(chartPerson.rels.parents, ['merwin-illewod']);
    assert.equal(chartPerson.data.frameAsset, getPersonCardFrame('ward').asset);
    assert.equal(chartPerson.data.crest, 'assets/images/houses/clan-gallchobhair.svg');
  });

  assert.deepEqual(graph.getChildren('madoc-illewod').map(person => person.id), ['meical-illewod']);
  assert.deepEqual(graph.getChildren('brannoc-illewod').map(person => person.id), ['caled-illewod']);
  assert.deepEqual(
    graph.getChildren('selwyn-illewod').map(person => person.id).sort(),
    ['arthgal-illewod', 'carwyn-illewod', 'mifawi-illewod']
  );
  assert.deepEqual(
    family.persons.filter(person => (
      !graph.getParents(person.id).length
      && !graph.getPartnerships(person.id).length
      && !graph.getChildren(person.id).length
    )),
    [],
    'Im Illewod-Baum darf keine Person ohne Verknüpfung verbleiben.'
  );

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

test('liefert alle belegten und korrigierten Illewod-Portraits als lokale Dateien aus', async () => {
  const family = assertValidFamily(HOUSE_ILLEWOD_FAMILY).family;
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-illewod/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.deepEqual(Object.keys(sourceManifest).sort(), Object.keys(HOUSE_ILLEWOD_PORTRAITS).sort());
  ['mairwen-illewod', 'marared-illewod', 'gaenor-teyrngarch'].forEach(personId => {
    assert.equal(
      family.persons.find(person => person.id === personId).portrait,
      HOUSE_ILLEWOD_PORTRAITS[personId]
    );
  });
  assert.equal(family.persons.find(person => person.id === 'gaenor-teyrngarch').sex, 'male');
  ['keudawg-illewod', 'blodeuyn-pendrag'].forEach(personId => {
    assert.equal(
      family.persons.find(person => person.id === personId).portrait,
      HOUSE_PENDRAG_PORTRAITS[personId],
      `${personId} muss das bereits vorhandene Pendrag-Portrait wiederverwenden.`
    );
  });

  await Promise.all(Object.values(HOUSE_ILLEWOD_PORTRAITS).map(async portrait => {
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `${portrait} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  }));
  const gallchobhairCrest = await readFile(
    new URL('../assets/images/houses/clan-gallchobhair.svg', import.meta.url),
    'utf8'
  );
  assert.match(gallchobhairCrest, /Wappen des Clans Gallchobhair/);
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

test('bildet die 104 Personen des Grafenhauses Neidr mit fünf seriellen Generationentrennern ab', () => {
  const { family, diagnostics } = assertValidFamily(HOUSE_NEIDR_FAMILY);
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));

  assert.equal(diagnostics.filter(item => item.severity === 'error').length, 0);
  assert.equal(family.persons.length, 104);
  assert.equal(family.document.id, 'haus-neidr');
  assert.equal(family.document.houseProfile.rankId, 'county');
  assert.equal(family.document.houseProfile.kingdom, 'Cenyr');
  assert.equal(family.document.houseProfile.county, 'Silberinsel');
  assert.equal(family.document.houseProfile.barony, '');
  assert.equal(family.document.houseProfile.seat, 'Llanvane');
  assert.equal(family.document.houseProfile.regionEmblems.county, 'assets/images/regions/silberinsel.png');
  assert.equal(family.document.emblem, 'assets/images/houses/Silberinsel/haus-neidr.png');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-gawan-mallaidh');
  assert.equal(family.lineage.crestSubtitle, 'Grafengeschlecht');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.view.focusPersonId, 'gawan-neidr');
  assert.equal(family.extensions.sourceRevision, 2);

  const headSuccession = [
    'gawan-neidr', 'gwyron-neidr', 'owain-neidr', 'cadoc-neidr', 'merwin-neidr',
    'powell-neidr', 'gwythyr-neidr', 'daffyd-neidr', 'gwynnan-neidr', 'howell-neidr',
    'gaenor-neidr', 'aeron-neidr', 'yvain-neidr'
  ];
  headSuccession.forEach((personId, index) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `${personId} fehlt in der Neidr-Oberhauptfolge.`);
    assert.equal(person.lineageRole, 'head', `${personId} sollte als Oberhaupt markiert sein.`);
    if (!index) return;
    assert.ok(
      graph.getParents(personId).some(parent => parent.id === headSuccession[index - 1]),
      `${personId} muss die serielle Hauptlinie nach ${headSuccession[index - 1]} fortsetzen.`
    );
  });
  assert.equal(family.persons.find(person => person.id === 'yvain-neidr').title, 'Regierender Graf von Llanvane seit 1720');

  const expectedTimeJumps = [
    ['gap-gwyron-owain', 'marriage-sabria-gwyron', ['owain-neidr']],
    ['gap-cadoc-merwin', 'marriage-cadoc-fionnghula', ['merwin-neidr', 'jinelle-neidr']],
    ['gap-merwin-powell', 'marriage-merwin-elinor', ['powell-neidr', 'llynn-neidr']],
    ['gap-powell-gwythyr', 'marriage-powell-dolena', ['gwythyr-neidr', 'maygan-elder-neidr']],
    ['gap-gwythyr-daffyd', 'marriage-gwythyr-quendolin', ['daffyd-neidr', 'igraine-neidr']]
  ];
  assert.equal(family.timeJumps.length, expectedTimeJumps.length);
  expectedTimeJumps.forEach(([gapId, partnershipId, childIds], index) => {
    const gap = family.timeJumps[index];
    assert.equal(gap.id, gapId);
    assert.equal(gap.parentPartnershipId, partnershipId);
    assert.equal(gap.parentPersonId || '', '', `${gapId} darf kein paralleler Wurzeltrenner sein.`);
    assert.deepEqual(gap.childIds, childIds);
    const anchor = family.partnerships.find(partnership => partnership.id === partnershipId);
    assert.ok(anchor);
    const chartGap = chartById.get(`__time-jump-${gapId}`);
    assert.ok(chartGap, `${gapId} fehlt in den konvertierten Diagrammdaten.`);
    const layoutStage = chartById.get(`${chartGap.id}--layout-stage`);
    assert.ok(layoutStage, `${gapId} benötigt eine eigene unsichtbare Ebene unter den Hausanhängen.`);
    assert.deepEqual([...layoutStage.rels.parents].sort(), [...anchor.participantIds].sort());
    assert.deepEqual(layoutStage.rels.children, [chartGap.id]);
    assert.deepEqual(chartGap.rels.parents, [layoutStage.id]);
    assert.ok(chartGap.rels.parents.length <= 2, `${gapId} darf den Folgebaum nicht vervielfachen.`);
    assert.deepEqual(
      converted.data
        .filter(node => node.rels.children.includes(chartGap.id))
        .map(node => node.id)
        .sort(),
      [layoutStage.id],
      `${gapId} darf keine weiteren Paare derselben Generation als Eltern erhalten.`
    );
    assert.ok(
      chartGap.rels.children.every(childId => chartById.get(childId).data.nodeKind === 'person'),
      `${gapId} darf keinen Hausknoten als Generationsnachkommen verschlucken.`
    );
    childIds.forEach(childId => {
      const parentage = family.parentages.find(entry => (
        entry.childId === childId && entry.partnershipId === partnershipId
      ));
      assert.ok(parentage, `${gapId} muss mit der Abstammung von ${childId} verknüpft sein.`);
      assert.equal(parentage.extensions.timeJumpId, gapId);
      assert.deepEqual(chartById.get(childId).rels.parents, [chartGap.id]);
    });

    if (!index) return;
    const previousGap = family.timeJumps[index - 1];
    const previousLine = new Set(previousGap.childIds);
    previousGap.childIds.forEach(childId => {
      graph.getDescendants(childId).forEach(({ person }) => previousLine.add(person.id));
    });
    assert.ok(
      anchor.participantIds.some(personId => previousLine.has(personId)),
      `${gapId} muss unter ${previousGap.id} und darf nicht parallel dazu liegen.`
    );
  });

  const sproutExpectations = [
    ['married-away-saith-gwennan', 'Haus Saith', 'marriage-gwennan-bors'],
    ['married-away-pysgod-caitrin', 'Haus Tiwna', 'marriage-caitrin-morholt'],
    ['married-away-pyrth-llynn', 'Haus Pyrth', 'marriage-llynn-roderic']
  ];
  assert.equal(family.cadetBranches.length, 17);
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'cadet-house').length, 3);
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'married-away').length, 14);
  sproutExpectations.forEach(([branchId, name, partnershipId]) => {
    const branch = family.cadetBranches.find(item => item.id === branchId);
    assert.ok(branch);
    assert.equal(branch.name, name);
    assert.equal(branch.subtitle, 'Spross');
    assert.equal(branch.linkType, 'cadet-house');
    assert.equal(branch.parentPartnershipId, partnershipId);
  });
  const caitrinBranch = family.cadetBranches.find(branch => branch.id === 'married-away-pysgod-caitrin');
  assert.equal(caitrinBranch.houseId, 'house-tiwna');
  assert.equal(caitrinBranch.targetFamilyId, 'haus-tiwna');
  assert.equal(caitrinBranch.emblem, '', 'Das Pysgod-Wappen darf nicht für den Tiwna-Spross erscheinen.');

  const jinelleBranch = family.cadetBranches.find(branch => branch.id === 'married-away-unbekannt-jinelle');
  assert.ok(jinelleBranch);
  assert.equal(jinelleBranch.name, 'Unbekanntes Haus');
  assert.equal(jinelleBranch.linkType, 'married-away');
  assert.equal(jinelleBranch.parentPartnershipId, 'marriage-jinelle-sieffre');

  family.cadetBranches.forEach(branch => {
    const partnership = family.partnerships.find(item => item.id === branch.parentPartnershipId);
    const chartBranch = chartById.get(`__cadet-${branch.id}`) || chartById.get(`__line-end-${branch.id}`);
    assert.ok(partnership && chartBranch, `${branch.id} muss als Hausanhang dargestellt werden.`);
    assert.deepEqual(
      [...chartBranch.rels.parents].sort(),
      [...partnership.participantIds].sort(),
      `${branch.id} muss direkt unter seinem Gründer- oder Ehepaar bleiben.`
    );
  });

  const marriedNeidrWomen = family.partnerships.filter(partnership => (
    partnership.type === 'marriage'
    && partnership.participantIds.some(personId => {
      const person = family.persons.find(item => item.id === personId);
      return person?.sex === 'female' && person.houseId === 'house-neidr';
    })
    && partnership.participantIds.some(personId => (
      family.persons.find(item => item.id === personId)?.houseId !== 'house-neidr'
    ))
  ));
  marriedNeidrWomen.forEach(partnership => {
    assert.ok(
      family.cadetBranches.some(branch => branch.parentPartnershipId === partnership.id),
      `${partnership.id} fehlt die Hausverknotung der verheirateten Neidr-Frau.`
    );
  });
  assert.equal(family.persons.find(person => person.id === 'bors-saith').title, 'Begründer des Hauses Saith');
  assert.equal(family.persons.find(person => person.id === 'morholt-pysgod').title, 'Begründer des Hauses Tiwna');
  assert.equal(family.persons.find(person => person.id === 'roderic-pyrth').title, 'Begründer des Hauses Pyrth');

  const daffydMarriageChildren = family.parentages
    .filter(parentage => parentage.partnershipId === 'marriage-daffyd-bettrys')
    .map(parentage => parentage.childId)
    .sort();
  assert.deepEqual(daffydMarriageChildren, ['aoirghe-neidr', 'gwynnan-neidr', 'prynhawn-neidr']);
  const prynhawnUnion = family.partnerships.find(partnership => partnership.id === 'union-prynhawn-iowaneth');
  assert.deepEqual(prynhawnUnion.participantIds, ['prynhawn-neidr', 'iowaneth-pyrth']);
  assert.equal(prynhawnUnion.type, 'union');

  const banwAffair = family.partnerships.find(partnership => partnership.id === 'affair-daffyd-banw');
  assert.deepEqual(banwAffair.participantIds, ['daffyd-neidr', 'banw']);
  assert.equal(banwAffair.type, 'affair');
  const gwynethParentage = family.parentages.find(parentage => parentage.childId === 'gwyneth-neidr');
  assert.deepEqual(gwynethParentage.parentIds, ['daffyd-neidr', 'banw']);
  assert.equal(gwynethParentage.partnershipId, 'affair-daffyd-banw');
  assert.equal(gwynethParentage.legitimacy, 'illegitimate');
  assert.equal(family.persons.find(person => person.id === 'gwyneth-neidr').familyRole, 'bastard');

  assert.deepEqual(
    family.persons.filter(person => (
      !graph.getParents(person.id).length
      && !graph.getPartnerships(person.id).length
      && !graph.getChildren(person.id).length
    )),
    [],
    'Im Neidr-Baum darf keine Person ohne Verknüpfung verbleiben.'
  );
});

test('hält Neidr-Weltpersonen, Portraits und hausübergreifende Beziehungs-IDs konsistent', () => {
  const neidr = assertValidFamily(HOUSE_NEIDR_FAMILY).family;
  const draig = assertValidFamily(HOUSE_DRAIG_FAMILY).family;
  const illewod = assertValidFamily(HOUSE_ILLEWOD_FAMILY).family;
  const pendrag = assertValidFamily(HOUSE_PENDRAG_FAMILY).family;
  const saethwyr = assertValidFamily(HOUSE_SAETHWYR_FAMILY).family;

  [
    ['gwyneth-neidr', draig],
    ['gaenor-neidr', draig],
    ['guinevere-neidr', draig],
    ['gwyron-neidr', illewod],
    ['griff-neidr', illewod],
    ['howell-neidr', pendrag],
    ['lancelot-neidr', pendrag],
    ['llywellyn-neidr', saethwyr]
  ].forEach(([personId, otherFamily]) => {
    const here = neidr.persons.find(person => person.id === personId);
    const there = otherFamily.persons.find(person => person.id === personId);
    assert.ok(here, `${personId} fehlt in Haus Neidr.`);
    assert.ok(there, `${personId} fehlt im verknüpften Stammbaum.`);
    assert.equal(here.worldPersonId, `person--haus-neidr--${personId}`);
    assert.equal(here.worldPersonId, there.worldPersonId, `${personId} muss dieselbe Weltperson bleiben.`);
    assert.equal(here.portrait, there.portrait, `${personId} muss dasselbe lokale Portrait verwenden.`);
    assert.equal(here.portrait, HOUSE_NEIDR_PORTRAITS[personId]);
  });

  [
    ['marriage-lancelot-gwyneth', draig],
    ['marriage-elenydd-gaenor', draig],
    ['engagement-gawain-guinevere', draig],
    ['marriage-sabria-gwyron', illewod],
    ['marriage-karys-griff', illewod],
    ['marriage-sulwen-howell', pendrag],
    ['marriage-dolena-llywellyn', saethwyr]
  ].forEach(([partnershipId, otherFamily]) => {
    const here = neidr.partnerships.find(partnership => partnership.id === partnershipId);
    const there = otherFamily.partnerships.find(partnership => partnership.id === partnershipId);
    assert.ok(here, `${partnershipId} fehlt in Haus Neidr.`);
    assert.ok(there, `${partnershipId} fehlt im verknüpften Stammbaum.`);
    assert.deepEqual([...here.participantIds].sort(), [...there.participantIds].sort());
    assert.equal(here.type, there.type);
  });

  const chartById = new Map(toFamilyChartData(neidr).data.map(node => [node.id, node]));
  [
    ['guinevere-neidr', draig],
    ['lancelot-neidr', pendrag]
  ].forEach(([personId, fosterFamily]) => {
    const nativePerson = neidr.persons.find(person => person.id === personId);
    const fosterPerson = fosterFamily.persons.find(person => person.id === personId);
    const nativeParentages = createFamilyGraph(neidr).getParentages(personId);
    assert.equal(nativePerson.familyRole, 'core', `${personId} ist im eigenen Haus kein Mündel.`);
    assert.equal(fosterPerson.familyRole, 'ward', `${personId} muss im Pflegehaus Mündel bleiben.`);
    assert.ok(nativeParentages.some(parentage => parentage.type === 'biological'));
    assert.ok(nativeParentages.some(parentage => parentage.type === 'foster'));
    assert.deepEqual(chartById.get(personId).rels.parents, ['yvain-neidr', 'morgana-wylan']);
    assert.equal(chartById.get(personId).data.aleria.familyRole, 'core');
  });
});

test('liefert das lokale Neidr-Portraitmanifest mit 65 vollständigen JPEG-Dateien aus', async () => {
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-neidr/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(HOUSE_NEIDR_PORTRAITS)
    .filter(personId => HOUSE_NEIDR_PORTRAITS[personId].startsWith('assets/images/portraits/haus-neidr/'));

  assert.equal(Object.keys(sourceManifest).length, 65);
  assert.equal(localPortraitIds.length, 65);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_NEIDR_PORTRAITS[personId];
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `${portrait} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${portrait} muss ein JPEG sein.`);
  }));
});

test('ersetzt die Neidr-Leerakte im Familienregister durch den ausgearbeiteten Stammbaum', () => {
  const countyFamily = CENYR_COUNTY_HOUSE_FAMILIES.find(family => family.document.id === 'haus-neidr');
  const registryRecord = FAMILY_REGISTRY.find(record => record.id === 'haus-neidr');
  const loadedRecord = loadFamilyById('haus-neidr', createMemoryStorage());

  assert.equal(countyFamily, HOUSE_NEIDR_FAMILY);
  assert.ok(registryRecord);
  assert.equal(registryRecord.family, HOUSE_NEIDR_FAMILY);
  assert.equal(registryRecord.type, 'dynasty');
  assert.deepEqual(registryRecord.folderPath, ['Cenyr', 'Silberinsel', 'Llanvane']);
  assert.notEqual(registryRecord.family.extensions.blankFamily, true);
  assert.equal(registryRecord.family.persons.length, 104);
  assert.equal(loadedRecord.family.persons.length, 104);
  assert.deepEqual(loadedRecord.folderPath, ['Cenyr', 'Silberinsel', 'Llanvane']);
});

test('migriert einen lokalen Neidr-Stand ohne doppelte Altzweige auf die korrigierten Hausknoten', () => {
  const storage = createMemoryStorage();
  const legacyBranchValues = new Map([
    ['married-away-saith-gwennan', {
      name: 'Haus Saith', houseId: 'house-saith', targetFamilyId: 'haus-saith', emblem: ''
    }],
    ['married-away-pysgod-caitrin', {
      name: 'Haus Pysgod', houseId: 'house-pysgod', targetFamilyId: 'haus-pysgod',
      emblem: 'assets/images/houses/Graue Weite/haus-pysgod.png'
    }],
    ['married-away-pyrth-llynn', {
      name: 'Haus Pyrth', houseId: 'house-pyrth', targetFamilyId: 'haus-pyrth', emblem: ''
    }]
  ]);
  const legacyFamily = normalizeFamily({
    ...HOUSE_NEIDR_FAMILY,
    houses: HOUSE_NEIDR_FAMILY.houses.filter(house => house.id !== 'house-unbekannt-jinelle'),
    persons: HOUSE_NEIDR_FAMILY.persons.map(person => (
      ['bors-saith', 'morholt-pysgod', 'roderic-pyrth'].includes(person.id)
        ? { ...person, title: '', extensions: {} }
        : person
    )),
    cadetBranches: HOUSE_NEIDR_FAMILY.cadetBranches
      .filter(branch => branch.id !== 'married-away-unbekannt-jinelle')
      .map(branch => {
        const legacy = legacyBranchValues.get(branch.id);
        return legacy
          ? {
              ...branch,
              ...legacy,
              subtitle: 'Wegverheiratete Linie',
              linkType: 'married-away',
              notes: '',
              extensions: {}
            }
          : branch;
      }),
    extensions: { ...HOUSE_NEIDR_FAMILY.extensions, sourceRevision: 1 }
  });
  saveFamilyToLibrary({
    family: legacyFamily,
    id: 'haus-neidr',
    title: 'Haus Neidr',
    folderPath: ['Cenyr', 'Silberinsel', 'Llanvane']
  }, storage);

  const loaded = loadFamilyById('haus-neidr', storage);
  const caitrinBranch = loaded.family.cadetBranches.find(branch => branch.id === 'married-away-pysgod-caitrin');
  assert.equal(loaded.source, 'registry-upgrade');
  assert.equal(loaded.family.extensions.sourceRevision, 2);
  assert.equal(loaded.family.cadetBranches.length, 17);
  assert.equal(new Set(loaded.family.cadetBranches.map(branch => branch.id)).size, 17);
  assert.equal(caitrinBranch.name, 'Haus Tiwna');
  assert.equal(caitrinBranch.linkType, 'cadet-house');
  assert.equal(caitrinBranch.houseId, 'house-tiwna');
  assert.equal(caitrinBranch.emblem, '');
  assert.ok(loaded.family.cadetBranches.some(branch => branch.id === 'married-away-unbekannt-jinelle'));
  assert.equal(loaded.family.persons.find(person => person.id === 'bors-saith').title, 'Begründer des Hauses Saith');
});

test('bildet die 103 Personen des Grafenhauses Grawn mit einem seriellen Generationentrenner ab', () => {
  const { family, diagnostics } = assertValidFamily(HOUSE_GRAWN_FAMILY);
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));

  assert.equal(diagnostics.filter(item => item.severity === 'error').length, 0);
  assert.equal(family.persons.length, 103);
  assert.equal(family.partnerships.length, 42);
  assert.equal(family.parentages.length, 61);
  assert.equal(family.document.id, 'haus-grawn');
  assert.equal(family.document.houseProfile.rankId, 'county');
  assert.equal(family.document.houseProfile.kingdom, 'Cenyr');
  assert.equal(family.document.houseProfile.county, 'Ährental');
  assert.equal(family.document.houseProfile.seat, 'Glyndraith');
  assert.equal(family.document.emblem, 'assets/images/houses/Ährental/haus-grawn.png');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-tristam-emer');
  assert.equal(family.lineage.crestSubtitle, 'Grafengeschlecht');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.view.focusPersonId, 'tristam-grawn');
  assert.equal(family.extensions.sourceRevision, 1);
  assert.equal(family.partnerships.filter(item => item.type === 'marriage').length, 39);
  assert.equal(family.partnerships.filter(item => item.type === 'affair').length, 2);
  assert.equal(family.partnerships.filter(item => item.type === 'engagement').length, 1);

  const headSuccession = [
    'tristam-grawn',
    'iorwerth-ancient-grawn',
    'dystan-grawn',
    'maelgwyn-grawn',
    'petyr-grawn',
    'hewet-grawn',
    'iorwerth-1685-grawn'
  ];
  headSuccession.forEach((personId, index) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `${personId} fehlt in der Grawn-Oberhauptfolge.`);
    assert.equal(person.lineageRole, 'head', `${personId} sollte als Oberhaupt markiert sein.`);
    if (!index) return;
    assert.ok(
      graph.getParents(personId).some(parent => parent.id === headSuccession[index - 1]),
      `${personId} muss die Hauptlinie nach ${headSuccession[index - 1]} fortsetzen.`
    );
  });
  assert.equal(family.persons.find(person => person.id === 'iorwerth-1685-grawn').title, 'Graf des Ährentals seit 1720');
  assert.equal(family.persons.find(person => person.id === 'afon-grawn').title, 'Erbe des Hauses Grawn');
  assert.equal(family.persons.find(person => person.id === 'afon-grawn').lineageRole, 'mainline');

  const expectedGapChildren = [
    'dystan-grawn',
    'bedwyr-grawn',
    'rheanne-grawn',
    'niniel-grawn',
    'vaughan-grawn',
    'tatumn-grawn',
    'mervyn-grawn'
  ];
  assert.equal(family.timeJumps.length, 1);
  const [gap] = family.timeJumps;
  assert.equal(gap.id, 'gap-iorwerth-dystan');
  assert.equal(gap.parentPartnershipId, 'marriage-iorwerth-aranrhod');
  assert.equal(gap.parentPersonId || '', '', 'Der Zeitsprung darf kein paralleler Wurzeltrenner sein.');
  assert.deepEqual(gap.childIds, expectedGapChildren);

  const gapAnchor = family.partnerships.find(item => item.id === gap.parentPartnershipId);
  const chartGap = chartById.get(`__time-jump-${gap.id}`);
  const layoutStage = chartById.get(`${chartGap?.id}--layout-stage`);
  assert.ok(gapAnchor && chartGap && layoutStage, 'Der Grawn-Zeitsprung braucht Anker, Trenner und eigene Layout-Ebene.');
  assert.deepEqual([...layoutStage.rels.parents].sort(), [...gapAnchor.participantIds].sort());
  assert.deepEqual(layoutStage.rels.children, [chartGap.id]);
  assert.deepEqual(chartGap.rels.parents, [layoutStage.id]);
  assert.deepEqual(
    converted.data.filter(node => node.rels.children.includes(chartGap.id)).map(node => node.id),
    [layoutStage.id],
    'Der Zeitsprung darf niemals parallel an weiteren Knoten hängen.'
  );
  assert.deepEqual([...chartGap.rels.children].sort(), [...expectedGapChildren].sort());
  expectedGapChildren.forEach(childId => {
    const parentage = family.parentages.find(item => (
      item.childId === childId && item.partnershipId === gap.parentPartnershipId
    ));
    assert.ok(parentage, `${childId} muss fachlich am Iorwerth/Aranrhod-Strang hängen.`);
    assert.equal(parentage.type, 'claimed');
    assert.equal(parentage.certainty, 'probable');
    assert.equal(parentage.extensions.timeJumpId, gap.id);
    assert.deepEqual(chartById.get(childId).rels.parents, [chartGap.id]);
  });

  const branchExpectations = [
    ['married-away-warthog-ceridwen', 'marriage-ceridwen-tamhas', 'house-warthog'],
    ['married-away-airt-rheanne', 'marriage-rheanne-coemgen', 'house-airt'],
    ['married-away-durachd-niniel', 'marriage-niniel-cailte', 'house-durachd'],
    ['married-away-blar-tatumn', 'marriage-tatumn-seamus', 'house-blar'],
    ['married-away-baedd-ysobel', 'marriage-ysobel-dyfnwal', 'house-baedd'],
    ['married-away-pendrag-telyn', 'marriage-ector1629-telyn', 'house-pendrag'],
    ['married-away-pendrag-igraine', 'marriage-uther1643-igraine', 'house-pendrag'],
    ['married-away-illewod-glaw', 'marriage-madoc-glaw', 'house-illewod'],
    ['married-away-wylan-gladys', 'marriage-gladys-iolyn', 'house-wylan'],
    ['married-away-durachd-eleyne', 'marriage-eleyne-fothradh', 'house-durachd'],
    ['married-away-sgwarnog-gwendolyn', 'marriage-gwendolyn-morcant', 'house-sgwarnog'],
    ['married-away-dienyddiwr-arianwyn', 'marriage-arianwyn-robyert', 'house-dienyddiwr'],
    ['married-away-draig-alaw', 'marriage-maredudd-alaw', 'house-draig'],
    ['married-away-arth-ceridwen', 'marriage-ceridwen-parzifal', 'house-arth'],
    ['married-away-marchog-glenys', 'marriage-glenys-llyonell', 'house-marchog'],
    ['married-away-morcanhuc-ywen', 'marriage-ywen-arthos', 'house-morcanhuc'],
    ['married-away-baedd-elin', 'marriage-elin-cei', 'house-baedd']
  ];
  assert.equal(family.cadetBranches.length, branchExpectations.length);
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'cadet-house').length, 0);
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'married-away').length, 17);
  branchExpectations.forEach(([branchId, partnershipId, houseId]) => {
    const branch = family.cadetBranches.find(item => item.id === branchId);
    const partnership = family.partnerships.find(item => item.id === partnershipId);
    const chartBranch = chartById.get(`__cadet-${branchId}`) || chartById.get(`__line-end-${branchId}`);
    assert.ok(branch && partnership && chartBranch, `${branchId} muss als Hausverknotung vorhanden sein.`);
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.houseId, houseId);
    assert.equal(branch.linkType, 'married-away');
    assert.deepEqual(
      [...chartBranch.rels.parents].sort(),
      [...partnership.participantIds].sort(),
      `${branchId} muss direkt unter seinem Ehepaar liegen.`
    );
  });
  assert.equal(
    family.cadetBranches.some(branch => branch.parentPartnershipId === 'engagement-neithon-alaweyn'),
    false,
    'Eine Verlobung ist noch keine Wegverheiratung.'
  );

  assert.equal(family.persons.find(person => person.id === 'annegret-skogg').name, 'Annegret Skogg');
  assert.equal(family.persons.find(person => person.id === 'nerys-wivern').name, 'Nerys Wivern');
  assert.deepEqual(
    family.persons.filter(person => (
      !graph.getParents(person.id).length
      && !graph.getPartnerships(person.id).length
      && !graph.getChildren(person.id).length
    )),
    [],
    'Im Grawn-Baum darf keine Person ohne Verknüpfung verbleiben.'
  );
});

test('ordnet Mordreds acht Bastarde sichtbar und fachlich ihren beiden Affären zu', () => {
  const { family } = assertValidFamily(HOUSE_GRAWN_FAMILY);
  const chartById = new Map(toFamilyChartData(family).data.map(node => [node.id, node]));
  const affairGroups = [
    {
      partnerId: 'glada-grawn-affair',
      partnerName: 'Glada',
      partnershipId: 'affair-mordred-glada',
      childIds: ['afan-grawn', 'tryphena-grawn', 'elaine-grawn', 'ragnailt-grawn', 'arwal-grawn', 'eirwen-grawn'],
      partnerTitle: 'Affäre Mordreds · Mutter von sechs Bastarden'
    },
    {
      partnerId: 'gwenllian-grawn-affair',
      partnerName: 'Gwenllian',
      partnershipId: 'affair-mordred-gwenllian',
      childIds: ['trystan-1715-grawn', 'ysolde-grawn'],
      partnerTitle: 'Affäre Mordreds · Mutter von zwei Bastarden'
    }
  ];

  affairGroups.forEach(({ partnerId, partnerName, partnershipId, childIds, partnerTitle }) => {
    const affair = family.partnerships.find(item => item.id === partnershipId);
    const partner = family.persons.find(person => person.id === partnerId);
    const groupParentages = family.parentages.filter(item => item.partnershipId === partnershipId);
    assert.ok(affair && partner);
    assert.equal(affair.type, 'affair');
    assert.equal(affair.status, 'ended');
    assert.deepEqual(affair.participantIds, ['mordred-grawn', partnerId]);
    assert.equal(partner.familyRole, 'affair');
    assert.equal(partner.title, partnerTitle);
    assert.deepEqual(groupParentages.map(item => item.childId), childIds);

    groupParentages.forEach(parentage => {
      const child = family.persons.find(person => person.id === parentage.childId);
      const chartChild = chartById.get(parentage.childId);
      assert.deepEqual(parentage.parentIds, ['mordred-grawn', partnerId]);
      assert.equal(parentage.legitimacy, 'illegitimate');
      assert.match(parentage.notes, new RegExp(`Affäre mit ${partnerName}`));
      assert.equal(child.familyRole, 'bastard');
      assert.equal(child.title, `Bastard aus Mordreds Affäre mit ${partnerName}`);
      assert.equal(chartChild.data.title, child.title, `${child.id} muss die Mutter direkt auf der sichtbaren Karte nennen.`);
    });
  });

  assert.equal(
    family.parentages.filter(item => item.legitimacy === 'illegitimate').length,
    8,
    'Mordreds beide Affären ergeben zusammen genau acht belegte Bastarde.'
  );
});

test('hält Grawn-Weltpersonen, Portraits und Beziehungs-IDs in den Gegenstammbäumen konsistent', () => {
  const grawn = assertValidFamily(HOUSE_GRAWN_FAMILY).family;
  const linkedPartnerships = [
    ['marriage-rohella-petyr', assertValidFamily(HOUSE_NEIDR_FAMILY).family],
    ['marriage-ector1629-telyn', assertValidFamily(HOUSE_PENDRAG_FAMILY).family],
    ['marriage-uther1643-igraine', assertValidFamily(HOUSE_PENDRAG_FAMILY).family],
    ['marriage-efa-eifion', assertValidFamily(HOUSE_GWEFRYDD_FAMILY).family],
    ['marriage-madoc-glaw', assertValidFamily(HOUSE_ILLEWOD_FAMILY).family],
    ['marriage-morwen-owen', assertValidFamily(HOUSE_ILLYSYWEN_FAMILY).family],
    ['marriage-maredudd-alaw', assertValidFamily(HOUSE_DRAIG_FAMILY).family],
    ['engagement-neithon-alaweyn', assertValidFamily(HOUSE_DRAIG_FAMILY).family]
  ];

  linkedPartnerships.forEach(([partnershipId, otherFamily]) => {
    const here = grawn.partnerships.find(item => item.id === partnershipId);
    const there = otherFamily.partnerships.find(item => item.id === partnershipId);
    assert.ok(here, `${partnershipId} fehlt in Haus Grawn.`);
    assert.ok(there, `${partnershipId} fehlt im Gegenstammbaum.`);
    assert.deepEqual([...here.participantIds].sort(), [...there.participantIds].sort());
    assert.equal(here.type, there.type);
    here.participantIds.forEach(personId => {
      const herePerson = grawn.persons.find(person => person.id === personId);
      const therePerson = otherFamily.persons.find(person => person.id === personId);
      assert.ok(herePerson && therePerson, `${personId} muss auf beiden Seiten derselben Beziehung existieren.`);
      assert.equal(herePerson.worldPersonId, therePerson.worldPersonId, `${personId} muss dieselbe Weltperson bleiben.`);
      assert.equal(herePerson.portrait, therePerson.portrait, `${personId} darf im Gegenstammbaum kein anderes Portrait erhalten.`);
    });
  });

  const grawnEmblem = HOUSE_GRAWN_FAMILY.document.emblem;
  [HOUSE_DRAIG_FAMILY, HOUSE_PENDRAG_FAMILY, HOUSE_ILLEWOD_FAMILY, HOUSE_GWEFRYDD_FAMILY, HOUSE_ILLYSYWEN_FAMILY, HOUSE_NEIDR_FAMILY]
    .forEach(otherFamily => {
      const grawnHouse = otherFamily.houses.find(house => house.id === 'house-grawn');
      assert.ok(grawnHouse, `${otherFamily.document.id} braucht den Haus-Grawn-Datensatz.`);
      assert.equal(grawnHouse.emblem, grawnEmblem, `${otherFamily.document.id} muss das korrekte Grawn-Wappen verwenden.`);
    });
  [
    [HOUSE_NEIDR_FAMILY, 'married-away-grawn-rohella'],
    [HOUSE_GWEFRYDD_FAMILY, 'married-away-grawn-efa'],
    [HOUSE_ILLYSYWEN_FAMILY, 'married-away-grawn-morwen']
  ].forEach(([otherFamily, branchId]) => {
    assert.equal(otherFamily.cadetBranches.find(branch => branch.id === branchId)?.emblem, grawnEmblem);
  });
});

test('liefert das lokale Grawn-Portraitmanifest mit 62 vollständigen JPEG-Dateien aus', async () => {
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-grawn/portrait-sources.json', import.meta.url),
    'utf8'
  ));
  const localPortraitIds = Object.keys(HOUSE_GRAWN_PORTRAITS)
    .filter(personId => HOUSE_GRAWN_PORTRAITS[personId].startsWith('assets/images/portraits/haus-grawn/'));

  assert.equal(Object.keys(sourceManifest).length, 62);
  assert.equal(localPortraitIds.length, 62);
  assert.deepEqual(Object.keys(sourceManifest).sort(), localPortraitIds.sort());
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));

  await Promise.all(localPortraitIds.map(async personId => {
    const portrait = HOUSE_GRAWN_PORTRAITS[personId];
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `${portrait} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${portrait} muss ein JPEG sein.`);
  }));
});

test('ersetzt die Grawn-Leerakte im Familienregister durch den ausgearbeiteten Stammbaum', () => {
  const countyFamily = CENYR_COUNTY_HOUSE_FAMILIES.find(family => family.document.id === 'haus-grawn');
  const registryRecord = FAMILY_REGISTRY.find(record => record.id === 'haus-grawn');
  const loadedRecord = loadFamilyById('haus-grawn', createMemoryStorage());

  assert.equal(countyFamily, HOUSE_GRAWN_FAMILY);
  assert.ok(registryRecord);
  assert.equal(registryRecord.family, HOUSE_GRAWN_FAMILY);
  assert.equal(registryRecord.type, 'dynasty');
  assert.deepEqual(registryRecord.folderPath, ['Cenyr', 'Ährental', 'Glyndraith']);
  assert.notEqual(registryRecord.family.extensions.blankFamily, true);
  assert.equal(registryRecord.family.persons.length, 103);
  assert.equal(loadedRecord.family.persons.length, 103);
  assert.deepEqual(loadedRecord.folderPath, ['Cenyr', 'Ährental', 'Glyndraith']);

  const placeholderStorage = createMemoryStorage();
  const oldPlaceholder = createFounderPlaceholderHouseFamily({
    id: 'haus-grawn',
    title: 'Haus Grawn',
    emblem: HOUSE_GRAWN_FAMILY.document.emblem,
    houseProfile: HOUSE_GRAWN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: oldPlaceholder,
    id: 'haus-grawn',
    title: 'Haus Grawn',
    folderPath: ['Cenyr', 'Ährental', 'Glyndraith']
  }, placeholderStorage);
  const upgradedPlaceholder = loadFamilyById('haus-grawn', placeholderStorage);
  assert.equal(upgradedPlaceholder.source, 'registry');
  assert.equal(upgradedPlaceholder.family.persons.length, 103);
  assert.equal(upgradedPlaceholder.family.extensions.blankFamily, false);
});

test('bildet Haus Aderyn als eindeutigen verbundenen Stammbaum mit sechs strikt seriellen Zeitsprüngen ab', () => {
  const { family, diagnostics } = assertValidFamily(HOUSE_ADERYN_FAMILY);
  const graph = createFamilyGraph(family);
  const converted = toFamilyChartData(family);
  const chartById = new Map(converted.data.map(node => [node.id, node]));

  assert.equal(diagnostics.filter(item => item.severity === 'error').length, 0);
  assert.equal(family.persons.length, 141);
  assert.equal(family.partnerships.length, 62);
  assert.equal(family.parentages.length, 79);
  assert.equal(family.houses.length, 39);
  assert.equal(family.cadetBranches.length, 20);
  assert.equal(family.timeJumps.length, 6);
  assert.equal(family.document.id, 'haus-aderyn');
  assert.equal(family.document.title, "Haus Aderyn O'Penbryn");
  assert.equal(family.document.houseProfile.rankId, 'county');
  assert.equal(family.document.houseProfile.kingdom, 'Cenyr');
  assert.equal(family.document.houseProfile.county, 'Tal der Milane');
  assert.equal(family.document.houseProfile.barony, '');
  assert.equal(family.document.houseProfile.seat, 'Penbryn');
  assert.equal(family.document.houseProfile.regionEmblems.county, 'assets/images/regions/tal-der-milane.png');
  assert.equal(family.document.emblem, 'assets/images/houses/Tal der Milane/haus-aderyn.png');
  assert.equal(family.lineage.founderPartnershipId, 'marriage-yvain-fainche');
  assert.equal(family.lineage.crestSubtitle, 'Grafengeschlecht');
  assert.equal(family.lineage.crestFrame, 'gold');
  assert.equal(family.lineage.timeGap.enabled, false);
  assert.equal(family.view.focusPersonId, 'yvain-aderyn');
  assert.equal(family.extensions.sourceRevision, 1);

  const crest = converted.data.find(node => node.data.nodeKind === 'house-crest');
  assert.ok(crest, 'Der Haus-Aderyn-Knoten fehlt im Diagramm.');
  assert.deepEqual([...crest.rels.parents].sort(), ['fainche-gormard', 'yvain-aderyn']);
  assert.deepEqual([...crest.rels.children].sort(), ['aranrhod-aderyn', 'owain-aderyn']);

  const headSuccession = [
    'yvain-aderyn', 'owain-aderyn', 'brinthan-aderyn', 'kimball-aderyn',
    'talfryn-aderyn', 'ywen-aderyn', 'trevelyan-aderyn', 'gwalchgwyn-aderyn',
    'nodawl-aderyn', 'llwydawg-aderyn', 'anarawd-aderyn',
    'dungarth-aderyn', 'catel-aderyn', 'gareth-aderyn'
  ];
  headSuccession.forEach((personId, index) => {
    const person = family.persons.find(entry => entry.id === personId);
    assert.ok(person, `${personId} fehlt in der Aderyn-Oberhauptfolge.`);
    assert.equal(person.lineageRole, 'head', `${personId} sollte als Oberhaupt markiert sein.`);
    if (!index) return;
    assert.ok(
      graph.getDescendants(headSuccession[index - 1]).some(({ person: descendant }) => descendant.id === personId),
      `${personId} muss die serielle Hauptlinie nach ${headSuccession[index - 1]} fortsetzen.`
    );
  });
  assert.equal(family.persons.find(person => person.id === 'gareth-aderyn').title, 'Graf des Tals der Milane seit 1720');
  ['catwan-aderyn', 'cwgon-aderyn', 'arthen-aderyn'].forEach(personId => {
    const heir = family.persons.find(person => person.id === personId);
    assert.equal(heir.title, 'Erbe des Hauses Aderyn');
    assert.equal(heir.lineageRole, 'mainline');
  });

  const expectedTimeJumps = [
    ['gap-owain-brinthan', 'marriage-owain-uilean', ['brinthan-aderyn', 'gereint-aderyn']],
    ['gap-brinthan-kimball', 'marriage-brinthan-beileag', ['kimball-aderyn', 'mordred-aderyn']],
    ['gap-kimball-talfryn-generation', 'marriage-kimball-fonnait', ['lynette-aderyn', 'raewyn-aderyn', 'tiwlip-aderyn', 'talfryn-aderyn', 'agravaine-aderyn', 'gwynham-aderyn']],
    ['gap-talfryn-ywen', 'marriage-talfryn-sianwen', ['ywen-aderyn']],
    ['gap-gwalchgwyn-taran', 'marriage-gwalchgwyn-myfanwy', ['taran-ancient-aderyn', 'willow-aderyn']],
    ['gap-taran-nodawl', 'marriage-taran-glaodhaich', ['nodawl-aderyn', 'siors-aderyn', 'ceredig-aderyn', 'siriol-aderyn']]
  ];
  assert.deepEqual(
    family.timeJumps.map(gap => [gap.id, gap.parentPartnershipId, gap.childIds]),
    expectedTimeJumps
  );
  expectedTimeJumps.forEach(([gapId, partnershipId, childIds], index) => {
    const gap = family.timeJumps.find(item => item.id === gapId);
    const anchor = family.partnerships.find(item => item.id === partnershipId);
    const chartGap = chartById.get(`__time-jump-${gapId}`);
    assert.ok(gap && anchor && chartGap, `${gapId} braucht einen eindeutigen Paaranker und Diagrammknoten.`);
    assert.equal(gap.parentPersonId || '', '', `${gapId} darf kein paralleler Wurzeltrenner sein.`);

    const possibleStage = chartGap.rels.parents.length === 1
      ? chartById.get(chartGap.rels.parents[0])
      : null;
    const layoutStage = possibleStage?.data.nodeKind === 'time-jump-stage' ? possibleStage : null;
    const gateway = layoutStage || chartGap;
    if (layoutStage) {
      assert.deepEqual([...layoutStage.rels.parents].sort(), [...anchor.participantIds].sort());
      assert.deepEqual(layoutStage.rels.children, [chartGap.id]);
      assert.deepEqual(chartGap.rels.parents, [layoutStage.id]);
    } else {
      assert.deepEqual([...chartGap.rels.parents].sort(), [...anchor.participantIds].sort());
    }
    anchor.participantIds.forEach(personId => {
      assert.deepEqual(
        chartById.get(personId).rels.children,
        [gateway.id],
        `${gapId} muss unter seinem Paar der einzige Fortsetzungsweg sein.`
      );
    });
    assert.deepEqual([...chartGap.rels.children].sort(), [...childIds].sort());
    childIds.forEach(childId => {
      const parentage = family.parentages.find(entry => (
        entry.childId === childId && entry.partnershipId === partnershipId
      ));
      assert.ok(parentage, `${childId} fehlt die Abstammung am Zeitsprung ${gapId}.`);
      assert.equal(parentage.type, 'claimed');
      assert.equal(parentage.certainty, 'probable');
      assert.equal(parentage.extensions.timeJumpId, gapId);
      assert.deepEqual(chartById.get(childId).rels.parents, [chartGap.id]);
    });

    if (!index) return;
    const previousGap = family.timeJumps[index - 1];
    const previousLine = new Set(previousGap.childIds);
    previousGap.childIds.forEach(childId => {
      graph.getDescendants(childId).forEach(({ person }) => previousLine.add(person.id));
    });
    assert.ok(
      anchor.participantIds.some(personId => previousLine.has(personId)),
      `${gapId} muss genealogisch unter ${previousGap.id} liegen und darf nicht parallel beginnen.`
    );
  });

  const branchExpectations = [
    ['married-away-pendrag-rhiannon', 'marriage-vortigern-rhiannon'],
    ['married-away-grawn-aranrhod', 'marriage-iorwerth-aranrhod'],
    ['married-away-gaeth-lynette', 'marriage-gwendal-lynette'],
    ['married-away-hebog-raewyn', 'marriage-ivain-raewyn'],
    ['married-away-draig-tiwlip', 'marriage-gruffyd-tiwlip'],
    ['married-away-gaeth-gwenhwyfar', 'marriage-geraint-gwenhwyfar'],
    ['married-away-eryr-siriol', 'marriage-eiddyl-siriol'],
    ['married-away-arth-arglwyddes', 'marriage-gwalchgwyn-arglwyddes'],
    ['married-away-conochbhair-gwydolwyn', 'marriage-colman-gwydolwyn'],
    ['married-away-pysgod-ellanah', 'marriage-hefin-ellanah'],
    ['married-away-grawn-rhosyn', 'marriage-maelgwyn-rhosyn'],
    ['married-away-feuerhaar-heledd', 'marriage-odin-heledd'],
    ['married-away-creyr-myf', 'marriage-armel-myf'],
    ['married-away-hebog-tesni', 'marriage-thalen-tesni'],
    ['married-away-neidr-carwyn', 'marriage-cynan-carwyn'],
    ['married-away-gaeth-thalena', 'marriage-slevin-thalena'],
    ['married-away-draig-gwendolyn', 'marriage-galahad-gwendolyn'],
    ['married-away-tir-addawol-venora', 'marriage-merryn-venora'],
    ['married-away-mwyalchen-rheanne', 'marriage-sheev-rheanne'],
    ['married-away-gwyvern-jeannae', 'marriage-mervyn-jeannae']
  ];
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'cadet-house').length, 0);
  assert.equal(family.cadetBranches.filter(branch => branch.linkType === 'married-away').length, 20);
  branchExpectations.forEach(([branchId, partnershipId]) => {
    const branch = family.cadetBranches.find(item => item.id === branchId);
    const partnership = family.partnerships.find(item => item.id === partnershipId);
    const chartBranch = chartById.get(`__cadet-${branchId}`) || chartById.get(`__line-end-${branchId}`);
    assert.ok(branch && partnership && chartBranch, `${branchId} muss als Hausverknotung existieren.`);
    assert.equal(branch.parentPartnershipId, partnershipId);
    assert.equal(branch.linkType, 'married-away');
    assert.deepEqual([...chartBranch.rels.parents].sort(), [...partnership.participantIds].sort());
  });
  ['engagement-catwan-aysha', 'engagement-dilys-leolin', 'engagement-wula-marvin'].forEach(partnershipId => {
    assert.equal(
      family.cadetBranches.some(branch => branch.parentPartnershipId === partnershipId),
      false,
      `${partnershipId} darf noch keine Wegverheiratungs-Verknüpfung erzeugen.`
    );
  });

  assert.equal(family.persons.filter(person => person.id === 'cadwallon-aderyn').length, 1);
  assert.equal(family.persons.filter(person => person.id === 'thivya-aderyn').length, 1);
  assert.equal(family.partnerships.filter(item => item.id === 'marriage-cadwallon-thivya').length, 1);
  assert.deepEqual(
    family.parentages
      .filter(item => item.partnershipId === 'marriage-cadwallon-thivya')
      .map(item => item.childId),
    ['selwyn-aderyn', 'rheanne-aderyn']
  );

  const personIds = family.persons.map(person => person.id);
  const chartIds = converted.data.map(node => node.id);
  const parentageChildIds = family.parentages.map(parentage => parentage.childId);
  assert.equal(new Set(personIds).size, personIds.length, 'Keine Aderyn-Person darf doppelt angelegt sein.');
  assert.equal(new Set(chartIds).size, chartIds.length, 'Auch virtuelle Diagrammknoten brauchen eindeutige IDs.');
  assert.equal(new Set(parentageChildIds).size, parentageChildIds.length, 'Eine Person darf nicht durch doppelte Abstammungszeilen vervielfacht werden.');
  assert.deepEqual(
    converted.data.filter(node => node.data.nodeKind === 'person').map(node => node.id).sort(),
    [...personIds].sort()
  );
  family.parentages.forEach(parentage => assert.ok(parentage.parentIds.length <= 2));
  converted.data.forEach(node => assert.ok(node.rels.parents.length <= 2, `${node.id} besitzt mehr als zwei Diagrammeltern.`));

  const visited = new Set([converted.data[0].id]);
  const pending = [converted.data[0].id];
  while (pending.length) {
    const current = chartById.get(pending.shift());
    [...current.rels.parents, ...current.rels.spouses, ...current.rels.children].forEach(relativeId => {
      if (!chartById.has(relativeId) || visited.has(relativeId)) return;
      visited.add(relativeId);
      pending.push(relativeId);
    });
  }
  assert.equal(visited.size, converted.data.length, 'Der Aderyn-Chart muss ein einziger verbundener Graph bleiben.');
});

test('hält Aderyn-Weltpersonen, Beziehungen, Portraits und Wappen in allen Gegenstammbäumen synchron', () => {
  const aderyn = assertValidFamily(HOUSE_ADERYN_FAMILY).family;
  const linkedPartnerships = [
    ['marriage-vortigern-rhiannon', HOUSE_DRAIG_FAMILY],
    ['marriage-vortigern-rhiannon', HOUSE_PENDRAG_FAMILY],
    ['marriage-gruffyd-tiwlip', HOUSE_DRAIG_FAMILY],
    ['marriage-galahad-gwendolyn', HOUSE_DRAIG_FAMILY],
    ['marriage-braith-carnedyr', HOUSE_GAFYR_FAMILY],
    ['marriage-bronwyn-grufydd', HOUSE_GAFYR_FAMILY],
    ['marriage-iorwerth-aranrhod', HOUSE_GRAWN_FAMILY],
    ['marriage-maelgwyn-rhosyn', HOUSE_GRAWN_FAMILY],
    ['marriage-mervyn-jeannae', HOUSE_GWYVERN_FAMILY],
    ['marriage-ffion-trevelyan', HOUSE_ILLEWOD_FAMILY],
    ['marriage-mifawi-catel', HOUSE_ILLEWOD_FAMILY],
    ['marriage-cynan-carwyn', HOUSE_NEIDR_FAMILY],
    ['marriage-caradwyn-dungarth', HOUSE_PENDRAG_FAMILY]
  ];

  linkedPartnerships.forEach(([partnershipId, otherInput]) => {
    const otherFamily = assertValidFamily(otherInput).family;
    const here = aderyn.partnerships.find(item => item.id === partnershipId);
    const there = otherFamily.partnerships.find(item => item.id === partnershipId);
    assert.ok(here && there, `${partnershipId} muss in beiden betroffenen Stammbäumen vorkommen.`);
    assert.deepEqual([...here.participantIds].sort(), [...there.participantIds].sort());
    assert.equal(here.type, there.type);
    here.participantIds.forEach(personId => {
      const herePerson = aderyn.persons.find(person => person.id === personId);
      const therePerson = otherFamily.persons.find(person => person.id === personId);
      assert.ok(herePerson && therePerson, `${personId} fehlt auf einer Seite von ${partnershipId}.`);
      assert.equal(herePerson.worldPersonId, therePerson.worldPersonId);
      assert.equal(herePerson.portrait, therePerson.portrait, `${personId} darf kein abweichendes Portrait erhalten.`);
    });
  });

  const aderynEmblem = HOUSE_ADERYN_FAMILY.document.emblem;
  [
    HOUSE_DRAIG_FAMILY,
    HOUSE_GAFYR_FAMILY,
    HOUSE_GRAWN_FAMILY,
    HOUSE_GWYVERN_FAMILY,
    HOUSE_ILLEWOD_FAMILY,
    HOUSE_NEIDR_FAMILY,
    HOUSE_PENDRAG_FAMILY
  ].forEach(otherFamily => {
    const aderynHouse = otherFamily.houses.find(house => house.id === 'house-aderyn');
    assert.ok(aderynHouse, `${otherFamily.document.id} braucht den Haus-Aderyn-Datensatz.`);
    assert.equal(aderynHouse.emblem, aderynEmblem, `${otherFamily.document.id} verwendet das falsche Aderyn-Wappen.`);
  });
  [
    [HOUSE_GAFYR_FAMILY, 'married-away-aderyn-braith'],
    [HOUSE_GAFYR_FAMILY, 'married-away-aderyn-bronwyn'],
    [HOUSE_ILLEWOD_FAMILY, 'married-away-aderyn-ffion'],
    [HOUSE_ILLEWOD_FAMILY, 'married-away-aderyn-mifawi'],
    [HOUSE_PENDRAG_FAMILY, 'married-away-aderyn-caradwyn']
  ].forEach(([otherFamily, branchId]) => {
    assert.equal(otherFamily.cadetBranches.find(branch => branch.id === branchId)?.emblem, aderynEmblem);
  });
});

test('führt 73 individuelle Aderyn-Portraitquellen ohne generische Silhouetten und nur auslieferbare Portraitpfade', async () => {
  const sourceManifest = JSON.parse(await readFile(
    new URL('../assets/images/portraits/haus-aderyn/portrait-sources.json', import.meta.url),
    'utf8'
  ));

  assert.equal(Object.keys(sourceManifest).length, 73);
  assert.equal(new Set(Object.values(sourceManifest)).size, 73);
  assert.ok(Object.values(sourceManifest).every(source => /^https:\/\//.test(source)));
  assert.ok(Object.values(sourceManifest).every(source => !/7yB9PR6|51CghpL/.test(source)));
  Object.keys(sourceManifest).forEach(personId => {
    assert.ok(HOUSE_ADERYN_FAMILY.persons.some(person => person.id === personId), `${personId} aus dem Portraitkatalog fehlt im Stammbaum.`);
  });

  await Promise.all(Object.entries(HOUSE_ADERYN_PORTRAITS).map(async ([personId, portrait]) => {
    assert.ok(HOUSE_ADERYN_FAMILY.persons.some(person => person.id === personId));
    assert.ok(!portrait.startsWith('assets/images/portraits/haus-aderyn/'), `${portrait} darf erst nach dem Einchecken aktiviert werden.`);
    const image = await readFile(new URL(`../${portrait}`, import.meta.url));
    assert.ok(image.length > 100, `${portrait} ist leer.`);
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${portrait} muss ein vorhandenes JPEG sein.`);
    assert.equal(HOUSE_ADERYN_FAMILY.persons.find(person => person.id === personId).portrait, portrait);
  }));
});

test('ersetzt die Aderyn-Leerakte und aktualisiert einen älteren lokalen Aderyn-Stand ohne Duplikate', () => {
  const countyFamily = CENYR_COUNTY_HOUSE_FAMILIES.find(family => family.document.id === 'haus-aderyn');
  const registryRecord = FAMILY_REGISTRY.find(record => record.id === 'haus-aderyn');
  const loadedRecord = loadFamilyById('haus-aderyn', createMemoryStorage());
  const folderPath = ['Cenyr', 'Tal der Milane', 'Penbryn'];

  assert.equal(countyFamily, HOUSE_ADERYN_FAMILY);
  assert.ok(registryRecord);
  assert.equal(registryRecord.family, HOUSE_ADERYN_FAMILY);
  assert.equal(registryRecord.type, 'dynasty');
  assert.deepEqual(registryRecord.folderPath, folderPath);
  assert.notEqual(registryRecord.family.extensions.blankFamily, true);
  assert.equal(registryRecord.family.persons.length, 141);
  assert.equal(loadedRecord.family.persons.length, 141);
  assert.deepEqual(loadedRecord.folderPath, folderPath);

  const placeholderStorage = createMemoryStorage();
  const oldPlaceholder = createFounderPlaceholderHouseFamily({
    id: 'haus-aderyn',
    title: "Haus Aderyn O'Penbryn",
    emblem: HOUSE_ADERYN_FAMILY.document.emblem,
    houseProfile: HOUSE_ADERYN_FAMILY.document.houseProfile
  });
  saveFamilyToLibrary({
    family: oldPlaceholder,
    id: 'haus-aderyn',
    title: "Haus Aderyn O'Penbryn",
    folderPath
  }, placeholderStorage);
  const upgradedPlaceholder = loadFamilyById('haus-aderyn', placeholderStorage);
  assert.equal(upgradedPlaceholder.source, 'registry');
  assert.equal(upgradedPlaceholder.family.persons.length, 141);
  assert.equal(upgradedPlaceholder.family.extensions.blankFamily, false);

  const revisionStorage = createMemoryStorage();
  const olderLocalFamily = normalizeFamily({
    ...HOUSE_ADERYN_FAMILY,
    persons: HOUSE_ADERYN_FAMILY.persons.map(person => (
      person.id === 'gareth-aderyn' ? { ...person, notes: 'Lokale Chroniknotiz' } : person
    )),
    cadetBranches: HOUSE_ADERYN_FAMILY.cadetBranches.filter(branch => branch.id !== 'married-away-gwyvern-jeannae'),
    extensions: { ...HOUSE_ADERYN_FAMILY.extensions, sourceRevision: 0 }
  });
  saveFamilyToLibrary({
    family: olderLocalFamily,
    id: 'haus-aderyn',
    title: "Haus Aderyn O'Penbryn",
    folderPath
  }, revisionStorage);
  const upgradedRevision = loadFamilyById('haus-aderyn', revisionStorage);
  assert.equal(upgradedRevision.source, 'registry-upgrade');
  assert.equal(upgradedRevision.family.extensions.sourceRevision, 1);
  assert.deepEqual(upgradedRevision.family.extensions.registryUpgrade, { fromRevision: 0, toRevision: 1 });
  assert.equal(upgradedRevision.family.persons.length, 141);
  assert.equal(new Set(upgradedRevision.family.persons.map(person => person.id)).size, 141);
  assert.equal(upgradedRevision.family.cadetBranches.length, 20);
  assert.ok(upgradedRevision.family.cadetBranches.some(branch => branch.id === 'married-away-gwyvern-jeannae'));
  assert.equal(upgradedRevision.family.persons.find(person => person.id === 'gareth-aderyn').notes, 'Lokale Chroniknotiz');
  assert.doesNotThrow(() => assertValidFamily(upgradedRevision.family));
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
    // Nur ausdrücklich als Leerakte markierte Familien haben noch das Platzhalterpaar;
    // ausgearbeitete Häuser werden ohne wachsende Ausnahmeliste erkannt.
    if (family.extensions.blankFamily === true) {
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

test('bietet am Stammwappen und an Zeitsprüngen nur fachlich zulässige Knotenaktionen an', () => {
  assert.deepEqual(primaryNodeActions('house-crest').map(action => action.id), ['edit-house', 'continue-house']);
  assert.deepEqual(primaryNodeActions('time-jump').map(action => action.id), ['edit-gap', 'add-after-gap']);
  assert.deepEqual(primaryNodeActions('cadet-house'), []);

  const withoutGap = normalizeFamily({
    ...SAMPLE_FAMILY,
    lineage: { ...SAMPLE_FAMILY.lineage, timeGap: { ...SAMPLE_FAMILY.lineage.timeGap, enabled: false } },
    timeJumps: []
  });
  assert.equal(findLineageBarrier(withoutGap), null);
  assert.deepEqual(
    houseContinuationActions(withoutGap, withoutGap.lineage.founderPartnershipId).map(action => action.id),
    ['add-direct', 'add-gap', 'back']
  );

  const withGap = normalizeFamily({
    ...withoutGap,
    lineage: { ...withoutGap.lineage, timeGap: { ...withoutGap.lineage.timeGap, enabled: true } }
  });
  assert.equal(findLineageBarrier(withGap).kind, 'lineage-gap');
  assert.deepEqual(
    houseContinuationActions(withGap, withGap.lineage.founderPartnershipId).map(action => action.id),
    ['add-after-gap', 'edit-gap', 'back']
  );

  const withFounderPersonGap = normalizeFamily({
    ...withoutGap,
    timeJumps: [{
      id: 'founder-person-gap', parentPartnershipId: '', parentPersonId: 'aeron-vael', childIds: [],
      years: 20, fromYear: '1250', toYear: '1270', label: 'Gründer-Sprung', notes: '', extensions: {}
    }]
  });
  assert.deepEqual(findLineageBarrier(withFounderPersonGap), { kind: 'time-jump', id: 'founder-person-gap' });
  assert.deepEqual(
    houseContinuationActions(withFounderPersonGap, withFounderPersonGap.lineage.founderPartnershipId).map(action => action.id),
    ['add-after-gap', 'edit-gap', 'back']
  );

  const withDisjointGenerationGap = normalizeFamily({
    ...withoutGap,
    persons: [
      ...withoutGap.persons,
      { id: 'andere-wurzel', name: 'Andere Wurzel', sex: 'unknown', status: 'unknown' }
    ],
    timeJumps: [{
      id: 'global-root-gap', parentPartnershipId: '', parentPersonId: 'andere-wurzel', childIds: [],
      years: 10, fromYear: '1200', toYear: '1210', label: 'Globaler Trenner', notes: '', extensions: {}
    }]
  });
  assert.deepEqual(findLineageBarrier(withDisjointGenerationGap), { kind: 'time-jump', id: 'global-root-gap' });
  assert.deepEqual(
    houseContinuationActions(withDisjointGenerationGap, withDisjointGenerationGap.lineage.founderPartnershipId).map(action => action.id),
    ['add-after-gap', 'edit-gap', 'back'],
    'Das Hausmenü darf keinen zweiten Trenner derselben globalen Generation anbieten.'
  );
});

test('verwaltet den Zeitsprung unter dem Stammwappen getrennt von den Hausdaten', () => {
  const store = createFamilyStore(SAMPLE_FAMILY);
  const title = store.getState().family.document.title;
  store.setLineageTimeGap({ enabled: true, fromYear: '1200', toYear: '1700', years: 500, label: 'Fünf Jahrhunderte später' });
  let family = store.getState().family;
  assert.equal(family.lineage.timeGap.enabled, true);
  assert.equal(family.lineage.timeGap.years, 500);
  assert.equal(family.document.title, title);
  store.setLineageTimeGap({ enabled: false });
  family = store.getState().family;
  assert.equal(family.lineage.timeGap.enabled, false);
});

test('ersetzt Idwals markierte Platzhalter-Verlobung statt eine zweite aktive Verbindung anzulegen', () => {
  const tegwen = HOUSE_GWYVERN_FAMILY.persons.find(person => person.id === 'tegwen-gwyvern');
  const imported = buildImportedPersonValues(HOUSE_GWYVERN_FAMILY, tegwen, {
    targetFamily: HOUSE_DRAIG_FAMILY,
    familyRole: 'married'
  });
  const draigWithTegwen = normalizeFamily({
    ...HOUSE_DRAIG_FAMILY,
    persons: [...HOUSE_DRAIG_FAMILY.persons, imported],
    houses: HOUSE_DRAIG_FAMILY.houses.some(house => house.id === tegwen.houseId)
      ? HOUSE_DRAIG_FAMILY.houses
      : [...HOUSE_DRAIG_FAMILY.houses, HOUSE_GWYVERN_FAMILY.houses.find(house => house.id === tegwen.houseId)]
  });
  const result = applyExclusivePartnershipChange(draigWithTegwen, {
    participantIds: ['idwal-draig', imported.id],
    type: 'engagement',
    status: 'active',
    certainty: 'confirmed',
    visibility: 'public'
  });
  const activeIdwalEngagements = result.family.partnerships.filter(partnership => (
    partnership.participantIds.includes('idwal-draig')
      && partnership.type === 'engagement'
      && partnership.status === 'active'
  ));
  assert.equal(result.plan.mode, 'replace-placeholder');
  assert.equal(activeIdwalEngagements.length, 1);
  assert.ok(activeIdwalEngagements[0].participantIds.includes(imported.id));
  assert.equal(result.family.persons.some(person => person.id === 'unknown-idwal-betrothed'), false);
  assert.ok(result.family.extensions.registryTombstones.persons.includes('unknown-idwal-betrothed'));
  assert.throws(() => planExclusivePartnershipChange(result.family, {
    participantIds: ['idwal-draig', 'isobel-1719-draig'],
    type: 'engagement'
  }), /aktive Verbindung/);
});

test('behält beim Platzhaltertausch strukturelle Verweise und die bestehende Partnerschafts-ID', () => {
  const tegwen = HOUSE_GWYVERN_FAMILY.persons.find(person => person.id === 'tegwen-gwyvern');
  const imported = buildImportedPersonValues(HOUSE_GWYVERN_FAMILY, tegwen, {
    targetFamily: HOUSE_DRAIG_FAMILY,
    familyRole: 'married'
  });
  const idwal = HOUSE_DRAIG_FAMILY.persons.find(person => person.id === 'idwal-draig');
  const testChild = {
    ...idwal,
    id: 'idwal-placeholder-test-child',
    worldPersonId: 'person--test--idwal-placeholder-child',
    name: 'Kind der Platzhalterverbindung',
    birth: '1740',
    extensions: {}
  };
  const structuralFamily = normalizeFamily({
    ...HOUSE_DRAIG_FAMILY,
    persons: [...HOUSE_DRAIG_FAMILY.persons, imported, testChild],
    houses: HOUSE_DRAIG_FAMILY.houses.some(house => house.id === tegwen.houseId)
      ? HOUSE_DRAIG_FAMILY.houses
      : [...HOUSE_DRAIG_FAMILY.houses, HOUSE_GWYVERN_FAMILY.houses.find(house => house.id === tegwen.houseId)],
    parentages: [...HOUSE_DRAIG_FAMILY.parentages, {
      id: 'parentage-idwal-placeholder-test',
      childId: testChild.id,
      parentIds: ['idwal-draig', 'unknown-idwal-betrothed'],
      partnershipId: 'engagement-idwal-unknown',
      type: 'claimed', legitimacy: 'unknown', certainty: 'probable', visibility: 'public', notes: '', extensions: {}
    }],
    timeJumps: [...HOUSE_DRAIG_FAMILY.timeJumps, {
      id: 'time-jump-idwal-placeholder-test',
      parentPartnershipId: 'engagement-idwal-unknown', parentPersonId: '', childIds: [testChild.id],
      years: 1, fromYear: '1739', toYear: '1740', label: 'Testbarriere', notes: '', extensions: {}
    }],
    cadetBranches: [...HOUSE_DRAIG_FAMILY.cadetBranches, {
      ...HOUSE_DRAIG_FAMILY.cadetBranches[0],
      id: 'cadet-idwal-placeholder-test',
      parentPartnershipId: 'engagement-idwal-unknown'
    }]
  });
  const result = applyExclusivePartnershipChange(structuralFamily, {
    participantIds: ['idwal-draig', imported.id],
    type: 'engagement', status: 'active', certainty: 'confirmed', visibility: 'public'
  });

  const partnership = result.family.partnerships.find(item => item.id === 'engagement-idwal-unknown');
  assert.deepEqual([...partnership.participantIds].sort(), ['idwal-draig', imported.id].sort());
  assert.equal(result.plan.partnershipId, partnership.id);
  assert.equal(result.family.cadetBranches.find(item => item.id === 'cadet-idwal-placeholder-test').parentPartnershipId, partnership.id);
  assert.equal(result.family.timeJumps.find(item => item.id === 'time-jump-idwal-placeholder-test').parentPartnershipId, partnership.id);
  const parentage = result.family.parentages.find(item => item.id === 'parentage-idwal-placeholder-test');
  assert.equal(parentage.partnershipId, partnership.id);
  assert.deepEqual([...parentage.parentIds].sort(), ['idwal-draig', imported.id].sort());
  assert.equal(result.family.persons.some(person => person.id === 'unknown-idwal-betrothed'), false);
  assertValidFamily(result.family);
});

test('blockiert die Hochstufung einer Verlobung bei einer weiteren realen aktiven Verbindung', () => {
  const inconsistent = normalizeFamily({
    ...SAMPLE_FAMILY,
    partnerships: [...SAMPLE_FAMILY.partnerships, {
      id: 'engagement-cassian-isolde',
      participantIds: ['cassian-vael', 'isolde-marr'],
      type: 'engagement', status: 'active', start: '', end: '',
      certainty: 'confirmed', visibility: 'public', notes: '', extensions: {}
    }]
  });
  assert.throws(() => planExclusivePartnershipChange(inconsistent, {
    participantIds: ['cassian-vael', 'isolde-marr'],
    type: 'marriage'
  }), /andere aktive/);
});

test('spiegelt eine neue Register-Verlobung mit gemeinsamer Weltidentität in beide Familienakten', () => {
  const change = createMirroredPartnershipChange({
    currentFamily: HOUSE_DRAIG_FAMILY,
    counterpartFamily: HOUSE_GWYVERN_FAMILY,
    currentPersonId: 'idwal-draig',
    counterpartPersonId: 'tegwen-gwyvern',
    type: 'engagement'
  });
  const sourceIdwal = HOUSE_DRAIG_FAMILY.persons.find(person => person.id === 'idwal-draig');
  const sourceTegwen = HOUSE_GWYVERN_FAMILY.persons.find(person => person.id === 'tegwen-gwyvern');
  const draigTegwen = change.currentFamily.persons.find(person => person.worldPersonId === sourceTegwen.worldPersonId);
  const gwyvernIdwal = change.counterpartFamily.persons.find(person => person.worldPersonId === sourceIdwal.worldPersonId);
  assert.ok(draigTegwen);
  assert.ok(gwyvernIdwal);
  assert.equal(change.currentFamily.partnerships.filter(partnership => (
    partnership.status === 'active' && partnership.participantIds.includes('idwal-draig')
  )).length, 1);
  assert.ok(change.counterpartFamily.partnerships.some(partnership => (
    partnership.type === 'engagement'
      && partnership.participantIds.includes('tegwen-gwyvern')
      && partnership.participantIds.includes(gwyvernIdwal.id)
      && partnership.extensions.crossFamilyRelationship.linkId === change.linkId
  )));

  const currentPartnership = change.currentFamily.partnerships.find(partnership => (
    partnership.extensions.crossFamilyRelationship?.linkId === change.linkId
  ));
  const counterpartPartnership = change.counterpartFamily.partnerships.find(partnership => (
    partnership.extensions.crossFamilyRelationship?.linkId === change.linkId
  ));
  const upgraded = updateMirroredPartnershipChange({
    currentFamily: change.currentFamily,
    counterpartFamily: change.counterpartFamily,
    partnershipId: currentPartnership.id,
    values: { type: 'marriage', status: 'active', start: '1740', end: '' }
  });
  [upgraded.currentFamily, upgraded.counterpartFamily].forEach(family => {
    const partnership = family.partnerships.find(item => item.extensions.crossFamilyRelationship?.linkId === change.linkId);
    assert.equal(partnership.type, 'marriage');
    assert.equal(partnership.start, '1740');
    assert.equal(partnership.extensions.crossFamilyRelationship.linkId, change.linkId);
  });
  assert.deepEqual(
    upgraded.currentFamily.partnerships.find(item => item.id === currentPartnership.id).participantIds,
    currentPartnership.participantIds
  );
  assert.deepEqual(
    upgraded.counterpartFamily.partnerships.find(item => item.id === counterpartPartnership.id).participantIds,
    counterpartPartnership.participantIds
  );
  const dissolved = updateMirroredPartnershipChange({
    currentFamily: upgraded.currentFamily,
    counterpartFamily: upgraded.counterpartFamily,
    partnershipId: currentPartnership.id,
    values: { status: 'divorced', end: '1740' }
  });
  assert.ok([dissolved.currentFamily, dissolved.counterpartFamily].every(family => (
    family.partnerships.find(item => item.extensions.crossFamilyRelationship?.linkId === change.linkId).status === 'divorced'
  )));
  assert.throws(() => updateMirroredPartnershipChange({
    currentFamily: change.currentFamily,
    counterpartFamily: SAMPLE_FAMILY,
    partnershipId: currentPartnership.id,
    values: { status: 'ended' }
  }), /passt nicht/);

  const synchronizedStore = createFamilyStore(HOUSE_DRAIG_FAMILY);
  synchronizedStore.updatePerson('idwal-draig', { notes: 'Lokale Änderung vor der Spiegelung' });
  assert.equal(synchronizedStore.getState().canUndo, true);
  synchronizedStore.synchronizeFamily(change.currentFamily, { source: 'cross-family-test' });
  assert.equal(synchronizedStore.getState().canUndo, false, 'Eine Zwei-Akten-Transaktion darf nicht einseitig lokal rückgängig werden.');

  const storage = createMemoryStorage();
  saveFamilyRecordsAtomically([
    { id: 'haus-draig', title: 'Haus Draig', folderPath: ['Cenyr'], family: change.currentFamily },
    { id: 'haus-gwyvern', title: 'Haus Gwyvern', folderPath: ['Cenyr'], family: change.counterpartFamily }
  ], storage);
  const reloadedDraig = loadFamilyById('haus-draig', storage).family;
  assert.equal(reloadedDraig.persons.some(person => person.id === 'unknown-idwal-betrothed'), false, 'Registry-Upgrades dürfen den ersetzten Platzhalter nicht wiederherstellen.');
  assert.ok(loadFamilyById('haus-gwyvern', storage).family.persons.some(person => person.worldPersonId === sourceIdwal.worldPersonId));
});

test('verknüpft Zielhaus-Wappenknoten nur mit ausdrücklich gewählten Ehe- oder Lebenslinien', () => {
  const family = {
    partnerships: [
      { id: 'alte-affaere', participantIds: ['person-a', 'person-b'], type: 'affair', status: 'ended', start: '1700' },
      { id: 'alte-ehe', participantIds: ['person-a', 'person-c'], type: 'marriage', status: 'divorced', start: '1710' },
      { id: 'aktuelle-union', participantIds: ['person-a', 'person-d'], type: 'union', status: 'active', start: '1730' }
    ]
  };
  assert.deepEqual(
    listLineagePartnerships(family, 'person-a').map(partnership => partnership.id),
    ['aktuelle-union', 'alte-ehe']
  );
  assert.deepEqual(listLineagePartnerships(family, 'person-b'), []);
});

test('zeigt im Generator nur wirksame Regeln und behandelt den eingegebenen zweiten Menschen selbst als Zwilling', () => {
  const ids = GENERATION_PARAMETER_DEFINITIONS.map(definition => definition.id);
  assert.equal(ids.includes('allowAffairs'), false);
  assert.equal(ids.includes('timeJumpAfterGeneration'), false);
  assert.ok(ids.includes('autoGenerateNames'));
  const params = normalizeGenerationParams({ minChildren: 5, maxChildren: 2, usePlaceholders: true });
  assert.equal(params.minChildren, 5);
  assert.equal(params.maxChildren, 5);
  const referencePerson = SAMPLE_FAMILY.persons[0];
  const twin = prepareGeneratedChild({
    family: SAMPLE_FAMILY,
    referencePerson,
    input: { name: 'Rhiannon', sex: 'female', birth: '1705', twin: true, agingKind: 'normal' },
    params,
    previousChild: { name: 'Rhodri', birth: '1702', referencePersonId: referencePerson.id }
  });
  assert.equal(twin.name, 'Rhiannon');
  assert.equal(twin.birth, '1702');
  assert.deepEqual(twin.tags, ['Zwilling von Rhodri']);
});

test('verwirft lokalen Generatorzustand auch beim nativen Schließen mit Escape', () => {
  const nativeDialog = new EventTarget();
  nativeDialog.open = false;
  nativeDialog.showModal = () => { nativeDialog.open = true; };
  nativeDialog.close = () => {
    nativeDialog.open = false;
    nativeDialog.dispatchEvent(new Event('close'));
  };
  const elements = new Map([
    ['tree-generator-dialog', nativeDialog],
    ['tree-generator-form', new EventTarget()],
    ['tree-generator-title', {}],
    ['tree-generator-steps', {}],
    ['tree-generator-body', {}],
    ['tree-generator-footer', {}]
  ]);
  const dialog = createTreeGeneratorDialog({ getElementById: id => elements.get(id) });

  dialog.open();
  dialog.setLastAddedChild({ name: 'Altes Kind', referencePersonId: 'alte-linie' });
  assert.equal(dialog.getLastAddedChild().name, 'Altes Kind');
  nativeDialog.close();
  assert.equal(dialog.getLastAddedChild(), null);

  dialog.open();
  assert.equal(dialog.getLastAddedChild(), null);
});

test('kann den Generator gezielt an einem vorhandenen Zeitsprung fortsetzen', () => {
  const timeJump = HOUSE_ILLEWOD_FAMILY.timeJumps[0];
  const phase = deriveFocusedContinuationPhase(HOUSE_ILLEWOD_FAMILY, { timeJumpId: timeJump.id });
  assert.equal(phase.phase, 4);
  assert.equal(phase.focusedContinuation, true);
  assert.equal(phase.continuationKind, 'time-jump');
  assert.equal(phase.openLeaves[0].unresolvedTimeJumpId, timeJump.id);
  assert.deepEqual([...phase.existingContinuationIds].sort(), [...timeJump.childIds].sort());
});

test('führt Nachkommen hinter dem Haus-Zeitsprung als beanspruchte Linie statt als direkte biologische Kinder', () => {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Zeitenwacht' });
  const founded = commitFounderCouple(draft, {
    founderManName: 'Aeron Zeitenwacht',
    founderWomanName: 'Lyria Zeitenwacht'
  });
  const family = normalizeFamily({
    ...founded,
    lineage: {
      ...founded.lineage,
      timeGap: { enabled: true, years: 300, fromYear: '1200', toYear: '1500', label: 'Drei Jahrhunderte später' }
    }
  });
  const phase = deriveFocusedContinuationPhase(family, { partnershipId: family.lineage.founderPartnershipId });
  assert.equal(phase.continuationKind, 'lineage-gap');
  assert.equal(phase.openLeaves[0].afterTimeBarrier, true);

  const store = createFamilyStore(family);
  const founderId = family.partnerships
    .find(partnership => partnership.id === family.lineage.founderPartnershipId).participantIds[0];
  const personId = store.addRelatedPerson(founderId, {
    name: 'Später Nachkomme', sex: 'unknown', status: 'unknown', birth: '1500', death: '', portrait: '',
    portraitPlaceholder: 'auto', houseId: family.lineage.houseId, familyRole: 'core', notes: ''
  }, {
    relationKind: 'lineage-gap-child',
    parentageType: 'claimed',
    legitimacy: 'unknown',
    certainty: 'probable',
    visibility: 'public'
  });
  const parentage = store.getState().family.parentages.find(item => item.childId === personId);
  assert.equal(parentage.type, 'claimed');
  assert.equal(parentage.certainty, 'probable');
  assert.deepEqual(parentage.extensions, { lineageTimeGap: true });
});

function automaticTemplateFounderFamily(overrides = {}) {
  const draft = createFamilyProfileDraft({ documentTitle: 'Haus Saatenwind' });
  return commitFounderCouple(draft, {
    founderManName: 'Aeron Saatenwind',
    founderManBirth: '1600',
    founderWomanName: 'Lyria Saatenwind',
    founderWomanBirth: '1602',
    marriageYear: '1624',
    ...overrides
  });
}

test('automatische Familienvorlagen bieten exakt kompakt, ausgewogen und groß an', () => {
  assert.deepEqual(
    FAMILY_TEMPLATE_DEFINITIONS.map(template => template.id),
    ['compact', 'balanced', 'large']
  );
  assert.equal(AUTOMATIC_TEMPLATE_GENERATION_LIMITS.minimumGenerations, 1);
  assert.equal(normalizeAutomaticTemplateOptions({ generationCount: 0 }).generationCount, 1);
  assert.equal(
    normalizeAutomaticTemplateOptions({ generationCount: 99 }).generationCount,
    AUTOMATIC_TEMPLATE_GENERATION_LIMITS.maximumGenerations
  );
  assert.equal(normalizeAutomaticTemplateOptions({ templateId: 'unbekannt' }).templateId, 'balanced');
});

test('seedbarer Vorlagengenerator ist rein, reproduzierbar und erzeugt drei verschieden breite Topologien', () => {
  const base = automaticTemplateFounderFamily();
  const before = structuredClone(base);
  const sharedOptions = {
    generationCount: 4,
    seed: 'saatenwind-fest',
    params: {
      minChildren: 1,
      maxChildren: 6,
      autoGenerateNames: true,
      autoCalculateDeath: true,
      allowTwins: true,
      allowAdoption: true,
      allowBastards: true
    }
  };
  const first = generateAutomaticFamilyTemplate(base, { ...sharedOptions, templateId: 'balanced' });
  const repeated = generateAutomaticFamilyTemplate(base, { ...sharedOptions, templateId: 'balanced' });
  assert.deepEqual(first.family, repeated.family);
  assert.deepEqual(base, before, 'die reine Generierung darf die Gründerakte nicht verändern');
  assert.equal(first.summary.generationCount, 4);
  assert.equal(createFamilyGraph(first.family).getGenerationCount(), 4);
  assert.doesNotThrow(() => assertValidFamily(first.family));

  const sizes = Object.fromEntries(['compact', 'balanced', 'large'].map(templateId => [
    templateId,
    generateAutomaticFamilyTemplate(base, { ...sharedOptions, templateId }).family.persons.length
  ]));
  assert.ok(sizes.compact < sizes.balanced, `${sizes.compact} sollte kleiner als ${sizes.balanced} sein`);
  assert.ok(sizes.balanced < sizes.large, `${sizes.balanced} sollte kleiner als ${sizes.large} sein`);

  const firstSequence = Array.from({ length: 6 }, createTemplateRandom('gleicher-seed'));
  const secondSequence = Array.from({ length: 6 }, createTemplateRandom('gleicher-seed'));
  const otherSequence = Array.from({ length: 6 }, createTemplateRandom('anderer-seed'));
  assert.deepEqual(firstSequence, secondSequence);
  assert.notDeepEqual(firstSequence, otherSequence);
});

test('automatische Vorlage akzeptiert das Gründerpaar allein als eine Generation', () => {
  const result = generateAutomaticFamilyTemplate(automaticTemplateFounderFamily(), {
    templateId: 'compact',
    generationCount: 1,
    seed: 'nur-gruender'
  });
  assert.equal(result.summary.generationCount, 1);
  assert.equal(result.family.persons.length, 2);
  assert.equal(result.family.parentages.length, 0);
  assert.equal(result.family.timeJumps.length, 0);
  assert.throws(() => generateAutomaticFamilyTemplate(automaticTemplateFounderFamily(), {
    generationCount: 1,
    timeJump: { enabled: true, years: 20 }
  }), /mindestens eine sichtbare Generation/);
});

test('automatische Chronologie bleibt bis 1740 und hält normale Elternalter plausibel', () => {
  const result = generateAutomaticFamilyTemplate(automaticTemplateFounderFamily(), {
    templateId: 'large',
    generationCount: 5,
    seed: 'chronologie',
    params: {
      minChildren: 2,
      maxChildren: 5,
      childbearingAge: 26,
      lifespan: 62,
      autoGenerateNames: true,
      autoCalculateDeath: true
    }
  });
  const numericYears = [
    ...result.family.persons.flatMap(person => [person.birth, person.death]),
    ...result.family.partnerships.flatMap(partnership => [partnership.start, partnership.end])
  ].filter(value => /^\d{1,4}$/.test(String(value))).map(Number);
  assert.ok(numericYears.every(year => year <= 1740));
  const personById = new Map(result.family.persons.map(person => [person.id, person]));
  result.family.parentages
    .filter(parentage => parentage.type !== 'claimed')
    .forEach(parentage => {
      const childBirth = Number(personById.get(parentage.childId)?.birth);
      parentage.parentIds.forEach(parentId => {
        const parentBirth = Number(personById.get(parentId)?.birth);
        assert.ok(childBirth - parentBirth >= PLAUSIBLE_PARENT_AGE_AT_BIRTH.min);
        assert.ok(childBirth - parentBirth <= PLAUSIBLE_PARENT_AGE_AT_BIRTH.max);
      });
    });
  assert.throws(() => generateAutomaticFamilyTemplate(automaticTemplateFounderFamily({
    founderManBirth: '1720',
    founderWomanBirth: '1722',
    marriageYear: '1740'
  }), {
    generationCount: 3,
    seed: 'zu-viele-generationen'
  }), /passen.*nicht bis 1740/);
});

test('automatische Lebensläufe reichen bis Partnerschaftsbeginn und biologische Kindergeburt', () => {
  const result = generateAutomaticFamilyTemplate(automaticTemplateFounderFamily({
    founderManDeath: '',
    founderWomanDeath: ''
  }), {
    templateId: 'large',
    generationCount: 5,
    seed: 'kurze-lebensdauer',
    params: {
      minChildren: 3,
      maxChildren: 6,
      lifespan: 1,
      autoGenerateNames: true,
      autoCalculateDeath: true,
      allowAdoption: false,
      allowBastards: false
    }
  });
  const personById = new Map(result.family.persons.map(person => [person.id, person]));
  result.family.partnerships.forEach(partnership => {
    const startYear = Number(partnership.start);
    assert.ok(Number.isInteger(startYear));
    partnership.participantIds.forEach(personId => {
      const deathYear = Number(personById.get(personId)?.death);
      assert.ok(!deathYear || deathYear >= startYear, `${personId} starb vor Beginn von ${partnership.id}`);
    });
  });
  result.family.parentages
    .filter(parentage => parentage.type === 'biological')
    .forEach(parentage => {
      const childBirth = Number(personById.get(parentage.childId)?.birth);
      parentage.parentIds.forEach(parentId => {
        const deathYear = Number(personById.get(parentId)?.death);
        assert.ok(!deathYear || deathYear >= childBirth, `${parentId} starb vor Geburt von ${parentage.childId}`);
      });
    });
});

test('automatische Vorlage weist explizit widersprüchliche Gründer-Todesdaten klar zurück', () => {
  assert.throws(() => generateAutomaticFamilyTemplate(automaticTemplateFounderFamily({
    founderManDeath: '1610',
    marriageYear: '1624'
  }), {
    generationCount: 2,
    seed: 'tod-vor-ehe'
  }), /eingetragene Sterbejahr 1610.*Gründerehe im Jahr 1624/);

  assert.throws(() => generateAutomaticFamilyTemplate(automaticTemplateFounderFamily({
    founderManDeath: '1625',
    marriageYear: '1624'
  }), {
    generationCount: 2,
    seed: 'tod-vor-kind',
    params: { allowAdoption: false, allowBastards: false }
  }), /eingetragene Sterbejahr 1625.*Geburt des biologischen Kindes/);
});

test('automatische Vorlage bildet den optionalen Zeitsprung als einzigen absoluten Trenner ab', () => {
  const result = generateAutomaticFamilyTemplate(automaticTemplateFounderFamily(), {
    templateId: 'balanced',
    generationCount: 5,
    seed: 'mit-zeitsprung',
    params: { minChildren: 2, maxChildren: 4, autoGenerateNames: true, autoCalculateDeath: true },
    timeJump: {
      enabled: true,
      fromYear: '1650',
      toYear: '1680',
      years: 30,
      label: 'Drei Jahrzehnte später'
    }
  });
  assert.equal(result.family.timeJumps.length, 1);
  const [timeJump] = result.family.timeJumps;
  assert.equal(timeJump.parentPartnershipId, result.family.lineage.founderPartnershipId);
  assert.equal(timeJump.toYear, '1680');
  assert.ok(timeJump.childIds.length > 0);
  assert.deepEqual(
    result.family.parentages
      .filter(parentage => parentage.extensions.timeJumpId === timeJump.id)
      .map(parentage => parentage.childId)
      .sort(),
    [...timeJump.childIds].sort()
  );
  assert.ok(result.family.parentages
    .filter(parentage => timeJump.childIds.includes(parentage.childId))
    .every(parentage => parentage.type === 'claimed'));
  assert.doesNotThrow(() => toFamilyChartData(result.family));
});

test('Übernahme einer automatischen Vorschau bleibt genau eine Store- und Undo-Grenze', () => {
  const base = automaticTemplateFounderFamily();
  const generated = generateAutomaticFamilyTemplate(base, {
    templateId: 'compact',
    generationCount: 3,
    seed: 'atomar'
  }).family;
  const store = createFamilyStore(base);
  const familyEvents = [];
  store.subscribe((state, event) => {
    if (event.affectsFamily) familyEvents.push(event);
  });
  store.replaceFamily(generated, { source: 'tree-generator-automatic-template' });
  assert.equal(familyEvents.length, 1);
  assert.equal(familyEvents[0].details.source, 'tree-generator-automatic-template');
  assert.equal(store.getState().family.persons.length, generated.persons.length);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.getState().family, normalizeFamily(base));
  assert.equal(store.undo(), false, 'die Vorlage darf nicht als Folge einzelner Personenaktionen im Verlauf liegen');
});

test('Generator-UI delegiert Automatikaktionen zentral und ohne Inline-Handler', async () => {
  const [dialogSource, controllerSource, appSource] = await Promise.all([
    readFile(new URL('../assets/js/ui/tree-generator-dialog.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/js/modules/tree-generator/tree-generator-controller.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/js/ui/app-controller.js', import.meta.url), 'utf8')
  ]);
  for (const action of [
    'tree-generator-select-guided-mode',
    'tree-generator-select-automatic-mode',
    'tree-generator-preview-automatic',
    'tree-generator-reroll-automatic',
    'tree-generator-accept-automatic'
  ]) {
    assert.match(dialogSource, new RegExp(`data-action="${action}"`));
    assert.match(appSource, new RegExp(`case '${action}'`));
  }
  assert.match(controllerSource, /store\.replaceFamily\(generatedFamily, \{ source: 'tree-generator-automatic-template' \}\)/);
  assert.match(controllerSource, /dialog\.form\.addEventListener\('input', captureAutomaticOptionsFromForm\)/);
  assert.match(controllerSource, /automaticTemplateOptionsSignature\(visibleOptions\) !== automaticPreviewSignature/);
  assert.doesNotMatch(dialogSource, /\son(?:click|change|input)=/i);
});

test('geänderte Automatikoptionen entwerten Signatur und sichtbare Vorschau', () => {
  const baseOptions = {
    templateId: 'balanced',
    generationCount: 4,
    seed: 'vorschau',
    params: { minChildren: 1, maxChildren: 4 },
    timeJump: { enabled: false, years: 25 }
  };
  assert.notEqual(
    automaticTemplateOptionsSignature(baseOptions),
    automaticTemplateOptionsSignature({ ...baseOptions, generationCount: 5 })
  );
  assert.notEqual(
    automaticTemplateOptionsSignature(baseOptions),
    automaticTemplateOptionsSignature({ ...baseOptions, templateId: 'large' })
  );

  const nativeDialog = new EventTarget();
  nativeDialog.open = false;
  nativeDialog.showModal = () => { nativeDialog.open = true; };
  nativeDialog.close = () => { nativeDialog.open = false; };
  const summary = { dataset: {} };
  const note = { textContent: '' };
  const acceptButton = { disabled: false };
  const refreshButton = { dataset: { action: 'tree-generator-reroll-automatic' }, textContent: 'Neu würfeln' };
  const body = {
    querySelector(selector) {
      if (selector.includes('automatic-preview-summary')) return summary;
      if (selector.includes('automatic-preview-note')) return note;
      return null;
    }
  };
  const footer = {
    querySelector(selector) {
      if (selector.includes('accept-automatic')) return acceptButton;
      if (selector.includes('reroll-automatic')) return refreshButton;
      return null;
    }
  };
  const elements = new Map([
    ['tree-generator-dialog', nativeDialog],
    ['tree-generator-form', new EventTarget()],
    ['tree-generator-title', {}],
    ['tree-generator-steps', {}],
    ['tree-generator-body', body],
    ['tree-generator-footer', footer]
  ]);
  const dialog = createTreeGeneratorDialog({ getElementById: id => elements.get(id) });
  assert.equal(dialog.markAutomaticPreviewStale(), true);
  assert.equal(summary.dataset.previewState, 'stale');
  assert.match(note.textContent, /Optionen wurden geändert/);
  assert.equal(acceptButton.disabled, true);
  assert.equal(refreshButton.dataset.action, 'tree-generator-preview-automatic');
  assert.equal(refreshButton.textContent, 'Vorschau aktualisieren');
});

test('rendert die lokale Familie sofort und spielt Firebase erst danach priorisiert ein', async () => {
  const localFamily = HOUSE_ARWYDD_FAMILY;
  const publishedFamily = normalizeFamily({
    ...localFamily,
    document: { ...localFamily.document, motto: 'Später aus Firebase geladen' }
  });
  let resolvePublished;
  const publishedRequest = new Promise(resolve => { resolvePublished = resolve; });
  const store = createFamilyStore(localFamily);
  let synchronizationSource = '';
  store.subscribe((state, event) => {
    if (event.type === 'family-synchronized') synchronizationSource = event.details.source;
  });

  const priorityRequest = applyPublishedFamilyPriority({
    requestedFamilyId: localFamily.document.id,
    initialFamilyId: localFamily.document.id,
    store,
    cloudRepository: { loadPublished: () => publishedRequest }
  });

  assert.equal(store.getState().family.document.title, localFamily.document.title);
  assert.notEqual(store.getState().family.document.motto, publishedFamily.document.motto);
  resolvePublished({ family: publishedFamily, releaseId: 'release-test' });
  assert.equal(await priorityRequest, true);
  assert.equal(store.getState().family.document.motto, publishedFamily.document.motto);
  assert.equal(synchronizationSource, 'firebase-published-priority');
});

test('lässt eine veraltete veröffentlichte Leerakte die neuere Neidr-Ursprungsfassung nicht verdecken', async () => {
  const stalePublishedPlaceholder = createFounderPlaceholderHouseFamily({
    id: 'haus-neidr',
    title: 'Haus Neidr',
    emblem: HOUSE_NEIDR_FAMILY.document.emblem,
    houseProfile: HOUSE_NEIDR_FAMILY.document.houseProfile
  });
  const store = createFamilyStore(HOUSE_NEIDR_FAMILY);

  assert.equal(isStalePublishedPlaceholder(stalePublishedPlaceholder, HOUSE_NEIDR_FAMILY), true);
  assert.equal(await applyPublishedFamilyPriority({
    requestedFamilyId: 'haus-neidr',
    initialFamilyId: 'haus-neidr',
    store,
    cloudRepository: { async loadPublished() { return { family: stalePublishedPlaceholder }; } }
  }), false);
  assert.equal(store.getState().family.persons.length, HOUSE_NEIDR_FAMILY.persons.length);
  assert.equal(store.getState().family.extensions.blankFamily, false);
});

test('app-start wartet vor dem lokalen Rendern nicht mehr auf Firebase', async () => {
  const appSource = await readFile(new URL('../assets/js/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(appSource, /await\s+cloudRepository\.loadPublished/);
  assert.match(appSource, /controller\.init\(\);[\s\S]*void applyPublishedFamilyPriority\(/);
});

function createSyncHarness({ family, storage = createMemoryStorage(), remoteRecords = new Map() }) {
  const store = createFamilyStore(family);
  const localRepository = createLocalFamilyRepository(storage);
  let authListener = () => {};
  let saveCalls = 0;
  let batchCalls = 0;
  let lastSave = null;
  let lastBatch = null;
  const statusElement = { textContent: '' };
  const documentRef = {
    getElementById: id => id === 'save-status' ? statusElement : null,
    addEventListener() {},
    removeEventListener() {}
  };
  const ui = {
    dialog: { addEventListener() {}, removeEventListener() {} },
    form: {},
    render() {},
    open() {},
    close() {},
    showError() {},
    readCredentials: () => ({}),
    clearPassword() {}
  };
  const authService = {
    observe(listener) {
      authListener = listener;
      listener(null);
      return () => {};
    },
    async login() {},
    async logout() {}
  };
  const cloudRepository = {
    async loadDraft(familyId) {
      return remoteRecords.get(familyId) || null;
    },
    async saveDraft(record) {
      saveCalls += 1;
      lastSave = record;
      const result = { family: record.family, revision: record.expectedRevision + 1 };
      remoteRecords.set(record.family.document.id, result);
      return result;
    },
    async saveDraftBatch(records) {
      batchCalls += 1;
      lastBatch = records;
      return records.map(record => {
        const result = { family: record.family, revision: record.expectedRevision + 1 };
        remoteRecords.set(record.family.document.id, result);
        return result;
      });
    },
    async watchDraftMetadata() {
      return () => {};
    },
    async publishDraft() {
      return { revision: 1 };
    }
  };
  const controller = createFamilySyncController({
    store,
    localRepository,
    cloudRepository,
    authService,
    documentRef,
    editing: true,
    uiFactory: () => ui,
    runtime: { confirm: () => true }
  });
  return {
    controller,
    store,
    storage,
    localRepository,
    signIn(user = { uid: 'test-user', email: 'test@aleria.invalid' }) {
      authListener(user);
    },
    metrics: () => ({ saveCalls, batchCalls, lastSave, lastBatch })
  };
}

function nextTask() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

test('speichert lokale Autosave-Entwürfe getrennt nach Familien-ID', () => {
  const storage = createMemoryStorage();
  const repository = createLocalFamilyRepository(storage);
  const first = createFoundingFamily({
    documentTitle: 'Haus Entwurf Eins', founderManName: 'A', founderWomanName: 'B'
  });
  const second = createFoundingFamily({
    documentTitle: 'Haus Entwurf Zwei', founderManName: 'C', founderWomanName: 'D'
  });
  repository.persistCurrent(first, { baseRevision: 2, dirty: true });
  repository.persistCurrent(second, { baseRevision: 7, dirty: false });
  assert.equal(repository.loadDraft(first.document.id).baseRevision, 2);
  assert.equal(repository.loadDraft(first.document.id).dirty, true);
  assert.equal(repository.loadDraft(second.document.id).baseRevision, 7);
  assert.equal(repository.loadDraft(second.document.id).dirty, false);
});

test('liest Gegenfamilien und Beziehungskandidaten aus dem neuesten lokalen Draft', () => {
  const storage = createMemoryStorage();
  const repository = createLocalFamilyRepository(storage);
  const registered = createFoundingFamily({
    documentTitle: 'Haus Gegenakte', founderManName: 'Alter Registername', founderWomanName: 'B'
  });
  saveFamilyRecordsAtomically([{
    id: registered.document.id,
    title: registered.document.title,
    folderPath: ['Cenyr', 'Gegenakten'],
    family: registered
  }], storage);
  const latest = normalizeFamily({
    ...registered,
    persons: registered.persons.map((person, index) => index === 0
      ? { ...person, name: 'Neuester Draftname' }
      : person)
  });
  repository.persistDraft(latest, { dirty: true });
  const source = createLatestLocalFamilySource({ draftRepository: repository, storage });

  const loaded = source.loadById(registered.document.id);
  const listed = source.listRecords().find(record => record.id === registered.document.id);
  assert.equal(loaded.source, 'local-draft');
  assert.equal(loaded.family.persons[0].name, 'Neuester Draftname');
  assert.equal(listed.family.persons[0].name, 'Neuester Draftname');
  assert.deepEqual(listed.folderPath, ['Cenyr', 'Gegenakten']);
});

test('verwirft ein komplettes Spiegelpaket bei einer veralteten Gegenfamilien-Basis', () => {
  const storage = createMemoryStorage();
  const repository = createLocalFamilyRepository(storage);
  const firstBase = createFoundingFamily({
    documentTitle: 'Haus Neu', founderManName: 'A', founderWomanName: 'B'
  });
  const secondBase = createFoundingFamily({
    documentTitle: 'Haus Gegenüber', founderManName: 'C', founderWomanName: 'D'
  });
  const firstLatest = normalizeFamily({
    ...firstBase,
    document: { ...firstBase.document, motto: 'Neuere lokale Änderung' }
  });
  const staleFirstChange = normalizeFamily({
    ...firstBase,
    document: { ...firstBase.document, motto: 'Aus veralteter Vollfamilie' }
  });
  const secondChange = normalizeFamily({
    ...secondBase,
    document: { ...secondBase.document, motto: 'Dürfte nicht geschrieben werden' }
  });
  repository.persistDraft(firstLatest, { dirty: true });
  repository.persistDraft(secondBase, { dirty: false });

  const saved = repository.persistRelatedChanges([
    { family: staleFirstChange, baseFamily: firstBase },
    { family: secondChange, baseFamily: secondBase }
  ]);

  assert.equal(saved, false);
  assert.equal(repository.loadDraft(firstBase.document.id).family.document.motto, 'Neuere lokale Änderung');
  assert.equal(repository.loadDraft(secondBase.document.id).family.document.motto, secondBase.document.motto);
  assert.equal(repository.loadDraft(secondBase.document.id).dirty, false);
});

test('schreibt Änderungen erst nach Online-speichern und niemals durch lokales Autosave', async () => {
  const family = createFoundingFamily({
    documentTitle: 'Haus Manuell', founderManName: 'A', founderWomanName: 'B'
  });
  const harness = createSyncHarness({ family });
  await harness.controller.init();
  harness.store.updateDocument({ motto: 'Nur lokal' });
  await nextTask();
  assert.equal(harness.metrics().saveCalls, 0);
  assert.equal(harness.localRepository.loadDraft(family.document.id).dirty, true);
  harness.signIn();
  await nextTask();
  assert.equal(harness.metrics().saveCalls, 0);
  await harness.controller.saveNow();
  assert.equal(harness.metrics().saveCalls, 1);
  assert.equal(harness.localRepository.loadDraft(family.document.id).dirty, false);
});

test('lässt eine neuere Firebase-Revision gewinnen und archiviert den lokalen Entwurf', async () => {
  const storage = createMemoryStorage();
  const base = createFoundingFamily({
    documentTitle: 'Haus Vorrang', founderManName: 'A', founderWomanName: 'B'
  });
  const local = normalizeFamily({ ...base, document: { ...base.document, motto: 'Lokal' } });
  const remote = normalizeFamily({ ...base, document: { ...base.document, motto: 'Firebase' } });
  const repository = createLocalFamilyRepository(storage);
  repository.persistCurrent(local, { baseRevision: 1, dirty: true, cloudFamilyId: base.document.id });
  const harness = createSyncHarness({
    family: local,
    storage,
    remoteRecords: new Map([[base.document.id, { family: remote, revision: 2 }]])
  });
  await harness.controller.init();
  harness.signIn();
  await nextTask();
  assert.equal(harness.store.getState().family.document.motto, 'Firebase');
  assert.equal(harness.localRepository.loadDraft(base.document.id).dirty, false);
  const recovery = JSON.parse(storage.getItem('aleria.family-tree.local-draft-recovery.v1'));
  assert.equal(recovery[0].family.document.motto, 'Lokal');
});

test('bindet eine cloudgespeicherte Akte dauerhaft an ihre Familien-ID', async () => {
  const storage = createMemoryStorage();
  const original = createFoundingFamily({
    documentTitle: 'Haus Gebunden', founderManName: 'A', founderWomanName: 'B'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.markSynced(original, 5);
  const harness = createSyncHarness({ family: original, storage });
  await harness.controller.init();
  const renamed = normalizeFamily({
    ...original,
    document: { ...original.document, id: 'haus-umbenannt', title: 'Haus Umbenannt' }
  });
  harness.store.replaceFamily(renamed, { source: 'family-library-save' });
  assert.equal(harness.controller.getSyncState().identityChangeBlock.fromFamilyId, original.document.id);
  assert.equal(repository.loadDraft('haus-umbenannt').cloudFamilyId, original.document.id);
  harness.controller.destroy();

  const reloaded = createSyncHarness({ family: renamed, storage });
  await reloaded.controller.init();
  assert.equal(reloaded.controller.getSyncState().identityChangeBlock.fromFamilyId, original.document.id);
});

test('blockiert eine neue Familie mit derselben bereits cloudgebundenen ID', async () => {
  const storage = createMemoryStorage();
  const original = createFoundingFamily({
    documentTitle: 'Haus Identisch', founderManName: 'A', founderWomanName: 'B'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.markSynced(original, 5);
  const harness = createSyncHarness({ family: original, storage });
  await harness.controller.init();
  const replacement = normalizeFamily({
    ...original,
    document: { ...original.document, title: 'Andere Familie mit gleicher ID' },
    persons: original.persons.map((person, index) => index ? person : { ...person, name: 'Ersatzgründer' })
  });
  harness.store.replaceFamily(replacement, { source: 'new-founding-family' });
  assert.equal(harness.controller.getSyncState().identityChangeBlock.sameIdCollision, true);
  assert.equal(repository.loadDraft(original.document.id).identityCollision, true);
});

test('stellt die Same-ID-Sperre nach Undo und Redo wieder her', async () => {
  const storage = createMemoryStorage();
  const original = createFoundingFamily({
    documentTitle: 'Haus Redo-Sperre', founderManName: 'A', founderWomanName: 'B'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.markSynced(original, 5);
  const harness = createSyncHarness({ family: original, storage });
  await harness.controller.init();
  const replacement = normalizeFamily({
    ...original,
    document: { ...original.document, title: 'Neue Akte unter gleicher ID' }
  });
  harness.store.replaceFamily(replacement, { source: 'new-founding-family' });
  assert.equal(harness.controller.getSyncState().identityChangeBlock.sameIdCollision, true);
  harness.store.undo();
  assert.equal(harness.controller.getSyncState().identityChangeBlock, null);
  harness.store.redo();
  assert.equal(harness.controller.getSyncState().identityChangeBlock.sameIdCollision, true);
  harness.signIn();
  await nextTask();
  await assert.rejects(() => harness.controller.saveNow(), /bereits die online gebundene ID/);
  assert.equal(harness.metrics().saveCalls, 0);
});

test('bewahrt die Same-ID-Provenienz über ID-Ausflug und Undo', async () => {
  const storage = createMemoryStorage();
  const original = createFoundingFamily({
    documentTitle: 'Haus ID-Ausflug', founderManName: 'A', founderWomanName: 'B'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.markSynced(original, 5);
  const harness = createSyncHarness({ family: original, storage });
  await harness.controller.init();
  const replacement = normalizeFamily({
    ...original,
    document: { ...original.document, title: 'Kollidierende neue Akte' }
  });
  harness.store.replaceFamily(replacement, { source: 'new-founding-family' });
  const renamedReplacement = normalizeFamily({
    ...replacement,
    document: { ...replacement.document, id: 'haus-id-ausflug-neu' }
  });
  harness.store.replaceFamily(renamedReplacement, { source: 'family-library-save' });
  harness.store.undo();
  const block = harness.controller.getSyncState().identityChangeBlock;
  assert.equal(block.sameIdCollision, true);
  assert.equal(block.fromFamilyId, original.document.id);
  harness.signIn();
  await nextTask();
  await assert.rejects(() => harness.controller.saveNow(), /bereits die online gebundene ID/);
  assert.equal(harness.metrics().saveCalls, 0);
});

test('löst eine Same-ID-Neuanlage durch eine wirklich neue Familien-ID', async () => {
  const storage = createMemoryStorage();
  const original = createFoundingFamily({
    documentTitle: 'Haus Kollisionsauflösung', founderManName: 'A', founderWomanName: 'B'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.markSynced(original, 5);
  const harness = createSyncHarness({ family: original, storage });
  await harness.controller.init();
  harness.store.replaceFamily(normalizeFamily({
    ...original,
    document: { ...original.document, title: 'Neue kollidierende Akte' }
  }), { source: 'new-founding-family' });
  const independentFamily = normalizeFamily({
    ...harness.store.getState().family,
    document: {
      ...harness.store.getState().family.document,
      id: 'haus-eigenstaendige-neuanlage',
      title: 'Haus Eigenständige Neuanlage'
    }
  });
  harness.store.replaceFamily(independentFamily, { source: 'family-library-save' });
  assert.equal(harness.controller.getSyncState().identityChangeBlock, null);
  assert.equal(harness.controller.getSyncState().localBaseRevision, 0);
  harness.signIn();
  await nextTask();
  await harness.controller.saveNow();
  assert.equal(harness.metrics().saveCalls, 1);
  assert.equal(harness.metrics().lastSave.family.document.id, independentFamily.document.id);
  assert.equal(harness.metrics().lastSave.expectedRevision, 0);
});

test('speichert gespiegelte Beziehungen beider Familien in einer atomaren Cloud-Transaktion', async () => {
  const storage = createMemoryStorage();
  const firstBase = createFoundingFamily({
    documentTitle: 'Haus Spiegel Eins', founderManName: 'A', founderWomanName: 'B'
  });
  const secondBase = createFoundingFamily({
    documentTitle: 'Haus Spiegel Zwei', founderManName: 'C', founderWomanName: 'D'
  });
  const firstChanged = normalizeFamily({
    ...firstBase,
    document: { ...firstBase.document, motto: 'Verknüpft' }
  });
  const secondChanged = normalizeFamily({
    ...secondBase,
    document: { ...secondBase.document, motto: 'Gespiegelt' }
  });
  const repository = createLocalFamilyRepository(storage);
  repository.persistRelatedChanges([
    { family: firstChanged, baseFamily: firstBase },
    { family: secondChanged, baseFamily: secondBase }
  ]);
  repository.persistCurrent(firstChanged, {
    baseRevision: 2,
    dirty: true,
    cloudFamilyId: firstChanged.document.id
  });
  const remotes = new Map([
    [firstBase.document.id, { family: firstBase, revision: 2 }],
    [secondBase.document.id, { family: secondBase, revision: 4 }]
  ]);
  const harness = createSyncHarness({ family: firstChanged, storage, remoteRecords: remotes });
  await harness.controller.init();
  harness.signIn();
  await nextTask();
  await harness.controller.saveNow();
  assert.equal(harness.metrics().saveCalls, 0);
  assert.equal(harness.metrics().batchCalls, 1);
  assert.equal(harness.metrics().lastBatch.length, 2);
  assert.equal(harness.localRepository.loadDraft(firstBase.document.id).dirty, false);
  assert.equal(harness.localRepository.loadDraft(secondBase.document.id).dirty, false);
});

test('hält eine Related-Komponente nach Firebase-Vorrang bis zum gemeinsamen Batch zusammen', async () => {
  const storage = createMemoryStorage();
  const firstBase = createFoundingFamily({
    documentTitle: 'Haus Vorrang A', founderManName: 'A', founderWomanName: 'B'
  });
  const secondBase = createFoundingFamily({
    documentTitle: 'Haus Vorrang B', founderManName: 'C', founderWomanName: 'D'
  });
  const firstChanged = normalizeFamily({
    ...firstBase,
    document: { ...firstBase.document, motto: 'Lokale Spiegelhälfte A' }
  });
  const secondChanged = normalizeFamily({
    ...secondBase,
    document: { ...secondBase.document, motto: 'Lokale Spiegelhälfte B' }
  });
  const secondRemote = normalizeFamily({
    ...secondBase,
    document: { ...secondBase.document, motto: 'Neuere Firebase-Fassung B' }
  });
  const repository = createLocalFamilyRepository(storage);
  repository.persistRelatedChanges([
    { family: firstChanged, baseFamily: firstBase },
    { family: secondChanged, baseFamily: secondBase }
  ]);
  repository.persistDraft(firstChanged, { baseRevision: 1, dirty: true });
  repository.persistCurrent(secondChanged, { baseRevision: 1, dirty: true });
  const remotes = new Map([
    [firstBase.document.id, { family: firstBase, revision: 1 }],
    [secondBase.document.id, { family: secondRemote, revision: 2 }]
  ]);

  const secondHarness = createSyncHarness({ family: secondChanged, storage, remoteRecords: remotes });
  await secondHarness.controller.init();
  secondHarness.signIn();
  await nextTask();
  secondHarness.controller.destroy();

  const syncedSecondDraft = repository.loadDraft(secondBase.document.id);
  assert.equal(syncedSecondDraft.dirty, false);
  assert.equal(syncedSecondDraft.family.document.motto, 'Neuere Firebase-Fassung B');
  assert.deepEqual(syncedSecondDraft.relatedFamilyIds, [firstBase.document.id]);

  const firstHarness = createSyncHarness({ family: firstChanged, storage, remoteRecords: remotes });
  await firstHarness.controller.init();
  firstHarness.signIn();
  await nextTask();
  await firstHarness.controller.saveNow();

  assert.equal(firstHarness.metrics().saveCalls, 0, 'A darf nicht allein gespeichert werden');
  assert.equal(firstHarness.metrics().batchCalls, 1);
  assert.deepEqual(
    firstHarness.metrics().lastBatch.map(record => record.family.document.id).sort(),
    [firstBase.document.id, secondBase.document.id].sort()
  );
  assert.equal(repository.loadDraft(firstBase.document.id).dirty, false);
  assert.equal(repository.loadDraft(secondBase.document.id).dirty, false);
  assert.deepEqual(repository.loadDraft(firstBase.document.id).relatedFamilyIds, []);
  assert.deepEqual(repository.loadDraft(secondBase.document.id).relatedFamilyIds, []);
});

test('blockiert nach Firebase-Vorrang eine nur noch einseitige echte Spiegelbeziehung', async () => {
  const storage = createMemoryStorage();
  const change = createMirroredPartnershipChange({
    currentFamily: HOUSE_DRAIG_FAMILY,
    counterpartFamily: HOUSE_GWYVERN_FAMILY,
    currentPersonId: 'idwal-draig',
    counterpartPersonId: 'tegwen-gwyvern',
    type: 'engagement'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.persistRelatedChanges([
    { family: change.currentFamily, baseFamily: HOUSE_DRAIG_FAMILY },
    { family: change.counterpartFamily, baseFamily: HOUSE_GWYVERN_FAMILY }
  ]);
  repository.persistDraft(change.currentFamily, { baseRevision: 1, dirty: true });
  repository.persistCurrent(change.counterpartFamily, { baseRevision: 1, dirty: true });
  const remotes = new Map([
    [HOUSE_DRAIG_FAMILY.document.id, { family: HOUSE_DRAIG_FAMILY, revision: 1 }],
    [HOUSE_GWYVERN_FAMILY.document.id, { family: HOUSE_GWYVERN_FAMILY, revision: 2 }]
  ]);

  const counterpartHarness = createSyncHarness({
    family: change.counterpartFamily,
    storage,
    remoteRecords: remotes
  });
  await counterpartHarness.controller.init();
  counterpartHarness.signIn();
  await nextTask();
  counterpartHarness.controller.destroy();

  const currentDraft = repository.loadDraft(HOUSE_DRAIG_FAMILY.document.id);
  const counterpartDraft = repository.loadDraft(HOUSE_GWYVERN_FAMILY.document.id);
  assert.ok(currentDraft.family.partnerships.some(partnership => (
    partnership.extensions?.crossFamilyRelationship?.linkId === change.linkId
  )));
  assert.equal(counterpartDraft.family.partnerships.some(partnership => (
    partnership.extensions?.crossFamilyRelationship?.linkId === change.linkId
  )), false, 'Firebase muss für die Gegenfamilie Vorrang behalten');

  const currentHarness = createSyncHarness({
    family: currentDraft.family,
    storage,
    remoteRecords: remotes
  });
  await currentHarness.controller.init();
  currentHarness.signIn();
  await nextTask();
  await assert.rejects(
    () => currentHarness.controller.saveNow(),
    /nicht mehr beidseitig konsistent/
  );
  assert.equal(currentHarness.metrics().saveCalls, 0);
  assert.equal(currentHarness.metrics().batchCalls, 0, 'die halbe Verbindung darf Firebase nie erreichen');
  assert.equal(repository.loadDraft(HOUSE_DRAIG_FAMILY.document.id).dirty, true);
});

test('blockiert einen geänderten Cross-Family-Link auch ohne Related-Metadaten im Einzelspeicher', async () => {
  const storage = createMemoryStorage();
  const change = createMirroredPartnershipChange({
    currentFamily: HOUSE_DRAIG_FAMILY,
    counterpartFamily: HOUSE_GWYVERN_FAMILY,
    currentPersonId: 'idwal-draig',
    counterpartPersonId: 'tegwen-gwyvern',
    type: 'engagement'
  });
  const repository = createLocalFamilyRepository(storage);
  repository.persistCurrent(change.currentFamily, {
    baseFamily: HOUSE_DRAIG_FAMILY,
    baseRevision: 1,
    dirty: true,
    cloudFamilyId: HOUSE_DRAIG_FAMILY.document.id
  });
  const harness = createSyncHarness({
    family: change.currentFamily,
    storage,
    remoteRecords: new Map([[
      HOUSE_DRAIG_FAMILY.document.id,
      { family: HOUSE_DRAIG_FAMILY, revision: 1 }
    ]])
  });
  await harness.controller.init();
  harness.signIn();
  await nextTask();

  await assert.rejects(
    () => harness.controller.saveNow(),
    /geänderte Gegenfamilie fehlt/
  );
  assert.equal(harness.metrics().saveCalls, 0, 'der unsichere Einzeldraft darf saveDraft nicht erreichen');
  assert.equal(harness.metrics().batchCalls, 0);
});

test('blockiert dieselbe Cross-Family-Link-ID bei abweichenden Weltpersonen', () => {
  const change = createMirroredPartnershipChange({
    currentFamily: HOUSE_DRAIG_FAMILY,
    counterpartFamily: HOUSE_GWYVERN_FAMILY,
    currentPersonId: 'idwal-draig',
    counterpartPersonId: 'tegwen-gwyvern',
    type: 'engagement'
  });
  const counterpartLink = change.counterpartFamily.partnerships.find(partnership => (
    partnership.extensions?.crossFamilyRelationship?.linkId === change.linkId
  ));
  const wrongParticipant = change.counterpartFamily.persons.find(person => (
    !counterpartLink.participantIds.includes(person.id)
  ));
  const tamperedCounterpart = normalizeFamily({
    ...change.counterpartFamily,
    partnerships: change.counterpartFamily.partnerships.map(partnership => (
      partnership.id === counterpartLink.id
        ? { ...partnership, participantIds: [counterpartLink.participantIds[0], wrongParticipant.id] }
        : partnership
    ))
  });

  assert.throws(() => assertMirroredCrossFamilyBatch([
    { family: change.currentFamily, baseFamily: HOUSE_DRAIG_FAMILY },
    { family: tamperedCounterpart, baseFamily: HOUSE_GWYVERN_FAMILY }
  ]), /Teilnehmer, Status oder Beziehungsart/);
});

test('fasst verkettete Spiegeländerungen zu einem gemeinsamen atomaren Paket zusammen', () => {
  const repository = createLocalFamilyRepository(createMemoryStorage());
  const families = ['A', 'B', 'C', 'D'].map(name => createFoundingFamily({
    documentTitle: `Haus Kette ${name}`,
    founderManName: `${name}1`,
    founderWomanName: `${name}2`
  }));
  repository.persistRelatedChanges([families[0], families[1]]);
  repository.persistRelatedChanges([families[0], families[2]]);
  repository.persistRelatedChanges([families[1], families[3]]);
  const relatedIds = repository.listRelatedDrafts(families[0].document.id)
    .map(draft => draft.family.document.id)
    .sort();
  assert.deepEqual(relatedIds, families.slice(1).map(family => family.document.id).sort());
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
