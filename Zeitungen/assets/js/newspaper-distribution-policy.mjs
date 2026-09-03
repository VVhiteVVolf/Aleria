const MAJOR_CITY_POLICY = "major-cities";
const CAPITAL_CITY_POLICY = "capital-cities";
const ALL_SETTLEMENTS_POLICY = "all-settlements";
const REGIONAL_SETTLEMENTS_POLICY = "regional-settlements";

export const NEWSPAPER_DISTRIBUTION_POLICIES = Object.freeze({
  schwarzbote: policy({
    scope: "global",
    placement: ALL_SETTLEMENTS_POLICY,
    description: "Der Schwarzbote ist grundsätzlich an jedem ausgearbeiteten Ort als eigene Ausgabe vorgesehen."
  }),
  kronenspiegel: policy({
    scope: "kingdom",
    territoryId: "cenyr",
    placement: MAJOR_CITY_POLICY,
    contentModel: "shared-national-issue",
    description: "Der Kronenspiegel führt in allen großen Städten Cenyrs Druck- und Korrespondenzstandorte, veröffentlicht aber überall dieselbe cenyrweite Ausgabe."
  }),
  fluesterfaecher: policy({
    scope: "kingdom-prestige",
    territoryId: "cenyr",
    placement: CAPITAL_CITY_POLICY,
    contentModel: "local-edition",
    description: "Der Flüsterfächer erscheint ausschließlich in Cenyrs Haupt- und Grafenstädten; jede Stadt verantwortet eine eigenständige Lokalredaktion und Ausgabe."
  }),
  "celtigerns-echo": policy({
    scope: "county-local",
    territoryId: "celtigerns-wacht",
    placement: REGIONAL_SETTLEMENTS_POLICY,
    description: "Celtigerns Echo ist eine Lokalzeitung der Grafschaft Celtigerns Wacht und ihrer Orte."
  })
});

export function getNewspaperDistributionPolicy(titleId) {
  return NEWSPAPER_DISTRIBUTION_POLICIES[String(titleId || "").trim()] || null;
}

export function getRequiredNewspaperTitleIdsForPlace({
  kingdomId = "",
  countyId = "",
  isMajorCity = false,
  isCapitalCity = false
} = {}) {
  const required = ["schwarzbote"];
  if (normalizeId(countyId) === "celtigerns-wacht") required.push("celtigerns-echo");
  if (normalizeId(kingdomId) === "cenyr" && isMajorCity) required.push("kronenspiegel");
  if (normalizeId(kingdomId) === "cenyr" && isCapitalCity) required.push("fluesterfaecher");
  return Object.freeze(required);
}

function policy(value) {
  return Object.freeze({
    territoryId: "",
    contentModel: "local-edition",
    ...value
  });
}

function normalizeId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
