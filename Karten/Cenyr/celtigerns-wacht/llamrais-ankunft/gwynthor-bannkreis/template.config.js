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
  rasterImages: {
    "normal": {
      "source": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.jpg",
      "width": 8192,
      "height": 6300,
      "levels": [
        {
          "width": 2048,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-normal-2048-q90.webp"
        },
        {
          "width": 4096,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-normal-4096-q90.webp"
        },
        {
          "width": 8192,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreis.jpg"
        }
      ]
    },
    "regions": {
      "source": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.webp",
      "width": 8192,
      "height": 6300,
      "levels": [
        {
          "width": 2048,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-regions-2048-q90.webp"
        },
        {
          "width": 4096,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-regions-4096-q90.webp"
        },
        {
          "width": 8192,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisZonen.webp"
        }
      ]
    },
    "pins": {
      "source": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.webp",
      "width": 8192,
      "height": 6300,
      "levels": [
        {
          "width": 2048,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-pins-2048-q90.webp"
        },
        {
          "width": 4096,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/display/gwynthor-pins-4096-q90.webp"
        },
        {
          "width": 8192,
          "src": "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/Kartenbilder/GwynthorBannkreisMarker.webp"
        }
      ]
    }
  },
  storage: {
    dataPath: "Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/data.json",
  },
};
