window.KARTO_CONFIG = {
  mapId: 'cenyr-tal-der-milane',
  title: 'Tal der Milane',
  documentTitle: 'Tal der Milane – Grafschaft - Aleria',
  images: {
    normal: 'Cenyr/tal-der-milane/Kartenbilder/normal.webp',
    regions: 'Cenyr/tal-der-milane/Kartenbilder/regions.webp',
    // The existing interactive marker layer needs no raster background.
    pins: '',
  },
  extraLayers: [
    { id: 'tal-der-milane-original-markers', name: 'Originale Markierungen', url: 'Cenyr/tal-der-milane/Kartenbilder/pins.webp' },
  ],
  storage: { dataPath: 'Cenyr/tal-der-milane/data.json' },
};
