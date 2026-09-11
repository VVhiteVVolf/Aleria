# Celtigerns Wacht: sieben weitere Hausseiten

Stand: 11. September 2026. Fortsetzung der Draig-Übernahme nach [HAUSSEITEN-VORGEHEN.md](HAUSSEITEN-VORGEHEN.md).

## Umfang und Ausführungsplan

Die sieben bereitgestellten Animexx-Vorlagen erhalten jeweils eine ausführliche Hausseite in der vorhandenen Häuser-Shell und eine kurze Bio im Stammbaum. Die Familiengraphen bleiben in ihren bestehenden Akten. Arwydd verwendet seine bereits registrierte Haus-ID weiter.

1. [x] Alle Originale im fachlichen Hausordner sichern und vollständig auswerten.
2. [x] Wappen, Portraits, Personen-IDs, Amtszeiten, Erben und Herrschaftsseiten abgleichen.
3. [x] Texte redigieren; unbekannte Angaben offenlassen und Namensabweichungen dokumentieren.
4. [x] Pro Haus eine `haus.content.mjs` mit vollständigen Kapiteln und eigenständiger Kurzfassung erstellen.
5. [x] Originale Ritterbilder und Herrschaftsbanner lokal sichern; lokale Stammbaum-Portraits und Silhouetten wiederverwenden.
6. [x] Hausdaten und Bio über den gemeinsamen Builder erzeugen, registrieren und die Familienrevisionen erhöhen.
7. [x] Banner und Herrschaftswappen verbinden; Personenlinks auf bestehende Stammbaumeinträge setzen.
8. [x] Daten- und Migrationsprüfungen ausführen; eigene oder bewusst entfernte Bios erhalten.
9. [x] Abschließende Browserprüfung bei 1.440, 768 und 390 Pixeln dokumentieren.

## Häuser und Verbindungen

Die Pfade liegen unter `Estryll/Cenyr/Celtigerns_Wacht/`. Jeder Ordner enthält Original, redaktionelle Inhaltsquelle, beide erzeugten Ausgaben und lokale Bilder mit `assets/quellen.json`.

| Haus | Ordner | Bannerziel | Oberhäupter / Erben / Ämter | Familienrevision |
| --- | --- | --- | --- | --- |
| Illysywen | `Rhonwens_Traenen/Haus_Illysywen` | Herrschaft Rhonwens Tränen | 4 / 2 ehemalige / 20 historische | 2 → 3 |
| Gafyr | `Llamreis_Ankunft/Haus_Gafyr` | Herrschaft der Gafyr | 7 / 3 / 20 | 4 → 5 |
| Wyrm | `Llamreis_Ankunft/Haus_Wyrm` | Herrschaft der Wyrm | 6 / 2 / 20 | 3 → 4 |
| Saethwyr | `Llamreis_Ankunft/Haus_Saethwyr` | Herrschaft der Saethwyr | 8 / 2 / 20 | 3 → 4 |
| Gwefrydd | `Artus_Streben/Haus_Gwefrydd` | Baronie Arthus Streben | 9 / 3 / 20 | 4 → 5 |
| Gwyvern | `Gwendolyns_Ufer/Haus_Gwyvern` | Baronie Gwendolyns Ufer | 6 / 2 / 20 | 4 → 5 |
| Arwydd | `Rhonwens_Traenen/Haus_Arwydd` | Herrschaft Rhonwens Tränen | 1 / 3 / 20 | 2 → 3 |

„Active“ in der Hausseiten-Registry bezeichnet eine verfügbare Seite. Illysywen ist inhaltlich ausdrücklich **ausgestorben**: mit letztem Oberhaupt, ehemaliger Erbfolge und historischen Hofämtern. Auf der Herrschaftsseite steht das Wappen bereits bei den ausgestorbenen Häusern.

## Verbindliche Darstellungsregeln

- Herrschaftsbanner zentriert und höchstens 240 Pixel breit; anklickbar zur jeweiligen Herrschaftsseite.
- Wappen auf Herrschaftsseiten öffnen die ausführliche Hausseite. Das Stammbaum-Wappen öffnet die kurze Hausbio.
- Historische Figurentabellen bleiben zentriert. **Ergänzung vom 11. September:** Die Portraits nutzen die gesamte innere Höhe ihrer Bildzelle, abzüglich des bestehenden Innenabstands. `object-fit: contain` erhält das Seitenverhältnis und das vollständige Motiv. Die Regel liegt zentral in `assets/css/haeuser.css` und gilt auch für Draig und weitere Hausseiten.
- Hofkarten bleiben innerhalb ihres Rasters gleich groß. Namenlose Ämter verwenden männliche bzw. weibliche Silhouetten entsprechend der Bildspalte der Quelle; ihre Beschriftung lautet „Nicht benannt“.
- Die Kurzbiografie bleibt unter 200 Wörtern Fließtext. Keine Hofämter, vollständigen Oberhauptlisten oder langen Chroniken im Dialog.
- Fehlende Mottos werden nicht erfunden; Arwydds überliefertes Motto bleibt erhalten.

## Redaktionelle Entscheidungen und offene Angaben

| Befund | Behandlung |
| --- | --- |
| Castellbyrn / Castellbryn | **Castellbryn**, entsprechend Profilen und bestehenden Familienakten. |
| Beldyn / Bledyn in der Gwyvern-Vorlage | **Bleddyn Draig**, entsprechend der vorhandenen Person `bleddyn-draig`; keine zweite Gründerperson. |
| Iwalladr in der Arwydd-Vorlage | **Idwalladr Arwydd**, entsprechend `idwalladr-arwydd`. Idris bleibt der eigentliche Hausgründer. |
| Knywrig / Kynwrig bei Gafyr | **Kynwrig** entsprechend Oberhauptliste und Stammbaum. Garym ist Ahnherr, sein Sohn Kynwrig Hausgründer. |
| Tallwach / Tallwch bei Gwefrydd | **Tallwch**, entsprechend Chronik, Oberhauptliste und Personen-ID. |
| Gwyvern und Gwefrydd: alte Tabellenüberschrift „Ritterfürst“ | Zu **Baron / Baronenhaus** korrigiert, entsprechend Profil und Gründungsgeschichte. |
| Artus Streben / Arthus Streben | Inhaltliche Region und Ordner folgen **Artus Streben** im Stammbaum. Der Bannerlink verwendet den vorhandenen Dateipfad **Baronie Arthus Streben**. Keine Umbenennung bestehender Herrschaftsdateien. |
| Avalon / Avallorn; Dame des Sees / Dame der See | Projektbegriffe **Avallorn** und **Dame der See** vereinheitlicht. |
| Gafyr nennt im Profil den Streiter, im Kulturtext den Templer | Beide Nennungen erhalten; die Gottheiten werden nicht ohne Beleg gleichgesetzt. |
| Wyrm: „um 1100“, erste Amtszeit aber 1128–1171 | Gründung im **12. Jahrhundert** eingeordnet und Beginn der belegten Amtsfolge **1128** genannt. Kein genaueres Gründungsjahr erfunden. |
| Illysywen: Verbrechen im Fließtext dem „Oberhaupt“ zugeordnet | Die bestehende Familienakte bezeichnet ausdrücklich **Nodawl** als Rhonwens Täter. **Ercwlff** bleibt das letzte Oberhaupt. Diese Rollen wurden getrennt. |
| Illysywen: Arwels rascher Aufstieg und Tod, Owains Bewunderung und viel ältere Abstammung passen zeitlich nicht sicher zusammen | Erzählung und bekannte Amtszeiten erhalten; keine neuen Lebensdaten oder künstlich eingefügten Generationen. Die genaue Chronologie bleibt offen. |
| Gwyvern-Küchenmeister „Brevan Caerthwyn“; dasselbe Quellenportrait gehört in der vorhandenen Akte zu „Breven“, Adeons Ehefrau | Quellenname und Portrait erhalten. **Kein Personenlink**, da die Namens-/Identitätszuordnung nicht eindeutig ist. Kein neuer Stammbaumknoten und keine Umbenennung der bestehenden Person. Zur Klärung vorgemerkt. |
| Unbekannte Ämter | Sechs Häuser: je 20 Silhouetten. Gwyvern: 13 Silhouetten und sieben benannte Amtsinhaber. Für sechs eindeutig zuordenbare Amtsinhaber öffnen die Portraits ihre eigenen Familienakten. |
| Leere historische Figuren und Trivia | Keine „Name/Beschreibung“-Platzhalter übernehmen. Gründer und wichtige Ahnen ausschließlich anhand der enthaltenen Chronik beschreiben; Trivia aus belegten Sachangaben ableiten. |
| Mottos und unvollständige Datumsangaben | Arwydds Motto erhalten; sonst „Nicht überliefert“. Amtszeiten der Vorlagen bleiben von Lebensdaten getrennt, Lücken werden nicht geschlossen. |

Die überlieferte Paktformel der Illysywen bleibt vollständig erhalten. Arwels Fischerportrait wird neben seinem späteren Heroldportrait gezeigt. Beide Darstellungen verweisen auf denselben bestehenden Arwel-Eintrag.

## Architektur und Speicherung

Keine weiteren HTML-Komplettkopien, neuen globalen Zustände oder eigenen Bio-Dialoge. Die sieben Hausquellen verwenden die bestehende Ausgabezuordnung und denselben Builder wie Draig. Das gemeinsame Modul unterstützt zusätzlich ausgestorbene Häuser und die Zuordnung von Kadettenhäusern zu Draig.

Die Familienakten importieren nur ihre kurze generierte Bio und erhöhen ihre Quellenrevision um eins. Der vorhandene Upgrade-Pfad ergänzt fehlende Bios, ohne den Familiengraphen zu verändern. Eigene Texte und ausdrücklich entfernte Bios bleiben erhalten. Die bestehenden Tests prüfen diese Fälle für jedes neue Haus.

Arwydds früherer Datensatz bleibt als Altdatei erhalten; die bestehende Registry-ID lädt jetzt die neue gemeinsame Inhaltsquelle. Vorhandene Speicher-IDs werden nicht umbenannt.

## Prüfung

- 21 neue Integrationsprüfungen erfolgreich: Registry-/Bannerziele, lokale Bilder, Personenlinks, Hofzahlen, Kurzfassungen, ausgestorbener Status und Erhalt eigener Stammbaumdaten.
- Alle 1.246 vorhandenen Stammbaumtests erfolgreich. Drei feste Revisionserwartungen wurden angepasst; der Undo-Test prüft nun die Wiederherstellung der bereits vorhandenen Arwydd-Bio.
- Die acht Draig-Prüfungen bestanden nach Erweiterung der gemeinsamen Ausgabezuordnung.
- Browserprüfung erfolgreich: alle sieben Hausseiten bei 1.440, 768 und 390 Pixeln ohne internen horizontalen Überlauf; gleich hohe Hofkarten, zentrierte Figurentabellen, Banner höchstens 240 Pixel breit. Historische Portraits füllen ihre Bildfelder und bleiben innerhalb der Zellen.
- Alle sieben Banner-/Wappen-Klickwege zwischen Haus und Herrschaft sowie die Personenlinks zum jeweiligen letzten Oberhaupt und die sieben Kurzbiografien geprüft. Keine JavaScript-Laufzeitfehler oder fehlenden erforderlichen lokalen Bilder.
- Alle acht generierten Hausdatensätze einschließlich Draig stimmen mit ihren Inhaltsquellen überein (`--check`).
- Draigs historische Portraits ebenfalls bei drei Bildschirmbreiten geprüft; die beiden bestehenden Vorlagenseiten laden weiterhin. Auf der Grafschaftsseite führen die Wappen aller sieben gegenwärtigen großen Adelshäuser zu ihren vollständigen Hausseiten. Arwydds Motto bleibt sichtbar, eine leere Autorenzeile wird ausgeblendet.

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/celtigerns-house-pages.test.mjs"
node "Familien Häuser und Clans/tests/house-draig.test.mjs"
```

## Lokale Vorschau

Nachtrag zur Grafschaftsseite: Direkte Hausseitenziele sind auch in `grafschaft.data.js`, der HTML-Grundlage und den Bildlinks des Inline-Exports hinterlegt. Unterhalb der übrigen Haussektionen werden Illysywen, Morveth, Skellor und Ui Talamh als ausgestorbene Häuser aufgeführt. Die dauerhafte Regel steht in [HERRSCHAFTSSEITEN-VORGEHEN.md](../Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md).

- [Illysywen](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-illysywen)
- [Gafyr](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-gafyr)
- [Wyrm](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-wyrm)
- [Saethwyr](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-saethwyr)
- [Gwefrydd](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-gwefrydd)
- [Gwyvern](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-gwyvern)
- [Arwydd](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-arwydd)
