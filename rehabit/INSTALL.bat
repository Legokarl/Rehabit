@echo off
echo ========================================
echo ReHabit - Installation Script
echo ========================================
echo.
echo Installing dependencies...
echo.

call npm install

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up Firebase (see SETUP.md)
echo 2. Create .env.local file
echo 3. Run: npm run dev
echo.
pause
