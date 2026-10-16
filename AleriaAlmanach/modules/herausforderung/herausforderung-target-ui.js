import { resolveCombatProfile } from '../combat/combat-profile-resolver.js';
import { normalizeChallengeTarget } from './herausforderung-target.js?v=20261016-check-policy-v1';

const bindings = new WeakMap();
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function mountChallengeTargetEditor(root, binding) {
  const host = root.querySelector('[data-herausforderung-target]');
  const previous = bindings.has(host); bindings.set(host, binding);
  const actors = binding.actors, target = binding.getTarget();
  const options = [...actors];
  if (target.actorId && !options.some(actor => actor.id === target.actorId)) options.push({ id: target.actorId, name: target.name || 'Gespeicherte Zielperson' });
  host.innerHTML = `<label>Zielperson · optional<input type="search" data-hct-search placeholder="Zielperson suchen …" aria-label="Zielperson suchen"><select data-hct-target data-herausforderung-field="targetActor"><option value="">Im eindeutigen Duell automatisch zuordnen</option><option value="@none"${target.mode === 'none' ? ' selected' : ''}>Keine Zielperson · Umgebung oder eigene Probe</option>${options.map(actor => `<option value="${escape(actor.id)}"${target.actorId === actor.id ? ' selected' : ''}>${escape(actor.name)}</option>`).join('')}</select></label><small>Die Zielperson wird beim Versuch automatisch angezeigt. Sie ist unabhängig davon, wer die Herausforderung versuchen darf. Bei mehreren Gegnern bitte eine feste Zielperson wählen.</small>`;
  if (previous) return;
  host.addEventListener('change', event => {
    if (!event.target.matches('[data-hct-target]') || root.getAttribute('aria-busy') === 'true') return;
    const current = bindings.get(host), actor = current.actors.find(actor => actor.id === event.target.value);
    if (!actor && event.target.value && event.target.value !== '@none') return;
    current.setTarget(actor ? normalizeChallengeTarget({ actorId: actor.id, name: actor.name, persistence: resolveCombatProfile(actor).persistence }) : normalizeChallengeTarget({ mode: event.target.value === '@none' ? 'none' : 'auto' }));
  });
  host.addEventListener('input', event => {
    if (!event.target.matches('[data-hct-search]')) return;
    const query = event.target.value.toLocaleLowerCase('de').trim();
    for (const option of host.querySelector('select').options) option.hidden = !!option.value && !option.textContent.toLocaleLowerCase('de').includes(query);
  });
}
