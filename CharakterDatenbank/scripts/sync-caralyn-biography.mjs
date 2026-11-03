import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import '../../AleriaAlmanach/modules/biography/biography-card-rendering.js';
import { planCaralynBiography } from '../../AleriaAlmanach/modules/gwynthor-seven/caralyn-biography-import.mjs';
import { confirmCharacterRecordProjection } from '../lib/character-record-confirmation.mjs';
import { mergeCharacterRecordProjections } from '../lib/character-record-projections.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url)), inputs = new Map();
async function json(file) { const path = resolve(root, file), text = await readFile(path, 'utf8'); inputs.set(path, text); return JSON.parse(text); }
const source = await json('AleriaAlmanach/modules/gwynthor-seven/source/caralyn-biography-20261102.json');
const receipt = await json('diagnostics/caralyn-biography-20261102/publication-verification.json');
assert(receipt.unrelatedCharacterFieldsUnchanged && receipt.characterId === source.characterId);
const prepared = await json('diagnostics/caralyn-biography-20261102/prepared.json');
const breed = await json('diagnostics/caralyn-biography-20261102/breed-correction.json').catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
const now = breed?.reviewedAt || prepared.patch.updatedAt;
const registry = await json('CharakterDatenbank/registry.json'), snapshot = await json('CharakterDatenbank/generated/characters.snapshot.json'), report = await json('CharakterDatenbank/generated/sync-report.json');
const row = registry.records.find(row => row.firestoreDocumentId === source.characterId); assert(row);
const record = await json(`CharakterDatenbank/${row.path}`), person = snapshot.characters.find(person => person.id === source.characterId);
const apply = character => ({ ...character, ...planCaralynBiography(character, source, now).patch });
const character = apply(record.character), projectedPerson = apply(person);
assert.deepEqual(character.combatProfile, record.character.combatProfile);
const sourcePath = 'Charakter Archiv Exporte/Biographien/caralyn-chwedonol-2026-11-02/caralyn-lokaler-abgleich.json';
const confirmation = confirmCharacterRecordProjection({ record, snapshotCharacter: person, path: row.path, character, person: projectedPerson,
  now, sourcePath, exportedCharacter: { id: character.id, name: character.name, biography: character.biography, inventory: character.inventory, updatedAt: character.updatedAt } });
const result = mergeCharacterRecordProjections({ registry, snapshot, report }, [confirmation.projection], [confirmation.exported], snapshot.charTabs);
const publicSource = await json('js/biography/sources/public-biographies.json');
const entry = publicSource.entries.find(entry => entry.characterIds.includes(character.id)); assert(entry);
const fingerprint = globalThis.AleriaBiographyCards.narrativeFingerprint;
entry.replacedFingerprints = [...new Set([...entry.replacedFingerprints, fingerprint(entry.biography), fingerprint(character.biography)])];
entry.biography = structuredClone(character.biography);
const mentor = entry.biography.biography.connections.find(connection => connection.name === 'Meredithe Chwedonol'); assert(mentor?.image);
entry.biography.biography.knightMentors = [{ name: mentor.name, image: mentor.image, role: 'Rittermutter · Großtante', detail: 'Bildete Caralyn zur Morwyr aus; blieb ihre Vertraute und Ratgeberin.' }];
entry.source = 'AleriaAlmanach/modules/gwynthor-seven/source/caralyn-biography-20261102.json · ausdrücklicher Nutzerimport';
const training = await json('js/biography/sources/knight-training.json');
training.entries[entry.key] = entry.biography.biography.knightMentors.map(({ name, role, detail }) => ({ name, role, detail }));
const outputs = [[`CharakterDatenbank/${row.path}`, confirmation.projection.record], ['CharakterDatenbank/registry.json', result.registry],
  ['CharakterDatenbank/generated/characters.snapshot.json', result.snapshot], ['CharakterDatenbank/generated/sync-report.json', result.report],
  [sourcePath, confirmation.exported], ['js/biography/sources/public-biographies.json', publicSource], ['js/biography/sources/knight-training.json', training]];
const writes = [];
for (const [file, value] of outputs) {
  const path = resolve(root, file), prior = inputs.get(path) ?? await readFile(path, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return ''; });
  const text = JSON.stringify(value, null, 2) + '\n'; if (text !== prior) writes.push([path, text]);
}
if (process.argv.includes('--check')) assert.equal(writes.length, 0, 'Caralyns bestätigte Biografie ist lokal veraltet.');
else { for (const [path, text] of inputs) assert.equal(await readFile(path, 'utf8'), text); for (const [path, text] of writes) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, text); } }
console.log(JSON.stringify({ character: character.name, linkedCreatures: 1, narrativeGoldfish: true, changedFiles: writes.length, checked: process.argv.includes('--check') }));
