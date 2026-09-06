import { getCultureClassProgression } from './culture-class-progression.js';
import { describeTechniqueDamage } from '../../../AleriaAlmanach/modules/combat/combat-technique-damage.js?v=20260905-party-combat-v1';

function initializeCultureTraining(root) {
  const select = root.querySelector('[data-role="training-level"]');
  const summary = root.querySelector('[data-role="training-summary"]');
  const weaponFilter = root.querySelector('[data-role="training-weapon"]');
  const earnedOnly = root.querySelector('[data-role="training-earned-only"]');
  const cards = [...root.querySelectorAll('[data-training-attack]')];
  function applyFilters() {
    cards.forEach(card => {
      card.hidden = Boolean(weaponFilter?.value && card.dataset.trainingWeapon !== weaponFilter.value)
        || Boolean(earnedOnly?.checked && card.dataset.available !== 'true');
    });
  }
  function render(level) {
    const plan = getCultureClassProgression(root.dataset.cultureClass, level);
    if (!plan) return;
    select.value = String(plan.selectedLevel);
    const available = new Set(plan.attackCatalog
      .filter(attack => attack.minimumLevel <= plan.selectedLevel)
      .map(attack => attack.id));
    const slots = plan.earnedTechniqueSlots.length;
    const confirmed = plan.availableAttacks.length;
    const attacksById = new Map(plan.attackCatalog.map(attack => [attack.id, attack]));
    summary.textContent = `Stufe ${plan.selectedLevel} · ${slots} ${slots === 1 ? 'Attackenslot' : 'Attackenslots'} verdient · ${available.size} ${available.size === 1 ? 'Katalogoption' : 'Katalogoptionen'} bis hier · ${plan.status === 'draft' ? 'Ausbildungsentwurf' : `${confirmed} bestätigt`}`;
    const resources = root.querySelector('[data-training-resources]');
    if (plan.skaldReference) {
      summary.textContent = plan.selectedLevel > 5 ? `Stufe ${plan.selectedLevel} · Weitere Skaldenausbildung offen; Referenz bis Stufe 5`
        : `Stufe ${plan.selectedLevel} · ${plan.skaldReference.repertoire.filter(entry => entry.minimumLevel <= plan.selectedLevel).length} Repertoireeinträge · Ausbildungsentwurf nach Freya`;
      if (resources) resources.textContent = plan.selectedLevel > 5 ? 'Stufe 6–20: Skaldenentwicklung und Mehrklassenregeln noch offen.'
        : 'Gemeinsame Grundpools: Aktion 1 / Bonusaktion 1 / Reaktion 1 · Besondere Aktionen 2 · Aura-Fokuspunkte 0. Mana und Zauberplätze nach dem eigenen Bogen.';
    }
    if (resources && !plan.skaldReference && plan.levels[plan.selectedLevel - 1]?.resources) {
      const pools = plan.levels[plan.selectedLevel - 1].resources;
      resources.textContent = `Besondere Aktionen ${pools['special-action']} · Aura-Fokuspunkte ${pools['aura-focus']} · ${plan.selectedLevel < 10 ? 'Aktion 1 / Bonusaktion 1 / Reaktion 1' : plan.selectedLevel < 15 ? 'Einen Grundpool auf 2 wählen' : plan.selectedLevel < 20 ? 'Zwei Grundpools auf 2 wählen' : 'Aktion 2 / Bonusaktion 2 / Reaktion 2'}`;
    }
    const berserker = root.querySelector('[data-training-berserker]');
    if (berserker) berserker.textContent = plan.berserker
      ? `Stufe ${plan.selectedLevel} · ${plan.berserker.name}: ${plan.berserker.description}`
      : `Stufe ${plan.selectedLevel} · Berserkergang erst ab Stufe 6 verfügbar.`;
    root.querySelectorAll('[data-training-berserker-level]').forEach(row => {
      if (Number(row.dataset.trainingBerserkerLevel) === plan.berserker?.minimumLevel) row.setAttribute('aria-current', 'step');
      else row.removeAttribute('aria-current');
    });
    root.querySelectorAll('[data-training-repertoire-level]').forEach(entry => {
      entry.dataset.available = String(Number(entry.dataset.trainingRepertoireLevel) <= Math.min(5, plan.selectedLevel));
    });
    cards.forEach(card => {
      card.dataset.available = String(available.has(card.dataset.trainingAttack));
      const attack = attacksById.get(card.dataset.trainingAttack);
      const damage = card.querySelector('[data-training-damage]');
      if (damage && attack) damage.textContent = describeTechniqueDamage(attack, { progression: { level: plan.selectedLevel } });
    });
    root.querySelectorAll('[data-training-feature-level]').forEach(feature => {
      feature.dataset.available = String(Number(feature.dataset.trainingFeatureLevel) <= plan.selectedLevel);
    });
    applyFilters();
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
  root.querySelectorAll('[data-training-controls]').forEach(control => { control.hidden = false; });
  weaponFilter?.addEventListener('change', applyFilters);
  earnedOnly?.addEventListener('change', applyFilters);
}

const root = document.querySelector('[data-culture-class]');
if (root) initializeCultureTraining(root);
