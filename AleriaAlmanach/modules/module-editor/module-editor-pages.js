function buildRegisteredModuleEditorFields(page, type, index) {
  const template = getModuleTemplateForPageType(type);
  return typeof template.buildEditorFields === 'function'
    ? template.buildEditorFields(page, index)
    : '';
}

function getModulePageImageWidthMax(type = 'standard') {
  return type === 'caste' ? 160 : 70;
}

function normalizeModulePageImageWidth(value, max = 70) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 38;
  return Math.max(20, Math.min(max, Math.round(number)));
}

function getDefaultModulePageImageFitForType(type = 'standard') {
  return type === 'artifact' ? 'contain' : 'cover';
}

function getDefaultModulePageImagePositionForType(type = 'standard') {
  return ['standard', 'artifact', 'recipe'].includes(type) ? 'center' : 'top';
}

function normalizeModulePageImageFit(value, fallback = 'cover') {
  const fit = String(value || '').trim();
  return ['cover', 'contain'].includes(fit) ? fit : fallback;
}

function normalizeModulePageImagePosition(value, fallback = 'top') {
  const position = String(value || '').trim();
  return ['top', 'center', 'bottom', 'left', 'right'].includes(position) ? position : fallback;
}

function buildModuleImageFitOptions(selected, fallback = 'cover') {
  const value = normalizeModulePageImageFit(selected, fallback);
  return `
    <option value="cover"${value === 'cover' ? ' selected' : ''}>Füllen / croppen</option>
    <option value="contain"${value === 'contain' ? ' selected' : ''}>Ganzes Bild zeigen</option>`;
}

function buildModuleImagePositionOptions(selected, fallback = 'top') {
  const value = normalizeModulePageImagePosition(selected, fallback);
  return `
    <option value="top"${value === 'top' ? ' selected' : ''}>Oben zentriert</option>
    <option value="center"${value === 'center' ? ' selected' : ''}>Mittig</option>
    <option value="bottom"${value === 'bottom' ? ' selected' : ''}>Unten zentriert</option>
    <option value="left"${value === 'left' ? ' selected' : ''}>Links</option>
    <option value="right"${value === 'right' ? ' selected' : ''}>Rechts</option>`;
}

function buildModulePageEditorMarkup(page, index) {
  const type = inferModulePageType(page);
  const style = getPageImageStyle(page);
  const hasImageWidth = page?.imageWidth != null && page.imageWidth !== '';
  const imageWidthMax = getModulePageImageWidthMax(type);
  const imageWidth = normalizeModulePageImageWidth(page?.imageWidth, imageWidthMax);
  const defaultImageFit = getDefaultModulePageImageFitForType(type);
  const defaultImagePosition = getDefaultModulePageImagePositionForType(type);
  const imageFit = normalizeModulePageImageFit(page?.imageFit, defaultImageFit);
  const imagePosition = normalizeModulePageImagePosition(page?.imagePosition, defaultImagePosition);
  const commentatorAvatar = page?.commentator?.avatars
    ? (page.commentator.avatars[page.commentatorMood] || Object.values(page.commentator.avatars)[0] || '')
    : '';
  const commentatorCharacter = findModuleEditorCharacterMatch({
    name: page?.commentator?.name,
    avatar: commentatorAvatar
  });
  const sessionCast = getModuleCastIdsFromSource(page);
  const sessionCastDetails = getModuleCastDetailsFromSource(page);
  const commentSequence = Array.isArray(page?.commentSequence) ? page.commentSequence : [];

  return `
    <div class="module-page-card" data-page-index="${index}">
      <div class="module-page-head">
        <div class="module-page-title">Seite ${index + 1}</div>
        <div class="module-page-actions">
          <button class="module-editor-mini-btn module-editor-drag-handle" type="button" title="Seite ziehen">⋮⋮</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-page" data-page-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-page" data-page-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-page">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-page">Löschen</button>
        </div>
      </div>

      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Seitentyp</label>
          <select class="me-page-type" data-module-editor-action="update-page-type">
            ${buildModulePageTypeOptions(type)}
          </select>
        </div>
        <div class="module-editor-field">
          <label>Bildstil</label>
          <select class="me-page-image-style">
            <option value="default"${style === 'default' ? ' selected' : ''}>Standard</option>
            <option value="square"${style === 'square' ? ' selected' : ''}>Quadratisch</option>
            <option value="landscape"${style === 'landscape' ? ' selected' : ''}>Breit</option>
            <option value="semi"${style === 'semi' ? ' selected' : ''}>Halb-Breit</option>
            <option value="tall"${style === 'tall' ? ' selected' : ''}>Hochformat</option>
          </select>
        </div>
        <div class="module-editor-field">
          <label>Bildbreite <span>${escapeHtml(imageWidth)}%</span></label>
          <label class="module-editor-check"><input type="checkbox" class="me-page-image-width-enabled" data-module-editor-action="toggle-image-width"${hasImageWidth ? ' checked' : ''}> eigene Breite nutzen</label>
          <input class="module-size-range me-page-image-width" type="range" min="20" max="${escapeHtml(imageWidthMax)}" step="1" value="${escapeHtml(imageWidth)}" data-module-editor-action="update-range-percent-label"${hasImageWidth ? '' : ' disabled'}>
        </div>
        <div class="module-editor-field">
          <label>Bildfüllung</label>
          <select class="me-page-image-fit">
            ${buildModuleImageFitOptions(imageFit, defaultImageFit)}
          </select>
        </div>
        <div class="module-editor-field">
          <label>Bildausschnitt</label>
          <select class="me-page-image-position">
            ${buildModuleImagePositionOptions(imagePosition, defaultImagePosition)}
          </select>
        </div>
        <div class="module-editor-field wide">
          <label>Seitentitel</label>
          <input type="text" class="me-page-title-input" value="${escapeHtml(page?.pageTitle || '')}">
        </div>
        <div class="module-editor-field wide">
          <label>Bild-URL</label>
          <input type="url" class="me-page-image-input" value="${escapeHtml(page?.image || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field wide me-cast-field">
          <label>Kommentar-Cast dieser Seite</label>
          <input type="text" class="me-page-session-cast me-cast-input" value="${escapeHtml(sessionCast.join(', '))}" placeholder="gwendolyn-draig, schreier-cw" data-module-editor-action="sync-cast-picker">
          <div class="module-editor-help">Diese Figuren stehen im Kommentarformular für genau diese Seite bereit. Leer = globaler Cast oder freie Auswahl.</div>
          <div class="module-character-checklist">
            ${buildModuleCharacterChecklist(sessionCast, sessionCastDetails)}
          </div>
        </div>
        <div class="module-editor-inline">
          <label class="module-editor-check"><input type="checkbox" class="me-page-comments-enabled"${page?.enableComments ? ' checked' : ''}> Kommentarbereich auf dieser Seite anzeigen</label>
        </div>
      </div>

      <div class="module-page-type-block${type === 'standard' ? ' visible' : ''}" data-page-type="standard">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Stats</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-biography-stat-row">+ Zeile</button>
            </div>
            <div class="inline-stat-editor module-biography-stats">
              ${buildModuleBiographyStatRows(page?.stats || [])}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Kommentator aus Almanach</label>
            <select class="me-page-commentator-preset" data-module-editor-action="apply-commentator-preset">
              ${buildModuleCharacterOptions(commentatorCharacter?.id || '', '— Kommentator frei eingeben —')}
            </select>
          </div>
          <div class="module-editor-field">
            <label>Kommentator</label>
            <input type="text" class="me-page-commentator-name" value="${escapeHtml(page?.commentator?.name || '')}">
          </div>
          <div class="module-editor-field">
            <label>Titel / Rolle</label>
            <input type="text" class="me-page-commentator-title" value="${escapeHtml(page?.commentator?.title || '')}">
          </div>
          <div class="module-editor-field">
            <label>Avatar-URL</label>
            <input type="url" class="me-page-commentator-avatar" value="${escapeHtml(commentatorAvatar || '')}" placeholder="https://i.imgur.com/...">
          </div>
          <div class="module-editor-field">
            <label>Mood-Schlüssel</label>
            <input type="text" class="me-page-commentator-mood" value="${escapeHtml(page?.commentatorMood || 'default')}">
          </div>
          <div class="module-editor-field wide">
            <label>Kommentartext</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-commentator-text">${escapeHtml(page?.commentText || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kommentarfolge</label>
              <div class="module-editor-inline">
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-comment-block" data-comment-kind="character">+ Figur</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-comment-block" data-comment-kind="narrator">+ Erzähler</button>
              </div>
            </div>
            <div class="module-editor-help">Wenn hier Einträge vorhanden sind, wird auf der Seite statt des einzelnen Kommentatorblocks eine ganze Sequenz dargestellt.</div>
            <div class="module-comment-blocks module-scene-blocks">
              ${commentSequence.map((block, blockIndex) => buildModuleCommentBlockMarkup(block, blockIndex)).join('')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <label>Zitat</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-page-quote small">${escapeHtml(page?.quote || '')}</textarea>
          </div>
          <div class="module-editor-field wide">
            <label>Zitatquelle</label>
            <input type="text" class="me-page-quote-by" value="${escapeHtml(page?.quoteBy || '')}">
          </div>
        </div>
      </div>

      ${buildRegisteredModuleEditorFields(page, type, index)}

    </div>`;
}

function renderModuleEditorPages(pages) {
  const wrap = document.getElementById('me-pages');
  if (!wrap) return;
  wrap.innerHTML = pages.map((page, index) => buildModulePageEditorMarkup(page, index)).join('');
  hydrateModuleRichEditors(wrap);
  refreshAllModuleCastPickers();
  renumberModulePageCards();
  bindModuleEditorDnD();
}

function addModulePage(type = 'standard') {
  const wrap = document.getElementById('me-pages');
  if (!wrap) return;
  const index = wrap.querySelectorAll('.module-page-card').length;
  wrap.insertAdjacentHTML('beforeend', buildModulePageEditorMarkup(createInlinePageByType(type, index), index));
  hydrateModuleRichEditors(wrap.lastElementChild || wrap);
  refreshAllModuleCastPickers();
  renumberModulePageCards();
  bindModuleEditorDnD();
  setModuleEditorPreviewPage(index);
  updateModuleEditorDirtyState();
}

function applyModuleTemplateFromEditor() {
  const templateId = document.getElementById('me-template')?.value || 'story';
  try {
    const current = collectModuleEditorPayload();
    if (!confirm(`Vorlage anwenden?\n\nDie aktuelle Seitenstruktur wird durch "${getModuleTemplateLabel(templateId)}" ersetzt.`)) return;
    setModuleEditorUndoSnapshot(current, _moduleEditorContext || {}, 'Vorlage');
    const nextEntry = createModuleTemplateDraft(templateId, current.section, current.entry);
    populateModuleEditor(
      { section: current.section, entry: nextEntry },
      _moduleEditorContext || { mode: 'new', sourceKind: 'new', sourceEntryId: '' },
      { resetBaseline: false }
    );
    setModuleEditorStatus(`${getModuleTemplateLabel(templateId)} angewendet.`);
  } catch (error) {
    setModuleEditorStatus(error.message || 'Vorlage konnte nicht angewendet werden.', true);
  }
}

function duplicateModulePage(button) {
  const card = button.closest('.module-page-card');
  if (!card) return;
  const page = collectModulePageFromCard(card);
  card.insertAdjacentHTML('afterend', buildModulePageEditorMarkup(page, 0));
  const newCard = card.nextElementSibling;
  renumberModulePageCards();
  bindModuleEditorDnD();
  const index = getModulePageCards().indexOf(newCard);
  setModuleEditorPreviewPage(index >= 0 ? index : 0);
  updateModuleEditorDirtyState();
}

function moveModulePage(button, direction) {
  const card = button.closest('.module-page-card');
  const wrap = document.getElementById('me-pages');
  if (!card || !wrap) return;
  if (direction < 0 && card.previousElementSibling) {
    wrap.insertBefore(card, card.previousElementSibling);
  } else if (direction > 0 && card.nextElementSibling) {
    wrap.insertBefore(card.nextElementSibling, card);
  }
  renumberModulePageCards();
  syncModuleJsonPreview();
  updateModuleEditorDirtyState();
}

function removeModulePage(button) {
  const wrap = document.getElementById('me-pages');
  const card = button.closest('.module-page-card');
  if (!wrap || !card) return;
  card.remove();
  if (!wrap.querySelector('.module-page-card')) addModulePage('standard');
  renumberModulePageCards();
  syncModuleJsonPreview();
  updateModuleEditorDirtyState();
}

function collectRegisteredModuleEditorPage(card, page, type) {
  const template = getModuleTemplateForPageType(type);
  return typeof template.collectEditorPage === 'function'
    ? template.collectEditorPage(card, page)
    : null;
}

function collectModulePageFromCard(card) {
  const type = getFormValue(card, '.me-page-type') || 'standard';
  const imageStyle = getFormValue(card, '.me-page-image-style') || 'default';
  const pageCastInput = card.querySelector('.me-page-session-cast');
  const pageCast = parseModuleCastIds(getFormValue(card, '.me-page-session-cast'));
  const pageCastDetails = collectModuleCastDetailsFromField(pageCastInput?.closest('.me-cast-field'), pageCast);
  const page = {
    pageTitle: getTrimmedFormValue(card, '.me-page-title-input'),
    image: getTrimmedFormValue(card, '.me-page-image-input'),
  };

  if (imageStyle === 'square') page.imageSquare = true;
  if (imageStyle === 'landscape') page.imageLandscape = true;
  if (imageStyle === 'semi') page.imageSemiLandscape = true;
  if (imageStyle === 'tall') page.imageTall = true;
  if (card.querySelector('.me-page-image-width-enabled')?.checked) {
    page.imageWidth = normalizeModulePageImageWidth(getFormValue(card, '.me-page-image-width'), getModulePageImageWidthMax(type));
  }
  const defaultImageFit = getDefaultModulePageImageFitForType(type);
  const defaultImagePosition = getDefaultModulePageImagePositionForType(type);
  const imageFit = normalizeModulePageImageFit(getFormValue(card, '.me-page-image-fit'), defaultImageFit);
  const imagePosition = normalizeModulePageImagePosition(getFormValue(card, '.me-page-image-position'), defaultImagePosition);
  if (imageFit !== defaultImageFit) page.imageFit = imageFit;
  if (imagePosition !== defaultImagePosition) page.imagePosition = imagePosition;
  if (pageCast.length) page.sessionCast = pageCast;
  if (pageCastDetails.length) page.sessionCastDetails = pageCastDetails;
  if (card.querySelector('.me-page-comments-enabled')?.checked) page.enableComments = true;

  const registeredPage = collectRegisteredModuleEditorPage(card, page, type);
  if (registeredPage) {
    return sanitizeModulePage(registeredPage, registeredPage.pageTitle || '') || createDefaultModulePage();
  }

  if (type === 'standard') {
    const standardBlock = card.querySelector('[data-page-type="standard"]') || card;
    page.description = getTrimmedFormValue(card, '.me-page-description');
    page.stats = collectModuleBiographyStats(standardBlock);
    const commentatorName = getTrimmedFormValue(card, '.me-page-commentator-name');
    const commentatorAvatar = getTrimmedFormValue(card, '.me-page-commentator-avatar');
    const commentatorMood = getTrimmedFormValue(card, '.me-page-commentator-mood') || 'default';
    if (commentatorName && commentatorAvatar) {
      page.commentator = {
        name: commentatorName,
        title: getTrimmedFormValue(card, '.me-page-commentator-title'),
        avatars: { [commentatorMood]: commentatorAvatar }
      };
      page.commentatorMood = commentatorMood;
      page.commentText = getTrimmedFormValue(card, '.me-page-commentator-text');
    }
    page.commentSequence = collectModuleCommentBlocksFromCard(card);
    page.quote = getTrimmedFormValue(card, '.me-page-quote');
    page.quoteBy = getTrimmedFormValue(card, '.me-page-quote-by');
  }

  return sanitizeModulePage(page, page.pageTitle || '') || createDefaultModulePage();
}
