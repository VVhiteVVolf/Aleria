// Reviewed additive completion of the first publication. No starter grant,
// personal data, inventory or user-edited module content can be replaced.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { createContentPublicationClient, backupContentPublication } from '../../firebase/scripts/content/content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../../firebase/scripts/backup/firestore-value-codec.mjs';
import { buildOwetaQuartet } from '../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-module.mjs';

const client = await createContentPublicationClient();
const path = '/module_store_entries/oweta-quartett';
const [moduleBefore, configBefore, accountBefore] = await Promise.all([
  client.request(path), client.request('/char_tabs/config'), client.request('/group_quest_accounts/oweta-quartett')
]);
const entry = JSON.parse(decodeFirestoreFields(moduleBefore.fields).entryJson);
const expected = buildOwetaQuartet({ image: entry.image });
const previousHierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
const nextHierarchy = expected.pages.find(page => page.hierarchyPage).hierarchy;
const additions = ['motto', 'detailsTitle', 'details'];
const beforeWithoutAdditions = structuredClone(entry);
const expectedWithoutAdditions = structuredClone(expected);
for (const value of [beforeWithoutAdditions, expectedWithoutAdditions]) {
  const hierarchy = value.pages.find(page => page.hierarchyPage).hierarchy;
  for (const key of additions) delete hierarchy[key];
}
assert.deepEqual(beforeWithoutAdditions, expectedWithoutAdditions, 'Spätere Modulbearbeitung: Ergänzung abgebrochen.');
for (const key of additions) {
  assert(!Object.hasOwn(previousHierarchy, key) || isDeepStrictEqual(previousHierarchy[key], nextHierarchy[key]),
    `Vorhandenes Hierarchiefeld bleibt erhalten: ${key}`);
}
if (isDeepStrictEqual(entry, expected)) {
  console.log(JSON.stringify({ alreadyComplete: true, writes: 0 }));
} else {
  const now = new Date().toISOString();
  const config = decodeFirestoreFields(configBefore.fields);
  const revision = Math.max(Date.parse(now), Number(config.moduleStoreUpdatedAtClient || 0) + 1,
    Number(config.moduleStoreManifest.updatedAtClient || 0) + 1);
  await backupContentPublication('oweta-quartett-hierarchy-completion', [moduleBefore, configBefore, accountBefore], [], now);
  await client.request(':commit', { writes: [
    { update: { name: moduleBefore.name, fields: encodeFirestoreFields({ entryJson: JSON.stringify(expected), updatedAtClient: revision }) },
      updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] }, currentDocument: { updateTime: moduleBefore.updateTime },
      updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
    { update: { name: configBefore.name, fields: encodeFirestoreFields({ moduleStoreUpdatedAtClient: revision,
      moduleStoreManifest: { updatedAtClient: revision } }) },
      updateMask: { fieldPaths: ['moduleStoreUpdatedAtClient', 'moduleStoreManifest.updatedAtClient'] },
      currentDocument: { updateTime: configBefore.updateTime },
      updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }] }
  ] });
  const [moduleAfter, configAfter, accountAfter] = await Promise.all([
    client.request(path), client.request('/char_tabs/config'), client.request('/group_quest_accounts/oweta-quartett')
  ]);
  assert.deepEqual(JSON.parse(decodeFirestoreFields(moduleAfter.fields).entryJson), expected);
  assert.deepEqual(accountAfter.fields, accountBefore.fields, 'Gemeinsamer Vorrat muss unverändert bleiben.');
  const nextConfig = decodeFirestoreFields(configAfter.fields);
  assert.deepEqual(nextConfig, { ...config, moduleStoreUpdatedAtClient: revision,
    moduleStoreUpdatedAt: nextConfig.moduleStoreUpdatedAt,
    moduleStoreManifest: { ...config.moduleStoreManifest, updatedAtClient: revision } });
  const result = { verified: true, hierarchyAdditions: additions, inventoryPreserved: true, unrelatedConfigurationPreserved: true };
  await writeFile(new URL('hierarchy-completion.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
