# Cenyr und Vennyr: Angleichung der Kampftechniken

Stand: 3. November 2026. Auftrag: Klassen und Waffenformen am vorhandenen
Teulu-Schema ausrichten, Auswahl ergänzen und eigene einfache Comicicons mit
abgerundetem quadratischem Rahmen verwenden. Keine Ausarbeitung über Stufe 20.

Ergebnis: 169 zusätzliche Katalogoptionen, insgesamt 378 Drachentanz- und
327 Wyrmtanztechniken. Das neue Set enthält 21 eigens mit dem eingebauten
ImageGen erzeugte Comicmotive, die nach Waffe und Wirkung zugeordnet werden.
[Iconübersicht](../art/combat-technique-icons/overview.png) ·
[Prompts und Quellenmanifest](../art/combat-technique-icons/manifest.json).
Die optimierten PNGs liegen unter `public/assets/combat-technique-icons/`;
die generierten Originale bleiben im Quellenordner des Manifests erhalten.

## Befund und Umfang

Die Schadensökonomie war bereits gemeinsam geregelt. Die größeren Lücken lagen
bei den Vennyr-Waffenwegen und einzelnen cenyrischen Spezialformen: acht oder
weniger Optionen pro Expertenform, schmale Übergänge und fehlende Alternativen
für Nebenwaffen. Ergänzt wurden bezahlte Einzelangriffe, Reaktionen, kurze
Vorbereitungen, Deckungen und Stellungstechniken. Viele Waffen bedeuten mehr
Katalogauswahl, keine zusätzlichen kostenlosen Angriffe oder Ressourcen.

Die Zahlen bezeichnen **Katalogoptionen**, einschließlich geteilter Techniken
und Fähigkeiten. Sie sind keine automatisch auf einem Charakter gespeicherten
Attackenzahlen. Vorher ist der zu Beginn dieses Auftrags geprüfte lokale Stand.

### Cenyr: Optionen vorher → nachher

Alle genannten Drachenformen heißen vollständig „Tanz des …“. „Je“ gilt für
jede einzeln genannte Form. Die unveränderten Formen sind mit aufgeführt.

| Klasse | Jungdrache | Freie Vertiefung | Experten- und Sonderformen | Gesamt |
| --- | ---: | ---: | --- | ---: |
| Milwr | 21 → 29 | — | Drachling 5 → 12 | 26 → 41 |
| Teulu | 26 → 26 | 4 → 4 | Schwertdrache, Abwartender, Fliegender, Ausgeglichener und Zwillingsdrache je 12 → 12; Aufsteigender 6 → 12; Brüllender 15 → 15 | 111 → 117 |
| Cantref | 27 → 27 | 4 → 4 | Speerdrache 12 → 12; Peitschender und Hütender je 8 → 12 | 59 → 67 |
| Uchelwyr | 32 → 32 | 8 → 8 | Speerdrache und Schweifender je 12 → 12; Peitschender und Hütender je 8 → 12; Stürmender 6 → 12 | 86 → 100 |
| Helwyr | 31 → 31 | 4 → 8 | Schwertdrache und Zwillingsdrache je 12 → 12; Abwartender, Fliegender und Ausgeglichener je 18 → 18; Aufsteigender 6 → 12; Brüllender 21 → 21; Lauernder 14 → 14; Jagender 8 → 12 | 162 → 176 |
| Arthwyr | 27 → 27 | 4 → 4 | Schwertdrache, Abwartender, Fliegender, Ausgeglichener und Zwillingsdrache je 12 → 12; Aufsteigender und Bärenklaue je 6 → 12; Brüllender einschließlich früher Klassenattacke 16 → 16 | 119 → 131 |
| Barddwyr | 23 → 25 | 2 → 4 | Trällernder 4 → 4; Schwertdrache 24 → 24; Kreischender 12 → 12 | 65 → 69 |

Trällernder Drache bleibt eine Rapier-Übergangsform für Stufe 7–8. Der
Aufsteigende Drache bleibt die Unterform des Fliegenden Drachen. Speer-, Bogen-,
Zweiwaffen-, Schild- und Reiteranforderungen werden durch mehr Auswahl nicht
aufgehoben. Die Milwr-Waffenausbildung endet weiterhin auf Stufe 15.

### Vennyr und gemeinsamer Derwyn: Optionen vorher → nachher

Brandung, Strömung und Tiefwasser bezeichnen die drei bestehenden Expertenformen
„Tanz der brechenden Brandung“, „Tanz der kreisenden Strömung“ und
„Tanz des stillen Tiefwassers“.

| Klasse | Grundform | Übergang | Expertenformen | Gesamt |
| --- | --- | --- | --- | ---: |
| Milwr | Junge Welle 6 → 12 | — | Küstenwache 5 → 11, nur Stufe 6–15 | 11 → 23 |
| Morwyr | Junge Welle 6 → 12 | Kehrende Flut 4 → 6 | Brandung, Strömung und Tiefwasser je 8 → 12 | 34 → 54 |
| Rhyfelwyr | Junge Welle 6 → 12 | Kehrende Flut 2 → 4 | Brandung, Strömung und Tiefwasser je 8 → 12 | 32 → 52 |
| Ceidwyn | Junge Welle 6 → 12 | Kehrende Flut 4 → 6 | Brandung, Strömung und Tiefwasser je 8 → 12 | 34 → 54 |
| Rhiddwyr | Junge Welle 6 → 12 | Kehrende Flut 5 → 7 | Brandung, Strömung und Tiefwasser je 8 → 12 | 35 → 55 |
| Derwyn, beide Kulturen | Jungdrache 23 → 23 **oder** Junge Welle 6 → 10 | Freie kreative Phase 4 → 8 | Fließender, Brandender, Steigender und Peitschender Wyrm je 8 → 12 | 65 → 89 |

Beim Derwyn enthält die Gesamtzahl beide alternativen Grundfundamente. Sie
werden nicht gleichzeitig kostenlos erlernt. Die neuen Waffenoptionen erhalten
separate Voraussetzungen für Partisane, Harpune, Axt, Hammer, Morgenstern/Flegel,
Kurzbogen, Armbrust, Säbel, Dreizack, Stab und Reiterstangenwaffen. Abgesessene
Alternativen bleiben vorhanden. Fremde Klassen dürfen gekauft werden; ihre
Waffen-, Mindeststufen- und Reiterbedingungen gelten trotzdem.

## Gemeinsames Schadensbudget

Verbindliche Quellen sind
[`weapon-technique-budget.js`](../../modules/combat-styles/weapon-technique-budget.js)
und
[`combat-technique-damage.js`](../../modules/combat/combat-technique-damage.js).
Kosten kaufen einzelne zusätzliche Würfel statt einen vervielfachten gesamten
Waffenpool. Eine Großschwertbasis aus zwei Würfeln erhält pro Zusatzwürfel nur
einen weiteren Würfel. Feste Boni zählen einmal.

Reguläre Einzelzieltechniken erhalten immer nur den höchsten erreichten
Ausbildungswürfel: Stufe 7 W4, 9 W6, 13 W8, 17 W10. Das gilt unabhängig davon,
ob eine Technik erst später gelernt wird. Milwr verwendet stattdessen 6 W4,
10 W6 und 15 W8. Nach der jeweiligen Obergrenze wächst diese Staffel nicht mehr.
Die Milwr-Staffel gilt auch für die kanonischen klassenneutralen
Jungdrachenangriffe und ihre verstärkten vorbereiteten Gegenangriffe. Dabei
bestimmt zuerst die belegte Kaufklasse die Ausbildung, danach die Hauptklasse
oder Klassenidentität. Ein Teulu mit einem Milwr-Kauf erhält dessen W8-Grenze;
ein Milwr mit einem Teulu-Kauf behält dessen Ritterstaffel. Individuell
geschriebene Techniken und abweichend ausgearbeitete Schadensmodelle bleiben
unverändert.

Beispiel: **Schuppenschnitt**, eine Aktion, mit einer Waffe aus 1W8 und ohne feste
Boni:

| Stufe | Schaden |
| --- | --- |
| 2–6 | 1W8 |
| 7–8 | 1W8 + 1W4 |
| 9–12 | 1W8 + 1W6 |
| 13–16 | 2W8 |
| 17–20 | 1W8 + 1W10 |

Reine Bonusangriffe bleiben bei höchstens W4 je Waffenwürfel, halbieren positive
feste Schadensboni abgerundet und erhalten keinen Ausbildungswürfel. Schutz und
Vorbereitung verursachen keinen versteckten Waffenschaden. Starke Kontrolle
bezahlt den schwächsten verfügbaren zusätzlichen regulären Schadenswürfel;
kleine einmalige Stellungseffekte bezahlen einen Schadenspunkt.

Die bestätigte Hellebardenregel mit bis zu vier Zielen bleibt erhalten. Wenn sie
eine Einzelzieltechnik erweitert, verwendet die Laufzeit das gemeinsame
Flächenbudget: Zusatzwürfel höchstens W6 und kein Ausbildungswürfel. Der
Speerdrache bleibt aufgrund seiner Einzelzielregel bei einem Ziel. Die
Anpassung erfolgt über einen optionalen Berechnungskontext; gespeicherte
Attacken werden nicht dafür umgeschrieben.

## Kaufmodus, Situationseffekte und Icons

Die geprüften Waffenfolgen sind bestätigte Katalogangebote. Im gespeicherten
Kaufmodus werden sie einzeln mit Balancepunkten erworben; fremde Klassen kosten
mehr. Ein negativer Punktestand verhindert das Speichern nicht. Ältere Bögen
ohne Kaufmodus behalten ihre bestehende Formvergabe. Klassenwahl oder bloßes
Laden vergibt im Kaufmodus keine Techniken und keine Standardausrüstung.

Strukturierte Deckung, Angriffsboni, Rettungswürfe und einmalige
Stellungseffekte verwenden die vorhandene Kampfmechanik. Leinenführung und
Harpunenzug, Anlauf und tatsächlicher Schiffsraum, Heimlichkeit, Überraschung,
Entwaffnungsversuche und besondere Umweltsituationen benötigen weiterhin die
jeweilige belegte Spielsituation. Die Katalogtexte gewähren keine automatische
Unsichtbarkeit, Gratisgegenangriffe, Rossattacken oder Überbordwürfe.
Vennyr-Klassenmerkmale mit `mechanics: null` bleiben manuell auszuwertende
Merkmale; die Bestätigung der Waffenfolgen automatisiert diese Passiven nicht.

Die eigenen einfachen Comicmotive mit abgerundetem quadratischem Rahmen sind im
[`Iconmanifest`](../art/combat-technique-icons/manifest.json) dokumentiert.
Klassenseiten, Kaufdialog, Charakterbogen und Arsenal verwenden denselben
Resolver. Persönlich zugewiesene Bilder bleiben vorrangig. Die Motive kennzeichnen
Waffen und Handlungen; ähnliche Techniken dürfen dasselbe passende Motiv nutzen.

Es erfolgt **keine Live-Migration** persönlicher Inventare, Ressourcen,
historischer Kampfbelege oder gespeicherter Charaktere. Browser und generierte
Servermechanik müssen vor einer Veröffentlichung gemeinsam geprüft werden.

## Prüfung

Unabhängig geprüft wurden 985 eindeutige Einträge des stilübergreifenden
Technikkatalogs, darunter 190 schadenslose Unterstützungen, mit 63.300
Waffen-/Stufenkombinationen: gültige Mindeststufen, bezahlbare Kosten auf der
Freigabestufe, monotone Ausbildungsstaffel und leere Support-Schadensformeln.
Zusätzlich geprüft: Hellebarden-Flächenkontext ohne Quellmutation, Waffen- und
Reitbedingungen einschließlich fremder Klassenkäufe, Stabführung mit beiden
Händen, echte Schadens- und Schutzauflösung sowie Iconanzeige eines tatsächlich
gekauften Morwyr-Angriffs. Die automatischen Tests bilden keine statistische
Balance aller möglichen Gruppen-, Terrain- und Ausrüstungskombinationen ab.

Abschlussprüfung: **752 Frontend-/Kampftests, 23 Klassenprüfungen und 25
Serverprüfungen bestanden** (800 insgesamt, keine übersprungenen Tests).
Produktionsbuild erfolgreich; alle 21 optimierten Icons sind bytegenau im
Produktionspaket vorhanden. Helwyr und Morwyr wurden zusätzlich im Browser
mit Stufenauswahl geprüft. Die Änderungen sind lokal vorbereitet; es wurde
weder gepusht noch veröffentlicht.
