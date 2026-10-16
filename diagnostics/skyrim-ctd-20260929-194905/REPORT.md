# Skyrim CTD repair attempt ? 29 September 2026

Profile: Nolvus Awakening - SkyrimNet Beta25 Test.

## Evidence

At 19:48:21 SkyrimNet caught an access violation in TESForm::GetName while decorating actor factions. The game continued until 19:49:05, when IntelEngine.dll+00BD239 caused an unhandled read at 0x28. Erandur appears in the stack. That identifies the failure location, not necessarily the component that corrupted the data.

Dynamic Combat Collision 1.4.3 was loaded at the time. A matching SkyrimNet issue reports resolution after removing it; its Nexus posts also report faction/follower failures and crashes. This is a strong troubleshooting lead, not a proven local root cause.

Sources:
- https://github.com/MinLL/SkyrimNet-GamePlugin/issues/537#issuecomment-5469834981
- https://www.nexusmods.com/skyrimspecialedition/mods/189119?tab=posts

## Applied change

Disabled Dynamic Combat Collision 1.4.3 and Dynamic Combat Collision - MCM 1.1 in modlist.txt; disabled DynamicCombatCollision.esp in plugins.txt. No mod files deleted. IntelEngine, SkyrimNet, Precision and personal prompts were left intact. No DLL binary edits, NPC resets or save cleaning.

IntelEngine DLL, ESP and all 11 PEX scripts match the official v3.5.1 archive. SkyrimNet DLL matches beta25.1-rc2. No competing active loose providers for these files. No active plugins depend on DynamicCombatCollision.esp.

Backup: E:\Nolvus\Instances\Nolvus Awakening\MODS\Backups\DCC-Follower-Stability-20260929-200248
Only the three activation flags changed; loadorder.txt is unchanged. Post-change validation found no missing masters and no remaining loose DCC DLL or ESP provider in the profile.

## Required game validation

Start Skyrim fresh through this MO2 profile, load the affected save, test NPC dialogue and following, enter/leave an interior, and test combat then dialogue again. The last crash occurred after 30 minutes; a short successful start cannot prove stability. Use a new manual save slot for testing and retain earlier saves. If a missing-content warning names DynamicCombatCollision.esp alone, that is the expected disabled MCM plugin. Stop and inspect any different missing-content warning.

If the problem persists, preserve new SkyrimNet.log, IntelEngine.log and crash logs BEFORE restarting. The next step is to determine whether the same signature occurs without DCC; do not blindly delete actor records from saves.

## Rollback

With Skyrim and MO2 closed, restore modlist.txt and plugins.txt from the backup if there have been no other profile changes. Otherwise re-enable only the two named mods and DynamicCombatCollision.esp in MO2 so later profile edits are retained. This also restores the suspect component, so use rollback only deliberately.
