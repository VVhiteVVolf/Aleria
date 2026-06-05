function getPreferredEditorSection() {
  const sections = getValidSections();
  const active = sections.find(section => (section.tab || section.key) === _activeTab);
  const current = active || sections[0] || { key: 'Neuer Bereich', tab: 'Neuer Bereich', desc: '' };
  return {
    key: current.key,
    tab: current.tab || current.key,
    desc: current.desc || '',
    signature: makeSectionSignature(current)
  };
}

function buildModuleEditorSectionOptions(selectedSignature) {
  const select = document.getElementById('me-section-select');
  if (!select) return;
  const unique = [];
  const seen = new Set();
  getValidSections().forEach(section => {
    const signature = makeSectionSignature(section);
    if (seen.has(signature)) return;
    seen.add(signature);
    unique.push(section);
  });
  select.innerHTML = unique.map(section => {
    const signature = makeSectionSignature(section);
    return `<option value="${escapeHtml(signature)}"${signature === selectedSignature ? ' selected' : ''}>${escapeHtml(section.tab || section.key)}</option>`;
  }).join('') + `<option value="__new__"${selectedSignature === '__new__' ? ' selected' : ''}>+ Neuer Bereich</option>`;
  toggleModuleEditorSectionMode();
}

function toggleModuleEditorSectionMode() {
  const select = document.getElementById('me-section-select');
  const wrap = document.getElementById('me-new-section-wrap');
  if (!select || !wrap) return;
  wrap.style.display = select.value === '__new__' ? 'grid' : 'none';
}

function setModuleEditorStatus(message, isError = false) {
  const status = document.getElementById('me-status');
  if (!status) return;
  status.style.color = isError ? 'var(--red-wax)' : 'var(--gold)';
  status.textContent = message || '';
}

function getModuleEditorDraftSignature() {
  try {
    return modulePayloadToJson(collectModuleEditorPayload());
  } catch {
    return '';
  }
}

function setModuleEditorDirtyState(isDirty) {
  const overlay = document.getElementById('module-editor-overlay');
  if (overlay) overlay.dataset.dirty = isDirty ? 'true' : 'false';
}

function updateModuleEditorDirtyState() {
  if (_moduleEditorHydrating) return;
  const signature = getModuleEditorDraftSignature();
  setModuleEditorDirtyState(!!signature && !!_moduleEditorInitialSignature && signature !== _moduleEditorInitialSignature);
}

function hasUnsavedModuleEditorChanges() {
  return document.getElementById('module-editor-overlay')?.dataset.dirty === 'true';
}

function confirmDiscardModuleEditorChanges(actionLabel = 'fortfahren') {
  if (!hasUnsavedModuleEditorChanges()) return true;
  return confirm(`Ungespeicherte Änderungen im Modul-Editor gehen verloren.\n\nTrotzdem ${actionLabel}?`);
}

function setModuleEditorCleanBaseline() {
  _moduleEditorInitialSignature = getModuleEditorDraftSignature();
  setModuleEditorDirtyState(false);
}

function setModuleEditorUndoSnapshot(payload, context, label = 'Import') {
  if (!payload?.entry) return;
  _moduleEditorUndoSnapshot = {
    payload: deepClone(payload),
    context: deepClone(context || _moduleEditorContext || {}),
    label
  };
  const button = document.getElementById('me-undo-btn');
  if (button) {
    button.style.display = 'inline-block';
    button.textContent = `${label} rückgängig`;
  }
}

function clearModuleEditorUndoSnapshot() {
  _moduleEditorUndoSnapshot = null;
  const button = document.getElementById('me-undo-btn');
  if (button) button.style.display = 'none';
}

function undoLastModuleEditorImport() {
  if (!_moduleEditorUndoSnapshot) return;
  const snapshot = _moduleEditorUndoSnapshot;
  clearModuleEditorUndoSnapshot();
  _moduleEditorPendingCommentImport = null;
  populateModuleEditor(snapshot.payload, snapshot.context);
  setModuleEditorStatus(`${snapshot.label} rückgängig gemacht.`);
}

function getModuleImportCommentSummary(bundle) {
  if (!bundle) return { commentCount: 0, threadCount: 0, turnCount: 0 };
  const comments = Array.isArray(bundle.comments) ? bundle.comments : [];
  const threads = Array.isArray(bundle.threads) ? bundle.threads : [];
  const turns = Array.isArray(bundle.commentTurns) ? bundle.commentTurns : [];
  return {
    commentCount: Number(bundle.summary?.commentCount) || comments.length,
    threadCount: Number(bundle.summary?.threadCount) || threads.length,
    turnCount: Number(bundle.summary?.turnCount) || turns.length
  };
}

function summarizeModuleImportPayload(payload, commentBundle = null) {
  const entry = sanitizeModuleEntry(payload?.entry || {});
  const section = cleanCustomSection({ ...(payload?.section || getPreferredEditorSection()), entries: [] });
  const pageCount = Array.isArray(entry.pages) ? entry.pages.length : 0;
  const lines = [
    `Titel: ${entry.title || '(ohne Titel)'}`,
    `ID: ${entry.id || '(ohne ID)'}`,
    `Bereich: ${section.tab || section.key}`,
    `Seiten: ${pageCount}`
  ];
  if (commentBundle) {
    const summary = getModuleImportCommentSummary(commentBundle);
    lines.push(`Kommentare im Paket: ${summary.commentCount} in ${summary.threadCount} Threads`);
  }
  return lines.join('\n');
}

function confirmModuleImportPayload(payload, actionLabel = 'Import übernehmen', commentBundle = null) {
  return confirm(`${actionLabel}?\n\n${summarizeModuleImportPayload(payload, commentBundle)}`);
}

function isBlank(value) {
  return !String(value || '').trim();
}

function validateModuleJsonSize(raw) {
  if (String(raw || '').length > MODULE_JSON_MAX_CHARS) {
    throw new Error(`JSON ist zu groß. Limit: ${Math.round(MODULE_JSON_MAX_CHARS / 1000)} KB.`);
  }
}

function isValidModuleAssetSrc(src) {
  const value = String(src || '').trim();
  if (!value) return true;
  if (/^data:/i.test(value)) return false;
  return !!sanitizeImageSrc(value);
}

function pushInvalidModuleAsset(errors, label, src) {
  if (!isValidModuleAssetSrc(src)) {
    errors.push(`${label}: ungültige Bild-URL.`);
  }
}

function hasModuleStats(stats) {
  return Array.isArray(stats) && stats.some(item => Array.isArray(item) && (String(item[0] || '').trim() || String(item[1] || '').trim()));
}

function hasModuleProfiles(page) {
  return Array.isArray(page?.profiles) && page.profiles.some(profile =>
    !isBlank(profile?.name) || !isBlank(profile?.role) || !isBlank(profile?.img)
  );
}

function hasModuleWanted(page) {
  return Array.isArray(page?.wanted) && page.wanted.some(item =>
    !isBlank(item?.name) || !isBlank(item?.role) || !isBlank(item?.img)
  );
}

function hasModuleSceneBlocks(page) {
  return Array.isArray(page?.sceneBlocks) && page.sceneBlocks.some(block =>
    !isBlank(block?.text) || !isBlank(block?.name) || !isBlank(block?.avatar)
  );
}

function hasModuleComments(page) {
  return Array.isArray(page?.commentSequence) && page.commentSequence.some(comment =>
    !isBlank(comment?.text) || !isBlank(comment?.charName) || !isBlank(comment?.portrait)
  );
}

function hasModulePageContent(page) {
  return !isBlank(page?.pageTitle)
    || !isBlank(page?.description)
    || !isBlank(page?.image)
    || !isBlank(page?.quote)
    || !!page?.bestiaryPage
    || !!page?.questFilePage
    || !!page?.artifactPage
    || !!page?.recipePage
    || !!page?.tournamentLeaguePage
    || hasModuleStats(page?.stats)
    || hasModuleSceneBlocks(page)
    || hasModuleWanted(page)
    || hasModuleProfiles(page)
    || hasModuleComments(page);
}

function validateModulePageAssets(errors, page, index) {
  const prefix = `Seite ${index + 1}`;
  pushInvalidModuleAsset(errors, `${prefix} Bild`, page.image);
  pushInvalidModuleAsset(errors, `${prefix} Kopfgeld-Hintergrund`, page.wantedBackground);
  pushInvalidModuleAsset(errors, `${prefix} Profil-Hintergrund`, page.profileBackground);
  pushInvalidModuleAsset(errors, `${prefix} Bestiarium-Hintergrund`, page.bestiary?.backgroundImage);
  pushInvalidModuleAsset(errors, `${prefix} Bestiarium-Zitatportrait`, page.bestiary?.quotePortrait);
  pushInvalidModuleAsset(errors, `${prefix} Questakte-Banner`, page.questFile?.bannerImage);
  pushInvalidModuleAsset(errors, `${prefix} Questakte-Wappen`, page.questFile?.crestImage);
  pushInvalidModuleAsset(errors, `${prefix} Questakte-Auftraggeberportrait`, page.questFile?.clientPortrait);
  pushInvalidModuleAsset(errors, `${prefix} Questakte-Skizze`, page.questFile?.sketchImage);

  (page.sceneBlocks || []).forEach((block, blockIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Szene ${blockIndex + 1} Avatar`, block.avatar);
  });
  (page.wanted || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Kopfgeld ${itemIndex + 1} Bild`, item.img);
  });
  (page.profiles || []).forEach((profile, profileIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Profil ${profileIndex + 1} Bild`, profile.img);
  });
  (page.recipe?.ingredients || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezeptzutat ${itemIndex + 1} Icon`, item.icon);
  });
  (page.recipe?.equipment || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezeptausrüstung ${itemIndex + 1} Icon`, item.icon);
  });
  (page.recipe?.steps || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezeptschritt ${itemIndex + 1} Icon`, item.icon);
  });
  (page.recipe?.warnings || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezeptwarnung ${itemIndex + 1} Icon`, item.icon);
  });
  (page.recipe?.properties || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezepteigenschaft ${itemIndex + 1} Icon`, item.icon);
  });
  (page.recipe?.variants || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Rezeptvariante ${itemIndex + 1} Icon`, item.icon);
  });
  (page.tournamentLeague?.standings || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Turnierregister Rang ${itemIndex + 1} Wappen`, item.crest);
  });
  (page.tournamentLeague?.matchups || []).forEach((item, itemIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Turnierregister Begegnung ${itemIndex + 1} linkes Portrait`, item.leftPortrait);
    pushInvalidModuleAsset(errors, `${prefix} Turnierregister Begegnung ${itemIndex + 1} linkes Wappen`, item.leftCrest);
    pushInvalidModuleAsset(errors, `${prefix} Turnierregister Begegnung ${itemIndex + 1} rechtes Portrait`, item.rightPortrait);
    pushInvalidModuleAsset(errors, `${prefix} Turnierregister Begegnung ${itemIndex + 1} rechtes Wappen`, item.rightCrest);
  });
  pushInvalidModuleAsset(errors, `${prefix} Turnierregister Ritterportrait`, page.tournamentLeague?.featuredPortrait);
  pushInvalidModuleAsset(errors, `${prefix} Turnierregister Ritterwappen`, page.tournamentLeague?.featuredCrest);
  pushInvalidModuleAsset(errors, `${prefix} Turnierregister Turnierplatz`, page.tournamentLeague?.locationImage);
  ['combatTypes', 'rumors', 'injuries', 'topHits', 'chronicle'].forEach(listName => {
    (page.tournamentLeague?.[listName] || []).forEach((item, itemIndex) => {
      pushInvalidModuleAsset(errors, `${prefix} Turnierregister ${listName} ${itemIndex + 1} Icon`, item.icon);
    });
  });
  (page.commentSequence || []).forEach((comment, commentIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Kommentar ${commentIndex + 1} Portrait`, comment.portrait);
  });
  (page.questFile?.contacts || []).forEach((contact, contactIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Questkontakt ${contactIndex + 1} Bild`, contact.image);
  });
  (page.questFile?.rewards || []).forEach((reward, rewardIndex) => {
    pushInvalidModuleAsset(errors, `${prefix} Questbelohnung ${rewardIndex + 1} Bild`, reward.image);
  });
}

function findModuleIdConflict(entryId, context) {
  const sourceId = context?.sourceEntryId || '';
  const sourceKind = context?.sourceKind || '';
  const sameEditedEntry = context?.mode === 'edit' && sourceId === entryId;
  const custom = findCustomSectionByEntryId(entryId);
  if (custom && !(sameEditedEntry && sourceKind === 'custom')) {
    return 'Diese Modul-ID existiert bereits als eigenes Modul.';
  }
  if (_entryOverrides[entryId] && !(sameEditedEntry && sourceKind === 'override')) {
    return 'Diese Modul-ID existiert bereits als gespeicherte Bearbeitung.';
  }
  return '';
}

function validateModulePayload(payload, context = {}) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { ok: false, errors: ['Moduldaten fehlen.'], entry: null };
  }

  const entry = sanitizeModuleEntry(payload.entry || {});
  if (context.mode === 'edit' && context.sourceEntryId) entry.id = context.sourceEntryId;
  const section = cleanCustomSection({ ...(payload.section || {}), entries: [] });

  if (isBlank(entry.title)) errors.push('Titel fehlt.');
  if (isBlank(entry.id)) errors.push('ID fehlt.');
  if (!isBlank(entry.id) && !MODULE_ID_PATTERN.test(entry.id)) {
    errors.push('ID darf nur Kleinbuchstaben, Zahlen und Bindestriche enthalten und maximal 80 Zeichen lang sein.');
  }
  const conflict = entry.id && !context.skipIdConflict ? findModuleIdConflict(entry.id, context) : '';
  if (conflict) errors.push(conflict);
  if (isBlank(section.key) && isBlank(section.tab)) errors.push('Bereich fehlt.');

  pushInvalidModuleAsset(errors, 'Kartenbild', entry.image);
  pushInvalidModuleAsset(errors, 'Symbol', entry.symbol);

  if (!Array.isArray(entry.pages) || !entry.pages.length) {
    errors.push('Mindestens eine Seite ist erforderlich.');
  } else {
    entry.pages.forEach((page, index) => {
      if (!hasModulePageContent(page)) errors.push(`Seite ${index + 1} ist leer.`);
      validateModulePageAssets(errors, page, index);
    });
  }

  let json = '';
  try {
    json = modulePayloadToJson({ section, entry });
    validateModuleJsonSize(json);
  } catch (error) {
    errors.push(error.message || 'JSON konnte nicht geprüft werden.');
  }

  return { ok: errors.length === 0, errors, section, entry, json };
}

function assertValidModulePayload(payload, context = {}) {
  const result = validateModulePayload(payload, context);
  if (!result.ok) {
    const visible = result.errors.slice(0, 6).join(' · ');
    const suffix = result.errors.length > 6 ? ` · +${result.errors.length - 6} weitere` : '';
    throw new Error(visible + suffix);
  }
  return result;
}

function modulePayloadToJson(payload) {
  return JSON.stringify({
    type: 'aleria-module',
    version: MODULE_EXPORT_SCHEMA_VERSION,
    section: payload.section,
    entry: sanitizeModuleEntry(payload.entry)
  }, null, 2);
}

function normalizeModuleImportPayload(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('Modul-JSON ist ungültig.');
  const isPackage = parsed.type === 'aleria-module-package';
  const moduleSource = isPackage ? (parsed.module || parsed.payload || {}) : parsed;
  const payload = moduleSource?.entry
    ? { section: moduleSource.section || getPreferredEditorSection(), entry: moduleSource.entry }
    : { section: getPreferredEditorSection(), entry: moduleSource };
  if (!payload.entry || typeof payload.entry !== 'object') {
    throw new Error('Im JSON wurde kein Modul-Eintrag gefunden.');
  }
  const commentBundle = isPackage
    ? normalizeModuleCommentImportBundle(parsed.commentsExport || parsed.commentsBundle || parsed, payload.entry)
    : null;
  return {
    section: cleanCustomSection({ ...payload.section, entries: [] }),
    entry: sanitizeModuleEntry(payload.entry),
    sectionSignature: moduleSource?.section ? makeSectionSignature(moduleSource.section) : '__new__',
    commentBundle
  };
}

function normalizeModuleCommentImportBundle(source, entry) {
  if (!source || typeof source !== 'object') return null;
  const threads = Array.isArray(source.threads) ? cloneForBackup(source.threads) : [];
  const comments = Array.isArray(source.comments)
    ? cloneForBackup(source.comments)
    : threads.flatMap(thread => Array.isArray(thread?.comments) ? thread.comments : []).map(cloneForBackup);
  const commentTurns = Array.isArray(source.commentTurns)
    ? cloneForBackup(source.commentTurns)
    : threads.map(thread => thread?.turn).filter(Boolean).map(cloneForBackup);
  if (!comments.length && !commentTurns.length && !threads.length) return null;
  const sourceModuleId = String(source.source?.moduleId || entry?.id || '').trim();
  return {
    type: 'aleria-module-comments-export',
    version: source.version || MODULE_COMMENT_EXPORT_SCHEMA_VERSION,
    source: {
      ...(source.source || {}),
      moduleId: sourceModuleId
    },
    summary: source.summary || {
      commentCount: comments.length,
      threadCount: threads.length,
      turnCount: commentTurns.length
    },
    threads,
    comments,
    commentTurns
  };
}
