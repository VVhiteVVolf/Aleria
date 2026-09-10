export function validateArtifacts(artifacts, { requireText, validateLocalPath, context }) {
  if (artifacts === undefined) return;
  if (!Array.isArray(artifacts.entries) || !artifacts.entries.length) throw new Error(`Artefakte fehlen: ${context}`);
  if (!Array.isArray(artifacts.intro)) throw new Error(`Artefakteinleitung fehlt: ${context}`);
  artifacts.intro.forEach(text => requireText(text, context));
  const ids = new Set();
  for (const artifact of artifacts.entries) {
    if (!/^[a-z][a-z0-9-]*$/.test(artifact.id) || ids.has(artifact.id)) throw new Error(`Ungültiges Artefakt: ${context}.${artifact.id}`);
    ids.add(artifact.id);
    requireText(artifact.title, context);
    if (!Array.isArray(artifact.paragraphs)) throw new Error(`Artefakttext fehlt: ${artifact.id}`);
    artifact.paragraphs.forEach(text => requireText(text, artifact.id));
    if (!artifact.paragraphs.length && !artifact.pending) throw new Error(`Artefaktüberlieferung fehlt: ${artifact.id}`);
    if (artifact.pending) requireText(artifact.pending, artifact.id);
    if (artifact.keeper) requireText(artifact.keeper, artifact.id);
    if (artifact.image) {
      validateLocalPath(artifact.image.src);
      requireText(artifact.image.alt, artifact.id);
      if (![artifact.image.width, artifact.image.height].every(value => Number.isInteger(value) && value > 0)) throw new Error(`Artefaktbildmaße fehlen: ${artifact.id}`);
    }
  }
}
