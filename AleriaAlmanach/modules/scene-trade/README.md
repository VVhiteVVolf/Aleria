# Szenenhandel

Lokale Umsetzung vom 4. November 2026. Der vorhandene Inventarbeutel bleibt
der einzige Einstieg in der Szene: **Quelle → Handeln · Kaufen oder verkaufen**.
Der persönliche Dialog verwaltet genau einen Händler und einen festgehaltenen
Szenenthread pro Bestellung. Andere Leser sehen nur einen kleinen,
aufklappbaren Handelsbeleg mit zwei Miniaturbildern.

## Verantwortlichkeiten

- `scene-trade-controller.js`: persönlicher Dialog, Ereignisse und asynchrone
  Lade-/Abschlussvorgänge. Keine clientseitige Inventarbuchung.
- `scene-trade-state.js`: Warenkorb, Zuordnung, Vorschau und Preisprüfung;
  `scene-trade-submission.js`: unveränderlicher Wiederholauftrag.
  Offene Abschlüsse werden vor dem Aufruf
  nach Anmeldung und Thread getrennt in `sessionStorage` gesichert.
- `scene-trade-service.js`: vorhandene Register-/Firebase-Anbindung;
  öffentliche Händler, Verfügbarkeit, Gruppenbestände und Verkaufsseiten.
- `scene-trade-view.js`: escaped Dialogdarstellung; eigene Styles in
  `styles/scene-trade.css`.
- `scene-trade-context.js`, `scene-trade-catalog.js`: vorgabebasierte
  Modul-/Händlerzuordnung und indizierte, auf 24 sichtbare Waren begrenzte Suche.
- `scene-trade-participants.js`, `scene-trade-participant-state.js`: Besetzung
  aus Modulhierarchie, Szenenbesetzung und bisherigen Beiträgen; kleine
  Identitätsreferenzen statt gespeicherter Gesprächsprotokolle.
- `scene-trade-actor-picker.js`, `scene-trade-people-manager.js`: suchbare
  Avatar-Auswahl und persönliche Ergänzungen/Ausblendungen pro Anmeldung und
  Szenenthread. Änderungen betreffen weder Figurenakten noch die kanonische
  Modulbesetzung. Geschlossene Wähler enthalten keine Archivlisten.
- `scene-trade-account-readiness.js`: nur ausgewählte Personen- und
  Gruppeninventare laden historische Definitionen; unfertige Bestände bleiben
  für Warenaktionen gesperrt.
- `scene-trade-model.js`: reine gemeinsame Buchungsregeln. Der bestehende
  Mechanics-Sync übernimmt dieselbe Quelle in die Functions.
- `scene-trade-summary.js`, `scene-trade-notification.js` und
  `scene-trade-entry.js`: kurzer Text, aufklappbarer Beleg und einzige Brücke
  zum bestehenden klassischen Szenenrenderer. Eigene Hinweisstyles in
  `styles/scene-trade-notification.css`.
- `firebase/functions/src/scene-trade/`: autorisierte Quellenauflösung,
  Szenen-/Gruppenprüfung, Transaktion und lesende Händlerprojektionen.

## Verbindliche Regeln

1. Pro Position sind Zahler und Empfänger getrennt. Direktlieferung an eine
   andere Figur bildet ein Geschenk ab. Fremde Geldbeutel benötigen weiterhin
   die bestehende Besitzberechtigung. Gruppenkassen verwenden die bestehende
   Gruppenverwaltung, Szenenverknüpfung und Mitgliederprüfung.
2. Normale Sortimentsware bleibt nachlieferbar. Endliche Altbestände werden
   durch diesen Szenenweg weder vermindert noch migriert. Ausdrücklich
   nicht verfügbare oder archivierte Angebote bleiben gesperrt.
3. `definitionKind: unique` beziehungsweise eine kanonische Unikatdefinition
   kennzeichnet ein Einzelstück. Ein Name allein erzeugt keine Einzigartigkeit.
   Der Handelskatalog-Editor erhält dafür einen ausdrücklichen Schalter bei
   unverknüpften Waren. Verknüpfte Definitionarten werden im Item-Builder
   verwaltet. Bestehender Besitz wird nicht automatisch umgestuft.
4. Normale Preise sind vorausgewählt. Ein ausdrücklich vereinbarter
   **Positionsgesamtpreis** darf davon frei abweichen. Geld wird intern in
   ganzen Eisenpfennigen gerechnet. Mengenänderungen verlangen eine erneute
   Prüfung vereinbarter Preise. Veränderte Standardpreise brechen einen alten
   Auftrag ab, statt andere Beträge als angezeigt zu buchen.
5. NPC-Händler besitzen unbegrenzte Kaufkraft über ihr Handelsjournal; ihre
   persönliche Charaktergeldbörse wird nicht verändert. Verkäufe schreiben
   dem bisherigen Besitzer den Erlös gut.
6. Geld, Waren, Unikatbindung, Tierverknüpfung, Journal und genau ein
   Szenenbeleg werden gemeinsam oder gar nicht gespeichert. Ungeklärte
   Antworten behalten dieselbe Vorgangskennung und denselben Auftragsinhalt,
   auch nach Dialogschluss oder Neuladen im selben Tab.
7. Die Ablage `item_merchant_sold` erhält das tatsächliche Objekt einschließlich
   Individualisierungen und ursprünglicher Herkunft. Teilstapel erhalten eine
   eigene Teilinstanz. Die öffentliche Liste zeigt nur freigegebene
   Darstellungsfelder und lädt ältere Verkäufe seitenweise nach.
8. Verkaufte verknüpfte Tiere bleiben dieselben Kreaturen. Die bisherige
   Konto-/Urheberzuordnung bleibt als Archivinformation erhalten; frühere
   Besitzer können verkaufte Händlerkreaturen nicht weiter bearbeiten.
9. Handelsbelege sind geschützte Buchungen. Löschen oder generisches Undo
   darf weder einen Beleg ohne Gegenbuchung entfernen noch alte Besitztümer
   wiederherstellen. Ein Rückkauf aus der Verkaufsablage ist in dieser ersten
   Version noch nicht vorgesehen.

## Schnittstelle

Der bestehende Callable `commitItemTrade` bleibt für alte Einzelkäufe und
-verkäufe kompatibel. Neu sind `checkout`, `availability` und `sold`.

`checkout` erhält Vorgangskennung, Szenenthread, Händlerkennung, bestellende
Figur, erwartete Bestandsrevisionen und höchstens 20 Positionen. Kontenschlüssel
lauten `character:<id>` oder `group:<id>`. Jede Standardpreisposition benötigt
`expectedTotalMinor`; eine ausdrückliche Vereinbarung verwendet
`priceMode: agreed` und `agreedTotalMinor`. Der Server liest Waren, Definitionen
und Besitz selbst; gesendete Warenkopien gelten nicht als Quelle.

`availability` liest globale Unikatbindungen ohne neue Definitionen oder
Bestände anzulegen. `sold` liefert bis zu 100 öffentliche Einträge pro Seite
und gegebenenfalls einen `{at,id}`-Cursor. Die vollständigen Originalsnapshots
und Transaktionsaufträge sind ausschließlich serverseitig lesbar.

## Prüfung und spätere Veröffentlichung

Fachtests: `tests/scene-trade-*.test.mjs`,
`tests/trade-catalog-unique-authoring.test.mjs` und
`firebase/functions/tests/scene-trade.test.js`. Die echten
Transaktionsprüfungen unter
`firebase/functions/tests/integration/scene-trade.integration.mjs` erlauben
ausschließlich `FIRESTORE_EMULATOR_HOST=127.0.0.1:8187` und das lokale
`demo-aleria-scene-trade`-Projekt.

Backend, Regeln und Verkaufsindex wurden mit dem öffentlichen Stand
`7ee2f8ec0e0a5a86bf276cde0c25aaf2f244c1a2` veröffentlicht. Die folgende
Fensteroptimierung ändert keine serverseitige Buchungsregel und erfordert
keine Inventarmigration. Die Abrechnung wird für diese Arbeiten nicht geändert.

## Kontext, Auswahl und Darstellung

Das aktive Modul bestimmt sein Sortiment automatisch. Fehlt ein eigenes
Register, darf nur ein eindeutiger nächster Vorfahr beziehungsweise Bereich
eine Vorgabe liefern; mehrere passende Händler verlangen eine bewusste Wahl.
Ein gefüllter Warenkorb wechselt seinen Händler nicht automatisch.

Die Vorauswahl enthält gespeicherte Figuren aus Besetzung, Hierarchie und
bisherigen Modulbeiträgen. Explizite Identitäten haben Vorrang; mehrdeutige
Namensgleiche werden nicht automatisch vermischt. Weitere Figuren lassen sich
gezielt suchen und ergänzen; bestehende Warenkorbpersonen bleiben geschützt.
Ausblendungen sind persönliche Komforteinstellungen und verleihen keine
Zahlberechtigung. Bei einer unterbrochenen Kommentaraktualisierung bleibt die
letzte bestätigte Auswahl erhalten.

Der breite Dialog trennt Angebot und Bestellung in eigene Scrollbereiche.
Warensuche aktualisiert ausschließlich die Ergebnisliste, behält Fokus und
Warenkorb und verwendet einen Cache pro unverändertem Angebotsstand. Preis-
und Personenbearbeitung werden erst bei Bedarf aufgeklappt. Mobile Ansichten
wechseln zwischen Waren und Bestellung; die Ergebnisliste bleibt paginiert.
## Öffentliche Standardmodule

Mitgelieferte Händler und Szenen müssen keinen künstlichen Online-Override
erhalten. Der Builder `scripts/build-scene-trade-builtins.mjs` liest ausschließlich
committed öffentliche Browserquellen und erzeugt eine schlanke kanonische
Projektion. Seitenpositionen und sämtliche angebotenen Artikel, Revisionen und
Preise werden gegen die bestehende Angebotsnormalisierung geprüft. Unabhängige
Biografien und Seitentexte werden nicht kopiert; die Datei wird beim Start nicht
importiert. Der Mechanik-Sync erzeugt und kopiert sie vor dem Functions-Deploy.

Aktuelle Online-Dokumente haben Vorrang. Ein fehlender, aber ausdrücklich im
Manifest erklärter Override führt zu einem Fehler statt zu alten Standardpreisen.
Versteckte oder geschlossene Szenen und eingeschränkte Bereiche bleiben gesperrt.
Das Nachschlagen legt keine Module an und ändert weder Inventare noch Szenendaten.
