import { hofResidentsAt } from '../../../shared/tirfelyn-hof/hof-household.mjs';
import { hofAreaFor } from '../../../shared/tirfelyn-hof/hof-areas.mjs';

const details = {
  holzfaellerlager: ['Holzfällerarbeitsplatz', 'Holzeinschlag, Entasten und Aufbereiten', 'Bauholz und Brennholz für den Hof', 'Nordwestlicher Waldrand, bei den Waldhäusern'],
  'holzfaellerhaus-ost': ['Wohnhaus für Hallvard und Rannveig', 'Holzfällerei sowie Beeren- und Kräutersammlung', 'Holzfällerlager und Vorratshaltung', 'Östlich des Holzfällerlagers; Torleifs Wohnteil ist angebaut'],
  'holzfaellerhaus-sued': ['Angebauter Wohnteil für Torleif', 'Holzfällerei gemeinsam mit Hallvard', 'Bau- und Brennholz für den Hof', 'Direkt an Hallvards und Rannveigs Haus angebaut'],
  'bedienstetenhuette-01': ['Wohnhütte für Nefydd', 'Bodenbearbeitung, Aussaat und Ernte', 'Unterstützt Gwallog auf den Feldern', 'Nördlichste der sechs Bedienstetenhütten'],
  'bedienstetenhuette-02': ['Wohnhütte für Rhufon', 'Feldarbeit, Fuhrwerk und Lieferungen', 'Wechselnde Hilfe im Familienbetrieb', 'Westliche Hütte der mittleren Hüttengruppe'],
  'bedienstetenhuette-03': ['Wohnhütte für Maldwyn', 'Fütterung, Viehtrieb und Einfriedungen', 'Unterstützt Eudaf bei der Viehhaltung', 'Mittlere Hüttengruppe, bei den Weidewegen'],
  'bedienstetenhuette-04': ['Gemeinsamer Haushalt der Müllerfamilie', 'Meirig mahlt; Gwenneth führt den Haushalt', 'Iorfin und Eifor helfen bei leichten Handgriffen', 'Größere östliche Hütte der mittleren Gruppe'],
  'bedienstetenhuette-05': ['Wohnhütte für Cynfarch', 'Hufbeschlag und eiserne Reparaturen', 'Hufschmied aus Bronhir im Dienst des Hofes', 'Südliche Hütte der Bedienstetengruppe'],
  'bedienstetenhuette-06': ['Wohnhütte für Eiluned', 'Wäsche, Reinigung und Wasserholen', 'Hilft Enid und Madrun im Hofhaushalt', 'Kleine südöstliche Bedienstetenhütte'],
  muehle: ['Hofmühle zur Getreideverarbeitung', 'Mahlen des geernteten Getreides', 'Mehl und Schrot für die Hofversorgung', 'Zwischen dem großen Acker und den Wirtschaftsgebäuden'],
  gerberhaus: ['Gerberei und einfache Lederarbeiten', 'Häute aufbereiten und Leder vorbereiten', 'Riemen und Material zur Instandhaltung', 'Östlicher Arbeitsbereich nahe dem Herrenhaus'],
  bauernherrenhaus: ['Gemeinsames Wohnhaus beider Familienzweige', 'Haushalt, Arbeitsabsprachen und Hofleitung', 'Sechzehn lebende Familienangehörige', 'Herrenhaus im südöstlichen Hofkern'],
  hufschmiede: ['Beschlagplatz und offene Hofschmiede', 'Pferde beschlagen und Eisenarbeiten reparieren', 'Beschläge und instand gehaltene Hofgeräte', 'Östlicher Arbeitsbereich, nordwestlich des Gestüts'],
  imkerei: ['Bienenhaltung des Familienhofs', 'Bienen versorgen und Honig gewinnen', 'Honig und Wachs für den Haushalt', 'Nordöstlicher Hofrand bei den Bienenstöcken'],
  gestuet: ['Pferdestall und eingefriedeter Auslauf', 'Hofpferde, Stall und Futter versorgen', 'Hufbeschlag durch Cynfarch', 'Östlicher Hofrand, beim Futterlager'],
  raeucherhaus: ['Haltbarmachen der Hoferzeugnisse', 'Salzen, Räuchern und sorgfältiges Lagern', 'Vorräte für arbeitsreiche und kalte Wochen', 'Bei Kornspeichern und Wirtschaftsgebäuden']
};

export function hofPinTable(poi) {
  const info = details[poi.key];
  if (!info) throw Error(`Pintabelle fehlt: ${poi.key}`);
  return [
    { k: poi.residenceId ? 'Bewohner' : 'Zuständig', v: hofResidentsAt(poi).map(person => person.name).join(', ') || 'Familie Tirfelyn' },
    { k: 'Eigentümer', v: 'Familie Tirfelyn' },
    { k: 'Nutzung', v: info[0] }, { k: 'Tätigkeiten', v: info[1] },
    { k: poi.residenceId ? 'Hofbezug' : 'Versorgung', v: info[2] },
    { k: 'Lage', v: info[3] }, { k: 'Hofbereich', v: hofAreaFor(poi).title }
  ];
}
