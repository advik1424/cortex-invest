@echo off
cd /d "%~dp0"
echo ========================================================
echo   Pushing Cortex-Invest to GitHub (advik1424/cortex-invest)
echo ========================================================
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Code pushed to GitHub successfully!
) else (
    echo [NOTE] If repository does not exist yet on GitHub, please create
    echo        an empty repository named 'cortex-invest' at:
    echo        https://github.com/new
    echo        and then re-run this script!
)
echo.
pause
