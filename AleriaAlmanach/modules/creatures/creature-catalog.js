import { sanitizeCreature } from './creature-model.js?v=20260906-effect-rolls-v1';

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
  },
  {
    id: 'companion-tanor',
    name: 'Tanor',
    type: 'Reittier',
    species: 'Rhyfel',
    habitat: 'Draig-Ländereien und Gawains Stallungen',
    challengeRating: 1,
    size: 'Groß',
    level: 1,
    portrait: 'https://i.imgur.com/TuGHu7s.png',
    portraitCaption: 'Tanor, Gawains prachtvoller Rhyfelhengst.',
    avatars: [
      { id: 'tanor-avatar-portrait', img: 'https://i.imgur.com/YcL98jJ.png', label: 'Portrait' },
      { id: 'tanor-avatar-sheet', img: 'https://i.imgur.com/iCkIwnO.png', label: 'Sheetbild' }
    ],
    combatProfile: {
      attributes: [
        { key: 'strength', score: 17 }, { key: 'dexterity', score: 13 },
        { key: 'constitution', score: 14 }, { key: 'intelligence', score: 3 },
        { key: 'wisdom', score: 11 }, { key: 'charisma', score: 15 }
      ],
      hitPoints: { current: 16, maximumOverride: 16, temporary: 0, hitDie: 10 },
      armorClass: { override: 12 },
      combat: { movement: 15, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [{ attributeKey: 'strength', proficient: true }],
      skills: [
        { id: 'tanor-einschuechtern', name: 'Einschüchtern', attributeKey: 'charisma', proficiency: 'trained', bonus: 0, notes: 'Schnaubt, schnaubt und stampft, bis selbst der Himmel kleinlaut wird.' }
      ],
      weapons: [
        { id: 'tanor-tritt', name: 'Tritt', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Setzt ihn ein, wenn Gawain die roten Äpfel vergisst.', equipped: true },
        { id: 'tanor-biss', name: 'Biss', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Ein gezielter Nachdruck, falls der Tritt allein nicht überzeugt.', equipped: false }
      ],
      armorItems: [],
      resources: [
        { id: 'tanor-apfellaune', name: 'Apfellaune', current: 1, maximum: 1, recovery: 'scene', notes: 'Ohne pünktliche rote Äpfel erinnert Tanor seinen Reiter mit einem gezielten Biss oder Tritt.' }
      ],
      abilities: [
        { id: 'tanor-eitler-diva', name: 'Eitler Diva', description: 'Ein einziger Schlammfleck genügt, um Tanor in einen hysterischen Anfall zu treiben. Bei Regen reitet er keinen Schritt freiwillig – und wehe, man versucht ihn zu überreden.', active: true },
        { id: 'tanor-rassehochmut', name: 'Rassehochmut', description: 'Tanor duldet nur Pferde der Rassen Rhyfel, Ceffyl und Hest in seiner Nähe – alle anderen ignoriert er mit kühler Verachtung.', active: true },
        { id: 'tanor-apfelnarr', name: 'Apfelnarr', description: 'Rote Äpfel sind sein größtes Verlangen. Bleibt die Fütterung aus, erinnert er Gawain deutlich daran.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Ein schwieriges Ross – aber eines, das seinem Reiter gleicht: stolz, schön, eigenwillig – und zu gut, um im Dreck zu stehen.'
    },
    loot: { currency: '', notes: '', items: [] },
    notes: 'Tanor ist ein junger, prachtvoller Rhyfelhengst, den Gawain zu seinem achtzehnten Geburtstag von seinem Onkel Sir Owain, dem berühmten Pferdezüchter, geschenkt bekam. Owain nannte ihn damals „ein Ross für Grünschnäbel mit zu viel Stolz im Blick" – und selten hatte er so recht. Tanor ist ein Tier von makelloser Statur und unverschämtem Selbstbewusstsein, mit einem Fell, das in der Sonne wie poliertes Gold glänzt, und einer Mähne, die eher gepflegt als geritten werden will.\n\nEr ist in jeder Hinsicht Gawains Spiegelbild – eitel, temperamentvoll, eigensinnig. Ein einziger Schlammfleck genügt, um ihn in einen hysterischen Anfall zu treiben. Bei Regen reitet er keinen Schritt freiwillig, und wehe, man versucht ihn dazu zu überreden: dann wird geschnauft, geschnaubt und gestampft, bis selbst der Himmel kleinlaut wird. Tanor hat eine ausgesprochene Abneigung gegen alle anderen Pferderassen außer Rhyfel, Ceffyl und Hest – den Rest ignoriert er mit kühler Verachtung. Dafür liebt er rote Äpfel, und zwar so sehr, dass er Gawain mit einem gezielten Biss oder Tritt daran erinnert, wenn die Fütterung nicht pünktlich erfolgt.\n\nEin schwieriges Ross – aber eines, das seinem Reiter gleicht: stolz, schön, eigenwillig – und zu gut, um im Dreck zu stehen.'
  },
  {
    id: 'companion-eldfaxi',
    name: 'Eldfaxi',
    type: 'Reittier',
    species: 'Hest-Mischling',
    habitat: 'Mit Freya auf Wanderschaft',
    challengeRating: 1,
    size: 'Groß',
    level: 2,
    portrait: 'https://i.imgur.com/xZxmDDi.png',
    portraitCaption: 'Eldfaxi, Freyas gescheckte Hest-Mischlingsstute.',
    avatars: [
      { id: 'eldfaxi-avatar-portrait', img: 'https://i.imgur.com/O7igyaP.png', label: 'Portrait' },
      { id: 'eldfaxi-avatar-sheet', img: 'https://i.imgur.com/CB7XysD.png', label: 'Sheetbild' }
    ],
    combatProfile: {
      attributes: [
        { key: 'strength', score: 16 }, { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 15 }, { key: 'intelligence', score: 4 },
        { key: 'wisdom', score: 13 }, { key: 'charisma', score: 14 }
      ],
      hitPoints: { current: 22, maximumOverride: 22, temporary: 0, hitDie: 10 },
      armorClass: { override: 12 },
      combat: { movement: 13, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [{ attributeKey: 'constitution', proficient: true }],
      skills: [
        { id: 'eldfaxi-auftreten', name: 'Auftreten', attributeKey: 'charisma', proficiency: 'trained', bonus: 0, notes: 'Summt ein tiefes, vibrierendes Brummen im Duett mit Freyas Gesang.' }
      ],
      weapons: [
        { id: 'eldfaxi-tritt', name: 'Tritt', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Selten nötig – Eldfaxi bleibt meist gelassen.', equipped: true },
        { id: 'eldfaxi-biss', name: 'Biss', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Nur wenn wirklich nötig.', equipped: false }
      ],
      armorItems: [],
      resources: [
        { id: 'eldfaxi-duett', name: 'Duett', current: 1, maximum: 1, recovery: 'scene', notes: 'Sobald Freya zu singen beginnt, brummt Eldfaxi im Duett mit – angeblich trifft er keinen einzigen Ton.' }
      ],
      abilities: [
        { id: 'eldfaxi-freigeist', name: 'Freigeist', description: 'Fröhlich, charmant und freigeistig – Eldfaxi lässt sich von Launen kaum beeindrucken und bleibt gelassen.', active: true },
        { id: 'eldfaxi-summen', name: 'Summen im Duett', description: 'Sobald Freya zu singen beginnt, antwortet Eldfaxi mit einem tiefen, vibrierenden Brummen – besonders, wenn sie schlecht gelaunt ist. Viele Wirte schwören, in Tavernen schon Duette zwischen Frau und Pferd gehört zu haben.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true },
        { id: 'eldfaxi-hest-erbe', name: 'Hest-Erbe', description: 'Der starke Hest-Einschlag macht Eldfaxi ruhig, unbeirrbar im Tritt und kaum aus der Fassung zu bringen.', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Freya behauptet, er könne keinen einzigen Ton halten – aber sie lächelt, wenn sie es sagt.'
    },
    loot: { currency: '', notes: '', items: [] },
    notes: 'Eldfaxi begleitet Freya seit über sechs Jahren, ein zäher Mischling mit starkem Einschlag des Hest – jener aldrimarischen Kaltblutrasse, die für ihren ruhigen Geist und unbeirrbaren Tritt bekannt ist. Sein Fell ist gescheckt, die Mähne dicht und dunkel wie Sturmwolken, und seine Augen tragen dieses eigenwillige Glitzern, das nur Tiere haben, die mehr denken als man ihnen zutraut.\n\nSeine liebenswerteste Eigenart: Eldfaxi summt. Nicht wirklich wie ein Mensch, eher ein tiefes, vibrierendes Brummen, sobald Freya zu singen beginnt – besonders dann, wenn sie schlecht gelaunt ist. Viele Wirte schwören, sie hätten in Tavernen schon Duette zwischen Frau und Pferd gehört. Freya behauptet, er könne keinen einzigen Ton halten – aber sie lächelt, wenn sie es sagt.'
  },
  {
    id: 'companion-gaul',
    name: 'Gaul',
    type: 'Reittier',
    species: 'Hest',
    habitat: 'Fenrirs Stall, irgendwo unter dreihundert anderen Gäulen',
    challengeRating: 1,
    size: 'Groß',
    level: 4,
    portrait: 'https://i.imgur.com/UcjejAc.png',
    portraitCaption: 'Gaul, Fenrirs grauer, kriegsmüder Hest.',
    avatars: [
      { id: 'gaul-avatar-portrait', img: 'https://i.imgur.com/MCyuN1q.png', label: 'Portrait' },
      { id: 'gaul-avatar-sheet', img: 'https://i.imgur.com/KVqNG6l.png', label: 'Sheetbild' }
    ],
    combatProfile: {
      attributes: [
        { key: 'strength', score: 15 }, { key: 'dexterity', score: 9 },
        { key: 'constitution', score: 17 }, { key: 'intelligence', score: 3 },
        { key: 'wisdom', score: 15 }, { key: 'charisma', score: 5 }
      ],
      hitPoints: { current: 30, maximumOverride: 30, temporary: 0, hitDie: 10 },
      armorClass: { override: 11 },
      combat: { movement: 10, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [
        { attributeKey: 'constitution', proficient: true },
        { attributeKey: 'wisdom', proficient: true }
      ],
      skills: [
        { id: 'gaul-ueberleben', name: 'Überleben', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Soll angeblich im Großen Krieg gedient haben – vermutlich auf der Seite der Zuschauer.' }
      ],
      weapons: [
        { id: 'gaul-tritt', name: 'Tritt', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Halbherzig, wie fast alles an ihm.', equipped: true },
        { id: 'gaul-biss', name: 'Biss', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Kaum mehr als ein müdes Schnappen.', equipped: false }
      ],
      armorItems: [],
      resources: [
        { id: 'gaul-unermuedlich', name: 'Unermüdliche Ausdauer', current: 1, maximum: 1, recovery: 'long-rest', notes: 'Reitet nicht schnell, aber ewig – vermutlich der einzige Grund, warum Fenrir ihn noch nicht geschlachtet hat.' }
      ],
      abilities: [
        { id: 'gaul-resignierter-blick', name: 'Resignierter Blick', description: 'Kaut meist stumpf auf dem Heu, das Fenrir ihm halbherzig ins Maul stopft, und glotzt dabei so leer, als hätte er das Denken längst ausgelagert.', active: true },
        { id: 'gaul-unermuedlich-trotz-allem', name: 'Unermüdlich trotz allem', description: 'Reitet nicht schnell, aber ewig. Der resignierte Blick eines Tiers, das zu viele Winter gesehen hat und nur noch auf den Feierabend des Lebens wartet.', active: true },
        { id: 'gaul-schlimmeres-ueberlebt', name: 'Schlimmeres überlebt', description: 'Droht Fenrir, ihn auf den Spieß zu stecken, schaut Gaul nur gelangweilt – als dächte er: „Mach schon, ich hab Schlimmeres überlebt."', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Fenrir ist sich nie sicher, ob er überhaupt sein eigenes Pferd aus dem Stall geholt hat oder irgendeines der dreihundert anderen Viecher, die dort herumstehen.'
    },
    loot: { currency: '', notes: '', items: [] },
    notes: 'Gaul ist ein alter, grauer Hest, der aussieht, als wäre er schon beim Schmieden des ersten Hufeisens dabei gewesen – und dabei eingeschlafen. Fenrir nennt ihn einfach Gaul, manchmal auch Klepper oder Fetti, je nach Laune und Alkoholpegel. Einen richtigen Namen hat das Tier nie bekommen, weil Fenrir sich nie sicher ist, ob er überhaupt sein eigenes Pferd aus dem Stall geholt hat oder einfach irgendeines der dreihundert anderen Viecher, die dort herumstehen.\n\nDas Pferd selbst scheint das nicht weiter zu stören. Es hat den resignierten Blick eines Wesens, das zu viele Winter gesehen hat und nur noch darauf wartet, dass das Leben endlich Feierabend macht. Meistens kaut Gaul stumpf auf dem Heu herum, das Fenrir ihm halbherzig ins Maul stopft, und glotzt dabei so leer, als hätte er das Denken längst ausgelagert. Angeblich soll er im Großen Krieg gedient haben, aber wenn das stimmt, dann vermutlich auf der Seite der Zuschauer. Er reitet nicht schnell, aber er reitet ewig – vermutlich der einzige Grund, warum Fenrir ihn noch nicht geschlachtet hat. Und wenn Fenrir mal droht, ihn auf den Spieß zu stecken, schaut Gaul nur gelangweilt und scheint zu denken: „Mach schon, ich hab Schlimmeres überlebt."'
  },
  {
    id: 'companion-uath',
    name: 'Uath',
    type: 'Reittier',
    species: 'Rhyfel',
    habitat: 'Stets an Guineveres Seite, kampfbereit',
    challengeRating: 2,
    size: 'Groß',
    level: 2,
    portrait: 'https://i.imgur.com/8uWOM1M.png',
    portraitCaption: 'Uath, Guineveres kampfbereite Rhyfelstute.',
    avatars: [
      { id: 'uath-avatar-portrait', img: 'https://i.imgur.com/8HPNtIr.png', label: 'Portrait' },
      { id: 'uath-avatar-sheet', img: 'https://i.imgur.com/2DT70Ns.png', label: 'Sheetbild' }
    ],
    combatProfile: {
      attributes: [
        { key: 'strength', score: 16 }, { key: 'dexterity', score: 14 },
        { key: 'constitution', score: 14 }, { key: 'intelligence', score: 4 },
        { key: 'wisdom', score: 14 }, { key: 'charisma', score: 8 }
      ],
      hitPoints: { current: 24, maximumOverride: 24, temporary: 0, hitDie: 10 },
      armorClass: { override: 13 },
      combat: { movement: 14, initiativeBonus: 0, attackBonus: 0, damageBonus: 0, passivePerceptionBonus: 0 },
      savingThrows: [
        { attributeKey: 'strength', proficient: true },
        { attributeKey: 'wisdom', proficient: true }
      ],
      skills: [
        { id: 'uath-wahrnehmung', name: 'Wahrnehmung', attributeKey: 'wisdom', proficiency: 'trained', bonus: 0, notes: 'Steht kerzengerade, den Blick nach vorn gerichtet, als warte sie auf einen Befehl, der vielleicht nie kommt.' }
      ],
      weapons: [
        { id: 'uath-tritt', name: 'Tritt', damageFormula: '1d4', damageType: 'Wucht', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Ein Hufschlag mit militärischer Präzision.', equipped: true },
        { id: 'uath-biss', name: 'Biss', damageFormula: '1d4', damageType: 'Stich', attackAttribute: 'strength', proficient: true, range: 'Nahkampf · 1,5 m', properties: 'Naturwaffe', notes: 'Schnappt zu, als folge sie einem Befehl.', equipped: false }
      ],
      armorItems: [],
      resources: [
        { id: 'uath-pfeilroutine', name: 'Pfeilroutine', current: 1, maximum: 1, recovery: 'scene', notes: 'Schnappt mit fast beängstigender Routine einen Pfeil aus dem Köcher, sobald Guinevere die Hand zum Bogen hebt.' }
      ],
      abilities: [
        { id: 'uath-militaerische-disziplin', name: 'Militärische Disziplin', description: 'Steht oder marschiert, als sei sie von einem General ausgebildet worden – die Disziplin einer Legion und die Nervenstärke eines Kommandanten.', active: true },
        { id: 'uath-pfeiltraegerin', name: 'Pfeilträgerin', description: 'Führt am Sattel stets ein Bündel Pfeile. Manchmal wirkt es, als wolle Uath, dass etwas erschossen wird – als sei sie enttäuscht, wenn ihre Herrin den Abzug zögert.', usesCurrent: 1, usesMaximum: 1, recovery: 'scene', active: true },
        { id: 'uath-duldet-kaum-andere', name: 'Duldet kaum andere Tiere', description: 'Verachtet Tanor wie eine Parfümflasche mit Beinen und hält Gaul für einen Irrtum der Schöpfung – einzig Eldfaxi begegnet sie mit etwas, das man fast Respekt nennen könnte.', active: true }
      ],
      magic: { enabled: false, spells: [] },
      notes: 'Guinevere muss sie regelmäßig daran erinnern, dass Atmen kein militärischer Befehl ist – sonst würde die Stute vermutlich noch salutieren, während die Welt in Flammen aufgeht.'
    },
    loot: { currency: '', notes: '', items: [] },
    notes: 'Uath, benannt nach dem albischen Wort für Schrecken, trägt den Namen mit einer Konsequenz, die einem Soldaten zur Ehre gereicht. Diese Stute steht – oder marschiert – als wäre sie von einem General ausgebildet worden. Ihr helles Fell täuscht: hinter dem makellosen Äußeren steckt ein Tier mit der Disziplin einer Legion und der Nervenstärke eines Kommandanten. Am Sattel führt sie stets ein Bündel Pfeile, und mit fast beängstigender Routine schnappt sie einen davon mit den Zähnen, sobald Guinevere auch nur die Hand nach dem Bogen hebt.\n\nManchmal wirkt es, als wolle Uath, dass etwas erschossen wird – als sei sie enttäuscht, wenn ihre Herrin den Abzug zögert. Woher diese Mordlust stammt, weiß niemand, aber sie liegt ihr tief im Blut. Uath duldet kaum andere Tiere: Gawains Tanor verachtet sie wie eine Parfümflasche mit Beinen, Fenrirs Gaul scheint sie für einen Irrtum der Schöpfung zu halten – einzig Freyas Pferd betrachtet sie mit etwas, das man fast Respekt nennen könnte. Wenn sie nicht gerade unterwegs sind, steht Uath kerzengerade, regungslos, den Blick nach vorn gerichtet, als warte sie auf einen Befehl, der vielleicht nie kommt. Guinevere muss sie regelmäßig daran erinnern, dass Atmen kein militärischer Befehl ist – sonst würde die Stute vermutlich noch salutieren, während die Welt in Flammen aufgeht.'
  }
]);

const BUILTIN_CREATURE_IDS = new Set(BUILTIN_CREATURE_SOURCES.map(creature => creature.id));

export function getBuiltinCreatureTemplates() {
  return BUILTIN_CREATURE_SOURCES.map(source => sanitizeCreature(source));
}

export function isBuiltinCreatureId(id) {
  return BUILTIN_CREATURE_IDS.has(String(id || ''));
}
