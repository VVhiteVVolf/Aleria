# Nadel & Faden · Gwniwr

Eigenständige Schneiderei in Gwynthor. Die gelieferte Hausquelle belegt den Namen,
die beinahe zweihundertjährige Geschichte, Emyr und Gwenllians gemeinsame Führung,
Tudurs Meisterarbeit, die Mithilfe Eleris sowie fünf benannte Angestellte.

Der aktuelle Nutzerauftrag bestimmt den Schwerpunkt: schlichte bis gute
walisisch-gälische Kleidung zu den niedrigsten Preisen der drei Schneidereien,
ergänzt um wenige Hochzeitsmodelle. Die 51 eigenen Garnituren verteilen sich auf
22 Damen-, 22 Herren-, vier Braut- und drei Bräutigamsmodelle. Preise sind als
ganze Kupfertaler in `gwniwr-collection.mjs` gepflegt und liegen bei 12–240 KT.

- `gwniwr-module.mjs`: sechs native Almanachseiten mit eigener Bildausstattung.
- `gwniwr-personnel.mjs`: kanonische Familienidentitäten und fünf externe Kräfte;
  zugleich Quelle ihrer neu ausgearbeiteten Berufsrollen und Bios.
- `gwniwr-hierarchy.mjs`: drei Reiter, neun benannte Arbeitskräfte und elf freie
  Silhouettenstellen. Unbekannte Gründer und jüngere Kinder erhalten keine Stellen.
- `gwniwr-collection.mjs` / `gwniwr-catalog.mjs`: Sortiment und native Güterkarten.
- `scripts/build-gwniwr-shop.mjs`: ausschließlich das Moduldaten-JS und das
  begrenzte Exportpaket; `--check` schreibt keine Ausgaben.

Sonderwünsche sind auf der Geschäftsseite beschrieben: Änderungen, Ausbesserungen,
Stoffwahl und die kleine Hochzeitsauswahl. Tuch und Werkstattzeit werden vor einer
Terminzusage geprüft. Der Modultext verspricht keine Lagerbestände, Rabatte oder
automatisch berechneten Mengenaufträge. Es werden keine Inventare vergeben.

Die Bilder liegen unter `assets/gwniwr/`. Originale, vollständige exakte Prompts,
Referenzen, Hashes und Sichtprüfungen bleiben im privaten Aufnahmebeleg unter
`diagnostics/gwniwr-maerllys-20261108/gwniwr/art/`. Erzeugung ausschließlich mit
dem eingebauten Bildwerkzeug. Jedes Kleidungsmodell besitzt ein eigenes Bild
auf weißem kopflosem Puppentorso, als transparentes quadratisches Inventarasset.

Build und Prüfung:

```powershell
node AleriaAlmanach/scripts/build-gwniwr-shop.mjs
node AleriaAlmanach/scripts/build-gwniwr-shop.mjs --check
node --test AleriaAlmanach/tests/gwniwr-shop.test.mjs
```

Die Veröffentlichung erfolgt gemeinsam mit Maerllys durch den isolierten
öffentlichen Aleria-Releaseweg. Die Quellbuilder schreiben keine produktiven
Firestore-Dokumente und lösen keinen Push oder Deploy aus.
