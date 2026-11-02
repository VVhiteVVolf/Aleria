# Dauerhafte Leiden, Arkanistenfieber und Rauschmittel

Abgeschlossen am 2. November 2026. Autorisierung: „Plan und direkt umsetzen“,
ergänzt um ausdrücklich neu generierte Icons. Lokal umgesetzt und geprüft;
kein Commit, Push, Deploy oder Zugriff auf persönliche Produktivbestände.

## Ergebnis

| Ergänzung | Anzahl | Verwendung |
| --- | ---: | --- |
| Dauerhafte Leiden und Beeinträchtigungen | 30 | Charaktermerkmale; keine Entfernung durch TP-Heilung oder Rast |
| Arkanistenfieber | 10 | Anzeichen, erste Symptome sowie I–IV für Menschen und Druiden |
| Abhängigkeit | 9 | Alkohol, Kriss und Smaragdflux in je drei Stadien |
| Substanztoleranz | 3 | Stoff in Klammern; doppelte Rauschschwelle |
| Zeitgebundene Zustände | 5 | Betrunken, Kriss-, Smaragdflux-, Blutstaub-Rausch und Verkatert |
| Eigene neue Comicicons | 57 | Jeweils ein eigenes PNG und eine kleine WebP-Fassung |
| Geprüfte Item-Wirkprofile | 172 | Vorhandene öffentliche Angebote und ihre tatsächlichen Gebinde |

Der gesamte Entwicklungskatalog enthält jetzt 178 Traits. Beide Assistenten
besitzen vier zusätzliche Filter. Ein neu gewähltes Stadium ersetzt in der
Auswahl die vorherige Ausprägung derselben Gruppe; importierte Mehrfachstadien
wirken und zählen nur mit der stärksten aktiven Ausprägung.

Vollständige Merkmale, Punkte, Wirkungen und Quellen:
[Regel- und Umsetzungsplan](../../AleriaAlmanach/docs/health/HEALTH_AND_SUBSTANCES_2026-11-02.md).
Alle Mengen und die Unterscheidung zwischen belegter Stärke und ergänzter
Spielvorgabe stehen im [Gebindeabgleich](../../AleriaAlmanach/docs/health/DRINK_EXPOSURE_AUDIT.md).

## Tatsächliche Übergänge

Alkohol sammelt innerhalb eines festen einstündigen Szenenfensters Belastung.
Die Grundschwelle beträgt 4,8; eine Portion zählt mit ml × Alkoholprozent / 1.000.
Fünf Becher à 200 ml bei 5 % oder drei Gläser à 40 ml bei 40 % erreichen sie.
Ein 500-ml-Krug bei 5 % zählt 2,5 Punkte; ein 50-Liter-Fass 250 Punkte.
Das verbrauchte Exemplar und seine tatsächliche Menge entscheiden.

Betrunken dauert je nach Belastung 1–3 Szenenstunden. Kriss und Blutstaub
verwenden 60/120/180, Smaragdflux 30/60/90 Szenenminuten. Anschließend entstehen
60/120/180 Minuten Verkatert. Die Nachwirkung berücksichtigt die volle Belastung;
Toleranz halbiert sie nicht. Passender erneuter Rausch unterdrückt seinen Kater;
eine kleine Dosis unterhalb der Rauschschwelle genügt dafür nicht.

Nur der passende aktive Rausch setzt die Entzugsabzüge aus. Der dauerhafte
Abhängigkeitseintrag bleibt erhalten und wirkt beim Kater wieder. Andere
Rauschmittel können diesen Entzug nicht ersetzen. Die Boni und Mali aller
Rauschzustände werden tatsächlich in Proben, Rettungswürfen, Kampfwerten,
Vorschau und Zustandsanzeige berücksichtigt; Vorräte werden nicht aufgefüllt.

Die Uhr verwendet vertrauenswürdige Szenenanker und Abschnittsdauern. Ein
Zeitsprung kann Rausch und den gesamten Kater überspringen; Laden startet die
Nachwirkung nicht neu. Rückwärts gesetzte Uhrzeiten beleben abgelaufene Zustände
nicht wieder. Ohne gesetzte Szenenzeit wird Konsum vor der Bestandsänderung
abgewiesen. Diese Zustände bleiben an ihre Szene gebunden.

## Quellen, Balance und bewusste Grenzen

Das vorhandene Arkanistenfieber-Modul bleibt maßgeblich: vier Hauptstadien,
bei Druiden geistiger Verfall ohne Nekrose. Die frühe arkane Verstärkung endet
mit den Hauptstadien; deren Nachteile wachsen. Stadium IV verhindert
selbstbestimmte Kampfhandlungen, Abwarten bleibt möglich. Es werden weder
unbelegte Krankheitsfristen noch eine automatische Ghoul-Verwandlung erfunden.
Diagnose und Stadiumswechsel bleiben bewusste Entscheidungen.

Kriss, Smaragdflux und Blutstaub wurden mit Alchemisten- und Schwarzmarktquellen
abgeglichen. Organschäden und Fieberrisiko bleiben ausdrücklich Risiken;
ein einzelner Konsum vergibt nicht heimlich neue Krankheiten oder Abhängigkeit.
Fehlende Alkoholstärken sind markierte Spielvorgaben. Unverknüpfte Altitems
benötigen eine passende Definition; Namen allein lösen keine Wirkungen aus.

Blindheit und Taubheit sperren ausdrücklich entsprechend gekennzeichnete
Sinnesaufgaben. Geeignete andere Vorgehensweisen bleiben offen. Handverlust
begrenzt tatsächlich zweihändige Waffenführung; Ausrüstung wird nicht heimlich
entfernt. Gelähmte Beine begrenzen ausdrücklich das Gehen statt einen extremen
Zahlenmalus zu verwenden. Hilfsmittel und alternative Bewegungsarten benötigen
eine eigene Ausarbeitung. Stummheit gibt keinen pauschalen Persönlichkeitsmalus.

Bluterleiden verstärkt keine festen historischen Kritfolgen. Resistenz-,
Aktions-, Ressourcen- und Klassenregeln bleiben bei ihren gemeinsamen Quellen.
Es gibt keine neuen automatischen Itempakete oder Attacken durch Klassenwahl.
Balancepunkte bleiben Orientierung und dürfen negativ sein.

## Architektur und behobene Schnittstellen

`modules/character-health/` besitzt Katalog, Auswahlregeln, Stoffprofile,
Zuordnungen, Vorschau und Übergänge. Die reine Szenenuhr liegt unter
`modules/scene-time/scene-condition-clock.js`. Firebase-Schreibzugriffe bleiben
bei den bestehenden Transaktionen. Browser und Server verwenden dieselben
Regelquellen; 252 generierte Servermodule wurden schreibfrei bytegenau verglichen.

Zusätzlich geprüft und korrigiert wurden die Unterdrückung der Entzugsabzüge in
abgeleiteten Werten, gezielte Fertigkeits- und Rettungswurfmodifikatoren in der
Anzeige, Erhaltung des Sinneswegs an allen Beitragsgrenzen und Zeitfortschritt
zwischen mehreren Abschnitten desselben Beitrags. Rast-Snapshots stellen keine
bereits abgelaufenen Wirkungen wieder her.

Die große Prüfung deckte zwei verbleibende Kompatibilitätsstellen auf:
der bisherige Icon-Test nahm ausschließlich relative alte Bildpfade an, und die
allgemeinere Handlungssperre verlor die konkrete Betäubungsbezeichnung.
Der Test unterstützt jetzt beide Pfadformen; die Meldung nennt bei Betäubung
weiterhin Betäubung und bei anderen Sperren deren tatsächlichen Zustand.

Das Zustandsfenster lässt bei den festen Rauschvorlagen nur deren Dauer ändern.
Die Vorschau zeigt die gewählten Szenenminuten und die tatsächliche Quelle.
Eigene allgemeine Zustände bleiben frei bearbeitbar. Es wurden keine neuen
Inline-Handler, globalen Zustände oder unabhängigen Firebase-Zugriffe eingeführt.

## Neue Bilder

Alle 57 Bilder wurden mit dem eingebauten Bildgenerator neu erzeugt. Die zuvor
verwendeten Baldur’s-Gate- und alten Trait-Zuordnungen sind aus diesem neuen
Gesundheitsfeature entfernt. Die bestehenden übrigen Zustandsvorlagen behalten
ihre bisherigen Bilder. Die hochaufgelösten Originale liegen gemeinsam unter
`AleriaAlmanach/assets/development-traits/`, die WebP-Fassungen unter `web/`.
Alle 57 Originalhashes sind verschieden; die Webfassungen umfassen zusammen
rund 0,8 MB. Originale und frühere Kandidaten wurden erhalten.

- [Gesamte Bildübersicht](health-traits-preflight-contact.jpg)
- [Aufträge mit Original- und Korrekturprompts](health-traits-image-jobs.json)
- [Originalhashes und Webableitungen](health-traits-art-receipt.json)
- [Quadratformat, Alphakanal und vier transparente Ecken](art-preflight.json)

Die gesamte Kontaktübersicht und die tatsächliche Desktop-/Mobilanzeige wurden
angesehen. Zwei Randkorrekturen erfolgten über den Bildgenerator; Python diente
der Prüfung, Kontaktübersicht und vorhandenen Webableitung, nicht der Bildretusche.

## Prüfungen

| Prüfung | Ergebnis | Beleg |
| --- | --- | --- |
| Gesamter Frontendbestand einschließlich 20 Gesundheitstests | 2.167 bestanden | [Protokoll](frontend-tests-verified.txt) |
| Gesamter Serverbestand | 330 bestanden | [Protokoll](backend-tests-verified.txt) |
| Lokale Speichertests im fest gesperrten Firestore-Demoprojekt | 3 bestanden | [Protokoll](integration-tests-final.txt) |
| Zustands-, Troll- und Gesundheitskompatibilität | 36 bestanden | [Protokoll](compatibility-tests-final.txt) |
| Release- und Buildauswahl | 26 bestanden | [Protokoll](release-tests-final.txt) |
| Browser: 52 Merkmale, fünf Zustände, Stadienwechsel, feste Vorlagen | bestanden | [Bericht](browser-reviewed/report.json) |
| Browser: vollständige Starthilfe, mehrere Klassen, manuelle Fertigkeiten, keine Itemvergabe | bestanden | [Bericht](setup-browser/report.json) |
| Gemeinsame Serverquellen | 252 identisch | [Abgleich](server-parity.json) |
| Abhängigkeiten der Gameplay-Prüfung | 1.549 Module erfasst | [Beleg](input-coverage.txt) |
| Aktueller lokaler Vite-Build | bestanden | [Protokoll](build-ui-final.txt) |

Die Browser blockierten sämtliche externen Schreibzugriffe. Die sichtbare
Sync-Warnung in den lokalen Ansichten stammt von dieser gesperrten
Online-Verbindung. Die drei Speichertests verwendeten ausschließlich
127.0.0.1:8182 und das feste Demo-Projekt; der Emulator wurde danach beendet.
Der Build meldet die bereits vorhandenen Hinweise zum nativen Konfigurationsladen
und zu großen Paketen. Dieser Auftrag verändert keine Hosting-Konfiguration,
Rules oder Indizes und benötigt keine neue Datenbankabfrage.
