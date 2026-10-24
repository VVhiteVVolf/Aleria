import { escapeEventText as e } from '../catalog/events-model.mjs';

export function renderWarShell({title,description,content,depth=0,kind='hub',color=''}){
  const home=depth?'../':'./',events=depth?'../../../':'../../',workspace=depth?'../../../../':'../../../';
  const styles=kind==='hub'?['hub','map']:kind==='event'?['dossier','event']:['dossier'];
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#241b20"><meta name="robots" content="noindex"><meta name="description" content="${e(description)}"><title>${e(title)} · ${kind=== 'hub'?'Alerias Chronik':'Der Krieg der Prätendenten'}</title><link rel="icon" href="${events}assets/icons/buergerkrieg.png"><link rel="stylesheet" href="${events}modules/praetendenten/war-shell.css">
${styles.map(style=>`<link rel="stylesheet" href="${events}modules/praetendenten/war-${style}.css">`).join('\n')}
${kind==='hub'?`<script type="module" src="${events}modules/praetendenten/war-page.mjs"></script>`:''}</head>
<body class="war-page war-page-${kind}${color?` war-color-${color}`:''}"><a class="war-skip" href="#inhalt">Zum Inhalt</a>
<header class="war-masthead"><a class="war-brand" href="${events}index.html">Alerias Chronik</a><span>Aldrimar · 1627—1647</span><a href="${home}index.html">Der Krieg der Prätendenten</a><small>Experimentelle Fassung</small></header>
<nav class="war-contents" aria-label="Kriegsdossier"><a href="${home}index.html#ueberblick">Der Bruch</a><a href="${home}index.html#fraktionen">Drei Parteien</a><a href="${home}index.html#kriegskarte">Die Kriegskarte</a><a href="${home}index.html#zeittafel">Ereignisse & Schlachten</a><a href="${home}index.html#quellen">Über die Quellen</a><a href="${workspace}Stammbäume/Stammbaum.html?family=haus-vaeren&mode=view">Das Königshaus ↗</a></nav>
<main id="inhalt">${content}</main>
<footer class="war-footer"><a href="${home}index.html">Der Krieg der Prätendenten <span>1627–1647</span></a><a href="${events}index.html">Zur Ereignischronik ↗</a><p>Ein wachsendes historisches Dossier · Lokaler Entwurf, nicht veröffentlicht</p></footer>
</body></html>\n`;
}
