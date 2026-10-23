// Historische Angaben aus der vom Nutzer übergebenen Ereignisseite.
// Dauer und Kartenkoordinaten der Rekonstruktion sind keine überlieferten Fakten.
export const WELLENRUH = Object.freeze({
  id: 'erste-seeschlacht-wellenruh',
  title: 'Die I. Seeschlacht bei Wellenruh',
  date: Object.freeze({ year: 1628, month: 4, day: 11 }),
  location: 'Aldrimarer See, bei Wellenruh',
  articleHref: 'Schlachten/Erste-Seeschlacht-bei-Wellenruh.html',
  summary: 'Mit einer Zangenbewegung besiegen die Grünen die Flotte der Roten. Der Sieg sichert ihnen die Vorherrschaft auf der Ostsee Aldrimars.',
  sides: Object.freeze([
    Object.freeze({ id: 'green', name: 'Die Grünen', ships: 30, warriors: '2.700', lostShips: 8, losses: 'bis zu 800', leaders: ['Hrolfr Frostauge', 'Hallvard Wellensänger'], captains: ['Fenrir Wellenschild', 'Skeld Gullvig'], troops: 'Überwiegend Skeidr', strategy: 'Die Mitte hält. Die Flanken schließen sich.', description: 'Ein gestrecktes Zentrum bindet die rote Flotte. Bewegliche Langschiffe sollen den Gegner von beiden Seiten umfassen.' }),
    Object.freeze({ id: 'red', name: 'Die Roten', ships: 27, warriors: '2.300', lostShips: 16, losses: '1.500', leaders: ['Raveld Blutstahl †', 'Detlaff Schwarzblut †'], captains: ['Ragnar Silberblut †'], troops: 'Überwiegend Skytten', strategy: 'Alle Kraft auf den Durchbruch.', description: 'Eine dichte Mitte soll das grüne Zentrum aufbrechen. Die Flanken müssen halten, bis die Schiffe nach außen ausschwenken können.' })
  ])
});

export const BATTLE_PHASES = Object.freeze([
  { id: 'aufstellung', title: 'Vor dem ersten Aufprall', label: 'Die Aufstellung', moment: 'Am Morgen', text: 'Aus Wellenruh laufen 30 grüne Kriegsschiffe aus. Gegenüber stehen 27 Schiffe der Roten aus Nebelwacht. Hrolfr streckt seine Mitte; Raveld bündelt seine Kräfte im Zentrum.', focus: 'Zwei Pläne treffen aufeinander: Umfassung gegen Durchbruch.' },
  { id: 'zentrum', title: 'Das Zentrum hält', label: 'Der Zusammenstoß', moment: 'Die Linien treffen', text: 'Die Flaggschiffe gehen in den Nahkampf. Die Roten drängen gegen die dünne grüne Linie, doch Hrolfrs schwer bewaffnete Krieger halten stand. Der schnelle Durchbruch bleibt aus.', focus: 'Die rote Flotte wird im Zentrum gebunden.' },
  { id: 'zange', title: 'Die Zange schließt sich', label: 'Der Flankenangriff', moment: 'Der Wendepunkt', text: 'Hallvards bewegliche Langschiffe brechen aus dem Schatten der Front in Keilformation hervor. Auf der anderen Flanke greift Fenrir Wellenschild die Schiffe Detlaffs an.', focus: 'Hallvard stößt in den Kern, Fenrir bindet die Gegenflanke.' },
  { id: 'flaggschiff', title: 'Das rote Flaggschiff fällt', label: 'Die Entscheidung', moment: 'Kampf an Deck', text: 'Hrolfr entert und zerstört Ravelds Flaggschiff. Raveld Blutstahl fällt, das Schiff sinkt. Fenrir bezwingt Detlaff Schwarzblut im Zweikampf; auch Ragnar Silberblut kommt in der Schlacht um.', focus: 'Mit ihren Befehlshabern verliert die rote Flotte ihren Zusammenhalt.' },
  { id: 'zusammenbruch', title: 'Die Schlachtlinie zerbricht', label: 'Der Zusammenbruch', moment: 'Die Ordnung löst sich', text: 'Hallvard treibt seine Flanke tief in die rote Formation. Die Mitte bricht auf, Detlaffs Flanke weicht. Was als Durchbruch geplant war, endet im ungeordneten Rückzug.', focus: 'Die Grünen entscheiden das Gefecht für sich.' },
  { id: 'rueckzug', title: 'Die See gehört den Grünen', label: 'Sieg & Rückzug', moment: 'Nach der Entscheidung', text: 'Die Überlebenden der Roten ziehen sich nach Silberquell und Nebelwacht zurück. 16 rote und 8 grüne Schiffe sind verloren. Die Küsten Moortals liegen nun für die grünen Plünderfahrten offen.', focus: 'Ein überwältigender Sieg – und der Auftakt zur nächsten Seeschlacht.' }
].map(Object.freeze));
