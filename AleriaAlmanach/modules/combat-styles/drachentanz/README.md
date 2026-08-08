# Drachentanz-Register

Der Drachentanz wird zentral in `drachentanz-registry.js` beschrieben. Das Register ist die fachliche Quelle für Formen, Freischaltstufen, Techniken und deren Aktionskosten. Charaktere und Klassen sollen diese Daten nicht kopieren, sondern über `combat-style-registry.js` beziehen.

## Formen und Fortschritt

| Form | Register-ID | Freischaltung | Stand |
| --- | --- | --- | --- |
| I – Tanz des Jungdrachens | `drachentanz-form-i-jungdrache` | Stufe 1; je eine Technik auf Stufe 1–6 | sechs Techniken |
| II – Tanz des Schwertdrachens | `drachentanz-form-ii-schwertdrache` | ab Stufe 7 | vorbereitet, noch ohne Techniken |
| III – Tanz des abwartenden Drachens | `drachentanz-form-iii-abwartender-drache` | noch offen | vorbereitet, noch ohne Techniken |
| IV – Tanz des fliegenden Drachens | `drachentanz-form-iv-fliegender-drache` | noch offen | vorbereitet, noch ohne Techniken |
| V – Tanz des brüllenden Drachens | `drachentanz-form-v-bruellender-drache` | noch offen | vorbereitet, noch ohne Techniken |
| VI – Tanz des ausgeglichenen Drachens | `drachentanz-form-vi-ausgeglichener-drache` | noch offen | vorbereitet, noch ohne Techniken |
| VII – Tanz des zornigen Drachens | `drachentanz-form-vii-zorniger-drache` | noch offen | vorbereitet, noch ohne Techniken |

## Verwendung durch eine Klasse

Eine Klasse wählt Formen deklarativ über `combatStyleGrants` in ihrem Charaktererstellungs-Template aus:

```js
combatStyleGrants: [
  {
    styleId: "drachentanz",
    formId: "drachentanz-form-i-jungdrache",
    minimumLevel: 1,
  },
  {
    styleId: "drachentanz",
    formId: "drachentanz-form-ii-schwertdrache",
    minimumLevel: 7,
  },
]
```

Die Charaktererstellung vergibt alle bis Stufe 1 verfügbaren Techniken. Der Stufenaufstieg ergänzt danach nur fehlende Techniken, deren `unlockLevel` erreicht ist. Stabile Technik-IDs verhindern doppelte Einträge bei Importen und späteren Aufstiegen.

## Neue Techniken ergänzen

Neue Techniken werden ausschließlich bei ihrer Form in `drachentanz-registry.js` eingetragen. Jede Technik benötigt mindestens:

- eine stabile, kampfstilweit eindeutige `id`,
- `unlockLevel`, Name und Beschreibung,
- `actionType` als primäre Aktionsart,
- vollständige `actionCosts`,
- Schadens- und Zieleffekte in `effects`.

Form II und die späteren Formen dürfen gefüllt werden, ohne die Klassen- oder Stufenaufstiegslogik anzupassen. Sobald eine Form Techniken enthält, greifen die bestehenden Freischaltregeln automatisch.
