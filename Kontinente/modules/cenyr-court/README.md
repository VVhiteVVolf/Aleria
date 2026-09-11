# Cenyr: Ämter und Kronfolge

Die eigenständigen Unterseiten liegen bei der Königreichsseite unter
`Kontinente/Estryll/Königreich Cenyr/aemter.html` und `kronfolge.html`.
Der Ämtereinstieg liegt unter Tristan im Königsrat, die Kronfolge in der Ahnengalerie.

## Pflege und Zuständigkeiten

- `offices-data.mjs`: 50 Ämter, Titel und Stände in vier Gruppen sowie der Hofdienst.
- `succession-data.mjs`: 15 Könige, Regierungszeiten, Überlieferungslücken und Erbrecht.
- `offices-template.mjs`, `succession-template.mjs`: jeweilige Seitendarstellung.
- `court-template.mjs`: gemeinsame Seitenschale; `court.css`: ausschließlich diese Seiten.
- `court-entry.css`: ausschließlich die zwei Einstiege auf der Königreichsseite.
- `offices-filter.js`: lokale, progressive Suche ohne Netzwerkzugriffe oder globale Zustände.

Die HTML-Dateien werden eingecheckt und beim statischen Netlify-Deployment mit
dem Repository ausgeliefert. Kein zusätzlicher Laufzeit-Build und keine
Firebase- oder Stammbaumdatenänderungen erforderlich.

Nach Inhaltsänderungen vom Repository-Root aus:

```powershell
node Kontinente/scripts/build-cenyr-court.mjs
node Kontinente/scripts/build-cenyr-court.mjs --check
node --test Kontinente/tests/*.test.mjs
```

Bei Änderungen an CSS oder Suchskript den jeweiligen Cacheparameter in
`court-template.mjs` bzw. der Königreichsseite erhöhen und neu generieren.
Königslinks entstehen über den vorhandenen `createFamilyViewLink`-Vertrag
(`family=haus-pendrag&mode=view&person=…`). Personen und lokale Porträts werden
beim Generieren aus `HOUSE_PENDRAG_FAMILY` übernommen. Fehlende Personen brechen
die Generierung ab. Es wird kein zweiter Stammbaum angelegt.

Der bestehende Stammbaum liest bereits den Parameter `person`. Zusätzlich wird
dieser Einstieg nun über `entryFocus` an seine Ansicht übergeben: Der Adapter
zentriert die verlinkte Person, ohne die Wurzel oder Topologie umzubauen. Die
Validierung und Startskalierung liegen in `family-chart-viewport-policy.js`.
Nach dem Nachladen einer veröffentlichten Familienfassung wird der Einstieg
erneut berücksichtigt. Normale Links ohne Person behalten die alte Startansicht.

## Quellen und redaktionelle Entscheidungen

Grundlage sind die drei am 11.09.2026 gelieferten Animexx-HTML-Vorlagen:

1. Ämter in Cenyr (`accd442e-6fef-496c-9bbe-6d8d6b9ea2b0`): sämtliche benannten Rollen,
   Zuständigkeiten, Sonderfälle, Beispiele und Abzeichenmaterialien übernommen.
2. Königstum Cenyrs (`f26bc91c-d694-426c-8633-cf76288d28ac`): Hintergrund, Erbrecht,
   Nimues Versprechen, Königsnamen und bekannte Regierungszeiten übernommen.
3. Uther IX. (`ff8bb0e3-2884-411c-bfc5-46de775de8d5`): überwiegend leere Biografievorlage.
   Keine Biografie erfunden; Uther IX. verlinkt direkt zur vorhandenen Person
   `uther-1643-pendrag`.

Korrigiert wurden Schreibfehler, doppelte Nummerierungen und offensichtliche
Kopiervorlagenreste: „Adelstitel Aldrimars“, „Reik“, „Jarltum“ und „Thane“ im
Cenyr-Abschnitt sowie „Kämmerer“ bei den Untergebenen des Justiziars. Die
entsprechenden Begriffe lauten Cenyr, Herzog/Fürst, Grafschaft, Baron und Justiziar.
Leere Zitat-, Trivia- und Biografieplatzhalter wurden ausgelassen. Unbekannte
Regierungsdaten und alle fünf Zeitsprünge bleiben ausdrücklich sichtbar.
Die Primogenitur folgt der detaillierten Vorlage mit Vorrang männlicher Erben,
nicht der verkürzten Infoboxformulierung „ältester Spross“.

## Neue Icons

Erstellt mit dem eingebauten Imagegen-Werkzeug, kein API-/CLI-Fallback.
Die Originalausgaben liegen unverändert und lokal unter `assets/aemter.png`
und `assets/kronfolge.png`. Die Bilder stellen symbolische Ämter und die Krone dar,
keine neuen kanonischen Personenporträts.

Verwendete Prompts:

### aemter

Use case: illustration-story. Asset type: square navigation icon for a medieval fantasy encyclopedia. Primary request: a comic parchment-style icon of a kindly crowned medieval king seated on a throne receiving the oath of a kneeling knight, representing royal offices and service. Style: expressive hand-inked fantasy comic, bold dark brown outlines, restrained cel shading and delicate aged parchment grain. Palette: warm ivory parchment, burgundy red cloth, antique gold crown and accents. Composition: one simple compact centered emblem, fully visible figures, clear readable silhouette at 120px, generous empty margin, flat warm ivory parchment background with subtly worn edges. No lettering, no text, no numerals, no watermarks, no photorealism, no border frame.

### kronfolge

Use case: illustration-story. Asset type: square navigation icon for a medieval fantasy encyclopedia. Primary request: a comic parchment-style icon of a large golden royal crown above an unfurled parchment scroll bearing a simple branching family-tree motif with three small crown seals, representing royal succession. Style: expressive hand-inked fantasy comic, bold dark brown outlines, restrained cel shading and delicate aged parchment grain. Palette: warm ivory parchment, burgundy red ribbon, antique gold crowns and accents. Composition: one simple compact centered emblem, fully visible scroll and crown, clear readable silhouette at 120px, generous empty margin, flat warm ivory parchment background with subtly worn edges. No lettering, no text, no numerals, no watermarks, no photorealism, no border frame.
