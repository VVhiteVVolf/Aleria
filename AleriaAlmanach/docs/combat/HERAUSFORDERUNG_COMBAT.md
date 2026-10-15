# Herausforderungen im Kampf

Jede Herausforderung kann ein optionales öffentliches **Szenenbild** enthalten. Im Abschnitt „Die sichtbare Situation → Szenenbild“ einen direkten Bildlink (oder vorhandenen Projektpfad), Format, vollständige Anzeige/Zuschnitt, Bildbeschreibung und optionale Unterschrift wählen. Originalformat, 16:9, 3:2, 4:3, 1:1, 2:3, 9:16 und 21:9 sind verfügbar. Standardmäßig bleibt das vollständige Bild sichtbar; ein Klick öffnet das Original. Die öffentliche Vorschau und die veröffentlichte Karte verwenden dieselbe Darstellung. Ein nicht ladbares Bild zeigt einen Ersatzhinweis und blockiert keine Versuche. Alte Herausforderungen bleiben ohne Bildrahmen. Bilder, Alttext und Unterschrift dürfen keine verdeckte Lösung enthalten.

KI-Vorlage und Entwurfsaustausch enthalten `sceneImage: { url, alt, caption, format, fit }` beziehungsweise `null`. Die Vorlage beschreibt alle erlaubten Bildformate und weist die KI an, nur bereitgestellte Bilder zu verwenden. `format: "original"` erhält die Proportionen; bei anderen Formaten bedeutet `fit: "contain"` vollständige Anzeige und `fit: "cover"` Zuschnitt. Bilddateien werden über ihre Quelle referenziert, nicht in die JSON-Datei eingebettet. Browser und Server prüfen dieselbe Bildkonfiguration.

Die Zielgruppe bestimmt, wer eine Herausforderung versuchen darf:

- **Alle Szenenteilnehmer:** Auch Zuschauer können einen Lösungsweg versuchen.
- **Nur Teilnehmer des aktiven Kampfes:** Nur aktuell aktive Kämpfer dürfen würfeln. Die Herausforderung gehört zu genau diesem Kampf.
- **Bestimmte Figuren:** Eine oder mehrere reale Figuren auswählen. Andere Figuren dürfen diesen Ansatz nicht versuchen.

Die Zielgruppe ist unabhängig vom **Empfänger** einer Wirkung. Ein Versuch von Ylva kann beispielsweise einen Buff für Ylva oder einen Debuff für Gais auslösen. Standardempfänger ist die versuchende Figur. Andere Empfänger müssen aktive Teilnehmer des aktuellen Kampfes sein.

**Versuchen** öffnet zuerst die Fertigkeitsauswahl. Dort erscheinen alle passenden Fertigkeiten des gewählten Lösungswegs mit ihren Icons und dem Ansatzbonus. Ein Klick auf eine Fertigkeit öffnet den Beitragseditor mit genau dieser Fertigkeit und der zugehörigen Beitragsart. Auch bei nur einer passenden Fertigkeit bleibt die Wahl ausdrücklich. Erst **Eintragen** würfelt. Abbrechen verändert den vorhandenen Entwurf nicht; eine erfolgreiche Auswahl übernimmt ihn und ergänzt den Versuch. Vor der Übergabe werden Szene, verfügbare Fertigkeiten, Kampfbindung und bereits gelöste Ansätze erneut geprüft.

Bei Erfolg, knappem Scheitern und deutlichem Scheitern lassen sich eigene Wirkungspakete vorbereiten. Erfolg vergibt Gegenstände aus dem Handelsregister, Kupfertaler sowie Kampfzustände und direkte Wirkungen. Fehlschlagsfolgen verwenden Zustände und direkte Wirkungen. Ein Erfolg vergibt sein Paket einmal pro Ansatz; Folgen eines Fehlschlags gelten einmal pro Figur, Ansatz und Ergebnisstufe. Kritischer Fertigkeitserfolg verdoppelt die Wirkungen nicht.

## Verfügbare Kampfmechanik

- Buffs, Debuffs und Zustände mit den vorhandenen Vorlagen, Boni/Mali, Vorteil/Nachteil und Zustandsuhren.
- Schaden mit Schadensart und Kennzeichnung als magischer Schaden. Rüstung, Resistenzen, Immunitäten, Schutz und temporäre TP verwenden die gemeinsame Schadenslogik.
- Heilung bis zum tatsächlichen TP-Maximum.
- Temporäre TP: Der höhere Wert gilt, die Werte werden nicht addiert.
- Ressourcen auffüllen bis zum Maximum oder entziehen bis null. Die vorhandenen Ressourcen werden mit ihren Namen angeboten; Maxima ändern sich nicht.
- Einen konkreten aktiven Zustand entfernen. Kampfaura-Zustände bleiben in der Zuständigkeit der Kampfliste.

Schaden, Heilung und temporäre TP erlauben einen festen Betrag oder eine Würfelformel wie `1W6+2`. Würfelbelege werden getrennt gespeichert und serverseitig geprüft. Schaden löst die vorhandene Konzentrationsprüfung aus; bei Konzentrationsverlust werden auch verknüpfte Wirkungen auf anderen Figuren entfernt. Niederlage beendet Konzentration und Kanalisierung, auch wenn eine nachfolgende Wirkung wieder heilt.

Ein Buff **vor** einem Angriff im selben Beitrag beeinflusst diesen Angriff. Ein Buff **danach** beeinflusst kommende Handlungen. Browser, serverseitige Transaktion und Wiederanzeige des Verlaufs verwenden dieselbe Segmentreihenfolge. Vergabebeiträge verkürzen die Laufzeit neu vergebener Zustände nicht.

„An diesen aktiven Kampf binden“ beendet die Versuchsmöglichkeit mit diesem Kampf. Die Bindung ist bei der Kampfteilnehmer-Zielgruppe, fremden Wirkungsempfängern und einer Dauer bis Kampfende erforderlich. Der Server setzt die tatsächliche Kampfkennung. Eine Herausforderung kann dadurch nicht versehentlich im nächsten Kampf benutzt werden.

Der Verlauf zeigt Empfänger, Würfelbelege, angewandte Werte und Belohnungen. Die Abschlussbilanz zählt Herausforderung-Wirkungen zusätzlich zu den regulären Angriffen. Gespeicherte frühere Würfe werden nicht neu ausgewertet. Beiträge mit Fertigkeitsansprüchen bleiben durch die vorhandene Rücknahmesperre geschützt.

## KI-Austausch

**KI-Vorlage + Anleitung** enthält eine leere Herausforderung, die Syntax, den geladenen Handelsregisterkatalog sowie Figuren und den aktuellen Kampf mit verfügbaren Ressourcen und Zuständen. **Entwurf exportieren** erhält Zielgruppe und Wirkungen. Import prüft die Syntax, Registerreferenzen und Empfänger und lädt einen Entwurf zur Prüfung. Die Veröffentlichung erfolgt anschließend über den bestehenden Veröffentlichungsbutton.

Die genaue Syntax steht vollständig in der exportierten JSON-Vorlage. Neue Felder sind `audience`, `combatBound`, `targetActorId` und `combatEffects`; bestehende Exporte ohne diese Felder bleiben verwendbar. `combatContext.encounterId` wird beim Austausch entfernt und bei der Veröffentlichung vom Server bestimmt.

## Verantwortlichkeiten

Die Herausforderung-Module besitzen Autorendialog, Zielgruppe, Austausch und Wirkungspakete. Kampfmodule besitzen Schadensrechnung, HP, Ressourcen, Zustandsuhren und Konzentration. Die Servermechanik prüft Herkunft, aktive Empfänger und Rollen und verbindet sämtliche Änderungen mit der bestehenden atomaren Inventar-/Kampftransaktion. `herausforderung-combat-snapshots.js` ist ein reiner Zustandsprojektor ohne DOM oder Firebase.

## Prüfung vom 14. Oktober 2026

Siehe [Testbericht](../testing/herausforderung-combat-2026-10-14/report.json). Die Ylva–Gais-Szene wurde ausschließlich gelesen und als Kopie im lokalen Firestore-Emulator getestet. Die Beispielherausforderung wurde nicht online angelegt.

Die beiden Integrationstests laufen ausschließlich mit `FIRESTORE_EMULATOR_HOST=127.0.0.1:8186` und `GCLOUD_PROJECT=demo-aleria-herausforderung`. Der Duelltest und die Kampf-Browserprüfung erwarten die separat vorbereiteten privaten Lesekopien `active-duel-readonly.json` und `duel-profiles-readonly.json` unter `.codex-temp/herausforderung`; diese gehören nicht zur Veröffentlichung. Die normalen Unit- und Backend-Tests benötigen keine Live-Verbindung.


## Ergebnisstaffeln und einmalige Angriffseffekte (15. Oktober 2026)

Schema 6 ergänzt pro Ansatz eine optionale `outcomeTable` mit drei bis zehn Stufen: `{ id, label, natural, minimumTotal, text, success, benefits }`. Natürliche 20 und 1 wählen ausschließlich ihre kritische Stufe; sonst zählt die höchste erreichte Gesamtwert-Schwelle. Eine nichtkritische Auffangstufe mit `minimumTotal: null` deckt niedrigere Werte ab. Grenzen und Ergebnis-IDs müssen eindeutig sein. Jede Stufe verwendet die bestehende Belohnungssyntax; Geld und Gegenstände sind nur bei `success: true` zulässig. Alte Herausforderungen ohne Staffel behalten ihre bisherige Auswertung. Die normale SG wird aus der niedrigsten regulären Erfolgsstufe abgeleitet.

`attemptLimit: 1` begrenzt einen Lösungsweg auf genau eine Probe, unabhängig vom Ergebnis. Ein zusätzlicher atomarer Anspruch in `herausforderung_attempt_claims` verhindert erneutes Würfeln, auch bei wirkungslosen Ergebnissen und konkurrierenden Beiträgen. Nur die gewählte Stufe wird aufgedeckt und angewendet. Die öffentliche Karte enthält vor der Probe keine Ergebnistexte. Import/Export erhält alle Stufen, Bild und Verbrauchsregeln; der Autorendialog zeigt jede Stufe und erlaubt Änderungen an Bezeichnung, Schwelle und Ergebnistext. Wirkungsdefinitionen bleiben beim Bearbeiten erhalten.

Wahrnehmung (`perception`) ist eine ausdrückliche Wahl für Gedanken/Fertigkeitsversuche und verwendet den echten WE-Wert und die Ausbildung aus dem Figurenbogen. Motiv erkennen und Nachforschungen bleiben eigene Alternativen; die Wahl löst genau eine Probe aus.

Effekte können `usage: { scope: "attack" | "action", actorId }` verwenden. Angriff gilt nur für den nächsten einzelnen Angriffswurf. Kampfaktion umfasst die gesamte ausgewertete Handlung einschließlich Folgeangriffen und weiterer Ziele derselben Handlung. `actorId` legt fest, wessen Angriff den Effekt auslöst. Ein defensiver Effekt kann dadurch nur gegen Ylvas nächste Handlung gelten. Unterstützt werden Angriff, RK und Angriffswurfart. Solche Boni werden kontextbezogen berechnet und erhöhen keine globalen Profilwerte. Verbrauch erfolgt auch beim Verfehlen, nie durch Rede, Heilung, automatische Wirkungen, Selbsthaltungen oder Rettungswurfaktionen. Zustands-Snapshots sichern denselben Verbrauch im Browser, in der Servertransaktion und im späteren Verlauf. Bestehende Zustandsuhren sind zusätzliche Ablaufgrenzen.

Die vereinbarte Ylva–Gais-Staffel: natürliche 20 → Vorteil bis einschließlich übernächstem eigenem Beitrag; ab 18 → Vorteil nächste Kampfaktion; 15–17 → +1 nächster Angriff; 12–14 → keine Wirkung; 5–11 → Gais +1 RK nur gegen Ylvas nächste Kampfaktion; unter 5 → Nachteil nächster Angriff; natürliche 1 → Gais +1 RK bis Kampfende und ausdrücklich falsche Deutung. Stufen werden nicht kombiniert. Vergabebeiträge zählen nicht gegen die Laufzeit. Einmalige Vorteile/Mali für Ylva enden spätestens am Ende ihres nächsten eigenen Beitrags.

Die Szene verwendet das am 15. Oktober mit dem eingebauten Imagegen-Werkzeug erstellte Breitbild `public/assets/herausforderung/ylva-gais-zug-lesen-v1.png` (21:9, vollständige Anzeige). Prompt: Tales of Xillia/Frieren, klare Anime-Lineart und Cel-Shading; Ylva von hinten mit Dornwacht, Gais auf dem Trainingsplatz in Bereitschaft mit seiner Reiterlanze, diagonaler Schnitt auf Ylvas prüfende Augen; vorhandene Porträts und Waffen als Identitätsreferenzen, ohne Text oder Vorwegnahme des Angriffs.
