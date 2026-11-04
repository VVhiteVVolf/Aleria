# Leitheach: Clanseiten, Hausbios und Darstellungen

Der lokale Auftrag vom 3. November 2026 umfasst sämtliche **29 öffentlichen Familienakten Leitheachs**: 26 fortbestehende und drei historische Hausverwaltungen. Die 28 gelieferten Vorlagen werden durch das bereits registrierte Sept Grünhand aus Leith ergänzt. Alle 29 Familien besitzen jetzt eine volle Hausseite, eine redigierte Hausbio und eine passende Darstellung. Im gesicherten Vorherstand waren für diese IDs noch keine Hausseiten, Stammbaum-Hausbios oder Galerieabbildungen registriert.

## Eigenständiges Fürstentum und aktuelle Hierarchie

**Leitheach und Ceitheach sind eigenständige Fürstentümer auf Estryll.** Für diesen Auftrag gelten `Kontinente/modules/leitheach/pages.source.json` und `Karten/Leitheach/territories.import.json`. Die Haupt-ID lautet `fuerstentum-leitheach`; die vorhandene Hauptseite liegt unter `Kontinente/Estryll/Fürstentum Leitheach/Fürstentum Leitheach.html`. Die einzelnen Hausseiten erhalten tatsächliche territoriale Rücklinks bis zur jeweiligen Oberherrschaft, Lehensherrschaft oder Herrschaft. Die geprüften Ziele und Hierarchien stehen in `diagnostics/leitheach-clans-20261103/territory-map.json`.

Die Terminologie folgt dem albischen Kontext: Ard Tiarna, Mor Tiarna, Dún Tiarna, Laird und Sept. Aldrimarische Jarltums- oder Grafschaftsbezeichnungen werden nicht übernommen. Ua’Cleir, Ua’Ghaiscíoch und Dál’Ceardaíocht bleiben unter Gallchobhair in Tir na Coimhthioch eingeordnet. Cleirs Sitz ist Cairn Fàire, Ua’Eirces Senanbail und Uí Fiachrachs Mârbail. Na’Mhuir gehört nach Tir na Fancha mit Sitz Broch an Coill. Somhairle bleibt ein Laird-Clan und die heutige Verwaltung von Broch an Clais; die ältere Baronievorlage begründet keinen höheren Hausrang.

Stabile IDs bleiben erhalten, insbesondere `haus-amrhan` für Ua’Amhran und `haus-dal-t-saor` trotz der Vorlagenschreibweise T’Saoir. Die Leitheacher Nic’Blar verwenden `haus-nic-blar-leitheach`; Ceitheachs Mor-Tiarna-Akte bleibt `haus-nic-blar`. Ebenso ist Leitheachs `haus-cleir` von Blaithneachs `haus-cleirigh` getrennt. Gemeinsame Personenidentitäten, Eheschließungen oder Aufenthalte einzelner Angehöriger erzeugen keine zusätzlichen Ortsakten eines gesamten Hauses. Bestehende öffentliche Gegenakten einschließlich der Cenyr-Verbindungen bleiben geschützt.

## Historische Hausverwaltung und lebende Angehörige

Die drei historischen Fälle behalten ihre belegten Ränge und letzten Sitze:

| Familie | Rang und letzter Sitz | Historische Einordnung |
| --- | --- | --- |
| Mac Suileach | Mor Tiarna, Lochansail | Erloschene frühere Hausverwaltung von Tir na Gortanna; kein neuer heutiger Amtsinhaber. |
| An’Iomrach | Laird, Broch an Clais | Die Herrschaft wurde 1733 vernichtet. Ybhna und Cónán leben auswärts weiter; Cónán wird als Erbe erzogen und ist Oisean Somhairles Mündel. |
| Dal T’Saor | Laird, Sruthlann | Hauptlinie und Burg wurden 1735 vom Unheil aus dem Dunkelhain getroffen. Quona und Junaid überlebten außerhalb der Burg in ihren angeheirateten Häusern. |

Die kanonischen Kennzeichnungen `historicalStatus: extinct`, eigener Hausstatus und `extinctionEvent` werden gemeinsam berücksichtigt. Das Fehlen von `extinctHouse` macht diese Verwaltungen nicht gegenwärtig. Umgekehrt bedeutet das Ende ihrer Herrschaft **keine biologische Vollauslöschung aller Angehörigen**. Die vier ausdrücklich überlieferten Überlebenden behalten ihre vorhandenen IDs, Lebensdaten, Verbindungen und ihren lebenden Status. Historische Hausseiten zeigen keine heutige Amtsbesetzung; Cónáns Erbenrolle wird von einer gegenwärtigen Herrschaftsausübung unterschieden.

Iomrachs geografischer Rücklink führt nach Tir na Soilse, dessen heutige Verwaltung bei Somhairle liegt. Daraus entsteht kein neuer Herrschaftsanspruch. Die vorhandene Dal-T’Saor-Ortsseite enthält noch eine ältere Herrscherbeschriftung; für die Hausdarstellung haben der historische Familienstatus und das Ereignis von 1735 Vorrang.

Sept Grünhand bleibt eine bürgerliche Familie im Rang `sept-head`, dem Clan Na’Mhuir und dessen Laird in Broch an Coill verbunden. Seine Stellung wird weder zum Laird erhoben noch aus dem Hausnamen eine neue Berufstradition abgeleitet. Die bestehenden Identitäten Peregráins, Liorains und Rubybhnas sowie ihre Verbindungen zu Na’Mhuir und Albholz bleiben erhalten.

## Bilder und redaktionelle Quellen

Die 28 Vorlagen enthalten **26 Originaldarstellungen**. Sie sind lokal und bytegleich übernommen, einschließlich berittener, sitzender und mehrfiguriger Motive. Ihr vorhandener Stil bleibt erhalten. Die drei echten Bildlücken **Mac Suileach, Dal T’Saor und Sept Grünhand** sind durch anonyme Hausdarstellungen im freigegebenen Figurenstil ergänzt, passend zu belegter Kultur, Rang, Wappen und Hintergrund. Eine Hausfigur begründet keine neue Personenidentität oder Hausgeschichte.

Nach der ausdrücklichen Nutzerkorrektur besitzen die drei neuen Figuren **normale runde menschliche Ohren**. Die gezielt mit dem eingebauten Imagegen-Werkzeug bearbeiteten Dateien heißen jeweils `krieger-human-ears-v2.png`; Hausquellen, Bios und Galerie verwenden diese Revision. Alle drei PNGs sind 1024 × 1536 Pixel groß, besitzen echte Transparenz und bleiben bytegleich zu den jeweiligen Toolausgaben. Die Ohrenkorrektur und die helle Kontaktübersicht wurden tatsächlich angesehen. Die 26 gelieferten Originale wurden dabei nicht verändert. Die laufenden Bildbelege stehen in `generated-images.json`, die exakten Bearbeitungsprompts und Referenzen in `ear-correction-prompts.json`; Erstgenerierung und frühere Prüfung bleiben unter `image-prompts.json`, `superseded-generated-images.json` und `image-verification-v1-superseded.json` dokumentiert. Die gelöschten v1-Workspacekopien bleiben anhand der erhaltenen `C:`-Tooloriginale und des Manifests nachvollziehbar. Der frühere `E:`-Pfad im Feld `editTarget` bezeichnet die Provenienz des Bearbeitungsauftrags und ist kein aktives Asset.

Aktuelle Profile, Orte, Titel und bestehende Personenakten haben Vorrang vor alten Infotabellen. Einmalige belegte Historie wird redigiert erhalten; echte Textlücken bleiben knapp und offen. Gründer, heutige Amtsinhaber und Erben werden anhand vorhandener Identitäten und Amtsbelege ausgewählt. Beispielsweise bleibt Seamair Fiachrach der kanonische Gründer; Séamus steht in der heutigen Fiachrach-Erbfolge vor Ultach. Amtszeiten werden nicht zu Lebensdaten umgedeutet.

**Gelieferte Stammbaumabschnitte und Militärstatistiken bleiben vollständig ausgeschlossen.** Hausseiten betten ausschließlich die vorhandene kanonische Familienakte per Iframe ein. Es werden keine alten Graphen importiert und keine genealogischen Verbindungen ergänzt. Personenlinks und Portraits verweisen auf vorhandene, eindeutig zugeordnete Identitäten. Private Dossiers und geheime Inhalte sind keine Quellen dieses Auftrags.

## Arbeitsquellen, begrenzter Builder und Prüfung

Die gemeinsamen Hausquellen liegen unter `Estryll/Leitheach/`; `haus.content.mjs` liefert Hausseite und Hausbio über die vorhandenen Ausgabeadapter. Die ursprünglichen Graphen, Personen, Profile, historischen Metadaten, Ränge, Titel, Wappen, IDs und Ortszuordnungen sind unverändert. Bereits gespeicherte eigene Hausbios und bewusst entfernte Bios bleiben bei Standardaktualisierungen geschützt.

Die Erstübernahme erfolgt durch `diagnostics/leitheach-clans-20261103/create-house-content.mjs`. Dieser Builder ist auf die 29 kanonischen IDs und neue Hausordner unter `Estryll/Leitheach/` begrenzt. Er prüft den gesamten Bestand einschließlich geschützter Baseline, Quellen- und Bildhashes, territorialer Ziele und kuratierter Personen vor dem ersten Schreiben; vorhandene Ausgabedateien werden nicht überschrieben. Er ist eine erhaltene Importmethode und kein Routinebefehl zum Überschreiben redigierter Hausquellen. Der gemeinsame Leitheach-Adapter verwendet die tatsächliche Fürstentumshierarchie und trennt historische Verwaltung von lebenden Angehörigen.

Weitere Pflege geschieht in der jeweiligen `haus.content.mjs`. Hausseiten- und Galerieausgaben werden mit der ausdrücklich ausgewählten ID-Liste aus `created-house-sources.json` begrenzt erzeugt beziehungsweise geprüft. Die Inhaltsversion bleibt `20261103-leitheach-v1`; die Ohrenkorrektur besitzt unabhängig davon neue Bilddateinamen in Revision v2.

Die Belege liegen unter `diagnostics/leitheach-clans-20261103/`: `baseline.json`, `registry-audit.json`, `attachments.json`, `attachment-mapping.json`, `territory-map.json`, `related-register-guards.json`, `original-images.json`, `original-images-verification.json` und `missing-originals.json`. Die Baseline enthält historische Kennzeichnungen als gesonderte Metadaten, ohne die geschützten Graphen, Profile oder Biografien zu verändern. Die Originalbildübersicht wurde angesehen; alle 26 Originalhashes wurden unabhängig geprüft.

**Automatisierte Prüfung: bestanden.** Der Gesamtlauf mit 115 Node-Tests und die vier Wartungstests sind grün. Nach der Ohrenkorrektur wurden die 31 betroffenen Prüfungen erneut bestanden: zehn Leitheach-, neun Galerie- und zwölf Tests für den begrenzten Katalogaufbau. Auch beide Aktualitätsprüfungen der ausdrücklich auf 29 IDs begrenzten Hausseiten- und Galerieausgaben sowie die auftragsbezogene Whitespace-Prüfung sind bestanden. Der Gesamtbeleg liegt in `test-results.json`.

Die zehn gezielten Prüfungen in `tests/leitheach-house-pages.test.mjs` und die öffentliche Fixture `tests/fixtures/leitheach-initial-review.json` schützen alle 29 Familien, drei historische Hausverwaltungen mit vier sichtbaren Überlebenden, 26 heutige Oberhäupter, 26 kanonische Gründerkarten und 18 belegte Erbfolgen. Sie prüfen außerdem tatsächliche Territorialziele, Bilder, Iframes, 28 unveränderte Quellenarchive und sieben unveränderte öffentliche Gegenakten. Der unabhängige `final-audit.json` steht auf PASS und enthält eine gesonderte Nachprüfung der drei aktiven v2-Bildpfade, Hashes und Galerieverknüpfungen. Die Fixture schreibt für diese Ergänzungen keinen alten v1-Dateinamen fest.

**Browserstatus: `limited`.** Die CUA-Verbindung scheitert trotz dokumentierter Wiederverbindungs- und Resetversuche bereits vor der Navigation mit einem `timeoutMs`-TypeError. Deshalb wird keine erfolgreiche UI- oder Iframe-Browserprüfung behauptet. Die lokale HTTP-Vorschau ist über HEAD mit Status 200 erreichbar. Der gesonderte Beleg liegt in `browser-verification.json`.

## Belegte Bereinigung

Die Bereinigung folgt `netlify/docs/TEMPORARY_STORAGE.md`. Die Prüfung der zwölf freigegebenen älteren Builds ergab **null geeignete Dateien**; aus diesem Plan wurden null Dateien und null Byte entfernt. Der Abschluss ist in `cleanup-review.json` und `cleanup-plan.result.json` belegt. Alle vier Wartungstests sind bestanden.

Separat wurden die **drei überholten PNG-Workspacekopien der Bildrevision v1 mit insgesamt 6.454.730 Byte** entfernt, nachdem ihre v2-Ersatzdateien und aktiven Verknüpfungen geprüft waren. Die ursprünglichen Imagegen-Ausgaben bleiben erhalten und sind in `superseded-image-cleanup-result.json` nachgewiesen. Quellenarchive, 26 Originaldarstellungen, Prompts, Methoden und Diagnosebelege bleiben erhalten. Es erfolgte keine pauschale Bereinigung von `.tmp` oder Diagnoseordnern.

Die Umsetzung bleibt lokal. Commit, Push und Deploy sind kein Bestandteil dieses Auftrags.

## Nachtrag: autorisierte Lorekorrekturen vom 4. November 2026

Die Aussagen und Prüfstände oben dokumentieren die Erstübernahme vom 3. November. Der spätere öffentliche Loreabgleich korrigiert gezielt die benannten Chronologien mit Vorrang der jüngsten belegten Kinderjahre. Wunbhna und Maolmhuire leben ausdrücklich; Dál T’Saors Verwaltung bleibt seit 1735 erloschen, während die belegten auswärtigen Überlebenden erhalten bleiben. Die frühere Herrscherbeschriftung der Territorialseite wurde entsprechend historisch eingeordnet. IDs, Beziehungen, Ränge und Ortsstruktur bleiben erhalten.

Der gemeinsame Korrekturstand für Leitheach, Cenyr und Aldrimar umfasst 71 gezielte Felder in 28 verwalteten Familienakten und 30 Hausquellen bei 15 geschützten Kinderankern. Die [Leitheach-Änderungen](../../diagnostics/house-lore-fixes-20261104/leitheach-changes.json) und das [gemeinsame Quellinventar](../../Stammbäume/assets/data/source-inventories/house-lore-corrections-20261104.json) halten Vorher-/Nachherwerte und Entscheidungen fest. Die ursprünglichen Importfixtures und Diagnosebaselines bleiben unverändert; eine separate Korrekturfixture ergänzt nur ausdrücklich freigegebene Erwartungen. Die [übrigen 20 Gegenaktenabweichungen](../../diagnostics/house-lore-fixes-20261104/remaining-twenty-counterparts.json) werden zunächst ausschließlich aufgelistet.

Der Abschlussstand ist mit 250 bestandenen Tests (144 + 106) geprüft; Sonnenküste bestand abschließend 11/11 nach dem Fingerprint-Nachtrag. Die Browser-Sichtprüfung bleibt durch den CUA-`timeoutMs`-Fehler eingeschränkt, ohne behaupteten Browser-Pass. Auch diese Korrekturen bleiben lokal, ohne Push oder Deploy.
