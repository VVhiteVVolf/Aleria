export const WORKSPACE_MODE = Object.freeze({
  view: 'view',
  edit: 'edit'
});

const EDIT_SESSION_KEY = 'aleria.family-tree.edit-access.v1';
const EDIT_PASSWORD = '7777';

function safeSessionRead(storage) {
  try {
    return storage?.getItem(EDIT_SESSION_KEY) === 'granted';
  } catch (error) {
    return false;
  }
}

export function requestedWorkspaceMode(locationLike = globalThis.location) {
  const search = typeof locationLike === 'string'
    ? new URL(locationLike, 'http://aleria.local').search
    : locationLike?.search || '';
  return new URLSearchParams(search).get('mode') === WORKSPACE_MODE.edit
    ? WORKSPACE_MODE.edit
    : WORKSPACE_MODE.view;
}

export function resolveWorkspaceAccess(locationLike = globalThis.location, storage = globalThis.sessionStorage) {
  const requestedMode = requestedWorkspaceMode(locationLike);
  const hasEditAccess = safeSessionRead(storage);
  return Object.freeze({
    mode: requestedMode === WORKSPACE_MODE.edit && hasEditAccess
      ? WORKSPACE_MODE.edit
      : WORKSPACE_MODE.view,
    requestedMode,
    shouldRequestPassword: requestedMode === WORKSPACE_MODE.edit && !hasEditAccess
  });
}

export function grantWorkspaceEditAccess(password, storage = globalThis.sessionStorage) {
  if (String(password || '') !== EDIT_PASSWORD) return false;
  try {
    storage?.setItem(EDIT_SESSION_KEY, 'granted');
  } catch (error) {
    return false;
  }
  return true;
}

export function createWorkspaceModeUrl(locationLike, mode) {
  const href = typeof locationLike === 'string' ? locationLike : locationLike?.href;
  const target = new URL(href || 'http://aleria.local/');
  target.searchParams.set('mode', mode === WORKSPACE_MODE.edit ? WORKSPACE_MODE.edit : WORKSPACE_MODE.view);
  return target.href;
}

// Ein-Schuss-Merker dafür, dass der Stammbaum-Generator nach erfolgreicher
// Bearbeitungsfreigabe automatisch geöffnet werden soll (Landingpage-CTA
// "Neue Familie beginnen"). Lebt in sessionStorage statt in einem rohen
// URL-Parameter, damit ein späteres erneutes Aufrufen derselben Adresse aus
// der Browser-Historie (z. B. nach dem Passwort-Dialog) nicht versehentlich
// erneut auslöst — der Parameter selbst wird vom Aufrufer sofort aus der
// Adresszeile entfernt. Wird der Passwort-Dialog abgebrochen, muss der
// Aufrufer clearPendingTreeGeneratorLaunch() aufrufen, damit ein später an
// ganz anderer Stelle gewährter Bearbeitungszugang nicht unerwartet die
// gerade offene Familie zurücksetzt.
const GENERATOR_LAUNCH_KEY = 'aleria.family-tree.pending-generator-launch.v1';

export function markPendingTreeGeneratorLaunch(storage = globalThis.sessionStorage) {
  try {
    storage?.setItem(GENERATOR_LAUNCH_KEY, '1');
  } catch (error) {
    // sessionStorage kann in manchen Kontexten fehlschlagen — der Auto-Open
    // bleibt dann einfach aus, kein harter Fehler.
  }
}

export function hasPendingTreeGeneratorLaunch(storage = globalThis.sessionStorage) {
  try {
    return storage?.getItem(GENERATOR_LAUNCH_KEY) === '1';
  } catch (error) {
    return false;
  }
}

export function consumePendingTreeGeneratorLaunch(storage = globalThis.sessionStorage) {
  const pending = hasPendingTreeGeneratorLaunch(storage);
  if (pending) clearPendingTreeGeneratorLaunch(storage);
  return pending;
}

export function clearPendingTreeGeneratorLaunch(storage = globalThis.sessionStorage) {
  try {
    storage?.removeItem(GENERATOR_LAUNCH_KEY);
  } catch (error) {
    // Kein Problem — die Markierung war ohnehin nur best-effort gesetzt.
  }
}
