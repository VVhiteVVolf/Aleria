# Kreaturenregister – Architektur und Zukunftsplan

Stand: 2. August 2026
Status: Grundlage produktiv implementiert

## Zweck

Das Kreaturenregister ist die zentrale Quelle für Monster, Tiere, beschworene Wesen und vom Erzähler geführte NSCs. Es ist absichtlich kein Untertyp des Charakterarchivs: Charaktere besitzen Spielerzuordnung, Genealogie, umfangreiche Inventare und langfristige Entwicklung; Kreaturen benötigen dagegen schnell duplizierbare Vorlagen, kompakte Kampfwerte und kleine Beutepakete.

Beide Systeme teilen nur die geprüfte Kampfprofil-Schnittstelle. Dadurch können Würfel-, Kampf- und AleriaGPT-Systeme einheitlich auf Attribute, Trefferpunkte, Rüstungsklasse, Angriffe, Zustände und Fähigkeiten zugreifen, ohne die Speicher- und Bedienlogik zu vermischen.

## Heutiges Datenmodell

Firestore-Collection: `creatures`

Eine Kreatur enthält:

- Identität: Name, Typ, Gattung, Habitat, Größe, Bedrohungsgrad und Stufe 1–30
- Präsentation: Standardportrait, Bildunterschrift und bis zu zehn zusätzliche Avatare
- Vorlagenbezug: `templateId` und `instanceOrdinal`
- kompatibles Kampfprofil Schema v3
- Mini-Lootbox mit Währung, Fundregeln und einzelnen Gegenständen
- freie Spielleitungsnotizen
- Erstellungs- und Änderungszeitpunkt

Die Stufen 21–30 werden intern als Stufe 20 plus ein bis zehn Sonderstufen dargestellt. Damit bleibt die vorhandene Progressionslogik für normale Figuren unangetastet.

## Versionierbarer Grundkatalog

Kuratierte Grundvorlagen können bereits als kleiner, codebasierter Katalog ausgeliefert werden. Beim Laden werden sie anhand stabiler IDs mit den Firebase-Datensätzen zusammengeführt; eine online gespeicherte Fassung derselben ID hat Vorrang. Das ist der erste Schritt zum geplanten Registry-Modell, ohne beim Seitenaufruf automatische Schreibvorgänge in Firebase auszulösen.

Erste Katalogfamilie: **Schwarzer Zitteraal**

| Vorlage | Stufe | Rolle | Richtwerte |
| --- | ---: | --- | --- |
| Schwarzer Zitteraal Raubritter | 7 | gepanzerter Anführer und Frontkämpfer | 67 TP, RK 18, Hauptangriff +7 |
| Schwarzer Zitteraal Schütze | 3 | beweglicher Fernkämpfer | 21 TP, RK 14, Hauptangriff +5 |
| Schwarzer Zitteraal Plünderer | 3 | Flankierer und Beutedieb | 24 TP, RK 15, Hauptangriff +4 |

Alle drei besitzen Portrait, Attribute, Rettungswürfe, Fertigkeiten, Angriffe, Ausrüstung, Ressourcen, Fähigkeiten, Taktiknotizen und eine eigene Mini-Lootbox. Grundvorlagen bleiben katalogseitig erhalten; „Duplizieren“ erzeugt weiterhin eine normale, online gespeicherte und frei umbenennbare Szeneninstanz.

Die derzeitige Stufenorientierung ist bewusst eine Balancing-Hilfe und keine starre Automatik:

- Bauer: Stufe 1
- Waffenknecht oder Knappe: Stufe 3–4
- Jungritter: Stufe 5–6
- Ritter: Stufe 7–10
- Hauptmann: ungefähr Stufe 13
- heldenhafter Krieger, Haudegen oder erfahrener Anführer: Stufe 14+

## Vorlage und Szeneninstanz

Eine gespeicherte Ausgangskreatur ist eine Vorlage. „Duplizieren“ erzeugt einen neuen eigenständig gespeicherten Datensatz. Die Kopie verweist mit `templateId` auf ihren Ursprung und erhält automatisch eine fortlaufende römische Kennzeichnung, beispielsweise:

- Skelettkrieger I.
- Skelettkrieger II.
- Skelettkrieger III.

Jede Instanz kann danach frei umbenannt und abweichend bearbeitet werden. Änderungen an der Vorlage verändern existierende Instanzen derzeit ausdrücklich nicht. Das verhindert überraschende Änderungen während einer laufenden Szene.

## Einbindung in interaktive Szenen

Kreaturen werden über dieselbe Actor-Schnittstelle wie Charaktere bereitgestellt, tragen aber `entityType: "creature"`. Im Kommentar-Composer erscheinen sie bewusst in einem eigenen Reiter und nicht mehr vermischt mit spielbaren Charakteren. Ihr Standardportrait und die bis zu zehn Avatarvarianten werden über dieselbe Abschnitts- und Vorschaupipeline ausgewählt. Dadurch stehen sie zur Verfügung als:

- Sprecher einer normalen Sprechblase oder Kampfhandlung
- handelnde Figur eines Würfelwurfs
- Ziel einer Kampfauswertung
- Teilnehmer der Würfel- und Kampfauswahl

Kommentare speichern neben der weiterhin kompatiblen `characterId` zusätzlich `actorType` und `creatureId`. Ältere Kommentare bleiben dadurch lesbar; neue Systeme können Menschen und Kreaturen eindeutig unterscheiden.

## AleriaGPT-Vertrag

Für Kreaturen gelten dieselben harten Regeln wie für Charakter-Kampfdaten:

1. Gespeicherte Werte sind maßgeblich und dürfen nicht stillschweigend ersetzt werden.
2. Aktive Zustände, Fähigkeiten und mechanische Modifikatoren müssen vor der Erzählung ausgewertet werden.
3. Trefferpunkte, Rüstungsklasse, Attribute, Rettungswürfe und Angriffe werden aus dem gemeinsamen Kampfprofil aufgelöst.
4. Typ, Gattung, Habitat, Bedrohungsgrad, Notizen und Loot werden zusätzlich als Kreaturenkontext übergeben.
5. Eine Szeneninstanz wird anhand ihrer eigenen ID bewertet, nicht anhand eines gleichnamigen Vorlagenwerts.
6. Fehlende Angaben dürfen erzählerisch vorsichtig beschrieben, aber nicht als dauerhafte Regel erfunden werden.

Der allgemeine AleriaGPT-Index erhält Kreaturen als eigene Dokumentart `creature-profile`. Bei einem szenengebundenen Wurf wird das Profil zusätzlich als nicht verdrängbarer Pflichtkontext eingefügt.

## Import, Export und Backup

Unterstützte Formate:

- einzelne Kreatur: `aleria-creature`
- Kreaturenarchiv: `aleria-creature-archive`
- Almanach-Vollbackup ab Schema 3 mit Feld `creatures`

Der Import in einen geöffneten Bogen verändert zunächst nur das Formular. Erst „Online speichern“ schreibt dauerhaft. Ein Archivimport speichert Datensätze direkt und aktualisiert gleiche IDs. Vor größeren Übertragungen sollte immer ein Vollbackup erzeugt werden.

## Geplante Ausbaustufen

### 1. Begegnungen statt lose Einzelinstanzen

Eine Begegnung soll eine versionierte Liste konkreter Kreatureninstanzen speichern: Anzahl, Start-TP, Position, sichtbarer Zustand und Rollenbezeichnung. Das Kreaturenregister bleibt dabei die Quelle; die Begegnung hält einen Snapshot, damit spätere Vorlagenänderungen laufende Szenen nicht verändern.

### 2. Loot-Übergabe

Die Mini-Lootbox soll Gegenstände über die bestehende Item-Datenbank referenzieren können. Eine Erzähleraktion „Beute freigeben“ erzeugt ein sichtbares Beutepaket; Spieler übertragen ausgewählte Mengen kontrolliert in Charakterinventare. Jeder Transfer braucht ein nachvollziehbares Ereignisprotokoll.

### 3. Regelpakete und Registry

Wiederverwendbare Angriffe, Zustände, Fähigkeiten und Kreaturenfamilien sollen später in einer versionierten Registry liegen. Sinnvolle Trennung:

- Registry/GitHub: kuratierte öffentliche Vorlagen und Regeldefinitionen
- Firebase: private Änderungen, Szeneninstanzen, laufende TP und Spielzustand
- Exportdateien: Übertragung zwischen getrennten Almanach-Installationen

Ein Registry-Eintrag benötigt stabile ID, Schema-Version, Herkunft, Lizenz, Änderungsstand und Migrationspfad. GitHub darf nicht als Ersatz für schnell veränderlichen Laufzeit-State verwendet werden.

### 4. Vererbung mit kontrollierten Updates

Vorlagenänderungen könnten optional als Vergleich auf Instanzen angeboten werden. Niemals automatisch überschreiben. Der Dialog muss Feld für Feld zwischen „lokaler Instanz“, „bisheriger Vorlage“ und „neuer Vorlage“ unterscheiden.

### 5. Zustands- und TP-Ereignisse

Künftige Schnellaktionen wie Schaden, Heilung oder Zustand anwenden sollen unveränderliche Ereignisse erzeugen. Der aktuelle Wert wird daraus oder aus einem kompakten Snapshot abgeleitet. Das verbessert Rücknahme, Synchronisation und AleriaGPT-Nachvollziehbarkeit.

### 6. Berechtigungen

Vor einem Mehrbenutzerbetrieb braucht die Collection eigene Firestore-Regeln:

- Lesen passend zur Sichtbarkeit des Almanachs
- Schreiben nur für freigeschaltete Erzähler/Redakteure
- Feld- und Größenvalidierung serverseitig
- keine Rechteableitung allein aus versteckten UI-Schaltflächen

## Migrationsregeln

- Unbekannte zusätzliche Felder dürfen beim Laden nicht zu Laufzeitfehlern führen.
- Fehlende Listen werden als leere Listen normalisiert, nicht als Charakter-Standardfertigkeiten.
- Neue Schemata benötigen reine, getestete Migrationsfunktionen.
- Bestehende IDs, `templateId` und `instanceOrdinal` dürfen bei einer Migration nicht neu vergeben werden.
- Jede destruktive Migration benötigt Export/Backup und eine Vorschau der betroffenen Datensätze.

## Abnahmekriterien für weitere Ausbaustufen

Eine Erweiterung gilt erst als fertig, wenn:

- Speicherung und erneutes Laden dieselben mechanischen Werte liefern,
- AleriaGPT den neuen Wert als strukturierten Kontext erhält,
- Import/Export und Vollbackup ihn erhalten,
- Duplikate weiterhin unabhängig funktionieren,
- Desktop- und Mobilansicht bedienbar bleiben,
- Modelltests sowie ein echter Browserablauf erfolgreich sind.
