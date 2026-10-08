# Albische Clans — Herkunft, Namen & Präfixe

Redaktionsstand: 8. Oktober 2026. Das Modul liegt zusammen mit der albischen Gastfreundschaft unter dem vorhandenen Reiter **Sitte & Etiquette** und verwendet dessen quadratisches Icon.

## Quellen und Grenzen

- `source-text.txt`: inhaltlich unveränderte Nutzervorlage (abschließende Leerzeichen entfernt) zu Clan, Sept und 21 Präfixgruppen. Die Namenslehre ist die des Settings, keine Behauptung über reale gälische Namen.
- `clan-examples.mjs`: redaktionelle Auszüge aus den vorhandenen Familienakten in `Stammbäume/assets/js/data`, ausgewählt aus Leitheach, Blaithneach, Dunfal, Aislearneach und Ceitheach. Personen behalten ihre bestehenden IDs; die Auszüge dienen nur der Dokumentation und verändern keine Familienakten.
- Ua’Goidin/Nessa, Nuada/Nuadat, Goll/Morna, Liamach/Luchdon, Donnagh/Haeghra, Goraidh/Gáirnér, Pailtéar/Cléirigh und weitere Beispiele folgen den Akten einschließlich der Quellenabgleiche vom 7./8. Oktober.
- Für **Ri, Breac, Tair, Ord, Droch, Toir und Díth** gibt es in den untersuchten Registern keinen eindeutig belegten Träger. Der Nutzer hat ausdrücklich hypothetische Anwendungen an bestehenden Clans gewählt. Jede betreffende Seite kennzeichnet ihren Absatz und ihr Bild als Gedankenbeispiel. Keine Umbenennung, Ächtung, Begnadigung, neue Abstammung oder Einsetzung wird dadurch kanonisch vollzogen.
- Historische Figuren (etwa Goraidhas Tordarroch und Balor Séaghdha) werden nicht als gegenwärtig lebend dargestellt. Cléirigh bleibt ausgestoßen, mit überlebendem Pailtéar; die begnadigten Duibhne-Angehörigen bleiben begnadigt. Duilb bleibt ausgestorben ohne erfundene letzte Erbperson.

## Gestaltung und Pflege

22 Storyseiten: Einführung, 15 herkömmliche und sechs ungewöhnliche Präfixgruppen. Varianten mit gleicher Bedeutung wie Ó/Ua stehen auf derselben Seite. Jede Seite besitzt eine eigene 2:3-Szene und einen Link zur verwendeten Familienakte. Die Bildlegenden trennen sinnbildliche Szenen von historischen Angaben.

Die bestehende Story-Darstellung übernimmt Layout, mobiles Scrollen, Seitenwahl und Bearbeitung. Neue CSS-Regeln, globale Zustände, Firebase-Schreibzugriffe oder eigene Dialogsysteme sind nicht nötig. Die gemeinsame Archivregistrierung ergänzt das Modul, erhält andere Einträge und ist wiederholbar.

Texte: `albic-clans-content.mjs`; Darstellung und Datenaufbereitung: `albic-clans-model.mjs`; generierte Browserdaten: `albic-clans-data.js`. Nach Textänderungen `npm run build:albic-clans` in `AleriaAlmanach` ausführen. Der reguläre Prebuild enthält diesen Schritt.

## Bilder

Alle 22 Szenen wurden mit dem eingebauten `image_gen` erzeugt und nach `public/assets/albische-clans` kopiert. Vollständige Prompts, Referenzporträts/Wappen und Originalpfade stehen in `image-prompts.json`. Stil: gespeicherte Vorlage `anime-scene-portrait`, Tales of Xillia/Frieren, 2:3, Anime-Lineart und Cel-Shading. Vorhandene Gesichter, Alter und Wappen dienen als Motivvorlagen; Kleidung und Umgebung sind altertümlich-gälisch. Ergrautes Haar bekannter älterer Figuren bleibt erhalten. Flanns Augen wurden entsprechend der allgemeinen Vorgabe braun statt des Violetts seines älteren Porträts dargestellt.

## Prüfung

`npm run check:albic-clans` prüft die generierte Datei. `npm run test:albic-clans` prüft vollständige Präfixabdeckung, Quellenbezug, Kennzeichnung der sieben Gedankenbeispiele, Wiederholbarkeit im bestehenden Reiter und individuelle Bilddateien samt Herkunft. Browserprüfung: alle Seiten auf Desktop und Mobilgerät, echte Scrollbewegung, erreichbarer letzter Absatz, Bildladung, Familienlinks und Bearbeitungs-/Export-Rundlauf.
