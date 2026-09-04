(function () {
  "use strict";

  const createPlaceData = window.ALERIA_CELTIGERNS_PLACES?.createPlaceData;
  if (typeof createPlaceData !== "function") return;

  const regionMapId = "cenyr-celtigerns-wacht-arthus-streben-rhosmere-bannkreis";
  const regionMapHref = mapHref(regionMapId);
  const mapAssetRoot = "/Karten/Cenyr/celtigerns-wacht/arthus-streben/rhosmere-bannkreis/Kartenbilder";
  const placeAssetRoot = "/Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Arthus_Streben/Rhosmeres_Bannkreis/Rhosmere/assets";
  const newspaperHref = "/Zeitungen/zeitung.html?zeitung=schwarzbote-rhosmere";
  const houseRoot = "/Stammbäume/assets/images/houses/Artus Streben";
  const supporter = "/Stammbäume/assets/images/sigilsupporter/ArtusStrebenHengst.png";

  const house = (familyId, name, rank, seat, liege, emblem) => Object.freeze({
    familyId,
    name: `Haus ${name}`,
    rank,
    seat,
    liege: `Haus ${liege}`,
    emblem: encodeURI(`${houseRoot}/${emblem}`)
  });
  const paragraph = (text) => Object.freeze({ type: "paragraph", text });
  const subheading = (text) => Object.freeze({ type: "subheading", text });
  const list = (...items) => Object.freeze({ type: "list", items: Object.freeze(items) });
  const section = (...blocks) => Object.freeze(blocks);

  const base = createPlaceData("rhosmere", {
    meta: {
      title: "Rhosmere - Aleria"
    },
    parentage: {
      barony: "Arthus Streben",
      region: "Rhosmere – Bannkreis"
    },
    features: {
      districts: true,
      noticeBoard: true,
      personalitiesCollapsed: true
    },
    presentation: {
      map: regionMapHref,
      images: {
        "supporter-left-png": {
          src: supporter,
          alt: "Hengst als Wappenstützer von Rhosmere",
          fit: "contain"
        },
        "supporter-right-png": {
          src: supporter,
          alt: "Hengst als Wappenstützer von Rhosmere",
          fit: "contain"
        },
        "karten-bild-png": {
          src: `${mapAssetRoot}/RhosmereBannkreisNormal.webp`,
          alt: "Rhosmere und sein Bannkreis",
          href: regionMapHref,
          fit: "contain"
        },
        "stadtsektionen-png": {
          src: `${mapAssetRoot}/RhosmereBannkreisZonen.webp`,
          alt: "Bezirke von Rhosmere",
          href: regionMapHref,
          fit: "contain"
        },
        "bild-einer-stadtwache-png": {
          src: `${placeAssetRoot}/rhosmere-stadtwache.png`,
          alt: "Stadtwache von Rhosmere",
          fit: "contain"
        },
        "zeitung-png": {
          src: "/Zeitungen/data/schwarzbote-rhosmere/assets/schwarzbote-rhosmere.png",
          alt: "Der Schwarzbote – Ausgabe Rhosmere",
          href: newspaperHref,
          fit: "contain"
        }
      }
    },
    sections: {
      introduction: section(
        paragraph("Rhosmere ist der Sitz des Hauses Gwefrydd und die drittgrößte Stadt der Grafschaft Celtigerns Wacht. Die nördliche Küstenstadt liegt auf einer großen Flussinsel und verbindet einen dreigeteilten Hafen mit dem fruchtbaren Weideland von Arthus Streben."),
        paragraph("Aus einer kleinen crannath-albischen Siedlung am Moorsee wurde das bedeutendste Zentrum für Pferdezucht und Kavallerie der Grafschaft. Noch heute bestimmen Rösser, Handel und Turniere den Rhythmus der Stadt.")
      ),

      background: section(
        paragraph("Rhosmere begann als crannath-albische Kleinstadt Móinloch, deren Name „Moorsee“ bedeutet. Sie lag zwischen Küste, Flussarmen, Moor und Heide und nutzte die geschützten Wasserwege lange bevor die großen Weiden des heutigen Bannkreises entstanden."),
        paragraph("Die Avallornir übertrugen den alten Namen zunächst als Rhoslyn. Aus dieser Bezeichnung entwickelte sich später der cenyrische Name Rhosmere. Mit Entwässerung, Rodung und einer stetigen Ausweitung der Weideflächen verwandelte sich das unmittelbare Umland von einer Moor- und Heidelandschaft in das fruchtbare Herzland der späteren Pferdezucht."),
        paragraph("Hier begründete Sir Tallwch, der „Pferdebrecher“, das Haus Gwefrydd. Aus den Gestüten des Hauses ging die Züchtergilde Rhosmeres Rösser hervor, die sich später von den Gwefrydd löste und heute weit über Cenyr hinaus vertreten ist.")
      ),

      location: section(
        paragraph("Rhosmere liegt an der nördlichen Küste Celtigerns Wachts. Der Fluss teilt sich vor dem Meer in mehrere Arme und umschließt den größten Teil der Stadt; selbst die Altstadt liegt nochmals auf einer kleineren, eigenen Flussinsel."),
        paragraph("Über Brücken führen die Straßen nach Süden in das Weideland von Arthus Streben. Nach Nordwesten wird der Boden feuchter und unwegsamer, bis Moore und Sümpfe in Wald und schließlich in das Gebirge übergehen.")
      ),

      administration: section(
        paragraph("Rhosmere ist Hauptstadt der Baronie Arthus Streben und unmittelbarer Sitz des Hauses Gwefrydd. Baron Stennis Gwefrydd steht an der Spitze der baronialen Herrschaft; Hof und Stadtverwaltung liegen deshalb eng beieinander, bleiben in ihren täglichen Aufgaben jedoch voneinander unterscheidbar."),
        paragraph("Die städtischen Ämter beaufsichtigen die sieben Bezirke, Brücken, Märkte, Turnierplätze und die drei Hafenbereiche. Hinzu kommen Zoll, Gericht, Vorratshaltung, Vieh- und Pferdemärkte sowie die Kontrolle der zahlreichen Ställe und Tränken."),
        paragraph("Amtleute, Zöllner, Schreiber und Bezirksaufseher reichen ihre Berichte an den baronialen Hof weiter. Die Tallchwyr sorgen innerhalb der Stadt für die Durchsetzung dieser Ordnung, während die Ortswachen des Bannkreises ihren jeweiligen Siedlungen verpflichtet bleiben.")
      ),

      conflicts: section(
        subheading("Unruhe zwischen den Gemeinschaften"),
        paragraph("Die ungewöhnlich großen albischen und aldrimarischen Minderheiten machen Rhosmere vielfältiger, aber auch instabiler als viele Städte vergleichbarer Größe. Streit um Wohnraum, Arbeit, Lohn und politischen Einfluss wird rasch als Auseinandersetzung zwischen Herkunftsgruppen gedeutet. Vorurteile gegen die Flüchtlinge aus Ceitheach und Misstrauen gegenüber den Aldrimarern verschärfen selbst alltägliche Konflikte."),
        subheading("Haus und Züchtergilde"),
        paragraph("Zwischen Haus Gwefrydd und Rhosmeres Rösser besteht eine enge gemeinsame Geschichte, aber keine gemeinsame Herrschaft mehr. Die Selbstständigkeit der Gilde führt regelmäßig zu Spannungen über Zuchtlinien, Ausfuhr, Preise und die Frage, wem Rhosmeres Ruf als Pferdestadt eigentlich gehört."),
        subheading("Hafen und Grenzland"),
        paragraph("Drei Hafenbereiche und ein reger Viehhandel bieten Schmugglern zahlreiche Möglichkeiten, Zölle zu umgehen oder Tiere mit zweifelhafter Herkunft in den Handel einzuschleusen. Im nordwestlichen Moor-, Wald- und Gebirgsland erschweren das Gelände und die dünne Besiedlung eine lückenlose Kontrolle der Wege.")
      ),

      history: section(
        subheading("Móinloch"),
        paragraph("Die älteste Siedlung war das crannath-albische Móinloch, die Stadt am „Moorsee“. Ihre Bewohner nutzten die Flussinsel als geschützten Wohn- und Handelsplatz zwischen Küste und feuchtem Hinterland. Aus dieser Zeit stammen die ältesten Grundmauern und der Kern der heutigen Altstadt."),
        subheading("Rhoslyn"),
        paragraph("Unter den Avallorniern wurde Móinloch als Rhoslyn bekannt. Die Siedlung wuchs über ihren alten Kern hinaus, neue Brücken verbanden die Inseln, und am Fluss entstanden größere Anlegestellen. Zugleich wurden Heide und Moor schrittweise entwässert und in Weiden umgewandelt."),
        subheading("Sir Tallwch und Haus Gwefrydd"),
        paragraph("In den frühen Tagen des Königreichs Cenyr wurde der aus Avallorn stammende Pferdemeister Sir Tallwch für seine beinahe übernatürliche Gabe berühmt, Pferde zu verstehen, zu beruhigen und zu zähmen. Sein Beiname „Pferdebrecher“ machte ihn zur ersten Wahl, als das junge Königreich eine eigene leistungsfähige Pferdezucht aufbauen wollte."),
        paragraph("Der König erhob Tallwch zum Baron. Auf königliche Weisung wiesen die Draigs ihm die fruchtbaren Ländereien um Rhoslyn zu. Tallwch nahm die Stadt als Sitz, gründete Haus Gwefrydd und begann, Zucht und Ausbildung der besten Reit-, Arbeits- und Kriegspferde des Königreichs zu ordnen. Mit dem Aufstieg seines Hauses setzte sich für die Stadt der Name Rhosmere durch."),
        subheading("Rhosmeres Rösser"),
        paragraph("Aus den über Generationen verfeinerten Methoden der Gwefrydd entstand die Züchtergilde Rhosmeres Rösser. Zunächst eng an Haus und Stadt gebunden, löste sie sich später aus der unmittelbaren Kontrolle der Barone. Als eigenständige und inzwischen international vertretene Gilde verbreitet sie Rhosmerer Zuchtwissen, unterhält Gestüte und vermittelt Tiere weit über die Grenzen Cenyrs hinaus.")
      ),

      population: section(
        paragraph("Rund 78 Prozent der Bevölkerung sind Cenyri. Zu ihnen zählen alteingesessene Stadtfamilien ebenso wie Menschen aus dem Weideland, die als Viehzüchter, Stallknechte, Handwerker, Händler, Seeleute oder im Umfeld der Turniere Arbeit suchen."),
        paragraph("Albische Flüchtlinge aus Ceitheach stellen etwa 11 Prozent der Einwohner. Viele kamen infolge des Krieges in die Grafschaft und bewahren in Rhosmere eigene Familien- und Gemeinschaftsbindungen. Mit ungefähr 10 Prozent besitzt die Stadt außerdem einen außergewöhnlich hohen aldrimarischen Bevölkerungsanteil. Das verbleibende Prozent entfällt auf Reisende und Zugewanderte anderer Herkunft."),
        paragraph("Die beiden großen Minderheiten sind im Handel und in vielen Gewerben sichtbar, doch ihre Größe erzeugt auch politische und soziale Reibung. Konkurrenz um Arbeit und Wohnraum, gegenseitige Vorurteile und die Folgen des Krieges sorgen immer wieder für Unruhe.")
      ),

      newspaper: section(
        paragraph("Der Schwarzbote unterhält in Rhosmere eine eigene Ausgabe für Nachrichten, Gerüchte und Wahrheiten aus Arthus Streben. Pferdemärkte, Turniere, Handel und die Spannungen der Hafenstadt liefern dem Rhosmerer Blatt reichlich Stoff."),
        paragraph("Auch Celtigerns Echo besitzt eine örtliche Redaktionsstube. Sie sammelt Berichte aus den Bezirken und dem Bannkreis für das volksnahe Netz der Zeitung, ist personell jedoch noch nicht namentlich ausgearbeitet."),
        paragraph("Der Kronenspiegel führt Rhosmere als Korrespondenz- und Vertriebsort seiner cenyrweiten Ausgabe. Nachrichten über Pferdehandel, ausländische Käufer und die nördlichen Küstenwege gelangen von hier an die Hauptredaktion in Mathragon.")
      ),

      region: section(
        paragraph("Das Herzland um Rhosmere besteht aus fruchtbaren, offenen Weiden. Gestüte, Viehhöfe und Futteräcker nutzen die gut entwässerten Böden; Hecken, Gräben und breite Triftwege gliedern das Land für Herden und Reiter."),
        paragraph("Weiter nordwestlich kehrt die ältere Landschaft zurück. Die Weiden werden feuchter, gehen in Moor und Sumpf über und steigen schließlich zu dichtem Wald und Gebirge an. Dieser Übergang begrenzt die Landwirtschaft und verlangt auf den wenigen festen Wegen nach regelmäßigen Patrouillen.")
      ),

      culture: section(
        paragraph("Die Rhosmerer gelten als Pferdenarren. Abstammung, Gangart, Temperament und Pflege eines Tieres werden mit einer Ernsthaftigkeit besprochen, die andernorts hohen Ämtern oder großen Kunstwerken vorbehalten ist. Gutes Reiten genießt in fast allen Ständen Ansehen."),
        paragraph("Neben den Pferden bilden Handel und Turniere die beiden anderen Anker des städtischen Lebens. Märkte führen Züchter, Viehhändler, Handwerker und ausländische Käufer zusammen; Turniertage verbinden sportlichen Ehrgeiz, ritterliche Selbstdarstellung und Volksfest. Diese drei Bereiche prägen Festkalender, Handwerk und gesellschaftliches Ansehen gleichermaßen.")
      ),

      districts: section(
        paragraph("Rhosmere gliedert sich in sieben kleinere, deutlich voneinander unterschiedene Bezirke. Nord- und Südviertel bilden den gewachsenen Stadtkern, während die Innenstadt das geschäftliche und verwaltungsmäßige Zentrum einnimmt. Die Altstadt liegt auf einer eigenen kleineren Flussinsel innerhalb der insgesamt vom Wasser umschlossenen Stadt."),
        list(
          "Nordviertel",
          "Südviertel",
          "Innenstadt",
          "Altstadt",
          "Nordhafen",
          "Zentralhafen",
          "Südhafen"
        ),
        paragraph("Nord-, Zentral- und Südhafen bilden zusammen den langen Umschlagplatz der Stadt, werden wegen ihrer unterschiedlichen Anlegeplätze, Märkte und Zufahrten jedoch als eigene Bezirke verwaltet.")
      ),

      builtEnvironment: section(
        paragraph("Rhosmeres jüngere Viertel sind traditionell cenyrisch geprägt. Stein- und Fachwerkbauten, offene Höfe und breite Zufahrten schaffen Raum für Fuhrwerke, Viehtrieb und Reiter. In Hafennähe bestimmen Speicher, Kontore, Stallhöfe und befestigte Kais das Bild."),
        paragraph("Besonders in der Altstadt haben sich zahlreiche Bauten albischer Herkunft erhalten. Alte Fundamente, engere Gassen und niedrigere Steinbauten erinnern an Móinloch und Rhoslyn. Brücken verbinden diese ältesten Inselbereiche mit der cenyrischen Innenstadt und den übrigen Stadtvierteln.")
      ),

      military: section(
        paragraph("Rhosmere stellt die größte Kavallerie Celtigerns Wachts. Ihre Stärke beruht auf der Verbindung aus verfügbaren Reittieren, erprobter Zucht, ausgebildeten Reitern und einem Umland, in dem berittener Dienst zum Alltag gehört. Die bewaffneten Kräfte bleiben dennoch in vier klar getrennte Bereiche gegliedert."),
        subheading("Die Tallchwyr"),
        paragraph("Die Tallchwyr sind Rhosmeres eigene Stadtwache. Die rund 500 Mann starke Elite aus Waffenknechten und Rittern wird sowohl zu Fuß als auch zu Pferd ausgebildet und kann deshalb Gassen, Brücken und Kais ebenso sichern wie Straßen und Weidewege. Sie untersteht unmittelbar dem Baron und den zuständigen Stadtämtern und versieht ihren regulären Dienst innerhalb Rhosmeres."),
        subheading("Hausgarde der Gwefrydd"),
        paragraph("Die Hausgarde schützt den Baron, seine Familie, den Herrschaftssitz und die unmittelbaren Güter des Hauses Gwefrydd. Sie ist keine zweite Stadtwache, auch wenn sie im Ernstfall gemeinsam mit den Tallchwyr kämpft."),
        subheading("Vasallenstreitkräfte"),
        paragraph("Die Ritterhäuser der Baronie unterhalten eigene Ritter und Waffenknechte. Ihre Aufgebote folgen den feudalen Pflichten gegenüber Haus Gwefrydd und werden vor allem im Kriegsfall oder für größere Unternehmungen zusammengezogen."),
        subheading("Ortswachen des Bannkreises"),
        paragraph("Dörfer, Höfe und kleinere Siedlungen des Umlandes besitzen eigene Ortswachen. Diese schützen ihre Gemeinden und melden Gefahren an die baronialen Stellen, gehören aber ausdrücklich nicht zu den 500 Tallchwyr.")
      ),

      economy: section(
        subheading("Viehzucht und Viehhandel"),
        paragraph("Rinder, Schafe, Ziegen, Esel, Maultiere und Geflügel werden im Bannkreis in großer Zahl gehalten. Märkte, Triften und Hafenanlagen verbinden die Höfe des Umlandes mit Käufern aus der Grafschaft und dem Ausland."),
        subheading("Rosszucht"),
        paragraph("Kein anderer Bannkreis Celtigerns Wachts züchtet so viele Rösser. Reit-, Arbeits-, Turnier- und Kriegspferde bilden den angesehensten Wirtschaftszweig der Stadt. Sattler, Hufschmiede, Wagenbauer, Tierkundige und Futtermittelhändler leben unmittelbar von diesem Ruf; Rhosmeres Rösser trägt ihn in die Welt."),
        subheading("See- und Fernhandel"),
        paragraph("Rhosmere ist nach Gwynthor und Abergwint die drittbeliebteste Anlaufstelle Celtigerns Wachts für ausländische Handelsschiffe. Die drei Häfen schlagen Tiere, Futter, Agrarerzeugnisse und Handwerkswaren um und versorgen zugleich die Stadt mit fremden Gütern."),
        subheading("Landwirtschaft"),
        paragraph("Weizen, Gemüse und Obst dienen der Versorgung von Stadt und Umland. Einen besonders großen Raum nimmt der Anbau von Futter ein: Hafer, Gerste, Heu und andere Futterpflanzen sichern die zahlreichen Gestüte und Viehbestände. So stützen Landwirtschaft und Tierzucht einander.")
      ),

      trivia: section(
        list(
          "Der älteste überlieferte Name Rhosmeres lautet Móinloch und bedeutet „Moorsee“.",
          "Die Stadt liegt selbst auf einer Flussinsel; ihre Altstadt nimmt innerhalb dieses Gefüges nochmals eine eigene kleinere Insel ein.",
          "Rhosmeres Rösser entstand aus der Zuchttradition des Hauses Gwefrydd, ist heute aber eine selbstständige, international vertretene Gilde."
        )
      )
    }
  });

  window.ORT_DATA = Object.freeze({
    ...base,
    structure: Object.freeze({
      land: "Cenyr",
      provinz: "Celtigerns Wacht",
      region: "Rhosmere – Bannkreis",
      name: "Rhosmere",
      "vorherrschender adel": "Haus Gwefrydd",
      region2: "Großstadt",
      gewerbe: "Pferdezucht, Landwirtschaft und Reiterhandwerk",
      regierungstyp: "Baroniale Stadtverwaltung",
      herrschaft: "Arthus Streben",
      lehnsherr: "Haus Gwefrydd",
      "bekannte familien": "Haus Gwefrydd sowie die ansässigen Ritter- und Bürgerhäuser",
      stände: "Adel, Klerus, Züchter, Händler, Handwerker, Seeleute und Arbeiter",
      einwohnerzahl: "Drittgrößte Stadt der Grafschaft",
      ritter: "Haus Gwefrydd und Vasallenhäuser",
      waffenknechte: "Hausgarde, Tallchwyr und Vasallenaufgebote",
      ortswache: "500 Tallchwyr",
      flotte: "Hafenwachen und Küstenpatrouillen",
      "sonstiges aufgebot": "Ortswachen des Umlandes",
      bedrohungen: "Soziale Spannungen, Schmuggel und das nordwestliche Grenzland",
      ressourcen: "Rösser, Vieh, Weizen, Gemüse, Obst, Hafer, Heu und Gerste"
    }),
    houses: Object.freeze([
      Object.freeze({
        title: "Adelshaus",
        items: Object.freeze([
          house("haus-gwefrydd", "Gwefrydd", "Adelshaus", "Rhosmere", "Draig", "haus-gwefrydd.png")
        ])
      }),
      Object.freeze({
        title: "Ritterhäuser",
        items: Object.freeze([
          house("haus-almarch", "Almarch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Almarch.png"),
          house("haus-brinmarch", "Brinmarch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Brinmarch.png"),
          house("haus-gwardin", "Gwardin", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Gwardin.png"),
          house("haus-tirwyn", "Tirwyn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Tirwyn.png"),
          house("haus-eirfael", "Eirfael", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Eirfael.png"),
          house("haus-ghorswyn", "Ghorswyn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Ghorswyn.png"),
          house("haus-coedvarn", "Coedvarn", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Coedvarn.png"),
          house("haus-althin", "Althin", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Althin.png"),
          house("haus-talmeirch", "Talmeirch", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Talmeirch.png"),
          house("haus-gwynrhos", "Gwynrhos", "Ritterhaus", "Rhosmere", "Gwefrydd", "Niedere Ritterliche/Gwynrhos.png")
        ])
      }),
      Object.freeze({
        title: "Bürgerliche Häuser",
        items: Object.freeze([
          house("haus-iorwen", "Iorwen", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Iorwen.png"),
          house("haus-bekab", "Bekab", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Bekab.png"),
          house("haus-rhen", "Rhen", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Rhen.png"),
          house("haus-maethan", "Maethan", "Bürgerliches Haus", "Rhosmere", "Gwefrydd", "Bürgerliche/Maethan.png")
        ])
      })
    ]),
    merchants: Object.freeze([]),
    regionMap: Object.freeze({
      mapId: regionMapId,
      title: "Rhosmere – Bannkreis",
      embedHref: regionMapHref,
      fullHref: regionMapHref,
      pois: Object.freeze([])
    })
  });

  function mapHref(mapId) {
    return `/Karten/karte.html?map=${encodeURIComponent(mapId)}`;
  }
})();
