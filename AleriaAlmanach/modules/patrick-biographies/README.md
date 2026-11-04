# Patricks aktuelle öffentliche Biografien

`planPatrickBiographies({ characters, existingCreatures, assetMap, now, gwenCharacterId })`
erstellt ausschließlich einen lokalen, reinen Schreibplan. `characters` enthält frisch
gelesene und dekodierte vollständige Dokumente mit ihrer echten `id`. Es sind nur die
kanonischen IDs Cadogans, Rhiannons und Gwens zulässig. Gwens bereits vorhandene
Welt-ID bleibt `person--family-tree--unknown-cadogan-spouse`.
Nicht zugehörige oder doppelte Personen werden abgewiesen.

Die gemeinsame öffentliche Sourcefactory in `biography-source.mjs` besitzt die geprüften
Metadaten, Tabellenkorrekturen und Ausgangsbiografien. Der übliche reine Planablauf ist:

```js
const prepared = preparePatrickBiographyCharacters(currentCharacters, { now, assetMap });
const plan = planPatrickBiographies({ characters: prepared, existingCreatures, assetMap, now });
const desired = prepared.map(character => ({
  ...character,
  ...plan.characters.find(row => row.id === character.id).patch,
}));
```

Der Publisher vergleicht `desired` mit der getrennt erhaltenen echten Online-Baseline.
Ein Planpatch allein enthält nicht nochmals die bereits von der Sourcefactory
vorbereiteten Tabellen-/Metadatenkorrekturen. Bei einer Neuanlage wird der vollständige
vorbereitete Gwen-Entwurf verwendet. Die Sourcefactory erstellt keine Inventare oder Tiere.

Der Plan erhält die gespeicherte Prosa, Werke, Trivia, persönlichen Icons und übrigen
Biografiefelder vollständig. Er ergänzt fehlende Icons (`*`, `✦` oder leer), belegte eigene
Tierverbindungen und die gemeinsamen Inventar-/Kreaturbindungen. Fünf vorhandene generische
Traitbilder werden wiederverwendet. Weitere Bilder kommen aus `assetMap` mit flachen Keys
`trait:<Titel>` oder `<Personen-ID>:<Titel>`; optionale Originalkopien der Tiere verwenden
`pet:silberstolz`, `pet:perle`, `pet:sir-balthasar`, `pet:sonnenaufgang`. Die Textlisten „Können & Fähigkeiten“
werden nicht in mechanische Kampffähigkeiten oder neue Boni umgewandelt.

`characters[].patch` enthält nur geänderte Biografie-/Inventarfelder mit monotoner
Revision und `updatedAt`. `creatures` enthält ausschließlich tatsächlich fehlende neue
Tiere. Bereits vorhandene Tiere werden mit ihren echten IDs und unverändertem Liveprofil
weiterverwendet und nicht erneut geschrieben. Widersprüchliche oder mehrdeutige Bindungen
erzeugen einen Fehler. Ein erneuter Lauf auf dem Ergebnis erzeugt keine weiteren Patches.

Silberstolz gehört Cadogan, Perle gehört Rhiannon Swyll (geb. Draenmelyn). Sir Balthasar und
Sonnenaufgang gehören Gwen und bleiben ohne eingelesene Gwen-Akte unter `pending`.
Eine Erwähnung des Katers bei Cadogan begründet keinen Besitz. Alle vier Tierspezifikationen
verwenden vorhandene Originalbilder und echte Einzeleinträge im Bestiarium. Neue Tiere
starten mit dem vorhandenen Haustierprofil auf Stufe 1 und `needsStatReview`. Silberstolz
verwendet das bestehende leichtere Erlenglanz-Schema, Goldmähne und Rhyfel das vorhandene
normale Pferdegrundprofil. Die Bestiarium-Rassen liefern qualitative Merkmale und
Rossmarkt-/Haustierbewertungen, keinen eigenen verbindlichen D&D-Attributblock. Balthasars
männliches Geschlecht ist im Upload belegt; das Geschlecht der drei Pferde sowie Alter
und besondere Ausbildung aller Tiere bleiben offen.

Dieses Feature besitzt keinen Firebase-Adapter, Publisher oder automatischen Schreibweg.
Der getrennte Publisher muss aktuelle Personen und Kreaturen erneut lesen und die
feldbegrenzten Änderungen geschützt zusammenführen. Es bestehen keine Push-/Deployrechte.
Der dünne Adapter `../creatures/catalog/patrick-biography-companions.js` macht die vier
eindeutig zugeordneten Tiere im gemeinsamen Kreaturkatalog verfügbar und vergibt dabei
keine Inventare. Für alle vier Namen wurde am 3. November 2026 das Fehlen bereits
vorhandener Online-Tierakten geprüft; die IDs entsprechen dem vorgesehenen Neuanlageplan.

Prüfung: `node --test AleriaAlmanach/tests/patrick-biographies.test.mjs`.
