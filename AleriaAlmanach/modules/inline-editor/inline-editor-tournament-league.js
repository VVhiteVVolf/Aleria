// Inline editor tournament-league state and builder.
// Owns only tournament-league-page editing behavior.

function getInlineTournamentLeagueDataForEdit(page) {
  return sanitizeTournamentLeagueData(page?.tournamentLeague || {});
}

function updateInlineTournamentLeagueField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.tleagueField;
  if (!field) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  current[field] = String(input.value || '').trim();
  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTournamentLeagueListField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.tleagueList;
  if (!listName) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  const raw = getFormValue(input.closest('.inline-edit-field') || input.parentElement || document, `[data-tleague-list="${listName}"]`) || input.value;

  if (listName === 'standings') current.standings = parseTournamentLeagueStandingsTextarea(raw);
  else if (listName === 'matchups') current.matchups = parseTournamentLeagueMatchupsTextarea(raw);
  else if (['combatTypes', 'rumors', 'injuries', 'topHits', 'chronicle'].includes(listName)) {
    current[listName] = parseTournamentLeagueNotesTextarea(raw);
  }

  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTournamentLeagueHeaderField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const field = input.dataset.tleagueHeaderField;
  if (!field) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  current.tableHeaders[field] = String(input.value || '').trim();
  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function updateInlineTournamentLeagueRowField(input) {
  const page = getInlineDraftPage();
  if (!page) return;
  const listName = input.dataset.tleagueList;
  const index = Number(input.dataset.tleagueIndex || -1);
  const field = input.dataset.tleagueField;
  if (!listName || index < 0 || !field) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  const fallback = listName === 'standings'
    ? { rank: String(index + 1), crest: '', knight: '', house: '', wins: '', hits: '', honor: '', glory: '', status: 'Aktiv' }
    : listName === 'matchups'
      ? { label: `Begegnung ${index + 1}`, time: '', type: '', leftName: '', leftHouse: '', leftPortrait: '', leftCrest: '', rightName: '', rightHouse: '', rightPortrait: '', rightCrest: '' }
      : { title: '', text: '', icon: '', meta: '' };
  current[listName] = Array.isArray(current[listName]) ? current[listName] : [];
  const item = current[listName][index] || fallback;
  item[field] = String(input.value || '').trim();
  current[listName][index] = item;
  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  scheduleInlineModuleLivePreviewRefresh();
}

function addInlineTournamentLeagueRow(listName) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  if (listName === 'standings') {
    current.standings.push({ rank: String(current.standings.length + 1), crest: '', knight: 'Neuer Ritter', house: 'Haus', wins: '0', hits: '0', honor: '0', glory: '0', status: 'Aktiv' });
  } else if (listName === 'matchups') {
    current.matchups.push({ label: 'Neue Begegnung', time: '', type: 'Lanzenstechen', leftName: '', leftHouse: '', leftPortrait: '', leftCrest: '', rightName: '', rightHouse: '', rightPortrait: '', rightCrest: '' });
  } else if (['combatTypes', 'rumors', 'injuries', 'topHits', 'chronicle'].includes(listName)) {
    current[listName].push({ title: 'Eintrag', text: '', icon: '', meta: '' });
  }
  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  renderPage(currentPage, 0);
}

function removeInlineTournamentLeagueRow(listName, index) {
  const page = getInlineDraftPage();
  if (!page) return;
  const current = getInlineTournamentLeagueDataForEdit(page);
  if (Array.isArray(current[listName])) current[listName].splice(Number(index), 1);
  page.tournamentLeague = sanitizeTournamentLeagueData(current);
  renderPage(currentPage, 0);
}

function buildInlineTournamentLeagueEditor(page) {
  const league = getInlineTournamentLeagueDataForEdit(page);
  const scalarField = (label, field, type = 'text', wide = false) => `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <input class="inline-edit-input" type="${type}" data-inline-action="update-tleague-field" data-tleague-field="${field}" value="${escapeHtml(league[field] || '')}" ${type === 'url' ? 'placeholder="https://i.imgur.com/..."' : ''}>
    </div>`;
  const textField = (label, field, wide = true) => `
    <div class="inline-edit-field${wide ? ' wide' : ''}">
      <span class="inline-edit-label">${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea" data-inline-action="update-tleague-field" data-tleague-field="${field}">${escapeHtml(league[field] || '')}</textarea>
    </div>`;
  const rowListField = (label, listName, rowsHtml, buttonLabel) => `
    <div class="inline-edit-field wide">
      <div class="inline-edit-head">
        <div class="inline-edit-kicker">${escapeHtml(label)}</div>
        <button class="module-editor-mini-btn" type="button" data-inline-action="add-tleague-row" data-tleague-list="${escapeHtml(listName)}">+ ${escapeHtml(buttonLabel)}</button>
      </div>
      <div class="tleague-edit-list">${rowsHtml}</div>
    </div>`;
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Registerkopf</div>
      <div class="inline-edit-grid">
        ${scalarField('Registerzeile', 'archiveLabel', 'text', true)}
        ${scalarField('Saison', 'season')}
        ${scalarField('Jahreslauf', 'cycle')}
        ${scalarField('Runde', 'round')}
        ${scalarField('Naechster Spieltag', 'nextDate')}
        ${scalarField('Regel-Button', 'rulesLabel')}
        ${scalarField('Tabellenueberschrift', 'tableTitle')}
        ${scalarField('Matchup-Ueberschrift', 'matchupTitle')}
        ${scalarField('Versus-Text', 'matchupVersusLabel')}
        ${scalarField('Registrierungsnotiz', 'registeredNote', 'text', true)}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Tabellenspalten</div>
      <div class="tleague-edit-list">
        ${buildTournamentLeagueHeaderRows(league.tableHeaders, 'inline')}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Ligatabelle</div>
      ${rowListField('Rangliste', 'standings', buildTournamentLeagueStructuredRows(league.standings, 'standings', 'inline'), 'Ritter')}
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Matchups</div>
      ${rowListField('Naechste Begegnungen', 'matchups', buildTournamentLeagueStructuredRows(league.matchups, 'matchups', 'inline'), 'Begegnung')}
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Ritter der Woche</div>
      <div class="inline-edit-grid">
        ${scalarField('Sidebar-Titel', 'featuredTitle')}
        ${scalarField('Name', 'featuredName')}
        ${scalarField('Portrait-URL', 'featuredPortrait', 'url')}
        ${scalarField('Wappen-URL', 'featuredCrest', 'url')}
        ${textField('Kommentar', 'featuredComment')}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Sidebar-Listen</div>
      <div class="inline-edit-grid">
        ${scalarField('Kampfarten-Titel', 'combatTypesTitle')}
        ${scalarField('Verletzte-Titel', 'injuriesTitle')}
        ${rowListField('Kampfarten', 'combatTypes', buildTournamentLeagueStructuredRows(league.combatTypes, 'combatTypes', 'inline'), 'Kampfart')}
        ${rowListField('Verletzte & Abwesende', 'injuries', buildTournamentLeagueStructuredRows(league.injuries, 'injuries', 'inline'), 'Ausfall')}
        ${scalarField('Beste Treffer-Titel', 'topHitsTitle')}
        ${scalarField('Geruechte-Titel', 'rumorsTitle')}
        ${rowListField('Beste Treffer', 'topHits', buildTournamentLeagueStructuredRows(league.topHits, 'topHits', 'inline'), 'Treffer')}
        ${rowListField('Geruechte', 'rumors', buildTournamentLeagueStructuredRows(league.rumors, 'rumors', 'inline'), 'Geruecht')}
      </div>
    </div>
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Wetter, Ort & Chronik</div>
      <div class="inline-edit-grid">
        ${scalarField('Wetter-Titel', 'weatherTitle')}
        ${scalarField('Turnierplatz-Titel', 'locationTitle')}
        ${textField('Wettertext', 'weatherText')}
        ${scalarField('Turnierplatz-Bild', 'locationImage', 'url', true)}
        ${scalarField('Chronik-Titel', 'chronicleTitle')}
        ${scalarField('Fusszeile', 'footer')}
        ${rowListField('Chronik', 'chronicle', buildTournamentLeagueStructuredRows(league.chronicle, 'chronicle', 'inline'), 'Chronik')}
      </div>
    </div>`;
}
