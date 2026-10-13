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

Die sechs Schritte sind das `load`-Ereignis der Seite, `almanach:app-ready` nach
dem lokalen Rendern, `almanach:initial-modules-settled` nach dem ersten Modulabgleich,
die bestehenden Figuren-/Kreaturen-Ereignisse und die geladenen Reisegrafiken
einschließlich sämtlicher Puppenteile. Der Balken zählt abgeschlossene Schritte,
keine geschätzten Downloadprozente. Offline-Abgleich und Grafikfehler werden
abgeschlossen, ohne einen erfolgreichen Online-Abruf vorzutäuschen. Nach 15 Sekunden
erscheint eine ausdrückliche Weiter-Option, sobald das lokale Archiv bereit ist;
Startfehler bieten stattdessen Neuladen. Keine künstliche Mindestwartezeit.

Die neuen Signale greifen nicht auf Firebase zu und ändern keine Spielstände,
Online-IDs, Ressourcen, Würfe oder Kampfverläufe.

## Animation und Grafiken

`loading-screen-walk.js` setzt vollständige, geschlossene Körper- und Beinbilder
zusammen. Beide Beine schwingen kontinuierlich in Gegenphase durch dieselbe
Mittelposition und wechseln dabei ihre vordere/hintere Stellung. Ein Bein wird beim
Vorführen angehoben. Die Reihenfolge der SVG-Gruppen hält das hintere Bein hinter
dem vorderen. Kopf, Torso, Kleidung und Ausrüstung wechseln niemals zwischen
unterschiedlichen generierten Einzelbildern.
Es gibt keine Masken durch Waffen, Umhänge oder Gelenke.

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
`ladebild-musik-v1.mp3` für das Web ohne Coverbild aufbereitet. Autoplay wird versucht;
bei einer Browsersperre startet der Musikschalter den Ton durch eine Nutzergeste.
Der Ton blendet beim Start über 850 ms ein und beim Betreten über 1800 ms aus.
Danach werden Wiedergabe, Quelle und Listener vollständig freigegeben. Ein eigener
Timer stoppt den Ton auch bei angehaltenen Animationsframes in Hintergrundtabs;
`pagehide` beendet ihn sofort. Musik blockiert keinen Ladefortschritt.

Animationen sind pausierbar und starten bei `prefers-reduced-motion` pausiert.
Tab bleibt im Ladedialog. Das Freigeben selbst startet keine Firebase-Schreiboperation.

## Prüfung

`node --test --experimental-test-isolation=none tests/loading-screen.test.mjs tests/module-store-revision.test.mjs`

Die Tests prüfen echte Ladefreigabe, frühe Ereignisse, expliziten Eintritt,
Offline-/Fehlerpfade, Tonstart und Ausblenden, Beenden in Hintergrundtabs,
vorhandene Grafiken und das Überkreuzen der Beine. Sie laufen auch im Netlify-Build.
Die Puppen wurden zusätzlich in mehreren Phasen als Rastervorschau kontrolliert.
Eine vollständige Browser-Layoutprüfung war in der Codex-Sitzung ohne verfügbaren
Browser nicht möglich.
