import { getChallengeAttemptChoices } from '../skill-checks/skill-challenge-attempt.js';
import { getChallengeAffinityModifier } from '../skill-checks/skill-check-model.js?v=20260928-equipment-art-v4';
import { renderSkillIcon } from '../skill-checks/skill-icon-view.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function createAttemptDialog() {
  const root = document.createElement('div');
  root.id = 'herausforderung-attempt-overlay';
  root.className = 'scene-time-event-overlay herausforderung-attempt-overlay';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-hidden', 'true');
  root.setAttribute('aria-labelledby', 'herausforderung-attempt-title');
  root.setAttribute('aria-describedby', 'herausforderung-attempt-description');
  root.innerHTML = `<section class="herausforderung-attempt-card">
    <header><div><small>Herausforderung angehen</small><h2 id="herausforderung-attempt-title">Welche Fertigkeit möchtest du nutzen?</h2></div><button type="button" data-ha-attempt-action="close" aria-label="Fertigkeitsauswahl schließen">×</button></header>
    <div class="herausforderung-attempt-body"><p class="herausforderung-attempt-target" data-ha-attempt-target></p><p id="herausforderung-attempt-description">Wähle eine passende Fertigkeit für deinen Versuch. Gewürfelt wird erst beim Eintragen deines Beitrags.</p><div class="herausforderung-attempt-choices" data-ha-attempt-choices aria-label="Passende Fertigkeiten"></div></div>
    <footer><span>Ein Versuch · eine Fertigkeit</span><button type="button" data-ha-attempt-action="close">Abbrechen</button></footer>
  </section>`;
  document.body.appendChild(root);
  return root;
}

// One lazily mounted, feature-owned dialog. Selection hands over only a skill
// ID; the caller rechecks the current scene before the composer opens.
export function createHerausforderungAttemptPicker() {
  let root = null, current = null;
  function close() {
    if (!root) return;
    current = null;
    globalThis.deactivateDialog(root.id);
  }
  function ensure() {
    if (root) return root;
    root = createAttemptDialog();
    root.addEventListener('click', event => {
      const button = event.target.closest('[data-ha-attempt-action]');
      if (event.target === root || button?.dataset.haAttemptAction === 'close') { close(); return; }
      if (button?.dataset.haAttemptAction !== 'choose' || !current) return;
      const skillId = button.dataset.skillId;
      if (!current.choices.some(skill => skill.id === skillId)) return;
      const onChoose = current.onChoose;
      close();
      onChoose(skillId);
    });
    root.addEventListener('keydown', event => {
      if (event.defaultPrevented || event.key !== 'Escape') return;
      event.preventDefault(); event.stopImmediatePropagation(); close();
    }, true);
    return root;
  }
  return Object.freeze({ open(challenge, onChoose) {
    const choices = getChallengeAttemptChoices(challenge);
    if (!choices.length) return false;
    const dialog = ensure();
    current = { choices, onChoose };
    dialog.querySelector('[data-ha-attempt-target]').textContent = `${challenge.visibleText || challenge.authorName || 'Lösungsweg'} · SG ${challenge.difficulty}`;
    dialog.querySelector('[data-ha-attempt-choices]').innerHTML = choices.map(skill => {
      const modifier = getChallengeAffinityModifier(challenge, skill.id);
      return `<button type="button" class="herausforderung-attempt-choice" data-ha-attempt-action="choose" data-skill-id="${escape(skill.id)}">${renderSkillIcon(skill)}<span><strong>${escape(skill.label)}</strong><small>Passende Fertigkeit · ${modifier >= 0 ? '+' : '−'}${Math.abs(modifier)}</small></span><span aria-hidden="true">→</span></button>`;
    }).join('');
    globalThis.activateDialog(dialog.id, { initialFocus: '[data-ha-attempt-action="choose"]' });
    return true;
  }, close });
}
