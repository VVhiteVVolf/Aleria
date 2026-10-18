import { HARBOR_ART } from './harbor-people.mjs';
const service = (title, description, scope, terms) => ({ title, icon: `${HARBOR_ART}/scenes/lagerhalle.png`, description: `<p>${description}</p>`, clients: 'Kaufleute der Klingenden Münze und vertraglich angenommene Lieferanten', scope, terms });

export function buildGwregysduServices() {
  return { schemaVersion: 1, commentThreadKey: 'gwregysdu-dienste', pageTitle: 'Vier Lagerhäuser · Dienste und Vertrieb', guildServicesPage: true,
    image: `${HARBOR_ART}/scenes/lagerhalle.png`, imageWidth: 30, imageTall: true,
    guildServices: {
      title: 'Annehmen, verwahren und weitergeben',
      introduction: '<p>Die vier Häuser liegen im großen Hafenhandelsposten der Klingenden Münze. Sie gehören den Gwregysdu; andere Parteien unterhalten dort eigene Flächen und Geschäfte. Das Haus übernimmt Fracht seiner Gildenpartner sowie vereinbarte Lieferungen aus dem Umland. Es führt keinen allgemeinen Ladenverkauf.</p>',
      services: [
        service('Trockenlagerung', 'Verwahrung von Holz, Fellen, Pelzen, Ballen und verpackten Handelswaren auf geeigneten Lagerflächen. Fremdes Eigentum wird getrennt verzeichnet.', 'Nach Platzbedarf, Warenart und Lagerdauer', 'Lagergeld vor Einlagerung vereinbaren; Bestandsvermerk und Quittung werden ausgefertigt.'),
        service('Schwerlast und gesicherte Fracht', 'Bodennahe Lagerplätze für Metalle und Erzgebinde; verschlossener Bereich für besonders wertvolle oder versiegelte Sendungen.', 'Nach Gewicht, Platz und Sicherungsbedarf', 'Tragfähigkeit und Zugang werden vorher geprüft. Gefährliche oder unpassend verpackte Ladung wird abgewiesen.'),
        service('Annahme, Wiegen und Umschlag', 'Abgleich von Warenzeichen, Gebinden und Lieferschreiben; Wiegen, Entladen und Zusammenstellen ausgehender Lieferungen.', 'Einzelne Lieferung oder laufender Rahmenvertrag', 'Wiege- und Arbeitsgeld nach Umfang. Beschädigungen und gebrochene Siegel werden bei Annahme vermerkt.'),
        service('Vertrieb im Auftrag', 'Die Gwregysdu suchen Abnehmer, teilen größere Posten und rechnen den Erlös mit dem Eigentümer ab. Die Ware bleibt bis zum Verkauf dessen Besitz.', 'Vereinbarte Güter der Klingenden Münze und ihrer Lieferpartner', 'Verkaufsanteil, Mindestpreis, Zahlungsziel und Lagerkosten werden schriftlich vereinbart.'),
        service('Fracht und Auslieferung', 'Vermittlung von Schiffsraum und Fuhrwerken; Bündelung passender Lieferungen und Übergabe gegen Empfangsvermerk.', 'Handelsposten, Stadt und vereinbarte Fernroute, darunter Tirnara und Venalys', 'Fracht, Zölle und etwaiges Geleit werden gesondert ausgewiesen. Die Familie beansprucht weder den ganzen Hafen noch eine eigene Flotte.'),
        service('Verbundene Lieferungen aus dem Umland', 'Holz-, Jagd-, Pferde- und Bergbaukontakte werden zu regelmäßigen Lieferungen zusammengeführt. Lebende Pferde bleiben bis zur Übergabe auf geeigneten Höfen und Stellplätzen.', 'Nach Herkunft, Termin und Abnahmevertrag', 'Ein Liefervertrag oder eine Ehe allein überträgt kein Eigentum an Hof, Grube oder Zucht. Die Ceffyl-Zucht der Bradrhith gehört nicht zum Besitz der Gwregysdu.')
      ],
      process: '<p>Am Kaihof werden Eigentümer, Herkunft, Warenart und Empfänger aufgenommen. Nach Prüfung von Gewicht, Zustand und Siegeln erhält die Fracht einen Lagerplatz. Ausgabe und Verkauf erfolgen nur mit vereinbarter Freigabe; Lagergeld, Arbeitslohn, Verkaufsanteil und fremde Frachtkosten bleiben getrennt nachvollziehbar.</p>',
      conditions: '<p>Die Einnahmen stammen aus Lagergeld, Umschlag, Vertriebsanteilen und ergänzend eigenen Warengeschäften. Bestehende Hallen, gewachsene Verträge und wiederkehrende Gildenaufträge bilden das wirtschaftliche Fundament. Aufträge können angezahlt werden; große eigene Einkäufe binden Kapital und tragen Verlustgefahr. Die Wachleute der Roten Kompanie schützen die angemieteten Dienste und den Hausbesitz im Rahmen ihres Vertrags.</p>',
      footer: 'Haus Gwregysdu · Vier Lagerhäuser im Hafenhandelsposten der Klingenden Münze'
    } };
}
