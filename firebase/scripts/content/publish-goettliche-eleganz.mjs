import { readFile } from 'node:fs/promises';
import { publishModuleCharacterGroup } from './publish-module-character-group.mjs';
import { buildGoettlicheEleganz } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-module.mjs';
import { planEleganzCharacters } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-characters.mjs';
import { beforeEleganzEditorialCorrections, withEleganzPortraitCorrections } from '../../../AleriaAlmanach/modules/goettliche-eleganz/eleganz-editorial-corrections.mjs';
const entry = buildGoettlicheEleganz();
const beforeExpansion = JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/goettliche-eleganz/sources/module-before-expansion-2026-11-04.json', import.meta.url), 'utf8')).entry;
const previous = JSON.parse(await readFile(new URL('../../../AleriaAlmanach/modules/goettliche-eleganz/sources/module-before-clothing.json', import.meta.url), 'utf8')).module.entry;
console.log(JSON.stringify(await publishModuleCharacterGroup({ entry,
  planCharacters: (characters, config, now) => withEleganzPortraitCorrections(planEleganzCharacters(characters, config, now), characters),
  acceptedPreviousEntries: [previous, beforeExpansion, beforeEleganzEditorialCorrections(beforeExpansion), beforeEleganzEditorialCorrections(entry)], expectedOfferCount: entry.pages[4].tradeCatalog.items.length,
  label: 'goettliche-eleganz', planFile: new URL('../../../Charakter Archiv Exporte/Module/Göttliche Eleganz/character-publication-plan.json', import.meta.url),
  apply: process.argv.includes('--apply')
})));
