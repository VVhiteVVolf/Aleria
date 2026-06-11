// Delegated events for inline editor panels and feature-specific sub-editors.

const INLINE_EDITOR_CLICK_ACTIONS = new Set([
  'add-stat-row',
  'remove-stat-row',
  'add-comment-block',
  'remove-comment-block',
  'add-scene-block',
  'remove-scene-block',
  'replace-scene-speaker',
  'add-profile-card',
  'remove-profile-card',
  'add-profile-stat',
  'remove-profile-stat',
  'add-wanted-card',
  'remove-wanted-card',
  'add-biography-connection',
  'remove-biography-connection',
  'add-biography-document',
  'remove-biography-document',
  'add-biography-line-row',
  'remove-biography-line-row',
  'add-bestiary-list-row',
  'remove-bestiary-list-row',
  'add-artifact-list-row',
  'remove-artifact-list-row',
  'add-recipe-list-row',
  'remove-recipe-list-row',
  'add-caste-list-row',
  'remove-caste-list-row',
  'add-court-list-row',
  'remove-court-list-row',
  'add-tleague-row',
  'remove-tleague-row',
  'add-tournament-line-row',
  'remove-tournament-line-row',
  'add-tournament-side-card',
  'remove-tournament-side-card',
  'add-quest-list-row',
  'remove-quest-list-row'
]);

function handleInlineEditorActionClick(event) {
  const trigger = event.target?.closest?.('[data-inline-action]');
  if (!trigger || !trigger.closest('#modal-overlay')) return;
  const action = trigger.dataset.inlineAction;
  if (!INLINE_EDITOR_CLICK_ACTIONS.has(action)) return;

  event.preventDefault();
  _inlineEditorEventSource = trigger;
  try {

  if (action === 'add-stat-row') {
    addInlineStatRow(trigger);
    return;
  }
  if (action === 'remove-stat-row') {
    removeInlineStatRow(Number(trigger.dataset.statIndex) || 0, trigger);
    return;
  }
  if (action === 'add-comment-block') {
    addInlineCommentBlock(trigger.dataset.commentKind || 'character', trigger);
    return;
  }
  if (action === 'remove-comment-block') {
    removeInlineCommentBlock(Number(trigger.dataset.commentIndex) || 0, trigger);
    return;
  }
  if (action === 'add-scene-block') {
    addInlineSceneBlock(trigger.dataset.sceneKind || 'speech', trigger);
    return;
  }
  if (action === 'remove-scene-block') {
    removeInlineSceneBlock(Number(trigger.dataset.sceneIndex) || 0, trigger);
    return;
  }
  if (action === 'replace-scene-speaker') {
    const tools = trigger.closest('.module-scene-speaker-tools');
    replaceInlineSceneSpeaker(
      String(tools?.querySelector('[data-inline-role="scene-replace-source"]')?.value || ''),
      String(tools?.querySelector('[data-inline-role="scene-replace-target"]')?.value || ''),
      trigger
    );
    return;
  }
  if (action === 'add-profile-card') {
    addInlineProfileCard();
    return;
  }
  if (action === 'remove-profile-card') {
    removeInlineProfileCard(Number(trigger.dataset.profileIndex) || 0);
    return;
  }
  if (action === 'add-profile-stat') {
    addInlineProfileStat(Number(trigger.dataset.profileIndex) || 0);
    return;
  }
  if (action === 'remove-profile-stat') {
    removeInlineProfileStat(
      Number(trigger.dataset.profileIndex) || 0,
      Number(trigger.dataset.profileFieldIndex) || 0
    );
    return;
  }
  if (action === 'add-wanted-card') {
    addInlineWantedCard();
    return;
  }
  if (action === 'remove-wanted-card') {
    removeInlineWantedCard(Number(trigger.dataset.wantedIndex) || 0);
    return;
  }
  if (action === 'add-biography-connection') {
    addInlineBiographyConnectionRow();
    return;
  }
  if (action === 'remove-biography-connection') {
    removeInlineBiographyConnectionRow(Number(trigger.dataset.biographyConnectionIndex) || 0);
    return;
  }
  if (action === 'add-biography-document') {
    addInlineBiographyDocumentRow();
    return;
  }
  if (action === 'remove-biography-document') {
    removeInlineBiographyDocumentRow(Number(trigger.dataset.biographyDocumentIndex) || 0);
    return;
  }
  if (action === 'add-biography-line-row') {
    addInlineBiographyLineRow(trigger.dataset.biographyLineList || '');
    return;
  }
  if (action === 'remove-biography-line-row') {
    removeInlineBiographyLineRow(
      trigger.dataset.biographyLineList || '',
      Number(trigger.dataset.biographyLineIndex) || 0
    );
    return;
  }
  if (action === 'add-bestiary-list-row') {
    addInlineBestiaryListRow(trigger.dataset.bestiaryList || '');
    return;
  }
  if (action === 'remove-bestiary-list-row') {
    removeInlineBestiaryListRow(
      trigger.dataset.bestiaryList || '',
      Number(trigger.dataset.bestiaryIndex) || 0
    );
    return;
  }
  if (action === 'add-artifact-list-row') {
    addInlineArtifactListRow(trigger.dataset.artifactList || '');
    return;
  }
  if (action === 'remove-artifact-list-row') {
    removeInlineArtifactListRow(
      trigger.dataset.artifactList || '',
      Number(trigger.dataset.artifactIndex) || 0
    );
    return;
  }
  if (action === 'add-recipe-list-row') {
    addInlineRecipeListRow(trigger.dataset.recipeList || '');
    return;
  }
  if (action === 'remove-recipe-list-row') {
    removeInlineRecipeListRow(
      trigger.dataset.recipeList || '',
      Number(trigger.dataset.recipeIndex) || 0
    );
    return;
  }
  if (action === 'add-caste-list-row') {
    addInlineCasteListRow(trigger.dataset.casteList || '');
    return;
  }
  if (action === 'remove-caste-list-row') {
    removeInlineCasteListRow(
      trigger.dataset.casteList || '',
      Number(trigger.dataset.casteIndex) || 0
    );
    return;
  }
  if (action === 'add-court-list-row') {
    addInlineCourtListRow(trigger.dataset.courtList || '');
    return;
  }
  if (action === 'remove-court-list-row') {
    removeInlineCourtListRow(
      trigger.dataset.courtList || '',
      Number(trigger.dataset.courtIndex) || 0
    );
    return;
  }
  if (action === 'add-tleague-row') {
    addInlineTournamentLeagueRow(trigger.dataset.tleagueList || '');
    return;
  }
  if (action === 'remove-tleague-row') {
    removeInlineTournamentLeagueRow(
      trigger.dataset.tleagueList || '',
      Number(trigger.dataset.tleagueIndex) || 0
    );
    return;
  }
  if (action === 'add-tournament-line-row') {
    addInlineTournamentLineRow(trigger.dataset.tournamentList || '');
    return;
  }
  if (action === 'remove-tournament-line-row') {
    removeInlineTournamentLineRow(
      trigger.dataset.tournamentList || '',
      Number(trigger.dataset.tournamentIndex) || 0
    );
    return;
  }
  if (action === 'add-tournament-side-card') {
    addInlineTournamentSideCard(trigger.dataset.tournamentList || '');
    return;
  }
  if (action === 'remove-tournament-side-card') {
    removeInlineTournamentSideCard(
      trigger.dataset.tournamentList || '',
      Number(trigger.dataset.tournamentIndex) || 0
    );
    return;
  }
  if (action === 'add-quest-list-row') {
    addInlineQuestFileListRow(trigger.dataset.questList || '');
    return;
  }
  if (action === 'remove-quest-list-row') {
    removeInlineQuestFileListRow(
      trigger.dataset.questList || '',
      Number(trigger.dataset.questIndex) || 0
    );
  }
  } finally {
    _inlineEditorEventSource = null;
  }
}

function handleInlineEditorFieldChange(event) {
  const field = event.target;
  if (!field?.closest?.('#modal-overlay')) return;
  const action = field.dataset?.inlineAction;
  if (!action) return;
  _inlineEditorEventSource = field;
  try {

  if (action === 'sync-page-field') {
    syncInlinePageField(field);
    return;
  }
  if (action === 'rerender-entry-field') {
    if (event.type === 'change') rerenderAfterInlineMetaChange(field);
    else syncInlineEntryField(field);
    return;
  }
  if (action === 'rerender-page-field') {
    if (event.type === 'change') rerenderAfterInlinePageChange(field);
    else syncInlinePageField(field);
    return;
  }
  if (action === 'sync-module-size-field') {
    syncInlineModuleSizeField(field);
    return;
  }
  if (action === 'set-module-section') {
    if (event.type === 'change') setInlineModuleSection(field.value);
    return;
  }
  if (action === 'update-stat-field') {
    updateInlineStatField(field);
    return;
  }
  if (action === 'update-comment-field') {
    updateInlineCommentField(field);
    return;
  }
  if (action === 'update-scene-field') {
    updateInlineSceneField(field);
    return;
  }
  if (action === 'update-profile-field') {
    if (event.type === 'change') updateInlineProfileField(field);
    return;
  }
  if (action === 'update-profile-card-field') {
    updateInlineProfileCardField(field);
    return;
  }
  if (action === 'update-profile-stat-field') {
    updateInlineProfileStatField(field);
    return;
  }
  if (action === 'update-wanted-field') {
    if (event.type === 'change') updateInlineWantedField(field);
    return;
  }
  if (action === 'update-wanted-card-field') {
    updateInlineWantedCardField(field);
    return;
  }
  if (action === 'update-biography-field') {
    updateInlineBiographyField(field);
    return;
  }
  if (action === 'update-biography-line-field') {
    updateInlineBiographyLineField(field);
    return;
  }
  if (action === 'update-biography-ability-field') {
    updateInlineBiographyAbilityField(field);
    return;
  }
  if (action === 'update-biography-connection-field') {
    updateInlineBiographyConnectionField(field);
    return;
  }
  if (action === 'update-biography-document-field') {
    updateInlineBiographyDocumentField(field);
    return;
  }
  if (action === 'update-bestiary-field') {
    updateInlineBestiaryField(field);
    return;
  }
  if (action === 'update-bestiary-list-field') {
    updateInlineBestiaryListField(field);
    return;
  }
  if (action === 'update-artifact-field') {
    updateInlineArtifactField(field);
    return;
  }
  if (action === 'update-artifact-list-field') {
    updateInlineArtifactListField(field);
    return;
  }
  if (action === 'update-recipe-field') {
    updateInlineRecipeField(field);
    return;
  }
  if (action === 'update-recipe-list-field') {
    updateInlineRecipeListField(field);
    return;
  }
  if (action === 'update-caste-field') {
    updateInlineCasteField(field);
    return;
  }
  if (action === 'update-caste-list-field') {
    updateInlineCasteListField(field);
    return;
  }
  if (action === 'update-court-field') {
    updateInlineCourtField(field);
    return;
  }
  if (action === 'update-court-list-field') {
    updateInlineCourtListField(field);
    return;
  }
  if (action === 'update-tleague-field') {
    updateInlineTournamentLeagueField(field);
    return;
  }
  if (action === 'update-tleague-header-field') {
    updateInlineTournamentLeagueHeaderField(field);
    return;
  }
  if (action === 'update-tleague-row-field') {
    updateInlineTournamentLeagueRowField(field);
    return;
  }
  if (action === 'update-tournament-field') {
    updateInlineTournamentField(field);
    return;
  }
  if (action === 'update-tournament-line-field') {
    updateInlineTournamentLineField(field);
    return;
  }
  if (action === 'update-tournament-side-card-field') {
    updateInlineTournamentSideCardField(field);
    return;
  }
  if (action === 'update-tournament-participant-field') {
    updateInlineTournamentParticipantField(field);
    return;
  }
  if (action === 'update-tournament-score-field') {
    updateInlineTournamentScoreField(field);
    return;
  }
  if (action === 'update-quest-file-field') {
    updateInlineQuestFileField(field);
    return;
  }
  if (action === 'update-quest-list-field') {
    updateInlineQuestFileListField(field);
    return;
  }
  if (action === 'apply-template') {
    applyInlineModuleTemplate(field);
  }
  } finally {
    _inlineEditorEventSource = null;
  }
}

document.addEventListener('click', handleInlineEditorActionClick);
document.addEventListener('input', handleInlineEditorFieldChange);
document.addEventListener('change', handleInlineEditorFieldChange);
