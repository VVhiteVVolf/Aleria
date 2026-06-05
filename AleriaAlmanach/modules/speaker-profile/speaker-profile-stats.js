const SPEAKER_PROFILE_STOPWORDS = new Set([
  'aber', 'alle', 'allem', 'allen', 'aller', 'alles', 'als', 'also', 'am', 'an', 'auch', 'auf', 'aus',
  'bei', 'bin', 'bis', 'bist', 'da', 'damit', 'dann', 'das', 'dass', 'dein', 'deine', 'deinem', 'deinen',
  'deiner', 'dem', 'den', 'denn', 'der', 'des', 'dich', 'die', 'dies', 'diese', 'diesem', 'diesen',
  'dieser', 'doch', 'du', 'durch', 'ein', 'eine', 'einem', 'einen', 'einer', 'eines', 'er', 'es',
  'euch', 'euer', 'eure', 'fuer', 'für', 'habe', 'haben', 'hat', 'hatte', 'hier', 'ich', 'ihm', 'ihn', 'ihnen',
  'ihr', 'ihre', 'ihrem', 'ihren', 'ihrer', 'im', 'in', 'ist', 'ja', 'kann', 'kein', 'keine', 'mit',
  'mir', 'mich', 'mein', 'meine', 'meinem', 'meinen', 'meiner', 'muss', 'nicht', 'noch', 'nun', 'nur',
  'oder', 'sich', 'sie', 'sind', 'so', 'um', 'und', 'uns', 'unser', 'unsere', 'vom', 'von', 'vor',
  'ueber', 'über', 'war', 'was', 'wenn', 'wer', 'wie', 'wir', 'wird', 'wo', 'zu', 'zum', 'zur'
]);

let _speakerProfileAllCommentsCache = null;
let _speakerProfileAllCommentsLoadedAt = 0;

function normalizeSpeakerProfileName(value) {
  return normalizeSearchText(value || '');
}

function getSpeakerProfileNameKeys(character, fallbackName = '') {
  const keys = new Set();
  [fallbackName, character?.name, ...(Array.isArray(character?.aliases) ? character.aliases : [])]
    .forEach(value => {
      const key = normalizeSpeakerProfileName(value);
      if (key) keys.add(key);
    });
  return keys;
}

function resolveSpeakerProfileCharacter(payload = {}) {
  const characterId = String(payload.characterId || '').trim();
  if (characterId && typeof getAvailableCommentCharacterById === 'function') {
    const byId = getAvailableCommentCharacterById(characterId);
    if (byId) return byId;
  }
  if (characterId && typeof getAllCharacterRecords === 'function') {
    const byId = getAllCharacterRecords().find(char => String(char?.id || '').trim() === characterId);
    if (byId) return byId;
  }
  const name = String(payload.name || payload.charName || '').trim();
  if (name && typeof getAvailableCommentCharacterByName === 'function') {
    const byName = getAvailableCommentCharacterByName(name);
    if (byName) return byName;
  }
  if (name && typeof getAllCharacterRecords === 'function') {
    const key = normalizeSpeakerProfileName(name);
    return getAllCharacterRecords().find(char => getCharacterNameKeys(char).has(key)) || null;
  }
  return null;
}

function getSpeakerProfileCommentTimestamp(comment) {
  if (typeof getCommentTimestampMs === 'function') return getCommentTimestampMs(comment);
  const seconds = Number(comment?.ts?.seconds);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

function getCachedSpeakerProfileComments() {
  const cache = typeof _commentCache === 'object' && _commentCache
    ? Object.values(_commentCache).flat()
    : [];
  return cache.filter(Boolean);
}

async function loadSpeakerProfileComments(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && Array.isArray(_speakerProfileAllCommentsCache) && now - _speakerProfileAllCommentsLoadedAt < 60000) {
    return _speakerProfileAllCommentsCache;
  }
  try {
    const backend = await getCommentBackend({ timeoutMs: 1400 });
    if (typeof backend.loadAllComments === 'function') {
      const comments = await backend.loadAllComments();
      _speakerProfileAllCommentsCache = Array.isArray(comments) ? comments : [];
      _speakerProfileAllCommentsLoadedAt = now;
      return _speakerProfileAllCommentsCache;
    }
  } catch (error) {
    console.warn('speaker profile comments load failed:', error);
  }
  _speakerProfileAllCommentsCache = getCachedSpeakerProfileComments();
  _speakerProfileAllCommentsLoadedAt = now;
  return _speakerProfileAllCommentsCache;
}

function stripSpeakerProfileMarkup(text) {
  return String(text || '')
    .replace(/\{emote:\d+\}/g, ' ')
    .replace(/\{\/?(?:action|thought|whisper|ooc|tip:[^}]+)\}/g, ' ')
    .replace(/\[\/?[^\]\s]+\]/g, ' ')
    .replace(/[*_|]/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function tokenizeSpeakerProfileWords(text) {
  return stripSpeakerProfileMarkup(text)
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .match(/[a-zA-Z][a-zA-Z'-]{2,}/g) || [];
}

function getSpeakerProfileCommentSegments(comment) {
  if (Array.isArray(comment?.commentSegments) && comment.commentSegments.length) {
    return comment.commentSegments.map(segment => ({
      ...comment,
      ...segment,
      text: segment.text || '',
      commentKind: segment.commentKind || segment.kind || comment.commentKind || 'speech',
      charName: segment.charName || comment.charName,
      characterId: segment.characterId || comment.characterId || '',
      narrator: !!segment.narrator
    }));
  }
  return [comment];
}

function isSpeakerProfileSegmentMatch(segment, character, fallbackName = '') {
  if (segment?.narrator) return false;
  const characterId = String(character?.id || '').trim();
  const segmentCharacterId = String(segment?.characterId || '').trim();
  if (characterId && segmentCharacterId && characterId === segmentCharacterId) return true;
  const keys = getSpeakerProfileNameKeys(character, fallbackName);
  const segmentNameKey = normalizeSpeakerProfileName(segment?.charName || '');
  return !!segmentNameKey && keys.has(segmentNameKey);
}

function getSpeakerProfileThreadId(comment) {
  return String(comment?.entryId || comment?.threadId || '').trim();
}

function getSpeakerProfileSegmentName(segment) {
  if (segment?.narrator) return 'Erzaehler';
  return String(segment?.charName || segment?.name || 'Unbekannte Stimme').trim();
}

function makeSpeakerProfileSegmentRef(commentId, role, index) {
  return `comment:${commentId}:${role}:${index}`;
}

function makeSpeakerProfileSegmentContext(comment, segment, options = {}) {
  const kind = normalizeCommentKind(segment.commentKind || segment.kind || 'speech', segment.narrator);
  const threadId = getSpeakerProfileThreadId(comment);
  const current = options.threadSet?.has(threadId);
  const speakerName = getSpeakerProfileSegmentName(segment);
  const label = [
    options.roleLabel || 'Kontext',
    speakerName,
    getCommentKindLabel(kind),
    current ? 'aktuelle Szene' : ''
  ].filter(Boolean).join(' | ');

  return {
    sourceRef: makeSpeakerProfileSegmentRef(options.commentId || comment?.id || 'comment', options.role || 'segment', options.index || 0),
    threadId,
    label,
    speakerName,
    kind,
    role: options.role || (segment?.narrator ? 'narrator' : 'other-speaker'),
    text: stripSpeakerProfileMarkup(segment.text)
  };
}

function buildSpeakerProfileStats(character, fallbackName, comments, currentThreadIds = []) {
  const threadSet = new Set((currentThreadIds || []).map(id => String(id || '').trim()).filter(Boolean));
  const wordCounts = new Map();
  const kindCounts = new Map();
  const matchedCommentIds = new Set();
  const matchedCurrentCommentIds = new Set();
  const matchedThreadIds = new Set();
  const partnerCounts = new Map();
  const recentPortraits = [];
  const analysisSegments = [];
  const contextSegments = [];
  let segmentCount = 0;
  let wordTotal = 0;
  let latestMs = null;

  (comments || []).forEach(comment => {
    const segments = getSpeakerProfileCommentSegments(comment);
    const matchingSegments = segments.filter(segment => isSpeakerProfileSegmentMatch(segment, character, fallbackName));
    if (!matchingSegments.length) return;

    const commentId = String(comment?.id || `${comment?.entryId || 'comment'}-${matchedCommentIds.size}`);
    const threadId = getSpeakerProfileThreadId(comment);
    matchedCommentIds.add(commentId);
    if (threadId) matchedThreadIds.add(threadId);
    if (threadSet.has(threadId)) matchedCurrentCommentIds.add(commentId);
    const timestamp = getSpeakerProfileCommentTimestamp(comment);
    if (Number.isFinite(timestamp)) latestMs = latestMs == null ? timestamp : Math.max(latestMs, timestamp);

    segments.forEach(segment => {
      if (isSpeakerProfileSegmentMatch(segment, character, fallbackName)) return;
      const partner = String(segment?.charName || '').trim();
      if (!partner || segment?.narrator) return;
      const key = normalizeSpeakerProfileName(partner);
      if (key) partnerCounts.set(partner, (partnerCounts.get(partner) || 0) + 1);
    });

    matchingSegments.forEach(segment => {
      segmentCount += 1;
      const kind = normalizeCommentKind(segment.commentKind || segment.kind || 'speech', segment.narrator);
      kindCounts.set(kind, (kindCounts.get(kind) || 0) + 1);
      const portrait = sanitizeImageSrc(segment.portrait || comment.portrait || '');
      if (portrait && !recentPortraits.includes(portrait)) recentPortraits.push(portrait);
      const words = tokenizeSpeakerProfileWords(segment.text);
      wordTotal += words.length;
      if (segment.text && analysisSegments.length < 120) {
        analysisSegments.push({
          sourceRef: `comment:${commentId}:segment:${analysisSegments.length}`,
          threadId,
          label: [
            getCommentKindLabel(kind),
            threadSet.has(threadId) ? 'aktuelle Szene' : ''
          ].filter(Boolean).join(' | '),
          kind,
          text: stripSpeakerProfileMarkup(segment.text)
        });
      }
      words.forEach(word => {
        if (SPEAKER_PROFILE_STOPWORDS.has(word)) return;
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });
  });

  (comments || []).forEach(comment => {
    const threadId = getSpeakerProfileThreadId(comment);
    if (!threadId || !matchedThreadIds.has(threadId)) return;
    const timestamp = getSpeakerProfileCommentTimestamp(comment);
    if (Number.isFinite(timestamp)) latestMs = latestMs == null ? timestamp : Math.max(latestMs, timestamp);
    const commentId = String(comment?.id || `${threadId}-${contextSegments.length}`);
    const segments = getSpeakerProfileCommentSegments(comment);
    segments.forEach((segment, index) => {
      if (!String(segment?.text || '').trim()) return;
      if (isSpeakerProfileSegmentMatch(segment, character, fallbackName)) return;
      if (contextSegments.length >= 180) return;

      const partner = segment?.narrator ? 'Erzaehler' : String(segment?.charName || '').trim();
      if (partner && !segment?.narrator) {
        const key = normalizeSpeakerProfileName(partner);
        if (key) partnerCounts.set(partner, (partnerCounts.get(partner) || 0) + 1);
      }

      contextSegments.push(makeSpeakerProfileSegmentContext(comment, segment, {
        commentId,
        index,
        threadSet,
        role: segment?.narrator ? 'narrator' : 'other-speaker',
        roleLabel: segment?.narrator ? 'Erzaehlerkontext' : 'Andere Stimme'
      }));
    });
  });

  const topWords = Array.from(wordCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([word, count]) => ({ word, count }));
  const topKinds = Array.from(kindCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([kind, count]) => ({ kind, count, label: getCommentKindLabel(kind) }));
  const topPartners = Array.from(partnerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  return {
    commentCount: matchedCommentIds.size,
    currentCommentCount: matchedCurrentCommentIds.size,
    contextThreadCount: matchedThreadIds.size,
    contextSegmentCount: contextSegments.length,
    segmentCount,
    wordTotal,
    latestMs,
    topWords,
    topKinds,
    topPartners,
    analysisSegments,
    contextSegments,
    recentPortraits: recentPortraits.slice(0, 4)
  };
}
