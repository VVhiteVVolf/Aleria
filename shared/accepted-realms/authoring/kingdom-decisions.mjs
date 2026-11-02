// Explicit admission of the three completed country drafts, 1 November 2026.
export const KINGDOM_DECISIONS = Object.freeze({
  aeldrunmar: { name: 'Aeldrunmar', continent: 'Aldervan', capital: 'aeldrunhal', ruler: 'kendryck', people: 'Aeldrunmarer', rootId: 'koenigreich-aeldrunmar' },
  talyndor: { name: 'Talyndor', continent: 'Aldervan', capital: 'edrington', ruler: 'aldred', people: 'Talyndorer', rootId: 'koenigreich-talyndor', historical: true, occupier: 'triarchie' },
  brevanor: { name: 'Brevanor', continent: 'Aldervan', capital: 'caerennes', ruler: 'aubert', people: 'Brevanorer', rootId: 'koenigreich-brevanor', historical: true, occupier: 'triarchie' },
});

export const KINGDOM_CONTEXT = Object.freeze({
  aeldrunmar: {
    themes: [
      { title: 'Pferde und Vieh', text: 'Weiden, Getreideanbau, Viehzucht und sorgfältige Pferdezucht bilden die Grundlage des Rittertums. Hyld und Scoet führen die kräftigen Brycing-Kriegspferde.' },
      { title: 'Wälder, Berge und Küsten', text: 'Waldtiere, Gehölze, Bergformen und Seezeichen kennzeichnen die Landschaften. Mark bezeichnet Grenzgebiete, Mere Küsten; Fold, Hold, Emnet und Land ergänzen die Landschaftsnamen.' },
      { title: 'Ritterliche Ausbildungswege', text: 'Isen kämpfen mit Schwertern, Wigar mit Stangenwaffen. Hyld sind Reiterritter, Scoet berittene Schützen. Særinc stehen für das Rittertum zur See; Gliwere verbinden Musik und Dichtung mit der Fechtkunst.' },
      { title: 'Die bekannten Schwerpunkte', text: 'Fyr, Earncynne und Kendryck gelten als besonders stark in der Ausbildung der Isen. Kendryck sind außerdem für ihre Hyld berühmt. Tharn und Estmere stehen besonders für die Særinc.' },
    ],
    notes: ['Halfax und Ashby sind ausgestorben. Ihre Zuordnung nach Ældrunhal bezeichnet einen früheren Sitz.', 'Virelath ist ein Thaintum, Luthirrith eine ritterliche Herrschaft. Hingstgard bleibt ein eigenständiges Ordensgebiet ohne zugeordnetes Adelshaus.'],
  },
  talyndor: {
    introduction: 'Talyndor war das Bruderkönigreich Aeldrunmars. Eine eng verwandte Reiter- und Agrarkultur verband die Zwillingskronen; Talyndor entwickelte zugleich eine eigene Tradition schwer gerüsteter Ritter und Fußkämpfer. Seit dem Umsturz von 1720 steht das Land unter der Herrschaft der Triarchie. Die hier verzeichneten Earltümer und Hausbindungen beschreiben seine frühere Ordnung.',
    history: [
      { title: 'Die Zwillingskronen', text: 'Aeldrunmar und Talyndor galten als Bruderkönigreiche und teilten einen großen Teil ihrer Kultur. Landwirtschaft, ritterliche Ausbildung und die verwandten Traditionen ihrer Häuser verbanden beide Länder.' },
      { title: 'Earls, Thains und Königssitz', text: 'Die Krone der Aldred hatte ihren Sitz in Edrington. Lennwyck, Warren und Brigane führten die drei weiteren Earltümer. Eigene Domänen und weitere Thaintümer gliederten das Land.' },
      { title: 'Die verlorene Eigenständigkeit', text: 'Die Triarchie eignete sich Talyndor im Zusammenhang mit den Umwälzungen von 1720 an. Die frühere Sitzordnung belegt weder eine Rückeroberung noch die gegenwärtige Kontrolle durch einheimische Häuser.' },
      { title: 'Thornwick und Thornholt', text: 'Thornwick war ein niederes Rittergeschlecht der Warren. Seine Waldburg Thornholt ging 1720 verloren. Refri führt das heimatlose Haus weiter. Die örtliche Zuordnung zu Wensbury hält den überlieferten Zusammenhang fest und stellt Thornholt nicht wieder her.' },
    ],
    themes: [
      { title: 'Land und Hauszeichen', text: 'Offenes Kulturland, große Wälder und hohe Bergsäume prägten die Earltümer. Die Lennwyck führten den Löwen, die Warren den Wolf, die Brigane zwei wütende weiße Pitbulls und die Aldred eine Burg in ihrem Hauszeichen.' },
      { title: 'Miles und Ceorl', text: 'Miles trugen lange Kettenhauberks, starke Ritterhelme, Schwerter und große Schilde. Ceorl kämpften als schwer gepanzerte Infanteristen mit Morgenstern, Flegel oder Streitkolben.' },
      { title: 'Weitere Ausbildungswege', text: 'Isen führten Schwerter, Wigar Stangenwaffen. Hyld, Scoet und Gliwere waren seltener: Reiterritter, berittene Schützen und ritterliche Fechter mit Musik und Dichtung.' },
    ],
    notes: ['Die Familienzuordnungen beschreiben die überlieferte Heimat. Heutige Bewohner und tatsächliche Besitzrechte unter der Besatzung werden daraus nicht abgeleitet.'],
  },
  brevanor: {
    themes: [
      { title: 'Ritter, Helden und Liebesgeschichten', text: 'Das alte Brevanor träumte von ritterlichen Taten, Heldengeschichten und Romantik. Turniere, prachtvolle Harnische und der vornehme Auftritt gehörten zu seinem Selbstbild.' },
      { title: 'Wein und höfischer Genuss', text: 'Aus Brevanor kamen edle Weine, Sekt, Rosé, Champagner und verschiedene Liköre. Reben, Obstgärten, Kellerkunst und festliche Tafeln standen neben Seefahrt und Handel.' },
      { title: 'Krone und Comteyrate', text: 'Aubert führte die Krone von Caerennes aus. Die Comteyr Caudren, Guivren und Valdran hatten ihre Sitze in Tervenne, Vaudrec und Tregard. Die königliche Domäne und die drei Comteyrate verbanden die örtlichen Herrschaften.' },
      { title: 'Bestehende Familien', text: 'Bielle gehörte zu den Brenor, den Baronen Brevanors, und verband Rittertradition mit Weinbau. Desele und Lothaire waren bürgerliche Familien. Helviane, eine geborene Bielle und angeheiratete Desele, rettete nach dem Umsturz Vermögen, Duftrezepte und alte Flaschen nach Gwynthor.' },
    ],
    notes: ['Die Akten beschreiben Brevanors frühere Eigenständigkeit. Die gegenwärtige Herrschaft der Triarchie bedeutet keine freiwillige Gefolgschaft seiner alten Familien.'],
  },
});
