// Compatibility entry points for the archive sidebar and the existing item picker.
// The register itself owns its state, rendering and events in modules/item-register.
function itemDbOpen() {
  return itemDbEnsureGlobalSync().then(() => window.AleriaItemRegister.open());
}
function itemDbClose() { window.AleriaItemRegister?.close(); }
function itemDbRenderImage(item, className = 'item-db-image') {
  const source = itemDbSanitizeImage(item.image || '');
  return source
    ? `<span class="${className}"><img src="${itemDbEscapeHtml(source)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`
    : `<span class="${className} item-db-image-empty" aria-hidden="true">◇</span>`;
}
function itemDbFormatPriceAsCopper(item) {
  return window.AleriaItemRegister?.formatPrice(item) || item.price || '';
}

// One native module entry in both development and the copied production scripts.
// Mixing a bundled entry with this classic import would create two live stores.
itemDbEnsureGlobalSync().catch(error => console.warn('Das Güterregister konnte nicht geladen werden.', error));
document.addEventListener('click', event => {
  if (!event.target.closest('[data-item-db-action="open"]')) return;
  event.preventDefault();
  itemDbOpen().catch(error => {
    if (typeof showAppStatus === 'function') showAppStatus(error.message, 'error');
    else console.error('Item register could not be opened:', error);
  });
});
