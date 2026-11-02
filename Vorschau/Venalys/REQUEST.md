# Venalys – bestätigter Auftrag vom 2. November 2026

Die Nutzerfestlegungen dieses Auftrags gehen der älteren Bestandssuche unter
`sources/RECHERCHE.md` vor. Vorbereitungsseite im bestehenden Aleria-Projekt,
vorerst lokal; keine automatische Übernahme der Entwürfe in kanonische
Register, Stammbäume oder Firebase.

## Inhalt und politische Ordnung

Die erste Kaufmannsgilde, der Markt der Fortuna, gründete auf Tirnara die
Kolonie, aus der die unabhängige Metropole Venalys wurde. Fünf
Patrizier-Gründerfamilien ergänzten einander: Vinicius initiierte Fortuna,
Avenicci sponserte und investierte, Abor sicherte militärisch, Tullius wirkte
missionarisch und Arentino baute die Kolonie auf. Patre bedeutet Vater;
Patrizier bezeichnet die Gründerväter. Avenicci und seine Sympathisanten
gründeten später aus Ablehnung der wohlwollenden Fortuna-Politik die
kapitalorientiertere Klingende Münze. Beide Kaufmannsgilden sind in Venalys
beheimatet und global tätig. Abor besitzt eine Söldnergilde in Konkurrenz zu
Windreitern und Blutbund; Arentino eine globale Baumeistergilde; Tullius
konzentriert sich auf den Klerus. Zusätzliche Gildennamen bleiben offen.

Geschlechtsformen: Tullius/Tullier, Abor/Abori, Vinicius/Vinicier;
Arentino und Avenicci unverändert. Vorhandenes Sprachmodul Lingua Argenti
verwenden. Screenshot-Namensverbote in `sources/name-ban.json` einhalten.

Spätere Nutzerkorrektur: Familiennamen nach dem natürlichen Klang von Ergalla
und Falto bilden. Keine erzwungene Berufs- oder Gesinnungsableitung; der Klang
ist wichtiger. Die 13 neuen Familien entsprechend überarbeitet, bestehende
Namen erhalten. Anzeigenamen und frühere Generierungsnamen sind in
`sources/name-revision.json` nachvollziehbar; stabile IDs bleiben unverändert.

Patrizier sind hoher Adel; Magnarier Lehensadel im Ritterfürstenrang.
Mercantier sind kein Adel, aber annähernd mit Ritterherren vergleichbar;
Plebejer stehen darunter. Advena sind Ausländer mit situativer Stellung.

Zwei Dogen; Legat, Quästor, Advokat, Augur, Zensor, Herald. Sekundär Ädil
und Volkstribun, weitere Ämter offen. Senatorenstatus für alle Männer aus
Patrizier- und Magnarierhäusern ab 30 Jahren. Eigenständige Stadtwache aus
1.000 einheimischen Venaliern unter dem Legaten, strenge Aufnahme; keine
Vermischung mit Haus- und Gildenstreitkräften. Keine Besetzungen erfinden.
Alerische Kirche als Staatsreligion aus kommerziellem Nutzen; frühere
Celestische Synode und Akzeptanz anderer Religionen erhalten.

## Bestätigte Hauszahlen und Bilder

Nutzerantwort auf die Rückfragen: **drei** Abor-Magnarier; bestehende Häuser
zählen mit und werden ausdrücklich so zugeordnet:

| Patrizierhaus | Große Magnarier | Bestehende Häuser eingeschlossen |
| --- | --- | --- |
| Vinicius | 5 | Falto, Nerva |
| Avenicci | 5 | Falveri, Ergalla |
| Abor | 3 | – |
| Tullius | 2 | – |
| Arentino | 2 | – |

Somit 17 Magnarier, davon 13 neue Namen. Fünf gelieferte Patrizierwappen sowie
Falto/Falveri erhalten. 15 fehlende Magnarierwappen ergänzen, jeweils
kreisrund und römisch/frühitalienisch, mit bescheideneren Rahmen als die
Patrizier. Stolze Tiere, Meer, Handel und wirtschaftliche Heraldik verwenden.
Noch keine Mercantier- oder Plebejerhäuser erzeugen und keine Verteilung auf
Bezirke oder Außenorte vornehmen.

17 Magnarier-Krieger: spätrömische Ausrüstung mit italienischen Condottieri,
variierte offene/halboffene/geschlossene Helme, Hausfarben und Motive.
Condottieri schwer gerüstet mit Schwert; Gondoleri leichter mit Säbel und
Rückenköcher; Lancieri mit Stangenwaffe; Stralieri lässig an aufgestellter
Pavese mit Schwert und Rückenköcher. Keine Limita. Allgemeiner freigegebener
matter Figurenstil, echte transparente Hintergründe und ganze Silhouetten.

Während des Auftrags zusätzlich gewünschte Patrizierfiguren:

- Avenicci nach angehängtem schwarz-rot-goldenem Ritter: geschlossener
  Löwenhelm, goldene Mähne, schwarzer Harnisch mit Goldfassung, roter Stoff,
  Pelzkragen; eigenes Löwenwappen statt Adler/Schachbrett der Vorlage.
- Abor nach angehängter gold-blauer antiker Helmvorlage: insbesondere Helm
  und großer blauer Helmkamm erhalten; professioneller, ritterlicher und
  prunkvoller mit vollständigem Harnisch statt freier Arme/Beine und Sandalen.

## Kartenwerkstatt

Beide gelieferten Karten haben identische Geometrie (8192×4698). 13 rote
Stadtbezirke als neutrale Arbeitsnummern erfassen. Nutzer benennt sie selbst.
Bezirksnamen und Hauszuordnungen gemeinsam lokal speichern und exportieren.
Viele-zu-viele-Zuordnung: ein Haus kann mehrere Bezirke und Außenorte erhalten,
ein Gebiet mehrere Häuser. Einzelne Verbindungen müssen getrennt lösbar sein.

78 äußere POI-Gruppen nach Legenden inventarisiert: 58 Namensvorschläge,
14 neutral nummerierte Anwesen und 6 nur als „Taverne, Herberge oder Bordell“
bezeichnete Punkte. Räumlich gemeinsame Anwesen-Ensembles gelten als ein POI;
Zuordnung und Typannahmen in `sources/map-analysis.md` dokumentieren.

## Quellen und Verarbeitung

24 Originale in `assets.source.json`:22 gelieferte PNGs und2 bestehende
Hauswappen. Große Originalkarten im nicht statisch ausgelieferten
Quellenarchiv, optimierte WebP-Karten als Vorschau/Großansicht. Alle
Generatororiginale und RGB-Farben erhalten. Technische Alpha-Aufbereitung
mit der bereits geltenden Nutzerfreigabe „Ja, Alpha bereinigen“ und den
vorhandenen Projektprozessoren. Vollständige Prompts und Referenzrollen in
`sources/art-prompts.json`, Ausgabepfade in `generation-receipts.json`.
