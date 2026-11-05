# Cenyr: vollständige öffentliche Hausabdeckung

Stand: 3. November 2026, ausschließlich lokal. Es erfolgten weder Push noch
Deploy oder Schreibzugriffe auf Firebase.

Die geprüfte öffentliche Auswahl umfasst **276 Familien** in neun Grafschaften:
104 Celtigerns Wacht, 37 Klaueninsel, 30 Sonnenküste, 21 Tal der Milane,
20 Weidebucht, 19 Vortigerns Ruh, 18 Silberinsel, 15 Graue Weite und 12 Ährental.
Bei Sept Cneacail begründet der belegte heutige Exilaufenthalt in Gwynthor die
Abdeckung; die primäre Heimat und die bestehende Identität bleiben Ceitheach
zugeordnet. Dienstbindungen erzeugen keine zusätzlichen Ortsgruppierungen.

## Ergebnis und Quellen

Alle 276 Familien besitzen eine aktive Hausseite, eine Hausbiografie mit
Rückverweis auf die Seite und eine lokal vorhandene Hausdarstellung. Die Seiten
binden die tatsächliche Familien-ID im schreibgeschützten Stammbaum-Iframe ein.
Die 266 bereits vorhandenen Personengraphen, Hausprofile und Wohnortpfade sind
unverändert geblieben.

55 fehlende Seiten betrafen bestehende Familien. Davon konnten 37 vorhandene
Klaueninsel-Autorierungsquellen unmittelbar aktiviert werden; 18 Quellen wurden
aus belegten aktuellen Fakten ergänzt. Zehn weitere bürgerliche Familien waren
bereits in örtlichen Hauskarten belegt. Sie erhielten ausdrücklich genehmigte
vorbereitete Akten mit **null Personen und null Verwandtschaftsbeziehungen**.
Ihre tatsächlichen Wohnorte sind Llysfaen, Craithglyn und Bragwhislyn. Unbekannte
Wappen bleiben durch das vorhandene neutrale Systemzeichen erkennbar; es wurden
weder Heraldik noch Personen, Ämter oder Berufe erfunden.

**248 vorhandene Hausdarstellungen bleiben erhalten.** Für 28 tatsächliche
Bildlücken entstanden ergänzende Figuren. Grianlaoch verwendet wieder das in
den alten Vorlagen belegte Original `39p68Fe.png`; die frühere Ergänzung bleibt
als inaktive Quelle erhalten. Die zwei Blodyn-Zweige teilen die passende
überlieferte Darstellung. Elimue und Marmue erhielten dagegen unterschiedliche
Morforwyn-Zweigfiguren entsprechend ihren tatsächlich verschiedenen Wappen.

Die ausführlichen vorhandenen Biografien von Twyllod und Cwingod bleiben mit
ihrem gesamten Prosatext erhalten; Hausbild und Seitenrückverweis wurden
ergänzt. Zwei veraltete militärische Statistikzeilen entfallen in Cwingods
aktiver Kopie, während die ursprüngliche Seeddatei unverändert bleibt.
Gespeicherte eigene Biografien und ausdrückliche Löschungen
werden durch die bestehende Fingerprint-Verwaltung weiter geschützt.

## Verantwortlichkeiten

`haus.content.mjs` bleibt die redaktionelle Quelle je Haus. Seiten, gemeinsame
Seitenregistrierung und verwaltete Standardbiografien entstehen über
`scripts/build-house-content.mjs`. Die Faktenaufbereitung für neue vorbereitete
Quellen liegt in `modules/house-content/prepared-house-facts.mjs` und
`prepared-house-content.mjs`; sie ersetzt keine bestehenden Hauschroniken.

Die zehn ausschließlich territorial belegten neuen Familien stehen getrennt in
`Stammbäume/assets/js/data/cenyr-territory-commoner-definitions.js` und
`cenyr-territory-commoner-families.js`. Dort werden keine Personendaten erzeugt.
Örtliche Hauskarten führen direkt zur passenden großen oder kleinen Hausvorlage.
Die Kriegergalerie wurde ausschließlich für die 276 geprüften öffentlichen IDs
aktualisiert; 618 fremde Hauseinträge und sämtliche fremden Illustrationen
blieben unverändert.

## Wiederholbare Pflege

Die Vollständigkeitsprüfung verlangt eine ausdrücklich geprüfte öffentliche
ID-Auswahl. Private und versteckte Dossiers sind kein Teil dieser Auswahl und
werden vor Berichtserzeugung ausgeschlossen.

```powershell
node 'Familien Häuser und Clans/scripts/check-cenyr-house-coverage.mjs' --allowlist diagnostics/cenyr-house-completeness-20261103/coverage-audit/public-family-ids.json --check
```

Neue oder geänderte Hausquellen anschließend bewusst begrenzt bauen:

```powershell
node 'Familien Häuser und Clans/scripts/build-house-content.mjs' --houses=haus-id,weitere-id
node 'Familien Häuser und Clans/scripts/build-house-content.mjs' --houses=haus-id,weitere-id --check
node Gallerien/krieger/scripts/build-catalog.mjs --houses=haus-id,weitere-id
```

Keine unbeschränkte Regenerierung fremder paralleler Autorierung. Der begrenzte
Hausbuilder prüft unbekannte, leere oder doppelte Auswahlwerte vor dem ersten
Schreibzugriff und erhält fremde Registereinträge, Kommentare und Reihenfolgen.

Alle öffentlichen 276 Schnittstellenpfade und Bildbindungen stehen in
`diagnostics/cenyr-house-completeness-20261103/family-interfaces.json`.
Quellenentscheidungen, Originalhashes, Bildrezepte und Vorher-/Nachher-Belege
bleiben im selben Diagnosebereich erhalten. Dieser Bereich ist kein statisches
Auslieferungsverzeichnis.

## Abschließende Prüfung

Der abschließende gemeinsame Lauf besteht **79 Tests ohne Fehler**. Der
Vollständigkeitsprüfer bestätigt 276/276 Familien ohne Seiten-, Bio-, Bild-,
Iframe- oder Rückverweislücken. Die begrenzten Generatorprüfungen sind für
66 bearbeitete Hausquellen und alle 276 Galeriebindungen aktuell.

Im Browser wurden unter anderem Grianlaochs Original und Ritterrang, Carwyns
neue Figur, Jernigans leere vorbereitete Akte mit tatsächlichem Iframe,
Cneacails Exilaufenthalt, Swynols Wohnort, die Elimue-Zweigfigur, Arths erhaltenes
Original und Cwingods vollständige Biografie mit Hausbild und Rücklink geprüft.

Dabei wurde ein zusätzlicher Routingfehler behoben: Der belegte alte Link
`haus-cwingod` öffnet nun dieselbe Seite wie die kanonische ID `haus-cwningod`.
Die Hausquelle speichert den Alias, und der Generator übernimmt ihn in das
Register. Ausdrücklich unbekannte Haus-IDs zeigen den vorhandenen Fehlerzustand
statt still ein anderes Haus zu öffnen; Aufrufe ohne ID behalten ihr bisheriges
Standardverhalten. Drei Routingregressionen sichern dies ab. Diese späte reine
Aliaskorrektur ergänzt die früheren Erhaltungsbelege, ohne Personengraphen,
Hausprofile, Illustrationen oder Biografieprosa zu verändern.

Der maschinenlesbare Abschlussbeleg steht unter
`diagnostics/cenyr-house-completeness-20261103/verification.json`.
Die 28 mit dem eingebauten Imagegen-Werkzeug ergänzten Figuren sind samt
vollständigen Prompts, tatsächlich verwendeten Referenzpfaden, Dateihashes und
Produktionspfaden in `diagnostics/cenyr-house-completeness-20261103/image-prompts.json`
dokumentiert. Der unabhängig geprüfte Bildbestand steht in
`diagnostics/cenyr-house-completeness-20261103/art-audit/final-artwork-manifest.json`.

Alle Arbeiten und Prüfungen bleiben lokal; es gab keinen Push, Deploy oder
Firebase-Schreibzugriff.

## Ergänzung: örtliche Familienprofile vom 5. November 2026

Die acht neu freigegebenen Landfamilien in Gwynthor besitzen bereits eigene
Familienakten, Hausbiografien und Wappen. Ihre territorialen Verweise öffnen
die jeweilige Akte direkt im schreibgeschützten Stammbaum. Das vorhandene
Hausbiografie-Fenster öffnet sich über das Wappen beziehungsweise die Aktion
`open-house-biography`. Eine zusätzliche Kriegerdarstellung ist für diese
Haushalte nicht beauftragt.

`modules/house-coverage/rural-family-profile.mjs` bindet diese Profilart an den
öffentlichen Ortsindex, die eigene Dokument-ID, die tatsächlich vorhandene
Quellakte und deren Wappen. Der Prüfer weist die Profilart als `family-record`
und das Identitätsbild als `family-crest` aus. Er meldet keine erfundene
Hausdarstellung und ersetzt keine vorhandene eigenständige Hausseite durch
einen Ausweichlink. Für eigenständige Hausseiten bleiben die bisherigen
Bild-, Iframe- und Rückverweisprüfungen verbindlich. Gespeicherte eigene
Biografien und ausdrückliche Löschungen bleiben geschützt.

Die dynamische öffentliche Auswahl enthält diese acht Familien vollständig.
Die elf Abdeckungsprüfungen bestätigen außerdem die echten Profilziele,
Quell- und Wappenbindungen, die gerenderte Hausbio sowie die Ablehnung falscher
Dokument- und Bildzuordnungen. Private Akten und private Bildpfade bleiben
ausgeschlossen; ein historischer Dateiname ist kein Sichtbarkeitsmerkmal.
