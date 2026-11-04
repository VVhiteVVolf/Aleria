const SCRIPT_TABLE_EDITOR_HELP = 'Eine Zeile pro Eintrag. Spalten mit | trennen. Für | innerhalb eines Feldes \\| eingeben, für einen Backslash \\\\.';

function escapeScriptTableCell(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('|', '\\|');
}

function parseScriptTableCells(line) {
  const cells = [];
  let cell = '';
  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    const next = line[index + 1];
    if (character === '\\' && (next === '\\' || next === '|')) {
      cell += next;
      index++;
    } else if (character === '|') {
      cells.push(cell.trim());
      cell = '';
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells;
}

function formatScriptTableRows(rows = []) {
  return sanitizeScriptTableRows(rows)
    .map(row => [row.symbol, row.name, row.sound, row.meaning].map(escapeScriptTableCell).join(' | '))
    .join('\n');
}

function parseScriptTableRows(value) {
  return String(value || '').split(/\r?\n/).map(line => {
    const [symbol = '', name = '', sound = '', ...meaning] = parseScriptTableCells(line);
    return { symbol, name, sound, meaning: meaning.join(' | ') };
  });
}

function formatScriptTableSyllables(rows = []) {
  return sanitizeScriptTableSyllables(rows)
    .map(row => [row.syllable, row.meaning, row.usage].map(escapeScriptTableCell).join(' | '))
    .join('\n');
}

function parseScriptTableSyllables(value) {
  return String(value || '').split(/\r?\n/).map(line => {
    const [syllable = '', meaning = '', ...usage] = parseScriptTableCells(line);
    return { syllable, meaning, usage: usage.join(' | ') };
  });
}

function buildScriptTableStyleOptions(selected) {
  return [['rheunwaith', 'Rheunwaith'], ['ogham', 'Ogham'], ['karnrith', 'Karnrith'], ['laerelis', 'Laerelis · Lichtfluss'],
    ['infernal', 'Infernal · Nharazim'], ['futhark', 'Futhark'], ['kanaanith', 'Kana’anith'],
    ['argenti', 'Lingua Argenti'], ['stoicheia', 'Stoicheia'], ['arcane', 'Arkanes Alphabet · Alte Zunge'],
    ['tlapanui', 'Nuatlapa · Tavarua'], ['ishtaran', 'Tirghan · Ayluun'], ['plain', 'Normal']]
    .map(([value, label]) => `<option value="${value}"${selected === value ? ' selected' : ''}>${label}</option>`).join('');
}

function buildScriptTableModuleEditorFields(page) {
  const data = sanitizeScriptTableData(page?.scriptTable || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'script-table' ? ' visible' : ''}" data-page-type="script-table">
      <div class="module-editor-grid">
        <div class="module-editor-field wide"><div class="module-editor-kicker">Schriftzeichen-Tabelle</div><div class="module-editor-help">${escapeHtml(SCRIPT_TABLE_EDITOR_HELP)}</div></div>
        <div class="module-editor-field"><label>Archivzeile</label><input class="me-script-table-archive" type="text" value="${escapeHtml(data.archiveLabel)}"></div>
        <div class="module-editor-field"><label>Schriftstil</label><select class="me-script-table-style">${buildScriptTableStyleOptions(data.scriptStyle)}</select></div>
        <div class="module-editor-field"><label>Titel</label><input class="me-script-table-title" type="text" value="${escapeHtml(data.title)}"></div>
        <div class="module-editor-field"><label>Untertitel</label><input class="me-script-table-subtitle" type="text" value="${escapeHtml(data.subtitle)}"></div>
        <div class="module-editor-field wide"><label>Runen-Verzierung</label><input class="me-script-table-ornament" type="text" value="${escapeHtml(data.ornamentText)}"></div>
        <div class="module-editor-field wide"><label>Zeichentabelle</label><textarea class="me-script-table-rows" rows="18">${escapeHtml(formatScriptTableRows(data.rows))}</textarea></div>
        <div class="module-editor-field"><label>Silbentabelle Titel</label><input class="me-script-table-syllables-title" type="text" value="${escapeHtml(data.syllablesTitle)}"></div>
        <div class="module-editor-field"><label>Silbentabelle Untertitel</label><input class="me-script-table-syllables-subtitle" type="text" value="${escapeHtml(data.syllablesSubtitle)}"></div>
        <div class="module-editor-field wide"><label>Silben · Silbe | Bedeutung | Verwendung</label><textarea class="me-script-table-syllables" rows="12">${escapeHtml(formatScriptTableSyllables(data.syllables))}</textarea></div>
        <div class="module-editor-field wide"><label>Fußzeile</label><input class="me-script-table-footer" type="text" value="${escapeHtml(data.footer)}"></div>
      </div>
    </div>`;
}

function collectScriptTableModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="script-table"]') || card;
  page.scriptTablePage = true;
  page.scriptTable = sanitizeScriptTableData({
    ...sanitizeScriptTableData(page.scriptTable || {}),
    archiveLabel: getTrimmedFormValue(block, '.me-script-table-archive'),
    title: getTrimmedFormValue(block, '.me-script-table-title'),
    subtitle: getTrimmedFormValue(block, '.me-script-table-subtitle'),
    ornamentText: getTrimmedFormValue(block, '.me-script-table-ornament'),
    scriptStyle: getTrimmedFormValue(block, '.me-script-table-style'),
    rows: parseScriptTableRows(getTrimmedFormValue(block, '.me-script-table-rows')),
    syllablesTitle: getTrimmedFormValue(block, '.me-script-table-syllables-title'),
    syllablesSubtitle: getTrimmedFormValue(block, '.me-script-table-syllables-subtitle'),
    syllables: parseScriptTableSyllables(getTrimmedFormValue(block, '.me-script-table-syllables')),
    footer: getTrimmedFormValue(block, '.me-script-table-footer')
  });
  return page;
}
