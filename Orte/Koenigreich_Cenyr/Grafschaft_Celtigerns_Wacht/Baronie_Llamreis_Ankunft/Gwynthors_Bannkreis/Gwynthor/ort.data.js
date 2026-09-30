(function () {
  "use strict";

  const countyHref = encodeURI("/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht/Grafschaft Celtigerns Wacht.html");
  const mapId = "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis";
  const mapHref = `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  const noticeBoardId = "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-anzeigetafel";
  const noticeBoardHref = `/Anzeigetafeln/tafel.html?tafel=${encodeURIComponent(noticeBoardId)}&ui=single-board-20260902b`;
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder";
  const houseRoot = "/Stammbäume/assets/images/houses/Llamreis Ankunft";
  const commonerRoot = `${houseRoot}/Bürgerliche/Gwynthor`;
  const establishmentAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets/etablissements";
  const militaryAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name,
    rank,
    seat,
    liege,
    emblem: encodeURI(emblem)
  });

  const nobleHouse = (id, name, rank, seat, liege) => house(
    `haus-${id}`,
    `Haus ${name}`,
    rank,
    seat,
    liege,
    `${houseRoot}/haus-${id}.png`
  );

  const commonerHouse = (id, name, familyId = `haus-${id}`) => house(
    familyId,
    `Haus ${name}`,
    "Bürgerliches Haus",
    "Gwynthor",
    "Haus Draig",
    id === "gwyllach" ? `${houseRoot}/haus-gwyllach.png` : `${commonerRoot}/${name}.png`
  );

  const paragraph = (text) => Object.freeze({ type: "paragraph", text });
  const subheading = (text) => Object.freeze({ type: "subheading", text });
  const list = (...items) => Object.freeze({ type: "list", items: Object.freeze(items) });
  const section = (...blocks) => Object.freeze(blocks);

  window.ORT_DATA = Object.freeze({
    meta: Object.freeze({
      id: "gwynthor",
      title: "Gwynthor - Aleria",
      type: "Großstadt",
      status: "Draft",
      template: "grossstadt"
    }),

    name: "Gwynthor",
    militaryView: {
      status: "ready",
      presentationMode: "qualitative",
      title: "Streitkräfte von Gwynthor",
      subtitle: "Unter dem Wyvern · Hausmacht, Vasallen und die Wachen der Stadt",
      heroImage: {
        src: "/AleriaAlmanach/public/assets/draig-leibgarde/steffan-burghof-v1.png",
        alt: "Steffan Draig vor den aufgereihten Leibgardisten im Burghof",
        fit: "contain"
      },
      introduction: "Über Gwynthor weht das Banner der Grafen von Celtigerns Wacht. Doch die Hände, die seine Mauern, Höfe und Wege schützen, leisten unterschiedliche Eide. Neben der Hausmacht der Draigs stehen die Gefolge ihrer Vasallen und die Wachen der Stadt: verbunden durch den Schutz ihrer Heimat, unterschieden durch Auftrag und Befehlsgewalt.",
      forces: [
        {
          id: "draig-hausmacht", name: "Hausmacht der Draigs", kind: "house",
          strengthLabel: "Im persönlichen Dienst des Grafenhauses",
          crest: encodeURI(`${houseRoot}/haus-draig.png`),
          note: "Unter Steffan Draig als Kommandant der Hausmacht dienen Hausritter, professionelle Waffenknechte und niedere Soldaten. Die Leibgarde gehört zu dieser Hausmacht. Burg, Garnisonen und unmittelbar verwaltete Besitzungen sind ihre Wirkungsstätten."
        },
        {
          id: "vasallen", name: "Hausmächte der Vasallen", kind: "vassal",
          strengthLabel: "Eigene Gefolge unter eigenen Herren",
          note: "Gafyr, Saethwyr, Wyrm und weitere Häuser unterhalten Ritter, Waffenknechte und persönliche Garden. Ihre Truppen schützen die jeweiligen Häuser und Lehen und erfüllen deren Dienstpflichten gegenüber den Draigs."
        },
        {
          id: "cochllamwyr", name: "Cochllamwyr", kind: "cityWatch",
          strengthLabel: "Bis zu 600 Mann · ausschließlich Gwynthor Stadt",
          crest: encodeURI("/Stammbäume/assets/images/regions/gwynthor.png"),
          note: "Die städtische Elite gehört nicht zur Draig-Hausmacht. Ihr Dienst gilt der Verteidigung Gwynthors. Die Befehlsgewalt liegt beim Stadtwachenkommandanten beziehungsweise beim Marschall."
        },
        {
          id: "ortswachen", name: "Ortswachen des Bannkreises", kind: "localWatch",
          strengthLabel: "Wachdienst auf Höfen, Straßen und Grenzwegen",
          note: "Die einfachsten und militärisch schwächsten Kräfte dieser Ordnung sichern das Umland. Sie folgen derselben städtischen Befehlskette wie die Cochllamwyr, bleiben aber eine eigene Wache mit anderem Einsatzgebiet."
        }
      ],
      unitsTitle: "Die Wachen Gwynthors",
      unitsSubtitle: "Städtische Elite und Wachdienst im Bannkreis",
      units: [
        {
          id: "cochllamwyr", name: "Cochllamwyr", branch: "Stadtwache · Rotmäntel",
          tier: "Elite der Stadtverteidigung",
          image: { src: `${militaryAssetRoot}/cochllamwyr-v1.png?v=20260930-transparent`, alt: "Cochllamwyr in reich ausgestatteter Rüstung, rotem Mantel und mit Gwynthors Stadtwappen" },
          note: "Tore, Mauern, Märkte, Kais und Straßen innerhalb Gwynthors sind ihr Auftrag. Edlere Rüstung und das stolze Rot der Mäntel zeichnen sie aus; auf ihrem Schild steht das Wappen der Stadt."
        },
        {
          id: "ortswache", name: "Ortswache", branch: "Bannkreis · örtlicher Wachdienst",
          tier: "Einfache Wachtruppe",
          image: { src: `${militaryAssetRoot}/gwynthor-stadtwache.png?v=20260901a`, alt: "Einfacher Ortswächter mit Speer, rotem Mantel und dem Wappen Gwynthors" },
          note: "Abseits der Stadt schützen Ortswachen Bauernhöfe, Straßen und Grenzwege. Ihr Dienst ist weniger angesehen, ihre Ausbildung und Ausrüstung bescheidener als die der Cochllamwyr."
        }
      ],
      sections: [
        {
          title: "Eine Hauptstadt, viele Verpflichtungen",
          paragraphs: [
            "Gwynthor ist Stammsitz der Draigs, Heimat ihrer ansässigen Vasallen und Hauptstadt der Grafschaft Celtigerns Wacht. Der Graf kann diese Lande weder aus einem einzigen Saal regieren noch allein mit seinen eigenen Leuten bewachen. Barone, Ritterfürsten und Ritterherren tragen deshalb einen Teil der Herrschaft und des Schutzes; unter ihnen versehen Waffenknechte, Soldaten und örtliche Wachen ihren Dienst.",
            "Dabei macht der gemeinsame Lehnsherr aus den verschiedenen Gefolgen keine einzige Hausmacht. Ein Ritter der Gafyr dient seinem Haus, ein Draig-Waffenknecht dem Grafenhaus und ein Cochllamwyr der Stadt. Erst ihre jeweiligen Pflichten bestimmen, wer sie führt und wohin sie befohlen werden dürfen."
          ]
        },
        {
          title: "Die Hausmacht unter dem schwarzen Wyvern",
          paragraphs: [
            "Die Hausmacht umfasst sämtliche hauseigenen Streitkräfte der Draigs: Ritter aus der Familie und aus anderen Reihen, professionelle Waffenknechte, die Leibgarde sowie einfachere niedere Soldaten. Steffan Draig steht ihr als Kommandant vor. Milwr bezeichnet dabei den ausgebildeten Waffenknecht, dessen beständiger Waffendienst das Rückgrat des Hauses bildet.",
            "Zweck, Leistung und Eignung entscheiden über den Einsatz. Ein Teil steht als dauerhafte Besatzung in Castell Draig, in Gwynthor, in umliegenden Festungen und auf Besitzungen, welche die Draigs selbst verwalten. Andere versehen den gewöhnlichen Burgdienst. Aus besonders vertrauenswürdigen Waffenknechten und Hausrittern wird die Leibgarde handverlesen: eine persönliche Schutzgarde innerhalb der Hausmacht, keine zusätzliche Armee neben ihr.",
            "Die meist weniger als fünfzig Leibgardisten bewachen den Bergfried und die persönlichen Räume des Hauses, begleiten Schutzbefohlene und sichern Reisen und Ausritte. Ihr besonderer Rang beruht auf Nähe, Zuverlässigkeit und Vertrauen. Im Krieg begleitet ein Teil von ihnen das ranghöchste oder kommandierende Familienmitglied auf das Schlachtfeld."
          ]
        },
        {
          title: "Ritter des Blutes und Ritter des Hauses",
          paragraphs: [
            "Uchelwyr, Helwyr, Teulu, Cantref, Barddwyr und Derwyn finden sich unter den Rittern der Draigs. Diese cenyrischen Klassen beschreiben unterschiedliche Wege ritterlichen Dienstes. Unter ihnen stehen auch die Derwyn, heilige Ritter und Paladine im Zeichen des Grals. Aufgaben und Führungsämter werden einzelnen Rittern anvertraut; sie können die Waffenknechte des Hauses führen.",
            "Die Draigs erziehen ihre eigenen Angehörigen zu Staatsmännern und Rittern. Doch der Weg in ihre Dienste beginnt nicht immer in einer adeligen Wiege. Bürgerliche werden als Knappen aufgenommen und zu Hausrittern ausgebildet. Ihr Ritterschlag bindet sie an das Grafenhaus, ohne sie zu Angehörigen der Familie Draig zu machen.",
            "Mancher Hausritter hofft, durch treuen Dienst eines Tages ein eigenes Ritterhaus zu begründen. Nur wenigen wird dies zuteil – grob einem Zehntel, womöglich noch weniger. Für die meisten bleibt der Dienst unter dem Wyvern die dauerhafte Lebensaufgabe."
          ]
        },
        {
          title: "Die Vasallen und ihre eigenen Banner",
          paragraphs: [
            "Was für die Draigs im Großen gilt, wiederholt sich bei Gafyr, Saethwyr und Wyrm in kleinerem Maßstab. Auch sie besitzen eine Hausmacht und eine persönliche Leibgarde. Ihre Burgen liegen in Gwynthor, doch die Stadt erhält deshalb keine gesonderte Stadtwache für jedes Adelshaus. Alle profitieren vom gemeinsamen städtischen Wachdienst. Für die Grafen ist vor allem bedeutsam, welche hauseigenen Kräfte ihre Vasallen für den Lehnsdienst bereithalten.",
            "Die Gafyr etwa wohnen in ihrer Burg in Gwynthor und verwalten zugleich mehrere Bannkreise im Norden von Llamreis Ankunft. Dort bestehen eigene örtliche Wachen. Das Haus ergänzt deren Schutz nach Lage und Ermessen durch Kräfte seiner Hausmacht. Ein Wohnsitz in der Hauptstadt entbindet einen Lehnsherrn nicht von der Sorge um seine entfernteren Lande."
          ]
        },
        {
          title: "Morddwr als Beispiel der Lehnsordnung",
          paragraphs: [
            "An Morddwr lässt sich das Zusammenspiel auf zwei mögliche Arten erklären: Verwalten die Gafyr den Ort unmittelbar, ohne ihn einer Ritterfamilie anzuvertrauen, steht neben Morddwrs eigener Stadtwache eine nach Bedarf entsandte Besatzung des Hauses Gafyr.",
            "Wäre Morddwr dagegen einem niederen Ritterhaus als Lehen zugewiesen, das den Gafyr dient, müsste dieses Haus seine eigene Hausmacht beisteuern. Gemeinsam mit der örtlichen Stadtwache hätte es für den Ort und dessen Bannkreis zu sorgen. Beide Fälle veranschaulichen die Ordnung; sie legen nicht fest, welcher davon gegenwärtig für Morddwr gilt."
          ]
        },
        {
          title: "Rotmäntel und Ortswachen",
          paragraphs: [
            "Die Cochllamwyr, auch Rotmäntel oder Llamreis Garde genannt, bewahren eine eigene städtische Tradition. Ihr Name erinnert an Llamrei, Celtigerns zweiten Sohn und Begründer der ersten Stadtwache. Aus Veteranen des Krieges gegen die Norrnaigh erwuchs die Einheit, deren Dienst bis heute Gwynthor gilt.",
            "Bis zu sechshundert Mann bilden diese hohe Elite der Stadt. Ihr Auftrag endet bei der Verteidigung Gwynthors selbst; sie sind weder Leibgarde der Draigs noch ein Teil ihrer Hausmacht. Stadtwachenkommandant und Marschall bilden die zuständige städtische Führung.",
            "Jenseits der Stadt versehen Ortswachen den Schutz der Höfe, Straßen und Grenzwege. Sie sind die schwächsten Kräfte innerhalb dieser militärischen Ordnung, gehören aber derselben Befehlskette an. So bleibt der Schutz des Bannkreises mit der Stadt verbunden, ohne seine einfachen Wächter zu Cochllamwyr zu machen."
          ]
        }
      ]
    },
    canonicalPath: "Königreich Cenyr > Grafschaft Celtigerns Wacht > Baronie Llamreis Ankunft > Gwynthors Bannkreis > Gwynthor",

    hierarchy: Object.freeze([
      Object.freeze({ type: "Königreich", name: "Cenyr", slug: "cenyr" }),
      Object.freeze({ type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" }),
      Object.freeze({ type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" }),
      Object.freeze({ type: "Bannkreis", name: "Gwynthors Bannkreis", slug: "gwynthors-bannkreis" }),
      Object.freeze({ type: "Großstadt", name: "Gwynthor", slug: "gwynthor" })
    ]),

    parentage: Object.freeze({
      kingdom: "Cenyr",
      county: "Celtigerns Wacht",
      barony: "Llamreis Ankunft",
      domain: "Celtigerns Wacht",
      region: "Gwynthors Bannkreis",
      settlement: "Gwynthor",
      liege: "Haus Draig"
    }),

    navigation: Object.freeze({
      parentHref: countyHref,
      parentLabel: "Celtigerns Wacht"
    }),

    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Gwynthors Bannkreis",
      name: "Gwynthor",
      "vorherrschender adel": "Haus Draig",
      region2: "Großstadt",
      regierungstyp: "Feudale Stadt- und Grafschaftsverwaltung",
      gewerbe: "Seehandel, Zölle, Handwerk und Versorgung",
      herrschaft: "Celtigerns Wacht",
      lehnsherr: "Haus Draig",
      "bekannte familien": "Draig und die ansässigen Vasallenhäuser",
      stände: "Adel, Klerus, Bürgertum, Handwerk und einfache Bevölkerung",
      einwohnerzahl: "Etwa 30.000",
      ritter: "Haus Draig und Vasallen",
      waffenknechte: "Haus Draig und Vasallen",
      ortswache: "Cochllamwyr – bis zu 600 Rotmäntel; Ortswachen im Bannkreis",
      flotte: "Cantref und Helwyr",
      "sonstiges aufgebot": "Städtische Rekruten und Lehnsaufgebote",
      bedrohungen: "Schwarze Zitteraale, Piraterie, Sirenen und Ungeheuer",
      ressourcen: "Handel, Zölle, Holz, Erz, Glas, Fisch und Agrargüter"
    }),

    presentation: Object.freeze({
      motto: "…",
      heraldry: encodeURI("/Stammbäume/assets/images/regions/gwynthor.png"),
      banner: encodeURI("/Stammbäume/assets/images/regions/celtigerns-wacht.png"),
      map: mapHref,
      images: Object.freeze({
        "icon-png": encodeURI("/Stammbäume/assets/images/regions/gwynthor.png"),
        "supporter-left-png": Object.freeze({
          src: encodeURI("/Stammbäume/assets/images/sigilsupporter/WappensupporterCeltigernswacht.png"),
          alt: "Wappenhalter von Gwynthor",
          fit: "contain"
        }),
        "supporter-right-png": Object.freeze({
          src: encodeURI("/Stammbäume/assets/images/sigilsupporter/WappensupporterCeltigernswacht.png"),
          alt: "Wappenhalter von Gwynthor",
          fit: "contain"
        }),
        "wappen-banner-png": encodeURI("/Stammbäume/assets/images/regions/celtigerns-wacht.png"),
        "karten-bild-png": Object.freeze({
          src: `${mapAssetRoot}/GwynthorBannkreis.png?v=20260901b`,
          alt: "Karte von Gwynthor und seinem Bannkreis",
          href: mapHref,
          fit: "contain"
        }),
        "stadtsektionen-png": Object.freeze({
          src: `${mapAssetRoot}/GwynthorBannkreisZonen.png?v=20260901b`,
          alt: "Bezirke von Gwynthor",
          href: mapHref,
          fit: "contain"
        }),
        "bild-einer-stadtwache-png": Object.freeze({
          src: "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/assets/gwynthor-stadtwache.png?v=20260901a",
          alt: "Stadtwache von Gwynthor",
          fit: "contain"
        }),
        "zeitung-png": Object.freeze({
          src: "/Zeitungen/data/schwarzbote-gwynthor/assets/schwarzbote-gwynthor.png?v=20260901a",
          alt: "Der Schwarzbote – Ausgabe Gwynthor",
          href: "/Zeitungen/zeitung.html?zeitung=schwarzbote-gwynthor",
          fit: "contain"
        })
      })
    }),

    features: Object.freeze({
      noticeBoard: true,
      districts: true,
      personalitiesCollapsed: true
    }),

    noticeBoardMap: Object.freeze({
      mapId: noticeBoardId,
      title: "Gwynthors Anzeigetafel",
      embedHref: noticeBoardHref,
      fullHref: noticeBoardHref
    }),

    regionMap: Object.freeze({
      mapId,
      title: "Gwynthor – Bannkreis",
      embedHref: mapHref,
      fullHref: mapHref,
      pois: Object.freeze([])
    }),

    houses: Object.freeze([
      Object.freeze({
        title: "Grafenhaus",
        items: Object.freeze([
          nobleHouse("draig", "Draig", "Grafenhaus", "Gwynthor", "…")
        ])
      }),
      Object.freeze({
        title: "Ritterfürstenhäuser",
        items: Object.freeze([
          nobleHouse("gafyr", "Gafyr", "Ritterfürstenhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("wyrm", "Wyrm", "Ritterfürstenhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("saethwyr", "Saethwyr", "Ritterfürstenhaus", "Gwynthor", "Haus Draig")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          nobleHouse("tlawd", "Tlawd", "Ritterhaus", "Gwynthor", "Haus Gafyr"),
          nobleHouse("rhyddid", "Rhyddid", "Ritterhaus", "Gwynthor, Mwyncraig", "Haus Wyrm"),
          nobleHouse("gelyn", "Gelyn", "Ritterhaus", "Gwynthor, Gwynthstorm", "Haus Draig"),
          nobleHouse("cludwyr", "Cludwyr", "Ritterhaus", "Gwynthor, Bronhir", "Haus Wyrm"),
          nobleHouse("chwedlonol", "Chwedlonol", "Ritterhaus", "Gwynthor, Glastraeth", "Haus Saethwyr"),
          nobleHouse("balchder", "Balchder", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("eneiniog", "Eneiniog", "Ritterhaus", "Gwynthor", "Haus Saethwyr"),
          nobleHouse("gostyn", "Gostyn", "Ritterhaus", "Gwynthor, Bronfelen", "Haus Gafyr"),
          nobleHouse("awenydd", "Awenydd", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("awenor", "Awenor", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("loer", "Loer", "Ritterhaus", "Gwynthor, Craithglyn", "Haus Wyrm"),
          nobleHouse("bleiddorn", "Bleiddorn", "Ritterhaus", "Gwynthor", "Haus Draig"),
          nobleHouse("dubhan-gwynthor", "Dubhan-Gwynthor", "Ritterhaus", "Gwynthor", "Haus Draig")
        ])
      }),
      Object.freeze({
        title: "Bürgerliche Häuser",
        items: Object.freeze([
          commonerHouse("gwyllach", "Gwyllach"),
          commonerHouse("draenmelyn", "Draenmelyn"),
          commonerHouse("pendrwn", "Pendrwn"),
          commonerHouse("swyll", "Swyll"),
          commonerHouse("aelmor", "Aelmor"),
          commonerHouse("maerllys", "Maerllys"),
          commonerHouse("braglas", "Braglas"),
          commonerHouse("tonnarth", "Tonnarth"),
          commonerHouse("ysgrif", "Ysgrif"),
          commonerHouse("falchdyn", "Falchdyn"),
          commonerHouse("coeddu", "Coeddu"),
          commonerHouse("craigddu", "Craigddu", "craigddu")
        ])
      })
    ]),

    merchants: Object.freeze([
      Object.freeze({
        name: "Celtigerns Letzte Rast",
        image: `${establishmentAssetRoot}/celtigerns-letzte-rast.png`,
        symbolAlt: "Celtigerns Letzte Rast",
        trade: "Taverne & Gasthaus",
        owner: "Brenn Vann",
        wealth: "Gehoben",
        reputation: "Legendär",
        influence: "Cenyrweit",
        description: "Älteste Taverne Gwynthors, größtes Gasthaus der Stadt und seit über vierhundert Jahren im Besitz der Familie Vann."
      }),
      Object.freeze({
        name: "Die Lachende Nixe",
        image: `${establishmentAssetRoot}/lachende-nixe.png`,
        symbolAlt: "Die Lachende Nixe",
        trade: "Freudenhaus & Salons",
        owner: "Albrecht Sonnenfels",
        wealth: "Sehr hoch",
        reputation: "Stadtbekannt",
        influence: "Stadtweit",
        description: "Luxuriöses Haus an den südlichen Docks mit privaten Salons, mehr als zehn Zimmern und einem Ruf für Diskretion."
      }),
      Object.freeze({
        name: "Die Krumme Kanne",
        image: `${establishmentAssetRoot}/krumme-kanne.png`,
        symbolAlt: "Die Krumme Kanne",
        trade: "Veteranenschänke",
        owner: "Aedan, Hrolf & Merrik",
        wealth: "Solide",
        reputation: "Angesehen",
        influence: "Osttor & Hafen",
        description: "Neutraler Treffpunkt für Veteranen, Söldner und Reisende zwischen Osttorbezirk und Hafenviertel."
      })
    ]),

    sections: Object.freeze({
      introduction: section(
        paragraph("Gwynthor ist die Hauptstadt der Grafschaft Celtigerns Wacht und mit etwa 30.000 Einwohnern eine der größten Städte Cenyrs. Zwischen der südlichen Küste, den verzweigten Flussarmen und dem Gebirge im Nordwesten verbindet sie den Sitz des Hauses Draig mit dem wichtigsten Handelshafen des Königreichs."),
        paragraph("In ihren Mauern laufen gräfliche Verwaltung, Ritteradel, Handwerk, Schifffahrt und Fernhandel zusammen. Alte albische Bauten stehen neben jüngeren cenyrischen Vierteln; über allem wacht der Drachenhort, während sich die Stadt vom Berg bis an die Kais und weit vor ihre jüngeren Tore erstreckt.")
      ),

      background: section(
        paragraph("In der Antike trug Gwynthor den Namen Áinmardh. Von Dún Áinmardh aus herrschten die Ui Talamh über das Fürstentum Oseneach und bewahrten lange den Frieden an der südlichen Küste. Mit der Epoche der Seefahrer endete diese Zeit: Norrnaigh-Alben unterwarfen eine Herrschaft nach der anderen und drangen bis vor Áinmardh vor."),
        paragraph("Erst die Ankunft der Avallornir aus dem fernen Avallorn wendete den Untergang ab. Gemeinsam mit den überlebenden Crannath-Alben trieben sie die Norrnaigh zurück ins Meer. Doch der Sieg hatte den alten Adel nahezu ausgelöscht; selbst vom Fürstenhaus Ui Talamh blieben zuletzt nur seine Töchter."),
        paragraph("Der avallornische Befreier Celtigern heiratete eine der letzten Prinzessinnen. Aus dieser Verbindung erwuchsen die Legitimität des späteren Hauses Draig und die Grafschaft Celtigerns Wacht. Während Crannath und Avallornir in der neuen Kultur der Cenyrer aufgingen, verblasste auch der Name Áinmardh. An seine Stelle trat Gwynthor.")
      ),

      location: section(
        paragraph("Gwynthor liegt nahezu im geographischen Zentrum der südlichen Küste Celtigerns Wachts. Die Stadt reicht von ihren Hafenanlagen am Meer über die von Flussarmen gegliederten Viertel bis zum Gebirgsfuß und dem Drachenhort im Nordwesten."),
        paragraph("Der Bannkreis umfasst das unmittelbar versorgende Umland in einem Radius von ungefähr fünfzehn Kilometern um die Stadt. Straßen, Brücken und Wasserwege verbinden die Tore mit Gehöften, Wäldern, Weiden und den Küstenplätzen der Umgebung.")
      ),

      administration: section(
        paragraph("Gwynthor ist zugleich Stadt, gräflicher Hauptsitz und Mittelpunkt einer feudalen Herrschaftsordnung. An ihrer Spitze steht Graf Galahad Draig als Herr über Celtigerns Wacht. Ihm folgt Baron Meurig Draig, der als sein Onkel die Baronie um Gwynthor verantwortet. Der Titel des Ritterfürsten, dem Stadt und unmittelbares Umland anvertraut wären, gilt derzeit als vakant."),
        paragraph("Unabhängig von dieser Aufteilung liegt der Hofstaat des Grafen in Gwynthor. Hier laufen die Ämter der Grafschaft zusammen: vom Kämmerer und Marschall über Gericht, Zoll und Schreiberstuben bis zu den Verwaltern der einzelnen Viertel und Lehen."),
        paragraph("Die Ordnung bildet eine breite Lehenspyramide. Hofmeier, Dorf- und Viertelwachen, Zöllner, Amtleute und ritterliche Vasallen reichen ihre Pflichten stufenweise bis an die gräflichen Ämter weiter.")
      ),

      conflicts: section(
        subheading("Die Schwarzen Zitteraale"),
        paragraph("Seit etwa fünfzehn Jahren heimsuchen die Schwarzen Zitteraale Celtigerns Wacht. Die Raubritterbande ging aus Deserteuren, ehemaligen Kriegern und gescheiterten Knappen des im Krieg gegen Ceitheach vernichteten Hauses Illysywen hervor. Ihre Mitglieder überfallen Reisende und Karawanen, erpressen Gehöfte und legen Brände, bevor sie wieder unter Bauern, Söldnern oder Wanderhandwerkern verschwinden."),
        paragraph("Ihre Ortskenntnis und der gezielte Terror gegen die Landbevölkerung machen sie schwer greifbar. Niemand kennt das bestätigte Gesicht oder den Aufenthaltsort ihres Anführers, der nur als der Schwarze Zitteraal bekannt ist. Selbst Jahre der Fahndung haben die Bande nicht vollständig zerschlagen."),
        subheading("Die Wunden des Großen Krieges"),
        paragraph("Der Krieg gegen Ceitheach endete vor zwanzig Jahren, doch seine Verluste prägen Gwynthor noch immer. Rund vierzig Prozent des cenyrischen Militärs fielen; mit ihnen starben Bauern, Handwerker, Ritter und Angehörige des Adels. Celtigerns Wacht trug einen großen Anteil der Kriegsbemühungen und erholt sich nur langsam von den Lücken in Heer, Wirtschaft und Bevölkerung. Jenseits der Grenze liegt das ehemalige Nachbarland heute unter dem Dunkelhain."),
        subheading("Küste und Gebirge"),
        paragraph("Piraterie bedroht die weiten Küstenwege und die Schifffahrt. Im Meer werden Sirenen gefürchtet – vampirische Ungeheuer, die sich als Meerjungfrauen tarnen. Harpyien, Trolle, Wölfe und Warge dringen gelegentlich aus Bergen und Wäldern vor; auch Berichte über Untote und ruhelose Geister verstummen nie ganz.")
      ),

      history: section(
        paragraph("Das alte Áinmardh bestand aus zwei voneinander getrennten Kernen: der Fürstenburg der Crannath am Gebirge und einer wachsenden Hafenstätte an der Küste. Erst unter cenyrischer Herrschaft wurde der freie Raum zwischen beiden besiedelt, bis Burg, Stadt und Hafen zu einem zusammenhängenden Gwynthor verwuchsen."),
        paragraph("Bauprojekte lenkten die Flussläufe, schufen neue Übergänge und schützten die ersten Viertel zunächst mit Palisaden. Mit wachsendem Wohlstand folgte die steinerne Stadtmauer. Zu den ältesten Teilen zählen der Drachenhort, das Westtor, die Innenstadt, der Westhafen, die Altstadt und der spätere Hafendistrikt."),
        paragraph("Jünger sind die großen Bezirke am Ost-, Süd- und Nordtor. In jüngster Zeit griff Gwynthor erneut über seine Befestigungen hinaus: Vor den westlichen Mauern entstand die Gwynthorer Vorstadt.")
      ),

      population: section(
        paragraph("Die große Mehrheit der Einwohner versteht sich als cenyrisch. Als Hauptstadt zieht Gwynthor besonders viele Angehörige des Adels, wohlhabende Kaufleute, Gelehrte und Handwerksmeister an. Die ärmere Bevölkerung lebt vor allem in einfachen Hafen- und Randvierteln oder im Hinterland des Bannkreises."),
        paragraph("Eine sichtbare Minderheit bilden Alben, darunter Flüchtlinge aus Ceitheach, die vor zwanzig Jahren in die Grafschaft kamen. Wohlhabendere Familien ließen sich häufig in Gwynthor nieder, andere zogen weiter ins Umland. Viele alte Familien albischer Abstammung betrachten sich längst selbst als Cenyrer; im Königreich insgesamt liegt der albische Bevölkerungsanteil bei ungefähr sieben bis acht Prozent."),
        paragraph("Etwa drei Prozent der Stadtbevölkerung sind Aldrimarer, die vor allem wegen Arbeit und Söldnerdiensten aus dem Nachbarland kommen. Das verbleibende knappe Prozent bilden Fernhändler und Reisende, unter anderem aus Venalys und Lothir. Auch die Flüchtlinge des untergegangenen Vennyr werden aufgrund gemeinsamer Kultur und Herkunft gewöhnlich zu den Cenyrern gezählt.")
      ),

      newspaper: section(
        paragraph("Der Schwarzbote ist das meistgelesene Blatt der Grafschaft. Von Gwynthor aus berichtet er über Verbrechen, Politik, Heraldik, Religion, Hofskandale, Kunst und Kultur. Herausgeber und Chefredaktor Bors Brwyn führt die Zeitung mit ausgeprägtem Geschäftssinn und einem sicheren Gespür dafür, welche Nachricht die Stadt am nächsten Morgen beschäftigen wird."),
        paragraph("Zur Redaktion gehören Meurig Llwyd für Kriminalität und Berichterstattung, Cadfael Gwatwar für Moral und Gesellschaftskritik, Albrecht von Hohenquell für Klatsch und Skandale, Briallen Chwerthin für Kunst und Kultur sowie Eleri Gwyddor für Geschichte, Heraldik und Naturkunde. Ihre Stimmen reichen von nüchterner Chronik bis zu beißender Satire."),
        paragraph("Daneben gibt Haus Falchdyn das volksnahe Celtigerns Echo heraus. Seine Hauptredaktion und Schreiberschule liegen in Gwynthor; kleinere Redaktionsstuben an den größeren Orten der Grafschaft sammeln Anliegen und lokale Berichte. Das Blatt meidet Klatsch als Selbstzweck und gibt bevorzugt jenen kleinen Geschichten Raum, die für Nachbarschaften, Handwerker und Reisende unmittelbar zählen."),
        paragraph("Aneirin Falchdyn hält die Gwynthorer Redaktion zusammen, während drei Generationen des Hauses ihre eigenen Blickwinkel beisteuern. Ceredig berichtet aus Gwynthors Bannkreis, Branwen zieht als freche Nachwuchsreporterin durch die Straßen und Taliesin beantwortet die großen Gesten der Mächtigen mit Karikatur und Satire. Neben den dreizehn derzeit sichtbaren Redaktionsmitgliedern bleiben vier Autorenstellen ausdrücklich frei."),
        paragraph("Der cenyrweite Kronenspiegel besitzt in Gwynthor ein Druck- und Korrespondenzhaus. Dort werden große Entwicklungen aus Celtigerns Wacht geprüft und an die Hauptredaktion des Hauses Pengair in Mathragon übermittelt; die anschließend gedruckte Ausgabe bleibt mit allen anderen Standorten des Königreichs identisch."),
        paragraph("Ausschließlich für die feine und weniger feine Gesellschaft der Grafenstadt erscheint außerdem Der Flüsterfächer. Unter dem Motto „Samt & Sünde“ berichtet seine eigenständige Gwynthorer Lokalredaktion über Salons, Mode, Luxus, Nachtleben, diskrete Beziehungen und gesellschaftliche Lieblinge. Der ferne Hauptsitz in der Blutstadt wahrt nur Namen und Stil des Magazins; Themen, Zeichnungen und Urteile entstehen vollständig vor Ort.")
      ),

      region: section(
        paragraph("Der Bannkreis reicht ungefähr fünfzehn Kilometer um Gwynthor. Im Süden öffnet er sich zum Meer und den Hafenwegen; nach Nordwesten steigen Wald und Gelände zum Gebirge an. Dazwischen liegen Äcker, Weiden, Gehöfte und kleinere Ansiedlungen, die über ein dichtes Netz aus Straßen, Flussübergängen und Brücken mit der Stadt verbunden sind."),
        paragraph("Die einzelnen Orte und Gefahrenpunkte werden mit den Markierungen der Regionskarte ergänzt, sobald sie dort verzeichnet sind.")
      ),

      culture: section(
        paragraph("Gwynthor ist an Wohlstand, Besucher und den Austausch fremder Waren gewöhnt. Musik, Dichtung, bildende Kunst und öffentliche Unterhaltung besitzen einen festen Platz im städtischen Leben. Adelshöfe, Tempel, Schenken und Marktplätze tragen jeweils ihre eigenen Formen von Fest, Vortrag und Aufführung."),
        paragraph("Seinen besonderen Charakter verdankt Gwynthor dem Handel. Weil das Gebirge die großen Routen durch den Norden erschwert, führt ein bedeutender Teil des cenyrischen Fernhandels über den Hafen der Stadt. Kaufleute aus nahen und fernen Ländern prägen damit nicht nur die Märkte, sondern auch Mode, Küche, Sprache und Umgangsformen.")
      ),

      districts: section(
        paragraph("Die heutige Stadt gliedert sich in zehn deutlich gewachsene Bezirke. Ihre Grenzen folgen Flussarmen, alten Mauern, Toren und Hafenbecken und lassen die einzelnen Bauphasen Gwynthors bis heute erkennen."),
        list(
          "Drachenhort-Distrikt",
          "Gwynthor Nordtor",
          "Gwynthor Osttor",
          "Gwynthor Südtor",
          "Gwynthor Altstadt",
          "Gwynthor Hafendistrikt",
          "Gwynthor Westhafen",
          "Gwynthor Innenstadt",
          "Gwynthor Westtor",
          "Gwynthor Vorstadt"
        )
      ),

      builtEnvironment: section(
        paragraph("Gwynthors Baukunst verbindet den reichlich verfügbaren Stein des nahen Gebirges mit den wertvollen Hölzern der Grafschaft. Die jüngere Innenstadt zeigt breite, planvollere Straßenzüge und repräsentative cenyrische Fassaden, während die Altstadt noch zahlreiche albische Grundmauern, Höfe und Bauformen bewahrt."),
        paragraph("Zu den eindrucksvollsten Bauwerken gehört die große Kathedrale. Daneben steht ein umgebautes Heiligtum aus antiker Zeit, das als zweitgrößtes religiöses Bauwerk der Stadt noch immer an Áinmardh und die Crannath erinnert.")
      ),

      military: section(
        paragraph("Gwynthors Schutz ruht auf mehreren eigenständigen Kräften: der Hausmacht der Draigs, den Hausmächten ihrer Vasallen sowie der Stadtwache und den Ortswachen des Bannkreises. Die Draigs herrschen als Grafen über Celtigerns Wacht; Barone, Ritterfürsten und Ritterherren tragen Verantwortung für die ihnen anvertrauten Lehen. Ihre persönlichen Gefolge und die allgemeinen Wachen bleiben nach Aufgabe und Befehlsgewalt voneinander getrennt."),
        subheading("Die Cochllamwyr"),
        paragraph("Die Cochllamwyr, auch Rotmäntel oder Llamreis Garde genannt, bilden Gwynthors eigene Stadtwache. Ihr Name erinnert an Llamrei, den zweiten Sohn Celtigerns und Begründer der ersten Wache der Stadt. Deren ursprünglicher Kern bestand aus Veteranen des Krieges gegen die Norrnaigh; aus ihren Nachkommen erwuchs die bis heute bestehende Einheit."),
        paragraph("Bis zu 600 Cochllamwyr sichern Tore, Märkte, Kais und Straßen innerhalb Gwynthors. Sie bilden die städtische Elite und dienen ausschließlich der Verteidigung der Stadt. Sie gehören nicht zur Hausmacht der Draigs, sondern unterstehen dem Stadtwachenkommandanten beziehungsweise dem Marschall."),
        subheading("Ortswachen des Bannkreises"),
        paragraph("Die einfacheren Ortswachen sichern Bauernhöfe, Straßen und Grenzwege im Umland. Sie stehen unter derselben städtischen Befehlsgewalt, gehören aber nicht zu den Cochllamwyr."),
        subheading("Hausmacht der Draigs und ihrer Vasallen"),
        paragraph("Steffan Draig führt die Hausmacht des Grafenhauses: Ritter der Klassen Uchelwyr, Helwyr, Teulu, Cantref, Barddwyr und Derwyn, professionelle Milwr-Waffenknechte sowie niedere Soldaten. Ihre Kräfte stehen in Castell Draig, in Gwynthor und auf unmittelbar verwalteten Besitzungen. Die handverlesene Leibgarde ist ein Teil dieser Hausmacht. Die Vasallen unterhalten eigene kleinere Hausmächte und Garden; der gemeinsame städtische Wachdienst schützt alle ansässigen Häuser.")
      ),

      economy: section(
        paragraph("Gwynthors größte wirtschaftliche Stärke ist nicht ein einzelnes Erzeugnis, sondern der Handel selbst. Der Hafen ist das wichtigste Einfallstor für Waren, die aus dem Ausland bis in die entlegensten Teile Cenyrs gelangen sollen. Zölle, Lagerung, Umschlag, Weitertransport und Versorgung machen die Stadt wohlhabend."),
        paragraph("Das Umland liefert dennoch vieles, was eine Großstadt benötigt: Holz, Eisenerz, Wild, Glas, Fisch und Bier ebenso wie Rinder, Schafe, Ziegen, Schlachtrösser, Getreide und Gemüse. Handwerk und Verarbeitung profitieren unmittelbar von den Rohstoffen und dem beständigen Strom fremder Güter."),
        paragraph("Der Reichtum Gwynthors ruht damit auf drei Säulen: den Zöllen des Hafens und der Straßen, dem Handel mit dem Ausland und den Bodenschätzen sowie Erzeugnissen des Hinterlandes.")
      ),

      trivia: section(
        list(
          "Der antike Name der Stadt lautet Áinmardh; die alte Fürstenburg wurde Dún Áinmardh genannt.",
          "Gwynthor wuchs aus einer Bergfestung und einer ursprünglich getrennten Hafenstätte zusammen.",
          "Mit etwa 30.000 Einwohnern zählt Gwynthor zu den größten Städten Cenyrs."
        )
      )
    })
  });
})();
