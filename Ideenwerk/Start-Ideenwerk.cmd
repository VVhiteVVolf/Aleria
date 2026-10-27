@echo off
cd /d "%~dp0"
set "IDEENWERK_NODE=node"
where node >nul 2>nul
if errorlevel 1 if exist "%ProgramFiles%\nodejs\node.exe" set "IDEENWERK_NODE=%ProgramFiles%\nodejs\node.exe"
"%IDEENWERK_NODE%" scripts/serve.mjs --open
if errorlevel 1 pause
