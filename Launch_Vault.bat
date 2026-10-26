@echo off
title "WA & SPV Launcher"
echo Starting WA ^& SPV...
echo.

cd /d "%~dp0"

start /B npm run dev

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Opening browser...
start http://localhost:3000

echo.
echo WA ^& SPV is running in the background.
echo Close this window to stop the server, or run Stop_Vault.bat
echo.
pause
