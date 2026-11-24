export const CENYR_ADMINISTRATION_SCOPES = Object.freeze([
  { id: 'saethwyr', territoryId: 'herrschaft-saethwyr', houseId: 'haus-saethwyr', rank: 'prince', fleet: true },
  { id: 'gafyr', territoryId: 'herrschaft-gafyr', houseId: 'haus-gafyr', rank: 'prince' },
  { id: 'wyrm', territoryId: 'herrschaft-wyrm', houseId: 'haus-wyrm', rank: 'prince' },
  { id: 'draig', territoryId: 'grafschaft-celtigerns-wacht', houseId: 'haus-draig', rank: 'county' },
  { id: 'arthus-streben', territoryId: 'baronie-arthus-streben', houseId: 'haus-gwefrydd', rank: 'barony', preparation: true },
  { id: 'gwendolyns-ufer', territoryId: 'baronie-gwendolyns-ufer', houseId: 'haus-gwyvern', rank: 'barony', preparation: true, fleet: true, legacyCouncil: true },
  { id: 'rhonwens-traenen', territoryId: 'herrschaft-rhonwens-traenen', houseId: 'haus-arwydd', rank: 'prince', preparation: true,
    fleet: true, separateCoastalCommand: true },
].map(Object.freeze));

const ranks = {
  county: { label: 'Grafschaft', ruler: 'Grafen', courtSize: 2 },
  barony: { label: 'Baronie', ruler: 'Baron', courtSize: 1.5 },
  prince: { label: 'Ritterfürstentum', ruler: 'Ritterfürsten', courtSize: 1 },
};

export const rankOf = house => ranks[house.rank || (house.county ? 'county' : 'prince')];
export const rulerSuffix = house => `des ${rankOf(house).ruler}${house.rank === 'barony' ? 's' : ''}`;
export const scopeForTerritory = id => CENYR_ADMINISTRATION_SCOPES.find(scope => scope.territoryId === id);
export const scopeForHouse = id => CENYR_ADMINISTRATION_SCOPES.find(scope => scope.houseId === id);
