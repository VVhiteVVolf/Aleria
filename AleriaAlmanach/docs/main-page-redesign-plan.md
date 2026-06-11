# Hauptseiten-Umbau: Archiv-Dashboard, Kategorien und Skalierung

Stand: 2026-06-11
Fortschritt: 100%
Status: Lokal fertiggestellt, geprueft und zum Push freigegeben.

## Ziel

Die Hauptseite des AleriaAlmanachs soll langfristig besser skalieren, wenn sehr viele Module entstehen. Sie soll zugleich lesbarer, organisierter und visuell klarer werden.

Gewuenschte Schwerpunkte:

- bessere `Alle`-Startansicht als Dashboard
- staerkere Kategorie-/Reiter-Identitaet
- sichtbarere Kategorieueberschriften
- mehr Metadaten auf Modulkarten
- Zukunftssicherheit fuer viele Module pro Reiter

## Arbeitsregel

Nicht pushen, bis der komplette Umbau lokal fertig, geprueft und vom Nutzer freigegeben ist.

## Fortschritt

| Bereich | Prozent | Status |
| --- | ---: | --- |
| Analyse Hauptseiten-Rendering | 100% | Rendering-Schnittstellen identifiziert und extrahiert |
| Dashboard-Konzept fuer `Alle` | 100% | Dashboard v1 eingebunden und Klick-Smoke bestanden |
| Kategorie-Baender / Reiter-Design | 100% | Abschnittsband v1 eingebunden und visuell geprueft |
| Modul-Karten-Metadaten | 100% | Meta-Helfer v1 eingebunden |
| Skalierung bei vielen Modulen | 100% | Kartenlimit und Mehr-Anzeigen per temporaerem 30-Karten-Smoke geprueft |
| Implementierung | 100% | Neue Archivmodule, Verwaltungsmodus und mobile CSS-Regeln angelegt |
| Lokale Tests | 100% | Diff-Check, Headless-Load, Screenshots und Interaktions-Smokes bestanden |

Gesamtfortschritt: 100%

## Geplante Architektur

Bestehende Verantwortlichkeiten:

- `modules/archive/archive-view.js`: rendert Hauptseite, Suche, Reiter, Bereiche und Karten.
- `styles/archive.css`: Hauptseiten-, Reiter-, Karten- und Kategorie-Styles.
- `modules/module-store/*`: Modul-Store, eigene Bereiche, Verschieben von Modulen.
- `modules/characters/*`: Charakter-Reiter und Charakterkarten, darf durch Hauptseitenumbau nicht regressieren.

Geplante neue oder extrahierte Verantwortlichkeiten:

- `modules/archive/archive-dashboard.js`: Dashboard-Bloecke fuer `Alle`.
- `modules/archive/archive-section-ui.js`: Kategorie-Baender, Abschnittsmetriken, Abschnittsbegrenzung.
- `modules/archive/archive-card-meta.js`: Metadaten fuer Modul-Karten.

Nur extrahieren, wenn dadurch `archive-view.js` wirklich uebersichtlicher wird. Keine unnoetigen Dateien.

## Funktionsplan

### 1. `Alle` als Dashboard

Im `Alle`-Reiter soll oberhalb der normalen Archivbereiche ein Dashboard erscheinen:

- Schnellzugriff auf grosse Reiter mit Modulanzahl.
- Uebersicht ueber neue/aktive Inhalte, soweit Daten lokal verfuegbar sind.
- kompakte Statistik: Anzahl Module, Bereiche, Charaktere.
- bestehende Suche bleibt sichtbar und wichtig.

Noch zu klaeren:

- Ob "zuletzt bearbeitet" verlaesslich aus vorhandenen Daten ableitbar ist. Falls nicht, nicht kuenstlich vortaeuschen.
- Ob Kommentar-Aktivitaet ohne teure Firebase-Abfragen sinnvoll integrierbar ist.

### 2. Kategorie-Baender

Jeder grosse Reiter bzw. Abschnitt soll ein deutliches Band bekommen:

- Reitername / Bereichstitel
- Beschreibung
- Modulanzahl
- Akzentfarbe aus bestehendem Theme
- optional kleine Marker wie "Eigener Reiter", "Leerer Reiter"

Designziel:

- sichtbar, aber nicht laut
- besser scanbar als bisherige kleine Ueberschriften
- konsistent mit Almanach-/Archiv-Optik

### 3. Karten-Metadaten

Modulkarten sollen kleine Metadaten anzeigen:

- Typ
- Seitenanzahl
- Kommentarstatus: globale Kommentare / Seitenkommentare / keine
- aktueller grosser Reiter
- optional: Modulbreite/-hoehe nur im Verwaltungsmodus

Wichtig:

- normale Galerieansicht nicht ueberladen
- Verwaltungsaktionen wie `Verschieben nach` langfristig nur im Verwaltungsmodus anzeigen

### 4. Skalierung fuer viele Module

Wenn unter einem Reiter sehr viele Module liegen:

- Abschnitte sollen nicht endlos wachsen.
- Pro Kategorie initial nur eine begrenzte Menge anzeigen.
- Danach `Mehr anzeigen` oder interne Scrollzone.
- Suche soll weiterhin alle Module durchsuchen, nicht nur sichtbare.

Vorschlag:

- Standard: erste 24 Karten pro Abschnitt.
- Button: `Mehr anzeigen`.
- Bei aktiver Suche: alle Treffer anzeigen, aber ggf. Trefferanzahl sichtbar machen.
- Spaeter moeglich: Ansichtsschalter `Galerie / Kompakt / Verwalten`.

### 5. Verwaltungsmodus

Langfristig sollten Admin-Controls aus der normalen Ansicht heraus:

- `Verschieben nach`
- weitere Verwaltungsaktionen
- ggf. Bulk-Verwaltung fuer Module

Plan:

- eigener Schalter `Verwalten`
- nur bei entsperrtem Modul-Editor aktiv
- normale Hauptseite bleibt sauber

## Risiken

- `archive-view.js` ist bereits zentral. Neue Features duerfen es nicht weiter zum God-File machen.
- Viele Firebase-Daten fuer Kommentare duerfen die Startseite nicht langsam machen.
- Leere eigene Reiter muessen erhalten bleiben.
- Verschobene eingebaute Module duerfen nicht dupliziert werden.
- Charakter-Reiter darf durch neue Dashboard-/Archivlogik nicht brechen.

## Testplan

Vor Commit/Push lokal pruefen:

- `git diff --check`
- Headless-Load von `AleriaAlmanach.html`
- `Alle` mit und ohne Suche
- einzelner Reiter mit wenigen Modulen
- einzelner Reiter mit vielen simulierten Modulen oder kuenstlich niedrigem Kartenlimit
- leerer eigener Reiter
- Charakter-Reiter
- Modul verschieben und danach Reload
- Vollbackup enthaelt neue Store-Daten

## Naechste konkrete Schritte

1. Rendering-Punkte in `archive-view.js` markieren, die extrahiert werden koennen.
2. Datenmodell fuer Dashboard-Metriken bestimmen.
3. Erstes minimales Dashboard fuer `Alle` bauen.
4. Abschnitts-Band mit Modulanzahl ergaenzen.
5. Karten-Metadaten in eigene Helferfunktion auslagern.
6. Kartenlimit pro Abschnitt implementieren.
7. Danach pruefen, ob Verwaltungsmodus direkt in diesem Umbau sinnvoll ist oder als Folgearbeit besser bleibt.

## Analysebefunde 2026-06-11

### Aktueller Rendering-Fluss

`modules/archive/archive-view.js` enthaelt den kompletten Hauptseitenaufbau in `renderAll()`:

- Reiterleiste in `#gallery-tabs`
- Toolbar mit Archivsuche
- Empty-State fuer Suchergebnisse
- alle Abschnittsbloecke aus `getValidSections()`
- Karten-HTML fuer jedes Modul
- statischer Charakterblock am Ende
- erneutes `loadCharacters()` nach jedem Render

`switchTab(tab)` ist getrennt und blendet nur bereits gerenderte `.section-block`-Elemente ein oder aus.

### Aktuelle Datenquellen

Direkt verfuegbar ohne neue Firebase-Abfragen:

- Sections: `getValidSections()`
- Section-Metadaten: `key`, `tab`, `desc`
- Module: `entry.id`, `title`, `subtitle`, `type`, `category`, `stamp`, `pages`, `enablePageComments`, `appendCommentsPage`
- Theme-Metadaten: `getSectionThemeMeta(section.key)`
- Suchtext: `buildEntrySearchText(entry, section)`
- Charaktere: erst nach `loadCharacters()`, daher fuer Dashboard nur vorsichtig nutzbar

Nicht verlaesslich direkt verfuegbar:

- echtes "zuletzt bearbeitet" pro Modul
- aktuelle Kommentar-Aktivitaet ohne zusaetzliche Kommentar-Ladeoperationen

Schlussfolgerung:

- Dashboard v1 sollte mit stabilen lokalen Daten starten: Modulanzahl, Reiteranzahl, Seitenanzahl, Kommentarfaehigkeit.
- "Zuletzt bearbeitet" und Live-Kommentaraktivitaet besser nicht in v1 erzwingen.

### Extraktionskandidaten

Sinnvolle kleine Schnitte:

- `archive-card-meta.js`: Metadaten aus einem Modul berechnen und Karten-Meta-HTML bauen.
- `archive-section-ui.js`: Abschnittsmetriken, Abschnittsband, Kartenlimit und "Mehr anzeigen".
- `archive-dashboard.js`: Dashboard fuer `Alle`.

Nicht sofort extrahieren:

- `switchTab()`, weil es aktuell sauber und klein ist.
- Suchzustand, weil er stark mit `renderAll()` und UI-Fokus-Restore gekoppelt ist.

### Erste technische Risiken

- `renderAll()` ruft am Ende `loadCharacters()` auf. Jeder weitere Dashboard-Render darf dadurch keine Render-Schleife ausloesen.
- Karten-Verwaltungscontrols liegen aktuell direkt auf jeder Karte. Beim Dashboard-Umbau sollte ein Verwaltungsmodus eingeplant werden, damit normale Karten nicht ueberladen bleiben.
- Bei sehr vielen Modulen muss die Suche weiterhin alle Module durchsuchen, auch wenn pro Abschnitt nur ein Teil sichtbar gerendert wird.

## Umsetzungsstand 2026-06-11

Lokale Dateien, noch nicht committen/pushen:

- `modules/archive/archive-card-meta.js`
  - berechnet Seitenanzahl
  - erkennt Kommentarfaehigkeit
  - erzeugt Meta-Chips fuer Modulkarten
- `modules/archive/archive-section-ui.js`
  - berechnet Abschnittsstatistiken
  - rendert neues Abschnittsband
  - begrenzt sichtbare Karten pro Abschnitt auf 24
  - erzeugt `Mehr anzeigen`
- `modules/archive/archive-dashboard.js`
  - rendert Dashboard fuer `Alle`
  - fasst gleiche grosse Reiter zusammen
  - nutzt nur lokale Daten, keine neuen Firebase-Abfragen
- `modules/archive/archive-view.js`
  - nutzt die neuen Helfer
  - blendet Dashboard nur im `Alle`-Reiter ohne aktive Suche ein
  - hat lokalen Verwaltungsmodus `Verwalten` / `Ansicht`
  - `Verschieben nach` ist nur im Verwaltungsmodus sichtbar
- `styles/archive.css`
  - neue Styles fuer Dashboard, Abschnittsband, Meta-Chips und Mehr-Anzeigen
- `styles/mobile.css`
  - mobile Archivsuche bricht Hinweistext sauber um
  - mobile Hauptseitenbereiche bleiben einspaltig lesbar

Naechste Pruefpunkte:

- Kurzer echter Sichttest im normalen Browserfenster durch den Nutzer oder vor dem finalen Commit.

Bereits geprueft:

- `git diff --check` ohne Fehler; nur bestehende CRLF-Hinweise.
- Headless-Load von `AleriaAlmanach.html` ohne Syntaxabbruch.
- Desktop-Screenshot 1440px: Dashboard, Suche, Abschnittsband und Meta-Chips sichtbar.
- Mobile-Screenshot 390px: Dashboard einspaltig, Suchhinweis umgebrochen, keine neue Ueberlappung in den Hauptseitenkomponenten.
- Remote-Browser-Smoke: Dashboard-Schnellzugriff wechselt in Zielreiter und blendet Dashboard aus.
- Remote-Browser-Smoke: Zurueck auf `Alle` zeigt Dashboard wieder.
- Remote-Browser-Smoke: Verwaltungsmodus bleibt ohne entsperrten Modul-Editor gesperrt.
- Remote-Browser-Smoke: Autorisierter Verwaltungsmodus zeigt `Verschieben nach`-Selects und wechselt den Schalter auf `Ansicht`.
- Remote-Browser-Smoke: Temporär simulierter Abschnitt mit 30 Karten zeigt zuerst 24 Karten, danach per `Mehr anzeigen` alle 30.
