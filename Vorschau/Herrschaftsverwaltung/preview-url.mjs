import { escapeHtml } from '../shared/country-workbench/render.mjs';

const fileRoot = globalThis.location?.protocol === 'file:' ? new URL('../../', import.meta.url) : null;

export function previewUrl(path) {
  if (!fileRoot || typeof path !== 'string' || !/^\/(?!\/)/u.test(path)) return path;
  return new URL(path.slice(1), fileRoot).href;
}

export const previewAttribute = path => escapeHtml(previewUrl(path));
