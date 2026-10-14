const bindings = new WeakMap();
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function mountChallengeAudience(root, { audience, getActors, combatContext, getCombatBound, getCombatRequired = () => false, onChange }) {
  const host = root.querySelector('[data-herausforderung-audience]');
  const previous = bindings.get(host);
  const binding = { root, host, audience, getActors, combatContext, getCombatBound, getCombatRequired, onChange, search: previous?.search || '' };
  bindings.set(host, binding);
  host.innerHTML = `<label>Zielgruppe<select data-ha-field="mode"><option value="all">Alle Szenenteilnehmer</option><option value="combatants">Nur Teilnehmer des aktiven Kampfes</option><option value="selected">Bestimmte Figuren</option></select></label><div data-ha-role="selected"><label>Figuren suchen<input type="search" data-ha-field="search" placeholder="Name der Figur …"></label><div class="herausforderung-audience-people" data-ha-role="people"></div><p data-ha-role="selection" class="herausforderung-note"></p></div><label class="herausforderung-combat-checkbox"><input type="checkbox" data-ha-field="combatBound">An diesen aktiven Kampf binden</label><p class="herausforderung-note" data-ha-role="combat-note"></p><datalist id="herausforderung-combat-resources"></datalist><datalist id="herausforderung-combat-conditions"></datalist><datalist id="herausforderung-combat-damage-types">${['physisch','Hieb','Stich','Wucht','Feuer','Frost','Blitz','Gift','Säure','Licht','Nekrotisch','Psychisch'].map(type => `<option value="${type}"></option>`).join('')}</datalist>`;
  host.querySelector('[data-ha-field="mode"]').value = audience.mode;
  host.querySelector('[data-ha-field="search"]').value = binding.search;
  if (!previous) {
    host.addEventListener('input', event => {
      const current = bindings.get(host);
      if (event.target.dataset.haField === 'search') { current.search = event.target.value; renderPeople(current); }
    });
    host.addEventListener('change', event => {
      const current = bindings.get(host), target = event.target;
      if (root.getAttribute('aria-busy') === 'true') return;
      if (target.dataset.haField === 'mode') current.audience.mode = target.value;
      else if (target.dataset.haActorId) current.audience.actorIds = target.checked ? [...new Set([...current.audience.actorIds, target.dataset.haActorId])] : current.audience.actorIds.filter(id => id !== target.dataset.haActorId);
      else if (target.dataset.haField === 'combatBound') current.onChange(target.checked);
      else return;
      renderPeople(current); current.onChange();
    });
  }
  renderPeople(binding);
}

function renderPeople(binding) {
  const { host, audience, combatContext } = binding;
  const actors = binding.getActors();
  const needle = binding.search.toLocaleLowerCase('de');
  host.querySelector('[data-ha-role="selected"]').hidden = audience.mode !== 'selected';
  host.querySelector('[data-ha-role="people"]').innerHTML = actors.filter(actor => String(actor.name).toLocaleLowerCase('de').includes(needle)).slice(0, 40).map(actor => `<label><input type="checkbox" data-ha-actor-id="${escape(actor.id)}"${audience.actorIds.includes(actor.id) ? ' checked' : ''}>${escape(actor.name)}</label>`).join('') || '<p>Keine passende Figur.</p>';
  host.querySelector('[data-ha-role="selection"]').textContent = audience.actorIds.length ? `Ausgewählt: ${audience.actorIds.map(id => actors.find(actor => actor.id === id)?.name || id).join(', ')}` : 'Mindestens eine Figur auswählen.';
  const bound = host.querySelector('[data-ha-field="combatBound"]');
  bound.checked = audience.mode === 'combatants' || binding.getCombatBound();
  bound.disabled = audience.mode === 'combatants' || binding.getCombatRequired() || !combatContext.encounterId;
  host.querySelector('[data-ha-role="combat-note"]').textContent = combatContext.encounterId ? `Aktiver Kampf: ${combatContext.participants.map(participant => participant.name).join(' · ')}. Kampfgebundene Herausforderungen enden mit diesem Kampf.` : 'Derzeit ist kein Kampf aktiv. Kampfteilnehmer und Wirkungen bis Kampfende benötigen einen aktiven Kampf.';
  for (const [role, field] of [['resources', 'resources'], ['conditions', 'conditions']]) {
    const values = new Map(combatContext.participants.flatMap(participant => (participant[field] || []).map(item => [item.id, item.name])));
    host.querySelector(`#herausforderung-combat-${role}`).innerHTML = [...values].map(([id, name]) => `<option value="${escape(id)}">${escape(name)}</option>`).join('');
  }
}

export function refreshChallengeAudience(root) {
  const binding = bindings.get(root.querySelector('[data-herausforderung-audience]'));
  if (binding) renderPeople(binding);
}
