const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderChallengeEffectUsage(effect) {
  return `<div class="herausforderung-reward-grid"><label>Verbrauch<select data-hr-field="usageScope">${[['', 'Während der angegebenen Dauer'], ['attack', 'Nächster einzelner Angriff'], ['action', 'Nächste vollständige Kampfaktion']].map(([value,label]) => `<option value="${value}"${(effect.usage?.scope || '') === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label>${effect.usage ? '<label>Auslösende Figur<select data-hr-field="usageActorId" data-hr-usage-actor></select></label>' : ''}</div>${effect.usage ? '<p class="herausforderung-note">Einmaliger Verbrauch gilt für Angriff, Rüstungsklasse oder Angriffsvorteil/-nachteil. Er verbraucht sich auch bei einem verfehlten Angriff.</p>' : ''}`;
}

export function renderChallengeUsageActorOptions(context, selected = '') {
  return `<option value="">Jede angreifende Figur</option>${(context.participants || []).map(actor => `<option value="${escape(actor.actorId)}"${actor.actorId === selected ? ' selected' : ''}>${escape(actor.name)}</option>`).join('')}`;
}

export function updateChallengeEffectUsage(effect, field, value) {
  if (field === 'usageScope') {
    if (!value) delete effect.usage;
    else effect.usage = { scope: value, ...(effect.usage?.actorId ? { actorId: effect.usage.actorId } : {}) };
    return true;
  }
  if (field === 'usageActorId' && effect.usage) {
    if (value) effect.usage.actorId = value; else delete effect.usage.actorId;
    return true;
  }
  return false;
}
