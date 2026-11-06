import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildEleganzStaffCharacterExports, ELEGANZ_STAFF_CHARACTER_FEATURE, ELEGANZ_STAFF_CHARACTERS } from '../modules/goettliche-eleganz/eleganz-sales-characters.mjs';
import { buildEleganzStaffCharacterImport, assertEleganzStaffCharacterExports } from '../modules/goettliche-eleganz/eleganz-sales-character-import.mjs';
import { getEleganzStaffArtworkSets } from '../modules/goettliche-eleganz/eleganz-sales-artwork.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const value = flag => process.argv[process.argv.indexOf(flag) + 1];
const sourceExports = process.argv.includes('--source-exports');
if (sourceExports === process.argv.includes('--artwork')) throw Error('Genau --artwork <manifest.json> oder --source-exports ist erforderlich.');
if (process.argv.includes('--apply') && process.argv.includes('--check')) throw Error('--apply und --check schließen sich aus.');
let artworkRelative = null, artworkFiles = [], exports;
if (sourceExports) {
  exports = await Promise.all(ELEGANZ_STAFF_CHARACTERS.map(person => readFile(resolve(root, `Charakter Archiv Exporte/Göttliche Eleganz Personal/${person.slug}.json`), 'utf8').then(JSON.parse)));
  assertEleganzStaffCharacterExports(exports, { published: true });
} else {
  const artworkPath = resolve(root, value('--artwork'));
  artworkRelative = relative(root, artworkPath).replaceAll('\\', '/');
  if (artworkRelative.startsWith('../') || artworkRelative.includes(':')) throw Error('Bildmanifest muss im Projekt liegen.');
  const artwork = JSON.parse(await readFile(artworkPath, 'utf8'));
  exports = buildEleganzStaffCharacterExports(artwork, { published: process.argv.includes('--published') });
  artworkFiles = Object.values(artwork.people || artwork).flatMap(person => [person.portrait, ...person.sets.flatMap(set => set.emotes)]);
}
const sha256 = value => createHash('sha256').update(value).digest('hex');
const expectedArtworkCount = 3 + exports.reduce((count, entry) => count + getEleganzStaffArtworkSets(entry.character.genealogy.sources[0].personId).reduce((sum, set) => sum + set.labels.length, 0), 0);
if (!sourceExports && (artworkFiles.length !== expectedArtworkCount || new Set(artworkFiles.map(image => image.localPath)).size !== expectedArtworkCount)) throw Error(`${expectedArtworkCount} eindeutige lokale Kunstdateien erwartet.`);
for (const image of artworkFiles) {
  if (!image.localPath || relative(root, resolve(root, image.localPath)).startsWith('..') || /^(?:[A-Za-z]:|\/)/.test(image.localPath)) throw Error('Kunstdatei liegt außerhalb des Projekts.');
  if (sha256(await readFile(resolve(root, image.localPath))) !== image.sha256) throw Error(`Bildbytes weichen vom Manifest ab: ${image.localPath}`);
}
const paths = ['CharakterDatenbank/registry.json', 'CharakterDatenbank/generated/characters.snapshot.json', 'CharakterDatenbank/generated/sync-report.json'];
const bytes = await Promise.all(paths.map(path => readFile(resolve(root, path))));
const [registry, snapshot, report] = bytes.map(value => JSON.parse(value.toString('utf8')));
const ids = new Set(exports.map(entry => entry.character.id));
const existingRecords = await Promise.all(registry.records.filter(row => ids.has(row.firestoreDocumentId))
  .map(row => readFile(resolve(root, 'CharakterDatenbank', row.path), 'utf8').then(JSON.parse)));
const result = buildEleganzStaffCharacterImport({ registry, snapshot, report, existingRecords }, exports);
const outputs = [
  ...exports.map(entry => [entry.sourcePath, entry]),
  ...result.records.map(item => [`CharakterDatenbank/${item.path}`, item.record]),
  ...paths.map((path, index) => [path, [result.registry, result.snapshot, result.report][index]])
];
const plan = {
  schema: 'aleria.authored-character-import-plan', schemaVersion: 1, feature: ELEGANZ_STAFF_CHARACTER_FEATURE,
  artworkPath: artworkRelative, sourceExports, publishedArtwork: sourceExports || process.argv.includes('--published'), productionWrites: 0,
  imported: 3, verifiedArtworkFiles: artworkFiles.length, existingCharactersPreserved: snapshot.characters.filter(character => !ids.has(character.id)).length,
  baseline: paths.map((path, index) => ({ path, sha256: sha256(bytes[index]) })),
  characters: result.records.map(item => ({ id: item.record.character.id, name: item.record.character.name,
    path: `CharakterDatenbank/${item.path}`, sourcePath: exports.find(entry => entry.character.id === item.record.character.id).sourcePath,
    familyTree: item.record.links.familyTree, imageSets: item.record.character.imageSets.map(set => ({ id: set.id, name: set.name, emotes: set.emotes.length })) })),
  outputs: outputs.map(([path, data]) => ({ path, sha256: sha256(JSON.stringify(data, null, 2) + '\n') }))
};
const planPath = resolve(root, 'diagnostics/efa-avatars-20261106/publication/local-character-import-plan.json');
if (!sourceExports) {
  await mkdir(resolve(planPath, '..'), { recursive: true });
  await writeFile(planPath, JSON.stringify(plan, null, 2) + '\n');
}
if (process.argv.includes('--apply') || process.argv.includes('--check')) {
  for (const [path, data] of outputs) {
    if (!path.startsWith('CharakterDatenbank/') && !path.startsWith('Charakter Archiv Exporte/Göttliche Eleganz Personal/')) throw Error(`Ungültiger Figuren-Ausgabepfad: ${path}`);
    const target = pathToFileURL(resolve(root, path));
    const text = JSON.stringify(data, null, 2) + '\n';
    if (process.argv.includes('--check')) {
      if (await readFile(target, 'utf8') !== text) throw Error(`Veralteter Personalimport: ${path}`);
    } else {
      await mkdir(new URL('.', target), { recursive: true });
      await writeFile(target, text);
    }
  }
}
if (process.argv.includes('--apply') && !sourceExports) {
  const receiptPath = resolve(planPath, '../local-character-import-receipt.json');
  try { await writeFile(receiptPath, JSON.stringify({ ...plan, applied: true, productionWrites: 0 }, null, 2) + '\n', { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
console.log(JSON.stringify({ imported: 3, applied: process.argv.includes('--apply'), checked: process.argv.includes('--check'),
  existingCharactersPreserved: plan.existingCharactersPreserved, sourceExports, planPath: sourceExports ? null : relative(root, planPath).replaceAll('\\', '/') }));
