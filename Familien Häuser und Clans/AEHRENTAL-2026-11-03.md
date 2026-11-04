# Ährental: Hausseiten, Bios und Darstellungen

Stand: 3. November 2026. Ausschließlich lokal; nicht veröffentlicht.

Die zwölf gelieferten Hausvorlagen sind als einzelne `haus.content.mjs` unter
`Estryll/Cenyr/Aehrental/` ausgearbeitet. Aus jeder redaktionellen Quelle erzeugt
der vorhandene Hausseiten-Builder die Seitendaten und die Stammbaum-Hausbiografie.
Die gemeinsame Laufzeit und die vorhandenen zwölf Familien-IDs bleiben erhalten.

## Umfang und Zuständigkeiten

| Bestehende Familien-ID | Redaktioneller Ordner unter `Aehrental/` | Darstellung |
| --- | --- | --- |
| haus-grawn | Tristams_Ebene/Haus_Grawn | Original |
| haus-marchog | Tristams_Ebene/Haus_Marchog | Original |
| haus-morcanhuc | Tristams_Ebene/Haus_Morcanhuc | Original, beritten |
| haus-baedd | Eberkamm/Haus_Baedd | Original |
| haus-ciarog | Graue_Bucht/Haus_Ciarog | Original |
| haus-sgwarnog | Flusstal/Haus_Sgwarnog | Neuer Feudalritter und Original-Fußknecht |
| haus-gwythiad | Tristams_Ebene/Haus_Gwythiad | Original |
| haus-aroglyn | Tristams_Ebene/Haus_Aroglyn | Neue bürgerliche Hausdarstellung |
| haus-chiffyddlon | Ausgestorben/Haus_Chiffyddlon | Neuer Schwertkämpfer |
| haus-gwarchod | Ausgestorben/Haus_Gwarchod | Neuer Stangenwaffenkämpfer |
| haus-cruithenaech | Antike_Crannath_Clans/Clan_Cruithenaech | Original |
| haus-warthog | Antike_Crannath_Clans/Clan_Warthog | Original |

Gwythiad, Aroglyn und die beiden antiken Clans bleiben knappe vorbereitete Seiten.
Die Vorlagen bieten für sie keine eigene ausführliche Familienchronik. Gründer,
Berufe, Familienmitglieder, Lebensdaten und Hofämter werden nicht erfunden.
Chiffyddlon und Gwarchod behalten ihren bestehenden dynastisch erloschenen Status.
Die antiken Clans bekommen weder einen erfundenen Rang noch einen ungeprüften
erloschenen Status. Weitere neue Hausakten wurden nicht angelegt.

## Quellen und aktueller Kanon

Jeder Hausordner archiviert die Originaldatei unverändert als
`animexx-source-2026-11-03.html`. `source-manifest.json` dokumentiert SHA256,
Anhangskennung, Bildherkunft und redaktionelle Entscheidungen. Die Abschnitte
„Hierarchie“ und „Stammbaum“ der alten HTMLs werden vollständig ignoriert.
Jede Seite bettet ausschließlich die vorhandene Familienakte mit ihrer stabilen
ID und `mode=view` ein. Die genealogischen Graphen bleiben unverändert.

Aktuelle Hausprofile, Registerorte, Ränge und Lehensbindungen haben Vorrang vor
den alten Infotabellen. Diese Tabellen werden nicht kopiert. Oberhaupt-, Erb-
und Hofkarten beziehen ihre Namen und Titel ausschließlich aus bereits
registrierten Personen. Ungeprüfte Amtsfolgen und Lebensalter bleiben außen vor.
Für Chiffyddlon und Gwarchod bleibt der aktuelle Stammsitz leer, obwohl ihr
historischer Hausname O’Glyndraith enthält.

Walerans Rückkehr aus nordmännischer Gefangenschaft und sein späterer Tod bei
einem Auftrag des Blutbundes folgen seinen bereits vorhandenen öffentlichen
Personennotizen. Sie stehen in Gwarchods Chronik und Hausbiografie; die
historische Figurenkarte verlinkt denselben bestehenden Angehörigen. Daraus
entsteht keine neue Amts- oder Erbfolge.

Alle alten Militärstatistiken, Truppen- und Flottenmengen sowie militärischen
Größenvergleiche werden verworfen. Die vier militärischen Profilfelder bleiben
leer; die entsprechende Profilgruppe ist ausgeblendet. Rittertum und Tiarnatum
werden ausschließlich qualitativ beschrieben. Gegenwärtige regionale Wappen
und Banner stammen aus den kanonischen lokalen Hausprofilen.

## Bilder und Verknüpfungen

Neun passende Originaldarstellungen werden unverändert verwendet. Die vier
ergänzten Figuren sind repräsentative Hausdarstellungen und erzeugen keine
neuen Personenakten. Die Einzelheiten zu Prompts und Motiven stehen jeweils in
`image-generation.json`; die Quelldateien und Sichtprüfungen unter
`diagnostics/house-imports-20261103/`.

Sgwarnogs neuer Feudalritter ist das Hauptbild. Der Original-Fußknecht bleibt
als zweite Galerieposition sichtbar. Die auf zwölf Haus-IDs begrenzte
Kriegergalerie-Aktualisierung ergibt dreizehn Bildpositionen. Andere Häuser
werden durch diesen Import nicht neu gesammelt oder ersetzt.

21 vorhandene Hauskarten in den sechs bestehenden Ährental-Gebietsdatenmodulen
öffnen die passende Hausseite unmittelbar. Hierfür wurden ausschließlich
`href`-Felder ergänzt. Gebietsstruktur, Registereinsortierung und Inhalte der
Gebietsseiten bleiben erhalten.

Quellarchive, Quellenmanifeste und Bildgenerierungsprotokolle sind Arbeitsquellen
und werden durch die Veröffentlichungsfilter vom statischen Paket ausgeschlossen.
Aktive Bilder und generierte Hausseitendaten bleiben auslieferbar. Es erfolgten
keine Firebase-Schreibzugriffe und keine Git-Veröffentlichung.

## Lokale Prüfungen

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/aehrental-house-pages.test.mjs"
node Gallerien/krieger/tests/scoped-catalog.test.mjs
node Gallerien/krieger/scripts/build-catalog.mjs --houses=haus-grawn,haus-marchog,haus-morcanhuc,haus-baedd,haus-ciarog,haus-sgwarnog,haus-gwythiad,haus-aroglyn,haus-chiffyddlon,haus-gwarchod,haus-cruithenaech,haus-warthog --check
```

`diagnostics/house-imports-20261103/before-house-pages.json` hält die zwölf
Graph-Prüfsummen vor der Ergänzung fest. Die gezielte Suite prüft die
unveränderten Graphen, kanonischen Metadaten, Bildpfade, iframe-Verträge,
Archivfilter und den Schutz eigener Biografietexte und bewusster Löschungen.
Das einmalige Übernahmeskript verweigert das Überschreiben vorhandener
`haus.content.mjs`; spätere Redaktion erfolgt direkt in den Hausmodulen.

Die abschließende Browserprüfung hat Sgwarnogs tatsächlich geladenen
Stammbaum-iframe mit der bestehenden Familienakte sowie Aroglyns bürgerlichen
und Gwarchods erloschenen Status bestätigt. Auf diesen drei Seiten wurden
keine defekten Bildpfade gefunden. Die neun Hausprüfungen, vier gezielten
Archivfilterprüfungen und beide Generatorabgleiche sind erfolgreich.
Der lokale Abschlussbeleg liegt unter
`diagnostics/house-imports-20261103/verification.json`.
