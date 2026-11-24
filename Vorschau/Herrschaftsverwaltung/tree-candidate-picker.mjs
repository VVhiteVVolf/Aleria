import { normalizePersonName } from '../../js/world-identity/person-identity.js';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { portrait } from './workbench-view.mjs';

const RESULT_LIMIT = 40;

export function createTreeCandidateSearch(candidates, people) {
  const index = [...candidates.values()].map(({ id, family, families, regions }) => {
    const person = people.get(id);
    const name = normalizePersonName(person.name);
    const searchable = normalizePersonName([person.name, person.alias, family, ...(families || []), ...(regions || [])].filter(Boolean).join(' '));
    return { person, name, family, regions, searchable };
  }).sort((a, b) => a.person.name.localeCompare(b.person.name, 'de'));
  return value => {
    const query = normalizePersonName(value);
    if (query.length < 2) return { matches: [], total: 0 };
    const terms = query.split(' ');
    const named = [], associated = [];
    for (const entry of index) {
      if (terms.every(term => entry.name.includes(term))) named.push(entry);
      else if (terms.every(term => entry.searchable.includes(term))) associated.push(entry);
    }
    return { matches: [...named, ...associated].slice(0, RESULT_LIMIT), total: named.length + associated.length };
  };
}

function renderResult({ person, family, regions }, listed) {
  const geography = regions?.slice(0, 3).join(' · ');
  return `<li><button type="button" class="candidate tree-result" data-tree-action="add" data-tree-person="${e(person.id)}"
    ${listed ? 'disabled' : ''} aria-label="${e(listed ? `${person.name} steht bereits auf der Liste` : `${person.name} aus ${family} hinzufügen`)}">
    ${portrait(person)}
    <span class="candidate-text"><strong>${e(person.name)}</strong><small>${e(family)}${person.age == null ? '' : ` · ${person.age} J.`}</small>
    ${geography ? `<small>${e(geography)}</small>` : ''}</span>
    <span class="tree-result-action" aria-hidden="true">${listed ? '✓' : '+'}</span></button></li>`;
}

export function bindTreeCandidatePicker(panel, { candidates, people, listed, onAdd }) {
  const header = panel.querySelector('[data-role="current-candidate-header"]');
  const list = panel.querySelector('[data-role="candidate-list"]');
  const treeHeader = panel.querySelector('[data-role="tree-candidate-header"]');
  const treeList = panel.querySelector('[data-role="tree-candidate-list"]');
  const input = treeHeader.querySelector('input');
  const status = treeHeader.querySelector('[data-role="tree-candidate-status"]');
  const trigger = panel.querySelector('[data-tree-action="open"]');
  let find;

  function show(open, focus = false) {
    header.hidden = list.hidden = open;
    treeHeader.hidden = treeList.hidden = !open;
    panel.setAttribute('aria-labelledby', open ? 'tree-candidates-title' : 'candidates-title');
    if (!open) treeList.replaceChildren();
    if (focus) (open ? input : trigger).focus();
  }

  function draw() {
    find ||= createTreeCandidateSearch(candidates, people);
    const query = input.value;
    const { matches, total } = find(query);
    status.textContent = total > RESULT_LIMIT ? `${RESULT_LIMIT} von ${total} Treffern` : total ? `${total} Treffer` : '';
    treeList.innerHTML = matches.length ? matches.map(entry => renderResult(entry, listed(entry.person.id))).join('')
      : `<li class="no-candidates">${normalizePersonName(query).length < 2 ? 'Name, Familie oder Region eingeben.' : 'Keine lebende Figur gefunden.'}</li>`;
    treeList.scrollTop = 0;
  }

  input.addEventListener('input', draw);
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-tree-action]');
    if (!button) return;
    switch (button.dataset.treeAction) {
      case 'open':
        input.value = '';
        draw();
        show(true, true);
        break;
      case 'close': show(false, true); break;
      case 'add':
        if (onAdd(button.dataset.treePerson)) show(false);
        break;
    }
  });
  return { close: (focus = false) => show(false, focus), isOpen: () => !treeHeader.hidden };
}
