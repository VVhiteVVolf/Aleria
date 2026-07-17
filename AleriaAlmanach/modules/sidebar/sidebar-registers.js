const ALMANACH_LEFT_REGISTER_ITEMS = [
  { key: 'bestiarium', label: 'Bestiarium', icon: 'Bestiarium.png' },
  { key: 'dunkle-gilden', label: 'Dunkle Gilden', icon: 'Dunkle Gilden.png' },
  { key: 'ereignisse', label: 'Ereignisse', icon: 'Ereignisse.png' },
  { key: 'gilden', label: 'Gilden', icon: 'Gilden.png' },
  { key: 'kalender', label: 'Kalender', icon: 'Kalender.png' },
  { key: 'klassen', label: 'Klassen', icon: 'Klassen.png' },
  { key: 'kontinente', label: 'Kontinente', note: 'Weltkarte und Reiche', icon: 'Kontinente.png', href: '../Kontinente/index.html' },
  { key: 'kulte', label: 'Kulte', icon: 'Kulte.png' },
  { key: 'markt', label: 'Markt', note: 'Items und Güter', icon: 'Markt.png', action: 'open-item-database' },
  { key: 'orden', label: 'Orden', icon: 'Orden.png' },
  { key: 'organisationen', label: 'Organisationen', icon: 'Organisationen.png' },
  { key: 'platzhalter', label: 'Platzhalter', icon: 'Platzhalter.png' },
  { key: 'religion', label: 'Religion', icon: 'Religion.png' },
  { key: 'stammbaeume', label: 'Stammbäume', note: 'Familienregister der Häuser', icon: 'Stammbäume.png', href: '../Stammbäume/register.html' },
  { key: 'sternzeichen', label: 'Sternzeichen', icon: 'Sternzeichen.png' },
  { key: 'zauber', label: 'Zauber', icon: 'Zauber.png' },
  { key: 'zeitstrahl', label: 'Zeitstrahl', icon: 'Zeitstrahl.png' }
];

function buildAlmanachLeftRegisterContent(item, iconSrc) {
  return `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" decoding="async">
    <span class="almanach-left-register-copy">
      <strong>${escapeHtml(item.label)}</strong>
      <small>${escapeHtml(item.note || 'Noch nicht verknüpft')}</small>
    </span>`;
}

function buildAlmanachLeftRegisterItem(item) {
  const iconSrc = `../IconOrdner/ReiterIcons/${item.icon}`;
  const content = buildAlmanachLeftRegisterContent(item, iconSrc);

  if (item.href) {
    return `<a class="almanach-left-register active" href="${escapeHtml(item.href)}" title="${escapeHtml(item.label)} öffnen" data-register-key="${escapeHtml(item.key)}">
    ${content}
  </a>`;
  }

  const actionAttrs = item.action === 'open-item-database'
    ? 'data-item-db-action="open" title="Items und Güter öffnen"'
    : 'aria-disabled="true" tabindex="-1" title="Noch nicht verknüpft"';
  return `<button class="almanach-left-register${item.action ? ' active' : ''}" type="button" ${actionAttrs} data-register-key="${escapeHtml(item.key)}">
    ${content}
  </button>`;
}

function renderAlmanachLeftSidebar() {
  const list = document.querySelector('[data-almanach-left-registers]');
  if (!list) return;
  list.innerHTML = ALMANACH_LEFT_REGISTER_ITEMS.map(buildAlmanachLeftRegisterItem).join('');
}

renderAlmanachLeftSidebar();
