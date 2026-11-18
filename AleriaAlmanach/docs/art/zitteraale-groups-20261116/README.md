# Schwarze Zitteraale: Gruppenbilder

Bildaufnahme vom 16. November 2026 mit dem eingebauten `image_gen`.
[generation.json](generation.json) enthält die tatsächlichen Prompts,
Generatorpfade, Referenzen, Originalpfade, SHA-256-Prüfsummen, Bildmaße und die
aktive Auswahl. 34 Generatororiginale bleiben erhalten; 28 sind aktuell aktiv.
Alle neuen Bilder haben unveränderte 1024 × 1536 Pixel im Format 2:3.

Die aktive Auswahl umfasst sieben silhouettenhafte Gruppenführer, fünfzehn
weitere Räuber, zwei Banner sowie Medrawd und zwei aktuelle Leutnants. Die acht
Gruppen verwenden den gemeinsamen Räuberpool aus einem bestehenden Bild und
fünfzehn Ergänzungen. Die schwarzen Gesichts- und Kopfsilhouetten sind absichtliche
Platzhalter; Kleidung und Rüstung tragen die Rolle.

Das blanke schwarze Tuch steht für Gruppe II. bis VIII. Das Banner der
**Untoten Aale** zeigt einen von Maden zerfressenen untoten Aal auf schwarzem Tuch
mit gelben und silbernen Akzenten. Außerhalb des Tuchs bleibt das Bild transparent.
Alle vier Eckpixel haben Alpha 0; 586.179 Pixel sind vollständig transparent.
Auf weißem, pergamentfarbenem und dunklem Grund wurden die Ränder betrachtet.
Es gab keine nachträgliche Alpha-, Farb- oder Größenkorrektur.

| Figur | Aktive Version | Eingearbeitete Korrektur |
| --- | --- | --- |
| Medrawd Angau | `medrawd-angau-v3.png` | Fünf mechanische Finger, kräftige verkrampfte Zauberhand, imposanteres gesenktes Schwert, Haarverlust und fehlender Ohrteil auf der verbrannten rechten Seite |
| Erster Leutnant, Name offen | `untote-aele-leutnant-1-v2.png` | Glatzköpfiger ehemaliger Ritter, blaue Augen, rote Brauen, beide Hände am Schwertknauf, bedrohlicherer Ausdruck |
| Zweite Leutnantin, Name offen | `untote-aele-leutnant-2-v3.png` | Blond, Kapuze und Rüstungsrobe, grüne Gesichtszeichen, Stab und freie Zauberhand, deutlicherer gemeinsamer Anime-Stil |

Die überholten Brackwasser-, Medrawd- und Leutnantfassungen bleiben unter
`originals/` mit ihren tatsächlichen damaligen Prompts erhalten. Sie werden
im aktuellen Modul nicht benutzt. Die kurzzeitig kopierte Medrawd-v2-Datei
wurde nach identischem Archivhash aus dem aktiven Bildordner entfernt;
[Bereinigungsbeleg](../../../../diagnostics/zitteraale-groups-20261116/retired-copy-cleanup.json).
Die ursprüngliche Generatorausgabe bleibt ebenfalls erhalten.

Neun lokal zugängliche Referenzen wurden bytegleich unter `references/` gesichert.
Das vom Nutzer hochgeladene blonde Vorbild besaß keinen lokalen Dateipfad. Für
die entsprechende Bearbeitung wurden vier letzte Gesprächsbilder einbezogen;
der tatsächliche Prompt bezeichnet das weibliche Vorbild und schließt den
kahlen Mann als Ziel aus. Es wird kein nicht vorhandenes Referenzoriginal oder
dessen Hash behauptet. Die spätere Animefassung verwendete das lokal vorhandene
v2-Bild als unmittelbare Vorlage.

Die historischen Brychan-, Tegid- und Rhodri-Porträts wurden aus den vorhandenen
Onlineakten aufgelöst und bytegleich in die lokale Sammlung übernommen.
Die Quellen stehen unter
`modules/schwarze-zitteraale/sources/former-members-online-20261116.json`.

Alle 27 aktiven neuen Bilder sowie fünf wiederverwendete Motive wurden auf vier
Kontaktbögen tatsächlich betrachtet. Die Namenskorrektur **Die Untoten Aale**
ändert sichtbare Texte; vorhandene technische Dateinamen mit `aele` bleiben
stabile Versionskennungen. Weitere Belege:
[Sichtprüfung](../../../../diagnostics/zitteraale-groups-20261116/visual-review.json),
[Bestandsabgleich](../../../../diagnostics/zitteraale-groups-20261116/preservation-audit.json).
Keine Veröffentlichung oder produktive Bildänderung dieses Auftrags.

## Lagerstillleben für die Hauptseite

Am 16. November ergänzt wurde `untote-aale-lager-v1.png`. Das menschenleere
provisorische Waldlager zeigt dunkle Zelte, Kochfeuer, Vorräte und das vorhandene
Untotenbanner. Die genaue Lage des Hauptquartiers bleibt offen.
Die erste Übersichtsseite der Untoten Aale verwendet diese Szene.

Das eingebaute Bildwerkzeug hat die 1024 × 1536 Pixel große PNG erzeugt.
Original und aktive Datei sind bytegleich. Der tatsächliche Prompt sowie beide
angesehenen Referenzen stehen im neuen Manifestjob `untote-aale-lager-v1`.
Die Szene wurde direkt betrachtet.
