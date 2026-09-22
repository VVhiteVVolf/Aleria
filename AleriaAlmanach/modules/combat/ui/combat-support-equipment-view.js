import { canCarryCombatShield, getCombatMounts, getCombatSupportEquipment } from '../combat-support-equipment.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
function slot(item, kind, selected, disabled = false) {
  const image = /^(?:https?:\/\/|\.\.?\/)/i.test(item.image || '') ? item.image : '';
  const label = kind === 'mount' ? (selected ? 'Beritten' : 'Unberitten · Aufsteigen') : (selected ? 'Links · Schild geführt' : 'Schild + Einhandwaffe');
  return `<button type="button" class="combat-weapon-slot combat-support-slot" data-state="${selected ? 'active' : 'stowed'}" data-combat-controller-action="select-${kind}" data-equipment-id="${escape(item.id)}" aria-pressed="${selected}"${disabled ? ' disabled' : ''}>
    <span class="combat-weapon-slot-icon" aria-hidden="true"><span>${kind === 'mount' ? '♞' : '⬙'}</span>${image ? `<img src="${escape(image)}" data-combat-weapon-image alt="" decoding="async">` : ''}</span>
    <span class="combat-weapon-slot-copy"><strong>${escape(item.name)}</strong><small>${escape(label)}</small></span></button>`;
}
export function renderCombatSupportEquipment(actor, loadout) {
  const support = getCombatSupportEquipment(actor);
  const shields = (actor.armorItems || []).filter(item => item.kind === 'shield');
  const mounts = getCombatMounts(actor);
  const rider = /uchelwyr|rhiddwyr|thegnar|mormaer/i.test(actor.templateSelections?.classId || '');
  return `<div class="combat-support-equipment" data-current-shield="${escape(support.shieldId)}" data-current-mount="${escape(support.mountId)}">
    ${shields.length ? `<div class="combat-support-group"><span class="combat-field-caption">Schild · Linke Hand</span><div class="combat-weapon-slots">${shields.map(item => slot(item, 'shield', item.id === support.shieldId && !loadout.dualWield, !canCarryCombatShield(loadout.right))).join('')}</div></div>` : ''}
    ${mounts.length ? `<div class="combat-support-group"><span class="combat-field-caption">Reittier · ${support.mountId ? 'Beritten' : 'Unberitten'}</span><div class="combat-weapon-slots">${mounts.map(item => slot(item, 'mount', item.id === support.mountId)).join('')}</div><small class="combat-loadout-hint">Auf- oder Absteigen zählt nach der Startaufstellung als Ausrüstungswechsel (1 Bonusaktion). Berittene Techniken benötigen ein gewähltes Reittier.</small></div>` : rider ? '<small class="combat-loadout-hint">Unberitten · Im Inventar ist noch kein verfügbares Reittier hinterlegt.</small>' : ''}
  </div>`;
}
