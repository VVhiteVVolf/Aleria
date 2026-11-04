# Temporäre Zustände, Wechselwirkungen und Beitragssperren

Prüfstand: 4. November 2026. Lokale Umsetzung und Prüfung, ohne Push oder
Deploy. Keine produktiven Charakterprofile, Inventare oder Ressourcen wurden
migriert. Gespeicherte Würfel und historische Belegobjekte wurden nicht
umgeschrieben. Die Transaktionsprüfungen verwenden ausschließlich lokale
wegwerfbare Emulatorprojekte und eigene Testfiguren.

## Umfang und Ergebnis

Geprüft wurden Zustandsanlage, Quellenbesitz, Refresh, Stapelung, Verbrauch,
Beitragsanfang und -ende, Rast, Szenenzeit, explizite Tagesmarker, Auren,
Kampfende, Konzentration, Kanalisierung, Gegenstandsverbrauch, Rücknahme und
erneutes Einlesen. Dazu kamen freiwillige Aktionen, Reaktionen, freie Proben,
Rettungswürfe sowie die technischen Grenzen einer atomaren Speicherung.

Die Prüfung hat konkrete Regel-, Speicher- und Anzeigefehler gefunden und
geschlossen. Die detaillierte Bewertung von **26 Sperrgrundfamilien** steht
in der [Sperrgrundmatrix](CONTRIBUTION_BLOCKING_AUDIT_2026-11-04.md).

## Geschlossene Lücken

| Bereich | Belegter Fehler und korrigierter Vertrag |
| --- | --- |
| Kritische temporäre TP | Der Ablauf eines alten Kritmarkers konnte einen stärkeren späteren Item-, Start- oder Auravorrat löschen. Nur der tatsächlich eigene Vorrat behält diesen Ablaufbesitzer. |
| Refresh derselben Kritwirkung | Ein gleich starker Refresh konnte den alten Besitzer ersetzen und den Vorrat dauerhaft machen. Ein echter Refresh übernimmt dessen Ablaufbesitz. |
| Aura-Baseline | Beim Ausscheiden einer Aura konnten bereits abgelaufene kritische Basis-TP wiederkehren. Der Tracker berücksichtigt jetzt deren konkrete Zustandsinstanzen. |
| Speicherung von Auren | Hinzugefügte Auraquellen konnten bestehende Teilnehmer im Szenenreplay verändern, während deren persistierte temporäre TP unverändert blieben. Eintritt, Ausscheiden und Kampfende persistieren die tatsächliche Ereignisänderung atomar einschließlich Rücknahme. Aktuelle normale TP und sonstige Vorräte werden dabei nicht pauschal aus dem Replay überschrieben. |
| Rast und Beitragszähler | Eine Rast zählte teilweise als zusätzlicher Kampfbeitrag und konnte Haltungen entfernen oder Beitragsdauern kürzen. Ihre ausdrücklichen Rast- und Zeitregeln sind jetzt durchgehend maßgeblich. |
| Laufzeitprofil | Ab 60 gespeicherten Zuständen konnte ein späterer sichtbarer temporärer Effekt numerisch abgeschnitten werden. Speicherbasis und Laufzeitprojektion sind getrennt; das Speicherlimit bleibt bestehen. Attribute, Fertigkeiten, Rettungen und KI-Snapshot sehen denselben aktuellen Effekt. |
| Wiederholte Projektion | Initiative, Bewegung und Zustandslisten konnten bei erneutem Überlagern anwachsen oder alte Effekte behalten. Die aktuelle Schicht wird aus denselben gemeinsamen Gettern als Differenz berechnet; Entfernung stellt die Basis wieder her. |
| Ungültige Szenenzeit | Fehlende, leere oder boolesche Anker wurden teilweise als Mitternacht interpretiert. Nur ausdrücklich gültige Tages-/Sekundenwerte erzeugen einen mechanischen Zeitanker. Explizite Null bleibt gültig. |
| Fehlende Abschnittsdauer | `null`, leere und fehlende Werte werden konsistent mit dem vorhandenen Fünfsekundenstandard behandelt; eine ausdrücklich angegebene Dauer von 0 bleibt unmittelbar. |
| Zu kurze Rast | Der Server beachtete zuletzt gesetzte Zeitanker, aber nicht immer bereits verstrichene gewöhnliche Abschnittszeit. Die Mindestdauer baut jetzt auf der gemeinsam abgeleiteten vertrauenswürdigen Szenenuhr auf. Rückwärtsanker lassen abgelaufene Effekte nicht wieder aufleben. |
| Gemischte Tagesvorräte | Eine einzige ungestempelte Tagesressource konnte bei Rast alle bereits korrekt gestempelten Tagesvorräte und Fähigkeiten erneut auffüllen. Nachgeholte Erholung prüft jetzt den eigenen Tagesschlüssel jedes Eintrags; die Vorschau verwendet dieselbe Entscheidung. |
| Profilquelle einer Rast | Eine abweichende Figurenkennung konnte die Zustandsüberlagerung einer anderen Figur in ein falsches persistentes Rastprofil übernehmen. Rast und Zustandsverwaltung verwenden jetzt eine gemeinsame Quellenprüfung: persistente Kennung muss zur Akte passen; Szenenkreaturen benötigen ihr belegtes Instanz-/Vorlagenpaar und verändern die Vorlage nicht. |
| Handlungsunfähigkeit | Gewählte Reaktionen und freiwillige Fertigkeits-/Attributsproben konnten 0 TP oder blockierende Zustände umgehen. Sie verwenden dieselbe Erlaubnisprüfung, auch nach neuem Schaden innerhalb einer Auswertung. Passive Schutzregeln und ausdrückliche 0-TP-Ausnahmen bleiben berücksichtigt. |
| Aussetzen und Rettungen | Abwarten war ebenfalls bei 0 TP gesperrt. Es ist jetzt ein zulässiger prozeduraler Zugabschluss ohne eigenen Angriff oder Heilung. Rettungswürfe und reine Beschreibung bleiben möglich. |
| Schlaf und Stimme | Das explizite Schlafend-Preset blockiert freiwillige Handlungen und Reaktionen. `requiresVoice` bleibt bei Fähigkeiten, Techniken und Zaubern bis zur Auswertung erhalten und ist in den Detailansichten bedienbar. Freie Namensähnlichkeit erzeugt keine zusätzliche Sperre. |
| Begonnene Flächenwirkung | Eine neue eigene Betäubung konnte weitere Ziele derselben schon gestarteten Wirkung blockieren. Nur die nachweislich autoritativ begonnene Aktion darf fortgesetzt werden; ein Clientfeld oder ein neuer Abschnitt kann diese Ausnahme nicht erzeugen. |
| Größen-/Auswahlgrenzen | Überzählige Ziele oder ausgewählte Unterstützungsregeln wurden teilweise still abgeschnitten. Mehr als 20 unterschiedliche Ziele beziehungsweise ausgewählte Regeln werden jetzt mit einem konkreten Fehler vor Speicherung abgewiesen. |
| Verfügbarkeit und Zustandsvorschau | Arsenal, Composer und Kreaturendossier nennen den tatsächlichen Validatorgrund einschließlich erlaubter Bezahlalternativen. Vorschau und Absendung eines manuellen Zustands lesen dieselben Eingaben. Einmaleffekte, kritischer Nachschaden, Kontersperren und Ablauf am Beitragsbeginn werden dargestellt. |
| Magische Abwehr | Die Prozentvorgabe konnte von der tatsächlichen W20-Chance abweichen. Gemeinsame Projektion zeigt zum Beispiel 67 % Vorgabe als 65 % bei W20 ≤ 13. Ladungen, kritisches Zerbrechen und bestehende Würfelbelegpflicht bleiben erhalten. |

## Logik der Sperren

Eine fehlende Aktionsressource sperrt das entsprechende Kostenpaket, keine
bezahlbare Alternative. Entwaffnung betrifft die entsprechende Waffe und ihre
abhängigen Techniken. Eine benötigte Stimme oder ein Sinn wird nur bei einer
ausdrücklich passenden Anforderung geprüft. Geblendet, Nass und Festgesetzt
erzeugen daher keine frei erfundene Gesamtsperre.

Handlungsunfähigkeit sperrt freiwillige Handlungen und gewählte Reaktionen.
Aussetzen, erzwungene Rettung und erzählerische Beschreibung müssen weiterhin
möglich sein. Die Oberflächen bieten dafür vorhandene zulässige Bedienwege
an. Aussetzen beseitigt keine dauerhafte Krankheit und verspricht keine
zusätzliche Regeneration.

Unvollständige Auswertungen, ungültige Profilquellen, manipulierte Würfel,
veraltete Kampfstände, doppelte Buchungen und abhängige spätere Belege bleiben
begründete technische Sperren. Ein mechanischer Gesamtbeitrag wird atomar
gespeichert; eine unzulässige Teilmenge wird nicht still verworfen.

## Verifikation

Die abschließenden Ergebnisse und reproduzierbaren Protokolle werden in
`diagnostics/temporary-conditions-checkup-20261104/verification.json` geführt.

- Gemeinsame Backend-Regression: **223/223 bestanden**.
- Fach- und Oberflächenregression: **946/946 bestanden**.
- Würfeladapter und Browser-Bundle: **19/19 bestanden**.
- Emulatorprüfung: **90 unterschiedliche Transaktionsfälle bestanden**.
  84 im Gesamtlauf, vier Gesundheitsfälle und 13 im abschließenden
  Quellenprüflauf; elf Fälle des letzten Laufs überlappen den Gesamtlauf.
- Browserprüfung: Desktop 1440 px und Telefon 390 px; konkreter Sperrgrund,
  bedienbares Abwarten, Beschreibung ohne Probe, erlaubte Rettung,
  Zustandsvorschau und Stimmvoraussetzungen. Keine JavaScriptfehler oder
  horizontaler Überlauf; Quellprofil erhalten und externe Schreibzugriffe
  blockiert.
- **289/289 erzeugte Servermodule** stimmen per SHA-256 mit ihren Browserquellen
  überein; Ergebnis in `mechanics-parity.json`.

Damit sind **1.278 unterschiedliche automatisierte Prüffälle** bestanden.
Gezielte Vorläufe sind Teilmengen und werden nicht zusätzlich gezählt.
Der letzte Quellenabgleich wurde unabhängig geprüft. Beide eigenen Emulatoren
sind nach Abschluss beendet; fremde Prozesse wurden nicht berührt.

## Detailberichte und Grenzen

- [Lebenszyklus und Wechselwirkungen](TEMPORARY_CONDITION_LIFECYCLE_2026-11-04.md)
- [Sperrgründe und Fortsetzungsvertrauen](CONTRIBUTION_BLOCKING_AUDIT_2026-11-04.md)
- [Interfaces und Browserbelege](TEMPORARY_CONDITION_INTERFACE_AUDIT_2026-11-04.md)

Die Regressionen prüfen konkrete Kombinationen und Grenzfälle. Beliebiger
künftiger Freitext erzeugt keine Spielregel. Aufwecken, Befreien und ähnliche
quellabhängige Sonderfälle benötigen weiterhin eine ausdrücklich strukturierte
Wirkung oder eine bewusste Spielleiterentscheidung. Die Prüfung behauptet keine
vollständige Aufzählung aller künftig erfindbaren Sonderregeln. Reale Uhrzeit,
Kalenderbeschriftung und historische Importbelege erzeugen keine heimliche
zusätzliche Erholung; bestehende explizite Tagesmarker behalten ihre Bedeutung.
