# Drei Familienhöfe im Bannkreis Gwynthor

Die lokalen Module **Tirfelyn-Hof**, **Jagdhaus Helfaen** und **Marchwern-Gestüt**
verwenden die bestehenden Almanachvorlagen für Hierarchie, Hausbio, eingebetteten
Stammbaum und interaktive Szenen. Jede Familie hat ihre eigene Kategorie unter
`Völker & Kulturen > Cenyr > Celtigerns Wacht > Llamreis Ankunft > Bannkreis Gwynthor`.

Jedes Modul enthält sechs Seiten: Übersicht, Betriebs- und Familienrollen,
Hausbio, Iframe-Stammbaum, Außenszene und Wohnstube. Die Hausbio führt alle
Angehörigen auf und zeigt die drei wichtigsten als Porträts. Die Hierarchie
stellt jeden lebenden Angehörigen einmal mit seiner primären Aufgabe vor;
Kinder bleiben altersgemäß im Familienhaushalt eingeordnet. Ceridwen ist keine
aktive Arbeitskraft oder Szenenbesetzung. Ihre Verlobung und ihr Tod im Jahr
1740 bleiben Bestandteil der miteinander verknüpften Familienakten.

Die Personen gehören dem kanonischen Modul
`Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs`.
Familiengeschichte, Identitäten und Weltpersonenkennungen werden aus den
zuständigen drei Familienquellen übernommen. Der Almanach besitzt nur seine
Ortsbeschreibungen, die Präsentation und die stabilen Seiten-/Szenenschlüssel.
Es gibt keine zweite Figurenregistrierung und keinen eigenen Szenenrenderer.

Die Außenszenen und Wohnstuben verwenden die aktiven Anime-Bilder `-v2.png`
unter `assets/gwynthor-landfamilien/scenes/`. Porträts liegen im gleichen
Assetbereich unter `portraits/<familie>/<personenkennung>.png`. Die vorhandenen
Familienwappen und Kartenmarker bleiben erhalten.

Die verbindliche Bildregie des Nutzerauftrags lautet: **2:3, strenger
Tales-of-Xillia-/Tales-of-Zestiria-Anime-Stil, klare Lineart und sauberes
Celshading, markante überzeichnete Gesichter und starke Mimik, einfache
Anime-Texturen; keine realistischen Texturen und keine malerische Darstellung**.
Die Personen stehen in gelassenen, voneinander verschiedenen Posen, mit
unterschiedlichen Frisuren und Körperausrichtungen und möglichst ohne
Gegenstände. Die sechs Szenenbilder zeigen die Höfe und Stuben ohne Personen.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-landfamilien.mjs
node AleriaAlmanach/scripts/build-gwynthor-landfamilien.mjs --check
node AleriaAlmanach/scripts/build-gwynthor-landfamilien-characters.mjs --check
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-landfamilien.test.mjs
node --test --experimental-test-isolation=none AleriaAlmanach/tests/gwynthor-landfamilien-characters.test.mjs
node AleriaAlmanach/tests/gwynthor-landfamilien.browser.mjs
```

Der Builder schreibt ausschließlich die Classic-Datenbrücke dieses Features
und drei JSON-Modulpakete unter
`Charakter Archiv Exporte/Module/Gwynthorer Landfamilien/`. `--check` schreibt
nichts. Der Durchgang erzeugt keine Shopkataloge, Inventare oder produktiven
Spielbuchungen. Er veröffentlicht keine Website.

`landfamilien-characters.mjs` erzeugt 36 lokale Figurenquellen: 35 lebende
Familienmitglieder und die verstorbene Ceridwen. Die eigenen ausführlichen
Personenbios gehören `landfamilien-person-biographies.mjs`; sie verbinden die
überlieferten Tätigkeiten, Verwandtschaft, Lebensdaten, Erscheinung und den
Familienalltag im Jahr 1740. Der vorhandene begrenzte Figurenimport schreibt
sie in die Charakterdatenbank, damit die Szenenbesetzung im echten Kommentar-
Avatarwähler aufgelöst wird. Er vergibt keinen Besitz und schreibt nicht nach
Firestore. Ceridwens Akte ist `dead`, mit Todesjahr 1740, Alter 22 und
`archived: false`. Der ausdrücklich lebende Szenencast bleibt bei 35 Personen.

Der Figurenbuilder startet ohne Argumente im Modus `--plan`. Die Planung prüft
die konkrete Modellprojektion, feste Weltidentitäten, primäre Heimatfamilien und
den Erhalt aller fremden Snapshot-/Registereinträge. `--write` erfordert denselben
noch gültigen Datenbank- und Quellenstand wie die gespeicherte Planung. Ein
eindeutig vorhandener Weltpersonenbezug behält seine Laufzeitkennung; gleiche
Namen allein lösen weder eine Übernahme noch eine Zusammenführung aus. Die
Modelle werden für jeden Export einzeln über den vorhandenen Importer erzeugt.

```powershell
node AleriaAlmanach/scripts/build-gwynthor-landfamilien-characters.mjs --plan
node AleriaAlmanach/scripts/build-gwynthor-landfamilien-characters.mjs --write
node AleriaAlmanach/scripts/build-gwynthor-landfamilien-characters.mjs --check
```

Der erste lokale Import ergänzte 35 neue Akten zu 331 bestehenden. Die 331
bisherigen Akten sind bytegleich erhalten; Snapshot- und Registerbestände sind
typengleich erhalten. Eine anschließende begrenzte Korrektur übernimmt für Gorwyn
den kanonischen Beziehungstyp `engagement`. Pläne, ursprüngliche Projektionen,
Dateihashes und einzelne Importbelege liegen unter
`diagnostics/gwynthor-landfamilien-20261107/modules/`.

Der Folgeauftrag zur Veröffentlichung ergänzt Ceridwens eigene Akte und füllt
die 35 bisherigen kurzen Personenbios aus derselben kanonischen Quelle.
Der lokale Snapshot enthält damit 367 Akten; alle 331 älteren Fremdakten bleiben
bytegleich erhalten. Die getrennte Onlinepublikation wird unter
`diagnostics/gwynthor-landfamilien-release-20261107/characters/` geplant und
protokolliert. Ein lokaler Builder führt sie nicht automatisch aus.
