import { readFile, writeFile } from 'node:fs/promises';
import { DEVELOPMENT_TRAITS } from '../../AleriaAlmanach/modules/character-development/development-traits.js';
import { UNIQUE_TRAIT_DEFINITIONS } from '../../AleriaAlmanach/modules/character-development/development-unique-traits.js';
import { APTITUDE_TRAIT_DEFINITIONS } from '../../AleriaAlmanach/modules/character-development/development-aptitude-traits.js';

const groups = [['20 besondere Eigenheiten', UNIQUE_TRAIT_DEFINITIONS], ['10 Begabungen', APTITUDE_TRAIT_DEFINITIONS]];
const selected = new Set(groups.flatMap(([, entries]) => entries.map(([id]) => `development-trait-${id}`)));
const additions = DEVELOPMENT_TRAITS.filter(trait => selected.has(trait.id));
const table = definitions => ['| Trait | Wirkung | Punkte |', '| --- | --- | ---: |',
  ...definitions.map(([, name, description, , cost]) => `| ${name} | ${description} | ${cost > 0 ? '+' : ''}${cost} |`)].join('\n');

const checks = [];
for (const [file, label] of [['development-tests.txt', 'Fachtests'], ['frontend-tests.txt', 'Vollständige Frontendtests'], ['release-tests.txt', 'Buildschutztests']]) {
  try {
    const bytes = await readFile(new URL(file, import.meta.url));
    const log = bytes.toString(bytes[0] === 255 && bytes[1] === 254 ? 'utf16le' : 'utf8');
    const count = log.match(/^# tests (\d+)$/m)?.[1], failed = log.match(/^# fail (\d+)$/m)?.[1];
    if (count && failed) checks.push(`- ${label}: ${count} Tests, ${failed} Fehler.`);
  } catch { /* The report can also be prepared before all checks complete. */ }
}
const content = `# 30 weitere Traits · 2. November 2026

20 neue besondere Eigenheiten und zehn Begabungen ergänzen den bisherigen Katalog
auf **${DEVELOPMENT_TRAITS.length} wählbare Traits**. Sie stehen in Starthilfe und Stufenfenster zur
Verfügung, einschließlich eigener Filter „Besondere Eigenheiten“ und „Begabungen“.
Jede Ergänzung hat einen neuen Namen und eine vom bisherigen Katalog abweichende
Kombination tatsächlicher Rechenwirkungen. Die bisherigen 74 Traits bleiben erhalten.

Positive Kosten verbrauchen Balancepunkte, negative geben Punkte zurück. Ein
negativer Gesamtstand bleibt erlaubt. Die Kosten sind eine Orientierung; günstige
Kombinationen und Nachteile können je Figur unterschiedlich ins Gewicht fallen.
Vorhandene Zahlenboni können sich addieren. Die bestehende Prüfung nicht stapelbarer
Wirkungen bleibt wirksam. Alle zehn Begabungen kosten jeweils zwei Punkte und
vergeben begrenzte Fertigkeits- oder Rettungswurfboni.

${groups.map(([heading, definitions]) => `## ${heading}\n\n${table(definitions)}`).join('\n\n')}

## Mechanik und Integration

Die Einträge liegen in zwei fachlich getrennten Definitionsmodulen. Der vorhandene
Katalog übernimmt Darstellung, Auswahl, Archivzuordnung und Speicherung. Es gibt
keinen neuen globalen Zustand und keine neuen direkten Firebase-Zugriffe.

- Ehrenhafter Zweikampf prüft die tatsächliche Angriffsreichweite und verlangt
  einen Waffenangriff. Entsprechende Techniken zählen mit; Zauber sind ausgenommen.
- Deckungssucher reduziert eingehenden Fernkampf-Waffenschaden um eins über den
  vorhandenen Schadensregelweg. Ein getragener Bogen macht einen Nahkampfangriff
  nicht automatisch zu einem Fernkampfangriff.
- Magische Wetterfühligkeit und Abergläubisch verwenden die vorhandenen Filter
  für Zauber, Gebete und magische Lieder sowie primäre und sekundäre Rettungswürfe.
  Gewöhnliche magische Angriffswürfe erhalten keinen falschen Rettungswurfbonus.
- Pazifistische Ader verändert Waffenschaden und keine Zauberschadensboni.
- Begabungen verändern keine gespeicherte Grundausbildung. Die normalen
  Fertigkeitsidentitäten funktionieren auch bei Überzeugen/Überreden.
- Keine Gegenstände, Klassen, Attacken oder Ressourcenpakete werden vergeben.
  Es wurden keine vorhandenen Figuren, Inventare, Live-Ressourcen oder alten
  Kampfbelege migriert. Die Ergänzung wurde nicht veröffentlicht.

## Bilder

Alle 30 Motive wurden einzeln mit dem eingebauten Bildgenerator erstellt und
anschließend angesehen. Stilreferenz war das bestehende Heilerhände-Icon:
flache mittelalterliche Comiczeichnung, dunkle Konturen, matte Farben und ein
kreisförmiger Rahmen. Die vollständigen Prompts und Generatorpfade sind in
[Bildaufträgen](unique-traits-image-jobs.json) erhalten. Der
[Bildbeleg](unique-traits-art-receipt.json) enthält Hashes und Alphaprüfung.

Die PNG-Originale liegen gemeinsam mit den bisherigen Bildern unter
[Traitbilder](../../AleriaAlmanach/assets/development-traits/). Die Assistenten
verwenden transparente 192-Pixel-WebP-Ableitungen im Unterordner web/.
[Kontaktübersicht aller 30 neuen Bilder](unique-traits-contact-review.jpg).
Vorhandene Originale wurden nicht überschrieben.

## Prüfungen

${checks.join('\n')}

Die neue Fachprüfung testet insbesondere eindeutige Namen/Rechenwirkungen,
alle zehn Begabungen, Nah-/Fernkampffilter, Beschussschutz, beide Rettungswurfphasen,
Waffen-/Zauberschadensbereich, neue UI-Filter, negative Bilanz und die unveränderten
Inventar-/Ressourcen-/Klassenwerte. Alle 104 Traits durchlaufen die bestehende
Bilddatei- und Browser-/Server-Normalisierungsprüfung.

Die Browserläufe prüfen beide Assistenten auf Desktop und Mobilansicht. Im
Stufenfenster werden zwei neue Traits durch unterschiedliche Filter gewählt,
angewandt und erneut geladen. Externe Schreibzugriffe sind dabei gesperrt.
Browserbelege und Buildprotokoll liegen neben diesem Bericht.
Beide Browserläufe und der lokale Vite-Produktionsbuild sind bestanden. Der
Build meldet weiterhin die bekannte Warnung über große JavaScript-Pakete.
`;
await writeFile(new URL('REVIEW.md', import.meta.url), content);
await writeFile(new URL('catalog-additions.json', import.meta.url), JSON.stringify(additions, null, 2) + '\n');
console.log(`${additions.length} neue Traits dokumentiert, ${DEVELOPMENT_TRAITS.length} insgesamt.`);
