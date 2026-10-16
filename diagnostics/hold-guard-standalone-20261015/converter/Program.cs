using Mutagen.Bethesda.Skyrim;
using Mutagen.Bethesda.Plugins;
using Newtonsoft.Json;

// Private conversion of this specific, never-installed replacer into new records.
var source = SkyrimMod.CreateFromBinary(args[0], SkyrimRelease.SkyrimSE);
if (source.ModKey.FileName.ToString() != "1GuarfArmor.esp" || source.Armors.Count != 22 || source.ArmorAddons.Count != 21)
    throw new InvalidOperationException("Unexpected source package; review conversion first");
var mod = new SkyrimMod(ModKey.FromNameAndExtension("HoldGuardHuskarlStandalone.esp"), SkyrimRelease.SkyrimSE);
mod.ModHeader.Author = "Local private adaptation; original assets by original author";
mod.ModHeader.Description = "Standalone Huskarl variants; no vanilla equipment or NPC overrides.";
mod.ModHeader.Flags |= SkyrimModHeader.HeaderFlag.LightMaster;
mod.ModHeader.Stats.Version = 1.7f;
uint next = 0x800;
var map = source.Armors.Select(r => r.FormKey).Concat(source.ArmorAddons.Select(r => r.FormKey))
    .ToDictionary(key => key, key => new FormKey(mod.ModKey, next++));
var itemNames = new Dictionary<string, string>();
foreach (var original in source.Armors) {
    var armor = original.Duplicate(map[original.FormKey]);
    armor.EditorID = "LocalHuskarl_" + original.EditorID;
    var title = original.Name?.String ?? original.EditorID ?? "Armor";
    title = title.Replace("Guard's", "Huskarl").Replace("Guard Helmet", "Huskarl Helmet")
        .Replace("Guard Boots", "Huskarl Boots").Replace("Guard Gauntlets", "Huskarl Gauntlets")
        .Replace("Stormcloak", "Eastmarch Huskarl");
    if (original.EditorID == "ArmorStormcloakCuirassSleeves") title += " (Sleeves)";
    if (original.EditorID == "ArmorStormcloakHelmetFull") title += " (Stormcloak)";
    armor.Name = title;
    armor.IsCompressed = false;
    mod.Armors.Add(armor);
    itemNames[armor.EditorID] = title;
}
foreach (var original in source.ArmorAddons) {
    var addon = original.Duplicate(map[original.FormKey]);
    addon.EditorID = "LocalHuskarl_" + original.EditorID;
    addon.IsCompressed = false;
    mod.ArmorAddons.Add(addon);
}
mod.RemapLinks(map);
var refs = JsonConvert.DeserializeObject<Dictionary<string, uint>>(File.ReadAllText(args[2]))!;
FormKey Base(string name) => new(ModKey.FromNameAndExtension("Skyrim.esm"), refs[name]);
var recipeTemplate = source.ConstructibleObjects.First();
foreach (var armor in mod.Armors) {
    bool body = (armor.BodyTemplate!.FirstPersonFlags & BipedObjectFlag.Body) != 0;
    var counts = body ? new[] { 4, 2, 3 } : new[] { 2, 1, 2 };
    foreach (bool temper in new[] { false, true }) {
        var recipe = recipeTemplate.Duplicate(new FormKey(mod.ModKey, next++));
        recipe.EditorID = (temper ? "Temper_" : "Craft_") + armor.EditorID;
        recipe.Items ??= new();
        recipe.Items.Clear();
        if (!temper) recipe.Conditions.Clear();
        void Ingredient(string name, int count) {
            var entry = new ContainerEntry { Item = new ContainerItem { Count = count } };
            entry.Item.Item.SetTo(Base(name));
            recipe.Items.Add(entry);
        }
        Ingredient("IngotSteel", temper ? 1 : counts[0]);
        if (!temper) { Ingredient("Leather01", counts[1]); Ingredient("LeatherStrips", counts[2]); }
        recipe.CreatedObject.SetTo(armor.FormKey);
        recipe.CreatedObjectCount = 1;
        recipe.WorkbenchKeyword.SetTo(Base(temper ? "CraftingSmithingArmorTable" : "CraftingSmithingForge"));
        mod.ConstructibleObjects.Add(recipe);
    }
}
// Nine no-helmet outfits. Weapons and follower AI are not edited.
var holds = new Dictionary<string, string> {
    ["Whiterun"] = "ArmorGuardCuirassWhiterun", ["Solitude"] = "ArmorGuardCuirassSolitude",
    ["Riften"] = "ArmorGuardCuirassRiften", ["Markarth"] = "ArmorGuardCuirassMarkarth",
    ["Eastmarch"] = "ArmorStormcloakCuirassSleeves", ["Falkreath"] = "ArmorGuardCuirassFalkreath",
    ["Hjaalmarch"] = "ArmorGuardCuirassHjaalmarch", ["Pale"] = "ArmorGuardCuirassThePale",
    ["Winterhold"] = "ArmorGuardCuirassWinterhold"
};
var boots = mod.Armors.Single(a => a.EditorID == "LocalHuskarl_1GuardBoots");
var gloves = mod.Armors.Single(a => a.EditorID == "LocalHuskarl_1GuardGauntlets");
var outfits = new Dictionary<string, string>();
foreach (var (hold, bodyId) in holds) {
    foreach (bool shield in new[] { false, true }) {
        var suffix = hold + (shield ? "Shield" : "");
        var outfit = new Outfit(new FormKey(mod.ModKey, next++), SkyrimRelease.SkyrimSE) { EditorID = "LocalHuskarlOutfit" + suffix };
        outfit.Items = new();
        foreach (var armor in new[] { mod.Armors.Single(a => a.EditorID == "LocalHuskarl_" + bodyId), boots, gloves })
            outfit.Items.Add(new FormLink<IOutfitTargetGetter>(armor.FormKey));
        if (shield) outfit.Items.Add(new FormLink<IOutfitTargetGetter>(Base("ArmorSteelShield")));
        mod.Outfits.Add(outfit);
        outfits[suffix] = outfit.FormKey.ToString();
    }
}
mod.ModHeader.Stats.NextFormID = next;
var all = mod.EnumerateMajorRecords().ToArray();
if (all.Any(r => r.FormKey.ModKey != mod.ModKey || r.FormKey.ID < 0x800 || r.FormKey.ID > 0xFFF))
    throw new InvalidOperationException("Record ownership/range invalid");
if (all.Any(r => r.EnumerateFormLinks().Any(l => l.FormKey.ModKey == source.ModKey || map.ContainsKey(l.FormKey))))
    throw new InvalidOperationException("Original replacer link leaked into standalone");
mod.WriteToBinary(args[1]);
File.WriteAllText(args[3], JsonConvert.SerializeObject(new {
    map = map.ToDictionary(p => p.Key.ToString(), p => p.Value.ToString()),
    outfits, names = itemNames, records = all.Length, nextFormId = next
}, Formatting.Indented));
Console.WriteLine($"Standalone built: {all.Length} new ESL-range records; 22 armor items, 44 recipes, 18 outfits including shield variants.");
