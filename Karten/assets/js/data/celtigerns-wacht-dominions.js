(function () {
  "use strict";

  const MAP_IDS = Object.freeze({
    COUNTY: "cenyr-celtigerns-wacht",
    GWYNTHOR: "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis"
  });

  const IDS = Object.freeze({
    llamreis: "msa3c53vo1h89v",
    saethwyr: "msa3c53vz3k80p",
    gafyr: "msa3c53vomlanj",
    wyrm: "msa3c53viyll7z",
    rhonwen: "msa3c53vulpw53",
    arthus: "msa3c53vv33tbi",
    gwendolyn: "msa3c53vvlq57o",
    aberllan: "msa3c53v4965zl",
    draigExclave: "msa3c53vyq3dvo"
  });

  function dominion(id, name, type, ruler, seat, parentId = "") {
    return Object.freeze({ id, name, type, ruler, seat, note: "", parentId });
  }

  function knight(id, name, seat, parentId) {
    return dominion(id, `Haus ${name}`, "Ritterhaus", `Haus ${name}`, seat, parentId);
  }

  const county = Object.freeze([
    dominion(IDS.llamreis, "Gräfische Baronie Gwynthor – Llamreis Ankunft", "Gräfische Baronie", "Haus Draig O'Gwynthor", "Gwynthor"),
    dominion(IDS.saethwyr, "Herrschaft der Saethwyr", "Herrschaft", "Haus Saethwyr", "Gwynthor", IDS.llamreis),
    dominion(IDS.gafyr, "Herrschaft der Gafyr", "Herrschaft", "Haus Gafyr", "Gwynthor", IDS.llamreis),
    dominion(IDS.wyrm, "Herrschaft der Wyrm", "Herrschaft", "Haus Wyrm", "Gwynthor", IDS.llamreis),

    knight("cw-haus-gelyn", "Gelyn", "Gwynthor, Gwynthstorm", IDS.llamreis),
    knight("cw-haus-balchder", "Balchder", "Gwynthor", IDS.llamreis),
    knight("cw-haus-awenydd", "Awenydd", "Gwynthor", IDS.llamreis),
    knight("cw-haus-awenor", "Awenor", "Gwynthor", IDS.llamreis),
    knight("cw-haus-dubhan-gwynthor", "Dubhan-Gwynthor", "Gwynthor", IDS.llamreis),
    knight("cw-haus-bleiddorn", "Bleiddorn", "Gwynthor", IDS.llamreis),
    knight("cw-haus-cymrath-o-traethlan", "Cymrath O'Traethlan", "Tŵr Traethlan", IDS.llamreis),

    knight("cw-haus-tlawd", "Tlawd", "Gwynthor", IDS.gafyr),
    knight("cw-haus-von-hochreuth", "Von Hochreuth", "", IDS.gafyr),
    knight("cw-haus-gostyn", "Gostyn", "Gwynthor, Bronfelen", IDS.gafyr),
    knight("cw-haus-rhyddid", "Rhyddid", "Gwynthor, Mwyncraig", IDS.wyrm),
    knight("cw-haus-cludwyr", "Cludwyr", "Gwynthor, Bronhir", IDS.wyrm),
    knight("cw-haus-loer", "Loer", "Gwynthor, Craithglyn", IDS.wyrm),
    knight("cw-haus-chwedlonol", "Chwedlonol", "Gwynthor, Glastraeth", IDS.saethwyr),
    knight("cw-haus-eneiniog", "Eneiniog", "Gwynthor", IDS.saethwyr),

    dominion(IDS.rhonwen, "Herrschaft Rhonwens Tränen", "Herrschaft", "Haus Arwydd", "Castellbryn"),
    knight("cw-haus-gwared", "Gwared", "Castellbryn", IDS.rhonwen),
    knight("cw-haus-rhenna", "Rhenna", "Rhonwens Tränen", IDS.rhonwen),
    knight("cw-haus-madryn", "Madryn", "Rhonwens Tränen", IDS.rhonwen),
    knight("cw-haus-talinvyr", "Talinvyr", "Rhonwens Tränen", IDS.rhonwen),
    knight("cw-haus-merek", "Merek", "Rhonwens Tränen", IDS.rhonwen),

    dominion(IDS.arthus, "Baronie Arthus Streben", "Baronie", "Haus Gwefrydd", "Rhosmere"),
    knight("cw-haus-almarch", "Almarch", "Rhosmere", IDS.arthus),
    knight("cw-haus-brinmarch", "Brinmarch", "Rhosmere", IDS.arthus),
    knight("cw-haus-gwardin", "Gwardin", "Rhosmere", IDS.arthus),
    knight("cw-haus-tirwyn", "Tirwyn", "Rhosmere", IDS.arthus),
    knight("cw-haus-eirfael", "Eirfael", "Rhosmere", IDS.arthus),
    knight("cw-haus-ghorswyn", "Ghorswyn", "Rhosmere", IDS.arthus),
    knight("cw-haus-coedvarn", "Coedvarn", "Rhosmere", IDS.arthus),
    knight("cw-haus-althin", "Althin", "Rhosmere", IDS.arthus),
    knight("cw-haus-talmeirch", "Talmeirch", "Rhosmere", IDS.arthus),
    knight("cw-haus-gwynrhos", "Gwynrhos", "Rhosmere", IDS.arthus),

    dominion(IDS.gwendolyn, "Baronie Gwendolyns Ufer", "Baronie", "Haus Gwyvern O'Abergwint", "Abergwint"),
    knight("cw-haus-rhuddgar", "Rhuddgar", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-gwyntog", "Gwyntog", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-trydar", "Trydar", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-taranvyr", "Taranvyr", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-selog", "Selog", "Abergwint, Burg am Feuerstollen", IDS.gwendolyn),
    knight("cw-haus-penwyn", "Penwyn", "Morddyn", IDS.gwendolyn),
    knight("cw-haus-annwyl", "Annwyl", "Côr Mynyddfaen", IDS.gwendolyn),
    knight("cw-haus-seldryn", "Seldryn", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-cysgodion", "Cysgodion", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-edmy", "Edmy", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-tawelgar", "Tawelgar", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-ymladd", "Ymladd", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-daran", "Daran", "Garwfaen", IDS.gwendolyn),
    knight("cw-haus-cenfig", "Cenfig", "Abergwint", IDS.gwendolyn),
    knight("cw-haus-barus", "Barus", "Abergwint", IDS.gwendolyn),

    dominion(IDS.aberllan, "Region Aberllan", "Region", "", "Aberllan"),
    dominion(IDS.draigExclave, "Exklave des Hauses Draig – Myrddin Draig", "Exklave", "Myrddin Draig (Haus Draig)", "")
  ]);

  const gwynthorIds = new Set([
    IDS.llamreis,
    IDS.saethwyr,
    IDS.gafyr,
    IDS.wyrm,
    "cw-haus-gelyn",
    "cw-haus-balchder",
    "cw-haus-awenydd",
    "cw-haus-awenor",
    "cw-haus-dubhan-gwynthor",
    "cw-haus-bleiddorn",
    "cw-haus-tlawd",
    "cw-haus-gostyn",
    "cw-haus-rhyddid",
    "cw-haus-cludwyr",
    "cw-haus-loer",
    "cw-haus-chwedlonol",
    "cw-haus-eneiniog"
  ]);

  const gwynthor = Object.freeze(county.filter((entry) => gwynthorIds.has(entry.id)));
  const mappedPlaces = Object.freeze([
    {
      prefix: "cenyr-celtigerns-wacht-llamrais-ankunft-lynthor",
      dominionIds: [IDS.llamreis]
    },
    {
      prefix: "cenyr-celtigerns-wacht-llamrais-ankunft-twr-rhewgorn",
      dominionIds: [IDS.llamreis]
    },
    {
      prefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-mwyncreig",
      dominionIds: [IDS.wyrm, "cw-haus-rhyddid"]
    },
    {
      prefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-llysfaen",
      dominionIds: [IDS.wyrm]
    },
    {
      prefix: "cenyr-celtigerns-wacht-llamrais-ankunft-wyrm-bronhir",
      dominionIds: [IDS.wyrm, "cw-haus-cludwyr"]
    },
    {
      prefix: "cenyr-celtigerns-wacht-gwendolyns-ufer-abergwint",
      dominionIds: [
        IDS.gwendolyn,
        "cw-haus-rhuddgar",
        "cw-haus-gwyntog",
        "cw-haus-trydar",
        "cw-haus-taranvyr",
        "cw-haus-selog",
        "cw-haus-seldryn",
        "cw-haus-cysgodion",
        "cw-haus-edmy",
        "cw-haus-tawelgar",
        "cw-haus-ymladd",
        "cw-haus-cenfig",
        "cw-haus-barus"
      ]
    },
    {
      prefix: "cenyr-celtigerns-wacht-rhonwens-traenen-castellbryn",
      dominionIds: [IDS.rhonwen, "cw-haus-gwared"]
    },
    {
      prefix: "cenyr-celtigerns-wacht-arthus-streben-rhosmere",
      dominionIds: [
        IDS.arthus,
        "cw-haus-almarch",
        "cw-haus-brinmarch",
        "cw-haus-gwardin",
        "cw-haus-tirwyn",
        "cw-haus-eirfael",
        "cw-haus-ghorswyn",
        "cw-haus-coedvarn",
        "cw-haus-althin",
        "cw-haus-talmeirch",
        "cw-haus-gwynrhos"
      ]
    }
  ]);

  const presets = {
    [MAP_IDS.COUNTY]: county,
    [MAP_IDS.GWYNTHOR]: gwynthor
  };

  mappedPlaces.forEach((place) => {
    const entries = Object.freeze(county.filter((entry) => place.dominionIds.includes(entry.id)));
    presets[`${place.prefix}-stadtkarte`] = entries;
    presets[`${place.prefix}-bannkreis`] = entries;
  });

  Object.freeze(presets);

  function forMap(mapId) {
    return (presets[mapId] || []).map((entry) => ({ ...entry }));
  }

  window.KartoDominionPresets = Object.freeze({ forMap });
})();
