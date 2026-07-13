// Reader-setting input delegation for comments.
function handleCommentReaderSettingInput(event) {
  const field = event.target;
  if (!field?.matches?.('[data-action="set-comment-reader-setting"]')) return;
  setCommentReaderSetting(field.dataset.readerSetting || '', field.value);
}

function toggleAnimalCommentReveal(trigger) {
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.classList.toggle('revealed', !expanded);
  trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function toggleCommentLanguageReveal(trigger) {
  const expanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.classList.toggle('revealed', !expanded);
  trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function handleCommentReaderClick(event) {
  const trigger = event.target?.closest?.('[data-action="toggle-animal-comment"], [data-action="toggle-comment-language"]');
  if (!trigger) return;
  event.preventDefault();
  if (trigger.dataset.action === 'toggle-comment-language') {
    toggleCommentLanguageReveal(trigger);
    return;
  }
  toggleAnimalCommentReveal(trigger);
}

document.addEventListener('input', handleCommentReaderSettingInput);
document.addEventListener('click', handleCommentReaderClick);
