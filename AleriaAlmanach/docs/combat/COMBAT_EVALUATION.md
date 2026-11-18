# Kampf-, Magie- und Fertigkeitsauswertung

Stand 18. November 2026

## Auswahl und Buchung in der Szene

Der Beitragsentwurf speichert Ziel, Griff, Zahlungsweg und ausgewählte Unterstützungen. Der Zielabstand gilt zwischen handelnder Figur und Ziel. Eine weitere Figur kann für jede ihrer Unterstützungen die Entfernung zum jeweiligen Empfänger angeben. Ein leeres Feld lässt den Abstand offen. Ein numerischer Radius wirkt bis einschließlich seiner Grenze und erfordert einen bekannten Abstand.

Eine beim Kampfstart übernommene Szenenpräsenz ist bereits im Figurenwert enthalten. Hat dieselbe Quelle zusätzlich eine Aura mit Radius, wird deren Wirkung bei passender Entfernung ergänzend berechnet. Eine ausgewählte Schadensaura wirkt auf die einzelnen Treffer einer Angriffsfolge.

Begrenzte Hauptfähigkeiten und ausgelöste Reaktionen verbrauchen ihren Vorrat in der Reihenfolge des Beitrags. Die gemeinsame Auswertung liefert die Zwischenstände für den nächsten Abschnitt und die Rücknahme. Die aktuellen Belege tragen im Kampf `combat-evaluation-16` und bei Proben `skill-evaluation-10`.

## Entwaffnen, Zusatzrettungen und Reitsitz

Eine erfolgreiche Entwaffnung legt eine tatsächlich geführte Waffe in die Szene. Die rechte Hand kommt zuerst, anschließend die linke. Ein weiterer Erfolg kann die zweite Waffe lösen. Ein als einzelner Gegenstand geführtes Waffenpaar fällt zusammen. Bei einer eigenen kritischen Fehlbewegung ist die verwendete Waffe maßgeblich. Reserven, Schilde und natürliche Angriffe bleiben an ihrem Platz. Findet die Technik keine ablegbare Waffe, erhält das Ziel „Griff gestört“ mit −1 auf Angriffe im nächsten eigenen Beitrag. Aufheben verwendet die vorhandene Gegenstandsinteraktion.

Eine Technik kann einen Treffer landen und trotzdem mit ihrer Zusatzwirkung scheitern. Die Rettung gegen Entwaffnen, Niederwerfen oder eine blutende Wunde berücksichtigt die passenden strukturierten Passiva vor dem Wurf und nach seinem vorläufigen Ergebnis. Ein ausdrücklich erzwungener Erfolg kann einen rechnerischen Fehlschlag abwenden. Kosten und Nutzungsgrenzen gelten über den gesamten Beitrag. Für „Blutend“ bestimmen die auslösende Fähigkeit oder der kritische Effekt Dauer und Folgeschaden.

Bei jedem gegnerischen Treffer mit tatsächlichem Verlust an temporären oder regulären TP wird der **passive Reitsitz** geprüft. Der Reitsitz beträgt **10 + Mit Tieren umgehen**. Der SG beträgt **mindestens 10**, darüber gilt **die Hälfte des erlittenen Schadens, abgerundet**. Bei Gleichstand bleibt der Reiter im Sattel. Mehrere Schadensarten desselben Treffers ergeben zusammen eine Prüfung. Jeder eigenständige Folgetreffer erhält eine neue Prüfung, solange die Figur noch reitet. Vollständig abgefangene Treffer und periodischer Zustandsschaden lösen keine Sitzprüfung aus.

Wird der Reiter abgeworfen, würfelt er für die Landung gegen denselben SG. Zum W20 kommt der bessere Wert aus **GES-Rettung** und **Akrobatik**. Passende situative Schutzwirkungen gegen erzwungene Bewegung oder Niederwerfen gelten auch hier. Bei Erfolg landet der Reiter auf den Füßen, bei Fehlschlag erhält er **Liegend** und verliert die Bonusaktion seines nächsten eigenen Beitrags. Eine bereits handlungsunfähige Figur stürzt direkt. Hat der Treffer mit einer eigenen Wirkung bereits erfolgreich niedergeworfen, bleibt diese Wirkung maßgeblich.

Der Kampfbeleg zeigt Schaden, SG, Reitsitz und gegebenenfalls den Landungswurf. Der Sturz ändert die Ausrüstung in der Szene. Das Tier bleibt im Inventar. Erneutes Aufsitzen kostet eine Bonusaktion. Die Szenenhistorie trägt diesen Zustand über das Neuladen und die Rücknahme eines Beitrags.

## Verbindliches Prinzip

Der Browser beschreibt die beabsichtigte Handlung und liefert die sichtbaren Einzelwürfel. Die endgültige Auswertung entsteht serverseitig aus den aktuell gespeicherten Profilen, der vertrauenswürdigen Szenenhistorie und den ausgewählten strukturierten Regeln. AleriaGPT formuliert erst danach die bestätigte Folge und darf Treffer, Rettung, Schaden, TP oder Ressourcen nicht verändern.

Freitext ist Erzählkontext, keine ausführbare Regel. Eine Notiz wie „weicht dem ersten Treffer immer aus“ wird erst dann mechanisch wirksam, wenn dieselbe Wirkung als strukturierte Auslöserregel hinterlegt ist. So bleiben Berechnung, Rechteprüfung und Wiederholung reproduzierbar.

## Auswertungsreihenfolge

Jeder Angriff, Zauber und jedes Gebet folgt derselben Pipeline:

1. Akteur, Ziel, Profilquelle, ausgewählte Aktion und Kontrollrechte prüfen.
2. Aktuelle TP, temporäre TP, Ressourcen, Nutzungen und Tagesstand aus dem Serverzustand laden.
3. Basiswerte ableiten: Angriffsmodifikator oder Rettungswurf, Rüstungsklasse oder Zauber-SG, Vorteil und Nachteil.
4. Eigene statische Mechanik aus aktiven Marotten, Zuständen, Fähigkeiten, Aura und Domäne genau einmal einrechnen.
5. Gültige Prä-Wurf-Regeln nach Aktionsart, Beziehung, Empfänger, Radius, Häufigkeit und Ressourcen prüfen.
6. Einzelwürfel validieren und die Summe serverseitig neu berechnen.
7. Nach-Wurf-Regeln auswerten, etwa „wenn der Angriff treffen würde“, Reaktionsboni, Gegenwehr oder erzwungenes Verfehlen.
8. Treffer beziehungsweise Rettung endgültig feststellen.
9. Nach-Treffer- und Vor-Schaden-Regeln anwenden, strukturierte Effekte ausführen sowie Resistenz, Verwundbarkeit, Immunität und Schadensreduktion verrechnen.
10. Späte Phasen wie `on-damaged`, `on-heal`, `on-condition-applied`, `on-resource-spent`, Konzentrationsprüfung und Niederlage auswerten; ihre Folgewirkungen werden genau einmal ausgeführt und nicht rekursiv erneut ausgelöst.
11. Temporäre TP vor normalen TP verbrauchen und alle Kosten, Reaktionen, Munition und Nutzungen atomar buchen.
12. Einen unveränderlichen Regelbeleg mit Vorher-/Nachherständen speichern.
13. Erst anschließend AleriaGPT mit genau diesem bestätigten Beleg erzählen lassen.

Fertigkeitsauswertungen verwenden dieselbe Trennung: Profilfertigkeit und Attribut, optionaler Nutzerwert, Herausforderung, Prä-Wurf-Regeln, validierter W20, Nach-Wurf-Regeln und endgültiges Ergebnis. Verdeckte Herausforderungen bleiben höchstens für die drei jüngsten Beiträge der Zielperson auflösbar.

## Strukturierte Auslöserregeln

`character.combatProfile` verwendet Schema 9. Marotten, Zustände, besondere Fähigkeiten und Techniken können `triggerRules` besitzen. Eine Regel beschreibt:

- Phase: vor/nach dem Wurf, nach dem Treffer, vor/nach Schaden sowie Heilung, Zustandsänderung, Ressourcenverbrauch, Niederlage, Konzentration und Kanalisierung;
- Empfänger: handelnde Figur oder Ziel;
- Beziehung der Regelquelle: selbst, verbündet, feindlich oder beliebig;
- Aktivierung: passiv oder bewusst ausgewählte Reaktion;
- Häufigkeit: immer, einmal pro Gesamtkommentar, Szene oder Aleria-Tag;
- Bedingung: immer, würde treffen, würde verfehlen, kritischer Erfolg oder kritischer Fehlschlag;
- Aktionsarten: Waffe, Technik, Fähigkeit, Zauber, Gebet, Gesang oder Fertigkeit;
- optionalen Radius und eine eindeutige Priorität;
- numerische Wirkung, Vorteil/Nachteil, Schadensreduktion oder ein erzwungenes Ergebnis.

Bei mehreren Regeln werden Zahlen addiert. Vorteil und Nachteil heben sich auf. Erzwungene Ergebnisse folgen der ausdrücklichen Rangfolge absolute Regel/Immunität, aktive Reaktion, zeitlicher Effekt/Fähigkeit, passive Eigenschaft/Aura, normaler Modifikator. Bleiben gleichrangige und gleich priorisierte Regeln widersprüchlich, entscheidet das System nicht unsichtbar: Der Konflikt erscheint in der Auswertung und verlangt eine menschliche Entscheidung.

## Strukturierte Effekte

Eine Handlung oder ausgelöste Regel kann mehrere Effekte in festgelegter Reihenfolge besitzen:

- Schaden, Heilung oder temporäre Trefferpunkte;
- Zustand geben oder entfernen, Stärkung und Schwächung;
- Ressource auffüllen oder ausgeben;
- Bewegung als verbindlicher Hinweis ohne taktische Positionssimulation;
- Beschwörung als strukturierter Szenenhinweis;
- Konzentration, Kanalisierung oder eine laufende Handlung unterbrechen.

Selbstheilung und unterstützende Magie verwenden dieselbe Engine wie Angriffe. Mehrzielhandlungen erzeugen je Ziel eine eigene kompakte Auswertung, bezahlen Aktionskosten und Munition aber nur einmal. Folgeangriffe durchlaufen erneut die vollständige Treffer-, Aura-, Reaktions- und Schadenspipeline; weitere Folgeangriffe werden dabei zur Schleifenvermeidung nicht rekursiv erzeugt.

## Kampfliste und Fortschritt

Der Kampf-Announcer verwaltet Beginn, Beitritt, Austritt und Ende ohne Initiative. Er speichert Parteien und konkrete Kreatureninstanzen. Die laufende Liste zeigt TP, Zustände, Konzentration und Kanalisierung. Bei 0 TP gilt eine Figur als kampfunfähig. Der Tod bleibt eine erzählerische Entscheidung. Eigenschaden und andere bestätigte TP-Änderungen aktualisieren die Kampfliste ebenso wie gegnerische Treffer. Heilung über 0 TP kann besiegte Figuren wieder aktivieren. Die ausdrücklich gesetzte Sonderregel für Handlungen bei 0 TP gilt auch im erklärten Kampf.

Beim Schwertdrachen setzt der Ehrenzweikampf genau einen aktiven Feind auf einer anderen Kampfseite voraus. Die Prüfung erfolgt vor jeder Handlung und gilt für alle Ziele dieser Handlung. Klingenbindung senkt die Verteidigung um einen Punkt bis zum ersten Treffer des Pfades im selben Beitrag. Ein Fehlschlag verbraucht die Wirkung nicht.

Fähigkeiten mit täglicher Erholung werden im aktuellen Szenenprofil für den bestätigten Szenentag angezeigt. Rastfähigkeiten folgen ihrer eigenen Rastregel. Gespeicherte Auswertungen behalten ihre Nutzungsstände.

Beim Kampfende werden reine Kampfzustände und Konzentrationen beendet. Besiegte oder geflohene Gegner liefern anhand ihrer Stufe EP, die gleichmäßig auf berechtigte Mitglieder der siegreichen Partei verteilt werden. Die D&D-5e-Schwellen bis Stufe 20 schalten die bestehende Level-up-Werkstatt frei; Attributs-, Trefferpunkt- und Klassenentscheidungen werden nicht still automatisch angewendet.

## Verbündete, Gegner und Reaktionen

Akteur und Ziel werden automatisch als Regelquellen geprüft. Weitere Figuren können als Unterstützer gewählt werden. Der Server ermittelt ihre Beziehung aus der Szene, prüft den eingetragenen Abstand gegen den Radius und akzeptiert nur Reaktionen, deren Profilquelle existiert und deren Nutzung autorisiert ist.

Eine Reaktion wie „Guinevere gibt Gawain beim ersten Angriff +2“ braucht deshalb eine strukturierte Regel mit:

- Empfänger `actor`;
- Beziehung `ally`;
- Phase `post-roll`;
- Häufigkeit `comment` oder `scene`;
- Aktionsart `weapon`;
- Effekt `attackModifier: 2`;
- Reaktionskosten oder begrenzte Fähigkeitsnutzung.

Die Kosten werden auf Guineveres eigenem Ressourcenstand verbucht, nicht auf Gawains. Ohne ausreichende Ressource bricht die gesamte Transaktion ab. Eine fremde Spielerfigur darf aktuell nur durch einen ihrer Controller oder durch Moderation als Reaktionsquelle ausgelöst werden; ein späteres Echtzeit-Zustimmungsfenster wäre ein eigenes Mehrspieler-Modul.

## Nachvollziehbarkeit

Der gespeicherte Regelbeleg enthält mindestens:

- verwendete Profil- und Aktions-IDs;
- W20-Einzelwerte, Modifikator, Gesamtwert und Zielwert;
- jede Regelquelle und ihre angewendete Wirkung;
- TP, temporäre TP, Ressourcen und Nutzungen vor und nach dem Abschnitt;
- Häufigkeitsschlüssel für Kommentar, Szene oder Tag;
- Kennzeichnung der serverseitigen Validierung;
- den nachträglich ergänzten, rein erzählerischen KI-Text.

Frühere Abschnitte behalten ihre historischen Snapshots. Der spätere Endstand einer besiegten Figur überschreibt daher nicht rückwirkend ihre anfänglichen vollen TP.

## Bewusste Grenzen

- Freie Notizen werden von AleriaGPT gelesen, verändern aber nie still Zahlen.
- Eine nicht strukturierte Marotte oder Reaktion ist erzählerisch, nicht mechanisch.
- Unterstützerreaktionen werden vor dem Eintragen ausgewählt; asynchrone Unterbrechungsfenster zwischen verschiedenen Spielern sind noch nicht Teil des Systems.
- Radiusprüfung verwendet derzeit den angegebenen Abstand und die Szenenbeziehung, keine taktische Karte.
- `on-combat-start` und `on-combat-end` sind als Regelphasen im Schema reserviert. Der Announcer erledigt bereits Sperren, Status, Kampfzustandsende und EP; frei konfigurierbare `resultEffects` dieser beiden Lebenszyklusphasen benötigen noch den geplanten Szenenprojektor.
- Korrekturen an festgeschriebener Mechanik benötigen künftig Gegenbuchungen; mechanische Kommentare bleiben unveränderlich.

Diese Grenzen sind Absicht: Ungeprüfter Freitext oder nachträgliche KI-Deutung darf keine autoritative Kampfregel sein.
