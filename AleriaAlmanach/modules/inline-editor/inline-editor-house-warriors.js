// Inline editing behavior for house-warriors pages. All mutations stay inside the
// current draft page and use the shared data contract.

function getInlineHouseWarriorsData() {
  const page = getInlineDraftPage();
  if (!page) return null;
  page.houseWarriors = HouseWarriorsData.sanitize(page.houseWarriors);
  return page.houseWarriors;
}

function updateInlineHouseWarriorsField(input, render = false) {
  const data = getInlineHouseWarriorsData();
  if (!data) return;
  data[input.dataset.houseWarriorsField] = String(input.value || '').trim();
  if (render) refreshInlineModuleLivePreview();
}

function resolveInlineHouseWarriorCard(data, input) {
  const section = input.dataset.houseWarriorSection;
  if (section === 'trainingRanks') return data.trainingRanks?.[input.dataset.houseWarriorRank] || null;
  const index = Number(input.dataset.houseWarriorIndex);
  return Number.isInteger(index) && index >= 0 ? data[section]?.[index] || null : null;
}

function updateInlineHouseWarriorCardField(input, render = false) {
  const data = getInlineHouseWarriorsData();
  const card = data && resolveInlineHouseWarriorCard(data, input);
  if (!card) return;
  card[input.dataset.houseWarriorField] = String(input.value || '').trim();
  if (render) refreshInlineModuleLivePreview();
}

function addInlineHouseWarriorCard(kind = 'knight') {
  const data = getInlineHouseWarriorsData();
  if (!data) return;
  const isMenAtArms = kind === 'man-at-arms';
  const section = isMenAtArms ? 'menAtArms' : 'knightlyClasses';
  const max = isMenAtArms ? HouseWarriorsData.limits.menAtArms : HouseWarriorsData.limits.knightlyClasses;
  if (data[section].length >= max) return;
  data[section].push(HouseWarriorsData.defaultCard(kind, data[section].length));
  renderPage(currentPage, 0);
}

function removeInlineHouseWarriorCard(kind, index) {
  const data = getInlineHouseWarriorsData();
  if (!data) return;
  const section = kind === 'man-at-arms' ? 'menAtArms' : 'knightlyClasses';
  if (data[section].length <= 1 || index < 0 || index >= data[section].length) return;
  data[section].splice(index, 1);
  renderPage(currentPage, 0);
}

function moveInlineHouseWarriorCard(kind, index, direction) {
  const data = getInlineHouseWarriorsData();
  if (!data) return;
  const section = kind === 'man-at-arms' ? 'menAtArms' : 'knightlyClasses';
  const target = index + (direction < 0 ? -1 : 1);
  if (index < 0 || target < 0 || target >= data[section].length) return;
  const [card] = data[section].splice(index, 1);
  data[section].splice(target, 0, card);
  renderPage(currentPage, 0);
}

function buildInlineHouseWarriorCard(card, options = {}) {
  const {
    section = 'knightlyClasses',
    kind = 'knight',
    index = 0,
    rank = '',
    fixed = false,
    title = 'Ritterliche Gattung'
  } = options;
  const safe = HouseWarriorsData.sanitizeCard(card, kind, index);
  const identityAttributes = section === 'trainingRanks'
    ? `data-house-warrior-section="trainingRanks" data-house-warrior-rank="${escapeHtml(rank)}"`
    : `data-house-warrior-section="${escapeHtml(section)}" data-house-warrior-index="${index}"`;
  const controls = fixed ? '' : `
      <div class="module-editor-inline">
        <button class="module-editor-mini-btn" type="button" data-inline-action="move-house-warrior-card" data-house-warrior-kind="${escapeHtml(kind)}" data-house-warrior-index="${index}" data-house-warrior-direction="-1"${index === 0 ? ' disabled' : ''}>↑</button>
        <button class="module-editor-mini-btn" type="button" data-inline-action="move-house-warrior-card" data-house-warrior-kind="${escapeHtml(kind)}" data-house-warrior-index="${index}" data-house-warrior-direction="1">↓</button>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-inline-action="remove-house-warrior-card" data-house-warrior-kind="${escapeHtml(kind)}" data-house-warrior-index="${index}">Löschen</button>
      </div>`;
  const field = (label, name, value, type = 'text', wide = false) => `
      <div class="inline-edit-field${wide ? ' wide' : ''}">
        <span class="inline-edit-label">${escapeHtml(label)}</span>
        <input class="inline-edit-input" type="${type}" data-inline-action="update-house-warrior-card-field" ${identityAttributes} data-house-warrior-field="${name}" value="${escapeHtml(value)}">
      </div>`;
  return `
    <div class="inline-profile-card">
      <div class="inline-edit-head"><div class="inline-edit-kicker">${escapeHtml(title)}${fixed ? '' : ` ${index + 1}`}</div>${controls}</div>
      <div class="inline-edit-grid">
        ${field('Bild', 'image', safe.image, 'url', true)}
        ${field('Name', 'name', safe.name)}
        ${field('Untertitel / Rang', 'subtitle', safe.subtitle)}
        ${field('Kennzeichnung', 'badge', safe.badge)}
        ${field('Aufgabe', 'duty', safe.duty)}
        ${field('Bewaffnung / Ausrüstung', 'equipment', safe.equipment)}
        ${field('Merkmal / nächster Rang', 'hallmark', safe.hallmark)}
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Kurzbeschreibung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="update-house-warrior-card-field" ${identityAttributes} data-house-warrior-field="description">${escapeHtml(safe.description)}</textarea>
        </div>
      </div>
    </div>`;
}

function buildInlineHouseWarriorsEditor(page) {
  page.houseWarriors = HouseWarriorsData.sanitize(page.houseWarriors);
  const data = page.houseWarriors;
  const metaField = (label, name, value, type = 'text', wide = false) => `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${type}" data-inline-action="update-house-warriors-field" data-house-warriors-field="${name}" value="${escapeHtml(value)}">
    </div>`;
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Hauskrieger</div>
      <div class="inline-edit-grid">
        ${metaField('Hausname', 'houseName', data.houseName)}
        ${metaField('Überschrift', 'title', data.title)}
        ${metaField('Wappen', 'crest', data.crest, 'url')}
        ${metaField('Kopfbild', 'bannerImage', data.bannerImage, 'url')}
        ${metaField('Leitspruch', 'motto', data.motto, 'text', true)}
        <div class="inline-edit-field wide"><span class="inline-edit-label">Einleitung</span>${buildTextFormatToolbar()}<textarea class="inline-edit-textarea" data-inline-action="update-house-warriors-field" data-house-warriors-field="introduction">${escapeHtml(data.introduction)}</textarea></div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head"><div><div class="inline-edit-kicker">Ritterliche Gattungen</div><div class="inline-placeholder-note">${data.knightlyClasses.length} / ${HouseWarriorsData.limits.knightlyClasses} Plätze</div></div><button class="module-editor-mini-btn" type="button" data-inline-action="add-house-warrior-card" data-house-warrior-kind="knight"${data.knightlyClasses.length >= HouseWarriorsData.limits.knightlyClasses ? ' disabled' : ''}>+ Gattung</button></div>
      <div class="inline-profile-card-editor">${data.knightlyClasses.map((card, index) => buildInlineHouseWarriorCard(card, { section: 'knightlyClasses', kind: 'knight', index, title: 'Ritterliche Gattung' })).join('')}</div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head"><div><div class="inline-edit-kicker">Page | Knappe</div><div class="inline-placeholder-note">Feste Ausbildungsstufen</div></div></div>
      <div class="inline-profile-card-editor">
        ${buildInlineHouseWarriorCard(data.trainingRanks.page, { section: 'trainingRanks', kind: 'page', rank: 'page', fixed: true, title: 'Page' })}
        ${buildInlineHouseWarriorCard(data.trainingRanks.squire, { section: 'trainingRanks', kind: 'squire', rank: 'squire', fixed: true, title: 'Knappe' })}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-head"><div><div class="inline-edit-kicker">Waffenknechte</div><div class="inline-placeholder-note">${data.menAtArms.length} / ${HouseWarriorsData.limits.menAtArms} Plätze</div></div><button class="module-editor-mini-btn" type="button" data-inline-action="add-house-warrior-card" data-house-warrior-kind="man-at-arms"${data.menAtArms.length >= HouseWarriorsData.limits.menAtArms ? ' disabled' : ''}>+ Platz</button></div>
      <div class="inline-profile-card-editor">${data.menAtArms.map((card, index) => buildInlineHouseWarriorCard(card, { section: 'menAtArms', kind: 'man-at-arms', index, title: 'Waffenknecht' })).join('')}</div>
    </div>`;
}
