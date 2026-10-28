import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.NOTICE_TEST_ORIGIN || 'http://127.0.0.1:4197';
const shots = process.env.NOTICE_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE, ignoreDefaultArgs: ['--hide-scrollbars'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', route => route.request().url().startsWith(origin + '/') && route.request().method() === 'GET' ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const herluin = 'gwynthor-herluin-angestellte-vermisst';
const torvik = 'gwynthor-torvik-seit-lyristag-vermisst';
const fearnan = 'gwynthor-fearnan-die-verschwundene-schatulle';
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
const counts = () => page.evaluate(() => ({
  sheets: window.TafelState.get().zettel.length,
  nails: window.TafelNoticeStacks.groups(window.TafelState.get().zettel).length,
  announcements: window.TafelNoticeStacks.publications(window.TafelState.get().zettel).length,
}));
const open = id => page.evaluate(id => window.openZettelScroll(id), id);
const choose = id => page.locator(`#notice-publications [data-notice-id="${id}"]`).click();
async function concealedRewardButtons() {
  const buttons = page.locator('#scroll-content .notice-reward-button');
  assert.ok(await buttons.count());
  for (const button of await buttons.all()) {
    assert.equal((await button.innerText()).trim(), '', 'reward contents and counts stay concealed');
    assert.equal(await button.getAttribute('aria-label'), 'Belohnung ansehen');
    assert.equal(await button.locator('img').count(), 1);
    assert.equal(await button.locator('img').getAttribute('src'), '/IconOrdner/Geldbeutel.PNG');
    await button.locator('img').evaluate(image => image.decode());
  }
}

try {
  await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`, { waitUntil: 'networkidle' });
  const nail = page.locator(`.tafel-notice-marker[data-notice-id="${herluin}"]`);
  await nail.waitFor();
  assert.deepEqual(await counts(), { sheets: 18, nails: 4, announcements: 5 });
  assert.equal(await page.locator('.notice-register-entry').count(), 5);
  assert.equal(await page.locator('.tafel-notice-stack-count').count(), 0);
  await nail.hover();
  await page.locator('#notice-tooltip.show').waitFor();
  assert.equal(await page.locator('.notice-tooltip-publication').count(), 2);
  assert.match(await page.locator('#notice-tooltip').innerText(), /Angestellte Vermisst![\s\S]*Seit Lyristag vermisst/);
  await shot('one-nail-two-announcements');
  await nail.click();
  await page.mouse.move(5, 5);
  assert.equal(await page.locator('.quest-footer .notice-money img').getAttribute('alt'), 'Silbertaler');
  assert.equal(await page.locator('.quest-footer .notice-reward-button').count(), 0);
  assert.equal(await page.locator('#notice-publications button').count(), 2);
  assert.equal(await page.locator('#notice-stack-nav option').count(), 4);
  assert.match(await page.locator('#scroll-content').innerText(), /Ruine betritt/);
  for (const name of ['cyrwyn', 'torvald', 'rioneth']) {
    await page.locator('#notice-stack-nav select').selectOption(`${herluin}-${name}`);
    const image = page.locator('.notice-subject-portrait img');
    await image.evaluate(image => image.decode());
    assert.match(await image.getAttribute('src'), /missing-sketches/);
  }
  await shot('rioneth-parchment-sketch');
  await choose(torvik);
  await concealedRewardButtons();
  assert.equal(await page.locator('#notice-stack-nav option').count(), 2);
  assert.doesNotMatch(await page.locator('#notice-stack-nav').innerText(), /Cyrwyn|Rioneth/);
  await page.locator('#scroll-content .notice-reward-button').first().click();
  await page.locator('.notice-reward-item-image img').evaluate(image => image.decode());
  assert.match(await page.locator('.notice-reward-loot').innerText(), /Maonaids Familienamulett/);
  assert.match(await page.locator('.notice-reward-condition').innerText(), /Nur falls/);
  assert.equal(await page.locator('.notice-reward-loot .notice-money img').getAttribute('alt'), 'Kupfertaler');
  await shot('maonaid-heirloom-reward');
  await page.keyboard.press('Escape');
  await page.locator('#notice-stack-nav select').selectOption(`${torvik}-haldor`);
  await page.locator('.notice-subject-portrait img').evaluate(image => image.decode());
  await shot('haldor-missing-sheet');
  await page.keyboard.press('Escape');

  // Search an attachment but show just its parent announcement in the register.
  await page.locator('#search-inp').fill('Rioneth');
  assert.equal(await page.locator('.notice-register-entry').count(), 1);
  assert.match(await page.locator('.notice-register-entry strong').innerText(), /Angestellte Vermisst/);
  await page.locator('.notice-register-entry').click();
  await page.getByRole('dialog', { name: 'Vermisst: Rioneth', exact: true }).waitFor();
  assert.match(await page.locator('#scroll-card').getAttribute('aria-label'), /Rioneth/);
  await page.keyboard.press('Escape');
  await page.locator('[data-action="clear-search"]').click();

  // Author grouping, splitting and moving entire announcements on the real board.
  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
  await page.evaluate(id => window.TafelZettelEditor.open(id), herluin);
  await page.locator('[data-role="notice-stack-new-type"]').selectOption('notiz');
  await page.locator('[data-action="notice-stack-new"]').click();
  const supplement = await page.locator('#sidebar').getAttribute('data-editor-id');
  assert.equal(await page.evaluate(id => window.TafelNoticeStacks.publication(window.TafelState.get().zettel, id).notices.length, herluin), 5);
  assert.equal((await counts()).announcements, 5);
  await page.locator('[data-action="notice-group-separate"]').click();
  assert.equal((await counts()).announcements, 6);
  await page.locator('[data-role="notice-group-target"]').selectOption(torvik);
  await page.locator('[data-action="notice-group-combine"]').click();
  assert.equal((await counts()).announcements, 5);
  assert.equal(await page.evaluate(id => window.TafelNoticeStacks.publication(window.TafelState.get().zettel, id).notices.length, torvik), 3);
  await page.locator('[data-action="notice-publication-detach"]').click();
  assert.equal((await counts()).nails, 5);
  await page.locator('[data-role="notice-stack-target"]').selectOption(herluin);
  await page.locator('[data-action="notice-stack-attach"]').click();
  assert.equal((await counts()).nails, 4);
  assert.equal(await page.evaluate(id => window.TafelNoticeStacks.publication(window.TafelState.get().zettel, id).notices.length, torvik), 3);
  await page.evaluate(id => window.TafelZettelEditor.open(id), herluin);
  await page.locator('[data-role="notice-stack-new-group"]').selectOption('independent');
  await page.locator('[data-role="notice-stack-new-type"]').selectOption('hilfsgesuch');
  await page.locator('[data-action="notice-stack-new"]').click();
  await page.locator('#sb-body [data-field="title"]').fill('Eigenes weiteres Gesuch');
  assert.equal((await counts()).announcements, 6);
  await shot('editor-announcements-and-supplements');
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.locator('#btn-edit').click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.deepEqual(await counts(), { sheets: 20, nails: 4, announcements: 6 });
  assert.equal(await page.locator('.notice-register-entry').count(), 6);
  assert.equal(await page.locator('.tafel-notice-stack-count').count(), 0);
  assert.equal(await page.evaluate(id => window.TafelState.get().zettel.find(item => item.id === id).noticeGroupId, supplement), torvik);

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await open(torvik);
    await page.waitForFunction(() => document.querySelector('#scroll-content [data-lettering-state]')?.dataset.letteringState === 'ready');
    assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    assert.ok(await page.locator('#notice-publications').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await concealedRewardButtons();
    await page.locator('#scroll-content .notice-reward-button').first().click();
    assert.ok(await page.locator('.notice-reward-dialog').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    await page.keyboard.press('Escape');
    await shot(`torvik-${width}`);
    await page.keyboard.press('Escape');
    await open(fearnan);
    await page.waitForFunction(() => document.querySelector('#scroll-content [data-lettering-state]')?.dataset.letteringState === 'ready');
    assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    assert.match(await page.locator('#scroll-content').innerText(), /Metallschatulle/);
    await shot(`fearnan-${width}`);
    await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors, []);
  if (shots) await writeFile(`${shots}/report.json`, JSON.stringify({ pass: true, errors, quests: 3, groupedHerluinSheets: 4, missingSketches: 4, generatedHeirloom: true,
    tested: ['one nail with separate announcements', 'grouped register and search', 'hover previews', 'supplements and independent notices', 'combine and separate', 'whole-announcement attach/detach', 'save and reload', 'conditional reward', 'desktop/tablet/mobile'] }, null, 2));
  console.log('PASS: household quests, grouped announcements on one nail, separate previews and search, four parchment sketches, conditional amulet reward, author grouping and moving, save/reload and responsive views.');
} catch (error) {
  await shot('failure');
  console.error('Publication browser diagnostics:', errors, await counts(), await page.evaluate(() => ({
    reader: document.querySelector('#scroll-card')?.getAttribute('aria-label'),
    open: document.querySelector('#scroll-mo')?.className,
    results: [...document.querySelectorAll('.notice-register-entry')].map(item => ({ id: item.dataset.noticeId, text: item.innerText })),
  })));
  throw error;
} finally { await context.close(); await browser.close(); }
