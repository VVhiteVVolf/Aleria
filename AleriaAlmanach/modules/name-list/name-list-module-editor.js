function buildNameListModuleGroupRows(groups = []) {
  return sanitizeNameListGroups(groups).map((group, index) => `
    <section class="trade-editor-item name-list-module-group-row">
      <div class="trade-editor-item-head compact">
        <div><span>Namensgruppe ${index + 1}</span><small>${group.names.length} Namen · ein Name pro Zeile</small></div>
        <div class="module-page-actions">
          <button class="module-editor-mini-btn" type="button" data-name-list-module-action="move-group" data-name-list-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-name-list-module-action="move-group" data-name-list-direction="1">Runter</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-name-list-module-action="remove-group">Löschen</button>
        </div>
      </div>
      <div class="trade-editor-grid">
        <label><span>Überschrift</span><input class="inline-edit-input me-name-list-group-label" type="text" value="${escapeHtml(group.label)}"></label>
        <label><span>Unterzeile</span><input class="inline-edit-input me-name-list-group-subtitle" type="text" value="${escapeHtml(group.subtitle)}"></label>
        <label class="wide"><span>Namen · ein Eintrag pro Zeile</span><textarea class="inline-edit-textarea me-name-list-group-names" rows="14">${escapeHtml(group.names.join('\n'))}</textarea></label>
      </div>
    </section>`).join('');
}

function buildNameListModuleEditorFields(page) {
  const data = sanitizeNameListData(page?.nameList || {});
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'name-list' ? ' visible' : ''}" data-page-type="name-list">
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <div class="module-editor-kicker">Namenslisten-Template</div>
          <div class="module-editor-help">Schlichte, bildlose Listen. Namen werden immer in normaler Schrift dargestellt; nur der Verzierungstext verwendet die gewählte Schrift.</div>
        </div>
        <div class="module-editor-field"><label>Archivzeile</label><input class="me-name-list-archive-label" type="text" value="${escapeHtml(data.archiveLabel)}"></div>
        <div class="module-editor-field"><label>Runen-Verzierung</label><input class="me-name-list-ornament" type="text" value="${escapeHtml(data.ornamentText)}"></div>
        <div class="module-editor-field"><label>Verzierungsstil</label><select class="me-name-list-ornament-style"><option value="rheunwaith"${data.ornamentStyle === 'rheunwaith' ? ' selected' : ''}>Rheunwaith</option><option value="ogham"${data.ornamentStyle === 'ogham' ? ' selected' : ''}>Ogham</option><option value="karnrith"${data.ornamentStyle === 'karnrith' ? ' selected' : ''}>Karnrith</option><option value="infernal"${data.ornamentStyle === 'infernal' ? ' selected' : ''}>Infernal · Nharazim</option><option value="futhark"${data.ornamentStyle === 'futhark' ? ' selected' : ''}>Futhark</option><option value="kanaanith"${data.ornamentStyle === 'kanaanith' ? ' selected' : ''}>Kana’anith</option><option value="plain"${data.ornamentStyle === 'plain' ? ' selected' : ''}>Normal</option></select></div>
        <div class="module-editor-field wide"><label>Einleitung</label><textarea class="me-name-list-introduction">${escapeHtml(data.introduction)}</textarea></div>
        <div class="module-editor-field wide">
          <div class="module-editor-inline" style="justify-content:space-between;"><label>Namensgruppen</label><button class="module-editor-mini-btn" type="button" data-name-list-module-action="add-group">+ Gruppe</button></div>
          <div class="trade-editor-list name-list-module-groups">${buildNameListModuleGroupRows(data.groups)}</div>
        </div>
        <div class="module-editor-field wide"><label>Fußzeile</label><input class="me-name-list-footer" type="text" value="${escapeHtml(data.footer)}"></div>
      </div>
    </div>`;
}

function collectNameListModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="name-list"]') || card;
  const groups = Array.from(block.querySelectorAll('.name-list-module-group-row')).map(row => ({
    label: getTrimmedFormValue(row, '.me-name-list-group-label'),
    subtitle: getTrimmedFormValue(row, '.me-name-list-group-subtitle'),
    names: getTrimmedFormValue(row, '.me-name-list-group-names').split(/\r?\n/)
  }));
  page.nameListPage = true;
  page.nameList = sanitizeNameListData({
    archiveLabel: getTrimmedFormValue(block, '.me-name-list-archive-label'),
    introduction: getTrimmedFormValue(block, '.me-name-list-introduction'),
    ornamentText: getTrimmedFormValue(block, '.me-name-list-ornament'),
    ornamentStyle: getTrimmedFormValue(block, '.me-name-list-ornament-style'),
    groups,
    footer: getTrimmedFormValue(block, '.me-name-list-footer')
  });
  return page;
}

function addNameListModuleGroup(button) {
  const wrap = button.closest('[data-page-type="name-list"]')?.querySelector('.name-list-module-groups');
  if (!wrap || wrap.children.length >= NAME_LIST_GROUP_LIMIT) return;
  wrap.insertAdjacentHTML('beforeend', buildNameListModuleGroupRows([{ label: 'Neue Namensgruppe', subtitle: '0 Vorschläge', names: [] }]));
  syncModuleJsonPreview();
}

function removeNameListModuleGroup(button) {
  const row = button.closest('.name-list-module-group-row');
  if (!row) return;
  if (typeof captureModuleEditorUndoSnapshot === 'function') captureModuleEditorUndoSnapshot('Namensgruppe löschen');
  row.remove();
  syncModuleJsonPreview();
}

function moveNameListModuleGroup(button) {
  const row = button.closest('.name-list-module-group-row');
  const direction = Number(button.dataset.nameListDirection || 0);
  const sibling = direction < 0 ? row?.previousElementSibling : row?.nextElementSibling;
  if (!row || !sibling) return;
  if (direction < 0) row.parentElement.insertBefore(row, sibling);
  else row.parentElement.insertBefore(sibling, row);
  syncModuleJsonPreview();
}

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-name-list-module-action]');
  if (!button?.closest?.('#module-editor-overlay')) return;
  event.preventDefault();
  const action = button.dataset.nameListModuleAction;
  if (action === 'add-group') addNameListModuleGroup(button);
  if (action === 'remove-group') removeNameListModuleGroup(button);
  if (action === 'move-group') moveNameListModuleGroup(button);
});
