import { isItemRegisterRoute } from './item-register-navigation.js?v=20261104-startup-v1';

// Only an explicit register URL loads the full register while the homepage is
// starting. Ordinary entry points remain the existing open/picker functions.
export function watchItemRegisterRoute({ host = window, load = () => globalThis.itemDbEnsureGlobalSync(), onError = error => console.warn('Das Güterregister konnte nicht geladen werden.', error) } = {}) {
  let active = true, pending = null;
  const request = () => {
    if (!active || !isItemRegisterRoute(host.location.hash) || pending) return;
    pending = Promise.resolve().then(() => { if (active && isItemRegisterRoute(host.location.hash)) return load(); })
      .catch(error => { if (active) onError(error); }).finally(() => { pending = null; });
  };
  host.addEventListener('hashchange', request);
  request();
  return () => { active = false; host.removeEventListener('hashchange', request); };
}
