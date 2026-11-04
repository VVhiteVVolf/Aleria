# Leitheach-Clanübernahme vom 3. November 2026

Dieser Diagnosebestand belegt die lokale Übernahme aller **29 öffentlichen Leitheach-Familien** mit voller Hausseite, Hausbio und Darstellung. Er umfasst 26 fortbestehende und drei historische Hausverwaltungen. Leitheach ist ein eigenständiges Fürstentum auf Estryll; Ceitheach ist kein Alias. Die ausführliche Arbeitsdokumentation steht in [LEITHEACH_CLAN_IMPORT.md](../../Familien%20H%C3%A4user%20und%20Clans/docs/LEITHEACH_CLAN_IMPORT.md).

## Stand und Prüfgrenzen

Der Gesamtlauf mit **115 Node-Tests** und die **vier Wartungstests** sind bestanden. Nach Bildrevision v2 sind zusätzlich die 31 betroffenen Prüfungen erneut grün: zehn Leitheach-, neun Galerie- und zwölf Katalogtests. Beide auf die 29 IDs begrenzten Generatorprüfungen und die auftragsbezogene Whitespace-Prüfung sind ebenfalls bestanden. [test-results.json](test-results.json) enthält den Gesamtbeleg; die unabhängige Daten- und Bildprüfung ist in [final-audit.json](final-audit.json) auf PASS dokumentiert.

Der **Browserstatus bleibt `limited`**: Ein CUA-Verbindungsfehler mit `timeoutMs`-TypeError verhindert die Navigation trotz Wiederverbindungs- und Resetversuchen. Es gibt keine behauptete erfolgreiche UI- oder geladene Iframe-Browserprüfung. Die lokale HTTP-Vorschau antwortet auf HEAD mit Status 200; [browser-verification.json](browser-verification.json) enthält den gesonderten Beleg.

## Quellen und kanonischer Schutz

| Beleg | Inhalt |
| --- | --- |
| [baseline.json](baseline.json) | Vollständige öffentliche Vorhergraphen und Profile der 29 Familien; historische Kennzeichnungen als eigene Metadaten. |
| [registry-audit.json](registry-audit.json) | Öffentliche Allowlist, Ränge, Sitze, Lehnsherren, kanonische Personenbelege und anfänglicher Abdeckungsstand. |
| [attachments.json](attachments.json), [attachment-mapping.json](attachment-mapping.json) | Zuordnung der 28 Vorlagen anhand ihrer sichtbaren Überschriften, stabile Familien-IDs und Quellhashes. |
| [sources/](sources/) | Unveränderte gelieferte HTML-Originale; genealogische Abschnitte sind Archivmaterial und werden nicht importiert. |
| [source-content.json](source-content.json), [source-review-decisions.json](source-review-decisions.json) | Erfasste Erzählabschnitte, redigierte Inhalte und begründete Quellentscheidungen. |
| [biography-summaries.json](biography-summaries.json), [biography-review.json](biography-review.json) | Gemeinsame redaktionelle Hausbios und ihre Prüfung. |
| [territory-map.json](territory-map.json) | 29 geprüfte Ziele und tatsächliche Fürstentum-, Oberherrschafts-, Lehensherrschafts- und Herrschaftshierarchien. |
| [related-register-guards.json](related-register-guards.json) | Schutz von sieben öffentlichen Gegenakten in Ceitheach, Blaithneach und Cenyr. |

Die historischen Hausverwaltungen sind Suileach als Mor Tiarna in Lochansail, Iomrach als Laird in Broch an Clais und Dal T’Saor als Laird in Sruthlann. Ybhna und Cónán Iomrach sowie Quona und Junaid T’Saoir leben auswärts weiter. Historischer Verwaltungsstatus bedeutet keine biologische Vollauslöschung. Sept Grünhand bleibt bürgerlich und an Na’Mhuir in Broch an Coill gebunden.

Stabile IDs bleiben insbesondere `haus-amrhan`, `haus-dal-t-saor` und `haus-nic-blar-leitheach`. Letztere Akte bleibt von Ceitheachs `haus-nic-blar` getrennt, Ua’Cleir von Blaithneachs Cléirigh. Gelieferte Stammbäume und Militärstatistiken werden nicht übernommen; Hausseiten betten die bestehenden kanonischen Familienakten ein. Graphen, Profile, Historienmetadaten und die geschützten Gegenakten bleiben unverändert.

## Bildbelege und aktive Revision

Die **26 gelieferten Originaldarstellungen** sind unverändert eingebunden. Nur Suileach, Dal T’Saor und Sept Grünhand erhalten neue anonyme Figuren. Nach der Nutzerkorrektur besitzen alle drei normale runde menschliche Ohren; aktiv sind die Dateien `krieger-human-ears-v2.png`. Seite, Bio und Galerie verwenden die neuen Pfade.

- [original-images.json](original-images.json), [original-images-verification.json](original-images-verification.json): Originalquellen, lokale Pfade, Maße und SHA-256.
- [generated-images.json](generated-images.json): aktive drei v2-Bilder mit Toolquelle und aktuellem Hash.
- [image-prompts.json](image-prompts.json), [ear-correction-prompts.json](ear-correction-prompts.json): genaue Erst- und Bearbeitungsprompts samt tatsächlichen Stil- und Motivreferenzen.
- [superseded-generated-images.json](superseded-generated-images.json), [image-verification-v1-superseded.json](image-verification-v1-superseded.json): erhaltene Methoden- und Versionsbelege der Erstgenerierung.
- [image-verification.json](image-verification.json), [all-clan-figures.jpg](all-clan-figures.jpg), [generated-clan-figures-light.jpg](generated-clan-figures-light.jpg): technische und tatsächlich angesehene Bildprüfungen.

Die entfernten v1-Workspacekopien bleiben über ihre erhaltenen `C:`-Tooloriginale und [superseded-generated-images.json](superseded-generated-images.json) nachvollziehbar. Das Feld `originalGenerationSource` führt zur früheren Toolausgabe. Der frühere `E:`-Workspacepfad unter `editTarget` ist Provenienz des Bearbeitungsauftrags und kein aktives Asset; aktuelle Verknüpfungen richten sich nach `assetPath` in [generated-images.json](generated-images.json). Die finalen Bearbeitungsprompts stehen in [ear-correction-prompts.json](ear-correction-prompts.json).

## Begrenzte Erzeugung und weitere Pflege

[create-house-content.mjs](create-house-content.mjs) ist die erhaltene Methode der Erstübernahme. Sie ist auf die 29 kanonischen IDs und neue Ordner unter `Familien Häuser und Clans/Estryll/Leitheach/` begrenzt, prüft den Gesamtbestand vor dem Schreiben und verweigert das Überschreiben vorhandener Dateien. [created-house-sources.json](created-house-sources.json) dokumentiert die tatsächlichen fachlichen Quellordner. Künftige redaktionelle Pflege erfolgt dort in `haus.content.mjs`; der Erstimport wird nicht zum Ersetzen dieser Arbeitsquellen erneut ausgeführt.

Die nachgelagerten Standardgeneratoren werden mit der ausdrücklich ausgewählten Hausliste begrenzt geprüft, beispielsweise aus dem Projektstamm:

```powershell
$leitheachIds = ((Get-Content 'diagnostics/leitheach-clans-20261103/created-house-sources.json' -Raw | ConvertFrom-Json).id -join ',')
node 'Familien Häuser und Clans/scripts/build-house-content.mjs' "--houses=$leitheachIds" --check
node 'Gallerien/krieger/scripts/build-catalog.mjs' "--houses=$leitheachIds" --check
```

## Bereinigungsbelege

Die Prüfung der zwölf freigegebenen älteren Builds ergab **null geeignete Dateien**, folglich null entfernte Dateien und null Byte aus diesem Plan. [cleanup-review.json](cleanup-review.json) und [cleanup-plan.result.json](cleanup-plan.result.json) enthalten den Abschluss; die vier Wartungstests sind bestanden.

Separat wurden drei überholte v1-PNG-Workspacekopien mit zusammen **6.454.730 Byte** entfernt. [superseded-image-cleanup-plan.json](superseded-image-cleanup-plan.json) und [superseded-image-cleanup-result.json](superseded-image-cleanup-result.json) belegen Ersatzpfade, Hashes und erhaltene Tooloriginale. Quellen, Originalbilder, Prompts und Methoden bleiben erhalten. Dieser Diagnosebestand ist keine pauschal löschbare Temporärablage.

Die Umsetzung bleibt lokal; kein Commit, Push oder Deploy gehört zu diesem Auftrag. Quellen und Diagnosen gehören nicht in das statische Auslieferungspaket.
