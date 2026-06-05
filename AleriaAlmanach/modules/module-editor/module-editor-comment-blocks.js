function createDefaultModuleCommentBlock(kind = 'character') {
  if (kind === 'narrator') return { narrator: true, text: '' };
  return { narrator: false, side: 'left', name: '', title: '', portrait: '', text: '' };
}

function collectModuleCommentBlockFromCard(blockCard) {
  const type = getFormValue(blockCard, '.me-comment-block-type') || 'character';
  if (type === 'narrator') {
    return {
      narrator: true,
      text: getTrimmedFormValue(blockCard, '.me-comment-block-text')
    };
  }
  return {
    narrator: false,
    side: getFormValue(blockCard, '.me-comment-block-side') === 'right' ? 'right' : 'left',
    name: getTrimmedFormValue(blockCard, '.me-comment-block-name'),
    title: getTrimmedFormValue(blockCard, '.me-comment-block-title'),
    portrait: getTrimmedFormValue(blockCard, '.me-comment-block-portrait'),
    text: getTrimmedFormValue(blockCard, '.me-comment-block-text'),
  };
}

function collectModuleCommentBlocksFromCard(card) {
  const blocks = Array.from(card.querySelectorAll('.module-comment-block-card')).map(collectModuleCommentBlockFromCard);
  return sanitizeCommentSequence(blocks);
}

function buildModuleCommentBlockMarkup(block, index) {
  const safeBlock = block && typeof block === 'object' ? block : createDefaultModuleCommentBlock('character');
  const isNarrator = !!safeBlock.narrator;
  const selectedCharacter = !isNarrator
    ? findModuleEditorCharacterMatch({ name: safeBlock.name, avatar: safeBlock.portrait })
    : null;

  return `
    <div class="module-scene-block-card module-comment-block-card">
      <div class="module-scene-block-head">
        <div class="module-scene-block-title">Kommentar ${index + 1}</div>
        <div class="module-scene-block-actions">
          <button class="module-editor-mini-btn module-editor-drag-handle" type="button" title="Block ziehen">⋮⋮</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-comment-reply" data-comment-side="left">+ Links</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-comment-reply" data-comment-side="right">+ Rechts</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="insert-comment-narrator">+ Erzähler</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-comment-block" data-comment-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-comment-block" data-comment-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-comment-block">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-comment-block">Löschen</button>
        </div>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Rolle</label>
          <select class="me-comment-block-type" data-module-editor-action="update-comment-block-type">
            <option value="character"${!isNarrator ? ' selected' : ''}>Figur</option>
            <option value="narrator"${isNarrator ? ' selected' : ''}>Erzähler</option>
          </select>
        </div>
        <div class="module-editor-field module-scene-block-section${!isNarrator ? ' visible' : ''}" data-comment-role="character">
          <label>Seite</label>
          <select class="me-comment-block-side">
            <option value="left"${(safeBlock.side || 'left') === 'left' ? ' selected' : ''}>Links</option>
            <option value="right"${safeBlock.side === 'right' ? ' selected' : ''}>Rechts</option>
          </select>
        </div>
        <div class="module-editor-field wide module-scene-block-section${!isNarrator ? ' visible' : ''}" data-comment-role="character">
          <label>Figur aus Almanach</label>
          <select class="me-comment-block-character-preset" data-module-editor-action="apply-comment-preset">
            ${buildModuleCharacterOptions(selectedCharacter?.id || '', '— Figur frei eingeben —')}
          </select>
        </div>
        <div class="module-editor-field module-scene-block-section${!isNarrator ? ' visible' : ''}" data-comment-role="character">
          <label>Name</label>
          <input type="text" class="me-comment-block-name" value="${escapeHtml(safeBlock.name || '')}">
        </div>
        <div class="module-editor-field module-scene-block-section${!isNarrator ? ' visible' : ''}" data-comment-role="character">
          <label>Titel / Rolle</label>
          <input type="text" class="me-comment-block-title" value="${escapeHtml(safeBlock.title || '')}">
        </div>
        <div class="module-editor-field wide module-scene-block-section${!isNarrator ? ' visible' : ''}" data-comment-role="character">
          <label>Portrait-URL</label>
          <input type="url" class="me-comment-block-portrait" value="${escapeHtml(safeBlock.portrait || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field wide">
          <label>Text</label>
          ${buildTextFormatToolbar()}
          <textarea class="me-comment-block-text">${escapeHtml(safeBlock.text || '')}</textarea>
        </div>
      </div>
    </div>`;
}

function renumberModuleCommentBlocks(card) {
  const blocks = Array.from(card.querySelectorAll('.module-comment-blocks > .module-comment-block-card'));
  blocks.forEach((blockCard, index) => {
    const title = blockCard.querySelector('.module-scene-block-title');
    const isNarrator = (blockCard.querySelector('.me-comment-block-type')?.value || 'character') === 'narrator';
    const side = (blockCard.querySelector('.me-comment-block-side')?.value || 'left') === 'right' ? 'Rechts' : 'Links';
    const name = blockCard.querySelector('.me-comment-block-name')?.value.trim() || '';
    if (!title) return;
    if (isNarrator) {
      title.innerHTML = `Erzähler <strong>${index + 1}</strong>`;
      return;
    }
    title.innerHTML = `Kommentar <strong>${index + 1}</strong> · ${side}${name ? ` · ${escapeHtml(name)}` : ''}`;
  });
}

function addModuleCommentBlock(button, kind = 'character') {
  const field = button.closest('.module-editor-field');
  const wrap = field?.querySelector('.module-comment-blocks');
  if (!wrap) return;
  wrap.insertAdjacentHTML('beforeend', buildModuleCommentBlockMarkup(createDefaultModuleCommentBlock(kind), wrap.querySelectorAll('.module-comment-block-card').length));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  renumberModuleCommentBlocks(field.closest('.module-page-card'));
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function insertModuleCommentReply(button, side = 'left') {
  const blockCard = button.closest('.module-comment-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  const current = collectModuleCommentBlockFromCard(blockCard);
  const next = createDefaultModuleCommentBlock('character');
  if (!current.narrator) {
    next.name = current.name || '';
    next.title = current.title || '';
    next.portrait = current.portrait || '';
  }
  next.side = side === 'right' ? 'right' : 'left';
  blockCard.insertAdjacentHTML('afterend', buildModuleCommentBlockMarkup(next, 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleCommentBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function insertModuleCommentNarrator(button) {
  const blockCard = button.closest('.module-comment-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  blockCard.insertAdjacentHTML('afterend', buildModuleCommentBlockMarkup(createDefaultModuleCommentBlock('narrator'), 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleCommentBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function duplicateModuleCommentBlock(button) {
  const blockCard = button.closest('.module-comment-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  const block = collectModuleCommentBlockFromCard(blockCard);
  blockCard.insertAdjacentHTML('afterend', buildModuleCommentBlockMarkup(block, 0));
  hydrateModuleRichEditors(blockCard.nextElementSibling || pageCard);
  renumberModuleCommentBlocks(pageCard);
  bindModuleEditorDnD();
  syncModuleJsonPreview();
}

function moveModuleCommentBlock(button, direction) {
  const blockCard = button.closest('.module-comment-block-card');
  const wrap = button.closest('.module-comment-blocks');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !wrap || !pageCard) return;
  if (direction < 0 && blockCard.previousElementSibling) {
    wrap.insertBefore(blockCard, blockCard.previousElementSibling);
  } else if (direction > 0 && blockCard.nextElementSibling) {
    wrap.insertBefore(blockCard.nextElementSibling, blockCard);
  }
  renumberModuleCommentBlocks(pageCard);
  syncModuleJsonPreview();
}

function removeModuleCommentBlock(button) {
  const blockCard = button.closest('.module-comment-block-card');
  const pageCard = button.closest('.module-page-card');
  if (!blockCard || !pageCard) return;
  blockCard.remove();
  renumberModuleCommentBlocks(pageCard);
  syncModuleJsonPreview();
}

function updateModuleCommentBlockType(selectEl) {
  const blockCard = selectEl.closest('.module-comment-block-card');
  if (!blockCard) return;
  const isNarrator = (selectEl.value || 'character') === 'narrator';
  blockCard.querySelectorAll('.module-scene-block-section[data-comment-role="character"]').forEach(section => {
    section.classList.toggle('visible', !isNarrator);
  });
  syncModuleJsonPreview();
}

function applyModuleCommentPreset(selectEl) {
  const blockCard = selectEl.closest('.module-comment-block-card');
  if (!blockCard) return;
  const char = findModuleEditorCharacterMatch({ id: selectEl.value });
  if (!char) return;
  const nameInput = blockCard.querySelector('.me-comment-block-name');
  const titleInput = blockCard.querySelector('.me-comment-block-title');
  const portraitInput = blockCard.querySelector('.me-comment-block-portrait');
  if (nameInput) nameInput.value = char.name || '';
  if (titleInput) titleInput.value = char.title || '';
  if (portraitInput) portraitInput.value = getModuleCharacterRecordPortrait(char) || '';
  syncModuleJsonPreview();
}

function applyModuleCommentatorPreset(selectEl) {
  const card = selectEl.closest('.module-page-card');
  if (!card) return;
  const char = findModuleEditorCharacterMatch({ id: selectEl.value });
  if (!char) return;
  const nameInput = card.querySelector('.me-page-commentator-name');
  const titleInput = card.querySelector('.me-page-commentator-title');
  const avatarInput = card.querySelector('.me-page-commentator-avatar');
  const moodInput = card.querySelector('.me-page-commentator-mood');
  if (nameInput) nameInput.value = char.name || '';
  if (titleInput) titleInput.value = char.title || '';
  if (avatarInput) avatarInput.value = getModuleCharacterRecordPortrait(char) || '';
  if (moodInput && !String(moodInput.value || '').trim()) moodInput.value = 'default';
  syncModuleJsonPreview();
}

function applySceneSpeechPreset(selectEl) {
  const blockCard = selectEl.closest('.module-scene-block-card');
  if (!blockCard) return;
  const char = findModuleEditorCharacterMatch({ id: selectEl.value });
  if (!char) return;
  const nameInput = blockCard.querySelector('.me-scene-block-name');
  const avatarInput = blockCard.querySelector('.me-scene-block-avatar');
  if (nameInput) nameInput.value = char.name || '';
  if (avatarInput) avatarInput.value = getModuleCharacterRecordPortrait(char) || '';
  renumberModuleSceneBlocks(blockCard.closest('.module-page-card'));
  syncModuleJsonPreview();
}
