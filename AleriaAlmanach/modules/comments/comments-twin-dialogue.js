globalThis.AleriaTwinDialogue = (() => {
  const voiceKinds = Object.freeze([
    'speech', 'thought', 'whisper', 'shout', 'performance', 'animal', 'foreign',
    'song', 'telepathy', 'spell', 'prayer', 'flirt', 'madness'
  ]);
  const separator = '\n\n';

  function voiceKind(value) {
    return voiceKinds.includes(value) ? value : 'speech';
  }

  function actor(value) {
    const imageSetId = String(value?.imageSetId || '').trim().slice(0, 48);
    const emoteIndex = value?.emoteIndex;
    return {
      characterId: String(value?.characterId || '').trim().slice(0, 160),
      charName: String(value?.charName || '').trim().slice(0, 160),
      charTitle: String(value?.charTitle || '').trim().slice(0, 160),
      portrait: String(value?.portrait || '').trim().slice(0, 2000),
      ...(imageSetId ? { imageSetId, emoteIndex: Number.isSafeInteger(emoteIndex) && emoteIndex >= 0 ? emoteIndex : null } : {})
    };
  }

  function hasPair(actors) {
    const [left, right] = actors;
    return !!(left?.characterId && right?.characterId && left.charName && right.charName
      && left.characterId !== right.characterId);
  }

  function normalize(value) {
    return {
      actors: Array.isArray(value?.actors) ? value.actors.slice(0, 2).map(actor) : [],
      leftKind: voiceKind(value?.leftKind),
      rightKind: voiceKind(value?.rightKind),
      rightText: String(value?.rightText || '')
    };
  }

  function readText(segment) {
    const left = String(segment.text || '').trim();
    return segment.kind === 'twins' ? [left, String(segment.twin?.rightText || '').trim()].filter(Boolean).join(separator) : left;
  }

  function serialize(segment) {
    const twin = normalize(segment.twin);
    const stored = {
      clientSegmentId: segment.id,
      kind: 'action',
      commentKind: 'action',
      text: readText(segment),
      narrator: true,
      charName: 'Erzähler',
      durationSeconds: getSceneTimeSegmentDuration(segment)
    };
    if (hasPair(twin.actors)) {
      stored.twinDialogue = {
        version: 1,
        leftLength: String(segment.text || '').trim().length,
        left: { ...twin.actors[0], kind: twin.leftKind },
        right: { ...twin.actors[1], kind: twin.rightKind }
      };
    }
    return stored;
  }

  function decode(segment) {
    const pair = segment.twinDialogue;
    const text = typeof segment.text === 'string' ? segment.text : '';
    if (pair?.version !== 1 || (segment.commentKind || segment.kind) !== 'action' || !text.trim()) return null;
    const length = pair.leftLength;
    if (!Number.isInteger(length) || length < 0 || length > text.length) return null;
    const both = length > 0 && length < text.length;
    if (both && text.slice(length, length + separator.length) !== separator) return null;
    const actors = [actor(pair.left), actor(pair.right)];
    if (!hasPair(actors)) return null;
    return {
      leftText: text.slice(0, length),
      twin: normalize({
        actors,
        leftKind: pair.left.kind,
        rightKind: pair.right.kind,
        rightText: text.slice(length + (both ? separator.length : 0))
      })
    };
  }

  function render(comment, index) {
    const dialogue = decode(comment);
    if (!dialogue) return null;
    const { leftText, twin } = dialogue;
    const lanes = [
      { side: 'left', info: twin.actors[0], text: leftText, kind: twin.leftKind },
      { side: 'right', info: twin.actors[1], text: twin.rightText, kind: twin.rightKind }
    ];
    return `${renderCommentDivider(index)}
      <div class="comment-twin-dialogue" data-comment-id="${escapeHtml(comment.id)}">
        <div class="comment-twin-parallel">${lanes.map(({ side, info, text, kind }) => `
          <div class="comment-twin-lane comment-twin-lane--${side}">${text ? renderCommentBubble({
            ...info, id: comment.id, text, kind, commentKind: kind, side,
            _hideActions: true, _twinLane: side
          }, index) : ''}</div>`).join('')}</div>
        ${comment._hideActions ? '' : `<div class="comment-twin-actions">${renderCommentEntryActions(comment)}</div>`}
      </div>`;
  }

  return Object.freeze({ voiceKinds, voiceKind, normalize, readText, serialize, decode, render });
})();
