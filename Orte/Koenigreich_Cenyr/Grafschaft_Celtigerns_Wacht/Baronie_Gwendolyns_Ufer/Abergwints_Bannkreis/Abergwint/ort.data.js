(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const cityMapId = "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint-stadtkarte";
  const regionMapId = "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint-bannkreis";
  const cityMapHref = mapHref(cityMapId);
  const regionMapHref = mapHref(regionMapId);
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/gwendolyns-ufer/abergwint-bannkreis";
  const placeAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Gwendolyns_Ufer/Abergwints_Bannkreis/Abergwint/assets";
  const newspaperHref = "/Zeitungen/zeitung.html?zeitung=schwarzbote-abergwint";
  const supporter = `${placeAssetRoot}/abergwint-supporter.png`;
  const houseAssetRoot = "/Stammbäume/assets/images/houses/Gwendolyns Ufer";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name: `Haus ${name}`,
    rank,
    seat,
    liege: `Haus ${liege}`,
    emblem: encodeURI(`${houseAssetRoot}/${emblem}`)
  });
  const paragraph = (text) => Object.freeze({ type: "paragraph", text });
  const subheading = (text) => Object.freeze({ type: "subheading", text });
  const list = (...items) => Object.freeze({ type: "list", items: Object.freeze(items) });
  const section = (...blocks) => Object.freeze(blocks);

  const base = createPlaceData("abergwint", {
    meta: {
      title: "Abergwint - Aleria"
    },
    parentage: {
      barony: "Gwendolyns Ufer",
      region: "Abergwint – Bannkreis"
    },
    features: {
      districts: true,
      noticeBoard: true,
      personalitiesCollapsed: true
    },
    presentation: {
      map: cityMapHref,
      images: {
        "supporter-left-png": {
          src: supporter,
          alt: "Wappenhalter von Abergwint",
          fit: "contain"
        },
        "supporter-right-png": {
          src: supporter,
          alt: "Wappenhalter von Abergwint",
          fit: "contain"
        },
        "karten-bild-png": {
          src: `${mapAssetRoot}/abergwint/Kartenbilder/AbergwintStadt.webp`,
          alt: "Stadtkarte von Abergwint",
          href: cityMapHref,
          fit: "contain"
        },
        "stadtsektionen-png": {
          src: `${mapAssetRoot}/Kartenbilder/AbergwintBannkreisZonen.webp`,
          alt: "Zonen von Abergwint und seinem Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "bild-einer-stadtwache-png": {
          src: `${placeAssetRoot}/abergwint-stadtwache.png`,
          alt: "Stadtwache von Abergwint",
          fit: "contain"
        },
        "zeitung-png": {
          src: "/Zeitungen/data/schwarzbote-abergwint/assets/schwarzbote-abergwint.png",
          alt: "Der Schwarzbote – Ausgabe Abergwint",
          href: newspaperHref,
          fit: "contain"
        }
      }
    },
    sections: {
      introduction: section(
        paragraph("Abergwint ist der Sitz des Hauses Gwyvern und mit etwa 20.000 Einwohnern die zweitgrößte Stadt der Grafschaft Celtigerns Wacht. An der westlichen Küste gelegen, beherrscht die Hafenstadt die Mündung eines Flusses und verbindet die Seewege mit den Straßen in das Innere Gwendolyns Ufers."),
        paragraph("Flussarme durchziehen das Stadtgebiet und teilen Abergwint in vier größere Sektionen. Brücken, Kais und befestigte Übergänge halten diese Teile zusammen; acht gewachsene Viertel ordnen das Leben zwischen Hafen, Burg, Toren und Innenstadt.")
      ),

      background: section(
        paragraph("Abergwint entstand nicht aus einer einzigen Gründung, sondern aus drei aufeinanderfolgenden Gestalten derselben Siedlung: der crannath-albischen Inselfestung Dún Inbhirgáeth, der avallornischen Hafenstadt Caer Gwynt und schließlich dem cenyrischen Abergwint."),
        paragraph("Die Lage an Flussmündung und Küste bestimmte jede dieser Epochen. Was zunächst ein befestigter Flottenstützpunkt war, wurde zum Hafen, zum Herrschaftssitz der Gwyvern und schließlich zum wichtigsten westlichen Seezugang Celtigerns Wacht.")
      ),

      location: section(
        paragraph("Abergwint liegt unmittelbar an der westlichen Küste Gwendolyns Ufers. Der Fluss erreicht hier in mehreren Armen das Meer und bildet natürliche Grenzen um die vier großen Stadtsektionen. Die ältesten befestigten Bereiche liegen an den schmalen Übergängen und auf den ehemaligen Inseln der Mündung."),
        paragraph("Nördlich und östlich schließen Wälder, Höfe und offene Weideflächen an. Im Südosten steigt das Land in eine breite Hügellandschaft an, die von vielen Reisenden gemieden und von den wichtigeren Straßen umgangen wird.")
      ),

      administration: section(
        paragraph("Abergwint wird als Hauptstadt der Baronie unmittelbar vom Haus Gwyvern geprägt. Baronialer Hof und Stadtverwaltung sind eng miteinander verbunden; die bedeutenden Ämter der Baronie haben hier ihren Sitz oder unterhalten eigene Kanzleien."),
        paragraph("Die laufende Ordnung verteilt sich auf Hafen- und Zollverwaltung, Marktaufsicht, Gerichtsbarkeit, Brücken und Tore, Werften, Vorratshäuser sowie die Stadtwache. Die acht Viertel besitzen eigene Ansprechpartner und Aufseher, bleiben jedoch der gemeinsamen Verwaltung Abergwints unterstellt.")
      ),

      conflicts: section(
        paragraph("Abergwints beständige Konflikte entstehen weniger am Hof als in Häfen, Lagerhäusern und Hinterzimmern. Das Syndikat, Schmuggler und kleinere Banden versuchen immer wieder, Zölle, Warenströme oder ganze Anlegeplätze unter ihre Kontrolle zu bringen."),
        paragraph("Auch angesehene Gilden übervorteilen einander, werben Arbeitskräfte ab oder nutzen ihre Verbindungen, um Konkurrenten bei Aufträgen und Lieferungen auszustechen. Diese Auseinandersetzungen reichen von stiller Bestechung bis zu offenem Druck auf Händler und Hafenarbeiter."),
        paragraph("Der Adel der Baronie arbeitet dagegen vergleichsweise geschlossen zusammen. Spannungen mit Flüchtlingen oder den zahlreichen Minderheiten der Hafenstadt bestimmen das öffentliche Leben nicht in nennenswertem Maß.")
      ),

      history: section(
        subheading("Dún Inbhirgáeth"),
        paragraph("In der Zeit der Crannath-Alben erhob sich an der Flussmündung Dún Inbhirgáeth, die Burg an der Windmündung. Die Inselfestung sicherte den Zugang vom Meer und entwickelte sich zu einem befestigten Flottenstützpunkt."),
        subheading("Caer Gwynt"),
        paragraph("Mit der frühen Besiedlung durch die Avallornier wuchsen Anlegestellen, Werkstätten und Wohnhäuser um die alte Festung. Aus dem Stützpunkt wurde eine kleine Hafenstadt, die den Namen Caer Gwynt trug."),
        subheading("Abergwint"),
        paragraph("Als das Haus Draig die Baronie Gwendolyns Ufer begründete, entsandte es einen Spross an die Westküste, der von Caer Gwynt aus über die neue Herrschaft gebieten sollte. Aus dieser Linie ging das Haus Gwyvern hervor. Unter seiner Herrschaft wuchs Caer Gwynt zu einer bedeutenden Hafenstadt; im Lauf der cenyrischen Zeit setzte sich schließlich der Name Abergwint durch.")
      ),

      population: section(
        paragraph("In Abergwint leben etwa 20.000 Menschen. Die Mehrheit bilden Cenyri aus Stadt und Umland: Seeleute, Fischer, Hafenarbeiter, Handwerker, Händler, Bedienstete, Soldaten und Angehörige der zahlreichen Häuser der Baronie."),
        paragraph("Wie Gwynthor zieht auch Abergwint Menschen aus vielen Teilen Cenyrs und aus fremden Ländern an. Der Anteil der Aldrimarer ist deutlich geringer als in Gwynthor; dafür prägen kleinere Gemeinschaften aus vielen Küstenregionen und Ländern das Hafenbild. Durch den täglichen Schiffsverkehr ist sprachliche und kulturelle Vielfalt ein gewöhnlicher Teil des Stadtlebens.")
      ),

      region: section(
        paragraph("Das Umland Abergwints besteht aus zahlreichen Höfen, Weiden und ausgedehnten Waldflächen. Sie versorgen die Stadt mit Holz, Vieh und landwirtschaftlichen Erzeugnissen und sind über Straßen und Flussübergänge mit den Märkten und Kais verbunden."),
        paragraph("Im Südosten erstreckt sich eine breite Hügellandschaft. Sie wird trotz ihrer Nähe zur Stadt häufig gemieden; Wege und Transporte halten sich bevorzugt an die flacheren Routen entlang von Küste, Fluss und Waldrändern.")
      ),

      culture: section(
        paragraph("Abergwints Kultur ist vom Handel und vom Meer geprägt. Nachrichten, Waren und Bräuche erreichen die Stadt mit jedem einlaufenden Schiff. Seefahrt, Schiffbau und die Erfahrung langer Reisen besitzen daher hohes Ansehen."),
        paragraph("Kunst und Musik finden ein großes Publikum in Hafenschenken, auf Märkten und an den Höfen der ansässigen Häuser. Außerhalb der Mauern und Uferbefestigungen gehört die Jagd zu den beliebten Beschäftigungen von Adel und wohlhabendem Bürgertum.")
      ),

      districts: section(
        paragraph("Die acht Viertel folgen den Flussarmen, Toren und Hafenbecken. Ihre gebräuchlichen Namen beschreiben vor allem Lage und Aufgabe:"),
        list(
          "Hafenviertel Nord",
          "Nordtorviertel",
          "Altstadt",
          "Gwyvernviertel",
          "Marineviertel",
          "Innenstadt und Südtor",
          "Osttorviertel",
          "Hafenviertel Süd"
        ),
        paragraph("Brücken verbinden die Viertel miteinander, während Tore und Kais den Verkehr aus Umland und See in die jeweiligen Stadtteile leiten.")
      ),

      builtEnvironment: section(
        paragraph("Abergwints Altstadt ist klein und konzentriert sich auf die ältesten Übergänge um die frühere Inselfestung. Dort stehen die engsten Gassen und die ältesten steinernen Bauten der Stadt."),
        paragraph("Der weitaus größere Teil Abergwints entstand unter cenyrischer Herrschaft. Breitere Straßen, planmäßigere Wohnviertel, Werften, Speicher und befestigte Hafenanlagen bestimmen das Stadtbild. Abergwint erreicht nicht die Größe und monumentale Wirkung Gwynthors, ist mit rund 20.000 Einwohnern jedoch die zweitgrößte Stadt Celtigerns Wacht.")
      ),

      military: section(
        paragraph("Abergwints Verteidigung folgt demselben feudalen Grundsatz wie in Gwynthor: Das herrschende Haus stellt den Kern der bewaffneten Kräfte, während die unterstellten Ritterhäuser eigene Ritter und Waffenknechte zum Aufgebot beitragen. Durch die Küstenlage besitzen Hafen, Flotte und Marineanlagen besonderes Gewicht."),
        subheading("Die Gwendolwyr"),
        paragraph("Die Stadtwache Abergwints trägt den Namen Gwendolwyr, im Alltag auch Gwendolyns Wacht genannt. Ihr Name ehrt die Namensgeberin der Baronie. Die Einheit ist vierhundert Mann stark und besteht aus ausgewählten, gut ausgebildeten Waffenknechten, die für ihren Dienst überdurchschnittlich bezahlt werden."),
        paragraph("Die Gwendolwyr sichern Tore, Brücken, Märkte, Kais, Speicher und die Übergänge zwischen den vier Stadtsektionen. Sie gelten als verlässliche Waffenknechtelite der Gwyvern und sind von den Dorf- und Ortswachen des Umlandes getrennt."),
        subheading("Haus Gwyvern und seine Vasallen"),
        paragraph("Die Hauskräfte der Gwyvern schützen Herrschaftssitz, Hafen und wichtige Befestigungen. Im Kriegsfall werden sie durch die Aufgebote der feudalen Ritterhäuser ergänzt; auf See treten Flotte und Hafenpatrouillen neben die landgebundenen Kräfte.")
      ),

      economy: section(
        paragraph("Abergwints Wohlstand beruht auf seinem Hafen. Nach Gwynthor ist die Stadt die wichtigste Anlaufstelle der Grafschaft für Schiffe aus dem Ausland. Handel, Zölle, Lagerung und der Weitertransport fremder Waren schaffen Arbeit und Einnahmen."),
        paragraph("Schiffbau, Reparatur, Segelmacherei und die Versorgung von Besatzungen bilden den maritimen Kern der Wirtschaft. Das Umland liefert Holz, Vieh und landwirtschaftliche Erzeugnisse; Fischerei und die Verarbeitung von Salzfisch ergänzen den Warenverkehr."),
        paragraph("Die Verbindung aus Hafen, Werften, Holzversorgung und fruchtbarem Hinterland macht Abergwint weniger abhängig von einem einzelnen Gewerbe und zum wirtschaftlichen Mittelpunkt Gwendolyns Ufers.")
      ),

      newspaper: section(
        paragraph("Die Abergwinter Ausgabe des Schwarzboten entsteht unter der Leitung von Luca Acria. Claudia Acria führt die erste vorbereitete Ausgabe mit ihrer Skandalchronik „Salzwasser – Statt Samt und Seide!“ an."),
        paragraph("Zur Redaktion gehören außerdem Tywill Brân für Kunstkritik, Geschichte und Politik, Angharad Corryn für Satire und Gesellschaft, Elenwyn Meddal für Chronik und gemeine Berichterstattung sowie Cadwell Gywir für Politik und aktuelle Meldungen."),
        paragraph("Celtigerns Echo unterhält auch in Abergwint eine eigene Redaktionsstube. Sie ist als örtliche Alternative zum Schwarzboten bereits eingerichtet, hat aber noch keine namentlich besetzten Stellen; ihre künftige Besetzung wird unabhängig von der Gwynthorer Hauptredaktion geführt."),
        paragraph("Daneben sammelt Abergwints Standort des Kronenspiegels große Nachrichten von Küste, Flotte und Seehandel für die Hauptredaktion in Mathragon. Das Haus druckt keine eigene Abergwinter Fassung, sondern dieselbe cenyrweite Ausgabe wie alle anderen Standorte.")
      )
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Abergwint – Bannkreis",
      name: "Abergwint",
      "vorherrschender adel": "Haus Gwyvern",
      region2: "Großstadt",
      gewerbe: "Fischerei, Handel und Schiffbau",
      regierungstyp: "Baroniale Stadtverwaltung",
      herrschaft: "Gwendolyns Ufer",
      lehnsherr: "Haus Gwyvern",
      "bekannte familien": "Haus Gwyvern sowie die ansässigen Ritter- und Bürgerhäuser",
      stände: "Adel, Klerus, Bürgertum, Handwerker, Seeleute und Arbeiter",
      einwohnerzahl: "etwa 20.000",
      ritter: "Haus Gwyvern und feudale Ritterhäuser",
      waffenknechte: "Hausgarden und feudale Aufgebote",
      ortswache: "400 Gwendolwyr",
      flotte: "Gwyvern-Flotte und Hafenpatrouillen",
      "sonstiges aufgebot": "Ortswachen des Umlandes",
      bedrohungen: "Syndikat, Schmuggel und Unterweltbanden",
      ressourcen: "Salzfisch, Schiffsbedarf, Segel, Tauwerk und maritime Waren"
    }),
    houses: Object.freeze([
      Object.freeze({
        title: "Adelshaus",
        items: Object.freeze([
          house("haus-gwyvern", "Gwyvern", "Adelshaus", "Abergwint", "Draig", "haus-gwyvern.png")
        ])
      }),
      Object.freeze({
        title: "Feudale Ritterhäuser",
        items: Object.freeze([
          house("haus-rhuddgar", "Rhuddgar", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Rhuddgar.png"),
          house("haus-gwyntog", "Gwyntog", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Gwyntog.png"),
          house("haus-trydar", "Trydar", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Trydar.png"),
          house("haus-taranvyr", "Taranvyr", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Taranvyr.png"),
          house("haus-selog", "Selog", "Feudales Ritterhaus", "Abergwint, Burg am Feuerstollen", "Gwyvern", "Ritterliche/Selog.png"),
          house("haus-penwyn", "Penwyn", "Feudales Ritterhaus", "Morddyn", "Draig", "Ritterliche/Penwyn.png"),
          house("haus-annwyl", "Annwyl", "Feudales Ritterhaus", "Côr Mynyddfaen", "Gwyvern", "Ritterliche/Annwyl.png"),
          house("haus-seldryn", "Seldryn", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Seldryn.png"),
          house("haus-cysgodion", "Cysgodion", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Cysgodion.png"),
          house("haus-edmy", "Edmy", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Edmy.png"),
          house("haus-tawelgar", "Tawelgar", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Tawelgar.png"),
          house("haus-ymladd", "Ymladd", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Ymladd.png"),
          house("haus-daran", "Daran", "Feudales Ritterhaus", "Garwfaen", "Gwyvern", "Ritterliche/Daran.png"),
          house("haus-cenfig", "Cenfig", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Cenfig.png"),
          house("haus-barus", "Barus", "Feudales Ritterhaus", "Abergwint", "Gwyvern", "Ritterliche/Barus.png")
        ])
      }),
      Object.freeze({
        title: "Bürgerliche Häuser",
        items: Object.freeze([
          house("haus-caerthwyn", "Caerthwyn", "Bürgerliches Haus", "Abergwint", "Gwyvern", "Bürgerliche/Caerthwyn.png"),
          house("haus-caerlaen", "Caerlaen", "Bürgerliches Haus", "Abergwint", "Gwyvern", "Bürgerliche/Caerlaen.png")
        ])
      })
    ]),
    merchants: Object.freeze([]),
    regionMap: Object.freeze({
      mapId: regionMapId,
      title: "Abergwint – Bannkreis",
      embedHref: regionMapHref,
      fullHref: regionMapHref,
      pois: Object.freeze([])
    })
  });

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }
})();
