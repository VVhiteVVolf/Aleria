(() => {
  "use strict";

  function portrait(personId, alt) {
    return {
      src: `../Stammb%C3%A4ume/assets/images/portraits/haus-suedstahl/${personId}.png`,
      alt,
      format: "portrait",
    };
  }

  window.HAEUSER_DATA = {
  meta: {
    id: "haus-suedstahl",
    title: "Clan Südstahl - Aleria",
    type: "Huskarl-Clan",
    status: "Active",
    editorVersion: 1,
    template: "haus",
    storage: {
      document: "haus-suedstahl",
      firebaseCollections: {
        houses: "familien_haeuser_und_clans",
        inlineContent: "familien_haeuser_und_clans_inline_content",
        scenes: "familien_haeuser_und_clans_scenes",
      },
      imageStorage: {
        currentMode: "local-feature-assets",
        plannedProvider: "firebase-storage",
        plannedRoot: "haeuser/haus-suedstahl/images",
        plannedFirestoreMode: "reference",
      },
    },
  },

  name: "Clan Südstahl",
  hierarchy: [
    { type: "Sammlung", name: "Familien Häuser und Clans", slug: "familien-haeuser-und-clans" },
    { type: "Königreich", name: "Aldrimar", slug: "aldrimar" },
    { type: "Jarltum", name: "Kronental", slug: "kronental" },
    { type: "Herrschaft", name: "Tal der Helden", slug: "tal-der-helden" },
    { type: "Sitz", name: "Heldenwacht", slug: "heldenwacht" },
    { type: "Clan", name: "Clan Südstahl", slug: "haus-suedstahl" },
  ],

  classification: {
    category: "Familien Häuser und Clans",
    houseType: "Huskarl-Clan",
    scale: "Vasallenclan",
    parentHouseId: "haus-vaeren",
    rootHouseId: "haus-suedstahl",
    territoryId: "heldenwacht",
  },

  profile: {
    motto: "Loyalität vor Blut",
    quoteAuthor: "Wahlspruch des Clans",
    highestTitle: "Huskarl",
    houseType: "Huskarl-Clan",
    seat: "Heldenwacht",
    affiliation: "Königreich Aldrimar | Clan Vaeren",
    troopStrength: "Nicht überliefert",
    tiarna: "Keine eigene Tiarnatradition belegt",
    kerns: "Flinke Huskarle und eigene Clankrieger",
    fleet: "Seefahrer; enge Verbindung zu Clan Tauwind",
    founding: "1691 in Heldenwacht",
    milestoneOne: "1690 wird Salah Justiziar König Rag Blauzahns und heiratet Gormlaith Frisealach.",
    milestoneTwo: "1719 übernimmt Malak nach Salahs Tod die Führung des Clans.",
    people: "Istharanisches und albisches Gründererbe; heute nordisch-aldrimarisch geprägt",
    wealth: "Respektabel; Abenteuerschätze, exotischer Handel und eine eigene Universität",
    religion: "Nicht überliefert",
    patronDeities: "Nicht überliefert",
    origin: "Salah aus Istharan und Gormlaith Frisealach",
    cadetBranches: "Keine überliefert",
    allies: "Clan Vaeren; Clan Tauwind; Kaufmannsgilde Markt der Fortuna",
    enemies: "Keine Fehde überliefert",
  },

  sections: {
    overview: "Clan Südstahl ist ein sehr junger Huskarl-Clan aus Heldenwacht. König Rag Blauzahn siedelte seinen langjährigen Gefährten Salah aus Istharan in Aldrimar an und gewährte ihm nach dessen Dienst als Justiziar das Recht, einen eigenen Clan zu gründen. Gemeinsam mit Gormlaith Frisealach begründete Salah 1691 eine Linie, deren Identität nicht auf aldrimarischem Blut, sondern auf Abenteuer, Loyalität und gemeinsam erworbenem Ansehen beruht.",
    classification: "Südstahl ist als Huskarl-Clan des Königlichen Jarltums Kronental erfasst. Sein Sitz liegt in Heldenwacht; der Clan steht als Vasall in unmittelbarer Treue zu Clan Vaeren.",
    history: "Im Jahr 1689 löste sich die berühmte Gilde Wintersonne auf, deren Mitglieder unter Prinz und später König Rag Blauzahn zahlreiche Schlachten, Reisen und Intrigen bestanden hatten. Zu ihren Veteranen gehörten Salah aus Istharan, Gormlaith Frisealach und deren Bruder Diarmuid. 1690 ernannte Rag seinen alten Gefährten Salah zum Justiziar Aldrimars; noch im selben Jahr heirateten Salah und Gormlaith. 1691 erhob der König Salah in den Adelsstand und verlieh ihm das Recht zur Clangründung. So entstand in Heldenwacht Clan Südstahl. Nach Salahs unerwartetem Tod im Jahr 1719 übernahm sein Sohn Malak die Führung.",
    traditions: "Südstahl verbindet südländische Bräuche mit albischem Erbe. Aus dieser Mischung erwuchs ein gelehrter und wissbegieriger Clan, bekannt für flinke Huskarle, geschickte Seefahrer und gebildete Schriftkundige. Salah und Gormlaith werden als Ursprung der Clankultur und als Maßstab ihrer Nachkommen in höchsten Ehren gehalten.",
    knighthood: "Das kriegerische Erbe des Clans beruht auf Salahs südlicher Schwertkunst. Die von ihm begründete Schwertschule Südstahl wird unter den nördlichen Adligen und Huskarlen nur wenig geschätzt, bleibt für die Nachkommen und eigenen Krieger des Clans jedoch ein wichtiger Ort der Ausbildung und Erinnerung. Malak leitet die Schule in der Gegenwart.",
    succession: "Malak führt den Clan seit 1719. Sein Sohn Salah II. gilt als vorgesehener Nachfolger. Eine darüber hinausgehende formale Erbfolgeregel ist nicht überliefert; Raghan trägt als Bruder des Oberhaupts die Verantwortung für Verwaltung, Steuern und Finanzen.",
    holdings: "Südstahls respektabler Wohlstand geht auf die Schätze zurück, die Salah und Gormlaith von ihren Abenteuern nach Aldrimar brachten. In Heldenwacht handelt der Clan gemeinsam mit der Kaufmannsgilde Markt der Fortuna mit exotischen Waren. Zentrum seines gelehrten Einflusses ist eine von Rag Blauzahn gestiftete Universität mit Schwerpunkten in Justiz, Rechtswesen, Nautik, Navigation, Seefahrt und Mathematik. Hinzu kommt die eigene Schwertschule für südliche Schwertkunst.",
    cultureReligion: "Kulturell ist Südstahl ein Sonderfall: Die Gründer trugen weder norrnaigh-nordisches noch glaennath-albisches Erbe in der in Aldrimar üblichen Verbindung, sondern stammten aus Istharan und dem albischen Clan Frisealach. Dennoch hat sich das Haus der aldrimarischen Kultur angepasst und versteht sich heute eindeutig als nordischer Clan. Merkmale der südlichen Herkunft werden aus Respekt vor den Gründern bewusst bewahrt. Eine bestimmte Clanreligion oder eigene Schutzpatrone sind nicht überliefert.",
    conflictsAlliances: "Die Treue Südstahls gilt unverrückbar Clan Vaeren, dem Haus Rag Blauzahns und Königshaus Aldrimars. Aus alter Gefährtenschaft und Dankbarkeit für das verliehene Adelsrecht wurde Südstahl zu einem der loyalsten Vasallen dieses Hauses. Die Ehe Malaks mit Freydis Tauwind erschloss dem Clan maritime Kontakte und Ressourcen; feste Fehden sind nicht überliefert.",
    values: "Südstahl steht für Loyalität vor Blut: Nicht Herkunft, sondern Taten bestimmen den Wert eines Menschen. Mut, Wissen und Dienst am Reich gelten als höchste Tugenden. Der Clan verehrt Abenteuer, Bildung und Pflichtbewusstsein gleichermaßen und glaubt, dass Stärke nicht allein aus Stahl, sondern aus Charakter und Verstand erwächst.",
    court: "Salah begründete und führte den Clan von 1691 bis zu seinem Tod 1719. Heute steht Malak an der Spitze und leitet zugleich die Schwertschule. Raghan verantwortet Verwaltung, Steuern und Finanzen und dient unter dem Oberkämmerer des Königreiches. Freydis Tauwind führt die Handelskontakte zu Häfen, Clan Tauwind und dem Markt der Fortuna.",
    familyTree: "Die überlieferte Hauptlinie beginnt mit Salah und Gormlaith. Ihre Söhne Malak und Raghan begründen mit Freydis Tauwind beziehungsweise Astrid Donnerblut die zweite Generation. Aus Malaks Ehe stammen Lydia, Maela und Salah II.; aus Raghans Ehe Raghild und Diarmuid. Namenlose Verlobten-Platzhalter der Altquelle werden nicht als Personen geführt.",
    historicalFigures: "Die Figurenliste bewahrt sowohl die beiden Gründer als auch die heute prägenden Mitglieder des jungen Clans. Ihre Aufgaben reichen von Clanführung, Schwertschule und Verwaltung bis zu Handel, Studium und der künftigen Erbfolge.",
  },

  figures: {
    heading: "12. Figuren des Clans",
    tableTitle: "Figuren des Clans Südstahl",
    entries: [
      {
        group: "Gründer",
        role: "Gründer · Justiziar · Schwertmeister",
        name: "Salah „Südstahl“ aus Istharan",
        imageKey: "figur-salah-suedstahl",
        description: "Salah war ein südländischer Seefahrer, Schwertkämpfer und notorischer Lebemann. Schon jung schloss er sich der Gilde Wintersonne an, die unter Prinz Rag Blauzahn die weite Welt durchstreifte. Gemeinsam mit Rag und später Gormlaith überlebte er Schlachten, Intrigen, Fernreisen und Sturmfahrten. Seine Jahre in der Gilde prägten ihn als Kämpfer und Kameraden und machten ihn zu einem der berühmtesten Südländer Aldrimars, noch bevor er einen Clan gründete.",
      },
      {
        group: "Gründer",
        role: "Mitgründerin · Gefährtin der Wintersonne",
        name: "Gormlaith Frisealach",
        imageKey: "figur-gormlaith-frisealach",
        description: "Gormlaith stammt aus dem Clan Frisealach, in Aldrimar auch Fraser genannt. Gemeinsam mit ihrem Zwillingsbruder Diarmuid schloss sie sich der Gilde Wintersonne an und wurde zu einer zentralen Gefährtin Rags und Salahs. Nach dem letzten großen Zug heiratete sie Salah. Beide ließen sich in Heldenwacht nieder und dienten Rag; Gormlaith blieb bis zu ihrem Tod an der Seite ihres Mannes und Königs.",
      },
      {
        group: "Hausführung",
        role: "Oberhaupt · Leiter der Schwertschule",
        name: "Malak Südstahl",
        imageKey: "figur-malak-suedstahl",
        description: "Malak ist das heutige Oberhaupt. Er übernahm die Führung, als sein Vater 1719 unerwartet starb, und leitet die traditionsreiche, aber nur schwach besuchte Schwertschule Südstahl. Die großen Clanangelegenheiten führt er selbst; Verwaltung, Steuern und Finanzen überlässt er seinem Bruder Raghan. Malak ist das Gesicht des Clans, Raghan das Getriebe dahinter.",
      },
      {
        group: "Hausführung",
        role: "Verwalter · Gelehrter · Diener des Oberkämmerers",
        name: "Raghan Südstahl",
        imageKey: "figur-raghan-suedstahl",
        description: "Raghan wurde nach Rag Blauzahn benannt. Er arbeitet an der von Rag und Salah begründeten Universität, verwaltet die finanziellen Belange des Clans und dient dem Oberkämmerer des Königreiches. Sein Alltag ist streng durchgetaktet und voller Verpflichtungen; Raghan gilt eher als Mann des Dienstes denn des Familienlebens.",
      },
      {
        group: "Hausführung",
        role: "Handelsbeauftragte · Verbindung zu Clan Tauwind",
        name: "Freydis Tauwind",
        imageKey: "figur-freydis-tauwind",
        description: "Freydis ist Malaks Frau und stammt aus dem traditionsreichen Seefahrerclan Tauwind. Salah arrangierte die Ehe aus strategischen Gründen und erschloss Südstahl damit maritime Ressourcen und Kontakte. Freydis besitzt scharfen Geschäftssinn, pflegt die Beziehungen zum Markt der Fortuna und bildet die Schnittstelle zu ihrem Herkunftsclan.",
      },
      {
        group: "Hausführung",
        role: "Ehefrau Raghans",
        name: "Astrid Donnerblut",
        imageKey: "figur-astrid-donnerblut",
        description: "Astrid Donnerblut ist Raghans Ehefrau. Salah bevorzugte ursprünglich eine Verbindung nach Leitheach, um eine Handelsroute zu festigen, gab aber dem Herzenswunsch seines Lieblingssohnes nach. Anders als Freydis bringt Astrid dem Clan keinen belegten politischen oder wirtschaftlichen Vorteil; sie gilt als anspruchsvoll und schwierig.",
      },
      {
        group: "Junge Generation",
        role: "Schwertkämpferin",
        name: "Lydia Südstahl",
        imageKey: "figur-lydia-suedstahl",
        description: "Lydia ist der Stolz des Clans, eine außergewöhnliche Schwertkämpferin und Exotin unter den Sprösslingen Heldenwachts. Ihr Auftreten bricht Erwartungen, und sie bindet sich an niemanden. Ihr Weg könnte sie in eine Verbindung mit einem Vaeren, zu einer Gilde oder wie einst ihren Großvater in die Ferne führen.",
      },
      {
        group: "Junge Generation",
        role: "Studentin · Poetin",
        name: "Maela Südstahl",
        imageKey: "figur-maela-suedstahl",
        description: "Maela ist ein stiller, sanfter und gelehrter Geist. Sie besucht die Universität Südstahls und widmet sich Studium und Poesie. Ihre Mutter erwägt bereits eine Verbindung zum Clan der Silberzungen aus Ivarsheim, doch Maela möchte ihre Ausbildung zunächst fortsetzen; ihr Vater unterstützt sie darin.",
      },
      {
        group: "Junge Generation",
        role: "Vorgesehener Erbe",
        name: "Salah II. Südstahl",
        imageKey: "figur-salah-ii-suedstahl",
        description: "Salah II. trägt den Namen seines Großvaters. Neben seiner Mutter ist er der einzige Blonde des Hauses und deutet dies selbstgefällig als Zeichen, ein wahrer Nordmann zu sein. Seinen Schwestern geht dieses Gehabe auf die Nerven. Eines Tages soll er den Clan führen; bis dahin will sein Vater ihm die Werte Südstahls vermitteln.",
      },
      {
        group: "Junge Generation",
        role: "Angehende Kauffrau",
        name: "Raghild Südstahl",
        imageKey: "figur-raghild-suedstahl",
        description: "Raghild wurde nach Rag Blauzahn benannt, interessiert sich jedoch vor allem für Wohlstand, Prunk und Glanz. Sie will beim Markt der Fortuna aufsteigen und betrachtet ehrbare Kaufleute und die Klingende Münze ähnlich pragmatisch: Wo Geld fließt, dort sucht sie ihre Zukunft.",
      },
      {
        group: "Junge Generation",
        role: "Junger Krieger",
        name: "Diarmuid Südstahl",
        imageKey: "figur-diarmuid-suedstahl",
        description: "Diarmuid trägt den Namen des Zwillings seiner Großmutter. Ursprünglich sollte er als Mündel in den Süden geschickt werden, doch seine Mutter behielt und verhätschelte ihn. Trotzdem bewährt er sich; am Hof und auf dem Trainingsplatz traut man ihm zu, eines Tages ein großer Krieger zu werden.",
      },
    ],
  },

  images: {
    "haus-wappen": {
      src: "../Stammb%C3%A4ume/assets/images/houses/Aldrimar/Kronental/clan-suedstahl.png",
      alt: "Wappen des Clans Südstahl",
      format: "square",
      maxHeight: 220,
    },
    "haus-hauptbild": {
      src: "assets/images/scenes/haus-suedstahl.png",
      alt: "Stimmungsmotiv des Clans Südstahl",
      format: "portrait",
      maxHeight: 380,
    },
    "haus-banner": {
      src: "../Stammb%C3%A4ume/assets/images/houses/Aldrimar/Kronental/clan-suedstahl.png",
      alt: "Clanzeichen Südstahls",
      format: "square",
      maxHeight: 220,
    },
    "hof-gruender-portrait": portrait("salah-suedstahl", "Salah, Gründer des Clans Südstahl"),
    "hof-oberhaupt-portrait-0001": portrait("malak-suedstahl", "Malak Südstahl"),
    "hof-oberhaupt-portrait-0002": portrait("raghan-suedstahl", "Raghan Südstahl"),
    "hof-oberhaupt-portrait-0003": portrait("freydis-tauwind", "Freydis Tauwind"),
    "hof-oberhaupt-portrait-0004": portrait("astrid-donnerblut", "Astrid Donnerblut"),
    "hof-erbfolge-portrait-0001": portrait("salah-ii-suedstahl", "Salah II. Südstahl"),
    "figur-salah-suedstahl": portrait("salah-suedstahl", "Salah aus Istharan"),
    "figur-gormlaith-frisealach": portrait("gormlaith-frisealach", "Gormlaith Frisealach"),
    "figur-malak-suedstahl": portrait("malak-suedstahl", "Malak Südstahl"),
    "figur-raghan-suedstahl": portrait("raghan-suedstahl", "Raghan Südstahl"),
    "figur-freydis-tauwind": portrait("freydis-tauwind", "Freydis Tauwind"),
    "figur-astrid-donnerblut": portrait("astrid-donnerblut", "Astrid Donnerblut"),
    "figur-lydia-suedstahl": portrait("lydia-suedstahl", "Lydia Südstahl"),
    "figur-maela-suedstahl": portrait("maela-suedstahl", "Maela Südstahl"),
    "figur-salah-ii-suedstahl": portrait("salah-ii-suedstahl", "Salah II. Südstahl"),
    "figur-raghild-suedstahl": portrait("raghild-suedstahl", "Raghild Südstahl"),
    "figur-diarmuid-suedstahl": portrait("diarmuid-suedstahl", "Diarmuid Südstahl"),
  },

  contentTargets: {
    courtFounder: "† Salah „Südstahl“ †\n(1651 - 1719)",
    courtHead: "Malak Südstahl\n(1690 - ????)",
    courtDeputy: "Raghan Südstahl\n(1693 - ????)",
    courtCouncilOne: "Freydis Tauwind\n(1692 - ????)",
    courtCouncilTwo: "Astrid Donnerblut\n(1695 - ????)",
    successionOne: "Salah II. Südstahl\n(1722 - ????)",
    courtOfficeTwo: "Raghan Südstahl",
    courtOfficeSix: "Malak Südstahl",
  },

  familyTreeEmbed: {
    src: "../Stammb%C3%A4ume/Stammbaum.html?family=haus-suedstahl&mode=view",
    title: "Stammbaum des Clans Südstahl",
  },

  trivia: [
    "Salah und Gormlaith gründeten den Clan, obwohl keiner von beiden aus Aldrimar stammte.",
    "Die Universität Südstahls verbindet Rechtswissenschaften mit Nautik, Navigation, Seefahrt und Mathematik.",
    "Die südliche Schwertkunst des Clans genießt unter nördlichen Adligen wenig Ansehen, wird innerhalb Südstahls aber bewusst gepflegt.",
  ],
  };
})();
