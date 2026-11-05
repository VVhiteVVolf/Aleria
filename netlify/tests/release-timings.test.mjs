import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createReleaseTimings, writeReleaseTimings } from '../release/release-timings.mjs';

test('release timings distinguish successful and failed phases without recording secret error text', async t => {
  let clock = 1000;
  const timings = createReleaseTimings({ clock: () => clock, log() {} });
  assert.equal(await timings.measure('planning', () => { clock += 250; return 42; }), 42);
  await assert.rejects(timings.measure('upload', () => { clock += 750; throw Error('sensitive input'); }), /sensitive/);
  const report = timings.report({ status: 'failed' });
  assert.equal(report.totalSeconds, 1);
  assert.deepEqual(report.phases, [{ name: 'planning', status: 'passed', seconds: 0.25 },
    { name: 'upload', status: 'failed', seconds: 0.75 }]);
  assert.ok(!JSON.stringify(report).includes('sensitive'));
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-timing-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const file = path.join(root, 'timings.json');
  await writeReleaseTimings(file, report);
  await writeReleaseTimings(file, { ...report, status: 'passed' });
  assert.equal(JSON.parse(await readFile(file, 'utf8')).status, 'passed');
});
