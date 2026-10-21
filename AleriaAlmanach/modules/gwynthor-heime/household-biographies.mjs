import { HOMES_ART } from './households.mjs';

const paragraphs = texts => texts.map(text => `<p>${text}</p>`).join('');
const trait = (id, title, detail) => ({ title, detail, icon: `../IconOrdner/${id === 'family_first' ? 'Cktraits' : 'Big Traits'}/Trait_${id}.png` });
const connection = (name, detail, image = '', imageFormat = 'square') => ({ type: 'connection', name, detail, image, imageFormat });

// Family-wide habits, rather than identical personality assignments to every
// member. Employment links describe only the contacts already established.
const PROFILES = {
  fearnan: {
    title: 'Heimat an der Hafentreppe',
    household: [
      'Eoghan und Muireann bilden mit ihren Töchtern Eithne und Nessa einen kleinen, eng verbundenen Haushalt. Der Vater bringt die Nachrichten vom Wasser mit, die Mutter hält den Tagesablauf zusammen. Eithne möchte alles richtig machen; Nessa findet auch in einem Kiesel eine wichtige Entdeckung.',
      'Am Abend rücken vier Hocker um denselben Tisch. Wenn Eoghan spät zurückkommt, wartet Muireann mit dem Essen, während die Mädchen am Fenster nach ihm Ausschau halten. Der fröhliche Baum an der Tür gehört zu ihren wenigen gemeinsamen Verschönerungen.'
    ],
    traits: [
      trait('family_first', 'Zusammenhalt', 'Was einer vom Tag mitbringt, wird am Familientisch geteilt. Eithne passt auf Nessa auf; Muireann merkt schnell, wenn Eoghan seine Sorgen verschweigt.'),
      trait('content', 'Genügsamkeit', 'Geflickte Kleidung, gebrauchte Möbel und einfaches Essen gehören zum Alltag. Für eine Anschaffung muss zuerst ein wirklicher Bedarf bestehen.'),
      trait('patient', 'Geduld', 'Netze werden Masche für Masche geflickt, Vorräte sorgfältig eingeteilt und Kinderfragen meist bis zum Ende angehört.'),
      trait('diligent', 'Fleiß', 'Eoghans Arbeit auf dem Wasser und Muireanns Haushaltsführung greifen ineinander. Kleine Reparaturen werden erledigt, bevor aus ihnen große Ausgaben werden.'),
      trait('trusting', 'Offenheit im Viertel', 'Eoghan kommt mit anderen Hafenleuten leicht ins Gespräch. Seine Töchter wachsen mit den Booten, Rufen und vertrauten Gesichtern der Docks auf.')
    ],
    history: [
      'Eoghan und Muireann kamen 1728 aus Leitheach nach Gwynthor und richteten sich im Hafenviertel ein. Hier wuchsen Arbeit, Ehe und Zuhause allmählich zusammen. Ihre Töchter wurden bereits in Gwynthor geboren und kennen die alte Heimat vor allem aus den Erzählungen der Eltern.',
      'Der Familienkreis besteht aus den vier Bewohnern dieses Hauses. Ihr Name hat im Viertel vor allem mit Eoghans Arbeit und Muireanns verlässlichem Haushalt zu tun. Der Baum auf dem Holzzeichen macht ihre Tür auch für jemanden erkennbar, der die Fearnan erst einmal besucht hat.'
    ],
    economy: [
      'Eoghans Fischerei trägt den Lebensunterhalt. Wie viel davon übrig bleibt, hängt von Fang, Wetter und den notwendigen Arbeitsausgaben ab. Reparaturen an Netzen und Kleidung lassen sich aufschieben, bis sie dringend werden; Muireann versucht, genau das zu vermeiden.',
      'Das kleine Haus ist ihr Eigentum und der einzige größere Besitz. Essen, Abgaben, Brennstoff und gewöhnlicher Hausrat haben Vorrang. Ein Kredit eines örtlichen Geld- und Pfandverleihers half ihnen über eine knappe Zeit; sie trugen die Raten regelmäßig ab und legten die letzte Tilgung zusammen mit einer kleinen Rücklage zurück. Nach einem Einbruch fehlt die Schatulle mit diesem Geld. Der Verleiher bietet ihnen nun neue Bedingungen gegen den Verkauf des Hauses an, in dem sie anschließend zur Miete wohnen dürften. Bevor sie zustimmen, bitten sie um Nachforschungen.'
    ],
    contacts: home => [
      connection('Fischer und Hafenleute an den Docks', 'Eoghans tägliches Arbeitsumfeld: andere Fischer, bekannte Anlandestellen und die Menschen, die den Fang übernehmen.', home.people[0].portrait, 'portrait'),
      connection('Leitheach', 'Die alte Heimat beider Eltern. Ihre Erzählungen halten diese Verbindung auch für Eithne und Nessa lebendig.'),
      connection('Die rote Klaue · Lucan und Camilla Valerus', 'Geldgeber der Familie. Nach dem Diebstahl der Kreditrate und der Ersparnisse bieten die Zwillinge Schuldverrechnung gegen Hausverkauf und anschließende Miete an. Die Familie lässt die Umstände prüfen; eine Beteiligung am Diebstahl ist nicht bewiesen.', './assets/rote-klaue/portraits/lucan.png', 'portrait')
    ],
    details: ['Vier Personen leben von Fischerei und sorgfältiger Haushaltsführung.', 'Das bescheidene Haus liegt im Hafenviertel, nahe Eoghans Arbeitswegen.'],
    aside: ['Eithne ist die ältere, Nessa die jüngere der beiden Töchter.', 'Beide Mädchen haben am fröhlichen Baum des Türzeichens mitgemalt.'],
    quote: '„Erst sehen, ob alle da sind. Dann sehen wir nach dem Rest.“ — Muireann'
  },
  torvik: {
    title: 'Ein ordentlicher Platz im Marktviertel',
    household: [
      'Haldor Torvik, Maonaid und ihr Sohn Iver teilen ein einfaches Haus in einer Seitengasse des Marktviertels. Haldor bringt Ruhe und eine gewisse Sturheit mit; Maonaid hält mit trockenem Humor dagegen. Iver hört beiden aufmerksam zu, bis ihm die nächste Frage zu einem Werkzeug einfällt.',
      'Nach Haldors Arbeit werden erst die rußigen Sachen abgelegt. Am geschrubbten Tisch erzählt Iver dann von seinen Holzschnitzereien, während Maonaid prüft, was für den nächsten Tag noch besorgt werden muss. Ordnung ist ihnen wichtig, ohne dass das Haus deswegen still wäre.'
    ],
    traits: [
      trait('diligent', 'Sorgfalt', 'Haldor erledigt auch einfache Handgriffe ordentlich. Maonaid hält Hauszeug und Vorräte in Schuss; Iver soll seine angefangenen Arbeiten zu Ende bringen.'),
      trait('honest', 'Gerader Umgang', 'Auf ein gegebenes Wort soll Verlass sein. Fehler werden zu Hause angesprochen, auch wenn Haldor dafür manchmal einen zweiten Anlauf braucht.'),
      trait('stubborn', 'Eigensinn', 'Haldor hält an einer bewährten Lösung gern etwas länger fest. Maonaid weicht bei schlechtem Mehl oder falschem Gewicht ebenso wenig zurück.'),
      trait('temperate', 'Maßhalten', 'Der Haushalt lebt nach seinen Mitteln. Brauchbarer Hausrat wird repariert, und vor einem Kauf wird überlegt, ob das alte Stück noch eine Weile hält.'),
      trait('just', 'Sinn für Fairness', 'Ordentliche Arbeit verdient ordentlichen Lohn, und ein ehrlicher Einkauf das richtige Gewicht. Diesen einfachen Maßstab bekommt auch Iver mit auf den Weg.')
    ],
    history: [
      'Haldor stammt aus Aldrimar, Maonaid aus Leitheach. Seit ihrer Heirat 1727 führen sie einen gemeinsamen Haushalt. Im Marktviertel haben die beiden einen Alltag gefunden, der von Haldors Arbeit und Maonaids Wegen zu den Händlern geprägt ist.',
      'Iver ist ihr einziges Kind. Er kennt die Werkzeuge seines Vaters und schaut gelegentlich unter Aufsicht in der Schmiede zu. Welches Handwerk er später erlernen wird, ist noch offen; seine kleinen Schnitzereien liefern bislang reichlich Gesprächsstoff.'
    ],
    economy: [
      'Haldors Gehilfenlohn bildet die Grundlage. Sein derzeitiger Meister ist launisch, zahlt schlecht und verlangt Überstunden, die er kaum oder gar nicht vergütet. Nach einem heftigen Streit am vergangenen Lyristag wollte Haldor beim Grafenhof vorsprechen, erhielt aber keinen freien Gesuchsplatz mehr. Anschließend ging er zum Kleinen Durst und ist seither nicht heimgekehrt. Nach Auskunft des Wirtes sprach er von einer neuen Arbeitsstelle, bevor er aufbrach.',
      'Das gepachtete Haus, Lebensmittel, Brennstoff und Kleidung werden aus seinem Einkommen bezahlt. Maonaid hat die Stadt um Hilfe gebeten und wegen der ausstehenden Suche ein eigenes Gesuch angeschlagen. Für Haldors sichere Rückkehr würde sie ihr altes Familienamulett hergeben und nötigenfalls dreißig Kupfertaler dazugeben. Ohne ihn fehlen dem Haushalt sein Angehöriger und sein Lebensunterhalt.'
    ],
    contacts: home => [
      connection('Eine Schmiedewerkstatt im Marktviertel', 'Haldors Arbeitsstelle und sein täglicher Kontakt zu Schmieden und anderen Gehilfen.', home.people[0].portrait, 'portrait'),
      connection('Händler der Nachbargassen', 'Maonaid kennt die örtlichen Einkaufswege und achtet auf brauchbare Ware und richtige Gewichte.', home.people[1].portrait, 'portrait')
    ],
    details: ['Drei Personen leben von Haldors Gehilfenlohn und Maonaids Haushaltsführung.', 'Für Werkzeug, Ausbildung und Anschaffungen wird nach Möglichkeit gespart.'],
    aside: ['Haldor klopft den Ruß dreimal an der Türschwelle von den Stiefeln.', 'Auf dem Fenstersims steht häufig eine angefangene Schnitzerei Ivers.'],
    quote: '„Ordentlich soll es sein. Teuer muss es nicht sein.“ — Maonaid'
  },
  celynfor: {
    title: 'Zwei Arbeitswege, ein gemeinsames Zuhause',
    household: [
      'Gwydan und Llinos Celynfor haben erst vor Kurzem ihren eigenen Haushalt gegründet. Seine gelassene Art und ihr freches Lächeln passen gut zusammen. Nach einem langen Arbeitstag genügt oft eine kleine Bemerkung über den schiefen Stuhl oder den anspruchsvollen Hund, um beide zum Lachen zu bringen.',
      'Kinder haben die beiden noch nicht. Zu ihrem Alltag gehört Spant, ein junger Brág, der neugierig an der Tür wartet und den Platz vor dem Herd für sich beansprucht. Zwischen Arbeitskleidung, Werkzeugbrett und gemeinsamer Truhe wächst langsam ein Zuhause, in dem jedes brauchbare Stück seinen Platz bekommt.'
    ],
    traits: [
      trait('gregarious', 'Geselligkeit', 'Llinos kommt in der Kanne leicht ins Gespräch, und Gwydan hört gern zu. Zu Hause geht der Gesprächsstoff selten vor dem Brennholz aus.'),
      trait('patient', 'Gelassenheit', 'Gwydan geht kleine Reparaturen in Ruhe an. Seine Geduld hilft auch dann, wenn Spant etwas verschleppt oder der gemeinsame Tagesplan nicht aufgeht.'),
      trait('diligent', 'Anpacken', 'Werftarbeit, Wassereimer und Lampendienst lassen wenig Raum für liegen gebliebene Handgriffe. Im eigenen Haus teilen die beiden die nötige Arbeit untereinander auf.'),
      trait('content', 'Freude am Einfachen', 'Ein brauchbarer Tisch, ein frisch gescheuerter Boden und ein ruhiger Abend reichen vorerst. Gebrauchte Dinge werden passend gemacht und nach und nach ergänzt.'),
      trait('family_first', 'Ein gemeinsamer Anfang', 'Seit der Hochzeit werden Pläne und Ausgaben zusammen besprochen. Beide bringen ihren Verdienst und ihre Fähigkeiten in denselben Haushalt ein.')
    ],
    history: [
      'Beide sind Cenyri aus Gwynthor. Seit ihrer Hochzeit 1739 führen sie den Namen Celynfor und wohnen zwischen Hafen und Marktviertel. Gwydan kann von hier zur Werft gehen, Llinos zur Krummen Kanne.',
      'Llinos arbeitet weiterhin als Hausmagd bei den drei Wirten Merrik, Hrolf und Aedan. Ihr alter Arbeitskreis bleibt Teil ihres Alltags. Gwydan steht als Schiffsbaugeselle im Arbeitsleben und bringt aus seinem Handwerk die Fähigkeit mit, gewöhnlichen Hausrat selbst auszubessern.'
    ],
    economy: [
      'Der Haushalt erhält zwei Erwerbseinkommen: Gwydans Gesellenlohn aus dem Schiffsbau und Llinos’ Lohn aus der Krummen Kanne. Damit lassen sich Pacht, Essen, Brennstoff und Kleidung leichter aufteilen. Die beiden achten darauf, Anschaffungen mit den vorhandenen Mitteln zu bezahlen.',
      'Das Haus ist gepachtet, ein Teil der Einrichtung gebraucht oder selbst zurechtgemacht. Spants Futter und die Pflege von Arbeitskleidung und Werkzeug gehören ebenfalls in die Haushaltskasse. Wenn beide regelmäßig Arbeit haben, bleibt Spielraum für kleine Rücklagen. Eine Krankheit oder eine längere Lücke bei der Werftarbeit würde diesen Spielraum verringern.'
    ],
    contacts: home => [
      connection('Die Krumme Kanne', 'Llinos’ Arbeitsplatz unter Merrik Trevoryn, Hrolf Svathamar und Aedan Dubhdarach; Hausdienst für Wasser, Lampen und Schankstube.', './assets/krumme-kanne/references/kanne-schild.png'),
      connection('Nestwen Trevoryn', 'Die Wäschehüterin der Kanne bringt Llinos nebenbei das Stopfen bei.', './assets/krumme-kanne/portraits/nestwen.png', 'portrait'),
      connection('Schiffsbauer an den Werften', 'Gwydans berufliches Umfeld: gemeinsame Arbeit beim Bau und bei der Ausbesserung von Handelsschiffen.', home.people[0].portrait, 'portrait')
    ],
    details: ['Zwei Erwachsene und der Familienhund Spant teilen das kleine Haus.', 'Zwei Arbeitslöhne tragen den gemeinsamen Haushalt.'],
    aside: ['Llinos hat ein blaues Tuch ans Fenster gehängt.', 'Spants Decke liegt am Herd; Gwydans Werkzeug hängt trocken am Brett.'],
    quote: '„Wenn der Tisch wackelt, machen wir ihn eben gerade.“ — Gwydan'
  }
};

export function buildHouseholdBiographyPage(home) {
  const profile = PROFILES[home.slug];
  if (!profile) throw new Error(`Familienbio fehlt: ${home.slug}`);
  return {
    schemaVersion: 1, pageTitle: `Die ${home.surname} · Familienbio`, commentThreadKey: `${home.slug}-familienbio`, biographyPage: true,
    image: `${HOMES_ART}/${home.slug}/familienbild.png`, imageWidth: 34, imageTall: true, imageFit: 'contain', imagePosition: 'center',
    stats: [['Familie', home.people.map(p => `${p.name} (${p.age})`).join(' · ')], ['Wohnort', `Gwynthor-Stadt · ${home.district}`], ['Gemeinsamer Haushalt', `Seit ${home.marriageYear}`]],
    biography: {
      portraitFit: 'contain',
      biographyTitle: profile.title, biographyText: paragraphs(profile.household),
      abilitiesTitle: 'Persönlichkeit der Familie', abilities: profile.traits,
      historyTitle: 'Aufbau & Hintergrund', historyText: paragraphs(profile.history),
      worksTitle: 'Im Alltag', works: profile.details,
      extraSections: [{ position: 'afterWorks', mode: 'text', title: 'Lebensunterhalt & Wirtschaftlichkeit', text: paragraphs(profile.economy) }],
      triviaTitle: 'Kleine Gewohnheiten', trivia: profile.aside,
      quotesTitle: 'Am Familientisch', quotes: [profile.quote],
      connectionsTitle: 'Verbindungen & Kontakte', connections: profile.contacts(home),
      documentsTitle: 'Familienakte', documents: [{ title: `Familie ${home.surname}`, icon: `${HOMES_ART}/${home.slug}/wappen.png`,
        text: 'Der gemeinsame Haushalt und seine Verwandtschaft im kleinen Stammbaum.', link: `../Stammb%C3%A4ume/Stammbaum.html?family=haus-${home.slug}&mode=view` }]
    }
  };
}
