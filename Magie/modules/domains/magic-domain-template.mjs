function escapeText(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function renderDomain(entry) {
  const symbol = entry.symbol
    ? `<img class="magic-domain-symbol" src="${escapeText(entry.symbol)}" alt="" width="46" height="46" loading="lazy" decoding="async">`
    : '<span class="magic-domain-placeholder" role="img" aria-label="Platzhalter für das Domänensiegel"><span aria-hidden="true">✧</span></span>';
  return `              <article class="magic-domain" id="domaene-${entry.id}" data-magic-domain>
                ${symbol}
                <div class="magic-domain-copy"><p class="magic-eyebrow">${escapeText(entry.epithet || entry.kind)}</p><h5><a href="${escapeText(entry.href)}">${escapeText(entry.name)} <span aria-hidden="true">↗</span></a></h5><p class="magic-domain-name">Domäne: <strong>${escapeText(entry.domain)}</strong></p><p class="magic-domain-aspect">${escapeText(entry.aspect)}</p>${entry.note ? `<p class="magic-domain-note">${escapeText(entry.note)}</p>` : ''}<p class="magic-domain-pending">Zauber &amp; Ausprägungen <span>noch offen</span></p></div>
              </article>`;
}

function renderCircle(circle) {
  return `          <details class="magic-domain-circle" id="${circle.id}" data-magic-disclosure>
            <summary><span class="magic-circle-symbol" aria-hidden="true">${circle.symbol}</span><span class="magic-circle-title">${escapeText(circle.title)}</span><small>${circle.count} Domänen</small><b aria-hidden="true">+</b></summary>
            <div class="magic-domain-circle-body">${circle.groups.map(group => `
              <section class="magic-domain-group" data-magic-domain-group aria-labelledby="${group.id}"><h4 id="${group.id}">${escapeText(group.title)}</h4><div class="magic-domain-grid">
${group.entries.map(renderDomain).join('\n')}
              </div></section>`).join('')}
            </div>
          </details>`;
}

export function renderMagicDomains(circles) {
  const total = circles.reduce((sum, circle) => sum + circle.count, 0);
  return `        <details class="magic-domains" id="besondere-domaenen" data-magic-disclosure>
          <summary><span class="magic-domain-cover-mark" aria-hidden="true">✧</span><span><small>Vom Wesen des Patrons geprägt</small><span class="magic-domains-title">Besondere Domänen</span><span class="magic-domains-subtitle">Celestiale &amp; infernale Verbindungen</span></span><span class="magic-domains-total">${total} Domänen</span><b aria-hidden="true">+</b></summary>
          <div class="magic-domains-body"><p class="magic-domain-intro">Jede der hier verzeichneten Mächte trägt eine eigene magische Domäne. Die Zuordnung folgt ihrem Wesen und ihren Überlieferungen. Die einzelnen Zauber und Ausprägungen bleiben vorerst offen.</p>
${circles.map(renderCircle).join('\n')}
          </div>
        </details>`;
}
