import { performance } from 'node:perf_hooks';
import { writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

export function createReleaseTimings({ clock = () => performance.now(), log = console.log } = {}) {
  const started = clock(), phases = [];
  return {
    async measure(name, action) {
      const start = clock();
      let status = 'failed';
      log(`[release] START ${name}`);
      try { const result = await action(); status = 'passed'; return result; }
      finally {
        const seconds = (clock() - start) / 1000;
        phases.push({ name, status, seconds });
        log(`[release] ${status === 'passed' ? 'DONE' : 'FAILED'} ${name} in ${seconds.toFixed(2)}s`);
      }
    },
    report(metadata = {}) {
      return { version: 1, ...metadata, recordedAt: new Date().toISOString(),
        totalSeconds: (clock() - started) / 1000, phases: phases.map(phase => ({ ...phase })) };
    },
  };
}

export async function writeReleaseTimings(file, report) {
  const temporary = file + '.' + randomUUID() + '.pending';
  try {
    await writeFile(temporary, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
    await rename(temporary, file);
  } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
}
