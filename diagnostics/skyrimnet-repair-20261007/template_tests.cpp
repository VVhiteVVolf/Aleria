#include <inja.hpp>
#include <fstream>
#include <iostream>
#include <regex>
#include <sstream>
#include <stdexcept>

using json = nlohmann::json;

std::string read(const std::string& path) {
    std::ifstream stream(path);
    if (!stream) throw std::runtime_error("Cannot read template: " + path);
    std::ostringstream out;
    out << stream.rdbuf();
    // SkyrimNet accepts this alias; upstream inja spells it 'else if'.
    return std::regex_replace(out.str(), std::regex(R"(\{%\s*elif\s+)"), "{% else if ");
}

void check(bool condition, const std::string& name) {
    if (!condition) throw std::runtime_error("FAILED: " + name);
    std::cout << "PASS " << name << "\n";
}

int main(int argc, char** argv) {
    try {
        if (argc != 3) throw std::runtime_error("Expected overrides directory and installed base prompt directory");
        const std::string root = std::string(argv[1]) + "/SKSE/Plugins/SkyrimNet/overlay/prompts/";
        const std::string base = std::string(argv[2]) + "/";
        json fixture = {
            {"render_mode", "full"}, {"npc", {{"UUID", 20}}}, {"actorUUID", 20},
            {"player", {{"name", "Player"}, {"UUID", 10}}},
            {"responseTarget", {{"UUID", 10}, {"type", "player"}}},
            {"gameTimeNumeric", 100000}, {"inventory", json::object()},
            {"equipment", json::object()},
            {"memories", json::array({{
                {"isOwn", true}, {"originName", "NPC"},
                {"memory", {{"game_time", 99000}, {"season", "winter"},
                    {"content", "The player returned a lost book."}, {"emotion", "grateful"},
                    {"importance_score", 5}, {"tags", "friendship"}}}
            }})}
        };
        inja::Environment env;
        // SkyrimNet prompts use Markdown ## headings as plain text.
        env.set_line_statement("@@UNUSED_LINE_STATEMENT@@");
        env.add_callback("feature_enabled", 1, [](inja::Arguments& args) {
            return json(args[0]->get<std::string>() == "quest_actions");
        });
        env.add_callback("is_player", 1, [](inja::Arguments& args) { return json(*args[0] == 10); });
        env.add_callback("is_action_enabled", 1, [](inja::Arguments&) { return json(true); });
        env.add_callback("available_dialogue", 2, [](inja::Arguments&) {
            return json{{"hasContent", true}, {"text", "Quest test: accept the task [00001234]"}};
        });
        env.add_callback("get_relevant_memories", 1, [&](inja::Arguments&) { return fixture["memories"]; });
        env.add_callback("decnpc", 1, [](inja::Arguments&) { return json{{"name", "NPC"}}; });
        env.add_callback("get_actor_value", 2, [](inja::Arguments&) { return json(100); });
        env.add_callback("get_base_actor_value", 2, [](inja::Arguments&) { return json(100); });
        env.add_callback("get_worn_equipment", 1, [&](inja::Arguments&) { return fixture["equipment"]; });
        env.add_callback("track_entity_state", 4, [](inja::Arguments&) {
            return json{{"hasPrevious", false}, {"isRecent", false}, {"changed", false}};
        });
        env.add_callback("sever_in_scene", 1, [](inja::Arguments&) { return json(""); });
        env.add_callback("get_merchant_inventory", 1, [&](inja::Arguments&) { return fixture["inventory"]; });
        env.add_callback("get_form_name", 1, [](inja::Arguments&) { return json("Item"); });

        const auto quest = read(root + "submodules/user_final_instructions/0740_quest_dialogue.prompt");
        check(env.render(quest, fixture).find("Quest test") != std::string::npos, "Quest branches render with quest_actions");
        auto noTarget = fixture;
        noTarget.erase("responseTarget");
        check(env.render(quest, noTarget).find("Quest test") == std::string::npos, "No recipient means no quest branch injection");
        auto npcTarget = fixture;
        npcTarget["responseTarget"]["UUID"] = 30;
        check(env.render(quest, npcTarget).find("Quest test") == std::string::npos, "NPC-to-NPC speech does not offer player quests");

        const auto memories = read(root + "submodules/character_bio/7100_memories.prompt");
        auto rendered = env.render(memories, fixture);
        check(rendered.find("lost book") != std::string::npos, "Memory survives missing current season");
        fixture["season"] = "summer";
        check(env.render(memories, fixture).find("[in winter]") != std::string::npos, "Different known season is retained");
        fixture["memories"][0]["memory"].erase("season");
        check(env.render(memories, fixture).find("lost book") != std::string::npos, "Legacy memory without season renders");
        fixture.erase("season");

        const auto state = read(root + "submodules/user_final_instructions/8000_recent_state_changes.prompt");
        env.render(state, fixture);
        check(true, "State prompt tolerates missing body equipment");
        fixture["equipment"]["body"] = nullptr;
        env.render(state, fixture);
        check(true, "State prompt tolerates null body equipment");
        fixture["equipment"]["body"] = {{"name", "Steel armor"}};
        env.render(state, fixture);
        check(true, "State prompt tolerates equipped armor");

        const auto merchant = read(root + "submodules/character_bio/0075_severactions_merchant.prompt");
        check(env.render(merchant, fixture).find("Merchant Inventory") == std::string::npos, "Nonmerchant does not need items field");
        fixture["inventory"]["items"] = json::array({{{"name", "Iron sword"}, {"formID", 123}, {"value", 10}, {"count", 1}}});
        check(env.render(merchant, fixture).find("Iron sword") != std::string::npos, "Merchant stock remains visible");

        const auto actions = read(root + "submodules/user_final_instructions/0750_embedded_actions.prompt");
        check(env.render(actions, fixture).find("Actions Available") == std::string::npos, "No embedded-action context renders safely");
        fixture["embed_actions_in_dialogue"] = true;
        check(env.render(actions, fixture).find("Actions Available") == std::string::npos, "No eligible-actions field renders safely");
        fixture["eligible_actions"] = json::array();
        check(env.render(actions, fixture).find("Actions Available") == std::string::npos, "No eligible actions means no invented action");
        fixture["eligible_actions"] = json::array({{{"name", "Economy"}, {"description", "Category: settle gold transfers"},
                                                  {"parameterSchema", "{intent: string}"}}});
        rendered = env.render(actions, fixture);
        check(rendered.find("exactly ONE matching ACTION") != std::string::npos && rendered.find("Economy") != std::string::npos,
              "Immediate accepted requests require an eligible action with direction");

        // Negative controls: confirm the original defects fail with the same strict renderer.
        int negatives = 0;
        fixture["equipment"] = json::object();
        fixture["inventory"] = json::object();
        const auto expectFailure = [&](const std::string& path) {
            try { env.render(read(path), fixture); }
            catch (const std::exception&) { ++negatives; }
        };
        expectFailure(base + "submodules/character_bio/7100_memories.prompt");
        expectFailure(base + "submodules/user_final_instructions/8000_recent_state_changes.prompt");
        check(negatives == 2, "Original missing-season/equipment failures reproduce");
        std::cout << "ALL TEMPLATE TESTS PASSED (offline decorator fixtures; not an in-game or LLM test)\n";
        return 0;
    } catch (const std::exception& error) {
        std::cerr << error.what() << "\n";
        return 1;
    }
}
