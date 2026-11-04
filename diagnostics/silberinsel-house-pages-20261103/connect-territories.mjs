// Einmaliger direkter Linkabgleich. Die Gebietsquellen behalten ihre Auswahl.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const version = '20261103-silberinsel-v1';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const pages = new Map();
for (const file of walk('Familien Häuser und Clans/Estryll/Cenyr/Silberinsel').filter(file => path.basename(file) === 'haus.content.mjs')) {
  const { HOUSE_CONTENT: content } = await import(pathToFileURL(path.resolve(file)));
  pages.set(content.id, content.page || 'haus.html');
}
const directory = 'Kontinente/Estryll/Königreich Cenyr/Grafschaft Silberinsel';
let links = 0;
for (const file of walk(directory).filter(file => file.endsWith('.data.mjs'))) {
  const source = readFileSync(file, 'utf8');
  const marker = 'export default createTerritory(';
  const start = source.indexOf(marker) + marker.length;
  if (start < marker.length) throw new Error(`Unbekanntes Gebietsformat: ${file}`);
  const data = JSON.parse(source.slice(start, source.lastIndexOf(');')));
  for (const section of data.families) for (const house of section.houses) {
    if (!pages.has(house.familyId)) continue;
    house.href = `/Familien%20H%C3%A4user%20und%20Clans/${pages.get(house.familyId)}?haus=${house.familyId}`;
    links++;
  }
  const updated = source.slice(0, start).replaceAll('silberinsel-20261019', version) + JSON.stringify(data, null, 2) + ');\n';
  writeFileSync(file, updated.replace(/\r+\n/g, '\n').replaceAll('\n', source.includes('\r\n') ? '\r\n' : '\n'));
}
const registry = 'Kontinente/kontinente.registry.js';
writeFileSync(registry, readFileSync(registry, 'utf8').replace(/(Grafschaft Silberinsel\/[^"\n]+\.data\.mjs\?v=)silberinsel-20261019/g, `$1${version}`));
for (const file of walk(directory).filter(file => file.endsWith('.html'))) writeFileSync(file,
  readFileSync(file, 'utf8').replace('kontinente.registry.js?v=silberinsel-20261019', `kontinente.registry.js?v=${version}`));
console.log(`${links} direkte Hausseitenlinks für ${pages.size} Hausseiten gesetzt.`);
