import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// These two supplied packages share one data contract. Keep source validation
// and deterministic imports together instead of maintaining parallel importers.
export const PACKAGE_LANGUAGE_SOURCES = Object.freeze([
  { id: 'tlapanui', package: 'Tlapanui-Gesamtpaket-2.000', language: 'Nuatlapa',
    variable: 'TLAPANUI_REFERENCE_DATA', specimen: 'Tavarua_Bildschnitt_Zeichentafel_2.000.png',
    canonicalNames: Object.freeze({ Silverant: 'Sylvarant' }) },
  { id: 'ishtaran', package: 'Ishtaran-Gesamtpaket-1.000', language: 'Tirghan',
    variable: 'ISHTARAN_REFERENCE_DATA', specimen: 'AyluunMondbogen_Zeichentafel.png' }
]);

function assertRecords(records, count, fields, label, { unique = false } = {}) {
  if (!Array.isArray(records) || records.length !== count
      || records.some((record, index) => record.Nr !== index + 1
        || fields.some(field => typeof record[field] !== 'string' || !record[field].trim()))) {
    throw new Error(`${label}: expected ${count} complete, consecutively numbered records.`);
  }
  if (unique && new Set(records.map(record => record[fields[0]].toLocaleLowerCase('de'))).size !== count) {
    throw new Error(`${label}: duplicate ${fields[0]}.`);
  }
}

export async function loadPackageLanguageSource(source) {
  const packageRoot = new URL(`../../../Fonts/${source.package}/`, import.meta.url);
  const data = JSON.parse(await readFile(new URL(`Daten/${source.language}_Sprachdaten_1.000.json`, packageRoot), 'utf8'));
  assertRecords(data.silben, 200, ['Silbe', 'Bedeutung', 'Typ'], `${source.language} word-building elements`);
  assertRecords(data.woerter, 1000, [source.language, 'Deutsch', 'Wortart', 'Kategorie', 'Herleitung'], `${source.language} dictionary`, { unique: true });
  for (const category of ['namen_maennlich', 'namen_weiblich']) {
    assertRecords(data[category], 500, ['Name', 'Geschlecht', 'Status'], `${source.language} ${category}`, { unique: true });
  }
  // Apply later canon corrections only to reference labels. Preserve the
  // supplied package and every dictionary, root and personal-name record.
  if (source.canonicalNames) {
    data.kanon = data.kanon.map(([name, ...details]) => [source.canonicalNames[name] || name, ...details]);
  }
  // Repeated Tirghan spellings can be separate roots, prefixes and suffixes.
  // Their numbered records must survive unchanged, including distinct meanings.
  if (source.id === 'ishtaran') {
    if (data.kanon?.haeuser?.length !== 37 || data.kanon?.orte?.length !== 21) {
      throw new Error('Tirghan: canonical house/place reference is incomplete.');
    }
    const existingNames = new Set([...data.kanon.haeuser, ...data.kanon.orte].map(name => name.toLocaleLowerCase('de')));
    if ([...data.namen_maennlich, ...data.namen_weiblich].some(record => existingNames.has(record.Name.toLocaleLowerCase('de')))) {
      throw new Error('Tirghan: personal-name proposal collides with the supplied house/place reference.');
    }
  }
  return { data, packageRoot };
}

export async function buildPackageLanguageReferences({ check = false } = {}) {
  for (const source of PACKAGE_LANGUAGE_SOURCES) {
    const { data, packageRoot } = await loadPackageLanguageSource(source);
    const dataFile = new URL(`./${source.id}/${source.id}-data.js`, import.meta.url);
    const assetRoot = new URL(`./${source.id}/assets/`, import.meta.url);
    const specimenFile = new URL(`${source.id}-zeichentafel.png`, assetRoot);
    const specimenSource = new URL(`Vorschau/${source.specimen}`, packageRoot);
    const output = `// Generated from Fonts/${source.package}/Daten/. Run npm run build:languages.\n`
      + `const ${source.variable} = Object.freeze(${JSON.stringify(data, null, 2)});\n`;
    if (check) {
      if (await readFile(dataFile, 'utf8') !== output
          || !(await readFile(specimenFile)).equals(await readFile(specimenSource))) {
        throw new Error(`${source.language}: imported reference data or specimen is stale; run npm run build:languages.`);
      }
    } else {
      await mkdir(assetRoot, { recursive: true });
      await writeFile(dataFile, output);
      await copyFile(specimenSource, specimenFile);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPackageLanguageReferences({ check: process.argv.includes('--check') });
  console.log(`Nuatlapa and Tirghan references ${process.argv.includes('--check') ? 'verified' : 'generated'}.`);
}
