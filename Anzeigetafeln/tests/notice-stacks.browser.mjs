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
const results = [];
page.on('pageerror', error => errors.push(error.message));
const id = 'gwynthor-herluin-angestellte-vermisst';
const url = `${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`;
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
const settle = async () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function bounded(label) {
  await settle();
  const data = await page.locator('#scroll-content [data-notice-scroll]').evaluateAll(elements => elements.map(element => ({ height: element.clientHeight, full: element.scrollHeight, limit: parseFloat(getComputedStyle(element).maxHeight), width: element.clientWidth, fullWidth: element.scrollWidth })));
  assert.ok(data.length, `${label}: scroll region exists`);
  assert.ok(data.every(item => item.height <= item.limit + 1 && item.fullWidth <= item.width + 1), `${label}: bounded text ${JSON.stringify(data)}`);
  assert.ok(data.some(item => item.full > item.height + 10), `${label}: long copy scrolls`);
  assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${label}: reader horizontal overflow`);
  results.push({ label, regions: data });
}

try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(noticeId => window.TafelState.apply({ ...window.TafelState.snapshot(),
    zettel: window.TafelState.get().zettel.filter(note => note.id.startsWith(noticeId)) }), id);
  await page.locator(`.tafel-notice-marker[data-notice-id="${id}"]`).waitFor();
  assert.equal(await page.locator('.tafel-notice-marker').count(), 1);
  assert.equal(await page.locator('.tafel-notice-stack-count').count(), 0);
  assert.equal(await page.locator('.tafel-notice-marker').getAttribute('data-stack-size'), '4');
  await page.locator(`.tafel-notice-marker[data-notice-id="${id}"]`).click();
  await page.mouse.move(5, 5);
  await page.waitForTimeout(150);
  await bounded('Herluin desktop');
  const columns = await page.evaluate(() => ({ reference: document.querySelector('.quest-docket').getBoundingClientRect().height, copy: document.querySelector('.quest-copy').getBoundingClientRect().height }));
  assert.ok(columns.copy <= columns.reference + 66, 'the full text column, including signature, stays close to the information height');
  assert.equal(await page.locator('.quest-footer .notice-money img').getAttribute('alt'), 'Silbertaler');
  assert.equal(await page.locator('.quest-footer .notice-reward-button').count(), 0);
  assert.equal(await page.locator('#notice-stack-nav option').count(), 4);
  await shot('herluin-compact-desktop');
  const region = page.locator('#scroll-content [data-notice-scroll]').first();
  await region.hover();
  await page.mouse.wheel(0, 450);
  await page.waitForTimeout(100);
  assert.ok(await region.evaluate(element => element.scrollTop > 0), 'wheel scrolls text field');
  for (const name of ['Cyrwyn', 'Torvald', 'Rioneth']) {
    await page.getByRole('button', { name: 'Nächster Aushang', exact: true }).click();
    await page.locator('.notice-subject-portrait img').evaluate(image => image.decode());
    assert.match(await page.locator('#scroll-card').getAttribute('aria-label'), new RegExp(name));
    assert.equal(await page.locator('.notice-document--vermisst').count(), 1);
  }
  await shot('rioneth-sheet');
  await page.locator('.notice-reply summary').click();
  await page.locator('[data-zettel-comment-name]').fill('Eine Reisende');
  await page.locator('[data-zettel-comment-text]').fill('Rioneths eigenständige Spur.');
  await page.locator('[data-action="zettel-comment-add"]').click();
  await page.locator('#notice-stack-nav select').selectOption(id);
  assert.doesNotMatch(await page.locator('.zettel-comments-list').innerText(), /eigenständige Spur/);
  await page.locator('#notice-stack-nav select').selectOption(`${id}-rioneth`);
  assert.match(await page.locator('.zettel-comments-list').innerText(), /eigenständige Spur/);
  await page.keyboard.press('Escape');
  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
  await page.locator(`.tafel-notice-marker[data-notice-id="${id}"]`).click();
  await page.locator('[data-role="notice-stack-new-type"]').selectOption('hilfsgesuch');
  await page.locator('[data-role="notice-stack-new-group"]').selectOption('independent');
  await page.locator('[data-action="notice-stack-new"]').click();
  const newId = await page.locator('#sidebar').getAttribute('data-editor-id');
  await page.locator('#sb-body [data-field="title"]').fill('Unabhängiger kleiner Auftrag');
  await page.locator('[data-action="notice-reward-money"]').click();
  await page.locator('[data-action="notice-reward-item"]').click();
  await page.locator('[data-reward-search]').fill('Mörser & Stößel');
  await page.locator('[data-reward-action="choose"]').first().click();
  await page.locator('.notice-reward-editor [data-field="quantity"]').fill('2');
  await page.locator('#sb-preview-content .notice-reward-button').click();
  await page.locator('.notice-reward-dialog[open] .notice-reward-loot').waitFor({ timeout: 5000 });
  assert.equal(await page.locator('.notice-reward-loot > li').count(), 2);
  await page.locator('.notice-reward-item-image img').evaluate(image => image.decode());
  assert.match(await page.locator('.notice-reward-loot').innerText(), /2×.*[Mm]örser/);
  await shot('reward-lootbox');
  await page.keyboard.press('Escape');
  await page.locator('[data-action="notice-stack-move"][data-direction="-1"]').click();
  assert.equal(await page.evaluate(noticeId => window.TafelNoticeStacks.members(window.TafelState.get().zettel, noticeId, { includeSecret: true }).findIndex(note => note.id === noticeId), newId), 3);
  await page.locator('[data-action="notice-stack-detach"]').click();
  assert.equal(await page.locator('.tafel-notice-marker').count(), 2);
  await page.locator('[data-role="notice-stack-target"]').selectOption(id);
  await page.locator('[data-action="notice-stack-attach"]').click();
  assert.equal(await page.locator('.tafel-notice-marker').count(), 1);
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.locator('#btn-edit').click();
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.tafel-notice-marker').getAttribute('data-stack-size'), '5');
  await page.evaluate(noticeId => window.openZettelScroll(noticeId), newId);
  assert.match(await page.locator('#scroll-card').getAttribute('aria-label'), /Unabhängiger kleiner Auftrag/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#scroll-content .notice-reward-button').click();
  assert.equal(await page.locator('.notice-reward-loot > li').count(), 2);
  assert.ok(await page.locator('.notice-reward-dialog').evaluate(element => element.scrollWidth <= element.clientWidth + 1), 'mobile rewards fit the dialog');
  await shot('reward-lootbox-mobile');
  await page.keyboard.press('Escape');
  await page.locator(`[data-action="notice-publication-select"][data-notice-id="${id}"]`).click();
  await page.locator('#notice-stack-nav select').selectOption(`${id}-rioneth`);
  assert.match(await page.locator('.zettel-comments-list').innerText(), /eigenständige Spur/);
  await page.keyboard.press('Escape');

  await page.evaluate(() => {
    const paragraph = '<p>Eine ausführliche Beschreibung des Aushangs mit genauen Bedingungen, Wegbeschreibungen und Hinweisen. Der vollständige Wortlaut bleibt auch bei sehr vielen Absätzen gut erreichbar.</p>';
    const notices = window.ZETTEL_TYPES.map(type => {
      const notice = window.TafelZettelConfig.createDraft(type.id, { x: .2, y: .2 }, () => `long-${type.id}`);
      notice.title = `Beispiel · ${type.label}`;
      notice.text = paragraph.repeat(30);
      notice.table = [{ k: 'Kontakt', v: 'Schreibstube am Markttor' }, { k: 'Ort', v: 'Gwynthor' }, { k: 'Frist', v: 'Offen' }, { k: 'Besonderes', v: 'Weitere Angaben werden vor Ort erteilt.' }];
      notice.artikel = [{ titel: 'Aus dem Hafenviertel', text: paragraph.repeat(30) }];
      if (type.id === 'steckbrief') notice.personen = [{ title: 'Die gesuchte Person', text: paragraph.repeat(30), table: notice.table }];
      return notice;
    });
    window.TafelState.apply({ zettel: [...window.TafelState.get().zettel, ...notices] });
  });
  const types = await page.evaluate(() => window.ZETTEL_TYPES.map(type => type.id));
  assert.equal(types.length, 16);
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const type of types) {
      await page.evaluate(noticeId => window.openZettelScroll(noticeId), `long-${type}`);
      await bounded(`${type}-${width}`);
      if (['hilfsgesuch', 'turnier', 'auktion', 'quest'].includes(type)) await shot(`${type}-${width}`);
      await page.keyboard.press('Escape');
    }
  }
  assert.deepEqual(errors, []);
  if (shots) await writeFile(`${shots}/report.json`, JSON.stringify({ pass: true, results, errors, features: ['one nail per stack', 'four canonical Herluin sheets', 'independent comments', 'create/reorder/detach/attach', 'money icons', 'goods register picker', 'mixed reward dialog', 'draft reload'] }, null, 2));
  console.log('PASS: four-sheet Herluin stack, independent comments, authoring and reload, goods rewards and loot dialog; bounded text for 16 templates at desktop/tablet/mobile sizes.');
} catch (error) {
  console.error('Browser diagnostics:', errors, await page.locator('dialog').evaluateAll(elements => elements.map(element => ({ open: element.open, text: element.innerText.slice(0, 400) }))));
  await shot('failure');
  throw error;
} finally {
  await context.close();
  await browser.close();
}
