const TOPIC_BOARD_LIST_SORT_VOTES = 'votes';
const TOPIC_BOARD_LIST_SORT_NEWEST = 'newest';
const TOPIC_BOARD_LIST_SORT_TITLE = 'title';

let _topicBoardListState = {
  query: '',
  category: 'all',
  sort: TOPIC_BOARD_LIST_SORT_VOTES,
  expandedId: ''
};

function normalizeTopicBoardSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTopicBoardProposalSearchText(proposal = {}) {
  const travel = proposal.travel || {};
  return normalizeTopicBoardSearchText([
    proposal.title,
    proposal.description,
    proposal.timeframe,
    proposal.duration,
    proposal.location,
    proposal.vehicle,
    ...(Array.isArray(proposal.participants) ? proposal.participants.map(participant => participant?.name) : []),
    travel.origin,
    travel.destination,
    ...(Array.isArray(travel.stopovers) ? travel.stopovers.flatMap(stopover => [stopover?.place, stopover?.note]) : [])
  ].filter(Boolean).join(' '));
}

function cloneTopicBoardListState() {
  return { ..._topicBoardListState };
}

function setTopicBoardListQuery(value) {
  _topicBoardListState.query = normalizeTopicBoardSearchText(value);
  _topicBoardListState.expandedId = '';
  return cloneTopicBoardListState();
}

function setTopicBoardListCategory(value) {
  const category = String(value || '').trim().toLowerCase();
  _topicBoardListState.category = category === 'all' || TOPIC_BOARD_CATEGORIES.some(item => item.id === category)
    ? category
    : 'all';
  _topicBoardListState.expandedId = '';
  return cloneTopicBoardListState();
}

function setTopicBoardListSort(value) {
  const sort = String(value || '').trim().toLowerCase();
  _topicBoardListState.sort = [TOPIC_BOARD_LIST_SORT_VOTES, TOPIC_BOARD_LIST_SORT_NEWEST, TOPIC_BOARD_LIST_SORT_TITLE].includes(sort)
    ? sort
    : TOPIC_BOARD_LIST_SORT_VOTES;
  return cloneTopicBoardListState();
}

function toggleTopicBoardListExpanded(proposalId) {
  const id = String(proposalId || '').trim();
  _topicBoardListState.expandedId = id && _topicBoardListState.expandedId !== id ? id : '';
  return _topicBoardListState.expandedId;
}

function clearTopicBoardListExpanded() {
  _topicBoardListState.expandedId = '';
}

function resetTopicBoardListFilters() {
  _topicBoardListState.query = '';
  _topicBoardListState.category = 'all';
  _topicBoardListState.sort = TOPIC_BOARD_LIST_SORT_VOTES;
  _topicBoardListState.expandedId = '';
  return cloneTopicBoardListState();
}

function hasTopicBoardListFilters() {
  return !!_topicBoardListState.query || _topicBoardListState.category !== 'all';
}

function selectTopicBoardListProposals(input) {
  const proposals = Array.isArray(input) ? input.slice() : [];
  const filtered = proposals.filter(proposal => {
    if (_topicBoardListState.category !== 'all' && proposal.category !== _topicBoardListState.category) return false;
    return !_topicBoardListState.query || getTopicBoardProposalSearchText(proposal).includes(_topicBoardListState.query);
  });
  return filtered.sort((left, right) => {
    if (_topicBoardListState.sort === TOPIC_BOARD_LIST_SORT_TITLE) {
      return String(left.title || '').localeCompare(String(right.title || ''), 'de', { sensitivity: 'base' });
    }
    if (_topicBoardListState.sort === TOPIC_BOARD_LIST_SORT_NEWEST) {
      return Number(right.updatedAtClient || right.createdAtClient || 0) - Number(left.updatedAtClient || left.createdAtClient || 0);
    }
    const voteDelta = Number(right.voteCount || 0) - Number(left.voteCount || 0);
    return voteDelta || Number(right.updatedAtClient || 0) - Number(left.updatedAtClient || 0);
  });
}

globalThis.AleriaTopicBoardListState = Object.freeze({
  clearExpanded: clearTopicBoardListExpanded,
  getState: cloneTopicBoardListState,
  hasFilters: hasTopicBoardListFilters,
  normalizeSearchText: normalizeTopicBoardSearchText,
  resetFilters: resetTopicBoardListFilters,
  selectProposals: selectTopicBoardListProposals,
  setCategory: setTopicBoardListCategory,
  setQuery: setTopicBoardListQuery,
  setSort: setTopicBoardListSort,
  toggleExpanded: toggleTopicBoardListExpanded
});
