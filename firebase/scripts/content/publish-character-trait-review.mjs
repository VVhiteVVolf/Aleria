import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createContentPublicationClient, backupContentPublication, assertPublishedLocalArtwork } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { REVIEWED_CHARACTER_TRAITS, CHARACTER_TRAIT_REVIEW_VERSION } from '../../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { planCharacterTraitPublication, selectReviewedCombatWrite } from '../../../AleriaAlmanach/modules/character-trait-review/character-trait-publication-plan.mjs';
const client = await createContentPublicationClient(), directory = new URL('../../../diagnostics/combat-sheets-20261102/', import.meta.url);
const original = JSON.parse(await readFile(new URL('../../../diagnostics/character-trait-review-20261102/online-before.json', import.meta.url), 'utf8'));
const decode = raw => ({ ...decodeFirestoreFields(raw.fields), id: raw.name.split('/').at(-1) });
const raw = await Promise.all(REVIEWED_CHARACTER_TRAITS.map(assignment => client.request(`/characters/${assignment.onlineId}`)));
const now = new Date().toISOString();
const plans = raw.map((document, index) => {
  assert(document); const assignment = REVIEWED_CHARACTER_TRAITS[index];
  const baseline = original.profiles.find(row => row.id === assignment.onlineId)?.character; assert(baseline);
  return planCharacterTraitPublication({ character: decode(document), assignment, baseline, now });
});
const summary = { version: CHARACTER_TRAIT_REVIEW_VERSION, profiles: plans.map(plan => ({ id: plan.character.id, name: plan.character.name,
  changed: plan.changed, fieldPaths: plan.fieldPaths, revision: plan.character.combatProfile.revision,
  traits: plan.character.combatProfile.quirks.map(trait => ({ id: trait.id, name: trait.name, icon: trait.icon })) })) };
await mkdir(directory, { recursive: true });
if (process.argv.includes('--verify')) {
  assert(plans.every(plan => !plan.changed), 'Der Online-Abgleich ist nicht vollständig.');
  await writeFile(new URL('traits-online-verification.json', directory), JSON.stringify({ ...summary, verified: true, verifiedAt: now }, null, 2) + '\n');
  console.log(JSON.stringify({ verified: true, profiles: plans.length, changed: 0 }));
} else {
  await writeFile(new URL('traits-publication-plan.json', directory), JSON.stringify(summary, null, 2) + '\n');
  if (!process.argv.includes('--apply')) console.log(JSON.stringify({ dryRun: true, profiles: plans.length, changed: plans.filter(plan => plan.changed).length }));
  else {
    await assertPublishedLocalArtwork(plans.flatMap(plan => plan.character.combatProfile.quirks.map(trait => trait.icon))
      .filter(path => path?.startsWith('/AleriaAlmanach/assets/')).map(path => `.${path.slice('/AleriaAlmanach'.length)}`));
    const locks = await Promise.all(plans.map(plan => client.request(`/combat_profile_locks/characters/records/${plan.character.id}`)));
    locks.forEach((lock, index) => assert(!plans[index].changed || !lock || !decodeFirestoreFields(lock.fields).activeEncounterKeys?.length, `${plans[index].character.name}: aktiver Kampf.`));
    const writes = [];
    plans.forEach((plan, index) => {
      if (!plan.changed) return;
      const patch = selectReviewedCombatWrite(plan);
      writes.push({ verify: client.documentName(`combat_profile_locks/characters/records/${plan.character.id}`), currentDocument: locks[index] ? { updateTime: locks[index].updateTime } : { exists: false } });
      writes.push({ update: { name: raw[index].name, fields: encodeFirestoreFields(patch) }, updateMask: { fieldPaths: plan.fieldPaths }, currentDocument: { updateTime: raw[index].updateTime } });
    });
    if (writes.length) {
      await backupContentPublication('reviewed-combat-traits-20261102', [...raw, ...locks], [], now);
      const commit = await client.request(':commit', { writes });
      const after = await Promise.all(plans.map(plan => client.request(`/characters/${plan.character.id}`)));
      after.forEach((document, index) => assert.deepEqual(decode(document), plans[index].character));
      const latestUrl = new URL('traits-online-after.json', directory);
      const previous = await readFile(latestUrl, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
      if (previous) {
        const archived = new URL(`traits-online-after-${JSON.parse(previous).committedAt.replace(/[:.]/g, '-')}.json`, directory);
        await writeFile(archived, previous, { flag: 'wx' }).catch(async error => { if (error.code !== 'EEXIST') throw error; assert.equal(await readFile(archived, 'utf8'), previous); });
      }
      const receipt = JSON.stringify({ verified: true, committedAt: commit.commitTime,
        version: CHARACTER_TRAIT_REVIEW_VERSION, before: raw.map(decode), characters: after.map(decode), profiles: summary.profiles }, null, 2) + '\n';
      await writeFile(new URL(`traits-online-after-${commit.commitTime.replace(/[:.]/g, '-')}.json`, directory), receipt, { flag: 'wx' });
      await writeFile(latestUrl, receipt);
    }
    console.log(JSON.stringify({ applied: true, profiles: plans.length, changed: plans.filter(plan => plan.changed).length }));
  }
}
