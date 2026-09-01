(function () {
  "use strict";

  const familyTreePage = "/Stammbäume/Stammbaum.html";
  const houseImageRoot = "/Stammbäume/assets/images/houses/Gwendolyns Ufer";
  const portraitRoot = "/Stammbäume/assets/images/portraits";
  const placeIconRoot = "/IconOrdner/Welt%20Pins";

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

  function familySection(title, cards) {
    return Object.freeze({ title, cards: Object.freeze(cards) });
  }

  function person(office, name, imageSrc, options = {}) {
    return Object.freeze({
      office,
      name,
      imageSrc,
      imageAlt: options.imageAlt || (name ? `Porträt von ${name}` : "Unbesetztes Amt"),
      familyId: options.familyId || "",
      seat: options.seat || "",
      note: options.note || "",
      featured: options.featured === true,
    });
  }

  function place(name, type, icon) {
    return Object.freeze({
      name,
      type,
      iconSrc: `${placeIconRoot}/${icon}`,
      iconAlt: `${type}: ${name}`,
      href: window.ALERIA_CELTIGERNS_PLACES?.hrefFor(name) || "",
    });
  }

  const familySections = Object.freeze([
    familySection("Adelshaus", [
      family("haus-gwyvern", "Gwyvern", "haus-gwyvern.png", {
        seat: "Abergwint",
        liege: "Draig",
        featured: true,
      }),
    ]),
    familySection("Feudale Ritterhäuser", [
      family("haus-rhuddgar", "Rhuddgar", "Ritterliche/Rhuddgar.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-gwyntog", "Gwyntog", "Ritterliche/Gwyntog.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-trydar", "Trydar", "Ritterliche/Trydar.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-taranvyr", "Taranvyr", "Ritterliche/Taranvyr.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-selog", "Selog", "Ritterliche/Selog.png", { seat: "Abergwint, Burg am Feuerstollen", liege: "Gwyvern" }),
      family("haus-penwyn", "Penwyn", "Ritterliche/Penwyn.png", { seat: "Morddyn", liege: "Draig" }),
      family("haus-annwyl", "Annwyl", "Ritterliche/Annwyl.png", { seat: "Côr Mynyddfaen", liege: "Gwyvern" }),
      family("haus-seldryn", "Seldryn", "Ritterliche/Seldryn.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-cysgodion", "Cysgodion", "Ritterliche/Cysgodion.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-edmy", "Edmy", "Ritterliche/Edmy.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-tawelgar", "Tawelgar", "Ritterliche/Tawelgar.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-ymladd", "Ymladd", "Ritterliche/Ymladd.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-daran", "Daran", "Ritterliche/Daran.png", { seat: "Garwfaen", liege: "Gwyvern" }),
      family("haus-cenfig", "Cenfig", "Ritterliche/Cenfig.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-barus", "Barus", "Ritterliche/Barus.png", { seat: "Abergwint", liege: "Gwyvern" }),
    ]),
    familySection("Bürgerliche Häuser", [
      family("haus-caerthwyn", "Caerthwyn", "Bürgerliche/Caerthwyn.png", { seat: "Abergwint", liege: "Gwyvern" }),
      family("haus-caerlaen", "Caerlaen", "Bürgerliche/Caerlaen.png", { seat: "Abergwint", liege: "Gwyvern" }),
    ]),
  ]);

  const councilGroups = Object.freeze([
    Object.freeze({
      title: "Baron",
      members: Object.freeze([
        person("Baron von Gwendolyns Ufer", "Mervyn Gwyvern", `${portraitRoot}/haus-gwyvern/mervyn-gwyvern.jpg`, {
          familyId: "haus-gwyvern",
          seat: "Abergwint",
          featured: true,
        }),
      ]),
    }),
    Object.freeze({
      title: "Ratsämter",
      members: Object.freeze([
        person("Marschall des Barons", "Gwynnan Gwyvern", `${portraitRoot}/haus-arwydd/gwynnan-gwywern.jpg`, { familyId: "haus-gwyvern" }),
        person("Kämmerer des Barons", "Olwen Gwyvern", "https://64.media.tumblr.com/69616b8e034bfa486227434056a75e61/ba9bff75417640f7-6c/s1280x1920/4d324ea625deb68171d90699dfe59355f0daa5a5.pnj"),
        person("Justiziar des Barons", "Lleward Cenfig", `${portraitRoot}/haus-edmy/lleward-cenfig.png`, { familyId: "haus-cenfig" }),
        person("Schatten des Barons", "Gronw Cysgodion", `${portraitRoot}/haus-cysgodion/gronw-cysgodion.png`, { familyId: "haus-cysgodion" }),
        person("Herold des Barons", "Jeannae Gwyvern", "https://i.imgur.com/kCRKZhW.png"),
        person("Ratsmagier des Barons", "Ceridwen Lhuyd", "https://i.imgur.com/yTbQ4Mq.png"),
        person("Vikar des Barons", "Gwenydd Anghof", "https://i.imgur.com/yEiU1My.png"),
        person("Barde des Barons", "Jinell Harddwch", "https://i.imgur.com/YdNY8rx.png"),
      ]),
    }),
    Object.freeze({
      title: "Ritterfürst",
      members: Object.freeze([
        person("Ritterfürst", "Trevor Gwyvern", `${portraitRoot}/haus-gwyvern/trevor-gwyvern.jpg`, {
          familyId: "haus-gwyvern",
          seat: "Abergwint",
        }),
      ]),
    }),
  ]);

  const vassalGroups = Object.freeze([
    Object.freeze({
      title: "Vasallen und Amtsträger",
      members: Object.freeze([
        person("Oberin", "Gwenydd Anghof", "https://i.imgur.com/yEiU1My.png", { seat: "Côr Mynyddfaen" }),
        person("Lehenswart", "Rhon Taranvyr", `${portraitRoot}/haus-taranvyr/rhon-taranvyr.jpg`, { familyId: "haus-taranvyr", seat: "Glasdraeth" }),
        person("Kommandant", "Cadfan Trydar", `${portraitRoot}/haus-trydar/cadfan-trydar.png`, { familyId: "haus-trydar", seat: "Tŵr Morlan" }),
        person("Lehenswart", "Brendan Taranvyr", `${portraitRoot}/haus-taranvyr/brendan-taranvyr.jpg`, { familyId: "haus-taranvyr", seat: "Castell Rhewglyn" }),
        person("Bürgermeister", "...", "", { seat: "Lysbryn" }),
        person("Lehenswart", "Caderyn Rhuddgar", `${portraitRoot}/haus-rhuddgar/caderyn-rhuddgar.jpg`, { familyId: "haus-rhuddgar", seat: "Garwfaen" }),
        person("Bürgermeister", "...", "", { seat: "Morcarryn" }),
        person("Bürgermeister", "...", "", { seat: "Traethfael" }),
        person("Bürgermeister", "Rhunlas Llon", "https://i.imgur.com/cAfLe9b.png", { seat: "Traethgorn" }),
        person("Lehenswart", "...", "", { seat: "Mwyncarw" }),
        person("Lehenswart", "Pryce Trydar", `${portraitRoot}/haus-trydar/pryce-trydar.png`, { familyId: "haus-trydar", seat: "Carregmawr" }),
        person("Bürgermeister", "Iddon Haearn", "https://i.imgur.com/mqnDamN.png", { seat: "Craithfael" }),
      ]),
    }),
  ]);

  const administration = Object.freeze([
    Object.freeze({ name: "Militär", imageSrc: "https://i.imgur.com/yoEmXPZ.png" }),
    Object.freeze({ name: "Klerus", imageSrc: "https://i.imgur.com/t07EieX.png" }),
    Object.freeze({ name: "Gerichtsbarkeit", imageSrc: "https://i.imgur.com/cO12wlW.png" }),
    Object.freeze({ name: "Finanzen", imageSrc: "https://i.imgur.com/iayxFsH.png" }),
    Object.freeze({ name: "Spionage", imageSrc: "https://i.imgur.com/LSbWNQX.png" }),
    Object.freeze({ name: "Diplomatie", imageSrc: "https://i.imgur.com/5UnEDUu.png" }),
    Object.freeze({ name: "Magie", imageSrc: "https://i.imgur.com/oX1Wxm7.png" }),
    Object.freeze({ name: "Unterhaltung", imageSrc: "https://i.imgur.com/xZDD0aV.png" }),
  ]);

  const geography = Object.freeze({
    map: Object.freeze({
      title: "Karte der Baronie Gwendolyns Ufer",
      imageSrc: "/Kontinente/assets/images/celtigerns-wacht-map-preview.jpg",
      imageAlt: "Karte von Celtigerns Wacht mit Gwendolyns Ufer",
      href: "/Karten/Cenyr/celtigerns-wacht/CeltigernsWachtKarte.html",
    }),
    domain: Object.freeze({
      title: "Herrschaft des Hauses Gwyvern",
      center: "Abergwint",
      crestSrc: "https://i.imgur.com/gdUM3iC.png",
      crestAlt: "Banner der Baronie Gwendolyns Ufer",
      sections: Object.freeze([
        Object.freeze({
          title: "Siedlungen und Orte",
          places: Object.freeze([
            place("Abergwint", "Hauptstadt", "Stadt.png"),
            place("Tŵr Morlan", "Turm", "Turm.png"),
            place("Castell Rhewglyn", "Festung", "Festung.png"),
            place("Lysbryn", "Bauernsiedlung", "Bauernsiedlung.png"),
            place("Garwfaen", "Bauernsiedlung", "Bauernsiedlung (2).png"),
            place("Morcarryn", "Hafensiedlung", "Hafensiedlung.png"),
            place("Traethfael", "Hafensiedlung", "Hafensiedlung.png"),
            place("Glasdraeth", "Hafensiedlung", "Hafensiedlung.png"),
            place("Traethgorn", "Hafensiedlung", "Hafensiedlung.png"),
            place("Côr Mynyddfaen", "Klostersiedlung", "Klostersiedlung.png"),
            place("Mwyncarw", "Bergbausiedlung", "Bergbausiedlung.png"),
            place("Carregmawr", "Bergbausiedlung", "Bergbausiedlung.png"),
            place("Craithfael", "Bergbausiedlung", "Bergbausiedlung.png"),
          ]),
        }),
        Object.freeze({
          title: "Sonstige Orte",
          places: Object.freeze([
            place("Feuerstollen", "Höhle", "Höhle.png"),
            place("Kompassrose", "Schiffswrack", "SchiffswrackPin.png"),
            place("Schwarzer Rumpf", "Schiffswrack", "SchiffswrackPin.png"),
            place("Sirenenträne", "Schiffswrack", "SchiffswrackPin.png"),
            place("Der rostige Haken", "Taverne", "Taverne.png"),
          ]),
        }),
        Object.freeze({
          title: "Besondere Orte",
          places: Object.freeze([
            place("Morddyn", "Hafen", "Großer Hafen.png"),
          ]),
        }),
      ]),
    }),
  });

  window.KONTINENTE_DATA = {
    meta: {
      id: "baronie-gwendolyns-ufer",
      title: "Baronie Gwendolyns Ufer - Aleria",
      type: "Baronie",
      status: "Entwurf",
      template: "herrschaft",
    },
    name: "Baronie Gwendolyns Ufer",
    canonicalPath: "Kontinente > Estryll > Königreich Cenyr > Grafschaft Celtigerns Wacht > Baronie Gwendolyns Ufer",
    hierarchy: [
      { type: "Sammlung", name: "Kontinente", slug: "kontinente" },
      { type: "Kontinent", name: "Estryll", slug: "estryll" },
      { type: "Königreich", name: "Cenyr", slug: "cenyr" },
      { type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" },
      { type: "Baronie", name: "Gwendolyns Ufer", slug: "gwendolyns-ufer" },
    ],
    view: {
      familyTreePage,
      familySections,
      councilGroups,
      vassalGroups,
      administration,
      geography,
    },
  };

  window.ORT_DATA = window.KONTINENTE_DATA;
})();
