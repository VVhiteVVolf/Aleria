// Bounded, Fazit-specific undo/redo history. The editor owns snapshots and rendering;
// this module only owns stack semantics and coalescing of continuous text input.
const FAZIT_HISTORY_LIMIT = 80;
const FAZIT_HISTORY_MERGE_WINDOW_MS = 900;

function cloneFazitHistorySnapshot(snapshot) {
  return JSON.parse(JSON.stringify(snapshot));
}

function createFazitHistory(limit = FAZIT_HISTORY_LIMIT) {
  const maxEntries = Math.max(1, Number(limit) || FAZIT_HISTORY_LIMIT);
  const undoStack = [];
  const redoStack = [];
  let lastMergeKey = '';
  let lastCaptureAt = 0;

  function resetMergeWindow() {
    lastMergeKey = '';
    lastCaptureAt = 0;
  }

  return {
    reset() {
      undoStack.length = 0;
      redoStack.length = 0;
      resetMergeWindow();
    },

    capture(snapshot, mergeKey = '') {
      const normalizedMergeKey = String(mergeKey || '');
      const now = Date.now();
      const mergesWithPrevious = normalizedMergeKey
        && normalizedMergeKey === lastMergeKey
        && now - lastCaptureAt <= FAZIT_HISTORY_MERGE_WINDOW_MS
        && undoStack.length > 0;
      if (!mergesWithPrevious) {
        undoStack.push(cloneFazitHistorySnapshot(snapshot));
        if (undoStack.length > maxEntries) undoStack.shift();
      }
      redoStack.length = 0;
      lastMergeKey = normalizedMergeKey;
      lastCaptureAt = now;
    },

    undo(currentSnapshot) {
      if (!undoStack.length) return null;
      redoStack.push(cloneFazitHistorySnapshot(currentSnapshot));
      resetMergeWindow();
      return undoStack.pop();
    },

    redo(currentSnapshot) {
      if (!redoStack.length) return null;
      undoStack.push(cloneFazitHistorySnapshot(currentSnapshot));
      resetMergeWindow();
      return redoStack.pop();
    },

    getState() {
      return {
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        undoCount: undoStack.length,
        redoCount: redoStack.length
      };
    }
  };
}
