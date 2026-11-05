import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const report = async name => JSON.parse(await readFile(new URL(name, import.meta.url), 'utf8'));
const layout = await report('layout-report.json');
const picker = await report('picker-report.json');
assert.equal(layout.passed, true);
assert.equal(picker.passed, true);
assert.equal(layout.networkBlocked && picker.networkBlocked, true);
assert.equal(layout.measurements.length, 8);
assert.equal(picker.report.length, 2);
const tap = await readFile(new URL('targeted-tests.tap', import.meta.url), 'utf8');
assert.match(tap, /^# tests 62$/m);
assert.match(tap, /^# pass 62$/m);
assert.match(tap, /^# fail 0$/m);
const files = [
  'AleriaAlmanach/AleriaAlmanach.html', 'AleriaAlmanach/styles/scene-transition.css',
  ...['state', 'ui', 'events', 'target-picker'].map(name => `AleriaAlmanach/modules/scene-transition/scene-transition-${name}.js`)
];
const sourceHashes = Object.fromEntries(await Promise.all(files.map(async file => [file,
  createHash('sha256').update(await readFile(new URL(file, root))).digest('hex')])));
const verification = { date: '2026-11-04', status: 'passed', scope: 'local',
  tests: { passed: 62, failed: 0, evidence: 'targeted-tests.tap' },
  browser: { fixtureOnly: true, networkBlocked: true, dialogLayouts: picker.report.length,
    longThreadLayouts: layout.measurements.length, desktopAndMobile: true,
    evidence: ['picker-report.json', 'layout-report.json'], visualReview: true },
  productionDataChanged: false, pushed: false, deployed: false, sourceHashes };
await writeFile(new URL('verification.json', import.meta.url), `${JSON.stringify(verification, null, 2)}\n`);
console.log(JSON.stringify({ status: verification.status, tests: 62, dialogLayouts: 2, longThreadLayouts: 8 }));
