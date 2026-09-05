import { getActionPoolChoiceGroups } from '../combat-action-progression.js?v=20260905-resource-balance-v2';

function renderChoices(groups, levelUp) {
  return groups.map(group => `<label><span>Steigerung auf Stufe ${group.level}</span><select ${levelUp ? `data-level-up-path="actionPoolChoices.${group.level}"` : `data-combat-pool-choice="${group.level}"`}><option value="" disabled${group.selectedId ? '' : ' selected'}>Pool wählen</option>${group.options.map(option => `<option value="${option.id}"${option.id === group.selectedId ? ' selected' : ''}>${option.name} auf 2 erhöhen</option>`).join('')}</select></label>`).join('');
}

export function renderActionPoolProgression(profile = {}) {
  const groups = getActionPoolChoiceGroups(profile.progression?.actionPoolChoices, profile.progression?.level);
  return `<div class="cp-sheet-resource-group"><div class="cp-sheet-subhead"><div><strong>Poolentwicklung</strong><small>Auf Stufe 10, 15 und 20 jeweils einen Pool auf 2 erhöhen. Besondere Aktionen: 2 / 3 / 4 / 5 / 6 auf Stufe 1 / 8 / 10 / 15 / 20. Aura-Fokus: 1 / 2 / 3 / 4 ab Stufe 8 / 12 / 16 / 20.</small></div></div>${groups.length ? `<div class="cp-sheet-fields">${renderChoices(groups, false)}</div>` : ''}</div>`;
}

export function renderLevelUpActionPools(preview = {}) {
  return `<section class="cp-level-up-section" data-level-up-role="action-pools"><div class="cp-level-up-section-head"><div><span>Aktionsökonomie</span><h4>Poolsteigerung</h4></div><small>Aktion, Bonusaktion und Reaktion: jeweils höchstens 2. Besondere Aktionen und Aura wachsen automatisch.</small></div>${preview.actionPoolChoiceGroups?.length ? `<div class="cp-level-up-fields">${renderChoices(preview.actionPoolChoiceGroups, true)}</div>` : '<p>Die erste frei wählbare Steigerung wird auf Stufe 10 verfügbar.</p>'}</section>`;
}
