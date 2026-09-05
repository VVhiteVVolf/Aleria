import { readFile, writeFile } from 'node:fs/promises';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { synchronizeEquipmentFromInventory } from '../modules/character-equipment/character-equipment-sync.js';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDirectory, '..', '..');
const exportRoot = resolve(workspaceRoot, 'Charakter Archiv Exporte');
const checkOnly = process.argv.includes('--check');

const IMAGES = Object.freeze({
  sword: 'https://i.imgur.com/38Na5EY.png',
  armor: 'https://i.imgur.com/7siJPXG.png',
  ring: 'https://i.imgur.com/mwP2vjq.png',
  dagger: 'https://i.imgur.com/caR593j.png'
});

const CHARACTER_EQUIPMENT = Object.freeze([
  {
    file: 'gawain-draig.json',
    slug: 'gawain-draig',
    swordItemId: 'item-mqu1vat1-0-w8ef',
    swordName: 'Drachenzahn · Draig-Ritterschwert',
    armorItemId: 'item-mqu1vat1-1-exvo',
    armorName: 'Silberschuppe · Draig-Jungritter-Plattenrüstung',
    daggerItemId: 'gawain-draig-dagger-item'
  },
  {
    file: 'gildas-gafyr.json',
    slug: 'gildas-gafyr',
    swordItemId: 'gildas-gafyr-duty-sword-item',
    swordName: 'Pflichtschwur · Draig-Ritterschwert',
    armorItemId: 'gildas-gafyr-watch-armor-item',
    armorName: 'Wachtpanzer · Draig-Jungritter-Plattenrüstung',
    daggerItemId: 'gildas-gafyr-dagger-item'
  }
]);

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function itemRows(...rows) {
  return rows.map(([icon, label, value]) => ({ icon, label, value }));
}

function updateRequiredItem(character, itemId, changes) {
  const index = character.inventory.items.findIndex(item => item.id === itemId);
  if (index < 0) throw new Error(`${character.name}: Inventargegenstand ${itemId} fehlt.`);
  character.inventory.items[index] = {
    ...character.inventory.items[index],
    ...changes,
    icon: changes.image,
    imageFormat: 'square',
    imageFit: 'contain',
    imagePosition: 'center'
  };
}

function ringAbility(slug, ringItemId) {
  return {
    id: `${slug}-draig-knight-signet`,
    sourceInventoryItemId: ringItemId,
    name: 'Draig-Rittersiegelring',
    description: 'Das offen getragene Draig-Rittersiegel verleiht seinem Träger +1 auf Überzeugen.',
    usesCurrent: 0,
    usesMaximum: 0,
    recovery: 'none',
    recoveryDayKey: '',
    rollFormula: '',
    damageType: 'physisch',
    activationType: 'passive',
    delivery: 'ability',
    combatUsable: false,
    target: 'Selbst',
    range: 'Selbst',
    duration: 'Solange der Ring getragen wird',
    requirements: 'Draig-Rittersiegelring angelegt',
    tags: 'Ausrüstung · Draig · Rittersiegel · Sozial',
    aiInstructions: 'Berücksichtige den Bonus ausschließlich bei Überzeugen-Proben.',
    costs: [],
    auraBypass: { allowed: false, resourceId: '', cost: 1 },
    active: true,
    mechanics: {},
    triggerRules: [{
      id: `${slug}-draig-knight-signet-persuasion`,
      name: 'Autorität des Draig-Siegels',
      enabled: true,
      phase: 'pre-roll',
      recipient: 'actor',
      sourceRelation: 'self',
      activation: 'passive',
      frequency: 'always',
      condition: 'always',
      actionScope: 'global',
      consumeReaction: false,
      costs: [],
      actionKinds: ['skill'],
      skillIds: ['persuasion'],
      requiredTargetTags: [],
      radiusMeters: null,
      priority: 0,
      authority: 'passive',
      description: '+1 auf Überzeugen, solange der Draig-Rittersiegelring getragen wird.',
      effects: {
        attackModifier: 0,
        defenseModifier: 0,
        savingThrowModifier: 0,
        spellSaveDcModifier: 0,
        skillModifier: 1,
        damageModifier: 0,
        damageReduction: 0,
        rollMode: 'normal',
        outcome: 'none'
      },
      resultEffects: []
    }],
    inventoryUseTrigger: { enabled: false, itemTags: [], restoreResources: [], requireActualRecovery: true }
  };
}

function reconcileDraigKnightEquipment(character, definition) {
  character.inventory ||= {};
  character.inventory.items = Array.isArray(character.inventory.items) ? character.inventory.items : [];

  updateRequiredItem(character, definition.swordItemId, {
    name: definition.swordName,
    category: 'weapon',
    type: 'Ritterschwert',
    image: IMAGES.sword,
    value: { gold: 5, silver: 0, copper: 0, totalCopper: 5000 },
    description: 'Vielseitiges Draig-Ritterschwert. Einhändig 1W8, zweihändig 1W10; Wert: 5 Goldtaler.',
    tags: 'Schwert, Draig, Ritterschwert, vielseitig, Drachentanz, ritterlich',
    infoRows: itemRows(
      ['◈', 'Wert', '5 Goldtaler'],
      ['⚔', 'Schaden', '1W8 · vielseitig 1W10'],
      ['◆', 'Status', 'Aktiv geführt']
    ),
    combatDefinition: {
      kind: 'weapon', weaponType: 'sword', training: 'martial', damageFormula: '1d8',
      versatileDamageFormula: '1d10', attackAttribute: 'strength', proficient: true,
      attackBonus: 0, damageBonus: 0, damageType: 'Hieb', rangeType: 'melee', range: 'Nahkampf',
      properties: 'Vielseitig · 1W10 bei zweihändiger Führung',
      notes: 'Draig-Ritterschwert für die Schwertfolgen des Drachentanzes.', requirements: '',
      aiInstructions: 'Verwende 1W8 bei einhändiger und 1W10 ausschließlich bei ausdrücklich zweihändiger Führung.'
    }
  });

  updateRequiredItem(character, definition.armorItemId, {
    name: definition.armorName,
    category: 'armor',
    type: 'Draig-Jungritter-Plattenrüstung',
    image: IMAGES.armor,
    description: 'Plattenrüstung der Draig-Jungritter mit Wappenrock und geschlossenem Helm. Basis-RK 16; ab Stufe 6 zählt der Geschicklichkeitsmodifikator.',
    tags: 'Rüstung, Platte, Draig, Jungritter, Wappenrock, Helm',
    infoRows: itemRows(
      ['⬙', 'Rüstungsklasse', 'Basis-RK 16'],
      ['✦', 'Ausführung', 'Draig-Jungritter'],
      ['◆', 'Status', 'Angelegt']
    ),
    combatDefinition: {
      kind: 'armor', armorKind: 'armor', damageFormula: '', baseArmorClass: 16,
      armorClassBonus: 0, dexterityMode: 'full', dexterityCap: 2, dexterityUnlockLevel: 6,
      properties: 'Plattenrüstung · Draig-Wappenrock · geschlossener Helm',
      notes: 'Der Geschicklichkeitsmodifikator zählt erst ab Stufe 6.'
    }
  });

  updateRequiredItem(character, definition.daggerItemId, {
    name: 'Draig-Dolch',
    category: 'weapon',
    type: 'Dolch',
    image: IMAGES.dagger,
    description: 'Kompakter Draig-Dolch als leichte Seiten- und Wurfwaffe.',
    tags: 'Dolch, Draig, leicht, Finesse, Wurfwaffe',
    infoRows: itemRows(
      ['†', 'Schaden', '1W4 Stich'],
      ['◇', 'Führung', 'Finesse · leicht'],
      ['◆', 'Status', 'Seitenwaffe']
    ),
    combatDefinition: {
      kind: 'weapon', weaponType: 'dagger', training: 'simple', damageFormula: '1d4',
      versatileDamageFormula: '', attackAttribute: 'dexterity', proficient: true,
      attackBonus: 0, damageBonus: 0, damageType: 'Stich', rangeType: 'melee', range: 'Nahkampf',
      properties: 'Finesse · leicht · Wurfwaffe', notes: 'Seitenwaffe des Hauses Draig.',
      requirements: '', aiInstructions: 'Kann mit Kraft oder Geschick geführt werden; der aktuelle Bogen verwendet Geschick.'
    }
  });

  const ringItemId = `${definition.slug}-draig-knight-signet-item`;
  const ring = {
    id: ringItemId,
    itemDbKey: '',
    originItemDbKey: '',
    itemStorageMode: 'character',
    ownerCharacterId: String(character.id || ''),
    ownerCharacterName: String(character.name || ''),
    acquiredAt: '2026-09-05T00:00:00.000Z',
    individualizedAt: '',
    category: 'equipment',
    icon: IMAGES.ring,
    image: IMAGES.ring,
    imageFormat: 'square',
    imageFit: 'contain',
    imagePosition: 'center',
    name: 'Draig-Rittersiegelring',
    type: 'Siegelring',
    description: 'Siegelring eines Draig-Ritters. Offen getragen verleiht er +1 auf Überzeugen.',
    weight: '',
    quantity: '1',
    tags: 'Draig, Rittersiegel, Ring, Schmuck, Überzeugen',
    equipped: true,
    combatDefinition: null,
    equipmentLink: null,
    infoRows: itemRows(
      ['✦', 'Effekt', '+1 auf Überzeugen'],
      ['◆', 'Status', 'Angelegt']
    ),
    attributes: []
  };
  const ringIndex = character.inventory.items.findIndex(item => item.id === ringItemId);
  if (ringIndex >= 0) character.inventory.items[ringIndex] = { ...character.inventory.items[ringIndex], ...ring };
  else character.inventory.items.splice(3, 0, ring);

  const synchronized = synchronizeEquipmentFromInventory({
    inventory: character.inventory,
    combatProfile: character.combatProfile
  });
  character.inventory = synchronized.inventory;
  character.combatProfile = synchronized.combatProfile;
  character.combatProfile.abilities = Array.isArray(character.combatProfile.abilities)
    ? character.combatProfile.abilities
    : [];
  const ability = ringAbility(definition.slug, ringItemId);
  const abilityIndex = character.combatProfile.abilities.findIndex(item => item.id === ability.id);
  if (abilityIndex >= 0) character.combatProfile.abilities[abilityIndex] = ability;
  else character.combatProfile.abilities.push(ability);
}

const processed = [];
for (const definition of CHARACTER_EQUIPMENT) {
  const path = resolve(exportRoot, definition.file);
  const current = await readFile(path, 'utf8');
  const exported = JSON.parse(current);
  if (exported?.type !== 'aleria-character' || !exported.character?.combatProfile) {
    throw new Error(`${definition.file} ist kein gültiger Charakterexport.`);
  }
  reconcileDraigKnightEquipment(exported.character, definition);
  exported.character.combatProfile = sanitizeCharacterCombatProfile(exported.character.combatProfile);
  const next = json(exported);
  if (checkOnly && current !== next) throw new Error(`${definition.file} besitzt nicht das festgelegte Draig-Ritterset.`);
  if (!checkOnly) await writeFile(path, next, 'utf8');
  processed.push(exported.character.name);
}

console.log(`${processed.length} Draig-Rittersets ${checkOnly ? 'geprüft' : 'abgeglichen'}: ${processed.join(', ')}.`);
