async function handleTopicBoardStateAction(button, action) {
  const proposalId = String(button.dataset.topicBoardId || '').trim();
  if (!proposalId) return;
  button.disabled = true;
  try {
    if (action === 'vote') {
      await toggleTopicBoardProposalVote(proposalId);
    } else if (action === 'archive') {
      await setTopicBoardProposalArchived(proposalId, true);
      if (typeof showAppStatus === 'function') showAppStatus('Thema abgehakt und ins Archiv gelegt.', 'success');
    } else if (action === 'restore') {
      await setTopicBoardProposalArchived(proposalId, false);
      if (typeof showAppStatus === 'function') showAppStatus('Thema wieder an die offene Wand geheftet.', 'success');
    }
    renderTopicBoard();
  } catch (error) {
    if (typeof showAppStatus === 'function') {
      showAppStatus(typeof getFriendlyErrorMessage === 'function'
        ? getFriendlyErrorMessage(error, 'Die Themenwand konnte nicht aktualisiert werden.')
        : String(error?.message || 'Die Themenwand konnte nicht aktualisiert werden.'), 'error');
    }
  } finally {
    button.disabled = false;
  }
}

function handleTopicBoardClick(event) {
  const button = event.target?.closest?.('[data-topic-board-action]');
  if (!button) return;
  const action = button.dataset.topicBoardAction;
  if (!action) return;

  if (action === 'open-board') {
    event.preventDefault();
    openTopicBoardDialog();
  } else if (action === 'open-editor-from-sidebar') {
    event.preventDefault();
    openTopicBoardDialog({ editor: true });
  } else if (action === 'close-board') {
    event.preventDefault();
    closeTopicBoardDialog();
  } else if (action === 'open-editor') {
    event.preventDefault();
    openTopicBoardEditor();
  } else if (action === 'close-editor') {
    event.preventDefault();
    closeTopicBoardEditor();
  } else if (action === 'set-view') {
    event.preventDefault();
    setTopicBoardView(button.dataset.topicBoardView || TOPIC_BOARD_STATUS_OPEN);
    globalThis.AleriaTopicBoardListState.clearExpanded();
    renderTopicBoard();
  } else if (action === 'toggle-details') {
    event.preventDefault();
    toggleTopicBoardProposalDetails(button.dataset.topicBoardId || '');
  } else if (action === 'clear-list-filters') {
    event.preventDefault();
    globalThis.AleriaTopicBoardListState.resetFilters();
    renderTopicBoard();
  } else if (action === 'retry-sync') {
    event.preventDefault();
    globalThis.AleriaTopicBoardStore.retrySync();
    renderTopicBoard();
  } else if (action === 'scroll-editor-section') {
    event.preventDefault();
    globalThis.AleriaTopicBoardUI.scrollEditorToSection(button.dataset.topicBoardEditorSectionTarget || '');
  } else if (action === 'edit') {
    event.preventDefault();
    openTopicBoardEditor(button.dataset.topicBoardId || '');
  } else if (['vote', 'archive', 'restore'].includes(action)) {
    event.preventDefault();
    handleTopicBoardStateAction(button, action);
  } else if (action === 'toggle-character') {
    event.preventDefault();
    toggleTopicBoardCharacter(button.dataset.characterId || '');
  } else if (action === 'pick-icon') {
    event.preventDefault();
    openTopicBoardIconPicker(button.dataset.topicBoardIconTarget || 'theme');
  } else if (action === 'clear-icon') {
    event.preventDefault();
    setTopicBoardSelectedIcon(button.dataset.topicBoardIconTarget || 'theme', '');
  } else if (action === 'add-travel-stop') {
    event.preventDefault();
    globalThis.AleriaTopicBoardTravelUI.addStopover(button.closest('[data-topic-board-form]'));
    renderTopicBoardEditorPreview();
  } else if (action === 'remove-travel-stop') {
    event.preventDefault();
    globalThis.AleriaTopicBoardTravelUI.removeStopover(button);
    renderTopicBoardEditorPreview();
  } else if (action === 'set-schedule-offset') {
    event.preventDefault();
    const form = button.closest('[data-topic-board-form]');
    const travel = globalThis.AleriaTopicBoardTravelUI.collect(form);
    globalThis.AleriaTopicBoardScheduleUI.setOffset(form, button.dataset.topicBoardScheduleOffset, travel);
    renderTopicBoardEditorPreview();
  }
}

function handleTopicBoardInput(event) {
  const listField = event.target?.dataset?.topicBoardListField;
  if (listField) {
    if (listField === 'query') globalThis.AleriaTopicBoardListState.setQuery(event.target.value || '');
    else if (listField === 'category') globalThis.AleriaTopicBoardListState.setCategory(event.target.value || 'all');
    else if (listField === 'sort') globalThis.AleriaTopicBoardListState.setSort(event.target.value || 'votes');
    renderTopicBoardList();
    return;
  }
  const form = event.target?.closest?.('[data-topic-board-form]');
  if (!form) return;
  if (event.target?.dataset?.topicBoardField === 'character-search') {
    filterTopicBoardCharacters(event.target.value || '');
    return;
  }
  renderTopicBoardEditorPreview();
}

function handleTopicBoardSubmit(event) {
  if (!event.target?.matches?.('[data-topic-board-form]')) return;
  event.preventDefault();
  submitTopicBoardEditor();
}

function handleTopicBoardIconSelected(event) {
  if (!_topicBoardIconTarget || !document.querySelector('[data-topic-board-form]')) return;
  setTopicBoardSelectedIcon(_topicBoardIconTarget, event.detail?.src || '');
  _topicBoardIconTarget = '';
  if (typeof closeIconDirectory === 'function') closeIconDirectory();
}

function handleTopicBoardStateChanged() {
  updateTopicBoardSidebarSummary();
  if (!document.getElementById('topic-board-overlay')?.classList.contains('active')) return;
  renderTopicBoard();
  if (document.querySelector('[data-topic-board-form]')) renderTopicBoardEditorPreview();
}

function initializeTopicBoardFeature() {
  initializeTopicBoardState();
  updateTopicBoardSidebarSummary();
}

document.addEventListener('click', handleTopicBoardClick);
document.addEventListener('input', handleTopicBoardInput);
document.addEventListener('change', handleTopicBoardInput);
document.addEventListener('submit', handleTopicBoardSubmit);
document.addEventListener('almanach-icon-selected', handleTopicBoardIconSelected);
document.addEventListener('almanach-topic-board-state', handleTopicBoardStateChanged);
document.addEventListener('almanach-world-date-state', handleTopicBoardStateChanged);

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeTopicBoardFeature, { once: true });
else initializeTopicBoardFeature();
