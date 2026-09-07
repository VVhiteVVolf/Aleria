# Bestiarium von Aleria

Die neue Hauptseite ist `index.html`. Das linke Almanach-Register verlinkt direkt dorthin. Sie funktioniert als eigenständige statische Seite ohne Firebase, Anmeldung, Build-Schritt oder Browser-Speicher und ist zusätzlich als Vite-Einstieg registriert.

## Verantwortung und spätere Erweiterung

- `modules/catalog`: die fünf Kapitel, 42 individuelle Bildtafeln, Suche, Filter und Darstellung der Wesen.
- `modules/topic-board`: die 13 Themen- und Literaturverweise sowie ihre Darstellung als Themenwand.
- `modules/entry-preview`: gemeinsame Vorschau und die Entscheidung zwischen Vorschau-Button und vorhandenem Seitenlink.
- `modules/book-shell`: gemeinsame Pergamentfarben, Typografie, Navigation und Fußzeile für Haupt- und Profilseiten.
- `modules/creature-profile`: wiederverwendbare statische Profilvorlage, Profilregister und Anbindung der Vorschauen.
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

## Bilder

Alle 42 Bildtafeln wurden einzeln mit dem integrierten `image_gen` erzeugt. Der gemeinsame Aquarell-Stil und die einzelnen Motiv-Prompts stehen in `assets/icon-prompts.json`. Optimierte lokale WebP-Dateien liegen in `assets/icons/`. Das zusätzliche Sidebar-Symbol `../IconOrdner/ReiterIcons/Bestiarium-register.webp` orientiert sich an den bestehenden sepiafarbenen Almanach-Reiterbildern. Die Originalausgaben bleiben im Codex-Ordner `generated_images` erhalten; die ausgelieferten Dateien sind davon unabhängig.

Das Banner stammt aus dem vom Nutzer vorgegebenen Bild `https://i.imgur.com/bh0NH9A.png` und wird lokal ausgeliefert.

## Prüfen

`node --test Bestiarium/tests/catalog.test.mjs`

`node --test Bestiarium/tests/creature-profiles.test.mjs`

Vom Repository-Stamm über einen statischen HTTP-Server `Bestiarium/index.html` öffnen. Filter und Namenssuche, Themenvorschauen, Escape/Schließen mit Fokus-Rückgabe, Kapitelwechsel nach aktiver Suche und schmale Ansichten prüfen. Geänderte Modul-URLs erhalten wie im Almanach einen neuen Cache-Parameter.
