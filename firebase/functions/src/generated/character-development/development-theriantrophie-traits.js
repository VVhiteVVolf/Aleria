// Status/ancestry and passive baseline only. A trait does not activate a beast form.
const skill = (name, bonus) => ({ name, bonus });
const save = (attributeKey, bonus) => ({ attributeKey, bonus });
const MODULE_URL = '/AleriaAlmanach/AleriaAlmanach.html?entry=theriantrophie';
const beasts = [
  { id: 'werwolf', animal: 'Wolf', form: 'Werwolf', sourceBasis: 'module',
    curse: { initiative: 1, skillModifiers: [skill('Wahrnehmung', 2)], saveAttributeModifiers: [save('wisdom', -2)] },
    curseText: '+2 auf Wahrnehmung, +1 Initiative und −2 auf WEI-Rettungswürfe.',
    blessing: { skillModifiers: [skill('Wahrnehmung', 1), skill('Überleben', 1)], saveAttributeModifiers: [save('strength', 1)] },
    blessingText: '+1 auf Wahrnehmung, Überleben und STÄ-Rettungswürfe.', blessingCost: 2 },
  { id: 'werbaer', animal: 'Bär', form: 'Werbär', sourceBasis: 'module',
    curse: { maximumHitPoints: 3, skillModifiers: [skill('Athletik', 1)], saveAttributeModifiers: [save('wisdom', -2)] },
    curseText: '+3 maximale TP, +1 auf Athletik und −2 auf WEI-Rettungswürfe.',
    blessing: { maximumHitPoints: 3, saveAttributeModifiers: [save('constitution', 1)] },
    blessingText: '+3 maximale TP und +1 auf KON-Rettungswürfe.', blessingCost: 3 },
  { id: 'wereber', animal: 'Eber', form: 'Wereber', sourceBasis: 'authored-variant',
    curse: { skillModifiers: [skill('Athletik', 2), skill('Körperbeherrschung', 1), skill('Motiv erkennen', -2)], saveAttributeModifiers: [save('wisdom', -1)] },
    curseText: '+2 auf Athletik, +1 auf Körperbeherrschung, −2 auf Motiv erkennen und −1 auf WEI-Rettungswürfe.',
    blessing: { initiative: -1, saveAttributeModifiers: [save('strength', 1), save('constitution', 1)] },
    blessingText: '+1 auf STÄ- und KON-Rettungswürfe, −1 Initiative.', blessingCost: 1 },
  { id: 'werluchs', animal: 'Luchs', form: 'Werluchs', sourceBasis: 'authored-variant',
    curse: { skillModifiers: [skill('Heimlichkeit', 2), skill('Akrobatik', 1)], saveAttributeModifiers: [save('wisdom', -2)] },
    curseText: '+2 auf Heimlichkeit, +1 auf Akrobatik und −2 auf WEI-Rettungswürfe.',
    blessing: { initiative: 1, skillModifiers: [skill('Heimlichkeit', 2)] },
    blessingText: '+2 auf Heimlichkeit und +1 Initiative.', blessingCost: 2 }
];

export const THERIANTHROPY_TRAIT_DEFINITIONS = beasts.flatMap(beast => [
  [`theriantrophie-${beast.id}-fluch`, `Zatracher Theriantrophie (${beast.form}) · Fluchform`,
    `Zatrachs Fluch des ${beast.animal === 'Bär' ? 'Bären' : beast.animal === 'Wolf' ? 'Wolfes' : beast.animal === 'Luchs' ? 'Luchses' : 'Ebers'}: ungewollte, gewöhnlich mondgebundene Hybridwandlung mit Kontrollverlust. Passive Grundprägung: ${beast.curseText}`, beast.curse, -1],
  [`theriantrophie-${beast.id}-segen`, `Zatracher Theriantrophie (${beast.form}) · Jüngersegen`,
    `Zatrachs Jüngersegen mit grundsätzlich willentlich gelenkter Wandlung und erhaltenem Verstand. Passive Grundprägung: ${beast.blessingText}`, beast.blessing, beast.blessingCost]
]);

export const SYMBIOSIS_TRAIT_DEFINITIONS = [
  ['symbiose-varulv-wolf', 'Silvanische Symbiose der Varulv (Wolf)', 'Angeborene Verbindung zu Silvanas Wolfs-Urgeist im Erbe der Varulv. Grundprägung: +1 auf Wahrnehmung, Überleben und Mit Tieren umgehen.', { skillModifiers: [skill('Wahrnehmung', 1), skill('Überleben', 1), skill('Mit Tieren umgehen', 1)] }, 2],
  ['symbiose-diuid-baer', 'Silvanische Symbiose der Mac Ard Diuid (Bär)', 'Überliefertes Bärenerbe der Mhathain in der Diuid-Linie. Grundprägung: +2 maximale TP, +1 auf Athletik und STÄ-Rettungswürfe. Stärkere Manifestationen sind selten.', { maximumHitPoints: 2, skillModifiers: [skill('Athletik', 1)], saveAttributeModifiers: [save('strength', 1)] }, 3],
  ['symbiose-lockart-baer', 'Silvanische Symbiose der Ó Lockart (Bär)', 'Abgeschwächtes Bärenerbe aus der Diuid-Linie. Grundprägung: +1 auf KON-Rettungswürfe, Körperbeherrschung und passive Wahrnehmung. Die Überlieferung beschreibt seltene Träger.', { passivePerception: 1, skillModifiers: [skill('Körperbeherrschung', 1)], saveAttributeModifiers: [save('constitution', 1)] }, 2],
  ['symbiose-haig-baer', 'Silvanische Symbiose der Dál Haig (Bär)', 'Seltenes, schwach ausgeprägtes Bärenerbe der Haig; in der Clanüberlieferung nicht für jeden Angehörigen belegt. Grundprägung: +2 auf Athletik und +1 auf Körperbeherrschung.', { skillModifiers: [skill('Athletik', 2), skill('Körperbeherrschung', 1)] }, 2]
];

const clan = (id, clanName, familyId, animal, emblem, lineageId, confidence) => ({
  id: `development-trait-symbiose-${id}`, kind: 'symbiosis', state: 'bond', animal,
  clanName, familyId, lineageId, confidence, referenceUrl: MODULE_URL,
  clanUrl: `/Stammbäume/Stammbaum.html?family=${familyId}&mode=view`,
  clanEmblem: `/Stammbäume/assets/images/houses/${emblem}`
});
export const TRANSFORMATION_TRAIT_ORIGINS = Object.freeze([
  ...beasts.flatMap(beast => ['fluch', 'segen'].map(state => ({
    id: `development-trait-theriantrophie-${beast.id}-${state}`, kind: 'therianthropy',
    state: state === 'fluch' ? 'curse' : 'blessing', animal: beast.animal, form: beast.form,
    sourceBasis: beast.sourceBasis, referenceUrl: MODULE_URL
  }))),
  clan('varulv-wolf', 'Varulv', 'haus-varulv', 'Wolf', 'Aldrimar/clan-varulv.png', 'varulv-wolf', 'author-confirmed'),
  clan('diuid-baer', 'Mac Ard Diuid', 'haus-diuid', 'Bär', 'Faelaorn/clan-diuid.png', 'mhathain-bear', 'clan-tradition'),
  clan('lockart-baer', 'Ó Lockart', 'haus-lockart', 'Bär', 'Faelaorn/clan-lockart.png', 'mhathain-bear', 'clan-tradition'),
  clan('haig-baer', 'Dál Haig', 'haus-haig', 'Bär', 'Faelaorn/clan-haig.png', 'mhathain-bear', 'rare-unconfirmed-tradition')
]);

export function getTransformationTraitOrigin(id) {
  return TRANSFORMATION_TRAIT_ORIGINS.find(origin => origin.id === id) || null;
}
