import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { buildLandfamilienRegistrations } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';

if (process.argv.slice(2).some(argument => argument !== '--check')) {
  throw new Error('Verwendung: build-gwynthor-landfamilien.mjs [--check]');
}

const registrations = buildLandfamilienRegistrations();
const outputs = new Map([
  [new URL('../modules/gwynthor-landfamilien/landfamilien-data.js', import.meta.url),
    renderArchiveSectionRegistration('registerGwynthorLandfamilien', registrations, 'scripts/build-gwynthor-landfamilien.mjs')]
]);
for (const registration of registrations) {
  const { tab, path, description: desc, icon: iconUrl, entry } = registration;
  outputs.set(new URL(`../../Charakter Archiv Exporte/Module/Gwynthorer Landfamilien/${entry.id}-2026-11-07.json`, import.meta.url),
    JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-11-07T00:00:00Z',
      module: { type: 'aleria-module', version: 1, section: { key: path.at(-1), tab, path, desc, iconUrl }, entry } }, null, 2) + '\n');
}
for (const [url, content] of outputs) {
  if (process.argv.includes('--check')) {
    if (await readFile(url, 'utf8') !== content) throw new Error(`Veraltetes Landfamilien-Modulpaket: ${url}`);
  } else {
    await mkdir(new URL('.', url), { recursive: true });
    await writeFile(url, content);
  }
}
console.log(JSON.stringify({ modules: registrations.map(({ path, entry }) => ({ id: entry.id, path, pages: entry.pages.length,
  scenes: entry.pages.filter(page => page.sessionPage).length, livingCast: entry.sessionCast.length })),
  outputs: outputs.size, deployed: false, gameplayWrites: false }));
