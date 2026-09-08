import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function languageEditor() {
  const draft = { quote: 'Vorhandenes Zitat', quoteBy: 'Chronistin' };
  let refreshes = 0;
  const context = vm.createContext({
    document: { addEventListener() {} },
    escapeHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    inferModulePageType: () => 'language',
    getTrimmedFormValue: (block, selector) => (block.querySelector(selector)?.value || '').trim(),
    getInlineDraftPage: () => draft,
    scheduleInlineModuleLivePreviewRefresh: () => refreshes++
  });
  for (const name of ['language-data', 'language-module-editor', 'language-inline-editor']) {
    vm.runInContext(readFileSync(new URL(`../modules/language/${name}.js`, import.meta.url), 'utf8'), context);
  }
  return { context, draft, getRefreshes: () => refreshes };
}

test('the language form preserves, edits and deliberately clears quotes and attribution', () => {
  const { context } = languageEditor();
  for (const quote of ['<b>Worte & Welten</b>', '']) {
    const quoteBy = quote ? 'Heledd "Draig"' : '';
    const html = context.buildLanguageModuleEditorFields({ quote, quoteBy });
    // Read the actual rendered values, as the browser form collector would.
    const decode = value => value.replaceAll('&lt;', '<').replaceAll('&quot;', '"').replaceAll('&amp;', '&');
    const values = {
      '.me-language-quote': decode(html.match(/class="me-language-quote">([^]*?)<\/textarea>/)[1]),
      '.me-language-quote-by': decode(html.match(/class="me-language-quote-by"[^>]*value="([^"]*)"/)[1])
    };
    const block = {
      querySelector: selector => selector in values ? { value: values[selector] } : null,
      querySelectorAll: () => []
    };
    const collected = context.collectLanguageModuleEditorPage(block, {});
    assert.equal(collected.quote, quote);
    assert.equal(collected.quoteBy, quoteBy);
    assert.equal(collected.languagePage, true);
    values['.me-language-quote'] = 'Geändertes Zitat';
    assert.equal(context.collectLanguageModuleEditorPage(block, {}).quote, 'Geändertes Zitat');
  }
});

test('inline quote edits update only their page field and refresh the preview', () => {
  const { context, draft, getRefreshes } = languageEditor();
  for (const [name, value] of [['quote', '<i>Neue Worte</i>'], ['quoteBy', 'Neue Chronistin'], ['quote', '']]) {
    context.handleInlineLanguageField({ target: {
      closest: () => ({}), dataset: { languageInlinePageField: name }, value
    } });
    assert.equal(draft[name], value);
  }
  assert.equal(draft.quoteBy, 'Neue Chronistin');
  assert.equal(getRefreshes(), 3);
});
