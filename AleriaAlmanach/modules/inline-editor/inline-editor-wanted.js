// Inline editor wanted-board state and builder.
// Owns only wanted-page editing behavior.

function updateInlineWantedField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.wantedField;
  if (!field) return;
  page[field] = String(input.value || '').trim();
  renderPage(currentPage, 0);
}

function addInlineWantedCard() {
  const page = getInlineDraftPage();
  if (!page) return;
  page.wanted = Array.isArray(page.wanted) ? page.wanted : [];
  page.wanted.push(createDefaultWantedCard(page.wanted.length));
  renderPage(currentPage, 0);
}

function removeInlineWantedCard(index) {
  const page = getInlineDraftPage();
  if (!page?.wanted) return;
  page.wanted.splice(index, 1);
  if (!page.wanted.length) page.wanted.push(createDefaultWantedCard(0));
  renderPage(currentPage, 0);
}

function updateInlineWantedCardField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  page.wanted = Array.isArray(page.wanted) ? page.wanted : [];
  const index = Number(input.dataset.wantedIndex || -1);
  if (index < 0) return;
  const card = page.wanted[index] || createDefaultWantedCard(index);
  const field = input.dataset.wantedCardField;
  card[field] = String(input.value || '').trim();
  page.wanted[index] = card;
}


function buildInlineWantedEditor(page) {
  const wanted = Array.isArray(page.wanted) ? page.wanted : [];
  const cards = wanted.length ? wanted : [createDefaultWantedCard(0)];
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Kopfgeldtafel</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-wanted-card">+ Ziel</button>
      </div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Hintergrundbild</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-wanted-field" data-wanted-field="wantedBackground" value="${escapeHtml(page.wantedBackground || '')}" placeholder="Imgur-Link oder Bild-URL">
        </div>
      </div>
      <div class="inline-profile-card-editor">
        ${cards.map((item, wantedIndex) => `
          <div class="inline-profile-card">
            <div class="inline-edit-head">
              <div class="inline-edit-kicker">Kopfgeld ${wantedIndex + 1}</div>
              <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-wanted-card" data-wanted-index="${wantedIndex}">Löschen</button>
            </div>
            <div class="inline-edit-grid">
              <div class="inline-edit-field wide">
                <span class="inline-edit-label">Bild</span>
                <input class="inline-edit-input" type="url" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="img" value="${escapeHtml(item.img || '')}" placeholder="Imgur-Link">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Name</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="name" value="${escapeHtml(item.name || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Rolle</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="role" value="${escapeHtml(item.role || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Status</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="status" value="${escapeHtml(item.status || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Kopfgeld</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="kopfgeld" value="${escapeHtml(item.kopfgeld || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Letzter Aufenthaltsort</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="letzter" value="${escapeHtml(item.letzter || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Externer Link</span>
                <input class="inline-edit-input" type="url" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="link" value="${escapeHtml(item.link || '')}" placeholder="https://...">
              </div>
              <div class="inline-edit-field wide">
                <span class="inline-edit-label">Bekannt</span>
                <textarea class="inline-edit-textarea" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="bekannt">${escapeHtml(item.bekannt || '')}</textarea>
              </div>
              <div class="inline-edit-field wide">
                <span class="inline-edit-label">Zitat / Einschätzung</span>
                ${buildTextFormatToolbar()}
                <textarea class="inline-edit-textarea" data-inline-action="update-wanted-card-field" data-wanted-index="${wantedIndex}" data-wanted-card-field="egon">${escapeHtml(item.egon || '')}</textarea>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}


