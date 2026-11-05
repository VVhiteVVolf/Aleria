// Bounded editorial award for four named recipients, never a global inventory migration.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { DRAIG_STARTING_POSSESSIONS } from '../../../AleriaAlmanach/modules/draig-starting-possessions/starting-possessions.mjs';
import { getDraigStartingSourceKey, planDraigStartingPossessions } from '../../../AleriaAlmanach/modules/draig-starting-possessions/starting-possessions-plan.mjs';
import { buildRefriSignetItem, REFRI_SIGNET_IMAGE } from '../../../AleriaAlmanach/modules/draig-starting-possessions/refri-signet.mjs';
import { STANDARD_ITEMS } from '../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { normalizeItemDefinition, itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';

const root = new URL('../../../', import.meta.url);
const directory = new URL('diagnostics/draig-starting-possessions-20261105/', root);
const apply = process.argv.includes('--apply'), verify = process.argv.includes('--verify');
assert(!(apply && verify), 'Vergabe und reine Nachprüfung sind getrennte Aufrufe.');
const digest = value => createHash('sha256').update(value).digest('hex');
const decode = raw => raw ? { ...decodeFirestoreFields(raw.fields || {}), id: raw.name.split('/').at(-1) } : null;
const save = (name, data) => writeFile(new URL(name, directory), JSON.stringify(data, null, 2) + '\n');
await mkdir(directory, { recursive: true });
const client = await createContentPublicationClient();
const now = new Date().toISOString();

if (process.argv.includes('--artwork-apply')) {
  assert(!apply && !verify, 'Bildpublikation wird separat ausgeführt.');
  const bytes = await readFile(new URL(REFRI_SIGNET_IMAGE.slice(1), root));
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  const receipt = await client.publishFamilyArtwork({ familyId: 'haus-thornwick',
    assetId: `refri-signet-${digest(bytes).slice(0, 16)}`, bytes,
    metadata: { sourceFeature: 'draig-starting-possessions-20261105', sourcePath: REFRI_SIGNET_IMAGE } });
  await save('refri-artwork-published.json', { ...receipt, publishedAt: now, sourcePath: REFRI_SIGNET_IMAGE });
  console.log(JSON.stringify({ artworkVerified: true, ...receipt }));
  process.exit(0);
}

const artwork = JSON.parse(await readFile(new URL('refri-artwork-published.json', directory), 'utf8'));
assert.match(artwork.url, /^https:\/\/firebasestorage\.googleapis\.com\//);
assert.equal(artwork.sha256, digest(await readFile(new URL(REFRI_SIGNET_IMAGE.slice(1), root))));
const wantedIds = new Set(DRAIG_STARTING_POSSESSIONS.flatMap(spec => spec.items.map(item => item.templateId)));
const templates = STANDARD_ITEMS.filter(item => wantedIds.has(item.id)).map(item => structuredClone(item));
assert.equal(templates.length, wantedIds.size, 'Eine gewöhnliche Startvorlage fehlt.');
templates.push(buildRefriSignetItem(artwork.url));
for (const template of templates) {
  if (!template.definitionRef) {
    const draft = normalizeItemDefinition({ ...template, kind: template.definitionKind, weight: null }, { id: template.id, revision: 'draft' });
    template.definitionRef = { id: template.id, revision: digest(itemDefinitionContent(draft)).slice(0, 24) };
  }
  const definition = itemDefinitionFromTemplate(template);
  assert(definition, 'Die Vorlage benötigt eine veröffentlichungsfähige Definition.');
  template.definitionRef = { id: definition.id, revision: definition.revision };
}
const documents = await Promise.all(DRAIG_STARTING_POSSESSIONS.map(spec => client.request(`/characters/${spec.id}`)));
assert(documents.every(Boolean), 'Eine der vier bestätigten Charakterakten fehlt.');
const characters = documents.map(decode);
const claims = await Promise.all(characters.map(character => client.request(`/item_award_claims/${digest(getDraigStartingSourceKey(character.id))}`)));
const plans = characters.map((character, index) => planDraigStartingPossessions({ character,
  specification: DRAIG_STARTING_POSSESSIONS[index], templates,
  claim: claims[index] ? decodeFirestoreFields(claims[index].fields) : null, now }));
const definitions = templates.map(itemDefinitionFromTemplate);
const versions = await Promise.all(definitions.map(def => client.request(`/item_definition_versions/${encodeURIComponent(itemDefinitionKey(def))}`)));
const heads = await Promise.all(definitions.map(def => client.request(`/item_definitions/${encodeURIComponent(def.id)}`)));
const definitionWrites = [];
definitions.forEach((definition, index) => {
  for (const [collection, raw, timestamp] of [['item_definition_versions', versions[index], 'createdAt'], ['item_definitions', heads[index], 'updatedAt']]) {
    if (raw) assert.equal(itemDefinitionContent(decodeFirestoreFields(raw.fields)), itemDefinitionContent(definition), `Die vorhandene Definition ${definition.id} weicht ab.`);
    else definitionWrites.push({ update: { name: client.documentName(`${collection}/${collection === 'item_definition_versions' ? itemDefinitionKey(definition) : definition.id}`),
      fields: encodeFirestoreFields({ ...definition, [timestamp]: now }) }, currentDocument: { exists: false } });
  }
});
const ringPlan = plans.find(plan => plan.character.id === 'yg7RonBDX5ctbr7icLWe');
const ring = ringPlan.character.inventory.items.find(item => item.definitionRef?.id === 'personal-signet:refri-thornwick');
const uniquePath = 'item_unique_claims/personal-signet:refri-thornwick';
const uniqueRaw = await client.request(`/${uniquePath}`);
if (ringPlan.changed) {
  assert(ring, 'Refris bestätigter persönlicher Ring fehlt.');
  assert.equal(uniqueRaw, null, 'Refris Unikat ist bereits belegt.');
}
else {
  // A later sale may change its holder; the permanent identity must remain valid.
  assert(uniqueRaw, 'Der globale Unikatbeleg fehlt.');
  const refriIndex = characters.findIndex(character => character.id === ringPlan.character.id);
  const original = decodeFirestoreFields(claims[refriIndex].fields).result.items.find(item => item.definitionRef?.id === 'personal-signet:refri-thornwick');
  assert(original, 'Der ursprüngliche Ringbeleg fehlt.');
  assert.equal(decodeFirestoreFields(uniqueRaw.fields).instanceId, original.id);
}
const profiles = plans.map(plan => ({ id: plan.character.id, name: plan.character.name,
  changed: plan.changed, addedItemIds: plan.addedItemIds, moneyState: plan.character.inventory.moneyState,
  added: plan.added, rationale: DRAIG_STARTING_POSSESSIONS.find(spec => spec.id === plan.character.id).rationale }));
const summary = { dryRun: !apply, profiles, definitionDocuments: definitionWrites.length };
await save(verify ? 'verification-plan.json' : 'prepared-plan.json', summary);
if (verify) {
  assert(plans.every(plan => !plan.changed), 'Die Vergabe würde wiederholt.');
  assert.equal(definitionWrites.length, 0);
  console.log(JSON.stringify({ verified: true, idempotent: true, profiles: profiles.length }));
  process.exit(0);
}
if (!apply) {
  console.log(JSON.stringify(summary, null, 2));
  process.exit(0);
}
assert(plans.every(plan => plan.changed), 'Teilweise ausgeführte Vergabe benötigt einen gezielten Abgleich.');
const imageResponse = await fetch(artwork.url, { signal: AbortSignal.timeout(30000) });
assert(imageResponse.ok);
assert.equal(digest(Buffer.from(await imageResponse.arrayBuffer())), artwork.sha256);
const locks = await Promise.all(characters.map(character => client.request(`/combat_profile_locks/characters/records/${character.id}`)));
for (const lock of locks) assert(!(lock && decodeFirestoreFields(lock.fields).activeEncounterKeys?.length), 'Inventaränderung während eines aktiven Kampfes gesperrt.');
const writes = [...definitionWrites];
plans.forEach((plan, index) => {
  const protectedBefore = structuredClone(characters[index]); delete protectedBefore.inventory;
  const protectedAfter = structuredClone(plan.character); delete protectedAfter.inventory;
  assert.deepEqual(protectedAfter, protectedBefore, 'Unbeteiligte Charakterfelder würden verändert.');
  for (const item of characters[index].inventory?.items || []) {
    assert.deepEqual(plan.character.inventory.items.find(next => next.id === item.id), item, 'Vorhandener Besitz würde verändert.');
  }
  writes.push({ verify: client.documentName(`combat_profile_locks/characters/records/${plan.character.id}`),
    currentDocument: locks[index] ? { updateTime: locks[index].updateTime } : { exists: false } });
  writes.push({ update: { name: documents[index].name, fields: encodeFirestoreFields({ inventory: plan.character.inventory }) },
    updateMask: { fieldPaths: ['inventory'] }, currentDocument: { updateTime: documents[index].updateTime } });
  writes.push({ update: { name: client.documentName(`item_award_claims/${digest(plan.grant.sourceKey)}`), fields: encodeFirestoreFields(plan.grant) }, currentDocument: { exists: false } });
});
writes.push({ update: { name: client.documentName(uniquePath), fields: encodeFirestoreFields({
  definitionId: 'personal-signet:refri-thornwick', instanceId: ring.instanceId,
  holder: { kind: 'characters', recordId: ringPlan.character.id, itemId: ring.id }, createdAt: now,
  createdBy: 'editorial:draig-starting-possessions:20261105' }) }, currentDocument: { exists: false } });
assert(writes.length < 50);
await backupContentPublication('draig-starting-possessions-20261105', [...documents, ...claims, ...versions, ...heads, ...locks, uniqueRaw],
  writes.filter(write => write.update && write.currentDocument.exists === false).map(write => write.update.name.split('/documents/')[1]), now);
const committed = await client.request(':commit', { writes });
const after = await Promise.all(plans.map(plan => client.request(`/characters/${plan.character.id}`)));
after.forEach((raw, index) => assert.deepEqual(decode(raw), plans[index].character, 'Die bestätigte Akte weicht vom begrenzten Vergabeplan ab.'));
const afterClaims = await Promise.all(characters.map(character => client.request(`/item_award_claims/${digest(getDraigStartingSourceKey(character.id))}`)));
plans.forEach((plan, index) => {
  const repeat = planDraigStartingPossessions({ character: decode(after[index]), specification: DRAIG_STARTING_POSSESSIONS[index],
    templates, claim: decodeFirestoreFields(afterClaims[index].fields), now });
  assert.equal(repeat.changed, false); assert.deepEqual(repeat.character, plan.character);
});
const uniqueAfter = decodeFirestoreFields((await client.request(`/${uniquePath}`)).fields);
assert.deepEqual(uniqueAfter.holder, { kind: 'characters', recordId: ringPlan.character.id, itemId: ring.id });
await save('online-after.json', { capturedAt: committed.commitTime, characters: after.map(decode) });
await save('publication-verification.json', { ...summary, dryRun: false, verified: true, idempotent: true,
  committedAt: committed.commitTime, previousItemsPreserved: true, combatAndOtherFieldsPreserved: true, uniqueClaimVerified: true });
console.log(JSON.stringify({ applied: true, verified: true, idempotent: true, profiles }, null, 2));
