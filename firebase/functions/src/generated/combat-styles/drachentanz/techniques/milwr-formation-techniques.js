import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js';

const profiles = ['sword', 'spear', 'axe', 'battleaxe', 'club', 'mace'];
const guard = (id, name, armorClass) => temporaryCondition(id, name, '+1 RK bis zum Ende des nächsten eigenen Beitrags.',
  { armorClass }, { target: 'self', on: 'always' });
function formation(formId, spec) {
  return createDrachentanzTechnique({ formId, allowedClassIds: ['milwr'], classWeaponProfiles: { milwr: profiles },
    weaponTypes: ['sword', 'spear', 'axe', 'mace'], branchId: 'milwr-formation',
    slotBands: [formId === F.jungdrache ? 'foundation' : 'drachling'], ...spec });
}
const foundation = spec => formation(F.jungdrache, spec);
const veteran = spec => formation(F.drachling, spec);

// More choices for each field weapon; this does not add earned slots or extend
// the militia's final training level beyond 15.
export const MILWR_FORMATION_TECHNIQUES = Object.freeze([
  foundation({ slug: 'milwr-grund-geschlossene-feldwacht', name: 'Geschlossene Feldwacht', minimumLevel: 1,
    costs: ['reaction'], noPrimaryDamage: true, target: 'Selbst', description: 'Die Waffe deckt die Mitte der eigenen Reihe.',
    effect: 'Kein Angriff; +1 RK bis zum Ende des nächsten eigenen Beitrags.', effects: [guard('milwr-feldwacht', 'Geschlossene Feldwacht', 1)] }),
  foundation({ slug: 'milwr-grund-speersaum', name: 'Speersaum', minimumLevel: 2, costs: ['action', 'reaction'],
    classWeaponProfiles: { milwr: ['spear'] }, weaponTypes: ['spear'],
    description: 'Der Speer hält den Gegner mit einem geraden Stich auf Abstand.', effect: 'Technikschaden; nach Treffer bis zu 1 m Eigenbewegung im verfügbaren Bewegungsbudget.',
    effects: [movementEffect('milwr-speersaum', 1)] }),
  foundation({ slug: 'milwr-grund-axtrand', name: 'Hieb am Axtrand', minimumLevel: 3, costs: ['action'],
    classWeaponProfiles: { milwr: ['axe', 'battleaxe'] }, weaponTypes: ['axe'], description: 'Ein kurzer Axthieb trifft die offene Seite der Deckung.',
    effect: 'Technikschaden; die Zielverteidigung zählt für diesen Angriff 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  foundation({ slug: 'milwr-grund-kolbenantwort', name: 'Kolbenantwort', minimumLevel: 3, costs: ['reaction'],
    classWeaponProfiles: { milwr: ['club', 'mace'] }, weaponTypes: ['mace'],
    description: 'Der Kolben beantwortet den gegnerischen Vorstoß auf kurzer Linie.', effect: 'Reaktionsangriff mit Technikschaden.' }),
  foundation({ slug: 'milwr-grund-schwertgasse', name: 'Schwertgasse', minimumLevel: 4, costs: ['action', 'bonus-action'],
    classWeaponProfiles: { milwr: ['sword'] }, weaponTypes: ['sword'],
    description: 'Der Milwr schließt die offene Seite mit einer verkürzten Schwertfolge.', effect: 'Technikschaden und +1 RK bis zum Ende des nächsten eigenen Beitrags.',
    effects: [guard('milwr-schwertgasse', 'Schwertgasse', 1)] }),
  foundation({ slug: 'milwr-grund-ordnungsschritt', name: 'Ordnungsschritt', minimumLevel: 4,
    costs: ['bonus-action'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Ein kleiner Stellungswechsel stellt die eigene Waffenlinie wieder her.',
    effect: 'Kein Angriff; bis zu 2 m Eigenbewegung im verfügbaren Bewegungsbudget. Keine automatische Loslösung.',
    effects: [{ ...movementEffect('milwr-ordnung', 2), on: 'always' }] }),
  foundation({ slug: 'milwr-grund-schaftbremse', name: 'Schaftbremse', minimumLevel: 5, costs: ['action', 'reaction'],
    classWeaponProfiles: { milwr: ['spear'] }, weaponTypes: ['spear'],
    description: 'Der Schaft stört den gegnerischen Schritt, bevor die Spitze nachsetzt.',
    effect: 'Technikschaden; nach Treffer KRF-Rettung, bei Scheitern −2 m Bewegung bis zum Ende des nächsten eigenen Beitrags.',
    secondarySave: secondarySave('milwr-schaftbremse', 'Gebremster Schritt', 'Der Schaft verkürzt den nächsten Stellungswechsel.', { movement: -2 }) }),
  foundation({ slug: 'milwr-grund-schulterwacht', name: 'Schulterwacht', minimumLevel: 6,
    costs: ['reaction', 'bonus-action'], noPrimaryDamage: true, requiresShield: true, target: 'Selbst',
    description: 'Ein tatsächlich geführter Schild deckt die eigene Schulter.',
    effect: 'Kein Angriff; mit geführtem Schild +2 RK bis zum Ende des nächsten eigenen Beitrags.',
    effects: [temporaryCondition('milwr-schulterwacht', 'Schulterwacht', '+2 RK bis zum Ende des nächsten eigenen Beitrags.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  veteran({ slug: 'drachling-speertor', name: 'Speertor', minimumLevel: 6, costs: ['reaction'],
    classWeaponProfiles: { milwr: ['spear'] }, weaponTypes: ['spear'], description: 'Eine kurze Speerantwort hütet die eigene Waffenreichweite.',
    effect: 'Reaktionsangriff mit Technikschaden.' }),
  veteran({ slug: 'drachling-axtwechsel', name: 'Axtwechsel', minimumLevel: 7, costs: ['action', 'bonus-action'],
    classWeaponProfiles: { milwr: ['axe', 'battleaxe'] }, weaponTypes: ['axe'],
    description: 'Die Axt wechselt unter der gegnerischen Bindung auf die freie Seite.',
    effect: 'Technikschaden; die Zielverteidigung zählt für diesen Angriff 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  veteran({ slug: 'drachling-kolbenriegel', name: 'Kolbenriegel', minimumLevel: 8, costs: ['action', 'reaction'],
    classWeaponProfiles: { milwr: ['club', 'mace'] }, weaponTypes: ['mace'],
    description: 'Der Kolben trifft den Griff statt die stärkste Rüstungsplatte.',
    effect: 'Technikschaden; nach Treffer KRF-Rettung, bei Scheitern −1 Angriff bis zum Ende des nächsten eigenen Beitrags.',
    secondarySave: secondarySave('drachling-kolbenriegel', 'Unsicherer Griff', '−1 Angriff bis zum Ende des nächsten eigenen Beitrags.', { attack: -1 }) }),
  veteran({ slug: 'drachling-schwertantwort', name: 'Schwertantwort der Reihe', minimumLevel: 9, costs: ['reaction', 'bonus-action'],
    classWeaponProfiles: { milwr: ['sword'] }, weaponTypes: ['sword'], description: 'Ein knapper Schwertkonter kehrt sofort in die eigene Deckung zurück.',
    effect: 'Reaktionsangriff mit Technikschaden und +1 RK bis zum Ende des nächsten eigenen Beitrags.', effects: [guard('drachling-schwertantwort', 'Schwertantwort', 1)] }),
  veteran({ slug: 'drachling-felddeckung', name: 'Felddeckung des Veteranen', minimumLevel: 10,
    costs: ['reaction', 'bonus-action'], noPrimaryDamage: true, target: 'Selbst',
    description: 'Der Veteran hält den Stand hinter seiner geführten Waffe geschlossen.',
    effect: 'Kein Angriff; +2 RK bis zum Ende des nächsten eigenen Beitrags.',
    effects: [temporaryCondition('drachling-felddeckung', 'Felddeckung', '+2 RK bis zum Ende des nächsten eigenen Beitrags.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  veteran({ slug: 'drachling-langer-speerschritt', name: 'Langer Speerschritt', minimumLevel: 12, costs: ['action', 'special-action'],
    classWeaponProfiles: { milwr: ['spear'] }, weaponTypes: ['spear'], description: 'Ein gerader Stich trägt den Veteranen in die nächste sichere Stellung.',
    effect: 'Technikschaden und nach Treffer bis zu 3 m Eigenbewegung im verfügbaren Bewegungsbudget.', effects: [movementEffect('drachling-speerschritt', 3)] }),
  veteran({ slug: 'drachling-entschlossener-feldhieb', name: 'Entschlossener Feldhieb', minimumLevel: 15,
    costs: ['action', 'bonus-action', 'reaction', 'special-action'], classWeaponProfiles: { milwr: ['axe', 'battleaxe', 'club', 'mace'] }, weaponTypes: ['axe', 'mace'],
    description: 'Der Veteran bündelt seine Felderfahrung in einen einzelnen schweren Hieb.',
    effect: 'Technikschaden mit +1 Angriff; keine zusätzliche Attacke.', attackBonus: 1 })
]);
