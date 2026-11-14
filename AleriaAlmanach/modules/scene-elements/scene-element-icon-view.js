import { getSceneElementType } from './scene-element-model.js';

export function getSceneElementIconUrl(type) { return `./assets/scene-elements/icons/web/${getSceneElementType(type).id}-v1.webp`; }

export function renderSceneElementIcon(type, { className = '' } = {}) {
  return `<img class="scene-element-icon ${className}" src="${getSceneElementIconUrl(type)}" width="40" height="40" alt="" decoding="async">`;
}
