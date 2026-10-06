// Owns the shareable register entry URL; the register keeps ownership of its UI.
const REGIONAL_HASH = '#laender-ruestungen-waffen';

export function mountRegisterNavigation({ openSection, close }, host = window) {
  let openedFromRoute = false;
  function navigate() {
    if (host.location.hash === REGIONAL_HASH) {
      openedFromRoute = true;
      openSection('regional');
    } else if (openedFromRoute) {
      openedFromRoute = false;
      close();
    }
  }
  host.addEventListener('hashchange', navigate);
  navigate();
  return {
    closed() {
      openedFromRoute = false;
      if (host.location.hash !== REGIONAL_HASH) return;
      const url = new URL(host.location.href);
      url.hash = '';
      host.history.replaceState(host.history.state, '', url.href);
    }
  };
}
