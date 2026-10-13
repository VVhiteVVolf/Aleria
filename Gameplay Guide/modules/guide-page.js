const root = document.querySelector('main');
document.querySelector('.site-header')?.addEventListener('click', event => {
  if (event.target.closest('[data-action="print-guide"]')) window.print();
});
root?.addEventListener('click', event => {
  const button = event.target.closest('[data-action="filter-style"]');
  if (!button || !root.contains(button)) return;
  const filter = button.dataset.filter;
  for (const option of root.querySelectorAll('[data-action="filter-style"]')) option.setAttribute('aria-pressed', String(option === button));
  let visible = 0;
  for (const card of root.querySelectorAll('.combo[data-mode]')) { card.hidden = filter !== 'alle' && card.dataset.mode !== filter; if (!card.hidden) visible++; }
  root.querySelector('[data-role="filter-status"]').textContent = `${visible} ${visible === 1 ? 'Kampfplan' : 'Kampfpläne'} · ${button.textContent}`;
});
