import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { readFile } from 'node:fs/promises';
for (const row of FAMILY_REGISTRY.filter(row => /varulv|wolfshorn|neidr/i.test(`${row.id} ${row.name}`))) {
  const family = row.family || {};
  console.log(JSON.stringify({ id: row.id, name: row.name, biography: family.biography, bio: family.bio,
    keys: Object.keys(family), people: family.persons?.filter(person => /fenrir|ylva|asgeir|guinevere/i.test(`${person.id} ${person.name}`)) }));
}
const module = JSON.parse(await readFile(new URL('../../AleriaAlmanach/modules/gawain-duncan/source/reviewed-module.json', import.meta.url), 'utf8'));
function walk(value) {
  if (!value || typeof value !== 'object') return;
  if (/duncan/i.test(String(value.biographyTitle || value.title || '')) && (value.abilities || value.biographyText)) console.log(JSON.stringify({ title: value.biographyTitle || value.title, text: value.biographyText, traits: value.abilities }));
  Object.values(value).forEach(child => Array.isArray(child) ? child.forEach(walk) : walk(child));
}
walk(module.entry);
