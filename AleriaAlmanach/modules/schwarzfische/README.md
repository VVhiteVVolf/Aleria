# Schwarzfischbanner

Lokale Ausarbeitung vom 16. November 2026 auf Grundlage des vorhandenen Online-Moduls
`modul-1781961958641` und der Schwarzfischbeschreibung `schwarzfische-windreiter`.
Das bestehende Modul besitzt jetzt fünf Seiten. Grenns Biografieseite ergänzt
Einführung, Cynwrig, Hierarchie und die vorhandene Reiselagerszene.

## Verantwortung

- `schwarzfische-module.mjs` besitzt die Modulseiten und die Archivregistrierung.
- `schwarzfische-hierarchy.mjs` ordnet Besetzungen, Rollen und Bildverweise zu.
- `schwarzfische-offices.mjs` beschreibt Verwaltungsämter und Aufgabenrollen.
- `schwarzfische-troops.mjs` benennt die zehn Trupps und ihre Wappen.
- `schwarzfische-characters.mjs` besitzt Grenns Biografie und den begrenzten Figurenexport.
- `sources/` bewahrt die gelesenen Onlinefassungen und die Bildherkunft.

Die vorhandene Hierarchievorlage unterstützt jetzt optional `columns`, `startsGroup`
und `emblem` je Ebene. Beide Editoren erhalten diese Felder im JSON-Rücklauf.
Die bestehende Knotengrenze beträgt zwölf je Ebene, die Ebenengrenze jetzt 32.

## Organisation

Der erste Reiter zeigt den Kern mit sieben offenen Kernplätzen, darunter vier
zusätzlich ausgearbeitete Reservestellen. Zibhi ist aus der Hierarchie entfernt.
Grenn ergänzt den Kern als Speerträger.

In der Administration folgen auf Cynwrig ein offener Adjutantenplatz, acht
Fachbereiche in zwei Viererreihen, Sinead als einzelner Gildenvogt und zwölf
Sonderämter in drei Viererreihen. Alara und Colm besetzen ihre aus dem Bestand
abgeleiteten Fachbereiche. Jede Beschreibung umfasst höchstens zwei neutrale Sätze.

Führungspersonen stehen in zwei Dreierreihen. Sinead besitzt zusätzlich das örtliche
Windfesteamt, Agnes führt die Schwarze Flut und Breandan die Schattenschuppe.
Windfeld sowie zwei unbenannte Standorte besitzen offene Leitungsplätze.

Jeder der zehn benannten Trupps besitzt einen Unteroffizier, zwei nebeneinander
angeordnete Leutnants und acht Aufgabenplätze in zwei Viererreihen. Die beiden
Leutnants koordinieren jeweils eine Viererrotte unter dem Unteroffizier, entsprechend
der ausdrücklichen Nutzerentscheidung dieses Auftrags.

Die Aufgabenrollen umfassen Kundschafter, Kleriker, Heiler, Aufspürer, Kämpfer,
Schütze, Jäger und Versorger. Trupp I übernimmt die vorhandenen vier benannten
Mitglieder und zwei unbenannten Porträts. Seine Aufgabenverteilung berücksichtigt
diesen Bestand. Die übrigen neun Trupps verwenden die acht unterschiedlichen
vorbereiteten Rollen.

## Grenn und Bildstand

Grenn ist 33 Jahre alt. Sein endgültig gewähltes Herkunftshaus ist Coelret aus dem
Vasallenkreis der Beran. Das Pferdewappen und der vorhandene Hyld-Entwurf bilden
den Reiterbezug. Der frühere Vorschlag Seolfor wurde vom Nutzer verworfen.
Die erste lokale technische Figurenkennung und der Exportpfad bleiben als stabile
Quellkennungen erhalten. Sichtbarer Name, Haus, Wappen, Herkunft und Biografie
führen Coelret.

Das aktiv verwendete Porträt ist `assets/schwarzfische/grenn-coelret-v2.png`.
Elf generierte Silhouettenvarianten decken militärische, geistliche, heilkundige
und administrative Kleidung ab. Zehn eigene Rundwappen kennzeichnen Hechte,
Lachse, Aale, Barsche, Welse, Zander, Forellen, Rochen, Karpfen und Störe.
Originale, tatsächliche Prompts und Referenzhashes stehen unter
`docs/art/schwarzfische-20261116/`.

Hotemras ursprünglicher Postimg-Bildhost war über mehrere Lesewege unerreichbar.
Der Rollenplatz verwendet vorläufig die Soldatensilhouette. Die ursprüngliche
Bildadresse bleibt im Quellinventar erhalten.

## Erzeugen und prüfen

```powershell
node AleriaAlmanach/scripts/build-schwarzfische.mjs
node AleriaAlmanach/scripts/build-schwarzfische.mjs --check
node CharakterDatenbank/scripts/import-authored-characters.mjs --check --feature schwarzfische-20261116 --source "Charakter Archiv Exporte/Schwarzfische/grenn-seolfor.json"
node --test --experimental-test-isolation=none AleriaAlmanach/tests/schwarzfische.test.mjs
node AleriaAlmanach/tests/schwarzfische.browser.mjs
```

Der erste Befehl schreibt Registrierung und Exporte. Der Figurenimport mit
`--check` liest und vergleicht den bereits lokal aufgenommenen Grenn-Datensatz.
Der Browserlauf besitzt einen eigenen frischen Kontext und eine lokale
Kommentarfixture. Diagnosebelege liegen unter
`diagnostics/schwarzfische-expansion-20261116/`.

Die Online-Modulakte besitzt weiterhin Vorrang vor eingebauten Standarddaten.
Eine spätere öffentliche Übernahme muss deshalb die bestehende Online-Akte mit
derselben Modulkennung aktualisieren. Die gespeicherten Seiten- und Szenenkennungen
sind in den Quellen und Prüfungen erfasst.
