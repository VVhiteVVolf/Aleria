(function () {
  "use strict";

  const data = window.ALERIA_HERRSCHAFT_DATA;
  if (!data) throw new Error("Herrschafts-Datenhelfer wurde nicht geladen.");

  const familyTreePage = data.familyTreePage;
  const banner = "/Stammbäume/assets/images/regions/camruisge.png";
  const mapImage = "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg";
  const mapHref = "/Karten/karte.html?map=cenyr-celtigerns-wacht";
  const parentHref = "../Grafschaft%20Celtigerns%20Wacht.html";

  const familySections = Object.freeze([
    data.familySection("Häuser Aberllans und Oileans", [
      data.family("Garrael", {
        familyId: "haus-garrael",
        imageSrc: "/Stammbäume/assets/images/houses/Camruisge/haus-garrael.png",
        seat: "Aberllan",
        liege: "Draig",
      }),
      data.family("Salach", {
        seat: "Oilean",
        liege: "Tír na Sleagh",
        linked: false,
      }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    data.personGroup("Obrigkeit der Diarchie", [
      data.person("Lehenswart Aberllans", "Lyonnel Garrael", {
        imageSrc: "/Stammbäume/assets/images/portraits/haus-garrael/lyonnel-garrael.jpg",
        familyId: "haus-garrael",
        seat: "Aberllan",
      }),
      data.person("Triath von Oilean", "...", { seat: "Oilean" }),
    ]),
    data.personGroup("Ämter Aberllans", [
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
    ]),
    data.personGroup("Ämter Oileans", [
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
      data.person("Amtsträger", "..."),
    ]),
  ]);

  const vassalGroups = Object.freeze([
    data.personGroup("Untertanen und Bürger", [
      data.person("Hofherr", "...", { seat: "Aberllan" }),
      data.person("Hofherr", "...", { seat: "Aberllan" }),
      data.person("Hofherr", "...", { seat: "Oilean" }),
      data.person("Hofherr", "...", { seat: "Oilean" }),
    ]),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte von Camruisge",
      imageSrc: mapImage,
      imageAlt: "Karte von Celtigerns Wacht mit der Insel Camruisge",
      href: mapHref,
    }),
    domain: Object.freeze({
      title: "Diarchie von Camruisge",
      center: "Aberllan und Oilean",
      crestSrc: banner,
      crestAlt: "Banner der Insel Camruisge",
      sections: Object.freeze([
        Object.freeze({
          title: "Nördliche Orte",
          places: Object.freeze([
            data.place("Aberllan", "Stadt", "Stadt.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
          ]),
        }),
        Object.freeze({
          title: "Südliche Orte",
          places: Object.freeze([
            data.place("Oilean", "Stadt", "Stadt.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
            data.place("Bauernhof der ...", "Bauernhof", "Bauernsiedlung.png"),
          ]),
        }),
        Object.freeze({
          title: "Sonstige Orte",
          places: Object.freeze([
            data.place("...", "...", "Beliebig.png"),
            data.place("...", "...", "Beliebig.png"),
            data.place("...", "...", "Beliebig.png"),
            data.place("...", "...", "Beliebig.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "insel-camruisge",
      title: "Insel Camruisge - Aleria",
      type: "Diarchie",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Insel Camruisge",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Insel Camruisge",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Region", name: "Camruisge", slug: "camruisge" },
    ],
    view: {
      familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration: data.administration(),
      geography,
      article: {
        id: "insel-camruisge",
        title: "Insel Camruisge – Aberllan und Oilean",
        shortTitle: "Insel Camruisge",
        crestSrc: banner,
        crestAlt: "Banner der Insel Camruisge",
        kicker: "Zwei Ufer, ein gemeinsames Eiland",
        parentHref,
        parentLabel: "Celtigerns Wacht",
        map: {
          imageSrc: mapImage,
          imageAlt: "Karte von Celtigerns Wacht",
          href: mapHref,
        },
        infobox: [
          { title: "Allgemein", rows: [
            { label: "Name", value: "Insel Camruisge" },
            { label: "Typ", value: "Diarchie" },
            { label: "Lehenswart", value: "Lyonnel Garrael", href: `${familyTreePage}?family=haus-garrael&mode=view` },
            { label: "Triath", value: "..." },
            { label: "Hauptorte", value: "Aberllan und Oilean" },
            { label: "Lehnsherren", value: "Celtigerns Wacht und Tír na Sleagh" },
          ] },
          { title: "Geographie", rows: [
            { label: "Region", value: "Königreich Cenyr und Fürstentum Leitheach" },
            { label: "Klima", value: "Mild und windig" },
            { label: "Fauna", value: "..." },
            { label: "Flora", value: "..." },
          ] },
          { title: "Kultur", rows: [
            { label: "Volksgruppen", value: "Cenyri und Alben" },
            { label: "Religion", value: "Alerische Kirche" },
            { label: "Bevölkerungsdichte", value: "Mittel" },
          ] },
          { title: "Handel", rows: [
            { label: "Ressourcen", value: "..." },
            { label: "Handelspartner", value: "Celtigerns Wacht und Tír na Sleagh" },
          ] },
        ],
        copy: {
          overview: [
            "Camruisge ist ein kleines, strategisch bedeutsames Eiland zwischen dem Königreich Cenyr im Norden und dem Fürstentum Leitheach im Süden. Sein markantestes Merkmal ist der zentrale, kreuzförmige Flusslauf, der der Insel ihren Namen gab und die natürliche Grenze zwischen beiden Einflusssphären bildet.",
            "Der Norden untersteht der administrativen Gewalt der Grafschaft Celtigerns Wacht. Der größere Südteil steht unter der Oberherrschaft Leitheachs und wird durch Tír na Sleagh vertreten. Beide Mächte verwalten die Insel in einer außergewöhnlichen freundschaftlichen Vereinbarung.",
          ],
          history: [
            "Die Teilung Camruisges beruht auf einem Vertrag, der noch zu Zeiten des Albenfürstentums Oseneach mit dem Fürstentum Leitheach geschlossen wurde. Als Oseneach niederging und das Königreich Cenyr auf dessen Trümmern entstand, entstand ein Machtvakuum.",
            "Obwohl Leitheach die nördliche Hälfte der Insel hätte beanspruchen können, entschied man sich gegen eine Expansion. Stattdessen bewahrten beide Seiten den alten Status quo und setzten auf Diplomatie und Kontinuität. Camruisge wurde so zu einem seltenen Symbol der Stabilität in einer oft zerstrittenen Region.",
          ],
          culture: [
            "Die Identität Camruisges ist untrennbar mit dem kreuzförmigen Flusslauf und der friedlichen Teilung der Insel verbunden. Während Celtigerns Wacht den Norden und Tír na Sleagh den Süden verwalten, überwindet die Bevölkerung die politische Grenze durch eine tief verwurzelte Freundschaft.",
            "Albisches Erbe und cenyrsche Tradition verbinden sich zu einer gemeinsamen Inselkultur. Vertrauen, grenzüberschreitender Handel und gelebte Toleranz prägen den Alltag stärker als die formalen Grenzen der beiden Herrschaften.",
          ],
          economy: ["..."],
          defense: ["..."],
          geography: ["Der kreuzförmige Flusslauf trennt Aberllan im Nordosten von Oilean im Südwesten und verbindet zugleich die Wege beider Inselhälften."],
          flora: ["..."],
          trivia: ["..."],
        },
      },
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
