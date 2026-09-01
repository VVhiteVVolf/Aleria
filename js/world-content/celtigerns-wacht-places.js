(function () {
  "use strict";

  const countyRoot = "/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht";
  const blankDataPath = "data/celtigerns-wacht-place.data.js";

  const baseHierarchy = Object.freeze([
    Object.freeze({ type: "Königreich", name: "Cenyr", slug: "cenyr" }),
    Object.freeze({ type: "Grafschaft", name: "Celtigerns Wacht", slug: "celtigerns-wacht" })
  ]);

  const domains = Object.freeze({
    county: Object.freeze({
      name: "Celtigerns Wacht",
      type: "Grafschaft",
      pageHref: countyPage(),
      liege: "Gwyl Celtigern",
      hierarchy: baseHierarchy
    }),
    arthus: domain("Arthus Streben", "Baronie", domainPage("Baronie Arthus Streben"), "Haus Gwefrydd"),
    gwendolyn: domain("Gwendolyns Ufer", "Baronie", domainPage("Baronie Gwendolyns Ufer"), "Haus Gwyvern"),
    gafyr: domain("Herrschaft der Gafyr", "Herrschaft", domainPage("Herrschaft der Gafyr"), "Haus Gafyr"),
    saethwyr: domain("Herrschaft der Saethwyr", "Herrschaft", domainPage("Herrschaft der Saethwyr"), "Haus Saethwyr"),
    wyrm: domain("Herrschaft der Wyrm", "Herrschaft", domainPage("Herrschaft der Wyrm"), "Haus Wyrm", [
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" }
    ]),
    rhonwen: domain("Rhonwens Tränen", "Herrschaft", domainPage("Herrschaft Rhonwens Tränen"), "Haus Awnydd"),
    camruisge: domain("Camruisge", "Region", domainPage("Insel Camruisge"), "Gwyl Celtigern")
  });

  const definitions = Object.freeze([
    define("gwynthor", "Gwynthor", "Großstadt", "county", { featured: true }),
    define("rhosmere", "Rhosmere", "Großstadt", "arthus", { featured: true }),
    define("abergwint", "Abergwint", "Großstadt", "gwendolyn", { featured: true }),
    define("aberllan", "Aberllan", "Großstadt", "camruisge", { featured: true }),
    define("castellbryn", "Castellbryn", "Großstadt", "rhonwen", { featured: true }),

    define("twr-coedlorn", "Tŵr Coedlorn", "Turm", "arthus"),
    define("llyswynfa", "Llyswynfa", "Siedlung", "arthus"),
    define("gwaulhir", "Gwaulhir", "Siedlung", "arthus"),
    define("ffyncairglyn", "Ffyncairglyn", "Waldsiedlung", "arthus"),
    define("braichwaun", "Braichwaun", "Waldsiedlung", "arthus"),
    define("ffynnonbrynn", "Ffynnonbrynn", "Waldsiedlung", "arthus"),
    define("caorthdar", "Caorthdar", "Waldsiedlung", "arthus"),
    define("cor-bronwen", "Côr Bronwen", "Befestigte Siedlung", "arthus"),
    define("cor-glasfaen", "Côr Glasfaen", "Befestigte Siedlung", "arthus"),
    define("nantaur", "Nantaur", "Bergbausiedlung", "arthus"),
    define("rhuddor", "Rhuddor", "Bergbausiedlung", "arthus"),
    define("castell-rhoswen", "Castell Rhoswen", "Burg", "arthus"),

    define("twr-morlan", "Tŵr Morlan", "Turm", "gwendolyn"),
    define("castell-rhewglyn", "Castell Rhewglyn", "Festung", "gwendolyn"),
    define("lysbryn", "Lysbryn", "Bauernsiedlung", "gwendolyn"),
    define("garwfaen", "Garwfaen", "Bauernsiedlung", "gwendolyn"),
    define("morcarryn", "Morcarryn", "Hafensiedlung", "gwendolyn"),
    define("traethfael", "Traethfael", "Hafensiedlung", "gwendolyn"),
    define("glasdraeth", "Glasdraeth", "Hafensiedlung", "gwendolyn"),
    define("traethgorn", "Traethgorn", "Hafensiedlung", "gwendolyn"),
    define("cor-mynyddfaen", "Côr Mynyddfaen", "Klostersiedlung", "gwendolyn"),
    define("mwyncarw", "Mwyncarw", "Bergbausiedlung", "gwendolyn"),
    define("carregmawr", "Carregmawr", "Bergbausiedlung", "gwendolyn"),
    define("craithfael", "Craithfael", "Bergbausiedlung", "gwendolyn"),

    define("morddwr", "Morddwr", "Hafensiedlung", "gafyr"),
    define("gwaulwyn", "Gwaulwyn", "Bauernsiedlung", "gafyr"),
    define("bronfelen", "Bronfelen", "Bauernsiedlung", "gafyr"),
    define("mwyncairn", "Mwyncairn", "Bergbausiedlung", "gafyr"),
    define("carregfael", "Carregfael", "Bergbausiedlung", "gafyr"),

    define("twr-gwaunhir", "Tŵr Gwaunhir", "Turm", "saethwyr"),
    define("morfaen", "Morfaen", "Hafensiedlung", "saethwyr"),
    define("glastraeth", "Glastraeth", "Hafensiedlung", "saethwyr"),
    define("llysfael", "Llysfael", "Bauernsiedlung", "saethwyr"),
    define("craithllyn", "Craithllyn", "Bergbausiedlung", "saethwyr"),

    define("twr-brynmawr", "Tŵr Brynmawr", "Turm", "wyrm"),
    define("mwyncreig", "Mwyncreig", "Bergbausiedlung", "wyrm"),
    define("craithglyn", "Craithglyn", "Bergbausiedlung", "wyrm"),
    define("lysfaen", "Llysfaen", "Bauernsiedlung", "wyrm"),
    define("bronhir", "Bronhir", "Bauernsiedlung", "wyrm"),

    define("tan-gwaelon", "Tân Gwaelon", "Hafensiedlung", "rhonwen"),
    define("morfael", "Morfael", "Siedlung", "rhonwen"),
    define("traethgwen", "Traethgwen", "Siedlung", "rhonwen"),
    define("glasfryn", "Glasfryn", "Siedlung", "rhonwen"),
    define("cor-llynfael", "Côr Llynfael", "Befestigte Siedlung", "rhonwen"),
    define("cor-erynddwyn", "Côr Erynddwyn", "Befestigte Siedlung", "rhonwen"),
    define("ffynnoncoed", "Ffynnoncoed", "Waldsiedlung", "rhonwen"),
    define("talheli", "Talheli", "Hafensiedlung", "rhonwen"),
    define("twr-bryncarw", "Tŵr Bryncarw", "Turm", "rhonwen"),
    define("twr-creigfryn", "Tŵr Creigfryn", "Turm", "rhonwen"),
    define("twr-gwaunfaen", "Tŵr Gwaunfaen", "Turm", "rhonwen"),
    define("twr-caerlan", "Tŵr Caerlan", "Turm", "rhonwen"),
    define("twr-tidemor", "Tŵr Tidemor", "Turm", "rhonwen"),
    define("twr-dreathmor", "Tŵr Dreathmor", "Turm", "rhonwen")
  ]);

  const placesById = new Map(definitions.map((entry) => [entry.id, entry]));
  const placesByName = new Map(definitions.map((entry) => [normalizeId(entry.name), entry]));

  const registryEntries = Object.freeze(definitions
    .filter((entry) => entry.id !== "lysfaen")
    .map((entry) => Object.freeze({
      id: entry.id,
      slug: entry.id,
      aliases: Object.freeze([normalizeId(entry.name)]),
      name: entry.name,
      status: "draft",
      type: normalizeId(entry.placeType),
      data: blankDataPath,
      hierarchy: entry.hierarchy,
      tags: Object.freeze([
        "orte",
        "celtigerns-wacht",
        normalizeId(entry.domain.name),
        normalizeId(entry.placeType),
        ...(entry.featured ? ["grossstadt"] : [])
      ])
    })));

  window.ALERIA_CELTIGERNS_PLACES = Object.freeze({
    definitions,
    registryEntries,
    find,
    hrefFor,
    createPlaceData
  });

  function domain(name, type, pageHref, liege, extraHierarchy = []) {
    return Object.freeze({
      name,
      type,
      pageHref,
      liege,
      hierarchy: Object.freeze([
        ...baseHierarchy,
        ...extraHierarchy.map(freezeHierarchyItem),
        Object.freeze({ type, name, slug: normalizeId(name) })
      ])
    });
  }

  function define(id, name, placeType, domainId, options = {}) {
    const parent = domains[domainId];
    return Object.freeze({
      id,
      name,
      placeType,
      featured: options.featured === true,
      domain: parent,
      parentHref: parent.pageHref,
      hierarchy: Object.freeze([
        ...parent.hierarchy,
        Object.freeze({ type: "Siedlung", name, slug: id })
      ])
    });
  }

  function find(nameOrId) {
    const normalized = normalizeId(nameOrId);
    return placesById.get(normalized) || placesByName.get(normalized) || null;
  }

  function hrefFor(nameOrId) {
    const entry = find(nameOrId);
    return entry ? `/Orte/grossstadt.html?id=${encodeURIComponent(entry.id)}` : "";
  }

  function createPlaceData(nameOrId, overrides = {}) {
    const entry = find(nameOrId);
    if (!entry) return null;

    return Object.freeze({
      meta: Object.freeze({
        id: entry.id,
        title: entry.name,
        type: entry.placeType,
        status: "Draft",
        template: "grossstadt",
        ...(overrides.meta || {})
      }),
      name: entry.name,
      canonicalPath: entry.hierarchy.map((item) => item.name).join(" / "),
      hierarchy: entry.hierarchy,
      parentage: Object.freeze({
        kingdom: "Cenyr",
        county: "Celtigerns Wacht",
        domain: entry.domain.name,
        settlement: entry.name,
        liege: entry.domain.liege,
        ...(overrides.parentage || {})
      }),
      navigation: Object.freeze({
        parentHref: entry.parentHref,
        parentLabel: entry.domain.name,
        ...(overrides.navigation || {})
      }),
      presentation: Object.freeze({
        motto: "...",
        heraldry: "",
        map: "",
        ...(overrides.presentation || {})
      }),
      sections: Object.freeze({ ...(overrides.sections || {}) })
    });
  }

  function countyPage() {
    return encodeURI(`${countyRoot}/Grafschaft Celtigerns Wacht.html`);
  }

  function domainPage(name) {
    return encodeURI(`${countyRoot}/${name}/${name}.html`);
  }

  function freezeHierarchyItem(item) {
    return Object.freeze({ ...item });
  }

  function normalizeId(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
})();
