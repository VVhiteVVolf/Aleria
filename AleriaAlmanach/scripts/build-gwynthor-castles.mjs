import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { buildCastleRegistrations } from '../modules/gwynthor-castles/castle-modules.mjs';
import { CASTLE_ART, CASTLE_ART_DOCS } from '../modules/gwynthor-castles/castle-art.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const args = process.argv.slice(2);
if (args.some(arg => !['--check', '--prompts'].includes(arg)) || args.length > 1) throw Error('Use build-gwynthor-castles.mjs [--check|--prompts].');
if (args.includes('--prompts')) console.log(JSON.stringify(CASTLE_ART));
else {
  const registrations = buildCastleRegistrations();
  const outputs = new Map([
    ['AleriaAlmanach/modules/gwynthor-castles/castle-data.js', renderArchiveSectionRegistration('registerGwynthorCastles', registrations, 'scripts/build-gwynthor-castles.mjs')],
    [`${CASTLE_ART_DOCS}/image-prompts.json`, JSON.stringify({ version: 1, tool: 'built-in image_gen', images: CASTLE_ART }, null, 2) + '\n']
  ]);
  for (const { entry, ...section } of registrations) outputs.set(`Charakter Archiv Exporte/Module/Gwynthorer Burgen/${entry.id}-2026-11-14.json`,
    JSON.stringify({ type: 'aleria-module-package', version: 1, exportedAt: '2026-11-14T12:00:00Z',
      module: { type: 'aleria-module', version: 1, section, entry } }, null, 2) + '\n');
  outputs.set(`${CASTLE_ART_DOCS}/module-import.json`, JSON.stringify({ type: 'aleria-module-store', version: 1,
    customSections: registrations.map(({ entry, ...section }) => ({ ...section, key: section.path.at(-1), desc: section.description, entries: [entry] })) }, null, 2) + '\n');
  for (const [path, content] of outputs) {
    const url = new URL(`../../${path}`, import.meta.url);
    if (args.includes('--check')) {
      if (await readFile(url, 'utf8') !== content) throw Error(`Veraltete Burgprojektion: ${path}`);
    } else { await mkdir(new URL('.', url), { recursive: true }); await writeFile(url, content); }
  }
  console.log(JSON.stringify({ modules: registrations.length, scenes: registrations.reduce((sum, row) => sum + row.entry.pages.length, 0), artwork: CASTLE_ART.length }));
}
