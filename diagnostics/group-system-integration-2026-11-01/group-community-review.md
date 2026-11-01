# Unabhängige Gemeinschaftsprüfung

Geprüft wurden die produktiven Roster-, Begleiter-, Szenenzustands- und Fensterprojektionen mit Tests, ohne kanonische Inhalte zu verändern. Die Produktkorrekturen führte der Root-Agent aus.

## Belegte und abgesicherte Korrekturen

- Tatsächliche Idwal-Quelle: die Hierarchie „Schiffskatzen“ mit Bwmbo/Uffel und Untertitel „Cenyric · Schiffskater“ erzeugt keine erfundene menschliche Person.
- Leerstellen einschließlich N.N., unbesetzt, Noch offen, Nicht besetzt, Strichen und HTML-VAKANT erscheinen nicht als Personen. Der echte Namensanfang Pagebert bleibt erlaubt; formatierte echte Namen werden als Klartext projiziert.
- Begleiter benötigen existierende Kreaturdatensätze und konsistente Besitzer-, Inventar- und Instanzverknüpfungen. Menge0, falsche Instanz, falscher Besitzer, verkaufter Bestand und fehlende Datensätze erzeugen keine Tiere. Ein zusätzlicher Metadatenlink umgeht Menge0 des tatsächlichen Besitzstücks nicht. Explizite Tiergäste und automatische Begleiter werden zusammengeführt.
- Charakter und Kreatur mit derselben sammlungsinternen ID bleiben verschieden. Ein vertrauenswürdiger Charakter-Szenensnapshot überschreibt keine Kreatur mit gleicher ID. Importierte, zurückgenommene und unbestätigte Belege ändern die Bereitschaft nicht.
- Anarauts zwei tatsächliche Hierarchien ergeben pro Person einen Eintrag mit mehreren Ämtern. Ein zusätzlicher Testdienst wurde ausschließlich einer Kopie der Quelle hinzugefügt.

## Mengen und Bedienung

`group-roster-window.test.mjs` prüft 2.000 Mitglieder und 51 Besatzungsmitglieder: standardmäßig höchstens20 Personenartikel pro Seite, kompakte Darstellung ab fünf Personen, keine ausgeblendeten übrigen DOM-Seiten. Namens- und akzentunabhängige Rollenfilter, Zuordnungsfilter und Seitenbegrenzung nach schrumpfenden Ergebnissen funktionieren. Der montierte Controller ersetzt bei Liveupdates nur die Ergebnisfläche; Suchfeld, Fokus, Auswahl und aktuelle Seite bleiben erhalten. Listener werden beim Abbau entfernt. DOM-Strukturen werden mit parse5 geprüft; dies ersetzt keine visuelle Browserprüfung.

## Ausführung

23/23 Fälle bestanden im gemeinsamen Lauf von `group-community.test.mjs`, `group-roster-window.test.mjs` und `group-landing-model.test.mjs`. Der bisherige StoredSnapshot-Fall wurde ausdrücklich mit `serverValidatedMechanics:true` als gespeicherter Beleg gekennzeichnet. Endprotokoll: `diagnostics/equipment-standards-2026-11-01/group-community-final.log`. Ein weiterer Menge0-Metadatenfall bestand separat ebenfalls.

## Peercheck Gruppenbestand

Der Bestands-Handler verwendet frisch innerhalb der Transaktion gelesene Inventare und Kampfprofile; ein optionaler Szenenbeleg enthält keine alten TP-/Ressourcen-Overlays. Die tatsächlichen Profil-, Besitzer- und Begleiter-Kampfsperren sowie typisierte Unikat-Holder werden transaktional geprüft. Ein zusätzlich nachgewiesener Fehler in der Besitzerverknüpfung (Menge0 als Begleitermitglied) wurde dem zuständigen Item-Agenten übergeben und von ihm mit positiven endlichen Mengen sowie Regressionen behoben.

## Quellenlücke zur Einordnung

Beim ersten Check besaß Builtin-Tanor `itemOrigin:null`, obwohl Gawains öffentliches Inventar den konkreten Link `gawain-tanor`/`companion-tanor` enthielt. Root hat diese belegte Metadatenlücke anschließend gezielt im öffentlichen Katalog korrigiert. Tanors Herkunftslink stimmt jetzt mit Gawains vorhandenem Besitzstück und dessen Instanz überein; allgemeine Rechte wurden dafür nicht gelockert und Livebesitz nicht umgebucht.
