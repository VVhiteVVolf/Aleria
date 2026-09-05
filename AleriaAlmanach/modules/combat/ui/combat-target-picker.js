function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function prioritizeCombatTargets(targets = [], participantIds = new Set()) {
  return targets.map(target => ({ ...target, inCombat: participantIds.has(String(target.characterId || '')) }))
    .sort((a, b) => Number(b.inCombat) - Number(a.inCombat) || String(a.name || '').localeCompare(String(b.name || ''), 'de'));
}

export function optionLabel(target = {}) {
  const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
  const hp = target.currentHitPoints != null && target.maximumHitPoints != null ? ` · ${target.currentHitPoints}/${target.maximumHitPoints} TP` : '';
  return `${target.name} · ${ready ? `VTD ${target.totalDefense}` : 'Verteidigung fehlt'}${hp}`;
}

export function renderTargetOptions(targets = [], selectedIds = new Set()) {
  const hasRoster = targets.some(target => target.inCombat);
  const groups = hasRoster ? [targets.filter(target => target.inCombat), targets.filter(target => !target.inCombat)] : [targets];
  return groups.map((group, index) => {
    if (!group.length) return '';
    const options = group.map(target => {
      const ready = target.totalDefense != null && Number.isFinite(Number(target.totalDefense));
      const label = optionLabel(target);
      return `<option value="${escapeHtml(target.characterId)}"${selectedIds.has(String(target.characterId)) ? ' selected' : ''}${ready ? '' : ' disabled'}>${escapeHtml(label)}</option>`;
    }).join('');
    return hasRoster ? `<optgroup label="${index === 0 ? 'Aktuelle Kampfliste' : 'Weitere Figuren'}">${options}</optgroup>` : options;
  }).join('');
}

export function renderSelectedTargetPortraits(targets = [], selectedIds = new Set()) {
  const selected = targets.filter(target => selectedIds.has(String(target.characterId)));
  if (!selected.length) return '';
  return `<span class="combat-selected-targets" aria-label="Gewählte Ziele">${selected.map(target => {
    const portrait = String(target.portrait || '').trim();
    const safe = /^(?:https?:\/\/|data:image\/|\.\.?\/|\/[^/])/i.test(portrait);
    return `<span class="combat-target-chip"><span class="combat-target-portrait" aria-hidden="true"><b>${escapeHtml(String(target.name || '?').slice(0, 1))}</b>${safe ? `<img src="${escapeHtml(portrait)}" alt="" data-combat-target-image decoding="async">` : ''}</span><span>${escapeHtml(target.name)}</span></span>`;
  }).join('')}</span>`;
}

export function bindTargetPortraitFallback(composer) {
  composer.addEventListener('error', event => {
    if (event.target.matches?.('[data-combat-target-image]')) event.target.remove();
  }, true);
}
