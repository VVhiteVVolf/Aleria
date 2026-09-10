import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260909-dragon-parent-v2';

const PROFILES = Object.freeze(['spear', 'lance', 'partisan', 'trident', 'halberd']);

function spear(formId, spec) {
  return createDrachentanzTechnique({
    formId,
    allowedClassIds: ['cantref', 'uchelwyr'],
    classWeaponProfiles: { cantref: PROFILES, uchelwyr: PROFILES },
    weaponTypes: ['spear', 'polearm'],
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: true,
    branchId: 'shared-spear-path',
    slotBands: ['expert'],
    maximumTargets: 1,
    singleTargetOnly: true,
    requirements: 'Ein geführter Speer oder eine Stangenwaffe; Eigenbewegung braucht einen freien Weg.',
    ...spec
  });
}

const guard = (slug, name, amount) => temporaryCondition(slug, name,
  amount < 0 ? 'Die offensive Speerlinie öffnet die Deckung bis zum nächsten eigenen Beitrag.' : 'Die geschlossene Speerlinie schützt bis zum nächsten eigenen Beitrag.',
  { armorClass: amount }, { type: amount < 0 ? 'debuff' : 'buff', target: 'self', on: 'always' });

// The sword form supplies the duelling principles; the distinct spear curriculum
// adds continuous, Albic-influenced movement without changing the common slot budget.
export const SPEERDRACHEN_TECHNIQUES = Object.freeze([
  spear(F.speerdrache, { slug: 'speerdrache-fliessende-eroeffnung', name: 'Fließende Eröffnung', minimumLevel: 9, costs: ['action', 'reaction'],
    description: 'Die Spitze übernimmt die klare Duelllinie des Schwertdrachen, während ein albischer Gleitschritt den Körper in stetiger Bewegung hält.',
    effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 2 Meter Eigenbewegung.', attackBonus: 1,
    effects: [movementEffect('speerdrache-eroeffnung', 2)] }),
  spear(F.speerdrache, { slug: 'speerdrache-gleitende-bindung', name: 'Gleitende Bindung', minimumLevel: 10, costs: ['reaction', 'special-action'],
    description: 'Der Schaft begleitet die gegnerische Waffe, statt ihren Schwung starr aufzuhalten.',
    effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.',
    effects: [guard('speerdrache-bindung', 'Gleitende Bindung', 1)] }),
  spear(F.speerdrache, { slug: 'speerdrache-rankenspitze', name: 'Rankenspitze', minimumLevel: 11, costs: ['action', 'special-action'],
    description: 'Eine kleine Spirale windet die Speerspitze an der Parade vorbei, ohne den Bewegungsfluss zu unterbrechen.',
    effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  spear(F.speerdrache, { slug: 'speerdrache-albischer-halbkreis', name: 'Albischer Halbkreis', minimumLevel: 12, costs: ['bonus-action', 'reaction', 'special-action'],
    description: 'Ein halbkreisförmiger Schritt hält die Spitze ständig auf dem einen Gegenüber.',
    effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 3 Meter Eigenbewegung.', attackBonus: 1,
    effects: [movementEffect('speerdrache-halbkreis', 3)] }),
  spear(F.speerdrache, { slug: 'speerdrache-steter-atem', name: 'Steter Atem', minimumLevel: 13, costs: ['action', 'reaction'],
    description: 'Gleichmäßiger Atem hält die Waffe ohne hastigen Abschluss im Takt der gegnerischen Bewegungen.',
    effect: 'Verursacht Technikschaden; bei misslungenem Weisheitsrettungswurf erhält das Ziel −1 Angriff.',
    secondarySave: secondarySave('speerdrache-atem', 'Gelesener Rhythmus', 'Die stetige Speerfolge hat den gegnerischen Takt erfasst.', { attack: -1 }, { attributeKey: 'wisdom' }) }),
  spear(F.speerdrache, { slug: 'speerdrache-gewundener-schaft', name: 'Gewundener Schaft', minimumLevel: 14, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Die Waffe dreht sich durch beide Hände und nimmt den gegnerischen Griff in einen fließenden Gegenlauf.',
    effect: 'Verursacht Technikschaden; bei misslungenem Stärkerettungswurf erhält das Ziel −2 Angriff.',
    secondarySave: secondarySave('speerdrache-schaft', 'Versetzter Griff', 'Der Gegenlauf des Schafts hat die gegnerische Waffenführung versetzt.', { attack: -2 }) }),
  spear(F.speerdrache, { slug: 'speerdrache-siebter-strom', name: 'Siebter Strom', minimumLevel: 15, costs: ['action', 'special-action'],
    description: 'Ein unscheinbarer siebter Wechsel führt die Spitze zwischen den abgewehrten Linien weiter.',
    effect: 'Verursacht Technikschaden, erhält +1 Angriff und behandelt die Zielverteidigung als 1 Punkt niedriger.', attackBonus: 1, targetDefenseModifier: -1 }),
  spear(F.speerdrache, { slug: 'speerdrache-uferwechsel', name: 'Uferwechsel', minimumLevel: 16, costs: ['reaction', 'bonus-action', 'special-action'],
    description: 'Ein gleitender Schritt wechselt die Seite des Duells, während Schaft und Spitze die offene Flanke decken.',
    effect: 'Reaktionsangriff mit Technikschaden, 3 Meter Eigenbewegung und +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    effects: [movementEffect('speerdrache-ufer', 3), guard('speerdrache-ufer', 'Gedeckter Uferwechsel', 2)] }),
  spear(F.speerdrache, { slug: 'speerdrache-aura-im-strom', name: 'Aura im Strom', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Aura folgt der ununterbrochenen Linie vom hinteren Fuß bis in die äußerste Spitze.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 2, criticalThreshold: 19 }),
  spear(F.speerdrache, { slug: 'speerdrache-ungebrochener-kreis', name: 'Ungebrochener Kreis', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Jede Parade kehrt als Stoß zurück und jeder Stoß führt ohne Halt in die nächste Deckung.',
    effect: 'Verursacht Technikschaden, erlaubt 4 Meter Eigenbewegung und gewährt +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    effects: [movementEffect('speerdrache-kreis', 4), guard('speerdrache-kreis', 'Ungebrochener Kreis', 2)] }),
  spear(F.speerdrache, { slug: 'speerdrache-ferne-linie', name: 'Ferne Linie', minimumLevel: 19, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Ein fast schwereloser Griffwechsel verkürzt die gegnerische Reaktionszeit auf die letzte offene Stoßlinie.',
    effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 2 Punkte niedriger.', attackBonus: 2, targetDefenseModifier: -2 }),
  spear(F.speerdrache, { slug: 'speerdrache-ewiger-reigen', name: 'Ewiger Reigen des Speerdrachen', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister verbindet Duellmaß und albischen Bewegungsfluss zu einer vollkommenen Folge gegen ein einziges Gegenüber.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger und erlaubt 4 Meter Eigenbewegung.',
    attackBonus: 3, targetDefenseModifier: -2, effects: [movementEffect('speerdrache-reigen', 4)] })
]);

export const SPEAR_SPECIALIST_TECHNIQUES = Object.freeze([
  spear(F.peitschender, { slug: 'peitschender-platzender-schaft', name: 'Platzender Schaftwechsel', minimumLevel: 9, costs: ['action', 'bonus-action'],
    description: 'Ein explosiver Handwechsel peitscht Spitze und Schaft gegen die führende Deckung.',
    effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger; bis zum nächsten eigenen Beitrag −1 Rüstungsklasse.', targetDefenseModifier: -1,
    effects: [guard('peitschender-schaft', 'Offene Stoßhaltung', -1)] }),
  spear(F.peitschender, { slug: 'peitschender-donnernder-vorgriff', name: 'Donnernder Vorgriff', minimumLevel: 12, costs: ['action', 'reaction'],
    description: 'Der weit vorgeschobene Griff presst einen harten Stoß durch die Waffenlinie.',
    effect: 'Verursacht Technikschaden; bei misslungenem Stärkerettungswurf erhält das Ziel −1 Rüstungsklasse.',
    secondarySave: secondarySave('peitschender-vorgriff', 'Aufgestoßene Wehr', 'Der explosive Stoß öffnet die gegnerische Deckung.', { armorClass: -1 }) }),
  spear(F.peitschender, { slug: 'peitschender-zerreissende-spitze', name: 'Zerreißende Spitze', minimumLevel: 15, costs: ['action', 'bonus-action', 'special-action'],
    description: 'Drei angedeutete Spitzenwechsel verdichten sich zu einem einzigen scharfen Ausbruch.',
    effect: 'Verursacht Technikschaden und erhält +2 Angriff; bis zum nächsten eigenen Beitrag −1 Rüstungsklasse.', attackBonus: 2,
    effects: [guard('peitschender-spitze', 'Entblößte Flanke', -1)] }),
  spear(F.huetender, { slug: 'huetender-ruhige-schwelle', name: 'Ruhige Schwelle', minimumLevel: 9, costs: ['reaction'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Eine sparsame Schaftparade schließt die bedrohte Linie, ohne Kraft in einen Gegenangriff zu investieren.',
    effect: 'Ohne Schadenswurf: bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.',
    effects: [guard('huetender-schwelle', 'Ruhige Schwelle', 2)] }),
  spear(F.huetender, { slug: 'huetender-ausdauernde-wehr', name: 'Ausdauernde Wehr', minimumLevel: 9, costs: ['reaction', 'bonus-action'],
    description: 'Ein kurzer Gegenstoß stellt die sichere Reichweite mit möglichst wenig Kraftaufwand wieder her.',
    effect: 'Reaktionsangriff mit Technikschaden und 2 Meter Eigenbewegung.', effects: [movementEffect('huetender-wehr', 2)] }),
  spear(F.huetender, { slug: 'huetender-schaftnest', name: 'Schaftnest', minimumLevel: 13, costs: ['reaction', 'bonus-action'],
    description: 'Kleine Schaftwinkel fangen die Waffe ab, ehe ein kurzer Stoß die Mitte wieder schließt.',
    effect: 'Verursacht Technikschaden und gewährt +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.', effects: [guard('huetender-nest', 'Schaftnest', 1)] }),
  spear(F.huetender, { slug: 'huetender-langer-wachgang', name: 'Langer Wachgang', minimumLevel: 17, costs: ['reaction', 'special-action'],
    description: 'Ein bewusst kleiner Konter erhält die Deckung auch dann, wenn ein hastiger Ausbruch längst Kraft verschlungen hätte.',
    effect: 'Verursacht Technikschaden und gewährt +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.', effects: [guard('huetender-wachgang', 'Langer Wachgang', 2)] }),
  spear(F.huetender, { slug: 'huetender-letzte-schwelle', name: 'Letzte Schwelle des hütenden Drachen', minimumLevel: 20,
    costs: ['reaction', 'bonus-action', { resourceId: 'special-action', amount: 2 }, 'aura-focus'],
    description: 'Der Meister hütet den letzten sicheren Schritt mit engstem Griff und einem einzigen zwingenden Gegenstoß.',
    effect: 'Verursacht Technikschaden; bei misslungenem Stärkerettungswurf erhält das Ziel −2 Angriff. Bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.',
    secondarySave: secondarySave('huetender-schwelle', 'Gebundener Angriff', 'Die enge Gegenwehr verhindert einen freien Folgeangriff.', { attack: -2 }),
    effects: [guard('huetender-letzte', 'Letzte Schwelle', 2)] })
]);
