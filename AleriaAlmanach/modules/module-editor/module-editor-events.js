// Delegated events for the static module editor overlay.

const MODULE_EDITOR_CLICK_ACTIONS = new Set([
  'close',
  'unlock',
  'apply-template',
  'sync-json-preview',
  'apply-json',
  'load-json-as-new',
  'export-module',
  'export-module-comments',
  'export-all-modules',
  'open-module-import-file',
  'export-full-backup',
  'cleanup-local-storage',
  'undo-import',
  'delete-module',
  'move-page',
  'duplicate-page',
  'remove-page',
  'toggle-cast-option',
  'move-cast-chip',
  'remove-cast-chip',
  'add-scene-block',
  'insert-scene-speech',
  'insert-scene-thought',
  'insert-scene-action',
  'move-scene-block',
  'duplicate-scene-block',
  'remove-scene-block',
  'replace-scene-speaker',
  'add-comment-block',
  'insert-comment-reply',
  'insert-comment-narrator',
  'move-comment-block',
  'duplicate-comment-block',
  'remove-comment-block',
  'add-simple-line-row',
  'remove-simple-line-row',
  'add-biography-stat-row',
  'remove-biography-stat-row',
  'add-bestiary-row',
  'remove-bestiary-row',
  'add-tournament-league-row',
  'remove-tournament-league-row',
  'add-tournament-line-row',
  'remove-tournament-line-row',
  'add-tournament-side-card',
  'remove-tournament-side-card',
  'add-quest-file-row',
  'remove-quest-file-row',
  'add-recipe-row',
  'remove-recipe-row',
  'add-caste-row',
  'remove-caste-row',
  'add-court-row',
  'remove-court-row',
  'add-biography-connection-row',
  'remove-biography-connection-row',
  'add-biography-document-row',
  'remove-biography-document-row',
  'add-profile-card',
  'remove-profile-card',
  'add-profile-field',
  'remove-profile-field',
  'add-wanted-card',
  'remove-wanted-card',
  'save'
]);

function handleModuleEditorActionClick(event) {
  const trigger = event.target?.closest?.('[data-module-editor-action]');
  if (!trigger || !trigger.closest('#module-editor-overlay')) return;
  const action = trigger.dataset.moduleEditorAction;
  if (!MODULE_EDITOR_CLICK_ACTIONS.has(action)) return;

  event.preventDefault();

  if (action === 'close') {
    closeModuleEditor();
    return;
  }
  if (action === 'unlock') {
    unlockModuleEditor();
    return;
  }
  if (action === 'apply-template') {
    applyModuleTemplateFromEditor();
    return;
  }
  if (action === 'sync-json-preview') {
    syncModuleJsonPreview();
    return;
  }
  if (action === 'apply-json') {
    applyModuleJsonToEditor();
    return;
  }
  if (action === 'load-json-as-new') {
    loadModuleJsonFromTextarea();
    return;
  }
  if (action === 'export-module') {
    exportModuleFromEditor();
    return;
  }
  if (action === 'export-module-comments') {
    exportModuleCommentsFromEditor();
    return;
  }
  if (action === 'export-all-modules') {
    exportAllModulePackages();
    return;
  }
  if (action === 'open-module-import-file') {
    document.getElementById('me-module-import-file')?.click();
    return;
  }
  if (action === 'export-full-backup') {
    exportFullAlmanachBackup();
    return;
  }
  if (action === 'cleanup-local-storage') {
    runManualLocalStorageCleanup();
    return;
  }
  if (action === 'undo-import') {
    undoLastModuleEditorImport();
    return;
  }
  if (action === 'delete-module') {
    deleteModuleFromEditor();
    return;
  }
  if (action === 'move-page') {
    moveModulePage(trigger, Number(trigger.dataset.pageDirection) || 0);
    return;
  }
  if (action === 'duplicate-page') {
    duplicateModulePage(trigger);
    return;
  }
  if (action === 'remove-page') {
    removeModulePage(trigger);
    return;
  }
  if (action === 'toggle-cast-option') {
    toggleModuleCastPickerOption(trigger);
    return;
  }
  if (action === 'move-cast-chip') {
    moveModuleCastChip(trigger, Number(trigger.dataset.castDirection) || 0);
    return;
  }
  if (action === 'remove-cast-chip') {
    removeModuleCastChip(trigger);
    return;
  }
  if (action === 'add-scene-block') {
    addModuleSceneBlock(trigger, trigger.dataset.sceneType || 'speech');
    return;
  }
  if (action === 'insert-scene-speech') {
    insertModuleSceneSpeech(trigger, trigger.dataset.sceneSide || 'left');
    return;
  }
  if (action === 'insert-scene-thought') {
    insertModuleSceneThought(trigger);
    return;
  }
  if (action === 'insert-scene-action') {
    insertModuleSceneAction(trigger);
    return;
  }
  if (action === 'move-scene-block') {
    moveModuleSceneBlock(trigger, Number(trigger.dataset.sceneDirection) || 0);
    return;
  }
  if (action === 'duplicate-scene-block') {
    duplicateModuleSceneBlock(trigger);
    return;
  }
  if (action === 'remove-scene-block') {
    removeModuleSceneBlock(trigger);
    return;
  }
  if (action === 'replace-scene-speaker') {
    replaceModuleSceneSpeaker(trigger);
    return;
  }
  if (action === 'add-comment-block') {
    addModuleCommentBlock(trigger, trigger.dataset.commentKind || 'character');
    return;
  }
  if (action === 'insert-comment-reply') {
    insertModuleCommentReply(trigger, trigger.dataset.commentSide || 'left');
    return;
  }
  if (action === 'insert-comment-narrator') {
    insertModuleCommentNarrator(trigger);
    return;
  }
  if (action === 'move-comment-block') {
    moveModuleCommentBlock(trigger, Number(trigger.dataset.commentDirection) || 0);
    return;
  }
  if (action === 'duplicate-comment-block') {
    duplicateModuleCommentBlock(trigger);
    return;
  }
  if (action === 'remove-comment-block') {
    removeModuleCommentBlock(trigger);
    return;
  }
  if (action === 'add-simple-line-row') {
    addModuleSimpleLineRow(trigger, trigger.dataset.simpleLineList || '');
    return;
  }
  if (action === 'remove-simple-line-row') {
    removeModuleSimpleLineRow(trigger);
    return;
  }
  if (action === 'add-biography-stat-row') {
    addModuleBiographyStatRow(trigger);
    return;
  }
  if (action === 'remove-biography-stat-row') {
    removeModuleBiographyStatRow(trigger);
    return;
  }
  if (action === 'add-bestiary-row') {
    addModuleBestiaryRow(trigger, trigger.dataset.bestiaryList || '');
    return;
  }
  if (action === 'remove-bestiary-row') {
    removeModuleBestiaryRow(trigger);
    return;
  }
  if (action === 'add-tournament-league-row') {
    addModuleTournamentLeagueRow(trigger, trigger.dataset.tleagueList || '');
    return;
  }
  if (action === 'remove-tournament-league-row') {
    removeModuleTournamentLeagueRow(trigger);
    return;
  }
  if (action === 'add-tournament-line-row') {
    addModuleTournamentLineRow(trigger, trigger.dataset.tournamentList || 'highlights');
    return;
  }
  if (action === 'remove-tournament-line-row') {
    removeModuleTournamentLineRow(trigger);
    return;
  }
  if (action === 'add-tournament-side-card') {
    addModuleTournamentSideCard(trigger, trigger.dataset.tournamentList || 'candidates');
    return;
  }
  if (action === 'remove-tournament-side-card') {
    removeModuleTournamentSideCard(trigger);
    return;
  }
  if (action === 'add-quest-file-row') {
    addModuleQuestFileRow(trigger, trigger.dataset.questList || '');
    return;
  }
  if (action === 'remove-quest-file-row') {
    removeModuleQuestFileRow(trigger);
    return;
  }
  if (action === 'add-recipe-row') {
    addModuleRecipeRow(trigger, trigger.dataset.recipeList || '');
    return;
  }
  if (action === 'remove-recipe-row') {
    removeModuleRecipeRow(trigger);
    return;
  }
  if (action === 'add-caste-row') {
    addModuleCasteRow(trigger, trigger.dataset.casteList || '');
    return;
  }
  if (action === 'remove-caste-row') {
    removeModuleCasteRow(trigger);
    return;
  }
  if (action === 'add-court-row') {
    addModuleCourtRow(trigger, trigger.dataset.courtList || '');
    return;
  }
  if (action === 'remove-court-row') {
    removeModuleCourtRow(trigger);
    return;
  }
  if (action === 'add-biography-connection-row') {
    addModuleBiographyConnectionRow(trigger);
    return;
  }
  if (action === 'remove-biography-connection-row') {
    removeModuleBiographyConnectionRow(trigger);
    return;
  }
  if (action === 'add-biography-document-row') {
    addModuleBiographyDocumentRow(trigger);
    return;
  }
  if (action === 'remove-biography-document-row') {
    removeModuleBiographyDocumentRow(trigger);
    return;
  }
  if (action === 'add-profile-card') {
    addModuleProfileCard(trigger);
    return;
  }
  if (action === 'remove-profile-card') {
    removeModuleProfileCard(trigger);
    return;
  }
  if (action === 'add-profile-field') {
    addModuleProfileField(trigger);
    return;
  }
  if (action === 'remove-profile-field') {
    removeModuleProfileField(trigger);
    return;
  }
  if (action === 'add-wanted-card') {
    addModuleWantedCard(trigger);
    return;
  }
  if (action === 'remove-wanted-card') {
    removeModuleWantedCard(trigger);
    return;
  }
  if (action === 'save') {
    saveModuleFromEditor();
  }
}

function handleModuleEditorFieldChange(event) {
  const field = event.target;
  if (!field?.closest?.('#module-editor-overlay')) return;
  const action = field.dataset?.moduleEditorAction;

  if (action === 'toggle-section-mode') {
    toggleModuleEditorSectionMode();
    return;
  }
  if (action === 'update-size-labels') {
    updateModuleSizeEditorLabels();
    return;
  }
  if (action === 'update-page-type') {
    updateModulePageType(field);
    return;
  }
  if (action === 'sync-cast-picker') {
    syncModuleCastPickerFromInput(field);
    return;
  }
  if (action === 'filter-cast-picker') {
    filterModuleCastPicker(field);
    return;
  }
  if (action === 'sync-json-preview') {
    syncModuleJsonPreview();
    return;
  }
  if (action === 'update-scene-block-type') {
    updateModuleSceneBlockType(field);
    return;
  }
  if (action === 'apply-scene-speech-preset') {
    applySceneSpeechPreset(field);
    return;
  }
  if (action === 'update-comment-block-type') {
    updateModuleCommentBlockType(field);
    return;
  }
  if (action === 'apply-comment-preset') {
    applyModuleCommentPreset(field);
    return;
  }
  if (action === 'apply-commentator-preset') {
    applyModuleCommentatorPreset(field);
    return;
  }
  if (action === 'update-range-percent-label') {
    const label = field.closest('.module-editor-field')?.querySelector('label span');
    if (label) label.textContent = `${field.value}%`;
    syncModuleJsonPreview();
    return;
  }
  if (action === 'toggle-image-width') {
    const range = field.closest('.module-editor-field')?.querySelector('.me-page-image-width');
    if (range) range.disabled = !field.checked;
    syncModuleJsonPreview();
    return;
  }
  if (action === 'rerender-tournament-grid') {
    rerenderModuleTournamentGrid(field);
    return;
  }
  if (action === 'add-page' && field.value) {
    addModulePage(field.value);
    field.value = '';
  }
}

function handleModuleEditorFileChange(event) {
  const field = event.target;
  if (!field?.closest?.('#module-editor-overlay')) return;
  const action = field.dataset?.moduleEditorAction;

  if (action === 'import-module-file') {
    handleModuleImportFile(field);
    return;
  }
  if (action === 'import-full-backup-file') {
    handleFullBackupImportFile(field);
  }
}

function handleModuleEditorActionKeydown(event) {
  const field = event.target;
  if (!field?.closest?.('#module-editor-overlay')) return;
  if (event.key !== 'Enter') return;
  if (field.dataset?.moduleEditorAction !== 'unlock-on-enter') return;

  event.preventDefault();
  unlockModuleEditor();
}

document.addEventListener('click', handleModuleEditorActionClick);
document.addEventListener('input', handleModuleEditorFieldChange);
document.addEventListener('change', handleModuleEditorFieldChange);
document.addEventListener('change', handleModuleEditorFileChange);
document.addEventListener('keydown', handleModuleEditorActionKeydown);
