import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { ylvaGuide } from '../modules/ylva-guide.mjs';
import { gaisGuide } from '../modules/gais-guide.mjs';
import { buildGuideModel } from '../modules/guide-model.mjs';
import { renderGuide, renderGuideIndex } from '../modules/guide-template.mjs';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const models = [ylvaGuide, gaisGuide].map(g => buildGuideModel(g, characters.find(c => c.id === g.id)));
const outputs = [...models.map(g => [`${g.slug}.html`, renderGuide(g)]), ['index.html', renderGuideIndex(models)]];
for (const [path, html] of outputs) {
  const url = new URL('../' + path, import.meta.url);
  if (process.argv.includes('--check')) assert.equal((await readFile(url, 'utf8')).replace(/\r\n/g, '\n'), html, 'Guide veraltet: ' + path);
  else await writeFile(url, html);
}
console.log(`Gameplay Guides: ${models.map(g => `${g.name}: ${g.combos.length} geprüfte Kombinationen, ${g.companions.length} Begleiter`).join('; ')}.`);
