import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PENRUDD_PEOPLE } from '../modules/rotes-tor/penrudd-household.mjs';
import { PENRUDD_APPEARANCES, PENRUDD_PORTRAIT_ORDER } from '../modules/rotes-tor/penrudd-appearances.mjs';
import { TOR_DISHES } from '../modules/rotes-tor/tor-menu.mjs';
import { foodInventoryJob } from './art/food-inventory-prompt.mjs';

const root = new URL('../../', import.meta.url);
const presets = JSON.parse(await readFile(new URL('../docs/art/image-style-presets.json', import.meta.url), 'utf8'));
const style = presets.presets['anime-scene-portrait'].prompt.replace('[ANIME EINTRAGEN]', 'Tales of Xillia/Frieren');
const art = 'AleriaAlmanach/assets/rotes-tor';
const common = `${style}\nUse case: illustration-story. ONE individual character portrait in a 2:3 VERTICAL image. Clearly standing, relaxed uncomplicated pose. UPPER BODY focus: head to upper hips for adults and older children, the full hairstyle visible with comfortable headroom. ONE person only. Ordinary rounded HUMAN ears for Cenyri, Aldrimarers AND Alben; Alben are a human culture, NEVER elves. Clearly readable eyes. Practical fully clothed medieval civilian clothing, modest clean well-kept roadside inn or farm life. Gentle daylight or warm indoor daylight. Quiet simplified setting. No frame, caption, text, watermarks, collage, panels, armor, pointed ears, magical effects or photographic texture. Each person has their own face, hairstyle, expression, pose and clothing; preserve only plausible family resemblance. Do not copy the exact face of a reference. Eyes and hair must match the specified colors, one consistent natural hair color; gray only where specified. Young people must clearly look their actual age. All child and teenager portraits are ordinary nonsexual family portraits in fully covering practical clothes; no adult body proportions, makeup or adult poses. For the toddler, allow the whole small child in the frame to preserve true toddler proportions.\n`;
const portraits = PENRUDD_PORTRAIT_ORDER.map(key => {
  const person = PENRUDD_PEOPLE.find(entry => entry.id === `${key}-penrudd`);
  const look = PENRUDD_APPEARANCES[key];
  const age = look.portraitAge || 1740-Number(person.birth);
  const useExistingStyleReference = ['gwilym', 'enid', 'olwen', 'bethan'].includes(key);
  return { id: `portrait-${key}`, key, kind: 'portrait', personId: person.id, age,
    destination: `${art}/portraits/${key}.png`, aspectRatio: '2:3', transparent: false,
    references: look.references.length ? look.references.map(ref => `${art}/portraits/${ref}.png`) : useExistingStyleReference ? ['AleriaAlmanach/assets/kleiner-durst/portraits/efa.png'] : [],
    prompt: `${common}Character: ${person.name}; ${person.sex === 'male' ? 'male' : 'female'}; ${age} years old. Cultural origin: ${look.culture}. Exact appearance: ${look.description}\nBackground: ${look.background}.\n${look.references.length ? `Attached references are relatives: ${look.references.join(', ')}. Show a believable shared family nose or facial shape where appropriate, but a distinct identity and age. Their eye/hair colors do not override this character's specified BROWN eyes and BROWN hair where stated.` : useExistingStyleReference ? 'Attached portrait is an ART STYLE reference only. Do not copy its person, expression, shabby clothing, pose or background. This inn and farm are comfortable and well maintained.' : 'This is a new, unrelated person: establish her own distinctive face and features, not a copy of the Penrudd family. Follow the specified anime art style.'}`
  };
});
const food = TOR_DISHES.map(item => foodInventoryJob({ id: `food-${item.id}`, key: item.id,
  destination: `${art}/food/${item.id}.png`, visual: item.visual,
  preset: presets.presets['fantasy-inventory-item'].prompt }));
const result = { schemaVersion: 1, date: '2026-10-20', tool: 'built-in image_gen',
  stylePresets: { portraits: 'anime-scene-portrait', food: 'fantasy-inventory-item' }, entries: [...portraits, ...food] };
await mkdir(new URL(`${art}/portraits/`, root), { recursive: true });
await mkdir(new URL(`${art}/food/`, root), { recursive: true });
await writeFile(new URL(`${art}/image-prompts.json`, root), JSON.stringify(result, null, 2)+'\n');
console.log(JSON.stringify({ portraits: portraits.length, food: food.length, manifest: fileURLToPath(new URL(`${art}/image-prompts.json`, root)) }));
