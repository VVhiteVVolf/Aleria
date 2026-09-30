# Waffen- und Aktionsschaden – 30. September 2026

Diese Überarbeitung setzt die nach dem allgemeinen Checkup freigegebenen Schadensregeln um. Sie gilt für kommende Auswertungen. Bereits gespeicherte Treffer, Würfel, Effekte und Beiträge werden nicht neu berechnet.

## Gemeinsame Grundlage

Die 816 Katalogoptionen von Drachentanz, Huskarl-Waffenlehre und Wyrmtanz verwenden dieselbe martialische Schadensökonomie in `modules/combat-styles/weapon-technique-budget.js`. Reine Haltungen, Heilung und andere schadenslose Fähigkeiten bleiben schadenslos. Zauber behalten ihre eigenen Schadensstaffeln.

Ein gewöhnlicher Waffenangriff verwendet weiterhin die tatsächliche Waffe. Bei einer Technik bezahlt der erste reguläre Aktionspunkt die Waffenbasis; zusätzliche Punkte kaufen zusätzliche Würfel. Die folgende Tabelle zeigt reine Schadenshandlungen mit einer W8-Waffe, ohne Attribut-, Ausrüstungs-, Ausbildungs- oder Zustandsboni:

| Kosten | Schaden |
| --- | --- |
| Aktion | 1W8 |
| Reaktion | 1W8 |
| Bonusaktion | 1W4 |
| Aktion + Bonusaktion | 1W8 + 1W4 |
| Aktion + Reaktion | 1W8 + 1W6 |
| Reaktion + Bonusaktion | 1W8 + 1W4 |
| Aktion + Bonusaktion + Reaktion | 1W8 + 1W6 + 1W4 |
| Aktion + Besondere Aktion | 2W8 |
| Reaktion + Besondere Aktion | 2W8 |
| Bonusaktion + Besondere Aktion | 1W4 + 1W8 |
| Aktion + Reaktion + Besondere Aktion | 2W8 + 1W6 |
| Aktion + Aura-Fokus | 3W8 |

- **Leichter Bonusangriff:** Waffenwürfel auf höchstens W4 begrenzen, positive feste Schadensmodifikatoren halbieren und abrunden; kein Ausbildungswürfel. Negative Modifikatoren bleiben erhalten. Zusätzliche Besondere Aktionen oder Fokus verstärken auch diese Angriffe.
- **Zusätzliche reguläre Punkte:** Aktion kauft einen Waffenwürfel, Reaktion einen Waffenwürfel bis W6, Bonusaktion bis W4.
- **Besondere Aktion:** ein zusätzlicher Waffenwürfel pro bezahltem Punkt.
- **Aura-Fokus:** zwei zusätzliche Waffenwürfel pro explizit bezahltem Punkt. Die bestehende alternative Fokuszahlung bleibt erhalten und verstärkt einen geeigneten Angriff ebenfalls mit zwei Würfeln. Bereits explizit mit Fokus bepreiste Techniken bekommen bei alternativer Bezahlung keine doppelte Verstärkung. Bei vielseitiger Führung zählt der tatsächlich gewählte Griff. Für Zauber verwendet diese alternative Verstärkung zwei Würfel des höchsten vorhandenen Schadenswürfels.
- **Zusatzwirkungen:** Eine relevante Deckungs-/Kontrollwirkung verbraucht den schwächsten zusätzlichen regulären Punkt. Sie wird nicht zusätzlich zum maximalen reinen Schadenspaket verschenkt. Die ausdrücklich gestalteten gemeinsamen Jungdrachen-Kontrolltechniken behalten ihre individuellen Waffenmodelle.
- **Mehrere Ziele:** Kein Ausbildungswürfel und höchstens W6 für gewöhnliche/besondere Zusatzwürfel je Ziel. Fokus bleibt eine starke Verstärkung.
- **Ausbildung:** Der höchste erreichte Ausbildungswürfel gilt für ältere und neu freigeschaltete reguläre Techniken gleichermaßen. Er ersetzt frühere Stufen und wird nicht aufsummiert. Allgemeine Staffel: Stufe 7 W4, 9 W6, 13 W8, 17 W10; Milwr-Staffel: 6 W4, 10 W6, 15 W8. Leichte und mehrzielige Techniken sind ausgenommen.

Zusatzwürfel richten sich nach dem ersten Würfel der Hauptwaffe, bis zur jeweiligen Obergrenze. Eine 2W6-Waffe erhält für eine Besondere Aktion einen W6 zusätzlich; ihr gesamter Würfelpool wird nicht nochmals verdoppelt. Normale kritische Treffer verdoppeln weiterhin die dafür vorgesehenen Schadenswürfel. Feste Zusätze wie Drachenzahns kritische +2 werden nicht verdoppelt.

## Zwei gleichzeitig geführte Waffen

`combat-paired-weapons.js` ermittelt die Ausbildung aus tatsächlich erlernten, auf der aktuellen Stufe zugänglichen Zweiwaffentechniken. Namen einzelner Figuren steuern diese Berechtigung nicht.

- Asgeir/Fenrir mit zwei Einhandäxten: **2W6** als gemeinsamer Grundwurf.
- Guinevere mit zwei Jagddolchen: **2W4**.
- Unterschiedliche Waffen verwenden ihre tatsächlichen Würfel, z. B. W6 + W4.
- Ein gemeinsamer Angriff hat einen Trefferwurf. Feste Boni und Ausbildungswürfel zählen einmal; führende Waffe und deren Schadensart bestimmen die Auswertung. Der flache Schadensbonus einer zweiten Waffe wird nicht erneut addiert.
- Gawain erhält ohne erlernte passende Ausbildung keinen Zweiwaffenangriff. Ausrüstungsauswahl und Server prüfen dieselbe Voraussetzung.
- Zwei Hände an einer einzelnen vielseitigen Waffe sind kein Zweiwaffenangriff; dafür gilt deren Zweihandwürfel.
- Eine entwaffnete zweite Hand kann nicht zum gemeinsamen Angriff beitragen. Ein Wechsel auf die noch verfügbare Einzelwaffe bleibt möglich.

**Persönliche Ausnahmen:** Asgeirs „Vier Fänge des Wolfshorns“ bleiben vier getrennte Angriffe mit jeweils einer Axt; kein vierfacher 2W6-Angriff. Ylvas „Der fallende Dorn“ bleibt ihre bezahlte Zweierfolge mit Rettungswurf und bedingter Verstärkung des zweiten Angriffs. Fenrirs ältere Doppelaxthieb-Folge verwendet jetzt den gemeinsamen Zweiwaffenwurf statt ihres früheren schwachen Folgeangriffs. Frekis drei Angriffstechniken folgen ebenfalls der Waffenökonomie.

## Konkrete Korrekturen

Werte vor Abwehr, Trefferwahrscheinlichkeit und kritischen Effekten; aktuelle Stufe 7 bei Ylva und Asgeir:

| Handlung | Vorher | Jetzt |
| --- | --- | --- |
| Ylva: normaler Langbogenschuss | W8 + 5, Ø 9,5 | W8 + 5, Ø 9,5 |
| Ylva: Erster Jagdpfeil, Bonusaktion | W6 + W4 + 5, Ø 11 | W4 + 2, Ø 4,5 |
| Asgeir: Hauptwaffenangriff, beide Äxte gezogen | W6 + 6, Ø 9,5 | 2W6 + 6, Ø 13 |
| Asgeir: Kurzer Axthieb, beide Äxte gezogen | W6 + W4 + 6, Ø 12 | 2W4 + 3, Ø 8 |
| Asgeir: Gekreuzte Axtwende | 2W6 + 7, Ø 14 | 2W6 + W4 + 6, Ø 15,5 |

Der vollständige reproduzierbare Vergleich enthält **816 Optionen mit sechs Referenzwaffen**, jeweils bei Freischaltung und auf Stufe 20: [Katalogdaten](weapon-economy-2026-09-30/catalog.json). Die Referenzwaffen sind einzelne Waffen; Zweiwaffenvarianten werden zusätzlich mit realen Figuren geprüft.

## Bestehende Daten und Veröffentlichung

Der Releaseplan `firebase/functions/scripts/weapon-economy-release-model.mjs` aktualisiert ausschließlich `combatProfile.techniques` und bei Bedarf `combatProfile.classTraining`. Die administrative Veröffentlichung ergänzt die Versionskennung und verwendet eine Schreibvorbedingung auf den zuletzt gelesenen Dokumentstand. TP, Ressourcen, Zustände, Fähigkeitennutzungen, Besitz und Online-IDs bleiben erhalten.

Klassenseiten, Attackenkataloge, ursprüngliche kuratierte Vorlagen, aktuelle Archiv-Overlays, generierte Charakterdaten und die gemeinsame Attackenbibliothek werden abgeglichen. Die aktuellen Archivkopien übernehmen dabei auch den passenden Online-Inventarstand, ohne Online-Besitz zu verändern. Online werden zwölf Charakterbögen und Frekis Kreaturenbogen gezielt aktualisiert. Gildas behält seine bestehende Online-ID und die bestehende Zuordnung im zusammengeführten Archiv.

Zusätzlicher Generatorfix: `reconcile-character-equipment.mjs` behandelt individuell ausgearbeitete Gegenstände als maßgeblich. Standardvorlagen dürfen vorhandene Qualitätsboni, Rüstungsschutz, Preise und Beschreibungen nicht mehr überschreiben. Die unverändert freigegebenen Effekte von Drachenzahn, Pflichtschwur und beiden Plattenrüstungen bleiben damit auch nach erneutem Generieren erhalten.

## Prüfung und Grenzen

Abschließende Prüfung: **1.239 Frontend-/Klassentests, 137 Server-Unit-Tests und 243 unterschiedliche Firestore-Integrationstests erfolgreich**. Nach Anpassung überholter Vorlagen-/Slot-Erwartungen wurden die betroffenen Tests gezielt wiederholt. Zwei wiederholte Integrationsfälle betreffen die tatsächliche zweite Axt bei Fenrir und das Aufheben einer entwaffneten Waffe durch den automatischen Testspieler. Der vollständige Asgeir–Gawain–Gildas-Testkampf ist erfolgreich abgeschlossen. Produktionsbuild, Klassen-/Bibliotheksgeneratoren und Archivkonsistenzprüfung sind erfolgreich.

- Vollständige Frontend-/Klassentests und Server-Unit-Tests; Katalogauswertung mit Treffer, Fehlschlag, kritischem Treffer und Rettungswürfen.
- Zusätzlicher Durchlauf über lesend exportierte **34 Online-Kampfbögen: 2.922 Auswertungen ohne Fehler**. Ausrüstungsvoraussetzungen bleiben verbindlich; ungeeignete Waffen werden nicht für den Test als nutzbar deklariert.
- Firestore-Integration in getrennten Demo-Projekten: Klassenformen, persönliche Folgen, Zweiwaffenwürfel, leichte Angriffe, Fokusverbrauch, kritische Folgen, Entwaffnung/Aufheben, Speicherung, erneutes Laden, Rücknahme und vollständige Kämpfe.
- Historischer Gawain–Gildas-Verlauf wird vor/nach Veröffentlichung lesend gegen die Sicherung geprüft.

Schadensökonomie und korrekte Auswertung sind überprüfbar; eine universelle Siegesquote zwischen Klassen folgt daraus nicht. Die automatischen Testkämpfe verwenden vereinfachte Entscheidungen. Reine Bewegungsfähigkeiten wie Frekis Flankenlauf wurden durch diesen Schadensauftrag nicht in andere Zustände umgewandelt. Duncans bestehender Online-Waffenbesitz wird nicht aus einem älteren Export zurückgesetzt.
