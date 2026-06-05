const MODULE_EDITOR_CODE_HASH_KEY = 'aleria-module-editor-code-hash-v1';
let _moduleEditorContext = null;
let _moduleEditorPreviewPageIndex = 0;
let _moduleEditorDragState = null;
let _moduleEditorHydrating = false;
let _moduleEditorInitialSignature = '';
let _moduleEditorUndoSnapshot = null;
let _moduleEditorPendingCommentImport = null;

async function hashModuleEditorCode(code) {
  const normalized = String(code || '').trim();
  if (!normalized) return '';
  if (!window.crypto?.subtle) {
    throw new Error('Sichere Code-Pruefung wird von diesem Browser nicht unterstuetzt.');
  }
  const bytes = new TextEncoder().encode(`aleria-module-editor:v1:${normalized}`);
  const hash = await window.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

function getStoredModuleEditorCodeHash() {
  try {
    return localStorage.getItem(MODULE_EDITOR_CODE_HASH_KEY) || '';
  } catch {
    return '';
  }
}

function setStoredModuleEditorCodeHash(hash) {
  localStorage.setItem(MODULE_EDITOR_CODE_HASH_KEY, hash);
}
