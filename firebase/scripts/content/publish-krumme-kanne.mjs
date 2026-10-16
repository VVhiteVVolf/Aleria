import { readFile } from 'node:fs/promises';
import { publishModuleCharacterGroup } from './publish-module-character-group.mjs';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const source = (await read('../../../AleriaAlmanach/modules/krumme-kanne/source/module-before-services.json')).entry;
const entry = (await read('../../../Charakter Archiv Exporte/Module/Krumme Kanne/krumme-kanne-2026-10-14.json')).module.entry;
console.log(JSON.stringify(await publishModuleCharacterGroup({ entry,
  planCharacters: () => ({ entries: [], config: {} }), acceptedPreviousEntries: [source],
  expectedOfferCount: 44, label: 'krumme-kanne-services',
  planFile: new URL('../../../Charakter Archiv Exporte/Module/Krumme Kanne/services-publication-plan.json', import.meta.url),
  apply: process.argv.includes('--apply')
})));
