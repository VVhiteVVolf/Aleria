# Der Städter und sein Pferd

Nutzerauftrag vom 31. Oktober 2026. Cynddelw Llythfor (42), seine Frau Esyllt
Penrudd (34) und ihre Tochter Eirlys (10) leben in Gwynthor. Esyllt ist die neu
ergänzte jüngste Tochter Tudurs und Bethans vom Penrudd-Hof. Die Ehe ist in
beiden Familienakten gespiegelt; Eirlys steht ausschließlich bei Llythfor.
Das Haus verwendet den vorhandenen schlichten braunen Wappenplatzhalter.

## Bilder

- `portraits/cynddelw-llythfor.png`: Berichterstatter, Lederbuch, Mütze und
  nachdenklicher Blick nach oben.
- `portraits/esyllt-penrudd.png`: jüngere Schwester Eluneds, braune Haare und
  braune Augen, gepflegte schlichte Stadtkleidung.
- `portraits/troetzli.png`: ausgewähltes korrigiertes Pferdeporträt, mit
  natürlicheren Konturen und weniger betonter Muskulatur. Alle Narben sind alt.
- `portraits/eirlys-llythfor.png`: zehnjährige Tochter mit zwei Zöpfen,
  Malstift, Papierfetzen und frechem Zahnlückengrinsen.

Erzeugt mit dem eingebauten **image_gen**. Bildstil: `anime-scene-portrait`,
2:3, Tales of Xillia/Frieren, Lineart und Cel-Shading. Eluneds vorhandenes Bild
diente als tatsächliche Familien- und Stilreferenz, das Bestiarium-Rhyfel als
Körperbaureferenz. Exakte Prompts und Korrektur:
`diagnostics/gwynthor-troetzli-2026-10-31/generation-jobs.json`.
Generatororiginale bleiben erhalten. Die erste, vom Nutzer als zu muskulös
bezeichnete Pferdefassung liegt nur bei den Diagnosebelegen.

## Einbindung

Gemeinsame Personendaten: `modules/gwynthor-troetzli/troetzli-household.mjs`.
Trötzli besitzt einen eigenen Kreatureneintrag und verweist auf das vorhandene
Rhyfel-Profil. Cynddelws Inventar und der Kreatureneintrag verwenden dieselbe
Besitzer- und Einzelstückidentität. Der alte Hest ist nur in der Vorgeschichte
erwähnt und wurde nicht als weiteres unbestimmtes Tier angelegt.

Das Gesuch hängt als eigene Veröffentlichung am vorhandenen **Hilfe-Plakat**.
Kein zusätzliches Plakat. Belohnung für die sichere Übergabe: 50 Kupferstücke,
ein schickes unbeschriebenes Notizbuch und Schreibutensilien. Die Gegenstände
verwenden vorhandene Registervorlagen mit eigenen Bildern unter `items/`.
Ursache der Verhaltensprobleme und genaue Vergangenheit des Pferdes bleiben offen.
Auf der Anzeige steht auf Nutzerwunsch ausschließlich Eirlys’ Kinderzeichnung
vom Beinahetritt; das eigentliche Pferdeporträt gehört zum Kreatureneintrag.
Die Prompts für Eirlys und die beiden transparenten Itembilder stehen im selben
Diagnoseordner in `eirlys-rewards-generation-jobs.json`. Die Alterskorrektur
auf zehn Jahre (1730 geboren) folgt der ausdrücklichen Nutzerangabe; ältere
Generatorprompts und Sicherungsstände bleiben als historische Quellen erhalten.
