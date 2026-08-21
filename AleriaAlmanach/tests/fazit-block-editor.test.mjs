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
  const storage = new Map();
  const nodes = {
    'fz-lines': { innerHTML: '' },
    'fz-preview': { innerHTML: '' },
    'fz-title': { value: 'Fazit' },
    'fz-primary-toolbar': { innerHTML: '' },
    'fz-commandbar': { innerHTML: '' },
    'fz-outline': { innerHTML: '' }
  };
  context.document = {
    body: { classList: { add() {}, remove() {} } },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementById(id) { return nodes[id] || null; }
  };
  context.window = {
    addEventListener() {},
    removeEventListener() {}
  };
  context.CSS = { escape: value => String(value) };
  context.setTimeout = callback => { callback(); return null; };
  context.clearTimeout = () => {};
  context.localStorage = {
    get length() { return storage.size; },
    key(index) { return Array.from(storage.keys())[index] || null; },
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); }
  };
  context.getCurrentCommentThreadId = () => 'thread-test';
  context.openIconDirectory = () => {};
  context.closeIconDirectory = () => {};
  for (const relativePath of [
    '../modules/comments/comments-fazit-history.js',
    '../modules/comments/comments-fazit-draft.js',
    '../modules/comments/comments-fazit.js',
    '../modules/comments/comments-fazit-workbench.js'
  ]) {
    vm.runInContext(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'), context);
  }
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

test('jede Fazit-Zeile erhält eine vollständige Einfügeleiste für die Position danach', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    addFazitLine('heading');
    addFazitLine('text');
    addFazitLine('list', _fazitLines[0].id);
  `, context);

  vm.runInContext(fs.readFileSync(new URL('../modules/comments/comments-action-events.js', import.meta.url), 'utf8'), context);
  vm.runInContext(`
    const insertionTrigger = {
      dataset: { action: 'add-fazit-line', lineKind: 'tokens', afterLineId: _fazitLines[0].id },
      closest() { return null; }
    };
    handleCommentFormActionClick({
      target: { closest() { return insertionTrigger; } },
      preventDefault() {}
    });
  `, context);

  const kinds = vm.runInContext('_fazitLines.map(line => line.kind)', context);
  const editorMarkup = vm.runInContext("document.getElementById('fz-lines').innerHTML", context);
  const primaryMarkup = vm.runInContext("document.getElementById('fz-primary-toolbar').innerHTML", context);

  assert.deepEqual(Array.from(kinds), ['heading', 'tokens', 'list', 'text']);
  assert.equal((editorMarkup.match(/fazit-editor-toolbar-inline/g) || []).length, 4);
  assert.equal((editorMarkup.match(/data-action="add-fazit-line"/g) || []).length, 16);
  assert.match(editorMarkup, /data-after-line-id="line-1"/);
  assert.match(editorMarkup, /Nach Abschnitt 1/);
  assert.match(primaryMarkup, /Bausteine · 4 von 100/);
});

test('erweiterte Grenzen erhalten deutlich mehr Abschnitte und Listenpunkte', () => {
  const context = loadFazitRuntime();
  const normalized = vm.runInContext(`normalizeCommentFazitItem({
    title: 'Großes Fazit',
    lines: Array.from({ length: 40 }, (_, lineIndex) => ({
      kind: 'list',
      items: Array.from({ length: 40 }, (_, itemIndex) => ({ text: 'Punkt ' + lineIndex + '-' + itemIndex }))
    }))
  })`, context);

  assert.equal(normalized.lines.length, 40);
  assert.equal(normalized.lines[0].items.length, 40);
  assert.equal(vm.runInContext('FAZIT_CONTENT_LIMITS.maxLines', context), 100);
  assert.equal(vm.runInContext('FAZIT_CONTENT_LIMITS.maxListItemsPerLine', context), 100);
});

test('Workbench rendert Gliederung, Entwurfsstatus und einklappbare Bausteine', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    addFazitLine('heading');
    updateFazitLineText(_fazitLines[0].id, 'Entscheidungen');
    addFazitLine('list');
    toggleFazitLineCollapse(_fazitLines[0].id);
  `, context);

  const commandbar = vm.runInContext("document.getElementById('fz-commandbar').innerHTML", context);
  const outline = vm.runInContext("document.getElementById('fz-outline').innerHTML", context);
  const editor = vm.runInContext("document.getElementById('fz-lines').innerHTML", context);

  assert.match(commandbar, /data-action="undo-fazit-change"/);
  assert.match(commandbar, /Entwurf gespeichert/);
  assert.match(outline, /Fazit-Gliederung|class="fazit-outline"/);
  assert.match(outline, /Entscheidungen/);
  assert.match(editor, /fazit-line-editor-heading is-collapsed/);
  assert.match(editor, /data-role="fazit-drag-handle"/);
});

test('Undo und Redo stellen Titel und Bausteinzustand wieder her', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    updateFazitTitle('Ratssitzung');
    undoFazitChange();
  `, context);
  assert.equal(vm.runInContext('_fazitTitle', context), 'Fazit');
  assert.equal(vm.runInContext("document.getElementById('fz-title').value", context), 'Fazit');

  vm.runInContext('redoFazitChange()', context);
  assert.equal(vm.runInContext('_fazitTitle', context), 'Ratssitzung');

  vm.runInContext(`
    addFazitLine('heading');
    addFazitLine('list');
    undoFazitChange();
  `, context);
  assert.equal(vm.runInContext('_fazitLines.length', context), 1);
  vm.runInContext('redoFazitChange()', context);
  assert.equal(vm.runInContext('_fazitLines.length', context), 2);
});

test('Drag-Reihenfolge wird als rückgängig machbarer Editorbefehl behandelt', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    addFazitLine('heading');
    addFazitLine('list');
    addFazitLine('text');
    moveFazitLineRelative(_fazitLines[0].id, _fazitLines[2].id, 'after');
  `, context);
  assert.deepEqual(Array.from(vm.runInContext('_fazitLines.map(line => line.kind)', context)), ['list', 'text', 'heading']);

  vm.runInContext('undoFazitChange()', context);
  assert.deepEqual(Array.from(vm.runInContext('_fazitLines.map(line => line.kind)', context)), ['heading', 'list', 'text']);
});

test('lokaler Fazit-Entwurf speichert strukturierte, noch nicht eingetragene Inhalte', () => {
  const context = loadFazitEditorRuntime();
  vm.runInContext(`
    addFazitLine('text');
    updateFazitLineText(_fazitLines[0].id, 'Nicht verlieren');
  `, context);
  const draft = vm.runInContext("readFazitDraft('thread-test', '')", context);

  assert.equal(draft.version, 1);
  assert.equal(draft.snapshot.lines[0].text, 'Nicht verlieren');
  assert.equal(draft.snapshot.title, 'Fazit');
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
