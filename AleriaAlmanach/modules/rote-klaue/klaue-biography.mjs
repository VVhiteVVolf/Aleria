import { VALERUS_EMBLEM, VALERUS_FAMILY_LINK, VALERUS_MOTTO, klauePerson } from './klaue-people.mjs';
import { GUILD_EMBLEMS } from '../klingende-muenze-gwynthor/post-section.mjs';
const trait = (id, title, detail) => ({ title, detail, icon: `../IconOrdner/${id === 'family_first' ? 'Cktraits' : 'Big Traits'}/Trait_${id}.png` });
export function buildValerusBiography() {
  return {
    crestImage: `../Stammbäume/${VALERUS_EMBLEM}`, biographyTitle: 'Zwei Unterschriften, eine Kasse',
    biographyText: '<p>Lucan schiebt das Geld über das Tuch, während Camilla den Pfandzettel noch einmal zu sich dreht. Eine kleine Korrektur, sagt sie. Ihr Bruder wartet mit derselben freundlichen Miene, bis der Kunde genickt hat. Die Zwillinge kennen diesen Wechsel seit Jahren; selten müssen sie einander dazu ansehen.</p><p>Beide sind dreiunddreißig. Sie haben die Rote Klaue von ihrem Vater geerbt und führen sie gemeinsam. Wer nach dem eigentlichen Hausherrn fragt, erhält von beiden dieselbe Antwort: „Ihr sprecht bereits mit ihm.“ Camilla pflegt bei ihrem Teil der Antwort besonders deutlich zu lächeln.</p>',
    historyTitle: 'Vom Kompaniesold zum Pfandhaus',
    historyText: '<p>Decian Valerus kam aus Venalys. Nach langen Jahren als Söldner der Roten Kompanie kaufte er 1712 mit Ersparnissen und seiner Pension einen kleinen Laden in Gwynthor. Er kannte Fuhrleute, Kameraden und Handwerker, denen zwischen zwei Zahlungen das Bargeld fehlte. Aus wenigen hinterlegten Werkzeugen und Schmuckstücken wurden Darlehensbücher, verschlossene Schränke und ein festes Geschäft mit der Klingenden Münze.</p><p>Severina, die Mutter der Zwillinge, starb 1729. Decian erlag 1736 einer Lebensmittelvergiftung. Die abschließende Erbteilung und einzelne Forderungen gegen seinen Nachlass sind noch nicht geklärt. Lucan und Camilla führen den Betrieb dennoch einvernehmlich fort. Im Laden steht Decians Kompanieharnisch auf einer Büste. Er trägt keinen Pfandzettel und steht nicht zum Verkauf.</p>',
    abilitiesTitle: 'Fünf Züge des Hauses', abilities: [
      trait('greedy', 'Besitzbewusst', 'Ein Versprechen ist den Zwillingen lieber, wenn eine Sache danebenliegt, die sie bis zur Zahlung behalten dürfen.'),
      trait('deceitful', 'Verschlagen', 'Lucan spricht über den heutigen Ausweg; Camilla sorgt dafür, dass auch der nächste Zahlungstermin dem Haus nützt.'),
      trait('ambitious', 'Ehrgeizig', 'Aus Decians kleinem Pensionärsgeschäft soll ein unverzichtbarer Geldgeber des Viertels werden.'),
      trait('arrogant', 'Dünkelhaft', 'Aerwen misst Gesellschaft an Kleidung und Auftreten. Auch die Zwillinge genießen es, wenn Kunden sich vor ihrem Schreibtisch kleiner machen.'),
      trait('family_first', 'Zwillingsbund', 'Über ihre gemeinsame Kasse lassen Lucan und Camilla niemanden verfügen. Selbst Aerwen erreicht Lucan leichter beim Abendessen als gegen den erklärten Willen seiner Schwester.')
    ],
    worksTitle: 'Aerwen aus Aberon',
    works: ['Lucan heiratete Aerwen 1735. Sie stammt aus Aberon in Sonnenküste und ist Wohlstand und gute Gesellschaft gewohnt. Er gefällt sich an der Seite einer Frau, die beides sichtbar mitbringt.',
      'Aerwen empfängt vermögende Kunden, pflegt Einladungen und begleitet Lucan. Hausarbeit erledigt Eneth. Camilla bleibt höflich, zählt kostspielige Wünsche ihrer Schwägerin aber sehr genau mit. Kinder sind bislang nicht verzeichnet.'],
    triviaTitle: 'Wovon das Haus lebt', trivia: ['Decians Gründungskapital und die angesammelten Rückflüsse tragen die Darlehen. Ein eigenes Konto bei der Roten Bank und vereinbarte Gildenfinanzierungen ergänzen die verfügbare Kasse.',
      'Verdient wird an vereinbarten Zinsen, Wechselgebühren und Überschüssen rechtmäßig verwerteter Pfänder. Ausgezahlte Kredite und zurückgezahlter Darlehensstamm sind kein Verkaufserlös. Ausfälle, Lagerkosten und Wachlöhne mindern den Ertrag.'],
    quotesTitle: 'Wahlspruch', quotes: [VALERUS_MOTTO], connectionsTitle: 'Verbindungen und offene Anliegen', connections: [
      { name: 'Klingende Münze', image: GUILD_EMBLEMS.coin, detail: 'Kooperationsbetrieb und örtliches Gildenmitglied. Lucan und Camilla führen den Laden; das Haus gehört zum gemeinsamen Verbund mit Roter Bank und Roter Kompanie.' },
      { name: 'Rote Bank', image: GUILD_EMBLEMS.bank, detail: 'Gildenkonto, Abrechnung und vereinbarte Finanzierung. Die Klaue ist ein Pfand- und Darlehenshaus, keine eigenständige Bankgilde.' },
      { name: 'Rote Kompanie', image: GUILD_EMBLEMS.company, detail: 'Drei zugewiesene Legionäre schützen Kasse, Magazin und Transporte. Decians früherer Dienst begründete die Verbindung.' },
      { name: 'Aerwens Gesellschaft in Aberon', image: klauePerson('aerwen').portrait, detail: 'Verbindungen in die benachbarte Grafschaft Sonnenküste. Ein Herkunftshaus wurde noch nicht festgelegt.' },
      { name: 'Familie Fearnan', image: './assets/gwynthor-heime/fearnan/muireann.png', detail: 'Die Klaue ist ihr Geldgeber. Nach dem Diebstahl der letzten Kreditrate und der Ersparnisse liegt ein Angebot über Hausverkauf, Schuldverrechnung und anschließende Miete vor. Die Familie sucht Hilfe; wer die Schatulle stahl, ist ungeklärt.' }
    ], documentsTitle: 'Familienakte', documents: [{ title: 'Haus Valerus', icon: `../Stammbäume/${VALERUS_EMBLEM}`, link: VALERUS_FAMILY_LINK, text: 'Gründerknoten, Zeitsprung zu Decian und Severina, die Zwillinge und Lucans Ehe.' }]
  };
}
