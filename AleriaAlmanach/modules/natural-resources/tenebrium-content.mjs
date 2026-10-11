// Setting lore supplied by the author. No numerical combat rules are inferred.
export const TENEBRIUM_PAGES = [
  {
    key: 'tenebrium', title: 'Tenebrium — das Erz der violetten Adern',
    lead: 'Schwärzer als gewöhnliches Metall, von violetten Adern durchzogen: Tenebrium gehört zu den kostbarsten Rohstoffen Alerias.',
    sections: [
      { title: 'Ein unverwechselbares Metall', paragraphs: [
        'An einer frisch gebrochenen Erzflanke tritt sein Wesen besonders deutlich hervor. Die metallische Grundmasse ist von tiefstem Schwarz; darin ziehen sich violette Adern durch das Gestein. Dieses Zusammenspiel macht Tenebrium ebenso begehrt wie unverwechselbar.',
        'Sein eigentlicher Wert liegt jedoch jenseits der Erscheinung. Tenebrium besitzt eine außergewöhnlich starke Wirkung auf magische Materie. Es kann sie unterdrücken, absorbieren oder zerstören — eine Eigenschaft, die selbst erfahrene Magier fürchten.'
      ] },
      { title: 'Vom Rohstoff zum Werkstoff', paragraphs: [
        'Mit Kohlenstoff verarbeitet wird daraus Tenebron. Als Zusatz zu anderen Erzen, etwa Eisen, bildet es die Grundlage des hochgeschätzten Tenebrit-Stahls. Beide Werkstoffe können beim Abschrecken in infernalem oder celestialem Blut eine weitere Verbindung eingehen.',
        'Damit führt ein einziger Rohstoff zu mehreren sehr unterschiedlichen Metallen. Reinheit, Zusammensetzung und Verarbeitung entscheiden darüber, welche seiner Eigenschaften im fertigen Werkstück besonders stark hervortreten.'
      ] }
    ]
  },
  {
    key: 'magie', title: 'Die Wirkung auf magische Materie',
    lead: 'Tenebrium nimmt der Magie ihre Selbstverständlichkeit. Vollständige Magieaufhebung gewährt es dennoch nicht.',
    sections: [
      { title: 'Absorption und Unterdrückung', paragraphs: [
        'Die besondere Kraft des Erzes richtet sich gegen magische Materie. Diese wird stark unterdrückt und kann dabei absorbiert oder zerstört werden. Je reiner das Tenebrium ist, desto größer fällt dieser Effekt aus.',
        'Auch eine sehr starke Wirkung hat Grenzen: Tenebrium negiert Magie nicht vollständig. Eine daraus gefertigte Waffe oder Rüstung macht ihren Träger daher nicht gegen jeden Zauber unverwundbar. Seine Bedeutung liegt in der erheblichen Schwächung magischer Einwirkung.'
      ] },
      { title: 'Ein begehrtes Mittel gegen übernatürliche Gegner', paragraphs: [
        'Hexenjäger, Dämonenjäger und Kleriker schätzen Tenebrium als Werkstoff und als Legierungszusatz. Gegen Magier und Mächte infernaler Natur verbindet es die Verlässlichkeit geschmiedeten Metalls mit einer gefürchteten Abwehr magischer Materie.',
        'Die Wahl des Werkstoffs bleibt dabei entscheidend. Reines Tenebron entfaltet diese besonderen Eigenschaften stärker als Tenebrit-Stahl. Dieser wiederum verbindet eine abgeschwächte magische Abwehr mit den Vorzügen eines herausragenden Stahls.'
      ] }
    ]
  },
  {
    key: 'tenebron', title: 'Tenebron — Tenebrium und Kohlenstoff', template: 'material',
    description: 'Wo Eisen und Kohlenstoff Stahl ergeben, entsteht aus Tenebrium und Kohlenstoff Tenebron. Das tiefschwarze Metall verbindet eine außergewöhnliche Schneide mit Härte und Elastizität. Seine Stärke liegt zugleich in der ausgeprägten Wirkung gegen magische Materie.',
    composition: 'Tenebrium + Kohlenstoff', appearance: 'Tiefschwarz · violette Adern',
    properties: [
      'Schärfer, elastischer und zugleich härter als gewöhnlicher Stahl.',
      'Starke Unterdrückung magischer Materie durch die Eigenschaften des Tenebriums.',
      'Die besondere Wirkung fällt bei höherer Reinheit stärker aus.'
    ],
    comparison: 'Im Vergleich zu Tenebrit-Stahl treten die besonderen Eigenschaften reinen Tenebrons stärker hervor. Für jene, die vor allem ein möglichst wirksames Metall gegen Magie suchen, ist dies der entscheidende Unterschied.',
    uses: [
      'Begehrter Werkstoff für Hexenjäger, Dämonenjäger und Kleriker.',
      'Kann durch Abschrecken in infernalem Blut zu Infernium weiterverarbeitet werden.',
      'Kann ebenso mit celestialem Blut eine neue Verbindung eingehen.'
    ],
    footer: 'Starke Magieunterdrückung bedeutet keine vollständige Magieimmunität.'
  },
  {
    key: 'tenebrit', title: 'Tenebrit-Stahl — die Wahl des Ritters', template: 'material',
    description: 'Tenebrium lässt sich auch mit anderen Erzen wie Eisen legieren. Daraus entsteht Tenebrit-Stahl: ein verbesserter Stahl, dessen hervorragende Eigenschaften ihn zu einem der besten Stähle der Welt machen. Er verbindet eine zuverlässige Schneide mit Widerstandsfähigkeit und Elastizität.',
    composition: 'Tenebrium + andere Erze, etwa Eisen', appearance: 'Stählerne Grundfarbe · feine violette Adern',
    properties: [
      'Scharf, widerstandsfähig und elastisch.',
      'Wird praktisch nicht stumpf.',
      'Besitzt magieabsorbierende beziehungsweise magieabwehrende Eigenschaften.'
    ],
    comparison: 'Die besonderen Eigenschaften fallen schwächer aus als bei reinem Tenebron. Dennoch ist Tenebrit-Stahl für einen Ritter die bessere Wahl: Er vereint die Vorzüge eines ausgezeichneten Stahls mit der zusätzlichen Abwehr magischer Einwirkung.',
    uses: [
      'Herausragender Stahl für ritterliche Ausrüstung.',
      'Auch bei Hexenjägern, Dämonenjägern und Klerikern als Legierung geschätzt.',
      'Wie Tenebron für die Weiterverarbeitung mit infernalem oder celestialem Blut geeignet.'
    ],
    footer: 'Tenebrit-Stahl bewahrt eine magische Abwehr, erreicht darin aber nicht reines Tenebron.'
  },
  {
    key: 'infernium', title: 'Infernium — im infernalen Blut abgeschreckt', template: 'material',
    description: 'Beim Schmieden eröffnet sich eine dritte Form der Verarbeitung: Wird Tenebron oder Tenebrit-Stahl in infernalem Blut abgeschreckt, verbinden sich die Bestandteile zu einer neuen Legierung. Dieses Metall trägt den Namen Infernium.',
    composition: 'Tenebron oder Tenebrit-Stahl + infernales Blut', appearance: 'Dunkles Metall · rot glühende Marmorierung',
    properties: [
      'Entsteht beim Abschrecken eines der beiden Tenebrium-Werkstoffe in infernalem Blut.',
      'Das Blut geht eine Verbindung mit dem Metall ein.',
      'Erkennbar an seiner dunklen Farbe und rot glühenden Marmorierung.'
    ],
    comparisonTitle: 'Die besondere Verbindung',
    comparison: 'Die Reaktion mit infernalem Blut zählt zu den ungewöhnlichsten Eigenschaften des Tenebriums. Andere Erze zeigen diese Verbindung nicht. In den Erzählungen der Druiden gilt gerade sie als Hinweis auf einen Ursprung im Göttlichen Krieg.',
    usesTitle: 'Verarbeitung & Einordnung',
    uses: [
      'Sowohl Tenebron als auch Tenebrit-Stahl können als Ausgangsmetall dienen.',
      'Die rote Marmorierung gehört zur entstandenen Legierung.',
      'Der druidische Schöpfungsmythos deutet die Blutreaktion; er belegt ihren Ursprung nicht.'
    ],
    footer: 'Infernium · infernale Blutlegierung'
  },
  {
    key: 'celestiale-blutlegierung', title: 'Die celestiale Blutlegierung', template: 'material',
    description: 'Auch celestiales Blut reagiert mit den Tenebrium-Werkstoffen. Wird Tenebron oder Tenebrit-Stahl darin abgeschreckt, geht das Metall eine neue Verbindung ein. Sein Erscheinungsbild wandelt sich dabei grundlegend: Eine silbrige Fläche wird von glühend goldener Marmorierung durchzogen.',
    composition: 'Tenebron oder Tenebrit-Stahl + celestiales Blut', appearance: 'Silbrig · glühend goldene Marmorierung',
    properties: [
      'Entsteht durch Abschrecken in celestialem Blut.',
      'Kann aus Tenebron oder Tenebrit-Stahl hervorgehen.',
      'Silbrige Grundfarbe mit glühend goldener Marmorierung.'
    ],
    comparisonTitle: 'Das Gegenstück zur infernalen Verbindung',
    comparison: 'Dem dunklen, rot marmorierten Infernium steht damit eine silbrig-goldene Variante gegenüber. Beide entstehen aus derselben außergewöhnlichen Fähigkeit des Tenebriums, sich beim Abschrecken mit dem Blut celestialer oder infernaler Wesen zu verbinden.',
    usesTitle: 'Verarbeitung & Einordnung',
    uses: [
      'Beide Tenebrium-Werkstoffe sind als Grundlage geeignet.',
      'Celestiales Blut bestimmt die silbrige Farbe und goldene Marmorierung.',
      'Die Verbindung ist Teil jener Besonderheit, die der druidische Mythos zu erklären sucht.'
    ],
    footer: 'Celestiale Blutlegierung · silberne Grundfarbe, goldene Marmorierung'
  },
  {
    key: 'schoepfungsmythos', title: 'Der druidische Schöpfungsmythos',
    lead: 'In den alten Geschichten der Druiden beginnt die Geschichte des Tenebriums lange vor den ersten Minen — im Blut der frühen Schöpfung.',
    sections: [
      { title: 'Das Blut des Göttlichen Krieges', paragraphs: [
        'So heißt es in der Überlieferung: Als in der frühen Schöpfung der Welt der Göttliche Krieg tobte, fielen celestiale und infernale Wesen. Ihr Blut trocknete in der jungen Welt und wurde zu jenem tiefschwarzen Erz, das heute Tenebrium genannt wird.',
        'Die Erzählungen berichten vom Sieg der celestialen Götter über die infernalen Götter. Im Erz sei etwas von beiden Seiten zurückgeblieben — ein Überrest des Krieges, eingeschlossen im Gestein.'
      ] },
      { title: 'Eine Deutung seiner ungewöhnlichen Natur', paragraphs: [
        'Dieser Mythos könnte erklären, weshalb Tenebrium auf infernales wie auf celestiales Blut reagiert, während kein anderes Erz eine solche Verbindung eingeht. Für die Druiden liegt darin ein Nachhall seines Ursprungs.',
        'Die Geschichte bleibt eine mythische Deutung. Dass die Blutlegierungen entstehen, macht die Überlieferung eindrücklich; ein Beweis dafür, dass Tenebrium tatsächlich getrocknetes Blut gefallener Wesen ist, folgt daraus nicht.'
      ] }
    ]
  },
  {
    key: 'handel', title: 'Fundorte, Handel und der Reichtum der Wacht',
    lead: 'Wenige Länder besitzen Zugang zu Tenebrium. Für jene, die es fördern, liegt im schwarzen Erz ein außergewöhnlicher Reichtum.',
    sections: [
      { title: 'Selten und weltweit begehrt', paragraphs: [
        'Tenebrium zählt zu den kostbarsten Metallen überhaupt. Die Zahl der Minen ist gering, und viele Länder haben keinen eigenen Zugang zu diesem Rohstoff. Die meisten Vorkommen liegen in Morgorn und Galadorn. Wie viele Fundorte es weltweit insgesamt gibt, ist unbekannt.'
      ] },
      { title: 'Acht Fundorte in Celtigerns Wacht', paragraphs: [
        'Die Grafschaft Celtigerns Wacht bildet eine bemerkenswerte Ausnahme: Allein hier sind acht Tenebrium-Fundorte bekannt, an denen das Erz abgebaut wird. Diese acht Fundorte gehören zur Grafschaft; sie sind keine Zählung der weltweiten Vorkommen.',
        'Die Förderung beschert der Grafschaft großen Reichtum. Die Nachfrage reicht von Schmieden, die Tenebrit-Stahl herstellen, bis zu Käufern, die den besonderen Wert des Tenebrons gegen magische Gegner schätzen.'
      ] },
      { title: 'Die Gilden folgen dem Erz', paragraphs: [
        'Solcher Reichtum bleibt nicht unbeachtet. Gilden wie der Markt der Fortuna und die Klingende Münze werden von Celtigerns Wacht und seinen Lagerstätten angezogen. Wo ein seltener Rohstoff auf eine hohe Nachfrage trifft, wächst auch das Interesse jener, die seinen Handel bestimmen wollen.'
      ] }
    ]
  }
];
