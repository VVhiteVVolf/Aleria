// Preserve legacy founder/succession rows; adapt only the final office section.
export function legacyCourtOffices(table, data) {
  const rows = [...table.rows];
  const first = rows.findIndex(row => row.querySelector('.haeuser-court-office'));
  if (first < 0) return null;
  const start = rows[first - 1]?.querySelector('.haeuser-court-heading') ? first - 1 : first;
  let end = first + 1;
  while (end < rows.length && !rows[end].querySelector('.haeuser-court-heading')) end += 1;
  const entries = [];
  for (let index = first; index < end; index += 1) {
    const cells = [...rows[index].cells];
    if (!cells.some(cell => cell.classList.contains('haeuser-court-office'))) continue;
    const portraits = [...(rows[index + 1]?.cells || [])];
    const names = [...(rows[index + 2]?.cells || [])];
    if (portraits.length !== cells.length || names.length !== cells.length) return null;
    cells.forEach((cell, column) => {
      const role = cell.textContent.trim();
      if (!role || role === 'Rolle') return;
      let key = portraits[column]?.querySelector('[data-orte-image-key]')?.dataset.orteImageKey;
      const nameCell = names[column];
      const name = data.contentTargets?.[nameCell?.dataset.haeuserContent] || nameCell?.textContent.trim() || '';
      if (!data.images?.[key]?.src && name) {
        // Reuse a portrait explicitly labelled with the same person; no filename inference.
        const matches = Object.entries(data.images || {}).filter(([, image]) => image.src && image.alt === name && image.format === 'portrait');
        if (new Set(matches.map(([, image]) => image.src)).size === 1) key = matches[0][0];
      }
      const href = nameCell?.querySelector('a[href]')?.getAttribute('href') || data.images?.[key]?.href || '';
      entries.push({ role, name, imageKey: key, href });
    });
  }
  // Retain rows belonging to other sections if the old template ever adds them.
  return { entries, rows: rows.slice(start, end) };
}
