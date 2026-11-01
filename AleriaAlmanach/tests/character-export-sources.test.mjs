import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { readCharacterExportOverlays } from '../../CharakterDatenbank/lib/character-export-sources.mjs';
import { buildCharacterDatabase } from '../../CharakterDatenbank/lib/character-database-model.mjs';

async function fixture(t) {
  const workspaceRoot = await mkdtemp(join(tmpdir(), 'aleria-public-character-sources-'));
  t.after(() => rm(workspaceRoot, { recursive: true, force: true }));
  const archiveRoot = join(workspaceRoot, 'public-archive');
  await mkdir(archiveRoot);
  const sourcePath = join(archiveRoot, 'archive.json');
  await writeFile(sourcePath, JSON.stringify({ type: 'aleria-character-archive', characters: [] }));
  return { workspaceRoot, archiveRoot, sourcePath, registeredSources: [] };
}
async function exported(input, name, character, extra = {}) {
  const path = join(input.archiveRoot, name);
  await mkdir(join(path, '..'), { recursive: true });
  await writeFile(path, JSON.stringify({ type: 'aleria-character', character, ...extra }));
  return relative(input.workspaceRoot, path);
}

test('registered nested sources preserve imported people and replacement gameplay without recursive discovery', async t => {
  const input = await fixture(t);
  await exported(input, 'top.json', { id: 'known', name: 'Known', inventory: { items: [{ id: 'old' }] } });
  const gameplay = { id: 'known', name: 'Known', updatedAt: '2026-11-01T01:00:00Z', inventory: { items: [] }, combatProfile: { hp: { current: 9 } } };
  input.registeredSources.push(await exported(input, 'approved/nested-runtime.json', gameplay, { mergeStrategy: 'replace-exported-fields' }));
  input.registeredSources.push(await exported(input, 'approved/new-person.json', { id: 'imported', name: 'Imported' }));
  await exported(input, 'unregistered/not-public.json', { id: 'unregistered', name: 'Unregistered' });
  input.registeredSources.push(input.registeredSources[0]);
  const overlays = await readCharacterExportOverlays(input);
  assert.equal(overlays.length, 3);
  const database = buildCharacterDatabase({ type: 'aleria-character-archive', characters: overlays.map(row => row.character) }, []);
  assert.equal(database.records.length, 2);
  const record = database.records.find(row => row.record.character.id === 'known').record.character;
  assert.deepEqual(record.inventory, gameplay.inventory);
  assert.deepEqual(record.combatProfile, gameplay.combatProfile);
  assert.ok(!database.records.some(row => row.record.character.id === 'unregistered'));
});

test('top-level unrelated JSON is ignored but lost or invalid registered sources fail visibly', async t => {
  const input = await fixture(t);
  await writeFile(join(input.archiveRoot, 'other.json'), 'not JSON');
  assert.deepEqual(await readCharacterExportOverlays(input), []);
  const known = await exported(input, 'nested/person.json', { id: 'person' });
  for (const content of ['broken JSON', JSON.stringify({ type: 'aleria-character-archive', characters: [] })]) {
    await writeFile(join(input.workspaceRoot, known), content);
    await assert.rejects(readCharacterExportOverlays({ ...input, registeredSources: [known] }), /Registrierte öffentliche Charakterquelle/);
  }
  await assert.rejects(readCharacterExportOverlays({ ...input, registeredSources: ['public-archive/nested/missing.json'] }), /Registrierte öffentliche Charakterquelle/);
});

test('registered paths cannot select absolute paths, private siblings, traversal or non-JSON files', async t => {
  const input = await fixture(t);
  for (const source of [join(input.archiveRoot, 'absolute.json'), '../private/person.json', 'public-archive/../private/person.json', 'public-archive/person.txt']) {
    await assert.rejects(readCharacterExportOverlays({ ...input, registeredSources: [source] }), /öffentlichen relativen Archivpfad|Ungültige öffentliche Charakterquelle/);
  }
});

test('registered nested junctions cannot expose sources outside the approved archive', async t => {
  const input = await fixture(t), outside = join(input.workspaceRoot, 'private');
  await mkdir(outside);
  await writeFile(join(outside, 'person.json'), JSON.stringify({ type: 'aleria-character', character: { id: 'secret' } }));
  await symlink(outside, join(input.archiveRoot, 'escape'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(readCharacterExportOverlays({ ...input, registeredSources: ['public-archive/escape/person.json'] }), /Ungültige öffentliche Charakterquelle/);
});
