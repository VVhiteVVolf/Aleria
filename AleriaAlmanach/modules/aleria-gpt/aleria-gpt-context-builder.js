const ALERIA_GPT_CONTEXT_SCHEMA_VERSION = 3;

const ALERIA_GPT_COMMENT_KINDS = new Set([
  'speech', 'action', 'interact', 'consume', 'thought', 'whisper', 'shout',
  'performance', 'animal', 'foreign', 'song', 'spell', 'madness', 'telepathy',
  'prayer', 'flirt', 'secretaction', 'combataction', 'narrator',
  'scene-time-event', 'scene-rest-event', 'scene-transition-event', 'scene-poll-event'
]);

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
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeAleriaGptEntities(value) {
  const text = String(value ?? '');
  if (!text || typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function toAleriaGptPlainText(value) {
  let text = String(value ?? '');
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
  if (page?.bountyFilePage) return 'bounty-file';
  if (page?.goodsTablePage) return 'goods';
  if (page?.tradeCatalogPage) return 'trade-catalog';
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
  return ALERIA_GPT_COMMENT_KINDS.has(value) ? value : 'speech';
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
      skipKeys: new Set(['portrait', 'profileLink']),
      maxDepth: 8
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

function collectAleriaGptCreatures() {
  const source = window.AleriaCreatures?.getAll?.() || [];
  return source.map(creature => {
    const structuredFacts = [];
    collectAleriaGptStructuredFacts({
      identity: {
        type: creature?.type,
        species: creature?.species,
        habitat: creature?.habitat,
        size: creature?.size,
        challengeRating: creature?.challengeRating,
        level: creature?.level,
        instanceOrdinal: creature?.instanceOrdinal
      },
      combatProfile: creature?.combatProfile,
      loot: creature?.loot,
      notes: creature?.notes
    }, structuredFacts, 'kreatur', 0, { maxDepth: 8 });
    return {
      id: String(creature?.id || '').trim(),
      entityType: 'creature',
      name: String(creature?.name || '').trim(),
      title: [creature?.type, creature?.species].filter(Boolean).join(' · '),
      aliases: [],
      templateId: String(creature?.templateId || '').trim(),
      profileText: Array.from(new Set(structuredFacts.filter(Boolean))).join('\n')
    };
  }).filter(creature => creature.id || creature.name);
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
  return /(?:^|\.)(id|uuid|key|schema|version|src|url|href|link|image|img|avatar|portrait|icon|color|style|class|html)(?:$|\.)/.test(key);
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
  const maximumDepth = Number.isFinite(Number(options.maxDepth))
    ? Math.max(1, Math.min(12, Number(options.maxDepth)))
    : 5;
  if (depth > maximumDepth || value == null) return;
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
      pushAleriaGptTextFragment(moduleFacts, getSectionPathLabel(section));
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
          desc: String(section?.desc || '').trim(),
          path: getSectionPathParts(section)
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

function getAleriaGptFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function collectAleriaGptRevealedChallengeIds(comments = []) {
  const revealed = new Set();
  (Array.isArray(comments) ? comments : []).forEach(comment => {
    (Array.isArray(comment?.commentSegments) ? comment.commentSegments : []).forEach(segment => {
      const resolution = segment?.skillResolution;
      if (!resolution || !['success', 'critical-success'].includes(String(resolution.outcome || ''))) return;
      const challengeId = String(resolution.targetChallengeId || '').trim();
      if (challengeId) revealed.add(challengeId);
    });
  });
  return revealed;
}

function normalizeAleriaGptCombatResolution(value = {}) {
  if (!value || typeof value !== 'object' || !value.resolutionId) return null;
  const attack = value.attack && typeof value.attack === 'object' ? value.attack : {};
  const damage = value.damage && typeof value.damage === 'object' ? value.damage : null;
  const target = value.targetSnapshot && typeof value.targetSnapshot === 'object' ? value.targetSnapshot : {};
  const resourceChanges = Array.isArray(value.actorResourceSnapshot?.changes)
    ? value.actorResourceSnapshot.changes.map(change => ({
        resourceId: String(change?.resourceId || ''),
        name: String(change?.name || 'Ressource'),
        amount: getAleriaGptFiniteNumber(change?.amount),
        before: getAleriaGptFiniteNumber(change?.before),
        after: getAleriaGptFiniteNumber(change?.after)
      }))
    : [];
  return {
    resolutionId: String(value.resolutionId),
    actorId: String(value.actorId || ''),
    actorName: String(value.actorName || ''),
    targetId: String(value.targetId || ''),
    targetName: String(value.targetName || ''),
    actionType: String(value.actionType || 'attack'),
    resolutionMode: String(value.resolutionMode || attack.resolutionMode || ''),
    profileActionKind: String(value.profileActionKind || ''),
    profileActionId: String(value.profileActionId || ''),
    weaponName: String(value.weapon?.name || ''),
    hit: attack.hit === true,
    criticalSuccess: attack.criticalSuccess === true,
    criticalFailure: attack.criticalFailure === true,
    saveSucceeded: typeof attack.saveSucceeded === 'boolean' ? attack.saveSucceeded : null,
    saveAttribute: String(attack.saveAttribute || ''),
    rollOwner: String(attack.rollOwner || ''),
    naturalRoll: getAleriaGptFiniteNumber(attack.naturalRoll),
    total: getAleriaGptFiniteNumber(attack.total),
    targetDefense: getAleriaGptFiniteNumber(attack.targetDefense),
    damageTotal: damage ? getAleriaGptFiniteNumber(damage.total) : 0,
    damageType: String(damage?.damageType || ''),
    hitPointsBefore: getAleriaGptFiniteNumber(target.hitPointsBefore ?? target.currentHitPoints),
    hitPointsAfter: getAleriaGptFiniteNumber(target.hitPointsAfter ?? target.currentHitPoints),
    maximumHitPoints: getAleriaGptFiniteNumber(target.maximumHitPoints),
    temporaryHitPointsBefore: getAleriaGptFiniteNumber(target.temporaryHitPointsBefore),
    temporaryHitPointsAfter: getAleriaGptFiniteNumber(target.temporaryHitPointsAfter),
    damageAbsorbedByTemporaryHitPoints: getAleriaGptFiniteNumber(target.damageAbsorbedByTemporaryHitPoints),
    damageAppliedToHitPoints: getAleriaGptFiniteNumber(target.damageAppliedToHitPoints),
    defeated: target.defeated === true,
    defeat: value.defeat || null,
    resourceChanges,
    targetResourceChanges: Array.isArray(value.targetResourceSnapshot?.before) && Array.isArray(value.targetResourceSnapshot?.after)
      ? value.targetResourceSnapshot.after.flatMap(after => {
          const before = value.targetResourceSnapshot.before.find(item => item?.id === after?.id);
          return before && Number(before.current) !== Number(after.current) ? [{ name: String(after.name || before.name || 'Ressource'), before: getAleriaGptFiniteNumber(before.current), after: getAleriaGptFiniteNumber(after.current) }] : [];
        })
      : [],
    effects: (Array.isArray(value.effectResults) ? value.effectResults : []).map(result => ({
      type: String(result?.effect?.type || ''),
      target: String(result?.effect?.target || 'target'),
      damageType: String(result?.effect?.damageType || ''),
      magical: result?.effect?.magical === true,
      amount: getAleriaGptFiniteNumber(result?.amount),
      effectiveDamage: getAleriaGptFiniteNumber(result?.applied?.incoming),
      damageResponse: String(result?.applied?.damageResponse?.response || ''),
      healing: getAleriaGptFiniteNumber(result?.applied?.restored),
      temporaryHitPoints: getAleriaGptFiniteNumber(result?.applied?.granted),
      conditionApplied: String(result?.condition?.name || ''),
      conditionsRemoved: (Array.isArray(result?.removed) ? result.removed : []).map(condition => String(condition?.name || '')).filter(Boolean),
      resourceChange: result?.applied?.change ? { name: String(result.applied.change.name || ''), before: getAleriaGptFiniteNumber(result.applied.change.before), after: getAleriaGptFiniteNumber(result.applied.change.after) } : null,
      notes: compactAleriaGptText(result?.effect?.notes || '')
    })),
    rules: (Array.isArray(value.ruleApplications) ? value.ruleApplications : []).map(rule => ({
      source: String(rule?.sourceActorName || ''), rule: String(rule?.ruleName || ''), phase: String(rule?.phase || ''),
      authority: String(rule?.authority || ''), effects: rule?.effects && typeof rule.effects === 'object' ? { ...rule.effects } : {}
    })),
    ruleConflicts: (Array.isArray(value.ruleConflicts) ? value.ruleConflicts : []).map(conflict => ({
      phase: String(conflict?.phase || ''),
      rules: (Array.isArray(conflict?.applications) ? conflict.applications : []).map(application => String(application?.ruleName || '')).filter(Boolean)
    })),
    secondarySaves: (Array.isArray(value.secondarySaves) ? value.secondarySaves : []).map(save => ({
      attributeKey: String(save?.attributeKey || ''), total: getAleriaGptFiniteNumber(save?.total), dc: getAleriaGptFiniteNumber(save?.dc), succeeded: save?.succeeded === true
    })),
    followUpAttacks: (Array.isArray(value.followUpAttacks) ? value.followUpAttacks : []).map(followUp => ({
      total: getAleriaGptFiniteNumber(followUp?.attack?.total), targetDefense: getAleriaGptFiniteNumber(followUp?.attack?.targetDefense), hit: followUp?.attack?.hit === true,
      damage: getAleriaGptFiniteNumber(followUp?.damage?.total), damageType: String(followUp?.damage?.damageType || '')
    })),
    conditionChanges: value.targetConditionSnapshot ? {
      before: (Array.isArray(value.targetConditionSnapshot.before) ? value.targetConditionSnapshot.before : []).map(condition => String(condition?.name || '')).filter(Boolean),
      after: (Array.isArray(value.targetConditionSnapshot.after) ? value.targetConditionSnapshot.after : []).map(condition => String(condition?.name || '')).filter(Boolean)
    } : null,
    narration: compactAleriaGptText(value.narration?.text || '')
  };
}

function normalizeAleriaGptInventoryUse(value = {}) {
  if (!value || typeof value !== 'object' || !value.usageId) return null;
  return {
    usageId: String(value.usageId),
    actorId: String(value.actorId || ''),
    actorName: String(value.actorName || ''),
    itemId: String(value.item?.id || ''),
    itemName: String(value.item?.name || ''),
    itemType: String(value.item?.type || value.item?.category || ''),
    mode: String(value.mode || 'use'),
    quantity: getAleriaGptFiniteNumber(value.quantity, 1),
    quantityBefore: getAleriaGptFiniteNumber(value.quantityBefore),
    quantityAfter: getAleriaGptFiniteNumber(value.quantityAfter)
  };
}

function normalizeAleriaGptSceneRest(value = {}) {
  if (!value || typeof value !== 'object' || (!value.kind && !value.type)) return null;
  return {
    type: String(value.type || 'short'),
    title: compactAleriaGptText(value.title || ''),
    durationSeconds: getAleriaGptFiniteNumber(value.durationSeconds),
    recoveryDayKey: String(value.recoveryDayKey || ''),
    participants: (Array.isArray(value.participants) ? value.participants : []).map(participant => ({
      actorId: String(participant?.actorId || ''),
      name: String(participant?.name || ''),
      hitPointsBefore: getAleriaGptFiniteNumber(participant?.before?.hitPoints?.current),
      hitPointsAfter: getAleriaGptFiniteNumber(participant?.after?.hitPoints?.current),
      maximumHitPoints: getAleriaGptFiniteNumber(participant?.after?.hitPoints?.maximum),
      recoveredResources: (Array.isArray(participant?.changes?.resources) ? participant.changes.resources : []).map(change => ({
        name: String(change?.name || 'Ressource'),
        before: getAleriaGptFiniteNumber(change?.before),
        after: getAleriaGptFiniteNumber(change?.after)
      })),
      recoveredAbilities: (Array.isArray(participant?.changes?.abilities) ? participant.changes.abilities : []).map(change => ({
        name: String(change?.name || 'Besondere Fähigkeit'),
        before: getAleriaGptFiniteNumber(change?.before),
        after: getAleriaGptFiniteNumber(change?.after)
      }))
    }))
  };
}

function formatAleriaGptSegmentMechanics({ skillResolution, combatResolution, inventoryUse, sceneRest, sceneTimeEvent } = {}) {
  const lines = [];
  if (skillResolution) {
    lines.push(`Fertigkeitsauswertung: ${skillResolution.skillName || skillResolution.skillId || 'Fertigkeit'} = ${skillResolution.outcome || 'unbekannt'}, Gesamt ${skillResolution.total}, SG ${skillResolution.difficulty}${skillResolution.customModifierDeclared ? '; freier Zusatzmodifikator wurde ausdrücklich verwendet' : ''}.`);
    (skillResolution.rules || []).forEach(rule => lines.push(`Fertigkeitsregel: ${rule.source || 'Regelquelle'} · ${rule.rule || 'Regel'} (${rule.phase || 'Phase'}).`));
  }
  if (combatResolution) {
    const savingThrow = combatResolution.resolutionMode === 'saving-throw';
    const outcome = savingThrow
      ? (combatResolution.saveSucceeded ? 'Rettungswurf gelungen' : 'Rettungswurf misslungen')
      : (combatResolution.criticalFailure
          ? 'kritischer Fehlschlag'
          : (combatResolution.criticalSuccess ? 'kritischer Erfolg' : (combatResolution.hit ? 'Treffer' : 'Fehlschlag')));
    const rollLabel = savingThrow
      ? `Rettungswurf ${combatResolution.saveAttribute || ''} ${combatResolution.total} gegen Zauber-SG ${combatResolution.targetDefense}`
      : `Angriff ${combatResolution.total} gegen Verteidigung ${combatResolution.targetDefense}`;
    const temporaryHitPoints = combatResolution.temporaryHitPointsBefore || combatResolution.temporaryHitPointsAfter
      ? `; temporäre TP ${combatResolution.temporaryHitPointsBefore} -> ${combatResolution.temporaryHitPointsAfter}, davon ${combatResolution.damageAbsorbedByTemporaryHitPoints} Schaden absorbiert`
      : '';
    lines.push(`Kampfauswertung: ${combatResolution.actorName || 'Akteur'} gegen ${combatResolution.targetName || 'Ziel'} mit ${combatResolution.weaponName || combatResolution.profileActionKind || 'Angriff'}: ${outcome}; ${rollLabel}; Schaden ${combatResolution.damageTotal} ${combatResolution.damageType || ''}; Ziel-TP ${combatResolution.hitPointsBefore} -> ${combatResolution.hitPointsAfter}/${combatResolution.maximumHitPoints}${temporaryHitPoints}${combatResolution.defeated ? '; besiegt' : ''}.`);
    combatResolution.resourceChanges.forEach(change => {
      lines.push(`Ressourcenverbrauch ${combatResolution.actorName || 'Akteur'}: ${change.name} ${change.before} -> ${change.after}.`);
    });
    combatResolution.targetResourceChanges.forEach(change => lines.push(`Zielressource: ${change.name} ${change.before} -> ${change.after}.`));
    combatResolution.effects.forEach(effect => lines.push(`Strukturierter Effekt: ${effect.type}${effect.damageType ? ` ${effect.damageType}` : ''}${effect.damageResponse ? ` (${effect.damageResponse})` : ''}; Betrag ${effect.amount}; wirksamer Schaden ${effect.effectiveDamage}; Heilung ${effect.healing}; temporäre TP ${effect.temporaryHitPoints}${effect.conditionApplied ? `; Zustand +${effect.conditionApplied}` : ''}${effect.conditionsRemoved.length ? `; Zustände entfernt ${effect.conditionsRemoved.join(', ')}` : ''}.`));
    combatResolution.rules.forEach(rule => lines.push(`Kampfregel: ${rule.source || 'Regelquelle'} · ${rule.rule || 'Regel'} · Phase ${rule.phase || 'unbekannt'} · ${JSON.stringify(rule.effects)}.`));
    combatResolution.ruleConflicts.forEach(conflict => lines.push(`Offener Regelkonflikt (${conflict.phase || 'Phase'}): ${conflict.rules.join(' gegen ')}; menschliche Entscheidung erforderlich.`));
    combatResolution.secondarySaves.forEach(save => lines.push(`Sekundäre Rettung ${save.attributeKey}: ${save.total} gegen SG ${save.dc}, ${save.succeeded ? 'gelungen' : 'misslungen'}.`));
    combatResolution.followUpAttacks.forEach(follow => lines.push(`Folgeangriff: ${follow.total} gegen ${follow.targetDefense}, ${follow.hit ? `Treffer mit ${follow.damage} ${follow.damageType}` : 'verfehlt'}.`));
    if (combatResolution.conditionChanges) lines.push(`Zustände vorher: ${combatResolution.conditionChanges.before.join(', ') || 'keine'}; nachher: ${combatResolution.conditionChanges.after.join(', ') || 'keine'}.`);
  }
  if (inventoryUse) {
    const verb = inventoryUse.mode === 'consume' ? 'verbraucht' : 'benutzt';
    lines.push(`Inventarvorgang: ${inventoryUse.actorName || 'Akteur'} ${verb} ${inventoryUse.itemName || 'Gegenstand'}; Bestand ${inventoryUse.quantityBefore} -> ${inventoryUse.quantityAfter}.`);
  }
  if (sceneRest) {
    const restLabel = sceneRest.type === 'long' ? 'Lange Rast' : 'Kurze Rast';
    lines.push(`${restLabel}: ${sceneRest.durationSeconds} Sekunden verstrichen${sceneRest.recoveryDayKey ? `; Erholungstag ${sceneRest.recoveryDayKey}` : ''}.`);
    sceneRest.participants.forEach(participant => {
      const recovered = [...participant.recoveredResources, ...participant.recoveredAbilities]
        .map(change => `${change.name} ${change.before} -> ${change.after}`)
        .join(', ');
      lines.push(`Rastfolge ${participant.name || participant.actorId || 'Figur'}: TP ${participant.hitPointsBefore} -> ${participant.hitPointsAfter}/${participant.maximumHitPoints}${recovered ? `; ${recovered}` : ''}.`);
    });
  }
  if (sceneTimeEvent && typeof sceneTimeEvent === 'object') {
    lines.push(`Szenenzeit: Tag ${getAleriaGptFiniteNumber(sceneTimeEvent.anchorDay, 1)}, Sekunde ${getAleriaGptFiniteNumber(sceneTimeEvent.anchorSeconds)}${sceneTimeEvent.segmentBreak ? '; neuer Zeitabschnitt' : ''}.`);
  }
  return lines.join('\n');
}

function formatAleriaGptStoredMechanics(segment = {}, comment = {}, segmentIndex = 0) {
  const skillResolution = segment?.skillResolution && typeof segment.skillResolution === 'object'
    ? {
        skillId: String(segment.skillResolution.skillId || ''),
        skillName: String(segment.skillResolution.skillName || ''),
        outcome: String(segment.skillResolution.outcome || ''),
        total: getAleriaGptFiniteNumber(segment.skillResolution.total),
        difficulty: getAleriaGptFiniteNumber(segment.skillResolution.difficulty),
        customModifierDeclared: segment.skillResolution.customModifierDeclared === true,
        opposedDefense: segment.skillResolution.opposedDefense || null,
        rules: (Array.isArray(segment.skillResolution.ruleApplications) ? segment.skillResolution.ruleApplications : []).map(rule => ({ source: String(rule?.sourceActorName || ''), rule: String(rule?.ruleName || ''), phase: String(rule?.phase || '') }))
      }
    : null;
  const combatResolutions = (Array.isArray(segment?.combatResolutions)
    ? segment.combatResolutions
    : [segment?.combatResolution]).map(normalizeAleriaGptCombatResolution).filter(Boolean);
  return (combatResolutions.length ? combatResolutions : [null]).map((combatResolution, index) => formatAleriaGptSegmentMechanics({
    skillResolution: index === 0 ? skillResolution : null,
    combatResolution,
    inventoryUse: index === 0 ? normalizeAleriaGptInventoryUse(segment?.inventoryUse) : null,
    sceneRest: index === 0 && segmentIndex === 0 ? normalizeAleriaGptSceneRest(comment?.sceneRest) : null,
    sceneTimeEvent: index === 0 && segmentIndex === 0 ? comment?.sceneTimeEvent : null
  })).filter(Boolean).join('\n');
}

function getAleriaGptCommentSegments(comment, characterIndex, revealedChallengeIds = new Set()) {
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
    const skillResolution = segment?.skillResolution && typeof segment.skillResolution === 'object'
      ? {
          skillId: String(segment.skillResolution.skillId || ''),
          skillName: String(segment.skillResolution.skillName || ''),
          outcome: String(segment.skillResolution.outcome || ''),
          total: Number(segment.skillResolution.total || 0),
          difficulty: Number(segment.skillResolution.difficulty || 0),
          customModifierDeclared: segment.skillResolution.customModifierDeclared === true,
          opposedDefense: segment.skillResolution.opposedDefense || null,
          rules: (Array.isArray(segment.skillResolution.ruleApplications) ? segment.skillResolution.ruleApplications : []).map(rule => ({ source: String(rule?.sourceActorName || ''), rule: String(rule?.ruleName || ''), phase: String(rule?.phase || '') })),
          targetChallengeId: String(segment.skillResolution.targetChallengeId || ''),
          revealedText: String(segment.skillResolution.revealedText || '')
        }
      : null;
    const skillChallenge = segment?.skillChallenge && typeof segment.skillChallenge === 'object'
      ? {
          id: String(segment.skillChallenge.id || ''),
          title: String(segment.skillChallenge.title || ''),
          difficulty: Number(segment.skillChallenge.difficulty || 0),
          preferredSkills: Array.isArray(segment.skillChallenge.preferredSkills) ? segment.skillChallenge.preferredSkills : [],
          preferredModifier: Number(segment.skillChallenge.preferredModifier || 0),
          alternativeModifier: Number(segment.skillChallenge.alternativeModifier || 0)
        }
      : null;
    const storedKind = getAleriaGptCommentKind(segment?.kind || comment?.commentKind, segmentNarrator);
    const kind = skillChallenge?.id && !revealedChallengeIds.has(skillChallenge.id)
      ? 'speech'
      : storedKind;
    const combatResolutions = (Array.isArray(segment?.combatResolutions)
      ? segment.combatResolutions
      : [segment?.combatResolution]).map(normalizeAleriaGptCombatResolution).filter(Boolean);
    const combatResolution = combatResolutions[0] || null;
    const inventoryUse = normalizeAleriaGptInventoryUse(segment?.inventoryUse);
    const sceneRest = segmentIndex === 0 ? normalizeAleriaGptSceneRest(comment?.sceneRest) : null;
    const sceneTimeEvent = segmentIndex === 0 && comment?.sceneTimeEvent && typeof comment.sceneTimeEvent === 'object'
      ? comment.sceneTimeEvent
      : null;
    return {
      speakerCharacterId: speaker.characterId,
      speakerName: speaker.name,
      kind,
      mechanicMode: String(segment?.mechanicMode || 'normal'),
      skillResolution,
      skillChallenge,
      combatResolution,
      combatResolutions,
      inventoryUse,
      sceneRest,
      mechanicsText: (combatResolutions.length ? combatResolutions : [null]).map((entry, index) => formatAleriaGptSegmentMechanics({
        skillResolution: index === 0 ? skillResolution : null,
        combatResolution: entry,
        inventoryUse: index === 0 ? inventoryUse : null,
        sceneRest: index === 0 ? sceneRest : null,
        sceneTimeEvent: index === 0 ? sceneTimeEvent : null
      })).filter(Boolean).join('\n'),
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
  const revealedChallengeIds = collectAleriaGptRevealedChallengeIds(comments);
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
      segments: getAleriaGptCommentSegments(comment, characterIndex, revealedChallengeIds)
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
    creatureCount: payload.creatures?.length || 0,
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
  const creatures = collectAleriaGptCreatures();
  const characterIndex = getAleriaGptCharacterIndex([...characters, ...creatures]);
  const modules = collectAleriaGptModules(characterIndex);
  const comments = collectAleriaGptStoredComments(await loadAleriaGptComments(), characterIndex);
  const payload = filterAleriaGptContextByScope({
    type: 'aleria-gpt-context',
    schemaVersion: ALERIA_GPT_CONTEXT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    scope,
    characters,
    creatures,
    modules,
    comments
  }, scope, characterIndex);
  payload.stats = summarizeAleriaGptContext(payload);
  payload.sourceHash = hashAleriaGptSource(JSON.stringify({
    schemaVersion: payload.schemaVersion,
    scope: payload.scope,
    characters: payload.characters,
    creatures: payload.creatures,
    modules: payload.modules,
    comments: payload.comments
  }));
  return payload;
}

window.AleriaGptContext = {
  buildContext: buildAleriaGptContext,
  toPlainText: toAleriaGptPlainText,
  hashSource: hashAleriaGptSource,
  formatStoredMechanics: formatAleriaGptStoredMechanics
};
