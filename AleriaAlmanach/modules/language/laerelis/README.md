# Laerelis · Die Sprache des Lichthains

Eigenständiges Sprachmodul `laerelis-lichtfluss` unter **Sprachen**, nach dem
fünfseitigen Aufbau von Morgar. Es nutzt die vorhandenen Sprach-, Namens- und
Schrifttabellen, deren Bearbeitungsformulare und den gemeinsamen Modul-Store.

1. Lichtrede, Herkunft und kultureller Überblick, mit Waldrandszene.
2. Lautung, Wortbildung, Grammatik, Namenspartikeln, Zahlen und Sprachproben,
   mit einer Szene aus der Hainschule.
3. Alle 1.800 Namensvorschläge: 600 männliche, 600 weibliche sowie 300 Sippen
   und 300 Häuser. Die drei Gruppen sind alphabetisch sortiert.
4. Alle 25 Lichtfluss-Grundzeichen und die 400 einsilbigen Wortstämme.
5. 1.000 Sachwörter und 132 Funktionswörter in einem alphabetischen Register,
   mit deutscher Bedeutung, Aussprache, Wortart und Wortbau beziehungsweise Gebrauch.

## Quellen und Build

`Fonts/Laerelis Font/Laerelis_Vorschau_Einzeldatei.html` ist die unveränderte
Datenquelle (Sprachbasis 1.1, Paket 1.2, Namensrevision 03). Der Build liest
deren eingebettetes JSON und extrahiert den enthaltenen originalen WOFF-Font
Lichtfluss 1.000. `laerelis-data.js` und
`assets/LaerelisLichtfluss-Regular.woff` werden daraus reproduzierbar erzeugt.
Die Sprachtexte beruhen auf `Laerelis_Sprache_und_Kultur_v1_1.docx`.

```sh
npm run build:languages
npm run check:languages
node --test tests/laerelis-module.test.mjs
```

Bei einer Windows-Sandbox ohne erlaubte Test-Unterprozesse kann zusätzlich
`--experimental-test-isolation=none` verwendet werden. Vite prüft die Aktualität
der erzeugten Dateien beim Build. Die vorhandene Kopie des `modules`-Verzeichnisses
nimmt Daten, Font und Bilder mit; die CSS-Fontreferenz wird von Vite verarbeitet.

Die gemeinsamen Grenzen erhalten jetzt 600 Namen je Gruppe, bis zu 1.200
Tabellenzeilen und 400 Wortstämme. Dadurch bleiben die gelieferten Bestände
bei Bearbeitung, Import, Export und erneutem Laden vollständig erhalten.

## Schrift

`laerelis-script.js` setzt die explizit gewählte Schrift in die gelieferten
direkten Zeichencodes U+E100–U+E118 um. TH, DH, SH und NG ergeben jeweils ein
Zeichen, auch in gemischter Groß-/Kleinschreibung. Die ältere Ogham-Belegung
kann ebenfalls dargestellt werden. Der gespeicherte Klartext bleibt erhalten;
andere Schriften werden nicht konvertiert. Schriftstile in beiden Editoren
sowie die gemeinsame Auswahl für Fremdsprachblasen und Zauberformeln enthalten
**Laerelis · Lichtfluss**. Namenslisten bleiben wie bei Morgar lesbar; nur die
Verzierung trägt die eigene Schrift.

## Bilder

Mit dem integrierten Imagegen-Werkzeug erzeugt, jeweils **1024 × 1536 (2:3)**:

- `assets/laerelis-waldrand-v1.png`
- `assets/laerelis-hainschule-v1.png`

Die vollständigen Prompts stehen in den gleichnamigen `.prompt.md`-Dateien.
Beide verwenden die vom Nutzer vorgegebene Frieren/Tales-of-Symphonia-Stilpassage.
Die Darstellung nutzt `contain` und beschneidet die Szenen nicht.

## Prüfung im Browser

`tests/laerelis.browser.mjs` prüft alle fünf Seiten, Navigation, Originalfont,
vollständige Listen, beide Bildformate, lokalen Export mit erneutem Laden und
die mobile Darstellung. Wie die bestehenden Sprachtests verwendet es
`PLAYWRIGHT_MODULE` und optional `PLAYWRIGHT_EXECUTABLE`.
`LAERELIS_TEST_ORIGIN` setzt den lokalen Server (Standard Port 4189),
`LAERELIS_SCREENSHOTS` einen Ausgabeordner für Screenshots. Alle externen
Requests werden im Test blockiert; es werden keine Firebase-Daten geschrieben.

## Verifiziert am 19. September 2026

18 gezielte Sprach- und Editortests, beide `check:languages`-Pr?fungen und
`check:templates` (31 Vorlagen) bestanden. Der Chromium-Test bestand gegen
Entwicklungsserver und separat gebaute Almanach-Produktionsausgabe, einschlie?lich
Originalfont, Bildformaten, vollst?ndigen Registern, Export/Reload und mobiler
Darstellung. In der Produktionsausgabe wurden zus?tzlich Maus-, Klick- und
Tastaturbedienung der Laerelis-Fremdsprachblase gepr?ft.

Vier bestehende F?lle in `morgar-module-store.test.mjs` scheitern im aktuellen
Arbeitsstand an fehlendem `CustomEvent` im Testkontext beziehungsweise bereits
abweichender Normalisierung. Ein isolierter Vergleich ohne die Laerelis-?nderungen
liefert dieselben vier Fehler. Die neuen Laerelis-Speichertests bestehen.
