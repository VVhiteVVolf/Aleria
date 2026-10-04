# Lynnes Schiffsmannschaft – Leere Flasche

Das Modul `lynnes-schiffsmannschaft` folgt dem am 4. Oktober 2026 abgerufenen Online-Modul `idwals-schiffsmannschaft`. Es liegt entsprechend der abschließenden Nutzerzuordnung direkt unter **Gruppen → Klaueninseln → Haus Arth**.

## Inhalt und Quellen

- Vier Inhaltsseiten: Schiffsübersicht, Lady Lynne Arth, Hierarchie der Mannschaft und Schiff als offene Szenenseite. Hinzu kommt wie bei Idwal die automatisch angehängte Kommentarseite.
- 17 namentlich belegte Besatzungsmitglieder, die Bordtiere Nuppi und Sir Schmusefuß sowie die drei gelieferten Wappen Mathgraig, Morgwynt und Morglan.
- Die Hierarchie verwendet die vorhandenen Register Führung, Kämpfer und Besatzung. Bordtiere und Wappen stehen bei der Besatzung. Die Liste ist keine namentliche Vollerfassung der 50–60 Personen an Bord.
- Grundlage ist die vom Nutzer am 4. Oktober 2026 eingefügte HTML-Beschreibung. Altersspannen bleiben Altersspannen; die Schreibweise Mathgraig folgt der Überschrift und Wappenbezeichnung der Vorlage.
- Lynnes Kapitänsbiografie fasst ausschließlich die Angaben der Vorlage zusammen. Das Geburtsjahr 1718 stammt aus `Stammbäume/assets/data/published-families/haus-arth.json`.
- Keine zusätzlichen Lebensgeschichten, Klassen, Stufen oder Kampfwerte. Die Kapitänsseite und Mannschaftskarten sind Modulinhalt; separate Charakter- oder Kreaturendatensätze werden durch dieses Paket nicht angelegt.

## Vollständiger Postenabgleich mit Idwal

Auf Nutzerwunsch wurden die Stellen und Ebenen am 4. Oktober 2026 vollständig mit Idwals aktueller Online-Hierarchie abgeglichen. Alle 17 bekannten Personen und beide Bordtiere behalten ihre bisherigen Porträts und Beschreibungen. Weitere Stellen heißen **Nicht benannt**; daraus folgt keine tatsächliche Vakanz und es werden keine Personen erfunden.

| Register | Menschliche Stellen | Aufteilung |
| --- | ---: | --- |
| Führung | 16 | Vorhandene 13 Posten plus Waffenmeisterin, Ausguck auf dem Krähennest und Segelmeisterin |
| Kämpfer | 16 | Je 4 Ritter, Waffenknechte, Knappen und Pagen zur See; Eira und Una bleiben die beiden benannten Knappinnen |
| Besatzung | 22 | Schreiberin, Schiffsköchin, Proviantmeisterin, 3 Seiler/Handwerker, 2 Gehilfen, 3 Altmatrosen, 6 Matrosen und 5 Schiffsjungen |

Insgesamt sind damit 54 menschliche Posten dargestellt, davon 17 namentlich zugeordnet. Die Zahl liegt innerhalb der vorgegebenen 50–60 Besatzungsmitglieder. Bordtiere und Wappen werden nicht mitgezählt. Die bisherigen Sammelposten wurden in die entsprechenden Einzelstellen aufgelöst; ihre Aussagen zur gemischten Besatzung und zum Austausch vor einer Schlacht bleiben erhalten. Der Kompatibilitätsbereich `hierarchy.levels` entspricht weiterhin exakt dem Führungsregister. Idwals Modul dient ausschließlich als Referenz.

## Paket und Bilder

Importierbares Paket: [lynnes-schiffsmannschaft-modulpaket-2026-10-04.json](../../../Charakter%20Archiv%20Exporte/Biographien/lynnes-schiffsmannschaft-modulpaket-2026-10-04.json).

Die 22 gelieferten Bilddateien sind unverändert unter [assets/ship-crews/lynnes-schiffsmannschaft](../../assets/ship-crews/lynnes-schiffsmannschaft/) gesichert. `assets.json` enthält Quelladressen, Dateigrößen und SHA-256-Prüfsummen. Das bestehende Wappen des Hauses Arth wird aus dem Stammbaum-Bildbestand referenziert.

Das zusätzliche Schiffsbild `leere-flasche.png` wurde mit dem eingebauten `image_gen` im gewünschten 2:3-Format erzeugt. Es dient der Übersicht, der Hierarchie und der Schiffsseite. Der vollständige verwendete Prompt steht in [image-prompt.json](../../assets/ship-crews/lynnes-schiffsmannschaft/image-prompt.json); Grundlage ist der Frieren-/One-Piece-Anime-Stilprompt des Nutzers. Vorhandene Porträts wurden nicht neu generiert.

## Speicherung und Prüfung

Die Veröffentlichung fügt einen Datensatz in `module_store_entries` und dessen Zuordnung im bestehenden Modulverzeichnis hinzu. Versionsgeprüfte, atomare Speicherung; die vorherige Konfiguration wird lokal in einem nicht veröffentlichten Backup gesichert. Andere Module, Figuren, Inventare, Kampfdaten, Kommentare und bestehende Szenen sind nicht Teil der Schreiboperation. Die neue Szenenseite erhält kein erfundenes Weltdatum und keine alten Kommentare.

Validierung mit den bestehenden Import- und Sanitizerfunktionen sowie `npm run check:templates`. Browserprüfung aller vier Inhaltsseiten, drei Hierarchieregister und Modulbilder; mobile Prüfung bei 390 Pixeln ohne Seitenüberlauf. Die bestehende Anwendungsarchitektur benötigt für dieses Modul keine Änderungen.
