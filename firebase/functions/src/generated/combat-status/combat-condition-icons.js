const iconRoot = '/AleriaAlmanach/public/assets/combat-status/diamonds-v2/';
const normalize = value => String(value || '').toLocaleLowerCase('de').replace(/ä/g, 'ae').replace(/ö/g, 'oe')
  .replace(/ü/g, 'ue').replace(/ß/g, 'ss').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const aliases = {
  advantage: ['Vorteil'], disadvantage: ['Nachteil'], blessed: ['Gesegnet', 'Segen', 'bless'],
  protected: ['Geschützt', 'Schutz', 'Deckung'], bane: ['Verflucht', 'Fluch', 'cursed'],
  poisoned: ['Vergiftet', 'Gift', 'poison'], bleeding: ['Blutend', 'Blutung', 'Blutige Wunde', 'Verbeißender Biss', 'bleed'],
  burning: ['Brennend', 'Brand', 'in Flammen'], burned: ['Verbrannt', 'Verbrennung'],
  frostburn: ['Frostbrand', 'Frostbrandt', 'Frostbiss', 'Gefrierbrand', 'Frost Burn'],
  chilled: ['Unterkühlt', 'Fröstelnd', 'Ausgekühlt', 'Kälte'], frozen: ['Eingefroren', 'Gefroren', 'Vereist'],
  wet: ['Nass', 'Durchnässt'], blinded: ['Geblendet', 'Blind', 'Blendung'], deafened: ['Taub', 'Gehörlos', 'Ohrenbetäubt'],
  prone: ['Liegend', 'Gestürzt', 'Niedergeworfen', 'Zu Boden gebracht', 'Niedergeschlagen'],
  restrained: ['Festgesetzt', 'Gefesselt', 'Gefangen', 'Fesseln'],
  held: ['Festgehalten', 'Gehalten', 'Ergriffen', 'Gepackt', 'Grappled', 'Tiefengriff'],
  paralyzed: ['Gelähmt', 'Lähmung', 'Paralysiert', 'Paralysed'],
  stunned: ['Betäubt', 'Betäubung', 'Gestunned', 'Stun'], dazed: ['Benommen', 'Benommenheit', 'Desorientiert'],
  sleeping: ['Schlafend', 'Schlaf', 'Eingeschlafen'], unconscious: ['Bewusstlos', 'Kampfunfähig', 'Ohnmächtig', 'incapacitated'],
  fear: ['Verängstigt', 'Furcht', 'Angst', 'Erschrocken', 'Frightened'],
  exhausted: ['Erschöpft', 'Erschöpfung', 'Ermüdet', 'Fatigue'],
  silenced: ['Verstummt', 'Stumm', 'Schweigen', 'Stille', 'silence'],
  charmed: ['Bezaubert', 'Bezirzt', 'Umgarnter Blick', 'Umgarnt', 'Charm'],
  entangled: ['Verstrickt', 'Verwurzelt', 'Verheddert', 'ensnared'], petrified: ['Versteinert', 'Versteinerung'],
  surprised: ['Überrascht', 'Überraschung'], invisible: ['Unsichtbar', 'Verborgen', 'Getarnt'],
  disarmed: ['Entwaffnet', 'Entwaffnung', 'Waffe verloren'], dead: ['Tot', 'Verstorben'],
  slowed: ['Verlangsamt', 'Verlangsamung'], weakened: ['Geschwächt', 'Schwächung'], healing: ['Heilend', 'Regeneration', 'Regenerierend'],
  concentration: ['Konzentration', 'Konzentriert'], channeling: ['Kanalisierung', 'Kanalisierend'],
  marked: ['Gezeichnete Beute', 'Vom Rudel bedrängt', 'Markiert', 'Beutemarkierung'],
  berserk: ['Berserkergang', 'Rasend', 'Rage', 'Wut'], tenebrium: ['Durch Tenebrium gehemmt', 'Tenebrium-gehemmt'],
  drunk: ['Betrunken', 'Trunken', 'Trunkenheit', 'alcohol-intoxication'], hangover: ['Verkatert', 'Kater'],
  'kriss-intoxication': ['Kriss-Rausch'], 'smaragdflux-intoxication': ['Smaragdflux-Rausch'],
  'blutstaub-intoxication': ['Blutstaub-Rausch']
};
const iconByName = new Map(Object.entries(aliases).flatMap(([id, variants]) => [id, ...variants].map(value => [normalize(value), id])));
const resourceIcons = {
  action: 'action', 'bonus-action': 'bonus-action', reaction: 'reaction', 'special-action': 'special-action',
  'aura-focus': 'focus', focus: 'focus', inspiration: 'inspiration', 'mana-focus': 'mana', mana: 'mana'
};

function nameIcon(value) {
  const name = normalize(value);
  if (iconByName.has(name)) return iconByName.get(name);
  // Runtime IDs can carry the rule source and an instance suffix. Restrict
  // matching to complete words so a held spear line never means a grapple.
  const words = name.split('-');
  return words.map(word => iconByName.get(word)).find(Boolean);
}

export function getCombatConditionIconId(condition = {}) {
  if (condition.restraint?.dc > 0) return 'held';
  const explicit = iconByName.get(normalize(condition.presetId));
  if (explicit) return explicit;
  const names = [condition.name, condition.sourceConditionId, ...String(condition.tags || '').split(/[,;·]/), condition.id];
  const exact = names.map(value => iconByName.get(normalize(value))).find(Boolean);
  if (exact) return exact;
  if (condition.ward?.enabled && condition.ward.charges > 0) return 'protected';
  if (condition.damageGuard?.charges > 0) return 'protected';
  if (condition.berserk) return 'berserk';
  if (condition.criticalPeriodicLoss > 0) return 'bleeding';
  const identified = names.filter(value => normalize(value) !== 'gehaltene-speerlinie').map(nameIcon).find(Boolean);
  return identified || { buff: 'advantage', debuff: 'disadvantage' }[condition.statusKind] || 'condition';
}

export const getCombatConditionIconSource = condition => `${iconRoot}${getCombatConditionIconId(condition)}.webp`;
export const getCombatResourceDiamond = resource => {
  const id = resourceIcons[resource?.id] || (String(resource?.id || '').startsWith('spell-slot-') ? 'mana' : '');
  return id ? `${iconRoot}${id}.webp` : '';
};
