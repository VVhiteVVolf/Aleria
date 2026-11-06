import { COMBAT_ATTRIBUTE_DEFINITIONS, COMBAT_WEAPON_TYPE_OPTIONS } from '../combat-profile-model.js';

const signed = value => `${Number(value) >= 0 ? '+' : '−'}${Math.abs(Number(value))}`;
const attribute = key => COMBAT_ATTRIBUTE_DEFINITIONS.find(entry => entry.key === key)?.shortLabel || key;
const weapon = key => COMBAT_WEAPON_TYPE_OPTIONS.find(entry => entry.id === key || entry.value === key)?.label || key;
const mode = value => ({ advantage: 'Vorteil', disadvantage: 'Nachteil' })[value];
const proficiency = value => ({ trained: 'Übung', proficient: 'Übung', expertise: 'Expertise', half: 'Halbe Übung' })[value];
const saveKind = key => ({ fear: 'Furcht', poison: 'Gift', bleeding: 'Blutungsfolgen' })[key] || key;
export const getCombatDamageTypeLabel = key => ({ fire: 'Feuer', feuer: 'Feuer', cold: 'Kälte', kaelte: 'Kälte', 'kälte': 'Kälte', lightning: 'Blitz', blitz: 'Blitz', elektrisch: 'Blitz', 'elektrizität': 'Blitz',
  poison: 'Gift', gift: 'Gift', acid: 'Säure', saeure: 'Säure', 'säure': 'Säure', thunder: 'Donner', donner: 'Donner', schall: 'Donner', sonic: 'Donner', all: 'alle Schadensarten' })[String(key).toLocaleLowerCase('de')] || key;

/** Describes stored mechanics only; never applies a bonus or infers one from prose. */
export function describeCombatMechanics(mechanics = {}) {
  const labels = [
    ['attack', mechanics.attackScope === 'weapon' ? 'Waffenangriff' : 'Angriff'],
    ['damage', mechanics.damageScope === 'all-effects' ? 'Schaden aller Wirkungen' : 'Waffenschaden'],
    ['armorClass', 'RK'], ['initiative', 'Initiative'], ['skill', 'Alle Fertigkeitsproben'],
    ['savingThrow', 'Alle Attributsrettungswürfe'], ['spellAttack', 'Zauberangriff'], ['spellSaveDc', 'Zauber-SG'],
    ['strength', 'Kraftwert'], ['movement', 'Bewegung (m)'], ['maximumHitPoints', 'Max. TP'],
    ['passivePerception', 'Passive Wahrnehmung'], ['combatStartTemporaryHitPoints', 'Temporäre TP zu Kampfbeginn']
  ];
  const parts = labels.filter(([key]) => Number(mechanics[key])).map(([key, label]) => `${label} ${signed(mechanics[key])}`);
  for (const entry of mechanics.attributeModifiers || []) if (Number(entry.bonus)) parts.push(`${attribute(entry.attributeKey)}-Wert ${signed(entry.bonus)}`);
  for (const entry of mechanics.attributeCaps || []) parts.push(`${attribute(entry.attributeKey)}-Wert höchstens ${entry.maximum}`);
  for (const entry of mechanics.skillModifiers || []) if (Number(entry.bonus)) parts.push(`${entry.name} ${signed(entry.bonus)}`);
  for (const entry of mechanics.skillProficiencies || []) if (proficiency(entry.proficiency)) parts.push(`${entry.name}: ${proficiency(entry.proficiency)}`);
  for (const entry of mechanics.weaponModifiers || []) {
    const weapons = entry.weaponTypes?.length ? entry.weaponTypes.map(weapon).join('/') : 'Alle Waffen';
    if (Array.isArray(entry.attackAttributes) && !entry.attackAttributes.length) continue;
    const scope = entry.attackAttributes?.length
      ? `${weapons} mit ${entry.attackAttributes.map(attribute).join('/')} als Angriffsattribut` : weapons;
    if (Number(entry.attack)) parts.push(`${scope}: Angriff ${signed(entry.attack)}`);
    if (Number(entry.damage)) parts.push(`${scope}: Schaden ${signed(entry.damage)}`);
  }
  if (mechanics.dexterityWeaponTypes?.length) parts.push(`GES für ${mechanics.dexterityWeaponTypes.map(weapon).join('/')}`);
  for (const entry of mechanics.saveAttributeModifiers || []) if (Number(entry.bonus)) parts.push(`${attribute(entry.attributeKey)}-Rettung ${signed(entry.bonus)}`);
  for (const entry of mechanics.saveModifiers || []) if (Number(entry.bonus)) parts.push(`Rettung gegen ${saveKind(entry.kind)} ${signed(entry.bonus)}`);
  for (const [key, label] of [['attackRollMode', 'Angriff'], ['skillRollMode', 'Fertigkeitsproben'], ['savingThrowRollMode', 'Rettungswürfe']]) {
    if (mode(mechanics[key])) parts.push(`${label}: ${mode(mechanics[key])}`);
  }
  for (const [key, label] of [['savingThrowAdvantageAttributes', 'Vorteil'], ['savingThrowDisadvantageAttributes', 'Nachteil']]) {
    if (mechanics[key]?.length) parts.push(`${label} auf ${mechanics[key].map(attribute).join('/')}-Rettung`);
  }
  for (const [key, label] of [['bonusDamageFormula', 'Zusatzschaden'], ['weaponBonusDamageFormula', 'Waffen-Zusatzschaden']]) {
    if (mechanics[key]) parts.push(`${label} ${String(mechanics[key]).replace(/d/gi, 'W')}`);
  }
  const affinities = (mechanics.damageAffinities || []).map(entry => {
    const response = { resistant: 'Resistenz', vulnerable: 'Verwundbarkeit', immune: 'Immunität' }[entry.response];
    if (!response) return '';
    const scope = { magical: ' · nur magisch', nonmagical: ' · nur nichtmagisch' }[entry.magicScope] || '';
    return `${response}: ${getCombatDamageTypeLabel(entry.damageType)}${scope}`;
  }).filter(Boolean);
  parts.push(...affinities);
  if (mechanics.blocksActions) parts.push('Handlungen gesperrt');
  if (mechanics.naturalOneReroll) parts.push('Natürliche 1: einmal automatisch neu würfeln; Ersatzwurf gilt');
  if (Number(mechanics.criticalFailureMaximum) > 1) parts.push(`Natürliche 1–${Number(mechanics.criticalFailureMaximum)}: kritischer Fehlschlag`);
  return [...new Set(parts)];
}

export function summarizeCombatMechanics(mechanics = {}) {
  return describeCombatMechanics(mechanics).join(' · ');
}
