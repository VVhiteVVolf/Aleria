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
  trigger.querySelector('.comment-animal-cipher')?.setAttribute('aria-hidden', expanded ? 'false' : 'true');
  trigger.querySelector('.comment-animal-plain')?.setAttribute('aria-hidden', expanded ? 'true' : 'false');
}

function handleCommentReaderClick(event) {
  const trigger = event.target?.closest?.('[data-action="toggle-animal-comment"]');
  if (!trigger) return;
  event.preventDefault();
  toggleAnimalCommentReveal(trigger);
}

document.addEventListener('input', handleCommentReaderSettingInput);
document.addEventListener('click', handleCommentReaderClick);
