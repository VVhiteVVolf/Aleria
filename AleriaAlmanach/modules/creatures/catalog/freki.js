// Individueller Gefährte; der Bestiarium-Eintrag beschreibt die Rasse, nicht diese Werte.
// Quelle: Bestiarium/tiere/raubtiere/woelfe/gramnir/profil.json
import { FREKI_TECHNIQUES, FREKI_ACTIVE_ABILITIES } from './freki-actions.js';
export const FREKI_CREATURE_SOURCE = {
  id: 'companion-ylva-freki', name: 'Freki', type: 'Wolfsgefährte', species: 'Gramnir · Nordwolf',
  habitat: 'Hornhall, Dämmergrund · Clan Wolfshorn', level: 4, challengeRating: 4, size: 'Mittel',
  portrait: 'https://i.imgur.com/jO6WUgH.png', portraitCaption: 'Freki, Ylva Wolfshorns Gramnir-Gefährte.',
  itemOrigin: { instanceId: 'ylva-freki', inventoryItemId: 'ylva-freki', templateId: 'gramnir',
    ownerCharacterId: 'bSYZYAEOwiRgy44f6OmO', ownerCharacterName: 'Ylva Wolfshorn', disposition: 'owned' },
  notes: 'Vom Clan Wolfshorn seit dem Welpenalter domestiziert und von Ylva zum Jagd- und Wachgefährten ausgebildet. Freki prüft Fremde schweigend, hält im Lager die windzugewandte Seite und folgt Ylvas knappen Handzeichen. Vertrauten begegnet er mit ruhiger Nähe; aufdringliche Hände weist er mit einem tiefen Knurren zurück. Er ist ausdauernd und eigensinnig, kein zahmes Schoßtier. In der Szene wird er als eigene Kreatur mit eigenen Aktionen geführt; seine Anwesenheit gibt Ylva keinen kostenlosen Zusatzangriff.',
  combatProfile: {
    attributes: [{ key: 'strength', score: 14 }, { key: 'dexterity', score: 14 },
      { key: 'constitution', score: 14 }, { key: 'intelligence', score: 3 },
      { key: 'wisdom', score: 14 }, { key: 'charisma', score: 8 }],
    hitPoints: { current: 38, maximumOverride: 38, hitDie: 8, temporary: 0 },
    armorClass: { base: 11, dexterityMode: 'full', override: null }, combat: { movement: 12 },
    savingThrows: [{ attributeKey: 'dexterity', proficient: true }, { attributeKey: 'constitution', proficient: true }],
    skills: [
      { id: 'freki-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained' },
      { id: 'freki-faehrte', name: 'Überleben', attributeKey: 'wisdom', proficiency: 'trained', notes: 'Fährten über Geruch und Bodenzeichen verfolgen.' },
      { id: 'freki-heimlichkeit', name: 'Heimlichkeit', attributeKey: 'dexterity', proficiency: 'trained' }
    ],
    weapons: [{ id: 'freki-biss', name: 'Biss', weaponType: 'natural', damageFormula: '1d6', damageType: 'Stich',
      attackAttribute: 'strength', proficient: true, equipped: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe',
      notes: 'Ein einzelner gezielter Biss. Keine zusätzlichen Rudelattacken.' }],
    armorItems: [], techniques: FREKI_TECHNIQUES, resources: [], conditions: [],
    abilities: [
      ...FREKI_ACTIVE_ABILITIES,
      { id: 'freki-spuernase', name: 'Spürnase', active: true, combatUsable: false, activationType: 'passive',
        description: 'Kann bekannte Gerüche aufnehmen und Fährten verfolgen. Bei unsicherer Spur wird Überleben gewürfelt; Wind, Regen und fremde Gerüche bleiben relevant.' },
      { id: 'freki-handzeichen', name: 'Vertraute Handzeichen', active: true, combatUsable: false, activationType: 'passive',
        description: 'Kennt Ylvas Zeichen für Folgen, Warten, Suchen und Rückruf. Kämpft nur bei tatsächlicher Anwesenheit und mit seinen eigenen Aktionsressourcen.' },
      { id: 'freki-winterfell', name: 'Wetterfestes Winterfell', active: true, combatUsable: false, activationType: 'passive',
        description: 'Dichtes Fell und hohe Ausdauer ermöglichen lange Jagden in Kälte und Nässe. Keine pauschale Resistenz gegen Kälteschaden.' }
    ],
    quirks: [{ id: 'freki-eigensinn', name: 'Wachsamer Eigensinn', active: true,
      description: 'Treue muss verdient werden. Freki vertraut Ylva, beobachtet Fremde auf Abstand und duldet keine Behandlung als Spielzeug.' }],
    magic: { enabled: false, spells: [] },
    notes: 'Stufe 4: 26 Basis-TP + 7 Vitalität = ursprünglich 33 TP; einmalig +15 % aufgerundet ergibt 38 TP. Natürlicher Schutz 11 + GES 2 = RK 13. Sechs zusätzliche Jagdmanöver mit eigenen Kosten, darunter zwei mit Besonderer Aktion. Kein magischer Wolf.'
  },
  loot: { currency: '', notes: 'Ylvas lebender Gefährte; kein Handels- oder Beutegegenstand.', items: [] }
};
