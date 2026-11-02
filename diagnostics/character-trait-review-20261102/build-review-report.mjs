// Local evidence only. No Firebase client, credentials or network writes.
import { readFile, writeFile } from 'node:fs/promises';
import { REVIEWED_CHARACTER_TRAITS, CHARACTER_TRAIT_REVIEW_VERSION } from '../../AleriaAlmanach/modules/character-trait-review/reviewed-character-traits.js';
import { reviewedCharacterTraits, hasAuthoredCombatProfile } from '../../AleriaAlmanach/modules/character-trait-review/character-trait-review-model.js';
const directory = new URL('./', import.meta.url);
const read = async name => JSON.parse(await readFile(new URL(name, directory), 'utf8'));
const online = await read('online-before.json'), local = await read('local-before.json');
const rows = REVIEWED_CHARACTER_TRAITS.map(row => {
  const source = local.profiles.find(source => source.id === row.id).character;
  const live = online.profiles.find(source => source.id === row.onlineId);
  if (!live) throw Error(`Kein öffentlicher Abgleichbeleg: ${row.name}`);
  const traits = reviewedCharacterTraits(row);
  return { ...row, before: source.combatProfile.quirks.map(trait => ({ id: trait.id, name: trait.name })),
    after: traits.map(trait => ({ id: trait.id, name: trait.name, icon: trait.icon })),
    onlineUpdateTime: live.updateTime,
    prospectiveFields: ['combatProfile.quirks', ...(row.removeAbilityIds?.length ? ['combatProfile.abilities'] : []),
      ...(row.removeConditionIds?.length ? ['combatProfile.conditions'] : []),
      ...(live.character.biography?.biography && live.character.biography.disabled !== true ? ['biography.biography.abilitiesTitle', 'biography.biography.abilities'] : [])] };
});
await writeFile(new URL('review-decisions.json', directory), JSON.stringify({ version: CHARACTER_TRAIT_REVIEW_VERSION, reviewedProfiles: 19,
  replacedProfiles: rows.length, oldQuirks: rows.reduce((sum, row) => sum + row.before.length, 0), assignedTraits: rows.reduce((sum, row) => sum + row.after.length, 0), rows }, null, 2) + '\n');
await writeFile(new URL('online-patch-plan.json', directory), JSON.stringify({ executed: false, version: CHARACTER_TRAIT_REVIEW_VERSION,
  prerequisite: 'Zuerst gemeinsame Traitmechanik, Katalog, Icons und öffentliche Biografien freigeben und veröffentlichen. Keine Ausführung dieses Plans vor dem Release.',
  application: 'Alle 14 Dokumente erneut lesen. Identität, unveränderte Ausgangsmerkmale und Biografiekarten prüfen; Update mit frischer updateTime-Vorbedingung und exakter Feldmaske. Nur benannte Ability-/Condition-IDs aus dem frisch gelesenen Array entfernen; Nutzungsstände aller übrigen Einträge unverändert übernehmen. Bei Änderung abbrechen, kein ungeprüftes Komplettprofil schreiben.',
  excludedFields: ['inventory', 'combatProfile.hitPoints', 'combatProfile.resources', 'combatProfile.attributes', 'combatProfile.techniques', 'combatProfile.weapons', 'combatProfile.armorItems', 'combatProfile.progression', 'combat history'],
  documents: rows.map(row => ({ id: row.onlineId, name: row.name, capturedUpdateTime: row.onlineUpdateTime, fieldMask: row.prospectiveFields,
    quirks: reviewedCharacterTraits(row), removeAbilityIds: row.removeAbilityIds || [], removeConditionIds: row.removeConditionIds || [] })) }, null, 2) + '\n');
const defaults = online.profiles.filter(row => !hasAuthoredCombatProfile(row.character));
const table = rows.map(row => `| ${row.name} | ${row.before.length} → ${row.after.length} | ${row.after.map(trait => trait.name).join('; ') || 'Keine neue Eigenschaft'} |`).join('\n');
const evidence = rows.map(row => `**${row.name}:** ${row.reason}\n\nBeleg: ${row.evidence.join('; ')}.`).join('\n\n');
const text = `# Sparsamer Eigenschaftsabgleich vom 2. November 2026

Lokal umgesetzt, nicht veröffentlicht; keine Online-Schreibzugriffe. 389 öffentliche Figuren rein lesend gesichtet, darunter 25 mit gespeichertem Kampfbogen. 14 davon sind individuell ausgearbeitet, 11 reine Standardbögen aus einer früheren Anlage. Zusätzlich die fünf neu ausgerüsteten lokalen Figuren geprüft: Briallen Awenor, Caralyn Chwedonol, Rianna Wyrm, Evie Rhyddid, Lefraye Gafyr. Für sie reichen Haus, Kleidung und Porträt allein nicht als Beleg einer persönlichen Eigenschaft; ihre Auswahl bleibt leer. Rhosyn und Saerwyn haben keine ausgearbeiteten Kampfbögen und gehören noch nicht zum Auftrag.

Die 14 bearbeiteten Altbögen enthalten zusammen ${rows.reduce((sum, row) => sum + row.before.length, 0)} alte Eigenschaftseinträge. Sie werden durch 18 Katalogeigenschaften ersetzt. Höchstens drei je Figur, bei drei Altbögen bewusst keine. Keine schweren psychologischen Zuschreibungen aus niedrigen Werten, Eitelkeit oder Alter. Kein unbelegter Blutträgerstatus und keine neue Krankheit.

| Figur | Anzahl alt → neu | Neue Eigenschaften |
| --- | --- | --- |
${table}

## Entscheidungen und Belege

${evidence}

## Regeländerungen und Erhalt

- Alte Herkunftsfloskeln, kulturelle Starterquirks und individuelle Altquirks sind aus diesen Bögen entfernt. Die alten Originalexporte und Belege bleiben als historische Quellen erhalten; ein neuer partieller Export ersetzt ausschließlich die geprüften Eigenschaften beim Archivabgleich.
- Gawains alter Persönlichkeitsmalus „Muttersöhnchen“ wird aus Fähigkeiten entfernt. „Kann strenge Gerüche nicht leiden“ und Gildas’ „Vorschnelles Urteil“ waren als dauerhafte Zustände abgelegt und werden ebenfalls gezielt entfernt. Andere Zustände bleiben erhalten. „Liebt Düfte“ behält seine besondere Inventar-Nutzungsregel und Nutzungsstände, genauso Siegelring, Durchschnaufen und persönliche Kampfausbildungen.
- Rhiannons alte Ausbildung vergab zusätzlich +1 Zauberangriff und +1 SG. Diese beiden alten Boni entfallen beim Ersatz durch „Arkan geschult“; dessen Vorteil auf Arkane Kunde bleibt die neue Katalogwirkung. Alle 23 Zauber, INT, Stufe und gespeicherten TP bleiben erhalten.
- Duncans neun alte Eigenschaftspakete einschließlich breiter Meisterschaftsboni und Altersabzügen werden nicht versteckt weitergeführt. Er erhält nur „Taktisches Gespür“. Arsenal, Aura, Grundwerte, Rang und Geschichte bleiben erhalten. Alter ist kein ausreichender Beleg einer neuen chronischen Krankheit.
- Guineveres alte breiten Wissensboni und der zusätzliche Fernkampfangriffsbonus werden durch „Spürnase“ und „Scharfe Augen“ ersetzt. Expertise ist dieselbe gemeinsame Fertigkeitsmechanik wie bei einer manuellen Auswahl.
- Freyas alte sozialen Sonderboni und starken Pauschalabzüge werden vollständig durch drei Katalogtraits ersetzt. Keine Verdoppelung von Bühnen- oder Flirtboni. Die ausführlichen Vorlieben, Beziehungen und Ausbildung bleiben in der Prosa erhalten.
- Asgeirs „Fit“ erhöht abgeleitete maximale TP um 2, heilt aber keine aktuellen TP. Ylvas Klassen-Bogenbonus und ihre besondere Veteraninnenfähigkeit bleiben getrennt von „Fährtenleser“ erhalten.
- Fenrir erhält ausschließlich die bestätigte angeborene Varulv-Wolf-Grundprägung, keine zusätzliche Werwolfverwandlung oder Zatracher Infektion.
- Kein Stufenwechsel, keine Änderung an Grundattributen, Inventaren, Waffen, Rüstungen, Ressourcenständen oder historischen Kämpfen durch diesen Abgleich. Fünf öffentliche Biografien erhalten passende Eigenschaftskarten mit eigenen vorhandenen Katalogicons; Prosa, Geschichte, Beziehungen, Porträts, Tabellen und Ausbildung bleiben exakt erhalten.

## Ausgeschlossene Standardbögen

${defaults.map(row => '- ' + row.character.name + ' (' + row.id + ')').join('\n')}

Gethin und Gethin Draig bleiben getrennte Dokumente. Gildas’ vorhandene lokale ID und seine belegte Online-ID werden ausdrücklich zugeordnet und nicht umgeschrieben.

## Architektur und spätere Veröffentlichung

Die Auswahl ist eine begrenzte, begründete Redaktionsliste unter \`modules/character-trait-review/\`, keine automatische Persönlichkeitsheuristik. \`replace-combat-traits\` besitzt nur Quirks und vorhandene Biografiekarten sowie die einzeln benannten entfernten Ability-/Condition-IDs. Es erzeugt keine neuen Figuren, Bögen oder Biografien. Neuere vollständig gespeicherte Bögen haben Vorrang. Ein reiner Eigenschaftsexport kann keine Figur erzeugen und keine Inventare, TP oder Nutzungszähler zurücksetzen. Wiederholung mit \`--check\` schreibt nichts; neue manuelle Eigenschaftsänderungen werden nicht überschrieben.

\`online-patch-plan.json\` dokumentiert eine spätere begrenzte Datenübernahme mit Feldmasken und Änderungsprüfung. Er wurde nicht ausgeführt. Live-Figuren werden vor einer Übernahme neu gelesen, damit zwischenzeitliche Spielstände erhalten bleiben. Erst Frontend, Icons und gemeinsame Servermechanik gemeinsam veröffentlichen; kein Traitpatch gegen die noch alte Online-Anwendung.

Prüfbelege und Browserergebnisse stehen in \`VALIDATION.md\`.
`;
await writeFile(new URL('REVIEW.md', directory), text);
console.log(JSON.stringify({ rows: rows.length, assignedTraits: rows.reduce((sum, row) => sum + row.after.length, 0), onlineWrites: 0 }));
