// Exact fingerprints of the examples shipped before the empty-start update.
// Keep these independent of the evolving template catalog: only unchanged demos
// may be removed from an existing browser workspace. Random IDs are excluded.
const LEGACY_EXAMPLE_FINGERPRINTS = new Set([
  "{\"collapsed\":false,\"color\":\"peach\",\"mindmap\":{\"edges\":[],\"nodes\":[]},\"pages\":[{\"blocks\":[{\"kind\":\"image\",\"label\":\"Portrait\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Wer ist diese Figur?\",\"value\":\"Eine junge Kartografin entdeckt, dass ihre Karten die Welt verändern. Jeder neue Strich hat einen Preis.\"},{\"kind\":\"bullets\",\"label\":\"Eigenschaften\",\"value\":\"Unstillbar neugierig\\nSieht Muster, wo andere Chaos sehen\\nVertraut lieber Karten als Menschen\"},{\"kind\":\"text\",\"label\":\"Stimme & Auftreten\",\"value\":\"\"}],\"title\":\"Die Figur\"},{\"blocks\":[{\"kind\":\"text\",\"label\":\"Größter Wunsch\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Ängste & Widersprüche\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Stärken & Schwächen\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Ein Geheimnis\",\"value\":\"\"}],\"title\":\"Unter der Oberfläche\"},{\"blocks\":[{\"kind\":\"text\",\"label\":\"Wo beginnt die Reise?\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Was verändert die Figur?\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Wo könnte sie ankommen?\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Offene Fragen\",\"value\":\"\"}],\"title\":\"Entwicklung\"}],\"status\":\"developing\",\"subtitle\":\"Sie zeichnet Orte, die es noch nicht gibt.\",\"tags\":\"Protagonistin, Entdeckung\",\"title\":\"Mara, die Kartografin\",\"type\":\"character\",\"x\":40,\"y\":34}",
  "{\"collapsed\":false,\"color\":\"sage\",\"mindmap\":{\"edges\":[],\"nodes\":[]},\"pages\":[{\"blocks\":[{\"kind\":\"text\",\"label\":\"Die Idee in einem Satz\",\"value\":\"Eine verschwundene Stadt. Eine Karte ohne Grenzen. Und eine Frau, die lernen muss, sich zu verirren.\"},{\"kind\":\"text\",\"label\":\"Was wäre, wenn …\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Themen & Motive\",\"value\":\"Heimat & Aufbruch\\nDie Macht von Erinnerungen\\nMut zum Unbekannten\"},{\"kind\":\"text\",\"label\":\"Die Atmosphäre\",\"value\":\"\"}],\"title\":\"Der Funke\"},{\"blocks\":[{\"kind\":\"text\",\"label\":\"Was steht auf dem Spiel?\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Wer will was – und warum?\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Hindernisse\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Der Wendepunkt\",\"value\":\"\"}],\"title\":\"Der Konflikt\"},{\"blocks\":[{\"kind\":\"text\",\"label\":\"Anfang\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Mitte\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Ende\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Szenen, die unbedingt vorkommen sollen\",\"value\":\"\"}],\"title\":\"Der rote Faden\"}],\"status\":\"sketch\",\"subtitle\":\"Was, wenn eine Karte kein Abbild ist, sondern ein Versprechen?\",\"tags\":\"Abenteuer, Magischer Realismus\",\"title\":\"Die letzte Kartografin\",\"type\":\"story\",\"x\":365,\"y\":70}",
  "{\"collapsed\":false,\"color\":\"lavender\",\"mindmap\":{\"edges\":[{\"from\":0,\"label\":\"zeichnet\",\"to\":1},{\"from\":0,\"label\":\"verbirgt\",\"to\":2},{\"from\":0,\"label\":\"fordert\",\"to\":3},{\"from\":0,\"label\":\"bewahrt\",\"to\":4}],\"nodes\":[{\"color\":\"lavender\",\"text\":\"Die Karte\",\"x\":410,\"y\":220},{\"color\":\"peach\",\"text\":\"Mara\",\"x\":120,\"y\":100},{\"color\":\"sage\",\"text\":\"Die verlorene Stadt\",\"x\":730,\"y\":80},{\"color\":\"butter\",\"text\":\"Ein Versprechen\",\"x\":720,\"y\":400},{\"color\":\"rose\",\"text\":\"Erinnerung\",\"x\":140,\"y\":410}]},\"pages\":[{\"blocks\":[],\"title\":\"Gedankennetz\"},{\"blocks\":[{\"kind\":\"bullets\",\"label\":\"Neue Ansätze\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Was verbindet diese Ideen?\",\"value\":\"\"}],\"title\":\"Weiterdenken\"}],\"status\":\"sketch\",\"subtitle\":\"Erste Fäden zwischen Figur, Welt und Konflikt\",\"tags\":\"\",\"title\":\"Alles hängt zusammen\",\"type\":\"mindmap\",\"x\":700,\"y\":35}",
  "{\"collapsed\":true,\"color\":\"butter\",\"mindmap\":{\"edges\":[],\"nodes\":[]},\"pages\":[{\"blocks\":[{\"kind\":\"text\",\"label\":\"Platz für deinen Gedanken\",\"value\":\"„Vielleicht sind die Orte, die wir suchen, gar nicht die, die wir brauchen.“\"},{\"kind\":\"bullets\",\"label\":\"Zum Weiterdenken\",\"value\":\"\"}],\"title\":\"Gedanken\"}],\"status\":\"sketch\",\"subtitle\":\"Dialogidee · Kapitel 1\",\"tags\":\"\",\"title\":\"Ein Gedanke für später\",\"type\":\"note\",\"x\":400,\"y\":460}",
  "{\"collapsed\":true,\"color\":\"sand\",\"mindmap\":{\"edges\":[],\"nodes\":[]},\"pages\":[{\"blocks\":[{\"kind\":\"image\",\"label\":\"Ansicht oder Inspiration\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Der erste Eindruck\",\"value\":\"Salz in der Luft. Schiefe Dächer. Straßen, die im Nebel ihre Richtung ändern.\"},{\"kind\":\"bullets\",\"label\":\"Sehen, hören, riechen\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Was macht diesen Ort besonders?\",\"value\":\"\"}],\"title\":\"Ein Ort entsteht\"},{\"blocks\":[{\"kind\":\"text\",\"label\":\"Geschichte & Geheimnisse\",\"value\":\"\"},{\"kind\":\"bullets\",\"label\":\"Menschen & Begegnungen\",\"value\":\"\"},{\"kind\":\"text\",\"label\":\"Regeln dieser Welt\",\"value\":\"\"}],\"title\":\"Hinter den Kulissen\"}],\"status\":\"sketch\",\"subtitle\":\"Ein Ort, der nur in Erinnerungen existiert.\",\"tags\":\"Weltenbau\",\"title\":\"Die Stadt ohne Namen\",\"type\":\"place\",\"x\":740,\"y\":420}"
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
}

function fingerprint(module) {
  const value = structuredClone(module);
  const nodeIds = value.mindmap.nodes.map(node => node.id);
  delete value.id;
  for (const page of value.pages) {
    delete page.id;
    for (const block of page.blocks) delete block.id;
  }
  for (const node of value.mindmap.nodes) delete node.id;
  for (const edge of value.mindmap.edges) {
    delete edge.id;
    edge.from = nodeIds.indexOf(edge.from);
    edge.to = nodeIds.indexOf(edge.to);
  }
  return JSON.stringify(stable(value));
}

export function removeUnchangedWorkspaceExamples(workspace) {
  if (!workspace.boards.some(board => board.example === true)) return {workspace, changed: false};
  const boards = workspace.boards.map(board => board.example === true ? {
    ...board,
    example: false,
    modules: board.modules.filter(module => !LEGACY_EXAMPLE_FINGERPRINTS.has(fingerprint(module)))
  } : board);
  return {workspace: {...workspace, boards}, changed: true};
}
