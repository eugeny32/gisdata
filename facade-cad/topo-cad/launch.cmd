@echo off
rem TOPO-CAD launcher: start the Vite dev server (minimized) and open the app.
rem Port 5174 so it can run side by side with FACADE-CAD (5173).
rem Paths stay RELATIVE on purpose: the repository lives under a Cyrillic
rem path and cmd would mangle it under the OEM code page.
cd /d "%~dp0"
if exist "..\node_modules\vite\bin\vite.js" (
  start "TOPO-CAD server" /min cmd /c "node ..\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5174"
) else (
  start "TOPO-CAD server" /min cmd /c "npx vite --host 127.0.0.1 --port 5174"
)
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5174/"
