const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

// One presentation for statically built kingdom links and structured territories.
export function territoryNavigationMarkup(links, label = 'Untergeordnete Herrschaften') {
  return `<nav class="territory-navigation" aria-label="${escape(label)}">${links.map(territory => `
  <a class="territory-navigation-card" href="${escape(territory.href)}"${territory.id ? ` data-territory-id="${escape(territory.id)}"` : ''}>
    ${territory.imageSrc ? `<img class="territory-navigation-banner" src="${escape(territory.imageSrc)}" alt="${escape(territory.imageAlt)}" width="80" height="96" loading="lazy">` : ''}
    <span><strong>${escape(territory.title)}</strong>${territory.house || territory.crestSrc ? `
      <span class="territory-navigation-owner">${territory.crestSrc ? `<img class="territory-navigation-crest" src="${escape(territory.crestSrc)}" alt="${escape(territory.crestAlt)}" width="28" height="28" loading="lazy">` : ''}${territory.house ? `<span>${escape(territory.house)}</span>` : ''}</span>` : ''}${territory.seat ? `
      <span>Sitz: ${escape(territory.seat)}</span>` : ''}</span>
  </a>`).join('')}
</nav>`;
}
