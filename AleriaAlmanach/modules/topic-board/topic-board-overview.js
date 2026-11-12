/* The overview owns the board shell and its read-only planning presentation. */
(() => {
  const focuses = [
    { id: 'all', label: 'Alle Plays', count: 'open', icon: '≡' },
    { id: 'relevant', label: 'Jetzt relevant', count: 'relevant', icon: '◉' },
    { id: 'upcoming', label: 'Demnächst', count: 'upcoming', icon: '↗' },
    { id: 'unscheduled', label: 'Ohne Termin', count: 'unscheduled', icon: '✧' }
  ];

  function renderShell() {
    return `<div class="topic-board-dialog">
      <header class="topic-board-head">
        <div class="topic-board-heading-copy">
          <div class="topic-board-kicker"><span aria-hidden="true">✦</span> Gemeinsam Geschichten weiterschreiben</div>
          <h2 id="topic-board-title">Die Themenwand<span aria-hidden="true">.</span></h2>
          <p>Eure nächsten Plays. Ein Platz für alles, was noch erzählt werden will.</p>
        </div>
        <div class="topic-board-head-actions">
          <button class="topic-board-new" type="button" data-topic-board-action="open-editor" aria-expanded="false" aria-controls="topic-board-editor"><span aria-hidden="true">＋</span> Play festhalten</button>
          <button class="topic-board-close" type="button" data-topic-board-action="close-board" aria-label="Themenwand schließen">×</button>
        </div>
      </header>
      <div class="topic-board-workspace">
        <div class="topic-board-overview">
          <aside class="topic-board-rail" aria-label="Spielplan-Übersicht">
            <div class="topic-board-world-date"><span class="topic-board-rail-label">Heute in Aleria</span><strong data-topic-board-world-date></strong><small>Termine folgen eurer Spielweltzeit.</small></div>
            <nav class="topic-board-tabs" aria-label="Play-Status">
              <button type="button" data-topic-board-action="set-view" data-topic-board-view="open"><span aria-hidden="true">☷</span> Offene Plays <strong data-topic-board-open-count>0</strong></button>
              <button type="button" data-topic-board-action="set-view" data-topic-board-view="archived"><span aria-hidden="true">✓</span> Archiv <strong data-topic-board-archive-count>0</strong></button>
            </nav>
            <div class="topic-board-focus-panel" data-topic-board-focus-panel>
              <span class="topic-board-rail-label">Im Blick behalten</span>
              <div class="topic-board-focuses" role="group" aria-label="Plays nach Termin filtern">${focuses.map(focus => `<button type="button" data-topic-board-action="set-focus" data-topic-board-focus="${focus.id}" aria-pressed="false"><span class="topic-board-focus-icon" aria-hidden="true">${focus.icon}</span><span>${focus.label}</span><strong data-topic-board-focus-count="${focus.count}">0</strong></button>`).join('')}</div>
            </div>
            <div class="topic-board-rail-note"><span aria-hidden="true">✧</span><p>Eine Idee reicht für den Anfang.<br>Den Rest plant ihr gemeinsam.</p></div>
            <button class="topic-board-sync" type="button" data-topic-board-sync data-topic-board-action="retry-sync"></button>
          </aside>
          <main class="topic-board-main">
            <div class="topic-board-list-heading"><div><span class="topic-board-rail-label" data-topic-board-list-eyebrow>Euer gemeinsamer Spielplan</span><h3 data-topic-board-list-title>Was spielen wir als Nächstes?</h3></div><span class="topic-board-result-count" data-topic-board-result-count aria-live="polite"></span></div>
            <div class="topic-board-list-controls">
              <label class="topic-board-list-search"><span aria-hidden="true">⌕</span><span class="topic-board-visually-hidden">Plays durchsuchen</span><input type="search" data-topic-board-list-field="query" placeholder="Play, Ort oder Figur suchen …" autocomplete="off"></label>
              <label><span class="topic-board-visually-hidden">Kategorie filtern</span><select data-topic-board-list-field="category"><option value="all">Alle Themenarten</option>${TOPIC_BOARD_CATEGORIES.map(category => `<option value="${category.id}">${topicBoardEscape(category.label)}</option>`).join('')}</select></label>
              <label><span class="topic-board-visually-hidden">Plays sortieren</span><select data-topic-board-list-field="sort"><option value="due">Nach Spielwelttermin</option><option value="played" hidden>Zuletzt gespielt</option><option value="votes">Nach euren Stimmen</option><option value="newest">Zuletzt bearbeitet</option><option value="title">Nach Titel</option></select></label>
            </div>
            <div class="topic-board-active-filters" data-topic-board-active-filters hidden><span data-topic-board-filter-description></span><button type="button" data-topic-board-action="clear-list-filters">Filter zurücksetzen <span aria-hidden="true">×</span></button></div>
            <div class="topic-board-list" data-topic-board-list></div>
            <p class="topic-board-list-footnote">Ein guter Faden geht nicht verloren. Gespielte Plays bleiben im Archiv.</p>
          </main>
        </div>
        <aside id="topic-board-editor" class="topic-board-editor" data-topic-board-editor hidden aria-label="Play bearbeiten"></aside>
      </div>
    </div>`;
  }

  function refresh(overlay, state) {
    const listState = globalThis.AleriaTopicBoardListState.getState();
    const currentDate = getCurrentTopicBoardWorldDate();
    const summary = globalThis.AleriaTopicBoardPlanning.getSummary(state.proposals, currentDate);
    const archived = state.view === TOPIC_BOARD_STATUS_ARCHIVED;
    overlay.querySelector('option[value="played"]').hidden = !archived;
    overlay.querySelector('[data-topic-board-open-count]').textContent = state.loading ? '–' : summary.open;
    overlay.querySelector('[data-topic-board-archive-count]').textContent = state.loading ? '–' : summary.archived;
    overlay.querySelector('[data-topic-board-world-date]').textContent = formatTopicBoardScheduleDate(currentDate, { withWeekday: false }) || 'Datum noch offen';
    overlay.querySelectorAll('[data-topic-board-action="set-view"]').forEach(button => {
      const active = button.dataset.topicBoardView === state.view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    overlay.querySelector('[data-topic-board-focus-panel]').hidden = archived;
    overlay.querySelectorAll('[data-topic-board-focus-count]').forEach(element => {
      element.textContent = state.loading ? '–' : summary[element.dataset.topicBoardFocusCount];
    });
    overlay.querySelectorAll('[data-topic-board-action="set-focus"]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.topicBoardFocus === listState.focus));
    });
    const titles = { all: 'Was spielen wir als Nächstes?', relevant: 'Diese Plays sind jetzt relevant.', upcoming: 'Darauf könnt ihr euch freuen.', unscheduled: 'Ideen mit offenem Termin.' };
    overlay.querySelector('[data-topic-board-list-title]').textContent = archived ? 'Geschichten, die ihr gespielt habt.' : titles[listState.focus] || titles.all;
    overlay.querySelector('[data-topic-board-list-eyebrow]').textContent = archived ? 'Euer gemeinsames Archiv' : 'Euer gemeinsamer Spielplan';
    const filtered = globalThis.AleriaTopicBoardListState.hasFilters();
    overlay.querySelector('[data-topic-board-active-filters]').hidden = !filtered;
    const filterDescription = [
      listState.focus !== 'all' ? focuses.find(focus => focus.id === listState.focus)?.label : '',
      listState.category !== 'all' ? getTopicBoardCategoryLabel(listState.category) : '',
      listState.query ? `Suche: „${listState.query}“` : ''
    ].filter(Boolean).join(' · ');
    overlay.querySelector('[data-topic-board-filter-description]').textContent = filterDescription;
    const sync = overlay.querySelector('[data-topic-board-sync]');
    const labels = {
      online: 'Gemeinsam synchronisiert',
      syncing: 'Änderungen werden gespeichert …',
      error: 'Verbindung prüfen · erneut versuchen',
      connecting: 'Verbindung wird hergestellt …'
    };
    sync.dataset.state = state.syncState || 'connecting';
    sync.textContent = labels[state.syncState] || labels.connecting;
    sync.title = state.syncError || 'Online-Verbindung erneut prüfen';
  }

  function renderGroups(proposals, { view, sort, renderCard }) {
    if (view === TOPIC_BOARD_STATUS_ARCHIVED || sort !== 'due') return proposals.map(renderCard).join('');
    const date = getCurrentTopicBoardWorldDate();
    if (!globalThis.AleriaWorldDateModel.isValid(date)) return proposals.map(renderCard).join('');
    const groups = [
      { id: 'relevant', title: 'Jetzt relevant', note: 'Heute, laufend & noch offene frühere Termine', icon: '◉' },
      { id: 'upcoming', title: 'Die nächsten Kapitel', note: 'Nach Spielwelttermin geordnet', icon: '↗' },
      { id: 'unscheduled', title: 'Noch Raum für eine Idee', note: 'Diese Plays haben noch keinen festen Termin', icon: '✧' }
    ];
    return groups.map(group => {
      const items = globalThis.AleriaTopicBoardPlanning.filterProposals(proposals, group.id, date);
      if (!items.length) return '';
      return `<section class="topic-board-play-group" data-topic-board-group="${group.id}"><header><span class="topic-board-group-mark" aria-hidden="true">${group.icon}</span><div><h4>${group.title} <span>${items.length}</span></h4><p>${group.note}</p></div></header>${items.map(renderCard).join('')}</section>`;
    }).join('');
  }

  globalThis.AleriaTopicBoardOverview = Object.freeze({ renderShell, refresh, renderGroups });
})();
