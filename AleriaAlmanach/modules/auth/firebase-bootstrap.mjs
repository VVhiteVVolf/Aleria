// Separater asynchroner Einstieg: Der lokale Almanach und Kalender bleiben
// bedienbar, wenn die Firebase-SDK-Dateien vorübergehend nicht erreichbar sind.
import { mountAccountUi } from './account-ui.js';
mountAccountUi(document.querySelector('[data-role="almanach-account"]'));
import('../../firebase.js?v=20261012-guild-v3').catch(error => {
  console.warn('Die Online-Anbindung konnte noch nicht geladen werden:', error);
  globalThis.dispatchEvent(new CustomEvent('fb-load-error', { detail: { message: String(error?.message || error) } }));
});
