import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { AUTHORED_ITEMS } from '../../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { planSilberhirschOwnerCorrection, SILBERHIRSCH_TEMPLATE_ID, SILBERHIRSCH_OWNER_ID, SILBERHIRSCH_PREVIOUS_OWNER_ID } from '../../../AleriaAlmanach/modules/house-knight-rings/silberhirsch-owner-correction.mjs';
const client = await createContentPublicationClient(), ids = [SILBERHIRSCH_PREVIOUS_OWNER_ID, SILBERHIRSCH_OWNER_ID];
const decode = raw => ({ ...decodeFirestoreFields(raw.fields), id: raw.name.split('/').at(-1) });
const raw = await Promise.all(ids.map(id => client.request(`/characters/${id}`))), before = raw.map(decode);
const template = AUTHORED_ITEMS.find(item => item.id === SILBERHIRSCH_TEMPLATE_ID);
const now = new Date().toISOString(), plan = planSilberhirschOwnerCorrection({ previousOwner: before[0], owner: before[1], template, now });
const claimPath = 'item_owner_corrections/silberhirsch-oweta-20261102', claim = await client.request(`/${claimPath}`);
if (!plan.changed) {
  assert(claim, 'Bestätigter Eigentumskorrekturbeleg fehlt.');
  assert.equal(decodeFirestoreFields(claim.fields).itemId, plan.itemId);
  console.log(JSON.stringify({ verified: true, idempotent: true, owner: 'Oweta Draig', itemId: plan.itemId }));
} else {
  assert(!claim, 'Die abgeschlossene Eigentumskorrektur darf nicht erneut ausgeführt werden.');
  const definition = itemDefinitionFromTemplate(template);
  const versionPath = `item_definition_versions/${itemDefinitionKey(definition)}`, headPath = `item_definitions/${definition.id}`;
  const [version, head] = await Promise.all([client.request(`/${encodeURI(versionPath)}`), client.request(`/${encodeURI(headPath)}`)]);
  if (version) assert.equal(itemDefinitionContent(decodeFirestoreFields(version.fields)), itemDefinitionContent(definition));
  assert(head); assert.equal(head.fields.id.stringValue, definition.id);
  const locks = await Promise.all(ids.map(id => client.request(`/combat_profile_locks/characters/records/${id}`)));
  locks.forEach(lock => assert(!lock || !decodeFirestoreFields(lock.fields).activeEncounterKeys?.length, 'Ein aktiver Kampf schützt den Besitz.'));
  const writes = [];
  if (!version) writes.push({ update: { name: client.documentName(versionPath), fields: encodeFirestoreFields({ ...definition, createdAt: now }) }, currentDocument: { exists: false } });
  writes.push({ update: { name: head.name, fields: encodeFirestoreFields({ ...definition, updatedAt: now }) }, currentDocument: { updateTime: head.updateTime } });
  for (let i = 0; i < ids.length; i++) {
    const character = plan.characters[i], fields = plan.fieldPaths[character.id];
    const patch = { inventory: character.inventory, updatedAt: now };
    if (fields.includes('combatProfile.revision')) patch.combatProfile = { revision: character.combatProfile.revision, equipmentPassiveEffects: character.combatProfile.equipmentPassiveEffects };
    writes.push({ verify: client.documentName(`combat_profile_locks/characters/records/${character.id}`), currentDocument: locks[i] ? { updateTime: locks[i].updateTime } : { exists: false } });
    writes.push({ update: { name: raw[i].name, fields: encodeFirestoreFields(patch) }, updateMask: { fieldPaths: fields }, currentDocument: { updateTime: raw[i].updateTime } });
  }
  writes.push({ update: { name: client.documentName(claimPath), fields: encodeFirestoreFields({ sourceKey: 'author-correction:silberhirsch-owner:20261102', from: ids[0], to: ids[1], itemId: plan.itemId, at: now }) }, currentDocument: { exists: false } });
  if (!process.argv.includes('--apply')) console.log(JSON.stringify({ dryRun: true, owner: 'Oweta Draig', itemId: plan.itemId }));
  else {
    await backupContentPublication('silberhirsch-owner-20261102', [...raw, ...locks, head, version], !version ? [versionPath, claimPath] : [claimPath], now);
    const commit = await client.request(':commit', { writes });
    const after = await Promise.all(ids.map(id => client.request(`/characters/${id}`)));
    after.forEach((value, i) => assert.deepEqual(decode(value), plan.characters[i]));
    const directory = new URL('../../../diagnostics/combat-sheets-20261102/', import.meta.url);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('silberhirsch-owner-correction.json', directory), JSON.stringify({ verified: true, committedAt: commit.commitTime, before, characters: after.map(decode), itemId: plan.itemId }, null, 2) + '\n');
    console.log(JSON.stringify({ applied: true, verified: true, owner: 'Oweta Draig', itemId: plan.itemId }));
  }
}
