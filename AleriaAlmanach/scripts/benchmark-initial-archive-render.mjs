import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createArchiveRenderHarness } from '../tests/fixtures/archive-render-harness.mjs';

const beforePath = process.argv.find(argument => argument.startsWith('--before='))?.slice(9);
if (!beforePath) throw Error('Pass --before=<retained archive-view.js> to compare the same fixture before and after.');
const beforeSource = await readFile(resolve(beforePath), 'utf8');
async function measure(source) {
  const samples = [];
  let latest;
  for (let run = 0; run < 5; run++) {
    latest = await createArchiveRenderHarness({ source });
    samples.push(latest.render());
  }
  samples.sort((a, b) => a - b);
  return { medianMs: Math.round(samples[2] * 100) / 100, samplesMs: samples.map(value => Math.round(value * 100) / 100),
    moduleCards: latest.calls.cards, characterLoads: latest.calls.characters, creatureMounts: latest.calls.creatures,
    mainElementCount: latest.document.getElementById('main-content').querySelectorAll('[class]').length };
}
const before = await measure(beforeSource), after = await measure();
process.stdout.write(`${JSON.stringify({ fixture: { sections: 120, modules: 3600, runs: 5 },
  method: 'Node VM executes the real renderAll against one parsed DOM fixture. This measures synchronous render work, not browser/network page-load time.',
  before, after, medianReductionPercent: Math.round((1 - after.medianMs / before.medianMs) * 10000) / 100 }, null, 2)}\n`);
