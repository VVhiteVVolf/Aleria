import { readFile } from 'node:fs/promises';
import { publishModuleCharacterGroup } from './publish-module-character-group.mjs';
import { planNixeCharacters } from '../../../AleriaAlmanach/modules/lachende-nixe/nixe-characters.mjs';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const source = (await read('../../../AleriaAlmanach/modules/lachende-nixe/sources/module-before-finalization.json')).entry;
const entry = (await read('../../../Charakter Archiv Exporte/Module/Lachende Nixe/lachende-nixe-2026-10-16.json')).module.entry;
console.log(JSON.stringify(await publishModuleCharacterGroup({ entry,
  planCharacters: (characters, config, now) => planNixeCharacters(source, characters, config, now),
  acceptedPreviousEntries: [source], expectedOfferCount: 45, label: 'lachende-nixe',
  planFile: new URL('../../../Charakter Archiv Exporte/Module/Lachende Nixe/character-publication-plan.json', import.meta.url),
  apply: process.argv.includes('--apply')
})));
