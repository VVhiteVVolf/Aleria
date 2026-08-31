(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const houseRoot = "/Stammbäume/assets/images/houses/Llamreis Ankunft";
  const portraitRoot = "/Stammbäume/assets/images/portraits";
  const banner = "https://i.imgur.com/E6oTNVH.png";
  const mapHref = "/Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html";

  const familySections = Object.freeze([
    data.familySection("Adelshaus", [
      data.family("Wyrm", {
        familyId: "haus-wyrm",
        imageSrc: `${houseRoot}/haus-wyrm.png`,
        seat: "Gwynthor",
        liege: "Draig",
        featured: true,
      }),
    ]),
    data.familySection("Ritterhäuser", [
      data.family("Rhyddid", {
        familyId: "haus-rhyddid",
        imageSrc: `${houseRoot}/haus-rhyddid.png`,
        seat: "Gwynthor",
        liege: "Wyrm",
      }),
      data.family("Cludwyr", {
        familyId: "haus-cludwyr",
        imageSrc: `${houseRoot}/haus-cludwyr.png`,
        seat: "Gwynthor und Bronhir",
        liege: "Wyrm",
      }),
      data.family("Loer", {
        familyId: "haus-loer",
        imageSrc: `${houseRoot}/haus-loer.png`,
        seat: "Gwynthor und Craithglyn",
        liege: "Wyrm",
      }),
    ]),
    data.familySection("Bürgerliche Häuser · Llysfaen", [
      data.family("Jernigan", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
      data.family("Glyn", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
      data.family("Crewe", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
      data.family("Talfryn", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
      data.family("Blevis", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
      data.family("Argall", {
        familyId: "haus-argall",
        imageSrc: `${houseRoot}/Bürgerliche/Llysfaen/Argall.png`,
        seat: "Llysfaen",
        liege: "Wyrm",
      }),
      data.family("Brogar", { seat: "Llysfaen", liege: "Wyrm", linked: false }),
    ]),
    data.familySection("Bürgerliche Häuser · Craithglyn", [
      data.family("Tynged", { seat: "Craithglyn", liege: "Wyrm", linked: false }),
      data.family("Tarw", { seat: "Craithglyn", liege: "Wyrm", linked: false }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Ritterfürst", [
      data.person("Ritterfürst der Wyrm", "Mailgwyn Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/mailgwin-wyrm.jpg`,
        familyId: "haus-wyrm",
        seat: "Gwynthor",
        featured: true,
      }),
    ]),
    data.personGroup("Ratsämter", [
      data.person("Marschall des Ritterfürsten", "Eiddon Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/eiddon-wyrm.jpg`,
        familyId: "haus-wyrm",
      }),
      data.person("Kämmererin des Ritterfürsten", "Sorcha Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/sorcha-cein.jpg`,
        familyId: "haus-wyrm",
      }),
      data.person("Justiziar des Ritterfürsten", "Derwen Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/derwen-wyrm.jpg`,
        familyId: "haus-wyrm",
      }),
      data.person("Schatten des Ritterfürsten", "Tegyr", {
        imageSrc: "https://i.imgur.com/MsmQR0F.png",
      }),
      data.person("Herold des Ritterfürsten", "Padrig Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/padrig-wyrm.jpg`,
        familyId: "haus-wyrm",
      }),
      data.person("Ratsmagier des Ritterfürsten", "..."),
      data.person("Vikar des Ritterfürsten", "Torri", {
        imageSrc: "https://i.imgur.com/Vn4wYAD.png",
      }),
      data.person("Bardin des Ritterfürsten", "Anouk Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/anouk-rosenblueht.jpg`,
        familyId: "haus-wyrm",
      }),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Bürgerliche Vasallen und Amtsträger", [
      data.person("Bürgermeister", "Hywel Tynged", {
        imageSrc: "https://i.imgur.com/dscN0iz.png",
        seat: "Craithglyn",
      }),
      data.person("Bürgermeister", "Brinthan Argall", {
        imageSrc: `${portraitRoot}/haus-argall/brinthan-argall.jpg`,
        familyId: "haus-argall",
        seat: "Llysfaen",
      }),
      data.person("Lehenswart", "Rhain Cludwyr", {
        imageSrc: `${portraitRoot}/haus-cludwyr/rhain-cludwyr.jpg`,
        familyId: "haus-cludwyr",
        seat: "Bronhir",
      }),
      data.person("Bürgermeister", "Pendaran Maelorin", {
        seat: "Mwyncreig",
      }),
      data.person("Hauptmann", "Sion Wyrm", {
        imageSrc: `${portraitRoot}/haus-wyrm/sion-wyrm.jpg`,
        familyId: "haus-wyrm",
        seat: "Tŵr Brynmawr",
      }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte der Herrschaft der Wyrm",
      imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
      imageAlt: "Karte von Celtigerns Wacht mit der Herrschaft der Wyrm",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Herrschaft der Wyrm",
      center: "Gwynthor",
      crestSrc: banner,
      crestAlt: "Banner des Hauses Wyrm",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            data.place("Tŵr Brynmawr", "Turm", "Turm.png"),
            data.place("Mwyncreig", "Bergbausiedlung", "Bergbausiedlung.png"),
            data.place("Craithglyn", "Bergbausiedlung", "Bergbausiedlung.png"),
            data.place("Llysfaen", "Bauernsiedlung", "Bauernsiedlung.png"),
            data.place("Bronhir", "Bauernsiedlung", "Bauernsiedlung (2).png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "herrschaft-wyrm",
      title: "Herrschaft der Wyrm - Aleria",
      type: "Herrschaft",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Herrschaft der Wyrm",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Herrschaft der Wyrm",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Herrschaft", name: "Wyrm", slug: "wyrm" },
    ],
    view: {
      familyTreePage: data.familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "herrschaft-wyrm",
        title: "Herrschaft der Wyrm",
        shortTitle: "Wyrm",
        crestSrc: banner,
        crestAlt: "Banner des Hauses Wyrm",
        kicker: "Der Mantel der Draig rund um Gwynthor",
        parentHref: "../Grafschaft%20Celtigerns%20Wacht.html",
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Herrschaft der Wyrm" },
            { label: "Typ", value: "Ritterfürsten-Herrschaft" },
            { label: "Oberhaupt", value: "Mailgwyn Wyrm" },
            { label: "Verwaltungssitz", value: "Gwynthor" },
            { label: "Lehnsherrschaft", value: "Grafschaft Celtigerns Wacht" },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri" },
            { label: "Religion", value: "Alerische Kirche" },
          ] },
          { title: "Handel", rows: [
            { label: "Schwerpunkte", value: "Bergbau, Pferdezucht und Holzverarbeitung" },
          ] },
        ],
        copy: {
          overview: [
            "Die Herrschaft der Wyrm zählt zu den ältesten und angesehensten Adelsherrschaften in Celtigerns Wacht. Ihre Ländereien erstrecken sich um Gwynthor, die gräfliche Hauptstadt. Das Haus betrachtet sich als ältestes Kadettenhaus der Draig und ist durch Ehen und Allianzen eng mit dem gräflichen Haus verbunden.",
            "Die Wyrm tragen den inoffiziellen Titel „Mantel der Draig“, da sie sich als Schutzschild und enge Berater des gräflichen Hauses verstehen. Ihre Kavallerie ist legendär, ihre Ritter genießen hohes Ansehen und durchlaufen eine strenge Ausbildung im Schwertkampf.",
          ],
          history: [
            "Die Wyrm sind das älteste Kadettenhaus der Draig. Sie wurden vor Jahrhunderten gegründet, als ein Sohn des Hauses Draig mit Ländereien um Gwynthor belehnt wurde. Seither festigten sie ihre Macht durch Ehen, militärische Erfolge und den Bergbau in den umliegenden Regionen.",
          ],
          culture: [
            "Die Menschen unter der Herrschaft der Wyrm sind für Pflichtbewusstsein, Loyalität und starke ritterliche Traditionen bekannt. Bergbau und Pferdezucht schaffen eine tiefe Verbundenheit zur Erde und prägen eine fleißige, pragmatische Bevölkerung.",
            "Disziplin und Ehre genießen einen hohen Stellenwert. Viele Menschen streben danach, Knappen oder Knechte unter den Rittern des Hauses zu werden. Der Stolz auf die lange Geschichte und die enge Bindung an Haus Draig ist tief in der regionalen Kultur verwurzelt.",
          ],
          economy: [
            "Die Wirtschaft unter der Herrschaft der Wyrm wird von Bergbau, Pferdezucht und Holzverarbeitung geprägt. In den Bergen werden wertvolle Erze und seltene Metalle gewonnen, die in Handel und Waffenproduktion Verwendung finden. Die in Zusammenarbeit mit Rhosmeres Rössern betriebene Pferdezucht bringt robuste, gut ausgebildete Kriegspferde hervor.",
            "Die Wälder liefern Bau- und Brennholz sowie Material für den Schiffbau. In den Dörfern und Siedlungen profitieren zahlreiche Handwerksbetriebe von der Versorgung der Ritter und den städtischen Märkten. Natürliche Ressourcen, militärische Stärke und Handwerkskunst machen die Wyrm wirtschaftlich einflussreich.",
          ],
          defense: [
            "Die Verteidigung der weitläufigen Ländereien beruht vor allem auf berittenen Patrouillen. Erfahrene Reiter sichern Grenzen und Wege und können im teils gebirgigen Gelände rasch auf Banditen, Wildtiere oder Eindringlinge reagieren.",
            "Die Ritter der Wyrm führen viele dieser Patrouillen selbst. Zugleich vertreten sie das Haus gegenüber der Bevölkerung und überwachen die Einhaltung der Ordnung. Die starke Kavallerietradition erlaubt eine schnelle, flexible Sicherung der gesamten Herrschaft.",
          ],
          geography: ["..."],
          flora: [],
          trivia: [],
        },
      },
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
