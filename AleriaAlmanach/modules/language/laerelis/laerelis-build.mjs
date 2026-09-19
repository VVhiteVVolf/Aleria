import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceFile = new URL('../../../../Fonts/Laerelis Font/Laerelis_Vorschau_Einzeldatei.html', import.meta.url);
const dataFile = new URL('./laerelis-data.js', import.meta.url);
const fontFile = new URL('./assets/LaerelisLichtfluss-Regular.woff', import.meta.url);

function assertCollection(items, count, field, label) {
  if (!Array.isArray(items) || items.length !== count
      || items.some(item => typeof item[field] !== 'string' || !item[field].trim())
      || new Set(items.map(item => item[field].toLocaleLowerCase('de'))).size !== count) {
    throw new Error(`Laerelis: expected ${count} distinct ${label}.`);
  }
}

export async function loadLaerelisSource() {
  const html = await readFile(sourceFile, 'utf8');
  const json = html.match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  const encodedFont = html.match(/data:font\/woff;base64,([A-Za-z0-9+/=]+)/)?.[1];
  if (!json || !encodedFont) throw new Error('Laerelis preview must contain its reference data and WOFF font.');
  const data = JSON.parse(json);
  assertCollection(data.alphabet, 25, 'laut', 'letters');
  assertCollection(data.wortstaemme, 400, 'stamm', 'roots');
  assertCollection(data.funktionswoerter, 132, 'form', 'function words');
  assertCollection(data.sachwoerter, 1000, 'wort', 'dictionary words');
  assertCollection(data.namenspartikeln, 6, 'form', 'name particles');
  assertCollection(data.namen, 1800, 'vollform', 'names');
  for (const category of ['maennlich', 'weiblich', 'sippe_haus']) {
    assertCollection(data.namen.filter(item => item.kategorie === category), 600, 'vollform', `${category} names`);
  }
  const roots = new Set(data.wortstaemme.map(item => item.id));
  for (const word of data.sachwoerter) {
    for (const id of word.aufbau.match(/R\d{3}/g) || []) {
      if (!roots.has(id)) throw new Error(`Laerelis: unknown root ${id} in ${word.wort}.`);
    }
  }
  const font = Buffer.from(encodedFont, 'base64');
  if (font.toString('ascii', 0, 4) !== 'wOFF' || font.readUInt32BE(8) !== font.length) {
    throw new Error('Laerelis: invalid embedded WOFF font.');
  }
  return { data, font };
}

export async function buildLaerelisReference({ check = false } = {}) {
  const { data, font } = await loadLaerelisSource();
  const output = '// Generated from Fonts/Laerelis Font/Laerelis_Vorschau_Einzeldatei.html. Run npm run build:languages.\n'
    + `const LAERELIS_REFERENCE_DATA = Object.freeze(${JSON.stringify(data, null, 2)});\n`;
  if (check) {
    if (await readFile(dataFile, 'utf8') !== output || !(await readFile(fontFile)).equals(font)) {
      throw new Error('Laerelis data or font is stale; run npm run build:languages.');
    }
    return;
  }
  await mkdir(new URL('./assets/', import.meta.url), { recursive: true });
  await writeFile(dataFile, output);
  await writeFile(fontFile, font);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildLaerelisReference({ check: process.argv.includes('--check') });
  console.log(`Laerelis reference and font ${process.argv.includes('--check') ? 'verified' : 'generated'}.`);
}
