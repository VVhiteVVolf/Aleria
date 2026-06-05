(function () {
  const page = document.querySelector('[data-page-type="kingdom"]');
  if (!page) return;

  page.querySelectorAll('table').forEach((table) => {
    if (table.parentElement && table.parentElement.classList.contains('kingdom-table-scroll')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'kingdom-table-scroll';
    if (table.classList.contains('kingdom-toc')) {
      wrapper.classList.add('kingdom-toc-scroll');
    }
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  const sectionMap = [
    { id: 'einfuehrung', pattern: /^1\.\)\s*Einführung/i },
    { id: 'geschichte', pattern: /^2\.\)\s*Geschichte/i },
    { id: 'kultur', pattern: /^3\.\)\s*Kultur/i },
    { id: 'religion', pattern: /^4\.\)\s*Religion/i },
    { id: 'politik', pattern: /^5\.\)\s*Politik/i },
    { id: 'verwaltung', pattern: /^6\.\)\s*Verwaltung/i },
    { id: 'gesetze', pattern: /^7\.\)\s*Gesetze/i },
    { id: 'geographie', pattern: /^8\.\)\s*Geographie/i },
    { id: 'institutionen', pattern: /^9\.\)\s*Institutionen/i },
    { id: 'flora-fauna', pattern: /^10\.\)\s*Flora/i },
    { id: 'ahnengalerie', pattern: /^11\.\)\s*Ahneng/i },
    { id: 'trivia', pattern: /^12\.\)\s*Trivia/i },
  ];

  const headingCandidates = page.querySelectorAll('p');
  sectionMap.forEach(({ id, pattern }) => {
    if (document.getElementById(id)) return;
    const heading = Array.from(headingCandidates).find((element) => {
      const text = element.textContent.replace(/\s+/g, ' ').trim();
      return pattern.test(text);
    });
    if (!heading) return;
    heading.id = id;
    heading.classList.add('kingdom-section-heading');
  });

  if (window.location.hash) {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      window.setTimeout(() => {
        target.scrollIntoView({ block: 'start' });
      }, 50);
    }
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'kingdom-back-top';
  button.setAttribute('aria-label', 'Zum Seitenanfang');
  button.textContent = '↑';
  document.body.appendChild(button);

  const toggleButton = () => {
    button.classList.toggle('is-visible', window.scrollY > 500);
  };

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleButton, { passive: true });
  toggleButton();
})();
