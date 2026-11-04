# Kampf-, Attribut- und Traitprüfung

Begonnen am 3. November, abgeschlossen am 4. November 2026. Lokaler Arbeitsstand;
kein Push, Deploy oder Zugriff auf produktive Firebase-Daten.

## Ergebnis und Prüfbreite

Alle 185 auswählbaren Merkmale wurden einzeln nach Ursache, Wirkung, Stärke,
Preis und Überschneidungen geprüft. 65 Definitionen wurden angepasst, 120
begründet erhalten. Die [vollständige Traitmatrix](TRAIT_BALANCE_2026-11-03.md)
enthält auch die unveränderten Definitionen. Die
[Attackenprüfung](ATTACK_ATTRIBUTE_AUDIT_2026-11-03.md) umfasst 985 eindeutige
Techniken, 1.028 bestätigte Klassenangebote, 538 Zaubergradformen und 63.300
Schadensproben. Ein Klassenangebot ist keine zusätzliche eindeutige Technik.

Persönlichkeit ist keine Ausbildung: Neugier vor Vorsicht gibt jetzt +1 auf
Nachforschungen und −1 auf GES-Rettungen. Tagträume vermitteln kein arkanes
Wissen, Pazifismus keine medizinische Ausbildung und Phobien keine körperliche
Verwundbarkeit. Genie verbessert INT statt sämtliche körperlichen Attribute.
Eiserne Konzentration wirkt gezielt auf Konzentrationsprüfungen. Kosten und
Hinweise auf nicht stapelbare Wirkungen wurden entsprechend angepasst.

## Geschlossene Regel- und Datenlücken

1. **Glück/Pech:** Glückspilz ersetzt jede ursprünglich gewürfelte natürliche 1
   genau einmal und gibt +1 auf Attributsrettungen. Ein Ersatzwurf von 1 bleibt
   verbindlich. Bei Vorteil/Nachteil werden die ursprünglichen Würfel einzeln
   ersetzt und danach erneut ausgewählt. Pechvogel lässt natürliche 1–3 scheitern
   und gibt −1 auf Attributsrettungen. Mehrere gleiche Quellen vervielfachen die
   Regel nicht. Beide Merkmale zusammen behalten beide Würfelregeln; die festen
   Rettungsboni heben sich auf.
2. **Alle gebundenen W20-Pfade:** Hauptangriff, Folgeangriff, vorbereiteter
   Gegenangriff, primärer und sekundärer Rettungswurf, Konzentration,
   Fertigkeitsprobe und freier Attributswurf benutzen dieselbe Würfelpolicy.
   Bei einem Zauber rettet dessen Ziel; die Glücksregel des Zaubernden wird
   nicht versehentlich auf den Verteidiger übertragen. Kritische Rettungsfehler
   erzeugen keinen kritischen Zauberschaden oder Waffenpatzertabellenwurf.
3. **Serverprüfung und Vorschau:** Ursprungswürfel und Ersatzwürfel stehen im
   Beleg. Der Server prüft Anzahl, Indizes, ursprüngliche 1 und Ersatzwerte
   anhand der eigenen Profilregeln. Erfundenes Glück, doppelte Ersatzwürfe und
   fehlende Pflichtwiederholungen werden abgewiesen. Trefferwahrscheinlichkeiten
   verwenden dieselbe Verteilung. Ein Fehlschlag hat auch bei außergewöhnlich
   niedriger Kritschwelle Vorrang vor einem kritischen Treffer.
4. **Freie Szenenrettungen:** Auslöser, Schadensart und Gefahren wie Furcht,
   Vergiftung oder Blutung sind ausdrücklich auswählbar. Dadurch greifen
   Phobien und passende Rettungsboni tatsächlich. Die eigene geführte Waffe
   wird nicht als Ursache einer freien Rettung geraten. Kontext übersteht
   Entwurf, Kommentar, Bearbeitung und Serverprüfung; alte Belege bleiben fest.
5. **Sechs Attribute statt nur Kraft:** Temporäre Boni und Obergrenzen erreichen
   jetzt Waffen, RK, Initiative, Zauber, Kontroll-SG, Fertigkeiten, Rettungen und
   KI-Daten. Die Berechnung verwendet gemeinsame Vorher-/Nachher-Getter und
   berücksichtigt feste Overrides und leichte Angriffe. Die KON-Empfehlung beim
   Stufenaufstieg verwendet ebenfalls den wirksamen Wert.
6. **Benannte Zustandsboni:** Gewöhnliche aktive Zustände erreichen jetzt die
   echten Fertigkeits-, Waffen- und kontextuellen Rettungsgetter. Zuvor gelang
   dies bei solchen benannten Effekten nur Rauschmittelzuständen; KI-Anzeige und
   echte Probe konnten voneinander abweichen. Gemeinsame Getter verhindern
   doppelte Verrechnung.
7. **Immer kampfbereit:** Der eigene temporäre TP-Vorrat wurde bislang nicht
   vergeben. Neue versionierte Kampfstartbelege vergeben nun den stärksten
   Vorrat einmal pro Figur und Kampf. Bestehende temporäre TP werden nicht
   addiert. Verlassen/Wiedereintritt und Neuladen füllen verbrauchte TP nicht auf;
   alte Kampfereignisse erhalten keine nachträglichen Wirkungen.
8. **Bestehende Katalogkopien:** Ein unveränderliches Vorher-Manifest erkennt nur
   exakt bekannte alte Definitionen. Diese erhalten beim Normalisieren die
   neue Regel, während Instanz-ID, Aktivierung und persönliches Bild erhalten
   bleiben. Individuelle Texte und Regelvarianten werden geschützt. Die
   Revision ist idempotent; Originaldefinitionen bleiben nachvollziehbar.

## Sichtbare Schnittstellen

Die [Interfaceprüfung](TRAIT_INTERFACE_AUDIT_2026-11-03.md) dokumentiert die
einzelnen Flächen und Browserbelege. Geprüft und ergänzt wurden:

| Fläche | Abgleich |
| --- | --- |
| Charakterbogen und Radar | Grundwerte, wirksame Werte, Obergrenzen und vollständige Mechaniktexte |
| Starthilfe und Stufenassistent | Gleiche effektive Attributvorschau, Traitwahl, Kosten und Zusammenfassung |
| Detail- und Archiveinträge | Attributs-, Fertigkeits-, Waffen-, Rettungs- und Affinitätsmechanik sowie Glück/Pech |
| Kompaktes Szenenprofil | Attribute, Rettungen, Fertigkeiten, Eigenschaften/Marotten und gesamtes Arsenal |
| Kampf- und Probenkomponist | Effektive Werte, Rettungskontext und passende Regeln |
| Ergebnis und Verlauf | Würfelersatz, Pechgrenze, Konzentrationsrettungen und Kampfstart-TP aus dem gespeicherten Beleg |
| Kreaturenbogen und Dossier | Wirksame Attribute, Radar, Traits, Bewegung und korrekte Zaubertrickkosten |
| Öffentliche Biografien | Exakt alte Katalogkarten werden in generierten, gespeicherten und Modul-Biografien gezielt revidiert |
| Gameplay Guides | Traitbeschreibungen und echte Beispielproben aus den gemeinsamen Regeln |
| KI-Kontext | Wirksame Attribute, Ausbildungsgrade, Gesamtwerte und Würfelpolicy |
| Freies Würfelbrett | Klare Erläuterung der eingegebenen Formel; gebundene Proben/Kampfabschnitte berechnen Figurenregeln |

Das freie Würfelbrett erlaubt beliebige Pools einschließlich Schadenstabellen und
Todeswürfen. Ein Figurenname allein bestimmt weder Attribut noch Fertigkeit,
Ausbildung oder Angriffsart. Deshalb werden dort keine Bogenboni geraten. Die
automatische Regelauswertung gehört zu den ausdrücklich gebundenen Proben- und
Kampfabschnitten. Persönlich abgeänderte Merkmale bleiben sichtbar und wirksam
nach ihren eigenen gespeicherten Regeln.

## Einordnung des Balancings

Ein pauschales +1 verschiebt eine normale, nicht gedeckelte W20-Erfolgschance um
fünf Prozentpunkte; +3 bereits um fünfzehn. Normale Eigenheiten verwenden daher
meist kleine Boni/Mali. Stärkere Sinnesleistungen, echte Ausbildung und seltene
körperliche Anlagen dürfen begründete stärkere Wirkungen behalten.

| Natürliche Fehlerzone | Normal | Vorteil | Nachteil |
| --- | ---: | ---: | ---: |
| Gewöhnliche 1 | 5 % | 0,25 % | 9,75 % |
| Glückspilz: 1 nach einmaligem Ersatz | 0,25 % | 0,000625 % | 0,499375 % |
| Pechvogel: 1–3 | 15 % | 2,25 % | 27,75 % |

Die Tabelle beschreibt natürliche Fehlschlagszonen, keine gesamte
SG-abhängige Fehlerrate. Gewöhnliche kampfgebundene Rettungen behalten ihre
bisherige Auswertung Gesamtwert gegen SG; Pech fügt die ausdrückliche
Fehlschlagszone hinzu. Schaden, Heilung und allgemeine Zufallstabellen erhalten
keine erfundenen kritischen Attributsergebnisse.

Die Prüfung bestätigt Konsistenz und begründete Größenordnungen. Der taktische
Wert von Reichweite, Kontrolle, Vorbereitung oder mehreren Zielen hängt weiter
von der konkreten Szene ab. Negative Entwicklungssalden und persönliche
Absprachen bleiben wie beauftragt zulässig.

## Prüfung und Schutz bestehender Daten

Prüfprotokolle liegen unter `diagnostics/combat-system-checkup-20261103/`;
Traitmatrix und Detailprüfungen zusätzlich unter
`diagnostics/trait-balance-20261103/`. Browserprüfungen verwenden lokale
Testfiguren und blockieren externe Schreibzugriffe. Transaktionsprüfungen
verwenden ausschließlich `demo-aleria-combat-checkup` auf `127.0.0.1:8180`.

Bestanden sind 857 Fach-, Interface-, Guide- und Regressionstests, 119
Backendprüfungen und 80 echte Emulator-Transaktionsprüfungen. Weitere 19
Würfel-/Bundleprüfungen sowie beide Desktop-/Mobil-Browserabläufe sind bestanden.
Die 285 generierten Server-Regeldateien stimmen per SHA-256 vollständig mit
ihren Browserquellen überein. Gezielt nachgeprüfte neue Regelverträge liegen
zusätzlich in `new-rule-contracts.txt`; sie überlappen die große Fachsuite und
werden nicht nochmals zur Gesamtzahl addiert.

Frühere Fehlversuche bleiben als Diagnosebelege erhalten: Historische
Katalog-Sollwerte mussten den ausdrücklichen Balanceauftrag berücksichtigen.
Ein erster Emulatorlauf ohne Dateitrennung vermischte die Setup-Hooks mehrerer
Testdateien; maßgeblich ist der anschließend isolierte serielle Lauf. Die
Transaktionsprüfung fand außerdem die zunächst fehlende Persistenz der eigenen
Kampfstart-TP; nach deren Korrektur sind alle 80 Fälle bestanden.

Der abschließende unabhängige Review prüfte zusätzlich persönliche
Guide-Varianten und ältere Teilbögen ohne gespeicherte TP-Struktur oder aktuellen
TP-Wert. Die Guides verwenden nun direkt dieselbe exakte Traitrevision wie die
Engine. Teilbögen behalten ihren impliziten aktuellen TP-Stand; nur die
temporären TP werden vergeben. Sieben gezielte Emulatorprüfungen einschließlich
beider Teilbogenformen und tatsächlichem Undo sowie 21 Speicher-/Undo-/
Revisionsprüfungen sind nach dieser letzten Absicherung bestanden. Der lokale
Emulator wurde anschließend beendet.

Inventare, Online-IDs, genealogische Daten, aktuelle TP und verbrauchte
Ressourcen wurden nicht migriert. Alte Auswertungen werden nicht neu gewürfelt.
Historische Quellen und Originaldownloads bleiben erhalten. Die Änderung
wurde nicht veröffentlicht.
