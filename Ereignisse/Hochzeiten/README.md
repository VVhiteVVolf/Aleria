# Hochzeiten · der aktuelle Seitenstandard

Die kanonische Tudwal-Seite bleibt `Haus-Draig-und-Penderyn.html`. Ihre frühere
Tabellenseite und Firebase-Bearbeitung wurden durch das gemeinsame Festbuch ersetzt.
`../Hochzeitsevent.html` öffnet die neue Vorlage; `../hochzeit.html` das Register.
Alle künftigen Hochzeiten verwenden `../hochzeit.html?id=<kennung>` und dieselben
Module. Dafür sind weder eine kopierte HTML-Seite noch ein weiterer Vite-Einstieg
nötig. Die alten Dateien `hochzeitsvorlage.js`, `ereignis-vorlage.css` und `firebase-config.js`
sind nicht mehr an diese Seiten angeschlossen.

## Inhalte und Quellen

- `data/tudwal-revelyn.json`: Brautpaar, Ort, Texte, 39 vollständige Gästebucheinträge
  in fünf Gruppen, Geschenke, Ablauf und Aufgaben. Gruppen können Delegationen mit
  Wappen, Oberhaupt und Personenzahl enthalten. Aufgaben, Rollen und Gaben werden
  vollständig dargestellt, ohne Vorschaukürzung.
- Die Gäste verwenden 43 vorhandene Personenporträts aus den Stammbäumen und dem
  zugehörigen Charakterregister. Die Zuordnung folgt Haus, Person und Generation;
  gemeinsame Einträge behalten mehrere runde Miniaturen. Nur der unbenannte Gast
  hat eine neutrale Silhouette. Die Namensvarianten Merin/Merwin, Mailgwyn/Mailgwin
  und Slepinir/Sleipnir sind in der Quellenliste dokumentiert.
- `registry.json`: veröffentlichte Festbücher mit stabiler ID, Titel, Status, Datum,
  Revision und Leseradresse. Kalender und Ereignisübersicht lesen dieselbe Registry.
- `templates/hochzeit.json`: leere Datenvorlage für kommende Hochzeiten.
- `../assets/weddings/tudwal-revelyn/`: unveränderte Originalbilder mit Quellenliste.

Der Nutzer hat den Termin auf zwei Wochen nach dem 09.03.1740 festgelegt. Nach dem
Aleria-Kalender mit neun Tagen je Woche ist das der **27. Lichtkehr 1740 (27.03.1740)**.
Das Fest wird mit feststehendem Termin geführt. Die abweichende Quellenangabe
1720 aus der alten Vorlage bleibt in `sources.json` dokumentiert. Die unbestimmten
`00.00`-Ablaufzeilen werden nicht als echte Termine importiert. Es wurde keine
Gästezusage oder Geschenkübergabe aus einer bloßen Nennung abgeleitet.

Auf Wunsch des Nutzers enthält Tudwals Festbuch jetzt einen ersten Ablaufentwurf
mit zwölf Stationen: von der Trauung um 14:00 Uhr über Empfang, Festmahl, Ansprachen,
Gaben und Tanz bis zum offiziellen Abschluss um 23:00 Uhr. Die Uhrzeiten sind als
Vorschläge gekennzeichnet; nur der Kalendertag steht bereits fest. Die allgemeine Vorlage
bleibt frei von Tudwals konkretem Programm.

## Bearbeiten und veröffentlichen

1. **Seite bearbeiten** öffnet die lokale Bearbeitung. Jeder Dialog speichert seinen
   Eintrag als Entwurf auf diesem Gerät, getrennt je Hochzeit.
2. Gäste, Delegationen, Gaben, Ablauf und Aufgaben lassen sich hinzufügen, ändern und
   entfernen. Programmreihenfolge und erledigte Aufgaben haben eigene Bedienelemente.
   Brautpaar, Wappen, Titelbild, Ort, Datum und sämtliche Texte sind ebenfalls editierbar.
   Im Gastdialog lassen sich einzelne Porträts mit Name, Bildadresse und Ausschnitt
   hinzufügen, wechseln oder entfernen. Die Kreise entstehen mit CSS; Originalbilder
   bleiben unverändert. Stammbaum-Bildpfade werden wiederverwendet und beim Vite-Build
   gezielt mitgenommen.
3. **Exportieren** sichert die vollständige Fassung als JSON-Datei.
4. **Veröffentlichen** zeigt die Änderungen zur Ausgangsfassung. Nach Eingabe des
   Veröffentlichungsschlüssels speichert der Server Daten und Registry in einem
   gemeinsamen GitHub-Commit. Der Schlüssel bleibt weder im lokalen Speicher noch
   im Export. Ein GitHub-PAT gehört ausschließlich auf den Server.
5. Konflikte behalten den Entwurf. Vor **Online-Fassung laden** kann er exportiert
   werden; das Laden ersetzt ihn ausdrücklich durch die aktuelle GitHub-Fassung.

`netlify/functions/wedding-publisher.mjs` nutzt die bestehende Konfiguration:
`ALERIA_GITHUB_TOKEN`, `ALERIA_GITHUB_PUBLISH_KEY`, optional
`ALERIA_GITHUB_REPOSITORY` (Standard `VVhiteVVolf/Aleria`) und
`ALERIA_GITHUB_BRANCH` (Standard `master`). Der Token benötigt Schreibzugriff auf
Repository-Inhalte. Der vorhandene GitHub-Deploymentablauf übernimmt den Commit.
Vor der ersten Nutzung müssen der neue Publisher und die Startdaten regulär
bereitgestellt sein; ein reiner lokaler Dateiserver stellt keine Netlify Function.

POST prüft Authentifizierung, Datenformat, Dateigröße und Ausgangsrevision. Alle
Repository-Lesezugriffe einer Veröffentlichung verwenden denselben Commit. Der
Branch wird ohne `force` aktualisiert, damit fremde Änderungen erhalten bleiben.
Die gemeinsame GitHub-Commitfunktion wird auch von der Dokumentenwerkstatt benutzt.

Die Vorschauen lesen nur veröffentlichte Daten. Lokale Hochzeitsentwürfe verändern
weder Firebase-Kalendertermine noch die Weltzeit. Ein festgelegter Termin öffnet
das entsprechende Jahr, den Monat und Tag im eigenständigen Kalender. Dort führt
das Festbuch direkt zurück zur Hochzeitsseite.

## Module und Prüfungen

`../modules/weddings/` trennt Schema, Registry-Zugriff, lokalen Zustand, Darstellung,
Editorfelder, Dialoge, Controller, Vorschau und Build-Assets. Neue Felder gehören
zuerst in das gemeinsame Schema, das Browser und Publisher verwenden.

`node Ereignisse/scripts/build-weddings.mjs` erzeugt die drei HTML-Einstiege und
gleicht Tudwals Registry-Zeile ab. Der Almanach-Prebuild führt diesen Schritt mit
`build:events` aus. `--check` prüft ohne Schreibzugriff. Bilddateien, Registry und
Daten werden auch in der Vite-Ausgabe unter ihren stabilen Adressen abgelegt.

`weddings.test.mjs` prüft Inhalte, Validierung, Entwürfe, Kalenderverweise,
Publikationskonflikte und atomare Commits. `weddings.browser.mjs` prüft den kompletten
Bearbeitungsablauf und die Vorlage mit isoliertem Browserprofil und simuliertem
GitHub-Endpunkt. Kein Test veröffentlicht produktive Daten. Die Browserprüfung
unterstützt dieselben Playwright-Variablen wie `events.browser.mjs` sowie optional
`WEDDING_SCREENSHOTS` für die visuellen Belege.
