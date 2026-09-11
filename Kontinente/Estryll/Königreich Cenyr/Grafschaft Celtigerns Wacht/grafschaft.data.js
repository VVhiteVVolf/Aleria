(function () {
  "use strict";

  const familyTreePage = "/Stammbäume/Stammbaum.html";
  const housePage = "/Familien%20H%C3%A4user%20und%20Clans/";
  const houseImageRoot = "/Stammbäume/assets/images/houses";

  function family(id, name, emblem, options = {}) {
    return Object.freeze({
      id,
      name,
      imageSrc: `${houseImageRoot}/${emblem}`,
      imageAlt: `Wappen Haus ${name}`,
      href: `${housePage}${options.page || "kleinehaeuser.html"}?haus=${encodeURIComponent(id)}`,
      seat: options.seat || "",
      liege: options.liege || "",
      rank: options.rank || "",
      featured: options.featured === true,
      featuredLabel: options.featuredLabel || "",
    });
  }

  function familySection(title, cards, variant = "") {
    return Object.freeze({ title, variant, cards: Object.freeze(cards) });
  }

  // Grafschaft: große Häuser, Llamreis Ankunft und die ausdrücklich gewünschten alten Clans.
  // Weitere Vasallen gehören auf ihre jeweilige Herrschaftsseite.
  const familySections = Object.freeze([
    familySection("Adelshäuser Celtigerns Wacht", [
      family("haus-draig", "Draig", "Llamreis Ankunft/haus-draig.png", { seat: "Gwynthor", liege: "Haus Pendrag", featured: true, featuredLabel: "Grafenhaus", page: "haus.html" }),
      family("haus-gafyr", "Gafyr", "Llamreis Ankunft/haus-gafyr.png", { seat: "Gwynthor", liege: "Haus Draig", page: "haus.html" }),
      family("haus-wyrm", "Wyrm", "Llamreis Ankunft/haus-wyrm.png", { seat: "Gwynthor", liege: "Haus Draig", page: "haus.html" }),
      family("haus-saethwyr", "Saethwyr", "Llamreis Ankunft/haus-saethwyr.png", { seat: "Gwynthor", liege: "Haus Draig", page: "haus.html" }),
      family("haus-gwefrydd", "Gwefrydd", "Artus Streben/haus-gwefrydd.png", { seat: "Rhosmere", liege: "Haus Draig", page: "haus.html" }),
      family("haus-gwyvern", "Gwyvern", "Gwendolyns Ufer/haus-gwyvern.png", { seat: "Abergwint", liege: "Haus Draig", page: "haus.html" }),
      family("haus-arwydd", "Arwydd", "Rhonwens Tränen/haus-arwydd.png", { seat: "Castellbryn", liege: "Haus Draig", page: "haus.html" }),
    ]),
    familySection("Ritterhäuser · Llamreis Ankunft", [
      family("haus-tlawd", "Tlawd", "Llamreis Ankunft/haus-tlawd.png", { seat: "Gwynthor", liege: "Gafyr" }),
      family("haus-rhyddid", "Rhyddid", "Llamreis Ankunft/haus-rhyddid.png", { seat: "Gwynthor, Mwyncraig", liege: "Wyrm" }),
      family("haus-gelyn", "Gelyn", "Llamreis Ankunft/haus-gelyn.png", { seat: "Gwynthor, Gwynthstorm", liege: "Draig" }),
      family("haus-cludwyr", "Cludwyr", "Llamreis Ankunft/haus-cludwyr.png", { seat: "Gwynthor, Bronhir", liege: "Wyrm" }),
      family("haus-chwedlonol", "Chwedonol", "Llamreis Ankunft/haus-chwedlonol.png", { seat: "Gwynthor, Glastraeth", liege: "Saethwyr" }),
      family("haus-balchder", "Balchder", "Llamreis Ankunft/haus-balchder.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-eneiniog", "Eneiniog", "Llamreis Ankunft/haus-eneiniog.png", { seat: "Gwynthor", liege: "Saethwyr" }),
      family("haus-gostyn", "Gostyn", "Llamreis Ankunft/haus-gostyn.png", { seat: "Gwynthor, Bronfelen", liege: "Gafyr" }),
      family("haus-awenydd", "Awenydd", "Llamreis Ankunft/haus-awenydd.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-awenor", "Awenor", "Llamreis Ankunft/haus-awenor.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-loer", "Loer", "Llamreis Ankunft/haus-loer.png", { seat: "Gwynthor, Craithglyn", liege: "Wyrm" }),
      family("haus-dubhan-gwynthor", "Dubhan", "Llamreis Ankunft/haus-dubhan-gwynthor.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-bleiddorn", "Bleiddorn", "Llamreis Ankunft/haus-bleiddorn.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-cymrath-o-traethlan", "Cymrath O'Traethlan", "Llamreis Ankunft/haus-cymrath-o-traethlan.png", { seat: "Tŵr Traethlan", liege: "Draig" }),
    ]),
    familySection("Bürgerliche Häuser · Llamreis Ankunft", [
      family("haus-bradrhith", "Bradrhith", "Llamreis Ankunft/Bürgerliche/Gwynthor/Bradrhith.png", {"seat": "Bradrhith Hof", "liege": "Awenydd"}),
      family("haus-gwyllach", "Gwyllach", "Llamreis Ankunft/haus-gwyllach.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-sgrechiwr", "Sgrechiwr", "Llamreis Ankunft/haus-sgrechiwr.png", { seat: "Lynthor", liege: "Draig" }),
      family("haus-draenmelyn", "Draenmelyn", "Llamreis Ankunft/Bürgerliche/Gwynthor/Draenmelyn.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-pendrwn", "Pendrwn", "Llamreis Ankunft/Bürgerliche/Gwynthor/Pendrwn.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-swyll", "Swyll", "Llamreis Ankunft/Bürgerliche/Gwynthor/Swyll.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-aelmor", "Aelmor", "Llamreis Ankunft/Bürgerliche/Gwynthor/Aelmor.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-maerllys", "Maerllys", "Llamreis Ankunft/Bürgerliche/Gwynthor/Maerllys.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-braglas", "Braglas", "Llamreis Ankunft/Bürgerliche/Gwynthor/Braglas.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-tonnarth", "Tonnarth", "Llamreis Ankunft/Bürgerliche/Gwynthor/Tonnarth.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-ysgrif", "Ysgrif", "Llamreis Ankunft/Bürgerliche/Gwynthor/Ysgrif.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-falchdyn", "Falchdyn", "Llamreis Ankunft/Bürgerliche/Gwynthor/Falchdyn.png", { seat: "Gwynthor", liege: "Draig" }),
      family("haus-argall", "Argall", "Llamreis Ankunft/Bürgerliche/Llysfaen/Argall.png", { seat: "Llysfaen", liege: "Wyrm" }),
    ]),
    familySection("Ausgestorbene Häuser", [
      family("haus-ard-conbhron", "Ard Conbhrón", "Antike Crannath Clans/haus-ard-conbhron.png", { seat: "Lycath", page: "haus.html" }),
      family("haus-illysywen", "Illysywen", "Rhonwens Tränen/haus-illysywen.png", { seat: "Castellbryn", page: "haus.html" }),
      family("haus-ui-talamh", "Ui Talamh", "Antike Crannath Clans/haus-ui-talamh.png", { seat: "Antikes Gwynthor", page: "haus.html" }),
    ], "extinct"),
  ]);

  window.KONTINENTE_DATA = {
    meta: {
      id: "grafschaft-celtigerns-wacht",
      title: "Grafschaft Celtigerns Wacht - Gwyl Celtigern - Aleria",
      type: "Grafschaft",
      status: "Entwurf",
      template: "grafschaft",
    },
    name: "Grafschaft Celtigerns Wacht",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
    ],
    view: {
      familySections,
      portraitFamilyIds: {
        Arwydd: "haus-arwydd",
        Draig: "haus-draig",
        Gafyr: "haus-gafyr",
        Gwefrydd: "haus-gwefrydd",
        Gwyllach: "haus-gwyllach",
        Gwyvern: "haus-gwyvern",
        Saethwyr: "haus-saethwyr",
        Wyrm: "haus-wyrm",
      },
      portraitImages: {
        "Meurig Draig": "/Stammbäume/assets/images/portraits/haus-draig/meurig-draig.jpg",
        "Vakant": "/Stammbäume/assets/images/placeholders/male.png",
      },
      mapHref: "/Karten/karte.html?map=cenyr-celtigerns-wacht",
      familyTreePage,
      defaultTownIcon: "/IconOrdner/Welt%20Pins/Stadt.png",
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
