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
  ].map(([id, name, file]) => Object.freeze({ id, name, file }));

  // The imported legacy documents describe Celtigerns Wacht only. Other
  // domains intentionally resolve to no source until their own structures
  // are authored; this prevents content leaking between lordships.
  const sourcesByScope = Object.freeze({
    "grafschaft-celtigerns-wacht": Object.freeze(Object.fromEntries(
      areas.map((area) => [area.id, `${sourceRoot}/${area.file}`]),
    )),
  });

  function sourceFor(scopeId, areaId) {
    return sourcesByScope[String(scopeId || "").trim()]?.[String(areaId || "").trim()] || "";
  }

  window.ALERIA_ADMINISTRATION_CONTENT = Object.freeze({
    areas: Object.freeze(areas),
    sourceFor,
  });
})();
