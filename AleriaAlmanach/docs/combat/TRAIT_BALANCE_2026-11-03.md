# Trait-Balanceprüfung vom 3. November 2026

Alle 185 auswählbaren Definitionen wurden nach Wirkung, logischem Zusammenhang,
Reichweite, Preis und Überschneidungen geprüft: 65 Definitionen überarbeitet,
120 bewusst unverändert. Grundlage des Vorher-Vergleichs ist Git-Stand
`3bc537307276e6ecd52cf102c46b70a5d984f416`. Die Tabelle enthält jeden Eintrag einzeln.

## Maßstab und Entscheidungen

- Ein normaler Bonus +1 verändert eine nicht gedeckelte normale W20-Erfolgschance
  um fünf Prozentpunkte. +3 sind bereits fünfzehn Prozentpunkte. Gewöhnliche
  Eigenheiten und Begabungen bleiben deshalb bei meist ±1. Besondere ausgeprägte
  Sinne und Talente können +2 rechtfertigen; Expertise ist eigene Ausbildung.
- Neugier vor Vorsicht ist jetzt +1 Nachforschung / −1 GES-Rettung für 0 Punkte.
  Die kleinen Werte sind allgemeine Regelabstraktionen, keine behauptete
  automatische Ermittlerausbildung oder heimlich ungeprüfte Situationsfilter.
- Tagträume verleihen kein arkanes Wissen, Ängstlichkeit keine Schleichausbildung,
  Pazifismus keine Medizin, Musikgehör keine Menschenkenntnis und Körperformen
  keine automatische Bühnenausbildung. Entsprechende sachfremde Boni entfallen.
- Phobien erschweren passende Rettungen. Physische Anfälligkeit ist weiterhin
  ein eigener Trait. Feuergewöhnung gibt +1 auf passende Rettungen statt halben
  Brandschaden. Eiserne Konzentration hilft ausschließlich Konzentrationsrettungen.
- Die sieben psychologischen Namen bleiben autorische Aleria-Spieldefinitionen.
  Die Pakete behaupten keine klinischen Eigenschaften. Die automatische
  Detektivverstärkung entfällt. Gedächtnis erhöht bekanntes Wissen, Genie INT
  und eine kleine Nachforschungskomponente. Die ausdrücklich festgelegten
  kognitiven Wertobergrenzen bleiben erhalten.
- Das frühe Arkanistenfieber behält seine Autorenwirkungen; allein seine Preise
  werden auf 1 / 0 angehoben. Ein Magieschub ist kein kostenloser Punktegenerator.
- Preise sind Richtwerte für eine frei bearbeitbare Figur. Negative Salden bleiben
  erlaubt; Grundausbildung und persönliche Absprachen werden nicht rückwirkend
  neu berechnet. Viele kleine unabhängige Traits können sich weiter addieren.
  Neue Hinweise zeigen mehr als +3 Fertigkeitsbonus bzw. mehr als +2 Attributsrettung
  aus kombinierten numerischen Merkmalen. Nicht stapelbare Wirkungen zählen einmal.

## Glück und Pech

| Merkmal | Normale natürliche Fehlschlagszone | Weitere Wirkung | Richtpreis |
| --- | --- | --- | --- |
| Ohne Merkmal | natürliche 1: 5 % | unverändert | 0 |
| Glückspilz | zweimal hintereinander natürliche 1: 0,25 % | jede 1 einmal neu; +1 Attributsrettung | 5 |
| Pechvogel | natürliche 1–3: 15 % | −1 Attributsrettung | −5 |

Die Prozentwerte beschreiben nur die natürliche Fehlschlagszone bei einem W20,
nicht die gesamte SG-abhängige Fehlerrate. Vorteil/Nachteil würfeln jeden
betroffenen W20 einmal neu; eine zweite 1 bleibt verbindlich. Beide Traits
zusammen erhalten beide Regeln: 1 einmal neu, 2/3 weiter kritischer Fehlschlag;
die Rettungsboni heben sich auf. Wiederholte Quellen gewähren keine weiteren Rerolls.

## Kampfstart und bestehende Daten

Immer kampfbereit war gespeichert, wurde aber bei eigenen Figuren nicht angewandt.
Neue versionierte `startApplications` gewähren jetzt bei erstem Kampfeintritt
den stärksten eigenen temporären TP-Vorrat einschließlich aktiver Self-Aura.
Mit vorhandenen temporären TP zählt das Maximum. Verlassen/Wiedereintritt,
Wiederaufnahme und Neuladen füllen den Vorrat nicht auf. Aktuelle TP und andere
Ressourcen bleiben erhalten. Die Anwendung läuft vor fremden Auren, damit deren
späteres Ende den eigenen verbleibenden Vorrat richtig erhält.

Historische Kampfstartbelege ohne dieses Feld erhalten keine nachträgliche Wirkung.
Eine eigene Katalogrevision erkennt ausschließlich exakt bekannte unveränderte
Altkopien anhand vollständiger vorheriger Definitionen. Persönliche Varianten
bleiben erhalten; die Revision verändert keine vergangenen Würfe und füllt keine
Live-Ressourcen auf. Das Vorher-Manifest bleibt als reversible Quelle erhalten.

## Prüfungen

- `character-development-balance.test.mjs`: zehn semantische Prüfungen zu Neugier,
  kleinen Begabungen, Phobien, Feuergewöhnung, Körpermasse, Konzentration,
  Glück/Pech-Preisanteilen, Stapelhinweisen und frühen Fieberpreisen.
- `combat-encounter-start-effects.test.mjs`: sechs Lebenszyklusprüfungen zu neuen
  und historischen Starts, Wiedereintritt, Replay, inaktiven Quellen, stärkeren
  vorhandenen temporären TP und eigener/fremder Aura.
- Bestehende Entwicklungs-/Psyche-/Erweiterungs-/Audit-Regressionen prüfen die
  neuen Sollwerte und die unveränderte Grundausbildung. Die finale Browser/Server-
  Prüfung erfolgt nach gemeinsamem Mechanik-Sync; Teilprotokolle liegen unter
  `diagnostics/trait-balance-20261103/`.

## Vollständige Prüfmatrix

„Geändert“ schließt reine Preis- oder präzisierte Wirkungsänderungen ein.
Die Wertebeschreibung ist die jetzt sichtbare Katalogregel.

| Merkmal | Entscheidung | Punkte vorher → jetzt | Aktuelle Regel | Begründung |
| --- | --- | --- | --- | --- |
| Feuer Phobie | Geändert | -3 → -2 | Nachteil bei Rettungswürfen gegen feuerbasierte Angriffe. Die Angst erhöht nicht den erlittenen Feuerschaden. | Angst erschwert Rettungen, verursacht aber keine physische Feueranfälligkeit. |
| In der Natur aufgewachsen | Geändert | 4 → 2 | Vertrautheit mit der Wildnis: +1 auf Naturkunde und Mit Tieren umgehen. Keine automatische Expertise. | Umgebungserfahrung gibt kleine Boni, keine automatische Expertise. |
| Flinke Füße | Erhalten | 0 → 0 | +2 m Bewegung, −1 RK. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Standfest | Erhalten | 2 → 2 | +1 RK, −1 m Bewegung. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Wachsamer Blick | Erhalten | 2 → 2 | +2 passive Wahrnehmung und +1 Initiative. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Verträumt | Geändert | -1 → -1 | Abschweifende Aufmerksamkeit: −1 Initiative und −1 passive Wahrnehmung. Tagträume verleihen kein arkanes Fachwissen. | Aufmerksamkeitsnachteil erhalten; unbegründete arkane Fachkenntnis entfernt. |
| Zäh wie Leder | Erhalten | 2 → 2 | +4 maximale TP; aktuelle TP werden nicht aufgefüllt. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Zerbrechlich | Geändert | -1 → -1 | −3 maximale TP. Ein empfindlicher Körper verleiht keine automatische akrobatische Begabung. | Empfindlichkeit erhalten; unbegründete Akrobatik entfernt. |
| Mutiges Herz | Erhalten | 1 → 1 | +2 auf Rettungswürfe gegen Furcht. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Leicht zu erschrecken | Geändert | -1 → -1 | −2 auf Rettungswürfe gegen Furcht. Schreckhaftigkeit verleiht keine zusätzliche Schleichfertigkeit. | Furchtmalus erhalten; unbegründete Schleichfertigkeit entfernt. |
| Giftfeste Konstitution | Erhalten | 4 → 4 | Resistenz gegen Giftschaden; +1 auf Rettungswürfe gegen Gift. | Tatsächliche körperliche Giftfestigkeit darf Schaden und Giftrettungen betreffen; Preis 4 erhalten. |
| Frostempfindlich | Erhalten | -2 → -2 | Doppelter Kälteschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| An Glut gewöhnt | Geändert | 2 → 0 | Ruhe beim Umgang mit Feuer: +1 auf Rettungswürfe gegen feuerbasierte Angriffe; −1 Initiative. Gewöhnung halbiert keinen Feuerschaden. | Ruhigerer Umgang mit Feuer hilft der Rettung; Gewöhnung halbiert keinen Brandschaden. |
| Bücherwurm | Erhalten | 2 → 2 | Expertise in Geschichte; −1 auf Athletik. | Wissensorientierter Ausbildungs-Trait mit Expertise und körperlichem Tradeoff bleibt erhalten. |
| Menschenkenner | Geändert | 2 → 1 | +1 auf Motiv erkennen und Überzeugen. Einfühlung unterstützt den Umgang mit Menschen, ersetzt aber keine Ausbildung. | Einfühlung unterstützt zwei soziale Fertigkeiten um einen kleinen Betrag. |
| Schroffe Ehrlichkeit | Geändert | 0 → 0 | +1 auf Einschüchtern, −1 auf Täuschen. | Kleine gegenläufige soziale Einflüsse statt pauschalem Expertenvorsprung. |
| Silberzunge | Erhalten | 2 → 2 | Expertise in Überzeugen; −1 auf Motiv erkennen. | Ausgesprochener rhetorischer Ausbildungs-Trait mit Expertise und Tradeoff bleibt erhalten. |
| Zwei linke Hände | Geändert | -1 → -1 | −2 auf Fingerfertigkeit. Ungeschicklichkeit verändert die körperliche Widerstandskraft nicht. | Feinmotorischer Nachteil ohne sachfremde zusätzliche TP. |
| Ruhige Sehne | Erhalten | 1 → 1 | +1 Angriff mit Bögen und Armbrüsten; −1 Initiative. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Klingenmut | Erhalten | 0 → 0 | +1 Schaden mit Schwertern und Dolchen; −1 RK. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Arkaner Fokus | Geändert | 1 → 2 | +1 Zauberangriff, −1 Waffenangriff. | Ein Zauberer nutzt den Waffenmalus häufig kaum; Preis des wirksamen Zauberbonus erhöht. |
| Zähe Magie | Erhalten | 2 → 2 | +1 Zauber-SG; −1 m Bewegung. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Magiescheu | Erhalten | -2 → -2 | −1 Zauberangriff und −1 Zauber-SG. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Glückspilz | Geändert | 3 → 5 | Bei Angriffen, Proben und Attributsrettungswürfen wird jede natürliche 1 einmal automatisch neu gewürfelt; das zweite Ergebnis gilt. Auch bei Vorteil oder Nachteil wird jeder betroffene W20 genau einmal neu gewürfelt. Zusätzlich +1 auf alle Attributsrettungswürfe. | Explizite einmalige Würfelwiederholung macht Glück spürbar; Preis berücksichtigt sie. |
| Pechvogel | Geändert | -3 → -5 | Bei Angriffen, Proben und Attributsrettungswürfen gelten natürliche 1, 2 und 3 als kritischer Fehlschlag. Zusätzlich −1 auf alle Attributsrettungswürfe. | Explizite Fehlschlagszone 1–3 macht Pech spürbar; Gutschrift berücksichtigt sie. |
| Immer kampfbereit | Erhalten | 1 → 1 | Zu Kampfbeginn 3 temporäre TP; −1 passive Wahrnehmung. | Kleiner begrenzter Kampfeinstiegs-Vorrat; fehlende Engine-Anwendung separat behoben. |
| Eiserne Konzentration | Geändert | 2 → 2 | Vorteil auf KON-Rettungswürfe zum Aufrechterhalten einer Konzentration; −1 Initiative. Andere KON-Rettungswürfe bleiben unverändert. | Vorteil nur zum Erhalten einer Konzentration; kein unverdienter Gift-/Krankheitsschutz. |
| Lebhafter Geist | Erhalten | 3 → 3 | +1 auf alle Fertigkeitsproben; −1 RK. | Breiter kleiner Fertigkeitsbonus kostet Punkte und dauerhaften Rüstungsschutz. |
| Kraftpaket | Erhalten | 2 → 2 | +2 auf Athletik und +1 Schaden mit Äxten und Keulen; −1 auf Heimlichkeit. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Dünnhäutig | Geändert | -1 → -1 | −1 auf CHA-Rettungswürfe. Empfindlichkeit verleiht keine zusätzliche Bühnenfertigkeit. | Kleiner passender CHA-Malus; keine aus Empfindlichkeit abgeleitete Bühnenausbildung. |
| Vollbusig | Geändert | 1 → 0 | Ausgeprägte Brustform als rein beschreibendes Körpermerkmal; keine pauschale Änderung sozialer Fertigkeiten. | Körperform bleibt Beschreibung und vergibt keine pauschale Fertigkeit. |
| Hässlich | Geändert | -1 → -1 | Als unvorteilhaft wahrgenommene Gesichtszüge; −1 auf Flirten. Die Erscheinung erzeugt keine zusätzliche Einschüchterungsfertigkeit. | Kleiner enger Eindrucksmalus; keine automatische Einschüchterung. |
| Gutaussehend | Geändert | 2 → 1 | Als ansprechend wahrgenommene Gesichtszüge; +1 auf Flirten. Der kleine Eindrucksbonus ersetzt keine Überzeugungs- oder Bühnenausbildung. | Kleiner enger Eindrucksbonus; Aussehen ersetzt keine Rhetorik/Bühnenausbildung. |
| Fit | Erhalten | 2 → 2 | Trainierter Körper; +2 auf Athletik und +2 maximale TP. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Fragil | Erhalten | -3 → -3 | Empfindlicher Körperbau; −4 maximale TP und −1 auf KON-Rettungswürfe. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Schmächtig | Erhalten | 0 → 0 | Schmaler, leichter Körperbau; −2 auf Athletik, +1 auf Akrobatik und Heimlichkeit. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Klein | Geändert | 1 → 0 | Unterdurchschnittliche Körpergröße; +1 auf Heimlichkeit und −1 auf Athletik. | Größenwirkung auf ±1 mit ausgeglichenem Richtpreis verkleinert. |
| Groß | Geändert | 1 → 0 | Überdurchschnittliche Körpergröße; +1 auf Athletik und −1 auf Heimlichkeit. | Größenwirkung auf ±1 mit ausgeglichenem Richtpreis verkleinert. |
| Hünenhaft | Erhalten | 2 → 2 | Sehr großer, kräftiger Körper; +4 maximale TP und +2 auf Athletik, −2 auf Akrobatik. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Riesenblut | Geändert | 3 → 2 | Außergewöhnlich massiger Körperbau; +6 maximale TP und +1 auf Athletik, −1 Initiative und −1 auf Heimlichkeit. Keine automatische Änderung der Rasse oder Abstammungsakte. | Masse hilft Athletik und TP; kein pauschaler Bonus auf Bogen-/Feuerwaffenschaden. |
| Breitschultrig | Geändert | 1 → 1 | Breite Schultern und kräftiger Oberkörper; +1 auf Athletik. Schulterbreite beeinträchtigt nicht automatisch die Feinmotorik. | Kleiner Kraftbonus; Schulterbreite beeinträchtigt keine Fingerfertigkeit. |
| Sehnig | Erhalten | 1 → 1 | Drahtiger Körper mit kräftigen Sehnen; +1 auf Athletik und Akrobatik. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Gelenkig | Erhalten | 2 → 2 | Große Beweglichkeit; +2 auf Akrobatik und +1 auf Fingerfertigkeit. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Steife Gelenke | Erhalten | -2 → -2 | Eingeschränkte Gelenkbeweglichkeit; −2 auf Akrobatik und −1 m Bewegung. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Scharfe Augen | Erhalten | 2 → 2 | +2 auf Wahrnehmung und zusätzlich +1 passive Wahrnehmung. Die passive Wahrnehmung steigt dadurch insgesamt um 3. | Ausgeprägter körperlicher Sinn darf stärker sein; +3 passive Wahrnehmung ist ausdrücklich erklärt. |
| Schwerhörig | Erhalten | -1 → -1 | Eingeschränktes Hörvermögen; −2 auf Wahrnehmung. Der gespeicherte Abzug ist ein allgemeiner Probenabzug. | Bestehender allgemeiner Wahrnehmungsabzug bleibt als ausdrücklich erklärte Regelabstraktion. |
| Eiserne Lunge | Erhalten | 2 → 2 | Kräftige Lunge und große Ausdauer; +1 auf KON-Rettungswürfe und +1 auf Athletik. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Schneller Stoffwechsel | Erhalten | 0 → 0 | Leichter, rasch ermüdender Körper; +1 m Bewegung und −2 maximale TP. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Schwere Knochen | Erhalten | 1 → 1 | Dichter, schwerer Knochenbau; +3 maximale TP und −1 Initiative. | Kleine feste Widerstandskraft mit nachvollziehbarer Trägheit. |
| Robuste Haut | Erhalten | 2 → 2 | Widerstandsfähige, vernarbte Haut; +1 RK und −1 auf Auftreten. | Begrenzter körperlicher Vor-/Nachteil; feste TP füllen aktuelle TP nicht auf und Größenkonflikte werden sichtbar. |
| Frostphobie | Geändert | -3 → -2 | Nachteil bei Rettungswürfen gegen kältebasierte Angriffe. Die Angst erhöht nicht den erlittenen Kälteschaden. | Angst erschwert Rettungen, verursacht aber keine physische Kälteanfälligkeit. |
| Blitzphobie | Geändert | -3 → -2 | Nachteil bei Rettungswürfen gegen Blitzangriffe. Die Angst erhöht nicht den erlittenen Blitzschaden. | Angst erschwert Rettungen, verursacht aber keine physische Blitzanfälligkeit. |
| Giftphobie | Geändert | -3 → -2 | Nachteil bei Rettungswürfen gegen giftbasierte Angriffe. Die Angst erhöht nicht den erlittenen Giftschaden. | Angst erschwert Rettungen, verändert aber keinen Giftstoffwechsel. |
| Magiephobie | Erhalten | -3 → -3 | Nachteil bei Rettungswürfen gegen Zauber, Gebete und magische Lieder. Gewöhnliche Waffenangriffe bleiben unberührt. | Begrenzte klar ausgewiesene Wirkung mit bestehendem Preis/Tradeoff; keine neue Kompetenz- oder Ressourcenvergabe. |
| Heilerhände | Geändert | 4 → 2 | Sicheres Gespür bei der Versorgung: +2 auf Heilkunde und +1 auf Naturkunde. | Begabung gibt begrenzte Versorgungshilfe statt stufenabhängiger automatischer Expertise. |
| Spürnase | Geändert | 4 → 2 | Ausgeprägte Beobachtungsgabe: +2 auf Nachforschungen und +1 auf Wahrnehmung. | Ausgeprägte Beobachtung ist stärker als bloße Neugier, aber keine automatische Expertise. |
| Bühnenbegabt | Geändert | 4 → 2 | Gespür für Ausdruck und Bewegung: +2 auf Auftreten und +1 auf Akrobatik. | Begrenzte Ausdrucksbegabung statt automatischer Expertise. |
| Flinke Finger | Geändert | 4 → 2 | Geschickte, ruhige Hände: +2 auf Fingerfertigkeit und +1 auf Heimlichkeit. | Begrenzte manuelle Begabung statt automatischer Expertise. |
| Geborener Fährtenleser | Geändert | 4 → 2 | Gespür für Spuren und Wildnis: +2 auf Überleben und +1 auf Naturkunde. | Begrenztes Spurengespür statt automatischer Expertise. |
| Lügenriecher | Geändert | 4 → 2 | Aufmerksam für Widersprüche: +1 auf Motiv erkennen und WEI-Rettungswürfe. | Kleines Gespür; weder unfehlbares Erkennen von Lügen noch automatische Expertise. |
| Feueraffinität | Erhalten | 3 → 3 | Resistenz gegen Feuerschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Eisaffinität | Erhalten | 3 → 3 | Resistenz gegen Kälteschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Blitzaffinität | Erhalten | 3 → 3 | Resistenz gegen Blitzschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Säureaffinität | Erhalten | 3 → 3 | Resistenz gegen Säureschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Schallaffinität | Erhalten | 3 → 3 | Resistenz gegen Donnerschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Giftanfällig | Erhalten | -3 → -3 | Doppelter Giftschaden und −1 auf Rettungswürfe gegen Gift. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Säureempfindlich | Erhalten | -2 → -2 | Doppelter Säureschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Blitzempfindlich | Erhalten | -2 → -2 | Doppelter Blitzschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Schallempfindlich | Erhalten | -2 → -2 | Doppelter Donnerschaden. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Magische Resonanz | Erhalten | -4 → -4 | Doppelter magischer Schaden aller Schadensarten. Nichtmagischer Schaden bleibt normal. | Tatsächliche körperliche/magische Affinität bleibt getrennt von Angst; Halbierung/Verdopplung zählt pro Schadensart nur einmal. |
| Bühnensicher | Erhalten | 3 → 3 | Vorteil bei Auftreten-Proben. Mehrere Quellen von Vorteil geben keine zusätzlichen Würfel. | Enger Fertigkeitsvorteil; keine zusätzlichen Würfel bei mehreren Quellen. |
| Arkan geschult | Erhalten | 3 → 3 | Vorteil bei Proben auf Arkane Kunde. Gibt keinen zusätzlichen Zauberangriffs- oder Zauber-SG-Bonus. | Explizite Schulung betrifft nur Arkane Kunde, keine zusätzliche Zaubermacht. |
| Frohnatur | Geändert | 2 → 2 | Offenes, ansteckend fröhliches Auftreten: je +1 auf Überzeugen, Auftreten und Flirten. | Freundlicher Eindruck unterstützt Kontakt; Fröhlichkeit erkennt keine versteckten Motive. |
| Bühnenmensch | Geändert | -1 → 0 | Auf der Bühne zuhause, in der Wildnis ungeübt: +1 auf Auftreten; −1 auf Überleben. | Kleiner Ausdrucks-/Wildnisgegensatz; sachfremder Einschüchterungsmalus entfernt. |
| Ordnungszwang | Geändert | 0 → 0 | Dein Blick für Abweichungen hilft ein wenig, Einzelheiten kosten Zeit: +1 auf Nachforschungen, −1 Initiative. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Namenhüter | Geändert | 1 → 1 | Namen und gehörte Lebensgeschichten bleiben dir im Gedächtnis: +1 auf Geschichte und Überzeugen, −1 auf Wahrnehmung. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Unverbesserlicher Optimist | Geändert | 1 → 1 | Du erwartest stets das Beste: +1 auf Rettungswürfe gegen Furcht und Überzeugen, −1 auf Motiv erkennen. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Schwarzseher | Geändert | 0 → 1 | Du rechnest mit Schwierigkeiten und wirkst entsprechend düster: +1 Initiative und +1 auf Motiv erkennen, −1 auf Überzeugen. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Schweigegelübde | Geändert | -1 → -1 | Du hörst eher zu und verzichtest auf deine Stimme: +1 auf Motiv erkennen, −1 auf Überzeugen und Auftreten. Die kleinen Abzüge bilden die eingeschränkte Ausdrucksweise allgemein ab; Schrift und Gebärden bleiben möglich. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Eigensinn | Geändert | 1 → 0 | Dein Selbstbild lässt sich schwer erschüttern; Kompromisse fallen dir schwer: +1 auf CHA-Rettungswürfe, −1 auf Überzeugen. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Ritualgebunden | Geändert | 0 → 0 | Du kennst deine wiederkehrenden Riten, reagierst aber zögerlich auf Neues: +1 auf Religion, −1 Initiative. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Neugier vor Vorsicht | Geändert | -1 → 0 | Du schaust genauer hin, gehst dabei aber eher ein Risiko ein: +1 auf Nachforschungen, −1 auf GES-Rettungswürfe. Neugier ersetzt keine Ermittlerausbildung. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Übervorsichtig | Geändert | 0 → 0 | Du suchst zuerst einen sicheren Ausweg und zögerst dadurch: +1 auf GES-Rettungswürfe, −1 Initiative. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Wanderlust | Geändert | 0 → 1 | Du bleibst lieber unterwegs, als dich lange an einer Stelle aufzuhalten: +1 m Bewegung und +1 auf Überleben, −1 auf Nachforschungen. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Totengräberhumor | Geändert | 1 → 1 | Mit Bestattungsbräuchen vertraut begegnest du dem Unheimlichen mit unpassenden Scherzen: +1 auf Religion und Rettungswürfe gegen Furcht, −1 auf Auftreten. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Stille Zeugin | Geändert | 0 → 0 | Du beobachtest lieber vom Rand aus: +1 passive Wahrnehmung, −1 auf Auftreten. Der Bonus verändert keine aktiven Wahrnehmungsproben. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Fremde Erinnerungen | Geändert | 0 → 1 | Bruchstücke fremder Geschichten und Runen drängen sich in deinen Geist: +1 auf Geschichte und Arkane Kunde, −1 auf WEI-Rettungswürfe. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Schatten von Morgen | Geändert | 0 → 0 | Unbestimmte Vorahnungen treiben dich an, erschweren aber klare Gedanken: +1 Initiative, −1 auf INT-Rettungswürfe. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Schuldengewissen | Geändert | 0 → 0 | Du gehst sorgsam mit Zusagen um und scheust Ausreden: +1 auf Überzeugen, −1 auf Täuschen. Ein schlechtes Gewissen verleiht keine Fähigkeit, andere zu durchschauen. | Verlässlichkeit hilft Überzeugen; Gewissen vermittelt kein Gedankenlesen. |
| Pazifistische Ader | Geändert | 0 → 0 | Du suchst eher Versöhnung als Verletzung: +1 auf Überzeugen, −1 Waffenschaden. Pazifismus verleiht keine medizinische Ausbildung. Zauberschaden bleibt unverändert. | Versöhnliche Haltung bleibt; medizinische Fachfertigkeit aus Überzeugung entfernt. |
| Ehrenhafter Zweikampf | Erhalten | 1 → 1 | Du bevorzugst die direkte Begegnung: +1 auf Nahkampf-Waffenangriffe, −1 auf Fernkampf-Waffenangriffe. Das gilt auch für entsprechende Techniken, nicht für Zauber. | Eng gefilterte kleine Waffen-/Magiewirkung ist bereits stimmig; keine weitere Ausweitung. |
| Deckungssucher | Erhalten | 1 → 1 | Du bewegst dich bedächtig und schützt dich vor Beschuss: −1 m Bewegung; eingehender Fernkampf-Waffenschaden wird um 1 reduziert. Keine Wirkung gegen Nahkampf oder Zauber. | Eng gefilterte kleine Waffen-/Magiewirkung ist bereits stimmig; keine weitere Ausweitung. |
| Magische Wetterfühligkeit | Erhalten | 1 → 1 | Magische Spannungen machen dich unruhig: +1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder, −1 Initiative. | Eng gefilterte kleine Waffen-/Magiewirkung ist bereits stimmig; keine weitere Ausweitung. |
| Abergläubisch | Geändert | -1 → -1 | Du kennst viele Omen und deutest Magie schnell als schlechtes Zeichen: +1 auf Religion, −1 auf Rettungswürfe gegen Zauber, Gebete und magische Lieder. | Charakterliche Neigung auf kleines ±1-Paket begrenzt; Preis folgt verbleibender Wirkung. |
| Zahlenintuition | Geändert | 2 → 1 | Du erkennst Mengenverhältnisse und Muster schnell: +1 auf Nachforschungen. Zahlengefühl vermittelt kein historisches Wissen. | Kleines Mustererkennen ohne historisches Fachwissen. |
| Sprachgefühl | Geändert | 2 → 1 | Du findest leicht den passenden Ausdruck: +1 auf Überzeugen und Täuschen. | Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete. |
| Mechanisches Verständnis | Geändert | 2 → 1 | Du begreifst kleine Bauteile und gehst sicher damit um: +1 auf Fingerfertigkeit und Nachforschungen. | Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete. |
| Feines Musikgehör | Geändert | 2 → 1 | Du hörst Rhythmus und Tonhöhe sicher: +1 auf Auftreten. Musikalisches Gehör verrät keine fremden Absichten. | Musikalisches Gehör hilft Ausdruck, nicht dem Erkennen fremder Absichten. |
| Raumgefühl | Geändert | 2 → 1 | Du schätzt Abstände und die eigene Lage im Raum gut ein: +1 auf Akrobatik und Körperbeherrschung. | Räumliches Körpergefühl hilft Bewegung, nicht allgemeinen Ermittlungen. |
| Taktisches Gespür | Erhalten | 2 → 2 | Du erkennst rasch, wann eine Lage kippt: +1 Initiative und +1 auf WEI-Rettungswürfe. | Kleine Initiative-/Willenskombination ist begrenzt und passend bepreist. |
| Alchemistisches Gespür | Geändert | 2 → 1 | Du bemerkst Auffälligkeiten von Stoffen und Magie leichter: +1 auf Naturkunde und Arkane Kunde. Rezepte müssen weiterhin erlernt werden. | Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete. |
| Symboldenker | Geändert | 2 → 1 | Du erkennst Beziehungen zwischen Zeichen, Riten und Runen: +1 auf Religion und Arkane Kunde. | Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete. |
| Stimmkünstler | Geändert | 2 → 1 | Du variierst Stimme und Ausdruck mühelos: +1 auf Täuschen und Auftreten. | Kleine nachvollziehbare Begabung mit passendem niedrigeren Preis statt breiter +2-Pakete. |
| Tierisches Taktgefühl | Geändert | 2 → 1 | Du passt deine Bewegungen und Ruhe gut an Tiere an: +1 auf Mit Tieren umgehen. Daraus folgt keine allgemeine Körperausbildung. | Umgang mit Tieren verbessert keine allgemeine Körperausbildung. |
| Blutträger (Vampirspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines vampirischen Vorfahren: +1 Zauberangriff, +1 auf Arkane Kunde und KON-Rettungswürfe. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Formlingsspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines Formlings oder Formwandlers: +1 Zauber-SG und +2 auf Täuschen. Die Anlage begünstigt Illusion und Verstellung. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Succubusspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines Sukkubus oder Inkubus: +1 Zauber-SG, +2 auf Flirten und +1 auf Motiv erkennen. Die Anlage begünstigt Traum- und Gefühlsmagie. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Satyrspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines Satyrs: +1 Zauberangriff, +2 auf Auftreten und +1 auf Akrobatik. Magische Begabung zeigt sich besonders in Klang und Rhythmus. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Aelvarspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe einer Aelvar: +1 Zauber-SG, +2 auf Heimlichkeit und +1 auf Religion. Die infernale Anlage ist von subtiler Magie und verborgenen Riten geprägt. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Nymphenspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe einer celestialen Nymphe: +1 Zauber-SG und jeweils +1 auf Naturkunde, Heilkunde und Mit Tieren umgehen. Die Anlage ist lebens- und naturverbunden. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Flammenspross) | Erhalten | 5 → 5 | Angeborenes menschliches Erbe eines humanoiden Celestialen der Flamme: +1 Zauberangriff und Resistenz gegen Feuerschaden. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Windspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines humanoiden Celestialen der Winde: +1 Zauberangriff, +1 m Bewegung und +1 auf Akrobatik. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Donnerspross) | Erhalten | 5 → 5 | Angeborenes menschliches Erbe eines humanoiden Celestialen des Donners: +1 Zauberangriff und Resistenz gegen Blitzschaden. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Blutträger (Bergspross) | Erhalten | 4 → 4 | Angeborenes menschliches Erbe eines humanoiden Celestialen der Berge: +1 Zauber-SG, +2 maximale TP und +1 auf STÄ-Rettungswürfe. Aktuelle TP werden nicht aufgefüllt. | Belegte übernatürliche Anlage mit begrenzten Boni und höherem Preis; keine Rassen-, Zauber- oder Verwandlungsvergabe. |
| Zatracher Theriantrophie (Werwolf) · Fluchform | Erhalten | -1 → -1 | Zatrachs Fluch des Wolfes: ungewollte, gewöhnlich mondgebundene Hybridwandlung mit Kontrollverlust. Passive Grundprägung: +2 auf Wahrnehmung, +1 Initiative und −2 auf WEI-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Werwolf) · Jüngersegen | Erhalten | 2 → 2 | Zatrachs Jüngersegen mit grundsätzlich willentlich gelenkter Wandlung und erhaltenem Verstand. Passive Grundprägung: +1 auf Wahrnehmung, Überleben und STÄ-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Werbär) · Fluchform | Erhalten | -1 → -1 | Zatrachs Fluch des Bären: ungewollte, gewöhnlich mondgebundene Hybridwandlung mit Kontrollverlust. Passive Grundprägung: +3 maximale TP, +1 auf Athletik und −2 auf WEI-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Werbär) · Jüngersegen | Erhalten | 3 → 3 | Zatrachs Jüngersegen mit grundsätzlich willentlich gelenkter Wandlung und erhaltenem Verstand. Passive Grundprägung: +3 maximale TP und +1 auf KON-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Wereber) · Fluchform | Erhalten | -1 → -1 | Zatrachs Fluch des Ebers: ungewollte, gewöhnlich mondgebundene Hybridwandlung mit Kontrollverlust. Passive Grundprägung: +2 auf Athletik, +1 auf Körperbeherrschung, −2 auf Motiv erkennen und −1 auf WEI-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Wereber) · Jüngersegen | Erhalten | 1 → 1 | Zatrachs Jüngersegen mit grundsätzlich willentlich gelenkter Wandlung und erhaltenem Verstand. Passive Grundprägung: +1 auf STÄ- und KON-Rettungswürfe, −1 Initiative. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Werluchs) · Fluchform | Erhalten | -1 → -1 | Zatrachs Fluch des Luchses: ungewollte, gewöhnlich mondgebundene Hybridwandlung mit Kontrollverlust. Passive Grundprägung: +2 auf Heimlichkeit, +1 auf Akrobatik und −2 auf WEI-Rettungswürfe. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Zatracher Theriantrophie (Werluchs) · Jüngersegen | Erhalten | 2 → 2 | Zatrachs Jüngersegen mit grundsätzlich willentlich gelenkter Wandlung und erhaltenem Verstand. Passive Grundprägung: +2 auf Heimlichkeit und +1 Initiative. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Silvanische Symbiose der Varulv (Wolf) | Erhalten | 2 → 2 | Angeborene Verbindung zu Silvanas Wolfs-Urgeist im Erbe der Varulv. Grundprägung: +1 auf Wahrnehmung, Überleben und Mit Tieren umgehen. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Silvanische Symbiose der Mac Ard Diuid (Bär) | Erhalten | 3 → 3 | Überliefertes Bärenerbe der Mhathain in der Diuid-Linie. Grundprägung: +2 maximale TP, +1 auf Athletik und STÄ-Rettungswürfe. Stärkere Manifestationen sind selten. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Silvanische Symbiose der Ó Lockart (Bär) | Erhalten | 2 → 2 | Abgeschwächtes Bärenerbe aus der Diuid-Linie. Grundprägung: +1 auf KON-Rettungswürfe, Körperbeherrschung und passive Wahrnehmung. Die Überlieferung beschreibt seltene Träger. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Silvanische Symbiose der Dál Haig (Bär) | Erhalten | 2 → 2 | Seltenes, schwach ausgeprägtes Bärenerbe der Haig; in der Clanüberlieferung nicht für jeden Angehörigen belegt. Grundprägung: +2 auf Athletik und +1 auf Körperbeherrschung. | Begrenzte übernatürliche Grundprägung; Fluch, Segen und seltene Clananlage bleiben getrennt, ohne automatische Verwandlung. |
| Psychopath | Geändert | 4 → 0 | Aleria-Spielprägung der emotionalen Distanz: +1 auf Rettungswürfe gegen Furcht; −1 auf Motiv erkennen und Flirten. Die Prägung vermittelt keine Ermittlerausbildung. | Autorische Spielprägung mit kleinem Paket; keine automatische Detektivkompetenz. |
| Soziopath | Geändert | -3 → 0 | Aleria-Spielprägung der sozialen Distanz: +1 auf CHA-Rettungswürfe; −1 auf Überzeugen und Motiv erkennen. Keine zusätzlichen Nachforschungs- oder Wahrnehmungskenntnisse. | Autorische Spielprägung mit kleinem Paket; keine automatische Detektivkompetenz. |
| Narzisstisch | Geändert | 0 → 1 | Ausgeprägte Selbstdarstellung: +1 auf Auftreten und CHA-Rettungswürfe; −1 auf Überzeugen und Motiv erkennen. | Kleine Selbstdarstellungs-/Selbstbehauptungswirkung mit kleinen sozialen Nachteilen. |
| Eidetisches Gedächtnis | Geändert | 6 → 4 | Sicheres Erinnern bereits wahrgenommener Informationen: +2 auf Geschichte und +1 auf Arkane Kunde, Naturkunde und Religion. Keine allgemeine INT-Erhöhung oder medizinische Ausbildung; unbekannte Informationen müssen weiterhin beschafft werden. | Erinnern unterstützt bekanntes Wissen, erhöht aber nicht INT oder Heilkunde. |
| Geistig beschränkt | Erhalten | -8 → -8 | −4 auf sämtliche Fertigkeitsproben. Die wirksamen Attributswerte INT und WEI sind auf höchstens 3 begrenzt, auch mit Boni oder freien Modifikatoren. Andere Handlungen werden nicht pauschal gesperrt. | Ausdrückliche feste Autorenregel erhalten; INT/WEI-Wertobergrenze 3 bleibt wirksam. |
| Vollidiot | Erhalten | -10 → -10 | Stärkere alternative Einschränkung: −6 auf sämtliche Fertigkeitsproben. INT und WEI höchstens 2, auch mit Boni oder freien Modifikatoren. Ersetzt die Ausprägung „Geistig beschränkt“; keine zusätzliche Punktgutschrift für beide. | Ausdrückliche alternative Autorenregel erhalten; stärkere Grenze ersetzt statt stapelt. |
| Genie | Geändert | 10 → 5 | +2 auf den INT-Attributswert und +1 auf Nachforschungen. Der daraus entstehende INT-Modifikator gilt ebenfalls. Geistige Begabung erhöht keine körperlichen Attribute und vergibt keine automatische Ausbildung. | Geistige Begabung wirkt auf INT und Nachforschung; körperliche und pauschale Fertigkeitsbuffs entfallen. |
| Blind | Erhalten | -5 → -5 | Dauerhafter Verlust des Sehvermögens. Nachteil auf Angriffswürfe; −2 Initiative. Rein visuelle Aufgaben sind ohne geeigneten Ersatzsinn unmöglich. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Einäugig | Erhalten | -1 → -1 | Eingeschränktes räumliches Sehen: −1 auf Fernkampf-Waffenangriffe und −1 passive Wahrnehmung. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Dauerhafte Sehschwäche | Erhalten | -1 → -1 | −1 auf Wahrnehmung und Nachforschungen. Individuell angepasste Sehhilfen werden gesondert vereinbart. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Taub | Erhalten | -3 → -3 | Dauerhafter Verlust des Hörvermögens. −1 Initiative. Rein akustische Aufgaben sind ohne Ersatzwahrnehmung unmöglich; visuelle Wahrnehmung bleibt unverändert. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Einseitig taub | Erhalten | -1 → -1 | Schallquellen lassen sich schwer orten: −1 Initiative und −1 passive Wahrnehmung. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Stumm | Erhalten | -2 → -2 | Die Figur kann keine Stimme erzeugen. Schrift und Gebärden funktionieren; ausdrücklich stimmgebundene Handlungen benötigen eine Alternative. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Geruchssinnverlust | Erhalten | -1 → -1 | Gerüche werden nicht wahrgenommen. Rein geruchsbasierte Aufgaben sind ohne Ersatz unmöglich. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Geschmackssinnverlust | Erhalten | 0 → 0 | Geschmack wird nicht wahrgenommen. Verdorbene oder veränderte Speisen können nicht allein durch Kosten erkannt werden. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Einarmig | Erhalten | -4 → -4 | Ein Arm fehlt oder ist dauerhaft unbrauchbar: −2 auf Athletik. Tätigkeiten mit zwei benötigten Händen sind ohne geeigneten Ersatz nicht möglich. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Fehlende Hand | Erhalten | -3 → -3 | Eine Hand fehlt oder ist dauerhaft unbrauchbar: −1 auf Fingerfertigkeit. Handabhängige Ausrüstung benötigt eine passende Alternative. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Fehlende Finger | Erhalten | -1 → -1 | Mehrere Finger fehlen oder sind dauerhaft unbeweglich: −2 auf Fingerfertigkeit. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Angeborener Handtremor | Erhalten | -2 → -2 | Anhaltendes Zittern: −2 auf Fingerfertigkeit und −1 auf Angriffe mit Bögen, Armbrüsten und Feuerwaffen. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronisches Hinken | Erhalten | -1 → -1 | Dauerhaft beeinträchtigter Gang: −1 m Bewegung und −1 auf Akrobatik. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Versteiftes Knie | Erhalten | -2 → -2 | −2 m Bewegung und −2 auf Akrobatik. Die Einschränkung bleibt nach Rasten bestehen. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Fehlender Fuß | Erhalten | -3 → -3 | Ein Fuß fehlt oder ist dauerhaft unbrauchbar: −3 m Bewegung und −2 auf Körperbeherrschung. Hilfsmittel werden individuell abgebildet. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Gelähmte Beine | Erhalten | -5 → -5 | Eigenständige Fortbewegung mit den Beinen ist nicht möglich. −3 auf Akrobatik; Rollstuhl, Reittier, Tragen oder Magie benötigen eine eigene Bewegungsregel. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Angeborene Wirbelsäulenverkrümmung | Erhalten | -2 → -2 | −1 auf Athletik und Körperbeherrschung sowie −1 m Bewegung. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Angeborene Knochenbrüchigkeit | Erhalten | -3 → -3 | −4 maximale TP und −1 auf STÄ-Rettungswürfe. Keine pauschale Verdoppelung sämtlichen Schadens. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Angeborenes Bluterleiden | Erhalten | -2 → -2 | −2 maximale TP und −2 auf Rettungswürfe gegen Blutungsfolgen. Bestehende feste Kritfolgen werden nicht verstärkt oder verlängert. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronische Lungenschwäche | Erhalten | -2 → -2 | −2 auf KON-Rettungswürfe und −1 auf Athletik. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Angeborener Herzfehler | Erhalten | -2 → -2 | −3 maximale TP und −1 auf KON-Rettungswürfe. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronische Nierenschwäche | Erhalten | -2 → -2 | −2 auf Rettungswürfe gegen Gift und −1 auf Körperbeherrschung. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronische Leberschwäche | Erhalten | -2 → -2 | −2 auf Rettungswürfe gegen Gift. Alkoholbelastung zählt zusätzlich um 25 % stärker; Toleranz verändert nicht diesen Nachteil. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronisches Verdauungsleiden | Erhalten | -2 → -2 | −2 maximale TP und −1 auf KON-Rettungswürfe. Passende Nahrung ist eine individuelle Erleichterung, keine automatische Heilung. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Dauerhafte Nervenverletzung | Erhalten | -2 → -2 | −1 auf Fingerfertigkeit und Körperbeherrschung; −1 Initiative. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronische Migräne | Erhalten | -1 → -1 | Anhaltende Beschwerden: −1 Initiative und −1 auf Nachforschungen. Einzelne schwere Schübe werden gesondert geführt. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronische Schlaf-Wach-Störung | Erhalten | -1 → -1 | −2 Initiative. Schlafanfälle werden ausdrücklich als eigener Zustand vergeben, niemals zufällig beim Laden. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Dauerhaft lichtempfindliche Augen | Erhalten | -2 → -2 | −1 auf Wahrnehmung und Fernkampf-Waffenangriffe. Schutz vor grellem Licht wird individuell berücksichtigt. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Chronisch vernarbtes Gewebe | Erhalten | -1 → -1 | −2 maximale TP und −1 auf Akrobatik durch dauerhaft eingeschränkte Gewebeelastizität. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Dauerhafte arkane Vernarbung | Erhalten | -2 → -2 | −1 Zauberangriff und −1 auf Rettungswürfe gegen Magie. Keine automatische Infektion mit Arkanistenfieber. | Konkrete dauerhafte Beeinträchtigung mit begrenzten Werten; alternative Ausprägungen werden nicht mehrfach gerechnet. |
| Anzeichen vom Arkanistenfieber | Geändert | 0 → 1 | Beginnende arkane Überreizung: +1 Zauberangriff, −1 Initiative. Eine Beobachtung, noch kein sicher festgestelltes Hauptstadium. | Spürbarer Zauberangriffsbonus ist ein positiver Richtpreis; keine kostenlose Buff-Optimierung. |
| Erste Symptome des Arkanistenfiebers | Geändert | -1 → 0 | Der kurzzeitige Magieschub bleibt: +1 Zauberangriff; −1 Initiative und −1 auf KON-Rettungswürfe. Weitere Magie gefährdet die Figur. | Zusätzlicher KON-Malus neutralisiert den Richtpreis des frühen Magieschubs. |
| Arkanes Fieber I. Stadium | Erhalten | -2 → -2 | Müdigkeit, Blässe und entzündete Augen. −1 auf Fertigkeiten, Rettungswürfe und Initiative; −1 m Bewegung. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber II. Stadium | Erhalten | -4 → -4 | Krämpfe, Fieber und Organstörungen. −2 auf Fertigkeiten, Rettungswürfe und Initiative; −2 m Bewegung; −2 maximale TP. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber III. Stadium | Erhalten | -6 → -6 | Fortschreitende Nekrose und geistiger Verfall. −3 auf Fertigkeiten, Rettungswürfe und Initiative; −3 m Bewegung; −6 maximale TP. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber IV. Stadium | Erhalten | -8 → -8 | Vollständiger Ich-Verlust. −4 auf Fertigkeiten, Rettungswürfe und Initiative; −4 m Bewegung; −8 maximale TP. Keine selbstbestimmten Kampfhandlungen; Abwarten bleibt möglich. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber I. Stadium (Druidenvariante) | Erhalten | -2 → -2 | Erschöpfung und gestörte Aura. −1 auf Fertigkeiten, Rettungswürfe und Initiative; −1 m Bewegung; zusätzlich −1 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber II. Stadium (Druidenvariante) | Erhalten | -4 → -4 | Halluzinationen und instabile Instinkte. −2 auf Fertigkeiten, Rettungswürfe und Initiative; −2 m Bewegung; zusätzlich −2 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber III. Stadium (Druidenvariante) | Erhalten | -6 → -6 | Schwerer geistiger Verfall ohne Nekrose. −3 auf Fertigkeiten, Rettungswürfe und Initiative; −3 m Bewegung; zusätzlich −3 auf WEI-Rettungswürfe. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Arkanes Fieber IV. Stadium (Druidenvariante) | Erhalten | -8 → -8 | Vollständiger Ich-Verlust ohne Nekrose. −4 auf Fertigkeiten, Rettungswürfe und Initiative; −4 m Bewegung; zusätzlich −4 auf WEI-Rettungswürfe. Keine selbstbestimmten Kampfhandlungen; Abwarten bleibt möglich. Keine Heilung durch TP-Heilung oder Rast. | Abgestuftes dauerhaftes Krankheitsstadium; nur die höchste Ausprägung wirkt, keine freie Mehrfachgutschrift. |
| Alkoholiker (I. Stadium) | Erhalten | -1 → -1 | Entzug: −1 auf Fertigkeiten. Diese Entzugsabzüge entfallen ausschließlich während „Betrunken“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Alkoholiker (II. Stadium) | Erhalten | -2 → -2 | Entzug: −2 auf Fertigkeiten und −1 Initiative. Diese Entzugsabzüge entfallen ausschließlich während „Betrunken“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Alkoholiker (III. Stadium) | Erhalten | -3 → -3 | Entzug: −3 auf Fertigkeiten und −2 Initiative; −1 auf KON-Rettungswürfe. Diese Entzugsabzüge entfallen ausschließlich während „Betrunken“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Kriss-süchtig (I. Stadium) | Erhalten | -1 → -1 | Entzug: −1 auf Fertigkeiten. Diese Entzugsabzüge entfallen ausschließlich während „Kriss-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Kriss-süchtig (II. Stadium) | Erhalten | -2 → -2 | Entzug: −2 auf Fertigkeiten und −1 Initiative. Diese Entzugsabzüge entfallen ausschließlich während „Kriss-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Kriss-süchtig (III. Stadium) | Erhalten | -3 → -3 | Entzug: −3 auf Fertigkeiten und −2 Initiative; −1 auf KON-Rettungswürfe. Diese Entzugsabzüge entfallen ausschließlich während „Kriss-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Smaragdflux-süchtig (I. Stadium) | Erhalten | -1 → -1 | Entzug: −1 auf Fertigkeiten. Diese Entzugsabzüge entfallen ausschließlich während „Smaragdflux-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Smaragdflux-süchtig (II. Stadium) | Erhalten | -2 → -2 | Entzug: −2 auf Fertigkeiten und −1 Initiative. Diese Entzugsabzüge entfallen ausschließlich während „Smaragdflux-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Smaragdflux-süchtig (III. Stadium) | Erhalten | -3 → -3 | Entzug: −3 auf Fertigkeiten und −2 Initiative; −1 auf KON-Rettungswürfe. Diese Entzugsabzüge entfallen ausschließlich während „Smaragdflux-Rausch“. Die Abhängigkeit bleibt bestehen. | Stoffbezogener abgestufter Entzug; nur passender aktiver Rausch unterdrückt die Abzüge. |
| Substanztoleranz (Alkohol) | Erhalten | 1 → 1 | Die nötige Rauschmenge verdoppelt sich. Nachwirkungen, Organschäden und Krankheitsrisiken werden dadurch nicht halbiert. | Enger stoffgebundener Schwelleneffekt, ohne Schutz vor Schaden oder Risiken. |
| Substanztoleranz (Kriss) | Erhalten | 1 → 1 | Die nötige Rauschmenge verdoppelt sich. Nachwirkungen, Organschäden und Krankheitsrisiken werden dadurch nicht halbiert. | Enger stoffgebundener Schwelleneffekt, ohne Schutz vor Schaden oder Risiken. |
| Substanztoleranz (Smaragdflux) | Erhalten | 1 → 1 | Die nötige Rauschmenge verdoppelt sich. Nachwirkungen, Organschäden und Krankheitsrisiken werden dadurch nicht halbiert. | Enger stoffgebundener Schwelleneffekt, ohne Schutz vor Schaden oder Risiken. |
