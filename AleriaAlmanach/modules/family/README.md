# Family-Modul

Das Family-Modul verwaltet professionelle Genealogie als versioniertes Aleria-Dokument. Family Chart 0.9.0 ist ausschließlich die austauschbare Darstellungs-Engine; das fachliche Datenmodell enthält keine Library-Strukturen.

## Architektur und Ownership

1. `family-api.js` stellt den stabilen Namensraum und die Schemaversion bereit.
2. `editor/` besitzt das deklarative Editor-Schema, sichere Datenoperationen und die gemeinsame UI für statischen und Inline-Editor.
3. `services/` löst fachliche Anzeigedaten wie Haus, Linie, Titel, Erbfolge und Blutlinie auf.
4. `compatibility/` projiziert bestehende, levelbasierte Seiten zur Laufzeit in das v2-Modell, ohne Quelldaten zu verändern.
5. `migration/` führt nur auf ausdrückliche Benutzeraktion eine reversible Migration im aktuellen Entwurf aus.
6. `adapters/` ist die einzige Schicht, die Family Chart und D3 kennt und Aleria-Beziehungen in Library-Daten übersetzt.
7. `rendering/` besitzt Mount-, Unmount-, Fokus-, Ausrichtungs-, Resize- und Fit-Lebenszyklus.
8. `family-renderer.js` erzeugt die Almanach-Oberfläche und kennt die Rendering-Library nicht.

Die Abhängigkeit verläuft damit in eine Richtung:

`Almanach-UI → Family-Domäne → Adapter → Family Chart`

Ein Austausch der Rendering-Engine bleibt auf Adapter und Rendering-Controller begrenzt.

## Datenvertrag

Persistiert werden Personen sowie direkte Beziehungen:

- Partnerschaften einschließlich Mehrfachehen, Trennung, Verlobung, Affäre und eigener Arten
- Elternschaften einschließlich biologischer, adoptiver, Pflege-, Stief-, magischer und beanspruchter Abstammung
- Legitimität, Gewissheit, Sichtbarkeit und Quellenbezüge
- nicht-genealogische Bindungen mit Rollen, etwa Vormund und Mündel
- Häuser, Dynastien, Linien, Hauswechsel, Titel, Ansprüche, Erbfolge und Blutlinien
- unbekannte oder geheime Personen als eigenständige Platzhalterdatensätze

Abgeleitete Begriffe wie Geschwister, Halbgeschwister, Onkel, Tante oder Cousin werden nicht gespeichert. Die Stammbaumstruktur entsteht aus Partnerschaften und Elternschaften; veraltete abgeleitete Legacy-Verbindungen werden bei der Projektion bewusst verworfen.

Unbekannte Erweiterungsfelder unter `extensions` werden beim Bearbeiten erhalten. Die Editor-Sammlungen sind deklarativ registriert, sodass neue Fachbereiche ohne duplizierte Formularlogik ergänzt werden können.

## Legacy-Kompatibilität und Migration

Legacy-Seiten bleiben ohne Benutzeraktion unverändert. Für ihre Anzeige erzeugt die Compatibility Bridge ausschließlich eine flüchtige v2-Projektion.

Die Schaltfläche „In v2-Entwurf umwandeln“:

1. verlangt eine Bestätigung,
2. verändert nur den offenen Editorentwurf,
3. hinterlegt standardmäßig einen vollständigen Legacy-Snapshot unter `extensions["aleria.migration"]`,
4. erlaubt vor dem Speichern die Wiederherstellung des Legacy-Entwurfs und
5. persistiert nichts selbstständig.

Erst der bestehende Modul-Speichern-Workflow schreibt den Entwurf. Die Migration greift weder auf Firebase noch auf Local- oder Session-Storage zu.

## Rendering-Grenzen

Family Chart übernimmt seine nativen Stärken für Layout, Partner- und Elternlinien, Fokus, Suche, Zoom, Pan und Fit. Der Adapter ergänzt nur Aleria-spezifische Regeln und diagnostiziert verlustbehaftete Darstellungsfälle.

Das v2-Dokument behält alle fachlichen Varianten. Family Chart 0.9.0 kann im sichtbaren Layout jedoch nur eine ausgewählte Elternschaft und höchstens zwei Layout-Eltern pro Person darstellen. Weitere Elternschaften, Gruppenpartnerschaften, Gewissheit, Geheimhaltung und Fantasy-Metadaten bleiben im Aleria-Dokument erhalten; der Adapter meldet Einschränkungen statt Daten still zu löschen.

Portraits und Zierbilder verwenden Browser-Lazy-Loading. Der Controller montiert nur vorhandene Family-Seiten, räumt Sessions beim Seitenwechsel auf und passt den Baum bei Größenänderungen neu ein. Eine zusätzliche Knotenvirtualisierung ist nicht implementiert, weil Family Chart dafür keine passende native Schnittstelle bereitstellt.

## Abnahme und Regressionstests

Vom Ordner `AleriaAlmanach` aus:

```text
node scripts/check-family-module.js
node scripts/check-family-chart-adapter.js
node scripts/check-module-template-roundtrip.js
node scripts/check-module-template-assets.js
```

Die Prüfungen decken insbesondere ab:

- Schema, Standarddaten und alle 16 Editor-Sammlungen
- identische statische und Inline-Editorfähigkeiten
- Erhalt unbekannter Erweiterungsfelder beim Roundtrip
- Mehrfachpartnerschaften, Elternschaftsvarianten und Adapterdiagnosen
- explizite, reversible und quellschonende Legacy-Migration
- Family-Chart-Layout, Fokus, Suche, Ausrichtung, Fit und Session-Lebenszyklus
- Script-/Stylesheet-Parität zwischen Almanach und Orte-Einbettung
