# Zwei zusätzliche maritime Reeves der Tharn

Nutzerauftrag vom 2. November 2026: Zwei neue Vasallenhäuser unmittelbar in
Tharns Earlsstadt, mit Fischwappen und Kriegerdarstellungen. Die anschließende
Rangfestlegung lautet Reeve, entsprechend Ritterfürst. Beide Häuser sitzen in
Trentmorath, Earltum Tharnmere, Aeldrunmar auf Aldervan. Sie dienen Haus Tharn
unmittelbar; sie erhalten keine erfundenen zusätzlichen Landgebiete.

| Haus | Hauszeichen und Farben | Schwerpunkt | Darstellung |
| --- | --- | --- | --- |
| Ransford | Ein silberner Dorsch über zwei Wellen; Petrol, Silber, Kupfer | Hochseefischerei und Geleit der Fangschiffe | Særinc, halb offener Spangenhelm mit Nasal und Wangenklappen |
| Heswick | Drei goldene Heringe über einer Welle; Burgunder, Altgold, Silber | Heringsfang, Salz- und Räucherfisch, Versorgung der Häfen und Besatzungen | Særinc, geschlossener spitzer Helm mit schmalem Sehschlitz |

Die Familienakten enthalten vorerst keine erfundenen Angehörigen oder
Verwandtschaften. Bei späterer Personenausarbeitung gilt das Präfix **Dun-**
für beide Reevehäuser. Dimholt bleibt in Luthirrith, Wend in Linthar und Scandyn
in Scandmere; ihre Lehnsbindungen an Tharn bleiben erhalten.

## Quellen und Bilder

- Kanonische Fakten: [aeldrunmar-tharn-houses.source.json](data/aeldrunmar-tharn-houses.source.json).
- Vollständige Prompts, verwendete Referenzen und das integrierte
  ImageGen-Verfahren: [art-prompts.json](sources/tharn-20261102/art-prompts.json).
- Vier unveränderte Generatororiginale: `sources/tharn-20261102/raw/`.
- Genehmigte Alpha-Aufbereitung und RGB-Belege:
  [alpha-receipts.json](sources/tharn-20261102/alpha-receipts.json).
- Separate Ergänzungsquelle: [snapshot.json](sources/tharn-20261102/snapshot.json).
  Die ursprüngliche 35-Häuser-Quelle und die angenommenen Sitzexporte bleiben unverändert.
- Endgültige Wappen:
  `Stammbäume/assets/images/houses/accepted-realms/aeldrunmar/{ransford,heswick}.{png,webp}`.
- Endgültige Figuren:
  `Stammbäume/assets/images/references/accepted-realms/aeldrunmar/{ransford,heswick}/krieger.{png,webp}`.

Die Vorbereitung nutzt dieselben Hausfakten, jedoch weiterhin eigene lokale
Entwurfszuordnungen. Vollständige alte 35-Häuser-Entwürfe behalten sämtliche
Sitze; nur die beiden neuen Häuser werden beim Import in Trentmorath ergänzt.
Unvollständige oder fremde Entwürfe werden weiterhin zurückgewiesen.

## Prüfung

36 gezielte Tests erfolgreich: kanonische Zuordnungen, Ränge, Familienakten,
Verlinkungen, Orts- und Kartenregister, unveränderte Bestandsfamilien,
Originalbilder und alte Entwurfsimporte. Die sechs Generatorprüfungen für
Bilder, Seiten, Karten, Hausinhalte, Kartenhaushalte und Kriegerkatalog sind
ebenfalls erfolgreich.

Browserprüfung auf `http://127.0.0.1:8897`: beide Hausseiten mit Wappen und
Figuren, das gemeinsame Trentmorather Hausregister sowie Ransfords
Kriegerfenster in der Vorbereitung. Belege unter
`diagnostics/tharn-houses-20261102/`. Auf Port 8896 wurde eine ältere Fassung
angezeigt; die aktuelle Dateifassung wurde deshalb auf einem frisch
gestarteten lokalen Server geprüft.

Stand: lokal fertiggestellt; keine Veröffentlichung dieses neuen Auftrags.
