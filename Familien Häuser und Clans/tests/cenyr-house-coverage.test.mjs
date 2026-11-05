import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { getCenyrPlacement, normalizePublicAllowlist, hasCenyrCoverageGaps } from '../modules/house-coverage/cenyr-house-coverage-model.mjs';
import { loadPublicCenyrCoverageInputs, auditCenyrHouseCoverage } from '../modules/house-coverage/cenyr-house-coverage-node.mjs';
import { runCenyrCoverageCli } from '../scripts/check-cenyr-house-coverage.mjs';
import { reconcileFamilyWithProjectOrigin } from '../../Stammbäume/assets/js/modules/family-sync/project-origin-reconciliation.js';
import { createRuralFamilyCoverageProfile } from '../modules/house-coverage/rural-family-profile.mjs';
import { FLEISCHSAMMLER_FAMILIES_INDEX } from '../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';
import { renderHouseBiographyHeader } from '../../Stammbäume/assets/js/modules/house-biography/house-biography-renderer.js';

const root = new URL('../../', import.meta.url);
const digest = value => createHash('sha256').update(value).digest('hex');
const input = loadPublicCenyrCoverageInputs();
const before = new Map(input.project.map(record => [record.id, digest(JSON.stringify(record.family))]));
const allowlistIds = input.scope.map(record => record.id);
const report = await auditCenyrHouseCoverage({ allowlistIds });

test('public Cenyr coverage follows current residences and explicit exile placements, independent of service or obsolete kingdom fields', () => {
  const foreign = { folderPath: ['Vennyr', 'North'], houseProfile: { kingdom: 'Cenyr', liegeHouseId: 'example-cenyr-liege' } };
  assert.equal(getCenyrPlacement(foreign), null);
  const currentResidence = { folderPath: ['Cenyr', 'Example County', 'Town'], houseProfile: { kingdom: 'Cenyr' }, role: 'exile' };
  assert.equal(getCenyrPlacement({ ...foreign, additionalPlacements: [currentResidence] }), currentResidence);
  assert.equal(getCenyrPlacement({ folderPath: ['Cenyr', 'Example County'], listing: 'linked-only' }).role, 'primary');
  assert.equal(foreign.folderPath[0], 'Vennyr');
});

test('explicit aliases coalesce without merging northern origin houses and their southern lines', () => {
  assert.deepEqual(normalizePublicAllowlist(['haus-cwingod', 'haus-cwningod']), ['haus-cwningod']);
  assert.deepEqual(normalizePublicAllowlist(['haus-blaidd', 'haus-blaidd-tredegar']), ['haus-blaidd', 'haus-blaidd-tredegar']);
  assert.deepEqual(normalizePublicAllowlist(['haus-lyfant', 'haus-lyfant-caer-asgwrn']), ['haus-lyfant', 'haus-lyfant-caer-asgwrn']);
});

test('a reviewed public allowlist is mandatory and unreviewed identifiers are never echoed', async () => {
  await assert.rejects(auditCenyrHouseCoverage(), /Allowlist/);
  const unreviewed = 'unreviewed-example-identifier';
  await assert.rejects(auditCenyrHouseCoverage({ allowlistIds: [unreviewed] }), error => {
    assert.match(error.message, /nicht freigegebene/);
    assert.ok(!error.message.includes(unreviewed));
    return true;
  });
  assert.ok(input.isHiddenRecord({ id: 'example-only', visibility: 'private' }));
  assert.ok(input.isHiddenRecord({ id: 'example-only', hidden: true }));
});

test('the real dynamic public scope has accessible profiles, effective biographies and locally bound profile images', () => {
  assert.equal(report.records.length, new Set(allowlistIds).size);
  const gaps = report.records.filter(record => Object.values(record.missing).some(Boolean))
    .map(record => ({ id: record.stableId, missing: record.missing }));
  assert.deepEqual(gaps, []);
  assert.equal(report.summary.unreviewedPublicScopedFamilies, 0);
  assert.equal(hasCenyrCoverageGaps(report.summary), false);
  for (const record of report.records) {
    assert.equal(record.existingPage.canonicalDataId, record.stableId);
    assert.ok(record.existingAuthoring.present, record.stableId);
    const image = record.existingPage.kind === 'family-record' ? record.boundProfileImagePath : record.boundPageScenePath;
    assert.ok(image, record.stableId);
    assert.ok(fs.statSync(new URL(image, root)).isFile(), record.stableId);
  }
});

test('actual house frames, family-profile links and supported biography return links use canonical local destinations', () => {
  for (const record of report.records) {
    if (record.existingPage.kind === 'family-record') {
      const url = new URL(record.existingPage.path, root);
      assert.equal(url.pathname, new URL('Stammbäume/Stammbaum.html', root).pathname);
      assert.equal(url.searchParams.get('family'), record.stableId);
      assert.equal(url.searchParams.get('mode'), 'view');
      assert.equal(record.links.profileSupported, true);
      assert.equal(record.links.profileCanonical, true);
      assert.equal(record.links.iframeSupported, false, 'A native family profile does not claim an embedded iframe');
      assert.equal(record.links.biographyAction, 'open-house-biography');
      continue;
    }
    assert.equal(record.links.iframeSupported, true, record.stableId);
    assert.equal(record.links.iframeCanonical, true, record.stableId);
    if (record.links.biographyBackLinkSupported) assert.equal(record.links.biographyBackLinkCanonical, true, record.stableId);
  }
});

test('the eight declared rural profiles expose their real biographies and crests without invented warrior art', () => {
  const profiles = report.records.filter(record => record.existingPage.kind === 'family-record');
  assert.deepEqual(profiles.map(record => record.stableId).sort(), FLEISCHSAMMLER_FAMILIES_INDEX.map(row => row.familyId).sort());
  assert.equal(report.summary.familyProfiles, 8);
  for (const locality of FLEISCHSAMMLER_FAMILIES_INDEX) {
    const source = input.projectById.get(locality.familyId);
    const profile = createRuralFamilyCoverageProfile(source, source.family.extensions.houseBiographyModule);
    const row = profiles.find(record => record.stableId === locality.familyId);
    assert.equal(row.existingAuthoring.contentPath, profile.sourcePath);
    assert.ok(fs.statSync(new URL(profile.sourcePath, root)).isFile());
    assert.equal(row.boundProfileImagePath, 'Stammbäume/' + locality.emblem);
    assert.equal(row.profileImageRole, 'family-crest');
    assert.equal(row.boundPageScenePath, '', 'No uncommissioned scene or warrior figure');
    assert.equal(row.availableOriginalArt, false);
    assert.deepEqual(row.actualOriginalScenePaths, []);
    assert.ok(profile.biography.house.biographyText.trim());
    const header = renderHouseBiographyHeader(source.family, profile.biography);
    assert.ok(header.includes(source.family.document.title));
    assert.ok(header.includes(locality.emblem));
  }
});

test('family-profile coverage is source-bound and preserves explicit biography deletion', () => {
  const source = input.projectById.get('haus-ysgellfor');
  for (const mutate of [record => { record.family.document.id = 'wrong-family'; },
    record => { record.family.document.emblem = 'assets/images/placeholders/neutral-crest.png'; },
    record => { delete record.family.extensions.houseBiographyModule; }]) {
    const record = structuredClone(source); mutate(record);
    assert.equal(createRuralFamilyCoverageProfile(record, source.family.extensions.houseBiographyModule), null);
  }
  assert.equal(createRuralFamilyCoverageProfile(input.projectById.get('haus-twyllod'), input.projectById.get('haus-twyllod').family.extensions.houseBiographyModule), null,
    'A missing standalone house page cannot silently become a rural profile');
  const original = structuredClone(source.family);
  assert.equal(createRuralFamilyCoverageProfile(source, null).biography, null, 'Deleted biography is never filled from the seed');
  assert.deepEqual(source.family, original);
  assert.equal(hasCenyrCoverageGaps({ profileLinkIssues: 1 }), true);
});

test('coverage inspection changes neither public family graphs nor existing biographies', () => {
  for (const record of input.project) assert.equal(digest(JSON.stringify(record.family)), before.get(record.id), record.id);
});

test('the real snapshot reconciliation path retains custom house biography text and explicit deletion', () => {
  const seed = input.projectById.get('haus-twyllod').family;
  for (const ownBiography of [null, { ...structuredClone(seed.extensions.houseBiographyModule),
    description: 'Eigene Hausbeschreibung', commentSequence: [{ text: 'Eigene Notiz' }] }]) {
    const saved = structuredClone(seed);
    saved.extensions.sourceRevision = Math.max(0, Number(seed.extensions.sourceRevision || 1) - 1);
    saved.extensions.houseBiographyModule = ownBiography;
    const reconciled = reconcileFamilyWithProjectOrigin({ family: saved, projectOriginFamily: seed }).family;
    assert.deepEqual(reconciled.extensions.houseBiographyModule, ownBiography);
  }
});

test('the recovered Grianlaoch house figure remains the exact supplied original', () => {
  const original = '96f3c78702a67ed36d1a351bb5144b80f57595775df713f1153e6d836de1002b';
  const record = report.records.find(record => record.stableId === 'haus-grianlaoch');
  assert.ok(record?.boundPageScenePath);
  assert.equal(digest(fs.readFileSync(new URL(record.boundPageScenePath, root))), original);
});

test('the read-only CLI checks a supplied dynamic allowlist and refuses an implicit global scan', async () => {
  const messages = [], errors = [];
  assert.equal(await runCenyrCoverageCli(['--check'], { output: value => messages.push(value), error: value => errors.push(value) }), 2);
  assert.equal(messages.length, 0);
  assert.match(errors[0], /Allowlist/);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aleria-cenyr-coverage-'));
  const allowlist = path.join(directory, 'public-ids.json');
  fs.writeFileSync(allowlist, JSON.stringify(allowlistIds));
  try {
    assert.equal(await runCenyrCoverageCli(['--allowlist', allowlist, '--check'], { output: value => messages.push(value), error: value => errors.push(value) }), 0);
    const result = JSON.parse(messages.at(-1));
    assert.equal(result.ok, true);
    assert.equal(result.summary.families, report.records.length);
    assert.ok(!Object.hasOwn(result, 'records'));
  } finally {
    fs.unlinkSync(allowlist);
    fs.rmdirSync(directory);
  }
});
