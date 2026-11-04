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

Für eine spätere Veröffentlichung müssen Frontend, Functions, Regeln und der
neue Verkaufsindex gemeinsam durch den bestehenden öffentlichen Releaseweg.
Der bekannte Functions-Deployblocker `BILLING_DISABLED` ist durch diese lokale
Implementierung nicht aufgehoben. Es wurden keine produktiven Inventare oder
Kreaturen migriert und keine Abrechnungseinstellungen geändert.
