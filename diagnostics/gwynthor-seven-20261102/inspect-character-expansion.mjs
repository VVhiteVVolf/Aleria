import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createFamilyPersonCandidate } from '../../AleriaAlmanach/modules/character-genealogy/genealogy-mapping.js';
import { STANDARD_ITEMS } from '../../AleriaAlmanach/modules/item-register/item-register-standard.js';
for (const [familyId, personId] of [['haus-awenydd','rhosyn-awenydd'],['haus-awenor','briallen-awenor'],['haus-wyrm','rianna-wyrm'],['haus-rhyddid','evie-rhyddid'],['haus-gafyr','lefraye-gafyr'],['haus-gwyllach','saerwyn-gwyllach'],['haus-chwedlonol','caralyn-chwedlonol']]) {
 const record=FAMILY_REGISTRY.find(r=>r.id===familyId), person=record?.family.persons.find(p=>p.id===personId);
 console.log(JSON.stringify({candidate:person?createFamilyPersonCandidate(record,person):null,person,profile:record?.family.document.houseProfile}));
}
const snap=JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json',import.meta.url),'utf8'));
const caralyn=snap.characters.find(c=>c.id==='Eka4z7TWpzEgx8KjhIzy');
console.log('EXISTING',JSON.stringify({character:caralyn, count:snap.characters.length}));
console.log('ITEMS',JSON.stringify(STANDARD_ITEMS.filter(i=>/helwyr|gafyr|wyrm|chwed|langbogen|kurzbogen|seil|netz|dolch|harnisch|kleid/i.test(i.title)).map(i=>({id:i.id,name:i.title,image:i.image,combat:i.combatDefinition,house:i.houseArmor}))));
