import { mountGuideArsenal } from './guide-arsenal-controller.mjs';
import { mountGuideDirectory } from './guide-directory-controller.mjs';

const root = document.querySelector('main');
const data = root?.querySelector('[data-role="arsenal-data"]');
const arsenal = data ? mountGuideArsenal(root.querySelector('[data-role="arsenal-library"]'), JSON.parse(data.textContent)) : null;
const directory = root?.querySelector('[data-role="guide-directory"]');
if (directory) mountGuideDirectory(directory);
document.querySelector('.site-header')?.addEventListener('click', event => {
  if (event.target.closest('[data-action="print-guide"]')) window.print();
});
root?.addEventListener('click', event => {
  const link = event.target.closest('[data-preview-link]');
  if (link) {
    event.preventDefault();
    arsenal?.selectAction(link.dataset.previewLink);
  }
  const button = event.target.closest('[data-action="filter-style"]');
  if (!button || !root.contains(button)) return;
  const filter = button.dataset.filter;
  for (const option of root.querySelectorAll('[data-action="filter-style"]')) option.setAttribute('aria-pressed', String(option === button));
  let visible = 0;
  for (const card of root.querySelectorAll('.combo[data-mode]')) { card.hidden = filter !== 'alle' && card.dataset.mode !== filter; if (!card.hidden) visible++; }
  root.querySelector('[data-role="filter-status"]').textContent = `${visible} ${visible === 1 ? 'Kampfplan' : 'Kampfpläne'} · ${button.textContent}`;
});
