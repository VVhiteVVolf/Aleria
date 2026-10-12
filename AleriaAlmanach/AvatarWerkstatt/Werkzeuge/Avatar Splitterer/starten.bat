@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
    py -3 -m pip install --quiet -r requirements.txt
    py -3 AvatarSplitterPro_V3.py
) else (
    python -m pip install --quiet -r requirements.txt
    python AvatarSplitterPro_V3.py
)
if errorlevel 1 pause
