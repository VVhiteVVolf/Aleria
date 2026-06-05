// Inline editor profile card state and builder.
// Owns only profile-page editing behavior.

function updateInlineProfileField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.profileField;
  if (field === 'profiles') {
    try {
      page.profiles = parseJsonTextarea(input.value || '', [], 'Charakterkarten');
      input.classList.remove('invalid');
      renderPage(currentPage, 0);
    } catch (error) {
      input.classList.add('invalid');
    }
    return;
  }
  page[field] = String(input.value || '').trim();
  renderPage(currentPage, 0);
}

function addInlineProfileCard() {
  const page = getInlineDraftPage();
  if (!page) return;
  page.profiles = Array.isArray(page.profiles) ? page.profiles : [];
  if (page.profiles.length >= 6) return;
  page.profiles.push(createDefaultProfileCard(page.profiles.length));
  renderPage(currentPage, 0);
}

function removeInlineProfileCard(index) {
  const page = getInlineDraftPage();
  if (!page?.profiles) return;
  page.profiles.splice(index, 1);
  if (!page.profiles.length) page.profiles.push(createDefaultProfileCard(0));
  renderPage(currentPage, 0);
}

function updateInlineProfileCardField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  page.profiles = Array.isArray(page.profiles) ? page.profiles : [];
  const index = Number(input.dataset.profileIndex || -1);
  if (index < 0) return;
  const card = page.profiles[index] || createDefaultProfileCard(index);
  const field = input.dataset.profileCardField;
  card[field] = String(input.value || '').trim();
  page.profiles[index] = card;
}

function addInlineProfileStat(profileIndex) {
  const page = getInlineDraftPage();
  if (!page?.profiles?.[profileIndex]) return;
  const profile = page.profiles[profileIndex];
  profile.fields = Array.isArray(profile.fields) ? profile.fields : [];
  profile.fields.push(['Neuer Reiter', 'Text']);
  renderPage(currentPage, 0);
}

function removeInlineProfileStat(profileIndex, fieldIndex) {
  const page = getInlineDraftPage();
  if (!page?.profiles?.[profileIndex]?.fields) return;
  page.profiles[profileIndex].fields.splice(fieldIndex, 1);
  renderPage(currentPage, 0);
}

function updateInlineProfileStatField(input) {
  const page = getInlineDraftPage();
  const profileIndex = Number(input.dataset.profileIndex || -1);
  const fieldIndex = Number(input.dataset.profileFieldIndex || -1);
  const slot = input.dataset.profileStatSlot;
  if (!page?.profiles?.[profileIndex] || fieldIndex < 0) return;
  const profile = page.profiles[profileIndex];
  profile.fields = Array.isArray(profile.fields) ? profile.fields : [];
  if (!profile.fields[fieldIndex]) profile.fields[fieldIndex] = ['', ''];
  profile.fields[fieldIndex][slot === 'value' ? 1 : 0] = String(input.value || '').trim();
}


function buildInlineProfileEditor(page) {
  const profiles = Array.isArray(page.profiles) ? page.profiles : [];
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Charakterprofil</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-profile-card"${profiles.length >= 6 ? ' disabled' : ''}>+ Charakter</button>
      </div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Profil-Hintergrund</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-profile-field" data-profile-field="profileBackground" value="${escapeHtml(page.profileBackground || '')}" placeholder="Imgur-Link oder Bild-URL">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Profilüberschrift</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-profile-field" data-profile-field="profileTitle" value="${escapeHtml(page.profileTitle || '')}">
        </div>
      </div>
      <div class="inline-profile-card-editor">
        ${profiles.map((profile, profileIndex) => `
          <div class="inline-profile-card">
            <div class="inline-edit-head">
              <div class="inline-edit-kicker">Charakter ${profileIndex + 1}</div>
              <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-profile-card" data-profile-index="${profileIndex}">Löschen</button>
            </div>
            <div class="inline-edit-grid">
              <div class="inline-edit-field wide">
                <span class="inline-edit-label">Bild</span>
                <input class="inline-edit-input" type="url" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="img" value="${escapeHtml(profile.img || '')}" placeholder="Imgur-Link">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Titel</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="name" value="${escapeHtml(profile.name || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Untertitel / Rolle</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="role" value="${escapeHtml(profile.role || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Reiter oben</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="banner" value="${escapeHtml(profile.banner || '')}">
              </div>
              <div class="inline-edit-field">
                <span class="inline-edit-label">Stempel</span>
                <input class="inline-edit-input" type="text" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="stamp" value="${escapeHtml(profile.stamp || '')}">
              </div>
              <div class="inline-edit-field wide">
                <span class="inline-edit-label">Text / Zitat</span>
                ${buildTextFormatToolbar()}
                <textarea class="inline-edit-textarea" data-inline-action="update-profile-card-field" data-profile-index="${profileIndex}" data-profile-card-field="note">${escapeHtml(profile.note || '')}</textarea>
              </div>
            </div>
            <div class="inline-edit-head">
              <div class="inline-edit-kicker">Reiter / Felder</div>
              <button class="module-editor-mini-btn" type="button" data-inline-action="add-profile-stat" data-profile-index="${profileIndex}">+ Reiter</button>
            </div>
            <div class="inline-stat-editor">
              ${(profile.fields || []).map(([label, value], fieldIndex) => `
                <div class="inline-stat-row">
                  <input class="inline-edit-input" type="text" data-inline-action="update-profile-stat-field" data-profile-index="${profileIndex}" data-profile-field-index="${fieldIndex}" data-profile-stat-slot="label" value="${escapeHtml(label || '')}" placeholder="Reiter">
                  <input class="inline-edit-input" type="text" data-inline-action="update-profile-stat-field" data-profile-index="${profileIndex}" data-profile-field-index="${fieldIndex}" data-profile-stat-slot="value" value="${escapeHtml(value || '')}" placeholder="Text">
                  <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-profile-stat" data-profile-index="${profileIndex}" data-profile-field-index="${fieldIndex}">Löschen</button>
                </div>`).join('') || '<div class="inline-placeholder-note">Noch keine Reiter/Felder vorhanden.</div>'}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}


