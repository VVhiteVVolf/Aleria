// Redaktionelle Quelle der Ämterseite. Absätze sind Klartext, kein HTML.
export const OFFICE_GROUPS = [
  {
    id: 'ratsaemter', number: '01', title: 'Die Ratsämter', subtitle: 'Im Dienst des Reiches',
    introduction: [
      'Ratsämter lenken die Geschicke eines Königreichs, einer Grafschaft, einer Baronie oder einer ritterlichen Herrschaft. Das jeweilige Oberhaupt ernennt seine Räte; daher tragen sie Zusätze wie „des Königs“. Ein königlicher Rat steht in der Rangordnung über dem entsprechenden Amtsträger eines Grafen oder eines niedrigeren Lehnsherrn.',
      'Das Amtsabzeichen bezeichnet die Aufgabe, sein Material den Rang des Dienstherrn: Gold steht für den König, Silber für den Grafen, Bronze für den Baron und einfaches Eisen für den Ritterfürsten.'
    ],
    offices: [
      { id: 'marschall', title: 'Marschall', category: 'Traditionelles Ratsamt', description: [
        'Der Marschall ist der oberste Krieger des Landes oder einer Region und verantwortet dessen innere und äußere Sicherheit. Im Krieg wird er auch „Kriegsherr“ genannt: In militärischen Fragen kann dann nur das Oberhaupt seine Entscheidungen überstimmen.',
        'Ihm stehen drei besondere Amtsträger zur Seite: Der Feldmarschall betreut das Heer, der Seemarschall die Marine. Der Wachtmarschall sammelt Informationen über die von den einzelnen Orten organisierten Stadtwachen, damit der Marschall die Lage der inneren Sicherheit beurteilen kann. Seine Aufgabe ist vor allem unterrichtender Natur.'
      ] },
      { id: 'kaemmerer', title: 'Kämmerer', category: 'Traditionelles Ratsamt', description: [
        'Der Kämmerer koordiniert die wirtschaftlichen und finanziellen Belange des Reiches. Er verwaltet die Schatzkammer und ihre Ausgaben, achtet auf gefüllte Vorratskammern und beugt Warenengpässen vor. Auch der Handel mit benachbarten Regionen und Ländern gehört zu seinem Aufgabenbereich.',
        'Steuereinnehmer, Kassenwarte, Zinsverwalter und Münzverwalter unterstützen ihn bei diesen Aufgaben.'
      ] },
      { id: 'justiziar', title: 'Justiziar', category: 'Traditionelles Ratsamt', description: [
        'Der Justiziar ist nach dem Oberhaupt der höchste Richter des Landes oder einer Region. Er betreut rechtliche und behördliche Angelegenheiten, sorgt für eine funktionierende Strafverfolgung, setzt Belohnungen aus und schlichtet Streitigkeiten zwischen Häusern. Auch die Einhaltung der Gesetze zur Thronfolge fällt in seine Zuständigkeit.',
        'Ihm unterstehen Richter, Rechtsprecher und Schöffen sowie Rechtsarchivare, die Verhandlungen und Urteile dokumentieren. Zensoren beobachten das Verhalten der Bürger und ermitteln Schwerpunkte der Kriminalität. Notare halten Verträge und Lehensvergaben fest; Rechtsboten überbringen die Schriftstücke.'
      ] },
      { id: 'herold', title: 'Herold', category: 'Traditionelles Ratsamt', description: [
        'Der Herold ist der oberste Diplomat des Landes oder einer Region. Er führt die Korrespondenz mit anderen Grafschaften und Reichen, bereitet Treffen vor und pflegt Beziehungen und Bündnisse. Häufig vertritt er seinen Herrn umfassend und darf frei in dessen Namen sprechen.',
        'Gesandte, Schreiber und Verhandlungsführer unterstützen ihn. Bei Verhandlungen stellt der Herold anderen Ratsämtern Redner zur Seite; umgekehrt beraten ihn die übrigen Räte mit ihrem Fachwissen.'
      ] },
      { id: 'schatten', title: 'Schatten', category: 'Traditionelles Ratsamt', description: [
        'Der Schatten sammelt Nachrichten aus dem In- und Ausland, erkennt drohende Gefahren und berät den Rat sowie das Oberhaupt. Er verfügt nur über wenige eigene Boten und Informanten. Seine wichtigste Quelle ist der Zugang zu den „Schattendrachen von Cenyr“, einer Organisation, von deren Existenz nur ein Schatten weiß.',
        'Wegen seines vertraulichen Wissens bleibt er gewöhnlich auf Lebenszeit im Amt, auch wenn das Oberhaupt wechselt. Die große Bedeutung cenyrischer Eide hat dennoch gelegentlich einen unbedenklichen Wechsel des Amtsträgers ermöglicht.'
      ] },
      { id: 'ratspriester', title: 'Ratspriester', category: 'Wechselnde Amtsbezeichnung', description: [
        'Die Bezeichnung des Ratspriesters richtet sich nach seiner Stellung in der Alerischen Kirche. Am Königshof wird er gewöhnlich „Erzpatriarch“ genannt. In Talgarth nimmt der Patriarch des Streiters diesen Sitz ein; andernorts können ein Prälat oder ein Vikar das Amt unter ihrem jeweiligen Titel ausüben.',
        'Er betreut die Belange der Kathedralen, Kirchen und Tempelanlagen und verbindet das Land oder die Region mit der Alerischen Kirche.'
      ] },
      { id: 'ratsmagier', title: 'Ratsmagier', category: 'Wechselnde Amtsbezeichnung', description: [
        'Der Ratsmagier des Königs wird als „Erzmagier“ von Cenyr bezeichnet, der einer Grafschaft als „Hochmagier“. Die Rangfolge ähnelt dem früheren System des Achatordens. Ursprünglich hieß dieses Amt allgemein „Hofmagier“; erst die Einführung des magischen Rates durch Ysgithyrwyn Grael brachte die neuen Bezeichnungen.',
        'Er untersucht magische Phänomene, bewahrt das Gleichgewicht der Magie und verhindert oder schlichtet Streitigkeiten zwischen den Magiern des Landes.'
      ] },
      { id: 'ratskanzler', title: 'Ratskanzler', category: 'Sonderamt', description: [
        'König Tristan schuf das Amt des Ratskanzlers eigens für Griflet Pysgod. Der Kanzler leitet die Beratungen des königlichen Rates, ist der oberste Berater und die rechte Hand des Königs. In dessen Abwesenheit vertritt er ihn und darf an seiner Statt sprechen.'
      ] },
      { id: 'regent', title: 'Regent', category: 'Nach Bedarf vergeben', description: [
        'Ein Regent regiert ein Land oder eine Region während der Abwesenheit des eigentlichen Oberhauptes. Das kann eine längerfristige Vertretung sein, etwa wenn ein Graf im königlichen Rat dient, oder eine Übergangslösung nach dem Tod eines Herrschers bis zur Inthronisierung des Erben.',
        'Übernimmt die Ehefrau eines in den königlichen Rat berufenen Grafen die Regierung, wird kein eigener Regent ausgerufen. In Tredegar hingegen wurde Cynfor Pysgod zum Regenten ernannt, solange sein Vater Griflet in Mathragon weilt.'
      ] },
      { id: 'barde', title: 'Barde', category: 'Nach Bedarf vergeben', description: [
        'Der Barde verantwortet Kunst, Kultur und Bildung. Er gilt zugleich als oberster Zeremonienmeister, Musiker und Geschichtenerzähler des Landes. König Rywalyn führte dieses Ratsamt ein.'
      ] }
    ]
  },
  {
    id: 'hofaemter', number: '02', title: 'Die Hofämter', subtitle: 'Das Leben hinter den Burgmauern',
    introduction: [
      'Hofämter betreuen den jeweiligen Hof, das Haus oder die Burg. Ihre Aufgaben sind von Haus zu Haus ähnlich, ihre Weisungsbefugnis bleibt jedoch an den eigenen Haushalt gebunden. So besitzt der königliche Vogt zwar den höchsten Rang unter den Vögten, kann dem Hof eines Grafen oder Ritterfürsten aber keine Anweisungen erteilen. Der Austausch zwischen den Höfen bleibt dennoch üblich.',
      'An der Spitze steht der Vogt. Der Hausherr bestimmt die Amtsträger, überlässt die Besetzung jedoch häufig dem Vogt, der auch die Bediensteten einstellt. Einzelne Hofämter werden mitunter vererbt. Viele führen die Bezeichnung „Meister“.'
    ],
    offices: [
      { id: 'vogt', title: 'Vogt', description: [
        'Der Vogt ist der oberste Verwalter des Hofes. Er organisiert das Leben im Haus oder in der Burg, beaufsichtigt die Bediensteten und teilt Gästen und Dienstboten ihre Räume zu.',
        'Er stellt Knechte, Zofen und Dienstmädchen ein und vergibt offene Hofämter im Sinne des Hausherrn, sofern dieser keine eigenen Vorschläge macht. Auch die übrigen Hofämter unterliegen grundsätzlich seiner Aufsicht.'
      ] },
      { id: 'schatzmeister', title: 'Schatzmeister', description: [
        'Der Schatzmeister verwaltet die Kasse des Hauses oder der Burg. Anders als ein Kämmerer entscheidet er nicht eigenständig über Ausgaben. Sind die Mittel erschöpft, kann er jedoch ein Veto einlegen.'
      ] },
      { id: 'gardekommandant', title: 'Kommandant der Garde', description: [
        'Der Kommandant der Garde verantwortet die Bewachung der Burg und den Schutz des Oberhauptes sowie seiner Familie. Diese unmittelbare Verantwortung macht das Amt besonders ehrenvoll.'
      ] },
      { id: 'zeremonienmeister', title: 'Zeremonienmeister', description: [
        'Der Zeremonienmeister richtet Bankette, Namenstagsfeiern und andere höfische Festlichkeiten aus. Außerdem sorgt er dafür, dass Insignien, Ornamente, Kronen und Wappen gepflegt und jederzeit vorzeigbar sind.'
      ] },
      { id: 'mundschenk', title: 'Mundschenk', description: [
        'Der Mundschenk versorgt den Hausherrn und seine Familie mit Erfrischungen und hält sich deshalb meist in ihrer Nähe auf. Mit Vogt und Brotmeister stimmt er die Vorratshaltung ab.',
        'Oft vergibt der Hausherr dieses Amt persönlich an ein Kind eines verdienten Ritters oder eines Freundes.'
      ] },
      { id: 'kuechenmeister', title: 'Küchenmeister', description: [
        'Der Küchenmeister leitet die Küche und sorgt für die Verpflegung des Hausherrn, seiner Familie, der Rats- und Hofamtsträger sowie der Bediensteten.'
      ] },
      { id: 'brotmeister', title: 'Brotmeister', description: [
        'Der Brotmeister untersteht dem Küchenmeister und hält die Speisekammern gefüllt. In vielen Häusern übernimmt der Küchenmeister diese Aufgabe selbst.'
      ] },
      { id: 'waffenmeister', title: 'Waffenmeister', description: [
        'Der Waffenmeister ist ein verdienter Ritter. Er bildet die jungen Knaben, Milwr und Ritter aus und dient als geschätzter Ratgeber. Ist der Kommandant der Garde abwesend, übernimmt er dessen Pflichten.'
      ] },
      { id: 'kerkermeister', title: 'Kerkermeister', description: [
        'Der Kerkermeister betreut die Kerker und organisiert ihre Bewachung. Er trägt dafür Sorge, dass die Gefangenen sicher in Gewahrsam bleiben.'
      ] },
      { id: 'stallmeister', title: 'Stallmeister', description: [
        'Der Stallmeister verwaltet die Stallungen und verantwortet die Auswahl, Pflege und Gesundheit der Pferde. Den jungen Angehörigen des Hauses erteilt er Reitunterricht.'
      ] },
      { id: 'jagdmeister', title: 'Jagdmeister', description: [
        'Der Jagdmeister organisiert und leitet Jagden und Jagdgesellschaften. Er pflegt die Reviere, bewirtschaftet den Wildbestand nachhaltig und berät seinen Herrn in Jagdfragen. Auch die Ausbildung des Jagdpersonals und der Bogenschützen gehört zu seinen Aufgaben.'
      ] },
      { id: 'gartenmeister', title: 'Gartenmeister', description: [
        'Der Gartenmeister pflegt die Gärten des Hauses. Häufig wird dafür ein Gärtner der Gilde Immergrün angestellt oder die Aufgabe vollständig an diese Gilde vergeben.'
      ] },
      { id: 'hofmeister', title: 'Hofmeister', description: [
        'Der Hofmeister ist der Lehrer des Hauses. Er unterrichtet die jungen Angehörigen der Familie und vermittelt ihnen das Wissen, über das er verfügt.'
      ] },
      { id: 'hofdame', title: 'Hofdame', description: [
        'Eine oder mehrere Hofdamen unterstützen die Hausherrin und ihre Töchter. Eine ihrer wichtigsten Aufgaben ist es, den jungen Angehörigen des Hauses höfische Etikette beizubringen.'
      ] },
      { id: 'archivar', title: 'Archivar', description: [
        'Der Archivar führt die Familienchroniken sowie die Chroniken der Burg oder des Herrschaftsgebietes.'
      ] },
      { id: 'hofkaplan', title: 'Hofkaplan', description: [
        'Der Hofkaplan ist ein Geistlicher der Alerischen Kirche, dessen kirchlicher Rang unterschiedlich ausfallen kann. Er betreut die Hauskapellen und die Familienkrypta und lehrt die Kinder Gebete.'
      ] },
      { id: 'hafenmeister', title: 'Hafenmeister', description: [
        'Der Hafenmeister verwaltet und überwacht den Hafen. Er koordiniert den Schiffsverkehr, weist Liegeplätze zu und beaufsichtigt das Be- und Entladen. Er prüft die Registrierung der Schiffe und die Einhaltung der Hafenregeln.',
        'Zur Sicherheit im Hafen gehören auch Warenkontrollen und die Überwachung von Reparaturarbeiten an Schiffen. Für Kapitäne und Händler ist er ein zentraler Ansprechpartner.'
      ] },
      { id: 'hoffalkner', title: 'Hoffalkner', description: [
        'Der Hoffalkner pflegt, füttert und trainiert die Jagdfalken des Hofes. Er organisiert und begleitet ihren Einsatz bei der Jagd, berät den Hausherrn zur Falknerei und verantwortet Zucht und Auswahl neuer Vögel.'
      ] },
      { id: 'hofhandwerksmeister', title: 'Hofhandwerksmeister', description: [
        'Der Hofhandwerksmeister koordiniert die Handwerker seines Lehnsherrn, darunter Schmiede, Bogner und Rüstungsschmiede. Er leitet ihre Arbeit im Interesse des Hauses und sorgt dafür, dass der handwerkliche Bedarf des Hofes gedeckt wird.'
      ] },
      { id: 'hofnarr', title: 'Hofnarr', category: 'Seltenes Hofamt', description: [
        'Der Hofnarr unterhält den Hof und hält ihm zugleich den Spiegel vor. Seit der Einführung des Barden als Ratsamt wird er nur noch selten bestellt; ist das Amt besetzt, untersteht er dem Barden. Hofnarren werden gewöhnlich aus der Gilde „Narrenzunft“ angeworben.'
      ] },
      { id: 'hofmagier', title: 'Hofmagier', category: 'Seltenes Hofamt', description: [
        'Der Hofmagier berät den Hausherrn in magischen Angelegenheiten. Wegen der geringen Zahl an Magiern seit dem Ende des Achatordens ist dieses Hofamt selten geworden. Die Gründung des magischen Rates hat seine Vergabe weiter zurückgehen lassen.'
      ] },
      { id: 'kartograf', title: 'Kartograf', category: 'Seltenes Hofamt', description: [
        'Nur wenige Höfe beschäftigen einen eigenen Kartografen; in Küstenregionen kommt dies häufiger vor. Meist übernimmt der Archivar das Erstellen und Aktualisieren von Karten. Da die Gilde „Weltenkeller“ die besten Karten der Welt anbietet, ist ein eigener Amtsträger vielerorts entbehrlich.'
      ] },
      { id: 'zwingermeister', title: 'Zwingermeister', category: 'Seltenes Hofamt', description: [
        'Der Zwingermeister verantwortet Pflege, Fütterung, Unterbringung und Ausbildung der Jagdhunde. Er organisiert die Zucht, wählt geeignete Tiere aus und bereitet sie auf ihre jeweiligen Aufgaben bei der Jagd vor. Die Helfer im Zwinger unterstehen seiner Leitung.'
      ] }
    ]
  },
  {
    id: 'adelstitel', number: '03', title: 'Adel & Lehensherrschaft', subtitle: 'Titel, Land und Verantwortung',
    introduction: ['Adelstitel bestimmen den Rang und die Herrschaftsrechte eines Hauses. Dabei unterscheiden sich erblicher Besitz und die übertragene Verwaltung eines Lehens. Besonders deutlich wird dies beim Ritterherrn und beim Lehenswart.'],
    offices: [
      { id: 'koenig', title: 'König', description: [
        'Der König ist der oberste Herrscher Cenyrs und besitzt die höchste politische und militärische Autorität. Er verantwortet Gesetzgebung, Militärführung und Diplomatie, wacht über die Pflichten des Adels und seiner Vasallen und gilt als oberster Schiedsrichter in Konflikten und Kriegen.'
      ] },
      { id: 'herzog-fuerst', title: 'Herzog / Fürst', description: [
        'Ein Herzog oder Fürst ist ein hochrangiger regionaler Herrscher unter dem König. Er verwaltet mehrere Grafschaften, setzt die königlichen Gesetze durch und sorgt dafür, dass Steuern, Ressourcen und militärische Beiträge an die Krone gelangen. Im Krieg stellt er Truppen und trägt zur Verteidigung des Reiches bei.'
      ] },
      { id: 'graf', title: 'Graf', description: [
        'Der Graf herrscht über eine Grafschaft mit Städten, Dörfern, Festungen und Burgen. Er verantwortet Verwaltung, Sicherheit und Wirtschaft, wahrt die öffentliche Ordnung, erhebt Steuern und sichert die Treue seiner Vasallen gegenüber König und Fürst. Im Krieg führt er die Truppen seiner Region und stellt sie dem König zur Verfügung.'
      ] },
      { id: 'baron', title: 'Baron', description: [
        'Ein Baron herrscht über kleinere Gebiete innerhalb einer Grafschaft, etwa Städte, Burgen oder Siedlungen. Er erhält sein Land als Lehen vom Grafen, verwaltet es und sorgt für die Durchsetzung der Gesetze, die Erhebung der Steuern und die öffentliche Ordnung. Er verteidigt sein Gebiet und stellt auf Anforderung Truppen für Graf oder König.'
      ] },
      { id: 'ritterfuerst', title: 'Ritterfürst', description: [
        'Der Ritterfürst ist ein regionaler Adliger mit einer dem Baron ähnlichen, jedoch geringeren und räumlich engeren Autorität. Gewöhnlich unterstehen ihm drei bis zehn Orte mit ihren Bannkreisen.',
        'Viele Ritterfürsten leben weiterhin in den Städten ihrer Lehnsherren. Die ihnen innerhalb einer Grafschaft zugewiesenen Gebiete können sie wiederum Ritterherren, Bürgermeistern oder Prioren zur Verwaltung übertragen.'
      ] },
      { id: 'ritterherr', title: 'Ritterherr', description: [
        'Der Ritterherr steht einem niederen ritterlichen Haus vor. Meist ist er zugleich Lehenswart, doch das ist keine Voraussetzung. Er besitzt eine Burg oder ein Anwesen und eigenen Grundbesitz, etwa Höfe, Minen oder Betriebe zur Gewinnung von Holz, Stein, Holzkohle und anderen Ressourcen, die den Wohlstand seines Hauses sichern.',
        'Sein Titel ist erblich. Anders als das Verwaltungsamt eines Lehenswarts können ihm seine Burg und sein eigener Besitz nicht ohne Weiteres entzogen werden.'
      ] },
      { id: 'lehenswart', title: 'Lehenswart / Lehnswart', description: [
        'Der Lehenswart ist Statthalter und Verwalter einer Siedlung samt Bannkreis. Das Amt ist in Cenyr rechtlich nicht erblich. Zwar betrachten ritterliche Häuser ihren Ort häufig als angestammte Heimat und geben das Amt gewöhnlich an einen Nachfolger aus der Familie weiter; der Lehnsherr kann es jedoch entziehen und einer anderen Familie oder einem Bürgermeisteramt übertragen.',
        'In der Praxis achten Lehnsherren meist die gewachsene Nachfolge. Eine anderweitige Vergabe ist ungewöhnlich, kommt aber vor.'
      ] }
    ]
  },
  {
    id: 'ritterstaende', number: '04', title: 'Ritterliche Stände & Ehrungen', subtitle: 'Vom Pagen zum Erzritter',
    introduction: ['Diese Bezeichnungen setzen keine eigene Landesherrschaft voraus. Sie beschreiben Herkunft, Ausbildung, Bindungen oder besondere Ehrenrechte; einzelne Träger können dennoch Land besitzen.'],
    offices: [
      { id: 'erzritter', title: 'Erzritter', description: [
        'Der Erzritter trägt einen vom höheren Adel verliehenen Ehrentitel. Er darf Land halten und aus eigener Autorität Ritter schlagen. Ein gewöhnlicher Ritter benötigt dazu die Erlaubnis seines Herrn, etwa eines Ritterherrn, Ritterfürsten oder Barons.',
        'Der Erzritter besitzt die entsprechenden Rechte eines Ritterherrn, hat jedoch kein eigenes Haus gegründet. Sir Owain Draig etwa hält Land und schlägt seine Knappen selbst zu Rittern, bleibt aber Angehöriger des Hauses Draig.'
      ] },
      { id: 'fahrender-ritter', title: 'Fahrender Ritter', description: [
        'Ein Fahrender Ritter ist von seinem Haus freigestellt, um durch das Land zu ziehen. Solange er sich respektvoll verhält, müssen Adlige ihm Einlass, Obdach und sogar Ausrüstung gewähren und dürfen seinen Weg nicht verwehren.',
        'Die meisten Fahrenden Ritter sind Prinzen oder andere Edelleute aus den hohen und mittleren Adelshäusern Cenyrs.'
      ] },
      { id: 'ritter', title: 'Ritter', description: [
        'Ein Ritter ist seinem Lehnsherrn verpflichtet. Die Ritter Cenyrs gelten als gesalbte Ritter: Sie schwören einen Eid und empfangen eine Salbung mit Öl.'
      ] },
      { id: 'hausritter', title: 'Feudal- oder Hausritter', description: [
        'Ein Hausritter stammt aus dem Bürgertum und wurde zum Ritter geschlagen, ohne einem adeligen Haus zu entstammen. Er ist seinem Herrn verpflichtet und darf nicht als Fahrender Ritter dienen.',
        'Die meisten begründen keine eigene Ritterherrschaft. Sie können jedoch ihre Söhne zu Rittern heranbilden lassen, die anschließend vom Lehnsherrn den Ritterschlag erhalten. Einzelne Hausritter steigen zu Ritterherren, wenige sogar zu Ritterfürsten auf.'
      ] },
      { id: 'kirchritter', title: 'Kirchritter / Paladin', description: [
        'Ein Kirchritter ist ein geistlicher Ritter, der seinen Ritterschlag von der Kirche empfängt. Seine Verpflichtungen gelten der Kirche und nicht dem Adel. Ein späterer Wechsel in den Landadel bleibt möglich.'
      ] },
      { id: 'jungritter', title: 'Jungritter', description: [
        'Ein Jungritter hat seinen Ritterschlag erst kürzlich empfangen und steht am Beginn seines ritterlichen Weges. Meist handelt es sich um einen Prinzen oder einen anderen Spross eines Adelshauses.'
      ] },
      { id: 'heckenritter', title: 'Heckenritter', description: [
        'Ein Heckenritter besitzt weder Land noch einen Herrn. Manche führen den Titel weiter, obwohl er ihnen aberkannt wurde. Sie ziehen durch das Land und leben von wechselnden Aufträgen – oft unter Bedingungen, die einem Söldnerleben gleichen.'
      ] },
      { id: 'knappe', title: 'Knappe', description: [
        'Knappen sind meist Jungen oder Mädchen zwischen 14 und 18 Jahren. Sie dienen einem Ritter, lernen von ihm und bereiten sich auf den Ritterschlag vor. Sie betreuen sein Hab und Gut und übernehmen unter anderem die Aufgaben eines Mundschenks. Der ausbildende Ritter wird ihr Rittervater genannt.'
      ] },
      { id: 'page', title: 'Page', description: [
        'Der Pagenstand geht der Knappschaft voraus. Pagen sind gewöhnlich sechs bis zwölf Jahre alt und begleiten ihren Rittervater bei Hof. Zunächst stehen schulische Unterweisung und höfisches Wissen im Mittelpunkt; die Kampfausbildung beginnt erst gegen Ende dieser Zeit.',
        'Den Unterricht übernehmen häufig die Hofdamen, während der Ritter seinen übrigen Pflichten nachgeht.'
      ] },
      { id: 'milwr', title: 'Milwr', description: [
        'Milwr ist die Bezeichnung für einen Bürgerlichen und umfasst sowohl Zivilisten als auch ausgebildete Waffenknechte. Im militärischen Sprachgebrauch wird das Wort häufig nur für die Miliz verwendet und von den Waffenknechten abgegrenzt. Genau genommen gehören jedoch beide zu den Milwr.'
      ] }
    ]
  }
];

export const HOUSEHOLD_SERVICE = [
  'Knechte, Dienstmädchen und Zofen unterstehen gewöhnlich dem Vogt. Werden sie einem anderen Amt zur Mitarbeit zugewiesen, folgen sie dessen Anweisungen. Ihre Dienste gelten als ehrbar; auch sie tragen Zusätze wie „des Königs“.',
  'Über ihre Anstellung entscheidet der Vogt.'
];
