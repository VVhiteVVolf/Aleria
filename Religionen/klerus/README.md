# Der Alerische Klerus

Eigenständiger Bereich unter `Religionen/klerus/index.html` mit 19 Götterunterseiten und jeweils sechs Berufungen. Die überholte Seite `AleriaKlerus/AlerischerKlerus.html` wurde auf Nutzerwunsch aus dem aktiven Bestand entfernt. Ihre vier Originaldateien liegen unverändert und mit geprüften Hashes im [historischen Archiv](../../Archiv/AlerischerKlerus/README.md). Sie sind kein redaktioneller Bezugspunkt für diese neue Ordnung.

## Verbindliche Inhaltsregeln

- Sechs Kasten: Priester, Mönche/Nonnen, Paladine, Asketen, Magister und Büßer/Geläuterte.
- **Zünfte gehören ausschließlich zu Mönchen und Nonnen.** Jede Gottheit beschreibt ihre monastischen Fachgemeinschaften selbst. Orden und bekannte Gemeinschaften sind keine zusätzlichen Kasten.
- **Drei wissenschaftliche Bereiche: Orin, Auron, Orith.** Persönlicher Glaube an einen anderen Gott schafft keinen weiteren Fachbereich. Akademische Grade und Leitungsämter gelten gemeinsam; Studierende müssen nicht dem Klerus angehören. Fachübergreifende Forschung verbindet die drei Bereiche.
- **Asketische Gemeinschaften:** Bildnisse sind für Ordan, Baldran, Maldras, Sylvana und Kharon geliefert. Bei den übrigen Gottheiten gibt es keinen oder kaum eigenen asketischen Klerus; einzelne Gläubige und seltene Gemeinschaften bleiben möglich. Dort erscheint keine leere Bildankündigung. Die allgemeine Rangordnung gilt bei Zugehörigkeit zu einer bestehenden Schule.
- **Priesterordnung mit 14 Stufen nach Nutzernachtrag:** Laie → Oblat → Novize → Adept → Kurator → Priester → Diakon/Pastor → Vikar → Prälat → Bischof → Erzbischof → Patriarch → Erzpatriarch → Hierarch. Diakone leiten Ortskirchen, Vikare größere Gemeinden mit Bannkreis und unterstellten Diakonen. Prälaten haben kein ortsgebundenes Amt. Bischof ist optional und einem Baron gleichgestellt; Erzbischöfe entsprechen Grafen oder Fürsten. Patriarchen führen die Geistlichkeit einer feudalen Struktur; Erzpatriarchen können Länder wie Cenyr/Aldrimar oder große Orden vertreten. Die Titel können sich in einer Person verbinden.
- **Buße endet:** genau zwei Stände, Bußgänger und Geläuterter. Der Bußgänger legt Eid und Schweigegelübde ab; nach vollendetem Bußgang ist er von den vereinbarten Diensten und Gelübden befreit und kann frei in die Gesellschaft zurückkehren.
- Gemeinsame Kirchenhäuser können mehrere Kasten vereinen. Reine Konvente, Ritterorden, Universitäten und asketische Heiligtümer sind ebenfalls beschrieben.

## Quellen und Verantwortung

`register.json` enthält Reihenfolge, Sammlung und Inhaltsquellen. `gemeinschaften.json` beschreibt das gemeinsame Leben, Häuser und Begriffe; `wissenschaften.json` die drei wissenschaftlichen Bereiche. `kasten/<id>.json` ist die einzige Quelle für allgemeine Berufung und Rangfolge. `gottheiten/<god-id>/eintrag.json` enthält die individuellen Rollen, Aufgaben, monastischen Zünfte, lokale Zusammenarbeit und Bildzuordnungen. IDs referenzieren die bestehenden Götterprofile.

Grundlage ist Nutzeranhang `1ab18eae-96bd-4673-8e76-7b7a0d493944` sowie die Klarstellungen zu Zünften, Magisterium, Asketen und Priesterrängen vom 10.09.2026. Gottesspezifische Dienste und monastische Zünfte wurden anhand dieser Vorgaben und der vorhandenen Lore ausgearbeitet; Herkunft steht im Register und in den Profilen.

`../modules/clergy/` besitzt Repository/Validierung, eigene Vorlagen für Übersicht und Götterseiten, gemeinsame Hierarchie- und Fakultätsdarstellung, die gekapselte Kastensteuerung, URL-Zustand und CSS. Die Suche verwendet das bestehende Katalogmodul; Symbole und Namen kommen aus dem Religionsregister. Neue Profile benötigen keine kopierten Listener. Keine Firebase-Zugriffe oder globalen Zustände.

## Bilder pflegen

Priester, Mönche und Paladine verwenden `E:\Aleria\BilderRüstungen\<god-id>_<priest|monk|paladin>.png`. `gelaeuterte.png` stellt ausdrücklich den verpflichteten Bußgänger dar. `bildmasse.json` führt die Bildmaße dieser vorhandenen Dateien.

Die drei Magister- und fünf Asketenbilder liegen unverändert unter `assets/`. `assets/sources.json` enthält Original-URLs, Abmessungen und SHA-256. Die Zuordnung steht im jeweiligen Profil unter `imageOverrides.<caste-id>.src`, als Pfad relativ zur Projektwurzel. `clergyArt()` löst Zuordnung und Maße auf. Bei einem Bildtausch Datei, Zuordnung und Metadaten gemeinsam aktualisieren. Vite verarbeitet sowohl das sichtbare Bild als auch den Link zur vollständigen Datei; die Bilder funktionieren dadurch auch im Produktionspaket.

`presence` unterscheidet `fest`, `klein`, `selten`, `eingebunden` und `angebunden`. Die letzten beiden bedeuten hier ohne eigenen Zweig bzw. wissenschaftliche Anbindung an die drei Fachbereiche. Ein nicht vorhandenes reguläres Bild wird nicht durch ein fremdes Rollenbild ersetzt. Erweiterungen benötigen eine begründete inhaltliche Zuordnung, nicht bloß eine neue Abbildung.

## Erzeugen und prüfen

Aus der Projektwurzel:

```text
node Religionen/scripts/build-religions.mjs
node Religionen/scripts/build-religions.mjs --check
node --test Religionen/tests/*.test.mjs
```

Der gemeinsame Generator erstellt 70 HTML-Dateien für Religionen einschließlich der alten Infernalen-Weiterleitung, darunter 20 Klerusseiten. Quelldaten und erzeugte HTML-Dateien werden gemeinsam gepflegt. Vite leitet seine Einstiege aus denselben Registern ab. Keine manuell gepflegte Liste der 19 Unterseiten in der Build-Konfiguration.

Ohne JavaScript sind alle sechs Kasten lesbar und über Anker erreichbar. Mit JavaScript wechseln barrierearme Reiter das aktive Blatt; `#moenche`, `#asketen` usw. erlauben direkte Verweise, Browsernavigation und Tastaturbedienung. Beim Drucken erscheinen alle Kasten. Die breite Hierarchietabelle scrollt innerhalb ihres eigenen Bereichs.
