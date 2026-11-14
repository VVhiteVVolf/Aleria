// Presentation only. Existing heraldry remains authoritative for named houses.
const AleriaCharacterRegisterIcons = (() => {
  const root = '../IconOrdner/ReiterIcons/Charakterregister/';
  const icons = Object.freeze({
    categories: `${root}people-v1.webp`, collections: `${root}groups-v1.webp`, collection: `${root}groups-v1.webp`,
    families: `${root}genealogy-v1.webp`, family: `${root}genealogy-v1.webp`,
    faction: `${root}faction-v1.webp`, location: `${root}location-v1.webp`,
    relevance: `${root}relevance-v1.webp`, status: `${root}status-v1.webp`,
    unsorted: `${root}unassigned-v1.webp`, recent: `${root}recent-v1.webp`,
    new: `${root}new-person-v1.webp`, important: `${root}important-v1.webp`,
    plot: `${root}plot-v2.webp`, 'missing-group': `${root}unassigned-v1.webp`,
    'missing-portrait': `${root}missing-portrait-v1.webp`, 'missing-bio': `${root}missing-description-v1.webp`,
    inactive: `${root}inactive-v1.webp`
  });
  const tones = Object.freeze({ categories: 'green', collection: 'green', collections: 'green',
    family: 'plum', families: 'plum', faction: 'blue', location: 'clay', relevance: 'gold',
    status: 'blue', important: 'green', plot: 'plum', inactive: 'clay' });
  return Object.freeze({
    source: key => icons[key] || icons.categories,
    tone: key => tones[key] || 'gold',
    render: key => `<img class="char-register-icon" src="${icons[key] || icons.categories}" alt="" width="32" height="32" decoding="async" loading="lazy">`
  });
})();
