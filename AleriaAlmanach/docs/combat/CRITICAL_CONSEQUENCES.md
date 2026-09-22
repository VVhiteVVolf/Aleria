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
Pro Auswertung gegen ein Ziel wird höchstens ein Nebeneffekt vergeben: Der erste
kritische Wurf zählt, einschließlich eines eventuellen Folgeangriffs. Der bisherige
kritische Schaden bleibt bestehen. Ein natürlicher kritischer Treffer muss treffen.
Der zusätzliche W10 wird serverseitig bestimmt; Transaktionswiederholungen ändern
den gewählten W10 nicht. Clientseitig eingesandte Nebeneffekte werden verworfen.

Neue Konsequenzen beginnen nach dem vollständigen auslösenden Beitrag. So bleiben
bereits gewürfelte weitere Abschnitte desselben Beitrags gültig. Temporäre Effekte
enden nach dem nächsten eigenen Beitrag der betroffenen Figur oder bei Kampfende.
Gleichnamige Effekte werden erneuert, nicht addiert. Unterschiedliche Effekte können
zusammen bestehen. Waffen am Boden bleiben auch nach Kampfende in ihrer Szene.

## W10 bei kritischem Treffer

| W10 | Effekt | Betroffene Figur / Wirkung |
| --- | --- | --- |
| 1 | Aus dem Takt | Ziel: keine Reaktion bis zum Ende seines nächsten Beitrags |
| 2 | Zurückgedrängt | Ziel: keine Bonusaktion bis zum Ende seines nächsten Beitrags |
| 3 | Unsicherer Griff | Ziel: −1 auf Waffenangriffe im nächsten Beitrag |
| 4 | Offene Deckung | Ziel: −1 Verteidigung bis zum Ende seines nächsten Beitrags |
| 5 | Tauber Waffenarm | Ziel: −2 Waffenschaden im nächsten Beitrag, mindestens 0 |
| 6 | Kurzer Stolperer | Ziel: −3 m Bewegung bis zum Ende seines nächsten Beitrags, mindestens 0 |
| 7 | Die Initiative ergriffen | Angreifer: +1 auf Waffenangriffe im nächsten Beitrag |
| 8 | Günstige Stellung | Angreifer: +1 Verteidigung bis zum Ende seines nächsten Beitrags |
| 9 | Lücke erkannt | Angreifer: +1 Waffenschaden im nächsten Beitrag |
| 10 | Entwaffnet | Die geführte Waffe des Ziels fällt in Reichweite zu Boden |

## W10 bei kritischem Fehlschlag

| W10 | Effekt | Betroffene Figur / Wirkung |
| --- | --- | --- |
| 1 | Überstreckt | Angreifer: keine Reaktion bis zum Ende seines nächsten Beitrags |
| 2 | Verheddert | Angreifer: keine Bonusaktion bis zum Ende seines nächsten Beitrags |
| 3 | Griff verrutscht | Angreifer: −1 auf Waffenangriffe im nächsten Beitrag |
| 4 | Flanke geöffnet | Angreifer: −1 Verteidigung bis zum Ende seines nächsten Beitrags |
| 5 | Verkrampfter Arm | Angreifer: −2 Waffenschaden im nächsten Beitrag, mindestens 0 |
| 6 | Schlechter Stand | Angreifer: −3 m Bewegung bis zum Ende seines nächsten Beitrags, mindestens 0 |
| 7 | Schwung verloren | Angreifer: −1 Waffenschaden im nächsten Beitrag, mindestens 0 |
| 8 | Gegner gewarnt | Ziel: +1 Verteidigung bis zum Ende seines nächsten Beitrags |
| 9 | Konterfenster | Ziel: +1 auf Waffenangriffe im nächsten Beitrag |
| 10 | Waffe entglitten | Die eigene geführte Waffe fällt in Reichweite zu Boden |

Waffenmodifikatoren schließen waffenbasierte Kampftechniken ein. Die Sperre einer
Aktionsressource reduziert ihre Verfügbarkeit auf 0, nicht ihre dauerhafte Kapazität.
Fäuste, Klauen, Bisse und andere Körperwaffen sind nicht entwaffnungsfähig. Dort und
bei einer bereits entwaffneten Figur ersetzt „Gleichgewicht verloren“ den Waffenverlust
(−1 auf Waffenangriffe im nächsten eigenen Beitrag).

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

Die lokale Prüfung umfasst echte Composer-Bedienung im Browser sowie deterministische
Modell- und Transaktionstests mit einer isolierten Datenbankattrappe. Live-Daten werden
für diese Tests nicht verändert. Veröffentlichung erfordert zusammenpassende Frontend-
und Functions-Versionen; bis zur Freigabe bleibt die bestehende Online-Version aktiv.
