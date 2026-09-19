import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.ORTE_TEST_ORIGIN || 'http://127.0.0.1:5500';
const output = process.env.PREVIEW_OUTPUT;
if (output) await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], ...(process.env.PLAYWRIGHT_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE } : {}) });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  for (const id of ['lysfaen', 'craithglyn', 'gwynthor', 'abergwint', 'rhosmere', 'castellbryn']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/Orte/grossstadt.html?ort=${id}`, { waitUntil: 'networkidle' });
    await page.locator('main img').evaluateAll(async images => {
      images.forEach(image => { image.loading = 'eager'; });
      await Promise.all(images.map(image => image.decode().catch(() => {})));
    });
    const content = await page.evaluate(() => {
      const normalize = text => text.replace(/\s+/g, ' ').trim();
      const flatten = blocks => blocks.map(block => {
        if (typeof block === 'string') return block;
        if (block.type === 'scene') return [block.text || block.title, ...block.paragraphs].join(' ');
        if (block.type === 'list') return block.items.join(' ');
        return block.text || '';
      }).join(' ');
      return [...document.querySelectorAll('[data-orte-content]')].flatMap(element => {
        const blocks = window.ORT_DATA.sections?.[element.dataset.orteContent];
        if (!Array.isArray(blocks) || !blocks.length) return [];
        const copy = element.cloneNode(true);
        // Block boundaries are whitespace even when dynamically constructed without text nodes.
        copy.querySelectorAll('p, li, h3, summary').forEach(node => node.after(' '));
        return [{ section: element.dataset.orteContent, actual: normalize(copy.textContent), expected: normalize(flatten(blocks)) }];
      });
    });
    for (const section of content) assert.equal(section.actual, section.expected, `${id}: complete ${section.section}`);
    const hasDistricts = ['gwynthor', 'abergwint', 'rhosmere', 'castellbryn'].includes(id);
    assert.equal(await page.locator('[data-orte-feature="districts"]').isVisible(), hasDistricts, `${id}: districts`);
    if (!hasDistricts) {
      assert.equal(await page.locator('.codex-chapter-list a').filter({ hasText: /^Bezirke$/ }).count(), 0);
    }
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        panels: [...document.querySelectorAll('.orte-paired-copy')].filter(cell => cell.checkVisibility()).map(cell => ({
          cell: cell.clientHeight, companion: cell.nextElementSibling.clientHeight,
          panel: cell.firstElementChild.clientHeight,
          scroll: cell.querySelector('.orte-paired-scroll').clientHeight,
          scrollContent: cell.querySelector('.orte-paired-scroll').scrollHeight,
        })),
        ratings: [...document.querySelectorAll('.merchant-rating')].map(rating => ({
          width: rating.getBoundingClientRect().width,
          cell: rating.closest('td').clientWidth,
          tops: [...rating.querySelectorAll('svg')].map(icon => icon.getBoundingClientRect().top),
        })),
      }));
      assert.equal(geometry.overflow, false, `${id} ${width}: page fits`);
      if (width > 800) {
        for (const panel of geometry.panels) {
          assert.ok(panel.cell <= Math.max(300, panel.companion) + 2, `${id} ${width}: balanced row ${JSON.stringify(panel)}`);
          assert.ok(panel.panel <= panel.cell + 1, `${id} ${width}: panel fits cell`);
        }
      }
      for (const rating of geometry.ratings) {
        assert.ok(rating.width <= rating.cell - 12, `${id} ${width}: rating fits`);
        assert.ok(new Set(rating.tops).size <= 1, `${id} ${width}: symbols do not wrap`);
      }
      if (id === 'lysfaen' && width > 800) {
        assert.ok(geometry.panels[1].scrollContent > geometry.panels[1].scroll, 'Long background scrolls');
      }
    }
    if (id === 'lysfaen') {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const scene = page.locator('.orte-flavor-scene');
      assert.equal(await scene.getAttribute('open'), null);
      const intro = page.locator('.orte-introduction-panel');
      const before = await intro.boundingBox();
      await scene.locator('summary').click();
      assert.notEqual(await scene.getAttribute('open'), null);
      assert.equal((await intro.boundingBox()).height, before.height, 'Opening the scene does not expand the row');
      assert.ok(await scene.locator('.orte-flavor-scene__speaker').count() > 10);
      assert.ok(await scene.locator('.orte-flavor-scene__action').count() > 5);
      await page.locator('[data-orte-content="introduction"]').focus();
      await page.keyboard.press('End');
      await page.waitForFunction(() => {
        const node = document.querySelector('[data-orte-content="introduction"]');
        return node.scrollTop >= node.scrollHeight - node.clientHeight - 2;
      });
      if (output) await page.screenshot({ path: path.join(output, 'llysfaen-flavor.png') });
      await scene.locator('summary').click();
      await page.locator('[data-orte-content="introduction"]').evaluate(node => { node.scrollTop = 0; });
      const colors = await page.locator('.orte-personality-start .portrait-cell').evaluateAll(cells => cells.slice(0, 3).map(cell => getComputedStyle(cell).backgroundColor));
      assert.equal(new Set(colors).size, 3, 'Three distinct character backgrounds');
      assert.equal(await page.locator('[data-orte-personalities] .sub-header th').first().evaluate(node => getComputedStyle(node).fontSize), '21px');
      if (output) {
        for (const [name, selector] of [['einleitung', '.orte-introduction-panel'], ['hintergrund', '.orte-balanced-text-panel--background'], ['haendler', '[data-orte-merchants]'], ['personen', '[data-orte-personalities]']]) {
          await page.locator(selector).evaluate(node => node.scrollIntoView({ block: 'start' }));
          await page.evaluate(() => window.scrollBy(0, -90));
          await page.screenshot({ path: path.join(output, `llysfaen-${name}.png`) });
        }
      }
    }
    console.log(`OK ${id}: complete prose, district visibility, balanced panels and ratings at 1440/1024/768/390`);
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); }
