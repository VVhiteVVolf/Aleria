// Independent read-only production checks; output is diagnostic only.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = new URL('../../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const trees = new URL('Stammbäume/', root);
const batch = new URL('../', import.meta.url);
const readJson = url => JSON.parse(fs.readFileSync(url, 'utf8'));
const ids = readJson(new URL('coverage-audit/public-family-ids.json', batch));
const allowed = new Set(ids);
const inventory = new Map(readJson(new URL('inventory-current.json', import.meta.url)).map(row => [row.id, row]));
const reuse = new Map(readJson(new URL('reuse-mappings.json', import.meta.url)).filter(row => allowed.has(row.familyId)).map(row => [row.familyId, row]));
const bindings = new Map(readJson(new URL('figure-bindings.json', batch)).filter(row => allowed.has(row.id)).map(row => [row.id, row]));
const before = readJson(new URL('public-families-before.json', batch));
const { FAMILY_REGISTRY } = await import(new URL('Stammbäume/assets/js/data/families.registry.js', root));
const records = new Map(FAMILY_REGISTRY.filter(row => allowed.has(row.id)).map(row => [row.id, row]));
const families = new Map([...records].map(([id, row]) => [id, row.family]));
const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
const galleryHouses = new Map(catalog.houses.map(row => [row.id, row]));
const galleryFigures = new Map(catalog.illustrations.map(row => [row.id, row]));
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), context);
const registry = context.window.HaeuserRegistry;
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const relative = url => path.relative(fileURLToPath(root), fileURLToPath(url)).replaceAll('\\', '/');
const resolve = (src, base) => {
  const url = new URL(src, base); url.search = ''; url.hash = '';
  return { path: relative(url), exists: fs.existsSync(url), ...(fs.existsSync(url) ? { sha256: sha256(fs.readFileSync(url)) } : {}) };
};
const rows = [], failures = [];
for (const id of ids) {
  const row = inventory.get(id), family = families.get(id), entry = registry.byId(id);
  const checks = [];
  const check = (name, passed) => { checks.push({ name, passed: Boolean(passed) }); if (!passed) failures.push(`${id}: ${name}`); };
  check('active registered house page', entry?.status === 'active' && entry.data);
  const dataUrl = new URL(entry.data, feature); dataUrl.search = '';
  const dataContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataUrl, 'utf8'), dataContext);
  const page = dataContext.window.HAEUSER_DATA;
  // Generated pages expose their authored scene under this image-role contract.
  const scene = resolve(page.images['haus-hauptbild'].src, feature);
  const bio = resolve(family.extensions.houseBiographyModule.image, trees);
  check('main scene local and present', scene.exists);
  check('biography uses identical reviewed figure', bio.exists && bio.sha256 === scene.sha256);
  const gallery = galleryHouses.get(id);
  const figures = (gallery?.illustrationIds || []).map(id => galleryFigures.get(id)).filter(Boolean);
  const matching = figures.filter(figure => figure.sha256 === scene.sha256 && figure.houseIds.includes(id));
  check('gallery binds same figure to correct house', matching.length > 0);
  check('gallery file bytes agree with catalog', matching.every(figure => resolve(figure.image, root).sha256 === scene.sha256));
  const frame = new URL(page.familyTreeEmbed.src, feature);
  check('existing canonical read-only tree iframe', frame.searchParams.get('family') === id && frame.searchParams.get('mode') === 'view');
  const origin = reuse.get(id) ? 'reused-existing' : bindings.has(id) ? 'new-reviewed-figure' : 'unclassified';
  check('figure has a reviewed reuse or generation decision', origin !== 'unclassified');
  if (reuse.has(id)) {
    const original = reuse.get(id), preserved = resolve(original.path, root);
    check('existing reviewed asset preserved byte-for-byte', preserved.exists && preserved.sha256 === original.sha256 && scene.sha256 === original.sha256);
  }
  if (bindings.has(id)) {
    const binding = bindings.get(id), staged = resolve(`diagnostics/cenyr-house-completeness-20261103/new-figures/${id}.png`, root);
    const receipt = readJson(new URL(`generation-receipts/${id}.json`, batch));
    check('new production image matches staging and receipt', scene.sha256 === staged.sha256 && scene.sha256 === receipt.sha256 && scene.sha256 === binding.sha256);
  }
  rows.push({ familyId: id, name: row.name, decision: origin, pageData: relative(dataUrl), scene, biographyImage: bio, galleryIllustrationIds: matching.map(figure => figure.id), checks });
}
const graphPreservation = before.map(old => {
  const family = families.get(old.id);
  const unchanged = sha256(JSON.stringify(Object.fromEntries(graphKeys.map(key => [key, family[key]])))) === old.graphFingerprint;
  const profileUnchanged = JSON.stringify(records.get(old.id).houseProfile) === JSON.stringify(old.houseProfile);
  const placementUnchanged = JSON.stringify(records.get(old.id).folderPath) === JSON.stringify(old.folderPath);
  if (!unchanged) failures.push(`${old.id}: existing genealogy changed`);
  if (!profileUnchanged || !placementUnchanged) failures.push(`${old.id}: canonical profile or primary placement changed`);
  return { familyId: old.id, graphUnchanged: unchanged, profileUnchanged, primaryPlacementUnchanged: placementUnchanged };
});
const additional = readJson(new URL('additional-ten-production-plan.json', batch)).map(entry => {
  const family = families.get(entry.id);
  const empty = ['persons', 'partnerships', 'parentages', 'timeJumps', 'cadetBranches'].every(key => family[key].length === 0);
  if (!empty) failures.push(`${entry.id}: new placeholder family contains invented people or relations`);
  return { familyId: entry.id, peopleAndRelationsRemainEmpty: empty };
});
const grian = rows.find(row => row.familyId === 'haus-grianlaoch');
const grianExpected = '96f3c78702a67ed36d1a351bb5144b80f57595775df713f1153e6d836de1002b';
const oldGrian = resolve('Estryll/Cenyr/Sonnenkueste/Gerstekueste/Haus_Grianlaoch/assets/hausdarstellung-2026-11-03.png', feature);
if (grian.scene.sha256 !== grianExpected || !oldGrian.exists) failures.push('Grianlaoch original or retained alternative mismatch');
const result = { publicHouses: ids.length, existingReused: rows.filter(row => row.decision === 'reused-existing').length, newFigures: rows.filter(row => row.decision === 'new-reviewed-figure').length,
  existingGraphCount: graphPreservation.length, graphsUnchanged: graphPreservation.every(row => row.graphUnchanged), newEmptyFamilies: additional,
  grianlaoch: { originalSha256: grianExpected, activeSceneMatchesOriginal: grian.scene.sha256 === grianExpected, previousAlternativePreserved: oldGrian },
  figures: rows, graphPreservation, failures, passed: failures.length === 0 };
fs.writeFileSync(new URL('final-artwork-manifest.json', import.meta.url), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ publicHouses: result.publicHouses, reused: result.existingReused, newFigures: result.newFigures, graphsUnchanged: result.graphsUnchanged, grianOriginal: result.grianlaoch.activeSceneMatchesOriginal, failures, passed: result.passed }));
process.exitCode = result.passed ? 0 : 1;
