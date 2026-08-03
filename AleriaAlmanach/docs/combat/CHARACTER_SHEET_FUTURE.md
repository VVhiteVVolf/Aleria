# Zukunftskonzept: Aleria-Kampfbogen und Regelsystem

Stand: 3. August 2026

## Zielbild

Der Kampfbogen soll langfristig nicht nur eine Sammlung von Textfeldern sein, sondern die verlässliche mechanische Wahrheit einer Figur. Würfel- und Kampfaktionen lesen daraus reproduzierbare Zahlen. AleriaGPT erhält dieselben Daten für Interpretation und Erzählung, darf die Mechanik aber weder erfinden noch nachträglich verändern.

Das System bleibt abschnittsbasiert: Spieler schreiben eine Kampfbeschreibung, das System berechnet die Kampfauswertung, AleriaGPT formuliert die bestätigte Folge. Es gibt weiterhin keinen globalen Kampfmodus, keine Initiativeverwaltung und keine erzwungene Zugreihenfolge.

## Bereits gelegte Grundlage

- Versioniertes `combatProfile`-Schema 4 mit Migration der bisherigen Kampfdaten.
- Normale Stufen 1–20 und bis zu zehn zusätzliche Sonderstufen, Gesamtstufe maximal 30.
- D&amp;D-inspirierter Kompetenzbonus von +2 bis +9, manuell überschreibbar.
- Sechs frei benennbare Attribute mit abgeleitetem oder manuell überschriebenem Modifikator.
- Trefferpunkte aus Trefferwürfel, Konstitution und Gesamtstufe; ein manuelles Maximum bleibt möglich.
- Rüstungsklasse aus Basiswert, Geschick, angelegter Rüstung, Schilden, Magie und strukturierten Effekten; manueller Endwert möglich.
- Rettungswürfe, frei ergänzbare Fertigkeiten, Ressourcen, Waffen, Rüstungen, Marotten, Zustände, Fähigkeiten, Magie, Mana-Verknüpfung und Notizen.
- Waffen und Rüstungen können aus dem Inventar kopiert und danach unabhängig bearbeitet werden.
- Deterministische Kampfberechnung verwendet aktive Zustände, Marotten und Fähigkeiten.
- Szenenwürfel und Kampfauswertung erhalten einen vollständigen, priorisierten KI-Snapshot des Kampfbogens.
- Geführter Stufenaufstieg nur für Spielerfiguren: Vorschau, normale Stufen 1–20, Sonderstufen 21–30, TP-Regel, Attributs- und Ressourcensteigerungen sowie optionale neue Fertigkeit, Fähigkeit oder Zauber.
- Der Stufenaufstieg verändert zunächst nur den lokalen Bogenentwurf und wird erst mit „Figur speichern“ dauerhaft in Firebase geschrieben.
- Passive Wahrnehmung verwendet den vollständigen Wahrnehmungs-Fertigkeitswert statt nur Weisheit.
- Der allgemeine AleriaGPT-Indexer bewahrt auch `0`, `false` und erzählerische Hintergrundfelder; der verbindliche Kampf-Snapshot enthält sämtliche Kampfbogen-Kategorien und warnt vor doppelter Addition.
- Aktion, Bonusaktion und Reaktion sind kommentargebundene Ressourcen. Besondere Aktion besitzt zwei Einsätze pro Tag. Mana/Fokus, Aura-Fokus sowie Celestiale und Infernale Punkte bleiben dauerhaft gespeichert und erholen sich am nächsten Aleria-Tag.
- `Schicksalspunkte` werden verlustarm zu `Celestiale Punkte` migriert. `Flirten (Charisma)` und `Körperbeherrschung (Konstitution)` gehören zur Charakter-Fertigkeitenliste.
- Waffen tragen eine strukturierte Waffenart. Der einfache waffenlose Nahkampf ist als nicht entfernbarer Rückfall vorhanden.
- Techniken und Formen besitzen Waffenkompatibilität, Aktivierungsart, Kosten, Reichweite, Schaden und strukturierte Wirkungen.
- Aura, Präsenz und Domäne trennen aktive Form und latente Präsenz einschließlich strukturierter Eigen-, Verbündeten- und Gegnerwirkungen.
- Marotten, besondere Fähigkeiten und Techniken besitzen gemeinsame Detaildialoge mit Auslösern, Zielen, Dauer, Grenzen, Kosten und ausdrücklichen AleriaGPT-Hinweisen.

## Umgesetzter Stufenaufstieg

Das Level-up-Menü ist bewusst kein eigener Regelautomat und nicht für Kreaturen verfügbar. Es orchestriert ausschließlich vorhandene, versionierte Kampfbogenwerte:

1. Es ermittelt genau die nächste Gesamtstufe; nach normaler Stufe 20 folgen bis zu zehn Sonderstufen.
2. Es erstellt eine Vorschau auf Kompetenzbonus, maximale und aktuelle TP sowie alle gewählten Steigerungen.
3. Automatische TP bleiben formelbasiert. Bei einem manuell überschriebenen Maximum wird der empfohlene Zuwachs addiert; alternativ kann der Nutzer einen eigenen Zuwachs oder ein unverändertes Maximum wählen.
4. Eine Konstitutionssteigerung wird vor der TP-Vorschau angewendet. Dadurch ist auch die rückwirkende Änderung der formelbasierten Maximal-TP sichtbar.
5. Ressourcen können in aktuellem Stand und Maximum getrennt angepasst werden.
6. Optional lassen sich eine Fertigkeit, eine besondere Fähigkeit und ein Zauber anlegen. Ihre Feineinstellungen bleiben anschließend vollständig im normalen Bogen editierbar.
7. Erst die bestehende Speicheraktion des Charakterprofils persistiert den neuen Entwurf online.

Der reine Regelteil liegt getrennt von der UI und mutiert das Ausgangsprofil nicht. Dadurch können künftige EP-Ereignisse oder Registry-Stufenpakete denselben Vorschauweg nutzen, ohne den Charakterbogen zu duplizieren.

## Verbindliche Verantwortlichkeiten

### Regelkern

Der Regelkern berechnet Zahlen und entscheidet mechanische Fakten. Dazu gehören:

- Attributsmodifikatoren
- Kompetenzbonus
- maximale Trefferpunkte
- Rüstungsklasse
- Rettungswurf- und Fertigkeitswerte
- Waffenangriff und Waffenschaden
- Zauberangriff und Zauber-SG
- Vorteil und Nachteil
- aktive strukturierte Modifikatoren aus Marotten, Zuständen und Fähigkeiten

Der Regelkern muss deterministisch, ohne Netzwerk und ohne KI laufen. Dieselben Eingaben müssen immer dieselben abgeleiteten Werte erzeugen.

### AleriaGPT

AleriaGPT interpretiert Bedeutung und formuliert Erzähltext. Es erhält immer:

- Identität, Stufe, Sonderstufe und Erfahrung
- alle Attribute samt effektiven Modifikatoren
- aktuelle, temporäre und maximale TP
- Rüstungsklasse und ihre Regelgrundlage
- Rettungswürfe und Fertigkeiten samt Gesamtwerten
- alle Waffen und Rüstungen, einschließlich aktivem Zustand
- Kernressourcen einschließlich Mana/Fokus
- Marotten, Eigenschaften, Ideale, Bindungen, Fehler und Sonderregeln
- aktive und inaktive Zustände mit Dauer, Quelle und strukturierter Wirkung
- besondere Fähigkeiten, Nutzungen und Erholung
- Magieregeln, Zauberangriff, Zauber-SG und alle Zauber
- freie Notizen und Sonderabsprachen
- die bereits bestätigten Würfel- und Kampffakten

Zusätzlich erhält die KI die gewählte Technik oder den gewählten Zauber, aktive Waffenkompatibilität, Zahlungsweg, Kosten-Snapshot, Aura-Bypass und die Ressourcenstände vor und nach jedem mechanischen Abschnitt. Ein Freitext darf niemals eine fehlende Zahlung ersetzen.

## Kommentargebundene Aktionsökonomie

Ein vollständiger Kommentar ist die Abrechnungsgrenze. Rede, Handlung, Gedanken und andere rein erzählerische Abschnitte bleiben unbegrenzt. Kampfbeschreibung, Zauberformel, Gebet und Gesang sind mechanische Abschnitte und müssen vor dem Würfeln bezahlt werden.

- Standardmäßig kostet ein Angriff seine im Bogen hinterlegte Aktion sowie mögliche Zusatzkosten.
- Eine Technik darf stattdessen Bonusaktion, Reaktion oder Besondere Aktion verlangen und mehrere Kosten kombinieren.
- Aura-Fokus ersetzt bei ausdrücklich freigegebenen Einträgen die gesamten Standardkosten; er wird nicht zusätzlich berechnet.
- Der Cheatmodus erlässt Kosten und erzwingt Erfolg. Automatischer kritischer Erfolg bleibt eine getrennte Option.
- Mehrere mechanische Abschnitte desselben Akteurs werden in Reihenfolge auf demselben Ressourcenstand berechnet.
- Beim nächsten vollständigen Kommentar werden Aktion, Bonusaktion und Reaktion aufgefüllt. Tagesressourcen werden anhand des Aleria-Szenentages erst bei einem echten Tageswechsel erneuert.
- Dauerhafte Änderungen und Ziel-TP werden gemeinsam mit dem Kommentar atomar in Firebase geschrieben; die historischen Abschnittssnapshots bleiben unverändert.

## Geplanter Zauberersteller und Zauberliste

Das heutige Schema bereitet den späteren Zauberkatalog vor, ohne ihn vorwegzunehmen. Ein Zauber besitzt bereits stabile ID, Aktivierungsart, Angriffs- oder Rettungswurfmodus, Attribut, Reichweite, Dauer, Schaden, Mana-/Slotkosten, Aura-Bypass und AleriaGPT-Regelhinweise.

Die spätere Registry soll Definition und Besitz trennen:

1. Die Registry enthält die versionierte Zauberdefinition.
2. Der Charakterbogen speichert Registry-ID, verwendete Version und eine lokale Regelkopie.
3. Vorbereitung, individuelle Kosten, aktuelle Slots und persönliche Notizen bleiben Instanzdaten in Firebase.
4. Ein Registry-Update überschreibt keine laufende Figur und keine alte Kampfauswertung.
5. Der Zauberersteller validiert Formeln und Kosten mit demselben Regelkern wie die interaktive Szene.

Die KI darf strukturierte Modifikatoren nicht ein zweites Mal addieren. Sie darf aus Freitext keine neue Zahlenwirkung erfinden. Bei einem Widerspruch hat die strukturierte Mechanik Vorrang; der Konflikt soll später im Diagnosebereich des Bogens sichtbar werden.

## Erfahrung und Siege

Erfahrung darf nicht als beliebige Überschreibung ohne Herkunft gespeichert werden. Geplant ist ein append-only EP-Ereignisprotokoll:

```json
{
  "id": "xp-event-id",
  "characterId": "character-id",
  "amount": 450,
  "reason": "Sieg über den Aschenwurm",
  "sceneId": "scene-or-thread-id",
  "combatResolutionIds": ["resolution-id"],
  "awardedBy": "narrator-or-user-id",
  "awardedAt": "server-timestamp",
  "revertsEventId": null
}
```

Die Erzähleroberfläche benötigt dafür die Aktion „EP vergeben“:

1. Eine oder mehrere Figuren auswählen.
2. EP-Betrag und kurze Begründung angeben.
3. Optional die zugehörigen Kampfauswertungen auswählen.
4. Vorschau zeigt alten Stand, Änderung, neuen Stand und mögliche Stufenüberschreitung.
5. Eine serverseitige Transaktion schreibt Ereignis und neuen EP-Stand atomar.
6. Eine Korrektur löscht kein Ereignis, sondern erzeugt ein Gegenereignis.

Eine Stufe steigt nicht ungefragt. Das bereits vorhandene Level-up-Menü kann bewusst geöffnet werden und nimmt TP-, Attributs-, Ressourcen- oder Fähigkeitsänderungen erst nach einer vollständigen Vorschau in den Entwurf auf. Künftig soll eine erreichte EP-Schwelle dieses Menü nur vorschlagen, niemals automatisch anwenden.

## Zustände und Effekte

Zustände sollen künftig auf Registry-Definitionen basieren, aber pro Figur als Instanz gespeichert werden. Eine Instanz braucht mindestens:

- `definitionId` und `definitionVersion`
- Anzeigename und optionale individuelle Beschreibung
- aktiv/inaktiv
- Quelle und verantwortliche Figur
- Beginn, Dauer und Ablaufregel
- Stapelregel
- strukturierte Modifikatoren
- freie erzählerische Hinweise

Die Auswertung eines Zustands folgt dieser Reihenfolge:

1. Gültigkeit und Dauer prüfen.
2. Stapelregel anwenden.
3. Vorteil/Nachteil zusammenführen; beide heben sich auf.
4. numerische Modifikatoren genau einmal addieren.
5. berechneten Snapshot an Würfelservice und AleriaGPT geben.
6. abgelaufene Zustände nur nach bestätigtem Szenenereignis deaktivieren, nie heimlich durch die KI.

## Geplante Registry

Eine Registry ist sinnvoll für wiederverwendbare Definitionen, nicht für den ständig veränderlichen Zustand einzelner Spielerfiguren. Geeignete Registry-Inhalte sind:

- Waffen- und Rüstungstypen
- Fertigkeitsvorlagen
- Zustandsdefinitionen
- Zauber und besondere Fähigkeiten
- Stufen- und EP-Tabellen
- Schadensarten und Resistenzregeln
- Ressourcen- und Erholungsarten
- Archetypen, Klassenpakete und Sonderstufen

Jeder Eintrag bekommt eine unveränderliche ID, eine Schema- und Inhaltsversion, lokalisierte Namen, strukturierte Mechanik, beschreibenden Text und Migrationshinweise. Charaktere speichern die Registry-ID plus eine lokale Kopie der tatsächlich verwendeten Werte. Dadurch bleiben alte Kampfauswertungen reproduzierbar, selbst wenn eine Definition später geändert wird.

## Firebase oder GitHub?

Empfohlen wird eine hybride Architektur:

| Datenart | Autoritative Ablage | Grund |
| --- | --- | --- |
| Waffen-, Rüstungs-, Zauber- und Zustandsdefinitionen | versionierte Registry in GitHub | reviewbar, versionierbar, konfliktarm, gut auslieferbar |
| Karten- und Stammbaum-Grunddaten | bestehender GitHub/Registry-Weg | passt zum bereits etablierten Veröffentlichungsmodell |
| aktuelle TP, Mana, Zustandsinstanzen, EP und Ausrüstung einer Figur | Firebase | häufige atomare Änderungen, Echtzeit, geringe Latenz |
| EP-Ereignisprotokoll und Moderationsaktionen | Firebase mit Server-Zeitstempel | Transaktionen, Rechteprüfung und Audit-Trail |
| veröffentlichte Kampfbogen-Snapshots | optional GitHub-Export | Archiv, Wiederherstellung und Nachvollziehbarkeit |

Das direkte Speichern veränderlicher Spielerzustände in GitHub wird nicht empfohlen: Commits sind zu langsam für Spielszenen, parallele Änderungen erzeugen Konflikte, Schreibrechte sind schwerer fein zu steuern und ein sicherer atomarer EP-/TP-Stand ist unnötig kompliziert.

## Registry-Ladeweg

```text
GitHub Registry
      ↓ Build/Validierung
versioniertes Registry-Paket
      ↓ Laden + Cache
lokaler Regelkern ─────→ Charakterinstanz in Firebase
      ↓                         ↓
berechneter Snapshot ───→ Würfel / Kampfauswertung / AleriaGPT
```

Der Client soll mit der zuletzt gültigen Registry weiterarbeiten können, wenn GitHub vorübergehend nicht erreichbar ist. Ungültige oder unbekannte Definitionen dürfen einen Charakterbogen nicht unlesbar machen; die lokale Kopie bleibt als Fallback erhalten.

## Vorgesehene Entwicklungsphasen

### Phase 1 – Stabilisierung des neuen Bogens

- Bedienbarkeit auf Desktop und Mobilgeräten fortlaufend prüfen.
- Diagnoseansicht für widersprüchliche oder unvollständige Angaben.
- Import/Export für Charakter- und Kreaturenprofile ist vorhanden; bei Schemaänderungen Migrationsdiagnose ergänzen.
- weitere Tests für Migration und Grenzwerte.

### Phase 2 – EP und kontrollierte Zustandsänderungen

- Erzähleraktion „EP vergeben“.
- serverseitiges EP-Ereignisprotokoll mit Gegenbuchungen.
- bewusste Aktionen für Schaden, Heilung, Mana und Ressourcen.
- kommentargebundene Zustandsvergabe mit Ablaufregeln.
- sichtbare Vorschau vor jeder dauerhaften Zustandsänderung.

### Phase 3 – Registry

- eigenständiges Registry-Schema und Validator.
- GitHub-basierter Veröffentlichungsprozess mit Review.
- Cache und Offline-Fallback.
- Auswahlkataloge im Bogen, ohne freie Eingabe abzuschaffen.
- Versionsbindung und Migration bestehender Charakterinstanzen.

### Phase 4 – Erweiterte Regelmodule

- Resistenzen, Immunitäten und Verwundbarkeiten.
- Heilung, Regeneration, Todesrettungswürfe als optionale Module.
- Ruhe- und Erholungsaktionen.
- Zauberplätze oder alternative Magiesysteme als austauschbare Ressourcenmodelle.
- Regelpakete pro Kampagne, ohne den Kernbogen zu verzweigen.

## Qualitäts- und Sicherheitsregeln

- Keine KI-Antwort darf direkt TP, EP, Mana, Inventar oder Zustände verändern.
- Jede dauerhafte Änderung braucht eine explizite Nutzeraktion und eine Vorschau.
- Kritische Schreibvorgänge erfolgen serverseitig atomar.
- Alte Kommentare behalten ihren vollständigen Regel- und Profil-Snapshot.
- Registry-Updates verändern keine bereits gespeicherte Kampfauswertung.
- Freitext wird für Erzählung berücksichtigt, aber niemals still in Zahlen umgewandelt.
- Alle Schemas erhalten Version, Migration, Validierung und Grenzwerte.
- Löschen von EP- oder Zustandsereignissen wird durch nachvollziehbare Gegenereignisse ersetzt.

## Abnahmekriterien für das Zielsystem

Das Ziel ist erreicht, wenn für einen beliebigen Wurf nachvollziehbar beantwortet werden kann:

1. Welche Profilwerte wurden gelesen?
2. Welche Registry-Versionen galten?
3. Welche aktiven Effekte wurden angewendet?
4. Wie entstand jeder numerische Modifikator?
5. Welcher Würfelwurf bestätigte das Ergebnis?
6. Welche Informationen erhielt AleriaGPT?
7. Welche dauerhaften Änderungen wurden danach bewusst bestätigt?

Erst diese Kette macht das System gleichzeitig immersiv, fair, erweiterbar und langfristig wartbar.
