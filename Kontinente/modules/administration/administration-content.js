(function () {
  "use strict";

  const sourceRoot = "/Kontinente/modules/administration/content";

  const areas = [
    ["militaer", "Militär", "militaer.html", "command"],
    ["klerus", "Klerus", "klerus.html", "faith"],
    ["gerichtsbarkeit", "Gerichtsbarkeit", "gerichtsbarkeit.html", "justice"],
    ["finanzen", "Finanzen", "finanzen.html", "money"],
    ["spionage", "Spionage", "spionage.html", "secrecy"],
    ["diplomatie", "Diplomatie", "diplomatie.html", "diplomacy"],
    ["magie", "Magie", "magie.html", "arcane"],
    ["unterhaltung", "Unterhaltung", "unterhaltung.html", "music"],
  ].map(([id, name, file, icon]) => Object.freeze({
    id, name, file, imageSrc: `/shared/cenyr-administration/assets/icons/${icon}.webp`,
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
