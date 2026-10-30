import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const root = new URL('../../', import.meta.url);
const beforeCommit = '13bce7ae293d86631438931e2ba446a1aaf970e7';
const getOld = file => execFileSync('git', ['show', `${beforeCommit}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 32*1024*1024 });
const dataUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const overrides = new Map();
function imports(source, file) {
  const base = new URL(file, root);
  return source.replace(/\bfrom\s+(['"])(\.[^'"]+)\1/g, (_, quote, relative) => {
    const resolved = new URL(relative, base); resolved.search = '';
    return 'from ' + JSON.stringify(overrides.get(resolved.href) || new URL(relative, base).href);
  });
}
for (const file of ['Stammbäume/assets/js/data/house-falchdyn-portraits.js',
  'Stammbäume/assets/js/data/house-falchdyn-family.js', 'Stammbäume/assets/js/data/house-swyll-family.js',
  'Stammbäume/assets/js/data/gwynthor-commoner-house-families.js']) {
  overrides.set(new URL(file, root).href, dataUrl(imports(getOld(file), file)));
}
const registryPath = 'Stammbäume/assets/js/data/families.registry.js';
// Use the published review policy so this proof remains reproducible after
// its own approved receipt is integrated into the current policy.
const policyPath = 'Kontinente/tests/support/albic-review-baseline.mjs';
const { protectedAlbicFamilies, reviewHash } = await import(dataUrl(imports(getOld(policyPath), policyPath)));
const previous = (await import(dataUrl(imports(await readFile(new URL(registryPath, root), 'utf8'), registryPath)))).FAMILY_REGISTRY;
const ids = new Set(JSON.parse(await readFile(new URL('Kontinente/tests/support/family-baseline-20261023.json', root), 'utf8')));
const before = protectedAlbicFamilies(previous.filter(r => ids.has(r.id)));
const after = protectedAlbicFamilies(FAMILY_REGISTRY.filter(r => ids.has(r.id)));
const historical = JSON.parse(await readFile(new URL('Kontinente/tests/support/albic-family-review-20261024.json', root), 'utf8'));
assert.equal(reviewHash(before), historical.protectedSha256, 'The published pre-court records must reproduce the existing protected baseline exactly.');
const changed = before.filter((record, index) => reviewHash(record) !== reviewHash(after[index])).map(record => record.id);
assert.deepEqual([...changed].sort(), ['haus-falchdyn', 'haus-swyll']);
const receipt = { reviewedAt: '2026-10-30', beforeCommit, previousProtectedSha256: reviewHash(before),
  reason: 'Explicit user approval: add Lleucu Swyll and both marriages, end the Swyll branches at the two house links, and make the existing Gethin Falchdyn the court-appointed advocate with his new portrait. New independent families are outside the historical capture. Every field of these two changed records is checked by its approved checksum before projecting its exact former record; all other historical records remain protected unchanged.',
  families: Object.fromEntries(changed.map(id => [id, { before: before.find(r => r.id === id), afterSha256: reviewHash(after.find(r => r.id === id)) }])) };
await writeFile(new URL('Kontinente/tests/support/gwynthor-court-family-review-20261030.json', root), JSON.stringify(receipt, null, 2)+'\n');
console.log(JSON.stringify({ beforeHash: reviewHash(before), afterHash: reviewHash(after), changedFamilies: changed }));
