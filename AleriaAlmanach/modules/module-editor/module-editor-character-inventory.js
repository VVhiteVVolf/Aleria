function makeCharacterInventoryId(prefix = 'ci', index = 0) {
  return `${prefix}-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 6)}`;
}

function sanitizeCharacterInventoryNumber(value, fallback = 0, min = 0, max = 100) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(min, Math.min(max, Math.round(safe)));
}

function sanitizeCharacterInventoryChoice(value, allowed = [], fallback = '') {
  const safe = String(value || '').trim();
  return allowed.includes(safe) ? safe : fallback;
}

function sanitizeCharacterInventoryImageSettings(data = {}) {
  return {
    format: sanitizeCharacterInventoryChoice(data.format, ['portrait', 'square', 'landscape', 'wide'], 'portrait'),
    fit: sanitizeCharacterInventoryChoice(data.fit, ['cover', 'contain'], 'cover'),
    position: sanitizeCharacterInventoryChoice(data.position, ['center', 'top', 'bottom', 'left', 'right'], 'top')
  };
}

const CHARACTER_INVENTORY_DEFAULT_CATEGORIES = [
  { id: 'weapon', label: 'Waffen', icon: 'https://i.imgur.com/YaUQREQ.png' },
  { id: 'armor', label: 'Rüstung', icon: 'https://i.imgur.com/5qZtUiY.png' },
  { id: 'equipment', label: 'Ausrüstung', icon: 'https://i.imgur.com/yMj2CQf.png' },
  { id: 'potions', label: 'Trinkturen', icon: 'https://i.imgur.com/gwujEaL.png' },
  { id: 'documents', label: 'Dokumente', icon: 'https://i.imgur.com/urdalGm.png' },
  { id: 'other', label: 'Sonstiges', icon: 'https://i.imgur.com/lgeevvn.png' }
];

const CHARACTER_INVENTORY_CURRENCIES = [
  { id: 'gold', label: 'Goldtaler', short: 'GT', value: 1000, icon: 'https://i.imgur.com/kH2Ry56.png' },
  { id: 'silver', label: 'Silbertaler', short: 'ST', value: 100, icon: 'https://i.imgur.com/SqqS6XQ.png' },
  { id: 'copper', label: 'Kupfertaler', short: 'KT', value: 1, icon: 'https://i.imgur.com/j2khSBE.png' }
];

const CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS = [
  'Welchem Stand oder welcher sozialen Schicht entstammt die Figur?',
  'Welche Rolle, Arbeit oder Berufung prägt den Alltag der Figur?',
  'Wie regelmäßig verdient die Figur Geld und wodurch?',
  'Wie oft reist die Figur und über welche Strecken?',
  'Wie kampferfahren ist die Figur und welche Waffen passen glaubwürdig?',
  'Welchen Schutz braucht oder besitzt die Figur im Alltag?',
  'Besitzt die Figur ein Reittier, Lasttier, Fahrzeug oder besondere Begleiter?',
  'Welche Werkzeuge, Vorräte oder Verbrauchsgüter braucht sie regelmäßig?',
  'Welche kulturellen, regionalen oder religiösen Gegenstände wären plausibel?',
  'Gibt es Erbstücke, Schulden, Mäzene, militärische Ausrüstung oder besondere Privilegien?'
];

function normalizeCharacterInventoryText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizeCharacterInventoryCategoryId(value, { allowCustom = false } = {}) {
  const normalized = normalizeCharacterInventoryText(value);
  if (['weapon', 'weapons', 'waffe', 'waffen'].includes(normalized)) return 'weapon';
  if (['armor', 'armour', 'ruestung', 'rustung', 'ruestungen', 'rustungen', 'schutz'].includes(normalized)) return 'armor';
  if (['documents', 'document', 'dokument', 'dokumente', 'urkunde', 'urkunden', 'brief', 'briefe', 'schriftrolle', 'schriftrollen'].includes(normalized)) return 'documents';
  if (['potions', 'potion', 'trinktur', 'trinkturen', 'tinktur', 'tinkturen', 'trank', 'traenke', 'tranke', 'elixier', 'elixiere', 'alchemie'].includes(normalized)) return 'potions';
  if (['equipment', 'ausruestung', 'ausrustung', 'werkzeug', 'werkzeuge', 'verbrauchsgut', 'vorrat'].includes(normalized)) return 'equipment';
  if (['money', 'geld', 'muenzen', 'munzen', 'waehrung', 'wahrung', 'geldbeutel', 'taler', 'pet', 'haustier', 'haustiere', 'tier', 'tiere', 'horse', 'pferd', 'pferde', 'reitpferd', 'reittier', 'ross', 'pony'].includes(normalized)) return 'other';
  if (['all', 'alle'].includes(normalized)) return 'weapon';
  if (allowCustom) {
    const customId = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (customId) return customId.slice(0, 48);
  }
  return 'other';
}

function normalizeCharacterInventoryCategories(categories = []) {
  const byId = new Map(CHARACTER_INVENTORY_DEFAULT_CATEGORIES.map(category => [category.id, { ...category }]));
  (Array.isArray(categories) ? categories : []).forEach(category => {
    const rawId = normalizeCharacterInventoryText(category?.id || category?.label);
    if (rawId === 'all' || rawId === 'alle') return;
    const id = normalizeCharacterInventoryCategoryId(category?.id || category?.label, { allowCustom: true });
    const defaults = byId.get(id) || CHARACTER_INVENTORY_DEFAULT_CATEGORIES.find(item => item.id === id) || {
      id,
      label: String(category?.label || id).trim() || id,
      icon: String(category?.icon || '*').trim() || '*'
    };
    byId.set(id, {
      ...defaults,
      label: String(category?.label || defaults.label).trim() || defaults.label,
      icon: String(category?.icon || defaults.icon).trim() || defaults.icon
    });
  });
  return [...byId.values()].slice(0, 16);
}

function sanitizeCharacterInventoryRows(rows = [], fallback = [], maxRows = 40) {
  const source = Array.isArray(rows) ? rows : fallback;
  return source
    .map(row => ({
      icon: String(row?.icon || '').trim(),
      label: String(row?.label || '').trim(),
      value: String(row?.value || '').trim()
    }))
    .filter(row => row.icon || row.label || row.value)
    .slice(0, maxRows);
}

function sanitizeCharacterInventoryAttributes(items = [], fallback = []) {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .map((item, index) => ({
      label: String(item?.label || `Attribut ${index + 1}`).trim(),
      value: sanitizeCharacterInventoryNumber(item?.value, 5, 0, 10)
    }))
    .filter(item => item.label)
    .slice(0, 8);
}

function parseCharacterInventoryInt(value, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
  const normalized = String(value ?? '').trim().replace(/\./g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function splitCharacterInventoryCopper(totalCopper = 0) {
  let rest = parseCharacterInventoryInt(totalCopper);
  const gold = Math.floor(rest / 1000);
  rest %= 1000;
  const silver = Math.floor(rest / 100);
  const copper = rest % 100;
  return {
    gold,
    silver,
    copper,
    totalCopper: gold * 1000 + silver * 100 + copper
  };
}

function getCharacterInventoryMoneyTotal(money = {}) {
  if (!money || typeof money !== 'object') return 0;
  return CHARACTER_INVENTORY_CURRENCIES.reduce((sum, currency) => (
    sum + parseCharacterInventoryInt(money[currency.id]) * currency.value
  ), 0);
}

function parseCharacterInventoryMoneyText(text = '') {
  const source = String(text || '').toLowerCase();
  const readUnit = units => {
    const pattern = new RegExp(`(\\d[\\d\\.,]*)\\s*(?:${units.join('|')})`, 'i');
    const match = source.match(pattern);
    return match ? parseCharacterInventoryInt(match[1]) : 0;
  };
  const gold = readUnit(['goldtaler', 'gold', 'gt', 'gm']);
  const silver = readUnit(['silbertaler', 'silber', 'st', 'sm']);
  const copper = readUnit(['kupfertaler', 'kupfer', 'kt', 'km']);
  if (gold || silver || copper) return splitCharacterInventoryCopper(gold * 1000 + silver * 100 + copper);
  return splitCharacterInventoryCopper(0);
}

function sanitizeCharacterInventoryMoney(value = {}) {
  if (typeof value === 'string') return parseCharacterInventoryMoneyText(value);
  if (!value || typeof value !== 'object') return splitCharacterInventoryCopper(0);
  const total = value.totalCopper != null ? parseCharacterInventoryInt(value.totalCopper) : getCharacterInventoryMoneyTotal(value);
  return splitCharacterInventoryCopper(total);
}

function formatCharacterInventoryMoney(value = {}) {
  const money = sanitizeCharacterInventoryMoney(value);
  return `${money.gold} Gold, ${money.silver} Silber, ${money.copper} Kupfer`;
}

function sanitizeCharacterInventoryEquipmentQuiz(data = {}) {
  const source = data && typeof data === 'object' ? data : {};
  const questions = CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS;
  const answers = Array.isArray(source.answers) ? source.answers : [];
  return {
    open: !!source.open,
    step: Math.max(0, Math.min(questions.length - 1, parseCharacterInventoryInt(source.step, 0))),
    answers: questions.map((_, index) => String(answers[index] || '').trim()).slice(0, questions.length),
    resultText: String(source.resultText || '').trim(),
    status: String(source.status || '').trim(),
    updatedAt: String(source.updatedAt || '').trim()
  };
}

function sanitizeCharacterInventoryCombatDefinition(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const kind = String(source.kind || '').trim().toLowerCase();
  const damageFormula = String(source.damageFormula || '').trim().slice(0, 40);
  const baseArmorClass = source.baseArmorClass == null || source.baseArmorClass === ''
    ? null
    : Math.max(0, Math.min(99, Number(source.baseArmorClass) || 0));
  const hasWeaponDefinition = kind === 'weapon' || !!damageFormula;
  const hasArmorDefinition = kind === 'armor' || baseArmorClass != null || source.armorClassBonus != null;
  if (!hasWeaponDefinition && !hasArmorDefinition) return null;
  return {
    kind: hasArmorDefinition && !hasWeaponDefinition ? 'armor' : 'weapon',
    weaponType: String(source.weaponType || '').trim().slice(0, 40),
    training: String(source.training || '').trim().slice(0, 40),
    damageFormula,
    versatileDamageFormula: String(source.versatileDamageFormula || '').trim().slice(0, 40),
    attackAttribute: String(source.attackAttribute || '').trim().slice(0, 80),
    damageAttribute: String(source.damageAttribute || '').trim().slice(0, 80),
    proficient: source.proficient !== false,
    attackBonus: Number.isFinite(Number(source.attackBonus)) ? Number(source.attackBonus) : 0,
    damageBonus: Number.isFinite(Number(source.damageBonus)) ? Number(source.damageBonus) : 0,
    damageType: String(source.damageType || 'physical').trim().slice(0, 80),
    rangeType: source.rangeType === 'ranged' ? 'ranged' : 'melee',
    range: String(source.range || '').trim().slice(0, 80),
    properties: Array.isArray(source.properties)
      ? source.properties.map(item => String(item || '').trim()).filter(Boolean).slice(0, 20).join(' · ')
      : String(source.properties || '').trim().slice(0, 500),
    notes: String(source.notes || '').trim().slice(0, 800),
    requirements: String(source.requirements || '').trim().slice(0, 1000),
    aiInstructions: String(source.aiInstructions || '').trim().slice(0, 1600),
    armorKind: String(source.armorKind || 'armor').trim().slice(0, 40),
    baseArmorClass,
    armorClassBonus: Number.isFinite(Number(source.armorClassBonus)) ? Number(source.armorClassBonus) : 0,
    dexterityMode: ['full', 'capped', 'none'].includes(String(source.dexterityMode || '')) ? String(source.dexterityMode) : 'full',
    dexterityCap: Number.isFinite(Number(source.dexterityCap)) ? Number(source.dexterityCap) : 2,
    dexterityUnlockLevel: Math.max(0, Math.min(30, Number(source.dexterityUnlockLevel) || 0))
  };
}

function sanitizeCharacterInventoryEquipmentLink(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const kind = String(source.kind || '').trim();
  if (!['weapon', 'armor'].includes(kind)) return null;
  return {
    schemaVersion: Math.max(1, Number(source.schemaVersion) || 1),
    kind,
    combatEntryId: String(source.combatEntryId || '').trim().slice(0, 120)
  };
}

function sanitizeCharacterInventoryItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || '').trim() || makeCharacterInventoryId('item', index),
      itemDbKey: String(item?.itemDbKey || '').trim(),
      originItemDbKey: String(item?.originItemDbKey || '').trim(),
      itemStorageMode: String(item?.itemStorageMode || (item?.itemDbKey ? 'linked' : 'character')).trim(),
      ownerCharacterId: String(item?.ownerCharacterId || '').trim(),
      ownerCharacterName: String(item?.ownerCharacterName || '').trim(),
      acquiredAt: String(item?.acquiredAt || '').trim(),
      individualizedAt: String(item?.individualizedAt || '').trim(),
      category: normalizeCharacterInventoryCategoryId(item?.category || item?.type || 'equipment', { allowCustom: true }),
      icon: String(item?.icon || '').trim(),
      image: String(item?.image || '').trim(),
      imageFormat: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).format,
      imageFit: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).fit,
      imagePosition: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'square',
        fit: item?.imageFit || 'contain',
        position: item?.imagePosition || 'center'
      }).position,
      name: String(item?.name || `Gegenstand ${index + 1}`).trim(),
      type: String(item?.type || '').trim(),
      description: String(item?.description || '').trim(),
      weight: String(item?.weight || '').trim(),
      quantity: String(item?.quantity || '1').trim(),
      tags: String(item?.tags || '').trim(),
      value: sanitizeCharacterInventoryMoney(item?.value),
      equipped: item?.equipped === true,
      combatDefinition: sanitizeCharacterInventoryCombatDefinition(item?.combatDefinition || item?.combat),
      equipmentLink: sanitizeCharacterInventoryEquipmentLink(item?.equipmentLink),
      infoRows: sanitizeCharacterInventoryRows(item?.infoRows, [
        { label: 'Qualitaet', value: 'Noch festlegen' },
        { label: 'Zustand', value: 'Noch festlegen' }
      ]),
      attributes: sanitizeCharacterInventoryAttributes(item?.attributes, [
        { label: 'Schaden', value: 5 },
        { label: 'Schutz', value: 3 },
        { label: 'Wert', value: 4 },
        { label: 'Seltenheit', value: 2 },
        { label: 'Zuverlaessigkeit', value: 6 },
        { label: 'Handhabung', value: 5 }
      ])
    }))
    .filter(item => item.name || item.icon || item.image)
    .slice(0, 80);
}

function sanitizeCharacterInventoryCompanions(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => ({
      id: String(item?.id || '').trim() || makeCharacterInventoryId('companion', index),
      image: String(item?.image || '').trim(),
      imageFormat: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).format,
      imageFit: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).fit,
      imagePosition: sanitizeCharacterInventoryImageSettings({
        format: item?.imageFormat || 'landscape',
        fit: item?.imageFit || 'cover',
        position: item?.imagePosition || 'top'
      }).position,
      name: String(item?.name || `Gefährte ${index + 1}`).trim(),
      species: String(item?.species || '').trim(),
      role: String(item?.role || '').trim(),
      status: String(item?.status || 'Gesund').trim(),
      statusColor: String(item?.statusColor || '#5c7f20').trim(),
      summary: String(item?.summary || '').trim(),
      description: String(item?.description || '').trim(),
      infoRows: sanitizeCharacterInventoryRows(item?.infoRows, [
        { label: 'Art', value: 'Noch festlegen' },
        { label: 'Besitzer', value: 'Noch festlegen' },
        { label: 'Rolle', value: 'Begleiter' }
      ]),
      attributes: sanitizeCharacterInventoryAttributes(item?.attributes, [
        { label: 'Schnelligkeit', value: 6 },
        { label: 'Ausdauer', value: 7 },
        { label: 'Staerke', value: 5 },
        { label: 'Agilitaet', value: 6 },
        { label: 'Sozialverhalten', value: 4 },
        { label: 'Robustheit', value: 5 }
      ])
    }))
    .filter(item => item.name || item.image)
    .slice(0, 24);
}

function sanitizeCharacterInventoryData(data = {}) {
  const categories = Array.isArray(data.categories) && data.categories.length
    ? data.categories
    : CHARACTER_INVENTORY_DEFAULT_CATEGORIES;
  const moneyState = sanitizeCharacterInventoryMoney(data.moneyState || data.money);
  const moneyLabel = formatCharacterInventoryMoney(moneyState);
  const infoRows = sanitizeCharacterInventoryRows(data.infoRows, [
    { icon: '*', label: 'Status', value: String(data.status || 'Gesund').trim() },
    { icon: '*', label: 'TP / Zustand', value: String(data.hitpoints || '48 / 52 TP').trim() },
    { icon: '*', label: 'Geld', value: moneyLabel },
    { icon: '*', label: 'Tragkapazität', value: `${String(data.carryLabel || 'Traglast').trim()} ${String(data.carryValue || '78,4 / 120 kg').trim()}`.trim() },
    { icon: '*', label: 'Volk', value: 'Mensch' },
    { icon: '*', label: 'Hintergrund', value: 'Noch festlegen' },
    { icon: '*', label: 'Aufenthalt', value: 'Noch festlegen' },
    { icon: '*', label: 'Ausrichtung', value: 'Neutral Gut' }
  ], 8);
  const moneyInfoRow = infoRows.find(row => normalizeCharacterInventoryText(row.label) === 'geld');
  if (moneyInfoRow) moneyInfoRow.value = moneyLabel;
  const normalizedCategories = normalizeCharacterInventoryCategories(categories);
  const categoryIds = new Set(normalizedCategories.map(category => category.id));
  const items = sanitizeCharacterInventoryItems(data.items).map(item => ({
    ...item,
    category: categoryIds.has(item.category) ? item.category : 'other'
  }));
  return {
    characterId: String(data.characterId || '').trim(),
    title: String(data.title || 'Charakter-Inventar').trim(),
    subtitle: String(data.subtitle || 'Ausrüstung, Gegenstände und Gefährten verwalten').trim(),
    portrait: String(data.portrait || '').trim(),
    portraitFormat: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).format,
    portraitFit: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).fit,
    portraitPosition: sanitizeCharacterInventoryImageSettings({
      format: data.portraitFormat || 'portrait',
      fit: data.portraitFit || 'cover',
      position: data.portraitPosition || 'top'
    }).position,
    name: String(data.name || 'Name des Charakters').trim(),
    role: String(data.role || 'Rolle').trim(),
    level: String(data.level || 'Stufe').trim(),
    status: String(data.status || 'Gesund').trim(),
    hitpoints: String(data.hitpoints || '48 / 52 TP').trim(),
    healthColor: String(data.healthColor || '#5c7f20').trim(),
    money: moneyLabel,
    moneyState,
    moneyNotice: String(data.moneyNotice || '').trim(),
    showInfoTable: data.showInfoTable === true,
    carryLabel: String(data.carryLabel || 'Traglast').trim(),
    carryValue: String(data.carryValue || '78,4 / 120 kg').trim(),
    categories: normalizedCategories,
    infoRows,
    attributes: sanitizeCharacterInventoryAttributes(data.attributes, [
      { label: 'StA', value: 8 },
      { label: 'Ges', value: 6 },
      { label: 'Kon', value: 7 },
      { label: 'Int', value: 5 },
      { label: 'Wei', value: 6 },
      { label: 'Cha', value: 5 }
    ]),
    items,
    companions: sanitizeCharacterInventoryCompanions(data.companions),
    equipmentQuiz: sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz),
    // Siehe combatProfile.revision in combat-profile-model.js - dieselbe Absicherung
    // gegen veraltete Browser-Tabs, hier fürs Inventar (Ausrüstung, Munition, Gegenstände).
    revision: Math.max(0, Math.trunc(Number(data.revision) || 0))
  };
}

function createDefaultCharacterInventoryPage(index = 0) {
  return {
    pageTitle: `${getRomanPageLabel(index)} - Charakter-Inventar`,
    characterInventoryPage: true,
    characterInventory: sanitizeCharacterInventoryData({
      showInfoTable: false,
      items: [
        { category: 'weapon', icon: '*', name: 'Langschwert +1', type: 'Waffe (Haupt)', description: 'Ein ausgewogenes Schwert aus gehaertetem Stahl.', weight: '1,5 kg', quantity: '1' },
        { category: 'armor', icon: '*', name: 'Plattenrüstung', type: 'Rüstung (Körper)', description: 'Schwere Rüstung aus Stahlplatten.', weight: '25,0 kg', quantity: '1' },
        { category: 'potions', icon: '*', name: 'Heiltrank', type: 'Trinktur', description: 'Stellt Trefferpunkte wieder her.', weight: '0,3 kg', quantity: '3' },
        { category: 'documents', icon: '*', name: 'Reisebrief', type: 'Dokument', description: 'Ausweis, Empfehlung oder Passierschein.', weight: '0,1 kg', quantity: '1' }
      ],
      companions: [
        { name: 'Ardan', species: 'Kriegspferd', role: 'Reittier', summary: 'Treuer Begleiter auf langen Wegen.', status: 'Gesund' },
        { name: 'Rask', species: 'Wachhund', role: 'Gefährte', summary: 'Wachsam und spurensicher.', status: 'Wachsam' }
      ]
    }),
    stats: [],
    commentDivider: false,
    commentSequence: []
  };
}

function buildCharacterInventoryInput(label, className, value, type = 'text') {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <input class="inline-edit-input ${className}" type="${escapeHtml(type)}" value="${escapeHtml(value || '')}" data-module-editor-action="refresh-ci-preview">
    </label>`;
}

function buildCharacterInventoryCheckbox(label, className, checked = false) {
  return `
    <label class="ci-editor-check">
      <input class="${escapeHtml(className)}" type="checkbox"${checked ? ' checked' : ''} data-module-editor-action="refresh-ci-preview">
      <span>${escapeHtml(label)}</span>
    </label>`;
}

function buildCharacterInventoryTextarea(label, className, value) {
  return `
    <label class="wide">
      <span>${escapeHtml(label)}</span>
      <textarea class="inline-edit-textarea ${className}" data-module-editor-action="refresh-ci-preview">${escapeHtml(value || '')}</textarea>
    </label>`;
}

function buildCharacterInventorySelect(label, className, value, options = []) {
  return `
    <label>
      <span>${escapeHtml(label)}</span>
      <select class="inline-edit-select ${className}" data-module-editor-action="refresh-ci-preview">
        ${options.map(option => `<option value="${escapeHtml(option.value)}"${option.value === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}
      </select>
    </label>`;
}

function buildCharacterInventoryImageControls(prefix, data) {
  return `
    ${buildCharacterInventorySelect('Bildformat', `me-ci-${prefix}-format`, data.format, [
      { value: 'portrait', label: 'Hochformat' },
      { value: 'square', label: 'Quadrat' },
      { value: 'landscape', label: 'Querformat' },
      { value: 'wide', label: 'Breitbild' }
    ])}
    ${buildCharacterInventorySelect('Bildmodus', `me-ci-${prefix}-fit`, data.fit, [
      { value: 'cover', label: 'Fuellen / croppen' },
      { value: 'contain', label: 'Ganzbild' }
    ])}
    ${buildCharacterInventorySelect('Bildposition', `me-ci-${prefix}-position`, data.position, [
      { value: 'top', label: 'Oben' },
      { value: 'center', label: 'Mitte' },
      { value: 'bottom', label: 'Unten' },
      { value: 'left', label: 'Links' },
      { value: 'right', label: 'Rechts' }
    ])}`;
}

function buildCharacterInventoryRowEditor(rows = [], kind = 'info') {
  return rows.map((row, index) => `
    <div class="ci-editor-row" data-ci-row-kind="${escapeHtml(kind)}">
      ${buildCharacterInventoryInput('Icon', `me-ci-${kind}-icon`, row.icon)}
      ${buildCharacterInventoryInput('Label', `me-ci-${kind}-label`, row.label)}
      ${buildCharacterInventoryInput('Wert', `me-ci-${kind}-value`, row.value)}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-row">Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryAttributeEditor(attributes = [], kind = 'character') {
  return attributes.map(attribute => `
    <div class="ci-editor-row compact" data-ci-attribute-kind="${escapeHtml(kind)}">
      ${buildCharacterInventoryInput('Attribut', `me-ci-${kind}-attribute-label`, attribute.label)}
      ${buildCharacterInventoryInput('Wert 0-10', `me-ci-${kind}-attribute-value`, attribute.value, 'number')}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-attribute">Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryCategoryOptions(categories = [], current = '') {
  return categories.map(category =>
    `<option value="${escapeHtml(category.id)}"${category.id === current ? ' selected' : ''}>${escapeHtml(category.label)}</option>`
  ).join('');
}

function getCharacterInventoryItemDbItemByKey(canonicalKey) {
  const key = String(canonicalKey || '').trim();
  if (!key || typeof itemDbBuildIndex !== 'function') return null;
  return itemDbBuildIndex().find(item => item.canonicalKey === key) || null;
}

function isCharacterInventoryEditorItemModified(row, item = {}) {
  const dbItem = getCharacterInventoryItemDbItemByKey(item.itemDbKey);
  if (!dbItem) return false;
  const current = {
    name: getTrimmedFormValue(row, '.me-ci-item-name'),
    type: getTrimmedFormValue(row, '.me-ci-item-type'),
    image: getTrimmedFormValue(row, '.me-ci-item-image'),
    description: getTrimmedFormValue(row, '.me-ci-item-description'),
    tags: getTrimmedFormValue(row, '.me-ci-item-tags')
  };
  return current.name !== String(dbItem.title || '').trim()
    || current.type !== String(dbItem.type || dbItem.categoryLabel || '').trim()
    || current.image !== String(dbItem.image || '').trim()
    || current.description !== String(dbItem.description || dbItem.details || '').trim()
    || current.tags !== (dbItem.tags || []).join(', ');
}

function buildCharacterInventoryCategoryEditor(categories = []) {
  return categories.map((category, index) => `
    <div class="ci-editor-row ci-category-row" data-ci-category-row>
      <input type="hidden" class="me-ci-category-original-id" value="${escapeHtml(category.id)}">
      ${buildCharacterInventoryInput('ID', 'me-ci-category-id', category.id)}
      ${buildCharacterInventoryInput('Name', 'me-ci-category-label', category.label)}
      ${buildCharacterInventoryInput('Icon', 'me-ci-category-icon', category.icon)}
      <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-category"${categories.length <= 1 ? ' disabled' : ''}>Loeschen</button>
    </div>`).join('');
}

function buildCharacterInventoryItemEditor(item, index, categories) {
  const imageSettings = sanitizeCharacterInventoryImageSettings({
    format: item.imageFormat || 'square',
    fit: item.imageFit || 'contain',
    position: item.imagePosition || 'center'
  });
  return `
    <section class="ci-editor-card" data-ci-item-row>
      <input type="hidden" class="me-ci-item-id" value="${escapeHtml(item.id)}">
      <input type="hidden" class="me-ci-item-db-key" value="${escapeHtml(item.itemDbKey || '')}">
      <input type="hidden" class="me-ci-item-origin-db-key" value="${escapeHtml(item.originItemDbKey || '')}">
      <input type="hidden" class="me-ci-item-storage-mode" value="${escapeHtml(item.itemStorageMode || 'character')}">
      <input type="hidden" class="me-ci-item-owner-id" value="${escapeHtml(item.ownerCharacterId || '')}">
      <input type="hidden" class="me-ci-item-owner-name" value="${escapeHtml(item.ownerCharacterName || '')}">
      <input type="hidden" class="me-ci-item-acquired-at" value="${escapeHtml(item.acquiredAt || '')}">
      <input type="hidden" class="me-ci-item-individualized-at" value="${escapeHtml(item.individualizedAt || '')}">
      <input type="hidden" class="me-ci-item-combat-definition" value="${escapeHtml(JSON.stringify(item.combatDefinition || null))}">
      <input type="hidden" class="me-ci-item-equipment-link" value="${escapeHtml(JSON.stringify(item.equipmentLink || null))}">
      <div class="ci-editor-card-head">
        <strong>Item ${index + 1}${item.itemDbKey ? ' - Registerlink' : item.originItemDbKey ? ' - Individuell' : ''}</strong>
        <div class="ci-editor-card-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-item" data-ci-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-item" data-ci-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-ci-item">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-item">Loeschen</button>
        </div>
      </div>
      <div class="ci-editor-grid">
        ${buildCharacterInventoryInput('Name', 'me-ci-item-name', item.name)}
        <label><span>Kategorie</span><select class="inline-edit-select me-ci-item-category" data-module-editor-action="refresh-ci-preview">${buildCharacterInventoryCategoryOptions(categories, item.category)}</select></label>
        ${buildCharacterInventoryInput('Icon', 'me-ci-item-icon', item.icon)}
        ${buildCharacterInventoryInput('Bild', 'me-ci-item-image', item.image, 'url')}
        ${buildCharacterInventoryImageControls('item-image', imageSettings)}
        ${buildCharacterInventoryInput('Typ', 'me-ci-item-type', item.type)}
        ${buildCharacterInventoryInput('Gewicht', 'me-ci-item-weight', item.weight)}
        ${buildCharacterInventoryInput('Anzahl', 'me-ci-item-quantity', item.quantity)}
        ${buildCharacterInventoryInput('Tags', 'me-ci-item-tags', item.tags)}
        ${buildCharacterInventoryTextarea('Beschreibung', 'me-ci-item-description', item.description)}
      </div>
      <div class="ci-nested-editor">
        <div class="ci-editor-section-head"><h5>Item-Infobox</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item-row">+ Zeile</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryRowEditor(item.infoRows, 'item-info')}</div>
        <div class="ci-editor-section-head"><h5>Item-Attribute</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item-attribute">+ Attribut</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryAttributeEditor(item.attributes, 'item')}</div>
      </div>
    </section>`;
}

function buildCharacterInventoryCompanionEditor(companion, index) {
  const imageSettings = sanitizeCharacterInventoryImageSettings({
    format: companion.imageFormat || 'landscape',
    fit: companion.imageFit || 'cover',
    position: companion.imagePosition || 'top'
  });
  return `
    <section class="ci-editor-card" data-ci-companion-row>
      <input type="hidden" class="me-ci-companion-id" value="${escapeHtml(companion.id)}">
      <div class="ci-editor-card-head">
        <strong>Gefährte ${index + 1}</strong>
        <div class="ci-editor-card-actions">
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-companion" data-ci-direction="-1">Hoch</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="move-ci-companion" data-ci-direction="1">Runter</button>
          <button class="module-editor-mini-btn" type="button" data-module-editor-action="duplicate-ci-companion">Duplizieren</button>
          <button class="module-editor-mini-btn module-editor-danger" type="button" data-module-editor-action="remove-ci-companion">Loeschen</button>
        </div>
      </div>
      <div class="ci-editor-grid">
        ${buildCharacterInventoryInput('Name', 'me-ci-companion-name', companion.name)}
        ${buildCharacterInventoryInput('Art / Spezies', 'me-ci-companion-species', companion.species)}
        ${buildCharacterInventoryInput('Rolle', 'me-ci-companion-role', companion.role)}
        ${buildCharacterInventoryInput('Status', 'me-ci-companion-status', companion.status)}
        ${buildCharacterInventoryInput('Statusfarbe', 'me-ci-companion-statusColor', companion.statusColor)}
        ${buildCharacterInventoryInput('Bild', 'me-ci-companion-image', companion.image, 'url')}
        ${buildCharacterInventoryImageControls('companion-image', imageSettings)}
        ${buildCharacterInventoryTextarea('Kurztext', 'me-ci-companion-summary', companion.summary)}
        ${buildCharacterInventoryTextarea('Profilbeschreibung', 'me-ci-companion-description', companion.description)}
      </div>
      <div class="ci-nested-editor">
        <div class="ci-editor-section-head"><h5>Gefährten-Infobox</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion-row">+ Zeile</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryRowEditor(companion.infoRows, 'companion-info')}</div>
        <div class="ci-editor-section-head"><h5>Gefährten-Attribute</h5><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion-attribute">+ Attribut</button></div>
        <div class="ci-editor-list">${buildCharacterInventoryAttributeEditor(companion.attributes, 'companion')}</div>
      </div>
    </section>`;
}

function buildCharacterInventoryModuleEditorFields(page) {
  const data = sanitizeCharacterInventoryData(page?.characterInventory || {});
  const portraitSettings = sanitizeCharacterInventoryImageSettings({
    format: data.portraitFormat || 'portrait',
    fit: data.portraitFit || 'cover',
    position: data.portraitPosition || 'top'
  });
  return `
    <div class="module-page-type-block${inferModulePageType(page) === 'character-inventory' ? ' visible' : ''}" data-page-type="character-inventory">
      <div class="ci-full-editor" data-ci-editor>
        <input type="hidden" class="me-ci-character-id" value="${escapeHtml(data.characterId || '')}">
        <input type="hidden" class="me-ci-equipment-quiz" value="${escapeHtml(JSON.stringify(data.equipmentQuiz))}">
        <input type="hidden" class="me-ci-info-rows-json" value="${escapeHtml(JSON.stringify(data.infoRows || []))}">
        <input type="hidden" class="me-ci-character-attributes-json" value="${escapeHtml(JSON.stringify(data.attributes || []))}">
        <div class="ci-editor-pane">
          <div class="module-editor-grid">
            <div class="module-editor-field wide">
              <div class="module-editor-kicker">Charakter-Inventar</div>
              <div class="module-editor-help">Bearbeite Charakterdaten, Inventar, Detailprofile und Gefährten. Rechts siehst du eine Live-Vorschau.</div>
            </div>
          </div>
          <div class="ci-editor-quick-actions">
            <div>
              <strong>Item aus Register</strong>
              <span>Ein vorhandenes Register-Item direkt in dieses Charakterinventar übernehmen.</span>
            </div>
            <button class="ci-editor-register-btn" type="button" data-module-editor-action="add-ci-item-from-register">Item aus Register hinzufügen</button>
          </div>
          <section class="ci-editor-section">
            <h4>Kopf & Charakter</h4>
            <div class="ci-editor-grid">
              ${buildCharacterInventoryInput('Titel', 'me-ci-title', data.title)}
              ${buildCharacterInventoryInput('Untertitel', 'me-ci-subtitle', data.subtitle)}
              ${buildCharacterInventoryInput('Portrait', 'me-ci-portrait', data.portrait, 'url')}
              ${buildCharacterInventoryImageControls('portrait', portraitSettings)}
              ${buildCharacterInventoryInput('Name', 'me-ci-name', data.name)}
              ${buildCharacterInventoryInput('Rolle', 'me-ci-role', data.role)}
              ${buildCharacterInventoryInput('Stufe', 'me-ci-level', data.level)}
              ${buildCharacterInventoryInput('Status', 'me-ci-status', data.status)}
              ${buildCharacterInventoryInput('TP / Zustand', 'me-ci-hitpoints', data.hitpoints)}
              ${buildCharacterInventoryInput('Statusfarbe', 'me-ci-healthColor', data.healthColor)}
              ${buildCharacterInventoryInput('Geld', 'me-ci-money', data.money)}
              ${buildCharacterInventoryInput('Traglast-Label', 'me-ci-carryLabel', data.carryLabel)}
              ${buildCharacterInventoryInput('Traglast-Wert', 'me-ci-carryValue', data.carryValue)}
              <div class="ci-editor-note wide">Infobox und Charakterattribute werden in diesem Inventar-Menü nicht mehr direkt gepflegt.</div>
            </div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Inventar-Reiter</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-category">+ Reiter</button></div>
            <div class="ci-editor-list">${buildCharacterInventoryCategoryEditor(data.categories)}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head">
              <h4>Items</h4>
              <div class="ci-editor-section-actions">
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item-from-register">Item aus Register hinzufügen</button>
                <button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-item">+ Item</button>
              </div>
            </div>
            <div class="ci-editor-list">${data.items.map((item, index) => buildCharacterInventoryItemEditor(item, index, data.categories)).join('')}</div>
          </section>
          <section class="ci-editor-section">
            <div class="ci-editor-section-head"><h4>Gefährten</h4><button class="module-editor-mini-btn" type="button" data-module-editor-action="add-ci-companion">+ Gefährte</button></div>
            <div class="ci-editor-list">${data.companions.map((companion, index) => buildCharacterInventoryCompanionEditor(companion, index)).join('')}</div>
          </section>
        </div>
        <div class="ci-editor-splitter" aria-hidden="true"></div>
        <div class="ci-preview-pane">
          <div class="ci-preview-head">Live-Vorschau</div>
          <div class="ci-preview-frame">${buildCharacterInventoryPage({ characterInventoryPage: true, characterInventory: data, characterInventoryReadOnly: true }, {}, 0, 1)}</div>
        </div>
      </div>
    </div>`;
}

function buildCharacterInventoryEmbeddedEditorMarkup(data = {}) {
  const page = {
    characterInventoryPage: true,
    characterInventory: sanitizeCharacterInventoryData(data)
  };
  return `
    <div class="character-inventory-embedded-editor" data-ci-embedded-card>
      ${buildCharacterInventoryModuleEditorFields(page)}
    </div>`;
}

function collectCharacterInventoryRows(card, selector, mapper) {
  return Array.from(card.querySelectorAll(selector)).map(mapper);
}

function collectCharacterInventoryJsonField(card, selector, fallback = {}) {
  try {
    return JSON.parse(card.querySelector(selector)?.value || '');
  } catch {
    return fallback;
  }
}

function collectCharacterInventoryModuleEditorPage(card, page) {
  const block = card.querySelector('[data-page-type="character-inventory"]') || card;
  const editedInfoRows = collectCharacterInventoryRows(block, '[data-ci-row-kind="info"]', row => ({
    icon: getTrimmedFormValue(row, '.me-ci-info-icon'),
    label: getTrimmedFormValue(row, '.me-ci-info-label'),
    value: getTrimmedFormValue(row, '.me-ci-info-value')
  }));
  const editedCharacterAttributes = collectCharacterInventoryRows(block, '[data-ci-attribute-kind="character"]', row => ({
    label: getTrimmedFormValue(row, '.me-ci-character-attribute-label'),
    value: getTrimmedFormValue(row, '.me-ci-character-attribute-value')
  }));
  page.characterInventoryPage = true;
  const moneyValue = getTrimmedFormValue(block, '.me-ci-money');
  page.characterInventory = sanitizeCharacterInventoryData({
    title: getTrimmedFormValue(block, '.me-ci-title'),
    characterId: getTrimmedFormValue(block, '.me-ci-character-id'),
    subtitle: getTrimmedFormValue(block, '.me-ci-subtitle'),
    portrait: getTrimmedFormValue(block, '.me-ci-portrait'),
    portraitFormat: getTrimmedFormValue(block, '.me-ci-portrait-format'),
    portraitFit: getTrimmedFormValue(block, '.me-ci-portrait-fit'),
    portraitPosition: getTrimmedFormValue(block, '.me-ci-portrait-position'),
    name: getTrimmedFormValue(block, '.me-ci-name'),
    role: getTrimmedFormValue(block, '.me-ci-role'),
    level: getTrimmedFormValue(block, '.me-ci-level'),
    status: getTrimmedFormValue(block, '.me-ci-status'),
    hitpoints: getTrimmedFormValue(block, '.me-ci-hitpoints'),
    healthColor: getTrimmedFormValue(block, '.me-ci-healthColor'),
    money: moneyValue,
    moneyState: sanitizeCharacterInventoryMoney(moneyValue),
    showInfoTable: !!block.querySelector('.me-ci-show-info-table')?.checked,
    equipmentQuiz: collectCharacterInventoryJsonField(block, '.me-ci-equipment-quiz', {}),
    carryLabel: getTrimmedFormValue(block, '.me-ci-carryLabel'),
    carryValue: getTrimmedFormValue(block, '.me-ci-carryValue'),
    infoRows: editedInfoRows.length ? editedInfoRows : collectCharacterInventoryJsonField(block, '.me-ci-info-rows-json', []),
    attributes: editedCharacterAttributes.length ? editedCharacterAttributes : collectCharacterInventoryJsonField(block, '.me-ci-character-attributes-json', []),
    categories: collectCharacterInventoryRows(block, '[data-ci-category-row]', row => ({
      id: getTrimmedFormValue(row, '.me-ci-category-id'),
      label: getTrimmedFormValue(row, '.me-ci-category-label'),
      icon: getTrimmedFormValue(row, '.me-ci-category-icon')
    })),
    items: collectCharacterInventoryRows(block, '[data-ci-item-row]', row => {
      const itemDbKey = getTrimmedFormValue(row, '.me-ci-item-db-key');
      const originItemDbKey = getTrimmedFormValue(row, '.me-ci-item-origin-db-key');
      const draftItem = { itemDbKey };
      const individualized = itemDbKey && isCharacterInventoryEditorItemModified(row, draftItem);
      return {
        id: getTrimmedFormValue(row, '.me-ci-item-id'),
        itemDbKey: individualized ? '' : itemDbKey,
        originItemDbKey: individualized ? itemDbKey : originItemDbKey,
        itemStorageMode: individualized ? 'character' : getTrimmedFormValue(row, '.me-ci-item-storage-mode'),
        ownerCharacterId: getTrimmedFormValue(row, '.me-ci-item-owner-id'),
        ownerCharacterName: getTrimmedFormValue(row, '.me-ci-item-owner-name'),
        acquiredAt: getTrimmedFormValue(row, '.me-ci-item-acquired-at'),
        individualizedAt: individualized ? new Date().toISOString() : getTrimmedFormValue(row, '.me-ci-item-individualized-at'),
        category: getTrimmedFormValue(row, '.me-ci-item-category'),
        icon: getTrimmedFormValue(row, '.me-ci-item-icon'),
        image: getTrimmedFormValue(row, '.me-ci-item-image'),
        imageFormat: getTrimmedFormValue(row, '.me-ci-item-image-format'),
        imageFit: getTrimmedFormValue(row, '.me-ci-item-image-fit'),
        imagePosition: getTrimmedFormValue(row, '.me-ci-item-image-position'),
        name: getTrimmedFormValue(row, '.me-ci-item-name'),
        type: getTrimmedFormValue(row, '.me-ci-item-type'),
        description: getTrimmedFormValue(row, '.me-ci-item-description'),
        weight: getTrimmedFormValue(row, '.me-ci-item-weight'),
        quantity: getTrimmedFormValue(row, '.me-ci-item-quantity'),
        tags: getTrimmedFormValue(row, '.me-ci-item-tags'),
        combatDefinition: collectCharacterInventoryJsonField(row, '.me-ci-item-combat-definition', null),
        equipmentLink: collectCharacterInventoryJsonField(row, '.me-ci-item-equipment-link', null),
        infoRows: collectCharacterInventoryRows(row, '[data-ci-row-kind="item-info"]', infoRow => ({
          icon: getTrimmedFormValue(infoRow, '.me-ci-item-info-icon'),
          label: getTrimmedFormValue(infoRow, '.me-ci-item-info-label'),
          value: getTrimmedFormValue(infoRow, '.me-ci-item-info-value')
        })),
        attributes: collectCharacterInventoryRows(row, '[data-ci-attribute-kind="item"]', attributeRow => ({
          label: getTrimmedFormValue(attributeRow, '.me-ci-item-attribute-label'),
          value: getTrimmedFormValue(attributeRow, '.me-ci-item-attribute-value')
        }))
      };
    }),
    companions: collectCharacterInventoryRows(block, '[data-ci-companion-row]', row => ({
      id: getTrimmedFormValue(row, '.me-ci-companion-id'),
      image: getTrimmedFormValue(row, '.me-ci-companion-image'),
      imageFormat: getTrimmedFormValue(row, '.me-ci-companion-image-format'),
      imageFit: getTrimmedFormValue(row, '.me-ci-companion-image-fit'),
      imagePosition: getTrimmedFormValue(row, '.me-ci-companion-image-position'),
      name: getTrimmedFormValue(row, '.me-ci-companion-name'),
      species: getTrimmedFormValue(row, '.me-ci-companion-species'),
      role: getTrimmedFormValue(row, '.me-ci-companion-role'),
      status: getTrimmedFormValue(row, '.me-ci-companion-status'),
      statusColor: getTrimmedFormValue(row, '.me-ci-companion-statusColor'),
      summary: getTrimmedFormValue(row, '.me-ci-companion-summary'),
      description: getTrimmedFormValue(row, '.me-ci-companion-description'),
      infoRows: collectCharacterInventoryRows(row, '[data-ci-row-kind="companion-info"]', infoRow => ({
        icon: getTrimmedFormValue(infoRow, '.me-ci-companion-info-icon'),
        label: getTrimmedFormValue(infoRow, '.me-ci-companion-info-label'),
        value: getTrimmedFormValue(infoRow, '.me-ci-companion-info-value')
      })),
      attributes: collectCharacterInventoryRows(row, '[data-ci-attribute-kind="companion"]', attributeRow => ({
        label: getTrimmedFormValue(attributeRow, '.me-ci-companion-attribute-label'),
        value: getTrimmedFormValue(attributeRow, '.me-ci-companion-attribute-value')
      }))
    }))
  });
  return page;
}

function buildInlineCharacterInventoryEditor(page) {
  const data = sanitizeCharacterInventoryData(page?.characterInventory || {});
  return `
    <div class="inline-edit-section">
      <div class="inline-edit-kicker">Charakter-Inventar</div>
      <div class="inline-edit-grid">
        <div class="inline-edit-field"><span class="inline-edit-label">Titel</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="title" value="${escapeHtml(data.title)}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Untertitel</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="subtitle" value="${escapeHtml(data.subtitle)}"></div>
        <div class="inline-edit-field"><span class="inline-edit-label">Name</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="name" value="${escapeHtml(data.name)}"></div>
        <div class="inline-edit-field wide"><span class="inline-edit-label">Portrait</span><input class="inline-edit-input" data-inline-action="update-ci-field" data-ci-field="portrait" value="${escapeHtml(data.portrait)}"></div>
      </div>
      <div class="inline-placeholder-note">Items, Gefährten und Detailprofile bearbeitest du im großen Modul-Editor mit Live-Vorschau.</div>
    </div>`;
}

function updateInlineCharacterInventoryField(input) {
  const page = getInlineDraftPageForSource(input);
  if (!page) return;
  const data = sanitizeCharacterInventoryData(page.characterInventory || {});
  const field = input.dataset.ciField || '';
  if (!field) return;
  data[field] = String(input.value || '').trim();
  page.characterInventoryPage = true;
  page.characterInventory = sanitizeCharacterInventoryData(data);
}

function refreshCharacterInventoryEditorPreview(source) {
  const editor = source.closest('[data-ci-editor]');
  const card = source.closest('.module-page-card') || source.closest('[data-ci-embedded-card]');
  const frame = editor?.querySelector('.ci-preview-frame');
  if (!editor || !card || !frame) return;
  const page = card.matches('[data-ci-embedded-card]')
    ? collectCharacterInventoryModuleEditorPage(card, {})
    : collectModulePageFromCard(card);
  frame.innerHTML = buildCharacterInventoryPage({ ...page, characterInventoryReadOnly: true }, {}, 0, 1);
  if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
}

function rerenderCharacterInventoryEditor(button, updater) {
  const card = button.closest('.module-page-card') || button.closest('[data-ci-embedded-card]');
  if (!card) return;
  const embedded = card.matches('[data-ci-embedded-card]');
  const page = embedded
    ? collectCharacterInventoryModuleEditorPage(card, {})
    : collectModulePageFromCard(card);
  const data = sanitizeCharacterInventoryData(page.characterInventory || {});
  updater(data);
  page.characterInventoryPage = true;
  page.characterInventory = sanitizeCharacterInventoryData(data);
  card.outerHTML = embedded
    ? buildCharacterInventoryEmbeddedEditorMarkup(page.characterInventory)
    : buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
  if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
}

function getCharacterInventoryRowIndex(row, selector) {
  return Array.from(row?.parentElement?.querySelectorAll(selector) || []).indexOf(row);
}

function getCharacterInventoryFallbackCategory(categories = []) {
  return categories.find(category => category.id !== 'all')?.id || categories[0]?.id || 'equipment';
}

function addCharacterInventoryCategory(button) {
  rerenderCharacterInventoryEditor(button, data => {
    const index = data.categories.length + 1;
    data.categories.push({
      id: `category-${index}`,
      label: `Reiter ${index}`,
      icon: '*'
    });
  });
}

function removeCharacterInventoryCategory(button) {
  const row = button.closest('[data-ci-category-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-category-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0 || data.categories.length <= 1) return;
    const removed = data.categories[index]?.id;
    data.categories.splice(index, 1);
    const fallbackCategory = getCharacterInventoryFallbackCategory(data.categories);
    data.items.forEach(item => {
      if (item.category === removed) item.category = fallbackCategory;
    });
  });
}

function addCharacterInventoryRow(button) {
  const kind = button.dataset.ciKind || 'info';
  rerenderCharacterInventoryEditor(button, data => {
    if (kind === 'info' && data.infoRows.length < 8) {
      data.infoRows.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
  });
}

function removeCharacterInventoryRow(button) {
  const row = button.closest('[data-ci-row-kind]');
  const kind = row?.dataset.ciRowKind || 'info';
  const itemRow = row?.closest('[data-ci-item-row]');
  const companionRow = row?.closest('[data-ci-companion-row]');
  const index = Array.from(row?.parentElement?.querySelectorAll(`[data-ci-row-kind="${kind}"]`) || []).indexOf(row);
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0) return;
    if (kind === 'item-info' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.infoRows?.splice(index, 1);
      return;
    }
    if (kind === 'companion-info' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.infoRows?.splice(index, 1);
      return;
    }
    data.infoRows.splice(index, 1);
  });
}

function addCharacterInventoryAttribute(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.attributes.push({ label: 'Neues Attribut', value: 5 });
  });
}

function removeCharacterInventoryAttribute(button) {
  const row = button.closest('[data-ci-attribute-kind]');
  const kind = row?.dataset.ciAttributeKind || 'character';
  const itemRow = row?.closest('[data-ci-item-row]');
  const companionRow = row?.closest('[data-ci-companion-row]');
  const index = Array.from(row?.parentElement?.querySelectorAll(`[data-ci-attribute-kind="${kind}"]`) || []).indexOf(row);
  rerenderCharacterInventoryEditor(button, data => {
    if (index < 0) return;
    if (kind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.attributes?.splice(index, 1);
      return;
    }
    if (kind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.attributes?.splice(index, 1);
      return;
    }
    data.attributes.splice(index, 1);
  });
}

function addCharacterInventoryNestedRow(button, targetKind) {
  const itemRow = button.closest('[data-ci-item-row]');
  const companionRow = button.closest('[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (targetKind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.infoRows?.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
    if (targetKind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.infoRows?.push({ icon: '*', label: 'Neue Zeile', value: 'Wert' });
    }
  });
}

function addCharacterInventoryNestedAttribute(button, targetKind) {
  const itemRow = button.closest('[data-ci-item-row]');
  const companionRow = button.closest('[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (targetKind === 'item' && itemRow) {
      const itemIndex = Array.from(itemRow.parentElement.querySelectorAll('[data-ci-item-row]')).indexOf(itemRow);
      data.items[itemIndex]?.attributes?.push({ label: 'Neues Attribut', value: 5 });
    }
    if (targetKind === 'companion' && companionRow) {
      const companionIndex = Array.from(companionRow.parentElement.querySelectorAll('[data-ci-companion-row]')).indexOf(companionRow);
      data.companions[companionIndex]?.attributes?.push({ label: 'Neues Attribut', value: 5 });
    }
  });
}

function addCharacterInventoryItem(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.items.push({ name: 'Neuer Gegenstand', category: 'equipment', type: '', description: '', quantity: '1' });
  });
}

function addCharacterInventoryItemFromRegister(button) {
  if (typeof openItemDbPicker !== 'function') {
    if (typeof showAppStatus === 'function') showAppStatus('Item-Register ist nicht verfuegbar.', 'error');
    return;
  }
  const card = button.closest('.module-page-card') || button.closest('[data-ci-embedded-card]');
  if (!card) return;
  openItemDbPicker({
    title: 'Item aus Register hinzufügen',
    onSelect: item => {
      const embedded = card.matches('[data-ci-embedded-card]');
      const page = embedded
        ? collectCharacterInventoryModuleEditorPage(card, {})
        : collectModulePageFromCard(card);
      const data = sanitizeCharacterInventoryData(page.characterInventory || {});
      const equipped = typeof buildCharacterInventoryItemFromDbItem === 'function'
        ? buildCharacterInventoryItemFromDbItem(item, data)
        : null;
      if (!equipped) return;
      data.items.push(equipped);
      page.characterInventoryPage = true;
      page.characterInventory = sanitizeCharacterInventoryData(data);
      card.outerHTML = embedded
        ? buildCharacterInventoryEmbeddedEditorMarkup(page.characterInventory)
        : buildModulePageEditorMarkup(page, Number(card.dataset.pageIndex || 0));
      if (typeof syncModuleJsonPreview === 'function') syncModuleJsonPreview();
      if (typeof showAppStatus === 'function') showAppStatus(`${equipped.name} aus dem Register hinzugefügt.`, 'success');
    }
  });
}

function removeCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index >= 0) data.items.splice(index, 1);
  });
}

function moveCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  const direction = Number(button.dataset.ciDirection || 0);
  rerenderCharacterInventoryEditor(button, data => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= data.items.length) return;
    const [item] = data.items.splice(index, 1);
    data.items.splice(target, 0, item);
  });
}

function duplicateCharacterInventoryItem(button) {
  const row = button.closest('[data-ci-item-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-item-row]');
  rerenderCharacterInventoryEditor(button, data => {
    const item = data.items[index];
    if (!item) return;
    const clone = JSON.parse(JSON.stringify(item));
    clone.id = '';
    clone.name = `${clone.name || 'Gegenstand'} Kopie`;
    data.items.splice(index + 1, 0, clone);
  });
}

function addCharacterInventoryCompanion(button) {
  rerenderCharacterInventoryEditor(button, data => {
    data.companions.push({ name: 'Neuer Gefährte', species: '', role: 'Begleiter', status: 'Gesund' });
  });
}

function removeCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    if (index >= 0) data.companions.splice(index, 1);
  });
}

function moveCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  const direction = Number(button.dataset.ciDirection || 0);
  rerenderCharacterInventoryEditor(button, data => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= data.companions.length) return;
    const [companion] = data.companions.splice(index, 1);
    data.companions.splice(target, 0, companion);
  });
}

function duplicateCharacterInventoryCompanion(button) {
  const row = button.closest('[data-ci-companion-row]');
  const index = getCharacterInventoryRowIndex(row, '[data-ci-companion-row]');
  rerenderCharacterInventoryEditor(button, data => {
    const companion = data.companions[index];
    if (!companion) return;
    const clone = JSON.parse(JSON.stringify(companion));
    clone.id = '';
    clone.name = `${clone.name || 'Gefährte'} Kopie`;
    data.companions.splice(index + 1, 0, clone);
  });
}

let characterInventorySplitterState = null;

function startCharacterInventorySplitter(event, splitter) {
  const editor = splitter.closest('[data-ci-editor]');
  if (!editor) return;
  event.preventDefault();
  characterInventorySplitterState = { editor };
  document.body.classList.add('ci-resizing');
}

function moveCharacterInventorySplitter(event) {
  if (!characterInventorySplitterState?.editor) return;
  const editor = characterInventorySplitterState.editor;
  const rect = editor.getBoundingClientRect();
  const percent = Math.max(28, Math.min(68, ((event.clientX - rect.left) / rect.width) * 100));
  editor.style.setProperty('--ci-editor-width', `${percent}%`);
}

function stopCharacterInventorySplitter() {
  if (!characterInventorySplitterState) return;
  characterInventorySplitterState = null;
  document.body.classList.remove('ci-resizing');
}

document.addEventListener('pointerdown', event => {
  const splitter = event.target?.closest?.('.ci-editor-splitter');
  if (splitter) startCharacterInventorySplitter(event, splitter);
});
document.addEventListener('pointermove', moveCharacterInventorySplitter);
document.addEventListener('pointerup', stopCharacterInventorySplitter);
