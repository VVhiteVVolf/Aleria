# Kritische Kampfergebnisse und Szenengegenstände

## Aktivierung und Begrenzung

Neue Kampfphasen erhalten beim serverseitigen Start `criticalEffectsVersion: 1`.
Bereits laufende Phasen ohne diese Kennzeichnung behalten die bisherigen Regeln;
Beitritte, Austritte und neue Beiträge ändern ihre Regelversion nicht. Alte Würfe
werden niemals nachträglich ausgewertet. Nach ausdrücklicher Freigabe kann eine
serverseitige `combat-rules-release`-Grenze eine laufende Phase für kommende Würfe
auf Version 1 umstellen. Sie verändert keinen früheren Beitrag und zählt nicht
als Zug. Dies ist für das laufende Gildas–Gawain-Duell freigegeben.

Nur Waffenangriffe und waffenbasierte Kampftechniken lösen die Tabellen aus.
Zauber, Gesang, Gebete, allgemeine Fähigkeiten und Fertigkeitsproben sind ausgeschlossen.
Pro Gesamtbeitrag höchstens eine Trefferfolge pro Angreifer/Ziel und eine Fehlschlagsfolge pro Angreifer. Innerhalb einer Auswertung zählt der erste
kritische Wurf, einschließlich eines eventuellen Folgeangriffs. Der bisherige
kritische Schaden bleibt bestehen. Ein natürlicher kritischer Treffer muss treffen.
Der zusätzliche W20 wird serverseitig bestimmt; Transaktionswiederholungen ändern
den gewählten W20 nicht. Clientseitig eingesandte Nebeneffekte werden verworfen.

Neue Konsequenzen beginnen nach dem vollständigen auslösenden Beitrag. So bleiben
bereits gewürfelte weitere Abschnitte desselben Beitrags gültig. Temporäre Effekte
enden nach dem nächsten eigenen Beitrag der betroffenen Figur oder bei Kampfende. Einmalige Effekte werden bereits beim nächsten passenden Wurf/Treffer verbraucht; auch ein Fehlschlag verbraucht einen Angriffswurfeffekt. Ausnahme: Nachwirkender Treffer verursacht je 1 direkten TP-Verlust zu Beginn der nächsten zwei eigenen Beiträge.
Gleichnamige Effekte werden erneuert, nicht addiert. Unterschiedliche Effekte können
zusammen bestehen. Waffen am Boden bleiben auch nach Kampfende in ihrer Szene.

## W20 bei kritischem Treffer

| W20 | Effekt | Betroffene Figur / Wirkung |
| --- | --- | --- |
| 1 | Aus dem Takt | Ziel: Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion. |
| 2 | Zurückgedrängt | Ziel: Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion. |
| 3 | Unsicherer Griff | Ziel: Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken. |
| 4 | Offene Deckung | Ziel: Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung. |
| 5 | Tauber Waffenarm | Ziel: Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0. |
| 6 | Kurzer Stolperer | Ziel: −1 auf den nächsten eigenen Waffen-/Technikangriff; verfällt spätestens am Ende des nächsten eigenen Beitrags. |
| 7 | Die Initiative ergriffen | Angreifer: Im nächsten eigenen Beitrag: +1 auf Waffenangriffe und Kampftechniken. |
| 8 | Günstige Stellung | Angreifer: Bis zum Ende des nächsten eigenen Beitrags: +1 Verteidigung. |
| 9 | Lücke erkannt | Angreifer: Im nächsten eigenen Beitrag: +1 Waffenschaden. |
| 10 | Entwaffnet | Ziel: Die geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt. |
| 11 | Zu Boden gebracht | Ziel: Liegend: Im nächsten eigenen Beitrag keine Bonusaktion; keine weiteren Bewegungs- oder Angriffsmali. |
| 12 | Nachwirkender Treffer | Ziel: Zu Beginn der nächsten zwei eigenen Beiträge jeweils 1 TP Verlust; höchstens 2 TP, ohne Rüstungsschutz oder Verstärkung. |
| 13 | Verunsichert | Ziel: Der nächste eigene Waffen-/Technikangriff hat Nachteil. |
| 14 | Angriff gelesen | Angreifer: Der nächste eigene Waffen-/Technikangriff gegen dieses Ziel hat Vorteil. |
| 15 | Präzise nachsetzen | Angreifer: Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel verursacht +2 Schaden; nicht nochmals verdoppelt. |
| 16 | Abgefangener Schwung | Angreifer: Der nächste eingehende Waffen-/Techniktreffer verursacht 2 Schaden weniger, mindestens 0. |
| 17 | Schutz umgangen | Angreifer: Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel ignoriert 1 Punkt Schadensreduktion; keine RK-Änderung. |
| 18 | Angeschlagenes Gleichgewicht | Ziel: −2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik. |
| 19 | Kampfesmut | Angreifer: 2 temporäre TP, nicht additiv; ein höherer Vorrat bleibt bestehen. Der neue Vorrat verfällt nach dem nächsten eigenen Beitrag. |
| 20 | Gefestigter Stand | Angreifer: +2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik. |

## W20 bei kritischem Fehlschlag

| W20 | Effekt | Betroffene Figur / Wirkung |
| --- | --- | --- |
| 1 | Überstreckt | Angreifer: Bis zum Ende des nächsten eigenen Beitrags: keine Reaktion. |
| 2 | Verheddert | Angreifer: Bis zum Ende des nächsten eigenen Beitrags: keine Bonusaktion. |
| 3 | Griff verrutscht | Angreifer: Im nächsten eigenen Beitrag: −1 auf Waffenangriffe und Kampftechniken. |
| 4 | Flanke geöffnet | Angreifer: Bis zum Ende des nächsten eigenen Beitrags: −1 Verteidigung. |
| 5 | Verkrampfter Arm | Angreifer: Im nächsten eigenen Beitrag: −2 Waffenschaden, mindestens 0. |
| 6 | Schlechter Stand | Angreifer: −1 auf den nächsten eigenen Waffen-/Technikangriff; verfällt spätestens am Ende des nächsten eigenen Beitrags. |
| 7 | Schwung verloren | Angreifer: Im nächsten eigenen Beitrag: −1 Waffenschaden. |
| 8 | Gegner gewarnt | Ziel: Das Ziel erhält bis zum Ende seines nächsten eigenen Beitrags +1 Verteidigung. |
| 9 | Konterfenster | Ziel: Das Ziel erhält in seinem nächsten eigenen Beitrag +1 auf Waffenangriffe und Kampftechniken. |
| 10 | Waffe entglitten | Angreifer: Die eigene geführte Waffe fällt zu Boden. Aufheben kostet einen verfügbaren Aktionspunkt. |
| 11 | Gestürzt | Angreifer: Liegend: Im nächsten eigenen Beitrag keine Bonusaktion; keine weiteren Bewegungs- oder Angriffsmali. |
| 12 | Unglücklich belastet | Angreifer: Zu Beginn des nächsten eigenen Beitrags einmalig 1 TP Verlust, ohne Rüstungsschutz oder Verstärkung. |
| 13 | Vorhersehbar geworden | Angreifer: Der nächste Waffen-/Technikangriff dieses Gegners gegen dich hat Vorteil. |
| 14 | Hektischer Anschluss | Angreifer: Der nächste eigene Waffen-/Technikangriff kann keinen Vorteil erhalten; vorhandener Nachteil bleibt bestehen. |
| 15 | Unsicher auf den Beinen | Angreifer: −2 auf den nächsten STÄ-/GES-Rettungswurf gegen eine Waffen-/Kampftechnik. |
| 16 | Deckung falsch gesetzt | Angreifer: Der nächste Waffen-/Technikangriff dieses Gegners gegen dich erhält +2 Angriff. |
| 17 | Gut abgefangen | Angreifer: Der nächste eigene Waffen-/Techniktreffer gegen dieses Ziel verursacht 2 Schaden weniger, mindestens 0. |
| 18 | Schwacher Anschluss | Angreifer: Der nächste eigene Waffen-/Techniktreffer verursacht 2 Schaden weniger, mindestens 0. |
| 19 | Konterchance verspielt | Angreifer: Bis zum Ende des nächsten eigenen Beitrags lösen Haltungen keine automatischen Konter aus. Die Reaktion bleibt anderweitig verfügbar. |
| 20 | Absicht durchschaut | Ziel: Das Ziel erhält +2 auf seinen nächsten STÄ-/GES-Rettungswurf gegen eine deiner Waffen-/Kampftechniken. |

Waffenmodifikatoren schließen waffenbasierte Kampftechniken ein. Die Sperre einer
Aktionsressource reduziert ihre Verfügbarkeit auf 0, nicht ihre dauerhafte Kapazität.
Fäuste, Klauen, Bisse und andere Körperwaffen sind nicht entwaffnungsfähig. Dort und
bei einer bereits entwaffneten Figur ersetzt „Gleichgewicht verloren“ den Waffenverlust
(−1 auf Waffenangriffe im nächsten eigenen Beitrag).

## W20-Veröffentlichung vom 3. Oktober 2026

Die ersten zehn Einträge bleiben erhalten; beide Tabellen umfassen nun zwanzig Einträge. Kein zusätzlicher Flavorwurf. Neue Auswertungen speichern `version: 2` und `dieSides: 20`; die bestehende Kampfphasen-Aktivierung bleibt `criticalEffectsVersion: 1`. Laufende aktivierte Kämpfe verwenden für kommende Angriffe W20, ohne ihre Geschichte umzuschreiben. Gespeicherte W10-Auswertungen bleiben W10 und werden nicht neu ausgewertet.

Nachschaden umgeht Rüstung und temporäre TP, verursacht keine zusätzlichen Würfe und kann nicht verstärkt werden. Rede-, Fertigkeits- und Interaktionsbeiträge zählen ebenfalls als eigener Beitrag; administrative Einträge zählen nicht. Der HP-Verlust wird vor dem ersten Abschnitt angewandt, serverseitig gespeichert und als Beitragsbeginn ausgewiesen. Bei 0 TP sind weitere Kampfhandlungen gesperrt.

Kampfesmut ersetzt nur einen niedrigeren temporären Vorrat; bei späterer Ersetzung durch einen höheren anderen Vorrat verfällt dieser nicht mit Kampfesmut. Endet der Kampf vorher, verfällt nur der zugehörige Kritvorrat. Speicherung und Rücknahme erfolgen mit den bestehenden Profiltransaktionen. Alte W10-Effekte erhalten diese neuen Eigenschaften nicht rückwirkend.

Rettungswurfmodifikatoren gelten nur für STÄ/GES gegen Waffen-/Kampftechniken, nicht für Zauber, Fertigkeiten oder Konzentration. Gegnergebundene Effekte speichern die konkreten Figuren-IDs. Einmaleffekte verwenden die gemeinsame Regelliste und Verbrauchsbelege; persönliche Angriffsfolgen verbrauchen sie nicht mehrfach. Schutz umgehen ignoriert höchstens einen Punkt vorhandener fester Schadensreduktion, niemals RK oder Immunitäten; ohne Reduktion entsteht kein Zusatzschaden.

## Entwaffnung und Aufheben

- Ein unveränderliches Ereignis enthält Waffen- und Inventar-ID, Bild, ursprüngliche
  Figur, Profilquelle und einen Gegenstandssnapshot. Der Szenenverlauf ist die Quelle
  für seine Verfügbarkeit, keine zusätzliche Bestandsliste.
- Die Waffe bleibt zunächst Eigentum der ursprünglichen Figur. Ihre Verwendung ist
  in dieser Szene gesperrt, bis sie aufgehoben wird. Eine andere geführte Waffe oder
  ein unbewaffneter Angriff bleibt möglich.
- Der Beitrag zeigt „Entwaffnet“. Unter **Interagieren → Aktive Szene → Aufheben**
  wird genau ein verfügbarer Aktionspunkt bezahlt. Automatische Reihenfolge:
  Bonusaktion, Aktion, Reaktion, Besondere Aktion, Aura-Fokus. Eine explizite Auswahl
  ist möglich. Mana und Inspiration gelten nicht als Aktionspunkte.
- Aufheben und danach angreifen kann im selben Beitrag stehen. Die Reihenfolge der
  Abschnitte gilt auch für Ressourcen. Ohne verfügbaren Punkt wird nichts gespeichert.
- Eigene Waffen werden ohne Bestandszuwachs wieder verfügbar. Bei Aufnahme durch
  eine andere Figur werden Quellinventar, Zielinventar und Kampfausrüstung gemeinsam
  aktualisiert. Kreaturvorlagen werden beim Verlust einer Szenenkreaturenwaffe nicht
  verändert. Aufnehmende Figuren benötigen ein persistentes Charakterprofil.
- Wiederholte Aufnahmen, gleichzeitige Ansprüche und doppelte Entwaffnungen derselben
  Waffe erzeugen kein zweites Exemplar.
- Vorbereitete Texte unterscheiden eigene Fehlgriffe, gegnerische Entwaffnung,
  Bogenwaffen, Stangenwaffen, flexible Waffen und nicht entwaffnungsfähige Körperwaffen.

Die Verfügbarkeitsprüfung ist szenengebunden. Ein szenenübergreifender physischer
Aufenthaltsort aller Inventargegenstände wird hierdurch nicht eingeführt.

## Interagieren, Konsumieren und Erzähler

Beide Blasen bieten Auswahlgruppen für das eigene Inventar und die aktive Szene.
Interagieren verwendet wiederverwendbare Inventargegenstände; eine freie textliche
Interaktion bleibt möglich. Neutrale Szenengegenstände können vor Ort benutzt oder
aufgenommen werden. Konsumieren verbraucht ein Stück eines Verbrauchsguts. Bestehende
mechanische Verbrauchseffekte, beispielsweise Zornkappe und definierte
Fähigkeitsauffrischungen, bleiben angebunden. Beliebige Freitextbeschreibungen von
Heiltränken werden nicht automatisch in Heilwürfe übersetzt; weitere standardisierte
Verbrauchswirkungen können über die gemeinsame Inventarnutzung ergänzt werden.

Im Erzählerbereich öffnet **Gegenstand in die Szene bringen** einen Dialog mit Name,
Bildadresse, Beschreibung, optionaler Handelsregistervorlage und Gegenstandsart.
Die Funktion ist für Redaktion/Spielleitung freigegeben. Registerwerte stammen aus
der serverseitigen Vorlage. Ohne Vorlage entsteht ein neutraler Gegenstand ohne
erfundene Kampfwerte. Platzierung, Fallenlassen und Aufnahme erscheinen als neutrale
Blasen mit Gegenstandsportrait. Ihre Darstellung greift nicht auf KI-Textgenerierung
zurück und verzögert den Speichervorgang nicht.

## Zuständigkeiten und Rücknahme

- `modules/combat-critical`: Tabellen, Auswahl und Laufzeitbedingungen.
- `modules/scene-items`: Szenenprojektion, Aufnahme, neutrale Darstellung und Dialog.
- `modules/inventory-use`: Auswahl und gemeinsame Verbrauchslogik.
- `commit-combat-comment`: verbindliche Auswertung und atomare Inventar-/Profiländerung.
- `commit-scene-item`: autorisierte, wiederholungssichere neutrale Platzierung.
- `commit-undo-mechanical-comment`: Rücknahme inklusive Inventar und Kampfausrüstung.

Spätere Interaktionen blockieren die Rücknahme ihres Ursprungsereignisses, auch bei
unterschiedlichen Figuren. Zuerst muss der abhängige Beitrag zurückgenommen werden.
Die aus dem Almanach generierten Backendmodule werden ausschließlich durch
`firebase/functions/scripts/sync-almanach-mechanics.mjs` synchronisiert.

Für die W20-Erweiterung wurden alle 40 Tabelleneinträge mit Speicherung und Ablauf
im isolierten Firestore-Emulator geprüft, dazu vier vollständige Duelle mit dem
W20-Pool. Modell- und Servertests prüfen Gegnerbindung, Einzelverbrauch in
Angriffsfolgen, Rettungswürfe, Abwehrladungen, kombinierte Schadensreduktion,
Nachschaden bis 0 TP sowie temporäre TP und Rücknahme einschließlich Kampfende.
Die breite Frontend-/Klassenprüfung umfasst 1.295 erfolgreiche Tests; ergänzende
Regressionstests sichern die neuen Randfälle. Der Produktionsbuild ist erfolgreich.
Live-Daten werden für diese Tests nicht verändert. Veröffentlichung erfolgt mit
zusammenpassenden Frontend- und Functions-Versionen; eine Änderung bestehender
Charakterdatensätze oder historischer Beiträge ist für W20 nicht erforderlich.
