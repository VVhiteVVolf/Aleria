# Ongoing authorized reference-catalog release

User explicitly requested push/publication of the prior martial-class alignment,
then missing standard weapons, remaining peoples/cultures with stats, missing
trait/ability icons (personal abilities depict their canonical owner), archive
integration and horse/other duplicate checks, followed by a comprehensive checkup.
Do not finalize until the public release is actually verified.

Workspace E:/Aleria, master. Initial HEAD 6b42059a4. Existing dirty/staged changes
predate this task. There is an established sanitized public worktree at
`.tmp/combat-sheets-release-20261102` on the same master HEAD. Root has made no
Git mutations, push, Netlify deploy or Firebase deploy in this turn yet.

Private unpublished Fleischsammler material must NEVER be staged/pushed/deployed,
including its records/assets/quests/maps/tests/diagnostic copies or mixed indexes.
Keep complete authoring sources locally. Existing helper
`diagnostics/combat-sheets-20261102/prepare-public-worktree.mjs` copies only public
content and sanitizes mixed data; its companion audit reads private identifiers
solely to prevent leaks. Inspect and run them at final assembly. Both enforce
the root/public worktree HEAD relationship. Do not blanket git add in root.
Follow `netlify/docs/LOCAL_RELEASES.md`: release commit [skip netlify], then
`node netlify/release/release.mjs --publish --push` FROM THE PUBLIC WORKTREE.
Backend Firebase functions must be synchronized/deployed from the sanitized
public source too because martial/weapon runtime mechanics changed. Preserve
all live profiles, inventories, resources and past receipts; no broad migrations.

## Work owners

- `/root/weapon_standards`: 35 neutral standards added to the original17
  (52 total), module weapon-standards/weapon-standard-catalog.js, generator
  scripts/build-weapon-standards.mjs and market generated block, archive hook.
  Real damage/weight/price/hands/profiles/requirements; old17 preserved, Saex
  unchanged1W8. Fixed unsupported hammer/flail weapon types to mace and added
  shared combat-weapon-profile-family.js for Cenyr/Vennyr family checks while
  preserving actual IDs for rapier/halberd. Registerbuilder preserves numeric
  standard-weapon kg into definition/unique/inventory; old pinned revisions stay.
  37 focused tests passed. Now preparing 512px art normalization PS script and
  character-reference-catalogs Netlify check task/input coverage. No Git actions.
- `/root/ancestries`: 4 existing origins unchanged +24 =28 source-backed
  culture/regional packages, all +2/+1 and3 optional skill suggestions. Own
  character-origins/cultural-origin-catalog.js, live creation/archive integration,
  exact local copies of Alben/Nordmann icons and stats/source documentation.
  39 tests passed. Now owns ALL11 ability icons, pure registry and character sheet/
  combat-entry owner-context hookup. Has actually viewed all5 canonical portraits.
  Uses image_gen with source/manifest docs/art/ability-icons, active256px PNGs in
  public/assets/ability-icons. Coordinate archive hookup with archive_audit.
- `/root/archive_audit`: canonical archive identities prevent name collisions,
  all confirmed Vennyr pool included, standards load without opening market,
  new weapon hook, culture traits inherit correct origin icon. Horse sources
  were distinct27 breeds/ponies+workhorse; duplicate projections now dedup by
  stable mount ID, offers and ownership retained. Library generator now reads
  CURRENT14 reviewed public DB records via explicit whitelist rather than six
  historical root exports, preventing removed abilities reappearing. 31 spells,
  396 techniques/abilities; no private/full-directory scan.46 tests passed.
  Now checking release task coverage/privacy read-only, no Git writes.

## Image generation

Root imagegen cell81 has35 weapon image jobs with5 workers; each image copied
immediately to docs/art/weapon-standards/sources/<id>.png. Prompt manifest already
exists. Uses actual viewed Gofrann stahldolch/speer/handaxt only as style references;
no maker marks/crests/magic, actual inventory-item preset. No CLI/API credentials.
Active images must be normalized by the PS script after all35 originals exist.
Tool IDs survive compaction only if still running; use functions.wait only if
the call originally yielded running. All save notifications were successful sofar.
35IDs in manifest; agent's future script must fail closed if any source missing.

The authoritative missing ability list is
diagnostics/archive-checkup-20261103/icon-audit.json, regenerated from CURRENT14.
There are11: personal Freya ArkanerSchrei; Gildas Vorbereitung/Schutzpflicht;
Gawain LiebtDuefte and his DraigRittersiegelring; Asgeir Grenzer; Ylva Veteranin.
Shared Durchschnaufen/Berserkergang/Tierbegleiter/Vogelbegleiter. NO Muttersoehnchen
ability (obsolete). All current personal traits ALREADY have real development
PNG/WebP, so avoid regenerating obsolete archived traits. General culture/class
traits get actual existing appropriate images. Do not expose old CK fallback as
new art. Root viewed all5 portrait refs too; ancestry agent handles those jobs.

## Root completed small changes

- npm build:items/check:items prepend build-weapon-standards(.mjs --check).
- publication-policy excludes docs/art/{combat-technique-icons,weapon-standards,
  ability-icons}/ as source archives; active public/assets paths stay publishable.
- new netlify/tests/reference-art-publication.test.mjs verifies that boundary.
- Root applied imagegen skill and read current presets + local release docs.

## Remaining

Await/review ability implementation/assets and weapon normalization/checks.
Inspect all new art contact sheets. Wire any remaining task inputs accurately.
Run required generators/checks (weapon/register/current archive, cultures), then
sync generated Firebase mechanics after ALL code edits. Run meaningful full
frontend/server/class tests, local browser archive/creation/weapon check and
production build (Vite child processes need require_escalated, --configLoader
native works). No need to rerun unrelated successes without changed inputs.
Prepare/audit sanitized public worktree and public indexes/guide artifacts.
Commit public files only, preserve root authoring/staged content safely. Deploy
Firebase backend and verified Netlify release via established flow, then verify
production version/functions/assets. User has authorized this; no new approval
question needed for deployment. Report actual status honestly and finish concise.
## Recovery checkpoint 2026-11-03, 00:20 UTC

Original public target disappeared externally while agents were checking it. It was moved to .tmp/verified-release-20261103-7c41b2, detached/reset to 9b2096b54; new untracked weapon code/art was removed there. Root authoring originals are safe. DO NOT reuse or mutate that external tree.
Root is creating its OWN worktree .tmp/reference-catalog-release-20261103 on master (--force because root also on master), exec session88053 checkout in progress. It needs complete checkout before writes. Root HEAD still de4c647c9.
Existing preparation/audit helpers now accept --target=.tmp/reference-catalog-release-20261103 and validate target inside .tmp and exact git top-level. Use this explicit target on EVERY invocation. Default old path is gone.
Reapply root public prep to new target once checkout ends; do not blanket stage root. Need redo public-only quest/library generation, server mechanics sync (278 files), database two projections + Glendower path, and economy output35 additions. All recovery scripts/logs remain in external target diagnostics/reference-catalogs-20261103 and are public-safe according to archive agent; copy only needed diagnostics scripts if useful, don't overwrite authoring originals.
All new assets done:35 weapon art,11 ability icons,21 technique icons. No image jobs running. Additional UI findings corrected by weapon agent:35 individual radar profiles (new weapon-standard-presentation.js), archive origin cards now show bonuses, skill suggestions, safe country links; ability badges translated/no none. All root code complete. Root also added four source-art folders to publication archive policy; reference-art test now wired into build-policy task.
Public preflight passed797 tests through gwynthor-heime; economy stale due exactly35 new references. Agent generated price reference304 and economy review1313 before external target loss, not calc generator yet. Run official release full checks aftercommit; earlier checks needn't manually repeat beforethat.
Backend deployment NOT done: predeploy340/340 passed. First discovery10s timeout, exact module import32 endpoints1467ms; retry with FUNCTIONS_DISCOVERY_TIMEOUT=60 fixed discovery but Google Cloud v1 function list returned503. Need check functions:list and retry later from newtarget, preserve logs locally (debug .log may contain service metadata, ignored). Firebase project aleriaprojekt, codebase family-trees, command firebase.cmd deploy --only functions:family-trees --project aleriaprojekt --non-interactive. Rules/index unchanged.
Root release helper27/27 passed escalated. Other tests per above. Final independent review no material bugs. No root Git mutation except worktree creation, no commits/push/Netlify publish yet in this turn.
CUA qaBrowser id1, qaViewport override1280x900 (reset beforefinish), weaponTab1982820607 (screenshot0 width, DOM actual renderedvalues correct), archiveTab1982820610 currently ArkanerSchrei personalPNG loaded256px, correct VenalierPNG verified487px. This UI is root local8897; no writes beyond safe cache load, ignored existing sync conflict. Do not clear drafts/cache or overwrite local/online state.
## Recovery update: own System TEMP worktree
Target is now C:/Users/fhg_r/AppData/Local/Temp/aleria-reference-release-20261103; checkout exec session54784. E checkout failed due capacity and git automatically removed its partial tree; no sourcecleanup. Systemtemp62GB free beforecheckout adequate forsource+snapshot. Source helpers now allow exactly this named system-temp worktree through --target=ABS; every copy/audit MUST pass flag.
External process replaced unpublished master de4->9b->15296cfce6cee61550d7319f79ef7e2fb39a9ad3; currentroot master15296, origin still83e884367. User async asked to pause otherparallelrelease, noanswer yet. No release lock observed in external verifiedtree. Never mutate externaltree. Own master worktree sourcehead must becheckedbeforecommit/publish; official release aborts on HEAD movement.
New prepare option --authoring-base=de4c647c9a19b1c0b9679dc961609e9a9ff579cb preserves newer public baseline where sanitizedroot equals oldbase. This prevents reverting parallel fixes/Gawain/public family generated files or groupbundle. concurrentChanges list reports files independently changed in both baseline androot; review/generatebeforecommit. Root currentTeuluHTML already has buy-mode captions+new damagewording matching parallelfix.
Firebase functions:list now success, service503 recovered. Deploy stillneedsretry aftersafe publictarget reassembly. No Firebase/Netlify liveupdates completed yet.
## Backend complete / pending frontend release
Own target C:/Users/fhg_r/AppData/Local/Temp/aleria-reference-release-20261103 now on local task/reference-catalogs-20261103 (base15296), root remainsmaster. External verifiedtree release15296 completedverifiedat00:34:11, deploy6ae92b9472b7db177c8469d6, origin/master15296. No lock now. User asynccoordination questionnoreply, condition resolvedbyobservedcompletedrelease.
Own public prep398files156MB actualdiff395, allprivateaudit1876files0 +databasefull264files0. Newsourcehelper --authoring-base de4 preservesnewerbaseline. Allrootart/codeintact. Own DB fixes/canonicalpublic library/classcheckscomplete. Economynew304+review1313 builtpublic, preservedallolderprices; publishedfamilyDraig registrynewrevision4 preserved. SourcesLF normalization13289textfilesdone (i/lf w/crlf ONLY); no semanticchanges. Initial overlybroad own readscan was stoppedbeforewrites (session17253 closed), newtargetedtextscan41821done. No runningLFscan.
FirebasefinaldeploycompletedSUCCESS 32updated/0errored at00:38:58 after340tests, receipt diagnostics/reference-catalogs-20261103/firebase-deployment-verification.json. No LiveDB migration. Backendcurrentnewpublicgraph278modules.
Agent final_integration_audit continuingpreflightsuffix afterLFdone, allnewreferences/cultureclassesgreen, now repairs derivedmaphouseholdsfrompublicsources. Must await completebeforecommit; root soleGitowner. Final pipeline publishstillNOTstarted, no owncommitmade.
Plan: finalaudit+dataprivacyreceipt, stage/commit ONLY ownCpublictarget on taskbranch with [skip netlify]. Thenverifyroot/origin masterstill15296, fast-forward mastertoowncommit (CASexpected15296), switchownworktreetomaster --ignore-other-worktrees; backuprootindexfirst/preserveauthoringfiles. Runofficial node netlify/release/release.mjs --publish --push inCtarget (ALERIA_NETLIFY_CLI=E:/Aleria/netlify/.cli/node_modules/netlify-cli/bin/run.js). Requiredpipeline checksagain, snapshotreusesfixedownedstagepath removesownpreviousstage, Cspace~40GBprestageenough. Verifyproductioncommit/hashes/6Functions +UI. FinalCuaqaViewportresetneeded.
## Latest release checkpoint
Feature commit10f656f43175c68d6b81ad7c33db5f80ae07d975 committed406publicfiles onown taskbranch, thenCASFFmasterfrom15296, Ctargetswitchedtomaster. Rootindexbackup+mixedrefreshpreservedallauthoringfiles.
Firstofficialrelease session99722 exited1 BEFORE PUSH atEconomy rawsourcehashreceipt (34CRLFhashesstaleafterLFnormalization). Agent provedall34 hashes equalexactCRLFvariant, rebuiltONLYreceipt, bundle/catalog/calculationreportBYTEIDENTICAL, Economy35/35+geohashgreen, no backendchange.
Followupcommit2fb5a2ff206879ca18788935436f3e19e581882c includesnewEconomyreceipt, currentgeneratedpublicmediaregistryand resealreceipt; sourceFeature10fparent. Rootmaster/Cmaster2fb, rootindexrefreshedwithauthoringpreserved. No forcepush.
CURRENT OFFICIALRELEASE RUNNING execsession3247 in C:/Users/fhg_r/AppData/Local/Temp/aleria-reference-release-20261103; logfile diagnostics/reference-catalogs-20261103/netlify-release-final.log. EnvALERIA_NETLIFY_CLI E:/Aleria/netlify/.cli/node_modules/netlify-cli/bin/run.js. Commandnode netlify/release/release.mjs --publish --push. Pollviawrite_stdin3247andreadfilteredlog, don'tstartanotherrelease.
FirebaseSUCCESSalready32functionsupdated0failed(340tests)at00:38:58, publicreceiptcommitted. Agentfullpublicpreflight797prefix+1702suffixallgreen;7originalfixturesintentionallyversionedafterSHAchecks, mapHouseholds759removed8privateoldrows, expandedfullprivatescan505files0 andsourceaudit1880files0. Allagentsnowdone/no pendingmutations.
Need finishcurrentrequiredpipeline, snapshot/push/deploy/hash6functionverification, finalproductionUIchecksandreturnactualsuccess. Currentlastproductionisexternal15296deploy6ae92b9472b7db177c8469d6; oursNOTyetliveuntil3247success. Userasynccoordinationquestionnoreplybutotherreleasecompletedobservably00:34:11, nootherlock.
CUAqaBrowser1, archiveTab1982820610, weaponTab1982820607; qaViewport1280x900temporaryoverrideMUSTRESETbeforefinal. Usefreshproductiontabafterdeployratherthanold0widthweapontab. Userdraftsyncconflictwasdismissedonly,neveroverwritten.
