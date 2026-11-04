// One bounded integration of the user's decisions; original audit receipts stay intact.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const base = new URL('./', import.meta.url), root = new URL('../../', import.meta.url);
const json = async name => JSON.parse(await readFile(new URL(name, base), 'utf8'));
const [before, bios, lei, cen, ald] = await Promise.all(['before-public-data.json', 'before-biography-defaults.json',
  'leitheach-changes.json', 'cenyr-changes.json', 'aldrimar-changes.json'].map(json));
const supplement = await json('auxiliary-scope-supplement.json').catch(error => { if(error.code==='ENOENT')return {records:[],biographies:[],changes:[]};throw error; });
const priorPlan = await json('integration-plan.json').catch(error => { if(error.code==='ENOENT')return {sources:[]};throw error; });
const previous = new Map([...before.records,...supplement.records].map(record => [record.id, record]));
const current = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const defaults = new Map([...bios,...supplement.biographies].map(record => [record.id, record]));
const changes = [];
const oldNotes = [...lei.previousDefaultNotes.map(note => ({ familyId: 'haus-dal-ceardaiocht', ...note })),
  ...cen.previousDefaultNotes, ...ald.previousDefaultNotes];
function add(familyId, collection, entityId, field, oldValue, newValue) {
  const family = current.get(familyId)?.family;
  if (!family || !previous.has(familyId)) throw new Error(`Family outside approved public scope: ${familyId}`);
  const entity = collection === 'document' ? family.document : family[collection].find(row => row.id === entityId);
  if (!entity || JSON.stringify(entity[field]) !== JSON.stringify(newValue)) throw new Error(`Unexpected reviewed value: ${familyId}/${entityId}/${field}`);
  if (['restricted', 'private', 'hidden', 'secret'].includes(entity.visibility)) throw new Error('Nonpublic entity excluded');
  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;
  changes.push({ familyId, collection, entityId, field, before: oldValue, after: newValue });
}
for (const request of lei.fieldUpgradeRequests) {
  for (const [id, fields] of Object.entries(request.persons || {})) for (const field of fields) {
    const row = previous.get(request.familyId).persons.find(person => person.id === id);
    const old = field === 'notes' ? oldNotes.find(note => note.familyId === request.familyId && note.entityId === id)?.value : row[field];
    if (old === undefined) throw new Error(`Missing old default: ${request.familyId}/${id}/${field}`);
    add(request.familyId, 'persons', id, field, old, current.get(request.familyId).family.persons.find(p => p.id === id)[field]);
  }
  for (const requestEdge of request.publicParentages || []) for (const id of requestEdge.ids) for (const field of requestEdge.fields) {
    const old = oldNotes.find(note => note.familyId === request.familyId && note.entityId === id)?.value;
    add(request.familyId, 'parentages', id, field, old, current.get(request.familyId).family.parentages.find(p => p.id === id)[field]);
  }
}
for (const row of cen.recordChanges) for (const [field, values] of Object.entries(row.changes)) add(row.familyId, 'persons', row.personId, field, values.before, values.after);
for (const row of cen.partnershipChanges) for (const [field, values] of Object.entries(row.changes)) add(row.familyId, 'partnerships', row.partnershipId, field, values.before, values.after);
for (const row of ald.canonicalFieldChanges) add(row.familyId, row.collection, row.entityId, row.field, row.before, row.after);
for (const row of supplement.changes) add(row.familyId, row.collection, row.entityId, row.field, row.before, row.after);
const definitions = {};
for (const row of changes) {
  const definition = definitions[row.familyId] ||= { revision: previous.get(row.familyId).sourceRevision + 1, collections: {} };
  if (row.collection === 'document') {
    (definition.documentFields ||= []).push(row.field);
  } else {
    const fields = (definition.collections[row.collection] ||= {})[row.entityId] ||= [];
    if (!fields.includes(row.field)) fields.push(row.field);
    if (row.field === 'notes' || row.field === 'title') {
      const entities = (definition.previousDefaultValues ||= {})[row.collection] ||= {};
      const values = (entities[row.entityId] ||= {})[row.field] ||= [];
      values.push(row.before);
    }
  }
}
const affected = [...new Set([...lei.affectedFamilyIds, ...cen.affectedHouseIds, ...ald.affectedHouseIds,...supplement.records.map(row=>row.id)])].sort();
for (const request of lei.fieldUpgradeRequests) if (definitions[request.familyId] && request.extensions?.length) {
  definitions[request.familyId].extensionFields = request.extensions;
}
const pending = [];
for (const id of affected) {
  const old = defaults.get(id);
  if (!old?.pageData) throw new Error(`Missing authoring target ${id}`);
  const relative = 'Familien Häuser und Clans/' + old.pageData.split('?')[0].replace(/haus\.data\.js$/, 'haus.content.mjs');
  const url = new URL(relative.split('/').map(encodeURIComponent).join('/'), root);
  let text = await readFile(url, 'utf8');
  const originalHash = priorPlan.sources.find(row=>row.id===id)?.previousSha256 || createHash('sha256').update(text).digest('hex');
  const revision = previous.get(id).sourceRevision + 1;
  const revisionPattern = /((?:"biographySourceRevision"|biographySourceRevision)\s*:\s*)\d+/;
  const versionPattern = /((?:"contentVersion"|contentVersion)\s*:\s*)['"][^'"\r\n]*['"]/;
  if (!revisionPattern.test(text) || !versionPattern.test(text)) throw new Error(`Authoring revision fields missing ${id}`);
  text = text.replace(revisionPattern, `$1${revision}`).replace(versionPattern, '$1"20261104-lore-fixes-v1"');
  const fingerprintPattern = /((?:"biographyPreviousDefaultFingerprints"|biographyPreviousDefaultFingerprints)\s*:\s*)(\[[\s\S]*?\])/;
  const match = text.match(fingerprintPattern);
  if (match) {
    const fingerprints = [...new Set([...JSON.parse(match[2]), old.biographyFingerprint])];
    text = text.replace(fingerprintPattern, (_, prefix) => prefix + JSON.stringify(fingerprints));
  } else {
    text = text.replace(revisionPattern, `"biographyPreviousDefaultFingerprints": ${JSON.stringify([old.biographyFingerprint])},\n  $1${revision}`);
  }
  pending.push({ id, relative, url, text, originalHash, revision });
}
// Validate every target before writing source fields or generated revision metadata.
await mkdir(new URL('Stammbäume/assets/data/source-inventories/', root), {recursive:true});
await writeFile(new URL('Stammbäume/assets/js/modules/house-lore-corrections/house-lore-correction-fields.js', root),
  '// Reviewed field ownership only. Values remain in their canonical family modules.\nexport const HOUSE_LORE_CORRECTION_FIELDS = Object.freeze(' + JSON.stringify(definitions, null, 2) + ');\n');
const inventory = { schema:'aleria.reviewed-house-lore-corrections', date:'2026-11-04',
  authority:'User decisions: child chronology takes priority; Wunbhna, Maolmhuire and Morgan live; Dál T’Saor administration ended; Wolfshorn belongs to Dämmergrund/Vangandr.',
  remainingTwentyCounterpartConflicts:'List only; no alignment authorized.', changes,
  familyRevisions:Object.fromEntries(Object.entries(definitions).map(([id, value]) => [id,value.revision])) };
await writeFile(new URL('Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json', root), JSON.stringify(inventory, null, 2) + '\n');
for (const row of pending) await writeFile(row.url, row.text, 'utf8');
await writeFile(new URL('integration-plan.json', base), JSON.stringify({schema:'aleria.house-lore-integration-plan',
  contentVersion:'20261104-lore-fixes-v1', canonicalChanges:changes.length, managedFamilies:Object.keys(definitions),
  affectedHouseIds:affected, sources:pending.map(({id,relative,originalHash,revision}) => ({id,path:relative,previousSha256:originalHash,revision}))},null,2)+'\n');
console.log(JSON.stringify({canonicalChanges:changes.length,managedFamilies:Object.keys(definitions).length,houseSources:pending.length, affected}));
