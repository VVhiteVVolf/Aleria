// Einmaliger Abgleich der bestehenden Gebietsquellen; keine Laufzeit-Umleitung.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const version = '20261103-tal-der-milane-v1';
const records = JSON.parse(readFileSync(new URL('before.json', import.meta.url), 'utf8'));
const targets = new Set(records.filter(record => !record.folderPath.includes('Antike Crannath Clans')).map(record => record.id));
const large = new Set(['aderyn', 'eryr', 'tylluan', 'mwyalchen', 'gaeth', 'hebog', 'ilyuncu'].map(id => `haus-${id}`));
const directory = 'Kontinente/Estryll/Königreich Cenyr/Grafschaft Tal der Milane';
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
let links = 0;
for (const file of walk(directory).filter(file => file.endsWith('.data.mjs'))) {
  const source = readFileSync(file, 'utf8');
  const marker = 'export default createTerritory(';
  const start = source.indexOf(marker) + marker.length;
  const data = JSON.parse(source.slice(start, source.lastIndexOf(');')));
  for (const section of data.families) for (const house of section.houses) {
    if (!targets.has(house.familyId)) continue;
    house.href = `/Familien%20H%C3%A4user%20und%20Clans/${large.has(house.familyId) ? 'haus.html' : 'kleinehaeuser.html'}?haus=${house.familyId}`;
    links++;
  }
  const updated = source.slice(0, start).replaceAll('tal-der-milane-20261019', version) + JSON.stringify(data, null, 2) + ');\n';
  writeFileSync(file, updated.replace(/\r+\n/g, '\n').replaceAll('\n', source.includes('\r\n') ? '\r\n' : '\n'));
}
const registry = 'Kontinente/kontinente.registry.js';
writeFileSync(registry, readFileSync(registry, 'utf8').replace(/(Grafschaft Tal der Milane\/[^"\n]+\.data\.mjs\?v=)tal-der-milane-20261019/g, `$1${version}`));
for (const file of walk(directory).filter(file => file.endsWith('.html'))) {
  writeFileSync(file, readFileSync(file, 'utf8').replace('kontinente.registry.js?v=tal-der-milane-20261019', `kontinente.registry.js?v=${version}`));
}
console.log(`${links} direkte Hausseitenlinks in sieben vorhandenen Gebietsquellen gesetzt.`);
