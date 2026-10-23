import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderTerritoryShell } from '../modules/territory-page/territory-shell-template.mjs';

// Each regional generator owns only its pages and its delimited registry section.
export async function buildTerritoryRegion({ slug, region, kingdom, version, mapFolder = `${kingdom}/${slug}`, check = false }) {
  const continentRoot = fileURLToPath(new URL('../', import.meta.url));
  const source = JSON.parse(await readFile(new URL(`../modules/${slug}/pages.source.json`, import.meta.url), 'utf8'));
  const territories = JSON.parse(await readFile(new URL(`../../Karten/${mapFolder}/territories.import.json`, import.meta.url), 'utf8')).territories;
  const modulePath = path.join(continentRoot, `modules/${slug}/territory-page.mjs`);
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
    await output(htmlPath, renderTerritoryShell({ ...page, kingdom, county: region, version, generator: `build-${slug}.mjs` }));
    await output(dataPath, `import { createTerritory } from '${moduleHref}?v=${version}';\n\nexport default createTerritory('${page.id}');\n`);
    entries.push({
      id: page.id, slug: page.id, aliases: page.aliases ?? (page.type === 'Jarltum' ? [slug] : []),
      name: page.title, type: page.type, page: relativePage,
      data: path.relative(continentRoot, dataPath).split(path.sep).join('/') + '?v=' + version,
      dataType: 'module', hierarchy: page.hierarchy,
    });
  }
  const registryPath = path.join(continentRoot, 'kontinente.registry.js');
  const registry = await readFile(registryPath, 'utf8');
  const marker = slug.toUpperCase().replaceAll('-', '_');
  const start = `  // BEGIN ${marker}_GENERATED`, end = `  // END ${marker}_GENERATED`;
  const block = `${start}\n${entries.map(entry => JSON.stringify(entry, null, 2).split('\n').map(line => '  ' + line).join('\n') + ',').join('\n')}\n${end}\n`;
  const updated = registry.includes(start)
    ? registry.slice(0, registry.indexOf(start)) + block + registry.slice(registry.indexOf(end) + end.length).replace(/^\r?\n/, '')
    : registry.replace(/(window\.KONTINENTE_REGISTRY\s*=\s*\[\r?\n)/, '$1' + block);
  if (!updated.includes(start)) throw new Error('Kontinente-Register nicht erkannt.');
  await output(registryPath, updated);
  console.log(`${region}: ${source.pages.length} Seiten und Register ${check ? 'geprüft' : 'erzeugt'}.`);
}
