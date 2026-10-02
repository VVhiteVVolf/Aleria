import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.NOTICE_TEST_ORIGIN || 'http://127.0.0.1:4197';
const shots = process.env.NOTICE_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await context.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.origin === origin && route.request().method() === 'GET') return route.continue();
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) return route.continue();
  return route.abort();
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png`, animations: 'disabled' }); };
try {
  await page.goto(`${origin}/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const titles = ['Geleit durch den Dornenwald', 'Der rote Fuchs', 'Der Bote von Gwynthor', 'Wo ist der alte Fährmann?', 'Ein Markt unter den Sternen', 'An meine Nachbarn', 'Feine Klingen & ehrliche Preise', 'Kund und zu wissen', 'Ein Abend bei Kerzenschein', 'Meidet die alte Furt', 'Mit der Karawane nach Norden', 'Die Schmiede sucht geschickte Hände', 'Ein Ring aus hellem Silber'];
    const notices = window.ZETTEL_TYPES.map((type, index) => {
      const note = window.TafelZettelConfig.createDraft(type.id, { x: .2 + (index % 4) * .18, y: .25 + Math.floor(index / 4) * .18 }, () => `fixture-${type.id}`);
      note.title = titles[index];
      note.untertitel = 'Ein Aushang am Marktplatz von Gwynthor';
      note.text = '<p>Wackere Reisende und gute Leute von Gwynthor, hört diese Kunde.</p><p>Wer Rat weiß oder seine Dienste anbieten möchte, melde sich vor Einbruch der Dämmerung am alten Markt. Ein ehrliches Wort gilt hier noch ebenso viel wie eine volle Börse.</p>';
      note.verfasserName = 'Die Schreiberin am Markttor';
      const values = { 'Preis': '12 Silberstücke', 'Ort': 'Am alten Markt', 'Kontakt': 'Meister Aldwin', 'Belohnung': '50 Silberstücke', 'Frist': 'Vor dem nächsten Vollmond', 'Aufbruch': 'Gwynthor', 'Ziel': 'Die nördlichen Pässe', 'Abreise': 'Bei Sonnenaufgang', 'Gefahr': 'Spuren eines Ungeheuers', 'Gebiet': 'Die alte Furt', 'Gesucht': 'Zwei beherzte Weggefährten', 'Wann': 'Zur Abendstunde', 'Wo': 'Im Haus am Brunnen', 'Fundstück': 'Ein silberner Siegelring', 'Name': 'Der alte Fährmann' };
      note.table = type.table.map(row => ({ ...row, v: values[row.k] || '' }));
      note.artikel = [{ titel: 'Lichter über dem Marktplatz', text: note.text }, { titel: 'Reisende aus dem Norden', text: '<p>Am Stadttor traf heute eine kleine Karawane ein. Die Wege sind frei, doch die Furt bleibt gefährlich.</p>' }];
      note.personen = type.id === 'steckbrief' ? [{ title: 'Der rote Fuchs', text: note.text, table: [{ k: 'Kopfgeld', v: '100 Goldstücke' }, { k: 'Vergehen', v: 'Wegelagerei' }] }, { title: 'Der graue Rabe', text: 'Zweite gesuchte Person', table: [] }] : [];
      return note;
    });
    window.TafelState.apply({ zettel: [...notices, { ...notices[0], id: 'fixture-secret', title: 'Geheimer Auftrag', secret: true }] });
  });
  await page.locator('.notice-register-entry').first().waitFor();
  assert.equal(await page.locator('.notice-register-entry').count(), 13);
  await shot('board-desktop');
  await page.locator('#search-inp').fill('ehrliches Wort');
  assert.ok(await page.locator('.notice-register-entry').count() > 0);
  await page.locator('[data-action="clear-search"]').click();
  await page.locator('#notice-type-filter').selectOption('handel');
  assert.equal(await page.locator('.notice-register-entry').count(), 1);
  await page.locator('.notice-register-entry').click();
  await page.locator('#scroll-mo.open').waitFor();
  assert.equal(await page.locator('#scroll-card').getAttribute('aria-label'), 'Feine Klingen & ehrliche Preise');
  await shot('handel-desktop');
  await page.locator('.notice-reply > summary').click();
  await page.locator('[data-zettel-comment-name]').fill('Eine Reisende');
  await page.locator('[data-zettel-comment-text]').fill('Ist noch eine Klinge zu haben?');
  await page.locator('[data-action="zettel-comment-add"]').click();
  assert.match(await page.locator('.zettel-comments-list').innerText(), /Ist noch eine Klinge/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#scroll-mo.open').count(), 0);
  await page.locator('#notice-type-filter').selectOption('');
  const types = await page.evaluate(() => window.ZETTEL_TYPES.map(type => type.id));
  for (const type of types) {
    await page.locator(`.notice-register-entry[data-notice-id="fixture-${type}"]`).click();
    await page.locator('#scroll-mo.open').waitFor();
    assert.equal(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, `${type}: desktop overflow`);
    await shot(`template-${type}`);
    if (type === 'steckbrief') {
      await page.getByRole('button', { name: 'Weiter', exact: true }).click();
      assert.match(await page.locator('#scroll-content').innerText(), /Der graue Rabe/);
    }
    await page.keyboard.press('Escape');
  }
  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
  assert.equal(await page.locator('.notice-register-entry').count(), 14);
  await page.locator('#btn-add-zettel').click();
  await page.locator('#board-viewport').click({ position: { x: 35, y: 35 } });
  assert.equal(await page.locator('#zettel-type-grid .tpl-card').count(), 13);
  await page.locator('[data-zettel-type="reise"]').click();
  assert.match(await page.locator('#notice-template-detail').innerText(), /Aufbruch.*Ziel/);
  await shot('template-picker');
  await page.locator('#zettel-tpl-apply-btn').click();
  await page.locator('#sidebar.open').waitFor();
  await page.locator('#sb-body [data-field="title"]').click();
  await page.locator('#sb-body [data-field="title"]').fill('Test einer neuen Reiseroute');
  assert.match(await page.locator('#sb-preview-content').textContent(), /Test einer neuen Reiseroute/);
  await shot('editor-desktop');
  await page.locator('[data-action="zettel-save-close"]').click();
  await page.locator('#btn-edit').click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#notice-register').isVisible(), false);
  await shot('board-mobile');
  await page.locator('#btn-register').click();
  for (const type of types) {
    await page.locator(`.notice-register-entry[data-notice-id="fixture-${type}"]`).click();
    await page.locator('#scroll-mo.open').waitFor();
    assert.equal(await page.locator('#scroll-content').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, `${type}: mobile overflow`);
    assert.equal(await page.locator('#scroll-card').evaluate(element => element.getBoundingClientRect().right <= innerWidth), true);
    if (['quest', 'handel', 'steckbrief'].includes(type)) await shot(`${type}-mobile`);
    await page.keyboard.press('Escape');
  }
  await page.locator('#btn-edit').click();
  await page.locator('#pw-inp').fill('7777');
  await page.getByRole('button', { name: 'Freischalten', exact: true }).click();
  await page.locator('.notice-register-entry[data-notice-id="fixture-handel"]').click();
  await page.locator('#scroll-mo.open').waitFor();
  await page.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
  await page.locator('#sb-body [data-field="title"]').click();
  assert.equal(await page.locator('#sb-editor-col').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, 'mobile editor overflow');
  await shot('editor-mobile');
  assert.deepEqual(errors, []);
  console.log('PASS: 13 templates at desktop/mobile widths, full-text search, filtering, hidden notices, comments, paging, creation, editing and draft reload.');
} finally {
  await browser.close();
}
