@echo off
echo ========================================
echo   ReHabit - GitHub Deployment Setup
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [1/4] Initializing Git repository...
    git init
    echo.
) else (
    echo [1/4] Git repository already initialized
    echo.
)

echo [2/4] Adding all files...
git add .
echo.

echo [3/4] Creating commit...
git commit -m "ReHabit - Gamified habit tracking app with community chat"
echo.

echo [4/4] Ready to push to GitHub!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Copy your repository URL
echo.
echo 3. Run these commands (replace YOUR_USERNAME):
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/rehabit.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Then deploy on Vercel:
echo    https://vercel.com/new
echo.
echo ========================================
pause
