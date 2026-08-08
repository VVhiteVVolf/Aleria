const ICON_ROOT = '../../../IconOrdner';

function assetUrl(path) {
  return new URL(`${ICON_ROOT}/${path}`, import.meta.url).href;
}

function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('de');
}

function entrySearchText(entry = {}) {
  return normalizeSearchText([
    entry.name,
    entry.school,
    entry.type,
    entry.delivery,
    entry.damageType,
    entry.tags,
    entry.description,
    entry.appliesWhen,
    entry.source
  ].filter(Boolean).join(' '));
}

function matchAsset(searchText, mappings, fallbackPath) {
  const match = mappings.find(([keywords]) => keywords.some(keyword => searchText.includes(keyword)));
  return assetUrl(match?.[1] || fallbackPath);
}

const SPELL_ICON_MAPPINGS = Object.freeze([
  [['sonne', 'sun', 'strahlend', 'radiant', 'heilig'], 'Zauber Icons/Oblivion Style/OB-icon-Sundamage.png'],
  [['feuer', 'fire', 'flamme', 'brand', 'brenn'], 'Zauber Icons/Oblivion Style/OB-icon-Fire.png'],
  [['frost', 'kalte', 'kalt', 'cold', 'eis'], 'Zauber Icons/Oblivion Style/OB-icon-Frost.png'],
  [['blitz', 'lightning', 'shock', 'donner', 'thunder', 'sturm'], 'Zauber Icons/Oblivion Style/OB-icon-Shock.png'],
  [['heil', 'restore', 'regeneration', 'lebenskraft'], 'Zauber Icons/Oblivion Style/OB-icon-Restore.png'],
  [['schild', 'schutz', 'barriere', 'shield'], 'Zauber Icons/Oblivion Style/OB-icon-Shield.png'],
  [['absorb', 'entzieh', 'raub'], 'Zauber Icons/Oblivion Style/OB-icon-Absorb.png'],
  [['unsichtbar', 'invisible', 'invisibility'], 'Zauber Icons/Oblivion Style/OB-icon-Invisibility.png'],
  [['schatten', 'dunkel', 'darkness'], 'Zauber Icons/Oblivion Style/OB-icon-Darkness.png'],
  [['licht', 'light'], 'Zauber Icons/Oblivion Style/OB-icon-Light.png'],
  [['gift', 'poison', 'saure', 'acid'], 'Zauber Icons/Oblivion Style/OB-icon-Poisonweakness.png'],
  [['lahm', 'paraly', 'stun', 'erstarr'], 'Zauber Icons/Oblivion Style/OB-icon-Paralyze.png'],
  [['bezauber', 'charm', 'verfuhr'], 'Zauber Icons/Oblivion Style/OB-icon-Charm.png'],
  [['ruhe', 'calm', 'besanftig'], 'Zauber Icons/Oblivion Style/OB-icon-Calm.png'],
  [['zorn', 'frenzy', 'raserei', 'rage'], 'Zauber Icons/Oblivion Style/OB-icon-Frenzy.png'],
  [['beschwor', 'summon', 'rufung'], 'Zauber Icons/Oblivion Style/OB-icon-Summonatronach.png'],
  [['untot', 'undead', 'seele', 'nekro', 'necrotic'], 'Zauber Icons/Oblivion Style/OB-icon-Soultrap.png'],
  [['bann', 'dispel', 'aufheb'], 'Zauber Icons/Oblivion Style/OB-icon-Dispel.png'],
  [['entdeck', 'detect', 'aufspur'], 'Zauber Icons/Oblivion Style/OB-icon-Detectlife.png'],
  [['telekin', 'fernbeweg'], 'Zauber Icons/Oblivion Style/OB-icon-Telekinesis.png'],
  [['wasser', 'water'], 'Zauber Icons/Oblivion Style/OB-icon-Waterwalk.png'],
  [['stark', 'fortify', 'verstark', 'buff', 'aura'], 'Zauber Icons/Oblivion Style/OB-icon-Fortify.png'],
  [['schwach', 'weakness', 'debuff', 'schwach'], 'Zauber Icons/Oblivion Style/OB-icon-Weakness.png']
]);

const TRAIT_ICON_MAPPINGS = Object.freeze([
  [['in die jahre', 'gebrech', 'greis', 'alt', 'aged', 'infirm'], 'Traits Icon/Infirm.png'],
  [['waffenmeister', 'schwertmeister', 'duell', 'duelist'], 'Traits Icon/Duelist.png'],
  [['marschall', 'stratege', 'strategie', 'taktik'], 'Traits Icon/Strategist.png'],
  [['mentor', 'inspir', 'ausbilder', 'lehrmeister'], 'Traits Icon/Inspiring_leader.png'],
  [['drachen', 'dragon', 'meister vieler formen'], 'Traits Icon/Way_of_the_Dragon.png'],
  [['ritterfurst', 'furst', 'herrscher', 'verwalter'], 'Traits Icon/Administrator.png'],
  [['ritter', 'kreuzritter', 'crusader'], 'Traits Icon/Crusader.png'],
  [['mutig', 'tapfer', 'brave'], 'Traits Icon/Brave.png'],
  [['stark', 'kraftig', 'brawny'], 'Traits Icon/Brawny.png'],
  [['zahe', 'zah', 'unyielding'], 'Traits Icon/Unyielding_leader.png'],
  [['geduldig', 'abwartend', 'patient'], 'Traits Icon/Patient.png'],
  [['zorn', 'wut', 'wroth'], 'Traits Icon/Wroth.png'],
  [['stur', 'stubborn'], 'Traits Icon/Stubborn.png'],
  [['gelehrt', 'weise', 'scholar'], 'Traits Icon/Erudite.png'],
  [['charisma', 'verhandler'], 'Traits Icon/Charismatic_negotiator.png'],
  [['aggressiv', 'offensiv'], 'Traits Icon/Aggressive_leader.png'],
  [['defensiv', 'verteidig'], 'Traits Icon/Defensive_leader.png']
]);

const CONDITION_ICON_MAPPINGS = Object.freeze([
  [['brenn', 'feuer', 'burning'], 'Zauber Icons/Baldurs Gate/Condition Icons/Burning_Condition_Icon.webp'],
  [['blut', 'bleed'], 'Zauber Icons/Baldurs Gate/Condition Icons/Bleeding_Condition_Icon.webp'],
  [['blind'], 'Zauber Icons/Baldurs Gate/Condition Icons/Blinded_Condition_Icon.webp'],
  [['gift', 'poison'], 'Zauber Icons/Baldurs Gate/Condition Icons/Poisoned_Condition_Icon.webp'],
  [['gelahmt', 'paralys'], 'Zauber Icons/Baldurs Gate/Condition Icons/Paralysed_Condition_Icon.webp'],
  [['betäubt', 'betaubt', 'stun'], 'Zauber Icons/Baldurs Gate/Condition Icons/Stunned_Condition_Icon.webp'],
  [['liegend', 'prone', 'niedergeschlagen'], 'Zauber Icons/Baldurs Gate/Condition Icons/Prone_Condition_Icon.webp'],
  [['gefesselt', 'restrain'], 'Zauber Icons/Baldurs Gate/Condition Icons/Restrained_Condition_Icon.webp'],
  [['verstrickt', 'ensnar'], 'Zauber Icons/Baldurs Gate/Condition Icons/Ensnared_Condition_Icon.webp'],
  [['schlaf', 'sleep'], 'Zauber Icons/Baldurs Gate/Condition Icons/Sleeping_Condition_Icon.webp'],
  [['bewusstlos', 'unconscious'], 'Zauber Icons/Baldurs Gate/Condition Icons/Unconscious_Condition_Icon.webp'],
  [['tot', 'dead'], 'Zauber Icons/Baldurs Gate/Condition Icons/Dead_Condition_Icon.webp'],
  [['nass', 'wet'], 'Zauber Icons/Baldurs Gate/Condition Icons/Wet_Condition_Icon.webp'],
  [['kalt', 'frost', 'eis', 'chilled'], 'Zauber Icons/Baldurs Gate/Condition Icons/Chilled_Condition_Icon.webp'],
  [['versteinert', 'petrif'], 'Zauber Icons/Baldurs Gate/Condition Icons/Petrified_Condition_Icon.webp'],
  [['bezaubert', 'charmed'], 'Zauber Icons/Baldurs Gate/Condition Icons/Charmed_Condition_Icon.webp'],
  [['gesegnet', 'segen', 'bless'], 'Zauber Icons/Baldurs Gate/Condition Icons/Bless_Condition_Icon.webp'],
  [['überrascht', 'uberrascht', 'surpris'], 'Zauber Icons/Baldurs Gate/Condition Icons/Surprised_Condition_Icon.webp'],
  [['benommen', 'dazed'], 'Zauber Icons/Baldurs Gate/Condition Icons/Dazed_Condition_Icon.webp']
]);

const DAMAGE_TYPE_MAPPINGS = Object.freeze([
  [['saure', 'acid'], 'Acid'],
  [['wucht', 'bludgeon'], 'Bludgeoning'],
  [['kalte', 'kalt', 'frost', 'cold', 'eis'], 'Cold'],
  [['feuer', 'fire', 'brand'], 'Fire'],
  [['energie', 'force', 'magie', 'arkan'], 'Force'],
  [['blitz', 'lightning', 'shock'], 'Lightning'],
  [['nekro', 'necrotic', 'tod'], 'Necrotic'],
  [['stich', 'piercing'], 'Piercing'],
  [['gift', 'poison'], 'Poison'],
  [['psych', 'mental'], 'Psychic'],
  [['strahl', 'radiant', 'heilig'], 'Radiant'],
  [['hieb', 'schnitt', 'schneid', 'slashing'], 'Slashing'],
  [['donner', 'thunder', 'schall'], 'Thunder']
]);

function getDamageAssetKey(damageType, fallback = 'Force') {
  const searchText = normalizeSearchText(damageType);
  return DAMAGE_TYPE_MAPPINGS.find(([keywords]) => keywords.some(keyword => searchText.includes(keyword)))?.[1] || fallback;
}

function getAutomaticEntryIconSource(kind, entry = {}) {
  const searchText = entrySearchText(entry);
  if (kind === 'spell') {
    return matchAsset(searchText, SPELL_ICON_MAPPINGS, 'Zauber Icons/Oblivion Style/OB-icon-Fortifymagic.png');
  }
  if (kind === 'condition') {
    return matchAsset(searchText, CONDITION_ICON_MAPPINGS, 'Zauber Icons/Baldurs Gate/Condition Icons/Dazed_Condition_Icon.webp');
  }
  if (kind === 'ability' && /zauber|magie|arkan|aura|gebet|spell|prayer/.test(searchText)) {
    return matchAsset(searchText, SPELL_ICON_MAPPINGS, 'Zauber Icons/Oblivion Style/OB-icon-Fortify.png');
  }
  return matchAsset(searchText, TRAIT_ICON_MAPPINGS, kind === 'ability' ? 'Traits Icon/Strategist.png' : 'Traits Icon/Conscientious.png');
}

export function getCombatEntryIconPresentation(kind, entry = {}) {
  const fallbackSource = getAutomaticEntryIconSource(kind, entry);
  const customSource = String(entry.icon || '').trim();
  return {
    source: customSource || fallbackSource,
    fallbackSource,
    custom: Boolean(customSource)
  };
}

export function getDamageTypeIconSource(damageType) {
  return assetUrl(`Zauber Icons/Baldurs Gate/Schadensarten/${getDamageAssetKey(damageType)}_Damage_Icon.png`);
}

export function getActivationIconSource(activationType) {
  const fileName = {
    action: 'Action_Icon.png',
    'bonus-action': 'Bonus_Action_Icon.png',
    reaction: 'Reaction_Icon.png',
    'special-action': 'Red_Star_Icon.png',
    passive: 'Red_Star_Icon.png'
  }[String(activationType || '').toLocaleLowerCase('de')] || 'Action_Icon.png';
  return assetUrl(`Zauber Icons/Baldurs Gate/Ressourcen/${fileName}`);
}

export function getRangeIconSource() {
  return assetUrl('Zauber Icons/Baldurs Gate/Ressourcen/Movement_Speed_Icon.png');
}

export function getRollIconSource(formula, damageType) {
  const sides = String(formula || '').match(/[dw](4|6|8|10|12)\b/i)?.[1];
  if (!sides) return assetUrl('Zauber Icons/Baldurs Gate/Würfel Icons/D20.png');
  return assetUrl(`Zauber Icons/Baldurs Gate/Würfel Icons/D${sides}_${getDamageAssetKey(damageType, 'Physical')}.png`);
}

export const combatEntryIconInternals = Object.freeze({ normalizeSearchText, getDamageAssetKey });
