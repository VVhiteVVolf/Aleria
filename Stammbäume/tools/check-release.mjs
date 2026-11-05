import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareChartReleaseDependencies } from './prepare-release-dependencies.mjs';

const cwd = fileURLToPath(new URL('../', import.meta.url));
function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Freigabeprüfung fehlgeschlagen: ${command} (${code})`)));
  });
}
const prepareBrowser = process.argv.includes('--prepare-browser');
if (prepareBrowser) {
  // Build images provide the shared libraries; installing system packages
  // would require root privileges that hosted Netlify builds do not grant.
  await prepareChartReleaseDependencies({ directory: cwd, run: ({ command, args }) => run(command, args) });
}
// Publication is staged from versioned website files; installed tools cannot
// become public assets and no longer need to be deleted after every check.
await run(process.execPath, ['--test', '--experimental-test-isolation=none', 'tests/release-dependencies.test.js', 'tests/family-chart-reading.test.js', 'tests/family-chart-partnerships.test.js', 'tests/family-chart-partner-traversal.test.js', 'tests/relationship-matrix.test.js', 'tests/chart-geometry-audit.test.js', 'tests/family-chart-overview.test.js', 'tests/person-entry-viewport.test.js']);
await run(process.execPath, ['tools/check-chart-geometry.mjs']);
