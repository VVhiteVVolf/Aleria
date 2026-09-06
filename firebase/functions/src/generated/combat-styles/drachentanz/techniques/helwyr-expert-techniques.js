import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

const LEVEL_RULES = Object.freeze({
  9: { costs: ['action', 'bonus-action'] },
  11: { costs: ['action', 'reaction'] },
  13: { costs: ['action', 'aura-focus'] },
  16: { costs: ['bonus-action', 'special-action'] },
  18: { costs: ['action', 'bonus-action', 'reaction'] },
  20: { costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }] }
});

const BRANCHES = Object.freeze({
  longbow: { id: 'helwyr-longbow', profiles: ['longbow'], types: ['bow'], range: 'Fernkampf' },
  shortbow: { id: 'helwyr-shortbow', profiles: ['shortbow'], types: ['bow'], range: 'Fernkampf' },
  dual: { id: 'helwyr-dual-blades', profiles: ['dual-swords', 'dual-daggers'], types: ['sword', 'dagger'], range: 'Nahkampf' },
  sword: { id: 'helwyr-classic-sword', profiles: ['sword'], types: ['sword'], range: 'Nahkampf' },
  flexible: { id: 'helwyr-flexible', profiles: ['longbow', 'shortbow', 'dual-swords', 'dual-daggers', 'sword'], types: ['bow', 'sword', 'dagger'], range: 'Waffenreichweite' }
});

function helwyr(formId, pathSlug, entry) {
  const rule = LEVEL_RULES[entry.level];
  const branch = BRANCHES[entry.branch];
  const effects = [];
  if (entry.move) effects.push(movementEffect(`helwyr-${pathSlug}-${entry.slug}`, entry.move, 'move', 'self'));
  if (entry.armorClass) effects.push(temporaryCondition(`helwyr-${pathSlug}-${entry.slug}`, entry.conditionName || 'Bewegte Deckung', entry.conditionText || 'Die Stellung erschwert den nächsten Gegenangriff.', { armorClass: entry.armorClass }, { target: 'self', on: 'always' }));
  return createDrachentanzTechnique({
    formId,
    slug: `helwyr-${pathSlug}-${entry.slug}`,
    name: entry.name,
    minimumLevel: entry.level,
    slotBands: ['expert'],
    tier: entry.level >= 18 ? 'Helwyr-Meisterschuss' : 'Helwyr-Pfadattacke',
    description: entry.description,
    effect: entry.effect,
    activationType: entry.activationType || (pathSlug === 'abwartender' ? 'reaction' : 'action'),
    costs: entry.costs || (entry.level === 18 && entry.maximumTargets >= 3 ? [...rule.costs, 'special-action'] : rule.costs),
    attackBonus: entry.attackBonus || 0,
    targetDefenseModifier: entry.targetDefenseModifier || 0,
    criticalThreshold: entry.criticalThreshold || 20,
    maximumTargets: entry.maximumTargets || 1,
    target: entry.maximumTargets > 1 ? `Bis zu ${entry.maximumTargets} Gegner` : 'Ein Gegner',
    range: branch.range,
    rollMode: entry.rollMode || 'normal',
    effects,
    secondarySave: entry.save ? secondarySave(`helwyr-${pathSlug}-${entry.slug}`, entry.save.name, entry.save.text, entry.save.mechanics, { attributeKey: entry.save.attribute || 'dexterity', dcAttributeKey: entry.save.dcAttribute || 'dexterity' }) : undefined,
    allowedClassIds: ['helwyr'],
    classWeaponProfiles: { helwyr: branch.profiles },
    weaponTypes: branch.types,
    branchId: branch.id,
    tags: ['Helwyr', branch.id]
  });
}

const PATHS = Object.freeze([
  { formId: F.abwartender, slug: 'abwartender', entries: [
    { level: 9, slug: 'sehnenkonter', name: 'Sehnenkonter', branch: 'longbow', description: 'Der Pfeil verlässt die Sehne im Augenblick des gegnerischen Angriffs.', effect: 'Reaktionsschuss mit Technikschaden und +1 Angriff.', attackBonus: 1, costs: ['reaction', 'bonus-action'] },
    { level: 11, slug: 'lockschuss', name: 'Lockschuss', branch: 'shortbow', description: 'Ein absichtlich schwacher Schuss lockt das Ziel in die zweite, vorbereitete Linie.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', move: 3, costs: ['bonus-action', 'reaction'] },
    { level: 13, slug: 'scherenwacht', name: 'Scherenwacht', branch: 'dual', description: 'Beide Klingen warten eng am Körper und schließen sich um den eindringenden Angriff.', effect: 'Reaktionsangriff mit Technikschaden und +2 Rüstungsklasse.', armorClass: 2, conditionName: 'Scherenwacht', costs: ['reaction', 'aura-focus'] },
    { level: 16, slug: 'ruhender-fernblick', name: 'Ruhender Fernblick', branch: 'longbow', description: 'Völlige Ruhe macht eine winzige Öffnung auf große Entfernung sichtbar.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und senkt die Zielverteidigung um 1.', attackBonus: 2, targetDefenseModifier: -1 },
    { level: 18, slug: 'rueckwaertsregen', name: 'Rückwärtsregen', branch: 'shortbow', description: 'Der Helwyr weicht zurück und legt einen dichten Pfeilweg zwischen sich und die Verfolger.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und erlaubt 5 Meter Eigenbewegung.', maximumTargets: 3, move: 5 },
    { level: 20, slug: 'auge-des-alten-drachen', name: 'Auge des alten Drachen', branch: 'longbow', description: 'Der Meister wartet durch Lärm und Bewegung hindurch auf den einzigen vollkommenen Schuss.', effect: 'Verursacht Technikschaden, erhält +3 Angriff und senkt die Zielverteidigung um 2.', attackBonus: 3, targetDefenseModifier: -2, costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }] }
  ] },
  { formId: F.fliegender, slug: 'fliegender', entries: [
    { level: 9, slug: 'laufender-doppelschuss', name: 'Laufender Doppelschuss', branch: 'shortbow', description: 'Zwei Pfeile werden in einem einzigen Lauf gelöst.', effect: 'Verursacht Technikschaden und erlaubt 4 Meter Eigenbewegung.', move: 4 },
    { level: 11, slug: 'falkensturz', name: 'Falkensturz', branch: 'longbow', description: 'Ein Schuss aus erhöhter oder fallender Bewegung trifft die obere Deckung.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und senkt die Zielverteidigung um 1.', attackBonus: 1, targetDefenseModifier: -1 },
    { level: 13, slug: 'klingensprung', name: 'Klingensprung', branch: 'dual', description: 'Der Helwyr springt durch die Nahkampflinie und schneidet im Vorübergehen mit beiden Klingen.', effect: 'Verursacht Technikschaden und erlaubt 5 Meter Eigenbewegung.', move: 5 },
    { level: 16, slug: 'windspur', name: 'Windspur', branch: 'shortbow', description: 'Bewegung und Schussfolge zeichnen eine unberechenbare Spur durch das Feld.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden und gewährt +2 Rüstungsklasse.', maximumTargets: 2, armorClass: 2, conditionName: 'Windspur' },
    { level: 18, slug: 'himmelspfeil', name: 'Himmelspfeil', branch: 'longbow', description: 'Aura trägt einen schweren Pfeil in eine steile, kaum gedeckte Flugbahn.', effect: 'Verursacht Technikschaden, wird mit Vorteil gewürfelt und senkt die Zielverteidigung um 2.', rollMode: 'advantage', targetDefenseModifier: -2 },
    { level: 20, slug: 'jagd-ohne-boden', name: 'Jagd ohne Boden', branch: 'flexible', description: 'Der Meister wechselt Waffe und Stellung, ohne seine beschleunigte Jagd zu unterbrechen.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden, erlaubt 8 Meter Eigenbewegung und gewährt +2 Rüstungsklasse.', maximumTargets: 3, move: 8, armorClass: 2, conditionName: 'Jagd ohne Boden' }
  ] },
  { formId: F.bruellender, slug: 'bruellender', entries: [
    { level: 9, slug: 'panzerpfeil', name: 'Panzerpfeil', branch: 'longbow', description: 'Ein schwerer Pfeil wird mit maximaler Sehnenspannung gegen Panzerfugen geschossen.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 1, trifft aber mit −1.', attackBonus: -1, targetDefenseModifier: -1 },
    { level: 11, slug: 'brechender-doppelhieb', name: 'Brechender Doppelhieb', branch: 'dual', description: 'Beide Klingen schlagen gleichzeitig gegen dieselbe Verteidigung.', effect: 'Verursacht Technikschaden, trifft aber mit −1.', attackBonus: -1 },
    { level: 13, slug: 'donnersehne', name: 'Donnersehne', branch: 'longbow', description: 'Aura und Sehne entladen sich in einem hörbaren, panzerbrechenden Schuss.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 2.', targetDefenseModifier: -2 },
    { level: 16, slug: 'keilsalve', name: 'Keilsalve', branch: 'shortbow', description: 'Eine kurze Salve schlägt wie ein Keil in die feindliche Reihe.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden.', maximumTargets: 3 },
    { level: 18, slug: 'ruestungsnagel', name: 'Rüstungsnagel', branch: 'longbow', description: 'Der Meister setzt einen Pfeil so tief in die Wehr, dass jede weitere Bewegung schmerzt.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 3, trifft aber mit −1.', attackBonus: -1, targetDefenseModifier: -3 },
    { level: 20, slug: 'drachenballiste', name: 'Drachenballiste', branch: 'longbow', description: 'Bogen, Körper und Aura spannen sich wie eine einzige Belagerungsmaschine.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 3, trifft aber mit −1.', attackBonus: -1, targetDefenseModifier: -3 }
  ] },
  { formId: F.ausgeglichener, slug: 'ausgeglichener', entries: [
    { level: 9, slug: 'wechselwaffe', name: 'Wechselwaffe', branch: 'flexible', description: 'Die Form bleibt beim Wechsel zwischen Bogen und Klinge vollständig erhalten.', effect: 'Verursacht Technikschaden und gewährt +1 Rüstungsklasse.', armorClass: 1, conditionName: 'Ausgeglichene Waffenlage' },
    { level: 11, slug: 'bogen-und-klinge', name: 'Bogen und Klinge', branch: 'flexible', description: 'Fern- und Nahkampflinie werden als derselbe Bewegungsablauf geführt.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 2 Meter Eigenbewegung.', attackBonus: 1, move: 2 },
    { level: 13, slug: 'vierfache-jagd', name: 'Vierfache Jagd', branch: 'flexible', description: 'Langbogen, Kurzbogen, Doppelklinge und Schwert teilen dieselbe ruhige Zielarbeit.', effect: 'Verursacht Technikschaden; +1 Angriff und +1 Rüstungsklasse.', attackBonus: 1, armorClass: 1, conditionName: 'Vierfache Jagd' },
    { level: 16, slug: 'mittlere-distanz', name: 'Meisterschaft der mittleren Distanz', branch: 'flexible', description: 'Der Helwyr hält das Ziel genau zwischen Angriff und Gegenwehr.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 1.', targetDefenseModifier: -1 },
    { level: 18, slug: 'jagdmeisterkreis', name: 'Jagdmeisterkreis', branch: 'flexible', description: 'Drei Gegner werden mit der jeweils passenden Linie unter Druck gesetzt.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und gewährt +2 Rüstungsklasse.', maximumTargets: 3, armorClass: 2, conditionName: 'Jagdmeisterkreis' },
    { level: 20, slug: 'vollendete-vierfalt', name: 'Vollendete Vierfalt', branch: 'flexible', description: 'Der Meister kann jede seiner vier Waffenfolgen ohne Verlust der Form vollenden.', effect: 'Verursacht Technikschaden, erhält +2 Angriff, gewährt +2 Rüstungsklasse und erlaubt 4 Meter Eigenbewegung.', attackBonus: 2, armorClass: 2, move: 4, conditionName: 'Vollendete Vierfalt' }
  ] },
  { formId: F.zorniger, slug: 'zorniger', entries: [
    { level: 9, slug: 'hetzschuss', name: 'Hetzschuss', branch: 'shortbow', description: 'Pfeil folgt auf Pfeil, bevor der Schütze seinen Stand vollständig findet.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung; anschließend −1 Rüstungsklasse.', move: 3, armorClass: -1, conditionName: 'Offene Hetzstellung' },
    { level: 11, slug: 'zwillingszorn', name: 'Zwillingszorn', branch: 'dual', description: 'Beide Klingen schlagen ohne geordneten Wechsel auf das Ziel ein.', effect: 'Verursacht Technikschaden und erhält +1 Angriff; anschließend −1 Rüstungsklasse.', attackBonus: 1, armorClass: -1, conditionName: 'Offener Zwillingszorn' },
    { level: 13, slug: 'roter-pfeil', name: 'Roter Pfeil', branch: 'longbow', description: 'Aura und Zorn werden in einen einzigen harten Schuss gelegt.', effect: 'Verursacht Technikschaden und senkt die Zielverteidigung um 1; anschließend −1 Rüstungsklasse.', targetDefenseModifier: -1, armorClass: -1, conditionName: 'Offene Zorneshaltung' },
    { level: 16, slug: 'rasende-jagd', name: 'Rasende Jagd', branch: 'flexible', description: 'Der Helwyr jagt mehrere Ziele ohne festen Rhythmus durch das Feld.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden; anschließend −2 Rüstungsklasse.', maximumTargets: 3, armorClass: -2, conditionName: 'Rasende Jagd' },
    { level: 18, slug: 'schwarzer-federsturm', name: 'Schwarzer Federsturm', branch: 'shortbow', description: 'Ein dichter Pfeilsturm erzwingt Bewegung, bis die Deckung auseinanderfällt.', effect: 'Trifft bis zu vier Gegner mit je Technikschaden, senkt ihre Zielverteidigung um 1 und die eigene Rüstungsklasse um 2.', maximumTargets: 4, targetDefenseModifier: -1, armorClass: -2, conditionName: 'Ungedeckter Federsturm' },
    { level: 20, slug: 'letzte-jagd-des-zorndrachen', name: 'Letzte Jagd des Zorndrachen', branch: 'flexible', description: 'Der Meister entlädt Pfeile und Klingen in einer letzten ungebändigten Jagd.', effect: 'Trifft bis zu vier Gegner mit je Technikschaden, erhält +2 Angriff und verliert 3 Rüstungsklasse.', maximumTargets: 4, attackBonus: 2, armorClass: -3, conditionName: 'Letzte offene Jagd' }
  ] }
]);

export const HELWYR_EXPERT_TECHNIQUES = Object.freeze(PATHS.flatMap(path => path.entries.map(entry => helwyr(path.formId, path.slug, entry))));
