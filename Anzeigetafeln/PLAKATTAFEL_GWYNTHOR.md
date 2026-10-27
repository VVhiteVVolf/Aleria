# Gwynthors Plakattafel · Erprobung vom 27. Oktober 2026

Die neue Darstellung ist ausschließlich in Gwynthors `tafel.config.js` aktiviert.
Die übrigen Tafeln verwenden weiterhin ihr bisheriges Hintergrundbild und ihre
Nägel. Der Nutzer hat mit seiner Klarstellung vom 27. Oktober 2026 ausdrücklich
die öffentliche Bereitstellung dieses Gwynthor-Stands beauftragt. Die Auslieferung
erfolgt über das bestehende GitHub-/Netlify-System; es wird nicht nach Firebase geschrieben.

## Bedienung

1. **Bearbeiten → Aushang setzen:** Plakat über Bild, Namen, Suche und Kategorie auswählen.
2. Nagelvariante wählen und den Nagel direkt auf der Plakatvorschau verschieben.
   Größe und Drehung der Befestigung sind unabhängig vom Papier.
3. Textvorlage für einen neuen Aushang, vorhandenen Aushang oder reine Dekoration wählen.
4. Auf die gewünschte Stelle des Bretts klicken, auch über ein anderes Plakat.
   Escape bricht die noch nicht gesetzte Einheit ab.

Ein Klick im Bearbeitungsmodus wählt das Plakat. Plakat und Nagel lassen sich
gemeinsam ziehen. Das Werkzeug bietet Papierbreite, Papierdrehung, genaue
Position, Nagelposition, Nageldrehung und vier Ebenenaktionen. Pfeiltasten bewegen
ein fokussiertes Plakat fein, Umschalt plus Pfeiltaste in größeren Schritten.
Das Motiv lässt sich nachträglich wechseln; Inhalt, Kommentare und Nagel bleiben
dabei erhalten. Duplizieren erzeugt eine dekorative Kopie ohne duplizierte Quest.

Nägel sind **immer sichtbar**. Bei ausgeschalteter Klickfunktion bleibt der Nagel
sichtbar und öffnet keinen Aushang. Ohne verknüpften Inhalt erzeugt ein Plakat
keinen Eintrag in Suche, Register oder Leser. Das Entfernen eines Plakats löscht
keine Texte oder Kommentare; nicht mehr bebilderte Inhalte bleiben über ihren
bisherigen Nagel und das Verzeichnis erreichbar.

Die vorhandenen 16 Textvorlagen, Handschriften, Sprachschriften, Belohnungen,
Bildauswahl, Siegel, Beiblätter, logischen Aushanggruppen und Kommentare bleiben
im bisherigen System. Beiblätter sind weiterhin Inhalte an einem gemeinsamen
Nagel. Die sichtbaren Papierlagen auf dem Brett haben eine unabhängige Reihenfolge.

## Architektur und Daten

`assets/js/composition/` besitzt die physische Darstellung und ihre Werkzeuge:

- `board-composition-model.mjs`: Normalisierung, Koordinaten, Ebenen und sichere Inhaltsauflösung.
- `board-composition-view.mjs`: Papierzuschnitt, Befestigung und DOM-Darstellung.
- `board-composition-creator.mjs`: dreistufiger Entwurf bis zur Platzierung.
- `board-composition-inspector.mjs`: Bearbeitung der gewählten Einheit.
- `board-composition.js`: Anbindung an Tafel, Inhalte und vorhandenen Speicherweg.

Der optionale Zustand `boardLayout: { version: 1, posters: [...] }` enthält
ausschließlich physische Einheiten. Jedes Plakat speichert `assetId`, Mittelpunkt
`x/y`, relative Breite, Drehung, Ebene und lokale Nageldaten. `noticeId` verweist
optional auf ein vorhandenes Blatt und damit dessen bestehenden Nagelstapel.
Es werden keine künstlichen Quest-Einträge für Dekoration angelegt.

Eine fehlende Anordnung übernimmt beim Laden einmal die Gwynthor-Vorlage.
Ein ausdrücklich gespeichertes leeres `posters`-Array bleibt leer. Eigene
abweichende Positionen alter Inhaltsnägel werden beim ersten Übernehmen als
Positionsabweichung berücksichtigt. Die vorhandenen `zettel`, IDs, Kommentare,
Belohnungen und Übernahmekennungen werden durch diesen Vorgang nicht umgeschrieben.
Danach enthält jede Sicherung, jeder Export und jeder Entwurf die eigene Anordnung.
Eine alte gespeicherte Tafelbild-URL bleibt erhalten, wird beim ersten Übernehmen
jedoch vom neuen leeren Pilotbild abgelöst. Erst eine bewusste Auswahl unter
„Tafelbild“ setzt `boardLayout.useBoardImageOverride`; dadurch werden keine
eingemalten Altplakate versehentlich unter den neuen Papierlagen angezeigt.
Ungültige oder unbekannte Plakatkennungen werden beim Import abgewiesen, statt
Papier unbemerkt zu entfernen.

Geheime Inhalte werden vor öffentlicher Titel- und Zählerdarstellung gefiltert.
Bei ausschließlich geheimem Inhalt erscheint auch das zugehörige Plakat nicht.
Beim Löschen eines Inhaltsankers bleibt eine Verknüpfung zu verbleibenden
Beiblättern erhalten. Der bisherige JSON-Publisher erhält die neue optionale
Anordnung und prüft ihre Positions- und Nageldaten.

## Bilder und Herkunft

Die ursprüngliche befüllte Gwynthor-Tafel bleibt unverändert erhalten. Das neue
leere Hintergrundbild ist `Bilder/GwynthorLeer-v1.png`, übernommen aus
`D:\0-KI Generierte\01 Bilder\Questtafeln\681aafe5-9671-477f-acef-dff540eb7876.png`.
`board-layout.json` enthält die 53 gesetzten Vorder- und Rückblätter, drei
bestehende Inhaltsnagelgruppen und die dokumentierte Abbildung der Originalanordnung.

Die Bibliothek `assets/data/board-art-catalog.json` umfasst 66 Motive. 62 werden
direkt aus `IconOrdner/Steckis` verwendet; Originale und Transparenz bleiben
unverändert. Der sichtbare Zuschnitt erfolgt anhand der katalogisierten
Alphagrenzen im DOM. Papier und Nagel werfen getrennte CSS-Schatten auf die
darunterliegenden Lagen. Die Ebenen werden bei Hover nicht verändert.

Vier fehlende Motive wurden mit dem eingebauten Imagegen-Werkzeug anhand des
Originals ergänzt: `assets/images/board-posters/{hochzeit,arbeit,beerdigung,blank-verbrannt}-v1.png`.
Die tatsächlich verwendeten Bildreferenzen und vollständigen Prompts sind in
`assets/images/board-posters/generation-prompts.json` festgehalten. Die PNGs haben
echte Transparenz und enthalten keine fest eingebauten Nägel oder äußeren Schatten.

## Behobene Speicher- und Bedienfehler

Die Plakatbibliothek, das leere Hintergrundbild und die vorbereitete Anordnung
werden zusammen mit dem Code öffentlich ausgeliefert. Alle Besucher erhalten
denselben Ausgangsstand. „Lokaler Entwurf“ bezeichnet weiterhin ausschließlich
noch nicht über den vorhandenen Publisher freigegebene Editoränderungen.
Ein Veröffentlichen des Tafelstands macht auch eigene Plakatpositionen und
Nageldaten auf allen Geräten verfügbar. Es gibt keine zweite private Plakatspeicherung.

- Ein alter lokaler Entwurf behält seine ursprüngliche Basisrevision. Eine
  zwischenzeitlich neuere Onlinefassung kann nicht durch die bloße Neuladung
  einer alten Arbeitskopie überschrieben werden.
- Während einer Veröffentlichung entstandene Änderungen bleiben lokal erhalten
  und werden auf die erfolgreiche Revision bezogen; nur der unveränderte
  veröffentlichte Entwurf wird entfernt. Parallele Veröffentlichungen sind gesperrt.
- Ein anderer Tab kann einen neueren lokalen Entwurf nicht still überschreiben.
- Ausstehende lokale Sicherungen werden vor Seitenwechsel und beim Verbergen
  des Dokuments sofort geschrieben. Auch Änderungen in Inhaltsformularen sichern
  nun ausdrücklich den lokalen Entwurf; „Schließen“ beschreibt diese Bedienung.
- Ein nicht lesbarer Firebase-Altstand wird als unvollständige Quelle behandelt.
  Daraus entstandene Entwürfe dürfen bis zu einem ausdrücklichen vollständigen
  JSON-Import nicht veröffentlicht werden. Der Hinweis bleibt beim
  Neuladen des Entwurfs erhalten. Bestehende Firebase-Zugriffe bleiben lesend.
- JSON-Import akzeptiert zusätzlich die veröffentlichten `{ revision, state }`-Dateien.
- Das Ziehen nutzt Pointer Capture, funktioniert mit Maus und Touch und beendet
  sich auch außerhalb des ursprünglichen Nagels. Abgebrochene Gesten werden verworfen.

## Prüfung

```powershell
& 'C:\Program Files\nodejs\node.exe' --test --experimental-test-isolation=none Anzeigetafeln/tests/*.test.mjs
```

77 Tests bestanden, einschließlich zusätzlicher Prüfungen zu Entwurfsrevisionen,
Veröffentlichung während weiterer Änderungen, konkurrierenden Tabs, nicht
lesbaren Altständen, explizit leeren Tafeln, geheimen Beiblättern, Ebenen,
gedrehten Nagelkoordinaten und vollständiger Datenerhaltung.

Im Browser geprüft: bestehende Inhalte am neuen Nagel, freie Nagelplatzierung,
Ebenenwechsel, Drehung, gemeinsames Ziehen, Dekoration ohne Registereintrag,
Erstellung neuer Inhalte und unmittelbares Neuladen ohne vorherigen Speichern-Klick.
Der lokale Firebase-Leseversuch wurde mit „Missing or insufficient permissions“
abgewiesen; ein vollständiger Vergleich mit dort eventuell verbliebenen Altdaten
war deshalb nicht möglich. Die Prüfung hat keine Live-Daten verändert.
Die Browsersteuerung wurde beim abschließenden Wiederherstellen der lokalen
Testsicherung aus Sicherheitsgründen beendet, weil die URL am Bestätigungsdialog
nicht zuverlässig ermittelt werden konnte. Die Bestätigung kann im Prüftab noch
offen sein. Die Repository-Vorlage enthält weiterhin die ursprünglichen 53 Blätter;
die zusätzlichen Testplakate wurden ausschließlich im lokalen Browserentwurf angelegt.

Lokale Vorschau aus dem Repository starten:

```powershell
& 'C:\Users\fhg_r\AppData\Local\Programs\Python\Python312\python.exe' -m http.server 4197 --bind 127.0.0.1 --directory E:\Aleria
```

Danach `http://127.0.0.1:4197/Anzeigetafeln/tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel` öffnen.
