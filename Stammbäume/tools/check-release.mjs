import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { rm } from 'node:fs/promises';
import path from 'node:path';

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
  if (process.platform === 'win32') await run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm ci --include=dev --ignore-scripts --no-audit --no-fund']);
  else await run('npm', ['ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund']);
  await run(process.execPath, ['node_modules/playwright-core/cli.js', 'install', '--with-deps', 'chromium']);
}
try {
  await run(process.execPath, ['--test', '--experimental-test-isolation=none', 'tests/family-chart-reading.test.js', 'tests/family-chart-partnerships.test.js', 'tests/relationship-matrix.test.js', 'tests/chart-geometry-audit.test.js', 'tests/family-chart-overview.test.js', 'tests/person-entry-viewport.test.js']);
  await run(process.execPath, ['tools/check-chart-geometry.mjs']);
} finally {
  // Netlify publishes the repository root. Its freshly installed test tools
  // must not become website assets; local development dependencies stay put.
  if (prepareBrowser && process.env.NETLIFY === 'true') {
    const dependencyDirectory = path.resolve(cwd, 'node_modules');
    if (path.dirname(dependencyDirectory) !== path.resolve(cwd)) throw new Error('Ungültiges Testwerkzeug-Verzeichnis.');
    await rm(dependencyDirectory, { recursive: true, force: true });
  }
}
