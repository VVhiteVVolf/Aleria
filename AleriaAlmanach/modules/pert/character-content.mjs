import { createFamilyCandidates, buildImportedCharacter } from '../character-genealogy/genealogy-mapping.js';
import { sanitizeCharacterBiographyForFirestore } from '../characters/character-save-guard.js';

export const PERT_CHARACTER_FEATURE = 'pert-20261106';
export const PERT_AUTHORED_AT = '2026-11-06T17:09:43.000Z';
export const PERT_KEVAN_ID = 'jTzoT0bqb2lfmslJ05FJ';
export const PERT_KEVAN_PERSON_ID = 'person-52becf61';
export const PERT_CHARACTER_EXPORT_DIRECTORY = 'Charakter Archiv Exporte/Pert';
export const PERT_EXISTING_CHARACTER_FIELDS = Object.freeze(['bio', 'biography', 'portrait', 'identity', 'genealogy', 'updatedAt']);

// Individual biographies use only the supplied family graph, house prose and,
// for Kevan alone, the compatible service history in his retained older record.
export const PERT_LIFE = Object.freeze({
  'person-cde44b00': [
    'Iorwerth Pert wurde 1666 geboren und gehörte zu dem auf Castell Draig tätigen Zweig der bürgerlichen Familie Pert. Als Brotmeister des Hauses Draig war er für die Verwaltung und Versorgung der Vorratskammern verantwortlich. Seine Arbeit gehört zu jener über Generationen gewachsenen Dienstbeziehung, auf der das Vertrauen zwischen den Perts und dem Grafenhaus beruht.',
    'Seine Gemahlin Gwerfyl übernahm das Amt der Küchenmeisterin. Ihr gemeinsamer Sohn heißt Goronvy; Kevan und Rhiain sind Iorwerths Enkelkinder. Iorwerths Bruder Idwal begründete durch seine Ehe mit Mared Maesglas den landwirtschaftlichen Familienzweig auf Hof Maesglas. Burgversorgung und Landwirtschaft blieben innerhalb der Familie eng miteinander verbunden.',
    'Iorwerth starb 1715. Der spätere Tod seines Sohnes Goronvy und dessen Gemahlin Lowri im Krieg von 1720 fällt damit in die Zeit nach seinem eigenen Leben. Die älteren Anfänge vor Iorwerth und Idwal sind nur durch eine Überlieferungslücke mit den unbekannten Gründern verbunden.'
  ],
  'person-02756f76': [
    'Idwal Pert wurde 1670 geboren und ist Iorwerths Bruder. Während Iorwerth als Brotmeister auf Castell Draig arbeitete, verband Idwal seinen Lebensweg mit einem landwirtschaftlichen Anwesen in der Umgebung Gwynthors. Seine Ehe mit Mared Maesglas, der Erbin des gleichnamigen Hofes, brachte den Hof in die Familie Pert.',
    'Idwal und Mared haben die Kinder Geraint und Sioned. Geraint bewirtschaftet das Anwesen heute mit seiner Gemahlin Bethan; Sioned kümmert sich besonders um Rinder und Milchwirtschaft. Damit liegt der wirtschaftliche Schwerpunkt dieses Zweiges in Ackerbau, Viehzucht und Pferdehaltung, während die Verwandten auf Castell Draig von ihrem Dienst für Haus Draig leben.',
    'Mared starb 1724. Idwal ist weiterhin als lebend verzeichnet. Der Hof verbindet die Generationen auch als familiärer Zufluchtsort: Nach dem Tod Goronvys und Lowris nahm die Familie von Geraint und Bethan deren Sohn Kevan bei sich auf.'
  ],
  'person-e6511832': [
    'Gwerfyl wurde 1668 geboren und ist die Gemahlin des 1715 verstorbenen Brotmeisters Iorwerth Pert. Als Küchenmeisterin des Hauses Draig wurde sie zu einer festen Größe im Personal von Castell Draig. Ihre Tätigkeit steht neben Iorwerths früherer Verantwortung für die Vorratskammern für die enge Verbindung der Perts mit der Versorgung der Burg.',
    'Gwerfyl und Iorwerth sind die Eltern von Goronvy. Als Goronvy und seine Gemahlin Lowri 1720 im Krieg gegen Ceitheach fielen, blieben ihre Kinder auf die Hilfe der Verwandten angewiesen. Rhiain wuchs bei Gwerfyl auf Castell Draig auf; Kevan fand bei Geraint und Bethan auf Hof Maesglas ein neues Zuhause.',
    'Heute übernimmt Rhiain selbst als Brotmeister Aufgaben in der Burgversorgung. In Gwerfyls Familienzweig verbinden sich damit die Arbeit mehrerer Generationen und die persönliche Fürsorge für die nach den Kriegsverlusten aufgenommenen Enkelkinder.'
  ],
  'person-dcc5c8f4': [
    'Mared Maesglas wurde 1672 geboren und ist als letzte Überlebende ihrer Herkunftsfamilie sowie als Erbin eines Hofes verzeichnet. Durch ihre Ehe mit Idwal Pert gelangte Hof Maesglas in die Familie Pert. Das Anwesen in der Umgebung Gwynthors wurde zum Mittelpunkt des landwirtschaftlichen Zweiges.',
    'Mared und Idwal haben die Kinder Geraint und Sioned. Zum Hof gehören Nutzflächen, Stallungen und Wirtschaftsgebäude. Ackerbau, die Haltung von Rindern und Pferden sowie die Milchwirtschaft bilden seine überlieferten Arbeitsbereiche. Heute bewirtschaften Geraint und Bethan das Anwesen, während Sioned sich besonders um Rinder und Milch kümmert.',
    'Mared starb 1724. Ihr Name bleibt im Namen des Hofes und in der Familiengeschichte erhalten. Ihre Nachkommen verbinden den bäuerlichen Alltag mit dem Zusammenhalt der Perts, deren anderer Zweig auf Castell Draig dient.'
  ],
  'person-1f86b441': [
    'Goronvy Pert wurde 1692 als Sohn von Iorwerth und Gwerfyl geboren. In der Hausgeschichte erscheint sein Name auch in der Schreibweise Goronwy. Er gehörte der Leibgarde des Hauses Draig an und führte damit die langjährige Dienstbeziehung seiner Familie zum Grafenhaus in einer militärischen Aufgabe fort.',
    'Seine Gemahlin Lowri diente ebenfalls in der Draig-Leibgarde. Ihre Kinder sind Kevan, geboren 1716, und Rhiain, geboren 1719. Im Jahr 1720 fielen Goronvy und Lowri im Krieg gegen Ceitheach. Ein genauer Schlachtort oder weitere Einzelheiten ihres Todes sind nicht überliefert.',
    'Nach dem Verlust der Eltern übernahmen Verwandte die Sorge für die Kinder. Rhiain blieb bei der Großmutter Gwerfyl auf Castell Draig, Kevan wurde von Geraint und Bethan auf Hof Maesglas aufgenommen. Beide gehören heute wieder zu den im Dienst des Hauses Draig verzeichneten Angehörigen der Familie.'
  ],
  'person-ab6f684c': [
    'Lowri wurde 1695 geboren und war mit Goronvy Pert verheiratet. Wie ihr Gemahl gehörte sie zur Leibgarde des Hauses Draig. Ihre persönliche Tätigkeit steht damit neben den Aufgaben der Familie in Küche, Vorratsverwaltung und Landwirtschaft als ein weiterer Bereich des Dienstes für das Grafenhaus.',
    'Lowri und Goronvy sind die Eltern von Kevan und Rhiain. Beide Eltern fielen 1720 im Krieg gegen Ceitheach. Über den genauen Ort oder Ablauf ihres letzten Einsatzes liegen keine weiteren Angaben vor. Die überlieferten Lebensdaten halten Lowris Tod im selben Jahr wie den ihres Gemahls fest.',
    'Die Kinder fanden anschließend innerhalb der Familie Schutz: Rhiain blieb bei Gwerfyl, Goronvys Mutter, auf Castell Draig. Kevan wuchs bei Geraint und Bethan auf Hof Maesglas auf. Die Hilfe zwischen Burgzweig und Hofzweig bewahrte den familiären Rückhalt der beiden Kinder.'
  ],
  'person-4506547d': [
    'Geraint Pert wurde 1697 als Sohn von Idwal Pert und Mared Maesglas geboren. Er ist der Besitzer von Hof Maesglas in der Umgebung Gwynthors und bewirtschaftet das Anwesen gemeinsam mit seiner Gemahlin Bethan. Zum Hof gehören landwirtschaftliche Nutzflächen, Stallungen und Wirtschaftsgebäude; Ackerbau, Viehzucht und Pferdehaltung sind seine überlieferten Schwerpunkte.',
    'Geraints Schwester Sioned ist besonders für Rinder und Milchwirtschaft verantwortlich. Ihr Lebensgefährte Donnchadh betreut die Pferde und Stallungen. Bethan kümmert sich um den Haushalt. Geraint und Bethan haben die Kinder Goleuddydd, Lleian, Canna und Iolo; Iolo ist als Hoferbe verzeichnet.',
    'Nach dem Tod von Goronvy und Lowri im Krieg von 1720 nahmen Geraint und Bethan deren Sohn Kevan auf dem Hof auf. Das Anwesen besitzt damit neben seiner wirtschaftlichen Bedeutung auch einen festen Platz als familiärer Zufluchtsort. Gemeinsame Mahlzeiten, Gastfreundschaft und gegenseitige Unterstützung gehören zum Selbstverständnis der Perts.'
  ],
  'person-4ee10c57': [
    'Sioned Pert wurde 1705 als Tochter von Idwal und Mared Maesglas geboren. Ihr Bruder Geraint bewirtschaftet mit Bethan den Hof Maesglas. Sioned kümmert sich dort besonders um die Rinder und die Milchwirtschaft und übernimmt damit einen benannten Teil der Arbeit des landwirtschaftlichen Familienzweiges.',
    'Ihr Lebensgefährte Donnchadh stammt aus Ceitheach und betreut auf dem Hof Pferde und Stallungen. Dass er trotz der Kriegsverluste der Perts dort eine neue Heimat fand, ist Teil der überlieferten Familiengeschichte. Die Familie unterscheidet die politische Feindschaft früherer Kriegsgegner von der Begegnung mit einem einzelnen Menschen.',
    'Roísin, geboren 1732, wird als Sioneds legitimierte Tochter geführt. Der Vater des Kindes ist nicht benannt. Sioned gehört mit ihrer Arbeit, ihrer Tochter und ihrer Verbindung zu Donnchadh zum heutigen Familienleben auf Hof Maesglas.'
  ],
  'person-cada9cd4': [
    'Bethan wurde 1698 geboren und ist mit Geraint Pert verheiratet. Gemeinsam bewirtschaften sie Hof Maesglas in der Umgebung von Gwynthor. Bethans ausdrücklich genannte Aufgabe ist der Haushalt. Das Anwesen mit seinen Nutzflächen, Stallungen und Wirtschaftsgebäuden bildet den Mittelpunkt des landwirtschaftlichen Familienzweiges.',
    'Ihre gemeinsamen Kinder heißen Goleuddydd, Lleian, Canna und Iolo. Iolo ist als Hoferbe verzeichnet. Auf dem Hof arbeiten auch Geraints Schwester Sioned, die Rinder und Milchwirtschaft betreut, und deren Lebensgefährte Donnchadh, der für Pferde und Stallungen zuständig ist.',
    'Als Goronvy und Lowri 1720 im Krieg gegen Ceitheach fielen, nahmen Bethan und Geraint deren Sohn Kevan bei sich auf. Der gemeinsame Tisch und die Hilfe für Angehörige in Not gehören zu den beschriebenen Werten der Perts. Bethans Haushalt wurde für Kevan auf diese Weise zu einem neuen Zuhause.'
  ],
  'person-35fdbd7b': [
    'Donnchadh wurde 1705 geboren und stammt aus Ceitheach. Auf Hof Maesglas in der Umgebung Gwynthors fand er eine neue Heimat. Dort arbeitet er als Stallmeister und betreut die Pferde und Stallungen. Seine Aufgabe ergänzt die Landwirtschaft des von Geraint und Bethan Pert bewirtschafteten Hofes.',
    'Er ist der Lebensgefährte von Sioned Pert, die besonders für Rinder und Milchwirtschaft verantwortlich ist. Seine Aufnahme in das Umfeld der Familie hat vor dem Hintergrund ihrer Geschichte besonderes Gewicht: Goronvy und Lowri Pert waren 1720 im Krieg gegen Ceitheach gefallen. Dennoch richten die Perts ihr Verhältnis zu Donnchadh nach der einzelnen Person aus.',
    'Sioned hat die Tochter Roísin. Deren Vater ist in der Familienüberlieferung nicht benannt. Donnchadhs eigene Herkunft und sein Platz auf dem Hof sind belegt; darüber hinausgehende Verwandtschaften oder ein eigener Hofbesitz sind nicht überliefert.'
  ],
  'person-52becf61': [
    'Kevan Pert wurde 1716 als Sohn von Goronvy und Lowri geboren. Seine Schwester Rhiain kam 1719 zur Welt. Beide Eltern dienten in der Leibgarde des Hauses Draig und fielen 1720 im Krieg gegen Ceitheach. Während Rhiain bei der Großmutter Gwerfyl auf Castell Draig blieb, nahmen Geraint und Bethan Kevan auf Hof Maesglas auf. Seine Großeltern väterlicherseits sind Iorwerth und Gwerfyl Pert.',
    'Kevan ist als Waffenknecht des Hauses Draig verzeichnet. Seine ältere Dienstgeschichte berichtet, dass er zunächst als Wachsoldat an der Grenze Gwynthors die östliche Straße sicherte. Als seine Großmutter erkrankte, veranlasste der Marschall seine Versetzung an den Hof, damit er bei ihr bleiben konnte. Nach ihrer Genesung blieb Kevan als Gardist auf Castell Draig.',
    'Sein Lebensweg verbindet damit die beiden Familienzweige: die Kindheit nach dem Tod der Eltern auf dem landwirtschaftlichen Hof und den späteren Dienst im Umfeld des Grafenhauses. Die Perts beschreiben gegenseitige Verantwortung und zuverlässige Arbeit als tragende Werte ihrer Gemeinschaft.'
  ],
  'person-3a869794': [
    'Rhiain Pert wurde 1719 als Tochter von Goronvy und Lowri geboren. Kevan ist ihr älterer Bruder. Als beide Eltern 1720 im Krieg gegen Ceitheach fielen, war die Familie auf den Rückhalt ihrer Verwandten angewiesen. Rhiain blieb bei ihrer Großmutter Gwerfyl auf Castell Draig, während Kevan bei Geraint und Bethan auf Hof Maesglas ein neues Zuhause fand.',
    'Gwerfyl ist Küchenmeisterin des Hauses Draig. Rhiains Großvater Iorwerth hatte als Brotmeister die Vorratskammern verwaltet und versorgt; er war bereits 1715 gestorben. Rhiain ist heute selbst als Brotmeister des Hauses Draig verzeichnet und führt damit Aufgaben einer jüngeren Generation in der Versorgung der Burg fort.',
    'Ihr Leben steht für die Verbindung von Dienst und familiärer Fürsorge innerhalb der Perts. Auch wenn Burgzweig und Hofzweig unterschiedliche Arbeiten übernehmen, bleiben beide eng verbunden und unterstützen Angehörige in einer Notlage.'
  ],
  'person-da2c039f': [
    'Goleuddydd Pert wurde 1722 als Tochter von Geraint und Bethan geboren. Ihre Geschwister heißen Lleian, Canna und Iolo. Die Familie bewirtschaftet Hof Maesglas in der Umgebung Gwynthors; Iolo ist als Erbe des Hofes verzeichnet. Die Arbeit des landwirtschaftlichen Zweiges umfasst Nutzflächen, Viehzucht, Rinder- und Milchwirtschaft sowie Pferdehaltung.',
    'Eine besondere persönliche Angabe betrifft Goleuddydds starke Fixierung auf Kevan. Die Familienakte beschreibt sie mit der Rollenbezeichnung „Besessen von Kevan“. Eine Partnerschaft oder ein Verlöbnis zwischen beiden ist nicht überliefert. Kevan war nach dem Tod seiner Eltern 1720 von Geraint und Bethan auf dem Hof aufgenommen worden.',
    'Ein eigenes berufliches Amt Goleuddydds wird nicht genannt. Ihre Einordnung bleibt die einer Angehörigen des Hofzweiges, dessen Familienleben von gemeinsamen Mahlzeiten, Gastfreundschaft und gegenseitiger Hilfe geprägt ist.'
  ],
  'person-f61ee33a': [
    'Lleian Pert wurde 1725 als Tochter von Geraint und Bethan geboren. Ihre ältere Schwester heißt Goleuddydd; Canna und Iolo gehören ebenfalls zu ihren Geschwistern. Geraint und Bethan bewirtschaften Hof Maesglas, der durch Lleians Großmutter Mared Maesglas in die Familie Pert gelangte.',
    'Der Hof bildet den landwirtschaftlichen Mittelpunkt des Hauses. Geraints Schwester Sioned ist besonders für Rinder und Milchwirtschaft zuständig, ihr Lebensgefährte Donnchadh für Pferde und Stallungen. Neben Stallungen und Wirtschaftsgebäuden gehören landwirtschaftliche Nutzflächen zum Anwesen.',
    'Für Lleian sind weder ein eigener Beruf noch ein persönliches Amt benannt. Die überlieferten Familienbräuche betonen gemeinsame Mahlzeiten, Gastfreundschaft und das schrittweise Übernehmen von Verantwortung. Diese Angaben beschreiben das Umfeld, in dem die jüngere Generation der Perts lebt.'
  ],
  'person-cf926021': [
    'Canna Pert wurde 1729 geboren und ist ein Kind von Geraint und Bethan. Goleuddydd, Lleian und Iolo sind die Geschwister. Die Eltern bewirtschaften Hof Maesglas in der Umgebung Gwynthors. Das Anwesen kam durch Mared Maesglas, Cannas Großmutter, in die Familie Pert und bildet den Mittelpunkt des landwirtschaftlichen Zweiges.',
    'Auf dem Hof gehören Ackerbau, Rinderhaltung, Milchwirtschaft sowie die Versorgung von Pferden und Stallungen zum überlieferten Alltag. Die benannten Erwachsenen teilen diese Aufgaben unter sich auf. Cannas jüngerer Bruder Iolo ist als Hoferbe verzeichnet.',
    'Weitere persönliche Eigenschaften, eine berufliche Ausbildung und ein eigener Aufgabenbereich Cannas sind nicht beschrieben. Die Familie legt Wert auf Zusammenhalt, gewissenhafte Arbeit und die Unterstützung von Angehörigen in Not. Das Geschlecht bleibt in der Familienakte unbestimmt.'
  ],
  'person-96cdce72': [
    'Iolo Pert wurde 1735 als Sohn von Geraint und Bethan geboren. Goleuddydd, Lleian und Canna sind seine älteren Geschwister. In der Familienakte ist Iolo als Hoferbe verzeichnet. Diese Bezeichnung bezieht sich auf Hof Maesglas, den landwirtschaftlichen Besitz der Familie in der Umgebung Gwynthors.',
    'Seine Eltern bewirtschaften das Anwesen mit seinen Nutzflächen, Stallungen und Wirtschaftsgebäuden. Geraints Schwester Sioned betreut besonders Rinder und Milchwirtschaft; Donnchadh kümmert sich um Pferde und Stallungen. Der Hof gelangte über Iolos Großmutter Mared Maesglas in die Familie.',
    'Iolo gehört zur jüngsten Generation der Perts. Ein eigener heutiger Beruf ist nicht benannt. Die spätere Hofnachfolge steht neben einer Kindheit im familiären Umfeld, in dem gemeinsamer Tisch, Gastfreundschaft und gegenseitige Verantwortung als wichtige Werte beschrieben werden.'
  ],
  'person-618119d8': [
    'Roísin Pert wurde 1732 geboren und wird als legitimierte Tochter Sioneds geführt. Sioned ist die Tochter von Idwal Pert und Mared Maesglas und die Schwester des Hofbesitzers Geraint. Roísin gehört damit zum landwirtschaftlichen Zweig der Familie, dessen Mittelpunkt Hof Maesglas bei Gwynthor ist.',
    'Ihre Mutter kümmert sich besonders um Rinder und Milchwirtschaft. Sioneds Lebensgefährte Donnchadh stammt aus Ceitheach und betreut auf dem Hof Pferde und Stallungen. Der Vater Roísins ist in der Familienüberlieferung nicht benannt.',
    'Ein eigener Beruf oder ein persönliches Amt Roísins ist nicht überliefert. Sie gehört zur jüngeren Generation einer Familie, die Gastfreundschaft, gemeinsame Mahlzeiten und die Unterstützung ihrer Angehörigen betont. Die überlieferte Elternzuordnung bleibt auf Sioned beschränkt.'
  ]
});

export function pertCandidates(record) {
  if (record?.id !== 'pert') throw Error('Die kanonische Pert-Familienakte fehlt.');
  const candidates = createFamilyCandidates(record).filter(candidate => Object.hasOwn(PERT_LIFE, candidate.personId));
  if (candidates.length !== 17 || new Set(candidates.map(candidate => candidate.worldPersonId)).size !== 17) throw Error('Pert benötigt genau 17 benannte, eindeutige Weltpersonen.');
  return candidates;
}

export function buildPertCharacterExports(record) {
  return pertCandidates(record).map(candidate => {
    const id = candidate.personId === PERT_KEVAN_PERSON_ID ? PERT_KEVAN_ID : candidate.worldPersonId;
    const paragraphs = PERT_LIFE[candidate.personId];
    const biography = sanitizeCharacterBiographyForFirestore({ biography: {
      schema: 'aleria.biography-module', schemaVersion: 1,
      stats: [['Name', candidate.displayName], ['Familie', 'Pert'], ['Stand', 'Bürgerlich'], ['Geburt', candidate.birth],
        ...(candidate.death ? [['Tod', candidate.death]] : []), ['Lebensstatus', candidate.status === 'dead' ? 'Verstorben' : 'Lebend'],
        ...(candidate.title ? [['Aufgabe oder Stellung', candidate.title]] : [])],
      biography: {
        portrait: candidate.portrait, portraitCaption: candidate.displayName,
        biographyTitle: 'Familie und Lebensweg', biographyText: paragraphs.map(text => `<p>${text}</p>`).join(''),
        documentsTitle: 'Familie Pert', documents: [
          { title: 'Im Stammbaum ansehen', text: 'Angehörige und Verbindungen der Familie Pert.', icon: `../Stammbäume/${record.family.document.emblem}`, link: `../Stammbäume/Stammbaum.html?family=pert&mode=view&person=${candidate.personId}` },
          { title: 'Hausgeschichte der Perts', text: 'Castell Draig und Hof Maesglas.', icon: `../Stammbäume/${record.family.document.emblem}`, link: '../Familien%20H%C3%A4user%20und%20Clans/kleinehaeuser.html?haus=pert' }
        ]
      }
    } }).biography;
    const imported = buildImportedCharacter(candidate, null, PERT_AUTHORED_AT);
    delete imported.inventory;
    Object.assign(imported, { id, bio: paragraphs.join('\n\n'), biography, currentLocation: candidate.status === 'dead' ? '' : 'Gwynthor' });
    const character = candidate.personId === PERT_KEVAN_PERSON_ID
      ? Object.fromEntries(['id', 'name', ...PERT_EXISTING_CHARACTER_FIELDS].map(field => [field, imported[field]]))
      : imported;
    return {
      type: 'aleria-character', version: 1, exportedAt: PERT_AUTHORED_AT,
      mergeStrategy: 'replace-reviewed-metadata-fields', assignedTab: 'Gwynthor',
      sourcePath: `${PERT_CHARACTER_EXPORT_DIRECTORY}/${candidate.personId}.json`,
      source: { kind: 'supplied-family-export-and-house-prose', familyId: 'pert', personId: candidate.personId, worldPersonId: candidate.worldPersonId },
      character
    };
  });
}
