import { getCombatFormPresentation } from '../../combat-styles/combat-form-presentation.js';
import { getClassPageIcon } from '../../classes/class-icon-registry.js';

const labels = Object.freeze({ bow: 'Bogen', crossbow: 'Armbrust', firearm: 'Feuerwaffe', sword: 'Schwert', dagger: 'Sax / Dolch', axe: 'Axt', mace: 'Streitkolben', spear: 'Speer', polearm: 'Stangenwaffe', staff: 'Stab', shield: 'Schild', unarmed: 'Waffenlos', natural: 'Naturwaffe', arcane: 'Arkan', improvised: 'Improvisierte Waffe', other: 'Sonstige Waffe' });
const families = Object.freeze({ ranged: ['Fernkampf · Bogen & Schusswaffen', 'bow'], throwing: ['Wurfwaffen', 'spear'], 'one-handed': ['Einhandwaffen · Seitenwaffen', 'one-handed'], spear: ['Speer & Stangenwaffen', 'spear'], 'two-handed': ['Zweihandwaffen', 'two-handed'], paired: ['Zwei Waffen', 'one-handed'], shield: ['Waffe & Schild', 'shield'], universal: ['Waffenübergreifend', 'universal'], unarmed: ['Waffenlos & Naturwaffen', 'unarmed'], magic: ['Magische Handlungen', 'magic'], other: ['Sonstige Handlungen', 'universal'] });
const defaultOrder = ['one-handed', 'spear', 'two-handed', 'paired', 'shield', 'ranged', 'throwing', 'universal', 'unarmed', 'magic', 'other'];
const classOrders = Object.freeze({ skytte: ['ranged', 'one-handed', 'spear'], helwyr: ['ranged', 'one-handed', 'spear'], stralieri: ['ranged', 'one-handed'], uchelwyr: ['spear', 'one-handed'], cantref: ['spear', 'one-handed'], thegnar: ['spear', 'one-handed'], lancieri: ['spear', 'one-handed'], skjaldr: ['paired', 'two-handed', 'one-handed'], magier: ['magic'], skalde: ['magic', 'one-handed'] });
const kindLabels = Object.freeze({ weapon: 'Waffenangriffe', 'equipment-switch': 'Waffenwechsel', technique: 'Weitere Kampftechniken', ability: 'Fähigkeiten', spell: 'Zauber', prayer: 'Gebete', song: 'Gesänge' });
const classKey = value => String(value || '').trim().toLocaleLowerCase('de').replace(/\s+/g, '-');
const nameOfClass = id => getClassPageIcon(id)?.pageName || id.replace(/^./, c => c.toLocaleUpperCase('de'));

/** Presentation only. Additional class IDs never grant techniques or resources. */
export function getArsenalClassIds(actor = {}) {
  const extra = actor.classIds || actor.templateSelections?.classIds || actor.classTraining?.classIds || [];
  const declared = [actor.templateSelections?.classId, ...(Array.isArray(extra) ? extra : []), ...(Array.isArray(actor.classes) ? actor.classes : []).map(c => typeof c === 'string' ? c : c.classId || c.id), ...String(actor.identity?.archetype || '').split(/\s*(?:\/|\+|,| und )\s*/i)];
  return [...new Set(declared.map(classKey).filter(Boolean))];
}

function trainingOf(entry) {
  const cenyr = entry.cenyrTraining || {}, culture = entry.cultureTraining || {};
  return { ...cenyr, ...culture, branchId: culture.branchId || cenyr.branchId || '',
    allowedClassIds: [...new Set([...(cenyr.allowedClassIds || []), ...(culture.allowedClassIds || [])])],
    ...Object.fromEntries(['requiresShield', 'requiresTwoHands', 'requiresDualWield', 'requiresMounted'].map(key => [key, !!(cenyr[key] || culture[key])])) };
}

export function getActionWeaponPresentation(actor, action = {}, entry = action) {
  const training = trainingOf(entry);
  const specificWeapons = (entry.compatibleWeaponIds || []).map(id => (actor.weapons || []).find(w => w.id === id)).filter(Boolean);
  const types = [...new Set([...(entry.weaponTypes || []), ...specificWeapons.map(w => w.weaponType)])];
  if (['weapon', 'equipment-switch'].includes(action.kind)) types.push(entry.weaponType || action.weapon?.weaponType || 'other');
  const branch = String(training.branchId || '');
  let id;
  if (['spell', 'prayer', 'song'].includes(action.kind)) id = 'magic';
  else if (training.requiresShield || types.length === 1 && types[0] === 'shield') id = 'shield';
  else if (training.requiresDualWield) id = 'paired';
  else if (types.length && types.every(t => ['bow', 'crossbow', 'firearm'].includes(t))) id = 'ranged';
  else if (training.requiresTwoHands || action.kind === 'weapon' && !entry.versatileDamageFormula && /zweih[aä]nd|two.hand/i.test(entry.properties || '')) id = 'two-handed';
  else if (action.kind === 'weapon' && /\(paar\)|waffenpaar/i.test(entry.name || '')) id = 'paired';
  else if (/throwing$/.test(branch)) id = 'throwing';
  else if (types.length && types.every(t => ['spear', 'polearm', 'staff'].includes(t))) id = 'spear';
  else if (types.length && types.every(t => ['sword', 'axe', 'dagger', 'mace'].includes(t))) id = 'one-handed';
  else if (types.length && types.every(t => ['unarmed', 'natural'].includes(t))) id = 'unarmed';
  else if (/-voice$/.test(branch)) id = 'other';
  else if (action.kind === 'technique' && (!types.length || types.length > 4)) id = 'universal';
  else if (types.length > 1) id = 'universal';
  else id = 'other';
  const [label, defaultIcon] = families[id];
  const icon = id === 'paired' ? 'paired' : id === 'one-handed' && types.length === 1 && ['axe', 'dagger', 'mace'].includes(types[0]) ? types[0] : defaultIcon;
  const weaponNames = [...new Set([...types.map(t => labels[t] || t), ...specificWeapons.map(w => w.name)])];
  const requirements = [training.requiresShield && 'Schild aktiv geführt', training.requiresTwoHands && 'zweihändig', training.requiresDualWield && 'zwei Waffen gleichzeitig', training.requiresMounted && 'beritten'].filter(Boolean);
  const permitted = weaponNames.length ? weaponNames.join(', ') : id === 'universal' ? 'Beliebige kompatible Waffe' : id === 'magic' ? 'Zauber / Gebet / Gesang' : /-voice$/.test(branch) ? 'Stimme · keine Waffe erforderlich' : 'Keine bestimmte Waffengattung';
  return { id, label, icon, types, mounted: !!training.requiresMounted, title: `${permitted}${requirements.length ? ` · ${requirements.join(' · ')}` : ''}` };
}

export function getActionCategoryPresentation(actor = {}, action = {}, entry = action) {
  const form = action.kind === 'equipment-switch' ? null : getCombatFormPresentation(entry);
  const personal = action.kind === 'technique' && /persönlich|personal/i.test(entry.trainingForm || '');
  const actorClasses = getArsenalClassIds(actor);
  const allowed = trainingOf(entry).allowedClassIds || [];
  const owners = allowed.length ? actorClasses.filter(id => allowed.includes(id)) : actorClasses;
  const classIds = owners.length ? owners : allowed;
  const classLabel = classIds.map(nameOfClass).join(' / ');
  const baseGroup = personal ? 'Persönliche Techniken' : form?.label || kindLabels[action.kind] || action.kindLabel || 'Handlungen';
  const group = !personal && action.kind === 'technique' && classLabel ? `${classLabel} · ${baseGroup}` : baseGroup;
  const groupKey = personal ? 'personal-techniques' : `${action.kind === 'technique' ? `classes:${classIds.join('+')}:` : ''}${form?.key || `kind:${action.kind || 'action'}`}`;
  return { group, groupKey, classIds, classLabel, formLabel: personal ? '' : form?.label || '', personal, weaponCategory: getActionWeaponPresentation(actor, action, entry) };
}

export function compareArsenalChoices(actor, a, b) {
  const preferred = (a.classIds?.length && !a.personal ? a.classIds : getArsenalClassIds(actor)).flatMap(id => classOrders[id] || []);
  const order = [...new Set([...preferred, ...defaultOrder])];
  return order.indexOf(a.weaponCategory.id) - order.indexOf(b.weaponCategory.id) || a.minimumLevel - b.minimumLevel || a.label.localeCompare(b.label, 'de');
}

export function getActionWeaponSections(choices = []) {
  const sections = new Map();
  for (const choice of choices) {
    const key = `${choice.groupKey}|weapon:${choice.weaponCategory.id}`;
    if (!sections.has(key)) sections.set(key, { key, groupKey: choice.groupKey, weapon: choice.weaponCategory, choices: [] });
    sections.get(key).choices.push(choice);
  }
  return [...sections.values()].map(section => ({ ...section, weapon: { ...section.weapon,
    icon: section.weapon.id === 'paired' ? 'paired' : families[section.weapon.id][1],
    title: [...new Set(section.choices.map(choice => choice.weaponCategory.title))].join(' / ') } }));
}
