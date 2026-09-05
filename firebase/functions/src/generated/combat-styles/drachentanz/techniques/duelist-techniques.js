import { DRACHENTANZ_FORM_IDS } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import {
  createDrachentanzTechnique,
  movementEffect,
  secondarySave,
  temporaryCondition
} from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

const F = DRACHENTANZ_FORM_IDS.schwertdrache;
const CANTREF_UCHELWYR_WEAPONS = {
  cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'],
  uchelwyr: ['lance']
};

function duel(spec) {
  return createDrachentanzTechnique({ formId: F, slotBands: ['duelist'], tier: 'Duellantenform', ...spec });
}

export const TEULU_DUELIST_TECHNIQUES = Object.freeze([
  duel({
    slug: 'schwertdrache-kreisende-einladung', name: 'Kreisende Einladung', minimumLevel: 7,
    description: 'Eine offene Kreisbewegung bietet dem Gegner scheinbar das Handgelenk und schließt sich im Augenblick seines Angriffs.',
    effect: 'Reaktionsangriff mit Technikschaden und +1 Angriff.', activationType: 'reaction', costs: ['reaction'],
    attackBonus: 1, allowedClassIds: ['teulu'], classWeaponProfiles: { teulu: ['sword'] }, weaponTypes: ['sword']
  }),
  duel({
    slug: 'schwertdrache-schnitt-der-fuenf-finger', name: 'Schnitt der fünf Finger', minimumLevel: 7,
    description: 'Ein feiner Schnitt zielt auf Finger, Griff und Handgelenk statt auf die Rüstung.',
    effect: 'Verursacht Technikschaden. Misslingt ein Geschicklichkeitsrettungswurf, erhält das Ziel −2 Angriff bis zu seinem nächsten Beitrag.',
    costs: ['action', 'bonus-action'], secondarySave: secondarySave('schwertdrache-fuenf-finger', 'Verletzte Waffenhand', 'Die getroffene Waffenhand führt den nächsten Angriff unsicher.', { attack: -2 }, { attributeKey: 'dexterity' }),
    allowedClassIds: ['teulu'], classWeaponProfiles: { teulu: ['sword'] }, weaponTypes: ['sword']
  }),
  duel({
    slug: 'schwertdrache-spiegelparade', name: 'Spiegelparade', minimumLevel: 8,
    description: 'Die Klinge nimmt den gegnerischen Winkel auf, leitet ihn fort und kehrt auf derselben Linie zurück.',
    effect: 'Reaktionsangriff mit Technikschaden. Bis zum nächsten eigenen Beitrag steigt die Rüstungsklasse um 2.', activationType: 'reaction', costs: ['reaction', 'bonus-action'],
    effects: [temporaryCondition('schwertdrache-spiegel', 'Spiegelparade', 'Die Klinge bleibt in der Linie des gegnerischen Schwertes.', { armorClass: 2 }, { target: 'self', on: 'always' })],
    allowedClassIds: ['teulu'], classWeaponProfiles: { teulu: ['sword'] }, weaponTypes: ['sword']
  }),
  duel({
    slug: 'schwertdrache-krone-des-duellanten', name: 'Krone des Duellanten', minimumLevel: 8,
    description: 'Finte, Bindung und Endschnitt gehen ohne sichtbare Pause ineinander über.',
    effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'],
    targetDefenseModifier: -1, allowedClassIds: ['teulu'], classWeaponProfiles: { teulu: ['sword'] }, weaponTypes: ['sword']
  })
]);

export const CANTREF_DUELIST_TECHNIQUES = Object.freeze([
  duel({ slug: 'cantref-schwertdrache-kleine-spirale', name: 'Kleine Spirale', minimumLevel: 7,
    description: 'Die Spitze beschreibt einen engen Kreis um die gegnerische Waffe und sticht aus der Bindung.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', costs: ['action', 'bonus-action'], attackBonus: 1,
    allowedClassIds: ['cantref', 'uchelwyr'], classWeaponProfiles: CANTREF_UCHELWYR_WEAPONS, weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true, weaponTypes: ['spear', 'polearm'] }),
  duel({ slug: 'cantref-schwertdrache-schaftbrecher', name: 'Schaftbrecher', minimumLevel: 7,
    description: 'Ein Griffwechsel schlägt mit Schaft oder Parierstange gegen die führende Hand.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt dem Ziel −2 Angriff.', costs: ['action', 'reaction'], secondarySave: secondarySave('cantref-schaftbrecher', 'Erschütterter Griff', 'Der Griff an der Waffe ist bis zum nächsten Beitrag unsicher.', { attack: -2 }), allowedClassIds: ['cantref'], classWeaponProfiles: { cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'] }, weaponRuleSetId: 'cantref-polearm', weaponTypes: ['spear', 'polearm'] }),
  duel({ slug: 'cantref-schwertdrache-nadelwehr', name: 'Nadelwehr', minimumLevel: 8,
    description: 'Eine kaum sichtbare Parade lässt den gegnerischen Angriff an der Spitze abgleiten.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.', activationType: 'reaction', costs: ['reaction', 'bonus-action'], effects: [temporaryCondition('cantref-nadelwehr', 'Nadelwehr', 'Die Stangenwaffe kontrolliert die direkte Angriffslinie.', { armorClass: 2 }, { target: 'self', on: 'always' })], allowedClassIds: ['cantref'], classWeaponProfiles: { cantref: ['spear', 'lance', 'partisan', 'trident', 'halberd'] }, weaponRuleSetId: 'cantref-polearm', weaponTypes: ['spear', 'polearm'] }),
  duel({ slug: 'cantref-schwertdrache-duell-der-reichweiten', name: 'Duell der Reichweiten', minimumLevel: 8,
    description: 'Der Cantref wechselt zwischen kurzem und langem Griff, bis der Gegner keine sichere Distanz mehr findet.', effect: 'Verursacht Technikschaden und erlaubt 2 Meter Eigenbewegung.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], effects: [movementEffect('cantref-reichweiten', 2, 'move', 'self')], allowedClassIds: ['cantref', 'uchelwyr'], classWeaponProfiles: CANTREF_UCHELWYR_WEAPONS, weaponRuleSetId: 'cantref-polearm', uchelwyrCompatible: true, weaponTypes: ['spear', 'polearm'] })
]);

export const UCHELWYR_DUELIST_TECHNIQUES = Object.freeze([
  duel({ slug: 'uchelwyr-schwertdrache-hohe-bindung', name: 'Hohe Bindung', minimumLevel: 7,
    description: 'Die Waffe bindet den Gegner oberhalb der Schulter und lässt die freie Flanke für Ross oder Schild offen.', effect: 'Verursacht Technikschaden; bis zum nächsten Beitrag +1 Rüstungsklasse.', costs: ['action', 'reaction'], effects: [temporaryCondition('uchelwyr-hohe-bindung', 'Hohe Bindung', 'Der Gegner bleibt auf der kontrollierten Seite gebunden.', { armorClass: 1 }, { target: 'self', on: 'always' })], allowedClassIds: ['uchelwyr'], classWeaponProfiles: { uchelwyr: ['sword', 'lance'] }, weaponTypes: ['sword', 'spear'] }),
  duel({ slug: 'uchelwyr-schwertdrache-zaumzeugfinte', name: 'Zaumzeugfinte', minimumLevel: 7,
    description: 'Ein angedeuteter Rückzug lockt die gegnerische Waffe nach außen, bevor der Uchelwyr die Mitte nimmt.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 2 Meter Eigenbewegung.', costs: ['action', 'bonus-action'], attackBonus: 1,
    effects: [movementEffect('uchelwyr-zaumzeugfinte', 2, 'move', 'self')], allowedClassIds: ['uchelwyr'], classWeaponProfiles: { uchelwyr: ['sword', 'lance'] }, weaponTypes: ['sword', 'spear'] }),
  duel({ slug: 'uchelwyr-schwertdrache-ritterliche-antwort', name: 'Ritterliche Antwort', minimumLevel: 8,
    description: 'Nach einer Parade antwortet der Uchelwyr mit einem einzigen, formvollendeten Gegenstoß.', effect: 'Reaktionsangriff mit Technikschaden und +1 Angriff.', activationType: 'reaction', costs: ['reaction', 'bonus-action'], attackBonus: 1,
    allowedClassIds: ['uchelwyr'], classWeaponProfiles: { uchelwyr: ['sword', 'lance'] }, weaponTypes: ['sword', 'spear'] }),
  duel({ slug: 'uchelwyr-schwertdrache-hochgericht', name: 'Hochgericht', minimumLevel: 8,
    description: 'Der entscheidende Hieb fällt aus erhöhter Linie durch die letzte Parade.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], targetDefenseModifier: -1,
    allowedClassIds: ['uchelwyr'], classWeaponProfiles: { uchelwyr: ['sword', 'lance'] }, weaponTypes: ['sword', 'spear'] })
]);

export const ARTHWYR_DUELIST_TECHNIQUES = Object.freeze([
  duel({ slug: 'arthwyr-schwertdrache-eiserne-begruessung', name: 'Eiserne Begrüßung', minimumLevel: 7,
    description: 'Der Arthwyr beantwortet die elegante Eröffnung mit einem Schlag gegen Bindung und Körper zugleich.', effect: 'Verursacht Technikschaden, trifft aber mit −1.', costs: ['action', 'reaction'], attackBonus: -1,
    allowedClassIds: ['arthwyr'], classWeaponProfiles: { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] }, weaponTypes: ['sword', 'axe', 'mace'] }),
  duel({ slug: 'arthwyr-schwertdrache-griffbrecher', name: 'Griffbrecher', minimumLevel: 7,
    description: 'Die schwere Waffe schlägt gezielt gegen Griff, Parierstange oder Schildkante.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt −2 Angriff.', costs: ['action', 'bonus-action'], secondarySave: secondarySave('arthwyr-griffbrecher', 'Gebrochener Griff', 'Die Waffenführung bleibt bis zum nächsten Beitrag erschüttert.', { attack: -2 }), allowedClassIds: ['arthwyr'], classWeaponProfiles: { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] }, weaponTypes: ['sword', 'axe', 'mace'] }),
  duel({ slug: 'arthwyr-schwertdrache-mauerantwort', name: 'Mauerantwort', minimumLevel: 8,
    description: 'Der Arthwyr lässt die gegnerische Finte an seiner starken Haltung enden und schlägt aus der Bindung zurück.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten Beitrag +2 Rüstungsklasse.', activationType: 'reaction', costs: ['reaction', 'bonus-action'], effects: [temporaryCondition('arthwyr-mauerantwort', 'Mauerhaltung', 'Der Schwerpunkt bleibt hinter der Waffe geschlossen.', { armorClass: 2 }, { target: 'self', on: 'always' })], allowedClassIds: ['arthwyr'], classWeaponProfiles: { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] }, weaponTypes: ['sword', 'axe', 'mace'] }),
  duel({ slug: 'arthwyr-schwertdrache-ende-der-hoeflichkeit', name: 'Ende der Höflichkeit', minimumLevel: 8,
    description: 'Der Arthwyr beendet das Duell mit einem Angriff, der weder Raum noch Kraft für eine weitere Finte lässt.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger, trifft aber mit −1.', activationType: 'special-action', costs: ['action', 'bonus-action', 'special-action'], attackBonus: -1, targetDefenseModifier: -1,
    allowedClassIds: ['arthwyr'], classWeaponProfiles: { arthwyr: ['greatsword', 'axe', 'battleaxe', 'club', 'mace'] }, weaponTypes: ['sword', 'axe', 'mace'] })
]);

export const HELWYR_DUELIST_TECHNIQUES = Object.freeze([
  duel({ slug: 'helwyr-schwertdrache-duellschuss', name: 'Duellschuss', minimumLevel: 7,
    description: 'Ein einzelner Langbogenpfeil wird auf den Moment gesetzt, in dem der Gegner seine Deckung für den eigenen Angriff öffnet.', effect: 'Reaktionsschuss mit Technikschaden.', activationType: 'reaction', costs: ['reaction', 'bonus-action'], range: 'Fernkampf',
    allowedClassIds: ['helwyr'], classWeaponProfiles: { helwyr: ['longbow'] }, branchId: 'helwyr-longbow', weaponTypes: ['bow'] }),
  duel({ slug: 'helwyr-schwertdrache-flinker-doppelbogen', name: 'Flinker Doppelbogen', minimumLevel: 7,
    description: 'Zwei Kurzbogenpfeile erzwingen nacheinander dieselbe Parade.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', costs: ['action', 'bonus-action'], range: 'Fernkampf',
    effects: [movementEffect('helwyr-doppelbogen', 3, 'move', 'self')], allowedClassIds: ['helwyr'], classWeaponProfiles: { helwyr: ['shortbow'] }, branchId: 'helwyr-shortbow', weaponTypes: ['bow'] }),
  duel({ slug: 'helwyr-schwertdrache-scherenparade', name: 'Scherenparade', minimumLevel: 7,
    description: 'Beide Klingen kreuzen die gegnerische Waffe und öffnen mit einer gegenläufigen Bewegung den Konter.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten Beitrag +2 Rüstungsklasse.', activationType: 'reaction', costs: ['reaction'], effects: [temporaryCondition('helwyr-scherenparade', 'Gekreuzte Deckung', 'Die beiden Klingen fangen den nächsten Angriff gemeinsam ab.', { armorClass: 2 }, { target: 'self', on: 'always' })], allowedClassIds: ['helwyr'], classWeaponProfiles: { helwyr: ['dual-swords', 'dual-daggers'] }, branchId: 'helwyr-dual-blades', weaponTypes: ['sword', 'dagger'] }),
  duel({ slug: 'helwyr-schwertdrache-stiller-duellhieb', name: 'Stiller Duellhieb', minimumLevel: 7,
    description: 'Eine verkürzte Form-II-Linie für den seltenen Helwyr, der beim Schwert bleibt.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', costs: ['action', 'bonus-action'], attackBonus: 1,
    allowedClassIds: ['helwyr'], classWeaponProfiles: { helwyr: ['sword'] }, branchId: 'helwyr-classic-sword', weaponTypes: ['sword'] })
]);

export const BARDDWYR_SWORD_DUELIST_TECHNIQUES = Object.freeze([
  duel({ slug: 'barddwyr-schwertdrache-versmass', name: 'Versmaß der Klinge', minimumLevel: 7,
    description: 'Der Barddwyr ordnet eine verkürzte Duellfolge in zwei klare Takte.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', costs: ['action', 'bonus-action'], attackBonus: 1,
    allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['sword'] }, branchId: 'barddwyr-sword', weaponTypes: ['sword'] }),
  duel({ slug: 'barddwyr-schwertdrache-schlussreim', name: 'Schlussreim des Duells', minimumLevel: 8,
    description: 'Parade und Antwort bilden eine kurze, vollständige Strophe.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten Beitrag +1 Rüstungsklasse.', activationType: 'reaction', costs: ['reaction', 'bonus-action'], effects: [temporaryCondition('barddwyr-schlussreim', 'Geschlossener Reim', 'Die Schwertfolge endet in einer sicheren Schlussstellung.', { armorClass: 1 }, { target: 'self', on: 'always' })], allowedClassIds: ['barddwyr'], classWeaponProfiles: { barddwyr: ['sword'] }, branchId: 'barddwyr-sword', weaponTypes: ['sword'] })
]);

export const DUELIST_TECHNIQUES = Object.freeze([
  ...TEULU_DUELIST_TECHNIQUES,
  ...CANTREF_DUELIST_TECHNIQUES,
  ...UCHELWYR_DUELIST_TECHNIQUES,
  ...ARTHWYR_DUELIST_TECHNIQUES,
  ...HELWYR_DUELIST_TECHNIQUES,
  ...BARDDWYR_SWORD_DUELIST_TECHNIQUES
]);
