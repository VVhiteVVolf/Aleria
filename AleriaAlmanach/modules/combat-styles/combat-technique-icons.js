// Presentation only. Stable catalogue identity also resolves icons for older
// character copies without migrating a profile or a historical combat receipt.
const ROOT = '/AleriaAlmanach/public/assets/combat-technique-icons';
export const COMBAT_TECHNIQUE_ICON_MOTIFS = Object.freeze([
  'sword-slash', 'parry', 'shield-guard', 'spear-thrust', 'bow-shot',
  'axe-cleave', 'hammer-strike', 'harpoon-pull', 'crossbow-shot',
  'mounted-charge', 'sidestep', 'focus', 'staff-strike', 'trident-lock',
  'rapier-thrust', 'paired-swords', 'shield-bash', 'bow-volley',
  'flail-swing', 'dagger-strike', 'spear-sweep'
]);

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function getCombatTechniqueIconMotif(entry = {}) {
  const id = String(entry.catalogTechniqueId || entry.sourceId || entry.id || '');
  if (!['drachentanz', 'sirenentanz'].includes(entry.combatStyleId)
    && !/^(?:technique:)?combat-style-(?:drachentanz|sirenentanz)-/.test(id)) return '';
  const text = normalized([id, entry.name, entry.weaponLabel, entry.requirements].join(' '));
  const types = entry.weaponTypes || [];
  const training = { ...entry.cenyrTraining, ...entry.cultureTraining, ...entry.vennyrTraining };
  const effects = entry.effects || [];
  const damaging = entry.damageModel?.mode === 'weapon-dice' || effects.some(effect => effect.type === 'damage');
  const shield = training.requiresShield || /schild/.test(text);
  const guards = effects.some(effect => Number(effect.condition?.mechanics?.armorClass) > 0);
  if (!damaging) {
    if (guards || /deckung|schutz|schuppe|parade|hut\b|wacht/.test(text)) return shield ? 'shield-guard' : 'parry';
    if (/schritt|ruckzug|wende|wechsel|flanke/.test(text)) return 'sidestep';
    return 'focus';
  }
  if (shield) return 'shield-bash';
  if (training.requiresMounted || entry.requiresMounted) return 'mounted-charge';
  if (training.requiresDualWield || /zwillings|zweiwaffen|doppelklinge/.test(text)) return 'paired-swords';
  if (/harpune|harpoon|leinen/.test(text)) return 'harpoon-pull';
  if (types.includes('crossbow') || /armbrust|bolzen/.test(text)) return 'crossbow-shot';
  if (types.includes('bow') && !types.includes('sword') || /bogenschuss|pfeil|langbogen|kurzbogen/.test(text)) {
    return Number(entry.maximumTargets) > 1 || /salve|regen|fache/.test(text) ? 'bow-volley' : 'bow-shot';
  }
  if (/rapier/.test(text) || types.includes('rapier')) return 'rapier-thrust';
  if (/dreizack|trident/.test(text)) return 'trident-lock';
  if (/dolch|dagger|kurze klinge/.test(text) || types.length === 1 && types[0] === 'dagger') return 'dagger-strike';
  if (/morgenstern|flegel|morningstar|flail/.test(text) && !/axt.*hammer/.test(text)) return 'flail-swing';
  if (/hammer|kolben|rabenschnabel/.test(text) || types.length === 1 && ['hammer', 'mace'].includes(types[0])) return 'hammer-strike';
  if (/axt|axe/.test(text) || types.length === 1 && types[0] === 'axe') return 'axe-cleave';
  if (/kampfstab|zauberstab|schaft|staff/.test(text) || types.includes('staff')) return 'staff-strike';
  if (/speer|lanze|partisane|hellebarde|glefe|polearm/.test(text) || types.some(type => ['spear', 'polearm'].includes(type)) && !types.includes('sword')) {
    return Number(entry.maximumTargets) > 1 || /kreis|bogen|feger|schweif|sichel/.test(text) ? 'spear-sweep' : 'spear-thrust';
  }
  if (/parade|antwort|abfang|konter|bindung/.test(text)) return 'parry';
  return 'sword-slash';
}

export function getCombatTechniqueIconSource(entry = {}) {
  const motif = getCombatTechniqueIconMotif(entry);
  return motif ? `${ROOT}/${motif}.png` : '';
}
