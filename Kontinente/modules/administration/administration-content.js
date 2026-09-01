(function () {
  "use strict";

  const sourceRoot = "/Kontinente/modules/administration/content";

  const areas = [
    ["militaer", "Militär", "militaer.html"],
    ["klerus", "Klerus", "klerus.html"],
    ["gerichtsbarkeit", "Gerichtsbarkeit", "gerichtsbarkeit.html"],
    ["finanzen", "Finanzen", "finanzen.html"],
    ["spionage", "Spionage", "spionage.html"],
    ["diplomatie", "Diplomatie", "diplomatie.html"],
    ["magie", "Magie", "magie.html"],
    ["unterhaltung", "Unterhaltung", "unterhaltung.html"],
  ].map(([id, name, file]) => Object.freeze({ id, name, source: `${sourceRoot}/${file}` }));

  window.ALERIA_ADMINISTRATION_CONTENT = Object.freeze({
    areas: Object.freeze(areas),
  });
})();
