function saveCharacterInventoryQuizAnswer(page) {
  const data = getCharacterInventoryPageData(page);
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const answer = String(page.querySelector('[data-ci-quiz-answer]')?.value || '').trim();
  quiz.answers[quiz.step] = answer;
  quiz.updatedAt = new Date().toISOString();
  data.equipmentQuiz = quiz;
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged;
}

function updateCharacterInventoryQuiz(page, updater) {
  const data = getCharacterInventoryPageData(page);
  data.equipmentQuiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  updater(data.equipmentQuiz, data);
  data.equipmentQuiz.updatedAt = new Date().toISOString();
  const merged = mergeCharacterInventoryDataWithItemDb(data);
  page.dataset.ciData = JSON.stringify(data);
  const quiz = page.querySelector('.ci-equipment-quiz');
  if (quiz) quiz.outerHTML = buildCharacterInventoryEquipmentQuiz(merged);
  if (typeof syncCharacterInventoryProfileDraftFromPage === 'function') syncCharacterInventoryProfileDraftFromPage(page);
  return merged;
}

async function buildCharacterInventoryMarketContext() {
  if (typeof itemDbLoadMarketSources === 'function') {
    try {
      await itemDbLoadMarketSources();
    } catch (error) {
      console.warn('Item- und Güterquellen konnten für AleriaGPT nicht geladen werden:', error);
    }
  }
  const items = typeof itemDbBuildIndex === 'function' ? itemDbBuildIndex() : [];
  const priced = items
    .filter(item => item?.title && (item.price || item.currency || item.description || item.details))
    .slice(0, 120)
    .map(item => `${item.title} | ${item.categoryLabel || item.category || 'Kategorie offen'} | ${[item.price, item.currency].filter(Boolean).join(' ') || 'Preis offen'} | ${item.description || item.details || ''}`.trim());
  return [
    'Währungsregel: 1 Goldtaler = 10 Silbertaler = 1.000 Kupfertaler. 1 Silbertaler = 100 Kupfertaler. Kupfer ist die Basis für Berechnungen.',
    'Preisanker: Ein billiges Pferd liegt ungefähr bei 100 bis 500 Kupfer. Ein Adelspferd kann bis zu 120 Goldtaler kosten, also bis zu 120.000 Kupfer. Alltagswaren wie Brot oder Öl sind im niedrigen Kupferbereich einzuordnen.',
    priced.length ? `Vorhandene Waren und Items:\n${priced.join('\n')}` : 'Im Item- und Güterverzeichnis wurden keine auswertbaren Preise gefunden.'
  ].join('\n\n');
}

function buildCharacterInventoryQuizFallback(data = {}) {
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const joined = quiz.answers.join(' ').toLowerCase();
  let totalCopper = 300;
  if (/adel|adlig|haus|ritter|hof|patrizier|gilde/.test(joined)) totalCopper += 3200;
  if (/arm|bettler|schuld|flucht|waise/.test(joined)) totalCopper = Math.max(80, totalCopper - 220);
  if (/soldat|wache|söldner|kampf|krieg|ritter/.test(joined)) totalCopper += 900;
  if (/pferd|reittier|kutsche|wagen/.test(joined)) totalCopper += /adel|edl|ritter/.test(joined) ? 120000 : 500;
  const money = splitCharacterInventoryCopper(totalCopper);
  const suggestions = [
    /kampf|soldat|wache|ritter/.test(joined) ? 'eine passende Hauptwaffe, Ersatzriemen, Pflegeöl und ein einfacher Schutz' : 'ein Messer, robuste Kleidung und ein kleiner Vorratsbeutel',
    /reise|wandern|straße|karawane/.test(joined) ? 'Reiseausrüstung mit Seil, Feuerzeug, Öl, Brot, Wasserbeutel und wetterfestem Mantel' : 'Alltagswerkzeuge passend zum Beruf',
    /pferd|reittier/.test(joined) ? 'ein Reittier mit Sattelzeug; Qualität nach Stand und Vermögen staffeln' : 'kein Reittier, außer die Antworten nennen Besitz, Dienst oder adelige Versorgung'
  ];
  return [
    `Lokale Auswertung ohne AleriaGPT-Backend: Startgeld etwa ${money.gold} Gold, ${money.silver} Silber, ${money.copper} Kupfer (${money.totalCopper} Kupfer).`,
    `Plausible Ausrüstung: ${suggestions.join('; ')}.`,
    'Für eine genauere Liste sollte AleriaGPT mit dem Item- und Güterverzeichnis verbunden sein.'
  ].join('\n\n');
}

function buildCharacterInventoryQuizPrompt(data = {}, marketContext = '') {
  const quiz = sanitizeCharacterInventoryEquipmentQuiz(data.equipmentQuiz);
  const answers = CHARACTER_INVENTORY_EQUIPMENT_QUIZ_QUESTIONS.map((question, index) => (
    `${index + 1}. ${question}\nAntwort: ${quiz.answers[index] || 'Keine Antwort'}`
  )).join('\n\n');
  return [
    'Ermittle für diese Aleria-Charakterfigur eine glaubwürdige Startausrüstung und einen Geldbestand.',
    'Berücksichtige zwingend die Währungsregel, die Preisanker und die vorhandenen Warenpreise aus dem Kontext. Rechne Geld immer auch in Kupferbasis.',
    'Antworte strukturiert mit: Reichtumsstufe, Startgeld in Gold/Silber/Kupfer und Kupfergesamtwert, empfohlene Items nach Waffen/Rüstungen/Ausrüstung/Trinkturen/Dokumente/Sonstiges, teure Besitzwerte wie Pferde separat, kurze Begründung.',
    `Charakter: ${data.name || 'Unbenannt'} | Rolle: ${data.role || 'offen'} | Status: ${data.status || 'offen'}`,
    `Antworten:\n${answers}`,
    `Kontext:\n${marketContext}`
  ].join('\n\n');
}

async function runCharacterInventoryEquipmentQuiz(page) {
  saveCharacterInventoryQuizAnswer(page);
  updateCharacterInventoryQuiz(page, quiz => {
    quiz.open = true;
    quiz.status = 'AleriaGPT wertet Antworten und Warenpreise aus...';
  });
  const data = getCharacterInventoryPageData(page);
  const marketContext = await buildCharacterInventoryMarketContext();
  const prompt = buildCharacterInventoryQuizPrompt(data, marketContext);
  let resultText = '';
  let status = '';
  if (window.AleriaGptClient?.isConfigured?.()) {
    try {
      const response = await window.AleriaGptClient.sendChat(prompt, {
        promptContext: marketContext,
        chunks: [{ sourceType: 'character-inventory', kind: 'equipment-quiz', text: marketContext, score: 1 }]
      }, {
        answerStyle: 'structured',
        responseMode: 'chat',
        sourceLimit: 8,
        timeoutMs: 45000
      });
      resultText = response.ok && response.text ? response.text : buildCharacterInventoryQuizFallback(data);
      status = response.ok ? 'AleriaGPT-Auswertung abgeschlossen.' : 'AleriaGPT war nicht erreichbar; lokale Auswertung verwendet.';
    } catch (error) {
      console.warn('AleriaGPT-Ausrüstungsfragebogen fehlgeschlagen:', error);
      resultText = buildCharacterInventoryQuizFallback(data);
      status = 'AleriaGPT war nicht erreichbar; lokale Auswertung verwendet.';
    }
  } else {
    resultText = buildCharacterInventoryQuizFallback(data);
    status = 'AleriaGPT-Backend ist nicht konfiguriert; lokale Auswertung verwendet.';
  }
  updateCharacterInventoryQuiz(page, quiz => {
    quiz.open = true;
    quiz.resultText = resultText;
    quiz.status = status;
  });
}
