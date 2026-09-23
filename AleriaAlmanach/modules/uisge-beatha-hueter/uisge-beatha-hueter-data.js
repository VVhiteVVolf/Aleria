// The Keepers' supplied manuscript, using the existing story-page contract.
// Portrait references are documented with the artwork; character records stay owned by their archive.
(function registerUisgeBeathaKeepers() {
  const id = 'uisge-beatha-hueter';
  if (SECTIONS.some(section => section.entries?.some(entry => entry.id === id))) return;

  const tab = 'Völker & Kulturen';
  const path = ['Alben', 'Fianna'];
  let section = SECTIONS.find(candidate => candidate.tab === tab
    && candidate.path?.length === path.length
    && path.every((part, index) => candidate.path[index] === part));
  if (!section) {
    section = {
      key: 'Fianna', tab, path,
      desc: 'Die Fianna und die Gemeinschaften unter ihrem kulturellen Schutz.',
      entries: []
    };
    SECTIONS.push(section);
  }

  const assetRoot = './public/assets/uisge-beatha-hueter';
  const chapters = [
    {
      "pageTitle": "I. — Die Hüter & ihr Erbe",
      "illustration": "01-gemeinschaft",
      "paragraphs": [
        "Die <strong>Luchd-Glèidhidh an Uisge Bheatha</strong>, in der Gemeinsprache meist als <strong>Hüter des Wassers des Lebens</strong>, <strong>Hüter</strong> oder gelegentlich schlicht als <strong>Keeper</strong> bezeichnet, sind eine traditionsreiche Ehrengesellschaft des <strong>Comann Braich Alba</strong>. Sie stehen unter dem kulturellen Schutz der <strong>Fianna</strong> und gelten als eine der angesehensten Gemeinschaften innerhalb der albischen Whiskykultur.",
        "Anders als der Comann Braich Alba sind die Hüter keine prüfende oder regelgebende Körperschaft. Sie entscheiden nicht darüber, welcher Brand die Bezeichnung <em>Albischer Whisky</em> tragen darf, führen keine regelmäßigen Kontrollen von Brennereien durch und vergeben nicht das <em>Uisge-Beatha</em>-Siegel.",
        "Ihre Aufgabe ist eine andere.",
        "Der Comann Braich Alba bewahrt die Regeln des Albischen Whiskys.",
        "<strong>Die Hüter bewahren seine Kultur.</strong>",
        "<strong>Ursprung und Selbstverständnis</strong>",
        "Die Tradition des <em>Uisge Beatha</em>, des „Wassers des Lebens“, reicht weit in die Geschichte des albischen Volkes zurück. Sie ist älter als zahlreiche der heutigen Fürstentümer und überdauerte selbst den Untergang des alten albischen Königreiches.",
        "Mit dem Zerfall Albas verschwanden dessen Menschen und Traditionen nicht.",
        "Einige Länder blieben albische Fürstentümer. Andere entwickelten sich über die Jahrtausende zu eigenständigen Reichen und Kulturen. Auch Cenyr und Aldrimar gehörten einst diesem Kulturraum an und besitzen bis heute Brennereien, deren Geschichte teilweise weit hinter die politische Entstehung ihrer heutigen Reiche zurückreicht.",
        "Die Hüter verstehen den Albischen Whisky deshalb als Teil eines gemeinsamen Erbes, das politische Grenzen überdauert hat.",
        "Ein Cenyri ist kein Albe im politischen Sinne. Ein Aldrimarer ebenso wenig.",
        "Doch beide können eine Brennerei betreiben, deren Feuer bereits brannte, als ihre heutigen Reiche noch nicht existierten.",
        "Gerade diese Verbindungen zu bewahren, gehört zum Selbstverständnis der Hüter.",
        "Innerhalb ihrer Gemeinschaft treten Herkunft, Haus und Stand daher bewusst zurück. Ein Fürst kann neben einem Küfer sitzen, ein Ritter neben einem Brennmeister und ein cenyrischer Händler neben einem uathneachischen Gastwirt.",
        "Sie alle verbindet dasselbe <em>Uisge Beatha</em>."
      ]
    },
    {
      "pageTitle": "II. — Verdienst & Berufung",
      "illustration": "02-berufung",
      "paragraphs": [
        "<strong>Mitgliedschaft</strong>",
        "Die Mitgliedschaft bei den Hütern gilt als Auszeichnung und kann weder erworben noch beantragt werden.",
        "<strong>Ein Hüter wird berufen.</strong>",
        "Voraussetzung dafür ist ein außergewöhnlicher und von anderen Hütern anerkannter Beitrag zur Bewahrung, Weiterentwicklung oder Weitergabe der albischen Whiskykultur.",
        "Dabei ist weder gesellschaftlicher Rang noch Vermögen von Bedeutung. Ebenso wenig genügt es, ein hervorragender Kenner, begeisterter Sammler oder großzügiger Käufer von Whisky zu sein.",
        "Ein Hüter muss etwas hinterlassen haben.",
        "Sein Wirken muss über seinen eigenen Genuss hinausgehen und der Kultur des <em>Uisge Beatha</em> selbst zugutekommen.",
        "Als solche Verdienste gelten unter anderem die Bewahrung alter Brennereien oder Bestände, die Rettung historischen Wissens, besondere Leistungen im Brenner- oder Küferhandwerk, die Weitergabe alter Herstellungsverfahren, die Förderung kleiner Brennereien, bedeutende Forschungen zur Geschichte des Whiskys oder die Verbreitung und Anerkennung des <em>Uisge Beatha</em> außerhalb seines ursprünglichen Kulturraumes.",
        "Auch außergewöhnliche Taten können eine Aufnahme begründen, wenn durch sie ein bedeutender Teil der Whiskykultur erhalten wurde.",
        "Dabei muss der Betroffene keineswegs mit der Absicht gehandelt haben, eines Tages Hüter zu werden.",
        "Oft erkennen erst andere die Bedeutung dessen, was er getan hat.",
        "Unter den Hütern wird dieser Gedanke gelegentlich mit einem einfachen Satz zusammengefasst:",
        "<strong>„Was bleibt durch dich, wenn du gegangen bist?“</strong>",
        "<strong>Berufung eines Hüters</strong>",
        "Ein zukünftiger Hüter muss von bestehenden Mitgliedern vorgeschlagen werden.",
        "Seine Fürsprecher legen der Gemeinschaft dar, worin sein Beitrag zum <em>Uisge Beatha</em> besteht und weshalb dieser ihrer Ansicht nach eine Aufnahme rechtfertigt.",
        "Daraufhin wird über den Anwärter beraten.",
        "Persönliche Bekanntschaft oder Freundschaft kann eine Empfehlung begründen, ersetzt jedoch niemals den notwendigen Verdienst.",
        "Ebenso besitzt kein Fürst, Graf oder sonstiger Herr das Recht, jemanden zum Hüter zu ernennen. Selbst die Fianna greifen gewöhnlich nicht in einzelne Berufungen ein.",
        "Die Würde wird von den Hütern selbst verliehen.",
        "Damit kann ein einfacher Brennmeister aufgenommen werden, während ein Fürst, dessen Keller einige der kostbarsten Flaschen Albas enthält, sein Leben lang außerhalb der Gemeinschaft bleibt.",
        "Die Mitgliedschaft gilt auf Lebenszeit. Sie ist persönlich und <strong>nicht erblich</strong>."
      ]
    },
    {
      "pageTitle": "III. — Tartan & Nadel",
      "illustration": "03-ehrenzeichen",
      "paragraphs": [
        "<strong>Der Tartan der Hüter</strong>",
        "Das auffälligste Zeichen der Gemeinschaft ist der <strong>Tartan der Hüter</strong>.",
        "Anders als die Tartans vieler alter Familien, Clans und Regionen gehört er keinem einzelnen Land und keinem Geschlecht. Dies ist beabsichtigt. Wer den Tartan der Hüter trägt, repräsentiert in diesem Augenblick weder eines der albischen Fürstentümer, noch Cenyr, oder Aldrimar.",
        "Er trägt das gemeinsame Erbe des alten albischen Königreiches.",
        "Das Recht, daraus gefertigte Kleidung als Zeichen der Mitgliedschaft zu tragen, wird mit der Aufnahme persönlich verliehen. Es kann weder vererbt noch durch Heirat erworben werden.",
        "Kinder eines Hüters besitzen daher ebenso wenig das Recht, den Tartan zu tragen, wie dessen Gemahl oder Gemahlin – sofern sie nicht selbst in die Gemeinschaft aufgenommen wurden.",
        "Der Tartan wird vor allem bei Zusammenkünften, Ehrungen, Festen, bedeutenden Verkostungen, Brennereijubiläen und anderen feierlichen Anlässen getragen.",
        "Nach dem Tod eines Hüters verbleibt seine Kleidung gewöhnlich bei seiner Familie.",
        "Sie darf bewahrt und ausgestellt werden.",
        "<strong>Vererbt wird der Tartan als Erinnerungsstück, nicht das Recht, ihn zu tragen.</strong>",
        "So finden sich in manchen Brennereien, Gasthäusern und Familienhäusern noch heute die Kilts oder Schärpen längst verstorbener Hüter neben alten Porträts, Quaichs und anderen Erinnerungsstücken.",
        "<strong>Die Nadel der Hüter</strong>",
        "Neben dem Tartan erhält jedes Mitglied bei seiner Aufnahme eine <strong>Nadel der Hüter</strong>.",
        "Sie zeigt traditionell eine stilisierte <strong>Quaich</strong>, verbunden mit einer Ähre, und trägt die Worte:",
        "<strong><em>Uisge Beatha</em></strong>",
        "Während der Tartan vor allem zeremoniellen Charakter besitzt, wird die Nadel häufig auch im Alltag getragen.",
        "Sie kann an Mantel, Wams, Kilt oder höfischer Kleidung befestigt werden. Ritter tragen sie gelegentlich sogar an ihrer Rüstung.",
        "Unter Brennmeistern, Küfern, Händlern und Kennern wird sie gewöhnlich unmittelbar erkannt.",
        "Die Nadel verleiht ihrem Träger keine Amtsgewalt.",
        "Sie sagt nicht: <em>Dieser Mensch entscheidet darüber, was Albischer Whisky ist.</em>",
        "Sie sagt: <strong>Dieser Mensch hat sich um Albischen Whisky verdient gemacht.</strong>",
        "Nach dem Tod eines Hüters darf auch seine Nadel in Familienbesitz verbleiben und ausgestellt werden. Wie der Tartan darf sie von einem Nachkommen jedoch nicht als eigenes Ehrenzeichen getragen werden."
      ]
    },
    {
      "pageTitle": "IV. — Aufnahme & die Quaich",
      "illustration": "04-aufnahme",
      "paragraphs": [
        "<strong>Die Aufnahmezeremonie</strong>",
        "Die Aufnahme eines neuen Hüters gehört zu den wichtigsten Feierlichkeiten der Gemeinschaft. Der Anwärter erscheint ohne den Tartan der Hüter vor der Versammlung.",
        "Zunächst werden seine Verdienste verlesen. Seine Fürsprecher berichten, weshalb sie ihn vorgeschlagen haben und welchen Beitrag er zur Kultur des <em>Uisge Beatha</em> geleistet hat.",
        "Anschließend erhält er erstmals den Tartan der Gemeinschaft. Danach wird ihm seine persönliche Nadel überreicht. Den Abschluss bildet die <strong>Quaich der Hüter</strong>.",
        "Für diesen Zweck wird traditionell kein besonders kostbarer oder möglichst alter Whisky gewählt. Stattdessen enthält die Quaich eine Vermählung ausgewählter Whiskys aus unterschiedlichen Ländern und Regionen der albischen Fürstentümer.",
        "Alte und neue Heimat. Heutige Fürstentümer ebenso wie Länder, die seit Jahrhunderten oder Jahrtausenden eigene Wege gehen.",
        "Der darin enthaltene Whisky soll nicht das Beste einer einzelnen Region darstellen.",
        "Er soll das Gemeinsame darstellen. Der neue Hüter trinkt aus der Quaich und reicht sie weiter.",
        "Erst danach befestigt er selbst seine Nadel am Tartan.",
        "Von diesem Augenblick an gehört er zu den <strong>Luchd-Glèidhidh an Uisge Bheatha</strong>.",
        "<strong>Die Bedeutung der Quaich</strong>",
        "Die zweihenklige <strong>Quaich</strong> besitzt innerhalb der Gemeinschaft besondere Bedeutung.",
        "Sie ist nicht das gewöhnliche Gefäß einer fachlichen Whiskyverkostung. Für die genaue Beurteilung von Farbe, Duft und Geschmack verwenden auch die Hüter geeignetere Gläser.",
        "Die Quaich erfüllt einen anderen Zweck.",
        "Sie wird verwendet, wenn nicht das Prüfen, sondern das <strong>Teilen</strong> im Mittelpunkt steht.",
        "Bei Aufnahmen. Bei besonderen Ehrungen. Zur Besiegelung einer Versöhnung. Beim Empfang bedeutender Gäst und beim Gedenken an verstorbene Hüter.",
        "Denn eine Quaich wird nicht einem einzelnen Menschen hingestellt. Sie wandert von Hand zu Hand.",
        "Damit verkörpert sie einen der ältesten Gedanken der Gemeinschaft: <em>Uisge Beatha</em> besitzt seinen größten kulturellen Wert nicht dort, wo es verschlossen und gesammelt wird, sondern dort, wo Menschen es miteinander teilen.",
        "Daraus entstand ein weiterer unter Hütern verbreiteter Ausspruch: <strong>„Whisky, den niemand teilt, bewahrt keine Kultur.“</strong>"
      ]
    },
    {
      "pageTitle": "V. — Begegnung & Austausch",
      "illustration": "05-zusammenkunft",
      "paragraphs": [
        "<strong>Zusammenkünfte der Hüter</strong>",
        "Die Zusammenkünfte der Hüter sind zugleich gesellschaftliche Treffen, fachlicher Austausch und Pflege gemeinsamer Tradition.",
        "Dort werden neue Abfüllungen vorgestellt, alte Fässer geöffnet und seltene Whiskys miteinander geteilt. Brennmeister berichten von ihrer Arbeit, Küfer sprechen über Holz und Fassbau, Händler über Entwicklungen in fremden Ländern und Gelehrte über neu entdeckte Aufzeichnungen.",
        "Nicht selten entstehen bei solchen Treffen neue Verbindungen zwischen Brennereien unterschiedlicher Regionen.",
        "Wissen wird weitergegeben. Fässer wechseln den Besitzer. Junge Brenner lernen erfahrene Meister kennen.",
        "Alte Herstellungsverfahren werden diskutiert und gelegentlich vor dem Vergessen bewahrt.",
        "Dabei sind die Treffen keineswegs ausschließlich feierlich.",
        "Die Hüter trinken gemeinsam, essen, erzählen Geschichten und streiten mit großer Hingabe über Whisky.",
        "Eine stundenlange Auseinandersetzung darüber, ob ein Fass drei Jahre früher hätte abgefüllt werden sollen, gilt innerhalb der Gemeinschaft nicht als misslungener Abend.",
        "Eher im Gegenteil."
      ]
    },
    {
      "pageTitle": "VI. — Comann, Hüter & Fianna",
      "illustration": "06-fianna",
      "paragraphs": [
        "<strong>Verhältnis zum Comann Braich Alba</strong>",
        "Obwohl die Hüter dem Umfeld des <strong>Comann Braich Alba</strong> angehören, sind beide Gemeinschaften nicht gleichzusetzen.",
        "Der Comann Braich Alba legt die Voraussetzungen fest, unter denen ein Whisky als <strong>Albischer Whisky</strong> anerkannt und mit dem <em>Uisge-Beatha</em>-Siegel versehen werden darf.",
        "Seine Amtsträger kontrollieren Herkunft, Herstellung, Reifung und Abfüllung und bewahren damit gemeinsame Standards über die Grenzen der heutigen Reiche hinweg.",
        "Die Hüter besitzen diese Aufgabe nicht. Ein Amtsträger des Comann kann Hüter sein, muss es jedoch nicht.",
        "Ebenso kann ein Hüter sein gesamtes Leben lang niemals ein offizielles Amt im Comann bekleiden.",
        "Ihre Aufgaben ergänzen sich vielmehr. <strong>Der Comann Braich Alba bewahrt, wie Uisge Beatha gemacht wird. Die Hüter bewahren, warum es gemacht wird.</strong>",
        "<strong>Die Hüter und die Fianna</strong>",
        "Wie der Comann Braich Alba stehen auch die Hüter letztlich in der Tradition der <strong>Fianna</strong>.",
        "Für die Fianna ist Whisky dabei keineswegs nur ein Getränk. Er gehört zu jenen kulturellen Gemeinsamkeiten, die den Untergang des albischen Königreichs überlebt haben.",
        "Sprache, Geschichten, Musik, Bräuche, Handwerk und <em>Uisge Beatha</em> erinnern daran, dass die heutigen albischen Länder trotz ihrer politischen Unterschiede aus einer gemeinsamen Geschichte hervorgegangen sind.",
        "Gerade deshalb ist die Existenz von Hütern außerhalb der heutigen albischen Fürstentümer von besonderer Bedeutung.",
        "Dass ein Cenyri oder Aldrimarer Hüter werden kann, stellt ihre heutige Eigenständigkeit nicht infrage.",
        "Im Gegenteil. Es erkennt an, dass ein Volk sich verändern und neue Reiche gründen kann, ohne sämtliche Teile seiner Vergangenheit ablegen zu müssen."
      ]
    },
    {
      "pageTitle": "VII. — Meurig & die Venalys-Fässer",
      "illustration": "07-meurig",
      "paragraphs": [
        "<strong>Bekannte Hüter – Sir Meurig Draig</strong>",
        "Eines der in Cenyr bekanntesten Beispiele für eine Berufung ist <strong>Sir Meurig Draig</strong>.",
        "Während eines Aufenthalts in Venalys stieß Meurig auf eine größere Anzahl von Fässern, deren Whisky ursprünglich aus Uathneach stammte.",
        "Das Destillat war nach den Regeln des Comann als Albischer Whisky hergestellt und gereift worden. Da sich die Fässer inzwischen jedoch außerhalb des anerkannten historischen Kulturraumes befanden, hätte eine Abfüllung in Venalys nicht unter der geschützten Bezeichnung erfolgen dürfen.",
        "Für den Händler stellte dies ein erhebliches wirtschaftliches Problem dar.",
        "Meurig kaufte schließlich den gesamten Bestand.",
        "Die Fässer wurden nach Cenyr gebracht und dort unter Einhaltung der Vorschriften abgefüllt. Dadurch konnte der Bestand wieder ordnungsgemäß als Albischer Whisky anerkannt werden und das <em>Uisge-Beatha</em>-Siegel erhalten.",
        "Unter den Hütern wurde dies später als <strong>Rückführung der Venalys-Fässer</strong> bekannt.",
        "Meurig selbst hatte die Angelegenheit ursprünglich kaum als kulturelle Tat verstanden.",
        "Andere taten es.",
        "Durch seinen Kauf war ein bedeutender Bestand nicht unter fremder Bezeichnung abgefüllt, verschnitten oder anderweitig dem geschützten albischen Whiskyerbe entzogen worden.",
        "Seine spätere Berufung zum Hüter erfolgte aufgrund dieses Beitrags."
      ]
    },
    {
      "pageTitle": "VIII. — Maredudd & die gerettete Geschichte",
      "illustration": "08-maredudd",
      "paragraphs": [
        "<strong>Bekannte Hüter – Sir Maredudd Draig</strong>",
        "Auch <strong>Sir Maredudd Draig</strong>, späterer Feldmarschall des Hauses Draig, wurde nicht allein aufgrund seiner bekannten Leidenschaft und außergewöhnlichen Kenntnis des Whiskys aufgenommen.",
        "Seine Berufung geht auf eine Begebenheit im <strong>Ährental</strong> zurück.",
        "Maredudds Gemahlin <strong>Lady Alawyn Draig, geborene Grawn</strong>, stammte aus dem dortigen Grafenhaus. Während eines gemeinsamen Aufenthaltes in ihrer Heimat wollte sie ihrem Gemahl eine kleine Brennerei zeigen, deren Whisky Maredudd bereits kannte und schätzte.",
        "Die Brennerei gehörte zu einem alten Gasthaus und produzierte nur geringe Mengen. Ihre Bedeutung lag weniger in ihrer Größe als in ihrer Geschichte.",
        "Aufzeichnungen der dortigen Familie ließen ihre Brenntradition bis weit vor die Entstehung des heutigen Cenyr zurückverfolgen. Die Familie war im Laufe der Jahrtausende cenyrisch geworden – ihre Art, <em>Uisge Beatha</em> zu brennen, hatte jedoch ihre Wurzeln noch im alten Fürstentum Osneach.",
        "Als Maredudd und Alawyn den Ort erreichten, standen Teile des Gasthauses und der Brennerei nach einem Überfall in Flammen.",
        "Nachdem die unmittelbar bedrohten Menschen in Sicherheit gebracht worden waren, erfuhr Maredudd von den alten Aufzeichnungen, die sich noch im Gebäude befanden.",
        "Er ging zurück hinein.",
        "Neben den Archivalien rettete er auch den ausgestellten Tartan und die Nadel eines längst verstorbenen Hüters aus der Familie der Brenner.",
        "Erst die spätere Untersuchung der geretteten Dokumente zeigte ihren außergewöhnlichen historischen Wert. Sie gehörten zu den wichtigen erhaltenen Zeugnissen dafür, wie eine ursprünglich albische Brenntradition über die Entstehung Cenyrs hinweg fortbestanden und zu einem selbstverständlichen Bestandteil cenyrischer Kultur geworden war.",
        "Maredudd hatte damit nicht lediglich die Aufzeichnungen einer kleinen Brennerei gerettet.",
        "Er hatte einen Teil der gemeinsamen Geschichte beider Kulturen vor dem Verlust bewahrt.",
        "Dafür wurde er später in den Kreis der Hüter aufgenommen. Maredudd selbst soll seine Tat wesentlich nüchterner beschrieben haben:",
        "<strong>„Die Aufzeichnungen waren nicht ersetzbar. Ich schon.“</strong>"
      ]
    },
    {
      "pageTitle": "IX. — Alawyn & die Spuren im Ährental",
      "illustration": "09-alawyn",
      "paragraphs": [
        "<strong>Lady Alawyn Draig</strong>",
        "Bemerkenswert ist, dass Maredudd durch seine Berufung nicht der erste Hüter innerhalb seiner Ehe wurde.",
        "<strong>Lady Alawyn war bereits vor ihm Mitglied der Gemeinschaft.</strong>",
        "Als Helwyr bereiste sie über Jahre große Teile des Ährentals und kannte zahlreiche seiner abgelegenen Höfe, Gasthäuser und kleinen Brennereien.",
        "Sie hatte begonnen, alte regionale Brenntraditionen, Familiengeschichten und Herstellungsweisen zusammenzutragen und miteinander in Beziehung zu setzen. Gerade kleinere Betriebe, deren Geschichte außerhalb ihrer Heimat kaum bekannt war, fanden durch ihre Arbeit größere Aufmerksamkeit.",
        "Ihre Aufzeichnungen trugen dazu bei, mehrere alte Traditionen des Ährentals zu dokumentieren und an nachfolgende Generationen weiterzugeben.",
        "Ihre Aufnahme erfolgte daher nicht als Angehörige des Hauses Grawn und ebenso wenig als Gemahlin Maredudds.",
        "Sie wurde Hüterin aufgrund <strong>ihrer eigenen Arbeit</strong>.",
        "Nach ihrem Tod verblieben ihr Tartan, ihre Nadel und ihre Quaich im Besitz ihrer Familie. Wie es die Tradition verlangt, werden sie bewahrt, aber von keinem ihrer Nachkommen getragen.",
        "Ihr Bogen ging später an ihre Enkelin <strong>Carys Draig</strong>.",
        "So befinden sich in der Familie bis heute verschiedene Erinnerungsstücke an eine Frau, die sowohl als Helwyr als auch als Hüterin des Wassers des Lebens Spuren hinterließ."
      ]
    },
    {
      "pageTitle": "X. — Gedenken & was bleibt",
      "illustration": "10-erinnerung",
      "paragraphs": [
        "<strong>Das Gedenken an verstorbene Hüter</strong>",
        "Stirbt ein Mitglied, wird seiner bei der nächsten größeren Zusammenkunft gedacht. An seinem Platz steht zunächst lediglich eine leere Quaich.",
        "Jeder anwesende Hüter gibt einen kleinen Schluck des Whiskys hinein, den er an diesem Abend selbst mitgebracht hat.",
        "Keine Flasche soll dabei vorgeschrieben sein. Der eine bringt einen kostbaren alten Brand.",
        "Der andere den Whisky einer kleinen Brennerei seiner Heimat. Ein Dritter vielleicht die Lieblingsabfüllung des Verstorbenen.",
        "Am Ende wird die gefüllte Quaich durch die Gemeinschaft gereicht und gemeinsam auf den verstorbenen Hüter getrunken.",
        "Erst danach wird sein Platz geräumt. Die Zeremonie gilt nicht als Trauer darüber, dass niemand mehr dort sitzt.",
        "Sie erinnert daran, <strong>was dieser Mensch hinterlassen hat</strong>.",
        "<strong>Leitsätze der Hüter</strong>",
        "Drei Aussprüche werden besonders häufig mit den <strong>Luchd-Glèidhidh an Uisge Bheatha</strong> verbunden:",
        "<strong>„Was bleibt durch dich, wenn du gegangen bist?“</strong>",
        "<strong>„Whisky, den niemand teilt, bewahrt keine Kultur.“</strong>",
        "Jener Satz, der das Verhältnis zwischen ihnen und dem Comann Braich Alba wohl am besten beschreibt:",
        "<strong>„Der Comann bewahrt das Wasser des Lebens. Wir bewahren seine Geschichte.“</strong>",
        "Denn letztlich besteht die Aufgabe eines Hüters nicht darin, möglichst viel über Whisky zu wissen.",
        "Nicht darin, die älteste Flasche zu besitzen.",
        "Auch nicht darin, die feinsten Jahrgänge unterscheiden zu können.",
        "Ein <strong>Luchd-Glèidhidh an Uisge Bheatha</strong> trägt diesen Namen, weil irgendwann etwas von der Kultur des <em>Uisge Beatha</em> drohte, verloren zu gehen, vergessen zu werden oder niemals zu entstehen – <strong>und weil durch sein Handeln etwas davon geblieben ist.</strong>"
      ]
    }
  ];

  section.entries.push({
    id,
    title: 'Luchd-Glèidhidh an Uisge Bheatha',
    subtitle: 'Die Hüter des Wassers des Lebens',
    type: 'Ehrengesellschaft · Albische Whiskykultur',
    category: 'Alben · Fianna',
    image: `${assetRoot}/01-gemeinschaft.png`,
    icon: '✦',
    stamp: 'DIE HÜTER · UISGE BEATHA',
    multipage: true,
    appendCommentsPage: false,
    enablePageComments: true,
    pages: chapters.map(({ pageTitle, illustration, paragraphs }) => ({
      pageTitle,
      image: `${assetRoot}/${illustration}.png`,
      imageWidth: 38,
      imageFit: 'contain',
      imagePosition: 'center',
      description: paragraphs.join('<br><br>'),
      commentSequence: []
    }))
  });
})();
