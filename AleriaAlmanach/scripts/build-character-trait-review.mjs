import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, isAbsolute, dirname, sep } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { mergeCharacterRecordProjections } from '../../CharakterDatenbank/lib/character-record-projections.mjs';
import { REVIEWED_CHARACTER_TRAITS } from '../modules/character-trait-review/reviewed-character-traits.js';
import { projectTraitReviewRecord } from '../modules/character-trait-review/character-trait-review-database.mjs';
import { hasExactReviewedBiographyTraitCards, reviewedBiographyTraitCards } from '../modules/character-trait-review/character-trait-review-model.js';
const root = fileURLToPath(new URL('../../', import.meta.url));
const checking = process.argv.includes('--check'), inputs = new Map(), outputs = new Map();
async function json(path) { const full = resolve(root, path), text = await readFile(full, 'utf8'); inputs.set(full, text); return JSON.parse(text); }
function output(path, value) { outputs.set(resolve(root, path), JSON.stringify(value, null, 2) + '\n'); }
const registry = await json('CharakterDatenbank/registry.json'), snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json');
const report = await json('CharakterDatenbank/generated/sync-report.json');
const before = await json('diagnostics/character-trait-review-20261102/local-before.json');
const { reviewedAt } = await json('diagnostics/character-trait-review-20261102/review-meta.json');
const records = [], exports = [];
for (const assignment of REVIEWED_CHARACTER_TRAITS) {
  const matches = registry.records.filter(row => row.firestoreDocumentId === assignment.id);
  assert.equal(matches.length, 1, `${assignment.name}: eindeutiger Datensatz erforderlich`);
  const row = matches[0], recordPath = resolve(root, 'CharakterDatenbank', row.path);
  const within = relative(resolve(root, 'CharakterDatenbank/records'), recordPath);
  assert(within && !isAbsolute(within) && within !== '..' && !within.startsWith(`..${sep}`));
  const record = await json(relative(root, recordPath));
  const person = snapshot.characters.find(character => character.id === assignment.id);
  assert(person && person.localRecord.recordId === record.recordId);
  const baseline = before.profiles.find(row => row.id === assignment.id)?.character;
  assert(baseline);
  const sourcePath = `Charakter Archiv Exporte/Traitabgleich 2026-11-02/${assignment.id}.json`;
  const next = projectTraitReviewRecord({ record, snapshotCharacter: person, baseline, assignment, reviewedAt, sourcePath, path: row.path });
  records.push(next); exports.push({ sourcePath, exportedAt: reviewedAt });
  output(relative(root, recordPath), next.record); output(sourcePath, next.exported);
}
const merged = mergeCharacterRecordProjections({ registry, snapshot, report }, records, exports, snapshot.charTabs);
output('CharakterDatenbank/registry.json', merged.registry);
output('CharakterDatenbank/generated/characters.snapshot.json', merged.snapshot);
output('CharakterDatenbank/generated/sync-report.json', merged.report);
const canonical = await json('js/biography/sources/public-biographies.json');
const canonicalBefore = await json('diagnostics/character-trait-review-20261102/public-biographies-before.json');
for (const entry of canonical.entries) {
  const assignment = REVIEWED_CHARACTER_TRAITS.find(row => entry.characterIds.includes(row.id) || entry.characterIds.includes(row.onlineId));
  if (!assignment) continue;
  const old = canonicalBefore.entries.find(row => row.key === entry.key);
  const cards = reviewedBiographyTraitCards(assignment.id), body = entry.biography.biography;
  if (hasExactReviewedBiographyTraitCards(body.abilities, assignment.id)) continue;
  if (!isDeepStrictEqual(body.abilities, cards)) assert.deepEqual(body.abilities, old.biography.biography.abilities, `${assignment.name}: Persönlichkeitstext inzwischen bearbeitet.`);
  body.abilities = cards; body.abilitiesTitle = 'Eigenschaften';
}
output('js/biography/sources/public-biographies.json', canonical);
const gawainExportPath = 'Charakter Archiv Exporte/gawain-draig-oeffentliche-biografie-2026-11-01.json';
const gawainExport = await json(gawainExportPath);
const gawainId = 'q1QtSIug74FzzwUAqWrs', gawainBody = gawainExport.character.biography.biography;
if (!hasExactReviewedBiographyTraitCards(gawainBody.abilities, gawainId)) {
  const original = canonicalBefore.entries.find(entry => entry.characterIds.includes(gawainId));
  assert.deepEqual(gawainBody.abilities, original?.biography.biography.abilities, 'Gawain: Persönlichkeitstext im Quellbeleg inzwischen bearbeitet.');
  gawainBody.abilities = reviewedBiographyTraitCards(gawainId);
  gawainBody.abilitiesTitle = 'Eigenschaften';
}
output(gawainExportPath, gawainExport);
const changed = [];
for (const [path, value] of outputs) {
  let previous = inputs.get(path);
  if (previous === undefined) { try { previous = await readFile(path, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
  if (previous !== value) changed.push([path, value]);
}
if (checking && changed.length) throw Error(`Traitabgleich veraltet: ${changed.map(([path]) => relative(root, path)).join(', ')}`);
if (!checking) {
  for (const [path, text] of inputs) assert.equal(await readFile(path, 'utf8'), text, 'Eine Eingabe wurde während des Abgleichs verändert.');
  for (const [path, value] of changed) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, value); }
}
console.log(JSON.stringify({ reviewedProfiles: records.length, assignedTraits: REVIEWED_CHARACTER_TRAITS.reduce((sum, row) => sum + row.traits.length, 0), maximumPerProfile: 3,
  changedFiles: changed.length, characters: merged.registry.count, onlineWrites: 0 }));
