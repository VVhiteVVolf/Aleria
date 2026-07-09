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
  'export-template-transfer',
  'open-template-transfer-import',
  'export-selected-comment-thread',
  'export-all-modules',
  'open-module-import-file',
  'open-comment-thread-import-file',
  'load-comment-thread-sources',
  'rescue-comment-thread-from-firebase',
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
  'add-biography-ability-row',
  'remove-biography-ability-row',
  'pick-biography-ability-icon',
  'add-biography-section-row',
  'remove-biography-section-row',
  'add-house-stat-row',
  'remove-house-stat-row',
  'schema-add-row',
  'schema-remove-row',
  'schema-pick-icon',
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
  'add-bounty-row',
  'remove-bounty-row',
  'add-goods-row',
  'import-goods-item',
  'remove-goods-row',
  'add-trade-row',
  'import-trade-item',
  'remove-trade-row',
  'stamp-trade-attributes',
  'apply-trade-attributes-stamp',
  'add-landing-member',
  'remove-landing-member',
  'add-landing-quest',
  'remove-landing-quest',
  'add-landing-note',
  'remove-landing-note',
  'add-landing-event',
  'remove-landing-event',
  'add-landing-info',
  'remove-landing-info',
  'add-ci-row',
  'remove-ci-row',
  'add-ci-attribute',
  'remove-ci-attribute',
  'add-ci-category',
  'remove-ci-category',
  'add-ci-item-from-register',
  'add-ci-item',
  'remove-ci-item',
  'move-ci-item',
  'duplicate-ci-item',
  'add-ci-item-row',
  'add-ci-item-attribute',
  'add-ci-companion',
  'remove-ci-companion',
  'move-ci-companion',
  'duplicate-ci-companion',
  'add-ci-companion-row',
  'add-ci-companion-attribute',
  'add-guest-register-section',
  'remove-guest-register-section',
  'move-guest-register-section',
  'add-guest-register-guest',
  'remove-guest-register-guest',
  'move-guest-register-guest',
  'add-guest-register-row',
  'remove-guest-register-row',
  'add-hierarchy-detail',
  'remove-hierarchy-detail',
  'add-hierarchy-tree',
  'remove-hierarchy-tree',
  'add-hierarchy-level',
  'add-hierarchy-level-after',
  'remove-hierarchy-level',
  'move-hierarchy-level',
  'add-hierarchy-node',
  'remove-hierarchy-node',
  'add-family-detail',
  'remove-family-detail',
  'add-family-tree',
  'remove-family-tree',
  'add-family-level',
  'add-family-level-after',
  'remove-family-level',
  'move-family-level',
  'add-family-node',
  'remove-family-node',
  'add-family-sibling',
  'add-family-connection',
  'remove-family-connection',
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
  'add-card-layout-heading',
  'add-card-layout-row',
  'remove-card-layout-block',
  'move-card-layout-block',
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
  if (action === 'export-template-transfer') {
    exportModuleTemplateTransferFromEditor(trigger);
    return;
  }
  if (action === 'open-template-transfer-import') {
    openModuleTemplateTransferImport(trigger);
    return;
  }
  if (action === 'export-selected-comment-thread') {
    exportSelectedModuleEditorCommentThread();
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
  if (action === 'open-comment-thread-import-file') {
    openSelectedModuleEditorCommentThreadImport();
    return;
  }
  if (action === 'load-comment-thread-sources') {
    loadCurrentModuleCommentThreadSources();
    return;
  }
  if (action === 'rescue-comment-thread-from-firebase') {
    rescueSelectedModuleEditorCommentThreadFromFirebase();
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
  if (action === 'add-biography-ability-row') {
    addModuleBiographyAbilityRow(trigger);
    return;
  }
  if (action === 'remove-biography-ability-row') {
    removeModuleBiographyAbilityRow(trigger);
    return;
  }
  if (action === 'pick-biography-ability-icon') {
    openBiographyAbilityIconPicker(trigger);
    return;
  }
  if (action === 'add-biography-section-row') {
    addModuleBiographySectionRow(trigger, trigger.dataset.biographySectionPosition || 'afterIntro');
    return;
  }
  if (action === 'remove-biography-section-row') {
    removeModuleBiographySectionRow(trigger);
    return;
  }
  if (action === 'add-house-stat-row') {
    addModuleHouseStatRow(trigger);
    return;
  }
  if (action === 'remove-house-stat-row') {
    removeModuleHouseStatRow(trigger);
    return;
  }
  if (action === 'schema-add-row') {
    addSchemaRow(trigger, trigger.dataset.schemaKey, trigger.dataset.schemaArg || '');
    return;
  }
  if (action === 'schema-remove-row') {
    removeSchemaRow(trigger, trigger.dataset.schemaKey);
    return;
  }
  if (action === 'schema-pick-icon') {
    openSchemaIconPicker(trigger);
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
  if (action === 'add-bounty-row') {
    addModuleBountyRow(trigger, trigger.dataset.bountyList || '');
    return;
  }
  if (action === 'remove-bounty-row') {
    removeModuleBountyRow(trigger);
    return;
  }
  if (action === 'add-goods-row') {
    addModuleGoodsRow(trigger, trigger.dataset.goodsList || '');
    return;
  }
  if (action === 'import-goods-item') {
    importModuleGoodsItem(trigger);
    return;
  }
  if (action === 'remove-goods-row') {
    removeModuleGoodsRow(trigger);
    return;
  }
  if (action === 'add-trade-row') {
    addModuleTradeCatalogRow(trigger, trigger.dataset.tradeList || '');
    return;
  }
  if (action === 'import-trade-item') {
    importModuleTradeCatalogItem(trigger);
    return;
  }
  if (action === 'remove-trade-row') {
    removeModuleTradeCatalogRow(trigger);
    return;
  }
  if (action === 'stamp-trade-attributes') {
    stampModuleTradeCatalogAttributes(trigger);
    return;
  }
  if (action === 'apply-trade-attributes-stamp') {
    applyModuleTradeCatalogAttributeStamp(trigger);
    return;
  }
  if (action === 'add-landing-member') {
    addLandingEditorItem(trigger, 'member');
    return;
  }
  if (action === 'remove-landing-member') {
    removeLandingEditorItem(trigger, 'member');
    return;
  }
  if (action === 'add-landing-quest') {
    addLandingEditorItem(trigger, 'quest');
    return;
  }
  if (action === 'remove-landing-quest') {
    removeLandingEditorItem(trigger, 'quest');
    return;
  }
  if (action === 'add-landing-note') {
    addLandingEditorItem(trigger, 'note');
    return;
  }
  if (action === 'remove-landing-note') {
    removeLandingEditorItem(trigger, 'note');
    return;
  }
  if (action === 'add-landing-event') {
    addLandingEditorItem(trigger, 'event');
    return;
  }
  if (action === 'remove-landing-event') {
    removeLandingEditorItem(trigger, 'event');
    return;
  }
  if (action === 'add-landing-info') {
    addLandingEditorItem(trigger, 'info');
    return;
  }
  if (action === 'remove-landing-info') {
    removeLandingEditorItem(trigger, 'info');
    return;
  }
  if (action === 'add-ci-row') {
    addCharacterInventoryRow(trigger);
    return;
  }
  if (action === 'remove-ci-row') {
    removeCharacterInventoryRow(trigger);
    return;
  }
  if (action === 'add-ci-attribute') {
    addCharacterInventoryAttribute(trigger);
    return;
  }
  if (action === 'remove-ci-attribute') {
    removeCharacterInventoryAttribute(trigger);
    return;
  }
  if (action === 'add-ci-category') {
    addCharacterInventoryCategory(trigger);
    return;
  }
  if (action === 'remove-ci-category') {
    removeCharacterInventoryCategory(trigger);
    return;
  }
  if (action === 'add-ci-item') {
    addCharacterInventoryItem(trigger);
    return;
  }
  if (action === 'add-ci-item-from-register') {
    addCharacterInventoryItemFromRegister(trigger);
    return;
  }
  if (action === 'remove-ci-item') {
    removeCharacterInventoryItem(trigger);
    return;
  }
  if (action === 'move-ci-item') {
    moveCharacterInventoryItem(trigger);
    return;
  }
  if (action === 'duplicate-ci-item') {
    duplicateCharacterInventoryItem(trigger);
    return;
  }
  if (action === 'add-ci-item-row') {
    addCharacterInventoryNestedRow(trigger, 'item');
    return;
  }
  if (action === 'add-ci-item-attribute') {
    addCharacterInventoryNestedAttribute(trigger, 'item');
    return;
  }
  if (action === 'add-ci-companion') {
    addCharacterInventoryCompanion(trigger);
    return;
  }
  if (action === 'remove-ci-companion') {
    removeCharacterInventoryCompanion(trigger);
    return;
  }
  if (action === 'move-ci-companion') {
    moveCharacterInventoryCompanion(trigger);
    return;
  }
  if (action === 'duplicate-ci-companion') {
    duplicateCharacterInventoryCompanion(trigger);
    return;
  }
  if (action === 'add-ci-companion-row') {
    addCharacterInventoryNestedRow(trigger, 'companion');
    return;
  }
  if (action === 'add-ci-companion-attribute') {
    addCharacterInventoryNestedAttribute(trigger, 'companion');
    return;
  }
  if (action === 'add-guest-register-section') {
    addGuestRegisterSection(trigger);
    return;
  }
  if (action === 'remove-guest-register-section') {
    removeGuestRegisterSection(trigger);
    return;
  }
  if (action === 'move-guest-register-section') {
    moveGuestRegisterSection(trigger);
    return;
  }
  if (action === 'add-guest-register-guest') {
    addGuestRegisterGuest(trigger);
    return;
  }
  if (action === 'remove-guest-register-guest') {
    removeGuestRegisterGuest(trigger);
    return;
  }
  if (action === 'move-guest-register-guest') {
    moveGuestRegisterGuest(trigger);
    return;
  }
  if (action === 'add-guest-register-row') {
    addGuestRegisterRow(trigger);
    return;
  }
  if (action === 'remove-guest-register-row') {
    removeGuestRegisterRow(trigger);
    return;
  }
  if (action === 'add-hierarchy-detail') {
    addModuleHierarchyDetail(trigger);
    return;
  }
  if (action === 'remove-hierarchy-detail') {
    removeModuleHierarchyDetail(trigger);
    return;
  }
  if (action === 'add-hierarchy-tree') {
    addModuleHierarchyTree(trigger);
    return;
  }
  if (action === 'remove-hierarchy-tree') {
    removeModuleHierarchyTree(trigger);
    return;
  }
  if (action === 'add-hierarchy-level') {
    addModuleHierarchyLevel(trigger);
    return;
  }
  if (action === 'add-hierarchy-level-after') {
    addModuleHierarchyLevelAfter(trigger);
    return;
  }
  if (action === 'remove-hierarchy-level') {
    removeModuleHierarchyLevel(trigger);
    return;
  }
  if (action === 'move-hierarchy-level') {
    moveModuleHierarchyLevel(trigger);
    return;
  }
  if (action === 'add-hierarchy-node') {
    addModuleHierarchyNode(trigger);
    return;
  }
  if (action === 'remove-hierarchy-node') {
    removeModuleHierarchyNode(trigger);
    return;
  }
  if (action === 'add-family-detail') {
    addModuleFamilyDetail(trigger);
    return;
  }
  if (action === 'remove-family-detail') {
    removeModuleFamilyDetail(trigger);
    return;
  }
  if (action === 'add-family-tree') {
    addModuleFamilyTree(trigger);
    return;
  }
  if (action === 'remove-family-tree') {
    removeModuleFamilyTree(trigger);
    return;
  }
  if (action === 'add-family-level') {
    addModuleFamilyLevel(trigger);
    return;
  }
  if (action === 'add-family-level-after') {
    addModuleFamilyLevelAfter(trigger);
    return;
  }
  if (action === 'remove-family-level') {
    removeModuleFamilyLevel(trigger);
    return;
  }
  if (action === 'move-family-level') {
    moveModuleFamilyLevel(trigger);
    return;
  }
  if (action === 'add-family-node') {
    addModuleFamilyNode(trigger);
    return;
  }
  if (action === 'remove-family-node') {
    removeModuleFamilyNode(trigger);
    return;
  }
  if (action === 'add-family-sibling') {
    addModuleFamilySibling(trigger);
    return;
  }
  if (action === 'add-family-connection') {
    addModuleFamilyConnection(trigger);
    return;
  }
  if (action === 'remove-family-connection') {
    removeModuleFamilyConnection(trigger);
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
  if (action === 'add-card-layout-heading') {
    addModuleCardLayoutHeading(trigger);
    return;
  }
  if (action === 'add-card-layout-row') {
    addModuleCardLayoutRow(trigger);
    return;
  }
  if (action === 'remove-card-layout-block') {
    removeModuleCardLayoutBlock(trigger);
    return;
  }
  if (action === 'move-card-layout-block') {
    moveModuleCardLayoutBlock(trigger);
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
  if (action === 'refresh-ci-preview') {
    refreshCharacterInventoryEditorPreview(field);
    return;
  }
  if (action === 'refresh-family-node-options') {
    refreshFamilyNodeDatalist(field);
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
  if (action === 'import-template-transfer-file') {
    handleModuleTemplateTransferImportFile(field);
    return;
  }
  if (action === 'import-comment-thread-file') {
    handleSelectedModuleEditorCommentThreadImport(field);
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
