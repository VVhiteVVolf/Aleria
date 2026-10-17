function buildTheatreProgramCard(item) {
  if (!item.title) return `<article class="theatre-program-card theatre-program-vacancy" data-theatre-slot="vacant"><span aria-hidden="true">✧</span><h3>Freier Repertoireplatz</h3><p>Hier kann eine weitere Inszenierung ihren Platz finden.</p></article>`;
  const image = sanitizeImageSrc(item.image);
  return `<article class="theatre-program-card" data-theatre-slot="production">
    ${image ? `<img class="theatre-program-art" src="${image}" alt="Bühnenbild zu ${escapeHtml(item.title)}" loading="lazy" decoding="async">` : ''}
    <div class="theatre-program-copy"><span class="theatre-program-genre">${escapeHtml(item.genre)}</span><h3>${escapeHtml(item.title)}</h3>
    ${item.setting ? `<p class="theatre-program-setting">${escapeHtml(item.setting)}</p>` : ''}
    <div class="theatre-program-synopsis">${sanitizeContentHtml(item.synopsis)}</div>
    <dl>${[['Auf der Bühne',item.cast],['Die Inszenierung',item.staging]].filter(([,text])=>text).map(([label,text])=>`<div><dt>${label}</dt><dd>${escapeHtml(text)}</dd></div>`).join('')}</dl></div>
  </article>`;
}

function buildTheatreProgramPage(page, entry, pageIndex, total) {
  const data=sanitizeTheatreProgramData(page.theatreProgram);
  const thread=getInlineCommentThreadForPage(page,entry,pageIndex);
  return `${buildNav(page,pageIndex,total)}<section class="theatre-program-page">
    <header class="theatre-program-header"><span>${escapeHtml(entry.title)} · Repertoire</span><h2>${escapeHtml(data.title || 'Auf unserer Bühne')}</h2><p>${escapeHtml(data.introduction)}</p><small>Zum weiteren Repertoire nach unten blättern.</small></header>
    <div class="theatre-program-scroll" tabindex="0" role="region" aria-label="${escapeHtml(data.title || 'Auf unserer Bühne')}">
      <div class="theatre-program-grid">${data.items.map(buildTheatreProgramCard).join('') || '<p>Das Repertoire wird vorbereitet.</p>'}</div>
      ${data.footer ? `<footer>${escapeHtml(data.footer)}</footer>` : ''}
      ${thread ? buildEmbeddedCommentsSection(thread) : ''}
    </div></section>`;
}
