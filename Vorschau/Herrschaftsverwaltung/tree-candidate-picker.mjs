import { normalizePersonName } from '../../js/world-identity/person-identity.js';
import { escapeHtml as e } from '../shared/country-workbench/render.mjs';
import { portrait } from './workbench-view.mjs';

const RESULT_LIMIT = 40;
const COUNTY = 'Celtigerns Wacht';

export function createTreeCandidateSearch(candidates, people, region = COUNTY) {
  const countyName = normalizePersonName(region);
  const index = [...candidates.values()].map(({ id, family, families, regions }) => {
    const person = people.get(id);
    const name = normalizePersonName(person.name);
    const searchable = normalizePersonName([person.name, person.alias, family, ...(families || []), ...(regions || [])].filter(Boolean).join(' '));
    const county = regions?.find(region => normalizePersonName(region) === countyName);
    const geography = county ? [county, ...regions.filter(region => region !== county)] : regions;
    return { person, name, family, regions: geography, searchable, local: Boolean(county) };
  }).sort((a, b) => a.person.name.localeCompare(b.person.name, 'de'));
  return (value, { includeOtherRegions = false } = {}) => {
    const query = normalizePersonName(value);
    if (query.length < 2) return { matches: [], total: 0 };
    const terms = query.split(' ');
    const local = { named: [], associated: [] };
    const other = { named: [], associated: [] };
    for (const entry of index) {
      if (!entry.local && !includeOtherRegions) continue;
      const group = entry.local ? local : other;
      if (terms.every(term => entry.name.includes(term))) group.named.push(entry);
      else if (terms.every(term => entry.searchable.includes(term))) group.associated.push(entry);
    }
    const ordered = [...local.named, ...local.associated, ...other.named, ...other.associated];
    return { matches: ordered.slice(0, RESULT_LIMIT), total: ordered.length };
  };
}

function renderResult({ person, family, regions }, listed) {
  const geography = regions?.slice(0, 3).join(' · ');
  return `<li><button type="button" class="candidate tree-result" data-tree-action="choose" data-tree-person="${e(person.id)}"
    aria-label="${e(listed ? `${person.name} in der Bewerberliste auswählen` : `${person.name} aus ${family} hinzufügen`)}">
    ${portrait(person)}
    <span class="candidate-text"><strong>${e(person.name)}</strong><small>${e(family)}${person.age == null ? '' : ` · ${person.age} J.`}</small>
    ${geography ? `<small>${e(geography)}</small>` : ''}
    <small class="tree-result-action">${listed ? 'Bereits in der Bewerberliste · Auswählen' : 'Zur Bewerberliste hinzufügen'}</small></span></button></li>`;
}

export function bindTreeCandidatePicker(panel, { candidates, people, listed, homeRegion, onChoose }) {
  const header = panel.querySelector('[data-role="current-candidate-header"]');
  const list = panel.querySelector('[data-role="candidate-list"]');
  const treeHeader = panel.querySelector('[data-role="tree-candidate-header"]');
  const title = treeHeader.querySelector('h3');
  const treeList = panel.querySelector('[data-role="tree-candidate-list"]');
  const input = treeHeader.querySelector('input[type="search"]');
  const includeOtherRegions = treeHeader.querySelector('[data-role="tree-other-regions"]');
  const status = treeHeader.querySelector('[data-role="tree-candidate-status"]');
  const receipt = header.querySelector('[data-role="tree-selection-status"]');
  const trigger = panel.querySelector('[data-tree-action="open"]');
  let find;
  let currentRegion;

  function showReceipt(message = '') {
    receipt.textContent = message;
  }

  function show(open, focus = false) {
    header.hidden = list.hidden = open;
    treeHeader.hidden = treeList.hidden = !open;
    panel.setAttribute('aria-labelledby', open ? 'tree-candidates-title' : 'candidates-title');
    if (!open) treeList.replaceChildren();
    if (focus) (open ? input : trigger).focus();
  }

  function draw() {
    const region = homeRegion?.() || COUNTY;
    if (currentRegion !== region) {
      find = createTreeCandidateSearch(candidates, people, region);
      currentRegion = region;
    }
    const query = input.value;
    const all = includeOtherRegions.checked;
    title.textContent = all ? 'Alle Stammbäume' : region;
    input.placeholder = all ? 'Name, Familie oder Region' : 'Name oder Familie';
    const { matches, total } = find(query, { includeOtherRegions: all });
    status.textContent = total > RESULT_LIMIT ? `${RESULT_LIMIT} von ${total} Treffern` : total ? `${total} Treffer` : '';
    treeList.innerHTML = matches.length ? matches.map(entry => renderResult(entry, listed(entry.person.id))).join('')
      : `<li class="no-candidates">${normalizePersonName(query).length < 2 ? 'Name oder Familie eingeben.'
        : all ? 'Keine lebende Figur gefunden.' : `Keine passende Figur aus ${e(region)} gefunden.`}</li>`;
    treeList.scrollTop = 0;
  }

  input.addEventListener('input', draw);
  includeOtherRegions.addEventListener('change', draw);
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-tree-action]');
    if (!button) return;
    switch (button.dataset.treeAction) {
      case 'open':
        input.value = '';
        includeOtherRegions.checked = false;
        showReceipt();
        draw();
        show(true, true);
        break;
      case 'close': show(false, true); break;
      case 'choose': {
        const id = button.dataset.treePerson;
        try {
          const message = onChoose(id);
          show(false);
          showReceipt(message);
          list.querySelector(`[data-drag-person="${CSS.escape(id)}"]`)?.focus();
        } catch (error) {
          status.textContent = error.message;
        }
        break;
      }
    }
  });
  return { close: (focus = false) => show(false, focus), clearReceipt: showReceipt, isOpen: () => !treeHeader.hidden };
}
