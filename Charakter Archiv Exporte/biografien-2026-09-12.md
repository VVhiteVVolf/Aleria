# Heledd Gafyr, Melyn Arth und Oweta Draig

Die drei vom Benutzer bereitgestellten Dateien aus `Downloads/Bios` wurden am 12.09.2026 anhand ihrer Personen- und Weltpersonenkennungen zugeordnet:

| Quelle | Charakter | Stammbaumakten |
| --- | --- | --- |
| `heledd-biographie.json` | Heledd Gafyr, neu angelegt | Haus Gafyr |
| `melyn-arth-biographie.json` | Melyn Arth, neu angelegt; Alias Melyn Saethwyr | Haus Arth und Haus Saethwyr |
| `oweta-draig.json` | Oweta Draig, bestehender Charakter | Haus Draig |

Heledd Gafyr (`heledd-gafyr`, geboren 1696) ist nicht Heledd Gwyvern/Draig. Melyn ist entsprechend der ausdrücklichen Benutzerkorrektur eine Frau. Ihre Biografie nennt 1674 als Geburtsjahr und beschreibt sie im Jahr 1740 als lebend; diese Angaben sind in beiden Familienakten und ihrem neuen Charakter einheitlich hinterlegt. Weltpersonenkennungen und bestehende Verwandtschaften wurden beibehalten.

## Inhalt und Formatierung

Alle Biografieabschnitte, Persönlichkeitstexte, Verbindungen und Bilder aus den drei Quellen wurden übernommen. Bereinigt wurden kopierte Schriftgrößen und Span-Verschachtelungen, Zeilenumbrüche mitten im Satz, harte Worttrennungen aus dem Export, Tabs und doppelte Listenpunkte. Owetas versehentlicher Eigenschaftstitel `SelbstständigNeuer Punkt` lautet jetzt `Selbstständig`. Melyns Tätigkeit lautet `Kommandantin der Saethwyr`; Heledds vollständiger Name wird in ihrer Infotabelle ausgeschrieben.

Die drei Datenmodule unter `Stammbäume/assets/js/data/person-biographies/` enthalten die bereinigten Stammbaumtexte. Melyn wird in beiden Häusern aus demselben Modul eingebunden. Die nebenstehenden Einzelcharakterexporte sichern denselben Stand für den bestehenden Charakterdatenbank-Sync. Bei Oweta enthält der Export ausschließlich Kennung, Namen, Biografie und Änderungszeitpunkt; andere Felder ihres gelieferten Gesamtexports wurden nicht erneut importiert.

## CK2-Trait-Icons

Alle 24 Persönlichkeitseinträge verwenden vorhandene Originaldateien aus `IconOrdner/Traits Icon/`. Die Zuordnung illustriert die beschriebenen Eigenschaften und importiert keine Spielwerte.

| Figur | Eigenschaften und Icon-Dateien |
| --- | --- |
| Heledd | Ernst → Temperate; Ritterlich → Just; Praktisch → Shrewd; Anspruchsvoll → Diligent; Verlässlich → Honest; Unabhängig → Willful; Unbeeindruckt von Rang → Humble; Fürsorglich auf ihre Weise → Kind |
| Melyn | Hart → Stubborn; Direkt → Honest; Kämpferisch → Duelist; Beschützend → Defensive_leader; Fürsorglich → Kind; Fordernd → Diligent; Loyal → Family_focus |
| Oweta | Beobachtend → Shrewd; Ruhig → Patient; Präzise → Honest; Pragmatisch → Quick; Selbstständig → Willful; Unprätentiös → Humble; Heimatverbunden → Family_focus; Fürsorglich → Kind; Trocken → Playful |

## Speicherung und Prüfung

- Almanach: atomarer Firestore-Commit vom **12.09.2026, 11:56:14 UTC** im Projekt `aleriaprojekt`, Datenbank `(default)`.
- Neue Dokumente: `characters/person--haus-gafyr--heledd-gafyr` und `characters/person--haus-arth--melyn-arth`.
- Oweta: `characters/vk0xAa3ZcEhVvGC1CzNq`; ausschließlich `biography` und `updatedAt` mit Versionsvorbedingung geändert. Alle übrigen Online-Felder wurden gegen den vorherigen Stand geprüft.
- Alle drei Online-Dokumente nach dem Schreiben vollständig zurückgelesen und mit dem vorbereiteten Schreibplan verglichen.
- Stammbäume: über den vorhandenen Aleria-Publisher gespeichert und zurückgelesen; Gafyr Revision 3, Saethwyr Revision 4, Arth Revision 2, Draig Revision 1. [Veröffentlichungscommit](https://github.com/VVhiteVVolf/Aleria/commit/8ce9ba3f61cb389869a23a6f17b6912c850f849d).
- Die bestehenden Online-Familienakten wurden vor dem Speichern neu gelesen. Geändert wurden nur die betreffenden Personen; bestehende Portraits, weitere Personen, Beziehungen und Familienangaben bleiben erhalten. Draig erhielt erstmals eine veröffentlichte JSON-Fassung seiner bestehenden Projektakte.
- 1246 bestehende Stammbaumprüfungen und 14 Prüfungen für Biografiekompatibilität und Charakterdatenbank bestanden. Die festen Revisionsangaben in fünf vorhandenen Stammbaumtests wurden an die neuen Datenrevisionen angepasst.
- Zusätzlich geprüft: dieselbe normalisierte Biografie in Almanach, Projektstammbäumen und veröffentlichten Akten; Melyns zwei Familienverknüpfungen; eindeutige Charakterzuordnung; alle Icon-Dateien von beiden Anwendungen aus erreichbar.
- Charakterdatenbank synchronisiert und `--check` bestanden: **236 Charaktere**, keine doppelten Weltpersonen. Inhaltliche Profiländerungen betreffen nur die drei Zielpersonen. Die weiteren erzeugten Dateidifferenzen stammen aus den vom vorhandenen Sync erneuerten Quellzeitpunkten und Prüfsummen.

Die Icons wurden als Bildübersicht geprüft. Eine visuelle Browserprüfung der vollständigen Profile war nicht möglich, weil der eingebettete Browser in dieser Sitzung nicht verfügbar war.

Stand **12:02 UTC**: Der Speicherdienst liefert die vier neuen GitHub-Revisionen korrekt zurück; `skipDeploy` wurde ausdrücklich deaktiviert. Die öffentlich ausgelieferten Netlify-Dateien zeigten bei der abschließenden Prüfung noch Gafyr 2, Saethwyr 3 und Arth 1; Draigs neue JSON-Datei war dort noch nicht vorhanden. Die Website-Aktualisierung ist damit noch nicht bestätigt. Die drei Almanach-Charaktere sind unabhängig davon bereits in Firestore gespeichert.
