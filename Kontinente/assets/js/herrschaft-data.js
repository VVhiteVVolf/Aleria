(function () {
  "use strict";

  const familyTreePage = "/Stammbäume/Stammbaum.html";

  function family(name, options = {}) {
    const familyId = options.familyId || "";
    return Object.freeze({
      id: familyId,
      name,
      imageSrc: options.imageSrc || "",
      imageAlt: options.imageAlt || `Wappen Haus ${name}`,
      href: familyId && options.linked !== false
        ? `${familyTreePage}?family=${encodeURIComponent(familyId)}&mode=view`
        : "",
      seat: options.seat || "",
      liege: options.liege || "",
      featured: options.featured === true,
    });
  }

  function familySection(title, cards, options = {}) {
    return Object.freeze({
      title,
      variant: options.variant || "",
      cards: Object.freeze(cards),
    });
  }

  function person(office, name, options = {}) {
    return Object.freeze({
      office,
      name,
      imageSrc: options.imageSrc || "",
      imageAlt: options.imageAlt || (name ? `Porträt von ${name}` : "Unbesetztes Amt"),
      familyId: options.familyId || "",
      seat: options.seat || "",
      note: options.note || "",
      featured: options.featured === true,
    });
  }

  function personGroup(title, members) {
    return Object.freeze({ title, members: Object.freeze(members) });
  }

  function place(name, type, iconFile) {
    return Object.freeze({
      name,
      type,
      iconSrc: `/IconOrdner/Welt%20Pins/${iconFile}`,
      iconAlt: `${type}: ${name}`,
    });
  }

  function administration() {
    return Object.freeze([
      Object.freeze({ key: "militaer", name: "Militär", imageSrc: "https://i.imgur.com/F9LJyWL.png" }),
      Object.freeze({ key: "klerus", name: "Klerus", imageSrc: "https://i.imgur.com/L8uSMda.png" }),
      Object.freeze({ key: "gerichtsbarkeit", name: "Gerichtsbarkeit", imageSrc: "https://i.imgur.com/kAjtrx1.png" }),
      Object.freeze({ key: "finanzen", name: "Finanzen", imageSrc: "https://i.imgur.com/Be2sUY9.png" }),
      Object.freeze({ key: "spionage", name: "Spionage", imageSrc: "https://i.imgur.com/R8uzl5B.png" }),
      Object.freeze({ key: "diplomatie", name: "Diplomatie", imageSrc: "https://i.imgur.com/VTYpitY.png" }),
      Object.freeze({ key: "magie", name: "Magie", imageSrc: "https://i.imgur.com/4lCe05E.png" }),
      Object.freeze({ key: "unterhaltung", name: "Unterhaltung", imageSrc: "https://i.imgur.com/xZDD0aV.png" }),
    ]);
  }

  window.ALERIA_HERRSCHAFT_DATA = Object.freeze({
    familyTreePage,
    family,
    familySection,
    person,
    personGroup,
    place,
    administration,
  });
})();
