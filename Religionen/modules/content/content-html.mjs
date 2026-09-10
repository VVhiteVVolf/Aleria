import { posix } from 'node:path';

export function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

export function pageLinkFrom(outputPath) {
  return target => escapeHtml(posix.relative(posix.dirname(outputPath), target) || './');
}
