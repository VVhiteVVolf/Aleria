(() => {
  const TAFEL_STATUS = Object.freeze({
    ACTIVE: "active",
    PLANNED: "planned",
    ARCHIVED: "archived",
  });

  const TAFEL_TYPES = Object.freeze({
    KINGDOM: "kingdom",
    COUNTY: "county",
    BARONY: "barony",
    LORDSHIP: "lordship",
    SETTLEMENT: "settlement",
    CITY: "city",
    LOCAL: "local",
  });

  const TAFELN = [
    {
      id: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
      title: "Anzeigetafel Morddyn",
      status: TAFEL_STATUS.ACTIVE,
      type: TAFEL_TYPES.CITY,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "gwendolyns-ufer", title: "Gwendolyns Ufer" },
        { level: "city", slug: "morddyn", title: "Morddyn" },
      ],
      folder: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn",
      config: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/tafel.config.js",
      images: {
        board: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/Bilder/MorddynTafel.png",
        marker: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/Bilder/MorddynTafelMarker.png",
      },
      dataPath: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/data.json",
      firebase: {
        collection: "anzeigetafeln",
        docId: "cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
        legacyImport: {
          collection: "tafel-v1",
          docId: "state",
          migrateIfEmpty: true,
        },
      },
      link: "tafel.html?tafel=cenyr-celtigerns-wacht-gwendolyns-ufer-morddyn",
      legacyLink: "Cenyr/celtigerns-wacht/baronie-gwendolyns-ufer/morddyn/MorddynAnzeigetafel.html",
      reference: true,
    },
    {
      id: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-anzeigetafel",
      title: "Llysfaens Anzeigetafel",
      status: TAFEL_STATUS.ACTIVE,
      type: TAFEL_TYPES.SETTLEMENT,
      hierarchy: [
        { level: "kingdom", slug: "cenyr", title: "Cenyr" },
        { level: "county", slug: "celtigerns-wacht", title: "Celtigerns Wacht" },
        { level: "barony", slug: "llamrais-ankunft", title: "Llamrais Ankunft" },
        { level: "lordship", slug: "herrschaft-der-wyrm", title: "Herrschaft der Wyrm" },
        { level: "settlement", slug: "llysfaen", title: "Llysfaen" },
      ],
      folder: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen",
      config: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen/tafel.config.js",
      images: {},
      dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen/data.json",
      firebase: {
        collection: "anzeigetafeln",
        docId: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-anzeigetafel",
      },
      link: "tafel.html?tafel=cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen-anzeigetafel",
      legacyLink: "Cenyr/celtigerns-wacht/llamrais-ankunft/herrschaft-der-wyrm/llysfaen/Llysfaens-Anzeigetafel.html",
      editableDraft: true,
      notes: "Konkrete Anzeigetafel fuer Llysfaen. Tafelbilder koennen im Editor als Bildlinks hinterlegt werden.",
    },
  ].map(Object.freeze);

  function all() {
    return TAFELN;
  }

  function byId(id) {
    return TAFELN.find(tafel => tafel.id === id) || null;
  }

  function byStatus(status) {
    return TAFELN.filter(tafel => tafel.status === status);
  }

  function linkFor(id) {
    const tafel = byId(id);
    return tafel ? tafel.link : `tafel.html?tafel=${encodeURIComponent(id)}`;
  }

  window.TAFEL_REGISTRY = Object.freeze(TAFELN);
  window.TafelRegistry = Object.freeze({
    statuses: TAFEL_STATUS,
    types: TAFEL_TYPES,
    all,
    byId,
    byStatus,
    linkFor,
  });
})();
