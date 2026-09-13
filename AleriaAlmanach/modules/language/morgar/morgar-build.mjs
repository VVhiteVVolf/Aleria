import { readFile, writeFile, mkdir, copyFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = new URL('../../../../Fonts/Karnrith-Font-2.000/', import.meta.url);
const dataTarget = new URL('./morgar-data.js', import.meta.url);
const referenceRoot = new URL('./reference/', import.meta.url);
const collator = new Intl.Collator('de', { sensitivity: 'base' });

function assertUnique(values, label) {
  if (new Set(values.map(value => value.toLocaleLowerCase('de'))).size !== values.length) {
    throw new Error(`Duplicate ${label}.`);
  }
}

function assertSpeakable(value) {
  // Digraphs are single sounds; y is a vowel. Every written word has a vowel,
  // at most two adjacent consonant sounds and no silent-letter spelling.
  for (const word of value.toLowerCase().split(' ')) {
    const sounds = word.replace(/kh|th|dh|gh|sh|ch|ng|qu/g, 'k');
    if (!/^[a-z]+$/.test(word) || !/[aeiouy]/.test(sounds) || /[^aeiouy]{3}/.test(sounds)) {
      throw new Error(`Review Morgar pronunciation: ${value}`);
    }
  }
}

export async function loadMorgarReference() {
  const syllables = JSON.parse(await readFile(new URL('morgar-syllables.json', referenceRoot), 'utf8'))
    .map(([syllable, meaning, usage]) => ({ syllable, meaning, usage }));
  const lines = (await readFile(new URL('morgar-words.tsv', referenceRoot), 'utf8')).trim().split(/\r?\n/).slice(1);
  const words = lines.map(line => {
    const fields = line.split('\t');
    if (fields.length !== 5 || fields.some(field => !field.trim())) throw new Error(`Invalid Morgar row: ${line}`);
    const [category, word, syllables, meaning, usage] = fields;
    if (syllables.replaceAll('·', '') !== word) throw new Error(`Morgar syllables do not match ${word}.`);
    assertSpeakable(word);
    return { category, word, syllables, meaning, usage };
  }).sort((left, right) => collator.compare(left.word, right.word));
  const nameGroups = [['masculine', 'Männliche Namen', 500], ['feminine', 'Weibliche Namen', 500], ['unisex', 'Unisex-Namen', 100]];
  const names = await Promise.all(nameGroups.map(async ([id, label, count]) => {
    const values = (await readFile(new URL(`names-${id}.txt`, referenceRoot), 'utf8')).trim().split(/\s+/);
    if (values.length !== count) throw new Error(`Expected ${count} ${id} Morgar names, got ${values.length}.`);
    values.forEach(assertSpeakable);
    if (new Set(values.map(name => name[0])).size !== 26) throw new Error(`Incomplete A–Z coverage: ${id}.`);
    return { id, label, names: values.sort(collator.compare) };
  }));
  assertUnique(words.map(item => item.word), 'Morgar words');
  assertUnique(syllables.map(item => item.syllable), 'Morgar syllables');
  assertUnique(names.flatMap(group => group.names), 'Morgar names across groups');
  const terminology = JSON.parse(await readFile(new URL('morgorn-terminology.json', referenceRoot), 'utf8'));
  const terms = [...terminology.nobleTitles, ...terminology.classes];
  assertUnique(terms.map(term => term.name), 'Morgorn titles and classes');
  for (const term of terms) {
    if (!words.some(word => word.word === term.name.toLowerCase())) throw new Error(`Missing Morgorn term: ${term.name}`);
  }
  if (words.length !== 371 || syllables.length !== 72 || new Set(words.map(word => word.category)).size !== 13) {
    throw new Error('Morgar 2.1 requires 371 words, 72 word-building elements and 13 topics.');
  }
  return { languageVersion: '2.1', fontVersion: '3.000', terminology, syllables, words, names };
}

export async function buildMorgarReference({ check = false } = {}) {
  const data = await loadMorgarReference();
  const output = '// Generated from modules/language/morgar/reference/. Run npm run build:languages.\n'
    + `const MORGAR_REFERENCE_DATA = Object.freeze(${JSON.stringify(data, null, 2)});\n`;
  if (check) {
    if (await readFile(dataTarget, 'utf8') !== output) throw new Error('Morgar data is stale; run npm run build:languages.');
  } else {
    await writeFile(dataTarget, output);
  }
}

export async function copyMorgarAssets({ buildRoot }) {
  const targetRoot = resolve(buildRoot, 'Fonts/Karnrith-Font-2.000');
  await mkdir(targetRoot, { recursive: true });
  const files = ['karnrith.js', 'karnrith.css', 'demo.html', 'Zeichentafel.png', 'Tastaturzeichen.png',
    'Leseprobe.png', 'alphabet.json', 'zeichensatz.json', 'ergaenzungen.json', 'LIZENZ.md', 'README.md', 'Pruefbericht.md'];
  await Promise.all(files.map(file => copyFile(new URL(file, sourceRoot), resolve(targetRoot, file))));
  await Promise.all(['fonts', 'Sprache'].map(folder => cp(new URL(`${folder}/`, sourceRoot), resolve(targetRoot, folder), { recursive: true, force: true })));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildMorgarReference({ check: process.argv.includes('--check') });
  console.log(`Morgar reference ${process.argv.includes('--check') ? 'verified' : 'generated'}.`);
}
