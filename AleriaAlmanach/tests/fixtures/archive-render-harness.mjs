import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { performance } from 'node:perf_hooks';
import { createArchiveRenderDocument } from './archive-render-dom.mjs';

export async function createArchiveRenderHarness({ source, sections = 120, entriesPerSection = 30 } = {}) {
  const document = createArchiveRenderDocument();
  const calls = { projections: 0, cards: 0, cardSections: [], dashboard: 0, characters: 0, creatures: 0, sceneActivity: 0 };
  const records = Array.from({ length: sections }, (_, section) => ({ key: `Section${section}`, tab: `Tab${section}`, entries: Array.from({ length: entriesPerSection }, (_, entry) => ({
    id: `entry-${section}-${entry}`, title: `Archive ${section} ${entry}`, subtitle: 'A source-backed entry', pages: [{ description: 'Lore text for the archive.', image: 'cover.webp' }]
  })) }));
  const context = vm.createContext({ document, console, CustomEvent: class { constructor(type) { this.type = type; } },
    setTimeout, clearTimeout, normalizeSearchText: value => String(value || '').toLocaleLowerCase('de'),
    escapeHtml: value => String(value ?? ''), getSectionPathParts: section => section.path || [], _customSections: [],
    getSectionPathLabel: section => (section.path || []).join(' > '),
    getValidSections() { calls.projections++; return records; },
    makeSectionSignature: section => section.tab || section.key,
    renderArchiveDashboard(sections) { calls.dashboard++; return `<section>Dashboard ${sections.reduce((sum, section) => sum + section.entries.length, 0)}<span data-calendar-dashboard></span></section>`; },
    refreshAlmanachDashboardSceneActivity() { calls.sceneActivity++; },
    renderArchiveSectionBand: section => `<h2>${section.key}</h2>`,
    renderArchiveSectionCards(grid, section, entries) { const visible = context.getSearch() ? entries : entries.slice(0, 24); calls.cardSections.push(section.tab); calls.cards += visible.length;
      grid.innerHTML = visible.map(entry => `<article class="entry-card"><img src="cover.webp"><strong>${entry.title}</strong><small>1 Seite</small></article>`).join(''); return Math.min(visible.length, 10); },
    AleriaArchiveNavigation: { render: sections => `<nav>${[...new Set(sections.map(section => section.tab))].map(tab => `<button class="gallery-tab-btn" data-tab="${tab}">${tab}</button>`).join('')}</nav>`, mount() {} },
    AleriaArchiveHierarchyController: { mount() {} },
    buildArchiveHierarchyModel: (sections, tab) => ({ tab, root: { path: [], entries: sections.flatMap(section => section.entries) } }),
    findArchiveHierarchyNode: root => root,
    getArchiveHierarchySection: (node, tab) => ({ key: tab, tab, entries: node.entries }),
    renderArchiveHierarchyBrowser: model => `<div data-archive-hierarchy-tab="${model.tab}"><details class="archive-hierarchy-tree"><div class="archive-hierarchy-tree-scroll"></div></details></div>`,
    renderArchiveHierarchyContentHeading: () => '',
    loadCharacters() { calls.characters++; const block = document.querySelector('.section-block[data-tab="Charaktere"]'); if (block) block.dataset.hasMatches = 'true'; },
    window: { matchMedia: () => ({ matches: false }), AleriaCreatures: { mount() { calls.creatures++; } } }
  });
  vm.runInContext(source || await readFile(new URL('../../modules/archive/archive-view.js', import.meta.url), 'utf8'), context);
  vm.runInContext('function getSearch() { return _archiveSearchNeedle; }', context);
  return { document, context, calls, records,
    render() { const before = performance.now(); context.renderAll(); return performance.now() - before; },
    search(needle) { context.needle = needle; vm.runInContext('_archiveSearch = needle; _archiveSearchNeedle = normalizeSearchText(needle);', context); },
    activate(tab) { context.switchTab(tab); },
    counts() { return vm.runInContext('({entries: _archiveEntryMatchCount, sections: _archiveEntrySectionMatchCount})', context); }
  };
}
