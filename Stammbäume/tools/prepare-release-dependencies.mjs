import { readFile, access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { assertLocalInstallDirectory } from '../../netlify/build/prepare-runtime-checks.mjs';

const dependencyFields = ['dependencies', 'devDependencies', 'optionalDependencies'];
const ordered = value => JSON.stringify(Object.entries(value || {}).sort(([a], [b]) => a.localeCompare(b)));
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));

function assertNodeEngine(engine, nodeVersion) {
  // The pinned, JavaScript-only Playwright tool currently declares >=18.
  // Fail closed on a new constraint rather than guessing about compatibility.
  const minimum = /^>=(\d+)(?:\.(\d+))?(?:\.(\d+))?$/.exec(engine || '');
  if (!minimum) throw Error(`Unsupported locked Playwright Node engine: ${engine}`);
  const actual = nodeVersion.replace(/^v/, '').split('.').map(Number);
  const required = minimum.slice(1).map(value => Number(value || 0));
  for (let index = 0; index < 3; index++) {
    if (actual[index] > required[index]) return;
    if (actual[index] < required[index]) throw Error(`Playwright requires Node ${engine}; running ${nodeVersion}.`);
  }
}

export async function chartReleaseDependencyPlan({ directory, nodeVersion = process.versions.node } = {}) {
  const manifest = await readJson(resolve(directory, 'package.json'));
  const lock = await readJson(resolve(directory, 'package-lock.json'));
  if (lock.lockfileVersion !== 3 || !lock.packages?.['']) throw Error('Unsupported chart release package lock.');
  for (const field of dependencyFields) {
    if (ordered(manifest[field]) !== ordered(lock.packages[''][field])) throw Error(`Chart release package lock does not match ${field}.`);
  }
  const expected = lock.packages['node_modules/playwright-core'];
  if (!expected?.version || !expected.integrity) throw Error('Missing locked chart release dependency: playwright-core.');
  assertNodeEngine(expected.engines?.node, nodeVersion);
  const reasons = [];
  try {
    const installedLock = await readJson(resolve(directory, 'node_modules/.package-lock.json'));
    if (installedLock.lockfileVersion !== lock.lockfileVersion) reasons.push('install lock format');
    for (const [path, entry] of Object.entries(lock.packages)) {
      if (!path) continue;
      const installedEntry = installedLock.packages?.[path];
      if (['version', 'resolved', 'integrity', 'link'].some(field => installedEntry?.[field] !== entry[field])) reasons.push(`install lock: ${path}`);
      const installed = await readJson(resolve(directory, path, 'package.json'));
      if (installed.version !== entry.version) reasons.push(`installed version: ${path}`);
      if (installed.name !== path.slice(path.lastIndexOf('node_modules/') + 13)) reasons.push(`installed package identity: ${path}`);
    }
    const require = createRequire(resolve(directory, 'package.json'));
    require.resolve('playwright-core');
    for (const file of ['cli.js', 'browsers.json']) await access(resolve(directory, 'node_modules/playwright-core', file));
  } catch (error) { reasons.push(`incomplete installation: ${error.code || error.message}`); }
  return { directory, version: expected.version, reasons };
}

export function chartDependencyInstallCommand(platform = process.platform, comspec = process.env.ComSpec) {
  const args = ['ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund'];
  return platform === 'win32'
    ? { command: comspec || 'cmd.exe', args: ['/d', '/s', '/c', 'npm', ...args] }
    : { command: 'npm', args };
}

async function runCommand({ command, args, directory }) {
  await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd: directory, stdio: 'inherit', shell: false });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolvePromise() : reject(Error(`Chart release dependency preparation failed (${signal || code}).`)));
  });
}

async function probeLockedBrowser(directory) {
  const require = createRequire(resolve(directory, 'package.json'));
  const { chromium } = require('playwright-core');
  const browser = await chromium.launch({ headless: true });
  try { return browser.version(); }
  finally { await browser.close(); }
}

async function assertBrowserVersion(directory, probeBrowser) {
  const browsers = await readJson(resolve(directory, 'node_modules/playwright-core/browsers.json'));
  const expected = browsers.browsers?.find(browser => browser.name === 'chromium-headless-shell');
  if (!expected?.revision || !expected.browserVersion) throw Error('Missing locked Chromium headless-shell revision.');
  const actual = await probeBrowser(directory);
  if (actual !== expected.browserVersion) throw Error(`Locked Chromium revision ${expected.revision} requires ${expected.browserVersion}; found ${actual}.`);
}

export async function prepareChartReleaseDependencies({ directory, run = runCommand, probeBrowser = probeLockedBrowser, log = console.log } = {}) {
  const plan = await chartReleaseDependencyPlan({ directory });
  if (plan.reasons.length) {
    await assertLocalInstallDirectory(directory);
    log(`[chart-release] Prepare locked Playwright ${plan.version}: ${plan.reasons.join(', ')}`);
    await run({ ...chartDependencyInstallCommand(), directory });
    const after = await chartReleaseDependencyPlan({ directory });
    if (after.reasons.length) throw Error(`Chart release dependencies remain unavailable: ${after.reasons.join(', ')}`);
  } else log(`[chart-release] Reuse locked Playwright ${plan.version}.`);
  try { await assertBrowserVersion(directory, probeBrowser); }
  catch (error) {
    // Missing system libraries, launch failures and wrong versions require
    // investigation; downloading the same browser would not repair them.
    if (!/Executable doesn't exist at/.test(error.message)) throw error;
    log('[chart-release] Install missing locked Chromium headless shell.');
    await run({ command: process.execPath, args: ['node_modules/playwright-core/cli.js', 'install', 'chromium', '--only-shell'], directory });
    await assertBrowserVersion(directory, probeBrowser);
  }
  log('[chart-release] Locked Chromium revision and browser version verified.');
}
