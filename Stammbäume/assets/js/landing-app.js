import { PORTRAIT_PLACEHOLDERS } from './config/portrait-placeholders.js';
import { createFamilyGraph } from './domain/family-graph.js';
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
