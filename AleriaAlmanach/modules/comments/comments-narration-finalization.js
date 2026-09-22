// Optional prose follows an already committed comment. Only confirmed mechanics
// are passed to narrators; this job must never repeat the mechanical transaction.
export async function finalizeCommittedCommentNarration({ committed, narrators = [], finalize }) {
  if (!committed?.id) return;
  // Let the submit flow release the composer before retrieval starts doing work.
  await new Promise(resolve => setTimeout(resolve, 0));
  const results = await Promise.all(narrators.map(narrate => narrate(committed.mechanics || {})));
  const narrations = results.flat();
  if (narrations.length) await finalize({ commentId: committed.id, narrations });
}
