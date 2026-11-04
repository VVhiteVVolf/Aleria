import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const base = new URL('./', import.meta.url);
const scope = new Set(JSON.parse(await readFile(new URL('public-scope.json', base), 'utf8')).records.map(record => record.id));
const forbidden = new Set(['restricted', 'private', 'hidden', 'secret']);
const publicEntity = value => !forbidden.has(value?.visibility) && !forbidden.has(value?.extensions?.visibility)
  && !value?.hidden && !value?.private && !value?.extensions?.hidden && !value?.extensions?.private;
const named = person => person && !/unbekannt|unknown|\?/.test(person.name?.toLowerCase() || '') && publicEntity(person);
const grouped = new Map();
for (const record of FAMILY_REGISTRY.filter(record => scope.has(record.id))) {
  const people = new Map(record.family.persons.filter(publicEntity).map(person => [person.id, person]));
  for (const edge of record.family.parentages.filter(edge => publicEntity(edge) && edge.type === 'biological'
    && !['uncertain', 'disputed', 'rumored'].includes(edge.certainty))) {
    const child = people.get(edge.childId), parents = edge.parentIds.map(id => people.get(id));
    if (!named(child) || !child.worldPersonId || parents.length !== 2 || parents.some(parent => !named(parent))) continue;
    const entry = { familyId: record.id, childId: child.id, childName: child.name, birth: child.birth,
      parentageId: edge.id, parents: parents.map(parent => ({ id: parent.id, worldPersonId: parent.worldPersonId,
        name: parent.name, birth: parent.birth })),
      parentSignature: parents.map(parent => parent.worldPersonId || parent.id).sort().join('|') };
    if (!grouped.has(child.worldPersonId)) grouped.set(child.worldPersonId, []);
    grouped.get(child.worldPersonId).push(entry);
  }
}
const candidates = [...grouped].filter(([, entries]) => new Set(entries.map(entry => entry.familyId)).size > 1
  && new Set(entries.map(entry => entry.parentSignature)).size > 1).map(([worldPersonId, entries]) => ({worldPersonId, entries}));
await writeFile(new URL('parent-counterpart-candidates.json', base), JSON.stringify({schema:'aleria.public-parent-counterpart-candidates',
  status:'unreviewed-candidates', publicOnly:true, candidates}, null, 2) + '\n');
console.log(JSON.stringify({count:candidates.length, candidates}, null, 2));
