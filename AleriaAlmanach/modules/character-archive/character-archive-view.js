import { CHARACTER_ARCHIVE_KINDS } from './character-archive-model.js?v=20260905-archive-order-v2';
import { matchesCharacterArchiveKind } from './character-archive-attack-groups.js?v=20260909-dragon-parent-v2';

const navigationGroups = [
  { label: 'Figur & Herkunft', kinds: ['ancestry', 'background', 'origin', 'class', 'trait'] },
  { label: 'Können & Regeln', kinds: ['spell', 'ability', 'skill', 'technique', 'attack', 'condition'] },
  { label: 'Ausrüstung & Begleiter', kinds: CHARACTER_ARCHIVE_KINDS.filter(kind => kind.registerCategory).map(kind => kind.id) }
];

export function renderEntryDescription(description, escapeHtml) {
  const text = String(description || 'Noch keine Beschreibung hinterlegt.');
  if (text.length <= 240) return `<p>${escapeHtml(text)}</p>`;
  const excerpt = text.slice(0, 210).replace(/\s+\S*$/, '');
  return `<details class="character-archive-description"><summary><span>${escapeHtml(excerpt)} …</span><em>Beschreibung lesen</em></summary><p>${escapeHtml(text)}</p></details>`;
}

export function renderKindNavigation(entries, selectedKind, escapeHtml) {
  const button = (id, label, count, symbol = '▦') => `<button type="button" class="${selectedKind === id ? 'active' : ''}" aria-pressed="${selectedKind === id}" data-character-archive-action="set-kind" data-kind="${id}"><i aria-hidden="true">${symbol}</i><span>${escapeHtml(label)}</span><strong>${count}</strong></button>`;
  return `<nav class="character-archive-kinds" aria-label="Archivkategorien">
    ${button('all', 'Gesamtarchiv', entries.length)}
    ${navigationGroups.map(group => `<div class="character-archive-nav-group"><h3>${group.label}</h3>${group.kinds.map(id => {
      const kind = CHARACTER_ARCHIVE_KINDS.find(item => item.id === id);
      return button(id, kind.label, entries.filter(entry => matchesCharacterArchiveKind(entry, id)).length, kind.symbol);
    }).join('')}</div>`).join('')}
  </nav>`;
}

export function renderStats(entries) {
  const sourceCount = new Set(entries.flatMap(entry => (entry.sources || []).map(source => `${source.kind}:${source.id || source.name}`))).size;
  return `<div><strong>${entries.length}</strong><span>Einträge</span></div>
    <div><strong>${CHARACTER_ARCHIVE_KINDS.filter(kind => !kind.navigationKind && entries.some(entry => matchesCharacterArchiveKind(entry, kind.id))).length}</strong><span>Archivbereiche</span></div>
    <div><strong>${sourceCount}</strong><span>Quellen</span></div>
    <div><strong>${entries.filter(entry => !entry.builtin && (!entry.archivedFromProfile || entry.updatedAt)).length}</strong><span>Eigene Fassungen</span></div>`;
}

export function renderArchiveShell({ picker, kindLabel }, escapeHtml) {
  return `<div class="character-archive-page${picker ? ' is-picker' : ''}">
    <header class="character-archive-head">
      <div class="character-archive-heading"><span class="character-archive-eyebrow">Aleria Almanach · ${picker ? 'Aus dem Archiv wählen' : 'Regeln & Figuren'}</span>
        <h1 id="character-archive-title">${escapeHtml(picker ? `${kindLabel} auswählen` : 'Charakterbogen-Archiv')}</h1>
        <p>${picker ? 'Wähle eine Vorlage für deinen Charakterbogen. Du erhältst eine unabhängige Kopie.' : 'Alles, was eine Figur ausmacht. Entdecke Vorlagen, ordne dein Wissen und entwickle eigene Fassungen.'}</p>
      </div>
      <div class="character-archive-head-actions">
        <button type="button" data-character-archive-action="close">${picker ? 'Zurück zum Bogen' : '← Zum Almanach'}</button>
        <button type="button" class="character-archive-primary" data-character-archive-action="${picker ? 'create-from-picker' : 'new-entry'}">${picker ? '+ Neu anlegen' : '+ Archiveintrag'}</button>
        <button type="button" class="character-archive-close" data-character-archive-action="close" aria-label="Archiv schließen">×</button>
      </div>
    </header>
    ${picker ? '' : '<div class="character-archive-stats" data-archive-role="stats"></div>'}
    <div class="character-archive-layout">
      ${picker ? '' : `<aside class="character-archive-sidebar"><details class="character-archive-navigation" open><summary>Archivbereiche <span aria-hidden="true">⌄</span></summary><div data-archive-role="navigation"></div></details><div class="character-archive-ledger-note"><strong>Ein gemeinsamer Fundus</strong><p>Vorlagen aus Regeln, Charakterbögen und Registern. Eigene Fassungen verändern bestehende Bögen nicht rückwirkend.</p></div></aside>`}
      <section class="character-archive-content" aria-label="Archiveinträge">
        <div class="character-archive-content-head"><div><span class="character-archive-eyebrow">${picker ? 'Vorlagen für deinen Bogen' : 'Im Archiv stöbern'}</span><h2 data-archive-role="category-title" tabindex="-1">Gesamtarchiv</h2></div><span class="character-archive-result" data-archive-role="count" role="status" aria-live="polite"></span></div>
        <div class="character-archive-toolbar">
          <label class="character-archive-search"><span>Archiv durchsuchen</span><input type="search" placeholder="Name, Wirkung, Klasse, Quelle …" data-character-archive-field="search" autocomplete="off"></label>
          <label><span>Quelle</span><select data-character-archive-field="source"><option value="all">Alle Quellen</option><option value="system">Regelvorlagen</option><option value="character">Charaktere</option><option value="creature">Kreaturen</option><option value="register">Inventar-Register</option><option value="custom">Eigene Fassungen</option></select></label>
          <label><span>Sortierung</span><select data-character-archive-field="sort"><option value="name">Name A–Z</option><option value="kind">Kategorie</option><option value="newest">Zuletzt geändert</option></select></label>
        </div>
        <div class="character-archive-filter-info"><span data-archive-role="filter-summary"></span><button type="button" data-character-archive-action="reset-filters" hidden>Filter zurücksetzen</button></div>
        <div class="character-archive-results" data-archive-role="results"></div>
        <div class="character-archive-more" data-archive-role="pagination" hidden></div>
      </section>
    </div>
  </div>`;
}
