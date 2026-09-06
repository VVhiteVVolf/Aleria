export const HUSKARL_FORM_IDS = Object.freeze({ foundation: 'huskarl-schildgrund', advanced: 'huskarl-fester-schritt',
  wall: 'huskarl-schildwall', advance: 'huskarl-vorstoss', militia: 'huskarl-hirdwacht' });
const F = HUSKARL_FORM_IDS;
const feature = (id, name, minimumLevel, description) => ({ id, name, minimumLevel, description, status: 'draft', stacking: 'highest-per-style' });
const forms = [
  { id: F.foundation, shortName: 'Stand des Schildes', number: 'I', kind: 'foundation', minimumLevel: 1, maximumTrainingLevel: 6,
    description: 'Stand, einfache Waffenschläge, Abwehr und kurze Bindungen. Schildtechniken benötigen einen tatsächlich geführten Schild; die übrigen Waffenwege bleiben frei.' },
  { id: F.advanced, shortName: 'Schritt des Huskarls', number: 'II', kind: 'advanced', minimumLevel: 7, maximumTrainingLevel: 8,
    description: 'Zwei verbindende Lektionen für die Haupt- und Nebenwaffen der Klasse.' },
  { id: F.wall, shortName: 'Pfad des Schildwalls', kind: 'path', minimumLevel: 9, maximumTrainingLevel: 20,
    description: 'Schutz, Bindung und Zusammenhalt. Der Pfad umfasst auch Abwehr ohne Schild; ausdrücklich benannte Schildmanöver bleiben an ihn gebunden.',
    features: [feature('huskarl-wall-9', 'Geschlossene Reihen', 9, '+1 auf Rettungswürfe gegen Umwerfen, solange ein kampffähiger Verbündeter höchstens 2 m entfernt steht.'),
      feature('huskarl-wall-13', 'Stand der Gefährten', 13, 'Der Bonus gegen Umwerfen steigt auf +2 und ersetzt +1. Der Anwender und der Verbündete müssen bei Bewusstsein sein.'),
      feature('huskarl-wall-17', 'Tragende Front', 17, 'Einmal pro eigenem Beitrag darf eine schadenslose Schutztechnik statt des Anwenders einen Verbündeten in 2 m erreichen. Keine zusätzlichen Ziele oder Aktionen.')] },
  { id: F.advance, shortName: 'Pfad des Vorstoßes', kind: 'path', minimumLevel: 9, maximumTrainingLevel: 20,
    description: 'Druck, Flankenwechsel und kurze Durchbrüche. Kein Treffer zerstört ohne gesonderte Auswertung eine Rüstung, einen Schild oder ein Schiffsteil.',
    features: [feature('huskarl-advance-9', 'Festes Ziel', 9, '+1 auf ausdrücklich geforderte KRF-Proben zum Schieben eines Gegners; kein allgemeiner Angriffsbonus.'),
      feature('huskarl-advance-13', 'Geübter Durchbruch', 13, 'Festes Ziel steigt auf +2 und ersetzt den bisherigen Bonus. Größen- und Standvoraussetzungen gelten weiter.'),
      feature('huskarl-advance-17', 'Raumgewinn', 17, 'Eine in einer Technik erlaubte eigene Bewegung darf einmal pro Beitrag 1 m weiter reichen; sie bleibt innerhalb der vorhandenen Bewegung.')] },
  { id: F.militia, shortName: 'Hirdwacht', kind: 'path', minimumLevel: 6, maximumTrainingLevel: 15,
    description: 'Praktische Fortsetzung für Hirdmänner und Schildmaiden: Höfe sichern, Lücken schließen und gemeinsam standhalten. Keine automatische Erhebung zum Huskarl.' }
].map(form => ({ ...form, name: form.shortName, features: form.features || [] }));
export function getHuskarlForms() { return structuredClone(forms); }
