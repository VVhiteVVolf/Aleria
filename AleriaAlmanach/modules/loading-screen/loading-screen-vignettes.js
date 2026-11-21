export const LOADING_SCREEN_VIGNETTES = [
  {
    id: 'trahern-tal',
    picture: 'trahern-tal-v1',
    description: 'Trahern Draig steht mit dem Rücken zum Betrachter neben einem Baum und malt das Tal mit dem Dorf vor ihm'
  },
  {
    id: 'versunkene-strand',
    picture: 'versunkene-strand-v1',
    description: 'Zwei Versunkene knien zwischen Wrackteilen und Treibholz über einem Kadaver. Einer blickt erschrocken auf und seine Augen leuchten kurz auf'
  },
  {
    id: 'steffan-musterung',
    picture: 'steffan-musterung-v3',
    description: 'Sir Steffan Draig mustert im Burghof acht unbewaffnete Draig-Waffenknechte in Zweierreihen'
  },
  {
    id: 'fenrir-freya-weglager',
    picture: 'fenrir-freya-weglager-v2',
    description: 'Neben dem halb abgebauten Weglager erleichtert sich Fenrir Varulv am Baum und schimpft über die Schulter mit Freya Skald. Sie schaut weg und hält sich die Augen zu'
  },
  {
    id: 'landtroll-bruecke',
    picture: 'landtroll-bruecke-v2',
    description: 'Ein Junge steht mit dem Rücken zum Betrachter vor einer Steinbrücke. In einer Hand trägt er einen Korb voller Fische und mit der anderen bietet er einem riesigen, neugierigen Landtroll einen Fisch an'
  }
].map(variant => ({ ...variant, kind: 'vignette' }));

export function mountLoadingScreenVignette(_scene, art, { picture }, { createPicture }) {
  const stage = art.ownerDocument.createElement('div');
  stage.className = 'almanach-loading__vignette';
  stage.append(createPicture(picture, 1672, 941));
  art.replaceChildren(stage);
}
