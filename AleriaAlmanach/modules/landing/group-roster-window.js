const fold = value => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('de-DE');

export function selectGroupRosterWindow(members, { search = '', assignment = 'all', page = 0, pageSize = 20 } = {}) {
  const needle = fold(search).trim();
  const filtered = members.filter(member => (assignment === 'all' || member.assignment === assignment)
    && (!needle || fold([member.name, member.role, member.treeLabel, member.ownerName, member.note].join(' ')).includes(needle)));
  const size = Math.max(1, Math.min(40, Math.floor(Number(pageSize) || 20)));
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.max(0, Math.min(pages - 1, Math.floor(Number(page) || 0)));
  return { members: filtered.slice(current * size, (current + 1) * size), filtered: filtered.length,
    total: members.length, page: current, pages, compact: members.length > 4,
    first: filtered.length ? current * size + 1 : 0, last: Math.min(filtered.length, (current + 1) * size) };
}

// Search controls survive data pushes; only their result region is replaced.
export function mountGroupRosterWindow(root, renderResults) {
  const abort = new AbortController();
  const state = { search: '', assignment: 'all', page: 0 };
  let members = [], stopped = false;
  function render() {
    if (stopped) return;
    const window = selectGroupRosterWindow(members, state);
    state.page = window.page;
    const host = root.querySelector('[data-group-roster-results]');
    if (host) host.innerHTML = renderResults(window);
    const count = root.querySelector('[data-group-roster-count]');
    if (count) count.textContent = `${window.first}–${window.last} von ${window.filtered} Gefährten`;
  }
  root.addEventListener('input', event => {
    if (!event.target.matches?.('[data-group-roster-search]')) return;
    state.search = event.target.value; state.page = 0; render();
  }, { signal: abort.signal });
  root.addEventListener('change', event => {
    if (!event.target.matches?.('[data-group-roster-assignment]')) return;
    state.assignment = event.target.value; state.page = 0; render();
  }, { signal: abort.signal });
  root.addEventListener('click', event => {
    const button = event.target.closest?.('[data-group-roster-page]');
    if (!button || button.disabled || !root.contains(button)) return;
    state.page += button.dataset.groupRosterPage === 'next' ? 1 : -1; render();
  }, { signal: abort.signal });
  return { update(next) { members = next || []; render(); }, destroy() { stopped = true; abort.abort(); } };
}
