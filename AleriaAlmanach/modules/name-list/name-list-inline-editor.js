function updateInlineNameListData(mutator, { rerender = false } = {}) {
  const page = getInlineDraftPage();
  if (!page) return;
  const data = sanitizeNameListData(page.nameList || {});
  mutator(data);
  page.nameListPage = true;
  page.nameList = sanitizeNameListData(data);
  if (rerender) renderPage(currentPage, 0);
  else scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineNameListGroupRows(groups = []) {
  return sanitizeNameListGroups(groups).map((group, index) => `
    <section class="trade-editor-item inline-name-list-group-row" data-name-list-group-index="${index}">
      <div class="trade-editor-item-head compact">
        <div><span>Namensgruppe ${index + 1}</span><small>${group.names.length} Namen</small></div>
        <div class="module-page-actions">
          <button class="module-editor-mini-btn" type="button" data-name-list-inline-action="move-group" data-name-list-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-name-list-inline-action="move-group" data-name-list-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-name-list-inline-action="remove-group">Löschen</button>
        </div>
      </div>
      <div class="trade-editor-grid">
        <label><span>Überschrift</span><input class="inline-edit-input" type="text" value="${escapeHtml(group.label)}" data-name-list-inline-group-field="label"></label>
        <label><span>Unterzeile</span><input class="inline-edit-input" type="text" value="${escapeHtml(group.subtitle)}" data-name-list-inline-group-field="subtitle"></label>
        <label class="wide"><span>Namen · ein Eintrag pro Zeile</span><textarea class="inline-edit-textarea" rows="14" data-name-list-inline-group-field="names">${escapeHtml(group.names.join('\n'))}</textarea></label>
      </div>
    </section>`).join('');
}

function buildInlineNameListEditor(page) {
  const data = sanitizeNameListData(page.nameList || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Namenslisten-Template</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Archivzeile</span><input class="inline-edit-input" type="text" value="${escapeHtml(data.archiveLabel)}" data-name-list-inline-field="archiveLabel"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Runen-Verzierung</span><input class="inline-edit-input" type="text" value="${escapeHtml(data.ornamentText)}" data-name-list-inline-field="ornamentText"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Verzierungsstil</span><select class="inline-edit-select" data-name-list-inline-field="ornamentStyle"><option value="rheunwaith"${data.ornamentStyle === 'rheunwaith' ? ' selected' : ''}>Rheunwaith</option><option value="ogham"${data.ornamentStyle === 'ogham' ? ' selected' : ''}>Ogham</option><option value="karnrith"${data.ornamentStyle === 'karnrith' ? ' selected' : ''}>Karnrith</option><option value="infernal"${data.ornamentStyle === 'infernal' ? ' selected' : ''}>Infernal · Nharazim</option><option value="futhark"${data.ornamentStyle === 'futhark' ? ' selected' : ''}>Futhark</option><option value="kanaanith"${data.ornamentStyle === 'kanaanith' ? ' selected' : ''}>Kana’anith</option><option value="plain"${data.ornamentStyle === 'plain' ? ' selected' : ''}>Normal</option></select></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Einleitung</span><textarea class="inline-edit-textarea" data-name-list-inline-field="introduction">${escapeHtml(data.introduction)}</textarea></div>
        <div class="inline-edit-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;"><span class="inline-edit-label">Namensgruppen</span><button class="module-editor-mini-btn" type="button" data-name-list-inline-action="add-group">+ Gruppe</button></div>
          <div class="trade-editor-list">${buildInlineNameListGroupRows(data.groups)}</div>
        </div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Fußzeile</span><input class="inline-edit-input" type="text" value="${escapeHtml(data.footer)}" data-name-list-inline-field="footer"></div>
      </div>
    </div>`;
}

function handleInlineNameListField(event) {
  const field = event.target;
  if (!field?.closest?.('.inline-module-edit-pane')) return;
  const rootField = field.dataset.nameListInlineField;
  if (rootField) {
    updateInlineNameListData(data => { data[rootField] = field.value; });
    return;
  }
  const groupField = field.dataset.nameListInlineGroupField;
  if (!groupField) return;
  const index = Number(field.closest('[data-name-list-group-index]')?.dataset.nameListGroupIndex || -1);
  if (index < 0) return;
  updateInlineNameListData(data => {
    data.groups[index][groupField] = groupField === 'names' ? field.value.split(/\r?\n/) : field.value;
  });
}

document.addEventListener('input', handleInlineNameListField);
document.addEventListener('change', handleInlineNameListField);

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-name-list-inline-action]');
  if (!button?.closest?.('.inline-module-edit-pane')) return;
  event.preventDefault();
  const action = button.dataset.nameListInlineAction;
  if (action === 'add-group') {
    updateInlineNameListData(data => {
      if (data.groups.length < NAME_LIST_GROUP_LIMIT) data.groups.push({ label: 'Neue Namensgruppe', subtitle: '0 Vorschläge', names: [] });
    }, { rerender: true });
    return;
  }
  const index = Number(button.closest('[data-name-list-group-index]')?.dataset.nameListGroupIndex || -1);
  if (index < 0) return;
  if (action === 'remove-group') {
    updateInlineNameListData(data => { data.groups.splice(index, 1); }, { rerender: true });
    return;
  }
  if (action === 'move-group') {
    const target = index + Number(button.dataset.nameListDirection || 0);
    updateInlineNameListData(data => {
      if (target < 0 || target >= data.groups.length) return;
      const [group] = data.groups.splice(index, 1);
      data.groups.splice(target, 0, group);
    }, { rerender: true });
  }
});
