import { createFamilyPerson } from './family-record-builders.js';

// Belegte Angehörige der Leeren Flasche. Alter ist keine exakte Geburtsdatierung;
// aus dem gemeinsamen Nachnamen werden keine Abstammungskanten abgeleitet.
export const LYNNE_CREW_MEMBERS = Object.freeze([
  { id: 'nest-mathgraig', name: 'Nest Mathgraig', surname: 'Mathgraig', rankId: 'commoner', seat: 'Talgarth', sourceRevision: 3,
    title: 'Steuerfrau der Leeren Flasche', age: '35–38 Jahre',
    houseDescription: 'Bürgerhaus der Klaueninseln mit engen Verbindungen zum Hafen.',
    notes: 'Erfahrene Seefahrerin und Waffenknecht; besonders bei schwerer See souverän am Ruder.' },
  { id: 'bethan-prys', name: 'Bethan Prys', surname: 'Prys', rankId: 'commoner', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-prys.png',
    title: 'Schiffskaplanin der Leeren Flasche', age: '39 Jahre',
    houseDescription: 'Bürgerfamilie aus Talgarth, die eine große Taverne betreibt.',
    notes: 'Geistliche Baldrans, an seiner Kathedrale in Talgarth ausgebildet. Fröhlich und trinkfest, mit einer Narbe über einem Auge.' },
  { id: 'mabli-morgwynt', name: 'Mabli Morgwynt', surname: 'Morgwynt', rankId: 'knight', seat: 'Talgarth',
    sourceRevision: 3, portrait: '../AleriaAlmanach/assets/ship-crews/lynnes-schiffsmannschaft/revised-2026-10-05/mabli-morgwynt.png',
    title: 'Bootsfrau der Leeren Flasche', age: '28–29 Jahre',
    houseDescription: 'Niederes Ritterhaus der Klaueninseln. Mabli Morgwynt dient als Bootsfrau auf Lynne Arths Schiff.',
    notes: 'Patent, seefest und energisch. Ihre Knappin Una Dyfrgi dient ebenfalls an Bord.' },
  { id: 'angharad-morglan', name: 'Angharad Morglan', surname: 'Morglan', rankId: 'commoner', seat: 'Talgarth', sourceRevision: 3,
    title: 'Quartiermeisterin der Leeren Flasche', age: '58 Jahre',
    houseDescription: 'Alte Fischerfamilie der Klaueninseln. Als bürgerliche Fischerfamilie geführt; ein Adelstitel ist nicht überliefert.',
    notes: 'Hat bereits unter Run gedient. Wird an Bord Großmütterchen genannt, obwohl sie diesen Rufnamen nicht mag.' },
  { id: 'ffion-bowen', name: 'Ffion Bowen', surname: 'Bowen', rankId: 'commoner', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-bowen.png',
    title: 'Schiffszimmerfrau der Leeren Flasche', age: '25 Jahre',
    houseDescription: 'Bürgerfamilie aus Talgarth in Sturmklaue mit einer eigenen Werft, in der die Leere Flasche gebaut wurde.',
    notes: 'Handwerkerin aus der Familienwerft; patent, kräftig und in einer Prügelei keineswegs hilflos.' },
  { id: 'nerys-bevan', name: 'Nerys Bevan', surname: 'Bevan', rankId: 'unknown', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-bevan.png',
    title: 'Feldscherin der Leeren Flasche', age: '30 Jahre',
    houseDescription: 'Familie Nerys Bevans aus Talgarth in Sturmklaue auf den Klaueninseln. Der Hausrang ist noch nicht belegt.',
    notes: 'Braunhaarig, mit grünen Augen. Mischt Arzneien und führt ihre alkoholische „Medizin“ stets mit sich.' },
  { id: 'lowri-arian', name: 'Lowri Arian', surname: 'Arian', rankId: 'unknown', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-arian.png',
    title: 'Schiffsmeierin der Leeren Flasche', age: '30 Jahre',
    houseDescription: 'Familie Lowri Arians aus Talgarth in Sturmklaue auf den Klaueninseln. Der Hausrang ist noch nicht belegt.',
    notes: 'Verwaltet Schiffskasse, Sold und wertvolle Güter. Kontrolliert und zuverlässig, bis Alkohol ins Spiel kommt.' },
  { id: 'awen-dyger', name: 'Awen Dyger', surname: 'Dyger', existingHouse: true,
    title: 'Schiffsmusikantin der Leeren Flasche', age: '25 Jahre',
    notes: 'Rothaarig, lebenslustig und häufig etwas angetrunken; kümmert sich stark um die Mannschaft. Spielt Schifferklavier statt Laute. Tochter Cynan Dygers und Efas, Schwester Iwrbans und Cousine Rhy Dygers; Caedmon ist ihr Onkel.' },
  { id: 'sigrid-hirschhorn', name: 'Sigrid Hirschhorn', surname: 'Hirschhorn', rankId: 'unknown', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-hirschhorn.png',
    title: 'Wachmeisterin der Leeren Flasche', age: '28 Jahre',
    houseDescription: 'Familie Sigrid Hirschhorns, auf Nutzervorgabe Talgarth in Sturmklaue auf den Klaueninseln zugeordnet. Sigrid selbst stammt aus Ivarsheim. Hausrang und eine Umsiedlungsgeschichte sind nicht belegt.',
    notes: 'Stammt aus Ivarsheim. Kräftig, wachsam und im Dienst diszipliniert; außerhalb des Dienstes dem Alkohol zugetan.' },
  // Die veröffentlichte ID bleibt trotz Rücknahme der Umbenennung stabil.
  { id: 'eirlys-beryn', name: 'Eira Beryn', surname: 'Beryn', existingHouse: true,
    title: 'Lynne Arths Knappin zur See', age: '14 Jahre',
    notes: 'Wild, frech und neugierig; dunkelbraunes Haar und rotes Piratenkopftuch. Noch frisch im Knappendienst. Tochter von Owain Beryn und Mared, damit eine Nichte Ifor Beryns.' },
  { id: 'meleri-penry', name: 'Meleri Penry', surname: 'Penry', rankId: 'commoner', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-penry.png',
    title: 'Schreiberin, Adjutantin und Zofe Lynne Arths', age: '28 Jahre',
    houseDescription: 'Bürgerhaus aus Talgarth in Sturmklaue auf den Klaueninseln. Meleri Penry ist eine Enkelin Rhun Penrys, des Vogtes der Arth; ihr Vater ist Bedwyr Penry und ihre Mutter Rhoswen.',
    notes: 'Lynnes persönliche Zofe; hellbraunes schulterlanges Haar. Höfisch, organisiert und trocken-humorig. Verwaltet praktisch Lynnes Leben.' },
  { id: 'tesni-parry', name: 'Tesni Parry', surname: 'Parry', rankId: 'unknown', seat: 'Talgarth',
    sourceRevision: 2, emblem: 'assets/images/houses/Klaueninsel/lynne-crew/revised-2026-10-05/haus-parry.png',
    title: 'Schiffsköchin der Leeren Flasche', age: '29 Jahre',
    houseDescription: 'Familie Tesni Parrys aus Talgarth in Sturmklaue auf den Klaueninseln. Ihre Mutter ist Köchin im Dienst des Hauses Arth. Hausrang und der Name der Mutter sind noch nicht belegt.',
    notes: 'Tochter der Köchin von Haus Arth. Hervorragende Köchin, frech, kokett und selbstbewusst.' }
].map(record => Object.freeze(record)));

export function createLynneCrewPerson(id) {
  const member = LYNNE_CREW_MEMBERS.find(record => record.id === id);
  if (!member) throw new Error(`Unbekanntes Mitglied der Leeren Flasche: ${id}`);
  return createFamilyPerson({
    id: member.id,
    name: member.name,
    title: member.title,
    sex: 'female',
    status: 'alive',
    houseId: `house-${member.surname.toLowerCase()}`,
    portrait: member.portrait || `../AleriaAlmanach/assets/ship-crews/lynnes-schiffsmannschaft/anime-2026-10-04/${member.id}.png`,
    tags: ['Leere Flasche', 'Lynnes Schiffsmannschaft'],
    notes: `${member.age}. ${member.notes}`,
    extensions: {
      sourceNote: 'Nutzervorlage zu Lynnes Schiffsmannschaft und Ergänzungen vom 04.10.2026.',
      almanachModuleId: 'lynnes-schiffsmannschaft',
      ...(member.portrait ? { registryManagedFields: ['portrait'] } : {}),
      ...(member.formerName ? { formerName: member.formerName } : {})
    }
  });
}
