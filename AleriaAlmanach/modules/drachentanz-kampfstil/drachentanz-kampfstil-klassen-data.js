// Editorial companion to the first Drachentanz module; load immediately after it.
// Class histories are abridged from the class pages listed in README.md.
(function registerDrachentanzKampfstilKlassen() {
  const id = 'drachentanz-kampfstil-klassen';
  if (SECTIONS.some(section => section.entries?.some(entry => entry.id === id))) return;

  const section = SECTIONS.find(section => section.entries?.some(entry => entry.id === 'drachentanz-kampfstil'));
  const firstPart = section?.entries.find(entry => entry.id === 'drachentanz-kampfstil');
  if (!firstPart) throw new Error('Drachentanz Kampfstil - Klassen benötigt den ersten Teil.');
  const imageRoot = './public/assets/drachentanz-kampfstil-klassen/';

  const spearForms = [
    {
      name: 'Tanz des Speerdrachens',
      text: 'Diese erste gemeinsame Form des <strong>Cantref und Uchelwyr</strong> folgt der Schwertdrachenform und verbindet sie mit <strong>albischen Einflüssen</strong>. Ihr Kennzeichen ist eine <em>flüssige, stetige Bewegung</em>: Spitze, Schaft und Schritte bilden eine zusammenhängende Folge, die den Gegner auf Abstand hält und ohne starres Verharren zum nächsten Stoß führt.'
    },
    {
      name: 'Tanz des peitschenden Drachens',
      text: 'Eine <strong>aggressive, explosive und offensive Speerform</strong>. Abrupte Beschleunigung und kurze Wechsel der Angriffsrichtung brechen den gleichmäßigen Rhythmus auf. Der Kämpfer setzt den Gegner unter Druck und nutzt eine entstandene Öffnung für einen entschlossenen Vorstoß.'
    },
    {
      name: 'Tanz des hütenden Drachens',
      text: 'Die <strong>defensive und ausdauernde Speerform</strong> stellt Deckung, Reichweite und den Schutz der eigenen Stellung in den Mittelpunkt. Sparsame Wege der Waffe und kontrollierte Schritte helfen, Druck aufzunehmen und eine Linie über längere Zeit zu bewahren.'
    }
  ];
  const teuluForms = [
    'Tanz des Schwertdrachens', 'Tanz des abwartenden Drachens',
    'Tanz des fliegenden Drachens', 'Tanz des aufsteigenden Drachens',
    'Tanz des brüllenden Drachens', 'Tanz des ausgeglichenen Drachens',
    'Tanz des Zwillingsdrachens'
  ];

  const chapters = [
    {
      name: 'Cantref', classPath: 'Cenyr/cantref', sharedWith: 'Uchelwyr', forms: spearForms,
      image: 'cantref.png',
      history: [
        'Der <strong>Cantref</strong> entstand auf <strong>Estryll</strong>, als das junge Cenyr an der Seite der Alben gegen die Nordmänner kämpfte. Dabei begegneten die avallornischen Ritter den <strong>Airig</strong>, den speerführenden Tiarna der Alben. Ihre Kampfweise beruhte auf der <em>Standhaftigkeit der Linie</em>, auf Reichweite und dem gemeinsamen Vorstoß.',
        'Die Grenzen Cenyrs verlangten nach Rittern, die einen <strong>Bezirk und seine Menschen</strong> schützen konnten. Einige Ritter machten deshalb den Speer zu ihrer Hauptwaffe und verbanden die Disziplin des albischen Speerkampfes mit der Tugendlehre und Formenschulung des <strong>Drachentanzes</strong>. Aus dieser Verbindung erwuchs der Cantref, dessen Name als <em>Hundertschaft des Landes</em> seine Verantwortung ausdrückt.'
      ],
      adaptation: 'Beim <strong>Cantref</strong> trifft die ursprünglich für den <strong>Teulu</strong> entwickelte Schwertkunst auf <strong>Stangenwaffen, Reichweite und Formationskampf</strong>. Er bewahrt die Grundformen des Drachentanzes und führt das Schwert als Nebenwaffe. Seine Überlieferung stellt den ruhigen Stand, die Kontrolle der Distanz und den Schutz einer Linie in den Vordergrund.'
    },
    {
      name: 'Helwyr', classPath: 'Cenyr/helwyr', inheritedForms: teuluForms,
      image: 'helwyr.png',
      forms: [
        { name: 'Tanz des lauernden Drachens', text: 'Der <strong>Bogen</strong> bleibt die Hauptwaffe. Geduld, eine günstige Stellung und der wohlgesetzte Schuss prägen die Form; das <strong>Schwert als Zweitwaffe</strong> sichert den Übergang, wenn der Gegner die Distanz überwindet.' },
        { name: 'Tanz des jagenden Drachens', text: 'Diese Form verbindet <strong>Bogentechniken</strong> mit <strong>Heimlichkeit, Hinterhalt und kurzen Klingen</strong>. Der Helwyr sucht Deckung und günstige Winkel, greift aus einer vorbereiteten Stellung an und wechselt bei enger Distanz zu Dolch oder kurzer Klinge.' }
      ],
      history: [
        'In den frühen Jahrhunderten Cenyrs galt der <strong>Bogen</strong> als Waffe der Jäger, Grenzbauern und Waffenknechte. Fernkämpfer waren notwendig, genossen jedoch lange nicht dasselbe Ansehen wie die sichtbaren Vertreter ritterlicher Tugend. Der Kampf aus der Distanz stand dem Ideal des persönlichen Kräftemessens entgegen.',
        '<strong>Belagerungen, Waldgefechte und Grenzkriege</strong> veränderten dieses Verständnis. Einzelne Ritter begannen, den Bogen als Hauptwaffe zu studieren und Wind, Gelände sowie gegnerische Bewegungen genau zu beobachten. Der Name <strong>Helwyr</strong>, ursprünglich für Jäger und einfache Schützen gebraucht, wurde zum Namen einer ritterlichen Disziplin. Ihr Anspruch verbindet <em>Präzision und Verantwortung</em> mit dem Ziel, einen Krieg mit möglichst wenigen Opfern zu führen.'
      ],
      adaptation: 'Auch die <strong>überlieferten Tänze der Teulu</strong> werden unter den <strong>Helwyr</strong> gelehrt. Ihre eigenen Formen richten die ritterliche Bewegungslehre auf <strong>Distanz, Geduld und den rechten Augenblick</strong> aus. Der lauernde Drache verbindet den Bogen mit dem Schwert, der jagende Drache mit Heimlichkeit und kurzen Klingen.'
    },
    {
      name: 'Uchelwyr', classPath: 'Cenyr/uchelwyr', sharedWith: 'Cantref',
      image: 'uchelwyr.png',
      forms: [...spearForms,
        { name: 'Tanz des stürmenden Drachens', text: 'Der eigene <strong>Kavalleriestil</strong> des Uchelwyr verbindet Reiter, Ross und Waffe. Anritt, Zeitpunkt und kontrolliertes Abbrechen bestimmen die Bewegung. Der Reiter stimmt seine Waffenführung auf die Bewegung seines Rosses ab und wahrt auch nach dem Zusammenprall die Führung.' },
        { name: 'Tanz des schweifenden Drachens', text: 'Diese <strong>offensive Form</strong> sucht wechselnde Angriffswinkel und setzt eine begonnene Bewegung in weiteren Druck um. Der Uchelwyr führt seine Waffe aus der Bewegung, bedroht die Flanke und nutzt Richtungswechsel, um eine fest gewordene Verteidigung aufzubrechen.' }
      ],
      history: [
        '<strong>Uchelwyr</strong> war zunächst eine gesellschaftliche Bezeichnung: der <em>Edle</em> oder <em>Erhabene</em>. In den frühen Tagen Cenyrs meinte das Wort einen Ritter von Stand und bezeichnete noch keine eigene militärische Spezialisierung.',
        'Als sich <strong>Teulu</strong> und <strong>Cantref</strong> durch eigene Waffenformen unterschieden, entwickelte sich auch unter den hochgeborenen Reitern eine besondere Kampftradition. Die von Kindesbeinen an im Sattel erzogenen Ritter passten den <strong>Drachentanz</strong> an <strong>Geschwindigkeit, Anritt und Stoßkraft</strong> an. So wurde aus dem allgemeinen Adelstitel die Bezeichnung für den <em>ritterlichen Reiteradel</em> Cenyrs.'
      ],
      adaptation: 'Der <strong>Uchelwyr</strong> verbindet das Zusammenspiel von <strong>Reiter, Ross und Waffe</strong> mit der gemeinsamen Speerausbildung des Cantref. Am Anfang dieser Speerlehre steht der <strong>Speerdrache</strong>; der <strong>peitschende</strong> und der <strong>hütende Drache</strong> führen sie in Angriff und Abwehr weiter. Der <strong>stürmende</strong> und der <strong>schweifende Drache</strong> ergänzen diese Grundlage als eigene Überlieferungen der Uchelwyr.'
    },
    {
      name: 'Barddwyr', classPath: 'Cenyr/barddwyr', inheritedForms: ['Tanz des Schwertdrachens'],
      image: 'barddwyr.png',
      foundation: 'Am Anfang steht der <strong>Tanz des Jungdrachens</strong>, durch den der Schüler Stand, Schritt und Klinge aufeinander abzustimmen lernt. Wer sich der Rapierkunst widmet, findet im <strong>Tanz des trällernden Drachens</strong> zu einem eigenen Rhythmus. Aus dieser Schulung wächst später die anspruchsvolle Lehre des <strong>kreischenden Drachens</strong>. Daneben bewahren die Waffenmeister den <strong>Schwertdrachen</strong> für jene, die ihre Kunst mit dem Schwert vertiefen. Jeder dieser Wege verlangt geduldige Übung; nur wenige vermögen mehrere bis zur Meisterschaft zu verfolgen.',
      forms: [
        { name: 'Tanz des trällernden Drachens', text: 'Mit dieser <strong>schnellen Rapierform</strong> verfeinert der junge Barddwyr das Zusammenspiel von Takt, Klinge und Bewegung. Kleine Wege der Spitze und präzise Angriffe schulen sein Gefühl für den Rhythmus eines Duells und bereiten ihn auf die anspruchsvolleren Lehren seiner Meister vor.' },
        { name: 'Tanz des kreischenden Drachens', text: 'In den Händen eines <em>erfahrenen Barddwyr</em> findet die Rapierkunst im kreischenden Drachen ihre schärfere Stimme. <strong>Schnelligkeit, Ausweichen, Stellungswechsel und präzise Treffer</strong> verbinden sich zu einer beweglichen Duellform, die den Rhythmus des Gegners stört und kurze Öffnungen nutzt.' }
      ],
      history: [
        'Die Tradition der <strong>Barddwyr</strong> führt auf <strong>Sir Ceirwyn</strong>, den letzten wahren Kampfbarden der avallornischen Überlieferung, zurück. Mit den avallornischen Geschlechtern gelangte seine Verbindung von <strong>Lied und Klinge</strong> nach Cenyr. Das Haus <strong>Ceirwyn O’Calon</strong> bewahrte dieses Erbe.',
        'Eine geregelte Ausbildung entstand, als das Haus alte Notationen, magische Klangformeln und Chroniken zusammentrug. Aus der Wiederentdeckung wurde eine eigene Tradition. Die Barddwyr entwickelten sich zu <strong>Hütern der Erinnerung</strong>, Chronisten und Gestaltern der höfischen Kultur. Im Frieden bewahren sie Geschichte, im Krieg stärken sie durch ihre Kunst den Geist ihrer Verbündeten.'
      ],
      adaptation: 'Der <strong>Barddwyr</strong> verbindet <strong>Klang, Magie und Klinge</strong>. Seine Variante des Drachentanzes ist an <strong>Degen, Rapier und schlanke Einhänder</strong> angepasst, geprägt von <em>Geschicklichkeit, Präzision und Schnelligkeit</em>. Der Jungdrache bildet das gemeinsame Fundament. Neben den eigenen Rapierformen wird auch der <strong>Tanz des Schwertdrachens</strong> von Lehrer zu Schüler weitergegeben.'
    },
    {
      name: 'Arthwyr', classPath: 'Cenyr/arthwyr', inheritedForms: teuluForms,
      image: 'arthwyr.png',
      forms: [
        { name: 'Tanz der Bärenklaue', text: 'Die <strong>einzige besondere Form der Arthwyr</strong> entspringt der Überlieferung des Hauses <strong>Arth O’Guwan</strong>. <strong>Kurze Distanz, Wucht, Griff und Durchbruch</strong> prägen sie. Der Kämpfer setzt Körper und geführte Waffe entschlossen ein, um im Gedränge Raum zu erzwingen; Standfestigkeit bleibt auch auf unsicherem Boden entscheidend.' }
      ],
      history: [
        'Die Wurzeln der <strong>Arthwyr</strong> liegen in den Küstenjahren des Hauses <strong>Arth O’Guwan</strong>. Seezüge, Sturmfahrten und Entergefechte verlangten eine Kampfweise, die auch auf schwankenden Decks und zwischen Tauwerk und Splitterholz Bestand hatte. <strong>Kraft, Zähigkeit und Standfestigkeit</strong> gewannen dabei besonderes Gewicht.',
        'Die <strong>Saat des Bären</strong> begünstigte diese Eigenschaften innerhalb des Hauses. <strong>Parzifal Arth</strong> verband als Tafelritter die ritterliche Lehre Cenyrs mit den Erfahrungen des Seekampfes, ordnete sie und gab sie gezielt an Kinder und Getreue weiter. Daraus erwuchs eine <em>hausgebundene Kriegstradition</em>, die den Namen Arthwyr trägt.'
      ],
      adaptation: 'Die <strong>überlieferten Tänze der Teulu</strong> gehören auch zur Waffenlehre der <strong>Arthwyr</strong>. Ihre eigene Überlieferung bündelt sich im <strong>Tanz der Bärenklaue</strong>, einer direkten, körperlichen Kampfweise auf kurzer Distanz. Die Geschichte des Hauses erklärt dabei die Bedeutung von Standfestigkeit, Nähe und Durchbruch.'
    },
    {
      name: 'Derwyn', classPath: 'Vennyr/derwyn',
      image: 'derwyn.png',
      foundation: 'Derwyn aus <strong>Cenyr und Vennyr</strong> folgen einer gemeinsamen Waffenlehre. Ihre ersten Lehrjahre können sie mit dem <strong>cenyrischen Tanz des Jungdrachens</strong> oder dem <strong>vennyrischen Tanz der jungen Welle</strong> verbringen. Darauf folgt eine <em>Zeit des freien Übens und Erprobens</em>: Die Schüler lösen sich von starren Folgen, verbinden vertraute Bewegungen und suchen nach einer eigenen Handschrift. Erst wenn dieses Fundament gefestigt ist, vertiefen sie sich unter kundiger Anleitung in die <strong>vier Wyrmformen</strong>. Beide Anfänge führen zu diesen Lehren.',
      forms: [
        { name: 'Tanz des fließenden Wyrms', text: 'Eine <strong>Schwertform</strong>, die aus dem <strong>Tanz des abwartenden Drachens</strong> hervorgeht. Sie nimmt Druck auf, lenkt ihn um und verbindet ruhige Deckung mit einem präzise vorbereiteten Gegenschlag. Ihre fließende Bewegung folgt der Wyrmtanz-Tradition der Derwyn.' },
        { name: 'Tanz des brandenden Wyrms', text: 'Die Form des <strong>Dreizacks</strong> verbindet Reichweite, das Führen der gegnerischen Waffenlinie und einen entschlossenen Vorstoß. Die Spitze hält den Zugang offen oder versperrt ihn; ein kontrollierter Wechsel zwischen zurückgenommenem Druck und kräftigem Stoß erinnert an die Brandung.' },
        { name: 'Tanz des steigenden Wyrms', text: 'Der <strong>Kampfstab oder Zauberstab</strong> führt diese Nahkampfform. Hebel, aufsteigende Waffenwege und wechselnde Griffweiten verbinden Abwehr mit gezielten Schlägen. In den Händen eines geübten Derwyn vermag auch der Zauberstab einen Hieb abzufangen oder einen Gegner zurückzudrängen. Die Geheimnisse von Gebet und Zauberkunst werden in eigener Unterweisung weitergegeben.' },
        { name: 'Tanz des peitschenden Wyrms', text: 'Die eigene Form für den <strong>Morgenstern</strong> verlangt eine kontrollierte Führung der schweren Schlagwaffe. Rhythmuswechsel, kurze Rücknahmen und peitschende Hiebe setzen die gegnerische Deckung unter Druck, ohne den eigenen Stand leichtfertig aufzugeben.' }
      ],
      history: [
        'Die Ursprünge der <strong>Derwyn</strong> reichen in die Überlieferung <strong>Avallorns</strong> zurück. Erzählungen führen ihre frühen Lehren auf Druiden zurück, die an heiligen Quellen und Küsten die <strong>Stimme Nimues</strong> suchten. Als die avallornische Flotte aufbrach, begleiteten die Derwyn sie als <em>Priester und Bewahrer</em>.',
        'In Cenyr fand diese ältere Glaubenstradition neuen Boden. Ihre Geschichte bewahrte sich besonders in <strong>Ritualen, Gesängen und Küstenheiligtümern</strong>. In <strong>Cenyr wie in Vennyr</strong> tragen die Derwyn dieses Erbe bis heute weiter. Sie sind Diener Nimues: <strong>Alle Derwyn sind Kleriker, aber nur manche zugleich Ritter.</strong>'
      ],
      adaptation: 'Die kämpfenden <strong>Derwyn</strong> bewahren im <strong>Wyrmtanz</strong> eine gemeinsame, vom Drachentanz geprägte Nahkampflehre. Lehrmeister beider Länder geben ihre Kunst weiter; die Heimat eines Schülers allein bestimmt nicht, welche Grundform er erlernt. In der gemeinsamen Überlieferung verbinden sich <strong>Glauben, fließende Bewegung und vier klar unterschiedene Waffenformen</strong>.'
    }
  ];

  const entry = {
    id,
    title: 'Drachentanz Kampfstil - Klassen',
    subtitle: 'Von der Schwertkunst der Teulu zu den Waffenlehren Cenyrs und Vennyrs',
    type: 'Kampfstil · Überlieferung',
    category: firstPart.category,
    image: imageRoot + chapters[0].image,
    stamp: firstPart.stamp,
    icon: firstPart.icon,
    multipage: true,
    appendCommentsPage: false,
    enablePageComments: true,
    locked: false,
    pages: chapters.map((chapter, index) => ({
      pageTitle: `${index + 1}. ${chapter.name}`,
      image: imageRoot + chapter.image,
      imageWidth: 38,
      imageFit: 'cover',
      imagePosition: 'top',
      description: [
        `<strong>Der ${chapter.name} und der Drachentanz</strong>`,
        '<strong>Geschichte & Herkunft</strong>',
        ...chapter.history,
        '<strong>Die Verbindung zum Drachentanz</strong>',
        chapter.adaptation,
        '<strong>Lehrjahre und Vertiefung</strong>',
        chapter.foundation || 'Am Anfang der Waffenlehre steht der <strong>Tanz des Jungdrachens</strong>. Der Schüler übt Stand, Schritt und Klingenführung, bis die grundlegenden Bewegungen sicher ineinandergreifen. Darauf folgt eine <em>Zeit des freien Übens</em>, in der er vertraute Folgen abwandelt und eigene Übergänge erprobt. Erst mit gefestigter Hand und geschultem Urteil vertieft er sich unter Anleitung eines Waffenmeisters in die weiterführenden Tänze. Welche Lehren ihn prägen, hängt von seinen Lehrern, seinen Aufgaben und seiner eigenen Veranlagung ab. Die Beherrschung eines einzigen Tanzes kann Jahre fordern; mehrere zur Meisterschaft zu führen, verlangt oft ein Leben voller Übung.',
        ...(chapter.inheritedForms ? [
          '<strong>Überlieferte Teulu-Formen</strong>',
          chapter.inheritedForms.map(name => name === 'Tanz des aufsteigenden Drachens'
            ? `↳ <strong>${name}</strong> <em>– Unterform des fliegenden Drachens</em>`
            : `<strong>${name}</strong>`).join('<br>')
        ] : []),
        '<strong>Eigene Kampfformen</strong>',
        ...(chapter.sharedWith ? [`Die ersten drei Formen werden gemeinsam mit dem <strong>${chapter.sharedWith}</strong> überliefert. Der <strong>Speerdrache</strong> steht an erster Stelle.`] : []),
        ...chapter.forms.map((form, formIndex) => `<strong>${formIndex + 1}. ${form.name}</strong><br>${form.text}`),
        `<a href="../Klassenordner/${chapter.classPath}/index.html#ausbildungsplan">Überlieferung und Lehrkunst der ${chapter.name}</a>`
      ].join('<br><br>')
    }))
  };

  section.entries.splice(section.entries.indexOf(firstPart) + 1, 0, entry);
})();
