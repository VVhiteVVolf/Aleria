@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if errorlevel 1 exit /b 1
cd /d "E:\Aleria\diagnostics\skyrimnet-repair-20261007"
cl /nologo /std:c++17 /EHsc /O1 /I"E:\Aleria\diagnostics\skyrimnet-actions-20261007\template-tests\include" template_tests.cpp /Fetemplate_tests.exe
if errorlevel 1 exit /b 1
template_tests.exe "E:\Aleria\diagnostics\skyrimnet-repair-20261007\overrides" "E:\Nolvus\Instances\Nolvus Awakening\MODS\mods\SkyrimNet - Beta 26 RC4\SKSE\Plugins\SkyrimNet\library\skyrimnet.base\prompts"
