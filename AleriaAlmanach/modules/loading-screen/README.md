# Reise-Ladebildschirm

Der Almanach zeigt beim Öffnen eine Chibi-Reise mit Gawain rechts an der Spitze,
danach Freya und Guinevere, mit Abstand Fenrir. Gaul wurde auf Nutzerwunsch entfernt.
Landschaft und Himmel laufen unabhängig vom tatsächlichen Ladefortschritt.
Nach Abschluss bleibt der Bildschirm bis zum Klick oder Enter stehen.

## Verantwortung und Startsignale

`loading-screen.js` startet vor den Anwendungsskripten, verwaltet ausschließlich
den eigenen Dialog, die Startschritte, Fokus, Pause und Freigabe. Der bestehende
Almanach liegt in einem `display: contents`-Container und bleibt währenddessen
`inert`. Beim Verlassen werden Sichtbarkeit, ARIA-Attribute und Fokus wiederhergestellt.
Ohne das Ladeskript bleibt der Almanach zugänglich; die Ladeszene ist initial verborgen.

Die zwei erforderlichen Schritte sind `almanach:app-ready` nach dem lokalen
Rendern und `almanach:initial-modules-settled` nach dem ersten Modulabgleich.
Der Balken zählt diese beiden Startschritte, keine geschätzten Downloadprozente.
Der erste Modulabgleich bleibt erforderlich; eine Offline-Ausweichfassung wird
ausdrücklich als verfügbarer Stand bezeichnet, ohne einen erfolgreichen
Online-Abruf vorzutäuschen. `window.load`, Figuren-/Kreaturen-Ereignisse und
dekorative Grafiken sind keine Eintrittssperren. Weitere Inhalte können nach der
Freigabe im Hintergrund nachladen. Auch ein dauerhaft offener Bildabruf kann die
Freigabe des bereitstehenden Archivs nicht verhindern. Nach 15 Sekunden
erscheint eine ausdrückliche Weiter-Option, sobald das lokale Archiv bereit ist;
Startfehler bieten stattdessen Neuladen. Keine künstliche Mindestwartezeit.

Das HTML verwendet `progress max="2"` und die beiden
`data-loading-step`-Kennungen `shell` und `modules`. Die Anzeige beschreibt die
Startbereitschaft des Almanachs. Eine zusätzliche `data-loading-images`-Liste
ist nicht erforderlich; CSS lädt Landschaft und statische Ersatzposen.

Die neuen Signale greifen nicht auf Firebase zu und ändern keine Spielstände,
Online-IDs, Ressourcen, Würfe oder Kampfverläufe.

## Animation und Grafiken

`loading-screen-walk.js` setzt vollständige, geschlossene Körper- und Beinbilder
zusammen. Beide Beine schwingen kontinuierlich in Gegenphase durch dieselbe
Mittelposition und wechseln dabei ihre vordere/hintere Stellung. Ein Bein wird beim
Vorführen angehoben. Die Reihenfolge der SVG-Gruppen hält das hintere Bein hinter
dem vorderen. Jede Figur behält ihre vollständige statische Ersatzpose, bis ihre
eigenen drei Puppenteile geladen sind. Scheitert ein Teil, bleibt diese Ersatzpose
erhalten; andere Figuren können ihre fertigen Puppen bereits verwenden. Beim
Verlassen werden offene Bildanforderungen abgebrochen und verspätete
DOM-Ersetzungen verhindert. Kopf, Torso, Kleidung und Ausrüstung wechseln niemals zwischen
unterschiedlichen generierten Einzelbildern.
Es gibt keine Masken durch Waffen, Umhänge oder Gelenke.

Bei `prefers-reduced-motion` wird das Puppenmodul zunächst nicht importiert;
die statischen Posen bleiben sichtbar. Ein ausdrückliches Einschalten der
Animation lädt die Puppen nach. Unsichtbare Dokumente pausieren die Bewegung
über `data-visibility` unabhängig von der manuellen Pausenwahl. Beim Zurückkehren
bleibt eine vom Nutzer pausierte Animation pausiert. Tag und Nacht verwenden
eine gemeinsame Überlagerung mit animierter Deckkraft statt fortlaufender
Filterberechnungen auf sämtlichen Landschaftsebenen und Figuren.

Die endgültigen Teile wurden mit dem eingebauten ImageGen erzeugt. Originale und
vollständige Prompts stehen unter `assets/loading-screen/`, insbesondere
`puppet-v4-prompts.json` und `image-prompts.json` für die Landschaft. Die
früheren Sequenzentwürfe sind keine aktiven Webgrafiken.

`python modules/loading-screen/prepare-assets.py` benötigt Pillow, isoliert die
vollständigen Teile anhand der gemessenen Atlasbereiche, entfernt abgetrennte
Nachbarfragmente, skaliert ohne Verzerrung und erzeugt transparente WebP-Dateien,
statische Ersatzposen sowie `loading-screen-puppet-data.js`. Originale bleiben erhalten.
Die finalen Webgrafiken liegen in `public/assets/loading-screen/`.

## Musik und Bedienung

`loading-screen-sound.js` besitzt ein eigenes Audioelement. Quelle ist die vom
Nutzer bereitgestellte `Downloads/Ladebild musik.mpeg` (MP3, 219 Sekunden), als
`ladebild-musik-v1.mp3` für das Web ohne Coverbild aufbereitet. Das Tonmodul wird
im Kopf der Seite vorgeladen; sobald der Dialog existiert, wird Autoplay versucht.
Das Audioelement entsteht ohne Quelle und mit `preload="none"`. Die Musikquelle
wird erst beim Wiedergabeversuch zugewiesen. Meldet die optionale
Autoplay-Policy des Browsers eine Sperre, wird ohne aktive Nutzerinteraktion
keine Quelle angefordert. Browser ohne diese Policy-Schnittstelle versuchen
weiterhin die erlaubte automatische Wiedergabe; ein abgewiesener Versuch gibt
die Quelle sofort wieder frei. Damit wird der vollständige Titel bei einer
Autoplay-Sperre nicht vorsorglich über `preload="auto"` angefordert.
Bei einer Browsersperre wird der Start bei einer passenden Interaktion im
Ladebildschirm erneut versucht; zusätzlich bleibt der Musikschalter verfügbar.
Manuelles Ausschalten wird bei weiteren Interaktionen respektiert.
Der Ton blendet beim Start aus vollständiger Stille über sechs Sekunden ein.
Beim Betreten blendet er automatisch über 1800 ms aus und pausiert. Der Musikschalter
ist ein eigenes SVG-Lautsprecher-Icon mit Schallwellen bzw. Stummsymbol. Die runde
44-Pixel-Trefffläche hat einen eigenen Platz ganz rechts in der festen Kopfzeile
des Ladedialogs. Nur der Bereich darunter scrollt; die Kopfzeile bleibt stehen.
Beim Betreten verschwindet der Schalter mit dem Ladebildschirm. Nach dem Ausblenden
werden Audioquelle und Listener freigegeben. Listener und Audioelement gehören
weiterhin ausschließlich dem Tonmodul. Manuelles Aus- und Einschalten bleibt während
des Ladebildschirms möglich. Ein eigener Timer beendet das Ausblenden auch bei angehaltenen
Animationsframes in Hintergrundtabs. `pagehide` stoppt sofort und gibt Quelle,
Listener und die Steuerung vollständig frei. Musik blockiert keinen
Ladefortschritt. Ein verspätetes Tonmodul wird nach dem Eintritt sofort freigegeben
und startet keine Musik mehr; nach `pagehide` wird es verworfen.

Animationen sind pausierbar und starten bei `prefers-reduced-motion` pausiert.
Tab bleibt im Ladedialog. Das Freigeben selbst startet keine Firebase-Schreiboperation.

## Prüfung

`node --test --experimental-test-isolation=none tests/loading-screen.test.mjs tests/module-store-revision.test.mjs`

Die 33 Ladebildschirmtests prüfen echte Ladefreigabe vor `window.load`, frühe
Ereignisse, hängende dekorative Abrufe, expliziten Eintritt, Offline-/Fehlerpfade,
statische Posen bei reduzierter Bewegung, unabhängige Hintergrundtab-Pause,
quellenloses Audio bis zum Wiedergabeversuch, erlaubtes und gesperrtes Autoplay,
manuelles Stummschalten, Tonstart und Ausblenden, verspätete Wiedergabeantworten,
Beenden in Hintergrundtabs, vollständige Ersatzposen bei fehlenden Puppenteilen,
Abbruch offener Puppenabrufe und das Überkreuzen der Beine. Sie laufen auch im Netlify-Build.
Die Puppen wurden zusätzlich in mehreren Phasen als Rastervorschau kontrolliert.
Eine vollständige Browser-Layoutprüfung war in der Codex-Sitzung ohne verfügbaren
Browser nicht möglich.
