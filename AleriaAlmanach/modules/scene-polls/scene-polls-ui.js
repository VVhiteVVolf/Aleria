function renderScenePollIcon(src = SCENE_POLL_ICON_URL) {
  return `<img src="${sanitizeImageSrc(src || SCENE_POLL_ICON_URL)}" alt="" loading="lazy" decoding="async">`;
}

function renderScenePollVoterStack(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  const votes = getScenePollVoteList(poll);
  if (!votes.length) return '<div class="scene-poll-voters empty">Noch keine Stimmen</div>';
  const visible = votes.slice(0, 5);
  const hidden = votes.slice(5);
  const hiddenTitle = hidden.map(vote => vote.characterName).join('\n');
  return `
    <div class="scene-poll-voters" aria-label="Stimmengeber">
      ${visible.map(vote => {
        const portrait = sanitizeImageSrc(vote.portrait || '');
        const name = poll.anonymous ? vote.characterName : `${vote.characterName}: ${getScenePollOptionLabel(poll, vote.optionId)}`;
        return `<span class="scene-poll-voter" tabindex="0" aria-label="${escapeHtml(name)}">
          <span class="scene-poll-voter-tip" role="tooltip">${escapeHtml(name)}</span>
          ${portrait
            ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">`
            : `<span>${escapeHtml(getInitialChar(vote.characterName))}</span>`}
        </span>`;
      }).join('')}
      ${hidden.length ? `<span class="scene-poll-voter more" tabindex="0" title="${escapeHtml(hiddenTitle)}">+${hidden.length}</span>` : ''}
    </div>`;
}

function getScenePollOptionLabel(pollInput, optionId) {
  const poll = normalizeScenePoll(pollInput);
  return poll.options.find(option => option.id === optionId)?.label || 'Unbekannt';
}

function renderScenePollSummary(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  const counts = getScenePollOptionCounts(poll);
  const total = Object.values(poll.votes).length;
  return `
    <div class="scene-poll-summary" aria-label="Aktuelles Votum">
      <div class="scene-poll-summary-title"><span></span><strong>Aktuelles Votum</strong><span></span></div>
      <div class="scene-poll-option-grid">
        ${poll.options.map(option => {
          const count = counts[option.id] || 0;
          const percent = getScenePollOptionPercent(count, total);
          return `
            <section class="scene-poll-option" data-poll-tone="${escapeHtml(option.tone)}">
              <div class="scene-poll-option-mark">${renderScenePollOptionMark(option.tone)}</div>
              <div>
                <div class="scene-poll-option-label">${escapeHtml(option.label)}</div>
                <div class="scene-poll-option-count"><strong>${count}</strong><span>Stimmen</span></div>
                <div class="scene-poll-meter"><span style="width:${percent}%"></span></div>
                <div class="scene-poll-percent">${percent}%</div>
              </div>
            </section>`;
        }).join('')}
      </div>
    </div>`;
}

function renderScenePollOptionMark(tone) {
  if (tone === 'approve') return '&#10003;';
  if (tone === 'reject') return '&#10005;';
  if (tone === 'abstain') return '&minus;';
  return '*';
}

function renderScenePollVoteControls(pollInput, commentId) {
  const poll = normalizeScenePoll(pollInput);
  return `
    <div class="scene-poll-cast-vote" data-scene-poll-vote-panel="${escapeHtml(commentId)}" data-selected-voter="patrick" data-selected-character="">
      <div class="scene-poll-vote-tabs">
        ${getScenePollVoters().map((voter, index) => `
          <button type="button" class="${index === 0 ? 'active' : ''}" data-scene-poll-action="select-voter" data-poll-voter="${escapeHtml(voter.id)}" aria-pressed="${index === 0 ? 'true' : 'false'}">${escapeHtml(voter.label)}</button>
        `).join('')}
      </div>
      <div class="scene-poll-character-list" data-scene-poll-characters>
        ${buildScenePollCharacterPicker(getScenePollVoters()[0]?.id || 'patrick', poll)}
      </div>
      <div class="scene-poll-vote-options">
        ${poll.options.map(option => `
          <button type="button" data-scene-poll-action="cast-vote" data-poll-option-id="${escapeHtml(option.id)}" data-poll-tone="${escapeHtml(option.tone)}">${escapeHtml(option.label)}</button>
        `).join('')}
      </div>
      <div class="scene-poll-inline-status" data-scene-poll-inline-status></div>
    </div>`;
}

function buildScenePollCharacterPicker(voterId, pollInput, selectedId = '') {
  const poll = normalizeScenePoll(pollInput);
  const selected = String(selectedId || '').trim();
  const characters = getScenePollCharactersForVoter(voterId);
  if (!characters.length) return '<div class="scene-poll-empty">Keine Figuren verfuegbar.</div>';
  return characters.map(character => {
    const id = String(character.id || '').trim();
    const vote = poll.votes[id];
    const portrait = sanitizeImageSrc(getScenePollCharacterPortrait(character));
    const voted = vote ? getScenePollOptionLabel(poll, vote.optionId) : '';
    return `<button type="button" class="scene-poll-character${selected === id ? ' selected' : ''}" data-scene-poll-action="select-character" data-character-id="${escapeHtml(id)}" aria-pressed="${selected === id ? 'true' : 'false'}">
      ${portrait ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">` : `<span>${escapeHtml(getInitialChar(character.name))}</span>`}
      <strong>${escapeHtml(character.name || 'Unbekannt')}</strong>
      ${voted ? `<em>${poll.anonymous ? 'abgestimmt' : escapeHtml(voted)}</em>` : ''}
    </button>`;
  }).join('');
}

function renderScenePollResults(pollInput) {
  const poll = normalizeScenePoll(pollInput);
  const votes = getScenePollVoteList(poll);
  const grouped = poll.options.map(option => ({
    option,
    votes: votes.filter(vote => vote.optionId === option.id)
  }));
  return `
    <div class="scene-poll-results" data-scene-poll-results hidden>
      <div class="scene-poll-results-title">Votum der Persoenlichkeiten</div>
      ${poll.anonymous
        ? '<p class="scene-poll-anonymous-note">Diese Abstimmung ist anonym. Einzelne Stimmen werden nicht den Figuren zugeordnet.</p>'
        : ''}
      <div class="scene-poll-results-grid">
        ${grouped.map(group => `
          <section data-poll-tone="${escapeHtml(group.option.tone)}">
            <h4>${escapeHtml(group.option.label)} <span>${group.votes.length}</span></h4>
            ${poll.anonymous
              ? '<div class="scene-poll-result-empty">Namen verborgen</div>'
              : renderScenePollResultVoters(group.votes)}
          </section>
        `).join('')}
      </div>
    </div>`;
}

function renderScenePollResultVoters(votes) {
  if (!votes.length) return '<div class="scene-poll-result-empty">Keine Stimme</div>';
  return votes.map(vote => {
    const portrait = sanitizeImageSrc(vote.portrait || '');
    return `<div class="scene-poll-result-voter">
      ${portrait ? `<img src="${portrait}" alt="" loading="lazy" decoding="async">` : `<span>${escapeHtml(getInitialChar(vote.characterName))}</span>`}
      <div><strong>${escapeHtml(vote.characterName)}</strong><small>${escapeHtml(vote.voterLabel || '')}</small></div>
    </div>`;
  }).join('');
}

function renderScenePollBlock(input, options = {}) {
  const poll = normalizeScenePoll(input?.scenePoll || input || {});
  const commentId = String(options.commentId || '').trim();
  const actions = commentId && !options.hideActions ? `
    <div class="comment-narrator-actions scene-poll-actions">
      <button type="button" class="comment-narrator-del" data-scene-poll-action="open-edit" data-comment-id="${escapeHtml(commentId)}">Bearbeiten</button>
      <button type="button" class="comment-narrator-del" data-action="open-delete-confirm" data-comment-id="${escapeHtml(commentId)}">Loeschen</button>
    </div>` : '';
  return `
    <article class="scene-poll" data-scene-poll-id="${escapeHtml(poll.pollId)}" data-comment-id="${escapeHtml(commentId)}" data-poll-anonymous="${poll.anonymous ? 'true' : 'false'}">
      <header class="scene-poll-head">
        <div class="scene-poll-icon">${renderScenePollIcon(poll.iconUrl)}</div>
        <div class="scene-poll-copy">
          <div class="scene-poll-kicker">Abstimmung</div>
          <h3>${escapeHtml(poll.title)}</h3>
          <p>${parseCommentMarkup(poll.question)}</p>
          ${poll.flavourText ? `<div class="scene-poll-flavour">${parseCommentMarkup(poll.flavourText)}</div>` : ''}
        </div>
        <button class="scene-poll-result-jump" type="button" data-scene-poll-action="toggle-results" aria-expanded="false" title="Ergebnisse anzeigen">
          <span aria-hidden="true">-&gt;</span>
          <strong>Zum Ergebnis</strong>
        </button>
        ${actions}
      </header>
      ${renderScenePollSummary(poll)}
      ${commentId ? renderScenePollVoteControls(poll, commentId) : ''}
      <div class="scene-poll-voter-row">
        <div class="scene-poll-voter-title">Abstimmende</div>
        ${renderScenePollVoterStack(poll)}
      </div>
      ${renderScenePollResults(poll)}
    </article>`;
}

function renderScenePollComment(comment, index = 0) {
  const divider = index > 0 ? '<div class="comment-divider"><span class="comment-divider-icon">*</span></div>' : '';
  return `${divider}${renderScenePollBlock(comment, { commentId: comment?.id || '' })}`;
}

function ensureScenePollDialog() {
  let overlay = document.getElementById('scene-poll-overlay');
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = 'scene-poll-overlay';
  overlay.className = 'scene-poll-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="scene-poll-dialog">
      <header>
        <div><small>Szenenabstimmung</small><h2 data-scene-poll-dialog-title>Abstimmung anlegen</h2></div>
        <button type="button" data-scene-poll-action="close-dialog" aria-label="Abstimmung schliessen">x</button>
      </header>
      <div class="scene-poll-dialog-body">
        <section>
          <label for="scene-poll-title">Ueberschrift</label>
          <input id="scene-poll-title" type="text" maxlength="90" placeholder="Vorlage zur Abstimmung">
        </section>
        <section>
          <label for="scene-poll-question">Thema / Frage</label>
          <textarea id="scene-poll-question" rows="3" placeholder="Soll das Haus Draig die Buendnisverhandlungen fortfuehren?"></textarea>
        </section>
        <section>
          <label for="scene-poll-flavour">Flavourtext</label>
          <textarea id="scene-poll-flavour" rows="3" placeholder="Kurzer Kontext zur Abstimmung."></textarea>
        </section>
        <section class="scene-poll-dialog-options">
          <label>Antworten</label>
          ${SCENE_POLL_DEFAULT_OPTIONS.map((option, index) => `
            <input data-scene-poll-option-label="${index}" type="text" value="${escapeHtml(option.label)}" maxlength="28">
          `).join('')}
        </section>
        <section>
          <label class="scene-poll-check"><input id="scene-poll-anonymous" type="checkbox"> Anonyme Abstimmung</label>
          <p>Offen zeigt, welche Figur wofuer gestimmt hat. Anonym zeigt nur Summen.</p>
        </section>
        <section>
          <label>Vorschau</label>
          <div class="scene-poll-preview" data-scene-poll-preview></div>
        </section>
      </div>
      <footer>
        <div class="scene-poll-status" data-scene-poll-status role="status"></div>
        <div>
          <button type="button" data-scene-poll-action="close-dialog">Abbrechen</button>
          <button class="primary" type="button" data-scene-poll-action="submit-poll">Eintragen</button>
        </div>
      </footer>
    </div>`;
  document.body.appendChild(overlay);
  return overlay;
}
