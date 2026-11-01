# Lleuwens kirchliche Anhörung

Lokale Ausarbeitung vom 31. Oktober 2026. Noch nicht veröffentlicht.

Vier eigenständige Personen, sechs stehende Oberkörperporträts im gespeicherten
Anime-Stil und eine dreiblättrige kirchliche Verlautbarung. Die Anzeigetafel nutzt
das vorhandene Kirchenplakat, auf Nutzerkorrektur verkleinert neben dem
Feiertagsplakat und mit freiem Abstand zu den umliegenden Blättern. Kein Questtyp,
kein ausgesetzter Lohn, kein vorweggenommenes Urteil.

`formlingssache-people.mjs` hält die gemeinsamen Identitäten. Verwaltung und
Kathedralenhierarchie belegen mit Euddogwy O'Cenyr die bisher freie persönliche
Kanzleistelle. Der Adjutant ist 38, ehemaliges Gwynthorer Waisenkind und Kurator;
die neun Prälaten und die Zahl der Kirchdiener bleiben erhalten. Orvar
Schattentänzer (33, blond, aus Klangheim) und Lleuwen ergänzen Statisterie und
Nebenrollen. Die bisherigen 13 Ensemblemitglieder bleiben bestehen.

Schattentänzer ist auf Nutzerentscheidung als Klangheimer Familienherkunft
vorgemerkt. Ein Stammbaum und Eltern sind noch nicht ausgearbeitet. Die geprüften
Klangheimer Register führen bisher Adelsclans; keiner davon wird zum bürgerlichen
Elternhaus des Schauspielers umgedeutet.

Lleuwens tatsächliches Alter bleibt unbekannt. Ihre drei Bildsets zeigen die
menschliche Erscheinung (wirkt 28), wahre Gestalt und den gegenwärtigen Gewahrsam.
Ihr Artenverweis führt zum vorhandenen Formwandler-Profil des Bestiariums.
Ulrich ist 59 und stammt aus Aldingen. Seine nicht ausgeplauderten persönlichen
Gründe für den Weggang aus Weisenfluh werden nicht erfunden. Der vom Nutzer
eingefügte Gildentext bleibt als Quellenkopie in den Diagnosebelegen erhalten.

Die Verlautbarung wird von Euddogwy im Auftrag Gwalchgwyns ausgefertigt. Neithon
Draig unterstützt bei der weltlichen Frage des Schlages. Andere Würdenträger sind
noch unbestätigt. Der Termin ist ausdrücklich offen; die Kanzlei erwartet die
Anhörung spätestens bis Ende der Woche. Auf Nutzerkorrektur schildert Blatt 1
den Vorfall nur flüchtig und erklärt Besetzung, Termin und Ablauf. Blatt 2 stellt
die drei Parteien und ihre unmittelbaren Anliegen kurz vor, ohne ihre
Vorgeschichten auszubreiten. Blatt 3 mahnt zu Ruhe und Vorsicht im Umgang mit
infernalen Wesen und verweist Zeugen und andere Vorsprechende an Euddogwy.

```powershell
python Anzeigetafeln/tools/build-formling-notice-art.py
node AleriaAlmanach/scripts/build-gwynthor-formlingssache.mjs
node AleriaAlmanach/scripts/build-gwynthor-cathedral.mjs
node AleriaAlmanach/scripts/build-gwynthor-theater.mjs
node Anzeigetafeln/tools/build-gwynthor-quest-notices.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-formlingssache.test.mjs
```

Prompts und Originalpfade: `diagnostics/gwynthor-formlingssache-2026-10-31/`.
PNG-Originale bleiben erhalten; WebP-Ableitungen beschneiden ausschließlich den
transparenten Rand und verkleinern die drei Zeichen für die Anzeige. Der
Figurenimport verwendet den vorhandenen begrenzten Importweg und schreibt keine
fremden Figuren, Online-Ressourcen oder Firebase-Daten neu.
