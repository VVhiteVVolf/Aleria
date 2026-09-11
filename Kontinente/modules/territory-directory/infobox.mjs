// Classify legacy cells before removing their presentational inline formatting.
// Text, links, image order and the table's location remain the editable source.
export function enhanceInfoboxes(root) {
  root.querySelectorAll('.kingdom-infobox').forEach(table => {
    if (!table.querySelector('colgroup')) {
      const columns = document.createElement('colgroup');
      columns.append(document.createElement('col'), document.createElement('col'));
      table.prepend(columns);
    }
    for (const [index, row] of [...table.rows].entries()) {
      for (const [column, cell] of [...row.cells].entries()) {
        const role = row.cells.length > 1
          ? (column === 0 ? 'label' : 'value')
          : index === 0 ? 'title' : cell.querySelector('img, .orte-image-slot') ? 'map' : 'section';
        cell.classList.add(`kingdom-infobox-${role}`);
      }
    }
    for (const node of [table, ...table.querySelectorAll('[style]')]) {
      for (const property of ['background', 'background-color', 'color', 'border', 'border-color', 'font', 'font-family', 'font-size', 'font-weight', 'padding', 'text-align']) {
        node.style.removeProperty(property);
      }
    }
    table.style.removeProperty('width');
    table.style.removeProperty('table-layout');
    table.classList.add('is-territory-infobox');
  });
}
