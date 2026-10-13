import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { GUIDE_REGISTRY } from '../modules/guide-registry.mjs';
import { buildGuideModel } from '../modules/guide-model.mjs';
import { renderGuide, renderGuideIndex } from '../modules/guide-template.mjs';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
assert.equal(new Set(GUIDE_REGISTRY.map(g => g.slug)).size, GUIDE_REGISTRY.length, 'Doppelte Guide-URL');
assert.equal(new Set(GUIDE_REGISTRY.map(g => g.characterId)).size, GUIDE_REGISTRY.length, 'Doppelter Charakter-Guide');
const models = [];
for (const entry of GUIDE_REGISTRY) {
  assert.match(entry.slug, /^[a-z0-9-]+$/);
  assert.match(entry.editorialModule, /^[a-z0-9-]+\.mjs$/);
  const module = await import(new URL('../modules/' + entry.editorialModule, import.meta.url));
  const guide = module[entry.editorialExport];
  assert.equal(guide.id, entry.characterId); assert.equal(guide.slug, entry.slug);
  models.push(buildGuideModel(guide, characters.find(c => c.id === entry.characterId)));
}
const outputs = [...models.map(g => [`${g.slug}.html`, renderGuide(g)]), ['index.html', renderGuideIndex(models)]];
for (const [path, document] of outputs) {
  const html = document.replace(/[\t ]+$/gm, '');
  const url = new URL('../' + path, import.meta.url);
  if (process.argv.includes('--check')) assert.equal((await readFile(url, 'utf8')).replace(/\r\n/g, '\n'), html, 'Guide veraltet: ' + path);
  else await writeFile(url, html);
}
console.log(`Gameplay Guides: ${models.map(g => `${g.name}: ${g.combos.length} geprüfte Kombinationen, ${g.companions.length} Begleiter`).join('; ')}.`);
