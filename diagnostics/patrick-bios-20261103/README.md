# Geprüfte Biografien und Haus Hamnett vom 3. November 2026

Abgeschlossen und veröffentlicht: Commit
`8927ed6daec7b59dc6212ac6405e18816acd3f4c`, Netlify-Deploy
`6aea3a7208d879f2f4ecb435`. Alle 34.607 ausgelieferten Dateien und sechs
Functions sind verifiziert. Der [Abschlussbeleg](completion.json) dokumentiert
auch die Bereinigung der markierten Releasepakete und den erhaltenen Quellstand.

Die 36 benötigten Bilddateien werden von der bestehenden Website ausgeliefert.
Alle Originalbytes sind geprüft; 66 Bildverweise wurden in sieben bestehenden
Akten gezielt umgestellt und sämtliche übrigen Rohdaten exakt erhalten.
Die neuen Icons, Wappenvarianten und die Hausfigur entstanden mit der
integrierten Bildgenerierung. Bereits gelieferte Porträts wurden unverändert
übernommen; die Bildmanifeste weiter unten enthalten die Prompts und Quellen.

Die folgenden Abschnitte dokumentieren die einzelnen Prüfschritte vor diesem
Abschluss. Der vollständige lokale Autorenstand und seine privaten Sicherungen
bleiben erhalten; der veröffentlichte Quellstand liegt in der gesonderten,
sauberen öffentlichen Arbeitskopie. Näheres steht im [Arbeitsstand](WORKING-STATE.md).

Die gelieferten Biografien von Cadogan Sgrechiwr, Rhiannon (geb. Draenmelyn)
Swyll und Gwen Hamnett sind in einer gemeinsamen öffentlichen Quelle
zusammengeführt. Verfasserprosa bleibt erhalten; nur belegte Tabellenfehler,
fehlende Icons und Bildverweise wurden gezielt berichtigt. Rhiannon Swyll
bleibt von Prinzessin Rhiannon Draig getrennt.

Gwen verwendet weiterhin die vorhandene Weltpersonen-ID
`person--family-tree--unknown-cadogan-spouse`. Ihre Ehe mit Cadogan und die
Töchter Eluned und Meinwen bleiben erhalten. Haus Hamnett ist als bürgerliches
Haus auf der Silberinsel eingegliedert; Gwens heutiger Wohnort bleibt
Gwynthor. Unbelegte Eltern, Gründer, Sitze und Lehnsherren wurden nicht ergänzt.
Hausbio, Hausseite, Galerie und Stammbaum nutzen das zuletzt ausgewählte
Hammer-und-Meißel-Wappen und dieselbe passende Bürgerdarstellung.

Alle 34 Persönlichkeitskarten haben Icons: fünf vorhandene Motive wurden
wiederverwendet, 23 neue Comicmotive ergänzt. Gelieferte Personen- und
Tierporträts wurden unverändert erhalten und zusätzlich unter unveränderlichen
Bildadressen gespiegelt. Auch der gemeinsame Kreaturenkatalog nutzt diese
Originale. Prompts und Bildbelege stehen in
[`Biografien-Bildmanifest`](../../AleriaAlmanach/docs/art/patrick-biographies-20261103/manifest.json)
und [`Hamnett-Bildmanifest`](../../AleriaAlmanach/docs/art/hamnett-20261103/manifest.json).

## Gespeicherter und nachgeprüfter Datenstand

Der geprüfte Plan
`7b02856c20c23d9606f0bf8a4b257bfd74769dcbfef6e36788da5ba93f446162`
wurde am 3. November 2026 um `17:26:06.547268Z` atomar gespeichert:
zwei bestehende Charakterakte wurden gezielt aktualisiert, Gwen und vier
belegte Tierakten neu angelegt. Die Zuordnungen sind Silberstolz zu Cadogan,
Perle zu Rhiannon sowie Sir Balthasar und Sonnenaufgang zu Gwen. Jede Tierakte
verweist auf ihr vorhandenes Bestiariumprofil.

Die anschließende rein lesende Wiederholungsprüfung bestätigte alle sieben
Dokumente, ihren gemeinsamen Commit-Zeitpunkt und drei Kampfsperren.
Firestore stellt leere REST-Arrays/-Maps teilweise ohne leere Unterfelder dar;
die Prüfung berücksichtigt ausschließlich diese gleichwertige Darstellung.
Andere Datentypen und unbeteiligte Hauptfelder wurden exakt verglichen. Der
ursprüngliche Sieben-Dokumente-Plan wurde nicht erneut angewandt.
`externalWrites: 0` im Prüfbeleg bezieht
sich auf diese reine Nachprüfung, nicht auf den vorausgegangenen Commit.
Der öffentliche, inhaltlich begrenzte Beleg ist
[`publication-verification.json`](publication-verification.json).
Private Original- und Bestätigungssicherungen bleiben außerhalb der
öffentlichen Quellen und werden nicht in diesen Bericht kopiert.

Der begrenzte Charakterdatenbankabgleich verarbeitet genau diese drei
bestätigten Personen: eine neue Gwen-Akte, drei geprüfte Projektionen,
263 unveränderte unbeteiligte Charaktere. Die öffentlichen Replayquellen
enthalten Metadaten und vier additive Begleiterbindungen. Sie enthalten keine
vollständigen Inventare, privaten Besitzerkennungen oder Kampfschnappschüsse.
Es gab null kanonische Kampfschreibzugriffe und null vollständige
Inventarimporte. Der erneute `--check` bestätigt null veraltete Ausgaben.

## Getrennter Nachtrag zur Profilkurzfassung

Die Browserprüfung zeigte noch Rhiannons frühere Dienstbotenrolle in den
separaten flachen Profilfeldern, obwohl Titel und vollständige Biografie
bereits ihr heutiges Amt nannten. Ein eigener geprüfter Nachtragsplan
`267d5332b331a0b468b2c5d84b808c769fa0c5da960ff83ebe524f8009c73f4a`
berichtigt ausschließlich Rhiannons `role`, `bio` und das Änderungsdatum
`updatedAt`. Die Rolle stammt aus dem belegten Amtstitel; die Kurzfassung
ist wortgetreu der erste Absatz ihrer gelieferten vollständigen Biografie.
Andere Personen erhalten keine neuen Kurztexte durch diese Ergänzung.

Der Nachtrag wurde um `18:19:10.948674Z` mit einem gezielten Update und
sechs atomaren Versionsprüfungen gespeichert. Nach verschlüsselter
Originalsicherung wurden alle sieben Akten erneut gelesen: sämtliche
unbeteiligten REST-Felder und die sechs übrigen Akten blieben exakt erhalten.
Es gab keine Inventar- oder Kampfschreibzugriffe. Der ursprüngliche
Sieben-Dokumente-Plan wurde nicht erneut angewandt, sein privater
Bestätigungsbeleg blieb unverändert erhalten. Der gesonderte öffentliche
Nachweis ist
[`metadata-followup-verification.json`](metadata-followup-verification.json).

Ein neuer, getrennt gespeicherter privater Bestätigungsbeleg wurde aus den
tatsächlich nachgelesenen drei Personen und vier Tieren erstellt. Der erneute
begrenzte lokale Archivabgleich änderte genau neun Ausgaben für dieselben
drei Personen, ohne neue Charakterakte. Alle 263 unbeteiligten Charaktere
blieben erhalten; null vollständige Inventarimporte und null kanonische
Kampfschreibzugriffe. Ein anschließender `--check` meldet null Änderungen.
31 betroffene Tests sowie die Prüfungen der gemeinsamen Quelle und der
öffentlichen Biografiebrücke sind erfolgreich.

## Weitere Identitäten und Abschlussprüfung

Vier bestätigte Altakten von Gethin, Gwendolyn und Dehlia wurden reversibel
archiviert; die drei Hauptakten bleiben unverändert. Gleichnamige andere
Personen bleiben getrennt. Der widersprüchliche Meurig/Odyar-Altbestand ist
weiterhin ungeklärt und wurde nicht automatisch zusammengeführt. Der
[`Identitätsbericht`](../character-identity-review-20261103/README.md)
erläutert die Abgrenzung.

Die unabhängige gezielte Datenprüfung umfasst 41 erfolgreiche Tests,
34 Karten ohne fehlendes Icon sowie die exakten Hashes des aktiven Wappens
und der Hausfigur. Ihr Beleg steht in
[`final-data-audit.json`](final-data-audit.json). Weitere Publikations- und
Releaseprüfungen sind Bestandteil des gemeinsamen Releasewegs.
Push und Netlify-Deploy folgen nach der öffentlichen Paketprüfung; dieser
Bericht behauptet noch keinen abgeschlossenen Frontend-Deploy.
