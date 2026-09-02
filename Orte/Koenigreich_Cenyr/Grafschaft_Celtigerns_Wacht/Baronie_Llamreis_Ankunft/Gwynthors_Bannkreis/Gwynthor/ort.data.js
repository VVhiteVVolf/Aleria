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

  const commonerHouse = (id, name) => house(
    `haus-${id}`,
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
      ortswache: "Cochllamwyr – 400 bis 600 Rotmäntel",
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
          commonerHouse("ysgrif", "Ysgrif")
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
        paragraph("Zur Redaktion gehören Meurig Llwyd für Kriminalität und Berichterstattung, Cadfael Gwatwar für Moral und Gesellschaftskritik, Albrecht von Hohenquell für Klatsch und Skandale, Briallen Chwerthin für Kunst und Kultur sowie Eleri Gwyddor für Geschichte, Heraldik und Naturkunde. Ihre Stimmen reichen von nüchterner Chronik bis zu beißender Satire.")
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
        paragraph("Gwynthor verfügt trotz der schweren Verluste des Krieges gegen Ceitheach über eine bedeutende Streitmacht. Das Haus Draig stellt innerhalb der Stadt ungefähr siebzig Prozent der Ritter, Waffenknechte, Stadtwachen und Rekruten; die übrigen dreißig Prozent werden von seinen Vasallen getragen. Im weiteren Bannkreis gewinnen die Aufgebote der unterstellten Häuser noch stärker an Gewicht."),
        subheading("Die Cochllamwyr"),
        paragraph("Die Cochllamwyr, auch Rotmäntel oder Llamreis Garde genannt, bilden Gwynthors eigene Stadtwache. Ihr Name erinnert an Llamrei, den zweiten Sohn Celtigerns und Begründer der ersten Wache der Stadt. Deren ursprünglicher Kern bestand aus Veteranen des Krieges gegen die Norrnaigh; aus ihren Nachkommen erwuchs die bis heute bestehende Einheit."),
        paragraph("Zwischen 400 und 600 Cochllamwyr sichern Tore, Märkte, Kais und Straßen innerhalb Gwynthors. Die Dorf- und Ortswachen des Hinterlandes gehören ausdrücklich nicht zu dieser Einheit. Ein Cochllamwyr gilt als besonders verlässlicher Waffenknecht, trägt das Rot mit Stolz und erhält für seinen Dienst einen höheren Sold als ein gewöhnlicher Waffenknecht."),
        paragraph("Die Garde untersteht dem Ritterfürsten und während der Vakanz des Amtes dem Baron, dem Grafen und dem gräflichen Marschall."),
        subheading("Hausgarde der Draig"),
        paragraph("Die Hausgarde der Draig wird von Steffan Draig befehligt. Ihre Ritter und Waffenknechte bemannen Castell Draig und weitere Wehranlagen des Hauses. Den größten Teil bilden Fußritter, die Teulu-Ritter und Schwertwaffenknechte. Cantref und Helwyr stellen einen weiteren bedeutenden Anteil, besonders im Umfeld der Flotte; hinzu kommen Lanzenritter, Bogenschützen und die entsprechenden Waffenknechte. Berittene Uchelwyr-Ritter sind zahlenmäßig seltener, bilden jedoch gemeinsam mit berittenen Waffenknechten eine weiterhin beachtliche Truppe.")
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
