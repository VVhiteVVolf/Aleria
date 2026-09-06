import { ARMOR_ROUTINE } from '../armor-routine.js';
import { HUSKARL_FORM_IDS as F } from '../../combat-styles/huskarl/huskarl-forms.js';
import { getSkjaldrBerserkTiers } from './skjaldr-berserk-progression.js';

export const ALDRIMAR_CLASS_IDS = Object.freeze(['hird-maid', 'skjoldr', 'thegnar', 'skeidr', 'skjaldr', 'skytte', 'skalde']);
const feature = (id, name, minimumLevel, description) => ({ id, name, minimumLevel, description, status: 'draft' });
const configs = [
  { classId: 'hird-maid', name: 'Hird/Maid', focus: 'Schildwall, Speer, Axt und Schwert', title: 'Wehrhafte Clansleute Aldrimars',
    primary: ['Speer', 'Axt', 'Schwert', 'Rundschild'], secondary: [],
    note: 'Praktische Ausbildung für Hirdmann und Schildmaid. Schildlose Angriffe bleiben möglich; Schildmanöver verlangen einen geführten Schild.',
    bands: { foundation: [1, 2, 3, 4, 5], militia: [6, 10, 12, 15] },
    features: [feature('hird-clan', 'Schulter an Schulter', 1, '+1 auf KRF-Proben gegen Umwerfen, wenn ein kampffähiger Verbündeter in höchstens 2 m steht.'),
      feature('hird-wacht', 'Geübte Hofwacht', 10, 'Schulter an Schulter steigt auf +2 und ersetzt +1; keine automatische Schildwall-RK.')],
    pending: ['Weiterentwicklung Stufe 16–20; keine automatische Erhebung in den Huskarlstand'] },
  { classId: 'skjoldr', name: 'Skjoldr', focus: 'Vielseitiger Frontkämpfer mit Schild oder freien Waffenwegen', title: 'Das Rückgrat der Huskarle',
    primary: ['Schwert', 'Axt', 'Streitkolben'], secondary: ['Schild', 'Langschwert', 'Zwei Waffen'],
    note: 'Schild, Zweihandwaffe und zwei Einhandwaffen sind alternative Führungen. Nur tatsächlich freie Hände und aktive Waffen zählen.',
    features: [feature('skjoldr-stand', 'Geschulter Stand', 1, '+1 auf KRF-Rettungswürfe gegen Umwerfen. Ein vorhandener höherer Standbonus ersetzt diesen Wert.'),
      feature('skjoldr-kante', 'Saubere Kantenarbeit', 6, 'Einmal pro eigenem Beitrag +1 Schaden auf einen Huskarl-Nahkampftreffer mit Schwert, Axt oder Streitkolben.'),
      feature('skjoldr-hut', 'Erfahrene Hut', 15, 'Eine schadenslose Schutztechnik darf einmal pro Beitrag einen Gefährten in 2 m statt des Anwenders schützen. Nicht zusätzlich zu Tragender Front stapeln.')], pending: [] },
  { classId: 'thegnar', name: 'Thegnar', focus: 'Lanze, Reiterwaffen und eigenständiger Kampf zu Fuß', title: 'Berittener Huskarl · Garde des Thanen',
    primary: ['Lanze', 'Axt', 'Streitkolben', 'Schwert'], secondary: ['Keule', 'Sax', 'Schild'],
    note: 'Anritte erfordern ein tatsächlich geführtes Hest-Ross und mindestens 3 m freien Anlauf. Abgesessene Waffenfolgen bleiben verfügbar.',
    features: [feature('thegnar-hest', 'Hest-Vertrautheit', 1, '+2 auf passende Reitproben; kein kostenloser Pferdeangriff.'),
      feature('thegnar-lanze', 'Geführter Anritt', 6, '+1 Angriff bei ausdrücklich berittenen Huskarl-Lanzentechniken nach gültigem Anritt.'),
      feature('thegnar-weg', 'Wächter langer Wege', 15, '+2 auf passende Proben zur Orientierung und Versorgung eines Reittiers; manuell und nur bei einem solchen Wurf.')],
    pending: ['Svaldr als spätere Verbindung mit dem Skalden', 'Ridendr als spätere Verbindung mit dem Skytte', 'Ressourcen und Bewegung von Ross und Reiter nicht doppelt vergeben'] },
  { classId: 'skeidr', name: 'Skeidr', focus: 'Enteraxt, Hammer, Streitkolben und kurze Seitenwaffen', title: 'Huskarl zur See',
    primary: ['Enteraxt', 'Hammer', 'Streitkolben'], secondary: ['Sax', 'Kurzschwert', 'Wurfspeer', 'Wurfaxt'],
    note: 'Kurze Hiebe und sichere Schritte auf Deck. Wurfwaffen müssen vorhanden sein; Seile, Haken und Schiffsschäden werden gesondert ausgewertet.',
    features: [feature('skeidr-deck', 'Seefester Stand', 1, '+2 auf passende Balanceproben an Deck; kein allgemeiner RK-Bonus.'),
      feature('skeidr-enter', 'Sicherer Entergriff', 6, 'Einmal pro eigenem Beitrag +1 Angriff mit einer Huskarl-Entertechnik, wenn zuvor ein tatsächliches Enterhindernis überwunden wurde.'),
      feature('skeidr-reling', 'Wacht der Reling', 15, '+2 auf passende KRF-Proben gegen Verdrängen an Deck. Niemals automatisches Überbordwerfen als Gegenwirkung.')],
    pending: ['Schiffssystem, Tauführung und Beschädigung von Bauteilen'] },
  { classId: 'skjaldr', name: 'Skjaldr', focus: 'Zwei Äxte, lange Streitaxt und kontrollierter Berserkergang', title: 'Der Schildbeißer Aldrimars',
    primary: ['Zwei Äxte', 'Lange Streitaxt'], secondary: ['Schwert', 'Keule', 'Schild'],
    note: 'Zwei aktive Äxte ermöglichen die Doppelaxtfolgen. Ein Technikwurf verdoppelt weder den Waffenwürfel noch Attribut- oder Berserkerboni.',
    bands: { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 17, 20] },
    features: [feature('skjaldr-disziplin', 'Gezähmte Wildheit', 1, 'Stufe 1–5 trainiert der Schildbeißer Waffentechnik und Selbstbeherrschung. Noch kein Berserkermodus oder Rasereibonus.'),
      ...getSkjaldrBerserkTiers().map(tier => feature(`skjaldr-berserk-${tier.minimumLevel}`, tier.name, tier.minimumLevel, tier.description))],
    pending: ['Überführung vorhandener persönlicher Berserkerfähigkeiten in diese gemeinsame Staffel bei der Figurenintegration'] },
  { classId: 'skytte', name: 'Skytte', focus: 'Lang- und Jagdbogen, Speer und verlässliche Nahkampfwaffen', title: 'Schütze und Grenzwächter der Wildnis',
    primary: ['Langbogen', 'Jagdbogen', 'Speer'], secondary: ['Kurzbogen', 'Schwert', 'Axt', 'Sax'],
    note: 'Kurzbogen bleibt als vorhandene Startausrüstung nutzbar. Grundausbildung und jeder Expertenpfad enthalten echte Nahkampfangriffe; keine reine Fernkampfauswahl erzwingen.',
    bands: { foundation: [1, 3, 4, 6], advanced: [7, 8], expert: [9, 13, 17, 20] },
    features: [feature('skytte-auge', 'Auge des Jägers', 1, '+1 Angriff mit einem geführten Bogen; kein Bonus auf Nahkampf.'),
      feature('skytte-grenze', 'Wächter beider Distanzen', 6, 'Die Grundauswahl soll neben einem Schuss den Speerstoß und eine Seitenwaffenfolge enthalten, soweit passende Waffen getragen werden.'),
      feature('skytte-faehrte', 'Vertraute Fährte', 15, '+2 auf passende Fährtenleseproben. Begleittiere wirken nur mit, wenn anwesend und separat geführt.')],
    pending: ['Begleittier-Ausbildung und Spezialmunition'] },
  { classId: 'skalde', name: 'Skalde', focus: 'Kampfbarde mit Stimme, Instrument, Schwert und Schild', title: 'Stimme der Halle · nach Freyas bestehendem Aufbau',
    primary: ['Stimme', 'Laute oder anderes Instrument'], secondary: ['Schwert', 'Sax', 'Schild'],
    note: 'Freyas Referenz führt Laute 1W4, Schwert 1W8 und Schildstoß 1W4. Das sind Ausrüstungswerte ihres Bogens, keine universellen Waffenboni des Skalden.',
    bands: {}, authoredThroughLevel: 5,
    features: [feature('skalde-stimme', 'Stimme und Instrument', 1, 'Skaldische Magie verwendet Charisma. Begonnen wird mit Spottvers und Magischer Hand; frühe Lernreihenfolge als Vorschlag.'),
      feature('skalde-trugbilder', 'Licht und Trugbild', 2, 'Kleine Illusion und Licht ergänzen das Repertoire. Beide sind Nutzzauber ohne automatischen Kampfschaden.'),
      feature('skalde-gemuet', 'Verse des Gemüts', 3, 'Person bezaubern und Person beruhigen entsprechen Freyas Grad-I-Liedern. Sonderwirkungen bleiben erzählerisch auszuwerten.'),
      feature('skalde-zorn', 'Aufpeitschender Vers', 4, 'Person wütend machen folgt Freyas Grad-II-Lied; keine automatische KI-Steuerung des Ziels.'),
      feature('skalde-freya', 'Freyas Ausbildungsstand', 5, 'Stille und der erschöpfende Arkane Schrei vervollständigen den vorhandenen Stand. Ab Stufe 6 sind neue Lieder, Boni und Zauberentwicklung ausdrücklich offen.')],
    pending: ['Skalde Stufe 6–20', 'Verbindliche Mehrklassenregeln und gemeinsame Zauberressourcen', 'Allgemeine Fassung des Arkanen Schreis statt Freyas persönlicher Mana-Festzahl'] }
];

function createDefinition(config) {
  const militia = config.classId === 'hird-maid';
  const skald = config.classId === 'skalde';
  const bands = config.bands || { foundation: [1, 2, 3, 4, 5, 6], advanced: [7, 8], expert: [9, 11, 13, 15, 17, 20] };
  const slots = Object.entries(bands).flatMap(([band, levels]) => levels.map((level, index) => ({ id: `${band}-${index + 1}`, band, level })));
  const phases = skald
    ? [{ id: 'foundation', name: 'Grundrepertoire nach Freya', minimumLevel: 1, maximumLevel: 5 }, { id: 'open', name: 'Weitere Skaldenausbildung offen', minimumLevel: 6, maximumLevel: 20, kind: 'pending' }]
    : [{ id: 'foundation', name: 'Stand des Schildes', minimumLevel: 1, maximumLevel: 6 },
      ...(militia ? [{ id: 'militia', name: 'Hirdwacht', minimumLevel: 6, maximumLevel: 15 }, { id: 'open', name: 'Weitere Klassenentwicklung', minimumLevel: 16, maximumLevel: 20, kind: 'pending' }]
        : [{ id: 'advanced', name: 'Schritt des Huskarls', minimumLevel: 7, maximumLevel: 8 }, { id: 'expert', name: 'Schildwall oder Vorstoß', minimumLevel: 9, maximumLevel: 20, kind: 'path-selection' }])];
  return { schemaVersion: 2, id: `aldrimar-${config.classId}`, classId: config.classId, name: config.name,
    templateId: config.classId, cultureId: 'aldrimar', culture: 'Aldrimar', cultures: ['Aldrimar'], status: 'draft',
    pagePath: `Klassenordner/Aldrimar/${config.classId}/index.html`, minimumLevel: 1, maximumLevel: 20, authoredThroughLevel: config.authoredThroughLevel || 20,
    affiliation: config.title, focus: config.focus, trainingFocus: config.title, trainingPhases: phases,
    formIds: skald ? [] : militia ? [F.foundation, F.militia] : [F.foundation, F.advanced, F.wall, F.advance],
    pathSelection: { minimumLevel: skald ? null : militia ? 6 : 9, multiplePathsAllowed: !skald && !militia,
      sharedTechniqueBudget: true, firstSelectionRequired: !skald && !militia, firstSelectionCost: 0, additionalSelectionCost: 1,
      allowedFormIds: skald ? [] : militia ? [F.militia] : [F.wall, F.advance],
      rule: skald ? 'Grundrepertoire bis Stufe 5; die spätere Verbindung mit einer zweiten Klasse bleibt offen.' : militia ? 'Auf die Grundausbildung folgt die Hirdwacht bis Stufe 15.' : 'Ab Stufe 9 erster Expertenpfad frei; ein weiterer Pfad kostet einen Experten-Attackenslot.' },
    techniqueBudget: { total: slots.length, slots, bands: Object.fromEntries(Object.entries(bands).map(([band, levels]) => [band, { levels, count: levels.length }])) },
    techniquePool: { totalSlots: slots.length, description: skald ? 'Acht vorhandene Lieder und ein besonderer Schrei als Referenz, keine zusätzlichen Waffenattackenslots.' : `${slots.length} erlernbare Optionen aus einem gemeinsamen Budget. Kataloggröße und Zahl erlernter Attacken sind verschieden.` },
    weaponTraining: { primary: config.primary, secondary: config.secondary, note: config.note }, weaponVariants: [], trainingBranches: [],
    classFeatures: [...config.features, ...(skald ? [] : [ARMOR_ROUTINE])], combatStyleGrants: [],
    pendingFeatures: config.pending.map(name => ({ name, minimumLevel: null, status: 'pending' })),
    ...(skald ? { multiclass: { status: 'planned', role: 'complementary', sharedActionPools: true, additionalHitPointPool: false, additionalManaPool: false } } : {}) };
}
const definitions = configs.map(createDefinition);
export function getAldrimarClassDefinition(id) {
  const aliases = { schildbeisser: 'skjaldr', schildbeißer: 'skjaldr', skaldin: 'skalde', hirdmann: 'hird-maid', schildmaid: 'hird-maid', thegn: 'thegnar' };
  const key = String(id || '').toLowerCase();
  const match = definitions.find(entry => [entry.id, entry.classId].includes(aliases[key] || key));
  return match ? structuredClone(match) : null;
}
export function getAldrimarClassDefinitions() { return structuredClone(definitions); }
