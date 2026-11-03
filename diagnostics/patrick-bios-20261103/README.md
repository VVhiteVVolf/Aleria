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
Andere Datentypen und unbeteiligte Hauptfelder wurden exakt verglichen. Es
wurde kein zweites Apply ausgeführt. `externalWrites: 0` im Prüfbeleg bezieht
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
