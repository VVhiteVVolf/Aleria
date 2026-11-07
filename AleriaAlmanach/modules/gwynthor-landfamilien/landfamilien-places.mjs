import { GWYNTHOR_BANNKREIS_PATH } from '../gwynthor-geography/gwynthor-section-layout.mjs';

export const LANDFAMILIEN_ART = '/AleriaAlmanach/assets/gwynthor-landfamilien';
export const LANDFAMILIEN_MAP_ID = 'cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis';

// The seven-location case geography remains owned by the map. These three
// profiles describe only the households requested for playable modules.
export const LANDFAMILIEN_PLACES = Object.freeze([
  {
    slug: 'tirfelyn', id: 'tirfelyn-hof', title: 'Tirfelyn-Hof', pinId: 'gwynthor-marking-107',
    type: 'Bauernhof', summary: 'Zwei Brüder, ihre Familien und ein Hof für Gwynthors tägliche Versorgung.',
    description: [
      'Der Tirfelyn-Hof liegt unmittelbar vor Gwynthor. Hier gehören Viehhaltung, Getreidefelder und Gemüsewirtschaft zu einem gemeinsamen Familienbetrieb. Die Arbeit reicht vom Futter am Morgen bis zur Vorbereitung der nächsten Lieferung in die Stadt.',
      'Zwei Brüder führen den Hof miteinander. Ihre Angehörigen übernehmen eigene Aufgaben in Stall, Feld, Garten, Vorratshaltung und Hauswirtschaft. Die jüngeren Kinder helfen bei überschaubaren Handgriffen und lernen den Betrieb an der Seite der Erwachsenen kennen.',
      'Seit wenigen Wochen fehlt eine der Töchter am Familientisch. Die zweiundzwanzigjährige Ceridwen wollte ihren Verlobten bei den Helfaen besuchen und kam am nächsten Morgen nicht zurück. Sie wurde 1740 Opfer des Fleischsammlers. Der Verlust begleitet die Familie auch während der nötigen täglichen Arbeit.'
    ],
    activities: ['Viehhaltung und Futterversorgung', 'Getreide- und Gemüseanbau', 'Vorräte und Lieferungen nach Gwynthor'],
    groups: [
      ['leitung', 'Die beiden Brüder'], ['feld', 'Felder und Gemüse'], ['vieh', 'Vieh und Futter'],
      ['haushalt', 'Haus, Vorräte und Wege'], ['nachwuchs', 'Jüngere Hände']
    ],
    hierarchyTitle: 'Die Hände des Tirfelyn-Hofs',
    hierarchyIntro: 'Die Hofleitung liegt bei den beiden Brüdern. Die übrigen Erwachsenen tragen eigene Arbeitsbereiche; die Aufgaben der Kinder bleiben altersgemäß. Diese Struktur zeigt Verantwortung im Familienbetrieb.',
    exterior: 'Ein breiter, festgetretener Hof verbindet Wohnhaus, Stall und Scheune. Hinter niedrigen Einfriedungen liegen Gemüsegärten und Futterplätze; an den Wegen beginnt das Ackerland. Vom Hoftor aus führen die täglichen Lieferwege nach Gwynthor. Hier kann man ankommen, nach der Familie fragen oder einen Tag bei der Hofarbeit beginnen.',
    room: 'Eine geräumige, schlichte Wohnstube mit verputzten Wänden, sichtbaren Holzbalken und einer gemauerten Herdstelle. Am langen Familientisch stehen Bänke und verschieden alte Stühle. Geschirr, Leinentücher und Vorräte haben feste Plätze; durch das Fenster sieht man einen Teil des Hofs. Die Stube ist der Ort für Mahlzeiten, Absprachen und Gespräche unter Angehörigen.',
    householdNote: 'Große Bauernfamilie mit gemeinsamem Betrieb',
    connections: [{ name: 'Familie Helfaen', detail: 'Ceridwens Verlobung verbindet beide Familien. Nach ihrem Tod tragen sie die Trauer gemeinsam.', familyId: 'haus-helfaen' }]
  },
  {
    slug: 'helfaen', id: 'jagdhaus-helfaen', title: 'Jagdhaus Helfaen', pinId: 'gwynthor-marking-115',
    type: 'Jagdhaus', summary: 'Ein kleiner Jägerhaushalt zwischen Waldwegen, Kleinwild und gemeinsamer Wohnstube.',
    description: [
      'Das Jagdhaus Helfaen ist Wohn- und Arbeitsort einer kleinen Rheunwaith-Familie. Fünf lebende Angehörige teilen einen Haushalt. Ihr Lebensunterhalt beruht vorwiegend auf Kleinwildjagd, Verarbeitung und dem örtlichen Verkauf kleiner Überschüsse.',
      'Die Erwachsenen teilen Jagd, Pflege der einfachen Ausrüstung, Wildverarbeitung und Hauswirtschaft untereinander auf. Der Nachwuchs wird behutsam an den Alltag herangeführt. Das Jagdhaus ist ein bescheidener Familienbetrieb.',
      'Einer der Söhne war mit Ceridwen Tirfelyn verlobt. Sie wollte ihn hier besuchen und kehrte am folgenden Morgen nicht zurück. Ihr Tod vor wenigen Wochen im Jahr 1740 verbindet die Helfaen mit der Trauer auf dem Tirfelyn-Hof. Ein genauer Tatort und der Ablauf ihrer letzten Nacht sind nicht festgelegt.'
    ],
    activities: ['Kleinwildjagd', 'Wildverarbeitung und Haltbarmachen', 'Örtlicher Verkauf und gemeinsamer Haushalt'],
    groups: [['leitung', 'Den Haushalt tragen'], ['jagd', 'Jagd und Wege'], ['verarbeitung', 'Verarbeitung und Haus'], ['nachwuchs', 'Im Haushalt aufwachsen']],
    hierarchyTitle: 'Jagd, Haus und Familie Helfaen',
    hierarchyIntro: 'Fünf Angehörige bilden einen Haushalt. Jagd und Verarbeitung greifen ineinander; jüngere Familienmitglieder haben überschaubare Aufgaben unter Aufsicht.',
    exterior: 'Ein kleines Jagdhaus aus Stein und dunklem Holz steht an einem ruhigen Weg zwischen Feldrand und Gehölz. Unter dem tiefen Vordach liegt trockenes Brennholz. Ein schlichter Arbeitsbereich hinter dem Haus dient den alltäglichen Handgriffen. Wer den Hof betritt, hört die Schritte vor der Tür und den Wind in den nahen Bäumen.',
    room: 'Die kleine gemeinsame Wohnstube hat eine niedrige Balkendecke, eine Herdstelle und einen kräftigen Holztisch. Fünf Sitzplätze, eine Truhe, einfaches Geschirr und sauber verwahrte Arbeitskleidung füllen den Raum. Durch das kleine Fenster fällt Licht vom Waldrand. Hier bespricht die Familie den nächsten Tag und empfängt einen Besucher am Feuer.',
    householdNote: 'Fünf lebende Angehörige in einem Haushalt',
    connections: [{ name: 'Familie Tirfelyn', detail: 'Die verstorbene Ceridwen Tirfelyn war mit einem Sohn des Hauses verlobt.', familyId: 'haus-tirfelyn' }]
  },
  {
    slug: 'marchwern', id: 'marchwern-gestuet', title: 'Marchwern-Gestüt', pinId: 'gwynthor-marking-092',
    type: 'Familiengestüt', summary: 'Vierzehn Angehörige und die tägliche Arbeit mit Gwynthors Reitpferden.',
    description: [
      'Das Marchwern-Gestüt ist ein wichtiger Pferdezuchtbetrieb im Bannkreis Gwynthors. Vierzehn lebende Angehörige tragen den Familienbetrieb. Die Marchwern dienen Haus Wyrm unmittelbar und stellen gute Reitpferde bereit.',
      'Zucht, Fohlenaufzucht, Stallpflege, Futterwirtschaft und die Vorbereitung geeigneter Tiere greifen ineinander. Der Alltag verlangt feste Routinen und verlässliche Bezugspersonen. Neben vielseitigen Rhyfel werden auch wenige anspruchsvolle Ceffyl sorgfältig betreut.',
      'Hauswirtschaft und Wege nach Gwynthor gehören ebenso dazu wie die Arbeit am Pferd. Die jüngeren Angehörigen lernen unter Aufsicht; sie übernehmen keine selbständige Verantwortung für schwierige Tiere. Die Dienstbindung an Wyrm bleibt vom tatsächlichen Wohnort am Gestüt bei Gwynthor getrennt.'
    ],
    activities: ['Pferdezucht und Fohlenaufzucht', 'Stallpflege und Futterwirtschaft', 'Bereitung geeigneter Reitpferde für Haus Wyrm'],
    groups: [['leitung', 'Den Betrieb führen'], ['zucht', 'Zucht und Aufzucht'], ['stall', 'Stall und Futter'], ['bereitung', 'Bereitung und Wege'], ['haushalt', 'Haus und Vorräte'], ['nachwuchs', 'Unter Aufsicht lernen']],
    hierarchyTitle: 'Die Familie im Marchwern-Gestüt',
    hierarchyIntro: 'Die Zuchtarbeit hat feste Zuständigkeiten. Bereitung, Stall und Hauswirtschaft unterstützen einander; die Aufgaben der Kinder sind vom selbständigen Umgang mit schwierigen Pferden getrennt.',
    exterior: 'Ein offener Gestütshof liegt zwischen langgestreckten Ställen, Wohnhaus und umzäunten Ausläufen. Gepflegte Holzriegel und breite Wege halten Pferdebereiche und Hauszugang übersichtlich. Hinter den Gebäuden liegen Weiden und Futterflächen. Vom Hoftor aus kann ein Gespräch mit den Züchtern, ein Besuch bei der Familie oder die Vorstellung eines Pferdes beginnen.',
    room: 'Die Wohnstube der Marchwern ist geräumig und ordentlich. Ein langer Tisch, schwere Bänke und eine helle Herdstelle nehmen die Mitte ein; an der Wand stehen Truhen und ein einfaches Geschirrbrett. Saubere Mäntel hängen am Eingang, während Stallsachen draußen bleiben. Durch die Fenster sieht man den Hof und einen Teil der Einfriedung.',
    householdNote: 'Vierzehn lebende Angehörige im Familienbetrieb',
    connections: [{ name: 'Haus Wyrm', detail: 'Unmittelbarer Dienst und Bereitstellung guter Reitpferde.', link: '../Familien Häuser und Clans/haus.html?haus=haus-wyrm' }]
  }
]);

export function landfamilienSection(place) {
  return { key: place.title, tab: 'Völker & Kulturen', path: [...GWYNTHOR_BANNKREIS_PATH, place.title],
    desc: place.summary, icon: `/Stammbäume/assets/images/houses/Llamreis Ankunft/Bürgerliche/Gwynthor/fleischsammler/haus-${place.slug}.png` };
}

export function landfamilienSceneImage(slug, room) {
  return `${LANDFAMILIEN_ART}/scenes/${slug}-${room}-v2.png`;
}
