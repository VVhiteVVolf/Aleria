// A failed network response retains the exact resolved request. Retrying the
// unchanged composer neither rolls again nor spends an item a second time.
const pending = new Map();
const keyFor = (threadId, draftId) => JSON.stringify([threadId, draftId]);
const storageKeyFor = key => `aleria-comment-save:v1:${key}`;

function readPending(key) {
  try {
    const stored = JSON.parse(globalThis.sessionStorage?.getItem(storageKeyFor(key)) || 'null');
    return stored?.operationId && stored?.metadata ? stored : null;
  } catch {
    return null;
  }
}

export function mechanicalCommentRequest(threadId, signature, draftId = '') {
  const key = keyFor(threadId, draftId);
  const current = pending.get(key) || (draftId && readPending(key));
  const request = current?.signature === signature ? current : { signature, operationId: crypto.randomUUID(), metadata: null };
  pending.set(key, request);
  while (pending.size > 20) pending.delete(pending.keys().next().value);
  return request;
}

export function rememberMechanicalCommentRequest(threadId, draftId, request) {
  if (!draftId) return;
  try {
    globalThis.sessionStorage?.setItem(storageKeyFor(keyFor(threadId, draftId)), JSON.stringify(request));
  } catch { /* The in-memory request still covers a retry in this page. */ }
}

export function completeMechanicalCommentRequest(threadId, draftId = '') {
  const key = keyFor(threadId, draftId);
  pending.delete(key);
  try {
    globalThis.sessionStorage?.removeItem(storageKeyFor(key));
  } catch { /* The in-memory request has already been cleared. */ }
}
