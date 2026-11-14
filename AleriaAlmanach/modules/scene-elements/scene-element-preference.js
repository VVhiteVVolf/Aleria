export const SCENE_ELEMENT_RAIL_PREFERENCE = 'aleria.scene-elements.expanded.v1';

export function getSceneElementRailExpanded(host = globalThis) {
  try { return host.localStorage?.getItem(SCENE_ELEMENT_RAIL_PREFERENCE) !== 'false'; }
  catch { return true; }
}

export function saveSceneElementRailExpanded(expanded, host = globalThis) {
  try { host.localStorage?.setItem(SCENE_ELEMENT_RAIL_PREFERENCE, String(expanded === true)); }
  catch { /* The current tab still works when browser storage is unavailable. */ }
}
