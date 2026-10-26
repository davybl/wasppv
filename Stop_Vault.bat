@echo off
title "Stop WA & SPV"
echo Stopping WA ^& SPV server...
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Server stopped.
echo.
pause
