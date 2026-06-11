let _fbReady = !!window._fbReady || !!window._fb;
window.addEventListener('fb-ready', () => { _fbReady = true; window._fbReady = true; });

let _moduleStoreSyncConflict = null;

const MODULE_STORE_KEY = 'aleria-module-store-v1';
const MODULE_STORE_SYNC_META_KEY = 'aleria-module-store-sync-v1';
const MODULE_JSON_MAX_CHARS = 50000000;
const MODULE_STORE_FIREBASE_LIMIT_BYTES = 1048576;
const MODULE_STORE_WARN_BYTES = 700 * 1024;
const MODULE_STORE_DANGER_BYTES = 900 * 1024;
const MODULE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;
const MODULE_STORE_REMOTE_SAVE_DELAY = 700;
const MODULE_STORE_SYNCED_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const FIREBASE_READY_TIMEOUT_MS = 4500;
const MODULE_STORE_SCHEMA_VERSION = 2;
const MODULE_EXPORT_SCHEMA_VERSION = 2;
const MODULE_PACKAGE_EXPORT_SCHEMA_VERSION = 1;
const MODULE_ENTRY_SCHEMA_VERSION = 1;
const MODULE_PAGE_SCHEMA_VERSION = 1;
const MODULE_CAST_SCHEMA_VERSION = 1;
const MODULE_SIZE_DEFAULT = 100;
const MODULE_SIZE_MIN = 60;
const MODULE_SIZE_MAX = 100;
const ALMANACH_BACKUP_SCHEMA_VERSION = 2;
const MODULE_COMMENT_EXPORT_SCHEMA_VERSION = 1;
let _customSections = [];
let _entryOverrides = {};
let _moduleSectionMoves = {};
let _moduleEditorAuthorized = false;
let _moduleStoreRemoteSaveTimer = null;
let _moduleStoreRemoteSyncStarted = false;
let _moduleStoreRemoteUnsubscribe = null;

function deepClone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function clampModuleSizeValue(value, fallback = MODULE_SIZE_DEFAULT) {
  const number = Number(value);
  const safe = Number.isFinite(number) ? number : fallback;
  return Math.max(MODULE_SIZE_MIN, Math.min(MODULE_SIZE_MAX, Math.round(safe)));
}

function getModuleDisplaySize(entry = {}) {
  return {
    width: clampModuleSizeValue(entry.moduleWidth, MODULE_SIZE_DEFAULT),
    height: clampModuleSizeValue(entry.moduleHeight, MODULE_SIZE_DEFAULT)
  };
}

function slugify(value, fallback = 'modul') {
  const normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function makeSectionSignature(section) {
  const key = normalizeSearchText(section?.key || '');
  const tab = normalizeSearchText(section?.tab || section?.key || '');
  return `${key}::${tab}`;
}

function shouldUsePageImageAsEntryImage(pages = []) {
  return !(Array.isArray(pages) && pages.some(page => (
    page?.castePage ||
    page?.courtPage ||
    page?.tournamentPage ||
    page?.tournamentLeaguePage ||
    page?.questFilePage ||
    page?.biographyPage ||
    page?.artifactPage ||
    page?.recipePage
  )));
}

function sanitizeStatsArray(stats) {
  if (!Array.isArray(stats)) return [];
  return stats
    .map(item => Array.isArray(item) ? [String(item[0] ?? '').trim(), String(item[1] ?? '').trim()] : null)
    .filter(item => item && (item[0] || item[1]));
}

function sanitizeSceneBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map(block => {
      if (!block || typeof block !== 'object') return null;
      const next = {
        type: normalizeSceneBlockType(block.type || 'speech'),
      };
      if (block.side != null) next.side = String(block.side).trim() || 'left';
      if (block.name != null) next.name = String(block.name).trim();
      if (block.avatar != null) next.avatar = String(block.avatar).trim();
      if (block.text != null) next.text = String(block.text).trim();
      return next.type ? next : null;
    })
    .filter(Boolean);
}

function sanitizeCommentSequence(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks
    .map(block => {
      if (!block || typeof block !== 'object') return null;
      if (block.narrator) {
        const text = String(block.text || '').trim();
        return text ? { narrator: true, text } : null;
      }

      const name = String(block.name || '').trim();
      const title = String(block.title || '').trim();
      const portrait = String(block.portrait || '').trim();
      const text = String(block.text || '').trim();
      const side = String(block.side || 'left').trim() === 'right' ? 'right' : 'left';

      if (!name && !text) return null;
      return {
        narrator: false,
        side,
        name,
        title,
        portrait,
        text
      };
    })
    .filter(Boolean);
}

function sanitizeModulePage(page, fallbackTitle = '') {
  if (!page || typeof page !== 'object') return null;
  const next = {
    schemaVersion: Number(page.schemaVersion) || MODULE_PAGE_SCHEMA_VERSION
  };
  const commentThreadKey = String(page.commentThreadKey || '').trim();
  if (/^[a-z0-9-]{1,64}$/i.test(commentThreadKey)) next.commentThreadKey = commentThreadKey;

  if (page.image != null) next.image = String(page.image || '').trim() || null;
  if (page.imageWidth != null) {
    const width = Number(page.imageWidth);
    const maxImageWidth = page.castePage ? 160 : 70;
    if (Number.isFinite(width)) next.imageWidth = Math.max(20, Math.min(maxImageWidth, width));
  }
  const imageFit = String(page.imageFit || '').trim();
  if (['cover', 'contain'].includes(imageFit)) next.imageFit = imageFit;
  const imagePosition = String(page.imagePosition || '').trim();
  if (['top', 'center', 'bottom', 'left', 'right'].includes(imagePosition)) next.imagePosition = imagePosition;
  if (page.pageTitle != null || fallbackTitle) next.pageTitle = String(page.pageTitle || fallbackTitle || '').trim();
  if (page.description != null) next.description = String(page.description || '').trim();
  if (page.quote != null) next.quote = String(page.quote || '').trim();
  if (page.quoteBy != null) next.quoteBy = String(page.quoteBy || '').trim();
  if (page.enableComments) next.enableComments = true;
  if (page.commentDivider) next.commentDivider = true;

  ['imageSquare', 'imageLandscape', 'imageSemiLandscape', 'imageTall', 'sessionPage', 'wantedPage', 'profilePage', 'tournamentPage', 'tournamentLeaguePage', 'castePage', 'courtPage', 'biographyPage', 'bestiaryPage', 'questFilePage', 'artifactPage', 'recipePage']
    .forEach(flag => { if (page[flag]) next[flag] = true; });

  if (Array.isArray(page.sessionCast) && page.sessionCast.length) {
    next.sessionCast = page.sessionCast.map(item => String(item || '').trim()).filter(Boolean);
  }
  const pageCastDetails = sanitizeModuleCastDetails(page.sessionCastDetails, next.sessionCast || []);
  if (pageCastDetails.length) {
    next.sessionCastDetails = pageCastDetails;
    if (!next.sessionCast?.length) next.sessionCast = pageCastDetails.map(item => item.id);
  }

  const stats = sanitizeStatsArray(page.stats);
  if (stats.length) next.stats = stats;

  const sceneBlocks = sanitizeSceneBlocks(page.sceneBlocks);
  if (sceneBlocks.length) next.sceneBlocks = sceneBlocks;

  const commentSequence = sanitizeCommentSequence(page.commentSequence);
  if (commentSequence.length) next.commentSequence = commentSequence;

  if (page.commentator && typeof page.commentator === 'object') {
    const commentator = {
      name: String(page.commentator.name || '').trim(),
      title: String(page.commentator.title || '').trim(),
      avatars: {}
    };
    Object.entries(page.commentator.avatars || {}).forEach(([mood, src]) => {
      const safeMood = String(mood || '').trim();
      const safeSrc = String(src || '').trim();
      if (safeMood && safeSrc) commentator.avatars[safeMood] = safeSrc;
    });
    if (commentator.name && Object.keys(commentator.avatars).length) {
      next.commentator = commentator;
      next.commentatorMood = String(page.commentatorMood || Object.keys(commentator.avatars)[0] || 'default').trim();
      next.commentText = String(page.commentText || '').trim();
    }
  }

  if (page.sessionPage) {
    next.sessionIntro = String(page.sessionIntro || '').trim();
    next.sessionHint = String(page.sessionHint || '').trim();
    next.sessionEmptyTitle = String(page.sessionEmptyTitle || '').trim();
    next.sessionEmptyText = String(page.sessionEmptyText || '').trim();
  }

  if (page.wantedPage) {
    next.wantedBackground = String(page.wantedBackground || '').trim();
    next.wanted = Array.isArray(page.wanted)
      ? page.wanted.map(item => ({
          img: String(item?.img || '').trim(),
          name: String(item?.name || '').trim(),
          role: String(item?.role || '').trim(),
          status: String(item?.status || '').trim(),
          kopfgeld: String(item?.kopfgeld || '').trim(),
          letzter: String(item?.letzter || '').trim(),
          bekannt: String(item?.bekannt || '').trim(),
          egon: String(item?.egon || '').trim(),
          link: String(item?.link || '').trim(),
        })).filter(item => item.name || item.img)
      : [];
  }

  if (page.profilePage) {
    next.profileBackground = String(page.profileBackground || '').trim();
    next.profileTitle = String(page.profileTitle || '').trim();
    next.profiles = Array.isArray(page.profiles)
      ? page.profiles.map(profile => ({
          img: String(profile?.img || '').trim(),
          name: String(profile?.name || '').trim(),
          role: String(profile?.role || '').trim(),
          banner: String(profile?.banner || '').trim(),
          stamp: String(profile?.stamp || '').trim(),
          note: String(profile?.note || '').trim(),
          fields: sanitizeStatsArray(profile?.fields),
        })).filter(profile => profile.name || profile.img)
      : [];
  }

  if (page.tournamentPage) {
    next.tournament = sanitizeTournamentData(page.tournament);
  }

  if (page.tournamentLeaguePage) {
    next.tournamentLeague = sanitizeTournamentLeagueData(page.tournamentLeague);
  }

  if (page.castePage) {
    next.caste = sanitizeCasteData(page.caste);
  }

  if (page.courtPage) {
    next.court = sanitizeCourtData(page.court);
  }

  if (page.biographyPage) {
    next.biography = sanitizeBiographyData(page.biography);
  }

  if (page.bestiaryPage) {
    next.bestiary = sanitizeBestiaryData(page.bestiary);
  }

  if (page.questFilePage) {
    next.questFile = sanitizeQuestFileData(page.questFile);
  }

  if (page.artifactPage) {
    next.artifact = sanitizeArtifactData(page.artifact);
  }

  if (page.recipePage) {
    next.recipe = sanitizeRecipeData(page.recipe);
  }

  return next;
}

function normalizeEntryForEditor(entry) {
  const clone = deepClone(entry || {});
  const pages = clone.multipage
    ? (clone.pages || []).filter(page => page && !page._commentsPage).map(page => sanitizeModulePage(page)).filter(Boolean)
    : [sanitizeModulePage({
        image: clone.image || '',
        pageTitle: clone.pageTitle || '',
        description: clone.description || '',
        stats: clone.stats || [],
        commentator: clone.commentator || null,
        commentatorMood: clone.commentatorMood || '',
        commentText: clone.commentText || '',
        quote: clone.quote || '',
        quoteBy: clone.quoteBy || ''
      }, clone.title || '')].filter(Boolean);

  return {
    id: String(clone.id || '').trim(),
    title: String(clone.title || '').trim(),
    subtitle: String(clone.subtitle || '').trim(),
    type: String(clone.type || '').trim(),
    category: String(clone.category || '').trim(),
    moduleWidth: clampModuleSizeValue(clone.moduleWidth, MODULE_SIZE_DEFAULT),
    moduleHeight: clampModuleSizeValue(clone.moduleHeight, MODULE_SIZE_DEFAULT),
    image: String(clone.image || (shouldUsePageImageAsEntryImage(pages) ? pages[0]?.image : '') || '').trim(),
    stamp: String(clone.stamp || '').trim(),
    icon: String(clone.icon || '').trim(),
    symbol: String(clone.symbol || '').trim(),
    locked: !!clone.locked,
    appendCommentsPage: clone.appendCommentsPage !== false,
    enablePageComments: !!clone.enablePageComments,
    sessionCast: getModuleCastIdsFromSource(clone),
    sessionCastDetails: getModuleCastDetailsFromSource(clone),
    pages: pages.length ? pages : [sanitizeModulePage({ pageTitle: 'I. — Neue Seite', description: '' })],
  };
}

function sanitizeModuleEntry(entry) {
  const normalized = normalizeEntryForEditor(entry);
  normalized.schemaVersion = Number(entry?.schemaVersion) || MODULE_ENTRY_SCHEMA_VERSION;
  normalized.id = normalized.id || slugify(normalized.title || 'modul');
  normalized.image = normalized.image || (shouldUsePageImageAsEntryImage(normalized.pages) ? normalized.pages[0]?.image : null) || null;
  normalized.symbol = normalized.symbol || null;
  normalized.multipage = true;
  return normalized;
}

function formatStatsTextarea(stats) {
  return sanitizeStatsArray(stats).map(([label, value]) => `${label} | ${value}`).join('\n');
}

function parseStatsTextarea(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split('|');
      if (parts.length === 1) return [parts[0].trim(), ''];
      return [parts.shift().trim(), parts.join('|').trim()];
    })
    .filter(([label, value]) => label || value);
}
