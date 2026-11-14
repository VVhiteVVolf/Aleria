# Castell Gafyr, Saethwyr und Wyrm

Die drei bestehenden Burgkategorien unter `Gwynthor-Stadt` erhalten eine kleinere
Fassung der mehrteiligen Castell-Draig-Struktur. Es gibt zehn Module und
29 eigenständige Szenen. Jede Burg besitzt `Innenhof & Anlagen`, `Ratskammern`
und `Bergfried`; Saethwyr erhält zusätzlich das Modul `Eigener Burghafen`.
Private Gemächer sind nicht Teil dieser Ausarbeitung.

Gafyr: ebener Stadtgrund, Berge hinter der Burg, Schwarz/Gold und zwei goldene
Ziegen. Saethwyr: unmittelbar am Hafen, eigener Port, Goldgelb/Schwarz und ein
schwarzer Drache über hellen Wellen. Wyrm: Südufer des Stadtflusses, steinerne
Zufahrt mit hölzerner Zugbrücke unmittelbar am Tor, Rot/Gold/Schwarz und Wyrm.
Die räumlichen Vorgaben stammen aus dem Nutzerauftrag vom 14. November 2026.
Ausgestaltung und Raumprosa sind neue redaktionelle Arbeit. Hausgeschichte und
Wappen stammen aus den bestehenden Hausquellen; keine neuen Ämter, Amtsinhaber,
Eigentumsquoten, Rechtsansprüche oder genealogischen Beziehungen werden angelegt.

`castle-houses.mjs` hält Hausbezug, Geografie und Bildarchitektur;
die drei `*-rooms.mjs` besitzen jeweils Raumprosa und Motivvorgaben.
`castle-modules.mjs` projiziert sie ohne Seiteneffekte in vorhandene Szenenseiten.
Der bestehende `renderArchiveSectionRegistration` registriert die erzeugte
`castle-data.js`. Bereits bearbeitete Einträge, bestehende Platzierungslogik,
Benutzerzustände und Nachbarmodule behalten ihre vorhandenen Zuständigkeiten.
Keine neue UI, kein neuer globaler State und kein eigener Firebase-Zugriff.

Alle Räume sind Szenenseiten mit stabilen, unterschiedlichen Schlüsseln.
Es gibt keine zusätzliche allgemeine Kommentarseite. Neue Szenen haben noch
kein Aleria-Datum, keine Teilnehmer und keinen fest zugewiesenen Figurenkreis.
Der gemeinsame Esssaal gehört jeweils zum Bergfriedmodul. Gafyrs Hof hat vier,
Wyrms Hof mit Zugbrücke fünf Szenen; die beiden Ratsräume und drei Bergfriedräume
bleiben für jede Burg getrennt bespielbar.

Aktive PNGs: `AleriaAlmanach/assets/gwynthor-castles/2026-11-14/`.
Generatororiginale, vollständige tatsächliche Prompts und Receipts:
`AleriaAlmanach/docs/art/gwynthor-castles-20261114/`.
Die bestehende Rasteraufnahme erhält Original und aktive Fassung bytegleich.
Das Szenenpreset ist `anime-scene-portrait` mit Kyrwyn-v3-Stilreferenz und dem
jeweiligen unveränderten Hauswappen als tatsächlichen Bildreferenzen.
Autorenquellen und Generatorbelege sind vom statischen Paket ausgeschlossen;
die generierte Registrierung und aktiven Bilder werden ausgeliefert.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-castles.mjs
node AleriaAlmanach/scripts/admit-gwynthor-castle-art.mjs --write
node AleriaAlmanach/scripts/build-gwynthor-castles.mjs --check
node AleriaAlmanach/scripts/admit-gwynthor-castle-art.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-castles.test.mjs
node AleriaAlmanach/tests/gwynthor-castles.browser.mjs
```

Die zehn einzelnen Importpakete liegen unter
`Charakter Archiv Exporte/Module/Gwynthorer Burgen/`. Die lokale Anwendung lädt
sie bereits über die erzeugte Registrierung; ein zusätzlicher Import ist dort
nicht nötig. Der Auftrag umfasst die lokale Umsetzung. Kein Push, Website-
oder Backenddeploy und keine produktiven Modul-/Spielwrites wurden ausgeführt.
Quelleninventar, Prüfmethoden und Abschluss stehen unter
`diagnostics/gwynthor-castles-20261114/`.
