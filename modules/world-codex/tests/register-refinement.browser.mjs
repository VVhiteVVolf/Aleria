// Run with a local static server (default :5500), as with the territory tests.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.DIRECTORY_TEST_ORIGIN || 'http://127.0.0.1:5500';
const screenshots = process.env.DIRECTORY_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const county = '/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/';

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const examples = [
    ['estryll', '/Kontinente/Estryll/Estryll.html'],
    ['cenyr', '/Kontinente/Estryll/Königreich Cenyr/Königreich von Cenyr.html'],
    ['celtigerns-wacht', county + 'Grafschaft Celtigerns Wacht.html'],
    ['gwendolyns-ufer', county + 'Baronie Gwendolyns Ufer/Baronie Gwendolyns Ufer.html'],
    ['rhonwens-traenen', county + 'Herrschaft Rhonwens Tränen/Herrschaft Rhonwens Tränen.html'],
    ['gwynthor', '/Orte/grossstadt.html?ort=gwynthor'],
    ['lysfaen', '/Orte/grossstadt.html?ort=lysfaen'],
    ['rhyddid', '/Familien Häuser und Clans/kleinehaeuser.html?haus=haus-rhyddid'],
    ['wyrm', '/Familien Häuser und Clans/haus.html?haus=haus-wyrm'],
  ];
  for (const [id, url] of examples) {
    await page.goto(origin + url, { waitUntil: 'networkidle' });
    const expected = await page.evaluate(() => window.ORT_DATA?.houses?.flatMap(group => group.items.filter(Boolean)).map(house => ({
      name: house.name, href: house.href || (house.familyId ? `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(house.familyId)}&mode=view` : ''),
      seat: house.seat || '', liege: house.liege || '',
    })));
    if (expected) {
      const actual = await page.locator('[data-orte-houses] .kingdom-family-card').evaluateAll(cards => cards.map(card => ({
        name: card.querySelector('.kingdom-family-name').textContent,
        href: card.querySelector('.kingdom-family-name a')?.getAttribute('href') || '',
        seat: card.querySelector('.kingdom-family-meta-seat dd')?.textContent || '',
        liege: card.querySelector('.kingdom-family-meta-liege dd')?.textContent || '',
      })));
      assert.deepEqual(actual, expected, `${id}: every house and its recorded links/relationships retained`);
      assert.equal(await page.locator('.orte-house-table').count(), 0, 'No second city-specific renderer');
    }
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${id}/${width}: page fits`);
      assert.deepEqual(await page.locator('.territory-directory [data-directory-entry], .directory-toolbar, .realm-card').evaluateAll(nodes => nodes.filter(node => {
        if (!node.checkVisibility()) return false;
        const rect = node.getBoundingClientRect();
        return rect.left < 0 || rect.right > innerWidth + 1 || node.scrollWidth > node.clientWidth + 1;
      }).map(node => node.textContent.slice(0, 100))), [], `${id}/${width}: register fits`);
      if (id === 'rhyddid' || id === 'wyrm') {
        const chapters = await page.locator('main h2[id]').evaluateAll(headings => headings.filter(heading => /^[3456]\./.test(heading.textContent)).map(heading => {
          const clippedBy = [];
          for (let node = heading.parentElement; node && node !== document.body; node = node.parentElement) {
            if (['auto', 'scroll', 'hidden'].includes(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 1) clippedBy.push(node.className);
          }
          return { number: Number(heading.textContent.match(/^\d+/)[0]), top: heading.getBoundingClientRect().top, clippedBy };
        }));
        assert.deepEqual(chapters.map(chapter => chapter.number), [3, 4, 5, 6], 'Chapters 4 and 5 are present in reading order');
        chapters.filter(chapter => chapter.number >= 4).forEach((chapter, index, visible) => {
          assert.deepEqual(chapter.clippedBy, [], `${id}/${width}: chapter ${chapter.number} in normal page flow`);
          if (index) assert.ok(chapter.top > visible[index - 1].top, 'Chapter positions follow their numbering');
        });
      }
      if (screenshots && [1440, 390].includes(width)) {
        await page.screenshot({ path: path.join(screenshots, `${id}-${width}.png`) });
      }
    }
    console.log(`OK ${id}: recorded house data, 1440/1024/768/390, ordered chapters`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin + examples[2][1], { waitUntil: 'networkidle' });
  const houses = page.locator('.kingdom-family-card-view');
  const places = page.locator('.kingdom-county-card-view');
  const totalHouses = await houses.locator('[data-directory-entry]').count();
  const totalPlaces = await places.locator('[data-directory-entry]').count();
  assert.equal(await houses.locator('.directory-toolbar').count(), 1);
  const search = houses.locator('[data-directory-query]');
  await search.fill('rHyDdId');
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), 1);
  assert.match(await houses.locator('[data-directory-entry]:visible').innerText(), /Rhyddid/);
  assert.equal(await places.locator('[data-directory-entry]:visible').count(), totalPlaces, 'Registers filter independently');
  await search.fill('kein-haus-dieses-namens');
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), 0);
  assert.ok(await houses.locator('.directory-empty').isVisible());
  await houses.getByRole('button', { name: 'Zurücksetzen' }).click();
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), totalHouses);
  const select = houses.locator('[data-directory-group]');
  await select.selectOption('1');
  assert.equal(await houses.locator('[data-directory-section]:visible').count(), 1);
  await search.fill('Gwynthor');
  const filtered = await houses.locator('[data-directory-entry]:visible').count();
  const beforeRefresh = await houses.elementHandle();
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('aleria:kontinente:content-ready')));
  await page.waitForFunction(previous => document.querySelector('.kingdom-family-card-view') !== previous, beforeRefresh);
  assert.equal(await search.inputValue(), 'Gwynthor');
  assert.equal(await houses.locator('.directory-toolbar').count(), 1, 'Async refresh does not duplicate controls');
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), filtered, 'Async refresh preserves filters');
  await page.emulateMedia({ media: 'print' });
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), totalHouses, 'Print includes filtered-out records');
  assert.ok(!await houses.locator('.directory-toolbar').isVisible());
  await page.emulateMedia({ media: 'screen' });
  await houses.getByRole('button', { name: 'Zurücksetzen' }).click();
  const link = houses.locator('.kingdom-family-name-link').first();
  await link.focus();
  assert.ok(await link.evaluate(node => document.activeElement === node));
  await places.locator('[data-directory-query]').fill('Ruine');
  assert.ok(await places.locator('[data-directory-entry]:visible').count() < totalPlaces, 'Place kinds are searchable');
  assert.equal(await houses.locator('[data-directory-entry]:visible').count(), totalHouses);

  await page.goto(origin + '/Orte/grossstadt.html?ort=lysfaen', { waitUntil: 'networkidle' });
  const city = page.locator('[data-orte-houses]');
  await city.locator('[data-directory-query]').fill('rhyddid');
  await page.evaluate(() => document.dispatchEvent(new CustomEvent('aleria:orte:data-ready', { detail: { data: window.ORT_DATA } })));
  assert.equal(await city.locator('[data-directory-entry]:visible').count(), 1, 'City refresh preserves filters');
  assert.equal(await city.locator('.directory-toolbar').count(), 1);
  assert.deepEqual(errors, [], 'No browser errors');
  console.log('OK independent search, groups, reset, empty state, async updates, print and keyboard');
} finally {
  await browser.close();
}
