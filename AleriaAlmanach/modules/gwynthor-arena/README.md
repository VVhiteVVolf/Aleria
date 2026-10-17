# Kampfarena von Gwynthor

Lokaler Entwurf vom 17. Oktober 2026. Auf ausdrücklichen Nutzerwunsch **noch nicht pushen oder deployen**.

Vier Inhaltsseiten verwenden die vorhandenen Story- und Sitzungsvorlagen:

1. Kurze Einordnung: städtisches Eigentum / Haus Draig, Überlassung an die Kämpfergilde und wechselnde Nutzung.
2. Sandfläche und Tore als interaktive Szene; die wichtigsten Gildenregeln und Kampfkennfarben stehen im Szenenkopf.
3. Tribünen als eigene interaktive Szene, einschließlich gedecktem Ehrenplatz.
4. Kämpferräume als interaktive Szene: Umkleiden, Ausrüstungsausgabe, Vorbereitung und erste Versorgung.

Die gemeinsame Kommentarseite wird automatisch angehängt. Alle Seiten haben stabile, sprechende Kommentarschlüssel. Die Einleitungen lassen sich über „Einleitung einklappen“ in der gemeinsamen Sitzungsvorlage schließen und wieder anzeigen; Titel und Szenenwerkzeuge bleiben dabei sichtbar. Das native Aufklappelement verändert weder Kommentare noch den laufenden Kommentarfaden und benötigt keinen zusätzlichen globalen Zustand.

Auf Mobilgeräten sind die Werkzeugleisten in einem eigenen, per Tastatur erreichbaren Scrollbereich auf höchstens 40 % der Szeneninhaltshöhe begrenzt. Dadurch verdrängen umgebrochene Leisten den Kommentarbereich nicht; die Kommentare gewinnen auch dort beim Einklappen der Einleitung Platz.

Es gibt keine neuen Personen, Betreiberbiografie, Waren, Preise oder eigene Kampfmechanik. Gildenregeln beschreiben ausschließlich Gildenwettkämpfe und ändern keine bestehenden Kämpfe oder Ressourcen. Die allgemeine Vorlage kennt Schlachtpatrone und Schlachtmatronen; für Gwynthor bleibt nach der aktuellen Nutzervorgabe die örtliche Gilde als Institution zuständig, ohne eine solche Figur anzulegen.

## Quellen und Ausgestaltung

Die beiden unveränderten HTML-Tabellen aus dem Nutzerauftrag liegen unter `sources/`. Der Hochbund ist bereits als `hochbund-des-herion` im Fraktionsregister vorhanden und wird dorthin verlinkt. Für die Kämpfergilde selbst besteht noch kein eigener Registereintrag; es wird kein unzutreffendes Linkziel erfunden.

Aus dem Kontext übernommen: Gildenaufsicht durch den Hochbund des Herion, Sport statt Tötung, unverzauberte Arenarüstung, gemeinsamer Waffenpool, Magieverbot mit erlaubter Aura, Ende bei Kapitulation, Schutz der Schiedsrichter, Wettverbot für aktive Kämpfer und die fünf Kennfarben. Die weiteren Liga-, Rang- und Terminregeln bleiben im Originalkontext erhalten. Sie werden nicht ungefragt als neue Spielmechanik implementiert.

Ovales offenes Rund, steinerne Ränge mit hölzernen Überdachungen, zwei gegenüberliegende Kämpfertore und die Raumausstattung sind szenische Ausgestaltung dieses Entwurfs. Exakte Lage im Stadtgebiet, Baualter, Sitzplatzzahl, Turnierkalender und Personal sind noch offen.

## Dateien und Prüfung

- `arena-scenes.mjs`: die drei bespielbaren Orte.
- `arena-module.mjs`: Einordnung, Modulidentität und Seitenaufbau.
- `arena-data.js`: generierte lokale Einbindung im Almanach.
- `../../assets/gwynthor-arena/`: vier Szenenbilder und Bildprotokolle.
- `../../../Charakter Archiv Exporte/Module/Kampfarena Gwynthor/`: importierbares Paket.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-arena.mjs
node AleriaAlmanach/scripts/build-gwynthor-arena.mjs --check
node AleriaAlmanach/tests/gwynthor-arena.browser.mjs
```
