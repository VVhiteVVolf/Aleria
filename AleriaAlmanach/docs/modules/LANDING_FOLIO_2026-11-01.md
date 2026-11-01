# Landingpage-Vorlage: Abenteuerfolio

Die allgemeine Vorlage erhält eine neue, ausdrücklich auswählbare Darstellung.
Neue normale Landingpages und neu angelegte Gruppenübersichten beginnen als
Abenteuerfolio. Bestehende Seiten ohne Darstellungskennung bleiben klassisch;
gespeicherte Inhalte werden nicht automatisch umgestaltet oder migriert.

## Gestaltung

- Eigenes breites Landschaftspanorama, dunkle grüne Titelfläche und feine
  goldene Rahmung. Das neutrale Bild ist eine dekorative Landschaft und keine
  neue kanonische Ortskarte.
- Helles, zurückhaltend texturiertes Pergament und ruhige Buchtypografie.
- Runde Ausschnitte der tatsächlich hinterlegten Figurenporträts; normale
  Landingpages verwenden den vorhandenen bronzenen Ornamentrahmen.
- Kapitelzugänge zu Gefährten, Abenteuern, Karte und Chronik. Die Gruppenvariante
  behält zusätzlich Reise-/Sitzungsstand sowie Güter und Kasse als eigene Reiter.
- Gemeinsames Questjournal mit aktiven Wegen und abgeschlossener Chronik;
  vorhandene eigene Planungsaufgaben bleiben separat erreichbar.
- Karten und Hinweise als Randspalte, auf schmalen Bildschirmen unter dem
  Hauptinhalt. Kein horizontaler Seitenüberlauf bei der geprüften Breite von
  390 CSS-Pixeln; die sechs Gruppenreiter bleiben horizontal erreichbar.

## Verwendung

Im Seiten-, Modul-, Inline- oder Gruppeneditor unter **Darstellung** zwischen
**Abenteuerfolio** und **Klassisch** wählen. Das **Coverbild** ist ein eigenes
Breitbild (`coverImage`); das bisherige `bannerImage` bleibt als Wappen/Siegel
erhalten. Ohne eigenes Cover verwendet ausschließlich das Folio die neue
Standardillustration. Eigene Namen, Mitglieder, Karten, Quests und Texte werden
aus den vorhandenen Daten übernommen. Gawain und seine Gefährten sind keine
fest eingebaute Standardgruppe.

## Zuständigkeiten und Erhaltung

`modules/landing/landing-model.js` normalisiert `presentation` und `coverImage`.
Fehlende oder unbekannte Darstellungswerte bedeuten `classic`; nur Neuanlagen
wählen ausdrücklich `folio`. Die bestehenden Editoren erhalten diese Werte
auch dann, wenn ein älteres Formular die neuen Felder noch nicht enthält.

`landing-folio-view.js` besitzt den gemeinsamen reinen Titelbereich, die
Kapitelzugänge und die gezeichneten SVG-Symbole. Die stateless Classic-Fassade
wird weiterhin mit `scripts/build-landing-model.mjs` erzeugt. Der normale
Renderer und die Gruppenansicht verwenden denselben Kopfbereich.
`landing-folio.css` ist vollständig auf die neue Darstellung begrenzt.

Erhalten bleiben DOM-Livehosts, Gruppenreiter samt Tastaturnavigation, Lazyload
der interaktiven Karte, Questmount/-unmount, getrenntes Questbelohnungskonto,
manuelles Kassenbuch und vorhandene Aktionskennungen. Eine kleine zusätzlich
gefundene Bildkorrektur verhindert doppelte HTML-Escapes in Bild-URLs mit
Queryparametern; eigene Cover und Avatare behalten dadurch ihre richtigen URLs.

## Bilder und Nachweise

Das neue Panorama wurde mit dem integrierten Imagegen und dem vorhandenen
Anime-Szenenpreset erzeugt. Die aktive WebP-Fassung ist 2046 × 682 Pixel groß
und etwa 427 KiB schwer. PNG und unverändertes Original bleiben erhalten;
das Originalarchiv unter `.source/` wird gemäß bestehender Releasepolicy nicht
statisch ausgeliefert. Prompt, Herkunft und Prüfsummen:
[`art-manifest.json`](../../assets/landing-folio/art-manifest.json).

Die ausdrücklich gekennzeichnete, schreibfreie
[Gestaltungsvorschau](http://127.0.0.1:8765/diagnostics/landing-folio-2026-11-01/preview.html)
verwendet die Produktionsrenderer mit lokalen Beispieldaten. Sie erlaubt den
Vergleich von normalem Folio, Gruppenfolio, klassischem Bestand und leerer
Vorlage, ohne eine Figurengruppe oder Quest online anzulegen.

Geprüft wurden Editor-Roundtrips, Legacy-Erhaltung, Cover-/Siegeltrennung,
Bild-URL-Sicherheit, einmalige Livehosts, sechs zusammenpassende ARIA-Reiter,
Sprungnavigation mit Fokus/Reduced Motion sowie bestehende Quest-/Gruppenabläufe.
Im Browser wurden Desktop und Mobilansicht, aktive/archivierte Quests,
Gruppenreiter sowie leere/klassische Varianten betrachtet. Belege und lokale
Prüflogs liegen unter `diagnostics/landing-folio-2026-11-01/`.

Keine produktiven Spielstände geändert; kein Push oder Deploy.
