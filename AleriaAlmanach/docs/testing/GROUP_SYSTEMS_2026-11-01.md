# Gruppen, Charaktere und Gegenstände — Abschluss vom 1. November 2026

## Umgesetzter Umfang

Die gemeinsame Folio-Landingpage ist in acht Gruppen eingebunden. Bestehende
Modulkennungen, Seiten, Szenenthreads, Rangplätze und manuell gepflegte Auswahlen
bleiben erhalten. Die erstmalige Inhaltsprojektion besitzt eine Versionskennung;
spätere eigene Bearbeitungen werden nicht bei jedem Laden erneut ersetzt.

| Gruppe | Öffentlicher Vorschauumfang einschließlich belegter Tierbegleiter |
| --- | ---: |
| Gawain & Duncan | 7 |
| Skallis Gefolge | 22 |
| Idwals Schiffsmannschaft / Tiefenwyrm | 18 |
| Anarauts Gefolge | 7 |
| Rhydians Schiffsmannschaft | 30 |
| Parzifals Schiffsmannschaft | 23 |
| Lynnes Schiffsmannschaft | 20 |
| Draig Leibgarde | 6 |

Diese Zahlen beschreiben den geprüften öffentlichen Quellenstand, keine neu
erfundenen Besatzungsmitglieder. Figuren ohne vorhandene Kampfwerte werden
entsprechend angezeigt. Offene Hierarchieplätze werden nicht als Personen gezählt.

Bis vier Mitglieder erscheinen ausführliche Porträts. Größere Gemeinschaften
verwenden kompakte Zeilen mit gerahmtem Avatar, Rolle und Bogenverweis. Suche,
Zusammenstellungsfilter und Seiten zu höchstens 20 Zeilen begrenzen die Anzeige;
die Modellprüfung umfasst auch 2.000 Mitglieder. Automatische Tierbegleiter
folgen ihrer belegten Inventarbindung. Doppelfunktionen in mehreren Hierarchien
erzeugen eine Person mit mehreren Rollen.

Gawains Modul enthält den Anlass aus der öffentlichen Anhörung, eine immersive
Biografie und seine bisher gezeigten Eigenschaften aus derselben Quelle wie
Steckbrief und Stammbaum. Duncan steht als Rittervater und Mentor über dem bereits
zum Ritter geschlagenen Gawain. Ylva, Freki und die eigenen Pferde stehen außerhalb
dieser Rangfolge. Anarauts Landgefolge und Arians Schiffskommando besitzen zwei
getrennte Hierarchieseiten mit Aufgabenbeschreibungen und unbesetzten Silhouetten.

## Verbindungen und Besitz

Die Gruppenansicht liest Charakter-/Kreaturbögen und vertrauenswürdige
Szenenbelege über vorhandene Schnittstellen. Charakter- und Kreaturkennungen
bleiben typisiert; fremde, importierte und zurückgenommene Belege verändern
die Bereitschaft nicht. Historische Inventarsnapshots werden nicht als aktueller
Besitz in den Kampfbogen zurückgeschrieben.

Der verbindliche Gruppenvorrat verwendet `group_quest_accounts`. Er zeigt echte
Währungsicons, Gegenstände und die gemeinsame Itemkarte. Einlagen, Geld- und
Warenübergaben an Figuren sowie kontrollierte Registerzuteilungen laufen über
`commitGroupInventory`: Berechtigung, verbindliche Mitgliedschaft, Revisionen,
atomare Buchung und wiederholsichere Quittung. Eine unklare Antwort kann mit
derselben Vorgangskennung erneut geprüft werden. Normale Beiträge erhalten
keine neue pauschale Besitzpflicht.

Gruppenbelege können nicht als gewöhnliche oder erzwungene Kampf-Rücknahme
gelöscht werden. Eine Korrektur benötigt eine Gegenbuchung. Geschlossene,
archivierte, versteckte, unverbundene und reine Vorlagenszenen sind keine
mechanischen Buchungsziele. Geld und Verbrauchsgüter schreiben das Kampfprofil
einschließlich seiner Revision nicht neu; echte Ausrüstung verändert nur ihre
tatsächlichen gebundenen Einträge.

## Gegenstandsregeln und Bilder

Die [Ausrüstungsstandards](../inventory/EQUIPMENT_STANDARDS_2026-11-01.md)
dokumentieren Großschwert und Streitaxt mit 1W12, Flegel mit 3W4,
Plattenrüstung mit RK 15, Ritterrüstung mit RK 18 sowie differenzierte leichte
und mittlere Rüstungen und Schilde. Alte persönliche Waffen, gepinnte
Definitionversionen und vergangene Kampfergebnisse werden nicht umgedeutet.

Registertexte werden sicher in lesbaren Klartext projiziert. Für alle 43
Standardartikel „Werkzeuge & Sonstiges“ lagen bereits passende transparente
Einzelbilder vor; die falsche gemeinsame Platzhalterzuordnung wird ersetzt.
Eigene Bilder und Unikate behalten ihre Darstellung. Gold- und Silbertaler sind
als eigene Münzbilder neu erzeugt; Kupfer und Eisen verwenden die vorhandenen
Aleria-Motive. Zahlen bleiben daneben als Text.

## Prüfbelege und Grenzen

- Alle acht Gruppen im Browser geprüft; große Besatzungen, Suche, Blättern und
  schmale Darstellung ohne horizontales Überlaufen geprüft.
- Sieben tatsächliche Browserbuchungen ausschließlich im lokalen
  `demo-aleria-group-ui`: Ration an Gawain und zurück, Kupfer an Duncan und Ylva,
  Heiltrank an Tanor, Ration an Freki und Registerwaffe in den Gruppenvorrat.
- Die ersten fünf Vorgänge wurden nach der Profilkorrektur aus ihrem echten
  Vorherstand erneut abgespielt: alle sechs Kampfprofile exakt unverändert.
  Die zwei erneuten Browserübergaben bestätigen dieselbe Profilgleichheit.
- Sechs echte Gruppen- und zwei Ausrüstungs-Emulatorfälle bestanden. Die
  vollständige Serverprüfung nach dem Profilfix umfasst 310 erfolgreiche Tests.
- 255 öffentliche Figuren behalten ihre IDs sowie sämtliche Inventar- und
  Kampfprofil-Hashes. Der gezielte Gawain-Abgleich ändert ausschließlich seine
  öffentlichen biografischen Felder; Nachbarn und Beziehungen bleiben erhalten.
- Der breite Frontendlauf und seine gezielten Abschlussregressionen, Releasegates,
  Quellenprüfungen und der Produktionsbuild sind getrennt in den Diagnosebelegen
  aufgeführt; Testzahlen verschiedener Läufe werden nicht zusammengerechnet.

Belege: `diagnostics/group-system-integration-2026-11-01/`, insbesondere
`release-checks.json`, `browser-groups.json`, `browser-transfer-verification.json`,
`browser-profile-replay-fixed.json`, `final-gameplay-preservation.json` und
`GAWAIN_PUBLIC_SYNC.md`. Die Bildinventur liegt unter
`diagnostics/tool-item-art-inventory-2026-11-01/`.

Dies war eine lokale Implementierung mit öffentlichen Quellen und isolierten
Testprojekten. Produktive Inventare, historische Würfe, private Dossiers und
Browserentwürfe wurden nicht verändert. Kein Push, Deploy oder produktiver
Migrationslauf wurde vorgenommen.

Weiterer Ausbau bleibt ausdrücklich im ursprünglichen
[Systemcheck](SYSTEM_CHECKUP_2026-11-01.md) dokumentiert: koordinierte
Gesamtwiederherstellung, einheitliche Figurensteuerungsfreigaben, direkter
Gruppen-Händlerkauf und kontrollierte Übernahme produktiver Altbestände.
Sechs unabhängige vorgeschlagene Datenbank-Neuklassifikationen wurden nicht
nebenbei ausgeführt; der gezielte Gawain-Builder besteht ohne diese Verschiebungen.
