function buildModuleProfileCardMarkup(profile = createDefaultProfileCard(0), index = 0) {
  const safeProfile = profile && typeof profile === 'object' ? profile : createDefaultProfileCard(index);
  const fields = Array.isArray(safeProfile.fields) ? safeProfile.fields : [];
  return `
    <div class="inline-profile-card module-profile-card">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Charakter ${index + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-profile-card">Löschen</button>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <label>Bild</label>
          <input type="url" class="me-profile-img" value="${escapeHtml(safeProfile.img || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Titel</label>
          <input type="text" class="me-profile-name" value="${escapeHtml(safeProfile.name || '')}">
        </div>
        <div class="module-editor-field">
          <label>Untertitel / Rolle</label>
          <input type="text" class="me-profile-role" value="${escapeHtml(safeProfile.role || '')}">
        </div>
        <div class="module-editor-field">
          <label>Reiter oben</label>
          <input type="text" class="me-profile-banner" value="${escapeHtml(safeProfile.banner || '')}">
        </div>
        <div class="module-editor-field">
          <label>Stempel</label>
          <input type="text" class="me-profile-stamp" value="${escapeHtml(safeProfile.stamp || '')}">
        </div>
        <div class="module-editor-field wide">
          <label>Text / Zitat</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-profile-note">${escapeHtml(safeProfile.note || '')}</textarea>
        </div>
      </div>
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Reiter / Felder</div>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-profile-field">+ Reiter</button>
      </div>
      <div class="inline-stat-editor module-profile-fields">
        ${fields.map(([label, value]) => `
          <div class="inline-stat-row module-profile-field-row">
            <input class="inline-edit-input me-profile-field-label" type="text" value="${escapeHtml(label || '')}" placeholder="Reiter">
            <input class="inline-edit-input me-profile-field-value" type="text" value="${escapeHtml(value || '')}" placeholder="Text">
            <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-profile-field">Löschen</button>
          </div>`).join('') || '<div class="inline-placeholder-note">Noch keine Reiter/Felder vorhanden.</div>'}
      </div>
    </div>`;
}

function renumberModuleProfileCards(card) {
  const cards = Array.from(card.querySelectorAll('.module-profile-card'));
  cards.forEach((profileCard, index) => {
    const title = profileCard.querySelector('.inline-edit-kicker');
    if (title) title.textContent = `Charakter ${index + 1}`;
  });
  const addBtn = card.querySelector('.me-profile-add-btn');
  if (addBtn) addBtn.disabled = cards.length >= 6;
}

function collectModuleProfilesFromCard(card) {
  return Array.from(card.querySelectorAll('.module-profile-card')).map((profileCard, index) => {
    const fields = Array.from(profileCard.querySelectorAll('.module-profile-field-row'))
      .map(row => [
        getTrimmedFormValue(row, '.me-profile-field-label'),
        getTrimmedFormValue(row, '.me-profile-field-value')
      ])
      .filter(([label, value]) => label || value);
    return {
      img: getTrimmedFormValue(profileCard, '.me-profile-img'),
      name: getTrimmedFormValue(profileCard, '.me-profile-name') || `Charakter ${index + 1}`,
      role: getTrimmedFormValue(profileCard, '.me-profile-role'),
      banner: getTrimmedFormValue(profileCard, '.me-profile-banner'),
      stamp: getTrimmedFormValue(profileCard, '.me-profile-stamp'),
      note: getTrimmedFormValue(profileCard, '.me-profile-note'),
      fields
    };
  });
}

function addModuleProfileCard(button) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector('.module-profile-card-editor');
  if (!pageCard || !wrap) return;
  const count = wrap.querySelectorAll('.module-profile-card').length;
  if (count >= 6) return;
  wrap.insertAdjacentHTML('beforeend', buildModuleProfileCardMarkup(createDefaultProfileCard(count), count));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberModuleProfileCards(pageCard);
  syncModuleJsonPreview();
}

function removeModuleProfileCard(button) {
  const pageCard = button.closest('.module-page-card');
  const card = button.closest('.module-profile-card');
  const wrap = pageCard?.querySelector('.module-profile-card-editor');
  if (!pageCard || !card || !wrap) return;
  card.remove();
  if (!wrap.querySelector('.module-profile-card')) {
    wrap.insertAdjacentHTML('beforeend', buildModuleProfileCardMarkup(createDefaultProfileCard(0), 0));
  }
  renumberModuleProfileCards(pageCard);
  syncModuleJsonPreview();
}

function addModuleProfileField(button) {
  const profileCard = button.closest('.module-profile-card');
  const pageCard = button.closest('.module-page-card');
  const wrap = profileCard?.querySelector('.module-profile-fields');
  if (!profileCard || !wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', `
    <div class="inline-stat-row module-profile-field-row">
      <input class="inline-edit-input me-profile-field-label" type="text" value="Neuer Reiter" placeholder="Reiter">
      <input class="inline-edit-input me-profile-field-value" type="text" value="Text" placeholder="Text">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-profile-field">Löschen</button>
    </div>`);
  if (pageCard) syncModuleJsonPreview();
}

function removeModuleProfileField(button) {
  const profileCard = button.closest('.module-profile-card');
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-profile-field-row');
  const wrap = profileCard?.querySelector('.module-profile-fields');
  if (!profileCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-profile-field-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Reiter/Felder vorhanden.</div>';
  }
  if (pageCard) syncModuleJsonPreview();
}

function buildProfilesModuleEditorFields(page) {
  const profiles = Array.isArray(page?.profiles) ? page.profiles.slice(0, 6) : [];
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'profiles' ? ' visible' : ''}" data-page-type="profiles">
        <div class="module-editor-grid single">
          <div class="module-editor-field">
            <label>Profil-Hintergrund</label>
            <input type="url" class="me-page-profile-background" value="${escapeHtml(page?.profileBackground || '')}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Profilüberschrift</label>
            <input type="text" class="me-page-profile-title" value="${escapeHtml(page?.profileTitle || '')}">
          </div>
          <div class="module-editor-field">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Charakterkarten</label>
              <button class="module-editor-mini-btn me-profile-add-btn" type="button" data-module-editor-action="add-profile-card"${profiles.length >= 6 ? ' disabled' : ''}>+ Charakter</button>
            </div>
            <div class="module-editor-help">Bis zu sechs Karten. Sie skalieren in der Profilansicht automatisch nebeneinander.</div>
            <div class="inline-profile-card-editor module-profile-card-editor">
              ${(profiles.length ? profiles : [createDefaultProfileCard(0)]).map((profile, profileIndex) => buildModuleProfileCardMarkup(profile, profileIndex)).join('')}
            </div>
          </div>
        </div>
      </div>`;
}

function collectProfilesModuleEditorPage(card, page) {
  page.profilePage = true;
  page.profileBackground = getTrimmedFormValue(card, '.me-page-profile-background');
  page.profileTitle = getTrimmedFormValue(card, '.me-page-profile-title');
  page.profiles = collectModuleProfilesFromCard(card);
  return page;
}
