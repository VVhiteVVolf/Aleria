(function () {
  "use strict";

  // Familienübersichten einschließlich ausgestorbener Häuser:
  // siehe Kontinente/HERRSCHAFTSSEITEN-VORGEHEN.md.

  const familyTreePage = "/Stammbäume/Stammbaum.html";

  function family(name, options = {}) {
    const familyId = options.familyId || "";
    return Object.freeze({
      id: familyId,
      name,
      imageSrc: options.imageSrc || "",
      imageAlt: options.imageAlt || `Wappen Haus ${name}`,
      href: familyId && options.linked !== false
        ? (options.housePage
          ? `/Familien%20H%C3%A4user%20und%20Clans/${options.housePage}?haus=${encodeURIComponent(familyId)}`
          : `${familyTreePage}?family=${encodeURIComponent(familyId)}&mode=view`)
        : "",
      seat: options.seat || "",
      liege: options.liege || "",
      rank: options.rank || "",
      featured: options.featured === true,
      featuredLabel: options.featuredLabel || "",
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
      href: window.ALERIA_CELTIGERNS_PLACES?.hrefFor(name) || "",
    });
  }

  function administration() {
    return Object.freeze([
      Object.freeze({ key: "militaer", name: "Militär" }),
      Object.freeze({ key: "klerus", name: "Klerus" }),
      Object.freeze({ key: "gerichtsbarkeit", name: "Gerichtsbarkeit" }),
      Object.freeze({ key: "finanzen", name: "Finanzen" }),
      Object.freeze({ key: "spionage", name: "Spionage" }),
      Object.freeze({ key: "diplomatie", name: "Diplomatie" }),
      Object.freeze({ key: "magie", name: "Magie" }),
      Object.freeze({ key: "unterhaltung", name: "Unterhaltung" }),
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
