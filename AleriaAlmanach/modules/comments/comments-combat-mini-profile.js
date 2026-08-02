// Compact combat profile attached to portraits in the comment reader.
// The feature owns its markup, local open state and delegated interactions.
(function initCommentCombatMiniProfile(global) {
  const ROOT_SELECTOR = '[data-comment-combat-profile]';
  const TOGGLE_SELECTOR = '[data-action="toggle-comment-combat-profile"]';
  let activeRoot = null;

  function escapeMarkup(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeDomId(value) {
    return String(value || 'figur').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 90) || 'figur';
  }

  function formatModifier(value) {
    const modifier = Number(value) || 0;
    return modifier >= 0 ? `+${modifier}` : String(modifier);
  }

  function getVisibleResources(profile) {
    return (Array.isArray(profile?.resources) ? profile.resources : [])
      .filter(resource => String(resource?.name || '').trim()
        && (Number(resource?.maximum) > 0 || Number(resource?.current) !== 0))
      .slice(0, 2);
  }

  function renderResource(resource) {
    const maximum = Math.max(0, Number(resource.maximum) || 0);
    const current = Number(resource.current) || 0;
    const value = maximum > 0 ? `${current}/${maximum}` : String(current);
    return `<li><span>${escapeMarkup(resource.name)}</span><b>${escapeMarkup(value)}</b></li>`;
  }

  function renderPanel(profile, displayName) {
    const level = Number(profile?.effectiveLevel) || 1;
    const maximumHitPoints = Number(profile?.maximumHitPoints) || 0;
    const currentHitPoints = profile?.currentHitPoints == null
      ? maximumHitPoints
      : Math.max(0, Number(profile.currentHitPoints) || 0);
    const temporaryHitPoints = Math.max(0, Number(profile?.temporaryHitPoints) || 0);
    const hitPointText = `${currentHitPoints}/${maximumHitPoints}${temporaryHitPoints ? ` +${temporaryHitPoints}` : ''}`;
    const weaponName = String(profile?.weapon?.name || 'Kein aktiver Angriff').trim();
    const damageFormula = String(profile?.weapon?.damageFormula || '').trim();
    const resources = getVisibleResources(profile);

    return `
      <div class="comment-combat-profile-head">
        <strong>${escapeMarkup(displayName || profile?.name || 'Kampfprofil')}</strong>
        <span>Stufe ${escapeMarkup(level)}</span>
      </div>
      <div class="comment-combat-profile-vitals">
        <span><small>TP</small><b>${escapeMarkup(hitPointText)}</b></span>
        <span><small>RK</small><b>${escapeMarkup(profile?.totalDefense ?? 10)}</b></span>
      </div>
      <div class="comment-combat-profile-stats">
        <span><small>Angriff</small><b>${escapeMarkup(formatModifier(profile?.attackModifier))}</b></span>
        <span><small>Initiative</small><b>${escapeMarkup(formatModifier(profile?.initiative))}</b></span>
        <span><small>Bewegung</small><b>${escapeMarkup(profile?.combat?.movement ?? 0)} m</b></span>
      </div>
      <div class="comment-combat-profile-weapon" title="${escapeMarkup(weaponName)}">
        <span>${escapeMarkup(weaponName)}</span>${damageFormula ? `<b>${escapeMarkup(damageFormula)}</b>` : ''}
      </div>
      ${resources.length
        ? `<ul class="comment-combat-profile-resources">${resources.map(renderResource).join('')}</ul>`
        : '<p class="comment-combat-profile-empty">Keine aktive Ressource</p>'}`;
  }

  function renderPortrait(options = {}) {
    const characterId = String(options.characterId || '').trim();
    if (!characterId || options.secret) return String(options.portraitMarkup || '');
    const displayName = String(options.displayName || 'Figur');
    const panelId = `comment-combat-profile-${safeDomId(options.commentId)}-${Number(options.renderIndex) || 0}-${Number(options.partIndex) || 0}`;
    return `
      <div class="comment-combat-profile-shell" data-comment-combat-profile data-combat-character-id="${escapeMarkup(characterId)}" data-combat-display-name="${escapeMarkup(displayName)}">
        <div class="comment-combat-profile-portrait">${String(options.portraitMarkup || '')}</div>
        <section class="comment-combat-profile-panel" id="${escapeMarkup(panelId)}" data-comment-combat-profile-panel aria-label="Kampfdaten von ${escapeMarkup(displayName)}" hidden></section>
        <button type="button" class="comment-combat-profile-toggle" data-action="toggle-comment-combat-profile" aria-controls="${escapeMarkup(panelId)}" aria-expanded="false" title="Kampfdaten anzeigen">
          <span aria-hidden="true"></span><span class="comment-combat-profile-sr">Kampfdaten von ${escapeMarkup(displayName)} anzeigen</span>
        </button>
      </div>`;
  }

  function closeProfile(root = activeRoot) {
    if (!root) return;
    root.classList.remove('is-profile-open');
    const panel = root.querySelector('[data-comment-combat-profile-panel]');
    const toggle = root.querySelector(TOGGLE_SELECTOR);
    if (panel) panel.hidden = true;
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.title = 'Kampfdaten anzeigen';
    }
    if (activeRoot === root) activeRoot = null;
  }

  function openProfile(root) {
    if (!root) return;
    if (activeRoot && activeRoot !== root) closeProfile(activeRoot);
    const panel = root.querySelector('[data-comment-combat-profile-panel]');
    const toggle = root.querySelector(TOGGLE_SELECTOR);
    const profile = global.AleriaCombat?.getProfile?.(root.dataset.combatCharacterId || '');
    if (!panel || !toggle || !profile) return;

    panel.innerHTML = renderPanel(profile, root.dataset.combatDisplayName || profile.name);
    panel.hidden = false;
    root.classList.add('is-profile-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.title = 'Zum Portr\u00e4t zur\u00fcckkehren';
    activeRoot = root;
  }

  function toggleProfile(trigger) {
    const root = trigger?.closest?.(ROOT_SELECTOR);
    if (!root) return;
    if (root.classList.contains('is-profile-open')) closeProfile(root);
    else openProfile(root);
  }

  document.addEventListener('click', event => {
    const trigger = event.target?.closest?.(TOGGLE_SELECTOR);
    if (trigger) {
      event.preventDefault();
      toggleProfile(trigger);
      return;
    }
    if (activeRoot && !activeRoot.contains(event.target)) closeProfile(activeRoot);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !activeRoot) return;
    const toggle = activeRoot.querySelector(TOGGLE_SELECTOR);
    closeProfile(activeRoot);
    toggle?.focus?.();
  });

  global.AleriaCommentCombatMiniProfile = Object.freeze({
    close: closeProfile,
    renderPortrait
  });
})(window);
