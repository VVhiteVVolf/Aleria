// Public local snapshot only. This command never connects to Firebase or edits
// character files, private dossiers, inventories or historical combat results.
import { readFile, writeFile } from 'node:fs/promises';
import { planItemMigration } from '../modules/item-definitions/item-migration-model.js';
const { characters } = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8'));
const plans = characters.map(record => planItemMigration(record));
const report = { scope: 'public-local-snapshot; dry-run only', counts: Object.fromEntries(['safe', 'review', 'ignored'].map(key => [key, plans.reduce((sum, plan) => sum + plan[key].length, 0)])), plans: plans.filter(plan => plan.safe.length || plan.review.length) };
await writeFile(new URL('../../diagnostics/item-system-2026-10-31/migration-plan.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.counts));
