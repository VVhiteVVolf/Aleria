// Bounded local integration: preserve every unrelated household and snapshot.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHouseholdCatalog } from '../../Karten/modules/households/household-model.mjs';
import { loadHouseholdSources } from '../../Karten/tools/household-sources.mjs';
import { publishFamilySnapshots } from '../../Stammbäume/tools/publish-family-snapshots.mjs';

const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const target = 'Karten/modules/households/households.generated.json';
const before = await readJson('diagnostics/perllan-import-20261104/before-households.generated.json');
const current = await readJson(target);
const family = FAMILY_REGISTRY.find(record => record.id === 'haus-perllan');
assert(family, 'Perllan must be registered before deriving records.');
const sources = await loadHouseholdSources();
assert.deepEqual(current.families.filter(entry => entry.id !== family.id), before.families);
const perllan = createHouseholdCatalog([family], {}, sources).families[0];
// Existing unrelated ordering/entries are retained, even if a full rebuild
// would also reconcile older local registry changes outside this import.
const rebuilt = { ...before, families: [...before.families, perllan] };
assert.equal(perllan.residences.length, 1);
assert.equal(perllan.residences[0].seat, 'Gwynthor');
const check = process.argv.includes('--check');
if (check) assert.deepEqual(current, rebuilt);
else await writeFile(new URL(target, root), JSON.stringify(rebuilt, null, 2) + '\n');
const snapshots = await publishFamilySnapshots([family.id], { apply: !check });
if (check) assert.deepEqual(snapshots.changed, []);
const review = { schema: 'aleria.perllan-derived-review', localOnly: true,
  unrelatedHouseholdsPreserved: before.families.length, addedHousehold: perllan,
  snapshots, firestoreWrites: 0 };
if (!check) await writeFile(new URL('derived-records.json', import.meta.url), JSON.stringify(review, null, 2) + '\n');
console.log(JSON.stringify(review));
