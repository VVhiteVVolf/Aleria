@echo off
setlocal
cd /d "%~dp0"
echo XTTS CPU server: http://127.0.0.1:7860
echo Voice samples: %~dp0voices\en
set PYTHONUTF8=1
if not exist ".venv\Scripts\activate.bat" goto missing
call ".venv\Scripts\activate.bat"
".venv\Scripts\python.exe" -u "%~dp0scripts\run_server.py"
set "xtts_exit=%ERRORLEVEL%"
if not "%xtts_exit%"=="0" (
  echo XTTS startup failed. See logs\startup-error.log and logs\server.log.
)
echo.
echo Status oben beachten. Dieses Fenster mit einer Taste schliessen.
pause
exit /b %xtts_exit%
:missing
echo Missing virtual environment. See README_SKYRIMNET_XTTS.md.
pause
exit /b 1
