# Charakterbogen-Archiv: Ordnung und Pflege

Stand: 5. September 2026.

## Quellen und Zuständigkeiten

- `Klassenordner/Klassenseite.html` bestimmt die 15 Standardklassen und die Kulturzuordnung der spezifischen Klassen. Das Archiv enthält 85 unterschiedliche Klassenbezeichnungen; Milwr erscheint in beiden belegten Kulturen. Bestehende Regelpakete bleiben in `character-creation-templates.js`. Ein Eintrag aus der Klassenseite erzeugt kein zusätzliches spielbares Regelpaket.
- `Markt/Rossmarkt/Rossmarkt.html` bestimmt Rassen, Heimat, Beschreibung, Bild und Preis samt Währung: 24 Pferderassen, drei Ponyrassen und vier weitere Reittiere. Die übrigen Reittiere stehen unter Vieh. Bekannte Mischlinge aus Figurenbögen erhalten eine eigene Pferdegruppe.
- `character-archive-page-data.js` ist ein generierter Auszug dieser beiden Seiten. Nach Änderungen an den Quellseiten: `npm run sync:archive-pages`. Driftprüfung: `npm run check:archive-pages`.
- `character-archive-classification.js` ordnet Vorlagen, Registerdaten und gespeicherte Altbestände in der Archivansicht ein. Mensch, Tierarten und reine Kreaturenrollen wie Reittier werden nicht als menschliche Kultur oder Charakterklasse geführt. Die ursprünglichen Kreaturenprofile bleiben erhalten.

## Kampfübersicht

`Kampftechniken, Formen & Attacken` verbindet die bisherigen Technik- und Formenansichten. Kanonische Form-IDs und die Klassenfreigaben bestimmen den Pfad Klasse → Kampftechnik → Form → Attacken. Die sieben Drachentanzformen stehen unter Teulu, auch wenn für eine Meisterform noch keine Attacken hinterlegt sind.

Persönliche Attacken ohne kanonische Formzuordnung stehen unter Personen → Name → Attacken; natürliche Kreaturenangriffe unter Kreaturen → Name → Attacken. Freie Angaben wie „Drachentanz · Ausbildungsform“ erzeugen keine zusätzliche kanonische Form.

`Waffen` gruppiert nach der konkreten Waffe. Waffenprofil und Grundangriff bleiben zusammen. Benannte Varianten wie Feuerpfeil oder Schildstoß stehen als waffeneigene Attacken unter dem zugehörigen Bogen bzw. Schild. Waffenanforderungen einer Klassentechnik machen diese nicht automatisch zu einer waffeneigenen Attacke. Neue Speerattacken oder zusätzliche Klassenkampfstile erhalten durch diese Aufräumaktion keine erfundenen Kampfwerte.

Der Archiveintragseditor speichert optionale Beziehungen in `data.archivePlacement`: Klasse, Kampftechnik und Form oder alternativ Person bzw. Waffe. Neue Kampftechniken können einer Klasse, neue Formen ihrer Kampftechnik und Attacken ihrer Form zugeordnet werden. Mehrdeutige Zuordnungen, Selbstbezüge und unpassende Form-/Stilkombinationen werden abgelehnt. Die Auswahl in Charakterbögen bleibt an die ursprüngliche Datenkollektion gebunden.

## Icons

Das Archivschema ist Version 2. Zaubericons aus Altbeständen werden beim Einlesen geleert; es gibt dafür kein automatisch ausgewähltes Ersatzicon. Neue manuelle Archivzuweisungen erhalten `iconAssignmentVersion: 1`. Die Versionsmarkierung bleibt beim Speichern, Zusammenführen und erneuten Laden erhalten. Ein bewusst geleertes Iconfeld bleibt leer, auch wenn ältere Quellen noch ein Bild enthalten.

Archiv und gleichnamige Einträge im Charakterbogen verwenden die aktuelle Zuordnung. Auch bereits geöffnete Bögen zeigen neu gesetzte Icons und entfernen geleerte Icons. Regelsymbole für Kosten, Reichweite und Würfel bleiben eigenständige Angaben.

Die Vorschläge für Traits und Marotten verwenden vorhandene CK2-Dateien aus `IconOrdner/Traits Icon`. Die Zuordnungsregeln liegen in `character-archive-trait-icons.js`; manuelle Archivzuweisungen haben Vorrang.

## Prüfung

- Zehn Archiv-Regressionstests mit echten Bibliotheks- und Figurendaten: kanonische und persönliche Hierarchie, Suche, neue Formen, Waffenvarianten, Kulturklassen, Pferde, Iconmigration, manuelles Setzen/Löschen und lokale CK2-Dateien.
- `npm run check:character-archive` und `npm run check:archive-pages` erfolgreich.
- Gesamte Frontend-Suite: 428 von 429 Tests erfolgreich. Der bereits zuvor fehlschlagende Dashboard-Test erwartet „Die Chronik von Cenyr“ (`tests/dashboard-rendering.test.mjs:64`).
- Produktionsbuild erfolgreich; bestehender Hinweis auf große Bundles.
- Lokale Browserprüfung mit 1440 und 390 Pixeln Breite: Zauber ohne Icons, alle 28 vorhandenen Traits mit CK2-Vorschlägen, Klassenreihenfolge, Pferderassen, aufklappbare Kampfhierarchie und manuelle Iconvergabe. Testschreibvorgänge wurden auf einen lokalen Backend-Ersatz umgeleitet; keine Testdaten nach Firebase geschrieben.

Die Änderungen sind lokal vorbereitet; es erfolgte keine Veröffentlichung.
