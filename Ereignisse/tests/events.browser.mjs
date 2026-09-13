import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.CALENDAR_TEST_ORIGIN || 'http://127.0.0.1:5500';
const prefix = process.env.CALENDAR_PATH_PREFIX || '';
const base = `${origin}${prefix}`;
const screenshots = process.env.EVENTS_SCREENSHOTS;
if (screenshots) await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [], missing = [], almanachMissing = [];
let checkingAlmanach = false;
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => {
  if (response.status() === 404 && response.url().startsWith(base)) (checkingAlmanach ? almanachMissing : missing).push(response.url());
});
try {
  await page.goto(`${base}/Ereignisse/index.html`);
  await page.locator('[data-role="catalog-tools"]:visible').waitFor();
  assert.equal(await page.locator('[data-event-id]').count(), 10);
  assert.equal(await page.locator('.events-chapter').count(), 6);
  // Auch nach dem dynamischen Rendern müssen alle Original-Icons lokal laden.
  for (const icon of await page.locator('.event-icon').all()) {
    await icon.scrollIntoViewIfNeeded();
    await icon.evaluate(image => image.decode());
    assert.equal(await icon.evaluate(image => image.naturalWidth > 0 && new URL(image.currentSrc).origin === location.origin), true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  assert.match(await page.locator('[data-role="calendar-status"]').innerText(), /Lokaler Kalenderstand/);
  if (screenshots) {
    await page.screenshot({ path: `${screenshots}/ereignisse-desktop.png`, fullPage: true });
    await page.screenshot({ path: `${screenshots}/ereignisse-titelseite.png` });
    await page.locator('#kapitel-kriege').screenshot({ path: `${screenshots}/ereignisse-original-icons.png` });
  }

  await page.getByRole('searchbox', { name: 'Ereignisse durchsuchen' }).fill('praetendenten');
  assert.equal(await page.locator('[data-event-id]').count(), 1);
  await page.locator('[data-role="search"]').fill('unbekanntegeschichte');
  assert.equal(await page.locator('[data-event-id]').count(), 0);
  await page.getByRole('button', { name: 'Alle Ereignisse anzeigen', exact: true }).click();
  assert.equal(await page.locator('[data-event-id]').count(), 10);
  await page.locator('[data-action="select-chapter"][data-chapter="reisen"]').click();
  assert.equal(await page.locator('[data-event-id]').count(), 0);
  assert.match(await page.locator('[data-role="catalog"]').innerText(), /benannter Eintrag liegt bisher nicht vor/);
  await page.getByRole('button', { name: 'Alle Kapitel anzeigen' }).click();

  await page.locator('[data-role="year"]').fill('1720');
  assert.equal(await page.locator('[data-event-id]').count(), 4);
  await page.locator('[data-role="order"]').selectOption('newest');
  assert.equal(await page.locator('[data-event-id]').first().getAttribute('data-event-id'), 'krieg-um-estryll');
  await page.reload();
  assert.equal(await page.locator('[data-role="year"]').inputValue(), '1720');
  assert.equal(await page.locator('[data-event-id]').count(), 4);
  await page.locator('[data-event-id="krieg-um-estryll"]').getByRole('link', { name: 'Ende im Kalender' }).click();
  await page.locator('[data-calendar-day="9"]').waitFor();
  assert.equal(await page.locator('[data-calendar-year]').inputValue(), '1720');
  assert.equal(await page.locator('.calendar-chronicle-entry').count(), 4);
  assert.match(await page.locator('.calendar-chronicle-entry.is-highlighted').innerText(), /Krieg um Estryll/);
  assert.equal(await page.locator('[data-calendar-grid] .ac-days small').count(), 0);
  if (screenshots) await page.screenshot({ path: `${screenshots}/kalender-chronik.png`, fullPage: true });
  await page.locator('.calendar-chronicle-entry.is-highlighted a').click();
  assert.match(page.url(), /#ereignis-krieg-um-estryll$/);
  await page.locator('#ereignis-krieg-um-estryll details[open]').waitFor();

  await page.goto(`${base}/AleriaAlmanach/kalender.html`);
  await page.locator('[data-calendar-day="9"]').waitFor();
  await page.getByRole('button', { name: '+ Termin eintragen', exact: true }).click();
  await page.locator('[name="title"]').fill('Chronikprüfung: Zusammenkunft');
  await page.locator('[name="summary"]').fill('Lokaler Testtermin für die Ereignisübersicht.');
  await page.locator('.calendar-editor [type="submit"]').click();
  await page.locator('.calendar-editor-overlay.active').waitFor({ state: 'hidden' });
  // articleHref ist bereits im Kalendermodell vorgesehen, aber noch kein Editorfeld.
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('aleria.calendar-events.v1'));
    Object.values(saved.drafts)[0].articleHref = '../Ereignisse/index.html';
    localStorage.setItem('aleria.calendar-events.v1', JSON.stringify(saved));
  });
  await page.getByRole('link', { name: 'Ereignischronik' }).click();
  await page.locator('[data-events-calendar] .calendar-preview').waitFor();
  assert.match(await page.locator('[data-events-calendar]').innerText(), /Chronikprüfung: Zusammenkunft/);
  assert.match(await page.locator('[data-events-calendar] .calendar-preview-kicker').innerText(), /Lokal/);
  const dossier = await page.locator('[data-events-calendar]').getByRole('link', { name: 'Dossier öffnen' }).getAttribute('href');
  assert.equal(dossier, `${base}/Ereignisse/index.html`);
  await page.getByRole('link', { name: 'Chronikprüfung: Zusammenkunft' }).click();
  await page.locator('#calendar-detail-overlay.active').waitFor();
  assert.match(page.url(), /AleriaAlmanach\/kalender.html\?event=/);

  await page.goto(`${base}/Ereignisse/index.html`);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false, `Kein horizontaler Überlauf bei ${width}px`);
    if (screenshots && [768, 390].includes(width)) await page.screenshot({ path: `${screenshots}/ereignisse-${width}.png`, fullPage: true });
    if (screenshots && width === 390) await page.screenshot({ path: `${screenshots}/ereignisse-mobil-titelseite.png` });
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.locator('[data-event-id="hochzeit-bei-gwynthor"] .event-icon-link').click();
  assert.match(await page.title(), /Hochzeit von Haus Draig/);
  // Fremde Build-Assets der Almanach-Startseite separat melden; ihre Navigation dennoch prüfen.
  checkingAlmanach = true;
  await page.goto(`${base}/AleriaAlmanach/AleriaAlmanach.html`);
  const register = page.locator('a[data-register-key="ereignisse"]');
  await register.waitFor();
  assert.match(await register.locator('img').getAttribute('src'), /Ereignisse.png$/);
  await register.click();
  checkingAlmanach = false;
  assert.match(page.url(), /Ereignisse\/index.html$/);
  assert.equal(await page.locator('[data-event-id]').count(), 10);

  const staticContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  await staticContext.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const staticPage = await staticContext.newPage();
  await staticPage.goto(`${base}/Ereignisse/index.html`);
  assert.equal(await staticPage.locator('[data-event-id]').count(), 10);
  await staticPage.locator('#ereignis-krieg-der-praetendenten summary').click();
  assert.match(await staticPage.locator('#ereignis-krieg-der-praetendenten details').innerText(), /Halbgeschwister/);
  await staticContext.close();
  assert.deepEqual(missing, []);
  assert.deepEqual(errors, []);
  if (almanachMissing.length) console.log('Bestehende fehlende Almanach-Assets:', [...new Set(almanachMissing)].join(', '));
  console.log('Ereignisse: Suche, Kapitel, Zeitfolge, Jahresfilter, Kalender-Rückverweise, lokale Terminvorschau, Dossier, Almanach-Icon, vier Breiten und Lesen ohne JavaScript bestanden.');
} finally {
  await context.close();
  await browser.close();
}
