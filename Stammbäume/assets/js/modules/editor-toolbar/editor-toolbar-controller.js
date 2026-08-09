function toolbarMenus(toolbar) {
  return toolbar ? [...toolbar.querySelectorAll('[data-toolbar-menu]')] : [];
}

export function createEditorToolbarController({ toolbar, documentRef = document }) {
  const menus = toolbarMenus(toolbar);
  let initialized = false;

  function closeMenus(except = null) {
    menus.forEach(menu => {
      if (menu !== except) menu.open = false;
    });
  }

  function onToggle(event) {
    const menu = event.currentTarget;
    if (menu.open) closeMenus(menu);
  }

  function onToolbarClick(event) {
    const selectedItem = event.target.closest('.toolbar-menu__panel [data-action], .toolbar-menu__panel a[href]');
    if (selectedItem) closeMenus();
  }

  function onDocumentPointerDown(event) {
    if (!toolbar?.contains(event.target)) closeMenus();
  }

  function onDocumentKeydown(event) {
    if (event.key === 'Escape') closeMenus();
  }

  function init() {
    if (initialized || !toolbar) return;
    initialized = true;
    menus.forEach(menu => menu.addEventListener('toggle', onToggle));
    toolbar.addEventListener('click', onToolbarClick);
    documentRef.addEventListener('pointerdown', onDocumentPointerDown);
    documentRef.addEventListener('keydown', onDocumentKeydown);
  }

  function destroy() {
    if (!initialized || !toolbar) return;
    initialized = false;
    menus.forEach(menu => menu.removeEventListener('toggle', onToggle));
    toolbar.removeEventListener('click', onToolbarClick);
    documentRef.removeEventListener('pointerdown', onDocumentPointerDown);
    documentRef.removeEventListener('keydown', onDocumentKeydown);
  }

  return Object.freeze({ init, destroy, closeMenus });
}
