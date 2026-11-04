# Graue Weite: Hausseiten, Biografien und Originaldarstellungen

Stand: 3. November 2026. Ausschließlich lokal, nicht veröffentlicht.

15 vorhandene Familienakten erhalten eigene redaktionelle `haus.content.mjs`
unter `Estryll/Cenyr/Graue_Weite/`. Seitendaten, Hausbiografien und die drei
gemeinsamen Register werden aus diesen Quellen erzeugt. Alle 15 gelieferten
passenden Hauptfiguren bleiben unverändert; es wurde kein neues Bild erzeugt.

## Umfang und stabile IDs

| Familien-ID | Ordner unter `Graue_Weite/` |
| --- | --- |
| haus-pysgod | Schimmerkueste/Haus_Pysgod |
| haus-blaidd-tredegar | Schimmerkueste/Haus_Blaidd |
| haus-brithyll | Schimmerkueste/Haus_Brithyll |
| haus-gwialen | Schimmerkueste/Haus_Gwialen |
| haus-illygoden-tredegar | Schimmerkueste/Haus_Illygoden |
| haus-gwaedlyd-tredegar | Schimmerkueste/Haus_Gwaedlyd |
| haus-coedwig | Achatsee/Haus_Coedwig |
| haus-draenog | Silberwald/Haus_Draenog |
| haus-wivern | Eichenlicht/Haus_Wivern |
| haus-morfil | Graukueste/Haus_Morfil |
| haus-lyfant-caer-asgwrn | Silberwald/Skelettkueste/Haus_Lyfant |
| haus-dornach | Antike_Crannath_Clans/Clan_Dornach |
| haus-brathaireann | Antike_Crannath_Clans/Clan_Brathaireann |
| haus-tonnmharra | Antike_Crannath_Clans/Clan_Tonnmharra |
| haus-tanwyn | Ausgestorbene_Haeuser/Haus_Tanwyn |

Die drei antiken Clans bleiben knappe vorbereitete kleine Seiten ohne erfundene
Chronik oder benannte Gründer. Tanwyn erhält die belegte Magiergeschichte,
behält aber unbekannten Rang, leeren aktuellen Sitz und erloschenen Status.

## Quellenpriorität und Rollen

Originalanhänge sind bytegenau als `animexx-source-2026-11-03.html` archiviert.
`source-manifest.json` enthält Anhangskennung, SHA256, Bildherkunft und
Entscheidungen. Genealogische Abschnitte werden unabhängig von ihrer alten
Überschrift ausgelassen: „Hierarchie“, „Hierachie“, „Familie“, „Stammbaum“, Hof-,
Erb- und Kadettentabellen erzeugen keine neuen Personen oder Beziehungen.
Jede Seite bettet die bestehende Familienakte mit stabiler ID und `mode=view` ein.

Aktuelle Ränge, Sitze und Lehensbindungen gehen den alten Infotabellen vor.
Pysgod bleibt Grafenhaus von Tredegar; Coedwig sitzt in Llanfyn am Achatsee.
Lyfant behält die vollständige örtliche Hierarchie
Silberwald/Skelettküste/Caer Asgwrn und den Lehnsherrn Pysgod.

Die vier Vennyr-Originakten `haus-blaidd`, `haus-illygoden`, `haus-gwaedlyd` und
`haus-lyfant` bleiben eigenständig und unverändert. Nur ihre bereits bestehenden
südlichen Nachfolgeakten werden ergänzt. Pelleas ist Gründer der südlichen
Blaidd-Linie; Cadwgawn ist Vater der Tredegar-Gründer und wird nicht zum
Südgründer gemacht. Cledwyn führt Caer Asgwrn, Cadwgan bleibt Seitenzweig.
Draenogs historischer Gründer Mathonwy und der heutige gleichnamige Erbe bleiben
getrennt; Deiniol ist das aktuelle Oberhaupt.

Militärmengen, Flottenstatistiken und militärische Größenvergleiche werden
vollständig verworfen. Die vier Militärprofilfelder bleiben leer, ihre Gruppe
verborgen. Rittertum und Tiarnatum werden qualitativ beschrieben. Kulturelle
Gottheitsnamen folgen den aktuellen Religionen-Dateien; Nimues Epithet steht
nach der Primärquelle als „Dame des Sees“ im Text.

## Bilder und Verknüpfungen

Alle 15 Originalfiguren sind anhand ihrer SHA256 geprüft und vom Hauptagenten
tatsächlich angesehen worden. Auch Wivern am Baum und Lyfant mit seiner
ursprünglichen Bodenfläche bleiben unverändert. Brithylls Flossenmotiv befindet
sich an den Schulterteilen. Die drei alten Draenog-Wappenvarianten bleiben
Diagnosequellen und ersetzen weder das kanonische Wappen noch Itembilder.

27 bestehende Hauskarten in elf Gebietsdatenmodulen öffnen direkt die passende
Hausseite; dafür wurden ausschließlich `href`-Felder ergänzt. Die Galerie wurde
gezielt auf diese 15 Haus-IDs begrenzt aktualisiert. 869 andere Hausdatensätze
und alle 1.046 vorherigen Bilddatensätze bleiben inhaltlich unverändert.

Originalquellen und Redaktionsmanifeste bleiben Arbeitsquellen außerhalb des
statischen Pakets. Aktive Bilder und generierte Seitendaten bleiben auslieferbar.
Es erfolgten keine Git-, Deploy- oder Firebase-Schreibzugriffe.

## Begrenzter Hausseiten-Build

`scripts/build-house-content.mjs` unterstützt jetzt `--houses=haus-id,...`.
Nur die ausgewählten Seiten und Biografien sowie deren Einträge in den drei
gemeinsamen Registern werden aktualisiert. Fremde gespeicherte Einträge werden
nicht aus parallel bearbeiteten Autorenmodulen erneuert. Neue Einträge werden
nach der kanonischen Quellenreihenfolge eingefügt; fremde Reihenfolgen und
Kommentare bleiben erhalten. Ohne Auswahl bleibt der bisherige Vollbuild bestehen.

Unbekannte Argumente, Tippfehler, leere oder doppelte Auswahl, fehlende Quellen
und mehrdeutige Register werden vor dem ersten Schreiben abgewiesen. `--check`
schreibt keine Dateien. Die Regressionen stehen in
`tests/house-content-scope.test.mjs`.

Der unmittelbare Vorher-/Nachhervergleich bestätigt 846 fremde generierte Dateien,
416 fremde Seitenregistereinträge, 424 Ränge und 422 Biografievorgaben unverändert.
Die parallele Sonnenküsten-Autorierung wird nicht regeneriert. `scope-preservation.json`
und `gallery-preservation.json` unter `diagnostics/house-imports-batch3-20261103/`
halten diese Nachweise fest.

```powershell
$graueWeiteHouses = 'haus-pysgod,haus-blaidd-tredegar,haus-brithyll,haus-gwialen,haus-illygoden-tredegar,haus-gwaedlyd-tredegar,haus-coedwig,haus-draenog,haus-wivern,haus-morfil,haus-lyfant-caer-asgwrn,haus-dornach,haus-brathaireann,haus-tonnmharra,haus-tanwyn'
node "Familien Häuser und Clans/scripts/build-house-content.mjs" "--houses=$graueWeiteHouses" --check
node "Familien Häuser und Clans/tests/graue-weite-house-pages.test.mjs"
node "Familien Häuser und Clans/tests/house-content-scope.test.mjs"
node Kontinente/tests/graue-weite.test.mjs
node Gallerien/krieger/tests/scoped-catalog.test.mjs
node Gallerien/krieger/scripts/build-catalog.mjs "--houses=$graueWeiteHouses" --check
```

Die abschließende Browserprüfung bestätigt Pysgod, die südliche Blaidd-Akte,
Tanwyn, Dornach und Wivern sowie Wylan als unveränderte Kontrollseite. Alle sechs
Seiten laden ohne defekte Bildpfade. Pysgods iframe zeigt die bestehende Akte
mit 105 Personen; die Hausbiografie öffnet mit Originalbild und korrektem
Rücklink. Die kombinierten Hausprüfungen für Ährental, Weidebucht und Graue Weite
sowie die neue Buildbegrenzung bestehen zusammen mit 35 Prüfgruppen. Der
abschließende begrenzte Hausgenerator-Check ist erfolgreich. Die lokalen
Prüfbelege liegen unter `diagnostics/house-imports-batch3-20261103/verification.json`.
