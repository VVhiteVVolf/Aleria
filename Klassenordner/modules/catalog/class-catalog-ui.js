import { normalizeClassSearch } from './class-catalog-model.js?v=20260905-1';

export function readClassCatalog(root) {
  const groups = [...root.querySelectorAll('[data-class-group]')].map(element => ({
    id: element.id,
    name: element.querySelector('h2').textContent.trim(),
    icon: element.querySelector('.land-banner')?.getAttribute('src') || '../IconOrdner/ReiterIcons/Klassen.png',
    element
  }));
  const entries = groups.flatMap(group => [...group.element.querySelectorAll('[data-entry-id]')].map(element => {
    const name = element.querySelector('.class-name').textContent.trim();
    const description = element.dataset.tooltip || '';
    return {
      id: element.dataset.entryId,
      classId: element.dataset.classId,
      groupId: group.id,
      groupName: group.name,
      name,
      description,
      icon: element.querySelector('img').getAttribute('src'),
      militia: element.dataset.militia === 'true',
      searchText: normalizeClassSearch([name, description, element.dataset.name,
        element.querySelector('.class-flavor')?.textContent, group.name].join(' ')),
      element
    };
  }));
  return { groups, entries };
}

export function createClassCatalogView(root, { groups, entries }) {
  const nav = root.querySelector('[data-role="group-nav"]');
  const select = root.querySelector('[data-role="group-filter"]');
  const groupLinks = new Map();
  const counters = new Map();
  const totals = new Map(groups.map(group => [group.id, entries.filter(entry => entry.groupId === group.id).length]));

  for (const group of groups) {
    select.add(new Option(group.name, group.id));
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${group.id}`;
    link.dataset.action = 'navigate-group';
    link.dataset.groupId = group.id;
    const image = document.createElement('img');
    image.src = group.icon;
    image.alt = '';
    image.loading = 'lazy';
    const name = document.createElement('span');
    name.textContent = group.name;
    const count = document.createElement('span');
    count.className = 'group-count';
    count.textContent = totals.get(group.id);
    link.append(image, name, count);
    item.append(link);
    nav.append(item);
    groupLinks.set(group.id, link);

    const badge = document.createElement('span');
    badge.className = 'section-count';
    badge.textContent = `${totals.get(group.id)} Klassen`;
    group.element.querySelector('.land-header').append(badge);
    counters.set(group.id, { nav: count, badge });
  }

  function setActiveGroup(id) {
    groupLinks.forEach((link, groupId) => {
      if (groupId === id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(changes => {
      const visible = changes.filter(change => change.isIntersecting
        && !change.target.closest('[data-class-group]').hidden);
      if (visible.length) setActiveGroup(visible[0].target.closest('[data-class-group]').id);
    }, { rootMargin: '0px 0px -65% 0px' });
    groups.forEach(group => observer.observe(group.element.querySelector('.land-header')));
  }

  return {
    render(visibleEntries, { query, groupId }) {
      const visibleIds = new Set(visibleEntries.map(entry => entry.id));
      entries.forEach(entry => { entry.element.hidden = !visibleIds.has(entry.id); });
      for (const group of groups) {
        const count = visibleEntries.filter(entry => entry.groupId === group.id).length;
        group.element.hidden = count === 0;
        counters.get(group.id).nav.textContent = count;
        counters.get(group.id).badge.textContent = `${count} ${count === 1 ? 'Klasse' : 'Klassen'}`;
      }
      const uniqueCount = new Set(visibleEntries.map(entry => entry.classId)).size;
      root.querySelector('[data-role="result-count"]').textContent =
        `${uniqueCount} ${uniqueCount === 1 ? 'Klasse' : 'Klassen'} · ${visibleEntries.length} Einträge nach Herkunft`;
      root.querySelector('[data-role="no-results"]').hidden = visibleEntries.length > 0;
      root.querySelector('[data-action="random-class"]').disabled = visibleEntries.length === 0;
      root.querySelector('[data-role="random-feedback"]').hidden = true;
      root.querySelector('[data-role="planned-groups"]').hidden = Boolean(query.trim()) || groupId !== 'all';
    },
    setActiveGroup
  };
}
