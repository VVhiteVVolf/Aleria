import { readFile, writeFile } from 'node:fs/promises';

const directory = new URL('../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/', import.meta.url);
const source = JSON.parse(await readFile(new URL('fleischsammler-localities.source.json', directory), 'utf8'));
const dataUrl = new URL('data.json', directory);
const document = JSON.parse(await readFile(dataUrl, 'utf8'));
let changed = false;

for (const location of source.locations) {
  const pin = document.state.pins.find(pin => pin.id === location.pinId);
  if (!pin) throw new Error(`Gwynthorer Ortsmarkierung fehlt: ${location.pinId}`);
  if (pin.x !== location.position[0] || pin.y !== location.position[1]) {
    throw new Error(`Geprüfte Ortsposition wurde verändert: ${location.pinId}`);
  }
  for (const [key, value] of Object.entries(location.patch)) {
    if (JSON.stringify(pin[key]) === JSON.stringify(value)) continue;
    if (process.argv.includes('--check')) {
      throw new Error(`Gwynthorer Ortsakte weicht von ihrer Quelle ab: ${location.pinId}.${key}`);
    }
    pin[key] = structuredClone(value);
    changed = true;
  }
}

if (changed) {
  document.revision += 1;
  document.updatedAt = new Date().toISOString();
  await writeFile(dataUrl, JSON.stringify(document, null, 2) + '\n');
}
console.log(JSON.stringify({ locations: source.locations.length, changed, revision: document.revision }));
