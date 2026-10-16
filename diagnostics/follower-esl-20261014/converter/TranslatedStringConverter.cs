using Mutagen.Bethesda.Strings;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

internal sealed class TranslatedStringConverter : JsonConverter
{
    public override bool CanConvert(Type type) => typeof(ITranslatedStringGetter).IsAssignableFrom(type);
    public override void WriteJson(JsonWriter writer, object? value, JsonSerializer serializer)
    {
        if (value is not ITranslatedStringGetter text) { writer.WriteNull(); return; }
        serializer.Serialize(writer, text.Select(pair => new { Key = (int)pair.Key, Value = pair.Value }).ToArray());
    }
    public override object? ReadJson(JsonReader reader, Type type, object? existing, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null) return null;
        var entries = JArray.Load(reader);
        var result = new TranslatedString(Language.English);
        foreach (var pair in entries) result.Set((Language)(int)pair["Key"]!, (string?)pair["Value"]);
        return result;
    }
}
