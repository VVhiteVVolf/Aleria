const TOURNAMENT_LEAGUE_HEADER_FIELDS = [
  ['rank', 'Rang'],
  ['crest', 'Wappen'],
  ['knight', 'Ritter'],
  ['house', 'Haus'],
  ['wins', 'Siege'],
  ['hits', 'Treffer'],
  ['honor', 'Ehrpunkte'],
  ['glory', 'Ruhm'],
  ['status', 'Status']
];

const TOURNAMENT_LEAGUE_STANDING_FIELDS = [
  ['rank', 'Rang', 'text'],
  ['crest', 'Wappen-URL', 'url'],
  ['knight', 'Ritter', 'text'],
  ['house', 'Haus', 'text'],
  ['wins', 'Siege', 'text'],
  ['hits', 'Treffer', 'text'],
  ['honor', 'Ehrpunkte', 'text'],
  ['glory', 'Ruhm', 'text'],
  ['status', 'Status', 'text']
];

const TOURNAMENT_LEAGUE_MATCHUP_FIELDS = [
  ['label', 'Label', 'text'],
  ['time', 'Zeit', 'text'],
  ['type', 'Kampfart', 'text'],
  ['leftName', 'Links: Name', 'text'],
  ['leftHouse', 'Links: Haus', 'text'],
  ['leftPortrait', 'Links: Portrait-URL', 'url'],
  ['leftCrest', 'Links: Wappen-URL', 'url'],
  ['rightName', 'Rechts: Name', 'text'],
  ['rightHouse', 'Rechts: Haus', 'text'],
  ['rightPortrait', 'Rechts: Portrait-URL', 'url'],
  ['rightCrest', 'Rechts: Wappen-URL', 'url']
];

const TOURNAMENT_LEAGUE_NOTE_FIELDS = [
  ['title', 'Titel / Name', 'text'],
  ['text', 'Text / Notiz', 'textarea'],
  ['icon', 'Icon-URL', 'url'],
  ['meta', 'Meta / Rang', 'text']
];

function buildTournamentLeagueHeaderRows(headers = {}, mode = 'module') {
  return TOURNAMENT_LEAGUE_HEADER_FIELDS.map(([field, fallback]) => {
    const value = escapeHtml(headers?.[field] || fallback);
    if (mode === 'inline') {
      return `
        <div class="tleague-edit-row header">
          <span>${escapeHtml(fallback)}</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tleague-header-field" data-tleague-header-field="${field}" value="${value}">
        </div>`;
    }
    return `
      <div class="tleague-edit-row header module-tleague-header-row">
        <span>${escapeHtml(fallback)}</span>
        <input class="inline-edit-input me-tleague-header-${field}" type="text" value="${value}">
      </div>`;
  }).join('');
}

function buildTournamentLeagueStructuredRows(items = [], listName = 'standings', mode = 'module') {
  const configs = {
    standings: {
      rowClass: 'tleague-standing-row',
      fallback: { rank: '1', crest: '', knight: 'Neuer Ritter', house: 'Haus', wins: '0', hits: '0', honor: '0', glory: '0', status: 'Aktiv' },
      fields: TOURNAMENT_LEAGUE_STANDING_FIELDS
    },
    matchups: {
      rowClass: 'tleague-matchup-row',
      fallback: { label: 'Neue Begegnung', time: '', type: 'Lanzenstechen', leftName: '', leftHouse: '', leftPortrait: '', leftCrest: '', rightName: '', rightHouse: '', rightPortrait: '', rightCrest: '' },
      fields: TOURNAMENT_LEAGUE_MATCHUP_FIELDS
    },
    notes: {
      rowClass: 'tleague-note-row',
      fallback: { title: 'Eintrag', text: '', icon: '', meta: '' },
      fields: TOURNAMENT_LEAGUE_NOTE_FIELDS
    }
  };
  const config = listName === 'standings' ? configs.standings : listName === 'matchups' ? configs.matchups : configs.notes;
  const rows = Array.isArray(items) && items.length ? items : [config.fallback];
  return rows.map((item, index) => `
    <div class="tleague-edit-row ${config.rowClass} ${mode === 'module' ? `module-tleague-${listName}-row` : ''}">
      ${config.fields.map(([field, placeholder, type]) => {
        const value = escapeHtml(item?.[field] || '');
        const moduleClass = mode === 'module' ? `me-tleague-${listName}-${field}` : '';
        const dataAttrs = mode === 'inline'
          ? `data-inline-action="update-tleague-row-field" data-tleague-list="${listName}" data-tleague-index="${index}" data-tleague-field="${field}"`
          : '';
        if (type === 'textarea') {
          return `<textarea class="inline-edit-textarea ${moduleClass}" placeholder="${escapeHtml(placeholder)}" ${dataAttrs}>${value}</textarea>`;
        }
        return `<input class="inline-edit-input ${moduleClass}" type="${type}" value="${value}" placeholder="${escapeHtml(placeholder)}" ${dataAttrs}>`;
      }).join('')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" ${mode === 'inline' ? `data-inline-action="remove-tleague-row" data-tleague-list="${listName}" data-tleague-index="${index}"` : 'data-module-editor-action="remove-tournament-league-row"'}>Löschen</button>
    </div>`).join('');
}

function collectTournamentLeagueHeaders(card) {
  const headers = {};
  TOURNAMENT_LEAGUE_HEADER_FIELDS.forEach(([field, fallback]) => {
    headers[field] = getTrimmedFormValue(card, `.me-tleague-header-${field}`) || fallback;
  });
  return headers;
}

function collectTournamentLeagueStructuredRows(card, listName, fields) {
  return Array.from(card.querySelectorAll(`.module-tleague-${listName}-row`)).map(row => {
    const item = {};
    fields.forEach(([field]) => {
      item[field] = getTrimmedFormValue(row, `.me-tleague-${listName}-${field}`);
    });
    return item;
  }).filter(item => fields.some(([field]) => item[field]));
}

function addModuleTournamentLeagueRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-tleague-${listName}`);
  if (!wrap) return;
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildTournamentLeagueStructuredRows([], listName, 'module'));
  syncModuleJsonPreview();
}

function removeModuleTournamentLeagueRow(button) {
  const row = button.closest('.tleague-edit-row');
  const wrap = row?.parentElement;
  if (!row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.tleague-edit-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Zeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function buildModuleTournamentParticipantsField(tournament) {
  const data = sanitizeTournamentData(tournament);
  return `
    <div class="module-editor-field wide module-tournament-participants-field">
      <label>Teilnehmer</label>
      <div class="tournament-participant-editor">
        <div class="tournament-participant-row header">
          <span>#</span>
          <span>Name</span>
          <span>Titel</span>
          <span>Haus</span>
          <span>Bild (Imgur)</span>
          <span>Wappen (Imgur)</span>
          <span>Marker</span>
        </div>
        ${data.participants.map((participant, index) => `
          <div class="tournament-participant-row module-tournament-participant-row">
            <span class="tournament-row-index">${index + 1}</span>
            <input class="inline-edit-input me-tournament-participant-name" type="text" value="${escapeHtml(participant.name)}" placeholder="Name">
            <input class="inline-edit-input me-tournament-participant-title" type="text" value="${escapeHtml(participant.title)}" placeholder="Titel">
            <input class="inline-edit-input me-tournament-participant-house" type="text" value="${escapeHtml(participant.house)}" placeholder="Haus">
            <input class="inline-edit-input me-tournament-participant-avatar" type="url" value="${escapeHtml(participant.avatar)}" placeholder="https://i.imgur.com/...">
            <input class="inline-edit-input me-tournament-participant-crest" type="url" value="${escapeHtml(participant.crest)}" placeholder="https://i.imgur.com/...">
            <input class="inline-edit-input me-tournament-participant-marks" type="text" value="${escapeHtml(participant.marks)}" placeholder="z.B. 🛡 🩸">
          </div>`).join('')}
      </div>
      <div class="module-editor-help">Bild (Imgur) ist der Mini-Avatar des Teilnehmers im Turnierbaum. Wappen (Imgur) ist optional.</div>
    </div>`;
}

function buildModuleTournamentScoresField(tournament) {
  const data = sanitizeTournamentData(tournament);
  const labels = getTournamentRoundLabels(data.bracketSize);
  return `
    <div class="module-editor-field wide module-tournament-scores-field">
      <label>Runden-Scores</label>
      <div class="tournament-score-editor">
        ${data.scores.map((round, roundIndex) => `
          <div class="tournament-score-round">
            <div class="inline-edit-kicker">${escapeHtml(labels[roundIndex] || `Runde ${roundIndex + 1}`)}</div>
            <div class="tournament-score-grid">
              ${round.map((pair, matchIndex) => `
                <div class="tournament-score-row module-tournament-score-row" data-round-index="${roundIndex}" data-match-index="${matchIndex}">
                  <span>Match ${matchIndex + 1}</span>
                  <input class="inline-edit-input me-tournament-score-left" type="number" min="0" step="1" value="${pair[0] == null ? '' : escapeHtml(pair[0])}" aria-label="${escapeHtml(labels[roundIndex] || 'Runde')} Match ${matchIndex + 1} links">
                  <span>:</span>
                  <input class="inline-edit-input me-tournament-score-right" type="number" min="0" step="1" value="${pair[1] == null ? '' : escapeHtml(pair[1])}" aria-label="${escapeHtml(labels[roundIndex] || 'Runde')} Match ${matchIndex + 1} rechts">
                </div>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function buildModuleTournamentSideCardRows(items = [], listName = 'candidates') {
  const rows = Array.isArray(items) ? items : [];
  return rows.map((item, index) => `
    <div class="inline-profile-card module-tournament-side-card module-tournament-${listName}-row">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${listName === 'injuries' ? 'Ausfall' : 'Kandidat'} ${index + 1}</div>
        <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-tournament-side-card">Löschen</button>
      </div>
      <div class="module-editor-grid">
        <div class="module-editor-field">
          <label>Name</label>
          <input class="inline-edit-input me-tournament-side-name" type="text" value="${escapeHtml(item?.name || '')}" placeholder="Name">
        </div>
        <div class="module-editor-field">
          <label>Marker</label>
          <input class="inline-edit-input me-tournament-side-marker" type="text" value="${escapeHtml(item?.marker || '')}" placeholder="z.B. ✦">
        </div>
        <div class="module-editor-field wide">
          <label>Bild / Wappen</label>
          <input class="inline-edit-input me-tournament-side-image" type="url" value="${escapeHtml(item?.image || '')}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="module-editor-field wide">
          <label>Detail</label>
          <textarea class="inline-edit-textarea me-tournament-side-detail small" placeholder="Notiz">${escapeHtml(item?.detail || '')}</textarea>
        </div>
      </div>
    </div>`).join('');
}

function buildModuleTournamentLineRows(items = [], listName = 'highlights') {
  const rows = Array.isArray(items) ? items : [];
  const label = listName === 'prizes' ? 'Preis' : 'Highlight';
  return rows.map((item, index) => `
    <div class="inline-stat-row module-tournament-line-row module-tournament-${listName}-row">
      <input class="inline-edit-input me-tournament-line-text" type="text" value="${escapeHtml(item || '')}" placeholder="${label}">
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-tournament-line-row">Löschen</button>
    </div>`).join('');
}

function collectModuleTournamentParticipants(card) {
  return Array.from(card.querySelectorAll('.module-tournament-participant-row')).map((row, index) =>
    sanitizeTournamentParticipant({
      name: getTrimmedFormValue(row, '.me-tournament-participant-name') || `Teilnehmer ${index + 1}`,
      title: getTrimmedFormValue(row, '.me-tournament-participant-title'),
      house: getTrimmedFormValue(row, '.me-tournament-participant-house'),
      avatar: getTrimmedFormValue(row, '.me-tournament-participant-avatar'),
      crest: getTrimmedFormValue(row, '.me-tournament-participant-crest'),
      marks: getTrimmedFormValue(row, '.me-tournament-participant-marks')
    }, index)
  );
}

function collectModuleTournamentScores(card, bracketSize) {
  const labels = getTournamentRoundLabels(bracketSize);
  const scores = labels.map((_, roundIndex) => {
    const matchCount = bracketSize / Math.pow(2, roundIndex + 1);
    return Array.from({ length: matchCount }, () => [null, null]);
  });
  Array.from(card.querySelectorAll('.module-tournament-score-row')).forEach(row => {
    const roundIndex = Number(row.dataset.roundIndex || -1);
    const matchIndex = Number(row.dataset.matchIndex || -1);
    if (!scores[roundIndex]?.[matchIndex]) return;
    scores[roundIndex][matchIndex] = [
      getTournamentScoreValue(row.querySelector('.me-tournament-score-left')?.value),
      getTournamentScoreValue(row.querySelector('.me-tournament-score-right')?.value)
    ];
  });
  return scores;
}

function collectModuleTournamentSideCards(card, listName) {
  return Array.from(card.querySelectorAll(`.module-tournament-${listName}-row`)).map(row => ({
    name: getTrimmedFormValue(row, '.me-tournament-side-name'),
    detail: getTrimmedFormValue(row, '.me-tournament-side-detail'),
    image: getTrimmedFormValue(row, '.me-tournament-side-image'),
    marker: getTrimmedFormValue(row, '.me-tournament-side-marker')
  })).filter(item => item.name || item.detail || item.image || item.marker);
}

function collectModuleTournamentLineRows(card, listName) {
  return Array.from(card.querySelectorAll(`.module-tournament-${listName}-row`))
    .map(row => getTrimmedFormValue(row, '.me-tournament-line-text'))
    .filter(Boolean);
}

function addModuleTournamentLineRow(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-tournament-${listName}`);
  if (!pageCard || !wrap) return;
  const fallback = listName === 'prizes' ? 'Neue Ehrung' : 'Neuer Höhepunkt';
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleTournamentLineRows([fallback], listName));
  syncModuleJsonPreview();
}

function removeModuleTournamentLineRow(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-tournament-line-row');
  const wrap = row?.parentElement;
  if (!pageCard || !row || !wrap) return;
  row.remove();
  if (!wrap.querySelector('.module-tournament-line-row')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Zeilen vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function addModuleTournamentSideCard(button, listName) {
  const pageCard = button.closest('.module-page-card');
  const wrap = pageCard?.querySelector(`.module-tournament-${listName}`);
  if (!pageCard || !wrap) return;
  const count = wrap.querySelectorAll('.module-tournament-side-card').length;
  const fallback = listName === 'injuries'
    ? { name: 'Neuer Ausfall', detail: '', image: '', marker: '!' }
    : { name: 'Neuer Kandidat', detail: '', image: '', marker: '✦' };
  wrap.querySelector('.inline-placeholder-note')?.remove();
  wrap.insertAdjacentHTML('beforeend', buildModuleTournamentSideCardRows([fallback], listName));
  const title = wrap.lastElementChild?.querySelector('.inline-edit-kicker');
  if (title) title.textContent = `${listName === 'injuries' ? 'Ausfall' : 'Kandidat'} ${count + 1}`;
  syncModuleJsonPreview();
}

function removeModuleTournamentSideCard(button) {
  const pageCard = button.closest('.module-page-card');
  const row = button.closest('.module-tournament-side-card');
  const wrap = row?.parentElement;
  if (!pageCard || !row || !wrap) return;
  row.remove();
  const listName = wrap.classList.contains('module-tournament-injuries') ? 'injuries' : 'candidates';
  Array.from(wrap.querySelectorAll('.module-tournament-side-card')).forEach((card, index) => {
    const title = card.querySelector('.inline-edit-kicker');
    if (title) title.textContent = `${listName === 'injuries' ? 'Ausfall' : 'Kandidat'} ${index + 1}`;
  });
  if (!wrap.querySelector('.module-tournament-side-card')) {
    wrap.innerHTML = '<div class="inline-placeholder-note">Noch keine Karten vorhanden.</div>';
  }
  syncModuleJsonPreview();
}

function rerenderModuleTournamentGrid(selectEl) {
  const card = selectEl.closest('.module-page-card');
  if (!card) return;
  const bracketSize = normalizeTournamentSize(selectEl.value);
  const tournament = sanitizeTournamentData({
    bracketSize,
    participants: collectModuleTournamentParticipants(card),
    scores: collectModuleTournamentScores(card, bracketSize),
    host: getTrimmedFormValue(card, '.me-page-tournament-host'),
    organizer: getTrimmedFormValue(card, '.me-page-tournament-organizer'),
    location: getTrimmedFormValue(card, '.me-page-tournament-location'),
    date: getTrimmedFormValue(card, '.me-page-tournament-date'),
    rules: getTrimmedFormValue(card, '.me-page-tournament-rules'),
    participantSummary: getTrimmedFormValue(card, '.me-page-tournament-participant-summary') || `${bracketSize} Teilnehmer`,
    heraldName: getTrimmedFormValue(card, '.me-page-tournament-herald-name'),
    heraldAvatar: getTrimmedFormValue(card, '.me-page-tournament-herald-avatar'),
    heraldText: getTrimmedFormValue(card, '.me-page-tournament-herald-text'),
    bottomImage: getTrimmedFormValue(card, '.me-page-tournament-bottom-image'),
    highlights: collectModuleTournamentLineRows(card, 'highlights'),
    prizes: collectModuleTournamentLineRows(card, 'prizes'),
    candidates: collectModuleTournamentSideCards(card, 'candidates'),
    injuries: collectModuleTournamentSideCards(card, 'injuries')
  });
  const participantField = card.querySelector('.module-tournament-participants-field');
  const scoreField = card.querySelector('.module-tournament-scores-field');
  if (participantField) participantField.outerHTML = buildModuleTournamentParticipantsField(tournament);
  if (scoreField) scoreField.outerHTML = buildModuleTournamentScoresField(tournament);
  syncModuleJsonPreview();
}

function buildTournamentModuleEditorFields(page) {
  const tournament = sanitizeTournamentData(page?.tournament || createDefaultTournamentData());
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'tournament' ? ' visible' : ''}" data-page-type="tournament">
        <div class="module-editor-grid single">
          <div class="module-editor-field">
            <label>Startphase / Turnierbaum</label>
            <select class="me-page-tournament-size" data-module-editor-action="rerender-tournament-grid">
              <option value="32"${tournament.bracketSize === 32 ? ' selected' : ''}>Sechzehntelfinale / 32 Teilnehmer</option>
              <option value="16"${tournament.bracketSize === 16 ? ' selected' : ''}>Achtelfinale / 16 Teilnehmer</option>
              <option value="8"${tournament.bracketSize === 8 ? ' selected' : ''}>Viertelfinale / 8 Teilnehmer</option>
              <option value="4"${tournament.bracketSize === 4 ? ' selected' : ''}>Halbfinale / 4 Teilnehmer</option>
            </select>
          </div>
          <div class="module-editor-grid">
            <div class="module-editor-field"><label>Ort</label><input type="text" class="me-page-tournament-location" value="${escapeHtml(tournament.location)}"></div>
            <div class="module-editor-field"><label>Datum</label><input type="text" class="me-page-tournament-date" value="${escapeHtml(tournament.date)}"></div>
            <div class="module-editor-field"><label>Gastgeber</label><input type="text" class="me-page-tournament-host" value="${escapeHtml(tournament.host)}"></div>
            <div class="module-editor-field"><label>Turnierleiter</label><input type="text" class="me-page-tournament-organizer" value="${escapeHtml(tournament.organizer)}"></div>
            <div class="module-editor-field"><label>Regeln</label><input type="text" class="me-page-tournament-rules" value="${escapeHtml(tournament.rules)}"></div>
            <div class="module-editor-field"><label>Teilnehmerinfo</label><input type="text" class="me-page-tournament-participant-summary" value="${escapeHtml(tournament.participantSummary)}"></div>
          </div>
          ${buildModuleTournamentParticipantsField(tournament)}
          ${buildModuleTournamentScoresField(tournament)}
          <div class="module-editor-grid">
            <div class="module-editor-field"><label>Herold / Kommentarname</label><input type="text" class="me-page-tournament-herald-name" value="${escapeHtml(tournament.heraldName)}"></div>
            <div class="module-editor-field"><label>Herold-Avatar</label><input type="url" class="me-page-tournament-herald-avatar" value="${escapeHtml(tournament.heraldAvatar)}" placeholder="https://i.imgur.com/..."></div>
          </div>
          <div class="module-editor-field"><label>Herold-Kommentar</label><textarea class="me-page-tournament-herald-text small">${escapeHtml(tournament.heraldText)}</textarea></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Höhepunkte des Tages</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-line-row" data-tournament-list="highlights">+ Highlight</button>
            </div>
            <div class="inline-stat-editor module-tournament-highlights">
              ${tournament.highlights.length ? buildModuleTournamentLineRows(tournament.highlights, 'highlights') : '<div class="inline-placeholder-note">Noch keine Höhepunkte vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field"><label>Bild unten rechts</label><input type="url" class="me-page-tournament-bottom-image" value="${escapeHtml(tournament.bottomImage)}" placeholder="https://i.imgur.com/..."></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Preise & Ehren</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-line-row" data-tournament-list="prizes">+ Preis</button>
            </div>
            <div class="inline-stat-editor module-tournament-prizes">
              ${tournament.prizes.length ? buildModuleTournamentLineRows(tournament.prizes, 'prizes') : '<div class="inline-placeholder-note">Noch keine Preise vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Potenzielle Spitzenkandidaten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-side-card" data-tournament-list="candidates">+ Kandidat</button>
            </div>
            <div class="inline-profile-card-editor module-tournament-candidates">
              ${tournament.candidates.length ? buildModuleTournamentSideCardRows(tournament.candidates, 'candidates') : '<div class="inline-placeholder-note">Noch keine Kandidaten vorhanden.</div>'}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Verletzungen & Ausfälle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-side-card" data-tournament-list="injuries">+ Ausfall</button>
            </div>
            <div class="inline-profile-card-editor module-tournament-injuries">
              ${tournament.injuries.length ? buildModuleTournamentSideCardRows(tournament.injuries, 'injuries') : '<div class="inline-placeholder-note">Noch keine Ausfälle vorhanden.</div>'}
            </div>
          </div>
        </div>
      </div>`;
}

function buildTournamentLeagueModuleEditorFields(page) {
  const league = sanitizeTournamentLeagueData(page?.tournamentLeague || {});
  return `
      <div class="module-page-type-block${inferModulePageType(page) === 'tournament-league' ? ' visible' : ''}" data-page-type="tournament-league">
        <div class="module-editor-grid">
          <div class="module-editor-field wide">
            <label>Beschreibung</label>
            ${buildTextFormatToolbar()}
            <textarea class="me-tleague-description">${escapeHtml(page?.description || '')}</textarea>
          </div>
          <div class="module-editor-field"><label>Registerzeile</label><input type="text" class="me-tleague-archive-label" value="${escapeHtml(league.archiveLabel)}"></div>
          <div class="module-editor-field"><label>Saison</label><input type="text" class="me-tleague-season" value="${escapeHtml(league.season)}"></div>
          <div class="module-editor-field"><label>Jahreslauf</label><input type="text" class="me-tleague-cycle" value="${escapeHtml(league.cycle)}"></div>
          <div class="module-editor-field"><label>Runde</label><input type="text" class="me-tleague-round" value="${escapeHtml(league.round)}"></div>
          <div class="module-editor-field"><label>Nächster Spieltag</label><input type="text" class="me-tleague-next-date" value="${escapeHtml(league.nextDate)}"></div>
          <div class="module-editor-field"><label>Regel-Button</label><input type="text" class="me-tleague-rules-label" value="${escapeHtml(league.rulesLabel)}"></div>
          <div class="module-editor-field"><label>Tabellenüberschrift</label><input type="text" class="me-tleague-table-title" value="${escapeHtml(league.tableTitle)}"></div>
          <div class="module-editor-field"><label>Matchup-Überschrift</label><input type="text" class="me-tleague-matchup-title" value="${escapeHtml(league.matchupTitle)}"></div>
          <div class="module-editor-field"><label>Versus-Text</label><input type="text" class="me-tleague-matchup-versus-label" value="${escapeHtml(league.matchupVersusLabel)}"></div>
          <div class="module-editor-field wide">
            <label>Tabellenspalten</label>
            <div class="module-editor-help">Diese Begriffe erscheinen oben in der Ligatabelle und sind frei umbenennbar.</div>
            <div class="tleague-edit-list module-tleague-headers">
              ${buildTournamentLeagueHeaderRows(league.tableHeaders, 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Ligatabelle</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="standings">+ Ritter</button>
            </div>
            <div class="tleague-edit-list module-tleague-standings">
              ${buildTournamentLeagueStructuredRows(league.standings, 'standings', 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Naechste Begegnungen</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="matchups">+ Begegnung</button>
            </div>
            <div class="tleague-edit-list module-tleague-matchups">
              ${buildTournamentLeagueStructuredRows(league.matchups, 'matchups', 'module')}
            </div>
          </div>
          <div class="module-editor-field wide"><label>Registrierungsnotiz</label><input type="text" class="me-tleague-registered-note" value="${escapeHtml(league.registeredNote)}"></div>
          <div class="module-editor-field"><label>Sidebar: Titel Ritter der Woche</label><input type="text" class="me-tleague-featured-title" value="${escapeHtml(league.featuredTitle)}"></div>
          <div class="module-editor-field"><label>Ritter der Woche</label><input type="text" class="me-tleague-featured-name" value="${escapeHtml(league.featuredName)}"></div>
          <div class="module-editor-field"><label>Portrait-URL</label><input type="url" class="me-tleague-featured-portrait" value="${escapeHtml(league.featuredPortrait)}" placeholder="https://i.imgur.com/..."></div>
          <div class="module-editor-field"><label>Wappen-URL</label><input type="url" class="me-tleague-featured-crest" value="${escapeHtml(league.featuredCrest)}" placeholder="https://i.imgur.com/..."></div>
          <div class="module-editor-field wide"><label>Kommentar zum Ritter</label><textarea class="me-tleague-featured-comment small">${escapeHtml(league.featuredComment)}</textarea></div>
          <div class="module-editor-field"><label>Kampfarten-Überschrift</label><input type="text" class="me-tleague-combat-types-title" value="${escapeHtml(league.combatTypesTitle)}"></div>
          <div class="module-editor-field"><label>Verletzte-Überschrift</label><input type="text" class="me-tleague-injuries-title" value="${escapeHtml(league.injuriesTitle)}"></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Kampfarten</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="combatTypes">+ Kampfart</button>
            </div>
            <div class="tleague-edit-list module-tleague-combatTypes">
              ${buildTournamentLeagueStructuredRows(league.combatTypes, 'combatTypes', 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Verletzte & Abwesende</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="injuries">+ Ausfall</button>
            </div>
            <div class="tleague-edit-list module-tleague-injuries">
              ${buildTournamentLeagueStructuredRows(league.injuries, 'injuries', 'module')}
            </div>
          </div>
          <div class="module-editor-field"><label>Beste Treffer-Überschrift</label><input type="text" class="me-tleague-top-hits-title" value="${escapeHtml(league.topHitsTitle)}"></div>
          <div class="module-editor-field"><label>Gerüchte-Überschrift</label><input type="text" class="me-tleague-rumors-title" value="${escapeHtml(league.rumorsTitle)}"></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Beste Treffer</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="topHits">+ Treffer</button>
            </div>
            <div class="tleague-edit-list module-tleague-topHits">
              ${buildTournamentLeagueStructuredRows(league.topHits, 'topHits', 'module')}
            </div>
          </div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Geruechte</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="rumors">+ Geruecht</button>
            </div>
            <div class="tleague-edit-list module-tleague-rumors">
              ${buildTournamentLeagueStructuredRows(league.rumors, 'rumors', 'module')}
            </div>
          </div>
          <div class="module-editor-field"><label>Wetter-Überschrift</label><input type="text" class="me-tleague-weather-title" value="${escapeHtml(league.weatherTitle)}"></div>
          <div class="module-editor-field"><label>Turnierplatz-Überschrift</label><input type="text" class="me-tleague-location-title" value="${escapeHtml(league.locationTitle)}"></div>
          <div class="module-editor-field wide"><label>Wettertext</label><textarea class="me-tleague-weather-text small">${escapeHtml(league.weatherText)}</textarea></div>
          <div class="module-editor-field wide"><label>Turnierplatz-Bild</label><input type="url" class="me-tleague-location-image" value="${escapeHtml(league.locationImage)}" placeholder="https://i.imgur.com/..."></div>
          <div class="module-editor-field"><label>Chronik-Überschrift</label><input type="text" class="me-tleague-chronicle-title" value="${escapeHtml(league.chronicleTitle)}"></div>
          <div class="module-editor-field"><label>Fußzeile</label><input type="text" class="me-tleague-footer" value="${escapeHtml(league.footer)}"></div>
          <div class="module-editor-field wide">
            <div class="module-editor-inline" style="justify-content:space-between;">
              <label>Chronik</label>
              <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-tournament-league-row" data-tleague-list="chronicle">+ Chronik</button>
            </div>
            <div class="tleague-edit-list module-tleague-chronicle">
              ${buildTournamentLeagueStructuredRows(league.chronicle, 'chronicle', 'module')}
            </div>
          </div>
        </div>
      </div>`;
}

function collectTournamentModuleEditorPage(card, page) {
  const bracketSize = normalizeTournamentSize(getFormValue(card, '.me-page-tournament-size'));
  page.tournamentPage = true;
  page.tournament = sanitizeTournamentData({
    bracketSize,
    location: getTrimmedFormValue(card, '.me-page-tournament-location'),
    date: getTrimmedFormValue(card, '.me-page-tournament-date'),
    host: getTrimmedFormValue(card, '.me-page-tournament-host'),
    organizer: getTrimmedFormValue(card, '.me-page-tournament-organizer'),
    rules: getTrimmedFormValue(card, '.me-page-tournament-rules'),
    participantSummary: getTrimmedFormValue(card, '.me-page-tournament-participant-summary'),
    participants: collectModuleTournamentParticipants(card),
    scores: collectModuleTournamentScores(card, bracketSize),
    heraldName: getTrimmedFormValue(card, '.me-page-tournament-herald-name'),
    heraldAvatar: getTrimmedFormValue(card, '.me-page-tournament-herald-avatar'),
    heraldText: getTrimmedFormValue(card, '.me-page-tournament-herald-text'),
    highlights: collectModuleTournamentLineRows(card, 'highlights'),
    bottomImage: getTrimmedFormValue(card, '.me-page-tournament-bottom-image'),
    prizes: collectModuleTournamentLineRows(card, 'prizes'),
    candidates: collectModuleTournamentSideCards(card, 'candidates'),
    injuries: collectModuleTournamentSideCards(card, 'injuries')
  });
  return page;
}

function collectTournamentLeagueModuleEditorPage(card, page) {
  page.tournamentLeaguePage = true;
  page.description = getTrimmedFormValue(card, '.me-tleague-description');
  page.tournamentLeague = sanitizeTournamentLeagueData({
    archiveLabel: getTrimmedFormValue(card, '.me-tleague-archive-label'),
    season: getTrimmedFormValue(card, '.me-tleague-season'),
    cycle: getTrimmedFormValue(card, '.me-tleague-cycle'),
    round: getTrimmedFormValue(card, '.me-tleague-round'),
    nextDate: getTrimmedFormValue(card, '.me-tleague-next-date'),
    rulesLabel: getTrimmedFormValue(card, '.me-tleague-rules-label'),
    tableTitle: getTrimmedFormValue(card, '.me-tleague-table-title'),
    tableHeaders: collectTournamentLeagueHeaders(card),
    matchupTitle: getTrimmedFormValue(card, '.me-tleague-matchup-title'),
    matchupVersusLabel: getTrimmedFormValue(card, '.me-tleague-matchup-versus-label'),
    registeredNote: getTrimmedFormValue(card, '.me-tleague-registered-note'),
    standings: collectTournamentLeagueStructuredRows(card, 'standings', TOURNAMENT_LEAGUE_STANDING_FIELDS),
    matchups: collectTournamentLeagueStructuredRows(card, 'matchups', TOURNAMENT_LEAGUE_MATCHUP_FIELDS),
    featuredTitle: getTrimmedFormValue(card, '.me-tleague-featured-title'),
    featuredName: getTrimmedFormValue(card, '.me-tleague-featured-name'),
    featuredPortrait: getTrimmedFormValue(card, '.me-tleague-featured-portrait'),
    featuredCrest: getTrimmedFormValue(card, '.me-tleague-featured-crest'),
    featuredComment: getTrimmedFormValue(card, '.me-tleague-featured-comment'),
    combatTypesTitle: getTrimmedFormValue(card, '.me-tleague-combat-types-title'),
    combatTypes: collectTournamentLeagueStructuredRows(card, 'combatTypes', TOURNAMENT_LEAGUE_NOTE_FIELDS),
    injuriesTitle: getTrimmedFormValue(card, '.me-tleague-injuries-title'),
    injuries: collectTournamentLeagueStructuredRows(card, 'injuries', TOURNAMENT_LEAGUE_NOTE_FIELDS),
    topHitsTitle: getTrimmedFormValue(card, '.me-tleague-top-hits-title'),
    topHits: collectTournamentLeagueStructuredRows(card, 'topHits', TOURNAMENT_LEAGUE_NOTE_FIELDS),
    rumorsTitle: getTrimmedFormValue(card, '.me-tleague-rumors-title'),
    rumors: collectTournamentLeagueStructuredRows(card, 'rumors', TOURNAMENT_LEAGUE_NOTE_FIELDS),
    weatherTitle: getTrimmedFormValue(card, '.me-tleague-weather-title'),
    weatherText: getTrimmedFormValue(card, '.me-tleague-weather-text'),
    locationTitle: getTrimmedFormValue(card, '.me-tleague-location-title'),
    locationImage: getTrimmedFormValue(card, '.me-tleague-location-image'),
    chronicleTitle: getTrimmedFormValue(card, '.me-tleague-chronicle-title'),
    chronicle: collectTournamentLeagueStructuredRows(card, 'chronicle', TOURNAMENT_LEAGUE_NOTE_FIELDS),
    footer: getTrimmedFormValue(card, '.me-tleague-footer')
  });
  return page;
}
