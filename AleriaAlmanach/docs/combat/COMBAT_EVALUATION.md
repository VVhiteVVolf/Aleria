# Kampf-, Magie- und Fertigkeitsauswertung

Stand: 3. August 2026

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
9. Nach-Treffer- und Vor-Schaden-Regeln anwenden, Schaden würfeln, Halbierung und Schadensreduktion verrechnen.
10. Temporäre TP vor normalen TP verbrauchen und alle Kosten beziehungsweise Nutzungen atomar buchen.
11. Einen unveränderlichen Regelbeleg mit Vorher-/Nachherständen speichern.
12. Erst anschließend AleriaGPT mit genau diesem bestätigten Beleg erzählen lassen.

Fertigkeitsauswertungen verwenden dieselbe Trennung: Profilfertigkeit und Attribut, optionaler Nutzerwert, Herausforderung, Prä-Wurf-Regeln, validierter W20, Nach-Wurf-Regeln und endgültiges Ergebnis. Verdeckte Herausforderungen bleiben höchstens für die drei jüngsten Beiträge der Zielperson auflösbar.

## Strukturierte Auslöserregeln

`character.combatProfile` verwendet Schema 5. Marotten, Zustände, besondere Fähigkeiten und Techniken können `triggerRules` besitzen. Eine Regel beschreibt:

- Phase: vor dem Wurf, nach dem Wurf, nach dem Treffer oder vor dem Schaden;
- Empfänger: handelnde Figur oder Ziel;
- Beziehung der Regelquelle: selbst, verbündet, feindlich oder beliebig;
- Aktivierung: passiv oder bewusst ausgewählte Reaktion;
- Häufigkeit: immer, einmal pro Gesamtkommentar, Szene oder Aleria-Tag;
- Bedingung: immer, würde treffen, würde verfehlen, kritischer Erfolg oder kritischer Fehlschlag;
- Aktionsarten: Waffe, Technik, Fähigkeit, Zauber, Gebet, Gesang oder Fertigkeit;
- optionalen Radius und eine eindeutige Priorität;
- numerische Wirkung, Vorteil/Nachteil, Schadensreduktion oder ein erzwungenes Ergebnis.

Bei mehreren Regeln werden Zahlen addiert. Vorteil und Nachteil heben sich auf. Bei widersprüchlichen erzwungenen Ergebnissen gewinnt die Regel mit der höheren Priorität; stabile IDs halten Gleichstände reproduzierbar. Jede tatsächlich angewendete Regel wird mit Quelle, Phase, Wirkung sowie Zustand davor und danach im Kommentar gespeichert.

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
- Korrekturen an festgeschriebener Mechanik benötigen künftig Gegenbuchungen; mechanische Kommentare bleiben unveränderlich.

Diese Grenzen sind Absicht: Ungeprüfter Freitext oder nachträgliche KI-Deutung darf keine autoritative Kampfregel sein.
