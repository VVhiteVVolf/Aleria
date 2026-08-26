const TOPIC_BOARD_LOCAL_STORAGE_KEY = 'aleria.topic-board.proposals.v1';
const TOPIC_BOARD_LOCAL_VOTER_KEY = 'aleria.topic-board.voter.v1';

let _topicBoardProposals = [];
let _topicBoardView = TOPIC_BOARD_STATUS_OPEN;
let _topicBoardLoading = true;
let _topicBoardRemoteConnected = false;
let _topicBoardRemoteUnsubscribe = null;
let _topicBoardInitialized = false;

function cloneTopicBoardValue(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function makeTopicBoardLocalId(prefix = 'topic') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readLocalTopicProposals() {
  try {
    const parsed = JSON.parse(globalThis.localStorage?.getItem(TOPIC_BOARD_LOCAL_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeTopicProposal) : [];
  } catch (error) {
    console.warn('Lokale Themenvorschlaege konnten nicht gelesen werden:', error);
    return [];
  }
}

function writeLocalTopicProposals(proposals) {
  try {
    globalThis.localStorage?.setItem(
      TOPIC_BOARD_LOCAL_STORAGE_KEY,
      JSON.stringify((Array.isArray(proposals) ? proposals : []).map(normalizeTopicProposal))
    );
  } catch (error) {
    console.warn('Lokale Themenvorschlaege konnten nicht gespeichert werden:', error);
  }
}

function getLocalTopicBoardVoterId() {
  try {
    const existing = String(globalThis.localStorage?.getItem(TOPIC_BOARD_LOCAL_VOTER_KEY) || '').trim();
    if (existing) return existing;
    const created = makeTopicBoardLocalId('voter');
    globalThis.localStorage?.setItem(TOPIC_BOARD_LOCAL_VOTER_KEY, created);
    return created;
  } catch {
    return 'voter-local-session';
  }
}

function getTopicBoardRemoteBackend() {
  const backend = globalThis._fb;
  if (!backend) return null;
  const required = ['createTopicProposal', 'updateTopicProposal', 'toggleTopicProposalVote', 'subscribeTopicProposals'];
  return required.every(method => typeof backend[method] === 'function') ? backend : null;
}

function getTopicBoardViewerId() {
  const backend = getTopicBoardRemoteBackend();
  const remoteId = backend && typeof backend.getTopicProposalViewerId === 'function'
    ? String(backend.getTopicProposalViewerId() || '').trim()
    : '';
  return remoteId || getLocalTopicBoardVoterId();
}

function getTopicBoardCreationSchedule(input = {}) {
  if (globalThis.AleriaTopicBoardSchedule?.hasDate(input?.schedule?.startDate)) return input.schedule;
  const model = globalThis.AleriaWorldDateModel;
  const current = globalThis.AleriaWorldDateStore?.getState?.().date || model?.getDefault?.();
  return {
    ...(input?.schedule || {}),
    startDate: model?.isValid?.(current) ? model.normalize(current) : null
  };
}

function mergeTopicBoardRemoteAndLocal(remoteProposals) {
  const remote = (Array.isArray(remoteProposals) ? remoteProposals : []).map(normalizeTopicProposal);
  const remoteIds = new Set(remote.map(proposal => proposal.id));
  const localOnly = readLocalTopicProposals()
    .filter(proposal => proposal.localOnly && !remoteIds.has(proposal.id));
  return [...remote, ...localOnly];
}

function emitTopicBoardStateChanged() {
  if (typeof document === 'undefined') return;
  document.dispatchEvent(new CustomEvent('almanach-topic-board-state', {
    detail: getTopicBoardState()
  }));
}

function setTopicBoardProposals(proposals) {
  _topicBoardProposals = (Array.isArray(proposals) ? proposals : []).map(normalizeTopicProposal);
  emitTopicBoardStateChanged();
}

function getTopicBoardState() {
  return {
    proposals: _topicBoardProposals.map(proposal => cloneTopicBoardValue(proposal)),
    view: _topicBoardView,
    loading: _topicBoardLoading,
    remoteConnected: _topicBoardRemoteConnected,
    viewerId: getTopicBoardViewerId()
  };
}

function getTopicBoardVisibleProposals() {
  return sortTopicProposals(_topicBoardProposals, _topicBoardView);
}

function getTopicBoardProposalById(proposalId) {
  const safeId = String(proposalId || '').trim();
  const proposal = _topicBoardProposals.find(item => item.id === safeId);
  return proposal ? normalizeTopicProposal(proposal) : null;
}

function setTopicBoardView(view) {
  _topicBoardView = view === TOPIC_BOARD_STATUS_ARCHIVED
    ? TOPIC_BOARD_STATUS_ARCHIVED
    : TOPIC_BOARD_STATUS_OPEN;
  emitTopicBoardStateChanged();
}

function saveLocalTopicProposal(input, proposalId = '') {
  const now = Date.now();
  const current = proposalId ? getTopicBoardProposalById(proposalId) : null;
  const proposal = normalizeTopicProposal({
    ...current,
    ...input,
    id: current?.id || proposalId || makeTopicBoardLocalId(),
    votes: Object.prototype.hasOwnProperty.call(input || {}, 'votes')
      ? input.votes
      : (current?.votes || {}),
    createdAtClient: current?.createdAtClient || now,
    updatedAtClient: now,
    localOnly: true
  });
  const next = _topicBoardProposals.filter(item => item.id !== proposal.id);
  next.push(proposal);
  writeLocalTopicProposals(next.filter(item => item.localOnly));
  setTopicBoardProposals(next);
  return proposal;
}

function toggleLocalTopicProposalVote(proposalId) {
  const current = getTopicBoardProposalById(proposalId);
  if (!current) throw new Error('Der Themenvorschlag wurde nicht gefunden.');
  const voterId = getLocalTopicBoardVoterId();
  const votes = { ...current.votes };
  if (votes[voterId]) delete votes[voterId];
  else votes[voterId] = true;
  const proposal = saveLocalTopicProposal({ ...current, votes }, current.id);
  return { proposal, voted: !!proposal.votes[voterId], localOnly: true };
}

function connectTopicBoardRemote(attempt = 0) {
  const backend = getTopicBoardRemoteBackend();
  if (!backend) {
    if (attempt < 80) globalThis.setTimeout?.(() => connectTopicBoardRemote(attempt + 1), 250);
    return;
  }
  if (_topicBoardRemoteUnsubscribe) return;
  try {
    _topicBoardRemoteUnsubscribe = backend.subscribeTopicProposals(proposals => {
      _topicBoardRemoteConnected = true;
      _topicBoardLoading = false;
      setTopicBoardProposals(mergeTopicBoardRemoteAndLocal(proposals));
    }, error => {
      _topicBoardRemoteConnected = false;
      _topicBoardLoading = false;
      console.warn('Themenwand-Liveabgleich nicht verfuegbar:', error);
      emitTopicBoardStateChanged();
    });
  } catch (error) {
    _topicBoardRemoteConnected = false;
    _topicBoardLoading = false;
    console.warn('Themenwand konnte nicht mit Firebase verbunden werden:', error);
    emitTopicBoardStateChanged();
  }
}

function initializeTopicBoardState() {
  if (_topicBoardInitialized) return;
  _topicBoardInitialized = true;
  _topicBoardProposals = readLocalTopicProposals();
  _topicBoardLoading = false;
  emitTopicBoardStateChanged();
  connectTopicBoardRemote();
}

async function createTopicBoardProposal(input) {
  const payload = normalizeTopicProposal({
    ...input,
    schedule: getTopicBoardCreationSchedule(input),
    id: '',
    status: TOPIC_BOARD_STATUS_OPEN,
    votes: {},
    createdAtClient: Date.now(),
    updatedAtClient: Date.now()
  });
  if (!payload.title) throw new Error('Bitte gib dem Vorschlag eine Überschrift.');
  const backend = getTopicBoardRemoteBackend();
  if (backend) {
    try {
      const result = await backend.createTopicProposal(payload);
      const created = normalizeTopicProposal({ ...payload, ...(result || {}), localOnly: false });
      if (created.id) setTopicBoardProposals([..._topicBoardProposals.filter(item => item.id !== created.id), created]);
      return { proposal: created, localOnly: false };
    } catch (error) {
      console.warn('Themenvorschlag wird lokal gesichert:', error);
    }
  }
  return { proposal: saveLocalTopicProposal(payload), localOnly: true };
}

async function updateTopicBoardProposal(proposalId, changes) {
  const current = getTopicBoardProposalById(proposalId);
  if (!current) throw new Error('Der Themenvorschlag wurde nicht gefunden.');
  const payload = normalizeTopicProposal({
    ...current,
    ...changes,
    id: current.id,
    votes: current.votes,
    createdBy: current.createdBy,
    createdAtClient: current.createdAtClient,
    updatedAtClient: Date.now()
  });
  if (!payload.title) throw new Error('Bitte gib dem Vorschlag eine Überschrift.');
  const backend = getTopicBoardRemoteBackend();
  if (backend && !current.localOnly) {
    try {
      const result = await backend.updateTopicProposal(current.id, payload);
      const updated = normalizeTopicProposal({ ...payload, ...(result || {}), localOnly: false });
      setTopicBoardProposals(_topicBoardProposals.map(item => item.id === current.id ? updated : item));
      return { proposal: updated, localOnly: false };
    } catch (error) {
      console.warn('Aenderung am Themenvorschlag wird lokal gesichert:', error);
    }
  }
  return { proposal: saveLocalTopicProposal(payload, current.id), localOnly: true };
}

async function setTopicBoardProposalArchived(proposalId, archived) {
  return updateTopicBoardProposal(proposalId, {
    status: archived ? TOPIC_BOARD_STATUS_ARCHIVED : TOPIC_BOARD_STATUS_OPEN,
    archivedAtClient: archived ? Date.now() : 0
  });
}

async function toggleTopicBoardProposalVote(proposalId) {
  const current = getTopicBoardProposalById(proposalId);
  if (!current) throw new Error('Der Themenvorschlag wurde nicht gefunden.');
  const backend = getTopicBoardRemoteBackend();
  if (backend && !current.localOnly) {
    try {
      const result = await backend.toggleTopicProposalVote(current.id);
      if (result?.proposal) {
        const updated = normalizeTopicProposal({ ...result.proposal, localOnly: false });
        setTopicBoardProposals(_topicBoardProposals.map(item => item.id === current.id ? updated : item));
      }
      return { ...result, localOnly: false };
    } catch (error) {
      console.warn('Stimme wird lokal gesichert:', error);
    }
  }
  return toggleLocalTopicProposalVote(current.id);
}

globalThis.AleriaTopicBoardStore = Object.freeze({
  createTopicBoardProposal,
  getTopicBoardProposalById,
  getTopicBoardState,
  getTopicBoardViewerId,
  getTopicBoardVisibleProposals,
  initializeTopicBoardState,
  setTopicBoardProposalArchived,
  setTopicBoardView,
  toggleTopicBoardProposalVote,
  updateTopicBoardProposal
});
