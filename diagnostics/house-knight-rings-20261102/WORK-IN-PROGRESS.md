# Archivierter Zwischenstand (2. November 2026)

**Überholt:** Bilder und Daten sind inzwischen fertiggestellt. 49 Online-Profile
sind gespeichert und idempotent verifiziert; drei weitere Figuren sind lokal
ergänzt. Der lokale Abgleich umfasst 51 bestehende Akten, Sleipnir bleibt online.
Alle 20 Itembilder sind veröffentlicht und byteweise geprüft. Gildas besitzt
einschließlich des alten Vorschaubildfelds sein Gafyr-Siegel. Browser- und
Servermechanik sind synchronisiert und lokal geprüft; Code wurde nicht deployed.
Aktuelle Zuständigkeiten und Prüfwege stehen in
`AleriaAlmanach/modules/house-knight-rings/README.md`.

Der folgende Text bleibt als ursprünglicher Arbeitszwischenstand erhalten;
seine offenen Schritte und laufenden Bildjobs gelten nicht mehr.

User requests, all still active: Rianna's antique silver stag coin from Armel; traces of Tenebrit, carried magical damage reduction 1, brief crackle when bitten. Add Oweta's missing Draig Speer. Give all characters with real worked inventories in houses/clans of rank order <= knight (60) their OWN house seal ring. Ignore the six untouched editor placeholder cards. User explicitly corrected Gildas: Gafyr ring, never Draig. Instance naming: `Gais Siegelring`, image is ring with Wyrm emblem. Template names can be `Wyrm-Siegelring`.

Completed earlier avatar UI task is independent, tested 115 passing tests, no release. Do not undo it.

Current new work:
- Coin image generated and copied `AleriaAlmanach/assets/gwynthor-seven/items/rianna-silberhirsch-v1.png`; generation and alpha checks in `diagnostics/rianna-silberhirsch-20261102/`. Original exact image preserved. 1254 square RGBA, transparent exterior, internal alpha mostly 252. Visually fine.
- Added coin and now spear definitions to `modules/gwynthor-seven/equipment.mjs`. Coin description and `passiveEffects` updated to user Tenebrit request. Spear image path `oweta-draig-speer-v1.png` does NOT exist yet and must be generated or an actual original reused. Do NOT globally rebuild old possession loadouts; append via a focused amendment. Oweta's old three-piece source loadout has NOT been changed.
- Added `modules/character-equipment/equipment-passive-effects.js`: strict carried/equipped magical flat damage reduction. Patched item-definition-model/resolver, character-equipment-sync, equipment-damage-protection, combat-effect-model and combat-profile-model to derive passives from immutable bound item definitions; magical flag was already available throughout combat resolution. Need tests, shared generated server sync, catalogs rebuild, validation. No backend deployment done.
- `build-authored-item-catalog.mjs` and `build-item-register.mjs` ran BEFORE Tenebrit/spear change; need rerun after ring catalog. Generated server authored catalog copied before these further changes; sync still needed.

Audit:
- `online-before.json` is read-only public Firestore snapshot: 390 docs. `inspect-online.mjs` uses existing public content read client. Live worked inventories = 48; all rank-eligible. `candidates.json` has resolved family/rank based on explicit genealogy, with local known-ID fallback if online lacks it. Treat family membership separately from lord/service; do not guess surname.
- Local snapshot `CharakterDatenbank/generated/characters.snapshot.json`: 265 records, 52 with non-placeholder inventories. Union has about 52 eligible world identities: online 48 plus Kamber (online doc exists but inventory empty), local-only Rhosyn Awenydd, Briallen Awenor, Evie Rhyddid. Saerwyn Gwyllach and Cynddelw Llythfor are commoner and excluded. Local Gildas ID `gildas-gafyr` aliases live `person--haus-gafyr--gildas-gafyr`; match world identity, preserve existing IDs.
- Some worked inventories only contain actual named companions. Count them as worked, not placeholders; user said ALL.
- Gildas existing item ID `gildas-gafyr-draig-knight-signet-item`, image `https://i.imgur.com/mwP2vjq.png`, +1 persuasion while openly worn in description/infoRows, equipped true. Preserve existing personal effect and stable instance ID while correcting house/name/crest/tags/ref. Do not invent bonus for other rings.
- No new private dossiers are in scope. Private index inspected for exclusions, IDs did not overlap public candidates; never copy private records.

Artwork:
- `ring-houses.json` lists 18 houses (including local-only 3) and actual emblem references.
- Existing Draig original downloaded to `assets/house-knight-rings/sources/draig-rittersiegelring-original.png` using Node fetch (Python urllib network fails). Reuse it for Draig, copy to expected `haus-draig-siegelring-v1.png` still needed.
- All 18 actual crests have been viewed. Skellor manifest emblemPath was wrong due root-relative `/Stammbäume/...`; correct absolute path is `E:/Aleria/Stammbäume/assets/images/houses/Rhonwens Tränen/Ritterliche/Skellor.png`. Corrected only in functions store ringHouses; fix list-artworks.mjs/manifest for repeatability.
- Built-in imagegen batch exec cell **61** is STILL RUNNING with 3 workers generating remaining rings, copying to `assets/house-knight-rings/<house>-siegelring-v1.png` and writing each prompt/source metadata JSON in this diagnostics folder. Resume using functions.wait on cell 61; do not launch another batch of the same rings. Successful results also saved in functions store `ringGeneration:<houseId>`; base prompt is in `ringGeneration:haus-wyrm`.
- First batch already finished Wyrm, Gafyr, Aderyn. Batch 61 also completed Awenor, Awenydd, Balchder, Gwefrydd, Gwyvern, Neidr, Rhyddid, Saethwyr, Skald, Skellor by last status. Varulv, Wolfshorn, Wylan are still pending. Check actual files/status.
- Chwedonol generation failed at output moderation (heraldic mermaid reference has bare chest). Retry once with a safe stylized fully nonanatomical engraved mermaid icon retaining tail, jewel, fish arrangement; no nudity detail. Do not change to CLI, no key needed.
- All generated rings visually good and shown to user. User style: full hand-painted transparent 1:1 RPG item. They use actual crests and common gold signet reference, no invented symbols.

Next work:
1. Finish artwork batch, retry Chwedonol, generate Oweta spear using actual Draig reference and existing plain spear reference; optionally coin v2 tiny dark Tenebrit specks (not necessary if trace alloy invisible; original retained).
2. Feature-based ring catalog source and pure membership/grant plan, then add ring definitions to existing authored catalog generator. No auto-grant on load. One-time, deterministic/idempotent claims, preserve money/live resources/history/other items. Existing `createGrantedItem`, `itemDefinitionFromTemplate`, publication client/backup helpers available.
3. Apply inventory additions to all eligible LOCAL records, registry/snapshot plus scoped exports via existing record projection infrastructure; preserve local extras. Online ring updates + spear/coin should be fresh, bounded, with updateTime preconditions, encrypted original backups, combat locks, atomic award claims and re-read verification, following `firebase/scripts/content/publish-knight-starting-possessions.mjs`. Explicit user says modify all inventories. Do not publish unrelated local assets/site or force migrate.
4. Existing old projection `starting-possessions-database.mjs` merges by item ID and preserves local extra items; may naturally keep rings/spear; its export timestamp may still rewrite newer metadata on --check, assess. Shared `CharakterDatenbank/lib/character-equipment-record-projection.mjs` copies only supplied inventory/weapons/armor, preserves other fields and local metadata; uses mergeCharacterRecordProjections.
5. Test magical damage only, minimum zero, duplicate charms don't stack, dropping coin clears derived effect, old immutable versions unchanged, ring eligibility/own-house correctness/Gildas correction/names/idempotency/unchanged live fields. Regenerate server graph carefully and verify frontend/server parity. Deployment not yet done; do not claim active online damage effect without updating backend.

Relevant sources already read: root AGENTS, imagegen skill (built-in only, copy final assets into workspace, preserve originals, report prompt path), art presets inventory style, equipment standards. No subagents permitted (none spawned). Do not spawn agents.
