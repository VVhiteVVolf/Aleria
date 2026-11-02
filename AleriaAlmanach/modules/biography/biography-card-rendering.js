// Stateless rendering shared by classic character modules and ES-module creatures.
// The single namespace bridges both script formats; callers supply content safety.
(function (root) {
  function renderIcon(icon, { escape, imageSource }) {
    const value = String(icon || '').trim();
    const image = imageSource(value);
    return image ? `<img src="${image}" alt="" loading="lazy" decoding="async">` : (value ? escape(value) : '&#10022;');
  }

  function renderTrait(item, presentation) {
    return `<div class="biography-ability">
      <div class="biography-ability-icon">${renderIcon(item.icon, presentation)}</div>
      <div><strong>${presentation.escape(item.title || '')}</strong><span>${presentation.escape(item.detail || '')}</span></div>
    </div>`;
  }

  function renderConnection(item, presentation) {
    const { escape, imageSource } = presentation;
    if (item?.type === 'heading') return `<div class="biography-connection-heading">
      <strong>${escape(item.title || '')}</strong>${item.detail ? `<span>${escape(item.detail)}</span>` : ''}
    </div>`;
    const format = ['landscape', 'square'].includes(item?.imageFormat) ? item.imageFormat : 'portrait';
    const image = imageSource(item.image || '');
    const visual = image ? `<img class="${format}" src="${image}" alt="" loading="lazy" decoding="async">`
      : `<div class="biography-connection-placeholder ${format}">${item.icon ? renderIcon(item.icon, presentation) : escape((Array.from(String(item.name || '').trim())[0] || '?').toUpperCase())}</div>`;
    return `<div class="biography-connection ${format}">${visual}
      <div><strong>${escape(item.name || '')}</strong><span>${escape(item.detail || '')}</span></div>
    </div>`;
  }

  function normalizeKnightMentors(value) {
    return (Array.isArray(value) ? value : []).map(item => ({
      name: String(item?.name || '').trim(),
      role: String(item?.role || 'Rittervater').trim(),
      detail: String(item?.detail || '').trim(),
      image: String(item?.image || '').trim()
    })).filter(item => item.name).slice(0, 8);
  }

  // Editorial-default recognition only; never used as a security hash.
  function narrativeFingerprint(module) {
    const b = module?.biography || {};
    const text = JSON.stringify([b.biographyText || '', b.historyText || '', b.extraSections || []]);
    let first = 2166136261, second = 2246822507;
    for (let index = 0; index < text.length; index++) {
      first = Math.imul(first ^ text.charCodeAt(index), 16777619);
      second = Math.imul(second ^ text.charCodeAt(index), 2246822507);
    }
    return `${text.length}:${(first >>> 0).toString(16)}:${(second >>> 0).toString(16)}`;
  }

  // Receives sanitized HTML, never raw author input. Paragraphs from Word and older
  // <br>-based biographies acquire the same spacing without changing stored prose.
  function formatCopy(html, documentRef = root.document) {
    if (!documentRef?.createElement) return html;
    const source = documentRef.createElement('template');
    source.innerHTML = html;
    const result = documentRef.createElement('div');
    const blocks = new Set(['P', 'DIV', 'H4', 'H5', 'HR', 'BLOCKQUOTE', 'UL', 'OL']);
    let paragraph = null;
    function finish() {
      if (paragraph?.textContent.trim()) result.append(paragraph);
      paragraph = null;
    }
    for (const node of Array.from(source.content.childNodes)) {
      if (node.nodeType === 1 && blocks.has(node.tagName)) {
        finish();
        if (node.tagName === 'HR' || node.textContent.trim()) result.append(node);
      } else if (node.nodeType === 1 && node.tagName === 'BR') {
        finish();
      } else {
        paragraph ||= documentRef.createElement('p');
        paragraph.append(node);
      }
    }
    finish();
    return result.innerHTML;
  }

  function renderKnightMentors(items, presentation) {
    const mentors = normalizeKnightMentors(items);
    if (!mentors.length) return '';
    const { escape, imageSource } = presentation;
    return `<section class="biography-mentors" aria-label="Ausbildung und Lehrmeister">${mentors.map(item => {
      const image = imageSource(item.image);
      return `<div class="biography-mentor">
        ${image ? `<img src="${image}" alt="Portrait von ${escape(item.name)}" loading="lazy" decoding="async">`
          : `<div class="biography-mentor-placeholder" aria-hidden="true">${escape(Array.from(item.name)[0])}</div>`}
        <div><span class="biography-mentor-role">${escape(item.role)}</span><strong>${escape(item.name)}</strong>${item.detail ? `<p>${escape(item.detail)}</p>` : ''}</div>
      </div>`;
    }).join('')}</section>`;
  }

  function renderSection(title, body, escape, className = '') {
    if (!body) return '';
    return `<section class="biography-section ${className}">${title ? `<h3 class="biography-section-title">${escape(title)}<span aria-hidden="true"></span></h3>` : ''}${body}</section>`;
  }

  function editorGroup(title, body, { escape, open = false, count, help = '' }) {
    return `<details class="biography-editor-group" data-biography-editor-group="${escape(title)}"${open ? ' open' : ''}><summary>${escape(title)}${count === undefined ? '' : `<span class="biography-editor-group__count">${escape(count)} Einträge</span>`}</summary><div class="biography-editor-group__body">${help ? `<p class="biography-editor-group__help">${escape(help)}</p>` : ''}${body}</div></details>`;
  }

  // One page structure for the module template, character sheet and family tree.
  // Each caller retains ownership of its sanitizer, portrait controls and storage.
  function renderPage({ portraitHtml, stats = [], quote = '', quoteBy = '', data }, presentation) {
    const { escape, richText, href } = presentation;
    const copy = value => {
      if (!value?.trim()) return '';
      const html = formatCopy(richText(value), presentation.documentRef);
      return html.replace(/<[^>]+>|&nbsp;|&#160;/g, '').trim() ? `<div class="biography-copy">${html}</div>` : '';
    };
    const section = (title, body, className) => renderSection(title, body, escape, className);
    const lines = (items, className = '') => items?.length
      ? `<ul class="biography-list ${className}">${items.map(item => `<li>${richText(item)}</li>`).join('')}</ul>` : '';
    const extras = position => (data.extraSections || []).filter(item => item.position === position)
      .map(item => section(item.title, item.mode === 'list' ? lines(item.text.split(/\r?\n/).filter(item => item.trim()), 'compact') : copy(item.text), 'biography-extra-section')).join('');
    const traits = data.abilities?.length ? `<div class="biography-ability-list">${data.abilities.map(item => renderTrait(item, presentation)).join('')}</div>` : '';
    const connections = data.connections?.length ? `<div class="biography-connections">${data.connections.map(item => renderConnection(item, presentation)).join('')}</div>` : '';
    const documents = data.documents?.length ? `<div class="biography-ability-list documents">${data.documents.map(item => {
      const link = href(item.link);
      const title = escape(item.title || item.text || item.link || '');
      return `<div class="biography-ability document"><div class="biography-ability-icon">${renderIcon(item.icon || '▧', presentation)}</div><div><strong>${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</strong>${item.title && item.text ? `<span>${escape(item.text)}</span>` : ''}</div></div>`;
    }).join('')}</div>` : '';
    const right = section(data.triviaTitle, lines(data.trivia)) + section(data.quotesTitle, lines(data.quotes, 'quotes'))
      + section(data.connectionsTitle, connections) + section(data.documentsTitle, documents);
    const number = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
    return `<div class="biography-page${right ? '' : ' biography-page--two-columns'}" style="--biography-side-width:${number(data.sideWidth, 100, 35, 100)}%;--biography-connection-height:${number(data.connectionPortraitHeight, 68, 44, 140)}px;--biography-connection-text-offset:${number(data.connectionTextOffset, 0, 0, 80)}px;">
      <aside class="biography-left">${portraitHtml}
        ${renderKnightMentors(data.knightMentors, presentation)}
        ${stats.length ? `<div class="biography-info-table"><div class="biography-side-label">Auf einen Blick</div>${stats.map(row => {
          const [label, value] = Array.isArray(row) ? row : [row.label, row.value];
          return `<div class="biography-info-row"><span>${escape(label)}</span><strong>${escape(value)}</strong></div>`;
        }).join('')}</div>` : ''}
        ${quote ? `<div class="biography-quote-card"><div class="biography-quote-mark" aria-hidden="true">“</div><div>${richText(quote)}</div>${quoteBy ? `<span>${escape(quoteBy)}</span>` : ''}</div>` : ''}
      </aside>
      <div class="biography-main">
        ${section(data.biographyTitle, copy(data.biographyText), 'biography-introduction')}${extras('afterIntro')}
        ${section(data.abilitiesTitle, traits)}${section(data.historyTitle, copy(data.historyText))}
        ${section(data.worksTitle, lines(data.works, 'compact'))}${extras('afterWorks')}
      </div>
      ${right ? `<aside class="biography-right">${right}</aside>` : ''}
      ${data.footer ? `<div class="biography-footer">${escape(data.footer)}</div>` : ''}
    </div>`;
  }

  root.AleriaBiographyCards = Object.freeze({ renderIcon, renderTrait, renderConnection,
    normalizeKnightMentors, narrativeFingerprint, formatCopy, renderKnightMentors, renderPage, editorGroup });
})(globalThis);
