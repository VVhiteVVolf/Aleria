import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildStudCharacterExports, studCharacterCandidates, STUD_CHARACTER_FEATURE, KYRIA_CHARACTER_FEATURE, KYRIA_WORLD_ID } from '../modules/gwynthor-horse-studs/stud-characters.mjs';
const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const diagnostic = path.join(root, 'diagnostics/horse-studs-20261113/characters');
const mode = process.argv[2] || '--plan'; if (process.argv.length > 3 || !['--plan', '--write', '--check'].includes(mode)) throw Error('Use --plan, --write or --check.');
const read = file => fs.readFile(path.join(root, file), 'utf8');
const readJson = async file => JSON.parse(await read(file));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await fs.mkdir(diagnostic, { recursive: true });
const contextPath = path.join(diagnostic, 'authoring-context.json');
let context = await fs.readFile(contextPath, 'utf8').then(JSON.parse).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
if (!context) { if (mode !== '--plan') throw Error('Plan first.'); context = { authoredAt: new Date().toISOString() }; await fs.writeFile(contextPath, JSON.stringify(context, null, 2) + '\n'); }
const projectionPaths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const projectionBytes = await Promise.all(projectionPaths.map(read));
const [registry, snapshot, report] = projectionBytes.map(JSON.parse);
const existingKyria = snapshot.characters.find(c => c.id === KYRIA_WORLD_ID);
const exports = buildStudCharacterExports(FAMILY_REGISTRY, { authoredAt: context.authoredAt, existingKyria });
const candidates = studCharacterCandidates(FAMILY_REGISTRY), ids = new Set(exports.map(e => e.character.id));
const originals = await Promise.all(registry.records.filter(r => ids.has(r.firestoreDocumentId)).map(async row => ({ row, data: await readJson(`CharakterDatenbank/${row.path}`) })));
const newExports = exports.filter(e => e.character.id !== KYRIA_WORLD_ID), kyriaExport = exports.filter(e => e.character.id === KYRIA_WORLD_ID);
const first = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords: originals.map(x => x.data) }, newExports, STUD_CHARACTER_FEATURE, candidates);
const result = buildAuthoredCharacterImport({ ...first, existingRecords: originals.map(x => x.data) }, kyriaExport, KYRIA_CHARACTER_FEATURE, candidates);
const records = [...first.records, ...result.records];
for (const item of records) { const original = originals.find(x => x.data.character.id === item.record.character.id); if (original) item.record.local = { ...original.data.local, ...item.record.local }; }
const foreign = values => values.filter(c => !ids.has(c.id));
assert.deepEqual(foreign(result.snapshot.characters), foreign(snapshot.characters));
const selectedRecords = new Set(records.map(r => r.record.recordId));
assert.deepEqual(result.registry.records.filter(r => !selectedRecords.has(r.recordId)), registry.records.filter(r => !selectedRecords.has(r.recordId)));
for (const field of ['inventory', 'combatProfile', 'playerOwner', 'emotes', 'imageSets', 'activeImageSetId']) assert.deepEqual(kyriaExport[0].character[field], existingKyria[field], `Kyria gameplay/avatar field: ${field}`);
assert.equal(records.length, 27); assert.equal(ids.size, 27);
const baseline = projectionPaths.map((file, i) => ({ file, sha256: hash(projectionBytes[i]) }));
const sourceHashes = exports.map(e => ({ file: e.sourcePath, sha256: hash(JSON.stringify(e, null, 2) + '\n') }));
const plan = { mode, authoredAt: context.authoredAt, baseline, sourceHashes, imported: 26, updated: [KYRIA_WORLD_ID], preservedCharacters: foreign(snapshot.characters).length,
  records: records.map(r => ({ id: r.record.character.id, path: r.path, worldPersonId: r.record.identity.worldPersonId })) };
const planPath = path.join(diagnostic, 'plan.json');
if (mode === '--plan') await fs.writeFile(planPath, JSON.stringify(plan, null, 2) + '\n');
else {
  if (mode === '--write') { const approved = JSON.parse(await fs.readFile(planPath, 'utf8')); assert.deepEqual(approved.baseline, baseline, 'Database changed after plan.'); assert.deepEqual(approved.sourceHashes, sourceHashes, 'Character source changed after plan.'); }
  const outputs = new Map(exports.map(e => [e.sourcePath, JSON.stringify(e, null, 2) + '\n']));
  records.forEach(r => outputs.set(`CharakterDatenbank/${r.path}`, JSON.stringify(r.record, null, 2) + '\n'));
  [result.registry, result.snapshot, result.report].forEach((data, i) => outputs.set(projectionPaths[i], JSON.stringify(data, null, 2) + '\n'));
  const protectedHashes = await Promise.all(registry.records.filter(r => !selectedRecords.has(r.recordId)).map(async r => ({ file: `CharakterDatenbank/${r.path}`, sha256: hash(await read(`CharakterDatenbank/${r.path}`)) })));
  for (const [file, text] of outputs) { const target = path.join(root, file); if (mode === '--check') assert.equal(await fs.readFile(target, 'utf8'), text, file);
    else { const before = await fs.readFile(target).catch(e => { if (e.code !== 'ENOENT') throw e; return null; }); if (before) { const backup = path.join(diagnostic, 'before', file); await fs.mkdir(path.dirname(backup), { recursive: true }); await fs.writeFile(backup, before, { flag: 'wx' }).catch(e => { if (e.code !== 'EEXIST') throw e; }); }
      await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, text); } }
  for (const p of protectedHashes) assert.equal(hash(await read(p.file)), p.sha256, p.file);
  if (mode === '--write') await fs.writeFile(path.join(diagnostic, 'complete.json'), JSON.stringify({ ...plan, completedAt: new Date().toISOString(), protectedHashes, externalWrites: false }, null, 2) + '\n');
}
console.log(JSON.stringify({ mode, records: records.length, preserved: plan.preservedCharacters, externalWrites: false }));
