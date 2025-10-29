@echo off
echo ========================================
echo   Committing ESLint Fixes
echo ========================================
echo.

echo [1/3] Staging ESLint fixes...
git add .
echo.

echo [2/3] Creating commit...
git commit -m "Fix ESLint errors: escape quotes/apostrophes and add useEffect suppressions"
echo.

echo [3/3] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Done! ESLint fixes pushed to GitHub
echo   Vercel will auto-deploy now!
echo ========================================
pause

