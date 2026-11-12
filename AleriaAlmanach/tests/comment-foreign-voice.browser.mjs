import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '../../Stammbäume/node_modules/playwright-core/index.mjs';
import { startChartQualityServer } from '../../Stammbäume/tools/chart-quality-server.mjs';
import { buildForeignVoiceFixture, FOREIGN_VOICE_FIXTURE_SOURCES } from './fixtures/comment-foreign-voice-fixture.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const avatarIds = ['boy', 'boy-2', 'boy-3', 'girl', 'girl-2', 'girl-3', 'woman', 'woman-2', 'woman-3', 'man', 'man-2', 'man-3',
  'elderly-woman', 'elderly-citizen', 'courtesan', 'servant', 'city-guard', 'knight', 'mercenary', 'robber', 'knight-2', 'mercenary-2', 'person'];
const { values: options } = parseArgs({ options: { output: { type: 'string' }, 'narrator-layout-only': { type: 'boolean', default: false } } });
const narratorLayoutOnly = options['narrator-layout-only'];
const output = resolve(root, options.output || `diagnostics/foreign-voice-expansion-20261112/browser-${Date.now()}`);
await mkdir(output, { recursive: true });
const fixturePath = resolve(output, 'fixture.html');
await writeFile(fixturePath, await buildForeignVoiceFixture());
const server = await startChartQualityServer(root);
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
async function sourceHashes() {
  const paths = [...FOREIGN_VOICE_FIXTURE_SOURCES, ...avatarIds.map(id => `public/assets/comment-foreign-voice/${id}.png`), 'public/assets/comment-icons/foreign-voice.png'];
  return Object.fromEntries(await Promise.all(paths.map(async path => [
    `AleriaAlmanach/${path}`, createHash('sha256').update(await readFile(resolve(root, 'AleriaAlmanach', path))).digest('hex')
  ])));
}
const report = { method: 'Current production forms and controllers with an isolated in-memory/localStorage persistence adapter; only loopback GET requests allowed.', output, sourceHashes: await sourceHashes(), cases: [] };
let page;

async function assertImages(container) {
  await container.locator('img').evaluateAll(async images => {
    await Promise.all(images.map(image => {
      image.loading = 'eager';
      return image.decode();
    }));
  });
  assert.deepEqual(await container.locator('img').evaluateAll(images => images.filter(image => !image.complete || !image.naturalWidth).map(image => image.src)), []);
}

async function assertNoOverflow(container, label) {
  const bounds = await container.evaluate(element => ({ width: element.clientWidth, scroll: element.scrollWidth }));
  if (bounds.scroll > bounds.width + 2) {
    report.overflows ||= [];
    report.overflows.push({ label, ...bounds, entries: await container.locator('.comment-entry, .comment-body').evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      const after = getComputedStyle(element, '::after');
      return { className: element.className, left: box.left, right: box.right, width: box.width, afterInset: after.inset, afterWidth: after.width };
    })) });
  }
  assert.ok(bounds.scroll <= bounds.width + 2, `${label}: horizontal overflow ${JSON.stringify(bounds)}`);
}

async function assertCompactAvatarGrid(row, layout, label) {
  const geometry = await row.locator('.comment-foreign-voice-avatar').evaluateAll(buttons => buttons.map(button => {
    const box = button.getBoundingClientRect();
    const parent = button.parentElement.getBoundingClientRect();
    const image = button.querySelector('img').getBoundingClientRect();
    return { top: Math.round(box.top), height: box.height, width: box.width,
      parentWidth: parent.width, imageWidth: image.width, imageHeight: image.height };
  }));
  assert.equal(geometry.length, avatarIds.length);
  const rows = new Set(geometry.map(value => value.top)).size;
  const maximumRows = Math.ceil(avatarIds.length / (layout === 'desktop' ? 5 : 3));
  assert.ok(rows >= 1 && rows <= maximumRows, `${label}: expected compact responsive avatar rows`);
  for (const value of geometry) {
    assert.ok(value.width < value.parentWidth / 2, `${label}: avatar uses full container width`);
    assert.ok(value.height <= 100, `${label}: avatar button is too tall`);
    assert.ok(value.imageWidth >= 45 && value.imageWidth <= 60 && value.imageHeight >= 45 && value.imageHeight <= 60, `${label}: avatar thumbnail size`);
  }
  return { rows, geometry };
}

function withoutClientId(segment) {
  const { clientSegmentId, ...value } = segment;
  return value;
}

async function measureNarratorEdit(page) {
  return page.evaluate(() => {
    const selectors = { form:'#edit-step-form', text:'.edit-comment-text-panel', preview:'.edit-comment-preview-panel',
      footer:'#edit-step-form > .delete-confirm-actions', name:'#ec-segment-list .comment-foreign-voice-name input',
      avatars:'#ec-segment-list .comment-foreign-voice-avatars' };
    return Object.fromEntries(Object.entries(selectors).map(([key, selector]) => {
      const element = document.querySelector(selector), box = element.getBoundingClientRect(), style = getComputedStyle(element);
      return [key, { top:box.top,bottom:box.bottom,left:box.left,right:box.right,width:box.width,height:box.height,
        scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,display:style.display,overflowY:style.overflowY,
        flex:style.flex,gridTemplateColumns:style.gridTemplateColumns }];
    }));
  });
}

async function voiceControlVisibility(row) {
  const controls=[];
  for(const target of [row.locator('.comment-foreign-voice-name input'),...await row.locator('.comment-foreign-voice-avatar').all()]){
    await target.scrollIntoViewIfNeeded();
    controls.push(await target.evaluate(element=>{
      const box=element.getBoundingClientRect(),x=box.left+box.width/2,y=box.top+box.height/2;
      const hit=document.elementFromPoint(x,y);
      return {label:element.getAttribute('data-avatar-id')||'name',top:box.top,bottom:box.bottom,
        withinViewport:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,uncovered:!!hit&&(element===hit||element.contains(hit)),
        hit:hit?`${hit.tagName}.${hit.className}`:'none'};
    }));
  }
  return controls;
}

function assertControlsUncovered(controls,label) {
  assert.equal(controls.length,avatarIds.length + 1);
  assert.ok(controls.every(value=>value.withinViewport&&value.uncovered),`${label}: edit controls are covered: ${JSON.stringify(controls.filter(value=>!value.withinViewport||!value.uncovered))}`);
}

async function narratorTypeButtonGeometry(row) {
  return row.locator('.comment-segment-type').evaluateAll(buttons=>buttons.map(button=>{
    const box=button.getBoundingClientRect(),label=button.querySelector('span'),range=document.createRange();
    range.selectNodeContents(label);
    const text=range.getBoundingClientRect();
    return {kind:button.dataset.kind,width:button.clientWidth,scroll:button.scrollWidth,left:box.left,right:box.right,labelLeft:text.left,labelRight:text.right};
  }));
}

function assertNarratorTypeLabels(labels,layout) {
  assert.equal(labels.length,3);
  assert.ok(labels.every(value=>value.scroll<=value.width+2&&value.labelLeft>=value.left-1&&value.labelRight<=value.right+1),`${layout}: narrator type labels overflow ${JSON.stringify(labels)}`);
}

async function reviewNarratorEditLayout(page, caseReport, layout) {
  await page.evaluate(async () => {
    _commentMode='narrator';
    _commentSegments=[makeCommentSegment('action','Auf dem Dorfplatz sammeln sich einige Leute.'),
      makeCommentSegment('foreignvoice','Abends schließt das Tor.',null,'left',5,COMMENT_LANGUAGE_DEFAULT,'',
        {foreignVoiceName:'Torwache im Nachtdienst',foreignVoiceAvatarId:'man-3'}),
      makeCommentSegment('secretaction','Jemand schiebt eine Nachricht unter die Tür.')];
    const commentSegments=buildCommentSegmentsForSave().map(({clientSegmentId,...segment})=>segment);
    const backend=await getCommentBackend();
    await backend.addComment(getCurrentCommentThreadId(),'Erzähler','',null,commentSegments.map(segment=>segment.text).join('\n\n'),'7777',true,
      {commentMode:'narrator',commentKind:'narrator',characterId:'',commentSegments});
    await loadCommentsIntoPage();
  });
  await page.locator('#fixture-feed').getByRole('button',{name:'Bearbeiten',exact:true}).click();
  await page.locator('#ec-code').fill('7777');
  await page.locator('#ec-code').press('Enter');
  await page.waitForFunction(()=>document.getElementById('edit-step-form').classList.contains('visible')&&_editMode==='narrator');
  const row=page.locator('#ec-segment-list .comment-segment-card').nth(1);
  await row.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  caseReport.layoutMeasurements=await measureNarratorEdit(page);
  await assertImages(row);
  await page.screenshot({path:resolve(output,`${layout}-narrator-edit-layout.png`)});
  caseReport.screenshots=[`${layout}-narrator-edit-layout.png`];
  caseReport.controls=await voiceControlVisibility(row);
  caseReport.layoutAfterScroll=await measureNarratorEdit(page);
  await writeFile(resolve(output,`${layout}-layout-measurements.json`),JSON.stringify(caseReport,null,2));
  assertControlsUncovered(caseReport.controls,layout);
  const labels=await narratorTypeButtonGeometry(row);
  caseReport.typeButtonGeometry=labels;
  assertNarratorTypeLabels(labels,layout);
  await row.locator('.comment-foreign-voice-name input').fill('Torwache der Abendstunde');
  await row.locator('[data-avatar-id="man-2"]').click();
  await page.waitForFunction(()=>document.querySelector('#ec-preview .comment-foreign-voice-speaker')?.textContent==='Torwache der Abendstunde');
  await row.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(output,`${layout}-narrator-edit-layout.png`)});
  await page.locator('#ec-submit').click();
  await page.waitForFunction(()=>!document.getElementById('edit-comment-overlay').classList.contains('active'));
  assert.equal(await page.evaluate(()=>fixtureSaved[0].commentSegments[1].foreignVoiceName),'Torwache der Abendstunde');
  caseReport.layoutOnly=true;
}

try {
  for (const [layout, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
    const errors = [], failures = [], blocked = [], blockedResourceErrors = [];
    const caseReport = { layout, viewport, voices: 5, availableAvatars: avatarIds.length, screenshots: [], errors, failures, blocked, blockedResourceErrors };
    report.cases.push(caseReport);
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === server.origin && request.method() === 'GET') return route.continue();
      blocked.push(`${request.method()} ${url.origin}${url.pathname}`);
      return route.abort();
    });
    page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() !== 'error') return;
      const item = { text: message.text(), location: message.location() };
      const requestKey = `GET ${item.location.url}`;
      // The original forms contain a historical external decorative Imgur icon.
      // Its deliberately denied fetch is recorded separately from runtime/local
      // asset failures; all newly added avatar/icon files must still decode.
      if (item.text === 'Failed to load resource: net::ERR_FAILED' && blocked.includes(requestKey)) blockedResourceErrors.push(item);
      else errors.push(item);
    });
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${server.origin}/${fixturePath.slice(root.length).replaceAll('\\', '/')}`);
    await page.waitForFunction(() => window.fixtureReady === true);
    if(narratorLayoutOnly){
      await reviewNarratorEditLayout(page,caseReport,layout);
      assert.deepEqual(errors,[],`${layout}: browser errors`);
      assert.deepEqual(failures,[],`${layout}: failed resources`);
      await context.close();
      continue;
    }
    await page.getByRole('button', { name: 'Beitrag verfassen', exact: true }).click();
    await page.locator('#cf-segment-list .comment-segment-card').waitFor();
    await page.locator('#cf-char-picker [data-id="foreign-voice-test-main"]').click();
    let main = page.locator('#cf-segment-list .comment-segment-card').first();
    await main.locator('[data-action="set-comment-segment-kind"][data-kind="foreignvoice"]').click();
    await page.waitForFunction(() => document.querySelector('#cf-preview .comment-foreign-voice-speaker')?.textContent === 'Fremde/r');
    assert.equal(await page.locator('#cf-preview img.comment-portrait').getAttribute('src'), './public/assets/comment-foreign-voice/person.png');
    assert.equal(await main.locator('[data-action="set-comment-segment-emote"]').count(), 0);
    assert.equal(await main.locator('.comment-segment-image-set-picker').count(), 0);
    assert.equal(await page.evaluate(() => _selectedCharId), 'foreign-voice-test-main');
    await main.locator('[data-action="set-comment-segment-kind"][data-kind="speech"]').click();
    await main.locator('textarea').fill('Mara fragt: Wo finde ich die Mühle?');
    await main.locator('[data-action="set-comment-segment-emote"][data-emote-index="0"]').click();
    const originalMain = await page.evaluate(() => buildCommentSegmentsForSave()[0]);

    const voices = [
      { id: 'elderly-woman', name: 'Wirtin', text: 'Geht am Dorfplatz nach links.' },
      { id: 'servant', name: 'Tom', text: 'Ich zeige Euch den Weg!' },
      { id: 'girl-2', name: 'Lina', text: 'Die Mühle steht hinter den Weiden.' },
      { id: 'man-3', name: 'Müller', text: 'Ihr seid beinahe angekommen.' },
      { id: 'person', name: '', text: 'Willkommen in unserem Dorf.' }
    ];
    for (const [index, voice] of voices.entries()) {
      await page.locator('#cf-segment-list + .comment-segment-actions [data-kind="foreignvoice"]').click();
      const row = page.locator('#cf-segment-list .comment-segment-card').nth(index + 1);
      assert.equal(await row.locator('.comment-foreign-voice-avatar').count(), avatarIds.length);
      assert.equal(await row.locator('.comment-segment-image-set-picker').count(), 0);
      assert.equal(await row.locator('[data-action="set-comment-segment-emote"]').count(), 0);
      await row.locator('textarea').fill(voice.text);
      const name = row.locator('[data-action="set-comment-segment-foreign-voice-name"]');
      await name.fill(voice.name);
      if (index === 0) {
        const availableIds = await row.locator('.comment-foreign-voice-avatar').evaluateAll(buttons => buttons.map(button => button.dataset.avatarId));
        assert.deepEqual([...availableIds].sort(), [...avatarIds].sort());
        await assertImages(row);
        caseReport.selectedAvatarVariants = [];
        for (const id of avatarIds) {
          await row.locator(`[data-avatar-id="${id}"]`).click();
          assert.equal(await row.locator(`[data-avatar-id="${id}"]`).getAttribute('aria-pressed'), 'true');
          await page.waitForFunction(id => document.querySelector('#cf-preview img.comment-portrait[alt="Wirtin"]')?.getAttribute('src') === `./public/assets/comment-foreign-voice/${id}.png`, id);
          const state = await page.evaluate(() => buildCommentSegmentsForSave()[1]);
          assert.equal(state.foreignVoiceAvatarId, id);
          assert.equal(state.portrait, `./public/assets/comment-foreign-voice/${id}.png`);
          caseReport.selectedAvatarVariants.push(id);
        }
      }
      const avatar = row.locator(`[data-avatar-id="${voice.id}"]`);
      if (index === 0) {
        await avatar.focus();
        await page.keyboard.press('Enter');
      } else await avatar.click();
      assert.equal(await row.locator(`[data-avatar-id="${voice.id}"]`).getAttribute('aria-pressed'), 'true');
    }
    await page.waitForFunction(() => document.querySelectorAll('#cf-preview .comment-kind-foreignvoice').length === 5);
    assert.deepEqual(withoutClientId(await page.evaluate(() => buildCommentSegmentsForSave()[0])), withoutClientId(originalMain));
    assert.equal(await page.evaluate(() => _selectedCharId), 'foreign-voice-test-main');
    assert.equal(await page.evaluate(() => _selectedEmoteIdx), null);
    assert.deepEqual(await page.locator('#cf-preview .comment-foreign-voice-speaker').allTextContents(), voices.map(voice => voice.name || 'Fremde/r'));
    const foreignRow = page.locator('#cf-segment-list .comment-segment-card').nth(1);
    await foreignRow.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    await assertImages(foreignRow);
    await assertNoOverflow(foreignRow, `${layout}: composer card`);
    caseReport.composerAvatarGrid = await assertCompactAvatarGrid(foreignRow, layout, `${layout}: composer avatars`);
    await page.screenshot({ path: resolve(output, `${layout}-composer.png`) });

    const blockedSelection = await page.evaluate(() => {
      const segment = _commentSegments[1];
      const before = JSON.stringify(buildCommentSegmentsForSave()[1]);
      setCommentSegmentImageSet(segment.id, 'travel');
      setCommentSegmentEmote(segment.id, '0');
      return { before, after: JSON.stringify(buildCommentSegmentsForSave()[1]) };
    });
    assert.equal(blockedSelection.after, blockedSelection.before, `${layout}: forced actor avatar events are ignored`);
    await page.evaluate(() => persistCommentDraft(true));
    const draft = await page.evaluate(() => getCommentDraftPayload());
    assert.deepEqual(draft.segments.slice(1).map(segment => [segment.foreignVoiceAvatarId, segment.foreignVoiceName]), voices.map(voice => [voice.id, voice.name]));
    await page.locator('#comment-form-overlay [data-action="close-comment-form"]').first().click();
    await page.getByRole('button', { name: 'Beitrag verfassen', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('#cf-segment-list .comment-foreign-voice-controls').length === 5);
    assert.deepEqual(withoutClientId(await page.evaluate(() => buildCommentSegmentsForSave()[0])), withoutClientId(originalMain));
    assert.deepEqual(await page.evaluate(() => buildCommentSegmentsForSave().slice(1).map(segment => [segment.foreignVoiceAvatarId, segment.foreignVoiceName])), voices.map(voice => [voice.id, voice.name]));

    await page.locator('#cf-submit').click();
    await page.waitForFunction(() => fixtureSaved.length === 1 && !isCommentFormOpen());
    let saved = await page.evaluate(() => fixtureSaved[0]);
    assert.equal(saved.characterId, 'foreign-voice-test-main');
    assert.equal(saved.charName, 'Mara Beispiel');
    assert.deepEqual(saved.commentSegments[0], Object.fromEntries(Object.entries(originalMain).filter(([key]) => key !== 'clientSegmentId')));
    assert.deepEqual(saved.commentSegments.slice(1).map(segment => [segment.foreignVoiceAvatarId, segment.foreignVoiceName]), voices.map(voice => [voice.id, voice.name]));
    await page.reload();
    await page.waitForFunction(() => window.fixtureReady === true);
    const feed = page.locator('#fixture-feed');
    assert.equal(await feed.locator('.comment-kind-foreignvoice').count(), 5);
    assert.deepEqual(await feed.locator('.comment-foreign-voice-speaker').allTextContents(), voices.map(voice => voice.name || 'Fremde/r'));
    assert.equal(await feed.locator('.comment-kind-foreignvoice [data-action="open-speaker-profile"]').count(), 0);
    await assertImages(feed);
    await assertNoOverflow(feed, `${layout}: saved feed`);
    await feed.screenshot({ path: resolve(output, `${layout}-saved.png`) });

    await feed.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
    await page.locator('#ec-code').fill('7777');
    await page.locator('#ec-code').press('Enter');
    await page.waitForFunction(() => document.getElementById('edit-step-form').classList.contains('visible'));
    assert.equal(await page.evaluate(() => _editSelectedCharId), 'foreign-voice-test-main');
    assert.deepEqual(await page.evaluate(() => buildEditCommentSegmentsForSave().slice(1).map(segment => [segment.foreignVoiceAvatarId, segment.foreignVoiceName])), voices.map(voice => [voice.id, voice.name]));
    // Exercise the edit fallback through real input/type events before reopening
    // the unchanged stored post for the actual rename-and-save sequence.
    for (let index = 0; index < 6; index++) await page.locator('#ec-segment-list .comment-segment-card').nth(index).locator('textarea').fill('');
    await page.locator('#ec-segment-list .comment-segment-card').first().locator('[data-action="set-edit-comment-segment-kind"][data-kind="foreignvoice"]').click();
    await page.waitForFunction(() => document.querySelector('#ec-preview .comment-foreign-voice-speaker')?.textContent === 'Fremde/r');
    assert.equal(await page.locator('#ec-preview img.comment-portrait').getAttribute('src'), './public/assets/comment-foreign-voice/person.png');
    await page.evaluate(() => closeEditComment());
    await feed.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
    await page.locator('#ec-code').fill('7777');
    await page.locator('#ec-code').press('Enter');
    await page.waitForFunction(() => document.getElementById('edit-step-form').classList.contains('visible'));
    const editRow = page.locator('#ec-segment-list .comment-segment-card').nth(1);
    assert.equal(await editRow.locator('.comment-foreign-voice-avatar').count(), avatarIds.length);
    assert.equal(await editRow.locator('.comment-segment-image-set-picker').count(), 0);
    const rename = editRow.locator('[data-action="set-edit-comment-segment-foreign-voice-name"]');
    await rename.fill('  Änne & <Wirtin>  ');
    await editRow.locator('[data-avatar-id="person"]').click();
    await page.waitForFunction(() => document.querySelector('#ec-preview .comment-foreign-voice-speaker')?.textContent === 'Änne & <Wirtin>');
    const editSelection = await page.evaluate(() => {
      const segment = _editCommentSegments[1];
      const before = JSON.stringify(buildEditCommentSegmentsForSave()[1]);
      setEditCommentSegmentImageSet(segment.id, 'travel');
      setEditCommentSegmentEmote(segment.id, '0');
      return { before, after: JSON.stringify(buildEditCommentSegmentsForSave()[1]) };
    });
    assert.equal(editSelection.after, editSelection.before);
    await editRow.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    await assertImages(editRow);
    await assertNoOverflow(editRow, `${layout}: edit card`);
    caseReport.editAvatarGrid = await assertCompactAvatarGrid(editRow, layout, `${layout}: edit avatars`);
    caseReport.mainEditControlVisibility=await voiceControlVisibility(editRow);
    assertControlsUncovered(caseReport.mainEditControlVisibility,`${layout}: main actor`);
    await editRow.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(output, `${layout}-edit.png`) });
    await page.locator('#ec-submit').click();
    await page.waitForFunction(() => !document.getElementById('edit-comment-overlay').classList.contains('active'));
    saved = await page.evaluate(() => fixtureSaved[0]);
    assert.equal(saved.charName, 'Mara Beispiel');
    assert.equal(saved.commentSegments[1].foreignVoiceName, 'Änne & <Wirtin>');
    assert.equal(saved.commentSegments[1].foreignVoiceAvatarId, 'person');
    assert.equal(saved.commentSegments[2].foreignVoiceName, 'Tom');
    assert.equal(saved.commentSegments[5].charName, 'Fremde/r');

    // A stored portrait, main character ID and legacy emote marker must never
    // turn an incidental voice back into the player's own portrait/profile.
    const tampered = await page.evaluate(() => {
      const document = structuredClone(fixtureSaved[0]);
      Object.assign(document.commentSegments[1], { portrait:fixtureCharacter.portrait,characterId:fixtureCharacter.id,
        foreignVoiceAvatarId:'../../main-character',
        charName:'Erzwungene Hauptfigur',charTitle:'Nicht anzeigen',emoteIndex:0,imageSetId:'travel',text:'Hallo {emote:0} noch einmal.' });
      const host=window.document.createElement('section');
      host.innerHTML=renderCommentBubble(document,0);
      const voice=host.querySelector('.comment-kind-foreignvoice').closest('.comment-entry');
      return {name:voice.querySelector('.comment-foreign-voice-speaker')?.textContent,
        images:[...voice.querySelectorAll('img.comment-portrait')].map(image=>image.getAttribute('src')),
        links:voice.querySelectorAll('[data-action="open-speaker-profile"]').length,
        text:voice.textContent};
    });
    assert.equal(tampered.name, 'Änne & <Wirtin>');
    assert.deepEqual(tampered.images, ['./public/assets/comment-foreign-voice/person.png']);
    assert.equal(tampered.links, 0);
    assert.ok(!tampered.text.includes('Nicht anzeigen'));

    // The narrator composer owns a separate mixed post. Both incidental voices
    // and secret actions must survive its normal narration, draft and edit paths.
    await page.getByRole('button', { name: 'Beitrag verfassen', exact: true }).click();
    await page.locator('#cf-segment-list .comment-segment-card').waitFor();
    await page.locator('#cf-mode-narrator').click();
    assert.equal(await page.evaluate(() => _commentMode), 'narrator');
    const narratorActions = page.locator('#cf-segment-list + .comment-segment-actions');
    assert.equal(await narratorActions.locator('[data-kind="foreignvoice"]').count(), 1);
    assert.equal(await narratorActions.locator('[data-kind="secretaction"]').count(), 1);
    await page.locator('#cf-segment-list .comment-segment-card').first().locator('textarea').fill('Auf dem Dorfplatz sammeln sich einige Leute.');
    await narratorActions.locator('[data-kind="foreignvoice"]').click();
    const narratorVoice = page.locator('#cf-segment-list .comment-segment-card').nth(1);
    await narratorVoice.locator('[data-action="set-comment-segment-foreign-voice-name"]').fill('Torwache');
    await narratorVoice.locator('[data-avatar-id="man-2"]').click();
    await narratorVoice.locator('textarea').fill('Abends schließt das Tor.');
    await narratorActions.locator('[data-kind="secretaction"]').click();
    await page.locator('#cf-segment-list .comment-segment-card').nth(2).locator('textarea').fill('Jemand schiebt eine Nachricht unter die Tür.');
    await page.waitForFunction(() => document.querySelectorAll('#cf-preview .comment-kind-secretaction').length === 1);
    const narratorSegments = await page.evaluate(() => buildCommentSegmentsForSave());
    assert.deepEqual(narratorSegments.map(segment => [segment.kind, segment.narrator]), [['action', true], ['foreignvoice', false], ['secretaction', false]]);
    assert.equal(narratorSegments[1].foreignVoiceAvatarId, 'man-2');
    assert.equal(narratorSegments[1].charName, 'Torwache');
    assert.equal(narratorSegments[2].charName, 'Unbekannte Gestalt');
    assert.equal(narratorSegments[2].characterId, '');
    assert.equal(narratorSegments[2].portrait, null);
    const secretPreview = page.locator('#cf-preview .comment-entry').filter({ has: page.locator('.comment-kind-secretaction') });
    assert.equal(await secretPreview.locator('[data-action="open-speaker-profile"]').count(), 0);
    assert.equal(await secretPreview.locator('img.comment-portrait').count(), 0);
    await page.evaluate(() => persistCommentDraft(true));
    await page.locator('#comment-form-overlay [data-action="close-comment-form"]').first().click();
    await page.getByRole('button', { name: 'Beitrag verfassen', exact: true }).click();
    await page.waitForFunction(() => _commentMode === 'narrator' && _commentSegments.length === 3);
    const restoredNarrator = await page.evaluate(() => buildCommentSegmentsForSave());
    assert.deepEqual(restoredNarrator.map(withoutClientId), narratorSegments.map(withoutClientId));
    await page.locator('#cf-segment-list .comment-segment-card').nth(1).locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(output, `${layout}-narrator-composer.png`) });
    await page.locator('#cf-submit').click();
    await page.waitForFunction(() => fixtureSaved.length === 2 && !isCommentFormOpen());
    await page.reload();
    await page.waitForFunction(() => window.fixtureReady === true);
    let narratorSaved = await page.evaluate(() => fixtureSaved[1]);
    assert.equal(narratorSaved.narrator, true);
    assert.equal(narratorSaved.commentMode, 'narrator');
    assert.equal(narratorSaved.charName, 'Erzähler');
    assert.deepEqual(narratorSaved.commentSegments.map(segment => [segment.kind, segment.narrator]), [['action', true], ['foreignvoice', false], ['secretaction', false]]);
    const narratorFeed = page.locator('#fixture-feed [data-comment-id="fixture-comment-2"]');
    const narratorSecret = narratorFeed.filter({ has: page.locator('.comment-kind-secretaction') });
    assert.equal(await narratorSecret.locator('[data-action="open-speaker-profile"]').count(), 0);
    assert.equal(await narratorSecret.locator('img.comment-portrait').count(), 0);
    const savedNarration = page.locator('#fixture-feed .comment-narrator[data-comment-id="fixture-comment-2"]');
    assert.equal(await savedNarration.count(), 1);
    assert.ok((await savedNarration.textContent()).includes('Auf dem Dorfplatz sammeln sich einige Leute.'));
    await assertImages(page.locator('#fixture-feed'));
    await assertNoOverflow(page.locator('#fixture-feed'), `${layout}: narrator saved feed`);
    await page.locator('#fixture-feed').screenshot({ path: resolve(output, `${layout}-narrator-saved.png`) });
    await narratorFeed.getByRole('button', { name: 'Bearbeiten', exact: true }).click();
    await page.locator('#ec-code').fill('7777');
    await page.locator('#ec-code').press('Enter');
    await page.waitForFunction(() => document.getElementById('edit-step-form').classList.contains('visible') && _editMode === 'narrator');
    assert.equal(await page.locator('#ec-segment-list + .comment-segment-actions [data-kind="foreignvoice"]').count(), 1);
    assert.equal(await page.locator('#ec-segment-list + .comment-segment-actions [data-kind="secretaction"]').count(), 1);
    assert.deepEqual(await page.evaluate(() => buildEditCommentSegmentsForSave().map(segment => [segment.kind, segment.narrator])), [['action', true], ['foreignvoice', false], ['secretaction', false]]);
    const narratorEditVoice = page.locator('#ec-segment-list .comment-segment-card').nth(1);
    await narratorEditVoice.locator('[data-action="set-edit-comment-segment-foreign-voice-name"]').fill('Torwache im Nachtdienst');
    await narratorEditVoice.locator('[data-avatar-id="man-3"]').click();
    await page.waitForFunction(() => document.querySelector('#ec-preview .comment-foreign-voice-speaker')?.textContent === 'Torwache im Nachtdienst');
    await narratorEditVoice.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    await assertImages(narratorEditVoice);
    caseReport.narratorEditControlVisibility=await voiceControlVisibility(narratorEditVoice);
    assertControlsUncovered(caseReport.narratorEditControlVisibility,`${layout}: narrator`);
    caseReport.narratorTypeButtonGeometry=await narratorTypeButtonGeometry(narratorEditVoice);
    assertNarratorTypeLabels(caseReport.narratorTypeButtonGeometry,layout);
    await narratorEditVoice.locator('.comment-foreign-voice-controls').scrollIntoViewIfNeeded();
    caseReport.narratorEditLayout=await measureNarratorEdit(page);
    await page.screenshot({ path: resolve(output, `${layout}-narrator-edit.png`) });
    await page.locator('#ec-submit').click();
    await page.waitForFunction(() => !document.getElementById('edit-comment-overlay').classList.contains('active'));
    narratorSaved = await page.evaluate(() => fixtureSaved[1]);
    assert.equal(narratorSaved.commentSegments[1].foreignVoiceName, 'Torwache im Nachtdienst');
    assert.equal(narratorSaved.commentSegments[1].foreignVoiceAvatarId, 'man-3');
    assert.deepEqual(narratorSaved.commentSegments.map(segment => [segment.kind, segment.narrator]), [['action', true], ['foreignvoice', false], ['secretaction', false]]);
    const tamperedSecret = await page.evaluate(() => {
      const document = structuredClone(fixtureSaved[1]);
      Object.assign(document.commentSegments[2], { portrait:fixtureCharacter.portrait,characterId:fixtureCharacter.id,
        charName:fixtureCharacter.name,charTitle:'Nicht anzeigen',emoteIndex:0,imageSetId:'travel',text:'Verbirgt {emote:0} eine Nachricht.' });
      const host=window.document.createElement('section');
      host.innerHTML=renderCommentBubble(document,0);
      const entry=host.querySelector('.comment-kind-secretaction').closest('.comment-entry');
      return {name:entry.querySelector('.comment-char-name')?.textContent,images:entry.querySelectorAll('img.comment-portrait').length,
        links:entry.querySelectorAll('[data-action="open-speaker-profile"]').length,text:entry.textContent};
    });
    assert.equal(tamperedSecret.name, 'Unbekannte Gestalt');
    assert.equal(tamperedSecret.images, 0);
    assert.equal(tamperedSecret.links, 0);
    assert.ok(!tamperedSecret.text.includes('Nicht anzeigen'));
    caseReport.narratorMixedPost = { draftRestored: true, saved: true, reloaded: true, edited: true, characterProfileLinks: 0,
      kinds: narratorSaved.commentSegments.map(segment => segment.kind) };
    assert.deepEqual(errors, [], `${layout}: browser errors`);
    assert.deepEqual(failures, [], `${layout}: failed resources`);
    Object.assign(caseReport, { screenshots: [`${layout}-composer.png`, `${layout}-saved.png`, `${layout}-edit.png`, `${layout}-narrator-composer.png`, `${layout}-narrator-saved.png`, `${layout}-narrator-edit.png`],
      tested: ['actual delegated creation and avatar/name input', `all ${avatarIds.length} silhouette choices and decoded assets`, 'all ten role variants selected through the UI', 'independent names and anonymous fallback', 'keyboard avatar selection',
        'empty create and edit previews use the anonymous silhouette', 'live preview', 'blocked forced actor-avatar events', 'local draft close/reopen', 'actual submit', 'reload readback', 'actual code-verified edit and save',
        'escaped names', 'selected main actor preserved', 'forged stored portraits and legacy emote markers', 'image decoding', 'horizontal geometry',
        'narrator mode offers foreign voices and secret actions', 'mixed narrator draft/save/reload/edit', 'anonymous narrator secret actions including forged character and emote fields'] });
    await context.close();
  }
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.error = error.stack;
  if (page && !page.isClosed()) await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  report.sourceHashesAfter = await sourceHashes();
  report.sourceStable = JSON.stringify(report.sourceHashes) === JSON.stringify(report.sourceHashesAfter);
  if (!report.sourceStable) { report.passed = false; report.error = 'Production sources changed during the browser run.'; }
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  await server.close();
  console.log(JSON.stringify({ output, passed: report.passed, cases: report.cases.length, error: report.error || null }));
  if (!report.sourceStable) throw Error(report.error);
}
