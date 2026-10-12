# Rhyfel-Reittiere der Gwyvern-Geschwister

Stand: 12. Oktober 2026. **Lokal vorbereitet. Keine Firebase-Schreibzugriffe, kein Commit, kein Push auf master und keine Veröffentlichung.**

| Pferd | Besitzer | Rasse / Geschlecht | Stufe | Merkmale |
| --- | --- | --- | --- | --- |
| Struppi | Sir Trevor Gwyvern | Rhyfel-Hengst | 3 | Kupferbrauner Fuchs, wilde helle Mähne, breite Blesse; frech und aggressiv |
| Dyreth | Huw Gwyvern | Rhyfel-Hengst | 3 | Dunkler Eisenschimmel mit schwarzer Mähne und hellem Stirnfleck; reizbar und angriffslustig |
| Uffyrae | Tegwen Gwyvern | Rhyfel-Stute | 2 | Heller Apfelschimmel mit silberweißer Mähne; ruhig und freundlich |

Die beiden neuen Namen wurden zufällig aus den männlichen bzw. weiblichen Vorschlägen von `modules/name-list/name-list-data.js#createRheunwaithNameListData` gezogen. Die drei vom Nutzer ausgewählten Bilder sind unveränderte Kopien der vorhandenen Entwürfe. Ablage: `assets/companions/haus-gwyvern/`. Der Prüfbeleg enthält Originalpfade, PNG-Maße und SHA-256-Prüfsummen.

## Charaktere und Besitz

Trevor behält die vorhandene Online-ID `0Sku8euk5jhlWebdsskI`. Sein vorbereiteter Stand enthält **Bwmbo, Uffel und Struppi**. Bereits vorhandene Gegenstände, übrige Inventarfelder und sämtliche anderen Charakterfelder wurden beim Ergänzen unverändert erhalten.

Huw Gwyvern und Tegwen Gwyvern fehlen im gelesenen Online-Bestand. Ihre neuen Datensätze verwenden die Weltpersonen-IDs `person--haus-gwyvern--huw-gwyvern` und `person--haus-gwyvern--tegwen-gwyvern`. Die gemeinsame Stammbaum-Importlogik übernimmt Porträts, Geburtsjahre 1722 bzw. 1720, Hauszugehörigkeit, Eltern Mervyn Gwyvern und Jeannae Aderyn sowie den Link zum Stammbaum. Eine kurze Biografie hält die Geschwisterbeziehung zu Trevor fest. Es wurden keine Klassen, Titel oder persönlichen Kampfwerte erfunden.

Der bereits vorhandene **Huw** (`67GWb6YWz8rBsxNUNRoI`) ist laut seiner Biografie ein Laufbursche aus Bronhir in Cynan Bachyngochs Diensten. Er ist eine andere Person und bleibt unverändert. Auch Huw Saethwyr ist eine andere Person.

Die beiden Geschwister sind außerdem als eigene Akten unter `CharakterDatenbank/records/familien/haus-gwyvern/` angelegt. Register und gebündelter Snapshot enthalten jetzt **238 Figuren statt 236**. Trevors lokale Akte enthält die drei Gefährten. Der gezielte Abgleich verwendet den bestehenden Datenbank-Generator; **235 andere Figurenakten und ihre Snapshot-Einträge bleiben unverändert**. Ein vollständiger Archiv-Neuabgleich wurde nicht durchgeführt, da er weitere ältere, nicht zu diesem Auftrag gehörende Exporte übernehmen würde. Die Online-Fassung eines vorhandenen Inventars behält beim Laden Vorrang; die Veröffentlichung der Inventar-Ergänzungen ist weiterhin ausstehend.

Alle fünf Tiere sind mit eigenen Kreaturbögen, Gefährtenkarten und Inventarinstanzen verbunden. Die bestehende gemeinsame Verknüpfungslogik verhindert doppelte Karten und prüft Besitzer, Kreatur-ID und Inventarinstanz. Die Pferde stehen unter **Pferde → Celtigerns Wacht**; die Schiffskatzen bleiben unter **Katzen → Tiefenwyrm**. Die Besitzer-Tags öffnen die jeweilige Figur.

## Bestiarium-Verweise

`modules/creatures/creature-bestiary-reference.js` ordnet anhand der gespeicherten Rasse / Art einen tatsächlichen Einzelprofil-Eintrag zu. `scripts/build-creature-bestiary-index.mjs` erzeugt den Index aus **177 vorhandenen Profilen**, prüft die Zielseiten und lässt Sammelartikel aus. Der Index wird im regulären Almanach-Prebuild aktualisiert; `npm run check:creature-bestiary` prüft ihn ohne Schreibzugriffe.

Kreaturschema 6 erhält den strukturierten Verweis `bestiaryReference` bei Anlage, Bearbeitung, Export, Import und Duplizieren. Übersicht und Profil zeigen einen anklickbaren Rasse-/Artverweis. Links werden ausschließlich aus dem geprüften Index gebildet. Unbekannte oder mehrdeutige Rassen werden nicht erraten; Menschen sind ausgenommen. Historisches „Pontar“ wird dem bestehenden Ponter-Profil zugeordnet. Ein Hest-Mischling verweist auf seine benannte Ausgangsrasse, ohne den Mischlingsstatus umzuschreiben.

Alle drei Pferde verweisen auf **Rhyfel**, beide Katzen auf **Cenyric**. Die lokalen Katalogvorlagen erhalten passende Verweise ebenfalls, einschließlich Landtroll und Frekis Gramnir-Profil. Für die **35 gelesenen Online-Kreaturen** liegt ein gezielter Nachpflegeplan vor:

- **25** eindeutig zuordenbare Rasse-/Artverweise ergänzen, ausschließlich Feld `bestiaryReference`.
- **2** Menschen ausnehmen.
- **8** Tiere offenlassen: Betty (langhaarige Hauskatze), Cíaran (Hund), Hari (Wachhund), Alwen und Olwen (Rotmilane), Distry (Rabe), Pryderi (Pfau), Æthel (Eule). Bei den ersten drei ist keine konkrete Rasse belegt; für die übrigen fehlt ein entsprechendes Einzelprofil. Keine Rasse aus dem Bild oder einer allgemeinen Sammelkategorie ableiten.

Bestehende Trefferpunkte, Ressourcen, Zustände, Besitzverhältnisse, Online-IDs und frühere Kampfhandlungen sind nicht Bestandteil dieses Abgleichs.

## Vorbereitete Dateien

`Charakter Archiv Exporte/gefaehrten/gwyvern-rhyfel-2026-10-12/` enthält:

- Drei importierbare Kreaturbögen: `companion-trevor-struppi.json`, `companion-huw-dyreth.json`, `companion-tegwen-uffyrae.json`.
- `charaktere/`: vollständige lokale Figurenexporte für Trevor, Huw und Tegwen mit den passenden Gefährtenkarten.
- `bestiarium-nachpflege.json`: reine Metadaten-Patches mit gelesenen Versionsständen, Ausnahmen und Katalogabdeckung.
- `vorbereitung.json`: Besitzerzuordnungen, neue IDs, Rassen, Stufen, Namensquelle und Bildprüfsummen.
- `lokaler-charakterdatenbank-abgleich.json`: Quellenbeleg des gezielten lokalen Datenbank-Abgleichs; enthält ausschließlich die drei betroffenen Figuren, keinen vollständigen Datenbankexport.

Die neuen Einzelcharakter-Overlays `huw-gwyvern-rhyfel-2026-10-12.json` und `tegwen-gwyvern-rhyfel-2026-10-12.json` liegen zusätzlich direkt unter `Charakter Archiv Exporte/`, wo sie vom regulären Archiv-Sync gefunden werden.

Die früher vorbereiteten Katzenbögen sind um ihre Cenyric-Verweise ergänzt. Der frühere Trevor-Export `trevor-gwyvern-schiffskatzen-2026-10-12.json` entspricht jetzt dem vollständigen lokalen Trevor-Stand einschließlich Struppi; er darf keinen veralteten Inventarstand erneut einspielen.

Vor einer späteren Freigabe den aktuellen Online-Stand erneut lesen. Die Figurenexporte sind zur Prüfung und als lokale Sicherung bestimmt: **Trevor ausschließlich durch gezielte Gefährten-Ergänzungen gegen seinen dann aktuellen Stand aktualisieren.** Huw und Tegwen nur anlegen, wenn ihre Weltpersonen-IDs weiterhin fehlen; andernfalls die gefundenen IDs übernehmen. Kreaturen und Besitzerinventare gemeinsam versionsgeprüft speichern. Den Bestiarium-Nachpflegeplan ausschließlich als Feld-Patch anwenden, niemals als Vollimport alter Kreaturbögen. Die Bilddateien müssen bei einer Veröffentlichung erreichbar sein. Die separate Schiffskatzen-Hierarchie bleibt im vorhandenen Mannschafts-Modulpaket vorbereitet.

## Prüfung

**58 Tests bestanden:** Bestiarium-Zielseiten, Zuordnung und Ausnahmen, sichere Links, Import-/Duplikat-Roundtrip, Erhalt bestehender Kampfwerte, ausgewählte Originalbilder, Stufenobergrenzen, Stammbaumdaten, eindeutige Inventarverknüpfungen, tatsächliche Datenbankakten und Vorrang aktueller Online-Inventare sowie die vorhandenen Kreaturen-, Begleiter- und Datenbankprüfungen.

Lokaler Chromium-Test mit blockierten externen Anfragen: alle drei Besitzerinventare, Öffnen jedes Pferdebogens über die Inventarkarte, geladene Bilder, Rasse und Stufe, Bestiarium-Link in beiden Ansichten, tatsächliche Navigation zur Rhyfel-Seite und beide Cenyric-Verweise. Mobile Profile ohne horizontalen Überlauf; keine Browserfehler. Bildschirmaufnahmen und Prüfbericht: `.codex-temp/gwyvern-horses-review/`.

Zusätzlicher Browserdurchlauf mit leerer Online-Charakterantwort: alle 238 Figuren werden aus der echten lokalen Datenbank geladen, beide neuen Geschwister erscheinen mit den richtigen Pferden und Huw aus Bronhir bleibt separat erhalten.

Produktionsbuild erfolgreich. Die bestehenden Vite-Hinweise zu klassischen Skripten, Modulformaten und großen Bundles bleiben bestehen.
