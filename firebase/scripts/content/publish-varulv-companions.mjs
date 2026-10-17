import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { planVarulvCompanionImport } from './varulv-companion-import-plan.mjs';
import { VARULV_NEW_COMPANIONS } from '../../../AleriaAlmanach/modules/creatures/catalog/varulv-companions.js';
import { SLEIPNIR_VARULV_ID } from '../../../AleriaAlmanach/modules/creatures/catalog/varulv-gamir.js';

const apply = process.argv.includes('--apply');
const { request, documentName } = await createContentPublicationClient();
const decode = raw => ({ id: raw.name.split('/').at(-1), ...decodeFirestoreFields(raw.fields || {}) });
const withoutId = ({ id, ...data }) => data;
async function list(collection, fields) {
  const documents = [];
  let token = '';
  do {
    const mask = fields.map(field => `&mask.fieldPaths=${field}`).join('');
    const page = await request(`/${collection}?pageSize=1000${mask}${token ? '&pageToken=' + encodeURIComponent(token) : ''}`);
    documents.push(...(page.documents || []));
    token = page.nextPageToken || '';
  } while (token);
  return documents;
}
const characterListing = (await list('characters', ['name', 'identity.worldPersonId', 'genealogy.worldPersonId'])).map(decode);
const ownerMatches = characterListing.filter(character => character.id === SLEIPNIR_VARULV_ID
  || (character.identity?.worldPersonId || character.genealogy?.worldPersonId) === SLEIPNIR_VARULV_ID);
assert(ownerMatches.length <= 1, 'Sleipnirs Online-Identität ist nicht eindeutig.');
const ownerDocument = ownerMatches.length ? await request(`/characters/${encodeURIComponent(ownerMatches[0].id)}`) : null;
const sourceIds = new Set(VARULV_NEW_COMPANIONS.map(creature => creature.id));
const sourceNames = new Set(VARULV_NEW_COMPANIONS.map(creature => creature.name));
const creatureListing = await list('creatures', ['name', 'classification.house']);
const related = creatureListing.filter(raw => {
  const creature = decode(raw);
  return sourceIds.has(creature.id) || (sourceNames.has(creature.name) && /(?:Clan|Haus) Varulv/.test(creature.classification?.house || ''));
});
const creatureDocuments = await Promise.all(related.map(raw => request(`/creatures/${encodeURIComponent(decode(raw).id)}`)));
const characters = characterListing.map(character => character.id === ownerMatches[0]?.id ? decode(ownerDocument) : character);
const now = new Date().toISOString();
const plan = planVarulvCompanionImport({ characters, creatures: creatureDocuments.map(decode), now });
const newEntries = plan.entries.filter(entry => entry.create);
const summary = { dryRun: !apply, creatures: plan.entries.length, newCreatures: newEntries.length,
  newOwner: plan.ownerCreate, ownerId: plan.owner.id, inventoryChanged: plan.inventoryChanged,
  personalCompanions: plan.owner.inventory.companions.filter(card => sourceIds.has(card.creatureId)).map(card => card.name) };
if (apply && (newEntries.length || plan.ownerCreate || plan.inventoryChanged)) {
  // Images must already be online, byte-for-byte, before publishing their records.
  await Promise.all(VARULV_NEW_COMPANIONS.map(async creature => {
    const response = await fetch(`https://dieweltvonaleria.netlify.app${creature.portrait}`, { signal: AbortSignal.timeout(30000) });
    assert(response.ok, `Bild noch nicht online: ${creature.name}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert(bytes.equals(await readFile(new URL(`../../../${creature.portrait.slice(1)}`, import.meta.url))), `Abweichendes Online-Bild: ${creature.name}`);
  }));
  await backupContentPublication('varulv-companions', [ownerDocument, ...creatureDocuments],
    [...newEntries.map(entry => `creatures/${entry.id}`), ...(plan.ownerCreate ? [`characters/${plan.owner.id}`] : [])], now);
  const writes = newEntries.map(entry => ({ update: { name: documentName(`creatures/${entry.id}`), fields: encodeFirestoreFields(withoutId(entry.data)) }, currentDocument: { exists: false } }));
  if (plan.ownerCreate) writes.push({ update: { name: documentName(`characters/${plan.owner.id}`), fields: encodeFirestoreFields(withoutId(plan.owner)) }, currentDocument: { exists: false } });
  else if (plan.inventoryChanged) writes.push({ update: { name: ownerDocument.name, fields: encodeFirestoreFields({ inventory: plan.owner.inventory, updatedAt: plan.owner.updatedAt }) },
    updateMask: { fieldPaths: ['inventory', 'updatedAt'] }, currentDocument: { updateTime: ownerDocument.updateTime } });
  await request(':commit', { writes });
  assert.deepEqual(decode(await request(`/characters/${encodeURIComponent(plan.owner.id)}`)), plan.owner, 'Besitzerakte nach Veröffentlichung');
  for (const entry of plan.entries) assert.deepEqual(decode(await request(`/creatures/${encodeURIComponent(entry.id)}`)), entry.data, entry.data.name);
  summary.verified = true;
}
console.log(JSON.stringify(summary));
