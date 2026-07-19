import { PORTRAIT_PLACEHOLDERS, resolvePortraitSource } from './config/portrait-placeholders.js';
import { createFamilyGraph } from './domain/family-graph.js';
import { pickBiographySample } from './services/dashboard-bio-preview.js';
import { pickFactSample } from './services/dashboard-facts.js';
import { isAleriaGptAvailable, requestAleriaGptSuggestion } from './services/aleria-gpt-bridge.js';
import { createFamilyViewLink } from './services/family-links.js';
import { listFamilyRecords } from './services/family-library.js';
import {
  buildLandingTriviaPrompt,
  buildLocalTriviaBlurb,
  buildShortHouseProfile,
  pickTriviaSample
} from './services/landing-trivia.js';
import { escapeHtml } from './ui/dom.js';

function generationCountFor(record) {
  if (!record.family) return 0;
  try {
    return createFamilyGraph(record.family).getGenerationCount();
  } catch (error) {
    return 0;
  }
}

function renderTriviaCard(record) {
  const emblem = record.emblem || record.family?.document.emblem || record.family?.houses[0]?.emblem || PORTRAIT_PLACEHOLDERS.crest;
  const generationCount = generationCountFor(record);
  const blurb = buildLocalTriviaBlurb(record, { generationCount });
  return `
    <a class="landing-trivia-card" href="${escapeHtml(createFamilyViewLink(record.id))}" data-trivia-id="${escapeHtml(record.id)}">
      <div class="landing-trivia-card-header">
        <img class="landing-trivia-emblem" src="${escapeHtml(emblem)}" alt="Wappen von ${escapeHtml(record.title)}">
        <h3>${escapeHtml(record.title)}</h3>
      </div>
      <p class="landing-trivia-blurb" data-ai-enhanced="false">${escapeHtml(blurb)}</p>
    </a>
  `;
}

async function enhanceCardWithAi(record, grid) {
  if (!isAleriaGptAvailable(window)) return;
  const generationCount = generationCountFor(record);
  const personCount = Number(record.personCount ?? record.family?.persons.length ?? 0);
  const profileSummary = buildShortHouseProfile(record.houseProfile || record.family?.document.houseProfile);
  const prompt = buildLandingTriviaPrompt({ title: record.title, profileSummary, personCount, generationCount });
  const result = await requestAleriaGptSuggestion(prompt, { runtime: window });
  if (!result.ok) return;
  const blurbNode = grid.querySelector(`[data-trivia-id="${CSS.escape(record.id)}"] .landing-trivia-blurb`);
  if (!blurbNode) return;
  blurbNode.textContent = result.text;
  blurbNode.dataset.aiEnhanced = 'true';
}

function renderSpotlight(fact) {
  const section = document.getElementById('landing-spotlight');
  const eyebrow = document.getElementById('landing-spotlight-eyebrow');
  const text = document.getElementById('landing-spotlight-text');
  const source = document.getElementById('landing-spotlight-source');
  if (!fact) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const isArchive = fact.flavor === 'archive';
  eyebrow.textContent = isArchive ? 'Aus den Aufzeichnungen' : 'Wusstest du schon?';
  text.textContent = isArchive ? `„${fact.text}“` : fact.text;
  if (fact.houseTitle) {
    const label = isArchive && fact.source && fact.source !== fact.houseTitle
      ? `${fact.source} · ${fact.houseTitle}`
      : fact.houseTitle;
    source.hidden = false;
    source.textContent = `— ${label}`;
  } else {
    source.hidden = true;
  }
}

function initSpotlight(records) {
  const facts = pickFactSample(records, { count: 6 });
  const nextButton = document.getElementById('landing-spotlight-next');
  if (!facts.length) {
    renderSpotlight(null);
    return;
  }
  let index = 0;
  renderSpotlight(facts[index]);
  nextButton.hidden = facts.length <= 1;
  nextButton.addEventListener('click', () => {
    index = (index + 1) % facts.length;
    renderSpotlight(facts[index]);
  });
}

function renderBioCard(preview) {
  const portrait = resolvePortraitSource(preview);
  return `
    <a class="landing-bio-card" href="${escapeHtml(createFamilyViewLink(preview.houseId, preview.personId))}">
      <img class="landing-bio-portrait" src="${escapeHtml(portrait)}" alt="Portrait von ${escapeHtml(preview.personName)}">
      <div>
        <h3>${escapeHtml(preview.personName)}</h3>
        <p>${escapeHtml(preview.excerpt)}</p>
        <p class="landing-bio-house">${escapeHtml(preview.houseTitle)}</p>
      </div>
    </a>
  `;
}

function initBioPreviews(records) {
  const bioGrid = document.getElementById('landing-bio-grid');
  const previews = pickBiographySample(records, { count: 3 });
  bioGrid.innerHTML = previews.length
    ? previews.map(renderBioCard).join('')
    : '<p class="landing-bio-empty">Noch keine ausgearbeiteten Biografien — leg in der Stammbaum-Werkstatt die erste Personenakte an.</p>';
}

const grid = document.getElementById('landing-trivia-grid');
const empty = document.getElementById('landing-trivia-empty');
const records = listFamilyRecords();
const sample = pickTriviaSample(records, { count: 4 });

if (!sample.length) {
  empty.hidden = false;
} else {
  grid.innerHTML = sample.map(renderTriviaCard).join('');
  sample.forEach(record => {
    void enhanceCardWithAi(record, grid);
  });
}

initSpotlight(records);
initBioPreviews(records);
