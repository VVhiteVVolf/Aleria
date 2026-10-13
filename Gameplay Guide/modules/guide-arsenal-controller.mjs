import { renderActionPreview } from './guide-arsenal-view.mjs';

const searchKey = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de');
export function mountGuideArsenal(root, arsenal) {
  const entries = new Map(arsenal.entries.map(entry => [entry.id, entry]));
  const search = new Map(arsenal.entries.map(entry => [entry.id, searchKey([entry.name,entry.category,entry.form,entry.description,entry.effect,entry.advice].join(' '))]));
  const preview = root.querySelector('[data-role="attack-preview"]');
  let selectedId = arsenal.defaultActionId;
  const select = (id, variantId = '', navigate = false) => {
    const entry = entries.get(id); if (!entry) return;
    selectedId = id;
    preview.innerHTML = renderActionPreview(entry, arsenal, variantId);
    root.querySelectorAll('[data-attack-id]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.attackId === id)));
    root.querySelector('[data-role="preview-status"]').textContent = `Vorschau: ${entry.name}`;
    if (navigate) {
      const url = new URL(location.href); url.searchParams.set('technik', id);
      if (variantId) url.searchParams.set('ausruestung', variantId); else url.searchParams.delete('ausruestung');
      history.replaceState(null, '', url);
    }
  };
  const filter = () => {
    const query = searchKey(root.querySelector('[data-role="arsenal-search"]').value);
    const category = root.querySelector('[data-role="arsenal-category"]').value;
    const use = root.querySelector('[data-role="arsenal-use"]').value;
    let count = 0;
    for (const row of root.querySelectorAll('[data-arsenal-row]')) {
      const entry = entries.get(row.dataset.arsenalRow);
      const allowedUse = !use || use === 'passive' && entry.passive || entry.variants.some(v =>
        use === 'mounted' ? v.mounted : use === 'ranged' ? ['bow','crossbow','sling'].includes(v.weaponType) : use === 'melee' && !['bow','crossbow','sling'].includes(v.weaponType));
      row.hidden = !(search.get(entry.id).includes(query) && (!category || entry.category === category) && allowedUse);
      if (!row.hidden) count++;
    }
    for (const group of root.querySelectorAll('.arsenal-group')) group.hidden = !group.querySelector('li:not([hidden])');
    root.querySelector('[data-role="arsenal-count"]').textContent = `${count} von ${entries.size} Einträgen`;
    root.querySelector('[data-role="arsenal-empty"]').hidden = count > 0;
  };
  root.addEventListener('input', event => { if (event.target.matches('[data-role="arsenal-search"]')) filter(); });
  root.addEventListener('change', event => {
    if (event.target.matches('[data-action="select-variant"]')) select(selectedId, event.target.value, true);
    else filter();
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action="select-attack"]');
    if (!button || !root.contains(button)) return;
    select(button.dataset.attackId, '', true);
    if (matchMedia('(max-width: 900px)').matches) { preview.focus({ preventScroll: true }); preview.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }
  });
  const url = new URL(location.href);
  select(url.searchParams.get('technik') || selectedId, url.searchParams.get('ausruestung'));
  return {
    selectAction(id) {
      if (!entries.has(id)) return;
      root.querySelector('[data-role="arsenal-search"]').value = '';
      root.querySelector('[data-role="arsenal-category"]').value = '';
      root.querySelector('[data-role="arsenal-use"]').value = '';
      filter(); select(id, '', true);
      preview.focus({ preventScroll: true });
      preview.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
  };
}
