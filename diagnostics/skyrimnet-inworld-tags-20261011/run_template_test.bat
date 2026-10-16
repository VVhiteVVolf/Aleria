@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Auxiliary\Build\vcvars64.bat"
if errorlevel 1 exit /b 1
cd /d "E:\Aleria\diagnostics\skyrimnet-inworld-tags-20261011"
cl /nologo /std:c++17 /EHsc /O1 /I"E:\Aleria\diagnostics\skyrimnet-actions-20261007\template-tests\include" test_audio_prompt.cpp /Fetest_audio_prompt.exe
if errorlevel 1 exit /b 1
test_audio_prompt.exe candidate.prompt
