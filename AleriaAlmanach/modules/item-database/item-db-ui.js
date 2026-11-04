// Compatibility entry points for the archive sidebar and the existing item picker.
// The register itself owns its state, rendering and events in modules/item-register.
function itemDbOpen() {
  return itemDbEnsureGlobalSync().then(() => window.AleriaItemRegister.open());
}
function itemDbClose() { window.AleriaItemRegister?.close(); }
function itemDbRenderImage(item, className = 'item-db-image') {
  const source = itemDbSanitizeImage(window.AleriaItemRegister?.resolveImage?.(item) || item.image || '');
  return source
    ? `<span class="${className}"><img src="${itemDbEscapeHtml(source)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>`
    : `<span class="${className} item-db-image-empty" aria-hidden="true">◇</span>`;
}
function itemDbFormatPriceAsCopper(item) {
  return window.AleriaItemRegister?.formatPrice(item) || item.price || '';
}

// Keep the regional deep link working without loading the inventory catalogue
// and its online subscriptions for every visit to the homepage.
import('../item-register/item-register-route-entry.js?v=20261104-startup-v1').then(module => module.watchItemRegisterRoute())
  .catch(error => console.warn('Der Register-Direktlink konnte nicht vorbereitet werden.', error));
document.addEventListener('click', event => {
  if (!event.target.closest('[data-item-db-action="open"]')) return;
  event.preventDefault();
  itemDbOpen().catch(error => {
    if (typeof showAppStatus === 'function') showAppStatus(error.message, 'error');
    else console.error('Item register could not be opened:', error);
  });
});
