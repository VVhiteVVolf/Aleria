#include <inja.hpp>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>

using json=nlohmann::json;
std::string read(const std::string& path) {
    std::ifstream f(path); if (!f) throw std::runtime_error("Cannot read "+path);
    std::ostringstream out; out<<f.rdbuf(); return out.str();
}
void check(bool ok,const std::string& message) {if(!ok)throw std::runtime_error(message);}
int main(int argc,char** argv) {
 try {
    if(argc!=4)throw std::runtime_error("Expected staged prompt, original prompt and render output directory");
    inja::Environment env;
    env.set_line_statement("@@UNUSED_LINE_STATEMENT@@");
    auto candidate=read(argv[1]), original=read(argv[2]);
    unsigned count=0;
    for(const auto& mode:{"full","transform","thoughts","book"})
     for(int embed=0;embed<3;++embed)
      for(int eligible=0;eligible<3;++eligible)
       for(int target=0;target<3;++target) {
        json data={{"render_mode",mode},{"player",{{"name","Aldo"}}}};
        if(embed)data["embed_actions_in_dialogue"]=(embed==2);
        if(eligible)data["eligible_actions"]=json::array();
        if(eligible==2)data["eligible_actions"].push_back({{"name","Economy"},{"description","Category: money transfers"},{"parameterSchema","{\"intent\":\"string\"}"}});
        if(target)data["responseTarget"]={{"type",target==2?"npc":"player"}};
        auto before=env.render(original,data), after=env.render(candidate,data);
        bool enabled=before.find("## Actions Available")!=std::string::npos;
        check(enabled==(embed==2 && eligible==2),"Existing eligibility guard changed");
        check((after.find("Technical action footer")!=std::string::npos)==enabled,"Contract escaped eligibility guard");
        check((after.find("## Actions Available")!=std::string::npos)==enabled,"Action rubric missing");
        if(!enabled)check(before==after,"Disabled context changed");
        else {
          check(after.find("ACTION:.")!=std::string::npos,"Column-one footer rule missing");
          check(after.find("voice/audio tags")!=std::string::npos,"Audio/footer separation missing");
          check(after.find("{\"intent\":\"string\"}")!=std::string::npos,"Parameter schema missing");
          check((after.find("someone other than Aldo")!=std::string::npos)==(target==2),"Recipient guard changed");
        }
        if(std::string(mode)=="full"&&embed==2&&eligible==2&&target==1) {
          std::ofstream(std::filesystem::path(argv[3])/"rendered-approved-action-rubric.txt")<<after;
        }
        ++count;
       }
    std::cout<<count<<" action-prompt render cases passed; no engine execution implied\n";
    return 0;
 }catch(const std::exception& e){std::cerr<<e.what()<<"\n";return 1;}
}
