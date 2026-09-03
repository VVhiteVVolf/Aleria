(function () {
  "use strict";

  const countyRoot = "/Kontinente/Estryll/Königreich Cenyr/Grafschaft Celtigerns Wacht";
  const blankDataPath = "data/celtigerns-wacht-place.data.js";
  const llamreisMappedDataPath = "data/llamreis-mapped-place.data.js?v=llamreis-maps-20260902a";
  const abergwintDataPath = "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Gwendolyns_Ufer/Abergwints_Bannkreis/Abergwint/ort.data.js?v=abergwint-content-20260903a";
  const castellbrynDataPath = "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Herrschaft_Rhonwens_Traenen/Castellbryns_Bannkreis/Castellbryn/ort.data.js?v=castellbryn-preparation-20260902a";
  const rhosmereDataPath = "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Arthus_Streben/Rhosmeres_Bannkreis/Rhosmere/ort.data.js?v=rhosmere-preparation-20260902a";

  const domainHeraldryByName = Object.freeze({
    "celtigerns-wacht": heraldryPath("regions", "celtigerns-wacht"),
    "arthus-streben": heraldryPath("regions", "artus-streben"),
    "gwendolyns-ufer": heraldryPath("regions", "gwendolyns-ufer"),
    "herrschaft-der-gafyr": heraldryPath("houses", "Llamreis Ankunft", "haus-gafyr"),
    "herrschaft-der-saethwyr": heraldryPath("houses", "Llamreis Ankunft", "haus-saethwyr"),
    "herrschaft-der-wyrm": heraldryPath("houses", "Llamreis Ankunft", "haus-wyrm"),
    "rhonwens-tranen": heraldryPath("regions", "rhonwens-traenen"),
    camruisge: heraldryPath("regions", "camruisge")
  });

  const placeHeraldryById = Object.freeze({
    gwynthor: heraldryPath("regions", "gwynthor"),
    rhosmere: heraldryPath("regions", "rhosmere"),
    abergwint: heraldryPath("regions", "abergwint"),
    aberllan: settlementHeraldryPath("Camruisge", "Aberllan"),
    castellbryn: heraldryPath("regions", "castellbryn"),

    "tan-maelfa": settlementHeraldryPath("Llamreis Ankunft", "Tan Maelfa"),
    lynthor: settlementHeraldryPath("Llamreis Ankunft", "Lynthor"),
    "cor-ffynnonfaen": settlementHeraldryPath("Llamreis Ankunft", "Côr Ffynnonfaen"),
    mwynfaen: settlementHeraldryPath("Llamreis Ankunft", "Mwynfaen"),
    carregdrag: settlementHeraldryPath("Llamreis Ankunft", "Carregdrag"),
    "twr-gwyntstorm": settlementHeraldryPath("Llamreis Ankunft", "Tŵr Gwyntstorm"),
    "twr-rhewgorn": settlementHeraldryPath("Llamreis Ankunft", "Tŵr Rhewgorn"),

    "twr-morlan": settlementHeraldryPath("Gwendolyns Ufer", "Twr Morlan"),
    "castell-rhewglyn": settlementHeraldryPath("Gwendolyns Ufer", "Castell Rhewglyn"),
    lysbryn: settlementHeraldryPath("Gwendolyns Ufer", "Lysbryn"),
    garwfaen: settlementHeraldryPath("Gwendolyns Ufer", "Garwfaen"),
    morcarryn: settlementHeraldryPath("Gwendolyns Ufer", "Morcarryn"),
    traethfael: settlementHeraldryPath("Gwendolyns Ufer", "Treathfael"),
    glasdraeth: settlementHeraldryPath("Gwendolyns Ufer", "Glasdraith"),
    traethgorn: settlementHeraldryPath("Gwendolyns Ufer", "Treathgorn"),
    "cor-mynyddfaen": settlementHeraldryPath("Gwendolyns Ufer", "Côr Mynyddfaen"),
    mwyncarw: settlementHeraldryPath("Gwendolyns Ufer", "Mwyncarw"),
    carregmawr: settlementHeraldryPath("Gwendolyns Ufer", "Carregmawr"),
    craithfael: settlementHeraldryPath("Gwendolyns Ufer", "Craithfael"),
    morddyn: settlementHeraldryPath("Gwendolyns Ufer", "Morddyn"),

    morddwr: settlementHeraldryPath("Llamreis Ankunft", "Morddwr"),
    gwaulwyn: settlementHeraldryPath("Llamreis Ankunft", "Gwaulwyn"),
    bronfelen: settlementHeraldryPath("Llamreis Ankunft", "Bronfelen"),
    mwyncairn: settlementHeraldryPath("Llamreis Ankunft", "Mwyncairn"),
    carregfael: settlementHeraldryPath("Llamreis Ankunft", "Carregfael"),

    "twr-gwaunhir": settlementHeraldryPath("Llamreis Ankunft", "Tŵr Gwaunhir"),
    morfaen: settlementHeraldryPath("Llamreis Ankunft", "Morfaen"),
    glastraeth: settlementHeraldryPath("Llamreis Ankunft", "Glastraeth"),
    llysfael: settlementHeraldryPath("Llamreis Ankunft", "Llysfael"),
    craithllyn: settlementHeraldryPath("Llamreis Ankunft", "Craithllyn"),

    "twr-brynmawr": settlementHeraldryPath("Llamreis Ankunft", "Brynmawr"),
    mwyncreig: settlementHeraldryPath("Llamreis Ankunft", "Mwyncreig"),
    craithglyn: settlementHeraldryPath("Llamreis Ankunft", "Craithglyn"),
    lysfaen: settlementHeraldryPath("Llamreis Ankunft", "Llysfaen"),
    bronhir: settlementHeraldryPath("Llamreis Ankunft", "Bronhir")
  });

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
      heraldry: domainHeraldryByName["celtigerns-wacht"],
      hierarchy: baseHierarchy
    }),
    arthus: domain("Arthus Streben", "Baronie", domainPage("Baronie Arthus Streben"), "Haus Gwefrydd"),
    gwendolyn: domain("Gwendolyns Ufer", "Baronie", domainPage("Baronie Gwendolyns Ufer"), "Haus Gwyvern"),
    gafyr: domain("Herrschaft der Gafyr", "Herrschaft", domainPage("Herrschaft der Gafyr"), "Haus Gafyr"),
    saethwyr: domain("Herrschaft der Saethwyr", "Herrschaft", domainPage("Herrschaft der Saethwyr"), "Haus Saethwyr"),
    wyrm: domain("Herrschaft der Wyrm", "Herrschaft", domainPage("Herrschaft der Wyrm"), "Haus Wyrm", [
      { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" }
    ]),
    rhonwen: domain("Rhonwens Tränen", "Herrschaft", domainPage("Herrschaft Rhonwens Tränen"), "Haus Arwydd"),
    camruisge: domain("Camruisge", "Region", domainPage("Insel Camruisge"), "Gwyl Celtigern")
  });

  const definitions = Object.freeze([
    define("gwynthor", "Gwynthor", "Großstadt", "county", {
      featured: true,
      dataPath: "Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js?v=gwynthor-content-20260903a",
      hierarchy: [
        ...baseHierarchy,
        { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
        { type: "Bannkreis", name: "Gwynthors Bannkreis", slug: "gwynthors-bannkreis" },
        { type: "Großstadt", name: "Gwynthor", slug: "gwynthor" }
      ]
    }),
    define("rhosmere", "Rhosmere", "Großstadt", "arthus", {
      featured: true,
      dataPath: rhosmereDataPath,
      hierarchy: [
        ...baseHierarchy,
        { type: "Baronie", name: "Arthus Streben", slug: "arthus-streben" },
        { type: "Bannkreis", name: "Rhosmere – Bannkreis", slug: "rhosmere-bannkreis" },
        { type: "Großstadt", name: "Rhosmere", slug: "rhosmere" }
      ]
    }),
    define("abergwint", "Abergwint", "Großstadt", "gwendolyn", {
      featured: true,
      dataPath: abergwintDataPath,
      hierarchy: [
        ...baseHierarchy,
        { type: "Baronie", name: "Gwendolyns Ufer", slug: "gwendolyns-ufer" },
        { type: "Bannkreis", name: "Abergwint – Bannkreis", slug: "abergwint-bannkreis" },
        { type: "Großstadt", name: "Abergwint", slug: "abergwint" }
      ]
    }),
    define("aberllan", "Aberllan", "Großstadt", "camruisge", { featured: true }),
    define("castellbryn", "Castellbryn", "Großstadt", "rhonwen", {
      featured: true,
      dataPath: castellbrynDataPath,
      hierarchy: [
        ...baseHierarchy,
        { type: "Herrschaft", name: "Rhonwens Tränen", slug: "rhonwens-traenen" },
        { type: "Bannkreis", name: "Castellbryn – Bannkreis", slug: "castellbryn-bannkreis" },
        { type: "Großstadt", name: "Castellbryn", slug: "castellbryn" }
      ]
    }),

    define("nyth-conraich", "Nyth Conraich", "Ruine", "county"),
    define("lycath", "Lycath", "Ruine", "county"),
    define("conbryn", "Conbryn", "Ruine", "county"),
    define("conmar", "Conmar", "Ruine", "county"),
    define("brawneth", "Brawneth", "Ruine", "county"),
    define("zum-roten-drachen", "Zum roten Drachen", "Taverne", "county"),
    define("tan-maelfa", "Tan Maelfa", "Abendschilde", "county"),
    define("twr-dragwyn", "Tŵr Dragwyn", "Arkanum von Avallorn", "county"),
    define("lynthor", "Lynthor", "Bewahrer von Avallorn", "county", mappedPlaceOptions("lynthor", "Lynthor", "Bewahrer von Avallorn")),
    define("fluesterspalt", "Flüsterspalt", "Höhle", "county"),
    define("wetterspalte", "Wetterspalte", "Höhle", "county"),
    define("perlentaucherin", "Perlentaucherin", "Schiffswrack", "county"),
    define("cor-ffynnonfaen", "Côr Ffynnonfaen", "Befestigte Siedlung", "county"),
    define("mwynfaen", "Mwynfaen", "Bergbausiedlung", "county"),
    define("carregdrag", "Carregdrag", "Bergbausiedlung", "county"),
    define("twr-gwyntstorm", "Tŵr Gwyntstorm", "Turm", "county"),
    define("twr-rhewgorn", "Tŵr Rhewgorn", "Turm", "county", mappedPlaceOptions("twr-rhewgorn", "Tŵr Rhewgorn", "Turm")),

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
    define("bernsteingrotte", "Bernsteingrotte", "Höhle", "arthus"),
    define("blutfels", "Blutfels", "Höhle", "arthus"),
    define("nebelgrotte", "Nebelgrotte", "Höhle", "arthus"),
    define("broncelyn", "Broncelyn", "Rhosmeres Rösser", "arthus"),
    define("maesglann", "Maesglann", "Rhosmeres Rösser", "arthus"),
    define("turnierplatz", "Turnierplatz", "Turnierfeld", "arthus"),
    define("turnierfeld", "Turnierfeld", "Turnierplatz", "arthus"),

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
    define("feuerstollen", "Feuerstollen", "Höhle", "gwendolyn"),
    define("kompassrose", "Kompassrose", "Schiffswrack", "gwendolyn"),
    define("schwarzer-rumpf", "Schwarzer Rumpf", "Schiffswrack", "gwendolyn"),
    define("sirenentraene", "Sirenenträne", "Schiffswrack", "gwendolyn"),
    define("der-rostige-haken", "Der rostige Haken", "Taverne", "gwendolyn"),
    define("morddyn", "Morddyn", "Hafen", "gwendolyn"),

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
    define("mwyncreig", "Mwyncreig", "Bergbausiedlung", "wyrm", mappedPlaceOptions("mwyncreig", "Mwyncreig", "Bergbausiedlung", true)),
    define("craithglyn", "Craithglyn", "Bergbausiedlung", "wyrm"),
    define("lysfaen", "Llysfaen", "Bauernsiedlung", "wyrm", mappedPlaceOptions("llysfaen", "Llysfaen", "Bauernsiedlung", true)),
    define("bronhir", "Bronhir", "Bauernsiedlung", "wyrm", mappedPlaceOptions("bronhir", "Bronhir", "Bauernsiedlung", true)),

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
    define("twr-dreathmor", "Tŵr Dreathmor", "Turm", "rhonwen"),
    define("schiffswrack", "Schiffswrack", "Wrack", "rhonwen"),
    define("achatorden", "Achatorden", "Orden", "rhonwen"),
    define("wellenschnitter", "Wellenschnitter", "Wahrzeichen", "rhonwen"),
    define("ath-fynach", "Ath Fynach", "Heiligtum", "rhonwen"),

    define("oilean", "Oilean", "Stadt", "camruisge")
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
      data: entry.dataPath || blankDataPath,
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
      heraldry: domainHeraldryByName[normalizeId(name)] || "",
      hierarchy: Object.freeze([
        ...baseHierarchy,
        ...extraHierarchy.map(freezeHierarchyItem),
        Object.freeze({ type, name, slug: normalizeId(name) })
      ])
    });
  }

  function define(id, name, placeType, domainId, options = {}) {
    const parent = domains[domainId];
    const images = Object.freeze({
      "icon-png": placeHeraldryById[id] || "",
      "wappen-banner-png": parent.heraldry || ""
    });
    return Object.freeze({
      id,
      name,
      placeType,
      featured: options.featured === true,
      dataPath: options.dataPath || "",
      domain: parent,
      parentHref: parent.pageHref,
      images,
      hierarchy: Object.freeze((options.hierarchy || [
        ...parent.hierarchy,
        { type: placeType, name, slug: id }
      ]).map(freezeHierarchyItem))
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
    const presentationOverrides = overrides.presentation || {};

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
      features: Object.freeze({ ...(overrides.features || {}) }),
      presentation: Object.freeze({
        motto: "...",
        heraldry: entry.images["icon-png"],
        banner: entry.images["wappen-banner-png"],
        map: "",
        ...presentationOverrides,
        images: Object.freeze({
          ...entry.images,
          ...(presentationOverrides.images || {})
        })
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

  function mappedPlaceOptions(id, name, placeType, underWyrm = false) {
    return {
      dataPath: llamreisMappedDataPath,
      hierarchy: [
        ...baseHierarchy,
        { type: "Baronie", name: "Llamreis Ankunft", slug: "llamreis-ankunft" },
        ...(underWyrm ? [{ type: "Herrschaft", name: "Herrschaft der Wyrm", slug: "herrschaft-der-wyrm" }] : []),
        { type: "Bannkreis", name: `${name} – Bannkreis`, slug: `${id}-bannkreis` },
        { type: placeType, name, slug: id }
      ]
    };
  }

  function freezeHierarchyItem(item) {
    return Object.freeze({ ...item });
  }

  function heraldryPath(...segments) {
    return encodeURI(`/Stammbäume/assets/images/${segments.join("/")}.png`);
  }

  function settlementHeraldryPath(domainName, placeName) {
    return heraldryPath("regions", "Cenyr", "Celtigerns Wacht", domainName, placeName);
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
