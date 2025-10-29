@echo off
echo ====================================
echo    ReHabit - Starting Dev Server
echo ====================================
echo.
echo Starting Next.js development server...
echo.
echo Once started, visit:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ====================================
echo.

cd /d "%~dp0"
npm run dev
