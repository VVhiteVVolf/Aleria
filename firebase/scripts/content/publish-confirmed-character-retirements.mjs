// Preparation is public/read-only. --apply requires an unchanged reviewed plan
// and writes only the archived flag and redirect receipt on legacy documents.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONFIRMED_CHARACTER_RETIREMENTS } from '../../../CharakterDatenbank/assets/js/character-identity-retirements.mjs';
import { createPublicContentReadClient, createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { CHARACTER_RETIREMENT_PLAN_SCHEMA, planConfirmedCharacterRetirements, verifyCharacterRetirementPublication } from './character-retirement-plan.mjs';

async function capture(client) {
  const ids = [...new Set(CONFIRMED_CHARACTER_RETIREMENTS.flatMap(row => [row.legacyId, row.canonicalCharacterId]))];
  const documents = await Promise.all(ids.map(id => client.request(`/characters/${encodeURIComponent(id)}`)));
  return { documents: documents.filter(Boolean) };
}

export async function runConfirmedCharacterRetirements({ apply = false, planPath, now = new Date().toISOString(), client } = {}) {
  assert(planPath, 'Ein lokaler Planpfad ist erforderlich.');
  let reviewed;
  if (apply) {
    reviewed = JSON.parse(await readFile(planPath, 'utf8'));
    assert.equal(reviewed.schema, CHARACTER_RETIREMENT_PLAN_SCHEMA);
    assert.equal(reviewed.schemaVersion, 1);
  }
  const connection = client || (apply ? await createContentPublicationClient() : createPublicContentReadClient());
  const before = await capture(connection);
  const plan = planConfirmedCharacterRetirements({ ...before, preparedAt: reviewed?.preparedAt || now });
  if (!apply) {
    await mkdir(dirname(planPath), { recursive: true });
    await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);
    return { dryRun: true, ...plan.summary, planPath };
  }
  assert.deepEqual(plan, reviewed, 'Online-Ausgangsstand oder geprüfter Plan hat sich geändert. Bitte erneut vorbereiten und prüfen.');
  if (!plan.writes.length) return { alreadyApplied: true, ...plan.summary };
  // Complete REST originals are encrypted, outside public diagnostics.
  await backupContentPublication('confirmed-character-retirements', before.documents, [], now);
  await connection.request(':commit', { writes: plan.writes });
  const after = await capture(connection);
  verifyCharacterRetirementPublication(plan, before.documents, after.documents);
  return { applied: true, ...plan.summary, verifiedPreservation: true };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const at = process.argv.indexOf('--plan');
  const planPath = resolve(at >= 0 ? process.argv[at + 1] : 'diagnostics/character-identity-review-20261103/retirement-plan.json');
  const apply = process.argv.includes('--apply');
  if (apply && at < 0) throw Error('--apply benötigt ausdrücklich --plan <geprüfte Datei>.');
  console.log(JSON.stringify(await runConfirmedCharacterRetirements({ apply, planPath })));
}
