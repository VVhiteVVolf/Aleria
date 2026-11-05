# Vier persönliche Startbesitz-Vergaben, 5. November 2026

Der ausdrückliche Nutzerauftrag ist produktiv ausgeführt. Die vier exakten
Laufzeit-IDs und zugehörigen Weltpersonen stehen in
`AleriaAlmanach/modules/draig-starting-possessions/starting-possessions.mjs`.

| Figur | Persönliche Barschaft | Neue Alltagsgegenstände (je ein Stück) |
| --- | --- | --- |
| Rhiannon Draig | 12 Gold, 4 Silber | Kleines Notizbuch, Feder & Tinte, weiße Kreide |
| Isobel Draig | 34 Gold, 7 Silber | Metallspiegel, Holzkamm, Kräutersäckchen |
| Refri Thornwick | 12 Eisenpfennig | Feuerstein & Stahl, Nadel & Faden |
| Meredith Swyll | 1 Silber, 8 Kupfer | Nadel & Faden, Seife, Holzkamm |

Alle neuen Besitzkarten liegen unter Inventar „Sonstiges“ (`category: other`).
Die ursprünglichen Registervorlagen bleiben unverändert unter `werkzeuge`;
kanonische Definitionen, Werte und Wiederverwendung bleiben damit erhalten.
Die Gegenstände sind gewöhnlich, ohne ergänzte Kampf- oder Magieeffekte.

Die schon vorhandenen persönlichen Draig-Ringe blieben bytegleich erhalten.
Refri erhielt zusätzlich ihren alten Thornwick-Siegelring als angelegtes
persönliches Unikat: eiserner Ring, abgerieben und zerkratzt, stellenweise Rost,
Eule mit ausgebreiteten Flügeln auf olivgrünem Grund. Keine neue Erbgeschichte.
`item_unique_claims/personal-signet:refri-thornwick` bindet Instanz und Besitzer.

## Methode und Belege

- `online-before.json`: öffentliche lesende Ausgangserfassung der vier Akten.
- `artwork-prompt.json` und `imagegen-prompt.txt`: eingebauter Imagegen-Skill,
  tatsächliches Thornwick-Wappen als Motiv, vorhandener Draig-Ring als Stil.
- Lokales Original:
  `AleriaAlmanach/assets/house-knight-rings/refri-thornwick-alter-siegelring-v1.png`.
  RGBA, 1254 × 1254, 773.665 vollständig transparente Pixel, Alpha 0–255.
  Tooloriginal bleibt erhalten; keine Bildbearbeitung oder Ersatzgrafik.
- `refri-artwork-published.json`: einzelner gezielter Firebase-Storage-Upload,
  öffentlich vollständiger Bytevergleich und SHA256.
- `prepared-plan.json`: begrenzter Vergabeplan, ausschließlich vier Figuren.
- `online-after.json` und `publication-verification.json`: bestätigte produktive
  Vergabe, einschließlich vollständigem Vorher-/Nachher-Feldschutz.
- `verification-plan.json`: gesonderte rein lesende Nachprüfung; kein zweiter
  Zuschlag. Der externe Claim gilt auch nach Verkauf oder Geldausgabe weiter.

Die vier Inventare werden mit `updateTime`-Vorbedingungen, aktiven Kampfsperren,
vier neuen Vergabeclaims und einem globalen Unikatbeleg atomar geschrieben.
Unveränderliche Itemversionen und fehlende Definitionsköpfe werden nur neu
angelegt. Vor dem Commit wurde mit dem vorhandenen Projektwerkzeug eine
verschlüsselte DPAPI-geschützte Sicherung unter `.private-backups/` angelegt.
Keine Geheimnisse oder Tokens werden protokolliert. Keine globalen Migrationen,
keine fremden Inventaränderungen und keine Website-/Backenddeploys.

## Lokaler Aktenabgleich und Wiederholbarkeit

`CharakterDatenbank/scripts/sync-draig-starting-possessions.mjs` übernimmt nur
die bestätigten neuen Besitz-IDs und den bestätigten Wallet. Lokale zusätzliche
Gegenstände und unabhängige Snapshot-Ergänzungen bleiben erhalten. Vier Akten,
drei Register-/Snapshotdateien und vier neue Exportquellen werden aktualisiert.
289 unbeteiligte Figuren bleiben unverändert. Die Exporte liegen unter
`Charakter Archiv Exporte/Startbesitz 2026-11-05/`.

Der kanonische Datenbankbuilder lädt diese registrierten Overlays generisch.
Die Exportquellen liefern kein Kampfprofil. Ein Regressionstest bestätigt den
Erhalt des neuen Inventars auch beim Neubau aus älteren Vollakten.

Lesende Nachprüfung:

```text
node firebase/scripts/content/publish-draig-starting-possessions.mjs --verify
node CharakterDatenbank/scripts/sync-draig-starting-possessions.mjs --check
```

Gezielte Prüfungen:

```text
node AleriaAlmanach/tests/draig-starting-possessions.test.mjs
node AleriaAlmanach/tests/draig-starting-possessions-database.test.mjs
node CharakterDatenbank/tests/character-export-sources.test.mjs
```
