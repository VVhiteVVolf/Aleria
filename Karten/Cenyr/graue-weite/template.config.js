window.KARTO_CONFIG = {
  mapId: 'cenyr-graue-weite',
  title: 'Graue Weite',
  documentTitle: 'Graue Weite – Grafschaft - Aleria',
  images: {
    normal: 'Cenyr/graue-weite/Kartenbilder/normal.webp',
    regions: 'Cenyr/graue-weite/Kartenbilder/regions.webp',
    // The existing interactive marker layer needs no raster background.
    pins: '',
  },
  extraLayers: [
    { id: 'graue-weite-original-markers', name: 'Originale Markierungen', url: 'Cenyr/graue-weite/Kartenbilder/pins.webp' },
  ],
  storage: { dataPath: 'Cenyr/graue-weite/data.json' },
};
