@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if errorlevel 1 exit /b 1
cd /d "%~dp0"
cl /nologo /std:c++17 /EHsc /O1 /I"E:\Aleria\diagnostics\skyrimnet-actions-20261007\template-tests\include" test_action_prompt.cpp /Fetest_action_prompt.exe
if errorlevel 1 exit /b 1
test_action_prompt.exe "approved-stage\SKSE\Plugins\SkyrimNet\overlay\prompts\submodules\user_final_instructions\0750_embedded_actions.prompt" "E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta25 Test Runtime 20260927\SKSE\Plugins\SkyrimNet\overlay\prompts\submodules\user_final_instructions\0750_embedded_actions.prompt" "."
