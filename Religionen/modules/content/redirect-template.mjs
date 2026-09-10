import { escapeHtml as h, pageLinkFrom } from './content-html.mjs';
import { entryPagePath } from './content-repository.mjs';

export function renderEntryRedirect(entry, outputPath) {
  const target = pageLinkFrom(outputPath)(entryPagePath(entry));
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="refresh" content="0; url=${target}"><link rel="canonical" href="${target}"><meta name="robots" content="noindex"><title>${h(entry.title)} · Religionen von Aleria</title></head>
<body><main><h1>${h(entry.title)}</h1><p>Das Register ist umgezogen. <a href="${target}">Zum aktuellen Götterkreis</a>.</p></main></body>
</html>
`;
}
