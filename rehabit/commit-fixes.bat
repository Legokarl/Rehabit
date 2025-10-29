@echo off
echo ========================================
echo   Committing Deployment Fixes
echo ========================================
echo.

echo [1/3] Staging all changes...
git add .
echo.

echo [2/3] Creating commit...
git commit -m "Fix deployment errors: React hooks, TypeScript types, Next.js config, and remove debug logs"
echo.

echo [3/3] Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo   Done! All fixes committed and pushed
echo ========================================
pause

