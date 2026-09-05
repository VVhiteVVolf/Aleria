import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import {
  createDrachentanzTechnique,
  movementEffect,
  secondarySave,
  temporaryCondition
} from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.jungdrache;
const CANTREF_WEAPONS = { cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'] };
const CANTREF_UCHELWYR_WEAPONS = { ...CANTREF_WEAPONS, uchelwyr: ['lance'] };
const UCHELWYR_WEAPONS = { uchelwyr: ['sword', 'lance'] };
const ARTHWYR_WEAPONS = { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] };
const MILWR_WEAPONS = { milwr: ['sword', 'spear', 'axe', 'battleaxe', 'club', 'mace'] };

function foundation(spec) {
  return createDrachentanzTechnique({ formId: F, slotBands: ['foundation'], tier: 'Grundform', ...spec });
}

export const CANTREF_FOUNDATION_TECHNIQUES = Object.freeze([
  foundation({
    slug: 'cantref-jungdrache-kuss-der-speerspitze', name: 'Kuss der Speerspitze', minimumLevel: 1,
    description: 'Ein kurzer gerader Stich prüft Abstand und Deckung, ohne die Linie des Cantref zu öffnen.',
    effect: 'Verursacht Technikschaden und erlaubt danach einen Schritt von 1 Meter, ohne die Speerspitze vom Ziel zu lösen.',
    activationType: 'bonus-action', costs: ['bonus-action'], allowedClassIds: ['cantref', 'uchelwyr'], classWeaponProfiles: CANTREF_UCHELWYR_WEAPONS, weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true,
    weaponTypes: ['spear', 'polearm'], effects: [movementEffect('cantref-kuss', 1, 'move', 'self', 'Kontrollierter Schritt nach dem Stich.')]
  }),
  foundation({
    slug: 'cantref-jungdrache-haken-des-jungdrachen', name: 'Haken des Jungdrachens', minimumLevel: 2,
    description: 'Schaft und Blatt greifen Waffe, Arm oder Bein des Gegners und reißen dessen Haltung auf.',
    effect: 'Verursacht Technikschaden. Misslingt ein Stärkerettungswurf, erhält das Ziel −1 Angriff bis zu seinem nächsten Beitrag.',
    costs: ['action', 'reaction'], secondarySave: secondarySave('cantref-haken', 'Verhakte Haltung', 'Die verhakte Haltung erschwert den nächsten Angriff.', { attack: -1 }),
    allowedClassIds: ['cantref', 'uchelwyr'], classWeaponProfiles: CANTREF_UCHELWYR_WEAPONS, weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true, weaponTypes: ['spear', 'polearm']
  }),
  foundation({
    slug: 'cantref-jungdrache-wacht-der-langen-schuppe', name: 'Wacht der langen Schuppe', minimumLevel: 3,
    description: 'Der Cantref fängt einen Vorstoß an der äußersten Reichweite ab und antwortet aus sicherer Linie.',
    effect: 'Reaktionsangriff mit Technikschaden. Bis zum nächsten eigenen Beitrag steigt die Rüstungsklasse um 1.',
    activationType: 'reaction', costs: ['reaction'], effects: [temporaryCondition('cantref-wacht', 'Lange Wacht', 'Die Stangenwaffe hält die Angriffslinie geschlossen.', { armorClass: 1 }, { target: 'self', on: 'always' })],
    allowedClassIds: ['cantref', 'uchelwyr'], classWeaponProfiles: CANTREF_UCHELWYR_WEAPONS, weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true, weaponTypes: ['spear', 'polearm']
  }),
  foundation({
    slug: 'cantref-jungdrache-kreisender-dorn', name: 'Kreisender Dorn', minimumLevel: 4,
    description: 'Ein weiter Griffwechsel führt Spitze oder Blatt in einem kontrollierten Halbkreis durch die Front.',
    effect: 'Trifft bis zu zwei Gegner in Waffenreichweite mit je Technikschaden; jeder Treffer wird einzeln gewürfelt.',
    costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2,
    target: 'Bis zu zwei Gegner',
    allowedClassIds: ['cantref'], classWeaponProfiles: CANTREF_WEAPONS, weaponRuleSetId: 'cantref-polearm', weaponTypes: ['spear', 'polearm']
  }),
  foundation({
    slug: 'cantref-jungdrache-durchstossende-spur', name: 'Durchstoßende Spur', minimumLevel: 5,
    description: 'Der Cantref setzt den ganzen Körper hinter einen geraden Vorstoß und treibt die Spitze durch die Deckung.',
    effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.',
    activationType: 'action', costs: ['action', 'bonus-action', 'reaction'], targetDefenseModifier: -1,
    allowedClassIds: ['cantref'], classWeaponProfiles: CANTREF_WEAPONS, weaponRuleSetId: 'cantref-polearm', weaponTypes: ['spear', 'polearm']
  }),
  foundation({
    slug: 'cantref-jungdrache-sechszackige-linie', name: 'Sechszackige Linie', minimumLevel: 6,
    description: 'Sechs Lehrstöße wechseln Höhe, Seite und Griff, bis die gegnerische Linie keine sichere Öffnung mehr kennt.',
    effect: 'Verursacht Technikschaden. Misslingt ein Geschicklichkeitsrettungswurf, wird das Ziel 2 Meter zurückgedrängt.',
    activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], secondarySave: secondarySave('cantref-sechszackig', 'Gebrochene Linie', 'Der Zielstand wird durch die Folge der Stöße aufgebrochen.', { armorClass: -1 }, { attributeKey: 'dexterity' }),
    allowedClassIds: ['cantref'], classWeaponProfiles: CANTREF_WEAPONS, weaponRuleSetId: 'cantref-polearm', weaponTypes: ['spear', 'polearm']
  })
]);

export const UCHELWYR_FOUNDATION_TECHNIQUES = Object.freeze([
  foundation({ slug: 'uchelwyr-jungdrache-hoher-grusshieb', name: 'Hoher Grußhieb', minimumLevel: 1,
    description: 'Die Klinge sinkt aus der hohen Reiterwacht in einen knappen, sicheren Lehrhieb.', effect: 'Verursacht Technikschaden.',
    activationType: 'bonus-action', costs: ['bonus-action'], allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] }),
  foundation({ slug: 'uchelwyr-jungdrache-zuegelhand', name: 'Zügelhand', minimumLevel: 2,
    description: 'Eine einhändige Parade hält die zweite Hand für Zügel oder Schild frei.', effect: 'Verursacht Technikschaden und gibt bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.',
    costs: ['action', 'reaction'], effects: [temporaryCondition('uchelwyr-zuegelhand', 'Zügelhand', 'Die einhändige Linie schützt Reiter und Flanke.', { armorClass: 1 }, { target: 'self', on: 'always' })],
    allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] }),
  foundation({ slug: 'uchelwyr-jungdrache-steigbuegelkonter', name: 'Steigbügelkonter', minimumLevel: 3,
    description: 'Der Uchelwyr fängt einen Angriff mit kurzer Klingenbewegung ab und antwortet über die freie Seite.', effect: 'Reaktionsangriff mit Technikschaden.',
    activationType: 'reaction', costs: ['reaction'], allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] }),
  foundation({ slug: 'uchelwyr-jungdrache-kreis-der-flanken', name: 'Kreis der Flanken', minimumLevel: 4,
    description: 'Ein weiter Seitenhieb hält Gegner von beiden Flanken fern.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden.',
    costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 2, target: 'Bis zu zwei Gegner', allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] }),
  foundation({ slug: 'uchelwyr-jungdrache-vorstoss-des-hohen-sitzes', name: 'Vorstoß des hohen Sitzes', minimumLevel: 5,
    description: 'Ein langer Vorstoß verbindet Reichweite, festen Sitz und das Gewicht des gesamten Körpers.', effect: 'Verursacht Technikschaden und schiebt das Ziel bei misslungenem Stärkerettungswurf 2 Meter zurück.',
    activationType: 'action', costs: ['action', 'bonus-action', 'reaction'], secondarySave: secondarySave('uchelwyr-vorstoss', 'Zurückgedrängt', 'Der Vorstoß bricht den Stand des Ziels.', { armorClass: -1 }),
    allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] }),
  foundation({ slug: 'uchelwyr-jungdrache-wappen-des-jungdrachen', name: 'Wappen des Jungdrachens', minimumLevel: 6,
    description: 'Der Uchelwyr schließt die Grundform mit einer Folge aus Parade, Flankenwechsel und schwerem Endhieb.', effect: 'Verursacht Technikschaden und gibt bis zum nächsten eigenen Beitrag +1 Angriff.',
    activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], effects: [temporaryCondition('uchelwyr-wappen', 'Hoher Sitz', 'Die abgeschlossene Folge schafft eine günstige Angriffslinie.', { attack: 1 }, { target: 'self', on: 'always' })],
    allowedClassIds: ['uchelwyr'], classWeaponProfiles: UCHELWYR_WEAPONS, weaponTypes: ['sword', 'spear'] })
]);

export const ARTHWYR_FOUNDATION_TECHNIQUES = Object.freeze([
  foundation({ slug: 'arthwyr-jungdrache-tatze-des-jungdrachen', name: 'Tatze des Jungdrachens', minimumLevel: 1,
    description: 'Ein kurzer, schwerer Schlag ersetzt die feine Lehrlinie durch unmittelbare Wucht.', effect: 'Verursacht Technikschaden.', activationType: 'bonus-action', costs: ['bonus-action'], attackBonus: -1,
    allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] }),
  foundation({ slug: 'arthwyr-jungdrache-brechender-biss', name: 'Brechender Biss', minimumLevel: 2,
    description: 'Die Waffe schlägt von oben in Schildrand, Schaft oder Schulter.', effect: 'Verursacht Technikschaden; misslingt ein Stärkerettungswurf, erhält das Ziel −1 Rüstungsklasse.', costs: ['action', 'reaction'], attackBonus: -1,
    secondarySave: secondarySave('arthwyr-biss', 'Aufgebrochene Deckung', 'Die schwere Waffe hat die Deckung aus der Linie gedrückt.', { armorClass: -1 }), allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] }),
  foundation({ slug: 'arthwyr-jungdrache-schulter-des-baeren', name: 'Schulter des Bären', minimumLevel: 3,
    description: 'Der Arthwyr nimmt einen Treffer auf die starke Linie und antwortet mit Körper und Waffe.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', activationType: 'reaction', costs: ['reaction'], effects: [temporaryCondition('arthwyr-schulter', 'Fester Stand', 'Gewicht und Haltung erschweren das Durchbrechen der Deckung.', { armorClass: 1 }, { target: 'self', on: 'always' })], allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] }),
  foundation({ slug: 'arthwyr-jungdrache-klaffender-kreis', name: 'Klaffender Kreis', minimumLevel: 4,
    description: 'Ein großer Rundschlag räumt den Raum vor dem Arthwyr frei.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden.', costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 3, target: 'Bis zu drei Gegner', allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] }),
  foundation({ slug: 'arthwyr-jungdrache-sturmpranke', name: 'Sturmpranke', minimumLevel: 5,
    description: 'Ein wuchtiger Antritt endet in einem Schlag, der Gegner aus ihrer Stellung treibt.', effect: 'Verursacht Technikschaden und drängt das Ziel bei misslungenem Stärkerettungswurf 3 Meter zurück.', activationType: 'action', costs: ['action', 'bonus-action', 'reaction'], attackBonus: -1,
    secondarySave: secondarySave('arthwyr-sturmpranke', 'Niedergerungen', 'Die Wucht lässt keine stabile Gegenwehr zu.', { attack: -1, armorClass: -1 }), allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] }),
  foundation({ slug: 'arthwyr-jungdrache-sechs-schlaege-des-arth', name: 'Sechs Schläge des Arth', minimumLevel: 6,
    description: 'Sechs schwere Grundschläge werden ohne Zögern zu einer einzigen brechenden Folge verbunden.', effect: 'Verursacht Technikschaden, trifft aber mit einem zusätzlichen Malus von −1.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], attackBonus: -1,
    allowedClassIds: ['arthwyr'], classWeaponProfiles: ARTHWYR_WEAPONS, weaponTypes: ['sword', 'axe', 'mace'] })
]);

export const MILWR_FOUNDATION_TECHNIQUES = Object.freeze([
  foundation({ slug: 'milwr-jungdrache-erster-soldhieb', name: 'Erster Soldhieb', minimumLevel: 1,
    description: 'Eine robuste Kurzfassung des ersten Lehrhiebs, die sich mit gewöhnlichen Feldwaffen ausführen lässt.', effect: 'Verursacht Technikschaden.', activationType: 'bonus-action', costs: ['bonus-action'], allowedClassIds: ['milwr'], classWeaponProfiles: MILWR_WEAPONS, weaponTypes: ['sword', 'spear', 'axe', 'mace'] }),
  foundation({ slug: 'milwr-jungdrache-schildlueckenstoss', name: 'Schildlückenstoß', minimumLevel: 2,
    description: 'Der Milwr wartet auf eine Lücke in der gegnerischen Formation und stößt ohne Zierde hinein.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', costs: ['action'], attackBonus: 1, allowedClassIds: ['milwr'], classWeaponProfiles: MILWR_WEAPONS, weaponTypes: ['sword', 'spear', 'axe', 'mace'] }),
  foundation({ slug: 'milwr-jungdrache-nachsetzen-der-reihe', name: 'Nachsetzen der Reihe', minimumLevel: 4,
    description: 'Ein Treffer wird mit einem zweiten, kürzeren Schlag abgesichert.', effect: 'Verursacht Technikschaden.', costs: ['action', 'bonus-action'], allowedClassIds: ['milwr'], classWeaponProfiles: MILWR_WEAPONS, weaponTypes: ['sword', 'spear', 'axe', 'mace'] }),
  foundation({ slug: 'milwr-jungdrache-vierfacher-feldhieb', name: 'Vierfacher Feldhieb', minimumLevel: 6,
    description: 'Die vier erlernten Grundlinien werden zu einem kräftigen Abschluss für den Formationskampf verbunden.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', activationType: 'special-action', costs: ['action', 'special-action'], effects: [temporaryCondition('milwr-feldhieb', 'Geschlossene Reihe', 'Nach dem Hieb kehrt der Milwr sofort in eine gedeckte Haltung zurück.', { armorClass: 1 }, { target: 'self', on: 'always' })], allowedClassIds: ['milwr'], classWeaponProfiles: MILWR_WEAPONS, weaponTypes: ['sword', 'spear', 'axe', 'mace'] })
]);

const HELWYR_BRANCHES = Object.freeze([
  { id: 'helwyr-longbow', prefix: 'Langbogen', profiles: ['longbow'], types: ['bow'], range: 'Fernkampf', entries: [
    [1, 'federblick', 'Federblick', 'Ein rascher Schuss prüft Wind und Bewegung.', 'Der Schuss verursacht Technikschaden und erhält +1 Angriff.'],
    [2, 'nagel-des-jungdrachen', 'Nagel des Jungdrachens', 'Der Pfeil wird auf eine schmale Lücke in der Deckung gesetzt.', 'Verursacht Technikschaden.'],
    [4, 'weite-schuppe', 'Weite Schuppe', 'Ein schwerer Pfeil hält einen Gegner außerhalb seiner günstigen Distanz.', 'Verursacht Technikschaden.'],
    [6, 'sehnenschlag', 'Sehnenschlag', 'Der Schütze bündelt Atem, Stand und Sehnenspannung in einem durchdringenden Schuss.', 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.']
  ] },
  { id: 'helwyr-shortbow', prefix: 'Kurzbogen', profiles: ['shortbow'], types: ['bow'], range: 'Fernkampf', entries: [
    [1, 'laufender-schuss', 'Laufender Schuss', 'Der Helwyr löst den Pfeil mitten im Stellungswechsel.', 'Verursacht Technikschaden und erlaubt 2 Meter Eigenbewegung.'],
    [2, 'zweiter-fluegelschlag', 'Zweiter Flügelschlag', 'Ein schneller Folgeschuss nutzt die Reaktion auf den ersten Pfeil.', 'Verursacht Technikschaden.'],
    [4, 'kreisflug', 'Kreisflug', 'Der Helwyr umrundet die gegnerische Linie und schießt aus einem neuen Winkel.', 'Verursacht Technikschaden und gibt bis zum nächsten Beitrag +1 Rüstungsklasse.'],
    [6, 'regen-des-jungdrachen', 'Regen des Jungdrachens', 'Zwei Pfeile folgen einander so schnell, dass sie wie ein einziger Angriff wirken.', 'Verursacht Technikschaden.']
  ] },
  { id: 'helwyr-dual-blades', prefix: 'Doppelklinge', profiles: ['dual-swords', 'dual-daggers'], types: ['sword', 'dagger'], range: 'Nahkampf', entries: [
    [1, 'zwei-fänge', 'Zwei Fänge', 'Die zweite Klinge folgt unmittelbar in dieselbe Deckungslücke.', 'Verursacht Technikschaden.'],
    [3, 'gekreuzter-fang', 'Gekreuzter Fang', 'Beide Klingen schließen sich scherenartig um die gegnerische Waffe.', 'Verursacht Technikschaden; ein misslungener Geschicklichkeitsrettungswurf erschwert den nächsten Angriff.'],
    [5, 'schattenpaar', 'Schattenpaar', 'Der Helwyr wechselt tief und hoch, bevor das Ziel die erste Klinge verfolgt hat.', 'Verursacht Technikschaden.']
  ] },
  { id: 'helwyr-classic-sword', prefix: 'Schwert', profiles: ['sword'], types: ['sword'], range: 'Nahkampf', entries: [
    [1, 'waldwacht', 'Waldwacht', 'Ein knapper Schwertangriff schützt den Rückzug aus dem Nahkampf.', 'Verursacht Technikschaden und erlaubt 1 Meter Eigenbewegung.'],
    [4, 'gruener-halbkreis', 'Grüner Halbkreis', 'Ein tiefer Halbkreis hält zwei Verfolger voneinander fern.', 'Trifft bis zu zwei Gegner mit je Technikschaden.'],
    [6, 'letzte-sehne', 'Letzte Sehne', 'Wenn der Bogen schweigt, führt der Helwyr das Schwert wie einen gespannten Schuss.', 'Verursacht Technikschaden.']
  ] }
]);

export const HELWYR_FOUNDATION_TECHNIQUES = Object.freeze(HELWYR_BRANCHES.flatMap(branch => branch.entries.map(([level, slug, name, description, effect]) => foundation({
  slug: `helwyr-jungdrache-${slug}`, name, minimumLevel: level, description, effect,
  activationType: level === 1 ? 'bonus-action' : 'action',
  costs: level === 1 ? ['bonus-action'] : (level >= 5 ? ['action', 'bonus-action', 'reaction'] : (level >= 4 ? ['action', 'bonus-action'] : ['action'])),
  range: branch.range,
  attackBonus: branch.id === 'helwyr-longbow' && level === 1 ? 1 : 0,
  targetDefenseModifier: branch.id === 'helwyr-longbow' && level === 6 ? -1 : 0,
  maximumTargets: name === 'Grüner Halbkreis' ? 2 : 1,
  effects: name === 'Laufender Schuss' ? [movementEffect('helwyr-laufend', 2, 'move', 'self')]
    : (name === 'Kreisflug' ? [temporaryCondition('helwyr-kreisflug', 'Bewegte Deckung', 'Der Stellungswechsel erschwert Gegenangriffe.', { armorClass: 1 }, { target: 'self', on: 'always' })]
      : (name === 'Waldwacht' ? [movementEffect('helwyr-waldwacht', 1, 'move', 'self')]
        : (name === 'Gekreuzter Fang' ? [] : []))),
  secondarySave: name === 'Gekreuzter Fang' ? secondarySave('helwyr-gekreuzt', 'Gebundene Klinge', 'Die gebundene Waffe erschwert den nächsten Angriff.', { attack: -1 }, { attributeKey: 'dexterity' }) : undefined,
  allowedClassIds: ['helwyr'], classWeaponProfiles: { helwyr: branch.profiles }, branchId: branch.id,
  weaponTypes: branch.types, tags: [branch.prefix]
}))));

export const BARDDWYR_FOUNDATION_TECHNIQUES = Object.freeze([
  foundation({ slug: 'barddwyr-jungdrache-auftaktstich', name: 'Auftaktstich', minimumLevel: 1,
    description: 'Ein leichter Rapierstoß setzt Tempo und Abstand wie den ersten Schlag eines Liedes.', effect: 'Verursacht Technikschaden und erlaubt 1 Meter Eigenbewegung.', activationType: 'bonus-action', costs: ['bonus-action'], effects: [movementEffect('barddwyr-auftakt', 1, 'move', 'self')], allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['rapier'] }, branchId: 'barddwyr-rapier', weaponTypes: ['sword'] }),
  foundation({ slug: 'barddwyr-jungdrache-synkope', name: 'Synkope der Klinge', minimumLevel: 2,
    description: 'Der Stoß fällt bewusst zwischen die erwarteten Takte der gegnerischen Parade.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', costs: ['action'], attackBonus: 1,
    allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['rapier'] }, branchId: 'barddwyr-rapier', weaponTypes: ['sword'] }),
  foundation({ slug: 'barddwyr-jungdrache-refrain-der-spitze', name: 'Refrain der Spitze', minimumLevel: 4,
    description: 'Ein wiederkehrendes Stoßmuster zwingt das Ziel, dieselbe Deckungslücke zweimal zu schließen.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', costs: ['action', 'bonus-action'], effects: [temporaryCondition('barddwyr-refrain', 'Tanzender Refrain', 'Der Rapier bleibt nach dem Angriff in stetiger Bewegung.', { armorClass: 1 }, { target: 'self', on: 'always' })], allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['rapier'] }, branchId: 'barddwyr-rapier', weaponTypes: ['sword'] }),
  foundation({ slug: 'barddwyr-jungdrache-schlusskadenz', name: 'Schlusskadenz des Jungdrachens', minimumLevel: 6,
    description: 'Drei beschleunigte Stöße schließen die Grundausbildung in einer hellen, präzisen Kadenz.', effect: 'Verursacht Technikschaden und ist bereits bei natürlicher 19 kritisch.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], criticalThreshold: 19,
    allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['rapier'] }, branchId: 'barddwyr-rapier', weaponTypes: ['sword'] }),
  foundation({ slug: 'barddwyr-jungdrache-vershieb', name: 'Vershieb', minimumLevel: 1,
    description: 'Eine verkürzte Schwertlinie verbindet Vortragshaltung und ritterliche Grundform.', effect: 'Verursacht Technikschaden.', activationType: 'bonus-action', costs: ['bonus-action'], allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['sword'] }, branchId: 'barddwyr-sword', weaponTypes: ['sword'] }),
  foundation({ slug: 'barddwyr-jungdrache-klingenreim', name: 'Klingenreim', minimumLevel: 4,
    description: 'Zwei schlichte Schwerthiebe beantworten einander wie die Zeilen eines kurzen Reims.', effect: 'Verursacht Technikschaden.', costs: ['action', 'bonus-action'], allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['sword'] }, branchId: 'barddwyr-sword', weaponTypes: ['sword'] })
]);

export const CLASS_FOUNDATION_TECHNIQUES = Object.freeze([
  ...CANTREF_FOUNDATION_TECHNIQUES,
  ...UCHELWYR_FOUNDATION_TECHNIQUES,
  ...ARTHWYR_FOUNDATION_TECHNIQUES,
  ...MILWR_FOUNDATION_TECHNIQUES,
  ...HELWYR_FOUNDATION_TECHNIQUES,
  ...BARDDWYR_FOUNDATION_TECHNIQUES
]);
