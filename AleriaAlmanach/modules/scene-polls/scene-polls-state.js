const SCENE_POLL_KIND = 'scene-poll-event';
const SCENE_POLL_ICON_URL = 'https://i.imgur.com/jeMqIr7.png';

const SCENE_POLL_DEFAULT_OPTIONS = [
  { id: 'approve', label: 'Dafuer', tone: 'approve' },
  { id: 'abstain', label: 'Enthaltung', tone: 'abstain' },
  { id: 'reject', label: 'Dagegen', tone: 'reject' }
];

const SCENE_POLL_VOTERS = [
  { id: 'patrick', label: 'Patrick' },
  { id: 'erdi', label: 'Erdi' }
];

function makeScenePollId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `poll-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeScenePollText(value, fallback = '') {
  const text = String(value || '').trim();
  return text || fallback;
}

function getScenePollVoters() {
  return SCENE_POLL_VOTERS.map(voter => ({ ...voter }));
}

function getScenePollVoter(id) {
  const safeId = typeof normalizeSearchText === 'function'
    ? normalizeSearchText(id)
    : String(id || '').toLowerCase().trim();
  return SCENE_POLL_VOTERS.find(voter => voter.id === safeId) || SCENE_POLL_VOTERS[0];
}

function normalizeScenePollOptions(options) {
  const source = Array.isArray(options) && options.length ? options : SCENE_POLL_DEFAULT_OPTIONS;
  const seen = new Set();
  return source.map((option, index) => {
    const fallback = SCENE_POLL_DEFAULT_OPTIONS[index] || { id: `option-${index + 1}`, label: `Option ${index + 1}`, tone: 'neutral' };
    const rawId = String(option?.id || fallback.id || `option-${index + 1}`).trim();
    const id = rawId && !seen.has(rawId) ? rawId : `option-${index + 1}`;
    seen.add(id);
    return {
      id,
      label: normalizeScenePollText(option?.label, fallback.label),
      tone: normalizeScenePollText(option?.tone, fallback.tone || 'neutral')
    };
  }).slice(0, 5);
}

function normalizeScenePollVotes(votes, options) {
  const validOptions = new Set(options.map(option => option.id));
  const source = votes && typeof votes === 'object' ? votes : {};
  return Object.entries(source).reduce((next, [key, vote]) => {
    const characterId = String(vote?.characterId || key || '').trim();
    const optionId = String(vote?.optionId || '').trim();
    if (!characterId || !validOptions.has(optionId)) return next;
    const voter = getScenePollVoter(vote?.voterId || vote?.player || '');
    next[characterId] = {
      characterId,
      characterName: normalizeScenePollText(vote?.characterName || vote?.name, 'Unbekannt'),
      characterTitle: normalizeScenePollText(vote?.characterTitle || vote?.title, ''),
      portrait: typeof normalizeImageUrlForStorage === 'function'
        ? (normalizeImageUrlForStorage(vote?.portrait || '') || '')
        : String(vote?.portrait || '').trim(),
      optionId,
      voterId: voter.id,
      voterLabel: voter.label,
      updatedAtClient: Number.isFinite(Number(vote?.updatedAtClient)) ? Number(vote.updatedAtClient) : 0
    };
    return next;
  }, {});
}

function normalizeScenePoll(input = {}) {
  const options = normalizeScenePollOptions(input.options);
  return {
    kind: SCENE_POLL_KIND,
    pollId: String(input.pollId || '').trim() || makeScenePollId(),
    title: normalizeScenePollText(input.title, 'Vorlage zur Abstimmung'),
    question: normalizeScenePollText(input.question || input.flavourText || input.text, 'Soll die Szene diesen Beschluss annehmen?'),
    flavourText: normalizeScenePollText(input.flavourText || input.description, ''),
    anonymous: !!input.anonymous,
    iconUrl: typeof normalizeImageUrlForStorage === 'function'
      ? (normalizeImageUrlForStorage(input.iconUrl || SCENE_POLL_ICON_URL) || SCENE_POLL_ICON_URL)
      : SCENE_POLL_ICON_URL,
    options,
    votes: normalizeScenePollVotes(input.votes, options),
    schemaVersion: 1
  };
}

function isScenePollComment(comment) {
  return !!(
    comment?.scenePoll ||
    comment?.commentKind === SCENE_POLL_KIND ||
    comment?.commentMode === 'scene-poll'
  );
}

function getScenePollVoteList(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  return Object.values(poll.votes)
    .filter(vote => vote?.characterId)
    .sort((a, b) => Number(b.updatedAtClient || 0) - Number(a.updatedAtClient || 0));
}

function getScenePollOptionCounts(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  const counts = Object.fromEntries(poll.options.map(option => [option.id, 0]));
  Object.values(poll.votes).forEach(vote => {
    if (Object.prototype.hasOwnProperty.call(counts, vote.optionId)) counts[vote.optionId] += 1;
  });
  return counts;
}

function getScenePollOptionPercent(count, total) {
  if (!total) return 0;
  return Math.round((Number(count) / total) * 100);
}

function getScenePollCommentText(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  return [poll.title, poll.question, poll.flavourText].filter(Boolean).join('\n\n');
}

function getScenePollCharacterPortrait(character) {
  return String(character?.portrait || character?.emotes?.find(emote => emote?.img)?.img || '').trim();
}

function getScenePollCharactersForVoter(voterId) {
  const owner = getScenePollVoter(voterId).id;
  const characters = typeof getAvailableCommentCharacters === 'function'
    ? getAvailableCommentCharacters()
    : (typeof getVisibleCharacterRecords === 'function' ? getVisibleCharacterRecords() : []);
  const normalizeOwner = typeof normalizeCharacterPlayerOwner === 'function'
    ? normalizeCharacterPlayerOwner
    : value => String(value || '').toLowerCase().trim();
  const owned = characters.filter(character => normalizeOwner(character?.playerOwner || character?.playedBy || character?.player) === owner);
  const unassigned = characters.filter(character => !normalizeOwner(character?.playerOwner || character?.playedBy || character?.player));
  return (owned.length ? [...owned, ...unassigned] : characters).filter(character => String(character?.id || '').trim());
}

function buildScenePollVote(pollInput, character, voterId, optionId) {
  const poll = normalizeScenePoll(pollInput);
  const voter = getScenePollVoter(voterId);
  const option = poll.options.find(item => item.id === optionId) || poll.options[0];
  return {
    characterId: String(character?.id || '').trim(),
    characterName: normalizeScenePollText(character?.name, 'Unbekannt'),
    characterTitle: normalizeScenePollText(character?.title, ''),
    portrait: getScenePollCharacterPortrait(character),
    optionId: option.id,
    voterId: voter.id,
    voterLabel: voter.label,
    updatedAtClient: Date.now()
  };
}
