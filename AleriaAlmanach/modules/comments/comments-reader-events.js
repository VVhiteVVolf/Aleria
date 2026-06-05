// Reader-setting input delegation for comments.
function handleCommentReaderSettingInput(event) {
  const field = event.target;
  if (!field?.matches?.('[data-action="set-comment-reader-setting"]')) return;
  setCommentReaderSetting(field.dataset.readerSetting || '', field.value);
}

document.addEventListener('input', handleCommentReaderSettingInput);
