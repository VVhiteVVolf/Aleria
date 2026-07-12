// Static overlay editor for the fixed house-warriors hierarchy.

function getModuleHouseWarriorListConfig(kind = 'knight') {
  return kind === 'man-at-arms'
    ? { selector: '.module-house-warrior-men', max: HouseWarriorsData.limits.menAtArms, label: 'Waffenknecht' }
    : { selector: '.module-house-warrior-knights', max: HouseWarriorsData.limits.knightlyClasses, label: 'Ritterliche Gattung' };
}

function buildModuleHouseWarriorImageOptions(options, selected) {
  return options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('');
}

function buildModuleHouseWarriorCardMarkup(card, kind = 'knight', index = 0, fixed = false) {
  const safe = HouseWarriorsData.sanitizeCard(card, kind, index);
  const label = kind === 'page' ? 'Page' : kind === 'squire' ? 'Knappe' : getModuleHouseWarriorListConfig(kind).label;
  const controls = fixed ? '' : `
        <div class="module-editor-inline module-house-warrior-card-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-house-warrior-card" data-house-warrior-direction="-1" aria-label="Nach oben verschieben">↑</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-house-warrior-card" data-house-warrior-direction="1" aria-label="Nach unten verschieben">↓</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-house-warrior-card">Löschen</button>
        </div>`;
  return `
    <div class="inline-profile-card module-house-warrior-card" data-house-warrior-kind="${escapeHtml(kind)}">
      <input type="hidden" class="me-house-warrior-id" value="${escapeHtml(safe.id)}">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker module-house-warrior-card-title">${escapeHtml(label)}${fixed ? '' : ` ${index + 1}`}</div>
        ${controls}
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field wide">
          <label>Bild</label>
          <input type="url" class="me-house-warrior-image" value="${escapeHtml(safe.image)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field">
          <label>Bilddarstellung</label>
          <select class="me-house-warrior-image-fit">${buildModuleHouseWarriorImageOptions(HouseWarriorsData.imageOptions.fits, safe.imageFit)}</select>
          <div class="module-editor-help">„Vollständig“ zeigt immer das ganze Motiv und beschneidet nichts.</div>
        </div>
        <div class="module-editor-field">
          <label>Bildformat</label>
          <select class="me-house-warrior-image-format">${buildModuleHouseWarriorImageOptions(HouseWarriorsData.imageOptions.formats, safe.imageFormat)}</select>
        </div>
        <div class="module-editor-field">
          <label>Bildausrichtung</label>
          <select class="me-house-warrior-image-position">${buildModuleHouseWarriorImageOptions(HouseWarriorsData.imageOptions.positions, safe.imagePosition)}</select>
        </div>
        <div class="module-editor-field">
          <label>Name</label>
          <input type="text" class="me-house-warrior-name" value="${escapeHtml(safe.name)}">
        </div>
        <div class="module-editor-field">
          <label>Untertitel / Rang</label>
          <input type="text" class="me-house-warrior-subtitle" value="${escapeHtml(safe.subtitle)}">
        </div>
        <div class="module-editor-field">
          <label>Kennzeichnung</label>
          <input type="text" class="me-house-warrior-badge" value="${escapeHtml(safe.badge)}" placeholder="z. B. Gattung I">
        </div>
        <div class="module-editor-field">
          <label>Aufgabe</label>
          <input type="text" class="me-house-warrior-duty" value="${escapeHtml(safe.duty)}">
        </div>
        <div class="module-editor-field">
          <label>Bewaffnung / Ausrüstung</label>
          <input type="text" class="me-house-warrior-equipment" value="${escapeHtml(safe.equipment)}">
        </div>
        <div class="module-editor-field">
          <label>Merkmal / nächster Rang</label>
          <input type="text" class="me-house-warrior-hallmark" value="${escapeHtml(safe.hallmark)}">
        </div>
        <div class="module-editor-field wide">
          <label>Kurzbeschreibung</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-house-warrior-description">${escapeHtml(safe.description)}</textarea>
        </div>
      </div>
    </div>`;
}

function collectModuleHouseWarriorCard(card, kind = 'knight', index = 0) {
  return HouseWarriorsData.sanitizeCard({
    id: getTrimmedFormValue(card, '.me-house-warrior-id'),
    name: getTrimmedFormValue(card, '.me-house-warrior-name'),
    subtitle: getTrimmedFormValue(card, '.me-house-warrior-subtitle'),
    image: getTrimmedFormValue(card, '.me-house-warrior-image'),
    imageFit: getTrimmedFormValue(card, '.me-house-warrior-image-fit'),
    imageFormat: getTrimmedFormValue(card, '.me-house-warrior-image-format'),
    imagePosition: getTrimmedFormValue(card, '.me-house-warrior-image-position'),
    badge: getTrimmedFormValue(card, '.me-house-warrior-badge'),
    description: getTrimmedFormValue(card, '.me-house-warrior-description'),
    duty: getTrimmedFormValue(card, '.me-house-warrior-duty'),
    equipment: getTrimmedFormValue(card, '.me-house-warrior-equipment'),
    hallmark: getTrimmedFormValue(card, '.me-house-warrior-hallmark')
  }, kind, index);
}

function collectModuleHouseWarriorList(pageCard, selector, kind) {
  return Array.from(pageCard.querySelectorAll(`${selector} > .module-house-warrior-card`))
    .map((card, index) => collectModuleHouseWarriorCard(card, kind, index));
}

function refreshModuleHouseWarriorList(pageCard, kind) {
  const config = getModuleHouseWarriorListConfig(kind);
  const wrap = pageCard.querySelector(config.selector);
  if (!wrap) return;
  const cards = Array.from(wrap.children).filter(child => child.classList.contains('module-house-warrior-card'));
  cards.forEach((card, index) => {
    const title = card.querySelector('.module-house-warrior-card-title');
    if (title) title.textContent = `${config.label} ${index + 1}`;
    const moveButtons = card.querySelectorAll('[data-module-editor-action="move-house-warrior-card"]');
    if (moveButtons[0]) moveButtons[0].disabled = index === 0;
    if (moveButtons[1]) moveButtons[1].disabled = index === cards.length - 1;
  });
  const addButton = pageCard.querySelector(`[data-module-editor-action="add-house-warrior-card"][data-house-warrior-kind="${kind}"]`);
  if (addButton) addButton.disabled = cards.length >= config.max;
  const count = pageCard.querySelector(`[data-house-warrior-count="${kind}"]`);
  if (count) count.textContent = `${cards.length} / ${config.max}`;
}

function addModuleHouseWarriorCard(button) {
  const pageCard = button.closest('.module-page-card');
  const kind = button.dataset.houseWarriorKind === 'man-at-arms' ? 'man-at-arms' : 'knight';
  const config = getModuleHouseWarriorListConfig(kind);
  const wrap = pageCard?.querySelector(config.selector);
  if (!pageCard || !wrap) return;
  const count = wrap.querySelectorAll(':scope > .module-house-warrior-card').length;
  if (count >= config.max) return;
  wrap.insertAdjacentHTML('beforeend', buildModuleHouseWarriorCardMarkup(HouseWarriorsData.defaultCard(kind, count), kind, count));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  refreshModuleHouseWarriorList(pageCard, kind);
  syncModuleJsonPreview();
}

function removeModuleHouseWarriorCard(button) {
  const pageCard = button.closest('.module-page-card');
  const card = button.closest('.module-house-warrior-card');
  if (!pageCard || !card) return;
  const kind = card.dataset.houseWarriorKind === 'man-at-arms' ? 'man-at-arms' : 'knight';
  const config = getModuleHouseWarriorListConfig(kind);
  const wrap = pageCard.querySelector(config.selector);
  if (!wrap || wrap.querySelectorAll(':scope > .module-house-warrior-card').length <= 1) return;
  card.remove();
  refreshModuleHouseWarriorList(pageCard, kind);
  syncModuleJsonPreview();
}

function moveModuleHouseWarriorCard(button) {
  const pageCard = button.closest('.module-page-card');
  const card = button.closest('.module-house-warrior-card');
  if (!pageCard || !card) return;
  const direction = Number(button.dataset.houseWarriorDirection) < 0 ? -1 : 1;
  const sibling = direction < 0 ? card.previousElementSibling : card.nextElementSibling;
  if (!sibling?.classList.contains('module-house-warrior-card')) return;
  if (direction < 0) card.parentElement.insertBefore(card, sibling);
  else card.parentElement.insertBefore(sibling, card);
  refreshModuleHouseWarriorList(pageCard, card.dataset.houseWarriorKind || 'knight');
  syncModuleJsonPreview();
}

function buildHouseWarriorsModuleEditorFields(page) {
  const data = HouseWarriorsData.sanitize(page?.houseWarriors);
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'house-warriors' ? ' visible' : ''}" data-page-type="house-warriors">
      <div class="module-editor-grid">
        <div class="module-editor-field"><label>Hausname</label><input class="me-house-warriors-house-name" type="text" value="${escapeHtml(data.houseName)}"></div>
        <div class="module-editor-field"><label>Überschrift</label><input class="me-house-warriors-title" type="text" value="${escapeHtml(data.title)}"></div>
        <div class="module-editor-field"><label>Wappen</label><input class="me-house-warriors-crest" type="url" value="${escapeHtml(data.crest)}" placeholder="Bild-URL"></div>
        <div class="module-editor-field"><label>Kopfbild</label><input class="me-house-warriors-banner" type="url" value="${escapeHtml(data.bannerImage)}" placeholder="Bild-URL"></div>
        <div class="module-editor-field wide"><label>Leitspruch</label><input class="me-house-warriors-motto" type="text" value="${escapeHtml(data.motto)}"></div>
        <div class="module-editor-field wide"><label>Einleitung</label>${buildTextFormatToolbar()}<textarea class="me-house-warriors-introduction">${escapeHtml(data.introduction)}</textarea></div>
      </div>

      <div class="inline-edit-head">
        <div><div class="inline-edit-kicker">Ritterliche Gattungen</div><div class="module-editor-help"><span data-house-warrior-count="knight">${data.knightlyClasses.length} / ${HouseWarriorsData.limits.knightlyClasses}</span> Plätze; die Darstellung verteilt sich automatisch auf ausgewogene Reihen.</div></div>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-warrior-card" data-house-warrior-kind="knight"${data.knightlyClasses.length >= HouseWarriorsData.limits.knightlyClasses ? ' disabled' : ''}>+ Gattung</button>
      </div>
      <div class="inline-profile-card-editor module-house-warrior-knights">
        ${data.knightlyClasses.map((card, index) => buildModuleHouseWarriorCardMarkup(card, 'knight', index)).join('')}
      </div>

      <div class="inline-edit-head"><div><div class="inline-edit-kicker">Page | Knappe</div><div class="module-editor-help">Diese beiden Ausbildungsstufen sind feste Bestandteile des Templates.</div></div></div>
      <div class="inline-profile-card-editor module-house-warrior-training">
        ${buildModuleHouseWarriorCardMarkup(data.trainingRanks.page, 'page', 0, true)}
        ${buildModuleHouseWarriorCardMarkup(data.trainingRanks.squire, 'squire', 0, true)}
      </div>

      <div class="inline-edit-head">
        <div><div class="inline-edit-kicker">Waffenknechte</div><div class="module-editor-help"><span data-house-warrior-count="man-at-arms">${data.menAtArms.length} / ${HouseWarriorsData.limits.menAtArms}</span> Plätze.</div></div>
        <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-house-warrior-card" data-house-warrior-kind="man-at-arms"${data.menAtArms.length >= HouseWarriorsData.limits.menAtArms ? ' disabled' : ''}>+ Platz</button>
      </div>
      <div class="inline-profile-card-editor module-house-warrior-men">
        ${data.menAtArms.map((card, index) => buildModuleHouseWarriorCardMarkup(card, 'man-at-arms', index)).join('')}
      </div>
    </div>`;
}

function collectHouseWarriorsModuleEditorPage(card, page) {
  const trainingCards = card.querySelectorAll('.module-house-warrior-training > .module-house-warrior-card');
  page.houseWarriorsPage = true;
  page.houseWarriors = HouseWarriorsData.sanitize({
    houseName: getTrimmedFormValue(card, '.me-house-warriors-house-name'),
    title: getTrimmedFormValue(card, '.me-house-warriors-title'),
    crest: getTrimmedFormValue(card, '.me-house-warriors-crest'),
    bannerImage: getTrimmedFormValue(card, '.me-house-warriors-banner'),
    motto: getTrimmedFormValue(card, '.me-house-warriors-motto'),
    introduction: getTrimmedFormValue(card, '.me-house-warriors-introduction'),
    knightlyClasses: collectModuleHouseWarriorList(card, '.module-house-warrior-knights', 'knight'),
    trainingRanks: {
      page: collectModuleHouseWarriorCard(trainingCards[0], 'page', 0),
      squire: collectModuleHouseWarriorCard(trainingCards[1], 'squire', 0)
    },
    menAtArms: collectModuleHouseWarriorList(card, '.module-house-warrior-men', 'man-at-arms')
  });
  return page;
}
