// Replace only the exact older project biography; edited biographies stay distinct.
import {readFileSync,writeFileSync} from 'node:fs';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {houseBiographyDefaultFingerprint} from '../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';
const module=FAMILY_REGISTRY.find(record=>record.id==='haus-cwningod').family.extensions.houseBiographyModule;
const fingerprint=houseBiographyDefaultFingerprint(module);
const file='Familien Häuser und Clans/Estryll/Cenyr/Klaueninsel/Talklaue/Haus_Cwingod/haus.content.mjs';
const source=readFileSync(file,'utf8');
if(!source.includes(fingerprint)){
 const updated=source.replace(/(["']?biographyPreviousDefaultFingerprints["']?\s*:\s*)\[\]/,`$1[${JSON.stringify(fingerprint)}]`);
 if(updated===source)throw new Error('Vorherige Defaultliste unerwartet belegt.');
 writeFileSync(new URL('cwningod-previous-default.json',import.meta.url),JSON.stringify(module,null,2)+'\n');
 writeFileSync(file,updated);
}
console.log(`Cwningods genaue alte Standardbio registriert: ${fingerprint}`);
