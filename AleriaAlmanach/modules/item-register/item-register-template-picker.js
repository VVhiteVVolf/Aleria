import { categoryLabel } from './item-register-model.js';
import { formatPrice } from './item-register-money.js';
import { indexRegisterTemplates, registerTemplateFacets, registerTemplateProvider, searchRegisterTemplates } from './item-register-template-search.js';

const bindings = new WeakMap();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
function image(item) {
  const source = String(item.image || '');
  if (!source || !/^(?:https:\/\/|\.?\.?\/|\/)/i.test(source)) return '<span class="ir-template-image ir-template-placeholder" aria-hidden="true">◇</span>';
  return `<img class="ir-template-image" src="${escape(source)}" alt="" loading="lazy" decoding="async">`;
}
const metadata = item => `${categoryLabel(item.category)} · ${registerTemplateProvider(item).label} · ${formatPrice(item.priceRange)}`;
const options = (items, selected) => items.map(item => `<option value="${escape(item.id)}"${selected === item.id ? ' selected' : ''}>${escape(item.label)} (${item.count})</option>`).join('');

export function createRegisterTemplatePickerState() {
  return { search: '', category: '', provider: '', sort: 'relevance', selectedId: '', limit: 12 };
}

function renderResults(binding) {
  const { root, state, index } = binding;
  const result = searchRegisterTemplates(index, state);
  root.querySelector('[data-rt-role="count"]').textContent = `${result.total} Treffer · ${result.items.length} angezeigt`;
  root.querySelector('[data-rt-role="results"]').innerHTML = result.items.length ? result.items.map(item => `<li><button type="button" data-rt-action="select" data-template-id="${escape(item.id)}" aria-pressed="${state.selectedId === item.id}">${image(item)}<span><strong>${escape(item.title)}</strong><small>${escape(metadata(item))}</small><span class="ir-template-excerpt">${escape(plain(item.description).slice(0, 130))}</span></span><span aria-hidden="true">${state.selectedId === item.id ? '✓' : '+'}</span></button></li>`).join('')
    : '<li class="ir-template-empty">Keine passende Ware. Prüfe die Schreibweise oder entferne einen Filter. Alle Suchbegriffe müssen vorkommen.</li>';
  root.querySelector('[data-rt-action="more"]').hidden = result.items.length >= result.total;
  const selected = index.find(entry => entry.item.id === state.selectedId)?.item;
  root.querySelector('[data-rt-role="selection"]').innerHTML = selected ? `<div class="ir-template-selected-head">${image(selected)}<span><strong>Ausgewählt: ${escape(selected.title)}</strong><small>${escape(metadata(selected))}</small></span><button type="button" data-rt-action="clear" aria-label="Warenauswahl aufheben">×</button></div><p>${escape(plain([selected.description, selected.details].filter(Boolean).join(' '))) || 'Keine Beschreibung hinterlegt.'}</p><small>Quelle: ${escape(registerTemplateProvider(selected).label)} · Register-ID: ${escape(selected.id)}${['waffen', 'ruestungen'].includes(selected.category) ? ' · Wird einzeln vergeben.' : ''}</small>`
    : '<p>Wähle eine Ware aus der Liste. Die Vorschau zeigt die genaue Registervorlage.</p>';
  if (root.closest('[aria-busy="true"]')) root.querySelectorAll('button, input, select').forEach(control => control.disabled = true);
  binding.onSelect(selected || null);
}

export function refreshRegisterTemplatePicker(root, items) {
  const binding = bindings.get(root);
  if (!binding) return;
  binding.index = indexRegisterTemplates(items);
  const { categories, providers } = registerTemplateFacets(binding.index);
  const state = binding.state;
  if (!categories.some(item => item.id === state.category)) state.category = '';
  if (!providers.some(item => item.id === state.provider)) state.provider = '';
  if (!items.some(item => item.id === state.selectedId)) state.selectedId = '';
  root.querySelector('[data-rt-field="category"]').innerHTML = '<option value="">Alle Kategorien</option>' + options(categories, state.category);
  root.querySelector('[data-rt-field="provider"]').innerHTML = '<option value="">Alle Anbieter / Sortimente</option>' + options(providers, state.provider);
  renderResults(binding);
}

export function mountRegisterTemplatePicker(root, { items, state = createRegisterTemplatePickerState(), onSelect = () => {} }) {
  if (bindings.has(root)) { refreshRegisterTemplatePicker(root, items); return; }
  const binding = { root, state, onSelect, index: [] };
  bindings.set(root, binding);
  root.classList.add('ir-template-picker');
  root.innerHTML = `<label>Handelsregister durchsuchen<input type="search" maxlength="240" data-rt-field="search" value="${escape(state.search)}" placeholder="z. B. Schwert Draig oder Trank Heilung" autocomplete="off"></label><p class="ir-template-help">Name, Beschreibung, Schlagworte und Quelle · mehrere Begriffe, beliebige Reihenfolge · ä/ae, ü/ue und ß/ss</p><div class="ir-template-filters"><label>Kategorie<select data-rt-field="category"></select></label><label>Anbieter / Sortiment<select data-rt-field="provider"></select></label><label>Sortierung<select data-rt-field="sort">${[['relevance', 'Beste Treffer'], ['name', 'Name'], ['price', 'Preis in Kupfertalern']].map(([value, text]) => `<option value="${value}"${state.sort === value ? ' selected' : ''}>${text}</option>`).join('')}</select></label></div><div class="ir-template-result-head"><span data-rt-role="count" role="status" aria-live="polite"></span><button type="button" data-rt-action="reset">Suche zurücksetzen</button></div><ul class="ir-template-results" data-rt-role="results" aria-label="Waren aus dem Handelsregister"></ul><button type="button" class="ir-template-more" data-rt-action="more">Weitere 12 anzeigen</button><div class="ir-template-selection" data-rt-role="selection" aria-live="polite"></div>`;
  const update = event => {
    const field = event.target.dataset.rtField;
    if (!field || root.closest('[aria-busy="true"]')) return;
    state[field] = event.target.value;
    state.limit = 12;
    renderResults(binding);
  };
  root.addEventListener('input', event => { if (event.target.type === 'search') update(event); });
  root.addEventListener('change', event => { if (event.target.tagName === 'SELECT') update(event); });
  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-rt-action]');
    if (!trigger || root.closest('[aria-busy="true"]')) return;
    const action = trigger.dataset.rtAction;
    if (action === 'select') state.selectedId = trigger.dataset.templateId;
    if (action === 'clear') state.selectedId = '';
    if (action === 'more') state.limit += 12;
    if (action === 'reset') {
      Object.assign(state, { search: '', category: '', provider: '', sort: 'relevance', limit: 12 });
      root.querySelectorAll('[data-rt-field]').forEach(control => control.value = state[control.dataset.rtField]);
    }
    renderResults(binding);
    if (action === 'select') root.querySelector(`[data-template-id="${CSS.escape(state.selectedId)}"]`)?.focus({ preventScroll: true });
    if (action === 'clear') root.querySelector('[data-rt-field="search"]')?.focus({ preventScroll: true });
  });
  refreshRegisterTemplatePicker(root, items);
}
