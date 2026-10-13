// node AleriaAlmanach/tests/dice-lifecycle.browser.mjs <playwright module path>
// PLAYWRIGHT_EXECUTABLE optionally selects an installed browser. Local data only.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2]
  ? pathToFileURL(resolve(process.argv[2])).href : 'playwright');
const root = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const output = resolve(root, '.codex-temp/combat-performance');
await mkdir(output, { recursive: true });
const contentTypes = {
  '.js': 'text/javascript', '.json': 'application/json',
  '.wasm': 'application/wasm', '.png': 'image/png', '.jpg': 'image/jpeg'
};
const fixture = `<!doctype html><html><base href="/AleriaAlmanach/">
  <style>section{width:600px;height:400px;position:relative}canvas{width:100%;height:100%}</style>
  <section id="a"></section><section id="b"></section></html>`;
const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname === '/dice-test.html') {
      response.setHeader('Content-Type', 'text/html');
      response.end(fixture);
      return;
    }
    const file = resolve(root, '.' + decodeURIComponent(pathname));
    const location = relative(root, file);
    if (location.startsWith('..') || isAbsolute(location)) throw Error('Outside test root');
    response.setHeader('Content-Type', contentTypes[extname(file)] || 'application/octet-stream');
    response.end(await readFile(file));
  } catch {
    response.statusCode = 404;
    response.end();
  }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
let browser;
try {
  browser = await chromium.launch({
    headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE,
    args: ['--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1'
    ? route.continue() : route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/dice-test.html`);
  await page.evaluate(async () => {
    const module = await import('/AleriaAlmanach/modules/scene-dice/dice-service.js?v=20261013-performance-v1');
    window.testService = module.sceneDiceService;
  });

  const steps = [];
  for (let index = 0; index < 100; index++) {
    const durationMs = await page.evaluate(async index => {
      const start = performance.now();
      await window.testService.prepare(document.getElementById(index % 2 ? 'b' : 'a'));
      return performance.now() - start;
    }, index);
    steps.push({ mount: index, durationMs, workers: page.workers().length });
    assert.equal(page.workers().length, 2,
      'One physics worker and one render worker regardless of board changes');
  }
  const roll = await page.evaluate(async () => {
    const start = performance.now();
    const result = await window.testService.roll('1d20+5', document.getElementById('a'));
    return { durationMs: performance.now() - start, mode: result.visualMode,
      dice: result.dice, total: result.total };
  });
  assert.equal(roll.mode, '3d');
  assert.equal(roll.dice.length, 1);
  assert.ok(roll.dice[0] >= 1 && roll.dice[0] <= 20);
  assert.equal(roll.total, roll.dice[0] + 5);
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, 'dice-stress.json'), JSON.stringify({ steps, roll, errors }, null, 2));
  console.log(JSON.stringify({ mounts: steps.length, workers: page.workers().length, roll, errors }));
} finally {
  await browser?.close();
  await new Promise(done => server.close(done));
}
