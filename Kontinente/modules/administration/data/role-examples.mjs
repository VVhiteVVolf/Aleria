// Rollenideen für alle Herrschaften; konkrete Amtsbesetzungen bleiben in den Bereichsdaten.
export const ROLE_EXAMPLE_GROUPS = Object.freeze({
  regular: 'Reguläre Rollen',
  secondary: 'Nebenrollen',
  special: 'Sonderrollen',
});

export const ROLE_EXAMPLES = {
  militaer: {
    regular: [
      ['Wachtmeister', 'Teilt Wachschichten ein, kontrolliert Posten und hält die tägliche Bereitschaft der Wache fest.'],
      ['Quartiermeister', 'Organisiert Unterkünfte, Lagerplätze und die Ausgabe von Rationen für eine Truppe.'],
      ['Rüstmeister', 'Verwaltet Waffen und Rüstungen, prüft ihren Zustand und veranlasst Reparaturen.'],
      ['Feldscher', 'Versorgt Verwundete, richtet Verbandsplätze ein und begleitet den Transport von Verletzten.'],
    ],
    secondary: [
      ['Musterschreiber', 'Führt Mannschaftslisten und vermerkt Anwesenheit, Ausrüstung und bestätigte Soldansprüche.'],
      ['Meldereiter', 'Überbringt Befehle und Lageberichte zwischen Hauptquartier, Wachen und Feldtruppen.'],
      ['Fahnenträger', 'Trägt das Feldzeichen und macht Sammelpunkte sowie vereinbarte Signale sichtbar.'],
      ['Lagerwart', 'Kümmert sich um Zelte, Feuerstellen, Wasserstellen und Ordnung im Lager.'],
    ],
    special: [
      ['Kundschafterführer', 'Führt einen beauftragten Spähtrupp und sammelt Berichte über Wege, Gelände und feindliche Bewegungen.'],
      ['Belagerungswerkmeister', 'Bereitet Belagerungsgerät vor und koordiniert Aufbau, Wartung und Einsatzbereitschaft.'],
      ['Brückenbauer des Heeres', 'Erkundet Übergänge und organisiert behelfsmäßige Brücken oder die Sicherung beschädigter Wege.'],
      ['Flottenlotse', 'Berät Schiffsführer zu örtlichen Untiefen, Strömungen und geeigneten Ankerplätzen.'],
    ],
  },
  klerus: {
    regular: [
      ['Gemeindeseelsorger', 'Begleitet Gläubige im Alltag, hält Gottesdienste und betreut persönliche geistliche Anliegen.'],
      ['Sakristan', 'Bereitet den Gottesdienst vor und verwahrt Gewänder, liturgische Geräte und Kirchenschlüssel.'],
      ['Spitalbruder oder Spitalschwester', 'Pflegt Kranke und Bedürftige und organisiert die Versorgung im kirchlichen Spital.'],
      ['Kirchenschreiber', 'Führt kirchliche Register, fertigt Abschriften und hält anvertraute Gelübde oder Stiftungen fest.'],
    ],
    secondary: [
      ['Glöckner', 'Läutet zu Gebet, Gottesdienst und vereinbarten Warnzeichen und pflegt die Glockenanlage.'],
      ['Lichterwart', 'Sorgt für Kerzen, Lampen und sichere Beleuchtung bei Gottesdiensten und Prozessionen.'],
      ['Pilgerwirt', 'Empfängt Reisende, vergibt Schlafplätze und organisiert einfache Verpflegung in einer Pilgerherberge.'],
      ['Almosenhelfer', 'Sammelt und verteilt freigegebene Hilfsgaben und meldet besonderen Unterstützungsbedarf.'],
    ],
    special: [
      ['Reliquienhüter', 'Verwahrt anvertraute Reliquien und dokumentiert ihre Herkunft, Ausleihe und feierliche Ausstellung.'],
      ['Wallfahrtsbegleiter', 'Bereitet eine bestimmte Pilgerreise vor und begleitet die Gruppe geistlich und organisatorisch.'],
      ['Militärkaplan', 'Begleitet Soldaten geistlich, betreut Verwundete und hält Andachten im Feld oder in der Garnison.'],
      ['Sterbebeistand', 'Begleitet Sterbende und Angehörige und stimmt Abschied, Gebet und Bestattung mit der Gemeinde ab.'],
    ],
  },
  gerichtsbarkeit: {
    regular: [
      ['Gerichtsschreiber', 'Führt Verfahrensakten und hält Anträge, Aussagen, Beschlüsse und Urteile nachvollziehbar fest.'],
      ['Gerichtsbote', 'Stellt Ladungen und gerichtliche Schreiben zu und bestätigt Ort und Zeitpunkt der Übergabe.'],
      ['Büttel', 'Hält im Auftrag des Gerichts Ordnung und begleitet angeordnete Vorführungen oder Vollstreckungen.'],
      ['Kerkeraufseher', 'Überwacht die Verwahrung und dokumentiert Aufnahme, Versorgung und Übergabe von Gefangenen.'],
    ],
    secondary: [
      ['Protokollgehilfe', 'Bereitet Akten und Schreibmaterial vor und unterstützt die Niederschrift einer Verhandlung.'],
      ['Zeugenbegleiter', 'Empfängt geladene Zeugen, erläutert den Ablauf und hält die vorgesehenen Wartebereiche geordnet.'],
      ['Gerichtsausrufer', 'Kündigt Verhandlungen und freigegebene Entscheidungen mit dem bestätigten Wortlaut an.'],
      ['Gerichtsdolmetscher', 'Übersetzt Aussagen und Rückfragen und kennzeichnet sprachliche Unsicherheiten im Protokoll.'],
    ],
    special: [
      ['Grenzschlichter', 'Sichtet Grenzzeichen und ältere Absprachen und bereitet eine Einigung zwischen streitenden Nachbarn vor.'],
      ['Beweisverwahrer', 'Verwahrt übergebene Beweisstücke und dokumentiert Siegel, Zustand und jede weitere Übergabe.'],
      ['Pfändungsbeauftragter', 'Erfasst die von einem gültigen Auftrag betroffenen Güter und quittiert deren Sicherstellung.'],
      ['Sachverständiger des Gerichts', 'Begutachtet eine konkrete Fachfrage und erläutert Befund, Methode und Grenzen der eigenen Einschätzung.'],
    ],
  },
  finanzen: {
    regular: [
      ['Rentmeister', 'Fasst örtliche Einnahmen und Ausgaben zusammen und legt der Kämmerei die Abrechnung vor.'],
      ['Zöllner', 'Erhebt die geltenden Zölle, prüft Warenangaben und stellt Quittungen aus.'],
      ['Magazinmeister', 'Führt Bestandslisten über Vorräte und quittiert Anlieferung, Ausgabe und Verluste.'],
      ['Lohnschreiber', 'Bereitet bestätigte Lohn- und Soldlisten für die Auszahlung vor und vermerkt empfangene Beträge.'],
    ],
    secondary: [
      ['Waaggehilfe', 'Unterstützt das Wiegen von Waren und prüft Gewichte und Waagen vor dem Gebrauch.'],
      ['Quittungsschreiber', 'Fertigt Zahlungsbelege aus und ordnet die Gegenstücke den passenden Rechnungen zu.'],
      ['Speicherzähler', 'Zählt eingelagerte Säcke, Fässer und Bündel und meldet Abweichungen vom Bestandsbuch.'],
      ['Kassenbote', 'Überbringt versiegelte Zahlungsanweisungen, Abrechnungen und quittierte Belege.'],
    ],
    special: [
      ['Kassenreiter', 'Prüft beauftragte Kassen und Lager vor Ort und berichtet über Fehlbeträge oder beschädigte Siegel.'],
      ['Schadenschätzer', 'Ermittelt nach Brand, Sturm oder Überfall den belegbaren Verlust an Gebäuden, Vorräten und Gerät.'],
      ['Kassenritter', 'Begleitet wertvolle Geldsendungen und bestätigt die gesicherte Übergabe an den Empfänger.'],
      ['Festkassenbeauftragter', 'Führt für ein bestimmtes Fest ein eigenes Ausgabenbuch und rechnet Vorschüsse sowie Restbeträge ab.'],
    ],
  },
  spionage: {
    regular: [
      ['Nachrichtenkundiger', 'Vergleicht eingehende Meldungen und trennt belegte Beobachtungen von Vermutungen und Gerüchten.'],
      ['Chiffrenschreiber', 'Ver- und entschlüsselt anvertraute Nachrichten und verwahrt die zugehörigen Schlüssel.'],
      ['Verbindungsbote', 'Übermittelt Nachrichten zwischen festgelegten Kontaktstellen und bestätigt den Empfang.'],
      ['Beobachter', 'Verfolgt im erteilten Auftrag Entwicklungen an einem Ort und meldet nachvollziehbare Beobachtungen.'],
    ],
    secondary: [
      ['Gerüchtesammler', 'Hält öffentlich umlaufende Erzählungen mit Ort, Zeitpunkt und erkennbarer Herkunft fest.'],
      ['Archivgehilfe', 'Ordnet ältere Berichte und sucht bekannte Namen, Orte oder wiederkehrende Muster heraus.'],
      ['Kartenschreiber', 'Trägt bestätigte Beobachtungsorte, Wege und zeitliche Abläufe in Arbeitskarten ein.'],
      ['Kontaktbetreuer', 'Pflegt vereinbarte Treffpunkte und meldet ausgebliebene Nachrichten an die zuständige Stelle.'],
    ],
    special: [
      ['Fahnder', 'Verfolgt einen abgegrenzten Suchauftrag und prüft gefundene Hinweise auf Verwechslungen.'],
      ['Gegenspäher', 'Untersucht Hinweise auf fremde Beobachtung und sichert die eigenen Nachrichtenwege.'],
      ['Siegelprüfer', 'Vergleicht verdächtige Briefe und Siegel mit bekannten Vorlagen und hält Auffälligkeiten fest.'],
      ['Sonderkurier', 'Überbringt besonders vertrauliche Nachrichten persönlich auf einer eigens abgestimmten Route.'],
    ],
  },
  diplomatie: {
    regular: [
      ['Gesandtschaftssekretär', 'Bereitet Schreiben und Gesprächstermine einer Gesandtschaft vor und führt deren Unterlagen.'],
      ['Protokollschreiber', 'Hält Anreden, Sitzordnung und vereinbarte Abläufe für förmliche Begegnungen fest.'],
      ['Dolmetscher', 'Übersetzt Gespräche und Schriftstücke und erläutert sprachliche Mehrdeutigkeiten.'],
      ['Heroldsbote', 'Überbringt beglaubigte Botschaften und bestätigt ihre ordnungsgemäße Übergabe.'],
    ],
    secondary: [
      ['Empfangsgeleiter', 'Holt Gäste am vereinbarten Ort ab und begleitet sie durch die vorgesehenen Empfangsstationen.'],
      ['Wappenschreiber', 'Pflegt Namen, Wappen und bestätigte Titel für die Vorbereitung von Besuchen und Schreiben.'],
      ['Reiseschreiber', 'Sammelt Wegbeschreibungen, Unterkunftszusagen und Kostenbelege einer Gesandtschaft.'],
      ['Schreibgehilfe des Herolds', 'Fertigt Reinschriften, ordnet eingehende Briefe und bereitet die tägliche Korrespondenz vor.'],
    ],
    special: [
      ['Vermittler', 'Bereitet im erteilten Mandat Gespräche zwischen streitenden Parteien vor und hält Einigungsvorschläge fest.'],
      ['Grenzgesandter', 'Vertritt einen bestimmten Auftrag bei einer benachbarten Herrschaft und berichtet über deren Antwort.'],
      ['Turnierherold', 'Prüft Meldungen, verkündet Teilnehmer und begleitet die förmlichen Schritte eines Turniers.'],
      ['Vertragszeuge', 'Bezeugt die vereinbarte Unterzeichnung und dokumentiert Wortlaut, Beteiligte und ausgegebene Abschriften.'],
    ],
  },
  magie: {
    regular: [
      ['Arkaner Archivar', 'Ordnet Zauberbücher, Schriftrollen und Forschungsnotizen und führt ein Verzeichnis ihrer Nutzung.'],
      ['Werkstattgehilfe', 'Bereitet Arbeitsplätze und Gerät für magische Untersuchungen vor und dokumentiert Materialverbrauch.'],
      ['Reagenzienwart', 'Verwahrt Zauberzutaten, prüft Vorräte und kennzeichnet Herkunft sowie bekannte Eigenschaften.'],
      ['Beschaffer des Magiers', 'Sucht im Auftrag des Magiers benötigte Materialien, Bücher und besondere Werkstücke.'],
    ],
    secondary: [
      ['Abschreiber arkaner Texte', 'Fertigt sorgfältige Textkopien an und kennzeichnet unleserliche Zeichen oder Lücken.'],
      ['Turmbote', 'Überbringt Nachrichten und kleinere Lieferungen zwischen Turm, Hof und Werkstätten.'],
      ['Instrumentenwart', 'Reinigt und prüft Messgeräte, Linsen und sonstige empfindliche Arbeitsmittel.'],
      ['Versuchsprotokollant', 'Hält Ablauf, Beobachtungen und Abweichungen eines begleiteten Versuchs fest.'],
    ],
    special: [
      ['Artefaktkundiger', 'Untersucht einen bestimmten Fund und beschreibt erkennbare Eigenschaften und offene Fragen.'],
      ['Schutzzeichenprüfer', 'Kontrolliert bekannte Schutzzeichen nach Vorgabe und meldet Schäden oder Veränderungen.'],
      ['Fluchgutachter', 'Untersucht einen begründeten Fluchverdacht und berät über mögliche weitere Schritte.'],
      ['Expeditionsbegleiter', 'Begleitet eine bestimmte Erkundung und sichert magische Funde, Beobachtungen und Aufzeichnungen.'],
    ],
  },
  unterhaltung: {
    regular: [
      ['Festordner', 'Plant Aufbau, Zeitablauf und Arbeitsaufträge für Feste und öffentliche Hofveranstaltungen.'],
      ['Hofmusiker', 'Gestaltet musikalische Beiträge und stimmt Repertoire, Proben und Auftritte mit dem Hof ab.'],
      ['Spielmeister', 'Bereitet Gesellschaftsspiele und Wettbewerbe vor und erläutert die vereinbarten Regeln.'],
      ['Bühnenmeister', 'Organisiert Bühne, Kulissen und den sicheren Ablauf von Auf- und Abbau.'],
    ],
    secondary: [
      ['Platzanweiser', 'Begrüßt Gäste und führt sie zu den für sie vorgesehenen Sitz- oder Stehplätzen.'],
      ['Garderobenwart', 'Verwahrt abgegebene Mäntel und persönliche Dinge und ordnet sie ihren Besitzern zu.'],
      ['Licht- und Lampenwart', 'Bereitet die Veranstaltungsbeleuchtung vor und beaufsichtigt Lampen, Kerzen und Feuerstellen.'],
      ['Aushangschreiber', 'Fertigt gut lesbare Ankündigungen an und bringt sie an den vereinbarten Orten an.'],
    ],
    special: [
      ['Schreier des Offenen Gerichts', 'Verkündet abgestimmte Gerichtstermine und freigegebene Texte vor der versammelten Öffentlichkeit.'],
      ['Turnieransager', 'Ruft Wettbewerbe und Teilnehmer aus und stimmt seine Ansagen mit Turnierleitung und Herold ab.'],
      ['Chronist eines Festes', 'Hält besondere Auftritte, Ehrungen und Ereignisse einer bestimmten Feier für die Hauschronik fest.'],
      ['Spielleiter eines Maskenfestes', 'Entwickelt ein Festspiel, verteilt Rollen und begleitet den gemeinsam vereinbarten Ablauf.'],
    ],
  },
};
