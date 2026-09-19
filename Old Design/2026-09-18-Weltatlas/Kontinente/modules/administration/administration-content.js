(function () {
  "use strict";

  const sourceRoot = "/Kontinente/modules/administration/content";

  const areas = [
    ["militaer", "Militär", "militaer.html", "Militär.png"],
    ["klerus", "Klerus", "klerus.html", "Klerus.png"],
    ["gerichtsbarkeit", "Gerichtsbarkeit", "gerichtsbarkeit.html", "Justiz.png"],
    ["finanzen", "Finanzen", "finanzen.html", "Administration.png"],
    ["spionage", "Spionage", "spionage.html", "Spionage.png"],
    ["diplomatie", "Diplomatie", "diplomatie.html", "Diplomatie.png"],
    ["magie", "Magie", "magie.html", "Magie.png"],
    ["unterhaltung", "Unterhaltung", "unterhaltung.html", "Unterhaltung.png"],
  ].map(([id, name, file, icon]) => Object.freeze({
    id, name, file, imageSrc: `/IconOrdner/Organisationsicons/${encodeURIComponent(icon)}`,
  }));

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
