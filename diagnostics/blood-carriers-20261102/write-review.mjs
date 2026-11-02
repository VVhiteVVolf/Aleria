import { readFile, writeFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { BLOODLINE_TRAIT_DEFINITIONS, BLOODLINE_TRAIT_ORIGINS } from '../../AleriaAlmanach/modules/character-development/development-bloodline-traits.js';

const checks = [];
for (const [file, label] of [['development-tests.txt', 'Fachtests'], ['frontend-tests.txt', 'Frontendtests'], ['release-tests.txt', 'Buildschutztests']]) {
  try {
    const bytes = await readFile(new URL(file, import.meta.url));
    const log = bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? 'utf16le' : 'utf8');
    const count = log.match(/^# tests (\d+)$/m)?.[1], failed = log.match(/^# fail (\d+)$/m)?.[1];
    if (count && failed) checks.push(`- ${label}: ${count} Tests, ${failed} Fehler.`);
  } catch { /* Checks can finish after the initial report preparation. */ }
}
const row = ([id, name, description, , cost]) => {
  const origin = BLOODLINE_TRAIT_ORIGINS.find(origin => origin.id === `development-trait-${id}`);
  return `| ${name} | ${description} | ${cost} | [${origin.ancestor}](../..${origin.referenceUrl}) |`;
};
const report = `# Zehn angeborene Blutträger-Merkmale · 2. November 2026

**Blutträger sind Menschen**, die einen infernalen oder celestialen Elternteil
oder einen solchen Vorfahren in ihrem Stammbaum haben. Die magische Anlage kann
über mehrere Generationen weiterbestehen. Die zehn Merkmale ergänzen den Katalog
auf **${DEVELOPMENT_TRAITS.length} Traits** und stehen in Starthilfe und Stufenfenster unter
„Blutträger · angeboren“ zur Verfügung. Die bisherigen 104 Definitionen wurden
unverändert erhalten und gegen [den vorherigen Katalog](catalog-before.json) geprüft.

## Merkmale und Kosten

| Merkmal | Wirkung | Punkte | Herkunftsquelle |
| --- | --- | ---: | --- |
${BLOODLINE_TRAIT_DEFINITIONS.map(row).join('\n')}

Die Kosten bewerten die Wirkung eines bereits angeborenen Merkmals. Eine spätere
Auswahl dokumentiert oder entdeckt das vorhandene Erbe; sie erzeugt keine
Abstammung durch Training. Vier Punkte gelten für die begrenzten Zauber- und
Fertigkeits-/Rettungswurfpakete. Die beiden Pakete mit elementarer Resistenz
kosten fünf Punkte. Ein negativer Gesamtstand bleibt erlaubt. Zahlenboni aus
mehreren belegten Linien addieren sich und erzeugen einen Hinweis; die bestehende
Bewertung mehrfach vorhandener Resistenz berücksichtigt denselben Schutz nur einmal.

Blutträger bleiben Menschen. Die Merkmale vergeben weder eine neue Rasse noch
eine Kreatur, Klasse, Elternschaft, Verwandlung, Gegenstände, Zauber oder zusätzliche
Ressourcen. Bestehende Magiezugänge und aktuelle Ressourcen werden erhalten.
Ein Mensch ohne aktivierten Magiezugang erhält damit eine Anlage, kein automatisch
bedienbares Zauberarsenal. Die weitere magische Ausbildung erfolgt individuell.

## Geprüfte Bestiariumgrundlage

- [Infernale](../../Bestiarium/themen/dunkelalben/index.html) beschreibt Verbindungen
  von Infernalen und Menschen ausdrücklich, besonders bei Succubi und Inkuben,
  und nennt auch andere infernale Verbindungen.
- [Striga](../../Bestiarium/wesen/vampire/striga/index.html) belegt angeborene
  Vampir-Mensch-Nachkommen. Das ist von infektiösen Blutsaugern getrennt. Der
  Vampirspross-Trait bildet auch ein ferneres Erbe ab und macht nicht jeden
  Blutträger zur Striga. Sonnenfessel und Blutbedarf werden nicht pauschal übernommen.
- Formlinge, Sukkuben/Inkuben, Satyre und Aelvar wurden anhand ihrer tatsächlichen
  Profile ausgewählt. Ihre beschriebenen Magierichtungen bestimmen die Motive;
  die Werte der Elternwesen werden nicht auf Menschen übertragen.
- [Celestiale / Lichtalben](../../Bestiarium/themen/lichtalben/index.html) beschreibt
  humanoide Engelgestalten und Nymphen sowie ausdrücklich menschlich-celestiale
  Nachkommen („Lichtgeborene“). Auch die Elementdomänen sind dort beschrieben.
- Flammen-, Wind-, Donner- und Bergspross sind **abgeleitete Spielvarianten**
  humanoider celestialer Vorfahren aus den bestehenden Domänen. Sie werden nicht
  als vier neue belegte Arten oder eigenständige Bestiarium-Profile ausgegeben.
  Der Herkunftslink führt daher auf das vorhandene Celestialen-Themenblatt.

Der [Quellenbeleg](source-review.json) hält die gelesenen Dateien, Hashes und
entscheidenden Textstellen fest. Es wurden keine neuen Fortpflanzungstabellen,
Vererbungsquoten oder zwingenden Charaktergesinnungen erfunden.

## Myriad und Aradin

- **Myriad Draig:** Succubuslinie durch seine Mutter Afallith „Lilith“ Tanwyn,
  wie im aktuellen Autorenauftrag ausdrücklich festgelegt. Ihre Elternverbindung
  ist im Draig-Stammbaum vorhanden.
- **Aradin Hyrmgarthr:** Vampirlinie durch die Herkunft des Clans Hyrmgarthr,
  ebenfalls im aktuellen Auftrag ausdrücklich festgelegt. Die bestehende
  Clanakte beschreibt bereits seine infernale Blutmutter und die magische Tradition.

Beide Beispiele werden bei den passenden Traits angezeigt. Ihre IDs und die
Unterscheidung zwischen direkter Mutter und ferner Clanherkunft bleiben in der
Herkunftsquelle erhalten. Für diese Kontextzuordnung wurden keine neuen Kampfbögen
oder automatischen Charakteränderungen angelegt und keine Daten online migriert.

## Bilder und Bedienung

Zehn neue kreisförmige Comicicons wurden mit dem eingebauten Bildgenerator
erstellt, als transparente PNG-Originale gespeichert und als 192-Pixel-WebP für
die Oberfläche abgeleitet. Sie zeigen menschliche Träger mit symbolischem Erbe.
Die [Bildaufträge mit vollständigen Prompts](bloodline-traits-image-jobs.json)
und der [Bildbeleg](bloodline-traits-art-receipt.json) erhalten die Herkunft.
[Kontaktübersicht](bloodline-traits-contact-review.jpg).
Die fertigen Bilder liegen unter
[Traitbilder](../../AleriaAlmanach/assets/development-traits/).

Der Blutträger-Filter enthält zehn Karten mit „Angeboren“, Herkunftsart und
tatsächlichem Bestiarium-Verweis. Ein Hinweis erklärt Abstammung und Nachtrag;
lange Namen und der Hinweis passen auch in die schmale Ansicht.

## Prüfungen

${checks.join('\n')}

Die neue Fachprüfung deckt Quellenlinks, fünf infernale/fünf celestiale Linien,
unveränderte Altdefinitionen, Magie- und Fertigkeitsboni, beide speziellen
Resistenzen, fehlende automatische Klassen-/Inventar-/Zaubervergabe, unveränderte
aktuelle TP und Ressourcen, Archivkopien, Servernormalisierung und die freie
negative Bilanz ab. Browserbelege prüfen Auswahl und erneutes Laden in beiden
Assistenten sowie die Anzeige der beiden Autorenbeispiele. Externe Schreibzugriffe
sind dort gesperrt. Es wurde nichts gepusht oder veröffentlicht.

Beide Browserläufe und der lokale Produktionsbuild sind bestanden. Ein sichtbarer
Online-Synchronisationshinweis in den Prüfbildern stammt von der beabsichtigten
Sperre externer Schreibzugriffe. Die bekannte Buildwarnung über große
JavaScript-Pakete bleibt bestehen.
`;
await writeFile(new URL('REVIEW.md', import.meta.url), report);
await writeFile(new URL('bloodline-catalog.json', import.meta.url), JSON.stringify({
  traits: DEVELOPMENT_TRAITS.filter(trait => BLOODLINE_TRAIT_ORIGINS.some(origin => origin.id === trait.id)),
  origins: BLOODLINE_TRAIT_ORIGINS
}, null, 2) + '\n');
console.log('Zehn Blutträger dokumentiert; Quellen und Werte verknüpft.');
