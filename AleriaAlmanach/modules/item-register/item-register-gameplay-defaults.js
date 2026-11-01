// Initial mechanics for versioned catalogue definitions, never a migration of
// existing possessions. IDs are explicit: prose/name similarity is not identity.
// Weapon dice and defenses follow Aleria's explicitly approved catalogue balance.
import { balanceArmorInventoryItem } from '../character-equipment/equipment-armor-rules.js';

const weaponBaselines = {
  stahlschwert: ['sword', 'sword', '1d8', 'Hieb', '1d10'],
  langschwert: ['sword', 'sword', '1d8', 'Hieb', '1d10'],
  ritterschwert: ['sword', 'greatsword', '1d12', 'Hieb'],
  dreizack: ['spear', 'trident', '1d8', 'Stich', '1d10'],
  flegel: ['mace', 'flail', '3d4', 'Wucht'],
  streitaxt: ['axe', 'greataxe', '1d12', 'Hieb'],
  rattenpruegel: ['mace', 'club', '1d4', 'Wucht'],
  hellebarde: ['polearm', 'halberd', '1d10', 'Hieb'],
  armbrust: ['crossbow', 'light-crossbow', '1d8', 'Stich'],
  streitkolben: ['mace', 'club', '1d6', 'Wucht'],
  kriegshammer: ['mace', 'maul', '2d6', 'Wucht'],
  morgenstern: ['mace', 'morningstar', '1d8', 'Stich'],
  lanze: ['spear', 'lance', '1d12', 'Stich'],
  'einfacher-bogen': ['bow', 'shortbow', '1d6', 'Stich'],
  kurzbogen: ['bow', 'shortbow', '1d6', 'Stich'],
  langbogen: ['bow', 'longbow', '1d8', 'Stich'],
  opferdolch: ['dagger', 'dagger', '1d4', 'Stich']
};
const lightArmor = { lederruestung: 11, 'verstaerkte-lederruestung': 12, stoffruestung: 11, fellruestung: 11, gambeson: 12 };
const mediumArmor = { ringpanzer: 12, kettenruestung: 13, stahlkuerass: 13, schuppenpanzer: 14, brigantine: 14, lamellenpanzer: 14 };
const shields = {
  buckler: { armorClassBonus: 0, mechanics: {}, triggerRules: [{
    id: 'buckler-melee-defense', name: 'Bucklerparade', phase: 'pre-roll', recipient: 'target',
    sourceRelation: 'self', activation: 'passive', frequency: 'always', condition: 'always',
    actionKinds: ['weapon', 'technique'], weaponAttackOnly: true, attackRange: 'melee',
    effects: { defenseModifier: 1 },
    description: '+1 RK gegen Nahkampf-Waffenangriffe und Nahkampftechniken; kein RK-Bonus gegen Fernkampf oder Wurfwaffen.'
  }] },
  rundschild: { armorClassBonus: 2, mechanics: {} },
  'kite-schild': { armorClassBonus: 3, mechanics: {} },
  turmschild: { armorClassBonus: 4, mechanics: { movement: -1, initiative: -1 } },
  pavese: { armorClassBonus: 5, mechanics: { movement: -3, initiative: -2 },
    equipCosts: [{ resourceId: 'action', amount: 1 }, { resourceId: 'bonus-action', amount: 1 }] }
};
const heavyArmor = { ritterplatte: 15, turnierruestung: 18, 'wappenrock-ruestung': 15 };

function defaultWeapon(id) {
  const values = weaponBaselines[id];
  if (!values) return null;
  const [weaponType, weaponProfileId, damageFormula, damageType, versatileDamageFormula = ''] = values;
  const ranged = ['bow', 'crossbow'].includes(weaponType);
  const twoHanded = ranged || ['halberd', 'maul', 'greatsword', 'greataxe'].includes(weaponProfileId);
  return { kind: 'weapon', weaponType, weaponProfileId, damageFormula, damageType, versatileDamageFormula,
    training: ['dagger', 'club', 'shortbow', 'light-crossbow'].includes(weaponProfileId) ? 'simple' : 'martial',
    attackAttribute: ranged || weaponType === 'dagger' ? 'dexterity' : 'strength',
    attackBonus: 0, damageBonus: 0, range: ranged ? 'Fernkampf' : 'Nahkampf',
    properties: [twoHanded ? 'Zweihändig' : versatileDamageFormula ? 'Vielseitig' : 'Einhändig',
      ranged ? 'Munition' : '', weaponType === 'dagger' ? 'Finesse · Leicht' : ''].filter(Boolean).join(' · '),
    triggerRules: [], notes: 'Vorläufige Grundwerte; besondere Wirkungen gesondert festlegen.' };
}

function defaultArmor(item, id) {
  if (shields[id]) return { kind: 'armor', armorKind: 'shield', armorRuleVersion: 2, baseArmorClass: null,
    triggerRules: [], ...structuredClone(shields[id]), properties: 'Schild' };
  const rankArmorClass = { jungritter: 15, ritter: 17, seniorritter: 18 }[item.houseArmor?.rankId];
  const armorCategory = lightArmor[id] ? 'light' : mediumArmor[id] ? 'medium' : rankArmorClass || heavyArmor[id] ? 'heavy' : '';
  if (!armorCategory) return null;
  return { kind: 'armor', armorKind: 'armor', armorCategory,
    ...(!item.houseArmor ? { armorRuleVersion: 2 } : {}),
    baseArmorClass: rankArmorClass || lightArmor[id] || mediumArmor[id] || heavyArmor[id], armorClassBonus: 0,
    dexterityMode: armorCategory === 'heavy' ? 'none' : armorCategory === 'medium' ? 'capped' : 'full',
    dexterityCap: armorCategory === 'medium' ? 2 : 0, dexterityUnlockLevel: 0,
    properties: `${{ light: 'Leichte', medium: 'Mittlere', heavy: 'Schwere' }[armorCategory]} Rüstung`, triggerRules: [] };
}

function useMode(item) {
  if (['consume', 'use'].includes(item.inventoryUseMode)) return item.inventoryUseMode;
  if (['speisen', 'getraenke'].includes(item.category)) return 'consume';
  if (item.category === 'arkanes' && ['zauberschriftrolle', 'infernale-zauberrolle', 'runenkreide'].includes(item.sourceRefs?.[0]?.sourceId)) return 'consume';
  if (item.category !== 'alchemie') return 'use';
  // Lab apparatus is reusable even though it shares the alchemy register.
  if (item.hiddenMeta?.originalCategory === 'Laborzubehör'
    && !['laborpapier', 'labortinte'].includes(item.sourceRefs?.[0]?.sourceId)) return 'use';
  return 'consume';
}

export function withRegisterGameplayDefaults(item) {
  const source = item.sourceRefs?.[0];
  const sourceId = source?.sourceId || '';
  const fromArmory = source?.market === 'Waffen & Rüstungen';
  const combatDefinition = item.combatDefinition
    || (item.category === 'waffen' && (fromArmory || source?.market === 'Schwarzmarkt') ? defaultWeapon(sourceId) : null)
    || (item.category === 'ruestungen' && (fromArmory || item.houseArmor) ? defaultArmor(item, sourceId) : null);
  return balanceArmorInventoryItem({ ...item, combatDefinition,
    inventoryUseMode: useMode(item),
    mechanicsStatus: item.combatDefinition ? 'defined' : combatDefinition ? 'provisional' : 'narrative' });
}
