function buildNameListGroup(group, index) {
  return `
    <section class="name-list-group">
      <header>
        <span class="name-list-group-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
        <div><h3>${escapeHtml(group.label)}</h3>${group.subtitle ? `<p>${escapeHtml(group.subtitle)}</p>` : ''}</div>
      </header>
      <ol class="name-list-names">
        ${group.names.map(name => `<li><span class="name-list-name">${escapeHtml(name)}</span></li>`).join('')}
      </ol>
    </section>`;
}

function buildNameListPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeNameListData(page.nameList || {});
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const ornament = data.ornamentText ? `<div class="name-list-ornament ornament-${escapeHtml(data.ornamentStyle)}" aria-hidden="true">${escapeHtml(data.ornamentText)}</div>` : '';

  return `
    ${nav}
    <article class="name-list-page">
      <header class="name-list-header">
        <div class="name-list-archive-label">${escapeHtml(data.archiveLabel)}</div>
        ${ornament}
        <p>${escapeHtml(entry.category || 'Namensarchiv')}</p>
        <h2>${escapeHtml(entry.title)} · Namen</h2>
        ${data.introduction ? `<div class="name-list-introduction">${sanitizeContentHtml(data.introduction)}</div>` : ''}
      </header>
      <div class="name-list-content">
        ${data.groups.map(buildNameListGroup).join('')}
      </div>
      ${ornament}
      ${data.footer ? `<footer class="name-list-footer">${escapeHtml(data.footer)}</footer>` : ''}
    </article>
    ${embeddedComments}`;
}
