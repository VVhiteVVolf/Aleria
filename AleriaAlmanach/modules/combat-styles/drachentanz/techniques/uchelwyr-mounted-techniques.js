import { DRACHENTANZ_FORM_IDS as F } from '../drachentanz-ids.js?v=20260905-cenyr-character-training-v1';
import { createDrachentanzTechnique, movementEffect, secondarySave, temporaryCondition } from './drachentanz-technique-factory.js?v=20260905-damage-balance-v1';

function mounted(formId, spec) {
  return createDrachentanzTechnique({
    formId,
    slug: `uchelwyr-beritten-${spec.slug}`,
    tier: spec.minimumLevel >= 15 ? 'Berittene Meisteroption' : 'Berittene Formoption',
    allowedClassIds: ['uchelwyr'],
    classWeaponProfiles: { uchelwyr: ['sword', 'lance'] },
    weaponTypes: ['sword', 'spear'],
    branchId: 'uchelwyr-mounted',
    requiresMounted: true,
    weaponRuleSetId: 'cantref-polearm',
    uchelwyrCompatible: true,
    ...spec
  });
}

export const UCHELWYR_MOUNTED_TECHNIQUES = Object.freeze([
  mounted(F.jungdrache, { slug: 'sattelantritt', name: 'Sattelantritt', minimumLevel: 2, slotBands: ['foundation'], costs: ['action'],
    description: 'Der erste gelehrte Angriff aus dem Sattel verbindet einen geraden Anritt mit sicherem Zügelmaß.', effect: 'Verursacht Technikschaden und erlaubt 3 Meter Eigenbewegung.', effects: [movementEffect('uchelwyr-sattelantritt', 3, 'move', 'self')] }),
  mounted(F.jungdrache, { slug: 'niedrige-lanzenbahn', name: 'Niedrige Lanzenbahn', minimumLevel: 5, slotBands: ['foundation'], costs: ['action', 'bonus-action', 'reaction'],
    description: 'Waffe und Ross passieren die gegnerische Flanke auf einer tiefen, schwer abzufangenden Linie.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 1 Punkt niedriger.', targetDefenseModifier: -1 }),
  mounted(F.schwertdrache, { slug: 'kreis-um-die-schranke', name: 'Kreis um die Schranke', minimumLevel: 7, slotBands: ['duelist'], costs: ['action', 'bonus-action'],
    description: 'Der Uchelwyr umkreist den Duellgegner und bindet dessen Waffe von der Außenseite.', effect: 'Verursacht Technikschaden, erhält +1 Angriff und erlaubt 4 Meter Eigenbewegung.', attackBonus: 1, effects: [movementEffect('uchelwyr-schranke', 4, 'move', 'self')] }),
  mounted(F.schwertdrache, { slug: 'koenigsanritt', name: 'Königsanritt', minimumLevel: 8, slotBands: ['duelist'], costs: ['action', 'reaction', 'special-action'],
    description: 'Ein formvollendeter Anritt endet in einem präzisen Stoß gegen die Waffenhand.', effect: 'Verursacht Technikschaden; ein misslungener Geschicklichkeitsrettungswurf gibt −2 Angriff.', secondarySave: secondarySave('uchelwyr-koenigsanritt', 'Getroffene Waffenhand', 'Der präzise Reiterstoß erschüttert die Waffenführung.', { attack: -2 }, { attributeKey: 'dexterity' }) }),
  mounted(F.abwartender, { slug: 'rueckzuegelkonter', name: 'Rückzügelkonter', minimumLevel: 9, slotBands: ['expert'], costs: ['reaction', 'bonus-action'], activationType: 'reaction',
    description: 'Das Ross weicht aus der Angriffslinie zurück, während der Reiter über seine Schulter kontert.', effect: 'Reaktionsangriff mit Technikschaden und 3 Metern Eigenbewegung.', effects: [movementEffect('uchelwyr-rueckzuegel', 3, 'move', 'self')] }),
  mounted(F.abwartender, { slug: 'unbewegter-reiter', name: 'Unbewegter Reiter', minimumLevel: 15, slotBands: ['expert'], costs: ['reaction', 'special-action'], activationType: 'reaction',
    description: 'Reiter und Ross halten die Linie wie eine einzige gepanzerte Gestalt.', effect: 'Verursacht Technikschaden und gewährt bis zum nächsten Beitrag +3 Rüstungsklasse.', effects: [temporaryCondition('uchelwyr-unbewegter', 'Unbewegter Reiter', 'Ross und Reiter schließen ihre Deckung gemeinsam.', { armorClass: 3 }, { target: 'self', on: 'always' })] }),
  mounted(F.fliegender, { slug: 'sprung-ueber-die-flanke', name: 'Sprung über die Flanke', minimumLevel: 9, slotBands: ['expert'], costs: ['action', 'bonus-action'],
    description: 'Das Ross kreuzt die Flanke, während die Waffe aus der neuen Höhe herabfällt.', effect: 'Verursacht Technikschaden und erlaubt 6 Meter Eigenbewegung.', effects: [movementEffect('uchelwyr-flankensprung', 6, 'move', 'self')] }),
  mounted(F.fliegender, { slug: 'galoppierende-drachenspur', name: 'Galoppierende Drachenspur', minimumLevel: 15, slotBands: ['expert'], costs: ['bonus-action', 'special-action'],
    description: 'Ein langer Galopp verdichtet Bewegung und Aura zu einem einzigen durchgezogenen Angriff.', effect: 'Verursacht Technikschaden, wird mit Vorteil gewürfelt und erlaubt 8 Meter Eigenbewegung.', rollMode: 'advantage', effects: [movementEffect('uchelwyr-galopp', 8, 'move', 'self')] }),
  mounted(F.bruellender, { slug: 'donnernder-lanzenstoss', name: 'Donnernder Lanzenstoß', minimumLevel: 9, slotBands: ['expert'], costs: ['action', 'bonus-action'], attackBonus: -1,
    description: 'Das Gewicht von Ross, Reiter und Waffe trifft in einer einzigen geraden Linie.', effect: 'Verursacht Technikschaden und behandelt die Zielverteidigung als 2 Punkte niedriger.', targetDefenseModifier: -2 }),
  mounted(F.bruellender, { slug: 'hufschlag-des-kolosses', name: 'Hufschlag des Kolosses', minimumLevel: 16, slotBands: ['expert'], costs: ['action', 'bonus-action', 'reaction'], attackBonus: -1, maximumTargets: 2, target: 'Bis zu zwei Gegner',
    description: 'Der Anritt bricht durch die erste Linie und trägt die Wucht in einen zweiten Gegner.', effect: 'Trifft bis zu zwei Gegner mit je Technikschaden und senkt ihre Zielverteidigung um 1.', targetDefenseModifier: -1 }),
  mounted(F.ausgeglichener, { slug: 'wechselritt', name: 'Wechselritt', minimumLevel: 9, slotBands: ['expert'], costs: ['action', 'reaction'],
    description: 'Der Uchelwyr wechselt zwischen Angriff, Parade und neuem Winkel, ohne den Takt des Rosses zu verlieren.', effect: 'Verursacht Technikschaden; +1 Angriff und +1 Rüstungsklasse.', attackBonus: 1, effects: [temporaryCondition('uchelwyr-wechselritt', 'Wechselritt', 'Der wechselnde Winkel schützt die offene Seite.', { armorClass: 1 }, { target: 'self', on: 'always' })] }),
  mounted(F.ausgeglichener, { slug: 'vier-zuegel-kreis', name: 'Vier-Zügel-Kreis', minimumLevel: 15, slotBands: ['expert'], costs: ['action', 'bonus-action', 'reaction'], maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Vier gedachte Zügellinien führen Ross und Waffe durch einen geschlossenen Kampfkreis.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und gewährt +2 Rüstungsklasse.', effects: [temporaryCondition('uchelwyr-vier-zuegel', 'Vier-Zügel-Kreis', 'Der geschlossene Ritt hält die Flanken gedeckt.', { armorClass: 2 }, { target: 'self', on: 'always' })] }),
  mounted(F.zorniger, { slug: 'sporn-des-zorns', name: 'Sporn des Zorns', minimumLevel: 9, slotBands: ['expert'], costs: ['action', 'bonus-action'], attackBonus: -1,
    description: 'Ein ungezügelter Anritt zwingt Ross und Reiter in eine kurze, gewaltsame Beschleunigung.', effect: 'Verursacht Technikschaden und erlaubt 5 Meter Eigenbewegung; anschließend −1 Rüstungsklasse.', effects: [movementEffect('uchelwyr-zornsporn', 5, 'move', 'self'), temporaryCondition('uchelwyr-zornsporn', 'Offener Anritt', 'Die wilde Beschleunigung öffnet die Deckung.', { armorClass: -1 }, { target: 'self', on: 'always' })] }),
  mounted(F.zorniger, { slug: 'rasender-jagdritt', name: 'Rasender Jagdritt', minimumLevel: 16, slotBands: ['expert'], costs: ['action', 'bonus-action', 'reaction', 'special-action'], attackBonus: -1, maximumTargets: 3, target: 'Bis zu drei Gegner',
    description: 'Der Uchelwyr jagt ohne sichere Wendelinie durch die feindliche Reihe.', effect: 'Trifft bis zu drei Gegner mit je Technikschaden und erlaubt 8 Meter Eigenbewegung; anschließend −2 Rüstungsklasse.', effects: [movementEffect('uchelwyr-jagdritt', 8, 'move', 'self'), temporaryCondition('uchelwyr-jagdritt', 'Rasender Jagdritt', 'Der wilde Durchbruch lässt Ross und Reiter offen.', { armorClass: -2 }, { target: 'self', on: 'always' })] })
]);
