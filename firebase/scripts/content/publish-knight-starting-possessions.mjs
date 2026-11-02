// One-time personal miscellany and pocket money; uses the existing award ledger.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { KNIGHT_EQUIPMENT_TARGETS } from '../../../AleriaAlmanach/modules/gwynthor-seven/knight-equipment-plan.mjs';
import { KNIGHT_STARTING_POSSESSIONS } from '../../../AleriaAlmanach/modules/gwynthor-seven/starting-possessions.mjs';
import { getStartingPossessionsSourceKey, planKnightStartingPossessions } from '../../../AleriaAlmanach/modules/gwynthor-seven/starting-possessions-plan.mjs';
import { STANDARD_ITEMS } from '../../../AleriaAlmanach/modules/item-register/item-register-standard.js';
import { AUTHORED_ITEMS } from '../../../AleriaAlmanach/modules/item-definitions/authored-item-catalog.js';
import { itemDefinitionFromTemplate, itemDefinitionKey, itemDefinitionContent } from '../../../AleriaAlmanach/modules/item-definitions/item-definition-model.js';

const apply = process.argv.includes('--apply'), verifyOnly = process.argv.includes('--verify');
// Award claims are moderator-only, including during a read-only preparation.
const client = await createContentPublicationClient();
const directory = new URL('../../../diagnostics/knight-equipment-20261102/', import.meta.url);
await mkdir(directory, { recursive: true });
const save = (name, data) => writeFile(new URL(name, directory), JSON.stringify(data, null, 2) + '\n');
const now = new Date().toISOString(), digest = value => createHash('sha256').update(value).digest('hex');
const decode = raw => raw ? { ...decodeFirestoreFields(raw.fields || {}), id: raw.name.split('/').at(-1) } : null;
const documents = await Promise.all(KNIGHT_EQUIPMENT_TARGETS.map(target => client.request(`/characters/${target.knownIds[0]}`)));
assert(documents.every(Boolean), 'Zuerst die fehlenden Charakterakte und Ausrüstung veröffentlichen.');
const characters = documents.map(decode);
characters.forEach((character, index) => {
  const target = KNIGHT_EQUIPMENT_TARGETS[index];
  assert.equal(character.name, target.name, 'Abweichende Empfängeridentität.');
  for (const worldId of [character.identity?.worldPersonId, character.genealogy?.worldPersonId].filter(Boolean)) assert.equal(worldId, target.worldPersonId, 'Abweichende Weltperson.');
});
const templateIds = new Set(Object.values(KNIGHT_STARTING_POSSESSIONS).flatMap(spec => spec.items.map(item => item.templateId)));
const templates = [...STANDARD_ITEMS, ...AUTHORED_ITEMS].filter(template => templateIds.has(template.id));
assert.equal(templates.length, templateIds.size, 'Startbesitzvorlagen fehlen im aktuellen Katalog.');
const claims = await Promise.all(characters.map(character => client.request(`/item_award_claims/${digest(getStartingPossessionsSourceKey(character.id))}`)));
const plans = characters.map((character, index) => planKnightStartingPossessions({ character,
  specification: KNIGHT_STARTING_POSSESSIONS[KNIGHT_EQUIPMENT_TARGETS[index].key], templates,
  claim: claims[index] ? decodeFirestoreFields(claims[index].fields) : null, now }));
const definitions = templates.map(itemDefinitionFromTemplate);
const versions = await Promise.all(definitions.map(definition => client.request(`/item_definition_versions/${encodeURIComponent(itemDefinitionKey(definition))}`)));
const heads = await Promise.all(definitions.map(definition => client.request(`/item_definitions/${encodeURIComponent(definition.id)}`)));
const definitionWrites = [];
definitions.forEach((definition, index) => {
  assert(definition, 'Eine Startvorlage besitzt keine Regelversion.');
  if (versions[index]) assert.equal(itemDefinitionContent(decodeFirestoreFields(versions[index].fields)), itemDefinitionContent(definition), 'Gespeicherte Itemversion weicht ab.');
  else definitionWrites.push({ update: { name: client.documentName(`item_definition_versions/${itemDefinitionKey(definition)}`), fields: encodeFirestoreFields({ ...definition, createdAt: now }) }, currentDocument: { exists: false } });
  if (heads[index]) assert.equal(itemDefinitionContent(decodeFirestoreFields(heads[index].fields)), itemDefinitionContent(definition), 'Vorhandener Definitionskopf weicht ab.');
  else definitionWrites.push({ update: { name: client.documentName(`item_definitions/${definition.id}`), fields: encodeFirestoreFields({ ...definition, updatedAt: now }) }, currentDocument: { exists: false } });
});
const summary = { dryRun: !apply, profiles: plans.map((plan, index) => ({ name: plan.character.name,
  changed: plan.changed, items: plan.grant?.result.items || [], addedCopper: plan.grant?.result.copper || 0,
  moneyState: plan.character.inventory.moneyState, rationale: KNIGHT_STARTING_POSSESSIONS[KNIGHT_EQUIPMENT_TARGETS[index].key].rationale })),
  definitionDocuments: definitionWrites.length };
await save(verifyOnly ? 'starting-verification-plan.json' : 'starting-prepared-plan.json', summary);
if (!verifyOnly) await save('starting-characters-prepared.json', { capturedAt: now, characters: plans.map(plan => plan.character) });
if (verifyOnly) {
  assert(plans.every(plan => !plan.changed), 'Startbesitz würde erneut vergeben.');
  assert.equal(definitionWrites.length, 0, 'Startbesitzversionen fehlen.');
}
if (apply && (plans.some(plan => plan.changed) || definitionWrites.length)) {
  // Standard catalogue images are existing released assets, not new artwork in
  // this award. Only the newly authored picture must pass a fresh publication
  // check; a temporary website outage must not change the standard definitions.
  for (const image of new Set(templates.filter(template => !template.id.startsWith('standard:')).map(template => template.image))) {
    const url = image.startsWith('/') ? `https://dieweltvonaleria.netlify.app${image}` : image;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        assert(response.ok && response.headers.get('content-type')?.startsWith('image/'), `Startbesitzbild fehlt: ${image}`);
        assert((await response.arrayBuffer()).byteLength, `Leeres Startbesitzbild: ${image}`);
        break;
      } catch (error) {
        if (attempt === 1) throw new Error(`Öffentliches Startbesitzbild konnte nicht geprüft werden: ${url}`, { cause: error });
      }
    }
  }
  const locks = await Promise.all(characters.map(character => client.request(`/combat_profile_locks/characters/records/${character.id}`)));
  for (const lock of locks) assert(!(lock && decodeFirestoreFields(lock.fields).activeEncounterKeys?.length), 'Startbesitz während eines aktiven Kampfes gesperrt.');
  const writes = [...definitionWrites];
  plans.forEach((plan, index) => {
    if (!plan.changed) return;
    writes.push({ verify: client.documentName(`combat_profile_locks/characters/records/${plan.character.id}`), currentDocument: locks[index] ? { updateTime: locks[index].updateTime } : { exists: false } });
    writes.push({ update: { name: documents[index].name, fields: encodeFirestoreFields({ inventory: plan.character.inventory }) },
      updateMask: { fieldPaths: ['inventory'] }, currentDocument: { updateTime: documents[index].updateTime } });
    const fingerprint = digest(JSON.stringify({ sourceKey: plan.grant.sourceKey, operationId: plan.grant.operationId, rewards: plan.grant.rewards }));
    writes.push({ update: { name: client.documentName(`item_award_claims/${digest(plan.grant.sourceKey)}`), fields: encodeFirestoreFields({ ...plan.grant, fingerprint }) }, currentDocument: { exists: false } });
  });
  await backupContentPublication('knight-starting-possessions-20261102', [...documents, ...claims, ...versions, ...heads, ...locks],
    writes.filter(write => write.update && write.currentDocument.exists === false).map(write => write.update.name.split('/documents/')[1]), now);
  const committed = await client.request(':commit', { writes });
  const after = await Promise.all(plans.map(async (plan, index) => {
    const character = decode(await client.request(`/characters/${plan.character.id}`));
    assert.deepEqual(character, plan.character, `Unbeteiligte Daten verändert: ${character.name}`);
    const claim = decodeFirestoreFields((await client.request(`/item_award_claims/${digest(getStartingPossessionsSourceKey(character.id))}`)).fields);
    const repeated = planKnightStartingPossessions({ character, specification: KNIGHT_STARTING_POSSESSIONS[KNIGHT_EQUIPMENT_TARGETS[index].key], templates, claim, now });
    assert.equal(repeated.changed, false, 'Einmalige Vergabe ist nicht geschützt.');
    assert.deepEqual(repeated.character, character, 'Erneute Vergabe verändert den Geldbeutel.');
    return character;
  }));
  await save('starting-characters-after.json', { capturedAt: committed.commitTime, characters: after });
  await save('starting-publication-verification.json', { ...summary, dryRun: false, verified: true,
    committedAt: committed.commitTime, idempotent: true, otherPossessionsAndCombatProfilesPreserved: true });
  console.log(JSON.stringify({ applied: true, verified: true, profiles: summary.profiles }));
} else console.log(JSON.stringify(summary));
