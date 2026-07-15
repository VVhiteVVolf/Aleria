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
