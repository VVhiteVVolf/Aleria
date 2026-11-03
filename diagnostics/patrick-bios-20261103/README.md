# Geprüfte Biografien und Haus Hamnett vom 3. November 2026

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

Die historischen Angaben zu 263 unbeteiligten Charakteren beziehen sich auf
den damaligen vollständigen Autorenbestand. Die aktuelle geprüfte öffentliche
Charakterdatenbank umfasst 262 Figuren einschließlich Rob: drei ausgewählte
Akten und 259 übrige öffentliche Akten.

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

## Veröffentlichte Fassung und statische Bildadressen

Die erste öffentliche Fassung wurde mit Commit `8900e2227` gepusht und als
Netlify-Deploy `6aea33ac4a7ef410707151b4` veröffentlicht. Die abschließende
Prüfung bestätigte am 3. November 2026 um `19:24:58Z` alle 34.607 Dateien
und sechs Functions.

Der getrennte Nachtrag für unveränderliche statische Bildadressen wurde um
`19:31:38.284290Z` erfolgreich gespeichert: 66 URL-Felder in sieben
Dokumenten, mit drei Kampfsperren. 36 HTTP-Abfragen bestätigten Status 200
und die erwarteten SHA-256-Hashes. Der geprüfte Plan steht in
[`static-assets-plan-review.json`](static-assets-plan-review.json), die
anschließende Verifikation in
[`static-assets-publication-verification.json`](static-assets-publication-verification.json).

Die URL-Projektion betrifft dieselben drei ausgewählten öffentlichen Akten;
die 259 übrigen öffentlichen Akten sowie sämtliche unbeteiligten Rohfelder
blieben exakt erhalten. Dieser Nachtrag legte keine neuen Figuren an und
verursachte null kanonische Kampfschreibzugriffe sowie null vollständige
Inventarimporte. Die öffentliche Datenbank umfasst weiterhin 262 Figuren.

Der begrenzte ?ffentliche Deploy-Nachweis steht in
[`phase1-release-verification.json`](phase1-release-verification.json).
