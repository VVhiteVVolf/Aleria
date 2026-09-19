import { markTerritoryHeadings } from './codex-territory-headings.mjs?v=20260918a';

/** Page chrome only: no copying, rewriting or reparenting of the editable document. */
export function mountCodexNavigation(page) {
  if (!page || !document.body.classList.contains('world-codex')) return;
  const header = document.createElement('header');
  header.className = 'codex-masthead';
  const brand = document.createElement('a');
  brand.className = 'codex-brand';
  brand.href = '/Kontinente/index.html';
  brand.append('ALERIA');
  const subtitle = document.createElement('span');
  subtitle.textContent = 'ATLAS & CHRONIK';
  brand.append(subtitle);
  const chapters = document.createElement('details');
  chapters.className = 'codex-chapters';
  const summary = document.createElement('summary');
  summary.textContent = 'In dieser Chronik';
  const navigation = document.createElement('nav');
  navigation.setAttribute('aria-label', 'Kapitel dieser Chronik');
  const list = document.createElement('ol');
  list.className = 'codex-chapter-list';
  navigation.append(list);
  chapters.append(summary, navigation);
  header.append(brand, chapters);
  page.before(header);

  let frame = 0;
  let signature = '';
  function refresh() {
    frame = 0;
    markTerritoryHeadings(page);
    const headings = [...page.querySelectorAll('h2[id], .kingdom-section-heading[id], .codex-section-heading[id]')]
      .filter(heading => !heading.closest('[hidden], .is-family-card-source, .is-county-card-source'));
    const nextSignature = headings.map(heading => `${heading.id}:${heading.textContent}`).join('|');
    if (nextSignature === signature) return;
    signature = nextSignature;
    const items = headings.map(heading => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim().replace(/^\d+\s*[.)]+\s*/, '');
      item.append(link);
      return item;
    });
    list.replaceChildren(...items);
    chapters.hidden = items.length === 0;
  }
  function scheduleRefresh() {
    if (!frame) frame = requestAnimationFrame(refresh);
  }
  navigation.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    chapters.open = false;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chapters.open) {
      chapters.open = false;
      summary.focus();
    }
  });
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(page, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['id', 'hidden'] });
  refresh();
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    header.remove();
  };
}

mountCodexNavigation(document.querySelector('.kingdom-page, .place-page, .haeuser-page'));
