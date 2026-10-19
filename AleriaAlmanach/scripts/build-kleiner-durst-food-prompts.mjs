import { readFile, writeFile } from 'node:fs/promises';
import { DURST_DISHES } from '../modules/kleiner-durst/durst-menu.mjs';
import { foodInventoryJob } from './art/food-inventory-prompt.mjs';

const target = new URL('../assets/kleiner-durst/image-prompts.json', import.meta.url);
const manifest = JSON.parse(await readFile(target, 'utf8'));
const presets = JSON.parse(await readFile(new URL('../docs/art/image-style-presets.json', import.meta.url), 'utf8'));
for (const dish of DURST_DISHES) {
  const index = manifest.entries.findIndex(entry => entry.id === dish.id);
  if (index < 0) throw new Error(`Missing food art record: ${dish.id}`);
  const old = manifest.entries[index];
  const history = old.stylePreset === 'fantasy-inventory-item' ? old.iterations : [
    ...(old.iterations || []), { ...old, status: 'rejected', reason: 'User correction: dishes must be isolated inventory icons, never scene illustrations.' }
  ];
  manifest.entries[index] = { ...foodInventoryJob({ id: dish.id,
    destination: old.destination, visual: dish.visual,
    preset: presets.presets['fantasy-inventory-item'].prompt }), revision: 2, iterations: history };
}
manifest.foodStyleCorrectedAt = '2026-10-19';
manifest.foodStylePreset = 'fantasy-inventory-item';
await writeFile(target, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ food: DURST_DISHES.length, style: manifest.foodStylePreset }));
