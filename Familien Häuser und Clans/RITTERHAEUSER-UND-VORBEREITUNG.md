# Ritterhäuser und vorbereitete Häuser in Celtigerns Wacht

Stand: 11. September 2026.

**Historisches Ausbauprotokoll:** Die nachfolgend beschriebene Gesamtliste von 77 Karten wurde auf Nutzerwunsch ersetzt. Aktuell zeigt Celtigerns Wacht 37 Karten; die übrigen Häuser stehen auf ihren jeweiligen Herrschaftsseiten. Ard Conbhrón, Illysywen und Ui Talamh bilden die historische Gruppe der Grafschaft; Morveth und Skellor stehen bei Rhonwens Tränen. Alle 77 Hausseiten und Bios bleiben bestehen. Weitere 18 Quellen sind inzwischen eingearbeitet. Maßgeblich sind [GWENDOLYNS-UFER-HAUSSEITEN.md](GWENDOLYNS-UFER-HAUSSEITEN.md) und [HERRSCHAFTSSEITEN-VORGEHEN.md](../Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md).

## Ergebnis und Umfang

Die Hausübersicht von Celtigerns Wacht enthält jetzt **77 Häuser**, jeweils mit ausführlicher Hausseite, lokalem Wappen und erreichbarer Stammbaum-Bio. Die Übersicht gleicht die 76 Familienakten im Stammbaumordner Celtigerns Wacht sowie das dort bereits angezeigte Haus von Hochreuth ab. Dessen territoriale Zuordnung bleibt ausdrücklich ungeklärt.

Zu den acht zuvor erstellten Hausseiten kommen **69 neue Hausseiten**: 15 Übernahmen der eingereichten Quellen und 54 Vorbereitungen ohne neuen Altcode. Es wurden **67 neue kurze Bios** angelegt. Falchdyn und Bradrhith hatten bereits eigene Bios; diese bleiben erhalten und enthalten nun zusätzlich den Link zur jeweiligen Hausseite.

Fehlende Kapitel heißen „Folgt …“, unbelegte Profildaten bleiben leer. Auch die ausgestorbenen Ritterhäuser **Morveth und Skellor** sind mit Wappen, Hausseite und Bio vorbereitet. Die Sektion **Ausgestorbene Häuser** steht nach allen anderen Hausgruppen und umfasst Illysywen, Morveth, Skellor und Ui Talamh. Ard Conbhrón ist wegen seiner noch lebenden Angehörigen gesondert unter den antiken Clans aufgeführt.

- [Celtigerns Wacht – Hausübersicht](http://127.0.0.1:5500/Kontinente/Estryll/K%C3%B6nigreich%20Cenyr/Grafschaft%20Celtigerns%20Wacht/Grafschaft%20Celtigerns%20Wacht.html?v=20260911f#familien)
- [Beispiel: Haus Tlawd](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-tlawd)
- [Beispiel: vorbereitetes Haus Morveth](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=haus-morveth)

## Ausführungsplan und Vorgehen

1. **Quellen archivieren.** Alle 15 Anhänge unverändert im zugehörigen Hausordner als `animexx-original.html` sichern. `quellen.json` dokumentiert den Anhang und die Herkunft lokal übernommener Illustrationen.
2. **Bestand abgleichen.** Haus-IDs, Wappen, Personen, Generationen, Rang und territoriale Einordnung mit den bestehenden Familienakten vergleichen. Die Hausübersicht vollständig nach Regionen abgleichen; unbekannte Sitznamen und Lehnsherren nicht ergänzen.
3. **Texte redigieren.** Schreibfehler und missverständliche Formulierungen verbessern, konkrete Inhalte erhalten. Erzählerische Szenen aus den Quellen als aufklappbare Abschnitte übernehmen. Leere Vorlagentexte und fiktive Beispielpersonen entfernen.
4. **Widersprüche offenhalten.** Ungeklärte Felder leer lassen, strittige Personen nicht mit ähnlich benannten Datensätzen verknüpfen. Die Entscheidungen und offenen Fragen stehen unten. Keine Abstammungen oder Lebensdaten im Stammbaum verändern.
5. **Gemeinsame Inhalte pflegen.** Jedes Haus bekommt eine eigene `haus.content.mjs`. Daraus werden Seitendaten und eine eigenständig formulierte Kurzfassung für die Bio erzeugt. Die vorhandenen großen und kleinen Hausvorlagen werden wiederverwendet.
6. **Bilder und Darstellung prüfen.** Lokale Wappen und Portraits wiederverwenden, die 15 Hausmotive aus den Originalen lokal sichern. Unbenannte Hofämter erhalten die passenden Silhouetten. Die zuvor vereinbarten Layoutkorrekturen gelten weiterhin.
7. **Navigation verbinden.** Wappen und Namen auf Herrschaftsseiten führen direkt zur Hausseite. Das Hauswappen im Stammbaum öffnet die Bio. Das Herrschaftsbanner verlinkt die belegte Herrschaftsseite. Bereits gespeicherte eigene Bios bleiben beim Ergänzen neuer Standardbios erhalten.
8. **Bestand vorbereiten.** Für alle übrigen Häuser Wappen und belegte Basisangaben übernehmen; Chronik, unbekannte Oberhauptfolgen und fehlende Illustrationen bleiben als Vorbereitung erkennbar.
9. **Prüfen und dokumentieren.** Vollständigkeit, Quellen, Bilder, Personenlinks, gespeicherte Bios, breite und schmale Ansichten sowie tatsächliche Klickwege prüfen.

Alle Schritte sind umgesetzt. Die offenen Lore-Fragen sind bewusst nicht durch erfundene Angaben geschlossen worden.

## Offene Fragen und redaktionelle Entscheidungen

| Haus | Befund | Behandlung / noch zu klären |
| --- | --- | --- |
| Tlawd | Infotabelle nennt 1285 als Gründung; die historische Beschreibung nennt für die Erlaubnis zur Hausgründung 1286–1288. | Gründungsfeld leer. Ritterschlag 1285 sowie Pagen- und Knappenjahre bleiben erhalten. Welches Jahr gilt für die eigentliche Hausgründung? |
| Tlawd | Edric wird mit 1264–1328 geführt. | Diese Spanne als **Lebensdaten**, nicht als Amtszeit anzeigen. |
| Rhyddid | Die alte Oberhaupttabelle nennt Kerwin doppelt, darunter als aktuellen Nachfolger ab 1735. Die Familienakte führt Taran als aktuelles Oberhaupt. | Die belegte Person Taran und die Erben Arian/Artie aus dem Stammbaum verwenden; keine ungeklärte Amtszeit auf Taran übertragen. Gründung 1272 bleibt aus dem Profil erhalten. Die Rettung der Kinder 1262 widerspricht dieser späteren Gründung nicht. |
| Rhyddid | Eine allgemeine Tabellenangabe nennt nur Haus Wyrm als Rittervater/-mutter, während die Geschichte Myfanwy Saethwyr nennt. | Die konkret beschriebene Rittermutter Myfanwy verwenden; die Lehnstreue zu den Wyrm bleibt davon getrennt. |
| Gelyn | Gwynthor und Tŵr Gwynthstorm werden als Orte genannt. | Beide belegten Orte erhalten; nicht eigenmächtig auf einen einzigen Sitz reduzieren. |
| Cludwyr | Profil nennt Gwynthor, Fließtext beschreibt Bronhir als eigentlichen Hauptsitz. „Beschaulicher“ Wohlstand steht umfangreichen Besitzungen im Text gegenüber. | Hauptsitz und Wohlstand im Profil leer. Beide Orte und die belegten Besitzangaben im Text erhalten. Welcher Hauptsitz und welche Vermögensstufe gelten? |
| Chwedonol | Im Projekt lautet die stabile ID `haus-chwedlonol`, in der Quelle überwiegend Chwedonol. | Anzeigename Chwedonol; bestehende ID und Personenbeziehungen bleiben erhalten. |
| Chwedonol | Historische Überschrift nennt Rhonwen, Beschreibung Romney (61). Die Personenakte und gleichnamige Personen lassen keine sichere Zuordnung zu. Auch eine Ehepartnerangabe bei Cieran ist davon betroffen. | Kommandantin ohne Namen/Personenlink, mit weiblicher Silhouette. Strittiger historischer Eintrag bleibt „Zuordnung folgt …“. Die widersprüchliche Ehepartnerangabe wird nicht als gesichert wiederholt. Welche Person ist gemeint? |
| Gostyn | Profil gibt 1300–1500 an, historischer Text 1333–1553 für Cynans Tätigkeit/Entstehung des Hauses. | Gründungsfeld leer; keine einzelne Jahreszahl daraus ableiten. |
| Gostyn | Egon Gafyr wird als historischer Rittervater genannt. Die heutige gleichnamige Person gehört einer anderen Generation an. | Namen aus der Quelle erhalten, aber keinen Link zur falschen Person setzen. |
| Gostyn | Fasten/Pilgerfahrt werden einmal als Pflicht, im Garmon-Abschnitt als freiwillig beschrieben. | Die Überlieferung erhalten, die Verbindlichkeit offen formulieren. Gilt sie für alle Angehörigen oder nur als Ideal? |
| Loer | Schreibweisen Loer/Lloer; Wohlstand im Profil „beschaulich“, im Fließtext reich. Ein Religionssatz bricht ab. | Projektname Loer verwenden, Wohlstand leer lassen. Belegte Religion und Verbindung zur Regenbogenschmiede erhalten; den fehlenden Satzteil nicht erfinden. |
| Sgrechiwr | Infotabelle hat einen leeren Hausnamen und beschreibt beschaulichen Wohlstand; Fließtext schildert beträchtliches Vermögen. | Namen aus Titel, Wappen und Akte übernehmen; Wohlstand leer. Oberhaupt Gareth und nachweisliche Erben anhand der bestehenden Rollen zuordnen. Nicht jede Person mit interner Linienmarkierung wird deshalb als amtierendes Oberhaupt ausgegeben. |
| Ard Conbhrón | Alter Code bezeichnet den Clan als ausgestorben; die Akte nennt Scáthach, Tlachtga und Uathach als Überlebende. | Als **nahezu erloschen**, nicht als sicher ausgestorben einordnen. Der endgültige Status benötigt Klärung. |
| Ard Conbhrón | „Baron“ und „Lairdtum (Baronie)“ im Profil passen nicht eindeutig zur beschriebenen Tiarnatum-Struktur. | Rang und Herrschaftstyp im Profil leer; kein aktuelles Oberhaupt erfinden. Die vorhandene Tiarnatum-Beschreibung bleibt erhalten. |
| Ui Talamh | Infotabelle nennt irrtümlich Clan Ard Conbhrón; Sitz enthält ein Fragezeichen vor Gwynthor. | Hausname anhand von Titel/Wappen/Akte zu Ui Talamh korrigieren. Hauptsitz leer lassen. Keine sichere Sitzangabe aus dem Platzhalter ableiten. |
| Ui Talamh | Haus besteht laut Akte nicht mehr eigenständig; Nachkommen sind eingeheiratet. Kein belegtes Endjahr. | Unter ausgestorbenen Häusern aufführen, ohne ein Endjahr zu erfinden. |
| Morveth / Skellor | Als ausgestorben in den bestehenden Familiendefinitionen erfasst; neue historische Texte und genaue Sitze fehlen. | Seiten und Bios mit lokalen Wappen und bekannten Regionalangaben vorbereiten. Chronik „Folgt …“, unbekannte Daten leer. Kein Übertrag des Illysywen-Jahres 1720. |
| Von Hochreuth | Die Celtigerns-Wacht-Karte ordnete das Haus Gafyr zu; die Familienakte führt Goldmund / Haus Roden. | Hausseite am bestehenden fachlichen Ablageort unter Goldmund vorbereiten. Umstrittene Grafschafts-/Lehnsherren-/Sitzzuordnung und Bannerlink bleiben leer. In der Grafschaftsübersicht „Zuordnung folgt …“. Gehört es historisch oder aktuell zu Celtigerns Wacht? |

Weitere reine Schreibvarianten wie Heddwyn/Haddwyn und Rhodri/Rhodhri wurden anhand der eindeutig zuordenbaren bestehenden Personen vereinheitlicht. Unvollständige Amtstitel wurden nicht vervollständigt: etwa Deiniol Gostyn bleibt Paladin im Dienst Gafyrs, die genaue Aufgabe folgt.

## Pflege und Architektur

Die fachlichen Quellen liegen unter `Estryll/Cenyr/Celtigerns_Wacht/<Region>/Haus_<Name>/`. Von Hochreuth behält seinen bestehenden Bezug zu Goldmund. Der vollständige Bestand ist unten mit den Arbeitsdateien verlinkt.

- `haus.content.mjs`: redaktionelle Quelle, auch für spätere Ergänzungen. `prepared: true` kennzeichnet Vorbereitungen; fehlende Kapitel enthalten „Folgt …“.
- `haus.data.js`: generierte Seitendaten für den bestehenden Loader.
- `haus.biography.mjs`: generierte kurze Bio. `biographySummary` enthält die eigene Kurzfassung, keine Hofämter oder vollständige Oberhauptfolge.
- `animexx-original.html`, `quellen.json`, `assets/hausmotiv.png`: unveränderte Quelle und Herkunft der übernommenen Illustration, sofern neuer Altcode vorlag.
- `modules/house-content/house-content-outputs.mjs`: gemeinsame Zuordnung zu den beiden Ausgaben. `house-scenes.js` ergänzt optionale Textszenen mit nativen aufklappbaren Abschnitten.

`scripts/build-house-content.mjs` findet die Quellen unter `Estryll/` automatisch. Es schreibt die Seitendaten, Bios und die markierten Registry-Einträge. Neue Häuser werden mit `registerPage: true` aufgenommen; `page` entscheidet zwischen `haus.html` und `kleinehaeuser.html`. Beide sind vollständige Hausseitenvorlagen, während die Stammbaum-Bio ein eigener kurzer Dialog bleibt. Generierte Dateien nicht direkt bearbeiten.

Für neu ergänzte Bios ist `biographySourceRevision` eine bewusst gesetzte Quellrevision. Sie wird nicht bei jedem Build automatisch erhöht. `Stammbäume/assets/js/data/house-biographies.registry.js` und das kleine Modul `house-biography-registry-default.js` ergänzen die Bio, ohne die Rohakte oder den Familiengraphen zu verändern. Eine bereits zugewiesene Bio – einschließlich bewusstem `null` – hat Vorrang. Die vorhandene Upgrade-Logik schützt individuelle Fassungen beim Laden älterer gespeicherter Akten.

**Ausnahmen Falchdyn und Bradrhith:** `biographyManagedExternally: true` erhält ihre schon bestehenden Bios. Deren Inhalte werden weiterhin in `Stammbäume/assets/js/data/house-falchdyn-family.js` beziehungsweise `house-bradrhith-biography.js` gepflegt. Der Generator erzeugt für diese beiden keine konkurrierende Bio. Die neuen Hausseiten sind dennoch normal über ihre jeweiligen `haus.content.mjs` bearbeitbar.

## Beibehaltene Darstellung und Navigation

- Banner mittig, maximal 240 Pixel breit; Klick auf die konkret belegte Herrschaftsseite über `territoryHref`.
- Historische Figurentabellen zentriert; Portraits nutzen die volle innere Bildzellenhöhe mit unverzerrtem Seitenverhältnis.
- Gleich große Karten pro Hofraster; unbekannte Amtsträger erhalten männliche/weibliche Silhouetten entsprechend der Quelle.
- Vollständig fehlende historische Figuren erzeugen keine vorgetäuschten Personen oder leeren großen Tabellen. Der Kapiteltext bleibt „Folgt …“.
- Wappen und Hausname in der Grafschaft und den zugehörigen Herrschaftsseiten führen zur ausführlichen Hausseite. Bestehende HTML-Grundlagen und Inline-Export-Links wurden ebenfalls abgeglichen, ohne zusätzliche statische Bilder und dadurch verschobene Bildnummern einzufügen.
- Im Stammbaum öffnet das Hauswappen die kurze Bio. Personenportraits auf den Hausseiten führen zur tatsächlich zugeordneten Person im Stammbaum.
- Die zentrale Grafschaftsübersicht enthält alle 77 Häuser genau einmal. Ausgestorbene Häuser stehen zuletzt. Diese Regeln gelten auch für künftig angelegte Herrschaftsseiten.

## Prüfung

Erfolgreich geprüft: alle 1.246 Tests der Stammbaum-Testfolge sowie die Hausseiten- und Grafschaftsprüfungen. Die ergänzende Vollständigkeitsprüfung erfasst alle 77 Häuser, alle 15 archivierten Originale, die 54 Vorbereitungen, lokale Bilder, Personenlinks und den Erhalt eigener Bios.

Im Browser wurden alle 77 Hausseiten samt benötigten Bildern geladen, 15 Hausbios geöffnet sowie zwölf Kombinationen aus Hausseite und Bildschirmbreite (1.440, 768 und 390 Pixel) kontrolliert. Geprüft wurden Bannergröße, zentrierte historische Tabellen, volle Portraitzellenhöhe, gleiche Hofkartenhöhen und fehlender horizontaler Überlauf. Die direkten Wappenlinks der Grafschaft und der Rückweg über das Tlawd-Banner zur Herrschaft der Gafyr wurden tatsächlich geöffnet.

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/celtigerns-complete-inventory.test.mjs"
node "Familien Häuser und Clans/tests/celtigerns-house-pages.test.mjs"
node "Familien Häuser und Clans/tests/house-draig.test.mjs"
node "Kontinente/tests/celtigerns-wacht-families.test.mjs"
# Im Ordner Stammbäume:
node tests/run-tests.js
```

Die Inhalte sind lokal im Projekt angelegt. Es wurde nichts in externe Dienste veröffentlicht.

## Vollständiger Arbeitsbestand

Die Hausnamen verlinken die redaktionellen Arbeitsdateien. „Quelle“ bezeichnet die Reihenfolge der 15 eingereichten Anhänge.

### Antike Crannath Clans (2)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Ard Conbhrón](Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ard_Conbhron/haus.content.mjs) | `haus-ard-conbhron` | Quelle 14 übernommen |
| [Haus Ui Talamh](Estryll/Cenyr/Celtigerns_Wacht/Antike_Crannath_Clans/Haus_Ui_Talamh/haus.content.mjs) | `haus-ui-talamh` | Quelle 15 übernommen; ausgestorben |

### Artus Streben (15)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Gwefrydd O'Rhosmere](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwefrydd/haus.content.mjs) | `haus-gwefrydd` | Bereits zuvor erstellt |
| [Haus Almarch](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Almarch/haus.content.mjs) | `haus-almarch` | Vorbereitet · Inhalt folgt |
| [Haus Althin](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Althin/haus.content.mjs) | `haus-althin` | Vorbereitet · Inhalt folgt |
| [Haus Brinmarch](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Brinmarch/haus.content.mjs) | `haus-brinmarch` | Vorbereitet · Inhalt folgt |
| [Haus Coedvarn](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Coedvarn/haus.content.mjs) | `haus-coedvarn` | Vorbereitet · Inhalt folgt |
| [Haus Eirfael](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Eirfael/haus.content.mjs) | `haus-eirfael` | Vorbereitet · Inhalt folgt |
| [Haus Ghorswyn](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Ghorswyn/haus.content.mjs) | `haus-ghorswyn` | Vorbereitet · Inhalt folgt |
| [Haus Gwardin](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwardin/haus.content.mjs) | `haus-gwardin` | Vorbereitet · Inhalt folgt |
| [Haus Gwynrhos](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Gwynrhos/haus.content.mjs) | `haus-gwynrhos` | Vorbereitet · Inhalt folgt |
| [Haus Talmeirch](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Talmeirch/haus.content.mjs) | `haus-talmeirch` | Vorbereitet · Inhalt folgt |
| [Haus Tirwyn](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Tirwyn/haus.content.mjs) | `haus-tirwyn` | Vorbereitet · Inhalt folgt |
| [Haus Bekab](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Bekab/haus.content.mjs) | `haus-bekab` | Vorbereitet · Inhalt folgt |
| [Haus Iorwen](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Iorwen/haus.content.mjs) | `haus-iorwen` | Vorbereitet · Inhalt folgt |
| [Haus Maethan](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Maethan/haus.content.mjs) | `haus-maethan` | Vorbereitet · Inhalt folgt |
| [Haus Rhen](Estryll/Cenyr/Celtigerns_Wacht/Artus_Streben/Haus_Rhen/haus.content.mjs) | `haus-rhen` | Vorbereitet · Inhalt folgt |

### Camruisge (1)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Garrael](Estryll/Cenyr/Celtigerns_Wacht/Camruisge/Haus_Garrael/haus.content.mjs) | `haus-garrael` | Vorbereitet · Inhalt folgt |

### Goldmund / Zuordnung offen (1)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus von Hochreuth](Estryll/Goldmund/Unsortiert/Unsortiert/Haus_von_Hochreuth/haus.content.mjs) | `haus-von-hochreuth` | Vorbereitet · Inhalt folgt |

### Gwendolyns Ufer (18)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Gwyvern O'Abergwint](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyvern/haus.content.mjs) | `haus-gwyvern` | Bereits zuvor erstellt |
| [Haus Annwyl](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Annwyl/haus.content.mjs) | `haus-annwyl` | Vorbereitet · Inhalt folgt |
| [Haus Barus](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Barus/haus.content.mjs) | `haus-barus` | Vorbereitet · Inhalt folgt |
| [Haus Cenfig](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cenfig/haus.content.mjs) | `haus-cenfig` | Vorbereitet · Inhalt folgt |
| [Haus Cysgodion](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Cysgodion/haus.content.mjs) | `haus-cysgodion` | Vorbereitet · Inhalt folgt |
| [Haus Daran](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Daran/haus.content.mjs) | `haus-daran` | Vorbereitet · Inhalt folgt |
| [Haus Edmy](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Edmy/haus.content.mjs) | `haus-edmy` | Vorbereitet · Inhalt folgt |
| [Haus Gwyntog](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Gwyntog/haus.content.mjs) | `haus-gwyntog` | Vorbereitet · Inhalt folgt |
| [Haus Penwyn](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Penwyn/haus.content.mjs) | `haus-penwyn` | Vorbereitet · Inhalt folgt |
| [Haus Rhuddgar](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Rhuddgar/haus.content.mjs) | `haus-rhuddgar` | Vorbereitet · Inhalt folgt |
| [Haus Seldryn](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Seldryn/haus.content.mjs) | `haus-seldryn` | Vorbereitet · Inhalt folgt |
| [Haus Selog](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Selog/haus.content.mjs) | `haus-selog` | Vorbereitet · Inhalt folgt |
| [Haus Taranvyr](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Taranvyr/haus.content.mjs) | `haus-taranvyr` | Vorbereitet · Inhalt folgt |
| [Haus Tawelgar](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Tawelgar/haus.content.mjs) | `haus-tawelgar` | Vorbereitet · Inhalt folgt |
| [Haus Trydar](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Trydar/haus.content.mjs) | `haus-trydar` | Vorbereitet · Inhalt folgt |
| [Haus Ymladd](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Ymladd/haus.content.mjs) | `haus-ymladd` | Vorbereitet · Inhalt folgt |
| [Haus Caerlaen](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerlaen/haus.content.mjs) | `haus-caerlaen` | Vorbereitet · Inhalt folgt |
| [Haus Caerthwyn](Estryll/Cenyr/Celtigerns_Wacht/Gwendolyns_Ufer/Haus_Caerthwyn/haus.content.mjs) | `haus-caerthwyn` | Vorbereitet · Inhalt folgt |

### Llamreis Ankunft (32)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Arwydd O'Castellbryn](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Arwydd/haus.content.mjs) | `haus-arwydd` | Bereits zuvor erstellt |
| [Haus Draig O'Gwynthor](Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/haus.content.mjs) | `haus-draig` | Bereits zuvor erstellt |
| [Haus Wyrm O'Gwynthor](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Wyrm/haus.content.mjs) | `haus-wyrm` | Bereits zuvor erstellt |
| [Haus Saethwyr O'Gwynthor](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Saethwyr/haus.content.mjs) | `haus-saethwyr` | Bereits zuvor erstellt |
| [Haus Gafyr O'Gwynthor](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gafyr/haus.content.mjs) | `haus-gafyr` | Bereits zuvor erstellt |
| [Haus Dubhan](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Dubhan/haus.content.mjs) | `haus-dubhan-gwynthor` | Vorbereitet · Inhalt folgt |
| [Haus Bleiddorn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bleiddorn/haus.content.mjs) | `haus-bleiddorn` | Vorbereitet · Inhalt folgt |
| [Haus Cymrath O'Traethlan](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cymrath_OTraethlan/haus.content.mjs) | `haus-cymrath-o-traethlan` | Vorbereitet · Inhalt folgt |
| [Haus Gwyllach](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gwyllach/haus.content.mjs) | `haus-gwyllach` | Quelle 12 übernommen |
| [Haus Sgrechiwr](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Sgrechiwr/haus.content.mjs) | `haus-sgrechiwr` | Quelle 13 übernommen |
| [Haus Tlawd](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tlawd/haus.content.mjs) | `haus-tlawd` | Quelle 01 übernommen |
| [Haus Rhyddid](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Rhyddid/haus.content.mjs) | `haus-rhyddid` | Quelle 02 übernommen |
| [Haus Gelyn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gelyn/haus.content.mjs) | `haus-gelyn` | Quelle 03 übernommen |
| [Haus Cludwyr](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Cludwyr/haus.content.mjs) | `haus-cludwyr` | Quelle 04 übernommen |
| [Haus Chwedonol](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Chwedonol/haus.content.mjs) | `haus-chwedlonol` | Quelle 05 übernommen |
| [Haus Balchder](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Balchder/haus.content.mjs) | `haus-balchder` | Quelle 06 übernommen |
| [Haus Eneiniog](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Eneiniog/haus.content.mjs) | `haus-eneiniog` | Quelle 07 übernommen |
| [Haus Gostyn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Gostyn/haus.content.mjs) | `haus-gostyn` | Quelle 08 übernommen |
| [Haus Awenydd](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenydd/haus.content.mjs) | `haus-awenydd` | Quelle 09 übernommen |
| [Haus Awenor](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Awenor/haus.content.mjs) | `haus-awenor` | Quelle 10 übernommen |
| [Haus Loer](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Loer/haus.content.mjs) | `haus-loer` | Quelle 11 übernommen |
| [Haus Draenmelyn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Draenmelyn/haus.content.mjs) | `haus-draenmelyn` | Vorbereitet · Inhalt folgt |
| [Haus Pendrwn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Pendrwn/haus.content.mjs) | `haus-pendrwn` | Vorbereitet · Inhalt folgt |
| [Haus Swyll](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Swyll/haus.content.mjs) | `haus-swyll` | Vorbereitet · Inhalt folgt |
| [Haus Aelmor](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Aelmor/haus.content.mjs) | `haus-aelmor` | Vorbereitet · Inhalt folgt |
| [Haus Maerllys](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Maerllys/haus.content.mjs) | `haus-maerllys` | Vorbereitet · Inhalt folgt |
| [Haus Braglas](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Braglas/haus.content.mjs) | `haus-braglas` | Vorbereitet · Inhalt folgt |
| [Haus Tonnarth](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Tonnarth/haus.content.mjs) | `haus-tonnarth` | Vorbereitet · Inhalt folgt |
| [Haus Ysgrif](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Ysgrif/haus.content.mjs) | `haus-ysgrif` | Vorbereitet · Inhalt folgt |
| [Haus Falchdyn](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Falchdyn/haus.content.mjs) | `haus-falchdyn` | Vorbereitet · Inhalt folgt; vorhandene Bio erhalten |
| [Haus Bradrhith](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Bradrhith/haus.content.mjs) | `haus-bradrhith` | Vorbereitet · Inhalt folgt; vorhandene Bio erhalten |
| [Haus Argall](Estryll/Cenyr/Celtigerns_Wacht/Llamreis_Ankunft/Haus_Argall/haus.content.mjs) | `haus-argall` | Vorbereitet · Inhalt folgt |

### Rhonwens Tränen (8)

| Haus / Arbeitsdatei | Stabile ID | Stand |
| --- | --- | --- |
| [Haus Illysywen O'Castellbryn](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Illysywen/haus.content.mjs) | `haus-illysywen` | Bereits zuvor erstellt; ausgestorben |
| [Haus Gwared](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Gwared/haus.content.mjs) | `haus-gwared` | Vorbereitet · Inhalt folgt |
| [Haus Madryn](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Madryn/haus.content.mjs) | `haus-madryn` | Vorbereitet · Inhalt folgt |
| [Haus Merek](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Merek/haus.content.mjs) | `haus-merek` | Vorbereitet · Inhalt folgt |
| [Haus Rhenna](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Rhenna/haus.content.mjs) | `haus-rhenna` | Vorbereitet · Inhalt folgt |
| [Haus Talinvyr](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Talinvyr/haus.content.mjs) | `haus-talinvyr` | Vorbereitet · Inhalt folgt |
| [Haus Morveth](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Morveth/haus.content.mjs) | `haus-morveth` | Vorbereitet · Inhalt folgt; ausgestorben |
| [Haus Skellor](Estryll/Cenyr/Celtigerns_Wacht/Rhonwens_Traenen/Haus_Skellor/haus.content.mjs) | `haus-skellor` | Vorbereitet · Inhalt folgt; ausgestorben |
