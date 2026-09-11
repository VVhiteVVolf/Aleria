import { renderCouncilGroups } from '../territory-directory/council-directory.mjs?v=panels-20260911a';

// Adapt the legacy portrait/title/name rows to the shared council cards.
// Unknown table layouts remain tables, so new source formats cannot lose content.
export function renderAdministrationHierarchy(table, textFor, isPending) {
  if (table.querySelector('table')) return null;
  const rows = [...table.rows];
  const groups = [];
  let pendingRows = [];
  let title = '';
  let groupTitle = '';

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.querySelector('img')) {
      pendingRows.push(row);
      continue;
    }
    const imageCells = [...row.cells].filter(cell => cell.querySelector('img'));
    const nameRow = rows[index + 1];
    if (!nameRow || nameRow.querySelector('img') || imageCells.some(cell => cell.querySelectorAll('img').length !== 1)) return null;
    const nameCells = alignedCells(nameRow, imageCells.length, textFor);
    const roleRow = pendingRows.pop();
    const roleCells = roleRow ? alignedCells(roleRow, imageCells.length, textFor) : [];
    if (nameCells.length !== imageCells.length || roleCells.length !== imageCells.length) return null;

    const headings = pendingRows.filter(isSpanningRow).map(textFor);
    const extraRows = pendingRows.filter(entry => !isSpanningRow(entry));
    if (extraRows.some(entry => alignedCells(entry, imageCells.length, textFor).length !== imageCells.length)) return null;
    if (!title && headings.length) title = headings.shift();
    if (headings.length) groupTitle = headings.join(' · ');
    const currentTitle = groupTitle || title || 'Amtsträger';
    const members = imageCells.map((cell, position) => {
      const name = textFor(nameCells[position]);
      const labels = [...extraRows.map(entry => alignedCells(entry, imageCells.length, textFor)[position]), roleCells[position]].map(textFor);
      const image = cell.querySelector('img').cloneNode(true);
      // Presentation belongs to the shared portrait component from here on.
      image.removeAttribute('class');
      return {
        name: isPending(name) ? 'Noch nicht benannt' : name,
        office: labels.map(label => isPending(label) ? 'Folgt …' : label).join(' · '),
        image,
        href: nameCells[position].querySelector('a[href]')?.getAttribute('href') || cell.querySelector('a[href]')?.getAttribute('href') || '',
        featured: imageCells.length === 1,
        pending: isPending(name),
        unspecifiedOffice: labels.every(label => isPending(label) || /^(Ort|Rolle|Vorgesetz[te]er)$/i.test(label)),
      };
    });
    const previous = groups.at(-1);
    if (previous?.title === currentTitle) previous.members.push(...members);
    else groups.push({ title: currentTitle, members });
    pendingRows = [];
    index += 1;
  }

  if (!groups.length) return null;
  const view = document.createElement('div');
  view.className = 'administration-hierarchy';
  for (const group of groups) {
    const cards = renderCouncilGroups([group]);
    if (group.members.every(member => member.pending && member.unspecifiedOffice) && group.members.length > 1) {
      const details = document.createElement('details');
      details.className = 'administration-dialog-details administration-pending-offices';
      const summary = document.createElement('summary');
      summary.textContent = `${group.title} · ${group.members.length} Einträge noch nicht benannt`;
      // The accordion already labels this group; avoid a repeated title.
      cards.querySelector('.herrschaft-person-group > h3')?.remove();
      details.append(summary, cards);
      view.append(details);
    } else view.append(cards);
  }
  // Retain any notes following the final portrait row.
  for (const row of pendingRows) {
    const note = document.createElement('p');
    note.textContent = textFor(row);
    view.append(note);
  }
  return view;
}

function alignedCells(row, count, textFor) {
  if (row.cells.length === count) return [...row.cells];
  return [...row.cells].filter(cell => textFor(cell) || cell.querySelector('img'));
}

function isSpanningRow(row) {
  return row.cells.length === 1 && row.cells[0].colSpan > 1;
}
