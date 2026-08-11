// Vorgefertigtes Arsenal an Feuerzaubern (Grad 1-5, zwei je Grad) als eingebauter
// Charakterbogen-Archiv-Inhalt. Jeder Eintrag ist im exakten Datenformat von sanitizeSpell()
// (combat-profile-model.js) gehalten, damit er unveraendert in profile.magic.spells landet,
// sobald ihn ein Spieler ueber "+ Zauber" -> Archiv aus dem Charakterbogen uebernimmt.
// manaCost/slotResourceId werden dort ohnehin aus level neu berechnet, deshalb hier bewusst 0/''.
// Icons bleiben grossteils leer: getAutomaticEntryIconSource (combat-entry-icons.js) erkennt
// "Feuer"/damageType automatisch und waehlt OB-icon-Fire.png. Die zwei Sonderfaelle
// (Beschwoerung, Abwehr) bekommen ein passenderes eigenes Oblivion-Icon.

// Relativ zur AleriaAlmanach.html-Seite (Konvention aus bestehenden Freitext-Icon-Feldern, siehe
// z.B. Biographie-Fertigkeiten-Icons "../IconOrdner/Traits Icon/..."), NICHT relativ zu einem Modul -
// entry.icon wird von getCombatEntryIconPresentation() unveraendert als <img src> uebernommen.
const OBLIVION_ICON_ROOT = '../IconOrdner/Zauber Icons/Oblivion Style';

function fireSpell(overrides) {
  return {
    school: 'Zerstörung',
    icon: '',
    manaCost: 0,
    slotResourceId: '',
    slotCost: 1,
    presentationKind: 'spell',
    damageType: 'Feuer',
    saveAttribute: 'dexterity',
    halfDamageOnSave: false,
    concentration: false,
    channelComments: 0,
    upcast: { enabled: true, formulaPerLevel: '', amountPerLevel: 0, maximumLevel: 10 },
    auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    prepared: true,
    tags: 'Zerstörung · Feuer',
    requirements: '',
    aiInstructions: '',
    ...overrides
  };
}

function actionCost(id, activationType = 'action') {
  const label = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion' }[activationType] || 'Aktion';
  return [{ id: `${id}-cost`, resourceId: activationType, name: label, amount: 1, scope: 'comment' }];
}

export const FIRE_SPELL_ARSENAL = Object.freeze([
  fireSpell({
    id: 'feuerpfeil',
    name: 'Feuerpfeil',
    level: 1,
    activationType: 'action',
    resolutionType: 'spell-attack',
    range: '18 m',
    duration: 'Sofort',
    rollFormula: '2d10',
    description: 'Ein gebündelter Pfeil aus Flammen schießt aus der ausgestreckten Hand und entzündet alles, was er trifft.',
    upcast: { enabled: true, formulaPerLevel: '1d10', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('feuerpfeil'),
    aiInstructions: 'Reiner Fernkampf-Zauberangriff auf ein Ziel, kein Rettungswurf.'
  }),
  fireSpell({
    id: 'brennende-haende',
    name: 'Brennende Hände',
    level: 1,
    activationType: 'action',
    resolutionType: 'saving-throw',
    saveAttribute: 'dexterity',
    halfDamageOnSave: true,
    range: 'Kegel, 4,5 m',
    duration: 'Sofort',
    rollFormula: '3d6',
    description: 'Die gespreizten Finger entfesseln einen Fächer aus Flammen, der alles im Kegel vor dem Zaubernden erfasst.',
    upcast: { enabled: true, formulaPerLevel: '1d6', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('brennende-haende'),
    aiInstructions: 'Trifft alle Kreaturen im 4,5-m-Kegel gleichzeitig, nicht nur ein Ziel.'
  }),
  fireSpell({
    id: 'glutgeschoss',
    name: 'Glutgeschoss',
    level: 2,
    activationType: 'action',
    resolutionType: 'spell-attack',
    range: '24 m',
    duration: 'Sofort',
    rollFormula: '4d10',
    description: 'Eine verdichtete Kugel weißglühender Glut rast auf ein Ziel zu und explodiert beim Einschlag in einem kurzen Feuerstoß.',
    upcast: { enabled: true, formulaPerLevel: '1d10', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('glutgeschoss'),
    aiInstructions: 'Einzelziel-Zauberangriff, spürbar stärker als Feuerpfeil.'
  }),
  fireSpell({
    id: 'flammenring',
    name: 'Flammenring',
    level: 2,
    activationType: 'action',
    resolutionType: 'saving-throw',
    saveAttribute: 'dexterity',
    halfDamageOnSave: true,
    range: 'Selbst, Radius 3 m',
    duration: 'Sofort',
    rollFormula: '4d8',
    description: 'Ein greller Feuerring bricht schlagartig aus dem Zaubernden hervor und breitet sich in alle Richtungen aus.',
    upcast: { enabled: true, formulaPerLevel: '1d8', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('flammenring'),
    aiInstructions: 'Trifft alle Kreaturen im Radius um den Zaubernden, Verbündete eingeschlossen, sofern nicht ausdrücklich ausgenommen.'
  }),
  fireSpell({
    id: 'feuerball',
    name: 'Feuerball',
    level: 3,
    activationType: 'action',
    resolutionType: 'saving-throw',
    saveAttribute: 'dexterity',
    halfDamageOnSave: true,
    range: '18 m, Kugel Radius 4 m',
    duration: 'Sofort',
    rollFormula: '8d6',
    description: 'Ein heller Lichtstreif schießt zu einem gewählten Punkt in Reichweite und detoniert dort zu einer Feuerkugel, die alles ringsum versengt.',
    upcast: { enabled: true, formulaPerLevel: '1d6', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('feuerball'),
    aiInstructions: 'Klassischer AoE-Zauber mit Explosionsradius; entzündet dünne, brennbare Materialien in der Nähe.'
  }),
  fireSpell({
    id: 'feuerwand',
    name: 'Feuerwand',
    level: 3,
    activationType: 'action',
    resolutionType: 'saving-throw',
    saveAttribute: 'dexterity',
    halfDamageOnSave: true,
    range: '36 m, Wand bis 18 m lang',
    duration: 'Konzentration, bis zu 1 Minute',
    concentration: true,
    rollFormula: '5d8',
    description: 'Eine undurchdringliche Wand aus Feuer erhebt sich am gewählten Ort und versperrt Gegnern den Weg, solange die Konzentration hält.',
    upcast: { enabled: true, formulaPerLevel: '1d8', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('feuerwand'),
    aiInstructions: 'Schaden gilt für Kreaturen, die die Wand durchqueren oder ihren Zug darin beginnen, nicht nur beim Wirken.'
  }),
  fireSpell({
    id: 'inferno-strahl',
    name: 'Inferno-Strahl',
    level: 4,
    activationType: 'action',
    resolutionType: 'spell-attack',
    range: '36 m',
    duration: 'Sofort',
    rollFormula: '8d10',
    description: 'Ein schmaler, alles versengender Feuerstrahl bricht mit ohrenbetäubendem Fauchen aus der ausgestreckten Hand hervor.',
    upcast: { enabled: true, formulaPerLevel: '1d10', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('inferno-strahl'),
    aiInstructions: 'Einzelziel-Zauberangriff auf große Reichweite, deutlich verlässlicherer Schaden als vergleichbare Flächenzauber gleichen Grades.'
  }),
  fireSpell({
    id: 'flammendiener-beschwoeren',
    name: 'Flammendiener beschwören',
    level: 4,
    icon: `${OBLIVION_ICON_ROOT}/OB-icon-Summonflameatronach.png`,
    activationType: 'action',
    resolutionType: 'automatic',
    range: 'Nahbereich, 9 m',
    duration: 'Konzentration, bis zu 1 Stunde',
    concentration: true,
    rollFormula: '',
    upcast: { enabled: false, formulaPerLevel: '', amountPerLevel: 0, maximumLevel: 10 },
    description: 'Aus einem Riss lodernder Hitze tritt ein Flammendiener, der dem Rufenden treu kämpft, bis der Zauber endet oder der Diener zerstört wird.',
    costs: actionCost('flammendiener-beschwoeren'),
    aiInstructions: 'Kein direkter Schadenswurf des Zaubers selbst - der beschworene Flammendiener kämpft eigenständig mit seinen eigenen Werten (separat zu führen). Automatische Wirkung, kein Angriffs- oder Rettungswurf zum Beschwören nötig.'
  }),
  fireSpell({
    id: 'feuerbrunst',
    name: 'Feuerbrunst',
    level: 5,
    activationType: 'action',
    resolutionType: 'saving-throw',
    saveAttribute: 'dexterity',
    halfDamageOnSave: true,
    range: '18 m, Zylinder Radius 3 m / Höhe 12 m',
    duration: 'Sofort',
    rollFormula: '10d8',
    description: 'Eine Feuersäule kracht aus dem Himmel herab und verbrennt alles innerhalb des betroffenen Bereichs bis auf die Grundmauern.',
    upcast: { enabled: true, formulaPerLevel: '1d8', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('feuerbrunst'),
    aiInstructions: 'Wirkt aus der Luft senkrecht auf den Zielpunkt herab, ideal gegen Gruppen oder befestigte Stellungen.'
  }),
  fireSpell({
    id: 'flammenschild-der-vergeltung',
    name: 'Flammenschild der Vergeltung',
    level: 5,
    icon: `${OBLIVION_ICON_ROOT}/OB-icon-Fireshield.png`,
    activationType: 'reaction',
    resolutionType: 'automatic',
    range: 'Selbst',
    duration: 'Sofort',
    rollFormula: '6d6',
    description: 'Wird der Zaubernde im Nahkampf getroffen, hüllt ihn ein Feuerschild ein und schlägt mit peitschenden Flammen gegen den Angreifer zurück.',
    upcast: { enabled: true, formulaPerLevel: '1d6', amountPerLevel: 0, maximumLevel: 10 },
    costs: actionCost('flammenschild-der-vergeltung', 'reaction'),
    aiInstructions: 'Als Reaktion auf einen erlittenen Nahkampftreffer gewirkt, nicht proaktiv im eigenen Zug. Trifft automatisch den Angreifer zurück, kein zusätzlicher Wurf nötig.'
  })
]);
