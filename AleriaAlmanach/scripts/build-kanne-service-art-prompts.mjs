import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { KANNE_SERVICE_ICONS } from '../modules/krumme-kanne/krumme-kanne-services.mjs';
const preset = JSON.parse(await readFile(new URL('../docs/art/image-style-presets.json', import.meta.url), 'utf8')).presets['fantasy-inventory-item'].prompt;
const references = ['AleriaAlmanach/assets/krumme-kanne/food/gerstenbruehe.png', 'AleriaAlmanach/public/assets/house-armor/celtigerns-wacht/haus-gafyr-harnisch-v1.png'];
const entries = KANNE_SERVICE_ICONS.map(icon => ({ id: `kanne-service-${icon.id}`,
  destination: `AleriaAlmanach/assets/krumme-kanne/services/${icon.id}.png`, transparent: true, references,
  prompt: `${preset.replace('[GEGENSTAND]', icon.visual)}\nONE small SERVICE ICON for a welcoming medieval veterans tavern. Rustic oak, worn leather, plain iron, ivory linen, muted blue wool. Same hand-painted fantasy inventory style as references, clear dark contours and simple readable shapes. Center the complete compact object with a clean transparent margin. No people, anatomy, lettering, heraldry, scene, floor, shadow or glow. Genuine transparent PNG.`
}));
await mkdir(new URL('../assets/krumme-kanne/services/', import.meta.url), { recursive: true });
await writeFile(new URL('../assets/krumme-kanne/services/image-prompts.json', import.meta.url), JSON.stringify({ schemaVersion: 1, module: 'Die Krumme Kanne · Services', tool: 'built-in image_gen', entries }, null, 2) + '\n');
