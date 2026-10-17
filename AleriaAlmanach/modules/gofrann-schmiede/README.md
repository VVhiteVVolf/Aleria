# Zum Dritten Funken

Nutzerauftrag vom 16. Oktober 2026. Die frühere Veröffentlichungssperre wurde am 17. Oktober 2026 ausdrücklich aufgehoben: alle vorbereiteten Module auf master veröffentlichen.

- Bürgerliche Eigentümerfamilie Gofrann; Haus Tlawd hält einen bedeutenden Anteil, liefert vor allem Erz und erhält den Lehnsanteil. Tlawd dient wiederum Gafyr. Keine erfundene Beteiligungsquote.
- Gethin (1669, 71) ist leitender Harnischmeister, sein Vetter Bleddyn (1672, 68) Waffenmeister und Mitinhaber. Beide arbeiten weiter.
- Nach unbekanntem Gründerpaar, Hauswappen und einem einzigen seriellen Zeitsprung folgen die Brüder Edern (1638–1714, 76) und Caradfan (1642–1712, 70), die Väter der beiden Meister.
- Einion (1696, 44) ist Gethins Sohn. Ulaena (1699, 41) ist Bleddyns Tochter. Bestehende Personen- und Ehe-IDs bleiben erhalten.
- Renfri Tlawd heiratet zu Einion; die neuen Kinder stehen ausschließlich bei Gofrann. Ulaena heiratet zu Lludd; Owain (1720) und Leisa (1722) bleiben ausschließlich bei Tlawd.
- Beide Meister haben je zwei Kinder. Drei Gofrann-Paare haben je zwei Kinder. Kinder unter zwölf erhalten keine Dienstposten.
- 22 bekannte Familienpersonen, davon 20 neue Porträts und zwei erhaltene Tlawd-Porträts. Historische Porträts zeigen das erreichte Sterbealter. Ältere Frauen haben nach ausdrücklicher Klarstellung graues Haar und keinen Bart.
- Kreisrundes Familienwappen: silberner Amboss, kupferner Hammer und drei kupferne Funken auf dunklem Petrol; geschwärzter Eisenrahmen mit kupfernem Knotenband.
- Das separate Geschäftsschild hat auf ausdrücklichen Nutzerwunsch Kite-Form. Zwei klar getrennte Zeichen zeigen die Zusammenarbeit von Gofrann und Tlawd; das Familienwappen bleibt kreisrund.
- Neun Inhaltsseiten: Story, Geschäftsbio, beide Meister, drei Personalreiter, Güterregister, Dienstleistungen sowie Verkaufsraum, Schmiedewerkstatt und Verwaltung. Eine Kommentarabschlussseite folgt wie bei den bestehenden Modulen.
- 36 Standardwaren aus dem vorhandenen Handelsregister bleiben erhalten. Der Folgeauftrag ergänzt 35 eigene Stücke in fünf Rubriken; zusammen sind es 71 Waren in sieben Rubriken.

Gemeinsame Familienidentitäten und Altersangaben: `gofrann-people.mjs`. Die übrigen Dateien besitzen getrennte Verantwortlichkeiten für Personal, Sortiment, Dienstleistungen, Modul und Bildaufträge.

Bildwerkzeug: **built-in image_gen**. Die vollständigen gespeicherten Prompts stehen in [image-prompts.json](../../assets/gofrann-schmiede/image-prompts.json), Quellen und konkrete Korrekturprompts in [image-results.json](../../assets/gofrann-schmiede/image-results.json). 31 finale Bilder: 20 Einzelporträts, ein Meister-Doppelporträt, acht weitere Szenen, ein Wappen und ein Geschäftsschild. Ursprungsdateien bleiben im Bildwerkzeug-Archiv erhalten. Die erlaubte Alphabereinigung verändert nur den Alphakanal; [alpha-audit.json](../../assets/gofrann-schmiede/alpha-audit.json) enthält die finalen Prüfsummen.

Caradfan wurde auf Nutzerkorrektur neu gezeichnet: kahler Scheitel mit seitlichen grauen Locken, breiteres Gesicht, kräftige Nase, langer Schnurrbart und rasiertes Kinn. Alter 70 und blaue Augen bleiben erhalten. Der Hammer des Familienwappens trifft die Ambossbahn; die Funken entspringen dem Auftreffpunkt.

Die [Hausseite](../../../Familien%20H%C3%A4user%20und%20Clans/Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gofrann/haus.content.mjs) und die Verweise in Gwynthor und der Grafschaft sind lokal eingebunden. Tlawds bestehende Hausbeschreibung wurde um die Beteiligung ergänzt. Es wurden keine Online-Familienakten, Charakterressourcen oder Kampfverläufe geschrieben.

Die Dienstleistungen sind am vorhandenen Preisgefüge ausgerichtet: ein gewöhnliches Stahlschwert kostet 500 Kupfertaler. Schärfen ab 8, kleine Verbindungen ab 6 und Richtarbeiten ab 35 Kupfertalern bleiben klar unter dem Ersatzpreis; größere Anpassungen und Sonderarbeiten werden vereinbart. Diese redaktionelle Preisbegründung steht außerhalb der immersiven Dienstleistungsseite.

Prüfung am 16.10.2026:

- Sechs neue Datentests bestanden: Schema, Zeitsprung, Verwandtschaft, Lebensalter, bestehende Identitäten, verheiratete Zweige, Personalplätze, unveränderte Registerpreise und lokale Bilddateien.
- Echte Chrome-Browserprüfung aller neun Inhaltsseiten, drei Personalreiter, Filter/Suche/leeres Eigenangebot und Sanitizer-Rundlauf bestanden. Beide vollständigen Stammbaumleser einschließlich ihrer Porträts geladen und visuell geprüft. Prüfaufnahmen: `.tmp/gofrann-schmiede/browser-1792175868130/`.
- Geometrieprüfung Gofrann und Tlawd: zwei Akten, 61 Karten, keine Fehler. Bericht: `.tmp/gofrann-geometry.json`.
- Alle 35 unterschiedlichen externen Standardwarenbilder antworten mit HTTP 200; Bilder im Browser decodiert. Das 36. Warenbild liegt bereits lokal vor.
- Bestehende Nixe-Browserprüfung nach den gemeinsamen Vorlagenänderungen bestanden: elf Seiten, sechs Personalreiter, 41 Waren, 14 Dienste, Kanne-Dienste und Charakterverzeichnis. Güter- und Dienstleistungsvorlagen zeigen vorhandene Seitenbilder im Kopfbereich; leere Warenfilter zeigen einen Hinweis.
- Preis-/Münztests, 19 Tests zur Stammbaumdarstellung und die bestehende Prüfung der ausgearbeiteten Celtigern-Hausseiten bestanden. Modul- und Hausgeneratoren bestätigen aktuelle Ausgaben; `git diff --check` ohne Inhaltsfehler.
- Ältere Bestandsprüfungen sind weiterhin veraltet: `krumme-kanne-families.test.js` fordert bei Styr noch einen doppelten Kindereintrag, obwohl seine Linie inzwischen nur bei Svathamar fortgesetzt wird. `celtigerns-complete-inventory.test.mjs` erwartet noch 79/39/71 Gesamtzahlen und Animexx-Originale für später neu erfundene Familien; schon vor Gofrann lagen die entsprechenden Zahlen bei 83/43/75, jetzt bei 84/44/76. Diese Altprüfungen wurden nicht umgeschrieben. Keine Behauptung einer vollständig grünen Gesamtsuite.

Reproduktion: `node AleriaAlmanach/tests/gofrann-schmiede.test.mjs`, `node AleriaAlmanach/tests/gofrann-schmiede.browser.mjs`, `node AleriaAlmanach/scripts/build-gofrann-schmiede.mjs --check`. Browserprüfungen sperren externe Schreibzugriffe; ausschließlich statische Bild- und SDK-Dateien dürfen gelesen werden.

Eigensortiment, Folgeauftrag vom 16.10.2026:

- **Eigene Waffen:** 18 Stücke, darunter Dolch, Kurz-, Lang-, Bastard- und Zweihandschwert, Säbel, drei Äxte, Streitkolben, zwei Hämmer, Speer, Hellebarde, Gleve, Kettenmorgenstern, Langbogen und Stahlbogenarmbrust. Die Fernwaffen entstehen in Partnerarbeit. Das Markenzeichen ist ein kleiner gravierter Amboss mit drei Funken am Knauf oder Abschlussbeschlag; die Bilder sind diagonal von links unten nach rechts oben angelegt. Lange Stangen behalten ihre langen Schäfte und vergleichsweise kleinen Köpfe.
- **Eigene Rüstungen:** Plattenharnisch, Brigantine, Kettenharnisch, zwei Lederharnische und zwei schlichte zweifarbige Wappenröcke. Keine Symbole oder Ziergravuren. Kopf- und armlose weiße Torsopuppen füllen die Ansichten; keine Beine oder vollständigen Rüstungssätze. Die Wappenröcke werden ohne darunterliegende Rüstung angeboten.
- **Eigene Schilde:** blanker Kite-Schild, Rundschild, Pavese und Buckler ohne Zeichen oder Gravuren.
- **Besondere Waffen:** Nachtader (Tenebron), Eid der Esse (Maßschwert mit Silberdraht und kleinem Rauchquarz), Erzbrecher (Meister-Rabenschnabel).
- **Besondere Rüstungen:** Violette Wacht (Tenebron-Plattenharnisch), Reitermaß (persönlicher Stahlharnisch), Adernhemd (Tenebrit-Kettenharnisch).
- Lorequelle: `modules/natural-resources/tenebrium-content.mjs` und die vorhandenen Materialbilder wurden gelesen beziehungsweise angesehen. Tenebron bleibt tiefschwarz mit violetten Adern; Tenebrit stahlfarben mit feineren violetten Adern. Keine erfundenen Kampfwerte, Boni, automatische Charakterausrüstung oder vollständige Magieimmunität.
- Preisvergleich: Haus-Langschwert 1.600 statt 1.000 KT, Hellebarde 3.900 statt 2.000–3.000 KT, Brigantine 7.200 statt 2.000–5.000 KT, Kettenharnisch 2.600 statt 1.000 KT. Rundschild 85 statt 30 KT, Kite 210 statt 100 KT, Pavese 240 statt 100 KT, Buckler 45 statt 15 KT. Die Wappenröcke zu 180 KT enthalten nur das Gewand. Seltene Materialarbeiten sind hochpreisige Auftragsbeispiele mit ausdrücklich geklärter Materialbeschaffung.
- Produktquellen sind nach Waffen, Rüstungen, Schilden und Sonderarbeiten getrennt. `gofrann-products.mjs` übernimmt die gemeinsame Projektion ins vorhandene Gütertemplate; dessen Renderer musste für diesen Folgeauftrag nicht erweitert werden.
- Alle **35 neuen Bilder mit built-in image_gen** erstellt und unter [assets/gofrann-schmiede/items](../../assets/gofrann-schmiede/items/) gespeichert. [Vollständiger Promptsatz](../../assets/gofrann-schmiede/items/image-prompts.json), [Originalquellen und Prüfsummen](../../assets/gofrann-schmiede/items/image-results.json), [Bildprüfung](../../assets/gofrann-schmiede/items/image-audit.json). Die Bildprüfung verändert keine Pixel. Ein Eckpixel des Bastardschwerts besitzt Alpha 1/255; sonst liegen die Ecken bei 0. Diese praktisch unsichtbare Quantisierung wird dokumentiert, die ursprüngliche Kantenglättung bleibt erhalten.
- Aktuelle Prüfung: sieben Datentests bestanden; echter Browserlauf aller neun Inhaltsseiten und beider Stammbaumleser, sieben Warenrubriken, 71 Angebote, Suche und Sanitizer-Rundlauf bestanden. Alle 35 neuen Itembilder geladen und fünf neue Rubrikansichten visuell geprüft. Aufnahmen: `.tmp/gofrann-schmiede/browser-1792178819715/`. PNG-Prüfung: 35 quadratische RGBA-Dateien, echte Transparenz, keine am Bildrand abgeschnittenen Gegenstände.
- Die frühere Veröffentlichungssperre wurde durch die ausdrückliche Nutzerfreigabe vom 17.10.2026 aufgehoben.
