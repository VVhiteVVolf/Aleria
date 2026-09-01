(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const houseRoot = "/Stammbäume/assets/images/houses/Llamreis Ankunft";
  const portraitRoot = "/Stammbäume/assets/images/portraits";
  const banner = "https://i.imgur.com/va5xLbK.png";
  const mapHref = "/Karten/karte.html?map=cenyr-celtigerns-wacht";

  const familySections = Object.freeze([
    data.familySection("Adelshaus", [
      data.family("Saethwyr", {
        familyId: "haus-saethwyr",
        imageSrc: `${houseRoot}/haus-saethwyr.png`,
        seat: "Gwynthor",
        liege: "Draig",
        featured: true,
      }),
    ]),
    data.familySection("Ritterhäuser", [
      data.family("Chwedlonol", {
        familyId: "haus-chwedlonol",
        imageSrc: `${houseRoot}/haus-chwedlonol.png`,
        seat: "Gwynthor",
        liege: "Saethwyr",
      }),
      data.family("Eneiniog", {
        familyId: "haus-eneiniog",
        imageSrc: `${houseRoot}/haus-eneiniog.png`,
        seat: "Gwynthor",
        liege: "Saethwyr",
      }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Ritterfürst", [
      data.person("Ritterfürst der Saethwyr", "Huw Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/huw-saethwyr.jpg`,
        familyId: "haus-saethwyr",
        seat: "Gwynthor",
        featured: true,
      }),
    ]),
    data.personGroup("Ratsämter", [
      data.person("Marschall des Ritterfürsten", "Marmaduke Saethwyr", {
        imageSrc: `${portraitRoot}/haus-wyrm/marmaduke-saethwyr.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Kämmererin des Ritterfürsten", "Imogen Saethwyr", {
        imageSrc: `${portraitRoot}/haus-arwydd/imogen-arwydd.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Justiziarin des Ritterfürsten", "Morwenna Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/morwenna-gwyvern.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Schatten des Ritterfürsten", "Arawn", {
        imageSrc: "https://i.imgur.com/7yB9PR6.png",
      }),
      data.person("Herold des Ritterfürsten", "Anwyll Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/anwyll-saethwyr.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Ratsmagierin des Ritterfürsten", "Ceridwyn Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/ceridwyn-saethwyr.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Vikarin des Ritterfürsten", "Jenniffer Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/jenniffer-marwolaeth.jpg`,
        familyId: "haus-saethwyr",
      }),
      data.person("Bardin des Ritterfürsten", "Maelys Saethwyr", {
        imageSrc: `${portraitRoot}/haus-saethwyr/maelys-ceirwyn.png`,
        familyId: "haus-saethwyr",
      }),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Vasallen und Amtsträger", [
      data.person("Vasall", "...", { seat: "Tŵr Gwaunhir" }),
      data.person("Vasall", "...", { seat: "Morfaen" }),
      data.person("Lehenswartin", "Gwenhwyfar Chwedonol", {
        imageSrc: `${portraitRoot}/haus-chwedlonol/gwenhwyfar-chwedlonol.jpg`,
        familyId: "haus-chwedlonol",
        seat: "Glastraeth",
      }),
      data.person("Vasall", "...", { seat: "Llysfael" }),
      data.person("Vasall", "...", { seat: "Craithllyn" }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte der Herrschaft der Saethwyr",
      imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
      imageAlt: "Karte von Celtigerns Wacht mit der Herrschaft der Saethwyr",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Herrschaft der Saethwyr",
      center: "Gwynthor",
      crestSrc: banner,
      crestAlt: "Banner des Hauses Saethwyr",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            data.place("Tŵr Gwaunhir", "Turm", "Turm.png"),
            data.place("Morfaen", "Hafensiedlung", "Hafensiedlung.png"),
            data.place("Glastraeth", "Hafensiedlung", "Hafensiedlung.png"),
            data.place("Llysfael", "Bauernsiedlung", "Bauernsiedlung.png"),
            data.place("Craithllyn", "Bergbausiedlung", "Bergbausiedlung.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "herrschaft-saethwyr",
      title: "Herrschaft der Saethwyr - Aleria",
      type: "Herrschaft",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Herrschaft der Saethwyr",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Herrschaft der Saethwyr",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Herrschaft", name: "Saethwyr", slug: "saethwyr" },
    ],
    view: {
      familyTreePage: data.familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "herrschaft-saethwyr",
        title: "Herrschaft der Saethwyr",
        shortTitle: "Saethwyr",
        crestSrc: banner,
        crestAlt: "Banner des Hauses Saethwyr",
        kicker: "Die Segel der Draig an der nördlichen Küste Celtigerns Wacht",
        parentHref: "../Grafschaft%20Celtigerns%20Wacht.html",
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Herrschaft der Saethwyr" },
            { label: "Typ", value: "Ritterfürsten-Herrschaft" },
            { label: "Oberhaupt", value: "Huw Saethwyr" },
            { label: "Verwaltungssitz", value: "Gwynthor" },
            { label: "Lehnsherrschaft", value: "Grafschaft Celtigerns Wacht" },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri" },
            { label: "Religion", value: "Alerische Kirche" },
          ] },
          { title: "Handel", rows: [
            { label: "Schwerpunkte", value: "Fischerei, Schiffbau, Segel und Tauwerk" },
          ] },
        ],
        copy: {
          overview: [
            "Die Herrschaft der Saethwyr liegt an der nördlichen Küste von Celtigerns Wacht und ist für ihre starke maritime Tradition bekannt. Das Haus Saethwyr, ein jüngeres Kadettenhaus der Draig, hat sich durch seine Fähigkeiten im Schiffbau, den Seefahrtsverkehr und den Schutz der Küstenregionen einen Namen gemacht. Seine Angehörigen gelten als unerschütterliche Verteidiger der Küsten und sind besonders darauf spezialisiert, ihre Ländereien vor Piraten und Bedrohungen aus dem Meer zu schützen.",
          ],
          history: [
            "Die Saethwyr kamen zur Herrschaft, als sie vor mehreren Generationen von den Draig mit der Aufgabe betraut wurden, die nördlichen Küsten der Grafschaft zu sichern.",
          ],
          culture: [
            "Die Menschen, die den Saethwyr dienen, sind stark von der Küstenregion geprägt und gelten als zähe, pragmatische und selbstständige Leute. Viele von ihnen arbeiten in der Fischerei, im Schiffbau oder sind selbst Seefahrer. Sie sind an das raue Leben am Meer gewöhnt und haben gelernt, mit den Launen der Natur umzugehen, was sie widerstandsfähig und anpassungsfähig macht.",
            "Die Küstenbewohner sind für ihren Gemeinschaftssinn und ihren Stolz auf ihre Handwerkskunst bekannt, besonders in der Herstellung von Segeln, Tauen und Schiffen. Trotz der harten Lebensbedingungen sind sie gesellig und schätzen die Zusammenarbeit. Gleichzeitig bleiben sie gegenüber Piraten und mystischen Kreaturen wachsam. Ihre Treue zu den Saethwyr ist tief verwurzelt, da die Verteidigung ihrer Heimat eng mit der Stärke dieses Hauses verknüpft ist.",
          ],
          economy: [
            "Die Wirtschaft der Herrschaft der Saethwyr ist stark auf maritime Tätigkeiten ausgerichtet. Fischerei, Schiffbau sowie die Produktion von Segeln und Tauwerk bilden ihre zentralen Säulen. Die Hafensiedlungen werden vom Alltag der Fischer und Seefahrer bestimmt; Salzfisch zählt zu den wichtigen Exportgütern.",
            "In den Werften entstehen schnelle und robuste Schiffe für Handel, Fischerei und Krieg. Segel und Tausysteme aus der Herrschaft genießen im gesamten Königreich einen guten Ruf. Enge Handelsbeziehungen entlang der Küste sichern Wohlstand und Einfluss der Saethwyr.",
          ],
          defense: [
            "Die Verteidigung konzentriert sich auf Küstenschutz und Seeverteidigung. Als Hauptverantwortliche für die Sicherheit der nördlichen Küste tragen die Saethwyr den größten Teil der Abwehr gegen Piraten und andere maritime Bedrohungen. Eine Flotte schneller, wendiger Schiffe patrouilliert regelmäßig entlang der Küste.",
            "Küstenwachtstationen und Bogenschützen sichern Klippen und Häfen. Dank ihrer Erfahrung im Küstenkampf und ihrer Schiffbaukunst gelten die Saethwyr als wichtigste Verteidigungslinie der Grafschaft gegen Übergriffe vom Meer.",
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
