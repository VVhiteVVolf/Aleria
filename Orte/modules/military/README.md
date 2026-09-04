# Militäransichten der Ortsseiten

Jede über `Orte/grossstadt.html?id=…` erreichbare Ortsseite erhält standardmäßig einen Einstieg in ihre eigene Militäransicht. Der Einstieg kann pro Ort mit `features.militaryView: false` deaktiviert werden.

Ohne `militaryView`-Daten zeigt `/Orte/militaer.html?id=<orts-id>` einen ortsspezifischen Platzhalter. Später kann das jeweilige `ort.data.js` ein Profil ergänzen:

```js
militaryView: {
  status: "ready",
  title: "Streitkräfte von Beispielort",
  subtitle: "Aufstellung im Jahr 1740",
  total: 1200,
  totalLabel: "Verfügbare Truppen",
  forces: [
    {
      id: "hausgarde",
      name: "Hausgarde",
      kind: "house",
      count: 180,
      crest: { src: "/pfad/zum/wappen.png", alt: "Wappen" }
    },
    {
      id: "stadtwache",
      name: "Stadtwache",
      kind: "cityWatch",
      share: 25
    },
    {
      id: "vasall-beispiel",
      name: "Aufgebot des Hauses Beispiel",
      kind: "vassal",
      count: 240,
      crest: { src: "/pfad/zum/vasallenwappen.png", alt: "Haus Beispiel" }
    }
  ],
  units: [
    {
      id: "ortswache",
      name: "Einfache Ortswache",
      branch: "Infanterie",
      tier: "Leicht gerüstet",
      count: 90,
      image: { src: "/pfad/zur/einheit.png", alt: "Ortswache", fit: "contain" }
    }
  ]
}
```

Unterstützte Kontingentarten sind `house`, `vassal`, `cityWatch`, `localWatch`, `fleet`, `militia` und `other`. Fehlende Prozentwerte werden aus `count` und `total` berechnet; alternativ können ausschließlich Prozentwerte gepflegt werden.
