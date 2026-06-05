const ALERIA_GPT_RETRIEVAL_SCHEMA_VERSION = 1;
const ALERIA_GPT_DEFAULT_RETRIEVAL_LIMIT = 28;
const ALERIA_GPT_COMMENT_QUERY_TERMS = new Set([
  'kommentar', 'kommentare', 'kommentaren', 'reagiere', 'reagier', 'reaktion',
  'reaktionen', 'antwort', 'antworten', 'szene', 'interaktive', 'gespraech',
  'gesprach', 'stimme', 'sprecher', 'dialog', 'dialoge'
]);

const ALERIA_GPT_STOPWORDS = new Set([
  'aber', 'alle', 'alles', 'als', 'also', 'am', 'an', 'auch', 'auf', 'aus', 'bei',
  'bin', 'bis', 'bist', 'da', 'dann', 'das', 'dass', 'dem', 'den', 'der', 'des',
  'dich', 'die', 'dies', 'diese', 'dieser', 'dieses', 'dir', 'doch', 'du', 'ein',
  'eine', 'einem', 'einen', 'einer', 'eines', 'er', 'es', 'etwas', 'euch', 'fuer',
  'hat', 'hast', 'hatte', 'haben', 'hier', 'ich', 'ihm', 'ihn', 'ihr', 'ihre',
  'im', 'in', 'ist', 'ja', 'kann', 'koennen', 'mach', 'mal', 'man', 'meine',
  'meinem', 'meinen', 'mir', 'mit', 'nach', 'nicht', 'noch', 'oder', 'sich',
  'sie', 'sind', 'so', 'ueber', 'und', 'uns', 'von', 'war', 'was', 'wenn',
  'wer', 'wie', 'wir', 'wird', 'wo', 'zu', 'zum', 'zur'
]);

function normalizeAleriaGptRetrievalText(value) {
  if (typeof normalizeSearchText === 'function') return normalizeSearchText(value || '');
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compactAleriaGptRetrievalText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function truncateAleriaGptRetrievalText(value, maxLength = 2600) {
  const text = compactAleriaGptRetrievalText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function tokenizeAleriaGptRetrievalQuery(query) {
  const normalized = normalizeAleriaGptRetrievalText(query);
  const tokens = normalized
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 2 && !ALERIA_GPT_STOPWORDS.has(token));
  return Array.from(new Set(tokens));
}

function makeAleriaGptRetrievalNameKeys(character) {
  return [
    character?.id,
    character?.name,
    ...(Array.isArray(character?.aliases) ? character.aliases : [])
  ]
    .map(value => normalizeAleriaGptRetrievalText(value || ''))
    .filter(Boolean);
}

function detectAleriaGptCharacters(queryInfo, context) {
  return (context.characters || []).map(character => {
    const keys = makeAleriaGptRetrievalNameKeys(character);
    const matchedKeys = keys.filter(key =>
      key && (
        queryInfo.normalized.includes(key) ||
        queryInfo.tokens.some(token => key.split(/\s+/).includes(token))
      )
    );
    if (!matchedKeys.length) return null;
    return {
      id: String(character.id || '').trim(),
      name: String(character.name || '').trim(),
      title: String(character.title || '').trim(),
      matchedKeys: Array.from(new Set(matchedKeys))
    };
  }).filter(Boolean);
}

function detectAleriaGptModules(queryInfo, context) {
  return (context.modules || []).map(module => {
    const keys = [
      module.id,
      module.title,
      module.subtitle,
      module.type,
      module.category,
      module.section?.key,
      module.section?.tab
    ]
      .map(value => normalizeAleriaGptRetrievalText(value || ''))
      .filter(Boolean);
    const matchedKeys = keys.filter(key =>
      key && (
        queryInfo.normalized.includes(key) ||
        queryInfo.tokens.some(token => key.split(/\s+/).includes(token))
      )
    );
    if (!matchedKeys.length) return null;
    return {
      id: String(module.id || '').trim(),
      title: String(module.title || '').trim(),
      category: String(module.category || '').trim(),
      matchedKeys: Array.from(new Set(matchedKeys))
    };
  }).filter(Boolean);
}

function getAleriaGptModuleIndex(context) {
  const byId = new Map();
  (context.modules || []).forEach(module => {
    if (module?.id) byId.set(String(module.id), module);
  });
  return byId;
}

function getAleriaGptPageLabel(module, pageIndex) {
  if (!module || !Number.isFinite(pageIndex)) return '';
  const page = (module.pages || [])[pageIndex];
  return page?.title || `Seite ${pageIndex + 1}`;
}

function getAleriaGptChunkSearchText(chunk) {
  return normalizeAleriaGptRetrievalText([
    chunk.title,
    chunk.moduleTitle,
    chunk.pageTitle,
    chunk.speakerName,
    chunk.kind,
    chunk.text,
    chunk.sourceType
  ].filter(Boolean).join(' '));
}

function makeAleriaGptChunk(input) {
  const chunk = {
    chunkId: input.chunkId || `${input.sourceType}:${input.sourceRef || Math.random().toString(36).slice(2)}`,
    sourceType: input.sourceType || 'unknown',
    sourceRef: String(input.sourceRef || '').trim(),
    moduleId: String(input.moduleId || '').trim(),
    moduleTitle: String(input.moduleTitle || '').trim(),
    pageId: String(input.pageId || '').trim(),
    pageIndex: Number.isFinite(input.pageIndex) ? input.pageIndex : null,
    pageTitle: String(input.pageTitle || '').trim(),
    title: String(input.title || '').trim(),
    speakerName: String(input.speakerName || '').trim(),
    characterIds: Array.from(new Set((input.characterIds || []).map(id => String(id || '').trim()).filter(Boolean))),
    speakerNames: Array.from(new Set((input.speakerNames || []).map(name => String(name || '').trim()).filter(Boolean))),
    kind: String(input.kind || '').trim(),
    createdAt: Number.isFinite(input.createdAt) ? input.createdAt : 0,
    text: truncateAleriaGptRetrievalText(input.text || '', input.maxLength || 2600),
    metadata: input.metadata || {}
  };
  chunk.searchText = getAleriaGptChunkSearchText(chunk);
  return chunk;
}

function collectAleriaGptRetrievalChunks(context) {
  const chunks = [];
  const moduleIndex = getAleriaGptModuleIndex(context);

  (context.characters || []).forEach(character => {
    const text = [
      character.name,
      character.title,
      character.faction,
      Array.isArray(character.aliases) ? character.aliases.join(', ') : '',
      character.profileText
    ].filter(Boolean).join('\n');
    if (!compactAleriaGptRetrievalText(text)) return;
    chunks.push(makeAleriaGptChunk({
      sourceType: 'character-profile',
      sourceRef: `character:${character.id || character.name}`,
      title: character.name || character.id,
      speakerName: character.name || '',
      characterIds: [character.id],
      speakerNames: [character.name],
      text,
      maxLength: 1800,
      metadata: { faction: character.faction || '', profileLink: character.profileLink || '' }
    }));
  });

  (context.modules || []).forEach(module => {
    if (module.plainText || module.summary) {
      chunks.push(makeAleriaGptChunk({
        sourceType: 'module-overview',
        sourceRef: module.sourceRef,
        moduleId: module.id,
        moduleTitle: module.title,
        title: module.title,
        characterIds: (module.cast || []).map(item => item.characterId),
        speakerNames: (module.cast || []).map(item => item.name),
        kind: module.type || module.category || '',
        text: [
          module.title,
          module.subtitle,
          module.category,
          module.section?.tab,
          module.section?.desc,
          module.summary,
          module.plainText
        ].filter(Boolean).join('\n'),
        maxLength: 2400,
        metadata: { category: module.category || '', section: module.section?.tab || '' }
      }));
    }

    (module.pages || []).forEach(page => {
      const pageCharacterIds = new Set();
      const pageSpeakerNames = new Set();
      (page.cast || []).forEach(item => {
        if (item.characterId) pageCharacterIds.add(item.characterId);
        if (item.name) pageSpeakerNames.add(item.name);
      });
      (page.dialogue || []).forEach(item => {
        if (item.speakerCharacterId) pageCharacterIds.add(item.speakerCharacterId);
        if (item.speakerName) pageSpeakerNames.add(item.speakerName);
      });
      (page.staticComments || []).forEach(item => {
        if (item.speakerCharacterId) pageCharacterIds.add(item.speakerCharacterId);
        if (item.speakerName) pageSpeakerNames.add(item.speakerName);
      });

      if (page.plainText) {
        chunks.push(makeAleriaGptChunk({
          sourceType: 'module-page',
          sourceRef: page.sourceRef,
          moduleId: module.id,
          moduleTitle: module.title,
          pageId: page.pageId,
          pageIndex: page.index,
          pageTitle: page.title,
          title: `${module.title} - ${page.title}`,
          characterIds: Array.from(pageCharacterIds),
          speakerNames: Array.from(pageSpeakerNames),
          kind: page.type,
          text: page.plainText,
          maxLength: 2200,
          metadata: { category: module.category || '', section: module.section?.tab || '' }
        }));
      }

      (page.dialogue || []).forEach((item, index) => {
        chunks.push(makeAleriaGptChunk({
          sourceType: 'scene-dialogue',
          sourceRef: item.sourceRef,
          moduleId: module.id,
          moduleTitle: module.title,
          pageId: page.pageId,
          pageIndex: page.index,
          pageTitle: page.title,
          title: `${module.title} - ${page.title}`,
          speakerName: item.speakerName,
          characterIds: [item.speakerCharacterId],
          speakerNames: [item.speakerName],
          kind: item.kind,
          text: item.plainText,
          metadata: { side: item.side || '', order: index }
        }));
      });

      (page.staticComments || []).forEach((item, index) => {
        chunks.push(makeAleriaGptChunk({
          sourceType: 'static-comment',
          sourceRef: item.sourceRef,
          moduleId: module.id,
          moduleTitle: module.title,
          pageId: page.pageId,
          pageIndex: page.index,
          pageTitle: page.title,
          title: `${module.title} - ${page.title}`,
          speakerName: item.speakerName,
          characterIds: [item.speakerCharacterId],
          speakerNames: [item.speakerName],
          kind: item.kind,
          text: item.plainText,
          metadata: { side: item.side || '', order: index }
        }));
      });
    });
  });

  (context.comments || []).forEach(comment => {
    const module = moduleIndex.get(comment.moduleId);
    (comment.segments || []).forEach((segment, index) => {
      chunks.push(makeAleriaGptChunk({
        sourceType: 'stored-comment-segment',
        sourceRef: segment.sourceRef,
        moduleId: comment.moduleId,
        moduleTitle: module?.title || comment.moduleId,
        pageIndex: comment.pageIndex,
        pageTitle: getAleriaGptPageLabel(module, comment.pageIndex),
        title: module?.title || comment.moduleId,
        speakerName: segment.speakerName,
        characterIds: [segment.speakerCharacterId],
        speakerNames: [segment.speakerName],
        kind: segment.kind,
        createdAt: Number(comment.updatedAt || comment.createdAt || 0),
        text: segment.plainText,
        metadata: {
          commentId: comment.commentId,
          threadId: comment.threadId,
          threadKind: comment.threadKind,
          side: segment.side || '',
          order: index
        }
      }));
    });
  });

  return chunks.filter(chunk => chunk.text || chunk.title || chunk.speakerName);
}

function chunkMatchesAleriaGptCharacter(chunk, detectedCharacter) {
  if (!detectedCharacter) return false;
  const id = String(detectedCharacter.id || '').trim();
  if (id && (chunk.characterIds || []).includes(id)) return true;
  const nameKey = normalizeAleriaGptRetrievalText(detectedCharacter.name || '');
  if (!nameKey) return false;
  return (chunk.speakerNames || []).some(name => normalizeAleriaGptRetrievalText(name) === nameKey)
    || normalizeAleriaGptRetrievalText(chunk.speakerName || '') === nameKey;
}

function scoreAleriaGptChunk(chunk, queryInfo) {
  let score = 0;
  const reasons = [];

  const sourceWeights = {
    'character-profile': 9,
    'module-overview': 6,
    'stored-comment-segment': 12,
    'scene-dialogue': 11,
    'static-comment': 9,
    'module-page': 5
  };
  score += sourceWeights[chunk.sourceType] || 1;

  const phrase = queryInfo.normalized;
  if (phrase && chunk.searchText.includes(phrase)) {
    score += 24;
    reasons.push('phrase');
  }

  let tokenHits = 0;
  queryInfo.tokens.forEach(token => {
    if (!token) return;
    if (chunk.searchText.includes(token)) {
      tokenHits += 1;
    }
  });
  if (tokenHits) {
    score += tokenHits * 4;
    reasons.push(`tokens:${tokenHits}`);
  }

  const characterHits = queryInfo.characters.filter(character => chunkMatchesAleriaGptCharacter(chunk, character));
  if (characterHits.length) {
    score += 48 + Math.min(24, characterHits.length * 8);
    reasons.push(`character:${characterHits.map(item => item.name || item.id).join(',')}`);
  }

  const moduleHits = queryInfo.modules.filter(module => module.id && module.id === chunk.moduleId);
  if (moduleHits.length) {
    score += 32;
    reasons.push(`module:${moduleHits.map(item => item.title || item.id).join(',')}`);
  }

  if (queryInfo.scope?.moduleId && queryInfo.scope.moduleId === chunk.moduleId) {
    score += 18;
    reasons.push('scope-module');
  }

  if (queryInfo.wantsComments && (
    chunk.sourceType === 'stored-comment-segment' ||
    chunk.sourceType === 'static-comment' ||
    chunk.sourceType === 'scene-dialogue'
  )) {
    score += 26;
    reasons.push('comment-context');
  }

  if (queryInfo.wantsComments && queryInfo.scope?.moduleId && queryInfo.scope.moduleId === chunk.moduleId) {
    score += 16;
    reasons.push('current-comment-context');
  }

  if (chunk.createdAt) {
    score += Math.min(6, Math.max(0, (chunk.createdAt || 0) / 1000000000000));
  }

  if (!queryInfo.tokens.length && !queryInfo.characters.length && !queryInfo.modules.length) {
    score = chunk.sourceType === 'module-page' ? 1 : 2;
  }

  return { score, reasons };
}

function buildAleriaGptQueryInfo(query, context, options = {}) {
  const detectionSource = [
    query,
    options.characterName,
    options.characterId,
    options.moduleId,
    options.entryId
  ].filter(Boolean).join(' ');
  const normalized = normalizeAleriaGptRetrievalText(detectionSource);
  const tokens = tokenizeAleriaGptRetrievalQuery(detectionSource);
  const wantsComments = tokens.some(token => ALERIA_GPT_COMMENT_QUERY_TERMS.has(token));
  const base = { raw: String(query || '').trim(), normalized, tokens };
  const characters = detectAleriaGptCharacters(base, context);
  const modules = detectAleriaGptModules(base, context);
  return {
    ...base,
    characters,
    modules,
    wantsComments,
    scope: {
      kind: String(options.scope || options.kind || 'all').trim() || 'all',
      moduleId: String(options.moduleId || options.entryId || '').trim(),
      characterId: String(options.characterId || '').trim(),
      characterName: String(options.characterName || '').trim()
    }
  };
}

function rankAleriaGptChunks(chunks, queryInfo, limit) {
  return chunks
    .map(chunk => {
      const scored = scoreAleriaGptChunk(chunk, queryInfo);
      return { ...chunk, score: Math.round(scored.score * 100) / 100, scoreReasons: scored.reasons };
    })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .slice(0, Math.max(1, Number(limit) || ALERIA_GPT_DEFAULT_RETRIEVAL_LIMIT));
}

function buildAleriaGptPromptContext(retrieval) {
  const detectedCharacters = (retrieval.detected.characters || [])
    .map(character => `${character.name || character.id}${character.title ? ` (${character.title})` : ''}`)
    .join(', ') || 'keine eindeutige Figur erkannt';
  const detectedModules = (retrieval.detected.modules || [])
    .map(module => `${module.title || module.id}${module.category ? ` (${module.category})` : ''}`)
    .join(', ') || 'kein eindeutiges Modul erkannt';

  const lines = [
    'AleriaGPT Kontextpaket',
    `Frage: ${retrieval.query}`,
    `Erkannte Figuren: ${detectedCharacters}`,
    `Erkannte Module: ${detectedModules}`,
    `Kommentar-/Szenenfrage: ${retrieval.detected.wantsComments ? 'ja' : 'nein'}`,
    '',
    'Regel: Nutze nur die folgenden Quellen. Trenne belegte Beobachtung und Interpretation.',
    'Wenn Kommentarquellen vorhanden sind, beziehe dich konkret auf die Sprechertexte und nicht nur auf allgemeine Moduldaten.',
    ''
  ];

  retrieval.chunks.forEach((chunk, index) => {
    lines.push(`[${index + 1}] ${chunk.sourceType} | ${chunk.sourceRef}`);
    if (chunk.moduleTitle) lines.push(`Modul: ${chunk.moduleTitle}`);
    if (chunk.pageTitle) lines.push(`Seite: ${chunk.pageTitle}`);
    if (chunk.speakerName) lines.push(`Sprecher: ${chunk.speakerName}`);
    if (chunk.kind) lines.push(`Typ: ${chunk.kind}`);
    if (chunk.metadata?.category) lines.push(`Kategorie: ${chunk.metadata.category}`);
    if (chunk.metadata?.section) lines.push(`Abschnitt: ${chunk.metadata.section}`);
    if (chunk.metadata?.side) lines.push(`Sprecherseite: ${chunk.metadata.side}`);
    if (chunk.metadata?.threadKind) lines.push(`Kommentarbereich: ${chunk.metadata.threadKind}`);
    lines.push(`Text: ${truncateAleriaGptRetrievalText(chunk.text, 900)}`);
    lines.push('');
  });

  return lines.join('\n');
}

async function retrieveAleriaGptContext(query, options = {}) {
  const context = options.context || await window.AleriaGptContext.buildContext(options);
  const queryInfo = buildAleriaGptQueryInfo(query, context, options);
  const chunks = collectAleriaGptRetrievalChunks(context);
  const rankedChunks = rankAleriaGptChunks(
    chunks,
    queryInfo,
    Number.isFinite(Number(options.limit)) ? Number(options.limit) : ALERIA_GPT_DEFAULT_RETRIEVAL_LIMIT
  );
  const payload = {
    type: 'aleria-gpt-retrieval',
    schemaVersion: ALERIA_GPT_RETRIEVAL_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    query: String(query || '').trim(),
    sourceHash: context.sourceHash || '',
    detected: {
      tokens: queryInfo.tokens,
      characters: queryInfo.characters,
      modules: queryInfo.modules,
      wantsComments: queryInfo.wantsComments
    },
    stats: {
      totalChunks: chunks.length,
      returnedChunks: rankedChunks.length,
      characterCount: context.characters?.length || 0,
      moduleCount: context.modules?.length || 0,
      commentCount: context.comments?.length || 0
    },
    chunks: rankedChunks
  };
  payload.promptContext = buildAleriaGptPromptContext(payload);
  return payload;
}

window.AleriaGptRetrieval = {
  retrieve: retrieveAleriaGptContext,
  buildChunks: collectAleriaGptRetrievalChunks,
  buildPromptContext: buildAleriaGptPromptContext,
  tokenizeQuery: tokenizeAleriaGptRetrievalQuery
};

window.retrieveAleriaGptContext = retrieveAleriaGptContext;
