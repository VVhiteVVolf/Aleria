const icon = name => `../IconOrdner/Etablissement Icons/${name}.PNG`;
const service = (title, image, description, clients, scope, terms) => ({
  title, icon: image, description: `<p>${description}</p>`, clients, scope, terms
});

export function buildHonigtoertchenServices() {
  // This page deliberately has no scene/header image. Every card uses an icon.
  return {
    schemaVersion: 1, commentThreadKey: 'honigtoertchen-dienstleistungen',
    pageTitle: 'Sonderwünsche · Hochzeiten & Festaufträge', guildServicesPage: true,
    guildServices: {
      title: 'Für einen Tag, an den man sich erinnert', subtitle: 'Torten, Festgebäck und besondere Wünsche',
      introduction: '<p>Ein Wunsch beginnt mit einem Gespräch am Tresen: Was wird gefeiert, wie viele Menschen kommen, wann wird aufgetragen? Tewdwr und Anest besprechen Geschmack, Ausführung und den Weg zur Festtafel. Afanen nimmt die Wünsche im Verkauf auf, Morfudd hält die finanzielle Vereinbarung fest. Die fertigen Hausangebote stehen im Güterregister; die folgenden Dienste passen sie an einen besonderen Anlass an.</p><p>Die genannten Zuschläge sind Arbeitsansätze. Backwaren selbst, aufwendige Zutaten, besondere Gefäße und zusätzliche Wege werden nur dann mitberechnet, wenn sie ausdrücklich zum angenommenen Auftrag gehören. Vor Beginn stehen Gesamtsumme, Menge und Termin im Auftragsbuch.</p>',
      services: [
        service('Die eigene Hochzeitstorte', '../IconOrdner/CK3 icons alt/Activity_wedding.png',
          'Gemeinsam werden Zahl und Größe der Etagen, Geschmacksrichtung, Füllung und Anschnitt besprochen. Einfache Blüten, Bordüren oder die Farben des Paares werden aufeinander abgestimmt. Die Hausrezeptur bleibt Familienwissen; auch ein kleiner Hochzeitstisch erhält eine sorgfältig passende Torte.',
          'Brautpaar und ausrichtende Familie', 'Ab 12 bis etwa 80 Portionen nach Ofen- und Transportprüfung', 'Mindestens 14 Tage Vorlauf für individuelle Entwürfe; Gebäckpreis nach Portionen, Entwurfsarbeit ab 24 Kupfertaler.'),
        service('Wappen, Initialen & Zierarbeit', icon('Wachssiegel'),
          'Ein einfaches Hauszeichen, die Initialen zweier Menschen oder eine kleine florale Bordüre werden nach einer klaren Vorlage in essbarer Form angelegt. Vor der Zusage werden Farben, Umfang und erkennbare Einzelheiten geprüft; feine Schriftzüge brauchen ausreichend Platz.',
          'Familien, Bürgerhäuser und Festgesellschaften', 'Eine abgestimmte Vorlage; einfache zwei- bis dreifarbige Gestaltung', 'Einfaches Medaillon ab 18 Kupfertaler zusätzlich zur gewählten Torte; bei der festen Wappentorte ist das beschriebene Grundmotiv bereits enthalten.'),
        service('Geburtsfeier & Namenstag', icon('Glocke'),
          'Kleine Honigküchlein, ein milder Obstkuchen und eine handliche Auswahl für Nachbarn oder Verwandte werden passend zur Gästezahl zusammengestellt. Größe und Süße richten sich nach dem Tisch; auf Wunsch wird statt einer großen Torte eine Verteilung in einzelnen Stücken gewählt.',
          'Familien und Nachbarschaften', 'Ab acht bis 40 Gäste; mit oder ohne kleine Mitteltorte', 'Fünf Tage Vorlauf; Waren nach ausgewählter Menge, Zusammenstellung und schlichtes Namensschild ab 8 Kupfertaler.'),
        service('Jubiläum & feierliche Haustafel', icon('Kerze'),
          'Runde Jahrestage, eine bestandene Lehre oder ein besonderer Besuch erhalten eine abgestimmte Kuchentafel. Die Backstube schlägt kräftige, fruchtige und leichte Stücke so vor, dass die Tafel sich gut teilen lässt. Die Feier richtet die bestellende Gesellschaft aus.',
          'Bürgerhäuser, Werkstätten und private Gesellschaften', 'Kuchentafel ab zwölf Portionen; Anlass und Farbton nach Absprache', 'Sieben Tage Vorlauf; Gebäck nach Register, zusätzliche Ausgestaltung ab 12 Kupfertaler.'),
        service('Gebäck für große Gesellschaften', icon('Schale'),
          'Mehrere Bleche und Platten werden gemeinsam geplant, damit kleine Stücke zur richtigen Zeit fertig sind. Sorten, Stückzahl und Aufteilung auf die Platten werden im Buch festgehalten. Das Angebot umfasst Backwaren; warme Festmenüs, Getränke und Bedienung gehören nicht automatisch dazu.',
          'Hochzeitsgesellschaften, Zünfte und Gastgeber', 'Ab 24 kleinen Stücken; größere Mengen nach freier Backkapazität', 'Ab 72 Stücken zehn Tage Vorlauf; Waren nach Menge, zusätzliches Anrichten auf mehreren Platten ab 10 Kupfertaler.'),
        service('Verkostung & Geschmackswahl', icon('Cup'),
          'Drei kleine Proben aus dem aktuellen Gebäck und geeigneten Füllungen helfen bei einer Entscheidung. Der Meister erklärt, was kühl bleiben muss und welche Füllung den Weg zum Festort gut verträgt. Eine Probe ersetzt keinen fertigen individuellen Tortenentwurf.',
          'Auftraggeber einer Torte oder größeren Festbestellung', 'Zwei Personen · drei kleine gemeinsam gewählte Proben', 'Termin zwei Tage vorher vereinbaren; 12 Kupfertaler für das Probenset.'),
        service('Andere Zutaten & zurückhaltende Süße', icon('Kräuter'),
          'Weniger Honig, eine Füllung ohne Rosinen oder ein Gebäck ohne zugesetzte Nüsse werden auf Machbarkeit geprüft. Manche Teige brauchen Butter, Ei oder Getreide für ihre Form; ein Wunsch kann daher eine andere Gebäckart erfordern. Gemeinsame Geräte und Arbeitsflächen bleiben zu berücksichtigen.',
          'Kunden mit konkreten Zutatenwünschen', 'Eine benannte Rezeptanpassung nach Prüfung', 'Mindestens fünf Tage Vorlauf; Preis vor Zusage. Keine Zusage einer vollständig getrennten oder spurenfreien Herstellung.'),
        service('Geschenkpackung & kleine Mitgaben', icon('Kiste'),
          'Plätzchen, Mandelkringel oder Konfekt werden in kleine einzelne Päckchen geteilt und mit schlichtem Band geschlossen. Eine kurze Beschriftung nach Vorlage erleichtert die Verteilung. Wiederverwendbare Schachteln, kostbare Bänder und besondere Behälter werden gesondert ausgesucht.',
          'Gastgeber, Hochzeitsgäste und Schenkende', 'Ab sechs gleichartigen Päckchen', 'Drei Tage Vorlauf; zusätzlich 1 Kupfertaler je schlichtem Einzelpäckchen. Bereits enthaltene Registerverpackung wird nicht doppelt berechnet.'),
        service('Gebäck im eigenen Gefäß', icon('Schatzkiste'),
          'Ein sauberes geeignetes Gefäß oder eine vorhandene Platte kann nach vorheriger Sichtung verwendet werden. Material, Randhöhe und Transportweg entscheiden, ob das Stück darauf sicher stehen kann. Wertvolle oder ungeeignete Gefäße müssen nicht für den Auftrag angenommen werden.',
          'Kunden mit eigener Festplatte oder Geschenkbox', 'Ein geeignetes Gefäß je vereinbartem Gebäckstück', 'Vorab bringen; einfache Prüfung und Übergabe ohne eigenen Zuschlag. Zusätzliche Stützen und Einlagen nach Vereinbarung.'),
        service('Lieferung innerhalb Gwynthors', '../IconOrdner/Orts Pins/Wagenmacher-removebg-preview.png',
          'Die bestellte Ware wird für einen vereinbarten Weg innerhalb der Stadt verpackt. Empfänger, erreichbarer Eingang und Zeitfenster stehen im Auftrag. Hohe Torten reisen in getrennten Teilen, wenn die Strecke und das Gewicht es verlangen; der Weg muss vorher geeignet sein.',
          'Private Haushalte und Veranstalter in Gwynthor', 'Ein abgestimmter Weg · kurze Übergabe am Ziel', 'Ab 8 Kupfertaler je Weg; empfindliche oder umfangreiche Lieferung nach Aufwand. Kein allgemeiner Fernversand.'),
        service('Aufstellen & vorbereiteter Anschnitt', icon('Hand'),
          'Eine bestellte Torte wird am vereinbarten Tisch aufgestellt, ausgerichtet und bei Bedarf zusammengesetzt. Die Zahl der Stücke und ein einfacher Schnittplan werden mit der ausrichtenden Person besprochen. Das ausgestellte silberne Draig-Messer bleibt im Besitz der Familie.',
          'Veranstalter einer vorbestellten Festtorte', 'Ein Aufbau und Einweisung am vorbereiteten Tisch', 'Ab 16 Kupfertaler zusätzlich; Lieferung gesondert. Geeigneter fester Tisch und kühler Warteplatz müssen bereitstehen.'),
        service('Kurzfristiger Ersatzauftrag', icon('Sanduhr'),
          'Wenn ein Festgebäck misslingt oder ausfällt, prüft der Meister sofort, welche einfache Ausführung mit den vorhandenen Zutaten noch gelingt. Ein kleiner guter Kuchen kann rechtzeitig möglich sein, wo eine kunstvolle mehrstöckige Torte es nicht ist. Die Erinnerung an 1690 ist ein Ansporn, keine Garantie.',
          'Gastgeber in einer dringenden Lage', 'Nur nach aktueller Ofenzeit, Zutaten und sicherem Abholtermin', 'Keine pauschale Zusage; Umfang und Gesamtpreis ausdrücklich vor Arbeitsbeginn vereinbaren.')
      ],
      process: '<p><strong>1. Anlass nennen:</strong> Datum, Gästezahl, gewünschtes Gebäck, Zutatenwünsche und Festort mitbringen.</p><p><strong>2. Ausführung wählen:</strong> Der Meister prüft Rezept, Menge, Entwurf und vorhandene Backzeit. Bei großen Torten hilft eine kleine Vorlage oder ein Probentermin.</p><p><strong>3. Auftrag festhalten:</strong> Gesamtpreis, enthaltene Arbeiten, mögliche Anzahlung, Fertigstellung und Abholung oder Lieferung stehen vor Beginn im Auftragsbuch.</p><p><strong>4. Sicher übergeben:</strong> Bei Abholung werden Stückzahl und Zustand gemeinsam geprüft. Transport, Kühlung, Aufstellen und Anschnitt werden bei Bedarf erklärt.</p>',
      conditions: '<p>Frühe Anfragen sichern noch keinen freien Ofen: Ein Auftrag gilt erst nach ausdrücklicher Zusage. Änderungen nach dem vereinbarten Arbeitsbeginn, Absagen und bereits beschaffte Sonderzutaten werden im Einzelfall mit dem Haus geregelt. Eine Erstattung wird bei der Auftragsannahme vereinbart.</p><p>Rahm- und Quarktorten brauchen kühle Lagerung und eine kurze Reise. Saisonfrüchte, seltene Gewürze und aufwendige Farben sind vom tatsächlichen Vorrat abhängig. Große Feiern außerhalb Gwynthors werden erst nach Prüfung der Strecke angenommen.</p><p>Eine Sonderbestellung erhält eine eigene Vereinbarung. Darin stehen die fertigen Backwaren, zusätzliche Arbeiten und der gemeinsam zugesagte Termin.</p>',
      footer: 'Zum Honigtörtchen · Ein sorgfältig vereinbarter Auftrag ist Teil guter Handwerksarbeit.'
    }
  };
}
