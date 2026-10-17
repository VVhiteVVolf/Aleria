# Große Kathedrale der Neun · Gwynthor

Lokaler Entwurf vom 17. Oktober 2026. **Nicht pushen, veröffentlichen oder in Firebase importieren**, solange die bestehende lokale Veröffentlichungspause gilt.

## Seiten

1. Die Kathedrale im Herzen Gwynthors: Widmung an die Neun und Unterstellung unter Gwalchgwyn Saethwyr.
2. Immersive Biografie des Patriarchen von Celtigerns Wacht; Rollen- und Persönlichkeitsbild ohne Kommentarverweise im sichtbaren Text.
3. Vier Hierarchiereiter für seinen engen Kreis: Führung, militärischer Stab, Kirchdiener, Bußgänger und Geläuterte.
4.–11. Acht interaktive Raumszenen: Vorhalle, Kirchenschiff, Chor und Altäre, Kapitelsaal, Patriarchenzimmer, Kreuzgang, Bußhaus und Wachhof.

Die gemeinsame Kommentarseite folgt automatisch. Szeneneinleitungen sind kurz und verwenden die einklappbare gemeinsame Sitzungsvorlage. Stabile Kommentarschlüssel und vorhandene Personenidentitäten bleiben erhalten.

## Personen und Stellen

- Gwalchgwyn Saethwyr: vorhandener Patriarch, Online-ID `Q0BYdkMCMOjm5rnJYjq7`.
- Neun hohe Prälaten insgesamt: **Peredur Eneiniog** und acht unbenannte Plätze. Keine individuellen Ressorts; der Nachfolger Gwalchgwyns stammt aus diesem Kreis. Das Verfahren wird nicht erfunden.
- Militärischer Stab: ein Hochpaladin, sechs Paladine einschließlich **Angharad Eneiniog**, acht Glaubensritter im Templerdienst, acht Schwurknechte, vier Knappen, vier Pagen. Zahlen sind Gesamtzahlen je Rang. Zwei unbenannte Militärkapläne ergänzen die geistliche Begleitung, ohne einen zusätzlichen militärischen Rang zu bilden.
- 17 Kirchdiener: ein Haushofmeister, persönlicher Sekretär, Siegler/Registrator, zwei Schreiber, Kanzleibote, zwei Hauskapläne, persönlicher Sakristan, Almosenpfleger, zwei Akolythen, zwei Kammerdiener, Koch und zwei Reise-/Haushaltsgehilfen. Die Gliederung koordiniert den persönlichen Dienst; sie ersetzt keine Weihehierarchie.
- Vier Geläutertenplätze und vier Bußgängerplätze. **Arianwen Bradrhith**, Online-ID `nLIylooQSlgWjUsA1fpI`, belegt einen Bußgängerplatz. Die drei übrigen bleiben unbenannt. Geläuterte sind nach geltendem Kleruscodex frei und nicht zu weiterem Dienst verpflichtet; die obere Gruppe stellt keinen Vorgesetztenrang über Bußgängern dar.

Die vier vorhandenen Personen und ihre Porträts stammen aus den kanonischen Familienquellen. Es werden keine zusätzlichen Charakterprofile und keine unbekannten Familiennamen erzeugt. Peredurs Prälatenamt und Angharads Stabszugehörigkeit sind auch in `house-eneiniog-family.js` lokal vermerkt.

## Recherche und redaktionelle Ableitung

Die lesende Online-Recherche erfasste alle 3.654 zum Recherchezeitpunkt vorhandenen Dokumente der Sammlung `comments` mit begrenzter Feldprojektion. 42 Beiträge lassen sich Gwalchgwyn als Sprecher zuordnen. Sechs sind übernommene Textdoppelungen; es bleiben 36 unterschiedliche Texte. Alle 42 Quellbelege und die einschlägigen abschließenden Äußerungen Gwendolyns zu Arianwen stehen in `sources/patriarch-evidence.json`. Recherchezeit und tatsächlich gelesene Quelle sind dort vermerkt. Keine Online-Dokumente wurden verändert.

Die Biografie verdichtet: konkrete Fürsorge, Seelsorge und Wiedereingliederung; ernsthafte Reue statt Angst vor Strafe; geduldige, ursachenbezogene Beratung; Selbstbeherrschung auch gegenüber Schuldigen; höfische Erfahrung, familiäre Wärme, bildhafte Predigten und trockenen Humor; strenge Sexual- und Standesmoral; Anerkennung der eigenen Fehlbarkeit. Zukunftspläne aus Gesprächen werden nicht als bereits vollzogene Reisen dargestellt. Einzelne unzutreffende Erzählerbezeichnungen verdrängen nicht seine kanonische Identität als Saethwyr.

Arianwens älterer Charaktertext nennt sie „Geläuterte Schwester“, beschreibt aber laufende Buße. Für dieses Modul gelten das konkrete Urteil, Gwalchgwyns Übernahme als direkter Bußvater und die aktuelle Zweiständeordnung: Sie ist noch Bußgängerin. Erfundene Bußdauer, lebenslange Bindung oder zusätzliche Bestrafungen werden nicht ergänzt. Frühere Kommentare, der bestehende Charaktertext, Ressourcen und Inventar bleiben unberührt. Andere Personen, denen Gwalchgwyn lediglich einen Dienst angeboten hat, werden nicht als angenommene Stabsmitglieder eingetragen.

Kirchliche Quellen: `Religionen/klerus/kasten/priester.json`, `paladine.json`, `gelaeuterte.json`, `Religionen/klerus/gemeinschaften.json`, die Alerische Kirche und der Götterkreis im Religionsregister. Die hier gewünschte örtliche Prälatenfolge und militärische Gliederung folgen dem aktuellen Nutzerauftrag; sie schreiben nicht die allgemeine Kirchenhierarchie um. Kleriker ist keine zusätzliche Kaste. Die neun Prälaten entsprechen nicht neun individuell zugeteilten Gottheiten.

## Vorlagen und Bilder

Quellen und Seitenaufbau sind in eigene Featuredateien getrennt. Anzeige, Modal- und Inline-Editor sowie Sanitizer teilen nun die Grenze von zwölf Knoten je Ebene. Die vorhandenen sechs Spalten können umbrechen, damit neun gleichrangige Prälaten vollständig auf einer Ebene erhalten bleiben. Es gibt keinen separaten Kathedralenrenderer.

Neun neue Szenenbilder liegen unter `../../assets/gwynthor-cathedral/scenes/`; `image-prompts.json` und `image-results.json` daneben dokumentieren Prompts, Referenzen, Maße und SHA-256. Verwendet wird das eingebaute ImageGen im gespeicherten Anime-Szenenstil. Bestehende Personenporträts und Kirchensymbole werden wiederverwendet. Turmform, Architektur und Raumausstattung sind neue szenische Ausgestaltung; Baujahr und Sitzplatzzahl werden nicht erfunden.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-cathedral.mjs
node AleriaAlmanach/scripts/build-gwynthor-cathedral.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/hierarchy-viewport.test.mjs AleriaAlmanach/tests/hierarchy-level-capacity.test.mjs
node AleriaAlmanach/tests/gwynthor-cathedral.browser.mjs
```
