import { buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';
import { MELOG_PEOPLE } from './honigtoertchen-people.mjs';

export const MELOG_CHARACTER_FEATURE = 'melog-honigtoertchen-20261105';
export const MELOG_AUTHORED_AT = '2026-11-05T18:00:00.000Z';

const life = Object.freeze({
  Ithel: 'Ithel war Konditor- und Bäckermeister und stand dem Haus Melog vor. 1690 fertigte er mit seinem fünfzehnjährigen Sohn Tewdwr in der Hofküche von Castell Draig einen Ersatz für die verschwundene Hochzeitstorte von Meurig Draig und Heledd Gwyvern. Meurig schenkte ihm aus Dankbarkeit ein silbernes Tortenmesser mit Draigs Wappen. Es wird heute in der Konditorei ausgestellt. Ithel starb 1723.',
  Tangwystl: 'Tangwystl ist Ithels Gemahlin und Tewdwrs Mutter. Sie gehört zur älteren Generation der Familie Melog aus Gwynthor. Das Bäcker- und Konditorhandwerk verbindet die Generationen des Hauses; ihr Sohn Tewdwr führt heute die Bäckerei und Konditorei „Zum Honigtörtchen“.',
  Tewdwr: 'Tewdwr ist Konditor- und Bäckermeister und führt als Oberhaupt das Haus Melog. Als Fünfzehnjähriger half er 1690 seinem Vater Ithel, die verschwundene Hochzeitstorte für Meurig Draig und Heledd Gwyvern zu ersetzen. Heute leitet er die Bäckerei und Konditorei „Zum Honigtörtchen“ in Gwynthor und bewahrt die Rezeptur jener berühmten Torte. Mit Morfudd hat er Anest, Afanen und Guto.',
  Morfudd: 'Morfudd betreut Buchhaltung und Finanzen der Familie Melog und ihres Bäcker- und Konditorbetriebs „Zum Honigtörtchen“ in Gwynthor. Ihr Gemahl Tewdwr führt das Haus als Konditor- und Bäckermeister. Ihre gemeinsamen Kinder Anest, Afanen und Guto tragen das Handwerk und den Verkauf in der nächsten Generation weiter.',
  Anest: 'Anest ist Konditor- und Bäckermeisterin aus der Familie Melog. Sie ist eine Tochter von Tewdwr und Morfudd und gehört zum Handwerk des Familienbetriebs „Zum Honigtörtchen“ in Gwynthor. Ihr Gemahl Eiffion kümmert sich um Einkauf und Lieferungen. Ihre Kinder heißen Nerys, Elisedd und Teleri.',
  Afanen: 'Afanen leitet den Verkauf im Honigtörtchen, der Bäckerei und Konditorei ihrer Familie in Gwynthor. Sie ist eine Tochter von Tewdwr und Morfudd und die Schwester von Anest und Guto. Ihr Gemahl Llywarch arbeitet in Verkauf und Gästebetreuung. Lleufer und Cerys sind ihre gemeinsamen Kinder.',
  Guto: 'Guto arbeitet als Bäcker im Familienbetrieb „Zum Honigtörtchen“ in Gwynthor. Der Sohn von Tewdwr und Morfudd wird zugleich als Naschkatze beschrieben. Er ist mit Mabli verheiratet, die Verpackung und Einkauf betreut. Ihr Sohn Iddon trägt mit seiner Vorliebe für Süßes den Beinamen „Klein-Guto“.',
  Eiffion: 'Eiffion übernimmt Einkauf und Lieferungen für das Honigtörtchen in Gwynthor. Seine Gemahlin Anest ist Konditor- und Bäckermeisterin und eine Tochter von Tewdwr und Morfudd Melog. Nerys, Elisedd und Teleri gehören zu ihrer gemeinsamen Familie.',
  Llywarch: 'Llywarch arbeitet im Verkauf und in der Gästebetreuung des Honigtörtchens in Gwynthor. Seine Gemahlin Afanen leitet den Verkauf; ihre Kinder heißen Lleufer und Cerys. Llywarch ist der Bruder von Mabli, die mit Afanens Bruder Guto verheiratet ist.',
  Mabli: 'Mabli betreut Verpackung und Einkauf im Honigtörtchen in Gwynthor. Sie ist mit dem Bäcker Guto Melog verheiratet und die Mutter von Iddon. Ihr Bruder Llywarch ist mit Gutos Schwester Afanen verheiratet und kümmert sich im Familienbetrieb um Verkauf und Gäste.',
  Nerys: 'Nerys gehört zur jüngeren Generation der Familie Melog und wird als „Chaos-Konditorin“ beschrieben. Ihre Eltern sind die Konditor- und Bäckermeisterin Anest und der für Einkauf und Lieferungen zuständige Eiffion. Mit Elisedd und Teleri hat sie zwei jüngere Geschwister. Die Familie betreibt das Honigtörtchen in Gwynthor.',
  Elisedd: 'Elisedd ist ein Sohn von Anest und Eiffion aus der Familie Melog. Er wird als begabtes Allroundtalent beschrieben. Seine ältere Schwester Nerys ist die „Chaos-Konditorin“, seine jüngere Schwester Teleri die kleine Schauspielerin der Familie. Das Honigtörtchen in Gwynthor ist der Bäcker- und Konditorbetrieb seiner Familie.',
  Teleri: 'Teleri ist die jüngste Tochter von Anest und Eiffion und die Schwester von Nerys und Elisedd. Die Familie beschreibt sie als kleine Schauspielerin. Ihre Großeltern Tewdwr und Morfudd gehören zur Leitung des Honigtörtchens, der Bäckerei und Konditorei der Familie Melog in Gwynthor.',
  Lleufer: 'Lleufer ist ein Sohn von Afanen und Llywarch und der Bruder von Cerys. Die Familie beschreibt ihn als eitlen Charmeur. Seine Mutter leitet den Verkauf des Honigtörtchens in Gwynthor; sein Vater kümmert sich um Verkauf und Gästebetreuung. Er gehört damit zur jüngeren Generation des Hauses Melog.',
  Cerys: 'Cerys ist eine Tochter von Afanen und Llywarch und die jüngere Schwester von Lleufer. Sie ist ein geschäftstüchtiges, etwas eingebildetes Kind. Ihre Eltern arbeiten im Verkauf und in der Gästebetreuung des Honigtörtchens in Gwynthor, des Bäcker- und Konditorbetriebs ihrer Familie. Cerys gehört zum Familienleben, hat aber keine feste Aufgabe als Ladenangestellte.',
  Iddon: 'Iddon ist der Sohn des Bäckers Guto und seiner Gemahlin Mabli. Wie sein Vater wird er als Naschkatze beschrieben und trägt den Beinamen „Klein-Guto“. Sein Vater arbeitet in der Backstube, seine Mutter betreut Verpackung und Einkauf. Das Honigtörtchen in Gwynthor ist der Familienbetrieb der Melogs.'
});

export function buildMelogCharacterExports() {
  return MELOG_PEOPLE.map(person => {
    const character = buildImportedCharacter(person.candidate, null, MELOG_AUTHORED_AT);
    const bio = life[person.name];
    if (!bio) throw new Error(`Fehlende Melog-Biografie: ${person.name}`);
    Object.assign(character, {
      id: person.worldPersonId, title: person.role, role: person.role, bio, race: 'Mensch', origin: 'Cenyri', currentLocation: 'Gwynthor',
      biography: sanitizeCharacterBiographyForFirestore({ biography: {
        schema: 'aleria.biography-module', schemaVersion: 1,
        stats: [['Name', person.displayName], ['Geburt', person.birth], ...(person.death ? [['Tod', person.death]] : []),
          ['Haus und Familie', 'Melog · Gwynthor'], ['Tätigkeit oder Eigenheit', person.role]],
        biography: { portrait: person.portrait, biographyTitle: 'Familie und Leben', biographyText: `<p>${bio}</p>`,
          documentsTitle: 'Die Familie Melog', documents: [{ title: 'Im Stammbaum ansehen',
            text: 'Eltern, Verbindungen und Nachkommen der gelieferten Familienakte.',
            link: `../Stammbäume/Stammbaum.html?family=melog&mode=view&person=${person.id}` }] }
      } }).biography
    });
    return {
      type: 'aleria-character', version: 1, exportedAt: MELOG_AUTHORED_AT, mergeStrategy: 'replace-exported-fields',
      assignedTab: 'Gwynthor', sourcePath: `Charakter Archiv Exporte/Melog Honigtoertchen/${person.id}.json`, character
    };
  });
}
