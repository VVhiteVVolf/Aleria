using Mutagen.Bethesda.Skyrim;
using Mutagen.Bethesda.Json;
using Mutagen.Bethesda.Plugins;
using Newtonsoft.Json;

// Bounded converter: only audited Veronica record types, using public duplicate/remap APIs.
var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto, Formatting = Formatting.Indented };
settings.AddMutagenConverters();
settings.Converters.Add(new TranslatedStringConverter());
var mod = SkyrimMod.CreateFromBinary(args[1], SkyrimRelease.SkyrimSE);
if (args[0] == "dump") {
    File.WriteAllText(args[2], JsonConvert.SerializeObject(mod, settings));
    return;
}
if (args[0] == "compact") {
    if (mod.ModKey.FileName.ToString() != "VeronicaFollower.esp") throw new InvalidOperationException("Only audited Veronica supported");
    var own = mod.EnumerateMajorRecords().Where(r => r.FormKey.ModKey == mod.ModKey).OrderBy(r => r.FormKey.ID).ToArray();
    if (own.Length != 25) throw new InvalidOperationException("Unexpected record count");
    var map = own.Select((r, i) => (r.FormKey, New: new FormKey(mod.ModKey, (uint)(0x800 + i)))).ToDictionary(x => x.FormKey, x => x.New);
    var textures = mod.TextureSets.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var heads = mod.HeadParts.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var armor = mod.Armors.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var npcs = mod.Npcs.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var packages = mod.Packages.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var addons = mod.ArmorAddons.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var relationships = mod.Relationships.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    var outfits = mod.Outfits.Select(r => r.Duplicate(map[r.FormKey])).ToArray();
    mod.TextureSets.Clear(); mod.TextureSets.Set(textures);
    mod.HeadParts.Clear(); mod.HeadParts.Set(heads);
    mod.Armors.Clear(); mod.Armors.Set(armor);
    mod.Npcs.Clear(); mod.Npcs.Set(npcs);
    mod.Packages.Clear(); mod.Packages.Set(packages);
    mod.ArmorAddons.Clear(); mod.ArmorAddons.Set(addons);
    mod.Relationships.Clear(); mod.Relationships.Set(relationships);
    mod.Outfits.Clear(); mod.Outfits.Set(outfits);
    foreach (var block in mod.Cells.Records)
        foreach (var subblock in block.SubBlocks)
            foreach (var cell in subblock.Cells) {
                if (cell.FormKey.ModKey == mod.ModKey || cell.Persistent.Count != 0) throw new InvalidOperationException("Unexpected cell structure");
                for (int i = 0; i < cell.Temporary.Count; i++) {
                    if (cell.Temporary[i] is not PlacedNpc npc) throw new InvalidOperationException("Unexpected placed record");
                    cell.Temporary[i] = npc.Duplicate(map[npc.FormKey]);
                }
            }
    mod.RemapLinks(map);
    mod.ModHeader.Flags |= SkyrimModHeader.HeaderFlag.LightMaster;
    mod.ModHeader.Stats.NextFormID = (uint)(0x800 + own.Length);
    if (mod.EnumerateMajorRecords().Any(r => r.EnumerateFormLinks().Any(l => map.ContainsKey(l.FormKey)))) throw new InvalidOperationException("Unmapped own link");
    File.WriteAllText(args[3], JsonConvert.SerializeObject(map.ToDictionary(p => p.Key.ToString(), p => p.Value.ToString()), Formatting.Indented));
} else if (args[0] != "roundtrip") throw new ArgumentException("Invalid mode");
foreach (var record in mod.EnumerateMajorRecords()) record.IsCompressed = false;
mod.WriteToBinary(args[2]);
Console.WriteLine($"{args[0]} complete: {mod.EnumerateMajorRecords().Count()} records; output {args[2]}");
