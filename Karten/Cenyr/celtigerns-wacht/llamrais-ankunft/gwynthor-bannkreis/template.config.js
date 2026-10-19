window.KARTO_CONFIG = {
  mapId: "cenyr-celtigerns-wacht-llamrais-ankunft-gwynthor-bannkreis",
  title: "Gwynthor – Bannkreis",
  documentTitle: "Gwynthor – Bannkreis - Aleria",
  // Existing coordinates identify the head of each original raster marker.
  // Keep replacement icons on that same point rather than moving their tip there.
  pinMarkerAnchorY: 0.43,
  images: {
    normal: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.jpg",
    regions: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.webp",
    pins: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.webp",
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
