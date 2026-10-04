# Lynnes Schiffsmannschaft – Leere Flasche

Das Modul `lynnes-schiffsmannschaft` folgt dem am 4. Oktober 2026 abgerufenen Online-Modul `idwals-schiffsmannschaft`. Es liegt entsprechend der abschließenden Nutzerzuordnung direkt unter **Gruppen → Klaueninseln → Haus Arth**.

## Inhalt und Quellen

- Vier Inhaltsseiten: Schiffsübersicht, Lady Lynne Arth, Hierarchie der Mannschaft und Schiff als offene Szenenseite. Hinzu kommt wie bei Idwal die automatisch angehängte Kommentarseite.
- 17 namentlich belegte Besatzungsmitglieder, die Bordtiere Nuppi und Sir Schmusefuß sowie zwölf Familienwappen. Die drei gelieferten Wappen Mathgraig, Morgwynt und Morglan bleiben erhalten; die spätere Bild- und Familienpflege ist unten dokumentiert.
- Die Hierarchie verwendet die vorhandenen Register Führung, Kämpfer und Besatzung. Bordtiere und Wappen stehen bei der Besatzung. Die Liste ist keine namentliche Vollerfassung der 50–60 Personen an Bord.
- Grundlage ist die vom Nutzer am 4. Oktober 2026 eingefügte HTML-Beschreibung. Altersspannen bleiben Altersspannen; die Schreibweise Mathgraig folgt der Überschrift und Wappenbezeichnung der Vorlage.
- Lynnes Kapitänsbiografie fasst ausschließlich die Angaben der Vorlage zusammen. Das Geburtsjahr 1718 stammt aus `Stammbäume/assets/data/published-families/haus-arth.json`.
- Keine zusätzlichen Lebensgeschichten, Klassen, Stufen oder Kampfwerte. Die Kapitänsseite und Mannschaftskarten sind Modulinhalt; separate Charakter- oder Kreaturendatensätze werden durch dieses Paket nicht angelegt.

## Vollständiger Postenabgleich mit Idwal

Auf Nutzerwunsch wurden die Stellen und Ebenen am 4. Oktober 2026 vollständig mit Idwals aktueller Online-Hierarchie abgeglichen. Alle 17 bekannten Personen und beide Bordtiere bleiben erhalten. Weitere Stellen heißen **Nicht benannt**; daraus folgt keine tatsächliche Vakanz und es werden keine Personen erfunden.

| Register | Menschliche Stellen | Aufteilung |
| --- | ---: | --- |
| Führung | 16 | Vorhandene 13 Posten plus Waffenmeisterin, Ausguck auf dem Krähennest und Segelmeisterin |
| Kämpfer | 16 | Je 4 Ritter, Waffenknechte, Knappen und Pagen zur See; Eirlys (zuvor Eira) und Una sind die beiden benannten Knappinnen |
| Besatzung | 22 | Schreiberin, Schiffsköchin, Proviantmeisterin, 3 Seiler/Handwerker, 2 Gehilfen, 3 Altmatrosen, 6 Matrosen und 5 Schiffsjungen |

Insgesamt sind damit 54 menschliche Posten dargestellt, davon 17 namentlich zugeordnet. Die Zahl liegt innerhalb der vorgegebenen 50–60 Besatzungsmitglieder. Bordtiere und Wappen werden nicht mitgezählt. Die bisherigen Sammelposten wurden in die entsprechenden Einzelstellen aufgelöst; ihre Aussagen zur gemischten Besatzung und zum Austausch vor einer Schlacht bleiben erhalten. Der Kompatibilitätsbereich `hierarchy.levels` entspricht weiterhin exakt dem Führungsregister. Idwals Modul dient ausschließlich als Referenz.

## Paket und Bilder

Importierbares Paket: [lynnes-schiffsmannschaft-modulpaket-2026-10-04.json](../../../Charakter%20Archiv%20Exporte/Biographien/lynnes-schiffsmannschaft-modulpaket-2026-10-04.json).

Die 22 gelieferten Bilddateien sind unverändert unter [assets/ship-crews/lynnes-schiffsmannschaft](../../assets/ship-crews/lynnes-schiffsmannschaft/) gesichert. `assets.json` enthält Quelladressen, Dateigrößen und SHA-256-Prüfsummen. Das bestehende Wappen des Hauses Arth wird aus dem Stammbaum-Bildbestand referenziert.

Das zusätzliche Schiffsbild `leere-flasche.png` wurde mit dem eingebauten `image_gen` im gewünschten 2:3-Format erzeugt. Es dient der Übersicht, der Hierarchie und der Schiffsseite. Der vollständige verwendete Prompt steht in [image-prompt.json](../../assets/ship-crews/lynnes-schiffsmannschaft/image-prompt.json); Grundlage ist der Frieren-/One-Piece-Anime-Stilprompt des Nutzers.

## Nachbearbeitung der Porträts und Familien

Der Folgeauftrag vom 4. Oktober 2026 verwendet den Ordner `Downloads/Lynnes Crew`. Die zwölf darin enthaltenen Personenporträts wurden mit dem eingebauten `image_gen` einzeln im Format 2:3 neu gezeichnet. Identität, Alter, Haare, Narben und Grundkleidung folgen den Originalen; die Szenen enthalten weniger Gegenstände und keine Hintergrundfiguren. Mathgraig-, Morglan- und Morgwynt-Rüstung wurden entsprechend der ausdrücklichen Rückmeldung ausschließlich als Referenzen verwendet. Tiere, die vorhandenen Wappen und die übrigen fünf Mannschaftsporträts wurden nicht neu gezeichnet.

Die Originalbilder bleiben erhalten. Die neuen Porträts stehen im Unterordner [anime-2026-10-04](../../assets/ship-crews/lynnes-schiffsmannschaft/anime-2026-10-04/). [prompts-and-assets.json](../../assets/ship-crews/lynnes-schiffsmannschaft/anime-2026-10-04/prompts-and-assets.json) enthält die vollständigen Prompts, verwendeten Referenzen, Abmessungen und SHA-256-Prüfsummen aller 19 erzeugten Bilder. Sieben neue 1:1-Wappen ergänzen die drei gelieferten Wappen und die vorhandenen Wappen von Dyger und Beryn.

| Haus | Einordnung | Wappen |
| --- | --- | --- |
| Mathgraig | Bürgerhaus; Hafenbezug | Vorhandene Bärenpranke über Felsen und Wellen |
| Prys | Bürgerhaus aus Talgarth; große Taverne | Neuer Becher mit Flechthenkeln, Leitstern und Wellen |
| Morgwynt | Niederes Ritterhaus | Vorhandene Möwe mit Wind und Wellen |
| Morglan | Alte Fischerfamilie, bürgerlich eingeordnet | Vorhandener Fisch mit Netz und Wellen |
| Bowen | Bürgerhaus; Familienwerft | Neue Schiffsrippe mit Zimmermannswerkzeug und Wellen |
| Bevan | Hausrang und genauer Sitz offen | Neuer Windknoten mit Heilblatt und Wellen |
| Arian | Hausrang und genauer Sitz offen | Neuer Navigationsstern mit Münzring und Wellen |
| Dyger | Bestehendes niederes Ritterhaus aus Talgarth | Bestehendes Dyger-Wappen |
| Hirschhorn | Hausrang und genauer Sitz offen; Sigrid stammt aus Ivarsheim | Neues Geweih über Schiffskiel und Wellen |
| Beryn | Bestehendes niederes Ritterhaus aus Talgarth | Bestehender Bär mit Dreizack |
| Penry | Bürgerhaus; Meleri ist Enkelin des Arth-Vogtes | Neuer Schlüssel mit Knotengriff und Wellen |
| Parry | Hausrang und genauer Sitz offen | Neuer Kochkessel mit Windrose und Wellen |

Zehn neue Familienakten nutzen das vorhandene Stammbaumregister unter `Cenyr / Klaueninsel`. Prys liegt nach seiner belegten Herkunft in `Sturmklaue / Talgarth`; die übrigen neuen Akten erhalten keinen erfundenen Ort oder Lehnsherrn. Die bestehende Singularbezeichnung des Stammbaumregisters bleibt erhalten. Das Almanachmodul liegt weiterhin unter **Gruppen → Klaueninseln → Haus Arth**. Sigrids Herkunft aus Ivarsheim wird durch die gewünschte Registerzuordnung nicht umgeschrieben. Awen und Eirlys werden in Dyger beziehungsweise Beryn ergänzt, ohne Eltern, Ehen oder Verwandtschaftsgrade zu erfinden.

### Namensprüfung

Geprüft wurden der lokale Bestand von 399 registrierten Familien vor der Erweiterung, die veröffentlichten Familien-JSONs sowie 43 Online-Almanachmodule und 295 Charakterdatensätze. Die zwölf vollständigen Namen waren nur im bereits angelegten Mannschaftsmodul belegt. Innerhalb von Beryn existiert jedoch bereits **Eira (1688), Gemahlin Cadells**; ihr eigener Nachname ist nicht gespeichert. Um die Verwechslung innerhalb derselben Familie zu vermeiden, heißt die 14-jährige Knappin jetzt **Eirlys Beryn**. Die ältere Eira bleibt unverändert. Die Dateischreibweisen **Awen Dygar** und **Mabli Morgwynth** wurden an **Awen Dyger** und **Mabli Morgwynt** aus der Vorlage angeglichen.

### Prüfung der Nachbearbeitung

Alle zwölf Familienakten und ihre neuen Porträts wurden im Browser geöffnet. Personenlinks auf Angehörige ohne bekannte Abstammung wählen nun beim ersten Aufruf deren eigenen Zusammenhang im Baum; normale Familienaufrufe und verbundene Angehörige behalten die bisherige Startansicht. Die bestehende Viewport-Logik kapselt diese Entscheidung, ohne Beziehungen oder gespeicherten Familienfokus zu verändern.

Almanach: vier Inhaltsseiten, drei Hierarchieregister und sämtliche Bilder geprüft; bei 390 Pixeln kein Seitenüberlauf. `check:templates`, die gezielten Familien-/Personenlinktests und alle 1.246 Haupttests der Stammbäume bestehen. Der zusätzliche Coeddu-Craigddu-Test zur Übernahme einer Hausbiografie schlägt schon im unveränderten Git-Ausgangsstand fehl; der identische Fehler wurde separat reproduziert und gehört nicht zu dieser Änderung. Die Veröffentlichung aktualisiert nur Lynnes Modul, die Verzeichniszeit und die ausdrücklich betroffenen Familienakten; bestehende Kampf- und Szenendaten bleiben erhalten.

## Speicherung und Prüfung

Die Veröffentlichung fügt einen Datensatz in `module_store_entries` und dessen Zuordnung im bestehenden Modulverzeichnis hinzu. Versionsgeprüfte, atomare Speicherung; die vorherige Konfiguration wird lokal in einem nicht veröffentlichten Backup gesichert. Andere Module, Figuren, Inventare, Kampfdaten, Kommentare und bestehende Szenen sind nicht Teil der Schreiboperation. Die neue Szenenseite erhält kein erfundenes Weltdatum und keine alten Kommentare.

Validierung mit den bestehenden Import- und Sanitizerfunktionen sowie `npm run check:templates`. Browserprüfung aller vier Inhaltsseiten, drei Hierarchieregister und Modulbilder; mobile Prüfung bei 390 Pixeln ohne Seitenüberlauf. Die bestehende Anwendungsarchitektur benötigt für dieses Modul keine Änderungen.

### Einzelne Biografie übertragen

Auf der Seite **Lady Lynne Arth** steht im Drei-Punkte-Menü **Diese Biografie exportieren** bereit. Die JSON-Datei lässt sich im Almanach-Charakterprofil unter **Biographie → Biographie importieren** oder in der bearbeitbaren Stammbaum-Biografie unter **Importieren** laden. Anschließend die Biografie beziehungsweise das Charakterprofil speichern; im Stammbaum zusätzlich den bestehenden Weg zum Online-Speichern nutzen.

Die Datei verwendet das gemeinsame Format `aleria.biography-module` Version 1. Sie enthält ausschließlich die ausgewählte Biografie: Infotabelle, Zitate, Abschnitte, Verbindungen, Besitzkarten und Bildverweise. Hauptportrait und weitere Portraitstufen bleiben erhalten. Relative Bildpfade werden beim Export gegen die Quellseite aufgelöst; Bilder bleiben verknüpft und werden nicht als Bilddateien eingebettet. Ein eigenes Biografieportrait kann im Editor unter [1] geändert oder geleert werden; bei leerem Feld gilt wieder das Profil-/Stammbaumportrait. Der Import ändert weder Personenidentität noch Verwandtschaften, Profilportrait oder Kampfdaten.

Das gemeinsame Dateiformat liegt in `js/biography/biography-transfer.mjs`; der Leseradapter gehört zum Biografie-Feature. Beide Importziele prüfen Schema und Version vor der Übernahme in den Entwurf. Die Veröffentlichung des Stammbaums erhält das optionale Feld `biography.portrait`. Regressionstests verwenden dieses tatsächliche Mannschaftspaket; der lokale Browsertest prüft Download, Dateiimporte, Editor, Leseansicht und Stammbaum-Speicherdaten ohne Online-Schreibzugriffe.

