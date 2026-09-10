# Wiederverwendbare Bücher · Aleria

Stand: 9. September 2026. Erstes Werk: [Das Wesen des Infernalen](../../themen/wesen-des-infernalen/index.html).

## Integration und Verantwortung

Die vorhandene `topic-article`-Vorlage ist die Grundlage. `presentation: "book"` wählt deren Buchvariante. Masthead, Breadcrumbs, Bestiarium-Navigation, Pergamentfarben und Fußzeile bleiben im bestehenden Seitenaufbau. Die Buchansicht sitzt im Inhaltsbereich; sie ist kein Dialog und kein eigener Router.

Es gibt weiterhin **ein** Themenregister (`topic-article-registry.mjs`), einen Generator (`build-topic-articles.mjs`) und den bestehenden Vite-Einstieg über dieses Register. Der bisher vorgemerkte Literaturverweis in `topic-board-data.js` besitzt jetzt seinen lokalen `href`. Die sechs bisherigen Themenartikel erzeugen weiterhin dasselbe HTML.

Die Bestiariumsseiten sind statische, aus JSON erzeugte HTML-Seiten. Ihr Datenweg ist unabhängig von den Firebase-gestützten Almanach-Editoren. Diese Änderung verwendet weder Firebase noch Browser-Speicher, verändert keine Datenbank und benötigt keine Anmeldung. Sie fügt kein Framework hinzu.

| Datei | Verantwortung |
| --- | --- |
| `themen/<id>/thema.json` | Einzige redaktionelle Quelle, Fakten, Kapitel, stabile Absatz-IDs |
| `book-content.mjs` | Semantisches HTML, erlaubte Textauszeichnungen, URLs und Blocktypen |
| `book-article-template.mjs` | Artikelkopf, Inhaltsverzeichnis, Ansichtsumschalter, Einband und Leserbereich |
| `book-pagination.mjs` | DOM-Messung, Textfragmente, Tabellenaufteilung, übergroße Inhalte und Ankersuche |
| `book-reader.css` | Buchmaterial, Satzspiegel, Falz, Seitenkanten, Einband und schmale Darstellung |
| `book-animation.mjs` | Ausschließlicher Zugriff auf StPageFlip, Eckengesten, Seitenzugänglichkeit und Instanzabbau |
| `book-reader.mjs` | Lokal gekapselter Leserzustand, Fokus, Ansichtswechsel, Asset- und Größenänderungen |
| `book-license-build.mjs` | Mitliefern der vollständigen Lizenz im Vite-Produktionsbuild |

## Neues Werk anlegen

1. `Bestiarium/themen/<id>/thema.json` nach dem ersten Werk anlegen. `presentation` auf `book` setzen; die `id` entspricht dem Verzeichnis. Titel, Klassifikation, Einleitung, Fakten und `book`-Metadaten redaktionell ausfüllen.
2. Die ID in **das vorhandene** `modules/topic-article/topic-article-registry.mjs` aufnehmen. Dadurch kennt Vite die Seite ebenfalls.
3. Den passenden bestehenden Themen-/Literaturverweis mit `./themen/<id>/index.html` verknüpfen. Beim Ergänzen neuer Verweise bleibt `topic-board` verantwortlich.
4. `node Bestiarium/scripts/build-topic-articles.mjs` ausführen. Das erzeugte `index.html` nicht separat bearbeiten.
5. Mit `--check` sowie den unten genannten Tests prüfen. Die `v=`-Kennung geänderter Browser-Einstiege bei späteren Veröffentlichungen aktualisieren.

Minimale Kapitelstruktur:

```json
{
  "id": "einleitung",
  "title": "Einleitung",
  "blocks": [
    { "id": "einleitung-absatz-01", "type": "paragraph", "content": ["Überlieferter Text."] }
  ]
}
```

`book` enthält `author`, `edition` und optional `sourceNote` sowie redaktionelle Herkunftsangaben. Mit `coverImage: { "src": "../../assets/book-covers/werk.png", "alt": "…", "width": 1024, "height": 1536 }` ersetzt ein eigenes Einbandbild die separate Verzierung und Beschriftung. Dasselbe Bild erscheint am festen Vorderdeckel und am geschlossenen Buch. Optional lässt sich `backCoverImage` im selben Format ergänzen; bei bebildertem Vorderdeckel bleibt der hintere Deckel sonst schlichtes Leder. Werke ohne Bild verwenden weiterhin den gesetzten Einband.

`facts` sind die bereits verwendeten `{ "label": "…", "value": "…" }`-Einträge. Einfache bestehende Kapitel können weiterhin `paragraphs: ["…"]` nutzen; für langfristig beständige Absatzanker und reichhaltige Inhalte sind explizite `blocks` vorzuziehen.

Erlaubte Blocktypen: `paragraph`, `heading` (Unterüberschrift), `quote` (optionales `cite`), `list` (`ordered`, `items`), `figure` (`src`, `alt`, `width`, `height`, `caption`) und `table` (`caption`, `columns`, `rows`). Inhalte sind Strings oder Arrays aus Strings und `{type: "strong" | "em" | "code", children: [...]}`, `{type: "break"}` oder `{type: "link", href: "#kapitel-id", children: [...]}`. Quell-HTML wird nicht ungeprüft eingesetzt; unbekannte Typen, doppelte IDs und ausführbare URLs werden abgewiesen. Lokale Medien-/Seitenpfade beginnen mit `./`, `../` oder `/`; außerdem sind HTTPS/HTTP und bei Links `mailto:` zugelassen.

IDs bleiben bei redaktionellen Änderungen stabil. Ein Abschnitt erhält seine eigene ID, ebenso jeder Absatz, jede Liste, Abbildung und Tabelle. Neue Bücher benötigen keine eigene Animationslogik.

## Seitenaufteilung und Leseposition

Die vollständige Artikelquelle steht bereits im statischen HTML. Nur ihre DOM-Kopien werden für das Buch vermessen und gesetzt; der Originalartikel wird beim Ansichtswechsel eingeblendet. Dadurch funktioniert er auch ohne JavaScript oder bei einem Fehler beim Laden der Animationsbibliothek.

- Die Messseite verwendet exakt dieselbe Breite, Höhe, Typografie und denselben Satzspiegel wie die fertige Seite. Unter 760 Pixeln verfügbarem Buchraum wird eine Einzelseite verwendet. Der Buchtext steht auf Wunsch in etwas kleineren 15 Pixeln; es wird kein Textbild skaliert.
- Jede redaktionelle Überschrift beginnt eine neue Buchseite, auch Unterüberschriften. Der Neusatz bei Größen- und Schriftänderungen erhält diese Regel. Auf eine bestimmte rechte oder linke Buchseite wird der Kapitelbeginn nicht festgelegt.
- Absätze und Zitate werden bei Bedarf an Wortgrenzen mit DOM-Ranges geteilt. Hervorhebungen, Links und explizite Zeilenumbrüche bleiben erhalten. Kurze Restzeilen werden vermieden.
- Tabellen werden zwischen Zeilen geteilt und wiederholen den Tabellenkopf. Überbreite Tabellen sind horizontal scrollbar. Übergroße Zeilen, lange Listen, nicht teilbare Blöcke und ungewöhnliche eingebettete Elemente bekommen eine eigene, beschriftete Scrollregion. Sie werden niemals still abgeschnitten. Komplexe Tabellen mit `rowspan` werden vollständig in dieser Region dargestellt.
- Bilder werden proportional eingepasst, bleiben unbeschnitten und verlinken die Originaldatei; ihre Bildunterschriften bleiben HTML. Reicht der Platz für Abbildung und Beschriftung nicht aus, gilt ebenfalls die sichtbare Scrolllösung.
- Eine explizite Schlussseite wird bei ungerader Inhaltsseitenzahl eingefügt, damit der hintere feste Einband eine eigene Seite erhält.
- Vor dem ersten Satz werden `document.fonts.ready` und Bildabschluss/-fehler abgewartet. `loadingdone`, Bildereignisse, `ResizeObserver` und die Fensterhöhe lösen einen verzögerten Neusatz aus. Eine aktive Textauswahl wird dabei zunächst erhalten.
- Die Position besteht aus stabiler Block-ID und Zeichenoffset, bei Tabellen aus einem Zeilenoffset. Nach Neusatz wird das passende Fragment wieder geöffnet, statt dieselbe, jetzt anders belegte Seitennummer anzuspringen. Kapitel-URLs und Browser-Zurück/Vorwärts bleiben normale Hash-Navigation. Beim Wechsel zum normalen Artikel wird der zugehörige Absatz fokussiert.

## Bedienung und Lebenszyklus

Vor/Zurück, die unteren äußeren Ecken und Ziehen an diesen Ecken blättern. Text, Links, Formularelemente und Scrollregionen initiieren keine Buchgesten. Die mobile Geste wird auf die intern weiterhin vorhandene Doppelseite abgebildet; der Finger muss nicht über den Bildschirmrand ziehen. Vertikale Gesten auf dem Text scrollen normal.

Im Leserbereich: Pfeiltasten und Bildauf/Bildab, Pos1 zum Einband, Ende zum hinteren Einband, Escape zum Schließen. Textauswahl, Eingabefelder und lokale Scrollregionen behalten ihre normale Tastaturbedienung. Verdeckte Buchseiten sind `inert` und `aria-hidden`; Kapitelverweise fokussieren ihr Ziel. Schließen fokussiert „Buch aufschlagen“. Es gibt keine Fokusfalle.

Bei `prefers-reduced-motion: reduce` wird ausschließlich der vollständige Artikel gezeigt. Eine während des Lesens aktivierte Präferenz baut die laufende Buchinstanz ab. Drucken zeigt ebenfalls den Artikel.

Schließen/Artikelansicht brechen die aktuelle Sitzung ab: ResizeObserver, Größen-/Schrift-/Bildlistener, Pointerlistener, Timer, Bibliotheksinstanz, Seitenkopien und Animationsframe werden entfernt. Nur die für erneutes Öffnen benötigten Listener des Leserbereichs bleiben bestehen. `destroy()` des Mount-Controllers entfernt auch diese. `pagehide` und Wiederherstellung aus dem Back/Forward-Cache sind berücksichtigt.

## Technische Grundlage und Lizenzen

Verwendet wird ausschließlich **StPageFlip / `page-flip` 2.0.7**, HTML-Modus, Copyright © 2020 Nodlik, MIT. Die konkrete Lizenz wurde im heruntergeladenen npm-Paket vor der Übernahme geprüft: [Projekt](https://github.com/Nodlik/StPageFlip), [npm-Archiv 2.0.7](https://registry.npmjs.org/page-flip/-/page-flip-2.0.7.tgz), [Original-Lizenz](https://github.com/Nodlik/StPageFlip/blob/master/LICENSE). Keine CDN-Abhängigkeit zur Laufzeit. Das Paket besitzt keine Produktionsabhängigkeiten.

Die [StPageFlip-Demo](https://nodlik.github.io/StPageFlip/demo.html) diente zur Prüfung von HTML-Seiten, festem Einband, Einstellungen und Bewegung. Es wurden weder ihre Demo-Anwendung noch ihre Texte/Bilder übernommen. Die eigene Gestaltung verwendet Alerias Pergamentfarben und Georgia mit Leder-/Goldtönen und zurückhaltenden CSS-Schattierungen.

Die anderen Referenzen wurden getrennt bewertet:

| Referenz | Verwendung und Lizenzstand |
| --- | --- |
| [Codrops BookPreview](https://github.com/codrops/BookPreview) | Anschauung für Einband und Öffnung. Das Repository nennt eine eigene Nutzungsklausel und unterschiedliche Bildlizenzen; die [aktuelle allgemeine Codrops-Lizenzseite](https://tympanus.net/codrops/licensing/) nennt MIT mit Ausnahme abweichender Angaben. Keine Code- oder Assetübernahme; keine pauschale Lizenzannahme für sämtliche Bestandteile. |
| [iberezansky/flip-book-jquery](https://github.com/iberezansky/flip-book-jquery) | Anschauung für räumliche Seitenbewegung. Das geprüfte [LICENSE](https://github.com/iberezansky/flip-book-jquery/blob/master/LICENSE) enthält GPL v2. Keine Übernahme und keine Installation. |
| [wass08/r3f-animated-book-slider-final](https://github.com/wass08/r3f-animated-book-slider-final) | Anschauung für flexible Seiten und räumliche Wirkung. Im geprüften Repository keine ausdrückliche Lizenzdatei gefunden; Nutzungserlaubnis für Code/Assets nicht geklärt. Ausschließlich Anschauung. Kein React-/Three.js-Stack übernommen. |

`vendor/LICENSE` enthält den vollständigen Originaltext. `vendor/provenance.json` hält Version, Archiv-URL und SHA-256 der unveränderten Moduldatei fest. Die ausgelieferte Moduldatei trägt ebenfalls den vollständigen Lizenztext. Der Vite-Build schreibt zusätzlich `licenses/stpageflip-2.0.7-LICENSE.txt`, weil Minifizierung Kommentare entfernen kann und vendorte Dateien nicht automatisch als npm-Abhängigkeit erkannt werden.

Lokale Korrektur `aleria-lifecycle-1`: Upstream beendet den rekursiven `requestAnimationFrame` nicht in `destroy()`, entfernt bei `useMouseEvents: false` den Resize-Listener nicht und lässt den verzögerten Init-Callback stehen. Der kleine reproduzierbare Patch speichert/cancelt den Frame, entfernt die Handler unabhängig von Mausgesten und cancelt den Init-Timer. Keine Änderung an der Seitengeometrie. `node Bestiarium/scripts/vendor-page-flip.mjs <Verzeichnis mit originaler page-flip.module.js und LICENSE>` reproduziert die lokale Datei nach Prüfsummenprüfung. Bei einem Versionswechsel müssen Patch und Browser-Abnahme neu geprüft werden.

## Herkunft des ersten Werks

Die vom Nutzer gelieferte alte HTML-Tafel ist vollständig als Inhalt übertragen: 44 Absätze in Einleitung (3), Überlieferung (7), Analyse (5) und fünf Kapiteln (6/7/5/5/6). Titel und alle sechs Buchinformationen bleiben erhalten. Hervorhebungen und Zeilenumbrüche stammen aus der Vorlage. Sie enthält keine Bilder und keine Links; Bild- und Linkfälle wurden mit deutlich als Testdaten bezeichneten Prüfinhalten getestet.

Entfernt wurden lediglich leere Layoutabsätze, Layouttabellen und nicht ausgefüllte Punkte-/Zitat-/Bandplatzhalter. „DAnalyse“ im alten Inhaltskasten wird als „Analyse“ geführt. Unbekannter Autor, unklare Sprache/Epoche und fehlende Bandangaben bleiben als solche erkennbar. Es wurden keine Lore-Kapitel, Zitate oder Abbildungen erfunden. SHA-256 der gelieferten Datei steht unter `book.source.sha256` in `thema.json`.

Auf anschließenden Nutzerwunsch wurde mit dem integrierten `image_gen` ein antikes Cover mit rissigem Leder, verwitterten Metallbeschlägen und eingeprägtem Titel erzeugt. Die lokale Projektdatei ist `Bestiarium/assets/book-covers/wesen-des-infernalen.png` (1024 × 1536 Pixel). Der vollständige Erzeugungsprompt und die Herkunft sind in [assets/book-cover-sources.json](../../assets/book-cover-sources.json) dokumentiert. Das Bild ist Einbandgestaltung, keine neue Lore-Abbildung innerhalb des überlieferten Textes. Der im Bild integrierte Titel ersetzt die HTML-Beschriftung des Vorderdeckels; es gibt keine zusätzliche Textüberlagerung.

Der passende Rückdeckel liegt unter `Bestiarium/assets/book-covers/wesen-des-infernalen-rueckseite.png` (1024 × 1536 Pixel) und wird über `book.backCoverImage` eingebunden. Er wurde mit dem integrierten `image_gen` aus dem Vordercover als Material- und Gestaltungsreferenz abgeleitet: gleiche gealterte Beschläge und rissiges Leder, ein kleines zentrales Ornament und keine Beschriftung. Referenz und vollständiger Prompt stehen ebenfalls im Cover-Quellenverzeichnis. Beide Deckel verwenden die bestehende Buchvorlage.

## Abnahme

```powershell
node Bestiarium/scripts/build-topic-articles.mjs --check
node --test --experimental-test-isolation=none Bestiarium/tests/catalog.test.mjs Bestiarium/tests/topic-articles.test.mjs Bestiarium/tests/book-reader.test.mjs
node Bestiarium/tests/book-reader.browser.mjs <Pfad-zu-playwright/index.mjs>
```

Der Browser-Abnahmelauf verwendet einen eigenen lokalen HTTP-Server, eine bereits installierte Playwright-Version und Chromium. Er verändert keine echten Daten. Ohne expliziten Modulpfad wird ein regulär verfügbares `playwright` importiert; die Anwendung selbst benötigt Playwright nicht.

Ergebnisse am 09.09.2026:

- 16 Node-Tests bestanden; alle sieben erzeugten Themenartikel sind aktuell. Die bisherigen sechs Themenseiten sind unverändert.
- Desktop 1440 × 1000, Neusatz 1280 × 900 und schmale/touchfähige Ansicht 390 × 844 geprüft. Mit 15-Pixel-Schrift und jeweils neuer Seite für Überschriften besitzt das erste Werk 20 beziehungsweise 26 Inhaltsseiten; Seitenzahlen sind bewusst nicht fest verdrahtet.
- 12 Browser-Prüfgruppen bestanden: Einstieg über den vorhandenen Literaturverweis; Buttons/Tastatur; Vorder-/Rückeinband; echte Maus-Textauswahl; organischer Eckenzug; Kapitel- und direkte Fragmentlinks; Fokus und Ansichtstausch; Größenänderung; acht Öffnen-/Schließen-Zyklen mit instrumentierten RAF-/Resize-Zählern; lange formatierte Absätze; 65 Tabellenzeilen mit wiederholten Köpfen; breite Tabellen; Bilder/Bildunterschriften; 85 Listeneinträge; spät geladene Schrift; reduzierte Bewegung auch beim Umschalten; JavaScript-aus; Touch vor/zurück und vertikales Scrollen; verzögerte Bilder; unterbrochenes Öffnen; fehlende Animationsdatei.
- Der Browser vergleicht jeden Quellblock mit seinen zusammengesetzten Seitenfragmenten und prüft, dass keine Überschrift einen vorhergehenden Inhalt auf derselben Seite besitzt. Das Einbandbild wird tatsächlich geladen; die alte HTML-Inschrift ist beim bebilderten Einband nicht mehr vorhanden. Kein verlorener Text, keine doppelten IDs, kein Satzspiegel- oder horizontaler Dokumentüberlauf in den geprüften Leseansichten. Keine unerwarteten Browserfehler.
- Gezielter Vite-8.2.0-Produktionsbuild für Bestiarium und alle sieben Themenartikel erfolgreich; vollständiger MIT-Lizenztext im Ergebnis vorhanden. Das erzeugte HTML, der dynamisch geladene gebündelte Bibliotheks-Chunk und ein Seitenwechsel wurden zusätzlich im Browser geprüft. Kein Deployment ausgeführt.
- Screenshots und lokale Build-Artefakte liegen im ignorierten Verzeichnis `.codex-temp/book-reader/`.

## Grenzen

- Browser-Abnahme erfolgte mit Chromium/Playwright 1.61.1 und emuliertem Touch; ein echter iOS-/Android-Gerätetest sowie Safari-/Firefox- und Screenreader-Abnahme stehen noch aus.
- Sehr große unteilbare Inhalte werden innerhalb ihrer Seite scrollbar. Das ist eine ausdrücklich sichtbare Erhaltungsstrategie, keine vollständige typografische Zerlegung beliebiger komplexer Tabellen/Formulare. Solche Werke können jederzeit als normaler Artikel gelesen werden.
- Die ganze Quelle und die gesetzten Seiten liegen während des Lesens im DOM. Für mehrere hundert oder tausend Seiten wäre eine separate, mit Ankern abgestimmte Virtualisierung zu prüfen. Der aktuelle Test umfasst den echten langen Artikel und zusätzliche umfangreiche Prüfinhalte.
- Die Leseposition gilt für die aktuelle Sitzung und Ansichts-/Größenwechsel. Kapitel-Hashes sind teilbar; dauerhafte persönliche Lesezeichen werden nicht gespeichert.
- Einbandwechsel über Pos1/Ende und direkte Kapitelwechsel springen gezielt. Der eigentliche Seitenwechsel über Ecken, Gesten und Vor/Zurück verwendet die flexible/feste StPageFlip-Geometrie. Reduzierte Bewegung bietet bewusst die Artikelansicht.

## Geänderte Dateien

Neu: dieses `modules/book-reader/` mit den oben beschriebenen Modulen, CSS, vendorter Bibliothek/Lizenz/Provenienz; `scripts/vendor-page-flip.mjs`; `tests/book-reader.test.mjs`; `tests/book-reader.browser.mjs`; `themen/wesen-des-infernalen/thema.json` und das erzeugte `index.html`.

Angepasst: `modules/topic-article/topic-article-template.mjs` (optionale Buchvariante), `topic-article-registry.mjs` (bestehendes Register), `modules/topic-board/topic-board-data.js` (Literaturziel), `topic-board-ui.js`, `bestiarium-page.js` und `Bestiarium/index.html` (Cache-Einstiege), `tests/topic-articles.test.mjs` (sechs bestehende Sphärenartikel gesondert prüfen), `Bestiarium/README.md` und `AleriaAlmanach/vite.config.mjs` (Lizenzartefakt).

Andere im Arbeitsverzeichnis vorhandene Änderungen gehören nicht zu dieser Buchimplementierung.
