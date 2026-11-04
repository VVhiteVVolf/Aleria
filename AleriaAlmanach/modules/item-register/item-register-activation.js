// Firebase readiness is a reconnect signal, not a request to load inventories.
// This small feature lifecycle keeps register reads behind a real user request.
export function createItemRegisterActivation({ events = window, activate, stop }) {
  let requested = false, active = true;
  const ensure = () => { if (!active) return; requested = true; return activate(); };
  const resume = () => { if (active && requested) activate(); };
  const restart = () => { if (active && requested) { stop(); activate(); } };
  events.addEventListener('fb-ready', resume);
  events.addEventListener('fb-load-error', resume);
  events.addEventListener('online', restart);
  return Object.freeze({ ensure, destroy() {
    active = false;
    events.removeEventListener('fb-ready', resume);
    events.removeEventListener('fb-load-error', resume);
    events.removeEventListener('online', restart);
    if (requested) stop();
  } });
}
