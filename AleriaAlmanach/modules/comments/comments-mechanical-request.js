// A failed network response retains the exact resolved request. Retrying the
// unchanged composer neither rolls again nor spends an item a second time.
const pending = new Map();
export function mechanicalCommentRequest(threadId, signature) {
  if (pending.get(threadId)?.signature !== signature) pending.set(threadId, { signature, operationId: crypto.randomUUID(), metadata: null });
  while (pending.size > 20) pending.delete(pending.keys().next().value);
  return pending.get(threadId);
}
export function completeMechanicalCommentRequest(threadId) { pending.delete(threadId); }
