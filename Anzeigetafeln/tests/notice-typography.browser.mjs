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
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
const url = `${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`;
const fonts = ['patrickhand', 'kalam', 'caveat', 'dancingscript', 'labelleaurore', 'bethellen', 'monsieurladoulaise'];
const id = 'font-probe';
const plain = 'Schöne Grüße aus Gwynthor! Die flinke Füchsin läuft über den großen Markt. Bitte bringt fünf Krüge mit.';
const ready = async () => {
  await page.waitForFunction(() => document.querySelector('#scroll-content [data-lettering-state]')?.dataset.letteringState === 'ready');
  assert.equal(await page.locator('#scroll-content [data-action="notice-font-readable"]').isEnabled(), true, 'font loaded without fallback');
};
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.locator('.tafel-notice-marker').first().waitFor();
  await page.evaluate(({ id, plain }) => {
    const notice = window.TafelZettelConfig.createDraft('hilfsgesuch', { x: .25, y: .2 }, () => id);
    notice.title = 'Eine Nachricht vom Hafen';
    notice.text = `<p><strong>${plain}</strong></p>` + `<p>${plain}</p>`.repeat(8);
    notice.table = [{ k: 'Kontakt', v: 'Die Schreiberin am Hafen' }, { k: 'Frist', v: 'Dringend, offen' }];
    window.TafelState.apply({ zettel: [notice] });
  }, { id, plain });

  async function inspect(style, label) {
    const saved = await page.evaluate(({ id, style }) => {
      const note = window.TafelState.get().zettel.find(item => item.id === id);
      note.typography = style;
      const before = JSON.stringify(note);
      window.openZettelScroll(id);
      return before;
    }, { id, style });
    await ready();
    const original = await page.locator('#scroll-content .notice-scroll-copy').innerText();
    const family = await page.locator('#scroll-content .notice-scroll-copy').evaluate(element => getComputedStyle(element).fontFamily);
    assert.notEqual(family, '"EB Garamond", Georgia, serif');
    assert.equal(await page.evaluate(fontFamily => document.fonts.check(`24px ${fontFamily.split(',')[0]}`), family), true);
    const button = page.locator('#scroll-content [data-action="notice-font-readable"]');
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.match(await page.locator('#scroll-content .notice-scroll-copy').innerText(), /Schöne Grüße aus Gwynthor!/);
    assert.match(await page.locator('#scroll-content .notice-scroll-copy').evaluate(element => getComputedStyle(element).fontFamily), /EB Garamond/);
    await button.focus();
    await page.keyboard.press('Enter');
    assert.equal(await button.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('#scroll-content .notice-scroll-copy').innerText(), original);
    assert.equal(await page.evaluate(noticeId => JSON.stringify(window.TafelState.get().zettel.find(item => item.id === noticeId)), id), saved, 'display and translation preserve saved content');
    assert.ok(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1));
    if (['caveat', 'monsieurladoulaise', 'kanaanith', 'laerelis', 'rheunwaith'].includes(label)) await shot(label);
    results.push({ label, family });
    await page.keyboard.press('Escape');
  }

  for (const font of fonts) await inspect({ font, heading: 'inherit', script: 'common' }, font);
  const languages = await page.evaluate(() => Object.keys(window.AleriaLanguageScripts.entries));
  for (const script of languages) await inspect({ font: 'kalam', heading: 'template', script }, script);
  const types = await page.evaluate(() => window.ZETTEL_TYPES.map(type => type.id));
  for (const type of types) {
    await page.evaluate(({ id, type }) => {
      const note = window.TafelState.get().zettel.find(item => item.id === id);
      note.typ = type;
      note.typography = { font: 'caveat', heading: 'inherit', script: 'common' };
      note.artikel = [{ titel: 'Nachricht vom Hafen', text: note.text }];
      note.personen = type === 'steckbrief' ? [{ title: 'Eine gesuchte Person', text: note.text, table: note.table }] : [];
      window.openZettelScroll(id);
    }, { id, type });
    await ready();
    assert.match(await page.locator('#scroll-content .notice-scroll-copy').first().evaluate(element => getComputedStyle(element).fontFamily), /Caveat/, type);
    results.push({ template: type, font: 'caveat' });
    await page.keyboard.press('Escape');
  }
  await page.evaluate(noticeId => {
    const note = window.TafelState.get().zettel.find(item => item.id === noticeId);
    note.typ = 'hilfsgesuch';
    note.personen = [];
  }, id);
  await page.setViewportSize({ width: 390, height: 844 });
  await inspect({ font: 'monsieurladoulaise', heading: 'caveat', script: 'common' }, 'handwriting-mobile');
  await inspect({ font: 'template', heading: 'inherit', script: 'kanaanith' }, 'kanaanith-mobile');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(noticeId => {
    const note = window.TafelState.get().zettel.find(item => item.id === noticeId);
    note.typography = { font: 'caveat', heading: 'inherit', script: 'common' };
    note.noticeGroupId = noticeId;
    window.TafelState.get().zettel.push({ ...structuredClone(note), id: 'font-second-sheet', stackId: noticeId, stackOrder: 1,
      typography: { font: 'template', heading: 'inherit', script: 'rheunwaith' } });
    window.openZettelScroll(noticeId);
  }, id);
  await ready();
  await page.locator('#scroll-content [data-action="notice-font-readable"]').click();
  await page.getByRole('button', { name: 'Nächster Aushang', exact: true }).click();
  await ready();
  assert.equal(await page.locator('#scroll-content [data-action="notice-font-readable"]').getAttribute('aria-pressed'), 'false');
  assert.match(await page.locator('#scroll-content .notice-scroll-copy').evaluate(element => getComputedStyle(element).fontFamily), /Rheunwaith/);
  await page.getByRole('button', { name: 'Vorheriger Aushang', exact: true }).click();
  await ready();
  assert.match(await page.locator('#scroll-content .notice-scroll-copy').evaluate(element => getComputedStyle(element).fontFamily), /Caveat/);
  await page.keyboard.press('Escape');

  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
  await page.evaluate(noticeId => window.TafelZettelEditor.open(noticeId), id);
  await page.locator('[data-font-field="font"]').selectOption('caveat');
  await page.locator('[data-font-field="heading"]').selectOption('dancingscript');
  await page.locator('[data-font-field="script"]').selectOption('common');
  await page.locator('.notice-typography-controls').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#sb-preview-content [data-lettering-state]')?.dataset.letteringState === 'ready');
  await shot('font-editor');
  assert.match(await page.locator('#sb-preview-content .notice-heading h2').evaluate(element => getComputedStyle(element).fontFamily), /Dancing Script/);
  assert.match(await page.locator('#sb-preview-content .notice-scroll-copy').evaluate(element => getComputedStyle(element).fontFamily), /Caveat/);
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.locator('#btn-edit').click();
  await page.reload({ waitUntil: 'networkidle' });
  const savedStyle = await page.evaluate(noticeId => window.TafelState.get().zettel.find(item => item.id === noticeId).typography, id);
  assert.deepEqual(savedStyle, { font: 'caveat', heading: 'dancingscript', script: 'common' });
  await page.evaluate(noticeId => window.openZettelScroll(noticeId), id);
  await ready();

  // A failed font must leave a readable notice rather than broken glyphs.
  await context.route('**/Handwriting/bethellen/regular.ttf', route => route.abort());
  const failurePage = await context.newPage();
  await failurePage.goto(url, { waitUntil: 'networkidle' });
  await failurePage.evaluate(() => {
    const note = window.TafelZettelConfig.createDraft('notiz', { x: .2, y: .2 }, () => 'font-failure');
    note.typography = { font: 'bethellen', script: 'common' };
    note.text = '<p>Dieser Text bleibt lesbar.</p>';
    window.TafelState.apply({ zettel: [note] });
    window.openZettelScroll(note.id);
  });
  await failurePage.locator('#scroll-content [data-action="notice-font-readable"]:disabled').waitFor();
  assert.match(await failurePage.locator('#scroll-content .notice-copy').innerText(), /bleibt lesbar/);
  await failurePage.close();
  assert.deepEqual(errors, []);
  if (shots) await writeFile(`${shots}/report.json`, JSON.stringify({ pass: true, results, errors, editorSaveReload: true, missingFontFallback: true }, null, 2));
  console.log('PASS: seven handwriting fonts, twelve shared language scripts, reversible readable view, separate title/body settings, mobile layout, saved editor selection and missing-font fallback.');
} catch (error) {
  console.error('Typography diagnostics:', errors);
  await shot('failure');
  throw error;
} finally {
  await context.close();
  await browser.close();
}
