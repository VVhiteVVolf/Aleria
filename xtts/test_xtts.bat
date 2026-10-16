@echo off
setlocal
cd /d "%~dp0"
set PYTHONUTF8=1
call ".venv\Scripts\activate.bat"
python "scripts\test_api.py" %*
set "xtts_exit=%ERRORLEVEL%"
if not "%xtts_exit%"=="0" pause
exit /b %xtts_exit%
