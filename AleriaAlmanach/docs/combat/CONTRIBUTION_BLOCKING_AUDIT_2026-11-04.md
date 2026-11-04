# Prüfung der Beitragssperren am 4. November 2026

Diese Prüfung trennt die Handlungsfähigkeit einer Figur von der technischen
Speicherbarkeit eines vollständigen Beitrags. Ein Zustand darf einen Angriff
verbieten, ohne dadurch jeden erzählerischen Beitrag zu verhindern. Umgekehrt
darf ein Beitrag mit mehreren mechanischen Abschnitten nicht teilweise
gespeichert werden und dabei Ressourcen oder Würfelbelege verlieren.

Geprüfte Kernquellen: `combat-profile-resolver.js`, `combat-wait-action.js`,
`combat-action-permission.js`, `combat-action-economy.js`, `combat-trigger-rules.js`,
`combat-rule-consumption.js`, `skill-resolution-service.js`,
`health-trait-policy.js`, `combat-encounter-lifecycle.js`, Kommentarübermittlung
sowie die autoritativen Kampf-, Fertigkeits- und Rücknahmehandler.

## Belegte Fehler und Korrekturen

- **Reaktionen umgingen Handlungsunfähigkeit.** Eigene Angriffe wurden bei
  Betäubung oder 0 TP abgewiesen; gewählte Abwehr- und Unterstützungsreaktionen
  konnten dagegen weiterhin ausgelöst werden. Sie verwenden jetzt dieselbe
  Erlaubnisprüfung. Passive Schutz- und Überlebensregeln bleiben erhalten; die
  ausdrücklich vorhandene Ausnahme `canActAtZeroHitPoints` bleibt wirksam.
- **Während derselben Auswertung entstandene Sperren wurden übergangen.** Nach
  tödlichem Schaden oder einem gerade angewandten blockierenden Zustand sah eine
  späte Reaktion noch das ursprüngliche Profil. Konzentrations- und späte
  Reaktionsphasen erhalten jetzt eine getrennte aktuelle Sicht auf TP und
  Zustände. Bereits verrechnete numerische Effekte werden dadurch nicht doppelt
  berechnet.
- **Freie Proben umgingen den Zustand.** Freiwillige Fertigkeits- und
  Attributsversuche prüfen jetzt ebenfalls die Handlungsfähigkeit. Rettungswürfe
  bleiben als erzwungene beziehungsweise automatische Abwehr erlaubt. Reine
  Erzählsegmente erhalten keine pauschale neue Sperre.
- **Abwarten war bei 0 TP ebenfalls verboten.** „Abwarten / Zug aussetzen“ ist
  jetzt ausdrücklich ein prozeduraler Zugabschluss und bei 0 TP oder einem
  blockierenden Zustand möglich. Er greift nicht an, heilt nicht und füllt keine
  Ressourcen auf. Er benötigt keine Waffe und ignoriert Entwaffnung. Die bereits
  vorhandenen allgemeinen Beitragsanfangs- und Ablaufregeln bleiben bestehen.
- **Explizite Stimmvoraussetzungen gingen verloren.** `requiresVoice` überstand
  weder die Normalisierung noch die Actionprojektion. Das Feld bleibt jetzt bei
  Fähigkeiten, Techniken und Zaubern erhalten. Stummheit sperrt damit tatsächlich
  eine ausdrücklich stimmabhängige Handlung. Lautlose Varianten bleiben möglich;
  es wird keine pauschale Stimmvoraussetzung aus der Kategorie erraten.
- **Eine bereits gestartete Flächenwirkung brach an ihrem eigenen Zustand ab.**
  Der erste Zielbeleg konnte einen Eigenstun anwenden und dadurch die verbleibenden
  Ziele derselben Wirkung unauflösbar machen. Die vorhandene Fortsetzungsregel
  für bereits begonnene Flächenaktionen behandelt eine solche neue Handlungssperre
  jetzt ebenso wie die schon erlaubte Fortsetzung nach eigenen 0 TP. Ein neuer
  Handlungsstart bleibt gesperrt.
- **Schlafend war nur ein wirkungsloses Standardetikett.** Das ausdrücklich
  ausgewählte Schlafend-Preset verhindert jetzt freiwillige Handlungen und
  Reaktionen. Alte Kopien mit genau dieser `presetId` werden ebenfalls erkannt.
  Rettungen und prozedurales Aussetzen bleiben möglich. Es werden weder
  Aufweckauslöser noch eine automatische Heilung erfunden. Freie Texte wie
  „wirkt schlafend“ erzeugen keine Sperre; inaktive Zustände bleiben unwirksam.

## Sperrgrundmatrix und Bewertung

| Grundfamilie | Tatsächlicher Umfang | Bewertung und möglicher nächster Schritt |
| --- | --- | --- |
| 0 TP ohne ausdrückliche Sonderregel | Neue aktive Kampfhandlungen, freiwillige Proben und Reaktionen | Sinnvoll: Handlungsunfähigkeit darf keine Selbsterholung als aktiven Angriff erlauben. Erzwungene Rettungen, erzählerischer Beitrag und Zug aussetzen bleiben möglich. |
| `blocksActions` / Betäubt / ausdrückliches Schlafend-Preset | Freiwillige aktive Handlungen und gewählte Reaktionen | Sinnvoll: Wirkung gilt unabhängig vom gewählten Interface. Quelle, Ablauf oder tatsächliches Entfernen müssen den Zustand beenden. Aussetzen alleine behauptet keine Heilung. |
| Dauerhaftes schweres Leiden mit `blocksActions` | Gleicher Handlungsumfang, dauerhaft nach seiner belegten Stufe | Sinnvoll: Kein Versprechen, dass ein einziger übersprungener Zug eine dauerhafte Krankheit beseitigt. Höchste aktive Ausprägung bleibt maßgeblich. |
| Hauptaktion, Bonusaktion oder Reaktion einzeln gesperrt | Nur Kostenpakete, die diese konkrete Ressource benötigen | Sinnvoll: Keine pauschale Gesamtsperre. Andere vorhandene Aktionen und ausdrücklich zugelassene Ersatzkosten bleiben nutzbar. |
| Mana, Aura, Ausdauer oder andere Vorräte fehlen | Ausgewählte Handlung beziehungsweise Reaktion | Sinnvoll: Kein negativer Verbrauch oder unbestätigtes Auffüllen. Andere bezahlbare Handlungen, Erzählung oder Aussetzen wählen. |
| Falsche oder nicht verfügbare Bezahlalternative | Ausgewähltes Kostenpaket | Sinnvoll: Aura ersetzt nur bei tatsächlich erlaubter Aura-Zahlung das komplette Paket; Manaersatz benötigt eine passende vorhandene Ressource. Ein Verbot der Handlungsfähigkeit wird dadurch nicht aufgehoben. |
| Begrenzte Fähigkeit oder Reaktion verbraucht | Diese konkrete Fähigkeit | Sinnvoll: Anzeige und autoritativer Verbrauch dürfen keine zusätzliche Nutzung erzeugen. Andere Fähigkeiten bleiben möglich. |
| Kanalisierung bereits in diesem Gesamtbeitrag fortgeschritten | Zusätzlicher Fortschrittsversuch desselben Rituals | Sinnvoll: Mehrere Abschnitte dürfen eine Mehrbeitragswirkung nicht auf einen einzigen Beitrag verkürzen. |
| Berserkergang bereits aktiv | Erneute Aktivierung desselben Zustands | Sinnvoll: Keine kostenlose Verlängerung oder wiederholte Startwirkung. Andere verfügbare Handlungen bleiben möglich. |
| Waffe entwaffnet, nicht geführt oder nicht verfügbar | Diese Waffe und davon abhängige Techniken | Sinnvoll: Aufheben oder passende Ausrüstung wählen. Aussetzen benötigt diese Waffe nicht. |
| Explizit geplante Ausrüstungsänderung fehlerhaft oder unbezahlbar | Der betroffene geplante Abschnitt | Sinnvoll: Beabsichtigte Änderungen nicht still verwerfen. Planung korrigieren oder bewusst zurücknehmen; das ist kein allgemeiner Zustandsblock. |
| Zweihand-, Zweiwaffen-, Schild-, Reit- oder Waffenartvoraussetzung fehlt | Technik oder Ausrüstungsführung | Sinnvoll: Ausbildung beziehungsweise Körper-/Ausrüstungsanforderung ist konkret. Die gesamte Figur wird dadurch nicht als handlungsunfähig markiert. |
| Mindeststufe, Klassen-/Pfadzugang oder bestätigte Katalogfassung fehlt | Die konkrete Technik oder Zauberfassung | Sinnvoll: Kein Einkauf oder Import soll eine noch nicht freigegebene Auswertung erzeugen. Persönliche unabhängig ausgearbeitete Varianten behalten ihren eigenen Vertrag. |
| Zaubergrad nicht freigeschaltet oder Gradform fehlt | Dieser Wirkungsgrad | Sinnvoll: Verfügbare niedrigere Grade und andere Handlungen bleiben möglich; Kosten müssen zu der tatsächlich ausgewählten Fassung passen. |
| Konkreter benötigter Sinn, Stimme oder zweite nutzbare Hand fehlt | Die nachweislich entsprechende Aufgabe | Sinnvoll: Nur tatsächliche Anforderungen prüfen. Blindheit verbietet nicht pauschal Denken, Taubheit nicht jede Probe und Stummheit keinen lautlosen Zauber. |
| Geblendet, Festgesetzt, Nass oder freier beschreibender Zustand ohne weitere Quelle | Keine erfundene zusätzliche Gesamtsperre | Sinnvoll: Diese Begriffe allein bestimmen nicht alle erlaubten Handlungen. Vereinbarte strukturierte Wirkung und Befreiungsbedingungen der Quelle sind maßgeblich. |
| Unzulässiges Ziel, fehlende Profilkennung oder fehlende Zielverteidigung | Der konkrete mechanische Abschnitt | Sinnvoll: Ergebnis nicht gegen eine erfundene oder falsche Figur berechnen. Ein schädlicher Zielangriff auf sich selbst bleibt verboten; ausdrücklich strukturierte Eigenkosten und Eigenwirkungen bleiben erlaubt. |
| Kampf beendet, gewechselt oder Figur nicht mehr aktiv beteiligt | Der veraltete vorbereitete Kampfabschnitt | Sinnvoll: Neu laden und dieselbe Absicht gegen den aktuellen Stand prüfen; kein alter Entwurf darf einen beendeten Kampf fortsetzen. |
| Ungültige Eröffnung, doppelte Profilquelle, fehlende Gegenseite oder unpassendes Duell | Kampfstart beziehungsweise Kampflistenänderung | Sinnvoll: Eindeutige Zustandsbesitzer und zwei Seiten sichern. Kreaturengruppen verwenden einzelne Szeneninstanzen statt eine gemeinsam beschriebene Vorlage mehrfach. |
| Herausforderung bereits versucht, beansprucht, aufgelöst oder eigener verdeckter Ansatz | Genau dieser Lösungsweg/Anspruch | Sinnvoll: Atomarer einmaliger Anspruch verhindert mehrfachen Lohn und nachträgliche Selbstauflösung. Ein anderer erlaubter Ansatz bleibt verfügbar. |
| Rast ohne ausreichend tatsächlich verstrichene Szenenzeit | Die Rastbuchung | Sinnvoll: Kurze/lange Rast braucht ihre tatsächliche Zeitspanne. Der gemeinsame Szenenuhr-Checkup prüft die Berechnung; eine Sperre wegen fehlender Zeit wird nicht pauschal entfernt. |
| Figur/Name fehlt, Text leer oder Szene unbekannt | Gesamte Textübermittlung | Redaktionell beziehungsweise technisch sinnvoll: kein unzuordenbarer leerer Eintrag. Ein unbewusster Zug kann aus Erzählerperspektive beschrieben werden; eine aktive Handlung muss nicht erfunden werden. |
| Auswertung fehlt, wurde geändert oder ist noch nicht bestätigt | Gewählter mechanischer Abschnitt; dadurch atomarer Gesamtbeitrag | Sinnvoll: Den Abschnitt auswerten, korrigieren oder bewusst entfernen. Keine still gespeicherte Teilmenge mit verlorenen Würfen oder Kosten. |
| Ungültige Profilquelle, manipulierte Würfel, unzulässiges Datenformat oder zu großer Payload | Gesamte mechanische Transaktion | Sinnvoll: Der Server muss den tatsächlichen Besitzer und Einzelwürfel prüfen können. Größen-/Auswahllimits begrenzen die Transaktion; sie sind keine Kampfzustände. |
| Speichervorgang läuft bereits | Weiterer gleichzeitiger Sendeversuch | Sinnvoll: Verhindert doppelte Buchungen. Nach bestätigter Speicherung darf ein bloßer Anzeige-/Refreshfehler keine erneute Buchung verlangen. |
| Historische mechanische Bearbeitung/Rücknahme hätte abhängige spätere Belege verändert | Diese rückwirkende Mutation | Sinnvoll: Reihenfolge und Besitzschutz erhalten. Erlaubte Gegenbuchung beziehungsweise sichere Rücknahme verwenden; bestehende Würfe werden nicht neu ausgewertet. |

## Fortsetzungs- und Vertrauensgrenze

Die Flächenfortsetzung bekommt ihre Erlaubnis im Serverhandler aus der lokalen
`startedAreaActions`-Map des jeweiligen Segmentindex. Der erste Eintrag wird erst
nach erfolgreicher autoritativer Neuberechnung gesetzt. Beim primären Ziel ist
`startedAction` immer `null`; weder ein beliebiges Clientfeld noch bloß
`skipResourceCosts` gewährt die Ausnahme. Andere Handlungen, neue Abschnitte und
Kanalisierungsfortschritte erhalten dadurch keine Freigabe.

## Verifikation und Grenzen

Zwölf neue Kontraktprüfungen in `tests/combat-contribution-blocking.test.mjs`
testen die tatsächlichen Kampf- und Fertigkeitsservices einschließlich
Reaktionsquellen, Wirkung innerhalb desselben Treffers, passive Überlebensregeln,
0-TP-Ausnahme, Aussetzen, Stimme, Schlafen und Flächenfortsetzung. Der gemeinsame
Regressionblock mit Kampf-, Rüstungs-, Zustands-, nicht schädlichen und
Fertigkeitsprüfungen ist bestanden; Protokoll:
`diagnostics/temporary-condition-checkup-20261104/blocking-policy-tests.txt`.

Dieser Fachbereich verändert keine UI-Sperren eigenständig. Die Interfaceprüfung
bindet dieselben Erlaubnis-/Validierungsfunktionen an Auswahl und Sendebutton an.
Browser und Server erhalten dieselben Module durch den gemeinsamen Mechanik-Sync.
Der abschließende gemeinsame Backend- und Transaktionslauf wird im Hauptbericht
dokumentiert. Keine Veröffentlichung und keine produktiven Datenänderungen.
