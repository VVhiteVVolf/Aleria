# System- und Balanceprüfung · 2. November 2026

## Ergebnis und Umfang

Starthilfe, Stufenentwicklung, Charakterbogen, Fertigkeitsproben, Charakterarchiv,
Kampfauflösung, Inventarverknüpfung und generierte Firebase-Regeln wurden gemeinsam
geprüft. Die Änderungen liegen lokal vor; es wurde nichts gepusht, veröffentlicht
oder in produktive Firebase-Daten geschrieben. Der Integrationstest verwendete
ausschließlich das lokal abgesicherte Emulatorprojekt `demo-aleria-combat-checkup`.

Die Starthilfe gibt durch Klassen **keine Gegenstände** aus. Vorhandener Besitz
und Ausrüstung bleiben erhalten. Die ausdrücklich für die sieben Figuren im
ursprünglichen Auftrag erstellten Gegenstände sind davon getrennte Autoreninhalte.
Ein Klassenwechsel, Zusatzklassen und eigene Ausbildungen vergeben auch keine
automatischen Attacken. Kaufpreise und ein negativer Saldo bleiben frei einstellbar.

## Starthilfe und Bedienung

- Schritt 3: Alle Fertigkeiten werden mit vorhandenen Icons angezeigt. Ungeübt,
  Geübt oder Expertise sind manuelle Entscheidungen. Herkunft, Hintergrund und
  Klassen empfehlen lediglich; Vorschläge benötigen eine ausdrückliche Übernahme.
- Schritt 4: Hauptklasse, mehrere zusätzliche Klassen und eine eigene benannte
  Ausbildung lassen sich kombinieren. Trefferwürfel, Rettungswürfe,
  Waffen-/Rüstungsausbildung, Werkzeuge, Sprachen und Magie-/Fokuszugang können
  einzeln ausgewählt werden. Typische Klassenwaffen sind bebilderte Hinweise.
- Die Hauptklasse bleibt Grundlage der bestehenden Stufenprogression. Zusatzklassen
  gelten beim Kauf als eigene Klassen; sie vervielfachen keine Ressourcen und
  vergeben keine zusätzlichen Klassenpassiven. Es gibt keine automatische
  Aufteilung von Stufen auf Klassen.
- Bestehende Figuren öffnen mit ihrer Ausbildung und bisherigen Stufe. Attribute
  und verbrauchte Vorräte werden nicht durch den Assistentenstart zurückgesetzt.
  Ein Neustart auf Stufe 1 ist eine ausdrückliche Wahl.
- Fertigkeits-, Klassen-, Attribut-, Waffen- und Ressourcenbilder werden aus den
  vorhandenen Registern verwendet. Beide Fenster teilen den dunklen Oldschool-Stil
  mit eigener Sternenfries-Grafik. Die Bedienung ist deutsch.
- Texteingaben, Klassenwechsel und Fokusverlust erzeugen keine verschachtelten
  Neuzeichnungen mehr. Aufgeklappte Bereiche und die Scrollposition bleiben bei
  entsprechenden Aktualisierungen erhalten.

## Gefundene und behobene Logikfehler

| Befund | Korrektur |
| --- | --- |
| Überzeugen/Überreden und Überlebenskunst/Überleben wurden unterschiedlich erkannt. | Gemeinsame Fertigkeitsidentitäten für Bogen, Szenenproben, Icons, Modifikatoren und KI-Kontext. |
| Trait-Expertise erschien nicht überall als wirksame Ausbildung. | Wirksame Expertise wird berechnet und im Kontext ausgewiesen; die gespeicherte Grundausbildung bleibt erhalten. |
| Arkaner Fokus: allgemeines −1 Angriff neutralisierte +1 Zauberangriff. | Der Malus betrifft ausdrücklich Waffenangriffe. Der Zauberbonus wirkt tatsächlich. |
| Der Kaufkatalog übernahm unfertige Entwurfsattacken als freigegeben. | Nur tatsächlich spielbare, bestätigte Angebote werden zugelassen: 193 statt 1.142; 949 Entwurfsangebote bleiben unverändert Entwurf. |
| Entfernte und erneut gewählte gekaufte Techniken konnten neu berechnet werden. | Alte Kaufbelege behalten Preis und Klassenquelle; Wiederaufnahme kostet keine weiteren Punkte. |
| Phobien übersahen teilweise Schadenstypen strukturierter Zaubereffekte. | Primäre und sekundäre Rettungswürfe berücksichtigen deren Schadensarten. Ein normaler Angriffszauber erzeugt dadurch keinen falschen Angriffsnachteil. |
| XP und Ressourcenwahlen ließen sich auf derselben Stufe nicht vollständig übernehmen. | Sie werden auch ohne Stufenzuwachs verarbeitet und in der Vorschau sichtbar. |
| Magievorlagen verloren teilweise Fokus-, Pakt- oder Himmelsressourcen-Zuordnungen. | Die vorhandene Ressourcenführung wird erhalten; manuelle Auswahl unterstützt dieselben Zugänge. |
| Archivkopien verloren durch neue Instanzkennungen ihre Katalogzuordnung. | Stabile Referenzen für Traits und Techniken überstehen Browser und Server. Kaufbelege, Ausbildungsanforderungen und Auswahl erkennen sie wieder. |
| Derselbe Katalogeintrag konnte erneut aus dem Archiv übernommen werden. | Erneute Auswahl öffnet den vorhandenen Eintrag zur Bearbeitung. Exakte doppelte Traits werden im Entwicklungsvorschlag sichtbar zusammengeführt. |
| Mehrere Klassennamen konnten im Archiv als eine erfundene Kombinationsklasse landen. | Jede ausgewählte Klasse und die eigene Ausbildung werden getrennt erfasst. |
| Speichergrenzen konnten neue Käufe/Merkmale still abschneiden. | Sichtbare Meldungen an den bestehenden technischen Grenzen: 256 Techniken/Kaufbelege und 120 Merkmale. Ein negativer Punktestand bleibt erlaubt. |

Die optionalen Referenz- und Klassenfelder werden zentral normalisiert. Die
gemeinsame Spielmechanik wurde in die generierten Servermodule übernommen;
keine zweite unabhängige Regelberechnung wurde eingeführt.

## Balance

Die Wirkung aller 74 Traits wurde auf Stufe 1, 5, 10, 20 und 30 erfasst:
[Wirkungsmatrix](trait-effects-after.json). Der Katalog enthält 30 ursprüngliche,
20 körperbezogene, 20 ergänzende und vier aus vorhandenen Figuren abgeleitete Traits.
Alle besitzen eigene kreisförmige Comicbilder und transparente Webableitungen.

Nicht stapelbare Resistenz, Anfälligkeit, Expertise und Vorteil werden für die
Bilanz nur einmal bewertet. Bereits vorhandene persönliche Effekte und bestehende
Expertise werden dabei berücksichtigt. Resistenz und Anfälligkeit derselben Art
heben ihre Schadens- und Kostenanteile auf. Eine Immunität überdeckt entsprechende
Schadensanteile. Überlappende Anfälligkeiten vervierfachen den Schaden nicht.
Zahlenboni können sich weiterhin addieren.

Die Bilanz ist eine Orientierung für gekaufte Techniken und Katalogtraits, keine
vollständige Leistungsbewertung. Persönliche Altmerkmale und frei gewählte
Grundausbildung werden nicht rückwirkend berechnet. Widersprüchliche Körpergrößen
oder Erscheinungsmerkmale sowie gefährliche Kombinationen erzeugen Hinweise;
die Auswahl bleibt frei. Magiescheu ohne eigene Magie wird ausdrücklich als
gegenwärtig schwacher Nachteil kenntlich gemacht. Kontext und Spielhäufigkeit
eines Nachteils bleiben eine individuelle Abwägung.

Die folgenden Kosten wurden an die tatsächliche Wirkung angepasst. Die vom
Nutzer gewünschten Beispielwirkungen bleiben erhalten:

| Trait | Vorher | Jetzt | Grund |
| --- | ---: | ---: | --- |
| In der Natur aufgewachsen | 3 | 4 | Expertise und zusätzlicher Fertigkeitsbonus. |
| Flinke Füße | 1 | 0 | Mehr Bewegung wird durch −1 RK ausgeglichen. |
| Standfest | 1 | 2 | Dauerhafte RK ist stärker als der geringe Bewegungsnachteil. |
| Giftfeste Konstitution | 3 | 4 | Giftresistenz und Rettungswurfbonus. |
| Arkaner Fokus | 0 | 1 | Waffenmalus ist für reine Zaubernde weniger einschränkend. |
| Zähe Magie | 1 | 2 | +1 Zauber-SG ist stärker als der geringe Bewegungsnachteil. |
| Lebhafter Geist | 1 | 3 | +1 auf sämtliche Fertigkeiten bleibt trotz −1 RK ein breiter Vorteil. |
| Heilerhände, Spürnase, Bühnenbegabt, Flinke Finger, Geborener Fährtenleser, Lügenriecher | jeweils 3 | jeweils 4 | Vorteil und zusätzlicher Fertigkeitsbonus. |

Scharfe Augen erläutert jetzt den gesamten passiven Wahrnehmungszuwachs:
Fertigkeitsbonus und zusätzlicher passiver Bonus ergeben zusammen +3. Riesenblut
erhöht keinen Zauberschaden. Schaden, RK, TP, Rettungswürfe, Waffen- und
Zauberangriffe verwenden weiterhin die bestehenden Wirkungsbereiche.

## Prüfung vorhandener Figuren

265 öffentliche Datensätze wurden erfasst, davon 29 mit Kampfbogen und 14 mit
Traits. Die ausführliche Bestandserfassung liegt unter
[bestehende Merkmale](existing-character-traits.json), die aktuelle Übersicht unter
[Abschlussanalyse](final-analysis.json). Es gab keinen pauschalen Austausch
persönlicher Merkmale: Ähnliche Namen bedeuten häufig unterschiedliche Wirkungen.
Der Assistent zeigt passende vorhandene Überschneidungen als Hinweis an.

| Vorhandene Figur/Merkmale | Entscheidung |
| --- | --- |
| Freya: Künstlerische Ausbildung | Inspiration für Bühnensicher: Vorteil auf Auftreten, 3 Punkte. Bereits vorhandener gleicher Vorteil wird nicht doppelt bepreist. |
| Freya: Frohnatur und Exzentrische Künstlerin | Inspiration für die allgemeinen Traits Frohnatur (+1 Überreden/Auftreten/Motiv erkennen, 2 Punkte) und Bühnenmensch (+2 Auftreten, −2 Überleben, −1 Einschüchtern, −1 Punkt). Freyas persönliche Bedingungen bleiben erhalten. |
| Freya: Busenwunder | Bleibt persönlich: +4 Flirten ist nicht gleichbedeutend mit dem anders wirkenden Körpertrait Vollbusig. |
| Rhiannon: Hervorragende Arkane Ausbildung | Inspiration für Arkan geschult: ausschließlich Vorteil auf Arkane Kunde, 3 Punkte. Ihre persönliche Ausbildung mit zusätzlichem Zauberangriff und SG bleibt erhalten. |
| Gildas: Erarbeitete Standfestigkeit | Bleibt persönlicher Bonus auf Rettungswürfe; der Katalogtrait Standfest verändert RK/Bewegung und ist kein gleichwertiger Ersatz. |
| Guinevere: Scharfsinnig/Jägerauge | Persönliche und zielabhängige Ausbildung bleibt erhalten; sie wird nicht als bedingungsloser allgemeiner Waffenbonus umgeschrieben. |
| Ylva, Asgeir und Duncan | Veteranen-, Klassen- und Geschichteffekte bleiben persönlich. Kein Übertragen auf Gegenstände und kein pauschales Stufe-1-Traitpaket. |

Erzählbedingungen wie freundlicher Umgang mit Menschen oder Sichtverhältnisse
werden nicht als universell automatisch erkennbare Bedingungen ausgegeben.
Bestehende persönliche Sonderregeln benötigen weiterhin ihre bisherige
Interpretation; diese Prüfung erfindet keine dazu passenden Zustände oder Filter.

Die vier neuen Bilder wurden tatsächlich angesehen. Quellen, Motive, Hashes
und Alpha-/Webableitung stehen im [Bildbeleg](inspired-traits-art-receipt.json).

## Prüfbelege

| Prüfung | Ergebnis |
| --- | --- |
| Vollständige Frontendtests | 2.120 bestanden, 0 Fehler. |
| Fachprüfung für Charakterentwicklung und ihre Schnittstellen | 70 bestanden, 0 Fehler; aktuelle Autorenquellen und Figurenabgleich zusätzlich geprüft. |
| Backendtests mit abgeglichenen Servermodulen | 330 bestanden, 0 Fehler. |
| Echter lokaler Firestore-Kampfintegrationstest | 74 bestanden, 0 Fehler; einschließlich Mehrklassenbogen, gekaufter Technik, Traits, negativer Bilanz und erhaltener Ausrüstung. |
| Build- und Veröffentlichungsschutztests | 26 bestanden, 0 Fehler. |
| Produktionsbuild einschließlich regulärer Vorbereitungen | Erfolgreich. Vorhandene Warnung über große JavaScript-Pakete bleibt bestehen. |
| Importabhängigkeiten der Gameplay-Prüfung | 1.540 Quellmodule abgedeckt. |
| Browser: Starthilfe | Erfolgreich: manuelle Fertigkeiten, Klassenwechsel, Zusatz-/eigene Klasse, Stufe 5, Kauf, Traits, Minusstand und unveränderte Ausrüstung. |
| Browser: Stufenfenster | Erfolgreich: Mindeststufenprüfung, Filter, 74 Traits, Kauf, Minusstand, Übernahme/Neuladen, Desktop und Mobilansicht ohne horizontales Überlaufen. |

Die jeweiligen Textprotokolle liegen neben diesem Bericht. Bilder und Berichte:
[Starthilfe](creation-browser/report.json), [Stufenfenster](level-up-browser/report.json).
Die Prüfbrowser sperren externe Schreibzugriffe; eine sichtbare
Online-Synchronisationsmeldung in einem Bildschirmfoto stammt von dieser
beabsichtigten Sperre. Es wurden keine JavaScript-Seitenfehler erfasst.

Der abschließende Quelldatencheck erkannte veraltete Familienzuordnungswerte
bei den sieben Autorenfiguren. Der aktuelle kanonische Identitätsabgleich setzt
deren Zuordnungswert auf 1.000 statt 275; nur diese Metadaten und ihre Prüfsummen
wurden aktualisiert. Der [Differenzbeleg](source-differences.json) dokumentiert
die betroffenen Felder. [258 andere Figuren und sämtliche Reiter](unrelated-preserved.json)
blieben unverändert. Alle sieben Figuren bleiben auf Stufe 1.

## Verbleibende fachliche Grenzen

Skalde, Skjaldr, Skytte, Morwyr und Magier haben derzeit kein freigegebenes eigenes
Angebot in diesem Kaufkatalog. Das Fenster weist darauf hin; Entwurfsattacken
werden nicht als fertige Regeln angeboten. Bereits gelernte persönliche Attacken
bleiben vorhanden, und fremde Angebote können gewählt werden. Eigene neue
Klassenattacken werden weiterhin individuell ausgearbeitet.

Es wurden weder persönliche Online-Inventare noch aktuelle Kampfressourcen oder
historische Auswertungen migriert. Der lokale Emulator wurde nach der Prüfung
beendet. Eine Veröffentlichung ist kein Teil dieses Checkups.
