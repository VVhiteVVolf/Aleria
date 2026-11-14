// Editorial one-book grant. Default: authenticated reads and a bounded plan only.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createContentPublicationClient } from './content-publication-client.mjs';
import { encryptProjectBackup, decryptProjectBackup } from '../backup/project-backup-crypto.mjs';
import { decodeFirestoreFields, encodeFirestoreFields, encodeFirestoreValue } from '../backup/firestore-value-codec.mjs';
import { AUTHORED_ITEMS } from '../../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { planReportGrant, REPORT_RECIPIENT, REPORT_GRANT_SOURCE } from '../../../AleriaAlmanach/modules/fleischsammler-report/report-grant-plan.mjs';
import { REPORT_DOCUMENT_ID, REPORT_ITEM_ID } from '../../../AleriaAlmanach/modules/fleischsammler-report/case-records.mjs';

const flags = process.argv.slice(2);
assert(flags.every(arg => ['--prepare', '--apply', '--verify'].includes(arg)) && flags.length <= 1, 'Genau --prepare, --apply oder --verify verwenden.');
const apply = flags.includes('--apply'), verify = flags.includes('--verify');
const client = await createContentPublicationClient();
const now = new Date().toISOString(), digest = value => createHash('sha256').update(value).digest('hex');
const root = new URL('../../../', import.meta.url), output = new URL('diagnostics/fleischsammler-report-20261114/', root);
await mkdir(output, { recursive: true });
const template = AUTHORED_ITEMS.find(item => item.id === REPORT_ITEM_ID), definition = itemDefinitionFromTemplate(template);
const claimId = digest(REPORT_GRANT_SOURCE), definitionKey = itemDefinitionKey(definition);
const paths = [`characters/${REPORT_RECIPIENT.id}`, `item_award_claims/${claimId}`, `item_definition_versions/${definitionKey}`, `item_definitions/${definition.id}`, `combat_profile_locks/characters/records/${REPORT_RECIPIENT.id}`];
const [raw, claimRaw, versionRaw, headRaw, lockRaw] = await Promise.all(paths.map(path => client.request(`/${encodeURI(path)}`)));
assert(raw, 'Lefrayes kanonische Akte fehlt.');
const character = { ...decodeFirestoreFields(raw.fields), id: REPORT_RECIPIENT.id };
const claim = claimRaw ? decodeFirestoreFields(claimRaw.fields) : null;
const plan = planReportGrant({ character, template, claim, now });
const activeKeys = lockRaw ? decodeFirestoreFields(lockRaw.fields).activeEncounterKeys || [] : [];
const definitionWrites = [];
for (const [path, existing, timestamp] of [[paths[2], versionRaw, 'createdAt'], [paths[3], headRaw, 'updatedAt']]) {
  if (existing) assert.equal(itemDefinitionContent(decodeFirestoreFields(existing.fields)), itemDefinitionContent(definition), 'Abweichende gespeicherte Buchdefinition.');
  else definitionWrites.push({ update: { name: client.documentName(path), fields: encodeFirestoreFields({ ...definition, [timestamp]: now }) }, currentDocument: { exists: false } });
}
const summary = { mode: apply ? 'apply' : verify ? 'verify' : 'prepare', recipient: REPORT_RECIPIENT,
  documentId: REPORT_DOCUMENT_ID, itemId: REPORT_ITEM_ID, definitionRef: template.definitionRef,
  changed: plan.changed, oldItemCount: character.inventory?.items?.length || 0,
  resultingItemCount: plan.character.inventory.items.length, inventoryRevisionBefore: character.inventory?.revision ?? 0,
  inventoryRevisionAfter: plan.character.inventory.revision, newDefinitionDocuments: definitionWrites.length,
  activeCombat: activeKeys.length > 0, characterWriteMask: plan.changed ? ['inventory.revision'] : [],
  arrayTransform: plan.changed ? 'appendMissingElements: exactly one new book, existing typed inventory values untouched' : '',
  productionWritesExecuted: false };
if (verify) { assert.equal(plan.changed, false, 'Die einmalige Vergabe fehlt.'); assert.equal(definitionWrites.length, 0, 'Die Itemversion fehlt.'); }
if (apply && (plan.changed || definitionWrites.length)) {
  // A book in a live inventory must never point to an unpublished/other edition.
  const publicPaths = [`Dokumente aus der Werkstatt/data/${REPORT_DOCUMENT_ID}.json`,
    ...['taeterstudie-r1.png', 'staturvergleich-r1.png', 'duennes-notizbuch-r1.png', 'vorderdeckel-r1.png', 'rueckdeckel-r1.png'].map(name => `Dokumente aus der Werkstatt/assets/${REPORT_DOCUMENT_ID}/${name}`)];
  for (const path of publicPaths) {
    const expected = await readFile(new URL(path, root));
    const response = await fetch(`https://dieweltvonaleria.netlify.app/${encodeURI(path)}`, { signal: AbortSignal.timeout(30000) });
    assert(response.ok && Buffer.from(await response.arrayBuffer()).equals(expected), `Öffentliche Buchfassung ist noch nicht aktuell: ${path}`);
  }
  assert.equal(activeKeys.length, 0, 'Inventarvergabe während eines aktiven Kampfes gesperrt.');
  const writes = [...definitionWrites];
  if (plan.changed) {
    writes.push({ verify: client.documentName(paths[4]), currentDocument: lockRaw ? { updateTime: lockRaw.updateTime } : { exists: false } });
    writes.push({ update: { name: raw.name, fields: encodeFirestoreFields({ inventory: { revision: plan.character.inventory.revision } }) },
      updateMask: { fieldPaths: ['inventory.revision'] }, updateTransforms: [{ fieldPath: 'inventory.items', appendMissingElements: { values: [encodeFirestoreValue(plan.character.inventory.items.at(-1))] } }], currentDocument: { updateTime: raw.updateTime } });
    writes.push({ update: { name: client.documentName(paths[1]), fields: encodeFirestoreFields(plan.claim) }, currentDocument: { exists: false } });
  }
  const before = { type: 'aleria-content-before-publication', capturedAt: now,
    documents: [raw, claimRaw, versionRaw, headRaw, lockRaw].filter(Boolean),
    newIds: writes.filter(write => write.update && write.currentDocument.exists === false).map(write => write.update.name.split('/documents/')[1]) };
  const archive = await encryptProjectBackup(before);
  assert.deepEqual(await decryptProjectBackup(archive), before, 'Vorhersicherung nicht rückentschlüsselbar.');
  const backupPath = new URL(`.private-backups/fleischsammler-report-${now.replace(/[:.]/g, '-')}.aleria-backup`, root);
  await writeFile(backupPath, archive, { flag: 'wx' });
  assert.deepEqual(await decryptProjectBackup(await readFile(backupPath)), before, 'Gespeicherte Vorhersicherung weicht ab.');
  const committed = await client.request(':commit', { writes });
  const after = await client.request(`/${paths[0]}`);
  const expectedFields = structuredClone(raw.fields);
  if (plan.changed) {
    expectedFields.inventory.mapValue.fields.revision = encodeFirestoreValue(plan.character.inventory.revision);
    const originalItems = expectedFields.inventory.mapValue.fields.items?.arrayValue?.values || [];
    expectedFields.inventory.mapValue.fields.items = { arrayValue: { values: [...originalItems, encodeFirestoreValue(plan.character.inventory.items.at(-1))] } };
  }
  assert.deepEqual(after.fields, expectedFields, 'Unbeteiligte Rohfelder oder alte Inventarwerte verändert.');
  const afterClaim = decodeFirestoreFields((await client.request(`/${paths[1]}`)).fields);
  assert.equal(planReportGrant({ character: { ...decodeFirestoreFields(after.fields), id: REPORT_RECIPIENT.id }, template, claim: afterClaim, now }).changed, false);
  Object.assign(summary, { productionWritesExecuted: true, committedAt: committed.commitTime,
    verified: true, oldTypedValuesPreserved: true, idempotent: true, backupPath: backupPath.pathname, writeCount: writes.length });
}
const receipt = `${summary.mode}-${now.replace(/[:.]/g, '-')}.json`;
await writeFile(new URL(receipt, output), JSON.stringify(summary, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(summary));
