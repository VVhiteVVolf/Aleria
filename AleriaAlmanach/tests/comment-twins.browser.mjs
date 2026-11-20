import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildNarrativeCommentDocument } from '../../firebase/functions/src/comments/commit-narrative-comment.js';
import { compactMechanicalSegmentsForStorage } from '../../firebase/functions/src/mechanics/mechanical-resolution-storage.js';
import { getCommentActorIds } from '../modules/combat/combat-condition-duration.js';
import { buildForeignVoiceFixture } from './fixtures/comment-foreign-voice-fixture.mjs';
import { person } from './fixtures/graded-challenge-fixtures.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const { values } = parseArgs({ options: { output: { type: 'string' }, 'avatar-images': { type: 'string' } } });
const output = resolve(root, values.output || `diagnostics/comment-twins-20261119/browser-${Date.now()}`);
const avatarFolder = values['avatar-images'] && resolve(root, values['avatar-images']);
const sampleAvatars = ['woman', 'girl', 'woman-2', 'servant'];
const speakers = await Promise.all(['morwella', 'meirawen'].map(async shortName => {
  const slug = `${shortName}-gwyllach`;
  const id = `person--haus-gwyllach--${slug}`;
  const path = resolve(root, 'CharakterDatenbank/records/familien/haus-gwyllach', `${slug}--${id}/character.json`);
  const { character: { name, portrait, emotes } } = JSON.parse(await readFile(path, 'utf8'));
  const fixtureAvatars = emotes.slice(0, 4).map(({ img, label }, index) => {
    const localImage = avatarFolder
      ? `/${relative(root, resolve(avatarFolder, new URL(img).pathname.split('/').at(-1))).replaceAll('\\', '/')}`
      : `./public/assets/comment-foreign-voice/${sampleAvatars[index]}.png`;
    return { img: localImage, label };
  });
  return { id, name, portrait, entityType: 'character', imageSets: [
    { id: 'standard', name: 'Standard', portrait, emotes: fixtureAvatars },
    { id: 'alternativ', name: 'Weitere Ausdrücke', portrait, emotes: fixtureAvatars.slice(2) }
  ] };
}));
const [left, right] = speakers;
const leftPortrait = left.imageSets[0].emotes[0].img;
const rightPortrait = right.imageSets[1].emotes[0].img;
const texts = [
  'Hörst du das Wasser hinter der Mauer?',
  'Bei Flut kommen wir auf diesem Weg zurück.',
  'Die Schwestern bleiben am Tor stehen. Morwella hält die Laterne, Meirawen prüft den Riegel.',
  'Halt! Da kommt jemand!',
  'Still. Das ist nur der Wind.'
];
await mkdir(output, { recursive: true });
const fixtureFile = resolve(output, 'fixture.html');
await writeFile(fixtureFile, await buildForeignVoiceFixture({ additionalCharacters: speakers }));
const server = await startChartQualityServer(root);
const fixtureUrl = new URL(relative(root, fixtureFile).replaceAll('\\', '/'), server.origin).href;
const report = { fixture: 'Echte Kommentierdialoge und Registerporträts, isolierter Adapter, ausschließlich Loopback-GET.', speakers, cases: [] };
let browser;
let page;

const composer = () => page.locator('#comment-form-overlay');
const cards = () => composer().locator('#cf-segment-list .comment-segment-card');
const gap = index => composer().locator(`[data-comment-section-gap="${index}"]`);
const rightChoice = () => composer().locator('#cf-twin-right');
const voice = (index, side) => cards().nth(index).locator(`textarea[data-comment-twin-side="${side}"]`);
const kind = (index, side) => cards().nth(index).locator(`[data-comment-twin-kind="${side}"]`);
const preview = () => composer().locator('#cf-preview');
const avatarPicker = (card, side) => card.locator(`[data-comment-twin-avatar="${side}"]`);
const avatarChoice = (picker, index) => picker.locator(`button[data-emote-index="${index}"]`);
const writerPortrait = (card, side) => card.locator(`.comment-twin-write-lane--${side} .comment-twin-writer img`);

async function assertWriterPortraits(card, expected = [leftPortrait, rightPortrait]) {
  assert.deepEqual(await Promise.all(['left', 'right'].map(side => writerPortrait(card, side).getAttribute('src'))), expected);
}

async function chooseAvatars(card) {
  const leftPicker = avatarPicker(card, 'left');
  const rightPicker = avatarPicker(card, 'right');
  assert.equal(await card.locator('[data-comment-twin-avatar-palette]').count(), 0);
  await leftPicker.locator('summary').click();
  assert.equal(await avatarChoice(leftPicker, '').getAttribute('aria-pressed'), 'true');
  await avatarChoice(leftPicker, 0).click();
  assert.equal(await avatarChoice(leftPicker, 0).getAttribute('aria-pressed'), 'true');
  await assertWriterPortraits(card, [leftPortrait, right.portrait]);
  await rightPicker.locator('summary').click();
  const rightSet = rightPicker.getByRole('combobox', { name: `${right.name} · Avatar-Set` });
  await rightSet.selectOption('alternativ');
  assert.equal(await rightPicker.locator('[data-emote-index]').count(), 3);
  await avatarChoice(rightPicker, 0).click();
  assert.equal(await avatarChoice(rightPicker, 0).getAttribute('aria-pressed'), 'true');
  assert.equal(await rightPicker.locator('button[aria-pressed="true"]').count(), 1);
  await assertWriterPortraits(card);
}

async function open(threadId) {
  await page.evaluate(id => {
    if (isCommentFormOpen()) closeCommentForm();
    window.fixtureThreadId = id;
    return openCommentForm();
  }, threadId);
  await cards().first().waitFor({ state: 'visible' });
}

async function choosePair() {
  await composer().locator(`#cf-char-picker [data-id="${left.id}"]`).click();
  await composer().getByRole('checkbox', { name: 'Zwillingsmodus' }).check();
  assert.equal(await rightChoice().locator(`option[value="${left.id}"]`).count(), 0);
  await rightChoice().selectOption(right.id);
  await voice(0, 'left').waitFor();
}

async function decodeImages(element) {
  await element.locator('img.comment-portrait, .comment-twin-writer img, .comment-twin-avatar-picker[open] .comment-segment-avatar img').evaluateAll(async images => {
    await Promise.all(images.map(async img => { img.loading = 'eager'; await img.decode(); }));
  });
}

async function screenshot(run, name, anchor, imageRoot) {
  await decodeImages(imageRoot);
  await page.evaluate(() => document.fonts.ready);
  await anchor.evaluate(node => node.scrollIntoView({ block: 'start' }));
  await page.mouse.move(0, 0);
  const file = `${run.width}-${name}.png`;
  await page.screenshot({ path: resolve(output, file) });
  run.screenshots.push(file);
}

async function checkBubbles(container) {
  const rows = container.locator('.comment-twin-parallel');
  assert.equal(await rows.count(), 3);
  assert.equal(await container.locator('.comment-narrator-text').textContent(), texts[2]);
  const first = rows.first();
  await decodeImages(container);
  const geometry = await first.evaluate(row => {
    const rect = el => {
      const { top, left, right } = el.getBoundingClientRect();
      return { top, left, right };
    };
    return {
      row: rect(row),
      bubbles: [...row.querySelectorAll('.comment-body')].map(rect),
      portraits: [...row.querySelectorAll('.comment-portrait')].map(rect),
      overflow: row.scrollWidth - row.clientWidth
    };
  });
  const [leftBubble, rightBubble] = geometry.bubbles;
  const [leftPortraitRect, rightPortraitRect] = geometry.portraits;
  assert.ok(Math.abs(leftBubble.top - rightBubble.top) <= 1, JSON.stringify(geometry));
  assert.ok(leftBubble.right < rightBubble.left);
  assert.ok(leftPortraitRect.left <= leftBubble.left + 1 && rightPortraitRect.right >= rightBubble.right - 1);
  assert.ok(geometry.overflow <= 2, JSON.stringify(geometry));
  assert.equal(await first.locator('.comment-kind-whisper .comment-text').textContent(), texts[0]);
  assert.equal(await first.locator('.comment-kind-thought .comment-text').textContent(), texts[1]);
  assert.deepEqual(await first.locator('.comment-portrait').evaluateAll(images => images.map(image => image.getAttribute('src'))),
    [leftPortrait, rightPortrait]);
  assert.equal(await rows.nth(1).locator('.comment-twin-lane--right .comment-body').count(), 0);
  assert.equal(await rows.nth(2).locator('.comment-twin-lane--left .comment-body').count(), 0);
  return geometry;
}

async function checkCombat() {
  await page.evaluate(async ({ id, profile }) => {
    getAvailableCommentCharacterById(id).combatProfile = profile;
    await import('/AleriaAlmanach/modules/combat/combat-controller.js');
  }, { id: left.id, profile: person('twin-editor-actor').combatProfile });
  await open('twin-combat');
  await choosePair();
  await composer().getByRole('button', { name: 'Kampf Template', exact: true }).click();
  await chooseAvatars(cards().nth(1));
  await kind(1, 'right').selectOption('shout');
  await voice(1, 'right').fill('Vorsicht!');
  await cards().nth(3).locator('[data-combat-input="targetId"]').selectOption('comment-editor-test-creature');
  await cards().nth(3).locator('textarea').fill('Morwella hebt die Übungsklinge.');
  const segments = await page.evaluate(() => buildCommentSegmentsForSave());
  assert.equal(segments.length, 2);
  const [dialogue, combat] = segments;
  assert.equal(dialogue.twinDialogue.right.characterId, right.id);
  assert.equal(dialogue.twinDialogue.right.portrait, rightPortrait);
  assert.equal(dialogue.twinDialogue.right.kind, 'shout');
  assert.equal(dialogue.mechanicMode, undefined);
  assert.equal(dialogue.characterId, undefined);
  assert.equal(combat.mechanicMode, 'combat');
  assert.equal(combat.characterId, left.id);
  assert.equal(combat.combatTargetId, 'comment-editor-test-creature');
  assert.deepEqual(compactMechanicalSegmentsForStorage(segments)[0], dialogue);
  assert.deepEqual([...getCommentActorIds({ characterId: left.id, commentSegments: segments })], [left.id]);
}

async function checkSharedProseEdit(run) {
  const original = await page.evaluate(async () => {
    const comment = structuredClone(fixtureSaved[0]);
    comment.id = 'fixture-mechanical-prose';
    comment.serverValidatedMechanics = true;
    comment.skillTransaction = { transactionId: 'fixture-skill-transaction' };
    comment.commentSegments[1].skillResolution = { resolutionId: 'fixture-check', total: 14 };
    fixtureSaved.push(comment);
    await loadCommentsIntoPage();
    return comment;
  });
  const edit = page.locator('#edit-comment-overlay');
  await page.locator('#fixture-feed [data-action="open-edit-comment"][data-comment-id="fixture-mechanical-prose"]').click();
  await edit.locator('[data-edit-scope="prose"]').waitFor();
  assert.equal(await edit.locator('.cf-mode-toggle').isVisible(), false);
  assert.equal(await edit.locator('[data-comment-twin-kind]').count(), 0);
  assert.equal(await edit.locator('[data-comment-twin-avatar]').count(), 0);
  const correction = 'Warte hier. Ich prüfe zuerst die Mauer.';
  await edit.locator('textarea[data-comment-twin-side="left"]').first().fill(correction);
  await edit.locator('#ec-preview').getByText(correction, { exact: false }).waitFor();
  if (run.width === 1440) await screenshot(run, 'textbearbeitung', edit.locator('#ec-segment-list'), edit);
  await edit.locator('#ec-submit').click();
  await edit.waitFor({ state: 'hidden' });
  const { saved, editor } = await page.evaluate(() => ({
    saved: fixtureSaved.find(comment => comment.id === 'fixture-mechanical-prose'), editor: window.fixtureLastEditor
  }));
  assert.equal(editor, 'fixture-patrick');
  assert.equal(saved.createdBy, 'fixture-erdi');
  assert.deepEqual(saved.skillTransaction, original.skillTransaction);
  assert.deepEqual(saved.commentSegments.slice(1), original.commentSegments.slice(1));
  assert.deepEqual(saved.commentSegments[0], {
    ...original.commentSegments[0],
    text: `${correction}\n\nMorgen bei Flut untersuchen wir den Riegel.`,
    twinDialogue: { ...original.commentSegments[0].twinDialogue, leftLength: correction.length }
  });
}

try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 1100 : 940 }, hasTouch: width < 500, reducedMotion: 'reduce'
    });
    const run = { width, screenshots: [], pageErrors: [], badResponses: [], checks: [] };
    report.cases.push(run);
    await context.route('**/*', route => {
      const request = route.request();
      return new URL(request.url()).origin === server.origin && request.method() === 'GET' ? route.continue() : route.abort();
    });
    page = await context.newPage();
    page.on('pageerror', error => run.pageErrors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) run.badResponses.push(response.url()); });
    await page.goto(fixtureUrl);
    await page.waitForFunction(() => window.fixtureReady);
    await open('twin-origin');
    await choosePair();
    assert.equal(await rightChoice().inputValue(), right.id);
    if (width === 1440) await screenshot(run, 'figurenwahl', composer().locator('#cf-actor-heading'), cards().first());
    await voice(0, 'left').fill(texts[0]);
    await voice(0, 'right').fill(texts[1]);
    const first = cards().first();
    const leftKind = first.getByRole('combobox', { name: `${left.name} · Blasentyp` });
    const rightKind = first.getByRole('combobox', { name: `${right.name} · Blasentyp` });
    assert.deepEqual(await leftKind.locator('option').evaluateAll(options => options.map(option => option.value)),
      ['speech', 'thought', 'whisper', 'shout', 'performance', 'animal', 'foreign', 'song', 'telepathy', 'spell', 'prayer', 'flirt', 'madness']);
    await leftKind.selectOption({ label: 'Flüstern' });
    await rightKind.selectOption({ label: 'Gedanke' });
    await chooseAvatars(first);
    await preview().locator('.comment-twin-lane--left .comment-kind-whisper').waitFor({ state: 'attached' });
    await preview().locator('.comment-twin-lane--right .comment-kind-thought').waitFor({ state: 'attached' });
    await preview().locator(`.comment-twin-lane--right img[src="${rightPortrait}"]`).waitFor({ state: 'attached' });
    const editorHeights = await first.locator('textarea[data-comment-twin-side]').evaluateAll(fields => fields.map(field => field.offsetHeight));
    assert.equal(editorHeights[0], editorHeights[1]);
    await screenshot(run, 'avatarauswahl', first, first);
    await avatarPicker(first, 'left').locator('summary').click();
    await avatarPicker(first, 'right').locator('summary').click();
    await gap(1).getByRole('button', { name: '+ Handlung und Rede', exact: true }).click();
    await cards().nth(1).locator('textarea').fill(texts[2]);
    await voice(2, 'left').fill(texts[3]);
    await kind(2, 'left').selectOption('shout');
    await gap(3).locator('[data-action="insert-comment-section"]').selectOption('twins');
    await voice(3, 'right').fill(texts[4]);
    await kind(3, 'right').selectOption('whisper');
    await gap(4).locator('[data-action="insert-comment-section"]').selectOption('twins');
    assert.equal(await page.evaluate(() => buildCommentSegmentsForSave().length), 4);
    await cards().nth(4).locator('[data-action="remove-comment-segment"]').click();
    await assertWriterPortraits(first);
    await assertWriterPortraits(cards().nth(2), [left.portrait, right.portrait]);
    run.checks.push('Figurenbindung, unabhängige Blasentypen und Avatare pro Zeile, Set-Wechsel, Handlung und beide Pausenseiten');

    await screenshot(run, 'kommentieren', cards().first(), cards().first());
    await composer().locator('[data-comment-preview-maximize]').click();
    await preview().locator('.comment-twin-parallel').nth(2).waitFor();
    run.previewGeometry = await checkBubbles(preview());
    await screenshot(run, 'vorschau', composer().locator('.comment-preview-panel-head').first(), preview());
    await composer().locator('[data-comment-preview-maximize]').click();
    await composer().getByRole('checkbox', { name: 'Zwillingsmodus' }).uncheck();
    assert.equal(await voice(3, 'right').inputValue(), texts[4]);
    await composer().getByRole('checkbox', { name: 'Zwillingsmodus' }).check();
    await composer().getByRole('button', { name: 'Entwurf im Browser speichern' }).click();
    await page.reload();
    await page.waitForFunction(() => window.fixtureReady);
    await open('twin-origin');
    assert.equal(await rightChoice().inputValue(), right.id);
    assert.equal(await voice(3, 'right').inputValue(), texts[4]);
    await assertWriterPortraits(first);
    await open('twin-destination');
    await composer().getByText('Gespeicherte Entwürfe', { exact: true }).click();
    await composer().getByRole('button', { name: `Entwurf von ${left.name} laden` }).click();
    await composer().getByText('Gespeicherter Entwurf geladen.', { exact: true }).waitFor();
    await assertWriterPortraits(first);
    await avatarPicker(first, 'right').locator('summary').click();
    assert.equal(await avatarPicker(first, 'right').getByRole('combobox').inputValue(), 'alternativ');
    assert.equal(await avatarChoice(avatarPicker(first, 'right'), 0).getAttribute('aria-pressed'), 'true');
    assert.equal(await kind(0, 'right').inputValue(), 'thought');
    assert.equal(await kind(3, 'right').inputValue(), 'whisper');
    assert.equal(await voice(3, 'right').inputValue(), texts[4]);
    await cards().nth(3).getByRole('button', { name: /nach oben verschieben/ }).click();
    assert.equal(await voice(2, 'right').inputValue(), texts[4]);
    await cards().nth(2).getByRole('button', { name: /nach unten verschieben/ }).click();
    run.checks.push('Abschalten, automatischer Entwurf, gespeicherter Entwurf in anderer Szene, Verschieben als Einheit');

    await rightChoice().selectOption('');
    await composer().locator('#cf-submit').click();
    await composer().getByText('Bitte zwei verschiedene Figuren für den Zwillingsdialog auswählen.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => fixtureSaved.length), 0);
    await rightChoice().selectOption(right.id);
    await composer().locator('#cf-submit').click();
    await composer().waitFor({ state: 'hidden' });
    const stored = await page.evaluate(() => fixtureSaved[0]);
    assert.equal(stored.characterId, left.id);
    assert.equal(stored.commentSegments.length, 4);
    assert.deepEqual(stored.commentSegments.map(segment => segment.durationSeconds), [5, 5, 5, 5]);
    const { commentSegments } = buildNarrativeCommentDocument({ ...stored, metadata: stored }, 'twin-destination',
      { auth: { uid: 'twin-fixture' } }, 1);
    assert.deepEqual(commentSegments, stored.commentSegments);
    assert.equal(stored.commentSegments[3].twinDialogue.leftLength, 0);
    assert.deepEqual([stored.commentSegments[0].twinDialogue.left.imageSetId, stored.commentSegments[0].twinDialogue.right.imageSetId],
      ['standard', 'alternativ']);
    assert.equal(stored.commentSegments[3].twinDialogue.right.imageSetId, undefined);
    assert.deepEqual([...getCommentActorIds(stored)], [left.id]);
    const feed = page.locator('#fixture-feed');
    await checkBubbles(feed);
    await page.evaluate(() => { window.fixtureUserId = 'fixture-patrick'; });
    assert.equal(await feed.getByRole('button', { name: 'Bearbeiten', exact: true }).count(), 1);
    await feed.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
    const edit = page.locator('#edit-comment-overlay');
    const rightField = edit.locator('textarea[data-comment-twin-side="right"]').first();
    await rightField.waitFor();
    assert.equal(await rightField.inputValue(), texts[1]);
    const editedCard = edit.locator('#ec-segment-list .comment-segment-card').first();
    await assertWriterPortraits(editedCard);
    const editedAvatar = avatarPicker(editedCard, 'left');
    await editedAvatar.locator('summary').click();
    await avatarChoice(editedAvatar, '').click();
    await editedCard.getByRole('combobox', { name: `${left.name} · Blasentyp` }).selectOption({ label: 'Rufen' });
    await assertWriterPortraits(editedCard, [left.portrait, rightPortrait]);
    const revised = 'Morgen bei Flut untersuchen wir den Riegel.';
    await rightField.fill(revised);
    await edit.locator('#ec-preview .comment-kind-thought').getByText(revised, { exact: false }).waitFor();
    await edit.locator('#ec-submit').click();
    await edit.waitFor({ state: 'hidden' });
    await feed.getByText(revised, { exact: false }).waitFor();
    assert.equal(await feed.locator('.comment-twin-lane--left').first().locator('img.comment-portrait').getAttribute('src'), left.portrait);
    assert.equal(await feed.locator('.comment-twin-lane--right').first().locator('img.comment-portrait').getAttribute('src'), rightPortrait);
    assert.equal(await feed.locator('.comment-twin-lane--left .comment-kind-shout').first().locator('.comment-text').textContent(), texts[0]);
    assert.equal(await page.evaluate(() => fixtureSaved[0].commentSegments[3].twinDialogue.leftLength), 0);
    assert.deepEqual(await page.evaluate(() => [fixtureSaved[0].createdBy, window.fixtureLastEditor]), ['fixture-erdi', 'fixture-patrick']);
    run.checks.push('Unvollständige Bindung, Speichern, Leser, Backend-Dokumentform, Dauer und Fremdbearbeitung ohne Code');

    await checkSharedProseEdit(run);
    run.checks.push('Fremdbearbeitung eines ausgewerteten Beitrags mit unverändertem Fertigkeitsbeleg');
    if (width === 1440) {
      await checkCombat();
      run.checks.push('Realer Kampfeditor im selben Entwurf und Kampfbeitrag nur für die linke Figur');
    }
    assert.deepEqual(run.pageErrors, []);
    assert.deepEqual(run.badResponses, []);
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
