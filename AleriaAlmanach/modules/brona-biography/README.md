# Brona Eisenherz: Biografie und Begleittiere

Der Nutzerauftrag vom 8. November 2026 umfasst zwölf Persönlichkeitsicons und
die beiden in der gelieferten Biografie belegten Tiere Honigwind und Brocken
einschließlich ihrer Inventarverknüpfungen. Die bestehende Figurenkennung
`XTL39e7WjIwUtoT9Gxml` bleibt erhalten. Die bytegleiche Quelle liegt unter
`source/brona-eisenherz-biographie-20261108.json`; Herkunft und SHA-256 stehen
in `diagnostics/brona-biography-20261108/source-inventory.json`.

## Zuständigkeiten

- `brona-biography-icons.mjs` prüft die gelieferte Quelle gegen die aktuelle
  Onlinebiografie und ersetzt ausschließlich die zwölf Platzhaltericons.
- `brona-companions.mjs` erzeugt die zwei quellengebundenen Tierprofile mit
  stabilen IDs, Bildern und Besitzerverweisen. Honigwinds Rasse bleibt offen.
  Brocken verweist auf das bestehende Sturmbockprofil im Bestiarium.
- `brona-biography-plan.mjs` verwendet den gemeinsamen Inventarlinker,
  erhält vorhandene Besitzstücke und ersetzt nur leere Begleiterkarten.
- `brona-biography-database.mjs` übernimmt den bestätigten Onlinezustand in
  genau Bronas bestehende lokale Akte und die zugehörigen Registereinträge.

Beide Tiere sind mit `needsStatReview` gekennzeichnet. Honigwind verwendet
das vorhandene technische Pferdegrundprofil. Brocken besitzt ausschließlich
die Modellmindestwerte; sein obligatorischer Angriffseintrag bleibt ein leerer
Entwurf ohne Namen und Schadensformel. Der tatsächliche Resolver liefert dafür
keine Waffenaktion. Individuelle Kampfwerte, Alter und zusätzliche Ausbildung
sind nicht aus der Biografie abgeleitet. Es werden keine Ausrüstung oder
Geldwerte vergeben.

## Begrenzte Anwendung

`firebase/scripts/content/publish-brona-biography.mjs` verwendet den vorhandenen
Biografie-Publisher. Ohne Argument wird aus dem frischen Serverstand ein Plan
mit Exporten vorbereitet. Erst `--apply` schreibt beide neuen Tierakten und
Bronas `biography`, `inventory`, `updatedAt` atomar. Existenzvorbedingungen,
Dokumentzeitstand, Kampfsperre und verschlüsselte Vorhersicherung sind Pflicht.
Unveränderte verschachtelte Firestore-Werte behalten ihre REST-Typen über den
gemeinsamen Codec; dessen bisheriger Patrick-Export bleibt kompatibel.

Nach bestätigtem Readback erfolgt der lokale Abgleich:

```powershell
node CharakterDatenbank/scripts/sync-brona-biography.mjs --source "Charakter Archiv Exporte/Biographien/brona-eisenherz-2026-11-08/brona-charakter.json" --receipt "diagnostics/brona-biography-20261108/publication-verification.json"
```

Mit zusätzlichem `--check` bleibt dieser Abgleich lesend. Ein pauschaler
Archivsync ist nicht erforderlich. Das Stammbaumjahr 1701 und das abweichende
Biografiejahr 1700 bleiben als offener Quellenkonflikt dokumentiert; dieses
Feature ändert keine Genealogie. Website-Push und Deploy gehören nicht zu
diesem Datenauftrag.

Quellenaufnahme, verschlüsselte Sicherung, unabhängiger Planreview,
öffentliche Bildbytes, echter lokaler Desktop-/Mobilbrowser und typisierter
Serverreadback werden im zugehörigen Diagnoseordner belegt. Die Browserprüfung
verwendet echte Controller mit isolierten Daten und gesperrten Spielwrites.
