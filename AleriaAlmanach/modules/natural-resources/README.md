# Natürliche Rohstoffe

Das Feature registriert die Weltpfade-Kategorie und ihre vier Bereiche **Erz**, **Holz**, **Mineralien** und **Edelsteine**. Leere Bereiche sind ausdrücklich als `sectionOnly` definiert und bleiben in der gemeinsamen Archivnavigation erreichbar. Registrierung, Benutzerzuordnungen und gespeicherte Bearbeitungen verwenden die bestehenden Archiv- und Module-Store-Systeme; dieses Feature greift nicht selbst auf Firebase zu.

## Tenebrium

Die Autorenangaben vom 11. Oktober 2026 stehen in `tenebrium-content.mjs`, die Zuordnung zu den vorhandenen Seitenvorlagen in `natural-resources-model.mjs`. Vier erzählerische Seiten und vier Werkstoffakten verwenden die bestehende Story- beziehungsweise Artefaktvorlage. Die celestiale Blutlegierung erhält keinen erfundenen Eigennamen. Es werden keine numerischen Kampfwerte eingeführt.

Verbindliche Fundortangabe: **acht bekannte Fundorte allein in Celtigerns Wacht**; weltweit weitere, Gesamtzahl unbekannt, die meisten in Morgorn und Galadorn. Magieunterdrückung ist stark, aber niemals vollständige Magieimmunität. Der Ursprung im Blut gefallener Wesen bleibt druidische Überlieferung.

Die acht eigenen Szenenbilder und das quadratische Pergament-Icon wurden mit dem eingebauten `image_gen` erzeugt. Vollständige Prompts, tatsächliche Stilreferenzen, Originaldateien und Projektpfade stehen in `image-prompts.json`. Die Szenen folgen `anime-scene-portrait` mit Tales of Xillia/Frieren; das Kategorie-Icon folgt den vorhandenen Pergamentkacheln Forschung und Werke.

## Pflege und Prüfung

Im Verzeichnis `AleriaAlmanach`:

```sh
npm run build:natural-resources
npm run check:natural-resources
npm run test:natural-resources
npm run check:templates
```

`natural-resources-data.js` wird generiert und mit veröffentlicht. Der Netlify-Build prüft seine Aktualität und führt die Featuretests vor der Veröffentlichung aus. Bei Änderungen am gemeinsamen Registrar auch die Kataloge für albische Gastfreundschaft, albische Clans, Windreiter und Hausgefolge neu generieren.

Erstprüfung: 22 Katalog-/Featuretests bestanden; 31 Feature-/Firebase-Releaseprüfungen bestanden; Template-Asset- und Roundtrip-Prüfung bestanden. Browserprüfung aller acht Seiten bei 1440 und 390 Pixel Breite: eigene Bilder geladen, Navigation einschließlich leerer Unterbereiche erreichbar, keine horizontalen Überläufe, JavaScript-Fehler, Dialoge oder automatischen Firebase-Schreibvorgänge.
