const root = document.querySelector('[data-spell-list]');

function initializeSpellList(root) {
  const form = root.querySelector('.spell-filters');
  const cards = [...root.querySelectorAll('[data-spell]')];
  const sections = [...root.querySelectorAll('[data-spell-section]')];
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de').replaceAll('ß', 'ss');
  function filter() {
    const values = new FormData(form);
    const terms = normalize(values.get('search')).trim().split(/\s+/).filter(Boolean);
    for (const card of cards) {
      const matches = terms.every(term => normalize(card.dataset.search).includes(term));
      card.hidden = !matches || (values.get('grade') !== 'all' && card.dataset.grade !== values.get('grade'))
        || (values.get('role') !== 'all' && card.dataset.role !== values.get('role'))
        || (values.has('delivery') && values.get('delivery') !== 'all' && card.dataset.delivery !== values.get('delivery'))
        || (values.has('concentration') && values.get('concentration') !== 'all' && card.dataset.concentration !== values.get('concentration'));
    }
    for (const section of sections) section.hidden = !section.querySelector('[data-spell]:not([hidden])');
    const count = cards.filter(card => !card.hidden).length;
    root.querySelector('[data-role="result-count"]').textContent = `${count} Zauber im Verzeichnis`;
    root.querySelector('[data-role="empty"]').hidden = count !== 0;
  }
  function openLinkedSpell() {
    const card = cards.find(entry => `#${entry.id}` === location.hash);
    if (!card) return;
    form.reset(); filter(); card.open = true;
    requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
  }
  form.addEventListener('input', filter);
  form.addEventListener('change', filter);
  form.addEventListener('submit', event => event.preventDefault());
  root.addEventListener('click', async event => {
    const sectionLink = event.target.closest('.spell-register a[href^="#"]');
    if (sectionLink && root.querySelector(sectionLink.getAttribute('href'))?.hidden) { form.reset(); filter(); }
    if (sectionLink?.getAttribute('href') === '#grenzkunst') root.querySelector('#grenzkunst').open = true;
    const button = event.target.closest('[data-action]');
    if (!button) return;
    if (button.dataset.action === 'reset-filters') { form.reset(); filter(); }
    if (button.dataset.action === 'collapse-spells') {
      cards.forEach(card => { card.open = false; });
      root.querySelectorAll('.spell-pending').forEach(section => { section.open = false; });
    }
    if (button.dataset.action === 'copy-spell-link') {
      const url = new URL(location.href); url.hash = button.dataset.spellId;
      try { await navigator.clipboard.writeText(url.href); root.querySelector('[data-role="copy-status"]').textContent = 'Zauberlink kopiert.'; }
      catch { location.hash = button.dataset.spellId; root.querySelector('[data-role="copy-status"]').textContent = 'Der Zauberlink steht jetzt in der Adresszeile.'; }
    }
  });
  window.addEventListener('hashchange', openLinkedSpell);
  window.addEventListener('beforeprint', () => {
    root.querySelectorAll('[data-spell], .spell-upcast').forEach(detail => {
      detail.dataset.wasOpen = String(detail.open);
      if (!detail.closest('[data-spell]').hidden) detail.open = true;
    });
  });
  window.addEventListener('afterprint', () => root.querySelectorAll('[data-spell], .spell-upcast').forEach(detail => { detail.open = detail.dataset.wasOpen === 'true'; }));
  openLinkedSpell();
}

if (root) initializeSpellList(root);
