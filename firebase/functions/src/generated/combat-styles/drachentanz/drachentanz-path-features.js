import { DRACHENTANZ_FORM_IDS as F } from './drachentanz-ids.js?v=20260908-cenyr-paths-v1';

function feature(id, name, minimumLevel, description, mechanics = {}) {
  return Object.freeze({ id, name, minimumLevel, description, mechanics: Object.freeze({ ...mechanics }) });
}

const FEATURES = Object.freeze({
  [F.schwertdrache]: Object.freeze([
    feature('schwertdrache-ehrenzweikampf', 'Ehrenzweikampf', 9,
      'Solange im erklärten Kampf genau ein feindlicher Gegner steht, erhalten Angriffe dieses Pfades +2 auf den Trefferwurf. Der Bonus endet sofort, sobald eine weitere feindliche Figur am Kampf teilnimmt.',
      { attackBonus: 2, maximumHostileOpponents: 1 }),
    feature('schwertdrache-klingenbindung', 'Klingenbindung', 15,
      'Im Ehrenzweikampf behandelt der erste Treffer dieses Pfades pro eigenem Beitrag die Zielverteidigung als 1 Punkt niedriger.',
      { targetDefenseModifier: -1, maximumHostileOpponents: 1 }),
    feature('schwertdrache-vollendetes-duell', 'Vollendetes Duell', 20,
      'Im Ehrenzweikampf steigt der Trefferbonus auf +3 und ersetzt den bisherigen Bonus.',
      { attackBonus: 3, maximumHostileOpponents: 1 })
  ]),
  [F.abwartender]: Object.freeze([
    feature('abwartender-feste-schuppe', 'Feste Schuppe', 9,
      'Nach einer Technik dieses Pfades erhält der Anwender bis zum Beginn seines nächsten Beitrags +1 Rüstungsklasse; erneute Anwendung verlängert nur die Dauer.',
      { afterTechniqueArmorClass: 1 }),
    feature('abwartender-langer-atem', 'Langer Atem', 15,
      'Feste Schuppe gewährt +2 statt +1 Rüstungsklasse. Der Pfad belohnt Geduld und erzeugt keine zusätzliche Handlung.',
      { afterTechniqueArmorClass: 2 }),
    feature('abwartender-unbewegte-mitte', 'Unbewegte Mitte', 20,
      'Feste Schuppe gewährt +3 statt +2 Rüstungsklasse. Der Bonus bleibt bis zum Beginn des nächsten eigenen Beitrags bestehen und ersetzt die niedrigeren Stufen.',
      { afterTechniqueArmorClass: 3 })
  ]),
  [F.fliegender]: Object.freeze([
    feature('fliegender-explosiver-antritt', 'Explosiver Antritt', 9,
      'Angriffe dieses Pfades erhalten +1 auf den Trefferwurf, öffnen die Haltung jedoch bis zum nächsten eigenen Beitrag um 1 Rüstungsklasse.',
      { attackBonus: 1, afterTechniqueArmorClass: -1 }),
    feature('fliegender-windbruch', 'Windbruch', 15,
      'Die erste in einer Technik genannte Eigenbewegung pro Beitrag darf 2 Meter weiter führen; sie bleibt Teil derselben Handlung.',
      { movementBonus: 2 }),
    feature('fliegender-himmelssturm', 'Himmelssturm', 20,
      'Der Trefferbonus steigt auf +2, der Rüstungsklassenmalus bleibt −1. Der höhere Bonus ersetzt den niedrigeren.',
      { attackBonus: 2, afterTechniqueArmorClass: -1 })
  ]),
  [F.bruellender]: Object.freeze([
    feature('bruellender-wucht', 'Wucht des Brüllens', 9,
      'Angriffe dieses Pfades treffen mit −1, verursachen bei einem Treffer aber +2 Schaden. Schildtechniken dieses Pfades sind von dem Treffermalus ausgenommen.',
      { attackBonus: -1, damageBonus: 2, shieldIgnoresAttackPenalty: true }),
    feature('bruellender-drachenleib', 'Leib des Brülldrachen', 15,
      'Der Schadensbonus steigt auf +3 und ersetzt +2. Rettungswürfe der Techniken bleiben unverändert.',
      { attackBonus: -1, damageBonus: 3, shieldIgnoresAttackPenalty: true }),
    feature('bruellender-weltenspalter', 'Weltenspalter', 20,
      'Der Schadensbonus steigt auf +4. Der Stil bleibt langsam und erhält weiterhin keinen zusätzlichen Angriff.',
      { attackBonus: -1, damageBonus: 4, shieldIgnoresAttackPenalty: true })
  ]),
  [F.ausgeglichener]: Object.freeze([
    feature('ausgeglichener-offene-mitte', 'Offene Mitte', 9,
      'Techniken dieses Pfades erhalten +1 auf den Trefferwurf. Der verlässliche Bonus verkörpert die sichere Mitte zwischen Druck und Deckung.',
      { attackBonus: 1 }),
    feature('ausgeglichener-vier-antworten', 'Vier Antworten', 15,
      'Techniken dieses Pfades verursachen zusätzlich +1 Schaden. Der Trefferbonus der Offenen Mitte bleibt bestehen.',
      { damageBonus: 1 }),
    feature('ausgeglichener-vollendete-mitte', 'Vollendete Mitte', 20,
      'Nach einer Technik dieses Pfades erhält der Anwender bis zum Beginn seines nächsten Beitrags +1 Rüstungsklasse. Der Pfad gewährt weiterhin keine zusätzliche Handlung.',
      { afterTechniqueArmorClass: 1 })
  ]),
  [F.aufsteigender]: Object.freeze([
    feature('aufsteigender-verdeckte-klaue', 'Verdeckte Klaue', 9,
      'Angriffe dieses Unterpfades sind bei einer natürlichen 19 oder 20 kritisch. Der Aufsteigende Drache setzt den gewählten Fliegenden Drachen voraus.',
      { criticalThreshold: 19 }),
    feature('aufsteigender-schattenflug', 'Schattenflug', 15,
      'Nach einer Technik dieses Pfades erhält der Anwender +2 auf die nächste manuell ausgewertete Akrobatik- oder Verbergenprobe vor seinem nächsten Beitrag.',
      { skillBonus: 2, skillIds: ['acrobatics', 'stealth'] }),
    feature('aufsteigender-unsichtbarer-gipfel', 'Unsichtbarer Gipfel', 20,
      'Angriffe dieses Pfades sind bei einer natürlichen 18–20 kritisch. Dieser Wert ersetzt den bisherigen Kritbereich.',
      { criticalThreshold: 18 })
  ]),
  [F.zwillingsdrache]: Object.freeze([
    feature('zwillingsdrache-wechselnde-klaue', 'Wechselnde Klaue', 9,
      'Mit zwei geführten Klingen erhält der erste Angriff dieses Pfades pro Beitrag +1 auf den Trefferwurf. Die zweite Waffe fügt keinen eigenen Waffenwürfel hinzu.',
      { attackBonus: 1, requiresDualWield: true }),
    feature('zwillingsdrache-gegenlauf', 'Gegenlauf', 15,
      'Nach einer Technik dieses Pfades gewährt die gekreuzte Deckung +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
      { afterTechniqueArmorClass: 1, requiresDualWield: true }),
    feature('zwillingsdrache-zwei-herzen', 'Zwei Herzen, ein Takt', 20,
      'Der Trefferbonus steigt auf +2 und ersetzt +1. Zusätzliche Angriffe oder Ressourcen entstehen dadurch nicht.',
      { attackBonus: 2, requiresDualWield: true })
  ]),
  [F.satteldrache]: Object.freeze([
    feature('satteldrache-hoher-sitz', 'Hoher Sitz', 9,
      'Berittene Techniken dieses Pfades erhalten +1 auf den Trefferwurf; abgesessen ist der Pfad nicht einsetzbar.',
      { attackBonus: 1, requiresMounted: true }),
    feature('satteldrache-eins-mit-dem-ross', 'Eins mit dem Ross', 15,
      'Die erste Eigenbewegung einer Technik dieses Pfades darf 2 Meter weiter führen.',
      { movementBonus: 2, requiresMounted: true }),
    feature('satteldrache-hochkoeniglicher-anritt', 'Hochköniglicher Anritt', 20,
      'Der Trefferbonus steigt auf +2 und ersetzt +1; er gilt weiterhin ausschließlich beritten.',
      { attackBonus: 2, requiresMounted: true })
  ]),
  [F.lanzendrache]: Object.freeze([
    feature('lanzendrache-gesetzte-spitze', 'Gesetzte Spitze', 9,
      'Lanzentechniken dieses Pfades behandeln die Zielverteidigung als 1 Punkt niedriger. Dies ersetzt denselben Bonus der gewöhnlichen Lanzenregel.',
      { weaponRuleTargetDefenseModifier: -1, requiresWeaponProfileId: 'lance' }),
    feature('lanzendrache-durchgehende-linie', 'Durchgehende Linie', 15,
      'Nach mindestens 3 Metern geradem Anlauf verursachen Techniken dieses Pfades +2 Schaden; der Anlauf wird erzählerisch und durch die Szene geprüft.',
      { damageBonus: 2, requiresWeaponProfileId: 'lance', requiresCharge: true }),
    feature('lanzendrache-koenigsspitze', 'Königsspitze', 20,
      'Der Anlaufbonus steigt auf +4 Schaden und ersetzt +2.',
      { damageBonus: 4, requiresWeaponProfileId: 'lance', requiresCharge: true })
  ]),
  [F.bogendrache]: Object.freeze([
    feature('bogendrache-ruhige-sehne', 'Ruhige Sehne', 9,
      'Bogenangriffe dieses Pfades ignorieren 1 Punkt Zielverteidigung. Der allgemeine Fernkampfbonus des Helwyr wird weiterhin nur einmal addiert.',
      { targetDefenseModifier: -1, requiresRangedWeapon: true }),
    feature('bogendrache-jagdschritt', 'Jagdschritt', 15,
      'Die erste in einer Bogenattacke genannte Eigenbewegung pro Beitrag darf 2 Meter weiter führen.',
      { movementBonus: 2, requiresRangedWeapon: true }),
    feature('bogendrache-fernes-auge', 'Fernes Auge', 20,
      'Techniken dieses Pfades sind bei einer natürlichen 19 oder 20 kritisch.',
      { criticalThreshold: 19, requiresRangedWeapon: true })
  ]),
  [F.drachling]: Object.freeze([
    feature('drachling-rauer-griff', 'Rauer Griff', 6,
      'Techniken des Drachlings verursachen +1 Schaden; der direkte Stil erzeugt dadurch keine zusätzliche Handlung.',
      { damageBonus: 1 }),
    feature('drachling-gebrauchter-trick', 'Gebrauchter Trick', 10,
      'Der erste Stellungswechsel einer Drachling-Technik pro Beitrag darf 1 Meter weiter führen.',
      { movementBonus: 1 }),
    feature('drachling-alter-hase', 'Alter Hase', 15,
      'Der Schadensbonus steigt auf +2 und ersetzt +1. Danach endet die festgelegte Drachling-Ausbildung.',
      { damageBonus: 2 })
  ]),
  [F.kreischender]: Object.freeze([
    feature('kreischender-scharfer-takt', 'Scharfer Takt', 9,
      'Rapiertechniken dieses Pfades sind bei einer natürlichen 19 oder 20 kritisch.',
      { criticalThreshold: 19, requiresWeaponProfileId: 'rapier' }),
    feature('kreischender-atemloser-schritt', 'Atemloser Schritt', 15,
      'Die erste Eigenbewegung einer Technik dieses Pfades pro Beitrag darf 2 Meter weiter führen.',
      { movementBonus: 2, requiresWeaponProfileId: 'rapier' }),
    feature('kreischender-glasspitze', 'Glasspitze', 20,
      'Rapiertechniken dieses Pfades sind bei einer natürlichen 18–20 kritisch. Einzelne Meisterattacken können einen noch besseren Kritbereich besitzen.',
      { criticalThreshold: 18, requiresWeaponProfileId: 'rapier' })
  ])
});

export function getDrachentanzPathFeatures(formId) {
  return structuredClone(FEATURES[formId] || []);
}

export const drachentanzPathFeatureInternals = Object.freeze({ FEATURES });
