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

  function sourcesAt(root) {
    return Object.freeze(Object.fromEntries(
      areas.map((area) => [area.id, `${root}/${area.file}`]),
    ));
  }

  // Each lordship is mapped to its own source directory. Unmapped domains
  // deliberately resolve to no source so structures cannot leak between them.
  const sourcesByScope = Object.freeze({
    "grafschaft-celtigerns-wacht": sourcesAt(sourceRoot),
    "baronie-gwendolyns-ufer": sourcesAt(`${sourceRoot}/gwendolyns-ufer`),
  });

  function sourceFor(scopeId, areaId) {
    return sourcesByScope[String(scopeId || "").trim()]?.[String(areaId || "").trim()] || "";
  }

  window.ALERIA_ADMINISTRATION_CONTENT = Object.freeze({
    areas: Object.freeze(areas),
    sourceFor,
  });
})();
