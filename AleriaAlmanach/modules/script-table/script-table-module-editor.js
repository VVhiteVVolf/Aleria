function formatScriptTableRows(rows = []) {
  return sanitizeScriptTableRows(rows)
    .map(row => [row.symbol, row.name, row.sound, row.meaning].join(' | '))
    .join('\n');
}

function parseScriptTableRows(value) {
  return String(value || '').split(/\r?\n/).map(line => {
    const [symbol = '', name = '', sound = '', ...meaning] = line.split('|').map(part => part.trim());
    return { symbol, name, sound, meaning: meaning.join(' | ') };
  });
}

function formatScriptTableSyllables(rows = []) {
  return sanitizeScriptTableSyllables(rows)
    .map(row => [row.syllable, row.meaning, row.usage].join(' | '))
    .join('\n');
}

function parseScriptTableSyllables(value) {
  return String(value || '').split(/\r?\n/).map(line => {
    const [syllable = '', meaning = '', ...usage] = line.split('|').map(part => part.trim());
    return { syllable, meaning, usage: usage.join(' | ') };
  });
}

function buildScriptTableStyleOptions(selected) {
  return `<option value="rheunwaith"${selected === 'rheunwaith' ? ' selected' : ''}>Rheunwaith</option><option value="ogham"${selected === 'ogham' ? ' selected' : ''}>Ogham</option><option value="karnrith"${selected === 'karnrith' ? ' selected' : ''}>Karnrith</option><option value="infernal"${selected === 'infernal' ? ' selected' : ''}>Infernal · Nharazim</option><option value="futhark"${selected === 'futhark' ? ' selected' : ''}>Futhark</option><option value="kanaanith"${selected === 'kanaanith' ? ' selected' : ''}>Kana’anith</option><option value="plain"${selected === 'plain' ? ' selected' : ''}>Normal</option>`;
}

function buildScriptTableModuleEditorFields(page) {
  const data = sanitizeScriptTableData(page?.scriptTable || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'script-table' ? ' visible' : ''}" data-page-type="script-table">
      <div class="module-editor-grid">
        <div class="module-editor-field wide"><div class="module-editor-kicker">Schriftzeichen-Tabelle</div><div class="module-editor-help">Eine Zeile pro Eintrag. Spalten mit | trennen: Zeichen | Name | Laut | Bedeutung.</div></div>
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
