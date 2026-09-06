# Vorteil, Nachteil und Zustände im Kommentarentwurf

## Verhalten

- Freie Wurfart-Auswahl bei Angriffen und Fertigkeitsproben entfällt. Die gemeinsame Auswertungslogik ignoriert auch alte oder manipulierte Vorgaben aus Entwürfen.
- Aktive Zustände, Eigenheiten, Fähigkeiten, Auren, anwendbare Reaktionsregeln und regelgebundene Techniken bestimmen den Wurf. Vorteil und Nachteil neutralisieren sich unabhängig von der Anzahl der beteiligten Quellen.
- Die Zustandsverwaltung bietet die Vorlagen **Vorteil** und **Nachteil**. Ihr Wirkungsbereich ist getrennt für Angriffe und Fertigkeitsproben einstellbar. Beide wirken standardmäßig auf diese zwei Bereiche; Rettungswürfe behalten ihre eigenen Attributregeln.
- Reine Beschreibungstexte lösen keine Würfelmechanik aus. Bestehende numerische Boni und die bisherigen zwölf Zustandssymbole bleiben erhalten.
- Am Ende des Kommentarformulars steht eine standardmäßig geschlossene Übersicht **Zustände & Buffs** für alle beteiligten Figuren. Sie zeigt temporäre und dauerhafte Zustände, Quelle, Restdauer, Abwehrladungen, Konzentration und Kanalisierung. Effekte lassen sich aus dieser Übersicht vergeben und entfernen; im Bearbeitungsformular ist sie lesend.
- Eigene Beiträge und Szenenbeiträge behalten ihre unterschiedlichen Uhren. Ein eigener Post zählt genau einmal, auch mit mehreren Abschnitten. Der letzte verbleibende Beitrag profitiert noch vom Effekt; danach ist er abgelaufen. Verwaltungsereignisse zählen nicht als Beitrag.

## Zuständigkeiten

- `combat-roll-mode.js`: gemeinsame Zusammenführung der Wurfquellen.
- `getCombatRollContext` und `getSkillRollContext`: dieselbe Vorbereitung für Vorschau und Auswertung; keine Würfel, Ressourcenbuchungen oder Schreibzugriffe in der Vorschau.
- `combat-status-model.js`: validierte manuelle Wurfboni und gemeinsame Gruppierung der Zustände.
- `comments-condition-tracker.js`: ausschließlich lokale Darstellung, Auf-/Zuklappen und delegierte Bedienung. Bestehender Status-Controller und Firebase-Endpunkt übernehmen Änderungen.
- Die Übersicht löst Figurenprofile erst beim Öffnen auf. Aktualisierungen laufen gebündelt über bestehende Ereignisse; Textentwürfe und der Öffnungszustand bleiben erhalten.
- Regelversionen: `combat-evaluation-6` und `skill-evaluation-3`. Historische Auswertungen bleiben lesbar.

## Prüfung

- 544 Frontendtests, darunter neun neue Tests für freie Vorgaben, aktive Effekte, Wirkungsbereiche, Ausgleich mehrerer Quellen, letzte Beitragsdauer und sichere Anzeige.
- 90 Firebase-Unit-Tests.
- 51 lokale Integrationsprüfungen einschließlich Zustandsvergabe vor Kampfstart, zwei autoritativ gespeicherten Vorteilswürfen und Ablauf, Neutralisierung sowie atomarer Ablehnung eines eingeschleusten zweiten W20. Beim ersten Lauf wich nur die Groß-/Kleinschreibung einer erwarteten Fehlermeldung ab; die betroffene Testsuite wurde korrigiert und vollständig erneut bestanden.
- Browserprüfung mit realen Gawain-/Gildas-Bögen und lokalem Firestore: geschlossener Start, zwei Figuren, keine freie Wurfart-Auswahl, Vergabe über Dialog, automatische Aktualisierung, unveränderter Textentwurf, Restdauer und Ablauf sowie 390-Pixel-Mobilansicht.
- Gawains bestehender Nachteil auf bestimmte soziale Proben bleibt erhalten und wird durch einen passenden Vorteil neutralisiert.
