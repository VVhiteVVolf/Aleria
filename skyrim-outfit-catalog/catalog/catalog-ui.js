/* One local catalog owns its filters, rendering and saved shortlist. */
(() => {
  'use strict';
  const root = document.querySelector('[data-role="catalog"]');
  const byRole = name => root.querySelector(`[data-role="${name}"]`);
  const state = { data: null, limit: 36, favorites: new Set(), itemLimits: new Map(), timer: null };
  const bookmarkKey = 'skyrim-outfit-catalog:favorites:v1';
  try { state.favorites = new Set(JSON.parse(localStorage.getItem(bookmarkKey) || '[]')); } catch { /* Optional storage. */ }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function link(url, label, className) {
    const node = element('a', className, label);
    node.href = url;
    node.target = '_blank';
    node.rel = 'noopener noreferrer';
    return node;
  }

  function action(name, label, className) {
    const node = element('button', className, label);
    node.type = 'button';
    node.dataset.action = name;
    return node;
  }

  function filters() {
    const values = {};
    root.querySelectorAll('[data-filter]').forEach(node => {
      values[node.dataset.filter] = node.type === 'checkbox' ? node.checked : node.value;
    });
    values.search = values.search.trim().toLocaleLowerCase('de');
    return values;
  }

  function matchingCollections(selected) {
    return state.data.collections.flatMap(collection => {
      if ((!selected.base && collection.base) || (selected.new && !collection.new) ||
          (selected.favorites && !state.favorites.has(collection.id))) return [];
      const packMatch = [collection.name, collection.mod, collection.plugin].join(' ').toLocaleLowerCase('de').includes(selected.search);
      const items = collection.items.filter(item => {
        if (selected.search && !packMatch && ![item.name, item.editor, ...item.classes, ...item.guilds].join(' ').toLocaleLowerCase('de').includes(selected.search)) return false;
        return (!selected.role || item.classes.includes(selected.role)) &&
          (!selected.guild || item.guilds.includes(selected.guild)) &&
          (!selected.type || item.type === selected.type) &&
          (!selected.gender || item.genders.includes(selected.gender)) && (!selected.torso || item.torso);
      });
      return items.length ? [{ collection, items }] : [];
    });
  }

  function tags(items, field, className) {
    const row = element('div', 'tags');
    const values = [...new Set(items.flatMap(item => item[field]))];
    values.slice(0, 4).forEach(value => row.append(element('span', className, value)));
    if (values.length > 4) row.append(element('span', 'tag', `+${values.length - 4} Stile`));
    return row;
  }

  function renderItem(item, collection) {
    const node = element('div', 'item');
    node.append(element('div', 'item-name', item.name));
    node.append(element('p', 'item-meta', `${item.type} · ${item.slots.join(', ')} · ${item.genders.join(' + ') || 'Modelleinträge nicht auflösbar'}`));
    node.append(element('p', 'item-meta', `${item.classes.join(' / ')} · ${item.guilds.join(' / ')}`));
    node.append(element('p', 'item-reference', `${collection.plugin} | lokal ${item.local_id} | ${item.editor}`));
    if (item.winning_plugin !== collection.plugin) node.append(element('p', 'item-reference', `Letzter Gegenstands-Patch: ${item.winning_plugin}`));
    if (item.name_fallback) node.append(element('p', 'item-reference', 'Anzeigename nicht auflösbar; hier steht die EditorID.'));
    const safeName = item.name.replace(/["\r\n]/g, '').slice(0, 100);
    const command = `help "${safeName}" 4`;
    const copy = action('copy', command, 'command');
    copy.dataset.command = command;
    copy.setAttribute('aria-label', `Konsolensuche für ${item.name} kopieren`);
    copy.title = 'Nur nach dem Gegenstand suchen; die aktuelle FormID steht danach in der Spielkonsole.';
    node.append(copy);
    return node;
  }

  function populateItems(details, collection, items) {
    const limit = state.itemLimits.get(collection.id) || 60;
    const list = details.querySelector('.item-list');
    list.replaceChildren(...items.slice(0, limit).map(item => renderItem(item, collection)));
    if (items.length > limit) {
      const more = action('item-more', `Weitere ${Math.min(100, items.length - limit)} Teile anzeigen`, 'item-more');
      more.dataset.collection = collection.id;
      list.append(more);
    }
  }

  function renderCard({ collection, items }) {
    const card = element('article', 'outfit-card');
    card.dataset.collection = collection.id;
    const top = element('div', 'card-top');
    const heading = element('div', 'card-heading');
    heading.append(element('div', collection.new ? 'pack-label new-label' : 'pack-label', collection.new ? 'NEU · 06. OKTOBER' : collection.base ? 'GRUNDSPIEL / CREATION CLUB' : 'AKTIVES OUTFITPAKET'));
    heading.append(element('h3', '', collection.name));
    const bookmark = action('favorite', state.favorites.has(collection.id) ? '★' : '☆', 'favorite');
    bookmark.dataset.collection = collection.id;
    bookmark.setAttribute('aria-label', `${collection.name} merken`);
    bookmark.setAttribute('aria-pressed', String(state.favorites.has(collection.id)));
    top.append(heading, bookmark);
    const body = element('div', 'card-body');
    body.append(element('p', 'source', collection.mod));
    body.append(tags(items, 'classes', 'tag'), tags(items, 'guilds', 'tag guild'));
    const kinds = [...new Set(items.map(item => item.type))].join(' / ');
    body.append(element('p', 'card-count', `${items.length.toLocaleString('de')} passende Teile${items.length !== collection.items.length ? ` von ${collection.items.length.toLocaleString('de')}` : ''} · ${kinds}`));
    if (collection.url) body.append(link(collection.url, 'Modseite / Vorschaubilder ↗', 'card-link'));
    const details = element('details', 'item-details');
    details.append(element('summary', '', 'Gegenstände & Varianten'), element('div', 'item-list'));
    details.addEventListener('toggle', () => {
      if (details.open && !details.querySelector('.item-list').children.length) populateItems(details, collection, items);
    });
    card.append(top, body, details);
    return card;
  }

  function renderVisuals() {
    const query = root.querySelector('[data-filter="visual"]').value.toLocaleLowerCase('de');
    const packs = state.data.visual_packs.filter(pack => pack.name.toLocaleLowerCase('de').includes(query));
    byRole('visual-count').textContent = `${packs.length} Pakete`;
    byRole('visual-list').replaceChildren(...packs.map(pack => {
      const row = element('div', 'visual-pack');
      row.append(element('div', '', pack.name), element('small', '', pack.kind));
      if (pack.url) row.append(link(pack.url, 'Modseite ↗'));
      return row;
    }));
  }

  function render() {
    if (!state.data) return;
    const matches = matchingCollections(filters());
    const count = matches.reduce((sum, entry) => sum + entry.items.length, 0);
    byRole('result-count').textContent = `${matches.length.toLocaleString('de')} Pakete · ${count.toLocaleString('de')} Gegenstände / Varianten`;
    byRole('cards').replaceChildren(...matches.slice(0, state.limit).map(renderCard));
    byRole('empty').hidden = matches.length > 0;
    root.querySelector('[data-action="more"]').hidden = matches.length <= state.limit;
  }

  function initialize(data) {
    state.data = data;
    byRole('profile').textContent = `${data.meta.profile} · Stand ${new Date(data.meta.generated).toLocaleString('de-DE')}`;
    [['collections', 'Outfitpakete'], ['items', 'Teile & Varianten'], ['mods', 'Aktive Mods']].forEach(([field, label]) => {
      const node = element('div', 'metric');
      node.append(element('strong', '', data.meta[field].toLocaleString('de')), element('span', '', label));
      byRole('metrics').append(node);
    });
    [['role', 'classes'], ['guild', 'guilds']].forEach(([filter, field]) => {
      const values = [...new Set(data.collections.flatMap(collection => collection.items.flatMap(item => item[field])))].sort((a, b) => a.localeCompare(b, 'de'));
      const select = root.querySelector(`[data-filter="${filter}"]`);
      values.forEach(value => select.append(element('option', '', value)));
    });
    byRole('scan-note').textContent = `${data.meta.plugins.toLocaleString('de')} aktive Plugins ausgewertet. ${data.meta.unresolved_names} nicht auflösbare Namensfelder im gesamten Record-Scan; ${data.meta.unresolved_reference_count} ungewöhnliche Referenzen protokolliert in data/scan-warnings.json. Bei nicht auflösbaren Modellen bleibt die Geschlechtsangabe offen.`;
    renderVisuals();
    render();
  }

  function toast(message) {
    clearTimeout(state.timer);
    byRole('toast').textContent = message;
    byRole('toast').hidden = false;
    state.timer = setTimeout(() => { byRole('toast').hidden = true; }, 3200);
  }

  root.addEventListener('input', event => {
    const name = event.target.dataset.filter;
    if (!name) return;
    if (name === 'visual') { renderVisuals(); return; }
    state.limit = 36;
    render();
  });

  root.addEventListener('click', async event => {
    const target = event.target.closest('[data-action]');
    if (!target || !state.data) return;
    switch (target.dataset.action) {
      case 'reset':
        root.querySelectorAll('[data-filter]').forEach(node => {
          if (node.type === 'checkbox') node.checked = false;
          else node.value = '';
        });
        state.limit = 36;
        renderVisuals();
        render();
        break;
      case 'more': state.limit += 36; render(); break;
      case 'favorite': {
        const id = target.dataset.collection;
        if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
        try { localStorage.setItem(bookmarkKey, JSON.stringify([...state.favorites])); } catch { toast('Merkliste bleibt nur bis zum Schließen geöffnet.'); }
        target.textContent = state.favorites.has(id) ? '★' : '☆';
        target.setAttribute('aria-pressed', String(state.favorites.has(id)));
        if (filters().favorites) render();
        break;
      }
      case 'item-more': {
        const entry = matchingCollections(filters()).find(value => value.collection.id === target.dataset.collection);
        state.itemLimits.set(entry.collection.id, (state.itemLimits.get(entry.collection.id) || 60) + 100);
        populateItems(target.closest('details'), entry.collection, entry.items);
        break;
      }
      case 'copy':
        try { await navigator.clipboard.writeText(target.dataset.command); toast('Konsolensuche kopiert.'); }
        catch { toast(`Zum Abschreiben: ${target.dataset.command}`); }
        break;
    }
  });
  document.addEventListener('outfit-catalog:data', event => initialize(event.detail), { once: true });
})();
