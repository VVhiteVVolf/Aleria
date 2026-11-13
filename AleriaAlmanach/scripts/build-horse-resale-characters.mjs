import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyCandidates } from '../modules/character-genealogy/genealogy-mapping.js';
import { buildAuthoredCharacterImport } from '../../CharakterDatenbank/lib/authored-character-import.mjs';
import { buildResaleCharacterExports, RESALE_CHARACTER_FEATURE } from '../modules/gwynthor-horse-resale/resale-characters.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url)), diagnostic = path.join(root, 'diagnostics/horse-resale-20261113/characters');
const mode = process.argv[2] || '--plan'; if (process.argv.length > 3 || !['--plan', '--write', '--check'].includes(mode)) throw Error('Use --plan, --write or --check.');
await fs.mkdir(diagnostic, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex'), read = file => fs.readFile(path.join(root, file), 'utf8');
const contextPath = path.join(diagnostic, 'authoring-context.json');
let context = await fs.readFile(contextPath, 'utf8').then(JSON.parse).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
if (!context) { if (mode !== '--plan') throw Error('Plan first.'); context = { authoredAt: new Date().toISOString() }; await fs.writeFile(contextPath, JSON.stringify(context, null, 2) + '\n'); }
const projections = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const bytes = await Promise.all(projections.map(read)), [registry, snapshot, report] = bytes.map(JSON.parse);
const record = FAMILY_REGISTRY.find(r => r.id === 'haus-ruddgraen'), exports = buildResaleCharacterExports(record, context.authoredAt), ids = new Set(exports.map(e => e.character.id));
const existingRecords = await Promise.all(registry.records.filter(r => ids.has(r.firestoreDocumentId)).map(r => read(`CharakterDatenbank/${r.path}`).then(JSON.parse)));
const result = buildAuthoredCharacterImport({ registry, snapshot, report, existingRecords }, exports, RESALE_CHARACTER_FEATURE, createFamilyCandidates(record));
const foreign = chars => chars.filter(c => !ids.has(c.id)); assert.deepEqual(foreign(result.snapshot.characters), foreign(snapshot.characters));
assert.equal(exports.length, 6); assert.equal(result.records.length, 6);
const selected = new Set(result.records.map(r => r.record.recordId));
assert.deepEqual(result.registry.records.filter(r => !selected.has(r.recordId)), registry.records.filter(r => !selected.has(r.recordId)));
const baseline = projections.map((file, i) => ({ file, sha256: hash(bytes[i]) }));
const sourceHashes = exports.map(e => ({ file: e.sourcePath, sha256: hash(JSON.stringify(e, null, 2) + '\n') }));
const plan = { authoredAt: context.authoredAt, baseline, sourceHashes, imported: 6, preserved: foreign(snapshot.characters).length,
  records: result.records.map(r => ({ id: r.record.character.id, path: r.path })) };
const planPath = path.join(diagnostic, 'plan.json');
if (mode === '--plan') await fs.writeFile(planPath, JSON.stringify(plan, null, 2) + '\n');
else {
  if (mode === '--write') { const approved = JSON.parse(await fs.readFile(planPath, 'utf8')); assert.deepEqual(approved.baseline, baseline); assert.deepEqual(approved.sourceHashes, sourceHashes); }
  const outputs = new Map(exports.map(e => [e.sourcePath, JSON.stringify(e, null, 2) + '\n']));
  result.records.forEach(r => outputs.set(`CharakterDatenbank/${r.path}`, JSON.stringify(r.record, null, 2) + '\n'));
  const protectedHashes = await Promise.all(registry.records.filter(r => !selected.has(r.recordId)).map(async r => ({ file: `CharakterDatenbank/${r.path}`, sha256: hash(await read(`CharakterDatenbank/${r.path}`)) })));
  if (mode === '--check') {
    assert.deepEqual(result.registry.records.filter(r => selected.has(r.recordId)), registry.records.filter(r => selected.has(r.recordId)));
    assert.deepEqual(result.snapshot.characters.filter(c => ids.has(c.id)), snapshot.characters.filter(c => ids.has(c.id)));
  } else [result.registry, result.snapshot, result.report].forEach((data, i) => outputs.set(projections[i], JSON.stringify(data, null, 2) + '\n'));
  for (const [file, text] of outputs) {
    if (mode === '--check') assert.equal(await read(file), text, file);
    else { const target = path.join(root, file), previous = await fs.readFile(target).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
      if (previous) { const backup = path.join(diagnostic, 'before', file); await fs.mkdir(path.dirname(backup), { recursive: true }); await fs.writeFile(backup, previous, { flag: 'wx' }).catch(e => { if (e.code !== 'EEXIST') throw e; }); }
      await fs.mkdir(path.dirname(target), { recursive: true }); await fs.writeFile(target, text); }
  }
  for (const p of protectedHashes) assert.equal(hash(await read(p.file)), p.sha256, p.file);
  if (mode === '--write') await fs.writeFile(path.join(diagnostic, 'complete.json'), JSON.stringify({ ...plan, protectedHashes, externalWrites: false }, null, 2) + '\n');
}
console.log(JSON.stringify({ mode, imported: 6, preserved: plan.preserved, externalWrites: false }));
