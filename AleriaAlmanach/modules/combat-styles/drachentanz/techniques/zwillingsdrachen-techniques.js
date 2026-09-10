import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260909-dragon-parent-v2';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260909-dragon-parent-v2';

const CLASS_IDS = Object.freeze(['teulu', 'helwyr', 'arthwyr']);
const CLASS_WEAPONS = Object.freeze(Object.fromEntries(CLASS_IDS.map(id => [id, ['dual-swords', 'dual-daggers']])));

function twin(spec) {
  return createDrachentanzTechnique({
    formId: F.zwillingsdrache,
    slotBands: ['expert'],
    tier: spec.minimumLevel >= 17 ? 'Meistertechnik des Zwillingsdrachen' : 'Zwillingspfad',
    allowedClassIds: CLASS_IDS,
    classWeaponProfiles: CLASS_WEAPONS,
    weaponTypes: ['sword', 'dagger'],
    branchId: 'drachentanz-dual-blades',
    requiresDualWield: true,
    maximumTargets: 1,
    target: 'Ein Gegner',
    requirements: 'Zwei gleichzeitig geführte Schwerter oder Dolche; beide Hände müssen belegt sein.',
    tags: ['Beidhändig', 'Zwei Klingen'],
    ...spec
  });
}

export const ZWILLINGSDRACHEN_TECHNIQUES = Object.freeze([
  twin({ slug: 'zwillingsdrache-erste-und-zweite-klaue', name: 'Erste und zweite Klaue', minimumLevel: 9, costs: ['action', 'bonus-action'],
    description: 'Die rechte Klinge öffnet die Deckung, die linke beendet denselben Angriff.', effect: 'Verursacht Technikschaden und erhält +1 Angriff.', attackBonus: 1 }),
  twin({ slug: 'zwillingsdrache-gekreuzte-wacht', name: 'Gekreuzte Wacht', minimumLevel: 10, costs: ['reaction', 'special-action'], activationType: 'reaction',
    description: 'Beide Klingen fangen die gegnerische Waffe und lösen sich als Gegenhieb.', effect: 'Reaktionsangriff mit Technikschaden; bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.',
    effects: [temporaryCondition('zwillingsdrache-wacht', 'Gekreuzte Wacht', 'Zwei Klingen schließen die unmittelbare Angriffslinie.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  twin({ slug: 'zwillingsdrache-scherenschritt', name: 'Scherenschritt', minimumLevel: 11, costs: ['bonus-action', 'reaction', 'special-action'],
    description: 'Gegenläufige Klingen begleiten einen schnellen Schritt durch die Flanke.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.',
    effects: [movementEffect('zwillingsdrache-scherenschritt', 3, 'move', 'self')] }),
  twin({ slug: 'zwillingsdrache-wechselbiss', name: 'Wechselbiss', minimumLevel: 12, costs: ['action', 'reaction'],
    description: 'Jede Parade gegen eine Klinge öffnet die Linie für die andere.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  twin({ slug: 'zwillingsdrache-zweifacher-haken', name: 'Zweifacher Haken', minimumLevel: 13, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Eine Klinge bindet Griff oder Schaft, während die andere gegen die Waffenhand schlägt.', effect: 'Verursacht Technikschaden; ein misslungener Stärkerettungswurf gibt dem Ziel −2 Angriff bis zum Ende seines nächsten Beitrags.',
    secondarySave: secondarySave('zwillingsdrache-haken', 'Zweifach gebundener Griff', 'Die Waffenhand muss sich aus zwei gegenläufigen Bindungen lösen.', { attack: -2 }) }),
  twin({ slug: 'zwillingsdrache-spiegelklauen', name: 'Spiegelklauen', minimumLevel: 14, costs: ['action', 'special-action'],
    description: 'Beide Klingen führen denselben Winkel spiegelverkehrt und treffen die Deckung zugleich.', effect: 'Verursacht Technikschaden und erhält +1 Angriff; bis zum nächsten eigenen Beitrag +1 Rüstungsklasse.', attackBonus: 1,
    effects: [temporaryCondition('zwillingsdrache-spiegelklauen', 'Spiegelklauen', 'Die symmetrische Endstellung deckt beide Körperseiten.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  twin({ slug: 'zwillingsdrache-kreislauf-der-vier-schneiden', name: 'Kreislauf der vier Schneiden', minimumLevel: 15, costs: ['action', 'bonus-action', 'special-action'],
    description: 'Vier Schnittlinien entstehen aus nur zwei Klingen und einem geschlossenen Schritt.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 3 Meter Eigenbewegung.', attackBonus: 1,
    effects: [movementEffect('zwillingsdrache-vier-schneiden', 3, 'move', 'self')] }),
  twin({ slug: 'zwillingsdrache-stiller-klingenwechsel', name: 'Stiller Klingenwechsel', minimumLevel: 16, costs: ['reaction', 'bonus-action', 'special-action'], activationType: 'reaction',
    description: 'Die führende und die deckende Hand tauschen ihre Aufgabe, ohne die Haltung zu öffnen.', effect: 'Reaktionsangriff mit Technikschaden, +2 Angriff und +1 Rüstungsklasse bis zum nächsten eigenen Beitrag.', attackBonus: 2,
    effects: [temporaryCondition('zwillingsdrache-klingenwechsel', 'Stiller Klingenwechsel', 'Die zweite Klinge übernimmt die offene Linie.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  twin({ slug: 'zwillingsdrache-aura-zwischen-den-klauen', name: 'Aura zwischen den Klauen', minimumLevel: 17, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Aura spannt sich zwischen beiden Klingen und schließt sich im Treffer.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und behandelt die Zielverteidigung als 1 Punkt niedriger.', attackBonus: 2, targetDefenseModifier: -1 }),
  twin({ slug: 'zwillingsdrache-doppelte-antwort', name: 'Doppelte Antwort', minimumLevel: 18, costs: ['action', 'bonus-action', 'reaction'],
    description: 'Die erste Klinge beantwortet die gegnerische Waffe, die zweite den dadurch geöffneten Körper.', effect: 'Verursacht Technikschaden; bis zum nächsten eigenen Beitrag +2 Rüstungsklasse.',
    effects: [temporaryCondition('zwillingsdrache-doppelte-antwort', 'Doppelte Antwort', 'Angriff und Deckung bleiben auf beide Hände verteilt.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  twin({ slug: 'zwillingsdrache-herzschlagpaar', name: 'Herzschlagpaar', minimumLevel: 19, costs: ['action', 'reaction', 'special-action', 'aura-focus'],
    description: 'Zwei Klingen fallen in zwei unmittelbar aufeinanderfolgende Herzschläge.', effect: 'Verursacht Technikschaden, erhält +2 Angriff und ist bei natürlicher 19–20 kritisch.', attackBonus: 2, criticalThreshold: 19 }),
  twin({ slug: 'zwillingsdrache-ein-drache-zwei-klingen', name: 'Ein Drache, zwei Klingen', minimumLevel: 20,
    costs: ['action', 'bonus-action', 'reaction', { resourceId: 'special-action', amount: 2 }, { resourceId: 'aura-focus', amount: 2 }],
    description: 'Der Meister führt beide Waffen als zwei Seiten derselben vollkommenen Form.',
    effect: 'Verursacht Technikschaden, erhält +3 Angriff, behandelt die Zielverteidigung als 2 Punkte niedriger und gewährt +2 Rüstungsklasse bis zum nächsten eigenen Beitrag.',
    attackBonus: 3, targetDefenseModifier: -2,
    effects: [temporaryCondition('zwillingsdrache-vollendung', 'Vollendeter Zwillingsdrache', 'Beide Klingen schließen Angriff und Schutz zugleich.', { armorClass: 2 }, { target: 'self', on: 'always' })] })
]);
