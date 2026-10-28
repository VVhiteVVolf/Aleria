# Einspaltige Aushänge: Textbreite und Lesehöhe

Korrektur: `2274f6a47` — der frühere Fix war auf `ankuendigung` begrenzt.
Das konkrete Hilfsgesuch „Wer hilft uns, die Wahrheit zu finden?“ fiel dadurch
weiterhin auf `68ch` Breite und die gemessene Lesehöhe von 220 px zurück.

Die vorhandene gemeinsame Struktur `.notice-proclamation` erhält ausschließlich
ohne `.has-illustration` die volle Textbreite und das bereits vorhandene
Höhen-Override `min(720px, 75dvh)`. Die bisherigen Ankündigungsregeln bleiben
erhalten. Keine Änderungen an Renderer, Inhalten, gespeicherten Entwürfen oder
Firebase-Daten.

## Prüfung

- Alle 82 vorhandenen Anzeigetafel-Tests bestanden.
- Browservergleich aller 16 Aushangtypen jeweils mit und ohne Bild: 32 Fälle.
- 12 einspaltige Varianten nutzen den vollen Bereich; die Ankündigung hatte
  dieses Verhalten bereits zuvor.
- Alle 20 Kontrollvarianten besitzen unveränderte Breiten, Höhen und Spalten.
- Messwerte vor/nach der Änderung: `before.json` und `after.json`.
- Reproduzierbare lokale Vergleichsseite: `build-fixture.mjs` und `fixture.html`.
- Originales Gwynthor-Hilfsgesuch am Desktop: 977,8125 px Text- und Elternbreite,
  maximal 720 px Lesehöhe.
- Dasselbe Hilfsgesuch bei 390 × 844 px: 296,625 px Text- und Elternbreite,
  maximal 633 px Lesehöhe, kein horizontaler Seitenüberlauf.

Die Vergleichsseite ist Diagnosematerial und wird nicht mit veröffentlicht.

## Veröffentlichung und Live-Nachweis

- Produktivdeploy: `6ae107a4df3eb6172ce0fd05`.
- Commit: `2274f6a47d0a8221f66be927e0d36a9a9520a77f`.
- Release-Abgleich am 27. Oktober 2026, 20:22 UTC: alle 28.232 Paketdateien
  und die sechs Functions bestätigt; Paket nach Erfolg automatisch entfernt.
- Das originale Gwynthor-Hilfsgesuch danach im produktiven Chrome geöffnet:
  neue CSS-Version `20261027-single-column-copy-v1`, volle Breite von
  977,8125 px und maximale Lesehöhe 720 px bestätigt (`live.json`).
- Sichtbarer Live-Nachweis: `live-hilfsgesuch.png`.
