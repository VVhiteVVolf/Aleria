# Gemeinsamer Reisevorrat

`mountGroupQuestAccount(root, groupId, options)` bleibt die bestehende Brücke
zur Gruppen-Landingpage. Sie delegiert an das eigene Account-Feature:

- `group-account-controller.js` besitzt Account-Abonnement, Ansicht und Mount.
- `group-account-dialog.js` besitzt die nativen Dialoge und deren Listener.
- `group-account-operations.js` bildet den Requestvertrag ab und hält einen
  unbestätigten Vorgang unverändert für eine erneute Prüfung bereit.
- `group-account-view.js` stellt Münzen und Karten dar. Regeln kommen aus
  `materializeInventoryItem` und dem gemeinsamen `inventoryCardModel`;
  verfügbare klassische Itemkarten werden direkt wiederverwendet.
- `group-account.css` wird von der Almanach-Seite geladen.

Die Münzbilder kommen aus `currency/currency-art.js`.
Diese reine Bildquelle wird sowohl im Geldbeutel als auch im Übergabedialog
verwendet. Das historische globale `CharacterInventoryMoney`-Bildmapping
überschreibt sie nicht.

| Währung | Verwendete Projektdatei | Beleg |
| --- | --- | --- |
| Goldtaler | `/AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp` | Eigene Sonnenmünze; `assets/currency/image-prompts.json`, PNG-Original erhalten |
| Silbertaler | `/AleriaAlmanach/assets/currency/aleria-silbertaler-v1.webp` | Eigene Mond-/Wellenmünze; dasselbe Manifest, PNG-Original erhalten |
| Kupfertaler | `/AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png` | Eigene neu erzeugte Einzelmünze; `copper-coin-manifest.json` und `TROETZLI_QUEST_2026-11-01.md` |
| Eisenpfennig | `/AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png` | Eigene Generierung in `docs/inventory/itemization.md`; transparente Überarbeitung in `modules/brewer-guilds/image-prompts.json` |

Die vorhandenen Motive und ihre Archivkopien wurden tatsächlich angesehen und
über Hashes abgeglichen. Fehlende eigene Gold-/Silber-Einzelmünzen wurden nach
Nutzerauftrag ergänzt. Die fertigen Motive wurden angesehen; ihre transparenten
512-Pixel-Anzeigeableitungen erhalten die PNG-Originale. Alte DND-Motive,
unbestätigte IconOrdnerbilder und der Herausforderungs-Münzstapel ersetzen
diese Bildquelle nicht. Der Classic-Vertrag ist unter `currency/README.md` beschrieben.

Der kanonische Bestand kommt aus `group_quest_accounts`. Redaktionelle
Bestandsplanung und Kassenbuch werden weder eingelesen noch überschrieben.
Der Controller nutzt ausschließlich den Quest-Repositoryvertrag, der Dialog
für persönliche Bestände den vorhandenen `itemDefinitionStore.record`-Gateway.
Unveränderliche Itemversionen werden über `ensureVersions` nachgeladen.

Die Gruppe liefert `getMembers()` und `getSceneThread()` als aktuelle Projektion.
Charaktere und Kreaturen behalten getrennte IDs. Normale Gegenstände und Geld
können auch an Kreatureninventare übergeben werden; verknüpfte Tiergegenstände
werden nur für Personen als Empfänger oder bisherige Besitzer angeboten.
Szenenbelege sind eine ausdrückliche Wahl und keine Voraussetzung für die Kasse.
Die verbindlichen Rechte, Mitgliedschaft, Kampfgrenzen und CAS-Prüfungen liegen
auf dem Server. `managerUids` stammen ausschließlich aus dem geschützten Account.
Geldübergaben zählen volle Münzen der gewählten Währung. Alle vier Münzarten
verwenden positive sichere Ganzzahlen; kleinere Beträge werden in Silber,
Kupfer oder Eisenpfennigen gewählt und nicht als Münzbruchteile übergeben.

Eine erfolgreiche Antwort zeigt sofort den zurückgegebenen Gruppenbestand.
Figuren und Kreaturen werden durch ihre vorhandenen Live-Abonnements
aktualisiert, ohne lokale Cache-Manipulation. Unklare Verbindungsfehler behalten
dieselbe operationId und dieselben Revisionswachen. Die erneute Prüfung kann
auch nach dem Schließen des Dialogs erfolgen. Dieser offene Request lebt im
aktuellen Mount; ein eigener dauerhaft gespeicherter Offline-Auftragsspeicher
ist damit nicht eingeführt. Beim bestätigten CAS-Konflikt wird der Dialog mit
dem inzwischen aktuellen Bestand neu geöffnet.

Die Liste zeigt zunächst zwölf Gegenstände und kann schrittweise erweitert
werden. Die Vorschau öffnet keinen Firebase-Client und führt keine Schreibzüge
aus. Unmount beendet Abonnements, entfernt Dialoge und bricht ihre Listener ab.

Gezielte Regressionen: `tests/group-account.test.mjs`.
