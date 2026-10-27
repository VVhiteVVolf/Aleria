# Fürstentum Iathneach · Vorbereitung

Neun unverändert gelieferte Clanwappen, acht Orte und vier farbige Großregionen.
Die beiden Ausgangssitze sind Ui Nic Cétchathach → Botharin und Mac Farraigeach
→ Sgeir Tearmainn; die übrigen sieben Clans beginnen ohne Sitz. Cuansioda ist der
verlorene Herkunftssitz der Mac Farraigeach, kein zweiter aktueller Sitz.

Zwölf gewebte Banner und neun Ganzkörperfiguren sind eigene Bildentwürfe. Die
vier Großregionen und alle Ortsgebiete haben vorläufige Namen. Innere Grenzen
zwischen den Ortsgebieten werden nicht erfunden: die gelieferte Karte enthält
nur die vier Farbgruppen. Alle Zuordnungen sind lokale, reversible Vorschläge.

`house-data.mjs`, `territory-data.mjs` und `realm-context.mjs` besitzen die lokalen
Inhalte. `placement-state.mjs` konfiguriert den gemeinsamen Entwurfszustand.
`shared/country-workbench` besitzt Darstellung, Hausfenster und Initialisierung;
`shared/country-placement.mjs` den wiederverwendeten Zuordnungscontroller.
Die bestehenden Karten- und Dragmodule bleiben die gemeinsame Quelle.

Besetzte Räume und Familien werden einmalig unter `shared/lothir-occupation*.mjs`
gehalten. Ihre graue Darstellung ordnet sie weiterhin ihrem Ursprungsland zu.
Es werden keine kanonischen Register, Personen oder Firebase-Daten geschrieben.

Bildquellen stehen in `assets.source.json`; Generatororiginale, vollständige
Prompts, Produktionsdateien und Vorschauen bleiben getrennt. Die beiden
Randkorrekturen von Cétchathach und Salaig bleiben mit ihren Eingaben archiviert.
Die genehmigte technische Alphaaufbereitung erhält alle ursprünglichen RGB-Pixel.
Die Bildprüfungen liegen unter `diagnostics/iathneach-triarchie-2026-10-27`.

Aufbereitung vom Projektstamm:

```text
node Vorschau/shared/build-country-art.mjs Iathneach
python -B Vorschau/shared/prepare-country-art.py Iathneach --audit
python -B Vorschau/Iathneach/prepare-warriors.py audit --expected-count 9
node --test --experimental-test-isolation=none Vorschau/tests/iathneach-triarchie.test.mjs
```

Lokale Vorschau: `http://127.0.0.1:8881/Vorschau/Iathneach/`.
Noch keine Freigabe für Push oder Deployment dieses neuen Standes.
