import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.TOPIC_BOARD_TEST_ORIGIN || 'http://127.0.0.1:4187';
const shots = process.env.TOPIC_BOARD_SCREENSHOTS;
if (shots) await mkdir(shots, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
const context = await browser.newContext({ viewport: { width: 1600, height: 1050 } });
// The real page is exercised with local fixtures. No Firebase writes or external requests.
await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => { if (error.stack?.includes('topic-board')) errors.push(error.message); });
const shot = async name => { if (shots) await page.screenshot({ path: `${shots}/${name}.png` }); };
const people = () => page.locator('[data-people-picker]');
const selectTab = name => page.locator(`.topic-board-editor-sections [data-topic-board-editor-section-target="${name}"]`).click();
try {
  await page.goto(`${origin}/AleriaAlmanach/AleriaAlmanach.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!globalThis.AleriaTopicBoardUI);
  await page.evaluate(() => {
    const archive = getVisibleCharacterRecords();
    const names = ['Idwal Draig', 'Trevor', 'Siânmue', 'Naria Windreiter'];
    const cast = names.map((name, index) => ({ id: `fixture-${index}`, name, title: ['Kapitän', 'Wächter', 'Windreiterin', 'Gesandte'][index], portrait: archive[index]?.portrait || '' }));
    globalThis.boardFixtureCharacters = [...cast, ...archive.filter(record => !names.includes(record.name))];
    getVisibleCharacterRecords = () => boardFixtureCharacters;
    globalThis.boardFixtures = [
      { id: 'reise', title: 'Aufbruch nach Tûr Rhewgorn', category: 'reise', description: 'Anurat reist mit Neithon, Idwal und ihrem Gefolge nach Tûr Rhewgorn. Wer begleitet die Reise, und welche offenen Fragen nehmen wir mit?', location: 'Tûr Rhewgorn', duration: 'Drei Tage', participants: cast.slice(0, 3), votes: { a: true, b: true, c: true } },
      { id: 'schiff', title: 'Idwal und Trevor treffen sich mit der Mannschaft', category: 'begegnung', description: 'Ein Abend auf dem Schiff. Die Mannschaft wartet auf neue Befehle.', location: 'Idwals Schiff', participants: cast.slice(0, 2), votes: { a: true } },
      { id: 'audienz', title: 'Eine Audienz im Haus des Draig', category: 'hof', description: 'Die Gesandten kommen nach Gwynthor. Ein Gespräch über Bündnisse und Versprechen.', location: 'Haus des Draig', participants: cast.slice(2), votes: { a: true, b: true } },
      { id: 'suche', title: 'Owetas Suche', category: 'alltag', description: 'Oweta liebt Gwynthor und möchte ihr Leben dort verbringen. Sie sucht einen geeigneten Platz.', participants: cast.slice(1) },
      { id: 'lehre', title: 'Rhiannons Lehrstunde', category: 'anderes', description: 'Myrddin unterweist seinen Lehrling in arkaner Kunde.', participants: [{ id: 'missing', name: 'Ehemalige Begleitung' }] }
    ].map((item, index) => normalizeTopicProposal({ ...item, schedule: { startDate: { day: 10 + index, month: 3, year: 1740 } } }));
    getTopicBoardState = () => ({ proposals: boardFixtures, view: 'open', loading: false, syncState: 'online', pendingCount: 0 });
    getTopicBoardVisibleProposals = () => boardFixtures;
    getTopicBoardProposalById = id => boardFixtures.find(item => item.id === id) || null;
    createTopicBoardProposal = async payload => { globalThis.savedBoardFixture = payload; return { ...payload, id: 'new-fixture' }; };
    updateTopicBoardProposal = async (id, payload) => { globalThis.savedBoardFixture = { ...payload, id }; return payload; };
  });
  await page.locator('.topic-board-sidebar-create').click();
  assert.equal(await page.locator('[data-topic-board-editor]').isVisible(), false);
  assert.equal(await page.locator('[data-topic-board-list] .topic-board-card').count(), 5);
  await shot('board-desktop');
  await page.locator('[data-topic-board-action="open-editor"]').click();
  await people().locator('[data-people-query]').waitFor({ state: 'attached' });
  assert.equal(await page.locator('.topic-board-save-button').innerText(), 'Eintragen');
  assert.equal(await page.locator('.topic-board-save-button img').count(), 0);
  assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 1);
  await page.locator('[name="title"]').fill('Gemeinsam aufbrechen');
  await page.locator('[name="description"]').fill('Ein neuer Faden für unsere nächste Szene.');
  await shot('editor-content');
  await selectTab('participants');
  await people().locator('[data-people-query]').fill('Idwal Draig, Siânmue');
  assert.equal(await people().locator('.topic-board-character').count(), 2);
  await people().locator('[data-people-action="add-results"]').click();
  assert.equal(await people().locator('.topic-board-person-chip').count(), 2);
  await people().locator('[data-people-query]').fill('Trevor');
  await people().locator('[data-people-query]').press('Enter');
  assert.equal(await people().locator('.topic-board-person-chip').count(), 3);
  assert.equal(await page.locator('[data-topic-board-editor]').isVisible(), true);
  await people().locator('[data-people-action="reset-search"]').click();
  await people().locator('[data-people-selected-only]').check();
  assert.equal(await people().locator('.topic-board-character').count(), 3);
  await people().locator('[data-people-action="clear"]').click();
  assert.equal(await people().locator('.topic-board-person-chip').count(), 0);
  await people().locator('[data-people-action="undo"]').click();
  assert.equal(await people().locator('.topic-board-person-chip').count(), 3);
  await people().locator('[data-people-selected-only]').uncheck();
  await people().locator('[data-people-group]').selectOption({ label: 'Eine Audienz im Haus des Draig · 2 Personen' });
  await people().locator('[data-people-action="add-group"]').click();
  assert.equal(await people().locator('.topic-board-person-chip').count(), 4);
  await shot('editor-people');
  await selectTab('schedule');
  await page.locator('[name="scheduleStartDay"]').fill('12');
  await page.locator('[name="scheduleStartMonth"]').fill('3');
  await page.locator('[name="scheduleStartYear"]').fill('1740');
  await selectTab('travel');
  await page.locator('[name="travelEnabled"]').check();
  await page.locator('[name="travelOrigin"]').fill('Gwynthor');
  await page.locator('[name="travelDestination"]').fill('Abergwint');
  await page.locator('[name="travelManualDays"]').fill('3');
  await selectTab('preview');
  assert.match(await page.locator('[data-topic-board-preview]').innerText(), /Gemeinsam aufbrechen/);
  await page.locator('.topic-board-save-button').click();
  await page.locator('[data-topic-board-editor]').waitFor({ state: 'hidden' });
  const saved = await page.evaluate(() => savedBoardFixture);
  assert.equal(saved.participants.length, 4);
  assert.equal(saved.travel.totalDays, 3);
  assert.equal(saved.schedule.startDate.day, 12);
  await page.locator('[data-topic-board-action="edit"][data-topic-board-id="lehre"]').click();
  await people().locator('[data-people-query]').waitFor({ state: 'attached' });
  await selectTab('participants');
  assert.match(await people().locator('[data-people-selected]').innerText(), /Ehemalige Begleitung/);
  await page.locator('.topic-board-save-button').click();
  await page.locator('[data-topic-board-editor]').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => savedBoardFixture.participants[0].id), 'missing');
  for (const width of [390, 768, 1100]) {
    await page.setViewportSize({ width, height: 900 });
    await shot(`board-${width}`);
    await page.locator('[data-topic-board-action="open-editor"]').click();
    await people().locator('[data-people-query]').waitFor({ state: 'attached' });
    await selectTab('participants');
    await shot(`people-${width}`);
    const dimensions = await page.locator('.topic-board-dialog').evaluate(dialog => ({ width: dialog.clientWidth, scroll: dialog.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width + 1, `dialog overflow at ${width}: ${JSON.stringify(dimensions)}`);
    const panel = await people().evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
    assert.ok(panel.scroll <= panel.width + 1, `people overflow at ${width}`);
    assert.equal(await page.locator('.topic-board-save-button').isVisible(), true);
    await page.locator('#topic-tab-participants').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#topic-tab-schedule').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-topic-board-editor]').isVisible(), false);
  }
  await page.locator('[data-topic-board-action="close-board"]').click();
  await page.locator('.topic-board-sidebar-create').click();
  assert.equal(await page.locator('[data-topic-board-editor]').isVisible(), false);
  assert.deepEqual(errors, []);
  console.log('Themenwand: default closed editor, multiple-name search, batch selection, undo, reuse, save, missing characters, keyboard and 4 viewport checks passed.');
} finally { await browser.close(); }
