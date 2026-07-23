function syncInlineEntryField(input) {
  if (!_inlineModuleEdit?.draft) return;
  const field = input.dataset.entryField;
  if (!field) return;
  _inlineModuleEdit.draft[field] = input.type === 'checkbox'
    ? !!input.checked
    : String(input.value || '').trim();
}

function syncInlineModuleSizeField(input) {
  if (!_inlineModuleEdit?.draft) return;
  const field = input.dataset.entryField;
  if (field !== 'moduleWidth' && field !== 'moduleHeight') return;
  const value = clampModuleSizeValue(input.value, MODULE_SIZE_DEFAULT);
  _inlineModuleEdit.draft[field] = value;
  input.value = value;
  const label = input.closest('.inline-edit-field')?.querySelector('.inline-size-value');
  if (label) label.textContent = `${value}%`;
  scheduleInlineModuleLivePreviewRefresh();
  applyModalTheme(_inlineModuleEdit.draft);
}

function getInlinePageDefaultImageFitForSync(page) {
  return page?.artifactPage ? 'contain' : 'cover';
}

function getInlinePageImageWidthMaxForSync(page) {
  if (page?.castePage) return 160;
  if (page?.questFilePage || page?.biographyPage) return 100;
  return 70;
}

function getInlinePageDefaultImagePositionForSync(page) {
  return (page?.artifactPage || page?.recipePage || !page?.questFilePage && !page?.castePage && !page?.courtPage && !page?.bountyFilePage && !page?.goodsTablePage && !page?.tradeCatalogPage && !page?.biographyPage)
    ? 'center'
    : 'top';
}

function rerenderAfterInlineMetaChange(input) {
  syncInlineEntryField(input);
  renderPage(currentPage, 0);
}

function syncInlinePageField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  const field = input.dataset.pageField;
  if (!field) return;

  if (field === 'imageWidth') {
    page.imageWidth = Math.max(20, Math.min(getInlinePageImageWidthMaxForSync(page), Number(input.value) || 38));
    const out = document.getElementById('inline-image-width-value');
    if (out) out.textContent = `${page.imageWidth}%`;
    return;
  }

  if (field === 'imageStyle') {
    delete page.imageSquare;
    delete page.imageLandscape;
    delete page.imageSemiLandscape;
    delete page.imageTall;
    if (input.value === 'square') page.imageSquare = true;
    if (input.value === 'landscape') page.imageLandscape = true;
    if (input.value === 'semi') page.imageSemiLandscape = true;
    if (input.value === 'tall') page.imageTall = true;
    renderPage(currentPage, 0);
    return;
  }

  if (field === 'imageFit') {
    const fit = String(input.value || '').trim();
    if (['cover', 'contain'].includes(fit) && fit !== getInlinePageDefaultImageFitForSync(page)) page.imageFit = fit;
    else delete page.imageFit;
    renderPage(currentPage, 0);
    return;
  }

  if (field === 'imagePosition') {
    const position = String(input.value || '').trim();
    if (['top', 'center', 'bottom', 'left', 'right'].includes(position) && position !== getInlinePageDefaultImagePositionForSync(page)) page.imagePosition = position;
    else delete page.imagePosition;
    renderPage(currentPage, 0);
    return;
  }

  if (field === 'enableComments' || field === 'commentDivider') {
    page[field] = !!input.checked;
    renderPage(currentPage, 0);
    return;
  }

  if (field === 'sessionDateAleria') {
    const scope = input.closest('.aleria-date-field');
    page.sessionDateAleria = collectAleriaDateFromBlock(scope, 'inline-page-session-aleriaDate');
    renderPage(currentPage, 0);
    return;
  }

  page[field] = String(input.value || '').trim();
}

function rerenderAfterInlinePageChange(input) {
  syncInlinePageField(input);
  renderPage(currentPage, 0);
}

function addInlineStatRow(source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page) return;
  page.stats = Array.isArray(page.stats) ? page.stats : [];
  page.stats.push(['Neuer Eintrag', 'Wert']);
  renderPage(currentPage, 0);
}

function removeInlineStatRow(index, source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page?.stats) return;
  page.stats.splice(index, 1);
  renderPage(currentPage, 0);
}

function updateInlineStatField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  page.stats = Array.isArray(page.stats) ? page.stats : [];
  const index = Number(input.dataset.statIndex || -1);
  const slot = input.dataset.statField === 'value' ? 1 : 0;
  if (index < 0) return;
  if (!page.stats[index]) page.stats[index] = ['', ''];
  page.stats[index][slot] = String(input.value || '').trim();
}

function addInlineCommentBlock(kind = 'character', source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page) return;
  page.commentSequence = Array.isArray(page.commentSequence) ? page.commentSequence : [];
  page.commentSequence.push(createDefaultModuleCommentBlock(kind));
  renderPage(currentPage, 0);
}

function removeInlineCommentBlock(index, source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page?.commentSequence) return;
  page.commentSequence.splice(index, 1);
  renderPage(currentPage, 0);
}

function updateInlineCommentField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  page.commentSequence = Array.isArray(page.commentSequence) ? page.commentSequence : [];
  const index = Number(input.dataset.commentIndex || -1);
  if (index < 0) return;
  const block = page.commentSequence[index] || createDefaultModuleCommentBlock('character');
  const field = input.dataset.commentField;
  if (field === 'narrator') {
    block.narrator = !!input.checked;
    if (block.narrator) {
      delete block.side;
      delete block.name;
      delete block.title;
      delete block.portrait;
    } else {
      block.side = block.side || 'left';
      block.name = block.name || '';
      block.title = block.title || '';
      block.portrait = block.portrait || '';
    }
    page.commentSequence[index] = block;
    renderPage(currentPage, 0);
    return;
  }
  if (field === 'side') block.side = input.value === 'right' ? 'right' : 'left';
  else block[field] = String(input.value || '').trim();
  page.commentSequence[index] = block;
}

function addInlineSceneBlock(type = 'speech', source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page) return;
  page.sceneBlocks = Array.isArray(page.sceneBlocks) ? page.sceneBlocks : [];
  page.sceneBlocks.push(createDefaultSceneBlock(type));
  renderPage(currentPage, 0);
}

function removeInlineSceneBlock(index, source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page?.sceneBlocks) return;
  page.sceneBlocks.splice(index, 1);
  renderPage(currentPage, 0);
}

function replaceInlineSceneSpeaker(sourceKey, targetId, source = null) {
  const page = getInlineDraftPageForSource(source);
  if (!page) return;
  const target = getAllCharacterRecords().find(char => String(char?.id || '').trim() === String(targetId || '').trim());
  const targetName = String(target?.name || '').trim();
  if (!sourceKey || !targetName) return;
  const targetAvatar = getModuleCharacterRecordPortrait(target);
  page.sceneBlocks = Array.isArray(page.sceneBlocks) ? page.sceneBlocks : [];
  page.sceneBlocks.forEach(block => {
    if (!isCharacterSceneBlockType(block?.type)) return;
    if (getSceneSpeakerKey(block.name || '') !== sourceKey) return;
    block.name = targetName;
    block.avatar = targetAvatar;
  });
  renderPage(currentPage, 0);
}

function updateInlineSceneField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  page.sceneBlocks = Array.isArray(page.sceneBlocks) ? page.sceneBlocks : [];
  const index = Number(input.dataset.sceneIndex || -1);
  if (index < 0) return;
  const block = page.sceneBlocks[index] || createDefaultSceneBlock('speech');
  const field = input.dataset.sceneField;
  if (field === 'type') {
    page.sceneBlocks[index] = createDefaultSceneBlock(input.value || 'speech');
    renderPage(currentPage, 0);
    return;
  }
  if (field === 'side') block.side = input.value === 'right' ? 'right' : 'left';
  else block[field] = String(input.value || '').trim();
  page.sceneBlocks[index] = block;
}

function createInlinePageByType(type = 'standard', index = 0) {
  const template = getModuleTemplateForPageType(type);
  return typeof template.createPage === 'function'
    ? template.createPage(index)
    : createDefaultModulePage(index);
}

function addInlinePage(type = 'standard') {
  if (!_inlineModuleEdit?.draft?.pages) return;
  const pages = _inlineModuleEdit.draft.pages;
  const nextIndex = currentPage + 1;
  pages.splice(nextIndex, 0, createInlinePageByType(type, nextIndex));
  ensureInlinePageCommentThreadKeys();
  pages[nextIndex].commentThreadKey = createInlinePageCommentThreadKey(pages);
  currentPage = nextIndex;
  renderPage(currentPage, 0);
}

function removeInlineCurrentPage() {
  if (!_inlineModuleEdit?.draft?.pages?.length || _inlineModuleEdit.draft.pages.length <= 1) return;
  _inlineModuleEdit.draft.pages.splice(currentPage, 1);
  currentPage = Math.max(0, Math.min(currentPage, _inlineModuleEdit.draft.pages.length - 1));
  renderPage(currentPage, 0);
}

function createInlinePageCommentThreadKey(pages) {
  const used = new Set((Array.isArray(pages) ? pages : [])
    .map(page => String(page?.commentThreadKey || '').trim())
    .filter(Boolean));
  let key;
  do {
    key = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  } while (used.has(key));
  return key;
}

function ensureInlinePageCommentThreadKeys() {
  const pages = _inlineModuleEdit?.draft?.pages;
  if (!Array.isArray(pages)) return;
  const used = new Set();
  pages.forEach((page, index) => {
    if (!page || typeof page !== 'object') return;
    let key = String(page.commentThreadKey || '').trim();
    if (!/^[a-z0-9-]{1,64}$/i.test(key) || used.has(key)) {
      key = String(index);
    }
    if (used.has(key)) key = createInlinePageCommentThreadKey(pages);
    page.commentThreadKey = key;
    used.add(key);
  });
}

function moveInlineCurrentPage(direction) {
  if (!_inlineModuleEdit?.draft?.pages?.length) return;
  const pages = _inlineModuleEdit.draft.pages;
  const fromIndex = currentPage;
  const toIndex = fromIndex + (Number(direction) < 0 ? -1 : 1);
  if (toIndex < 0 || toIndex >= pages.length) return;
  ensureInlinePageCommentThreadKeys();
  const [page] = pages.splice(fromIndex, 1);
  pages.splice(toIndex, 0, page);
  currentPage = toIndex;
  renderPage(currentPage, 0);
}

function getInlineTemplatePickerType(type, entry) {
  const templateByPageType = {
    profiles: 'profiles',
    'character-inventory': 'character-inventory',
    'guest-register': 'guest-register',
    wanted: 'wanted',
    'bounty-file': 'bounty-file',
    goods: 'goods',
    'trade-catalog': 'trade-catalog',
    'map-template': 'map-template',
    language: 'language',
    'name-list': 'name-list',
    'script-table': 'script-table',
    landing: 'landing',
    artifact: 'artifact',
    recipe: 'recipe',
    scene: 'scene',
    session: 'session',
    tournament: 'tournament',
    'tournament-league': 'tournament-league',
    caste: 'caste',
    court: 'court',
    hierarchy: 'hierarchy',
    'family-tree': 'family-tree',
    family: 'family',
    house: 'houses',
    biography: 'object-profile',
    bestiary: 'bestiary',
    'quest-file': 'quest-file'
  };
  return templateByPageType[String(type || '').trim()] || inferModuleTemplateType(entry);
}

function buildInlineStandardEditor(entry, page) {
  const transferPanel = typeof buildInlineModuleTemplateTransferPanel === 'function'
    ? buildInlineModuleTemplateTransferPanel(page, 'standard')
    : '';
  return `
    <div class="inline-edit-shell">
      <div class="inline-edit-section">
        <div class="inline-edit-kicker">Modultext</div>
        <div class="inline-edit-grid">
          <div class="inline-edit-field wide">
            <span class="inline-edit-label">Titel</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="title" value="${escapeHtml(entry.title || '')}">
          </div>
          <div class="inline-edit-field wide">
            <span class="inline-edit-label">Untertitel</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="subtitle" value="${escapeHtml(entry.subtitle || '')}">
          </div>
          ${buildInlineSectionPicker()}
          ${buildInlineTemplatePicker(inferModuleTemplateType(entry))}
          ${buildInlineModuleSizeControls(entry)}
          <div class="inline-edit-field wide">
            <span class="inline-edit-label">Kategorie</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="category" value="${escapeHtml(entry.category || '')}">
          </div>
          <div class="inline-edit-field">
            <span class="inline-edit-label">Typ</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="type" value="${escapeHtml(entry.type || '')}">
          </div>
          <div class="inline-edit-field">
            <span class="inline-edit-label">Stempel</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="stamp" value="${escapeHtml(entry.stamp || '')}">
          </div>
          <div class="inline-edit-field wide">
            <span class="inline-edit-label">Seitentitel</span>
            <input class="inline-edit-input" type="text" data-inline-action="rerender-page-field" data-page-field="pageTitle" value="${escapeHtml(page.pageTitle || '')}">
          </div>
          <div class="inline-edit-field wide">
            <div class="inline-edit-minirow">
              <label class="module-editor-check"><input type="checkbox" data-inline-action="rerender-entry-field" data-entry-field="enablePageComments"${entry.enablePageComments ? ' checked' : ''}> Kommentare auf allen Seiten erlauben</label>
              <label class="module-editor-check"><input type="checkbox" data-inline-action="rerender-page-field" data-page-field="enableComments"${page.enableComments ? ' checked' : ''}> Kommentare auf dieser Seite</label>
            </div>
          </div>
          <div class="inline-edit-field wide">
            <span class="inline-edit-label">Beschreibung</span>
            ${buildTextFormatToolbar()}
            <textarea class="inline-edit-textarea" data-inline-action="sync-page-field" data-page-field="description">${escapeHtml(page.description || '')}</textarea>
          </div>
        </div>
      </div>
      ${buildInlineStatsEditor(page)}
      ${buildInlineCommentEditor(page)}
      ${transferPanel}
    </div>`;
}

function buildInlineComplexEditor(entry, page, type) {
  const transferPanel = typeof buildInlineModuleTemplateTransferPanel === 'function'
    ? buildInlineModuleTemplateTransferPanel(page, type)
    : '';
  const wrapInlineEditor = content => `<div class="inline-edit-shell">${content}${transferPanel}</div>`;
  const moduleMeta = `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Modultext</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Titel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="title" value="${escapeHtml(entry.title || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Untertitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="subtitle" value="${escapeHtml(entry.subtitle || '')}">
        </div>
        ${buildInlineSectionPicker()}
        ${buildInlineTemplatePicker(getInlineTemplatePickerType(type, entry))}
        ${buildInlineModuleSizeControls(entry)}
        <div class="inline-edit-field">
          <span class="inline-edit-label">Typ</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="type" value="${escapeHtml(entry.type || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Stempel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-entry-field" data-entry-field="stamp" value="${escapeHtml(entry.stamp || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Seitentitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="rerender-page-field" data-page-field="pageTitle" value="${escapeHtml(page.pageTitle || '')}">
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-minirow">
            <label class="module-editor-check"><input type="checkbox" data-inline-action="rerender-entry-field" data-entry-field="enablePageComments"${entry.enablePageComments ? ' checked' : ''}> Kommentare auf allen Seiten erlauben</label>
            <label class="module-editor-check"><input type="checkbox" data-inline-action="rerender-page-field" data-page-field="enableComments"${page.enableComments ? ' checked' : ''}> Kommentare auf dieser Seite</label>
          </div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Beschreibung</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="sync-page-field" data-page-field="description">${escapeHtml(page.description || '')}</textarea>
        </div>
      </div>
    </div>`;

  if (type === 'scene') return wrapInlineEditor(`${moduleMeta}${buildInlineStatsEditor(page)}${buildInlineSceneEditor(page)}`);
  if (type === 'session') return wrapInlineEditor(`${moduleMeta}
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Sitzung</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Intro</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="sync-page-field" data-page-field="sessionIntro">${escapeHtml(page.sessionIntro || '')}</textarea>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Hinweis</span>
          <input class="inline-edit-input" type="text" data-inline-action="sync-page-field" data-page-field="sessionHint" value="${escapeHtml(page.sessionHint || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Ort</span>
          <input class="inline-edit-input" type="text" data-inline-action="sync-page-field" data-page-field="sessionLocation" value="${escapeHtml(page.sessionLocation || '')}">
        </div>
        <div class="inline-edit-field">
          ${buildAleriaDateField('Aleria-Datum der Szene', 'inline-page-session-aleriaDate', page.sessionDateAleria, 'sessionDateAleria')}
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Aktuelle Phase</span>
          <input class="inline-edit-input" type="text" data-inline-action="sync-page-field" data-page-field="sessionPhase" value="${escapeHtml(page.sessionPhase || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Anwesende Figuren</span>
          <input class="inline-edit-input" type="text" data-inline-action="sync-page-field" data-page-field="sessionParticipants" value="${escapeHtml(normalizeSessionStatusParticipants(page.sessionParticipants).join(', '))}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Szenenstatus</span>
          <select class="inline-edit-input" data-inline-action="sync-page-field" data-page-field="sessionStatus">
            <option value="active"${page.sessionStatus !== 'paused' && page.sessionStatus !== 'ended' ? ' selected' : ''}>Aktiv</option>
            <option value="paused"${page.sessionStatus === 'paused' ? ' selected' : ''}>Pausiert</option>
            <option value="ended"${page.sessionStatus === 'ended' ? ' selected' : ''}>Beendet</option>
          </select>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Leertitel</span>
          <input class="inline-edit-input" type="text" data-inline-action="sync-page-field" data-page-field="sessionEmptyTitle" value="${escapeHtml(page.sessionEmptyTitle || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Leertext</span>
          ${buildTextFormatToolbar()}
          <textarea class="inline-edit-textarea" data-inline-action="sync-page-field" data-page-field="sessionEmptyText">${escapeHtml(page.sessionEmptyText || '')}</textarea>
        </div>
      </div>
    </div>`);
  if (type === 'wanted') return wrapInlineEditor(`${moduleMeta}${buildInlineWantedEditor(page)}`);
  if (type === 'bounty-file') return wrapInlineEditor(`${moduleMeta}${buildInlineBountyFileEditor(page)}`);
  if (type === 'goods') return wrapInlineEditor(`${moduleMeta}${buildInlineGoodsEditor(page)}`);
  if (type === 'trade-catalog') return wrapInlineEditor(`${moduleMeta}${buildInlineTradeCatalogEditor(page)}`);
  if (type === 'map-template') return wrapInlineEditor(`${moduleMeta}${buildInlineMapTemplateEditor(page)}`);
  if (type === 'language') return wrapInlineEditor(`${moduleMeta}${buildInlineLanguageEditor(page)}`);
  if (type === 'name-list') return wrapInlineEditor(`${moduleMeta}${buildInlineNameListEditor(page)}`);
  if (type === 'script-table') return wrapInlineEditor(`${moduleMeta}${buildInlineScriptTableEditor(page)}`);
  if (type === 'landing') return wrapInlineEditor(`${moduleMeta}${buildInlineLandingEditor(page)}`);
  if (type === 'character-inventory') return wrapInlineEditor(`${moduleMeta}${buildInlineCharacterInventoryEditor(page)}`);
  if (type === 'guest-register') return wrapInlineEditor(`${moduleMeta}${buildInlineGuestRegisterEditor(page)}`);
  if (type === 'profiles') return wrapInlineEditor(`${moduleMeta}${buildInlineProfileEditor(page)}`);
  if (type === 'artifact') return wrapInlineEditor(`${moduleMeta}${buildInlineArtifactEditor(page)}`);
  if (type === 'recipe') return wrapInlineEditor(`${moduleMeta}${buildInlineRecipeEditor(page)}`);
  if (type === 'tournament') return wrapInlineEditor(`${moduleMeta}${buildInlineTournamentEditor(page)}`);
  if (type === 'tournament-league') return wrapInlineEditor(`${moduleMeta}${buildInlineTournamentLeagueEditor(page)}`);
  if (type === 'caste') return wrapInlineEditor(`${moduleMeta}${buildInlineCasteEditor(page)}`);
  if (type === 'court') return wrapInlineEditor(`${moduleMeta}${buildInlineCourtEditor(page)}`);
  if (type === 'house-warriors') return wrapInlineEditor(`${moduleMeta}${buildInlineHouseWarriorsEditor(page)}`);
  if (type === 'hierarchy') return wrapInlineEditor(`${moduleMeta}${buildInlineHierarchyEditor(page)}`);
  if (type === 'family-tree') return wrapInlineEditor(`${moduleMeta}${buildInlineFamilyTreeEmbedEditor(page)}`);
  if (type === 'family') return wrapInlineEditor(`${moduleMeta}${buildInlineFamilyEditor(page)}`);
  if (type === 'biography') return wrapInlineEditor(`${moduleMeta}${buildInlineStatsEditor(page)}${buildInlineBiographyEditor(page)}`);
  if (type === 'house') return wrapInlineEditor(`${moduleMeta}${buildInlineStatsEditor(page)}${buildInlineHouseEditor(page)}`);
  if (type === 'guild') return wrapInlineEditor(`${moduleMeta}${buildInlineStatsEditor(page)}${buildInlineGuildEditor(page)}`);
  if (type === 'bestiary') return wrapInlineEditor(buildInlineBestiaryEditor(entry, page));
  if (type === 'quest-file') return wrapInlineEditor(`${moduleMeta}${buildInlineStatsEditor(page)}${buildInlineQuestFileEditor(entry, page, { includeMeta: false, includeStats: false })}`);
  return wrapInlineEditor(moduleMeta);
}
