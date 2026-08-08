import { sanitizeCreature } from './creature-model.js?v=20260808-duncan-v1';

export const CREATURE_LEVEL_GUIDELINES = Object.freeze([
  { label: 'Bauer', minimum: 1, maximum: 1 },
  { label: 'Waffenknecht / Knappe', minimum: 3, maximum: 4 },
  { label: 'Jungritter', minimum: 5, maximum: 6 },
  { label: 'Ritter', minimum: 7, maximum: 10 },
  { label: 'Hauptmann', minimum: 13, maximum: 13, approximate: true },
  { label: 'Heldenhafter Krieger / Haudegen / erfahrener Anführer', minimum: 14, maximum: 30 }
]);

const BLACK_EEL_HABITAT = 'Brandheide, Handelsstraßen und geplünderte Grenzdörfer';

const BUILTIN_CREATURE_SOURCES = Object.freeze([
  {
    id: 'catalog-schwarzer-zitteraal-raubritter',
    name: 'Schwarzer Zitteraal Raubritter',
    type: 'Raubritter',
    species: 'Mensch',
    habitat: BLACK_EEL_HABITAT,
    challengeRating: 7,
    size: 'Mittel',
    level: 7,
    portrait: 'https://i.imgur.com/uLAE7V0.png',
    portraitCaption: 'Schwer gepanzerter Raubritter des Schwarzen Zitteraals.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 18 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 16 }, { key: 'intelligence', score: 10 },
        { key: 'wisdom', score: 13 }, { key: 'charisma', score: 14 }
      ],
      hitPoints: { current: 67, maximumOverride: 67, temporary: 0, hitDie: 10 },
      armorClass: { override: 18 },
      combat: { movement: 9, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [
        { attributeKey: 'strength', proficient: true },
        { attributeKey: 'constitution', proficient: true }
      ],
      skills: [
        { id: 'raubritter-athletik', name: 'Athletik', attributeKey: 'strength', proficiency: 'trained', bonus: 0, notes: 'Drängt Gegner aus Engstellen und hält Schildlinien.' },
        { id: 'raubritter-einschuechtern', name: 'Einschüchtern', attributeKey: 'charisma', proficiency: 'trained', bonus: 0, notes: 'Droht mit dem Ruf des Schwarzen Zitteraals.' },
        { id: 'raubritter-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Achtet besonders auf Hinterhalte.' }
      ],
      weapons: [
        { id: 'raubritter-morgenstern', name: 'Schwarzer Morgenstern', damageFormula: '1d8', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Einhand, schwerer Kopf', notes: 'Bei einem wuchtigen Treffer versucht er, Schild oder Waffe des Ziels zur Seite zu reißen.', equipped: true },
        { id: 'raubritter-schildstoss', name: 'Schildstoß', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Kontrolle', notes: 'Kann ein getroffenes Ziel zurückdrängen oder zu Fall bringen, wenn die Situation es zulässt.', equipped: false }
      ],
      armorItems: [
        { id: 'raubritter-plattenzeug', name: 'Geschwärztes Plattenzeug', kind: 'armor', baseArmorClass: 16, armorClassBonus: 0, dexterityMode: 'none', equipped: true, properties: 'Schwer, rußgeschwärzt', notes: 'Trägt das goldene Aalwappen.' },
        { id: 'raubritter-turmschild', name: 'Aalschild', kind: 'shield', armorClassBonus: 2, equipped: true, properties: 'Massiv', notes: 'Breiter Schild mit goldenem Zitteraal.' }
      ],
      resources: [
        { id: 'raubritter-befehl', name: 'Befehlsruf', current: 1, maximum: 1, recovery: 'scene', notes: 'Einmal pro Szene koordiniert er nahe Verbündete.' }
      ],
      abilities: [
        { id: 'raubritter-schildwall', name: 'Schildwall', description: 'Solange ein verbündeter Schwarzer Zitteraal unmittelbar neben ihm steht, hält der Raubritter Engstellen und schützt den Verbündeten erzählerisch mit seinem Schild.', active: true },
        { id: 'raubritter-befehlsruf', name: 'Befehlsruf', description: 'Einmal pro Szene weist er bis zu zwei Verbündete an, Deckung zu suchen, vorzurücken oder dasselbe Ziel zu bedrängen.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true },
        { id: 'raubritter-eiserne-disziplin', name: 'Eiserne Disziplin', description: 'Er flieht nicht wegen gewöhnlicher Furcht oder bloßer Unterzahl. Erst der Zusammenbruch seiner Truppe bringt ihn ins Wanken.', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Raubritter bindet die gefährlichste Nahkampffigur, schützt Schützen und Plünderer und versucht Gegner mit Schildstoß in Feuer, Trümmer oder Engstellen zu drängen.'
    },
    loot: {
      currency: '2W10 Silberstücke, 1W6 Goldstücke',
      notes: 'Die Ausrüstung ist schwer und trägt weithin erkennbare Zeichen des Schwarzen Zitteraals.',
      items: [
        { id: 'loot-raubritter-abzeichen', name: 'Bronzenes Aalabzeichen', quantity: 1, chance: 100, notes: 'Kennzeichen der Bande; als Beweisstück wertvoll.' },
        { id: 'loot-raubritter-morgenstern', name: 'Schwarzer Morgenstern', quantity: 1, chance: 80, notes: 'Gebrauchsfähig, aber auffällig.' },
        { id: 'loot-raubritter-befehl', name: 'Versiegelter Raubbefehl', quantity: 1, chance: 35, notes: 'Kann Hinweise auf Auftraggeber oder das nächste Ziel enthalten.' }
      ]
    },
    notes: 'Veteran und Anführer einer kleinen Plündererrotte. Er spricht knapp, kennt den Wert von Gefangenen und zieht sich geordnet zurück, wenn sein Auftrag verloren ist.'
  },
  {
    id: 'catalog-schwarzer-zitteraal-schuetze',
    name: 'Schwarzer Zitteraal Schütze',
    type: 'Schütze',
    species: 'Mensch',
    habitat: BLACK_EEL_HABITAT,
    challengeRating: 3,
    size: 'Mittel',
    level: 3,
    portrait: 'https://i.imgur.com/001lUuF.png',
    portraitCaption: 'Fernkämpfer des Schwarzen Zitteraals.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 10 }, { key: 'dexterity', score: 16 },
        { key: 'constitution', score: 12 }, { key: 'intelligence', score: 11 },
        { key: 'wisdom', score: 14 }, { key: 'charisma', score: 9 }
      ],
      hitPoints: { current: 21, maximumOverride: 21, temporary: 0, hitDie: 8 },
      armorClass: { override: 14 },
      combat: { movement: 9, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [{ attributeKey: 'dexterity', proficient: true }],
      skills: [
        { id: 'schuetze-heimlichkeit', name: 'Heimlichkeit', attributeKey: 'dexterity', proficiency: 'trained', bonus: 0, notes: 'Bezieht vor dem Kampf erhöhte oder verdeckte Stellung.' },
        { id: 'schuetze-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Sucht nach ungeschützten Zielen und gegnerischen Schützen.' }
      ],
      weapons: [
        { id: 'schuetze-langbogen', name: 'Geschwärzter Langbogen', damageFormula: '1d8', damageType: 'Stich', attackAttribute: 'dexterity', proficient: true, range: '45 / 180 m', properties: 'Zweihändig, Munition', notes: 'Bevorzugt Ziele ohne Deckung und wechselt nach jedem Schuss die Position, wenn möglich.', equipped: true },
        { id: 'schuetze-dolch', name: 'Dolch', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'dexterity', proficient: true, range: 'Nahkampf oder Wurf 6 / 18 m', properties: 'Leicht, Finesse, Wurf', notes: 'Nur als Notlösung im Nahkampf.', equipped: false }
      ],
      armorItems: [
        { id: 'schuetze-leder', name: 'Dunkle Lederrüstung', kind: 'armor', baseArmorClass: 11, armorClassBonus: 0, dexterityMode: 'full', equipped: true, properties: 'Leicht', notes: 'Mit rußigem Stoff gegen Feuerschein abgedunkelt.' }
      ],
      resources: [
        { id: 'schuetze-spezialpfeile', name: 'Brandpfeile', current: 2, maximum: 2, recovery: 'manual', notes: 'Nur einsetzen, wenn Feuer taktisch sinnvoll und erlaubt ist.' }
      ],
      abilities: [
        { id: 'schuetze-stellungswechsel', name: 'Stellungswechsel', description: 'Nach einem Fernangriff sucht der Schütze Deckung oder verlagert sich, statt offen stehen zu bleiben.', active: true },
        { id: 'schuetze-brandpfeil', name: 'Brandpfeil', description: 'Entzündet ein geeignetes Objekt oder zwingt Gegner aus brennbarer Deckung. Der zusätzliche Effekt hängt von Ziel und Umgebung ab.', usesCurrent: 2, usesMaximum: 2, recovery: 'manual', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Schütze eröffnet aus Deckung, konzentriert Feuer auf verwundete oder ungeschützte Ziele und meidet den Nahkampf. Wird er bedrängt, zieht er sich zum Raubritter zurück.'
    },
    loot: {
      currency: '1W8 Silberstücke',
      notes: 'Munition und Bogen zeigen das eingeritzte Aalzeichen.',
      items: [
        { id: 'loot-schuetze-pfeile', name: 'Schwarze Pfeile', quantity: 12, chance: 80, notes: 'Einige können beim Kampf beschädigt worden sein.' },
        { id: 'loot-schuetze-brandpfeil', name: 'Brandpfeil', quantity: 2, chance: 45, notes: 'In geöltes Tuch gewickelt.' },
        { id: 'loot-schuetze-abzeichen', name: 'Eisernes Aalabzeichen', quantity: 1, chance: 100, notes: 'Einfaches Bandenabzeichen.' }
      ]
    },
    notes: 'Disziplinierter Wegelagerer, der meist paarweise mit einem zweiten Schützen oder unter dem Schutz eines Raubritters kämpft.'
  },
  {
    id: 'catalog-schwarzer-zitteraal-pluenderer',
    name: 'Schwarzer Zitteraal Plünderer',
    type: 'Plünderer',
    species: 'Mensch',
    habitat: BLACK_EEL_HABITAT,
    challengeRating: 3,
    size: 'Mittel',
    level: 3,
    portrait: 'https://i.imgur.com/Q3KTHVq.png',
    portraitCaption: 'Wendiger Plünderer des Schwarzen Zitteraals.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 14 }, { key: 'dexterity', score: 14 },
        { key: 'constitution', score: 14 }, { key: 'intelligence', score: 9 },
        { key: 'wisdom', score: 11 }, { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 24, maximumOverride: 24, temporary: 0, hitDie: 8 },
      armorClass: { override: 15 },
      combat: { movement: 10, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [{ attributeKey: 'strength', proficient: true }],
      skills: [
        { id: 'pluenderer-athletik', name: 'Athletik', attributeKey: 'strength', proficiency: 'trained', bonus: 0, notes: 'Klettert über Zäune, Wagen und Trümmer.' },
        { id: 'pluenderer-fingerfertigkeit', name: 'Fingerfertigkeit', attributeKey: 'dexterity', proficiency: 'trained', bonus: 0, notes: 'Greift im Gedränge nach Beute oder Schlüsseln.' }
      ],
      weapons: [
        { id: 'pluenderer-handbeil', name: 'Handbeil', damageFormula: '1d6', damageType: 'Hieb', attackAttribute: 'strength', proficient: true, range: 'Nahkampf oder Wurf 6 / 18 m', properties: 'Leicht, Wurf', notes: 'Hakt nach Schilden, Gurten und schlecht geschützter Ausrüstung.', equipped: true },
        { id: 'pluenderer-kurzklinge', name: 'Gezackte Kurzklinge', damageFormula: '1d6', damageType: 'Stich', attackAttribute: 'dexterity', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Leicht, Finesse', notes: 'Für schnelle Angriffe im Gedränge.', equipped: false }
      ],
      armorItems: [
        { id: 'pluenderer-schuppenrock', name: 'Zusammengeflickter Schuppenrock', kind: 'armor', baseArmorClass: 13, armorClassBonus: 0, dexterityMode: 'capped', dexterityCap: 2, equipped: true, properties: 'Mittel, zusammengewürfelt', notes: 'Aus gestohlenen und reparierten Teilen.' }
      ],
      resources: [
        { id: 'pluenderer-schmutziger-trick', name: 'Schmutziger Trick', current: 1, maximum: 1, recovery: 'scene', notes: 'Sand, Tritt, geworfener Unrat oder ein Stoß gegen die Umgebung.' }
      ],
      abilities: [
        { id: 'pluenderer-meutenangriff', name: 'Meutenangriff', description: 'Bedrängt bevorzugt ein Ziel, das bereits von einem Verbündeten gebunden wird, und nutzt dessen Ablenkung.', active: true },
        { id: 'pluenderer-schmutziger-trick', name: 'Schmutziger Trick', description: 'Einmal pro Szene nutzt er Umgebung oder versteckte Hilfsmittel, um kurzzeitig Raum für Flucht, Beutezug oder einen Folgeangriff zu schaffen.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true },
        { id: 'pluenderer-beutegier', name: 'Beutegier', description: 'Offene Wertgegenstände oder unbewachte Vorräte können seine taktische Disziplin brechen.', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Plünderer umgeht Frontlinien, bedrängt gebundene Gegner und versucht während des Kampfes Beute, Schlüssel oder ein Fluchtmittel an sich zu bringen.'
    },
    loot: {
      currency: '2W6 Kupferstücke, 1W6 Silberstücke',
      notes: 'Zusammengewürfeltes Raubgut; einzelne Stücke können früheren Opfern zugeordnet werden.',
      items: [
        { id: 'loot-pluenderer-raubgut', name: 'Beutel mit Raubgut', quantity: 1, chance: 75, notes: 'Knöpfe, Ring, Würfel, Schnallen und kleine Münzen.' },
        { id: 'loot-pluenderer-dietriche', name: 'Grobe Dietriche', quantity: 1, chance: 40, notes: 'Unvollständiger, aber brauchbarer Satz.' },
        { id: 'loot-pluenderer-abzeichen', name: 'Eisernes Aalabzeichen', quantity: 1, chance: 100, notes: 'Einfaches Bandenabzeichen.' }
      ]
    },
    notes: 'Gewöhnlicher, aber kampferprobter Plünderer. Mutig in der Gruppe, schnell auf der Flucht und leicht durch sichtbare Beute abzulenken.'
  },
  {
    id: 'catalog-draig-lehensritter',
    name: 'Draig Lehensritter',
    type: 'Lehensritter',
    species: 'Mensch',
    habitat: 'Draig-Lehen, Grenzwege und umkämpfte Gehöfte',
    challengeRating: 7,
    size: 'Mittel',
    level: 7,
    portrait: 'https://i.imgur.com/sY3vKh7.png',
    portraitCaption: 'Lehensritter des Hauses Draig mit Langschwert.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 18 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 16 }, { key: 'intelligence', score: 11 },
        { key: 'wisdom', score: 14 }, { key: 'charisma', score: 14 }
      ],
      hitPoints: { current: 63, maximumOverride: 63, temporary: 0, hitDie: 10 },
      armorClass: { override: 18 },
      combat: { movement: 9, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [
        { attributeKey: 'strength', proficient: true },
        { attributeKey: 'wisdom', proficient: true }
      ],
      skills: [
        { id: 'draig-lehensritter-athletik', name: 'Athletik', attributeKey: 'strength', proficiency: 'trained', bonus: 0, notes: 'Hält Engstellen und drängt Gegner von seinen Gefolgsleuten fort.' },
        { id: 'draig-lehensritter-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Achtet auf Flanken, Schützen und Gefahren für seine Leute.' },
        { id: 'draig-lehensritter-ueberzeugen', name: 'Überzeugen', attributeKey: 'charisma', proficiency: 'trained', bonus: 0, notes: 'Spricht mit der ruhigen Autorität eines vereidigten Lehensmanns.' }
      ],
      weapons: [
        { id: 'draig-lehensritter-langschwert', name: 'Draig-Langschwert', damageFormula: '1d8', damageType: 'Hieb', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Vielseitig', notes: 'Kontrollierte Hiebe; wird zweihändig geführt, sobald der Ritter Raum gewinnt.', equipped: true },
        { id: 'draig-lehensritter-knaufstoss', name: 'Knaufstoß', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Kontrolle', notes: 'Ein kurzer Stoß, um einen Gegner zu unterbrechen oder zurückzudrängen.', equipped: false }
      ],
      armorItems: [
        { id: 'draig-lehensritter-harnisch', name: 'Draig-Harnisch', kind: 'armor', baseArmorClass: 17, armorClassBonus: 0, dexterityMode: 'none', equipped: true, properties: 'Schwer, gepflegt', notes: 'Dunkler Stahl mit dem Zeichen des Hauses Draig.' },
        { id: 'draig-lehensritter-wehrgehänge', name: 'Verstärktes Wehrgehänge', kind: 'ward', armorClassBonus: 1, equipped: true, properties: 'Parierschutz', notes: 'Schützt Schwertarm und Flanke, ohne ein Schild zu benötigen.' }
      ],
      resources: [
        { id: 'draig-lehensritter-befehl', name: 'Lehensbefehl', current: 1, maximum: 1, recovery: 'scene', notes: 'Ordnet einmal pro Szene einen koordinierten Stellungswechsel an.' }
      ],
      abilities: [
        { id: 'draig-lehensritter-schutzpflicht', name: 'Schutzpflicht', description: 'Der Ritter stellt sich bevorzugt zwischen eine unmittelbare Bedrohung und einen verwundeten oder bedrängten Draig-Gefolgsmann.', active: true },
        { id: 'draig-lehensritter-lehensbefehl', name: 'Lehensbefehl', description: 'Einmal pro Szene lässt er Verbündete geschlossen vorrücken, Deckung beziehen oder einen Rückzug sichern.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true },
        { id: 'draig-lehensritter-standfest', name: 'Standfest', description: 'Solange noch ein Gefolgsmann an seiner Seite kämpft, widersteht er Einschüchterung und ungeordnetem Rückzug.', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Lehensritter bindet den stärksten Gegner mit dem Langschwert, hält seine beiden Gefolgsleute zusammen und bietet eine Aufgabe an, bevor er einen aussichtslosen Kampf bis zum Tod führt.'
    },
    loot: {
      currency: '2W10 Silberstücke, 1W4 Goldstücke',
      notes: 'Die Ausrüstung trägt erkennbare Draig-Zeichen und sollte bei ehrenhaftem Ausgang an das Haus zurückgegeben werden.',
      items: [
        { id: 'loot-draig-lehensritter-siegel', name: 'Lehenssiegel des Hauses Draig', quantity: 1, chance: 100, notes: 'Belegt Rang und Verpflichtung des Ritters.' },
        { id: 'loot-draig-lehensritter-langschwert', name: 'Draig-Langschwert', quantity: 1, chance: 90, notes: 'Gut gepflegte Klinge mit einfacher Hausmarke.' },
        { id: 'loot-draig-lehensritter-befehl', name: 'Versiegelter Marschbefehl', quantity: 1, chance: 35, notes: 'Nennt Weg, Auftrag oder den zuständigen Lehensherrn.' }
      ]
    },
    notes: 'Erfahrener Lehensritter. Pflichterfüllt, kontrolliert und eher zu einem geordneten Rückzug oder einer ehrenhaften Aufgabe bereit als zu sinnlosem Sterben.'
  },
  {
    id: 'catalog-draig-waffenknecht',
    name: 'Draig Waffenknecht',
    type: 'Waffenknecht',
    species: 'Mensch',
    habitat: 'Draig-Lehen, Grenzwege und umkämpfte Gehöfte',
    challengeRating: 3,
    size: 'Mittel',
    level: 3,
    portrait: 'https://i.imgur.com/QaY77kP.png',
    portraitCaption: 'Draig-Waffenknecht mit Speer und Schild.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 15 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 14 }, { key: 'intelligence', score: 10 },
        { key: 'wisdom', score: 12 }, { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 27, maximumOverride: 27, temporary: 0, hitDie: 10 },
      armorClass: { override: 16 },
      combat: { movement: 9, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [
        { attributeKey: 'strength', proficient: true },
        { attributeKey: 'constitution', proficient: true }
      ],
      skills: [
        { id: 'draig-waffenknecht-athletik', name: 'Athletik', attributeKey: 'strength', proficiency: 'trained', bonus: 0, notes: 'Stemmt Schild und Speer gegen Ansturm oder Fluchtversuch.' },
        { id: 'draig-waffenknecht-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Hält im Wachdienst Wege und Gebäudeecken im Blick.' }
      ],
      weapons: [
        { id: 'draig-waffenknecht-speer', name: 'Draig-Speer', damageFormula: '1d6', damageType: 'Stich', attackAttribute: 'strength', proficient: true, range: 'Nahkampf oder Wurf 6 / 18 m', properties: 'Einhand, Wurf', notes: 'Wird hinter dem Schild geführt und hält Gegner auf Abstand.', equipped: true },
        { id: 'draig-waffenknecht-schildstoss', name: 'Schildstoß', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Kontrolle', notes: 'Schafft Raum für den Speer oder schützt einen Gefährten.', equipped: false }
      ],
      armorItems: [
        { id: 'draig-waffenknecht-kettenhemd', name: 'Draig-Kettenhemd', kind: 'armor', baseArmorClass: 13, armorClassBonus: 0, dexterityMode: 'capped', dexterityCap: 2, equipped: true, properties: 'Mittel', notes: 'Robuste, einheitliche Lehensausrüstung.' },
        { id: 'draig-waffenknecht-schild', name: 'Draig-Rundschild', kind: 'shield', armorClassBonus: 2, equipped: true, properties: 'Schild', notes: 'Bemalter Holzschild mit verstärktem Rand.' }
      ],
      resources: [
        { id: 'draig-waffenknecht-schildwacht', name: 'Schildwacht', current: 1, maximum: 1, recovery: 'scene', notes: 'Fängt einmal pro Szene erzählerisch einen Angriff auf einen unmittelbar benachbarten Verbündeten ab.' }
      ],
      abilities: [
        { id: 'draig-waffenknecht-speerwall', name: 'Speerwall', description: 'Neben einem zweiten Schildträger kontrolliert der Waffenknecht einen schmalen Zugang besonders wirkungsvoll.', active: true },
        { id: 'draig-waffenknecht-schildwacht', name: 'Schildwacht', description: 'Einmal pro Szene schiebt er sich mit dem Schild vor einen direkt benachbarten Verbündeten.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Waffenknecht bleibt in Reichweite des Lehensritters, bindet Nahkämpfer mit Speer und Schild und wirft seine Waffe nur, wenn Rückzug oder Verfolgung es verlangen.'
    },
    loot: {
      currency: '1W8 Silberstücke',
      notes: 'Schlichte, brauchbare Lehensausrüstung mit Draig-Farben.',
      items: [
        { id: 'loot-draig-waffenknecht-speer', name: 'Draig-Speer', quantity: 1, chance: 85, notes: 'Gerader Schaft, eiserne Spitze, deutliche Gebrauchsspuren.' },
        { id: 'loot-draig-waffenknecht-schild', name: 'Draig-Rundschild', quantity: 1, chance: 75, notes: 'Nach einem Kampf häufig reparaturbedürftig.' },
        { id: 'loot-draig-waffenknecht-marke', name: 'Hölzerne Soldmarke', quantity: 1, chance: 100, notes: 'Kennzeichnet Einheit und ausstehenden Sold.' }
      ]
    },
    notes: 'Solider Lehenssoldat. Kein Held, aber diszipliniert genug, um seinem Ritter zu folgen und verwundete Kameraden nicht zurückzulassen.'
  },
  {
    id: 'catalog-draig-schuetze',
    name: 'Draig Schütze',
    type: 'Schütze',
    species: 'Mensch',
    habitat: 'Draig-Lehen, Grenzwege und umkämpfte Gehöfte',
    challengeRating: 3,
    size: 'Mittel',
    level: 3,
    portrait: 'https://i.imgur.com/tntwr06.png',
    portraitCaption: 'Draig-Schütze mit Langbogen und Dolch.',
    combatProfile: {
      attributes: [
        { key: 'strength', score: 11 }, { key: 'dexterity', score: 16 },
        { key: 'constitution', score: 12 }, { key: 'intelligence', score: 11 },
        { key: 'wisdom', score: 14 }, { key: 'charisma', score: 10 }
      ],
      hitPoints: { current: 22, maximumOverride: 22, temporary: 0, hitDie: 8 },
      armorClass: { override: 14 },
      combat: { movement: 9, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [{ attributeKey: 'dexterity', proficient: true }],
      skills: [
        { id: 'draig-schuetze-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Liest Deckung, Schusswinkel und Bewegungen zwischen Ruinen.' },
        { id: 'draig-schuetze-heimlichkeit', name: 'Heimlichkeit', attributeKey: 'dexterity', proficiency: 'trained', bonus: 0, notes: 'Nutzt Hecken, Mauern und Dachreste für einen gedeckten Stand.' }
      ],
      weapons: [
        { id: 'draig-schuetze-langbogen', name: 'Draig-Langbogen', damageFormula: '1d8', damageType: 'Stich', attackAttribute: 'dexterity', proficient: true, range: '45 / 180 m', properties: 'Zweihändig, Munition', notes: 'Präziser Fernangriff aus vorbereiteter Deckung.', equipped: true },
        { id: 'draig-schuetze-dolch', name: 'Draig-Dolch', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'dexterity', proficient: true, range: 'Nahkampf oder Wurf 6 / 18 m', properties: 'Leicht, Finesse, Wurf', notes: 'Seitenwaffe für den Notfall oder einen schnellen Wurf.', equipped: false }
      ],
      armorItems: [
        { id: 'draig-schuetze-leder', name: 'Verstärktes Lederzeug', kind: 'armor', baseArmorClass: 11, armorClassBonus: 0, dexterityMode: 'full', equipped: true, properties: 'Leicht', notes: 'Bewegliche Rüstung in gedeckten Draig-Farben.' }
      ],
      resources: [
        { id: 'draig-schuetze-ruhiger-schuss', name: 'Ruhiger Schuss', current: 1, maximum: 1, recovery: 'scene', notes: 'Nutzt eine vorbereitete Stellung für einen besonders sorgfältig gesetzten Schuss.' }
      ],
      abilities: [
        { id: 'draig-schuetze-gedeckte-stellung', name: 'Gedeckte Stellung', description: 'Der Schütze sucht nach jedem Schuss wieder Mauerwerk, Wagen oder Gelände als Deckung.', active: true },
        { id: 'draig-schuetze-ruhiger-schuss', name: 'Ruhiger Schuss', description: 'Einmal pro Szene wartet er auf einen klaren Schusswinkel und berücksichtigt Deckung und Verbündete besonders sorgfältig.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Der Schütze eröffnet auf gegnerische Fernkämpfer, bleibt hinter der Draig-Linie und zieht den Dolch erst, wenn Fluchtweg oder Bogenhand bedroht sind.'
    },
    loot: {
      currency: '1W6 Silberstücke',
      notes: 'Bogen und Pfeile sind zweckmäßig, ordentlich gepflegt und mit kleinen Draig-Marken versehen.',
      items: [
        { id: 'loot-draig-schuetze-langbogen', name: 'Draig-Langbogen', quantity: 1, chance: 80, notes: 'Guter Dienstbogen aus hellem Holz.' },
        { id: 'loot-draig-schuetze-pfeile', name: 'Bündel Draig-Pfeile', quantity: 12, chance: 75, notes: 'Mit einheitlicher Befiederung.' },
        { id: 'loot-draig-schuetze-dolch', name: 'Draig-Dolch', quantity: 1, chance: 90, notes: 'Schlichte, scharfe Seitenwaffe.' }
      ]
    },
    notes: 'Ausgebildeter Lehensschütze. Beobachtet ruhig, warnt seine Kameraden vor Flankenangriffen und verschwendet ungern Pfeile auf schlechte Ziele.'
  }
]);

const BUILTIN_CREATURE_IDS = new Set(BUILTIN_CREATURE_SOURCES.map(creature => creature.id));

export function getBuiltinCreatureTemplates() {
  return BUILTIN_CREATURE_SOURCES.map(source => sanitizeCreature(source));
}

export function isBuiltinCreatureId(id) {
  return BUILTIN_CREATURE_IDS.has(String(id || ''));
}
