import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const packages = {
  almanach: { directory: 'AleriaAlmanach', modules: ['esbuild'] },
  firebase: { directory: 'firebase/functions', modules: ['firebase-admin', 'firebase-functions'] }
};

export async function runtimeCheckDependencyPlan(root = repositoryRoot, scope = 'all') {
  if (scope !== 'all' && !Object.hasOwn(packages, scope)) throw Error('Unknown runtime check dependency scope.');
  const result = [];
  for (const [name, config] of Object.entries(packages)) {
    if (scope !== 'all' && scope !== name) continue;
    const directory = resolve(root, config.directory);
    const lock = JSON.parse(await readFile(resolve(directory, 'package-lock.json'), 'utf8'));
    const manifest = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
    const ordered = value => JSON.stringify(Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b)));
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies']) {
      if (ordered(manifest[field]) !== ordered(lock.packages?.['']?.[field])) throw Error(`Runtime package lock does not match ${name}/${field}.`);
    }
    const require = createRequire(resolve(directory, 'package.json'));
    const missing = [];
    for (const module of config.modules) {
      const expected = lock.packages?.[`node_modules/${module}`]?.version;
      if (!expected) throw Error(`Missing locked runtime dependency: ${name}/${module}`);
      try {
        const installed = JSON.parse(await readFile(resolve(directory, 'node_modules', module, 'package.json'), 'utf8'));
        if (installed.version !== expected) missing.push(module);
        else require.resolve(module);
      } catch { missing.push(module); }
    }
    result.push({ name, directory, missing });
  }
  return result;
}

function npmCi(directory) {
  const args = ['ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund'];
  const windows = process.platform === 'win32';
  return new Promise((resolvePromise, reject) => {
    const child = spawn(windows ? process.env.ComSpec || 'cmd.exe' : 'npm',
      windows ? ['/d', '/s', '/c', 'npm', ...args] : args,
      { cwd: directory, stdio: 'inherit', shell: false });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolvePromise() : reject(Error(`Runtime dependency installation failed (${signal || code}).`)));
  });
}

export async function prepareRuntimeCheckDependencies({ root = repositoryRoot, scope = 'all', check = false, run = npmCi, log = console.log } = {}) {
  for (const entry of await runtimeCheckDependencyPlan(root, scope)) {
    if (!entry.missing.length) { log(`[site-build] Reuse locked ${entry.name} test dependencies.`); continue; }
    if (check) throw Error(`Missing locked ${entry.name} test dependencies: ${entry.missing.join(', ')}`);
    log(`[site-build] Prepare locked ${entry.name} test dependencies.`);
    await run(entry.directory);
    const [after] = await runtimeCheckDependencyPlan(root, entry.name);
    if (after.missing.length) throw Error(`Runtime dependencies remain unavailable: ${after.name}/${after.missing.join(', ')}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareRuntimeCheckDependencies({ scope: process.argv.find(value => value.startsWith('--scope='))?.slice(8) || 'all', check: process.argv.includes('--check') });
}
