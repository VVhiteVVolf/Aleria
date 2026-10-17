function buildGuildServiceCard(service) {
  const icon = sanitizeImageSrc(service.icon);
  return `<article class="guild-service-card">
    <div class="guild-service-heading">${icon ? `<img src="${icon}" alt="" loading="lazy" decoding="async">` : ''}<h3>${escapeHtml(service.title)}</h3></div>
    <div class="guild-services-copy">${sanitizeContentHtml(service.description)}</div>
    <dl>${[['Auftraggeber', service.clients], ['Umfang', service.scope], ['Vereinbarung', service.terms]].filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
  </article>`;
}

function buildGuildServicesPage(page, entry, pageIndex, total) {
  const data = sanitizeGuildServicesData(page.guildServices);
  const thread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const heading = `<span class="guild-services-kicker">${escapeHtml(entry.title)} · Dienste</span><h2>${escapeHtml(data.title || 'Aufgabenbereich & Service')}</h2><div class="guild-services-copy">${sanitizeContentHtml(data.introduction)}</div>`;
  return `${buildNav(page, pageIndex, total)}<article class="guild-services-page">
    <header class="guild-services-header${page.image ? ' guild-services-illustrated-header' : ''}">${page.image ? `<img class="guild-services-scene" src="${sanitizeImageSrc(page.image)}" alt="${escapeHtml(page.pageTitle || entry.title)}" loading="eager" decoding="async"><div>${heading}</div>` : heading}</header>
    <div class="guild-services-grid">${data.services.map(buildGuildServiceCard).join('') || '<p>Noch keine Dienste verzeichnet.</p>'}</div>
    <div class="guild-services-notes">${[['Vom Anliegen zum Auftrag', data.process], ['Bedingungen & Grenzen', data.conditions]].filter(([, value]) => value).map(([title, value]) => `<section><h3>${title}</h3><div class="guild-services-copy">${sanitizeContentHtml(value)}</div></section>`).join('')}</div>
    ${data.footer ? `<footer>${escapeHtml(data.footer)}</footer>` : ''}
    ${thread ? buildEmbeddedCommentsSection(thread) : ''}
  </article>`;
}
