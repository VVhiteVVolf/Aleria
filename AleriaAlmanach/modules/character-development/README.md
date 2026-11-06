# Individuelle Charakterentwicklung

## Allgemeine RPG-Talente und passive Fähigkeiten vom 6. November 2026

Auf Korrekturauftrag ersetzen 15 breite RPG-Talente und 15 allgemein nutzbare
passive Fähigkeiten die 30 zuvor ergänzten Nischenentwürfe. Die 15 Marotten
bleiben erhalten. Neue Kennungen verhindern, dass alte persönliche Kopien
unbemerkt eine andere Wirkung erhalten. Alte Bilder und Belege bleiben erhalten;
alle Ersatzdefinitionen besitzen eigene neue Icons. Der Katalog enthält weiter
272 Traits und 34 Hintergründe. Beide Assistenten verwenden dieselben Definitionen.
[Aktuelle Werte, Kosten und Abgrenzungen](../../docs/combat/STANDARD_TALENTS_ABILITIES_2026-11-06.md).
Die darunter dokumentierte erste 45er-Ergänzung ist insoweit historisch überholt.

## 45 weitere Talente, Marotten und Fähigkeiten vom 6. November 2026

Der Katalog umfasst jetzt **272 Traits und 34 Hintergründe**. Je 15 neue Talente,
Marotten und erlernte passive Fähigkeiten besitzen eigene Filter in Starthilfe
und Stufenassistent sowie jeweils ein eigenes neu generiertes Comicicon.
[Alle Werte und Kosten](../../docs/combat/TALENTS_QUIRKS_ABILITIES_2026-11-06.md)
sind gegen den vorhandenen Archivkatalog auf gleiche Namen und Rechenwirkungen
abgeglichen. Die drei `development-expansion-*.js`-Datenmodule besitzen die
Definitionen; `development-expansion-categories.js` bündelt ihre Kategorien.

Die Fähigkeiten verwenden bestehende passive Rechenwege und bedingte Regeln.
Lückenlesen prüft den aktuell aktiven Zustand des Ziels; Schadensfilter prüfen
die tatsächliche Aktion einschließlich ihres Grundschadens und Zusatzwirkungen.
Ein reiner Zustandszauber übernimmt keinen Schadenstyp einer gehaltenen Waffe.
Aktuelle TP, Ressourcen und vorhandener Besitz werden nicht aufgefüllt.
Originale, vollständige Prompts, Bildbelege und Desktop-/Mobilprüfung:
`diagnostics/talents-quirks-abilities-20261106/README.md`.

## Eigene Icons vom 6. November 2026

Auf Folgeauftrag haben alle zwölf Nuadat-/Arth-Ausprägungen, alle 30 neuen
allgemeinen Eigenschaften und alle 24 neuen Hintergründe eigene neu generierte
kreisförmige Comicicons. Die frühere Wiederverwendung ist für diese Einträge
ersetzt. Jede Stufe besitzt ein eigenes Motiv. Originale liegen unter
`assets/development-traits/<id>.png`, die 192-Pixel-WebP-Ableitungen unter `web/`.
Hintergrundbilder verwenden `background-<id>` und erscheinen in der vorhandenen
Hintergrundvorschau der Starthilfe. Spielwerte und Vorschläge bleiben gleich.
Übersichten, vollständige Prompts und Belege:
`diagnostics/creation-icons-20261106/README.md`.

## Familienblut und Alltagsergänzung vom 6. November 2026

Der Katalog umfasst jetzt **227 Traits und 34 Hintergründe**. Die vollständige
[Planung und Wertematrix](../../docs/combat/CHARACTER_CREATION_EXPANSION_2026-11-06.md)
beschreibt Riesenblut der Nuadat I–VI (2,0 bis 4,0 Meter), Das Blut der Arth I–VI,
30 allgemeine Eigenschaften und 24 herkömmliche Hintergründe. Beide Assistenten
bieten eigene Filter für Familienblut und allgemeine Eigenschaften.

`development-family-traits.js` besitzt die Ausprägungen,
`development-family-policy.js` ihre Rang-, Auswahl- und Größenersetzungsregeln.
Je Linie wirkt und kostet ausschließlich die höchste aktive Stufe. Nuadat
ersetzt die vollständigen allgemeinen Größenmerkmale Groß, Hünenhaft und
Riesenblut. Der Detailbogen kennzeichnet verdrängte Einträge als ohne Rechenwirkung.
`development-general-traits.js` besitzt die 30 Alltagseigenschaften mit eigenen
Comicicons; stabile Merkmalskennungen bleiben erhalten.
`creation-background-templates.js` ergänzt die unverbindlichen Ausbildungsvorschläge.

Arth-Zusatzschaden verwendet `weaponModifiers.attackAttributes` und das tatsächliche
Waffenattribut einschließlich persönlicher GES-Ausbildung. Werteberechnung,
Fertigkeiten, Rettungen, Waffenschaden und Bilanz teilen dieselben Rangregeln;
Archivreferenzen bleiben erhalten. Effektive Attribute haben eine Untergrenze 1.
Bewusste TP-Gesamtmaxima und Gesamt-RK behalten Vorrang; konkrete Hinweise machen
überdeckte Nuadat-Wirkungen sichtbar. Aktuelle TP werden nicht aufgefüllt.

Gezielte Fach- und Browserbelege: `diagnostics/creation-traits-20261106/`.
Die darunter folgenden datierten Bestandszahlen beschreiben historische Prüfstände.

## Balanceprüfung vom 3. November 2026

Die vollständige [Prüfmatrix aller 185 Traits](../../docs/combat/TRAIT_BALANCE_2026-11-03.md)
dokumentiert 65 überarbeitete und 120 bewusst unveränderte Definitionen. Sie
ersetzt die früheren Werte in den unten verlinkten historischen Prüfberichten.
Marotten und gewöhnliche Begabungen verwenden kleine Boni und Mali von meist
einem Punkt. Neugier gibt +1 Nachforschungen und −1 GES-Rettung. Fachausbildung
und Expertise bleiben eigene Entscheidungen. Phobien erschweren passende
Rettungen, ohne die körperliche Schadensanfälligkeit zu verdoppeln.

Glückspilz würfelt bei Angriff, Probe und Attributsrettung jede natürliche 1
einmal neu und gibt +1 auf Attributsrettungen. Pechvogel erweitert kritische
Fehlschläge auf natürliche 1–3 und gibt −1 auf Attributsrettungen. Der gemeinsame
Würfelvertrag und seine Belege gehören in `combat/combat-natural-roll-policy.js`.
Eiserne Konzentration verwendet ausschließlich `on-concentration-check`.

`combat/combat-encounter-start-effects.js` hält neue Kampfstartbelege für eigene
temporäre TP. Immer kampfbereit und aktive Self-Aura-Quellen geben beim ersten
Eintritt in einen Kampf den stärksten passenden Vorrat; mehrere Quellen werden
nicht addiert. Wiederaufnahme, erneuter Beitritt und Neuladen füllen nichts auf.
Historische Kampfbeginnbelege ohne `startApplications` erhalten keine neue Wirkung.
Aktuelle TP und andere Ressourcen gehören nicht zu diesem Effekt.

Autorenauftrag vom 2. November 2026. Der bestehende Stufenassistent berechnet
jetzt eine frei gewählte Ziel-Gesamtstufe bis 30, einschließlich mehrerer Stufen
in einem Schritt. Auch auf derselben Stufe lassen sich Ausbildung, Traits,
Erfahrung und Vorratswahlen bearbeiten. Erst „Auf Entwurf anwenden“ ändert den lokalen Bogen;
„Figur speichern“ verwendet weiterhin den vorhandenen Speicherschutz.

Die separate **Starthilfe** verwendet jetzt dieselbe Entwicklungsberechnung.
Ihre sieben Schritte führen über Herkunft, Basisattribute und Klassenwerte zu
einer frei gewählten Zielstufe, ausdrücklich gekauften Attacken, allen 185 Traits
und getrennt anpassbaren Vorräten. Die Klasse vergibt weder Waffen noch Rüstungen
oder andere Ausrüstungspakete; vorhandener Besitz und Ausrüstungszustand bleiben
erhalten. Vorhandene Ausbildungen und verbrauchte Vorräte werden beim Öffnen
erhalten; ein Neustart auf Stufe 1 ist eine ausdrückliche Auswahl.
Ein übersprungener Entwicklungsschritt übernimmt keine vorgemerkten Käufe,
Traits, Zusatzattribute oder Zielstufen dieses Schritts.

## Manuelle Grundausbildung

Schritt 3 zeigt alle Fertigkeiten mit den vorhandenen Fertigkeitsicons. Geübt,
Expertise und Ungeübt werden je Fertigkeit manuell gewählt. Herkunft, Hintergrund
und Klassen geben ausschließlich Vorschläge; erst die entsprechende Schaltfläche
übernimmt sie. Ein Klassenwechsel vergibt keine Fertigkeiten.

Schritt 4 erlaubt eine Hauptklasse, zusätzliche Klassen und eine benannte eigene
Ausbildung. Trefferwürfel, Rettungswürfe, Waffen-/Rüstungsausbildung, Werkzeuge,
Sprachen sowie Magie- und Fokuszugang lassen sich einzeln aus Listen wählen.
Die Schaltfläche für Klassenvorschläge ist ausdrücklich optional. Typische Waffen
werden mit vorhandenen Bildern nur zur Orientierung gezeigt und nie ausgegeben.
Die Hauptklasse bleibt Grundlage der bisherigen Klassenprogression; weitere
Klassen zählen für eigene Kaufpreise. Es werden keine Stufen, Ressourcen oder
Klassenpassiven vervielfacht. Es gibt keine automatische Stufenaufteilung.

`creation-training-model.js` besitzt die manuellen Entscheidungen,
`creation-training-ui.js` deren Darstellung und `creation-class-suggestions.js`
die unverbindlichen Empfehlungen. `character-training-state.js` normalisiert
die optionalen `templateSelections.classIds` und `customClass` für Browser und
Server. Die öffentliche Identitätszeile zeigt alle gewählten Klassennamen;
das Archiv legt sie einzeln ab. Die Bedienung ist deutsch.

Beide Fenster teilen den dunklen Oldschool-RPG-Stil in
`styles/character-development-window.css`, das eigene bronzene Sternenrelief und
eine ständig sichtbare Übersicht für Stufe, TP, Kompetenz, Auswahl und Balance.
`development-overview.js` besitzt Auswahlübersicht und Rücksetzbefehle;
`development-plan-input.js` besitzt die gemeinsame delegierte Planeingabe.
`creation-development-ui.js` kapselt die neuen Starthilfe-Schritte. „Neue Auswahl
verwerfen“ erhält zuvor aktive Traits und gelernte Attacken. „Standardpreise
einsetzen“ erhält vergangene Kaufbelege. Der Filter „Gewählte Traits“ ergänzt
den entsprechenden Attackenfilter. Bildquelle, Prompt und Webableitung sind im
Diagnoseordner als `advancement-frieze-image-job.json` gesichert.

TP, KON, Vitalität, Kompetenz, Mana und Aktionspools verwenden die bisherigen
gemeinsamen Regeln. TP können empfohlen, manuell je Stufe oder unverändert
bleiben. Attribute und zusätzliche Vorräte können individuell angepasst werden.
Die Empfehlung beträgt zwei Attributspunkte auf 4/8/12/16/20 und vier je
Sonderstufe. Sie ist kein Pflichtbudget. Aktionspools behalten ihre vorhandenen
Wahlregeln; manuelles Direktsetzen einer Stufe verwendet deren bisherige
Standardverteilung.

`progression.development.mode = "purchase"` unterbindet die automatische
Arsenalergänzung beim Leveln, Laden und erneuten Abgleich. Bereits erlernte
Attacken und historische Ausbildungsmetadaten bleiben erhalten. Ältere Profile
ohne Kennung verwenden ihren bisherigen Abgleich. Keine Migration laufender
Kämpfe, gespeicherter Ergebnisse oder persönlicher Inventare findet statt.

## Kaufregeln

- Standard: 3 Startpunkte und 3 Punkte pro erreichtem Level über Stufe 1.
- Eigene Klasse: 2 Punkte, zuzüglich 1 je vier Mindestlernlevel über Stufe 1.
- Fremde Klasse: doppelter Preis. Alle Zahlen sind je Figur einstellbar.
- Eine freie Balancekorrektur bildet persönliche Absprachen ab.
- Bereits bezahlte Käufe behalten ihren damaligen Preis. Vorhandene Attacken
  werden nicht rückwirkend berechnet. Ein Kauf derselben Technik wird nicht
  doppelt eingetragen, auch wenn mehrere Klassen sie anbieten.
- Negative Salden sind ausdrücklich gültig. Unbekannte oder unfertige Techniken,
  nicht erreichte Mindeststufen und technische Speichergrenzen werden abgewiesen.
- Ein Kauf bildet Einzelausbildung ab. Klassenpassiven werden dadurch nicht
  übertragen; Waffen-, Schild-, Reit-, Zweiwaffen- und Aktionsvoraussetzungen
  bleiben beim Einsatz wirksam. Eine zusätzlich gewählte Klassenquelle wird
  beim Prüfen einer gekauften Technik aus dem Kaufbeleg gelesen.

`development-state.js` besitzt die begrenzte persistierte Bilanz,
`development-purchases.js` projiziert die vorhandenen drei Kulturkataloge,
`development-traits.js` enthält die ursprünglichen 30 Traits und bindet die
20 körperbezogenen Traits aus `development-body-traits.js` sowie 20 weitere
normale Traits aus `development-extra-traits.js` ein. `development-ui.js` besitzt die
Shopdarstellung und Auswahlverwaltung. Die Dialogintegration verwendet die
vorhandenen delegierten Listener. Eigene Stile: `styles/character-development.css`.

Der Kaufkatalog enthält zum Prüfstand vom 3. November 2026 **1.028
Klassenangebote für 682 unterschiedliche bestätigte Techniken**: 724 Angebote
für 378 Drachentanz-Techniken und 304 Angebote für 304 Sirenentanz-Techniken.
Eine gemeinsam gelehrte Technik kann in mehreren Klassen angeboten werden;
derselbe Charakter erlernt und bezahlt ihre Technikkennung weiterhin nur einmal.
Die übrigen **303 Huskarl-Entwürfe** des insgesamt 985 Techniken umfassenden
Autorenkatalogs bleiben vom Kauf ausgeschlossen und werden nicht automatisch
zu spielbaren Attacken umgeschrieben.
Klassen ohne freigegebenes Angebot erhalten einen sichtbaren Hinweis; persönliche
Attacken können weiterhin einzeln ausgearbeitet werden. Eine spätere Rücknahme
und Wiederaufnahme einer bezahlten Technik erhält den ursprünglichen Kaufbeleg.

`development-entry-reference.js` erhält die Katalogzuordnung auch bei eigenen
Archivkopien mit neuer Instanzkennung. Die optionalen Felder `developmentTraitId`
und `catalogTechniqueId` überstehen den Serverabgleich. Derselbe Katalogeintrag
wird beim erneuten Übernehmen zur Bearbeitung geöffnet. Exakte doppelte Traits
werden im Entwicklungsvorschlag sichtbar zusammengeführt; abweichende persönliche
Fassungen werden nicht still ersetzt.

## Traits und Bilder

Traits wirken über die vorhandenen numerischen Modifikatoren, Triggerregeln
und Schadensaffinitäten. Ergänzt wurden nichtdestruktive Fertigkeitsexpertise
und Affinitäten aktiver Traits. Entfernen eines Traits stellt die ursprüngliche
Fertigkeit wieder her. Bedingte negative Rettungswurfboni werden tatsächlich
berücksichtigt. Feuerangst gilt ausschließlich bei passenden Rettungswürfen,
einschließlich sekundärer Rettungen, und verändert keinen gewöhnlichen
Feuer-Angriffswurf des Gegners.

Die eigenen kreisförmigen Comic-PNGs der 185 Traits liegen unter
`assets/development-traits/`. Prompts, Generatorherkunft, Dateihashes und
Alphaprüfung: `diagnostics/gwynthor-seven-20261102/traits-art-receipt.json`.
Der Assistent lädt transparente 192-Pixel-Webfassungen unter `web/`; die
hochaufgelösten PNG-Originale bleiben als Quellen im Repository und werden
nicht zusätzlich statisch ausgeliefert. Die vorhandene Bildzulassung erstellt
diese reinen Größen-/Formatableitungen und protokolliert ihre Hashes.

Die 20 Körpertraits sind Vollbusig, Hässlich, Gutaussehend, Fit, Fragil,
Schmächtig, Klein, Groß, Hünenhaft, Riesenblut, Breitschultrig, Sehnig,
Gelenkig, Steife Gelenke, Scharfe Augen, Schwerhörig, Eiserne Lunge,
Schneller Stoffwechsel, Schwere Knochen und Robuste Haut. Attributbezogene
Rettungswurfboni wirken über `saveAttributeModifiers`, ohne die gespeicherten
Grundwerte zu überschreiben. Die Bilder ergänzen den ersten Bildbeleg um
`body-traits-art-receipt.json`. Vollbusig verwendet die nachträglich gewünschte
blonde Frau mit Dekolleté und verdutztem Blick; die Erstfassung bleibt als
Generierungsquelle erhalten.

Die zweite Ergänzung umfasst Frostphobie, Blitzphobie, Giftphobie,
Magiephobie, Heilerhände, Spürnase, Bühnenbegabt, Flinke Finger, Geborener
Fährtenleser, Lügenriecher, Feuer-, Eis-, Blitz-, Säure- und Schallaffinität,
Giftanfällig, Säureempfindlich, Blitzempfindlich, Schallempfindlich und
Magische Resonanz. Schadensaffinitäten und Phobiefilter berücksichtigen die
vorhandenen deutschen Schadensnamen und ihre englischen Entsprechungen.
`extra-traits-art-receipt.json` belegt die zusätzlichen Bilder. Suche und Filter
trennen normale Traits, Körpermerkmale sowie positive und negative Kosten;
die Auswahl bleibt beim Filtern erhalten.

Die Bestandsprüfung ergänzt Bühnensicher, Arkan geschult, Frohnatur und
Bühnenmensch aus `development-inspired-traits.js`. Ihre eigenen Comicbilder sind
in `diagnostics/character-development-audit-20261102/inspired-traits-art-receipt.json`
belegt. Bestehende persönliche Figurenmerkmale bleiben erhalten; passende
Überschneidungen werden im Assistenten angezeigt.

`skill-checks/skill-definitions.js` ist die gemeinsame Fertigkeitsidentität für
Bogen, Szenenproben, Icons und KI-Kontext. Expertise aus Traits verändert die
gespeicherte Grundausbildung nicht. Arkaner Fokus beschränkt seinen Angriffsmalus
auf Waffen, sodass sein Zauberbonus wirksam bleibt. Phobien prüfen auch
strukturierte Schadenseffekte bei primären und sekundären Rettungswürfen.

`development-balance-review.js` bewertet nicht stapelbare Resistenz, Anfälligkeit,
Expertise und Vorteil nur einmal; vorhandene persönliche Effekte zählen mit.
Gegensätzliche Schadensaffinitäten heben ihre Kostenanteile auf. Widersprüchliche
Körpermerkmale und besonders riskante Kombinationen erzeugen Hinweise, keine
Auswahlsperre. Zahlenboni können weiterhin addiert werden. Die Bilanz ist eine
Orientierung für Käufe und Katalogtraits, keine vollständige Bewertung der
Figur; persönliche Altmerkmale und manuell gewählte Grundausbildung werden
nicht rückwirkend verrechnet. Kostenänderungen und Grenzen stehen im
[Prüfbericht](../../../diagnostics/character-development-audit-20261102/REVIEW.md).

Die nächste Ergänzung umfasst 20 besondere Eigenheiten aus
`development-unique-traits.js` und zehn Begabungen aus
`development-aptitude-traits.js`. Die Filter „Besondere Eigenheiten“ und
„Begabungen“ stehen in beiden Assistenten zur Verfügung. Alle 30 haben neue
Comicicons; Quellen und Prompts liegen unter
`diagnostics/traits-expansion-20261102/unique-traits-image-jobs.json`.
Nah-/Fernkampfvorgaben, Beschussschutz und magische Rettungswurfmodifikatoren
verwenden vorhandene Triggerfilter und unveränderte Serverregeln. Keine neue
Klassen-, Ressourcen-, Inventar- oder Hintergrundvergabe ist damit verbunden.
Die [vollständige Ergänzung mit Kosten](../../../diagnostics/traits-expansion-20261102/REVIEW.md)
dokumentiert die tatsächlichen Wirkungen. Die Prüfung
`tests/character-development-expansion.test.mjs` prüft die 30 Einträge auf neue
Namen und Rechenwirkungen gegenüber dem bisherigen Katalog.

## Angeborene Blutträger

`development-bloodline-traits.js` ergänzt zehn menschliche Abstammungsmerkmale:
Vampirspross, Formlingsspross, Succubusspross, Satyrspross, Aelvarspross sowie
Nymphen-, Flammen-, Wind-, Donner- und Bergspross. Je fünf Linien beziehen sich
auf infernales und celestiales Erbe. Die letzten vier celestialen Varianten
leiten sich aus den vorhandenen Elementdomänen ab; sie sind keine neu behaupteten
Einzelrassen. Herkunft und Quellen sind separat als `BLOODLINE_TRAIT_ORIGINS`
erfasst und verlinken tatsächlich vorhandene Bestiarium-Seiten.

Der Filter „Blutträger · angeboren“ erklärt die menschliche Abstammung. Die Punkte
bewerten die Wirkung einer bereits angeborenen Anlage; sie kaufen keine Eltern
oder Rasse. Mehrere Linien erhalten einen Hinweis zur passenden Abstammung,
bleiben aber wie alle Traits frei auswählbar. Es werden weder Magiezugänge,
Zauberpakete, Gegenstände noch Verwandlungen vergeben. Bestehende Rasse,
Klasse, Vorfahren und aktuelle Ressourcen bleiben erhalten.

Myriad Draig (Mutter Afallith als Succubus) und Aradin Hyrmgarthr (vampirische
Clangeschichte) stehen nach ausdrücklicher Autorenfestlegung als Beispiele bei
den jeweiligen Linien. Das dokumentiert den Kontext und legt ihnen keinen neuen
Kampfbogen an. Die damalige Blutträger-Erweiterung ließ die bisherigen 104
Definitionen erhalten; spätere Änderungen stehen in der Balanceprüfung oben.

Alle zehn Blutträger haben eigene kreisförmige Comicicons. Prompts und Quellen:
`diagnostics/blood-carriers-20261102/`; Werte, Bestiariumbelege und Prüfungen im
[Blutträger-Bericht](../../../diagnostics/blood-carriers-20261102/REVIEW.md).

## Theriantrophie und Silvanische Symbiose

`development-theriantrophie-traits.js` ergänzt zwölf Merkmale auf Grundlage des
vorhandenen Almanach-Moduls „Theriantrophie & Silvanische Symbiose“. Die acht
Zatracher Merkmale führen Werwolf, Werbär, Wereber und Werluchs in Klammern;
jede Tierform unterscheidet Fluchform und Jüngersegen. Wolf und Bär sind im Modul
ausdrücklich genannt, Eber und Luchs ergänzen seine offenen tiergebundenen
Varianten und sind als ergänzende Tierausarbeitungen gekennzeichnet.

Vier angeborene Symbiosen nennen Clan und Tier: Varulv (Wolf), Mac Ard Diuid,
Ó Lockart und Dál Haig (jeweils Bär). Die Wolfszuordnung folgt der ausdrücklichen
Autorenfestlegung, die drei Bärenlinien den archivierten Clanüberlieferungen.
Die schwache, seltene und teilweise unbestätigte Haig-Anlage bleibt entsprechend
gekennzeichnet. Die drei Bärenclans gehen auf dieselbe Mhathain-Linie zurück;
mehrere dieser Merkmale sowie Fluch und Segen derselben Tierform lösen einen
Hinweis aus. Die freie Auswahl und ein negativer Punktestand bleiben erlaubt.

Die Merkmale berechnen ausschließlich ihre ausdrücklich genannten passiven
Grundwerte. Höhere Tierkommunikation, vollständige Tiergestalt und Champion-Urform
werden nicht automatisch erteilt. Fluch-Kontrollverlust, Mondauslöser und
willentliche Wandlung sind Herkunftskontext, keine neu eingeführte Kampfautomatik.
Symbiose bleibt erblich und nicht ansteckend. Der separate Silvanische Fluch ist
keine gewöhnliche Symbiose und wird keinem Clan automatisch zugeschrieben.

Beide Assistenten haben eigene Filter mit Modulverweisen; die Symbiose zeigt
zusätzlich die vier tatsächlich vorhandenen Clanwappen und Stammbaumverweise.
Alle zwölf Merkmale haben neue kreisförmige Comicicons. Quellen, vollständige
Werte, Bildprompts und Prüfbelege stehen im
[Theriantrophie-Bericht](../../../diagnostics/theriantrophie-traits-20261102/REVIEW.md).
Der Katalog darf mehr als 120 Optionen enthalten; die bestehende technische
Grenze von 120 Merkmalen je einzelner Figur bleibt erhalten und wird sichtbar
geprüft. Katalogtests prüfen deshalb mehrere begrenzte Figuren statt eine
unzulässig große Sammelfigur.

## Dauerhafte Leiden, Arkanistenfieber und Abhängigkeiten

`modules/character-health/` ergänzt 52 Merkmale: 30 dauerhafte Leiden, zehn
Fieberausprägungen, neun Abhängigkeitsstadien und drei substanzgebundene
Toleranzen. Vier eigene Filter stehen in beiden Assistenten bereit. Bei der
Auswahl ersetzt ein neues Stadium das bisherige derselben Krankheit; importierte
Mehrfachstadien wirken und zählen nur einmal mit der stärksten Ausprägung.
Alle 52 haben neue eigene kreisförmige Comicicons.

Rausch und Kater sind separate Szenenzustände. Der passende Rausch unterdrückt
die Entzugsabzüge, ohne den dauerhaften Trait zu entfernen. Inventarkonsum und
interaktive Szenenzeit verwenden dieselben Regeln im Browser und auf dem Server.
Die [vollständigen Werte und Mengenregeln](../../docs/health/HEALTH_AND_SUBSTANCES_2026-11-02.md)
und die [Modulverantwortung](../character-health/README.md) dokumentieren die
Anbindung. Es gibt keine automatische Diagnose oder Krankheitsverschlimmerung.

## Feste psychologische Prägungen

`development-psychological-traits.js` ergänzt die sieben gewünschten
Spielprägungen: Psychopath, Soziopath, Narzisstisch, Eidetisches Gedächtnis,
Geistig beschränkt, Vollidiot und Genie. Sie besitzen einen eigenen Filter und
neue Comicicons. Namen und Werte sind autorisch festgelegte Aleria-Spielregeln.

Attributsboni und Obergrenzen liegen in `mechanics.attributeModifiers` und
`mechanics.attributeCaps`. `combat/combat-attribute-effects.js` berechnet sie
nach allen aktiven Effekten, ohne gespeicherte Grundwerte zu überschreiben.
Eine Obergrenze begrenzt auch freie Modifikatoren. Der Bogen und sein Radar
zeigen die wirksamen Werte; die Grundwerte bleiben bearbeitbar und erhalten.
Fertigkeiten, Rettungswürfe, Zauber, Initiative und KI-Daten nutzen dieselbe
Attributsberechnung. Genie gibt +2 INT-Attributspunkte und +1 auf Nachforschungen.
Eidetisches Gedächtnis unterstützt bereits bekanntes Wissen mit +2 Geschichte
und je +1 Arkane Kunde, Naturkunde und Religion; es erhöht keine allgemeinen Attribute.

`development-trait-groups.js` kapselt die bereits bewährte Auswahl alternativer
Ausprägungen gemeinsam für Gesundheit und psychologische Prägungen. Nur die
stärkere kognitive Einschränkung wirkt und zählt zur Balance. Weitere
Kombinationen erhalten Hinweise und bleiben wie negative Salden auswählbar.
Der [vollständige Werte- und Prüfbericht](../../../diagnostics/psychological-traits-20261102/REVIEW.md)
enthält Grenzen, Kosten, Quellen der neuen Bilder und Browserbelege.

Prüfung: `npm run test:health` und `npm run test:development`. Browserprüfung:
`node tests/character-development.browser.mjs`. Serverquellen mit
`node ../firebase/functions/scripts/sync-almanach-mechanics.mjs` abgleichen.
Den vollständigen Starthilfe-Weg prüft zusätzlich
`node tests/character-setup.browser.mjs`, einschließlich Klassenwechsel,
Stufe 5, Käufen, Traits, Minusstand, Vorratsanpassung und unveränderter Ausrüstung.
