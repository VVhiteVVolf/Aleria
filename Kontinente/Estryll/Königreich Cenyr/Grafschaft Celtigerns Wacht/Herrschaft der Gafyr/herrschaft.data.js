(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const houseRoot = "/Stammbäume/assets/images/houses/Llamreis Ankunft";
  const portraitRoot = "/Stammbäume/assets/images/portraits";
  const banner = "https://i.imgur.com/3NC5pb0.png";
  const mapHref = "/Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html";

  const familySections = Object.freeze([
    data.familySection("Adelshaus", [
      data.family("Gafyr", {
        familyId: "haus-gafyr",
        imageSrc: `${houseRoot}/haus-gafyr.png`,
        seat: "Gwynthor",
        liege: "Draig",
        featured: true,
      }),
    ]),
    data.familySection("Ritterhäuser", [
      data.family("Tlawd", {
        familyId: "haus-tlawd",
        imageSrc: `${houseRoot}/haus-tlawd.png`,
        seat: "Gwynthor",
        liege: "Gafyr",
      }),
      data.family("Gostyn", {
        familyId: "haus-gostyn",
        imageSrc: `${houseRoot}/haus-gostyn.png`,
        seat: "Gwynthor und Bronfelen",
        liege: "Gafyr",
      }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Ritterfürst", [
      data.person("Ritterfürst der Gafyr", "Duncan Gafyr", {
        imageSrc: `${portraitRoot}/haus-gafyr/duncan-gafyr.jpg`,
        familyId: "haus-gafyr",
        seat: "Gwynthor",
        featured: true,
      }),
    ]),
    data.personGroup("Ratsämter", [
      data.person("Marschall des Ritterfürsten", "Rheinallt Gafyr", {
        imageSrc: `${portraitRoot}/haus-gafyr/rheinallt-gafyr.jpg`,
        familyId: "haus-gafyr",
      }),
      data.person("Kämmerer des Ritterfürsten", "Kelyddon Gafyr", {
        imageSrc: `${portraitRoot}/haus-arwydd/kelyddon-gafyr.jpg`,
        familyId: "haus-gafyr",
      }),
      data.person("Justiziar des Ritterfürsten", "Hywell Gafyr", {
        imageSrc: `${portraitRoot}/haus-gafyr/hywell-gafyr.jpg`,
        familyId: "haus-gafyr",
      }),
      data.person("Schatten des Ritterfürsten", "..."),
      data.person("Heroldin des Ritterfürsten", "Alicyn Gafyr", {
        imageSrc: `${portraitRoot}/haus-gafyr/alicyn-draig.jpg`,
        familyId: "haus-gafyr",
      }),
      data.person("Ratsmagier des Ritterfürsten", "..."),
      data.person("Vikarin des Ritterfürsten", "Eleri Gafyr", {
        imageSrc: `${portraitRoot}/haus-gafyr/eleri-marwolaeth.jpg`,
        familyId: "haus-gafyr",
      }),
      data.person("Bardin des Ritterfürsten", "Modlen Tlawd", {
        imageSrc: `${portraitRoot}/haus-tlawd/modlen-tlawd.jpg`,
        familyId: "haus-tlawd",
      }),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Vasallen und Amtsträger", [
      data.person("Vasall", "...", { seat: "Morddwr" }),
      data.person("Vasall", "...", { seat: "Gwaulwyn" }),
      data.person("Lehenswart", "Eifion Gostyn", {
        imageSrc: `${portraitRoot}/haus-gostyn/eifion-gostyn.jpg`,
        familyId: "haus-gostyn",
        seat: "Bronfelen",
      }),
      data.person("Vasall", "...", { seat: "Mwyncairn" }),
      data.person("Vasall", "...", { seat: "Carregfael" }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte der Herrschaft der Gafyr",
      imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
      imageAlt: "Karte von Celtigerns Wacht mit der Herrschaft der Gafyr",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Herrschaft der Gafyr",
      center: "Gwynthor",
      crestSrc: banner,
      crestAlt: "Banner des Hauses Gafyr",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            data.place("Morddwr", "Hafensiedlung", "Hafensiedlung.png"),
            data.place("Gwaulwyn", "Bauernsiedlung", "Bauernsiedlung.png"),
            data.place("Bronfelen", "Bauernsiedlung", "Bauernsiedlung (2).png"),
            data.place("Mwyncairn", "Bergbausiedlung", "Bergbausiedlung.png"),
            data.place("Carregfael", "Bergbausiedlung", "Bergbausiedlung.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "herrschaft-gafyr",
      title: "Herrschaft der Gafyr - Aleria",
      type: "Herrschaft",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Herrschaft der Gafyr",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Herrschaft der Gafyr",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Herrschaft", name: "Gafyr", slug: "gafyr" },
    ],
    view: {
      familyTreePage: data.familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "herrschaft-gafyr",
        title: "Herrschaft der Gafyr",
        shortTitle: "Gafyr",
        crestSrc: banner,
        crestAlt: "Banner des Hauses Gafyr",
        kicker: "Die Hüter der nördlichen Grenze Celtigerns Wacht",
        parentHref: "../Grafschaft%20Celtigerns%20Wacht.html",
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Herrschaft der Gafyr" },
            { label: "Typ", value: "Ritterfürsten-Herrschaft" },
            { label: "Oberhaupt", value: "Duncan Gafyr" },
            { label: "Verwaltungssitz", value: "Gwynthor" },
            { label: "Lehnsherrschaft", value: "Grafschaft Celtigerns Wacht" },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri" },
            { label: "Religion", value: "Alerische Kirche" },
          ] },
          { title: "Handel", rows: [
            { label: "Schwerpunkte", value: "Bergbau, Holzverarbeitung und Viehzucht" },
          ] },
        ],
        copy: {
          overview: [
            "Die Herrschaft der Gafyr liegt im nördlichsten Teil der Grafschaft Celtigerns Wacht und ist für ihre raue Landschaft und ihre strategische Lage als Grenzregion bekannt. Obwohl die Gafyr kein Kadettenhaus der Draig sind, haben sie sich durch Loyalität und Verteidigungsstärke einen festen Platz im Gefüge der Grafschaft erarbeitet. Ihre Ländereien umfassen weite Wälder, Gebirge und fruchtbare Täler; die Gafyr gelten als Hüter der nördlichen Grenze.",
          ],
          history: [
            "Ursprünglich waren die Gafyr eine einfache Ritterfamilie, die für ihre Fähigkeiten im Kampf und ihre Verteidigungsstärke bekannt war. Von den Draig erhielten sie Ländereien mit dem Auftrag, die Grenzregion zu sichern.",
          ],
          culture: [
            "Die Menschen, die den Gafyr dienen, sind für ihre Härte und Unabhängigkeit bekannt, geformt durch das raue Klima und die Grenzlage ihrer Heimat. Sie sind ein widerstandsfähiges Volk mit enger Verbindung zur Natur; Viehzucht und Holzverarbeitung bestimmen einen großen Teil ihres Alltags.",
            "Die Bevölkerung ist stolz auf ihre Selbstverteidigungstraditionen und ihre lange Geschichte des Kampfes gegen äußere Bedrohungen. Loyalität gegenüber Adel und Gemeinschaft, harte Arbeit, Pragmatismus und Bodenständigkeit prägen die Region. Gastfreundschaft ist wichtig, doch Fremden begegnet man angesichts früherer Übergriffe mit Wachsamkeit.",
          ],
          economy: [
            "Die Wirtschaft der Gafyr-Herrschaft basiert auf Bergbau, Holzverarbeitung und Viehzucht. Besonders die Ziegenzucht spielt eine zentrale Rolle; Gafyrs Ziegenkäse wird in der Grafschaft und darüber hinaus geschätzt. Die Wälder liefern wertvolles Bau- und Handwerksholz, während die Berge reiche Erzvorkommen bergen. Viehherden sowie die Produktion von Fleisch und Wolle bilden weitere wichtige Stützen.",
          ],
          defense: [
            "Die Verteidigung stützt sich vor allem auf die Teulu – eine Elite von Schwertkämpfern als persönliche Leibwache und Kriegertruppe des Hauses – sowie auf gut organisierte Fußmilizen aus erfahrenen Bauern und Dorfbewohnern.",
            "Obwohl die Landwege vergleichsweise sicher sind, drängen immer wieder Untote und andere Kreaturen aus den Bergen. Auch an der Küste drohen Überfälle. Die Verbindung aus Elitekriegern und disziplinierten, ortskundigen Fußtruppen macht die Gafyr zu einer robusten Verteidigungsmacht.",
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
