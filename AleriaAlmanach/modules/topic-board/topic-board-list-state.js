const TOPIC_BOARD_LIST_SORT_VOTES = 'votes';
const TOPIC_BOARD_LIST_SORT_DUE = 'due';
const TOPIC_BOARD_LIST_SORT_NEWEST = 'newest';
const TOPIC_BOARD_LIST_SORT_TITLE = 'title';
const TOPIC_BOARD_LIST_SORT_PLAYED = 'played';

let _topicBoardListState = {
  query: '',
  category: 'all',
  focus: 'all',
  sort: TOPIC_BOARD_LIST_SORT_DUE,
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
    proposal.schedule?.startDate?.day,
    proposal.schedule?.startDate?.month,
    proposal.schedule?.startDate?.year,
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
  _topicBoardListState.sort = [TOPIC_BOARD_LIST_SORT_VOTES, TOPIC_BOARD_LIST_SORT_DUE, TOPIC_BOARD_LIST_SORT_NEWEST, TOPIC_BOARD_LIST_SORT_TITLE, TOPIC_BOARD_LIST_SORT_PLAYED].includes(sort)
    ? sort
    : TOPIC_BOARD_LIST_SORT_DUE;
  return cloneTopicBoardListState();
}

function setTopicBoardListFocus(value) {
  const focus = String(value || '').trim().toLowerCase();
  _topicBoardListState.focus = ['all', 'relevant', 'upcoming', 'unscheduled'].includes(focus)
    ? focus
    : 'all';
  _topicBoardListState.expandedId = '';
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
  _topicBoardListState.focus = 'all';
  _topicBoardListState.sort = TOPIC_BOARD_LIST_SORT_DUE;
  _topicBoardListState.expandedId = '';
  return cloneTopicBoardListState();
}

function hasTopicBoardListFilters() {
  return !!_topicBoardListState.query || _topicBoardListState.category !== 'all' || _topicBoardListState.focus !== 'all';
}

function selectTopicBoardListProposals(input) {
  const proposals = Array.isArray(input) ? input.slice() : [];
  const currentDate = typeof getCurrentTopicBoardWorldDate === 'function'
    ? getCurrentTopicBoardWorldDate()
    : (globalThis.AleriaWorldDateStore?.getState?.().date || globalThis.AleriaWorldDateModel?.getDefault?.());
  const focused = globalThis.AleriaTopicBoardPlanning.filterProposals(proposals, _topicBoardListState.focus, currentDate);
  const filtered = focused.filter(proposal => {
    if (_topicBoardListState.category !== 'all' && proposal.category !== _topicBoardListState.category) return false;
    return !_topicBoardListState.query || getTopicBoardProposalSearchText(proposal).includes(_topicBoardListState.query);
  });
  if (_topicBoardListState.sort === TOPIC_BOARD_LIST_SORT_DUE) {
    return globalThis.AleriaTopicBoardPlanning.sortChronologically(filtered);
  }
  return filtered.sort((left, right) => {
    if (_topicBoardListState.sort === TOPIC_BOARD_LIST_SORT_PLAYED) {
      return Number(right.archivedAtClient || right.updatedAtClient || 0) - Number(left.archivedAtClient || left.updatedAtClient || 0);
    }
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
  setFocus: setTopicBoardListFocus,
  setQuery: setTopicBoardListQuery,
  setSort: setTopicBoardListSort,
  toggleExpanded: toggleTopicBoardListExpanded
});
