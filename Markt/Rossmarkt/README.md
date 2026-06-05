# Rossmarkt

Statische Rossmarkt-Seite fuer Reittiere, Zuchtbuch, Nachzucht-Rechner und Owain-Draig-KI.

## Struktur

- `Rossmarkt.html` enthaelt die Seitenstruktur und Tabellen.
- `styles/rossmarkt.css` enthaelt das ausgelagerte Styling.
- `scripts/rossmarkt.js` enthaelt Filter, Detailansichten, Vergleich, Zuchtbuch, Nachzucht-Rechner und KI-Anbindung.
- `kontext_pferde.md` ist die editierbare Wissensquelle fuer Pferderassen und Owain.
- `data/kontext-pferde.js` stellt den Markdown-Kontext der Seite als Browser-Datenquelle bereit.

## Kontext aktualisieren

Wenn `kontext_pferde.md` geaendert wird, muss `data/kontext-pferde.js` aus dem Markdown neu erzeugt werden, damit Owain und die KI-Beschreibungen den aktuellen Kontext verwenden:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\update-context.ps1
```
