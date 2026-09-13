import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
export async function runLanguageScriptBrowser(scenario, { origin = 'http://127.0.0.1:4189', prefix = '', screenshots } = {}) {
  if (screenshots) await mkdir(screenshots, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  // All state belongs to this isolated browser context; no Firebase requests or writes.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const shot = async name => screenshots && page.screenshot({ path: `${screenshots}/${name}.png` });
  try {
    await page.goto(`${origin}${prefix}/AleriaAlmanach/AleriaAlmanach.html`);
    await page.evaluate(entryId => { openEntryById(entryId); renderPage(3, 0); }, scenario.entryId);
    await page.locator('.script-table-page').waitFor();
    assert.equal(await page.locator('.script-table-symbol').count(), 30);
    assert.equal(await page.evaluate(async family => (await document.fonts.load(`24px "${family}"`)).length > 0, scenario.family), true);
    assert.equal(await page.locator(`.script-style-${scenario.language}`).first().evaluate(el => getComputedStyle(el).letterSpacing), 'normal');
    await shot('rune-table');
    await page.evaluate(() => renderPage(1, 0));
    await page.locator('.language-page').waitFor();
    for (const label of scenario.imageLabels) {
      await page.getByRole('tab', { name: label, exact: true }).click();
      await page.locator('[data-language-layer-panel]:not([hidden]) img').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const image = document.querySelector('[data-language-layer-panel]:not([hidden]) img');
        return image?.complete && image.naturalWidth > 0;
      });
      await page.locator('[data-language-layer-panel]:not([hidden]) img').evaluate(async image => {
        try { await image.decode(); } catch (error) { throw new Error(`${image.currentSrc || image.src}: ${error.message}`); }
      });
      assert.equal(await page.getByRole('tab', { name: label, exact: true }).getAttribute('aria-selected'), 'true');
    }
    await shot('extended-characters');
    await page.evaluate(() => renderPage(2, 0));
    assert.equal(await page.locator('.name-list-name').count(), scenario.nameCount);
    if (scenario.nameGroupCounts) {
      const groups = await page.locator('.name-list-group').evaluateAll(elements => elements.map(element =>
        Array.from(element.querySelectorAll('.name-list-name'), name => name.textContent)));
      assert.deepEqual(groups.map(names => names.length), scenario.nameGroupCounts);
      groups.forEach(names => assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }))));
      await shot('names');
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('.name-list-page').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
      await shot('names-mobile');
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    for (const register of scenario.registerPages || []) {
      await page.evaluate(index => renderPage(index, 0), register.index);
      assert.equal(await page.locator('.script-table-grid').first().locator('tbody tr').count(), register.count);
      await shot(`register-${register.index + 1}`);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('.script-table-page').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
      const scroller = page.locator('.script-table-scroll').first();
      await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth; });
      assert.equal(await scroller.evaluate(el => el.scrollLeft > 0), true);
      await shot(`register-${register.index + 1}-mobile`);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.locator('#modal-overlay .modal-close').click();

    // Render real scene bubbles and controls on a local fixture using the app's loaded modules.
    await page.evaluate(scenario => {
      const fixture = document.createElement('section');
      fixture.id = 'language-script-test';
      fixture.style.cssText = 'position:fixed;inset:0;z-index:2147483647;overflow:auto;background:#f5eddc;padding:28px;box-sizing:border-box';
      const samples = [
        { id: 'foreign-rune', kind: 'foreign', language: scenario.language, text: scenario.text },
        { id: 'spell-rune', kind: 'spell', language: scenario.language, text: `**${scenario.label}**: ÄÖÜ äöü ßẞ ÁÉÍÓÚÝ 0123456789\n${scenario.tokens.join(' ')}` },
        { id: 'legacy-rune', kind: 'spell', spellFont: scenario.language, text: scenario.legacyText }
      ];
      fixture.innerHTML = `<h1>${scenario.label} · Szenenprüfung</h1>` + samples.map((sample, index) => renderCommentBubble({
        ...sample, charName: 'Prüffigur', commentKind: sample.kind, languageColor: '#315a83', _hideActions: true
      }, index)).join('');
      document.body.append(fixture);
      _commentSegments = [makeCommentSegment('foreign', samples[0].text, null, 'left', 9, scenario.language, '#315a83')];
      _manualMode = true;
      _editManualMode = true;
      fixture.insertAdjacentHTML('beforeend', `<h2>Eingabe</h2>${getCommentLanguageControls(_commentSegments[0])}`);
      updateCommentFormPreview();
      fixture.append(document.getElementById('cf-preview'));
    }, scenario);
    const fixture = page.locator('#language-script-test');
    const toggle = fixture.locator('[data-comment-id="foreign-rune"] .comment-language-toggle');
    const script = toggle.locator('.comment-language-script');
    const plain = toggle.locator('.comment-language-plain');
    await page.mouse.move(0, 0);
    assert.equal(await script.isVisible(), true);
    assert.equal(await plain.isVisible(), false);
    await toggle.hover();
    assert.equal(await plain.isVisible(), true);
    await page.mouse.move(0, 0);
    await fixture.locator('[data-comment-id="foreign-rune"] .comment-char-name').focus();
    await page.keyboard.press('Tab');
    assert.equal(await plain.isVisible(), true);
    await toggle.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await toggle.click();
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await page.evaluate(() => document.activeElement.blur());
    await page.mouse.move(0, 0);
    assert.equal(await script.isVisible(), true);
    assert.equal(await fixture.locator('[data-comment-id="legacy-rune"] .comment-language-script').innerText(), scenario.currentText);

    const shaping = await script.evaluate((element, scenario) => {
      const probe = element.cloneNode(false);
      probe.style.cssText = 'display:inline-block;font-size:32px;white-space:pre';
      element.parentNode.append(probe);
      const measure = text => { probe.textContent = text; return probe.getBoundingClientRect().width; };
      const widths = scenario.tokens.flatMap(token => [token.toLowerCase(), token.toUpperCase(), token, token[0].toLowerCase() + token[1].toUpperCase()]
        .map(input => ({ input, actual: measure(input), canonical: measure(window[scenario.api].encodeTokens([token])) })));
      probe.remove();
      return widths;
    }, scenario);
    shaping.forEach(result => assert.ok(Math.abs(result.actual - result.canonical) < 0.1, `Ligature ${result.input}: ${JSON.stringify(result)}`));

    // Actual delegated input handlers, saved segment payload, draft and both previews.
    const language = fixture.locator('[data-action="set-comment-segment-language"]');
    await language.selectOption('ogham');
    const otherLanguage = scenario.language === 'karnrith' ? 'rheunwaith' : 'karnrith';
    await language.selectOption(otherLanguage);
    assert.equal(await fixture.locator(`#cf-preview [data-comment-language="${otherLanguage}"]`).count() > 0, true);
    assert.equal(await page.evaluate(() => buildCommentSegmentsForSave()[0].text), scenario.text);
    await language.selectOption(scenario.language);
    const color = fixture.locator('[data-action="set-comment-segment-language-color"]');
    await color.fill('#246b87');
    await color.dispatchEvent('input');
    const saved = await page.evaluate(() => ({ segment: buildCommentSegmentsForSave()[0], draft: getCommentDraftPayload().segments[0] }));
    assert.equal(saved.segment.language, scenario.language);
    assert.equal(saved.segment.languageColor, '#246b87');
    assert.equal(saved.draft.text, saved.segment.text);
    assert.equal(saved.draft.language, scenario.language);
    assert.equal(saved.draft.languageColor, '#246b87');
    assert.equal(await fixture.locator(`#cf-preview [data-comment-language="${scenario.language}"]`).count() > 0, true);
    await page.evaluate(saved => {
      _editCommentSegments = [makeCommentSegment('spell', saved.text, null, 'right', 9, saved.language, saved.languageColor)];
      updateEditFormPreview();
      const fixture = document.getElementById('language-script-test');
      fixture.insertAdjacentHTML('beforeend', `<h2>Bearbeitung</h2>${getCommentLanguageControls(_editCommentSegments[0], true)}`);
      fixture.append(document.getElementById('ec-preview'));
    }, saved.segment);
    await fixture.locator('[data-action="set-edit-comment-segment-language"]').selectOption(scenario.language);
    const edited = await page.evaluate(() => buildEditCommentSegmentsForSave()[0]);
    assert.equal(edited.language, scenario.language);
    assert.equal(edited.text, saved.segment.text);
    assert.equal(edited.languageColor, '#246b87');
    assert.equal(await fixture.locator(`#ec-preview [data-comment-language="${scenario.language}"]`).count() > 0, true);
    await shot('speech-bubbles-desktop');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await fixture.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    await shot('speech-bubbles-mobile');
    assert.deepEqual(errors, []);
    console.log(`${scenario.label}: 30 runes, 3 images, ${scenario.nameCount} names, ${scenario.tokens.length * 4} ligatures, legacy codes, hover/focus/click, create/edit/draft/previews and mobile layout PASS.`);
  } finally {
    await browser.close();
  }
}
