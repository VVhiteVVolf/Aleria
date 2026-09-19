// Explicit scene blocks keep ordinary lore headings expanded.
// Legacy flat sections can mark a subheading with flavor: true; its scene ends
// at the next heading. Keeping the flat paragraphs also preserves older readers.
export function groupFlavorBlocks(blocks) {
  const result = [];
  let scene = null;
  for (const block of blocks) {
    if (block?.type === 'subheading' && block.flavor === true) {
      scene = { type: 'scene', text: block.text, paragraphs: [] };
      result.push(scene);
    } else if (scene && (typeof block === 'string' || block?.type === 'paragraph')) {
      scene.paragraphs.push(typeof block === 'string' ? block : block.text);
    } else {
      scene = null;
      result.push(block);
    }
  }
  return result;
}

export function createFlavorScene(scene, doc = document) {
  const details = doc.createElement('details');
  details.className = 'orte-flavor-scene';
  const summary = doc.createElement('summary');
  summary.textContent = String(scene.text || scene.title || 'Szene');
  details.append(summary);
  const body = doc.createElement('div');
  body.className = 'orte-flavor-scene__body';
  for (const text of scene.paragraphs || []) body.append(createSceneParagraph(String(text), doc));
  details.append(body);
  return details;
}

function createSceneParagraph(text, doc) {
  const paragraph = doc.createElement('p');
  // Only a speaker followed by a quoted utterance is dialogue; ordinary colons stay prose.
  const dialogue = text.match(/^([^:()\n]+?)(\s*\([^)]*\))?(:\s*)(?=[„“"»])/u);
  if (!dialogue) {
    paragraph.className = 'orte-flavor-scene__action';
    paragraph.textContent = text;
    return paragraph;
  }
  const speaker = doc.createElement('strong');
  speaker.className = 'orte-flavor-scene__speaker';
  speaker.textContent = dialogue[1];
  paragraph.append(speaker);
  if (dialogue[2]) {
    const action = doc.createElement('em');
    action.className = 'orte-flavor-scene__action';
    action.textContent = dialogue[2];
    paragraph.append(action);
  }
  paragraph.append(dialogue[3]);
  // Highlight stage directions between German speech quotes without changing the source text.
  const utterance = text.slice(dialogue[0].length);
  if (!utterance.startsWith('„')) {
    paragraph.append(utterance);
    return paragraph;
  }
  const parts = utterance.split(/(„[^“]*“)/u);
  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('„') || !part.trim()) paragraph.append(part);
    else {
      const action = doc.createElement('em');
      action.className = 'orte-flavor-scene__action';
      action.textContent = part;
      paragraph.append(action);
    }
  }
  return paragraph;
}
