function updateInlineTournamentField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.tournamentField;
  if (!field) return;
  const current = sanitizeTournamentData(page.tournament || {});

  if (field === 'bracketSize') {
    const bracketSize = normalizeTournamentSize(input.value);
    current.bracketSize = bracketSize;
    current.participants = parseTournamentParticipantsTextarea(formatTournamentParticipantsTextarea(current), bracketSize);
    current.scores = parseTournamentScoresTextarea(formatTournamentScoresTextarea(current), bracketSize);
    page.tournament = sanitizeTournamentData(current);
    renderPage(currentPage, 0);
    return;
  }

  if (field === 'participants') current.participants = parseTournamentParticipantsTextarea(input.value, current.bracketSize);
  else if (field === 'scores') current.scores = parseTournamentScoresTextarea(input.value, current.bracketSize);
  else current[field] = String(input.value || '').trim();

  page.tournament = sanitizeTournamentData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTournamentParticipantField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.tournamentParticipantIndex || -1);
  const field = input.dataset.tournamentParticipantField;
  if (index < 0 || !field) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const participant = current.participants[index] || sanitizeTournamentParticipant({}, index);
  participant[field] = String(input.value || '').trim();
  current.participants[index] = sanitizeTournamentParticipant(participant, index);
  page.tournament = sanitizeTournamentData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTournamentScoreField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const roundIndex = Number(input.dataset.tournamentRoundIndex || -1);
  const matchIndex = Number(input.dataset.tournamentMatchIndex || -1);
  const slot = input.dataset.tournamentScoreSlot === 'right' ? 1 : 0;
  if (roundIndex < 0 || matchIndex < 0) return;
  const current = sanitizeTournamentData(page.tournament || {});
  if (!current.scores[roundIndex]?.[matchIndex]) return;
  current.scores[roundIndex][matchIndex][slot] = getTournamentScoreValue(input.value);
  page.tournament = sanitizeTournamentData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function getInlineTournamentLineListName(listName) {
  return listName === 'prizes' ? 'prizes' : 'highlights';
}

function getInlineTournamentSideCardListName(listName) {
  return listName === 'injuries' ? 'injuries' : 'candidates';
}

function addInlineTournamentLineRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentLineListName(listName);
  const fallbackText = safeList === 'prizes' ? 'Neue Ehrung' : 'Neuer Höhepunkt';
  current[safeList] = [...(current[safeList] || []), fallbackText];
  page.tournament = sanitizeTournamentData(current);
  renderPage(currentPage, 0);
}

function removeInlineTournamentLineRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentLineListName(listName);
  current[safeList] = (current[safeList] || []).filter((_, itemIndex) => itemIndex !== index);
  page.tournament = sanitizeTournamentData(current);
  renderPage(currentPage, 0);
}

function updateInlineTournamentLineField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.tournamentIndex || -1);
  if (index < 0) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentLineListName(input.dataset.tournamentList);
  current[safeList][index] = String(input.value || '').trim();
  page.tournament = sanitizeTournamentData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineTournamentSideCard(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentSideCardListName(listName);
  const fallbackCard = safeList === 'injuries'
    ? { name: 'Neuer Ausfall', detail: '', image: '', marker: '!' }
    : { name: 'Neuer Kandidat', detail: '', image: '', marker: '✦' };
  current[safeList] = [...(current[safeList] || []), fallbackCard];
  page.tournament = sanitizeTournamentData(current);
  renderPage(currentPage, 0);
}

function removeInlineTournamentSideCard(listName, index) {
  const page = getInlineDraftPage();
  if (!page || index < 0) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentSideCardListName(listName);
  current[safeList] = (current[safeList] || []).filter((_, itemIndex) => itemIndex !== index);
  page.tournament = sanitizeTournamentData(current);
  renderPage(currentPage, 0);
}

function updateInlineTournamentSideCardField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const index = Number(input.dataset.tournamentIndex || -1);
  const field = input.dataset.tournamentCardField;
  if (index < 0 || !['name', 'detail', 'image', 'marker'].includes(field)) return;
  const current = sanitizeTournamentData(page.tournament || {});
  const safeList = getInlineTournamentSideCardListName(input.dataset.tournamentList);
  const card = current[safeList][index] || {};
  card[field] = String(input.value || '').trim();
  current[safeList][index] = card;
  page.tournament = sanitizeTournamentData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function buildInlineTournamentParticipantsEditor(tournament) {
  const data = sanitizeTournamentData(tournament);
  return `
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
        <div class="tournament-participant-row">
          <span class="tournament-row-index">${index + 1}</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="name" value="${escapeHtml(participant.name)}" placeholder="Name">
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="title" value="${escapeHtml(participant.title)}" placeholder="Titel">
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="house" value="${escapeHtml(participant.house)}" placeholder="Haus">
          <input class="inline-edit-input" type="url" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="avatar" value="${escapeHtml(participant.avatar)}" placeholder="https://i.imgur.com/...">
          <input class="inline-edit-input" type="url" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="crest" value="${escapeHtml(participant.crest)}" placeholder="https://i.imgur.com/...">
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-participant-field" data-tournament-participant-index="${index}" data-tournament-participant-field="marks" value="${escapeHtml(participant.marks)}" placeholder="z.B. Schild">
        </div>`).join('')}
    </div>`;
}

function buildInlineTournamentScoresEditor(tournament) {
  const data = sanitizeTournamentData(tournament);
  const labels = getTournamentRoundLabels(data.bracketSize);
  return `
    <div class="tournament-score-editor">
      ${data.scores.map((round, roundIndex) => `
        <div class="tournament-score-round">
          <div class="inline-edit-kicker">${escapeHtml(labels[roundIndex] || `Runde ${roundIndex + 1}`)}</div>
          <div class="tournament-score-grid">
            ${round.map((pair, matchIndex) => `
              <div class="tournament-score-row">
                <span>Match ${matchIndex + 1}</span>
                <input class="inline-edit-input" type="number" min="0" step="1" data-inline-action="update-tournament-score-field" data-tournament-round-index="${roundIndex}" data-tournament-match-index="${matchIndex}" data-tournament-score-slot="left" value="${pair[0] == null ? '' : escapeHtml(pair[0])}">
                <span>:</span>
                <input class="inline-edit-input" type="number" min="0" step="1" data-inline-action="update-tournament-score-field" data-tournament-round-index="${roundIndex}" data-tournament-match-index="${matchIndex}" data-tournament-score-slot="right" value="${pair[1] == null ? '' : escapeHtml(pair[1])}">
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>`;
}

function buildInlineTournamentLineRows(items = [], listName = 'highlights') {
  const rows = Array.isArray(items) ? items : [];
  const safeList = getInlineTournamentLineListName(listName);
  const placeholder = safeList === 'prizes' ? 'Preis / Ehrung' : 'Höhepunkt';
  return rows.length ? rows.map((item, index) => `
    <div class="inline-stat-row module-simple-line-row">
      <input
        class="inline-edit-input"
        type="text"
        data-inline-action="update-tournament-line-field"
        data-tournament-list="${escapeHtml(safeList)}"
        data-tournament-index="${index}"
        value="${escapeHtml(item || '')}"
        placeholder="${placeholder}">
      <button
        class="module-editor-mini-btn module-editor-danger"
        type="button"
        data-inline-action="remove-tournament-line-row"
        data-tournament-list="${escapeHtml(safeList)}"
        data-tournament-index="${index}">Löschen</button>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
}

function buildInlineTournamentSideCards(items = [], listName = 'candidates') {
  const cards = Array.isArray(items) ? items : [];
  const safeList = getInlineTournamentSideCardListName(listName);
  const label = safeList === 'injuries' ? 'Ausfall' : 'Kandidat';
  const detailLabel = safeList === 'injuries' ? 'Notiz' : 'Detail';
  return cards.length ? cards.map((card, index) => `
    <div class="inline-profile-card">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${label} ${index + 1}</div>
        <button
          class="module-editor-mini-btn module-editor-danger"
          type="button"
          data-inline-action="remove-tournament-side-card"
          data-tournament-list="${escapeHtml(safeList)}"
          data-tournament-index="${index}">Löschen</button>
      </div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Name</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-side-card-field" data-tournament-list="${escapeHtml(safeList)}" data-tournament-index="${index}" data-tournament-card-field="name" value="${escapeHtml(card.name || '')}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Marker</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-side-card-field" data-tournament-list="${escapeHtml(safeList)}" data-tournament-index="${index}" data-tournament-card-field="marker" value="${escapeHtml(card.marker || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">${detailLabel}</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-side-card-field" data-tournament-list="${escapeHtml(safeList)}" data-tournament-index="${index}" data-tournament-card-field="detail" value="${escapeHtml(card.detail || '')}">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Bild / Wappen</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-tournament-side-card-field" data-tournament-list="${escapeHtml(safeList)}" data-tournament-index="${index}" data-tournament-card-field="image" value="${escapeHtml(card.image || '')}" placeholder="https://i.imgur.com/...">
        </div>
      </div>
    </div>`).join('') : '<div class="inline-placeholder-note">Noch keine Einträge vorhanden.</div>';
}

function buildInlineTournamentEditor(page) {
  const tournament = sanitizeTournamentData(page.tournament || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">Turnier</div>
        <div class="module-editor-preview-meta">${escapeHtml(getTournamentRoundLabels(tournament.bracketSize)[0] || 'Turnier')} · ${tournament.bracketSize} Teilnehmer</div>
      </div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Startphase / Turnierbaum</span>
          <select class="inline-edit-select" data-inline-action="update-tournament-field" data-tournament-field="bracketSize">
            <option value="32"${tournament.bracketSize === 32 ? ' selected' : ''}>Sechzehntelfinale / 32 Teilnehmer</option>
            <option value="16"${tournament.bracketSize === 16 ? ' selected' : ''}>Achtelfinale / 16 Teilnehmer</option>
            <option value="8"${tournament.bracketSize === 8 ? ' selected' : ''}>Viertelfinale / 8 Teilnehmer</option>
            <option value="4"${tournament.bracketSize === 4 ? ' selected' : ''}>Halbfinale / 4 Teilnehmer</option>
          </select>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Ort</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="location" value="${escapeHtml(tournament.location)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Datum</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="date" value="${escapeHtml(tournament.date)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Gastgeber</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="host" value="${escapeHtml(tournament.host)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Turnierleiter</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="organizer" value="${escapeHtml(tournament.organizer)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Regeln</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="rules" value="${escapeHtml(tournament.rules)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Teilnehmerinfo</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="participantSummary" value="${escapeHtml(tournament.participantSummary)}">
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Teilnehmer & Runden</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Teilnehmer</span>
          ${buildInlineTournamentParticipantsEditor(tournament)}
          <div class="inline-placeholder-note">Bild (Imgur) ist der Mini-Avatar im Turnierbaum. Wappen (Imgur) ist optional.</div>
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Runden-Scores</span>
          ${buildInlineTournamentScoresEditor(tournament)}
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Unterer Bereich</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field">
          <span class="inline-edit-label">Herold / Kommentarname</span>
          <input class="inline-edit-input" type="text" data-inline-action="update-tournament-field" data-tournament-field="heraldName" value="${escapeHtml(tournament.heraldName)}">
        </div>
        <div class="inline-edit-field">
          <span class="inline-edit-label">Herold-Avatar</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-tournament-field" data-tournament-field="heraldAvatar" value="${escapeHtml(tournament.heraldAvatar)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Herold-Kommentar</span>
          <textarea class="inline-edit-textarea" data-inline-action="update-tournament-field" data-tournament-field="heraldText">${escapeHtml(tournament.heraldText)}</textarea>
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Höhepunkte des Tages</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-tournament-line-row" data-tournament-list="highlights">+ Highlight</button>
          </div>
          <div class="inline-stat-editor">${buildInlineTournamentLineRows(tournament.highlights, 'highlights')}</div>
        </div>
        <div class="inline-edit-field wide">
          <span class="inline-edit-label">Bild unten rechts</span>
          <input class="inline-edit-input" type="url" data-inline-action="update-tournament-field" data-tournament-field="bottomImage" value="${escapeHtml(tournament.bottomImage)}" placeholder="https://i.imgur.com/...">
        </div>
        <div class="inline-edit-field wide">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Preise & Ehren</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-tournament-line-row" data-tournament-list="prizes">+ Preis</button>
          </div>
          <div class="inline-stat-editor">${buildInlineTournamentLineRows(tournament.prizes, 'prizes')}</div>
        </div>
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Sidebar</div>
      <div class="inline-edit-grid single">
        <div class="inline-edit-field">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Potenzielle Spitzenkandidaten</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-tournament-side-card" data-tournament-list="candidates">+ Kandidat</button>
          </div>
          <div class="inline-profile-card-editor">${buildInlineTournamentSideCards(tournament.candidates, 'candidates')}</div>
        </div>
        <div class="inline-edit-field">
          <div class="inline-edit-head">
            <span class="inline-edit-label">Verletzungen & Ausfälle</span>
            <button class="module-editor-mini-btn" type="button" data-inline-action="add-tournament-side-card" data-tournament-list="injuries">+ Ausfall</button>
          </div>
          <div class="inline-profile-card-editor">${buildInlineTournamentSideCards(tournament.injuries, 'injuries')}</div>
        </div>
      </div>
    </div>`;
}
