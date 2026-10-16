"""Produce a bounded report from observed logs and synthetic model tests."""
from collections import Counter
from pathlib import Path
import json
import statistics

ROOT=Path(__file__).parent
requests=json.loads((ROOT/'request-audit.json').read_text(encoding='utf-8'))
tests=json.loads((ROOT/'benchmark-results.json').read_text(encoding='utf-8'))
summary=[]
for model in dict.fromkeys(r['requested_model'] for r in tests):
    rows=[r for r in tests if r['requested_model']==model]
    successes=[r for r in rows if 'error' not in r]
    summary.append({'model':model,'requests':len(rows),'received_answers':len(successes),
                    'passed_format_and_intent_checks':sum(r['pass'] for r in rows),
                    'api_errors':len(rows)-len(successes),
                    'median_answer_seconds':round(statistics.median(r['seconds'] for r in successes),2),
                    'reported_usd_cost':sum((r.get('usage') or {}).get('cost',0) or 0 for r in rows),
                    'providers':dict(Counter(r.get('provider') for r in successes))})
cost=sum(r['reported_usd_cost'] for r in summary)
result={'date':'2026-10-15','profile':'Nolvus Awakening - SkyrimNet Beta25 Test',
        'live_configuration_changed':False,'game_execution_tested':False,
        'models':summary,'total_reported_usd_cost':cost,
        'interpretation':'Small synthetic output-contract test, not an in-game or long-context success-rate benchmark.'}
(ROOT/'benchmark-summary.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
lines=['SKYRIMNET: MODELLWAHL UND AUSBLEIBENDE AKTIONEN',
       'Prüfung vom 15.10.2026 – aktuelles Profil Nolvus Awakening - SkyrimNet Beta25 Test',
       '', 'ERGEBNIS',
       'Die Beobachtung wird durch lokale Logs und einen kleinen kontrollierten API-Test gestützt.',
       'DeepSeek V4 Flash 0731 erzeugt häufig Dialog ohne den erforderlichen Aktions-Footer.',
       'GLM 4.7 ist von den geprüften Nicht-Gemma-Modellen der stärkste Kandidat für einen Spieltest,',
       'kostet aber mehr. Gemma 26B A4B ist eine ebenfalls erfolgreiche Variante innerhalb derselben Familie.',
       '', 'LOKALE KONFIGURATION',
       'Standarddialog: DeepSeek V4 Flash 0731 und Gemma 4 31B in einer sequenziellen Rotation.',
       'Action Evaluation: Gemma 4 31B. embedActionsInDialogue=true.',
       'Quest-/Follower-/Händler-Dialogaktionen und die wichtigen Übergabeaktionen sind aktiviert.',
       'Die tatsächlich priorisierten Einstellungen stammen aus dem erhaltenen Runtime-Mod.',
       'Providers.yaml enthält den aktiven Zugang; das leere alte api_key-Feld in OpenRouter.yaml ist hier kein Fehler.',
       '', 'WICHTIGER ABLAUF',
       'Das Dialogmodell muss die Aktion zunächst mit einer ACTION:-Zeile anfordern.',
       'Erst bei einer entsprechenden Kategorie wird das kleinere action_evaluation-Modell aufgerufen.',
       'Ein anderes Aktionsmodell allein behebt deshalb eine fehlende Dialoganforderung nicht.',
       'Dies sind textuelle SkyrimNet-Aktionsmarker, keine gewöhnlichen API-Function-Calling-Aufrufe.',
       '', 'LOG-BEFUND',
       'Aus lokal noch zuordenbaren Anfragen/Antworten ab 07.10.2026:',
       'DeepSeek V4 Flash 0731: 1 von 206 Standardantworten mit einfacher ACTION:-Zeile;',
       'davon hatten 188 den Aktionsrubrik-Abschnitt im Input.',
       'Gemma 4 31B: 30 von 193 Standardantworten mit ACTION:-Zeile;',
       'davon hatten 180 den Aktionsrubrik-Abschnitt im Input.',
       'Diese Häufigkeiten sind KEINE Erfolgsquoten: Inhalte, NPCs und berechtigte Aktionen unterscheiden sich.',
       'Auch Antworten ohne Aktionsrubrik, etwa Einzeiler einer Erweiterung, sind in den Rohzahlen enthalten.',
       'Nicht zuordenbare rotierte Inputs wurden nicht geraten. Modellzuordnung basiert auf der protokollierten Anfrage.',
       '', 'PROMPTBEFUND',
       'Der wirksame Input enthält unbeschränkt klingende Vorgaben wie No headers or labels,',
       'Output only the in-character text und spoken words only, gefolgt von einer erlaubten ACTION:-Zeile.',
       'Diese Regeln benötigen eine explizite Trennung zwischen Sprachtext und technischem Footer.',
       'Dies ist ein plausibler Beitrag zum Problem, kein allein bewiesener Auslöser.',
       'Die getestete zusätzliche Klarstellung allein behob DeepSeeks Auszahlungsauslassung nicht.',
       'Der Konflikt steht auch im Standard-Response-Prompt; er wurde nicht allein durch persönliche Prompts erzeugt.',
       '', 'KONTROLLIERTER API-TEST',
       '40 Anfragen: fünf Modelle, vier erfundene Aufgaben, jeweils bisheriger Stil und zusätzliche Formatklarstellung.',
       'Aufgaben: 50 Gold bezahlen, Begleitung beenden, verfügbaren Questdialog auslösen, Smalltalk ohne Aktion.',
       'Temperatur 0.7; keine Wiederholungsversuche; max. 384 Ausgabetoken; Nicht-Streaming.',
       'Preisgesteuerte OpenRouter-Routen mit Preisobergrenze; die konkrete Anbieterwahl ist Teil der Testumgebung.',
       'Keine Spielprotokolle, Biografien oder realen FormIDs an die API übertragen.',
       'Geprüft: ein syntaktisch passender Footer, erwartete Kategorie/Parameter und kein Aktionsaufruf beim Smalltalk.',
       'Nicht geprüft: tatsächliche Goldrichtung/Menge in allen Intents, Ingame-Ausführung, lange Kontexte,',
       'Langzeit-Rollenspielqualität, Streaming-Parser oder Eignung für Erwachsenen-Rollenspiel.',
       'Eine einzelne Anfrage pro Kombination ist kein statistischer Zuverlässigkeitsnachweis.', '']
for row in summary:
    lines.append(f"{row['model']}: {row['passed_format_and_intent_checks']}/{row['requests']} bestanden; "
                 f"{row['api_errors']} API-Fehler; Median {row['median_answer_seconds']} s; "
                 f"gemeldete Kosten ${row['reported_usd_cost']:.8f}")
lines += ['',f'Gemeldete Gesamtkosten: ${cost:.8f}.',
          'DeepSeek ließ bei BEIDEN Auszahlungsfällen den Footer weg, obwohl es die Zahlung sprachlich bestätigte.',
          'Qwen lieferte einmal - ACTION: statt ACTION: und einmal einen unbegründeten Begleitungs-Aufruf beim Smalltalk.',
          'Zusätzlich gab es vier HTTP-429-Fehler auf den gewählten günstigen Qwen-Routen; andere Anbieter können abweichen.',
          '', 'ÖFFENTLICHE FEHLERBERICHTE',
          'Issue 706 beschreibt verlorene, in Sternchen verpackte ACTION:-Zeilen mit DeepSeek.',
          'Issue 657 beschreibt vollständig verworfene Mehrfach-Aktionsausgaben.',
          'Die zugeordneten jüngeren Dialogantworten zeigen diese beiden konkreten Muster nicht.',
          'Acht Truncated-line-Logstellen wurden gefunden. Dies allein beweist KEINEN verlorenen Befehl:',
          'am 15.10. um 00:50:36 wurde derselbe Combat-Befehl direkt danach korrekt erkannt und verarbeitet.',
          '', 'EMPFOHLENE KONFIGURATION FÜR EINEN SPIELTEST',
          'Nicht-Gemma-Alternative: GLM 4.7 ausschließlich als Dialogmodell testen; Gemma 31B für die kurze Aktionsauswahl behalten.',
          'Preisorientierte Alternative: Gemma 26B A4B als Dialogmodell testen; nicht automatisch geringere Rechnung versprechen.',
          'Im Kurztest war Gemma 31B durch die tatsächliche Route sogar leicht günstiger als Gemma 26B.',
          'Für den Vergleich nur EIN Dialogmodell wählen, damit die bestehende Rotation das Ergebnis nicht vermischt.',
          'Die Formatregeln müssen technische ACTION:-Zeilen ausdrücklich von Audio-/Sprachregeln ausnehmen.',
          'Metadaten/Erinnerungen/Hintergrundaktionen separat behandeln: IntelEngine und SeverActions verwenden weiterhin Gemma.',
          'NarrativeEngine erbt teilweise die Standardrotation. Alle Aufgaben auf GLM zu setzen wäre unnötig teuer.',
          'Erst danach im Spiel jeweils Zustand vor/nach einer Übergabe, Entlassung und Questfortsetzung nachweisen.',
          '', 'DATEN UND GRENZEN',
          'Keine Mods, persönlichen Prompts, Schlüssel, Spielstände oder Einstellungen verändert.',
          'Keine Veröffentlichung und keine Weitergabe der echten Protokolle.',
          'request-audit.json: lokale Zuordnungen und jüngere Beispiele; engine-audit.json: Engine-Befunde.',
          'benchmark-fixtures.json, benchmark-results.json, benchmark-summary.json: synthetischer Test und Auswertung.',
          'configuration-redacted.json enthält nur eine bereinigte Konfigurationskopie; model-prices.json den öffentlichen Preisabruf.',
          '', 'QUELLEN',
          'https://goncalo22.github.io/SkyrimNet-GamePlugin/Features/action-system/',
          'https://github.com/MinLL/SkyrimNet-GamePlugin/blob/main/model-presets/recommended-models.yaml',
          'https://github.com/MinLL/SkyrimNet-GamePlugin/issues/706',
          'https://github.com/MinLL/SkyrimNet-GamePlugin/issues/657',
          'https://openrouter.ai/api/v1/models',
          'https://fateless.ai/stats (Anbieter-/API-Gesundheit, kein Nachweis korrekter Spielaktionen)']
(ROOT/'PRUEFBERICHT.txt').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
