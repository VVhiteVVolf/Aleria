#include <inja.hpp>
#include <fstream>
#include <iostream>
#include <regex>
#include <sstream>
#include <stdexcept>
using json = nlohmann::json;

void require(bool ok, const std::string& reason) {
    if (!ok) throw std::runtime_error(reason);
}
int main(int argc, char** argv) {
    try {
        require(argc == 2, "Expected candidate or installed prompt path");
        std::ifstream input(argv[1], std::ios::binary);
        require(input.good(), "Cannot open template");
        std::ostringstream buffer;
        buffer << input.rdbuf();
        // SkyrimNet supports elif, whereas upstream inja uses else if.
        const auto source = std::regex_replace(buffer.str(), std::regex(R"(\{%\s*elif\s+)"), "{% else if ");
        inja::Environment env;
        env.set_line_statement("@@UNUSED_LINE_STATEMENT@@");
        bool actor = false, narrator = false, narration = false;
        std::string engine;
        env.add_callback("is_audio_tags_enabled", 1, [&](inja::Arguments& args) {
            return json(args[0]->get<int>() == 1 ? actor : narrator);
        });
        env.add_callback("get_narrator_uuid", 0, [](inja::Arguments&) { return json(2); });
        env.add_callback("is_narration_enabled", 0, [&](inja::Arguments&) { return json(narration); });
        env.add_callback("get_actor_tts", 1, [&](inja::Arguments&) { return json(engine); });
        env.add_callback("get_allowed_audio_tags", 1, [](inja::Arguments&) {
            return json::array({"emotion-affection", "style-whispering", "prosody-pitch_low", "sfx-sigh"});
        });
        const auto compiled = env.parse(source);
        int cases = 0;
        for (auto tts : {"inworld", "higgs", "higgs_v3", "chatterbox"}) {
            engine = tts;
            for (auto mode : {"full", "transform", "thoughts", "summary"}) {
                for (int a = 0; a < 2; ++a) for (int n = 0; n < 2; ++n) for (int enabled = 0; enabled < 2; ++enabled) {
                    actor = a; narrator = n; narration = enabled;
                    auto output = env.render(compiled, json{{"npc", {{"UUID", 1}}}, {"render_mode", mode}});
                    auto has = [&](const std::string& text) { return output.find(text) != std::string::npos; };
                    const bool visible = (actor || (narrator && narration)) && std::string(mode) != "summary";
                    require(has("Voice Performance Tags") == visible, "Wrong mode/audio-tag visibility");
                    if (visible) {
                        const bool higgs = actor && (engine == "higgs" || engine == "higgs_v3");
                        const bool chatterbox = actor && engine == "chatterbox";
                        require(has("Tag catalog (41 total)") == higgs, "Higgs instruction leakage");
                        require(has("Allowed emotion tags") == chatterbox, "Chatterbox instruction leakage");
                        require(has("natural language delivery instruction") == (!higgs && !chatterbox), "Generic instruction branch");
                        require(has("Tags only work in *narration*") == (!actor && narrator && narration), "Narrator-only scope");
                        require(has("Tags only work in dialogue") == (actor && !narrator && narration), "Actor-only scope");
                        if (higgs) require(has("`[emotion-affection]`") && has("`[sfx-sigh]`"), "Allowed Higgs tags missing");
                        if (engine == "inworld") {
                            for (auto reaction : {"[breathe]", "[sigh]", "[gasp]", "[grunt]", "[moan]", "[laugh]", "[giggle]", "[cry]", "[sob]", "[clear throat]", "[cough]", "[yawn]"})
                                require(has(reaction), std::string("Missing Inworld reaction ") + reaction);
                            require(has("shout loudly in a panic") == actor, "Actor examples scope");
                        }
                    }
                    ++cases;
                }
            }
        }
        std::cout << "PASS " << cases << " template render cases: Inworld/Higgs/Higgs_v3/Chatterbox, modes and audio/narration switches\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << error.what() << "\n";
        return 1;
    }
}
