(function () {
  "use strict";

  const familyTreePage = "/Stammbäume/Stammbaum.html";
  const houseImageRoot = "/Stammbäume/assets/images/houses";

  function family(id, name, emblem, options = {}) {
    return Object.freeze({
      id,
      name,
      imageSrc: `${houseImageRoot}/${emblem}`,
      imageAlt: `Wappen Haus ${name}`,
      href: `${familyTreePage}?family=${encodeURIComponent(id)}&mode=view`,
      seat: options.seat || "",
      liege: options.liege || "",
      featured: options.featured === true,
    });
  }

  function familySection(title, cards, variant = "") {
    return Object.freeze({ title, variant, cards: Object.freeze(cards) });
  }

  const familySections = Object.freeze([
    familySection("Adelshäuser Celtigerns Wacht", [
      family("haus-draig", "Draig", "Llamreis Ankunft/haus-draig.png", { seat: "Gwynthor", featured: true }),
      family("haus-gafyr", "Gafyr", "Llamreis Ankunft/haus-gafyr.png", { seat: "Gwynthor" }),
      family("haus-wyrm", "Wyrm", "Llamreis Ankunft/haus-wyrm.png", { seat: "Gwynthor" }),
      family("haus-saethwyr", "Saethwyr", "Llamreis Ankunft/haus-saethwyr.png", { seat: "Gwynthor" }),
      family("haus-gwefrydd", "Gwefrydd", "Artus Streben/haus-gwefrydd.png", { seat: "Rhosmere" }),
      family("haus-gwyvern", "Gwyvern", "Gwendolyns Ufer/haus-gwyvern.png", { seat: "Abergwint" }),
      family("haus-arwydd", "Arwydd", "Rhonwens Tränen/haus-arwydd.png", { seat: "Castellbryn" }),
    ]),
    familySection("Ritterhäuser · Llamreis Ankunft", [
      family("haus-tlawd", "Tlawd", "Llamreis Ankunft/haus-tlawd.png", { seat: "Gwynthor", liege: "Gafyr" }),
      family("haus-von-hochreuth", "Von Hochreuth", "Goldmund/haus-von-hochreuth.png", { liege: "Gafyr" }),
      family("haus-rhyddid", "Rhyddid", "Llamreis Ankunft/haus-rhyddid.png", { seat: "Gwynthor, Mwyncraig", liege: "Wyrm" }),
      family("haus-gelyn", "Gelyn", "Llamreis Ankunft/haus-gelyn.png", { seat: "Gwynthor, Gwynthstorm", liege: "Draig" }),
      family("haus-cludwyr", "Cludwyr", "Llamreis Ankunft/haus-cludwyr.png", { seat: "Gwynthor, Bronhir", liege: "Wyrm" }),
      family("haus-chwedlonol", "Chwedlonol", "Llamreis Ankunft/haus-chwedlonol.png", { seat: "Gwynthor, Glastraeth", liege: "Saethwyr" }),
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
      family("haus-argall", "Argall", "Llamreis Ankunft/Bürgerliche/Llysfaen/Argall.png", { seat: "Llysfaen", liege: "Wyrm" }),
    ]),
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
        "Name unklar (Haus Draig)": "/Stammbäume/assets/images/placeholders/male.png",
      },
      mapHref: "/Karten/karte.html?map=cenyr-celtigerns-wacht",
      familyTreePage,
      defaultTownIcon: "/IconOrdner/Welt%20Pins/Stadt.png",
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
