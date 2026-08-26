const TOPIC_BOARD_LOCAL_STORAGE_KEY = 'aleria.topic-board.proposals.v1';
const TOPIC_BOARD_LOCAL_VOTER_KEY = 'aleria.topic-board.voter.v1';

let _topicBoardProposals = [];
let _topicBoardView = TOPIC_BOARD_STATUS_OPEN;
let _topicBoardLoading = true;
let _topicBoardRemoteConnected = false;
let _topicBoardRemoteUnsubscribe = null;
let _topicBoardInitialized = false;
let _topicBoardRemoteState = 'connecting';
let _topicBoardRemoteError = '';
let _topicBoardReconnectTimer = null;
let _topicBoardReconnectAttempt = 0;
let _topicBoardLocalPublishInFlight = false;

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

function getTopicBoardErrorMessage(error, fallback = 'Die Online-Synchronisierung ist derzeit nicht verfügbar.') {
  const message = String(error?.message || '').trim();
  return message || fallback;
}

function getPendingTopicBoardProposals() {
  return readLocalTopicProposals().filter(proposal => proposal.localOnly);
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
  const pendingCount = getPendingTopicBoardProposals().length;
  return {
    proposals: _topicBoardProposals.map(proposal => cloneTopicBoardValue(proposal)),
    view: _topicBoardView,
    loading: _topicBoardLoading,
    remoteConnected: _topicBoardRemoteConnected,
    syncState: pendingCount && _topicBoardRemoteState === 'online' ? 'syncing' : _topicBoardRemoteState,
    syncError: _topicBoardRemoteError,
    pendingCount,
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

function removePendingTopicBoardProposal(proposalId) {
  const safeId = String(proposalId || '').trim();
  writeLocalTopicProposals(getPendingTopicBoardProposals().filter(proposal => proposal.id !== safeId));
}

function isTopicBoardLocalId(proposalId) {
  return String(proposalId || '').startsWith('topic-');
}

async function publishTopicBoardLocalProposal(backend, input) {
  const proposal = normalizeTopicProposal(input);
  if (!isTopicBoardLocalId(proposal.id)) {
    try {
      return await backend.updateTopicProposal(proposal.id, proposal);
    } catch (error) {
      if (!String(error?.message || '').includes('nicht gefunden')) throw error;
    }
  }
  return backend.createTopicProposal({ ...proposal, id: '' });
}

async function publishPendingTopicBoardProposals(backend = getTopicBoardRemoteBackend()) {
  if (_topicBoardLocalPublishInFlight || !backend) return false;
  const pending = getPendingTopicBoardProposals();
  if (!pending.length) return true;
  _topicBoardLocalPublishInFlight = true;
  _topicBoardRemoteState = 'syncing';
  _topicBoardRemoteError = '';
  emitTopicBoardStateChanged();
  try {
    for (const localProposal of pending) {
      const result = await publishTopicBoardLocalProposal(backend, localProposal);
      const published = normalizeTopicProposal({ ...localProposal, ...(result || {}), localOnly: false });
      removePendingTopicBoardProposal(localProposal.id);
      _topicBoardProposals = [
        ..._topicBoardProposals.filter(proposal => proposal.id !== localProposal.id && proposal.id !== published.id),
        published
      ];
    }
    _topicBoardRemoteState = 'online';
    _topicBoardRemoteConnected = true;
    emitTopicBoardStateChanged();
    return true;
  } catch (error) {
    _topicBoardRemoteState = 'error';
    _topicBoardRemoteError = getTopicBoardErrorMessage(error, 'Lokale Themen konnten noch nicht online veröffentlicht werden.');
    console.warn('Lokale Themen konnten noch nicht online veröffentlicht werden:', error);
    emitTopicBoardStateChanged();
    return false;
  } finally {
    _topicBoardLocalPublishInFlight = false;
  }
}

function clearTopicBoardReconnectTimer() {
  if (_topicBoardReconnectTimer === null) return;
  globalThis.clearTimeout?.(_topicBoardReconnectTimer);
  _topicBoardReconnectTimer = null;
}

function scheduleTopicBoardReconnect() {
  if (_topicBoardReconnectTimer !== null) return;
  const delay = Math.min(30000, 1000 * (2 ** Math.min(_topicBoardReconnectAttempt, 5)));
  _topicBoardReconnectAttempt += 1;
  _topicBoardReconnectTimer = globalThis.setTimeout?.(() => {
    _topicBoardReconnectTimer = null;
    connectTopicBoardRemote();
  }, delay) ?? null;
}

function disconnectTopicBoardRemote() {
  if (typeof _topicBoardRemoteUnsubscribe === 'function') _topicBoardRemoteUnsubscribe();
  _topicBoardRemoteUnsubscribe = null;
}

function connectTopicBoardRemote() {
  const backend = getTopicBoardRemoteBackend();
  if (!backend) {
    _topicBoardRemoteState = 'connecting';
    _topicBoardRemoteConnected = false;
    emitTopicBoardStateChanged();
    scheduleTopicBoardReconnect();
    return;
  }
  if (_topicBoardRemoteUnsubscribe) return;
  clearTopicBoardReconnectTimer();
  _topicBoardRemoteState = 'connecting';
  _topicBoardRemoteError = '';
  try {
    _topicBoardRemoteUnsubscribe = backend.subscribeTopicProposals(proposals => {
      _topicBoardRemoteConnected = true;
      _topicBoardRemoteState = 'online';
      _topicBoardRemoteError = '';
      _topicBoardReconnectAttempt = 0;
      _topicBoardLoading = false;
      setTopicBoardProposals(mergeTopicBoardRemoteAndLocal(proposals));
      publishPendingTopicBoardProposals(backend);
    }, error => {
      disconnectTopicBoardRemote();
      _topicBoardRemoteConnected = false;
      _topicBoardRemoteState = 'error';
      _topicBoardRemoteError = getTopicBoardErrorMessage(error);
      _topicBoardLoading = false;
      console.warn('Themenwand-Liveabgleich nicht verfuegbar:', error);
      emitTopicBoardStateChanged();
      scheduleTopicBoardReconnect();
    });
  } catch (error) {
    disconnectTopicBoardRemote();
    _topicBoardRemoteConnected = false;
    _topicBoardRemoteState = 'error';
    _topicBoardRemoteError = getTopicBoardErrorMessage(error);
    _topicBoardLoading = false;
    console.warn('Themenwand konnte nicht mit Firebase verbunden werden:', error);
    emitTopicBoardStateChanged();
    scheduleTopicBoardReconnect();
  }
}

function retryTopicBoardRemote() {
  clearTopicBoardReconnectTimer();
  disconnectTopicBoardRemote();
  _topicBoardReconnectAttempt = 0;
  _topicBoardRemoteState = 'connecting';
  _topicBoardRemoteError = '';
  emitTopicBoardStateChanged();
  connectTopicBoardRemote();
}

function initializeTopicBoardState() {
  if (_topicBoardInitialized) return;
  _topicBoardInitialized = true;
  _topicBoardProposals = readLocalTopicProposals();
  _topicBoardLoading = false;
  globalThis.addEventListener?.('fb-ready', retryTopicBoardRemote);
  globalThis.addEventListener?.('online', retryTopicBoardRemote);
  globalThis.addEventListener?.('aleria:auth-state-changed', () => {
    if (_topicBoardRemoteConnected) publishPendingTopicBoardProposals();
    else retryTopicBoardRemote();
  });
  emitTopicBoardStateChanged();
  connectTopicBoardRemote();
}

function requireTopicBoardRemoteBackend() {
  const backend = getTopicBoardRemoteBackend();
  if (backend) return backend;
  retryTopicBoardRemote();
  throw new Error('Die Themenwand ist noch nicht mit Firebase verbunden. Bitte versuche es gleich erneut.');
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
  const backend = requireTopicBoardRemoteBackend();
  const result = await backend.createTopicProposal(payload);
  const created = normalizeTopicProposal({ ...payload, ...(result || {}), localOnly: false });
  if (created.id) setTopicBoardProposals([..._topicBoardProposals.filter(item => item.id !== created.id), created]);
  return { proposal: created, localOnly: false };
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
  const backend = requireTopicBoardRemoteBackend();
  const result = current.localOnly
    ? await publishTopicBoardLocalProposal(backend, payload)
    : await backend.updateTopicProposal(current.id, payload);
  const updated = normalizeTopicProposal({ ...payload, ...(result || {}), localOnly: false });
  if (current.localOnly) removePendingTopicBoardProposal(current.id);
  setTopicBoardProposals([
    ..._topicBoardProposals.filter(item => item.id !== current.id && item.id !== updated.id),
    updated
  ]);
  return { proposal: updated, localOnly: false };
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
  const backend = requireTopicBoardRemoteBackend();
  let remoteId = current.id;
  if (current.localOnly) {
    const published = await publishTopicBoardLocalProposal(backend, current);
    remoteId = String(published?.id || '').trim();
    if (!remoteId) throw new Error('Der lokale Themenvorschlag konnte nicht online veröffentlicht werden.');
    removePendingTopicBoardProposal(current.id);
    const synchronized = normalizeTopicProposal({ ...current, ...published, localOnly: false });
    _topicBoardProposals = [
      ..._topicBoardProposals.filter(item => item.id !== current.id && item.id !== synchronized.id),
      synchronized
    ];
  }
  const result = await backend.toggleTopicProposalVote(remoteId);
  if (result?.proposal) {
    const updated = normalizeTopicProposal({ ...result.proposal, localOnly: false });
    setTopicBoardProposals(_topicBoardProposals.map(item => item.id === remoteId ? updated : item));
  }
  return { ...result, localOnly: false };
}

globalThis.AleriaTopicBoardStore = Object.freeze({
  createTopicBoardProposal,
  getTopicBoardProposalById,
  getTopicBoardState,
  getTopicBoardViewerId,
  getTopicBoardVisibleProposals,
  initializeTopicBoardState,
  retrySync: retryTopicBoardRemote,
  setTopicBoardProposalArchived,
  setTopicBoardView,
  toggleTopicBoardProposalVote,
  updateTopicBoardProposal
});
