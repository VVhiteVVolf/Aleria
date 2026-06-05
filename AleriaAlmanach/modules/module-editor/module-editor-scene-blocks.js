const SCENE_BLOCK_TYPE_OPTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'speech', label: 'Rede' },
  { id: 'thought', label: 'Gedanke' },
  { id: 'action', label: 'Handlung' },
  { id: 'divider', label: 'Trenner' }
];

function normalizeSceneBlockType(type) {
  const value = String(type || 'speech').trim();
  return SCENE_BLOCK_TYPE_OPTIONS.some(option => option.id === value) ? value : 'speech';
}

function isCharacterSceneBlockType(type) {
  const value = normalizeSceneBlockType(type);
  return value === 'speech' || value === 'thought';
}

function getSceneBlockTypeLabel(type) {
  return SCENE_BLOCK_TYPE_OPTIONS.find(option => option.id === normalizeSceneBlockType(type))?.label || 'Rede';
}

function createDefaultSceneBlock(type = 'speech') {
  const normalizedType = normalizeSceneBlockType(type);
  if (normalizedType === 'intro') return { type: 'intro', text: '' };
  if (normalizedType === 'action') return { type: 'action', text: '' };
  if (normalizedType === 'divider') return { type: 'divider' };
  return { type: normalizedType, side: 'left', name: '', avatar: '', text: '' };
}

function getFormValue(scope, selector) {
  const controls = Array.from(scope?.querySelectorAll?.(selector) || [])
    .filter(element => 'value' in element);
  return String(controls[0]?.value ?? '');
}

function getTrimmedFormValue(scope, selector) {
  return getFormValue(scope, selector).trim();
}

function collectSceneBlockFromCard(blockCard) {
  const type = normalizeSceneBlockType(getFormValue(blockCard, '.me-scene-block-type') || 'speech');
  if (type === 'divider') return { type: 'divider' };
  if (isCharacterSceneBlockType(type)) {
    return {
      type,
      side: getFormValue(blockCard, '.me-scene-block-side') || 'left',
      name: getTrimmedFormValue(blockCard, '.me-scene-block-name'),
      avatar: getTrimmedFormValue(blockCard, '.me-scene-block-avatar'),
      text: getTrimmedFormValue(blockCard, '.me-scene-block-text'),
    };
  }
  return {
    type,
    text: getTrimmedFormValue(blockCard, '.me-scene-block-text'),
  };
}

function collectSceneBlocksFromCard(card) {
  const blocks = Array.from(card.querySelectorAll('.module-scene-blocks > .module-scene-block-card:not(.module-comment-block-card)')).map(collectSceneBlockFromCard);
  return sanitizeSceneBlocks(blocks);
}

function getSceneSpeakerKey(name) {
  return normalizeSearchText(name || '');
}

function getSceneSpeakersFromBlocks(blocks = []) {
  const speakers = [];
  const seen = new Set();
  (Array.isArray(blocks) ? blocks : []).forEach(block => {
    if (!isCharacterSceneBlockType(block?.type)) return;
    const name = String(block?.name || '').trim();
    const key = getSceneSpeakerKey(name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    speakers.push({ key, name });
  });
  return speakers;
}

function buildSceneSpeakerOptions(blocks = []) {
  const speakers = getSceneSpeakersFromBlocks(blocks);
  if (!speakers.length) return '<option value="">Noch keine Sprecher</option>';
  return [
    '<option value="">Sprecher auswählen</option>',
    ...speakers.map(speaker => `<option value="${escapeHtml(speaker.key)}">${escapeHtml(speaker.name)}</option>`)
  ].join('');
}

function buildModuleSceneBlockMarkup(block, index) {
  const safeBlock = block && typeof block === 'object' ? block : createDefaultSceneBlock('speech');
  const type = normalizeSceneBlockType(safeBlock.type || 'speech');
  const isCharacterBlock = isCharacterSceneBlockType(type);
  const selectedCharacter = isCharacterBlock
    ? findModuleEditorCharacterMatch({ name: safeBlock.name, avatar: safeBlock.avatar })
    : null;

  return `
    <div class="module-scene-block-card">
      <div class="module-scene-block-head">
        <div class="module-scene-block-title">Block ${index + 1}</div>
        <div class="module-scene-block-actions">
          <button class="module-editor-mini-btn module-editor-drag-handle" type="button" title="Block ziehen">⋮⋮</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-scene-speech" data-scene-side="left">+ Links</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-scene-speech" data-scene-side="right">+ Rechts</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-scene-thought">+ Gedanke</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-scene-action">+ Handlung</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-scene-block" data-scene-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-scene-block" data-scene-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-scene-block">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-scene-block">Löschen</button>
        </div>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Blocktyp</label>
          <select class="me-scene-block-type" data-module-editor-action="update-scene-block-type">
            <option value="intro"${type === 'intro' ? ' selected' : ''}>Intro</option>
            <option value="speech"${type === 'speech' ? ' selected' : ''}>Rede</option>
            <option value="thought"${type === 'thought' ? ' selected' : ''}>Gedanke</option>
            <option value="action"${type === 'action' ? ' selected' : ''}>Handlung</option>
            <option value="divider"${type === 'divider' ? ' selected' : ''}>Trenner</option>
          </select>
        </div>
        <div class="module-editor-field module-scene-block-section${isCharacterBlock ? ' visible' : ''}" data-scene-role="character">
          <label>Seite</label>
          <select class="me-scene-block-side">
            <option value="left"${(safeBlock.side || 'left') === 'left' ? ' selected' : ''}>Links</option>
            <option value="right"${safeBlock.side === 'right' ? ' selected' : ''}>Rechts</option>
          </select>
        </div>
        <div class="module-editor-field wide module-scene-block-section${isCharacterBlock ? ' visible' : ''}" data-scene-role="character">
          <label>Figur aus Almanach</label>
          <select class="me-scene-block-character-preset" data-module-editor-action="apply-scene-speech-preset">
            ${buildModuleCharacterOptions(selectedCharacter?.id || '', '— Sprecher frei eingeben —')}
          </select>
        </div>
        <div class="module-editor-field module-scene-block-section${isCharacterBlock ? ' visible' : ''}" data-scene-role="character">
          <label>Name</label>
          <input type="text" class="me-scene-block-name" value="${escapeHtml(safeBlock.name || '')}">
        </div>
        <div class="module-editor-field module-scene-block-section${isCharacterBlock ? ' visible' : ''}" data-scene-role="character">
          <label>Avatar-URL</label>
          <input type="url" class="me-scene-block-avatar" value="${escapeHtml(safeBlock.avatar || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field wide module-scene-block-section${type !== 'divider' ? ' visible' : ''}" data-scene-role="text">
          <label>Text</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-scene-block-text"${type === 'divider' ? ' disabled' : ''}>${escapeHtml(safeBlock.text || '')}</textarea>
        </div>
      </div>
    </div>`;
}

function renumberModuleSceneBlocks(card) {
  const blocks = Array.from(card.querySelectorAll('.module-scene-blocks > .module-scene-block-card:not(.module-comment-block-card)'));
  blocks.forEach((blockCard, index) => {
    const title = blockCard.querySelector('.module-scene-block-title');
    const type = normalizeSceneBlockType(blockCard.querySelector('.me-scene-block-type')?.value || 'speech');
    if (!title) return;
    if (isCharacterSceneBlockType(type)) {
      const side = (blockCard.querySelector('.me-scene-block-side')?.value || 'left') === 'right' ? 'Rechts' : 'Links';
      const name = blockCard.querySelector('.me-scene-block-name')?.value.trim() || '';
      title.innerHTML = `${getSceneBlockTypeLabel(type)} <strong>${index + 1}</strong> · ${side}${name ? ` · ${escapeHtml(name)}` : ''}`;
      return;
    }
    if (type === 'intro') {
      title.innerHTML = `Intro <strong>${index + 1}</strong>`;
      return;
    }
    if (type === 'action') {
      title.innerHTML = `Handlung <strong>${index + 1}</strong>`;
      return;
    }
    title.innerHTML = `Trenner <strong>${index + 1}</strong>`;
  });
  const sourceSelect = card?.querySelector?.('.me-scene-replace-source');
  if (sourceSelect) {
    const current = sourceSelect.value;
    sourceSelect.innerHTML = buildSceneSpeakerOptions(collectSceneBlocksFromCard(card));
    if (Array.from(sourceSelect.options).some(option => option.value === current)) sourceSelect.value = current;
  }
}

function addModuleSceneBlock(button, type = 'speech') {
  const field = button.closest('.module-editor-field');
  const wrap = field?.querySelector('.module-scene-blocks');
  if (!wrap) return;
  wrap.insertAdjacentHTML('beforeend', buildModuleSceneBlockMarkup(createDefaultSceneBlock(type), wrap.querySelectorAll('.module-scene-block-card').length));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberModuleSceneBlocks(field.closest('.module-page-card'));
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function insertModuleSceneSpeech(button, side = 'left') {
  const blockCard = button.closest('.module-scene-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  const current = collectSceneBlockFromCard(blockCard);
  const next = createDefaultSceneBlock('speech');
  if (isCharacterSceneBlockType(current.type)) {
    next.name = current.name || '';
    next.avatar = current.avatar || '';
  }
  next.side = side === 'right' ? 'right' : 'left';
  blockCard.insertAdjacentHTML('afterend', buildModuleSceneBlockMarkup(next, 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleSceneBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function insertModuleSceneThought(button) {
  const blockCard = button.closest('.module-scene-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  const current = collectSceneBlockFromCard(blockCard);
  const next = createDefaultSceneBlock('thought');
  if (isCharacterSceneBlockType(current.type)) {
    next.name = current.name || '';
    next.avatar = current.avatar || '';
    next.side = current.side === 'right' ? 'right' : 'left';
  }
  blockCard.insertAdjacentHTML('afterend', buildModuleSceneBlockMarkup(next, 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleSceneBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function insertModuleSceneAction(button) {
  const blockCard = button.closest('.module-scene-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  blockCard.insertAdjacentHTML('afterend', buildModuleSceneBlockMarkup(createDefaultSceneBlock('action'), 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleSceneBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function duplicateModuleSceneBlock(button) {
  const blockCard = button.closest('.module-scene-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  const block = collectSceneBlockFromCard(blockCard);
  blockCard.insertAdjacentHTML('afterend', buildModuleSceneBlockMarkup(block, 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleSceneBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function moveModuleSceneBlock(button, direction) {
  const blockCard = button.closest('.module-scene-block-card');
  const wrap = button.closest('.module-scene-blocks');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !wrap || !pageCard) return;
  if (direction < 0 && blockCard.previousElementSibling) {
    wrap.insertBefore(blockCard, blockCard.previousElementSibling);
  } else if (direction > 0 && blockCard.nextElementSibling) {
    wrap.insertBefore(blockCard.nextElementSibling, blockCard);
  }
  renumberModuleSceneBlocks(pageCard);
  syncModuleJsonPreview();
}

function removeModuleSceneBlock(button) {
  const blockCard = button.closest('.module-scene-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  blockCard.remove();
  renumberModuleSceneBlocks(pageCard);
  syncModuleJsonPreview();
}

function replaceModuleSceneSpeaker(button) {
  const pageCard = button.closest('.module-page-card');
  if (!pageCard) return;
  const sourceKey = String(pageCard.querySelector('.me-scene-replace-source')?.value || '').trim();
  const targetId = String(pageCard.querySelector('.me-scene-replace-target')?.value || '').trim();
  if (!sourceKey || !targetId) return;
  const target = getAllCharacterRecords().find(char => String(char?.id || '').trim() === targetId);
  if (!target) return;
  const targetName = String(target.name || '').trim();
  const targetAvatar = getModuleCharacterRecordPortrait(target);
  if (!targetName) return;
  pageCard.querySelectorAll('.module-scene-block-card').forEach(blockCard => {
    const type = normalizeSceneBlockType(blockCard.querySelector('.me-scene-block-type')?.value || 'speech');
    if (!isCharacterSceneBlockType(type)) return;
    const nameInput = blockCard.querySelector('.me-scene-block-name');
    const avatarInput = blockCard.querySelector('.me-scene-block-avatar');
    if (getSceneSpeakerKey(nameInput?.value || '') !== sourceKey) return;
    if (nameInput) nameInput.value = targetName;
    if (avatarInput) avatarInput.value = targetAvatar;
  });
  renumberModuleSceneBlocks(pageCard);
  syncModuleJsonPreview();
}

function updateModuleSceneBlockType(selectEl) {
  const blockCard = selectEl.closest('.module-scene-block-card');
  if (!blockCard) return;
  const type = normalizeSceneBlockType(selectEl.value || 'speech');
  blockCard.querySelectorAll('.module-scene-block-section').forEach(section => {
    const role = section.dataset.sceneRole;
    const visible = role === 'character' ? isCharacterSceneBlockType(type) : role === 'text' ? type !== 'divider' : false;
    section.classList.toggle('visible', visible);
  });
  const textArea = blockCard.querySelector('.me-scene-block-text');
  if (textArea) textArea.disabled = type === 'divider';
  renumberModuleSceneBlocks(blockCard.closest('.module-page-card'));
  syncModuleJsonPreview();
}

function buildSceneModuleEditorFields(page) {
  const sceneBlocks = Array.isArray(page?.sceneBlocks) ? page.sceneBlocks : [];
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'scene' ? ' visible' : ''}" data-page-type="scene">
        <div class="module-editor-grid single">
          <div class="module-editor-field">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-scene-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Stats</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field">
            <label>Szenenblöcke</label>
            <div class="module-editor-inline" style="justify-content:space-between;">
              <span class="module-editor-help">Redeblöcke können direkt mit vorhandenen Figuren befüllt werden.</span>
              <div class="module-editor-inline">
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-scene-block" data-scene-type="intro">+ Intro</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-scene-block" data-scene-type="speech">+ Rede</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-scene-block" data-scene-type="thought">+ Gedanke</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-scene-block" data-scene-type="action">+ Handlung</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-scene-block" data-scene-type="divider">+ Trenner</button>
              </div>
            </div>
            <div class="module-scene-speaker-tools">
              <div class="module-editor-field">
                <label>Sprecher ersetzen</label>
                <select class="me-scene-replace-source">
                  ${buildSceneSpeakerOptions(sceneBlocks)}
                </select>
              </div>
              <div class="module-editor-field">
                <label>Neue Figur</label>
                <select class="me-scene-replace-target">
                  ${buildModuleCharacterOptions('', 'Neue Figur wählen')}
                </select>
              </div>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="replace-scene-speaker">Ersetzen</button>
            </div>
            <div class="module-scene-blocks">
              ${sceneBlocks.map((block, blockIndex) => buildModuleSceneBlockMarkup(block, blockIndex)).join('')}
            </div>
          </div>
        </div>
      </div>`;
}

function collectSceneModuleEditorPage(card, page) {
  const sceneBlock = card.querySelector('[data-page-type="scene"]') || card;
  page.description = getTrimmedFormValue(card, '.me-page-scene-description');
  page.stats = collectModuleBiographyStats(sceneBlock);
  page.sceneBlocks = collectSceneBlocksFromCard(card);
  return page;
}
