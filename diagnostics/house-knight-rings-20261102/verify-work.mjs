import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const tests = [
  ...['house-signets-and-silberhirsch', 'house-signets-database', 'starting-possessions-database',
    'item-definitions', 'character-equipment-sync', 'equipment-damage-protection', 'combat-defense-balance',
    'inventory-equipment-effects', 'gildas-equipment-effects', 'equipment-standards-2026-11',
    'draig-knight-equipment', 'knight-equipment-plan', 'oweta-equipment-database', 'gwynthor-seven']
    .map(name => `AleriaAlmanach/tests/${name}.test.mjs`),
  ...['silberhirsch-protection', 'item-definitions', 'item-system-checkup', 'item-passive-profile',
    'combat-inventory-hydration', 'combat-resolution-integrity', 'item-register']
    .map(name => `firebase/functions/tests/${name}.test.js`)
];
const checks = [
  ['AleriaAlmanach/scripts/build-authored-item-catalog.mjs', '--check'],
  ['AleriaAlmanach/scripts/build-item-register.mjs', '--check'],
  ['CharakterDatenbank/scripts/sync-house-signets.mjs', '--check'],
  ['CharakterDatenbank/scripts/sync-knight-starting-possessions.mjs', '--check'],
  ['CharakterDatenbank/scripts/sync-oweta-equipment.mjs', '--check'],
  ['AleriaAlmanach/scripts/build-gwynthor-seven.mjs', '--check'],
  ['netlify/build/check-mechanics-projection.mjs']
];
const results = [];
for (const [index, args] of [
  ['tests', ['--test', '--experimental-test-isolation=none', '--test-reporter=tap', ...tests]],
  ...checks.map((args, index) => [`check-${index + 1}`, args])
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
  const output = (result.stdout || '') + (result.stderr || '');
  await writeFile(new URL(`./${index}.log`, import.meta.url), output);
  const row = { name: index, args, exitCode: result.status,
    ...(index === 'tests' ? { tests: Number(output.match(/^# tests (\d+)/m)?.[1]), passed: Number(output.match(/^# pass (\d+)/m)?.[1]), failed: Number(output.match(/^# fail (\d+)/m)?.[1]) } : {}) };
  results.push(row); console.log(JSON.stringify({ ...row, args: undefined }));
  if (result.error || result.status !== 0) throw Error(`${index}: ${result.error?.message || output.slice(-5000)}`);
}
const online = JSON.parse(await readFile(new URL('./verification-plan.json', import.meta.url), 'utf8'));
await writeFile(new URL('./final-checks.json', import.meta.url), JSON.stringify({
  verifiedAt: new Date().toISOString(), checks: results, online: { profiles: online.online,
    idempotent: online.profiles.every(profile => !profile.changed) }, codeDeployed: false
}, null, 2) + '\n');
