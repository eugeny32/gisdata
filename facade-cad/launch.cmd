@echo off
rem FACADE-CAD launcher: start the Vite dev server (minimized) and open the app.
cd /d "%~dp0"
start "FACADE-CAD server" /min cmd /c "npx vite --host 127.0.0.1 --port 5173"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5173/"
