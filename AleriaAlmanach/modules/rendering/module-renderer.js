function getModalImageLayout(page) {
  let imgW = 'calc((100vh - 70px) * 0.75)';
  let imgClass = 'modal-img-col';
  if (page?.imageSquare) {
    imgW = 'calc((100vh - 70px) * 1.0)';
    imgClass = 'modal-img-col square';
  } else if (page?.imageLandscape) {
    imgW = 'calc((100vh - 70px) * 2.0)';
    imgClass = 'modal-img-col landscape';
  } else if (page?.imageSemiLandscape) {
    imgW = '40%';
    imgClass = 'modal-img-col landscape';
  } else if (page?.imageTall) {
    imgW = 'calc((100vh - 70px) * 0.5)';
    imgClass = 'modal-img-col tall';
  }
  if (page?.imageWidth != null && page.imageWidth !== '') {
    imgW = `${Math.max(20, Math.min(70, Number(page.imageWidth) || 38))}%`;
  }
  return { imgW, imgClass };
}

function buildModalImageColumn(page, entry, inlineEditing = false) {
  if (!page?.image && !inlineEditing) return '';
  const { imgW, imgClass } = getModalImageLayout(page);
  const visual = page.image
    ? `<img src="${sanitizeImageSrc(page.image)}" alt="${escapeHtml(entry?.title || 'Modulbild')}" loading="eager" decoding="async" fetchpriority="high"${buildModuleImageElementAttrs(page, 'cover', 'center center')}>`
    : `<div class="card-placeholder-inner" style="flex:1;min-height:0;">🖼</div>`;
  return `
    <div class="${imgClass}" id="modal-img-col-el" style="width:${imgW};">
      ${visual}
      <div class="modal-img-stamp">${escapeHtml(entry?.stamp || 'BILDPLATZHALTER')}</div>
      ${inlineEditing ? buildInlineImagePanel(page) : ''}
    </div>
    <div class="modal-resizer" id="modal-resizer"></div>`;
}

function getModulePageImageFit(page, fallback = 'cover') {
  const value = String(page?.imageFit || '').trim();
  return ['cover', 'contain'].includes(value) ? value : fallback;
}

function getModulePageImagePosition(page, fallback = 'center top') {
  const value = String(page?.imagePosition || '').trim();
  const positions = {
    top: 'center top',
    center: 'center center',
    bottom: 'center bottom',
    left: 'left center',
    right: 'right center'
  };
  return positions[value] || fallback;
}

function buildModuleImageElementAttrs(page, fallbackFit = 'cover', fallbackPosition = 'center top', includeWidth = false) {
  const fit = getModulePageImageFit(page, fallbackFit);
  const position = getModulePageImagePosition(page, fallbackPosition);
  const styles = [`object-fit:${fit}`, `object-position:${position}`];
  if (includeWidth && page?.imageWidth != null && page.imageWidth !== '') {
    const width = Math.max(20, Math.min(100, Number(page.imageWidth) || 100));
    styles.push(`width:${width}%`, 'max-width:100%', 'margin-inline:auto');
  }
  return ` style="${styles.join(';')};"`;
}

function buildModuleImageFrameAttrs(page) {
  if (page?.imageWidth == null || page.imageWidth === '') return '';
  const maxWidth = page?.castePage ? 160 : 100;
  const width = Math.max(20, Math.min(maxWidth, Number(page.imageWidth) || 100));
  const maxWidthRule = width > 100 ? 'none' : '100%';
  return ` style="width:${width}%;max-width:${maxWidthRule};margin-inline:auto;"`;
}

function buildInlineModulePreview(page, entry, pageIndex, total) {
  const previewEntry = sanitizeModuleEntry({
    ...deepClone(entry),
    id: `inline-preview-${entry?.id || 'module'}`,
    appendCommentsPage: false,
    multipage: true
  });
  const previewPage = deepClone(page);
  return buildPage(previewPage, previewEntry, pageIndex, total)
    .replace(/\s(?:id|onclick)="[^"]*"/g, '');
}

function buildInlineModuleWorkspace(editorHtml, page, entry, pageIndex, total, extraEditorHtml = '') {
  const splitPercent = getInlineModuleSplitPercent();
  return `
    <div class="inline-module-workspace" style="--inline-edit-width:${splitPercent}%;">
      <div class="inline-module-edit-pane">
        <div class="modal-text-inner">
          ${editorHtml}
          ${buildInlineImagePanel(page)}
          ${extraEditorHtml}
        </div>
      </div>
      <div class="inline-module-splitter" role="separator" aria-orientation="vertical" aria-valuemin="24" aria-valuemax="76" aria-valuenow="${splitPercent}" tabindex="0" title="Editor und Live-Vorschau verschieben"></div>
      <div class="inline-module-preview-pane">
        <div class="inline-module-preview-head">
          <div class="inline-edit-kicker">Live-Vorschau</div>
          <div class="module-editor-preview-meta">Seite ${pageIndex + 1} von ${total}</div>
        </div>
        <div class="inline-module-preview-stage">
          <div class="inline-module-preview-frame">
            ${buildInlineModulePreview(page, entry, pageIndex, total)}
          </div>
        </div>
      </div>
    </div>`;
}

function getTournamentRounds(tournament) {
  const data = sanitizeTournamentData(tournament);
  const labels = getTournamentRoundLabels(data.bracketSize);
  let pool = data.participants.slice();
  return labels.map((label, roundIndex) => {
    const matches = [];
    const scoreRow = data.scores[roundIndex] || [];
    for (let i = 0; i < pool.length; i += 2) {
      const left = pool[i] || sanitizeTournamentParticipant({}, i);
      const right = pool[i + 1] || sanitizeTournamentParticipant({}, i + 1);
      const scores = scoreRow[i / 2] || [null, null];
      const leftScore = scores[0];
      const rightScore = scores[1];
      const leftWins = leftScore != null && rightScore != null ? Number(leftScore) >= Number(rightScore) : true;
      const winner = leftWins ? left : right;
      matches.push({ left, right, leftScore, rightScore, winner });
    }
    pool = matches.map(match => match.winner);
    return { label, matches };
  });
}

function buildTournamentFighter(person, score) {
  const avatar = sanitizeImageSrc(person.avatar || '');
  const crest = sanitizeImageSrc(person.crest || '');
  const marks = String(person.marks || '').trim();
  return `
    <div class="tournament-fighter">
      ${avatar ? `<img class="tournament-avatar" src="${avatar}" alt="${escapeHtml(person.name)}" loading="lazy" decoding="async">` : `<div class="tournament-avatar placeholder">${getInitialChar(person.name)}</div>`}
      <div class="tournament-fighter-main">
        <div class="tournament-name">${escapeHtml(person.name || 'Unbenannt')}</div>
        <div class="tournament-title">${escapeHtml(person.title || person.house || '')}</div>
        ${person.house ? `<div class="tournament-house">${escapeHtml(person.house)}</div>` : ''}
      </div>
      ${crest ? `<img class="tournament-crest" src="${crest}" alt="" loading="lazy" decoding="async">` : ''}
      ${marks ? `<div class="tournament-marks">${escapeHtml(marks)}</div>` : ''}
      <div class="tournament-score">${score == null ? '-' : escapeHtml(score)}</div>
    </div>`;
}

function buildTournamentCardList(items, emptyText = 'Noch keine Einträge.') {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return `<div class="tournament-empty">${escapeHtml(emptyText)}</div>`;
  return list.map(item => {
    const image = sanitizeImageSrc(item.image || '');
    return `
      <div class="tournament-side-card">
        ${image ? `<img src="${image}" alt="" loading="lazy" decoding="async">` : `<div class="tournament-side-icon">${escapeHtml(item.marker || '✦')}</div>`}
        <div>
          <strong>${escapeHtml(item.name || 'Unbenannt')}</strong>
          <span>${escapeHtml(item.detail || '')}</span>
        </div>
        ${item.marker ? `<em>${escapeHtml(item.marker)}</em>` : ''}
      </div>`;
  }).join('');
}

function buildTournamentPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeTournamentData(page.tournament || {});
  const rounds = getTournamentRounds(data);
  const heraldAvatar = sanitizeImageSrc(data.heraldAvatar || '');
  const bottomImage = sanitizeImageSrc(data.bottomImage || page.image || '');
  const infoRows = [
    ['Ort', data.location],
    ['Datum', data.date],
    ['Veranstalter', data.host],
    ['Turnierleiter', data.organizer],
    ['Regeln', data.rules],
    ['Teilnehmer', data.participantSummary]
  ].filter(([, value]) => String(value || '').trim());
  return `
    ${nav}
    <div class="tournament-page">
      <div class="tournament-main">
        <div class="tournament-round-title">✦ ${escapeHtml(rounds[0]?.label || 'Turnier')} ✦</div>
        <div class="tournament-bracket" style="--round-count:${rounds.length};">
          ${rounds.map((round, roundIndex) => `
            <div class="tournament-round" style="--round-index:${roundIndex};">
              <div class="tournament-round-label">${escapeHtml(round.label)}</div>
              <div class="tournament-match-list">
                ${round.matches.map(match => `
                  <div class="tournament-match">
                    ${buildTournamentFighter(match.left, match.leftScore)}
                    ${buildTournamentFighter(match.right, match.rightScore)}
                  </div>`).join('')}
              </div>
            </div>`).join('')}
        </div>
      </div>
      <aside class="tournament-sidebar">
        <div class="tournament-side-section">
          <div class="tournament-side-title">Turnierinformationen</div>
          ${infoRows.map(([label, value]) => `<div class="tournament-info-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
        </div>
        <div class="tournament-side-section accent">
          <div class="tournament-side-title">Potenzielle Spitzenkandidaten</div>
          ${buildTournamentCardList(data.candidates)}
        </div>
        <div class="tournament-side-section">
          <div class="tournament-side-title">Verletzungen & Ausfälle</div>
          ${buildTournamentCardList(data.injuries)}
        </div>
      </aside>
      <div class="tournament-footer">
        <div class="tournament-herald">
          ${heraldAvatar ? `<img src="${heraldAvatar}" alt="${escapeHtml(data.heraldName)}" loading="lazy" decoding="async">` : `<div class="tournament-avatar placeholder">${getInitialChar(data.heraldName)}</div>`}
          <div>
            <div class="tournament-side-title">${escapeHtml(data.heraldName || 'Kommentar des Herolds')}</div>
            <p>${escapeHtml(data.heraldText || '')}</p>
          </div>
        </div>
        <div class="tournament-list-block">
          <div class="tournament-side-title">Höhepunkte des Tages</div>
          <ul>${data.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
        ${bottomImage ? `<img class="tournament-bottom-image" src="${bottomImage}" alt="" loading="lazy" decoding="async">` : ''}
        <div class="tournament-list-block">
          <div class="tournament-side-title">Preise & Ehren</div>
          <ul>${data.prizes.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`;
}

function buildTournamentLeagueImage(src, className, fallback = '✦', alt = '') {
  const image = sanitizeImageSrc(src || '');
  return image
    ? `<img class="${className}" src="${image}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`
    : `<div class="${className} placeholder">${escapeHtml(fallback)}</div>`;
}

function getTournamentLeagueStatusClass(status = '') {
  const value = String(status || '').toLowerCase();
  if (value.includes('verletzt')) return 'injured';
  if (value.includes('gesperrt')) return 'blocked';
  if (value.includes('abwesend')) return 'absent';
  return 'active';
}

function buildTournamentLeagueNoteList(items = [], className = '') {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return `<div class="tleague-empty">Noch keine Einträge.</div>`;
  return list.map(item => `
    <div class="tleague-note ${className}">
      ${buildTournamentLeagueImage(item.icon, 'tleague-note-icon', '✦', item.title)}
      <div>
        <strong>${escapeHtml(item.title || 'Eintrag')}</strong>
        ${item.text ? `<span>${sanitizeContentHtml(item.text)}</span>` : ''}
      </div>
      ${item.meta ? `<em>${escapeHtml(item.meta)}</em>` : ''}
    </div>`).join('');
}

function buildTournamentLeaguePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeTournamentLeagueData(page.tournamentLeague || {});
  const crest = sanitizeImageSrc(entry.symbol || page.image || data.featuredCrest || '');
  const standings = data.standings.map(row => `
    <tr>
      <td class="rank">${escapeHtml(row.rank)}</td>
      <td>${buildTournamentLeagueImage(row.crest, 'tleague-crest', '◆', row.house)}</td>
      <td class="knight">${escapeHtml(row.knight)}</td>
      <td>${escapeHtml(row.house)}</td>
      <td>${escapeHtml(row.wins)}</td>
      <td>${escapeHtml(row.hits)}</td>
      <td>${escapeHtml(row.honor)}</td>
      <td>${escapeHtml(row.glory)}</td>
      <td><span class="tleague-status ${getTournamentLeagueStatusClass(row.status)}">${escapeHtml(row.status || 'Aktiv')}</span></td>
    </tr>`).join('');
  const matchups = data.matchups.map(match => `
    <article class="tleague-matchup">
      <div class="tleague-matchup-head"><span>${escapeHtml(match.label)}</span><strong>${escapeHtml(match.time)}</strong></div>
      <div class="tleague-fighters">
        <div class="tleague-fighter">
          ${buildTournamentLeagueImage(match.leftPortrait, 'tleague-fighter-portrait', getInitialChar(match.leftName), match.leftName)}
          ${buildTournamentLeagueImage(match.leftCrest, 'tleague-fighter-crest', '◆', match.leftHouse)}
          <strong>${escapeHtml(match.leftName)}</strong>
          <span>${escapeHtml(match.leftHouse)}</span>
        </div>
        <div class="tleague-versus">${escapeHtml(data.matchupVersusLabel || 'VS.')}</div>
        <div class="tleague-fighter">
          ${buildTournamentLeagueImage(match.rightPortrait, 'tleague-fighter-portrait', getInitialChar(match.rightName), match.rightName)}
          ${buildTournamentLeagueImage(match.rightCrest, 'tleague-fighter-crest', '◆', match.rightHouse)}
          <strong>${escapeHtml(match.rightName)}</strong>
          <span>${escapeHtml(match.rightHouse)}</span>
        </div>
      </div>
      ${match.type ? `<div class="tleague-match-type">${escapeHtml(match.type)}</div>` : ''}
    </article>`).join('');
  const locationImage = sanitizeImageSrc(data.locationImage || '');
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `
    ${nav}
    <div class="tleague-page">
      <header class="tleague-header">
        <div class="tleague-title-block">
          ${crest ? `<img class="tleague-header-crest" src="${crest}" alt="" loading="lazy" decoding="async">` : `<div class="tleague-header-crest placeholder">◆</div>`}
          <div>
            <h2>${escapeHtml(entry.title || data.archiveLabel)}</h2>
            <p>${escapeHtml(entry.subtitle || data.archiveLabel)}</p>
          </div>
        </div>
        <div class="tleague-season-block">
          <strong>${escapeHtml(data.season)}</strong>
          <span>${escapeHtml(data.cycle)}</span>
        </div>
        <div class="tleague-round-block">
          <strong>${escapeHtml(data.round)}</strong>
          <span>${escapeHtml(data.nextDate)}</span>
          ${data.rulesLabel ? `<button type="button">${escapeHtml(data.rulesLabel)}</button>` : ''}
        </div>
      </header>
      <div class="tleague-body">
        <main class="tleague-main">
          <section class="tleague-table-section">
            <h3>${escapeHtml(data.tableTitle)}</h3>
            <div class="tleague-table-wrap">
              <table class="tleague-table">
                <thead>
                  <tr>
                    <th>${escapeHtml(data.tableHeaders.rank)}</th>
                    <th>${escapeHtml(data.tableHeaders.crest)}</th>
                    <th>${escapeHtml(data.tableHeaders.knight)}</th>
                    <th>${escapeHtml(data.tableHeaders.house)}</th>
                    <th>${escapeHtml(data.tableHeaders.wins)}</th>
                    <th>${escapeHtml(data.tableHeaders.hits)}</th>
                    <th>${escapeHtml(data.tableHeaders.honor)}</th>
                    <th>${escapeHtml(data.tableHeaders.glory)}</th>
                    <th>${escapeHtml(data.tableHeaders.status)}</th>
                  </tr>
                </thead>
                <tbody>${standings}</tbody>
              </table>
            </div>
            ${data.registeredNote ? `<p class="tleague-registered-note">— ${escapeHtml(data.registeredNote)} —</p>` : ''}
          </section>
          <section class="tleague-matchups-section">
            <h3>${escapeHtml(data.matchupTitle)}</h3>
            <div class="tleague-matchup-grid">${matchups}</div>
          </section>
          <section class="tleague-chronicle">
            <h3>${escapeHtml(data.chronicleTitle)}</h3>
            <div class="tleague-chronicle-grid">${buildTournamentLeagueNoteList(data.chronicle, 'chronicle')}</div>
          </section>
        </main>
        <aside class="tleague-sidebar">
          <section class="tleague-side-section featured">
            <h3>${escapeHtml(data.featuredTitle)}</h3>
            <div class="tleague-featured-art">
              ${buildTournamentLeagueImage(data.featuredPortrait, 'tleague-featured-portrait', getInitialChar(data.featuredName), data.featuredName)}
              ${buildTournamentLeagueImage(data.featuredCrest, 'tleague-featured-crest', '◆', data.featuredName)}
            </div>
            <strong>${escapeHtml(data.featuredName)}</strong>
            ${data.featuredComment ? `<p>${sanitizeContentHtml(data.featuredComment)}</p>` : ''}
          </section>
          <section class="tleague-side-section"><h3>${escapeHtml(data.combatTypesTitle)}</h3>${buildTournamentLeagueNoteList(data.combatTypes, 'combat')}</section>
          <section class="tleague-side-section injuries"><h3>${escapeHtml(data.injuriesTitle)}</h3>${buildTournamentLeagueNoteList(data.injuries, 'injury')}</section>
          <div class="tleague-side-grid">
            <section class="tleague-side-section"><h3>${escapeHtml(data.topHitsTitle)}</h3>${buildTournamentLeagueNoteList(data.topHits, 'hits')}</section>
            <section class="tleague-side-section"><h3>${escapeHtml(data.rumorsTitle)}</h3>${buildTournamentLeagueNoteList(data.rumors, 'rumor')}</section>
          </div>
          <div class="tleague-side-grid">
            <section class="tleague-side-section weather"><h3>${escapeHtml(data.weatherTitle)}</h3><p>${sanitizeContentHtml(data.weatherText)}</p></section>
            <section class="tleague-side-section location"><h3>${escapeHtml(data.locationTitle)}</h3>${locationImage ? `<img src="${locationImage}" alt="${escapeHtml(data.locationTitle)}" loading="lazy" decoding="async">` : '<div class="tleague-location-placeholder">Karte</div>'}</section>
          </div>
          ${data.footer ? `<div class="tleague-footer">${escapeHtml(data.footer)}</div>` : ''}
        </aside>
      </div>
    </div>
    ${sym}`;
}

function buildBiographyHeading(title) {
  return `<h3 class="biography-section-title">${escapeHtml(title || '')}<span></span></h3>`;
}

function buildBiographyLines(items = [], className = '') {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) return '';
  return `<ul class="biography-list ${className}">${list.map(item => `<li>${sanitizeContentHtml(item)}</li>`).join('')}</ul>`;
}

function buildBiographyDocuments(items = []) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '';
  return `<ul class="biography-list documents">${list.map(item => {
    const text = item?.text || '';
    const link = sanitizeHref(item?.link || '');
    const content = link
      ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${escapeHtml(text || link)}</a>`
      : escapeHtml(text);
    return `<li>${content}</li>`;
  }).join('')}</ul>`;
}

function buildBiographyPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeBiographyData(page.biography || {});
  const image = sanitizeImageSrc(page.image || '');
  const stats = Array.isArray(page.stats) ? page.stats : [];
  const quote = page.quote ? `
    <div class="biography-quote-card">
      <div class="biography-quote-mark">“</div>
      <div>${sanitizeContentHtml(page.quote)}</div>
      ${page.quoteBy ? `<span>${escapeHtml(page.quoteBy)}</span>` : ''}
    </div>` : '';
  const abilities = data.abilities.length ? `
    <div class="biography-ability-list">
      ${data.abilities.map(item => `
        <div class="biography-ability">
          <div class="biography-ability-icon">${escapeHtml(item.icon || '✦')}</div>
          <div><strong>${escapeHtml(item.title || '')}</strong><span>${escapeHtml(item.detail || '')}</span></div>
        </div>`).join('')}
    </div>` : '';
  const connections = data.connections.length ? `
    <div class="biography-connections">
      ${data.connections.map(item => `
        <div class="biography-connection">
          ${item.image ? `<img src="${sanitizeImageSrc(item.image)}" alt="" loading="lazy" decoding="async">` : `<div class="biography-connection-placeholder">${getInitialChar(item.name)}</div>`}
          <div><strong>${escapeHtml(item.name || '')}</strong><span>${escapeHtml(item.detail || '')}</span></div>
        </div>`).join('')}
    </div>` : '';
  return `
    ${nav}
    <div class="biography-page">
      <aside class="biography-left">
        ${image ? `<img class="biography-portrait" src="${image}" alt="${escapeHtml(entry.title || '')}" loading="eager" decoding="async" fetchpriority="high"${buildModuleImageElementAttrs(page, 'cover', 'center top', true)}>` : `<div class="biography-portrait placeholder">${getInitialChar(entry.title)}</div>`}
        ${stats.length ? `
          <div class="biography-info-table">
            <div class="biography-side-label">Infotabelle</div>
            ${stats.map(([label, value]) => `
              <div class="biography-info-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
          </div>` : ''}
        ${quote}
      </aside>
      <main class="biography-main">
        ${buildBiographyHeading(data.biographyTitle)}
        <div class="biography-copy">${sanitizeContentHtml(data.biographyText || page.description || '')}</div>
        ${buildBiographyHeading(data.abilitiesTitle)}
        ${abilities}
        ${buildBiographyHeading(data.historyTitle)}
        <div class="biography-copy">${sanitizeContentHtml(data.historyText || '')}</div>
        ${buildBiographyHeading(data.worksTitle)}
        ${buildBiographyLines(data.works, 'compact')}
      </main>
      <aside class="biography-right">
        ${buildBiographyHeading(data.triviaTitle)}
        ${buildBiographyLines(data.trivia)}
        ${buildBiographyHeading(data.quotesTitle)}
        ${buildBiographyLines(data.quotes, 'quotes')}
        ${buildBiographyHeading(data.connectionsTitle)}
        ${connections}
        ${buildBiographyHeading(data.documentsTitle)}
        ${buildBiographyDocuments(data.documents)}
      </aside>
      ${data.footer ? `<div class="biography-footer">${escapeHtml(data.footer)}</div>` : ''}
    </div>`;
}

function buildBestiaryPanel(title, body, className = '') {
  if (!String(body || '').trim()) return '';
  return `
    <section class="bestiary-panel ${className}">
      <div class="bestiary-panel-title">${escapeHtml(title || '')}</div>
      ${body}
    </section>`;
}

function buildBestiaryStats(stats = []) {
  const rows = sanitizeStatsArray(stats);
  if (!rows.length) return '';
  return `
    <div class="bestiary-fact-list">
      ${rows.map(([label, value]) => `
        <div class="bestiary-fact-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>`).join('')}
    </div>`;
}

function buildBestiaryAnatomyList(items = []) {
  const list = sanitizeBestiaryAnatomy(items);
  if (!list.length) return '';
  return `
    <ol class="bestiary-anatomy-list">
      ${list.map(item => `
        <li>
          <span class="bestiary-number">${escapeHtml(item.number)}</span>
          <div>
            <strong>${escapeHtml(item.title || 'Merkmal')}</strong>
            ${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ''}
          </div>
        </li>`).join('')}
    </ol>`;
}

function buildBestiaryWeaknessList(items = []) {
  const list = sanitizeBestiaryWeaknesses(items);
  if (!list.length) return '';
  return `<ul class="bestiary-weakness-list">${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function buildBestiaryPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeBestiaryData(page.bestiary || {});
  const image = sanitizeImageSrc(page.image || '');
  const background = sanitizeStyleUrl(data.backgroundImage || '');
  const quotePortrait = sanitizeImageSrc(data.quotePortrait || '');
  const sheetStyle = [
    background ? `--bestiary-bg:url('${background}')` : '',
    `--bestiary-image-scale:${data.imageScale / 100}`,
    `--bestiary-image-x:${data.imageX}%`,
    `--bestiary-image-y:${data.imageY}%`
  ].filter(Boolean).join(';');
  const authorPanel = buildBestiaryPanel(
    data.authorNoteTitle,
    data.authorNote ? `<p>${escapeHtml(data.authorNote)}</p>` : '',
    'author'
  );
  const factsPanel = buildBestiaryPanel('Kenndaten', buildBestiaryStats(page.stats), 'facts');
  const anatomyPanel = buildBestiaryPanel(data.anatomyTitle, buildBestiaryAnatomyList(data.anatomy), 'anatomy');
  const weaknessesPanel = buildBestiaryPanel(data.weaknessesTitle, buildBestiaryWeaknessList(data.weaknesses), 'weaknesses');
  const quotePanel = page.quote ? `
    <section class="bestiary-panel quote">
      <div class="bestiary-panel-title">${escapeHtml(data.quoteTitle)}</div>
      <div class="bestiary-quote-body">
        <blockquote>${sanitizeContentHtml(page.quote)}</blockquote>
        ${page.quoteBy ? `<cite>${escapeHtml(page.quoteBy)}</cite>` : ''}
        ${quotePortrait ? `<img src="${quotePortrait}" alt="" loading="lazy" decoding="async">` : ''}
      </div>
    </section>` : '';

  return `
    ${nav}
    <div class="bestiary-page" style="${sheetStyle}">
      <div class="bestiary-left">
        <div class="bestiary-class">${escapeHtml(data.classification)}</div>
        <h2>${escapeHtml(entry.title || 'Bestiarium')}</h2>
        ${data.latinName ? `<div class="bestiary-latin">${escapeHtml(data.latinName)}</div>` : ''}
        ${page.description ? `<div class="bestiary-description">${sanitizeContentHtml(page.description)}</div>` : ''}
        ${factsPanel}
        ${authorPanel}
      </div>
      <div class="bestiary-figure-stage">
        <div class="bestiary-volume">
          <span>${escapeHtml(data.volume)}</span>
          <span>${escapeHtml(data.chapter)}</span>
        </div>
        ${data.sideNote ? `<div class="bestiary-side-note">${escapeHtml(data.sideNote)}</div>` : ''}
        <div class="bestiary-figure">
          ${image
            ? `<img src="${image}" alt="${escapeHtml(entry.title || 'Bestiarium-Bild')}" loading="eager" decoding="async" fetchpriority="high">`
            : `<div class="bestiary-figure-placeholder">Bildplatzhalter</div>`}
          ${data.annotations.map(item => `
            <div class="bestiary-marker" style="--x:${item.x}%;--y:${item.y}%">
              <span>${escapeHtml(item.number)}</span>
              ${item.text ? `<em>${escapeHtml(item.text)}</em>` : ''}
            </div>`).join('')}
        </div>
      </div>
      <aside class="bestiary-right">
        ${anatomyPanel}
        ${weaknessesPanel}
        ${quotePanel}
      </aside>
      ${data.footer ? `<div class="bestiary-footer">${escapeHtml(data.footer)}</div>` : ''}
    </div>`;
}

function renderQuestFileText(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map(part => `<p>${escapeHtml(part.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function buildQuestFileInfoTable(stats = []) {
  const rows = sanitizeStatsArray(stats);
  if (!rows.length) return '';
  return `
    <div class="quest-file-info-table">
      ${rows.map(([label, value]) => `
        <div class="quest-file-info-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>`).join('')}
    </div>`;
}

function buildQuestFileBulletRows(items = []) {
  const rows = sanitizeQuestFileRows(items);
  if (!rows.length) return '';
  return `
    <ul class="quest-file-bullets">
      ${rows.map(item => `
        <li>
          <strong>${escapeHtml(item.title || 'Eintrag')}</strong>
          ${item.detail ? `<span>${escapeHtml(item.detail)}</span>` : ''}
        </li>`).join('')}
    </ul>`;
}

function buildQuestFileContacts(items = []) {
  const contacts = sanitizeQuestContacts(items);
  if (!contacts.length) return '';
  return contacts.map(contact => {
    const image = sanitizeImageSrc(contact.image || '');
    return `
      <div class="quest-file-contact">
        ${image
          ? `<img src="${image}" alt="${escapeHtml(contact.name || 'Kontakt')}" loading="lazy" decoding="async">`
          : `<div class="quest-file-contact-placeholder">${getInitialChar(contact.name || 'K')}</div>`}
        <div>
          <strong>${escapeHtml(contact.name || 'Unbenannt')}</strong>
          ${contact.title ? `<span>${escapeHtml(contact.title)}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function buildQuestFileRewards(items = []) {
  const rewards = sanitizeQuestRewards(items);
  if (!rewards.length) return '';
  return rewards.map(reward => {
    const image = sanitizeImageSrc(reward.image || '');
    return `
      <div class="quest-file-reward">
        ${image
          ? `<img src="${image}" alt="" loading="lazy" decoding="async">`
          : `<div class="quest-file-reward-placeholder">+</div>`}
        <div>
          <strong>${escapeHtml(reward.title || 'Belohnung')}</strong>
          ${reward.detail ? `<span>${escapeHtml(reward.detail)}</span>` : ''}
        </div>
      </div>`;
  }).join('');
}

function buildQuestFileSidebarBlock(title, body, className = '') {
  if (!String(body || '').trim()) return '';
  return `
    <section class="quest-file-sidebar-block ${className}">
      <h3>${escapeHtml(title || '')}</h3>
      ${body}
    </section>`;
}

function buildQuestFilePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeQuestFileData(page.questFile || {});
  const heroImage = sanitizeImageSrc(page.image || '');
  const bannerImage = sanitizeImageSrc(data.bannerImage || '');
  const crestImage = sanitizeImageSrc(data.crestImage || '');
  const clientPortrait = sanitizeImageSrc(data.clientPortrait || '');
  const sketchImage = sanitizeImageSrc(data.sketchImage || '');
  const infoTable = buildQuestFileInfoTable(page.stats);
  const contactsBlock = buildQuestFileSidebarBlock(data.contactsTitle, buildQuestFileContacts(data.contacts), 'contacts');
  const triviaBlock = buildQuestFileSidebarBlock(data.triviaTitle, buildQuestFileBulletRows(data.trivia), 'trivia');
  const rewardsBlock = buildQuestFileSidebarBlock(data.rewardsTitle, buildQuestFileRewards(data.rewards), 'rewards');
  const noteBlock = buildQuestFileSidebarBlock(data.noteTitle, renderQuestFileText(data.note), 'note');

  return `
    ${nav}
    <div class="quest-file-page">
      ${bannerImage ? `<img class="quest-file-banner" src="${bannerImage}" alt="" loading="lazy" decoding="async">` : ''}
      <header class="quest-file-header">
        <div>
          ${data.archiveLabel ? `<div class="quest-file-archive">${escapeHtml(data.archiveLabel)}</div>` : ''}
          <h2>${escapeHtml(entry.title || 'Questakte')}</h2>
          ${entry.subtitle || page.pageTitle ? `<p>${escapeHtml(entry.subtitle || page.pageTitle || '')}</p>` : ''}
        </div>
        ${data.confidentiality ? `<div class="quest-file-confidentiality">${escapeHtml(data.confidentiality)}</div>` : ''}
      </header>
      <div class="quest-file-layout">
        <aside class="quest-file-left-panel">
          <div class="quest-file-hero-image"${buildModuleImageFrameAttrs(page)}>
            ${heroImage
              ? `<img src="${heroImage}" alt="${escapeHtml(entry.title || 'Questbild')}" loading="eager" decoding="async" fetchpriority="high"${buildModuleImageElementAttrs(page, 'cover', 'center top')}>`
              : `<div class="quest-file-image-placeholder">Bildplatzhalter</div>`}
          </div>
          <div class="quest-file-separator"></div>
          <section class="quest-file-client-card">
            <div class="quest-file-client-head">
              ${clientPortrait
                ? `<img class="quest-file-client-portrait" src="${clientPortrait}" alt="${escapeHtml(data.clientName || 'Auftraggeber')}" loading="lazy" decoding="async">`
                : `<div class="quest-file-client-portrait placeholder">${getInitialChar(data.clientName || 'A')}</div>`}
              <div class="quest-file-client-meta">
                <strong>${escapeHtml(data.clientName || 'Auftraggeber')}</strong>
                ${data.clientTitle ? `<span>${escapeHtml(data.clientTitle)}</span>` : ''}
              </div>
              ${crestImage ? `<img class="quest-file-crest" src="${crestImage}" alt="" loading="lazy" decoding="async">` : ''}
            </div>
            ${infoTable}
            ${data.clientNote ? `<div class="quest-file-client-note">${renderQuestFileText(data.clientNote)}</div>` : ''}
          </section>
        </aside>
        <main class="quest-file-center">
          <section class="quest-file-center-section primary">
            <h3>${escapeHtml(data.sectionOneTitle)}</h3>
            ${renderQuestFileText(data.sectionOneText)}
          </section>
          ${sketchImage ? `
            <figure class="quest-file-sketch">
              <img src="${sketchImage}" alt="" loading="lazy" decoding="async">
            </figure>` : ''}
          <section class="quest-file-center-section">
            <h3>${escapeHtml(data.sectionTwoTitle)}</h3>
            ${renderQuestFileText(data.sectionTwoText)}
          </section>
          <section class="quest-file-center-section objectives">
            <h3>${escapeHtml(data.sectionThreeTitle)}</h3>
            ${buildQuestFileBulletRows(data.sectionThreeItems)}
          </section>
        </main>
        <aside class="quest-file-right-panel">
          ${contactsBlock}
          ${triviaBlock}
          ${rewardsBlock}
          ${noteBlock}
        </aside>
      </div>
      ${data.footer ? `<div class="quest-file-footer">${escapeHtml(data.footer)}</div>` : ''}
    </div>`;
}

// ── BUILD PAGE HTML ────────────────────────────────────────────────────────────
function buildCasteImageOrMark(src, text, className, fallback = '*') {
  const image = sanitizeImageSrc(src || '');
  if (image) {
    return `<img class="${className}" src="${image}" alt="" loading="lazy" decoding="async">`;
  }
  return `<div class="${className} placeholder">${escapeHtml(String(text || '').trim().charAt(0) || fallback)}</div>`;
}

function getCasteInternalTargetId(target = '') {
  const value = String(target || '').trim();
  if (!value) return '';
  const normalized = value.startsWith('#') ? value.slice(1) : value;
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : '';
}

function buildCasteLinkedBlock(target, innerHtml, className = '') {
  const internalId = getCasteInternalTargetId(target);
  if (internalId) {
    return `<button class="${className}" type="button" data-archive-action="open-entry" data-entry-id="${escapeHtml(internalId)}">${innerHtml}</button>`;
  }
  const href = sanitizeHref(target || '');
  if (!href) return `<div class="${className}">${innerHtml}</div>`;
  const externalAttrs = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="${className}" href="${href}"${externalAttrs}>${innerHtml}</a>`;
}

function buildCastePanel(title, body, className = '') {
  const content = String(body || '').trim();
  if (!content) return '';
  return `
    <section class="caste-panel ${className}">
      ${title ? `<h3>${escapeHtml(title)}</h3>` : ''}
      ${content}
    </section>`;
}

function buildCasteInfoRows(rows) {
  const list = sanitizeCasteInfoRows(rows || []);
  if (!list.length) return '';
  return `<div class="caste-info-list">${list.map(row => `
    <div class="caste-info-row">
      ${buildCasteImageOrMark(row.icon, row.label, 'caste-info-icon', '+')}
      <span>${escapeHtml(row.label)}</span>
      <strong>${escapeHtml(row.value)}</strong>
    </div>`).join('')}</div>`;
}

function buildCasteSymbolCards(items) {
  const list = sanitizeCasteSymbols(items || []);
  if (!list.length) return '';
  return `<div class="caste-symbol-grid">${list.map(item => buildCasteLinkedBlock(item.target, `
      ${buildCasteImageOrMark(item.icon, item.name, 'caste-symbol-icon', '*')}
      <strong>${escapeHtml(item.name)}</strong>
      ${item.meaning ? `<span>${escapeHtml(item.meaning)}</span>` : ''}
    `, 'caste-symbol-card')).join('')}</div>`;
}

function buildCasteRoleCards(items) {
  const list = sanitizeCasteCards(items || []);
  if (!list.length) return '';
  return `<div class="caste-role-grid">${list.map(item => `
    <article class="caste-role-card">
      ${buildCasteImageOrMark(item.icon, item.title, 'caste-role-icon', '*')}
      <h4>${escapeHtml(item.title)}</h4>
      ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
    </article>`).join('')}</div>`;
}

function buildCasteTextList(items) {
  const list = sanitizeCasteTextRows(items || []);
  if (!list.length) return '';
  return `<ul class="caste-text-list">${list.map(item => {
    const icon = sanitizeImageSrc(item.icon || '');
    return `<li>${icon ? `<img src="${icon}" alt="" loading="lazy" decoding="async">` : '<span aria-hidden="true">-</span>'}<p>${sanitizeContentHtml(item.text)}</p></li>`;
  }).join('')}</ul>`;
}

function buildCasteOrganizationRows(rows) {
  const list = sanitizeCasteOrganizationRows(rows || []);
  if (!list.length) return '';
  return `<div class="caste-organization-list">${list.map(row => `
    <div class="caste-organization-row">
      <span>${escapeHtml(row.label)}</span>
      <strong>${sanitizeContentHtml(row.value)}</strong>
    </div>`).join('')}</div>`;
}

function buildCasteRepresentatives(items) {
  const list = sanitizeCasteRepresentatives(items || []);
  if (!list.length) return '';
  return `<div class="caste-representative-list">${list.map(item => `
    <article class="caste-representative-card">
      ${buildCasteImageOrMark(item.portrait, item.name, 'caste-representative-portrait', '#')}
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        ${item.role ? `<span>${escapeHtml(item.role)}</span>` : ''}
        ${item.note ? `<p>${sanitizeContentHtml(item.note)}</p>` : ''}
      </div>
    </article>`).join('')}</div>`;
}

function buildCasteRelatedEntries(items) {
  const list = sanitizeCasteRelatedEntries(items || []);
  if (!list.length) return '';
  return `<div class="caste-related-list">${list.map(item => buildCasteLinkedBlock(item.target, `
        ${buildCasteImageOrMark(item.icon, item.label, 'caste-related-icon', '+')}
        <span>${escapeHtml(item.label)}</span>
      `, 'caste-related-row')).join('')}</div>`;
}

function buildCastePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeCasteData(page.caste || {});
  const heroImage = sanitizeImageSrc(page.image || '');
  const bannerImage = sanitizeImageSrc(data.bannerImage || '');
  const headerSymbol = sanitizeImageSrc(data.headerSymbol || entry.symbol || '');
  const sealImage = sanitizeImageSrc(data.sealImage || '');
  const background = sanitizeStyleUrl(data.backgroundImage || '');
  const introText = data.introText || '';
  const descriptionText = page.description || '';
  const styleVars = [`--caste-image-scale:${(data.imageScale || 100) / 100}`];
  if (background) styleVars.push(`--caste-bg:url('${background}')`);
  const styleAttr = ` style="${styleVars.join(';')};"`;
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  return `
    ${nav}
    <div class="caste-page"${styleAttr}>
      <header class="caste-archive-head">
        <span>${escapeHtml(data.archiveLabel)}</span>
        <div>
          ${data.categoryLabel ? `<strong>${escapeHtml(data.categoryLabel)}</strong>` : ''}
          ${data.documentCode ? `<em>${escapeHtml(data.documentCode)}</em>` : ''}
          ${sealImage ? `<img src="${sealImage}" alt="" loading="lazy" decoding="async">` : ''}
        </div>
      </header>

      <section class="caste-hero">
        <div class="caste-title-row">
          ${headerSymbol ? `<img class="caste-header-symbol" src="${headerSymbol}" alt="" loading="lazy" decoding="async">` : '<div class="caste-header-symbol placeholder">*</div>'}
          <div>
            ${data.introTitle ? `<span class="caste-kicker">${escapeHtml(data.introTitle)}</span>` : ''}
            <h2>${escapeHtml(entry.title || 'Kaste')}</h2>
            ${entry.subtitle ? `<p>${escapeHtml(entry.subtitle)}</p>` : ''}
          </div>
        </div>
        ${bannerImage ? `<img class="caste-banner" src="${bannerImage}" alt="" loading="lazy" decoding="async">` : ''}
      </section>

      <div class="caste-layout">
        <aside class="caste-left">
          <figure class="caste-portrait"${buildModuleImageFrameAttrs(page)}>
            ${heroImage ? `<img src="${heroImage}" alt="${escapeHtml(entry.title || 'Kaste')}" loading="eager" decoding="async" fetchpriority="high"${buildModuleImageElementAttrs(page, 'cover', 'center top')}>` : `<div class="caste-portrait-placeholder">${getInitialChar(entry.title || 'K')}</div>`}
          </figure>
          ${buildCastePanel(data.infoTitle, buildCasteInfoRows(data.infoRows), 'caste-info-panel')}
          ${buildCastePanel(data.symbolsTitle, buildCasteSymbolCards(data.symbols), 'caste-symbol-panel')}
          ${buildCastePanel(data.relatedTitle, buildCasteRelatedEntries(data.relatedEntries), 'caste-related-panel')}
        </aside>

        <main class="caste-main">
          ${introText ? `<section class="caste-intro">${sanitizeContentHtml(introText)}</section>` : ''}
          ${buildCastePanel(data.rolesTitle, buildCasteRoleCards(data.roles), 'caste-roles-panel')}
          <div class="caste-panel-grid">
            ${buildCastePanel(data.skillsTitle, buildCasteTextList(data.skills), 'caste-list-panel')}
            ${buildCastePanel(data.privilegesTitle, buildCasteTextList(data.privileges), 'caste-list-panel')}
            ${buildCastePanel(data.restrictionsTitle, buildCasteTextList(data.restrictions), 'caste-list-panel')}
            ${buildCastePanel(data.organizationTitle, buildCasteOrganizationRows(data.organizationRows), 'caste-organization-panel')}
          </div>
          ${buildCastePanel(data.representativesTitle, buildCasteRepresentatives(data.representatives), 'caste-representatives-panel')}
        </main>
      </div>

      ${descriptionText ? `<section class="caste-description"><h3>Beschreibung</h3>${sanitizeContentHtml(descriptionText)}</section>` : ''}
      ${data.quote ? `<blockquote class="caste-quote">${sanitizeContentHtml(data.quote)}${data.quoteBy ? `<cite>${escapeHtml(data.quoteBy)}</cite>` : ''}</blockquote>` : ''}
      ${data.footer ? `<footer class="caste-footer">${escapeHtml(data.footer)}</footer>` : ''}
    </div>
    ${sym}`;
}

function buildWantedPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const inlineCommentThread = getInlineCommentThreadForPage(page, entry, pageIndex);
  const cards = (page.wanted || []).map(w => `
    <div class="wanted-card">
      <div class="wanted-card-header">⚔ &nbsp; Kopfgeld &nbsp; ⚔</div>
        ${sanitizeHref(w.link)
        ? `<a href="${sanitizeHref(w.link)}" target="_blank" rel="noopener noreferrer"><img src="${sanitizeImageSrc(w.img)}" alt="${escapeHtml(w.name)}" style="cursor:pointer" loading="lazy" decoding="async"></a>`
        : `<img src="${sanitizeImageSrc(w.img)}" alt="${escapeHtml(w.name)}" loading="lazy" decoding="async">`}
      <div class="wanted-card-body">
        <div class="wanted-name">${escapeHtml(w.name)}</div>
        <div class="wanted-role">${escapeHtml(w.role)}</div>
        <div class="wanted-field"><span class="wanted-field-label">Status</span><span class="wanted-field-val">${escapeHtml(w.status)}</span></div>
        <div class="wanted-field"><span class="wanted-field-label">Kopfgeld</span><span class="wanted-field-val">${escapeHtml(w.kopfgeld)}</span></div>
        <div class="wanted-field"><span class="wanted-field-label">Letzter Aufenth.</span><span class="wanted-field-val">${escapeHtml(w.letzter)}</span></div>
        <div class="wanted-field"><span class="wanted-field-label">Bekannt</span><span class="wanted-field-val">${escapeHtml(w.bekannt)}</span></div>
        <div class="wanted-egon">"${escapeHtml(w.egon)}"<br><span style="font-style:normal;font-size:0.62rem;font-family:'Cinzel',serif;color:var(--gold)">— Sir Egon Gafyr</span></div>
      </div>
    </div>`).join('');
  const embeddedComments = inlineCommentThread ? buildOrganicCommentsContinuation(inlineCommentThread) : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `${nav}<div class="wanted-page" style="background-image:url('${sanitizeStyleUrl(page.wantedBackground)}')"><div class="wanted-stamp">⚠ Gesucht</div><div class="wanted-grid">${cards}</div></div>${embeddedComments}${sym}`;
}

function buildProfilesPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const visibleProfiles = (page.profiles || []).slice(0, 6);
  const cards = visibleProfiles.map(p => `
    <div class="profile-card">
      <div class="profile-card-banner">✦ &nbsp; ${escapeHtml(p.banner || 'Ruinenpforte')} &nbsp; ✦</div>
      ${p.img
        ? `<img src="${sanitizeImageSrc(p.img)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">`
        : `<div class="profile-card-image-placeholder">${escapeHtml(p.name || 'Charakter')}</div>`}
      <div class="profile-card-body">
        <div class="profile-card-name">${escapeHtml(p.name)}</div>
        <div class="profile-card-role">${escapeHtml(p.role)}</div>
        ${(p.fields || []).map(f => `
          <div class="profile-card-field">
            <span class="profile-card-label">${escapeHtml(f[0])}</span>
            <span class="profile-card-val">${escapeHtml(f[1])}</span>
          </div>`).join('')}
        ${p.note ? `<div class="profile-card-note">${sanitizeContentHtml(p.note)}</div>` : ''}
      </div>
      ${p.stamp ? `<div class="profile-stamp">${escapeHtml(p.stamp)}</div>` : ''}
    </div>`).join('');
  return `
    ${nav}
    <div class="profile-page" style="background:var(--parchment-dark);">
      <div class="profile-page-bg" style="background-image:url('${sanitizeStyleUrl(page.profileBackground)}')"></div>
      <div class="profile-page-title">${escapeHtml(page.profileTitle || '✦ — Mitglieder des Forschungsteams — ✦')}</div>
      <div class="profile-grid" style="--profile-count:${Math.max(1, visibleProfiles.length)}">${cards}</div>
    </div>`;
}

function buildRecipeIcon(item, fallback = '✦') {
  const icon = sanitizeImageSrc(item?.icon || '');
  return icon
    ? `<img src="${icon}" alt="" loading="lazy" decoding="async">`
    : `<span>${escapeHtml(fallback)}</span>`;
}

function buildRecipeSimpleRows(items = [], kind = 'ingredient') {
  return (Array.isArray(items) ? items : []).map(item => `
    <div class="recipe-side-row ${kind}">
      <div class="recipe-side-icon">${buildRecipeIcon(item, kind === 'property' ? '✦' : '•')}</div>
      <div class="recipe-side-main">
        <strong>${escapeHtml(item.title || 'Eintrag')}</strong>
        ${item.amount ? `<span>${escapeHtml(item.amount)}</span>` : ''}
        ${item.value ? `<span>${escapeHtml(item.value)}</span>` : ''}
        ${item.text ? `<p>${sanitizeContentHtml(item.text)}</p>` : ''}
      </div>
    </div>`).join('');
}

function buildRecipePage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeRecipeData(page.recipe || {});
  const heroImage = sanitizeImageSrc(page.image || '');
  const metaRows = [
    ['Kategorie', data.category],
    ['Typ', data.documentKind],
    ['Schwierigkeit', data.difficulty],
    ['Dauer', data.duration],
    ['Ergebnis', data.result],
    ['Wirkung', data.effect]
  ].filter(([, value]) => value);
  const metaLabels = new Set(metaRows.map(([label]) => String(label).toLowerCase()));
  const statRows = hasModuleStats(page.stats)
    ? page.stats.filter(([label]) => !metaLabels.has(String(label).toLowerCase()))
    : [];
  const steps = data.steps.map((step, index) => `
    <div class="recipe-step-row">
      <div class="recipe-step-number">${index + 1}</div>
      <div class="recipe-step-icon">${buildRecipeIcon(step, '✧')}</div>
      <div class="recipe-step-check" aria-hidden="true"></div>
      <div class="recipe-step-body">
        <h3>${escapeHtml(step.title || `Schritt ${index + 1}`)}</h3>
        ${step.text ? `<p>${sanitizeContentHtml(step.text)}</p>` : ''}
        <div class="recipe-step-meta">
          ${step.duration ? `<span>⌛ ${escapeHtml(step.duration)}</span>` : ''}
          ${step.note ? `<em>${escapeHtml(step.note)}</em>` : ''}
        </div>
      </div>
    </div>`).join('');
  const activeVariant = data.variants[0] || null;
  const variantTabs = data.variants.map((variant, index) => `
    <div class="recipe-variant-tab${index === 0 ? ' active' : ''}">
      <div class="recipe-variant-tab-icon">${buildRecipeIcon(variant, '✦')}</div>
      <strong>${escapeHtml(variant.title || `Variante ${index + 1}`)}</strong>
    </div>`).join('');
  const variants = activeVariant ? `
    <section class="recipe-variants">
      <h3>${escapeHtml(data.variantsTitle)}</h3>
      <div class="recipe-variant-tabs">${variantTabs}</div>
      <article class="recipe-variant-panel">
        <div class="recipe-variant-summary">
          <div class="recipe-side-icon">${buildRecipeIcon(activeVariant, '✦')}</div>
          <div>
            <strong>${escapeHtml(activeVariant.title || 'Variante')}</strong>
            ${activeVariant.description ? `<p>${sanitizeContentHtml(activeVariant.description)}</p>` : ''}
          </div>
        </div>
        <div class="recipe-variant-grid">
          <div><span>Zusätzliche Zutaten</span><p>${sanitizeContentHtml(activeVariant.additions || '-')}</p></div>
          <div><span>Geänderter Effekt</span><p>${sanitizeContentHtml(activeVariant.effect || '-')}</p></div>
        </div>
      </article>
    </section>` : '';
  const warnings = data.warnings.length ? `
    <section class="recipe-side-section warnings">
      <h3>${escapeHtml(data.warningsTitle)}</h3>
      ${buildRecipeSimpleRows(data.warnings, 'warning')}
    </section>` : '';
  const quote = page.quote ? `
    <blockquote class="recipe-note-quote">
      ${sanitizeContentHtml(page.quote)}
      ${page.quoteBy ? `<span>${escapeHtml(page.quoteBy)}</span>` : ''}
    </blockquote>` : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `
    ${nav}
    <div class="recipe-page">
      <div class="recipe-page-inner">
        <main class="recipe-main">
          <header class="recipe-header">
            <div class="recipe-archive">${escapeHtml(data.archiveLabel)}</div>
            <div class="recipe-title-row">
              <figure class="recipe-hero-image"${buildModuleImageFrameAttrs(page)}>
                ${heroImage ? `<img src="${heroImage}" alt="${escapeHtml(entry.title)}" loading="lazy" decoding="async"${buildModuleImageElementAttrs(page, 'cover', 'center center')}>` : `<div class="recipe-hero-placeholder">Rezeptbild</div>`}
              </figure>
              <div class="recipe-title-main">
                <h2>${escapeHtml(entry.title)}</h2>
                <p>${escapeHtml(entry.subtitle || data.effect || data.documentKind)}</p>
                ${page.description ? `<div class="recipe-description">${sanitizeContentHtml(page.description)}</div>` : ''}
                <div class="recipe-meta-grid">
                  ${metaRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
                  ${statRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
                </div>
              </div>
            </div>
          </header>
          <section class="recipe-steps">
            <h3>${escapeHtml(data.stepsTitle)}</h3>
            <div class="recipe-step-list">${steps}</div>
            ${variants}
          </section>
        </main>
        <aside class="recipe-sidebar">
          <section class="recipe-side-section">
            <h3>${escapeHtml(data.ingredientsTitle)}</h3>
            ${buildRecipeSimpleRows(data.ingredients, 'ingredient')}
          </section>
          <section class="recipe-side-section">
            <h3>${escapeHtml(data.equipmentTitle)}</h3>
            ${buildRecipeSimpleRows(data.equipment, 'equipment')}
          </section>
          ${warnings}
          <section class="recipe-side-section properties">
            <h3>${escapeHtml(data.propertiesTitle)}</h3>
            ${buildRecipeSimpleRows(data.properties, 'property')}
          </section>
          ${(data.masterNote || quote) ? `
            <section class="recipe-side-section master-note">
              <h3>${escapeHtml(data.masterNoteTitle)}</h3>
              ${data.masterNote ? `<p>${sanitizeContentHtml(data.masterNote)}</p>` : ''}
              ${quote}
            </section>` : ''}
          ${data.footer ? `<div class="recipe-footer">${escapeHtml(data.footer)}</div>` : ''}
        </aside>
      </div>
    </div>
    ${sym}`;
}

function buildArtifactPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const data = sanitizeArtifactData(page.artifact || {});
  const infoRows = [
    ['Klassifikation', data.classification],
    ['Herkunft', data.origin],
    ['Zustand', data.condition],
    ['Verwahrung', data.keeper]
  ].filter(([, value]) => value);
  const artifactImage = sanitizeImageSrc(page.image || '');
  const statsHtml = hasModuleStats(page.stats)
    ? page.stats.map(([label, value]) => `<div class="artifact-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')
    : '';
  const listBlock = (title, items, className = '') => Array.isArray(items) && items.length ? `
    <section class="artifact-section ${className}">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>` : '';
  const quote = page.quote ? `
    <blockquote class="artifact-quote">
      ${sanitizeContentHtml(page.quote)}
      ${page.quoteBy ? `<span>${escapeHtml(page.quoteBy)}</span>` : ''}
    </blockquote>` : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `
    ${nav}
    <div class="artifact-page">
      <header class="artifact-header">
        <div>
          <div class="artifact-archive">${escapeHtml(data.archiveLabel || entry.category || 'Artefaktakte')}</div>
          <h2>${escapeHtml(entry.title)}</h2>
          <p>${escapeHtml(entry.subtitle || data.classification)}</p>
        </div>
        <div class="artifact-seal">${escapeHtml(data.classification || 'Artefakt')}</div>
      </header>
      <div class="artifact-layout">
        <aside class="artifact-left-panel">
          <figure class="artifact-image-frame"${buildModuleImageFrameAttrs(page)}>
            ${artifactImage
              ? `<img src="${artifactImage}" alt="${escapeHtml(entry.title || data.archiveLabel)}" loading="lazy" decoding="async"${buildModuleImageElementAttrs(page, 'contain', 'center center')}>`
              : `<div class="artifact-image-placeholder">Artefaktbild</div>`}
          </figure>
          <div class="artifact-info-list">
            ${infoRows.map(([label, value]) => `<div class="artifact-info-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('')}
          </div>
        </aside>
        <main class="artifact-main">
          ${statsHtml ? `<section class="artifact-stats">${statsHtml}</section>` : ''}
          ${page.description ? `<section class="artifact-section primary"><h3>Beschreibung</h3><p>${sanitizeContentHtml(page.description)}</p></section>` : ''}
          ${data.discovery ? `<section class="artifact-section"><h3>Fundumstände</h3><p>${sanitizeContentHtml(data.discovery)}</p></section>` : ''}
          ${data.historyText ? `<section class="artifact-section"><h3>${escapeHtml(data.historyTitle)}</h3><p>${sanitizeContentHtml(data.historyText)}</p></section>` : ''}
          ${quote}
        </main>
        <aside class="artifact-right-panel">
          ${listBlock(data.propertiesTitle, data.properties, 'properties')}
          ${listBlock(data.risksTitle, data.risks, 'risks')}
          ${data.footer ? `<div class="artifact-footer">${escapeHtml(data.footer)}</div>` : ''}
        </aside>
      </div>
    </div>
    ${sym}`;
}

function buildSceneBlocksPage(page, entry, pageIndex, total) {
  const nav = buildNav(page, pageIndex, total);
  const imgCol = buildModalImageColumn(page, entry, false);
  const sceneSpeakers = [];
  const seenSpeakers = new Set();
  (page.sceneBlocks || []).forEach(block => {
    if (!isCharacterSceneBlockType(block?.type)) return;
    const name = String(block?.name || '').trim();
    if (!name) return;
    const key = normalizeSearchText(name);
    if (!key || seenSpeakers.has(key)) return;
    seenSpeakers.add(key);
    sceneSpeakers.push({ key, name });
  });
  const speakerFilter = sceneSpeakers.length > 1 ? `
    <div class="scene-speaker-filter">
      <label for="scene-speaker-filter-${escapeHtml(entry.id)}-${pageIndex}">Sprecher</label>
      <select id="scene-speaker-filter-${escapeHtml(entry.id)}-${pageIndex}" data-modal-action="filter-scene-speaker">
        <option value="">Alle Sprecher</option>
        ${sceneSpeakers.map(speaker => `<option value="${escapeHtml(speaker.key)}">${escapeHtml(speaker.name)}</option>`).join('')}
      </select>
    </div>` : '';
  const blocksHtml = page.sceneBlocks.map(b => {
    const sceneType = normalizeSceneBlockType(b.type);
    if (sceneType === 'intro') return `<div class="scene-intro">${sanitizeContentHtml(b.text)}</div>`;
    if (sceneType === 'action') return `<div class="scene-action">— ${escapeHtml(b.text)} —</div>`;
    if (sceneType === 'divider') return `<div class="scene-divider">✦ ✦ ✦</div>`;
    if (isCharacterSceneBlockType(sceneType)) {
      const side = b.side || 'left';
      const speakerKey = normalizeSearchText(b.name || '');
      const matchedCharacter = findModuleEditorCharacterMatch({ name: b.name, avatar: b.avatar });
      const speakerProfileAttrs = [
        'data-action="open-speaker-profile"',
        `data-speaker-name="${escapeHtml(b.name || '')}"`,
        `data-speaker-title="${escapeHtml(matchedCharacter?.title || '')}"`,
        `data-speaker-portrait="${escapeHtml(b.avatar || matchedCharacter?.portrait || '')}"`,
        `data-speaker-character-id="${escapeHtml(matchedCharacter?.id || '')}"`
      ].join(' ');
      return `
        <div class="scene-bubble ${side} ${sceneType}" data-scene-speaker="${escapeHtml(speakerKey)}">
          <img src="${sanitizeImageSrc(b.avatar)}" alt="${escapeHtml(b.name)}" loading="lazy" decoding="async" ${speakerProfileAttrs}>
          <div class="scene-bubble-body">
            <button class="scene-speaker" type="button" ${speakerProfileAttrs}>${escapeHtml(b.name)}</button>
            <div class="scene-speech">${sanitizeContentHtml(b.text)}</div>
          </div>
        </div>`;
    }
    return '';
  }).join('');
  const sceneStats = (page.stats && page.stats.length) ? `
    <div class="stats-grid">
      ${page.stats.map(([l, v]) => `<div class="stat-card"><span class="stat-label">${escapeHtml(l)}</span><span class="stat-value">${escapeHtml(v)}</span></div>`).join('')}
    </div>` : '';
  const sceneDesc = page.description ? `<p class="modal-description">${sanitizeContentHtml(page.description)}</p>` : '';
  const sym = entry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(entry.symbol)}" alt="" loading="lazy" decoding="async">` : '';
  return `
    ${nav}
    <div class="modal-row">
      ${imgCol}
      <div class="modal-text-col" id="modal-text-col-el">
        <div class="modal-text-inner">
          <div class="modal-copy-block">
            <div class="modal-category">${escapeHtml(entry.category)}</div>
            <h2 class="modal-title">${escapeHtml(entry.title)}</h2>
            <p class="modal-subtitle">${escapeHtml(entry.subtitle)}</p>
            <div class="modal-divider"></div>
            ${sceneDesc}
          </div>
          ${sceneStats ? `<div class="modal-content-section">${sceneStats}</div>` : ''}
          ${speakerFilter}
          <div class="modal-content-section modal-scene-stack">${blocksHtml}</div>
        </div>
      </div>
    </div>
    ${sym}`;
}

function buildInlineComplexTemplatePage(page, entry, pageIndex, total, type, extraEditorHtml = '') {
  const nav = buildNav(page, pageIndex, total);
  return `
    ${nav}
    ${buildInlineModuleWorkspace(buildInlineComplexEditor(entry, page, type), page, entry, pageIndex, total, extraEditorHtml)}`;
}

function buildInlineSessionTemplatePage(page, entry, pageIndex, total) {
  const commentsHtml = `
    <div class="modal-content-section">
      ${buildEmbeddedCommentsSection(getCommentThreadForPage(page, entry, pageIndex), page.sessionHint || 'Nutze unten den normalen Kommentiermodus, um direkt auf dieser Seite zu schreiben.')}
    </div>`;
  return buildInlineComplexTemplatePage(page, entry, pageIndex, total, 'session', commentsHtml);
}

function buildRegisteredModuleTemplatePage(page, entry, pageIndex, total, inlineEditing) {
  const template = getModuleTemplateForPage(page);
  if (!template || template.id === 'story') return '';
  if (inlineEditing && typeof template.renderInlinePage === 'function') {
    return template.renderInlinePage(page, entry, pageIndex, total);
  }
  if (!inlineEditing && typeof template.renderPage === 'function') {
    return template.renderPage(page, entry, pageIndex, total);
  }
  return '';
}

function buildPage(page, entry, pageIndex, total) {
  const effectiveEntry = getRenderableEntry(entry);
  const inlineEditing = isInlineEditingEntry(entry);

  if (page._commentsPage) {
    return buildCommentsPage(effectiveEntry, pageIndex, total);
  }

  const registeredTemplatePage = buildRegisteredModuleTemplatePage(page, effectiveEntry, pageIndex, total, inlineEditing);
  if (registeredTemplatePage) return registeredTemplatePage;

  const inlineCommentThread = getInlineCommentThreadForPage(page, effectiveEntry, pageIndex);

  const nav = buildNav(page, pageIndex, total);
  const imgCol = buildModalImageColumn(page, effectiveEntry, inlineEditing);
  const stats = (page.stats && page.stats.length) ? `
    <div class="stats-grid">
      ${page.stats.map(([l, v]) => `<div class="stat-card"><span class="stat-label">${escapeHtml(l)}</span><span class="stat-value">${escapeHtml(v)}</span></div>`).join('')}
    </div>` : '';
  const commentSequenceHtml = renderStaticCommentSequence(page.commentSequence || []);
  const person = page.commentator;
  const avatar = person?.avatars
    ? (person.avatars[page.commentatorMood] || Object.values(person.avatars)[0])
    : '';
  const comment = !commentSequenceHtml && (person?.name && avatar && page.commentText) ? `
    <div class="commentator-block">
      <div class="commentator-header">
        <img class="commentator-avatar" src="${sanitizeImageSrc(avatar)}" alt="${escapeHtml(person.name)}" loading="lazy" decoding="async">
        <div><span class="commentator-name">${escapeHtml(person.name)}</span><span class="commentator-role">${escapeHtml(person.title || '')}</span></div>
      </div>
      <p class="commentator-text">${sanitizeContentHtml(page.commentText)}</p>
    </div>` : '';
  const quote = page.quote ? `
    <div class="entry-quote">${sanitizeContentHtml(page.quote)}
      <div class="quote-attribution">${escapeHtml(page.quoteBy||'')}</div>
    </div>` : '';
  const organicComments = !inlineEditing && inlineCommentThread && (commentSequenceHtml || comment)
    ? buildOrganicCommentsContinuation(inlineCommentThread)
    : '';
  const commentDivider = page.commentDivider ? `<div class="modal-divider"></div>` : '';
  const sym = effectiveEntry.symbol ? `<img class="modal-symbol" src="${sanitizeImageSrc(effectiveEntry.symbol)}" alt="" loading="lazy" decoding="async">` : '';

  if (inlineEditing) {
    return `
      ${nav}
      ${buildInlineModuleWorkspace(buildInlineStandardEditor(effectiveEntry, page), page, effectiveEntry, pageIndex, total)}
      ${sym}`;
  }

  return `
    ${nav}
    <div class="modal-row">
      ${imgCol}
      <div class="modal-text-col" id="modal-text-col-el">
        <div class="modal-text-inner modal-story-text-inner">
            <div class="modal-copy-block">
              <div class="modal-category">${escapeHtml(effectiveEntry.category)}</div>
              <h2 class="modal-title">${escapeHtml(effectiveEntry.title)}</h2>
              <p class="modal-subtitle">${escapeHtml(effectiveEntry.subtitle)}</p>
              <div class="modal-divider"></div>
              <p class="modal-description modal-story-description">${sanitizeContentHtml(page.description || '')}</p>
            </div>
            ${stats ? `<div class="modal-content-section">${stats}</div>` : ''}
            <div class="modal-content-section">
              ${commentDivider}
              ${commentSequenceHtml || comment}
              ${quote}
              ${organicComments}
            </div>
        </div>
      </div>
    </div>
    ${sym}`;
}

function buildNav(page, pageIndex, total) {
  const activeEntry = currentEntry ? getRenderableEntry(currentEntry) : null;
  const pages = activeEntry ? getPages(activeEntry) : [];
  const inlineEditing = isInlineEditingEntry(currentEntry);
  const currentLabel = getPageNavLabel(page, pageIndex, total);
  const chapterTabs = pages.map((p, idx) => `
    <button
      class="modal-page-tab${idx === pageIndex ? ' active' : ''}"
      type="button"
      data-modal-action="jump-page"
      data-page-index="${idx}"
      title="${escapeHtml(getPageNavLabel(p, idx, pages.length))}"
      aria-label="${escapeHtml(getPageNavLabel(p, idx, pages.length))}">
      ${escapeHtml(getPageTabLabel(p, idx, pages.length))}
    </button>`).join('') + (inlineEditing ? `
    <select class="modal-page-tab modal-page-add-select" title="Seite hinzufügen" aria-label="Seite hinzufügen" data-modal-action="add-inline-page">
      <option value="">+ Seite</option>
      ${buildModulePageTypeOptions('')}
    </select>` : '');
  const templateSelect = inlineEditing ? `
      <select class="modal-page-tool" title="Modulvorlage wählen" aria-label="Modulvorlage wählen" data-modal-action="apply-inline-template">
        ${buildModuleTemplateOptions(inferModuleTemplateType(activeEntry))}
      </select>` : '';
  const actions = inlineEditing
    ? `
      ${templateSelect}
      <button class="modal-page-tool" type="button" data-modal-action="save-inline-edit">Speichern</button>
      <button class="modal-page-tool" type="button" data-modal-action="cancel-inline-edit">Abbrechen</button>
      ${pages.length > 1 ? `<button class="modal-page-tool" type="button" data-modal-action="remove-inline-page">Seite löschen</button>` : ''}`
    : `
      <button class="modal-page-tool" type="button" data-modal-action="export-current-module">Export</button>
      <button class="modal-page-tool" type="button" data-modal-action="open-module-editor-current">Bearbeiten</button>`;
  return `
    <div class="modal-page-header">
      <div class="modal-page-top">
        <div class="modal-page-summary">
          <span class="modal-page-title">${page.pageTitle||''}</span>
          <span class="modal-page-subtitle">${escapeHtml(currentLabel)}</span>
        </div>
        <div class="modal-page-nav">
          <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="-1" ${pageIndex===0?'disabled':''}>◀ Zurück</button>
          <span class="modal-page-indicator">Seite ${pageIndex+1} von ${total}</span>
          <button class="modal-page-btn" type="button" data-modal-action="flip-page" data-direction="1" ${pageIndex===total-1?'disabled':''}>Weiter ▶</button>
        </div>
        <div class="modal-page-actions">${actions}</div>
      </div>
      ${(pages.length > 1 || inlineEditing) ? `<div class="modal-page-tabs">${chapterTabs}</div>` : ''}
    </div>`;
}

function getPageNavLabel(page, pageIndex, total) {
  if (!page) return `Seite ${pageIndex + 1}`;
  if (page._commentsPage) return `Kommentare`;
  if (page.pageTitle) return page.pageTitle;
  return `Seite ${pageIndex + 1} von ${total}`;
}

function getPageTabLabel(page, pageIndex, total) {
  if (!page) return `${pageIndex + 1}`;
  if (page._commentsPage) return 'Kommentare';
  const title = String(page.pageTitle || '').trim();
  if (!title) return `${pageIndex + 1}`;

  const match = title.match(/^([IVXLCDM]+)\.\s*[—-]?\s*(.*)$/i);
  if (match) {
    const numeral = match[1].toUpperCase() + '.';
    const rest = match[2].trim();
    return rest ? `${numeral} ${rest}` : numeral;
  }
  return title;
}
