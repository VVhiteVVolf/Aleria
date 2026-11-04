# Temporäre Zustände: Lebenszyklus und Wechselwirkungen

Prüfstand 4. November 2026, lokal. Keine Produktivdaten, gespeicherten Würfel,
Inventare oder historischen Belege wurden verändert. Der gemeinsame Sync der
Servermechanik und die anschließende Gesamtprüfung werden zentral ausgeführt.

## Geschlossene Fehler

### Ein alter kritischer TP-Vorrat löschte stärkere neue TP

`criticalTemporaryOwned` gehörte zu einem bestimmten zeitlich begrenzten Vorrat.
Ein späterer Gegenstand, Kampfstart oder eine Aura konnte mehr temporäre TP
vergeben, ohne dieses Eigentum abzugeben. Beim Ende des alten Kritmarkers
wurde deshalb der neue höhere Vorrat ebenfalls auf null gesetzt.

Die gemeinsame Lebenszyklusfunktion erkennt nun einen tatsächlich erhöhten
autoritativen Vorrat und löst nur das Eigentum bereits vorher vorhandener
Kritmarker. Neu protokollierte Kritwirkungen behalten ihr eigenes Eigentum.
Der Übergang wird für Actor-/Target-Snapshots, Inventarverwendung, eigene
Kampfstarteffekte und Auren verwendet. Inventarverwendung protokolliert den
Metadatenwechsel zusätzlich in ihrem Condition-Snapshot; dadurch stimmen
Browser-Replay und die abschließende Servertransaktion überein.

Aktuelle TP, Würfelergebnisse und die Werte bestehender Belege bleiben gleich.
Gleiche oder kleinere neue Angebote werden weiterhin nicht addiert.

### Gleiche Kritwirkung konnte durch Refresh dauerhaft werden

Ein zweiter gleich starker Kritvorrat erhöhte den bestehenden Vorrat nicht.
Sein neuer Marker erhielt deshalb `criticalTemporaryOwned: false`, ersetzte
jedoch den alten Marker mit `true`. Damit fehlte anschließend der Ablaufbesitzer.

Ein echter Refresh derselben vorhandenen Quelle übernimmt nun deren Eigentum.
Stärkere andere Kritvorräte geben das alte Eigentum ab und besitzen ihren eigenen
Ablauf. Die Identifikation einer ersetzten Quelle liegt gemeinsam in
`replacesRuntimeCondition`; Refresh und Eigentumsübernahme besitzen keine
unabhängigen Kopien dieser Regel.

### Eine Aura konnte abgelaufene kritische Basis-TP wiederherstellen

Der Aura-Tracker bewahrt einen vorher bestehenden, nicht additiven Vorrat als
Baseline. Stammen diese Basis-TP aus einem Kritmarker, musste dessen Ablauf
auch hinter einer stärkeren Aura berücksichtigt werden. Andernfalls konnte
beim späteren Ausscheiden der Auraquelle ein bereits abgelaufener Vorrat
wieder auftauchen.

Der Tracker kann jetzt ausdrücklich `baselineCriticalConditionIds` führen.
Ablauf und gezieltes Entfernen dieser Marker lösen deren Baselinebesitz, ohne
den aktuell stärkeren Auravorrat zu löschen. Ein Refresh überträgt die
Verknüpfung auf die neue Instanzkennung. Die bestehenden Tracker ohne dieses
optionale Feld behalten ihre bisherige Interpretation; es wird keine neue
Herkunft aus Zahlen geraten.

### Rast war teilweise ein gewöhnlicher Beitrag

Der kritische Lebenszyklus schloss Rast aus, der allgemeine Beitragsbeginn und
die gewöhnliche Daueruhr taten dies dagegen nicht. Ein Rastbeleg konnte somit
einen szenenbeitragsgebundenen Effekt kürzen oder eine Start-Haltung entfernen,
obwohl die Rast ihre eigenen ausdrücklichen Regeln besitzt.

`sceneRest` wird jetzt durch diese beiden Beitragshelfer einheitlich ausgelassen.
Die tatsächliche Rastwirkung, ihre Uhren, Erholung und ausdrücklich an eine Rast
gebundenen Abläufe bleiben beim vorhandenen Rastmodul. Eine Rast ist kein
zusätzlicher Kampfbeitrag.

## Geprüfte Lebenszyklen

| Struktur | Erwartete Verantwortung und geprüfter Vertrag |
| --- | --- |
| `actor-comments` | Nur der tatsächliche eigene Gesamtbeitrag kürzt die Dauer; mehrere Segmente und Ziele zählen einmal. |
| `scene-comments` | Gewöhnliche Szenenbeiträge kürzen die Dauer; administrative Status-, Release-, Kampf- und Rastbelege verbrauchen keinen zusätzlichen Beitrag. |
| `expiresAt: actor-start` | Die eigene nächste Beitragseröffnung entfernt die Haltung; fremde Beiträge und ein Beitragsschluss nicht. |
| Neu während eines Beitrags | Neue Instanzen erhalten ihre volle Restdauer; sie gehören nicht zur vor dem Beitrag aufgenommenen Ablaufmenge. |
| Refresh | Gleiche Effektquelle desselben Urhebers wird ersetzt; unabhängige Urheber bleiben getrennt. Explizite Stellungsgruppen bleiben gegenseitig ausschließend. |
| Einmalige Angriffs-/Aktionswirkungen | Verbrauch bezieht sich auf den tatsächlichen passenden Wurf beziehungsweise die Kampfaktion; automatische Selbsthaltungen verbrauchen keinen Angriffsvorteil. |
| Hauptaktionssperre | Eine bereits bestehende Sperre wird nicht verlängert; nach Ablauf gilt eine vollständige eigene Beitragsdauer Handlungssicherheit. |
| Kritische Nachwirkung | Periodischer TP-Verlust tickt einmal am Anfang des ganzen eigenen Beitrags, auch bei Rede; keine Doppelzählung durch Teilsegmente oder Ziele. |
| Kritischer TP-Vorrat | Maximum statt Summe; begrenzter Besitzer, korrekter Refresh und Freigabe bei stärkeren neuen Quellen. |
| Auren | Teilnahme-, Quellen- und Kampfende-Verwaltung bleibt beim Begegnungsmodul; abgelaufene Kritbaselines leben nicht wieder auf. |
| Konzentration | Besitzer und Instanz stimmen überein; Ersatz oder Ende entfernt nur die zugehörigen Wirkungen. Unbekannte ältere Besitzer werden nicht frei erfunden. |
| Kanalisierung | Der tatsächliche Kanalisierungszustand bleibt in seinen autoritativen Snapshots; Unterbrechungs-/Kampfendeprüfungen bleiben unverändert. |
| Kurze/lange Rast | Nur die ausdrücklich passende Rastbindung endet; gespeicherte dauerhafte Leiden sind keine temporären Rastzustände. |
| Szenentag | Der bestehende ausdrücklich dokumentierte Tagesmarker bleibt maßgeblich; keine Umnummerierung historischer Tages- oder Erholungsschlüssel. |
| Szenenzeit | Eigene Prüfung der Hauptarbeit: keine reale Uhrzeit und kein geratenes Fortschreiten aus bloßem Darstellungstext. |
| Rücknahme und Wiedereinlesen | Die Zustände werden aus den gespeicherten Snapshots und Regeln abgeleitet; die Prüfung verändert die Receiptobjekte nicht. |

Eine weitere reproduzierte Lücke wurde an die Hauptprüfung übergeben: Die
Speichersanitierung begrenzte `conditions` auf 60 und wurde nochmals über das
zusammengeführte permanente und temporäre Laufzeitprofil gelegt. Ein späterer
sichtbarer Buff konnte dadurch numerisch verschwinden. Die Hauptprüfung besitzt
die gezielte Trennung von Speicherbasis und Laufzeitprojektion.

## Regressionen

Der begrenzte gemeinsame Lauf besteht mit **175/175 Tests**:

```powershell
$conditionTests = Get-ChildItem tests -Filter '*.test.mjs' |
  Where-Object { $_.Name -match '^(combat-(condition|temporary|critical|encounter|status|defense|rules-release|state-attributes|post-audit|checkup)|scene-rest|berserk-runtime|inventory-use-model|item-use-definitions|health-substances)' } |
  ForEach-Object { $_.FullName }
node --test --experimental-test-isolation=none @conditionTests
```

Beleg: `diagnostics/condition-lifecycle-20261104/tests.txt`.
Neue Verträge: `combat-condition-lifecycle-contract.test.mjs` und
`combat-temporary-ownership.test.mjs`. Sie prüfen unter anderem aktuelle TP,
Quellobjekt-Unveränderlichkeit, stärkere Inventar-/Kampfstart-/Aura-TP,
Refresh hinter einer Aura, explizite Entfernung, Ablauf, mehrere Segmente und
Ziele, Rastverwaltung, Hauptaktionsschutz sowie Konzentrationsbesitzer.

Die Tests prüfen konkrete Kombinationen und Grenzfälle. Sie behaupten keine
vollständige Aufzählung jeder künftig frei formulierbaren Sonderwirkung.
Automatik folgt weiterhin strukturierter Mechanik und ihren dokumentierten
Uhren; Beschreibungstexte erzeugen keine zusätzliche Wirkung.
