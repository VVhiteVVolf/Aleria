const roleplayModes = new Set(['', 'character', 'charakter', 'creature', 'manual', 'narrator']);
const sceneCardFields = [
  'combatEncounter', 'combatStatus', 'sceneDiceRoll', 'sceneInventoryTransfer', 'sceneItemEvent',
  'sceneRest', 'sceneRegeneration', 'sceneTrade', 'sceneTimeEvent', 'sceneTransition', 'scenePoll',
  'sceneElementSignal', 'sceneElementInteraction', 'itemShowcase', 'fazit', 'documentAttachment', 'moduleInsert', 'moduleInsertJson'
];
const textLimit = 250000;

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

export function getCommentProseSource(comment) {
  const segmented = Array.isArray(comment.commentSegments) && comment.commentSegments.length > 0;
  return { segmented, segments: segmented ? comment.commentSegments : [comment] };
}

export function getEditableCommentProseEntries(comment) {
  const mode = String(comment.commentMode || '');
  const kind = String(comment.commentKind || comment.kind || '');
  if (!roleplayModes.has(mode) || kind.endsWith('-event') || sceneCardFields.some(field => comment[field])) return [];
  return getCommentProseSource(comment).segments.flatMap((source, index) =>
    typeof source?.text === 'string' && source.text.trim() && !source.sceneItemEvent ? [{ index, source }] : []);
}

function validateTwinEdit(source, edit, text) {
  const twin = source.twinDialogue;
  if (twin?.version !== 1) {
    if (Object.hasOwn(edit, 'leftLength')) fail('invalid-argument', 'Dieser Abschnitt hat keine zweite Stimme.');
    return {};
  }
  if (edit.beforeLeftLength !== twin.leftLength) fail('aborted', 'Eine Stimme wurde inzwischen geändert. Öffne den Beitrag erneut.');
  const length = edit.leftLength;
  if (!Number.isInteger(length) || length < 0 || length > text.length
      || (length > 0 && length < text.length && text.slice(length, length + 2) !== '\n\n')) {
    fail('invalid-argument', 'Die beiden Stimmen konnten nicht zugeordnet werden.');
  }
  return { twinDialogue: { ...twin, leftLength: length } };
}

export function buildCommentProsePatch(comment, edits) {
  const entries = new Map(getEditableCommentProseEntries(comment).map(({ index, source }) => [index, source]));
  if (!entries.size) fail('failed-precondition', 'Dieser Beitrag enthält keinen bearbeitbaren Rollenspieltext.');
  if (!Array.isArray(edits) || edits.length > entries.size) fail('invalid-argument', 'Die Textabschnitte sind ungültig.');
  const replacements = new Map();
  for (const edit of edits) {
    const index = edit?.index;
    const source = entries.get(index);
    if (!source || replacements.has(index)) fail('invalid-argument', 'Ein Textabschnitt ist ungültig.');
    const text = typeof edit.text === 'string' ? edit.text.trim() : '';
    if (!text || text.length > textLimit) fail('invalid-argument', 'Gib für jeden Abschnitt einen Text innerhalb des Zeichenlimits ein.');
    if (edit.beforeText !== source.text) fail('aborted', 'Der Abschnitt wurde inzwischen geändert. Öffne den Beitrag erneut.');
    replacements.set(index, { ...source, text, ...validateTwinEdit(source, edit, text) });
  }
  if (!replacements.size) return null;

  const { segmented, segments } = getCommentProseSource(comment);
  const updated = segments.map((source, index) => replacements.get(index) || source);
  const text = updated.map(segment => String(segment?.text || '').trim()).filter(Boolean).join('\n\n');
  if (text.length > textLimit) fail('invalid-argument', 'Der Beitrag überschreitet das Zeichenlimit.');
  return { text, ...(segmented ? { commentSegments: updated } : {}) };
}
