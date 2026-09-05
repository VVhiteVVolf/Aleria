import { getCenyrClassProgression } from '../../../AleriaAlmanach/modules/classes/cenyr/cenyr-class-progression.js?v=20260905-damage-balance-v1';
import { describeTechniqueDamage } from '../../../AleriaAlmanach/modules/combat/combat-technique-damage.js?v=20260905-party-combat-v1';

function initializeCultureTraining(root) {
  const select = root.querySelector('[data-role="training-level"]');
  const summary = root.querySelector('[data-role="training-summary"]');
  function render(level) {
    const plan = getCenyrClassProgression(root.dataset.cultureClass, level);
    select.value = String(plan.selectedLevel);
    const available = new Set(plan.attackCatalog
      .filter(attack => attack.minimumLevel <= plan.selectedLevel)
      .map(attack => attack.id));
    const slots = plan.earnedTechniqueSlots.length;
    const confirmed = plan.availableAttacks.length;
    const attacksById = new Map(plan.attackCatalog.map(attack => [attack.id, attack]));
    summary.textContent = `Stufe ${plan.selectedLevel} · ${slots} ${slots === 1 ? 'Attackenslot' : 'Attackenslots'} verdient · ${available.size} ${available.size === 1 ? 'Katalogoption' : 'Katalogoptionen'} bis hier · ${confirmed} bestätigt`;
    root.querySelectorAll('[data-training-attack]').forEach(card => {
      card.dataset.available = String(available.has(card.dataset.trainingAttack));
      const attack = attacksById.get(card.dataset.trainingAttack);
      const damage = card.querySelector('[data-training-damage]');
      if (damage && attack) damage.textContent = describeTechniqueDamage(attack, { progression: { level: plan.selectedLevel } });
    });
    root.querySelectorAll('[data-training-row]').forEach(row => {
      if (Number(row.dataset.trainingRow) === plan.selectedLevel) row.setAttribute('aria-current', 'step');
      else row.removeAttribute('aria-current');
    });
  }
  select.addEventListener('change', () => {
    render(select.value);
    const url = new URL(window.location.href);
    url.searchParams.set('stufe', select.value);
    window.history.replaceState(null, '', url);
  });
  render(new URL(window.location.href).searchParams.get('stufe') || 1);
  root.querySelector('[data-training-controls]').hidden = false;
}

const root = document.querySelector('[data-culture-class]');
if (root) initializeCultureTraining(root);
