// A single additive editorial publication. Personal figures, creatures, scenes,
// existing accounts and unrelated manifest fields are never rewritten.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createContentPublicationClient, createPublicContentReadClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';
import { OWETA_QUARTET_ID } from '../../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-module.mjs';
import { OWETA_QUARTET_ARTWORK } from '../../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-artwork.mjs';
import { OWETA_QUARTET_MEMBERS, OWETA_QUARTET_COMPANIONS } from '../../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-data.mjs';
import { OWETA_QUARTET_SOURCE_KEY, planOwetaQuartetPublication, assertOwetaQuartetOwnership } from '../../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-publication.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');
const decode = raw => raw ? decodeFirestoreFields(raw.fields || {}) : null;
const entryOf = raw => { const data = decode(raw); return data?.entryJson ? JSON.parse(data.entryJson) : data?.entry || null; };
const imageFile = new URL(`../../..${OWETA_QUARTET_ARTWORK.path}`, import.meta.url);
const output = new URL('../../../diagnostics/oweta-quartett-20261103/', import.meta.url);

async function loadArtwork() {
  const bytes = await readFile(imageFile);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Das Gruppenbild muss ein PNG sein.');
  assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2, 'Das Gruppenbild benötigt das vereinbarte Hochformat 2:3.');
  const sha256 = digest(bytes), assetId = `${OWETA_QUARTET_ARTWORK.assetId}-${sha256.slice(0, 16)}`;
  assert.equal(sha256, OWETA_QUARTET_ARTWORK.sha256, 'Das ausgewählte Gruppenbild weicht ab.');
  const storagePath = `family-assets/haus-draig/${assetId}/original.png`;
  return { bytes, sha256, assetId, storagePath,
    url: `https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media` };
}

async function prepareDefinitions(client, definitions, now) {
  const documents = [], writes = [];
  for (const definition of definitions) {
    const key = itemDefinitionKey(definition);
    assert(key, 'Eine gemeinsame Startvorlage besitzt keine feste Itemversion.');
    const [version, head] = await Promise.all([
      client.request(`/item_definition_versions/${encodeURIComponent(key)}`),
      client.request(`/item_definitions/${encodeURIComponent(definition.id)}`)
    ]);
    documents.push(version, head);
    if (version) assert.equal(itemDefinitionContent(decode(version)), itemDefinitionContent(definition), `Abweichende unveränderliche Itemversion: ${key}`);
    else writes.push({ update: { name: client.documentName(`item_definition_versions/${key}`),
      fields: encodeFirestoreFields({ ...definition, createdAt: now }) }, currentDocument: { exists: false } });
    // Existing heads may legitimately point at a later reviewed revision. The
    // pinned starter version stays usable without reverting that current head.
    if (!head) writes.push({ update: { name: client.documentName(`item_definitions/${definition.id}`),
      fields: encodeFirestoreFields({ ...definition, updatedAt: now }) }, currentDocument: { exists: false } });
  }
  return { documents, writes };
}

async function verifyExistingArtwork(entry) {
  const paths = new Set();
  function collect(value) {
    if (typeof value === 'string' && /^\/(?:AleriaAlmanach|Stammbäume)\//.test(value)) paths.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  }
  collect(entry);
  await Promise.all([...paths].map(async path => {
    const response = await fetch(`https://dieweltvonaleria.netlify.app${path}`, { signal: AbortSignal.timeout(30000) });
    assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), `Bestehendes Gruppenbild fehlt online: ${path}`);
    assert((await response.arrayBuffer()).byteLength, `Leeres Gruppenbild: ${path}`);
  }));
  return paths.size;
}

export async function publishOwetaQuartet({ apply = false } = {}) {
  // Preparing a new public group must not depend on cached editor credentials.
  // The protected one-time claim is read again by the authenticated apply path.
  const client = apply ? await createContentPublicationClient() : createPublicContentReadClient();
  const now = new Date().toISOString();
  const claimId = digest(OWETA_QUARTET_SOURCE_KEY);
  const [configDocument, moduleDocument, accountDocument, claimDocument, ...personalDocuments] = await Promise.all([
    client.request('/char_tabs/config'), client.request(`/module_store_entries/${OWETA_QUARTET_ID}`),
    client.request(`/group_quest_accounts/${OWETA_QUARTET_ID}`), apply ? client.request(`/item_award_claims/${claimId}`) : Promise.resolve(null),
    ...OWETA_QUARTET_MEMBERS.map(member => client.request(`/characters/${member.id}`)),
    ...OWETA_QUARTET_COMPANIONS.map(companion => client.request(`/creatures/${companion.id}`))
  ]);
  assert(configDocument, 'Die öffentliche Modulkonfiguration fehlt.');
  assert(personalDocuments.every(Boolean), 'Eine verknüpfte Figur oder ein Tier fehlt online.');
  const characters = personalDocuments.slice(0, OWETA_QUARTET_MEMBERS.length).map(raw => ({ ...decode(raw), id: raw.name.split('/').at(-1) }));
  const creatures = personalDocuments.slice(OWETA_QUARTET_MEMBERS.length).map(raw => ({ ...decode(raw), id: raw.name.split('/').at(-1) }));
  assertOwetaQuartetOwnership(characters, creatures);
  const config = decode(configDocument), module = entryOf(moduleDocument), account = decode(accountDocument), claim = decode(claimDocument);
  if (!apply && (module || account)) {
    assert(module?.id === OWETA_QUARTET_ID && account?.id === OWETA_QUARTET_ID, 'Modul und gemeinsames Konto sind nicht vollständig vorhanden.');
    return { moduleId: OWETA_QUARTET_ID, dryRun: true, alreadyPresent: true, requiresAuthenticatedClaimVerification: true,
      characterWrites: 0, creatureWrites: 0, publicImageReferencesVerified: await verifyExistingArtwork(module) };
  }
  const artwork = claim ? null : await loadArtwork();
  const plan = planOwetaQuartetPublication({ config, module, account, claim, image: artwork?.url, now });
  const summary = { moduleId: OWETA_QUARTET_ID, alreadyPublished: plan.alreadyPublished,
    pages: plan.entry.pages.length, characters: OWETA_QUARTET_MEMBERS.length, companions: OWETA_QUARTET_COMPANIONS.length,
    groupItems: plan.account.inventory.items.length, stock: plan.claim.result.items,
    characterWrites: 0, creatureWrites: 0, sceneCommentWrites: 0,
    url: `https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=${OWETA_QUARTET_ID}` };
  summary.publicImageReferencesVerified = await verifyExistingArtwork(plan.entry);
  await mkdir(output, { recursive: true });
  if (plan.alreadyPublished) {
    const verification = { ...summary, verified: true, consumedSuppliesPreserved: true };
    await writeFile(new URL('publication-verification.json', output), JSON.stringify(verification, null, 2) + '\n');
    return verification;
  }
  const definitions = await prepareDefinitions(client, plan.definitions, now);
  const prepared = { ...summary, dryRun: !apply, definitionsCreated: definitions.writes.length,
    protectedClaimChecked: apply,
    image: { localPath: OWETA_QUARTET_ARTWORK.path.slice(1), sha256: artwork.sha256, url: artwork.url },
    configFields: Object.keys(plan.configPatch) };
  await writeFile(new URL('publication-plan.json', output), JSON.stringify(prepared, null, 2) + '\n');
  if (!apply) return prepared;

  const revision = plan.configPatch.moduleStoreUpdatedAtClient;
  const writes = [...definitions.writes,
    ...personalDocuments.map(raw => ({ verify: raw.name, currentDocument: { updateTime: raw.updateTime } })),
    { update: { name: client.documentName(`module_store_entries/${OWETA_QUARTET_ID}`), fields: encodeFirestoreFields({
      entryId: OWETA_QUARTET_ID, moduleKind: 'override', entry: null, entryJson: JSON.stringify(plan.entry), schemaVersion: 1, updatedAtClient: revision
    }) }, currentDocument: { exists: false }, updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
    { update: { name: client.documentName(`group_quest_accounts/${OWETA_QUARTET_ID}`), fields: encodeFirestoreFields(plan.account) }, currentDocument: { exists: false } },
    { update: { name: client.documentName(`item_award_claims/${claimId}`), fields: encodeFirestoreFields({ ...plan.claim,
      fingerprint: digest(JSON.stringify({ sourceKey: plan.claim.sourceKey, operationId: plan.claim.operationId, rewards: plan.claim.rewards })) }) }, currentDocument: { exists: false } },
    { update: { name: configDocument.name, fields: encodeFirestoreFields(plan.configPatch) },
      updateMask: { fieldPaths: Object.keys(plan.configPatch) }, currentDocument: { updateTime: configDocument.updateTime },
      updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }] }
  ];
  await backupContentPublication('oweta-quartett-20261103', [configDocument, moduleDocument, accountDocument, claimDocument,
    ...personalDocuments, ...definitions.documents], writes.filter(write => write.update && write.currentDocument.exists === false)
      .map(write => write.update.name.split('/documents/')[1]), now);
  const asset = await client.publishFamilyArtwork({ familyId: 'haus-draig', assetId: artwork.assetId, bytes: artwork.bytes,
    metadata: { kind: 'group-scene', moduleId: OWETA_QUARTET_ID, sha256: artwork.sha256 } });
  assert.equal(asset.url, artwork.url);
  const committed = await client.request(':commit', { writes });
  const [afterModule, afterAccount, afterClaim, afterConfig, ...afterPersonal] = await Promise.all([
    client.request(`/module_store_entries/${OWETA_QUARTET_ID}`), client.request(`/group_quest_accounts/${OWETA_QUARTET_ID}`),
    client.request(`/item_award_claims/${claimId}`), client.request('/char_tabs/config'),
    ...personalDocuments.map(raw => client.request(`/${raw.name.split('/documents/')[1]}`))
  ]);
  assert.deepEqual(entryOf(afterModule), plan.entry, 'Das veröffentlichte Gruppenmodul weicht ab.');
  assert.deepEqual(decode(afterAccount), plan.account, 'Der gemeinsame Startvorrat weicht ab.');
  assert.deepEqual(decode(afterClaim).result, plan.claim.result, 'Der unveränderliche Startbeleg weicht ab.');
  const nextConfig = decode(afterConfig), expectedConfig = { ...config, ...plan.configPatch, moduleStoreUpdatedAt: nextConfig.moduleStoreUpdatedAt };
  assert.deepEqual(nextConfig, expectedConfig, 'Unbeteiligte Konfigurationsfelder wurden verändert.');
  afterPersonal.forEach((raw, index) => assert.deepEqual(raw.fields, personalDocuments[index].fields, 'Persönlicher Besitz oder Tierbogen wurde verändert.'));
  assert.equal(planOwetaQuartetPublication({ config: nextConfig, module: entryOf(afterModule), account: decode(afterAccount), claim: decode(afterClaim) }).alreadyPublished, true);
  const verification = { ...prepared, dryRun: false, verified: true, committedAt: committed.commitTime,
    idempotent: true, personalRecordsPreserved: true, unrelatedConfigurationPreserved: true, asset };
  await writeFile(new URL('publication-verification.json', output), JSON.stringify(verification, null, 2) + '\n');
  return verification;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await publishOwetaQuartet({ apply: process.argv.includes('--apply') })));
}
