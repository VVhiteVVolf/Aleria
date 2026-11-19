import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildForeignVoiceFixture } from './fixtures/comment-foreign-voice-fixture.mjs';
import { person } from './fixtures/graded-challenge-fixtures.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const output = resolve(root, `diagnostics/comment-editor-20261119/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const fixture = resolve(output, 'fixture.html');
await writeFile(fixture, await buildForeignVoiceFixture());
const server = await startChartQualityServer(root);
const url = `${server.origin}/${relative(root, fixture).replaceAll('\\', '/')}`;
let browser, page;
const report = { fixture: 'Production comment dialogs and reader with an isolated localStorage adapter. Loopback GET only.', cases: [] };

const cards = () => page.locator('#cf-segment-list .comment-segment-card');
const segment = index => cards().nth(index);
const gap = index => page.locator(`#cf-segment-list [data-comment-section-gap="${index}"]`);
const state = () => page.evaluate(() => _commentSegments.map(({ kind, text, mechanicMode, templateVoiceChoice }) =>
  ({ kind, text, mechanicMode, voiceChoice: !!templateVoiceChoice })));
const pair = ['action', 'speech'];
const combat = [...pair, 'action', 'combataction', ...pair, 'action', 'combataction',
  'action', 'speech', 'action', 'combataction', 'action', 'speech'];
const open = async (threadId, afterId) => {
  await page.evaluate(({ threadId, afterId }) => {
    if (isCommentFormOpen()) closeCommentForm();
    window.fixtureThreadId = threadId;
    return afterId ? openCommentFormAfter(afterId) : openCommentForm();
  }, { threadId, afterId });
  await cards().first().waitFor({ state: 'visible' });
};
const fill = (index, text) => segment(index).locator('textarea').fill(text);
const chooseCharacter = () => page.locator('#cf-char-picker [data-id="foreign-voice-test-main"]').click();

async function image(name, run) {
  await page.evaluate(() => document.fonts.ready);
  const path = resolve(output, `${run.width}-${name}.png`);
  await page.screenshot({ path });
  run.screenshots.push(path);
}

async function assertInside(selector) {
  const bounds = await page.locator(selector).boundingBox();
  const { width } = page.viewportSize();
  assert(bounds && bounds.x >= -1 && bounds.x + bounds.width <= width + 1, `${selector} horizontal bounds at ${width}`);
}

async function dragSectionTo(grip, target) {
  await grip.scrollIntoViewIfNeeded();
  const source = await grip.boundingBox();
  const x = source.x + source.width / 2;
  const y = source.y + source.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 24, y, { steps: 6 });
  // Long cards require a scroll between picking up a section and dropping it.
  await target.evaluate(row => row.scrollIntoView({ block: 'center' }));
  const destination = await target.boundingBox();
  const dropX = destination.x + destination.width / 2;
  const dropY = destination.y + destination.height / 2;
  await page.mouse.move(dropX, dropY, { steps: 12 });
  await page.mouse.move(dropX + 1, dropY);
  await page.mouse.up();
}

async function reviewReader(run) {
  for (const path of ['session.css', 'session-mobile.css', 'session-controls-compact.css']) {
    await page.addStyleTag({ url: `${server.origin}/AleriaAlmanach/styles/${path}` });
  }
  await page.addScriptTag({ url: `${server.origin}/AleriaAlmanach/modules/comments/comments-page.js` });
  await page.evaluate(() => {
    Object.assign(window, {
      buildNav: () => '', isSessionFocusModeEnabled: () => false,
      getSessionThreadId: () => 'fixture-reader', getPageCommentThreadKey: () => 'sample',
      buildSceneClockControl: () => '', buildSceneInventoryControl: () => '', buildSceneDiceControl: () => '',
      buildSessionStatusControl: () => ''
    });
    const scene = document.createElement('section');
    scene.style.cssText = 'height:calc(100dvh - 2rem);display:flex;flex-direction:column;container:module-content / inline-size';
    scene.innerHTML = buildSessionPage({ pageTitle: 'Die Mühle am Abend', image: './assets/tirfelyn-hof/scenes/muehle-v1.png' },
      { id: 'mill', title: 'Die Mühle', stamp: 'Tirfelyn-Hof' }, 0, 1);
    scene.querySelector('.comments-scroll').innerHTML = renderCommentBubble({
      id: 'fixture-story', charName: fixtureCharacter.name, portrait: fixtureCharacter.portrait,
      commentSegments: [{ kind: 'action', narrator: true, text: 'Am Mühlrad sammeln sich die letzten Tropfen des Tages.' },
        { kind: 'speech', charName: fixtureCharacter.name, portrait: fixtureCharacter.portrait, text: 'Wir sehen morgen nach dem Wehr.' }]
    }, 0);
    document.getElementById('fixture-controls').hidden = true;
    document.getElementById('fixture-feed').hidden = true;
    document.getElementById('fixture-feed').before(scene);
    applyCommentToolsVisibility();
  });
  await page.locator('.session-art-col img').evaluate(img => img.decode());
  await assertInside('.session-footer');
  const actions = page.locator('.session-footer .comments-form-bar');
  assert.deepEqual(await actions.locator(':scope > button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label'))), [
    'Kommentieren', 'Zeitsprung anlegen', 'Rast oder stille Regeneration', 'Kampfliste verwalten',
    'Szenenwechsel anlegen', 'Abstimmung anlegen', 'Herausforderung gestalten', 'Objekt vorstellen',
    'Modul einfuegen', 'Anhang präsentieren', 'Fazit eintragen'
  ]);
  assert.equal(await actions.locator('details').count(), 0);
  const toolbarToggle = page.locator('[data-comment-quick-tools-toggle]');
  const fontSize = page.locator('[data-comment-quick-tools] > .comment-reader-controls [data-reader-setting="font"]');
  await fontSize.waitFor({ state: 'visible', timeout: 5000 });
  await toolbarToggle.click();
  await fontSize.waitFor({ state: 'hidden', timeout: 5000 });
  await image('verlauf', run);
  await toolbarToggle.click();
  await fontSize.waitFor({ state: 'visible', timeout: 5000 });
  await assertInside('[data-comment-quick-tools]');
  await image('werkzeuge', run);
  const sceneFooter = page.locator('.session-footer');
  const before = await sceneFooter.evaluate(footer => footer.outerHTML);
  await page.getByRole('button', { name: 'Kommentieren', exact: true }).click();
  await cards().first().waitFor({ state: 'visible' });
  await page.locator('#comment-form-overlay [data-action="close-comment-form"]').first().click();
  assert.equal(await page.locator('#comment-form-overlay').isVisible(), false);
  assert.equal(await sceneFooter.evaluate(footer => footer.outerHTML), before);
}

async function reviewCombatComposer(run) {
  for (const path of ['combat.css', 'combat-action-card.css', 'combat-payment-card.css']) {
    await page.addStyleTag({ url: `${server.origin}/AleriaAlmanach/styles/${path}` });
  }
  await page.evaluate(async profile => {
    fixtureCharacter.combatProfile = profile;
    await import('/AleriaAlmanach/modules/combat/combat-controller.js');
  }, person('editor-actor').combatProfile);
  await open('fixture-combat-layout');
  await chooseCharacter();
  await page.getByRole('button', { name: 'Kampf Template', exact: true }).click();
  const combatSlot = segment(3).locator('[data-combat-composer]');
  await combatSlot.locator('[data-combat-details="action-picker"] > summary').waitFor({ timeout: 5000 });
  await combatSlot.locator('[data-combat-input="targetId"]').selectOption('comment-editor-test-creature');
  await fill(3, 'Sie hebt die Übungsklinge.');
  await segment(3).getByRole('button', { name: /nach oben verschieben/ }).click();
  const saved = await page.evaluate(() => buildCommentSegmentsForSave());
  assert.equal(saved.length, 1);
  assert.equal(saved[0].mechanicMode, 'combat');
  assert.equal(saved[0].combatTargetId, 'comment-editor-test-creature');
  await segment(2).locator('[data-combat-composer]').scrollIntoViewIfNeeded();
  await assertInside('#comment-form-overlay .comment-form-card');
  await image('kampfeingaben', run);
}

try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 880 }, hasTouch: width < 500, reducedMotion: 'reduce' });
    const run = { width, screenshots: [], pageErrors: [], localFailures: [], checks: [] };
    report.cases.push(run);
    await context.route('**/*', route => {
      const request = route.request();
      return new URL(request.url()).origin === server.origin && request.method() === 'GET' ? route.continue() : route.abort();
    });
    page = await context.newPage();
    page.on('pageerror', error => run.pageErrors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) run.localFailures.push(response.url()); });
    await page.goto(url);
    await page.waitForFunction(() => window.fixtureReady);
    for (const [button, expected] of [
      ['Kurze Antwort', Array.from({ length: 4 }, () => pair).flat()],
      ['Lange Antwort', Array.from({ length: 8 }, () => pair).flat()],
      ['Kampf Template', combat]
    ]) {
      await open(`template-${button}`);
      await page.getByRole('button', { name: button, exact: true }).click();
      assert.deepEqual((await state()).map(item => item.kind), expected);
      assert((await state()).every(item => item.text === ''));
      assert.equal(await page.evaluate(() => buildCommentSegmentsForSave().length), 0);
      run.checks.push(button);
    }
    assert.deepEqual((await state()).flatMap((item, index) => item.mechanicMode === 'combat' ? [index] : []), [3, 7, 11]);
    assert.equal(await page.locator('#cf-segment-list .comment-duration-total strong').textContent(), '0 Sek.');
    await segment(9).getByRole('combobox', { name: /Rede oder Gedanke/ }).selectOption('thought');
    assert.equal((await state())[9].kind, 'thought');
    await fill(0, 'Die Dielen knarren.');
    assert.equal(await page.evaluate(() => buildCommentSegmentsForSave().length), 1);
    await page.locator('[data-comment-section-templates]').evaluate(row => row.scrollIntoView({ block: 'start' }));
    await assertInside('#comment-form-overlay .comment-form-card');
    await image('vorlagen', run);

    await open('fixture-draft-origin');
    await chooseCharacter();
    const composerControls = ['.comment-segment-head', '.comment-segment-side', '[data-segment-mechanics-host]',
      '.comment-segment-format-toolbar', 'textarea', '.comment-section-controls'];
    assert.equal(await segment(0).evaluate((card, selectors) => {
      const children = selectors.map(selector => card.querySelector(selector));
      return children.every((child, index) => child && (!index ||
        (children[index - 1].compareDocumentPosition(child) & Node.DOCUMENT_POSITION_FOLLOWING)));
    }, composerControls), true, 'the existing controls precede the new section tools in their original order');
    await fill(0, 'Erster Satz. Zweiter Satz.');
    await segment(0).locator('textarea').evaluate(field => {
      field.focus(); field.setSelectionRange(13, 13); field.dispatchEvent(new Event('select', { bubbles: true }));
    });
    await segment(0).getByRole('button', { name: 'Teilen', exact: true }).click();
    assert.deepEqual((await state()).map(item => item.text), ['Erster Satz. ', 'Zweiter Satz.']);
    await gap(1).getByRole('button', { name: '+ Handlung und Rede', exact: true }).click();
    await fill(1, 'Sie legt den Schlüssel ab.');
    await fill(2, 'Hier ist der Schlüssel.');
    await gap(4).getByRole('combobox', { name: /Nach Abschnitt/ }).selectOption('thought');
    await fill(4, 'Das reicht fürs Erste.');
    await segment(4).locator('[data-action="remove-comment-segment"]').click();
    await page.getByRole('button', { name: 'Abschnitt zurückholen' }).click();
    assert.equal((await state())[4].text, 'Das reicht fürs Erste.');
    await segment(1).getByRole('checkbox').check();
    await segment(2).getByRole('checkbox').check();
    if (width === 1440) {
      await dragSectionTo(segment(1).locator('[data-comment-section-grip]'), gap(0));
    } else await segment(1).getByRole('button', { name: /nach oben verschieben/ }).click();
    assert.deepEqual((await state()).slice(0, 3).map(item => item.text), ['Sie legt den Schlüssel ab.', 'Hier ist der Schlüssel.', 'Erster Satz. ']);
    await segment(0).locator('.comment-segment-head').evaluate(head => head.scrollIntoView({ block: 'start' }));
    await image('abschnitte', run);
    run.checks.push('Teilen, Einfügen, Löschen, Rückholen und Mehrfachverschieben');

    const expectedText = (await state()).map(item => item.text);
    await page.getByRole('button', { name: 'Entwurf im Browser speichern' }).click();
    await page.locator('[data-comment-saved-draft-list] li').first().waitFor();
    await page.locator('#cf-draft-library').scrollIntoViewIfNeeded();
    await image('ablage', run);
    await page.reload();
    await page.waitForFunction(() => window.fixtureReady);
    await open('fixture-draft-target', 'fixture-previous-comment');
    await fill(0, 'Dieser Entwurf entsteht am Ziel.');
    await page.getByText('Gespeicherte Entwürfe', { exact: true }).click();
    await page.getByRole('button', { name: 'Entwurf von Mara Beispiel laden' }).click();
    await page.getByText('Gespeicherter Entwurf geladen.', { exact: true }).waitFor();
    assert.deepEqual((await state()).map(item => item.text), expectedText);
    assert.equal(await page.evaluate(() => _commentInsertAfterId), 'fixture-previous-comment');
    assert.equal(await page.evaluate(() => _selectedCharId), 'foreign-voice-test-main');
    await page.getByText('Gespeicherte Entwürfe', { exact: true }).click();
    await page.locator('[data-comment-saved-draft-list]').getByText('Dieser Entwurf entsteht am Ziel.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Entwurf von Mara Beispiel löschen' }).click();
    assert.equal(await page.getByRole('button', { name: 'Entwurf von Mara Beispiel laden' }).count(), 0);
    run.checks.push('Szenenwechsel, Neuladen, Einfügepunkt, Erhalt des Zielentwurfs und Löschen');

    await open('fixture-animal-speech');
    await page.locator('#cf-mode-creature').click();
    await page.locator('#cf-char-picker [data-id="comment-editor-test-creature"]').click();
    await segment(0).locator('[data-action="set-comment-segment-kind"][data-kind="animal"]').click();
    await fill(0, 'Warte hier, Bryn.');
    await page.locator('#cf-submit').click();
    await page.waitForFunction(() => fixtureSaved.some(comment => comment.actorType === 'creature' && comment.commentSegments?.[0]?.kind === 'animal'));
    assert.equal(await page.locator('#comment-form-overlay').isVisible(), false);
    run.checks.push('Tiersprache für Kreatur ohne Merkmal');
    await reviewReader(run);
    run.checks.push('Ursprüngliche Szenenleiste, Regler und Einstieg zum Kommentieren');
    await reviewCombatComposer(run);
    run.checks.push('Realer Kampfeditor mit Zielwahl und Verschieben einschließlich übernommener Eingaben');
    assert.deepEqual(run.pageErrors, []);
    assert.deepEqual(run.localFailures, []);
    await context.close();
  }
  report.passed = true;
} catch (error) {
  report.error = error.stack;
  if (page && !page.isClosed()) await page.screenshot({ path: resolve(output, 'failure.png') }).catch(() => {});
  throw error;
} finally {
  await browser?.close();
  await server.close();
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, passed: !!report.passed, cases: report.cases.length }));
}
