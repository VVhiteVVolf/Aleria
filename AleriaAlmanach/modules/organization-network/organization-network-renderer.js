function buildOrganizationNetworkSite(site) {
  const image = sanitizeImageSrc(site.image);
  const place = sanitizeHref(site.href);
  const publication = sanitizeHref(site.publicationHref);
  const kind = ORGANIZATION_NETWORK_KINDS.find(([key]) => key === site.kind)?.[1] || 'Niederlassung';
  return `<article class="organization-network-site" data-network-kind="${escapeHtml(site.kind)}">
    <div class="organization-network-site-heading">
      ${image ? `<img src="${image}" alt="" loading="lazy" decoding="async">` : '<span class="organization-network-site-mark" aria-hidden="true">⌂</span>'}
      <div><span class="organization-network-kicker">${escapeHtml(kind)}</span><h3>${escapeHtml(site.name)}</h3>${site.region ? `<p>${escapeHtml(site.region)}</p>` : ''}</div>
    </div>
    <div class="organization-network-copy">${sanitizeContentHtml(site.description)}</div>
    ${place || publication ? `<div class="organization-network-links">${place ? `<a href="${place}" target="_blank" rel="noopener noreferrer">Ort besuchen ↗</a>` : ''}${publication ? `<a href="${publication}" target="_blank" rel="noopener noreferrer">Publikation öffnen ↗</a>` : ''}</div>` : ''}
  </article>`;
}

function buildOrganizationNetworkPage(page, entry, pageIndex, total) {
  const data = sanitizeOrganizationNetworkData(page.organizationNetwork);
  const kinds = ORGANIZATION_NETWORK_KINDS.filter(([key]) => data.sites.some(site => site.kind === key));
  const thread = getInlineCommentThreadForPage(page, entry, pageIndex);
  return `${buildNav(page, pageIndex, total)}
    <article class="organization-network-page">
      <header class="organization-network-header"><span class="organization-network-kicker">${escapeHtml(entry.title)} · Netzwerk</span><h2>${escapeHtml(data.title || 'Häuser & Wege')}</h2></header>
      <div class="organization-network-layout">
        <aside class="organization-network-introduction">
          <div class="organization-network-copy">${sanitizeContentHtml(data.introduction)}</div>
          ${data.reach ? `<section><h3>Wirkungsgebiet</h3><p>${escapeHtml(data.reach)}</p></section>` : ''}
          ${data.model ? `<section><h3>Zusammenarbeit</h3><div class="organization-network-copy">${sanitizeContentHtml(data.model)}</div></section>` : ''}
          ${data.note ? `<section class="organization-network-note"><h3>Einordnung</h3><div class="organization-network-copy">${sanitizeContentHtml(data.note)}</div></section>` : ''}
        </aside>
        <section class="organization-network-locations" aria-label="Niederlassungen">
          ${kinds.length > 1 ? `<div class="organization-network-filters" role="group" aria-label="Standorte nach Aufgabe filtern"><button type="button" data-network-filter="all" aria-pressed="true">Alle</button>${kinds.map(([key, label]) => `<button type="button" data-network-filter="${key}" aria-pressed="false">${escapeHtml(label)}</button>`).join('')}</div>` : ''}
          <p class="organization-network-count" aria-live="polite">${data.sites.length} ${data.sites.length === 1 ? 'Standort' : 'Standorte'}</p>
          <div class="organization-network-grid">${data.sites.map(buildOrganizationNetworkSite).join('') || '<p>Hier sind noch keine Standorte verzeichnet.</p>'}</div>
        </section>
      </div>
      ${data.footer ? `<footer class="organization-network-footer">${escapeHtml(data.footer)}</footer>` : ''}
      ${thread ? buildEmbeddedCommentsSection(thread) : ''}
    </article>`;
}

document.addEventListener('click', event => {
  const button = event.target?.closest?.('[data-network-filter]');
  const page = button?.closest('.organization-network-page');
  if (!page) return;
  event.preventDefault();
  const filter = button.dataset.networkFilter;
  let count = 0;
  page.querySelectorAll('[data-network-kind]').forEach(site => {
    site.hidden = filter !== 'all' && site.dataset.networkKind !== filter;
    if (!site.hidden) count++;
  });
  page.querySelectorAll('[data-network-filter]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
  page.querySelector('.organization-network-count').textContent = `${count} ${count === 1 ? 'Standort' : 'Standorte'}`;
});
