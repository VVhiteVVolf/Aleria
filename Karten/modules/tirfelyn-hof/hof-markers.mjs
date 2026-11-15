// Only the nine marker types used by the sixteen houses and workplaces.
export const HOF_MARKER_DEFINITIONS = [
  { key: 'herrenhaus', name: 'Kleines Bauernherrenhaus', subject: 'A modest rural family manor: one cream-plastered L-shaped farmhouse, a broad blue-grey roof, a wooden doorway and three small windows, a short fence and a few restrained garden plants inside the pin.' },
  { key: 'wohnhaus', name: 'Wohnhütte', subject: 'One modest little farm cottage, cream plaster and brown timber, a broad simple blue-grey pitched roof, a wooden door and one small window. A short fence and a little garden within the pin. Clearly smaller and simpler than a manor.' },
  { key: 'holzfaeller', name: 'Kleiner Holzfällerplatz', subject: 'A small woodcutters workplace: a low open timber shelter, a stack of three freshly cut logs and a chopping block with one axe. A couple of pine-tree silhouettes behind the shelter, all inside the pin.' },
  { key: 'muehle', name: 'Kleine Hofmühle', subject: 'One small rural windmill, a squat cream tower with a blue-grey cap roof, one dark doorway and four large clearly separated wooden sails. A few golden grain stalks inside the lower part of the pin.' },
  { key: 'gerberei', name: 'Kleine Gerberei', subject: 'A little rural tannery: low timber workshop with a blue-grey lean-to roof and one pale brown hide clearly stretched on a simple wooden frame beside the doorway. One small tub inside the pin; the hide is the main distinguishing feature.' },
  { key: 'schmiede', name: 'Kleine Hofschmiede', subject: 'A small open timber farm smithy beneath a blue-grey lean-to roof, a squat stone hearth with warm orange fire, a clear broad dark anvil and one hammer. Follow the blacksmith reference but simplify to a small farm workshop.' },
  { key: 'imkerei', name: 'Kleine Imkerei', subject: 'A small farm apiary: three golden straw beehive skeps on a low wooden stand next to a tiny open-sided shelter. A few small flowers, all inside the pin. The three rounded hives are the main distinguishing shapes.' },
  { key: 'gestuet', name: 'Kleines Gestüt', subject: 'A small brown timber horse stable with a broad blue-grey roof and a single brown horse looking over the half-open stable door. A short wooden fence inside the pin. Clearly a small rural stable, not a horseshoe symbol.' },
  { key: 'raeucherhaus', name: 'Kleines Räucherhaus', subject: 'A tiny dark timber smokehouse with a blue-grey roof, a closed plank door and one chunky chimney emitting a small grey curl of smoke. A few split logs beside the wall, all inside the pin. Distinct from the open glowing smithy.' }
].map(marker => ({ ...marker, id: `icon-hoforte-${marker.key}`, url: `assets/icons/hoforte/${marker.key}-pin-v1.png`, group: 'Kleine Hoforte' }));

const assignments = {
  holzfaellerlager: 'holzfaeller', muehle: 'muehle', gerberhaus: 'gerberei', hufschmiede: 'schmiede',
  imkerei: 'imkerei', gestuet: 'gestuet', raeucherhaus: 'raeucherhaus'
};

export function hofMapMarker(poi) {
  const key = poi.residenceId ? (poi.residenceId === 'bauernherrenhaus' ? 'herrenhaus' : 'wohnhaus') : assignments[poi.key];
  const marker = HOF_MARKER_DEFINITIONS.find(marker => marker.key === key);
  return marker ? { catalogId: marker.id, url: `/Karten/${marker.url}` } : null;
}
