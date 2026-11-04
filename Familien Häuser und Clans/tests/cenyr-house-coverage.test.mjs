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

test('the real dynamic public scope has active pages, effective biographies and locally bound house art', () => {
  assert.equal(report.records.length, new Set(allowlistIds).size);
  const gaps = report.records.filter(record => Object.values(record.missing).some(Boolean))
    .map(record => ({ id: record.stableId, missing: record.missing }));
  assert.deepEqual(gaps, []);
  assert.equal(report.summary.unreviewedPublicScopedFamilies, 0);
  assert.equal(hasCenyrCoverageGaps(report.summary), false);
  for (const record of report.records) {
    assert.equal(record.existingPage.canonicalDataId, record.stableId);
    assert.ok(record.existingAuthoring.present, record.stableId);
    assert.ok(fs.existsSync(new URL(record.boundPageScenePath, root)), record.stableId);
  }
});

test('actual house frames and supported biography return links use the matching canonical local destinations', () => {
  for (const record of report.records) {
    assert.equal(record.links.iframeSupported, true, record.stableId);
    assert.equal(record.links.iframeCanonical, true, record.stableId);
    if (record.links.biographyBackLinkSupported) assert.equal(record.links.biographyBackLinkCanonical, true, record.stableId);
  }
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
