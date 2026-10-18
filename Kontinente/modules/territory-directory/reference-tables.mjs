/** Presentation cleanup for reference tables that are not territory source tables.
 * The territory adapter still owns the original house/geography/council exports.
 */
export function refineReferenceTables(page) {
  const selector = '.kingdom-structure-table, .kingdom-region-table, .kingdom-guild-table, .kingdom-ancestor-table';
  for (const table of page.querySelectorAll(selector)) {
    // Some exports reuse the region class for the adapter's source table.
    // Its original colors and image sizes are parsing metadata, not decoration.
    if (table.matches('.kingdom-county-geography-table, .kingdom-county-family-table, [data-administration-grid]')) continue;
    table.classList.add('kingdom-reference-table');
    for (const row of table.rows) {
      row.classList.toggle('is-reference-spacer', !row.textContent.trim() && !row.querySelector('img, a, button, input'));
      if (row.cells.length !== 1) continue;
      row.cells[0].classList.toggle('codex-table-section', !row.cells[0].querySelector('img'));
    }
    for (const node of [table, ...table.querySelectorAll('[style]')]) {
      for (const property of ['background', 'background-color', 'color', 'border', 'border-color', 'font', 'font-family', 'font-size', 'font-weight', 'width', 'height', 'padding']) {
        node.style.removeProperty(property);
      }
    }
  }
}
