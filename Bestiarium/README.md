# Bestiarium von Aleria

Die neue Hauptseite ist `index.html`. Das linke Almanach-Register verlinkt direkt dorthin. Sie funktioniert als eigenständige statische Seite ohne Firebase, Anmeldung, Build-Schritt oder Browser-Speicher und ist zusätzlich als Vite-Einstieg registriert.

## Verantwortung und spätere Erweiterung

- `modules/catalog`: die fünf Kapitel, 42 individuelle Bildtafeln, Suche, Filter und Darstellung der Wesen.
- `modules/topic-board`: die 13 Themen- und Literaturverweise sowie ihre Darstellung als Themenwand.
- `modules/topic-article`: gemeinsame statische Vorlage, Kapitelregister und Darstellung der ausgearbeiteten Themenseiten.
- `modules/entry-preview`: gemeinsame Vorschau und die Entscheidung zwischen Vorschau-Button und vorhandenem Seitenlink.
- `modules/book-shell`: gemeinsame Pergamentfarben, Typografie, Navigation und Fußzeile für Haupt- und Profilseiten.
- `modules/creature-profile`: wiederverwendbare statische Profilvorlage, Profilregister und Anbindung der Vorschauen.
- `modules/natural-species`: gemeinsame Naturkundevorlage für Tiergruppen, regionale Artenregister und spätere Einzeldossiers.
- `modules/horse-profile`: gemeinsame statische Vorlage für Pferdedossiers, Rossmarkt-Werte und Leistungsdiagramme.
- `modules/profile-metrics`: gemeinsames, zugängliches Sechs-Achsen-Diagramm für Pferde-, Raubtier-, Haustier- und Reptiliendossiers.
- `modules/predator-profile`: Übersichten für Raubkatzen, Wölfe, Warge und Bären sowie die einzelnen Raubtierdossiers.
- `modules/livestock-category`: gemeinsame Unterregister, Viehkunde und Bestandskarten für die sechs Bereiche des Vieharchivs.
- `modules/pet-breed`: Hunde- und Katzenregister mit regional geordneten Rassenkarten und offen gekennzeichneten, noch namenlosen Bildtafeln.
- `modules/pet-profile`: gemeinsame Darstellung der Hunde- und Katzenprofile mit Rassenblatt als rechter Randspalte, Rassendiagramm, unbeschnittenen Einsatzbildern und Dossiernavigation.
- `modules/dog-profile` und `modules/cat-profile`: tierartspezifische Register, Archivtexte und Generator-Anbindung auf Basis der gemeinsamen Profilvorlage.
- `modules/reptile-profile`: gemeinsame Darstellung und Generator-Anbindung für Drúchtán, seine verwandten Linien und weitere Reptiliendossiers.
- `modules/field-guide-profile`: gemeinsame Dossierdarstellung für Kreaturengruppen und Einzelarten mit rechter Wissenswertes-Spalte, Bildtafeln und frei benennbaren Vergleichswerten.
- `modules/creature-group-profile`, `modules/kobold-profile`, `modules/ogroid-profile`, `modules/vampire-profile` und `modules/bloodsucker-profile`: Register, Kontext und Generator-Anbindung für Gruppenübersichten sowie die einzelnen infernalen Linien und vampirischen Sprosse.
- `modules/image-gallery`: unabhängige Bildgalerie mit Großansicht, Blätterfunktion und Tastaturbedienung.
- `bestiarium-page.js`: verbindet die Module und das Kapitelregister. Die Module verwalten ihren eigenen DOM-Bereich und Zustand.

Einträge besitzen eine stabile `id`, `title`, `description`, optional `note`, bei Wesen `image`, und `href`. Solange `href: null` bleibt, öffnet sich eine ausdrücklich als Vorbereitung gekennzeichnete Vorschau. Sobald eine Unterseite angelegt ist, erhält der Eintrag ihre URL relativ zur Bestiarium-Hauptseite, etwa `./wesen/drachen/index.html`. Die Karte wird automatisch ein echter Link. Keine zusätzlichen Klick-Handler oder Änderungen am Layout erforderlich.

Weitere individuelle Exemplare gehören in die entsprechende Gruppe eines Kapitels. Die kurzen Einführungstexte dienen der Orientierung; ausführliche Beschreibungen und Spielwerte sind noch nicht ausgearbeitet. Das namenlose Holzwesen der alten Vorlage bleibt als „Noch ohne Namen“ erhalten. Leere, wiederholte Fragezeichenplätze wurden durch Hinweise zur wachsenden Sammlung ersetzt.

## Wiederverwendbare Kreaturenprofile

Die ersten ausgearbeiteten Profile sind `wesen/luetten/index.html` und `wesen/fairean/index.html`. Die jeweilige redaktionelle Quelle liegt daneben in `profil.json`: Name, Einordnung, Einleitung, Porträt, Lebensräume, Steckbrief, Textabschnitte, Gattungen, Galerie und Randnotizen. Die Texte und Steckbriefangaben stammen aus den alten Vorlagen. Bisherige Zitat-Platzhalter wurden durch Aussagen aus dem jeweiligen Einführungstext ersetzt; Trivia ist ausdrücklich noch offen. Gattungen und Galerieeinträge ohne eigene Seite öffnen Vorschauen mit „Noch nicht ausgearbeitet“.

Das Fairean-Profil bewahrt alle 27 Absätze der sechs inhaltlichen Kapitel und der drei Gattungsbeschreibungen. Die unbestimmten Angaben für Stärken, Schwächen und Beute sind als noch nicht ausgearbeitet markiert. Seine sieben zusätzlichen Bildtafeln sowie das Titelbild werden lokal ausgeliefert. Die drei Gattungskarten verwenden ihre Motive aus der alten Vorlage; der neue Bildatlas bleibt der Galerie vorbehalten.

Die Seiten werden mit `node Bestiarium/scripts/build-creature-profiles.mjs` erzeugt. Mit `--check` wird geprüft, ob die eingecheckten HTML-Dateien zur Quelle und Vorlage passen. Profiltexte, Steckbrief und Bilder sind statisches HTML und auch ohne JavaScript lesbar. Die Galerie-Bildlinks öffnen ohne JavaScript direkt das Bild. Nur die Großansicht mit Blätterfunktion und die Vorschau-Dialoge benötigen JavaScript.

Für ein weiteres Profil:

1. `wesen/<id>/profil.json` mit der Struktur eines vorhandenen Profils und dessen lokalen Bildern anlegen. Die `id` muss zum Verzeichnis passen. Anzahl und Namen der Themenabschnitte sind frei. `lineageSectionId` legt fest, an welcher Stelle die Gattungskarten erscheinen; deren Beschreibungen stehen ausschließlich in `lineages`, während der zugehörige Abschnitt Einleitung und Nachwort enthält.
2. Die `id` in `modules/creature-profile/profile-registry.mjs` ergänzen. Build-Skript und Vite verwenden dasselbe Register.
3. Im Katalog die bestehende Bildtafel mit `./wesen/<id>/index.html` verknüpfen und die Cache-Version der geänderten Browsermodule aktualisieren.
4. Profilseiten erzeugen und prüfen. Generiertes `index.html` nicht separat redigieren.

Weiterführende Gattungen und Galerieprofile besitzen jeweils ein eigenes `href`. `null` bleibt eine Vorschau, eine vorhandene lokale URL wird ein echter Link. Die Galerie-Großansicht bleibt davon unabhängig. Bildtitel gehören über das jeweilige Motiv. Die Herkunft der Bilder ist im jeweiligen `assets/sources.json` dokumentiert; alle werden lokal als WebP ausgeliefert.

Galerie-Bildlinks tragen `data-bestiary-image-link`. Die Vite-Konfiguration behandelt deren `href` über `html.additionalAssetSources` ebenfalls als Bildquelle, damit Großansicht und direkte Bildlinks auch im Produktions-Build auf die verarbeiteten Dateien zeigen.

Die frühere Bestiarium-Seite und ihre ausschließlich dort verwendeten Dateien wurden entfernt. Verzeichnisse und Portalseiten verweisen einheitlich auf `Bestiarium/index.html`; Animexx-Verlinkungen wurden nicht übernommen.

## Wiederverwendbare Themenseiten

Der Literaturverweis **„Das Wesen des Infernalen“** führt auf `themen/wesen-des-infernalen/index.html`. Er verwendet dasselbe Themenregister und denselben Generator, mit `presentation: "book"` als wiederverwendbarer Buchvariante. Die 44 überlieferten Absätze und fünf Buchkapitel stehen als normales HTML sowie als blätterbares Pergamentbuch zur Verfügung. Architektur, Datenformat, Lizenzen, Abnahme und Grenzen sind in [modules/book-reader/README.md](modules/book-reader/README.md) dokumentiert.

Die sechs Einträge „Kalpa & Morgath“, „Risse & Manât“, „Geweihte“, „Gefallene“, „Celestiale“ und „Infernale“ in der Sphärenkunde führen auf ausgearbeitete lokale Seiten unter `themen/`. Ihre redaktionellen Quellen liegen jeweils als `thema.json` neben dem erzeugten `index.html`. Abschnitte, Unterkapitel, Merkpunkte und Fakten werden von einer gemeinsamen Vorlage dargestellt; Inhalte ohne überlieferten Text sind sichtbar als noch nicht ausgearbeitet gekennzeichnet.

Jede Seite verwendet ein neu erzeugtes Aquarell-Icon aus `assets/topic-icons/`. Die verwendeten Bild-Prompts und Ausgabedaten stehen in `assets/topic-icon-prompts.json`. Bilder aus den alten Vorlagen wurden nicht übernommen. Das Feld `themeImage` bleibt zunächst `null`; die Vorlage zeigt dafür einen bewusst leeren, gerahmten Platz, bis ein Themenbild geliefert wird.

Die Seiten werden mit `node Bestiarium/scripts/build-topic-articles.mjs` erzeugt. Mit `--check` wird geprüft, ob die eingecheckten HTML-Dateien zu Daten und Vorlage passen. Für eine weitere Themenseite werden ein Verzeichnis `themen/<id>/thema.json` und die zugehörige `id` in `modules/topic-article/topic-article-registry.mjs` ergänzt; die Themenwand erhält anschließend ihren relativen `href`.

## Naturkundliche Tierseiten

Alle zehn Tafeln im Kapitel „Tiere · Die natürlichen Arten“ führen auf eigene Seiten unter `tiere/`. Ihre redaktionellen Quellen heißen `art.json`; eine gemeinsame Vorlage rendert Einleitung, Hintergrund oder Lebensräume, Wissenswertes und das hierarchische Artenregister. Die Pferderassen bleiben zuerst nach Kontinent und anschließend nach Land oder Kulturraum geordnet. Jedes Urpferd wird innerhalb seines Kontinents gesondert hervorgehoben. Alle 32 Pferdekarten sind mit ihren ausgearbeiteten Dossiers verknüpft; bei den übrigen Tiergruppen öffnen noch nicht angelegte Artendossiers weiterhin eine Vorschau.

Die neun neuen 2:3-Titelmotive wurden mit `image_gen` im festgelegten Anime-Stil erzeugt. Die Pferdeseite verwendet das vom Nutzer vorgegebene Motiv. Alle zehn Bilder werden lokal aus `assets/species-art/` ausgeliefert; Herkunft, Maße und vollständige Bild-Prompts stehen in `assets/species-art-sources.json`.

Die 62 überlieferten Kreaturbilder aus den alten Tierseiten bleiben in den zugehörigen Arten- und Rassenkarten erhalten. Freigestellte Motive stehen vollständig auf ruhigen, einfarbigen Pergamentflächen: hochformatige Bilder in einem 2:3-Rahmen, quadratische und breite Bilder in einem 1:1-Rahmen. Die optimierten Dateien liegen unter `assets/species-entries/`; ihre Quellen sind in `assets/species-entry-sources.json` dokumentiert.

Die Seiten werden mit `node Bestiarium/scripts/build-natural-species.mjs` erzeugt und mit `--check` auf Aktualität geprüft. Neue Tiergruppen benötigen ein Verzeichnis `tiere/<id>/art.json` sowie einen Eintrag in `modules/natural-species/natural-species-registry.mjs`; Build-Skript und Vite verwenden dieses gemeinsame Register.

Das Reptilienregister führt zu vier vollständigen Dossiers: Drúchtán, Corrchrúbán, Mýrrblóðr und Brúctar. Die beiden zuletzt genannten Einträge bilden das überlieferte Varianten- und Verwandtschaftsregister des Drúchtán; drei weitere Plätze bleiben entsprechend der alten Tafel als „???“ offen. Die zwölf gelieferten Abbildungen werden lokal und ohne Beschnitt aus `assets/reptile-profiles/` ausgeliefert, ihre Quellen und Originalmaße stehen in `assets/reptile-profile-sources.json`. Jedes Dossier besitzt eine aus der jeweiligen Lore abgeleitete Archivbewertung und zeigt „Wissenswertes“ rechts neben dem Text. Die Seiten entstehen mit `node Bestiarium/scripts/build-reptile-profiles.mjs`.

Das Gliedertierregister enthält sechs vollständige Dossiers für Höhlenkriecher und fünf Spinnengattungen. Die fünf überlieferten Themenbilder der Spinnen erscheinen als große Dossiermotive; Kasten- und Unterartenbilder bleiben getrennt im jeweiligen Register. Alle 21 eigens übernommenen Profilbilder liegen unter `assets/insect-profiles/`, sind in `assets/insect-profile-sources.json` dokumentiert und werden ohne Beschnitt dargestellt. Die Seiten entstehen mit `node Bestiarium/scripts/build-insect-profiles.mjs`.

## Pferdedossiers

Die 32 Pferde aus dem kontinental gegliederten Artenregister besitzen eigene Seiten unter `tiere/pferde/<id>/`. Jedes `profil.json` enthält den Text und die Bildtafel aus der jeweiligen alten Vorlage sowie die passenden Marktdaten. Für 29 im Rossmarkt geführte Linien zeigt die Seite dessen sechs Werte als Radar und als lesbare Zahlenleiste. Bei Tanarhan, Ælvinger und Skjorn fehlt dort ein vollständiges Leistungsblatt; ihre Seiten kennzeichnen diesen Quellenstand ausdrücklich.

Alle Pferdebilder werden lokal als WebP aus `assets/horse-profiles/` geladen und ohne Beschnitt dargestellt. Quellen und Maße sind in `assets/horse-profile-sources.json` dokumentiert. Die Seiten entstehen mit `node Bestiarium/scripts/build-horse-profiles.mjs`; `--check` vergleicht die erzeugten Seiten mit Daten und Vorlage. Neue Pferdedossiers benötigen ein `profil.json` sowie einen Eintrag in `modules/horse-profile/horse-profile-registry.mjs`.

## Raubtierdossiers

Die Raubtierkunde besitzt eigene Übersichten für Raubkatzen, Wölfe und Warge sowie Bären unter `tiere/raubtiere/`. Sieben Wolf- und Wargarten und acht Bärenarten führen zu vollständigen Dossiers. Die drei Raubkatzen, der Gnoll und drei unbenannte Bären Lothirs bleiben sichtbar als vorgemerkte Einträge erhalten.

Jedes vollständige Dossier zeigt sechs aus dem überlieferten Arttext abgeleitete Feldwerte: Gefahr, Zähmbarkeit, Intelligenz, Körperkraft, Sozialverhalten und Ausdauer. Die Seite kennzeichnet diese Einordnung als vergleichende Archivbewertung und nicht als exakte Messung. Die alten Kreaturenbilder und die drei vom Nutzer gelieferten Raubkatzenbilder werden lokal aus `assets/predators/` geladen; Herkunft und Maße stehen in `assets/predator-sources.json`.

Die Seiten entstehen mit `node Bestiarium/scripts/build-predator-profiles.mjs`; `--check` prüft Übersichten und Einzeldossiers. Neue Dossiers benötigen ein `profil.json` und einen Eintrag in `modules/predator-profile/predator-registry.mjs`. Der jeweilige Übersichtseintrag erhält anschließend sein lokales `href`.

## Viehregister

Die Viehseite führt zu sechs eigenen Unterregistern: Rinder, Schafe & Ziegen, Schweine & Wildschweine, Hühner & Geflügel, Haustiere sowie Last- & Nutztiere. Ein gemeinsames Register auf jeder Unterseite erlaubt den direkten Wechsel zwischen diesen Bereichen. Einführung, Lebensräume und Haltung sind als allgemeine alerische Viehkunde ausgearbeitet.

Das Bestandsregister übernimmt ausschließlich die 32 in den alten Tafeln benannten Tiere und Linien sowie deren vorhandene Ortsangaben. Unbeschriftete Tabellenfelder bleiben als offene Archivstellen sichtbar und erhalten keine erfundenen Namen. Die 33 zugeordneten Bildtafeln liegen lokal unter `assets/livestock/`; Herkunft und Abmessungen stehen in `assets/livestock-sources.json`.

Die Seiten entstehen mit `node Bestiarium/scripts/build-livestock-categories.mjs`; `--check` prüft alle sechs Unterregister. Ihre Quellen liegen als `uebersicht.json` im jeweiligen Verzeichnis unter `tiere/vieh/`. Neue Viehbereiche werden im gemeinsamen `modules/livestock-category/livestock-category-registry.mjs` registriert und dadurch zugleich in Build und Vite aufgenommen.

Unter `tiere/vieh/haustiere/` führen Hunde und Katzen zu eigenen Rassenregistern. Die Hundeseite enthält 21 Bildkarten: 16 benannte Rassen und fünf echte Bilder ohne überlieferten Namen, die sichtbar als „???“ markiert sind. Die Katzenseite bewahrt alle 25 Plätze ihrer alten regionalen Ordnung: zehn benannte Rassen führen zu vollständigen Dossiers, fünfzehn noch fehlende Katzen bleiben ohne Ersatzgrafik als „???“ unausgefüllt. Alle 33 Titel- und Rassenbilder liegen lokal unter `assets/pet-breeds/` und sind in `assets/pet-breed-sources.json` dokumentiert.

Beide Haustierregister entstehen mit `node Bestiarium/scripts/build-pet-breeds.mjs`. Ihre Quellen liegen jeweils als `uebersicht.json` im Hunde- beziehungsweise Katzenverzeichnis; das gemeinsame Register `modules/pet-breed/pet-breed-registry.mjs` versorgt Generator und Vite.

Fünfzehn Hunderassen besitzen vollständige Dossiers unter `tiere/vieh/haustiere/hunde/<id>/`. Die ausführlichen Texte stammen aus den gelieferten Tafeln; offenkundige alte Zuordnungsfehler in drei Abschnitten wurden anhand der übrigen Rassenlore berichtigt. Fehlende Zitate und Trivia sind aus der jeweiligen Beschreibung ergänzt. Der Pudel bleibt ohne Dossier vorgemerkt, weil für ihn keine ausführliche Tafel geliefert wurde. Die neuen Einsatzbilder liegen lokal und unbeschnitten unter `assets/dog-profiles/`; Quellen und Maße stehen in `assets/dog-profile-sources.json`.

Die Hundeseiten entstehen mit `node Bestiarium/scripts/build-dog-profiles.mjs`. Neue Hunderassendossiers benötigen ein `profil.json` sowie einen Eintrag in `modules/dog-profile/dog-profile-registry.mjs`; anschließend wird die Rassenkarte im Hundeüberblick verlinkt.

Zehn Katzenrassen besitzen vollständige Dossiers unter `tiere/vieh/haustiere/katzen/<id>/`: Ruachar, Dúriyn, Fialmor, Velir, Skjarn, Cenyric, Lethin, Cérix, Targwyn und Samtlicht. Die gelieferten Tafeln stellen Einführung, Herkunft, Erscheinungsbild, Rassenmerkmale, Verhalten, Beziehung zum Menschen, Eigenarten und Trivia bereit. Ihre vollständigen neuen Bildtafeln liegen lokal unter `assets/cat-profiles/`; Quellen und Originalmaße stehen in `assets/cat-profile-sources.json`.

Die Katzenseiten entstehen mit `node Bestiarium/scripts/build-cat-profiles.mjs`. Neue Katzenrassendossiers benötigen ein `profil.json` sowie einen Eintrag in `modules/cat-profile/cat-profile-registry.mjs`. Beide Tierarten verwenden `modules/pet-profile`; Änderungen an der gemeinsamen Darstellung müssen daher gegen Hunde und Katzen geprüft werden. Alle 25 ausgearbeiteten Hunde- und Katzenprofile zeigen sechs aus der jeweiligen Lore abgeleitete Vergleichswerte. Das Rassenblatt „Wissenswertes“ steht in breiten Ansichten als Randspalte rechts neben dem eigentlichen Text.

## Kobolddossiers

Die Seite `wesen/gruppen/kobolde/index.html` ordnet zehn überlieferte Linien ihren infernalen Herren zu: Feuerkobold, Leidling, Grimling, Blutling, Hornling, Drachling, Schädling, Racheling, Wunschling und Lustling. Fünf noch unbelegte Stellen der Artenübersicht bleiben als „???“ sichtbar. Jede bekannte Linie besitzt ein eigenes Dossier mit ergänztem Zitat und Trivia, elf Wissenswertes-Einträgen und sechs aus ihrer jeweiligen Lore abgeleiteten Vergleichswerten.

Die transparente Figurenabbildung und das zugehörige Szenenbild bleiben je Dossier getrennte lokale Dateien unter `assets/kobold-profiles/`; beide werden vollständig und ohne Beschnitt dargestellt. Quellen und Maße stehen in `assets/kobold-profile-sources.json`. Die Einzelseiten entstehen mit `node Bestiarium/scripts/build-kobold-profiles.mjs`, die gemeinsame Übersicht mit `node Bestiarium/scripts/build-creature-group-profiles.mjs`.

## Ogroidendossiers

Die Seite `wesen/gruppen/ogroiden/index.html` führt zu fünf überlieferten Linien: Gorak, Ognir, Grimnak, Bhalgar und Zarok. Zehn weitere Stellen bleiben als „???“ erhalten. Die Zarok-Seite berichtigt den offensichtlichen Namensfehler der alten Wissenswertes-Tabelle, die ihn als Ognir bezeichnete. Alle fünf Dossiers besitzen ergänzte Zitate und Trivia sowie eine eigene, aus Fähigkeiten und Schwächen der jeweiligen Linie abgeleitete Archivbewertung.

Die vollständigen Figuren und die getrennten Szenentafeln liegen unter `assets/ogroid-profiles/`; Quellen, Maße und die vorgesehene unbeschnittene Darstellung stehen in `assets/ogroid-profile-sources.json`. Die Einzelseiten entstehen mit `node Bestiarium/scripts/build-ogroid-profiles.mjs`, die gemeinsame Übersicht mit `node Bestiarium/scripts/build-creature-group-profiles.mjs`.

## Vampirdossiers

Die Seite `wesen/gruppen/vampire/index.html` stellt Bhaals blutgebundene Hierarchie in vier getrennten Stufen dar: Der Vampirfürst steht allein an der Spitze, darunter folgen Nosferat, Mula, Alp und Nachzehrer als höhere Vampire. Die geborene Striga steht gesondert zwischen diesen Gattungen und den niederen Blutsaugern. Der Vampirfürst bleibt ohne eigenes Dossier vorgemerkt, neun weitere Archivstellen bleiben als „???“ offen. Die Dossiers der fünf ausgearbeiteten Gattungen übernehmen ihre überlieferten Merkmale und Fähigkeiten; ergänzte Zitate und Trivia folgen der jeweiligen Lore.

Vollständige Figuren, Titelbilder und Szenentafeln werden getrennt und ohne Beschnitt unter `assets/vampire-profiles/` ausgeliefert. Die Nosferat-Szenentafel bleibt mit allen 80 Einzelbildern animiert. Quellen, Maße und Darstellungsart stehen in `assets/vampire-profile-sources.json`. Die Einzelseiten entstehen mit `node Bestiarium/scripts/build-vampire-profiles.mjs`, die gemeinsame Übersicht mit `node Bestiarium/scripts/build-creature-group-profiles.mjs`.

Die anklickbare Blutsaugerstufe führt zu `wesen/gruppen/blutsauger/index.html`. Dort folgen die vier überlieferten Sprossformen Mulinar, Alpyr, Nosphyr und Mortis; eine fünfte Stelle bleibt als „???“ erhalten. Jedes Dossier beschreibt den eigenen Sanguinaris-Erreger, den Wandlungsprozess, Verhalten, Fähigkeiten, Gegenmittel und sechs zur Sprossform passende Vergleichswerte. Die kleinen Figuren stammen aus der gelieferten Übersicht. Für die zuvor bildlosen Dossiers wurden vier quadratische Aquarell- und Buntstiftszenen erstellt. Die korrigierte Nosphyr-Tafel zeigt zwei vollständige Arme, zwei getrennte Flügel und einen mittelalterlichen Ordensritter als Gegner. Bildquellen und Generierungshinweise stehen in `assets/bloodsucker-profile-sources.json`; alle Seiten entstehen mit `node Bestiarium/scripts/build-bloodsucker-profiles.mjs`.

## Besondere Tierexemplare

Neben Sturmbock und Mondläufer besitzt nun auch das Cuimhorn ein vollständiges Dossier unter `tiere/besondere/cuimhorn/`. Das morgornische Gebirgs- und Botentier erhält eigene Vergleichswerte für Personengedächtnis, Orientierung, Trittsicherheit, Botentreue, Ausdauer und Hitzetoleranz. Der nicht überlieferte Preis bleibt als `???` gekennzeichnet. Die bekannten Szenen- und Körperstudien werden getrennt vom neu erzeugten, transparenten Ganzkörper-Icon verwendet und überall ohne Beschnitt dargestellt.

Die Bildquellen und der Generierungshinweis für das Cuimhorn stehen zusammen mit den bisherigen besonderen Tieren in `assets/special-animal-profile-sources.json`. Alle drei Seiten entstehen über das gemeinsame Register mit `node Bestiarium/scripts/build-special-animal-profiles.mjs`.

## Nautiloidendossiers

Die Nautiloidenübersicht verlinkt Thraalkin und Sirenen auf vollständige Dossiers unter `wesen/nautiloiden/`; der Leviathan und alle wirklich unbekannten Stellen bleiben weiterhin vorgemerkt. Beide Artikel übernehmen die gelieferten Texte und getrennten Rollen für Artenfigur, Szenentafel und Zusatzabbildungen. Ihre Diagramme bewerten jeweils passende Merkmale: beim Thraalkin unter anderem Schwarmordnung und Tiefentoleranz, bei den Sirenen Lockgesang, Illusionsmacht und Lebensraub.

Die Sirenen-Galerie enthält beide überlieferten Artenfiguren und alle vier ergänzten Bonusbilder. Sämtliche Bilder liegen lokal unter `assets/nautiloid-profiles/`, ihre Quellen und Maße stehen in `assets/nautiloid-profile-sources.json`. Die Einzelseiten entstehen mit `node Bestiarium/scripts/build-nautiloid-profiles.mjs`; die gemeinsame Übersicht wird weiterhin über den Gruppendossier-Generator gebaut.

## Weitere infernale Gruppen

Die sechs Katalogtafeln Aelvar, Unholde, Nautiloiden, Sylvaniiden, Infestiiden und Psioniden führen nun zu eigenen Gruppendossiers unter `wesen/gruppen/`. Zusammen bewahren sie 70 Stellen der alten Artenraster: 39 benannte Formen mit ihren korrekt zugeordneten Abbildungen und 31 weiterhin offene Einträge als „???“. Untergruppen wie Relikte, einzigartige Unholde, korrumpierte Ahnenwächter oder nautiloide Kreaturen erscheinen als sachliche Registergruppen; sie verwenden keine Rangpfeile. Hierarchische Stufen bleiben den Kreaturenordnungen vorbehalten, deren Lore tatsächlich eine Rangfolge nennt.

Jede Gruppe besitzt ein eigenes Diagramm mit passenden Begriffen, mindestens elf Einträge in der rechten Wissenswertes-Spalte sowie ausgearbeitete Einführung, Hintergründe, Begegnungshinweise und Trivia. Die Psioniden werden deshalb über Schwarmkopplung, Willensdruck und Netzstörung bewertet, die Aelvar über Täuschung, Matronenmacht und Göttinnenbindung und die Unholde über Jagdtrieb, Anpassung und Korruptionsgefahr.

Die 42 gelieferten Bilddateien sowie zwei ergänzte Motive liegen unter `assets/creature-group-profiles/` und werden überall mit `object-fit: contain` und weichem Schlagschatten dargestellt. Das gezeigte Geweihwesen ist dem Tschort zugeordnet. Für den benannten, zuvor bildlosen Leviathan entstand ein vollständiges 2:3-Artenbild; für die Aelvar wurde das fehlende quadratische Themenbild mit drei vollständig sichtbaren Figuren ergänzt. Quellen, Originalmaße und die beiden Generierungshinweise stehen in `assets/creature-group-profile-sources.json`.

## Sylvaniidendossiers

Waldschrat, Erlschrat und Zatrakin besitzen vollständige Einzeldossiers unter `wesen/sylvaniiden/`. Ihre Vergleichswerte folgen der jeweiligen Lore: Der Waldschrat wird nach Reviermacht, Totemrückkehr und Naturflüchen eingeordnet, der Erlschrat nach Zielbindung, Seelenspur und Fluchverderbnis und der Zatrakin nach Jagdkunst, Taktik und Willenskraft. Die Wissenswertes-Spalte steht in breiten Ansichten rechts neben dem Text.

Zarok und Hornling werden aus der Sylvaniidenübersicht mit ihren bereits vorhandenen kanonischen Dossiers bei den Ogroiden beziehungsweise Kobolden verknüpft. Die sechs unbekannten Stellen bleiben `???`. Waldschrat und Zatrakin verwenden ihre gelieferten Szenentafeln; für den bildlosen Erlschrat wurde anhand seiner Artenfigur eine quadratische Aquarell- und Buntstiftszene erzeugt. Quellen, Maße und Generierungsangaben stehen in `assets/sylvanid-profile-sources.json`. Die drei Seiten entstehen mit `node Bestiarium/scripts/build-sylvanid-profiles.mjs`.

## Inferniidendossiers

Die Seite `wesen/gruppen/inferniiden/index.html` trennt die Ordnung sichtbar in Dagons Teufelshierarchie und Sanguines Dämonenlinie. In Dagons Zweig stehen die Erzteufel gesondert über Dagonaren und Ignarii, darunter folgen Igniten und Nixhunde sowie Balors Sprösslinge Balgrath und Flickerlinge. Zwei nicht überlieferte Sprösslinge bleiben als `???` offen. Sanguines Zweig beginnt mit dem vorgemerkten Erzdämon, gefolgt von Sukkubus und Inkubus, Formwandlern, Lustlingen und Satyren.

Das Erzteufelregister unter `wesen/gruppen/erzteufel/` bewahrt Asharon, Malekar, Nashira, Tamaraon, Zabaron und Balor mit ihren Fürstentiteln und Aspekten. Neun neue Einzeldossiers liegen unter `wesen/inferniiden/`. Der bereits im Koboldregister ausgearbeitete Lustling bleibt ein gemeinsames kanonisches Dossier und wird aus beiden Übersichten verlinkt, damit seine Lore nicht doppelt gepflegt werden muss.

Alle 29 gelieferten Bilder werden lokal und ohne Beschnitt aus `assets/inferniid-profiles/` ausgeliefert. Die alte Flickerling-Seite verwendete irrtümlich die Balgrath-Szene; sie wurde durch eine neue quadratische Aquarell- und Buntstifttafel mit einem vollständig sichtbaren Flickerling ersetzt. Quellen, Maße und Generierungshinweis stehen in `assets/inferniid-profile-sources.json`. Die Einzelseiten und das Erzteufelregister entstehen mit `node Bestiarium/scripts/build-inferniid-profiles.mjs`, die gemeinsame Übersicht mit `node Bestiarium/scripts/build-creature-group-profiles.mjs`.

## Psionidendossiers

Lenker, Sucher, Lauerer, Schädling, Brütling und Wandler besitzen vollständige Einzeldossiers unter `wesen/psioniden/`. Der Schreibfehler „Laurerer“ aus der alten Tafel wurde dabei auf die bereits in der Übersicht verwendete Form „Lauerer“ berichtigt. Der psionidische Schädling erhält ein eigenes Dossier und bleibt dadurch klar vom gleichnamigen Kobold getrennt; die vier unbekannten Stellen des Gruppenregisters bleiben als `???` erhalten.

Jedes Diagramm beschreibt die jeweilige Schwarmfunktion: beim Lenker geistige Herrschaft und Körperhärte, beim Sucher Archivierung und Magiestörung, beim Lauerer Körperkraft und Willensleere, beim Schädling Zahl und Bauleistung, beim Brütling Entwicklung und beim Wandler Metamorphose. Artenfiguren und Titelbilder werden getrennt, lokal und vollständig dargestellt. Quellen und Maße der sechs gelieferten Titelbilder stehen in `assets/psionid-profile-sources.json`. Die Seiten entstehen mit `node Bestiarium/scripts/build-psionid-profiles.mjs`; die Übersicht wird über den Gruppendossier-Generator gebaut.

## Pferdezuchtbuch

Unter `tiere/pferde/zuchtbuch/` liegt das interaktive Zuchtbuch der Pferde Alerias. Es verbindet die 27 Rossmarktrassen mit ihren lokalen Dossiers, übernimmt deren sechs Leistungswerte, Lebensspannen und Marktpreise und berechnet daraus einzelne Fohlen mit natürlicher Streuung und seltenem Talent. Owain Draig deutet das Ergebnis über den bestehenden KI-Dienst immersiv; bei einem nicht erreichbaren Dienst bleibt eine lokale Archivdeutung verfügbar. Eigene Fohlen und selbst benannte Kreuzungen werden ausschließlich im Browser gespeichert. Bereits unter `rmskt_zb2` abgelegte Namen aus der alten Rossmarkt-Matrix werden automatisch in die neue symmetrische Matrix übernommen.

Die vollständige symmetrische 27×27-Matrix enthält alle 351 möglichen Rassenpaare. Sie hebt die fünf alten Rossmarktnamen Hochblut, Kronforst, Kronhest, Roh-Rhyfel und Edelsale sowie die in den Dossiers belegten Zuchtlinien Brycing und Tirashan hervor. Roh-Rhyfel verweist zusätzlich auf die später gefestigte Rhyfel-Linie. Datenaufbereitung, Rechenmodell, Speicherung, KI-Zugriff und Oberfläche bleiben als getrennte Module unter `modules/horse-breeding/` gekapselt. Die Seite entsteht mit `node Bestiarium/scripts/build-horse-breeding.mjs`.

Das Zuchtarchiv verwendet ein eigenes transparentes Aquarellsymbol mit einer vollständig sichtbaren Stute und ihrem Fohlen. Die PNG-Datei liegt unter `assets/icons/horse-breeding.png`; Maße, Transparenz und der verwendete Generierungsprompt sind in `assets/horse-breeding-icon-source.json` dokumentiert.

## Bilder

Alle 42 Bildtafeln wurden einzeln mit dem integrierten `image_gen` erzeugt. Der gemeinsame Aquarell-Stil und die einzelnen Motiv-Prompts stehen in `assets/icon-prompts.json`. Optimierte lokale WebP-Dateien liegen in `assets/icons/`. Das zusätzliche Sidebar-Symbol `../IconOrdner/ReiterIcons/Bestiarium-register.webp` orientiert sich an den bestehenden sepiafarbenen Almanach-Reiterbildern. Die Originalausgaben bleiben im Codex-Ordner `generated_images` erhalten; die ausgelieferten Dateien sind davon unabhängig.

Das Banner stammt aus dem vom Nutzer vorgegebenen Bild `https://i.imgur.com/bh0NH9A.png` und wird lokal ausgeliefert.

## Prüfen

`node --test Bestiarium/tests/catalog.test.mjs`

`node --test Bestiarium/tests/creature-profiles.test.mjs`

`node --test Bestiarium/tests/creature-group-profiles.test.mjs`

`node --test Bestiarium/tests/topic-articles.test.mjs`

`node --test Bestiarium/tests/natural-species.test.mjs`

`node --test Bestiarium/tests/horse-profiles.test.mjs`

`node --test Bestiarium/tests/horse-breeding.test.mjs`

`node --test Bestiarium/tests/predator-profiles.test.mjs`

`node --test Bestiarium/tests/livestock-categories.test.mjs`

`node --test Bestiarium/tests/pet-breeds.test.mjs`

`node --test Bestiarium/tests/dog-profiles.test.mjs`

`node --test Bestiarium/tests/cat-profiles.test.mjs`

`node --test Bestiarium/tests/reptile-profiles.test.mjs`

`node --test Bestiarium/tests/kobold-profiles.test.mjs`

`node --test Bestiarium/tests/ogroid-profiles.test.mjs`

`node --test Bestiarium/tests/vampire-profiles.test.mjs`

`node --test Bestiarium/tests/bloodsucker-profiles.test.mjs`

`node --test Bestiarium/tests/inferniid-profiles.test.mjs`

`node --test Bestiarium/tests/nautiloid-profiles.test.mjs`

`node --test Bestiarium/tests/special-animal-profiles.test.mjs`

`node --test Bestiarium/tests/sylvanid-profiles.test.mjs`

`node --test Bestiarium/tests/psionid-profiles.test.mjs`

Vom Repository-Stamm über einen statischen HTTP-Server `Bestiarium/index.html` öffnen. Filter und Namenssuche, Themenvorschauen, Escape/Schließen mit Fokus-Rückgabe, Kapitelwechsel nach aktiver Suche und schmale Ansichten prüfen. Geänderte Modul-URLs erhalten wie im Almanach einen neuen Cache-Parameter.
