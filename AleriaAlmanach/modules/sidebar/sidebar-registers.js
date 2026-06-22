const ALMANACH_LEFT_REGISTER_ITEMS = [
  { key: 'bestiarium', label: 'Bestiarium', icon: 'Bestiarium.png' },
  { key: 'dunkle-gilden', label: 'Dunkle Gilden', icon: 'Dunkle Gilden.png' },
  { key: 'ereignisse', label: 'Ereignisse', icon: 'Ereignisse.png' },
  { key: 'gilden', label: 'Gilden', icon: 'Gilden.png' },
  { key: 'kalender', label: 'Kalender', icon: 'Kalender.png' },
  { key: 'klassen', label: 'Klassen', icon: 'Klassen.png' },
  { key: 'kulte', label: 'Kulte', icon: 'Kulte.png' },
  { key: 'markt', label: 'Markt', note: 'Items und Güter', icon: 'Markt.png', action: 'open-item-database' },
  { key: 'orden', label: 'Orden', icon: 'Orden.png' },
  { key: 'organisationen', label: 'Organisationen', icon: 'Organisationen.png' },
  { key: 'platzhalter', label: 'Platzhalter', icon: 'Platzhalter.png' },
  { key: 'religion', label: 'Religion', icon: 'Religion.png' },
  { key: 'sternzeichen', label: 'Sternzeichen', icon: 'Sternzeichen.png' },
  { key: 'zauber', label: 'Zauber', icon: 'Zauber.png' },
  { key: 'zeitstrahl', label: 'Zeitstrahl', icon: 'Zeitstrahl.png' }
];

function buildAlmanachLeftRegisterItem(item) {
  const iconSrc = `../IconOrdner/ReiterIcons/${item.icon}`;
  const actionAttrs = item.action === 'open-item-database'
    ? 'data-item-db-action="open" title="Items und Güter öffnen"'
    : 'aria-disabled="true" tabindex="-1" title="Noch nicht verknüpft"';
  return `<button class="almanach-left-register${item.action ? ' active' : ''}" type="button" ${actionAttrs} data-register-key="${escapeHtml(item.key)}">
    <img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" decoding="async">
    <span class="almanach-left-register-copy">
      <strong>${escapeHtml(item.label)}</strong>
      <small>${escapeHtml(item.note || 'Noch nicht verknüpft')}</small>
    </span>
  </button>`;
}

function renderAlmanachLeftSidebar() {
  const list = document.querySelector('[data-almanach-left-registers]');
  if (!list) return;
  list.innerHTML = ALMANACH_LEFT_REGISTER_ITEMS.map(buildAlmanachLeftRegisterItem).join('');
}

renderAlmanachLeftSidebar();
