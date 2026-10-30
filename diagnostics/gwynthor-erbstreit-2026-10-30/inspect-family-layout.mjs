import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
const server = await startChartQualityServer(fileURLToPath(new URL('../../', import.meta.url)));
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
try {
  const page = await browser.newPage({ viewport: { width: 1800, height: 1100 } });
  await page.route('**/*', route => new URL(route.request().url()).origin === server.origin ? route.continue() : route.abort());
  await page.goto(server.origin + '/Stammb%C3%A4ume/tests/chart-quality-fixture.html');
  await page.evaluate(async () => {
    const base = document.createElement('base'); base.href = '/Stammb%C3%A4ume/'; document.head.append(base);
    window.fixture = await import('/Stammb%C3%A4ume/tests/chart-quality-fixture.js');
  });
  const results = [];
  for (const id of ['haus-swyll', 'haus-twyllod']) {
    const audit = await page.evaluate(id => window.fixture.auditFamily(id), id);
    const positions = await page.evaluate(() => [...document.querySelectorAll('.card_cont')].map(el => ({
      id: el.__data__?.data?.id, x: el.__data__?.x, y: el.__data__?.y,
      text: el.textContent.slice(0, 150)
    })));
    results.push({ id, audit, positions });
    if (id === 'haus-swyll') {
      const loc = name => positions.find(p => p.id === name);
      assertCompact(loc('gwrgan-cochdon'), loc('lleucu-swyll'), loc('eifion-twyllod'));
    }
    await page.evaluate(async () => { await Promise.all([...document.images].map(img => img.decode().catch(() => {}))); });
    if (id === 'haus-swyll') await page.evaluate(() => {
      const node = [...document.querySelectorAll('.card_cont')].find(el => el.__data__?.data?.id === 'lleucu-swyll').__data__;
      document.querySelector('#f3Canvas .view').setAttribute('transform', `translate(${900 - node.x * 1.2},${450 - node.y * 1.2}) scale(1.2)`);
    });
    await page.screenshot({ path: fileURLToPath(new URL(`${id}-revised.png`, import.meta.url)) });
  }
  await writeFile(new URL('rendered-family-positions.json', import.meta.url), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results.map(r => ({ id: r.id, audit: r.audit.passed, positions: r.positions.filter(p => /lleucu|gwrgan|eifion|glendower|meirion/.test(p.id)) })), null, 2));
} finally { await browser.close(); await server.close(); }

function assertCompact(left, middle, right) {
  if (!(left.x < middle.x && middle.x < right.x && middle.x - left.x < 500 && right.x - middle.x < 500
    && left.y === middle.y && right.y === middle.y)) throw new Error('Lleucus Ehegruppe ist auseinandergerissen.');
}
