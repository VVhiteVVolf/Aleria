import assert from 'node:assert/strict';
import { openVenueBrowserPreview } from '../../AleriaAlmanach/tests/support/venue-browser-preview.mjs';

const preview = await openVenueBrowserPreview('notice-module-links', { entryId: 'lothaires-arkaneum' });
const { page } = preview;
try {
  assert.equal(await page.evaluate(() => currentEntry?.id), 'lothaires-arkaneum', 'direct URL opens the actual entry');
  await page.goto(`${preview.origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`);
  await page.locator('.tafel-notice-marker').first().waitFor();
  const before = await page.evaluate(() => JSON.stringify(window.TafelState.snapshot()));
  const ids = await page.evaluate(() => window.TafelState.get().zettel.map(notice => notice.id));
  let total = 0;
  for (const id of ids) {
    await page.evaluate(id => window.openZettelScroll(id), id);
    const links = page.locator('#scroll-content a.notice-module-link');
    total += await links.count();
    assert.equal(await page.locator('#scroll-content a a').count(), 0, 'never nest links');
    for (const link of await links.all()) {
      assert.match(await link.getAttribute('href'), /^\/AleriaAlmanach\/AleriaAlmanach.html\?entry=[a-z0-9-]+$/);
      assert.equal(await link.getAttribute('target'), '_blank');
      assert.equal(await link.getAttribute('rel'), 'noopener');
    }
    await page.keyboard.press('Escape');
  }
  assert.ok(total >= 15, `links in narrative and fact tables: ${total}`);
  assert.equal(await page.evaluate(() => JSON.stringify(window.TafelState.snapshot())), before, 'link projection never rewrites notices');
  const safe = await page.evaluate(() => {
    const rich = window.TafelZettelRichText;
    const attack = '<p><a href="javascript:alert(1)" onclick="alert(2)">Unsafe</a><a href="https://outside.test">External</a><script>alert(3)</script></p>';
    const authored = '<p><a href="/AleriaAlmanach/AleriaAlmanach.html?entry=lothaires-arkaneum">Arkaneum</a></p>';
    return { attack: rich.renderHtml(attack), authored: rich.renderHtml(authored), editor: rich.editorHtml(authored) };
  });
  assert.doesNotMatch(safe.attack, /href=|onclick|<script/);
  assert.equal((safe.authored.match(/<a /g) || []).length, 1);
  assert.match(safe.editor, /href="\/AleriaAlmanach/);
  await page.evaluate(() => window.openZettelScroll('gwynthor-herluin-angestellte-vermisst'));
  const link = page.locator('#scroll-content a.notice-module-link[href$="entry=lothaires-arkaneum"]').first();
  const popupPromise = page.context().waitForEvent('page');
  await link.click();
  const popup = await popupPromise;
  await popup.waitForFunction(() => typeof currentEntry !== 'undefined' && currentEntry?.id === 'lothaires-arkaneum');
  await popup.close();
  assert.equal(await page.locator('#scroll-card').getAttribute('aria-label'), 'Angestellte Vermisst!');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#scroll-content a.notice-module-link').first().scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
  await preview.capture('links-mobile');
  assert.deepEqual(preview.errors, []);
  console.log(`PASS: ${total} narrative/fact module links, no changed notices or nested links, safe sanitization, actual popup opens correct module, responsive view.`);
} finally { await preview.close(); }
