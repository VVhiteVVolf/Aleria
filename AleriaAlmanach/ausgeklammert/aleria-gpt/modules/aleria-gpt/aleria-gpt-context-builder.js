const ALERIA_GPT_CONTEXT_SCHEMA_VERSION = 1;

function normalizeAleriaGptKey(value) {
  if (typeof normalizeSearchText === 'function') return normalizeSearchText(value || '');
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compactAleriaGptText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeAleriaGptEntities(value) {
  const text = String(value || '');
  if (!text || typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function toAleriaGptPlainText(value) {
  let text = String(value || '');
  if (!text) return '';

  text = text
    .replace(/\{emote:\d+\}/g, ' ')
    .replace(/\{tip:[^}]*\}([\s\S]*?)\{\/tip\}/g, '$1')
    .replace(/\{(?:action|thought|whisper|ooc)\}([\s\S]*?)\{\/(?:action|thought|whisper|ooc)\}/g, '$1')
    .replace(/\[([^\]\s]+)\]([\s\S]*?)\[\/\1\]/g, '$2')
    .replace(/\|\|([\s\S]*?)\|\|/g, '$1')
    .replace(/\*\*\*([\s\S]*?)\*\*\*/g, '$1')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/__([\s\S]*?)__/g, '$1')
    .replace(/\*([\s\S]*?)\*/g, '$1')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/blockquote>|<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');

  return compactAleriaGptText(decodeAleriaGptEntities(text));
}

function hashAleriaGptSource(value) {
  const input = String(value || '');
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getAleriaGptTimestampValue(value) {
  if (!value) return 0;
  if (Number.isFinite(Number(value))) return Number(value);
  if (Number.isFinite(Number(value.seconds))) return Number(value.seconds) * 1000;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAleriaGptEntryPages(entry) {
  if (typeof getPages === 'function') return getPages(entry);
  if (Array.isArray(entry?.pages)) return entry.pages;
  return entry ? [entry] : [];
}

function getAleriaGptPageType(page) {
  if (typeof inferModulePageType === 'function') return inferModulePageType(page);
  if (page?.sessionPage) return 'session';
  if (page?.sceneBlocks?.length) return 'scene';
  if (page?.profilePage) return 'profiles';
  if (page?.wantedPage) return 'wanted';
  if (page?.biographyPage) return 'biography';
  if (page?.bestiaryPage) return 'bestiary';
  if (page?.questFilePage) return 'quest-file';
  if (page?.artifactPage) return 'artifact';
  if (page?.recipePage) return 'recipe';
  if (page?.tournamentPage) return 'tournament';
  if (page?.tournamentLeaguePage) return 'tournament-league';
  if (page?.castePage) return 'caste';
  if (page?.courtPage) return 'court';
  return 'standard';
}

function isAleriaGptCharacterSceneBlock(type) {
  if (typeof isCharacterSceneBlockType === 'function') return isCharacterSceneBlockType(type);
  const value = String(type || 'speech');
  return value === 'speech' || value === 'thought';
}

function getAleriaGptCommentKind(kind, narrator = false) {
  if (typeof normalizeCommentKind === 'function') return normalizeCommentKind(kind, narrator);
  if (narrator) return 'narrator';
  const value = String(kind || 'speech').toLowerCase();
  return ['speech', 'action', 'thought', 'whisper', 'shout'].includes(value) ? value : 'speech';
}

function getAleriaGptCharacterIndex(characters) {
  const byId = new Map();
  const byNameKey = new Map();

  characters.forEach(character => {
    const id = String(character?.id || '').trim();
    if (id) byId.set(id, character);
    [character?.name, ...(Array.isArray(character?.aliases) ? character.aliases : [])].forEach(name => {
      const key = normalizeAleriaGptKey(name || '');
      if (key && !byNameKey.has(key)) byNameKey.set(key, character);
    });
  });

  return { byId, byNameKey };
}

function resolveAleriaGptCharacter(payload, characterIndex) {
  const id = String(payload?.characterId || payload?.id || '').trim();
  if (id && characterIndex.byId.has(id)) return characterIndex.byId.get(id);

  const name = String(payload?.name || payload?.charName || payload?.speakerName || '').trim();
  const key = normalizeAleriaGptKey(name);
  return key ? characterIndex.byNameKey.get(key) || null : null;
}

function makeAleriaGptCharacterRef(character, fallback = {}) {
  const name = String(character?.name || fallback.name || fallback.charName || fallback.speakerName || '').trim();
  return {
    characterId: String(character?.id || fallback.characterId || fallback.id || '').trim(),
    name,
    title: String(character?.title || fallback.title || fallback.charTitle || '').trim()
  };
}

function collectAleriaGptCharacters(options = {}) {
  const source = typeof getAllCharacterRecords === 'function' ? getAllCharacterRecords() : [];
  return source.map(character => {
    const structuredFacts = [];
    collectAleriaGptStructuredFacts(character, structuredFacts, 'charakter', 0, {
      skipKeys: new Set(['portrait', 'profileLink'])
    });
    const next = {
      id: String(character?.id || '').trim(),
      name: String(character?.name || '').trim(),
      aliases: Array.isArray(character?.aliases) ? character.aliases.map(alias => String(alias || '').trim()).filter(Boolean) : [],
      title: String(character?.title || '').trim(),
      faction: String(character?.fraktion || character?.faction || '').trim(),
      profileLink: String(character?.profileLink || '').trim(),
      profileText: Array.from(new Set([
        toAleriaGptPlainText(character?.bio || character?.description || ''),
        ...structuredFacts
      ].filter(Boolean))).join('\n')
    };
    if (options.includePrivate) {
      next.playerOwner = typeof getCharacterPlayerOwnerLabel === 'function'
        ? getCharacterPlayerOwnerLabel(character?.playerOwner || character?.playedBy || character?.player)
        : String(character?.playerOwner || character?.playedBy || character?.player || '').trim();
    }
    return next;
  }).filter(character => character.id || character.name);
}

function collectAleriaGptCast(source, characterIndex) {
  const cast = [];
  const seen = new Set();
  const pushRef = payload => {
    const character = resolveAleriaGptCharacter(payload, characterIndex);
    const ref = makeAleriaGptCharacterRef(character, payload);
    const key = ref.characterId || normalizeAleriaGptKey(ref.name);
    if (!key || seen.has(key)) return;
    seen.add(key);
    cast.push({
      characterId: ref.characterId,
      name: ref.name,
      role: String(payload?.role || '').trim()
    });
  };

  if (typeof getModuleCastDetailsFromSource === 'function') {
    getModuleCastDetailsFromSource(source).forEach(pushRef);
  }
  if (typeof getModuleCastIdsFromSource === 'function') {
    getModuleCastIdsFromSource(source).forEach(id => pushRef({ characterId: id, id }));
  }
  (Array.isArray(source?.sessionCastDetails) ? source.sessionCastDetails : []).forEach(pushRef);
  (Array.isArray(source?.sessionCast) ? source.sessionCast : []).forEach(id => pushRef({ characterId: id, id }));

  return cast;
}

function pushAleriaGptTextFragment(target, value) {
  const text = toAleriaGptPlainText(value);
  if (text) target.push(text);
}

function isAleriaGptTechnicalField(path) {
  const key = String(path || '').toLowerCase();
  return /(?:^|\.)(id|uuid|key|schema|version|src|url|href|link|image|img|avatar|portrait|background|icon|color|style|class|html)(?:$|\.)/.test(key);
}

function formatAleriaGptFactLabel(path) {
  return String(path || 'Feld')
    .split('.')
    .filter(Boolean)
    .slice(-3)
    .join(' > ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
}

function pushAleriaGptFact(target, path, value) {
  if (!path || isAleriaGptTechnicalField(path)) return;
  const text = toAleriaGptPlainText(value);
  if (!text) return;
  target.push(`${formatAleriaGptFactLabel(path)}: ${text}`);
}

function collectAleriaGptStructuredFacts(value, target, path = '', depth = 0, options = {}) {
  if (depth > 5 || value == null) return;
  const skipKeys = options.skipKeys || new Set();

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    pushAleriaGptFact(target, path, value);
    return;
  }

  if (Array.isArray(value)) {
    const primitiveValues = value.filter(item =>
      typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
    );
    if (primitiveValues.length === value.length) {
      pushAleriaGptFact(target, path, primitiveValues.join(', '));
      return;
    }
    value.forEach((item, index) => collectAleriaGptStructuredFacts(item, target, `${path}.${index}`, depth + 1, options));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (skipKeys.has(key)) return;
      const nextPath = path ? `${path}.${key}` : key;
      if (isAleriaGptTechnicalField(nextPath)) return;
      collectAleriaGptStructuredFacts(item, target, nextPath, depth + 1, options);
    });
  }
}

function collectAleriaGptGenericText(value, target, path = '', depth = 0) {
  if (depth > 5 || value == null) return;
  if (typeof value === 'string' || typeof value === 'number') {
    const pathKey = path.toLowerCase();
    if (/image|avatar|portrait|background|url|link|src|id|schema/.test(pathKey)) return;
    pushAleriaGptTextFragment(target, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectAleriaGptGenericText(item, target, `${path}.${index}`, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      if (['sceneBlocks', 'commentSequence', 'commentator', 'sessionCast', 'sessionCastDetails'].includes(key)) return;
      collectAleriaGptGenericText(item, target, path ? `${path}.${key}` : key, depth + 1);
    });
  }
}

function collectAleriaGptDialogue(page, entryId, pageIndex, characterIndex) {
  return (Array.isArray(page?.sceneBlocks) ? page.sceneBlocks : [])
    .map((block, blockIndex) => {
      const type = String(block?.type || 'speech').trim() || 'speech';
      if (!isAleriaGptCharacterSceneBlock(type)) return null;
      const character = resolveAleriaGptCharacter({ name: block?.name }, characterIndex);
      const speaker = makeAleriaGptCharacterRef(character, {
        name: block?.name,
        title: block?.title || ''
      });
      const text = toAleriaGptPlainText(block?.text || '');
      if (!speaker.name && !text) return null;
      return {
        speakerCharacterId: speaker.characterId,
        speakerName: speaker.name,
        kind: type,
        side: String(block?.side || 'left') === 'right' ? 'right' : 'left',
        plainText: text,
        sourceRef: `module:${entryId}:page:${pageIndex}:sceneBlock:${blockIndex}`
      };
    })
    .filter(Boolean);
}

function collectAleriaGptStaticComments(page, entryId, pageIndex, characterIndex) {
  return (Array.isArray(page?.commentSequence) ? page.commentSequence : [])
    .map((comment, commentIndex) => {
      const narrator = !!comment?.narrator;
      const character = narrator ? null : resolveAleriaGptCharacter({
        name: comment?.name || comment?.charName,
        characterId: comment?.characterId
      }, characterIndex);
      const speaker = narrator
        ? { characterId: '', name: 'Erzaehler', title: '' }
        : makeAleriaGptCharacterRef(character, comment);
      const text = toAleriaGptPlainText(comment?.text || '');
      if (!speaker.name && !text) return null;
      return {
        speakerCharacterId: speaker.characterId,
        speakerName: speaker.name,
        kind: getAleriaGptCommentKind(comment?.kind || comment?.commentKind || 'speech', narrator),
        side: narrator ? '' : (String(comment?.side || 'left') === 'right' ? 'right' : 'left'),
        plainText: text,
        sourceRef: `module:${entryId}:page:${pageIndex}:commentSequence:${commentIndex}`
      };
    })
    .filter(Boolean);
}

function collectAleriaGptPage(page, entry, pageIndex, characterIndex) {
  const entryId = String(entry?.id || '').trim();
  const textFragments = [];
  const structuredFacts = [];
  pushAleriaGptTextFragment(textFragments, page?.pageTitle || '');
  pushAleriaGptTextFragment(textFragments, page?.description || '');
  pushAleriaGptTextFragment(textFragments, page?.quote || '');
  pushAleriaGptTextFragment(textFragments, page?.quoteBy || '');
  pushAleriaGptTextFragment(textFragments, page?.sessionIntro || '');
  pushAleriaGptTextFragment(textFragments, page?.sessionHint || '');
  collectAleriaGptStructuredFacts(page, structuredFacts, 'seite', 0, {
    skipKeys: new Set(['sceneBlocks', 'commentSequence', 'commentator', 'sessionCast', 'sessionCastDetails'])
  });
  collectAleriaGptGenericText(page, textFragments);

  const dialogue = collectAleriaGptDialogue(page, entryId, pageIndex, characterIndex);
  const staticComments = collectAleriaGptStaticComments(page, entryId, pageIndex, characterIndex);
  dialogue.forEach(item => pushAleriaGptTextFragment(textFragments, item.plainText));
  staticComments.forEach(item => pushAleriaGptTextFragment(textFragments, item.plainText));

  return {
    pageId: `${entryId}:p${pageIndex}`,
    index: pageIndex,
    title: String(page?.pageTitle || `Seite ${pageIndex + 1}`).trim(),
    type: getAleriaGptPageType(page),
    sourceRef: `module:${entryId}:page:${pageIndex}`,
    cast: collectAleriaGptCast(page, characterIndex),
    plainText: Array.from(new Set([...textFragments, ...structuredFacts])).join('\n'),
    dialogue,
    staticComments
  };
}

function collectAleriaGptModules(characterIndex) {
  const sections = typeof getValidSections === 'function' ? getValidSections() : [];
  const modules = [];
  const seen = new Set();

  sections.forEach(section => {
    (section.entries || []).forEach(entry => {
      const entryId = String(entry?.id || '').trim();
      if (!entryId || seen.has(entryId)) return;
      seen.add(entryId);
      const moduleFacts = [];
      pushAleriaGptTextFragment(moduleFacts, entry?.title || '');
      pushAleriaGptTextFragment(moduleFacts, entry?.subtitle || '');
      pushAleriaGptTextFragment(moduleFacts, entry?.category || '');
      pushAleriaGptTextFragment(moduleFacts, section?.desc || '');
      collectAleriaGptStructuredFacts(entry, moduleFacts, 'modul', 0, {
        skipKeys: new Set(['pages', 'sceneBlocks', 'commentSequence', 'sessionCast', 'sessionCastDetails'])
      });
      const pages = getAleriaGptEntryPages(entry).map((page, pageIndex) =>
        collectAleriaGptPage(page, entry, pageIndex, characterIndex)
      );
      modules.push({
        id: entryId,
        title: String(entry?.title || '').trim(),
        subtitle: String(entry?.subtitle || '').trim(),
        type: String(entry?.type || '').trim(),
        category: String(entry?.category || section?.tab || section?.key || '').trim(),
        section: {
          key: String(section?.key || '').trim(),
          tab: String(section?.tab || section?.key || '').trim(),
          desc: String(section?.desc || '').trim()
        },
        summary: toAleriaGptPlainText(entry?.subtitle || entry?.category || ''),
        plainText: Array.from(new Set(moduleFacts)).join('\n'),
        sourceRef: `module:${entryId}`,
        cast: collectAleriaGptCast(entry, characterIndex),
        pages
      });
    });
  });

  return modules;
}

function getAleriaGptCommentSegments(comment, characterIndex) {
  const narrator = !!comment?.narrator || String(comment?.commentMode || '') === 'narrator';
  const baseCharacter = narrator ? null : resolveAleriaGptCharacter({
    characterId: comment?.characterId,
    name: comment?.charName
  }, characterIndex);
  const baseSpeaker = narrator
    ? { characterId: '', name: 'Erzaehler', title: '' }
    : makeAleriaGptCharacterRef(baseCharacter, {
        characterId: comment?.characterId,
        name: comment?.charName,
        title: comment?.charTitle
      });

  const sourceSegments = Array.isArray(comment?.commentSegments) && comment.commentSegments.length
    ? comment.commentSegments
    : [{ text: comment?.text || '', kind: comment?.commentKind || (narrator ? 'narrator' : 'speech') }];

  return sourceSegments.map((segment, segmentIndex) => {
    const segmentNarrator = narrator || !!segment?.narrator;
    const segmentCharacter = segmentNarrator ? null : resolveAleriaGptCharacter({
      characterId: segment?.characterId || baseSpeaker.characterId,
      name: segment?.name || segment?.charName || baseSpeaker.name
    }, characterIndex);
    const speaker = segmentNarrator
      ? { characterId: '', name: 'Erzaehler', title: '' }
      : makeAleriaGptCharacterRef(segmentCharacter, {
          characterId: segment?.characterId || baseSpeaker.characterId,
          name: segment?.name || segment?.charName || baseSpeaker.name,
          title: segment?.title || baseSpeaker.title
        });
    const kind = getAleriaGptCommentKind(segment?.kind || comment?.commentKind, segmentNarrator);
    return {
      speakerCharacterId: speaker.characterId,
      speakerName: speaker.name,
      kind,
      side: kind === 'action' || segmentNarrator ? '' : (String(segment?.side || 'left') === 'right' ? 'right' : 'left'),
      plainText: toAleriaGptPlainText(segment?.text || ''),
      sourceRef: `comment:${comment?.id || 'unknown'}:segment:${segmentIndex}`
    };
  }).filter(segment => segment.speakerName || segment.plainText);
}

async function loadAleriaGptComments() {
  try {
    const backend = typeof getCommentBackend === 'function'
      ? await getCommentBackend({ timeoutMs: 2500 })
      : window._fb;
    if (typeof backend?.loadAllComments === 'function') {
      const comments = await backend.loadAllComments();
      return Array.isArray(comments) ? comments : [];
    }
  } catch (error) {
    console.warn('AleriaGPT comments load failed:', error);
  }
  return [];
}

function collectAleriaGptStoredComments(comments, characterIndex) {
  return (Array.isArray(comments) ? comments : []).map(comment => {
    const threadId = String(comment?.entryId || comment?.threadId || '').trim();
    const location = typeof parseCommentThreadLocation === 'function'
      ? parseCommentThreadLocation(threadId)
      : { raw: threadId, baseEntryId: threadId, pageIndex: null, kind: 'entry' };
    return {
      commentId: String(comment?.id || '').trim(),
      threadId,
      moduleId: String(location.baseEntryId || threadId).trim(),
      pageIndex: Number.isFinite(location.pageIndex) ? location.pageIndex : null,
      threadKind: String(location.kind || '').trim(),
      createdAt: getAleriaGptTimestampValue(comment?.ts || comment?.createdAt),
      updatedAt: getAleriaGptTimestampValue(comment?.editedAt || comment?.updatedAt),
      commentMode: String(comment?.commentMode || (comment?.narrator ? 'narrator' : 'character')).trim(),
      segments: getAleriaGptCommentSegments(comment, characterIndex)
    };
  }).filter(comment => comment.commentId || comment.segments.length);
}

function normalizeAleriaGptScope(options = {}) {
  return {
    kind: String(options.scope || options.kind || 'all').trim() || 'all',
    moduleId: String(options.moduleId || options.entryId || '').trim(),
    characterId: String(options.characterId || '').trim(),
    characterName: String(options.characterName || '').trim()
  };
}

function getAleriaGptScopeCharacterIds(scope, characterIndex) {
  if (!scope.characterId && !scope.characterName) return new Set();
  const character = resolveAleriaGptCharacter({
    characterId: scope.characterId,
    name: scope.characterName
  }, characterIndex);
  return new Set([scope.characterId, character?.id].map(value => String(value || '').trim()).filter(Boolean));
}

function filterAleriaGptContextByScope(payload, scope, characterIndex) {
  if (!scope || scope.kind === 'all') return payload;

  const characterIds = getAleriaGptScopeCharacterIds(scope, characterIndex);
  const characterNameKey = normalizeAleriaGptKey(scope.characterName);
  const matchesCharacter = item => {
    const id = String(item?.speakerCharacterId || item?.characterId || '').trim();
    if (id && characterIds.has(id)) return true;
    return !!characterNameKey && normalizeAleriaGptKey(item?.speakerName || item?.name || '').includes(characterNameKey);
  };

  if (scope.kind === 'module' && scope.moduleId) {
    payload.modules = payload.modules.filter(module => module.id === scope.moduleId);
    payload.comments = payload.comments.filter(comment => comment.moduleId === scope.moduleId);
    return payload;
  }

  if (scope.kind === 'character' && (characterIds.size || characterNameKey)) {
    payload.comments = payload.comments
      .map(comment => ({ ...comment, segments: comment.segments.filter(matchesCharacter) }))
      .filter(comment => comment.segments.length);
    payload.modules = payload.modules.map(module => {
      const pages = module.pages.map(page => ({
        ...page,
        dialogue: page.dialogue.filter(matchesCharacter),
        staticComments: page.staticComments.filter(matchesCharacter)
      })).filter(page => page.dialogue.length || page.staticComments.length || page.cast.some(matchesCharacter));
      return { ...module, pages };
    }).filter(module => module.pages.length || module.cast.some(matchesCharacter));
  }

  return payload;
}

function summarizeAleriaGptContext(payload) {
  const pageCount = payload.modules.reduce((sum, module) => sum + module.pages.length, 0);
  const dialogueCount = payload.modules.reduce((sum, module) =>
    sum + module.pages.reduce((pageSum, page) => pageSum + page.dialogue.length, 0), 0);
  const staticCommentCount = payload.modules.reduce((sum, module) =>
    sum + module.pages.reduce((pageSum, page) => pageSum + page.staticComments.length, 0), 0);
  const storedCommentSegmentCount = payload.comments.reduce((sum, comment) => sum + comment.segments.length, 0);
  return {
    characterCount: payload.characters.length,
    moduleCount: payload.modules.length,
    pageCount,
    dialogueCount,
    staticCommentCount,
    storedCommentCount: payload.comments.length,
    storedCommentSegmentCount
  };
}

async function buildAleriaGptContext(options = {}) {
  const scope = normalizeAleriaGptScope(options);
  const characters = collectAleriaGptCharacters(options);
  const characterIndex = getAleriaGptCharacterIndex(characters);
  const modules = collectAleriaGptModules(characterIndex);
  const comments = collectAleriaGptStoredComments(await loadAleriaGptComments(), characterIndex);
  const payload = filterAleriaGptContextByScope({
    type: 'aleria-gpt-context',
    schemaVersion: ALERIA_GPT_CONTEXT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    scope,
    characters,
    modules,
    comments
  }, scope, characterIndex);
  payload.stats = summarizeAleriaGptContext(payload);
  payload.sourceHash = hashAleriaGptSource(JSON.stringify({
    schemaVersion: payload.schemaVersion,
    scope: payload.scope,
    characters: payload.characters,
    modules: payload.modules,
    comments: payload.comments
  }));
  return payload;
}

window.AleriaGptContext = {
  buildContext: buildAleriaGptContext,
  toPlainText: toAleriaGptPlainText,
  hashSource: hashAleriaGptSource
};
