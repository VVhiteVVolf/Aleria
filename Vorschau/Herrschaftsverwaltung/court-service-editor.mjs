export function bindCourtServiceEditor(dialog, { choices, recipient, onChange, findTrigger }) {
  const form = dialog.querySelector('form');
  const select = form.elements.recipient;
  const notice = dialog.querySelector('[role="status"]');
  let postKey;
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      onChange(postKey, select.value || null);
      dialog.close();
    } catch (error) { notice.textContent = error.message; }
  });
  dialog.querySelector('[data-action="cancel-service"]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => findTrigger(postKey)?.focus({ preventScroll: true }));
  return post => {
    postKey = post.key;
    notice.textContent = '';
    const current = recipient(post);
    const options = choices().sort((a, b) => a.name.localeCompare(b.name, 'de'));
    select.replaceChildren(new Option('Keine persönliche Zuteilung', ''), ...options.map(person => new Option(person.name, person.id)));
    if (current?.id && options.some(option => option.id === current.id)) select.value = current.id;
    dialog.showModal();
    select.focus();
  };
}
