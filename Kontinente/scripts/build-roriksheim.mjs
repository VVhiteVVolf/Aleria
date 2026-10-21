import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTerritoryShell } from '../modules/territory-page/territory-shell-template.mjs';

const continentRoot = fileURLToPath(new URL('../', import.meta.url));
const source = JSON.parse(await readFile(new URL('../modules/roriksheim/pages.source.json', import.meta.url), 'utf8'));
const territories = JSON.parse(await readFile(new URL('../../Karten/Aldrimar/roriksheim/territories.import.json', import.meta.url), 'utf8')).territories;
const version = 'roriksheim-20261020d';
const modulePath = path.join(continentRoot, 'modules/roriksheim/territory-page.mjs');
const check = process.argv.includes('--check');

async function output(file, contents) {
  if (check) {
    if (await readFile(file, 'utf8') !== contents) throw new Error(`${path.relative(continentRoot, file)} ist veraltet.`);
  } else {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents, 'utf8');
  }
}

const entries = [];
for (const page of source.pages) {
  const territory = territories.find(t => t.id === page.id);
  if (!territory) throw new Error(`Fehlendes Gebiet: ${page.id}`);
  const relativePage = territory.href.replace('/Kontinente/', '');
  const htmlPath = path.join(continentRoot, relativePage);
  const dataName = page.type === 'Jarltum' ? 'jarltum.data.mjs' : 'herrschaft.data.mjs';
  const dataPath = path.join(path.dirname(htmlPath), dataName);
  let moduleHref = path.relative(path.dirname(dataPath), modulePath).split(path.sep).join('/');
  if (!moduleHref.startsWith('.')) moduleHref = './' + moduleHref;
  await output(htmlPath, renderTerritoryShell({ ...page, kingdom: 'Aldrimar', county: 'Roriksheim', version }));
  await output(dataPath, `import { createTerritory } from '${moduleHref}?v=${version}';\n\nexport default createTerritory('${page.id}');\n`);
  entries.push({
    id: page.id, slug: page.id, aliases: page.id === 'jarltum-roriksheim' ? ['roriksheim'] : [],
    name: page.title, type: page.type, page: relativePage,
    data: path.relative(continentRoot, dataPath).split(path.sep).join('/') + '?v=' + version,
    dataType: 'module', hierarchy: page.hierarchy,
  });
}

// Only this region's delimited section is owned by this generator.
const registryPath = path.join(continentRoot, 'kontinente.registry.js');
const registry = await readFile(registryPath, 'utf8');
const start = '  // BEGIN RORIKSHEIM_GENERATED';
const end = '  // END RORIKSHEIM_GENERATED';
const block = `${start}\n${entries.map(entry => JSON.stringify(entry, null, 2).split('\n').map(line => '  ' + line).join('\n') + ',').join('\n')}\n${end}\n`;
const updated = registry.includes(start)
  ? registry.slice(0, registry.indexOf(start)) + block + registry.slice(registry.indexOf(end) + end.length).replace(/^\r?\n/, '')
  : registry.replace(/(window\.KONTINENTE_REGISTRY\s*=\s*\[\r?\n)/, '$1' + block);
if (!updated.includes(start)) throw new Error('Kontinente-Register nicht erkannt.');
await output(registryPath, updated);
console.log(`Roriksheim: ${source.pages.length} Seiten und Register ${check ? 'geprüft' : 'erzeugt'}.`);
