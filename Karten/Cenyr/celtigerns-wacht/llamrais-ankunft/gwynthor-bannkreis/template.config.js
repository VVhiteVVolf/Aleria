window.KARTO_CONFIG = {
  mapId: "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
  title: "Gwynthor – Bannkreis",
  documentTitle: "Gwynthor – Bannkreis - Aleria",
  images: {
    normal: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.png",
    regions: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.png",
    pins: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.png",
  },
  layerNames: {
    normal: "Normal",
    regions: "Zonen",
    pins: "Markierungen",
  },
  defaultDominions: window.KartoDominionPresets?.forMap("cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis") || [],
  storage: {
    dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json",
  },
};
