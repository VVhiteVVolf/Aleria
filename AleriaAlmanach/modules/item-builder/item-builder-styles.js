export function ensureItemBuilderStyles() {
  if (document.getElementById('item-builder-styles')) return;
  const stylesheet = document.createElement('link'); stylesheet.id = 'item-builder-styles'; stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('./item-builder.css', import.meta.url).href; document.head.appendChild(stylesheet);
}
