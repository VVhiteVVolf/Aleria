# Dunfal – Abschlussprüfung

Stand: 22. Oktober 2026. Die Browserprüfung erfolgte über die verbundene
Chrome-Erweiterung auf dem lokalen Projektserver. World Anvil wurde nicht geändert.

## Automatisierte Prüfung

- Karten: **105/105** Tests bestanden (`Karten/tests/*.test.mjs`).
- Kontinentseiten: **40/40** Tests bestanden (Dunfal, Alben, Ivarsheim,
  Krähenmoor und Heldenwacht).
- Familien: **15/15** Tests bestanden (Dunfal-Familien, Struktur und Portrait-Upgrade).
- Dunfal-Kartenbuilder und Seitenbuilder: `--check` bestanden.
- Leitheach-Kartenbuilder und Alben-Seitenbuilder: `--check` bestanden.
- **38/38** vor Beginn vorhandene Kartendateien unverändert; SHA-256-Abgleich
  in `protected-maps.json`.

## Browserprüfung

`browser-verification.json` dokumentiert alle 13 geladenen Herrschaftsseiten,
die Ratsbilder, die Hauptstadt-Ortskarte und die vollständige Beschreibung der
Abtei Dämmerlicht. Keine defekten Bilder oder horizontalen Seitenüberläufe in
den geprüften Ansichten. Ratskarten und Familienregister wurden zusätzlich in
390 und 768 Pixel breiten Frames geprüft (je 15 Pixel vertikale Scrollleiste).

Tadgs tatsächliches neues Porträt ist auch im Stammbaum geladen. Hearn Nuadat
verwendet nach ausdrücklicher Nutzerantwort die neutrale Silhouette.

Die Vektorgrenze bleibt bei Kartenzoom 0,199588 und 0,223538 sichtbar 6 Pixel
breit; ausgewählte Grenzen verwenden 8 Pixel. Alle 17 Grenzobjekte werden
dargestellt. Quellenabgleich und offene nummerierte Gebiete:
[Dunfal-Abgleich](../../Karten/Dunfal/ABGLEICH.md).

Die erfassten Konsolenmeldungen betreffen ausschließlich einen fehlgeschlagenen
Modulimport einer Browser-Erweiterung (`chrome-extension://…`), nicht Projektdateien.

`overview.jpg` zeigt die Regionsübersicht, `detail.jpg` die Ratskarten mit dem
neuen Tadg-Porträt und Hearns Platzhalter. Die Screenshots entstanden vor Ort
und sind keine entworfenen Vorschauen. Kein Push und kein Deployment.
