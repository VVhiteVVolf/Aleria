# Aleria · Vorlage für Länder-Vorbereitungsseiten

Vom Nutzer am 27. Oktober 2026 nach der fertigen Aldingen-Seite als Vorlage für
weitere Länder angefordert. Dies ist eine Arbeits- und Architekturvorlage; die
jeweiligen Länderangaben sind keine austauschbaren Standardinhalte.

## Verbindliche Referenz

`Aldingen/index.html` zeigt die freigegebene Gesamtstruktur. Wappen, Karten,
Ganzkörperfiguren, Namen und Sitzvorgaben bleiben Belege dieses Landes. Die
Varianten unter `Goldmund`, `Weisenfluh` und `Moinneach` zeigen andere kulturelle
und politische Umsetzungen. Keines dieser Länder wird als fiktiver Inhalt in ein
neues Land kopiert. Neue Seiten heißen `Vorschau/<Land>/index.html` und bleiben
als vorläufige Besprechungs- und Vorbereitungsseiten erkennbar (`noindex,nofollow`).

## Vorarbeit und Quellen

1. Root- und gegebenenfalls untergeordnete `AGENTS.md` lesen, bestehenden Zustand
   und Publikationsfreigabe feststellen. Aktuelle Nutzerangaben gehen Standards
   vor; keine erneuten Freigaben für bereits autorisierte Schritte verlangen.
2. Gelieferten Ordner inventarisieren. Originale unverändert sichern und mit
   SHA-256, Dateiname, Abmessungen und relativem Ziel in `assets.source.json`
   erfassen. Sehr große Originalkarten lokal außerhalb der Veröffentlichung
   aufbewahren; optimierte WebP-Karten dürfen keine Grenzen oder Namen verändern.
3. Karte tatsächlich ansehen: Farbgruppen, rote Teilgrenzen, Orte, Hauptsitze,
   Küsten, Flüsse, Berge und Zugänge erfassen. Ortsanker an Ausschnitten prüfen.
   Unklare Kartenzuordnung als Annahme kennzeichnen und bei wesentlichem Einfluss
   gezielt klären; unabhängige Arbeit währenddessen fortsetzen.
4. Geschichte, Eigenverständnis, Nachbarn, Handel, Wirtschaft und Kultur aus dem
   Nutzerkontext übernehmen. Behauptete kulturelle Überlegenheit als Sichtweise
   der Figuren darstellen. Keine neuen kanonischen Fakten oder Stammbäume erfinden.
5. Gelieferte Familien vollständig erfassen. Neue Namen und Tiermotive gegen die
   tatsächlichen Stammbaumregister und vorhandenen Kulturwappen prüfen. Präfixe,
   Rang, Namensgeschmack und beizubehaltende Häuser folgen dem aktuellen Auftrag.

## Seitenaufbau

- Kopfbereich: Landesname, politischer Titel, kurze Einordnung, Landeswappen und
  erkennbarer Entwurfsstatus.
- Herkunft und Selbstverständnis: übersichtliche Geschichte, kulturelle und
  wirtschaftliche Themen; belegte antike Wappen wiederverwenden.
- Großregionen: gemeinsame Grafschaften beziehungsweise passende Verwaltungsebene
  mit eigenem Gebietswappen und zugehörigen Orten.
- Karte und Sitzentwurf: vergrößerbare Originalkarte, Wappenmarker, freie Familien,
  Maus-/Stift-Drag sowie Auswahl und Zielknöpfe für Touch und Tastatur.
- Einzelgebiete: Gebietsschild, Ortsname, Geographie und aktuell zugeordnete Häuser.
- Hausfenster: Haus-/Clanname, Wappen und vollständige Kriegerfigur nebeneinander
  am Desktop, untereinander mobil; darunter Motiv, Farben, Rahmen, Rang und Sitz
  sowie vorgeschlagene Klasse, Ausrüstung und Begründung. Alle Bilder haben eine
  Großansicht; keine Figur per `object-fit:cover` oder Container zuschneiden.
- Entwurfswerkzeuge: lokale Speicherung, Rückgängig, Import/Export, Zurücksetzen
  auf die quellengerechten Ausgangsvorgaben. Keine automatische kanonische Übernahme.

## Daten und Verantwortlichkeiten

Bestehende Systeme zuerst analysieren und wiederverwenden. Das Land besitzt nur
seine Daten und Darstellung; unabhängige Funktionen nicht durch Kopieren duplizieren.

| Datei/Modul | Verantwortung |
| --- | --- |
| `house-data.mjs` | stabile Haus-IDs, Namen, Motive, Farbpaletten, Wappen und explizite Ausgangssitze |
| `territory-data.mjs` | Verwaltungsebenen, Gebietsformen, Orte, Kartenpunkte und Geographie |
| `realm-context.mjs` | Geschichte und thematische Texte |
| `placement-state.mjs` | schlanke Konfiguration des gemeinsamen Entwurfszustands |
| `house-placement.mjs` | lokale Auswahl, Import/Export, Speicherung und Kartenanbindung |
| `proposal-render.mjs` | escaped HTML für Hauskarten, Regionen, Orte und Kontext |
| `art-dialogs.mjs` | Haus-/Gebietsfenster und deren lokale Ereignisse |
| `warrior-art-direction.mjs` | einzelne kultur- und hausbezogene Figurenentwürfe |
| `warrior-data.mjs` | daraus erzeugter reiner Darstellungskatalog |
| `warrior-view.mjs` | Wappen-/Figurenpaar und Klassenbeschreibung ohne Zuordnungszustand |
| `scripts/` | explizite Quellenaufbereitung, Promptkataloge und dünne Bild-Pipeline-Wrapper |

`Vorschau/shared/placement-state.mjs`, `placement-controls.mjs`, `clan-map.mjs`
und die gemeinsame Drag-Logik besitzen Wiederverwendung und Zustandsregeln.
`shared/warrior-artifacts/pipeline.py` besitzt die genehmigte Alpha-Aufbereitung.
Landesspezifische CSS-Dateien nach Verantwortung trennen. Event Delegation,
`data-action`/`data-role`, lokale Zustände und kleine Funktionen verwenden. Keine
neuen Inline-Handler, globalen Zustände, Firebase-Querzugriffe oder God-Files.

Stabile IDs von sichtbaren Umbenennungen trennen. Offene Ränge, Sitze und Lehnsherren
nicht als unbekannte Tatsachen auffüllen. Eine vorgegebene Ausgangszuordnung ist
nur dann unveränderlich, wenn der Nutzer sie ausdrücklich festsetzt. Adelsrang,
Klassenentwurf und Sitzwechsel dürfen einander nicht still verändern. Entwürfe
verwenden einen eigenen landesspezifischen, versionierten LocalStorage-Schlüssel.
Importe atomar validieren und fremde/unvollständige Daten ablehnen.

## Wappen und Gebietsschilde

Vor jeder Generierung die aktuellen Vorgaben in
`AleriaAlmanach/docs/art/image-style-presets.json` und tatsächlich passende
Kulturwappen ansehen. Das eingebaute Bildwerkzeug verwenden, je Motiv ein eigener
Aufruf mit den tatsächlich angesehenen Bildreferenzen; keine SVG-Ersatzgrafiken.
Gelieferte Motive bei Überarbeitungen erkennbar bewahren.

Haus-, Clan- und Landeswappen sind nach Projektstandard kreisrund auf 1:1. Eine
aktuelle ausdrückliche Formvorgabe geht vor: Aldingens Gebietsschilde sind spitze
Kite-Schilde auf quadratischem Bild, keine Banner. Für andere Länder Formen neu
entscheiden. Jedes Teilgebiet und jede gemeinsame Großregion erhält das verlangte
Wappen; deckungsgleiche herzogliche Grafschaft/Baronie kann ein Bild gemeinsam
verwenden. Keine doppelte Bildproduktion für dasselbe Gebiet.

Rahmen, Hintergrundteilung, Material, Ornament und Hauptmotiv variieren. Neben
Gold auch Silber, Eisen, Schwarz, Bronze und andere passende Farben einsetzen.
Albische Clans sind meist schlichter und ärmer dargestellt, aber ihre Wappen
dürfen nicht nur dasselbe Schema mit ausgetauschtem Tier sein. Zweidimensional,
malerisch und lesbar, weder fotorealistisch/3D noch flaches generisches Logo.
Wappen innen deckend, ausschließlich außerhalb der Kontur transparent.

## Kriegerfiguren

Nur erzeugen, wenn im Auftrag enthalten. Bestehende passende Darstellungen zuerst
übernehmen. Hausfarben, Motiv, Geschichte und Geographie leiten den einzelnen
Entwurf; die tatsächliche Klassenseite und aktuelle Nutzererläuterungen bestimmen
Klasse, Waffen und Rüstung. Verbotene Klassen landesspezifisch ausschließen.

Vor jeder Generierung den passenden Figuren-Preset lesen und den freigegebenen
Hausritter `AleriaAlmanach/docs/art/character-style/2026-10-24-approved-house-knight.png`
tatsächlich ansehen und als Stilreferenz mitgeben. Der Ritter bestimmt die matte
Malweise, vereinfachte Formen, feine Pigmentkörnung und ruhige Haltung; sein Helm,
seine Farben, Rüstung und sein äußerer Farbdunst sind keine allgemeine Vorlage.

Ganzkörper im 2:3-Hochformat, höchste Zier bis beide Füße und alle Waffenspitzen im
Bild. Ruhige glaubhafte Pose, transparente Außenflächen und offene Zwischenräume,
kein Boden, Schatten oder Szenenhintergrund. Helme, Rüstungsbau, Posen, Waffen und
Stoffflächen sichtbar unterscheiden. Heraldik als sinnvoll getragene Bemalung,
Stickerei oder Beschlag, keine unbrauchbare wörtliche Tier-Rüstung. Kultur und
Versorgung beachten: beispielsweise funktionale deutsche Harnische in Aldingen,
mehr höfische Pracht in Goldmund, eigene maritime Formen und albischer Tartan.
Keine Aldinger Klassenverteilung als Standard für ein neues Land übernehmen.

Pferde nach ihrem wirklich vorhandenen Bestiarium-Profil gestalten, Bildreferenz
ansehen und korrekten Art-/Zuchtverweis verwenden. Gesamtes Reittier mit Hufen
abbilden; Zügel, Sattel und Steigbügel müssen funktionieren. Der Schweif wächst
an der Hinterhand, niemals an Brust, Flanke oder Hals. In einer verdeckten Ansicht
darf er natürlich hinter der Figur verschwinden. Vögel stehen mit sichtbaren Füßen
auf sinnvoll geschützter Schulter oder Hand; Griffe und Gelenke plausibel halten.

## Asset- und Prüfablauf

Generatororiginale, technische Produktions-PNGs und WebP-Vorschauen trennen.
Vollständige Prompts, echte Referenzpfade, Generatorausgaben und Prüfsummen
aufzeichnen. Bei Korrekturen Ausgangsfassung und editierte Eingabereferenz
archivieren. Technische Alpha-Bereinigung nur mit geltender Nutzerfreigabe;
RGB-Pixel und Originale erhalten, Figurenlücken nicht füllen. Die gemeinsame
Krieger-Pipeline erwartet 1024×1536 und erstellt 768×1152-WebP-Vorschauen.

1. Kontaktbogen und jede Ausgabe tatsächlich ansehen. Grobe Fehler an Waffenachsen,
   Griffen, Schildkonstruktion, Gegenständen, Pferdeanatomie und Bildbeschnitt
   gezielt per Bildwerkzeug korrigieren. Kleine malerische Makel ignorieren.
2. Datenvollständigkeit, ursprüngliche Dateien/Hashes, Gebietsabdeckung, Ausgangssitze,
   lokale Modul-/Assetpfade, Bestiarium- und Klassenlinks sowie Import/Rückgängig
   mit den passenden bestehenden Prüfungen kontrollieren. Keine Tests bauen, die
   lediglich HTML-Details oder die eigene Implementierung abschreiben.
3. Bildaudit für Hashes, Abmessungen, Transparenz und Original-/RGB-Erhaltung ausführen.
4. Im Browser alle Hausfenster wirklich öffnen: korrekter Titel, richtige und geladene
   Figur, vollständige Darstellung, Scrollbeginn und keine horizontale Überbreite.
   Desktop und Handyformat prüfen; temporäre Viewport-Overrides danach zurücksetzen.
5. Drag, alternative Auswahl, Rückgängig, Neuladen/Persistenz und Zurücksetzen prüfen.
   Eigene Testzuordnungen auf den Ausgangsstand zurückführen. Prüfbelege und Screenshots
   in `diagnostics/<land>/` speichern; keine persönlichen Browserdaten übernehmen.
6. Ergebnisse lokal reviewbar übergeben. Nur mit tatsächlich geltender ausdrücklicher
   Freigabe committen/pushen/deployen. Im bestehenden Aleria-Repository dessen
   Netlify-Workflow verwenden und keine zweite Site auf einer anderen Plattform anlegen.
   Nach Freigabe bis zum erfolgreichen Deployment und öffentlicher Prüfung fortfahren:
   Commit-Beleg, Seite, Modulpfade und finale Bilddateien einschließlich Korrekturen.

## Verwendung der persönlichen Vorlage

Die persönliche Artefaktvorlage „Aleria Laender-Vorbereitungsseiten“ bewahrt den
Quellstand der Vorschauseiten als Referenz. Diese Arbeitsanleitung und die aktuellen
Projektregeln lesen, bevor das neue Land aus dem vorhandenen modularen System
abgeleitet wird. Reale Namen, Karten, Heraldik und Inhalte ersetzen; gemeinsam
genutzte Systeme weiterhin einmalig unter `Vorschau/shared` halten.
