# Active task continuation

User task: audit every combat sheet above level 1, fix Gawain/old traits or versioning, redesign character AND creature sheets, optimize usability/performance, then a thorough interface check. Latest steering: **keep parchment colors**, not dark inventory colors. Also **Silberhirsch belongs ONLY to Oweta Draig, gift from Armel Balchder**, NOT Rianna. Preserve all previous avatar sorting/ring work. No subagents permitted. Work autonomously; do not finalize while required work remains.

Repo E:/Aleria, PowerShell. Root AGENTS was read this turn; newest on-disk rule now includes 2 Nov global public push/deploy authorization, explicitly EXCLUDES unpublished Fleischsammler content (sources/assets/people/families/map/tests/diagnostic copies). Many hundreds of pre-existing dirty/untracked changes. Do not blanket commit/publish them. Private dossiers remain excluded. Root current Git HEAD 2de17a7f0 (backend rollout), no commits made in this turn. New design not yet published. Be truthful; user complained that prior LOCAL trait review never reached online data.

## Definite findings
- Fresh public audit `online-before.json`: 390 characters, 29 combat profiles, **14 characters above level 1**, all 14 still had OLD quirks, not the curated new review. Gawain still had generic origin quirks + `gawain-muttersoehnchen` ability + obsolete smell condition. Prior review sources/docs explicitly local only. Current character schema is 11, so not a general wrong-schema issue.
- Current data revisions stayed old because old local trait projector did not publish or stamp combat revision. New publisher explicitly increases combatProfile.revision, tests confirm old open sheet is rejected by authoritative server while name-only edit remains allowed.
- 74 online creatures, 71 profiles, **60 above level 1**. All binding IDs valid, no missing earned techniques. Report `interface-audit-before.json`:
  - Rhiannon has stale magic.spells revision (shared `reconcileClassDamageRevisions` updates action economy/INT etc). New planner now includes this narrow change, preserves all 23 spell IDs, other magic settings, HP/resources/arsenal.
  - `catalog-draig-lehensritter` and `catalog-draig-waffenknecht` were schema9. **BOTH NOW upgraded online to11**, only schemaVersion + revision + updatedAt. Tests prove all statistics/resources/actions unchanged. Receipt `creature-schema-after.json`.
  - Lehensritter had old orphan lock from deleted testarena scene. Both exact bare/scoped entry queries had ZERO comments. Bounded encrypted-backed repair removed only this exact lock with updateTime condition, no profile/history writes. Receipt `orphan-lock-repair.json`; script `repair-orphaned-testarena-lock.mjs` is idempotent. Then schema upgrade applied both. Do not clear other active locks.
  - 6 creatures have no exact Bestiarium profile (Hund, Wachhund, Rotmilan, Habicht, two mixed breeds). This is a documented content gap, not a fabricated/broken link; AGENTS says don't invent profiles. Do not arbitrarily change species or mechanics.
- All 14 character locks were read: no active encounters.

## Silberhirsch correction COMPLETE ONLINE + LOCAL
- Changed current equipment template title to `Owetas Silberhirsch`, description exclusively Oweta/Armel/Tenebrit/-1 magical/biting crackle.
- Kept stable HISTORICAL template ID `gwynthor-seven:rianna-silberhirsch`, image filename/path `rianna-silberhirsch-v1.png`, and physical item instance ID. They are internal historical identifiers, not visible owner labels. Old immutable versions archived by catalog builder. Do not create a second coin or rename history.
- Updated one-time additions: only world Oweta gets spear+coin, no Rianna addition.
- `modules/house-knight-rings/silberhirsch-owner-correction.mjs`: pure existing physical instance move, idempotent, preserves money, gear, resources. Actual Oweta LIVE ID is **vk0xAa3ZcEhVvGC1CzNq**, not world person ID; Rianna live ID `person--haus-wyrm--rianna-wyrm`.
- `firebase/scripts/content/correct-silberhirsch-owner.mjs --apply` succeeded and verified both entire docs. New immutable definition revision/head; atomic inventory two-doc transfer, locks/updateTime/owner correction claim; encrypted backup. Receipt `silberhirsch-owner-correction.json`. New writer never alters old award claims.
- `CharakterDatenbank/scripts/sync-silberhirsch-owner.mjs` succeeded (7 files: 2 records, 3 indexes, 2 scoped exports), idempotent check passes. Export dir `Charakter Archiv Exporte/Silberhirsch Eigentum 2026-11-02/`.
- Added newer confirmed overlay ownership gate to `house-ring-database.mjs`; old ring source does NOT resurrect Rianna's coin or overwrite Oweta's later source. `sync-house-signets --check` passes profiles51/unlinked1/local3/superseded2. Old starting/Oweta importers also have similar gate from prior turn.
- Tests `silberhirsch-owner-correction.test.mjs`:2 passed, protection only on Oweta tested. Current authored catalog rebuilt, server graph synchronized afterward. More edits to docs still needed: gwynthor README/house-ring README still incorrectly say Rianna as CURRENT owner (historical generation prompt should remain original, add correction note instead).

## UI implemented (LOCAL, no code deploy)
- New feature `modules/combat-sheet/`:
  - `combat-sheet-pages.js`: character header + six semantic tabs: overview, arsenal, traits, magic, resources, rules. Search on arsenal/traits/magic.
  - `combat-sheet-workspace.js`: scoped closure for active page, filter values, expanded details, scroll. Delegated events, AbortController, search rAF. All forms remain mounted; tab switching only toggles hidden/ARIA; no serialization/draft mutation. Expanded cards and queries survive nav; render capture/mount used around existing editor render.
  - `combat-sheet.css`: shared compact sheet styling. WAS dark first, user changed to parchment. **NOW parchment** with warm paper/dark text/burgundy. Does not need new images. Source palette restore scripts in diagnostics record method.
- Character `character-combat-profile.js` uses new header/pages, overview compact stats + six attribute medallions; advanced attribute override fields each under `Anpassen`, radar under a disclosure; identity/progression under collapsible drawer. Traits/conditions/abilities compact details. Techniques now reuse same icon/detail presentation instead of duplicate massive cards. Weapon list NOW compact summary rows, each opens full existing form; quick equip button prevents native summary toggle, preserves semantics. All original fields remain mounted, collection/draft/equipment events preserved.
- Need finish minor refinements:
  - workspace capture/mount now supports `data-sheet-disclosure`, but source markup for advanced drawers/attribute options/radar/status hasn't yet been given stable data-sheet-disclosure IDs. Add them so rerender retains these opens too.
  - header portrait passed raw activeCharacter.portrait; use existing `getSafeImageSource` for parity.
  - character search now has weapon entries and spells tagged `data-sheet-entry`, techniques/quirks/abilities tagged too. Conditions not yet tagged (optional fix).
- Creature `switchCreaturePage` optimized: collect draft, toggle all mounted panels/tabs, only refresh read-only dossier when entering overview. Does not rerender every form/image/card. Test proves actual DOM node retained across all pages.
- Creature dossier action/passive lists now collapsible and compact. Filter out duplicate default unarmed action when actual weapon exists. Actual default source ID discovered is `default-unarmed-melee`; it was just added to defaults Set after last screenshot.
- Parchment screenshot showed white text on light creature header; just fixed in shared CSS: `.creature-profile-head :is(...)` dark; `.creature-dossier-heading` dark, RK burgundy. Need rerun/visually inspect final screenshot after this fix.
- CSS bug found/fixed: missing property icon caused its text to occupy 24px grid column and wrap one letter per line on phone. `.cp-card-property > div {grid-column:2}` fixed; latest phone screenshot confirms normal wrapping.
- Main HTML css/script URLs updated to `20261102-sheet-workspace-v1` for character combat and creature system. Shared new CSS loaded after creature editor theme. Existing avatar UI file changes preserved.

## Current screenshots/QA
- Installed existing locked dependency in `Stammbäume` via `npm ci --ignore-scripts --no-audit --no-fund` (1 package playwright-core 1.61.1). No lock edits, no secrets.
- Browser QA uses existing repo `openVenueBrowserPreview` helper, isolated headless Chrome, no live login, all external writes blocked. Resulting offline-sync toast is fixture-only, not production save failure. Original portrait images can be blank at screenshot moment because screenshot doesn't await them; add decode waits if desired.
- `AleriaAlmanach/tests/combat-sheet-workspace.browser.mjs` passes (3 runs); tests draft equality, all6 tabs, filter/search, expanded card retained, phone no overflow, manual attribute17 retained, creature DOM retained through pages, no pageerrors. Last successful output folder:
  `E:/Aleria/.tmp/combat-sheets-20261102/browser-1793655706814/`
  Contains desktop/phone Gawain, Freki. Images were viewed; parchment looks good after property fix. Creature header dark text + duplicate unarmed fixes were AFTER those screenshots.
- No running owned browser/server after helper close. No browser tool (CUA) used in this turn; no native computer automation. Computer-use skill file was read but not applied (headless repository tests used). Do not claim skill use.

## Trait + Rhiannon publication READY but NOT APPLIED
- New `character-trait-review/character-trait-publication-plan.mjs`:
  - Uses exact 14 approved reviewed assignments from prior sources (18 traits total, max3; no new diagnoses).
  - Baseline compare rejects intervening unreviewed trait edits.
  - removes only explicit old Gawain ability/condition and Gildas condition.
  - corrects Gildas existing ring ABILITY name/icon/labels/trigger descriptions to Gafyr using actual owned Gafyr ring; stable ability/rule IDs and existing +1 persuasion effect preserved. This was missed in earlier inventory-only task.
  - applies shared `reconcileClassDamageRevisions` (actual only Rhiannon magic.spells differs).
  - stamps monotonic combatProfile.revision, preserves every unrelated field incl inventory, HP, resources, attributes, progression.
  - exports `selectReviewedCombatWrite(plan)` with CORRECT nested field-path projection (not literal `magic.spells` keys). Tests cover 23 spells and patch shapes.
- `firebase/scripts/content/publish-character-trait-review.mjs`: authenticated fresh 14 records, old reviewed baseline file, plan/dryrun, locks/updateTimes, encrypted backups, exact narrow updateMask, full-doc reread equality. `--verify` idempotence mode. Dryrun passed14/14.
- **Do not apply traits until supporting front/server mechanics and icon assets are published**, otherwise old UI/backend cannot interpret all new expertise/rules; user is specifically complaining local-only earlier update. Need coordinate release safely.
- Add asset availability verification to writer --apply (`assertPublishedLocalArtwork`) if deploying local relative icon paths.
- Need local DB projection of confirmed online revisions/Gafyr ability/Rhiannon spells AFTER apply (currently local traits already right, but raw revisions still old and Gafyr ability label may old). Must preserve local extra drafts, inventory, resources. Old trait builder spreads current other fields and should remain idempotent, but old tests full-profile baseline will need deliberate adaptation for these explicit later corrections/revision. Avoid whole remote profile copy over local resources. Consider extending existing trait projection module / scoped latest overlay with approved arrays and shared migration, then record bookkeeping. Do NOT alter old history proofs.

## Tests passed this turn so far
- 39 focused old/new trait/development/creature-image/house tests.
- `character-trait-publication.test.mjs` (now5) + backend `reviewed-trait-revisions.test.js`(1): **6 passed** latest. Actual authoritative commitItemRecord rejects stale old editor and keeps unrelated name saves valid.
- `combat-sheet-schema-upgrade.test.mjs`:1 passed; exact stats/actions preservation for both schema9 source records.
- Coin transfer2 passed.
- Browser QA above passes.
- Full frontend/backend suites and emulator integration still TODO. Full release interface checks TODO.
- Server graph sync executed after coin template change; `check-mechanics-projection` should pass now unless later shared source changed. Schema-upgrade module is Node-only and not imported into generated graph. Trait publication module Node-only (node:util/assert), must NOT import it into browser.

## Next required work
1. Finish UI small refinements, final parchment visual QA including arsenal, Rhiannon23 spells, creature combat/form pages/phone; update old trait-browser test to activate new traits tab before scrolling hidden cards. Broaden browser tests where meaningful.
2. Audit report after fresh reads must not overwrite `online-before.json` (frozen tests rely on original coin in Rianna, old traits, old schema9). Current inspection script always writes BEFORE: don't rerun it unchanged! Add --after output or new read mode.
3. Review/publish required public code+icons safely. Root has hundreds of pre-existing changes and **secret unpublished Fleischsammler data** mixed into current quest/family/database catalogs. NEVER blanket git add/push/deploy current tree. Root AGENTS latest public-all authorization exists but secret exception strict. Existing local release requires clean committed master, `[skip netlify]`, then `node netlify/release/release.mjs --publish --push`. Firebase separate. Could prepare isolated public worktree/snapshot retaining local full sources; sanitize/exclude private feature data and diagnostic snapshots. Do not disable Netlify auto publisher. Need inspect scope carefully.
   - Current private mixed entries observed: `Stammbäume/assets/js/data/families.registry.js` imports `./gwynthor-fleischsammler/family-records.js`; quest-authored-dossiers imports private generated preparations; quest-catalog JSON embeds private unpublished dossier; local DB snapshot/registry has private household records. Existing diagnostics/trait-review/snapshot-before may contain them too. Excluding only assets isn't enough.
   - `netlify/release` files tracked unchanged currently. `assertReleaseWorkspace` blocks all uncommitted except diagnostics/generated. No release attempted this turn.
   - Public version probe to Netlify using DEFAULT sandbox fetch timed out; didn't save result. Retry escalated (Firebase scripts require escalated too). Don't assume that means site down. Own production URL `https://dieweltvonaleria.netlify.app/AleriaAlmanach/`.
4. Once code/assets ready, apply+verify14 traits (no active char locks), project bounded local data, verify both schema upgrades + orphan repair + coin owner.
5. Docs current-owner correction needed in gwynthor/house-ring READMEs and test metadata. Preserve original historical generation prompt, add correction note not rewrite past.
6. Add new feature/input/tests to release tasks; all mechanics/frontend/server parity, combat/skill/inventory/quest/save guard integration; no history/live resource rewrites. Final report concise German, explain actual cause local not published + stamped revision, exact online status, parchment retained. Do not claim deployment before verified.

Auth: Firebase logged in from prior user 'Anmeldung abgeschlossen'. Authenticated commands require `sandbox_permissions: require_escalated` (default sandbox falsely unavailable). All authenticated writes above were authorized corrections, verified, encrypted backups. No secrets printed. No images generated in this turn.
