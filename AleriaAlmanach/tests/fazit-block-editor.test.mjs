import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function loadFazitRuntime() {
  const context = vm.createContext({
    console,
    escapeHtml,
    sanitizeImageSrc(value) {
      const source = String(value || '');
      return source.startsWith('../IconOrdner/') || source.startsWith('https://') ? escapeHtml(source) : '';
    }
  });
  for (const relativePath of [
    '../modules/comments/comments-fazit-render.js',
    '../modules/comments/comments-fazit-editor-markup.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
  return context;
}

function loadFazitEditorRuntime() {
  const context = loadFazitRuntime();
  const nodes = {
    'fz-lines': { innerHTML: '' },
    'fz-preview': { innerHTML: '' },
    'fz-title': { value: 'Fazit' }
  };
  context.document = {
    body: { classList: { add() {}, remove() {} } },
    addEventListener() {},
    querySelector() { return null; },
    getElementById(id) { return nodes[id] || null; }
  };
  context.window = {
    addEventListener() {},
    removeEventListener() {}
  };
  context.CSS = { escape: value => String(value) };
  context.openIconDirectory = () => {};
  context.closeIconDirectory = () => {};
  vm.runInContext(fs.readFileSync(new URL('../modules/comments/comments-fazit.js', import.meta.url), 'utf8'), context);
  return context;
}

test('bestehende Fazit-Zeilen bleiben rückwärtskompatibel', () => {
  const context = loadFazitRuntime();
  const normalized = vm.runInContext(`normalizeCommentFazitItem({
    title: 'Altes Fazit',
    lines: [
      { kind: 'text', text: 'Ein alter Merksatz' },
      { kind: 'tokens', tokens: [{ kind: 'symbol', icon: '../IconOrdner/Plus.png', label: 'Gewinn' }] }
    ]
  })`, context);

  assert.equal(normalized.lines[0].kind, 'text');
  assert.equal(normalized.lines[0].tone, 'note');
  assert.equal(normalized.lines[1].align, 'center');
  assert.equal(normalized.lines[1].tokens[0].size, 'medium');
  assert.equal(normalized.lines[1].tokens[0].variant, 'plain');
});

test('Überschriften, Listen und Symboloptionen werden normalisiert und begrenzt', () => {
  const context = loadFazitRuntime();
  const normalized = vm.runInContext(`normalizeCommentFazitItem({
    title: '  Ratssitzung  ',
    lines: [
      { kind: 'heading', level: 'subsection', text: '  Folgen  ' },
      { kind: 'list', style: 'check', bulletIcon: '../IconOrdner/Fazit Icons/Schlüssel.png', items: [{ id: 'a', text: '  Eid leisten  ' }, { text: '   ' }] },
      { kind: 'tokens', align: 'right', tokens: [{ kind: 'symbol', icon: '../IconOrdner/Plus.png', label: 'Bund', size: 'large', variant: 'seal', flip: true }] }
    ]
  })`, context);

  assert.equal(normalized.title, 'Ratssitzung');
  assert.equal(normalized.lines[0].level, 'subsection');
  assert.deepEqual(Array.from(normalized.lines[1].items, item => item.text), ['Eid leisten']);
  assert.equal(normalized.lines[1].bulletIcon, '../IconOrdner/Fazit Icons/Schlüssel.png');
  assert.equal(normalized.lines[2].align, 'right');
  assert.equal(normalized.lines[2].tokens[0].size, 'large');
  assert.equal(normalized.lines[2].tokens[0].variant, 'seal');
  assert.equal(normalized.lines[2].tokens[0].flip, true);
});

test('die Szenenvorschau rendert semantische Überschriften und Listen', () => {
  const context = loadFazitRuntime();
  const markup = vm.runInContext(`renderCommentFazitCard(normalizeCommentFazitItem({
    title: 'Beschlüsse',
    lines: [
      { kind: 'heading', text: 'Unmittelbare Folgen', level: 'section' },
      { kind: 'list', style: 'numbered', items: [{ text: 'Boten entsenden' }, { text: 'Tor schließen' }] },
      { kind: 'list', style: 'bullet', bulletIcon: '../IconOrdner/Fazit Icons/Schlüssel.png', items: [{ text: 'Beweis sichern' }] },
      { kind: 'tokens', align: 'left', tokens: [{ kind: 'symbol', icon: '../IconOrdner/Plus.png', label: 'Bündnis', size: 'small', variant: 'tile', flip: true }] }
    ]
  }))`, context);

  assert.match(markup, /<h3 class="fazit-line-heading/);
  assert.match(markup, /<ol class="fazit-line-list fazit-line-list-numbered">/);
  assert.match(markup, /fazit-line-list-custom-icon/);
  assert.match(markup, /class="fazit-line-list-icon"/);
  assert.match(markup, /fazit-line-align-left/);
  assert.match(markup, /fazit-token-size-small/);
  assert.match(markup, /fazit-token-variant-tile/);
  assert.match(markup, /class="is-flipped"/);
});

test('Klartext-Fallback enthält Struktur statt Inhalte zu verlieren', () => {
  const context = loadFazitRuntime();
  const plainText = vm.runInContext(`buildFazitPlainText(normalizeCommentFazitItem({
    title: 'Fazit',
    lines: [
      { kind: 'heading', text: 'Offene Punkte' },
      { kind: 'list', style: 'check', items: [{ text: 'Zeugen befragen' }] },
      { kind: 'text', text: 'Der Rat vertagt sich.', tone: 'plain' }
    ]
  }))`, context);

  assert.equal(plainText, '## Offene Punkte\n☐ Zeugen befragen\nDer Rat vertagt sich.');
});

test('Editor-Markup bietet alle neuen Aktionen ohne Inline-Handler an', () => {
  const context = loadFazitRuntime();
  const heading = vm.runInContext(`renderFazitHeadingLineEditor({ id: 'line-1', kind: 'heading', text: '', level: 'section' }, 0, 1)`, context);
  const list = vm.runInContext(`renderFazitListLineEditor({ id: 'line-2', kind: 'list', style: 'bullet', items: [{ id: 'item-1', text: '' }] }, 0, 1)`, context);

  assert.match(heading, /data-action="update-fazit-heading-level"/);
  assert.match(heading, /data-action="duplicate-fazit-line"/);
  assert.match(list, /data-action="add-fazit-list-item"/);
  assert.match(list, /data-action="move-fazit-list-item"/);
  assert.match(list, /data-action="pick-fazit-list-bullet-icon"/);
  assert.doesNotMatch(`${heading}${list}`, /onclick=|oninput=|onchange=/i);
});

test('Editor-State kombiniert, sortiert und dupliziert neue Bausteine verlustfrei', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    addFazitLine('heading');
    updateFazitLineText(_fazitLines[0].id, 'Ergebnisse');
    addFazitLine('list');
    updateFazitListItem(_fazitLines[1].id, _fazitLines[1].items[0].id, 'Gesandte entsenden');
    openFazitListBulletIconPicker(_fazitLines[1].id);
    handleFazitIconSelected({ detail: { src: '../IconOrdner/Fazit Icons/Schlüssel.png' } });
    addFazitLine('tokens');
    addFazitSymbolPresetToken(_fazitLines[2].id, 'agreement');
    updateFazitTokenSize(_fazitLines[2].id, _fazitLines[2].tokens[0].id, 'large');
    duplicateFazitLine(_fazitLines[1].id);
    moveFazitLine(_fazitLines[3].id, 'up');
  `, context);
  const payload = vm.runInContext('JSON.parse(JSON.stringify(collectFazitFormPayload()))', context);

  assert.deepEqual(Array.from(payload.lines, line => line.kind), ['heading', 'list', 'tokens', 'list']);
  assert.equal(payload.lines[1].bulletIcon, '../IconOrdner/Fazit Icons/Schlüssel.png');
  assert.equal(payload.lines[3].items[0].text, 'Gesandte entsenden');
  assert.equal(payload.lines[2].tokens[0].label, 'Abkommen');
  assert.equal(payload.lines[2].tokens[0].size, 'large');
});
