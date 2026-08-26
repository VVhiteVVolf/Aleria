const TOPIC_BOARD_SCHEMA_VERSION = 1;
const TOPIC_BOARD_STATUS_OPEN = 'open';
const TOPIC_BOARD_STATUS_ARCHIVED = 'archived';

const TOPIC_BOARD_CATEGORIES = Object.freeze([
  { id: 'reise', label: 'Reise & Aufbruch' },
  { id: 'hof', label: 'Hof & Verhandlung' },
  { id: 'begegnung', label: 'Begegnung' },
  { id: 'konflikt', label: 'Konflikt' },
  { id: 'alltag', label: 'Alltag & Zwischenzeit' },
  { id: 'anderes', label: 'Anderes Thema' }
]);

const TOPIC_BOARD_LIMITS = Object.freeze({
  title: 150,
  description: 1800,
  meta: 180,
  iconUrl: 1200,
  participantCount: 18,
  voteCount: 100
});

function normalizeTopicBoardLine(value, maximum = TOPIC_BOARD_LIMITS.meta) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum);
}

function normalizeTopicBoardParagraph(value, maximum = TOPIC_BOARD_LIMITS.description) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maximum);
}

function normalizeTopicBoardImage(value) {
  return String(value ?? '').trim().slice(0, TOPIC_BOARD_LIMITS.iconUrl);
}

function normalizeTopicBoardCategory(value) {
  const id = normalizeTopicBoardLine(value, 32).toLowerCase();
  return TOPIC_BOARD_CATEGORIES.some(category => category.id === id) ? id : 'anderes';
}

function getTopicBoardCategoryLabel(value) {
  const id = normalizeTopicBoardCategory(value);
  return TOPIC_BOARD_CATEGORIES.find(category => category.id === id)?.label || 'Anderes Thema';
}

function normalizeTopicBoardParticipants(input) {
  const participants = Array.isArray(input) ? input : [];
  const seen = new Set();
  return participants.map(participant => {
    const id = normalizeTopicBoardLine(participant?.id, 180);
    if (!id || seen.has(id)) return null;
    seen.add(id);
    return {
      id,
      name: normalizeTopicBoardLine(participant?.name, 120) || 'Unbekannt',
      portrait: normalizeTopicBoardImage(participant?.portrait)
    };
  }).filter(Boolean).slice(0, TOPIC_BOARD_LIMITS.participantCount);
}

function normalizeTopicBoardVotes(input) {
  const votes = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  return Object.entries(votes).reduce((next, [rawId, value]) => {
    if (Object.keys(next).length >= TOPIC_BOARD_LIMITS.voteCount || value !== true) return next;
    const id = normalizeTopicBoardLine(rawId, 180);
    if (id) next[id] = true;
    return next;
  }, {});
}

function normalizeTopicProposal(input = {}) {
  const status = input.status === TOPIC_BOARD_STATUS_ARCHIVED
    ? TOPIC_BOARD_STATUS_ARCHIVED
    : TOPIC_BOARD_STATUS_OPEN;
  const createdAtClient = Number.isFinite(Number(input.createdAtClient))
    ? Number(input.createdAtClient)
    : Date.now();
  const updatedAtClient = Number.isFinite(Number(input.updatedAtClient))
    ? Number(input.updatedAtClient)
    : createdAtClient;
  const votes = normalizeTopicBoardVotes(input.votes);
  return {
    id: normalizeTopicBoardLine(input.id, 180),
    title: normalizeTopicBoardLine(input.title, TOPIC_BOARD_LIMITS.title),
    description: normalizeTopicBoardParagraph(input.description),
    category: normalizeTopicBoardCategory(input.category),
    timeframe: normalizeTopicBoardLine(input.timeframe),
    duration: normalizeTopicBoardLine(input.duration),
    location: normalizeTopicBoardLine(input.location),
    themeIconUrl: normalizeTopicBoardImage(input.themeIconUrl || input.iconUrl),
    vehicle: normalizeTopicBoardLine(input.vehicle),
    vehicleIconUrl: normalizeTopicBoardImage(input.vehicleIconUrl),
    participants: normalizeTopicBoardParticipants(input.participants),
    votes,
    voteCount: Object.keys(votes).length,
    status,
    createdBy: normalizeTopicBoardLine(input.createdBy, 180),
    createdAtClient,
    updatedAtClient,
    archivedAtClient: status === TOPIC_BOARD_STATUS_ARCHIVED && Number.isFinite(Number(input.archivedAtClient))
      ? Number(input.archivedAtClient)
      : 0,
    schemaVersion: TOPIC_BOARD_SCHEMA_VERSION,
    localOnly: input.localOnly === true
  };
}

function getTopicProposalVoteCount(input) {
  return Object.keys(normalizeTopicBoardVotes(input?.votes)).length;
}

function hasTopicProposalVote(input, voterId) {
  const safeId = normalizeTopicBoardLine(voterId, 180);
  return !!safeId && normalizeTopicBoardVotes(input?.votes)[safeId] === true;
}

function sortTopicProposals(input, status = TOPIC_BOARD_STATUS_OPEN) {
  return (Array.isArray(input) ? input : [])
    .map(normalizeTopicProposal)
    .filter(proposal => proposal.status === status)
    .sort((left, right) => {
      if (status === TOPIC_BOARD_STATUS_OPEN && right.voteCount !== left.voteCount) {
        return right.voteCount - left.voteCount;
      }
      const leftDate = status === TOPIC_BOARD_STATUS_ARCHIVED
        ? left.archivedAtClient || left.updatedAtClient
        : left.updatedAtClient;
      const rightDate = status === TOPIC_BOARD_STATUS_ARCHIVED
        ? right.archivedAtClient || right.updatedAtClient
        : right.updatedAtClient;
      return rightDate - leftDate;
    });
}

globalThis.AleriaTopicBoardModel = Object.freeze({
  TOPIC_BOARD_CATEGORIES,
  TOPIC_BOARD_LIMITS,
  TOPIC_BOARD_SCHEMA_VERSION,
  TOPIC_BOARD_STATUS_ARCHIVED,
  TOPIC_BOARD_STATUS_OPEN,
  getTopicBoardCategoryLabel,
  getTopicProposalVoteCount,
  hasTopicProposalVote,
  normalizeTopicBoardParticipants,
  normalizeTopicProposal,
  sortTopicProposals
});
