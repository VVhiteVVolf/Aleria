// Committed mechanics must follow the exact history used by their transaction,
// including when a concurrent write forces the transaction to run again.
export function nextMechanicalCommentOrderKey(history = [], requestedOrderKey, now = Date.now()) {
  const latest = history.reduce((maximum, comment) => {
    const value = Number(comment.orderKey || comment.createdAtClient || 0);
    return Number.isFinite(value) ? Math.max(maximum, value) : maximum;
  }, 0);
  const requested = Number(requestedOrderKey);
  return Math.max(Number.isFinite(requested) ? requested : now, latest + 1);
}
