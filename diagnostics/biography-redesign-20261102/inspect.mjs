import { readFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const snapshot = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
console.log('snapshot', Object.keys(snapshot));
console.log('family', Object.keys(FAMILY_REGISTRY[0]));
const chars = snapshot.characters || snapshot.records || [];
console.log('characters', chars.length, Object.keys(chars[0] || {}));
for (const row of chars) {
  const c = row.character || row;
  if (c.biography?.biography) console.log(JSON.stringify({name:c.name,id:c.id,title:c.biography.biography.biographyTitle,
    historyTitle:c.biography.biography.historyTitle,paragraphs:(c.biography.biography.historyText || '').match(/<p>/g)?.length,
    mentors:(c.biography.stats || []).filter(x=>/Ritterv|Ritterm/i.test(JSON.stringify(x)))}));
}
for (const f of FAMILY_REGISTRY) for (const p of f.family?.persons || []) if(p.extensions?.biographyModule) console.log('TREE',f.id,p.id,p.name);
