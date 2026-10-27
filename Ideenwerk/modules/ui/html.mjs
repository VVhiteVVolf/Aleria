export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

export const uid = () => crypto.randomUUID();

export function closeButton() {
  return '<button type="button" class="icon-button close-button" data-action="close" aria-label="Schließen">✕</button>';
}

export function imageSource(value) {
  return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value || '') ? value : '';
}

export function downloadJson(project, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(project)], {type: 'application/json'}));
  const link = Object.assign(document.createElement('a'), {href: url, download: filename});
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
