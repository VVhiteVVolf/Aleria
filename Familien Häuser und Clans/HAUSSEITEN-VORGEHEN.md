# Hausseiten und Stammbaum-Biografien

Stand: 11. September 2026. Erste vollständige Übernahme: **Haus Draig O’Gwynthor**. Die Fortsetzung mit sieben weiteren Häusern ist in [CELTIGERNS-WACHT-HAUSSEITEN.md](CELTIGERNS-WACHT-HAUSSEITEN.md) dokumentiert.

Die anschließende Erweiterung auf alle **77 Häuser** – einschließlich Ritterhäusern, ausgestorbenen Häusern und Vorbereitungen – mit Quellenbestand und offenen Lore-Fragen steht in [RITTERHAEUSER-UND-VORBEREITUNG.md](RITTERHAEUSER-UND-VORBEREITUNG.md).

Die Fortsetzung mit Gwendolyns Ufer, zusätzlichen Kriegerbildern und der korrigierten Verteilung auf einzelne Herrschaftsseiten steht in [GWENDOLYNS-UFER-HAUSSEITEN.md](GWENDOLYNS-UFER-HAUSSEITEN.md). **77 vorhandene Seiten bedeuten keine Gesamtliste auf Celtigerns Wacht:** Dort bleiben die großen Häuser, die örtlichen Häuser aus Llamreis Ankunft und die ausdrücklich gewünschten historischen Häuser. Jede Unterherrschaft zeigt ihre eigenen Häuser und Vasallen.

## Ziel und Verantwortlichkeiten

Jedes Haus erhält eine Seite auf Grundlage der vorhandenen Häuser-/Familien-/Clan-Vorlage und eine **kurze** Hausbio im bestehenden Biografiedialog des Stammbaums. Die Hausseite enthält Wappen, ausführliche Chronik, Besitz und Hof. Die Hausbio bietet einen Überblick über Herkunft, Stellung, Werte, Sitz, aktuelles Oberhaupt und wichtige Verbindungen. Hofämter und die vollständige Oberhauptfolge gehören auf die große Hausseite.

Die fünf Korrekturen an der ersten Fassung und der Ausführungsplan stehen in [DRAIG-KORREKTURPLAN.md](DRAIG-KORREKTURPLAN.md).

Für Grafschafts- und Herrschaftsseiten gilt zusätzlich [HERRSCHAFTSSEITEN-VORGEHEN.md](../Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md): ausgestorbene Häuser anhand der Stammbaumakten vollständig erfassen und **unterhalb aller bestehenden Haussektionen** auflisten. Vorhandene ausführliche Hausseiten direkt über Wappen und Namen verlinken; die Ziele auch in Seitendaten und vorhandenen Inline-Exporten pflegen.

Die Hausseite bleibt `haus.html?haus=haus-draig`. Es entsteht keine weitere Kopie der vollständigen HTML-Vorlage. Die Genealogie bleibt in der Stammbaum-Anwendung. Gemeinsame Texte werden einmal redaktionell gepflegt und für beide Anwendungen ausgegeben.

## Ablauf für jedes weitere Haus

1. **Quelle sichern und lesen.** Alten Code im fachlichen Hausordner als `animexx-original.html` ablegen. Texte, Bildquellen, Personen, Amtszeiten, Erben, Hofämter und Kadetten erfassen. Platzhalter sind fehlende Angaben, keine Aufforderung zum Erfinden.
2. **Abgleichen.** Vorhandene Haus-ID, Weltpersonen-IDs, Portraits, Wappen und territoriale Einordnung prüfen. Gleichnamige Personen anhand ihrer Generation unterscheiden. Amtszeiten und Lebensdaten getrennt behandeln.
3. **Redigieren.** Rechtschreibung und Satzbau verbessern, Dopplungen zusammenführen, sachliche Einzelheiten erhalten. Widersprüche mit ihrer getroffenen Behandlung im Abschnitt zum jeweiligen Haus dokumentieren. Keine neuen Beziehungen, Lebensdaten oder Ämter erfinden.
4. **Inhalte anlegen.** Im fachlichen Ordner `haus.content.mjs` als gemeinsame Quelle erstellen. Dort liegen Profil, Kapitel, Personenlisten, Bilder und eine eigene redaktionelle Kurzfassung unter `biographySummary`. Richtwert für den Bio-Fließtext: unter 200 Wörter. Wiederverwendbare Ausgabezuordnung liegt in `modules/house-content/house-content-outputs.mjs`.
5. **Bilder übernehmen.** Vorhandene lokale Dateien wiederverwenden. Fehlende Originalbilder lokal beim Haus ablegen und Herkunft dokumentieren. Bei nicht benannten Ämtern die männlichen/weiblichen Silhouetten der Quelle übernehmen und „Nicht benannt“ beibehalten. Banner auf etwa 240 Pixel begrenzen und zentrieren; schmalere Figurentabellen ebenfalls zentrieren. Portraits historischer Figuren nutzen die volle innere Höhe ihrer Bildzelle und behalten mit `object-fit: contain` ihr Seitenverhältnis. Keine kleine feste Portraitbreite oder pauschale 210-Pixel-Höhenbegrenzung für diesen Abschnitt.
6. **Beide Ausgaben erzeugen.** `scripts/build-house-content.mjs` ausführen. Das Skript findet `haus.content.mjs` unter `Estryll/` automatisch und erzeugt `haus.data.js` für den vorhandenen Loader sowie `haus.biography.mjs` für den Stammbaum. Generierte Dateien nicht von Hand redigieren. Bereits eigenständig gepflegte Bios können mit `biographyManagedExternally: true` erhalten bleiben; Falchdyn und Bradrhith sind dokumentierte Beispiele.
7. **Registrieren und verbinden.** `registerPage: true` nimmt neue Häuser unter ihrer stabilen ID in den generierten Bereich der `haeuser.registry.js` auf. `page` wählt die große oder kleine Hausseitenvorlage. Familienwappen auf Herrschaftsseiten öffnen die ausführliche Hausseite, im Stammbaum die kurze Hausbio. `biographySourceRevision` bindet neue Standardbios über das separate Bio-Register an; die Quellrevision bewusst wählen und eigene gespeicherte Bios erhalten. Portraitlinks verwenden `family`, `mode=view` und die konkrete `person`-ID.
8. **Prüfen.** Erzeugte Dateien auf Aktualität, Personenlinks auf reale Ziele, Bilddateien auf Vorhandensein und die bestehende Speicher-/Upgrade-Logik auf Erhalt eigener Änderungen prüfen. Hausseite, Bio, Rücklink und eine unveränderte Altseite im Browser öffnen. Bei neuen Layoutoptionen breite und schmale Ansichten kontrollieren.
9. **Gemeinsam nacharbeiten.** Offene Lore-Fragen mit dem Nutzer klären, die gemeinsame Quelle korrigieren und beide Ausgaben neu erzeugen. Änderungen an bereits individuell gespeicherten Bios gesondert abgleichen.

## Draig: Dateien und Bedienung

Fachlicher Ordner: `Estryll/Cenyr/Celtigerns_Wacht/Haus_Draig/`.

- `animexx-original.html`: unveränderte eingereichte Quelle; nur Archiv, nicht die veröffentlichte Hausseite.
- `haus.content.mjs`: redaktionelle Arbeitsdatei für beide Ansichten.
- `haus.data.js`: generierte Hausseitendaten.
- `haus.biography.mjs`: generierte Hausbio im Format `aleria.house-module`, Version 1.
- `assets/`: Ritterbild, Banner und Ruarcs Portrait aus der Quelle.
- `Stammbäume/assets/js/data/house-draig-family.js`: bestehende Genealogie mit importierter kurzer Hausbio und Quellrevision 9.

Im Stammbaum öffnet ein Klick auf das Hauswappen die Hausbio (die vorhandene Oberfläche nennt den Dialog „Clanbeschreibung“). Die Bio enthält einen Rücklink zur Hausseite. Auf der Hausseite führen Portraits und Namen zu den entsprechenden Personen. Ruarc Balguen hat keinen belegten Datensatz in der bestehenden Familienregistrierung und erhält daher keinen erfundenen Stammbaumlink.

Die Wappen in den Familienabschnitten von Celtigerns Wacht und den weiteren Herrschaftsseiten öffnen die große Hausseite, sobald das Haus aktiv registriert ist. Die Verknüpfung liegt in der gemeinsamen Darstellung `Kontinente/assets/js/koenigreich.js`; es wird keine zweite Liste fertiggestellter Häuser gepflegt.

Umgekehrt öffnet das Herrschaftsbanner auf der Hausseite die zugehörige Herrschaftsseite. Das Ziel wird je Haus ausdrücklich unter `territoryHref` in `haus.content.mjs` gepflegt; bei Draig ist das Celtigerns Wacht. Es wird nicht aus dem Anzeigenamen oder aus einer Personen-Stammbaum-ID erraten.

Die strukturierte Hofdarstellung liegt in `modules/court/`. Sie wird nur verwendet, wenn ein Haus `court.groups` liefert. Die bisherigen statischen Hoftabellen bleiben für andere Datensätze verfügbar. Alle Karten eines Rasters haben gleiche Breite und Höhe. Eine optionale responsive Darstellung passt die neue Hausseite an schmale Ansichten an; Altseiten behalten ihr bisheriges Layout.

## Draig: redaktionelle Entscheidungen und offene Punkte

| Quelle / Befund | Behandlung |
| --- | --- |
| „Gwent“ und „Gwynthor“ werden für den Sitz verwendet. | Vorläufig durchgehend **Gwynthor**, entsprechend Titel, Profil und bestehendem Stammbaum. Ob Gwent ein historischer Name ist, bleibt offen. |
| „Aselische Kirche“ im Fließtext, „Alerische Kirche“ im Profil. | **Alerische Kirche**, passend zum Profil und bestehenden Projektbegriff. „Dame des Sees“ auf **Dame der See** vereinheitlicht. |
| Uchelwyr werden einmal als Kavalleristen und zugleich als Seekrieger bezeichnet. | Uchelwyr als berittene Ritter entsprechend dem ausführlichen Rittertum-Abschnitt; Seekrieger und Flotte gesondert erhalten. |
| Motto, Gründungsjahr, mehrere Amtszeiten und elf Hofämter ohne Namen. | Als unbekannt/nicht überliefert bzw. nicht benannt ausgewiesen. Kein Motto erfunden; kein Platzhalterzitat im Kopf der Bio. |
| Gruffyds Amtszeit endet laut Hausvorlage 1172, sein Tod laut vorhandenem Stammbaum 1171. | Amtszeit **1169–1172** aus dieser Quelle erhalten; bestehende Lebensdaten nicht verändert. **Zur Klärung vorgemerkt.** |
| „Trahaern Draig“ in der Vorlage, „Trahern“ im Stammbaum. | Anzeigename aus der Vorlage; Link auf die vorhandene Person `trahern-draig`. Schreibweise zur späteren Vereinheitlichung vorgemerkt. |
| „Heledd Draig“ in der Vorlage, Heledd Gwyvern im Stammbaum, Ehe mit Meurig Draig. | Anzeigename der Vorlage; Link auf `heledd-gwyvern`. Keine zweite Person angelegt. |
| Mailgwin Wyrm hat in anderen Projekttexten abweichende Schreibweisen. | **Mailgwin Wyrm** aus Quelle und vorhandenem Personeneintrag; keine Änderung am Stammbaum. |
| Die ältere Oberhauptfolge hat zeitliche Lücken. | Alle 17 genannten Oberhäupter erhalten; keine fehlenden Generationen ergänzt oder neue Abstammungsverbindungen erzeugt. |
| Stammbaum und Trivia waren in der Quelle leer. | Vorhandenen Stammbaum eingebettet; Trivia ausschließlich aus bereits enthaltenen Sachangaben zusammengestellt. |

Übernommen: **17 Oberhäupter**, **5 Erben**, **20 Hofämter** und **3 Kadettenhäuser**. Celtigern ist zusätzlich als Gründer ausgewiesen. Die beiden historischen Figuren werden aus der Gründungsgeschichte beschrieben.

Bildherkunft: `draig-ritter.png` aus `https://i.imgur.com/lVMVgOB.png`, `gwynthor.png` aus `https://i.imgur.com/AS9WhF5.png`, `ruarc-balguen.png` aus `https://i.imgur.com/1XmNrj5.png`. Wappen und übrige Portraits stammen aus den vorhandenen lokalen Stammbaumdateien. Der Originalcode dokumentiert die damaligen externen Bildzuordnungen.

## Speicherung und spätere Korrekturen

Der vorhandene Registry-Upgrade übernimmt die neue Bio in ältere Draig-Snapshots, wenn sie dort noch fehlt. Die unveränderte lange Standardbio aus Revision 8 wird beim Übergang zu Revision 9 gezielt durch die Kurzfassung ersetzt. Ihre vollständige normalisierte Form wird anhand eines Fingerprints erkannt; der alte Auslieferungsstand liegt als Testfixture vor. Eine bereits bearbeitete oder bewusst entfernte Bio bleibt erhalten. Deshalb wird `houseBiographyModule` **nicht** als von der Registry zwangsweise verwaltetes Feld markiert. Hausseiten-Inlineänderungen behalten ebenfalls ihren bestehenden Speicherweg und ihre stabile Haus-ID.

Eine Korrektur der Projektquelle überschreibt folglich nicht automatisch alle gespeicherten Benutzerfassungen. Bei späteren Änderungen muss geprüft werden, ob eine weitere bekannte Standardfassung in `house-biography-default-upgrade.js` übernommen werden soll oder ein bewusster Import nötig ist. Die große Hausseite und die Kurzfassung werden aus derselben Arbeitsdatei gebaut; individuelle Editorfassungen werden nicht stillschweigend zurückgesetzt.

## Befehle und lokale Links

Aus dem Projektstamm:

```powershell
node "Familien Häuser und Clans/scripts/build-house-content.mjs"
node "Familien Häuser und Clans/scripts/build-house-content.mjs" --check
node "Familien Häuser und Clans/tests/house-draig.test.mjs"
```

Zusätzlich die Stammbaumprüfungen unter `Stammbäume` ausführen (`node tests/run-tests.js` bzw. die Paket-Testfolge). Die gezielten Draig-Tests prüfen beide Ausgaben, sämtliche Personenlinks und Bilder, das leere Motto sowie den Erhalt bestehender Bio-Bearbeitungen und des Familiengraphen.

- [Haus Draig](http://127.0.0.1:5500/Familien%20H%C3%A4user%20und%20Clans/haus.html?haus=haus-draig)
- [Stammbaum Draig – Hausbio über das Wappen](http://127.0.0.1:5500/Stammb%C3%A4ume/Stammbaum.html?family=haus-draig&mode=view)

Die Links setzen den lokalen Vorschau-Server auf Port 5500 voraus. Es wurden keine Inhalte in externe Dienste veröffentlicht.

## Prüfung der ersten Draig-Fassung

Am 11. September 2026 erfolgreich geprüft:

- 5 gezielte Draig-Tests, 17 ergänzende Stammbaumtests und alle 1.246 Tests der vorhandenen Stammbaum-Testfolge.
- Beide generierten Ausgaben stimmen mit der gemeinsamen Quelle überein.
- Hausseite bei 1.440, 768 und 390 Pixel Breite ohne internen horizontalen Überlauf; gleich große Oberhauptkarten innerhalb jedes Rasters.
- Galahads Personenlink öffnet Haus Draig im Stammbaum; die Hausbio enthält Texte, lokale Bilder und einen funktionierenden Rücklink.
- Haus Arwydd und die kleinere Häuser-Vorlage laden weiterhin mit ihrer bestehenden Darstellung.
- Keine JavaScript-Laufzeitfehler und keine fehlenden benötigten Bilder. Die lokale Abfrage nach einem noch nicht veröffentlichten Draig-Snapshot verwendet erwartungsgemäß die vorhandene Projektfassung als Rückfall.
