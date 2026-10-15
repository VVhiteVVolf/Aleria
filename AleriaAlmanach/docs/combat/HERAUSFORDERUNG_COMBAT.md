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
