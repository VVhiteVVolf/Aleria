# Albische Gastfreundschaft und das Gesetz der Götter

Eigenes Modul `albische-gastfreundschaft` im neuen Hauptreiter **Sitte & Etiquette**.
Die Schreibweise des Reiters entspricht dem Nutzerauftrag vom 7. Oktober 2026.
Sein quadratisches Pergament-Icon liegt in
`../../../IconOrdner/ReiterIcons/Weltpfade/sitte-etiquette.png` und wurde vor den
Modulseiten generiert.

## Zuständigkeiten

- `albic-hospitality-content.mjs`: redaktionelle Seitentexte und stabile Bildschlüssel.
- `albic-hospitality-model.mjs`: bestehende Story-Vorlage, Seitentitel, Bilddarstellung
  und gemeinsame Kommentaranbindung; keine eigenen Renderer oder Zustände.
- `../../scripts/build-albic-hospitality.mjs`: generiert `albic-hospitality-data.js`
  über die gemeinsame Archivregistrierung. Der neue Reiter besitzt einen Rootknoten
  und sein eigenes Icon. Vorhandene Module werden nicht umgeschrieben.
- `image-prompts.json`: vollständige Bildprompts, Generator und Originalpfade.
- `../../public/assets/albische-gastfreundschaft/`: zehn eigenständige Szenenbilder.

## Seiten und Bilder

| Seite | Thema | Eigenes Bild |
| --- | --- | --- |
| I | Aufnahme eines Fremden; Brot, Öl, Essig, Käse und Kräuter | Mahlzeit am Herd |
| II | Freier Platz und Teller an Feiertagen; heute bei fast allen Alben | Leeres Gedeck am Abend, Stillleben |
| III | Druidisches Gastrecht und triftiger Grund; verborgener Druide oder Celestialer | Ankunft an der Tür |
| IV | Druiden kaufen und verkaufen nichts; Geschenke und Segen | Kleidung und Schuhe als Gabe |
| V | Allererste Ernte einer Familie auf ihrem Hof als Göttergabe | Erntegabe, Stillleben |
| VI | Tierische Erstgeburt; gemeinsames Mahl und verbranntes Fett | Opferfeuer und Mahl, ohne Schlachtszene |
| VII | Zehnt und Übernahme der vorherigen Bräuche durch die Alerische Kirche | Tempelvorräte dienen der Gemeinde |
| VIII | Kinderlos verstorbener Mann, sein Bruder und die Witwe; erster Sohn führt die Linie fort | Erwachsene am Herd, leere Wiege als Sinnbild |
| IX | Díth, Fianna, fehlende Erbfolge, Namensvariation und übernommene Traditionen | Salbung im altertümlichen Ringfort |
| X | Ergänzende Umgangsformen unter einem fremden Dach | Dank und Handreichung beim Abschied |

## Inhaltliche Grenzen

Die Kernaussagen folgen dem Nutzerauftrag. Die ergänzend erlaubten Ausarbeitungen
betreffen Rücksicht auf Gäste und Gastgeber, Dank beim Abschied, die Deutung
gemeinsamer Mahlzeiten und anschauliche Beispiele für gemeinnützige Tempelarbeit.
Eine konkrete Bedrohung wird als Beispiel für einen triftigen Ablehnungsgrund
erläutert. Es werden keine Straftatbestände, Fristen, Sanktionen, Steuerberechnungen,
Preise für Segen, genealogischen Datensätze oder Spielmechaniken neu festgelegt.
Die Leviratsehe bleibt als Brauch mit „sollte“ formuliert. Díth behauptet keine
Blutsverwandtschaft und setzt fehlende legitime beziehungsweise verwandtschaftliche
Nachfolge voraus. Die Fianna bestimmen den neuen Träger.

Das Modul beschreibt Aleria-Lore und erhebt keinen Anspruch auf reale historische
oder religiöse Darstellung. Die Bilder zeigen unbenannte menschliche Alben mit
braunen Haaren und natürlichen blauen, grünen oder braunen Augen. Szenen verwenden
den gespeicherten Anime-Stil Tales of Xillia/Frieren im Format 2:3; Architektur und
Kleidung bleiben altertümlich-gälisch. Das Reiter-Icon folgt dem bestehenden
quadratischen Pergament-Iconbestand.

## Prüfung

`npm run check:albic-hospitality` prüft die generierte Registrierung.
`npm run test:albic-hospitality` prüft die stabile Modul-ID, wiederholte Registrierung,
die zentralen Aussagen und eigene vorhandene Bilder in den angefragten Formaten.
Browserprüfung: alle zehn Seiten auf Desktop und Mobil, Scrollen bis zum letzten
Absatz, neue Reiterkarte samt Icon, Import/Export und Editor-Rundlauf. Der aktuelle
gespeicherte Online-Modulstand wird dabei in einem isolierten Browser mitgeladen;
kein Firebase-Datensatz wird für die Veröffentlichung überschrieben.
