import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, reducedMotion: 'reduce' });
  const errors = [], missing = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().startsWith(server.origin) && response.status() >= 400) missing.push(response.url()); });
  await page.route('**/*', route => new URL(route.request().url()).origin === server.origin && route.request().method() === 'GET' ? route.continue() : route.abort());
  await page.goto(server.origin + '/Stammb%C3%A4ume/tests/chart-quality-fixture.html');
  await page.evaluate(async () => {
    const base = document.createElement('base');
    base.href = new URL('../', location.href).href;
    document.head.prepend(base);
    window.chartQualityFixture = await import('/Stammb%C3%A4ume/tests/chart-quality-fixture.js');
  });
  const audit = await page.evaluate(() => window.chartQualityFixture.auditFamily('haus-llythfor'));
  assert.equal(audit.passed, true, JSON.stringify(audit.issues));
  await page.evaluate(async () => { await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
  const cards = await page.locator('.card_cont').evaluateAll(elements => elements.map(element => {
    const data = element.__data__?.data || {};
    const rect = element.getBoundingClientRect();
    return { id: data.id, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, width: rect.width, height: rect.height };
  }));
  const father = cards.find(card => card.id === 'cynddelw-llythfor');
  const mother = cards.find(card => card.id === 'esyllt-penrudd');
  const child = cards.find(card => card.id === 'eirlys-llythfor');
  assert.ok(father && mother && child, JSON.stringify(cards));
  const centeringError = Math.abs(child.x - (father.x + mother.x) / 2);
  assert.ok(centeringError < 2, `Eirlys must be centered beneath her parents: ${centeringError}px`);
  assert.ok(child.y > father.y && child.y > mother.y);
  assert.ok(!cards.some(card => card.id === 'linked-esyllt-penrudd-llythfor'));
  assert.equal(cards.length, 13);
  const grandfather = cards.find(card => card.id === 'gwyddno-llythfor');
  const grandmother = cards.find(card => card.id === 'gwenddydd-spouse-llythfor');
  const uncle = cards.find(card => card.id === 'edern-llythfor');
  const aunt = cards.find(card => card.id === 'efrddyl-spouse-llythfor');
  const nephew = cards.find(card => card.id === 'gwrhyr-llythfor');
  const sister = cards.find(card => card.id === 'lliwen-llythfor');
  assert.ok(grandfather && grandmother && uncle && aunt && nephew && sister);
  assert.ok(grandfather.y < father.y && grandmother.y < father.y);
  assert.ok(Math.abs(uncle.y - father.y) < 2 && Math.abs(sister.y - father.y) < 2);
  const nephewCenteringError = Math.abs(nephew.x - (uncle.x + aunt.x) / 2);
  assert.ok(nephewCenteringError < 2);
  assert.ok(nephew.y > uncle.y);
  assert.ok(Math.abs(nephew.y - child.y) < 2);
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  await page.screenshot({ path: fileURLToPath(new URL('llythfor-family.png', import.meta.url)) });
  await writeFile(new URL('browser-review.json', import.meta.url), JSON.stringify({ audit, cards, centeringError, nephewCenteringError, errors, missing }, null, 2) + '\n');
  console.log(JSON.stringify({ family: 'haus-llythfor', cards: cards.length, centeringError, nephewCenteringError, errors, missing }));
} finally {
  await browser.close();
  await server.close();
}
