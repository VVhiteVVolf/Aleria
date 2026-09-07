// Both the catalog and topic board share the same future-link / current-preview contract.
export function createEntryLink(entry, className) {
  const control = document.createElement(entry.href ? 'a' : 'button');
  control.className = className;
  if (entry.href) {
    control.href = entry.href;
  } else {
    control.type = 'button';
    control.dataset.action = 'preview-entry';
    control.dataset.entryId = entry.id;
    control.setAttribute('aria-haspopup', 'dialog');
  }
  return control;
}
