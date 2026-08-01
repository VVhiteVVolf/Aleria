// Small bounded undo stack of full feature-list snapshots for the map
// currently being edited. Deliberately simple (snapshot/restore, not a
// diff/patch system) since editing sessions are short and feature counts
// are small.
const MAX_DEPTH = 25;

export function createUndoHistory() {
  const stack = [];

  function push(snapshot) {
    stack.push(structuredClone(snapshot));
    if (stack.length > MAX_DEPTH) stack.shift();
  }

  function undo() {
    return stack.pop() || null;
  }

  function canUndo() {
    return stack.length > 0;
  }

  function clear() {
    stack.length = 0;
  }

  return { push, undo, canUndo, clear };
}
