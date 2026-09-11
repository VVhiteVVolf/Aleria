# Kalender und Szenenzeit

## Ausführungsplan

1. Bestehende Zeitrechnung beibehalten: neun Wochentage, vier Wochen pro Monat,
   13 Monate pro Jahr, 468 Tage. Keine gregorianischen Datumsfelder verwenden.
2. Monatsnamen zentral im vorhandenen Weltkalender ergänzen. Eine wiederverwendbare
   Datumsauswahl für Szenenzeit, Weltzeit und Kalender bereitstellen.
3. Termine mit Vorschauvorlagen, Zeitraum, Wiederholung, Ort, Icon und Personen
   als eigenständiges Feature anlegen. Keine erfundenen Feiertagsdaten vorbefüllen.
4. Kalender verlinken und die nächsten neun Aleria-Tage auf der Übersicht zeigen.
5. Zeitmarker bearbeiten, ohne unveränderliche Kampf-/Rastbuchungen freizugeben.
6. Datumssprünge, Wiederholungen, Überschneidungen, Speicherkonflikte und die
   Bedienung auf schmalen und breiten Ansichten prüfen.

## Monate – erste Namensfassung

Sternwacht, Silberglanz, Lichtkehr, Himmelsbogen, Sonnenkranz, Goldschein,
Hochlicht, Abendglut, Dämmerschleier, Mondpfad, Schattenruh, Nachtkrone,
Jahreswende. Die Namen sind poetische Kalenderbegriffe und schreiben weder
örtliche Witterung noch landwirtschaftliche Jahreszeiten vor. Gespeichert wird
weiterhin die Monatsnummer; spätere Umbenennungen verändern keine Termine.

## Zuständigkeiten

- `../core/aleria-calendar.js`: bestehende Kalenderarithmetik, Namen und Formatierung.
- `calendar-date-picker.mjs` / `.css`: Datumsauswahl mit neun Wochentagen.
- `calendar-events-model.mjs`: Validierung, Vorlagen, Wiederholungen und Überlappung.
- `calendar-repository.mjs`: ausschließlich Firebase-Zugriff; wird von `firebase.js`
  mit dessen Verbindung und Anmeldung aufgebaut. Ein Dokument je Termin.
- `calendar-store.mjs`: lokaler Cache, ausdrücklich gekennzeichnete lokale Entwürfe,
  Live-Abgleich und Veröffentlichungen mit Versionsprüfung.
- `calendar-preview.mjs`: kleine Terminkarten, später erweiterbar um einen Artikelverweis.
- `calendar-editor.mjs`: Termine bearbeiten; Icon-Verzeichnis und Personenwahl.
- `calendar-page.mjs` / `.css`: eigenständige Kalenderseite, Monats- und Tagesansicht.
- `calendar-dashboard.mjs`: Vorschau auf der Almanach-Übersicht.

## Daten und zukünftige Artikel

Termine speichern Start-/Enddatum, optionale Uhrzeiten, Kategorie, Kurztext, Ort,
Icon, Teilnehmerreferenzen (ID, Name und kleines Porträt), Wiederholung und Revision.
Ein optionales `articleHref` ist für spätere Dossiers vorgesehen. Ohne Artikel
öffnet ein Termin seine kleine Vorschau mit Bearbeitungsmöglichkeit.
Jährliche Wiederholungen gelten ab dem eingetragenen Startjahr; Wochen umfassen
neun Tage. Überschneidungen beziehen sich auf Zeiträume, nicht auf das Systemdatum.

Neue Szenen verwenden das gemeinsame Aleria-Datum. Bereits datierte Szenen behalten
ihren Anfang. Neue Zeitmarker speichern zusätzlich einen ausdrücklichen relativen
Kalendertag; alte Marker werden weiterhin nach der bisherigen Logik berechnet.

## Veröffentlichung

Die neue Collection `calendar_events` und das Bearbeiten von Zeitmarkern benötigen
die mitgelieferten Firestore-Regeln. Lokale Termine bleiben bei fehlender Verbindung
als solche sichtbar und werden nicht heimlich als online gespeichert ausgegeben.
Regeln werden durch die Entwicklung nicht automatisch produktiv veröffentlicht.

## Berücksichtigte Korrekturen

- Die ursprünglichen sechs Szenenzeit-Icons bleiben erhalten; keine Ersetzung durch
  allgemeine Sonnen- oder Uhrenmotive.
- Uhrzeitfelder verwenden ausdrücklich das deutsche 24-Stunden-Format. Native
  `type="time"`-Felder wurden verworfen, weil die Browserumgebung sie trotz deutscher
  Seite mit AM/PM darstellt. Szenenzeit: `HH:MM:SS`, Termine: `HH:MM`.
- „Heute in Aleria“ speichert bisher ein Datum, keine weltweite Uhrzeit. Das Datum
  neuer Szenen stammt daher aus dieser Anzeige; laufende Szenen übernehmen ihre
  letzte Szenenuhrzeit. Tageszeit-Schaltflächen setzen passende Uhrzeiten.
- Zum Bearbeiten eines gemeinsam gespeicherten Zeitmarkers ist eine Online-Verbindung
  nötig. Ein gescheiterter Änderungsversuch erzeugt keinen zweiten lokalen Marker.
- Der Build übernimmt alle 2.251 im Icon-Verzeichnis registrierten Bilddateien,
  damit die freie Icon-Auswahl auch außerhalb des Entwicklungsservers funktioniert.

## Prüfung

`node --test tests/calendar-events.test.mjs tests/scene-time-calendar-day.test.mjs`
prüft Kalenderarithmetik, Wiederholungen, Zeitraumvalidierung, Überschneidungen,
lokale Speicherung und Revisionskonflikte. Die vorhandenen Weltzeit- und
Themenwandtests prüfen die Integration in ältere Datumsfelder.

`tests/calendar.browser.mjs` verwendet ausschließlich einen lokalen Server und
isolierte Browserdaten. Externe Requests werden blockiert. Die Prüfung umfasst
Anlegen, Kalenderauswahl, Icons, Charaktere, Neuladen, Bearbeiten, Startseitenvorschau,
Szenenzeit sowie 390, 768 und 1440 Pixel breite Ansichten. Die Firebase-Regeltests
liegen in `../../../firebase/tests/default-firestore-rules.test.mjs`.

Stand der Prüfung: 72 gezielte Modell-, Weltzeit-, Themenwand-, Kommentar- und
Firestore-Regeltests bestanden. Die 31 vorhandenen Modulvorlagen bestehen weiterhin
Asset- und Roundtripprüfung. Browserabläufe bestanden sowohl auf den Quelldateien
als auch im fertigen Vite-Build mit vollständig blockierten externen Requests.
Die Firestore-Regeln wurden im lokalen Emulator geprüft, noch nicht veröffentlicht.
