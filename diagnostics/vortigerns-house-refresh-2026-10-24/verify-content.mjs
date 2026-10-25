// Einmaliger Übernahmebeleg für Quellen, Links, Bilder und unveränderte Graphen.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHousePageData, createHouseBiography } from '../../Familien Häuser und Clans/modules/house-content/house-content-outputs.mjs';

const work = 'diagnostics/vortigerns-house-refresh-2026-10-24';
const previous = JSON.parse(readFileSync(`${work}/previous-defaults.json`, 'utf8'));
const sources = JSON.parse(readFileSync(`${work}/refresh-audit.json`, 'utf8'));
const originals = JSON.parse(readFileSync(`${work}/source-audit.json`, 'utf8'));
const catalog = JSON.parse(readFileSync('Gallerien/krieger/data/catalog.json', 'utf8'));
const digest = value => createHash('sha256').update(value).digest('hex');
const results = [];
for (const source of sources) {
  const record = FAMILY_REGISTRY.find(record => record.id === source.id);
  const { HOUSE_CONTENT: content } = await import(pathToFileURL(path.resolve(source.file)));
  const page = createHousePageData(content);
  const bio = createHouseBiography(content);
  const graph = Object.fromEntries(['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'].map(key => [key, record.family[key]]));
  const graphSha = digest(JSON.stringify(graph));
  assert.equal(graphSha, previous[source.id].graphFingerprint, `${source.id}: Familiengraph verändert`);
  assert.deepEqual(record.family.extensions.houseBiographyModule, bio, `${source.id}: Bio nicht im Register`);
  assert.match(page.familyTreeEmbed.src, new RegExp(`family=${source.id}&mode=view`));
  assert.deepEqual(page.hiddenProfileGroups, ['military']);
  for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(content.profile[key], '');
  for (const key of ['milestoneOne', 'milestoneTwo', 'patron', 'knightingPatron']) assert.equal(content.profile[key], '');
  for (const image of Object.values(page.images)) {
    if (image.src) assert.ok(existsSync(path.resolve('Familien Häuser und Clans', image.src)), `${source.id}: Bild fehlt: ${image.src}`);
    if (image.href?.includes('Stammbaum')) {
      const url = new URL(image.href, 'http://local/Familien/');
      const target = FAMILY_REGISTRY.find(record => record.id === url.searchParams.get('family'));
      assert.ok(target, `Zielhaus fehlt: ${image.href}`);
      if (url.searchParams.has('person')) assert.ok(target.family.persons.some(person => person.id === url.searchParams.get('person')), `Zielperson fehlt: ${image.href}`);
    }
  }
  assert.ok(existsSync(path.resolve('Familien Häuser und Clans', content.territoryHref)), `${source.id}: Herrschaftslink fehlt`);
  const house = catalog.houses.find(house => house.id === source.id);
  const imageSha = digest(readFileSync(source.image));
  const galleryImage = house.illustrationIds.map(id => catalog.illustrations.find(image => image.id === id)).find(image => image.sha256 === imageSha);
  assert.ok(galleryImage, `${source.id}: Hauptbild fehlt in Galerie`);
  const original = originals.find(original => original.id === source.id);
  if (original) {
    assert.equal(imageSha, original.imageSha256, `${source.id}: Originaldarstellung verändert`);
    assert.equal(digest(readFileSync(original.archive)), original.sha256, `${source.id}: Originalquelle verändert`);
  }
  results.push({ id: source.id, graphUnchanged: true, graphSha256: graphSha, galleryImage: galleryImage.id,
    originalImageUnchanged: !!original, bioWords: Object.values(content.biographySummary).filter(value => typeof value === 'string').join(' ').split(/\s+/).length,
    prepared: content.prepared, personLinksValid: true, imagesPresent: true });
}
writeFileSync(`${work}/content-verification.json`, JSON.stringify({ checked: results.length, passed: true, houses: results }, null, 2) + '\n');
console.log(`${results.length} Häuser: Graphen unverändert; Originalbilder, Bios, Personenlinks und Galeriezuordnung gültig.`);
