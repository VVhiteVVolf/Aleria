# Gemeinsame Plakattafeln

Seit der Freigabe vom 27. Oktober 2026 verwenden Morddyn, Llysfaen und Gwynthor
dieselbe Plakatbibliothek und denselben Editor. Auch neue Tafeln bekommen diese
Funktion ohne gesonderte Aktivierung. Die öffentliche Auslieferung erfolgt über
das vorhandene GitHub-/Netlify-System.

## Bedienung

1. **Bearbeiten → Aushang setzen:** Bild nach Namen oder Kategorie auswählen.
2. Nagel wählen und auf der Vorschau platzieren. Er bleibt immer sichtbar;
   nur seine Klickfunktion lässt sich abschalten.
3. Textvorlage, bestehenden Inhalt oder reine Dekoration wählen.
4. Auf dem Brett platzieren. Papier und Nagel werden gemeinsam verschoben.

Im Plakatwerkzeug lassen sich Motiv, Größe, Drehung, genaue Position,
Nagelposition und Ebene ändern. Vor/zurück verschiebt eine Lage, ganz nach
vorn/hinten verschiebt an den Rand der Stapelreihenfolge. Pfeiltasten bewegen
ein fokussiertes Plakat fein, Umschalt plus Pfeiltaste in größeren Schritten.
Papier und Nägel werfen getrennte Schatten. Dekoration braucht keinen
Questdatensatz. Beim Entfernen des Papiers bleiben Inhalt und Kommentare erhalten.

Die bisherigen 16 Textvorlagen, Schriften, Siegel, Belohnungen, Beiblätter,
logischen Aushanggruppen, Suche und Kommentare bleiben verfügbar.

## Zuständigkeiten und Speicherung

`assets/js/composition/` besitzt ausschließlich die physische Darstellung:

- `board-composition-config.mjs`: gemeinsame Vorgaben, leeres Brett, optionale Ortsvorlage.
- `board-composition-migration.mjs`: einmalige Übernahme vorhandener Anker auf Papier.
- `board-composition-model.mjs`: Validierung, Koordinaten, Ebenen und Inhaltsauflösung.
- `board-composition-view.mjs`: Darstellung, Alphazuschnitt und optionale Polygonmaske.
- `board-composition-creator.mjs`: dreistufiger Platzierungsdialog.
- `board-composition-inspector.mjs`: Bearbeitung einer gesetzten Einheit.
- `board-composition.js`: Anbindung an Tafel, vorhandene Inhalte und Speicherweg.

Der bestehende Zustand enthält optional `boardLayout: { version: 1, posters: [] }`.
Jede Einheit speichert Motiv-ID, Mittelpunkt, Breite, Drehung, Ebene, lokalen Nagel
und optional die ID eines vorhandenen Inhaltsankers. Es gibt keine zweite
Plakatspeicherung. Entwürfe, Sicherungen, JSON-Exporte und der bestehende
Publisher tragen die Anordnung zusammen mit dem restlichen Tafelzustand.

**Öffentlich:** Code, Bildbibliothek und vorbereitete Ortsanordnungen werden mit
der Website ausgeliefert. Alle Besucher sehen denselben Ausgangsstand.
**Lokaler Entwurf:** spätere, noch unveröffentlichte Editoränderungen. Erst
„Auf GitHub veröffentlichen“ macht diese Änderungen auf allen Geräten sichtbar.
Revisionsschutz und der Schutz vor parallelem Überschreiben bleiben bestehen.

Fehlt die Anordnung in einem Altstand, wird die Ortsvorlage einmal angewendet.
Die elf Llysfaener Inhalts-IDs sind ausdrücklich zugeordnet. Unbekannte
Morddyner Altinhalte werden anhand ihrer tatsächlichen alten Papierbereiche
zugeordnet; übrige alte Anker erhalten ein zum Inhaltstyp passendes Papier.
Ein Nagelstapel erhält eine Einheit. Bereits verschobene Altanker berücksichtigen
ihre eigene Positionsabweichung. Texte, IDs, Kommentare, Ressourcen und
Stapelzuordnungen werden dadurch nicht umgeschrieben.

Ein ausdrücklich gespeichertes Layout, auch ein leeres, hat Vorrang und wird
nicht erneut mit Vorlagenpapier befüllt. Unbekannte Motiv-IDs werden abgewiesen,
statt Daten still zu entfernen. Geheime Inhalte werden vor öffentlicher
Darstellung gefiltert; reine Geheimstapel zeigen auch kein Plakat.

Morddyn besitzt weiterhin einen lesenden Firebase-Altimport. Ein nicht lesbarer
Altstand darf nicht durch einen vermeintlich vollständigen Entwurf ersetzt
werden. Die vorhandene Importsperre bleibt bis zu einem ausdrücklich
vollständigen JSON-Import bestehen; es wird nicht nach Firebase geschrieben.

## Bilder

Das gemeinsame leere Brett liegt unter `assets/images/boards/town-square-v1.png`.
Es ist das freigegebene Gwynthor-Bild aus dem lokalen Questtafeln-Bestand.
Der frühere Gwynthor-Pfad bleibt als kompatible Bildadresse erhalten.
Eine bewusste Auswahl unter „Tafelbild“ setzt `useBoardImageOverride`; alte
gespeicherte Bilder mit bereits eingemalten Plakaten werden nicht versehentlich
hinter die neuen Papierlagen gelegt.

`assets/data/board-art-catalog.json` enthält die gemeinsam nutzbaren Bilder,
Namen, Kategorien, Quellen und sichtbaren Grenzen. Vorhandene Quellen bleiben
unverändert. Die Originaltafeln bleiben als Referenz erhalten. Morddyns
Regionalkarte und sein großes leeres Blatt verwenden einen zugeschnittenen,
maskierten Originalausschnitt; dadurch bleiben Kartenbeschriftungen erhalten.
Weitere fehlende Einzelmotive wurden anhand ihrer Originale freigestellt ergänzt.

Die zehn zusätzlichen allgemeinen Motive sind **Hochzeit, Unterkunft,
Vermietung, Geleit gesucht, Lieferung, Verloren, Gefunden, Heilung,
Lehrlinge gesucht und Versammlung**. Sie enthalten keine Personen-, Orts- oder
Hausspezifik. Die bisherige personengebundene Hochzeit bleibt für ihre
bestehende Darstellung erhalten. Prompt- und Referenzbelege liegen neben den
Bildern unter `assets/images/board-posters/`.

## Neue Tafeln und Prüfung

Die Vorlage unter `_template/` und [Neue Tafel anlegen](NEUE-TAFEL.md) verwenden
dasselbe System. Ein `board-layout.json` ist nur für eine vorbereitete
Startanordnung nötig. Ohne Vorlage beginnt die Tafel leer; vorhandene alte
Inhaltsanker werden trotzdem übernommen.

```powershell
& 'C:\Program Files\nodejs\node.exe' Anzeigetafeln/tools/validate-tafeln-structure.mjs
& 'C:\Program Files\nodejs\node.exe' --test --experimental-test-isolation=none Anzeigetafeln/tests/*.test.mjs
```

Der Validator prüft auch Motiv-IDs, Dateipfade, Zuschnittgrenzen, Masken,
Ortsvorlagen und Inhaltsbindungen. Regressionstests sichern Datenübernahme,
explizit leere Layouts, alte Entwurfspositionen, Geheimhaltung und Speicherrevisionen.
