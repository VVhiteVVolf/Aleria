import { renderCouncilGroups } from './council-directory.mjs?v=panels-20260911a';

const imageSelector = 'img[src], .orte-image-slot[data-orte-image-key]';

// Each table retains its own source and observer; generated images never become
// part of inline-export numbering. This controller is owned by the page adapter.
export function createLegacyCouncilController({ cleanText, cloneImage }) {
  const records = new WeakMap();
  function render(table) {
    const groups = readCouncilTable(table, { cleanText, cloneImage });
    if (!groups.length) return;
    const next = renderCouncilGroups(groups);
    let record = records.get(table);
    if (!record) {
      record = { view: null, observer: null, timer: null };
      record.observer = new MutationObserver(() => {
        clearTimeout(record.timer);
        record.timer = setTimeout(() => render(table), 60);
      });
      record.observer.observe(table, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['src', 'href'] });
      records.set(table, record);
    }
    if (record.view?.isConnected) record.view.replaceWith(next);
    else (table.closest('.kingdom-table-scroll') || table).before(next);
    record.view = next;
    table.hidden = true;
    table.closest('.kingdom-table-scroll')?.classList.add('is-council-source-wrapper');
  }
  return { refresh(root) { root.querySelectorAll('.kingdom-council-table').forEach(render); } };
}

export function readCouncilTable(table, { cleanText, cloneImage }) {
  const rows = [...(table.tBodies[0]?.rows || [])];
  const groups = [];
  let title = 'Rat';
  let previous = null;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const text = cleanText(row);
    const imageCells = [...row.cells].filter(cell => cell.querySelector(imageSelector));
    if (imageCells.length) {
      const navigation = row.cells.length === 1 && text && row.querySelector('a[href]');
      if (navigation) {
        groups.push({ title: cleanText(previous) || title, links: [{
          label: text, href: navigation.getAttribute('href'), image: cloneImage(row.cells[0]),
        }] });
        previous = null;
        continue;
      }
      const names = rows[index + 1];
      const members = [...row.cells].flatMap((cell, column) => {
        if (!cell.querySelector(imageSelector)) return [];
        const name = cleanText(names?.cells[column]);
        const roleCell = previous?.cells.length === 1 ? previous.cells[0] : previous?.cells[column];
        const label = cleanText(roleCell);
        const isSeat = /background-color:\s*rgb\(153,\s*153,\s*153\)/.test(roleCell?.getAttribute('style') || '');
        return [{
          name, image: cloneImage(cell),
          office: isSeat ? ({ Barone: 'Baron', Ritterfürsten: 'Ritterfürst' }[title] || title) : label || title,
          seat: isSeat && label !== '-' ? label : '',
          href: cell.querySelector('a[href]')?.getAttribute('href') || '',
          featured: imageCells.length === 1,
        }];
      });
      const group = groups.at(-1);
      if (group?.title === title && group.members) group.members.push(...members);
      else groups.push({ title, members });
      index++;
      previous = null;
    } else if (text) {
      if (row.cells.length === 1) {
        const following = rows.slice(index + 1).find(item => cleanText(item) || item.querySelector(imageSelector));
        const singlePortrait = following && [...following.cells].filter(cell => cell.querySelector(imageSelector)).length === 1;
        if (!singlePortrait || index === 0) title = text;
      }
      previous = row;
    }
  }
  return groups.filter(group => group.members?.length || group.links?.length);
}
