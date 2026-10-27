# Triarchie · Besetztes Lothir · Vorbereitung

Dieser Sonderentwurf umfasst ausschließlich Lothir: ein verlorenes Iathneacher
Mor Tiarnatum mit vier Teilgebieten sowie zwei verlorene Aldinger Grafschaften
mit fünf beziehungsweise drei Teilgebieten. Aldervans Besitzungen werden nur im
historischen Kontext genannt. Die drei Herrscher bleiben namenlos. Unterdrückung
wird nicht mit freiwilliger Gefolgschaft verwechselt.

15 Regionalzeichen: fünf albische Banner und zehn aldingische Kite-Schilde.
Elf neue Familien erhalten je ein kreisrundes Wappen und eine Ganzkörperfigur:
drei albische Clans und acht Aldinger Häuser. Die elf Ausgangssitze sind sichtbare
Vorschläge, frei verschiebbar und lokal gespeichert. Cuansioda bleibt ohne neuen
Clansitz; die Mac Farraigeach leben heute auf Sgeir Tearmainn in Iathneach.

Neue Ortsvorschläge: Erlensund, Segelwacht, Hammertal und Doire Fionn für die
Kartenplatzhalter sowie Hohenreede für Blankenstadt. Alte Kartenbeschriftungen
bleiben sichtbar und werden auf den Ortskarten ausdrücklich daneben genannt.
Wernmark und Hohenreede sind die beiden vorgeschlagenen Grafschaftsnamen.

Nutzerkorrektur: Der Baummarder trägt keinen Hammer mehr. Die abgelehnten
Handwerksmotive sind durch Eber, Seeadler, Luchs, Steinbock und Greif ersetzt.
Ihre alten Generatorfassungen bleiben ausschließlich im Archiv. Die Ruder des
Hohenreeder Gebietsschildes wurden gezielt berichtigt. Prompts und Eingabepfade
aller Korrekturen stehen in `assets/generation-provenance.json`.

`shared/lothir-occupation.mjs` besitzt Herkunft, gegenwärtige Kontrolle,
Teilgebiete und ehemalige Sitze. `shared/lothir-occupation-houses.mjs` besitzt
die besetzten Familien und ihre Bildentwürfe; `house-data.mjs` exportiert diese
gemeinsame Quelle. Iathneach, Aldingen und dieser Entwurf verwenden dieselben
Datensätze für die grauen Besatzungskarten. Spätere vollständige Herrschaftsseiten
können diese Quellen übernehmen. Keine kanonischen oder Firebase-Änderungen.

Die gemeinsame Werkstatt unter `shared/country-workbench` und die bestehenden
Karten-, Zustands- und Dragmodule besitzen die UI und lokale Speicherung.
Wappen- und Kriegeraufbereitung erhalten Originale und RGB-Pixel. Hash-, Alpha-
und Browserbelege liegen unter `diagnostics/iathneach-triarchie-2026-10-27`.

```text
node Vorschau/shared/build-country-art.mjs Triarchie
python -B Vorschau/shared/prepare-country-art.py Triarchie --audit
python -B Vorschau/Triarchie/prepare-warriors.py audit --expected-count 11
node --test --experimental-test-isolation=none Vorschau/tests/iathneach-triarchie.test.mjs
```

Lokale Vorschau: `http://127.0.0.1:8881/Vorschau/Triarchie/`.
Noch keine Freigabe für Push oder Deployment dieses neuen Standes.
