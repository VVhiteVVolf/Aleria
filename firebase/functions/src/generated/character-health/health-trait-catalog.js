// Persistent afflictions are character traits. Healing and rest never remove them.
const skill = (name, bonus) => ({ name, bonus });
import { healthTraitIcon } from './health-trait-icons.js';
const save = (attributeKey, bonus) => ({ attributeKey, bonus });
const definition = (id, name, description, mechanics, cost, extra = {}) => ({
  id: `development-trait-${id}`, name, description, mechanics, cost,
  group: 'affliction', limitations: '', ...extra,
  icon: healthTraitIcon(id)
});

export const PERMANENT_AFFLICTIONS = Object.freeze([
  definition('blind', 'Blind', 'Dauerhafter Verlust des Sehvermögens. Nachteil auf Angriffswürfe; −2 Initiative. Rein visuelle Aufgaben sind ohne geeigneten Ersatzsinn unmöglich.', { attackRollMode: 'disadvantage', initiative: -2 }, -5, { exclusiveGroup: 'vision', rank: 3, limitations: 'Kein Sehen. Rein visuelle Aufgaben scheitern ohne passenden Ersatzsinn; Hör- und Tastproben bleiben möglich.' }),
  definition('einaeugig', 'Einäugig', 'Eingeschränktes räumliches Sehen: −1 auf Fernkampf-Waffenangriffe und −1 passive Wahrnehmung.', { weaponModifiers: [{ weaponTypes: ['bow', 'crossbow', 'firearm'], attack: -1, damage: 0 }], passivePerception: -1 }, -1, { exclusiveGroup: 'vision', rank: 2 }),
  definition('chronische-sehschwaeche', 'Dauerhafte Sehschwäche', '−1 auf Wahrnehmung und Nachforschungen. Individuell angepasste Sehhilfen werden gesondert vereinbart.', { skillModifiers: [skill('Wahrnehmung', -1), skill('Nachforschungen', -1)] }, -1, { exclusiveGroup: 'vision', rank: 1 }),
  definition('taub', 'Taub', 'Dauerhafter Verlust des Hörvermögens. −1 Initiative. Rein akustische Aufgaben sind ohne Ersatzwahrnehmung unmöglich; visuelle Wahrnehmung bleibt unverändert.', { initiative: -1 }, -3, { exclusiveGroup: 'hearing', rank: 2, limitations: 'Kein Hören. Verständigung durch Gebärden, Schrift und andere geeignete Wege bleibt möglich.' }),
  definition('einseitig-taub', 'Einseitig taub', 'Schallquellen lassen sich schwer orten: −1 Initiative und −1 passive Wahrnehmung.', { initiative: -1, passivePerception: -1 }, -1, { exclusiveGroup: 'hearing', rank: 1 }),
  definition('stumm', 'Stumm', 'Die Figur kann keine Stimme erzeugen. Schrift und Gebärden funktionieren; ausdrücklich stimmgebundene Handlungen benötigen eine Alternative.', {}, -2, { limitations: 'Keine eigene Stimme. Keine pauschalen Abzüge auf Persönlichkeit oder schriftliche Verständigung.' }),
  definition('geruchssinnverlust', 'Geruchssinnverlust', 'Gerüche werden nicht wahrgenommen. Rein geruchsbasierte Aufgaben sind ohne Ersatz unmöglich.', {}, -1, { limitations: 'Kein Geruchssinn; andere Wahrnehmungswege bleiben erhalten.' }),
  definition('geschmackssinnverlust', 'Geschmackssinnverlust', 'Geschmack wird nicht wahrgenommen. Verdorbene oder veränderte Speisen können nicht allein durch Kosten erkannt werden.', {}, 0, { limitations: 'Kein Geschmackssinn. Keine Giftresistenz und kein allgemeiner Wahrnehmungsmalus.' }),
  definition('einarmig', 'Einarmig', 'Ein Arm fehlt oder ist dauerhaft unbrauchbar: −2 auf Athletik. Tätigkeiten mit zwei benötigten Händen sind ohne geeigneten Ersatz nicht möglich.', { skillModifiers: [skill('Athletik', -2)] }, -4, { exclusiveGroup: 'hand-loss', rank: 3, limitations: 'Nur eine nutzbare Hand; keine Zweiwaffenführung und kein gleichzeitiger Waffeneinsatz mit getragenem Schild.' }),
  definition('fehlende-hand', 'Fehlende Hand', 'Eine Hand fehlt oder ist dauerhaft unbrauchbar: −1 auf Fingerfertigkeit. Handabhängige Ausrüstung benötigt eine passende Alternative.', { skillModifiers: [skill('Fingerfertigkeit', -1)] }, -3, { exclusiveGroup: 'hand-loss', rank: 2, limitations: 'Nur eine nutzbare Hand; Zweihandwaffen und Zweiwaffenführung benötigen einen geeigneten Ersatz.' }),
  definition('fehlende-finger', 'Fehlende Finger', 'Mehrere Finger fehlen oder sind dauerhaft unbeweglich: −2 auf Fingerfertigkeit.', { skillModifiers: [skill('Fingerfertigkeit', -2)] }, -1, { exclusiveGroup: 'hand-loss', rank: 1 }),
  definition('handtremor', 'Angeborener Handtremor', 'Anhaltendes Zittern: −2 auf Fingerfertigkeit und −1 auf Angriffe mit Bögen, Armbrüsten und Feuerwaffen.', { skillModifiers: [skill('Fingerfertigkeit', -2)], weaponModifiers: [{ weaponTypes: ['bow', 'crossbow', 'firearm'], attack: -1, damage: 0 }] }, -2, { innate: true }),
  definition('chronisches-hinken', 'Chronisches Hinken', 'Dauerhaft beeinträchtigter Gang: −1 m Bewegung und −1 auf Akrobatik.', { movement: -1, skillModifiers: [skill('Akrobatik', -1)] }, -1, { exclusiveGroup: 'leg-mobility', rank: 1 }),
  definition('versteiftes-knie', 'Versteiftes Knie', '−2 m Bewegung und −2 auf Akrobatik. Die Einschränkung bleibt nach Rasten bestehen.', { movement: -2, skillModifiers: [skill('Akrobatik', -2)] }, -2, { exclusiveGroup: 'leg-mobility', rank: 2 }),
  definition('fehlender-fuss', 'Fehlender Fuß', 'Ein Fuß fehlt oder ist dauerhaft unbrauchbar: −3 m Bewegung und −2 auf Körperbeherrschung. Hilfsmittel werden individuell abgebildet.', { movement: -3, skillModifiers: [skill('Körperbeherrschung', -2)] }, -3, { exclusiveGroup: 'leg-mobility', rank: 3 }),
  definition('gelaehmte-beine', 'Gelähmte Beine', 'Eigenständige Fortbewegung mit den Beinen ist nicht möglich. −3 auf Akrobatik; Rollstuhl, Reittier, Tragen oder Magie benötigen eine eigene Bewegungsregel.', { skillModifiers: [skill('Akrobatik', -3)] }, -5, { exclusiveGroup: 'leg-mobility', rank: 4, disablesWalking: true, limitations: 'Keine gehende Bewegung. Arme, Denken und geeignete Hilfsmittel bleiben nutzbar.' }),
  definition('wirbelsaeulenverkruemmung', 'Angeborene Wirbelsäulenverkrümmung', '−1 auf Athletik und Körperbeherrschung sowie −1 m Bewegung.', { movement: -1, skillModifiers: [skill('Athletik', -1), skill('Körperbeherrschung', -1)] }, -2, { innate: true }),
  definition('knochenbruechigkeit', 'Angeborene Knochenbrüchigkeit', '−4 maximale TP und −1 auf STÄ-Rettungswürfe. Keine pauschale Verdoppelung sämtlichen Schadens.', { maximumHitPoints: -4, saveAttributeModifiers: [save('strength', -1)] }, -3, { innate: true }),
  definition('bluterleiden', 'Angeborenes Bluterleiden', '−2 maximale TP und −2 auf Rettungswürfe gegen Blutungsfolgen. Bestehende feste Kritfolgen werden nicht verstärkt oder verlängert.', { maximumHitPoints: -2, saveModifiers: [{ kind: 'bleeding', bonus: -2 }] }, -2, { innate: true }),
  definition('lungenschwaeche', 'Chronische Lungenschwäche', '−2 auf KON-Rettungswürfe und −1 auf Athletik.', { saveAttributeModifiers: [save('constitution', -2)], skillModifiers: [skill('Athletik', -1)] }, -2),
  definition('angeborener-herzfehler', 'Angeborener Herzfehler', '−3 maximale TP und −1 auf KON-Rettungswürfe.', { maximumHitPoints: -3, saveAttributeModifiers: [save('constitution', -1)] }, -2, { innate: true }),
  definition('nierenschwaeche', 'Chronische Nierenschwäche', '−2 auf Rettungswürfe gegen Gift und −1 auf Körperbeherrschung.', { saveModifiers: [{ kind: 'poison', bonus: -2 }], skillModifiers: [skill('Körperbeherrschung', -1)] }, -2),
  definition('leberschwaeche', 'Chronische Leberschwäche', '−2 auf Rettungswürfe gegen Gift. Alkoholbelastung zählt zusätzlich um 25 % stärker; Toleranz verändert nicht diesen Nachteil.', { saveModifiers: [{ kind: 'poison', bonus: -2 }] }, -2, { alcoholMultiplier: 1.25 }),
  definition('verdauungsleiden', 'Chronisches Verdauungsleiden', '−2 maximale TP und −1 auf KON-Rettungswürfe. Passende Nahrung ist eine individuelle Erleichterung, keine automatische Heilung.', { maximumHitPoints: -2, saveAttributeModifiers: [save('constitution', -1)] }, -2),
  definition('nervenverletzung', 'Dauerhafte Nervenverletzung', '−1 auf Fingerfertigkeit und Körperbeherrschung; −1 Initiative.', { initiative: -1, skillModifiers: [skill('Fingerfertigkeit', -1), skill('Körperbeherrschung', -1)] }, -2),
  definition('chronische-migraene', 'Chronische Migräne', 'Anhaltende Beschwerden: −1 Initiative und −1 auf Nachforschungen. Einzelne schwere Schübe werden gesondert geführt.', { initiative: -1, skillModifiers: [skill('Nachforschungen', -1)] }, -1),
  definition('schlaf-wach-stoerung', 'Chronische Schlaf-Wach-Störung', '−2 Initiative. Schlafanfälle werden ausdrücklich als eigener Zustand vergeben, niemals zufällig beim Laden.', { initiative: -2 }, -1, { }),
  definition('lichtempfindliche-augen', 'Dauerhaft lichtempfindliche Augen', '−1 auf Wahrnehmung und Fernkampf-Waffenangriffe. Schutz vor grellem Licht wird individuell berücksichtigt.', { skillModifiers: [skill('Wahrnehmung', -1)], weaponModifiers: [{ weaponTypes: ['bow', 'crossbow', 'firearm'], attack: -1, damage: 0 }] }, -2, { }),
  definition('vernarbtes-gewebe', 'Chronisch vernarbtes Gewebe', '−2 maximale TP und −1 auf Akrobatik durch dauerhaft eingeschränkte Gewebeelastizität.', { maximumHitPoints: -2, skillModifiers: [skill('Akrobatik', -1)] }, -1),
  definition('arkane-vernarbung', 'Dauerhafte arkane Vernarbung', '−1 Zauberangriff und −1 auf Rettungswürfe gegen Magie. Keine automatische Infektion mit Arkanistenfieber.', { spellAttack: -1 }, -2, { magicSavePenalty: -1 })
]);

const fever = (id, name, rank, description, mechanics, cost, variant = 'human') => definition(id, name, description, mechanics, cost, {
  group: 'fever', exclusiveGroup: 'arcane-fever', rank, variant,
  referenceUrl: '/AleriaAlmanach/AleriaAlmanach.html?entry=arkanistenfieber'
});
export const ARCANE_FEVER_TRAITS = Object.freeze([
  fever('arkanistenfieber-anzeichen', 'Anzeichen vom Arkanistenfieber', 1, 'Beginnende arkane Überreizung: +1 Zauberangriff, −1 Initiative. Eine Beobachtung, noch kein sicher festgestelltes Hauptstadium.', { spellAttack: 1, initiative: -1 }, 1),
  fever('arkanistenfieber-symptome', 'Erste Symptome des Arkanistenfiebers', 2, 'Der kurzzeitige Magieschub bleibt: +1 Zauberangriff; −1 Initiative und −1 auf KON-Rettungswürfe. Weitere Magie gefährdet die Figur.', { spellAttack: 1, initiative: -1, saveAttributeModifiers: [save('constitution', -1)] }, 0),
  ...['human', 'druid'].flatMap(variant => [1, 2, 3, 4].map(stage => {
    const roman = ['I', 'II', 'III', 'IV'][stage - 1];
    const mechanics = { skill: -stage, initiative: -stage, savingThrow: -stage, movement: -stage,
      ...(variant === 'human' ? { maximumHitPoints: -[0, 2, 6, 8][stage - 1] } : { saveAttributeModifiers: [save('wisdom', -stage)] }),
      ...(stage === 4 ? { blocksActions: true } : {}) };
    const symptoms = variant === 'druid' ? ['Erschöpfung und gestörte Aura', 'Halluzinationen und instabile Instinkte', 'Schwerer geistiger Verfall ohne Nekrose', 'Vollständiger Ich-Verlust ohne Nekrose'][stage - 1]
      : ['Müdigkeit, Blässe und entzündete Augen', 'Krämpfe, Fieber und Organstörungen', 'Fortschreitende Nekrose und geistiger Verfall', 'Vollständiger Ich-Verlust'][stage - 1];
    const values = `−${stage} auf Fertigkeiten, Rettungswürfe und Initiative; −${stage} m Bewegung${variant === 'human' && stage > 1 ? `; −${[0, 2, 6, 8][stage - 1]} maximale TP` : ''}${variant === 'druid' ? `; zusätzlich −${stage} auf WEI-Rettungswürfe` : ''}.`;
    return fever(`arkanes-fieber-${variant}-${stage}`, `Arkanes Fieber ${roman}. Stadium${variant === 'druid' ? ' (Druidenvariante)' : ''}`, stage + 2,
      `${symptoms}. ${values}${stage === 4 ? ' Keine selbstbestimmten Kampfhandlungen; Abwarten bleibt möglich.' : ''} Keine Heilung durch TP-Heilung oder Rast.`, mechanics, -stage * 2, variant);
  }))
]);

export const ADDICTION_TRAITS = Object.freeze([
  ['alcohol', 'Alkoholiker', 'Betrunken'], ['kriss', 'Kriss-süchtig', 'Kriss-Rausch'], ['smaragdflux', 'Smaragdflux-süchtig', 'Smaragdflux-Rausch']
].flatMap(([substance, title, relief]) => [1, 2, 3].map(stage => definition(`abhaengigkeit-${substance}-${stage}`, `${title} (${['I', 'II', 'III'][stage - 1]}. Stadium)`,
  `Entzug: −${stage} auf Fertigkeiten${stage > 1 ? ` und −${stage - 1} Initiative` : ''}${stage === 3 ? '; −1 auf KON-Rettungswürfe' : ''}. Diese Entzugsabzüge entfallen ausschließlich während „${relief}“. Die Abhängigkeit bleibt bestehen.`,
  { skill: -stage, initiative: -(stage - 1), ...(stage === 3 ? { saveAttributeModifiers: [save('constitution', -1)] } : {}) }, -stage,
  { group: 'addiction', exclusiveGroup: `addiction:${substance}`, rank: stage, substance, }
))));

export const TOLERANCE_TRAITS = Object.freeze([['alcohol', 'Alkohol'], ['kriss', 'Kriss'], ['smaragdflux', 'Smaragdflux']].map(([substance, title]) =>
  definition(`substanztoleranz-${substance}`, `Substanztoleranz (${title})`, 'Die nötige Rauschmenge verdoppelt sich. Nachwirkungen, Organschäden und Krankheitsrisiken werden dadurch nicht halbiert.', {}, 1,
    { group: 'tolerance', substance, toleranceFactor: 2 })
));
export const HEALTH_TRAIT_DEFINITIONS = Object.freeze([...PERMANENT_AFFLICTIONS, ...ARCANE_FEVER_TRAITS, ...ADDICTION_TRAITS, ...TOLERANCE_TRAITS]);
export function getHealthTraitOrigin(entry) {
  const id = typeof entry === 'string' ? entry : entry?.developmentTraitId || entry?.id;
  return HEALTH_TRAIT_DEFINITIONS.find(trait => trait.id === id) || null;
}
