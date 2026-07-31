export function createFamilyAssetUploadController({
  store,
  assetRepository,
  documentRef = document,
  editing = false
}) {
  function familyIdFor(input) {
    const formFamilyId = input.form?.elements.namedItem('documentId')?.value?.trim();
    return formFamilyId || store.getState().family.document.id;
  }

  function renderStatus(input, message, isError = false) {
    const status = input.closest('[data-cloud-asset-field]')?.querySelector('[data-asset-upload-status]');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', isError);
  }

  async function upload(input) {
    const file = input.files?.[0];
    if (!file) return;
    input.disabled = true;
    renderStatus(input, 'Bild wird geprüft …');
    try {
      const result = await assetRepository.uploadImage({
        familyId: familyIdFor(input),
        file,
        kind: input.dataset.assetKind || 'image',
        visibility: 'public',
        onProgress(progress) {
          renderStatus(input, progress < 0.5 ? 'Bild wird vorbereitet …' : 'Bild wird sicher hochgeladen …');
        }
      });
      const target = input.form?.elements.namedItem(input.dataset.assetTarget);
      if (!target) throw new Error('Das Zielfeld für den Bild-Link wurde nicht gefunden.');
      target.value = result.url;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      renderStatus(input, result.staged
        ? 'Bild nur auf diesem Gerät vorgemerkt · erst „Online speichern“ veröffentlicht es über GitHub für andere.'
        : 'Bild übernommen.');
    } catch (error) {
      renderStatus(input, error.message, true);
    } finally {
      input.disabled = false;
      input.value = '';
    }
  }

  function onChange(event) {
    if (!editing || !event.target.matches('[data-family-asset-upload]')) return;
    void upload(event.target);
  }

  function init() {
    if (editing) documentRef.addEventListener('change', onChange);
  }

  function destroy() {
    documentRef.removeEventListener('change', onChange);
  }

  return Object.freeze({ init, destroy });
}
