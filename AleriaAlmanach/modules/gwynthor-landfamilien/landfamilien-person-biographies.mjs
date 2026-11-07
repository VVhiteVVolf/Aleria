import { LAND_FAMILIEN_ROSTER } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/landfamilien-roster.mjs';

const allPeople = new Map(LAND_FAMILIEN_ROSTER.families.flatMap(family => family.persons.map(person => [person.id, person])));
const familyName = household => household.placeName === 'Jagdhaus Helfaen' ? 'Helfaen' : household.slug === 'tirfelyn' ? 'Tirfelyn' : 'Marchwern';
const names = people => people.map(person => person.name).join(', ');
const paragraphHtml = paragraphs => paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');
const hairDescriptions = {
  'caradog-tirfelyn': 'Sein kurzes, gewelltes Haar ist an den Schläfen ergraut. Dazu trägt er einen kurzen rötlichgrauen Bart.',
  'enid-spouse-tirfelyn': 'Sie bindet ihr langes Haar zu einem tiefen geflochtenen Knoten.',
  'gareth-tirfelyn': 'Er trägt das mittellange Haar mit Seitenscheitel und ist glatt rasiert.',
  'ceridwen-tirfelyn': 'Sie trug ihr langes Haar offen und flocht an beiden Seiten einen feinen Zopf.',
  'bedwyr-tirfelyn': 'Sein kurzes Haar steht in lebhaften, zerzausten Strähnen ab.',
  'eudaf-tirfelyn': 'Er bürstet das bereits leicht ergraute Haar zurück und trägt einen schmalen Schnurrbart.',
  'glesni-spouse-tirfelyn': 'Sie trägt das Haar als geflochtenen Kranz; an den Schläfen bleiben wenige Strähnen locker.',
  'cadfan-tirfelyn': 'Seine Haare sind an den Seiten kurz und oben länger geschnitten. Ein leichter Kinnbart rahmt das Gesicht.',
  'gwion-tirfelyn': 'Er trägt dichte kurze Locken und ist glatt rasiert.',
  'meleri-tirfelyn': 'Ihr langes Haar liegt in einem dicken Zopf über einer Schulter.',
  'tegwen-tirfelyn': 'Sie trägt das schulterlange Haar halb hochgebunden.',
  'maelgwn-tirfelyn': 'Sein gerader kurzer Pony endet in unordentlichen Spitzen.',
  'eirwen-spouse-tirfelyn': 'Sie verbindet zwei geflochtene Zöpfe zu einem tiefen Haarknoten.',
  'heulwen-tirfelyn': 'Sie trägt zwei kurze geflochtene Zöpfe.',
  'clydog-tirfelyn': 'Sein kurzes Haar fällt in weichen kleinen Locken.',
  'olwen-spouse-tirfelyn': 'Sie steckt ihr langes Haar als einfachen Zopf hoch.',
  'idwal-tirfelyn': 'Sein kurzes Wuschelhaar steht in alle Richtungen ab.',
  'cadwgan-helfaen': 'Er trägt kurze dichte Locken und einen ebenfalls lockigen Bart mit grauen Haaren.',
  'dilys-spouse-helfaen': 'Sie bindet ihre kurzen bis mittellangen Locken locker im Nacken zusammen.',
  'owain-helfaen': 'Sein Kopf ist von dichten kurzen Ringellocken bedeckt.',
  'gorwyn-helfaen': 'Seine mittellangen Locken fallen locker. Das Gesicht ist glatt rasiert.',
  'cerys-helfaen': 'Sie trägt schulterlange Locken und bindet die beiden vorderen Strähnen zurück.',
  'gwrgi-marchwern': 'Er kämmt das kurze Haar zurück und trägt einen kurzen Bart mit ersten grauen Strähnen.',
  'mared-spouse-marchwern': 'Sie trägt das Haar als tiefen geflochtenen Knoten.',
  'rhun-marchwern': 'Er trägt einen Seitenscheitel im mittellangen Haar und einen leichten Bart.',
  'eluned-marchwern': 'Sie bindet das lange Haar zu einem hohen Zopf und flicht einzelne Strähnen an den Seiten.',
  'rhunedd-marchwern': 'Ihr schulterlanges gewelltes Haar ist halb hochgesteckt.',
  'einion-marchwern': 'Sein kurzes Haar ist leicht gewellt. Er trägt einen breiten Schnurrbart.',
  'cynwen-spouse-marchwern': 'Sie steckt zwei Zöpfe als Kranz um den Kopf hoch.',
  'mabon-marchwern': 'Er trägt das kurze Haar mit Seitenscheitel und ist glatt rasiert.',
  'luned-marchwern': 'Sie trägt ihr langes Haar als seitlichen Zopf.',
  'gwynfor-marchwern': 'Sein kurzes Haar ist zerzaust; der Pony fällt etwas länger über die Stirn.',
  'rhosyn-marchwern': 'Sie trägt zwei kurze seitliche Zöpfe.',
  'aneira-spouse-marchwern': 'Sie bindet ihr langes Haar zu einem einfachen Knoten im Nacken.',
  'gwyndaf-marchwern': 'Sein kurzes Haar ist weich und wuschelig.',
  'euron-marchwern': 'Sein feines kurzes Haar bildet einen kleinen Wirbel an der Stirn.'
};

function partnerDescription(reference) {
  if (reference.type === 'engagement') return `Verlobung mit ${reference.name}${reference.status === 'ended' ? '; durch Ceridwens Tod im Jahr 1740 beendet' : ''}`;
  if (reference.type === 'marriage') return `Ehe mit ${reference.name}`;
  return `Partnerschaft mit ${reference.name}`;
}

function closeRelatives(person, household, candidate) {
  const parents = candidate.relationships.parents.filter(reference => allPeople.has(reference.personId));
  const partners = candidate.relationships.partners.filter(reference => allPeople.has(reference.personId));
  const children = candidate.relationships.children.filter(reference => allPeople.has(reference.personId));
  const siblings = household.persons.filter(other => other.id !== person.id && (
    person.parentIds.length && other.parentIds.length === person.parentIds.length && person.parentIds.every(id => other.parentIds.includes(id))
    || household.lineageChildIds.includes(person.id) && household.lineageChildIds.includes(other.id)
  ));
  return { parents, partners, children, siblings };
}

function householdContext(person, household) {
  if (household.slug === 'tirfelyn') return [
    'Der Tirfelyn-Hof versorgt Gwynthor mit Vieh, Getreide und Gemüse. Caradog und sein jüngerer Bruder Eudaf teilen die Leitung; Feldbau, Viehversorgung, Garten, Vorräte und Hauswirtschaft gehören zu demselben Familienbetrieb.',
    person.status === 'dead'
      ? 'Ceridwen wollte ihren Verlobten Gorwyn Helfaen im Jagdhaus besuchen und kam am folgenden Morgen nicht zurück. Vor wenigen Wochen wurde sie Opfer des Fleischsammlers. Der genaue Tat- und Fundort sowie der Ablauf ihrer letzten Nacht sind unbekannt.'
      : 'Der Tod Ceridwens liegt erst wenige Wochen zurück. Die zweiundzwanzigjährige Tochter Caradogs und Enids wollte ihren Verlobten Gorwyn Helfaen besuchen und kam am folgenden Morgen nicht zurück. Die Trauer gehört seither zum Familienalltag; die tägliche Versorgung von Menschen und Tieren läuft weiter.'
  ];
  if (household.slug === 'helfaen') return [
    'Fünf lebende Angehörige teilen das Jagdhaus Helfaen als einen Haushalt. Kleinwildjagd, Wildverarbeitung, Haltbarmachen und der Verkauf kleiner örtlicher Überschüsse tragen den bescheidenen Betrieb. Cadwgan und Gorwyn übernehmen die tägliche Jagdarbeit; Dilys und Arianell helfen bei Verarbeitung und Hauswirtschaft. Owains Aufgaben bleiben altersgemäß.',
    'Gorwyn war mit Ceridwen Tirfelyn verlobt. Sie wollte ihn besuchen und kehrte am folgenden Morgen nicht nach Hause zurück. Ceridwen wurde wenige Wochen zuvor im Jahr 1740 Opfer des Fleischsammlers. Ihr Tod trifft beide Haushalte. Der genaue Tat- und Fundort ist unbekannt.'
  ];
  return [
    'Das Marchwern-Gestüt liegt im Bannkreis Gwynthors. Vierzehn lebende Angehörige tragen den Familienbetrieb. Gwrgi führt das Gestüt mit Unterstützung seines Bruders Gwynog und seiner Frau Mared; die Familie dient Haus Wyrm unmittelbar und stellt gute Reitpferde bereit.',
    'Zucht, Fohlenaufzucht, Stallroutinen, Futterwirtschaft, Bereitung und Hauswirtschaft greifen ineinander. Zum Gestüt gehören vielseitige Rhyfel, einige seltene und anspruchsvolle Ceffyl sowie weitere geeignete Reitpferde. Jüngere Angehörige lernen unter Aufsicht; die kleinen Kinder wachsen im gemeinsamen Haushalt auf.'
  ];
}

export function buildLandfamilienPersonBiography(person, household, candidate) {
  const relatives = closeRelatives(person, household, candidate), surname = familyName(household);
  const introduction = person.status === 'dead'
    ? `${person.name} wurde ${person.birth} geboren und starb 1740 mit ${person.age} Jahren. Sie gehörte zur Familie ${surname} auf dem ${household.placeName}. Ihre Aufgabe vor ihrem Tod war die Gemüsewirtschaft des Familienhofs.`
    : `${person.name} ist im Jahr 1740 ${person.age} Jahre alt und wurde ${person.birth} geboren. ${person.name} lebt mit der Familie ${surname} am ${household.placeName}.`;
  const kinship = [
    ...(relatives.parents.length ? [`Die Eltern sind ${names(relatives.parents)}.`] : ['Die Eltern dieser nahen Familiengeneration sind nicht namentlich überliefert.']),
    ...(relatives.siblings.length ? [`Zur Geschwisterreihe gehören ${names(relatives.siblings)}.`] : []),
    ...relatives.partners.map(reference => partnerDescription(reference) + '.'),
    ...(relatives.children.length ? [`Die Kinder sind ${names(relatives.children)}.`] : [])
  ].join(' ');
  const [economy, history] = householdContext(person, household);
  const appearance = `${person.name} ${person.status === 'dead' ? 'hatte' : 'hat'} ${person.hairColor === 'rot' ? 'rotes' : 'braunes'} Haar und ${person.eyeColor === 'braun' ? 'braune' : person.eyeColor === 'blau' ? 'blaue' : 'grüne'} Augen. ${hairDescriptions[person.id]} ${person.status === 'dead' ? 'Ihre Kleidung entsprach' : 'Die Kleidung entspricht'} dem einfachen ländlichen Haushalt.`;
  const plain = [introduction, person.bio, kinship, economy, history, appearance];
  const connections = [
    ...relatives.parents.map(reference => ({ reference, label: allPeople.get(reference.personId).sex === 'male' ? 'Vater' : 'Mutter' })),
    ...relatives.partners.map(reference => ({ reference, label: partnerDescription(reference) })),
    ...relatives.children.map(reference => ({ reference, label: allPeople.get(reference.personId).sex === 'male' ? 'Sohn' : 'Tochter' })),
    ...relatives.siblings.map(reference => ({ reference: { ...reference, personId: reference.id }, label: reference.sex === 'male' ? 'Bruder' : 'Schwester' }))
  ].map(({ reference, label }) => ({ type: 'connection', name: reference.name, detail: label,
    image: allPeople.get(reference.personId).portrait, imageFormat: 'portrait' }));
  return {
    bio: plain.join('\n\n'),
    biography: {
      schemaVersion: 1, biographyPage: true, pageTitle: person.name, image: person.portrait,
      imageWidth: 32, imageTall: true, imageFit: 'contain', imagePosition: 'center',
      stats: [['Name', person.name], ['Geburt', person.birth], ['Stand 1740', `${person.age} Jahre${person.status === 'dead' ? ' · verstorben 1740' : ''}`],
        ['Familie', surname], ['Wohnort', household.placeName], ['Aufgabe', person.role]],
      biography: {
        portrait: person.portrait, portraitFit: 'contain', biographyTitle: person.role,
        biographyText: paragraphHtml([introduction, person.bio]),
        historyTitle: 'Familie und Lebensweg', historyText: paragraphHtml([kinship, history]),
        worksTitle: 'Der gemeinsame Lebensunterhalt', works: [economy],
        extraSections: [{ position: 'afterWorks', mode: 'text', title: 'Erscheinung', text: paragraphHtml([appearance]) }],
        connectionsTitle: 'Die nächsten Angehörigen', connections,
        documentsTitle: 'Haus und Herkunft', documents: [{ title: `Familie ${surname}`,
          text: 'Die Person und ihre Verwandtschaft im bestehenden Stammbaum.',
          link: `../Stammb%C3%A4ume/Stammbaum.html?family=${household.familyId}&mode=view&person=${person.id}` },
        { title: household.placeName, text: 'Die gemeinsame Hausgeschichte der Familie.',
          link: `../Familien Häuser und Clans/kleinehaeuser.html?haus=${household.familyId}` }],
        footer: `${household.placeName} · Rheunwaith · Cenyr · Stand 1740`
      }
    }
  };
}
