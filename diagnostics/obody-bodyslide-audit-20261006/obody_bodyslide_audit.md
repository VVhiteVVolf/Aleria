# BodySlide / OBody NG audit — 6 October 2026

The actual selected Nolvus instance was audited. No body rebuild, plugin activation, load-order change, animation generation or mesh repair was performed. Separately, the user-authorized cleanup removed only the 16 inactive, backed-up packages listed below.

## Scope and evidence

- Instance: `E:\Nolvus\Instances\Nolvus Awakening`.
- Skyrim: `E:\Nolvus\Instances\Nolvus Awakening\STOCK GAME`; MO2: `E:\Nolvus\Instances\Nolvus Awakening\MO2\ModOrganizer.exe`.
- Selected profile: **Nolvus Awakening - SkyrimNet Beta25 Test**. Its name is not used to infer installed SkyrimNet version.
- Profile files: `E:\Nolvus\Instances\Nolvus Awakening\MODS\profiles\Nolvus Awakening - SkyrimNet Beta25 Test\modlist.txt`, `plugins.txt`, `loadorder.txt`.
- 3982 enabled mod entries; 3889 active plugins; 4045 effective BodySlide project definitions; 12552 referenced third-person armor-addon model paths.
- OSP/XML inspected for SliderSets, ShapeData/source NIF, SliderGroups and SliderPresets. Loose priority follows the actual descending `modlist.txt`; Overwrite wins, then enabled loose mods, then associated active BSAs.
- 609 unique BSA tables inspected, including compressed SSE meshes. Models referenced only by creature/undead/child records are separated from adult humanoid body-conversion candidates.
- 3075 body TRI shape tables read; 3070 match preserved generated-output SHA-256 receipts. Matching NIF shape names were checked; all core skeleton bone names resolve in the winning XPMSSE skeleton.
- **Limit:** this is a disk/configuration audit, not an in-game OBody distribution test. Binary morph vertex indices/topology are not exhaustively compared for every aftermarket outfit. No mesh filename is used to claim a fixed build preset. Timestamp differences are cautions, not proof of stale geometry.
- A project definition points to an output, but multiple definitions can share it. A verified zeroed output pair does not prove that every alternative project was built. Historical selected-project manifests distinguish the documented choices.

## 1. Current female body

CBBE 3BA **2.47**, with CBBE **2.0.1** underneath. Keep `CBBE 3BBB Body Amazing`, `CBBE 3BBB Feet` and **`Hands Redone F Hands`**. Female Hands Redone is the deliberate current hand exception; replacing it with CBBE hands would change the setup.

- `CBBE 3BBB Body Amazing` → `meshes/actors/character/character assets/femalebody`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes 3BA, 3BA_Vagina, 3BA_Anus.
- `Hands Redone F Hands` → `meshes/actors/character/character assets/femalehands`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes artHands.
- `CBBE 3BBB Feet` → `meshes/actors/character/character assets/femalefeet`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes Feet.

## 2. Current male body

HIMBO **5.3.1**. The documented winning build selected **`HIMBO Body - SOS High Poly Phys CBPC`**, `HIMBO Hands` and `HIMBO Feet`. The word SOS is the project variant name, not a recommendation to install another genital framework. Do not substitute a nevernude, low-poly or SMP collision variant just because it shares `malebody`.

- `HIMBO Body - SOS High Poly Phys CBPC` → `meshes/actors/character/character assets/malebody`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes HIMBO - Body HP.
- `HIMBO Hands` → `meshes/actors/character/character assets/malehands`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes HIMBO - Hands.
- `HIMBO Feet` → `meshes/actors/character/character assets/malefeet`: winner **Twisted - Nolvus OBody BodySlide Output**; shapes HIMBO - Feet.

XPMSSE **5.06** supplies both winning skeletons. None of the six core output meshes references a bone absent from its winning skeleton. This confirms node availability, not a visual physics test.

## 3. OBody NG status

OBody NG **4.4.3.0** is enabled. Winning JSON: `E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\Twisted - Nolvus OBody Configuration\SKSE\Plugins\OBody_presetDistributionConfig.json`.
Settings Loader defaults plus saved `MCM/Settings/OBody.ini` give these disk values:

```ini
[Settings]
bORefitEnabled=1
bNippleSlidersORefitEnabled=1
bNippleRandEnabled=0
bGenitalRandEnabled=1
bPerformanceMode=1
iPresetKey=24
bForcePresetApplicationImmediate=1
bRespectfulMorphApplication=1
bLegacyStorageUtilUsageEnabled=1
[Maintenance]
bEnabled=1
iLoadingDelay=1
bLoadSettingsonReload=0
```

Female and male race/faction/plugin-specific preset maps are empty, so there is no forced sex-wide preset override in that JSON. **ElderRace is excluded for both sexes.** NPC blacklist lists are empty. Player/save-level assigned presets cannot be determined from these files alone.
Seven presets are excluded from random distribution, including `- Zeroed Sliders -`, `HIMBO Zero for OBody`, `TNG Default` and the Hands Redone-only preset. They are hidden from the OBody menu. This prevents zeroed/build-helper presets being used as normal body choices.
There are 7,192 outfit-name and 70 plugin-name **ORefit** exclusions plus 82 force-refit names. These are breast/clothing-refit exceptions, not a general switch disabling body morph distribution for all those outfits. Respectful morph application is enabled; prior RaceMenu/save morphs therefore need an in-game check if a particular actor is problematic.

## 4. RaceMenu morph status

RaceMenu **0.4.16**; winning INI from `RaceMenu Special Edition - Nolvus Settings`:

```ini
bEnableBodyMorph=1
bEnableBodyGen=0
iBodyMorphMode=0
uBodyMorphMemoryLimit=512000000
```

`bEnableBodyMorph=1` and `bEnableBodyGen=0` are appropriate for this OBody-managed setup. Do not enable BodyGen as a second automatic distributor.

## 5. Number of 3BA projects

**1509 definitions have a 3BA/3BBB project/group/source signature**, including alternatives, 242 head/hair/accessory definitions and 3 collision resources. **1,264 are classified as body/outfit definitions.** The complete list is in `obody_3ba_projects.txt`; it is not an instruction to build all 1,509.

## 6. Number of HIMBO projects

**1042 HIMBO definitions**, including 18 core-body variants/parts, 1 head/accessory project and 4 collision resources. **1,037 are body/outfit definitions.** Full list: `obody_himbo_projects.txt`.

## 7. Missing/unconfirmed 3BA conversions

42 source-provider mods have CBBE-only body/outfit outputs without an enabled 3BA alternative for those paths. Exact per-project names are in `obody_missing_conversions.txt`.
Examples among inspected sources include **Ashlander Apparel, Viridian Knight Armor, Onyx Lancer Armor, The Alchemist's Vestments - CBBE, Tribal Sorceress Outfit, Ashara Imperial Outfit - CBBE BodySlide** and some NordWarUA/CBBE projects. Some other items in those same mods can still have 3BA support; the list is path-specific.
CBBE-only outfits with a usable linked TRI can still follow female OBody sliders. A strict 3BA conversion is needed for the requested 3BA weighting/sliders/physics where relevant, not universally for rings, helmets, fixed armor parts or hands.
588 referenced humanoid female body-model/gender rows in the coverage-gap list lack an available linked body TRI; 106 other female rows have a TRI but lack confirmed 3BA project coverage. These are **coverage rows, not numbers of broken mods**.

## 8. Missing/unconfirmed HIMBO conversions

806 referenced humanoid male body-model/gender coverage rows lack an available linked body TRI; 53 have morph references but no matching inspected HIMBO source project. Exact paths, ARMA plugin providers and winning mesh providers are listed.
Current examples include body paths under **Sons of Skyrim / Xtudo patches**, **NordWarUA Weapon Expansion**, **Bruma**, **Carved Brink**, **Konahrik's Accoutrements** and some **Vigilant/Unslaad** equipment. An installed conversion whose output path differs from the winning ARMA model path does not cover that equipped model. Humanoid models with an unknown body family are not automatically labelled vanilla or SOS.

## 9. Outputs without usable morphs

3680 project definitions resolve to mesh+TRI output pairs unchanged from documented zeroed builds. These are shared-output definitions, not 3680 separately proven build choices.
The original strict all-links check flags 324 definitions, but many are hairstyles, alternatives, unbuilt accessories or redundant old links. The refined shape-table audit finds 3685 definitions with a usable matching link; **16 definitions have both stale and working links.** There are no unreadable packed body TRI tables among the 3075 tested files.
Confirmed missing equipped project outputs (loose and indexed associated active BSA lookup):

- OStim Calyps Strap-On 3BA | Twisted - OStim Standalone - Advanced Adult Animation Framework
- OStim Calyps Strap-On Simple 3BA | Twisted - OStim Standalone - Advanced Adult Animation Framework
- Sorceress Attire  3BA | Sorceress Attire
- Sorceress Boots  3BA | Sorceress Attire
- Sorceress Gloves  3BA | Sorceress Attire
- Sorceress Skirt 3BA | Sorceress Attire
- [Amsedillir]_Triumphal_Boots_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE
- [Amsedillir]_Triumphal_CoatC_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE
- [Amsedillir]_Triumphal_Coat_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE
- [Amsedillir]_Triumphal_HipDetal_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE
- [Amsedillir]_Triumphal_Shoes_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE
- [Amsedillir]_Triumphal_Torso_3BA | Twisted - Amsedillir - Triumphal 3BA-BHUNP-UBE

Other referenced compatible projects without a usable shape link (some are deliberate non-body accessories):

- CBBE SE - [COCO] TS Neck [3BA] | Twisted - [COCO] Twilight Sorceress
- Falka Armor Gloves S | Kozakowy's Falka Armor - 3BA

Mixed links occur in **Knight Errant HIMBO** parts, some **HIMBO Ancient Nord/Broken Amulets**, and the **OCum** accessory project. A working matching link exists, so a missing obsolete link alone is not reported as certain runtime failure. RaceMenu selects links while traversing the NIF nodes; the disk scan cannot prove that order for the in-game attachment.

Full mesh/tri winner and timestamp details: `project-morph-findings.csv` and `obody_conflicts.txt`. A newer mesh timestamp is not evidence that it was built without morphs.

## 10. Duplicate/conflicting projects

**527 output paths** have multiple project definitions, and **10 project names** occur more than once. Examples: standard CBBE/physics/nevernude/3BA all target `femalebody`; numerous HIMBO CBPC/SMP/high-poly/never-nude variants target `malebody`.
Exact choices and alternatives are recorded in `obody_recommended_batchbuild.txt`; duplicate names require inspecting their OSP paths. The malformed `Dark Brotherhood Armor - HIMBO` group XML has an incomplete **`&apos` entity without semicolon** on line 9. Its OSP projects remain readable, but the broken group file can prevent correct group selection.

## 11. Current BodySlide outputs

- **Twisted - Nolvus OBody BodySlide Output**: enabled; primary body and most Nolvus outfit output.
- **Twisted - Nolvus Outfit OBody Output**: enabled; additional 19 September outfit output.
- **BodySlide (Nude)**: enabled; older Nolvus output still supplies some otherwise uncovered paths.
- **Twisted - Additional Outfits OBody Output 20260923**: disabled in every saved profile; retained as a rebuild/repair resource. Its activation is not implied by the source outfits being installed.
BodySlide **5.6** executable: `E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\BodySlide and Outfit Studio\CalienteTools\BodySlide\BodySlide x64.exe`.
The normal tool Config.xml points OutputDataPath at **MO2 Overwrite**. The isolated `Twisted-OBody-20260919` tool points at its own generated-output mod and a historical **BuildCatalog**. That old snapshot is not a complete catalog of subsequent downloads. Both observations matter before a rebuild.

## 12. Which output wins

For all six shared core body/hand/foot outputs, **Twisted - Nolvus OBody BodySlide Output** wins over the originals and `BodySlide (Nude)`. The outfit output wins on its distinct outfit paths. There is no single global winning mod for all armor; `armor-mesh-priority.csv` records every one of the 12552 referenced paths, including BSA providers.
Linked body TRI output mostly comes from those same generated mods. Five inspected linked TRI files outside the preserved build receipt are not certified zeroed by hash. Head/face TRI files are unrelated to body morph TRI and were not counted as OBody evidence.

## 13. Overwrite

**Overwrite is empty at audit time.** No unexpected `.nif`, `.tri` or CalienteTools files override the generated outputs. Its being the default future BodySlide destination is a configuration concern, not a current conflict.

## 14. Exact recommended Batch Build configuration

Use the selected profile through MO2 with its current complete VFS. Female preset **`- Zeroed Sliders -`** from CBBE.xml; male **`HIMBO Zero for OBody`** from HIMBO.xml. Both presets were inspected and contain only zero-valued explicit sliders. **Build Morphs ON**, both weights for weighted projects; preserve intended armor zaps rather than changing styles globally.

- CBBE 3BBB Body Amazing
- Hands Redone F Hands
- CBBE 3BBB Feet
- HIMBO Body - SOS High Poly Phys CBPC
- HIMBO Hands
- HIMBO Feet

**Plan only:** 1097 selected female outputs (including the Hands Redone exception), 868 selected male outputs; 3 unresolved output groups. These groups must be resolved before calling this a complete safe batch.

Prefer separate new output mods **OBody - Female 3BA BodySlide Output** and **OBody - Male HIMBO BodySlide Output**. This installation has many alternate projects; separation makes generated ownership and rollback clearer. Choose exactly one project per shared path across both batches. After generation, inspect results before replacing the current outputs. Keep intentional NPC, beast-race, skin and hand repair winners; do not place a generic rebuild over every repair indiscriminately.

## 15. Exact exclusions

The complete 2067-definition exclusion list and 3 ambiguous groups are in `obody_recommended_batchbuild.txt`.
Exclude other standard-body variants (CBBE Body/Physics/Special/NeverNude/Underwear and CBBE 3BBB NeverNude/UniBoob), other HIMBO body variants, and CBBE/3BBB hand alternatives when Hands Redone is the selected output. Exclude BHUNP/UUNP/UBE/TBD alternatives, head/hair/facial projects, collision resources and fixed accessories from the ordinary body/outfit batch. CBBE-only body outfits need a conversion decision, not automatic deletion.

## 16. Problems ranked

**CRITICAL**

- **Triumphal and Sorceress Attire have enabled outfit records pointing to missing generated meshes.** Their relevant source projects exist, so selected builds can potentially supply them. This is an invisible-item risk; do not treat it as just a preset mismatch.
- Some other active armor-addon records also reference missing paths: 270 unique referenced paths across the whole plugin scan. These include unrelated quest, undead and accessory assets; `armor-mesh-priority.csv` lists them. Record existence alone does not prove a model is currently equipped/reachable in your save.
**IMPORTANT**

- Matching HIMBO/3BA coverage and body TRI support are incomplete for various current humanoid outfit paths. Inspect the path-specific conversion-gap inventory rather than selecting all conversions by mod name.
- Historical BodySlide tools can use stale catalogs; the normal tool writes to Overwrite. Resolve catalog/destination and ambiguous variants before a broad batch.
- Broken Dark Brotherhood HIMBO group XML; duplicate projects sharing output; mixed obsolete and current BODYTRI links requiring a focused in-game check.
- Unknown preset provenance remains for outputs not matching a documented zeroed mesh+TRI receipt. Do not claim that they are fixed-preset builds without further evidence.
**OPTIONAL**

- Separate female/male output ownership; CBBE-to-3BA upgrades for currently morphing CBBE outfits where the requested 3BA physics matters; document intentional fixed accessory exceptions.
- ElderRace distribution is intentionally excluded in the current configuration. Changing that is a separate decision, not an automatic audit repair.

## Authorized space cleanup

**16 inactive mods removed; 2.341 GiB freed.** All were disabled in every saved profile and their entire current file sets matched the verified backup manifests. The corresponding backup archives were rehashed and matched the stored SHA-256 checksums before deletion.
Backup root: `D:\Nolvus-Backups\Awakening-6.0.20-vor-Update-20260930`. `cleanup-result.json` records each removed absolute directory and its backup archive group. Restore a removed mod from `instance/MODS/mods/<mod name>/` within its listed archive; this audit did not rewrite those archives.

- IntelEngine - Nolvus Action Integration — 0.000 GiB; backup 10-Zusatzmods-01
- SkyrimNet - Beta 25 — 0.735 GiB; backup 10-Zusatzmods-01
- SkyrimNet - Nolvus Action Repairs 20260925 — 0.000 GiB; backup 10-Zusatzmods-01
- SkyrimNet UDNG 0.12.0 — 0.021 GiB; backup 10-Zusatzmods-01
- Twisted - Additional Expressions Project V2 - Screen Archer Menu Addon — 0.000 GiB; backup 10-Zusatzmods-03
- Twisted - Dragonborn Voice Over — 0.005 GiB; backup 10-Zusatzmods-04
- Twisted - Flash Games - Struggling QTE — 0.003 GiB; backup 10-Zusatzmods-04
- Twisted - Inconsequential NPCs — 0.118 GiB; backup 10-Zusatzmods-05
- Twisted - Nolvus OStimNet Compatibility — 0.000 GiB; backup 10-Zusatzmods-06
- Twisted - OStimNet_v — 0.004 GiB; backup 10-Zusatzmods-08
- Twisted - OStrap - OStim Modular Strapons - Settings Loader — 0.000 GiB; backup 10-Zusatzmods-08
- Twisted - OSurvival Mode - Ostim StandAlone — 0.087 GiB; backup 10-Zusatzmods-08
- Twisted - SAM Expression Pack - Screen Archer Menu Face Emotions — 0.000 GiB; backup 10-Zusatzmods-08
- Twisted - Serana Dialogue Add-On — 0.352 GiB; backup 10-Zusatzmods-08
- Twisted - SeverActions — 0.282 GiB; backup 10-Zusatzmods-08
- Twisted - SkyrimNet — 0.733 GiB; backup 10-Zusatzmods-01

**183 inactive mods retained**, including 70 used in other saved profiles and conversion/body/skin/physics/head/hair/tool resources potentially needed for repairs. Reasons and sizes are in `inactive-mods-cleanup.csv`; the initial inactive total of 133.07 GiB is not all expendable.
Profile files and ModOrganizer.ini were SHA-256 checked after cleanup and remain unchanged. No active mod directories were deleted. E: now has approximately **20.87 GiB free**.

## Files and technical references

- Requested inventories and plan: `obody_3ba_projects.txt`, `obody_himbo_projects.txt`, `obody_missing_conversions.txt`, `obody_conflicts.txt`, `obody_recommended_batchbuild.txt`.
- Full current mod-support table: `enabled-mod-body-support.csv`; per-model priority table: `armor-mesh-priority.csv`; per-project morph results: `project-morph-findings.csv`.
- Machine-readable inputs: `inventory.json`, `projects.json`, `plugin-records.json`, `archives.json`, `armor-audit.json`, `configuration.json`, `morph-details.json`, `batch-plan.json`, `conversion-gaps.json`.
- [OBody NG author implementation](https://github.com/Aietos/OBody-NG/blob/main/src/Body/Body.cpp): runtime body morph handling.
- [RaceMenu author body-morph implementation](https://github.com/expired6978/SKSE64Plugins/blob/master/skee64/BodyMorphInterface.cpp): BODYTRI lookup and named shape tables.
- [BodySlide official documentation](https://github.com/ousnius/BodySlide-and-Outfit-Studio/wiki): project and conversion workflow. Findings and the exact zeroed presets above are supported primarily by your inspected local files and preserved build records.
