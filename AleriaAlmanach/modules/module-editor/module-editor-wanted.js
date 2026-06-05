function getModuleWantedCards(page) {
  return Array.isArray(page?.wanted)
    ? page.wanted
    : [createDefaultWantedCard(0)];
}

function buildModuleWantedCardMarkup(item = createDefaultWantedCard(0), index = 0) {
  const safeItem = item && typeof item === 'object' ? item : createDefaultWantedCard(index);
  return `
    <div class="inline-profile-card module-wanted-card">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Kopfgeld ${index + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-wanted-card">Löschen</button>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <label>Bild</label>
          <input type="url" class="me-wanted-img" value="${escapeHtml(safeItem.img || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Name</label>
          <input type="text" class="me-wanted-name" value="${escapeHtml(safeItem.name || '')}">
        </div>
        <div class="module-editor-field">
          <label>Rolle</label>
          <input type="text" class="me-wanted-role" value="${escapeHtml(safeItem.role || '')}">
        </div>
        <div class="module-editor-field">
          <label>Status</label>
          <input type="text" class="me-wanted-status" value="${escapeHtml(safeItem.status || '')}">
        </div>
        <div class="module-editor-field">
          <label>Kopfgeld</label>
          <input type="text" class="me-wanted-kopfgeld" value="${escapeHtml(safeItem.kopfgeld || '')}">
        </div>
        <div class="module-editor-field">
          <label>Letzter Aufenthaltsort</label>
          <input type="text" class="me-wanted-letzter" value="${escapeHtml(safeItem.letzter || '')}">
        </div>
        <div class="module-editor-field">
          <label>Profil-Link</label>
          <input type="url" class="me-wanted-link" value="${escapeHtml(safeItem.link || '')}" placeholder="https://...">
        </div>
        <div class="module-editor-field wide">
          <label>Bekannt</label>
          <textarea class="me-wanted-bekannt small">${escapeHtml(safeItem.bekannt || '')}</textarea>
        </div>
        <div class="module-editor-field wide">
          <label>Zitat / Einschätzung</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-wanted-egon small">${escapeHtml(safeItem.egon || '')}</textarea>
        </div>
      </div>
    </div>`;
}

function renumberModuleWantedCards(pageCard) {
  Array.from(pageCard.querySelectorAll('.module-wanted-card')).forEach((wantedCard, index) => {
    const title = wantedCard.querySelector('.inline-edit-kicker');
    if (title) title.textContent = `Kopfgeld ${index + 1}`;
  });
}

function collectModuleWantedCards(card) {
  return Array.from(card.querySelectorAll('.module-wanted-card')).map((wantedCard, index) => {
    const item = {
      img: getTrimmedFormValue(wantedCard, '.me-wanted-img'),
      name: getTrimmedFormValue(wantedCard, '.me-wanted-name'),
      role: getTrimmedFormValue(wantedCard, '.me-wanted-role'),
      status: getTrimmedFormValue(wantedCard, '.me-wanted-status'),
      kopfgeld: getTrimmedFormValue(wantedCard, '.me-wanted-kopfgeld'),
      letzter: getTrimmedFormValue(wantedCard, '.me-wanted-letzter'),
      bekannt: getTrimmedFormValue(wantedCard, '.me-wanted-bekannt'),
      egon: getTrimmedFormValue(wantedCard, '.me-wanted-egon'),
      link: getTrimmedFormValue(wantedCard, '.me-wanted-link')
    };
    const hasContent = Object.values(item).some(Boolean);
    if (!hasContent) return null;
    return {
      ...item,
      name: item.name || `Gesuchter ${index + 1}`
    };
  }).filter(Boolean);
}

function addModuleWantedCard(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-wanted-card-editor');
  if (!pageCard || !wrap) return;
  const count = wrap.querySelectorAll('.module-wanted-card').length;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleWantedCardMarkup(createDefaultWantedCard(count), count));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberModuleWantedCards(pageCard);
  syncModuleJsonPreview();
}

function removeModuleWantedCard(button) {
  const pageCard = button.closest('.module-page-card');
  const card = button.closest('.module-wanted-card');
  const wrap = pageCard?.querySelector('.module-wanted-card-editor');
  if (!pageCard || !card || !wrap) return;
  card.remove();
  if (!wrap.querySelector('.module-wanted-card')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Kopfgeld-Einträge vorhanden.</div>';
  }
  renumberModuleWantedCards(pageCard);
  syncModuleJsonPreview();
}

function buildWantedModuleEditorFields(page) {
  const cards = getModuleWantedCards(page);
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'wanted' ? ' visible' : ''}" data-page-type="wanted">
        <div class="module-editor-grid single">
          <div class="module-editor-field">
            <label>Hintergrundbild</label>
            <input type="url" class="me-page-wanted-background" value="${escapeHtml(page?.wantedBackground || '')}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kopfgeld-Einträge</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-wanted-card">+ Ziel</button>
            </div>
            <div class="module-editor-help">Diese Felder erscheinen direkt auf den Wanted-Karten in der Liveansicht.</div>
            <div class="inline-profile-card-editor module-wanted-card-editor">
              ${cards.length
                ? cards.map((item, wantedIndex) => buildModuleWantedCardMarkup(item, wantedIndex)).join('')
                : '<div class="inline-placeholder-note">Noch keine Kopfgeld-Einträge vorhanden.</div>'}
            </div>
          </div>
        </div>
      </div>`;
}

function collectWantedModuleEditorPage(card, page) {
  page.wantedPage = true;
  page.wantedBackground = getTrimmedFormValue(card, '.me-page-wanted-background');
  page.wanted = collectModuleWantedCards(card);
  return page;
}
