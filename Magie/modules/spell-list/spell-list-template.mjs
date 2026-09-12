import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import { createCatalogSpell } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog.js';
import { getSpellManaCost } from '../../../AleriaAlmanach/modules/combat/combat-resource-progression.js';
import { getActivationIconSource, getRangeIconSource } from '../../../AleriaAlmanach/modules/combat/combat-entry-icons.js';
import { COMBAT_ACTIVATION_TYPES } from '../../../AleriaAlmanach/modules/combat/combat-action-economy.js';

import { getSpellCatalogSchool } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog-schools.js';
import { getCatalogOutcomePresentation } from '../../../AleriaAlmanach/modules/spell-catalog/spell-catalog-presentation.js';
import { getSpellListCopy } from './spell-list-copy.mjs';

const workspace = fileURLToPath(new URL('../../../', import.meta.url));
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const rootAsset = path => `../../${path}`;
const sharedAsset = url => rootAsset(relative(workspace, fileURLToPath(url)).replaceAll('\\', '/'));
const image = (path, className = '') => `<img src="${escape(path)}" class="${className}" width="24" height="24" alt="" loading="lazy" decoding="async">`;
const dice = formula => String(formula).toUpperCase().replaceAll('D', 'W');
const bgRoot = 'IconOrdner/Zauber Icons/Baldurs Gate/';
const damageAssets = { Feuer:'Fire', Kälte:'Cold', Wucht:'Bludgeoning', Blitz:'Lightning', Donner:'Thunder', Stich:'Piercing' };
const saveNames = { dexterity:'Geschicklichkeit', constitution:'Konstitution', strength:'Stärke' };

function actionCosts(ids) {
  return ids.map(id => `<span class="spell-action-cost" title="${escape(COMBAT_ACTIVATION_TYPES.find(type => type.id === id)?.label)}">${image(sharedAsset(getActivationIconSource(id)))}<span>${escape(COMBAT_ACTIVATION_TYPES.find(type => type.id === id)?.label)}</span></span>`).join('<i aria-hidden="true">+</i>');
}

function damageLabel(entry, form = entry) {
  const outcome = getCatalogOutcomePresentation(entry, form);
  if (outcome) return outcome.label;
  if (form.damage.length) return form.damage.map(part => `${dice(part.formula)} ${part.damageType}`).join(' + ');
  if (form.protectionRoll) return `${dice(form.protectionRoll)} ${entry.sourceId === 'Z05' ? 'Strukturschaden' : 'Schutz'}`;
  return entry.sourceId === 'F06' ? (form.level > entry.level ? '4W6 Feuer · Auslöser' : '3W6 Feuer · Auslöser')
    : entry.sourceId === 'Z14' ? 'Drei Sturmpulse' : 'Kein direkter Schaden';
}

function spellCard(entry, { archived = false } = {}) {
  const outcome = getCatalogOutcomePresentation(entry);
  const spell = createCatalogSpell(entry.id, { revision: entry.revision });
  const primary = entry.damage[0];
  const dieSides = (primary?.formula || outcome?.formula || entry.protectionRoll).match(/d(4|6|8|10|12)/)?.[1];
  const dieType = ['healing', 'temporary-hit-points'].includes(outcome?.kind) ? 'Healing' : primary && !['Wucht','Stich'].includes(primary.damageType) ? damageAssets[primary.damageType] : 'Physical';
  const damageIcon = dieSides ? rootAsset(`${bgRoot}Würfel Icons/D${dieSides}_${dieType}.png`) : '';
  const save = entry.resolutionType === 'saving-throw'
    ? `${saveNames[entry.saveAttribute]} · ${primary ? 'halber Schaden bei Erfolg' : 'Wirkung bei Misserfolg'}`
    : entry.resolutionType === 'spell-attack' ? 'Zauberangriff gegen RK' : 'Ohne Angriffswurf';
  const searchText = [entry.name, entry.requirements, entry.effect, entry.role, entry.summary, entry.limits, ...entry.damage.map(part => part.damageType)].join(' ');
  return `<details class="spell-card" id="${entry.id}" data-spell data-section="${entry.section}" data-grade="${entry.level}" data-role="${escape(entry.role)}" data-delivery="${entry.ritual ? 'ritual' : entry.channelComments ? 'channel' : entry.actionIds.every(id => ['reaction', 'bonus-action'].includes(id)) && entry.actionIds.includes('reaction') ? 'reaction' : 'instant'}" data-concentration="${Boolean(entry.concentration)}" data-search="${escape(searchText)}">
    <summary><span class="spell-icon${entry.iconPath ? '' : ' spell-icon-empty'}" aria-hidden="true">${entry.iconPath ? image(rootAsset(entry.iconPath)) : ''}</span><span class="spell-summary-copy"><span class="spell-overline">${entry.level ? `Grad ${entry.level}` : 'Zaubertrick'} <i>·</i> ${escape(entry.role)}</span><span class="spell-name">${escape(entry.name)}</span><span class="spell-summary-damage">${escape(damageLabel(entry))}</span></span><span class="spell-summary-price">${getSpellManaCost(entry.level)}<small>Mana</small></span><span class="spell-toggle" aria-hidden="true">+</span></summary>
    <div class="spell-card-body">
      <div class="spell-costs">${actionCosts(entry.actionIds)}<span class="spell-mana">${image(rootAsset(`${bgRoot}Ressourcen/Spell_Slot_Icon.png`))}${spell.manaCost} Mana</span></div>
      <dl class="spell-facts"><div><dt>${damageIcon ? image(damageIcon) : ''}Wirkung</dt><dd>${escape(damageLabel(entry))}${outcome?.averageLabel ? `<small class="spell-outcome-average">${escape(outcome.averageLabel)}</small>` : ''}</dd></div><div><dt>${image(sharedAsset(getRangeIconSource()))}Reichweite & Ziel</dt><dd>${escape(entry.range)}</dd></div><div><dt>Abwehr</dt><dd>${escape(save)}</dd></div><div><dt>Dauer</dt><dd>${escape(entry.duration)}${entry.concentration ? '<small class="spell-outcome-average">Konzentration</small>' : ''}</dd></div></dl>
${entry.ritual ? `      <p class="spell-timing"><b>Ritual</b> ${escape(entry.ritual)}</p>` : ''}${entry.trigger ? `<p class="spell-timing"><b>Auslöser</b> ${escape(entry.trigger)}</p>` : ''}
      <p class="spell-description">${escape(entry.effect)}</p><p class="spell-limits">${escape(entry.limits)}</p>
      <div class="spell-requirements"><span>Voraussetzungen</span><p>${escape(entry.requirements)}</p></div>
      ${entry.forms.length ? `<details class="spell-upcast"><summary>Höhere Wirkungsgrade <span>${entry.forms.length} Formen</span></summary><p>Die genannten Werte ersetzen die Grundwerte; alle anderen Grenzen bleiben bestehen.</p><div class="spell-table-wrap"><table><caption class="spell-sr-only">Höhere Wirkungsgrade für ${escape(entry.name)}</caption><thead><tr><th>Grad</th><th>Kosten</th><th>Wirkung</th></tr></thead><tbody>${entry.forms.map(form => `<tr><th scope="row">${form.level}</th><td><span class="spell-table-costs">${actionCosts(form.actionIds)}</span><span>${getSpellManaCost(form.level)} Mana</span></td><td>${escape(damageLabel(entry, form))}${form.changes ? `<small>${escape(form.changes)}</small>` : ''}</td></tr>`).join('')}</tbody></table></div></details>` : '<p class="spell-no-upcast">Keine höheren Wirkungsgrade.</p>'}
      <aside class="spell-resolution"><span>${entry.manualResolution ? 'Am Spieltisch' : 'Im Kampf'}</span><p>${escape(entry.manualResolution || (outcome?.kind === 'healing' ? 'Heilung und Kosten werden im Kampfsystem aufgelöst. Jeder Heilwurf gilt für ein gewähltes Ziel und endet an dessen TP-Maximum. Voraussetzungen, Wirkungslinie und Leben vor dem Wirken prüfen.' : 'Angriff beziehungsweise Rettung, Schadenswurf und Kosten werden im Kampfsystem aufgelöst. Voraussetzungen, Wirkungslinie und gültige Ziele vor dem Wirken prüfen.'))}</p></aside>
      <footer class="spell-card-footer"><a href="../../AleriaAlmanach/AleriaAlmanach.html?zauberkatalog=${entry.id}">${archived ? 'Aktuelle Vorlage im Archiv öffnen' : 'Im Charakterbogen-Archiv öffnen'} ↗</a><button type="button" data-action="copy-spell-link" data-spell-id="${entry.id}" aria-label="Link zu ${escape(entry.name)} kopieren">Link kopieren</button><small>Fassung ${entry.revision} · ${entry.sourceId}</small></footer>
    </div>
  </details>`;
}

function pendingSection(pending) {
  if (!pending.length) return '';
  return `<details class="spell-pending" id="grenzkunst"><summary><span><small>Offene Überlieferung</small>Sonstiges &amp; Grenzkunst</span><span aria-hidden="true">+</span></summary><div><p>Diese beiden Entwürfe sind noch keine lernbaren Zauber. Ihre Regeln werden gesondert ausgearbeitet.</p><div class="spell-pending-grid">${pending.map(entry => `<article id="restitution-${entry.id}"><small>${entry.source} · Noch offen</small><h3>${escape(entry.name)}</h3><p>${escape(entry.text)}</p></article>`).join('')}</div></div></details>`;
}

export function renderSpellListPage(entries, { archived = false, catalog = entries[0]?.catalog === 'restitution' ? 'restitution' : 'elemente' } = {}) {
  const school = getSpellCatalogSchool(catalog);
  if (!school) throw new Error(`Unbekannte Zauberschule: ${catalog}`);
  const copy = getSpellListCopy(catalog);
  const sections = school.sections;
  const sectionPrefix = catalog === 'elemente' ? 'element' : 'bereich';
  const count = entries.length;
  const maximumGrade = Math.max(...entries.flatMap(entry => [entry.level, ...entry.forms.map(form => form.level)]));
  const revision = entries[0]?.revision || 1;
  const roles = [...new Set(entries.map(entry => entry.role))];
  const extendedFilters = catalog === 'restitution';
  return `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#293b38"><meta name="description" content="${count} Zauber der gelehrten Schule ${school.name} für Aleria: Wirkungen, Aktionskosten, Mana und höhere Grade. Verbunden mit dem Charakterbogen-Archiv."><title>${school.name} · ${archived ? 'Archivfassung · ' : ''}Zauberverzeichnis · Aleria</title><link rel="icon" href="../assets/schools/${catalog}.png"><link rel="stylesheet" href="../modules/book-shell/magic-shell.css"><link rel="stylesheet" href="../../Fonts/Arkanes-Alphabet/arcane.css"><link rel="stylesheet" href="../modules/spell-list/spell-list.css"><script type="module" src="../modules/spell-list/spell-list-controller.mjs"></script></head>
<body class="magic-page spell-list-page" data-school="${catalog}"><a class="magic-skip" href="#zauber">Zum Zauberverzeichnis</a>
<header class="magic-masthead"><a class="magic-brand" href="../../AleriaAlmanach/AleriaAlmanach.html">← ALERIA <i>/</i> ALMANACH</a><nav aria-label="Weitere Sammlungen"><a href="../index.html#${catalog}">Magie</a><a href="../../Klassenordner/Klassenseite.html">Klassen</a><a href="../../Religionen/index.html">Religionen</a></nav></header>
<main class="magic-book" data-spell-list>
  <header class="spell-cover"><div><a class="spell-breadcrumb" href="../index.html#schulen">Magie / Die gelehrten Schulen</a><p class="magic-eyebrow">Alerias Zauberverzeichnisse · Band ${copy.volume}</p><h1>${school.name}</h1><p class="spell-cover-subtitle">${copy.subtitle}</p><p class="spell-cover-intro">${copy.intro}</p><div class="spell-cover-counts"><span><b>${count}</b> Zauber</span><span><b>${copy.count}</b> ${copy.countLabel}</span><span><b>0–${maximumGrade}</b> Grade</span></div></div><div class="spell-cover-sigil" aria-hidden="true"><span class="arcane">&#xE000; &#xE00C; &#xE01F;</span><img src="../assets/schools/${catalog}.png" width="220" height="220" alt=""><small>${copy.sigil}</small></div></header>
  ${archived ? '<aside class="spell-edition-notice"><h2>Archivfassung 1</h2><p>Diese frühere Liste wurde als „Elementarismus“ veröffentlicht. Sie bleibt für bereits gelernte Zauber lesbar. Das überarbeitete Verzeichnis gehört zur gelehrten Schule Elemente; der druidische Elementarismus erhält später eigene Zauber.</p><a class="magic-button" href="../elemente/index.html">Zur aktuellen Schule Elemente ↗</a></aside>' : `<aside class="spell-edition-notice"><h2>${copy.noticeTitle}</h2><p>${copy.notice}</p></aside>`}
  <details class="spell-conventions"><summary>Vor dem ersten Zauber <span>Mana · Aktionen · Konzentration</span></summary><div><p><b>Ein gemeinsames Regelwerk.</b> Die Manakosten aller Fassungen wurden um 15 % erhöht und auf ganze Punkte aufgerundet. Es gilt die gemeinsame Gradstaffel: ${Array.from({length:maximumGrade + 1},(_,level)=>`${level}: ${getSpellManaCost(level)}`).join(' · ')}. Ein freigeschalteter Grad wird beim Wirken nicht verbraucht. Besondere Aktionen sind eine dauerhafte Ressource und erneuern sich nicht mit jedem Beitrag.</p><div class="spell-cost-legend">${actionCosts(['action','bonus-action','reaction','special-action'])}</div>${copy.conventions.map(paragraph=>`<p>${paragraph}</p>`).join('')}</div></details>
  <div class="spell-register-layout" id="zauber"><aside class="spell-register"><p class="magic-eyebrow">Das Verzeichnis</p><nav aria-label="${copy.navigation}">${sections.map((section,index)=>`<a href="#${sectionPrefix}-${section.id}"><span>${String(index+1).padStart(2,'0')}</span>${escape(section.name)}<small>${entries.filter(entry=>entry.section===section.id).length}</small></a>`).join('')}${copy.pending.length ? '<a href="#grenzkunst"><span>07</span>Sonstiges &amp; Grenzkunst<small>offen</small></a>' : ''}</nav><p>${copy.register}</p><a href="../../AleriaAlmanach/AleriaAlmanach.html?zauberkatalog=${catalog}">Zum Charakterbogen-Archiv ↗</a></aside>
  <div class="spell-register-content"><form class="spell-filters${extendedFilters ? ' spell-filters-expanded' : ''}" role="search"><label><span>Zauber finden</span><input type="search" name="search" placeholder="Name, Wirkung oder Voraussetzung …" autocomplete="off"></label><label><span>Grundgrad</span><select name="grade"><option value="all">Alle Grade</option>${Array.from({length:maximumGrade + 1},(_,grade)=>`<option value="${grade}">${grade ? `Grad ${grade}` : 'Zaubertrick'}</option>`).join('')}</select></label><label><span>Verwendung</span><select name="role"><option value="all">Alle Wirkungen</option>${roles.map(role=>`<option>${escape(role)}</option>`).join('')}</select></label>${extendedFilters ? '<label><span>Wirkweise</span><select name="delivery"><option value="all">Alle Wirkweisen</option><option value="instant">Sofort / Vorbereitung</option><option value="reaction">Reaktiv</option><option value="ritual">Ritual</option><option value="channel">Kanalisierung</option></select></label><label><span>Konzentration</span><select name="concentration"><option value="all">Alle Zauber</option><option value="true">Mit Konzentration</option><option value="false">Ohne Konzentration</option></select></label>' : ''}</form><div class="spell-result-bar"><p data-role="result-count" role="status" aria-live="polite">${count} Zauber im Verzeichnis</p><button type="button" data-action="reset-filters">Filter zurücksetzen</button><button type="button" data-action="collapse-spells">Alle schließen</button></div><p data-role="empty" hidden>Kein Zauber passt zu dieser Auswahl.</p>
  ${sections.map((section,index)=>`<section class="spell-section" id="${sectionPrefix}-${section.id}" data-spell-section aria-labelledby="title-${section.id}"><header><span class="spell-section-number">${String(index+1).padStart(2,'0')}</span><div><h2 id="title-${section.id}">${escape(section.name)}</h2><p>${escape(section.subtitle)}</p></div><a href="#zauber" aria-label="Zurück zum Filter">↑</a></header><div class="spell-grid">${entries.filter(entry=>entry.section===section.id).map(entry=>spellCard(entry,{archived})).join('\n')}</div></section>`).join('\n')}
  ${pendingSection(copy.pending)}</div></div><p class="spell-copy-status" data-role="copy-status" role="status" aria-live="polite"></p>
</main><footer class="spell-page-footer"><a href="../index.html">← Die Kunst der Magie</a><span>Aleria · ${school.name} · ${archived ? 'Archivfassung' : 'Fassung'} ${revision}</span><a href="#zauber">Zum Verzeichnis ↑</a></footer>
</body></html>\n`;
}
