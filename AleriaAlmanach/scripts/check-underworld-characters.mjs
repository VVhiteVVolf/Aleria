import { importAuthoredCharacters } from '../../CharakterDatenbank/scripts/import-authored-characters.mjs';
import { buildUnderworldCharacterExports,UNDERWORLD_CHARACTER_FEATURE } from '../modules/gwynthor-underworld/underworld-characters.mjs';
if(process.argv.length!==2) throw Error('Check only; no arguments.');
console.log(JSON.stringify(await importAuthoredCharacters({sources:buildUnderworldCharacterExports().map(e=>e.sourcePath),feature:UNDERWORLD_CHARACTER_FEATURE,check:true})));
