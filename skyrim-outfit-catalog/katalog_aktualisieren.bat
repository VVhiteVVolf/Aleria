@echo off
setlocal
cd /d "%~dp0"
echo Outfitkatalog aus dem ausgewaehlten MO2-Profil aktualisieren.
echo Skyrim und Nolvus werden nur gelesen, nicht veraendert.
python scripts\build_catalog.py
if errorlevel 1 (
  echo.
  echo Aktualisierung fehlgeschlagen. Bitte die Fehlermeldung oben pruefen.
  pause
  exit /b 1
)
echo.
echo Katalog aktualisiert: %~dp0index.html
pause
