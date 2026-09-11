// Separater asynchroner Einstieg: Der lokale Almanach und Kalender bleiben
// bedienbar, wenn die Firebase-SDK-Dateien vorübergehend nicht erreichbar sind.
import('../../firebase.js?v=20260911-calendar-v2').catch(error => {
  console.warn('Die Online-Anbindung konnte noch nicht geladen werden:', error);
  globalThis.dispatchEvent(new CustomEvent('fb-load-error', { detail: { message: String(error?.message || error) } }));
});
